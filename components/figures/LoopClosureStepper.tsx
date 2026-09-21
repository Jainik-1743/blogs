"use client";

import Stepper, { PHASE, type PhaseStyle, type StepBase } from "./Stepper";

/**
 * The classic: three setTimeout callbacks created in a loop, run a second
 * later. With var they all close over one i; with let each closes over its
 * own per-iteration binding.
 */

const VAR_SRC = ["for (var i = 1; i <= 3; i++) {", "  setTimeout(() => console.log(i), 1000);", "}", "// after 1 second: 4, 4, 4"];
const LET_SRC = ["for (let i = 1; i <= 3; i++) {", "  setTimeout(() => console.log(i), 1000);", "}", "// after 1 second: 1, 2, 3"];

type Binding = { label: string; value: string; reading?: boolean };
type Timer = { label: string; target: string; fired?: boolean };
type Side = { line: number | null; bindings: Binding[]; timers: Timer[]; console: string[] };
type Step = StepBase & { phase: "loop" | "wait" | "fire"; clock: string; v: Side; l: Side };

const vT = (n: number, fired = 0): Timer[] => Array.from({ length: n }, (_, i) => ({ label: `callback ${i + 1}`, target: "the one i", fired: i < fired }));
const lT = (n: number, fired = 0): Timer[] => Array.from({ length: n }, (_, i) => ({ label: `callback ${i + 1}`, target: `iteration ${i + 1}'s i`, fired: i < fired }));
const lB = (n: number, reading = -1): Binding[] => Array.from({ length: n }, (_, i) => ({ label: `iteration ${i + 1} · i`, value: String(i + 1), reading: i === reading }));

const STEPS: Step[] = [
  { phase: "loop", clock: "0 ms", title: "Iteration 1 — a callback is created and handed to setTimeout", note: "The arrow function is created now, so its closure link is attached now. var: it links to the loop's single i (currently 1). let: it links to iteration 1's own block binding, i = 1.", v: { line: 2, bindings: [{ label: "function scope · i", value: "1" }], timers: vT(1), console: [] }, l: { line: 2, bindings: lB(1), timers: lT(1), console: [] } },
  { phase: "loop", clock: "0 ms", title: "Iteration 2 — second callback", note: "var: same single i, now 2; both callbacks link to it. let: a fresh binding i = 2; the second callback links to that one. Iteration 1's binding is still alive — callback 1 holds it.", v: { line: 2, bindings: [{ label: "function scope · i", value: "2" }], timers: vT(2), console: [] }, l: { line: 2, bindings: lB(2), timers: lT(2), console: [] } },
  { phase: "loop", clock: "0 ms", title: "Iteration 3 — third callback", note: "var: one i = 3, three callbacks pointing at it. let: three bindings, three callbacks, one each.", v: { line: 2, bindings: [{ label: "function scope · i", value: "3" }], timers: vT(3), console: [] }, l: { line: 2, bindings: lB(3), timers: lT(3), console: [] } },
  { phase: "wait", clock: "0 ms", title: "The loop finishes — i++ runs one last time", note: "var: i becomes 4, the test fails, the loop ends. The single i is left holding 4, and all three callbacks still point at it. let: the loop ends; the per-iteration bindings would normally be discarded, but each is kept alive by the callback that closed over it. None of them changed.", v: { line: 3, bindings: [{ label: "function scope · i", value: "4" }], timers: vT(3), console: [] }, l: { line: 3, bindings: lB(3), timers: lT(3), console: [] } },
  { phase: "wait", clock: "0 → 1000 ms", title: "One second passes", note: "The call stack is empty. The three timers are waiting in the browser. Nothing about the bindings changes during the wait.", v: { line: null, bindings: [{ label: "function scope · i", value: "4" }], timers: vT(3), console: [] }, l: { line: null, bindings: lB(3), timers: lT(3), console: [] } },
  { phase: "fire", clock: "1000 ms", title: "Callback 1 runs", note: "It reads i through its closure link — now, not when it was created. var: the one i, which is 4. let: iteration 1's i, which is still 1.", v: { line: 2, bindings: [{ label: "function scope · i", value: "4", reading: true }], timers: vT(3, 1), console: ["4"] }, l: { line: 2, bindings: lB(3, 0), timers: lT(3, 1), console: ["1"] } },
  { phase: "fire", clock: "1000 ms", title: "Callback 2 runs", note: "var: same i, 4 again. let: iteration 2's binding, 2.", v: { line: 2, bindings: [{ label: "function scope · i", value: "4", reading: true }], timers: vT(3, 2), console: ["4", "4"] }, l: { line: 2, bindings: lB(3, 1), timers: lT(3, 2), console: ["1", "2"] } },
  { phase: "fire", clock: "1000 ms", title: "Callback 3 runs", note: "var: 4, 4, 4 — three closures over one variable that finished at 4. let: 1, 2, 3 — three closures over three variables that never changed. Same closure mechanism; the only difference is how many i there were.", v: { line: 2, bindings: [{ label: "function scope · i", value: "4", reading: true }], timers: vT(3, 3), console: ["4", "4", "4"] }, l: { line: 2, bindings: lB(3, 2), timers: lT(3, 3), console: ["1", "2", "3"] } },
];

const phases: Record<Step["phase"], PhaseStyle> = {
  loop: { label: "Loop running · callbacks created", className: PHASE.green },
  wait: { label: "Loop finished · timers pending", className: PHASE.amber },
  fire: { label: "Timers fire · callbacks read i", className: PHASE.sky },
};

function Panel({ title, src, side, tone }: { title: string; src: string[]; side: Side; tone: "amber" | "sky" }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
      <div className={`border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] ${tone === "amber" ? "text-amber-200" : "text-sky"}`}>{title}</div>
      <pre className="my-0 overflow-x-auto rounded-none border-0 bg-transparent px-0 py-2 text-[0.72rem]">
        {src.map((s, n) => (
          <div key={n} className={`grid grid-cols-[1.6rem_1fr] px-3 py-0.5 ${side.line === n + 1 ? "bg-emerald-400/20" : ""}`}>
            <span className="select-none text-ink-dim/60">{n + 1}</span>
            <code className={side.line === n + 1 ? "text-ink" : "text-ink-dim"}>{s}</code>
          </div>
        ))}
      </pre>
      <div className="border-t border-line px-3 py-2">
        <div className="mb-1 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-ink-dim">bindings of i · {side.bindings.length}</div>
        <div className="space-y-1 font-mono text-[0.72rem]">
          {side.bindings.map((b) => (
            <div key={b.label} className={`flex justify-between rounded border px-2 py-0.5 ${b.reading ? "border-emerald-400/60 bg-emerald-400/10" : "border-line bg-bg-elev"}`}>
              <span className="text-ink-dim">{b.label}{b.reading ? <span className="ml-1 text-[0.6rem] uppercase text-emerald-300">← read</span> : null}</span><span className="text-emerald-200">{b.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-line px-3 py-2">
        <div className="mb-1 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-ink-dim">pending timers · each closes over…</div>
        <div className="space-y-1 font-mono text-[0.72rem]">
          {side.timers.length === 0 ? <div className="text-ink-dim">(none yet)</div> : side.timers.map((t) => (
            <div key={t.label} className={`flex justify-between rounded px-2 py-0.5 ${t.fired ? "opacity-40 line-through" : "bg-bg-elev"}`}><span className="text-ink">{t.label}</span><span className="text-violet-300">→ {t.target}</span></div>
          ))}
        </div>
      </div>
      <div className="min-h-[3rem] border-t border-line px-3 py-2 font-mono text-[0.74rem]">
        {side.console.length === 0 ? <span className="text-ink-dim">(console)</span> : side.console.map((c, i) => <div key={i} className="text-ink">› {c}</div>)}
      </div>
    </div>
  );
}

export default function LoopClosureStepper() {
  return (
    <Stepper steps={STEPS} phases={phases} caption="Step through both loops together. Count the bindings: var has one, so all three callbacks read the same final 4; let has three, so each callback reads its own." interval={2400}>
      {(step) => (
        <>
          <div className="mb-3 text-right font-mono text-[0.7rem] text-ink-dim">clock: {step.clock}</div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Panel title="var · one shared i" src={VAR_SRC} side={step.v} tone="amber" />
            <Panel title="let · one i per iteration" src={LET_SRC} side={step.l} tone="sky" />
          </div>
        </>
      )}
    </Stepper>
  );
}
