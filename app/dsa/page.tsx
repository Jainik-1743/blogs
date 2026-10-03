import type { Metadata } from "next";
import Link from "next/link";
import DsaToc from "@/components/dsa/DsaToc";
import { DSA_GLOSSARY } from "@/lib/dsa-glossary";
import { DSA_LESSONS, DSA_PARTS, DSA_SERIES } from "@/lib/dsa";

export const metadata: Metadata = {
  title: DSA_SERIES.title,
  description: DSA_SERIES.tagline,
};

/** The resources the syllabus was checked against. [name, link, what it is best for] */
const SOURCES: [string, string, string][] = [
  ["coding-interview-university (362k ★)", "https://github.com/jwasham/coding-interview-university", "A complete computer-science study plan; good for seeing the whole field."],
  ["javascript-algorithms (197k ★)", "https://github.com/trekhleb/javascript-algorithms", "Every standard data structure and algorithm written in JavaScript, with explanations."],
  ["Tech Interview Handbook (143k ★)", "https://www.techinterviewhandbook.org/algorithms/study-cheatsheet/", "Per-topic cheat sheets: techniques, edge cases and the essential questions. Also home of the Grind 75 list."],
  ["labuladong's algorithm notes (136k ★)", "https://github.com/labuladong/fucking-algorithm", "Reusable templates for problem families such as sliding window and binary search."],
  ["Hello Algo (130k ★)", "https://www.hello-algo.com/en/", "A free, animated book for beginners; excellent pictures of every data structure."],
  ["NeetCode roadmap", "https://neetcode.io/roadmap", "A pattern-by-pattern problem list (NeetCode 150) with a video solution for each problem."],
  ["Striver's A2Z DSA sheet", "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/", "A long, step-by-step problem sheet that starts from the absolute basics."],
  ["LeetCode", "https://leetcode.com/problemset/", "Where you practise. Every lesson links the matching LeetCode problems."],
  ["VisuAlgo", "https://visualgo.net/en", "Interactive animations of sorting, trees, graphs and more."],
];

/** The series "cover": title page, the parts at a glance, then the full table of contents. */
export default function DsaIndexPage() {
  const published = DSA_LESSONS.filter((l) => l.published).length;

  return (
    <>
      <section className="mb-8 border-b border-line pb-8 pt-6">
        <p className="mb-2 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">A blog series</p>
        <h1 className="mb-3 text-[2.9rem] font-bold leading-[1.1] tracking-tight text-sky max-sm:text-[2rem]">
          {DSA_SERIES.title}
        </h1>
        <p className="max-w-[60ch] text-[1.15rem] text-ink-dim">{DSA_SERIES.tagline}</p>
        <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[0.82rem] text-ink-dim">
          <div>
            <dt className="inline text-sky">Started&nbsp;</dt>
            <dd className="inline">{DSA_SERIES.started}</dd>
          </div>
          <div>
            <dt className="inline text-sky">Progress&nbsp;</dt>
            <dd className="inline">
              {published} / {DSA_LESSONS.length} lessons
            </dd>
          </div>
          <div>
            <dt className="inline text-sky">Parts&nbsp;</dt>
            <dd className="inline">{DSA_PARTS.length}</dd>
          </div>
          <div>
            <dt className="inline text-sky">Language&nbsp;</dt>
            <dd className="inline">JavaScript</dd>
          </div>
        </dl>
      </section>

      <section className="mb-12">
        <h2 className="mb-2 text-[1.6rem] font-semibold text-sky">How the series is organised</h2>
        <p className="mb-4 text-ink-dim">
          Fifteen parts, each building on the one before. Never written a loop? Start at Lesson 01 — it
          assumes nothing. Already comfortable with loops and arrays? Jump to Part 2.
        </p>
        <ol className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
          {DSA_PARTS.map((p) => (
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

      <section className="mb-12 rounded-xl border border-line bg-bg-elev px-6 py-5">
        <h2 className="mb-2 text-[1.3rem] font-semibold text-sky">How every lesson works</h2>
        <ol className="m-0 list-decimal pl-5 marker:text-sky">
          <li className="my-1"><strong className="text-ink">The idea in plain words</strong> — a real-life picture before any code.</li>
          <li className="my-1"><strong className="text-ink">A dry run</strong> — every variable written down at every step, plus an interactive tracer you can step through.</li>
          <li className="my-1"><strong className="text-ink">Interview-style questions</strong> — each with examples, a hint, and a full answer with the reasoning. Try first, then open the answer.</li>
          <li className="my-1"><strong className="text-ink">Make it stick</strong> — a short recall exercise and a revisit schedule (tomorrow, 3 days, a week), because recalling beats re-reading.</li>
        </ol>
      </section>

      <section>
        <h2 className="mb-2 text-[1.6rem] font-semibold text-sky">Contents</h2>
        {DSA_PARTS.map((p) => (
          <div key={p.number} className="mb-8">
            <h3
              id={`part-${p.number}`}
              className="mb-1 scroll-mt-20 font-mono text-[0.8rem] uppercase tracking-[0.12em] text-sky"
            >
              Part {p.number} · {p.title}
            </h3>
            <p className="mb-2 text-[0.92rem] text-ink-dim">{p.blurb}</p>
            <DsaToc lessons={DSA_LESSONS.filter((l) => l.part === p.number)} />
          </div>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="mb-2 text-[1.6rem] font-semibold text-sky">Glossary</h2>
        <p className="mb-4 text-ink-dim">
          {DSA_GLOSSARY.entries.length} terms — dry run, accumulator, off-by-one, frequency map and the rest. Inside
          any lesson, hover or tap a dotted term to see its meaning without leaving the page.{" "}
          <Link href={`/${DSA_SERIES.slug}/glossary`}>Browse all terms →</Link>
        </p>
      </section>

      <section className="mt-12">
        <h2 className="mb-2 text-[1.6rem] font-semibold text-sky">How this syllabus was built</h2>
        <p className="mb-4 text-ink-dim">
          The order of topics and the subtopics in every lesson were checked against the most widely used
          free resources for learning DSA and preparing for interviews. They are all worth bookmarking.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Resource</th>
                <th>What it is best for</th>
              </tr>
            </thead>
            <tbody>
              {SOURCES.map(([name, href, what]) => (
                <tr key={name}>
                  <td className="whitespace-nowrap">
                    <a href={href} target="_blank" rel="noopener noreferrer">{name}</a>
                  </td>
                  <td>{what}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[0.85rem] text-ink-dim">GitHub star counts as of October 2026.</p>
      </section>
    </>
  );
}
