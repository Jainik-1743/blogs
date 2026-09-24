"use client";

import { useMemo, useState } from "react";
import { Readout, Shell, Tabs, rng } from "./ui";

type Strategy = "fixed" | "exp" | "jitter";
const CLIENTS = 40;
const ATTEMPTS = 5;
const BASE = 100;
const SPAN = 3200;
const SLOTS = 64;

/**
 * 40 clients all fail at the same instant and retry 5 times. Compare immediate fixed retries,
 * exponential backoff, and exponential backoff with full jitter by the load spikes they create.
 */
export default function Backoff({ caption }: { caption: string }) {
  const [s, setS] = useState<Strategy>("jitter");

  const retries = useMemo(() => {
    const r = rng(11);
    const out: { client: number; t: number; attempt: number }[] = [];
    for (let c = 0; c < CLIENTS; c++) {
      let t = 0;
      for (let a = 0; a < ATTEMPTS; a++) {
        const cap = BASE * 2 ** a;
        const wait = s === "fixed" ? 200 : s === "exp" ? cap : r() * cap * 2;
        t += wait;
        out.push({ client: c, t, attempt: a });
      }
    }
    return out;
  }, [s]);

  const slots = Array.from({ length: SLOTS }, () => 0);
  for (const r of retries) if (r.t < SPAN) slots[Math.floor((r.t / SPAN) * SLOTS)]++;
  const peak = Math.max(...slots);

  return (
    <Shell caption={caption}>
      <Tabs
        value={s}
        onChange={setS}
        options={[
          { id: "fixed", label: "Retry every 200 ms" },
          { id: "exp", label: "Exponential" },
          { id: "jitter", label: "Exponential + jitter" },
        ]}
      />
      <div className="relative h-36 border-b border-l border-line" aria-label="Retries hitting the server over time">
        <div className="absolute inset-0 flex items-end gap-px">
          {slots.map((v, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t-sm ${v >= 20 ? "bg-red-400" : v >= 8 ? "bg-amber-400/80" : "bg-sky/70"}`}
              style={{ height: `${(v / CLIENTS) * 100}%` }}
            />
          ))}
        </div>
        <div className="absolute left-0 right-0 border-t border-dashed border-red-400/50" style={{ bottom: "50%" }}>
          <span className="absolute right-0 -top-4 font-mono text-[0.6rem] text-red-300">server capacity</span>
        </div>
      </div>
      <div className="mt-1 flex justify-between font-mono text-[0.65rem] text-ink-dim">
        <span>failure at 0 ms</span>
        <span>{SPAN / 2} ms</span>
        <span>{SPAN} ms</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Readout
          label="worst spike"
          value={`${peak} retries`}
          sub={`in one ${SPAN / SLOTS} ms slot`}
          tone={peak >= 20 ? "bad" : peak >= 8 ? "warn" : "good"}
        />
        <Readout label="clients" value={CLIENTS} sub={`${ATTEMPTS} attempts each`} />
        <Readout
          label="wait before try n"
          value={s === "fixed" ? "200 ms" : s === "exp" ? "100·2ⁿ ms" : "rand(0, 100·2ⁿ⁺¹)"}
        />
      </div>
      <p className="mb-0 mt-3 text-[0.8rem] text-ink-dim">
        {s === "fixed"
          ? "Everyone retries in lock-step: tall red spikes that knock a recovering server straight back down."
          : s === "exp"
            ? "Backing off spreads attempts out in time, but all 40 clients still retry at exactly the same moments."
            : "Randomness breaks the lock-step. The same number of retries arrives as a gentle, even trickle."}
      </p>
    </Shell>
  );
}
