import Link from "next/link";
import LessonToc from "@/components/LessonToc";
import { ivLessonHref, type IvSeries } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

/** The series "cover": title page, then the full table of contents. */
export default function IvSeriesIndex({ series }: { series: IvSeries }) {
  const minutes = series.lessons.reduce((sum, l) => sum + (parseInt(l.readTime ?? "0", 10) || 0), 0);
  const glossary = ivGlossaryFor(series.slug);
  return (
    <>
      <section className="mb-8 border-b border-line pb-8 pt-6">
        <p className="mb-2 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">A blog series</p>
        <h1 className="mb-3 text-[2.9rem] font-bold leading-[1.1] tracking-tight text-sky max-sm:text-[2rem]">{series.title}</h1>
        <p className="max-w-[60ch] text-[1.15rem] text-ink-dim">{series.tagline}</p>
        <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[0.82rem] text-ink-dim">
          <div><dt className="inline text-sky">Started&nbsp;</dt><dd className="inline">{series.started}</dd></div>
          <div><dt className="inline text-sky">Lessons&nbsp;</dt><dd className="inline">{series.lessons.length}</dd></div>
          <div><dt className="inline text-sky">Reading&nbsp;</dt><dd className="inline">~{Math.round(minutes / 60)} h</dd></div>
        </dl>
      </section>

      <section>
        <h2 className="mb-2 text-[1.6rem] font-semibold text-sky">Contents</h2>
        <p className="mb-3 text-[0.95rem] text-ink-dim">
          Every lesson has the same steps: what it is, how it works, a real example, common mistakes, then interview questions with answers you can say out loud.
        </p>
        <LessonToc lessons={series.lessons} href={(l) => ivLessonHref(series, l)} />
      </section>

      <section className="mt-12">
        <h2 className="mb-2 text-[1.6rem] font-semibold text-sky">Glossary</h2>
        <p className="mb-4 text-ink-dim">
          {glossary.entries.length} terms used in this series. Inside any lesson, hover or tap a dotted term to see its meaning without leaving the page.{" "}
          <Link href={`/${series.slug}/glossary`}>Browse all terms →</Link>
        </p>
      </section>
    </>
  );
}
