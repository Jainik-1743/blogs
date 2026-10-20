"use client";

import Link from "next/link";
import { GoogleIcon } from "./fields";

/**
 * Shown under a failed sign-in. "Create an account" comes first because the most common reason is a first-time visitor
 * typing an email that has not signed up. Google and password reset follow for returning readers.
 */
export default function SignInHelp({ code, next, busy, onGoogle, onReset }: { code: string; next: string; busy?: boolean; onGoogle: () => void; onReset: () => void }) {
  const unknown = code === "auth/user-not-found" || code === "auth/invalid-credential";
  const wrongPassword = code === "auth/wrong-password" || code === "auth/invalid-credential";
  const quiet = "inline-flex items-center gap-2 rounded-lg border border-line bg-bg px-3.5 py-2 text-[0.85rem] font-semibold text-ink transition hover:border-sky hover:text-sky disabled:opacity-60";
  return (
    <div className="-mt-2 flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {unknown && (
          <Link href={`/signup${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`} className="inline-flex items-center rounded-lg bg-sky px-3.5 py-2 text-[0.85rem] font-semibold text-bg transition hover:no-underline hover:brightness-110">
            Create an account
          </Link>
        )}
        <button type="button" onClick={onGoogle} disabled={busy} className={quiet}><GoogleIcon /> Continue with Google</button>
        {wrongPassword && <button type="button" onClick={onReset} className={quiet}>Reset my password</button>}
      </div>
      {code === "auth/invalid-credential" && <p className="m-0 text-[0.8rem] text-ink-dim">Signed up with Google before? Use Continue with Google. You can add a password afterwards on your account page.</p>}
    </div>
  );
}
