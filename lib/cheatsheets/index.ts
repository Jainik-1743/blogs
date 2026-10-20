import { BACKEND } from "./backend";
import { SYSTEMS } from "./systems";
import { TOOLS } from "./tools";
import type { Sheet, SheetGroup } from "./types";
import { WEB } from "./web";

export type { Row, Section, Sheet, SheetGroup } from "./types";

export const SHEETS: Sheet[] = [...TOOLS, ...WEB, ...BACKEND, ...SYSTEMS];

/** The order the groups appear on the cheat sheet page. */
export const GROUPS: SheetGroup[] = ["Languages", "Front end", "Back end and data", "Tools", "Systems and cloud", "Computer science"];

export const sheetBySlug = (slug: string) => SHEETS.find((s) => s.slug === slug);
export const sheetPath = (slug: string) => `/cheatsheets/${slug}`;
export const rowCount = (s: Sheet) => s.sections.reduce((n, x) => n + x.rows.length, 0);

const slugs = new Set<string>();
for (const s of SHEETS) {
  if (slugs.has(s.slug)) throw new Error(`Duplicate cheat sheet slug: ${s.slug}`);
  slugs.add(s.slug);
}
