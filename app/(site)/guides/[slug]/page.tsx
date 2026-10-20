import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import PageHeader from "@/components/page/PageHeader";
import SectionTitle from "@/components/page/SectionTitle";
import { RESOLVED_GUIDES, guideBySlug } from "@/lib/guides";
import { guideJsonLd, pageDates, pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return RESOLVED_GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return pageMetadata(`/guides/${slug}`);
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

const rowClass = "grid grid-cols-[3.2rem_1fr] items-baseline gap-x-4 gap-y-1 border-b border-line px-4 py-4 sm:grid-cols-[4.2rem_1fr_auto]";

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = guideBySlug(slug);
  if (!g) notFound();
  const modified = pageDates(`/guides/${slug}`).modified;
  const minutes = g.sections.reduce((t, s) => t + s.pages.reduce((m, p) => m + (parseInt(p.readTime ?? "0", 10) || 0), 0), 0);
  let n = 0;
  return (
    <article>
      <JsonLd data={guideJsonLd(slug)} />
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Guides", href: "/guides" }, { label: g.title }]}
        eyebrow="Study guide"
        title={g.title}
        summary={g.intro[0]}
        meta={[
          { label: "Lessons", value: String(g.lessonCount) },
          { label: "Parts", value: String(g.sections.length) },
          { label: "Reading time", value: minutes ? `~${Math.round(minutes / 60)} hours` : "Self-paced" },
          { label: "Updated", value: modified ? formatDate(modified) : "Recently" },
        ]}
      >
        <p className="mt-3 mb-0 text-[0.92rem] text-ink-dim">
          <strong className="text-ink">Who it is for:</strong> {g.audience}
        </p>
      </PageHeader>

      {g.intro.length > 1 && (
        <div className="mb-10 max-w-[68ch] space-y-3 text-ink-dim">
          {g.intro.slice(1).map((t, i) => <p key={i} className="m-0">{t}</p>)}
        </div>
      )}

      <section aria-labelledby="outline" className="mb-12">
        <SectionTitle id="outline" title="Outline" count={`${g.sections.length} parts`} />
        <ol className="m-0 grid list-none gap-x-10 p-0 sm:grid-cols-2">
          {g.sections.map((s, si) => (
            <li key={s.heading} className="m-0 border-b border-line">
              <a href={`#s${si}`} className="group flex items-baseline justify-between gap-4 px-1 py-3 text-ink hover:no-underline">
                <span><span className="mr-3 font-mono text-[0.85rem] text-sky">{String(si + 1).padStart(2, "0")}</span><span className="font-medium transition group-hover:text-sky">{s.heading}</span></span>
                <span className="shrink-0 text-[0.8rem] text-ink-dim">{s.pages.length} lessons</span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      {g.sections.map((s, si) => (
        <section key={s.heading} aria-labelledby={`s${si}`} className="mb-14 scroll-mt-24">
          <SectionTitle id={`s${si}`} title={`${si + 1}. ${s.heading}`} count={`${s.pages.length} lessons`} note={s.note} />
          <ol className="m-0 list-none p-0">
            {s.pages.map((p) => (
              <li key={p.path} data-accent={p.accent}>
                <Link href={p.path} className={`${rowClass} rounded-lg text-ink hover:bg-sky-soft hover:no-underline`}>
                  <span className="font-mono text-[0.85rem] text-sky">{String(++n).padStart(2, "0")}</span>
                  <span className="font-semibold">
                    {p.title}
                    <small className="mt-0.5 line-clamp-2 block text-[0.9rem] font-normal text-ink-dim">{p.description}</small>
                  </span>
                  <span className="col-start-2 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-ink-dim sm:col-start-auto">
                    {p.seriesShort}{p.readTime ? ` · ${p.readTime}` : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <p className="m-0 border-t border-line pt-8 text-ink-dim">
        More reading orders are on the <Link href="/guides">guides page</Link>, and every series is listed on the <Link href="/">home page</Link>.
      </p>
    </article>
  );
}
