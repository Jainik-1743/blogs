import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import RoadmapDownload from "@/components/RoadmapDownload";
import RoadmapMap from "@/components/RoadmapMap";
import ShareButtons from "@/components/ShareButtons";
import { detailedBlocks, overviewBlocks, ROADMAP_LESSON_COUNT, ROADMAP_SERIES_COUNT } from "@/lib/roadmap";
import { absoluteUrl, SITE_URL } from "@/lib/site";

const tab = "rounded-full border px-4 py-1.5 text-[0.88rem] transition-colors hover:no-underline";

/** Shared body of /roadmap (one box per series) and /roadmap/detailed (one box per lesson). */
export default function RoadmapPage({ detailed }: { detailed: boolean }) {
  const blocks = detailed ? detailedBlocks() : overviewBlocks();
  const path = detailed ? "/roadmap/detailed" : "/roadmap";
  const steps = overviewBlocks();
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: detailed ? "Detailed developer roadmap" : "Developer roadmap",
        url: absoluteUrl(path),
        mainEntity: {
          "@type": "ItemList",
          itemListElement: steps.flatMap((b) => (b.kind === "node" ? [b] : [])).map((b, i) => ({ "@type": "ListItem", position: i + 1, name: b.title, url: absoluteUrl("/roadmap") })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Roadmap", item: absoluteUrl("/roadmap") },
          ...(detailed ? [{ "@type": "ListItem", position: 3, name: "Detailed", item: absoluteUrl(path) }] : []),
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={ld} />
      <p className="mb-2 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">Roadmap</p>
      <h1 className="mb-3 text-[2.2rem] font-bold leading-tight tracking-tight text-sky max-sm:text-[1.8rem]">
        {detailed ? "Detailed developer roadmap: every lesson in order" : "Developer roadmap: from the basics to interviews"}
      </h1>
      <ShareButtons />
      <div className="mb-4 flex flex-wrap gap-2" role="navigation" aria-label="Roadmap views">
        <Link href="/roadmap" aria-current={detailed ? undefined : "page"} className={`${tab} ${detailed ? "border-line text-ink-dim hover:border-sky hover:text-sky" : "border-sky bg-sky-soft text-sky"}`}>
          Overview
        </Link>
        <Link href="/roadmap/detailed" aria-current={detailed ? "page" : undefined} className={`${tab} ${detailed ? "border-sky bg-sky-soft text-sky" : "border-line text-ink-dim hover:border-sky hover:text-sky"}`}>
          Detailed, every lesson
        </Link>
      </div>
      <p className="text-[1.1rem] text-ink-dim">
        {detailed
          ? `Follow the line from top to bottom. Each step lists its series, and each series lists all of its lessons in order. ${ROADMAP_LESSON_COUNT} lessons are on this map, and every box opens its lesson.`
          : `Follow the line from top to bottom. Each step holds the series that belong to it. ${ROADMAP_SERIES_COUNT} series and ${ROADMAP_LESSON_COUNT} lessons are on the map, and every box opens its lessons.`}
      </p>
      <div className="mt-4">
        <RoadmapDownload blocks={blocks} siteUrl={SITE_URL} detailed={detailed} fileName={detailed ? "developer-roadmap-detailed" : "developer-roadmap"} />
      </div>
      <RoadmapMap blocks={blocks} lesson={detailed} />
      <p className="mx-auto mt-8 text-center text-[0.95rem] text-ink-dim">
        You do not have to read everything. Pick the step you are on, open a box, and go forward one lesson at a time.
      </p>
    </>
  );
}
