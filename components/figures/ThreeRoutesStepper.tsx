"use client";

import Stepper, { PHASE, type PhaseStyle, type StepBase } from "./Stepper";

/** x, this.x and window.x: three routes that all end in the same slot on the global object. */

const SOURCE = ["var x = 10;", "", "console.log(x);        // 10", "console.log(this.x);   // 10", "console.log(window.x); // 10"];

type Step = StepBase & {
  phase: "memory" | "code" | "route" | "done";
  line: number | null;
  x: string;
  /** Path of labels lit up on the way to the slot. */
  route: string[];
  console: string[];
};

const STEPS: Step[] = [
  { phase: "memory", line: 1, title: "Memory phase — x goes onto window", note: "A top-level var lands in the Object Environment Record, which is tied to the global object. So x is now a real property: window.x exists, holding undefined.", x: "undefined", route: [], console: [] },
  { phase: "code", line: 1, title: "Code phase · line 1", note: "x = 10 writes into that one slot on window.", x: "10", route: [], console: [] },
  { phase: "route", line: 3, title: "Route 1 — x", note: "A bare name. The engine looks it up through the Global EC's records, finds it in the Object Environment Record — which is window — and reads 10.", x: "10", route: ["x", "Object Environment Record", "window.x"], console: ["10"] },
  { phase: "route", line: 4, title: "Route 2 — this.x", note: "this at the top level is a pointer to window. So this.x is window.x: same slot, same 10.", x: "10", route: ["this", "→ window", "window.x"], console: ["10", "10"] },
  { phase: "route", line: 5, title: "Route 3 — window.x", note: "The direct route. Nothing to resolve: read the property off the global object.", x: "10", route: ["window", "window.x"], console: ["10", "10", "10"] },
  { phase: "done", line: null, title: "Three routes, one box", note: "Bare name, this, window — three different spellings of the same slot on the same object.", x: "10", route: [], console: ["10", "10", "10"] },
];

const phases: Record<Step["phase"], PhaseStyle> = {
  memory: { label: "Memory creation phase", className: PHASE.violet },
  code: { label: "Code execution phase", className: PHASE.green },
  route: { label: "Lookup route", className: PHASE.sky },
  done: { label: "Finished", className: PHASE.plain },
};

export default function ThreeRoutesStepper() {
  return (
    <Stepper steps={STEPS} phases={phases} caption="Step through the three reads. Each one lights up a different path, and every path ends at the same slot on window." interval={2200}>
      {(step) => (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1.1fr]">
          <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
              <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">routes.js</div>
              <pre className="my-0 overflow-x-auto rounded-none border-0 bg-transparent px-0 py-2 text-[0.78rem]">
                {SOURCE.map((src, n) => {
                  const ln = n + 1;
                  const active = step.line === ln;
                  return (
                    <div key={ln} className={`grid grid-cols-[2rem_1fr] px-3 py-0.5 ${active ? (step.phase === "memory" ? "bg-violet-400/20" : step.phase === "route" ? "bg-sky-soft" : "bg-emerald-400/20") : ""}`}>
                      <span className="select-none text-ink-dim/60">{ln}</span>
                      <code className={active ? "text-ink" : "text-ink-dim"}>{src || " "}</code>
                    </div>
                  );
                })}
              </pre>
            </div>
            <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
              <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">Console</div>
              <div className="min-h-[3rem] px-3 py-2 font-mono text-[0.8rem]">
                {step.console.length === 0 ? <span className="text-ink-dim">(nothing yet)</span> : step.console.map((l, i) => <div key={i} className={i === step.console.length - 1 && step.phase === "route" ? "text-emerald-200" : "text-ink"}>› {l}</div>)}
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
            <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">Global EC</div>
            <div className="p-3">
              <div className="mb-3 flex flex-wrap items-center gap-1 font-mono text-[0.72rem]">
                {step.route.length === 0 ? (
                  <span className="text-ink-dim">(no lookup in progress)</span>
                ) : (
                  step.route.map((r, i) => (
                    <span key={r} className="flex items-center gap-1">
                      <span className={`rounded border px-1.5 py-0.5 ${i === step.route.length - 1 ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-200" : "border-sky/60 bg-sky-soft text-sky"}`}>{r}</span>
                      {i < step.route.length - 1 ? <span className="text-sky">›</span> : null}
                    </span>
                  ))
                )}
              </div>
              <div className={`rounded-md border px-2 py-1.5 ${step.route.includes("this") ? "border-amber-400/60 bg-amber-400/10" : "border-line"}`}>
                <div className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-ink-dim">ThisBinding</div>
                <div className="font-mono text-[0.76rem]"><span className="text-sky-strong">this</span> <span className="text-ink-dim">→</span> <span className="text-emerald-200">window</span></div>
              </div>
              <div className="my-1 text-center font-mono text-ink-dim">↓</div>
              <div className={`rounded-md border px-2 py-1.5 ${step.route.length ? "border-emerald-400/60 bg-emerald-400/10" : "border-emerald-400/40 bg-emerald-400/5"}`}>
                <div className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-ink-dim">Object Environment Record · window</div>
                <ul className="m-0 list-none p-0 font-mono text-[0.76rem]">
                  <li className={`flex justify-between rounded px-1 ${step.route.length ? "bg-emerald-400/15" : ""}`}><span className="text-sky-strong">x</span><span className={step.x === "undefined" ? "text-ink-dim" : "text-emerald-200"}>{step.x}</span></li>
                  <li className="flex justify-between px-1 text-ink-dim/60"><span>console, Math, …</span><span>built-ins</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </Stepper>
  );
}
