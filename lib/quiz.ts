import { noteKey } from "@/lib/notes";
import { DSA_QUIZZES } from "@/lib/quizzes/dsa";

/**
 * Lesson quizzes and the daily review.
 *
 * The questions are static files in the code, so they cost nothing to serve. Only a reader's wrong answers are stored,
 * in one record per reader (reviews/{uid}), and only for signed-in readers: a question the reader got wrong comes back
 * after 1, 3, 7 and then 14 days, and leaves the queue after one more right answer. Right answers the reader never missed
 * are not stored at all, so a reader who knows the lesson causes no database writes.
 */
export type Question = {
  q: string;
  /** Code shown under the question, when the question is about a snippet. */
  code?: string;
  options: string[];
  /** Index of the correct option. */
  answer: number;
  /** One or two sentences shown after answering. */
  why: string;
};

/** A question waiting for review. `b` is how many reviews it has passed; `d` is the day it is due (days since 1970). */
export type ReviewItem = { p: string; b: number; d: number };

/** Days to wait after the 1st, 2nd, 3rd and 4th right answer in a row. */
export const INTERVAL_DAYS = [1, 3, 7, 14] as const;
export const MAX_REVIEW_ITEMS = 400;

const QUIZZES: Record<string, Question[]> = { ...DSA_QUIZZES };

export const quizFor = (path: string): Question[] | undefined => QUIZZES[path.replace(/\/$/, "")];

export const questionId = (path: string, index: number) => `${noteKey(path)}~q${index + 1}`;

/** Finds a question from its stored id, or undefined when the lesson's quiz has changed since. */
export function questionById(id: string, item: ReviewItem): Question | undefined {
  const i = Number(id.split("~q").pop()) - 1;
  return QUIZZES[item.p]?.[i];
}

export const epochDay = (d = new Date()) => Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000);

/**
 * What happens to a question after an answer. Returns the new item, null to remove it from the queue, or undefined for
 * "nothing to store" (a right answer to a question that was never missed).
 */
export function afterAnswer(path: string, existing: ReviewItem | undefined, correct: boolean, today: number): ReviewItem | null | undefined {
  if (!correct) return { p: path, b: 0, d: today + INTERVAL_DAYS[0] };
  if (!existing) return undefined;
  const b = existing.b + 1;
  return b >= INTERVAL_DAYS.length ? null : { p: path, b, d: today + INTERVAL_DAYS[b] };
}
