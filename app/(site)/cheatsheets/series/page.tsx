import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { SERIES_SHEETS } from "@/lib/series-sheets";
import { groupedSeries } from "@/lib/registry";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = pageMetadata("/cheatsheets/series");

export default function CheatSheetsPage() {
  const groups = groupedSeries()
    .map((g) => ({ ...g, series: g.series.filter((s) => SERIES_SHEETS[s.slug]) }))
    .filter((g) => g.series.length);
  const all = groups.flatMap((g) => g.series);
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Cheat sheets",
        url: absoluteUrl("/cheatsheets/series"),
        mainEntity: {
          "@type": "ItemList",
          itemListElement: all.map((s, i) => ({ "@type": "ListItem", position: i + 1, name: `${s.short} cheat sheet`, url: absoluteUrl(`/cheatsheets/series/${s.slug}`) })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Cheat sheets", item: absoluteUrl("/cheatsheets") },
          { "@type": "ListItem", position: 3, name: "By series", item: absoluteUrl("/cheatsheets/series") },
        ],
      },
    ],
  };
  return (
    <>
      <JsonLd data={ld} />
      <nav className="mb-3 font-mono text-[0.8rem] text-ink-dim" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-sky">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/cheatsheets" className="hover:text-sky">Cheat sheets</Link>
      </nav>
      <p className="mb-2 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">By series · {all.length} sheets</p>
      <h1 className="mb-3 text-[2.2rem] font-bold leading-tight tracking-tight text-sky max-sm:text-[1.8rem]">Cheat sheets by series</h1>
      <p className="text-[1.05rem] text-ink-dim">
        One dense page per series: the commands, rules, tables and gotchas you want next to you in an interview or at your
        desk. Each card links to the lesson that teaches it, and every sheet prints cleanly or saves as a PDF.
      </p>
      {groups.map((g) => (
        <section key={g.id} className="mt-8">
          <h2 className="mb-3 text-[1.3rem] font-semibold text-ink">{g.title}</h2>
          <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {g.series.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/cheatsheets/series/${s.slug}`}
                  data-accent={s.accent}
                  className="flex h-full items-baseline justify-between gap-3 rounded-lg border border-line bg-bg-elev px-4 py-3 text-ink hover:border-sky hover:no-underline"
                >
                  <span className="font-medium">{s.short}</span>
                  <span className="font-mono text-[0.75rem] text-sky">{SERIES_SHEETS[s.slug].sections.length} cards</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
