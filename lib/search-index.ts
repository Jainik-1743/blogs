import { DSA_GLOSSARY } from "./dsa-glossary";
import { DSA_LESSONS, DSA_SERIES, dsaLessonHref } from "./dsa";
import { DEVOPS_GLOSSARY, glossaryHref, glossaryLessonHref, type Glossary } from "./glossary";
import fs from "node:fs";
import path from "node:path";
import { GUIDES } from "./guides-data";
import { IV_SERIES, ivLessonHref } from "./iv";
import { ivGlossaryFor } from "./iv-glossary";
import { JS_GLOSSARY } from "./js-glossary";
import { JS_LESSONS, JS_READINGS, JS_SERIES, jsLessonHref, jsReadingHref } from "./javascript";
import { LESSONS, READINGS, SERIES as DEVOPS_SERIES, lessonHref, readingHref } from "./lessons";
import { SD_GLOSSARY } from "./sd-glossary";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "./system-design";

export type SearchKind = "Lesson" | "Reading" | "Term" | "Question" | "Guide" | "Page";

/** One searchable thing. Kept flat and small because the whole list is sent to the browser. */
export type SearchItem = {
  kind: SearchKind;
  series: string;
  seriesTitle: string;
  title: string;
  /** Extra text that is matched but not shown as the title. */
  text: string;
  href: string;
};

function termItems(g: Glossary): SearchItem[] {
  return g.entries.map((e) => ({
    kind: "Term",
    series: g.series,
    seriesTitle: g.seriesTitle,
    title: e.full === e.term ? e.term : `${e.term} — ${e.full}`,
    text: [...(e.aliases ?? []), e.desc].join(" "),
    href: e.lesson !== undefined ?glossaryLessonHref(g, e.lesson) : glossaryHref(g),
  }));
}

/** The "### Q1. … (Must know)" headings of one markdown lesson, each with the link to its interview-questions section. */
function questionItems(seriesSlug: string, seriesTitle: string, lessonNumber: number, lessonTitle: string, href: string): SearchItem[] {
  const file = path.join(process.cwd(), "content", seriesSlug, `${String(lessonNumber).padStart(2, "0")}.md`);
  let src: string;
  try {
    src = fs.readFileSync(file, "utf8");
  } catch {
    return [];
  }
  const heading = /^##\s+(.*interview questions.*)$/im.exec(src);
  const anchor = heading ? "#" + slugifyHeading(heading[1]) : "";
  const out: SearchItem[] = [];
  for (const m of src.matchAll(/^###\s+Q\d+[.:]\s+(.+)$/gm)) {
    const title = m[1].replace(/\s*\((?:Must know|Senior signal|Trap)\)\s*$/i, "").replace(/[`*_]/g, "").trim();
    out.push({ kind: "Question", series: seriesSlug, seriesTitle, title, text: `Lesson ${lessonNumber}: ${lessonTitle}`, href: href + anchor });
  }
  return out;
}

/** Same rule the lesson renderer uses for heading ids (see components/iv/Markdown.tsx). */
function slugifyHeading(s: string): string {
  return s.toLowerCase().replace(/<[^>]*>/g, "").replace(/[`*_]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

/** Every lesson, reading, interview question, guide and glossary term across all series. */
export function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = [];

  for (const l of LESSONS.filter((l) => l.published)) {
    items.push({ kind: "Lesson", series: DEVOPS_SERIES.slug, seriesTitle: DEVOPS_SERIES.title, title: `Lesson ${l.number}: ${l.title}`, text: l.summary, href: lessonHref(l) });
  }
  for (const r of READINGS) {
    items.push({ kind: "Reading", series: DEVOPS_SERIES.slug, seriesTitle: DEVOPS_SERIES.title, title: r.title, text: r.summary, href: readingHref(r) });
  }
  for (const l of JS_LESSONS.filter((l) => l.published)) {
    items.push({ kind: "Lesson", series: JS_SERIES.slug, seriesTitle: JS_SERIES.title, title: `Lesson ${l.number}: ${l.title}`, text: l.summary, href: jsLessonHref(l) });
  }
  for (const r of JS_READINGS) {
    items.push({ kind: "Reading", series: JS_SERIES.slug, seriesTitle: JS_SERIES.title, title: r.title, text: r.summary, href: jsReadingHref(r) });
  }
  for (const l of SD_LESSONS.filter((l) => l.published)) {
    items.push({ kind: "Lesson", series: SD_SERIES.slug, seriesTitle: SD_SERIES.title, title: `Lesson ${l.number}: ${l.title}`, text: `${l.summary} ${l.tags.join(" ")}`, href: sdLessonHref(l) });
  }

  for (const l of DSA_LESSONS.filter((l) => l.published)) {
    items.push({ kind: "Lesson", series: DSA_SERIES.slug, seriesTitle: DSA_SERIES.title, title: `Lesson ${l.number}: ${l.title}`, text: l.summary, href: dsaLessonHref(l) });
  }

  for (const s of IV_SERIES) {
    for (const l of s.lessons.filter((l) => l.published)) {
      items.push({ kind: "Lesson", series: s.slug, seriesTitle: s.title, title: `Lesson ${l.number}: ${l.title}`, text: `${l.summary} ${l.tags.join(" ")}`, href: ivLessonHref(s, l) });
      items.push(...questionItems(s.slug, s.title, l.number, l.title, ivLessonHref(s, l)));
    }
  }

  for (const g of GUIDES) {
    items.push({ kind: "Guide", series: "guides", seriesTitle: "Study guides", title: g.title, text: g.description, href: `/guides/${g.slug}` });
  }

  for (const g of [DEVOPS_GLOSSARY, JS_GLOSSARY, SD_GLOSSARY, DSA_GLOSSARY, ...IV_SERIES.map((s) => ivGlossaryFor(s.slug))]) items.push(...termItems(g));
  return items;
}
