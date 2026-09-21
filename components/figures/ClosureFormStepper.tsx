"use client";

import Stepper, { PHASE, type PhaseStyle, type StepBase } from "./Stepper";

/**
 * How a closure forms: the call stack on the left (contexts come and go), the
 * heap on the right (a Lexical Environment that should have died, kept alive
 * by the returned function's hidden link).
 */

const SOURCE = [
  "function makeRoomKey() {",
  "  let roomNumber = 305;",
  "",
  "  return function showRoom() {",
  "    console.log(roomNumber);",
  "  };",
  "}",
  "",
  "const showMyRoom = makeRoomKey();",
  "showMyRoom(); // 305",
];

type Frame = { name: string; vars: Record<string, string> };
type Step = StepBase & {
  phase: "run" | "push" | "create" | "pop" | "call" | "lookup";
  line: number | null;
  stack: Frame[];
  /** makeRoomKey's Lexical Environment on the heap. */
  le: { exists: boolean; roomNumber: string; alive: "stack" | "closure" | "dead" };
  fn: { exists: boolean; link: boolean; name: string };
  lookup?: boolean;
  console: string[];
};

const G = (vars: Record<string, string>): Frame => ({ name: "Global EC", vars });
const FN = "{ …code }";

const STEPS: Step[] = [
  { phase: "run", line: 9, title: "Line 9 — makeRoomKey() is called", note: "Global's memory has makeRoomKey (hoisted) and showMyRoom (const, in its TDZ until this line finishes).", stack: [G({ makeRoomKey: FN, showMyRoom: "🔒 TDZ" })], le: { exists: false, roomNumber: "", alive: "dead" }, fn: { exists: false, link: false, name: "" }, console: [] },
  { phase: "push", line: 1, title: "makeRoomKey EC pushed — its Lexical Environment is created", note: "A new context on the stack, and with it a new Lexical Environment on the heap: memory for roomNumber, plus an outer reference to Global.", stack: [G({ makeRoomKey: FN, showMyRoom: "🔒 TDZ" }), { name: "makeRoomKey EC", vars: { roomNumber: "🔒 TDZ" } }], le: { exists: true, roomNumber: "🔒 TDZ", alive: "stack" }, fn: { exists: false, link: false, name: "" }, console: [] },
  { phase: "run", line: 2, title: "Line 2 — roomNumber = 305", note: "Written into makeRoomKey's Lexical Environment.", stack: [G({ makeRoomKey: FN, showMyRoom: "🔒 TDZ" }), { name: "makeRoomKey EC", vars: { roomNumber: "305" } }], le: { exists: true, roomNumber: "305", alive: "stack" }, fn: { exists: false, link: false, name: "" }, console: [] },
  { phase: "create", line: 4, title: "Line 4 — the inner function showRoom is created", note: "At creation time — not at call time — the function object gets a hidden link ([[Environment]]) to the Lexical Environment it was born in: makeRoomKey's. This link is the closure.", stack: [G({ makeRoomKey: FN, showMyRoom: "🔒 TDZ" }), { name: "makeRoomKey EC", vars: { roomNumber: "305" } }], le: { exists: true, roomNumber: "305", alive: "stack" }, fn: { exists: true, link: true, name: "showRoom" }, console: [] },
  { phase: "pop", line: 7, title: "makeRoomKey returns → its EC is popped", note: "The context is gone from the stack (Lesson 2). Normally its Lexical Environment would now be garbage. But showRoom still links to it — so the engine keeps it alive on the heap. Nothing on the stack points to it; the function does.", stack: [G({ makeRoomKey: FN, showMyRoom: "showRoom ƒ" })], le: { exists: true, roomNumber: "305", alive: "closure" }, fn: { exists: true, link: true, name: "showRoom → showMyRoom" }, console: [] },
  { phase: "call", line: 10, title: "Line 10 — showMyRoom() is called", note: "A new context for showRoom. Its outer reference is not decided by who called it (Global) but by where it was created — the closure link points at makeRoomKey's environment.", stack: [G({ makeRoomKey: FN, showMyRoom: "showRoom ƒ" }), { name: "showRoom EC", vars: {} }], le: { exists: true, roomNumber: "305", alive: "closure" }, fn: { exists: true, link: true, name: "showRoom → showMyRoom" }, console: [] },
  { phase: "lookup", line: 5, title: "Line 5 — roomNumber is looked up through the closure link", note: "Not in showRoom's own memory. Follow the outer reference — the closure link — into makeRoomKey's still-alive environment. Found: 305. Not a saved copy; the same variable, in the same place it has always been.", stack: [G({ makeRoomKey: FN, showMyRoom: "showRoom ƒ" }), { name: "showRoom EC", vars: {} }], le: { exists: true, roomNumber: "305", alive: "closure" }, fn: { exists: true, link: true, name: "showRoom → showMyRoom" }, lookup: true, console: ["305"] },
];

const phases: Record<Step["phase"], PhaseStyle> = {
  run: { label: "Running", className: PHASE.green },
  push: { label: "Push · environment created", className: PHASE.violet },
  create: { label: "Function created · closure link attached", className: PHASE.amber },
  pop: { label: "Pop · environment kept alive", className: PHASE.amber },
  call: { label: "Closure called", className: PHASE.sky },
  lookup: { label: "Lookup through the closure link", className: PHASE.sky },
};

export default function ClosureFormStepper() {
  return (
    <Stepper steps={STEPS} phases={phases} caption="Step through it. Watch the makeRoomKey context leave the stack while its Lexical Environment stays on the heap — held by nothing but the returned function's link." interval={2600}>
      {(step) => (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.1fr_1fr]">
          <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
            <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">closure.js</div>
            <pre className="my-0 overflow-x-auto rounded-none border-0 bg-transparent px-0 py-2 text-[0.76rem]">
              {SOURCE.map((src, n) => {
                const ln = n + 1;
                const active = step.line === ln;
                return (
                  <div key={ln} className={`grid grid-cols-[2rem_1fr] px-3 py-0.5 ${active ? (step.phase === "create" || step.phase === "pop" ? "bg-amber-400/20" : step.phase === "push" ? "bg-violet-400/20" : step.phase === "lookup" || step.phase === "call" ? "bg-sky-soft" : "bg-emerald-400/20") : ""}`}>
                    <span className="select-none text-ink-dim/60">{ln}</span>
                    <code className={active ? "text-ink" : "text-ink-dim"}>{src || " "}</code>
                  </div>
                );
              })}
            </pre>
            <div className="border-t border-line px-3 py-2 font-mono text-[0.76rem]">
              {step.console.length === 0 ? <span className="text-ink-dim">(console)</span> : step.console.map((c) => <div key={c} className="text-emerald-200">› {c}</div>)}
            </div>
            {/* Call stack */}
            <div className="border-t border-line">
              <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">Call stack</div>
              <div className="flex min-h-[7rem] flex-col-reverse justify-start gap-1.5 p-3">
                {step.stack.map((f, i) => {
                  const top = i === step.stack.length - 1;
                  return (
                    <div key={f.name} className={`rounded-md border px-2 py-1 ${top ? "border-sky/60 bg-sky-soft" : "border-line bg-bg-elev opacity-60"}`}>
                      <div className="flex justify-between text-[0.78rem] font-semibold text-ink"><span>{f.name}</span><span className="font-mono text-[0.6rem] uppercase text-ink-dim">{top ? "running" : "paused"}</span></div>
                      <ul className="m-0 list-none p-0 font-mono text-[0.72rem]">
                        {Object.keys(f.vars).length === 0 ? <li className="text-ink-dim/70">(no local variables)</li> : Object.entries(f.vars).map(([k, v]) => <li key={k} className="flex justify-between"><span className="text-sky-strong">{k}</span><span className={v.includes("TDZ") ? "text-red-300" : v === FN || v.includes("ƒ") ? "text-amber-200" : "text-emerald-200"}>{v}</span></li>)}
                      </ul>
                    </div>
                  );
                })}
                {step.phase === "pop" ? <div className="rounded-md border border-dashed border-red-400/50 px-2 py-1 text-center font-mono text-[0.7rem] text-red-300 line-through opacity-70">makeRoomKey EC — popped</div> : null}
              </div>
            </div>
          </div>

          {/* Heap */}
          <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
            <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">Heap · memory that outlives the stack</div>
            <div className="p-3">
              <div className={`rounded-lg border px-3 py-2 transition-all ${!step.le.exists ? "border-dashed border-line opacity-30" : step.le.alive === "closure" ? "border-violet-400/70 bg-violet-400/10 ring-1 ring-violet-400/50" : "border-violet-400/40 bg-violet-400/5"} ${step.lookup ? "ring-2 ring-emerald-400/70" : ""}`}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-[0.8rem] font-semibold text-violet-200">makeRoomKey&apos;s Lexical Environment</span>
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.08em]">{!step.le.exists ? <span className="text-ink-dim">not yet</span> : step.le.alive === "stack" ? <span className="text-ink-dim">on the stack</span> : <span className="text-violet-300">kept alive — still referenced</span>}</span>
                </div>
                <ul className="m-0 list-none p-0 font-mono text-[0.74rem]">
                  <li className={`flex justify-between rounded px-1 ${step.lookup ? "bg-emerald-400/20" : ""}`}><span className="text-sky-strong">roomNumber{step.lookup ? <span className="ml-1 text-[0.6rem] uppercase text-emerald-300">← read</span> : null}</span><span className={step.le.roomNumber.includes("TDZ") ? "text-red-300" : "text-emerald-200"}>{step.le.exists ? step.le.roomNumber : "—"}</span></li>
                  <li className="flex justify-between px-1 text-ink-dim"><span>outer →</span><span className="text-sky">Global</span></li>
                </ul>
              </div>
              <div className={`py-1 text-center font-mono text-[0.72rem] ${step.fn.link ? (step.lookup ? "text-emerald-300" : "text-violet-300") : "text-ink-dim/30"}`}>
                ↑ closure link · [[Environment]]
              </div>
              <div className={`rounded-lg border px-3 py-2 transition-all ${step.fn.exists ? "border-emerald-400/50 bg-emerald-400/10" : "border-dashed border-line opacity-30"}`}>
                <div className="text-[0.8rem] font-semibold text-emerald-200">{step.fn.exists ? `function ${step.fn.name}` : "showRoom — not created yet"}</div>
                <div className="font-mono text-[0.7rem] text-ink-dim">{step.fn.exists ? "code: console.log(roomNumber)" : " "}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Stepper>
  );
}
