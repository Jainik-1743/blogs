import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import PageHeader from "@/components/page/PageHeader";
import RoadmapDownload from "@/components/RoadmapDownload";
import RoadmapProgress from "@/components/RoadmapProgress";
import RoadmapLessonTree from "@/components/RoadmapLessonTree";
import RoadmapTree from "@/components/RoadmapTree";
import { detailedBlocks, overviewBlocks, pathStages, ROADMAP_LESSON_COUNT, ROADMAP_SERIES_COUNT } from "@/lib/roadmap";
import { absoluteUrl, SITE_URL } from "@/lib/site";

type View = "overview" | "all" | "category";

const tab = "rounded-md border px-4 py-2 text-[0.9rem] font-medium transition-colors hover:no-underline";
const on = "border-sky bg-sky-soft text-sky";
const off = "border-line text-ink-dim hover:border-sky hover:text-sky";

/** Body of every roadmap page: the overview tree, the every-lesson tree, and one tree per category. */
export default function RoadmapPage({ view, category }: { view: View; category?: string }) {
  const all = pathStages();
  const stage = view === "category" ? all.find((s) => s.slug === category) : undefined;
  const stages = stage ? [stage] : all;
  const path = view === "overview" ? "/roadmap" : view === "all" ? "/roadmap/detailed" : `/roadmap/${category}`;
  const blocks = view === "overview" ? overviewBlocks() : detailedBlocks(category);
  const name = stage ? `${stage.title} roadmap` : view === "all" ? "Every lesson, in order" : "A clear path from the basics to interviews";

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name,
        url: absoluteUrl(path),
        mainEntity: {
          "@type": "ItemList",
          itemListElement: stages.map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.title, url: absoluteUrl(`/roadmap/${s.slug}`) })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Roadmap", item: absoluteUrl("/roadmap") },
          ...(view !== "overview" ? [{ "@type": "ListItem", position: 3, name: stage ? stage.title : "Every lesson", item: absoluteUrl(path) }] : []),
        ],
      },
    ],
  };

  const prev = stage ? all[stage.step - 2] : undefined;
  const next = stage ? all[stage.step] : undefined;

  return (
    <>
      <JsonLd data={ld} />
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, ...(view === "overview" ? [{ label: "Roadmap" }] : [{ label: "Roadmap", href: "/roadmap" }, { label: stage ? stage.title : "Every lesson" }])]}
        eyebrow={stage ? `Roadmap · Step ${stage.step} of ${all.length}` : "Developer roadmap"}
        title={name}
        summary={
          stage
            ? `${stage.blurb} Read the series from top to bottom, and each series from its first lesson to its last.`
            : view === "all"
              ? "All eight steps with every series and every lesson, in reading order. Each box opens its lesson."
              : "Not sure what to learn next? Follow the steps from top to bottom. Each step has a level, a short goal and the series that belong to it."
        }
        meta={
          stage
            ? [
                { label: "Level", value: stage.level },
                { label: "Series", value: String(stage.series.length) },
                { label: "Lessons", value: String(stage.lessonCount) },
                { label: "Cost", value: "Free" },
              ]
            : [
                { label: "Steps", value: String(all.length) },
                { label: "Series", value: String(ROADMAP_SERIES_COUNT) },
                { label: "Lessons", value: String(ROADMAP_LESSON_COUNT) },
                { label: "Cost", value: "Free" },
              ]
        }
      />

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="navigation" aria-label="Roadmap views">
          <Link href="/roadmap" aria-current={view === "overview" ? "page" : undefined} className={`${tab} ${view === "overview" ? on : off}`}>Overview</Link>
          <Link href="/roadmap/detailed" aria-current={view === "all" ? "page" : undefined} className={`${tab} ${view === "all" ? on : off}`}>Every lesson</Link>
        </div>
        <RoadmapDownload blocks={blocks} siteUrl={SITE_URL} detailed={view !== "overview"} fileName={view === "overview" ? "developer-roadmap" : stage ? `roadmap-${stage.slug}` : "developer-roadmap-detailed"} />
      </div>

      <nav aria-label="Roadmap by category" className="mb-10">
        <p className="mb-2 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-ink-dim">Roadmap by category</p>
        <div className="flex flex-wrap gap-2">
          {all.map((s) => (
            <Link key={s.slug} href={`/roadmap/${s.slug}`} aria-current={stage?.slug === s.slug ? "page" : undefined} className={`${tab} !py-1.5 !text-[0.85rem] ${stage?.slug === s.slug ? on : off}`}>
              {s.title}
            </Link>
          ))}
        </div>
      </nav>

      {view === "overview" && (
        <p className="mb-10 rounded-xl border border-line bg-bg-elev px-5 py-4 text-ink-dim">
          <strong className="text-ink">New to programming?</strong> Begin at step 1 and move down one step at a time. You can skip any step you already know, and you do not need to finish a step before starting the next one.
        </p>
      )}

      {view !== "overview" && (
        <RoadmapProgress total={stages.reduce((n, s) => n + s.lessonCount, 0)} paths={stages.flatMap((s) => s.series.flatMap((x) => x.lessons.map((l) => l.href)))} />
      )}

      {view === "overview" ? <RoadmapTree stages={stages} /> : <RoadmapLessonTree stages={stages} showEnd={view === "all"} />}

      {stage && (
        <nav aria-label="Neighbouring steps" className="mt-12 grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
          {prev ? (
            <Link href={`/roadmap/${prev.slug}`} className="rounded-xl border border-line bg-bg-elev p-5 text-ink hover:border-sky hover:no-underline">
              <span className="text-[0.75rem] uppercase tracking-[0.12em] text-ink-dim">← Previous step</span>
              <span className="mt-1 block font-semibold">{prev.title}</span>
            </Link>
          ) : <span />}
          {next && (
            <Link href={`/roadmap/${next.slug}`} className="rounded-xl border border-line bg-bg-elev p-5 text-right text-ink hover:border-sky hover:no-underline">
              <span className="text-[0.75rem] uppercase tracking-[0.12em] text-ink-dim">Next step →</span>
              <span className="mt-1 block font-semibold">{next.title}</span>
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
