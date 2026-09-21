"use client";

import Stepper, { PHASE, type PhaseStyle, type StepBase } from "./Stepper";

/**
 * Reusable step-through of "a loop schedules N setTimeout callbacks": the
 * source, the bindings each callback can see, the pending timers with what
 * each one carries, a clock, and the console as the timers fire.
 */

export type Binding = { label: string; value: string; reading?: boolean; gone?: boolean };
export type Timer = { label: string; delay: string; carries: string; fired?: boolean };
export type TimerStep = StepBase & {
  phase: "loop" | "end" | "wait" | "fire";
  line: number | null;
  clock: string;
  bindings: Binding[];
  timers: Timer[];
  console: string[];
};

const phases: Record<TimerStep["phase"], PhaseStyle> = {
  loop: { label: "Loop running · callback scheduled", className: PHASE.green },
  end: { label: "Loop finished · synchronous code done", className: PHASE.amber },
  wait: { label: "Waiting · call stack empty", className: PHASE.plain },
  fire: { label: "Timer fires · callback runs", className: PHASE.sky },
};

/** Build the 5-iteration story for one variant. */
export function buildSteps(v: {
  loopLine: number;
  callbackLine: number;
  afterLine: number;
  /** Binding(s) visible after iteration k has scheduled its callback (k = 1..5), and after the loop (k = 6). */
  bindings: (k: number) => Binding[];
  /** What the k-th timer carries. */
  carries: (k: number) => string;
  /** What the k-th callback prints, and which binding it reads. */
  fire: (k: number) => { prints: string; bindings: Binding[] };
  scheduleNote: (k: number) => string;
  endNote: string;
  fireNote: (k: number) => string;
}): TimerStep[] {
  const timers = (n: number, fired = 0): Timer[] => Array.from({ length: n }, (_, i) => ({ label: `callback ${i + 1}`, delay: `${i + 1}s`, carries: v.carries(i + 1), fired: i < fired }));
  const steps: TimerStep[] = [];
  for (let k = 1; k <= 5; k++) {
    steps.push({ phase: "loop", line: v.callbackLine, clock: "~0 ms", title: `Iteration ${k} — setTimeout(…, ${k}000) schedules callback ${k}`, note: v.scheduleNote(k), bindings: v.bindings(k), timers: timers(k), console: [] });
  }
  steps.push({ phase: "end", line: v.afterLine, clock: "~1 ms", title: "The loop is over — all five callbacks scheduled, none has run", note: v.endNote, bindings: v.bindings(6), timers: timers(5), console: [] });
  const out: string[] = [];
  for (let k = 1; k <= 5; k++) {
    const f = v.fire(k);
    out.push(f.prints);
    steps.push({ phase: "fire", line: v.callbackLine, clock: `${k}000 ms`, title: `${k} second${k > 1 ? "s" : ""} — callback ${k} fires`, note: v.fireNote(k), bindings: f.bindings, timers: timers(5, k), console: [...out] });
  }
  return steps;
}

export default function TimerLoopStepper({ file, source, steps, caption, tone = "sky" }: { file: string; source: string[]; steps: TimerStep[]; caption: string; tone?: "sky" | "amber" }) {
  return (
    <Stepper steps={steps} phases={phases} caption={caption} interval={1800}>
      {(step) => (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.1fr_1fr]">
          <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
            <div className="flex items-center justify-between border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim"><span>{file}</span><span className={tone === "amber" ? "text-amber-200" : "text-sky"}>clock {step.clock}</span></div>
            <pre className="my-0 overflow-x-auto rounded-none border-0 bg-transparent px-0 py-2 text-[0.74rem]">
              {source.map((src, n) => {
                const active = step.line === n + 1;
                return (
                  <div key={n} className={`grid grid-cols-[2rem_1fr] px-3 py-0.5 ${active ? (step.phase === "fire" ? "bg-sky-soft" : step.phase === "end" ? "bg-amber-400/20" : "bg-emerald-400/20") : ""}`}>
                    <span className="select-none text-ink-dim/60">{n + 1}</span>
                    <code className={active ? "text-ink" : "text-ink-dim"}>{src || " "}</code>
                  </div>
                );
              })}
            </pre>
            <div className="min-h-[3rem] border-t border-line px-3 py-2 font-mono text-[0.76rem]">
              {step.console.length === 0 ? <span className="text-ink-dim">(console — nothing yet)</span> : step.console.map((c, i) => <div key={i} className={i === step.console.length - 1 ? "text-emerald-200" : "text-ink"}>› {c}</div>)}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
              <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">bindings the callbacks can see · {step.bindings.filter((b) => !b.gone).length}</div>
              <div className="space-y-1 p-3 font-mono text-[0.72rem]">
                {step.bindings.length === 0 ? <div className="text-ink-dim">(none)</div> : step.bindings.map((b) => (
                  <div key={b.label} className={`flex justify-between rounded border px-2 py-0.5 ${b.reading ? "border-emerald-400/60 bg-emerald-400/10" : "border-line bg-bg-elev"} ${b.gone ? "line-through opacity-40" : ""}`}>
                    <span className="text-ink-dim">{b.label}{b.reading ? <span className="ml-1 text-[0.6rem] uppercase text-emerald-300">← read</span> : null}</span><span className="text-emerald-200">{b.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
              <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">pending timers · fire after</div>
              <div className="space-y-1 p-3 font-mono text-[0.72rem]">
                {step.timers.length === 0 ? <div className="text-ink-dim">(none yet)</div> : step.timers.map((t) => (
                  <div key={t.label} className={`grid grid-cols-[5.5rem_2.2rem_1fr] gap-1 rounded px-2 py-0.5 ${t.fired ? "line-through opacity-35" : "bg-bg-elev"}`}>
                    <span className="text-ink">{t.label}</span><span className="text-amber-200">{t.delay}</span><span className="text-violet-300 [overflow-wrap:anywhere]">{t.carries}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Stepper>
  );
}
