"use client";

import { useEffect, useRef, useState } from "react";
import { markDone, streakOf, useProgress, type NextLesson } from "@/lib/progress";
import { useAccount } from "@/components/auth/AuthProvider";
import { loadBadges, newlyEarned } from "@/lib/badges";
import { useToast } from "@/components/Toast";

/** Reading for less than this long does not count as finishing, so skimming to the bottom does not tick a lesson. */
const MIN_SECONDS = 25;

/**
 * Sits at the end of a lesson. When the reader reaches it after a fair reading time the lesson is
 * marked complete automatically; a button does the same at any time. It then shows the streak, which
 * is the reason to come back tomorrow.
 */
export default function LessonComplete({ path, next, tags = [] }: { path: string; next: NextLesson | null; tags?: string[] }) {
  const progress = useProgress();
  const toast = useToast();
  const { status } = useAccount();
  const done = progress.done.includes(path);
  const streak = streakOf(progress.days);
  const sentinel = useRef<HTMLDivElement>(null);
  const opened = useRef(Date.now());
  const [reached, setReached] = useState(false);

  useEffect(() => {
    opened.current = Date.now();
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setReached(true), { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, [path]);

  /** Marks the lesson done and, when that earns a badge, says so. Badges are only looked up for signed-in readers. */
  const finish = () => {
    const { before, after } = markDone(path, next, tags);
    if (status !== "ready") return toast("Lesson complete. Progress saved on this device.");
    loadBadges()
      .then((badges) => {
        const earned = newlyEarned(badges, before, after)[0];
        toast(earned ? `New badge unlocked: ${earned.name}!` : "Lesson complete. Progress saved.");
      })
      .catch(() => toast("Lesson complete. Progress saved."));
  };

  useEffect(() => {
    if (!reached || done || !progress.ready) return;
    const wait = Math.max(0, MIN_SECONDS * 1000 - (Date.now() - opened.current));
    const t = window.setTimeout(finish, wait);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reached, done, progress.ready, path, next]);

  return (
    <div ref={sentinel} className="mt-10" data-no-glossary>
      {done ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky/50 bg-sky-soft px-5 py-4">
          <p className="m-0 flex items-center gap-3 font-semibold text-ink">
            <span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-full bg-sky text-[0.9rem] text-bg">✓</span>
            Lesson complete
          </p>
          <p className="m-0 text-[0.9rem] text-ink-dim">
            {streak > 1 ? <><strong className="text-ink">{streak}-day streak.</strong> Come back tomorrow to keep it going. </> : <>Nice start. Read one lesson tomorrow to build a streak. </>}
            <span className="whitespace-nowrap">{progress.done.length} {progress.done.length === 1 ? "lesson" : "lessons"} done.</span>
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-bg-elev px-5 py-4">
          <p className="m-0 text-ink-dim">Finished reading? Mark it done to save your progress on this device.</p>
          <button type="button" onClick={finish} className="rounded-lg border border-sky px-4 py-2 text-[0.9rem] font-semibold text-sky transition hover:bg-sky-soft">
            Mark as complete
          </button>
        </div>
      )}
    </div>
  );
}
