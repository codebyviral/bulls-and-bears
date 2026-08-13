import React, { useEffect, useState } from "react";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";

const DetectInternet = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastOfflineTime, setLastOfflineTime] = useState(null);

  const toggleCheck = () => {
    const online = navigator.onLine;
    setIsOnline(online);

    if (!online) {
      setLastOfflineTime(new Date().toLocaleTimeString());
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);

    // Simulate checking connection
    setTimeout(() => {
      setIsRetrying(false);
      toggleCheck();
    }, 2000);
  };

  useEffect(() => {
    window.addEventListener("online", toggleCheck);
    window.addEventListener("offline", toggleCheck);

    return () => {
      window.removeEventListener("online", toggleCheck);
      window.removeEventListener("offline", toggleCheck);
    };
  }, []);

  // If online, don't render anything
  if (isOnline) {
    return null;
  }

  // Full screen offline overlay
  return (
    <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-95 backdrop-blur-sm flex items-center justify-center">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          {/* Icon Container */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <WifiOff size={40} className="text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            No Internet Connection
          </h1>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            Please check your internet connection and try again. Some features
            may not work properly without an active connection.
          </p>

          {/* Connection Details */}
          {lastOfflineTime && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Connection lost at:
                </span>
                <span className="font-mono text-gray-700 dark:text-gray-300">
                  {lastOfflineTime}
                </span>
              </div>
            </div>
          )}

          {/* Status Indicator */}
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              Offline
            </span>
          </div>

          {/* Retry Button */}
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
          >
            {isRetrying ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                <span>Checking Connection...</span>
              </>
            ) : (
              <>
                <Wifi size={20} />
                <span>Try Again</span>
              </>
            )}
          </button>

          {/* Help Text */}
          <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 space-y-2">
            <p>Troubleshooting tips:</p>
            <ul className="text-left space-y-1">
              <li>• Check your WiFi connection</li>
              <li>• Restart your router</li>
              <li>• Try switching to mobile data</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              This page will automatically refresh when connection is restored
            </p>
          </div>
        </div>
      </div>

      {/* Background Animation */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-red-500 opacity-5 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-blue-500 opacity-5 animate-pulse delay-1000"></div>
      </div>
    </div>
  );
};

export default DetectInternet;
