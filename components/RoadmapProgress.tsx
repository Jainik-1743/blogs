"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAccount } from "@/components/auth/AuthProvider";
import { useProgress } from "@/lib/progress";
import { ProgressBarSkeleton } from "@/components/Skeleton";

/**
 * Shows the reader's own progress on the lesson-level roadmap: a bar with the total, and a tick on
 * every lesson already finished. The tree itself is server-rendered, so the ticks are added here.
 */
export default function RoadmapProgress({ total, paths }: { total: number; paths: string[] }) {
  const p = useProgress();
  const { status } = useAccount();
  const mine = p.done.filter((d) => paths.includes(d));

  useEffect(() => {
    const done = new Set(p.done);
    document.querySelectorAll<HTMLAnchorElement>("a.rt-lesson").forEach((a) => {
      a.classList.toggle("is-done", done.has(new URL(a.href).pathname));
    });
  }, [p.done]);

  if (status === "loading" || !p.ready) return <ProgressBarSkeleton />;
  if (status !== "ready") {
    return (
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-bg-elev px-5 py-4">
        <p className="m-0 text-ink-dim"><strong className="text-ink">Track your progress.</strong> Sign in to tick off finished lessons and see how far you have got on this roadmap.</p>
        <Link href="/login?next=/roadmap" className="rounded-lg bg-sky px-4 py-2 text-[0.9rem] font-semibold text-bg hover:no-underline hover:brightness-110">Sign in</Link>
      </div>
    );
  }
  const pct = total ? Math.round((mine.length / total) * 100) : 0;
  return (
    <div className="mb-10 rounded-xl border border-line bg-bg-elev px-5 py-4">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="m-0 font-semibold text-ink">Your progress</p>
        <p className="m-0 text-[0.88rem] text-ink-dim">{mine.length} of {total} lessons · {pct}%</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={mine.length} aria-label="Roadmap progress">
        <div className="h-full rounded-full bg-sky transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
      <p className="m-0 mt-2 text-[0.82rem] text-ink-dim">
        {mine.length === 0 ? "Finish a lesson and it is ticked here. Your progress is saved on this device only." : "Finished lessons show a tick. Pick the next untouched lesson and keep going."}
      </p>
    </div>
  );
}
