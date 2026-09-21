"use client";

import Stepper, { PHASE, type PhaseStyle, type StepBase } from "./Stepper";

/** Two calls to createCounter, two Lexical Environments, two private counts that never interfere. */

const SOURCE = [
  "function createCounter() {",
  "  let count = 0;",
  "  return {",
  "    increment: () => ++count,",
  "    getValue: () => count,",
  "  };",
  "}",
  "",
  "const a = createCounter();",
  "const b = createCounter();",
  "a.increment(); a.increment();",
  "b.increment();",
  "console.log(a.getValue(), b.getValue()); // 2 1",
];

type Env = { name: string; count: string; hit?: boolean };
type Step = StepBase & { phase: "call" | "run" | "read"; line: number | null; envs: Env[]; console: string[] };

const STEPS: Step[] = [
  { phase: "call", line: 9, title: "createCounter() → environment A", note: "A Lexical Environment with count = 0, and two functions linked to it. The context is popped; the environment survives because a's functions reference it.", envs: [{ name: "environment A · held by a", count: "0" }], console: [] },
  { phase: "call", line: 10, title: "createCounter() again → environment B", note: "A completely separate environment with its own count = 0. Two calls, two environments — nothing is shared.", envs: [{ name: "environment A · held by a", count: "0" }, { name: "environment B · held by b", count: "0" }], console: [] },
  { phase: "run", line: 11, title: "a.increment() twice", note: "a's increment follows its closure link into environment A. count there becomes 1, then 2. Environment B is untouched.", envs: [{ name: "environment A · held by a", count: "2", hit: true }, { name: "environment B · held by b", count: "0" }], console: [] },
  { phase: "run", line: 12, title: "b.increment() once", note: "b's increment follows its own link into environment B. count there becomes 1.", envs: [{ name: "environment A · held by a", count: "2" }, { name: "environment B · held by b", count: "1", hit: true }], console: [] },
  { phase: "read", line: 13, title: "getValue on each", note: "2 and 1. Nobody outside can reach either count directly — only through the functions that close over it. That is private state, with no class in sight.", envs: [{ name: "environment A · held by a", count: "2", hit: true }, { name: "environment B · held by b", count: "1", hit: true }], console: ["2 1"] },
];

const phases: Record<Step["phase"], PhaseStyle> = {
  call: { label: "Outer function called · new environment", className: PHASE.violet },
  run: { label: "Closure writes through its link", className: PHASE.green },
  read: { label: "Closure reads through its link", className: PHASE.sky },
};

export default function IndependentClosuresStepper() {
  return (
    <Stepper steps={STEPS} phases={phases} caption="Step through two counters. Each call to createCounter builds its own environment; each returned function is wired to exactly one of them." interval={2200}>
      {(step) => (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.2fr_1fr]">
          <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
            <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">counter.js</div>
            <pre className="my-0 overflow-x-auto rounded-none border-0 bg-transparent px-0 py-2 text-[0.74rem]">
              {SOURCE.map((src, n) => (
                <div key={n} className={`grid grid-cols-[2rem_1fr] px-3 py-0.5 ${step.line === n + 1 ? "bg-emerald-400/20" : ""}`}>
                  <span className="select-none text-ink-dim/60">{n + 1}</span>
                  <code className={step.line === n + 1 ? "text-ink" : "text-ink-dim"}>{src || " "}</code>
                </div>
              ))}
            </pre>
            <div className="border-t border-line px-3 py-2 font-mono text-[0.76rem]">
              {step.console.length === 0 ? <span className="text-ink-dim">(console)</span> : step.console.map((c) => <div key={c} className="text-emerald-200">› {c}</div>)}
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
            <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">Heap · kept-alive environments</div>
            <div className="space-y-3 p-3">
              {step.envs.map((e) => (
                <div key={e.name} className={`rounded-lg border px-3 py-2 ${e.hit ? "border-emerald-400/60 bg-emerald-400/10" : "border-violet-400/40 bg-violet-400/5"}`}>
                  <div className="mb-1 text-[0.78rem] font-semibold text-violet-200">{e.name}</div>
                  <div className="flex justify-between font-mono text-[0.76rem]"><span className="text-sky-strong">count</span><span className="text-emerald-200">{e.count}</span></div>
                  <div className="mt-1 font-mono text-[0.62rem] text-ink-dim">↑ increment, getValue link here</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Stepper>
  );
}
