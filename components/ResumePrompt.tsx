"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { useAccount } from "@/components/auth/AuthProvider";

/**
 * "Continue where you left off". For signed-in readers only: the last page they read is kept in their
 * account (lastpage/{uid} in the database), so it follows them to any device, and nothing is kept in
 * browser storage. The card is shown at most once per visit, on the first page, when that page is not
 * the one they left. A page is saved only after the reader has stayed on it for a few seconds (or leaves
 * the tab), so clicking quickly through pages does not cause a write for each one.
 */

/** Pages that are not worth resuming. */
const SKIP = new Set(["/", "/about", "/privacy", "/glossaries", "/login", "/signup", "/account", "/bookmarks"]);
/** Stay on a page this long before it counts as "where you left off". */
const SAVE_AFTER_MS = 8000;

type Last = { path: string; title: string; at: number };

/** Lives for as long as the page stays open, so a client-side navigation does not show the card again. */
let checkedThisVisit = false;

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
  const { status, user } = useAccount();
  const [last, setLast] = useState<Last | null>(null);
  const button = useRef<HTMLAnchorElement>(null);
  const loaded = useRef(false);
  const written = useRef("");
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  // Once per visit: read where the reader left off, and show the card if it is a different page.
  useEffect(() => {
    const fb = getFirebase();
    if (status !== "ready" || !user || !fb) return;
    if (checkedThisVisit) {
      loaded.current = true;
      return;
    }
    checkedThisVisit = true;
    getDoc(doc(fb.db, "lastpage", user.uid))
      .then((snap) => {
        const prev = snap.data() as Last | undefined;
        if (prev && typeof prev.path === "string" && prev.path !== pathRef.current && !SKIP.has(prev.path)) setLast(prev);
      })
      .catch((err) => console.error("Last page could not be loaded:", err))
      .finally(() => { loaded.current = true; });
    // Older versions kept this in the browser; clear what they left behind.
    try {
      localStorage.removeItem("blogs:last-page");
      sessionStorage.removeItem("blogs:resume-shown");
    } catch { /* storage blocked: nothing to clear */ }
  }, [status, user]);

  // Save the page the reader is on, once they have stayed a few seconds, and when they leave the tab.
  useEffect(() => {
    const fb = getFirebase();
    if (status !== "ready" || !user || !fb || SKIP.has(pathname)) return;
    let timer = 0;

    const save = () => {
      if (!loaded.current) return; // never overwrite the old value before it has been read
      const title = cleanTitle(document.title);
      if (!title || /not found/i.test(title)) return;
      const key = `${pathname}|${title}`;
      if (written.current === key) return;
      written.current = key;
      setDoc(doc(fb.db, "lastpage", user.uid), { path: pathname, title, at: Date.now() }).catch((err) => {
        written.current = "";
        console.error("Last page could not be saved:", err);
      });
    };

    timer = window.setTimeout(save, SAVE_AFTER_MS);
    const onHide = () => document.visibilityState === "hidden" && save();
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [pathname, status, user]);

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
