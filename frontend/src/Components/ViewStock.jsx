import {
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  HistogramSeries,
  BarSeries,
  createChart,
  PriceScaleMode,
  CrosshairMode,
} from "lightweight-charts";
import { useEffect, useRef, useCallback, useState } from "react";
import { useDarkModeStore } from "../store/store";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { buyStock, getStockById, sellStock } from "../Services";
import { userAuthenticatedStore } from "../store";
import { toast } from "react-toastify";
import { formatCurrency } from "../utils/formatCurrency";
import {
  shortCover,
  shortSell,
  squareOffPositions,
} from "../Services/portfolio-service";

// ---------------------------------------------------------------------------
// TradingView-inspired dark/light palette
// ---------------------------------------------------------------------------
const THEME = {
  dark: {
    bg: "#131722",
    panel: "#1e222d",
    panelAlt: "#171b26",
    border: "#2a2e39",
    text: "#d1d4dc",
    textMuted: "#787b86",
    accent: "#2962ff",
    up: "#26a69a",
    down: "#ef5350",
    grid: "#1e222d",
    sma: "#f0b90b",
    ema: "#c084fc",
  },
  light: {
    bg: "#f5f6f7",
    panel: "#ffffff",
    panelAlt: "#f9fafb",
    border: "#e0e3eb",
    text: "#131722",
    textMuted: "#6a6d78",
    accent: "#2962ff",
    up: "#089981",
    down: "#f23645",
    grid: "#eef0f3",
    sma: "#b8860b",
    ema: "#9333ea",
  },
};

// Preset palette for the drawing toolbar (TradingView-style swatches)
const DRAW_COLORS = [
  "#2962ff",
  "#26a69a",
  "#ef5350",
  "#f0b90b",
  "#c084fc",
  "#ffffff",
];

const ViewStock = () => {
  const chartContainerRef = useRef(null);
  const chartWrapperRef = useRef(null);
  const chartRef = useRef(null);

  // Main plotted series (candlestick / bars / line / area — whichever is active)
  const mainSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const smaSeriesRef = useRef(null);
  const emaSeriesRef = useRef(null);

  // Drawing overlay (freehand brush, trend lines, horizontal rays, rectangles)
  const drawCanvasRef = useRef(null);
  const drawingsRef = useRef([]); // finalized drawings: [{id,type,color,...}]
  const currentDrawingRef = useRef(null); // in-progress drawing while mouse is down
  const isDrawingActionRef = useRef(false);
  const activeToolRef = useRef("cursor");
  const visibleRangeUnsubRef = useRef(null);

  // Mirrors chartData/isDark/chartType in a ref so socket + toolbar callbacks
  // never operate on stale closures without forcing effect re-runs that would
  // recreate the chart (which is what was destroying zoom/crosshair state).
  const chartDataRef = useRef([]);
  const isDarkRef = useRef(false);
  const chartTypeRef = useRef("candlestick");
  const chartInitializedRef = useRef(false);

  const isDark = useDarkModeStore((state) => state.globalDarkState);
  const socketRef = useRef(null);

  const { id } = useParams();
  const isLoggedIn = userAuthenticatedStore((state) => state.isAuthenticated);

  // Initialize with null/zero values - will be populated by API and socket data
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(0);
  const [priceChangePercent, setPriceChangePercent] = useState(0);
  const [volume, setVolume] = useState(0);
  const [high, setHigh] = useState(null);
  const [low, setLow] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [stockName, setStockName] = useState("STOCK");
  const [isLoading, setIsLoading] = useState(true);
  const [apiDataLoaded, setApiDataLoaded] = useState(false);
  const [process, setProcess] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  // ---- new: analysis / toolbar state -------------------------------------
  const [chartType, setChartType] = useState("candlestick"); // candlestick | bars | line | area
  const [showSMA, setShowSMA] = useState(false);
  const [showEMA, setShowEMA] = useState(false);
  const [isLogScale, setIsLogScale] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [legend, setLegend] = useState(null); // crosshair OHLC readout

  // ---- new: drawing toolbar state ----------------------------------------
  const [activeTool, setActiveTool] = useState("cursor"); // cursor | trendline | horizontal | rectangle | brush
  const [drawColor, setDrawColor] = useState(DRAW_COLORS[0]);

  const userId = userAuthenticatedStore((state) => state.userId);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // 'buy' or 'sell'
  const [quantity, setQuantity] = useState("");

  const palette = isDark ? THEME.dark : THEME.light;

  useEffect(() => {
    chartDataRef.current = chartData;
  }, [chartData]);

  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  useEffect(() => {
    chartTypeRef.current = chartType;
  }, [chartType]);

  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  // ---------------------------------------------------------------------
  // Chart / series option builders
  // ---------------------------------------------------------------------
  const getChartOptions = useCallback((isDarkMode) => {
    const p = isDarkMode ? THEME.dark : THEME.light;
    return {
      layout: {
        textColor: p.text,
        background: { type: "solid", color: p.panel },
        fontSize: 12,
        fontFamily:
          "'Trebuchet MS', Roboto, ui-sans-serif, system-ui, sans-serif",
      },
      grid: {
        vertLines: { color: p.grid, style: 1, visible: true },
        horzLines: { color: p.grid, style: 1, visible: true },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: p.textMuted,
          width: 1,
          style: 3,
          labelBackgroundColor: p.accent,
        },
        horzLine: {
          color: p.textMuted,
          width: 1,
          style: 3,
          labelBackgroundColor: p.accent,
        },
      },
      timeScale: {
        borderColor: p.border,
        timeVisible: true,
        secondsVisible: true,
        rightOffset: 4,
        barSpacing: 8,
        minBarSpacing: 3,
        fixLeftEdge: false,
        fixRightEdge: false,
        lockVisibleTimeRangeOnResize: true,
        shiftVisibleRangeOnNewBar: true,
        uniformDistribution: true,
      },
      rightPriceScale: {
        borderColor: p.border,
        textColor: p.text,
        scaleMargins: { top: 0.08, bottom: 0.22 },
        mode: PriceScaleMode.Normal,
      },
      autoSize: false,
      width: chartContainerRef.current?.clientWidth || 800,
      height: chartContainerRef.current?.clientHeight || 400,
      handleScroll: true,
      handleScale: true,
    };
  }, []);

  const getCandlestickOptions = useCallback((isDarkMode) => {
    const p = isDarkMode ? THEME.dark : THEME.light;
    return {
      upColor: p.up,
      downColor: p.down,
      borderVisible: false,
      wickUpColor: p.up,
      wickDownColor: p.down,
      borderUpColor: p.up,
      borderDownColor: p.down,
      priceFormat: { type: "price", precision: 2, minMove: 0.01 },
    };
  }, []);

  const getBarOptions = useCallback((isDarkMode) => {
    const p = isDarkMode ? THEME.dark : THEME.light;
    return {
      upColor: p.up,
      downColor: p.down,
      thinBars: false,
      openVisible: true,
      priceFormat: { type: "price", precision: 2, minMove: 0.01 },
    };
  }, []);

  const getLineOptions = useCallback((isDarkMode) => {
    const p = isDarkMode ? THEME.dark : THEME.light;
    return {
      color: p.accent,
      lineWidth: 2,
      priceFormat: { type: "price", precision: 2, minMove: 0.01 },
    };
  }, []);

  const getAreaOptions = useCallback((isDarkMode) => {
    const p = isDarkMode ? THEME.dark : THEME.light;
    return {
      lineColor: p.accent,
      topColor: isDarkMode
        ? "rgba(41, 98, 255, 0.35)"
        : "rgba(41, 98, 255, 0.25)",
      bottomColor: isDarkMode
        ? "rgba(41, 98, 255, 0.02)"
        : "rgba(41, 98, 255, 0.02)",
      lineWidth: 2,
      priceFormat: { type: "price", precision: 2, minMove: 0.01 },
    };
  }, []);

  // Convert API data to chart format with strict timestamp ordering
  const convertApiDataToChart = useCallback((apiData) => {
    if (!apiData || !Array.isArray(apiData)) return [];

    const converted = apiData
      .map((item) => ({
        time: Math.floor(new Date(item.timestamp).getTime() / 1000),
        open: Number(item.open),
        high: Number(item.high),
        low: Number(item.low),
        close: Number(item.close),
        volume: item.ticks ? item.ticks.length : 0,
        originalTimestamp: item.timestamp,
      }))
      .filter(
        (item) =>
          !isNaN(item.time) &&
          !isNaN(item.open) &&
          !isNaN(item.high) &&
          !isNaN(item.low) &&
          !isNaN(item.close),
      )
      .sort((a, b) => a.time - b.time);

    // Ensure strictly ascending timestamps (fix duplicates)
    let lastTime = 0;
    const fixed = converted.map((item) => {
      if (item.time <= lastTime) {
        item.time = lastTime + 1;
      }
      lastTime = item.time;
      return item;
    });

    return fixed;
  }, []);

  // Update statistics from data
  const updateStatistics = useCallback((data) => {
    if (!data || data.length === 0) return;

    const latest = data[data.length - 1];
    const previous = data.length > 1 ? data[data.length - 2] : null;

    setCurrentPrice(latest.close);
    setHigh(Math.max(...data.map((d) => d.high)));
    setLow(Math.min(...data.map((d) => d.low)));

    if (previous) {
      const change = latest.close - previous.close;
      const changePercent = (change / previous.close) * 100;
      setPriceChange(change);
      setPriceChangePercent(changePercent);
    }

    // Calculate total volume
    const totalVolume = data.reduce((sum, item) => sum + (item.volume || 0), 0);
    setVolume(totalVolume);
  }, []);

  // ---------------------------------------------------------------------
  // Derived series helpers (SMA + EMA + volume + line/area point mapping)
  // ---------------------------------------------------------------------
  const computeSMA = useCallback((data, period = 20) => {
    if (!data || data.length < period) return [];
    const result = [];
    let windowSum = 0;
    for (let i = 0; i < data.length; i++) {
      windowSum += data[i].close;
      if (i >= period) windowSum -= data[i - period].close;
      if (i >= period - 1) {
        result.push({ time: data[i].time, value: windowSum / period });
      }
    }
    return result;
  }, []);

  const computeEMA = useCallback((data, period = 9) => {
    if (!data || data.length === 0) return [];
    const k = 2 / (period + 1);
    const result = [];
    let emaPrev;
    data.forEach((d, i) => {
      emaPrev = i === 0 ? d.close : d.close * k + emaPrev * (1 - k);
      result.push({ time: d.time, value: emaPrev });
    });
    return result;
  }, []);

  const toVolumeData = useCallback((data, p) => {
    return data.map((d) => ({
      time: d.time,
      value: d.volume || 0,
      color: d.close >= d.open ? `${p.up}66` : `${p.down}66`,
    }));
  }, []);

  const toLinePoints = useCallback((data) => {
    return data.map((d) => ({ time: d.time, value: d.close }));
  }, []);

  const applyDataToMainSeries = useCallback(
    (series, type, data) => {
      if (!series) return;
      if (type === "candlestick" || type === "bars") {
        series.setData(data);
      } else {
        series.setData(toLinePoints(data));
      }
    },
    [toLinePoints],
  );

  const createMainSeries = useCallback(
    (chart, type, isDarkMode) => {
      if (type === "line")
        return chart.addSeries(LineSeries, getLineOptions(isDarkMode));
      if (type === "area")
        return chart.addSeries(AreaSeries, getAreaOptions(isDarkMode));
      if (type === "bars")
        return chart.addSeries(BarSeries, getBarOptions(isDarkMode));
      return chart.addSeries(
        CandlestickSeries,
        getCandlestickOptions(isDarkMode),
      );
    },
    [getLineOptions, getAreaOptions, getBarOptions, getCandlestickOptions],
  );

  // ---------------------------------------------------------------------
  // Drawing overlay helpers — a transparent <canvas> sits on top of the
  // chart. Every point is stored as {time, price} (logical/chart space,
  // NOT pixels) so drawings stay pinned to the correct bar/price as the
  // user pans, zooms, resizes, or the chart theme changes.
  // ---------------------------------------------------------------------
  const genDrawingId = () =>
    `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const getCanvasPoint = useCallback((clientX, clientY) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  const pixelToLogical = useCallback((x, y) => {
    if (!chartRef.current || !mainSeriesRef.current) return null;
    const time = chartRef.current.timeScale().coordinateToTime(x);
    const price = mainSeriesRef.current.coordinateToPrice(y);
    if (
      time === null ||
      time === undefined ||
      price === null ||
      price === undefined
    )
      return null;
    return { time, price };
  }, []);

  const logicalToPixel = useCallback((time, price) => {
    if (!chartRef.current || !mainSeriesRef.current) return null;
    const x = chartRef.current.timeScale().timeToCoordinate(time);
    const y = mainSeriesRef.current.priceToCoordinate(price);
    if (x === null || x === undefined || y === null || y === undefined)
      return null;
    return { x, y };
  }, []);

  const redrawOverlay = useCallback(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);

    const allDrawings = currentDrawingRef.current
      ? [...drawingsRef.current, currentDrawingRef.current]
      : drawingsRef.current;

    allDrawings.forEach((d) => {
      ctx.strokeStyle = d.color;
      ctx.fillStyle = `${d.color}22`;
      ctx.lineWidth = 1.6;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      if (d.type === "trendline") {
        const a = logicalToPixel(d.p1.time, d.p1.price);
        const b = logicalToPixel(d.p2.time, d.p2.price);
        if (!a || !b) return;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      } else if (d.type === "horizontal") {
        const y = mainSeriesRef.current?.priceToCoordinate(d.price);
        if (y === null || y === undefined) return;
        ctx.beginPath();
        ctx.setLineDash([4, 3]);
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = "11px 'Trebuchet MS', sans-serif";
        const label = d.price.toFixed(2);
        const labelWidth = ctx.measureText(label).width + 8;
        ctx.fillStyle = d.color;
        ctx.fillRect(w - labelWidth - 2, y - 9, labelWidth, 18);
        ctx.fillStyle = "#fff";
        ctx.fillText(label, w - labelWidth + 2, y + 4);
      } else if (d.type === "rectangle") {
        const a = logicalToPixel(d.p1.time, d.p1.price);
        const b = logicalToPixel(d.p2.time, d.p2.price);
        if (!a || !b) return;
        const x = Math.min(a.x, b.x);
        const y = Math.min(a.y, b.y);
        const rw = Math.abs(b.x - a.x);
        const rh = Math.abs(b.y - a.y);
        ctx.fillRect(x, y, rw, rh);
        ctx.strokeRect(x, y, rw, rh);
      } else if (d.type === "brush") {
        if (!d.points || d.points.length < 2) return;
        ctx.beginPath();
        d.points.forEach((pt, i) => {
          const px = logicalToPixel(pt.time, pt.price);
          if (!px) return;
          if (i === 0) ctx.moveTo(px.x, px.y);
          else ctx.lineTo(px.x, px.y);
        });
        ctx.stroke();
      }
    });
  }, [logicalToPixel]);

  // ---------------------------------------------------------------------
  // One-time chart initialization (runs ONCE per mount, not per data tick)
  // This is the core fix: the chart instance, its zoom/scroll position and
  // the crosshair are never torn down again after this — real-time data is
  // pushed in with series.update()/series.setData() on the SAME instance.
  // ---------------------------------------------------------------------
  const initializeChart = useCallback(() => {
    if (!chartContainerRef.current || chartDataRef.current.length === 0) return;
    if (chartRef.current) return; // already initialized — never recreate

    try {
      const chartOptions = getChartOptions(isDarkRef.current);
      const chart = createChart(chartContainerRef.current, chartOptions);
      chartRef.current = chart;

      const p = isDarkRef.current ? THEME.dark : THEME.light;
      const data = chartDataRef.current;

      // Main price series
      const mainSeries = createMainSeries(
        chart,
        chartTypeRef.current,
        isDarkRef.current,
      );
      applyDataToMainSeries(mainSeries, chartTypeRef.current, data);
      mainSeriesRef.current = mainSeries;

      // Volume histogram in its own bottom pane
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: "volume" },
        priceScaleId: "volume",
        lastValueVisible: false,
        priceLineVisible: false,
      });
      volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.82, bottom: 0 },
      });
      volumeSeries.setData(toVolumeData(data, p));
      volumeSeriesRef.current = volumeSeries;

      chart.timeScale().fitContent();

      // Keep drawings pinned to their bar/price as the user pans or zooms
      const unsub = () => redrawOverlay();
      chart.timeScale().subscribeVisibleLogicalRangeChange(unsub);
      visibleRangeUnsubRef.current = unsub;

      // Crosshair legend (OHLC readout, TradingView-style)
      chart.subscribeCrosshairMove((param) => {
        if (!param || !param.time || !mainSeriesRef.current) {
          const latest = chartDataRef.current[chartDataRef.current.length - 1];
          setLegend(latest ? { ...latest, isLive: true } : null);
          return;
        }
        const seriesData = param.seriesData?.get(mainSeriesRef.current);
        if (!seriesData) return;
        if (
          chartTypeRef.current === "candlestick" ||
          chartTypeRef.current === "bars"
        ) {
          setLegend({ ...seriesData, isLive: false });
        } else {
          setLegend({ close: seriesData.value, isLive: false });
        }
      });

      chartInitializedRef.current = true;
      redrawOverlay();
    } catch (error) {
      console.error("Error initializing chart:", error);
    }
  }, [
    getChartOptions,
    createMainSeries,
    applyDataToMainSeries,
    toVolumeData,
    redrawOverlay,
  ]);

  // Update chart theme without recreating the chart instance
  const updateChartTheme = useCallback(() => {
    if (!chartRef.current) return;
    try {
      chartRef.current.applyOptions(getChartOptions(isDark));

      if (mainSeriesRef.current) {
        if (chartType === "candlestick") {
          mainSeriesRef.current.applyOptions(getCandlestickOptions(isDark));
        } else if (chartType === "bars") {
          mainSeriesRef.current.applyOptions(getBarOptions(isDark));
        } else if (chartType === "line") {
          mainSeriesRef.current.applyOptions(getLineOptions(isDark));
        } else {
          mainSeriesRef.current.applyOptions(getAreaOptions(isDark));
        }
      }
      if (volumeSeriesRef.current) {
        const p = isDark ? THEME.dark : THEME.light;
        volumeSeriesRef.current.setData(toVolumeData(chartDataRef.current, p));
      }
      redrawOverlay();
    } catch (error) {
      console.error("Error updating chart theme:", error);
    }
  }, [
    isDark,
    chartType,
    getChartOptions,
    getCandlestickOptions,
    getBarOptions,
    getLineOptions,
    getAreaOptions,
    toVolumeData,
    redrawOverlay,
  ]);

  // Handle resize (also keeps the drawing canvas + overlay in sync)
  const handleResize = useCallback(() => {
    if (!chartRef.current || !chartContainerRef.current) return;
    try {
      const w = chartContainerRef.current.clientWidth;
      const h = chartContainerRef.current.clientHeight;
      chartRef.current.applyOptions({ width: w, height: h });

      const canvas = drawCanvasRef.current;
      if (canvas) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
      }
      redrawOverlay();
    } catch (error) {
      console.error("Error handling resize:", error);
    }
  }, [redrawOverlay]);

  // ---------------------------------------------------------------------
  // Toolbar actions: chart type switch / SMA / EMA toggle / log scale /
  // fullscreen. All of these preserve the current visible logical range so
  // the user's zoom/pan position never jumps.
  // ---------------------------------------------------------------------
  const switchChartType = useCallback(
    (type) => {
      if (!chartRef.current || type === chartTypeRef.current) return;
      const visibleRange = chartRef.current
        .timeScale()
        .getVisibleLogicalRange();

      if (mainSeriesRef.current) {
        chartRef.current.removeSeries(mainSeriesRef.current);
      }
      const newSeries = createMainSeries(
        chartRef.current,
        type,
        isDarkRef.current,
      );
      applyDataToMainSeries(newSeries, type, chartDataRef.current);
      mainSeriesRef.current = newSeries;

      if (visibleRange) {
        chartRef.current.timeScale().setVisibleLogicalRange(visibleRange);
      }
      chartTypeRef.current = type;
      setChartType(type);
      redrawOverlay();
    },
    [createMainSeries, applyDataToMainSeries, redrawOverlay],
  );

  const toggleSMA = useCallback(() => {
    if (!chartRef.current) return;
    if (showSMA) {
      if (smaSeriesRef.current) {
        chartRef.current.removeSeries(smaSeriesRef.current);
        smaSeriesRef.current = null;
      }
      setShowSMA(false);
    } else {
      const p = isDarkRef.current ? THEME.dark : THEME.light;
      const smaSeries = chartRef.current.addSeries(LineSeries, {
        color: p.sma,
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      smaSeries.setData(computeSMA(chartDataRef.current));
      smaSeriesRef.current = smaSeries;
      setShowSMA(true);
    }
  }, [showSMA, computeSMA]);

  const toggleEMA = useCallback(() => {
    if (!chartRef.current) return;
    if (showEMA) {
      if (emaSeriesRef.current) {
        chartRef.current.removeSeries(emaSeriesRef.current);
        emaSeriesRef.current = null;
      }
      setShowEMA(false);
    } else {
      const p = isDarkRef.current ? THEME.dark : THEME.light;
      const emaSeries = chartRef.current.addSeries(LineSeries, {
        color: p.ema,
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      emaSeries.setData(computeEMA(chartDataRef.current));
      emaSeriesRef.current = emaSeries;
      setShowEMA(true);
    }
  }, [showEMA, computeEMA]);

  const toggleLogScale = useCallback(() => {
    if (!chartRef.current) return;
    const next = !isLogScale;
    chartRef.current.priceScale("right").applyOptions({
      mode: next ? PriceScaleMode.Logarithmic : PriceScaleMode.Normal,
    });
    setIsLogScale(next);
  }, [isLogScale]);

  const toggleFullscreen = useCallback(() => {
    const el = chartWrapperRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  // ---------------------------------------------------------------------
  // Drawing tool actions
  // ---------------------------------------------------------------------
  const selectTool = useCallback(
    (tool) => {
      setActiveTool(tool);
      activeToolRef.current = tool;
      currentDrawingRef.current = null;
      isDrawingActionRef.current = false;
      if (chartRef.current) {
        // Disable chart panning/zooming while an active drawing tool is
        // selected so mouse drags draw instead of scrolling the chart.
        chartRef.current.applyOptions({
          handleScroll: tool === "cursor",
          handleScale: tool === "cursor",
        });
      }
      redrawOverlay();
    },
    [redrawOverlay],
  );

  const clearDrawings = useCallback(() => {
    drawingsRef.current = [];
    currentDrawingRef.current = null;
    redrawOverlay();
  }, [redrawOverlay]);

  const undoDrawing = useCallback(() => {
    drawingsRef.current = drawingsRef.current.slice(0, -1);
    redrawOverlay();
  }, [redrawOverlay]);

  const handleCanvasMouseDown = useCallback(
    (e) => {
      if (activeToolRef.current === "cursor" || !chartRef.current) return;
      const pt = getCanvasPoint(e.clientX, e.clientY);
      if (!pt) return;
      const logical = pixelToLogical(pt.x, pt.y);
      if (!logical) return;

      if (activeToolRef.current === "horizontal") {
        // Horizontal ray completes on a single click — no drag needed.
        drawingsRef.current.push({
          id: genDrawingId(),
          type: "horizontal",
          color: drawColor,
          price: logical.price,
        });
        redrawOverlay();
        selectTool("cursor");
        return;
      }

      isDrawingActionRef.current = true;

      if (activeToolRef.current === "brush") {
        currentDrawingRef.current = {
          id: genDrawingId(),
          type: "brush",
          color: drawColor,
          points: [logical],
        };
      } else {
        // trendline / rectangle
        currentDrawingRef.current = {
          id: genDrawingId(),
          type: activeToolRef.current,
          color: drawColor,
          p1: logical,
          p2: logical,
        };
      }
      redrawOverlay();
    },
    [drawColor, getCanvasPoint, pixelToLogical, redrawOverlay, selectTool],
  );

  const handleCanvasMouseMove = useCallback(
    (e) => {
      if (!isDrawingActionRef.current || !currentDrawingRef.current) return;
      const pt = getCanvasPoint(e.clientX, e.clientY);
      if (!pt) return;
      const logical = pixelToLogical(pt.x, pt.y);
      if (!logical) return;

      if (currentDrawingRef.current.type === "brush") {
        currentDrawingRef.current.points.push(logical);
      } else {
        currentDrawingRef.current.p2 = logical;
      }
      redrawOverlay();
    },
    [getCanvasPoint, pixelToLogical, redrawOverlay],
  );

  const handleCanvasMouseUp = useCallback(() => {
    if (!isDrawingActionRef.current || !currentDrawingRef.current) return;
    drawingsRef.current.push(currentDrawingRef.current);
    currentDrawingRef.current = null;
    isDrawingActionRef.current = false;
    redrawOverlay();
    selectTool("cursor");
  }, [redrawOverlay, selectTool]);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // give the DOM a tick to resize before we re-measure the chart
      setTimeout(handleResize, 50);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, [handleResize]);

  // Escape cancels the active drawing tool / in-progress drawing
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && activeToolRef.current !== "cursor") {
        selectTool("cursor");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectTool]);

  // Fetch API data on component mount
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setIsLoading(true);
        const response = await getStockById(id);

        if (response.data && response.data.success && response.data.data) {
          const apiData = response.data.data;
          console.log("🚀 ~ fetchStockData ~ apiData:", apiData);
          const chartFormattedData = convertApiDataToChart(apiData);

          if (chartFormattedData.length > 0) {
            setChartData(chartFormattedData);
            setStockName(response.data.shareName || "STOCK");
            updateStatistics(chartFormattedData);
            setApiDataLoaded(true);
          } else {
            console.error("No valid chart data after conversion");
          }
        }
      } catch (error) {
        console.error("Error fetching stock data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchStockData();
    }
  }, [id, convertApiDataToChart, updateStatistics]);

  // Socket connection and real-time data handling
  useEffect(() => {
    // Only setup socket after API data is loaded
    if (!apiDataLoaded) return;

    socketRef.current = io(import.meta.env.VITE_BACKEND_URL, {
      transports: ["websocket"],
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("subscribeShareHistory", id);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("shareHistoryData", (data) => {
      console.log("Real-time data received:", data.shareId, data.history);

      if (data.history && data.history.length > 0) {
        // Convert new socket data to chart format
        const newChartData = convertApiDataToChart(data.history);

        if (newChartData.length > 0) {
          // Merge with existing data (avoid duplicates based on timestamp)
          setChartData((prevData) => {
            const mergedData = [...prevData];

            newChartData.forEach((newItem) => {
              const existingIndex = mergedData.findIndex(
                (item) => Math.abs(item.time - newItem.time) < 2, // Allow 1-2 second tolerance
              );
              if (existingIndex !== -1) {
                // Update existing item
                mergedData[existingIndex] = newItem;
              } else {
                // Add new item
                mergedData.push(newItem);
              }
            });

            // Sort by time and ensure unique timestamps
            const sorted = mergedData.sort((a, b) => a.time - b.time);
            let lastTime = 0;
            const uniqueData = sorted.map((item) => {
              if (item.time <= lastTime) {
                item.time = lastTime + 1;
              }
              lastTime = item.time;
              return item;
            });

            return uniqueData;
          });

          // ---- THE FIX -----------------------------------------------
          // Push only the changed/new bars into the *existing* series with
          // .update() instead of rebuilding the whole chart with setData().
          // update() does not reset the visible logical range or the
          // crosshair, so the user's zoom/pan/crosshair position survives
          // every real-time tick.
          const p = isDarkRef.current ? THEME.dark : THEME.light;
          newChartData.forEach((bar) => {
            if (mainSeriesRef.current) {
              if (
                chartTypeRef.current === "candlestick" ||
                chartTypeRef.current === "bars"
              ) {
                mainSeriesRef.current.update(bar);
              } else {
                mainSeriesRef.current.update({
                  time: bar.time,
                  value: bar.close,
                });
              }
            }
            if (volumeSeriesRef.current) {
              volumeSeriesRef.current.update({
                time: bar.time,
                value: bar.volume || 0,
                color: bar.close >= bar.open ? `${p.up}66` : `${p.down}66`,
              });
            }
          });

          // Keep the SMA line in sync too, if it's turned on
          if (smaSeriesRef.current) {
            const recomputed = computeSMA(
              [...chartDataRef.current, ...newChartData].filter(
                (v, i, arr) => arr.findIndex((x) => x.time === v.time) === i,
              ),
            );
            const lastPoint = recomputed[recomputed.length - 1];
            if (lastPoint) smaSeriesRef.current.update(lastPoint);
          }

          // Keep the EMA line in sync too, if it's turned on
          if (emaSeriesRef.current) {
            const recomputedEma = computeEMA(
              [...chartDataRef.current, ...newChartData].filter(
                (v, i, arr) => arr.findIndex((x) => x.time === v.time) === i,
              ),
            );
            const lastEmaPoint = recomputedEma[recomputedEma.length - 1];
            if (lastEmaPoint) emaSeriesRef.current.update(lastEmaPoint);
          }

          // Update statistics with the latest data
          updateStatistics(newChartData);
        }
      }
    });

    return () => {
      if (socket) {
        socket.emit("unsubscribeShareHistory");
        socket.disconnect();
      }
    };
  }, [
    apiDataLoaded,
    id,
    convertApiDataToChart,
    updateStatistics,
    computeSMA,
    computeEMA,
  ]);

  // Initialize chart ONCE, the moment we have our first batch of data.
  // (Previously this effect depended on `chartData` and re-ran — i.e.
  // destroyed + recreated the chart — on every single real-time tick,
  // which is what wiped the user's zoom/crosshair state.)
  useEffect(() => {
    if (chartData.length === 0 || chartInitializedRef.current) return;

    initializeChart();

    const resizeObserver = new ResizeObserver(handleResize);
    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartData.length > 0]);

  // Clean up the chart only when the component actually unmounts
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        mainSeriesRef.current = null;
        volumeSeriesRef.current = null;
        smaSeriesRef.current = null;
        emaSeriesRef.current = null;
        chartInitializedRef.current = false;
      }
      drawingsRef.current = [];
      currentDrawingRef.current = null;
    };
  }, []);

  // Update theme when isDark changes (in place, no chart recreation)
  useEffect(() => {
    if (chartRef.current) {
      updateChartTheme();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDark]);

  // Modal handlers
  const openModal = (type) => {
    setModalType(type);
    setQuantity("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType("");
    setQuantity("");
  };

  const enableButton = () => {
    setTimeout(() => {
      setIsDisabled(false);
    }, 3000);
  };

  const handleModalSubmit = async () => {
    // basic quantity guard
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    let didSucceed = false;

    if (modalType === "buy") {
      setProcess(true);
      setIsDisabled(true);
      try {
        if (!isLoggedIn) {
          toast("Please Login to Continue!");
          return;
        }

        console.log(
          `Buy order placed: ${Number(quantity)} shares at ₹${Number(
            currentPrice,
          ).toFixed(2)}`,
        );

        const res = await buyStock(
          userId,
          id,
          stockName,
          Number(quantity),
          Number(currentPrice),
        );

        // 2xx success
        toast(res?.data?.message || "Order Placed Successfully!");
        console.log("✅ buy response:", res);
        didSucceed = true;
      } catch (err) {
        const status = err?.response?.status;
        const data = err?.response?.data;
        const message =
          data?.message || data?.msg || err?.message || "Something went wrong";

        if (status === 400 && message === "Insufficient balance") {
          toast("Insufficient balance");
        } else if (status === 404) {
          toast("Share not found");
        } else if (status === 402) {
          // your controllers sometimes use 402 with { msg: "all fields are required" }
          toast(message || "Validation error");
        } else {
          toast(`Order failed: ${message}`);
        }

        console.error("❌ handleModalSubmit BUY error:", err);
      } finally {
        setProcess(false);
        enableButton();
      }
    } else if (modalType === "sell") {
      setProcess(true);
      setIsDisabled(true);
      try {
        if (!isLoggedIn) {
          toast("Please Login to Continue!");
          return;
        }

        console.log(
          `Sell order placed: ${Number(quantity)} shares at ₹${Number(
            currentPrice,
          ).toFixed(2)}`,
        );

        const res = await sellStock(
          userId,
          stockName,
          Number(quantity),
          Number(currentPrice),
        );

        // 2xx success
        toast(res?.data?.message || "Share Sold Successfully!");
        console.log("✅ sell response:", res);
        didSucceed = true;
      } catch (err) {
        const status = err?.response?.status;
        const data = err?.response?.data;
        const message =
          data?.message || data?.msg || err?.message || "Something went wrong";

        if (status === 400 && message === "Not enough shares to sell") {
          toast("Not enough shares to sell");
        } else if (status === 404) {
          toast("Share not found");
        } else if (status === 402) {
          toast(message || "Validation error");
        } else {
          toast(`Sell failed: ${message}`);
        }

        console.error("❌ handleModalSubmit SELL error:", err);
      } finally {
        setProcess(false);
        enableButton();
      }
    } else if (modalType === "short-sell") {
      try {
        const res = await shortSell(
          id,
          userId,
          stockName,
          quantity,
          currentPrice,
        );
        console.log("🚀 ~ handleShortSell ~ res:", res);
        if (res.status === 200) toast.success(`Transaction Successful!`);
      } catch (error) {
        console.log("🚀 ~ handleShortSell ~ error:", error);
      } finally {
        setShowModal(false);
      }
    }

    if (didSucceed) {
      closeModal();
    }
  };

  // Trading button handlers
  const handleBuy = () => {
    openModal("buy");
  };

  const handleSell = () => {
    openModal("sell");
  };

  const handleShortCover = async () => {
    try {
      const res = await shortCover(userId, stockName, currentPrice);
      console.log("🚀 ~ handleShortCover ~ res:", res);

      // ✅ Success (200)
      if (res.status === 200) {
        const { msg, realizedPL, marginReleased, balance } = res.data;
        toast.success(
          `${msg}\nP/L: ₹${realizedPL.toFixed(
            2,
          )} | Margin Released: ₹${marginReleased.toFixed(
            2,
          )} | New Balance: ₹${balance.toFixed(2)}`,
        );
        return;
      }

      // ⚠️ Bad Request (400)
      if (res.status === 400) {
        toast.warning(res.data?.msg || "Invalid Request");
        return;
      }

      // 🚫 Not Found (404)
      if (res.status === 404) {
        toast.error(res.data?.msg || "Share or User not found");
        return;
      }

      // ❌ Other unexpected status
      toast.error("Unexpected response from server");
    } catch (error) {
      console.log("🚀 ~ handleShortCover ~ error:", error);

      // 🔥 Server error or network issue
      if (error.response) {
        const status = error.response.status;
        const msg = error.response.data?.msg || "Something went wrong";

        if (status === 400) toast.warning(msg);
        else if (status === 404) toast.error(msg);
        else if (status === 500) toast.error("Internal Server Error");
        else toast.error("Unexpected error occurred");
      } else {
        toast.error("Network Error — Please try again");
      }
    }
  };

  const handleSquareOff = async () => {
    try {
      let userConfirm = confirm(
        `Are you sure to Square off all your positions?`,
      );
      if (userConfirm) {
        const res = await squareOffPositions(userId, stockName, currentPrice);
        await handleShortCover();
        // ✅ Success case
        if (res.status === 200) {
          const { message, totalSellPrice, balance } = res.data;
          toast(`Position closed! Balance: ${formatCurrency(balance)}`);
          return;
        }
      } else {
        return;
      }
    } catch (error) {
      console.log("🚀 ~ handleSquareOff ~ error:", error);

      // 🧠 Handle known backend errors
      if (error.response) {
        const { status, data } = error.response;
        switch (status) {
          case 400:
            toast.error(data.msg || "Invalid Request ⚠️");
            break;
          case 404:
            toast.error(data.msg || "Not Found ❌");
            break;
          case 500:
            toast.error("Internal Server Error 🛠️");
            break;
          default:
            toast.error("Something went wrong 🚨");
        }
      } else {
        // 🌐 Network or unexpected error
        toast.error("Network Error or Server Unreachable 🌍");
      }
    }
  };

  const handleShortSell = () => {
    openModal("short-sell");
  };

  // Enhanced Chart Skeleton Loader Component
  const ChartSkeletonLoader = () => (
    <div
      className={`w-full h-full rounded-lg shadow-lg transition-all duration-300 relative overflow-hidden ${
        isDark
          ? "bg-gray-800 shadow-gray-900/20"
          : "bg-white shadow-gray-200/40"
      }`}
      style={{ minHeight: "300px" }}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 opacity-50">
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-gradient-to-r from-transparent via-gray-700/20 to-transparent"
              : "bg-gradient-to-r from-transparent via-gray-200/40 to-transparent"
          } transform -skew-x-12 animate-pulse`}
          style={{
            animation: "shimmer 2s infinite",
            background: isDark
              ? "linear-gradient(90deg, transparent, rgba(55, 65, 81, 0.3), transparent)"
              : "linear-gradient(90deg, transparent, rgba(229, 231, 235, 0.6), transparent)",
          }}
        ></div>
      </div>

      {/* Chart grid skeleton */}
      <div className="p-4 h-full relative">
        {/* Top toolbar skeleton */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-8 rounded animate-pulse ${
                  isDark ? "bg-gray-700" : "bg-gray-200"
                }`}
                style={{ width: `${60 + i * 10}px` }}
              ></div>
            ))}
          </div>
          <div
            className={`h-8 w-24 rounded animate-pulse ${
              isDark ? "bg-gray-700" : "bg-gray-200"
            }`}
          ></div>
        </div>

        {/* Chart area with grid */}
        <div className="relative h-full">
          {/* Horizontal grid lines */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`absolute left-0 right-0 h-px ${
                isDark ? "bg-gray-700" : "bg-gray-200"
              }`}
              style={{ top: `${15 + i * 12}%` }}
            ></div>
          ))}

          {/* Vertical grid lines */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div
              key={i}
              className={`absolute top-0 bottom-0 w-px ${
                isDark ? "bg-gray-700" : "bg-gray-200"
              }`}
              style={{ left: `${10 + i * 8}%` }}
            ></div>
          ))}

          {/* Candlestick placeholders */}
          <div className="absolute inset-0 flex items-end justify-between px-4 pb-8">
            {Array.from({ length: 40 }, (_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                {/* Wick */}
                <div
                  className={`w-0.5 animate-pulse ${
                    Math.random() > 0.5
                      ? isDark
                        ? "bg-green-500/30"
                        : "bg-green-600/30"
                      : isDark
                        ? "bg-red-500/30"
                        : "bg-red-600/30"
                  }`}
                  style={{ height: `${20 + Math.random() * 40}px` }}
                ></div>
                {/* Body */}
                <div
                  className={`w-2 animate-pulse rounded-sm ${
                    Math.random() > 0.5
                      ? isDark
                        ? "bg-green-500/40"
                        : "bg-green-600/40"
                      : isDark
                        ? "bg-red-500/40"
                        : "bg-red-600/40"
                  }`}
                  style={{ height: `${10 + Math.random() * 30}px` }}
                ></div>
              </div>
            ))}
          </div>

          {/* Price scale skeleton */}
          <div className="absolute right-0 top-0 bottom-0 w-16 flex flex-col justify-between py-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`h-3 w-12 rounded animate-pulse ${
                  isDark ? "bg-gray-700" : "bg-gray-200"
                }`}
              ></div>
            ))}
          </div>

          {/* Time scale skeleton */}
          <div className="absolute bottom-0 left-0 right-0 h-8 flex justify-between items-center px-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className={`h-3 w-8 rounded animate-pulse ${
                  isDark ? "bg-gray-700" : "bg-gray-200"
                }`}
              ></div>
            ))}
          </div>

          {/* Loading indicator */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-sm">
            <div className="text-center">
              <div
                className={`w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4 ${
                  isDark ? "border-blue-400" : "border-blue-500"
                }`}
              ></div>
              <div
                className={`text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {isLoading ? "Loading market data..." : "Initializing chart..."}
              </div>
              <div
                className={`text-xs mt-1 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Please wait...
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(200%) skewX(-12deg);
          }
        }
      `}</style>
    </div>
  );

  // Show loading state until we have data
  if (isLoading || chartData.length === 0 || currentPrice === null) {
    return (
      <div
        className={`flex flex-col h-full w-full transition-colors duration-300 ${
          isDark ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        {/* Header with loading state */}
        <div
          className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b transition-colors duration-300 ${
            isDark
              ? "bg-gray-800 border-gray-700 text-white"
              : "bg-white border-gray-200 text-gray-900"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3 sm:mb-0">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`h-6 w-20 rounded animate-pulse ${
                    isDark ? "bg-gray-700" : "bg-gray-200"
                  }`}
                ></div>
                <div className="flex items-center gap-1 text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse"></div>
                  <span className="text-xs">LOADING...</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex flex-col">
                <div
                  className={`h-8 w-24 rounded animate-pulse ${
                    isDark ? "bg-gray-700" : "bg-gray-200"
                  }`}
                ></div>
                <div className="flex items-center gap-1 text-sm mt-1">
                  <div
                    className={`h-4 w-16 rounded animate-pulse ${
                      isDark ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  ></div>
                  <div
                    className={`h-4 w-20 rounded animate-pulse ${
                      isDark ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  ></div>
                </div>
              </div>

              <div className="flex gap-4 text-xs">
                {["High", "Low", "Vol"].map((label) => (
                  <div key={label} className="flex items-center gap-1">
                    <span
                      className={isDark ? "text-gray-400" : "text-gray-600"}
                    >
                      {label}:
                    </span>
                    <div
                      className={`h-3 w-12 rounded animate-pulse ${
                        isDark ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trading buttons - disabled during loading */}
          <div className="flex gap-2">
            <div
              className={`px-4 py-2 rounded-md text-sm font-medium min-w-[70px] animate-pulse ${
                isDark ? "bg-gray-700" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`px-4 py-2 rounded-md text-sm font-medium min-w-[70px] animate-pulse ${
                isDark ? "bg-gray-700" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`px-4 py-2 rounded-md text-sm font-medium min-w-[80px] animate-pulse ${
                isDark ? "bg-gray-700" : "bg-gray-200"
              }`}
            ></div>
          </div>
        </div>

        {/* Enhanced Chart Skeleton Loader */}
        <div className="flex-1 p-4 overflow-hidden">
          <ChartSkeletonLoader />
        </div>
      </div>
    );
  }

  const isUp = priceChange >= 0;

  return (
    <div
      className="flex flex-col h-full w-full transition-colors duration-300"
      style={{ background: palette.bg }}
    >
      {/* ---------------------------------------------------------------- */}
      {/* Header — TradingView style: symbol · live badge · big price ·    */}
      {/* OHLC/vol stats · trading actions                                 */}
      {/* ---------------------------------------------------------------- */}
      <div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 py-3 border-b transition-colors duration-300"
        style={{
          background: palette.panel,
          borderColor: palette.border,
          color: palette.text,
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3 sm:mb-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-wide">{stockName}</h1>
            <span
              className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{
                color: palette.textMuted,
                background: isDark ? "#232734" : "#eef0f3",
              }}
            >
              NSE · 1D
            </span>
            <div
              className="flex items-center gap-1"
              style={{ color: isConnected ? palette.up : "#f0b90b" }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: isConnected ? palette.up : "#f0b90b",
                  boxShadow: isConnected ? `0 0 6px ${palette.up}` : "none",
                }}
              ></div>
              <span className="text-[10px] font-semibold tracking-wide">
                {isConnected ? "LIVE" : "API DATA"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex flex-col leading-tight">
              <span
                className="text-2xl font-bold"
                style={{ color: isUp ? palette.up : palette.down }}
              >
                ₹{currentPrice.toFixed(2)}
              </span>
              <div
                className="flex items-center gap-1 text-sm"
                style={{ color: isUp ? palette.up : palette.down }}
              >
                <span>
                  {isUp ? "+" : ""}
                  {priceChange.toFixed(2)}
                </span>
                <span>
                  ({isUp ? "+" : ""}
                  {priceChangePercent.toFixed(2)}%)
                </span>
              </div>
            </div>

            <div
              className="flex gap-4 text-xs"
              style={{ color: palette.textMuted }}
            >
              <div>
                O:{" "}
                <span style={{ color: palette.text }}>
                  ₹
                  {(
                    legend?.open ??
                    chartData[chartData.length - 1]?.open ??
                    0
                  ).toFixed(2)}
                </span>
              </div>
              <div>
                H: <span style={{ color: palette.up }}>₹{high.toFixed(2)}</span>
              </div>
              <div>
                L:{" "}
                <span style={{ color: palette.down }}>₹{low.toFixed(2)}</span>
              </div>
              <div>
                Vol:{" "}
                <span style={{ color: palette.text }}>
                  {volume.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Trading buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleSell}
            className="px-4 py-1.5 cursor-pointer rounded text-sm font-semibold transition-colors duration-150 min-w-[76px] border"
            style={{
              background: isDark
                ? "rgba(239, 83, 80, 0.12)"
                : "rgba(242, 54, 69, 0.08)",
              borderColor: palette.down,
              color: palette.down,
            }}
          >
            {currentPrice.toFixed(2)}
            <div className="text-[10px] font-medium opacity-80">SELL</div>
          </button>
          <button
            onClick={handleBuy}
            className="px-4 py-1.5 cursor-pointer rounded text-sm font-semibold transition-colors duration-150 min-w-[76px] border"
            style={{
              background: isDark
                ? "rgba(41, 98, 255, 0.14)"
                : "rgba(41, 98, 255, 0.08)",
              borderColor: palette.accent,
              color: palette.accent,
            }}
          >
            {currentPrice.toFixed(2)}
            <div className="text-[10px] font-medium opacity-80">BUY</div>
          </button>
          <button
            onClick={handleSquareOff}
            className="px-3 py-1.5 rounded text-xs font-medium transition-colors duration-150 cursor-pointer border"
            style={{ borderColor: palette.border, color: palette.text }}
          >
            Square Off
          </button>
          <button
            onClick={handleShortSell}
            className="px-3 py-1.5 rounded text-xs font-medium transition-colors duration-150 cursor-pointer border"
            style={{ borderColor: palette.border, color: palette.text }}
          >
            Short Sell
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Analysis toolbar — chart type / indicators / drawing tools /     */}
      {/* log scale / fullscreen                                          */}
      {/* ---------------------------------------------------------------- */}
      <div
        className="flex items-center gap-2 px-4 py-1.5 border-b text-xs flex-wrap"
        style={{ background: palette.panelAlt, borderColor: palette.border }}
      >
        {/* Chart type */}
        <div
          className="flex items-center rounded overflow-hidden border"
          style={{ borderColor: palette.border }}
        >
          {[
            { key: "candlestick", label: "Candles" },
            { key: "bars", label: "Bars" },
            { key: "line", label: "Line" },
            { key: "area", label: "Area" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => switchChartType(opt.key)}
              className="px-2.5 py-1 cursor-pointer transition-colors duration-150"
              style={{
                background:
                  chartType === opt.key ? palette.accent : "transparent",
                color: chartType === opt.key ? "#fff" : palette.textMuted,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Indicators */}
        <button
          onClick={toggleSMA}
          className="px-2.5 py-1 rounded cursor-pointer border transition-colors duration-150"
          style={{
            borderColor: showSMA ? palette.sma : palette.border,
            color: showSMA ? palette.sma : palette.textMuted,
            background: showSMA ? `${palette.sma}1a` : "transparent",
          }}
        >
          SMA 20
        </button>

        <button
          onClick={toggleEMA}
          className="px-2.5 py-1 rounded cursor-pointer border transition-colors duration-150"
          style={{
            borderColor: showEMA ? palette.ema : palette.border,
            color: showEMA ? palette.ema : palette.textMuted,
            background: showEMA ? `${palette.ema}1a` : "transparent",
          }}
        >
          EMA 9
        </button>

        <button
          onClick={toggleLogScale}
          className="px-2.5 py-1 rounded cursor-pointer border transition-colors duration-150"
          style={{
            borderColor: isLogScale ? palette.accent : palette.border,
            color: isLogScale ? palette.accent : palette.textMuted,
            background: isLogScale ? `${palette.accent}1a` : "transparent",
          }}
        >
          Log
        </button>

        <div
          className="w-px self-stretch my-0.5"
          style={{ background: palette.border }}
        />

        {/* Drawing tools */}
        <div
          className="flex items-center rounded overflow-hidden border"
          style={{ borderColor: palette.border }}
        >
          {[
            { key: "cursor", label: "↖", title: "Cursor" },
            { key: "trendline", label: "／", title: "Trend Line" },
            { key: "horizontal", label: "―", title: "Horizontal Line" },
            { key: "rectangle", label: "▭", title: "Rectangle" },
            { key: "brush", label: "✎", title: "Brush" },
          ].map((tool) => (
            <button
              key={tool.key}
              onClick={() => selectTool(tool.key)}
              title={tool.title}
              className="px-2.5 py-1 cursor-pointer transition-colors duration-150"
              style={{
                background:
                  activeTool === tool.key ? palette.accent : "transparent",
                color: activeTool === tool.key ? "#fff" : palette.textMuted,
              }}
            >
              {tool.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 px-1">
          {DRAW_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setDrawColor(c)}
              title={c}
              className="w-3.5 h-3.5 rounded-full cursor-pointer transition-transform duration-150"
              style={{
                background: c,
                border:
                  drawColor === c
                    ? `2px solid ${palette.text}`
                    : `1px solid ${palette.border}`,
                transform: drawColor === c ? "scale(1.2)" : "scale(1)",
              }}
            />
          ))}
        </div>

        <button
          onClick={undoDrawing}
          title="Undo last drawing"
          className="px-2.5 py-1 rounded cursor-pointer border transition-colors duration-150"
          style={{ borderColor: palette.border, color: palette.textMuted }}
        >
          ↺ Undo
        </button>

        <button
          onClick={clearDrawings}
          title="Clear all drawings"
          className="px-2.5 py-1 rounded cursor-pointer border transition-colors duration-150"
          style={{ borderColor: palette.border, color: palette.textMuted }}
        >
          🗑 Clear
        </button>

        <div className="flex-1" />

        {legend && (
          <div
            className="hidden md:flex items-center gap-3 font-mono"
            style={{ color: palette.textMuted }}
          >
            {legend.open !== undefined && (
              <>
                <span>
                  O{" "}
                  <span style={{ color: palette.text }}>
                    {Number(legend.open).toFixed(2)}
                  </span>
                </span>
                <span>
                  H{" "}
                  <span style={{ color: palette.up }}>
                    {Number(legend.high).toFixed(2)}
                  </span>
                </span>
                <span>
                  L{" "}
                  <span style={{ color: palette.down }}>
                    {Number(legend.low).toFixed(2)}
                  </span>
                </span>
              </>
            )}
            <span>
              C{" "}
              <span style={{ color: palette.text }}>
                {Number(legend.close).toFixed(2)}
              </span>
            </span>
          </div>
        )}

        <button
          onClick={toggleFullscreen}
          className="px-2.5 py-1 rounded cursor-pointer border transition-colors duration-150"
          style={{ borderColor: palette.border, color: palette.textMuted }}
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? "⤢ Exit" : "⤢ Full"}
        </button>
      </div>

      {/* Chart container */}
      <div
        ref={chartWrapperRef}
        className="flex-1 p-2 overflow-hidden"
        style={{ background: palette.bg }}
      >
        <div className="relative w-full h-full" style={{ minHeight: "300px" }}>
          <div
            className="cursor-crosshair w-full h-full rounded transition-all duration-300"
            style={{
              minHeight: "300px",
              background: palette.panel,
              border: `1px solid ${palette.border}`,
            }}
            ref={chartContainerRef}
          />
          {/* Drawing overlay — transparent canvas positioned above the chart.
              pointer-events are enabled only while a drawing tool is active
              so the underlying chart keeps handling pan/zoom/crosshair in
              cursor mode. */}
          <canvas
            ref={drawCanvasRef}
            className="absolute inset-0 rounded"
            style={{
              pointerEvents: activeTool === "cursor" ? "none" : "auto",
              cursor: activeTool === "cursor" ? "default" : "crosshair",
              zIndex: 10,
            }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          />
        </div>
      </div>

      {/* Enhanced Buy/Sell Modal with Visible Background */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Subtle backdrop with glassmorphism effect */}
          <div
            className={`fixed inset-0 backdrop-blur-sm transition-all duration-300 ${
              isDark ? "bg-black/20" : "bg-white/20"
            }`}
            onClick={closeModal}
            style={{
              backdropFilter: "blur(8px)",
            }}
          ></div>

          {/* Enhanced Modal with better positioning */}
          <div
            className={`relative w-full max-w-md rounded-xl shadow-2xl transition-all duration-300 transform scale-100 ${
              isDark
                ? "bg-gray-800/95 border border-gray-700/50"
                : "bg-white/95 border border-gray-200/50"
            }`}
            style={{
              backdropFilter: "blur(20px)",
              boxShadow: isDark
                ? "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)"
                : "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
            }}
          >
            {/* Header with gradient accent */}
            <div
              className={`relative flex items-center justify-between p-6 border-b ${
                isDark ? "border-gray-700/50" : "border-gray-200/50"
              }`}
            >
              {/* Gradient accent bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${
                  modalType === "buy"
                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                    : "bg-gradient-to-r from-red-500 to-rose-500"
                }`}
              ></div>

              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    modalType === "buy"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {modalType === "buy" ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <h3
                    className={`text-lg font-semibold ${
                      modalType === "buy" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {modalType === "buy" ? "Buy" : "Sell"} Order
                  </h3>
                  <p
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {stockName}
                  </p>
                </div>
              </div>

              <button
                onClick={closeModal}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isDark
                    ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700/50"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Body with enhanced styling */}
            <div className="p-6 space-y-4">
              {/* Current Price Display with pulse animation */}
              <div
                className={`p-4 rounded-lg border ${
                  isDark
                    ? "bg-gray-700/50 border-gray-600/50"
                    : "bg-gray-50/50 border-gray-200/50"
                }`}
                style={{
                  backdropFilter: "blur(10px)",
                }}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Current Price
                </div>
                <div
                  className={`text-2xl font-bold flex items-center gap-2 ${
                    priceChange >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  ₹{currentPrice.toFixed(2)}
                  <span className="text-sm font-normal opacity-75">
                    {priceChange >= 0 ? "↗" : "↘"}
                  </span>
                </div>
              </div>

              {/* Quantity Input with enhanced styling */}
              <div className="space-y-2">
                <label
                  className={`block text-sm font-medium ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Quantity
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Enter quantity"
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                      isDark
                        ? "bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                        : "bg-white/50 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    }`}
                    style={{
                      backdropFilter: "blur(10px)",
                    }}
                    autoFocus
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3"></div>
                </div>
              </div>

              {/* Total Amount with animation */}
              {quantity && !isNaN(quantity) && Number(quantity) > 0 && (
                <div
                  className={`p-4 rounded-lg border transition-all duration-300 animate-in slide-in-from-top ${
                    isDark
                      ? "bg-gray-700/50 border-gray-600/50"
                      : "bg-gray-50/50 border-gray-200/50"
                  }`}
                  style={{
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div
                        className={`text-sm font-medium ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        Total Amount
                      </div>
                      <div
                        className={`text-xl font-bold ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {formatCurrency(Number(quantity) * currentPrice)}
                      </div>
                    </div>
                    <div
                      className={`text-right text-sm ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      <div>
                        {quantity} × ₹{currentPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with enhanced buttons */}
            <div
              className={`flex gap-3 p-6 border-t ${
                isDark ? "border-gray-700/50" : "border-gray-200/50"
              }`}
            >
              <button
                onClick={closeModal}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isDark
                    ? "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600/50"
                    : "bg-gray-100/50 text-gray-700 hover:bg-gray-200/50 border border-gray-200/50"
                }`}
                style={{
                  backdropFilter: "blur(10px)",
                }}
              >
                Cancel
              </button>
              {isDisabled ? (
                <>
                  {" "}
                  <button
                    onClick={() => {}}
                    disabled={
                      !quantity || isNaN(quantity) || Number(quantity) <= 0
                    }
                    className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium text-white cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      modalType === "buy"
                        ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/25"
                        : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-lg shadow-red-500/25"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {process && (
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      )}
                      <span>
                        {modalType === "buy"
                          ? process
                            ? "Purchasing..."
                            : "Buy Now"
                          : process
                            ? "Selling..."
                            : "Sell Now"}
                      </span>
                    </span>
                  </button>
                </>
              ) : (
                <>
                  {" "}
                  <button
                    onClick={handleModalSubmit}
                    disabled={
                      !quantity || isNaN(quantity) || Number(quantity) <= 0
                    }
                    className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium text-white cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      modalType === "buy"
                        ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/25"
                        : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-lg shadow-red-500/25"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {modalType === "buy"
                        ? process
                          ? "Purchasing.."
                          : "Buy Now"
                        : process
                          ? "Selling.."
                          : "Sell Now"}
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewStock;
