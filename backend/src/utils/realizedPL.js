// realizedPL.js
// FIFO realized P/L calculator. Moved here from realized.controller.js so
// both the REST endpoint (GET /api/trade/realized/:userId) and the socket
// push path use the exact same logic. The old trading.controllers.js had a
// second implementation that relied on a `trade.avgBuyPrice` field that is
// never actually written anywhere, so it always returned 0 — that duplicate
// has been removed.
export function computeRealizedPLFIFO(trades = []) {
  const txs = [...(trades || [])].sort((a, b) => {
    const ta = new Date(a.timestamp || 0).getTime();
    const tb = new Date(b.timestamp || 0).getTime();
    return ta - tb;
  });

  const longLots = new Map(); // symbol -> [{ qty, price }]
  const shortLots = new Map(); // symbol -> [{ qty, price }] (price = short sell price)

  const bySymbol = {};
  let realized = 0;

  const addRealized = (name, amount) => {
    realized += amount;
    bySymbol[name] = (bySymbol[name] || 0) + amount;
  };

  const getName = (t) =>
    typeof t?.sharename === "string" ? t.sharename.trim() : t?.sharename;

  const q = (n) => (Number.isFinite(+n) ? +n : 0);
  const p = (n) => (Number.isFinite(+n) ? +n : NaN);

  for (const t of txs) {
    const name = getName(t);
    if (!name) continue;

    const qty = q(t.quantity);
    const price = p(t.price);
    if (!Number.isFinite(price) || qty <= 0) continue;

    if (!longLots.has(name)) longLots.set(name, []);
    if (!shortLots.has(name)) shortLots.set(name, []);

    switch (t.type) {
      case "BUY": {
        longLots.get(name).push({ qty, price });
        break;
      }
      case "SELL": {
        let remaining = qty;
        const lots = longLots.get(name);
        while (remaining > 0 && lots.length) {
          const lot = lots[0];
          const used = Math.min(remaining, lot.qty);
          const pl = (price - lot.price) * used;
          addRealized(name, Number(pl.toFixed(2)));
          lot.qty -= used;
          remaining -= used;
          if (lot.qty === 0) lots.shift();
        }
        break;
      }
      case "SHORT_SELL": {
        shortLots.get(name).push({ qty, price });
        break;
      }
      case "SHORT_COVER": {
        let remaining = qty;
        const lots = shortLots.get(name);
        while (remaining > 0 && lots.length) {
          const lot = lots[0];
          const used = Math.min(remaining, lot.qty);
          const pl = (lot.price - price) * used;
          addRealized(name, Number(pl.toFixed(2)));
          lot.qty -= used;
          remaining -= used;
          if (lot.qty === 0) lots.shift();
        }
        break;
      }
      default:
        break;
    }
  }

  realized = Number(realized.toFixed(2));
  for (const k of Object.keys(bySymbol)) {
    bySymbol[k] = Number(bySymbol[k].toFixed(2));
  }

  return { realizedPL: realized, bySymbol };
}
