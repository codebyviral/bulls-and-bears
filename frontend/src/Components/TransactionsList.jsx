import React, { useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  Search,
  Calendar,
  Eye,
  ArrowUpDown,
  BarChart3,
  RefreshCw,
  BriefcaseBusiness,
  ReceiptIndianRupee,
} from "lucide-react";
import { useDarkModeStore, userAuthenticatedStore } from "../store";
import { toast } from "react-toastify";
import { getUser } from "../Services";
import { jsPDF } from "jspdf";

const TransactionsList = () => {
  const { globalDarkState } = useDarkModeStore();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedDate, setSelectedDate] = useState("");
  const [sortBy, setSortBy] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isMobileView, setIsMobileView] = useState(false);

  const captureRef = useRef();

  // Check screen size for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const userId = userAuthenticatedStore((state) => state.userId);

  // API Integration placeholder
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await getUser(userId);
      console.log("🚀 ~ fetchTransactions ~ res:", res);
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setTransactions(res.user.trades);
      // toast.success("Transactions loaded successfully!");
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Fixed formatDate function that handles both data formats
  const formatDate = (timestamp) => {
    let dateValue;

    // Handle different timestamp formats
    if (typeof timestamp === "string") {
      // Direct string format from your actual data
      dateValue = new Date(timestamp);
    } else if (timestamp && timestamp.$date) {
      // MongoDB format from mock data
      dateValue = new Date(timestamp.$date);
    } else {
      // Fallback
      dateValue = new Date(timestamp);
    }

    // Check if the date is valid
    if (isNaN(dateValue.getTime())) {
      return "Invalid Date";
    }

    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateValue);
  };

  // Filter and sort transactions (removed pagination logic)
  const filteredTransactions = transactions
    .filter((transaction) => {
      const matchesSearch = transaction.sharename
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType =
        selectedType === "ALL" || transaction.type === selectedType;

      // Handle date filtering with both formats
      let transactionDate;
      if (typeof transaction.timestamp === "string") {
        transactionDate = new Date(transaction.timestamp);
      } else if (transaction.timestamp && transaction.timestamp.$date) {
        transactionDate = new Date(transaction.timestamp.$date);
      } else {
        transactionDate = new Date(transaction.timestamp);
      }

      const matchesDate =
        !selectedDate ||
        (transactionDate.getTime() &&
          transactionDate.toDateString() ===
            new Date(selectedDate).toDateString());

      return matchesSearch && matchesType && matchesDate;
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "timestamp":
          // Handle both timestamp formats for sorting
          if (typeof a.timestamp === "string") {
            aValue = new Date(a.timestamp);
            bValue = new Date(b.timestamp);
          } else if (a.timestamp && a.timestamp.$date) {
            aValue = new Date(a.timestamp.$date);
            bValue = new Date(b.timestamp.$date);
          } else {
            aValue = new Date(a.timestamp);
            bValue = new Date(b.timestamp);
          }
          break;
        case "price":
          aValue = a.price;
          bValue = b.price;
          break;
        case "quantity":
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case "sharename":
          aValue = a.sharename.toLowerCase();
          bValue = b.sharename.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const downloadPdf = async () => {
    if (filteredTransactions.length === 0) {
      return toast.error("No transactions to export");
    }

    try {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;

      let yPos = margin;

      // Title
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("Transaction History", margin, yPos);
      yPos += 8;

      // Subtitle with date
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100);
      pdf.text(
        `Generated on ${new Date().toLocaleString("en-IN")}`,
        margin,
        yPos
      );
      yPos += 10;

      // Statistics
      pdf.setFontSize(9);
      pdf.setTextColor(60);
      const totalVolume = filteredTransactions.reduce(
        (sum, t) => sum + t.price * t.quantity,
        0
      );
      const stats = [
        `Total Transactions: ${filteredTransactions.length}`,
        `Buy Orders: ${
          filteredTransactions.filter((t) => t.type === "BUY").length
        }`,
        `Sell Orders: ${
          filteredTransactions.filter((t) => t.type === "SELL").length
        }`,
        `Total Volume: Rs. ${totalVolume.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
      ];
      pdf.text(stats.join("  |  "), margin, yPos);
      yPos += 10;

      // Table setup
      const headers = [
        "Date & Time",
        "Share Name",
        "Type",
        "Quantity",
        "Price",
        "Total Value",
      ];
      const colWidths = [40, 50, 20, 25, 35, 40]; // Adjusted column widths

      // Calculate total width and adjust if needed
      const totalWidth = colWidths.reduce((a, b) => a + b, 0);
      const scale = contentWidth / totalWidth;
      const scaledWidths = colWidths.map((w) => w * scale);

      // Helper function to draw table row
      const drawRow = (data, isBold = false, bgColor = null) => {
        if (yPos > pageHeight - 20) {
          pdf.addPage();
          yPos = margin;
        }

        pdf.setFont("helvetica", isBold ? "bold" : "normal");
        pdf.setFontSize(8);

        if (bgColor) {
          pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
          pdf.rect(margin, yPos - 4, contentWidth, 8, "F");
        }

        pdf.setTextColor(0);
        let xPos = margin;

        data.forEach((text, i) => {
          const cellWidth = scaledWidths[i];

          // Handle text wrapping for long content
          const lines = pdf.splitTextToSize(String(text), cellWidth - 2);
          pdf.text(lines[0], xPos + 1, yPos);

          xPos += cellWidth;
        });

        yPos += 8;
      };

      // Draw header
      pdf.setTextColor(255);
      drawRow(headers, true, [70, 130, 180]);
      pdf.setTextColor(0);

      // Draw separator line
      pdf.setDrawColor(200);
      pdf.line(margin, yPos - 4, pageWidth - margin, yPos - 4);

      // Draw data rows
      filteredTransactions.forEach((transaction, index) => {
        const rowData = [
          formatDate(transaction.timestamp),
          transaction.sharename,
          transaction.type,
          transaction.quantity.toLocaleString(),
          `Rs. ${transaction.price.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          `Rs. ${(transaction.quantity * transaction.price).toLocaleString(
            "en-IN",
            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
          )}`,
        ];

        // Alternate row colors
        const bgColor = index % 2 === 0 ? [245, 245, 245] : null;
        drawRow(rowData, false, bgColor);
      });

      // Footer on last page
      pdf.setFontSize(8);
      pdf.setTextColor(150);
      pdf.text(
        `Page ${pdf.internal.getNumberOfPages()}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );

      // Save the PDF
      const fileName = `transactions_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;
      pdf.save(fileName);
      toast.success("PDF downloaded successfully!");
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      toast.error("Failed to generate PDF. See console for details.");
    }
  };

  const exportTransactions = async () => {
    var element = document.getElementById("download-content");
    document
      .querySelectorAll("#download-content, #download-content *")
      .forEach((el) => el.removeAttribute("style"));

    console.log("--- downloading... ---");
  };

  // Mobile card component
  const MobileTransactionCard = ({ transaction }) => (
    <div
      className={`p-4 mb-4 rounded-xl border transition-all duration-300 ${
        globalDarkState
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      } hover:shadow-lg`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3
            className={`font-semibold text-lg ${
              globalDarkState ? "text-white" : "text-gray-900"
            }`}
          >
            {transaction.sharename}
          </h3>
          <p
            className={`text-sm ${
              globalDarkState ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {formatDate(transaction.timestamp)}
          </p>
        </div>
        <span
          className={`px-3 py-1 text-sm font-semibold rounded-full ${
            globalDarkState
              ? "bg-gray-700 text-gray-300"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {transaction.type}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p
            className={`text-sm ${
              globalDarkState ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Quantity
          </p>
          <p
            className={`font-medium ${
              globalDarkState ? "text-white" : "text-gray-900"
            }`}
          >
            {transaction.quantity.toLocaleString()}
          </p>
        </div>

        <div>
          <p
            className={`text-sm ${
              globalDarkState ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Price
          </p>
          <p
            className={`font-medium ${
              globalDarkState ? "text-white" : "text-gray-900"
            }`}
          >
            {formatCurrency(transaction.price)}
          </p>
        </div>

        <div className="col-span-2">
          <p
            className={`text-sm ${
              globalDarkState ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Total Value
          </p>
          <p
            className={`font-bold text-lg ${
              globalDarkState ? "text-white" : "text-gray-900"
            }`}
          >
            {formatCurrency(transaction.quantity * transaction.price)}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        globalDarkState ? "dark bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="p-3 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
            <div>
              <h1
                className={`text-2xl sm:text-3xl font-bold mb-2 ${
                  globalDarkState ? "text-white" : "text-gray-900"
                }`}
              >
                Transaction History
              </h1>
              <p
                className={`text-sm ${
                  globalDarkState ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Track all your trading activities and portfolio changes
              </p>
            </div>
            <button
              onClick={fetchTransactions}
              disabled={loading}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 w-full sm:w-auto ${
                globalDarkState
                  ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {[
              {
                label: "Total Transactions",
                value: transactions.length,
                icon: BarChart3,
              },
              {
                label: "Buy Orders",
                value: transactions.filter((t) => t.type === "BUY").length,
                icon: BriefcaseBusiness,
              },
              {
                label: "Sell Orders",
                value: transactions.filter((t) => t.type === "SELL").length,
                icon: ReceiptIndianRupee,
              },
              {
                label: "Total Volume",
                value: formatCurrency(
                  transactions.reduce((sum, t) => sum + t.price * t.quantity, 0)
                ),
                icon: Eye,
              },
            ].map((stat, index) => (
              <div
                key={index}
                className={`p-3 sm:p-4 rounded-xl border transition-all duration-300 ${
                  globalDarkState
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                } hover:shadow-lg`}
              >
                <div className="flex items-center justify-between mb-2">
                  <stat.icon
                    size={16}
                    className={
                      globalDarkState ? "text-blue-400" : "text-blue-600"
                    }
                  />
                </div>
                <p
                  className={`text-lg sm:text-2xl font-bold mb-1 ${
                    globalDarkState ? "text-white" : "text-gray-900"
                  } ${
                    stat.label === "Total Volume" ? "text-sm sm:text-lg" : ""
                  }`}
                >
                  {stat.value}
                </p>
                <p
                  className={`text-xs sm:text-sm ${
                    globalDarkState ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div
          className={`p-4 sm:p-6 rounded-2xl border mb-4 sm:mb-6 transition-all duration-300 ${
            globalDarkState
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative">
              <div
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  globalDarkState ? "text-gray-400" : "text-gray-400"
                }`}
              >
                <Search size={16} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${
                  globalDarkState
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                }`}
                placeholder="Search shares..."
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={`px-4 py-2 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${
                globalDarkState
                  ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                  : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
              }`}
            >
              <option value="ALL">All Types</option>
              <option value="BUY">Buy Orders</option>
              <option value="SELL">Sell Orders</option>
            </select>

            {/* Date Filter */}
            <div className="relative">
              <div
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  globalDarkState ? "text-gray-400" : "text-gray-400"
                }`}
              >
                <Calendar size={16} />
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${
                  globalDarkState
                    ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                    : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
            </div>

            {/* Export Button */}
            <button
              onClick={() => downloadPdf()}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export PDF</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>

        {/* Transactions Display */}
        {loading ? (
          <div
            className={`rounded-2xl border p-8 transition-all duration-300 ${
              globalDarkState
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span
                className={`ml-3 ${
                  globalDarkState ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Loading transactions...
              </span>
            </div>
          </div>
        ) : isMobileView ? (
          /* Mobile View - Cards */
          <div>
            {filteredTransactions.length === 0 ? (
              <div
                className={`p-8 rounded-2xl border text-center ${
                  globalDarkState
                    ? "bg-gray-800 border-gray-700 text-gray-300"
                    : "bg-white border-gray-200 text-gray-600"
                }`}
              >
                No transactions found matching your filters.
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <MobileTransactionCard
                  key={transaction._id}
                  transaction={transaction}
                />
              ))
            )}
          </div>
        ) : (
          /* Desktop View - Table */
          <div
            className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
              globalDarkState
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div
              ref={captureRef}
              id="download-content"
              className="overflow-x-auto"
            >
              <table className="w-full">
                <thead
                  className={globalDarkState ? "bg-gray-700" : "bg-gray-50"}
                >
                  <tr>
                    {[
                      { key: "timestamp", label: "Date & Time" },
                      { key: "sharename", label: "Share Name" },
                      { key: "type", label: "Type" },
                      { key: "quantity", label: "Quantity" },
                      { key: "price", label: "Price" },
                      { key: "total", label: "Total Value" },
                    ].map((header) => (
                      <th
                        key={header.key}
                        className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-75 ${
                          globalDarkState
                            ? "text-gray-300 hover:bg-gray-600"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}
                        onClick={() =>
                          header.key !== "total" && handleSort(header.key)
                        }
                      >
                        <div className="flex items-center gap-1">
                          {header.label}
                          {header.key !== "total" && <ArrowUpDown size={12} />}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className={`px-6 py-8 text-center ${
                          globalDarkState ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        No transactions found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <tr
                        key={transaction._id}
                        className={`transition-colors duration-150 ${
                          globalDarkState
                            ? "hover:bg-gray-700"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm ${
                            globalDarkState ? "text-gray-300" : "text-gray-900"
                          }`}
                        >
                          {formatDate(transaction.timestamp)}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                            globalDarkState ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {transaction.sharename}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              globalDarkState
                                ? "bg-gray-700 text-gray-300"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {transaction.type}
                          </span>
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm ${
                            globalDarkState ? "text-gray-300" : "text-gray-900"
                          }`}
                        >
                          {transaction.quantity.toLocaleString()}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm ${
                            globalDarkState ? "text-gray-300" : "text-gray-900"
                          }`}
                        >
                          {formatCurrency(transaction.price)}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                            globalDarkState ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {formatCurrency(
                            transaction.quantity * transaction.price
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Results Summary */}
        {!loading && (
          <div
            className={`mt-6 p-4 rounded-2xl border text-center ${
              globalDarkState
                ? "bg-gray-800 border-gray-700 text-gray-400"
                : "bg-white border-gray-200 text-gray-700"
            }`}
          >
            <div className="text-sm">
              Showing {filteredTransactions.length} of {transactions.length}{" "}
              transactions
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsList;
