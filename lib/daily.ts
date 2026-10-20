import { SERIES_LIST } from "./registry";

/** Series whose opening lessons make a good "lesson of the day": short, beginner friendly, spread over many topics. */
const SLUGS = ["dsa", "javascript", "git-github", "sql-postgres", "react", "system-design", "typescript", "linux-shell", "networking", "devops", "testing", "cs-foundations", "nodejs", "security"];
const PER_SERIES = 4;

export type DailyPick = { path: string; title: string; series: string; readTime: string };

/** A small, fixed list. The browser picks one by the date, so the choice changes every day without a server. */
export function dailyPicks(): DailyPick[] {
  const picks: DailyPick[] = [];
  for (let i = 0; i < PER_SERIES; i++) {
    for (const slug of SLUGS) {
      const s = SERIES_LIST.find((x) => x.slug === slug);
      const l = s?.lessons.filter((x) => x.published)[i];
      if (s && l) picks.push({ path: s.href(l), title: l.title, series: s.short, readTime: l.readTime ?? "10 min" });
    }
  }
  return picks;
}
