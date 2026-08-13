import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  X,
  TrendingUp,
  DollarSign,
  Package,
  CheckCircle,
  XCircle,
  Users,
  Clock,
  Calendar,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";

export default function Ipo() {
  const [ipos, setIpos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // --- Existing fields ---
  const [formData, setFormData] = useState({
    companyName: "",
    symbol: "",
    lotSize: "",
    totalLots: "",
    minPrice: "",
    maxPrice: "",
    openTime: "",
    closeTime: "",
    allotmentTime: "",

    // --- New optional fields to match backend model additions ---
    image: "",
    issueSizeCr: "",
    freshIssueCr: "",
    ofsCr: "",
    totalSharesOffered: "",
    anchorDate: "",
    retailPercent: "",
    qibPercent: "",
    hniPercent: "",
    employeePercent: "",
    otherPercent: "",
    overallX: "",
    qibX: "",
    hniX: "",
    retailX: "",
    employeeX: "",
    listingPrice: "",
  });
  const [formError, setFormError] = useState("");

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const fetchIPOs = async () => {
    setIsLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Authentication token not found. Please login again.");
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/ipo/getallipo`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setIpos(data);
      } else {
        setError(data.message || data.error || "Failed to fetch IPOs");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIPOs();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateIPO = async () => {
    setFormError("");

    // Required validations (existing)
    if (
      !formData.companyName ||
      !formData.symbol ||
      !formData.lotSize ||
      !formData.totalLots ||
      !formData.minPrice ||
      !formData.maxPrice ||
      !formData.openTime ||
      !formData.closeTime ||
      !formData.allotmentTime
    ) {
      setFormError("All fields in the basic sections are required");
      return;
    }

    const openTime = new Date(formData.openTime);
    const closeTime = new Date(formData.closeTime);
    const allotmentTime = new Date(formData.allotmentTime);

    if (closeTime <= openTime) {
      setFormError("Close time must be after open time");
      return;
    }
    if (allotmentTime <= closeTime) {
      setFormError("Allotment time must be after close time");
      return;
    }

    // Build payload: preserve your original + add new fields in correct nested shape
    const payload = {
      companyName: formData.companyName,
      symbol: formData.symbol,
      lotSize: parseInt(formData.lotSize),
      totalLots: parseInt(formData.totalLots),
      priceBand: [parseFloat(formData.minPrice), parseFloat(formData.maxPrice)],
      openTime: formData.openTime,
      closeTime: formData.closeTime,
      allotmentTime: formData.allotmentTime,
      status: "upcoming",
      appliedUsers: [],
      allocatedUsers: [],

      // NEW: flat fields
      image: formData.image?.trim() || null,
      issueSizeCr: formData.issueSizeCr
        ? parseFloat(formData.issueSizeCr)
        : null,
      totalSharesOffered: formData.totalSharesOffered
        ? parseInt(formData.totalSharesOffered)
        : null,
      anchorDate: formData.anchorDate || null,
      listingPrice: formData.listingPrice
        ? parseFloat(formData.listingPrice)
        : null,

      // NEW: nested objects
      issueBreakup: {
        freshIssueCr: formData.freshIssueCr
          ? parseFloat(formData.freshIssueCr)
          : null,
        ofsCr: formData.ofsCr ? parseFloat(formData.ofsCr) : null,
      },
      reservations: {
        retailPercent: formData.retailPercent
          ? parseFloat(formData.retailPercent)
          : null,
        qibPercent: formData.qibPercent
          ? parseFloat(formData.qibPercent)
          : null,
        hniPercent: formData.hniPercent
          ? parseFloat(formData.hniPercent)
          : null,
        employeePercent: formData.employeePercent
          ? parseFloat(formData.employeePercent)
          : null,
        otherPercent: formData.otherPercent
          ? parseFloat(formData.otherPercent)
          : null,
      },
      subscription: {
        overallX: formData.overallX ? parseFloat(formData.overallX) : null,
        qibX: formData.qibX ? parseFloat(formData.qibX) : null,
        hniX: formData.hniX ? parseFloat(formData.hniX) : null,
        retailX: formData.retailX ? parseFloat(formData.retailX) : null,
        employeeX: formData.employeeX ? parseFloat(formData.employeeX) : null,
      },
    };

    setCreateLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/ipo/createipo`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok) {
        showToast("IPO created successfully!", "success");
        setFormData({
          companyName: "",
          symbol: "",
          lotSize: "",
          totalLots: "",
          minPrice: "",
          maxPrice: "",
          openTime: "",
          closeTime: "",
          allotmentTime: "",
          image: "",
          issueSizeCr: "",
          freshIssueCr: "",
          ofsCr: "",
          totalSharesOffered: "",
          anchorDate: "",
          retailPercent: "",
          qibPercent: "",
          hniPercent: "",
          employeePercent: "",
          otherPercent: "",
          overallX: "",
          qibX: "",
          hniX: "",
          retailX: "",
          employeeX: "",
          listingPrice: "",
        });
        setTimeout(() => {
          setShowAddModal(false);
          fetchIPOs();
        }, 1500);
      } else {
        setFormError(data.message || data.error || "Failed to create IPO");
      }
    } catch (err) {
      console.error("Create error:", err);
      setFormError("Network error. Please try again.");
    } finally {
      setCreateLoading(false);
    }
  };

  const canPerformAction = (ipo, action) => {
    const status = ipo.status?.toLowerCase();
    switch (action) {
      case "open":
        return status === "upcoming";
      case "close":
        return status === "open";
      case "allocate":
        return status === "closed";
      default:
        return false;
    }
  };

  const handleIPOAction = async (id, action) => {
    setActionLoading(`${action}-${id}`);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showToast("Authentication token not found", "error");
        setActionLoading(null);
        return;
      }

      const endpoints = {
        open: `${import.meta.env.VITE_BACKEND_URL}/ipo/startipo/${id}`,
        close: `${import.meta.env.VITE_BACKEND_URL}/ipo/closeipo/${id}`,
        allocate: `${import.meta.env.VITE_BACKEND_URL}/ipo/allocateipo/${id}`,
      };

      const response = await fetch(endpoints[action], {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        const actionText =
          action === "allocate"
            ? "allocated"
            : action === "open"
            ? "opened"
            : "closed";
        showToast(`IPO ${actionText} successfully!`, "success");
        await fetchIPOs();
      } else {
        showToast(
          data.message || data.error || `Failed to ${action} IPO`,
          "error"
        );
      }
    } catch (err) {
      console.error(`${action} error:`, err);
      showToast("Network error. Please try again.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    const colors = {
      upcoming: "bg-blue-100 text-blue-800 border-blue-200",
      open: "bg-green-100 text-green-800 border-green-200",
      closed: "bg-orange-100 text-orange-800 border-orange-200",
      allocated: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return colors[statusLower] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeStatus = (targetTime) => {
    if (!targetTime) return "N/A";
    const diff = new Date(targetTime) - new Date();
    if (diff > 0) {
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      if (days > 0) return `${days}d ${hours}h`;
      if (hours > 0) return `${hours}h`;
      return "Soon";
    }
    return "Past";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg border ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <p className="font-medium">{toast.message}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <button
            onClick={() => (window.location.href = "/")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                IPO Management
              </h1>
              <p className="text-gray-600">Monitor and manage IPO offerings</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition"
            >
              <Plus className="w-5 h-5" />
              <span>Create IPO</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading IPOs...</p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {ipos.length === 0 ? (
              <div className="col-span-full bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No IPOs Available
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first IPO listing
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create IPO</span>
                </button>
              </div>
            ) : (
              ipos.map((ipo) => {
                // NEW: derived helpers for safe display
                const upperBand = Array.isArray(ipo.priceBand)
                  ? ipo.priceBand[1]
                  : null;
                const lotValueUpper =
                  ipo.lotValueAtUpperBand ??
                  (upperBand && ipo.lotSize ? upperBand * ipo.lotSize : null);
                const overallSub =
                  ipo.subscription?.overallX ?? ipo.overallSubscription ?? null; // fallback to old field if it existed

                return (
                  <div
                    key={ipo._id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-md transition"
                  >
                    {/* NEW: Image banner if provided */}
                    {ipo.image ? (
                      <div className="h-28 w-full bg-gray-100 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ipo.image}
                          alt={`${ipo.companyName} banner`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : null}

                    <div className="bg-gray-50 p-4 border-b border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {ipo.companyName}
                          </h3>
                          <p className="text-gray-600 text-sm font-medium">
                            NSE: {ipo.symbol}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase border ${getStatusColor(
                            ipo.status
                          )}`}
                        >
                          {ipo.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-md border border-gray-200">
                          <Package className="w-4 h-4 text-gray-500" />
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500">
                              Lot Size
                            </span>
                            <span className="text-gray-900 font-semibold">
                              {ipo.lotSize}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-md border border-gray-200">
                          <Users className="w-4 h-4 text-gray-500" />
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500">
                              Total Lots
                            </span>
                            <span className="text-gray-900 font-semibold">
                              {ipo.totalLots || "N/A"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-md border border-gray-200">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500">
                              Price Band
                            </span>
                            <span className="text-gray-900 font-semibold">
                              ₹{ipo.priceBand?.[0]}-{ipo.priceBand?.[1]}
                            </span>
                          </div>
                        </div>

                        {/* UPDATED: Subscription uses nested field */}
                        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-md border border-gray-200">
                          <TrendingUp className="w-4 h-4 text-gray-500" />
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500">
                              Subscription
                            </span>
                            <span
                              className={`font-semibold ${
                                parseFloat(overallSub || 0) >= 1
                                  ? "text-green-600"
                                  : "text-orange-600"
                              }`}
                            >
                              {overallSub ? `${overallSub}x` : "0.00x"}
                            </span>
                          </div>
                        </div>

                        {/* NEW: Listing & Per Lot convenience */}
                        {ipo.listingPrice ? (
                          <div className="col-span-1 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-md border border-gray-200">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500">
                                Listing Price
                              </span>
                              <span className="text-gray-900 font-semibold">
                                ₹{ipo.listingPrice}
                              </span>
                            </div>
                          </div>
                        ) : null}
                        {lotValueUpper ? (
                          <div className="col-span-1 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-md border border-gray-200">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500">
                                Lot @ Upper Band
                              </span>
                              <span className="text-gray-900 font-semibold">
                                ₹{lotValueUpper}
                              </span>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="space-y-2 mb-4">
                        {[
                          {
                            label: "Opening",
                            time: ipo.openTime,
                            icon: Clock,
                            color: "text-green-600",
                          },
                          {
                            label: "Closing",
                            time: ipo.closeTime,
                            icon: Clock,
                            color: "text-orange-600",
                          },
                          {
                            label: "Allotment",
                            time: ipo.allotmentTime,
                            icon: Calendar,
                            color: "text-purple-600",
                          },
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200"
                          >
                            <div className="flex items-center gap-3">
                              <div className="bg-white rounded-md p-2 border border-gray-200">
                                <item.icon
                                  className={`w-4 h-4 ${item.color}`}
                                />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">
                                  {item.label}
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  {formatDateTime(item.time)}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`text-xs font-semibold ${item.color}`}
                            >
                              {getTimeStatus(item.time)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {[
                          {
                            action: "open",
                            label: "Open",
                            icon: CheckCircle,
                            color: "green",
                          },
                          {
                            action: "close",
                            label: "Close",
                            icon: XCircle,
                            color: "orange",
                          },
                          {
                            action: "allocate",
                            label: "Allocate",
                            icon: DollarSign,
                            color: "purple",
                          },
                        ].map((btn) => {
                          const isEnabled = canPerformAction(ipo, btn.action);
                          const isProcessing =
                            actionLoading === `${btn.action}-${ipo._id}`;

                          return (
                            <button
                              key={btn.action}
                              onClick={() =>
                                handleIPOAction(ipo._id, btn.action)
                              }
                              disabled={!isEnabled || isProcessing}
                              className={`flex flex-col items-center justify-center p-3 rounded-lg font-medium transition ${
                                isEnabled
                                  ? `hover:opacity-90 text-white shadow-sm cursor-pointer`
                                  : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                              }`}
                              style={
                                isEnabled
                                  ? {
                                      backgroundColor:
                                        btn.color === "green"
                                          ? "#059669"
                                          : btn.color === "orange"
                                          ? "#ea580c"
                                          : "#9333ea",
                                    }
                                  : {}
                              }
                            >
                              {isProcessing ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                              ) : (
                                <>
                                  <btn.icon className="w-5 h-5 mb-1" />
                                  <span className="text-xs">{btn.label}</span>
                                </>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Create New IPO
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormError("");
                }}
                className="text-gray-400 hover:text-gray-600 transition"
                disabled={createLoading}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[calc(90vh-80px)]">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-red-800 font-medium">{formError}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* Company Information */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Company Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder="Tech Inc"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={createLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Symbol
                      </label>
                      <input
                        type="text"
                        name="symbol"
                        value={formData.symbol}
                        onChange={handleInputChange}
                        placeholder="TECH"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={createLoading}
                      />
                    </div>
                  </div>

                  {/* NEW: Image URL */}
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Image URL (optional)
                    </label>
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-gray-500" />
                      <input
                        type="url"
                        name="image"
                        value={formData.image}
                        onChange={handleInputChange}
                        placeholder="https://…/banner.png"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={createLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* Lot Details */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    Lot Details
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Lot Size
                      </label>
                      <input
                        type="number"
                        name="lotSize"
                        value={formData.lotSize}
                        onChange={handleInputChange}
                        placeholder="100"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={createLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Total Lots
                      </label>
                      <input
                        type="number"
                        name="totalLots"
                        value={formData.totalLots}
                        onChange={handleInputChange}
                        placeholder="10000"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={createLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* Price Band */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Price Band (₹)
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Min Price
                      </label>
                      <input
                        type="number"
                        name="minPrice"
                        value={formData.minPrice}
                        onChange={handleInputChange}
                        placeholder="100"
                        step="0.01"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={createLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Max Price
                      </label>
                      <input
                        type="number"
                        name="maxPrice"
                        value={formData.maxPrice}
                        onChange={handleInputChange}
                        placeholder="120"
                        step="0.01"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={createLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
                  </h3>
                  <div className="space-y-3">
                    {[
                      { name: "openTime", label: "Opening Time" },
                      { name: "closeTime", label: "Closing Time" },
                      { name: "allotmentTime", label: "Allotment Time" },
                    ].map((field) => (
                      <div key={field.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {field.label}
                        </label>
                        <input
                          type="datetime-local"
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={createLoading}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advanced (optional) */}
                <div className="bg-gray-50 rounded-lg border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced((s) => !s)}
                    className="w-full flex items-center justify-between px-4 py-3"
                  >
                    <span className="text-sm font-semibold text-gray-700">
                      Advanced (optional)
                    </span>
                    <span className="text-xs text-gray-500">
                      {showAdvanced ? "Hide" : "Show"}
                    </span>
                  </button>

                  {showAdvanced && (
                    <div className="p-4 pt-0 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Issue Size (₹ Cr)
                          </label>
                          <input
                            type="number"
                            name="issueSizeCr"
                            value={formData.issueSizeCr}
                            onChange={handleInputChange}
                            placeholder="17200"
                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                            disabled={createLoading}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Total Shares Offered
                          </label>
                          <input
                            type="number"
                            name="totalSharesOffered"
                            value={formData.totalSharesOffered}
                            onChange={handleInputChange}
                            placeholder="34128000"
                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                            disabled={createLoading}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Fresh Issue (₹ Cr)
                          </label>
                          <input
                            type="number"
                            name="freshIssueCr"
                            value={formData.freshIssueCr}
                            onChange={handleInputChange}
                            placeholder="6200"
                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                            disabled={createLoading}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            OFS (₹ Cr)
                          </label>
                          <input
                            type="number"
                            name="ofsCr"
                            value={formData.ofsCr}
                            onChange={handleInputChange}
                            placeholder="11000"
                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                            disabled={createLoading}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Anchor Date
                          </label>
                          <input
                            type="datetime-local"
                            name="anchorDate"
                            value={formData.anchorDate}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                            disabled={createLoading}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Listing Price (₹)
                          </label>
                          <input
                            type="number"
                            name="listingPrice"
                            value={formData.listingPrice}
                            onChange={handleInputChange}
                            placeholder="540"
                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                            disabled={createLoading}
                          />
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-gray-600 mb-2">
                          Reservations (%)
                        </h4>
                        <div className="grid grid-cols-5 gap-3">
                          {[
                            { name: "retailPercent", label: "Retail" },
                            { name: "qibPercent", label: "QIB" },
                            { name: "hniPercent", label: "HNI" },
                            { name: "employeePercent", label: "Employee" },
                            { name: "otherPercent", label: "Other" },
                          ].map((f) => (
                            <div key={f.name}>
                              <label className="block text-[11px] font-medium text-gray-600 mb-1">
                                {f.label}
                              </label>
                              <input
                                type="number"
                                name={f.name}
                                value={formData[f.name]}
                                onChange={handleInputChange}
                                placeholder="e.g., 35"
                                className="w-full bg-white border border-gray-300 rounded-lg px-2 py-2 text-sm"
                                disabled={createLoading}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-gray-600 mb-2">
                          Subscription (x)
                        </h4>
                        <div className="grid grid-cols-5 gap-3">
                          {[
                            { name: "overallX", label: "Overall" },
                            { name: "qibX", label: "QIB" },
                            { name: "hniX", label: "HNI" },
                            { name: "retailX", label: "Retail" },
                            { name: "employeeX", label: "Employee" },
                          ].map((f) => (
                            <div key={f.name}>
                              <label className="block text-[11px] font-medium text-gray-600 mb-1">
                                {f.label}
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                name={f.name}
                                value={formData[f.name]}
                                onChange={handleInputChange}
                                placeholder="e.g., 8.5"
                                className="w-full bg-white border border-gray-300 rounded-lg px-2 py-2 text-sm"
                                disabled={createLoading}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setFormError("");
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 font-medium hover:bg-gray-50 transition"
                    disabled={createLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateIPO}
                    disabled={createLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 font-medium shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                        <span>Creating...</span>
                      </div>
                    ) : (
                      "Create IPO"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
