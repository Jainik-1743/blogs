"use client";

import { useEffect, useState, type ReactNode } from "react";
import Figure from "@/components/figures/Figure";

/**
 * A sequence diagram you can step through: actors across the top, one lifeline each, and
 * messages drawn as arrows between them, revealed one at a time. Written in Markdown as
 * ```sequence (see Markdown.tsx for the syntax).
 */

export type SeqMessage = {
  from: number;
  to: number;
  label: ReactNode;
  /** Extra line under the arrow. */
  note?: ReactNode;
  /** Replies are drawn dashed. */
  reply?: boolean;
  /** A note across all lifelines rather than an arrow. */
  divider?: boolean;
};

const btn =
  "rounded-md border border-line bg-bg-elev px-3 py-1 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-ink-dim transition hover:border-sky hover:text-sky disabled:cursor-not-allowed disabled:opacity-40";

export default function SequenceDiagram({
  actors,
  messages,
  caption,
}: {
  actors: string[];
  messages: SeqMessage[];
  caption: string;
}) {
  const [shown, setShown] = useState(messages.length);
  const [playing, setPlaying] = useState(false);
  const n = actors.length;
  const center = (i: number) => ((i + 0.5) / n) * 100;

  useEffect(() => {
    if (!playing) return;
    if (shown >= messages.length) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setShown((s) => s + 1), 1100);
    return () => clearTimeout(t);
  }, [playing, shown, messages.length]);

  return (
    <Figure caption={caption} note="sequence · step through">
      <div data-no-glossary>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={btn}
            onClick={() => {
              setShown(0);
              setPlaying(true);
            }}
          >
            ▶ Play
          </button>
          <button
            type="button"
            className={btn}
            onClick={() => {
              setPlaying(false);
              setShown((s) => Math.max(s - 1, 0));
            }}
            disabled={shown === 0}
          >
            ← Prev
          </button>
          <button
            type="button"
            className={btn}
            onClick={() => {
              setPlaying(false);
              setShown((s) => Math.min(s + 1, messages.length));
            }}
            disabled={shown === messages.length}
          >
            Next →
          </button>
          <span className="ml-auto font-mono text-[0.72rem] text-ink-dim">
            {shown} / {messages.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <div style={{ minWidth: `${Math.max(n * 8.5, 18)}rem` }}>
            {/* Actors */}
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
              {actors.map((a) => (
                <div
                  key={a}
                  className="mx-auto rounded-lg border border-sky/50 bg-sky-soft px-3 py-1.5 text-center text-[0.85rem] font-semibold text-sky-strong"
                >
                  {a}
                </div>
              ))}
            </div>

            {/* Lifelines + messages */}
            <div className="relative mt-1 pb-2">
              {actors.map((a, i) => (
                <div
                  key={a}
                  className="absolute bottom-0 top-0 w-px border-l border-dashed border-line"
                  style={{ left: `${center(i)}%` }}
                  aria-hidden="true"
                />
              ))}
              <ol className="relative m-0 list-none p-0 pt-2">
                {messages.map((m, i) => {
                  const visible = i < shown;
                  const latest = i === shown - 1;
                  if (m.divider) {
                    return (
                      <li
                        key={i}
                        className={`relative my-2 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
                      >
                        <div className="relative mx-2 rounded-md border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-center text-[0.78rem] text-amber-100">
                          {m.label}
                        </div>
                      </li>
                    );
                  }
                  const self = m.from === m.to;
                  const left = Math.min(center(m.from), center(m.to));
                  const width = Math.abs(center(m.to) - center(m.from));
                  const rightward = m.to > m.from;
                  return (
                    <li
                      key={i}
                      className={`relative py-1.5 transition-all duration-300 ${visible ? "opacity-100" : "opacity-0 -translate-y-1"}`}
                    >
                      {self ? (
                        <div
                          className="w-fit rounded-md border border-sky/40 bg-bg-code px-2 py-1 text-[0.78rem] text-ink"
                          style={{
                            marginLeft: `calc(${center(m.from)}% + 8px)`,
                            maxWidth: `calc(${100 - center(m.from)}% - 12px)`,
                          }}
                        >
                          ↻ {m.label}
                        </div>
                      ) : (
                        <div style={{ marginLeft: `${left}%`, width: `${width}%` }}>
                          <div
                            className={`mx-auto w-fit max-w-full px-1 text-center leading-snug text-[0.8rem] ${latest ? "font-semibold text-sky-strong" : "text-ink"}`}
                          >
                            {m.label}
                          </div>
                          <div className="relative h-3">
                            <div
                              className={`absolute left-0 right-0 top-1/2 ${m.reply ? "border-t-2 border-dashed" : "border-t-2"} ${latest ? "border-sky" : "border-sky/50"}`}
                            />
                            <span
                              className={`absolute top-1/2 -translate-y-1/2 text-[0.7rem] leading-none ${latest ? "text-sky" : "text-sky/60"} ${rightward ? "-right-1" : "-left-1"}`}
                              aria-hidden="true"
                            >
                              {rightward ? "▶" : "◀"}
                            </span>
                          </div>
                          {m.note ? (
                            <div className="px-1 text-center text-[0.72rem] leading-snug text-ink-dim">{m.note}</div>
                          ) : null}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </Figure>
  );
}
