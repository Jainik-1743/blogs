import type { Metadata } from "next";
import Link from "next/link";
import LessonToc from "@/components/LessonToc";
import { SD_GLOSSARY } from "@/lib/sd-glossary";
import { SD_LESSONS, SD_PARTS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

export const metadata: Metadata = {
  title: SD_SERIES.title,
  description: SD_SERIES.tagline,
};

/** The series "cover": title page, the parts at a glance, then the full table of contents. */
export default function SystemDesignIndexPage() {
  const published = SD_LESSONS.filter((l) => l.published).length;
  const minutes = SD_LESSONS.reduce((sum, l) => sum + (parseInt(l.readTime ?? "0", 10) || 0), 0);

  return (
    <>
      <section className="mb-8 border-b border-line pb-8 pt-6">
        <p className="mb-2 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">A blog series</p>
        <h1 className="mb-3 text-[2.9rem] font-bold leading-[1.1] tracking-tight text-sky max-sm:text-[2rem]">
          {SD_SERIES.title}
        </h1>
        <p className="max-w-[60ch] text-[1.15rem] text-ink-dim">{SD_SERIES.tagline}</p>
        <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[0.82rem] text-ink-dim">
          <div>
            <dt className="inline text-sky">Started&nbsp;</dt>
            <dd className="inline">{SD_SERIES.started}</dd>
          </div>
          <div>
            <dt className="inline text-sky">Progress&nbsp;</dt>
            <dd className="inline">
              {published} / {SD_LESSONS.length} lessons
            </dd>
          </div>
          <div>
            <dt className="inline text-sky">Parts&nbsp;</dt>
            <dd className="inline">{SD_PARTS.length}</dd>
          </div>
          <div>
            <dt className="inline text-sky">Reading&nbsp;</dt>
            <dd className="inline">~{Math.round(minutes / 60)} h</dd>
          </div>
        </dl>
      </section>

      <section className="mb-12">
        <h2 className="mb-2 text-[1.6rem] font-semibold text-sky">The route</h2>
        <p className="mb-4 text-ink-dim">
          Twelve parts, each building on the one before. Jump to any part, or start at Lesson 01.
        </p>
        <ol className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
          {SD_PARTS.map((p) => (
            <li key={p.number}>
              <a
                href={`#part-${p.number}`}
                className="flex h-full gap-3 rounded-xl border border-line bg-bg-elev px-4 py-3 text-ink transition hover:-translate-y-0.5 hover:border-sky hover:no-underline"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-soft font-mono text-[0.8rem] font-bold text-sky">
                  {p.number}
                </span>
                <span>
                  <span className="block font-semibold text-sky-strong">{p.title}</span>
                  <span className="block text-[0.85rem] text-ink-dim">{p.blurb}</span>
                  <span className="mt-1 block font-mono text-[0.68rem] uppercase tracking-[0.08em] text-ink-dim">
                    Lessons {p.from}–{p.to}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="mb-2 text-[1.6rem] font-semibold text-sky">Contents</h2>
        {SD_PARTS.map((p) => (
          <div key={p.number} className="mb-8">
            <h3
              id={`part-${p.number}`}
              className="mb-1 scroll-mt-20 font-mono text-[0.8rem] uppercase tracking-[0.12em] text-sky"
            >
              Part {p.number} · {p.title}
            </h3>
            <p className="mb-2 text-[0.92rem] text-ink-dim">{p.blurb}</p>
            <LessonToc lessons={SD_LESSONS.filter((l) => l.part === p.number)} href={sdLessonHref} />
          </div>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="mb-2 text-[1.6rem] font-semibold text-sky">Glossary</h2>
        <p className="mb-4 text-ink-dim">
          {SD_GLOSSARY.entries.length} short forms and terms — TLS, CDN, ACID, CAP, SLO, JWT, K8s and the rest. Inside
          any lesson, hover or tap a dotted term to see its meaning without leaving the page.{" "}
          <Link href={`/${SD_SERIES.slug}/glossary`}>Browse all terms →</Link>
        </p>
      </section>
    </>
  );
}
