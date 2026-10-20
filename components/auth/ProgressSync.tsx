"use client";

import { useEffect, useRef } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { clearLocalProgress, mergeProgress, readProgress, replaceProgress, useProgress, type Progress } from "@/lib/progress";
import { useAccount } from "./AuthProvider";

/** How long to wait after the last change before saving, so a burst of changes becomes one write. */
const SAVE_DELAY_MS = 4000;

const OWNER_KEY = "blogs:progress-owner";

/** Progress kept on this device belongs to whoever last synced it. Anyone else signing in starts from their own account. */
function claimDevice(uid: string) {
  try {
    if (localStorage.getItem(OWNER_KEY) !== uid) clearLocalProgress();
    localStorage.setItem(OWNER_KEY, uid);
  } catch { /* storage blocked: nothing is kept on this device anyway */ }
}

const signature = (p: Progress) => JSON.stringify([p.done, p.days, p.next?.path ?? "", p.log]);

/**
 * Keeps one record per reader (progress/{uid}) in step with this device. On sign-in the two copies are
 * merged, so nothing finished on either side is lost; after that, changes are saved in one batched
 * write. This is also where badges persist across devices. Renders nothing.
 */
export default function ProgressSync() {
  const { status, user } = useAccount();
  const local = useProgress();
  const saved = useRef("");
  const ready = useRef<string | null>(null);

  async function save(uid: string, p: Progress) {
    const fb = getFirebase();
    if (!fb) return;
    const sig = signature(p);
    if (sig === saved.current) return;
    try {
      await setDoc(doc(fb.db, "progress", uid), { done: p.done, days: p.days, next: p.next, log: p.log, updatedAt: serverTimestamp() });
      saved.current = sig;
    } catch (err) {
      console.error("Progress could not be saved:", err);
    }
  }

  // On sign-in: merge the account's copy with this device's copy.
  useEffect(() => {
    const fb = getFirebase();
    if (status !== "ready" || !user || !fb || ready.current === user.uid) return;
    const uid = user.uid;
    claimDevice(uid);
    (async () => {
      try {
        const snap = await getDoc(doc(fb.db, "progress", uid));
        const remote: Progress = snap.exists()
          ? { done: snap.data().done ?? [], days: snap.data().days ?? [], next: snap.data().next ?? null, log: snap.data().log ?? {} }
          : { done: [], days: [], next: null, log: {} };
        if (snap.exists()) saved.current = signature(remote);
        const merged = mergeProgress(readProgress(), remote);
        if (signature(merged) !== signature(readProgress())) replaceProgress(merged);
        ready.current = uid;
        await save(uid, merged);
      } catch (err) {
        console.error("Progress could not be loaded:", err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, user]);

  // After that: save changes, a few seconds after the last one.
  useEffect(() => {
    if (!user || ready.current !== user.uid) return;
    const t = window.setTimeout(() => void save(user.uid, { done: local.done, days: local.days, next: local.next, log: local.log }), SAVE_DELAY_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local.done, local.days, local.next, local.log, user]);

  // Signing out forgets which account was synced.
  useEffect(() => {
    if (status === "out") {
      ready.current = null;
      saved.current = "";
    }
  }, [status]);

  return null;
}
