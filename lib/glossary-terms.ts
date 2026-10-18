import { DSA_GLOSSARY } from "./dsa-glossary";
import { DEVOPS_GLOSSARY, glossaryLessonHref, type Glossary, type GlossaryEntry } from "./glossary";
import { IV_SLUGS, ivGlossaryFor } from "./iv-glossary";
import { JS_GLOSSARY } from "./js-glossary";
import { SD_GLOSSARY } from "./sd-glossary";

/**
 * One page per glossary term, at /glossary/<slug>. The same word can appear in several series' glossaries
 * (for example "idempotency" in System Design and in API Design); those entries share one page, one definition
 * per series, so there is a single address for "what is X".
 */
export type TermUse = {
  series: string;
  seriesTitle: string;
  entry: GlossaryEntry;
  /** Where the series explains it properly, if its glossary says so. */
  lessonHref?: string;
  group: string;
};

export type TermPage = {
  slug: string;
  /** The term as first written, e.g. "TCP" or "Node.js". */
  name: string;
  /** Long form of the first entry, e.g. "Transmission Control Protocol". */
  full: string;
  uses: TermUse[];
  /** <title>-ready heading for the page. */
  heading: string;
  description: string;
};

export function termSlug(term: string): string {
  return term
    .toLowerCase()
    .replace(/\+/g, "plus")
    .replace(/#/g, "sharp")
    .replace(/&/g, "and")
    .replace(/²/g, "2")
    .replace(/\./g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const GLOSSARIES: Glossary[] = [DEVOPS_GLOSSARY, JS_GLOSSARY, SD_GLOSSARY, DSA_GLOSSARY, ...IV_SLUGS.map((s) => ivGlossaryFor(s))];

const clip = (t: string, n: number) => {
  const c = t.replace(/\s+/g, " ").trim();
  return c.length <= n ? c : `${c.slice(0, n - 1).replace(/\s+\S*$/, "")}…`;
};

function build(): TermPage[] {
  const map = new Map<string, TermPage>();
  for (const g of GLOSSARIES) {
    for (const e of g.entries) {
      const slug = termSlug(e.term);
      if (!slug) continue;
      const use: TermUse = {
        series: g.series,
        seriesTitle: g.seriesTitle,
        entry: e,
        group: e.group,
        ...(e.lesson !== undefined ? { lessonHref: glossaryLessonHref(g, e.lesson) } : {}),
      };
      const page = map.get(slug);
      if (page) {
        // One definition per series is enough; a second entry from the same series is skipped.
        if (!page.uses.some((u) => u.series === g.series)) page.uses.push(use);
        continue;
      }
      const full = e.full && e.full.toLowerCase() !== e.term.toLowerCase() ? e.full : "";
      const heading = full && full.length <= 38 ? `What is ${e.term} (${full})?` : `What is ${e.term}? Meaning for developers`;
      map.set(slug, { slug, name: e.term, full, uses: [use], heading, description: clip(`${e.term}${full ? ` (${full})` : ""}: ${e.desc}`, 155) });
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}

export const TERM_PAGES: TermPage[] = build();
const BY_SLUG = new Map(TERM_PAGES.map((t) => [t.slug, t]));

export const termBySlug = (slug: string) => BY_SLUG.get(slug);
export const termPath = (slug: string) => `/glossary/${slug}`;
export const hasTermPage = (term: string) => BY_SLUG.has(termSlug(term));

/** Other terms from the same glossary group as this one, for the "Related terms" block. */
export function relatedTerms(t: TermPage, limit = 8): TermPage[] {
  const out = new Map<string, TermPage>();
  for (const u of t.uses) {
    const g = GLOSSARIES.find((x) => x.series === u.series);
    for (const e of g?.entries ?? []) {
      if (e.group !== u.group) continue;
      const other = BY_SLUG.get(termSlug(e.term));
      if (other && other.slug !== t.slug) out.set(other.slug, other);
    }
  }
  return [...out.values()].slice(0, limit);
}
