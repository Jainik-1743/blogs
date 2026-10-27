import { SHEETS, sheetPath } from "./cheatsheets";
import { SERIES_SHEETS } from "./series-sheets";
import type { AccentName } from "./accents";
import { DSA_GLOSSARY } from "./dsa-glossary";
import { DSA_LESSONS, DSA_SERIES, dsaLessonHref } from "./dsa";
import { DEVOPS_GLOSSARY } from "./glossary";
import { IV_SERIES, ivLessonHref } from "./iv";
import { ivGlossaryFor } from "./iv-glossary";
import { JS_GLOSSARY } from "./js-glossary";
import { JS_LESSONS, JS_READINGS, JS_SERIES, jsLessonHref, jsReadingHref } from "./javascript";
import { LESSONS, READINGS, SERIES as DEVOPS_SERIES, lessonHref, readingHref, type Lesson } from "./lessons";
import { SD_GLOSSARY } from "./sd-glossary";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "./system-design";
import { GUIDES } from "./guides-data";
import { STAGES, stageSlug } from "./roadmap-stages";
import { TERM_PAGES, termPath } from "./glossary-terms";
import { MIN_LESSONS, TOPICS, type TopicDef } from "./topics";
import { RELATED_SERIES, SERIES_GROUPS, SERIES_SHORT } from "./series";

/**
 * One list of every page on the site, built from the same registries that drive the tables of
 * contents. The sitemap, the RSS feed, the Open Graph images, the page metadata and the JSON-LD
 * all read from here, so a lesson only has to be registered once.
 */

export type PageKind = "home" | "hub" | "term" | "page" | "series" | "lesson" | "reading" | "glossary" | "guide";

export type PageInfo = {
  path: string;
  kind: PageKind;
  title: string;
  description: string;
  seriesSlug?: string;
  seriesTitle?: string;
  seriesShort?: string;
  accent?: AccentName;
  number?: number;
  readTime?: string;
  tags?: string[];
};

export type SeriesInfo = {
  slug: string;
  title: string;
  short: string;
  tagline: string;
  accent: AccentName;
  lessons: Lesson[];
  href: (lesson: Lesson) => string;
  termCount: number;
  tagsFor: (lesson: Lesson) => string[] | undefined;
};

type Reading = { slug: string; title: string; summary: string; readTime?: string };

export const SERIES_LIST: SeriesInfo[] = [
  {
    slug: DEVOPS_SERIES.slug, title: DEVOPS_SERIES.title, short: SERIES_SHORT[DEVOPS_SERIES.slug], tagline: DEVOPS_SERIES.tagline,
    accent: DEVOPS_SERIES.accent, lessons: LESSONS, href: lessonHref, termCount: DEVOPS_GLOSSARY.entries.length, tagsFor: () => undefined,
  },
  {
    slug: JS_SERIES.slug, title: JS_SERIES.title, short: SERIES_SHORT[JS_SERIES.slug], tagline: JS_SERIES.tagline,
    accent: JS_SERIES.accent, lessons: JS_LESSONS, href: jsLessonHref, termCount: JS_GLOSSARY.entries.length, tagsFor: () => undefined,
  },
  {
    slug: SD_SERIES.slug, title: SD_SERIES.title, short: SERIES_SHORT[SD_SERIES.slug], tagline: SD_SERIES.tagline,
    accent: SD_SERIES.accent, lessons: SD_LESSONS, href: sdLessonHref, termCount: SD_GLOSSARY.entries.length, tagsFor: () => undefined,
  },
  {
    slug: DSA_SERIES.slug, title: DSA_SERIES.title, short: SERIES_SHORT[DSA_SERIES.slug], tagline: DSA_SERIES.tagline,
    accent: DSA_SERIES.accent, lessons: DSA_LESSONS, href: dsaLessonHref, termCount: DSA_GLOSSARY.entries.length, tagsFor: () => undefined,
  },
  ...IV_SERIES.map((s): SeriesInfo => ({
    slug: s.slug, title: s.title, short: s.short, tagline: s.tagline, accent: s.accent, lessons: s.lessons,
    href: (l) => ivLessonHref(s, l), termCount: ivGlossaryFor(s.slug).entries.length,
    tagsFor: (l) => (l as Lesson & { tags?: string[] }).tags,
  })),
];

const READINGS_BY_SERIES: Record<string, { items: Reading[]; href: (r: Reading) => string }> = {
  [DEVOPS_SERIES.slug]: { items: READINGS, href: (r) => readingHref(r) },
  [JS_SERIES.slug]: { items: JS_READINGS, href: (r) => jsReadingHref(r) },
};

export const HUB_GLOSSARIES = { path: "/glossaries", title: "Glossaries: clear definitions for developers" };

export function seriesBySlug(slug: string): SeriesInfo | undefined {
  return SERIES_LIST.find((s) => s.slug === slug);
}

/** Group the series for the home page and the footer. Fails the build if a series has no group. */
export function groupedSeries() {
  const used = new Set<string>();
  const groups = SERIES_GROUPS.map((g) => ({
    ...g,
    series: g.slugs.map((slug) => {
      const s = seriesBySlug(slug);
      if (!s) throw new Error(`SERIES_GROUPS lists unknown series "${slug}"`);
      used.add(slug);
      return s;
    }),
  }));
  const missing = SERIES_LIST.filter((s) => !used.has(s.slug)).map((s) => s.slug);
  if (missing.length) throw new Error(`Series without a group in lib/series.ts: ${missing.join(", ")}`);
  return groups;
}

function buildPages(): PageInfo[] {
  const pages: PageInfo[] = [];
  pages.push({
    path: "/", kind: "home", title: "blogs", description: "Free, easy-to-follow lesson series for software engineers.",
  });
  pages.push({
    path: HUB_GLOSSARIES.path, kind: "hub", title: HUB_GLOSSARIES.title,
    description: "Every glossary on the site in one place: DSA, system design, DevOps, JavaScript, TypeScript, SQL, Git, testing and more, each term explained clearly.",
  });
  pages.push({
    path: "/guides", kind: "hub", title: "Study guides: reading orders for interviews and core skills",
    description: "Curated study guides that put the lessons in a sensible order: system design, coding interviews, JavaScript, SQL, Git, DevOps, TypeScript, testing, AI and more.",
  });
  pages.push({
    path: "/roadmap", kind: "hub", title: "Developer roadmap: from the basics to interviews",
    description: "One connected map of every lesson series, from Git, Linux and networking through JavaScript, React, Node.js, system design and DevOps to AI and interviews. Every box opens its lessons.",
  });
  pages.push({
    path: "/roadmap/detailed", kind: "hub", title: "Detailed developer roadmap: every lesson in order",
    description: "The full roadmap with every lesson on it: eight steps from computer basics to interviews, each series broken into its lessons in reading order, and every box opens its lesson.",
  });
  for (const st of STAGES) {
    pages.push({
      path: `/roadmap/${stageSlug(st.title)}`, kind: "hub", title: `${st.title} roadmap: every lesson in order`,
      description: `${st.blurb} The full ${st.title} roadmap lists each series and every lesson in reading order, and every box opens its lesson.`,
    });
  }
  pages.push({
    path: "/features", kind: "hub", title: "What's new: free accounts with streaks, badges and bookmarks",
    description: "Reading every lesson stays free. A free account adds saved progress across devices, a daily streak, reading badges, bookmarks sorted by topic and shareable achievements.",
  });
  pages.push({
    path: "/cheatsheets", kind: "hub", title: "Developer cheat sheets: Git, Linux, SQL, Docker, React and more",
    description: "One-page cheat sheets for the tools and topics developers look up most. Read them free, and download any sheet as a PNG or a PDF with a free account.",
  });
  for (const s of SHEETS) {
    pages.push({ path: sheetPath(s.slug), kind: "hub", title: s.title, description: s.blurb });
  }
  if (Object.keys(SERIES_SHEETS).length) {
    pages.push({
      path: "/cheatsheets/series", kind: "hub", title: "Cheat sheets by series: one printable page for every lesson series",
      description: "A dense, printable cheat sheet for each lesson series: the commands, tables, rules and gotchas, each card linked to the lesson that teaches it.",
    });
  }
  for (const [slug, sheet] of Object.entries(SERIES_SHEETS)) {
    const series = SERIES_LIST.find((x) => x.slug === slug);
    if (!series) throw new Error(`Series cheat sheet for unknown series "${slug}"`);
    pages.push({
      path: `/cheatsheets/series/${slug}`, kind: "hub", title: `${series.short} cheat sheet: key facts, commands and gotchas`,
      description: sheet.intro.replace(/[`*]/g, ""), seriesSlug: slug, seriesTitle: series.title, seriesShort: series.short, accent: series.accent,
    });
  }
  pages.push({
    path: "/topics", kind: "hub", title: "Browse by topic: lessons on one subject from every series",
    description: "Pick a subject such as caching, security, databases or APIs and see every lesson about it, from every series, in one list.",
  });
  for (const g of GUIDES) pages.push({ path: `/guides/${g.slug}`, kind: "guide", title: g.title, description: g.description });
  pages.push({
    path: "/about", kind: "page", title: "About this site and its author",
    description: "Who publishes these lessons, how they are made and checked, and how to contact Jainik.",
  });
  pages.push({
    path: "/privacy", kind: "page", title: "Privacy notice",
    description: "What this site collects (analytics only), which services are involved, what is stored in your browser, and how to contact me.",
  });
  for (const s of SERIES_LIST) {
    const base = { seriesSlug: s.slug, seriesTitle: s.title, seriesShort: s.short, accent: s.accent };
    pages.push({ ...base, path: `/${s.slug}`, kind: "series", title: s.title, description: s.tagline });
    for (const l of s.lessons) {
      if (!l.published) continue;
      pages.push({
        ...base, path: s.href(l), kind: "lesson", title: l.title, description: l.summary,
        number: l.number, readTime: l.readTime, tags: s.tagsFor(l),
      });
    }
    const readings = READINGS_BY_SERIES[s.slug];
    for (const r of readings?.items ?? []) {
      pages.push({ ...base, path: readings.href(r), kind: "reading", title: r.title, description: r.summary, readTime: r.readTime });
    }
    // System Design's glossary is itself a numbered lesson at /system-design/glossary: do not list it twice.
    if (pages.some((p) => p.path === `/${s.slug}/glossary`)) continue;
    pages.push({
      ...base, path: `/${s.slug}/glossary`, kind: "glossary", title: `${s.short} glossary`,
      description: `Clear definitions of the ${s.termCount} terms used in "${s.title}", each with the lesson that explains it.`,
    });
  }
  pages.push({
    path: "/glossary", kind: "hub", title: "Developer glossary, A to Z",
    description: `${TERM_PAGES.length} developer terms explained in a few clear sentences, each with the lesson that teaches it: DSA, system design, DevOps, JavaScript, networking, security and more.`,
  });
  for (const t of TERM_PAGES) pages.push({ path: termPath(t.slug), kind: "term", title: t.heading, description: t.description });
  for (const t of TOPICS) {
    if (topicLessonsFrom(pages, t).length < MIN_LESSONS) continue;
    pages.push({ path: `/topics/${t.slug}`, kind: "hub", title: `${t.title}: every lesson on the topic`, description: t.blurb });
  }
  return pages;
}

/** The lessons that belong to a topic, in series order. */
function topicLessonsFrom(pages: PageInfo[], t: TopicDef): PageInfo[] {
  return pages.filter((p) => {
    if (p.kind !== "lesson" || !p.seriesSlug) return false;
    if (t.series?.includes(p.seriesSlug)) return true;
    if (!t.match || t.skipSeries?.includes(p.seriesSlug)) return false;
    const title = p.title.replace(/^Lesson \d+:\s*/i, "").toLowerCase();
    if (t.skipTitle?.test(title)) return false;
    return t.match.test(`${title} ${(p.tags ?? []).join(" ")}`.toLowerCase());
  });
}

export const ALL_PAGES: PageInfo[] = buildPages();

for (const [slug, rel] of Object.entries(RELATED_SERIES)) {
  for (const r of [slug, ...rel]) if (!SERIES_LIST.some((x) => x.slug === r)) throw new Error(`RELATED_SERIES mentions unknown series "${r}"`);
}
const BY_PATH = new Map(ALL_PAGES.map((p) => [p.path, p]));

export function findPage(path: string): PageInfo | undefined {
  return BY_PATH.get(path);
}

/** Series that go well with this one, for the "Keep learning" block. */
export function relatedSeries(slug: string): SeriesInfo[] {
  return (RELATED_SERIES[slug] ?? []).map((x) => seriesBySlug(x)).filter((x): x is SeriesInfo => Boolean(x));
}

const GENERIC_TAGS = new Set(["interview", "interviews", "roadmap", "beginner", "fundamentals"]);

/** Lessons in OTHER series that share the most tags with this one (only markdown-series lessons carry tags). */
export function relatedLessons(path: string, limit = 3): PageInfo[] {
  const me = findPage(path);
  const mine = (me?.tags ?? []).filter((t) => !GENERIC_TAGS.has(t));
  if (!me || !mine.length) return [];
  return ALL_PAGES.filter((p) => p.kind === "lesson" && p.path !== path && p.seriesSlug !== me.seriesSlug && p.tags?.length)
    .map((p) => ({ p, score: p.tags!.filter((t) => mine.includes(t)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.p.path.localeCompare(b.p.path))
    .slice(0, limit)
    .map((x) => x.p);
}

/** Topics that have enough lessons to get a page, each with its lessons. */
export const TOPIC_PAGES = TOPICS.map((def) => ({ def, lessons: topicLessonsFrom(ALL_PAGES, def) })).filter((t) => t.lessons.length >= MIN_LESSONS);

/** Topics a lesson belongs to, for the chips under a lesson. */
export function topicsForPath(path: string): TopicDef[] {
  return TOPIC_PAGES.filter((t) => t.lessons.some((l) => l.path === path)).map((t) => t.def);
}
