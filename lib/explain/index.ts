import type { ExplainerDef } from "./types";
import { validateData } from "./validate";
import { DATA as d0 } from "./data/devops";
import { DATA as d1 } from "./data/javascript";
import { DATA as d2 } from "./data/system-design";
import { DATA as d3 } from "./data/dsa";
import { DATA as d4 } from "./data/ai-engineering";
import { DATA as d5 } from "./data/api-design";
import { DATA as d6 } from "./data/backend";
import { DATA as d7 } from "./data/behavioral-interview";
import { DATA as d8 } from "./data/browser";
import { DATA as d9 } from "./data/career";
import { DATA as d10 } from "./data/cs-foundations";
import { DATA as d11 } from "./data/debugging";
import { DATA as d12 } from "./data/design-cases";
import { DATA as d13 } from "./data/design-problems";
import { DATA as d14 } from "./data/docker-kubernetes";
import { DATA as d15 } from "./data/frontend-depth";
import { DATA as d16 } from "./data/fullstack-qa";
import { DATA as d17 } from "./data/git-github";
import { DATA as d18 } from "./data/javascript-2";
import { DATA as d19 } from "./data/linux-shell";
import { DATA as d20 } from "./data/low-level-design";
import { DATA as d21 } from "./data/networking";
import { DATA as d22 } from "./data/nextjs";
import { DATA as d23 } from "./data/nodejs";
import { DATA as d24 } from "./data/observability";
import { DATA as d25 } from "./data/react";
import { DATA as d26 } from "./data/security";
import { DATA as d27 } from "./data/sql-postgres";
import { DATA as d28 } from "./data/team-lead";
import { DATA as d29 } from "./data/testing";
import { DATA as d30 } from "./data/typescript";

const FILES: [string, Record<string, ExplainerDef>][] = [
  ["devops", d0],
  ["javascript", d1],
  ["system-design", d2],
  ["dsa", d3],
  ["ai-engineering", d4],
  ["api-design", d5],
  ["backend", d6],
  ["behavioral-interview", d7],
  ["browser", d8],
  ["career", d9],
  ["cs-foundations", d10],
  ["debugging", d11],
  ["design-cases", d12],
  ["design-problems", d13],
  ["docker-kubernetes", d14],
  ["frontend-depth", d15],
  ["fullstack-qa", d16],
  ["git-github", d17],
  ["javascript-2", d18],
  ["linux-shell", d19],
  ["low-level-design", d20],
  ["networking", d21],
  ["nextjs", d22],
  ["nodejs", d23],
  ["observability", d24],
  ["react", d25],
  ["security", d26],
  ["sql-postgres", d27],
  ["team-lead", d28],
  ["testing", d29],
  ["typescript", d30],
];

/** Every explainer by name. A bad definition or a duplicate name fails the build, so nothing broken can ship. */
export const EXPLAINERS: Record<string, ExplainerDef> = {};
const problems: string[] = [];
for (const [series, data] of FILES) {
  problems.push(...validateData(series, data));
  for (const [name, def] of Object.entries(data)) {
    if (EXPLAINERS[name]) problems.push(`${name}: defined twice`);
    EXPLAINERS[name] = def;
  }
}
if (problems.length) throw new Error(`Explainer problems:\n${problems.join("\n")}`);
