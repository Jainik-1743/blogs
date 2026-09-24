"use client";

import Stepper, { PHASE, type PhaseStyle, type StepBase } from "./Stepper";

/**
 * A synchronous callback and an asynchronous one, stepped side by side. Same shape of code;
 * the only difference is whether the function you handed over runs before or after "after".
 */

const SYNC_SRC = ['console.log("before");', 'repeatTask(2, (r) => console.log("pass " + r));', 'console.log("after");'];
const ASYNC_SRC = ['console.log("before");', 'setTimeout(() => console.log("timer"), 0);', 'console.log("after");'];

type Side = { line: number | null; stack: string[]; waiting?: string; console: string[] };
type Step = StepBase & { phase: "run" | "wait" | "later" | "done"; s: Side; a: Side };

const STEPS: Step[] = [
  { phase: "run", title: "Line 1 — both print “before”", note: "Nothing different yet.", s: { line: 1, stack: ["global()", "console.log"], console: ["before"] }, a: { line: 1, stack: ["global()", "console.log"], console: ["before"] } },
  { phase: "run", title: "Line 2 — each hands a callback to another function", note: "Left: repeatTask receives the arrow function and keeps it. Right: setTimeout receives the arrow function and gives it to the browser's timer.", s: { line: 2, stack: ["global()", "repeatTask(2, cb)"], console: ["before"] }, a: { line: 2, stack: ["global()", "setTimeout(cb, 0)"], waiting: "cb held by the browser timer", console: ["before"] } },
  { phase: "run", title: "Sync: repeatTask calls cb(1) right now — Async: setTimeout already returned", note: "Left: the callback is pushed on top of repeatTask while repeatTask is still running. Right: setTimeout returned immediately; the callback is only waiting.", s: { line: 2, stack: ["global()", "repeatTask(2, cb)", "cb(1)"], console: ["before", "pass 1"] }, a: { line: 3, stack: ["global()", "console.log"], waiting: "cb waiting in the callback queue", console: ["before", "after"] } },
  { phase: "run", title: "Sync: cb(2) — Async: the script has already finished", note: "Left: the second call, still inside repeatTask. Right: “after” printed before the callback ever ran, and the global code is done.", s: { line: 2, stack: ["global()", "repeatTask(2, cb)", "cb(2)"], console: ["before", "pass 1", "pass 2"] }, a: { line: null, stack: [], waiting: "cb waiting in the callback queue", console: ["before", "after"] } },
  { phase: "wait", title: "Sync: repeatTask returns, then line 3 runs", note: "Left: only now does “after” print — both callback runs happened inside line 2. Right: the stack is empty; the event loop is about to move the callback over.", s: { line: 3, stack: ["global()", "console.log"], console: ["before", "pass 1", "pass 2", "after"] }, a: { line: null, stack: [], waiting: "event loop: stack empty → run cb", console: ["before", "after"] } },
  { phase: "later", title: "Async: the callback finally runs, on an empty stack", note: "Right: the callback runs with nothing underneath it — the code that scheduled it is long gone. That's what “asynchronous” means.", s: { line: null, stack: [], console: ["before", "pass 1", "pass 2", "after"] }, a: { line: 2, stack: ["cb()", "console.log"], console: ["before", "after", "timer"] } },
  { phase: "done", title: "Compare the two consoles", note: "Sync: before → pass 1 → pass 2 → after. Async: before → after → timer. Both were callbacks; only the timing differed.", s: { line: null, stack: [], console: ["before", "pass 1", "pass 2", "after"] }, a: { line: null, stack: [], console: ["before", "after", "timer"] } },
];

const phases: Record<Step["phase"], PhaseStyle> = {
  run: { label: "Script running", className: PHASE.green },
  wait: { label: "Script finishing", className: PHASE.amber },
  later: { label: "Later · via the event loop", className: PHASE.sky },
  done: { label: "Result", className: PHASE.plain },
};

function Panel({ title, src, side, tone }: { title: string; src: string[]; side: Side; tone: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
      <div className={`border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] ${tone}`}>{title}</div>
      <pre className="my-0 overflow-x-auto rounded-none border-0 bg-transparent px-0 py-2 text-[0.72rem]">
        {src.map((s, n) => (
          <div key={n} className={`grid grid-cols-[1.6rem_1fr] px-3 py-0.5 ${side.line === n + 1 ? "bg-emerald-400/20" : ""}`}>
            <span className="select-none text-ink-dim/60">{n + 1}</span>
            <code className={side.line === n + 1 ? "text-ink" : "text-ink-dim"}>{s}</code>
          </div>
        ))}
      </pre>
      <div className="border-t border-line px-3 py-2">
        <div className="mb-1 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-ink-dim">call stack (top first)</div>
        <div className="min-h-[4.2rem] space-y-1 font-mono text-[0.72rem]">
          {side.stack.length === 0 ? (
            <div className="text-ink-dim">(empty)</div>
          ) : (
            [...side.stack].reverse().map((f, i) => (
              <div key={f} className={`rounded border px-2 py-0.5 ${i === 0 ? "border-emerald-400/60 bg-emerald-400/10 text-ink" : "border-line bg-bg-elev text-ink-dim"}`}>{f}</div>
            ))
          )}
        </div>
        {side.waiting ? <div className="mt-1 rounded border border-violet-400/40 bg-violet-400/10 px-2 py-0.5 font-mono text-[0.68rem] text-violet-200">{side.waiting}</div> : null}
      </div>
      <div className="min-h-[3rem] border-t border-line px-3 py-2 font-mono text-[0.74rem]">
        {side.console.map((c, i) => <div key={i} className="text-ink">› {c}</div>)}
      </div>
    </div>
  );
}

export default function CallbackTimingStepper() {
  return (
    <Stepper steps={STEPS} phases={phases} caption="Two callbacks, stepped together. A synchronous callback runs inside the call that received it; an asynchronous one runs after the whole script has finished." interval={2400}>
      {(step) => (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Panel title="synchronous · repeatTask" src={SYNC_SRC} side={step.s} tone="text-emerald-200" />
          <Panel title="asynchronous · setTimeout" src={ASYNC_SRC} side={step.a} tone="text-sky" />
        </div>
      )}
    </Stepper>
  );
}
