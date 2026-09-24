"use client";

import Stepper, { PHASE, type PhaseStyle, type StepBase } from "./Stepper";

/**
 * Mark-and-sweep on a tiny heap: start from the roots, follow every reference, mark what
 * you reach, then free everything that was never marked — including a cycle that nothing
 * points to.
 */

type NodeState = "idle" | "marked" | "freed";
type Step = StepBase & { phase: "heap" | "mark" | "sweep" | "after"; states: Record<string, NodeState>; active?: string };

const NODES: { id: string; label: string; refs: string[]; root?: boolean }[] = [
  { id: "global", label: "global object", refs: ["hotel"], root: true },
  { id: "stack", label: "current stack frame", refs: ["counter"], root: true },
  { id: "hotel", label: "hotel { rooms }", refs: ["rooms"] },
  { id: "rooms", label: "rooms [ … ]", refs: [] },
  { id: "counter", label: "counter() closure", refs: ["count"] },
  { id: "count", label: "{ count: 3 }", refs: [] },
  { id: "old", label: "oldBooking", refs: ["guest"] },
  { id: "guest", label: "guest ↔ oldBooking", refs: ["old"] },
];

const all = (s: NodeState): Record<string, NodeState> => Object.fromEntries(NODES.map((n) => [n.id, s]));
const with_ = (base: Record<string, NodeState>, ids: string[], s: NodeState) => ({ ...base, ...Object.fromEntries(ids.map((i) => [i, s])) });

const idle = all("idle");
const m1 = with_(idle, ["global", "stack"], "marked");
const m2 = with_(m1, ["hotel", "counter"], "marked");
const m3 = with_(m2, ["rooms", "count"], "marked");
const swept = with_(m3, ["old", "guest"], "freed");

const STEPS: Step[] = [
  { phase: "heap", states: idle, title: "The heap before a collection", note: "Some objects are still in use, and two are left over from an old booking. They point at each other — a reference cycle — but nothing else points at them." },
  { phase: "mark", states: m1, active: "global", title: "Mark: start from the roots", note: "Roots are what the program can always reach directly: the global object and every variable on the current call stack." },
  { phase: "mark", states: m2, active: "hotel", title: "Follow every reference from the roots", note: "The global object references hotel; the stack frame references the counter closure. Both are reachable, so both are marked alive." },
  { phase: "mark", states: m3, active: "count", title: "Keep following until nothing new is found", note: "rooms is reachable through hotel. The closure's { count } is reachable through the closure — this is exactly why closure variables (Lesson 10) survive." },
  { phase: "sweep", states: swept, title: "Sweep: free everything left unmarked", note: "oldBooking and guest point at each other, but no root reaches them. Reference counting would leak this cycle; mark-and-sweep frees it, because it only asks “reachable from a root?”." },
  { phase: "after", states: with_(idle, ["old", "guest"], "freed"), title: "Marks reset for next time", note: "The freed memory is reused for new objects. V8's Orinoco does this mostly in the background and in small increments, so your code isn't paused for long." },
];

const phases: Record<Step["phase"], PhaseStyle> = {
  heap: { label: "Heap snapshot", className: PHASE.plain },
  mark: { label: "Mark phase · walking from the roots", className: PHASE.green },
  sweep: { label: "Sweep phase · freeing the unreachable", className: PHASE.red },
  after: { label: "After collection", className: PHASE.sky },
};

const TONE: Record<NodeState, string> = {
  idle: "border-line bg-bg-code text-ink-dim",
  marked: "border-emerald-400/60 bg-emerald-400/10 text-emerald-100",
  freed: "border-red-400/40 bg-red-400/5 text-red-300 line-through opacity-60",
};

export default function MarkSweepStepper() {
  return (
    <Stepper steps={STEPS} phases={phases} caption="Mark-and-sweep in six steps. Only one question decides an object's fate: can any root still reach it?" interval={2400}>
      {(step) => (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {NODES.map((n) => (
            <div key={n.id} className={`rounded-lg border px-3 py-2 transition ${TONE[step.states[n.id]]} ${step.active === n.id ? "ring-2 ring-emerald-400/60" : ""}`}>
              <div className="font-mono text-[0.6rem] uppercase tracking-[0.08em] opacity-80">{n.root ? "root" : step.states[n.id] === "freed" ? "freed" : step.states[n.id] === "marked" ? "marked ✓" : "object"}</div>
              <div className="font-mono text-[0.74rem]">{n.label}</div>
              <div className="mt-0.5 font-mono text-[0.62rem] text-ink-dim">{n.refs.length ? `→ ${n.refs.map((r) => NODES.find((x) => x.id === r)!.label.split(" ")[0]).join(", ")}` : "no references"}</div>
            </div>
          ))}
        </div>
      )}
    </Stepper>
  );
}
