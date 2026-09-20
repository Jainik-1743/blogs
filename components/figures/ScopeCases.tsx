import ScopeLookupStepper, { type Env, type LookupStep } from "./ScopeLookupStepper";

/** The four lookup cases from Lesson 7, each as a step-through. */

const FN = "{ …code }";
const G = (vars: Record<string, string>): Env => ({ name: "Global", vars, tone: "global" });
const FD = (vars: Record<string, string>, absent?: boolean): Env => ({ name: "frontDesk()", vars, tone: "fn", absent });
const CA = (vars: Record<string, string>, absent?: boolean): Env => ({ name: "checkAvailability()", vars, tone: "inner", absent });

// ── Case 1 ──────────────────────────────────────────────────────────────
const SRC1 = ["function frontDesk() {", "  console.log(discountRate); // 10", "}", "", "var discountRate = 10;", "frontDesk();"];
const G1 = G({ frontDesk: FN, discountRate: "10" });
const STEPS1: LookupStep[] = [
  { phase: "run", line: 6, title: "frontDesk() is called", note: "A new context with an empty local memory. Its Lexical Environment's outer reference points to where the function was written: Global.", envs: [FD({}), G1], console: [] },
  { phase: "lookup", line: 2, title: "console.log(discountRate) — check local memory first", note: "frontDesk's own memory has no discountRate.", envs: [FD({}), G1], checking: 0, lookingFor: "discountRate", console: [] },
  { phase: "found", line: 2, title: "Follow the outer reference → Global — found", note: "One hop up. Global holds discountRate: 10. The lookup stops here and 10 is printed.", envs: [FD({}), G1], checking: 1, lookingFor: "discountRate", console: [{ text: "10" }] },
];

// ── Case 2 ──────────────────────────────────────────────────────────────
const SRC2 = ["function frontDesk() {", "  checkAvailability();", "", "  function checkAvailability() {", "    console.log(discountRate); // 10", "  }", "}", "", "var discountRate = 10;", "frontDesk();"];
const G2 = G({ frontDesk: FN, discountRate: "10" });
const STEPS2: LookupStep[] = [
  { phase: "run", line: 10, title: "frontDesk() is called", note: "frontDesk's memory holds checkAvailability (hoisted, nested inside it). Its outer reference → Global.", envs: [FD({ checkAvailability: FN }), G2], console: [] },
  { phase: "run", line: 2, title: "checkAvailability() is called from inside frontDesk", note: "It was written inside frontDesk, so its outer reference points to frontDesk — decided by where it sits in the file, not by who called it.", envs: [CA({}), FD({ checkAvailability: FN }), G2], console: [] },
  { phase: "lookup", line: 5, title: "Check checkAvailability's own memory", note: "No discountRate here.", envs: [CA({}), FD({ checkAvailability: FN }), G2], checking: 0, lookingFor: "discountRate", console: [] },
  { phase: "miss", line: 5, title: "Hop 1 → frontDesk's memory", note: "Not there either. Keep climbing — one level at a time, never skipping.", envs: [CA({}), FD({ checkAvailability: FN }), G2], checking: 1, lookingFor: "discountRate", console: [] },
  { phase: "found", line: 5, title: "Hop 2 → Global — found", note: "discountRate: 10. Two hops up the chain, same result as Case 1.", envs: [CA({}), FD({ checkAvailability: FN }), G2], checking: 2, lookingFor: "discountRate", console: [{ text: "10" }] },
];

// ── Case 3 ──────────────────────────────────────────────────────────────
const SRC3 = ["function frontDesk() {", "  checkAvailability();", "", "  function checkAvailability() {", "    var discountRate = 100;", "    console.log(discountRate); // 100", "  }", "}", "", "var discountRate = 10;", "frontDesk();"];
const G3 = G({ frontDesk: FN, discountRate: "10" });
const STEPS3: LookupStep[] = [
  { phase: "run", line: 2, title: "checkAvailability() is called", note: "Memory phase for the new context reserves its own discountRate → undefined. There are now two slots with that name on the chain.", envs: [CA({ discountRate: "undefined" }), FD({ checkAvailability: FN }), G3], console: [] },
  { phase: "run", line: 5, title: "Line 5 — the local one becomes 100", note: "Global's discountRate is still 10 — untouched, a different slot entirely.", envs: [CA({ discountRate: "100" }), FD({ checkAvailability: FN }), G3], console: [] },
  { phase: "found", line: 6, title: "Lookup stops at the very first level", note: "checkAvailability's own memory has discountRate. The nearest match wins — the chain is never climbed toward frontDesk or Global. The inner name shadows the outer one.", envs: [CA({ discountRate: "100" }), FD({ checkAvailability: FN }), G3], checking: 0, lookingFor: "discountRate", console: [{ text: "100" }] },
];

// ── Case 4 ──────────────────────────────────────────────────────────────
const SRC4 = ["function frontDesk() {", "  var discountRate = 10;", "  checkAvailability();", "", "  function checkAvailability() {", "    console.log(discountRate); // 10", "  }", "}", "", "frontDesk();", "console.log(discountRate); // ReferenceError"];
const G4 = G({ frontDesk: FN });
const STEPS4: LookupStep[] = [
  { phase: "run", line: 3, title: "Inside frontDesk, checkAvailability() is called", note: "frontDesk's memory holds discountRate: 10. checkAvailability's outer reference → frontDesk.", envs: [CA({}), FD({ discountRate: "10", checkAvailability: FN }), G4], console: [] },
  { phase: "lookup", line: 6, title: "Check checkAvailability's own memory", note: "Empty.", envs: [CA({}), FD({ discountRate: "10", checkAvailability: FN }), G4], checking: 0, lookingFor: "discountRate", console: [] },
  { phase: "found", line: 6, title: "Hop up → frontDesk — found", note: "Inner sees outer, as always. 10 is printed.", envs: [CA({}), FD({ discountRate: "10", checkAvailability: FN }), G4], checking: 1, lookingFor: "discountRate", console: [{ text: "10" }] },
  { phase: "run", line: 10, title: "frontDesk() returns", note: "Both inner contexts are popped. frontDesk's memory — with discountRate: 10 — is discarded. Only Global remains on the chain.", envs: [CA({}, true), FD({ discountRate: "10", checkAvailability: FN }, true), G4], console: [{ text: "10" }] },
  { phase: "lookup", line: 11, title: "Global asks for discountRate — check Global's memory", note: "Global has frontDesk, but no discountRate. And there is no reference pointing down into frontDesk — the chain only ever runs outward and upward.", envs: [CA({}, true), FD({ discountRate: "10", checkAvailability: FN }, true), G4], checking: 2, lookingFor: "discountRate", console: [{ text: "10" }] },
  { phase: "error", line: 11, title: "Global's outer is null → ReferenceError", note: "Nowhere left to look. A function can access a global variable, but the global scope can never access a local variable declared inside a function.", envs: [CA({}, true), FD({ discountRate: "10", checkAvailability: FN }, true), G4], checking: -1, lookingFor: "discountRate", console: [{ text: "10" }, { text: "ReferenceError: discountRate is not defined", bad: true }] },
];

export function ScopeCase1() {
  return <ScopeLookupStepper file="case1.js" source={SRC1} steps={STEPS1} caption="Step through the lookup: not in frontDesk's own memory, so one hop up the outer reference to Global." />;
}
export function ScopeCase2() {
  return <ScopeLookupStepper file="case2.js" source={SRC2} steps={STEPS2} caption="Step through the lookup: own memory, then frontDesk, then Global — one level per hop, never skipping straight to the top." />;
}
export function ScopeCase3() {
  return <ScopeLookupStepper file="case3.js" source={SRC3} steps={STEPS3} caption="Step through the lookup: the local discountRate is found at the first level, so the chain is never climbed. Global's 10 is untouched." />;
}
export function ScopeCase4() {
  return <ScopeLookupStepper file="case4.js" source={SRC4} steps={STEPS4} caption="Step through both lookups: the inner one climbs up and succeeds; the global one has no way to climb down, and fails." />;
}
