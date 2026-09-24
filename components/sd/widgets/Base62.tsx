"use client";

import { useState } from "react";
import { Readout, Shell, Slider } from "./ui";

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function encode(n: bigint): { code: string; steps: { q: bigint; r: number }[] } {
  if (n === BigInt(0)) return { code: "0", steps: [] };
  const steps: { q: bigint; r: number }[] = [];
  const base = BigInt(62);
  let s = "";
  while (n > BigInt(0)) {
    const r = Number(n % base);
    steps.push({ q: n, r });
    s = ALPHABET[r] + s;
    n /= base;
  }
  return { code: s, steps };
}

/** Type a database ID and watch it become a short code, one divide-by-62 at a time. */
export default function Base62({ caption }: { caption: string }) {
  const [id, setId] = useState("125000000000");
  const [len, setLen] = useState(7);
  const { code, steps } = encode(BigInt(id || "0"));
  const capacity = Math.pow(62, len);

  return (
    <Shell caption={caption}>
      <label className="block text-[0.82rem] text-ink-dim">
        Auto-increment ID from the database
        <input
          value={id}
          onChange={(e) => setId(e.target.value.replace(/\D/g, "").slice(0, 18))}
          inputMode="numeric"
          className="mt-1 w-full rounded-lg border border-line bg-bg-code px-3 py-2 font-mono text-ink outline-none focus:border-sky"
        />
      </label>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="font-mono text-[0.85rem] text-ink-dim">short.ly/</span>
        <span className="flex flex-wrap gap-1">
          {code.split("").map((c, i) => (
            <span
              key={i}
              className="flex h-9 w-7 items-center justify-center rounded-md border border-sky bg-sky-soft font-mono text-[1rem] font-bold text-sky-strong"
            >
              {c}
            </span>
          ))}
        </span>
      </div>
      <ol className="mt-4 list-none space-y-0.5 rounded-lg border border-line bg-bg-code p-3 font-mono text-[0.72rem] text-ink-dim">
        {steps.map((s, i) => (
          <li key={i}>
            {s.q.toString()} ÷ 62 → remainder <span className="text-sky">{s.r}</span> = “
            <span className="text-sky-strong">{ALPHABET[s.r]}</span>”
          </li>
        ))}
        <li className="text-ink">read the remainders bottom-up → {code}</li>
      </ol>
      <div className="mt-4">
        <Slider label="Code length" value={len} min={4} max={10} onChange={setLen} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Readout
          label={`62^${len} unique codes`}
          value={
            capacity >= 1e12
              ? `${(capacity / 1e12).toFixed(1)} trillion`
              : capacity >= 1e9
                ? `${(capacity / 1e9).toFixed(1)} billion`
                : `${(capacity / 1e6).toFixed(1)} million`
          }
        />
        <Readout
          label="lasts at 1,000 new URLs/s"
          value={`${(capacity / 1000 / 86400 / 365).toFixed(capacity > 1e13 ? 0 : 1)} years`}
          tone="good"
        />
      </div>
    </Shell>
  );
}
