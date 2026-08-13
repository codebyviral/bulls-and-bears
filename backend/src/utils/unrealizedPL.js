// unrealizedPL.js
// Extracted from trading.controllers.js (unchanged logic) so it can be
// imported from plCache.js without creating a circular
// trading.controllers.js <-> plCache.js import.

// Accepts livePrices as an object map OR an array of { sharename, price/lastHistory }
export function getUnrealizedPL(portfolio = [], livePrices = {}) {
  let map = {};
  if (Array.isArray(livePrices)) {
    for (const s of livePrices) {
      const name =
        typeof s?.sharename === "string" ? s.sharename.trim() : s?.sharename;
      const price = Number(s?.price ?? s?.lastHistory?.close);
      if (name && Number.isFinite(price)) map[name] = price;
    }
  } else if (livePrices && typeof livePrices === "object") {
    for (const [k, v] of Object.entries(livePrices)) {
      const n = Number(v);
      if (k && Number.isFinite(n)) map[k.trim()] = n;
    }
  }

  let unrealized = 0;

  for (const pos of portfolio) {
    const name =
      typeof pos?.sharename === "string"
        ? pos.sharename.trim()
        : pos?.sharename;
    const marketPrice = map[name];
    if (!Number.isFinite(marketPrice)) continue;

    const entryPrice =
      typeof pos?.buyPrice === "number"
        ? pos.buyPrice
        : typeof pos?.avgPrice === "number"
        ? pos.avgPrice
        : NaN;

    const qty = Number(pos?.quantity ?? 0);

    if (Number.isFinite(entryPrice) && Number.isFinite(qty)) {
      unrealized += (marketPrice - entryPrice) * qty;
    }
  }

  return Number(unrealized.toFixed(2));
}
