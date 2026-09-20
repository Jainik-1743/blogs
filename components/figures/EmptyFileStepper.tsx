"use client";

import Stepper, { PHASE, type PhaseStyle, type StepBase } from "./Stepper";

/** What the engine builds for a completely empty .js file, one piece at a time. */

type Step = StepBase & {
  phase: "start" | "build" | "idle";
  gec: boolean;
  ve: boolean;
  globalObj: boolean;
  thisBound: boolean;
  highlight?: "gec" | "ve" | "global" | "this";
};

const STEPS: Step[] = [
  { phase: "start", title: "The file is loaded — zero lines of code", note: "Nothing to parse, nothing to hoist. And yet the engine does not stop here.", gec: false, ve: false, globalObj: false, thisBound: false },
  { phase: "build", title: "Global Execution Context created and pushed", note: "Step one of every program (Lesson 1). It is pushed onto the empty call stack and will sit there until the program ends.", gec: true, ve: false, globalObj: false, thisBound: false, highlight: "gec" },
  { phase: "build", title: "Its Variable Environment is reserved", note: "The memory half. With no var or function declarations in the file, the memory phase has nothing to put in it — but the record itself still exists.", gec: true, ve: true, globalObj: false, thisBound: false, highlight: "ve" },
  { phase: "build", title: "The global object is created", note: "window in a browser. It comes pre-loaded with everything the environment provides — console, setTimeout, document, Math… none of which you wrote. The Object Environment Record (Lesson 3) is tied to it.", gec: true, ve: true, globalObj: true, thisBound: false, highlight: "global" },
  { phase: "build", title: "this is bound to the global object", note: "The ThisBinding of the Global EC is set to point at window. this === window is now true, and nothing in your code had to happen for it.", gec: true, ve: true, globalObj: true, thisBound: true, highlight: "this" },
  { phase: "idle", title: "Ready — and nothing to run", note: "Code phase: no lines. The engine is idle with all of this infrastructure in place. That is the shortest JS program: a whole Global EC, a global object and a this, for an empty file.", gec: true, ve: true, globalObj: true, thisBound: true },
];

const phases: Record<Step["phase"], PhaseStyle> = {
  start: { label: "Program starts", className: PHASE.plain },
  build: { label: "Engine setup · before line 1", className: PHASE.violet },
  idle: { label: "Idle", className: PHASE.green },
};

export default function EmptyFileStepper() {
  return (
    <Stepper steps={STEPS} phases={phases} caption="Step through what the engine builds for an empty file. Every piece appears before any code could have asked for it." interval={2000}>
      {(step) => {
        const hl = (k: Step["highlight"]) => (step.highlight === k ? "ring-1 ring-amber-400/70 bg-amber-400/10" : "");
        return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1.3fr]">
            <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
              <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">empty.js</div>
              <pre className="my-0 rounded-none border-0 bg-transparent px-3 py-2 text-[0.78rem] text-ink-dim/60">
                <div>// this file is completely empty</div>
                <div>// and yet: a Global Execution Context,</div>
                <div>// a global object, and `this` already exist</div>
              </pre>
            </div>
            <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
              <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">Call stack</div>
              <div className="min-h-[13rem] p-3">
                {!step.gec ? (
                  <div className="py-8 text-center font-mono text-[0.8rem] text-ink-dim">[ ]  empty</div>
                ) : (
                  <div className={`rounded-lg border border-sky/60 bg-sky-soft px-3 py-2 transition-all ${hl("gec")}`}>
                    <div className="mb-2 text-[0.85rem] font-semibold text-ink">Global Execution Context</div>
                    <div className="space-y-1.5">
                      <div className={`rounded-md border px-2 py-1 transition-all ${step.ve ? `border-violet-400/40 bg-violet-400/5 ${hl("ve")}` : "border-dashed border-line opacity-30"}`}>
                        <div className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-ink-dim">Variable Environment</div>
                        <div className="font-mono text-[0.72rem] text-ink-dim/70">{step.ve ? "(empty — nothing declared)" : "…"}</div>
                      </div>
                      <div className={`rounded-md border px-2 py-1 transition-all ${step.globalObj ? `border-emerald-400/40 bg-emerald-400/5 ${hl("global")}` : "border-dashed border-line opacity-30"}`}>
                        <div className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-ink-dim">global object · window</div>
                        <div className="font-mono text-[0.72rem]">{step.globalObj ? <span className="text-emerald-200">{"{ console, setTimeout, document, Math, … }"}</span> : <span className="text-ink-dim/70">…</span>}</div>
                      </div>
                      <div className={`rounded-md border px-2 py-1 transition-all ${step.thisBound ? `border-amber-400/40 bg-amber-400/5 ${hl("this")}` : "border-dashed border-line opacity-30"}`}>
                        <div className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-ink-dim">ThisBinding</div>
                        <div className="font-mono text-[0.72rem]">{step.thisBound ? <span><span className="text-sky-strong">this</span> <span className="text-ink-dim">→</span> <span className="text-emerald-200">window</span></span> : <span className="text-ink-dim/70">…</span>}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }}
    </Stepper>
  );
}
