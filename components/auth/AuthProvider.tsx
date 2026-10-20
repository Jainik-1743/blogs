"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { onAuthStateChanged, signOut as fbSignOut, updateProfile as updateAuthProfile, type User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { accountsEnabled, getFirebase } from "@/lib/firebase";
import type { Profile } from "@/lib/accounts";

/** "loading": asking Firebase who is signed in. "out": nobody. "ready": signed in, and the profile exists. */
type Status = "loading" | "out" | "ready";

type Ctx = {
  enabled: boolean;
  status: Status;
  user: User | null;
  profile: Profile | null;
  /** Set when the profile could not be saved or read (for example the Firestore rules are not deployed). */
  profileError: string | null;
  signOut: () => Promise<void>;
  updateProfile: (input: Pick<Profile, "name" | "experience" | "goal" | "emailUpdates">) => Promise<void>;
};

const AuthContext = createContext<Ctx | null>(null);

export const useAccount = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAccount must be used inside <AuthProvider>");
  return ctx;
};

/** Best available name: the Google name, then the start of the email address. The reader can change it on the account page. */
function nameFor(u: User): string {
  const n = u.displayName?.trim() || (u.email ?? "").split("@")[0] || "Reader";
  return n.slice(0, 60);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>(accountsEnabled ? "loading" : "out");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    const fb = getFirebase();
    if (!fb) return;
    return onAuthStateChanged(fb.auth, async (u) => {
      setUser(u);
      setProfileError(null);
      if (!u) {
        setProfile(null);
        setStatus("out");
        return;
      }
      const ref = doc(fb.db, "users", u.uid);
      // Make sure Firestore is holding this reader's current token before the first request.
      await u.getIdToken().catch(() => undefined);
      let step = "read";
      try {
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProfile(snap.data() as Profile);
        } else {
          // First sign-in: create the profile from what we already know. No extra form.
          step = "create";
          const created: Profile = { name: nameFor(u), email: (u.email ?? "").toLowerCase(), emailUpdates: false };
          await setDoc(ref, { ...created, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
          setProfile(created);
        }
      } catch (err) {
        console.error(`Profile ${step} failed for uid ${u.uid}:`, err);
        setProfileError(`${step}: ${(err as { code?: string }).code ?? "unknown"}`);
        setProfile({ name: nameFor(u), email: (u.email ?? "").toLowerCase(), emailUpdates: false });
      }
      setStatus("ready");
    });
  }, []);

  const signOut = useCallback(async () => {
    const fb = getFirebase();
    if (fb) await fbSignOut(fb.auth);
  }, []);

  const updateProfile = useCallback<Ctx["updateProfile"]>(async (input) => {
    const fb = getFirebase();
    const u = fb?.auth.currentUser;
    if (!fb || !u || !profile) throw new Error("Not signed in");
    const name = input.name.trim();
    await updateDoc(doc(fb.db, "users", u.uid), {
      name,
      experience: input.experience ?? "",
      goal: input.goal ?? "",
      emailUpdates: input.emailUpdates,
      updatedAt: serverTimestamp(),
    });
    void updateAuthProfile(u, { displayName: name }).catch(() => undefined);
    setProfile({ ...profile, ...input, name });
  }, [profile]);

  const value = useMemo<Ctx>(
    () => ({ enabled: accountsEnabled, status, user, profile, profileError, signOut, updateProfile }),
    [status, user, profile, profileError, signOut, updateProfile],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
