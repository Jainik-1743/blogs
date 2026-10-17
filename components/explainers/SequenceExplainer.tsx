"use client";

import { useId } from "react";
import type { SeqDef } from "@/lib/explainers";
import StepFrame, { useStepper } from "./StepControls";

const W = 720;
const MARGIN = 92;
const TOP = 10;
const BOX_H = 50;
const FIRST_ROW = 104;
const ROW = 46;

const COLORS = { req: "var(--color-sky)", res: "var(--color-emerald-300)", self: "var(--color-amber-300)" } as const;
type Kind = keyof typeof COLORS;

/**
 * Draws a "who sends what to whom" diagram, one arrow per step. Pressing Next adds an arrow, and the
 * newest one is animated: the line grows and a small packet travels along it. Older arrows stay,
 * dimmed, so the whole conversation builds up on the page.
 */
export default function SequenceExplainer({ def }: { def: SeqDef }) {
  const total = def.steps.length;
  const stepper = useStepper(total);
  const { step, reduce } = stepper;
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  const n = def.actors.length;
  const xs = def.actors.map((_, i) => MARGIN + (i * (W - 2 * MARGIN)) / Math.max(1, n - 1));
  const H = FIRST_ROW + total * ROW + 8;
  const rowY = (k: number) => FIRST_ROW + k * ROW;
  const kindOf = (s: (typeof def.steps)[number]): Kind => (s.self ? "self" : s.to < s.from ? "res" : "req");

  const current = step > 0 ? def.steps[step - 1] : null;

  return (
    <StepFrame
      title={def.title}
      total={total}
      stepper={stepper}
      caption={current ? { heading: current.title, note: current.note } : { heading: "How it works", note: "Each press of Next adds one message. Watch who talks to whom, and read the note under the picture." }}
    >
      <svg role="img" aria-label={def.title} viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full min-w-[600px] font-sans">
        <defs>
          {(Object.keys(COLORS) as Kind[]).map((k) => (
            <marker key={k} id={`${uid}-${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
              <path d="M0 0 10 5 0 10z" fill={COLORS[k]} />
            </marker>
          ))}
        </defs>

        {/* Lifelines and actors */}
        {def.actors.map((a, i) => (
          <g key={a.name}>
            <line x1={xs[i]} x2={xs[i]} y1={TOP + BOX_H} y2={H - 4} stroke="var(--color-line)" strokeWidth="2" strokeDasharray="4 5" />
            <rect x={xs[i] - 60} y={TOP} width="120" height={BOX_H} rx="10" fill="var(--color-bg-code)" stroke="var(--color-line)" strokeWidth="2" />
            <text x={xs[i]} y={TOP + (a.sub ? 22 : 30)} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--color-ink)">
              {a.name}
            </text>
            {a.sub ? (
              <text x={xs[i]} y={TOP + 39} textAnchor="middle" fontSize="11" fill="var(--color-ink-dim)">
                {a.sub}
              </text>
            ) : null}
          </g>
        ))}

        {/* Messages drawn so far */}
        {def.steps.slice(0, step).map((s, k) => {
          const active = k === step - 1;
          const kind = kindOf(s);
          const col = COLORS[kind];
          const y = rowY(k);
          const x1 = xs[s.from];
          const x2 = xs[s.to];
          const animate = active && !reduce;
          const opacity = active ? 1 : 0.55;

          if (s.self) {
            const d = `M${x1} ${y - 6} C${x1 + 50} ${y - 20} ${x1 + 50} ${y + 18} ${x1 + 2} ${y + 10}`;
            return (
              <g key={`${k}-${active ? "a" : "p"}`} opacity={opacity}>
                <path d={d} fill="none" stroke={col} strokeWidth="2.5" markerEnd={`url(#${uid}-${kind})`} />
                {animate ? <animate attributeName="opacity" from="0" to="1" dur="0.4s" fill="freeze" /> : null}
                <text x={x1 + 62} y={y + 5} fontSize="12.5" fill="var(--color-ink)" fontFamily="var(--font-mono)">
                  {s.label}
                </text>
              </g>
            );
          }

          const mid = (x1 + x2) / 2;
          return (
            <g key={`${k}-${active ? "a" : "p"}`} opacity={opacity}>
              <line x1={x1} y1={y} x2={animate ? x1 : x2} y2={y} stroke={col} strokeWidth="2.5" markerEnd={`url(#${uid}-${kind})`}>
                {animate ? <animate attributeName="x2" from={x1} to={x2} dur="0.7s" fill="freeze" /> : null}
              </line>
              {animate ? (
                <circle cy={y} r="5.5" fill={col} cx={x1}>
                  <animate attributeName="cx" from={x1} to={x2} dur="0.7s" fill="freeze" />
                  <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.85;1" dur="0.8s" fill="freeze" />
                </circle>
              ) : null}
              <text
                x={mid}
                y={y - 9}
                textAnchor="middle"
                fontSize="12.5"
                fill="var(--color-ink)"
                fontFamily="var(--font-mono)"
                stroke="var(--color-bg-elev)"
                strokeWidth="4"
                paintOrder="stroke"
                opacity={animate ? 0 : 1}
              >
                {s.label}
                {animate ? <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.35s" fill="freeze" /> : null}
              </text>
            </g>
          );
        })}
      </svg>
    </StepFrame>
  );
}
