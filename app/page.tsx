import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import GuideCards from "@/components/GuideCards";
import Hero from "@/components/home/Hero";
import SmallSteps from "@/components/home/SmallSteps";
import RoadmapBanner from "@/components/home/RoadmapBanner";
import GoalCards from "@/components/home/GoalCards";
import SectionHead from "@/components/home/SectionHead";
import SeriesCard from "@/components/home/SeriesCard";
import { TOPIC_PAGES, groupedSeries } from "@/lib/registry";
import { RESOLVED_GUIDES } from "@/lib/guides";
import { homeJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("/");

export default function HomePage() {
  const groups = groupedSeries();
  return (
    <div className="flex flex-col gap-20">
      <JsonLd data={homeJsonLd()} />
      <Hero />
      <SmallSteps />

      <section aria-labelledby="goals">
        <SectionHead id="goals" title="What do you want to do?" blurb="Pick the goal that fits you. Each card opens a ready-made reading order." />
        <GoalCards />
      </section>

      <RoadmapBanner />

      <section aria-labelledby="start-guides">
        <SectionHead id="start-guides" title="Start with a guide" blurb="Pick your goal and follow a ready-made reading order, so you never wonder what to read next." href="/guides" linkLabel={`All ${RESOLVED_GUIDES.length} guides`} />
        <GuideCards limit={6} />
      </section>

      <section aria-labelledby="by-topic">
        <SectionHead id="by-topic" title="Explore by topic" href="/topics" linkLabel="All topics" />
        <div className="flex flex-wrap gap-2">
          {TOPIC_PAGES.map((t) => (
            <Link key={t.def.slug} href={`/topics/${t.def.slug}`} className="rounded-md border border-line px-3.5 py-1.5 text-[0.88rem] text-ink-dim transition hover:border-sky hover:text-sky hover:no-underline">
              {t.def.title}
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="library">
        <SectionHead id="library" title="All lesson series" blurb="Each series reads like a small book: start at the first lesson and go forward." />
        <nav aria-label="Jump to a group" className="mb-8 flex flex-wrap gap-2">
          {groups.map((g) => (
            <a key={g.id} href={`#group-${g.id}`} className="rounded-md border border-line px-3.5 py-1.5 text-[0.85rem] text-ink-dim transition hover:border-sky hover:text-sky hover:no-underline">
              {g.title} <span className="font-mono text-[0.75rem] opacity-70">{g.series.length}</span>
            </a>
          ))}
        </nav>
        <div className="flex flex-col gap-12">
          {groups.map((g) => (
            <div key={g.id} id={`group-${g.id}`} aria-labelledby={`group-${g.id}-title`} className="scroll-mt-24">
              <h3 id={`group-${g.id}-title`} className="m-0 text-[1.3rem] font-semibold text-ink">{g.title}</h3>
              <p className="mt-1 mb-4 text-ink-dim">{g.blurb}</p>
              <div className="grid gap-x-12 border-t border-line sm:grid-cols-2">
                {g.series.map((s) => <SeriesCard key={s.slug} s={s} />)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="m-0 border-t border-line pt-8 text-ink-dim">
        Looking for a definition? Every series has a glossary, and they are all listed on the{" "}
        <Link href="/glossaries">glossaries page</Link>.
      </p>
    </div>
  );
}
