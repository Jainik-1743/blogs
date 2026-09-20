"use client";

import Stepper, { PHASE, type PhaseStyle, type StepBase } from "./Stepper";

/**
 * Live, step-through trace of the checkIn example: the Global EC's memory
 * shown as its two real records, the checkIn EC with its own memory, and the
 * if-block's scope appearing (with let/const locked in the TDZ), unlocking,
 * and vanishing when the block closes.
 */

const SOURCE = [
  'var hotelName = "Grand Palace";',
  "",
  "function checkIn(guestName) {",
  "  if (guestName) {",
  "    let roomNumber = 101;",
  "    const confirmed = true;",
  '    console.log(guestName + " checked into room " + roomNumber);',
  "  }",
  '  console.log(typeof roomNumber); // "undefined"',
  "}",
  "",
  'checkIn("Aditi");',
];

type Vars = Record<string, string>;
type Section = { label: string; vars: Vars; tone: "object" | "declarative" | "local" | "block" };
type Frame = { name: string; sections: Section[]; tone: "global" | "fn" };

type Step = StepBase & {
  phase: "setup" | "push" | "run" | "block" | "pop" | "done";
  line: number | null;
  stack: Frame[];
  console: string[];
  changed?: string[];
};

const U = "undefined";
const FN = "{ …code }";
const TDZ = "🔒 TDZ";

const globalEC = (hotel: string): Frame => ({
  name: "Global EC",
  tone: "global",
  sections: [
    { label: "Object Environment Record · window", vars: { hotelName: hotel, checkIn: FN }, tone: "object" },
    { label: "Declarative Environment Record", vars: {}, tone: "declarative" },
  ],
});
const checkInEC = (block?: Vars): Frame => ({
  name: "checkIn EC",
  tone: "fn",
  sections: [
    { label: "memory", vars: { guestName: '"Aditi"' }, tone: "local" },
    ...(block ? [{ label: "if { } block scope", vars: block, tone: "block" as const }] : []),
  ],
});

const G = globalEC('"Grand Palace"');
const OUT1 = "Aditi checked into room 101";

const STEPS: Step[] = [
  {
    phase: "setup",
    line: null,
    title: "Global EC pushed — memory phase",
    note: "Two records inside one context. hotelName (a var) and checkIn (a function) go into the Object Environment Record — they become real properties of window. There is no top-level let or const in this file, so the Declarative Environment Record stays empty.",
    stack: [globalEC(U)],
    console: [],
    changed: ["hotelName", "checkIn"],
  },
  {
    phase: "run",
    line: 1,
    title: "Line 1 runs",
    note: 'hotelName = "Grand Palace" replaces the placeholder. window.hotelName now returns it.',
    stack: [G],
    console: [],
    changed: ["hotelName"],
  },
  {
    phase: "push",
    line: 12,
    title: 'checkIn("Aditi") called → checkIn EC pushed',
    note: 'A new context with its own memory: guestName → "Aditi". Nothing else yet — roomNumber and confirmed belong to the block, and the block has not been entered.',
    stack: [G, checkInEC()],
    console: [],
    changed: ["guestName"],
  },
  {
    phase: "block",
    line: 4,
    title: "if (guestName) is true → block entered",
    note: "The engine creates a scope for the { }. roomNumber and confirmed are hoisted into it right now — but locked. From this line until each declaration runs, reading them throws. This is the TDZ.",
    stack: [G, checkInEC({ roomNumber: TDZ, confirmed: TDZ })],
    console: [],
    changed: ["roomNumber", "confirmed"],
  },
  {
    phase: "run",
    line: 5,
    title: "Line 5 — let roomNumber = 101",
    note: "The declaration line runs: roomNumber is unlocked and gets 101. confirmed is still locked.",
    stack: [G, checkInEC({ roomNumber: "101", confirmed: TDZ })],
    console: [],
    changed: ["roomNumber"],
  },
  {
    phase: "run",
    line: 6,
    title: "Line 6 — const confirmed = true",
    note: "confirmed is unlocked and bound to true. Being const, that binding can never be pointed at a different value.",
    stack: [G, checkInEC({ roomNumber: "101", confirmed: "true" })],
    console: [],
    changed: ["confirmed"],
  },
  {
    phase: "run",
    line: 7,
    title: "Line 7 — console.log inside the block",
    note: "guestName is found one level up in checkIn's memory; roomNumber is found right here in the block scope.",
    stack: [G, checkInEC({ roomNumber: "101", confirmed: "true" })],
    console: [OUT1],
  },
  {
    phase: "block",
    line: 8,
    title: "Block closes → its scope is discarded",
    note: "The } ends the block. roomNumber and confirmed stop existing. Had they been declared with var, they would have lived in checkIn's own memory instead and survived this line.",
    stack: [G, checkInEC()],
    console: [OUT1],
  },
  {
    phase: "run",
    line: 9,
    title: "Line 9 — typeof roomNumber",
    note: 'roomNumber does not exist anywhere in checkIn\'s memory now. typeof on a name that was never declared in scope returns the string "undefined" instead of throwing — the one safe way to probe.',
    stack: [G, checkInEC()],
    console: [OUT1, "undefined"],
  },
  {
    phase: "pop",
    line: 10,
    title: "checkIn finishes → popped",
    note: "Its whole private memory, block-scoped variables included, is discarded completely. Control returns to Global after line 12.",
    stack: [G],
    console: [OUT1, "undefined"],
  },
  {
    phase: "done",
    line: null,
    title: "Program ends",
    note: "Nothing left to run. Global EC popped, stack empty.",
    stack: [],
    console: [OUT1, "undefined"],
  },
];

const phases: Record<Step["phase"], PhaseStyle> = {
  setup: { label: "Setup · memory phase", className: PHASE.violet },
  push: { label: "Push · function called", className: PHASE.violet },
  run: { label: "Running · top of stack", className: PHASE.green },
  block: { label: "Block scope", className: PHASE.amber },
  pop: { label: "Pop · function finished", className: PHASE.amber },
  done: { label: "Finished", className: PHASE.plain },
};

const sectionTone: Record<Section["tone"], string> = {
  object: "border-emerald-400/40 bg-emerald-400/5",
  declarative: "border-violet-400/40 bg-violet-400/5",
  local: "border-line bg-bg-code",
  block: "border-amber-400/50 bg-amber-400/10",
};

export default function BlockScopeStepper() {
  return (
    <Stepper
      steps={STEPS}
      phases={phases}
      caption="Step through the program. Watch the two records inside the Global EC, the block scope appear with both bindings locked, unlock one line at a time, and vanish at the closing brace."
    >
      {(step) => (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.1fr_1fr]">
          {/* Source */}
          <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
            <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">
              checkin.js
            </div>
            <pre className="my-0 overflow-x-auto rounded-none border-0 bg-transparent px-0 py-2 text-[0.78rem]">
              {SOURCE.map((src, n) => {
                const ln = n + 1;
                const active = step.line === ln;
                const inBlock = ln >= 4 && ln <= 8;
                return (
                  <div
                    key={ln}
                    className={`grid grid-cols-[2rem_1fr] px-3 py-0.5 ${inBlock ? "border-l-2 border-amber-400/40" : "border-l-2 border-transparent"} ${
                      active ? (step.phase === "block" ? "bg-amber-400/20" : step.phase === "push" ? "bg-violet-400/20" : "bg-emerald-400/20") : ""
                    }`}
                  >
                    <span className="select-none text-ink-dim/60">{ln}</span>
                    <code className={active ? "text-ink" : "text-ink-dim"}>{src || " "}</code>
                  </div>
                );
              })}
            </pre>
          </div>

          <div className="flex flex-col gap-4">
            {/* Call stack */}
            <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
              <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">
                Call stack · top is running
              </div>
              <div className="flex min-h-[15rem] flex-col-reverse justify-start gap-2 p-3">
                {step.stack.length === 0 ? (
                  <div className="py-6 text-center font-mono text-[0.8rem] text-ink-dim">[ ]  empty</div>
                ) : (
                  step.stack.map((frame, fi) => {
                    const top = fi === step.stack.length - 1;
                    return (
                      <div key={frame.name} className={`rounded-lg border px-3 py-2 ${frame.tone === "global" ? "border-line bg-bg-elev" : "border-sky/60 bg-sky-soft"} ${top ? "" : "opacity-60"}`}>
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                          <span className="text-[0.85rem] font-semibold text-ink">{frame.name}</span>
                          <span className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-ink-dim">{top ? "running" : "paused"}</span>
                        </div>
                        <div className="space-y-1.5">
                          {frame.sections.map((s) => (
                            <div key={s.label} className={`rounded-md border px-2 py-1 ${sectionTone[s.tone]}`}>
                              <div className="mb-0.5 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-ink-dim">{s.label}</div>
                              {Object.keys(s.vars).length === 0 ? (
                                <div className="font-mono text-[0.72rem] text-ink-dim/70">(empty)</div>
                              ) : (
                                <table className="my-0 w-full text-[0.76rem]">
                                  <tbody>
                                    {Object.entries(s.vars).map(([k, v]) => {
                                      const flash = top && step.changed?.includes(k);
                                      return (
                                        <tr key={k} className={flash ? "bg-amber-400/15" : ""}>
                                          <td className="border-0 px-1 py-0.5 font-mono text-sky-strong">{k}</td>
                                          <td className="border-0 px-1 py-0.5 text-right font-mono">
                                            <span className={v === TDZ ? "text-red-300" : v === U ? "text-ink-dim" : v === FN ? "text-amber-200" : "text-emerald-200"}>{v}</span>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Console */}
            <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
              <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">
                Console
              </div>
              <div className="min-h-[3.5rem] px-3 py-2 font-mono text-[0.8rem]">
                {step.console.length === 0 ? (
                  <span className="text-ink-dim">(nothing printed yet)</span>
                ) : (
                  step.console.map((line, i) => (
                    <div key={`${line}-${i}`} className={i === step.console.length - 1 && step.phase === "run" ? "text-emerald-200" : "text-ink"}>
                      › {line}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Stepper>
  );
}
