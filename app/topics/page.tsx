import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { TOPIC_PAGES } from "@/lib/registry";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = pageMetadata("/topics");

export default function TopicsPage() {
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Browse by topic",
        url: absoluteUrl("/topics"),
        mainEntity: {
          "@type": "ItemList",
          itemListElement: TOPIC_PAGES.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.def.title, url: absoluteUrl(`/topics/${t.def.slug}`) })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Topics", item: absoluteUrl("/topics") },
        ],
      },
    ],
  };
  return (
    <>
      <JsonLd data={ld} />
      <p className="mb-2 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">Topics</p>
      <h1 className="mb-3 text-[2.2rem] font-bold leading-tight tracking-tight text-sky max-sm:text-[1.8rem]">
        Browse by topic
      </h1>
      <p className="text-[1.1rem] text-ink-dim">
        The series go deep on one subject at a time. A topic goes across them: pick caching, security or databases and see
        every lesson about it, from every series, in one list.
      </p>
      <ul className="m-0 mt-8 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {TOPIC_PAGES.map(({ def, lessons }) => (
          <li key={def.slug}>
            <Link
              href={`/topics/${def.slug}`}
              className="flex h-full flex-col rounded-2xl border border-line bg-bg-elev p-5 text-ink transition hover:-translate-y-0.5 hover:border-sky hover:no-underline"
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className="text-[1.1rem] font-semibold">{def.title}</span>
                <span className="font-mono text-[0.72rem] text-sky">{lessons.length} lessons</span>
              </span>
              <span className="mt-1.5 text-[0.9rem] leading-relaxed text-ink-dim">{def.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
