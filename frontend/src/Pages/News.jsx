import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

const NewsToast = ({ socket }) => {
  useEffect(() => {
    if (!socket) return;

    const handleSectorNews = (newsItem) => {
      const { title, description, changePercent } = newsItem;
      const isProfit = changePercent > 0;
      const isNeutral = changePercent === 0;

      // Custom toast content with animation
      const ToastContent = () => (
        <div className="flex items-start gap-3 p-2">
          <div className={`flex-shrink-0 mt-1 ${
            isProfit ? 'animate-bounce' : isNeutral ? '' : 'animate-pulse'
          }`}>
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
            <div className={`mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              isProfit 
                ? 'bg-green-700 text-white' 
                : isNeutral 
                ? 'bg-gray-700 text-white'
                : 'bg-red-700 text-white'
            }`}>
              {isProfit ? '📈' : isNeutral ? '➡️' : '📉'}
              <span>{changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%</span>
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
            ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
            : isNeutral
            ? 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)'
            : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
          padding: '16px',
          minWidth: '320px',
          maxWidth: '400px',
          border: isProfit 
            ? '2px solid rgba(16, 185, 129, 0.5)' 
            : isNeutral
            ? '2px solid rgba(107, 114, 128, 0.5)'
            : '2px solid rgba(239, 68, 68, 0.5)',
          animation: 'slideInRight 0.5s ease-out',
        },
        progressStyle: {
          background: 'rgba(255, 255, 255, 0.4)',
          height: '4px',
        },
        icon: false,
      };

      // Show toast
      toast(<ToastContent />, toastOptions);
    };

    socket.on('sectorNews', handleSectorNews);

    return () => {
      socket.off('sectorNews', handleSectorNews);
    };
  }, [socket]);

  return null;
};

export default NewsToast;