"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authErrorMessage, safeNext } from "@/lib/accounts";
import { useToast } from "@/components/Toast";
import { useAccount } from "./AuthProvider";
import { AuthFormSkeleton } from "@/components/Skeleton";

const COOLDOWN_S = 60;

/** The look of the page, with no sign-in logic, so it can be shown on its own. */
export function VerifyEmailCard({
  email, sent, cooldown, busy, onSend, onCheck, onDifferent,
}: { email: string; sent: boolean; cooldown: number; busy: boolean; onSend: () => void; onCheck: () => void; onDifferent: () => void }) {
  return (
    <div className="flex flex-col gap-5">
      <span aria-hidden="true" className="grid h-14 w-14 place-items-center rounded-2xl bg-sky-soft text-sky ring-1 ring-sky/30">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM3 7l9 6 9-6" /></svg>
      </span>
      <div>
        <h1 className="m-0 text-[1.6rem] font-bold tracking-tight text-ink">Confirm your email</h1>
        <p className="mt-2 mb-0 text-ink-dim">
          {sent ? <>We sent a confirmation link to <strong className="text-ink">{email}</strong>. Open it, then come back here.</> : <>Your email <strong className="text-ink">{email}</strong> is not confirmed yet. Send yourself a link and open it to continue.</>}
        </p>
        <p className="mt-2 mb-0 text-[0.88rem] text-ink-dim">This keeps accounts safe: only the owner of an email address can use it to sign in. If you cannot see the message, check your spam folder.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onCheck} disabled={busy} className="rounded-lg bg-sky px-5 py-2.5 font-semibold text-bg transition hover:brightness-110 disabled:opacity-60">I have confirmed my email</button>
        <button type="button" onClick={onSend} disabled={busy || cooldown > 0} className="rounded-lg border border-line px-5 py-2.5 font-semibold text-ink transition hover:border-sky hover:text-sky disabled:opacity-60 disabled:hover:border-line disabled:hover:text-ink">
          {cooldown > 0 ? `Send again in ${cooldown}s` : sent ? "Send the link again" : "Send the link"}
        </button>
      </div>
      <button type="button" onClick={onDifferent} className="self-start text-[0.88rem] text-sky hover:underline">Use a different email</button>
    </div>
  );
}

/** Where an email-and-password account waits until its email is confirmed. Nothing else is available until then. */
export default function VerifyEmail() {
  const { enabled, status, user, signOut, sendVerification, checkVerified } = useAccount();
  const router = useRouter();
  const toast = useToast();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [sent, setSent] = useState(params.get("sent") === "1");
  const [cooldown, setCooldown] = useState(sent ? COOLDOWN_S : 0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === "out" && enabled) router.replace("/login");
    if (status === "ready") router.replace(next);
  }, [status, enabled, next, router]);

  // The link may be opened on this device in another tab: check quietly, and again whenever this tab is looked at.
  useEffect(() => {
    if (status !== "unverified") return;
    const quiet = () => void checkVerified().catch(() => undefined);
    const timer = window.setInterval(quiet, 6000);
    window.addEventListener("focus", quiet);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", quiet); };
  }, [status, checkVerified]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  if (status !== "unverified" || !user) return <AuthFormSkeleton />;

  async function send() {
    setBusy(true);
    try {
      await sendVerification();
      setSent(true);
      setCooldown(COOLDOWN_S);
      toast("Confirmation link sent. Check your inbox and spam folder.", "info");
    } catch (err) {
      toast(authErrorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  }

  async function check() {
    setBusy(true);
    try {
      const ok = await checkVerified();
      if (!ok) toast("Not confirmed yet. Open the link in the email first, then try again.", "info");
    } catch (err) {
      toast(authErrorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <VerifyEmailCard
      email={user.email ?? ""} sent={sent} cooldown={cooldown} busy={busy} onSend={send} onCheck={check}
      onDifferent={() => void signOut().then(() => router.replace("/signup"))}
    />
  );
}
