"use client";

import { useState } from "react";
import { Shell, Tabs, btn } from "./ui";

type Mode = "cp" | "ap";
type Log = { text: string; tone: "good" | "bad" | "warn" };

/**
 * Two replicas of a bank balance. Cut the network between them, then read and write on
 * each side, and compare what a CP system and an AP system do.
 */
export default function CapPartition({ caption }: { caption: string }) {
  const [mode, setMode] = useState<Mode>("cp");
  const [split, setSplit] = useState(false);
  const [bal, setBal] = useState({ A: 100, B: 100 });
  const [log, setLog] = useState<Log[]>([]);

  const push = (l: Log) => setLog((x) => [l, ...x].slice(0, 5));
  const reset = (m: Mode) => {
    setMode(m);
    setSplit(false);
    setBal({ A: 100, B: 100 });
    setLog([]);
  };

  const write = (side: "A" | "B") => {
    if (!split) {
      const v = bal[side] + 50;
      setBal({ A: v, B: v });
      push({ text: `Deposit +50 on ${side} → copied to both replicas. Balance ${v}.`, tone: "good" });
    } else if (mode === "cp" && side === "B") {
      push({ text: "B can't reach the majority → write REJECTED. Consistent, but not available.", tone: "bad" });
    } else {
      setBal((b) => ({ ...b, [side]: b[side] + 50 }));
      push({
        text:
          mode === "cp"
            ? "A holds the majority → write accepted. B stays frozen until the network heals."
            : `AP: ${side} accepts locally. Available, but the sides now disagree.`,
        tone: "warn",
      });
    }
  };

  const read = (side: "A" | "B") => {
    if (split && mode === "cp" && side === "B")
      return push({ text: "B refuses to answer because it might be stale. Error returned.", tone: "bad" });
    const other = side === "A" ? bal.B : bal.A;
    const stale = split && bal.A !== bal.B;
    push({
      text: `Read on ${side} → ${bal[side]}${stale ? ` (the other side says ${other}: one of them is stale)` : ""}`,
      tone: stale ? "warn" : "good",
    });
  };

  const heal = () => {
    setSplit(false);
    if (bal.A !== bal.B) {
      const merged = Math.max(bal.A, bal.B);
      setBal({ A: merged, B: merged });
      push({
        text: `Network back. Replicas reconcile to ${merged} (conflict resolution, e.g. last-write-wins).`,
        tone: "warn",
      });
    } else push({ text: "Network back. Replicas already agree.", tone: "good" });
  };

  const node = (side: "A" | "B") => {
    const frozen = split && mode === "cp" && side === "B";
    return (
      <div
        className={`rounded-lg border-2 p-3 text-center ${frozen ? "border-red-400/60 bg-red-400/5" : "border-sky/60 bg-sky-soft"}`}
      >
        <div className="font-mono text-[0.72rem] text-ink-dim">Replica {side}</div>
        <div className="font-mono text-[1.4rem] font-bold text-ink">₹{bal[side]}</div>
        <div className="mt-2 flex flex-wrap justify-center gap-1.5">
          <button type="button" className={btn} onClick={() => write(side)}>
            Write +50
          </button>
          <button type="button" className={btn} onClick={() => read(side)}>
            Read
          </button>
        </div>
      </div>
    );
  };

  return (
    <Shell caption={caption}>
      <Tabs
        value={mode}
        onChange={reset}
        options={[
          { id: "cp", label: "CP — keep consistency" },
          { id: "ap", label: "AP — keep availability" },
        ]}
      />
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        {node("A")}
        <div className="flex flex-col items-center gap-2">
          <span className={`font-mono text-[1.2rem] ${split ? "text-red-400" : "text-emerald-300"}`} aria-hidden="true">
            {split ? "─╳─" : "───"}
          </span>
          <button
            type="button"
            className={`${btn} ${split ? "border-red-400 text-red-300" : ""}`}
            onClick={() => (split ? heal() : setSplit(true))}
          >
            {split ? "Heal" : "Cut"}
          </button>
        </div>
        {node("B")}
      </div>
      <ol className="mt-4 min-h-[6rem] list-none space-y-1 rounded-lg border border-line bg-bg-code p-3 font-mono text-[0.74rem]">
        {log.length === 0 ? (
          <li className="text-ink-dim">Write once, then cut the network and write on both sides.</li>
        ) : null}
        {log.map((l, i) => (
          <li
            key={i}
            className={l.tone === "good" ? "text-emerald-300" : l.tone === "bad" ? "text-red-300" : "text-amber-200"}
          >
            {l.text}
          </li>
        ))}
      </ol>
    </Shell>
  );
}
