import { SERIES_LIST } from "./registry";
import type { AccentName } from "./accents";

/**
 * The site-wide roadmap: eight steps from the basics to interviews, each with the series that belong
 * to it in reading order. Every slug is checked against the registry, so a renamed or removed series
 * fails the build instead of leaving a dead card. Edit the order here.
 */
type StageDef = { title: string; series: string[] };

const STAGES: StageDef[] = [
  { title: "Computer Basics", series: ["cs-foundations", "linux-shell", "git-github", "networking", "dsa"] },
  { title: "JavaScript", series: ["javascript", "javascript-2", "typescript", "browser"] },
  { title: "Frontend", series: ["react", "nextjs", "frontend-depth", "testing"] },
  { title: "Backend", series: ["nodejs", "api-design", "sql-postgres", "backend", "security"] },
  { title: "System Design", series: ["system-design", "design-cases", "low-level-design", "design-problems"] },
  { title: "Cloud and Operations", series: ["devops", "docker-kubernetes", "observability", "debugging"] },
  { title: "AI Engineering", series: ["ai-engineering"] },
  { title: "Interviews and Career", series: ["career", "behavioral-interview", "team-lead", "fullstack-qa"] },
];

/** One clickable box: a series (overview) or a lesson (detailed view). */
export type Cell = { label: string; sub?: string; href: string; accent: AccentName };

/** One row of the map. A "phase" is a plain heading; a "node" is a centre box with boxes on both sides. */
export type Block =
  | { kind: "phase"; title: string; accent: AccentName; step: number }
  | { kind: "node"; title: string; sub: string; eyebrow?: string; accent: AccentName; left: Cell[]; right: Cell[] };

type Series = { slug: string; label: string; href: string; accent: AccentName; lessons: { number: number; title: string; href: string }[] };

function series(slug: string): Series {
  const s = SERIES_LIST.find((x) => x.slug === slug);
  if (!s) throw new Error(`Roadmap lists series "${slug}", which is not registered`);
  return {
    slug, label: s.short, href: `/${slug}`, accent: s.accent,
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
export function detailedBlocks(): Block[] {
  const out: Block[] = [];
  for (const st of STAGE_DATA) {
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
