import { dayKey, type DayLog } from "./progress";

/** The longest run of consecutive study days in the whole history. */
export function longestStreak(days: string[]): number {
  const sorted = Array.from(new Set(days)).sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const d of sorted) {
    const cur = new Date(`${d}T00:00:00`);
    run = prev && Math.round((cur.getTime() - prev.getTime()) / 86400000) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = cur;
  }
  return best;
}

export type TagShare = { tag: string; days: number; percent: number };

/** Topics ranked by the number of reading days they appeared on. The percent is of all reading days. */
export function topTags(log: Record<string, DayLog>, totalDays: number, limit = 6): TagShare[] {
  const counts = new Map<string, number>();
  for (const day of Object.values(log)) for (const t of new Set(day.tags)) counts.set(t, (counts.get(t) ?? 0) + 1);
  return Array.from(counts, ([tag, days]) => ({ tag, days, percent: totalDays ? Math.round((days / totalDays) * 100) : 0 }))
    .sort((a, b) => b.days - a.days || a.tag.localeCompare(b.tag))
    .slice(0, limit);
}

export type Cell = { date: string; n: number; future: boolean };

/**
 * The activity grid: one column per week (Monday first), seven rows. A day listed as a study day but missing
 * from the log (older progress) counts as one lesson.
 */
export function heatmap(log: Record<string, DayLog>, days: string[], weeks = 26) {
  const studied = new Set(days);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - (weeks - 1) * 7);

  const columns: Cell[][] = [];
  const months: { label: string; col: number }[] = [];
  let lastMonth = -1;
  let total = 0;
  for (let w = 0; w < weeks; w++) {
    const col: Cell[] = [];
    for (let r = 0; r < 7; r++) {
      const d = new Date(start);
      d.setDate(start.getDate() + w * 7 + r);
      const date = dayKey(d);
      const n = log[date]?.n ?? (studied.has(date) ? 1 : 0);
      total += n;
      col.push({ date, n, future: d > today });
    }
    const m = new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7).getMonth();
    if (m !== lastMonth) {
      months.push({ label: new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7).toLocaleString("en", { month: "short" }), col: w });
      lastMonth = m;
    }
    columns.push(col);
  }
  // A month that starts in the last column or two of the first week would sit on top of the next label.
  if (months.length > 1 && months[1].col - months[0].col < 3) months.shift();
  return { columns, months, total };
}
