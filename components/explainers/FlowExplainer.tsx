"use client";

import { useId } from "react";
import type { FlowDef, FlowEdge, FlowNode, Tone } from "@/lib/explain/types";
import { FLOW, flowGeometry, labelChars, nodeWidth, subChars, wrap } from "@/lib/explain/validate";
import StepFrame, { useStepper } from "./StepControls";

const TONE: Record<Tone, string> = {
  client: "var(--xp-client)",
  server: "var(--xp-server)",
  data: "var(--xp-data)",
  store: "var(--xp-store)",
  queue: "var(--xp-queue)",
  warn: "var(--xp-warn)",
  plain: "var(--xp-plain)",
};

type Box = { x: number; y: number; w: number; h: number };

/** Where a line from the centre of `b` toward (tx, ty) leaves the box, plus a small gap. */
function exitPoint(b: Box, tx: number, ty: number, gap = 4): [number, number] {
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  const dx = tx - cx;
  const dy = ty - cy;
  if (!dx && !dy) return [cx, cy];
  const sx = dx ? (b.w / 2 + gap) / Math.abs(dx) : Infinity;
  const sy = dy ? (b.h / 2 + gap) / Math.abs(dy) : Infinity;
  const t = Math.min(sx, sy);
  return [cx + dx * t, cy + dy * t];
}

/** Boxes and arrows that build up one step at a time. Definitions are plain data (lib/explain/types.ts). */
export default function FlowExplainer({ def }: { def: FlowDef }) {
  const total = def.steps.length;
  const stepper = useStepper(total);
  const { step, reduce } = stepper;
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  const g = flowGeometry(def);
  const boxes = new Map<string, Box>();
  for (const n of def.nodes) {
    const w = nodeWidth(g.pitch, n.span);
    boxes.set(n.id, { x: FLOW.PADX + n.col * g.pitch + (g.pitch * (n.span ?? 1) - w) / 2, y: FLOW.TOP + n.row * FLOW.ROW, w, h: FLOW.NODE_H });
  }

  // The step at which each element first shows up (0 = visible from the start).
  const appearAt = new Map<string, number>();
  def.steps.forEach((s, i) => {
    for (const id of s.appear ?? []) if (!appearAt.has(id)) appearAt.set(id, i + 1);
  });
  const visible = (id: string) => (appearAt.get(id) ?? 0) <= step;
  const cur = step > 0 ? def.steps[step - 1] : null;
  const focus = new Set(cur?.focus ?? []);
  const justAppeared = new Set(cur?.appear ?? []);
  const subs = new Map<string, string | undefined>(def.nodes.map((n) => [n.id, n.sub]));
  for (let i = 0; i < step; i++) for (const [id, t] of Object.entries(def.steps[i].set ?? {})) subs.set(id, t);

  const edgeGeom = (e: FlowEdge) => {
    const a = boxes.get(e.from)!;
    const b = boxes.get(e.to)!;
    const acx = a.x + a.w / 2, acy = a.y + a.h / 2, bcx = b.x + b.w / 2, bcy = b.y + b.h / 2;
    const dx = bcx - acx, dy = bcy - acy;
    const len = Math.hypot(dx, dy) || 1;
    const bend = (e.curve ?? 0) * 46;
    const mx = (acx + bcx) / 2 + (-dy / len) * bend;
    const my = (acy + bcy) / 2 + (dx / len) * bend;
    const [x1, y1] = exitPoint(a, bend ? mx : bcx, bend ? my : bcy);
    const [x2, y2] = exitPoint(b, bend ? mx : acx, bend ? my : acy, 6);
    const d = bend ? `M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}` : `M${x1} ${y1} L${x2} ${y2}`;
    // Label sits on the curve's midpoint (a quadratic curve passes through the average of the control point and the chord midpoint).
    const lx = bend ? (mx + (x1 + x2) / 2) / 2 : (x1 + x2) / 2;
    const ly = bend ? (my + (y1 + y2) / 2) / 2 : (y1 + y2) / 2;
    return { d, lx, ly, x1, y1, x2, y2 };
  };

  return (
    <StepFrame
      title={def.title}
      total={total}
      stepper={stepper}
      caption={cur ? { heading: cur.title, note: cur.note } : { heading: "How it works", note: def.intro ?? "Press Next to build the picture one step at a time. Read the note under it each time." }}
    >
      <svg role="img" aria-label={def.title} viewBox={`0 0 ${FLOW.W} ${g.H}`} className="block h-auto w-full min-w-[600px] font-sans">
        <defs>
          <marker id={`${uid}-a`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 10 5 0 10z" fill="var(--color-ink-dim)" />
          </marker>
          <marker id={`${uid}-h`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M0 0 10 5 0 10z" fill="var(--color-sky)" />
          </marker>
        </defs>

        {def.edges.map((e) => {
          if (!visible(e.id)) return null;
          const hot = focus.has(e.id);
          const fresh = justAppeared.has(e.id) && !reduce;
          const { d, lx, ly } = edgeGeom(e);
          const dim = cur && !hot;
          return (
            <g key={`${e.id}-${fresh ? step : "s"}`} data-edge={e.id} opacity={dim ? 0.5 : 1}>
              <path
                d={d}
                fill="none"
                stroke={hot ? "var(--color-sky)" : "var(--color-ink-dim)"}
                strokeWidth={hot ? 3 : 1.8}
                strokeOpacity={hot ? 1 : 0.7}
                strokeDasharray={e.dashed ? "6 5" : hot && !reduce ? "8 6" : undefined}
                markerEnd={`url(#${uid}-${hot ? "h" : "a"})`}
                markerStart={e.both ? `url(#${uid}-${hot ? "h" : "a"})` : undefined}
              >
                {hot && !reduce && !e.dashed ? <animate attributeName="stroke-dashoffset" from="28" to="0" dur="0.9s" repeatCount="indefinite" /> : null}
                {fresh ? <animate attributeName="opacity" from="0" to="1" dur="0.45s" fill="freeze" /> : null}
              </path>
              {e.label ? (
                <text
                  data-edge-label={e.id}
                  x={lx}
                  y={ly - 6}
                  textAnchor="middle"
                  fontSize="11.5"
                  fontFamily="var(--font-mono)"
                  fill={hot ? "var(--color-sky)" : "var(--color-ink-dim)"}
                  fontWeight={hot ? 700 : 400}
                  stroke="var(--color-bg-elev)"
                  strokeWidth="4"
                  paintOrder="stroke"
                >
                  {e.label}
                </text>
              ) : null}
            </g>
          );
        })}

        {def.nodes.map((n: FlowNode) => {
          if (!visible(n.id)) return null;
          const b = boxes.get(n.id)!;
          const col = TONE[n.tone ?? "plain"];
          const hot = focus.has(n.id);
          const fresh = justAppeared.has(n.id) && !reduce;
          const lines = wrap(n.label, labelChars(b.w));
          const subText = subs.get(n.id);
          const sub = subText ? wrap(subText, subChars(b.w)) : [];
          const textH = lines.length * 16 + sub.length * 14;
          const y = b.y + (b.h - textH) / 2 + 12;
          return (
            <g key={`${n.id}-${fresh ? step : "s"}`} data-node={n.id} style={hot ? { filter: `drop-shadow(0 0 9px ${col})` } : undefined}>
              <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="12" fill="var(--color-bg-code)" stroke={col} strokeWidth={hot ? 3.5 : 2} strokeOpacity={hot ? 1 : cur ? 0.55 : 0.8} />
              {hot ? <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="12" fill={col} fillOpacity="0.14" /> : null}
              <text data-fit={n.id} x={b.x + b.w / 2} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--color-ink)">
                {lines.map((l, i) => {
                  const ty = y + i * 16;
                  return (
                    <tspan key={i} x={b.x + b.w / 2} y={ty}>
                      {l}
                    </tspan>
                  );
                })}
                {sub.map((l, i) => (
                  <tspan key={`s${i}`} x={b.x + b.w / 2} y={y + lines.length * 16 + i * 14 - 1} fontSize="11" fontWeight="400" fill="var(--color-ink-dim)" fontFamily="var(--font-mono)">
                    {l}
                  </tspan>
                ))}
              </text>
              {fresh ? <animate attributeName="opacity" from="0" to="1" dur="0.45s" fill="freeze" /> : null}
            </g>
          );
        })}
      </svg>
    </StepFrame>
  );
}
