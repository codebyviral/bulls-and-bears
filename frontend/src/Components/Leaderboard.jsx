import React, { useState, useEffect, useRef } from "react";
import {
  Crown,
  TrendingUp,
  Users,
  RefreshCw,
  Trophy,
  Medal,
  Award,
  Activity,
} from "lucide-react";
import { useDarkModeStore } from "../store";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

const Leaderboard = () => {
  const [topUsers, setTopUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isConnected, setIsConnected] = useState(false);
  const [countdown, setCountdown] = useState(8);
  const [animatingUsers, setAnimatingUsers] = useState(new Set());
  const socketRef = useRef(null);
  const refreshIntervalRef = useRef(null);
  const previousUsersRef = useRef([]);

  const { globalDarkState } = useDarkModeStore();

  // Auto refresh mechanism - every 8 seconds
  useEffect(() => {
    if (isConnected && socketRef.current) {
      // Clear existing interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }

      // Set up refresh interval
      refreshIntervalRef.current = setInterval(() => {
        if (socketRef.current && socketRef.current.connected) {
          setIsRefreshing(true);
          // Request fresh data from server
          socketRef.current.emit("request-top-users");

          // Reset refreshing state after a short delay
          setTimeout(() => {
            setIsRefreshing(false);
          }, 1000);
        }
      }, 8000);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [isConnected]);

  // Countdown timer for UI feedback
  useEffect(() => {
    if (countdown > 0 && isConnected) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && isConnected) {
      setCountdown(8);
    }
  }, [countdown, isConnected]);

  // Real Socket Integration
  useEffect(() => {
    const socket = io(import.meta.env.VITE_BACKEND_URL, {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to socket server");
      setIsConnected(true);
      setCountdown(8);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
      setIsLoading(false);
    });

    socket.on("top-user", (topuser) => {
      console.log("top user data", topuser);

      if (Array.isArray(topuser)) {
        // Ensure exactly 20 users
        const sortedUsers = topuser
          .sort((a, b) => b.TotalBalance - a.TotalBalance)
          .slice(0, 20);

        // Track which users are animating
        const animating = new Set();
        sortedUsers.forEach((user) => {
          if (user.rankChange !== 0 || user.balanceChange !== 0) {
            animating.add(user._id);
          }
        });

        setAnimatingUsers(animating);
        setTopUsers(sortedUsers);
        previousUsersRef.current = sortedUsers;
        setLastUpdated(new Date());
        setIsLoading(false);
        setIsRefreshing(false);
        setCountdown(8);

        // Clear animation after 2 seconds
        setTimeout(() => {
          setAnimatingUsers(new Set());
        }, 2000);
      }
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("top-user");
      socket.off("error");
      socket.disconnect();
    };
  }, []);

  // Format balance function
  const formatBalance = (balance) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(balance);
  };

  // Simple skeleton loader components
  const SkeletonPodium = () => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`p-6 rounded-lg animate-pulse ${
            globalDarkState ? "bg-slate-800" : "bg-gray-100"
          }`}
        >
          <div
            className={`w-20 h-6 mx-auto mb-4 rounded ${
              globalDarkState ? "bg-slate-700" : "bg-gray-200"
            }`}
          ></div>
          <div
            className={`w-32 h-8 mx-auto rounded ${
              globalDarkState ? "bg-slate-700" : "bg-gray-200"
            }`}
          ></div>
        </div>
      ))}
    </div>
  );

  const SkeletonRow = () => (
    <div
      className={`px-6 py-4 animate-pulse ${
        globalDarkState ? "bg-slate-800/30" : "bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div
            className={`w-10 h-10 rounded ${
              globalDarkState ? "bg-slate-700" : "bg-gray-200"
            }`}
          ></div>
          <div className="flex-1">
            <div
              className={`w-32 h-5 mb-2 rounded ${
                globalDarkState ? "bg-slate-700" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`w-48 h-4 rounded ${
                globalDarkState ? "bg-slate-700" : "bg-gray-200"
              }`}
            ></div>
          </div>
        </div>
        <div
          className={`w-24 h-6 rounded ${
            globalDarkState ? "bg-slate-700" : "bg-gray-200"
          }`}
        ></div>
      </div>
    </div>
  );

  const SkeletonTable = () => (
    <div
      className={`rounded-lg border ${
        globalDarkState
          ? "bg-slate-800 border-slate-700"
          : "bg-white border-gray-300"
      }`}
    >
      <div
        className={`px-6 py-4 border-b ${
          globalDarkState ? "border-slate-700" : "border-gray-300"
        }`}
      >
        <div
          className={`w-48 h-6 rounded animate-pulse ${
            globalDarkState ? "bg-slate-700" : "bg-gray-200"
          }`}
        ></div>
      </div>
      <div
        className={`divide-y ${
          globalDarkState ? "divide-slate-700" : "divide-gray-200"
        }`}
      >
        {Array.from({ length: 20 }, (_, index) => (
          <SkeletonRow key={index} />
        ))}
      </div>
    </div>
  );

  const getRankBadgeColor = (rank) => {
    if (rank === 1)
      return globalDarkState
        ? "bg-slate-700 text-yellow-400 border border-slate-600"
        : "bg-gray-100 text-yellow-600 border border-gray-300";
    if (rank === 2)
      return globalDarkState
        ? "bg-slate-700 text-gray-300 border border-slate-600"
        : "bg-gray-100 text-gray-500 border border-gray-300";
    if (rank === 3)
      return globalDarkState
        ? "bg-slate-700 text-amber-400 border border-slate-600"
        : "bg-gray-100 text-amber-600 border border-gray-300";
    return globalDarkState
      ? "bg-slate-700 text-slate-300 border border-slate-600"
      : "bg-gray-100 text-gray-700 border border-gray-300";
  };

  const getRowBackground = (rank, isAnimating, rankChange) => {
    if (isAnimating) {
      if (rankChange > 0) {
        return globalDarkState
          ? "bg-green-900/30 animate-pulse"
          : "bg-green-50 animate-pulse";
      } else if (rankChange < 0) {
        return globalDarkState
          ? "bg-red-900/30 animate-pulse"
          : "bg-red-50 animate-pulse";
      }
    }
    if (rank <= 3) {
      return globalDarkState ? "bg-slate-800/50" : "bg-gray-50";
    }
    return "";
  };

  if (isLoading || (isConnected && topUsers.length === 0)) {
    return (
      <div
        className={`min-h-screen ${
          globalDarkState ? "bg-slate-900" : "bg-gray-50"
        }`}
      >
        <div
          className={`border-b ${
            globalDarkState
              ? "bg-slate-900 border-slate-700"
              : "bg-white border-gray-300"
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1
                  className={`text-2xl font-semibold ${
                    globalDarkState ? "text-white" : "text-gray-900"
                  }`}
                >
                  Trading Leaderboard
                </h1>
                <p
                  className={`text-sm mt-1 ${
                    globalDarkState ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Loading data...
                </p>
              </div>
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded ${
                  globalDarkState
                    ? "bg-slate-800 border border-slate-700"
                    : "bg-white border border-gray-300"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span
                  className={`text-sm ${
                    globalDarkState ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Loading
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <SkeletonPodium />
          <SkeletonTable />
        </div>
      </div>
    );
  }

  if (!isConnected && topUsers.length === 0) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          globalDarkState ? "bg-slate-900" : "bg-gray-50"
        }`}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p
            className={`text-xl font-semibold ${
              globalDarkState ? "text-white" : "text-gray-900"
            }`}
          >
            Connection Failed
          </p>
          <p
            className={`text-sm mt-2 ${
              globalDarkState ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Unable to establish connection
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        globalDarkState ? "bg-slate-900" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <div
        className={`border-b ${
          globalDarkState
            ? "bg-slate-900 border-slate-700"
            : "bg-white border-gray-300"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className={`text-2xl font-semibold ${
                  globalDarkState ? "text-white" : "text-gray-900"
                }`}
              >
                Trading Leaderboard
              </h1>
              <p
                className={`text-sm mt-1 ${
                  globalDarkState ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Top 20 traders by portfolio value
              </p>
            </div>
            <div
              className={`text-sm ${
                globalDarkState ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Top 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {topUsers.slice(0, 3).map((user, index) => {
            const rank = index + 1;
            const isAnimating = animatingUsers.has(user._id);
            const balanceChange = user.balanceChange || 0;

            return (
              <div
                key={user._id}
                className={`p-6 rounded-lg border transition-all duration-500 ${
                  globalDarkState
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-gray-300"
                } ${
                  isAnimating && balanceChange > 0
                    ? "shadow-lg shadow-green-500/50 scale-105"
                    : isAnimating && balanceChange < 0
                    ? "shadow-lg shadow-red-500/50 scale-95"
                    : ""
                }`}
              >
                <div className="text-center">
                  <div
                    className={`inline-block px-3 py-1 rounded text-sm font-medium mb-4 ${getRankBadgeColor(
                      rank
                    )}`}
                  >
                    Rank #{rank}
                  </div>
                  <h3
                    className={`font-semibold text-lg mb-2 ${
                      globalDarkState ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {user.fullName}
                  </h3>
                  <p
                    className={`text-2xl font-semibold transition-all duration-500 ${
                      isAnimating && balanceChange > 0
                        ? "text-green-500 scale-110"
                        : isAnimating && balanceChange < 0
                        ? "text-red-500 scale-90"
                        : rank === 1
                        ? "text-yellow-500"
                        : rank === 2
                        ? "text-gray-400"
                        : "text-amber-500"
                    }`}
                  >
                    {formatBalance(user.TotalBalance)}
                  </p>
                  {isAnimating && balanceChange !== 0 && (
                    <p
                      className={`text-sm font-medium mt-1 ${
                        balanceChange > 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {balanceChange > 0 ? "+" : ""}
                      {formatBalance(balanceChange)}
                    </p>
                  )}
                  <p
                    className={`text-sm mt-1 ${
                      globalDarkState ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Portfolio Value
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Full Rankings Table */}
        <div
          className={`rounded-lg border ${
            globalDarkState
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-gray-300"
          }`}
        >
          <div
            className={`px-6 py-4 border-b ${
              globalDarkState ? "border-slate-700" : "border-gray-300"
            }`}
          >
            <h2
              className={`text-lg font-semibold ${
                globalDarkState ? "text-white" : "text-gray-900"
              }`}
            >
              All Rankings
            </h2>
          </div>

          <div
            className={`divide-y ${
              globalDarkState ? "divide-slate-700" : "divide-gray-200"
            }`}
          >
            {topUsers.map((user, index) => {
              const rank = index + 1;
              const isAnimating = animatingUsers.has(user._id);
              const rankChange = user.rankChange || 0;
              const balanceChange = user.balanceChange || 0;

              return (
                <div
                  key={user._id}
                  className={`px-6 py-4 flex items-center justify-between transition-all duration-500 ${getRowBackground(
                    rank,
                    isAnimating,
                    rankChange
                  )} ${
                    isAnimating && rankChange > 0
                      ? "transform -translate-y-1"
                      : isAnimating && rankChange < 0
                      ? "transform translate-y-1"
                      : ""
                  }`}
                  style={{
                    boxShadow:
                      isAnimating && rankChange > 0
                        ? "0 0 20px rgba(34, 197, 94, 0.3)"
                        : isAnimating && rankChange < 0
                        ? "0 0 20px rgba(239, 68, 68, 0.3)"
                        : "none",
                  }}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`w-10 h-10 rounded flex items-center justify-center text-sm font-medium relative ${getRankBadgeColor(
                        rank
                      )}`}
                    >
                      #{rank}
                      {isAnimating && rankChange !== 0 && (
                        <div
                          className={`absolute -top-2 -right-2 text-xs font-bold ${
                            rankChange > 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {rankChange > 0
                            ? `↑${rankChange}`
                            : `↓${Math.abs(rankChange)}`}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        className={`font-medium text-base ${
                          globalDarkState ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {user.fullName}
                      </h3>
                      <p
                        className={`text-sm ${
                          globalDarkState ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {user.Email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <p
                        className={`text-lg font-semibold transition-all duration-500 ${
                          isAnimating && balanceChange > 0
                            ? "text-green-500 scale-110"
                            : isAnimating && balanceChange < 0
                            ? "text-red-500 scale-110"
                            : globalDarkState
                            ? "text-green-400"
                            : "text-green-600"
                        }`}
                      >
                        {formatBalance(user.TotalBalance)}
                      </p>
                      {isAnimating && balanceChange !== 0 && (
                        <span
                          className={`text-sm font-medium ${
                            balanceChange > 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {balanceChange > 0 ? "+" : ""}
                          {formatBalance(balanceChange)}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-sm ${
                        globalDarkState ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Portfolio Value
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
