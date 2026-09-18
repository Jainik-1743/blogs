import Link from "next/link";
import { LESSONS, SERIES } from "@/lib/lessons";

export default function HomePage() {
  const published = LESSONS.filter((l) => l.published).length;

  return (
    <>
      <p className="mb-2 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">Blogs</p>
      <h1 className="mb-2 text-[2.4rem] font-bold leading-tight tracking-tight text-sky">
        Notes from building and running software.
      </h1>
      <p className="max-w-[60ch] text-[1.15rem] text-ink-dim">
        Long-form, lesson-style posts. Each series reads like a small book: start at Lesson 0 and
        work forward.
      </p>

      <div className="mt-8 grid gap-4">
        <Link
          href={`/${SERIES.slug}`}
          className="block rounded-xl border border-line bg-bg-elev px-6 py-6 text-ink transition hover:-translate-y-0.5 hover:border-sky hover:no-underline"
        >
          <div className="font-mono text-[0.8rem] text-sky">
            Series · {published} of {LESSONS.length} lessons published
          </div>
          <h3 className="my-1 text-[1.3rem] font-semibold text-sky-strong">{SERIES.title}</h3>
          <p className="m-0 text-ink-dim">{SERIES.tagline}</p>
        </Link>
      </div>
    </>
  );
}
