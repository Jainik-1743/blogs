"use client";

import { useEffect, useRef } from "react";
import { heatmap, topTags } from "@/lib/overview";
import type { Progress } from "@/lib/progress";

const CELL = 14;
const GAP = 4;
const WEEKS = 52;

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-line bg-bg px-4 py-4 text-center">
      <p className="m-0 text-[1.8rem] font-bold leading-none text-ink">{value}</p>
      <p className="m-0 mt-2 text-[0.85rem] text-ink-dim">{label}</p>
    </div>
  );
}

const shade = (n: number) => (n <= 0 ? "border border-line bg-transparent" : n === 1 ? "bg-sky/30" : n === 2 ? "bg-sky/60" : "bg-sky");

/** Reading overview: streaks, total days, the topics read most, and an activity grid for the last year. */
export default function ReadingOverview({ progress }: { progress: Pick<Progress, "done" | "days" | "log"> }) {
  const totalDays = progress.days.length;
  const tags = topTags(progress.log, totalDays);
  const topicsExplored = new Set(Object.values(progress.log).flatMap((d) => d.tags)).size;
  const busiest = Math.max(0, ...Object.values(progress.log).map((d) => d.n));
  const grid = heatmap(progress.log, progress.days, WEEKS);
  const step = CELL + GAP;
  const scroller = useRef<HTMLDivElement>(null);

  // On a narrow screen the grid is wider than the card; start at the most recent weeks, on the right.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  return (
    <section aria-labelledby="overview-title" className="rounded-3xl border border-line bg-bg-elev p-5 sm:p-9">
      <h2 id="overview-title" className="m-0 text-[1.4rem] font-bold tracking-tight text-ink">Reading overview</h2>
      <p className="mt-1 mb-6 text-[0.92rem] text-ink-dim">Your reading at a glance. Your streaks are in the card above.</p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat value={String(totalDays)} label="Days you read" />
        <Stat value={String(progress.done.length)} label="Lessons finished" />
        <Stat value={String(topicsExplored)} label="Topics explored" />
        <Stat value={String(busiest)} label={busiest === 1 ? "Most in one day (lesson)" : "Most in one day (lessons)"} />
      </div>

      <h3 className="mt-8 mb-3 text-[0.95rem] font-medium text-ink-dim">Top topics by reading days</h3>
      {tags.length ? (
        <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
          {tags.map((t) => (
            <li key={t.tag} className="relative m-0 overflow-hidden rounded-lg border border-line bg-bg">
              <span aria-hidden="true" className="absolute inset-y-0 left-0 bg-sky/30" style={{ width: `${Math.max(6, t.percent)}%` }} />
              <span className="relative flex items-center justify-between gap-3 px-3.5 py-2 text-[0.92rem]">
                <span className="truncate font-medium text-ink">{t.tag}</span>
                <span className="shrink-0 text-ink-dim" title={`${t.days} reading ${t.days === 1 ? "day" : "days"}`}>{t.percent}%</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 text-[0.9rem] text-ink-dim">Topics show up here as you finish lessons.</p>
      )}

      <h3 className="mt-8 mb-3 text-[0.95rem] font-medium text-ink-dim">Your activity over the last 12 months</h3>
      <p className="mt-0 mb-2 text-[0.8rem] text-ink-dim sm:hidden">Swipe sideways to see the whole year.</p>
      <div ref={scroller} className="overflow-x-auto pb-2">
        <div className="relative inline-block min-w-max pl-9 pt-6">
          {grid.months.map((m) => (
            <span key={`${m.label}-${m.col}`} className="absolute top-0 text-[0.75rem] text-ink-dim" style={{ left: 36 + m.col * step }}>{m.label}</span>
          ))}
          {[["Mon", 0], ["Wed", 2], ["Fri", 4]].map(([label, row]) => (
            <span key={label} className="absolute left-0 text-[0.75rem] leading-none text-ink-dim" style={{ top: 24 + (row as number) * step + 2 }}>{label}</span>
          ))}
          <div role="img" aria-label={`${grid.total} lessons read in the last 12 months`} className="grid grid-flow-col" style={{ gridTemplateRows: `repeat(7, ${CELL}px)`, gridAutoColumns: `${CELL}px`, gap: GAP }}>
            {grid.columns.flatMap((col) =>
              col.map((c) =>
                c.future ? <span key={c.date} /> : <span key={c.date} title={`${c.date}: ${c.n} ${c.n === 1 ? "lesson" : "lessons"}`} className={`rounded-[3px] ${shade(c.n)}`} />,
              ),
            )}
          </div>
          <div className="mt-3 flex items-center justify-end gap-2 text-[0.78rem] text-ink-dim">
            Less
            {[0, 1, 2, 3].map((n) => <span key={n} aria-hidden="true" className={`h-3 w-3 rounded-[3px] ${shade(n)}`} />)}
            More
          </div>
        </div>
      </div>
    </section>
  );
}
