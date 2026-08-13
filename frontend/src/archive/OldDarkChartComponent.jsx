import { createChart, AreaSeries, CandlestickSeries } from "lightweight-charts";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

const ChartComponent = () => {
  const [shares, setShares] = useState([]);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const chartContainerRef = useRef(null);
  const processedTimestampsRef = useRef(new Set());

  const socket = io(import.meta.env.VITE_BACKEND_URL, {
    transports: ["websocket"],
  });

  // Function to check if dark mode is active
  const isDarkMode = () => {
    return document.documentElement.classList.contains("dark");
  };

  // Function to get chart options based on theme
  const getChartOptions = () => {
    const darkMode = isDarkMode();
    return {
      layout: {
        textColor: darkMode ? "#e5e7eb" : "black", // text-gray-200 for dark, black for light
        background: { type: "solid", color: darkMode ? "#1f2937" : "white" }, // bg-gray-800 for dark, white for light
      },
      width: 800,
      height: 300,
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
      grid: {
        vertLines: {
          color: darkMode ? "#374151" : "#f0f0f0", // gray-700 for dark, light gray for light
        },
        horzLines: {
          color: darkMode ? "#374151" : "#f0f0f0", // gray-700 for dark, light gray for light
        },
      },
    };
  };

  // Function to process socket data and get the latest data points
  const processLatestSocketData = (socketData) => {
    try {
      if (!socketData || !Array.isArray(socketData)) return [];

      const candlestickData = [];

      socketData.forEach((share) => {
        // Updated to use lastHistory instead of history array
        if (!share.lastHistory) return;

        const latestHistory = share.lastHistory;

        if (!latestHistory) return;

        const timestamp = new Date(latestHistory.timestamp);
        const timeKey = Math.floor(timestamp.getTime() / 1000);

        // Skip if already processed this timestamp
        if (processedTimestampsRef.current.has(timeKey)) return;
        processedTimestampsRef.current.add(timeKey);

        // Add candlestick data point using the latest history
        candlestickData.push({
          time: timeKey,
          open: latestHistory.open,
          high: latestHistory.high,
          low: latestHistory.low,
          close: latestHistory.close,
        });
      });

      // Sort by time to maintain chronological order
      return candlestickData.sort((a, b) => a.time - b.time);
    } catch (error) {
      console.error("Error processing socket data:", error);
      return [];
    }
  };

  // Function to update chart with new data
  const updateChartWithLatestData = (newData) => {
    if (candlestickSeriesRef.current && Array.isArray(newData)) {
      const latestCandlestickData = processLatestSocketData(newData);

      if (latestCandlestickData.length > 0) {
        // Update candlestick series with latest data
        latestCandlestickData.forEach((dataPoint) => {
          candlestickSeriesRef.current.update(dataPoint);
        });
      }
    }
  };

  // Function to update chart theme
  const updateChartTheme = () => {
    if (chartRef.current) {
      chartRef.current.applyOptions(getChartOptions());
    }
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to backend with id:", socket.id);
    });

    socket.on("shareliveprice", (liveprice) => {
      console.log("🚀 ~ Dashboard ~ liveprice:", liveprice);

      // Update shares state with latest data
      setShares(liveprice);

      // Update chart with the latest data from socket
      if (Array.isArray(liveprice)) {
        updateChartWithLatestData(liveprice);
      }

      console.log("🚀 ~ ChartComponent ~ shares:", shares);

      // Optional: Show price update notifications for significant changes
      // You can customize this logic based on your needs
      if (liveprice.changePercent && Math.abs(liveprice.changePercent) > 5) {
        const isPositive = liveprice.changePercent > 0;
        toast.info(
          `${liveprice.symbol}: ${
            isPositive ? "📈" : "📉"
          } ${liveprice.changePercent.toFixed(2)}%`,
          {
            icon: isPositive ? "🟢" : "🔴",
            progressStyle: {
              background: "rgba(255, 255, 255, 0.3)",
            },
          }
        );
      }
    });

    socket.on("disconnect", () => {
      toast.warn("⚠️ Disconnected from market data", {
        icon: "🔌",
      });
    });

    socket.on("connect_error", (error) => {
      toast.error("❌ Connection failed. Retrying...", {
        icon: "⚡",
      });
    });

    return () => {
      socket.off("connect");
      socket.off("shareliveprice");
      socket.off("disconnect");
      socket.off("connect_error");
    };
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(
      document.getElementById("chart-container"),
      getChartOptions()
    );

    // Store chart reference
    chartRef.current = chart;

    // Only create candlestick series (removed area series to avoid overlap)
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    // Store candlestick series reference
    candlestickSeriesRef.current = candlestickSeries;

    candlestickSeries.setData([]);

    chart.timeScale().fitContent();

    // Handle window resize
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    // Listen for theme changes
    const themeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          updateChartTheme();
        }
      });
    });

    // Observe changes to the html element's class attribute for dark mode detection
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      themeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
      }
      // Clear processed timestamps
      processedTimestampsRef.current.clear();
    };
  }, []);

  // Effect to handle initial data processing when shares state updates
  useEffect(() => {
    if (shares.length > 0 && candlestickSeriesRef.current) {
      updateChartWithLatestData(shares);
    }
  }, [shares]);

  return (
    <>
      <div
        ref={chartContainerRef}
        id="chart-container"
        className="w-full h-[300px] bg-white dark:bg-gray-800"
        style={{ width: "100%", height: "300px" }}
      />
    </>
  );
};

export default ChartComponent;
