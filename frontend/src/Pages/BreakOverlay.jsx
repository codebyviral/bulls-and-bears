import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { getSocket } from "../lib/socket";

// ⚡ Create a single socket connection (adjust URL)
const socket = getSocket();

export default function BreakOverlay() {
  const [isBreak, setIsBreak] = useState(false);
  const [dots, setDots] = useState("");

  useEffect(() => {
    socket.on("break_state", ({ isBreak }) => {
      setIsBreak(isBreak);
    });
    return () => socket.off("break_state");
  }, []);

  useEffect(() => {
    // always set the title according to current state
    document.title = isBreak ? "Break Time!" : "Bazaar 8.0";

    // only start the dots interval while on break
    if (!isBreak) {
      setDots(""); // reset dots when break ends
      return;
    }

    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, [isBreak]);

  if (!isBreak) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
      {/* Main card */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-12 text-center shadow-2xl max-w-lg mx-4 border border-white/20 animate-[slideUp_0.5s_ease-out]">
        {/* Pause icon */}
        <div className="mb-6 inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br animate-[bounce_2s_ease-in-out_infinite]">
          <img
            className="w-24 h-24 "
            src="src/assets/bnblogo.png"
            alt="error"
          />
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent mb-4">
          Break Time
        </h1>

        {/* Description */}
        <p className="text-gray-700 text-xl leading-relaxed mb-6">
          The game is currently paused by the admin.
        </p>

        {/* Animated waiting text */}
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-[ping_1s_ease-in-out_infinite]"></div>
          <p className="text-lg font-medium">Waiting to resume{dots}</p>
        </div>

        {/* Bottom decoration */}
        <div className="mt-8 flex justify-center gap-2">
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-[bounce_1s_ease-in-out_infinite]"></div>
          <div
            className="w-2 h-2 bg-red-400 rounded-full animate-[bounce_1s_ease-in-out_infinite]"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-2 h-2 bg-pink-400 rounded-full animate-[bounce_1s_ease-in-out_infinite]"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
