import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import LessonComplete from "@/components/LessonComplete";
import { guidesForPath } from "@/lib/guides";
import { relatedLessons, relatedSeries, topicsForPath } from "@/lib/registry";
import { lessonJsonLd, pageDates } from "@/lib/seo";
import { LESSONS, lessonHref, SERIES, type Lesson } from "@/lib/lessons";

const box = "block rounded-xl border border-line px-5 py-4";
const dir = "font-mono text-[0.75rem] uppercase tracking-[0.1em]";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

type Props = {
  slug: string;
  /** Lessons of the series this page belongs to; defaults to the DevOps series. */
  lessons?: Lesson[];
  href?: (lesson: Lesson) => string;
  series?: { slug: string; title: string };
};

export default function LessonPager({
  slug,
  lessons = LESSONS,
  href = lessonHref,
  series = SERIES,
}: Props) {
  const i = lessons.findIndex((l) => l.slug === slug);
  const prev = i === -1 ? undefined : lessons[i - 1];
  const next = i === -1 ? undefined : lessons[i + 1];

  const current = i === -1 ? undefined : lessons[i];
  const path = current ? href(current) : undefined;
  const modified = path ? pageDates(path).modified : undefined;
  const lessonsLike = path ? relatedLessons(path) : [];
  const guides = path ? guidesForPath(path).slice(0, 3) : [];
  const seriesLike = current ? relatedSeries(series.slug) : [];
  const topics = path ? topicsForPath(path).slice(0, 5) : [];

  return (
    <>
      {/* Structured data for this lesson (TechArticle + breadcrumbs); see lib/seo.ts. */}
      {current ? <JsonLd data={lessonJsonLd(href(current))} /> : null}

      {current ? (
        <p className="mt-12 mb-0 border-t border-line pt-5 text-[0.85rem] text-ink-dim">
          Published by <Link href="/about">Jainik</Link>
          {modified ? (
            <>
              {" "}· Last updated <time dateTime={modified}>{formatDate(modified)}</time>
            </>
          ) : null}{" "}
          · <Link href="/about#how-lessons-are-made">How these lessons are made</Link>
        </p>
      ) : null}

      {topics.length ? (
        <p className="mb-0 mt-4 flex flex-wrap items-center gap-2 text-[0.85rem] text-ink-dim">
          <span className="font-mono text-[0.72rem] uppercase tracking-[0.1em]">Topics</span>
          {topics.map((t) => (
            <Link key={t.slug} href={`/topics/${t.slug}`} className="rounded-full border border-line px-3 py-0.5 text-ink-dim hover:border-sky hover:text-sky hover:no-underline">
              {t.title}
            </Link>
          ))}
        </p>
      ) : null}

      {current && path ? (
        <LessonComplete path={path} next={next?.published ? { path: href(next), title: next.title } : null} tags={topics.map((t) => t.title)} />
      ) : null}

      {current && next?.published ? (
        <Link
          href={href(next)}
          className="group mt-8 block rounded-2xl border border-sky/50 bg-sky-soft px-6 py-5 text-ink transition hover:-translate-y-0.5 hover:border-sky hover:no-underline"
        >
          <span className="flex items-center justify-between gap-3 font-mono text-[0.75rem] uppercase tracking-[0.1em] text-sky">
            <span>Up next · Lesson {next.number} of {lessons.filter((l) => l.published).length}</span>
            {next.readTime ? <span className="text-ink-dim">{next.readTime} read</span> : null}
          </span>
          <span className="mt-2 block text-[1.25rem] font-bold leading-snug text-ink">{next.title}</span>
          {next.summary ? <span className="mt-1 block text-[0.95rem] text-ink-dim">{next.summary}</span> : null}
          <span className="mt-3 inline-flex items-center gap-1 text-[0.9rem] font-semibold text-sky transition-transform group-hover:translate-x-1">
            Continue reading →
          </span>
        </Link>
      ) : current && i !== -1 && !next ? (
        <div className="mt-8 rounded-2xl border border-sky/50 bg-sky-soft px-6 py-5">
          <p className="m-0 font-mono text-[0.75rem] uppercase tracking-[0.1em] text-sky">You finished {series.title}</p>
          <p className="mb-3 mt-2 text-[1.1rem] font-semibold text-ink">
            {seriesLike.length ? "Good work. Here is a natural next series." : "Good work. Pick your next step."}
          </p>
          <div className="flex flex-wrap gap-2">
            {seriesLike.slice(0, 2).map((s) => (
              <Link key={s.slug} href={`/${s.slug}`} className="rounded-full bg-sky px-4 py-2 text-[0.88rem] font-semibold on-sky hover:no-underline">
                {s.title} →
              </Link>
            ))}
            <Link href="/roadmap" className="rounded-full border border-line px-4 py-2 text-[0.88rem] font-semibold text-ink hover:border-sky hover:text-sky hover:no-underline">
              Open the roadmap
            </Link>
          </div>
        </div>
      ) : null}

      {lessonsLike.length || seriesLike.length || guides.length ? (
        <section aria-labelledby="keep-learning" className="mt-8 rounded-xl border border-line bg-bg-elev/40 px-5 py-4">
          <h2 id="keep-learning" className="mt-0 mb-3 text-[1.1rem] font-semibold text-ink">
            Keep learning
          </h2>
          {lessonsLike.length ? (
            <>
              <p className="m-0 mb-1 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-ink-dim">Related lessons</p>
              <ul className="m-0 mb-3 list-none space-y-1 p-0 text-[0.92rem]">
                {lessonsLike.map((l) => (
                  <li key={l.path}>
                    <Link href={l.path}>{l.title}</Link> <span className="text-ink-dim">· {l.seriesShort}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {guides.length ? (
            <>
              <p className="m-0 mb-1 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-ink-dim">Part of the study guide</p>
              <ul className="m-0 mb-3 list-none space-y-1 p-0 text-[0.92rem]">
                {guides.map((g) => (
                  <li key={g.slug}>
                    <Link href={`/guides/${g.slug}`}>{g.title}</Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {seriesLike.length ? (
            <>
              <p className="m-0 mb-1 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-ink-dim">Related series</p>
              <ul className="m-0 list-none space-y-1 p-0 text-[0.92rem]">
                {seriesLike.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/${s.slug}`}>{s.title}</Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      ) : null}
      <nav className="mt-14 grid grid-cols-1 gap-4 border-t border-line pt-8 sm:grid-cols-2" aria-label="Lesson navigation">
      {prev ? (
        <Link href={href(prev)} className={`${box} text-ink hover:border-sky hover:bg-sky-soft hover:no-underline`}>
          <div className={`${dir} text-sky`}>← Previous</div>
          <div className="font-semibold">Lesson {prev.number}: {prev.title}</div>
        </Link>
      ) : (
        <Link href={`/${series.slug}`} className={`${box} text-ink hover:border-sky hover:bg-sky-soft hover:no-underline`}>
          <div className={`${dir} text-sky`}>← Series index</div>
          <div className="font-semibold">{series.title}</div>
        </Link>
      )}

      {next?.published ? (
        <Link href={`/${series.slug}`} className={`${box} text-right text-ink hover:border-sky hover:bg-sky-soft hover:no-underline sm:text-right`}>
          <div className={`${dir} text-sky`}>Series index →</div>
          <div className="font-semibold">{series.title}</div>
        </Link>
      ) : next ? (
        <div className={`${box} text-ink-dim sm:text-right`}>
          <div className={`${dir} text-ink-dim`}>Next · coming soon</div>
          <div className="font-semibold">Lesson {next.number}: {next.title}</div>
        </div>
      ) : null}
    </nav>
    </>
  );
}
