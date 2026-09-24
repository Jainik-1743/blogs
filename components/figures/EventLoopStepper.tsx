"use client";

import Stepper, { PHASE, type PhaseStyle, type StepBase } from "./Stepper";

/**
 * The event loop, one tick at a time: the running line, the call stack, what the browser
 * (Web APIs) is holding, both queues, and the console. Used three times in Lesson 14 —
 * the classic setTimeout-vs-promise example, async/await, and microtask starvation.
 */

type Step = StepBase & {
  phase: "sync" | "background" | "micro" | "macro" | "done";
  line: number | null;
  stack: string[];
  web: string[];
  micro: string[];
  macro: string[];
  console: string[];
};

type Scenario = { src: string[]; steps: Step[]; caption: string };

const CLASSIC_SRC = [
  'console.log("1: sync start");',
  "",
  "setTimeout(() => {",
  '  console.log("2: setTimeout callback");',
  "}, 0);",
  "",
  "Promise.resolve().then(() => {",
  '  console.log("3: promise callback");',
  "});",
  "",
  'console.log("4: sync end");',
];

const CLASSIC: Step[] = [
  { phase: "sync", line: 1, title: "Line 1 runs on the call stack", note: "console.log is pushed on top of the global context, prints, and pops straight off.", stack: ["global()", "console.log"], web: [], micro: [], macro: [], console: ["1: sync start"] },
  { phase: "sync", line: 3, title: "setTimeout hands the callback to the browser", note: "setTimeout itself is a Web API. It registers a 0 ms timer outside the engine and returns immediately — the call stack never waits for it.", stack: ["global()", "setTimeout"], web: ["timer 0 ms → timeout cb"], micro: [], macro: [], console: ["1: sync start"] },
  { phase: "background", line: 7, title: "The 0 ms timer expires — in the background", note: "The browser moves the timeout callback into the callback (macrotask) queue. It still can't run: the global code hasn't finished, so the stack isn't empty.", stack: ["global()"], web: [], micro: [], macro: ["timeout cb"], console: ["1: sync start"] },
  { phase: "sync", line: 7, title: "Promise.resolve().then(...) queues a microtask", note: "The promise is already resolved, so its .then callback goes straight into the microtask queue — also waiting for the stack to empty.", stack: ["global()", "Promise.then"], web: [], micro: ["promise cb"], macro: ["timeout cb"], console: ["1: sync start"] },
  { phase: "sync", line: 11, title: "Line 11 runs — the last synchronous line", note: "Two callbacks are waiting, one in each queue. The script keeps going regardless.", stack: ["global()", "console.log"], web: [], micro: ["promise cb"], macro: ["timeout cb"], console: ["1: sync start", "4: sync end"] },
  { phase: "micro", line: null, title: "The call stack is empty — the event loop takes over", note: "Golden rule: drain the entire microtask queue before touching the callback queue, even though the timer callback has been waiting longer.", stack: [], web: [], micro: ["promise cb"], macro: ["timeout cb"], console: ["1: sync start", "4: sync end"] },
  { phase: "micro", line: 8, title: "The promise callback runs", note: "It's pushed onto the empty stack, prints, and pops. The microtask queue is now empty.", stack: ["promise cb", "console.log"], web: [], micro: [], macro: ["timeout cb"], console: ["1: sync start", "4: sync end", "3: promise callback"] },
  { phase: "macro", line: 4, title: "Only now: one callback-queue item", note: "With no microtasks left, the event loop takes exactly one macrotask — the timeout callback — and runs it.", stack: ["timeout cb", "console.log"], web: [], micro: [], macro: [], console: ["1: sync start", "4: sync end", "3: promise callback", "2: setTimeout callback"] },
  { phase: "done", line: null, title: "Everything is empty — the loop waits for the next event", note: "Order: 1, 4, 3, 2. Registration order didn't matter; queue priority did.", stack: [], web: [], micro: [], macro: [], console: ["1: sync start", "4: sync end", "3: promise callback", "2: setTimeout callback"] },
];

const ASYNC_SRC = [
  "async function checkIn() {",
  '  console.log("2: checkIn starts");',
  "  await null;",
  '  console.log("4: after await");',
  "}",
  "",
  'console.log("1: script start");',
  'setTimeout(() => console.log("6: timeout"), 0);',
  "checkIn();",
  'Promise.resolve().then(() => console.log("5: then"));',
  'console.log("3: script end");',
];

const ASYNC: Step[] = [
  { phase: "sync", line: 7, title: "The script starts", note: "Defining checkIn on line 1 doesn't run it. The first thing that runs is line 7.", stack: ["global()", "console.log"], web: [], micro: [], macro: [], console: ["1: script start"] },
  { phase: "sync", line: 8, title: "setTimeout schedules a macrotask", note: "Handed to the browser; the 0 ms timer will drop its callback into the callback queue.", stack: ["global()", "setTimeout"], web: ["timer 0 ms → timeout cb"], micro: [], macro: [], console: ["1: script start"] },
  { phase: "sync", line: 2, title: "checkIn() runs synchronously — up to the first await", note: "An async function is not deferred. Its body runs immediately, on the current stack, like any other call.", stack: ["global()", "checkIn()", "console.log"], web: [], micro: [], macro: ["timeout cb"], console: ["1: script start", "2: checkIn starts"] },
  { phase: "sync", line: 3, title: "await pauses checkIn and queues its continuation", note: "Everything after await becomes a microtask. checkIn returns a pending promise and is popped off the stack; the rest of it waits in the microtask queue.", stack: ["global()"], web: [], micro: ["checkIn (after await)"], macro: ["timeout cb"], console: ["1: script start", "2: checkIn starts"] },
  { phase: "sync", line: 10, title: ".then queues a second microtask", note: "It joins the microtask queue behind checkIn's continuation — first in, first out.", stack: ["global()", "Promise.then"], web: [], micro: ["checkIn (after await)", "then cb"], macro: ["timeout cb"], console: ["1: script start", "2: checkIn starts"] },
  { phase: "sync", line: 11, title: "The last synchronous line", note: "Two microtasks and one macrotask are waiting.", stack: ["global()", "console.log"], web: [], micro: ["checkIn (after await)", "then cb"], macro: ["timeout cb"], console: ["1: script start", "2: checkIn starts", "3: script end"] },
  { phase: "micro", line: 4, title: "checkIn resumes after its await", note: "The stack is empty, so the event loop drains microtasks in order. checkIn picks up exactly where it paused.", stack: ["checkIn (resumed)", "console.log"], web: [], micro: ["then cb"], macro: ["timeout cb"], console: ["1: script start", "2: checkIn starts", "3: script end", "4: after await"] },
  { phase: "micro", line: 10, title: "The .then callback runs", note: "The microtask queue is now empty.", stack: ["then cb", "console.log"], web: [], micro: [], macro: ["timeout cb"], console: ["1: script start", "2: checkIn starts", "3: script end", "4: after await", "5: then"] },
  { phase: "macro", line: 8, title: "Finally, the timeout", note: "Order 1 → 6. await is just a microtask with nicer syntax: code after it always runs after the current synchronous code, but before any timer.", stack: ["timeout cb", "console.log"], web: [], micro: [], macro: [], console: ["1: script start", "2: checkIn starts", "3: script end", "4: after await", "5: then", "6: timeout"] },
];

const STARVE_SRC = [
  "function loop() {",
  "  Promise.resolve().then(() => {",
  '    console.log("microtask");',
  "    loop(); // queues another before this one ends",
  "  });",
  "}",
  "",
  'setTimeout(() => console.log("timeout"), 0);',
  "loop();",
];

const STARVE: Step[] = [
  { phase: "sync", line: 8, title: "A timer is scheduled", note: "Its callback lands in the callback queue almost immediately.", stack: ["global()", "setTimeout"], web: ["timer 0 ms → timeout cb"], micro: [], macro: [], console: [] },
  { phase: "sync", line: 9, title: "loop() queues microtask #1", note: "The global code then finishes. The stack is empty.", stack: ["global()", "loop()"], web: [], micro: ["microtask #1"], macro: ["timeout cb"], console: [] },
  { phase: "micro", line: 3, title: "Microtask #1 runs — and calls loop() again", note: "Calling loop() queues microtask #2 while #1 is still running. The queue is not empty when #1 finishes.", stack: ["microtask #1", "loop()"], web: [], micro: ["microtask #2"], macro: ["timeout cb"], console: ["microtask"] },
  { phase: "micro", line: 3, title: "Microtask #2 runs — and queues #3", note: "The event loop must keep draining. The timeout callback is still waiting.", stack: ["microtask #2", "loop()"], web: [], micro: ["microtask #3"], macro: ["timeout cb"], console: ["microtask", "microtask"] },
  { phase: "micro", line: 3, title: "#3 queues #4…", note: "The microtask queue refills faster than it empties. It is never empty, so the callback queue never gets a turn.", stack: ["microtask #3", "loop()"], web: [], micro: ["microtask #4"], macro: ["timeout cb"], console: ["microtask", "microtask", "microtask"] },
  { phase: "done", line: null, title: "Starvation", note: "The timeout never runs, clicks never get handled, and the page never repaints (rendering also waits for an empty microtask queue). The tab looks frozen, even though no single task is slow.", stack: ["microtask #∞", "loop()"], web: [], micro: ["microtask #∞+1"], macro: ["timeout cb", "click handler", "…"], console: ["microtask", "microtask", "microtask", "…forever"] },
];

const SCENARIOS: Record<"classic" | "async" | "starvation", Scenario> = {
  classic: { src: CLASSIC_SRC, steps: CLASSIC, caption: "The classic example, one event-loop tick at a time. Watch the timer callback wait in its queue while the promise callback jumps ahead of it." },
  async: { src: ASYNC_SRC, steps: ASYNC, caption: "async/await on the same machinery. The function runs synchronously until await; everything after it is a microtask." },
  starvation: { src: STARVE_SRC, steps: STARVE, caption: "A microtask that keeps queueing microtasks. The callback queue — and rendering — never get a turn." },
};

const phases: Record<Step["phase"], PhaseStyle> = {
  sync: { label: "Synchronous code · call stack busy", className: PHASE.green },
  background: { label: "Browser · Web API finishes in the background", className: PHASE.violet },
  micro: { label: "Stack empty · draining microtasks", className: PHASE.sky },
  macro: { label: "Microtasks empty · one macrotask", className: PHASE.amber },
  done: { label: "End state", className: PHASE.plain },
};

function Box({ title, items, tone, empty, stack = false }: { title: string; items: string[]; tone: string; empty: string; stack?: boolean }) {
  const shown = stack ? [...items].reverse() : items;
  return (
    <div className={`rounded-lg border px-3 py-2 ${tone}`}>
      <div className="mb-1 font-mono text-[0.62rem] uppercase tracking-[0.08em] opacity-80">{title}</div>
      <div className="min-h-[3.2rem] space-y-1 font-mono text-[0.72rem]">
        {shown.length === 0 ? (
          <div className="text-ink-dim">{empty}</div>
        ) : (
          shown.map((it, i) => (
            <div key={`${it}-${i}`} className={`rounded border border-line bg-bg-code px-2 py-0.5 text-ink ${stack && i === 0 ? "ring-1 ring-emerald-400/60" : ""}`}>
              {it}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function EventLoopStepper({ scenario = "classic" }: { scenario?: keyof typeof SCENARIOS }) {
  const { src, steps, caption } = SCENARIOS[scenario];
  return (
    <Stepper steps={steps} phases={phases} caption={caption} interval={2200}>
      {(step) => (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.1fr_1fr]">
          <pre className="my-0 overflow-x-auto rounded-lg border border-line bg-bg-code px-0 py-2 text-[0.72rem]">
            {src.map((s, n) => (
              <div key={n} className={`grid grid-cols-[1.8rem_1fr] px-3 py-0.5 ${step.line === n + 1 ? "bg-emerald-400/20" : ""}`}>
                <span className="select-none text-ink-dim/60">{n + 1}</span>
                <code className={step.line === n + 1 ? "text-ink" : "text-ink-dim"}>{s || " "}</code>
              </div>
            ))}
          </pre>
          <div className="grid grid-cols-2 gap-2">
            <Box title="Call stack (top first)" items={step.stack} tone="border-emerald-400/40 text-emerald-200" empty="(empty)" stack />
            <Box title="Web APIs (browser)" items={step.web} tone="border-violet-400/40 text-violet-200" empty="(nothing pending)" />
            <Box title="Microtask queue" items={step.micro} tone="border-sky/40 text-sky" empty="(empty)" />
            <Box title="Callback queue" items={step.macro} tone="border-amber-400/40 text-amber-200" empty="(empty)" />
            <div className="col-span-2 rounded-lg border border-line bg-bg-code px-3 py-2 font-mono text-[0.74rem]">
              <div className="mb-1 text-[0.62rem] uppercase tracking-[0.08em] text-ink-dim">console</div>
              {step.console.length === 0 ? <span className="text-ink-dim">(nothing yet)</span> : step.console.map((c, i) => <div key={i} className="text-ink">› {c}</div>)}
            </div>
          </div>
        </div>
      )}
    </Stepper>
  );
}
