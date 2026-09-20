"use client";

import Stepper, { PHASE, type PhaseStyle, type StepBase } from "./Stepper";

/**
 * let-shadowing and var-"shadowing" stepped in lockstep: two separate slots
 * in two environments, versus one slot that gets overwritten.
 */

const LET_SRC = ["let discount = 100;", "{", "  let discount = 20;", "  console.log(discount);", "}", "console.log(discount);"];
const VAR_SRC = ["var discount = 100;", "{", "  var discount = 20;", "  console.log(discount);", "}", "console.log(discount);"];

type Env = { name: string; value: string | null; live: boolean; hit?: boolean };
type Side = { line: number | null; envs: Env[]; console: string[] };
type Step = StepBase & { phase: "memory" | "run" | "block" | "done"; l: Side; v: Side };

const STEPS: Step[] = [
  { phase: "memory", title: "Memory phase", note: "let: the outer discount is reserved (locked until line 1). The block's own discount does not exist yet — a block's bindings are created when the block is entered. var: one discount in the outer scope, undefined. The var on line 3 is the same name in the same function scope, so it reserves nothing new.", l: { line: null, envs: [{ name: "outer scope · discount", value: "🔒 TDZ", live: true }], console: [] }, v: { line: null, envs: [{ name: "outer scope · discount", value: "undefined", live: true }], console: [] } },
  { phase: "run", title: "Line 1 — outer discount = 100", note: "Both sides: the outer slot becomes 100.", l: { line: 1, envs: [{ name: "outer scope · discount", value: "100", live: true }], console: [] }, v: { line: 1, envs: [{ name: "outer scope · discount", value: "100", live: true }], console: [] } },
  { phase: "block", title: "Line 2 — the block is entered", note: "let: a new block environment is created with its own discount, locked until line 3. Two slots now exist. var: nothing happens — the braces mean nothing to var, so no new environment and no new slot.", l: { line: 2, envs: [{ name: "block { } · discount", value: "🔒 TDZ", live: true }, { name: "outer scope · discount", value: "100", live: false }], console: [] }, v: { line: 2, envs: [{ name: "outer scope · discount", value: "100", live: true }], console: [] } },
  { phase: "run", title: "Line 3 — the inner declaration", note: "let: the block's discount is unlocked and set to 20. The outer 100 is untouched, one level down the chain. var: var discount = 20 is a plain assignment to the one and only slot. 100 is overwritten — gone.", l: { line: 3, envs: [{ name: "block { } · discount", value: "20", live: true }, { name: "outer scope · discount", value: "100", live: false }], console: [] }, v: { line: 3, envs: [{ name: "outer scope · discount", value: "20 (was 100)", live: true }], console: [] } },
  { phase: "run", title: "Line 4 — console.log inside the block", note: "let: nearest match wins — the block's own slot, 20. var: the only slot, 20. Same output, completely different reason.", l: { line: 4, envs: [{ name: "block { } · discount", value: "20", live: true, hit: true }, { name: "outer scope · discount", value: "100", live: false }], console: ["20"] }, v: { line: 4, envs: [{ name: "outer scope · discount", value: "20 (was 100)", live: true, hit: true }], console: ["20"] } },
  { phase: "block", title: "Line 5 — the block closes", note: "let: the block environment is discarded, and its discount with it. The outer 100 is exposed again. var: nothing to discard.", l: { line: 5, envs: [{ name: "block { } · discount", value: "20 · gone", live: false }, { name: "outer scope · discount", value: "100", live: true }], console: ["20"] }, v: { line: 5, envs: [{ name: "outer scope · discount", value: "20 (was 100)", live: true }], console: ["20"] } },
  { phase: "done", title: "Line 6 — console.log after the block", note: "let: 100 — untouched, exactly as declared. var: 20 — the block quietly overwrote a variable that looked separate. This is the bug.", l: { line: 6, envs: [{ name: "outer scope · discount", value: "100", live: true, hit: true }], console: ["20", "100"] }, v: { line: 6, envs: [{ name: "outer scope · discount", value: "20 (was 100)", live: true, hit: true }], console: ["20", "20"] } },
];

const phases: Record<Step["phase"], PhaseStyle> = {
  memory: { label: "Memory phase", className: PHASE.violet },
  run: { label: "Running", className: PHASE.green },
  block: { label: "Block boundary", className: PHASE.amber },
  done: { label: "After the block", className: PHASE.plain },
};

function Panel({ title, src, side, tone }: { title: string; src: string[]; side: Side; tone: "sky" | "amber" }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
      <div className={`border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] ${tone === "sky" ? "text-sky" : "text-amber-200"}`}>{title}</div>
      <pre className="my-0 overflow-x-auto rounded-none border-0 bg-transparent px-0 py-2 text-[0.74rem]">
        {src.map((s, n) => {
          const active = side.line === n + 1;
          return (
            <div key={n} className={`grid grid-cols-[1.6rem_1fr] px-3 py-0.5 ${active ? "bg-emerald-400/20" : ""} ${n >= 1 && n <= 4 ? "border-l-2 border-amber-400/40" : "border-l-2 border-transparent"}`}>
              <span className="select-none text-ink-dim/60">{n + 1}</span>
              <code className={active ? "text-ink" : "text-ink-dim"}>{s}</code>
            </div>
          );
        })}
      </pre>
      <div className="border-t border-line px-3 py-2">
        <div className="mb-1 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-ink-dim">memory · {side.envs.filter((e) => !e.value?.includes("gone")).length} slot{side.envs.filter((e) => !e.value?.includes("gone")).length === 1 ? "" : "s"}</div>
        <div className="space-y-1 font-mono text-[0.74rem]">
          {side.envs.map((e) => (
            <div key={e.name} className={`flex justify-between rounded border px-2 py-0.5 ${e.hit ? "border-emerald-400/60 bg-emerald-400/10" : e.live ? "border-line bg-bg-elev" : "border-line opacity-50"} ${e.value?.includes("gone") ? "line-through" : ""}`}>
              <span className="text-ink-dim">{e.name}{e.hit ? <span className="ml-1 text-[0.6rem] uppercase text-emerald-300">← read</span> : null}</span>
              <span className={e.value?.includes("TDZ") ? "text-red-300" : e.value === "undefined" ? "text-ink-dim" : e.value?.includes("was") ? "text-amber-200" : "text-emerald-200"}>{e.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="min-h-[3rem] border-t border-line px-3 py-2 font-mono text-[0.74rem]">
        {side.console.length === 0 ? <span className="text-ink-dim">(console)</span> : side.console.map((c, i) => <div key={i} className="text-ink">› {c}</div>)}
      </div>
    </div>
  );
}

export default function ShadowStepper() {
  return (
    <Stepper steps={STEPS} phases={phases} caption="Step through both files together. Count the slots: let makes a second one inside the block and throws it away; var only ever had one, and line 3 overwrites it." interval={2400}>
      {(step) => (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Panel title="let · two separate slots" src={LET_SRC} side={step.l} tone="sky" />
          <Panel title="var · one slot, overwritten" src={VAR_SRC} side={step.v} tone="amber" />
        </div>
      )}
    </Stepper>
  );
}
