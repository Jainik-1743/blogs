import type { CheatSheet } from "./types";
import { validateSheet } from "./validate";
import { SHEET as s0 } from "./data/devops";
import { SHEET as s1 } from "./data/javascript";
import { SHEET as s2 } from "./data/system-design";
import { SHEET as s3 } from "./data/dsa";
import { SHEET as s4 } from "./data/ai-engineering";
import { SHEET as s5 } from "./data/api-design";
import { SHEET as s6 } from "./data/backend";
import { SHEET as s7 } from "./data/behavioral-interview";
import { SHEET as s8 } from "./data/browser";
import { SHEET as s9 } from "./data/career";
import { SHEET as s10 } from "./data/cs-foundations";
import { SHEET as s11 } from "./data/debugging";
import { SHEET as s12 } from "./data/design-cases";
import { SHEET as s13 } from "./data/design-problems";
import { SHEET as s14 } from "./data/docker-kubernetes";
import { SHEET as s15 } from "./data/frontend-depth";
import { SHEET as s16 } from "./data/fullstack-qa";
import { SHEET as s17 } from "./data/git-github";
import { SHEET as s18 } from "./data/javascript-2";
import { SHEET as s19 } from "./data/linux-shell";
import { SHEET as s20 } from "./data/low-level-design";
import { SHEET as s21 } from "./data/networking";
import { SHEET as s22 } from "./data/nextjs";
import { SHEET as s23 } from "./data/nodejs";
import { SHEET as s24 } from "./data/observability";
import { SHEET as s25 } from "./data/react";
import { SHEET as s26 } from "./data/security";
import { SHEET as s27 } from "./data/sql-postgres";
import { SHEET as s28 } from "./data/team-lead";
import { SHEET as s29 } from "./data/testing";
import { SHEET as s30 } from "./data/typescript";

const FILES: [string, CheatSheet | null][] = [
  ["devops", s0],
  ["javascript", s1],
  ["system-design", s2],
  ["dsa", s3],
  ["ai-engineering", s4],
  ["api-design", s5],
  ["backend", s6],
  ["behavioral-interview", s7],
  ["browser", s8],
  ["career", s9],
  ["cs-foundations", s10],
  ["debugging", s11],
  ["design-cases", s12],
  ["design-problems", s13],
  ["docker-kubernetes", s14],
  ["frontend-depth", s15],
  ["fullstack-qa", s16],
  ["git-github", s17],
  ["javascript-2", s18],
  ["linux-shell", s19],
  ["low-level-design", s20],
  ["networking", s21],
  ["nextjs", s22],
  ["nodejs", s23],
  ["observability", s24],
  ["react", s25],
  ["security", s26],
  ["sql-postgres", s27],
  ["team-lead", s28],
  ["testing", s29],
  ["typescript", s30],
];

const dev = process.env.NODE_ENV === "development";

/** Cheat sheets by series slug (only series that have one). A bad sheet fails the production build; in dev it is skipped with a warning. */
export const SERIES_SHEETS: Record<string, CheatSheet> = {};
const problems: string[] = [];
for (const [series, sheet] of FILES) {
  if (!sheet) continue;
  const own = validateSheet(series, sheet);
  if (own.length) {
    problems.push(...own);
    if (dev) continue;
  }
  SERIES_SHEETS[series] = sheet;
}
if (problems.length) {
  if (dev) console.warn(`[series-sheets] skipped ${problems.length} problem(s):\n${problems.join("\n")}`);
  else throw new Error(`Cheat sheet problems:\n${problems.join("\n")}`);
}
