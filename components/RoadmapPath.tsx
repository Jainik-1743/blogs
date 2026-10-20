import Link from "next/link";
import type { PathStage } from "@/lib/roadmap";

/** Step-by-step learning path: one numbered step per stage, with its series listed underneath. */
export default function RoadmapPath({ stages, detailed }: { stages: PathStage[]; detailed: boolean }) {
  return (
    <ol className="m-0 list-none p-0" aria-label="Learning path">
      {stages.map((st, i) => (
        <li key={st.step} id={`step-${st.step}`} className="relative m-0 grid scroll-mt-24 grid-cols-[2.5rem_1fr] gap-x-4 sm:grid-cols-[3rem_1fr] sm:gap-x-6">
          <div className="flex flex-col items-center">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-sky bg-sky-soft font-bold text-sky-strong sm:h-12 sm:w-12">{st.step}</span>
            {i < stages.length - 1 && <span aria-hidden="true" className="mt-2 w-px flex-1 bg-line" />}
          </div>
          <div className={i < stages.length - 1 ? "pb-12" : "pb-2"}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2 className="m-0 text-[1.5rem] font-bold leading-tight tracking-tight text-ink max-sm:text-[1.25rem]">{st.title}</h2>
              <span className="rounded-md border border-line px-2 py-0.5 text-[0.75rem] font-medium text-ink-dim">{st.level}</span>
            </div>
            <p className="mt-2 mb-1 max-w-[62ch] text-ink-dim">{st.blurb}</p>
            <p className="m-0 text-[0.82rem] text-ink-dim">{st.series.length} {st.series.length === 1 ? "series" : "series"} · {st.lessonCount} lessons</p>

            <ul className="m-0 mt-5 list-none overflow-hidden rounded-xl border border-line bg-bg-elev p-0">
              {st.series.map((s, si) => (
                <li key={s.slug} data-accent={s.accent} className={`m-0 ${si > 0 ? "border-t border-line" : ""}`}>
                  {detailed ? (
                    <details className="group">
                      <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 marker:hidden [&::-webkit-details-marker]:hidden">
                        <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-sky" />
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-ink">{s.label}</span>
                          <span className="line-clamp-2 block text-[0.88rem] text-ink-dim">{s.tagline}</span>
                        </span>
                        <span className="shrink-0 text-[0.8rem] text-ink-dim">{s.lessons.length} lessons</span>
                        <span aria-hidden="true" className="text-ink-dim transition group-open:rotate-90">›</span>
                      </summary>
                      <ol className="m-0 grid list-none gap-x-8 border-t border-line px-5 py-3 sm:grid-cols-2">
                        {s.lessons.map((l) => (
                          <li key={l.href} className="m-0">
                            <Link href={l.href} className="flex gap-3 py-1.5 text-[0.92rem] text-ink hover:text-sky hover:no-underline">
                              <span className="w-6 shrink-0 text-right font-mono text-[0.8rem] text-sky">{l.number}</span>
                              <span>{l.title}</span>
                            </Link>
                          </li>
                        ))}
                      </ol>
                      <p className="m-0 border-t border-line px-5 py-3 text-[0.85rem]"><Link href={s.href} className="font-semibold">Open the {s.label} series →</Link></p>
                    </details>
                  ) : (
                    <Link href={s.href} className="group flex items-center gap-3 px-5 py-4 text-ink transition hover:bg-bg hover:no-underline">
                      <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-sky" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold transition group-hover:text-sky">{s.label}</span>
                        <span className="line-clamp-2 block text-[0.88rem] text-ink-dim">{s.tagline}</span>
                      </span>
                      <span className="shrink-0 text-[0.8rem] text-ink-dim">{s.lessons.length} lessons</span>
                      <span aria-hidden="true" className="text-ink-dim transition group-hover:translate-x-1 group-hover:text-sky">→</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ol>
  );
}
