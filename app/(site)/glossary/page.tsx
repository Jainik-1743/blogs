import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { TERM_PAGES, termPath } from "@/lib/glossary-terms";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = pageMetadata("/glossary");

const letterOf = (name: string) => {
  const c = name.trim()[0]?.toUpperCase() ?? "#";
  return /[A-Z]/.test(c) ? c : "#";
};

export default function GlossaryAZPage() {
  const byLetter = new Map<string, typeof TERM_PAGES>();
  for (const t of TERM_PAGES) {
    const l = letterOf(t.name);
    byLetter.set(l, [...(byLetter.get(l) ?? []), t]);
  }
  const letters = [...byLetter.keys()].sort((a, b) => (a === "#" ? -1 : b === "#" ? 1 : a.localeCompare(b)));
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "DefinedTermSet",
        "@id": absoluteUrl("/glossary"),
        name: "Developer glossary",
        url: absoluteUrl("/glossary"),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Glossary", item: absoluteUrl("/glossary") },
        ],
      },
    ],
  };
  return (
    <article data-no-glossary>
      <JsonLd data={ld} />
      <p className="mb-2 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">Glossary · {TERM_PAGES.length} terms</p>
      <h1 className="mb-3 text-[2.2rem] font-bold leading-tight tracking-tight text-sky max-sm:text-[1.8rem]">
        Developer glossary, A to Z
      </h1>
      <p className="text-[1.05rem] text-ink-dim">
        Every term used across the lessons, each with its own page: a short, clear meaning and a link to the lesson that
        explains it properly. Looking for one series? See the <Link href="/glossaries">glossaries by series</Link>.
      </p>

      <nav aria-label="Letters" className="sticky top-14 z-10 -mx-1 my-6 flex flex-wrap gap-1.5 bg-bg/90 px-1 py-2 backdrop-blur">
        {letters.map((l) => (
          <a key={l} href={`#letter-${l === "#" ? "other" : l}`} className="grid h-8 w-8 place-items-center rounded-lg border border-line font-mono text-[0.82rem] text-ink-dim hover:border-sky hover:text-sky hover:no-underline">
            {l}
          </a>
        ))}
      </nav>

      {letters.map((l) => (
        <section key={l} className="mb-8">
          <h2 id={`letter-${l === "#" ? "other" : l}`} className="mb-3 scroll-mt-32 border-b border-line pb-1 text-[1.5rem] font-semibold text-sky">
            {l}
          </h2>
          <ul className="m-0 grid list-none gap-x-6 gap-y-1.5 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {byLetter.get(l)!.map((t) => (
              <li key={t.slug} className="min-w-0">
                <Link href={termPath(t.slug)} className="block truncate text-ink hover:text-sky hover:no-underline" title={t.full || t.name}>
                  <span className="font-mono font-semibold">{t.name}</span>
                  {t.full ? <span className="ml-2 text-[0.82rem] text-ink-dim">{t.full}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  );
}
