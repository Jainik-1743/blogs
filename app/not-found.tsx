import type { Metadata } from "next";
import Link from "next/link";
import { SERIES_GROUPS, SERIES_SHORT, ALL_SERIES } from "@/lib/series";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true } };

const nameOf = (slug: string) => SERIES_SHORT[slug] ?? ALL_SERIES.find((s) => s.slug === slug)?.title ?? slug;

export default function NotFound() {
  return (
    <>
      <p className="mb-2 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">404</p>
      <h1 className="mb-3 text-[2.2rem] font-bold leading-tight text-sky">That page does not exist.</h1>
      <p className="max-w-[60ch] text-ink-dim">
        The link may be old, or the lesson may not be published yet. Pick a series below, or go back to the{" "}
        <Link href="/">home page</Link>.
      </p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {SERIES_GROUPS.map((g) => (
          <div key={g.id}>
            <h2 className="mt-0 mb-2 text-[1.05rem] font-semibold text-ink">{g.title}</h2>
            <ul className="m-0 list-none space-y-1 p-0">
              {g.slugs.map((slug) => (
                <li key={slug}>
                  <Link href={`/${slug}`}>{nameOf(slug)}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
