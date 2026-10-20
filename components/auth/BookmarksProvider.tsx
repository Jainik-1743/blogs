"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { FieldPath, deleteField, doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { useAccount } from "./AuthProvider";

export type Bookmark = { path: string; title: string; series: string; at: number };

type Ctx = {
  /** Saved pages, newest first. */
  items: Bookmark[];
  /** True once the reader's list has been loaded (or there is nothing to load). */
  ready: boolean;
  has: (path: string) => boolean;
  /** Saves the page, or removes it if it is already saved. Resolves to true when it is now saved. Throws if the database refuses. */
  toggle: (b: Omit<Bookmark, "at">) => Promise<boolean>;
};

const BookmarksContext = createContext<Ctx | null>(null);

export const useBookmarks = () => {
  const ctx = useContext(BookmarksContext);
  if (!ctx) throw new Error("useBookmarks must be used inside <BookmarksProvider>");
  return ctx;
};

/** Firestore field names cannot contain "/", so /dsa/lesson-49 is stored as dsa~lesson-49. */
const keyOf = (path: string) => path.replace(/^\/+|\/+$/g, "").replace(/\//g, "~");

/**
 * One record per reader (bookmarks/{uid}) holding every saved page in a map. The list is read once
 * after sign-in, and each save or removal is a single small write. Nothing is loaded for visitors
 * who are not signed in.
 */
export default function BookmarksProvider({ children }: { children: ReactNode }) {
  const { status, user } = useAccount();
  const [map, setMap] = useState<Record<string, Bookmark>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fb = getFirebase();
    if (status === "out") {
      setMap({});
      setReady(true);
      return;
    }
    if (status !== "ready" || !user || !fb) return;
    let live = true;
    getDoc(doc(fb.db, "bookmarks", user.uid))
      .then((snap) => {
        if (!live) return;
        const items = (snap.data()?.items ?? {}) as Record<string, Bookmark>;
        setMap(items);
      })
      .catch((err) => console.error("Bookmarks could not be loaded:", err))
      .finally(() => live && setReady(true));
    return () => { live = false; };
  }, [status, user]);

  const toggle = useCallback<Ctx["toggle"]>(async (b) => {
    const fb = getFirebase();
    const u = fb?.auth.currentUser;
    if (!fb || !u) throw new Error("Not signed in");
    const key = keyOf(b.path);
    const ref = doc(fb.db, "bookmarks", u.uid);
    const saved = Boolean(map[key]);
    const before = map;

    // Update the screen first so the button feels instant, then undo if the save fails.
    if (saved) {
      const { [key]: _removed, ...rest } = map;
      void _removed;
      setMap(rest);
    } else {
      setMap({ ...map, [key]: { ...b, at: Date.now() } });
    }
    try {
      if (saved) {
        // FieldPath, not "items.<key>": the key has "-" and "~", which a dotted string path does not allow.
        await updateDoc(ref, new FieldPath("items", key), deleteField(), "updatedAt", serverTimestamp());
      } else {
        await setDoc(ref, { items: { [key]: { ...b, at: Date.now() } }, updatedAt: serverTimestamp() }, { merge: true });
      }
    } catch (err) {
      setMap(before);
      throw err;
    }
    return !saved;
  }, [map]);

  const value = useMemo<Ctx>(
    () => ({
      items: Object.values(map).sort((a, b) => b.at - a.at),
      ready,
      has: (path) => Boolean(map[keyOf(path)]),
      toggle,
    }),
    [map, ready, toggle],
  );
  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>;
}
