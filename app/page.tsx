import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { RESOLVED_GUIDES } from "@/lib/guides";
import { ALL_PAGES, groupedSeries } from "@/lib/registry";
import { homeJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("/");

export default function HomePage() {
  const groups = groupedSeries();
  const lessonCount = ALL_PAGES.filter((p) => p.kind === "lesson").length;
  const seriesCount = groups.reduce((n, g) => n + g.series.length, 0);

  return (
    <>
      <JsonLd data={homeJsonLd()} />
      <p className="mb-2 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">Free lessons for software engineers</p>
      <h1 className="mb-3 text-[2.4rem] font-bold leading-tight tracking-tight text-sky max-sm:text-[1.9rem]">
        Learn DSA, system design, DevOps, JavaScript and more, one clear lesson at a time.
      </h1>
      <p className="max-w-[62ch] text-[1.1rem] text-ink-dim">
        {seriesCount} lesson series and {lessonCount} lessons, written in plain English. Each series reads like a small book:
        start at the first lesson and go forward. Every idea is traced step by step, and most lessons end with interview
        questions and model answers.
      </p>

      <section aria-labelledby="start-guides" className="mt-10">
        <h2 id="start-guides" className="mb-1 text-[1.5rem] font-semibold text-ink">Start with a guide</h2>
        <p className="mt-0 mb-4 text-ink-dim">
          Not sure where to begin? Each <Link href="/guides">study guide</Link> picks the lessons for one goal and puts them in order.
        </p>
        <ul className="m-0 grid list-none gap-x-6 gap-y-1.5 p-0 sm:grid-cols-2">
          {RESOLVED_GUIDES.map((g) => (
            <li key={g.slug}><Link href={`/guides/${g.slug}`}>{g.title}</Link></li>
          ))}
        </ul>
      </section>

      {groups.map((g) => (
        <section key={g.id} aria-labelledby={`group-${g.id}`} className="mt-10">
          <h2 id={`group-${g.id}`} className="mb-1 text-[1.5rem] font-semibold text-ink">
            {g.title}
          </h2>
          <p className="mt-0 mb-4 text-ink-dim">{g.blurb}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {g.series.map((s) => {
              const published = s.lessons.filter((l) => l.published).length;
              return (
                <Link
                  key={s.slug}
                  href={`/${s.slug}`}
                  data-accent={s.accent}
                  className="block rounded-xl border border-line bg-bg-elev px-5 py-4 text-ink transition hover:-translate-y-0.5 hover:border-sky hover:no-underline"
                >
                  <div className="font-mono text-[0.75rem] text-sky">{published} lessons</div>
                  <h3 className="my-1 text-[1.1rem] font-semibold leading-snug text-sky-strong">{s.title}</h3>
                  <p className="m-0 line-clamp-3 text-[0.9rem] text-ink-dim">{s.tagline}</p>
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      <p className="mt-10 text-ink-dim">
        Looking for a definition? Every series has a glossary, and they are all listed on the{" "}
        <Link href="/glossaries">glossaries page</Link>.
      </p>
    </>
  );
}
