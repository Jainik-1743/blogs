import type { ExplainerDef, ExplainerData, At, Cell } from "./types.ts";

/** Greedy word wrap used by both the drawing code and the checks, so what passes validation fits on screen. */
export function wrap(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (!cur) cur = w;
    else if ((cur + " " + w).length <= maxChars) cur += " " + w;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Layout numbers for the flow diagram, shared with the component. */
export const FLOW = { W: 720, PADX: 14, TOP: 18, ROW: 104, NODE_H: 62, GAP: 16 };

export function flowGeometry(def: { nodes: { col: number; row: number; span?: number }[] }) {
  const colEnd = Math.max(...def.nodes.map((n) => n.col + (n.span ?? 1)));
  const rowMax = Math.max(...def.nodes.map((n) => n.row));
  const pitch = (FLOW.W - 2 * FLOW.PADX) / colEnd;
  const H = FLOW.TOP * 2 + rowMax * FLOW.ROW + FLOW.NODE_H + 8;
  return { colEnd, rowMax, pitch, H };
}
export const nodeWidth = (pitch: number, span = 1) => pitch * span - FLOW.GAP;
export const labelChars = (w: number) => Math.max(6, Math.floor((w - 14) / 7.6));
export const subChars = (w: number) => Math.max(8, Math.floor((w - 14) / 6.3));

const norm = (a: At): [number, number] => (typeof a === "number" ? [0, a] : a);

export function gridOf(cells: Cell[] | Cell[][]): Cell[][] {
  return Array.isArray(cells[0]) ? (cells as Cell[][]) : [cells as Cell[]];
}

/** Returns a list of problems; empty means the definition is fine. */
export function validateDef(name: string, def: ExplainerDef): string[] {
  const e: string[] = [];
  const err = (m: string) => e.push(`${name}: ${m}`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)+$/.test(name)) err("name must be lowercase words joined by hyphens, starting with the series slug and lesson number, e.g. networking-3-dns");
  if (!def.title || def.title.length > 70) err("title is required and at most 70 characters");
  if (!def.steps || def.steps.length < 3 || def.steps.length > 14) err("needs 3 to 14 steps");
  for (const [i, s] of (def.steps ?? []).entries()) {
    const at = `step ${i + 1}`;
    if (!s.title || s.title.length > 64) err(`${at}: title is required and at most 64 characters`);
    if (!s.note || s.note.length < 25 || s.note.length > 420) err(`${at}: note must be 25 to 420 characters (got ${s.note?.length ?? 0})`);
    if (/[<>`]|\*\*/.test(`${s.title}${s.note}`)) err(`${at}: no HTML, backticks or markdown in title/note (plain text only)`);
  }

  if (def.kind === "flow") {
    if (!def.nodes?.length || def.nodes.length > 12) err("flow needs 1 to 12 nodes");
    const ids = new Set<string>();
    for (const x of [...def.nodes, ...def.edges]) {
      if (!/^[a-z0-9-]+$/.test(x.id)) err(`id "${x.id}" must be lowercase letters, digits, hyphens`);
      if (ids.has(x.id)) err(`duplicate id "${x.id}"`);
      ids.add(x.id);
    }
    const byId = new Map(def.nodes.map((n) => [n.id, n]));
    if (def.nodes.length) {
      const g = flowGeometry(def);
      if (g.colEnd > 6) err(`too wide: ${g.colEnd} columns (max 6)`);
      if (g.rowMax > 5) err(`too tall: ${g.rowMax + 1} rows (max 6)`);
      for (const n of def.nodes) {
        const w = nodeWidth(g.pitch, n.span);
        const l = wrap(n.label, labelChars(w));
        const s = n.sub ? wrap(n.sub, subChars(w)) : [];
        if (l.length > 2) err(`node "${n.id}": label "${n.label}" needs ${l.length} lines in a box this wide (max 2); shorten it or give the node span:2`);
        if (l.length + s.length > 3) err(`node "${n.id}": label + sub need ${l.length + s.length} lines (max 3)`);
        for (const w2 of [...l, ...s]) if (w2.length > Math.max(labelChars(w), subChars(w)) + 1) err(`node "${n.id}": word "${w2}" is too long for the box`);
        for (const m of def.nodes) {
          if (m.id < n.id && m.row === n.row && n.col < m.col + (m.span ?? 1) && m.col < n.col + (n.span ?? 1)) err(`nodes "${n.id}" and "${m.id}" overlap`);
        }
      }
    }
    for (const x of def.edges) {
      if (!byId.has(x.from) || !byId.has(x.to)) err(`edge "${x.id}" refers to a node that does not exist`);
      if (x.from === x.to) err(`edge "${x.id}" goes from a node to itself`);
      if (x.label && x.label.length > 26) err(`edge "${x.id}": label longer than 26 characters`);
      if (x.curve !== undefined && Math.abs(x.curve) > 2) err(`edge "${x.id}": curve must be between -2 and 2`);
    }
    for (const [i, s] of def.steps.entries()) {
      for (const id of [...(s.appear ?? []), ...(s.focus ?? [])]) if (!ids.has(id)) err(`step ${i + 1}: unknown id "${id}"`);
      for (const id of Object.keys(s.set ?? {})) if (!byId.has(id)) err(`step ${i + 1}: set refers to unknown node "${id}"`);
      if (!s.appear?.length && !s.focus?.length && !s.set) err(`step ${i + 1}: needs appear, focus or set so something changes`);
    }
  } else if (def.kind === "array") {
    const g = gridOf(def.cells);
    const R = g.length;
    const C = Math.max(...g.map((r) => r.length));
    if (!R || !C) err("cells is empty");
    if (g.some((r) => r.length !== C)) err("every row of cells must have the same length");
    if (R > 8 || C > 14) err(`cells too large (${R} x ${C}; max 8 rows x 14 columns)`);
    const cellW = Math.min(64, 690 / Math.max(C, 1));
    const fits = (v: Cell) => String(v).length * 6.4 <= cellW * 0.92;
    const check = (cells: Cell[][], at: string) => {
      if (cells.length !== R || cells.some((r) => r.length !== C)) err(`${at}: cells must keep the same shape as the starting cells`);
      for (const r of cells) for (const v of r) if (!fits(v)) err(`${at}: value "${v}" is too long for a cell (${C} columns); use shorter values`);
    };
    check(g, "cells");
    if (def.indexLabels && def.indexLabels.length !== C) err("indexLabels needs one label per column");
    const ok = (a: At) => {
      const [r, c] = norm(a);
      return Number.isInteger(r) && Number.isInteger(c) && r >= 0 && r < R && c >= 0 && c < C;
    };
    for (const [i, s] of def.steps.entries()) {
      if (s.cells) check(gridOf(s.cells), `step ${i + 1}`);
      for (const a of [...(s.mark ?? []), ...(s.done ?? []), ...(s.dim ?? []), ...(s.pointers ?? []).map((p) => p.at)]) if (!ok(a)) err(`step ${i + 1}: position ${JSON.stringify(a)} is outside the cells`);
      for (const p of s.pointers ?? []) if (!p.label || p.label.length > 8) err(`step ${i + 1}: pointer label must be 1 to 8 characters`);
    }
  } else if (def.kind === "trace") {
    if (!def.code?.length || def.code.length > 24) err("trace needs 1 to 24 lines of code");
    for (const [i, l] of (def.code ?? []).entries()) if (l.length > 74) err(`code line ${i + 1} is longer than 74 characters`);
    for (const [i, s] of def.steps.entries()) {
      for (const n of Array.isArray(s.line) ? s.line : [s.line]) if (!Number.isInteger(n) || n < 1 || n > def.code.length) err(`step ${i + 1}: line ${n} is outside the code`);
      for (const [k, v] of s.vars ?? []) if (!k || v.length > 44) err(`step ${i + 1}: variable "${k}" has an empty name or a value longer than 44 characters`);
      if ((s.vars?.length ?? 0) > 10) err(`step ${i + 1}: at most 10 variables`);
    }
  } else if (def.kind === "seq") {
    if (def.actors.length < 2 || def.actors.length > 6) err("seq needs 2 to 6 actors");
    for (const [i, s] of def.steps.entries()) {
      if (!def.actors[s.from] || !def.actors[s.to]) err(`step ${i + 1}: from/to must be actor indexes`);
      if (s.label.length > 40) err(`step ${i + 1}: arrow label longer than 40 characters`);
    }
  } else {
    err(`unknown kind "${(def as { kind?: string }).kind}"`);
  }
  return e;
}

export function validateData(series: string, data: ExplainerData): string[] {
  const out: string[] = [];
  for (const [name, def] of Object.entries(data)) {
    if (!name.startsWith(`${series}-`)) out.push(`${name}: names in data/${series}.ts must start with "${series}-"`);
    out.push(...validateDef(name, def));
  }
  return out;
}
