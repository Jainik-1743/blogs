import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import RoadmapDownload from "@/components/RoadmapDownload";
import RoadmapMap from "@/components/RoadmapMap";
import ShareButtons from "@/components/ShareButtons";
import { ROADMAP, ROADMAP_LESSON_COUNT, ROADMAP_SERIES_COUNT } from "@/lib/roadmap";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl, SITE_URL } from "@/lib/site";

export const metadata: Metadata = pageMetadata("/roadmap");

export default function RoadmapPage() {
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Developer roadmap",
        url: absoluteUrl("/roadmap"),
        mainEntity: {
          "@type": "ItemList",
          itemListElement: ROADMAP.map((s, i) => ({ "@type": "ListItem", position: i + 1, name: `${s.title}: ${s.spine.label}`, url: absoluteUrl(s.spine.href) })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Roadmap", item: absoluteUrl("/roadmap") },
        ],
      },
    ],
  };
  return (
    <>
      <JsonLd data={ld} />
      <p className="mb-2 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">Roadmap</p>
      <h1 className="mb-3 text-[2.2rem] font-bold leading-tight tracking-tight text-sky max-sm:text-[1.8rem]">
        Developer roadmap: from the basics to interviews
      </h1>
      <ShareButtons />
      <p className="max-w-[62ch] text-[1.1rem] text-ink-dim">
        Follow the line from top to bottom. Each step has a main series in the middle and the series that go with it on the sides.
        {` ${ROADMAP_SERIES_COUNT} series and ${ROADMAP_LESSON_COUNT} lessons`} are on the map, and every box opens its lessons.
      </p>
      <div className="mt-4">
        <RoadmapDownload stages={ROADMAP} siteUrl={SITE_URL} />
      </div>
      <RoadmapMap />
      <p className="mx-auto mt-8 max-w-[60ch] text-center text-[0.95rem] text-ink-dim">
        You do not have to read everything. Pick the step you are on, open its middle box, and go forward one lesson at a time.
      </p>
    </>
  );
}
