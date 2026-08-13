import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  Wallet,
  Users,
  Trophy,
  ChevronDown,
  Menu,
  X,
  Moon,
  Sun,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Activity,
  Zap,
  Target,
  Award,
  ArrowRight,
} from "lucide-react";

const HomePage = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [currentPrice, setCurrentPrice] = useState(45678.23);
  const [priceChange, setPriceChange] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);

    const priceInterval = setInterval(() => {
      const change = (Math.random() - 0.5) * 100;
      setCurrentPrice((prev) => prev + change);
      setPriceChange(change);
    }, 3000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(priceInterval);
    };
  }, []);

  const features = [
    {
      icon: <LineChart className="w-8 h-8" />,
      title: "Live Trading Simulation",
      description:
        "Experience real-time market dynamics with our advanced trading simulator",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "IPO Opportunities",
      description:
        "Participate in Initial Public Offerings and build your portfolio",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Competitive Trading",
      description:
        "Compete with peers and climb the leaderboard to win exciting prizes",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: <Activity className="w-8 h-8" />,
      title: "Real Market Data",
      description:
        "Access real-time market data and advanced charting tools",
      color: "from-purple-500 to-pink-500",
    },
  ];

  const stats = [
    { number: "500+", label: "Active Traders", icon: <Users /> },
    { number: "₹10L+", label: "Trading Volume", icon: <TrendingUp /> },
    { number: "50+", label: "Listed Stocks", icon: <BarChart3 /> },
    { number: "₹50K", label: "Prize Pool", icon: <Trophy /> },
  ];

  const timeline = [
    {
      phase: "Registration",
      date: "Oct 15 - Oct 25",
      description: "Register and create your trading account",
      icon: <Users />,
    },
    {
      phase: "Market Opens",
      date: "Oct 28",
      description: "Trading simulation begins with live market",
      icon: <Activity />,
    },
    {
      phase: "IPO Launch",
      date: "Oct 30",
      description: "Exclusive IPO opportunities go live",
      icon: <DollarSign />,
    },
    {
      phase: "Grand Finale",
      date: "Nov 5",
      description: "Winners announced and prizes distributed",
      icon: <Trophy />,
    },
  ];

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
      }`}
    >
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrollY > 50
            ? darkMode
              ? "bg-gray-900/95 backdrop-blur-lg shadow-2xl border-b border-gray-800"
              : "bg-white/95 backdrop-blur-lg shadow-xl border-b border-gray-200"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center transform hover:scale-110 transition-transform duration-300 ${
                  scrollY > 0 ? "animate-pulse" : ""
                }`}
              >
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1
                  className={`text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent`}
                >
                  BAZAAR
                </h1>
                <p
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Bulls & Bears
                </p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {["Home", "About", "Features", "Timeline", "Register"].map(
                (item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className={`text-sm font-medium transition-all duration-300 hover:scale-105 ${
                      darkMode
                        ? "text-gray-300 hover:text-blue-400"
                        : "text-gray-700 hover:text-blue-600"
                    }`}
                  >
                    {item}
                  </a>
                )
              )}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-110 ${
                  darkMode
                    ? "bg-gray-800 text-yellow-400 hover:bg-gray-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X
                  className={darkMode ? "text-white" : "text-gray-900"}
                  size={24}
                />
              ) : (
                <Menu
                  className={darkMode ? "text-white" : "text-gray-900"}
                  size={24}
                />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className={`md:hidden ${
              darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
            } border-t`}
          >
            <div className="px-4 py-6 space-y-4">
              {["Home", "About", "Features", "Timeline", "Register"].map(
                (item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className={`block text-base font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item}
                  </a>
                )
              )}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-full p-3 rounded-xl ${
                  darkMode ? "bg-gray-800 text-yellow-400" : "bg-gray-100"
                }`}
              >
                {darkMode ? (
                  <span className="flex items-center justify-center space-x-2">
                    <Sun size={20} /> <span>Light Mode</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <Moon size={20} /> <span>Dark Mode</span>
                  </span>
                )}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: "4s" }}
          ></div>
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: "6s", animationDelay: "1s" }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in">
              <div
                className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
                  darkMode
                    ? "bg-blue-500/10 border border-blue-500/20"
                    : "bg-blue-50 border border-blue-200"
                }`}
              >
                <Zap className="w-4 h-4 text-blue-500" />
                <span
                  className={`text-sm font-medium ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  Live Trading Event
                </span>
              </div>

              <h1
                className={`text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Welcome to
                <span className="block mt-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
                  BAZAAR
                </span>
              </h1>

              <p
                className={`text-lg sm:text-xl ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                } leading-relaxed`}
              >
                Experience the thrill of stock market trading with our immersive
                simulation. Trade stocks, participate in IPOs, and compete for
                exciting prizes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2">
                  <span>Register Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  className={`px-8 py-4 font-semibold rounded-xl border-2 transform hover:scale-105 transition-all duration-300 ${
                    darkMode
                      ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Learn More
                </button>
              </div>

              {/* Live Price Ticker */}
              <div
                className={`p-4 rounded-xl ${
                  darkMode
                    ? "bg-gray-800/50 border border-gray-700"
                    : "bg-white/50 border border-gray-200"
                } backdrop-blur-sm`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Activity className="w-5 h-5 text-blue-500" />
                    <span
                      className={`text-sm font-medium ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      NIFTY 50
                    </span>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-xl font-bold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      ₹{currentPrice.toFixed(2)}
                    </div>
                    <div
                      className={`text-sm font-medium flex items-center justify-end space-x-1 ${
                        priceChange >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {priceChange >= 0 ? (
                        <TrendingUp size={16} />
                      ) : (
                        <TrendingDown size={16} />
                      )}
                      <span>
                        {priceChange >= 0 ? "+" : ""}
                        {priceChange.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Trading Chart Visualization */}
            <div className="relative">
              <div
                className={`p-8 rounded-2xl ${
                  darkMode
                    ? "bg-gray-800/50 border border-gray-700"
                    : "bg-white/50 border border-gray-200"
                } backdrop-blur-sm shadow-2xl transform hover:scale-105 transition-all duration-500`}
              >
                <div className="space-y-6">
                  {/* Chart Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3
                        className={`text-2xl font-bold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Market Overview
                      </h3>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Real-time simulation data
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-blue-500" />
                  </div>

                  {/* Mock Chart Bars */}
                  <div className="space-y-3">
                    {[85, 62, 95, 78, 88, 70, 92].map((height, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <span
                          className={`text-xs ${
                            darkMode ? "text-gray-500" : "text-gray-600"
                          } w-12`}
                        >
                          Day {idx + 1}
                        </span>
                        <div
                          className={`h-8 rounded-lg bg-gradient-to-r ${
                            idx % 2 === 0
                              ? "from-blue-500 to-cyan-500"
                              : "from-purple-500 to-pink-500"
                          } transition-all duration-1000 hover:scale-105`}
                          style={{
                            width: `${height}%`,
                            animation: `slideIn 0.${idx + 5}s ease-out`,
                          }}
                        ></div>
                        <span
                          className={`text-sm font-semibold ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {height}%
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                    <div>
                      <p
                        className={`text-xs ${
                          darkMode ? "text-gray-500" : "text-gray-600"
                        }`}
                      >
                        Total Volume
                      </p>
                      <p
                        className={`text-lg font-bold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        ₹12.5L
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-xs ${
                          darkMode ? "text-gray-500" : "text-gray-600"
                        }`}
                      >
                        Active Traders
                      </p>
                      <p
                        className={`text-lg font-bold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        542
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown
            className={darkMode ? "text-gray-400" : "text-gray-600"}
            size={32}
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl ${
                  darkMode
                    ? "bg-gray-800/50 border border-gray-700"
                    : "bg-white border border-gray-200"
                } backdrop-blur-sm transform hover:scale-105 transition-all duration-300 hover:shadow-xl`}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 ${
                    darkMode ? "shadow-lg shadow-blue-500/20" : ""
                  }`}
                >
                  {React.cloneElement(stat.icon, {
                    className: "w-6 h-6 text-white",
                  })}
                </div>
                <h3
                  className={`text-3xl font-bold mb-2 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {stat.number}
                </h3>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className={`text-4xl sm:text-5xl font-bold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              About{" "}
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Bazaar
              </span>
            </h2>
            <p
              className={`text-lg ${
                darkMode ? "text-gray-300" : "text-gray-600"
              } max-w-3xl mx-auto`}
            >
              A flagship event by Bulls & Bears, the Finance Club of PDEU,
              bringing you an unparalleled trading simulation experience
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div
              className={`p-8 rounded-2xl ${
                darkMode
                  ? "bg-gray-800/50 border border-gray-700"
                  : "bg-white border border-gray-200"
              } backdrop-blur-sm space-y-6`}
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3
                    className={`text-xl font-bold mb-2 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Our Mission
                  </h3>
                  <p
                    className={`${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    To provide students with hands-on experience in financial
                    markets through realistic trading simulations and IPO
                    participation opportunities.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3
                    className={`text-xl font-bold mb-2 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Virtual Trading
                  </h3>
                  <p
                    className={`${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Start with virtual capital and experience the real emotions
                    of trading without any financial risk. Learn, experiment,
                    and master trading strategies.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3
                    className={`text-xl font-bold mb-2 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Win Rewards
                  </h3>
                  <p
                    className={`${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Compete with fellow traders and win exciting prizes. Top
                    performers will be rewarded with certificates and cash
                    prizes worth ₹50,000.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div
                className={`p-6 rounded-2xl ${
                  darkMode
                    ? "bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/20"
                    : "bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200"
                } backdrop-blur-sm`}
              >
                <h4
                  className={`text-xl font-bold mb-3 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Event Highlights
                </h4>
                <ul className="space-y-3">
                  {[
                    "Live market simulation with real-time data",
                    "Exclusive IPO participation opportunities",
                    "Expert mentorship and trading workshops",
                    "Leaderboard rankings and competitive environment",
                    "Networking with finance enthusiasts",
                  ].map((item, idx) => (
                    <li
                      key={idx}
                      className={`flex items-center space-x-3 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className={`p-6 rounded-2xl ${
                  darkMode
                    ? "bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/20"
                    : "bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200"
                } backdrop-blur-sm`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <Calendar className="w-6 h-6 text-green-500" />
                  <h4
                    className={`text-xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Event Details
                  </h4>
                </div>
                <div className="space-y-2">
                  <p
                    className={`flex items-center space-x-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <Clock size={16} />
                    <span>Duration: 10 Days</span>
                  </p>
                  <p
                    className={`flex items-center space-x-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <MapPin size={16} />
                    <span>Mode: Online & Offline</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className={`text-4xl sm:text-5xl font-bold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Platform{" "}
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Features
              </span>
            </h2>
            <p
              className={`text-lg ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Everything you need for an immersive trading experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className={`group p-6 rounded-2xl ${
                  darkMode
                    ? "bg-gray-800/50 border border-gray-700 hover:border-gray-600"
                    : "bg-white border border-gray-200 hover:border-gray-300"
                } backdrop-blur-sm transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer`}
              >
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  {React.cloneElement(feature.icon, { className: "text-white" })}
                </div>
                <h3
                  className={`text-xl font-bold mb-3 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {feature.title}
                </h3>
                <p
                  className={`${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className={`text-4xl sm:text-5xl font-bold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Event{" "}
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Timeline
              </span>
            </h2>
            <p
              className={`text-lg ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Your journey through Bazaar
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div
              className={`absolute left-1/2 transform -translate-x-1/2 w-1 h-full ${
                darkMode ? "bg-gray-700" : "bg-gray-300"
              } hidden lg:block`}
            ></div>

            <div className="space-y-12">
              {timeline.map((item, idx) => (
                <div
                  key={idx}
                  className={`relative flex items-center ${
                    idx % 2 === 0
                      ? "lg:flex-row"
                      : "lg:flex-row-reverse"
                  } flex-col lg:space-x-8`}
                >
                  {/* Content Card */}
                  <div className={`w-full lg:w-5/12 ${idx % 2 === 0 ? "lg:text-right" : "lg:text-left"}`}>
                    <div
                      className={`p-6 rounded-2xl ${
                        darkMode
                          ? "bg-gray-800/50 border border-gray-700"
                          : "bg-white border border-gray-200"
                      } backdrop-blur-sm transform hover:scale-105 transition-all duration-300 hover:shadow-xl`}
                    >
                      <div className={`flex items-center space-x-3 mb-3 ${idx % 2 === 0 ? "lg:justify-end" : ""}`}>
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${
                            idx % 2 !== 0 ? "order-first" : ""
                          }`}
                        >
                          {React.cloneElement(item.icon, {
                            className: "w-5 h-5 text-white",
                          })}
                        </div>
                        <h3
                          className={`text-2xl font-bold ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {item.phase}
                        </h3>
                      </div>
                      <p
                        className={`text-sm font-medium mb-2 ${
                          darkMode ? "text-blue-400" : "text-blue-600"
                        }`}
                      >
                        {item.date}
                      </p>
                      <p
                        className={`${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Timeline Dot */}
                  <div className="hidden lg:flex items-center justify-center w-2/12">
                    <div
                      className={`w-6 h-6 rounded-full border-4 ${
                        darkMode
                          ? "bg-blue-500 border-gray-900"
                          : "bg-blue-500 border-white"
                      } shadow-lg z-10`}
                    ></div>
                  </div>

                  {/* Spacer */}
                  <div className="hidden lg:block w-5/12"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Registration CTA Section */}
      <section id="register" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div
            className={`relative overflow-hidden p-12 rounded-3xl ${
              darkMode
                ? "bg-gradient-to-br from-blue-900/50 via-purple-900/50 to-pink-900/50 border border-blue-500/20"
                : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border border-blue-200"
            } backdrop-blur-sm`}
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 text-center space-y-6">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-500">
                  Limited Slots Available
                </span>
              </div>

              <h2
                className={`text-4xl sm:text-5xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Ready to Start Trading?
              </h2>

              <p
                className={`text-lg ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                } max-w-2xl mx-auto`}
              >
                Join hundreds of students in this exciting trading simulation.
                Register now and start your journey to become a trading master!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button className="group px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3">
                  <span>Register Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </button>
                <button
                  className={`px-10 py-4 font-bold text-lg rounded-xl border-2 transform hover:scale-105 transition-all duration-300 ${
                    darkMode
                      ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  View Rules
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8 max-w-2xl mx-auto">
                <div>
                  <p
                    className={`text-3xl font-bold mb-1 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Free
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Registration
                  </p>
                </div>
                <div>
                  <p
                    className={`text-3xl font-bold mb-1 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    ₹10L
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Virtual Capital
                  </p>
                </div>
                <div>
                  <p
                    className={`text-3xl font-bold mb-1 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    ₹50K
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Prize Pool
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`py-12 px-4 sm:px-6 lg:px-8 border-t ${
          darkMode ? "border-gray-800 bg-gray-900/50" : "border-gray-200 bg-gray-50"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3
                    className={`text-xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    BAZAAR
                  </h3>
                  <p
                    className={`text-xs ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    By Bulls & Bears, PDEU
                  </p>
                </div>
              </div>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                } mb-4`}
              >
                Empowering students with real-world trading experience through
                immersive simulation and hands-on learning.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4
                className={`text-sm font-bold mb-4 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Quick Links
              </h4>
              <ul className="space-y-2">
                {["About", "Features", "Timeline", "Register"].map((link) => (
                  <li key={link}>
                    <a
                      href={`#${link.toLowerCase()}`}
                      className={`text-sm transition-colors ${
                        darkMode
                          ? "text-gray-400 hover:text-blue-400"
                          : "text-gray-600 hover:text-blue-600"
                      }`}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4
                className={`text-sm font-bold mb-4 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Contact
              </h4>
              <ul className="space-y-2">
                <li
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  PDEU Campus
                </li>
                <li
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Gandhinagar, Gujarat
                </li>
                <li>
                  <a
                    href="mailto:bullsandbears@pdeu.ac.in"
                    className={`text-sm transition-colors ${
                      darkMode
                        ? "text-gray-400 hover:text-blue-400"
                        : "text-gray-600 hover:text-blue-600"
                    }`}
                  >
                    bullsandbears@pdeu.ac.in
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div
            className={`pt-8 border-t ${
              darkMode ? "border-gray-800" : "border-gray-200"
            } flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0`}
          >
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              © 2025 Bulls & Bears, PDEU. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <a
                href="#"
                className={`text-sm transition-colors ${
                  darkMode
                    ? "text-gray-400 hover:text-blue-400"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className={`text-sm transition-colors ${
                  darkMode
                    ? "text-gray-400 hover:text-blue-400"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes slideIn {
          from {
            width: 0;
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default HomePage;