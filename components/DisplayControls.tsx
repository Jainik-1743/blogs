"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FONT_KEY, FONT_LABELS, FONT_STEPS, THEME_COLORS, THEME_KEY, type FontStep, type Theme } from "@/lib/display";

const BTN =
  "grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line bg-bg-elev text-ink-dim transition-colors hover:border-sky hover:text-sky focus-visible:outline-2 focus-visible:outline-sky";

function save(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Storage can be blocked (private window). The setting still applies for this visit.
  }
}

function readTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function readFont(): FontStep {
  const v = document.documentElement.getAttribute("data-font");
  return v === "s" || v === "l" || v === "xl" ? v : "m";
}

/**
 * Two small header buttons: a sun/moon theme switch, and "Aa", which opens a text-size panel.
 * Settings are saved per browser and applied to <html> (see displayInitScript for the first paint).
 */
export default function DisplayControls() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [font, setFont] = useState<FontStep>("m");
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    setTheme(readTheme());
    setFont(readFont());
    function onDown(e: MouseEvent) {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function applyTheme(next: Theme) {
    const root = document.documentElement;
    if (next === "light") root.setAttribute("data-theme", "light");
    else root.removeAttribute("data-theme");
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[next]);
    save(THEME_KEY, next);
    setTheme(next);
  }

  function applyFont(next: FontStep) {
    const root = document.documentElement;
    if (next === "m") root.removeAttribute("data-font");
    else root.setAttribute("data-font", next);
    save(FONT_KEY, next === "m" ? null : next);
    setFont(next);
  }

  const i = FONT_STEPS.indexOf(font);
  const toLight = theme === "dark";

  return (
    <div ref={wrap} className="relative flex items-center gap-2">
      <button
        type="button"
        onClick={() => applyTheme(toLight ? "light" : "dark")}
        aria-label={toLight ? "Switch to light theme" : "Switch to dark theme"}
        title={toLight ? "Light theme" : "Dark theme"}
        className={`${BTN} max-sm:hidden`}
      >
        {toLight ? (
          <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        ) : (
          <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
        )}
      </button>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Text size"
        aria-expanded={open}
        aria-controls={panelId}
        title="Text size"
        className={`${BTN} font-sans text-[0.72rem] font-semibold leading-none ${open ? "border-sky text-sky" : ""}`}
      >
        <span aria-hidden="true">
          A<span className="text-[0.6rem]">a</span>
        </span>
      </button>

      {open ? (
        <div
          id={panelId}
          role="group"
          aria-label="Text size"
          className="absolute top-10 right-0 z-30 w-56 rounded-xl border border-line bg-bg-elev p-3 shadow-xl shadow-black/30"
        >
          <div className="mb-3 border-b border-line pb-3 sm:hidden">
            <p className="mt-0 mb-2 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-ink-dim">Theme</p>
            <div className="grid grid-cols-2 gap-2">
              {(["dark", "light"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => applyTheme(t)}
                  aria-pressed={theme === t}
                  className={`rounded-lg border px-2 py-1.5 text-[0.8rem] capitalize transition-colors ${
                    theme === t ? "border-sky bg-sky-soft text-sky" : "border-line text-ink hover:border-sky hover:text-sky"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-0 mb-2 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-ink-dim">Text size</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => applyFont(FONT_STEPS[Math.max(0, i - 1)])}
              disabled={i === 0}
              aria-label="Smaller text"
              className="grid h-9 w-9 place-items-center rounded-lg border border-line text-[0.8rem] font-semibold text-ink transition-colors hover:border-sky hover:text-sky disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink"
            >
              A−
            </button>
            <span role="status" className="flex-1 text-center text-[0.8rem] text-ink">
              {FONT_LABELS[font]}
            </span>
            <button
              type="button"
              onClick={() => applyFont(FONT_STEPS[Math.min(FONT_STEPS.length - 1, i + 1)])}
              disabled={i === FONT_STEPS.length - 1}
              aria-label="Larger text"
              className="grid h-9 w-9 place-items-center rounded-lg border border-line text-[1rem] font-semibold text-ink transition-colors hover:border-sky hover:text-sky disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink"
            >
              A+
            </button>
          </div>
          {font !== "m" ? (
            <button type="button" onClick={() => applyFont("m")} className="mt-2 w-full rounded-lg py-1 text-[0.75rem] text-ink-dim hover:text-sky">
              Reset to default
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
