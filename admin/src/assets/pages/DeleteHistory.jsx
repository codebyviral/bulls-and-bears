import { useEffect, useRef, useState } from "react";
import axios from "axios";

const DeleteHistory = ({ onDeleted }) => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const cancelBtnRef = useRef(null);

  // ✅ Your DELETE endpoint for candlestick history
  // e.g., /api/history/candlesticks/clear
  const ENDPOINT = `${
    import.meta.env.VITE_BACKEND_URL
  }/api/trade/drop-all-history`;

  const handlePrimaryClick = () => setOpen(true);

  const deleteHistory = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem("authToken");

      // Use DELETE (or POST if your backend expects it — adjust accordingly)
      const res = await axios.post(ENDPOINT, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("✅ Candlestick history deleted:", res?.data);
      if (typeof onDeleted === "function") onDeleted(res?.data);
      setOpen(false);
    } catch (err) {
      console.error("❌ Failed to delete history:", err);
      alert(
        err?.response?.data?.message ||
          "Failed to delete candlestick history. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Basic Escape-to-close + focus handling
  useEffect(() => {
    if (open) {
      const onKeyDown = (e) => {
        if (e.key === "Escape") setOpen(false);
      };
      window.addEventListener("keydown", onKeyDown);
      // focus cancel by default
      setTimeout(() => cancelBtnRef.current?.focus(), 0);
      return () => window.removeEventListener("keydown", onKeyDown);
    }
  }, [open]);

  return (
    <div className="flex justify-center items-center mt-4">
      <button
        onClick={handlePrimaryClick}
        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200"
      >
        <span className="text-xl">⚠️</span>
        Delete Candlestick History
      </button>

      {/* Modal */}
      {open && (
        <div
          aria-modal="true"
          role="dialog"
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !submitting && setOpen(false)}
          />
          {/* Dialog */}
          <div className="relative w-full max-w-md mx-4 rounded-2xl bg-white shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Delete candlestick history?
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    This will permanently remove all saved candlestick history
                    data. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  ref={cancelBtnRef}
                  disabled={submitting}
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteHistory}
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="animate-pulse">Deleting…</span>
                  ) : (
                    <>
                      <span className="text-lg">⚠️</span>
                      Yes, Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteHistory;
