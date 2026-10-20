import { SERIES_LIST } from "./registry";
import type { AccentName } from "./accents";

import { STAGES, stageSlug } from "./roadmap-stages";

/** One clickable box: a series (overview) or a lesson (detailed view). */
export type Cell = { label: string; sub?: string; href: string; accent: AccentName };

/** One row of the map. A "phase" is a plain heading; a "node" is a centre box with boxes on both sides. */
export type Block =
  | { kind: "phase"; title: string; accent: AccentName; step: number }
  | { kind: "node"; title: string; sub: string; eyebrow?: string; accent: AccentName; left: Cell[]; right: Cell[] };

type Series = { slug: string; label: string; tagline: string; href: string; accent: AccentName; lessons: { number: number; title: string; href: string }[] };

function series(slug: string): Series {
  const s = SERIES_LIST.find((x) => x.slug === slug);
  if (!s) throw new Error(`Roadmap lists series "${slug}", which is not registered`);
  return {
    slug, label: s.short, tagline: s.tagline, href: `/${slug}`, accent: s.accent,
    lessons: s.lessons.filter((l) => l.published).map((l) => ({ number: l.number, title: l.title, href: s.href(l) })),
  };
}

const STAGE_DATA = STAGES.map((st, i) => ({ step: i + 1, title: st.title, series: st.series.map(series) }));
const lessonsOf = (list: Series[]) => list.reduce((n, s) => n + s.lessons.length, 0);

export const ROADMAP_SERIES_COUNT = STAGE_DATA.reduce((n, s) => n + s.series.length, 0);
export const ROADMAP_LESSON_COUNT = STAGE_DATA.reduce((n, s) => n + lessonsOf(s.series), 0);

const cardOf = (s: Series): Cell => ({ label: s.label, sub: `${s.lessons.length} lessons`, href: s.href, accent: s.accent });

/** Overview: one centre box per step, with that step's series split across both sides. */
export function overviewBlocks(): Block[] {
  return STAGE_DATA.map((st) => ({
    kind: "node",
    title: st.title,
    eyebrow: `Step ${st.step}`,
    sub: `${st.series.length} ${st.series.length === 1 ? "series" : "series"}, ${lessonsOf(st.series)} lessons`,
    accent: st.series[0].accent,
    left: st.series.filter((_, i) => i % 2 === 0).map(cardOf),
    right: st.series.filter((_, i) => i % 2 === 1).map(cardOf),
  }));
}

/** Detailed: a heading per step, then each series as a centre box with its lessons on both sides. */
export function detailedBlocks(only?: string): Block[] {
  const out: Block[] = [];
  for (const st of STAGE_DATA.filter((x) => !only || stageSlug(x.title) === only)) {
    out.push({ kind: "phase", title: st.title, accent: st.series[0].accent, step: st.step });
    for (const s of st.series) {
      const half = Math.ceil(s.lessons.length / 2);
      const cell = (l: Series["lessons"][number]): Cell => ({ label: l.title, sub: `Lesson ${l.number}`, href: l.href, accent: s.accent });
      out.push({
        kind: "node", title: s.label, sub: `${s.lessons.length} lessons`, accent: s.accent,
        left: s.lessons.slice(0, half).map(cell), right: s.lessons.slice(half).map(cell),
      });
    }
  }
  return out;
}

export type PathSeries = Series;
export type PathStage = { step: number; slug: string; title: string; level: string; blurb: string; series: Series[]; lessonCount: number };

/** The roadmap as plain data for the step-by-step page. */
export function pathStages(): PathStage[] {
  return STAGES.map((st, i) => {
    const list = STAGE_DATA[i].series;
    return { step: i + 1, slug: stageSlug(st.title), title: st.title, level: st.level, blurb: st.blurb, series: list, lessonCount: lessonsOf(list) };
  });
}
