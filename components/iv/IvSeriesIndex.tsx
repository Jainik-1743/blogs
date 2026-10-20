import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import PageHeader from "@/components/page/PageHeader";
import SectionTitle from "@/components/page/SectionTitle";
import { seriesJsonLd } from "@/lib/seo";
import LessonToc from "@/components/LessonToc";
import { ivLessonHref, type IvSeries } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

/** The series "cover": header with the key facts, then the full table of contents. */
export default function IvSeriesIndex({ series }: { series: IvSeries }) {
  const minutes = series.lessons.reduce((sum, l) => sum + (parseInt(l.readTime ?? "0", 10) || 0), 0);
  const glossary = ivGlossaryFor(series.slug);
  return (
    <>
      <JsonLd data={seriesJsonLd(series.slug)} />
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: series.title }]}
        eyebrow="Lesson series"
        title={series.title}
        summary={series.tagline}
        meta={[
          { label: "Lessons", value: String(series.lessons.length) },
          { label: "Reading time", value: `~${Math.round(minutes / 60)} hours` },
          { label: "Glossary", value: `${glossary.entries.length} terms` },
          { label: "Started", value: series.started },
        ]}
      />

      <section aria-labelledby="contents">
        <SectionTitle
          id="contents"
          title="Contents"
          count={`${series.lessons.length} lessons`}
          note="Every lesson has the same steps: what it is, how it works, a real example, common mistakes, then interview questions with answers you can say out loud."
        />
        <LessonToc lessons={series.lessons} href={(l) => ivLessonHref(series, l)} />
      </section>

      <section aria-labelledby="glossary" className="mt-16">
        <SectionTitle
          id="glossary"
          title="Glossary"
          count={`${glossary.entries.length} terms`}
          note={
            <>
              Inside any lesson, hover or tap a dotted term to see its meaning without leaving the page.{" "}
              <Link href={`/${series.slug}/glossary`}>Browse all terms →</Link>
            </>
          }
        />
      </section>
    </>
  );
}
