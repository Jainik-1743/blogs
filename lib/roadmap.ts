import { SERIES_LIST } from "./registry";
import type { AccentName } from "./accents";

/**
 * The site-wide roadmap: a line of steps from the basics to interviews, each with the series that
 * belong beside it. Every slug is checked against the registry, so a renamed or removed series
 * fails the build instead of leaving a dead card. Edit the order here.
 */
type StageDef = { title: string; spine: string; left: string[]; right: string[] };

const STAGES: StageDef[] = [
  { title: "Computer Basics", spine: "cs-foundations", left: ["git-github", "linux-shell"], right: ["networking", "dsa"] },
  { title: "JavaScript", spine: "javascript", left: ["javascript-2", "typescript"], right: ["browser"] },
  { title: "Frontend", spine: "react", left: ["nextjs", "frontend-depth"], right: ["testing"] },
  { title: "Backend", spine: "nodejs", left: ["api-design", "backend"], right: ["sql-postgres", "security"] },
  { title: "System Design", spine: "system-design", left: ["design-cases", "low-level-design"], right: ["design-problems"] },
  { title: "Cloud and Operations", spine: "devops", left: ["docker-kubernetes", "observability"], right: ["debugging"] },
  { title: "AI Engineering", spine: "ai-engineering", left: [], right: [] },
  { title: "Interviews and Career", spine: "career", left: ["behavioral-interview", "team-lead"], right: ["fullstack-qa"] },
];

export type RoadmapCard = { slug: string; label: string; href: string; lessons: number; accent: AccentName };
export type RoadmapStage = { step: number; title: string; spine: RoadmapCard; left: RoadmapCard[]; right: RoadmapCard[]; accent: AccentName };

function card(slug: string): RoadmapCard {
  const s = SERIES_LIST.find((x) => x.slug === slug);
  if (!s) throw new Error(`Roadmap lists series "${slug}", which is not registered`);
  return { slug, label: s.short, href: `/${slug}`, lessons: s.lessons.filter((l) => l.published).length, accent: s.accent };
}

export const ROADMAP: RoadmapStage[] = STAGES.map((s, i) => {
  const spine = card(s.spine);
  return { step: i + 1, title: s.title, spine, left: s.left.map(card), right: s.right.map(card), accent: spine.accent };
});

export const ROADMAP_SERIES_COUNT = ROADMAP.reduce((n, s) => n + 1 + s.left.length + s.right.length, 0);
export const ROADMAP_LESSON_COUNT = ROADMAP.reduce((n, s) => n + [s.spine, ...s.left, ...s.right].reduce((m, c) => m + c.lessons, 0), 0);
