/**
 * Data for the step-by-step explainers that lessons embed. A lesson holds a fenced block
 *
 *   ```explainer
 *   networking-3-dns
 *   ```
 *
 * (or <Explainer name="devops-7-ec2" /> in a TSX lesson), and the name is looked up in lib/explain/data/<series>.ts.
 * Four kinds exist; pick the one that matches what the lesson teaches:
 *   flow   boxes and arrows (architectures, pipelines, state machines, trees, graphs)
 *   array  a row or grid of values with pointers (sorting, searching, DP tables, stacks, queues)
 *   trace  code with a moving line and a variables table (closures, event loop, algorithms)
 *   seq    who sends what to whom, in order (protocols, request flows)
 * lib/explain/validate.ts checks every definition; `node --experimental-strip-types scripts/check-explainers.mts` runs it.
 */
export type Tone = "client" | "server" | "data" | "store" | "queue" | "warn" | "plain";

/** Fields every step has. `title` is the heading under the picture, `note` the explanation in plain words. */
export type StepText = { title: string; note: string };

/* ---------------------------------------------------------------- flow */
export type FlowNode = {
  id: string;
  /** Up to two short lines of text in the box (see validate.ts for the fit rules). */
  label: string;
  /** Optional smaller second line, e.g. a value or a role. A step's `set` can change it. */
  sub?: string;
  /** Grid position. Columns and rows may be fractional (1.5) to nudge a box between cells. */
  col: number;
  row: number;
  /** How many columns wide (default 1). */
  span?: number;
  tone?: Tone;
};
export type FlowEdge = {
  id: string;
  from: string;
  to: string;
  /** Short text on the arrow (max ~26 characters). */
  label?: string;
  dashed?: boolean;
  /** Bend the arrow sideways: -2..2. Use it when a straight arrow would cross another box. */
  curve?: number;
  /** Arrow heads at both ends. */
  both?: boolean;
};
export type FlowStep = StepText & {
  /** Ids (nodes or edges) that become visible at this step and stay visible. Anything listed in some step's `appear` is hidden before that step. */
  appear?: string[];
  /** Ids (nodes or edges) that disappear from this step on. List an id in a later step's `appear` to bring it back. */
  hide?: string[];
  /** Ids to highlight in this step. Arrows in focus show a moving dash. */
  focus?: string[];
  /** Change the small second line of a node, from this step on: { nodeId: "new text" }. */
  set?: Record<string, string>;
};
export type FlowDef = { kind: "flow"; title: string; nodes: FlowNode[]; edges: FlowEdge[]; steps: FlowStep[]; intro?: string };

/* --------------------------------------------------------------- array */
export type Cell = string | number;
/** An index in a row (number) or a [row, column] pair in a grid. */
export type At = number | [number, number];
export type ArrayStep = StepText & {
  /** The whole contents after this step. Omit to keep the previous contents. Same shape as the starting `cells`. */
  cells?: Cell[] | Cell[][];
  /** Labels with an arrow above a cell, e.g. { at: 3, label: "mid" }. */
  pointers?: { at: At; label: string }[];
  /** Cells to highlight in this step. */
  mark?: At[];
  /** Cells that are finished / found (green). Not remembered: list them again in later steps. */
  done?: At[];
  /** Cells to fade (ruled out, already passed). */
  dim?: At[];
};
export type ArrayDef = {
  kind: "array";
  title: string;
  /** A row of values, or an array of rows for a grid. */
  cells: Cell[] | Cell[][];
  /** Names under the cells instead of 0, 1, 2 … (one per column). */
  indexLabels?: string[];
  steps: ArrayStep[];
  intro?: string;
};

/* --------------------------------------------------------------- trace */
export type TraceStep = StepText & {
  /** 1-based line number(s) of `code` being run in this step. */
  line: number | number[];
  /** The whole variables table after this step: [name, value] pairs. Omit to keep the previous table. */
  vars?: [string, string][];
  /** Text printed to the console in this step (added to what was printed before). */
  out?: string;
};
export type TraceDef = { kind: "trace"; title: string; lang?: string; code: string[]; steps: TraceStep[]; intro?: string; varsTitle?: string };

/* ----------------------------------------------------------------- seq */
export type SeqKindDef = {
  kind: "seq";
  title: string;
  actors: { name: string; sub?: string }[];
  steps: (StepText & { from: number; to: number; label: string; self?: boolean })[];
};

export type ExplainerDef = FlowDef | ArrayDef | TraceDef | SeqKindDef;
export type ExplainerData = Record<string, ExplainerDef>;
