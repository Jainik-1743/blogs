import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CheatSheetView, { inline } from "@/components/series-sheets/CheatSheetView";
import PrintButton from "@/components/series-sheets/PrintButton";
import JsonLd from "@/components/JsonLd";
import { SERIES_SHEETS } from "@/lib/series-sheets";
import { seriesBySlug } from "@/lib/registry";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(SERIES_SHEETS).map((series) => ({ series }));
}

export async function generateMetadata({ params }: { params: Promise<{ series: string }> }): Promise<Metadata> {
  const { series } = await params;
  return pageMetadata(`/cheatsheets/series/${series}`);
}

export default async function CheatSheetPage({ params }: { params: Promise<{ series: string }> }) {
  const { series } = await params;
  const sheet = SERIES_SHEETS[series];
  const s = seriesBySlug(series);
  if (!sheet || !s) notFound();
  const lessonHref = (n: number) => {
    const l = s.lessons.find((x) => x.number === n && x.published);
    return l ? s.href(l) : undefined;
  };
  const url = absoluteUrl(`/cheatsheets/series/${series}`);
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: `${s.short} cheat sheet`,
        description: sheet.intro,
        url,
        inLanguage: "en",
        isAccessibleForFree: true,
        author: { "@id": absoluteUrl("/#author") },
        isPartOf: { "@type": "CreativeWorkSeries", name: s.title, url: absoluteUrl(`/${series}`) },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Cheat sheets", item: absoluteUrl("/cheatsheets") },
          { "@type": "ListItem", position: 3, name: "By series", item: absoluteUrl("/cheatsheets/series") },
          { "@type": "ListItem", position: 4, name: s.short, item: url },
        ],
      },
    ],
  };
  return (
    <article data-accent={s.accent} className="ss-page">
      <JsonLd data={ld} />
      <header className="ss-head">
        <nav className="mb-3 font-mono text-[0.8rem] text-ink-dim print:hidden" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-sky">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/cheatsheets" className="hover:text-sky">Cheat sheets</Link>
          <span className="mx-2">/</span>
          <Link href="/cheatsheets/series" className="hover:text-sky">By series</Link>
        </nav>
        <p className="mb-1 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">Cheat sheet · {s.title}</p>
        <h1 className="mb-2 text-[2rem] font-bold leading-tight tracking-tight text-sky max-sm:text-[1.6rem]">{s.short} cheat sheet</h1>
        <p className="m-0 max-w-[80ch] text-ink-dim">{inline(sheet.intro)}</p>
        <div className="mt-4 flex flex-wrap gap-2 print:hidden">
          <PrintButton />
          <Link href={`/${series}`} className="rounded-full border border-line px-4 py-2 text-[0.88rem] font-semibold text-ink hover:border-sky hover:text-sky hover:no-underline">
            Read the full series →
          </Link>
        </div>
        <p className="ss-print-only">{SITE_NAME} · {url.replace(/^https?:\/\//, "")}</p>
      </header>
      <CheatSheetView sheet={sheet} lessonHref={lessonHref} />
      <p className="mt-6 text-[0.85rem] text-ink-dim print:hidden">
        A cheat sheet is a reminder, not a teacher. Each card links to the lesson that explains it step by step.
      </p>
    </article>
  );
}
