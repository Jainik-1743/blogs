"use client";

import { useEffect, useRef, useState } from "react";
import { Readout, Shell, Tabs, btn } from "./ui";

type Algo = "token" | "fixed" | "sliding";
type Hit = { t: number; ok: boolean };

const LIMIT = 5;
const WINDOW = 5000;
const REFILL_MS = 1000;
const SPAN = 10000;

/**
 * Fire requests by hand and watch three limiters — token bucket, fixed window and sliding
 * log — each allowing 5 requests per 5 seconds, decide which get through.
 */
export default function RateLimiter({ caption }: { caption: string }) {
  const [algo, setAlgo] = useState<Algo>("token");
  const [now, setNow] = useState(0);
  const [hits, setHits] = useState<Hit[]>([]);
  const start = useRef<number | null>(null);
  const tokens = useRef({ n: LIMIT, at: 0 });

  useEffect(() => {
    const id = setInterval(() => {
      if (start.current !== null) setNow(Date.now() - start.current);
    }, 100);
    return () => clearInterval(id);
  }, []);

  const reset = (a: Algo = algo) => {
    setAlgo(a);
    setHits([]);
    start.current = null;
    setNow(0);
    tokens.current = { n: LIMIT, at: 0 };
  };

  const clock = () => {
    if (start.current === null) start.current = Date.now();
    return Date.now() - start.current;
  };

  const bucketLevel = (t: number) => Math.min(LIMIT, tokens.current.n + (t - tokens.current.at) / REFILL_MS);

  const decide = (t: number, prior: Hit[]): boolean => {
    if (algo === "token") {
      const level = bucketLevel(t);
      if (level >= 1) {
        tokens.current = { n: level - 1, at: t };
        return true;
      }
      tokens.current = { n: level, at: t };
      return false;
    }
    if (algo === "fixed") {
      const w = Math.floor(t / WINDOW);
      return prior.filter((h) => h.ok && Math.floor(h.t / WINDOW) === w).length < LIMIT;
    }
    return prior.filter((h) => h.ok && h.t > t - WINDOW).length < LIMIT;
  };

  const send = (count: number) => {
    const t0 = clock();
    // Decided outside a state updater: the token bucket mutates a ref, and updaters may run twice.
    const out = [...hits];
    for (let i = 0; i < count; i++) {
      const t = t0 + i * 40;
      out.push({ t, ok: decide(t, out) });
    }
    setHits(out);
    setNow(t0);
  };

  const viewStart = Math.max(0, now - SPAN + 1500);
  const x = (t: number) => ((t - viewStart) / SPAN) * 100;
  const visible = hits.filter((h) => h.t >= viewStart);
  const ok = hits.filter((h) => h.ok).length;
  const inWindow =
    algo === "fixed"
      ? hits.filter((h) => h.ok && Math.floor(h.t / WINDOW) === Math.floor(now / WINDOW)).length
      : hits.filter((h) => h.ok && h.t > now - WINDOW).length;

  return (
    <Shell caption={caption}>
      <Tabs
        value={algo}
        onChange={(a) => reset(a)}
        options={[
          { id: "token", label: "Token bucket" },
          { id: "fixed", label: "Fixed window" },
          { id: "sliding", label: "Sliding log" },
        ]}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" className={btn} onClick={() => send(1)}>
          Send 1 request
        </button>
        <button type="button" className={btn} onClick={() => send(8)}>
          Burst of 8
        </button>
        <button type="button" className={btn} onClick={() => reset()}>
          ⟲ Reset
        </button>
      </div>

      <div
        className="relative h-20 overflow-hidden rounded-lg border border-line bg-bg-code"
        aria-label="Request timeline"
      >
        {algo === "fixed"
          ? Array.from({ length: 5 }, (_, i) => {
              const b = (Math.floor(viewStart / WINDOW) + i) * WINDOW;
              return b >= viewStart && x(b) < 100 ? (
                <div
                  key={b}
                  className="absolute bottom-0 top-0 border-l border-dashed border-amber-300/60"
                  style={{ left: `${x(b)}%` }}
                >
                  <span className="ml-1 font-mono text-[0.6rem] text-amber-200">window {b / WINDOW + 1}</span>
                </div>
              ) : null;
            })
          : null}
        {algo === "sliding" ? (
          <div
            className="absolute bottom-0 top-0 bg-sky-soft"
            style={{ left: `${Math.max(0, x(now - WINDOW))}%`, width: `${x(now) - Math.max(0, x(now - WINDOW))}%` }}
          />
        ) : null}
        {visible.map((h, i) => (
          <span
            key={i}
            className={`absolute h-3 w-3 -translate-x-1/2 rounded-full ${h.ok ? "bg-emerald-400" : "bg-red-400"}`}
            style={{ left: `${x(h.t)}%`, top: `${h.ok ? 26 : 52}%` }}
            title={h.ok ? "allowed" : "429 Too Many Requests"}
          />
        ))}
        <div className="absolute bottom-0 top-0 w-0.5 bg-sky" style={{ left: `${x(now)}%` }} />
        <span className="absolute left-2 top-1 font-mono text-[0.6rem] text-emerald-300">allowed</span>
        <span className="absolute bottom-1 left-2 font-mono text-[0.6rem] text-red-300">rejected (429)</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {algo === "token" ? (
          <Readout label="tokens in bucket" value={`${bucketLevel(now).toFixed(1)} / ${LIMIT}`} sub="+1 every second" />
        ) : (
          <Readout label={algo === "fixed" ? "used this window" : "used, last 5 s"} value={`${inWindow} / ${LIMIT}`} />
        )}
        <Readout label="allowed" value={ok} tone="good" />
        <Readout label="rejected" value={hits.length - ok} tone="bad" />
        <Readout label="clock" value={`${(now / 1000).toFixed(1)} s`} />
      </div>
      <p className="mb-0 mt-3 text-[0.8rem] text-ink-dim">
        {algo === "token"
          ? "Bursts are allowed up to the bucket size, then traffic is smoothed to the refill rate. Most public APIs use this."
          : algo === "fixed"
            ? "Try a burst just before a dashed line and another just after: 10 requests get through in under a second — the boundary problem."
            : "Exact: counts every request in the last 5 s. The price is storing a timestamp per request."}
      </p>
    </Shell>
  );
}
