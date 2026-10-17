import { SERIES_LIST } from "./registry";

/** [lesson number, title, summary, read time, series name, series accent] */
export type Preview = [number, string, string, string, string, string];

/** What the hover card needs for every lesson, keyed by the lesson's address. Kept small on purpose. */
export function buildPreviews(): Record<string, Preview> {
  const out: Record<string, Preview> = {};
  for (const s of SERIES_LIST) {
    for (const l of s.lessons) {
      if (!l.published) continue;
      out[s.href(l)] = [l.number, l.title, l.summary, l.readTime ?? "", s.short, s.accent];
    }
  }
  return out;
}
