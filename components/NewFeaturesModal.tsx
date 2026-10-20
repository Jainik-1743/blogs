"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "@/components/auth/AuthProvider";

/**
 * A one-time invitation for visitors who are not signed in: reading stays free, and an account adds progress, streaks,
 * badges and bookmarks. Once a visitor closes it (or follows any of its links) the choice is remembered in this
 * browser and it never appears again. Signed-in readers never see it. They can still sign in or read about the
 * features at any time (/features).
 */
const KEY = "blogs:features-modal";
/** Wait this long on a page before asking, so it never greets someone the instant they arrive. */
const DELAY_MS = 10_000;
/** Pages where the invitation would get in the way, or is pointless. */
const SKIP = ["/login", "/signup", "/features", "/privacy", "/account", "/bookmarks", "/admin"];

/** Remembered for this visit even if browser storage is blocked, so a visitor is not asked on every page. */
let dismissedThisVisit = false;

const wasDismissed = () => {
  if (dismissedThisVisit) return true;
  try {
    return localStorage.getItem(KEY) !== null;
  } catch {
    return false;
  }
};

const POINTS = [
  { title: "Saved progress and a daily streak", text: "Pick up on any device and watch your streak grow." },
  { title: "Badges from Silver to Elite", text: "Earn them for the days you learn, and share them." },
  { title: "Bookmarks sorted by topic", text: "Save a lesson once, find it again in seconds." },
];

export default function NewFeaturesModal() {
  const { enabled, status } = useAccount();
  const pathname = usePathname();
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  const eligible = enabled && status === "out" && !SKIP.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  // Ask once, after a pause, only for visitors who have not said no before.
  useEffect(() => {
    if (!eligible || wasDismissed()) return;
    const t = window.setTimeout(() => {
      if (!wasDismissed()) setOpen(true);
    }, DELAY_MS);
    return () => window.clearTimeout(t);
  }, [eligible, pathname]);

  // A reader who signs in while it is open should not see it.
  useEffect(() => {
    if (status === "ready") setOpen(false);
  }, [status]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  /** Closing for any reason, including Escape, a click outside and following a link, means "do not ask again". */
  function dismiss() {
    dismissedThisVisit = true;
    try {
      localStorage.setItem(KEY, JSON.stringify({ at: Date.now() }));
    } catch { /* storage blocked: the in-memory flag still stops repeats for this visit */ }
    setOpen(false);
  }

  if (!open) return <dialog ref={ref} />;

  const next = encodeURIComponent(pathname);
  return (
    <dialog
      ref={ref}
      onClose={dismiss}
      onClick={(e) => e.target === ref.current && dismiss()}
      aria-labelledby="features-title"
      aria-describedby="features-desc"
      className="m-auto w-[min(30rem,calc(100vw-1.5rem))] max-h-[calc(100dvh-1.5rem)] overflow-auto rounded-3xl border border-line bg-bg-elev p-0 text-ink shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      data-no-glossary
    >
      <div className="relative overflow-hidden p-6 sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-sky-soft to-transparent" />
        <button type="button" onClick={dismiss} aria-label="Close" className="absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-full border border-line text-ink-dim hover:border-sky hover:text-sky">×</button>

        <p className="relative m-0 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-sky">What&apos;s new</p>
        <h2 id="features-title" className="relative m-0 mt-1 text-[1.6rem] font-bold leading-tight tracking-tight text-ink">Reading is free. An account makes it stick.</h2>
        <p id="features-desc" className="relative mt-2 mb-5 text-[0.95rem] text-ink-dim">Every lesson stays open to everyone. Sign in, free, to unlock:</p>

        <ul className="relative m-0 flex list-none flex-col gap-4 p-0">
          {POINTS.map((p) => (
            <li key={p.title} className="m-0 flex gap-3">
              <span aria-hidden="true" className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sky-soft text-[0.8rem] font-bold text-sky">✓</span>
              <span><span className="block font-semibold text-ink">{p.title}</span><span className="block text-[0.88rem] text-ink-dim">{p.text}</span></span>
            </li>
          ))}
        </ul>

        <div className="relative mt-7 flex flex-wrap gap-3">
          <Link href={`/signup?next=${next}`} onClick={dismiss} className="rounded-lg bg-sky px-5 py-2.5 font-semibold text-bg hover:no-underline hover:brightness-110">Create a free account</Link>
          <Link href={`/login?next=${next}`} onClick={dismiss} className="rounded-lg border border-line px-5 py-2.5 font-semibold text-ink hover:border-sky hover:text-sky hover:no-underline">Sign in</Link>
        </div>
        <p className="relative mt-4 mb-0 flex flex-wrap items-center justify-between gap-3 text-[0.85rem]">
          <Link href="/features" onClick={dismiss} className="font-semibold">See all features →</Link>
          <button type="button" onClick={dismiss} className="text-ink-dim hover:text-ink">Maybe later</button>
        </p>
      </div>
    </dialog>
  );
}
