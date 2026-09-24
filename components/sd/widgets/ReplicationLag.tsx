"use client";

import { useEffect, useState } from "react";
import { Readout, Shell, Slider, Tabs, btn } from "./ui";

type Mode = "async" | "sync";
type Row = { v: number; name: string };

const NAMES = ["Asha K", "Asha Kumar", "Asha K.", "A. Kumar"];

/**
 * A leader and two followers. Save your profile, then read it straight back from a follower
 * and see replication lag — or turn on synchronous replication and pay for it in write latency.
 */
export default function ReplicationLag({ caption }: { caption: string }) {
  const [mode, setMode] = useState<Mode>("async");
  const [lag, setLag] = useState(2000);
  const [leader, setLeader] = useState<Row>({ v: 1, name: "Asha" });
  const [follower, setFollower] = useState<Row>({ v: 1, name: "Asha" });
  const [due, setDue] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [msg, setMsg] = useState<{ text: string; tone: "good" | "bad" | "warn" } | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (due !== null && now >= due) {
      setFollower(leader);
      setDue(null);
    }
  }, [now, due, leader]);

  const write = () => {
    const next = { v: leader.v + 1, name: NAMES[(leader.v - 1) % NAMES.length] };
    setLeader(next);
    if (mode === "sync") {
      setFollower(next);
      setMsg({
        text: `Confirmed only after the followers acknowledged: ~${lag + 5} ms instead of ~5 ms.`,
        tone: "warn",
      });
    } else {
      setDue(Date.now() + lag);
      setMsg({ text: "Confirmed by the leader in ~5 ms. The followers will catch up…", tone: "good" });
    }
  };

  const read = () => {
    if (follower.v < leader.v)
      setMsg({
        text: `Follower returned “${follower.name}”, but you just saved “${leader.name}”. Stale read! Fix: read your own writes from the leader.`,
        tone: "bad",
      });
    else setMsg({ text: `Follower returned “${follower.name}”, which is up to date.`, tone: "good" });
  };

  const left = due !== null ? Math.max(0, due - now) : 0;
  const behind = follower.v < leader.v;

  return (
    <Shell caption={caption}>
      <Tabs
        value={mode}
        onChange={setMode}
        options={[
          { id: "async", label: "Asynchronous" },
          { id: "sync", label: "Synchronous" },
        ]}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" className={`${btn} border-sky text-sky`} onClick={write}>
          Save a new name
        </button>
        <button type="button" className={btn} onClick={read}>
          Read from a follower
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border-2 border-sky bg-sky-soft p-3 text-center">
          <div className="font-mono text-[0.68rem] uppercase text-sky">Leader</div>
          <div className="font-semibold">{leader.name}</div>
          <div className="font-mono text-[0.68rem] text-ink-dim">v{leader.v} · takes writes</div>
        </div>
        {[1, 2].map((i) => (
          <div
            key={i}
            className={`rounded-lg border-2 p-3 text-center ${behind ? "border-amber-400/70 bg-amber-400/10" : "border-line bg-bg-code"}`}
          >
            <div className="font-mono text-[0.68rem] uppercase text-ink-dim">Follower {i}</div>
            <div className="font-semibold">{follower.name}</div>
            <div className="font-mono text-[0.68rem] text-ink-dim">
              v{follower.v} {behind ? `· ${(left / 1000).toFixed(1)} s behind` : "· in sync"}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Slider
          label="Replication lag"
          value={lag}
          min={200}
          max={5000}
          step={100}
          onChange={setLag}
          format={(v) => `${(v / 1000).toFixed(1)} s`}
        />
        <Readout
          label="write latency"
          value={mode === "sync" ? `~${lag + 5} ms` : "~5 ms"}
          tone={mode === "sync" ? "warn" : "good"}
        />
      </div>
      {msg ? (
        <p
          className={`mb-0 mt-3 font-mono text-[0.78rem] ${msg.tone === "good" ? "text-emerald-300" : msg.tone === "bad" ? "text-red-300" : "text-amber-200"}`}
        >
          {msg.text}
        </p>
      ) : null}
    </Shell>
  );
}
