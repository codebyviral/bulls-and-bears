import { useState, useEffect, useRef } from "react";

const SearchBar = ({ shares = [], onSelectShare }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Handle search input
  const handleSearch = (value) => {
    setSearchQuery(value);

    if (value.trim()) {
      const filtered = shares.filter(
        (item) =>
          item.symbol?.toLowerCase().includes(value.toLowerCase()) ||
          item.sharename?.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setIsActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle suggestion selection
  const handleSuggestionClick = (share) => {
    setSearchQuery(share.symbol);
    setShowSuggestions(false);
    setIsActive(false);

    // Call the callback function if provided
    if (onSelectShare) {
      onSelectShare(share);
    }

    console.log("Selected share:", share);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setShowSuggestions(false);
      setIsActive(false);
      searchRef.current?.blur();
    }
  };

  const getTypeColor = (sharename) => {
    // Determine type based on sharename
    if (sharename?.includes("Bank") || sharename?.includes("Finance")) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    } else if (
      sharename?.includes("Pharma") ||
      sharename?.includes("Hospital") ||
      sharename?.includes("Laboratories")
    ) {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    } else if (sharename?.includes("Motors") || sharename?.includes("Auto")) {
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  };

  const calculateChange = (share) => {
    if (!share?.lastHistory) return { amount: 0, percent: 0 };

    const currentPrice = Number(share.price ?? share.lastHistory.close);
    const openPrice = Number(share.lastHistory.open);
    const changeAmount = currentPrice - openPrice;
    const changePercent =
      openPrice !== 0 ? (changeAmount / openPrice) * 100 : 0;

    return {
      amount: changeAmount,
      percent: changePercent,
    };
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border transition-all duration-200 ${
          isActive
            ? "border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20 dark:ring-blue-400/20"
            : "border-gray-200 dark:border-gray-700"
        }`}
      >
        <div className="flex items-center px-4 py-3">
          {/* Search Icon */}
          <svg
            className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          {/* Input Field */}
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsActive(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search symbols (e.g., RIL, HDFC, INFY)..."
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-sm sm:text-base"
          />

          {/* Clear Button */}
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSuggestions([]);
                setShowSuggestions(false);
              }}
              className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            {suggestions.map((share) => {
              const change = calculateChange(share);
              const isPositive = change.amount >= 0;

              return (
                <button
                  key={share.shareId}
                  onClick={() => handleSuggestionClick(share)}
                  className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {share.symbol?.slice(0, 2) || "??"}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {share.symbol}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                              share.sharename
                            )}`}
                          >
                            Stock
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {share.sharename}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(
                          share.price || share.lastHistory?.close || 0
                        )}
                      </div>
                      <div
                        className={`text-xs font-medium ${
                          isPositive
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {change.percent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* No results message */}
      {showSuggestions && searchQuery && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-6 text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No results found for "{searchQuery}"
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              Try searching for RIL, HDFC, INFY, or TCS
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
