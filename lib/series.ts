import type { SeriesNavItem } from "./accents";
import { DSA_SERIES } from "./dsa";
import { IV_SERIES } from "./iv";
import { JS_SERIES } from "./javascript";
import { SERIES as DEVOPS_SERIES } from "./lessons";
import { SD_SERIES } from "./system-design";

/** Every series, in the order the home page and footer list them. */
export const ALL_SERIES: SeriesNavItem[] = [
  ...[DEVOPS_SERIES, JS_SERIES, SD_SERIES, DSA_SERIES].map(({ slug, title, accent }) => ({ slug, title, accent })),
  ...IV_SERIES.map(({ slug, short, accent }) => ({ slug, title: short, accent })),
];

/** Short names for the four original series (the others carry their own `short` name in lib/iv.ts). */
export const SERIES_SHORT: Record<string, string> = {
  devops: "DevOps",
  javascript: "JavaScript Core",
  "system-design": "System Design",
  dsa: "DSA",
};

/**
 * How the series are grouped on the home page and in the footer. Every series must appear in
 * exactly one group; the build fails otherwise (see groupedSeries in lib/registry.ts).
 */
export const SERIES_GROUPS: { id: string; title: string; blurb: string; slugs: string[] }[] = [
  {
    id: "foundations",
    title: "Programming foundations",
    blurb: "Learn the building blocks from zero, with every example traced or run.",
    slugs: ["dsa", "javascript", "javascript-2", "typescript", "sql-postgres", "git-github", "cs-foundations", "testing"],
  },
  {
    id: "systems",
    title: "Backend, systems and DevOps",
    blurb: "How real systems are built, scaled, deployed and kept running.",
    slugs: ["devops", "system-design", "design-cases", "backend", "browser", "low-level-design"],
  },
  {
    id: "interview",
    title: "Interview prep",
    blurb: "Questions with model answers, debugging scenarios and design problems.",
    slugs: ["fullstack-qa", "frontend-depth", "debugging", "design-problems", "ai-engineering"],
  },
  {
    id: "career",
    title: "Career and leadership",
    blurb: "Resumes, study plans, and the thinking of a team lead.",
    slugs: ["career", "team-lead"],
  },
];
