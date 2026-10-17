import type { Metadata } from "next";
import Link from "next/link";
import { groupedSeries } from "@/lib/registry";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("/glossaries");

/** One page that links to every glossary on the site, grouped like the home page. */
export default function GlossariesPage() {
  const groups = groupedSeries();
  const total = groups.reduce((n, g) => n + g.series.reduce((m, s) => m + s.termCount, 0), 0);
  return (
    <>
      <p className="mb-2 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">Glossaries</p>
      <h1 className="mb-3 text-[2.2rem] font-bold leading-tight tracking-tight text-sky max-sm:text-[1.8rem]">
        Clear definitions for developers
      </h1>
      <p className="max-w-[62ch] text-[1.05rem] text-ink-dim">
        {total} terms across {groups.reduce((n, g) => n + g.series.length, 0)} glossaries. Each term has a one-line meaning and a
        link to the lesson that explains it. You can also hover any dotted term inside a lesson.
      </p>
      {groups.map((g) => (
        <section key={g.id} className="mt-8">
          <h2 className="mb-3 text-[1.35rem] font-semibold text-ink">{g.title}</h2>
          <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
            {g.series.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/${s.slug}/glossary`}
                  data-accent={s.accent}
                  className="flex items-baseline justify-between gap-3 rounded-lg border border-line bg-bg-elev px-4 py-3 text-ink hover:border-sky hover:no-underline"
                >
                  <span className="font-medium">{s.short} glossary</span>
                  <span className="font-mono text-[0.78rem] text-sky">{s.termCount} terms</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
