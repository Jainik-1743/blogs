"use client";

import { useCallback, useEffect, useState } from "react";
import { FONT_KEY, THEME_COLORS, THEME_KEY, type FontStep, type Theme } from "./display";

const EVENT = "blogs:display";

function save(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Storage can be blocked (private window). The setting still applies for this visit.
  }
}

const readTheme = (): Theme => (document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");

function readFont(): FontStep {
  const v = document.documentElement.getAttribute("data-font");
  return v === "s" || v === "l" || v === "xl" ? v : "m";
}

/**
 * The reader's theme and text size. Settings are saved in this browser and applied to <html> (displayInitScript in
 * lib/display.ts applies them before first paint). Every component that uses this hook stays in step, so the
 * header buttons and the account page always agree.
 */
export function useDisplay() {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [font, setFontState] = useState<FontStep>("m");

  useEffect(() => {
    const sync = () => {
      setThemeState(readTheme());
      setFontState(readFont());
    };
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    const root = document.documentElement;
    if (next === "light") root.setAttribute("data-theme", "light");
    else root.removeAttribute("data-theme");
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[next]);
    save(THEME_KEY, next);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const setFont = useCallback((next: FontStep) => {
    const root = document.documentElement;
    if (next === "m") root.removeAttribute("data-font");
    else root.setAttribute("data-font", next);
    save(FONT_KEY, next === "m" ? null : next);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { theme, font, setTheme, setFont };
}
