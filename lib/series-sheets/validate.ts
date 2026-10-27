import type { CheatBlock, CheatSheet } from "./types.ts";

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

function blockText(b: CheatBlock): string {
  switch (b.kind) {
    case "points":
    case "steps":
      return b.items.join(" ");
    case "table":
      return [...b.head, ...b.rows.flat()].join(" ");
    case "code":
      return `${b.code} ${b.note ?? ""}`;
    case "pairs":
      return b.rows.flat().join(" ");
    case "callout":
      return b.text;
  }
}

/** Returns a list of problems; empty means the sheet is fine. */
export function validateSheet(series: string, sheet: CheatSheet): string[] {
  const e: string[] = [];
  const err = (m: string) => e.push(`${series}: ${m}`);
  const plain = (t: string, at: string, max: number) => {
    if (!t || !t.trim()) err(`${at}: empty text`);
    if (t.length > max) err(`${at}: longer than ${max} characters ("${t.slice(0, 40)}...")`);
    if (/<[a-z/][^>]*>|\[[^\]]+\]\(/i.test(t)) err(`${at}: no HTML or markdown links ("${t.slice(0, 40)}...")`);
    if ((t.match(/`/g) ?? []).length % 2) err(`${at}: unbalanced backtick ("${t.slice(0, 40)}...")`);
    if (/plain english|simple english/i.test(t)) err(`${at}: do not use the phrase "plain/simple English"`);
  };
  plain(sheet.intro, "intro", 320);
  if (sheet.sections.length < 8 || sheet.sections.length > 16) err(`needs 8 to 16 sections (has ${sheet.sections.length})`);
  let total = 0;
  const titles = new Set<string>();
  for (const [i, s] of sheet.sections.entries()) {
    const at = `section ${i + 1} "${s.title}"`;
    plain(s.title, `${at} title`, 56);
    if (titles.has(s.title)) err(`${at}: duplicate title`);
    titles.add(s.title);
    if (s.lesson !== undefined && (!Number.isInteger(s.lesson) || s.lesson < 0)) err(`${at}: lesson must be a lesson number`);
    if (!s.blocks.length || s.blocks.length > 4) err(`${at}: needs 1 to 4 blocks`);
    for (const [j, b] of s.blocks.entries()) {
      const bt = `${at} block ${j + 1} (${b.kind})`;
      total += words(blockText(b));
      if (b.kind === "points" || b.kind === "steps") {
        if (b.items.length < 2 || b.items.length > 10) err(`${bt}: needs 2 to 10 items`);
        for (const it of b.items) plain(it, bt, 210);
      } else if (b.kind === "table") {
        if (b.head.length < 2 || b.head.length > 4) err(`${bt}: 2 to 4 columns`);
        if (b.rows.length < 2 || b.rows.length > 14) err(`${bt}: 2 to 14 rows`);
        for (const r of b.rows) {
          if (r.length !== b.head.length) err(`${bt}: every row needs ${b.head.length} cells ("${r[0]}")`);
          for (const c of r) plain(c, bt, 100);
        }
        for (const h of b.head) plain(h, bt, 30);
        for (const m of b.mono ?? []) if (!Number.isInteger(m) || m < 0 || m >= b.head.length) err(`${bt}: mono column ${m} does not exist`);
      } else if (b.kind === "code") {
        const lines = b.code.split("\n");
        if (lines.length > 16) err(`${bt}: code longer than 16 lines`);
        for (const l of lines) if (l.length > 58) err(`${bt}: code line longer than 58 characters ("${l.slice(0, 30)}...")`);
        if (b.note) plain(b.note, bt, 160);
      } else if (b.kind === "pairs") {
        if (b.rows.length < 2 || b.rows.length > 14) err(`${bt}: 2 to 14 rows`);
        for (const [k, v] of b.rows) {
          if (k.length > 40) err(`${bt}: left cell longer than 40 characters ("${k}")`);
          plain(v, bt, 120);
        }
      } else if (b.kind === "callout") {
        plain(b.text, bt, 220);
      } else {
        err(`${bt}: unknown block kind`);
      }
    }
  }
  if (total < 450) err(`too thin: ${total} words (aim for 550 to 1100)`);
  if (total > 1500) err(`too long to print on two pages: ${total} words (max 1500)`);
  return e;
}
