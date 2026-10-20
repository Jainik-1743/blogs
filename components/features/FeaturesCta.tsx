"use client";

import Link from "next/link";
import { useAccount } from "@/components/auth/AuthProvider";

/** The sign-up buttons on the features page. A reader who is already signed in is pointed to their account instead. */
export default function FeaturesCta({ tone = "primary" }: { tone?: "primary" | "quiet" }) {
  const { status, enabled } = useAccount();
  if (!enabled) return null;
  if (status === "ready") {
    return <Link href="/account" className="inline-flex rounded-lg bg-sky px-6 py-3 font-semibold text-bg transition hover:no-underline hover:brightness-110">You are signed in. Open your account →</Link>;
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href="/signup" className="rounded-lg bg-sky px-6 py-3 font-semibold text-bg transition hover:no-underline hover:brightness-110">Create a free account</Link>
      <Link href="/login" className={`rounded-lg border px-6 py-3 font-semibold transition hover:no-underline ${tone === "primary" ? "border-line text-ink hover:border-sky hover:text-sky" : "border-line text-ink-dim hover:border-sky hover:text-sky"}`}>Sign in</Link>
    </div>
  );
}
