/**
 * The accent palette. Every "sky" utility in the site reads three CSS variables
 * (--color-sky, --color-sky-strong, --color-sky-soft); each name below has a matching rule
 * in globals.css that redefines them. Add a colour here AND there.
 *
 * Each series has a default accent (its `accent` field). Readers can pick another one with
 * the swatch menu in the header; the choice is kept per series in localStorage and applied
 * as <html data-reader-accent="…">, which outranks the series default.
 */
export const ACCENTS = [
  { name: "sky", label: "Sky" },
  { name: "indigo", label: "Indigo" },
  { name: "violet", label: "Violet" },
  { name: "pink", label: "Pink" },
  { name: "rose", label: "Rose" },
  { name: "orange", label: "Orange" },
  { name: "amber", label: "Amber" },
  { name: "lime", label: "Lime" },
  { name: "emerald", label: "Emerald" },
  { name: "teal", label: "Teal" },
] as const;

export type AccentName = (typeof ACCENTS)[number]["name"];

export const ACCENT_NAMES: readonly string[] = ACCENTS.map((a) => a.name);

/** Series that get their own accent, keyed by their first path segment. */
export type SeriesNavItem = { slug: string; title: string; accent: AccentName };

export const accentStorageKey = (series: string) => `accent:${series}`;

/**
 * Runs in <head> before first paint so a reader's saved colour never flashes the default.
 * Client-side navigation is handled by AccentSync in the header.
 */
export function accentInitScript(seriesSlugs: string[]): string {
  return `(function(){try{var s=location.pathname.split("/")[1];var ok=${JSON.stringify(
    seriesSlugs,
  )};if(ok.indexOf(s)<0)return;var v=localStorage.getItem(${JSON.stringify(
    accentStorageKey(""),
  )}+s);if(v&&${JSON.stringify(ACCENT_NAMES)}.indexOf(v)>=0)document.documentElement.setAttribute("data-reader-accent",v);}catch(e){}})();`;
}
