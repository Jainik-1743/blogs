"use client";

import { useState, type FormEvent } from "react";
import {
  EmailAuthProvider, GoogleAuthProvider, reauthenticateWithCredential, reauthenticateWithPopup, updatePassword,
} from "firebase/auth";
import { authErrorMessage, checkPassword } from "@/lib/accounts";
import { useToast } from "@/components/Toast";
import { useAccount } from "./AuthProvider";
import { Field, inputClass } from "./fields";

const code = (e: unknown) => (e as { code?: string })?.code ?? "";

/**
 * Which ways of signing in the account has, and a form to change the password for email-and-password accounts.
 * Google accounts have no password: linking one makes Firebase clear the account's "email confirmed" flag, so it is not offered.
 */
export default function SignInMethods() {
  const { user } = useAccount();
  const toast = useToast();
  const [, refresh] = useState(0);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ current?: string | null; next?: string | null }>({});
  if (!user || !user.email) return null;

  const email = user.email;
  const providers = user.providerData.map((p) => p.providerId);
  const hasPassword = providers.includes("password");
  const hasGoogle = providers.includes("google.com");

  /** Firebase asks for a recent sign-in before changing credentials. Google readers confirm with the Google window. */
  async function reconfirm() {
    if (hasGoogle) await reauthenticateWithPopup(user!, new GoogleAuthProvider());
    else throw Object.assign(new Error("needs-current"), { code: "auth/requires-recent-login" });
  }

  async function apply() {
    if (current) await reauthenticateWithCredential(user!, EmailAuthProvider.credential(email, current));
    await updatePassword(user!, next);
  }

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    const e = { next: checkPassword(next), current: hasPassword && !current ? "Enter your current password." : null };
    setErrors(e);
    if (e.next || e.current) return;
    setBusy(true);
    try {
      try {
        await apply();
      } catch (err) {
        // Not recent enough: confirm with Google once, then try again.
        if (code(err) !== "auth/requires-recent-login" || !hasGoogle) throw err;
        await reconfirm();
        await apply();
      }
      await user!.reload();
      toast("Password changed.");
      setCurrent("");
      setNext("");
      refresh((n) => n + 1);
    } catch (err) {
      const c = code(err);
      if (c === "auth/invalid-credential" || c === "auth/wrong-password") setErrors({ current: "That is not your current password." });
      else toast(authErrorMessage(err) || "Nothing was changed.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="signin-methods" className="rounded-2xl border border-line bg-bg-elev p-6 sm:p-7">
      <h2 id="signin-methods" className="m-0 text-[1.1rem] font-bold text-ink">Sign-in methods</h2>
      <p className="mt-1 mb-0 text-[0.88rem] text-ink-dim">The ways this account can sign in.</p>

      <ul className="m-0 mt-5 list-none divide-y divide-line rounded-xl border border-line p-0">
        {[
          { name: "Google", on: hasGoogle, text: hasGoogle ? "Connected" : "Not connected" },
          { name: "Email and password", on: hasPassword, text: hasPassword ? "Set" : "No password yet" },
        ].map((m) => (
          <li key={m.name} className="m-0 flex items-center justify-between gap-3 px-4 py-3 text-[0.92rem]">
            <span className="font-medium text-ink">{m.name}</span>
            <span className={`rounded-full border px-2.5 py-0.5 text-[0.75rem] font-semibold ${m.on ? "border-sky/50 text-sky" : "border-line text-ink-dim"}`}>{m.on ? "✓ " : ""}{m.text}</span>
          </li>
        ))}
      </ul>

      {!hasPassword ? (
        <p className="mt-5 mb-0 max-w-md text-[0.88rem] text-ink-dim">
          You sign in with Google, so there is no password to manage. Just use <strong className="text-ink">Continue with Google</strong> each time.
        </p>
      ) : (
      <form onSubmit={submit} noValidate className="mt-6 flex max-w-md flex-col gap-4">
        <h3 className="m-0 text-[1rem] font-semibold text-ink">Change your password</h3>
        {/* Lets a password manager tie the new password to this email. */}
        <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
        {(
          <Field id="current-password" label="Current password" error={errors.current}>
            <input id="current-password" type="password" autoComplete="current-password" disabled={busy} value={current} onChange={(e) => setCurrent(e.target.value)} aria-describedby="current-password-msg" className={inputClass} />
          </Field>
        )}
        <Field id="new-password" label="New password" error={errors.next} hint="At least 8 characters.">
          <div className="relative">
            <input id="new-password" type={show ? "text" : "password"} autoComplete="new-password" disabled={busy} value={next} onChange={(e) => setNext(e.target.value)} aria-describedby="new-password-msg" className={`${inputClass} pr-16`} />
            <button type="button" onClick={() => setShow((v) => !v)} aria-pressed={show} className="absolute inset-y-0 right-3 text-[0.8rem] font-medium text-ink-dim hover:text-sky">{show ? "Hide" : "Show"}</button>
          </div>
        </Field>
        <button type="submit" disabled={busy} className="self-start rounded-lg bg-sky px-5 py-2.5 font-semibold text-bg transition hover:brightness-110 disabled:opacity-60">{busy ? "Saving…" : "Change password"}</button>
      </form>
      )}
    </section>
  );
}
