/**
 * The flame badge with the reader's streak in its centre. The picture (public/streak/streak-plate.webp) has an
 * empty middle; the number is real text drawn on top, so it can be any value (1, 2, 28, 120 ...) and stays sharp.
 * The badge sits on its own dark tile so it looks the same in the light and dark themes.
 */
export default function StreakBadge({ days, size = 220 }: { days: number; size?: number }) {
  const digits = String(days).length;
  // Where the painted number was, as a share of the badge, and how large it may be for 1, 2, 3 or 4 digits.
  const fontSize = size * (digits <= 2 ? 0.19 : digits === 3 ? 0.155 : 0.125);
  const active = days > 0;

  return (
    <div
      role="img"
      aria-label={`${days}-day streak`}
      className="relative shrink-0 overflow-hidden rounded-[1.75rem] bg-[#070b16] ring-1 ring-white/5"
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/streak/streak-plate.webp"
        alt=""
        width={size}
        height={size}
        decoding="async"
        draggable={false}
        className={`absolute inset-0 h-full w-full select-none object-contain transition ${active ? "" : "opacity-45 grayscale"}`}
      />
      <span
        aria-hidden="true"
        className="absolute font-extrabold leading-none tabular-nums"
        style={{
          left: "49.6%",
          top: "53.7%",
          transform: "translate(-50%, -50%)",
          fontSize,
          fontFamily: "var(--font-sans), system-ui, sans-serif",
          fontWeight: 900,
          letterSpacing: "-0.02em",
          backgroundImage: active ? "linear-gradient(180deg, #fff7c9 0%, #ffd84d 45%, #ff9f1c 100%)" : "linear-gradient(180deg, #b6b0a8 0%, #8c867e 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          filter: active
            ? `drop-shadow(0 ${fontSize * 0.04}px 0 #a8480a) drop-shadow(0 0 ${fontSize * 0.18}px rgba(255,150,30,0.55))`
            : `drop-shadow(0 ${fontSize * 0.04}px 0 #3b3631)`,
        }}
      >
        {days}
      </span>
    </div>
  );
}
