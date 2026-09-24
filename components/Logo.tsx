import Link from "next/link";

/**
 * The site mark: a lowercase "b" (stem + round bowl) on an accent-gradient tile, with a text
 * cursor beside it — a post still being written. It reads the accent variables, so it takes
 * on the series colour (and the reader's pick). The favicon (app/icon.svg) and the Apple
 * touch icon draw the same shapes in sky.
 */
export function LogoMark({
  size = 30,
  className = "",
  gradientId = "logo-tile",
}: {
  size?: number;
  className?: string;
  /** Must be unique per page when the mark is drawn more than once. */
  gradientId?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={className}
      fill="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: "var(--color-sky-strong)" }} />
          <stop offset="1" style={{ stopColor: "var(--color-sky)" }} />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${gradientId})`} />
      <rect x="0.5" y="0.5" width="31" height="31" rx="8.5" stroke="#fff" strokeOpacity="0.22" />
      <rect x="6.5" y="6.5" width="3.6" height="19" rx="1.8" fill="#0b1120" />
      <circle cx="14.7" cy="19.2" r="5.4" stroke="#0b1120" strokeWidth="3.6" />
      <rect className="logo-caret" x="23.4" y="12.8" width="2.8" height="13.4" rx="1.4" fill="#0b1120" />
    </svg>
  );
}

/** Mark + wordmark, linking home. */
export default function Logo() {
  return (
    <Link
      href="/"
      className="logo group flex shrink-0 items-center gap-2.5 text-[1.05rem] font-bold tracking-tight text-ink hover:no-underline"
      aria-label="blogs — home"
    >
      <LogoMark className="transition-transform duration-200 group-hover:-rotate-6" />
      <span>
        <span className="font-mono font-semibold text-sky">/</span>
        <span className="transition-colors group-hover:text-sky-strong">blogs</span>
      </span>
    </Link>
  );
}
