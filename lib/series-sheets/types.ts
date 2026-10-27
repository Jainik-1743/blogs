/**
 * Cheat sheets: one dense, printable page per series at /cheatsheets/series/<series>.
 * Text fields may use `code` (backticks) and **bold**; nothing else (no HTML, no links).
 * Each section can point at the lesson that teaches it with `lesson` (the number in the URL).
 */
export type CheatBlock =
  /** Bullets: facts, rules, one-liners. */
  | { kind: "points"; items: string[] }
  /** Numbered steps (a procedure, a checklist in order). */
  | { kind: "steps"; items: string[] }
  /** A small table. `mono` lists column indexes drawn in a code font. */
  | { kind: "table"; head: string[]; rows: string[][]; mono?: number[] }
  /** A snippet or command session, with an optional one-line note under it. */
  | { kind: "code"; lang?: string; code: string; note?: string }
  /** Command / term on the left, meaning on the right. Left column is in a code font. */
  | { kind: "pairs"; rows: [string, string][] }
  /** A highlighted tip or warning. */
  | { kind: "callout"; tone: "tip" | "warn"; text: string };

export type CheatSection = {
  title: string;
  /** The lesson (number in the URL) that explains this section. */
  lesson?: number;
  blocks: CheatBlock[];
};

export type CheatSheet = {
  /** One or two sentences: what the sheet covers and who it is for. */
  intro: string;
  sections: CheatSection[];
};

export type CheatSheetData = CheatSheet;
