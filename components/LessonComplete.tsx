"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { markDone, streakOf, useProgress, type NextLesson } from "@/lib/progress";
import { useAccount } from "@/components/auth/AuthProvider";
import { loadBadges, newlyEarned } from "@/lib/badges";
import { IDLE_LIMIT_MS, WORDS_PER_MINUTE, readingComplete } from "@/lib/readtime";
import { useToast } from "@/components/Toast";

const storeKey = (path: string) => `blogs:read-seconds:${path}`;

/**
 * Sits at the end of a lesson. A lesson counts as complete in exactly two ways:
 *   1. The reader clicks "Mark as complete".
 *   2. They have been actively reading for the lesson's stated reading time (for example "12 min")
 *      and have reached the end of the page. Time only counts while the tab is in front and the
 *      reader has scrolled, moved or typed in the last minute, and it carries over between visits.
 */
export default function LessonComplete({ path, next, tags = [], minutes: stated = 0 }: { path: string; next: NextLesson | null; tags?: string[]; minutes?: number }) {
  const progress = useProgress();
  const toast = useToast();
  const { status } = useAccount();
  const signedIn = status === "ready";
  const done = progress.done.includes(path);
  const streak = streakOf(progress.days);
  const sentinel = useRef<HTMLDivElement>(null);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(stated);
  const lastActive = useRef(Date.now());

  // Without a stated time, estimate it from the length of the lesson text.
  useEffect(() => {
    if (stated > 0) return setMinutes(stated);
    const words = (document.querySelector("article")?.textContent ?? "").trim().split(/\s+/).length;
    setMinutes(Math.max(1, Math.round(words / WORDS_PER_MINUTE)));
  }, [stated, path]);

  // Has the reader reached the end of the page?
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setReachedEnd(true), { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, [path]);

  // Count active reading time, remembered per lesson so reading in two sittings adds up.
  useEffect(() => {
    if (done || !signedIn) return;
    let saved = 0;
    try { saved = Number(localStorage.getItem(storeKey(path))) || 0; } catch { /* ignore */ }
    setSeconds(saved);
    let total = saved;
    lastActive.current = Date.now();
    const mark = () => { lastActive.current = Date.now(); };
    const events = ["scroll", "mousemove", "keydown", "touchstart", "click"] as const;
    events.forEach((e) => window.addEventListener(e, mark, { passive: true }));
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible" || Date.now() - lastActive.current > IDLE_LIMIT_MS) return;
      total += 1;
      setSeconds(total);
      if (total % 5 === 0) {
        try { localStorage.setItem(storeKey(path), String(total)); } catch { /* ignore */ }
      }
    }, 1000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, mark));
      window.clearInterval(timer);
      try { localStorage.setItem(storeKey(path), String(total)); } catch { /* ignore */ }
    };
  }, [path, done, signedIn]);

  /** Marks the lesson done and, when that earns a badge, says so. Badges are only looked up for signed-in readers. */
  const finish = () => {
    const { before, after } = markDone(path, next, tags);
    try { localStorage.removeItem(storeKey(path)); } catch { /* ignore */ }
    if (status !== "ready") return toast("Lesson complete. Progress saved on this device.");
    loadBadges()
      .then((badges) => {
        const earned = newlyEarned(badges, before, after)[0];
        toast(earned ? `New badge unlocked: ${earned.name}!` : "Lesson complete. Progress saved.");
      })
      .catch(() => toast("Lesson complete. Progress saved."));
  };

  // Automatic completion: the stated reading time has passed and the reader is at the end.
  useEffect(() => {
    if (done || !signedIn || !progress.ready) return;
    if (readingComplete({ seconds, minutes, reachedEnd })) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, minutes, reachedEnd, done, progress.ready, signedIn]);

  const need = minutes * 60;
  const next_ = `?next=${encodeURIComponent(path)}`;
  const percent = need ? Math.min(100, Math.round((seconds / need) * 100)) : 0;
  const readMin = Math.floor(seconds / 60);

  // Visitors who are not signed in get an invitation, not a tracker.
  if (status === "loading") return <div ref={sentinel} className="mt-10" />;
  if (!signedIn) {
    return (
      <div ref={sentinel} className="mt-10 rounded-xl border border-line bg-bg-elev px-5 py-4" data-no-glossary>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="m-0 max-w-[52ch] text-ink-dim">
            <strong className="text-ink">Keep track of what you read.</strong> Sign in to save finished lessons, build a daily streak and earn badges. Reading stays free without an account.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href={`/login${next_}`} className="rounded-lg bg-sky px-4 py-2 text-[0.9rem] font-semibold text-bg hover:no-underline hover:brightness-110">Sign in</Link>
            <Link href={`/signup${next_}`} className="rounded-lg border border-line px-4 py-2 text-[0.9rem] font-semibold text-ink hover:border-sky hover:text-sky hover:no-underline">Create account</Link>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="rounded-xl border border-line bg-bg-elev px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="m-0 max-w-[48ch] text-ink-dim">
              This lesson is about <strong className="text-ink">{minutes} min</strong>. It is marked complete when you have read for that long and reach the end, or you can mark it yourself.
            </p>
            <button type="button" onClick={finish} className="rounded-lg border border-sky px-4 py-2 text-[0.9rem] font-semibold text-sky transition hover:bg-sky-soft">
              Mark as complete
            </button>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label="Reading time">
              <div className="h-full rounded-full bg-sky transition-[width] duration-700" style={{ width: `${percent}%` }} />
            </div>
            <span className="shrink-0 font-mono text-[0.72rem] text-ink-dim">{readMin} of {minutes} min</span>
          </div>
        </div>
      )}
    </div>
  );
}
