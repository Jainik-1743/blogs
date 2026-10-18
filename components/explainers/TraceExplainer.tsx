"use client";

import type { TraceDef } from "@/lib/explain/types";
import StepFrame, { useStepper } from "./StepControls";

/** Code with a moving "you are here" line, a table of variables, and the console output, one step at a time. */
export default function TraceExplainer({ def }: { def: TraceDef }) {
  const total = def.steps.length;
  const stepper = useStepper(total);
  const { step } = stepper;
  const cur = step > 0 ? def.steps[step - 1] : null;

  let vars: [string, string][] = [];
  let prev: [string, string][] = [];
  let out: string[] = [];
  for (let i = 0; i < step; i++) {
    const s = def.steps[i];
    if (s.vars) {
      prev = vars;
      vars = s.vars;
    } else if (i === step - 1) prev = vars;
    if (s.out !== undefined) out = [...out, s.out];
  }
  const lines = new Set(cur ? (Array.isArray(cur.line) ? cur.line : [cur.line]) : []);
  const before = new Map(prev);
  const changed = (k: string, v: string) => cur?.vars !== undefined && before.get(k) !== v;

  return (
    <StepFrame
      title={def.title}
      total={total}
      stepper={stepper}
      caption={cur ? { heading: cur.title, note: cur.note } : { heading: "The code", note: def.intro ?? "Press Next to run the code one step at a time. The highlighted line is the one being run." }}
    >
      <div className="grid gap-3 px-2 md:grid-cols-[1.5fr_1fr]">
        <pre data-no-tts="" className="m-0 overflow-x-auto rounded-xl border border-line bg-bg-code py-2 text-[0.82rem] leading-[1.65]">
          <code className="block min-w-max font-mono">
            {def.code.map((l, i) => {
              const on = lines.has(i + 1);
              return (
                <span key={i} data-line={i + 1} className={`flex border-l-[3px] pr-4 ${on ? "border-sky bg-sky-soft" : "border-transparent"}`}>
                  <span aria-hidden="true" className="w-9 shrink-0 select-none pr-3 text-right text-ink-dim/70">
                    {i + 1}
                  </span>
                  <span className={on ? "text-ink" : "text-ink-dim"}>{l || " "}</span>
                </span>
              );
            })}
          </code>
        </pre>
        <div className="flex min-w-0 flex-col gap-3">
          <div className="rounded-xl border border-line bg-bg-code px-3 py-2">
            <p className="m-0 mb-1 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-dim">{def.varsTitle ?? "Variables"}</p>
            {vars.length ? (
              <table className="m-0 w-full border-collapse font-mono text-[0.8rem]">
                <tbody>
                  {vars.map(([k, v]) => (
                    <tr key={k}>
                      <td className="py-0.5 pr-3 align-top text-sky">{k}</td>
                      <td className={`py-0.5 align-top [overflow-wrap:anywhere] ${changed(k, v) ? "font-bold text-ink" : "text-ink-dim"}`}>
                        {v}
                        {changed(k, v) ? <span className="ml-1 text-sky">◀</span> : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="m-0 font-mono text-[0.8rem] text-ink-dim">(nothing yet)</p>
            )}
          </div>
          <div className="rounded-xl border border-line bg-bg-code px-3 py-2">
            <p className="m-0 mb-1 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-dim">Console</p>
            {out.length ? (
              out.map((l, i) => (
                <p key={i} className={`m-0 font-mono text-[0.8rem] [overflow-wrap:anywhere] ${i === out.length - 1 && cur?.out !== undefined ? "font-bold text-ink" : "text-ink-dim"}`}>
                  {l}
                </p>
              ))
            ) : (
              <p className="m-0 font-mono text-[0.8rem] text-ink-dim">(no output yet)</p>
            )}
          </div>
        </div>
      </div>
    </StepFrame>
  );
}
