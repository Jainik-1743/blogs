"use client";

import TimerLoopStepper, { buildSteps, type Binding } from "./TimerLoopStepper";

/** The naive var version and the four fixes from Lesson 11, each as a step-through. */

const one = (v: string, reading = false): Binding[] => [{ label: "function / global · i", value: v, reading }];
const per = (n: number, name: string, scope: (k: number) => string, reading = -1): Binding[] => Array.from({ length: n }, (_, i) => ({ label: `${scope(i + 1)} · ${name}`, value: String(i + 1), reading: i + 1 === reading }));

// ── Naive ───────────────────────────────────────────────────────────────
const NAIVE_SRC = ["for (var i = 1; i <= 5; i++) {", "  setTimeout(() => {", "    console.log(i);", "  }, i * 1000);", "}", "// 6, 6, 6, 6, 6"];
const NAIVE = buildSteps({
  loopLine: 1, callbackLine: 3, afterLine: 5,
  bindings: (k) => one(String(k <= 5 ? k : 6)),
  carries: () => "→ the one shared i (read later)",
  fire: () => ({ prints: "6", bindings: one("6", true) }),
  scheduleNote: (k) => `The arrow function is created and handed to setTimeout. It closes over the loop's single i — currently ${k}. setTimeout returns immediately; nothing waits.`,
  endNote: "The final i++ made it 6 and i <= 5 failed. The one shared i is left at 6. All five callbacks are still pointing at it. Not one has run — the earliest is due in a full second.",
  fireNote: (k) => `Callback ${k} reads i now, through its closure link. There is only one i, and it has been 6 since the loop ended. Prints 6.`,
});

// ── Fix 1: let ──────────────────────────────────────────────────────────
const LET_SRC = ["for (let i = 1; i <= 5; i++) {", "  setTimeout(() => {", "    console.log(i);", "  }, i * 1000);", "}", "// 1, 2, 3, 4, 5"];
const LET = buildSteps({
  loopLine: 1, callbackLine: 3, afterLine: 5,
  bindings: (k) => per(Math.min(k, 5), "i", (n) => `iteration ${n} block`),
  carries: (k) => `→ iteration ${k}'s own i`,
  fire: (k) => ({ prints: String(k), bindings: per(5, "i", (n) => `iteration ${n} block`, k) }),
  scheduleNote: (k) => `let gives this iteration its own block binding, i = ${k}. The callback closes over that one. ${k > 1 ? "The earlier bindings are still alive — their callbacks hold them." : ""}`,
  endNote: "Five iterations, five separate i bindings, each frozen at the value it had. The loop's own bookkeeping never touched them again.",
  fireNote: (k) => `Callback ${k} reads its own iteration's i: ${k}.`,
});

// ── Fix 2: IIFE ─────────────────────────────────────────────────────────
const IIFE_SRC = ["for (var i = 1; i <= 5; i++) {", "  (function (capturedI) {", "    setTimeout(() => {", "      console.log(capturedI);", "    }, capturedI * 1000);", "  })(i);", "}", "// 1, 2, 3, 4, 5"];
const IIFE = buildSteps({
  loopLine: 1, callbackLine: 4, afterLine: 7,
  bindings: (k) => [...one(String(k <= 5 ? k : 6)), ...per(Math.min(k, 5), "capturedI", (n) => `IIFE call ${n}`)],
  carries: (k) => `→ IIFE call ${k}'s capturedI`,
  fire: (k) => ({ prints: String(k), bindings: [...one("6"), ...per(5, "capturedI", (n) => `IIFE call ${n}`, k)] }),
  scheduleNote: (k) => `The IIFE runs immediately with i as its argument. That call gets its own Variable Environment with capturedI = ${k}. The setTimeout callback is created inside it, so it closes over this capturedI — not the loop's i.`,
  endNote: "The shared var i is 6, as always. But no callback ever looked at it: each one closes over the capturedI of the IIFE call that created it, and those five environments are kept alive by the callbacks.",
  fireNote: (k) => `Callback ${k} reads capturedI from IIFE call ${k}'s environment: ${k}. The loop's i (6) is irrelevant.`,
});

// ── Fix 3: helper ───────────────────────────────────────────────────────
const HELPER_SRC = ["function scheduleLog(n) {", "  setTimeout(() => {", "    console.log(n);", "  }, n * 1000);", "}", "", "for (var i = 1; i <= 5; i++) {", "  scheduleLog(i);", "}", "// 1, 2, 3, 4, 5"];
const HELPER = buildSteps({
  loopLine: 7, callbackLine: 3, afterLine: 9,
  bindings: (k) => [...one(String(k <= 5 ? k : 6)), ...per(Math.min(k, 5), "n", (n) => `scheduleLog call ${n}`)],
  carries: (k) => `→ scheduleLog call ${k}'s n`,
  fire: (k) => ({ prints: String(k), bindings: [...one("6"), ...per(5, "n", (n) => `scheduleLog call ${n}`, k)] }),
  scheduleNote: (k) => `scheduleLog(${k}) is an ordinary call: a fresh Variable Environment with its own parameter n = ${k}. The callback created inside closes over that n.`,
  endNote: "Same picture as the IIFE, just named: five calls, five n bindings, five closures. The loop's var i is 6 and nobody cares.",
  fireNote: (k) => `Callback ${k} reads n from scheduleLog call ${k}'s environment: ${k}.`,
});

// ── Fix 4: bind ─────────────────────────────────────────────────────────
const BIND_SRC = ["for (var i = 1; i <= 5; i++) {", "  setTimeout(", "    console.log.bind(null, i),", "    i * 1000", "  );", "}", "// 1, 2, 3, 4, 5"];
const BIND = buildSteps({
  loopLine: 1, callbackLine: 3, afterLine: 6,
  bindings: (k) => one(String(k <= 5 ? k : 6)),
  carries: (k) => `argument baked in: ${k} (no lookup later)`,
  fire: (k) => ({ prints: String(k), bindings: one("6") }),
  scheduleNote: (k) => `.bind(null, ${k}) is evaluated now. It reads i's current value (${k}) and returns a new function with that value locked in as its first argument. The new function does not close over i at all.`,
  endNote: "i is 6. But the five bound functions do not read i when they run — each already carries the argument it was given at bind time.",
  fireNote: (k) => `Callback ${k} runs console.log with its baked-in argument: ${k}. Notice no binding is marked as read — nothing is looked up.`,
});

export function NaiveTimerLoop() {
  return <TimerLoopStepper file="naive.js" source={NAIVE_SRC} steps={NAIVE} tone="amber" caption="Step through it. The loop finishes in a millisecond with i at 6; a second later the first callback looks at the only i there is." />;
}
export function LetTimerLoop() {
  return <TimerLoopStepper file="fix1-let.js" source={LET_SRC} steps={LET} caption="Step through it. Five iterations create five i bindings; each callback reads its own when it fires." />;
}
export function IifeTimerLoop() {
  return <TimerLoopStepper file="fix2-iife.js" source={IIFE_SRC} steps={IIFE} caption="Step through it. The shared var i still ends at 6 — but every callback closes over its own IIFE call's capturedI instead." />;
}
export function HelperTimerLoop() {
  return <TimerLoopStepper file="fix3-helper.js" source={HELPER_SRC} steps={HELPER} caption="Step through it. Each scheduleLog(i) call is a fresh Variable Environment with its own n." />;
}
export function BindTimerLoop() {
  return <TimerLoopStepper file="fix4-bind.js" source={BIND_SRC} steps={BIND} caption="Step through it. No new scope at all: the value is read once at bind time and carried inside the function." />;
}
