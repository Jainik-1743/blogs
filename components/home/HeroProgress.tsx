"use client";

import Link from "next/link";
import { streakOf, useProgress } from "@/lib/progress";
import type { DailyPick } from "@/lib/daily";
import { HeroCardSkeleton } from "@/components/Skeleton";

/** Whole days since 1970 in the reader's own time zone, so the pick changes at the reader's midnight. */
const dayNumber = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);

/**
 * The "come back" card in the hero. A new visitor sees one short lesson for today. A returning reader
 * sees their streak and the lesson they should read next. Progress never leaves this device.
 */
export default function HeroProgress({ picks }: { picks: DailyPick[] }) {
  const p = useProgress();
  const pick = picks.length ? picks[dayNumber() % picks.length] : null;
  const streak = streakOf(p.days);

  if (!p.ready || !pick) return <HeroCardSkeleton />;

  const returning = p.done.length > 0;
  return (
    <div className="mt-8 max-w-[34rem] rounded-xl border border-line bg-bg-elev p-5">
      {returning && (
        <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-line pb-4 text-[0.88rem] text-ink-dim">
          <span className="font-semibold text-ink">Welcome back</span>
          {streak > 0 && <span>{streak}-day streak</span>}
          <span>{p.done.length} {p.done.length === 1 ? "lesson" : "lessons"} done</span>
        </div>
      )}
      {returning && p.next ? (
        <>
          <p className="m-0 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-sky">Your next lesson</p>
          <Link href={p.next.path} className="group mt-1 flex items-center justify-between gap-4 text-ink hover:no-underline">
            <span className="font-semibold leading-snug transition group-hover:text-sky">{p.next.title}</span>
            <span aria-hidden="true" className="text-sky transition group-hover:translate-x-1">→</span>
          </Link>
        </>
      ) : (
        <>
          <p className="m-0 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-sky">Today&apos;s lesson · {pick.readTime}</p>
          <Link href={pick.path} className="group mt-1 flex items-center justify-between gap-4 text-ink hover:no-underline">
            <span>
              <span className="block font-semibold leading-snug transition group-hover:text-sky">{pick.title}</span>
              <span className="block text-[0.85rem] text-ink-dim">{pick.series}</span>
            </span>
            <span aria-hidden="true" className="text-sky transition group-hover:translate-x-1">→</span>
          </Link>
        </>
      )}
      {returning && p.next && (
        <p className="m-0 mt-4 border-t border-line pt-3 text-[0.85rem] text-ink-dim">
          Short on time? <Link href={pick.path}>Today&apos;s lesson: {pick.title}</Link> <span>({pick.readTime})</span>
        </p>
      )}
    </div>
  );
}
