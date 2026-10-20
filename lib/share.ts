import type { Badge } from "./badges";

/**
 * The words a reader sends when they share a badge or a streak. There are a few warm frames; the badge's own
 * description (from the database) fills in what is special about it, so a new badge needs no new code here.
 * A badge can also carry its own wording in its "share" field, which replaces the first frame.
 */
export const FRAME_COUNT = 3;

type BadgeInfo = { badge: Pick<Badge, "name" | "blurb" | "share">; value: number; unit: string; url: string };

const fill = (tpl: string, v: Record<string, string>) => tpl.replace(/\{(\w+)\}/g, (_, k: string) => v[k] ?? "");

/** Message for an earned badge. `frame` picks one of the wordings (0, 1, 2 ...). */
export function badgeMessage({ badge, value, unit, url }: BadgeInfo, frame = 0): string {
  const vars = { badge: badge.name, value: String(value), unit, blurb: badge.blurb ?? "", url };
  if (frame === 0 && badge.share?.trim()) return fill(badge.share, vars).trim();
  const blurb = badge.blurb ? `${badge.blurb}\n` : "";
  switch (frame % FRAME_COUNT) {
    case 1:
      return `✨ Quiet progress, loud results.\nI just earned the ${badge.name} badge on blogs after ${value} ${unit}.\n${blurb}If I can build this habit, so can you. Come learn with me, it is free.\n${url}`;
    case 2:
      return `🌟 A small milestone I am proud of: the ${badge.name} badge, ${value} ${unit}.\nEvery lesson was a step, every day a promise I kept.\n${blurb}Join me. It costs nothing but a little curiosity.\n${url}`;
    default:
      return `🏅 ${badge.name} badge unlocked.\n${value} ${unit} of showing up, one lesson at a time.\n${blurb}Small steps. Steady fire. 🔥\nLearn alongside me, free: ${url}`;
  }
}

/** Message for a day streak. */
export function streakMessage({ days, url }: { days: number; url: string }, frame = 0): string {
  const d = `${days}-day`;
  switch (frame % FRAME_COUNT) {
    case 1:
      return `✨ ${d} learning streak, and still going.\nNo big leaps. Just one lesson, then another, then another.\nIf you have been meaning to start, this is your sign. It is free.\n${url}`;
    case 2:
      return `🌟 ${days} days in a row of learning something new.\nThe flame is small but it does not go out.\nCome keep it burning with me: ${url}`;
    default:
      return `🔥 ${d} learning streak.\nOne lesson a day, kept alive by showing up.\nSmall steps. Steady fire.\nStart yours, free: ${url}`;
  }
}

export const subjectFor = (text: string) => text.split("\n")[0].replace(/^[^\p{L}\p{N}]+/u, "").slice(0, 80);
