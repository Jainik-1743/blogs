"use client";

import Stepper, { PHASE, type PhaseStyle, type StepBase } from "./Stepper";

/**
 * Live, step-through trace of the hotel example: the source with the current
 * line highlighted, the call stack growing and shrinking one frame at a time
 * (each frame with its own private memory), and the console filling up.
 */

const SOURCE = [
  'var hotelName = "Grand Palace";',
  "",
  "function bookRoom(guestName) {",
  "  var roomNumber = 101;",
  "  checkAvailability(roomNumber);",
  '  console.log(guestName + " booked room " + roomNumber);',
  "}",
  "",
  "function checkAvailability(room) {",
  "  var isFree = true;",
  '  console.log("Room " + room + " available: " + isFree);',
  "}",
  "",
  'bookRoom("Aditi");',
];

type Vars = Record<string, string>;
type Frame = { name: string; vars: Vars; tone: "global" | "book" | "check" };

type Step = StepBase & {
  phase: "setup" | "push" | "run" | "pop" | "done";
  line: number | null;
  /** Bottom first. */
  stack: Frame[];
  console: string[];
  changed?: string[];
};

const U = "undefined";
const FN = "{ …code }";
const global = (vars: Vars): Frame => ({ name: "Global EC", vars, tone: "global" });
const book = (vars: Vars): Frame => ({ name: "bookRoom EC", vars, tone: "book" });
const check = (vars: Vars): Frame => ({ name: "checkAvailability EC", vars, tone: "check" });

const G0 = global({ hotelName: U, bookRoom: FN, checkAvailability: FN });
const G1 = global({ hotelName: '"Grand Palace"', bookRoom: FN, checkAvailability: FN });
const OUT1 = "Room 101 available: true";
const OUT2 = "Aditi booked room 101";

const STEPS: Step[] = [
  {
    phase: "setup",
    line: null,
    title: "Program starts — Global EC pushed",
    note: "The engine creates the Global Execution Context and pushes it onto the empty stack. Memory phase: hotelName → undefined, and both functions stored in full.",
    stack: [G0],
    console: [],
    changed: ["hotelName", "bookRoom", "checkAvailability"],
  },
  {
    phase: "run",
    line: 1,
    title: "Global code runs · line 1",
    note: 'hotelName = "Grand Palace" replaces the placeholder. The two function declarations have nothing to execute, so the engine skips to line 14.',
    stack: [G1],
    console: [],
    changed: ["hotelName"],
  },
  {
    phase: "push",
    line: 14,
    title: 'bookRoom("Aditi") is called → bookRoom EC pushed',
    note: "A fresh Execution Context is created and placed on top. Global is paused underneath — it is not touched again until bookRoom finishes. bookRoom's own memory phase: guestName → \"Aditi\", roomNumber → undefined.",
    stack: [G1, book({ guestName: '"Aditi"', roomNumber: U })],
    console: [],
    changed: ["guestName", "roomNumber"],
  },
  {
    phase: "run",
    line: 4,
    title: "Inside bookRoom · line 4",
    note: "roomNumber = 101. This lives in bookRoom's private memory — Global cannot see it.",
    stack: [G1, book({ guestName: '"Aditi"', roomNumber: "101" })],
    console: [],
    changed: ["roomNumber"],
  },
  {
    phase: "push",
    line: 5,
    title: "checkAvailability(101) is called → checkAvailability EC pushed",
    note: "Now three contexts are stacked. Only the top one runs. bookRoom is paused at line 5, waiting exactly where it stopped. Memory phase: room → 101, isFree → undefined.",
    stack: [G1, book({ guestName: '"Aditi"', roomNumber: "101" }), check({ room: "101", isFree: U })],
    console: [],
    changed: ["room", "isFree"],
  },
  {
    phase: "run",
    line: 10,
    title: "Inside checkAvailability · line 10",
    note: "isFree = true.",
    stack: [G1, book({ guestName: '"Aditi"', roomNumber: "101" }), check({ room: "101", isFree: "true" })],
    console: [],
    changed: ["isFree"],
  },
  {
    phase: "run",
    line: 11,
    title: "Inside checkAvailability · line 11",
    note: "console.log runs from the top of the stack. First line of output appears.",
    stack: [G1, book({ guestName: '"Aditi"', roomNumber: "101" }), check({ room: "101", isFree: "true" })],
    console: [OUT1],
  },
  {
    phase: "pop",
    line: 12,
    title: "checkAvailability finishes → popped",
    note: "Its last line ran. The context is removed from the top and its memory (room, isFree) is discarded completely. Control returns to bookRoom, right after the call on line 5.",
    stack: [G1, book({ guestName: '"Aditi"', roomNumber: "101" })],
    console: [OUT1],
  },
  {
    phase: "run",
    line: 6,
    title: "Back in bookRoom · line 6",
    note: "bookRoom resumes exactly where it paused. Its memory is intact — guestName and roomNumber are still there. Second line of output.",
    stack: [G1, book({ guestName: '"Aditi"', roomNumber: "101" })],
    console: [OUT1, OUT2],
  },
  {
    phase: "pop",
    line: 7,
    title: "bookRoom finishes → popped",
    note: "Last line ran. bookRoom's context and memory are thrown away. Control returns to Global, right after line 14.",
    stack: [G1],
    console: [OUT1, OUT2],
  },
  {
    phase: "done",
    line: null,
    title: "Nothing left to run → Global popped",
    note: "The program has no more code. The Global Execution Context is popped too. Stack: [ ]. The engine is idle.",
    stack: [],
    console: [OUT1, OUT2],
  },
];

const phases: Record<Step["phase"], PhaseStyle> = {
  setup: { label: "Setup", className: PHASE.plain },
  push: { label: "Push · function called", className: PHASE.violet },
  run: { label: "Running · top of stack", className: PHASE.green },
  pop: { label: "Pop · function finished", className: PHASE.amber },
  done: { label: "Finished", className: PHASE.plain },
};

const frameTone: Record<Frame["tone"], string> = {
  global: "border-line bg-bg-elev",
  book: "border-emerald-400/50 bg-emerald-400/10",
  check: "border-violet-400/50 bg-violet-400/10",
};

export default function CallStackStepper() {
  return (
    <Stepper
      steps={STEPS}
      phases={phases}
      caption="Step through the program. Every call pushes a fresh context on top; every finish pops it and returns control to the one underneath — exactly where it paused."
    >
      {(step) => (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.15fr_1fr]">
          {/* Source */}
          <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
            <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">
              stack.js
            </div>
            <pre className="my-0 overflow-x-auto rounded-none border-0 bg-transparent px-0 py-2 text-[0.8rem]">
              {SOURCE.map((src, n) => {
                const ln = n + 1;
                const active = step.line === ln;
                return (
                  <div
                    key={ln}
                    className={`grid grid-cols-[2rem_1fr] px-3 py-0.5 transition-colors ${
                      active ? (step.phase === "push" ? "bg-violet-400/20" : step.phase === "pop" ? "bg-amber-400/20" : "bg-emerald-400/20") : ""
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
              <div className="flex min-h-[13rem] flex-col-reverse justify-start gap-2 p-3">
                {step.stack.length === 0 ? (
                  <div className="py-6 text-center font-mono text-[0.8rem] text-ink-dim">[ ]  empty</div>
                ) : (
                  step.stack.map((frame, fi) => {
                    const top = fi === step.stack.length - 1;
                    return (
                      <div
                        key={`${frame.name}-${fi}`}
                        className={`rounded-lg border px-3 py-2 transition-all ${frameTone[frame.tone]} ${top ? "" : "opacity-60"}`}
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="text-[0.85rem] font-semibold text-ink">{frame.name}</span>
                          <span className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-ink-dim">
                            {top ? "running" : "paused"}
                          </span>
                        </div>
                        <table className="my-0 w-full text-[0.78rem]">
                          <tbody>
                            {Object.entries(frame.vars).map(([k, v]) => {
                              const flash = top && step.changed?.includes(k);
                              return (
                                <tr key={k} className={flash ? "bg-amber-400/15" : ""}>
                                  <td className="border-0 px-1 py-0.5 font-mono text-sky-strong">{k}</td>
                                  <td className="border-0 px-1 py-0.5 text-right font-mono">
                                    <span className={v === U ? "text-ink-dim" : v === FN ? "text-amber-200" : "text-emerald-200"}>{v}</span>
                                  </td>
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
                    <div key={line} className={i === step.console.length - 1 && step.phase === "run" ? "text-emerald-200" : "text-ink"}>
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
