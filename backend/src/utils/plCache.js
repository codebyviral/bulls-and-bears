// plCache.js
// Why the frontend's realized P/L felt slow to load:
//   1. It was fetched ONCE over REST on page mount (no push), so any trade
//      made elsewhere/since needed a manual refresh to show up.
//   2. Every request re-ran the full FIFO scan over the user's entire trade
//      history from scratch.
// Fix: cache the FIFO result per user, invalidate cheaply (trade count
// change), and proactively push {realized, unrealized, balance} over the
// socket — on connect, right after every trade, and on a steady 1s tick —
// instead of waiting for the client to ask.

import { User } from "../models/user.models.js";
import { computeRealizedPLFIFO } from "./realizedPL.js";
import { getUnrealizedPL } from "./unrealizedPL.js";
import { getLivePriceMap } from "./shareCache.js";

const cache = new Map(); // userId -> { tradesLen, realizedPL, bySymbol }

const getCachedRealized = (user) => {
  const key = String(user._id);
  const tradesLen = user.trades?.length || 0;
  const hit = cache.get(key);
  if (hit && hit.tradesLen === tradesLen) return hit;

  const { realizedPL, bySymbol } = computeRealizedPLFIFO(user.trades || []);
  const entry = { tradesLen, realizedPL, bySymbol };
  cache.set(key, entry);
  return entry;
};

export const invalidateRealizedCache = (userId) => {
  cache.delete(String(userId));
};

// Computes + emits realized & unrealized P/L for one user using the live
// in-memory share price cache (no client-supplied prices needed).
export const pushUserPL = async (io, userId) => {
  if (!io || !userId) return;
  try {
    const user = await User.findById(userId).lean();
    if (!user) return;

    const { realizedPL } = getCachedRealized(user);
    const unrealizedPL = getUnrealizedPL(user.portfolio || [], getLivePriceMap());

    io.to(String(userId)).emit("pl_update", {
      realizedPL,
      unrealizedPL,
      balance: user.TotalBalance ?? 0,
    });

    // Back-compat with any listener still on the old separate events.
    io.to(String(userId)).emit("rpl_update", {
      realizedPL,
      balance: user.TotalBalance ?? 0,
    });
    io.to(String(userId)).emit("unpl_update", {
      unrealizedPL,
      balance: user.TotalBalance ?? 0,
    });
  } catch (err) {
    console.error("pushUserPL error:", err);
  }
};

// Push P/L for every currently-online user in one pass (called on the 1s tick).
export const pushAllOnlinePL = async (io, onlineUserIds) => {
  if (!onlineUserIds?.size) return;
  await Promise.all([...onlineUserIds].map((uid) => pushUserPL(io, uid)));
};
