import { useMemo } from "react";

/**
 * RollingNumberCurrencyINR
 * - Displays INR currency like Intl 'en-IN' (₹12,34,567.89).
 * - While `spinning` is true, digit reels loop; when false, they settle to the final digits.
 * - Pads the *integer part* only while spinning so multiple reels are visible.
 *
 * Props:
 *  - value: number                          // pass a number (not a preformatted string)
 *  - spinning: boolean
 *  - padWhileSpinning?: number              // min integer digits *while spinning only*
 *  - duration?: number                      // ms per reel rotation (default 700)
 *  - stagger?: number                       // ms between reels (default 60)
 *  - className?: string                     // wrapper classes
 */
export function RollingNumber({
  value,
  spinning,
  padWhileSpinning = 0,
  duration = 700,
  stagger = 60,
  className = "",
}) {
  // 1) Safe rounding to two decimals (avoid 0.820000001)
  const rounded = useMemo(() => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
  }, [value]);

  // 2) Build the *target* formatted string (no leading zeros once settled)
  const target = useMemo(() => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(rounded); // e.g. "₹88,422.82"
  }, [rounded]);

  // 3) While spinning, we show padded integer part (so more reels spin), but still in en-IN style.
  //    When not spinning, we show the exact formatted string (no padding).
  const display = useMemo(() => {
    if (!spinning || padWhileSpinning <= 0) return target;

    // Extract parts from the *unformatted* number, pad integer, then reformat with en-IN groups.
    const abs = Math.abs(rounded);
    const intPart = Math.trunc(abs);
    const decPart = Math.round((abs - intPart) * 100); // 0..99

    const paddedInt = String(intPart).padStart(padWhileSpinning, "0");

    // Apply en-IN grouping (last 3, then 2s): e.g., "000123456" -> "0,00,12,34,56"
    const groupEnIN = (s) => {
      if (s.length <= 3) return s;
      const head = s.slice(0, s.length - 3);
      const tail = s.slice(-3);
      const headGrouped = head.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
      return `${headGrouped},${tail}`;
    };

    const groupedInt = groupEnIN(paddedInt);
    const decStr = decPart.toString().padStart(2, "0");

    // Keep the Rupee symbol on the left like Intl would produce
    return `₹${groupedInt}.${decStr}`;
  }, [spinning, padWhileSpinning, target, rounded]);

  return (
    <span
      className={`inline-flex items-center gap-[2px] font-mono ${className}`}
    >
      <style>{`
        @keyframes reel-spin {
          0%   { transform: translateY(0%); }
          100% { transform: translateY(-100%); }
        }
      `}</style>

      {Array.from(display).map((ch, i) =>
        /\d/.test(ch) ? (
          <DigitReel
            key={i}
            digit={Number(ch)}
            spinning={spinning}
            duration={duration}
            delay={i * stagger}
          />
        ) : (
          // Static tokens (₹, commas, dot) get the *same height* as reels to avoid vertical jumps
          <span
            key={i}
            className="inline-flex items-center justify-center select-none"
            style={{ height: 40, lineHeight: "40px", padding: "0 2px" }}
          >
            {ch}
          </span>
        )
      )}
    </span>
  );
}

function DigitReel({ digit, spinning, duration, delay }) {
  const digits = useMemo(() => {
    const arr = Array.from({ length: 10 }, (_, d) => d);
    return [...arr, ...arr]; // seamless loop
  }, []);

  const itemHeight = 40; // px per row — adjust to your font size
  const reelHeight = itemHeight * digits.length;

  const reelStyle = spinning
    ? {
        animation: `reel-spin ${duration}ms linear infinite`,
        animationDelay: `${delay}ms`,
        willChange: "transform",
      }
    : {
        transform: `translateY(-${digit * itemHeight}px)`,
        transition: "transform 280ms cubic-bezier(.2,.8,.2,1)",
      };

  return (
    <span
      className="relative inline-block overflow-hidden rounded-md bg-transparent"
      style={{ width: 22, height: itemHeight }}
    >
      {/* Optional glass pulse while spinning */}
      {spinning && (
        <span className="pointer-events-none absolute inset-0 rounded-md bg-white/30 dark:bg-gray-700/30 backdrop-blur-[1.5px] animate-pulse" />
      )}

      <span
        className="absolute left-0 top-0 w-full"
        style={{ ...reelStyle, height: reelHeight }}
      >
        {digits.map((d, idx) => (
          <span
            key={idx}
            className="flex items-center justify-center select-none"
            style={{ height: itemHeight }}
          >
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}
