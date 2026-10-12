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
    slugs: ["dsa", "javascript", "javascript-2", "typescript", "sql-postgres", "git-github", "cs-foundations", "testing", "security", "react", "nextjs", "linux-shell", "networking"],
  },
  {
    id: "systems",
    title: "Backend, systems and DevOps",
    blurb: "How real systems are built, scaled, deployed and kept running.",
    slugs: ["devops", "system-design", "design-cases", "backend", "browser", "low-level-design", "api-design", "nodejs", "docker-kubernetes", "observability"],
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
    slugs: ["career", "team-lead", "behavioral-interview"],
  },
];

/** For the "Keep learning" block under every lesson: the series that go best with this one. */
export const RELATED_SERIES: Record<string, string[]> = {
  dsa: ["cs-foundations", "career", "javascript"],
  javascript: ["javascript-2", "typescript", "dsa"],
  "javascript-2": ["javascript", "typescript", "testing"],
  typescript: ["javascript-2", "frontend-depth", "fullstack-qa"],
  "sql-postgres": ["backend", "system-design", "fullstack-qa"],
  "git-github": ["team-lead", "devops", "testing"],
  "cs-foundations": ["dsa", "system-design", "javascript-2"],
  testing: ["debugging", "backend", "frontend-depth"],
  devops: ["system-design", "backend", "git-github"],
  "system-design": ["design-cases", "design-problems", "backend"],
  "design-cases": ["system-design", "design-problems", "devops"],
  backend: ["security", "sql-postgres", "system-design"],
  browser: ["security", "frontend-depth", "backend"],
  "low-level-design": ["dsa", "design-problems", "typescript"],
  "fullstack-qa": ["frontend-depth", "backend", "typescript"],
  "frontend-depth": ["fullstack-qa", "browser", "typescript"],
  debugging: ["testing", "backend", "browser"],
  "design-problems": ["system-design", "design-cases", "low-level-design"],
  "ai-engineering": ["fullstack-qa", "backend", "testing"],
  career: ["dsa", "fullstack-qa", "team-lead"],
  "team-lead": ["career", "git-github", "fullstack-qa"],
  security: ["browser", "backend", "testing"],
  "api-design": ["backend", "security", "system-design"],
  "react": ["typescript", "frontend-depth", "fullstack-qa"],
  "nodejs": ["backend", "javascript-2", "security"],
  "nextjs": ["react", "typescript", "security"],
  "docker-kubernetes": ["devops", "system-design", "nodejs"],
  "behavioral-interview": ["career", "team-lead", "fullstack-qa"],
  "linux-shell": ["devops", "git-github", "nodejs"],
  "networking": ["system-design", "devops", "browser"],
  "observability": ["devops", "backend", "debugging"],
};
