// shareCache.js
// In-memory mirror of the Shares collection. The simulation loop reads and
// mutates this cache directly (no DB read per tick), emits the fresh prices
// over socket.io immediately, and only THEN flushes the changes to Mongo in
// the background. This is what lets "emit early, persist later" work.

import { Shares } from "../models/share.models.js";

const cache = new Map(); // shareId(string) -> { shareId, shareName, symbol, sector, Image, price, lastHistory }

export const loadShareCache = async () => {
  const shares = await Shares.find().sort({ shareName: 1 }).lean();
  cache.clear();
  for (const share of shares) {
    cache.set(String(share._id), {
      shareId: share._id,
      shareName: share.shareName,
      symbol: share.symbol,
      sector: share.sector,
      Image: share.image,
      price: share.price,
      lastHistory: share.history?.at(-1) || null,
    });
  }
  return cache;
};

export const getShareCache = () => cache;

export const getShareEntries = () => Array.from(cache.values());

// Cheap price-only map, e.g. { "Reliance": 2456.3 }, used for P&L math.
export const getLivePriceMap = () => {
  const map = {};
  for (const s of cache.values()) map[s.shareName] = s.price;
  return map;
};

export const updateShareInCache = (shareId, patch) => {
  const key = String(shareId);
  const existing = cache.get(key);
  if (!existing) return;
  cache.set(key, { ...existing, ...patch });
};

// Add a brand-new share (created via admin "add share" flow) to the cache
// without needing a full reload.
export const addShareToCache = (share) => {
  cache.set(String(share._id), {
    shareId: share._id,
    shareName: share.shareName,
    symbol: share.symbol,
    sector: share.sector,
    Image: share.image,
    price: share.price,
    lastHistory: share.history?.at(-1) || null,
  });
};
