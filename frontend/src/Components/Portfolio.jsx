import React, { useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Percent,
  BarChart3,
  RefreshCw,
  Search,
  Download,
  Eye,
  EyeOff,
  Plus,
  Minus,
  PieChart,
  Target,
  Zap,
  IndianRupee,
  LoaderCircle,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { io } from "socket.io-client";
import { useDarkModeStore, userAuthenticatedStore } from "../store";
import { toast } from "react-toastify";
import { getUser } from "../Services";
import { useNavigate } from "react-router-dom";

const Portfolio = () => {
  const { globalDarkState } = useDarkModeStore();
  const [positions, setPositions] = useState([]);
  const [shortPositions, setShortPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [hideBalances, setHideBalances] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [activeTab, setActiveTab] = useState("long"); // 'long' or 'short'
  const [livePrices, setLivePrices] = useState({});
  const [priceAnimations, setPriceAnimations] = useState({});

  const userId = userAuthenticatedStore((state) => state.userId);
  const socketRef = useRef(null);

  // Fetch portfolio data
  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const res = await getUser(userId);
      console.log("🚀 ~ fetchPortfolio ~ res:", res);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPositions(res.user.portfolio || []);
      setShortPositions(res.user.shortPositions || []);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      toast.error("Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  // Socket connection for live prices
  useEffect(() => {
    if (!userId) return;

    // Connect socket
    socketRef.current = io(import.meta.env.VITE_BACKEND_URL, {
      transports: ["websocket"],
    });

    const socket = socketRef.current;

    // Connection handler
    const onConnect = () => {
      console.log("🔗 Portfolio connected to backend:", socket.id);
      socket.emit("registerUser", userId);
    };

    // Live price handler
    const onShareLivePrice = (payload) => {
      const items = Array.isArray(payload) ? payload : [payload];

      // Update live prices and animations
      setLivePrices((prev) => {
        const next = { ...prev };
        for (const share of items) {
          if (share?.sharename && share?.lastHistory) {
            const sharename = share.sharename.trim();
            const currentPrice = Number(share.price ?? share.lastHistory.close);
            const prevPrice = next[sharename];

            // Trigger animation if price changed
            if (
              Number.isFinite(currentPrice) &&
              prevPrice !== undefined &&
              prevPrice !== currentPrice
            ) {
              setPriceAnimations((prevAnim) => ({
                ...prevAnim,
                [sharename]: currentPrice > prevPrice ? "increase" : "decrease",
              }));
              setTimeout(() => {
                setPriceAnimations((prevAnim) => ({
                  ...prevAnim,
                  [sharename]: "",
                }));
              }, 600);
            }

            if (Number.isFinite(currentPrice)) {
              next[sharename] = currentPrice;
            }
          }
        }
        return next;
      });
    };

    // Register listeners
    socket.on("connect", onConnect);
    socket.on("shareliveprice", onShareLivePrice);
    socket.on("connect_error", (err) =>
      console.error("❌ Portfolio socket error:", err)
    );
    socket.on("disconnect", (reason) =>
      console.log("🔌 Portfolio disconnected:", reason)
    );

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.off("connect", onConnect);
        socketRef.current.off("shareliveprice", onShareLivePrice);
        socketRef.current.disconnect();
      }
    };
  }, [userId]);

  // Calculate portfolio metrics with live prices (Long positions)
  const totalValue = positions.reduce((sum, pos) => {
    const currentPrice =
      livePrices[pos.sharename] || pos.lastMarketPrice || pos.avgPrice;
    return sum + pos.quantity * currentPrice;
  }, 0);

  const totalInvested = positions.reduce(
    (sum, pos) => sum + pos.quantity * pos.avgPrice,
    0
  );

  const totalPnL = totalValue - totalInvested;
  const totalPnLPercentage =
    totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  // Calculate short position metrics
  const shortTotalValue = shortPositions.reduce((sum, pos) => {
    const currentPrice = livePrices[pos.sharename] || pos.sellPrice;
    return sum + pos.quantity * currentPrice;
  }, 0);

  const shortTotalSold = shortPositions.reduce(
    (sum, pos) => sum + pos.quantity * pos.sellPrice,
    0
  );

  const shortTotalPnL = shortTotalSold - shortTotalValue;
  const shortTotalPnLPercentage =
    shortTotalSold > 0 ? (shortTotalPnL / shortTotalSold) * 100 : 0;

  // Filter positions based on active tab
  const filteredPositions = (activeTab === "long" ? positions : shortPositions).filter((position) =>
    position.sharename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    if (hideBalances) return "₹****";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    if (hideBalances) return "***";
    return new Intl.NumberFormat("en-IN").format(num);
  };

  // const exportPortfolio = () => {
  //   const csvContent = [
  //     [
  //       "Type",
  //       "Symbol",
  //       "Quantity",
  //       activeTab === "long" ? "Avg Price" : "Sell Price",
  //       "Market Price",
  //       "Total Value",
  //       "P&L",
  //       "P&L %",
  //     ],
  //     ...filteredPositions.map((pos) => {
  //       const currentPrice = livePrices[pos.sharename] || (activeTab === "long" ? (pos.lastMarketPrice || pos.avgPrice) : pos.sellPrice);
  //       const referencePrice = activeTab === "long" ? pos.avgPrice : pos.sellPrice;
  //       const currentValue = pos.quantity * currentPrice;
  //       const investedValue = pos.quantity * referencePrice;
  //       const pnl = activeTab === "long" ? (currentValue - investedValue) : (investedValue - currentValue);
  //       const pnlPercentage =
  //         investedValue > 0 ? (pnl / investedValue) * 100 : 0;

  //       return [
  //         activeTab === "long" ? "LONG" : "SHORT",
  //         pos.sharename,
  //         pos.quantity,
  //         referencePrice,
  //         currentPrice,
  //         currentValue,
  //         pnl,
  //         pnlPercentage.toFixed(2) + "%",
  //       ];
  //     }),
  //   ]
  //     .map((row) => row.join(","))
  //     .join("\n");

  //   const blob = new Blob([csvContent], { type: "text/csv" });
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = `portfolio-${activeTab}.csv`;
  //   a.click();
  //   URL.revokeObjectURL(url);
  //   toast.success("Portfolio exported successfully!");
  // };

  const navigate = useNavigate();

  // Position Card Component for Grid View
  const PositionCard = ({ position, isShort = false }) => {
    const currentPrice =
      livePrices[position.sharename] ||
      (isShort ? position.sellPrice : (position.lastMarketPrice || position.avgPrice));
    const referencePrice = isShort ? position.sellPrice : position.avgPrice;
    const investedValue = position.quantity * referencePrice;
    const currentValue = position.quantity * currentPrice;
    const pnl = isShort ? (investedValue - currentValue) : (currentValue - investedValue);
    const pnlPercentage = investedValue > 0 ? (pnl / investedValue) * 100 : 0;
    const hasMarketData =
      livePrices[position.sharename] ||
      (isShort ? true : (position.lastMarketPrice && position.lastMarketPrice > 0));
    const animation = priceAnimations[position.sharename] || "";

    // Get the shareId for navigation (works for both long and short positions)
    const shareId = position.shareId || position._id;

    return (
      <div
        onClick={() => navigate(`/bazaar/market/${shareId}`)}
        className={`relative overflow-hidden rounded-lg border transition-all duration-200 hover:border-opacity-80 ${
          globalDarkState
            ? "bg-gray-800 border-gray-700 hover:border-gray-600"
            : "bg-white border-gray-200 hover:border-gray-300"
        } ${
          animation === "increase"
            ? "ring-2 ring-green-500"
            : animation === "decrease"
            ? "ring-2 ring-red-500"
            : ""
        }`}
      >
        {/* Header */}
        <div
          className={`px-4 py-3 border-b ${
            globalDarkState ? "border-gray-700" : "border-gray-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {isShort && (
                <div className="mr-2 p-1 rounded bg-orange-500/10">
                  <ArrowDown size={14} className="text-orange-500" />
                </div>
              )}
              <h3
                className={`font-semibold text-sm ${
                  globalDarkState ? "text-white" : "text-gray-900"
                }`}
              >
                {position?.sharename ? position.sharename : "-"}
              </h3>
            </div>
            {hasMarketData && (
              <div
                className={`flex items-center text-xs font-medium ${
                  pnl >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {pnl >= 0 ? (
                  <TrendingUp size={12} />
                ) : (
                  <TrendingDown size={12} />
                )}
                <span className="ml-1">
                  {pnlPercentage ? pnlPercentage.toFixed(2) : "-"}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p
                className={`text-xs ${
                  globalDarkState ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Qty
              </p>
              <p
                className={`font-medium ${
                  globalDarkState ? "text-white" : "text-gray-900"
                }`}
              >
                {formatNumber(position.quantity)}
              </p>
            </div>
            <div>
              <p
                className={`text-xs ${
                  globalDarkState ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {isShort ? "Sell Price" : "Avg Price"}
              </p>
              <p
                className={`font-medium ${
                  globalDarkState ? "text-white" : "text-gray-900"
                }`}
              >
                {formatCurrency(referencePrice)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p
                className={`text-xs ${
                  globalDarkState ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Market Price
                {livePrices[position.sharename] && (
                  <span className="ml-1 text-green-500">●</span>
                )}
              </p>
              <p
                className={`font-medium ${
                  globalDarkState ? "text-white" : "text-gray-900"
                }`}
              >
                {hasMarketData ? formatCurrency(currentPrice) : "-"}
              </p>
            </div>
            <div>
              <p
                className={`text-xs ${
                  globalDarkState ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {isShort ? "To Cover" : "Value"}
              </p>
              <p
                className={`font-medium ${
                  globalDarkState ? "text-white" : "text-gray-900"
                }`}
              >
                {formatCurrency(currentValue)}
              </p>
            </div>
          </div>

          {isShort && (
            <div className="grid grid-cols-1 gap-2">
              <div>
                <p
                  className={`text-xs ${
                    globalDarkState ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Margin Locked
                </p>
                <p
                  className={`font-medium ${
                    globalDarkState ? "text-white" : "text-gray-900"
                  }`}
                >
                  {formatCurrency(position.marginLocked)}
                </p>
              </div>
            </div>
          )}

          {hasMarketData && (
            <div
              className={`pt-2 border-t ${
                globalDarkState ? "border-gray-700" : "border-gray-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs ${
                    globalDarkState ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  P&L
                </span>
                <div
                  className={`text-sm font-semibold ${
                    pnl >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {pnl >= 0 ? "+" : ""}
                  {pnl ? formatCurrency(pnl) : "-"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Get current metrics based on active tab
  const currentTotalValue = activeTab === "long" ? totalValue : shortTotalValue;
  const currentTotalInvested = activeTab === "long" ? totalInvested : shortTotalSold;
  const currentTotalPnL = activeTab === "long" ? totalPnL : shortTotalPnL;
  const currentTotalPnLPercentage = activeTab === "long" ? totalPnLPercentage : shortTotalPnLPercentage;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        globalDarkState ? "dark bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Top Panel */}
      <div
        className={`sticky top-0 z-10 border-b backdrop-blur-sm ${
          globalDarkState
            ? "bg-gray-900/95 border-gray-800"
            : "bg-white/95 border-gray-200"
        }`}
      >
        <div className="px-4 py-4">
          {/* Portfolio Summary */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
            <div>
              <h1
                className={`text-xl font-bold ${
                  globalDarkState ? "text-white" : "text-gray-900"
                }`}
              >
                Portfolio
                {Object.keys(livePrices).length > 0 && (
                  <span className="ml-2 inline-flex items-center text-xs font-normal text-green-500">
                    <span className="animate-pulse mr-1">●</span>
                    Live
                  </span>
                )}
              </h1>
              <div className="flex items-center mt-1 space-x-4">
                <div className="flex items-center">
                  <span
                    className={`text-sm ${
                      globalDarkState ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {activeTab === "long" ? "Total Value:" : "Total To Cover:"}
                  </span>
                  <span
                    className={`ml-2 text-lg font-bold ${
                      globalDarkState ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {formatCurrency(currentTotalValue)}
                  </span>
                </div>
                {currentTotalPnL !== 0 && (
                  <div
                    className={`flex items-center text-sm font-medium ${
                      currentTotalPnL >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {currentTotalPnL >= 0 ? <Plus size={14} /> : <Minus size={14} />}
                    <span className="ml-1">
                      {formatCurrency(Math.abs(currentTotalPnL))} (
                      {currentTotalPnLPercentage.toFixed(2)}%)
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-3 lg:mt-0">
              <button
                onClick={() => setHideBalances(!hideBalances)}
                className={`p-2 rounded-md transition-colors ${
                  globalDarkState
                    ? "hover:bg-gray-800 text-gray-400 hover:text-white"
                    : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                }`}
              >
                {hideBalances ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                onClick={fetchPortfolio}
                disabled={loading}
                className={`p-2 rounded-md transition-colors ${
                  globalDarkState
                    ? "hover:bg-gray-800 text-gray-400 hover:text-white"
                    : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
              {/* <button
                onClick={exportPortfolio}
                className={`p-2 rounded-md transition-colors ${
                  globalDarkState
                    ? "hover:bg-gray-800 text-gray-400 hover:text-white"
                    : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                }`}
              >
                <Download size={16} />
              </button> */}
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setActiveTab("long")}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "long"
                  ? globalDarkState
                    ? "bg-blue-600 text-white"
                    : "bg-blue-600 text-white"
                  : globalDarkState
                  ? "bg-gray-800 text-gray-400 hover:text-white"
                  : "bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
            >
              <ArrowUp size={16} className="mr-1" />
              Long Positions ({positions.length})
            </button>
            <button
              onClick={() => setActiveTab("short")}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "short"
                  ? globalDarkState
                    ? "bg-orange-600 text-white"
                    : "bg-orange-600 text-white"
                  : globalDarkState
                  ? "bg-gray-800 text-gray-400 hover:text-white"
                  : "bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
            >
              <ArrowDown size={16} className="mr-1" />
              Short Positions ({shortPositions.length})
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {[
              { label: "Positions", value: activeTab === "long" ? positions.length : shortPositions.length, icon: Target },
              {
                label: activeTab === "long" ? "Invested" : "Sold",
                value: formatCurrency(currentTotalInvested),
                icon: IndianRupee,
              },
              {
                label: activeTab === "long" ? "Current" : "To Cover",
                value: formatCurrency(currentTotalValue),
                icon: Activity,
              },
              {
                label: "P&L",
                value: `${currentTotalPnL >= 0 ? "+" : ""}${formatCurrency(currentTotalPnL)}`,
                icon: Zap,
                color: currentTotalPnL >= 0 ? "text-green-500" : "text-red-500",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  globalDarkState
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <stat.icon
                    size={16}
                    className={
                      stat.color ||
                      (globalDarkState ? "text-gray-400" : "text-gray-600")
                    }
                  />
                </div>
                <div
                  className={`mt-2 text-sm font-semibold ${
                    stat.color ||
                    (globalDarkState ? "text-white" : "text-gray-900")
                  }`}
                >
                  {stat.value}
                </div>
                <div
                  className={`text-xs ${
                    globalDarkState ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={16}
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  globalDarkState ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search positions..."
                className={`w-full pl-10 pr-4 py-2 text-sm rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  globalDarkState
                    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  viewMode === "grid"
                    ? globalDarkState
                      ? "bg-blue-600 text-white"
                      : "bg-blue-600 text-white"
                    : globalDarkState
                    ? "bg-gray-800 text-gray-400 hover:text-white"
                    : "bg-gray-100 text-gray-600 hover:text-gray-900"
                }`}
              >
                <PieChart size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  viewMode === "list"
                    ? globalDarkState
                      ? "bg-blue-600 text-white"
                      : "bg-blue-600 text-white"
                    : globalDarkState
                    ? "bg-gray-800 text-gray-400 hover:text-white"
                    : "bg-gray-100 text-gray-600 hover:text-gray-900"
                }`}
              >
                <BarChart3 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div
            className={`rounded-lg border p-8 ${
              globalDarkState
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin">
                <LoaderCircle color="#165DFC" size={20} />
              </div>
              <span
                className={`ml-3 text-sm ${
                  globalDarkState ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Loading positions...
              </span>
            </div>
          </div>
        ) : filteredPositions.length === 0 ? (
          <div
            className={`rounded-lg border p-8 text-center ${
              globalDarkState
                ? "bg-gray-800 border-gray-700 text-gray-300"
                : "bg-white border-gray-200 text-gray-600"
            }`}
          >
            <PieChart
              size={48}
              className={`mx-auto mb-4 ${
                globalDarkState ? "text-gray-600" : "text-gray-300"
              }`}
            />
            <p className="text-lg font-medium mb-2">No {activeTab} positions found</p>
            <p className="text-sm">
              {searchTerm
                ? "Try adjusting your search criteria"
                : `Start trading to build your ${activeTab} portfolio`}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPositions.map((position) => (
              <PositionCard
                key={position._id}
                position={position}
                // navigateTo={position._id}
                isShort={activeTab === "short"}
              />
            ))}
          </div>
        ) : (
          /* List View */
          <div
            className={`rounded-lg border overflow-hidden ${
              globalDarkState
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead
                  className={globalDarkState ? "bg-gray-700" : "bg-gray-50"}
                >
                  <tr>
                    <th
                      className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        globalDarkState ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Symbol
                    </th>
                    <th
                      className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                        globalDarkState ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Qty
                    </th>
                    <th
                      className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                        globalDarkState ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      {activeTab === "long" ? "Avg Price" : "Sell Price"}
                    </th>
                    <th
                      className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                        globalDarkState ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Market Price
                    </th>
                    {activeTab === "short" && (
                      <th
                        className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                          globalDarkState ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        Margin
                      </th>
                    )}
                    <th
                      className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                        globalDarkState ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      {activeTab === "long" ? "Value" : "To Cover"}
                    </th>
                    <th
                      className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                        globalDarkState ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      P&L
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPositions.map((position) => {
                    const isShort = activeTab === "short";
                    const currentPrice =
                      livePrices[position.sharename] ||
                      (isShort ? position.sellPrice : (position.lastMarketPrice || position.avgPrice));
                    const referencePrice = isShort ? position.sellPrice : position.avgPrice;
                    const investedValue = position.quantity * referencePrice;
                    const currentValue = position.quantity * currentPrice;
                    const pnl = isShort ? (investedValue - currentValue) : (currentValue - investedValue);
                    const pnlPercentage =
                      investedValue > 0 ? (pnl / investedValue) * 100 : 0;
                    const hasMarketData =
                      livePrices[position.sharename] ||
                      (isShort ? true : (position.lastMarketPrice && position.lastMarketPrice > 0));
                    const animation = priceAnimations[position.sharename] || "";

                    return (
                      <tr
                        key={position._id}
                        className={`transition-colors ${
                          globalDarkState
                            ? "hover:bg-gray-700"
                            : "hover:bg-gray-50"
                        } ${
                          animation === "increase"
                            ? "bg-green-900/20"
                            : animation === "decrease"
                            ? "bg-red-900/20"
                            : ""
                        }`}
                      >
                        <td
                          className={`px-4 py-3 text-sm font-medium ${
                            globalDarkState ? "text-white" : "text-gray-900"
                          }`}
                        >
                          <div className="flex items-center">
                            {isShort && (
                              <div className="mr-2 p-1 rounded bg-orange-500/10">
                                <ArrowDown size={12} className="text-orange-500" />
                              </div>
                            )}
                            {position.sharename}
                            {livePrices[position.sharename] && (
                              <span className="ml-2 text-xs text-green-500">
                                ●
                              </span>
                            )}
                          </div>
                        </td>
                        <td
                          className={`px-4 py-3 text-sm text-right ${
                            globalDarkState ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {formatNumber(position.quantity)}
                        </td>
                        <td
                          className={`px-4 py-3 text-sm text-right ${
                            globalDarkState ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {formatCurrency(referencePrice)}
                        </td>
                        <td
                          className={`px-4 py-3 text-sm text-right ${
                            globalDarkState ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {hasMarketData ? formatCurrency(currentPrice) : "N/A"}
                        </td>
                        {isShort && (
                          <td
                            className={`px-4 py-3 text-sm text-right ${
                              globalDarkState ? "text-gray-300" : "text-gray-600"
                            }`}
                          >
                            {formatCurrency(position.marginLocked)}
                          </td>
                        )}
                        <td
                          className={`px-4 py-3 text-sm text-right font-medium ${
                            globalDarkState ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {formatCurrency(currentValue)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          {hasMarketData ? (
                            <div
                              className={`flex items-center justify-end ${
                                pnl >= 0 ? "text-green-500" : "text-red-500"
                              }`}
                            >
                              {pnl >= 0 ? (
                                <TrendingUp size={12} />
                              ) : (
                                <TrendingDown size={12} />
                              )}
                              <span className="ml-1 font-medium">
                                {pnl >= 0 ? "+" : ""}
                                {formatCurrency(pnl)}
                              </span>
                              <span className="ml-1 text-xs">
                                ({pnlPercentage.toFixed(2)}%)
                              </span>
                            </div>
                          ) : (
                            <span
                              className={
                                globalDarkState
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }
                            >
                              N/A
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* Footer */}
        {!loading && (
          <div
            className={`mt-4 p-3 text-center text-xs ${
              globalDarkState ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Showing {filteredPositions.length} of {activeTab === "long" ? positions.length : shortPositions.length} {activeTab} positions
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;