import type { Glossary, GlossaryEntry } from "./glossary";
import { IV_SERIES, getIvSeries } from "./iv";
import { IV_TERMS } from "./iv-terms";

/** Hover glossary of each interview series, built from the term lists in lib/iv-terms.ts. */
const cache = new Map<string, Glossary>();

export function ivGlossaryFor(slug: string): Glossary {
  let g = cache.get(slug);
  if (!g) {
    const series = getIvSeries(slug)!;
    const entries: GlossaryEntry[] = IV_TERMS[slug] ?? [];
    g = {
      series: slug,
      seriesTitle: series.title,
      groups: [...new Set(entries.map((e) => e.group))],
      entries,
    };
    cache.set(slug, g);
  }
  return g;
}

export const IV_SLUGS = IV_SERIES.map((s) => s.slug);
