import ScopeLookupStepper, { type Env, type LookupStep } from "./ScopeLookupStepper";

/** Three nested blocks, three lookups: each name resolves at the nearest level that has it. */
const SRC = [
  "let floor = 1;",
  "{",
  "  let wing = \"north\";",
  "  {",
  "    let room = 101;",
  "    console.log(room, wing, floor);",
  "  }",
  "}",
];

const G: Env = { name: "Global", vars: { floor: "1" }, tone: "global" };
const OUTER: Env = { name: "outer block { }", vars: { wing: '"north"' }, tone: "fn" };
const INNER: Env = { name: "inner block { }", vars: { room: "101" }, tone: "inner" };
const chain = [INNER, OUTER, G];

const STEPS: LookupStep[] = [
  { phase: "run", line: 5, title: "Inside the inner block", note: "Three environments are alive, each created when its braces were entered, each with an outer reference to the one around it. Line 6 needs three names.", envs: chain, console: [] },
  { phase: "found", line: 6, title: "room — found in the inner block", note: "Own memory first. It is right here; no climbing.", envs: chain, checking: 0, lookingFor: "room", console: [] },
  { phase: "lookup", line: 6, title: "wing — not in the inner block", note: "Follow the outer reference one level up.", envs: chain, checking: 0, lookingFor: "wing", console: [] },
  { phase: "found", line: 6, title: "wing — found in the outer block", note: "One hop.", envs: chain, checking: 1, lookingFor: "wing", console: [] },
  { phase: "lookup", line: 6, title: "floor — not in the inner block", note: "Climb.", envs: chain, checking: 0, lookingFor: "floor", console: [] },
  { phase: "miss", line: 6, title: "floor — not in the outer block either", note: "Climb again.", envs: chain, checking: 1, lookingFor: "floor", console: [] },
  { phase: "found", line: 6, title: "floor — found in Global", note: "Two hops. A block's environment is a link in exactly the same chain that functions use (Lesson 7). Output: 101 north 1.", envs: chain, checking: 2, lookingFor: "floor", console: [{ text: "101 north 1" }] },
];

export default function NestedBlocksCase() {
  return <ScopeLookupStepper file="nested.js" source={SRC} steps={STEPS} caption="Step through the three lookups on line 6. Each block is a full link in the scope chain; each name is found at the nearest level that declares it." />;
}
