import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DownloadBar from "@/components/cheatsheets/DownloadBar";
import SheetPoster from "@/components/cheatsheets/SheetPoster";
import PageHeader from "@/components/page/PageHeader";
import SectionTitle from "@/components/page/SectionTitle";
import { SHEETS, rowCount, sheetBySlug, sheetPath } from "@/lib/cheatsheets";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return SHEETS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return pageMetadata(sheetPath(slug));
}

export default async function CheatSheetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sheet = sheetBySlug(slug);
  if (!sheet) notFound();
  const more = SHEETS.filter((s) => s.slug !== slug && s.group === sheet.group).slice(0, 3);
  const others = more.length >= 3 ? more : [...more, ...SHEETS.filter((s) => s.slug !== slug && s.group !== sheet.group)].slice(0, 3);

  return (
    <article>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Cheat sheets", href: "/cheatsheets" }, { label: sheet.title.replace(/ cheat sheet$/, "") }]}
        eyebrow={`Cheat sheet · ${sheet.group}`}
        title={sheet.title}
        summary={sheet.blurb}
        meta={[
          { label: "Sections", value: String(sheet.sections.length) },
          { label: "Items", value: String(rowCount(sheet)) },
          { label: "Area", value: sheet.group },
          { label: "Download", value: "PNG, PDF" },
        ]}
      />

      <DownloadBar slug={sheet.slug} accent={sheet.accent} />
      <SheetPoster sheet={sheet} />

      <section aria-labelledby="learn" className="mt-12">
        <SectionTitle id="learn" title="Learn it properly" />
        <p className="mt-0 mb-4 max-w-[62ch] text-ink-dim">A cheat sheet helps you remember. These lessons explain the ideas step by step, with examples.</p>
        <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
          {sheet.learn.map(([label, href]) => (
            <li key={href} className="m-0"><Link href={href} className="inline-block rounded-lg border border-sky px-4 py-2 font-semibold text-sky hover:bg-sky-soft hover:no-underline">{label} →</Link></li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="more" className="mt-12">
        <SectionTitle id="more" title="More cheat sheets" />
        <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-3">
          {others.map((s) => (
            <li key={s.slug} data-accent={s.accent} className="m-0">
              <Link href={sheetPath(s.slug)} className="block h-full rounded-xl border border-line bg-bg-elev p-5 text-ink hover:border-sky hover:no-underline">
                <span className="font-mono text-[0.8rem] font-bold text-sky">{s.badge}</span>
                <span className="mt-2 block font-semibold leading-snug">{s.title.replace(/ cheat sheet$/, "")}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6"><Link href="/cheatsheets">All cheat sheets →</Link></p>
      </section>
    </article>
  );
}
