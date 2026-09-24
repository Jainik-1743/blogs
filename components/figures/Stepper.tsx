"use client";

import { useEffect, useState, type ReactNode } from "react";
import Figure from "./Figure";

/**
 * Shared shell for every step-through visualiser: Reset / Prev / Next / Play
 * controls, a coloured phase panel with the step's title and explanation, and
 * whatever picture the caller renders for the current step underneath.
 */

export type StepBase = {
  /** Which phase panel colour and label to use — a key of `phases`. */
  phase: string;
  title: string;
  note: string;
};

export type PhaseStyle = {
  label: string;
  /** Border / background / text classes for the phase panel. */
  className: string;
};

/** Phase colours shared across the series so the same idea looks the same everywhere. */
export const PHASE = {
  plain: "border-line bg-bg-code text-ink-dim",
  violet: "border-violet-400/50 bg-violet-400/10 text-violet-200",
  green: "border-emerald-400/50 bg-emerald-400/10 text-emerald-200",
  sky: "border-sky/50 bg-sky-soft text-sky",
  amber: "border-amber-400/50 bg-amber-400/10 text-amber-200",
  red: "border-red-400/50 bg-red-400/10 text-red-200",
} as const;

const btn =
  "rounded-md border border-line bg-bg-elev px-3 py-1 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-ink-dim transition hover:border-sky hover:text-sky disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink-dim";

export default function Stepper<S extends StepBase>({
  steps,
  phases,
  caption,
  interval = 1800,
  children,
}: {
  steps: S[];
  phases: Record<string, PhaseStyle>;
  caption: string;
  /** Milliseconds between steps while playing. */
  interval?: number;
  children: (step: S, index: number) => ReactNode;
}) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const step = steps[i];
  const last = steps.length - 1;
  const phase = phases[step.phase] ?? { label: step.phase, className: PHASE.plain };

  useEffect(() => {
    if (!playing) return;
    if (i >= last) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setI((v) => Math.min(v + 1, last)), interval);
    return () => clearTimeout(t);
  }, [playing, i, last, interval]);

  return (
    <Figure caption={caption} note="interactive">
      {/* Glossary marking rewrites text nodes; React re-renders this subtree on every step, so it must opt out. */}
      <div data-no-glossary>
      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button type="button" className={btn} onClick={() => { setPlaying(false); setI(0); }} disabled={i === 0}>
          ⟲ Reset
        </button>
        <button type="button" className={btn} onClick={() => { setPlaying(false); setI((v) => Math.max(v - 1, 0)); }} disabled={i === 0}>
          ← Prev
        </button>
        <button type="button" className={btn} onClick={() => { setPlaying(false); setI((v) => Math.min(v + 1, last)); }} disabled={i === last}>
          Next →
        </button>
        <button type="button" className={btn} onClick={() => setPlaying((p) => !p)} disabled={i === last && !playing}>
          {playing ? "❚❚ Pause" : "▶ Play"}
        </button>
        <span className="ml-auto font-mono text-[0.72rem] text-ink-dim">
          step {i + 1} / {steps.length}
        </span>
      </div>

      {/* Phase + explanation */}
      <div className={`mb-4 rounded-lg border px-4 py-3 ${phase.className}`}>
        <div className="font-mono text-[0.7rem] uppercase tracking-[0.1em] opacity-80">{phase.label}</div>
        <div className="font-semibold text-ink">{step.title}</div>
        <p className="mb-0 mt-1 text-[0.88rem] text-ink-dim">{step.note}</p>
      </div>

      {children(step, i)}
      </div>
    </Figure>
  );
}
