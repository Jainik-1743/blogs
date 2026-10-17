"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { setFocus, useFocus } from "@/lib/focus";

const LESSON_PATH = /^\/[^/]+\/lesson-\d+\/?$/;

/**
 * Applies focus mode to the page: sets data-focus on <html> (the CSS in globals.css hides the header,
 * footer and extras), and shows an "Exit" button. Esc also exits. Leaving the lesson pages ends it,
 * so no one is left on a page with no header.
 */
export default function FocusMode() {
  const focus = useFocus();
  const pathname = usePathname();
  const onLesson = LESSON_PATH.test(pathname);
  const active = focus && onLesson;

  useEffect(() => {
    if (focus && !onLesson) setFocus(false);
  }, [focus, onLesson]);

  useEffect(() => {
    const root = document.documentElement;
    if (active) root.setAttribute("data-focus", "");
    else root.removeAttribute("data-focus");
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFocus(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      root.removeAttribute("data-focus");
    };
  }, [active]);

  if (!active) return null;
  return (
    <button
      type="button"
      onClick={() => setFocus(false)}
      className="fixed top-3 right-3 z-50 inline-flex items-center gap-2 rounded-full border border-line bg-bg-elev/90 px-3.5 py-1.5 text-[0.8rem] text-ink-dim shadow-lg backdrop-blur transition-colors hover:border-sky hover:text-sky focus-visible:outline-2 focus-visible:outline-sky"
    >
      <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M16 21h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
      </svg>
      Exit focus <kbd className="rounded border border-line px-1 font-mono text-[0.68rem]">Esc</kbd>
    </button>
  );
}
