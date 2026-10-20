/** Rules for deciding when a lesson counts as read. Kept free of React so they are easy to test. */

/** "12 min" becomes 12. Returns 0 when the text has no number. */
export function minutesOf(readTime: string | undefined | null): number {
  const n = parseInt(readTime ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Words read per minute, the same figure the reading-progress bar uses to estimate time. */
export const WORDS_PER_MINUTE = 220;

/**
 * A lesson completes by itself only when the reader has been actively reading for the lesson's
 * stated time AND has reached the end of the page. (Clicking "Mark as complete" skips both.)
 */
export function readingComplete(p: { seconds: number; minutes: number; reachedEnd: boolean }): boolean {
  return p.minutes > 0 && p.reachedEnd && p.seconds >= p.minutes * 60;
}

/** How many seconds count as "active" after the last scroll, key press, click or touch. */
export const IDLE_LIMIT_MS = 60_000;
