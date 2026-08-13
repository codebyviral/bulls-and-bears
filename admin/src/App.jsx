import { useState, useEffect, useRef } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import StockMarketDashboard from "./assets/pages/StockMarketDashboard.jsx";
import SignUp from "./assets/pages/Signup.jsx";
import { ToastContainer, toast } from "react-toastify";
import Ipo from "./assets/pages/Ipo.jsx";
import Setnews from "./assets/pages/Setnews.jsx";
import DeleteHistory from "./assets/pages/DeleteHistory.jsx";

function App() {
  function ProtectedRoute({ element }) {
    const token = localStorage.getItem("authToken");
    const isAdmin = localStorage.getItem("isAdmin");
    const hasShowntoast = useRef(false);

    useEffect(() => {
      if (isAdmin !== "true" && !hasShowntoast.current) {
        setTimeout(() => toast.error("Only admins can access"), 100);
        hasShowntoast.current = true;
      }
    }, [isAdmin]);

    if (!token) {
      return <Navigate to="/login" replace />;
    }

    if (isAdmin !== "true") {
      return <Navigate to="/login" replace />;
    }

    return element;
  }

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<SignUp />} />
          <Route
            path="/"
            element={<ProtectedRoute element={<StockMarketDashboard />} />}
          />
          <Route path="/ipo" element={<ProtectedRoute element={<Ipo />} />} />
          <Route
            path="/news"
            element={<ProtectedRoute element={<Setnews />} />}
          />
          <Route
            path="/delete-candlestick-data"
            element={<ProtectedRoute element={<DeleteHistory />} />}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
