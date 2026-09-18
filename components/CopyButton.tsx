"use client";

import { useState } from "react";

/** Copies `text` to the clipboard and shows a short "Copied" confirmation. */
export default function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked (insecure context, permissions). Fail quietly; the text is still selectable.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : `${label} to clipboard`}
      className={`shrink-0 rounded-md border px-2 py-0.5 font-mono text-[0.7rem] uppercase tracking-[0.08em] transition ${
        copied
          ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
          : "border-line bg-bg-elev text-ink-dim hover:border-sky hover:text-sky"
      }`}
    >
      {copied ? "Copied" : label}
    </button>
  );
}
