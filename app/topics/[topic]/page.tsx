import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { TOPIC_PAGES, seriesBySlug } from "@/lib/registry";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOPIC_PAGES.map((t) => ({ topic: t.def.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic } = await params;
  return pageMetadata(`/topics/${topic}`);
}

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const t = TOPIC_PAGES.find((x) => x.def.slug === topic);
  if (!t) notFound();

  const groups: { slug: string; title: string; lessons: typeof t.lessons }[] = [];
  for (const l of t.lessons) {
    let g = groups.find((x) => x.slug === l.seriesSlug);
    if (!g) groups.push((g = { slug: l.seriesSlug!, title: l.seriesTitle ?? l.seriesSlug!, lessons: [] }));
    g.lessons.push(l);
  }
  const others = TOPIC_PAGES.filter((x) => x.def.slug !== topic);
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: t.def.title,
        description: t.def.blurb,
        url: absoluteUrl(`/topics/${topic}`),
        mainEntity: {
          "@type": "ItemList",
          itemListElement: t.lessons.map((l, i) => ({ "@type": "ListItem", position: i + 1, name: l.title, url: absoluteUrl(l.path) })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Topics", item: absoluteUrl("/topics") },
          { "@type": "ListItem", position: 3, name: t.def.title, item: absoluteUrl(`/topics/${topic}`) },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={ld} />
      <nav className="mb-4 font-mono text-[0.8rem] text-ink-dim" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-sky">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/topics" className="hover:text-sky">Topics</Link>
      </nav>
      <p className="mb-2 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">Topic · {t.lessons.length} lessons in {groups.length} series</p>
      <h1 className="mb-3 text-[2.2rem] font-bold leading-tight tracking-tight text-sky max-sm:text-[1.8rem]">{t.def.title}</h1>
      <p className="text-[1.1rem] text-ink-dim">{t.def.blurb}</p>

      {groups.map((g) => {
        const s = seriesBySlug(g.slug);
        return (
          <section key={g.slug} className="mt-8">
            <h2 className="mb-2 flex items-baseline justify-between gap-3 border-b border-line pb-2 text-[1.2rem] font-semibold text-ink">
              <span>{s?.short ?? g.title}</span>
              <Link href={`/${g.slug}`} className="font-mono text-[0.75rem] font-normal text-sky">Whole series →</Link>
            </h2>
            <ul className="m-0 list-none p-0">
              {g.lessons.map((l) => (
                <li key={l.path}>
                  <Link href={l.path} className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 rounded-lg px-3 py-3 text-ink hover:bg-sky-soft hover:no-underline">
                    <span className="font-semibold">
                      {l.title}
                      <small className="mt-0.5 block text-[0.9rem] font-normal text-ink-dim">{l.description}</small>
                    </span>
                    <span className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-ink-dim">{l.readTime ?? ""}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <section className="mt-12 rounded-2xl border border-line bg-bg-elev p-5">
        <h2 className="mb-3 mt-0 text-[1.1rem] font-semibold text-ink">More topics</h2>
        <div className="flex flex-wrap gap-2">
          {others.map((o) => (
            <Link key={o.def.slug} href={`/topics/${o.def.slug}`} className="rounded-full border border-line px-3 py-1 text-[0.85rem] text-ink-dim hover:border-sky hover:text-sky hover:no-underline">
              {o.def.title}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
