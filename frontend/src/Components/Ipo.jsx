import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useDarkModeStore, userAuthenticatedStore } from "../store";
import { getDecryptedToken } from "../utils/cryptoUtil.js";
import io from "socket.io-client";
import { getIpoStatus } from "../Services/portfolio-service.js";
import { getSocket } from "../lib/socket.js";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const passPhrase = import.meta.env.VITE_PASS_PHRASE;
const socket = getSocket();

// Format date and time nicely
const formatDateTime = (dateStr) => {
  if (!dateStr) return { date: "—", time: "" };
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
    time: d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  };
};

export default function UserIPOPage() {
  const navigate = useNavigate();
  const [ipos, setIpos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [applyIPO, setApplyIPO] = useState(null);
  const [lots, setLots] = useState("");
  const [checkingAllotment, setCheckingAllotment] = useState(null);
  const [allotmentDetails, setAllotmentDetails] = useState(null);
  const [allocatedIPOs, setAllocatedIPOs] = useState([]);
  const [selectedAllocatedIPO, setSelectedAllocatedIPO] = useState(null);
  const [livePrices, setLivePrices] = useState({});
  const [selectedIPO, setSelectedIPO] = useState(null); // NEW: universal details modal

  const isDarkMode = useDarkModeStore((state) => state.globalDarkState);
  const userId = userAuthenticatedStore((state) => state.userId);

  useEffect(() => {
    fetchIPOs();
    if (userId) {
      fetchAllocatedIPOs();
    }

    // Listen for live price updates
    socket.on("ipoLivePrices", (updates) => {
      const priceMap = {};
      (updates || []).forEach((update) => {
        if (!update) return;
        priceMap[update.ipoId] = update.currentPrice;
      });
      setLivePrices((prev) => ({ ...prev, ...priceMap }));
    });

    return () => {
      socket.off("ipoLivePrices");
    };
  }, [userId]);

  const fetchIPOs = async () => {
    try {
      const token = await getDecryptedToken("auth_token", passPhrase);
      const { data } = await axios.get(`${API_BASE}/ipo/getallipo`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIpos(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch IPOs");
    }
  };

  const fetchAllocatedIPOs = async () => {
    try {
      const token = await getDecryptedToken("auth_token", passPhrase);
      const { data } = await axios.get(
        `${API_BASE}/ipo/getAllocatedUser/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const validAllocatedIPOs = (data || [])
        .filter((item) => item?.ipo)
        .map((item) => ({
          _id: item?._id,
          ipo: item?.ipo,
          lots: item?.lotsAllocated ?? item?.lots ?? 0,
          shares:
            item?.sharesAllocated ??
            (item?.lotsAllocated || 0) * (item?.ipo?.lotSize || 0),
          openPrice:
            item?.openPrice ??
            item?.ipo?.listingPrice ??
            (Array.isArray(item?.ipo?.priceBand)
              ? item?.ipo?.priceBand?.[0]
              : null),
          status: item?.status,
          createdAt: item?.createdAt,
        }));
      setAllocatedIPOs(validAllocatedIPOs);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch allocated IPOs");
    }
  };

  const handleApplyIPO = async () => {
    if (!applyIPO) return;

    if (!userId) {
      toast.error("Please log in to apply for IPO");
      return;
    }

    const lotsNum = parseInt(lots);
    if (!lotsNum || lotsNum < 1) {
      toast.error("Please enter a valid number of lots");
      return;
    }

    setLoading(true);
    try {
      const token = await getDecryptedToken("auth_token", passPhrase);
      await axios.post(
        `${API_BASE}/ipo/applyipo/${applyIPO?._id}`,
        {
          userId: userId,
          lots: lotsNum,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(
        `Applied for ${lotsNum} lot(s) in ${applyIPO?.companyName}`
      );
      setApplyIPO(null);
      setLots("");
      fetchIPOs();
      fetchAllocatedIPOs();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Error applying for IPO");
    } finally {
      setLoading(false);
    }
  };

  const openIPOs = (ipos || []).filter((ipo) => ipo?.status === "open");
  const upcomingIPOs = (ipos || []).filter((ipo) => ipo?.status === "upcoming");
  const closedIPOs = (ipos || []).filter((ipo) => ipo?.status === "listed");

  const hasApplied = (ipo) => {
    return (ipo?.appliedUsers || []).some((a) => a?.userId === userId);
  };

  const getAllocatedLots = (ipo) => {
    return (
      (ipo?.allocatedUsers || []).find((a) => a?.userId === userId)?.lots || 0
    );
  };

  const getAppliedLots = (ipo) => {
    return (
      (ipo?.appliedUsers || []).find((a) => a?.userId === userId)?.lots || 0
    );
  };

  const handleCheckAllotment = async (ipo) => {
    if (!userId) {
      toast.error("Please log in to check allotment");
      return;
    }

    setCheckingAllotment(ipo?._id);
    try {
      const res = await getIpoStatus(userId);
      console.log("🚀 ~ handleCheckAllotment ~ res:", res);
      // setAllotmentDetails(res?.data) // plug when service returns details
      if (res?.data?.length === 0) {
        toast.info("No IPO allotment received.");
      } else {
        toast.info("IPO allotment confirmed. Kindly review your positions after few minutes.");
      }
    } catch (error) {
      console.log("🚀 ~ handleCheckAllotment ~ error:", error);
    } finally {
      setCheckingAllotment(null);
    }
  };

  const handleSellIPO = async (ipo, lots) => {
    if (!userId) {
      toast.error("Please log in to sell IPO shares");
      return;
    }

    const confirmSell = window.confirm(
      `Are you sure you want to sell ${lots} lot(s) of ${ipo?.companyName}?`
    );
    if (!confirmSell) return;

    try {
      const token = await getDecryptedToken("auth_token", passPhrase);
      await axios.post(
        `${API_BASE}/ipo/sellipo/${ipo?._id}`,
        {
          userId: userId,
          lots: lots,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`Successfully sold ${lots} lot(s)`);
      fetchIPOs();
      fetchAllocatedIPOs();
      setSelectedAllocatedIPO(null);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Error selling IPO shares");
    }
  };

  const handleLotsChange = (e) => {
    const value = e?.target?.value ?? "";
    if (value === "" || /^\d+$/.test(value)) {
      setLots(value);
    }
  };

  // Calculate price change for display
  const getPriceChange = (ipoId, openPrice) => {
    const currentPrice = livePrices?.[ipoId];
    if (!currentPrice || !openPrice) return { change: 0, percentage: 0 };

    const change = currentPrice - openPrice;
    const percentage = (change / openPrice) * 100;
    return { change, percentage };
  };

  // NEW: helpers to pull nested/newer fields safely
  const getOverallSubscription = (ipo) =>
    ipo?.subscription?.overallX ?? ipo?.overallSubscription ?? 0;

  const getLotAtUpper = (ipo) => {
    if (ipo?.lotValueAtUpperBand) return ipo?.lotValueAtUpperBand;
    const upper = Array.isArray(ipo?.priceBand) ? ipo?.priceBand?.[1] : null;
    return upper && ipo?.lotSize ? upper * ipo?.lotSize : null;
  };

  const CompanyCell = ({ ipo, gradient }) => {
    const hasImage = Boolean(ipo?.image);
    return (
      <div className="flex items-center gap-3">
        {hasImage ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img
            src={ipo?.image}
            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
          />
        ) : (
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold ${gradient} text-white shadow`}
          >
            {(ipo?.symbol || "—").substring(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <div
            className={`font-semibold text-base ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {ipo?.companyName || "—"}
          </div>
          <div
            className={`text-xs mt-0.5 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {ipo?.symbol || "—"} • ₹{ipo?.priceBand?.[0] ?? "—"}- ₹
            {ipo?.priceBand?.[1] ?? "—"}
          </div>

          <div className="flex flex-wrap items-center gap-1 mt-1">
            {ipo?.listingPrice ? (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  isDarkMode
                    ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                Listing ₹{ipo?.listingPrice}
              </span>
            ) : null}
            {ipo?.issueSizeCr ? (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  isDarkMode
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                Issue ₹{ipo?.issueSizeCr} Cr
              </span>
            ) : null}
            {ipo?.reservations?.retailPercent ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                Retail {ipo?.reservations?.retailPercent}%
              </span>
            ) : null}
            {ipo?.reservations?.qibPercent ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                QIB {ipo?.reservations?.qibPercent}%
              </span>
            ) : null}
            {ipo?.reservations?.hniPercent ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                HNI {ipo?.reservations?.hniPercent}%
              </span>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  // --- Sparkline helper (pure SVG, no deps) for selectedIPO modal ---
  const sparklinePoints = useMemo(() => {
    if (!selectedIPO) return null;

    // Build a tiny series from price band and live/current price if any
    const low = Number(selectedIPO?.priceBand?.[0] ?? 0);
    const high = Number(selectedIPO?.priceBand?.[1] ?? low);
    const mid = low && high ? (low + high) / 2 : low || high || 0;

    const lp =
      livePrices?.[selectedIPO?._id] ??
      selectedIPO?.currentPrice ??
      selectedIPO?.listingPrice ??
      high;

    // Create 8 points: start near low, wiggle through mid, end at lp
    const base = [
      low * 0.98,
      low * 1.02,
      mid * 0.98,
      mid * 1.01,
      high * 0.97,
      high,
      (high + lp) / 2,
      lp,
    ].map((v) => (Number.isFinite(v) ? v : 0));

    const min = Math.min(...base);
    const max = Math.max(...base);
    const width = 240;
    const height = 60;
    const padX = 6;
    const padY = 6;

    const toX = (i) => padX + (i * (width - padX * 2)) / (base.length - 1);
    const toY = (v) => {
      if (max === min) return height / 2;
      // invert y for SVG
      return padY + (height - padY * 2) * (1 - (v - min) / (max - min));
    };

    const pts = base.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
    const last = base[base.length - 1];
    const delta = last - base[0];

    return {
      points: pts,
      last,
      delta,
      pct: base[0] ? (delta / base[0]) * 100 : 0,
      width,
      height,
    };
  }, [selectedIPO, livePrices]);

  // Open details modal from any row
  const openIpoDetails = (ipo) => {
    if (!ipo) return;
    setSelectedIPO(ipo);
  };

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <div className="max-w-7xl mx-auto p-6">
        {/* Allocated IPOs Section */}
        {allocatedIPOs?.length > 0 && (
          <div className="mb-10">
            <div className="flex justify-between items-center mb-5">
              <h1
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                My Allocated IPOs
              </h1>
            </div>

            <div
              className={`rounded-xl overflow-hidden shadow-lg ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <table className="w-full">
                <thead
                  className={`${isDarkMode ? "bg-gray-750" : "bg-gray-100"}`}
                >
                  <tr>
                    <th
                      className={`text-left py-4 px-6 text-sm font-semibold ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Company
                    </th>
                    <th
                      className={`text-left py-4 px-6 text-sm font-semibold ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Allocated Lots
                    </th>
                    <th
                      className={`text-left py-4 px-6 text-sm font-semibold ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Current Price
                    </th>
                    <th className="py-4 px-6"></th>
                  </tr>
                </thead>
                <tbody>
                  {(allocatedIPOs || []).map((item) => {
                    if (!item?.ipo) return null;

                    const currentPrice =
                      livePrices?.[item?.ipo?._id] ??
                      item?.ipo?.currentPrice ??
                      item?.ipo?.listingPrice ??
                      (Array.isArray(item?.ipo?.priceBand)
                        ? item?.ipo?.priceBand?.[0]
                        : null) ??
                      0;

                    return (
                      <tr
                        key={item?.ipo?._id}
                        className={`border-t ${
                          isDarkMode ? "border-gray-700" : "border-gray-200"
                        } hover:${
                          isDarkMode ? "bg-gray-750" : "bg-gray-50"
                        } transition cursor-pointer`}
                        onClick={() => openIpoDetails(item?.ipo)}
                        title="Click for IPO details"
                      >
                        <td className="py-5 px-6">
                          <CompanyCell
                            ipo={item?.ipo}
                            gradient={
                              isDarkMode
                                ? "bg-gradient-to-br from-green-600 to-emerald-600"
                                : "bg-gradient-to-br from-green-500 to-emerald-500"
                            }
                          />
                        </td>
                        <td
                          className={`py-5 px-6 font-semibold ${
                            isDarkMode ? "text-gray-200" : "text-gray-800"
                          }`}
                        >
                          {item?.lots} lot(s)
                        </td>
                        <td
                          className={`py-5 px-6 font-semibold text-lg ${
                            isDarkMode ? "text-green-400" : "text-green-600"
                          }`}
                        >
                          ₹{Number(currentPrice || 0).toFixed(2)}
                        </td>
                        <td className="py-5 px-6 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAllocatedIPO(item);
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition shadow-md hover:shadow-lg"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Open IPOs Section */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-5">
            <h1
              className={`text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Open IPOs
            </h1>
            {/* Removed "View All" per request */}
            <div />
          </div>

          <div
            className={`rounded-xl overflow-hidden shadow-lg ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <table className="w-full">
              <thead
                className={`${isDarkMode ? "bg-gray-750" : "bg-gray-100"}`}
              >
                <tr>
                  <th
                    className={`text-left py-4 px-6 text-sm font-semibold ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Company
                  </th>
                  <th
                    className={`text-left py-4 px-6 text-sm font-semibold ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Open Time
                  </th>
                  <th
                    className={`text-left py-4 px-6 text-sm font-semibold ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Close Time
                  </th>
                  <th
                    className={`text-left py-4 px-6 text-sm font-semibold ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Subscription
                  </th>
                  <th className="py-4 px-6"></th>
                </tr>
              </thead>
              <tbody>
                {openIPOs?.length > 0 ? (
                  openIPOs.map((ipo) => {
                    const openTime = formatDateTime(ipo?.openTime);
                    const closeTime = formatDateTime(ipo?.closeTime);
                    const applied = hasApplied(ipo);
                    const appliedLots = getAppliedLots(ipo);
                    const lotUpper = getLotAtUpper(ipo);
                    const overallSub = getOverallSubscription(ipo);

                    return (
                      <tr
                        key={ipo?._id}
                        className={`border-t ${
                          isDarkMode ? "border-gray-700" : "border-gray-200"
                        } hover:${
                          isDarkMode ? "bg-gray-750" : "bg-gray-50"
                        } transition cursor-pointer`}
                        onClick={() => openIpoDetails(ipo)}
                        title="Click for IPO details"
                      >
                        <td className="py-5 px-6">
                          <CompanyCell
                            ipo={ipo}
                            gradient={
                              isDarkMode
                                ? "bg-gradient-to-br from-blue-600 to-purple-600"
                                : "bg-gradient-to-br from-blue-500 to-purple-500"
                            }
                          />
                          {lotUpper ? (
                            <div className="mt-2">
                              <span
                                className={`inline-block text-[11px] px-2 py-0.5 rounded-full ${
                                  isDarkMode
                                    ? "bg-gray-700 text-gray-200 border border-gray-600"
                                    : "bg-gray-100 text-gray-700 border border-gray-200"
                                }`}
                              >
                                Lot @ Upper: ₹
                                {Number(lotUpper).toLocaleString()}
                              </span>
                            </div>
                          ) : null}
                        </td>
                        <td
                          className={`py-5 px-6 ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          <div className="font-medium">{openTime.date}</div>
                          <div
                            className={`text-xs ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {openTime.time}
                          </div>
                        </td>
                        <td
                          className={`py-5 px-6 ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          <div className="font-medium">{closeTime.date}</div>
                          <div
                            className={`text-xs ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {closeTime.time}
                          </div>
                        </td>
                        <td
                          className={`py-5 px-6 font-semibold ${
                            parseFloat(overallSub || 0) >= 1
                              ? isDarkMode
                                ? "text-green-400"
                                : "text-green-600"
                              : isDarkMode
                              ? "text-orange-300"
                              : "text-orange-600"
                          }`}
                        >
                          {overallSub ? `${overallSub}x` : "0.00x"}
                        </td>
                        <td className="py-5 px-6 text-right">
                          {applied ? (
                            <div
                              className="flex flex-col items-end"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="text-green-600 font-semibold text-sm">
                                ✓ Applied
                              </span>
                              <span
                                className={`text-xs ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                {appliedLots} lot(s)
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // prevent row click
                                setApplyIPO(ipo);
                                setLots("1");
                              }}
                              className="bg-green-500 hover:bg-green-600 text-white px-8 py-2.5 rounded-lg text-sm font-semibold transition shadow-md hover:shadow-lg"
                            >
                              Apply
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className={`py-12 text-center ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <div className="text-lg">
                        No open IPOs available at the moment
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming IPOs Section */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-5">
            <h1
              className={`text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Upcoming IPOs
            </h1>
            {/* Removed "View All" per request */}
            <div />
          </div>

          <div
            className={`rounded-xl overflow-hidden shadow-lg ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <table className="w-full">
              <thead
                className={`${isDarkMode ? "bg-gray-750" : "bg-gray-100"}`}
              >
                <tr>
                  <th
                    className={`text-left py-4 px-6 text-sm font-semibold ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Company
                  </th>
                  <th
                    className={`text-left py-4 px-6 text-sm font-semibold ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Opening Time
                  </th>
                  <th className="py-4 px-6"></th>
                </tr>
              </thead>
              <tbody>
                {upcomingIPOs?.length > 0 ? (
                  upcomingIPOs.map((ipo) => {
                    const openTime = formatDateTime(ipo?.openTime);
                    const anchor = formatDateTime(ipo?.anchorDate);
                    const lotUpper = getLotAtUpper(ipo);

                    return (
                      <tr
                        key={ipo?._id}
                        className={`border-t ${
                          isDarkMode ? "border-gray-700" : "border-gray-200"
                        } hover:${
                          isDarkMode ? "bg-gray-750" : "bg-gray-50"
                        } transition cursor-pointer`}
                        onClick={() => openIpoDetails(ipo)}
                        title="Click for IPO details"
                      >
                        <td className="py-5 px-6">
                          <CompanyCell
                            ipo={ipo}
                            gradient={
                              isDarkMode
                                ? "bg-gradient-to-br from-orange-600 to-red-600"
                                : "bg-gradient-to-br from-orange-500 to-red-500"
                            }
                          />
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {ipo?.anchorDate ? (
                              <span
                                className={`text-[11px] px-2 py-0.5 rounded-full ${
                                  isDarkMode
                                    ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                                    : "bg-purple-50 text-purple-700 border border-purple-200"
                                }`}
                              >
                                Anchor: {anchor.date}{" "}
                                {anchor.time && `• ${anchor.time}`}
                              </span>
                            ) : null}
                            {lotUpper ? (
                              <span
                                className={`text-[11px] px-2 py-0.5 rounded-full ${
                                  isDarkMode
                                    ? "bg-gray-700 text-gray-200 border border-gray-600"
                                    : "bg-gray-100 text-gray-700 border border-gray-200"
                                }`}
                              >
                                Lot @ Upper: ₹
                                {Number(lotUpper).toLocaleString()}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td
                          className={`py-5 px-6 ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          <div className="font-medium">{openTime.date}</div>
                          <div
                            className={`text-xs ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {openTime.time}
                          </div>
                        </td>
                        <td className="py-5 px-6 text-right">
                          {/* Removed IPO Doc button per request */}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className={`py-12 text-center ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <div className="text-lg">No upcoming IPOs</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Closed IPOs Section */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-5">
            <h1
              className={`text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Closed IPOs
            </h1>
            {/* Removed "View All" per request */}
            <div />
          </div>

          <div
            className={`rounded-xl overflow-hidden shadow-lg ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <table className="w-full">
              <thead
                className={`${isDarkMode ? "bg-gray-750" : "bg-gray-100"}`}
              >
                <tr>
                  <th
                    className={`text-left py-4 px-6 text-sm font-semibold ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Company
                  </th>
                  <th
                    className={`text-left py-4 px-6 text-sm font-semibold ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Allotment Time
                  </th>
                  <th
                    className={`text-left py-4 px-6 text-sm font-semibold ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Subscription
                  </th>
                  <th
                    className={`text-left py-4 px-6 text-sm font-semibold ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {closedIPOs?.length > 0 ? (
                  closedIPOs.map((ipo) => {
                    const allotmentTime = formatDateTime(ipo?.allotmentTime);
                    const applied = hasApplied(ipo);
                    const overallSub = getOverallSubscription(ipo);

                    return (
                      <tr
                        key={ipo?._id}
                        className={`border-t ${
                          isDarkMode ? "border-gray-700" : "border-gray-200"
                        } hover:${
                          isDarkMode ? "bg-gray-750" : "bg-gray-50"
                        } transition cursor-pointer`}
                        onClick={() => openIpoDetails(ipo)}
                        title="Click for IPO details"
                      >
                        <td className="py-5 px-6">
                          <CompanyCell
                            ipo={ipo}
                            gradient={
                              isDarkMode
                                ? "bg-gradient-to-br from-gray-600 to-gray-700"
                                : "bg-gradient-to-br from-gray-400 to-gray-500"
                            }
                          />
                        </td>
                        <td
                          className={`py-5 px-6 ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          <div className="font-medium">
                            {allotmentTime.date}
                          </div>
                          <div
                            className={`text-xs ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {allotmentTime.time}
                          </div>
                        </td>
                        <td
                          className={`py-5 px-6 font-semibold ${
                            parseFloat(overallSub || 0) >= 1
                              ? isDarkMode
                                ? "text-green-400"
                                : "text-green-600"
                              : isDarkMode
                              ? "text-orange-300"
                              : "text-orange-600"
                          }`}
                        >
                          {overallSub ? `${overallSub}x` : "0.00x"}
                        </td>
                        <td className="py-5 px-6 text-right">
                          <div
                            className="flex flex-col items-end gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span
                              className={`text-sm ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              Applied
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCheckAllotment(ipo);
                              }}
                              disabled={checkingAllotment === ipo?._id}
                              className={`${
                                isDarkMode
                                  ? "text-blue-400 hover:text-blue-300"
                                  : "text-blue-600 hover:text-blue-700"
                              } text-xs font-semibold transition underline`}
                            >
                              {checkingAllotment === ipo?._id
                                ? "Checking..."
                                : "Check Status"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className={`py-12 text-center ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <div className="text-lg">No closed IPOs</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Allotment Details Modal */}
      {allotmentDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div
            className={`p-8 rounded-2xl max-w-md w-full shadow-2xl ${
              isDarkMode ? "bg-gray-800 text-white" : "bg-white"
            }`}
          >
            <h2 className="text-2xl font-bold mb-6">Allotment Status</h2>

            <div
              className={`mb-6 p-4 rounded-xl ${
                isDarkMode ? "bg-gray-700" : "bg-gray-50"
              }`}
            >
              <div className="flex justify-between mb-3">
                <span
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Company
                </span>
                <span className="font-semibold">
                  {allotmentDetails?.companyName}
                </span>
              </div>
              <div className="flex justify-between mb-3">
                <span
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Applied Lots
                </span>
                <span className="font-semibold">
                  {allotmentDetails?.appliedLots}
                </span>
              </div>
              <div className="flex justify-between mb-3">
                <span
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Allocated Lots
                </span>
                <span
                  className={`font-semibold ${
                    (allotmentDetails?.allocatedLots || 0) > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {(allotmentDetails?.allocatedLots || 0) > 0
                    ? allotmentDetails?.allocatedLots
                    : "Not Allocated"}
                </span>
              </div>
              <div className="flex justify-between">
                <span
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Status
                </span>
                <span
                  className={`font-semibold ${
                    (allotmentDetails?.allocatedLots || 0) > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {(allotmentDetails?.allocatedLots || 0) > 0
                    ? "✓ Allotted"
                    : "✗ Not Allotted"}
                </span>
              </div>
            </div>

            <button
              onClick={() => setAllotmentDetails(null)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition shadow-md hover:shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Apply IPO Modal */}
      {applyIPO && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div
            className={`p-8 rounded-2xl max-w-md w-full shadow-2xl ${
              isDarkMode ? "bg-gray-800 text-white" : "bg-white"
            }`}
          >
            <h2 className="text-2xl font-bold mb-6">Apply for IPO</h2>

            <div
              className={`mb-6 p-4 rounded-xl ${
                isDarkMode ? "bg-gray-700" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center text-base font-bold ${
                    isDarkMode
                      ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                      : "bg-gradient-to-br from-blue-500 to-purple-500 text-white"
                  } shadow`}
                >
                  {(applyIPO?.symbol || "—").substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div
                    className={`font-bold text-lg ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {applyIPO?.companyName}
                  </div>
                  <div
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {applyIPO?.symbol}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Price Band
                  </span>
                  <span className="font-semibold">
                    ₹{applyIPO?.priceBand?.[0] ?? "—"} - ₹
                    {applyIPO?.priceBand?.[1] ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Lot Size
                  </span>
                  <span className="font-semibold">
                    {applyIPO?.lotSize ?? 0} shares
                  </span>
                </div>
                <div className="flex justify-between">
                  <span
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Min Investment
                  </span>
                  <span className="font-semibold">
                    ₹
                    {(
                      (applyIPO?.lotValueAtUpperBand ??
                        (applyIPO?.priceBand?.[1] || 0) *
                          (applyIPO?.lotSize || 0)) ||
                      0
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label
                className={`block mb-2 text-sm font-semibold ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Number of Lots
              </label>
              <input
                type="text"
                value={lots}
                onChange={handleLotsChange}
                placeholder="Enter number of lots"
                className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                }`}
              />
              {lots && (
                <div
                  className={`mt-2 text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Total Investment: ₹
                  {(
                    (parseInt(lots || "0") || 0) *
                    ((applyIPO?.priceBand?.[1] || 0) * (applyIPO?.lotSize || 0))
                  ).toLocaleString()}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setApplyIPO(null);
                  setLots("");
                }}
                className={`flex-1 py-3 rounded-lg font-semibold transition ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleApplyIPO}
                disabled={loading || !lots || parseInt(lots || "0") < 1}
                className={`flex-1 py-3 rounded-lg font-semibold transition shadow-md hover:shadow-lg ${
                  loading || !lots || parseInt(lots || "0") < 1
                    ? "bg-gray-400 cursor-not-allowed text-gray-200"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                {loading ? "Applying..." : "Confirm Apply"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Allocated IPO Details Modal - UPDATED WITH LIVE PRICES */}
      {selectedAllocatedIPO && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div
            className={`p-8 rounded-2xl max-w-md w-full shadow-2xl ${
              isDarkMode ? "bg-gray-800 text-white" : "bg-white"
            }`}
          >
            <h2 className="text-2xl font-bold mb-6">IPO Trading</h2>

            <div
              className={`mb-6 p-4 rounded-xl ${
                isDarkMode ? "bg-gray-700" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center text-base font-bold ${
                    isDarkMode
                      ? "bg-gradient-to-br from-green-600 to-emerald-600 text-white"
                      : "bg-gradient-to-br from-green-500 to-emerald-500 text-white"
                  } shadow`}
                >
                  {(selectedAllocatedIPO?.ipo?.symbol || "—")
                    .substring(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <div
                    className={`font-bold text-lg ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {selectedAllocatedIPO?.ipo?.companyName}
                  </div>
                  <div
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {selectedAllocatedIPO?.ipo?.symbol}
                  </div>
                </div>
              </div>

              {/* Live Price Display */}
              <div className="mb-4 p-3 rounded-lg bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30">
                <div className="flex justify-between items-center">
                  <span
                    className={`text-sm font-semibold ${
                      isDarkMode ? "text-green-400" : "text-green-600"
                    }`}
                  >
                    Live Price
                  </span>
                  <span
                    className={`text-xl font-bold ${
                      isDarkMode ? "text-green-400" : "text-green-600"
                    }`}
                  >
                    ₹
                    {(
                      livePrices?.[selectedAllocatedIPO?.ipo?._id] ??
                      selectedAllocatedIPO?.ipo?.currentPrice ??
                      selectedAllocatedIPO?.ipo?.listingPrice ??
                      selectedAllocatedIPO?.ipo?.priceBand?.[0] ??
                      0
                    ).toFixed(2)}
                  </span>
                </div>
                {livePrices?.[selectedAllocatedIPO?.ipo?._id] && (
                  <div
                    className={`text-xs mt-1 ${
                      isDarkMode ? "text-green-300" : "text-green-700"
                    }`}
                  >
                    Real-time updates from market
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Allocated Lots
                  </span>
                  <span className="font-semibold">
                    {selectedAllocatedIPO?.lots}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Lot Size
                  </span>
                  <span className="font-semibold">
                    {selectedAllocatedIPO?.ipo?.lotSize} shares
                  </span>
                </div>
                <div className="flex justify-between">
                  <span
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Total Shares
                  </span>
                  <span className="font-semibold">
                    {(selectedAllocatedIPO?.lots || 0) *
                      (selectedAllocatedIPO?.ipo?.lotSize || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Investment Value
                  </span>
                  <span className="font-semibold">
                    ₹
                    {(
                      (selectedAllocatedIPO?.openPrice || 0) *
                      (selectedAllocatedIPO?.lots || 0) *
                      (selectedAllocatedIPO?.ipo?.lotSize || 0)
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Current Value
                  </span>
                  <span
                    className={`font-bold text-lg ${
                      isDarkMode ? "text-green-400" : "text-green-600"
                    }`}
                  >
                    ₹
                    {(
                      (livePrices?.[selectedAllocatedIPO?.ipo?._id] ??
                        selectedAllocatedIPO?.ipo?.currentPrice ??
                        selectedAllocatedIPO?.ipo?.listingPrice ??
                        selectedAllocatedIPO?.ipo?.priceBand?.[0] ??
                        0) *
                        (selectedAllocatedIPO?.lots || 0) *
                        (selectedAllocatedIPO?.ipo?.lotSize || 0) || 0
                    ).toLocaleString()}
                  </span>
                </div>

                {/* Price Change Indicator */}
                {selectedAllocatedIPO?.openPrice && (
                  <div className="flex justify-between pt-2 border-t border-gray-600 border-opacity-30">
                    <span
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Price Change
                    </span>
                    <span
                      className={`font-semibold ${
                        getPriceChange(
                          selectedAllocatedIPO?.ipo?._id,
                          selectedAllocatedIPO?.openPrice
                        ).change >= 0
                          ? isDarkMode
                            ? "text-green-400"
                            : "text-green-600"
                          : isDarkMode
                          ? "text-red-400"
                          : "text-red-600"
                      }`}
                    >
                      {getPriceChange(
                        selectedAllocatedIPO?.ipo?._id,
                        selectedAllocatedIPO?.openPrice
                      ).change >= 0
                        ? "+"
                        : ""}
                      {getPriceChange(
                        selectedAllocatedIPO?.ipo?._id,
                        selectedAllocatedIPO?.openPrice
                      ).change.toFixed(2)}{" "}
                      (
                      {getPriceChange(
                        selectedAllocatedIPO?.ipo?._id,
                        selectedAllocatedIPO?.openPrice
                      ).change >= 0
                        ? "+"
                        : ""}
                      {getPriceChange(
                        selectedAllocatedIPO?.ipo?._id,
                        selectedAllocatedIPO?.openPrice
                      ).percentage.toFixed(2)}
                      %)
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedAllocatedIPO(null)}
                className={`flex-1 py-3 rounded-lg font-semibold transition ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                Close
              </button>
              <button
                onClick={() =>
                  handleSellIPO(
                    selectedAllocatedIPO?.ipo,
                    selectedAllocatedIPO?.lots
                  )
                }
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition shadow-md hover:shadow-lg"
              >
                Sell All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Universal IPO Details Modal (click any row) */}
      {selectedIPO && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedIPO(null)}
        >
          <div
            className={`p-6 rounded-2xl w-full max-w-2xl shadow-2xl ${
              isDarkMode ? "bg-gray-850 text-white" : "bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              {selectedIPO?.image ? (
                // eslint-disable-next-line jsx-a11y/alt-text
                <img
                  src={selectedIPO?.image}
                  className="w-14 h-14 rounded-xl object-cover border border-gray-200"
                />
              ) : (
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center text-base font-bold ${
                    isDarkMode
                      ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                      : "bg-gradient-to-br from-blue-500 to-purple-500 text-white"
                  } shadow`}
                >
                  {(selectedIPO?.symbol || "—").substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">
                    {selectedIPO?.companyName}{" "}
                    <span className="text-sm font-medium opacity-70">
                      ({selectedIPO?.symbol})
                    </span>
                  </h3>
                  {/* <button
                    onClick={() => setSelectedIPO(null)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                      isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    Close
                  </button> */}
                </div>
                <div className="mt-1 text-xs opacity-70">
                  Status: {selectedIPO?.status || "—"}
                </div>
                <div className="mt-2 flex gap-2 flex-wrap">
                  {selectedIPO?.issueSizeCr ? (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Issue ₹{selectedIPO?.issueSizeCr} Cr
                    </span>
                  ) : null}
                  {selectedIPO?.listingPrice ? (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      Listing ₹{selectedIPO?.listingPrice}
                    </span>
                  ) : null}
                  {selectedIPO?.lotSize ? (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                      Lot Size {selectedIPO?.lotSize}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Sparkline & headline numbers */}
            <div
              className={`mt-5 rounded-xl p-4 ${
                isDarkMode ? "bg-gray-800" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="text-xs opacity-70">Price Band</div>
                  <div className="text-lg font-semibold">
                    ₹{selectedIPO?.priceBand?.[0] ?? "—"} - ₹
                    {selectedIPO?.priceBand?.[1] ?? "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs opacity-70">Lot @ Upper</div>
                  <div className="text-lg font-semibold">
                    ₹{(getLotAtUpper(selectedIPO) || 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs opacity-70">Overall Subscription</div>
                  <div className="text-lg font-semibold">
                    {getOverallSubscription(selectedIPO) || 0}x
                  </div>
                </div>
              </div>

              {/* Sparkline */}
              <div className="mt-4">
                <svg
                  viewBox={`0 0 ${sparklinePoints?.width || 240} ${
                    sparklinePoints?.height || 60
                  }`}
                  width="100%"
                  height="60"
                  preserveAspectRatio="none"
                >
                  <polyline
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.25"
                    points={sparklinePoints?.points || ""}
                  />
                  <polyline
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    points={sparklinePoints?.points || ""}
                  />
                </svg>
                <div className="mt-1 text-xs flex items-center gap-2">
                  <span className="opacity-70">Last:</span>
                  <span className="font-semibold">
                    ₹{Number(sparklinePoints?.last || 0).toFixed(2)}
                  </span>
                  <span
                    className={`font-semibold ${
                      (sparklinePoints?.delta || 0) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {(sparklinePoints?.delta || 0) >= 0 ? "+" : ""}
                    {Number(sparklinePoints?.delta || 0).toFixed(2)} (
                    {(sparklinePoints?.pct || 0) >= 0 ? "+" : ""}
                    {Number(sparklinePoints?.pct || 0).toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Formal data grid */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`rounded-xl p-4 ${
                  isDarkMode ? "bg-gray-800" : "bg-gray-50"
                }`}
              >
                <div className="text-sm font-semibold mb-3">Timeline</div>
                <div className="text-xs opacity-70">Open</div>
                <div className="font-medium mb-2">
                  {formatDateTime(selectedIPO?.openTime).date} •{" "}
                  {formatDateTime(selectedIPO?.openTime).time}
                </div>
                <div className="text-xs opacity-70">Close</div>
                <div className="font-medium mb-2">
                  {formatDateTime(selectedIPO?.closeTime).date} •{" "}
                  {formatDateTime(selectedIPO?.closeTime).time}
                </div>
                <div className="text-xs opacity-70">Allotment</div>
                <div className="font-medium">
                  {formatDateTime(selectedIPO?.allotmentTime).date} •{" "}
                  {formatDateTime(selectedIPO?.allotmentTime).time}
                </div>
              </div>

              <div
                className={`rounded-xl p-4 ${
                  isDarkMode ? "bg-gray-800" : "bg-gray-50"
                }`}
              >
                <div className="text-sm font-semibold mb-3">Reservations</div>
                <div className="space-y-2">
                  {[
                    "retailPercent",
                    "qibPercent",
                    "hniPercent",
                    "employeePercent",
                    "otherPercent",
                  ].map((k) => {
                    const labelMap = {
                      retailPercent: "Retail",
                      qibPercent: "QIB",
                      hniPercent: "HNI",
                      employeePercent: "Employee",
                      otherPercent: "Other",
                    };
                    const val = selectedIPO?.reservations?.[k] ?? 0;
                    return (
                      <div key={k}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="opacity-70">{labelMap[k]}</span>
                          <span className="font-medium">{val}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                          <div
                            className="h-2 rounded-full bg-gray-700"
                            style={{
                              width: `${Math.min(100, Math.max(0, val))}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div
                className={`rounded-xl p-4 md:col-span-2 ${
                  isDarkMode ? "bg-gray-800" : "bg-gray-50"
                }`}
              >
                <div className="text-sm font-semibold mb-3">Subscription</div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    ["overallX", "Overall"],
                    ["qibX", "QIB"],
                    ["hniX", "HNI"],
                    ["retailX", "Retail"],
                    ["employeeX", "Employee"],
                  ].map(([k, label]) => {
                    const v = selectedIPO?.subscription?.[k] ?? 0;
                    return (
                      <div key={k} className="text-center">
                        <div className="text-xs opacity-70">{label}</div>
                        <div className="text-lg font-semibold">{v}x</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedIPO(null)}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                Close
              </button>
              {selectedIPO?.status === "open" && (
                <button
                  onClick={() => {
                    setApplyIPO(selectedIPO);
                    setLots("1");
                  }}
                  className="px-4 py-2 rounded-lg font-semibold bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg"
                >
                  Apply
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
