// controllers/realized.controller.js
import { User } from "../models/user.models.js";
import { computeRealizedPLFIFO } from "../utils/realizedPL.js";

/**
 * GET /api/trade/realized/:userId
 * Returns realized P/L computed from trade history (FIFO).
 * Response: { realizedPL: number, bySymbol: { [name]: number } }
 *
 * This is now only the "cold start" path (first paint before the socket
 * connects/registers). Live updates arrive via the "pl_update" socket event
 * pushed from utils/plCache.js — on connect, right after every trade, and on
 * a 1s heartbeat — so the frontend no longer has to wait on this endpoint
 * (or poll it) to stay current.
 */
export const getRealizedPLController = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ msg: "userId is required" });

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ msg: "User not found" });

    const { realizedPL, bySymbol } = computeRealizedPLFIFO(user.trades || []);
    return res.status(200).json({ realizedPL, bySymbol });
  } catch (err) {
    console.error("getRealizedPLController error:", err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};
