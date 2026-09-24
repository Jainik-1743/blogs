"use client";

import { useState } from "react";
import { Readout, Shell, btn } from "./ui";

type State = "closed" | "open" | "half-open";
type Log = { text: string; tone: "good" | "bad" | "warn" | "muted" };

const THRESHOLD = 3;
const COOLDOWN = 3;

const STATES: { id: State; label: string; desc: string; cls: string }[] = [
  {
    id: "closed",
    label: "CLOSED",
    desc: "Calls flow normally. Failures are counted.",
    cls: "border-emerald-400 bg-emerald-400/15 text-emerald-200",
  },
  {
    id: "open",
    label: "OPEN",
    desc: "Calls fail fast without touching the service.",
    cls: "border-red-400 bg-red-400/15 text-red-200",
  },
  {
    id: "half-open",
    label: "HALF-OPEN",
    desc: "One trial call decides: close or re-open.",
    cls: "border-amber-400 bg-amber-400/15 text-amber-200",
  },
];

/** Drive a circuit breaker by hand: make the downstream service healthy or sick and send calls. */
export default function CircuitBreaker({ caption }: { caption: string }) {
  const [state, setState] = useState<State>("closed");
  const [healthy, setHealthy] = useState(true);
  const [fails, setFails] = useState(0);
  const [wait, setWait] = useState(0);
  const [log, setLog] = useState<Log[]>([]);

  const push = (l: Log) => setLog((x) => [l, ...x].slice(0, 6));

  const call = () => {
    if (state === "open") {
      const left = wait - 1;
      if (left <= 0) {
        setState("half-open");
        setWait(0);
        push({ text: "Cool-down over → HALF-OPEN. Next call is a trial.", tone: "warn" });
      } else {
        setWait(left);
        push({ text: `Rejected instantly (fail fast). ${left} more until trial.`, tone: "muted" });
      }
      return;
    }
    if (state === "half-open") {
      if (healthy) {
        setState("closed");
        setFails(0);
        push({ text: "Trial call succeeded → CLOSED. Traffic resumes.", tone: "good" });
      } else {
        setState("open");
        setWait(COOLDOWN);
        push({ text: "Trial call failed → OPEN again.", tone: "bad" });
      }
      return;
    }
    if (healthy) {
      setFails(0);
      push({ text: "200 OK. Failure counter reset.", tone: "good" });
    } else {
      const f = fails + 1;
      if (f >= THRESHOLD) {
        setState("open");
        setFails(0);
        setWait(COOLDOWN);
        push({ text: `Timeout — ${f} in a row. Threshold hit → OPEN.`, tone: "bad" });
      } else {
        setFails(f);
        push({ text: `Timeout after 2 s (${f}/${THRESHOLD}).`, tone: "bad" });
      }
    }
  };

  return (
    <Shell caption={caption}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button type="button" className={`${btn} border-sky text-sky`} onClick={call}>
          Send a call →
        </button>
        <button type="button" className={btn} onClick={() => setHealthy((h) => !h)}>
          Make service {healthy ? "sick" : "healthy"}
        </button>
        <span
          className={`ml-auto rounded-full px-2 py-0.5 font-mono text-[0.7rem] ${healthy ? "bg-emerald-400/15 text-emerald-300" : "bg-red-400/15 text-red-300"}`}
        >
          downstream: {healthy ? "healthy" : "timing out"}
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {STATES.map((s) => (
          <div
            key={s.id}
            className={`rounded-lg border-2 px-3 py-2 transition ${state === s.id ? s.cls : "border-line text-ink-dim opacity-60"}`}
          >
            <div className="font-mono text-[0.8rem] font-bold">{s.label}</div>
            <div className="text-[0.78rem]">{s.desc}</div>
          </div>
        ))}
      </div>
      <div className="mt-2 text-center font-mono text-[0.68rem] text-ink-dim" aria-hidden="true">
        CLOSED —{THRESHOLD} failures→ OPEN —cool-down→ HALF-OPEN —success→ CLOSED / —failure→ OPEN
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Readout label="consecutive failures" value={`${fails} / ${THRESHOLD}`} tone={fails ? "warn" : undefined} />
        <Readout label="calls until trial" value={state === "open" ? wait : "–"} />
      </div>
      <ol className="mt-3 min-h-[7rem] list-none space-y-1 rounded-lg border border-line bg-bg-code p-3 font-mono text-[0.75rem]">
        {log.length === 0 ? <li className="text-ink-dim">Send a few calls, then make the service sick.</li> : null}
        {log.map((l, i) => (
          <li
            key={log.length - i}
            className={
              l.tone === "good"
                ? "text-emerald-300"
                : l.tone === "bad"
                  ? "text-red-300"
                  : l.tone === "warn"
                    ? "text-amber-200"
                    : "text-ink-dim"
            }
          >
            {l.text}
          </li>
        ))}
      </ol>
    </Shell>
  );
}
