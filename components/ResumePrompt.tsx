"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * "Continue where you left off". The last page a reader opened is kept in localStorage (each new
 * page replaces the old one). When the reader comes back in a later visit, a small card offers to
 * jump straight to it. Nothing leaves the browser, and the card is shown at most once per visit.
 */

const KEY = "blogs:last-page";
const SEEN = "blogs:resume-shown";
/** Pages that are not worth resuming. */
const SKIP = new Set(["/", "/about", "/privacy", "/glossaries", "/login", "/signup", "/account"]);

type Last = { path: string; title: string; at: number };

function read(): Last | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "null");
    return v && typeof v.path === "string" && typeof v.title === "string" ? v : null;
  } catch {
    return null;
  }
}

const cleanTitle = (t: string) => t.replace(/\s*[·|]\s*blogs\s*$/i, "").trim();

function ago(at: number): string {
  const mins = Math.max(1, Math.round((Date.now() - at) / 60000));
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function ResumePrompt() {
  const pathname = usePathname();
  const [last, setLast] = useState<Last | null>(null);
  const firstRun = useRef(true);
  const button = useRef<HTMLAnchorElement>(null);

  // On the first page of a visit: show the card if the last page differs from this one.
  useEffect(() => {
    if (!firstRun.current) return;
    firstRun.current = false;
    try {
      if (sessionStorage.getItem(SEEN)) return;
      sessionStorage.setItem(SEEN, "1");
    } catch {
      return;
    }
    const prev = read();
    if (prev && prev.path !== pathname && !SKIP.has(prev.path)) setLast(prev);
  }, [pathname]);

  // On every page: remember it (replacing the previous one) once the page title is in place.
  useEffect(() => {
    if (SKIP.has(pathname)) return;
    const id = window.setTimeout(() => {
      const title = cleanTitle(document.title);
      if (!title || /not found/i.test(title)) return;
      try {
        localStorage.setItem(KEY, JSON.stringify({ path: pathname, title, at: Date.now() } satisfies Last));
      } catch {
        /* storage blocked or full: the feature simply does nothing */
      }
    }, 600);
    return () => window.clearTimeout(id);
  }, [pathname]);

  // Hide the card as soon as the reader goes anywhere, and on Escape.
  useEffect(() => {
    if (last && pathname === last.path) setLast(null);
  }, [pathname, last]);
  useEffect(() => {
    if (!last) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLast(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [last]);

  if (!last) return null;
  return (
    <div
      role="dialog"
      aria-labelledby="resume-title"
      aria-describedby="resume-desc"
      className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-[26rem] rounded-2xl border border-line bg-bg-elev p-4 shadow-2xl shadow-black/40 sm:left-auto sm:right-6 sm:bottom-6 sm:mx-0"
      data-no-glossary
    >
      <p className="m-0 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-sky">Welcome back</p>
      <h2 id="resume-title" className="mt-1 mb-1 text-[1rem] font-semibold leading-snug text-ink">
        Continue where you left off?
      </h2>
      <p id="resume-desc" className="m-0 text-[0.88rem] text-ink-dim">
        {last.title} <span className="whitespace-nowrap">· {ago(last.at)}</span>
      </p>
      <div className="mt-3 flex items-center gap-3">
        <Link
          ref={button}
          href={last.path}
          onClick={() => setLast(null)}
          className="rounded-lg bg-sky px-3.5 py-1.5 text-[0.88rem] font-semibold text-bg hover:no-underline"
        >
          Continue reading
        </Link>
        <button
          type="button"
          onClick={() => setLast(null)}
          className="rounded-lg px-2 py-1.5 text-[0.88rem] text-ink-dim hover:text-ink"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
