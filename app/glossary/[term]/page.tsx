import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { TERM_PAGES, relatedTerms, termBySlug, termPath } from "@/lib/glossary-terms";
import { seriesBySlug } from "@/lib/registry";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return TERM_PAGES.map((t) => ({ term: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ term: string }> }): Promise<Metadata> {
  const { term } = await params;
  return pageMetadata(termPath(term));
}

export default async function TermPage({ params }: { params: Promise<{ term: string }> }) {
  const { term } = await params;
  const t = termBySlug(term);
  if (!t) notFound();
  const related = relatedTerms(t);
  const url = absoluteUrl(termPath(t.slug));

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "DefinedTerm",
        name: t.name,
        description: t.uses[0].entry.desc,
        url,
        inDefinedTermSet: absoluteUrl("/glossary"),
        ...(t.full ? { alternateName: t.full } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Glossary", item: absoluteUrl("/glossary") },
          { "@type": "ListItem", position: 3, name: t.name, item: url },
        ],
      },
    ],
  };

  return (
    <article data-no-glossary>
      <JsonLd data={ld} />
      <nav className="mb-4 font-mono text-[0.8rem] text-ink-dim" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-sky">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/glossary" className="hover:text-sky">Glossary</Link>
        <span className="mx-2">/</span>
        <span>{t.name}</span>
      </nav>
      <p className="mb-2 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">Glossary term</p>
      <h1 className="mb-2 text-[2.2rem] font-bold leading-tight tracking-tight text-sky max-sm:text-[1.8rem] [overflow-wrap:anywhere]">{t.heading}</h1>
      {t.full ? <p className="mb-0 text-[1.05rem] text-ink-dim">{t.name} stands for {t.full}.</p> : null}

      <div className="mt-6 space-y-4">
        {t.uses.map((u) => {
          const s = seriesBySlug(u.series);
          const num = u.entry.lesson;
          const lesson = num !== undefined ? s?.lessons.find((l) => l.number === num && l.published) : undefined;
          return (
            <section key={u.series} data-accent={s?.accent} className="rounded-2xl border border-line bg-bg-elev p-5">
              {t.uses.length > 1 ? (
                <p className="m-0 mb-2 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-sky">In {s?.short ?? u.seriesTitle}</p>
              ) : null}
              <p className="m-0 text-[1.1rem] leading-relaxed text-ink">{u.entry.desc}</p>
              {lesson && s ? (
                <Link
                  href={s.href(lesson)}
                  className="mt-4 block rounded-xl border border-sky/40 bg-sky-soft px-4 py-3 text-ink hover:border-sky hover:no-underline"
                >
                  <span className="block font-mono text-[0.72rem] uppercase tracking-[0.1em] text-sky">Learn it properly · {s.short}</span>
                  <span className="block font-semibold">Lesson {lesson.number}: {lesson.title}</span>
                  {lesson.summary ? <span className="mt-0.5 block text-[0.9rem] text-ink-dim">{lesson.summary}</span> : null}
                </Link>
              ) : (
                <p className="mb-0 mt-3 text-[0.9rem]">
                  <Link href={`/${u.series}`}>Start the {s?.short ?? u.seriesTitle} series →</Link>
                </p>
              )}
              <p className="mb-0 mt-3 text-[0.85rem] text-ink-dim">
                <Link href={`/${u.series}/glossary`}>All {s?.short ?? u.seriesTitle} terms</Link>
              </p>
            </section>
          );
        })}
      </div>

      {related.length ? (
        <section className="mt-10">
          <h2 className="mb-3 mt-0 text-[1.2rem] font-semibold text-ink">Related terms</h2>
          <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={termPath(r.slug)} className="block rounded-lg border border-line px-4 py-2.5 text-ink hover:border-sky hover:no-underline">
                  <span className="font-mono font-semibold text-sky-strong">{r.name}</span>
                  {r.full ? <span className="ml-2 text-[0.85rem] text-ink-dim">{r.full}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-10 text-[0.9rem] text-ink-dim">
        <Link href="/glossary">← All glossary terms, A to Z</Link>
      </p>
    </article>
  );
}
