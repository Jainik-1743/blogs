/**
 * Checks every cheat sheet and reports which series still lack one.
 *   node --experimental-strip-types scripts/check-series-sheets.mts            (all series)
 *   node --experimental-strip-types scripts/check-series-sheets.mts git-github  (some series)
 * Exit code 1 when anything is wrong.
 */
import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { validateSheet } from "../lib/series-sheets/validate.ts";

const root = process.cwd();
const dir = join(root, "lib/series-sheets/data");
const all = readdirSync(dir).filter((f) => f.endsWith(".ts")).map((f) => f.slice(0, -3)).sort();
const want = process.argv.slice(2);
const series = want.length ? want : all;

const lessonNumbers = (s: string): Set<number> => {
  const out = new Set<number>();
  const md = join(root, "content", s);
  if (existsSync(md)) for (const f of readdirSync(md)) if (/^\d+\.md$/.test(f)) out.add(Number(f.slice(0, -3)));
  else {
    /* handled below */
  }
  if (!existsSync(md)) for (const d of readdirSync(join(root, "app", "(learn)", s))) if (/^lesson-\d+$/.test(d)) out.add(Number(d.slice(7)));
  return out;
};

let bad = 0;
let done = 0;
for (const s of series) {
  if (!all.includes(s)) {
    console.log(`✗ unknown series "${s}"`);
    bad++;
    continue;
  }
  const { SHEET } = await import(join(dir, `${s}.ts`));
  if (!SHEET) {
    console.log(`… ${s}: no cheat sheet yet`);
    continue;
  }
  const problems = validateSheet(s, SHEET);
  const have = lessonNumbers(s);
  const linked = new Set<number>();
  for (const sec of SHEET.sections) {
    if (sec.lesson !== undefined) {
      linked.add(sec.lesson);
      if (!have.has(sec.lesson)) problems.push(`${s}: section "${sec.title}" links to lesson ${sec.lesson}, which does not exist`);
    }
  }
  const cover = [...have].filter((n) => !linked.has(n)).sort((a, b) => a - b);
  // A sheet has at most 16 cards, so a big series cannot link every lesson: ask for half the lessons, but never more than 12.
  const need = Math.min(12, Math.ceil(have.size / 2));
  if (linked.size < need) problems.push(`${s}: only ${linked.size} of ${have.size} lessons are referenced (need at least ${need}; missing ${cover.join(", ")}); cover the whole series`);
  bad += problems.length;
  done++;
  console.log(`${problems.length ? "✗" : "✓"} ${s}: ${SHEET.sections.length} cards, links ${linked.size}/${have.size} lessons`);
  for (const p of problems) console.log(`    ${p}`);
}
console.log(`\n${done}/${series.length} sheets written; ${bad} problem(s)`);
process.exit(bad ? 1 : 0);
