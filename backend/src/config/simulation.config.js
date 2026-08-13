// simulation.config.js
// Single source of truth for simulation timing.
// Change CRON_INTERVAL_SEC here and every consumer (cron schedule, candle
// window, sector-trend candle math) automatically stays in sync — this is
// what caused the old 8s/5s mismatch (cron fired every 8s but candles were
// built over a fixed, hardcoded 5s window).

const CRON_INTERVAL_SEC = Number(process.env.SIM_TICK_SEC || 2);

export const SIM_CONFIG = {
  // How often the price-simulation cron tick runs.
  CRON_INTERVAL_SEC,

  // Candle window MUST equal the tick interval so consecutive candles are
  // back-to-back instead of overlapping/gapping.
  CANDLE_WINDOW_SEC: CRON_INTERVAL_SEC,

  // Sub-ticks inside each candle (for the intra-candle OHLC wiggle).
  // 2 ticks/candle keeps compute cheap at a 2s cadence.
  TICKS_PER_CANDLE: 2,

  // How often (ms) realized/unrealized P&L is pushed to each connected user.
  PL_PUSH_INTERVAL_MS: Number(process.env.PL_PUSH_MS || 1000),

  // node-cron second-field expression derived from CRON_INTERVAL_SEC.
  get CRON_EXPRESSION() {
    return `*/${this.CRON_INTERVAL_SEC} * * * * *`;
  },
};
