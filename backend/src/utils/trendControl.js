// trendControl.js
import { trendState } from "./trendState.js";
import { SIM_CONFIG } from "../config/simulation.config.js";

export function startSectorTrend({ sector, changePercent, durationSec = 60 }) {
  // changePercent can be +ve or -ve; you may also supply a "direction" string instead.
  const totalPct = Number(changePercent); // e.g. +3 => +3%
  // Pulled from SIM_CONFIG (not hardcoded) so this can never drift out of
  // sync with the cron tick / candle window again.
  const candlePeriodSec = SIM_CONFIG.CANDLE_WINDOW_SEC;
  const candles = Math.max(1, Math.round(durationSec / candlePeriodSec));

  trendState.active = true;
  trendState.sector = sector;
  trendState.totalChangePct = totalPct;
  trendState.durationSec = durationSec;
  trendState.startedAt = new Date();
  trendState.endsAt = new Date(
    trendState.startedAt.getTime() + durationSec * 1000
  );
  trendState.candlesPlanned = candles;
  trendState.candlesApplied = 0;

  // We’ll apply the change approximately evenly per candle (linear drift).
  // Example: total +5% over N candles => about +5/N % per candle.
  trendState.perCandlePct = totalPct / candles; // percentage points per candle

  return { ok: true, trendState };
}

export function stopSectorTrend() {
  trendState.active = false;
  trendState.sector = null;
  trendState.totalChangePct = 0;
  trendState.durationSec = 0;
  trendState.startedAt = null;
  trendState.endsAt = null;
  trendState.perCandlePct = 0;
  trendState.candlesPlanned = 0;
  trendState.candlesApplied = 0;

  return { ok: true };
}
