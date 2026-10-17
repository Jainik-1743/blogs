import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
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

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = guideBySlug(slug);
  if (!g) notFound();
  const modified = pageDates(`/guides/${slug}`).modified;
  let n = 0;
  return (
    <article>
      <JsonLd data={guideJsonLd(slug)} />
      <nav aria-label="Breadcrumb" className="mb-3 text-[0.85rem] text-ink-dim">
        <Link href="/">Home</Link> / <Link href="/guides">Guides</Link>
      </nav>
      <h1 className="mb-3 text-[2.2rem] font-bold leading-tight tracking-tight text-sky max-sm:text-[1.8rem]">{g.title}</h1>
      {g.intro.map((t, i) => (
        <p key={i} className="text-ink-dim">{t}</p>
      ))}
      <p className="text-ink-dim"><strong className="text-ink">Who it is for:</strong> {g.audience}</p>
      <p className="text-[0.85rem] text-ink-dim">
        {g.lessonCount} lessons · Published by <Link href="/about">Jainik</Link>
        {modified ? <> · Last updated <time dateTime={modified}>{formatDate(modified)}</time></> : null}
      </p>

      {g.sections.map((s, si) => (
        <section key={s.heading} aria-labelledby={`s${si}`} className="mt-9">
          <h2 id={`s${si}`} className="mb-1 text-[1.4rem] font-semibold text-ink">{si + 1}. {s.heading}</h2>
          {s.note ? <p className="mt-0 mb-3 text-ink-dim">{s.note}</p> : null}
          <ol className="m-0 list-none space-y-2 p-0">
            {s.pages.map((p) => (
              <li key={p.path} data-accent={p.accent} className="rounded-lg border border-line bg-bg-elev px-4 py-3">
                <div className="font-mono text-[0.72rem] text-sky">
                  {++n}. {p.seriesShort}{p.readTime ? ` · ${p.readTime}` : ""}
                </div>
                <Link href={p.path} className="font-semibold">{p.title}</Link>
                <p className="m-0 mt-0.5 line-clamp-2 text-[0.9rem] text-ink-dim">{p.description}</p>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <p className="mt-10 text-ink-dim">
        More reading orders are on the <Link href="/guides">guides page</Link>, and every series is listed on the <Link href="/">home page</Link>.
      </p>
    </article>
  );
}
