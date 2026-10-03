/**
 * Builds the steps for <CodeTrace>. A lesson re-runs its example in TypeScript and calls
 * `step()` at each line, so the trace is produced by actually executing the logic — the
 * values shown can never drift from what the code really does.
 */

export type TracePhase = "start" | "check" | "run" | "update" | "print" | "done" | "stop";

export type TraceStep = {
  phase: TracePhase;
  title: string;
  note: string;
  /** 1-based line of the code sample to highlight. */
  line: number;
  /** Every variable alive at this moment, already formatted for display. */
  vars: Record<string, string>;
  /** Name of the variable that just changed, highlighted in the panel. */
  changed?: string;
  /** Everything printed so far. */
  out: string[];
};

/** Format a JS value the way the console would show it inside the variables panel. */
export function show(v: unknown): string {
  if (typeof v === "string") return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(show).join(", ")}]`;
  if (v instanceof Map) return `Map(${v.size}) {${[...v].map(([k, x]) => `${show(k)} => ${show(x)}`).join(", ")}}`;
  if (v instanceof Set) return `Set(${v.size}) {${[...v].map(show).join(", ")}}`;
  if (v && typeof v === "object") return `{ ${Object.entries(v).map(([k, x]) => `${k}: ${show(x)}`).join(", ")} }`;
  return String(v);
}

export function tracer() {
  const steps: TraceStep[] = [];
  const out: string[] = [];
  return {
    steps,
    /** Record one step. `vars` holds the raw values; they are formatted here. */
    step(
      line: number,
      phase: TracePhase,
      title: string,
      note: string,
      vars: Record<string, unknown> = {},
      changed?: string,
    ) {
      const shown: Record<string, string> = {};
      for (const [k, v] of Object.entries(vars)) if (v !== undefined) shown[k] = show(v);
      steps.push({ line, phase, title, note, vars: shown, changed, out: [...out] });
    },
    /** Add a line to the console output (call before the matching step). */
    print(text: unknown) {
      out.push(typeof text === "string" ? text : show(text));
    },
  };
}
