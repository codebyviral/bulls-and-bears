import { Shares } from "../models/share.models.js";
import { shareSchema } from "../utils/validator.js";
import { marketTrend } from "../utils/marketState.js";
import { SIM_CONFIG } from "../config/simulation.config.js";
import {
  getShareEntries,
  updateShareInCache,
  addShareToCache,
} from "../utils/shareCache.js";

export const getMarketTrend = async (req, res) => {
  try {
    const { mode, strength } = req.body;
    if (!["neutral", "bull", "bear"].includes(mode)) {
      return res
        .status(400)
        .json({ error: "Mode must be neutral | bull | bear" });
    }

    marketTrend.mode = mode;
    marketTrend.strength = Number(strength) || 0;

    // Broadcast so connected clients (e.g. a market-mode badge in the UI)
    // reflect the admin's change immediately instead of only seeing it
    // indirectly once prices start drifting.
    req.io?.emit("marketTrendChanged", marketTrend);

    res.json({
      success: true,
      marketTrend,
    });
  } catch (error) {
    console.log(error);
  }
};

export const addshare = async (req, res) => {
  try {
    const parsed = await shareSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        status: 400,
        message: parsed.error.errors[0].message,
      });
    }

    const { shareName, price ,symbol , sector ,image } = parsed.data;
    if (!shareName || !price || !symbol || !symbol || !image) {
      return res.status(402).json("all fields are required ..");
    }

    const existedShare = await Shares.findOne({ shareName });
    if (existedShare) {
      return res.status(202).json({ msg: " share is already existed" });
    }

    const newShare = await Shares.create({
      shareName,
      price,
      symbol,
      sector,
      image
    });

    if (!newShare) {
      return res.status(402).json({ msg: "new share not to be added" });
    }

    // Keep the in-memory simulation cache in sync so this share starts
    // ticking on the very next cron cycle without needing a server restart.
    addShareToCache(newShare);

    return res.status(200).json({ msg: "share added", newShare });
  } catch (error) {
    console.log(error);
  }
};

// utils/priceGenerator.js


const randnBM = () => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

export const getNextPrice = (lastPrice, opts = {}) => {
  const {
    dtSeconds = 1,
    volatilityScale = 1,
    driftFrac = 0,   // ✅ extra drift (sector/news)
  } = opts;

  const basePctVol = 0.0002;
  const vol =
    basePctVol * Math.sqrt(Math.max(0.0001, dtSeconds)) * volatilityScale;

  const z = Math.max(-0.8, Math.min(0.8, randnBM()));
  let pctChange = z * vol;

  // ✅ Apply global marketTrend
  if (marketTrend.mode === "bull") {
    pctChange += vol * 0.5 * marketTrend.strength;
  } else if (marketTrend.mode === "bear") {
    pctChange -= vol * 0.5 * marketTrend.strength;
  }

  // ✅ Add optional sector/news drift
  pctChange += driftFrac;

  let absChange = lastPrice * pctChange;

  const MIN_TICK = 0.01;
  const MAX_TICK = 2.0;

  if (Math.abs(absChange) < MIN_TICK) {
    absChange = (absChange >= 0 ? 1 : -1) * MIN_TICK;
  } else if (Math.abs(absChange) > MAX_TICK) {
    absChange = (absChange >= 0 ? 1 : -1) * MAX_TICK;
  }

  const next = lastPrice + absChange;
  return parseFloat(Math.max(next, 0.01).toFixed(2));
};


// Main simulation function
//
// Rewritten so the socket emit happens FIRST (reads/writes only the
// in-memory shareCache, which is effectively instant) and the Mongo
// persistence happens AFTER, as a fire-and-forget bulk write. Previously
// every tick awaited `Shares.updateOne` for every share (N round trips to
// Mongo) before emitting — at a 2s cadence that DB latency was directly
// eating into the client's update interval. Clients now see the new price
// the moment it's computed; the DB simply catches up in the background.
export const simulatePrices = async (io) => {
  try {
    const shares = getShareEntries();
    if (!shares.length) return;

    const { CANDLE_WINDOW_SEC: windowSeconds, TICKS_PER_CANDLE: tickCount } =
      SIM_CONFIG;
    const now = new Date();
    const dtSeconds = windowSeconds / tickCount;
    const startMs = now.getTime() - windowSeconds * 1000;

    const livePayload = new Array(shares.length);
    const bulkOps = [];

    for (let index = 0; index < shares.length; index++) {
      const share = shares[index];
      const lastCandle = share.lastHistory || null;

      // ✅ Always start new candle from previous close
      const prevClose = lastCandle ? lastCandle.close : share.price || 0;
      const open = prevClose;

      let price = open;
      const ticks = [];
      for (let i = 0; i < tickCount; i++) {
        const tickTime = new Date(
          startMs + Math.round((i + 1) * dtSeconds * 1000)
        );
        price = getNextPrice(price, { dtSeconds });
        ticks.push({ changesprice: price, time: tickTime });
      }

      const close = ticks.length ? ticks[ticks.length - 1].changesprice : open;
      const pricesForHL = [open, ...ticks.map((t) => t.changesprice)];
      const high = Math.max(...pricesForHL);
      const low = Math.min(...pricesForHL);

      const candle = { timestamp: now, open, high, low, close, ticks };

      // 1) Update the in-memory cache immediately — this is what the emit
      //    and every other reader (P/L push, subscribeShareHistory) sees.
      updateShareInCache(share.shareId, { price: close, lastHistory: candle });

      livePayload[index] = {
        shareId: share.shareId,
        sharename: share.shareName,
        price: close,
        symbol: share.symbol,
        Image: share.Image,
        lastHistory: candle,
      };

      bulkOps.push({
        updateOne: {
          filter: { _id: share.shareId },
          update: {
            $push: { history: { $each: [candle], $slice: -200 } },
            $set: { price: close },
          },
        },
      });
    }

    // 2) EMIT FIRST — clients get the new prices right away.
    io.emit("shareliveprice", livePayload);

    // 3) Persist AFTER, without blocking the tick or the emit. If this
    //    write is still in flight when the next tick starts, that's fine —
    //    the cache (source of truth for the running simulation) is already
    //    correct; Mongo is just catching up for durability/history.
    Shares.bulkWrite(bulkOps, { ordered: false }).catch((err) => {
      console.error("❌ simulatePrices background persist failed:", err);
    });
  } catch (err) {
    console.error("❌ Error in simulatePrices:", err);
  }
};

export const sendcandleData = async (req, res) => {
  try {
    const { shareId } = req.params;

    const share = await Shares.findById(shareId, {
      history: { $slice: [0, 199] },
    }).lean();

    if (!share) {
      return res.status(402).json({ msg: "share not found" });
    }

    res.status(200).json({
      success: true,
      data: share.history,
      shareName: share.shareName, // ✅ key : value
    });
  } catch (error) {
    console.log(error);
  }
};