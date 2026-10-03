"use client";

import Stepper, { PHASE, type StepBase } from "@/components/figures/Stepper";
import type { TraceStep } from "@/lib/dsa-trace";

/**
 * Step through a small program one line at a time: the current line is highlighted, the
 * variables panel shows every value at that moment, and the console shows what has been
 * printed so far. It is a dry run that moves.
 */

const phases = {
  start: { label: "Set up", className: PHASE.violet },
  check: { label: "Check the condition", className: PHASE.amber },
  run: { label: "Run this line", className: PHASE.sky },
  update: { label: "Update", className: PHASE.violet },
  print: { label: "Print", className: PHASE.green },
  done: { label: "Finished", className: PHASE.green },
  stop: { label: "Condition is false — stop", className: PHASE.red },
};

type Step = TraceStep & StepBase;

export default function CodeTrace({
  code,
  steps,
  caption,
}: {
  code: string;
  steps: TraceStep[];
  caption: string;
}) {
  const lines = code.split("\n");
  return (
    <Stepper<Step> steps={steps as Step[]} phases={phases} caption={caption} interval={1500}>
      {(step) => {
        const names = Object.keys(step.vars);
        return (
          <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <pre className="my-0 overflow-x-auto rounded-lg border border-line bg-bg-code px-0 py-2 text-[0.8rem] leading-[1.7]">
              <code>
                {lines.map((l, i) => {
                  const active = i + 1 === step.line;
                  return (
                    <span
                      key={i}
                      className={`grid grid-cols-[2.2rem_1fr] pr-3 ${active ? "bg-sky-soft" : ""}`}
                    >
                      <span className={`select-none pr-2 text-right ${active ? "text-sky" : "text-ink-dim/50"}`}>
                        {active ? "▶" : i + 1}
                      </span>
                      <span className={active ? "text-ink" : "text-ink-dim"}>{l || " "}</span>
                    </span>
                  );
                })}
              </code>
            </pre>

            <div className="flex flex-col gap-3">
              <div className="rounded-lg border border-line bg-bg-code px-3 py-2">
                <div className="mb-1 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-ink-dim">Variables</div>
                {names.length === 0 ? (
                  <div className="font-mono text-[0.8rem] text-ink-dim">— none yet —</div>
                ) : (
                  <table className="my-0 w-full font-mono text-[0.8rem]">
                    <tbody>
                      {names.map((n) => (
                        <tr key={n} className={step.changed === n ? "bg-amber-400/10" : ""}>
                          <td className="py-0.5 pr-3 text-sky">{n}</td>
                          <td className={`py-0.5 ${step.changed === n ? "text-amber-200" : "text-ink"}`}>{step.vars[n]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="rounded-lg border border-line bg-bg-code px-3 py-2">
                <div className="mb-1 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-ink-dim">Console</div>
                <div className="min-h-[1.5rem] font-mono text-[0.8rem] text-emerald-300">
                  {step.out.length === 0 ? (
                    <span className="text-ink-dim">(nothing printed yet)</span>
                  ) : (
                    step.out.map((o, i) => <div key={i}>{o}</div>)
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </Stepper>
  );
}
