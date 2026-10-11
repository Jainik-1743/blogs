import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import GuideCards from "@/components/GuideCards";
import { RESOLVED_GUIDES } from "@/lib/guides";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = pageMetadata("/guides");

export default function GuidesPage() {
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Study guides",
        url: absoluteUrl("/guides"),
        mainEntity: {
          "@type": "ItemList",
          itemListElement: RESOLVED_GUIDES.map((g, i) => ({ "@type": "ListItem", position: i + 1, name: g.title, url: absoluteUrl(`/guides/${g.slug}`) })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Guides", item: absoluteUrl("/guides") },
        ],
      },
    ],
  };
  return (
    <>
      <JsonLd data={ld} />
      <p className="mb-2 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">Study guides</p>
      <h1 className="mb-3 text-[2.2rem] font-bold leading-tight tracking-tight text-sky max-sm:text-[1.8rem]">
        Study guides: what to read, in what order
      </h1>
      <p className="max-w-[62ch] text-[1.1rem] text-ink-dim">
        Each guide gathers lessons from several series into one reading order for a single goal, such as a system design
        interview or learning SQL. Pick the goal, then follow the list.
      </p>
      <div className="mt-8"><GuideCards /></div>
    </>
  );
}
