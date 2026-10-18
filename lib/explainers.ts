/**
 * Step-by-step explainers that lessons embed with a fenced block:
 *
 *   ```explainer
 *   tcp-handshake
 *   ```
 *
 * Sequence explainers are plain data (who talks to whom, in what order, with a plain-English note);
 * components/explainers draws and animates them. The circuit breaker is a state machine, so it has its own data.
 */
export type SeqActor = { name: string; sub?: string };
export type SeqStep = {
  from: number;
  to: number;
  /** Short text on the arrow. */
  label: string;
  /** Heading of the step in the caption. */
  title: string;
  /** One or two plain sentences. */
  note: string;
  /** For a step an actor does by itself (from === to). */
  self?: boolean;
};
export type SeqDef = { title: string; actors: SeqActor[]; steps: SeqStep[] };

export type BreakerState = "closed" | "open" | "half";
export type BreakerCall = "ok" | "fail" | "fast";
export type BreakerStep = {
  state: BreakerState;
  /** The arrow that was just taken, if the breaker changed state in this step. */
  moved?: [BreakerState, BreakerState];
  failures: number;
  calls: BreakerCall[];
  title: string;
  note: string;
};

export const BREAKER_STEPS: BreakerStep[] = [
  { state: "closed", failures: 0, calls: ["ok", "ok", "ok"], title: "Closed: calls go through", note: "This is normal life. Every call goes to the dependency, and the breaker only counts how many fail." },
  { state: "closed", failures: 2, calls: ["ok", "ok", "ok", "fail", "fail"], title: "Failures pile up", note: "The dependency starts to fail or time out. The breaker counts the failures but still lets calls through." },
  { state: "open", moved: ["closed", "open"], failures: 5, calls: ["ok", "fail", "fail", "fail", "fail", "fail"], title: "The threshold is reached: the breaker opens", note: "For example five failures in a row, or half of the last twenty calls. The breaker trips, like a fuse." },
  { state: "open", failures: 5, calls: ["fail", "fail", "fast", "fast", "fast", "fast"], title: "Open: calls fail fast", note: "No call is sent to the sick dependency. Callers get an error at once, or a fallback answer. This stops your threads from piling up waiting, and gives the dependency room to recover." },
  { state: "half", moved: ["open", "half"], failures: 5, calls: ["fast", "fast", "fast", "fast"], title: "Half-open: let one call test", note: "After a wait, say 30 seconds, the breaker lets a single trial call through. Everything else still fails fast." },
  { state: "closed", moved: ["half", "closed"], failures: 0, calls: ["fast", "fast", "ok", "ok", "ok"], title: "The trial worked: closed again", note: "The trial call succeeded, so the breaker closes and the count starts from zero. If the trial had failed, the breaker would go back to open and wait again." },
];
