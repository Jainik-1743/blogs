"use client";

import Stepper, { PHASE, type PhaseStyle, type StepBase } from "./Stepper";

/**
 * for (var …) vs for (let …), in lockstep: one shared slot that survives the
 * loop, versus a brand-new block binding for every iteration that is gone
 * the moment the loop ends.
 */

const VAR_SRC = ["for (var i = 0; i < 3; i++) {", "  console.log(i);", "}", "console.log(i); // 3"];
const LET_SRC = ["for (let i = 0; i < 3; i++) {", "  console.log(i);", "}", "console.log(i); // ReferenceError"];

type Side = { line: number | null; slots: { label: string; value: string; live: boolean }[]; console: { text: string; bad?: boolean }[] };
type Step = StepBase & { phase: "setup" | "iter" | "after" | "done"; v: Side; l: Side };

const out = (n: number) => Array.from({ length: n }, (_, i) => ({ text: String(i) }));
const letSlots = (upto: number, liveIdx: number) => Array.from({ length: upto }, (_, i) => ({ label: `iteration ${i} block · i`, value: String(i), live: i === liveIdx }));

const STEPS: Step[] = [
  { phase: "setup", title: "Before the loop — memory phase", note: "var i is hoisted to the enclosing function (here, Global): one slot, undefined. let i belongs to the loop itself — nothing exists outside the loop yet.", v: { line: null, slots: [{ label: "function / global · i", value: "undefined", live: true }], console: [] }, l: { line: null, slots: [], console: [] } },
  { phase: "iter", title: "Iteration 0", note: "var: the one shared slot becomes 0. let: the engine creates a fresh block environment for this iteration with its own i = 0.", v: { line: 2, slots: [{ label: "function / global · i", value: "0", live: true }], console: out(1) }, l: { line: 2, slots: letSlots(1, 0), console: out(1) } },
  { phase: "iter", title: "Iteration 1", note: "var: same slot, now 1. let: a second, separate binding i = 1. The iteration-0 binding is finished — but it is a different slot, not an overwritten one (closures can hold on to it: Lesson 11).", v: { line: 2, slots: [{ label: "function / global · i", value: "1", live: true }], console: out(2) }, l: { line: 2, slots: letSlots(2, 1), console: out(2) } },
  { phase: "iter", title: "Iteration 2", note: "var: same slot, now 2. let: a third binding i = 2. Three iterations, three slots.", v: { line: 2, slots: [{ label: "function / global · i", value: "2", live: true }], console: out(3) }, l: { line: 2, slots: letSlots(3, 2), console: out(3) } },
  { phase: "after", title: "Loop condition fails — the loop ends", note: "var: i++ made it 3, the test i < 3 failed, and the slot is still there holding 3. let: every per-iteration block is gone; there is no i anywhere outside the loop.", v: { line: 3, slots: [{ label: "function / global · i", value: "3", live: true }], console: out(3) }, l: { line: 3, slots: letSlots(3, -1).map((s) => ({ ...s, value: `${s.value} · gone` })), console: out(3) } },
  { phase: "done", title: "console.log(i) after the loop", note: "var: 3 — it leaked out, because var never respected the braces. let: ReferenceError: i is not defined — the loop's bindings were block-scoped and no longer exist.", v: { line: 4, slots: [{ label: "function / global · i", value: "3", live: true }], console: [...out(3), { text: "3" }] }, l: { line: 4, slots: [], console: [...out(3), { text: "ReferenceError: i is not defined", bad: true }] } },
];

const phases: Record<Step["phase"], PhaseStyle> = {
  setup: { label: "Memory phase", className: PHASE.violet },
  iter: { label: "Loop body running", className: PHASE.green },
  after: { label: "Loop finished", className: PHASE.amber },
  done: { label: "After the loop", className: PHASE.plain },
};

function Panel({ title, src, side, tone }: { title: string; src: string[]; side: Side; tone: "amber" | "sky" }) {
  const t = tone === "amber" ? "text-amber-200" : "text-sky";
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
      <div className={`border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] ${t}`}>{title}</div>
      <pre className="my-0 overflow-x-auto rounded-none border-0 bg-transparent px-0 py-2 text-[0.74rem]">
        {src.map((s, n) => {
          const active = side.line === n + 1;
          return (
            <div key={n} className={`grid grid-cols-[1.6rem_1fr] px-3 py-0.5 ${active ? "bg-emerald-400/20" : ""}`}>
              <span className="select-none text-ink-dim/60">{n + 1}</span>
              <code className={active ? "text-ink" : "text-ink-dim"}>{s}</code>
            </div>
          );
        })}
      </pre>
      <div className="border-t border-line px-3 py-2">
        <div className="mb-1 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-ink-dim">memory · {side.slots.length} slot{side.slots.length === 1 ? "" : "s"}</div>
        <div className="space-y-1 font-mono text-[0.74rem]">
          {side.slots.length === 0 ? <div className="rounded border border-dashed border-line px-2 py-1 text-center text-ink-dim">no i anywhere</div> : side.slots.map((s) => (
            <div key={s.label} className={`flex justify-between rounded border px-2 py-0.5 ${s.live ? "border-emerald-400/50 bg-emerald-400/10" : "border-line opacity-50"} ${s.value.includes("gone") ? "line-through" : ""}`}>
              <span className="text-ink-dim">{s.label}</span><span className="text-emerald-200">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="min-h-[3rem] border-t border-line px-3 py-2 font-mono text-[0.74rem]">
        {side.console.length === 0 ? <span className="text-ink-dim">(console)</span> : side.console.map((c, i) => <div key={i} className={c.bad ? "text-red-300" : "text-ink"}>› {c.text}</div>)}
      </div>
    </div>
  );
}

export default function LoopBindingStepper() {
  return (
    <Stepper steps={STEPS} phases={phases} caption="Step through both loops together. Count the slots: var has one for the whole loop and beyond; let makes a new one for every iteration and throws them all away at the end." interval={2200}>
      {(step) => (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Panel title="var · one shared slot" src={VAR_SRC} side={step.v} tone="amber" />
          <Panel title="let · one slot per iteration" src={LET_SRC} side={step.l} tone="sky" />
        </div>
      )}
    </Stepper>
  );
}
