"use client";

import { useState } from "react";
import { Readout, Shell, Slider, Tabs, btn } from "./ui";

const LEVELS = [90, 99, 99.5, 99.9, 99.95, 99.99, 99.999];

function downtime(pct: number, seconds: number) {
  const s = (1 - pct / 100) * seconds;
  if (s >= 86400) return `${(s / 86400).toFixed(1)} days`;
  if (s >= 3600) return `${(s / 3600).toFixed(1)} h`;
  if (s >= 60) return `${(s / 60).toFixed(1)} min`;
  return `${s.toFixed(1)} s`;
}

/** Pick a number of nines and see the downtime it allows; then chain or duplicate components. */
export default function Nines({ caption }: { caption: string }) {
  const [mode, setMode] = useState<"budget" | "combine">("budget");
  const [level, setLevel] = useState(3);
  const [a, setA] = useState(99.9);
  const [count, setCount] = useState(3);
  const pct = LEVELS[level];

  const serial = Math.pow(a / 100, count) * 100;
  const parallel = (1 - Math.pow(1 - a / 100, count)) * 100;

  return (
    <Shell caption={caption}>
      <Tabs
        value={mode}
        onChange={setMode}
        options={[
          { id: "budget", label: "Downtime budget" },
          { id: "combine", label: "Series vs parallel" },
        ]}
      />
      {mode === "budget" ? (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {LEVELS.map((l, i) => (
              <button
                key={l}
                type="button"
                className={`${btn} ${i === level ? "border-sky bg-sky-soft text-sky" : ""}`}
                onClick={() => setLevel(i)}
              >
                {l}%
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Readout label="per year" value={downtime(pct, 365 * 86400)} />
            <Readout label="per month" value={downtime(pct, 30 * 86400)} />
            <Readout label="per week" value={downtime(pct, 7 * 86400)} />
            <Readout label="per day" value={downtime(pct, 86400)} />
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-emerald-400/20" aria-hidden="true">
            <div className="h-full bg-red-400" style={{ width: `${Math.max((100 - pct) * 10, 0.4)}%` }} />
          </div>
          <p className="mb-0 mt-2 text-[0.8rem] text-ink-dim">
            Red bar = allowed downtime, drawn 10× larger than life. Each extra nine cuts it by ten — and usually costs
            far more than ten times as much to achieve.
          </p>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Slider
              label="Availability of one component"
              value={a}
              min={95}
              max={99.99}
              step={0.01}
              onChange={setA}
              format={(v) => `${v.toFixed(2)}%`}
            />
            <Slider label="How many components" value={count} min={1} max={8} onChange={setCount} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-red-400/30 bg-red-400/5 p-3">
              <div className="mb-2 flex items-center gap-1 overflow-x-auto" aria-hidden="true">
                {Array.from({ length: count }, (_, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 ? <span className="text-sky">→</span> : null}
                    <span className="rounded border border-line bg-bg-code px-1.5 font-mono text-[0.7rem]">
                      C{i + 1}
                    </span>
                  </span>
                ))}
              </div>
              <Readout
                label="in series (all must work)"
                value={`${serial.toFixed(3)}%`}
                sub={`≈ ${downtime(serial, 365 * 86400)} down / year`}
                tone="bad"
              />
            </div>
            <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/5 p-3">
              <div className="mb-2 flex flex-wrap gap-1" aria-hidden="true">
                {Array.from({ length: count }, (_, i) => (
                  <span key={i} className="rounded border border-line bg-bg-code px-1.5 font-mono text-[0.7rem]">
                    C{i + 1}
                  </span>
                ))}
              </div>
              <Readout
                label="in parallel (any one works)"
                value={`${Math.min(parallel, 99.9999999).toFixed(count > 2 ? 7 : 4)}%`}
                sub={`≈ ${downtime(parallel, 365 * 86400)} down / year`}
                tone="good"
              />
            </div>
          </div>
          <p className="mb-0 mt-3 text-[0.8rem] text-ink-dim">
            Chaining dependencies multiplies availabilities, so every hop makes things worse. Redundant copies multiply
            the <em>failure</em> chances instead, so every copy makes things better — as long as failures are
            independent.
          </p>
        </>
      )}
    </Shell>
  );
}
