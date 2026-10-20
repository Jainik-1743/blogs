import Link from "next/link";
import { pathStages } from "@/lib/roadmap";
import { RESOLVED_GUIDES } from "@/lib/guides";
import { dailyPicks } from "@/lib/daily";
import HeroProgress from "./HeroProgress";

/** Quick starting points: [label, path]. Each one is a real series. */
const QUICK: [string, string][] = [
  ["DSA", "/dsa"],
  ["System Design", "/system-design"],
  ["JavaScript", "/javascript"],
  ["React", "/react"],
  ["SQL", "/sql-postgres"],
  ["DevOps", "/devops"],
];

/** Top of the home page: the promise, two actions, quick links, and the learning path as a small tree. */
export default function Hero() {
  const steps = pathStages().slice(0, 6);
  return (
    <section aria-labelledby="home-title" className="grid items-center gap-12 border-b border-line pb-16 pt-4 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
      <div>
        <p className="mb-5 inline-flex items-center gap-2 text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-sky">
          <span aria-hidden="true" className="h-px w-8 bg-sky" />
          Free lessons for software engineers
        </p>
        <h1 id="home-title" className="m-0 text-[3.5rem] font-bold leading-[1.05] tracking-tight text-ink max-sm:text-[2.3rem] lg:text-[4rem]">
          From your first line of code to your next job.
        </h1>
        <p className="mt-6 mb-0 max-w-[34rem] text-[1.15rem] leading-relaxed text-ink-dim">
          A clear path through data structures, system design, DevOps, JavaScript and more. Every idea is explained in plain
          English, traced step by step and checked with interview questions.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href="/roadmap" className="rounded-lg bg-sky px-6 py-3 font-semibold text-bg transition hover:no-underline hover:brightness-110">
            Follow the roadmap
          </Link>
          <Link href="/guides" className="font-semibold text-ink underline decoration-line decoration-2 underline-offset-[6px] transition hover:text-sky hover:decoration-sky">
            Browse {RESOLVED_GUIDES.length} study guides
          </Link>
        </div>
        <div className="mt-10">
          <p className="mb-3 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-ink-dim">Or jump straight in</p>
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {QUICK.map(([label, href]) => (
              <li key={href} className="m-0">
                <Link href={href} className="inline-block rounded-md border border-line px-3.5 py-1.5 text-[0.88rem] text-ink transition hover:border-sky hover:text-sky hover:no-underline">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <HeroProgress picks={dailyPicks()} />
      </div>

      <aside aria-labelledby="path-title" className="rounded-2xl border border-line bg-bg-elev p-6 sm:p-7">
        <div className="mb-5 flex items-baseline justify-between gap-3">
          <h2 id="path-title" className="m-0 text-[1.05rem] font-bold text-ink">Your learning path</h2>
          <span className="text-[0.78rem] text-ink-dim">Go at your own pace</span>
        </div>
        <ol className="m-0 list-none p-0">
          {steps.map((st, i) => (
            <li key={st.slug} className="relative m-0 flex gap-4 pb-1">
              {i < steps.length - 1 && <span aria-hidden="true" className="absolute top-9 bottom-0 left-[1.05rem] w-px bg-line" />}
              <span className="relative z-10 grid h-[2.1rem] w-[2.1rem] shrink-0 place-items-center rounded-full border border-sky bg-bg-elev text-[0.85rem] font-bold text-sky-strong">{st.step}</span>
              <Link href={`/roadmap/${st.slug}`} className="group mb-3 flex min-w-0 flex-1 items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-1.5 text-ink transition hover:border-line hover:bg-bg hover:no-underline">
                <span className="min-w-0">
                  <span className="block font-semibold leading-snug transition group-hover:text-sky">{st.title}</span>
                  <span className="block text-[0.78rem] text-ink-dim">{st.level} · {st.series.slice(0, 3).map((x) => x.label).join(", ")}</span>
                </span>
                <span aria-hidden="true" className="shrink-0 text-ink-dim transition group-hover:translate-x-1 group-hover:text-sky">→</span>
              </Link>
            </li>
          ))}
        </ol>
        <Link href="/roadmap" className="mt-2 inline-block text-[0.9rem] font-semibold">See the full roadmap →</Link>
      </aside>
    </section>
  );
}
