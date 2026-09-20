"use client";

import { useEffect, useState } from "react";
import Figure from "./Figure";

/**
 * Live, step-through trace of how the JS engine runs a small program:
 * the source with the current line highlighted, the memory of every
 * execution context, and the call stack — one step at a time.
 */

const SOURCE = [
  "var n = 2;",
  "function square(num) {",
  "  var ans = num * num;",
  "  return ans;",
  "}",
  "var square2 = square(n);",
  "var square4 = square(4);",
];

type Vars = Record<string, string>;

type Frame = {
  name: string;
  vars: Vars;
};

type Step = {
  /** 1-based source line being executed, or null when no line is active. */
  line: number | null;
  phase: "setup" | "memory" | "code" | "done";
  title: string;
  note: string;
  /** Call stack, bottom first. */
  stack: Frame[];
  /** Keys that were written in this step (to flash them). */
  changed?: string[];
};

const FN = "{ …code }";
const U = "undefined";

const gec = (vars: Vars): Frame => ({ name: "Global execution context", vars });
const sq = (vars: Vars): Frame => ({ name: "square() execution context", vars });

const STEPS: Step[] = [
  {
    line: null,
    phase: "setup",
    title: "Program starts",
    note:
      "Before a single line runs, the engine creates the Global Execution Context (GEC) and pushes it onto the call stack. It is empty for now.",
    stack: [gec({})],
  },
  {
    line: 1,
    phase: "memory",
    title: "Memory phase · line 1",
    note: "The engine scans the whole file. It sees var n and reserves memory for it with the placeholder undefined. It does not run n = 2 yet.",
    stack: [gec({ n: U })],
    changed: ["n"],
  },
  {
    line: 2,
    phase: "memory",
    title: "Memory phase · line 2",
    note: "It sees function square. For a function declaration the entire function body is stored in memory — not undefined. This is why you can call a function before its declaration.",
    stack: [gec({ n: U, square: FN })],
    changed: ["square"],
  },
  {
    line: 6,
    phase: "memory",
    title: "Memory phase · line 6",
    note: "var square2 gets a slot with undefined. The right-hand side square(n) is ignored during this phase.",
    stack: [gec({ n: U, square: FN, square2: U })],
    changed: ["square2"],
  },
  {
    line: 7,
    phase: "memory",
    title: "Memory phase · line 7",
    note: "var square4 gets a slot with undefined. Memory phase is complete: every top-level name now exists, even though no code has run.",
    stack: [gec({ n: U, square: FN, square2: U, square4: U })],
    changed: ["square4"],
  },
  {
    line: 1,
    phase: "code",
    title: "Code phase · line 1",
    note: "Execution starts at the top. n = 2 replaces the placeholder undefined with the real value 2.",
    stack: [gec({ n: "2", square: FN, square2: U, square4: U })],
    changed: ["n"],
  },
  {
    line: 2,
    phase: "code",
    title: "Code phase · lines 2–5",
    note: "A function declaration has nothing to execute — its code was already stored during the memory phase. The engine skips straight past the closing brace.",
    stack: [gec({ n: "2", square: FN, square2: U, square4: U })],
  },
  {
    line: 6,
    phase: "code",
    title: "Code phase · line 6 — a function is invoked",
    note: "square(n) is a function invocation. A brand-new execution context is created for this call and pushed on top of the stack. It gets its own memory phase: num and ans are reserved as undefined.",
    stack: [gec({ n: "2", square: FN, square2: U, square4: U }), sq({ num: U, ans: U })],
    changed: ["num", "ans"],
  },
  {
    line: 2,
    phase: "code",
    title: "Inside square · parameter",
    note: "The argument n (which is 2) is copied into the parameter num. Parameters are just local variables of the new context.",
    stack: [gec({ n: "2", square: FN, square2: U, square4: U }), sq({ num: "2", ans: U })],
    changed: ["num"],
  },
  {
    line: 3,
    phase: "code",
    title: "Inside square · line 3",
    note: "num * num is computed as 4 and stored in ans — in this context's memory, not the global one.",
    stack: [gec({ n: "2", square: FN, square2: U, square4: U }), sq({ num: "2", ans: "4" })],
    changed: ["ans"],
  },
  {
    line: 4,
    phase: "code",
    title: "Inside square · line 4 — return",
    note: "return hands control back to the line that called it, along with the value 4. The whole square() context is deleted and popped off the stack.",
    stack: [gec({ n: "2", square: FN, square2: U, square4: U }), sq({ num: "2", ans: "4" })],
  },
  {
    line: 6,
    phase: "code",
    title: "Back in global · line 6",
    note: "The returned 4 is written into square2. Notice the square() context is gone — its num and ans no longer exist anywhere.",
    stack: [gec({ n: "2", square: FN, square2: "4", square4: U })],
    changed: ["square2"],
  },
  {
    line: 7,
    phase: "code",
    title: "Code phase · line 7 — invoked again",
    note: "square(4) creates a completely fresh execution context. It does not remember anything from the previous call: num and ans start as undefined again.",
    stack: [gec({ n: "2", square: FN, square2: "4", square4: U }), sq({ num: U, ans: U })],
    changed: ["num", "ans"],
  },
  {
    line: 3,
    phase: "code",
    title: "Inside square · lines 2–3",
    note: "num becomes 4, then ans becomes 16.",
    stack: [gec({ n: "2", square: FN, square2: "4", square4: U }), sq({ num: "4", ans: "16" })],
    changed: ["num", "ans"],
  },
  {
    line: 7,
    phase: "code",
    title: "Return · line 7",
    note: "16 is returned, the context is popped, and square4 = 16.",
    stack: [gec({ n: "2", square: FN, square2: "4", square4: "16" })],
    changed: ["square4"],
  },
  {
    line: null,
    phase: "done",
    title: "Program ends",
    note: "There is no more code. The Global Execution Context is popped too and the call stack is empty. The engine is idle.",
    stack: [],
  },
];

const phaseStyle: Record<Step["phase"], string> = {
  setup: "border-line bg-bg-code text-ink-dim",
  memory: "border-violet-400/50 bg-violet-400/10 text-violet-200",
  code: "border-emerald-400/50 bg-emerald-400/10 text-emerald-200",
  done: "border-line bg-bg-code text-ink-dim",
};

const phaseLabel: Record<Step["phase"], string> = {
  setup: "Setup",
  memory: "Memory creation phase",
  code: "Code execution phase",
  done: "Finished",
};

const btn =
  "rounded-md border border-line bg-bg-elev px-3 py-1 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-ink-dim transition hover:border-sky hover:text-sky disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink-dim";

export default function ExecutionContextStepper() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const step = STEPS[i];
  const last = STEPS.length - 1;

  useEffect(() => {
    if (!playing) return;
    if (i >= last) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setI((v) => Math.min(v + 1, last)), 1800);
    return () => clearTimeout(t);
  }, [playing, i, last]);

  return (
    <Figure
      caption="Step through the program. Watch the memory phase fill every slot with undefined first, then the code phase overwrite them — and each function call get its own context on the stack."
      note="interactive"
    >
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
          step {i + 1} / {STEPS.length}
        </span>
      </div>

      {/* Phase + explanation */}
      <div className={`mb-4 rounded-lg border px-4 py-3 ${phaseStyle[step.phase]}`}>
        <div className="font-mono text-[0.7rem] uppercase tracking-[0.1em] opacity-80">
          {phaseLabel[step.phase]}
        </div>
        <div className="font-semibold text-ink">{step.title}</div>
        <p className="mb-0 mt-1 text-[0.88rem] text-ink-dim">{step.note}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.1fr_1fr]">
        {/* Source */}
        <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
          <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">
            index.js
          </div>
          <pre className="my-0 overflow-x-auto rounded-none border-0 bg-transparent px-0 py-2 text-[0.85rem]">
            {SOURCE.map((src, n) => {
              const ln = n + 1;
              const active = step.line === ln;
              return (
                <div
                  key={ln}
                  className={`grid grid-cols-[2rem_1fr] px-3 py-0.5 transition-colors ${
                    active
                      ? step.phase === "memory"
                        ? "bg-violet-400/20"
                        : "bg-emerald-400/20"
                      : ""
                  }`}
                >
                  <span className="select-none text-ink-dim/60">{ln}</span>
                  <code className={active ? "text-ink" : "text-ink-dim"}>{src}</code>
                </div>
              );
            })}
          </pre>
        </div>

        {/* Call stack */}
        <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
          <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">
            Call stack · top is running
          </div>
          <div className="flex min-h-[12rem] flex-col-reverse justify-start gap-2 p-3">
            {step.stack.length === 0 ? (
              <div className="py-6 text-center font-mono text-[0.8rem] text-ink-dim">(empty)</div>
            ) : (
              step.stack.map((frame, fi) => {
                const top = fi === step.stack.length - 1;
                return (
                  <div
                    key={`${frame.name}-${fi}`}
                    className={`rounded-lg border px-3 py-2 transition-colors ${
                      top ? "border-sky/60 bg-sky-soft" : "border-line bg-bg-elev opacity-80"
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-[0.85rem] font-semibold text-sky-strong">{frame.name}</span>
                      {top ? (
                        <span className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-sky">running</span>
                      ) : null}
                    </div>
                    <table className="my-0 w-full text-[0.8rem]">
                      <tbody>
                        {Object.keys(frame.vars).length === 0 ? (
                          <tr>
                            <td className="border-0 px-1 py-0.5 font-mono text-ink-dim">memory: empty</td>
                          </tr>
                        ) : (
                          Object.entries(frame.vars).map(([k, v]) => {
                            const flash = top && step.changed?.includes(k);
                            return (
                              <tr key={k} className={flash ? "bg-amber-400/15" : ""}>
                                <td className="border-0 px-1 py-0.5 font-mono text-sky-strong">{k}</td>
                                <td className="border-0 px-1 py-0.5 text-right font-mono">
                                  <span className={v === U ? "text-ink-dim" : v === FN ? "text-amber-200" : "text-emerald-200"}>
                                    {v}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Figure>
  );
}
