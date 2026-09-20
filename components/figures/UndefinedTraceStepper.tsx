"use client";

import Stepper, { PHASE, type PhaseStyle, type StepBase } from "./Stepper";

/**
 * Live, step-through trace of the lesson's example: one reserved-but-empty
 * slot, one name with no slot at all, the safe typeof path and the crash.
 */

const SOURCE = [
  "console.log(hotelName);      // undefined",
  'console.log(typeof unknownX); // "undefined"',
  "console.log(unknownX);       // ReferenceError",
  "",
  'var hotelName = "Grand Palace";',
  "console.log(hotelName);      // \"Grand Palace\"",
];

type Step = StepBase & {
  phase: "memory" | "code" | "typeof" | "error" | "continue" | "done";
  line: number | null;
  hotelName: string;
  /** Which slot the lookup is touching. */
  probe?: "hotelName" | "unknownX";
  probeSafe?: boolean;
  console: { text: string; tone: "ok" | "dim" | "bad" | "ink" }[];
  halted?: boolean;
};

const STEPS: Step[] = [
  { phase: "memory", line: null, title: "Memory phase", note: "hotelName → undefined reserved, because of the var on line 5. unknownX is never declared anywhere, so nothing is reserved for it at all — there is no slot with that name.", hotelName: "undefined", console: [] },
  { phase: "code", line: 1, title: "console.log(hotelName)", note: "The reserved slot exists, just empty so far. undefined is a real value, so it is printed. No error.", hotelName: "undefined", probe: "hotelName", console: [{ text: "undefined", tone: "dim" }] },
  { phase: "typeof", line: 2, title: "console.log(typeof unknownX)", note: 'typeof is the one operator that does not throw on a missing name. It looks for a slot, finds none, and answers with the string "undefined" — safe, no crash.', hotelName: "undefined", probe: "unknownX", probeSafe: true, console: [{ text: "undefined", tone: "dim" }, { text: '"undefined"', tone: "ok" }] },
  { phase: "error", line: 3, title: "console.log(unknownX) → ReferenceError", note: "Direct access has no safety net. The lookup finds no slot in any scope and throws ReferenceError: unknownX is not defined. Uncaught, this halts the script — lines 5 and 6 never run.", hotelName: "undefined", probe: "unknownX", console: [{ text: "undefined", tone: "dim" }, { text: '"undefined"', tone: "ok" }, { text: "ReferenceError: unknownX is not defined", tone: "bad" }], halted: true },
  { phase: "continue", line: 5, title: "Same file without line 3 — hotelName is assigned", note: "To see the rest of the trace, delete line 3 (or catch the error). Now execution reaches line 5 and \"Grand Palace\" replaces the placeholder in the slot that has been there since the memory phase.", hotelName: '"Grand Palace"', console: [{ text: "undefined", tone: "dim" }, { text: '"undefined"', tone: "ok" }] },
  { phase: "continue", line: 6, title: "console.log(hotelName)", note: "Now printing it gives the real value, \"Grand Palace\".", hotelName: '"Grand Palace"', probe: "hotelName", console: [{ text: "undefined", tone: "dim" }, { text: '"undefined"', tone: "ok" }, { text: '"Grand Palace"', tone: "ok" }] },
  { phase: "done", line: null, title: "Two situations, one file", note: "hotelName: a slot that existed all along, empty until line 5. unknownX: no slot, ever — safe to probe with typeof, a crash to read directly.", hotelName: '"Grand Palace"', console: [{ text: "undefined", tone: "dim" }, { text: '"undefined"', tone: "ok" }, { text: '"Grand Palace"', tone: "ok" }] },
];

const phases: Record<Step["phase"], PhaseStyle> = {
  memory: { label: "Memory creation phase", className: PHASE.violet },
  code: { label: "Code execution phase", className: PHASE.green },
  typeof: { label: "typeof · safe check", className: PHASE.sky },
  error: { label: "ReferenceError", className: PHASE.red },
  continue: { label: "Continuing without line 3", className: PHASE.amber },
  done: { label: "Finished", className: PHASE.plain },
};

const tone = { ok: "text-emerald-200", dim: "text-ink-dim", bad: "text-red-300", ink: "text-ink" };

export default function UndefinedTraceStepper() {
  return (
    <Stepper steps={STEPS} phases={phases} caption="Step through the file. Watch the lookup land on a real-but-empty slot, on no slot at all (safely, via typeof), and on no slot at all directly — which crashes." interval={2400}>
      {(step) => {
        const skip = step.phase === "continue" || step.phase === "done";
        return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.15fr_1fr]">
            <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
              <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">undefined.js</div>
              <pre className="my-0 overflow-x-auto rounded-none border-0 bg-transparent px-0 py-2 text-[0.76rem]">
                {SOURCE.map((src, n) => {
                  const ln = n + 1;
                  const active = step.line === ln;
                  const struck = (skip && ln === 3) || (step.halted && ln > 3);
                  return (
                    <div key={ln} className={`grid grid-cols-[2rem_1fr] px-3 py-0.5 ${active ? (step.phase === "error" ? "bg-red-400/20" : step.phase === "typeof" ? "bg-sky-soft" : step.phase === "continue" ? "bg-amber-400/20" : "bg-emerald-400/20") : ""} ${struck ? "line-through opacity-40" : ""}`}>
                      <span className="select-none text-ink-dim/60">{ln}</span>
                      <code className={active ? "text-ink" : "text-ink-dim"}>{src || " "}</code>
                    </div>
                  );
                })}
              </pre>
            </div>
            <div className="flex flex-col gap-4">
              <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
                <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">Global EC · memory</div>
                <div className="space-y-2 p-3 font-mono text-[0.78rem]">
                  <div className={`flex justify-between rounded border px-2 py-1 ${step.probe === "hotelName" ? "border-emerald-400/60 bg-emerald-400/10" : "border-line bg-bg-elev"}`}>
                    <span className="text-sky-strong">hotelName{step.probe === "hotelName" ? <span className="ml-1 text-[0.6rem] uppercase text-emerald-300">← read</span> : null}</span>
                    <span className={step.hotelName === "undefined" ? "text-ink-dim" : "text-emerald-200"}>{step.hotelName}</span>
                  </div>
                  <div className={`flex items-center justify-between rounded border border-dashed px-2 py-1 ${step.probe === "unknownX" ? (step.probeSafe ? "border-sky/70 bg-sky-soft" : "border-red-400/70 bg-red-400/10") : "border-line/60 text-ink-dim/50"}`}>
                    <span className={step.probe === "unknownX" ? (step.probeSafe ? "text-sky" : "text-red-300") : "text-ink-dim/50"}>unknownX{step.probe === "unknownX" ? <span className="ml-1 text-[0.6rem] uppercase">← {step.probeSafe ? "typeof asks" : "read"}</span> : null}</span>
                    <span className={step.probe === "unknownX" ? (step.probeSafe ? "text-sky" : "text-red-300") : "text-ink-dim/50"}>no slot</span>
                  </div>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
                <div className="flex items-center justify-between border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim"><span>Console</span>{step.halted ? <span className="text-red-300">✕ halted</span> : null}</div>
                <div className="min-h-[4rem] px-3 py-2 font-mono text-[0.78rem]">
                  {step.console.length === 0 ? <span className="text-ink-dim">(nothing yet)</span> : step.console.map((c, i) => <div key={i} className={tone[c.tone]}>› {c.text}</div>)}
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </Stepper>
  );
}
