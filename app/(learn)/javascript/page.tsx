import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { pageMetadata, seriesJsonLd } from "@/lib/seo";
import Link from "next/link";
import PageHeader from "@/components/page/PageHeader";
import LessonToc from "@/components/LessonToc";
import { JS_LESSONS, JS_READINGS, jsReadingHref, JS_SERIES, jsLessonHref } from "@/lib/javascript";

export const metadata: Metadata = pageMetadata("/javascript");

/** The series "cover" — title page + table of contents, like the first page of a book. */
export default function JavascriptIndexPage() {
  const published = JS_LESSONS.filter((l) => l.published).length;

  return (
    <>
      <JsonLd data={seriesJsonLd("javascript")} />
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: JS_SERIES.title }]}
        eyebrow="Lesson series"
        title={JS_SERIES.title}
        summary={JS_SERIES.tagline}
        meta={[
          { label: "Lessons", value: `${published} of ${JS_LESSONS.length}` },
          { label: "Started", value: JS_SERIES.started },
        ]}
      />

      <section>
        <h2 className="mb-2 text-[1.6rem] font-bold tracking-tight text-ink">Contents</h2>
        <p className="mb-4 text-ink-dim">
          Lessons build on each other. If you are new, start at Lesson 01.
        </p>
        <LessonToc lessons={JS_LESSONS} href={jsLessonHref} />
      </section>

      <section className="mt-12">
        <h2 className="mb-2 text-[1.6rem] font-bold tracking-tight text-ink">Glossary</h2>
        <p className="mb-4 text-ink-dim">
          Every short form used in the series — GEC, TDZ, V8 and the rest. Inside any lesson, hover
          or tap a dotted term to see its meaning without leaving the page.{" "}
          <Link href={`/${JS_SERIES.slug}/glossary`}>Browse all terms →</Link>
        </p>
      </section>

      <section className="mt-12">
        <h2 className="mb-2 text-[1.6rem] font-bold tracking-tight text-ink">Background reading</h2>
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
