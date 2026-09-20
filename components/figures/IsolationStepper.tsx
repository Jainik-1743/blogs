"use client";

import Stepper, { PHASE, type PhaseStyle, type StepBase } from "./Stepper";

/**
 * Live, step-through trace of the isolation example: three roomNumbers in
 * three separate Variable Environments, each one created fresh on call and
 * thrown away on pop, with the global one never touched.
 */

const SOURCE = [
  "var roomNumber = 1;",
  "",
  "function frontDesk() {",
  "  var roomNumber = 10;",
  "  console.log(roomNumber);",
  "}",
  "",
  "function housekeeping() {",
  "  var roomNumber = 100;",
  "  console.log(roomNumber);",
  "}",
  "",
  "frontDesk();",
  "housekeeping();",
  "console.log(roomNumber);",
];

type Vars = Record<string, string>;
type Frame = { name: string; vars: Vars; tone: "global" | "front" | "house" };

type Step = StepBase & {
  phase: "setup" | "push" | "run" | "pop" | "done";
  line: number | null;
  stack: Frame[];
  console: string[];
  changed?: string[];
  /** Which frame's roomNumber is being read this step. */
  reading?: number;
};

const U = "undefined";
const FN = "{ …code }";
const g = (room: string): Frame => ({ name: "Global EC", vars: { roomNumber: room, frontDesk: FN, housekeeping: FN }, tone: "global" });
const front = (room: string): Frame => ({ name: "frontDesk EC", vars: { roomNumber: room }, tone: "front" });
const house = (room: string): Frame => ({ name: "housekeeping EC", vars: { roomNumber: room }, tone: "house" });
const G = g("1");

const STEPS: Step[] = [
  {
    phase: "setup",
    line: null,
    title: "Global EC — memory phase",
    note: "roomNumber → undefined, both functions fully hoisted. This is the head receptionist's notepad.",
    stack: [g(U)],
    console: [],
    changed: ["roomNumber", "frontDesk", "housekeeping"],
  },
  {
    phase: "run",
    line: 1,
    title: "Global EC — code phase begins",
    note: "roomNumber = 1 runs. The two function declarations have nothing to execute, so the engine skips to line 13.",
    stack: [G],
    console: [],
    changed: ["roomNumber"],
  },
  {
    phase: "push",
    line: 13,
    title: "frontDesk() called → brand-new EC pushed",
    note: "Its own private Variable Environment. Memory phase: a second, separate roomNumber → undefined. The global roomNumber underneath is a different slot entirely.",
    stack: [G, front(U)],
    console: [],
    changed: ["roomNumber"],
  },
  {
    phase: "run",
    line: 4,
    title: "Inside frontDesk · line 4",
    note: "roomNumber = 10 — written into frontDesk's own slot. Global's roomNumber is still 1.",
    stack: [G, front("10")],
    console: [],
    changed: ["roomNumber"],
  },
  {
    phase: "run",
    line: 5,
    title: "Inside frontDesk · line 5",
    note: "console.log(roomNumber) looks in its own memory first, finds 10, and prints it. It never needs to look further out.",
    stack: [G, front("10")],
    console: ["10"],
    reading: 1,
  },
  {
    phase: "pop",
    line: 6,
    title: "frontDesk finishes → popped",
    note: "Its entire notepad is thrown away. That roomNumber = 10 no longer exists anywhere.",
    stack: [G],
    console: ["10"],
  },
  {
    phase: "push",
    line: 14,
    title: "housekeeping() called → another brand-new, unrelated EC",
    note: "Its own private roomNumber → undefined. It has no connection to frontDesk's — that one is already gone.",
    stack: [G, house(U)],
    console: ["10"],
    changed: ["roomNumber"],
  },
  {
    phase: "run",
    line: 9,
    title: "Inside housekeeping · line 9",
    note: "roomNumber = 100 in housekeeping's own slot.",
    stack: [G, house("100")],
    console: ["10"],
    changed: ["roomNumber"],
  },
  {
    phase: "run",
    line: 10,
    title: "Inside housekeeping · line 10",
    note: "Prints 100 from its own memory.",
    stack: [G, house("100")],
    console: ["10", "100"],
    reading: 1,
  },
  {
    phase: "pop",
    line: 11,
    title: "housekeeping finishes → popped",
    note: "Notepad discarded.",
    stack: [G],
    console: ["10", "100"],
  },
  {
    phase: "run",
    line: 15,
    title: "Back in Global · line 15",
    note: "roomNumber here was never touched by either call — prints 1. Three roomNumbers, three separate memory spots, zero interference.",
    stack: [G],
    console: ["10", "100", "1"],
    reading: 0,
  },
  {
    phase: "done",
    line: null,
    title: "Program ends",
    note: "Global EC popped, stack empty.",
    stack: [],
    console: ["10", "100", "1"],
  },
];

const phases: Record<Step["phase"], PhaseStyle> = {
  setup: { label: "Setup · memory phase", className: PHASE.violet },
  push: { label: "Push · fresh Variable Environment", className: PHASE.violet },
  run: { label: "Running · top of stack", className: PHASE.green },
  pop: { label: "Pop · Variable Environment discarded", className: PHASE.amber },
  done: { label: "Finished", className: PHASE.plain },
};

const frameTone: Record<Frame["tone"], string> = {
  global: "border-line bg-bg-elev",
  front: "border-emerald-400/50 bg-emerald-400/10",
  house: "border-violet-400/50 bg-violet-400/10",
};

export default function IsolationStepper() {
  return (
    <Stepper
      steps={STEPS}
      phases={phases}
      caption="Step through the program. Each call gets a fresh notepad with its own roomNumber; each pop throws that notepad away; Global's roomNumber is never touched."
    >
      {(step) => (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.1fr_1fr]">
          <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
            <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">isolation.js</div>
            <pre className="my-0 overflow-x-auto rounded-none border-0 bg-transparent px-0 py-2 text-[0.78rem]">
              {SOURCE.map((src, n) => {
                const ln = n + 1;
                const active = step.line === ln;
                return (
                  <div key={ln} className={`grid grid-cols-[2rem_1fr] px-3 py-0.5 ${active ? (step.phase === "push" ? "bg-violet-400/20" : step.phase === "pop" ? "bg-amber-400/20" : "bg-emerald-400/20") : ""}`}>
                    <span className="select-none text-ink-dim/60">{ln}</span>
                    <code className={active ? "text-ink" : "text-ink-dim"}>{src || " "}</code>
                  </div>
                );
              })}
            </pre>
          </div>

          <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
              <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">Call stack · one notepad per frame</div>
              <div className="flex min-h-[12rem] flex-col-reverse justify-start gap-2 p-3">
                {step.stack.length === 0 ? (
                  <div className="py-6 text-center font-mono text-[0.8rem] text-ink-dim">[ ]  empty</div>
                ) : (
                  step.stack.map((frame, fi) => {
                    const top = fi === step.stack.length - 1;
                    return (
                      <div key={frame.name} className={`rounded-lg border px-3 py-2 ${frameTone[frame.tone]} ${top ? "" : "opacity-60"}`}>
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="text-[0.85rem] font-semibold text-ink">{frame.name}</span>
                          <span className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-ink-dim">{top ? "running" : "paused"}</span>
                        </div>
                        <table className="my-0 w-full text-[0.78rem]">
                          <tbody>
                            {Object.entries(frame.vars).map(([k, v]) => {
                              const flash = top && step.changed?.includes(k);
                              const read = step.reading === fi && k === "roomNumber";
                              return (
                                <tr key={k} className={flash ? "bg-amber-400/15" : read ? "bg-sky-soft" : ""}>
                                  <td className="border-0 px-1 py-0.5 font-mono text-sky-strong">{k}{read ? <span className="ml-1 text-[0.6rem] uppercase text-sky">← read</span> : null}</td>
                                  <td className="border-0 px-1 py-0.5 text-right font-mono"><span className={v === U ? "text-ink-dim" : v === FN ? "text-amber-200" : "text-emerald-200"}>{v}</span></td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
              <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">Console</div>
              <div className="min-h-[3.5rem] px-3 py-2 font-mono text-[0.8rem]">
                {step.console.length === 0 ? <span className="text-ink-dim">(nothing printed yet)</span> : step.console.map((line, i) => (
                  <div key={`${line}-${i}`} className={i === step.console.length - 1 && step.phase === "run" ? "text-emerald-200" : "text-ink"}>› {line}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Stepper>
  );
}
