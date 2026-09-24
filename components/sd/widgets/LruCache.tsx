"use client";

import { useState } from "react";
import { Readout, Shell, Tabs, btn } from "./ui";

type Policy = "lru" | "lfu" | "fifo";
type Entry = { key: string; uses: number; at: number; added: number };

const KEYS = ["home", "cart", "p:1", "p:2", "p:3", "user", "deals"];
const CAP = 4;

/** Request keys by hand and watch a 4-slot cache hit, miss and evict under LRU, LFU or FIFO. */
export default function LruCache({ caption }: { caption: string }) {
  const [policy, setPolicy] = useState<Policy>("lru");
  const [cache, setCache] = useState<Entry[]>([]);
  const [clock, setClock] = useState(0);
  const [stats, setStats] = useState({ hit: 0, miss: 0 });
  const [event, setEvent] = useState<{ key: string; kind: "hit" | "miss"; evicted?: string } | null>(null);

  const reset = (p: Policy) => {
    setPolicy(p);
    setCache([]);
    setClock(0);
    setStats({ hit: 0, miss: 0 });
    setEvent(null);
  };

  const get = (key: string) => {
    const t = clock + 1;
    setClock(t);
    const found = cache.find((e) => e.key === key);
    if (found) {
      setCache(cache.map((e) => (e.key === key ? { ...e, uses: e.uses + 1, at: t } : e)));
      setStats((s) => ({ ...s, hit: s.hit + 1 }));
      setEvent({ key, kind: "hit" });
      return;
    }
    let next = cache;
    let evicted: string | undefined;
    if (cache.length >= CAP) {
      const victim = [...cache].sort((a, b) =>
        policy === "lru" ? a.at - b.at : policy === "lfu" ? a.uses - b.uses || a.at - b.at : a.added - b.added,
      )[0];
      evicted = victim.key;
      next = cache.filter((e) => e !== victim);
    }
    setCache([...next, { key, uses: 1, at: t, added: t }]);
    setStats((s) => ({ ...s, miss: s.miss + 1 }));
    setEvent({ key, kind: "miss", evicted });
  };

  const order = [...cache].sort((a, b) =>
    policy === "lru" ? b.at - a.at : policy === "lfu" ? b.uses - a.uses || b.at - a.at : b.added - a.added,
  );
  const total = stats.hit + stats.miss;

  return (
    <Shell caption={caption}>
      <Tabs
        value={policy}
        onChange={reset}
        options={[
          { id: "lru", label: "LRU" },
          { id: "lfu", label: "LFU" },
          { id: "fifo", label: "FIFO" },
        ]}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {KEYS.map((k) => (
          <button key={k} type="button" className={btn} onClick={() => get(k)}>
            GET {k}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: CAP }, (_, i) => {
          const e = order[i];
          const isNew = e && event?.key === e.key;
          return (
            <div
              key={i}
              className={`flex h-20 flex-col items-center justify-center rounded-lg border-2 transition ${
                !e
                  ? "border-dashed border-line text-ink-dim"
                  : isNew
                    ? event?.kind === "hit"
                      ? "border-emerald-400 bg-emerald-400/10"
                      : "border-sky bg-sky-soft"
                    : "border-line bg-bg-code"
              }`}
            >
              <span className="font-mono text-[0.9rem] font-bold">{e ? e.key : "empty"}</span>
              {e ? (
                <span className="font-mono text-[0.62rem] text-ink-dim">
                  {policy === "lfu" ? `used ${e.uses}×` : policy === "lru" ? `last t=${e.at}` : `added t=${e.added}`}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between font-mono text-[0.62rem] text-ink-dim">
        <span>{policy === "lru" ? "most recently used" : policy === "lfu" ? "most used" : "newest"}</span>
        <span>next to be evicted →</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Readout label="hits" value={stats.hit} tone="good" />
        <Readout label="misses" value={stats.miss} tone="bad" />
        <Readout label="hit ratio" value={total ? `${Math.round((stats.hit / total) * 100)}%` : "–"} />
      </div>
      <p className="mb-0 mt-3 min-h-[1.5em] font-mono text-[0.78rem]">
        {event ? (
          event.kind === "hit" ? (
            <span className="text-emerald-300">HIT {event.key} — served from memory in ~0.1 ms.</span>
          ) : (
            <span className="text-red-300">
              MISS {event.key} — read from the database (~5 ms) and stored.
              {event.evicted ? ` Evicted “${event.evicted}”.` : ""}
            </span>
          )
        ) : (
          <span className="text-ink-dim">
            Tip: request home, cart, home, p:1, p:2, p:3 and see which key each policy throws away.
          </span>
        )}
      </p>
    </Shell>
  );
}
