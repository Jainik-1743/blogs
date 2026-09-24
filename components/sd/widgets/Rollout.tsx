"use client";

import { useState } from "react";
import { Readout, Shell, Tabs, btn } from "./ui";

type Strategy = "rolling" | "bluegreen" | "canary";

const CANARY = [0, 1, 5, 25, 50, 100];

/** Move a release forward and see which users get the new version under each strategy. */
export default function Rollout({ caption }: { caption: string }) {
  const [s, setS] = useState<Strategy>("canary");
  const [step, setStep] = useState(0);
  const [buggy, setBuggy] = useState(true);
  const [rolled, setRolled] = useState(false);

  const maxStep = s === "canary" ? CANARY.length - 1 : s === "bluegreen" ? 1 : 5;
  const pct = rolled ? 0 : s === "canary" ? CANARY[step] : s === "bluegreen" ? (step > 0 ? 100 : 0) : step * 20;
  const hurt = buggy ? pct : 0;
  const newServers = Math.round(pct / 10);

  const reset = (v: Strategy) => {
    setS(v);
    setStep(0);
    setRolled(false);
  };

  return (
    <Shell caption={caption}>
      <Tabs
        value={s}
        onChange={reset}
        options={[
          { id: "rolling", label: "Rolling" },
          { id: "bluegreen", label: "Blue-green" },
          { id: "canary", label: "Canary" },
        ]}
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={`${btn} border-sky text-sky`}
          onClick={() => setStep((v) => Math.min(v + 1, maxStep))}
          disabled={step >= maxStep || rolled}
        >
          Advance rollout →
        </button>
        <button type="button" className={btn} onClick={() => setRolled(true)} disabled={pct === 0}>
          ⟲ Roll back
        </button>
        <button type="button" className={btn} onClick={() => reset(s)}>
          Reset
        </button>
        <label className="ml-auto flex items-center gap-2 text-[0.8rem] text-ink-dim">
          <input
            type="checkbox"
            checked={buggy}
            onChange={(e) => setBuggy(e.target.checked)}
            className="accent-[var(--color-sky)]"
          />
          v2 has a bug
        </label>
      </div>

      {s === "bluegreen" ? (
        <div className="grid grid-cols-2 gap-3">
          {["Blue (v1)", "Green (v2)"].map((env, i) => {
            const live = (i === 1) === (pct === 100);
            return (
              <div
                key={env}
                className={`rounded-lg border-2 p-3 text-center ${live ? (i === 1 ? "border-emerald-400 bg-emerald-400/10" : "border-sky bg-sky-soft") : "border-dashed border-line opacity-60"}`}
              >
                <div className="font-semibold">{env}</div>
                <div className="font-mono text-[0.72rem] text-ink-dim">
                  {live ? "LIVE — the router points here" : "idle, kept warm"}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-10 gap-1.5">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className={`h-10 rounded-md border text-center font-mono text-[0.62rem] leading-10 ${
                i < newServers
                  ? buggy
                    ? "border-red-400 bg-red-400/20 text-red-200"
                    : "border-emerald-400 bg-emerald-400/15 text-emerald-200"
                  : "border-line bg-bg-code text-ink-dim"
              }`}
            >
              {i < newServers ? "v2" : "v1"}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Readout label="traffic on v2" value={`${pct}%`} />
        <Readout label="users hit by the bug" value={`${hurt} / 100`} tone={hurt ? "bad" : "good"} />
        <Readout
          label="rollback"
          value={s === "bluegreen" ? "flip router" : s === "canary" ? "shift traffic" : "redeploy v1"}
        />
      </div>
      <p className="mb-0 mt-3 text-[0.8rem] text-ink-dim">
        {s === "canary"
          ? "1% → 5% → 25% → 50% → 100%, checking error rates at every step. A bug caught at 1% hurts one user in a hundred."
          : s === "bluegreen"
            ? "Two full environments. Flip the router in one go, and flip it back just as fast. It costs double the servers during the switch."
            : "Replace servers a few at a time. No extra capacity is needed, but v1 and v2 run side by side and rolling back means redeploying."}
      </p>
    </Shell>
  );
}
