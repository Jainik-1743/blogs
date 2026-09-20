"use client";

import Stepper, { PHASE, type PhaseStyle, type StepBase } from "./Stepper";

/** One variable, four types in a row: the type belongs to the value, not the slot. */

const SOURCE = ["let value = 101;", 'value = "Room 101";', "value = true;", "value = undefined;"];

type Step = StepBase & { phase: "assign"; line: number; value: string; type: string; tone: string };

const STEPS: Step[] = [
  { phase: "assign", line: 1, title: "value holds a number", note: "typeof value is \"number\". Nothing about the slot says it must stay one.", value: "101", type: "number", tone: "text-emerald-200" },
  { phase: "assign", line: 2, title: "now a string", note: "Same slot, different type. No cast, no error, no declaration needed — the type simply follows the new value.", value: '"Room 101"', type: "string", tone: "text-amber-200" },
  { phase: "assign", line: 3, title: "now a boolean", note: "Third type in three lines.", value: "true", type: "boolean", tone: "text-violet-200" },
  { phase: "assign", line: 4, title: "now… undefined", note: "undefined is just another type a variable can carry, same as any other. (This line is the anti-pattern from the next section — prefer null for a deliberate \"nothing\".)", value: "undefined", type: "undefined", tone: "text-ink-dim" },
];

const phases: Record<Step["phase"], PhaseStyle> = { assign: { label: "Code execution phase", className: PHASE.green } };

export default function LooseTypingStepper() {
  return (
    <Stepper steps={STEPS} phases={phases} caption="Step through the four assignments. The slot never changes; its type is whatever the current value happens to be." interval={1600}>
      {(step) => (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
            <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">loose.js</div>
            <pre className="my-0 overflow-x-auto rounded-none border-0 bg-transparent px-0 py-2 text-[0.78rem]">
              {SOURCE.map((src, n) => {
                const ln = n + 1;
                const active = step.line === ln;
                return (
                  <div key={ln} className={`grid grid-cols-[2rem_1fr] px-3 py-0.5 ${active ? "bg-emerald-400/20" : ""}`}>
                    <span className="select-none text-ink-dim/60">{ln}</span>
                    <code className={active ? "text-ink" : "text-ink-dim"}>{src}</code>
                  </div>
                );
              })}
            </pre>
          </div>
          <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
            <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">memory · one slot</div>
            <div className="p-3 font-mono text-[0.8rem]">
              <div className="flex justify-between rounded border border-line bg-bg-elev px-2 py-1.5"><span className="text-sky-strong">value</span><span className={step.tone}>{step.value}</span></div>
              <div className="mt-3 flex justify-between rounded px-2 py-1"><span className="text-ink-dim">typeof value</span><span className={step.tone}>&quot;{step.type}&quot;</span></div>
              <div className="mt-2 flex gap-1">
                {["number", "string", "boolean", "undefined"].map((t) => (
                  <span key={t} className={`rounded-full border px-2 py-0.5 text-[0.62rem] ${t === step.type ? "border-sky/60 bg-sky-soft text-sky" : "border-line text-ink-dim/60"}`}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Stepper>
  );
}
