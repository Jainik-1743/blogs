import type { ReactNode } from "react";
import Link from "next/link";
import LessonPager from "@/components/LessonPager";
import { DSA_LESSONS, DSA_PARTS, DSA_SERIES, dsaLessonHref, type DsaLesson } from "@/lib/dsa";

export type OutlineItem = { id: string; label: string };

/** "1. Two Sum" → https://leetcode.com/problems/two-sum/ (LeetCode's own slug rule). */
function leetcodeUrl(problem: string): string {
  const title = problem.replace(/^\d+\.\s*/, "");
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-");
  return `https://leetcode.com/problems/${slug}/`;
}

/**
 * The frame every DSA lesson shares: breadcrumb, title, summary, the "on this page" index,
 * the prose (styled by `.lesson`), and the previous/next pager.
 */
export default function DsaLessonPage({
  lesson,
  outline,
  children,
}: {
  lesson: DsaLesson;
  outline: OutlineItem[];
  children: ReactNode;
}) {
  const part = DSA_PARTS.find((p) => p.number === lesson.part)!;
  return (
    // Ligatures turn <= into ≤ and ++ into one glyph; beginners copy what they see, so show the real characters.
    <article className="[font-variant-ligatures:none]">
      <header className="mb-8 border-b border-line pb-6">
        <nav className="mb-4 font-mono text-[0.8rem] text-ink-dim" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-sky">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/${DSA_SERIES.slug}`} className="hover:text-sky">{DSA_SERIES.title}</Link>
          <span className="mx-2">/</span>
          <span>Lesson {String(lesson.number).padStart(2, "0")}</span>
        </nav>
        <p className="mb-2 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">
          Part {part.number} · Lesson {lesson.number} · {lesson.readTime} read
        </p>
        <h1 className="mb-2 text-[2.4rem] font-bold leading-tight tracking-tight text-sky max-sm:text-[2rem]">
          {lesson.title}
        </h1>
        <p className="max-w-[60ch] text-[1.15rem] text-ink-dim">{lesson.summary}</p>
      </header>

      <section className="mb-10 rounded-xl border border-line bg-bg-elev px-6 py-5" aria-labelledby="learn">
        <h2 id="learn" className="mb-2 text-[1.1rem] font-semibold text-sky">
          On this page
        </h2>
        <ol className="m-0 list-decimal pl-5 marker:text-sky">
          {outline.map((item) => (
            <li key={item.id} className="my-1">
              <a href={`#${item.id}`} className="text-ink hover:text-sky">
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </section>

      <div className="lesson">{children}</div>

      {lesson.leetcode.length > 0 ? (
        <section className="mt-10 rounded-xl border border-line bg-bg-elev px-6 py-5" aria-labelledby="leetcode">
          <h2 id="leetcode" className="mb-1 text-[1.1rem] font-semibold text-sky">
            Practise on LeetCode
          </h2>
          <p className="mb-3 text-[0.92rem] text-ink-dim">
            Real interview problems that use exactly what this lesson teaches. Solve them in JavaScript after the
            practice questions above.
          </p>
          <ul className="m-0 grid list-none gap-1.5 p-0">
            {lesson.leetcode.map((p) => (
              <li key={p}>
                <a
                  href={leetcodeUrl(p)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[0.88rem] text-sky hover:text-sky-strong"
                >
                  {p} ↗
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <LessonPager slug={lesson.slug} lessons={DSA_LESSONS} href={dsaLessonHref} series={DSA_SERIES} />
    </article>
  );
}
