"use client";

import Stepper, { PHASE, type PhaseStyle, type StepBase } from "./Stepper";

/**
 * Reusable step-through of a variable lookup along the scope chain: the source
 * with the current line highlighted, and the chain of Lexical Environments
 * (innermost on top, Global at the bottom, then null) with the lookup climbing
 * one box at a time until it finds the name or runs out of chain.
 */

export type Env = {
  name: string;
  vars: Record<string, string>;
  tone: "global" | "fn" | "inner";
  /** Not created yet / already popped — drawn faded. */
  absent?: boolean;
};

export type LookupStep = StepBase & {
  phase: "run" | "lookup" | "found" | "miss" | "error";
  line: number | null;
  envs: Env[];
  /** Index into envs currently being checked (0 = innermost). -1 = null, past Global. */
  checking?: number;
  /** Which variable the lookup is for. */
  lookingFor?: string;
  console: { text: string; bad?: boolean }[];
};

const phases: Record<LookupStep["phase"], PhaseStyle> = {
  run: { label: "Running", className: PHASE.green },
  lookup: { label: "Scope chain · one level up", className: PHASE.sky },
  found: { label: "Found — lookup stops", className: PHASE.green },
  miss: { label: "Not here — keep climbing", className: PHASE.amber },
  error: { label: "End of chain · ReferenceError", className: PHASE.red },
};

const tone: Record<Env["tone"], string> = {
  global: "border-line bg-bg-elev",
  fn: "border-emerald-400/50 bg-emerald-400/10",
  inner: "border-violet-400/50 bg-violet-400/10",
};

export default function ScopeLookupStepper({ file, source, steps, caption }: { file: string; source: string[]; steps: LookupStep[]; caption: string }) {
  return (
    <Stepper steps={steps} phases={phases} caption={caption} interval={2200}>
      {(step) => (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.1fr_1fr]">
          <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
            <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">{file}</div>
            <pre className="my-0 overflow-x-auto rounded-none border-0 bg-transparent px-0 py-2 text-[0.78rem]">
              {source.map((src, n) => {
                const ln = n + 1;
                const active = step.line === ln;
                const bg = step.phase === "error" ? "bg-red-400/20" : step.phase === "found" || step.phase === "run" ? "bg-emerald-400/20" : "bg-sky-soft";
                return (
                  <div key={ln} className={`grid grid-cols-[2rem_1fr] px-3 py-0.5 ${active ? bg : ""}`}>
                    <span className="select-none text-ink-dim/60">{ln}</span>
                    <code className={active ? "text-ink" : "text-ink-dim"}>{src || " "}</code>
                  </div>
                );
              })}
            </pre>
            <div className="border-t border-line px-3 py-2 font-mono text-[0.78rem]">
              {step.console.length === 0 ? <span className="text-ink-dim">(console)</span> : step.console.map((c, i) => <div key={i} className={c.bad ? "text-red-300" : "text-emerald-200"}>› {c.text}</div>)}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
            <div className="flex items-center justify-between border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">
              <span>Scope chain · inner → outer</span>
              {step.lookingFor ? <span className="text-sky">find: {step.lookingFor}</span> : null}
            </div>
            <div className="p-3">
              {step.envs.map((env, i) => {
                const checking = step.checking === i;
                const hasIt = !!step.lookingFor && step.lookingFor in env.vars;
                const state = checking ? (step.phase === "found" ? "found" : step.phase === "miss" || step.phase === "lookup" ? "miss" : "check") : "";
                const ring = state === "found" ? "ring-2 ring-emerald-400/70" : state === "miss" ? "ring-2 ring-amber-400/60" : state === "check" ? "ring-2 ring-sky/60" : "";
                return (
                  <div key={env.name}>
                    <div className={`rounded-lg border px-3 py-2 transition-all ${tone[env.tone]} ${ring} ${env.absent ? "border-dashed opacity-35" : ""}`}>
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="text-[0.82rem] font-semibold text-ink">{env.name}</span>
                        <span className="font-mono text-[0.6rem] uppercase tracking-[0.08em]">
                          {env.absent ? <span className="text-ink-dim">not on the stack</span> : checking ? (state === "found" ? <span className="text-emerald-300">found ✓</span> : state === "miss" ? <span className="text-amber-300">not here</span> : <span className="text-sky">checking…</span>) : null}
                        </span>
                      </div>
                      <ul className="m-0 list-none space-y-0.5 p-0 font-mono text-[0.74rem]">
                        {Object.keys(env.vars).length === 0 ? <li className="text-ink-dim/70">(no variables)</li> : Object.entries(env.vars).map(([k, v]) => (
                          <li key={k} className={`flex justify-between rounded px-1 ${checking && k === step.lookingFor && hasIt ? "bg-emerald-400/20" : ""}`}><span className="text-sky-strong">{k}</span><span className={v === "undefined" ? "text-ink-dim" : v.startsWith("{") ? "text-amber-200" : "text-emerald-200"}>{v}</span></li>
                        ))}
                      </ul>
                    </div>
                    <div className={`py-0.5 text-center font-mono text-[0.68rem] ${step.checking !== undefined && (step.checking > i || step.checking === -1) ? "text-sky" : "text-ink-dim/50"}`}>
                      ↓ outer reference
                    </div>
                  </div>
                );
              })}
              <div className={`rounded-lg border border-dashed px-3 py-1.5 text-center font-mono text-[0.72rem] ${step.checking === -1 ? "border-red-400/70 bg-red-400/10 text-red-300" : "border-line text-ink-dim/60"}`}>
                null{step.checking === -1 ? " — nowhere left to look" : ""}
              </div>
            </div>
          </div>
        </div>
      )}
    </Stepper>
  );
}
