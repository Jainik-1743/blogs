"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const BTN =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-line bg-bg-elev px-4 text-[0.82rem] text-ink transition-colors hover:border-sky hover:text-sky focus-visible:outline-2 focus-visible:outline-sky disabled:cursor-default disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink";

/** Step state, auto-play and keyboard control shared by every explainer. Step 0 is the starting picture. */
export function useStepper(total: number) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (step >= total) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => setStep((s) => Math.min(total, s + 1)), 2600);
    return () => clearTimeout(id);
  }, [playing, step, total]);

  return {
    step,
    playing,
    reduce,
    next: () => setStep((s) => Math.min(total, s + 1)),
    back: () => setStep((s) => Math.max(0, s - 1)),
    reset: () => {
      setPlaying(false);
      setStep(0);
    },
    toggle: () => {
      if (step >= total) setStep(0);
      setPlaying((p) => !p);
    },
    go: (n: number) => setStep(Math.max(0, Math.min(total, n))),
  };
}

type Props = {
  title: string;
  total: number;
  stepper: ReturnType<typeof useStepper>;
  /** The animated picture. */
  children: ReactNode;
  caption: { heading: string; note: string };
};

/** The card around an explainer: title, picture, caption, and Back / Play / Next / Reset buttons. */
export default function StepFrame({ title, total, stepper, children, caption }: Props) {
  const { step, playing } = stepper;
  const root = useRef<HTMLDivElement>(null);

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      stepper.next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      stepper.back();
    }
  }

  return (
    <div
      ref={root}
      data-no-tts=""
      role="group"
      aria-label={`${title}: step-by-step explainer`}
      tabIndex={0}
      onKeyDown={onKey}
      className="my-6 overflow-hidden rounded-2xl border border-line bg-bg-elev outline-offset-2 focus-visible:outline-2 focus-visible:outline-sky"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <span className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-sky">Step by step</span>
        <span className="text-[0.9rem] font-semibold text-ink">{title}</span>
      </div>

      <div className="overflow-x-auto px-2 py-3">{children}</div>

      <div className="border-t border-line bg-bg px-4 py-3" aria-live="polite">
        <div className="flex items-center gap-2 font-mono text-[0.72rem] text-ink-dim">
          {step === 0 ? "Press Next to begin" : `Step ${step} of ${total}`}
          <span className="flex flex-1 gap-1" aria-hidden="true">
            {Array.from({ length: total }, (_, i) => (
              <button
                key={i}
                type="button"
                tabIndex={-1}
                onClick={() => stepper.go(i + 1)}
                className={`h-1.5 flex-1 rounded-full transition-colors ${i < step ? "bg-sky" : "bg-line hover:bg-sky/40"}`}
              />
            ))}
          </span>
        </div>
        <span className="mt-2 mb-0 block text-[1rem] font-semibold text-ink">{caption.heading}</span>
        <span className="mt-1 mb-0 block text-[0.92rem] leading-relaxed text-ink-dim">{caption.note}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3">
        <button type="button" onClick={stepper.back} disabled={step === 0} className={BTN}>
          ← Back
        </button>
        <button type="button" onClick={stepper.next} disabled={step >= total} className={BTN}>
          Next →
        </button>
        <button type="button" onClick={stepper.toggle} aria-pressed={playing} className={`${BTN} ${playing ? "border-sky text-sky" : ""}`}>
          {playing ? "Pause" : step >= total ? "Replay" : "Play"}
        </button>
        <button type="button" onClick={stepper.reset} disabled={step === 0} className={`${BTN} ml-auto`}>
          Reset
        </button>
      </div>
    </div>
  );
}
