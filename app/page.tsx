import Link from "next/link";
import { JS_LESSONS, JS_SERIES } from "@/lib/javascript";
import { LESSONS, SERIES } from "@/lib/lessons";
import { SD_LESSONS, SD_SERIES } from "@/lib/system-design";

const SERIES_CARDS = [
  { series: SERIES, lessons: LESSONS },
  { series: JS_SERIES, lessons: JS_LESSONS },
  { series: SD_SERIES, lessons: SD_LESSONS },
];

export default function HomePage() {
  return (
    <>
      <p className="mb-2 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">Blogs</p>
      <h1 className="mb-2 text-[2.4rem] font-bold leading-tight tracking-tight text-sky">
        Notes from building and running software.
      </h1>
      <p className="max-w-[60ch] text-[1.15rem] text-ink-dim">
        Long-form, lesson-style series on DevOps, JavaScript and system design. Each one reads
        like a small book: start at the first lesson and work forward.
      </p>

      <div className="mt-8 grid gap-4">
        {SERIES_CARDS.map(({ series, lessons }) => {
          const published = lessons.filter((l) => l.published).length;
          return (
            <Link
              key={series.slug}
              href={`/${series.slug}`}
              data-accent={series.accent}
              className="block rounded-xl border border-line bg-bg-elev px-6 py-6 text-ink transition hover:-translate-y-0.5 hover:border-sky hover:no-underline"
            >
              <div className="font-mono text-[0.8rem] text-sky">
                Series · {published} of {lessons.length} lessons published
              </div>
              <h3 className="my-1 text-[1.3rem] font-semibold text-sky-strong">{series.title}</h3>
              <p className="m-0 text-ink-dim">{series.tagline}</p>
            </Link>
          );
        })}
      </div>
    </>
  );
}
