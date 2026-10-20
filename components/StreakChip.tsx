"use client";

import Link from "next/link";
import { useAccount } from "@/components/auth/AuthProvider";
import { dayKey, streakOf, useProgress } from "@/lib/progress";

/**
 * The reader's current streak in the header: a flame and the number of days. It links to the streak section
 * of the account page. Signed-in readers always see it (a grey flame at 0); visitors only once they have a streak.
 */
export default function StreakChip() {
  const { status } = useAccount();
  const progress = useProgress();
  if (!progress.ready || status === "loading") return null;

  const streak = streakOf(progress.days);
  if (status !== "ready" && streak === 0) return null;

  const alive = streak > 0;
  const today = progress.days.includes(dayKey());
  const label = alive
    ? `${streak}-day streak${today ? "" : ". Finish a lesson today to keep it."}`
    : "No streak yet. Finish a lesson to start one.";

  return (
    <Link
      href="/account#streak"
      aria-label={label}
      title={label}
      className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[0.82rem] font-bold tabular-nums transition hover:no-underline focus-visible:outline-2 focus-visible:outline-sky ${alive ? "border-[#ff9f1c]/50 bg-[#ff9f1c]/10 text-[#ffb347] hover:border-[#ff9f1c]" : "border-line bg-bg-elev text-ink-dim hover:border-sky"}`}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15" fill={alive ? "url(#flame)" : "currentColor"} className={alive ? "" : "opacity-60"}>
        <defs>
          <linearGradient id="flame" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffd84d" />
            <stop offset="1" stopColor="#ff6a00" />
          </linearGradient>
        </defs>
        <path d="M12.6 2.2c.3 2.3-.5 3.9-1.8 5.5-1.5 1.8-3.6 3.6-3.6 6.7A5.8 5.8 0 0 0 13 20.2a5.8 5.8 0 0 0 4.9-5.8c0-2.2-1-3.8-2.1-5 0 1.3-.6 2.3-1.5 2.9.6-3.5-.5-7.8-1.7-10.1z" />
      </svg>
      <span>{streak}</span>
    </Link>
  );
}
