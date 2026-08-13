import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Wallet,
  Users,
  Settings,
  User,
  ChevronRight,
  Activity,
  LogOut,
  Menu,
  X,
  PlayCircle,
  Link as LinkIcon,
  CalendarRange,
  Delete,
} from "lucide-react";
import { Link } from "react-router-dom";
import io from "socket.io-client";

export default function StockMarketDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showLogout, setShowLogout] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [addBalanceAmount, setAddBalanceAmount] = useState("");
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState("");
  const [balanceSuccess, setBalanceSuccess] = useState("");
  const [currentMarketMode, setCurrentMarketMode] = useState("neutral");
  const [isLoadingMarket, setIsLoadingMarket] = useState(false);
  const [marketError, setMarketError] = useState("");
  const [marketSuccess, setMarketSuccess] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isBreak, setIsBreak] = useState(false);
  const [gameControlLoading, setGameControlLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [searchQuery, setSearchQuery] = useState("");

  const menuItems = [
    { id: "dashboard", icon: Users, label: "All Users" },
    { id: "addmoney", icon: Wallet, label: "Add Money" },
    { id: "market", icon: Activity, label: "Market Trends" },
    { id: "gamecontrol", icon: PlayCircle, label: "Start/Stop Game" },
    {
      id: "ipo",
      icon: CalendarRange,
      label: "IPO",
      isLink: true,
      path: "/ipo",
    },
    {
      id: "news",
      icon: LinkIcon,
      label: "Set News",
      isLink: true,
      path: "/news",
    },
    {
      id: "delete",
      icon: Delete,
      label: "Delete Candle Data",
      isLink: true,
      path: "/delete-candlestick-data",
    },
  ];

  // Get user email from localStorage on mount and initialize socket
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    // Decode JWT to get email (simple decode without verification)
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      const decoded = JSON.parse(jsonPayload);
      setUserEmail(decoded.email || "admin@example.com");
    } catch (error) {
      console.error("Error decoding token:", error);
      setUserEmail("admin@example.com");
    }

    // Initialize Socket.IO connection
    const newSocket = io(`${import.meta.env.VITE_BACKEND_URL}`, {
      auth: {
        token: token,
      },
    });

    newSocket.on("connect", () => {
      console.log("Socket connected");
    });

    newSocket.on("break_state", ({ isBreak: breakState }) => {
      setIsBreak(breakState);
      console.log("Break state received:", breakState);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      setUsersError("");

      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/alluser`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (response.ok && data.users) {
          setUsers(data.users);
        } else {
          setUsersError(data.message || "Failed to fetch users");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsersError("Network error. Please check your connection.");
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("isAdmin");
    window.location.href = "/login";
  };

  const handleAddBalance = async () => {
    setBalanceError("");
    setBalanceSuccess("");

    if (!addBalanceAmount || parseFloat(addBalanceAmount) <= 0) {
      setBalanceError("Please enter a valid amount");
      return;
    }

    setIsLoadingBalance(true);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/trade/addtoallbalance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            balance: parseFloat(addBalanceAmount),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setBalanceSuccess(
          `Successfully added ₹${parseFloat(
            addBalanceAmount
          ).toLocaleString()} to all users!`
        );
        setAddBalanceAmount("");
      } else {
        setBalanceError(
          data.message || "Failed to add balance. Please try again."
        );
      }
    } catch (err) {
      console.error("Add balance error:", err);
      setBalanceError("Network error. Please check your connection.");
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleMarketModeChange = async (mode) => {
    setMarketError("");
    setMarketSuccess("");
    setIsLoadingMarket(true);

    try {
      const token = localStorage.getItem("authToken");
      const strength = mode === "neutral" ? 0 : 1;

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/share/marketTrend`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            mode: mode,
            strength: strength,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setCurrentMarketMode(mode);
        setMarketSuccess(
          `Market mode changed to ${mode.toUpperCase()} successfully!`
        );
        setTimeout(() => setMarketSuccess(""), 3000);
      } else {
        setMarketError(
          data.message || "Failed to change market mode. Please try again."
        );
      }
    } catch (err) {
      console.error("Market mode error:", err);
      setMarketError("Network error. Please check your connection.");
    } finally {
      setIsLoadingMarket(false);
    }
  };

  const handleGameControl = (start) => {
    if (!socket) {
      console.error("Socket not connected");
      return;
    }

    setGameControlLoading(true);
    socket.emit("toggle_break");

    // Reset loading state after a short delay
    setTimeout(() => {
      setGameControlLoading(false);
    }, 500);
  };

  // Filter and sort users
  const filteredAndSortedUsers = users
    .filter((user) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        user.fullName?.toLowerCase().includes(query) ||
        user.Email?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return (a.fullName || "").localeCompare(b.fullName || "");
        case "name-desc":
          return (b.fullName || "").localeCompare(a.fullName || "");
        case "balance-high":
          return (b.TotalBalance || 0) - (a.TotalBalance || 0);
        case "balance-low":
          return (a.TotalBalance || 0) - (b.TotalBalance || 0);
        default:
          return 0;
      }
    });

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-24 w-24">
                <img src="public\bnblogo.png" alt="error" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Bazaar</h1>
                <p className="text-xs text-gray-500">Trade Smarter</p>
              </div>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (item.isLink) {
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight className="w-5 h-5 ml-auto" />}
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false); // Close sidebar on mobile after selection
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight className="w-5 h-5 ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom Menu */}

        {/* User Profile with Logout */}
        <div className="p-4 border-t border-gray-200 relative">
          <button
            onClick={() => setShowLogout(!showLogout)}
            className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-sm text-gray-800">Admin</div>
              <div className="text-xs text-gray-500 truncate">{userEmail}</div>
            </div>
          </button>

          {showLogout && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 w-full">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-700 hover:text-gray-900 mr-4"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
                {activeTab === "dashboard"
                  ? "All Users"
                  : activeTab === "addmoney"
                  ? "Add Money"
                  : activeTab === "market"
                  ? "Market Trends"
                  : "Game Control"}
              </h2>
              <p className="text-sm lg:text-base text-gray-600 mt-1">
                {activeTab === "dashboard"
                  ? "Manage and monitor all users"
                  : activeTab === "addmoney"
                  ? "Fund management system"
                  : activeTab === "market"
                  ? "Bazaar market control"
                  : "Start or stop the trading game"}
              </p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 lg:p-6">
          {activeTab === "dashboard" && (
            <div>
              {/* Search and Filter Controls */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search Input */}
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Sort Dropdown */}
                  <div className="w-full sm:w-48">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="name-asc">Name (A-Z)</option>
                      <option value="name-desc">Name (Z-A)</option>
                      <option value="balance-high">Balance (High-Low)</option>
                      <option value="balance-low">Balance (Low-High)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {usersError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-600 text-sm">{usersError}</p>
                </div>
              )}

              {/* Loading State */}
              {isLoadingUsers ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading users...</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Mobile: Card View */}
                  <div className="block lg:hidden divide-y divide-gray-200">
                    {filteredAndSortedUsers.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        No users found
                      </div>
                    ) : (
                      filteredAndSortedUsers.map((user) => (
                        <div key={user._id} className="p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 min-w-0 pr-2">
                              <div className="text-sm font-medium text-gray-800 truncate">
                                {user.fullName}
                              </div>
                              <div className="text-xs text-gray-600 truncate">
                                {user.Email}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-semibold text-gray-800">
                            ₹{(user.TotalBalance || 0).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Desktop: Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                            Name
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                            Email
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                            Balance
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredAndSortedUsers.length === 0 ? (
                          <tr>
                            <td
                              colSpan="3"
                              className="px-6 py-12 text-center text-gray-500"
                            >
                              No users found
                            </td>
                          </tr>
                        ) : (
                          filteredAndSortedUsers.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                {user.fullName}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {user.Email}
                              </td>
                              <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                                ₹{(user.TotalBalance || 0).toLocaleString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "addmoney" && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8">
                <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-6">
                  Add Funds to All Users
                </h3>

                {balanceError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-red-600 text-sm">{balanceError}</p>
                  </div>
                )}

                {balanceSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-green-600 text-sm">{balanceSuccess}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={addBalanceAmount}
                      onChange={(e) => setAddBalanceAmount(e.target.value)}
                      placeholder="Enter amount to add"
                      disabled={isLoadingBalance}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleAddBalance}
                    disabled={isLoadingBalance}
                    className={`w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-3 font-semibold mt-6 ${
                      isLoadingBalance ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoadingBalance
                      ? "Adding Money..."
                      : "Add Money to All Users"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "market" && (
            <div className="max-w-4xl mx-auto">
              {marketError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-600 text-sm">{marketError}</p>
                </div>
              )}

              {marketSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 animate-pulse">
                  <p className="text-green-600 text-sm">{marketSuccess}</p>
                </div>
              )}

              <div className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-800 mb-2 text-center">
                  Market Mode Control
                </h3>
                <p className="text-sm lg:text-base text-gray-600 mb-6 lg:mb-8 text-center">
                  Select the current market trend
                </p>

                {/* Current Status Display */}
                <div
                  className={`mb-6 lg:mb-8 p-4 lg:p-6 rounded-xl text-center transition-all duration-500 ${
                    currentMarketMode === "bull"
                      ? "bg-green-100 border-2 border-green-500"
                      : currentMarketMode === "bear"
                      ? "bg-red-100 border-2 border-red-500"
                      : "bg-gray-100 border-2 border-gray-400"
                  }`}
                >
                  <div className="text-xs lg:text-sm font-semibold text-gray-600 mb-2">
                    CURRENT MARKET MODE
                  </div>
                  <div
                    className={`text-2xl lg:text-4xl font-bold ${
                      currentMarketMode === "bull"
                        ? "text-green-600"
                        : currentMarketMode === "bear"
                        ? "text-red-600"
                        : "text-gray-700"
                    }`}
                  >
                    {currentMarketMode === "bull"
                      ? "🐂 BULL MARKET"
                      : currentMarketMode === "bear"
                      ? "🐻 BEAR MARKET"
                      : "⚖️ NEUTRAL"}
                  </div>
                  <div
                    className={`mt-2 text-xs lg:text-sm ${
                      currentMarketMode === "bull"
                        ? "text-green-700"
                        : currentMarketMode === "bear"
                        ? "text-red-700"
                        : "text-gray-600"
                    }`}
                  >
                    {currentMarketMode === "bull"
                      ? "Market is trending upward"
                      : currentMarketMode === "bear"
                      ? "Market is trending downward"
                      : "Market is stable"}
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
                  <button
                    onClick={() => handleMarketModeChange("bull")}
                    disabled={isLoadingMarket || currentMarketMode === "bull"}
                    className={`p-4 lg:p-6 rounded-xl border-2 transition-all duration-300 ${
                      currentMarketMode === "bull"
                        ? "bg-green-500 border-green-600 text-white shadow-lg scale-105"
                        : "bg-white border-green-300 text-green-600 hover:bg-green-50 hover:border-green-500"
                    } ${
                      isLoadingMarket ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="text-3xl lg:text-4xl mb-2">🐂</div>
                    <div className="font-bold text-base lg:text-lg">
                      Bull Market
                    </div>
                    <div className="text-xs mt-1 opacity-75">Upward Trend</div>
                  </button>

                  <button
                    onClick={() => handleMarketModeChange("neutral")}
                    disabled={
                      isLoadingMarket || currentMarketMode === "neutral"
                    }
                    className={`p-4 lg:p-6 rounded-xl border-2 transition-all duration-300 ${
                      currentMarketMode === "neutral"
                        ? "bg-gray-600 border-gray-700 text-white shadow-lg scale-105"
                        : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-500"
                    } ${
                      isLoadingMarket ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="text-3xl lg:text-4xl mb-2">⚖️</div>
                    <div className="font-bold text-base lg:text-lg">
                      Neutral
                    </div>
                    <div className="text-xs mt-1 opacity-75">Stable Market</div>
                  </button>

                  <button
                    onClick={() => handleMarketModeChange("bear")}
                    disabled={isLoadingMarket || currentMarketMode === "bear"}
                    className={`p-4 lg:p-6 rounded-xl border-2 transition-all duration-300 ${
                      currentMarketMode === "bear"
                        ? "bg-red-500 border-red-600 text-white shadow-lg scale-105"
                        : "bg-white border-red-300 text-red-600 hover:bg-red-50 hover:border-red-500"
                    } ${
                      isLoadingMarket ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="text-3xl lg:text-4xl mb-2">🐻</div>
                    <div className="font-bold text-base lg:text-lg">
                      Bear Market
                    </div>
                    <div className="text-xs mt-1 opacity-75">
                      Downward Trend
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "gamecontrol" && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-800 mb-2 text-center">
                  Game Control Panel
                </h3>
                <p className="text-sm lg:text-base text-gray-600 mb-6 lg:mb-8 text-center">
                  Start or stop the trading game
                </p>

                {/* Current Status Display */}
                <div
                  className={`mb-6 lg:mb-8 p-6 rounded-xl text-center transition-all duration-500 ${
                    !isBreak
                      ? "bg-green-100 border-2 border-green-500"
                      : "bg-red-100 border-2 border-red-500"
                  }`}
                >
                  <div className="text-xs lg:text-sm font-semibold text-gray-600 mb-2">
                    GAME STATUS
                  </div>
                  <div
                    className={`text-3xl lg:text-5xl font-bold ${
                      !isBreak ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {!isBreak ? "▶️ RUNNING" : "⏸️ STOPPED"}
                  </div>
                  <div
                    className={`mt-2 text-sm ${
                      !isBreak ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {!isBreak
                      ? "Trading is currently active"
                      : "Trading is currently paused"}
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleGameControl(true)}
                    disabled={gameControlLoading || !isBreak}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                      !isBreak
                        ? "bg-green-500 border-green-600 text-white shadow-lg"
                        : "bg-white border-green-300 text-green-600 hover:bg-green-50 hover:-green-500"
                    } ${
                      gameControlLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="text-4xl mb-3">▶️</div>
                    <div className="font-bold text-lg">Start Game</div>
                    <div className="text-xs mt-1 opacity-75">
                      Resume Trading
                    </div>
                  </button>

                  <button
                    onClick={() => handleGameControl(false)}
                    disabled={gameControlLoading || isBreak}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                      isBreak
                        ? "bg-red-500 border-red-600 text-white shadow-lg"
                        : "bg-white border-red-300 text-red-600 hover:bg-red-50 hover:border-red-500"
                    } ${
                      gameControlLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="text-4xl mb-3">⏸️</div>
                    <div className="font-bold text-lg">Stop Game</div>
                    <div className="text-xs mt-1 opacity-75">Pause Trading</div>
                  </button>
                </div>

                {gameControlLoading && (
                  <div className="mt-4 text-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <p className="text-sm text-gray-600 mt-2">Processing...</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
