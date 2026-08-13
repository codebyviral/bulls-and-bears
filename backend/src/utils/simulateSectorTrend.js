// simulateSectorTrend.js
import { Shares } from "../models/share.models.js"; // adjust path
import { trendState } from "./trendState.js";
import { SIM_CONFIG } from "../config/simulation.config.js";
import { getShareEntries, updateShareInCache } from "./shareCache.js";

// IMPORTANT: reuse your existing getNextPrice
import { getNextPriceWithDrift } from "./getNextPriceWithDrift.js";

// Same "emit first, persist after" pattern as simulatePrices — see that
// function for the full rationale. Also now shares SIM_CONFIG's candle
// window instead of a hardcoded 5s, so it can't drift out of sync with the
// base simulator or with trendControl.js's candlesPlanned math.
export const simulateSectorTrend = async (io) => {
  if (!trendState.active) return;

  try {
    const shares = getShareEntries();
    if (!shares.length) return;

    const { CANDLE_WINDOW_SEC: windowSeconds, TICKS_PER_CANDLE: tickCount } =
      SIM_CONFIG;
    const now = new Date();
    const dtSeconds = windowSeconds / tickCount;
    const startMs = now.getTime() - windowSeconds * 1000;

    // Convert "per candle percent" to fractional drift per tick
    const perCandleFrac = (trendState.perCandlePct || 0) / 100;
    const perTickDrift = perCandleFrac / tickCount;

    const livePayload = new Array(shares.length);
    const bulkOps = [];

    for (let index = 0; index < shares.length; index++) {
      const share = shares[index];
      const lastCandle = share.lastHistory || null;
      const prevClose = lastCandle ? lastCandle.close : share.price || 0;
      const open = prevClose;

      let price = open;
      const isInTrendSector = share.sector === trendState.sector;

      const ticks = [];
      for (let i = 0; i < tickCount; i++) {
        const tickTime = new Date(
          startMs + Math.round((i + 1) * dtSeconds * 1000)
        );

        let next = getNextPriceWithDrift(price, { dtSeconds });

        if (isInTrendSector) {
          next = next * (1 + perTickDrift);
        }

        price = next;
        ticks.push({ changesprice: price, time: tickTime });
      }

      const close = ticks.length ? ticks[ticks.length - 1].changesprice : open;
      const pricesForHL = [open, ...ticks.map((t) => t.changesprice)];
      const high = Math.max(...pricesForHL);
      const low = Math.min(...pricesForHL);

      const candle = { timestamp: now, open, high, low, close, ticks };

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

    // EMIT FIRST, persist after.
    io.emit("shareliveprice", livePayload);

    Shares.bulkWrite(bulkOps, { ordered: false }).catch((err) => {
      console.error("❌ simulateSectorTrend background persist failed:", err);
    });

    // If we have completed the planned candles, auto-stop the trend
    trendState.candlesApplied += 1;
    if (
      trendState.candlesApplied >= trendState.candlesPlanned ||
      (trendState.endsAt && now >= trendState.endsAt)
    ) {
      // End trend and return to normal simulation on next cron tick
      const { stopSectorTrend } = await import("./trendControl.js");
      stopSectorTrend();
    }
  } catch (err) {
    console.error("❌ Error in simulateSectorTrend:", err);
  }
};
