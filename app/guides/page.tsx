import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import PageHeader from "@/components/page/PageHeader";
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
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Guides" }]}
        eyebrow="Study guides"
        title="What to read, in what order"
        summary="Each guide gathers lessons from several series into one reading order for a single goal, such as a system design interview or learning SQL. Pick the goal, then follow the list."
        meta={[
          { label: "Guides", value: String(RESOLVED_GUIDES.length) },
          { label: "Lessons covered", value: String(new Set(RESOLVED_GUIDES.flatMap((g) => g.sections.flatMap((s) => s.pages.map((p) => p.path)))).size) },
          { label: "Cost", value: "Free" },
          { label: "Sign-up", value: "Not needed" },
        ]}
      />
      <GuideCards />
    </>
  );
}
