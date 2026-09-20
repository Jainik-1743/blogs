"use client";

import Stepper, { PHASE, type PhaseStyle, type StepBase } from "./Stepper";

/**
 * Step-through of Rule 1: housekeeping asks for roomNumber, looks in its own
 * memory, follows its outer reference to Global, finds nothing — and never
 * gets to look sideways into frontDesk, which is already gone anyway.
 */

const SOURCE = [
  "function frontDesk() {",
  "  var roomNumber = 10;",
  "}",
  "",
  "function housekeeping() {",
  "  console.log(roomNumber);",
  "}",
  "",
  "frontDesk();",
  "housekeeping();",
];

type Box = { name: string; vars: Record<string, string>; state: "live" | "gone" | "checking" | "miss" | "idle"; outer?: string };

type Step = StepBase & {
  phase: "run" | "lookup" | "fail";
  line: number | null;
  boxes: Box[];
  console?: string;
};

const FN = "{ …code }";
const globalBox = (state: Box["state"]): Box => ({ name: "Global", vars: { frontDesk: FN, housekeeping: FN }, state, outer: "null" });

const STEPS: Step[] = [
  {
    phase: "run",
    line: 9,
    title: "frontDesk() runs and finishes",
    note: "It writes roomNumber = 10 into its own Variable Environment, then returns. That environment is popped and discarded — by the time line 10 runs, it does not exist.",
    boxes: [globalBox("idle"), { name: "frontDesk", vars: { roomNumber: "10" }, state: "gone", outer: "Global" }],
  },
  {
    phase: "lookup",
    line: 6,
    title: "housekeeping() asks for roomNumber — check its own memory first",
    note: "The engine always starts in the current context's own Variable Environment. housekeeping declared nothing, so: not here.",
    boxes: [globalBox("idle"), { name: "frontDesk", vars: { roomNumber: "10" }, state: "gone", outer: "Global" }, { name: "housekeeping", vars: {}, state: "checking", outer: "Global" }],
  },
  {
    phase: "lookup",
    line: 6,
    title: "Follow the outer reference → Global",
    note: "Not found locally, so the engine follows the one link it has: the outer reference in housekeeping's Lexical Environment, which points to where the function was written — Global. Global has frontDesk and housekeeping, but no roomNumber.",
    boxes: [globalBox("checking"), { name: "frontDesk", vars: { roomNumber: "10" }, state: "gone", outer: "Global" }, { name: "housekeeping", vars: {}, state: "miss", outer: "Global" }],
  },
  {
    phase: "fail",
    line: 6,
    title: "Global's outer is null → ReferenceError",
    note: "There is nowhere left to look. Sideways into frontDesk was never an option: no link points there, and its memory is gone anyway. ReferenceError: roomNumber is not defined.",
    boxes: [globalBox("miss"), { name: "frontDesk", vars: { roomNumber: "10" }, state: "gone", outer: "Global" }, { name: "housekeeping", vars: {}, state: "miss", outer: "Global" }],
    console: "ReferenceError: roomNumber is not defined",
  },
];

const phases: Record<Step["phase"], PhaseStyle> = {
  run: { label: "Running", className: PHASE.green },
  lookup: { label: "Variable lookup · outward only", className: PHASE.sky },
  fail: { label: "Not found anywhere", className: PHASE.red },
};

const stateClass: Record<Box["state"], string> = {
  idle: "border-line bg-bg-elev",
  live: "border-line bg-bg-elev",
  checking: "border-sky/70 bg-sky-soft ring-1 ring-sky/50",
  miss: "border-red-400/50 bg-red-400/10",
  gone: "border-dashed border-line opacity-40 line-through",
};

export default function SiblingLookupStepper() {
  return (
    <Stepper
      steps={STEPS}
      phases={phases}
      caption="Step through the lookup. It goes own memory → outer reference → Global → null. There is no arrow to a sibling, so frontDesk's roomNumber is unreachable — and already gone."
      interval={2400}
    >
      {(step) => {
        const [global, front, house] = step.boxes;
        const Box = ({ b }: { b: Box }) => (
          <div className={`rounded-lg border px-3 py-2 ${stateClass[b.state]}`}>
            <div className="mb-1 flex items-center justify-between gap-2 text-[0.82rem] font-semibold text-ink">
              <span>{b.name}</span>
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-ink-dim">
                {b.state === "gone" ? "popped · gone" : b.state === "checking" ? "looking here" : b.state === "miss" ? "not here" : ""}
              </span>
            </div>
            <ul className="m-0 list-none space-y-0.5 p-0 font-mono text-[0.75rem]">
              {Object.keys(b.vars).length === 0 ? <li className="text-ink-dim">(no roomNumber)</li> : Object.entries(b.vars).map(([k, v]) => (
                <li key={k} className="flex justify-between"><span className="text-sky-strong">{k}</span><span className="text-emerald-200">{v}</span></li>
              ))}
              {b.outer ? <li className="mt-1 flex justify-between border-t border-line pt-1"><span className="text-ink-dim">outer →</span><span className={b.outer === "null" ? "text-red-300" : "text-sky"}>{b.outer}</span></li> : null}
            </ul>
          </div>
        );
        return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1.2fr]">
            <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
              <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">siblings.js</div>
              <pre className="my-0 overflow-x-auto rounded-none border-0 bg-transparent px-0 py-2 text-[0.78rem]">
                {SOURCE.map((src, n) => {
                  const ln = n + 1;
                  const active = step.line === ln;
                  return (
                    <div key={ln} className={`grid grid-cols-[2rem_1fr] px-3 py-0.5 ${active ? (step.phase === "fail" ? "bg-red-400/20" : step.phase === "lookup" ? "bg-sky-soft" : "bg-emerald-400/20") : ""}`}>
                      <span className="select-none text-ink-dim/60">{ln}</span>
                      <code className={active ? "text-ink" : "text-ink-dim"}>{src || " "}</code>
                    </div>
                  );
                })}
              </pre>
              <div className="border-t border-line px-3 py-2 font-mono text-[0.78rem]">
                {step.console ? <span className="text-red-300">› {step.console}</span> : <span className="text-ink-dim">(console)</span>}
              </div>
            </div>
            <div className="rounded-lg border border-line bg-bg-code p-3">
              <div className="grid grid-cols-2 gap-3">
                <Box b={front} />
                {house ? <Box b={house} /> : <div className="rounded-lg border border-dashed border-line px-3 py-2 text-center font-mono text-[0.7rem] text-ink-dim">housekeeping<br />not called yet</div>}
              </div>
              <div className="my-1 grid grid-cols-2 text-center font-mono text-[0.9rem]">
                <span className="text-ink-dim/40">↓</span>
                <span className={house?.state === "miss" || global.state !== "idle" ? "text-sky" : "text-ink-dim/40"}>↓ outer</span>
              </div>
              <div className="mb-2 text-center font-mono text-[0.62rem] uppercase tracking-[0.08em] text-ink-dim">no line ever connects the two boxes above</div>
              <Box b={global} />
            </div>
          </div>
        );
      }}
    </Stepper>
  );
}
