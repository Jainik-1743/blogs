/**
 * Checks every explainer definition and reports which lessons still lack one.
 *   node --experimental-strip-types scripts/check-explainers.mts            (all series)
 *   node --experimental-strip-types scripts/check-explainers.mts networking  (one or more series)
 * Exit code 1 when anything is wrong. Needs no build: it only reads lib/explain/data/*.ts, content/ and app/.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { validateData } from "../lib/explain/validate.ts";

const root = process.cwd();
const dataDir = join(root, "lib/explain/data");
const all = readdirSync(dataDir).filter((f) => f.endsWith(".ts")).map((f) => f.slice(0, -3)).sort();
const want = process.argv.slice(2);
const series = want.length ? want : all;

let bad = 0;
let totalLessons = 0;
let totalCovered = 0;
const names = new Map<string, string>();

for (const s of all) {
  const { DATA } = await import(join(dataDir, `${s}.ts`));
  for (const n of Object.keys(DATA)) {
    if (names.has(n)) {
      console.log(`✗ ${n}: defined in both ${names.get(n)} and ${s}`);
      bad++;
    }
    names.set(n, s);
  }
}

for (const s of series) {
  if (!all.includes(s)) {
    console.log(`✗ unknown series "${s}"`);
    bad++;
    continue;
  }
  const { DATA } = await import(join(dataDir, `${s}.ts`));
  const problems = validateData(s, DATA);

  // Which lessons exist, and which names does each lesson embed?
  const lessons = new Map<number, string[]>();
  const mdDir = join(root, "content", s);
  if (existsSync(mdDir)) {
    for (const f of readdirSync(mdDir).filter((f) => /^\d+\.md$/.test(f))) {
      const n = Number(f.slice(0, -3));
      const src = readFileSync(join(mdDir, f), "utf8");
      lessons.set(n, [...src.matchAll(/```explainer[^\n]*\n([^\n]+)\n```/g)].map((m) => m[1].trim()));
    }
  } else {
    const appDir = join(root, "app", "(learn)", s);
    for (const d of readdirSync(appDir).filter((d) => /^lesson-\d+$/.test(d))) {
      const n = Number(d.slice(7));
      const src = readFileSync(join(appDir, d, "page.tsx"), "utf8");
      lessons.set(n, [...src.matchAll(/<Explainer\s+name="([^"]+)"/g)].map((m) => m[1]));
    }
  }

  const used = new Set<string>();
  const missing: number[] = [];
  for (const [n, refs] of [...lessons].sort((a, b) => a[0] - b[0])) {
    if (!refs.length) missing.push(n);
    for (const r of refs) {
      used.add(r);
      if (!DATA[r] && r !== "circuit-breaker" && !names.has(r)) problems.push(`lesson ${n} embeds "${r}", which is not defined`);
      if (DATA[r] && !r.startsWith(`${s}-${n}-`) && r !== `${s}-${n}`) problems.push(`lesson ${n} embeds "${r}": names must start with "${s}-${n}-"`);
    }
  }
  for (const n of Object.keys(DATA)) if (!used.has(n)) problems.push(`"${n}" is defined but no lesson embeds it`);

  totalLessons += lessons.size;
  totalCovered += lessons.size - missing.length;
  bad += problems.length;
  const status = problems.length ? "✗" : missing.length ? "…" : "✓";
  console.log(`${status} ${s}: ${lessons.size - missing.length}/${lessons.size} lessons have an explainer, ${Object.keys(DATA).length} defined${missing.length ? `, missing: ${missing.join(", ")}` : ""}`);
  for (const p of problems) console.log(`    ${p}`);
}
console.log(`\n${totalCovered}/${totalLessons} lessons covered across ${series.length} series; ${bad} problem(s)`);
process.exit(bad ? 1 : 0);
