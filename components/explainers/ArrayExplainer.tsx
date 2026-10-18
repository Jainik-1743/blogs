"use client";

import type { ArrayDef, At } from "@/lib/explain/types";
import { gridOf } from "@/lib/explain/validate";
import StepFrame, { useStepper } from "./StepControls";

const W = 720;
const norm = (a: At): [number, number] => (typeof a === "number" ? [0, a] : a);
const keyOf = (a: At) => norm(a).join(",");

/** A row or grid of values with pointers: sorting, searching, tables, stacks and queues, one step at a time. */
export default function ArrayExplainer({ def }: { def: ArrayDef }) {
  const total = def.steps.length;
  const stepper = useStepper(total);
  const { step, reduce } = stepper;

  // Contents carry forward: each step's `cells` replaces the previous contents.
  let cells = gridOf(def.cells);
  for (let i = 0; i < step; i++) if (def.steps[i].cells) cells = gridOf(def.steps[i].cells!);
  const cur = step > 0 ? def.steps[step - 1] : null;
  const R = cells.length;
  const C = cells[0].length;
  const grid = R > 1;
  const cellW = Math.min(64, 690 / C);
  const cellH = 44;
  const left = (W - cellW * C) / 2;
  const topPad = 46;
  const H = topPad + R * (cellH + 6) + 36;

  const mark = new Set((cur?.mark ?? []).map(keyOf));
  const done = new Set((cur?.done ?? []).map(keyOf));
  const dim = new Set((cur?.dim ?? []).map(keyOf));
  const ptrs = new Map<string, string[]>();
  for (const p of cur?.pointers ?? []) {
    const k = keyOf(p.at);
    ptrs.set(k, [...(ptrs.get(k) ?? []), p.label]);
  }

  return (
    <StepFrame
      title={def.title}
      total={total}
      stepper={stepper}
      caption={cur ? { heading: cur.title, note: cur.note } : { heading: "The starting picture", note: def.intro ?? "Press Next to go one step at a time. Watch which cells light up and read the note under the picture." }}
    >
      <svg role="img" aria-label={def.title} viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full min-w-[560px] font-sans">
        {cells.map((row, r) =>
          row.map((v, c) => {
            const k = `${r},${c}`;
            const x = left + c * cellW;
            const y = topPad + r * (cellH + 6);
            const hot = mark.has(k);
            const ok = done.has(k);
            const faded = dim.has(k);
            const col = ok ? "var(--xp-server)" : hot ? "var(--color-sky)" : "var(--color-line)";
            const text = String(v);
            const fs = Math.min(16, Math.max(10, (cellW * 0.9) / Math.max(1, text.length * 0.62)));
            const labels = ptrs.get(k);
            return (
              <g key={k} data-cell={k} opacity={faded ? 0.35 : 1} style={hot ? { filter: "drop-shadow(0 0 8px var(--color-sky))" } : undefined}>
                <rect x={x + 2} y={y} width={cellW - 4} height={cellH} rx="8" fill={hot || ok ? col : "var(--color-bg-code)"} fillOpacity={hot || ok ? 0.16 : 1} stroke={col} strokeWidth={hot || ok ? 3 : 2} />
                <text data-fit={k} x={x + cellW / 2} y={y + cellH / 2 + fs * 0.36} textAnchor="middle" fontSize={fs} fontWeight="700" fontFamily="var(--font-mono)" fill="var(--color-ink)">
                  {text}
                  {!reduce && cur?.cells ? <animate attributeName="opacity" from="0.2" to="1" dur="0.35s" fill="freeze" /> : null}
                </text>
                {r === R - 1 ? (
                  <text x={x + cellW / 2} y={y + cellH + 16} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="var(--color-ink-dim)">
                    {def.indexLabels?.[c] ?? c}
                  </text>
                ) : null}
                {labels
                  ? labels.map((l, i) =>
                      grid ? (
                        <text key={l} x={x + 8} y={y + 12 + i * 11} fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--color-sky)">
                          {l}
                        </text>
                      ) : (
                        <g key={l}>
                          <text data-pointer={l} x={x + cellW / 2} y={y - 12 - i * 14} textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--color-sky)">
                            {l}
                          </text>
                          {i === 0 ? <path d={`M${x + cellW / 2 - 5} ${y - 8} h10 l-5 6z`} fill="var(--color-sky)" /> : null}
                        </g>
                      ),
                    )
                  : null}
              </g>
            );
          }),
        )}
      </svg>
    </StepFrame>
  );
}
