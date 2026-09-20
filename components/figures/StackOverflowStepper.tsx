"use client";

import Stepper, { PHASE, type PhaseStyle, type StepBase } from "./Stepper";

/**
 * Step-through of countDown() with no base case: frames keep getting pushed,
 * none ever pop, the stack's capacity meter fills, and the engine throws.
 */

const SOURCE = [
  "function countDown(n) {",
  "  console.log(n);",
  "  countDown(n - 1); // never stops",
  "}",
  "",
  "countDown(5);",
];

type Step = StepBase & {
  phase: "push" | "gap" | "crash";
  line: number | null;
  /** Bottom first. Frame labels. */
  stack: string[];
  console: string[];
  /** 0–1 share of the stack's capacity used. */
  fill: number;
  crashed?: boolean;
};

const frames = (n: number) => ["Global EC", ...Array.from({ length: 5 - n + 1 }, (_, i) => `countDown(${5 - i}) EC`)];
const printed = (n: number) => Array.from({ length: 5 - n + 1 }, (_, i) => String(5 - i));

const STEPS: Step[] = [
  {
    phase: "push",
    line: 6,
    title: "countDown(5) called",
    note: "Global calls countDown(5). One frame pushed. It prints 5, then on line 3 calls countDown(4) — and now it has to wait for that call to finish before it can finish itself.",
    stack: frames(5),
    console: printed(5),
    fill: 0.05,
  },
  {
    phase: "push",
    line: 3,
    title: "countDown(4) called — countDown(5) is still waiting",
    note: "Another frame on top. countDown(5) is paused on line 3. Nothing has been popped.",
    stack: frames(4),
    console: printed(4),
    fill: 0.1,
  },
  {
    phase: "push",
    line: 3,
    title: "countDown(3) called",
    note: "Same story. Each frame is waiting on the one above it, so none of them can ever finish.",
    stack: frames(3),
    console: printed(3),
    fill: 0.15,
  },
  {
    phase: "push",
    line: 3,
    title: "countDown(2), countDown(1), countDown(0), countDown(−1) …",
    note: "There is no if to stop it. n just keeps going negative and the frames keep coming.",
    stack: frames(0),
    console: [...printed(0), "-1", "-2", "…"],
    fill: 0.3,
  },
  {
    phase: "gap",
    line: 3,
    title: "… thousands of frames later …",
    note: "The stack has a fixed amount of memory. In Chrome that is roughly 10,000–15,000 frames for a function this small. Still pushing. Still nothing popped.",
    stack: [...frames(0), "⋮ ~11,000 more ⋮"],
    console: ["…", "-11,412", "-11,413", "-11,414"],
    fill: 0.92,
  },
  {
    phase: "crash",
    line: 3,
    title: "No room left → RangeError",
    note: "The next push has nowhere to go. The engine throws RangeError: Maximum call stack size exceeded, unwinds every frame, and the program stops. This is a stack overflow.",
    stack: [...frames(0), "⋮ ~11,000 more ⋮"],
    console: ["…", "-11,414", "RangeError: Maximum call stack size exceeded"],
    fill: 1,
    crashed: true,
  },
];

const phases: Record<Step["phase"], PhaseStyle> = {
  push: { label: "Push · nothing ever pops", className: PHASE.violet },
  gap: { label: "Push · stack nearly full", className: PHASE.amber },
  crash: { label: "Stack overflow", className: PHASE.red },
};

export default function StackOverflowStepper() {
  return (
    <Stepper
      steps={STEPS}
      phases={phases}
      caption="Nothing ever pops, so the stack fills up until it has nowhere left to grow."
      interval={1600}
    >
      {(step) => (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr]">
          <div className="flex flex-col gap-4">
            {/* Source */}
            <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
              <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">
                overflow.js
              </div>
              <pre className="my-0 overflow-x-auto rounded-none border-0 bg-transparent px-0 py-2 text-[0.8rem]">
                {SOURCE.map((src, n) => {
                  const ln = n + 1;
                  const active = step.line === ln;
                  return (
                    <div key={ln} className={`grid grid-cols-[2rem_1fr] px-3 py-0.5 ${active ? (step.crashed ? "bg-red-400/20" : "bg-violet-400/20") : ""}`}>
                      <span className="select-none text-ink-dim/60">{ln}</span>
                      <code className={active ? "text-ink" : "text-ink-dim"}>{src || " "}</code>
                    </div>
                  );
                })}
              </pre>
            </div>
            {/* Console */}
            <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
              <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">
                Console
              </div>
              <div className="px-3 py-2 font-mono text-[0.8rem]">
                {step.console.map((line, i) => (
                  <div key={`${line}-${i}`} className={line.startsWith("RangeError") ? "font-semibold text-red-300" : "text-ink"}>
                    › {line}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stack + capacity */}
          <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
            <div className="flex items-center justify-between border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">
              <span>Call stack</span>
              <span>{step.stack.length - 1} frames</span>
            </div>
            <div className="px-3 pt-3">
              <div className="mb-1 flex justify-between font-mono text-[0.65rem] uppercase tracking-[0.08em] text-ink-dim">
                <span>stack memory used</span>
                <span className={step.crashed ? "text-red-300" : step.fill > 0.8 ? "text-amber-300" : ""}>{Math.round(step.fill * 100)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-bg-elev">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${step.crashed ? "bg-red-400" : step.fill > 0.8 ? "bg-amber-400" : "bg-violet-400"}`}
                  style={{ width: `${step.fill * 100}%` }}
                />
              </div>
            </div>
            <div className="flex min-h-[14rem] flex-col-reverse justify-start gap-1 p-3">
              {step.crashed ? (
                <div className="rounded-md border border-red-400/60 bg-red-400/15 px-2 py-1.5 text-center font-mono text-[0.75rem] font-semibold text-red-300">
                  ✕ Maximum call stack size exceeded
                </div>
              ) : null}
              {step.stack.map((f, i) => {
                const top = i === step.stack.length - 1 && !step.crashed;
                const gap = f.startsWith("⋮");
                const isGlobal = f.startsWith("Global");
                return (
                  <div
                    key={`${f}-${i}`}
                    className={`rounded-md border px-2 py-1 text-center font-mono text-[0.72rem] ${
                      gap
                        ? "border-dashed border-violet-400/40 text-violet-300"
                        : isGlobal
                          ? "border-line bg-bg-elev text-ink"
                          : "border-violet-400/50 bg-violet-400/10 text-violet-200"
                    } ${top ? "ring-1 ring-violet-400/60" : ""}`}
                  >
                    {f}
                    {!gap && !isGlobal ? <span className="ml-2 text-[0.6rem] uppercase tracking-[0.08em] opacity-70">{top ? "running" : "waiting"}</span> : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Stepper>
  );
}
