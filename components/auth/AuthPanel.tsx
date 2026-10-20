"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createUserWithEmailAndPassword, GoogleAuthProvider, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup,
} from "firebase/auth";
import { getFirebase } from "@/lib/firebase";
import { authErrorMessage, checkEmail, checkPassword, safeNext } from "@/lib/accounts";
import { useToast } from "@/components/Toast";
import { useAccount } from "./AuthProvider";
import { Field, GoogleIcon, Notice, inputClass } from "./fields";
import { AuthFormSkeleton } from "@/components/Skeleton";

const button = "w-full rounded-lg bg-sky px-5 py-3 font-semibold text-bg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60";

/**
 * Sign in and sign up with Google, or with just an email and a password. There is no extra form after
 * either: the profile is created automatically on the first sign-in (see AuthProvider). The email and
 * password fields carry the autocomplete attributes that let the browser or a password manager remember them.
 */
export default function AuthPanel({ mode }: { mode: "login" | "signup" }) {
  const { enabled, status } = useAccount();
  const router = useRouter();
  const toast = useToast();
  const next = safeNext(useSearchParams().get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const [message, setMessage] = useState<{ tone: "error" | "info" | "success"; text: string; mismatch?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Signed in: leave this page.
  useEffect(() => {
    if (status === "ready") router.replace(next);
  }, [status, next, router]);

  // One welcome message when a sign-in on this page succeeds.
  const [wasOut, setWasOut] = useState(false);
  useEffect(() => {
    if (status === "out") setWasOut(true);
    if (status === "ready" && wasOut) toast(mode === "signup" ? "Welcome! Your account is ready." : "Welcome back. You are signed in.");
  }, [status, wasOut, mode, toast]);

  const fail = (err: unknown) => {
    console.error("Sign-in failed:", err);
    const text = authErrorMessage(err);
    // Firebase says the same thing for a wrong password and for an account that has no password (for example a
    // Google account), so offer both ways forward instead of leaving the reader stuck.
    const code = (err as { code?: string })?.code ?? "";
    const mismatch = mode === "login" && ["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found"].includes(code) ? code : undefined;
    setMessage({ tone: "error", text, mismatch });
    toast(text, "error");
  };

  if (!enabled) {
    return <Notice tone="info">Accounts are not set up on this copy of the site yet. Reading every lesson still works without one.</Notice>;
  }

  async function google() {
    const fb = getFirebase();
    if (!fb) return;
    setBusy(true);
    setMessage(null);
    try {
      await signInWithPopup(fb.auth, new GoogleAuthProvider());
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  }

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    setMessage(null);
    const e = { email: checkEmail(email), password: resetting ? null : mode === "signup" ? checkPassword(password) : password ? null : "Enter your password." };
    setErrors(e);
    if (e.email || e.password) return;
    const fb = getFirebase();
    if (!fb) return;
    setBusy(true);
    try {
      const addr = email.trim().toLowerCase();
      if (resetting) {
        try {
          await sendPasswordResetEmail(fb.auth, addr);
        } catch (err) {
          if ((err as { code?: string }).code !== "auth/user-not-found") throw err;
        }
        // Same answer whether or not the address has an account, so the form cannot reveal who is registered.
        const text = "If an account exists for that email, a reset link is on its way. Check your inbox, and your spam folder if it is not there in a few minutes.";
        setMessage({ tone: "success", text });
        toast("Reset link sent. Check your email.");
      } else if (mode === "signup") {
        await createUserWithEmailAndPassword(fb.auth, addr, password);
      } else {
        await signInWithEmailAndPassword(fb.auth, addr, password);
      }
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  }

  // Checking the session, or signed in and about to leave this page: show the shape of the form, not text.
  if (status === "loading" || status === "ready") return <AuthFormSkeleton />;

  const isSignup = mode === "signup";
  const other = `${isSignup ? "/login" : "/signup"}${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`;
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="m-0 text-[1.5rem] font-bold text-ink">{resetting ? "Reset your password" : isSignup ? "Create your free account" : "Welcome back"}</h2>
        <p className="mt-1 mb-0 text-[0.92rem] text-ink-dim">
          {resetting ? "Enter your email and we will send you a link to choose a new password." : isSignup ? "Just an email and a password." : "Sign in to see your saved progress."}
        </p>
      </div>

      {!resetting && (
        <>
          <button type="button" onClick={google} disabled={busy} className="flex w-full items-center justify-center gap-3 rounded-lg border border-line bg-bg px-5 py-3 font-semibold text-ink transition hover:border-sky disabled:opacity-60">
            <GoogleIcon /> Continue with Google
          </button>
          <p className="m-0 flex items-center gap-3 text-[0.78rem] uppercase tracking-[0.12em] text-ink-dim before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">or use email</p>
        </>
      )}

      {message && (
        <Notice tone={message.tone}>
          {message.text}
          {message.mismatch && message.mismatch !== "auth/wrong-password" && (
            <> <Link href={`/signup${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold">Sign up</Link></>
          )}
        </Notice>
      )}
      <form onSubmit={submit} noValidate method="post" className="flex flex-col gap-4">
        <Field id="email" label="Email" error={errors.email}>
          <input id="email" type="email" name="email" autoComplete="username" inputMode="email" autoCapitalize="none" spellCheck={false} disabled={busy} value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby="email-msg" className={inputClass} placeholder="you@example.com" />
        </Field>
        {!resetting && (
          <Field id="password" label="Password" error={errors.password} hint={isSignup ? "At least 8 characters." : undefined}>
            <div className="relative">
              <input id="password" type={showPw ? "text" : "password"} name="password" autoComplete={isSignup ? "new-password" : "current-password"} disabled={busy} value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={Boolean(errors.password)} aria-describedby="password-msg" className={`${inputClass} pr-16`} />
              <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute inset-y-0 right-3 text-[0.8rem] font-medium text-ink-dim hover:text-sky" aria-pressed={showPw}>{showPw ? "Hide" : "Show"}</button>
            </div>
          </Field>
        )}
        <button type="submit" disabled={busy} className={button}>
          {busy ? "Please wait…" : resetting ? "Send reset link" : isSignup ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="m-0 flex flex-wrap items-center justify-between gap-2 text-[0.88rem] text-ink-dim">
        {resetting ? (
          <button type="button" onClick={() => { setResetting(false); setMessage(null); }} className="text-sky hover:underline">← Back to sign in</button>
        ) : (
          <>
            <span>{isSignup ? <>Already have an account? <Link href={other}>Sign in</Link></> : <>New here? <Link href={other}>Create an account</Link></>}</span>
            {!isSignup && <button type="button" onClick={() => { setResetting(true); setMessage(null); }} className="text-sky hover:underline">Forgot password?</button>}
          </>
        )}
      </p>
      {!resetting && <p className="m-0 text-[0.8rem] text-ink-dim">By continuing you agree to the <Link href="/privacy" target="_blank">privacy policy</Link>.</p>}
    </div>
  );
}
