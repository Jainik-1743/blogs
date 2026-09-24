import Link from "next/link";

/**
 * The site mark: a sky tile with three lines of text and a cursor still writing the last one.
 * Deliberately not tied to DevOps — it stands for "posts being written", whatever the series.
 * The same drawing is used for the favicon (app/icon.svg) and the Apple touch icon.
 */
export function LogoMark({ size = 26, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={className}
      fill="none"
    >
      <rect width="32" height="32" rx="8" style={{ fill: "var(--color-sky)" }} />
      <g stroke="#0b1120" strokeWidth="2.75" strokeLinecap="round">
        <path d="M9 10.5h14" />
        <path d="M9 16h14" />
        <path d="M9 21.5h7" />
      </g>
      <rect x="19.5" y="19.5" width="4" height="4" rx="1" fill="#0b1120" />
    </svg>
  );
}

/** Mark + wordmark, linking home. */
export default function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 font-bold tracking-tight text-ink hover:text-sky hover:no-underline"
      aria-label="blogs — home"
    >
      <LogoMark />
      <span>blogs</span>
    </Link>
  );
}
