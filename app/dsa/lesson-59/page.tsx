import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import DryRun from "@/components/dsa/DryRun";
import DsaLessonPage from "@/components/dsa/DsaLesson";
import Questions from "./questions";
import Recall from "@/components/dsa/Recall";
import CodeBlock from "@/components/sd/CodeBlock";
import { getDsaLesson } from "@/lib/dsa";

const lesson = getDsaLesson("lesson-59");

export const metadata: Metadata = {
  title: `Lesson 59 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "why", label: "The interview is a conversation" },
  { id: "timeline", label: "The 45 minutes at a glance" },
  { id: "clarify", label: "Step 1: clarify the problem" },
  { id: "examples", label: "Step 2: examples and edge cases, out loud" },
  { id: "brute", label: "Step 3: brute force, then optimise" },
  { id: "clean", label: "Step 4: clean code under time pressure" },
  { id: "test", label: "Step 5: test with a dry run" },
  { id: "complexity", label: "Step 6: state time and space complexity" },
  { id: "hints", label: "Using hints well" },
  { id: "js", label: "JavaScript-specific tips" },
  { id: "mistakes", label: "Common mistakes" },
  { id: "practice", label: "Mock interview walk-throughs (4)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const bruteCode = `// "Does the array contain a duplicate?" in three steps of improvement, said aloud as you go.
function hasDuplicateBrute(nums) {            // 1. brute force: compare every pair, O(n^2) time, O(1) space
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] === nums[j]) return true;
    }
  }
  return false;
}

function hasDuplicateSort(nums) {             // 2. sort, then equal values sit side by side: O(n log n) time
  const sorted = [...nums].sort((a, b) => a - b);   // copy first so the caller's array is untouched
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1]) return true;
  }
  return false;
}

function hasDuplicateSet(nums) {              // 3. remember what we have seen: O(n) time, O(n) space
  const seen = new Set();
  for (const x of nums) {
    if (seen.has(x)) return true;
    seen.add(x);
  }
  return false;
}

for (const f of [hasDuplicateBrute, hasDuplicateSort, hasDuplicateSet]) {
  console.log(f([1, 2, 3, 1]), f([1, 2, 3]), f([]));
}
// true false false
// true false false
// true false false`;

const tidyCode = `// The same function twice. Both are correct; only one is pleasant to read, dry-run and fix at minute 35.
function f(a, t) {
  const m = new Map();
  for (let i = 0; i < a.length; i++) {
    if (m.has(t - a[i])) return [m.get(t - a[i]), i];
    m.set(a[i], i);
  }
  return [];
}

function twoSum(nums, target) {
  const indexOf = new Map();                   // value -> index where we saw it
  for (let i = 0; i < nums.length; i++) {
    const needed = target - nums[i];
    if (indexOf.has(needed)) return [indexOf.get(needed), i];
    indexOf.set(nums[i], i);                   // set AFTER the check so an element never pairs with itself
  }
  return [];
}

console.log(f([2, 7, 11, 15], 9));        // [ 0, 1 ]
console.log(twoSum([2, 7, 11, 15], 9));   // [ 0, 1 ]`;

const testCode = `// A tiny test table you can type in two minutes, and run in your head just as well.
function twoSum(nums, target) {
  const indexOf = new Map();
  for (let i = 0; i < nums.length; i++) {
    const needed = target - nums[i];
    if (indexOf.has(needed)) return [indexOf.get(needed), i];
    indexOf.set(nums[i], i);
  }
  return [];
}

const cases = [
  ["the given example",     [2, 7, 11, 15], 9,  [0, 1]],
  ["duplicates",            [3, 3],         6,  [0, 1]],
  ["negatives",             [-1, -2, -3, -4], -6, [1, 3]],
  ["no element used twice", [3, 2, 4],      6,  [1, 2]],
  ["no answer",             [1, 2],         10, []],
  ["empty array",           [],             5,  []],
];
for (const [name, nums, target, want] of cases) {
  const got = twoSum(nums, target);
  console.log(JSON.stringify(got) === JSON.stringify(want) ? "pass" : "FAIL", name, got);
}
// pass the given example [ 0, 1 ]
// pass duplicates [ 0, 1 ]
// pass negatives [ 1, 3 ]
// pass no element used twice [ 1, 2 ]
// pass no answer []
// pass empty array []`;

const sortCode = `const nums = [10, 9, 1, 100];
console.log([...nums].sort());                // [ 1, 10, 100, 9 ]      default order compares TEXT: "10" < "9"
console.log([...nums].sort((a, b) => a - b)); // [ 1, 9, 10, 100 ]      a comparator fixes it
console.log(nums);                            // [ 10, 9, 1, 100 ]      the spread copied it, so the original is intact
nums.sort((a, b) => a - b);                   // sort() with no copy changes the array in place
console.log(nums);                            // [ 1, 9, 10, 100 ]
console.log(["b", "a", "c"].sort().join("")); // abc                    fine for single letters: text order is what we want`;

const equalityCode = `console.log(0 === -0);                  // true     === says they are equal
console.log(Object.is(0, -0));          // false    Object.is can tell them apart
console.log(0 * -5, Math.round(-0.4));  // -0 -0    -0 appears whenever a zero is multiplied by a negative
console.log(String(-0), JSON.stringify(-0)); // 0 0 it prints as a plain 0 in text, but console.log shows -0
console.log((-0) + 0, new Set([0, -0]).size); // 0 1   adding 0 normalises it; Set and Map treat them as one key

console.log(NaN === NaN);               // false    NaN is not equal to anything, itself included
console.log([NaN].includes(NaN));       // true     includes, Set and Map use "same value" logic...
console.log([NaN].indexOf(NaN));        // -1       ...but indexOf uses ===, so it never finds NaN
console.log(Number.isNaN(Number("abc")), Number.isNaN("abc"), isNaN("abc")); // true false true

console.log(0.1 + 0.2);                 // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3);         // false
console.log(Math.abs(0.1 + 0.2 - 0.3) < 1e-9); // true   compare floats with a tolerance, or work in whole cents`;

const keysCode = `const obj = {};
obj[1] = "number key";
obj["1"] = "string key";
console.log(Object.keys(obj).length);   // 1       an object turns every key into a string, so 1 and "1" collide

const map = new Map();
map.set(1, "number key");
map.set("1", "string key");
console.log(map.size);                  // 2       a Map keeps the type

const order = {};
order.b = 1; order[2] = 1; order[1] = 1;
console.log(Object.keys(order));        // [ '1', '2', 'b' ]   integer-like keys jump to the front, sorted: not insertion order
console.log("constructor" in {});       // true    an empty object already "has" inherited names such as constructor and toString

const byReference = new Map();
byReference.set([1, 2], "x");
console.log(byReference.get([1, 2]));   // undefined   arrays are compared by identity, not by contents

const visited = new Set();
visited.add(2 + "," + 3);               // build a text key for a pair such as a grid cell (row 2, column 3)
console.log(visited.has("2,3"));        // true`;

const bigCode = `console.log(Number.MAX_SAFE_INTEGER);   // 9007199254740991    this is 2^53 - 1
console.log(2 ** 53 + 1 === 2 ** 53);   // true     beyond it, whole numbers silently lose precision
console.log(12345678901234567890);      // 12345678901234567000
console.log(12345678901234567890n);     // 12345678901234567890n    a BigInt (the n suffix) stays exact

console.log((2 ** 31) | 0);             // -2147483648   bitwise operators work on 32-bit integers
console.log(5000000000 | 0);            // 705032704
console.log(1 << 31, 1 << 32);          // -2147483648 1

// "Return the answer modulo 1e9 + 7" with big factors: the multiplication itself can exceed 2^53.
const a = 999999999, b = 999999998, mod = 1000000007;
console.log((a * b) % mod);             // 70   wrong: a * b is about 1e18, already rounded
console.log(Number(BigInt(a) * BigInt(b) % BigInt(mod))); // 72   right: BigInt multiplies exactly`;

const holesCode = `const holes = [1, , 3];                 // a hole: the slot does not exist at all (not the same as undefined)
console.log(holes.length, 1 in holes);  // 3 false
console.log(holes.map((x) => x * 2));   // [ 2, <1 empty item>, 6 ]   map, forEach and friends skip holes
console.log(new Array(3).map((_, i) => i)); // [ <3 empty items> ]    so this "fill with 0..2" does nothing
console.log(new Array(3).fill(0));      // [ 0, 0, 0 ]
console.log(Array.from({ length: 3 }, (_, i) => i)); // [ 0, 1, 2 ]   the safe way to build an array from an index`;

const recursionCode = `function countDown(n) { return n === 0 ? 0 : 1 + countDown(n - 1); }

console.log(countDown(1000));           // 1000
try {
  countDown(100000);
} catch (e) {
  console.log(e instanceof RangeError, e.message); // true Maximum call stack size exceeded
}

// The same walk with your own array as the stack never hits that limit.
function countDownLoop(n) {
  const stack = [n];
  let steps = 0;
  while (stack.length) {
    const v = stack.pop();
    if (v > 0) { steps++; stack.push(v - 1); }
  }
  return steps;
}
console.log(countDownLoop(100000));     // 100000`;

const queueCode = `// A queue as an array: advance a head index instead of calling shift().
const queue = [1, 2, 3];
let head = 0;
const order = [];
while (head < queue.length) {
  const x = queue[head++];              // O(1) dequeue
  order.push(x);
  if (x < 3) queue.push(x + 10);        // new work joins the back, exactly as in BFS
}
console.log(order);                     // [ 1, 2, 3, 11, 12 ]`;

const swapCode = `let x = 1, y = 2;
[x, y] = [y, x];                        // swap with no temporary variable
console.log(x, y);                      // 2 1

const arr = [5, 6, 7];
[arr[0], arr[2]] = [arr[2], arr[0]];    // swap two array slots: the heart of reverse, partition and permutations
console.log(arr);                       // [ 7, 6, 5 ]

const [first, ...rest] = [1, 2, 3];
console.log(first, rest);               // 1 [ 2, 3 ]`;

const gridCode = `const bad = Array(3).fill(Array(3).fill(0));    // fill puts the SAME inner array in every row
bad[0][0] = 1;
console.log(bad);                       // [ [ 1, 0, 0 ], [ 1, 0, 0 ], [ 1, 0, 0 ] ]

const good = Array.from({ length: 3 }, () => Array(3).fill(0));   // a fresh inner array per row
good[0][0] = 1;
console.log(good);                      // [ [ 1, 0, 0 ], [ 0, 0, 0 ], [ 0, 0, 0 ] ]

const grid = [[1, 2], [3, 4]];
const shallow = [...grid];              // copies the outer array only; the rows are shared
shallow[0][0] = 99;
console.log(grid[0][0]);                // 99

const rowsCopied = grid.map((row) => [...row]);   // one level deeper: a real copy of a 2-D array
rowsCopied[0][0] = 5;
console.log(grid[0][0]);                // 99   unchanged

const deep = structuredClone(grid);     // copies any depth (numbers, arrays, objects, Map, Set)
deep[0][0] = 7;
console.log(grid[0][0], deep[0][0]);    // 99 7`;

const timelineRows: string[][] = [
  ["0 – 5", "Clarify", "Restate the problem in your own words. Ask about input size, value ranges, duplicates, empty input, what to return.", "\"So I get an array of integers and must return the indices of two numbers adding up to target. Can there be negatives? Is exactly one answer guaranteed?\""],
  ["5 – 10", "Examples and edges", "Run the given example by hand, then invent one or two of your own: smallest input, duplicates, no answer.", "\"For [3,3] and target 6 the answer is [0,1]. For an empty array I would return an empty array.\""],
  ["10 – 17", "Brute force, then better", "Say the obvious solution and its cost, find what is wasteful, name the improvement, and ask if you may start.", "\"Brute force checks every pair: O(n²). The waste is searching for the partner each time; a map makes that O(1). Shall I go with the map?\""],
  ["17 – 32", "Code", "Write calmly, narrate each block, use clear names. Leave a helper unwritten if needed (\"I'll fill this in after\").", "\"I loop once; for each number I look for target minus it in the map, then store this number.\""],
  ["32 – 39", "Test", "Dry-run your code on the example and on an edge case, line by line, tracking variables. Fix what you find.", "\"i = 0, nums[0] = 2, needed 7, map is empty, store 2 → 0. i = 1, needed 2, found at 0, so return [0, 1].\""],
  ["39 – 42", "Complexity and alternatives", "Time and space, with what n means. Mention a trade-off or what you would do for sorted or huge input.", "\"O(n) time, O(n) space for the map. If memory mattered I could sort and use two pointers: O(n log n) time, O(1) extra space.\""],
  ["42 – 45", "Your questions", "Ask one or two real questions about the team or the work. Say thank you.", "\"What does a typical week look like for someone on this team?\""],
];

const clarifyRows: string[][] = [
  ["How big can the input be?", "Decides whether O(n²) is acceptable (n up to a few thousand) or you need O(n log n) or O(n) (n up to 100,000 or more).", "Lesson 12"],
  ["What are the value ranges? Negatives, zero, huge numbers?", "Negatives break sliding windows; huge numbers may overflow safe integers; zero breaks division tricks.", "Lessons 23, 24"],
  ["Can there be duplicates?", "Changes whether you need a Set or a Map of counts, and how to skip repeats.", "Lessons 10, 26"],
  ["Is the input sorted?", "Sorted input invites binary search or two pointers; unsorted may need a sort first.", "Lessons 21, 28"],
  ["What if the input is empty, or has one element?", "Tells you the base case and what the function must return.", "Lesson 11"],
  ["What should I return when there is no answer?", "-1, null, an empty array, or false: the interviewer chooses, so ask.", "Lesson 11"],
  ["May I modify the input? Do I need to preserve order?", "Allows in-place tricks (sinking an island, swapping), or forces a copy.", "Lesson 8"],
  ["Is there exactly one answer, or several (and do you want all of them)?", "One answer allows stopping early; many answers means collecting results.", "Lesson 33"],
];

const complexityRows: string[][] = [
  ["Say what n is", "\"n is the length of nums.\" In a grid: \"R rows, C columns\". In a graph: \"V vertices, E edges\".", "Complexities are meaningless without it."],
  ["Name the dominant cost", "\"Time is O(n log n) because the sort dominates; the loop after it is O(n).\"", "Shows you can find the bottleneck."],
  ["Count extra memory, including the stack", "\"Space is O(n) for the map. The recursion also uses O(h) stack, where h is the tree height.\"", "Interviewers often probe the hidden recursion stack."],
  ["Say best, average and worst when they differ", "\"A hash lookup is O(1) on average; quick sort is O(n log n) on average but O(n²) in the worst case.\"", "Lesson 12."],
  ["Offer one trade-off", "\"We could save memory by sorting in place, at the cost of O(n log n) time and losing the original order.\"", "Turns a number into a design discussion."],
];

const mistakeRows: string[][] = [
  ["Starting to code in the first minute", "You solve the wrong problem, or discover an edge case at minute 30.", "Spend the first 10 minutes on questions, examples and a plan."],
  ["Coding in silence", "The interviewer cannot give credit or hints for thinking they cannot hear.", "Narrate decisions in short sentences: what, then why."],
  ["Jumping to the clever solution and not mentioning brute force", "If the clever idea fails, you have nothing; and you lose the chance to show the improvement.", "Always say the brute force and its cost first, even in one sentence."],
  ["Short, cryptic names (a, m, t, x2)", "You will mix them up while dry-running under pressure.", "Use needed, indexOf, left, right, best."],
  ["Declaring \"done\" without testing", "A one-character bug (< vs <=) goes unnoticed.", "Always trace one example and one edge case through the code."],
  ["Testing only the example from the problem", "The example is chosen to work. Bugs live at the edges.", "Add empty input, one element, duplicates, negatives."],
  ["Going quiet and stuck for minutes", "Silence looks like panic and wastes time.", "Say what you tried and where it breaks. Ask for a hint at the 5-minute mark."],
  ["Arguing with a hint", "Interviewers give hints to help you pass.", "Say \"let me think about that\", try it, and report back."],
  ["Forgetting complexity until asked", "It is part of the answer, not a bonus question.", "State time and space before the interviewer has to ask."],
  ["Rewriting everything when you find a bug", "Costs minutes and adds new bugs.", "Point to the line, change that line, re-run the failing case."],
  ["Over-engineering (classes, generics, input validation)", "Fewer lines mean fewer bugs and faster dry runs.", "Write one function that solves the stated problem. Mention validation instead."],
];

const gotchaRows: string[][] = [
  ["-7 % 3", "-1", "The sign follows the left operand. For a non-negative result use ((x % m) + m) % m, which gives 2."],
  ["Math.floor(-7 / 2) and Math.trunc(-7 / 2)", "-4 and -3", "floor rounds down, trunc drops the fraction. They differ only for negatives."],
  ["Math.round(-2.5) and Math.round(2.5)", "-2 and 3", "Halves round toward +Infinity."],
  ["\"10\" < \"9\"", "true", "Two strings compare character by character as text. Convert with Number(...) first."],
  ["(2 ** 31 + 2 ** 31) >> 1", "0", "A shift converts to 32 bits first. Use Math.floor((lo + hi) / 2), which stays exact below 2^53."],
  ["Math.max() and Math.min() with no arguments", "-Infinity and Infinity", "Handy as starting values for \"best so far\", surprising on an empty array."],
  ["[].reduce((a, b) => a + b)", "TypeError", "Without an initial value, reduce on an empty array throws. Write reduce(fn, 0)."],
  ["Math.max(...hugeArray)", "RangeError", "Spreading hundreds of thousands of values into arguments overflows the stack (200,000 threw in Node 22). Use a loop."],
  ["for (const i in [5])", "i is the string \"0\"", "for…in walks keys as text. Use for…of for values, or an index loop."],
];

export default function DsaLessonFiftyNinePage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="why">The interview is a conversation</h2>
      <p>
        You now know the main data structures and patterns. A coding interview tests something extra: whether you can use them{" "}
        <em>with another person watching</em>, in about 45 minutes, on a problem you have not seen. Interviewers are not only
        asking &quot;did it pass?&quot; They are asking: Do I understand how this person thinks? Would I enjoy working with them?
        Do they notice problems before I point them out?
      </p>
      <p>
        That is good news, because thinking and communicating are skills you can rehearse. This lesson gives you a fixed routine to
        follow every single time, so that on interview day you spend your energy on the problem, not on deciding what to do next.
        The routine has six steps: <strong>clarify, examples, plan, code, test, analyse</strong>. We use{" "}
        <Link href="/dsa/lesson-26">Two Sum</Link> as the running example because you already know it.
      </p>

      <h2 id="timeline">The 45 minutes at a glance</h2>
      <DryRun
        title="a 45-minute interview, minute by minute"
        cols={["Minutes", "Phase", "What you do", "What you might say"]}
        rows={timelineRows}
        note="Real interviews start with a few minutes of introductions and end with your questions, so you often have about 35 minutes for the problem itself. Keep the proportions: roughly a third thinking, a third coding, a quarter testing and discussing."
      />
      <Callout kind="note" label="If you run short on time">
        Never drop the testing phase. A working solution of the brute force that you have tested is worth more than an unfinished
        optimal solution. If time is nearly out, say so: &quot;I won&apos;t finish the optimisation; here is how I would complete it.&quot;
      </Callout>

      <h2 id="clarify">Step 1: clarify the problem</h2>
      <p>
        Problem statements are deliberately short and a little vague. Asking questions is not a sign of weakness; it is the first
        thing a real engineer does with a ticket. First, <strong>restate the problem in your own words</strong> so that a
        misunderstanding shows up now, not at minute 30. Then ask the questions whose answers change your solution.
      </p>
      <DryRun
        title="the clarifying questions that matter most"
        cols={["Ask", "Why the answer changes your solution", "Where we covered it"]}
        rows={clarifyRows}
        note="Do not ask all eight every time. Pick the ones that are genuinely open. If the statement already says the array is sorted, do not ask. Lesson 11 has the full method for reading a problem."
      />

      <h2 id="examples">Step 2: examples and edge cases, out loud</h2>
      <p>
        Take the example from the problem and solve it by hand, saying each step: &quot;nums is 2, 7, 11, 15 and the target is 9;
        2 and 7 add up to 9, so the answer is indices 0 and 1.&quot; This proves you understood the statement, and the way you solved it by hand
        is often the algorithm.
      </p>
      <p>
        Then make up <strong>edge cases</strong>, the small awkward inputs where code breaks. A reliable checklist: the empty input, one
        element, two elements, all elements equal, duplicates, negatives and zero, already sorted, reverse sorted, the largest allowed
        size, and &quot;no answer exists&quot;. Say them aloud and write the expected answers beside them. You will reuse that list
        in step 5.
      </p>

      <h2 id="brute">Step 3: brute force, then optimise</h2>
      <p>
        Always state the <strong>brute force</strong> first, even if you can already see the better answer. It is correct by
        construction, it shows you can solve the problem, and it gives you a baseline cost to beat. Then ask: <em>where is the wasted
        work?</em> Usually the answer is one of a few things: you search for something that a map could look up (lesson 26), you recompute
        something a running total could keep (lesson 20), you scan a sorted range that binary search could halve (lesson 28), or you
        solve the same sub-problem many times (lesson 54).
      </p>
      <CodeBlock lang="js" code={bruteCode} />
      <p>
        Say it as a ladder: &quot;Brute force is O(n²) time. Sorting gets O(n log n) with O(1) extra space if I may reorder. A Set gets
        O(n) time for O(n) space. Which trade-off would you like?&quot; Offering the choice is a strong move. Then{" "}
        <strong>agree on the plan before you type</strong>: &quot;Does that approach sound reasonable to you?&quot;
      </p>

      <h2 id="clean">Step 4: clean code under time pressure</h2>
      <p>
        You are writing for two readers: the interviewer, and yourself in ten minutes when you must dry-run it. So:
      </p>
      <ul>
        <li>Write one function with a clear signature, in the shape the problem gave you.</li>
        <li>Choose meaningful names (<code>needed</code>, <code>left</code>, <code>best</code>), not <code>a</code>, <code>t</code>, <code>m</code>.</li>
        <li>Handle the special cases first with an early return, then the main logic.</li>
        <li>Narrate in blocks, not every token: &quot;now the loop that builds the map&quot;.</li>
        <li>Use built-ins you know well (<code>Map</code>, <code>Set</code>, <code>Math.max</code>); do not write a heap from memory unless asked, and say &quot;I would use a priority queue here&quot; if the language lacks one.</li>
        <li>If a helper is distracting, name it, use it, and write its body afterwards.</li>
      </ul>
      <CodeBlock lang="js" code={tidyCode} />

      <h2 id="test">Step 5: test with a dry run</h2>
      <p>
        When the code is written, do not say &quot;I think it works.&quot; <strong>Run it by hand</strong>, the same dry-run habit you built in
        lesson 1. Point at each line, say the value of each variable, and write the variables in a small table next to the code. Use three
        kinds of input: the problem&apos;s example, one edge case from step 2, and, if time allows, one case designed to break your
        particular idea (for Two Sum: the same number used twice).
      </p>
      <CodeBlock lang="js" code={testCode} />
      <p>
        Bugs you find yourself earn credit (&quot;good catch, that is an off-by-one&quot;); bugs the interviewer finds cost you. When you
        do find one, change the smallest thing, re-run only the case that failed, and then re-run the earlier ones to make sure
        nothing else broke.
      </p>

      <h2 id="complexity">Step 6: state time and space complexity</h2>
      <p>
        Give the analysis before being asked. A good answer has the same few parts every time:
      </p>
      <DryRun
        title="how to state complexity"
        cols={["Do this", "Example", "Why"]}
        rows={complexityRows}
        note="Rehearse one sentence in this shape: “Time is O(…) because …, space is O(…) because …, where n is …”."
      />
      <p>
        If the interviewer then asks &quot;can you do better?&quot;, they may be signalling that there is a better solution, or just
        testing how you react. Think aloud about the bottleneck: is it the sort? the lookup? the repeated work? You do not need to
        produce a miracle; explaining a lower bound (&quot;I must at least read every element, so O(n) time is the minimum&quot;) is also a good answer.
      </p>

      <h2 id="hints">Using hints well</h2>
      <p>
        Hints are normal. Almost every interviewer plans to give some, and what they watch is <em>how you use them</em>.
      </p>
      <ol>
        <li><strong>Get stuck out loud.</strong> Say what you have tried and where it fails: &quot;sorting loses the original indices, so I need a way to keep them&quot;. That is a precise question that deserves a precise nudge.</li>
        <li><strong>Ask for a direction, not the answer.</strong> &quot;Would you suggest I focus on the data structure or the algorithm?&quot;</li>
        <li><strong>Repeat the hint in your own words</strong> and say what it changes: &quot;So you are suggesting a map from value to index; then each lookup is O(1).&quot;</li>
        <li><strong>Do not take it personally.</strong> A hint at minute 15 costs far less than a silent dead end until minute 40.</li>
        <li><strong>Do not ignore it.</strong> If the interviewer mentions a data structure or a constraint, build on it immediately.</li>
      </ol>
      <Callout kind="ok" label="A rule of thumb">
        If you have made no progress for about five minutes, say so and ask for a hint. If you have a working but slow solution, say
        &quot;I have a correct O(n²) solution; I&apos;d like to improve it, may I think for a minute?&quot; Both are positive signals.
      </Callout>

      <h2 id="js">JavaScript-specific tips</h2>
      <p>
        JavaScript has a handful of behaviours that quietly ruin otherwise correct answers. Every sample below was run to check the printed
        values. Knowing them is a visible sign of experience.
      </p>

      <h3>sort() compares text by default</h3>
      <p>
        Without a comparator, <code>sort()</code> turns values into strings, so <code>10</code> sorts before <code>9</code>. Always pass{" "}
        <code>(a, b) =&gt; a - b</code> for numbers (lesson 18). It also sorts <strong>in place</strong>, so copy first with{" "}
        <code>[...arr]</code> if you must keep the original.
      </p>
      <CodeBlock lang="js" code={sortCode} />

      <h3>-0, NaN and decimals</h3>
      <p>
        Three values that break equality. <code>-0</code> is a real value that equals <code>0</code> under <code>===</code> but looks
        different to <code>Object.is</code> and to <code>console.log</code>; it appears from <code>0 * -5</code> and similar, and can fail an
        expected-output comparison. <code>NaN</code> is never equal to anything, including itself; use <code>Number.isNaN</code>. And
        decimals are binary fractions, so <code>0.1 + 0.2</code> is not <code>0.3</code>.
      </p>
      <CodeBlock lang="js" code={equalityCode} />

      <h3>Map and Set against plain objects</h3>
      <p>
        A plain object is fine for counting letters, but its keys are always strings, integer-like keys are reordered, and it
        inherits names like <code>constructor</code>. A <code>Map</code> keeps key types and insertion order. Neither compares arrays by
        content: build a text key such as <code>&quot;row,col&quot;</code> for pairs (lesson 10).
      </p>
      <CodeBlock lang="js" code={keysCode} />

      <h3>Integers: 2^53 and 32 bits</h3>
      <p>
        JavaScript numbers are 64-bit decimals (doubles). They never wrap around the way a 32-bit <code>int</code> does in Java or C++, but
        whole numbers are exact only up to <code>2^53 - 1</code>. Two traps follow. First, products and sums that pass that limit lose
        digits silently; use <code>BigInt</code> (or split the multiplication) for &quot;answer modulo 1e9 + 7&quot; questions. Second, the
        bitwise operators (<code>|</code>, <code>&amp;</code>, <code>^</code>, <code>&lt;&lt;</code>, <code>&gt;&gt;</code>) convert to 32 bits first, so they
        are the wrong tool for big values (lesson 58).
      </p>
      <CodeBlock lang="js" code={bigCode} />

      <h3>Array holes</h3>
      <p>
        <code>new Array(3)</code> makes three empty slots, not three <code>undefined</code> values, and methods such as{" "}
        <code>map</code> and <code>forEach</code> skip them. Build arrays with <code>fill</code> or <code>Array.from</code>. Holes also appear
        when you write <code>delete arr[i]</code> or assign to an index past the end.
      </p>
      <CodeBlock lang="js" code={holesCode} />

      <h3>Recursion depth is limited</h3>
      <p>
        Each call takes space on the call stack, and the engine caps it at roughly ten thousand frames for simple functions (about 9,600
        for the function below in Node 22; browsers and heavier functions differ). A recursion that goes n deep for n = 100,000, such as a
        DFS down a long chain, throws <code>RangeError</code>. In an interview, ask for the maximum depth; if it may reach 10^5, say you will
        convert to an explicit stack.
      </p>
      <CodeBlock lang="js" code={recursionCode} />

      <h3>shift() can be slow; use a head index</h3>
      <p>
        <code>queue.shift()</code> removes the first element and moves everything else down, so it can cost O(n) per call (engines optimise
        small arrays, but you cannot rely on it). Draining 100,000 elements with <code>shift</code> took over ten seconds in the check run for this lesson,
        against about a millisecond with an index. For BFS (lessons 39 and 50) advance a <code>head</code> index instead. The same goes for{" "}
        <code>unshift</code>, and for <code>splice</code> in the middle of a big array.
      </p>
      <CodeBlock lang="js" code={queueCode} />

      <h3>Destructuring swaps</h3>
      <p>
        <code>[a, b] = [b, a]</code> swaps without a temporary variable, and works on array slots. One trap: a line that starts
        with <code>[</code> continues the previous line if that line has no semicolon, so in a semicolon-free style the swap can throw
        or silently do something else. End the previous statement with <code>;</code>.
      </p>
      <CodeBlock lang="js" code={swapCode} />

      <h3>2-D arrays: fill and copying</h3>
      <p>
        The most common matrix bug: <code>Array(3).fill(Array(3).fill(0))</code> stores <em>one</em> inner array three times, so changing one
        row changes all of them. Build each row separately. Copying has the same shape: <code>[...grid]</code> is a shallow copy, so the
        rows are shared; copy each row, or use <code>structuredClone</code> for any depth (lesson 25).
      </p>
      <CodeBlock lang="js" code={gridCode} />

      <h3>Smaller gotchas, all checked</h3>
      <DryRun
        title="expressions that surprise people"
        cols={["Expression", "Result", "What to remember"]}
        rows={gotchaRows}
      />

      <h2 id="mistakes">Common mistakes</h2>
      <DryRun
        title="what loses offers, and the fix"
        cols={["Mistake", "Why it hurts", "Do this instead"]}
        rows={mistakeRows}
        note="Pick the two you recognise in yourself and practise the fix deliberately in your next five problems."
      />

      <h2 id="practice">Mock interview walk-throughs</h2>
      <p>
        These four are different from the practice questions in earlier lessons. Each is a <strong>script</strong>: the problem, the
        examples, the approaches, and, in the green box at the end, <strong>what you would say aloud at each phase</strong>. Read the problem,
        close the solutions, and try to narrate your own version first. Then compare.
      </p>
      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Recite the six steps (clarify, examples, plan, code, test, analyse) and roughly how many minutes each gets.</>,
          <>Write down five clarifying questions that apply to almost any array problem.</>,
          <>Say the brute-force-to-optimal ladder aloud for Two Sum, then for a different problem of your choice.</>,
          <>List six JavaScript gotchas from this lesson, with the one-line fix for each.</>,
          <>Explain why <code>Array(3).fill(Array(3).fill(0))</code> is a bug, and two ways to fix it.</>,
          <>Pick any earlier lesson&apos;s practice question and solve it on paper in 30 minutes, narrating aloud.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        The last lesson, <Link href="/dsa/lesson-60">Lesson 60</Link>, turns everything into a plan: a cheat sheet that links the wording of a
        problem to the right technique and lesson, an eight-week practice schedule, a spaced-repetition routine, and mock interviews where
        you must spot the pattern from the words alone.
      </p>
    </DsaLessonPage>
  );
}
