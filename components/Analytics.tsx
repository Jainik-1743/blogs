"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { analyticsAvailable, identify, pageInfo, readConsent, resetIdentity, saveConsent, start, track, type Consent } from "@/lib/analytics";
import { useAccount } from "@/components/auth/AuthProvider";

/** Asks once whether usage may be measured, then (only if yes) records page views and links signed-in readers by account id. */
export default function Analytics() {
  const pathname = usePathname();
  const { status, user } = useAccount();
  const [available, setAvailable] = useState(false);
  const [consent, setConsent] = useState<Consent>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setAvailable(analyticsAvailable());
    setConsent(readConsent());
  }, []);

  useEffect(() => {
    if (!available || consent !== "yes") return;
    void start().then(() => setStarted(true));
  }, [available, consent]);

  useEffect(() => {
    if (started) track("page_viewed", { path: pathname, ...pageInfo(pathname) });
  }, [started, pathname]);

  useEffect(() => {
    if (!started) return;
    if (status === "ready" && user) identify(user.uid);
    else if (status === "out") resetIdentity();
  }, [started, status, user]);

  if (!available || consent !== null) return null;

  const choose = (value: "yes" | "no") => {
    saveConsent(value);
    setConsent(value);
  };

  return (
    <div role="dialog" aria-label="Usage measurement" data-no-glossary className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-[28rem] rounded-2xl border border-line bg-bg-elev p-4 shadow-2xl shadow-black/40 sm:left-6 sm:right-auto sm:mx-0">
      <p className="m-0 text-[0.9rem] text-ink">
        May I measure which pages and features are used, so I can improve the lessons? Nothing you type is collected, and nothing that names you. <Link href="/privacy">Details</Link>
      </p>
      <div className="mt-3 flex gap-3">
        <button type="button" onClick={() => choose("yes")} className="rounded-lg bg-sky px-4 py-2 text-[0.88rem] font-semibold text-bg hover:brightness-110">Yes, that is fine</button>
        <button type="button" onClick={() => choose("no")} className="rounded-lg border border-line px-4 py-2 text-[0.88rem] font-semibold text-ink hover:border-sky hover:text-sky">No thanks</button>
      </div>
    </div>
  );
}
