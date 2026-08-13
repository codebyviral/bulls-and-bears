import React from "react";
import { Construction, ArrowLeft, Clock } from "lucide-react";
import bnblogo from "../assets/bnblogo.png";
import { Link, useNavigate } from "react-router-dom";
import { useDarkModeStore } from "../store";
import CustomSidebar from "../Components/CustomSidebar";

const UnderDevelopment = () => {
  const { globalDarkState } = useDarkModeStore();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <>
      <div
        className={`min-h-screen transition-colors duration-300 ${
          globalDarkState ? "dark bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="flex items-center justify-center min-h-screen p-4">
          <div
            className={`w-full max-w-md transition-all duration-300 ${
              globalDarkState
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } rounded-2xl shadow-2xl border p-8`}
          >
            <div className="flex justify-center mb-8">
              <div>
                <img className="w-20 h-20" src={bnblogo} alt="Logo" />
              </div>
            </div>

            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div
                  className={`p-4 rounded-full ${
                    globalDarkState ? "bg-yellow-900/20" : "bg-yellow-50"
                  }`}
                >
                  <Construction
                    size={48}
                    className={
                      globalDarkState ? "text-yellow-400" : "text-yellow-600"
                    }
                  />
                </div>
              </div>

              <h1
                className={`text-3xl font-bold mb-2 ${
                  globalDarkState ? "text-white" : "text-gray-900"
                }`}
              >
                Under Development
              </h1>
              <p
                className={`text-sm mb-4 ${
                  globalDarkState ? "text-gray-400" : "text-gray-600"
                }`}
              >
                This feature is currently being built and will be available
                soon.
              </p>

              <div className="flex items-center justify-center space-x-2 mb-6">
                <Clock
                  size={16}
                  className={
                    globalDarkState ? "text-gray-500" : "text-gray-400"
                  }
                />
                <span
                  className={`text-xs ${
                    globalDarkState ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  We're working hard to bring this to you
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleGoBack}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <ArrowLeft size={20} />
                <span>Go Back</span>
              </button>

              <div className="text-center">
                <Link
                  to="/bazaar"
                  className="text-blue-600 hover:text-blue-500 font-medium transition-colors text-sm"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>

            <div
              className={`mt-8 p-4 rounded-xl ${
                globalDarkState ? "bg-gray-700/50" : "bg-gray-50"
              }`}
            >
              <p
                className={`text-xs text-center ${
                  globalDarkState ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Want to be notified when this feature is ready? Contact our
                support team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UnderDevelopment;
