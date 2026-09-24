"use client";

import Stepper, { PHASE, type PhaseStyle, type StepBase } from "./Stepper";

/**
 * One function's life inside V8: it starts in Ignition, climbs the tiers as it gets hot,
 * and falls back to bytecode (deoptimizes) the moment TurboFan's type assumption breaks.
 */

type Tier = "Ignition" | "Sparkplug" | "Maglev" | "TurboFan";
type Step = StepBase & {
  phase: "cold" | "warm" | "hot" | "deopt";
  calls: string;
  tier: Tier;
  feedback: string;
  compiling?: Tier;
};

const TIERS: { id: Tier; what: string }[] = [
  { id: "Ignition", what: "interpreter · bytecode" },
  { id: "Sparkplug", what: "baseline compiler" },
  { id: "Maglev", what: "mid-tier optimizer" },
  { id: "TurboFan", what: "top-tier optimizer" },
];

const STEPS: Step[] = [
  { phase: "cold", calls: "0", tier: "Ignition", feedback: "none yet", title: "square is parsed and turned into bytecode", note: "Nothing is optimized up front. Ignition can start running the bytecode immediately — that's why JS starts fast." },
  { phase: "cold", calls: "1–10", tier: "Ignition", feedback: "n: number (every call so far)", title: "The first calls run in the interpreter", note: "While interpreting, Ignition records type feedback: which types each operation actually saw. Every n so far has been a number." },
  { phase: "warm", calls: "~50", tier: "Sparkplug", feedback: "n: number", compiling: "Sparkplug", title: "Warm: Sparkplug compiles it quickly", note: "A fast, non-optimizing compile that removes interpreter overhead. Cheap to produce, so V8 does it early." },
  { phase: "warm", calls: "~500", tier: "Maglev", feedback: "n: number", compiling: "Maglev", title: "Warmer: Maglev optimizes using the feedback", note: "Maglev uses the recorded types to generate better code, still quickly — a middle ground while the function proves it's really hot." },
  { phase: "hot", calls: "thousands", tier: "TurboFan", feedback: "n: always a small integer", compiling: "TurboFan", title: "Hot: TurboFan compiles near-native machine code", note: "On a background thread, TurboFan bets that n will stay an integer and emits tight machine code — n * n becomes a single multiply instruction, guarded by a quick type check." },
  { phase: "hot", calls: "millions", tier: "TurboFan", feedback: "n: small integer ✓", title: "The loop now runs at full speed", note: "Each call passes the cheap guard and runs the optimized code. This is the “warm run” in the timing experiment below." },
  { phase: "deopt", calls: "square(\"7\")", tier: "Ignition", feedback: "n: number | string ✗", title: "Surprise input — the guard fails, V8 deoptimizes", note: "A string breaks TurboFan's assumption. V8 throws the optimized code away and resumes this call safely in Ignition's bytecode. Correctness is never at risk; only speed is." },
  { phase: "deopt", calls: "later", tier: "Maglev", feedback: "n: number | string (polymorphic)", compiling: "Maglev", title: "If it stays hot, it re-optimizes — for both types", note: "The new code handles both types, which is slower than the integer-only version. Keeping a function's inputs one type is what keeps it on the fast path." },
];

const phases: Record<Step["phase"], PhaseStyle> = {
  cold: { label: "Cold · interpreting", className: PHASE.plain },
  warm: { label: "Warming up · cheap compiles", className: PHASE.amber },
  hot: { label: "Hot · optimized machine code", className: PHASE.green },
  deopt: { label: "Deoptimization · back to bytecode", className: PHASE.red },
};

export default function JitTierStepper() {
  return (
    <Stepper steps={STEPS} phases={phases} caption="Follow square(n) up V8's tiers as it gets hot — and back down when one call breaks the type assumption TurboFan relied on." interval={2400}>
      {(step) => (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_14rem]">
          <ol className="m-0 flex list-none flex-col-reverse gap-1.5 p-0">
            {TIERS.map((t) => {
              const active = step.tier === t.id;
              const compiling = step.compiling === t.id;
              return (
                <li
                  key={t.id}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 transition ${
                    active ? (step.phase === "deopt" && t.id === "Ignition" ? "border-red-400/70 bg-red-400/10" : "border-emerald-400/70 bg-emerald-400/10") : "border-line bg-bg-code opacity-60"
                  }`}
                >
                  <span>
                    <span className="font-mono text-[0.82rem] font-semibold text-ink">{t.id}</span>
                    <span className="ml-2 font-mono text-[0.68rem] text-ink-dim">{t.what}</span>
                  </span>
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.08em]">
                    {active ? <span className="text-emerald-300">running</span> : null}
                    {compiling && !active ? <span className="text-amber-200">compiling…</span> : null}
                  </span>
                </li>
              );
            })}
          </ol>
          <div className="space-y-2 font-mono text-[0.74rem]">
            <div className="rounded-lg border border-line bg-bg-code px-3 py-2">
              <div className="text-[0.62rem] uppercase tracking-[0.08em] text-ink-dim">function</div>
              <div className="text-ink">square(n) → n * n</div>
            </div>
            <div className="rounded-lg border border-line bg-bg-code px-3 py-2">
              <div className="text-[0.62rem] uppercase tracking-[0.08em] text-ink-dim">calls so far</div>
              <div className="text-sky">{step.calls}</div>
            </div>
            <div className={`rounded-lg border px-3 py-2 ${step.phase === "deopt" ? "border-red-400/50 bg-red-400/10" : "border-line bg-bg-code"}`}>
              <div className="text-[0.62rem] uppercase tracking-[0.08em] text-ink-dim">type feedback</div>
              <div className="text-ink">{step.feedback}</div>
            </div>
          </div>
        </div>
      )}
    </Stepper>
  );
}
