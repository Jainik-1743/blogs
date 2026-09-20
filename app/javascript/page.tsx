import type { Metadata } from "next";
import LessonToc from "@/components/LessonToc";
import { JS_LESSONS, JS_SERIES, jsLessonHref } from "@/lib/javascript";

export const metadata: Metadata = {
  title: JS_SERIES.title,
  description: JS_SERIES.tagline,
};

/** The series "cover" — title page + table of contents, like the first page of a book. */
export default function JavascriptIndexPage() {
  const published = JS_LESSONS.filter((l) => l.published).length;

  return (
    <>
      <section className="mb-8 border-b border-line pb-8 pt-6">
        <p className="mb-2 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">
          A blog series
        </p>
        <h1 className="mb-3 text-[2.9rem] font-bold leading-[1.1] tracking-tight text-sky max-sm:text-[2rem]">
          {JS_SERIES.title}
        </h1>
        <p className="max-w-[60ch] text-[1.15rem] text-ink-dim">{JS_SERIES.tagline}</p>
        <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[0.82rem] text-ink-dim">
          <div>
            <dt className="inline text-sky">Started&nbsp;</dt>
            <dd className="inline">{JS_SERIES.started}</dd>
          </div>
          <div>
            <dt className="inline text-sky">Progress&nbsp;</dt>
            <dd className="inline">
              {published} / {JS_LESSONS.length} lessons
            </dd>
          </div>
        </dl>
      </section>

      <section>
        <h2 className="mb-2 text-[1.6rem] font-semibold text-sky">Contents</h2>
        <p className="mb-4 text-ink-dim">
          Lessons build on each other. If you are new, start at Lesson 01.
        </p>
        <LessonToc lessons={JS_LESSONS} href={jsLessonHref} />
      </section>
    </>
  );
}
