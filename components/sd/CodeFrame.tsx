"use client";

import { useState, type ReactNode } from "react";
import CopyButton from "@/components/CopyButton";

/** Blocks longer than this many lines start collapsed, so a long listing does not push the lesson away. */
const COLLAPSE_AT = 26;

const TOOL =
  "shrink-0 rounded-md border px-2 py-0.5 font-mono text-[0.7rem] uppercase tracking-[0.08em] transition focus-visible:outline-2 focus-visible:outline-sky";

/**
 * The frame around a code sample: the language label, a wrap-long-lines switch, the copy button, and
 * collapse/expand for long listings. The coloured lines come in as children (see CodeBlock).
 */
export default function CodeFrame({ label, code, lineCount, children }: { label: string; code: string; lineCount: number; children: ReactNode }) {
  const [wrap, setWrap] = useState(false);
  const long = lineCount > COLLAPSE_AT;
  const [open, setOpen] = useState(false);
  const collapsed = long && !open;

  return (
    <div className="my-5 overflow-hidden rounded-xl border border-line bg-bg-code">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-bg-elev px-4 py-2">
        <span className="flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-ink-dim">
          <span className="flex gap-1" aria-hidden="true">
            <i className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
            <i className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
            <i className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
          </span>
          {label}
          {long ? <span className="normal-case tracking-normal opacity-70">· {lineCount} lines</span> : null}
        </span>
        <span className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setWrap((v) => !v)}
            aria-pressed={wrap}
            title="Wrap long lines"
            className={`${TOOL} ${wrap ? "border-sky bg-sky-soft text-sky" : "border-line bg-bg-elev text-ink-dim hover:border-sky hover:text-sky"}`}
          >
            Wrap
          </button>
          <CopyButton text={code} />
        </span>
      </div>
      <div className="relative">
        <pre
          className={`my-0 rounded-none border-0 bg-transparent px-4 py-3 ${wrap ? "overflow-x-hidden [&_code]:whitespace-pre-wrap [&_code]:[overflow-wrap:anywhere]" : ""} ${collapsed ? "max-h-[22rem] overflow-y-hidden" : ""}`}
        >
          <code>{children}</code>
        </pre>
        {collapsed ? (
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-bg-code to-transparent" />
        ) : null}
      </div>
      {long ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center justify-center gap-1.5 border-t border-line bg-bg-elev px-4 py-1.5 font-mono text-[0.72rem] text-ink-dim transition hover:text-sky focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sky"
        >
          {open ? "Show less" : `Show all ${lineCount} lines`}
          <span aria-hidden="true">{open ? "↑" : "↓"}</span>
        </button>
      ) : null}
    </div>
  );
}
