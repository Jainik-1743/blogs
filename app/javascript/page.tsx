import type { Metadata } from "next";
import Link from "next/link";
import LessonToc from "@/components/LessonToc";
import { JS_LESSONS, JS_READINGS, jsReadingHref, JS_SERIES, jsLessonHref } from "@/lib/javascript";

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

      <section className="mt-12">
        <h2 className="mb-2 text-[1.6rem] font-semibold text-sky">Glossary</h2>
        <p className="mb-4 text-ink-dim">
          Every short form used in the series — GEC, TDZ, V8 and the rest. Inside any lesson, hover
          or tap a dotted term to see its meaning without leaving the page.{" "}
          <Link href={`/${JS_SERIES.slug}/glossary`}>Browse all terms →</Link>
        </p>
      </section>

      <section className="mt-12">
        <h2 className="mb-2 text-[1.6rem] font-semibold text-sky">Background reading</h2>
        <p className="mb-4 text-ink-dim">
          Standalone pieces that sit beside the lessons. Read them whenever they come up.
        </p>
        <ul className="m-0 list-none p-0">
          {JS_READINGS.map((r) => (
            <li key={r.slug}>
              <Link
                href={jsReadingHref(r)}
                className="grid grid-cols-[1fr] items-baseline gap-x-4 gap-y-1 rounded-lg border-b border-line px-4 py-4 text-ink hover:bg-sky-soft hover:no-underline sm:grid-cols-[1fr_auto]"
              >
                <span className="font-semibold">
                  {r.title}
                  <small className="mt-0.5 block text-[0.9rem] font-normal text-ink-dim">{r.summary}</small>
                </span>
                <span className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-ink-dim">
                  {r.readTime ?? "read"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
