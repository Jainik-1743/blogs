"use client";

import Stepper, { PHASE, type PhaseStyle, type StepBase } from "./Stepper";

/**
 * Three two-line programs stepped in lockstep: the same mistake (reading a
 * variable before its line) with var, with let, and with no declaration at
 * all — three different memories, three different results.
 */

type Panel = {
  title: string;
  source: string[];
  /** Memory slot, or null when nothing was ever reserved. */
  slot: { name: string; value: string; locked?: boolean } | null;
  console: string;
  consoleTone: "dim" | "ok" | "bad";
  /** Program halted by an error. */
  dead?: boolean;
};

type Step = StepBase & {
  phase: "memory" | "code" | "done";
  line: number | null;
  panels: [Panel, Panel, Panel];
};

const SRC_VAR = ["console.log(guestName);", 'var guestName = "Aditi";'];
const SRC_LET = ["console.log(guestName);", 'let guestName = "Aditi";'];
const SRC_NONE = ["console.log(guestName);", "// never declared anywhere"];

const STEPS: Step[] = [
  {
    phase: "memory",
    line: null,
    title: "Memory creation phase — all three files scanned",
    note: "var guestName gets a slot holding undefined. let guestName also gets a slot — it is hoisted too — but the slot is locked: this is the Temporal Dead Zone. The third file declares nothing, so nothing is reserved at all.",
    panels: [
      { title: "var", source: SRC_VAR, slot: { name: "guestName", value: "undefined" }, console: "", consoleTone: "dim" },
      { title: "let", source: SRC_LET, slot: { name: "guestName", value: "🔒 TDZ", locked: true }, console: "", consoleTone: "dim" },
      { title: "never declared", source: SRC_NONE, slot: null, console: "", consoleTone: "dim" },
    ],
  },
  {
    phase: "code",
    line: 1,
    title: "Line 1 runs — read the variable before its line",
    note: "var: the slot exists and holds undefined, so that is printed. No error. let: the slot exists but is locked — ReferenceError: Cannot access 'guestName' before initialization. Never declared: there is no slot to find — ReferenceError: guestName is not defined. Two ReferenceErrors, two different messages, two different situations.",
    panels: [
      { title: "var", source: SRC_VAR, slot: { name: "guestName", value: "undefined" }, console: "undefined", consoleTone: "ok" },
      { title: "let", source: SRC_LET, slot: { name: "guestName", value: "🔒 TDZ", locked: true }, console: "ReferenceError: Cannot access 'guestName' before initialization", consoleTone: "bad", dead: true },
      { title: "never declared", source: SRC_NONE, slot: null, console: "ReferenceError: guestName is not defined", consoleTone: "bad", dead: true },
    ],
  },
  {
    phase: "code",
    line: 2,
    title: "Line 2 runs — the declaration line",
    note: 'var: undefined is replaced by "Aditi". let: this line is never reached — the program already stopped on line 1. Had line 1 not been there, this is the line that would have unlocked the slot and ended the TDZ.',
    panels: [
      { title: "var", source: SRC_VAR, slot: { name: "guestName", value: '"Aditi"' }, console: "undefined", consoleTone: "ok" },
      { title: "let", source: SRC_LET, slot: { name: "guestName", value: "🔒 TDZ", locked: true }, console: "ReferenceError: Cannot access 'guestName' before initialization", consoleTone: "bad", dead: true },
      { title: "never declared", source: SRC_NONE, slot: null, console: "ReferenceError: guestName is not defined", consoleTone: "bad", dead: true },
    ],
  },
  {
    phase: "done",
    line: null,
    title: "Same mistake, three results",
    note: "undefined (exists, empty) · Cannot access before initialization (exists, locked) · is not defined (never existed). Knowing these three apart is the whole point of this lesson.",
    panels: [
      { title: "var", source: SRC_VAR, slot: { name: "guestName", value: '"Aditi"' }, console: "undefined", consoleTone: "ok" },
      { title: "let", source: SRC_LET, slot: { name: "guestName", value: "🔒 TDZ", locked: true }, console: "ReferenceError: Cannot access 'guestName' before initialization", consoleTone: "bad", dead: true },
      { title: "never declared", source: SRC_NONE, slot: null, console: "ReferenceError: guestName is not defined", consoleTone: "bad", dead: true },
    ],
  },
];

const phases: Record<Step["phase"], PhaseStyle> = {
  memory: { label: "Memory creation phase", className: PHASE.violet },
  code: { label: "Code execution phase", className: PHASE.green },
  done: { label: "Finished", className: PHASE.plain },
};

const consoleTone = { dim: "text-ink-dim", ok: "text-emerald-200", bad: "text-red-300" };

export default function TdzStepper() {
  return (
    <Stepper
      steps={STEPS}
      phases={phases}
      caption="Step through the same two lines three ways. All three are scanned in the memory phase; only var gets a usable placeholder."
      interval={2600}
    >
      {(step) => (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {step.panels.map((p) => (
            <div key={p.title} className={`overflow-hidden rounded-lg border bg-bg-code ${p.dead ? "border-red-400/40" : "border-line"}`}>
              <div className="flex items-center justify-between border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">
                <span className="text-sky">{p.title}</span>
                {p.dead ? <span className="text-red-300">✕ halted</span> : null}
              </div>
              <pre className="my-0 overflow-x-auto rounded-none border-0 bg-transparent px-0 py-2 text-[0.76rem]">
                {p.source.map((src, n) => {
                  const ln = n + 1;
                  const active = step.line === ln && !(p.dead && ln > 1);
                  return (
                    <div key={ln} className={`grid grid-cols-[1.5rem_1fr] px-3 py-0.5 ${active ? "bg-emerald-400/20" : ""} ${p.dead && ln > 1 ? "line-through opacity-40" : ""}`}>
                      <span className="select-none text-ink-dim/60">{ln}</span>
                      <code className={active ? "text-ink" : "text-ink-dim"}>{src}</code>
                    </div>
                  );
                })}
              </pre>
              <div className="border-t border-line px-3 py-2">
                <div className="mb-1 font-mono text-[0.65rem] uppercase tracking-[0.08em] text-ink-dim">memory</div>
                {p.slot ? (
                  <div className={`flex justify-between rounded px-2 py-1 font-mono text-[0.78rem] ${p.slot.locked ? "bg-red-400/10" : "bg-bg-elev"}`}>
                    <span className="text-sky-strong">{p.slot.name}</span>
                    <span className={p.slot.locked ? "text-red-300" : p.slot.value === "undefined" ? "text-ink-dim" : "text-emerald-200"}>{p.slot.value}</span>
                  </div>
                ) : (
                  <div className="rounded border border-dashed border-line px-2 py-1 text-center font-mono text-[0.75rem] text-ink-dim">no slot at all</div>
                )}
              </div>
              <div className="border-t border-line px-3 py-2">
                <div className="mb-1 font-mono text-[0.65rem] uppercase tracking-[0.08em] text-ink-dim">console</div>
                <div className={`min-h-[2.5rem] font-mono text-[0.76rem] [overflow-wrap:anywhere] ${consoleTone[p.consoleTone]}`}>
                  {p.console ? `› ${p.console}` : "(nothing yet)"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Stepper>
  );
}
