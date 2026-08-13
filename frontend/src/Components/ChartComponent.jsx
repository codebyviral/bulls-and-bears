import { TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import Clock from "./Clock";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../utils/formatCurrency";

const PAGE_SIZE = 8;

const ChartComponent = () => {
  const [shares, setShares] = useState([]);
  const [previousPrices, setPreviousPrices] = useState({});
  const [priceAnimations, setPriceAnimations] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const socketRef = useRef(null);

  const navigate = useNavigate();

  const connectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    socketRef.current = io(import.meta.env.VITE_BACKEND_URL, {
      transports: ["websocket"],
    });

    return socketRef.current;
  };

  // Function to check if dark mode is active
  const isDarkMode = () => {
    return document.documentElement.classList.contains("dark");
  };

  // Calculate percentage change using lastHistory data
  const calculatePercentageChange = (current, open) => {
    if (!open || open === 0) return 0;
    return ((current - open) / open) * 100;
  };

  // Format price with appropriate decimal places
  const formatPrice = (price) => {
    if (price >= 1000) {
      return price.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return price.toFixed(4);
  };

  // Format percentage with sign and color
  const formatPercentage = (percentage) => {
    const sign = percentage >= 0 ? "+" : "";
    return `${sign}${percentage.toFixed(2)}%`;
  };

  // Get share symbol from share name (extract symbol or use full name)
  const getShareSymbol = (shareName) => {
    // Create symbol mapping for common stocks
    const symbolMap = {
      HDFC: "HDFC",
      "Hindustan Unilever": "HUL",
      "Kotak Mahindra Bank": "KOTAKBANK",
      "Larsen & Toubro": "LT",
      "Maruti Suzuki": "MARUTI",
      "Reliance Industries": "RELIANCE",
      "TV18 Broadcast": "TV18",
      "Tata Motors": "TATAMOTORS",
      "UltraTech Cement": "ULTRACEMCO",
      Wipro: "WIPRO",
    };

    return symbolMap[shareName] || shareName;
  };

  // Animate price changes
  const animatePrice = (shareId, isIncrease) => {
    setPriceAnimations((prev) => ({
      ...prev,
      [shareId]: isIncrease ? "increase" : "decrease",
    }));

    setTimeout(() => {
      setPriceAnimations((prev) => ({
        ...prev,
        [shareId]: "",
      }));
    }, 600);
  };

  // Refresh function
  const handleRefresh = () => {
    setIsRefreshing(true);

    // Clear current data
    setShares([]);
    setPreviousPrices({});
    setPriceAnimations({});
    setCurrentPage(1);

    // Reconnect socket
    const socket = connectSocket();
    setupSocketListeners(socket);

    // Show refresh toast
    toast.info("Refreshing market data...", {
      icon: "",
    });

    // Remove loading state after a brief moment
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Setup socket listeners
  const setupSocketListeners = (socket) => {
    socket.on("connect", () => {
      console.log("Connected to backend with id:", socket.id);
    });

    socket.on("shareliveprice", (liveprice) => {
      //
      // console.log("🚀 ~ setupSocketListeners ~ liveprice:", liveprice);

      if (Array.isArray(liveprice)) {
        // Update previous prices before setting new data
        setPreviousPrices((prev) => {
          const newPrev = { ...prev };
          liveprice.forEach((share) => {
            if (share.lastHistory && share.shareId) {
              const currentPrice = share.lastHistory.close;
              const previousPrice = newPrev[share.shareId];

              if (
                previousPrice !== undefined &&
                previousPrice !== currentPrice
              ) {
                animatePrice(share.shareId, currentPrice > previousPrice);
              }
              newPrev[share.shareId] = currentPrice;
            }
          });
          return newPrev;
        });

        // Set shares data maintaining the order from socket
        setShares(liveprice);
      }
    });

    socket.on("disconnect", () => {
      // toast.warn("⚠️ Disconnected from market data", {
      //   icon: "🔌",
      // });
    });

    socket.on("connect_error", (error) => {
      toast.error("❌ Connection failed. Retrying...", {
        icon: "⚡",
      });
      console.error("Socket connection error:", error);
    });
  };

  // Skeleton Card Component
  const SkeletonCard = () => (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        </div>
        <div className="w-8 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>

      {/* Current Price */}
      <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2"></div>

      {/* Change Amount and Percentage */}
      <div className="flex justify-between items-center mb-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </div>

      {/* OHLC Data */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full mb-3"></div>

      {/* Recent Ticks */}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex justify-between mb-1">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
          </div>
        ))}
      </div>

      {/* Share ID */}
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mt-2"></div>
    </div>
  );

  useEffect(() => {
    const socket = connectSocket();
    setupSocketListeners(socket);

    return () => {
      if (socketRef.current) {
        socketRef.current.off("connect");
        socketRef.current.off("shareliveprice");
        socketRef.current.off("disconnect");
        socketRef.current.off("connect_error");
        socketRef.current.disconnect();
      }
    };
  }, []);

  // ----- Pagination (kept separate & minimal to not disturb your logic) -----
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(shares.length / PAGE_SIZE)),
    [shares.length]
  );

  // Clamp current page whenever share count changes
  useEffect(() => {
    setCurrentPage((prev) => {
      if (prev > totalPages) return totalPages;
      if (prev < 1) return 1;
      return prev;
    });
  }, [totalPages]);

  const pagedShares = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return shares.slice(start, end);
  }, [shares, currentPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    // Optional: scroll to top of grid on page change for mobile
    const topEl = document.getElementById("market-grid-top");
    if (topEl) topEl.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const startCount =
    shares.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endCount = Math.min(currentPage * PAGE_SIZE, shares.length);

  const Pagination = () => {
    if (shares.length === 0) return null;

    // Generate compact page list with ellipses for large page counts
    const pages = [];
    const maxButtons = 5; // center current page
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start < maxButtons - 1) {
      start = Math.max(1, end - maxButtons + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("…");
    }
    for (let p = start; p <= end; p++) pages.push(p);
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("…");
      pages.push(totalPages);
    }

    return (
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing{" "}
          <span className="font-medium text-gray-900 dark:text-white">
            {startCount}
          </span>
          –
          <span className="font-medium text-gray-900 dark:text-white">
            {endCount}
          </span>{" "}
          of{" "}
          <span className="font-medium text-gray-900 dark:text-white">
            {shares.length}
          </span>{" "}
          stocks
        </div>

        <div className="flex items-center justify-start sm:justify-end gap-2 flex-wrap">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-2 rounded-lg border text-sm transition ${
              currentPage === 1
                ? "cursor-not-allowed opacity-50 border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500"
                : "border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
            }`}
            aria-label="Previous page"
          >
            Prev
          </button>

          {pages.map((p, idx) =>
            p === "…" ? (
              <span
                key={`dots-${idx}`}
                className="px-2 text-sm text-gray-500 dark:text-gray-400 select-none"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`px-3 py-2 rounded-lg border text-sm transition ${
                  p === currentPage
                    ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
                }`}
                aria-current={p === currentPage ? "page" : undefined}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-2 rounded-lg border text-sm transition ${
              currentPage === totalPages
                ? "cursor-not-allowed opacity-50 border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500"
                : "border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
            }`}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>
    );
  };
  // -------------------------------------------------------------------------

  return (
    <div className="w-full bg-white dark:bg-gray-800 min-h-screen p-4">
      {/* Header */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Live Market Data
          </h1>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm
              transition-all duration-200 shadow-sm border
              ${
                isRefreshing
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed border-gray-200 dark:border-gray-600"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500"
              }
            `}
          >
            <svg
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex dark:text-white items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            Live ({shares.length} stocks)
          </div>
          <div>{<Clock />}</div>
        </div>
      </div>

      {/* Market Grid */}
      <div
        id="market-grid-top"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {pagedShares.map((share) => {
          if (!share.lastHistory || !share.shareId) return null;

          const currentPrice = share.price || share.lastHistory.close;
          const openPrice = share.lastHistory.open;
          const changeAmount = currentPrice - openPrice;
          const changePercent = calculatePercentageChange(
            currentPrice,
            openPrice
          );
          const isPositive = changeAmount >= 0;
          const symbol = getShareSymbol(share.sharename);
          const animation = priceAnimations[share.shareId] || "";

          return (
            <div
              onClick={() => navigate(`/bazaar/market/${share.shareId}`)}
              key={share.shareId}
              className={`cursor-pointer
                bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700
                hover:shadow-xl transition-all duration-300 p-4 relative overflow-hidden
              `}
            >
              {/* Flash animation overlay */}
              {/* <div
                className={`
                absolute inset-0 pointer-events-none transition-opacity duration-300
                ${animation === "increase" ? "bg-green-400 opacity-10" : ""}
                ${animation === "decrease" ? "bg-red-400 opacity-10" : ""}
                ${!animation ? "opacity-0" : ""}
              `}
              ></div> */}

              {/* Symbol Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    {symbol}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {share.sharename}
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(share.lastHistory.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <img loading="eager" className="h-10 rounded w-10" src={share.Image} />
                {/* <div
                  className={`
                  px-2 py-1 rounded-full text-xs font-medium flex items-center
                  ${
                    isPositive
                      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                      : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                  }
                `}
                >
                  {isPositive ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                </div> */}
              </div>

              {/* Current Price */}
              <div
                className={`
                text-2xl font-bold mb-2 transition-all duration-300
                ${
                  isPositive
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }
              `}
              >
                {formatCurrency(currentPrice)}
              </div>

              {/* Change Amount and Percentage */}
              <div className="flex justify-between items-center mb-3">
                <div
                  className={`
                  text-sm font-medium
                  ${
                    isPositive
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }
                `}
                >
                  {isPositive ? "+" : ""}
                  {formatPrice(Math.abs(changeAmount))}
                </div>
                <div
                  className={`
                  text-sm font-bold px-2 py-1 rounded
                  ${
                    isPositive
                      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                      : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                  }
                `}
                >
                  {formatPercentage(changePercent)}
                </div>
              </div>

              {/* OHLC Data */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Open:
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    ₹{formatPrice(share.lastHistory.open)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    High:
                  </span>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    ₹{formatPrice(share.lastHistory.high)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Low:</span>
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    ₹{formatPrice(share.lastHistory.low)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Close:
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    ₹{formatPrice(share.lastHistory.close)}
                  </span>
                </div>
              </div>

              {/* Tick Data */}
              {share.lastHistory.ticks &&
                share.lastHistory.ticks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Recent Ticks:
                    </div>
                    <div className="space-y-1">
                      {share.lastHistory.ticks
                        .slice(-2)
                        .map((tick, tickIndex) => (
                          <div
                            key={tickIndex}
                            className="flex justify-between text-xs"
                          >
                            <span className="text-gray-400 dark:text-gray-500">
                              {new Date(tick.time).toLocaleTimeString()}
                            </span>
                            <span className="text-gray-900 dark:text-white">
                              ₹{formatPrice(tick.changesprice)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              {/* Share ID for debugging */}
              {/* <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                ID: {share.shareId.slice(-8)}
              </div> */}
            </div>
          );
        })}
      </div>

      {/* Loading State with Skeleton Cards */}
      {shares.length === 0 && !isRefreshing && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* No Data State with Skeleton Cards */}
      {shares.length === 0 && isRefreshing && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <Pagination />
    </div>
  );
};

export default ChartComponent;
