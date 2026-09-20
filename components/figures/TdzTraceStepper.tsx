"use client";

import Stepper, { PHASE, type PhaseStyle, type StepBase } from "./Stepper";

/** The lesson's checkIn example: rejected at parse, then fixed and traced to its TDZ error. */

const BROKEN = ["function checkIn() {", "  console.log(typeof roomReady);", "  let roomReady = true;", "  console.log(roomReady);", "", "  let roomReady = false; // duplicate", "}", "checkIn();"];
const FIXED = ["function checkIn() {", "  console.log(typeof roomReady); // TDZ", "  let roomReady = true;", "  console.log(roomReady);", "}", "checkIn();"];

type Step = StepBase & { phase: "parse" | "reject" | "fix" | "run" | "crash"; source: string[]; file: string; line: number | null; struckAll?: boolean; struckFrom?: number; slot?: "none" | "tdz"; console: { text: string; bad?: boolean }[] };

const STEPS: Step[] = [
  { phase: "parse", source: BROKEN, file: "checkin.js", line: null, title: "File is parsed first", note: "The engine reads through checkIn's body ahead of time — before checkIn() is ever called.", console: [] },
  { phase: "reject", source: BROKEN, file: "checkin.js", line: 6, title: "Two let roomReady in one scope → SyntaxError", note: "Raised immediately, during the read. Nothing inside checkIn ever runs — not the first console.log, not the assignment, not the second console.log. The call on line 8 never happens either.", struckAll: true, console: [{ text: "SyntaxError: Identifier 'roomReady' has already been declared", bad: true }] },
  { phase: "fix", source: FIXED, file: "checkin.js · fixed", line: null, title: "Fixing it — remove the duplicate", note: "Now the file parses. checkIn() is called and a context is created; its memory phase hoists roomReady into the TDZ.", slot: "tdz", console: [] },
  { phase: "crash", source: FIXED, file: "checkin.js · fixed", line: 2, title: "Line 2 — a different error: the typeof TDZ gotcha", note: "roomReady has a slot, but it is locked until line 3. typeof cannot rescue it: ReferenceError: Cannot access 'roomReady' before initialization. Line 3 and 4 never run.", slot: "tdz", struckFrom: 3, console: [{ text: "ReferenceError: Cannot access 'roomReady' before initialization", bad: true }] },
];

const phases: Record<Step["phase"], PhaseStyle> = {
  parse: { label: "Parse phase", className: PHASE.violet },
  reject: { label: "SyntaxError · caught before running", className: PHASE.red },
  fix: { label: "Fixed file · memory phase", className: PHASE.amber },
  run: { label: "Running", className: PHASE.green },
  crash: { label: "ReferenceError · caught while running", className: PHASE.red },
};

export default function TdzTraceStepper() {
  return (
    <Stepper steps={STEPS} phases={phases} caption="Step through the example twice: once as written (rejected before any line runs), then fixed (runs, and hits the typeof TDZ gotcha on its first line)." interval={2600}>
      {(step) => (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.2fr_1fr]">
          <div className={`overflow-hidden rounded-lg border bg-bg-code ${step.phase === "reject" || step.phase === "crash" ? "border-red-400/40" : "border-line"}`}>
            <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">{step.file}</div>
            <pre className="my-0 overflow-x-auto rounded-none border-0 bg-transparent px-0 py-2 text-[0.76rem]">
              {step.source.map((src, n) => {
                const ln = n + 1;
                const active = step.line === ln;
                const struck = (step.struckAll && !active) || (step.struckFrom !== undefined && ln >= step.struckFrom && ln <= 4);
                return (
                  <div key={ln} className={`grid grid-cols-[2rem_1fr] px-3 py-0.5 ${active ? "bg-red-400/20" : ""} ${struck ? "line-through opacity-40" : ""}`}>
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
            <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">checkIn EC · memory</div>
            <div className="p-3 font-mono text-[0.78rem]">
              {step.slot === "tdz" ? (
                <div className={`flex justify-between rounded border px-2 py-1 ${step.phase === "crash" ? "border-red-400/70 bg-red-400/10" : "border-line bg-bg-elev"}`}><span className="text-sky-strong">roomReady</span><span className="text-red-300">🔒 TDZ</span></div>
              ) : (
                <div className="rounded border border-dashed border-line px-2 py-3 text-center text-ink-dim">{step.phase === "reject" ? "never created — file rejected" : "not created yet"}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </Stepper>
  );
}
