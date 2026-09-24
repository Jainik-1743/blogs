"use client";

import { useState } from "react";
import { Shell, Tabs, btn, hash, rng } from "./ui";

type Algo = "rr" | "least" | "hash" | "random";
type Server = { name: string; active: number; total: number; weight: number };

const USERS = ["asha", "ben", "chen", "dev", "eva", "farah"];

/**
 * Send requests through four balancing algorithms. Some requests are slow and stay "active"
 * for a while, which is where least-connections pulls ahead of round robin.
 */
export default function LoadBalancer({ caption }: { caption: string }) {
  const [algo, setAlgo] = useState<Algo>("rr");
  const [servers, setServers] = useState<Server[]>(() =>
    ["S1", "S2", "S3"].map((name) => ({ name, active: 0, total: 0, weight: 1 })),
  );
  const [next, setNext] = useState(0);
  const [seed, setSeed] = useState(1);
  const [last, setLast] = useState<{ user: string; to: number; slow: boolean } | null>(null);

  const reset = (a: Algo) => {
    setAlgo(a);
    setServers(["S1", "S2", "S3"].map((name) => ({ name, active: 0, total: 0, weight: 1 })));
    setNext(0);
    setLast(null);
  };

  const send = () => {
    const r = rng(seed);
    setSeed((s) => s + 1);
    const user = USERS[Math.floor(r() * USERS.length)];
    const slow = r() < 0.35;
    let to = 0;
    if (algo === "rr") to = next % 3;
    else if (algo === "least") to = servers.reduce((b, s, i) => (s.active < servers[b].active ? i : b), 0);
    else if (algo === "hash") to = hash(user) % 3;
    else to = Math.floor(r() * 3);
    setNext((n) => n + 1);
    setLast({ user, to, slow });
    setServers((prev) =>
      prev.map((s, i) => ({
        ...s,
        // Every request finishes some work on all servers; slow ones linger.
        active: Math.max(0, s.active - (r() < 0.5 ? 1 : 0)) + (i === to ? (slow ? 3 : 1) : 0),
        total: s.total + (i === to ? 1 : 0),
      })),
    );
  };

  const maxActive = Math.max(4, ...servers.map((s) => s.active));

  return (
    <Shell caption={caption}>
      <Tabs
        value={algo}
        onChange={reset}
        options={[
          { id: "rr", label: "Round robin" },
          { id: "least", label: "Least connections" },
          { id: "hash", label: "IP / user hash" },
          { id: "random", label: "Random" },
        ]}
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button type="button" className={`${btn} border-sky text-sky`} onClick={send}>
          Send request →
        </button>
        <button type="button" className={btn} onClick={() => reset(algo)}>
          ⟲ Reset
        </button>
        {last ? (
          <span className="font-mono text-[0.75rem] text-ink-dim">
            {last.user} → <span className="text-sky">{servers[last.to].name}</span> {last.slow ? "(slow request)" : ""}
          </span>
        ) : null}
      </div>
      <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3">
        <div className="row-span-3 flex h-full items-center">
          <div className="rounded-lg border border-sky bg-sky-soft px-3 py-4 text-center font-mono text-[0.75rem] text-sky-strong">
            Load
            <br />
            balancer
          </div>
        </div>
        {servers.map((s, i) => (
          <div
            key={s.name}
            className={`rounded-lg border px-3 py-2 transition ${last?.to === i ? "border-sky bg-sky-soft" : "border-line bg-bg-code"}`}
          >
            <div className="flex justify-between font-mono text-[0.75rem]">
              <span className="font-bold text-ink">{s.name}</span>
              <span className="text-ink-dim">
                active <span className="text-amber-200">{s.active}</span> · total{" "}
                <span className="text-sky">{s.total}</span>
              </span>
            </div>
            <div className="mt-1 h-2 rounded bg-bg-elev">
              <div
                className={`h-full rounded ${s.active >= 5 ? "bg-red-400" : "bg-amber-300/80"}`}
                style={{ width: `${(s.active / maxActive) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mb-0 mt-3 text-[0.8rem] text-ink-dim">
        {algo === "rr"
          ? "Takes turns: fair by count, blind to how busy each server really is. Watch a server pile up slow requests."
          : algo === "least"
            ? "Sends each request to the server with the fewest active requests, so slow work spreads out."
            : algo === "hash"
              ? "The same user always lands on the same server (sticky), which helps local caches — but load can be lumpy."
              : "Simple and stateless; evens out over many requests, but short runs can be unfair."}
      </p>
    </Shell>
  );
}
