// routes/trend.router.js
import { Router } from "express";
import { startSectorTrend, stopSectorTrend } from "../utils/trendControl.js";
import { trendState } from "../utils/trendState.js";
import { marketTrend } from "../utils/marketState.js";
import { breakState } from "../utils/breakState.js";
import { SIM_CONFIG } from "../config/simulation.config.js";
import { News } from "../models/news.models.js";
import { emitLatestNews } from "../controllers/trading.controllers.js";
import { AdminVerify } from "../middlewares/auth.middlewares.js";

const router = Router();

/**
 * Start a sector trend (ADMIN ONLY)
 * Body:
 * {
 *   "sector": "Automobile",
 *   "changePercent": 3,       // +3 means +3% up; -3 for down
 *   "durationSec": 120        // optional, default 60
 * }
 */
router.post("/sector", AdminVerify, async (req, res) => {
  try {
    const { title, description, sector, changePercent, durationSec } = req.body || {};
    if (!sector || typeof changePercent !== "number") {
      return res
        .status(400)
        .json({ ok: false, msg: "sector and changePercent are required" });
    }

    const result = startSectorTrend({ sector, changePercent, durationSec });

    const newsItem = {
      title,
      description,
      sector,
      changePercent,
      durationSec,
      timestamp: new Date(),
    };

    const io = req.app.get("io");
    io.emit("sectorNews", newsItem);

    const newsArray = await News.create({
      title,
      description,
      sector,
      changePercent,
      durationSec,
    })
     

    if(!newsArray){
      return res.status(402).json({ msg : "news not come"});
    }
    
    await emitLatestNews(io);
    // Emit news via socket
    return res.json({ ok: true, trend: result.trendState, news: newsItem ,newsArray });
  } catch (e) {
    console.error("❌ /trend/sector error:", e);
    return res.status(500).json({ ok: false, msg: "internal error" });
  }
});

/** Stop (cancel) any active trend — ADMIN ONLY */
router.post("/stop", AdminVerify, (req, res) => {
  try {
    const result = stopSectorTrend();
    return res.json({ ok: true, trend: result });
  } catch (e) {
    console.error("❌ /trend/stop error:", e);
    return res.status(500).json({ ok: false, msg: "internal error" });
  }
});

/** Toggle the global break/pause (ADMIN ONLY) — REST equivalent of the
 * "toggle_break" socket event, for an admin panel that isn't itself a
 * socket client. Broadcasts the new state to every connected client. */
router.post("/break", AdminVerify, (req, res) => {
  try {
    breakState.isBreak = !breakState.isBreak;
    const io = req.app.get("io");
    io?.emit("break_state", { isBreak: breakState.isBreak });
    return res.json({ ok: true, isBreak: breakState.isBreak });
  } catch (e) {
    console.error("❌ /trend/break error:", e);
    return res.status(500).json({ ok: false, msg: "internal error" });
  }
});

/** Peek state (optional) */
router.get("/state", (req, res) => res.json({ ok: true, trendState }));

/** One-shot admin dashboard snapshot: break status, global market trend
 * (bull/bear/neutral), active sector trend, and current sim timing —
 * everything an admin panel needs in a single request. */
router.get("/admin/state", AdminVerify, (req, res) =>
  res.json({
    ok: true,
    isBreak: breakState.isBreak,
    marketTrend,
    trendState,
    simConfig: {
      tickIntervalSec: SIM_CONFIG.CRON_INTERVAL_SEC,
      candleWindowSec: SIM_CONFIG.CANDLE_WINDOW_SEC,
      plPushIntervalMs: SIM_CONFIG.PL_PUSH_INTERVAL_MS,
    },
  })
);

export default router;
