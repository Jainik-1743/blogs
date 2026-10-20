/** A line on a cheat sheet: the thing to type or remember, and what it does. */
export type Row = readonly [code: string, meaning: string];

export type Section = { title: string; rows: Row[]; note?: string };

export type SheetGroup = "Tools" | "Languages" | "Front end" | "Back end and data" | "Systems and cloud" | "Computer science";

export type Sheet = {
  slug: string;
  title: string;
  /** Two to four characters shown on the card, such as "git" or "SQL". */
  badge: string;
  group: SheetGroup;
  /** One of the site's accent names (see data-accent in globals.css). */
  accent: string;
  /** One sentence: who this sheet is for and what it covers. */
  blurb: string;
  sections: Section[];
  /** Two or three short things worth remembering that do not fit in a table. */
  tips: string[];
  /** Lesson series that teach this topic in full: [label, path]. */
  learn: readonly [label: string, href: string][];
};
