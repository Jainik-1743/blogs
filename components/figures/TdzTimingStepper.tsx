"use client";

import Stepper, { PHASE, type PhaseStyle, type StepBase } from "./Stepper";

/**
 * "Temporal", not "positional": the same function, reading the same let,
 * written above the declaration both times — works when called after the
 * declaration ran, throws when called before.
 */

const SOURCE = [
  "function readRoom() {",
  "  return roomNumber; // written ABOVE the let, both times",
  "}",
  "",
  "readRoom();          // ① called before line 6 runs",
  "let roomNumber = 101;",
  "readRoom();          // ② called after line 6 ran",
];

type Step = StepBase & { phase: "memory" | "call" | "crash" | "ok" | "note"; line: number | null; slot: string; console: { text: string; bad?: boolean }[]; variant: "A" | "B"; struck?: number[] };

const STEPS: Step[] = [
  { phase: "memory", variant: "A", line: null, title: "Memory phase", note: "readRoom is hoisted in full. roomNumber is hoisted into the TDZ — locked until line 6 is evaluated.", slot: "🔒 TDZ", console: [] },
  { phase: "call", variant: "A", line: 5, title: "① readRoom() is called — before line 6 has run", note: "The function body reads roomNumber. Position in the file does not matter; what matters is whether the declaration has been evaluated yet. It has not.", slot: "🔒 TDZ", console: [] },
  { phase: "crash", variant: "A", line: 2, title: "Inside readRoom → ReferenceError", note: "The lookup climbs to Global, finds the binding, and finds it locked. Cannot access 'roomNumber' before initialization. Uncaught, this stops the script here.", slot: "🔒 TDZ", console: [{ text: "ReferenceError: Cannot access 'roomNumber' before initialization", bad: true }], struck: [6, 7] },
  { phase: "note", variant: "B", line: null, title: "Now delete line 5 and run again", note: "Same function, same body, still written above the let. Only the timing of the call changes.", slot: "🔒 TDZ", console: [], struck: [5] },
  { phase: "ok", variant: "B", line: 6, title: "Line 6 runs — the declaration is evaluated", note: "roomNumber is unlocked and set to 101. The TDZ is over, for everyone, from this moment on.", slot: "101", console: [], struck: [5] },
  { phase: "ok", variant: "B", line: 7, title: "② readRoom() is called — after line 6 ran", note: "The same line 2 that threw a moment ago now returns 101. The function's position never changed — the time of the call did. That is why it is called the Temporal Dead Zone.", slot: "101", console: [{ text: "101" }], struck: [5] },
];

const phases: Record<Step["phase"], PhaseStyle> = {
  memory: { label: "Memory creation phase", className: PHASE.violet },
  call: { label: "Function called", className: PHASE.sky },
  crash: { label: "Read during the TDZ", className: PHASE.red },
  note: { label: "Second run", className: PHASE.amber },
  ok: { label: "Read after the TDZ ended", className: PHASE.green },
};

export default function TdzTimingStepper() {
  return (
    <Stepper steps={STEPS} phases={phases} caption="Step through both calls. The read on line 2 sits above the declaration in both runs; only when it runs decides whether it throws." interval={2400}>
      {(step) => (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.25fr_1fr]">
          <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
            <div className="flex items-center justify-between border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim"><span>temporal.js</span><span className="text-sky">run {step.variant}</span></div>
            <pre className="my-0 overflow-x-auto rounded-none border-0 bg-transparent px-0 py-2 text-[0.76rem]">
              {SOURCE.map((src, n) => {
                const ln = n + 1;
                const active = step.line === ln;
                const struck = step.struck?.includes(ln);
                return (
                  <div key={ln} className={`grid grid-cols-[2rem_1fr] px-3 py-0.5 ${active ? (step.phase === "crash" ? "bg-red-400/20" : step.phase === "ok" ? "bg-emerald-400/20" : "bg-sky-soft") : ""} ${struck ? "line-through opacity-40" : ""}`}>
                    <span className="select-none text-ink-dim/60">{ln}</span>
                    <code className={active ? "text-ink" : "text-ink-dim"}>{src || " "}</code>
                  </div>
                );
              })}
            </pre>
            <div className="min-h-[3rem] border-t border-line px-3 py-2 font-mono text-[0.74rem] [overflow-wrap:anywhere]">
              {step.console.length === 0 ? <span className="text-ink-dim">(console)</span> : step.console.map((c, i) => <div key={i} className={c.bad ? "text-red-300" : "text-emerald-200"}>› {c.text}</div>)}
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
            <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">Global EC · memory</div>
            <div className="space-y-2 p-3 font-mono text-[0.78rem]">
              <div className="flex justify-between rounded border border-line bg-bg-elev px-2 py-1"><span className="text-sky-strong">readRoom</span><span className="text-amber-200">{"{ …code }"}</span></div>
              <div className={`flex justify-between rounded border px-2 py-1 ${step.slot.includes("TDZ") ? (step.phase === "crash" ? "border-red-400/70 bg-red-400/10" : "border-line bg-bg-elev") : "border-emerald-400/60 bg-emerald-400/10"}`}>
                <span className="text-sky-strong">roomNumber</span><span className={step.slot.includes("TDZ") ? "text-red-300" : "text-emerald-200"}>{step.slot}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Stepper>
  );
}
