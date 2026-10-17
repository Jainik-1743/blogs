"use client";

import { useId } from "react";
import { BREAKER_STEPS, type BreakerCall, type BreakerState } from "@/lib/explainers";
import StepFrame, { useStepper } from "./StepControls";

const W = 720;
const H = 350;

const NODES: Record<BreakerState, { x: number; y: number; label: string; sub: string; color: string }> = {
  closed: { x: 135, y: 105, label: "Closed", sub: "calls go through", color: "var(--color-emerald-300)" },
  open: { x: 585, y: 105, label: "Open", sub: "calls fail fast", color: "var(--color-red-300)" },
  half: { x: 360, y: 240, label: "Half-open", sub: "one trial call", color: "var(--color-amber-300)" },
};

type Edge = { from: BreakerState; to: BreakerState; d: string; label: string; lx: number; ly: number; anchor: "start" | "middle" | "end" };

const EDGES: Edge[] = [
  { from: "closed", to: "open", d: "M215 105 H505", label: "too many failures", lx: 360, ly: 93, anchor: "middle" },
  { from: "open", to: "half", d: "M555 140 L420 208", label: "wait time is over", lx: 478, ly: 192, anchor: "start" },
  { from: "half", to: "closed", d: "M300 208 L165 140", label: "trial call succeeds", lx: 246, ly: 196, anchor: "end" },
  { from: "half", to: "open", d: "M432 246 Q620 262 600 142", label: "trial call fails", lx: 618, ly: 212, anchor: "start" },
];

const CALL: Record<BreakerCall, { glyph: string; color: string }> = {
  ok: { glyph: "✓", color: "var(--color-emerald-300)" },
  fail: { glyph: "✗", color: "var(--color-red-300)" },
  fast: { glyph: "»", color: "var(--color-amber-300)" },
};

/** A circuit breaker as three states and four arrows. Each step moves the glow and adds calls to the strip below. */
export default function BreakerExplainer() {
  const total = BREAKER_STEPS.length;
  const stepper = useStepper(total);
  const { step, reduce } = stepper;
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const cur = step > 0 ? BREAKER_STEPS[step - 1] : null;
  const active = cur?.state;

  return (
    <StepFrame
      title="A circuit breaker opening and closing"
      total={total}
      stepper={stepper}
      caption={cur ? { heading: cur.title, note: cur.note } : { heading: "How it works", note: "A circuit breaker sits in front of a risky call. Press Next to watch it protect your service when the dependency starts to fail." }}
    >
      <svg role="img" aria-label="A circuit breaker with three states: closed, open and half-open" viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full min-w-[600px] font-sans">
        <defs>
          <marker id={`${uid}-a`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M0 0 10 5 0 10z" fill="var(--color-ink-dim)" />
          </marker>
          <marker id={`${uid}-h`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M0 0 10 5 0 10z" fill="var(--color-sky)" />
          </marker>
        </defs>

        {EDGES.map((e) => {
          const hot = cur?.moved?.[0] === e.from && cur.moved[1] === e.to;
          return (
            <g key={`${e.from}-${e.to}`}>
              <path
                d={e.d}
                fill="none"
                stroke={hot ? "var(--color-sky)" : "var(--color-ink-dim)"}
                strokeWidth={hot ? 3.5 : 2}
                strokeOpacity={hot ? 1 : 0.55}
                strokeDasharray={hot && !reduce ? "8 6" : undefined}
                markerEnd={`url(#${uid}-${hot ? "h" : "a"})`}
              >
                {hot && !reduce ? <animate attributeName="stroke-dashoffset" from="28" to="0" dur="0.8s" repeatCount="indefinite" /> : null}
              </path>
              <text x={e.lx} y={e.ly} textAnchor={e.anchor} fontSize="12" fill={hot ? "var(--color-sky)" : "var(--color-ink-dim)"} fontWeight={hot ? 700 : 400}>
                {e.label}
              </text>
            </g>
          );
        })}

        {(Object.keys(NODES) as BreakerState[]).map((s) => {
          const n = NODES[s];
          const on = active === s;
          return (
            <g key={s} style={on ? { filter: `drop-shadow(0 0 10px ${n.color})` } : undefined}>
              <rect x={n.x - 80} y={n.y - 34} width="160" height="68" rx="14" fill="var(--color-bg-code)" stroke={n.color} strokeWidth={on ? 4 : 2} strokeOpacity={on ? 1 : 0.45} />
              {on ? <rect x={n.x - 80} y={n.y - 34} width="160" height="68" rx="14" fill={n.color} fillOpacity="0.14" /> : null}
              <text x={n.x} y={n.y - 4} textAnchor="middle" fontSize="18" fontWeight="700" fill={n.color} opacity={on || !cur ? 1 : 0.75}>
                {n.label}
              </text>
              <text x={n.x} y={n.y + 18} textAnchor="middle" fontSize="12" fill="var(--color-ink-dim)">
                {n.sub}
              </text>
            </g>
          );
        })}

        {/* Recent calls */}
        <text x="24" y="318" fontSize="12" fill="var(--color-ink-dim)">
          Recent calls
        </text>
        {cur
          ? cur.calls.map((c, i) => (
              <g key={`${step}-${i}`}>
                <rect x={112 + i * 38} y="300" width="30" height="26" rx="6" fill="var(--color-bg-code)" stroke={CALL[c].color} strokeWidth="2" />
                <text x={112 + i * 38 + 15} y="319" textAnchor="middle" fontSize="15" fontWeight="700" fill={CALL[c].color}>
                  {CALL[c].glyph}
                </text>
                {!reduce ? <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin={`${i * 0.07}s`} fill="freeze" /> : null}
              </g>
            ))
          : null}
        <text x={W - 20} y="318" textAnchor="end" fontSize="12" fill="var(--color-ink-dim)">
          {cur ? `Failures counted: ${cur.failures}` : "✓ ok   ✗ failed   » rejected at once"}
        </text>
      </svg>
    </StepFrame>
  );
}
