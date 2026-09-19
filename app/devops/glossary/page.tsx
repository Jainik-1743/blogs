import type { Metadata } from "next";
import Link from "next/link";
import { GLOSSARY, type GlossaryEntry } from "@/lib/glossary";
import { getLesson, lessonHref, SERIES } from "@/lib/lessons";

export const metadata: Metadata = {
  title: "Glossary",
  description: "Every short form used in the DevOps series, with its full name and meaning.",
};

const GROUPS: GlossaryEntry["group"][] = ["AWS", "Networking", "Linux", "Tools", "Concepts"];

/** The full glossary on one page. The same entries power the hover tooltips inside every lesson. */
export default function GlossaryPage() {
  return (
    <article data-no-glossary>
      <header className="mb-8 border-b border-line pb-6">
        <nav className="mb-4 font-mono text-[0.8rem] text-ink-dim" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-sky">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/${SERIES.slug}`} className="hover:text-sky">{SERIES.title}</Link>
          <span className="mx-2">/</span>
          <span>Glossary</span>
        </nav>
        <p className="mb-2 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">
          Reference · {GLOSSARY.length} terms
        </p>
        <h1 className="mb-2 text-[2.4rem] font-bold leading-tight tracking-tight text-sky max-sm:text-[2rem]">
          Glossary
        </h1>
        <p className="max-w-[60ch] text-[1.15rem] text-ink-dim">
          Every short form used across the series. Inside a lesson, hover or tap any dotted term
          to see the same entry in place.
        </p>
      </header>

      <nav className="mb-8 flex flex-wrap gap-2 font-mono text-[0.78rem]" aria-label="Groups">
        {GROUPS.map((g) => (
          <a key={g} href={`#${g.toLowerCase()}`} className="rounded-full border border-line px-3 py-1 text-ink-dim hover:border-sky hover:text-sky hover:no-underline">
            {g}
          </a>
        ))}
      </nav>

      {GROUPS.map((g) => {
        const entries = GLOSSARY.filter((e) => e.group === g).sort((a, b) =>
          a.term.localeCompare(b.term, undefined, { sensitivity: "base" }),
        );
        return (
          <section key={g} className="mb-10">
            <h2 id={g.toLowerCase()} className="mb-3 scroll-mt-20 text-[1.4rem] font-semibold text-sky">
              {g}
            </h2>
            <dl className="m-0 divide-y divide-line rounded-xl border border-line">
              {entries.map((e) => {
                const lesson = e.lesson !== undefined ? getLesson(`lesson-${e.lesson}`) : undefined;
                return (
                  <div key={e.term} className="grid grid-cols-[9rem_1fr] gap-x-4 px-4 py-3 max-sm:grid-cols-1 max-sm:gap-y-1">
                    <dt>
                      <span className="font-mono font-semibold text-sky-strong">{e.term}</span>
                      <span className="block text-[0.8rem] text-ink-dim">{e.full}</span>
                    </dt>
                    <dd className="m-0 text-[0.95rem] [overflow-wrap:anywhere]">
                      {e.desc}
                      {lesson ? (
                        <Link
                          href={lessonHref(lesson)}
                          className="ml-2 whitespace-nowrap font-mono text-[0.72rem] uppercase tracking-[0.08em]"
                        >
                          Lesson {lesson.number} →
                        </Link>
                      ) : null}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>
        );
      })}
    </article>
  );
}
