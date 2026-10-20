"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { deleteField, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { MAX_REVIEW_ITEMS, afterAnswer, epochDay, type ReviewItem } from "@/lib/quiz";
import { useAccount } from "./AuthProvider";

export type Answer = { id: string; path: string; correct: boolean };

type Ctx = {
  /** Questions in the queue, due soonest first. */
  items: { id: string; item: ReviewItem }[];
  /** Questions due today or earlier. */
  due: { id: string; item: ReviewItem }[];
  ready: boolean;
  load: () => void;
  /** Saves a batch of answers in one write. Nothing is written when no answer changes the queue. */
  record: (answers: Answer[]) => Promise<void>;
};

const ReviewContext = createContext<Ctx | null>(null);

export const useReview = () => {
  const ctx = useContext(ReviewContext);
  if (!ctx) throw new Error("useReview must be used inside <ReviewProvider>");
  return ctx;
};

/**
 * The reader's review queue, kept in the database (reviews/{uid}) and nowhere else. It is read once per visit, the
 * first time a quiz or the review page asks for it, and written once per batch of answers.
 */
export default function ReviewProvider({ children }: { children: ReactNode }) {
  const { status, user } = useAccount();
  const [map, setMap] = useState<Record<string, ReviewItem>>({});
  const [ready, setReady] = useState(false);
  const [wanted, setWanted] = useState(false);
  const loadedFor = useRef<string | null>(null);
  const latest = useRef(map);
  latest.current = map;

  const load = useCallback(() => setWanted(true), []);

  useEffect(() => {
    if (status === "out") {
      setMap({});
      setWanted(false);
      setReady(true);
      loadedFor.current = null;
    }
  }, [status]);

  useEffect(() => {
    const fb = getFirebase();
    if (!wanted || status !== "ready" || !user || !fb || loadedFor.current === user.uid) return;
    loadedFor.current = user.uid;
    getDoc(doc(fb.db, "reviews", user.uid))
      .then((snap) => {
        const items = (snap.data()?.items ?? {}) as Record<string, ReviewItem>;
        setMap(Object.fromEntries(Object.entries(items).filter(([, v]) => typeof v?.p === "string" && Number.isInteger(v.b) && Number.isInteger(v.d))));
      })
      .catch((err) => {
        loadedFor.current = null;
        console.error("Review queue could not be loaded:", err);
      })
      .finally(() => setReady(true));
  }, [wanted, status, user]);

  const record = useCallback<Ctx["record"]>(async (answers) => {
    const fb = getFirebase();
    const u = fb?.auth.currentUser;
    if (!fb || !u) return;
    const today = epochDay();
    const next = { ...latest.current };
    const patch: Record<string, ReviewItem | ReturnType<typeof deleteField>> = {};
    for (const a of answers) {
      const result = afterAnswer(a.path, next[a.id], a.correct, today);
      if (result === undefined) continue;
      if (result === null) {
        delete next[a.id];
        patch[a.id] = deleteField();
      } else {
        if (!next[a.id] && Object.keys(next).length >= MAX_REVIEW_ITEMS) continue;
        next[a.id] = result;
        patch[a.id] = result;
      }
    }
    if (Object.keys(patch).length === 0) return;
    await setDoc(doc(fb.db, "reviews", u.uid), { items: patch, updatedAt: serverTimestamp() }, { merge: true });
    setMap(next);
  }, []);

  const value = useMemo<Ctx>(() => {
    const today = epochDay();
    const items = Object.entries(map).map(([id, item]) => ({ id, item })).sort((a, b) => a.item.d - b.item.d);
    return { items, due: items.filter((x) => x.item.d <= today), ready, load, record };
  }, [map, ready, load, record]);
  return <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>;
}
