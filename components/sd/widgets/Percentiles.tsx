"use client";

import { useMemo, useState } from "react";
import { Readout, Shell, Slider, rng } from "./ui";

const N = 400;

/** Latency histogram with avg / p50 / p95 / p99 markers, a slow-tail knob and a fan-out calculator. */
export default function Percentiles({ caption }: { caption: string }) {
  const [tail, setTail] = useState(3);
  const [fanout, setFanout] = useState(10);

  const samples = useMemo(() => {
    const r = rng(7);
    return Array.from({ length: N }, () => {
      const base = 40 + 60 * Math.pow(r(), 2) + 20 * r();
      return r() * 100 < tail ? 300 + 900 * r() : base;
    }).sort((a, b) => a - b);
  }, [tail]);

  const p = (q: number) => samples[Math.min(N - 1, Math.floor((q / 100) * N))];
  const avg = samples.reduce((s, v) => s + v, 0) / N;
  const max = 1200;
  const buckets = 40;
  const hist = Array.from({ length: buckets }, () => 0);
  for (const s of samples) hist[Math.min(buckets - 1, Math.floor((s / max) * buckets))]++;
  const top = Math.max(...hist);
  const markers = [
    { label: "p50", v: p(50) },
    { label: "avg", v: avg },
    { label: "p95", v: p(95) },
    { label: "p99", v: p(99) },
  ];
  const hitSlow = (1 - Math.pow(0.99, fanout)) * 100;

  return (
    <Shell caption={caption}>
      <Slider
        label="Share of requests that hit a slow path (GC pause, cache miss, cold disk)"
        value={tail}
        min={0}
        max={15}
        onChange={setTail}
        format={(v) => `${v}%`}
      />
      <div className="relative mt-5 h-36 border-b border-l border-line" aria-hidden="true">
        <div className="absolute inset-0 flex items-end gap-px">
          {hist.map((h, i) => (
            <div key={i} className="flex-1 rounded-t-sm bg-sky/60" style={{ height: `${(h / top) * 100}%` }} />
          ))}
        </div>
        {markers.map((m) => (
          <div
            key={m.label}
            className="absolute bottom-0 top-0 border-l-2 border-dashed border-amber-300/80"
            style={{ left: `${Math.min((m.v / max) * 100, 99)}%` }}
          >
            <span className="absolute -top-5 -translate-x-1/2 font-mono text-[0.65rem] text-amber-200">{m.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between font-mono text-[0.65rem] text-ink-dim">
        <span>0 ms</span>
        <span>600 ms</span>
        <span>1200 ms</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Readout label="p50 (median)" value={`${p(50).toFixed(0)} ms`} tone="good" />
        <Readout label="average" value={`${avg.toFixed(0)} ms`} sub="hides the tail" />
        <Readout label="p95" value={`${p(95).toFixed(0)} ms`} tone="warn" />
        <Readout label="p99" value={`${p(99).toFixed(0)} ms`} tone="bad" />
      </div>
      <div className="mt-5 rounded-lg border border-line bg-bg-code p-3">
        <Slider
          label="A page calls this many backend services in parallel"
          value={fanout}
          min={1}
          max={100}
          onChange={setFanout}
        />
        <p className="mb-0 mt-2 text-[0.88rem]">
          Chance the page waits on at least one p99-slow call:{" "}
          <strong className="font-mono text-red-300">{hitSlow.toFixed(0)}%</strong>. With fan-out, the p99 of each part
          becomes the typical experience of the whole.
        </p>
      </div>
    </Shell>
  );
}
