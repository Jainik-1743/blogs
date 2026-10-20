import { dayKey, type Progress } from "./progress";

const TAGS = ["JavaScript", "Caching", "APIs", "Security", "Databases", "React"];

/**
 * Made-up progress for the account-page preview (/account?preview=120): that many study days in a row ending
 * today. It only changes what the page shows. It is never saved, and it never reaches the reader's real record.
 */
export function previewProgress(days: number): Progress {
  const n = Math.max(0, Math.min(2000, Math.floor(days)));
  const dates: string[] = [];
  const log: Progress["log"] = {};
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    dates.push(key);
    // Vary the lessons per day and the topics, so the activity grid and topic bars look lived-in.
    log[key] = { n: 1 + ((i * 7) % 4), tags: [TAGS[i % TAGS.length], TAGS[(i * 3 + 1) % TAGS.length]] };
  }
  const done = Object.values(log).reduce((sum, d) => sum + d.n, 0);
  return { done: Array.from({ length: done }, (_, i) => `/preview/lesson-${i + 1}`), days: dates, next: null, log };
}
