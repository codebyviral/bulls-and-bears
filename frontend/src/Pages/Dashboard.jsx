// src/pages/Dashboard.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { io } from "socket.io-client";
import {
  TrendingUp,
  TrendingDown,
  Loader,
  Ellipsis,
  LoaderCircle,
} from "lucide-react";

import {
  CustomSidebar,
  RollingNumber,
  SearchBar,
  ChartComponent,
  News,
} from "../Components";
import { formatCurrency } from "../utils/formatCurrency";
import { calculatePercentageChange } from "../utils/percentChange";
import { getRealizedPL, getUser } from "../Services";
import { userAuthenticatedStore } from "../store";
import bnblogo from "../assets/bnblogo.png";
import throttle from "lodash/throttle";
import { getSocket } from "../lib/socket";

// Skeleton loader component for marquee
const MarqueeSkeleton = () => {
  return (
    <div className="inline-flex items-center space-x-3 mx-6 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 whitespace-nowrap animate-pulse">
      <div className="flex items-center space-x-2">
        <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        <div className="w-12 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="w-12 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
    </div>
  );
};

// --- UI bits (unchanged except showing RPL/URPL) ---
const MarqueeStockItem = ({ share, onNavigate }) => {
  if (!share?.lastHistory || !share?.shareId) return null;

  const currentPrice = Number(share.price ?? share.lastHistory.close);
  const openPrice = Number(share.lastHistory.open);
  const changeAmount = currentPrice - openPrice;
  const changePercent = calculatePercentageChange(currentPrice, openPrice);
  const isPositive = changeAmount >= 0;
  const symbol = share.symbol;

  return (
    <div
      className={`inline-flex items-center space-x-3 mx-6 px-4 py-2 rounded-lg border transition-all duration-300 whitespace-nowrap cursor-pointer
          ${
            isPositive
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30"
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30"
          }
        `}
      onClick={() => {
        onNavigate(share.shareId);
      }}
    >
      <div className="flex items-center space-x-2">
        <div
          className={`p-1 rounded-full ${
            isPositive
              ? "bg-green-100 dark:bg-green-800"
              : "bg-red-100 dark:bg-red-800"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-600 dark:text-red-400" />
          )}
        </div>
        <span className="font-semibold text-gray-900 dark:text-white text-sm">
          {symbol}
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <span
          className={`font-bold text-sm ${
            isPositive
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {formatCurrency(currentPrice)}
        </span>
        <span
          className={`text-xs px-1.5 py-0.5 rounded ${
            isPositive
              ? "bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300"
              : "bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300"
          }`}
        >
          {isPositive ? "+" : ""}
          {Number.isFinite(changePercent) ? changePercent.toFixed(2) : "0.00"}%
        </span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const throttledEmitRef = useRef(null);

  // --- UI state ---
  const [balance, setBalance] = useState(0);
  const [positions, setPositions] = useState(0);
  const [shares, setShares] = useState([]);
  const [previousPrices, setPreviousPrices] = useState({});
  const [priceAnimations, setPriceAnimations] = useState({});
  // null = "not loaded yet" (show spinner), any number incl. 0 = loaded.
  // Previously these started at 0 and the UI checked `realizedPL ? ... : <Spinner/>`,
  // which is truthy-falsy — so a genuinely-zero P/L (new user, or a break-even
  // trader) rendered the loading spinner FOREVER. That was the actual bug
  // behind "realized P/L is taking time for loading".
  const [realizedPL, setRealizedPL] = useState(null);
  const [unrealizedPL, setUnrealizedPL] = useState(null);
  const [isMarqueeLoading, setIsMarqueeLoading] = useState(true);

  // --- auth/user state ---
  const userId = userAuthenticatedStore((s) => s.userId);
  const isLoggedIn = userAuthenticatedStore((s) => s.isAuthenticated);

  // --- data fetch for user (balance, positions) ---
  const { isPending, data } = useQuery({
    queryKey: ["balance", userId],
    queryFn: () => getUser(userId),
    enabled: !!userId,
  });

  const navigate = useNavigate();

  // keep UI metrics in sync with user fetch
  useEffect(() => {
    if (!data?.user) return;
    if (data?.user?.isVerified === false) navigate("/verify-user");
  }, []);

  useEffect(() => {
    if (!data?.user) return;
    setBalance(Number(data.user.TotalBalance ?? 0));
    setPositions(data.user.portfolio?.length ?? 0);
  }, [data, navigate]);

  useEffect(() => {
    const socket = getSocket();

    throttledEmitRef.current = throttle((priceMap, uid) => {
      socket.emit("market_prices", {
        livePrices: priceMap,
        userId: uid,
      });
    }, 400);

    // ---- live prices feed ----
    const onShareLivePrice = (payload) => {
      // Normalize payload to an array
      const items = Array.isArray(payload) ? payload : [payload];

      // Keep your animation logic
      setPreviousPrices((prev) => {
        const next = { ...prev };
        for (const share of items) {
          if (share?.lastHistory && share?.shareId) {
            const currentPrice = Number(share.price ?? share.lastHistory.close);
            const prevPrice = next[share.shareId];

            if (
              Number.isFinite(currentPrice) &&
              prevPrice !== undefined &&
              prevPrice !== currentPrice
            ) {
              setPriceAnimations((prevAnim) => ({
                ...prevAnim,
                [share.shareId]:
                  currentPrice > prevPrice ? "increase" : "decrease",
              }));
              setTimeout(() => {
                setPriceAnimations((prevAnim) => ({
                  ...prevAnim,
                  [share.shareId]: "",
                }));
              }, 600);
            }
            if (Number.isFinite(currentPrice))
              next[share.shareId] = currentPrice;
          }
        }
        return next;
      });

      setShares(items);
      setIsMarqueeLoading(false); // Hide skeleton once data loads

      // Build the map the backend expects: { [sharename]: price }
      const priceMap = {};
      for (const s of items) {
        const name =
          typeof s?.sharename === "string" ? s.sharename.trim() : s?.sharename;
        const priceNum = Number(s?.price ?? s?.lastHistory?.close);
        if (name && Number.isFinite(priceNum)) {
          priceMap[name] = priceNum;
        }
      }

      // Emit once per tick; server will compute and emit RPL/URPL
      throttledEmitRef.current?.(priceMap, userId);
    };

    // ---- combined realized + unrealized P/L, pushed by the server every
    // 1s (plus instantly on connect and right after any trade) — see
    // backend utils/plCache.js. This replaces the old client-driven flow
    // where the client had to emit "market_prices" to get an update.
    const onPlUpdate = ({ realizedPL: rpl, unrealizedPL: urpl, balance: newBalance }) => {
      setRealizedPL(Number(rpl ?? 0));
      setUnrealizedPL(Number(urpl ?? 0));
      if (newBalance !== undefined) setBalance(Number(newBalance ?? 0));
    };

    // Legacy separate events, still emitted by the backend for
    // backwards-compatibility — kept here so nothing regresses if the
    // combined event is ever missed.
    const onRplUpdate = ({ realizedPL: rpl }) =>
      setRealizedPL(Number(rpl ?? 0));
    const onUrplUpdate = ({ unrealizedPL: urpl, balance: newBalance }) => {
      setUnrealizedPL(Number(urpl ?? 0));
      if (newBalance !== undefined) setBalance(Number(newBalance ?? 0));
    };

    // ---- errors & disconnects ----
    const onConnectError = (err) =>
      console.error("❌ Socket connect error:", err);
    const onDisconnect = (reason) => console.log("🔌 Disconnected:", reason);
    const onConnect = () => console.log("connected", socket.id);

    // register listeners
    socket.on("connect", onConnect);
    socket.on("shareliveprice", onShareLivePrice);
    socket.on("pl_update", onPlUpdate);
    socket.on("rpl_update", onRplUpdate);
    socket.on("unpl_update", onUrplUpdate);
    socket.on("connect_error", onConnectError);
    socket.on("disconnect", onDisconnect);

    // cleanup
    return () => {
      throttledEmitRef.current?.cancel();

      socket.off("connect", onConnect);
      socket.off("shareliveprice", onShareLivePrice);
      socket.off("pl_update", onPlUpdate);
      socket.off("rpl_update", onRplUpdate);
      socket.off("unpl_update", onUrplUpdate);
      socket.off("connect_error", onConnectError);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  useEffect(() => {
    if (!userId) return;

    const socket = getSocket();

    if (socket.connected) {
      socket.emit("registerUser", userId);
    } else {
      socket.once("connect", () => socket.emit("registerUser", userId));
    }
  }, [userId]);

  const fetchRealizedProfit = async () => {
    const res = await getRealizedPL(userId);
    setRealizedPL(res?.data?.realizedPL);
  };

  useEffect(() => {
    if (!userId) return;
    fetchRealizedProfit();
  }, [userId]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <CustomSidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        <div className="p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  <img
                    onClick={() => navigate("/")}
                    src={bnblogo}
                    alt="Brand Logo"
                    className="w-16 sm:w-20 lg:w-32 h-auto cursor-pointer hover:opacity-80 transition-opacity duration-300"
                  />
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      Bazaar 8.0 💸
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                      Welcome to your trading dashboard
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Stock Marquee */}
              <div className="mb-6 sm:mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      Market Feed
                    </h3>
                  </div>
                </div>
                <div className="relative py-3 overflow-hidden">
                  {isMarqueeLoading ? (
                    // Skeleton Loader
                    <div className="marquee-track flex w-max items-center gap-0 will-change-transform animate-marquee">
                      {Array.from({ length: 8 }).map((_, index) => (
                        <MarqueeSkeleton key={`skeleton-a-${index}`} />
                      ))}
                      <div
                        className="flex items-center gap-0"
                        aria-hidden="true"
                      >
                        {Array.from({ length: 8 }).map((_, index) => (
                          <MarqueeSkeleton key={`skeleton-b-${index}`} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Actual Data
                    <div className="marquee-track flex w-max items-center gap-0 will-change-transform animate-marquee">
                      {shares.map((share, index, id) => (
                        <MarqueeStockItem
                          key={`${share.shareId}-a-${index}`}
                          share={share}
                          onNavigate={(id) => navigate(`/bazaar/market/${id}`)}
                        />
                      ))}
                      <div
                        className="flex items-center gap-0"
                        aria-hidden="true"
                      >
                        {shares.map((share, index, id) => (
                          <MarqueeStockItem
                            key={`${share.shareId}-b-${index}`}
                            share={share}
                            onNavigate={(id) =>
                              navigate(`/bazaar/market/${id}`)
                            }
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Search Bar */}
              <div className="my-2 mb-4">
                <SearchBar
                  shares={shares}
                  onSelectShare={(share) =>
                    navigate(`/bazaar/market/${share.shareId}`)
                  }
                />
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Portfolio Value */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Portfolio Value
                </h3>
                <p className="text-xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                  {isLoggedIn ? (
                    <RollingNumber
                      value={Number(balance ?? 0)}
                      spinning={isPending}
                      padWhileSpinning={6}
                      duration={700}
                      stagger={80}
                    />
                  ) : (
                    0
                  )}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Trading Summary
                </p>
              </div>

              {/* Active Positions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Active Positions
                </h3>
                <p className="text-xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {isLoggedIn ? positions : 0}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  since last trade
                </p>
              </div>

              {/* Today / Live P&L snapshot */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                {isLoggedIn ? (
                  <>
                    {" "}
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      All-Time P&L
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">
                          Realized P/L
                        </span>
                        <span
                          className={`font-semibold ${
                            realizedPL >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {realizedPL !== null ? (
                            formatCurrency(realizedPL)
                          ) : (
                            <>
                              <div className="animate-[spin_0.7s_linear_infinite]">
                                <LoaderCircle size={20} />
                              </div>
                            </>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">
                          Unrealized P/L
                        </span>
                        <span
                          className={`font-semibold ${
                            unrealizedPL >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {unrealizedPL !== null ? (
                            formatCurrency(unrealizedPL)
                          ) : (
                            <div className="animate-[spin_0.7s_linear_infinite]">
                              <LoaderCircle size={20} />
                            </div>
                          )}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      All-Time P&L
                    </h3>

                    <div className="space-y-2">
                      {/* Realized P/L */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">
                          Realized P/L
                        </span>

                        {isLoggedIn ? (
                          <span
                            className={`font-semibold ${
                              realizedPL >= 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {realizedPL !== null ? (
                              formatCurrency(realizedPL)
                            ) : (
                              <div className="animate-spin">
                                <LoaderCircle size={20} />
                              </div>
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">
                            sign in to view
                          </span>
                        )}
                      </div>

                      {/* Unrealized P/L */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">
                          Unrealized P/L
                        </span>

                        {isLoggedIn ? (
                          <span
                            className={`font-semibold ${
                              unrealizedPL >= 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {unrealizedPL !== null ? (
                              formatCurrency(unrealizedPL)
                            ) : (
                              <div className="animate-spin">
                                <LoaderCircle size={20} />
                              </div>
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">
                            sign in to view
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Chart Container */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Market Overview
                </h3>
              </div>
              <div className="w-full overflow-hidden">
                <ChartComponent />
              </div>
              <hr className="border-t border-gray-200 dark:border-gray-700" />
              <div className="news-component">
                {/* <hr className="w-full dark:text-white" /> */}
                <News />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
