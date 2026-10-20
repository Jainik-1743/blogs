"use client";

import { useMemo, useSyncExternalStore } from "react";
import { isSitePath } from "./accounts";

/**
 * Reading progress, for signed-in readers only. It is cached in this browser (localStorage) so the page is instant,
 * and copied to the reader's account (see ProgressSync).
 * It records which lessons were finished, the days the reader studied (for streaks and badges), a small
 * per-day log (lessons and topics, for the activity grid), and the lesson to read next.
 * Nothing is sent anywhere, and every function is safe when storage is blocked.
 */

const KEY = "blogs:progress";
const EVENT = "blogs:progress";

export type NextLesson = { path: string; title: string };
/** What happened on one day: how many lessons were finished and the topics they covered. */
export type DayLog = { n: number; tags: string[] };
export type Progress = { done: string[]; days: string[]; next: NextLesson | null; log: Record<string, DayLog> };

const EMPTY: Progress = { done: [], days: [], next: null, log: {} };

/** About a year of daily history is kept. */
const LOG_DAYS = 400;

/** Local calendar date as YYYY-MM-DD, so a streak follows the reader's own midnight. */
export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * Progress belongs to signed-in readers. AuthProvider switches this on when someone is signed in and off when
 * nobody is. While it is off, every reader of progress sees an empty record and markDone does nothing, so a
 * visitor who is not signed in cannot collect lessons, streaks or badges.
 */
let enabled = false;

export function setProgressEnabled(on: boolean) {
  if (enabled === on) return;
  enabled = on;
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

/** What is actually stored on this device, whether or not progress is switched on. */
function readStored(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

/** What the rest of the app may see: the stored copy for a signed-in reader, nothing otherwise. */
function readRaw(): string {
  return enabled ? readStored() : "";
}

/** Forgets this device's copy (called on sign-out, so the next person on a shared computer does not inherit it). */
export function clearLocalProgress() {
  try {
    localStorage.removeItem(KEY);
    for (const k of Object.keys(localStorage)) if (k.startsWith("blogs:read-seconds:")) localStorage.removeItem(k);
  } catch {
    /* storage blocked: nothing to clear */
  }
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

function cleanLog(v: unknown): Record<string, DayLog> {
  const out: Record<string, DayLog> = {};
  if (v && typeof v === "object") {
    for (const [date, d] of Object.entries(v as Record<string, { n?: unknown; tags?: unknown }>)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(date) && d && typeof d.n === "number") {
        out[date] = { n: d.n, tags: Array.isArray(d.tags) ? d.tags.filter((t): t is string => typeof t === "string").slice(0, 12) : [] };
      }
    }
  }
  return out;
}

function parse(raw: string): Progress {
  try {
    const v = JSON.parse(raw);
    return {
      done: Array.isArray(v?.done) ? v.done.filter((x: unknown) => typeof x === "string") : [],
      days: Array.isArray(v?.days) ? v.days.filter((x: unknown) => typeof x === "string") : [],
      next: v?.next && isSitePath(v.next.path) && typeof v.next.title === "string" ? v.next : null,
      log: cleanLog(v?.log),
    };
  } catch {
    return EMPTY;
  }
}

/** Replaces the saved progress (used when the copy from the reader's account is merged in). */
export function replaceProgress(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* storage blocked or full */
  }
}

/** The two copies of progress (this device and the account) combined: nothing finished is ever lost. */
export function mergeProgress(a: Progress, b: Progress): Progress {
  const uniq = (x: string[], y: string[], cap: number) => Array.from(new Set([...x, ...y])).slice(-cap);
  return {
    done: uniq(a.done, b.done, 1000),
    days: uniq(a.days, b.days, 800).sort(),
    next: a.next ?? b.next,
    log: mergeLogs(a.log, b.log),
  };
}

/** Per day, keep the larger lesson count and every topic seen on either side. */
function mergeLogs(a: Record<string, DayLog>, b: Record<string, DayLog>): Record<string, DayLog> {
  const out: Record<string, DayLog> = {};
  for (const date of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[date];
    const y = b[date];
    out[date] = { n: Math.max(x?.n ?? 0, y?.n ?? 0), tags: Array.from(new Set([...(x?.tags ?? []), ...(y?.tags ?? [])])).slice(0, 12) };
  }
  const keep = Object.keys(out).sort().slice(-LOG_DAYS);
  return Object.fromEntries(keep.map((d) => [d, out[d]]));
}

/** Reads what is stored on this device right now (used to merge it into the account on sign-in). */
export const readProgress = (): Progress => parse(readStored());

/** Records a finished lesson, today's study day, and the lesson to offer next. Returns the progress before and after, so badges can be compared. */
export function markDone(path: string, next?: NextLesson | null, tags: string[] = []): { before: Progress; after: Progress } {
  // Not signed in: nothing is recorded.
  if (!enabled) return { before: EMPTY, after: EMPTY };
  const p = parse(readStored());
  const before: Progress = { done: [...p.done], days: [...p.days], next: p.next, log: { ...p.log } };
  if (!p.done.includes(path)) p.done.push(path);
  const today = dayKey();
  const firstTimeToday = !p.days.includes(today);
  if (firstTimeToday) p.days.push(today);
  p.days = p.days.slice(-LOG_DAYS);
  // Count the lesson once; finishing the same lesson again does not add to the day.
  if (!before.done.includes(path)) {
    const day = p.log[today] ?? { n: 0, tags: [] };
    p.log = { ...p.log, [today]: { n: day.n + 1, tags: Array.from(new Set([...day.tags, ...tags])).slice(0, 12) } };
  } else if (!p.log[today]) {
    p.log = { ...p.log, [today]: { n: 1, tags } };
  }
  p.log = mergeLogs(p.log, {});
  p.next = next ?? null;
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* storage blocked or full: progress is simply not saved */
  }
  return { before, after: p };
}

/** Consecutive study days ending today, or yesterday (so the streak is not lost before the reader opens a lesson today). */
export function streakOf(days: string[]): number {
  const set = new Set(days);
  const d = new Date();
  if (!set.has(dayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(dayKey(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** Live progress. On the server and during hydration it is empty, then fills in on the client. */
export function useProgress(): Progress & { ready: boolean } {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  return useMemo(() => (raw === null ? { ...EMPTY, ready: false } : { ...parse(raw), ready: true }), [raw]);
}
