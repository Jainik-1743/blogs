"use client";

import Stepper, { PHASE, type PhaseStyle, type StepBase } from "./Stepper";

/** typeof on a name with no slot (safe) vs. typeof on a slot locked in the TDZ (throws). */

const SOURCE = ['console.log(typeof unicornVariable); // "undefined"', "", "console.log(typeof discountRate);    // ReferenceError!", "let discountRate = 10;"];

type Step = StepBase & { phase: "memory" | "safe" | "crash" | "done"; line: number | null; probe?: "unicorn" | "discount"; console: { text: string; bad?: boolean }[] };

const STEPS: Step[] = [
  { phase: "memory", line: null, title: "Memory phase", note: "let discountRate is hoisted: a slot exists, locked (TDZ) until line 4 runs. unicornVariable is declared nowhere — no slot at all.", console: [] },
  { phase: "safe", line: 1, title: "typeof unicornVariable — no slot → safe", note: 'typeof looks for a binding, finds none, and answers "undefined". This is the Lesson 6 rule working as advertised.', probe: "unicorn", console: [{ text: '"undefined"' }] },
  { phase: "crash", line: 3, title: "typeof discountRate — slot exists but is locked → throws", note: "There is a binding this time, so typeof has to read it — and reading a TDZ binding is a ReferenceError, typeof or not. The safety net only covers names that do not exist at all.", probe: "discount", console: [{ text: '"undefined"' }, { text: "ReferenceError: Cannot access 'discountRate' before initialization", bad: true }] },
  { phase: "done", line: null, title: "One exception to the rule", note: "No slot → typeof is safe. Locked slot → typeof throws. Line 4 is never reached.", console: [{ text: '"undefined"' }, { text: "ReferenceError: Cannot access 'discountRate' before initialization", bad: true }] },
];

const phases: Record<Step["phase"], PhaseStyle> = {
  memory: { label: "Memory creation phase", className: PHASE.violet },
  safe: { label: "typeof · safe", className: PHASE.sky },
  crash: { label: "typeof · TDZ", className: PHASE.red },
  done: { label: "Finished", className: PHASE.plain },
};

export default function TypeofTdzStepper() {
  return (
    <Stepper steps={STEPS} phases={phases} caption="Step through both typeof checks. The difference is not the operator — it is whether a locked slot exists." interval={2200}>
      {(step) => (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.2fr_1fr]">
          <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
            <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">typeof.js</div>
            <pre className="my-0 overflow-x-auto rounded-none border-0 bg-transparent px-0 py-2 text-[0.76rem]">
              {SOURCE.map((src, n) => {
                const ln = n + 1;
                const active = step.line === ln;
                const struck = (step.phase === "crash" || step.phase === "done") && ln === 4;
                return (
                  <div key={ln} className={`grid grid-cols-[2rem_1fr] px-3 py-0.5 ${active ? (step.phase === "crash" ? "bg-red-400/20" : "bg-sky-soft") : ""} ${struck ? "line-through opacity-40" : ""}`}>
                    <span className="select-none text-ink-dim/60">{ln}</span>
                    <code className={active ? "text-ink" : "text-ink-dim"}>{src || " "}</code>
                  </div>
                );
              })}
            </pre>
            <div className="border-t border-line px-3 py-2 font-mono text-[0.76rem] [overflow-wrap:anywhere]">
              {step.console.length === 0 ? <span className="text-ink-dim">(console)</span> : step.console.map((c, i) => <div key={i} className={c.bad ? "text-red-300" : "text-emerald-200"}>› {c.text}</div>)}
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
            <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">Global EC · memory</div>
            <div className="space-y-2 p-3 font-mono text-[0.78rem]">
              <div className={`flex items-center justify-between rounded border border-dashed px-2 py-1 ${step.probe === "unicorn" ? "border-sky/70 bg-sky-soft text-sky" : "border-line/60 text-ink-dim/50"}`}>
                <span>unicornVariable{step.probe === "unicorn" ? <span className="ml-1 text-[0.6rem] uppercase">← typeof asks</span> : null}</span><span>no slot</span>
              </div>
              <div className={`flex items-center justify-between rounded border px-2 py-1 ${step.probe === "discount" ? "border-red-400/70 bg-red-400/10" : "border-line bg-bg-elev"}`}>
                <span className="text-sky-strong">discountRate{step.probe === "discount" ? <span className="ml-1 text-[0.6rem] uppercase text-red-300">← typeof asks</span> : null}</span><span className="text-red-300">🔒 TDZ</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Stepper>
  );
}
