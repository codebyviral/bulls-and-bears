import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  Newspaper,
  Clock,
  ExternalLink,
  Type,
  NewspaperIcon,
  ScrollText,
} from "lucide-react";
import { userAuthenticatedStore } from "../store";

const News = () => {
  const userId = userAuthenticatedStore((state) => state.userId);
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [fontStyle, setFontStyle] = useState("sans-serif"); // Default font
  const socketRef = useRef(null);

  const connectSocket = () => {
    if (socketRef.current) {
      try {
        socketRef.current.disconnect();
      } catch (e) {
        console.warn("Error disconnecting previous socket", e);
      }
    }

    socketRef.current = io(import.meta.env.VITE_BACKEND_URL, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    return socketRef.current;
  };

  useEffect(() => {
    const socket = connectSocket();

    const onConnect = () => {
      console.log("🔗 News socket connected:", socket.id);
      if (userId) {
        socket.emit("registerUser", userId);
      }
    };

    const onConnectError = (err) => {
      console.error("❌ News socket connect error:", err);
      setIsLoading(false);
    };

    const onDisconnect = (reason) => {
      console.log("🔌 News socket disconnected:", reason);
    };

    const onLatestNews = (data) => {
      console.log("📰 Received latestNews:", data);

      const newsArray = Array.isArray(data) ? data : [data];

      setNews((prevNews) => {
        if (JSON.stringify(prevNews) === JSON.stringify(newsArray)) {
          console.log("⚠️ News data unchanged, skipping update");
          return prevNews;
        }
        console.log("✅ Updating news state with new data");
        return newsArray;
      });

      setIsLoading(false);
      setLastUpdate(new Date());
    };

    const onSectorNews = (newsItem) => {
      console.log("📊 Received sectorNews:", newsItem);

      const transformedNews = {
        _id: newsItem._id || `sector-${Date.now()}`,
        title: newsItem.title,
        description: newsItem.description,
        url: newsItem.url || null,
        source: newsItem.source || "Sector Update",
        publishedAt: newsItem.publishedAt || new Date().toISOString(),
        imageUrl: newsItem.imageUrl || null,
        changePercent: newsItem.changePercent,
      };

      setNews((prevNews) => {
        const exists = prevNews.some(
          (item) =>
            item._id === transformedNews._id ||
            (item.url && item.url === transformedNews.url)
        );

        if (exists) {
          console.log("⚠️ Sector news already exists, skipping");
          return prevNews;
        }

        console.log("✅ Adding new sector news to top");
        return [transformedNews, ...prevNews];
      });

      setLastUpdate(new Date());
    };

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on("disconnect", onDisconnect);
    socket.on("latestNews", onLatestNews);
    socket.on("sectorNews", onSectorNews);

    if (userId && socket.connected) {
      socket.emit("registerUser", userId);
    }

    return () => {
      if (!socketRef.current) return;
      console.log("🧹 Cleaning up news socket listeners");
      socketRef.current.off("connect", onConnect);
      socketRef.current.off("connect_error", onConnectError);
      socketRef.current.off("disconnect", onDisconnect);
      socketRef.current.off("latestNews", onLatestNews);
      socketRef.current.off("sectorNews", onSectorNews);
      try {
        socketRef.current.disconnect();
      } catch (e) {
        console.warn("Error disconnecting socket during cleanup", e);
      }
    };
  }, [userId]);

  const formatTimeAgo = (date) => {
    if (!date) return "";
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const NewsSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="flex space-x-2 mt-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className={`p-4 sm:p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Newspaper className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Latest Market News
              </h2>
              {lastUpdate && (
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>Updated {formatTimeAgo(lastUpdate)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Font Style Selector */}

            {/* Live indicator */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                {news.length} articles
              </span>
            </div>
          </div>
        </div>

        {/* News Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, idx) => (
              <NewsSkeleton key={idx} />
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Newspaper className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No news available at the moment
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
              Waiting for updates...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {news.map((item, idx) => {
              const newsDate = item.publishedAt
                ? new Date(item.publishedAt)
                : null;

              const key =
                item._id || `${item.url || idx}-${newsDate?.getTime() || idx}`;

              const isSectorNews = item.changePercent !== undefined;
              const isProfit = isSectorNews && item.changePercent > 0;
              const isLoss = isSectorNews && item.changePercent < 0;

              return (
                <article
                  key={key}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow duration-300  group"
                  onClick={() => item.url && window.open(item.url, "_blank")}
                >
                  {/* Header with icon/image */}
                  <div className="flex items-start space-x-3 mb-3">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="w-10 h-10 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0`}
                      >
                        <ScrollText className="w-5 h-5 dark:text-white" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-2">
                        {item.title || "Untitled"}
                      </h4>
                    </div>
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className="text-sm dark:text-white line-clamp-3 mb-3">
                      {item.description}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      {item.source && (
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {item.source}
                        </span>
                      )}
                      {newsDate && (
                        <>
                          <span>•</span>
                          <span>{formatTimeAgo(newsDate)}</span>
                        </>
                      )}
                    </div>

                    {item.url && (
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 dark:text-gray-400" />
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default News;
