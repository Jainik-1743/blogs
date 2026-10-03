import { DSA_GLOSSARY } from "./dsa-glossary";
import { DSA_LESSONS, DSA_SERIES, dsaLessonHref } from "./dsa";
import { DEVOPS_GLOSSARY, glossaryHref, glossaryLessonHref, type Glossary } from "./glossary";
import { JS_GLOSSARY } from "./js-glossary";
import { JS_LESSONS, JS_READINGS, JS_SERIES, jsLessonHref, jsReadingHref } from "./javascript";
import { LESSONS, READINGS, SERIES as DEVOPS_SERIES, lessonHref, readingHref } from "./lessons";
import { SD_GLOSSARY } from "./sd-glossary";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "./system-design";

export type SearchKind = "Lesson" | "Reading" | "Term";

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

/** Every lesson, reading and glossary term across all series. */
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
    items.push({ kind: "Lesson", series: SD_SERIES.slug, seriesTitle: SD_SERIES.title, title: `Lesson ${l.number}: ${l.title}`, text: `${l.tags.join(" ")} ${l.summary}`, href: sdLessonHref(l) });
  }

  for (const l of DSA_LESSONS.filter((l) => l.published)) {
    items.push({ kind: "Lesson", series: DSA_SERIES.slug, seriesTitle: DSA_SERIES.title, title: `Lesson ${l.number}: ${l.title}`, text: l.summary, href: dsaLessonHref(l) });
  }

  for (const g of [DEVOPS_GLOSSARY, JS_GLOSSARY, SD_GLOSSARY, DSA_GLOSSARY]) items.push(...termItems(g));
  return items;
}
