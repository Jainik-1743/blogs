"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { FieldPath, deleteField, doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { isSitePath } from "@/lib/accounts";
import { MAX_NOTES, MAX_NOTE_CHARS, noteKey, type Note } from "@/lib/notes";
import { useAccount } from "./AuthProvider";

type Ctx = {
  /** The reader's notes, newest first. */
  items: Note[];
  /** True once the notes have been loaded (or there is nothing to load). */
  ready: boolean;
  /** Starts loading the notes. Safe to call many times; the database is read once per visit. */
  load: () => void;
  get: (path: string) => Note | undefined;
  /** Saves the note for a lesson (an empty text removes it). Throws if the database refuses. */
  save: (n: Omit<Note, "at">) => Promise<void>;
  remove: (path: string) => Promise<void>;
};

const NotesContext = createContext<Ctx | null>(null);

export const useNotes = () => {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotes must be used inside <NotesProvider>");
  return ctx;
};

/** Holds the reader's notes in memory. Nothing is read until a note box or the notes page asks for it. */
export default function NotesProvider({ children }: { children: ReactNode }) {
  const { status, user } = useAccount();
  const [map, setMap] = useState<Record<string, Note>>({});
  const [ready, setReady] = useState(false);
  const [wanted, setWanted] = useState(false);
  const loadedFor = useRef<string | null>(null);

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
    getDoc(doc(fb.db, "notes", user.uid))
      .then((snap) => {
        const items = (snap.data()?.items ?? {}) as Record<string, Note>;
        setMap(Object.fromEntries(Object.entries(items).filter(([, n]) => isSitePath(n?.path) && typeof n.text === "string" && typeof n.title === "string")));
      })
      .catch((err) => {
        loadedFor.current = null;
        console.error("Notes could not be loaded:", err);
      })
      .finally(() => setReady(true));
  }, [wanted, status, user]);

  const save = useCallback<Ctx["save"]>(async (n) => {
    const fb = getFirebase();
    const u = fb?.auth.currentUser;
    if (!fb || !u) throw new Error("Not signed in");
    const key = noteKey(n.path);
    const text = n.text.trim().slice(0, MAX_NOTE_CHARS);
    const ref = doc(fb.db, "notes", u.uid);
    if (!text) {
      if (!map[key]) return;
      await updateDoc(ref, new FieldPath("items", key), deleteField(), "updatedAt", serverTimestamp());
      setMap(({ [key]: _gone, ...rest }) => { void _gone; return rest; });
      return;
    }
    if (!map[key] && Object.keys(map).length >= MAX_NOTES) throw Object.assign(new Error("Note limit reached"), { code: "notes/limit" });
    const note: Note = { path: n.path, title: n.title, series: n.series, text, at: Date.now() };
    await setDoc(ref, { items: { [key]: note }, updatedAt: serverTimestamp() }, { merge: true });
    setMap((m) => ({ ...m, [key]: note }));
  }, [map]);

  const remove = useCallback<Ctx["remove"]>(async (path) => {
    const fb = getFirebase();
    const u = fb?.auth.currentUser;
    if (!fb || !u) throw new Error("Not signed in");
    const key = noteKey(path);
    await updateDoc(doc(fb.db, "notes", u.uid), new FieldPath("items", key), deleteField(), "updatedAt", serverTimestamp());
    setMap(({ [key]: _gone, ...rest }) => { void _gone; return rest; });
  }, []);

  const value = useMemo<Ctx>(
    () => ({ items: Object.values(map).sort((a, b) => b.at - a.at), ready, load, get: (p) => map[noteKey(p)], save, remove }),
    [map, ready, load, save, remove],
  );
  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}
