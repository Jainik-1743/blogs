"use client";

import { useMemo, useState } from "react";
import { Readout, Shell, Slider, Tabs, btn, hash } from "./ui";

const KEYS = Array.from({ length: 48 }, (_, i) => `user:${1000 + i * 37}`);
const NAMES = ["A", "B", "C", "D", "E", "F", "G", "H"];
const COLORS = ["#fb923c", "#38bdf8", "#34d399", "#f472b6", "#a78bfa", "#facc15", "#f87171", "#2dd4bf"];
const MAX = 2 ** 32;

function ringOwner(k: number, points: { pos: number; node: number }[]) {
  for (const p of points) if (p.pos >= k) return p.node;
  return points[0].node;
}

/**
 * Consistent hashing on a ring versus plain `hash % N`. Add or remove a server and count
 * how many of the 48 keys have to move.
 */
export default function HashRing({ caption }: { caption: string }) {
  const [mode, setMode] = useState<"ring" | "mod">("ring");
  const [nodes, setNodes] = useState(4);
  const [prev, setPrev] = useState(4);
  const [vnodes, setVnodes] = useState(1);

  const place = (count: number) =>
    Array.from({ length: count }, (_, n) =>
      Array.from({ length: vnodes }, (_, v) => ({ pos: hash(`server-${NAMES[n]}#${v}`), node: n })),
    )
      .flat()
      .sort((a, b) => a.pos - b.pos);

  const { owners, before, points } = useMemo(() => {
    const pts = place(nodes);
    const old = place(prev);
    const own = (count: number, p: typeof pts) =>
      KEYS.map((k) => (mode === "ring" ? ringOwner(hash(k), p) : hash(k) % count));
    return { owners: own(nodes, pts), before: own(prev, old), points: pts };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, prev, vnodes, mode]);

  const moved = owners.filter((o, i) => o !== before[i]).length;
  const load = Array.from({ length: nodes }, (_, n) => owners.filter((o) => o === n).length);
  const change = (d: number) => {
    setPrev(nodes);
    setNodes((v) => Math.min(8, Math.max(2, v + d)));
  };

  const R = 110;
  const at = (pos: number, r = R) => {
    const a = (pos / MAX) * Math.PI * 2 - Math.PI / 2;
    return [140 + r * Math.cos(a), 140 + r * Math.sin(a)];
  };

  return (
    <Shell caption={caption}>
      <Tabs
        value={mode}
        onChange={(m) => {
          setMode(m);
          setPrev(nodes);
        }}
        options={[
          { id: "ring", label: "Consistent hashing" },
          { id: "mod", label: "hash(key) % N" },
        ]}
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button type="button" className={btn} onClick={() => change(-1)} disabled={nodes <= 2}>
          − Remove server
        </button>
        <button type="button" className={btn} onClick={() => change(1)} disabled={nodes >= 8}>
          + Add server
        </button>
        <span className="font-mono text-[0.75rem] text-ink-dim">
          {prev} → {nodes} servers
        </span>
      </div>
      <div className="grid items-center gap-4 sm:grid-cols-[280px_1fr]">
        {mode === "ring" ? (
          <svg viewBox="0 0 280 280" className="mx-auto w-full max-w-[280px]" role="img" aria-label="Hash ring">
            <circle cx="140" cy="140" r={R} fill="none" stroke="var(--color-line)" strokeWidth="10" />
            {KEYS.map((k, i) => {
              const [x, y] = at(hash(k), R - 22);
              const movedKey = owners[i] !== before[i];
              return (
                <circle
                  key={k}
                  cx={x}
                  cy={y}
                  r={movedKey ? 5 : 3.5}
                  fill={COLORS[owners[i]]}
                  stroke={movedKey ? "#fff" : "none"}
                  strokeWidth="1.5"
                  opacity={0.9}
                />
              );
            })}
            {points.map((p, i) => {
              const [x, y] = at(p.pos);
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="9" fill={COLORS[p.node]} stroke="var(--color-bg-elev)" strokeWidth="2" />
                  <text x={x} y={y + 3.5} textAnchor="middle" fontSize="9" fontWeight="700" fill="#0b1120">
                    {NAMES[p.node]}
                  </text>
                </g>
              );
            })}
            <text x="140" y="136" textAnchor="middle" fontSize="11" fill="var(--color-ink-dim)">
              keys walk
            </text>
            <text x="140" y="150" textAnchor="middle" fontSize="11" fill="var(--color-ink-dim)">
              clockwise ↻
            </text>
          </svg>
        ) : (
          <div className="grid grid-cols-8 gap-1" aria-label="Key placement">
            {KEYS.map((k, i) => (
              <div
                key={k}
                className={`h-6 rounded ${owners[i] !== before[i] ? "ring-2 ring-white" : ""}`}
                style={{ background: COLORS[owners[i]] }}
                title={`${k} → ${NAMES[owners[i]]}`}
              />
            ))}
          </div>
        )}
        <div>
          <div className="grid grid-cols-2 gap-3">
            <Readout
              label="keys that moved"
              value={`${moved} / ${KEYS.length}`}
              sub={`${Math.round((moved / KEYS.length) * 100)}% of the data reshuffled`}
              tone={moved > KEYS.length / 3 ? "bad" : "good"}
            />
            <Readout
              label="ideal"
              value={`~${Math.round((Math.abs(nodes - prev) / Math.max(nodes, prev)) * KEYS.length)} keys`}
              sub="only the new/removed server's share"
            />
          </div>
          <div className="mt-3 space-y-1">
            {load.map((l, n) => (
              <div key={n} className="flex items-center gap-2 font-mono text-[0.72rem]">
                <span className="w-4" style={{ color: COLORS[n] }}>
                  {NAMES[n]}
                </span>
                <div className="h-2.5 flex-1 rounded bg-bg-code">
                  <div
                    className="h-full rounded"
                    style={{ width: `${(l / KEYS.length) * 100 * 2.5}%`, background: COLORS[n], maxWidth: "100%" }}
                  />
                </div>
                <span className="w-6 text-right text-ink-dim">{l}</span>
              </div>
            ))}
          </div>
          {mode === "ring" ? (
            <div className="mt-3">
              <Slider
                label="Virtual nodes per server"
                value={vnodes}
                min={1}
                max={20}
                onChange={(v) => {
                  setVnodes(v);
                  setPrev(nodes);
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
      <p className="mb-0 mt-3 text-[0.8rem] text-ink-dim">
        White-ringed keys moved in the last change. With % N almost every key moves; on the ring only the keys next to
        the changed server do. Virtual nodes even out the load bars.
      </p>
    </Shell>
  );
}
