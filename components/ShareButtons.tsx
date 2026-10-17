"use client";

import { useState } from "react";

const btn =
  "rounded-md border border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.75rem] tracking-[0.04em] text-ink-dim transition hover:border-sky hover:text-sky";

/**
 * Share row for one page. `url` is the absolute address (built on the server), so the links are right
 * even before the page is hydrated. Uses the device share sheet when the browser has one.
 */
export default function ShareButtons({ url, title, label = "Share" }: { url: string; title: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const text = encodeURIComponent(`${title} ${url}`);
  const enc = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked; the address is still shown in the browser bar.
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, url });
    } catch {
      // The user closed the share sheet. Nothing to do.
    }
  }

  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={label}>
      <span className="mr-1 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-ink-dim">{label}</span>
      {canNativeShare ? (
        <button type="button" onClick={nativeShare} className={btn}>
          Share…
        </button>
      ) : null}
      <a className={btn} href={`https://wa.me/?text=${text}`} target="_blank" rel="noopener noreferrer">
        WhatsApp
      </a>
      <a className={btn} href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc}`} target="_blank" rel="noopener noreferrer">
        LinkedIn
      </a>
      <a className={btn} href={`https://twitter.com/intent/tweet?url=${enc}&text=${t}`} target="_blank" rel="noopener noreferrer">
        X
      </a>
      <button type="button" onClick={copy} className={btn} aria-live="polite">
        {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
}
