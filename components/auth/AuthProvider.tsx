"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { onAuthStateChanged, sendEmailVerification, signOut as fbSignOut, updateProfile as updateAuthProfile, type User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { accountsEnabled, getFirebase } from "@/lib/firebase";
import { isConfirmedSession, type Profile } from "@/lib/accounts";
import { clearLocalProgress, setProgressEnabled } from "@/lib/progress";

/**
 * "loading": asking Firebase who is signed in. "out": nobody.
 * "unverified": signed in with an email and password but the email is not confirmed yet. Treated like nobody for
 *   everything except the verify-email page: no profile, no progress, and the database refuses them too.
 * "ready": signed in with a confirmed email, and the profile exists. (Google accounts arrive already confirmed.)
 */
type Status = "loading" | "out" | "unverified" | "ready";

type Ctx = {
  enabled: boolean;
  status: Status;
  user: User | null;
  profile: Profile | null;
  /** Set when the profile could not be saved or read (for example the Firestore rules are not deployed). */
  profileError: string | null;
  signOut: () => Promise<void>;
  updateProfile: (input: Pick<Profile, "name" | "experience" | "goal" | "emailUpdates">) => Promise<void>;
  /** Emails the confirmation link to the signed-in, unverified reader. */
  sendVerification: () => Promise<void>;
  /** Asks Firebase again whether the email has been confirmed, and lets the reader in if it has. Resolves to true when it has. */
  checkVerified: () => Promise<boolean>;
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
  const hadUser = useRef(false);

  /** Works out what a signed-in (or signed-out) person may see: verification first, then their profile. */
  const load = useCallback(async (u: User | null) => {
    const fb = getFirebase();
    if (!fb) return;
    setUser(u);
    setProfileError(null);
    // Google confirms the email itself, so a session that came through Google is confirmed even if the stored flag was
    // cleared (linking a password to a Google account does that). Email-and-password sessions must confirm their email.
    const claims = u ? await u.getIdTokenResult().catch(() => null) : null;
    const verified = Boolean(u && isConfirmedSession({ emailVerified: u.emailVerified, signInProvider: claims?.signInProvider }));
    // Progress, streaks and badges exist only for a signed-in reader whose email is confirmed.
    setProgressEnabled(verified);
    if (!u && hadUser.current) clearLocalProgress(); // signed out: do not leave their data on this device
    hadUser.current = Boolean(u);
    if (!u) {
      setProfile(null);
      setStatus("out");
      return;
    }
    if (!verified) {
      setProfile(null);
      setStatus("unverified");
      return;
    }
    const ref = doc(fb.db, "users", u.uid);
    // Make sure Firestore is holding this reader's current token (with the confirmed-email claim) before the first request.
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
  }, []);

  useEffect(() => {
    const fb = getFirebase();
    if (!fb) return;
    return onAuthStateChanged(fb.auth, (u) => void load(u));
  }, [load]);

  const sendVerification = useCallback(async () => {
    const u = getFirebase()?.auth.currentUser;
    if (!u) throw new Error("Not signed in");
    await sendEmailVerification(u);
  }, []);

  const checkVerified = useCallback(async () => {
    const u = getFirebase()?.auth.currentUser;
    if (!u) return false;
    await u.reload();
    if (!u.emailVerified) return false;
    await u.getIdToken(true); // pick up the confirmed-email claim before the database is used
    await load(u);
    return true;
  }, [load]);

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
    () => ({ enabled: accountsEnabled, status, user, profile, profileError, signOut, updateProfile, sendVerification, checkVerified }),
    [status, user, profile, profileError, signOut, updateProfile, sendVerification, checkVerified],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
