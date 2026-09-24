"use client";

import { useState } from "react";
import { Readout, Shell, Slider, bytes, fmt } from "./ui";

const LOG = (min: number, max: number, t: number) => Math.round(Math.pow(10, min + (max - min) * t));

/** A back-of-the-envelope calculator: users and habits in, QPS, storage, bandwidth and servers out. */
export default function Estimator({ caption }: { caption: string }) {
  const [dauT, setDauT] = useState(0.6);
  const [reads, setReads] = useState(20);
  const [ratio, setRatio] = useState(10);
  const [size, setSize] = useState(2);
  const [years, setYears] = useState(5);
  const [perServer, setPerServer] = useState(1000);

  const dau = LOG(4, 9, dauT);
  const writes = reads / ratio;
  const readQps = (dau * reads) / 86400;
  const writeQps = (dau * writes) / 86400;
  const peak = (readQps + writeQps) * 3;
  const storage = dau * writes * size * 1000 * 365 * years * 3;
  const bandwidth = readQps * size * 1000 * 8;
  const servers = Math.max(1, Math.ceil((peak / perServer) * 1.3));
  const cache = dau * reads * size * 1000 * 0.2;

  return (
    <Shell caption={caption}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider
          label="Daily active users"
          value={dauT}
          min={0}
          max={1}
          step={0.01}
          onChange={setDauT}
          format={() => fmt(dau, 0)}
        />
        <Slider label="Reads per user per day" value={reads} min={1} max={200} onChange={setReads} />
        <Slider
          label="Read : write ratio"
          value={ratio}
          min={1}
          max={100}
          onChange={setRatio}
          format={(v) => `${v} : 1`}
        />
        <Slider
          label="Size of one item"
          value={size}
          min={0.1}
          max={500}
          step={0.1}
          onChange={setSize}
          format={(v) => `${v} KB`}
        />
        <Slider label="Keep data for" value={years} min={1} max={10} onChange={setYears} format={(v) => `${v} yr`} />
        <Slider
          label="Requests one server handles"
          value={perServer}
          min={100}
          max={10000}
          step={100}
          onChange={setPerServer}
          format={(v) => `${fmt(v, 0)}/s`}
        />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Readout label="read QPS (avg)" value={fmt(readQps)} sub="DAU × reads ÷ 86,400" />
        <Readout label="write QPS (avg)" value={fmt(writeQps)} />
        <Readout label="peak QPS (×3)" value={fmt(peak)} tone="warn" />
        <Readout label={`storage, ${years} yr × 3 copies`} value={bytes(storage)} />
        <Readout label="read bandwidth" value={`${fmt(bandwidth / 1e6)} Mbps`} />
        <Readout label="app servers" value={servers} sub="peak ÷ per-server, +30% headroom" tone="good" />
      </div>
      <p className="mb-0 mt-3 text-[0.8rem] text-ink-dim">
        Cache the hottest 20% of a day&apos;s reads: about{" "}
        <strong className="font-mono text-sky-strong">{bytes(cache)}</strong> of RAM. Round every number — the goal is
        the right order of magnitude, not the exact figure.
      </p>
    </Shell>
  );
}
