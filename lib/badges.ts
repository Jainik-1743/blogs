"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { getFirebase } from "./firebase";
import { streakOf, type Progress } from "./progress";

/**
 * Badges are data, not code. Every badge is a document in the Firestore "badges" collection (name,
 * the track it belongs to, what it measures, the number to reach, a picture). Add, change or switch off
 * a badge on the /admin/badges page and it shows up on the site, with no code change. The only thing
 * code must know is how to measure each metric (see METRICS).
 */
export type MetricId = "activeDays" | "lessonsDone" | "streak";

export const METRICS: { id: MetricId; label: string; unit: string }[] = [
  { id: "activeDays", label: "Active days (days with a finished lesson)", unit: "active days" },
  { id: "lessonsDone", label: "Lessons finished", unit: "lessons" },
  { id: "streak", label: "Day streak (days in a row)", unit: "days in a row" },
];

export type Badge = {
  id: string;
  name: string;
  /** Badges with the same track form one ladder, such as "reading". */
  track: string;
  metric: MetricId;
  threshold: number;
  blurb: string;
  /** A site path (/badges/gold.webp), a full URL, or a data: URL saved from the admin page. */
  image: string;
  enabled: boolean;
};

type Counts = Pick<Progress, "done" | "days">;

export function metricValue(metric: MetricId, p: Counts): number {
  if (metric === "lessonsDone") return p.done.length;
  if (metric === "streak") return streakOf(p.days);
  return p.days.length;
}

export const metricUnit = (m: MetricId) => METRICS.find((x) => x.id === m)?.unit ?? "";

const CACHE_KEY = "blogs:badges:v1";
const CACHE_MS = 6 * 60 * 60 * 1000;

function readCache(): Badge[] | null {
  try {
    const v = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null");
    return v && Date.now() - v.at < CACHE_MS && Array.isArray(v.badges) ? v.badges : null;
  } catch {
    return null;
  }
}

export function clearBadgeCache() {
  try { localStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
}

/**
 * Loads the badge list. It is kept on the device for six hours, so a reader costs the database
 * one small read per few hours instead of one per page view. Pass all=true (admin) to include switched-off badges.
 */
export async function loadBadges(all = false): Promise<Badge[]> {
  if (!all) {
    const cached = readCache();
    if (cached) return cached;
  }
  const fb = getFirebase();
  if (!fb) return [];
  const snap = await getDocs(collection(fb.db, "badges"));
  const list = snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Badge, "id">) }))
    .filter((b) => typeof b.name === "string" && typeof b.threshold === "number")
    .sort((a, b) => a.threshold - b.threshold);
  if (!all) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), badges: list.filter((b) => b.enabled !== false) })); } catch { /* ignore */ }
  }
  return all ? list : list.filter((b) => b.enabled !== false);
}

/** The badges for the signed-in reader. Empty until loaded, and empty if none are set up. */
export function useBadges(enabled: boolean): { badges: Badge[]; loading: boolean } {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!enabled) return;
    let live = true;
    loadBadges()
      .then((b) => live && setBadges(b))
      .catch((err) => console.error("Badges could not be loaded:", err))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [enabled]);
  return { badges, loading };
}

export type TrackStatus = {
  track: string;
  title: string;
  ladder: Badge[];
  /** How many badges of the ladder are earned. */
  earned: number;
  current: Badge | null;
  next: Badge | null;
  value: number;
  percent: number;
  remaining: number;
};

const titleOf = (track: string) => `${track.charAt(0).toUpperCase()}${track.slice(1)} badge`;

/** Groups the badges by track and works out, for each, what is earned and how far the reader is from the next one. */
export function tracksOf(badges: Badge[], p: Counts): TrackStatus[] {
  const byTrack = new Map<string, Badge[]>();
  for (const b of badges) byTrack.set(b.track, [...(byTrack.get(b.track) ?? []), b]);
  return Array.from(byTrack, ([track, list]) => {
    const ladder = [...list].sort((a, b) => a.threshold - b.threshold);
    const earnedCount = ladder.filter((b) => metricValue(b.metric, p) >= b.threshold).length;
    const current = earnedCount ? ladder[earnedCount - 1] : null;
    const next = ladder[earnedCount] ?? null;
    const value = next ? metricValue(next.metric, p) : current ? metricValue(current.metric, p) : 0;
    const from = current && next && current.metric === next.metric ? current.threshold : 0;
    const percent = next ? Math.max(0, Math.min(100, Math.round(((value - from) / (next.threshold - from)) * 100))) : 100;
    return { track, title: titleOf(track), ladder, earned: earnedCount, current, next, value, percent, remaining: next ? Math.max(0, next.threshold - value) : 0 };
  });
}

/** The badges that this change of progress just earned, highest first. */
export function newlyEarned(badges: Badge[], before: Counts, after: Counts): Badge[] {
  return badges
    .filter((b) => metricValue(b.metric, after) >= b.threshold && metricValue(b.metric, before) < b.threshold)
    .sort((a, b) => b.threshold - a.threshold);
}
