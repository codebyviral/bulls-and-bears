import React, { useState, useEffect } from "react";
import {
  Home,
  TrendingUp,
  BarChart3,
  DollarSign,
  ArrowLeft,
} from "lucide-react";
import bnblogo from "../assets/bnblogo.png";
import { Link, useNavigate } from "react-router-dom";
import { useDarkModeStore } from "../store";

const NotFound = () => {
  const { globalDarkState } = useDarkModeStore();
  const navigate = useNavigate();
  const [currentInsight, setCurrentInsight] = useState(0);

  const tradingInsights = [
    {
      icon: <TrendingUp size={24} />,
      title: "The Power of Compound Growth",
      text: "A 10% annual return can turn $1,000 into $6,727 over 20 years through compounding.",
    },
    {
      icon: <BarChart3 size={24} />,
      title: "Risk Management Rule",
      text: "Never risk more than 1-2% of your portfolio on a single trade to preserve capital.",
    },
    {
      icon: <DollarSign size={24} />,
      title: "Time in Market > Timing the Market",
      text: "Studies show that staying invested consistently outperforms trying to time market peaks and valleys.",
    },
    {
      icon: <TrendingUp size={24} />,
      title: "Diversification is Key",
      text: "A well-diversified portfolio can reduce risk by 30-40% without sacrificing returns.",
    },
    {
      icon: <BarChart3 size={24} />,
      title: "The 50-30-20 Rule",
      text: "Allocate 50% to needs, 30% to wants, and 20% to savings and investments for financial health.",
    },
  ];

  // Rotate insights every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentInsight((prev) => (prev + 1) % tradingInsights.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        globalDarkState ? "dark bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className={`w-full max-w-lg transition-all duration-300 ${
            globalDarkState
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } rounded-2xl shadow-2xl border p-8 text-center`}
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img
                className="w-20 h-20"
                src={bnblogo}
                alt="Trading Club Logo"
              />
              <div
                className={`absolute -top-1 -right-1 w-6 h-6 rounded-full ${
                  globalDarkState ? "bg-red-500" : "bg-red-400"
                } flex items-center justify-center`}
              >
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>
          </div>

          {/* 404 Display */}
          <div className="mb-6">
            <h1
              className={`text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent`}
            >
              404
            </h1>
            <h2
              className={`text-2xl font-bold mb-2 ${
                globalDarkState ? "text-white" : "text-gray-900"
              }`}
            >
              Page Not Found
            </h2>
            <p
              className={`text-sm ${
                globalDarkState ? "text-gray-400" : "text-gray-600"
              }`}
            >
              The trading floor you're looking for seems to have moved!
            </p>
          </div>

          {/* Trading Insight Card */}
          <div
            className={`p-6 rounded-xl mb-6 transition-all duration-500 ${
              globalDarkState
                ? "bg-gray-700 border-gray-600"
                : "bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200"
            } border`}
          >
            <div className="flex items-center justify-center mb-3">
              <div
                className={`p-2 rounded-full ${
                  globalDarkState
                    ? "bg-blue-600 text-white"
                    : "bg-blue-600 text-white"
                }`}
              >
                {tradingInsights[currentInsight].icon}
              </div>
            </div>
            <h3
              className={`text-lg font-semibold mb-2 ${
                globalDarkState ? "text-white" : "text-gray-900"
              }`}
            >
              💡 {tradingInsights[currentInsight].title}
            </h3>
            <p
              className={`text-sm leading-relaxed ${
                globalDarkState ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {tradingInsights[currentInsight].text}
            </p>
          </div>

          {/* Insight Progress Dots */}
          <div className="flex justify-center space-x-2 mb-6">
            {tradingInsights.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentInsight(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentInsight
                    ? "bg-blue-600 w-6"
                    : globalDarkState
                    ? "bg-gray-600 hover:bg-gray-500"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoHome}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Home size={20} />
              <span>Back to Trading Floor</span>
            </button>

            <button
              onClick={handleGoBack}
              className={`w-full font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center space-x-2 ${
                globalDarkState
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600 focus:ring-gray-500"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 focus:ring-gray-500"
              }`}
            >
              <ArrowLeft size={20} />
              <span>Go Back</span>
            </button>
          </div>

          {/* Club Info */}
          <div className="mt-6 pt-6 border-t border-opacity-20">
            <p
              className={`text-xs ${
                globalDarkState ? "text-gray-500" : "text-gray-400"
              }`}
            >
              Trading Club • Learn • Invest • Prosper
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
