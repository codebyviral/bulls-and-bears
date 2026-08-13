import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { useEffect } from "react";
import { io } from "socket.io-client";
import {
  SigninPage,
  SignupPage,
  VerifyUser,
  Dashboard,
  ResetPasswordPage,
  NotFoundPage,
  UnderDevelopment,
  PortfolioPage,
  ViewStockPage,
  PrivacyPolicy,
  TermsofService,
  Transactions,
  Setting,
  HomePage,
} from "./Pages";
import IpoPage from "./Pages/IpoPage.jsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDarkModeStore } from "./store";
import LeaderboardPage from "./Pages/LeaderboardPage";
import BreakOverlay from "./Pages/BreakOverlay.jsx";
import Ipo from "./Components/Ipo.jsx";
import NewsToast from "./Pages/News.jsx";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react"; // Import icons

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  transports: ["websocket"],
});

// Toast configuration
const toastConfig = {
  position: "bottom-right",
  autoClose: 1000,
  hideProgressBar: false,
  newestOnTop: false,
  closeOnClick: true,
  rtl: false,
  pauseOnFocusLoss: true,
  draggable: true,
  pauseOnHover: true,
  theme: "colored",
};

const customToastStyle = {
  fontSize: "13px",
  fontFamily: "Inter, system-ui, sans-serif",
  borderRadius: "12px",
  padding: "12px 16px",
  background: "#ffffff",
  color: "#111827", // text-gray-900
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
  border: "1px solid rgba(229, 231, 235, 0.8)", // light border like gray-200
};

function App() {
  const { globalDarkState } = useDarkModeStore();

  // Socket and toast effects
  useEffect(() => {
    socket.on("connect", () => {});

    socket.on("leaderboard", (leaderboardData) => {
      console.log(leaderboardData);
    });

    socket.on("shareliveprice", (liveprice) => {
      if (liveprice.changePercent && Math.abs(liveprice.changePercent) > 5) {
        const isPositive = liveprice.changePercent > 0;
        toast.info(
          `${liveprice.symbol}: ${
            isPositive ? "📈" : "📉"
          } ${liveprice.changePercent.toFixed(2)}%`,
          {
            icon: isPositive ? "🟢" : "🔴",
            style: {
              ...customToastStyle,
              background: isPositive
                ? "linear-gradient(135deg, #10B981 0%, #059669 100%)"
                : "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
              color: "white",
            },
            progressStyle: { background: "rgba(255, 255, 255, 0.3)" },
          }
        );
      }
    });

    // Handle sector news with beautiful animations
    socket.on("sectorNews", (newsItem) => {
      const { title, description, changePercent } = newsItem;
      const isProfit = changePercent > 0;
      const isNeutral = changePercent === 0;

      // Custom toast content with animation
      const ToastContent = () => (
        <div className="flex items-start gap-3 p-2">
          <div
            className={`flex-shrink-0 mt-1 ${
              isProfit ? "animate-bounce" : isNeutral ? "" : "animate-pulse"
            }`}
          >
            {isProfit ? (
              <TrendingUp className="w-6 h-6 text-white" />
            ) : isNeutral ? (
              <AlertCircle className="w-6 h-6 text-white" />
            ) : (
              <TrendingDown className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-white text-base mb-1 leading-tight">
              {title}
            </div>
            <div className="text-white text-sm opacity-95 leading-snug">
              {description}
            </div>
            <div
              className={`mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                isProfit
                  ? "bg-green-700 text-white"
                  : isNeutral
                  ? "bg-gray-700 text-white"
                  : "bg-red-700 text-white"
              }`}
            >
              {isProfit ? "📈" : isNeutral ? "➡️" : "📉"}
              <span>
                {changePercent > 0 ? "+" : ""}
                {changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      );

      // Toast configuration based on profit/loss
      const toastOptions = {
        autoClose: 8000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        position: "top-right",
        style: {
          background: isProfit
            ? "linear-gradient(135deg, #10B981 0%, #059669 100%)"
            : isNeutral
            ? "linear-gradient(135deg, #6B7280 0%, #4B5563 100%)"
            : "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
          borderRadius: "16px",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
          padding: "16px",
          minWidth: "320px",
          maxWidth: "400px",
          border: isProfit
            ? "2px solid rgba(16, 185, 129, 0.5)"
            : isNeutral
            ? "2px solid rgba(107, 114, 128, 0.5)"
            : "2px solid rgba(239, 68, 68, 0.5)",
        },
        progressStyle: {
          background: "rgba(255, 255, 255, 0.4)",
          height: "4px",
        },
        icon: false,
      };

      // Show toast
      toast(<ToastContent />, toastOptions);
    });

    socket.on("disconnect", () => {
      // toast.warn("⚠️ Disconnected from market data", {
      //   icon: "🔌",
      //   style: customToastStyle,
      // });
    });

    socket.on("connect_error", (error) => {
      console.log("Connection error", error);
    });

    return () => {
      socket.off("connect");
      socket.off("shareliveprice");
      socket.off("sectorNews");
      socket.off("disconnect");
      socket.off("connect_error");
    };
  }, []);

  // Dark mode
  useEffect(() => {
    if (globalDarkState) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [globalDarkState]);

  // Disable inspect & shortcuts across all platforms
  useEffect(() => {
    // const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (e.key === "F12") e.preventDefault();
      if (
        e.ctrlKey &&
        e.shiftKey &&
        ["I", "J", "C"].includes(e.key.toUpperCase())
      )
        e.preventDefault();
      if (e.ctrlKey && e.key.toLowerCase() === "u") e.preventDefault();
      if (e.metaKey && e.altKey && e.key.toUpperCase() === "I")
        e.preventDefault();
    };

    // document.addEventListener("contextmenu", handleContextMenu);
    // document.addEventListener("touchstart", handleContextMenu); // mobile long press
    document.addEventListener("keydown", handleKeyDown);

    // Optional: make text unselectable on mobile/desktop
    document.body.style.userSelect = "none";
    document.body.style.webkitTouchCallout = "none";

    return () => {
      // document.removeEventListener("contextmenu", handleContextMenu);
      // document.removeEventListener("touchstart", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <div className="bg-primary dark:bg-primary-dark">
        <BreakOverlay />
        <Routes>
          <Route
            path="/"
            element={
              <Navigate to="/bazaar" element={<Dashboard />} replace={true} />
            }
          />
          <Route path="/bazaar" element={<Dashboard />} />
          <Route path="/bazaar/market/:id" element={<ViewStockPage />} />
          <Route path="/leaderboard-updates" element={<LeaderboardPage />} />
          <Route path="/my-transactions" element={<Transactions />} />
          <Route path="/my-positions" element={<PortfolioPage />} />
          <Route path="/ipo" element={<IpoPage />} />
          <Route path="/settings" element={<Setting />} />
          <Route path="/help" element={<UnderDevelopment />} />
          <Route path="/auth/signin" element={<SigninPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />
          <Route path="/verify-user" element={<VerifyUser />} />
          <Route
            path="/reset-account-password"
            element={<ResetPasswordPage />}
          />
          <Route path="/bazaar/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/bazaar/terms&services" element={<TermsofService />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>

      <ToastContainer
        {...toastConfig}
        toastStyle={customToastStyle}
        progressStyle={{
          background: "linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899)",
        }}
        toastClassName="custom-toast"
        bodyClassName="custom-toast-body"
        progressClassName="custom-toast-progress"
      />
    </>
  );
}

export default App;
