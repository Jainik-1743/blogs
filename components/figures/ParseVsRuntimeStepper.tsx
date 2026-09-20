"use client";

import Stepper, { PHASE, type PhaseStyle, type StepBase } from "./Stepper";

/** Two files stepped in lockstep: one rejected at parse time, one that runs until a TDZ read. */

const LEFT = ['console.log("This never prints");', "let x = 1;", "let x = 2; // SyntaxError"];
const RIGHT = ['console.log("This DOES print");', "console.log(y); // ReferenceError", "let y = 1;"];

type Panel = { line: number | null; status: "reading" | "rejected" | "ok" | "running" | "crashed"; console: { text: string; bad?: boolean }[]; struckAll?: boolean; struckFrom?: number };
type Step = StepBase & { phase: "parse" | "run" | "done"; left: Panel; right: Panel };

const STEPS: Step[] = [
  { phase: "parse", title: "Before anything runs — the engine reads both whole files", note: "This is the parse phase. Every line is read and checked; nothing is executed yet. Both files are still just text.", left: { line: null, status: "reading", console: [] }, right: { line: null, status: "reading", console: [] } },
  { phase: "parse", title: "Left file: duplicate let found → rejected outright", note: "Two let x declarations in the same scope is a SyntaxError, and it is caught right here, while reading. The whole file is thrown out — line 1 will never run, correct as it is.", left: { line: 3, status: "rejected", console: [{ text: "SyntaxError: Identifier 'x' has already been declared", bad: true }], struckAll: true }, right: { line: null, status: "reading", console: [] } },
  { phase: "parse", title: "Right file: parses fine", note: "Reading y on line 2 before its declaration is not a syntax problem — the file is well-formed. y is hoisted into the TDZ. The engine moves on to executing it.", left: { line: null, status: "rejected", console: [{ text: "SyntaxError: Identifier 'x' has already been declared", bad: true }], struckAll: true }, right: { line: null, status: "ok", console: [] } },
  { phase: "run", title: "Right file · line 1 runs", note: "Execution starts normally. The first console.log prints.", left: { line: null, status: "rejected", console: [{ text: "SyntaxError: Identifier 'x' has already been declared", bad: true }], struckAll: true }, right: { line: 1, status: "running", console: [{ text: "This DOES print" }] } },
  { phase: "run", title: "Right file · line 2 → ReferenceError", note: "Execution reaches the read of y while it is still locked in the TDZ. A runtime error: it happens here, at this line, after everything above it ran.", left: { line: null, status: "rejected", console: [{ text: "SyntaxError: Identifier 'x' has already been declared", bad: true }], struckAll: true }, right: { line: 2, status: "crashed", console: [{ text: "This DOES print" }, { text: "ReferenceError: Cannot access 'y' before initialization", bad: true }], struckFrom: 3 } },
  { phase: "done", title: "Same shape, two categories of error", note: "SyntaxError: found while reading, nothing runs. ReferenceError: found while running, everything before it ran.", left: { line: null, status: "rejected", console: [{ text: "SyntaxError: Identifier 'x' has already been declared", bad: true }], struckAll: true }, right: { line: null, status: "crashed", console: [{ text: "This DOES print" }, { text: "ReferenceError: Cannot access 'y' before initialization", bad: true }], struckFrom: 3 } },
];

const phases: Record<Step["phase"], PhaseStyle> = {
  parse: { label: "Parse phase · reading the file", className: PHASE.violet },
  run: { label: "Execution phase", className: PHASE.green },
  done: { label: "Finished", className: PHASE.plain },
};

const badge: Record<Panel["status"], [string, string]> = {
  reading: ["reading…", "text-violet-300"],
  rejected: ["✕ rejected at parse", "text-red-300"],
  ok: ["parsed ✓", "text-emerald-300"],
  running: ["running", "text-emerald-300"],
  crashed: ["✕ crashed at runtime", "text-red-300"],
};

function File({ title, lines, p, phase }: { title: string; lines: string[]; p: Panel; phase: Step["phase"] }) {
  const [label, cls] = badge[p.status];
  return (
    <div className={`overflow-hidden rounded-lg border bg-bg-code ${p.status === "rejected" || p.status === "crashed" ? "border-red-400/40" : "border-line"}`}>
      <div className="flex items-center justify-between border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">
        <span>{title}</span><span className={cls}>{label}</span>
      </div>
      <pre className="my-0 overflow-x-auto rounded-none border-0 bg-transparent px-0 py-2 text-[0.76rem]">
        {lines.map((src, n) => {
          const ln = n + 1;
          const active = p.line === ln;
          const struck = p.struckAll || (p.struckFrom !== undefined && ln >= p.struckFrom);
          const bg = active ? (p.status === "rejected" || p.status === "crashed" ? "bg-red-400/20" : phase === "parse" ? "bg-violet-400/20" : "bg-emerald-400/20") : "";
          return (
            <div key={ln} className={`grid grid-cols-[1.6rem_1fr] px-3 py-0.5 ${bg} ${struck && !active ? "line-through opacity-40" : ""}`}>
              <span className="select-none text-ink-dim/60">{ln}</span>
              <code className={active ? "text-ink" : "text-ink-dim"}>{src}</code>
            </div>
          );
        })}
      </pre>
      <div className="min-h-[3.4rem] border-t border-line px-3 py-2 font-mono text-[0.74rem] [overflow-wrap:anywhere]">
        {p.console.length === 0 ? <span className="text-ink-dim">(console)</span> : p.console.map((c, i) => <div key={i} className={c.bad ? "text-red-300" : "text-emerald-200"}>› {c.text}</div>)}
      </div>
    </div>
  );
}

export default function ParseVsRuntimeStepper() {
  return (
    <Stepper steps={STEPS} phases={phases} caption="Step through both files together. One never gets past the read; the other runs normally until the exact line that reads a locked binding." interval={2400}>
      {(step) => (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <File title="syntax.js" lines={LEFT} p={step.left} phase={step.phase} />
          <File title="tdz.js" lines={RIGHT} p={step.right} phase={step.phase} />
        </div>
      )}
    </Stepper>
  );
}
