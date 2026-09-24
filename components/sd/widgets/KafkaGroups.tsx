"use client";

import { useState } from "react";
import { Shell, Slider } from "./ui";

const COLORS = ["#fb923c", "#38bdf8", "#34d399", "#f472b6", "#a78bfa", "#facc15", "#f87171", "#2dd4bf"];

/**
 * A topic's partitions and one consumer group. Change the counts and see how partitions are
 * shared out — and that consumers beyond the partition count sit idle.
 */
export default function KafkaGroups({ caption }: { caption: string }) {
  const [partitions, setPartitions] = useState(6);
  const [consumers, setConsumers] = useState(3);
  const [groups, setGroups] = useState(2);

  const owner = (p: number) => p % consumers;
  const idle = Math.max(0, consumers - partitions);

  return (
    <Shell caption={caption}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Slider label="Partitions in topic “orders”" value={partitions} min={1} max={8} onChange={setPartitions} />
        <Slider label="Consumers in group A" value={consumers} min={1} max={8} onChange={setConsumers} />
        <Slider label="Consumer groups" value={groups} min={1} max={3} onChange={setGroups} />
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div className="space-y-1.5">
          {Array.from({ length: partitions }, (_, p) => (
            <div key={p} className="flex items-center gap-2">
              <span className="w-8 font-mono text-[0.7rem] text-ink-dim">P{p}</span>
              <div className="flex flex-1 gap-0.5">
                {Array.from({ length: 8 }, (_, o) => (
                  <span
                    key={o}
                    className="h-4 flex-1 rounded-sm border border-line bg-bg-code font-mono text-[0.5rem] leading-4 text-ink-dim"
                  >
                    {o}
                  </span>
                ))}
              </div>
              <span className="h-3 w-3 rounded-full" style={{ background: COLORS[owner(p)] }} />
            </div>
          ))}
          <div className="font-mono text-[0.62rem] text-ink-dim">
            each box = one message at an offset; order is kept within a partition
          </div>
        </div>
        <div className="hidden text-2xl text-sky sm:block" aria-hidden="true">
          →
        </div>
        <div className="space-y-2">
          <div className="font-mono text-[0.7rem] uppercase tracking-[0.08em] text-sky">Group A</div>
          {Array.from({ length: consumers }, (_, c) => {
            const mine = Array.from({ length: partitions }, (_, p) => p).filter((p) => owner(p) === c);
            return (
              <div
                key={c}
                className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 ${mine.length ? "border-line bg-bg-code" : "border-dashed border-red-400/50 bg-red-400/5"}`}
              >
                <span className="h-3 w-3 rounded-full" style={{ background: COLORS[c] }} />
                <span className="font-mono text-[0.78rem]">consumer-{c + 1}</span>
                <span className="ml-auto font-mono text-[0.72rem] text-ink-dim">
                  {mine.length ? mine.map((p) => `P${p}`).join(", ") : "idle"}
                </span>
              </div>
            );
          })}
          {Array.from({ length: groups - 1 }, (_, g) => (
            <div
              key={g}
              className="rounded-lg border border-sky/40 bg-sky-soft px-3 py-1.5 font-mono text-[0.75rem] text-sky-strong"
            >
              Group {String.fromCharCode(66 + g)}: reads all {partitions} partitions again, at its own pace
            </div>
          ))}
        </div>
      </div>
      <p className="mb-0 mt-4 text-[0.8rem] text-ink-dim">
        Inside one group each partition has exactly one consumer, so the partition count caps your parallelism
        {idle ? (
          <strong className="text-red-300">
            {" "}
            — {idle} consumer{idle > 1 ? "s are" : " is"} idle right now
          </strong>
        ) : null}
        . Every extra group gets its own full copy of the stream: that is pub/sub.
      </p>
    </Shell>
  );
}
