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
  { id: "brute", label: "Step 3: brute force, then make it faster" },
  { id: "clean", label: "Step 4: clean code when time is short" },
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
  ["0 – 5", "Clarify", "Say the problem again in your own words. Ask about input size, value ranges, duplicates, empty input, and what to return.", "\"So I get an array of integers and must return the indices of two numbers adding up to target. Can there be negatives? Is exactly one answer guaranteed?\""],
  ["5 – 10", "Examples and edges", "Work through the given example by hand. Then make up one or two of your own: the smallest input, duplicates, no answer.", "\"For [3,3] and target 6 the answer is [0,1]. For an empty array I would return an empty array.\""],
  ["10 – 17", "Brute force, then better", "Say the obvious solution and what it costs. Find what is wasteful. Name the improvement and ask if you may start.", "\"Brute force checks every pair: O(n²). The waste is searching for the partner each time. A map makes that O(1). Shall I go with the map?\""],
  ["17 – 32", "Code", "Write calmly, say what each part does, and use clear names. You may leave a small helper for later (\"I'll fill this in after\").", "\"I loop once. For each number I look for target minus that number in the map, then I store this number.\""],
  ["32 – 39", "Test", "Do a dry run (follow your code by hand) on the example and on an edge case. Go line by line and track the variables. Fix what you find.", "\"i = 0, nums[0] = 2, needed 7, map is empty, store 2 → 0. i = 1, needed 2, found at 0, so return [0, 1].\""],
  ["39 – 42", "Complexity and alternatives", "Say the time and the memory, and what n means. Mention a trade-off, or what you would do for sorted or huge input.", "\"O(n) time and O(n) memory for the map. If memory mattered, I could sort a copy of the pairs (value, index) and use two pointers. That is O(n log n) time, and it still needs O(n) memory for the pairs.\""],
  ["42 – 45", "Your questions", "Ask one or two real questions about the team or the work. Say thank you.", "\"What does a typical week look like for someone on this team?\""],
];

const clarifyRows: string[][] = [
  ["How big can the input be?", "Tells you if O(n²) is fine (n up to a few thousand), or if you need O(n log n) or O(n) (n up to 100,000 or more).", "Lesson 12"],
  ["What are the value ranges? Negatives, zero, huge numbers?", "Negatives break sliding windows. Huge numbers may be too big to stay exact. Zero breaks division tricks.", "Lessons 23, 24"],
  ["Can there be duplicates?", "Decides if you need a Set or a Map of counts, and how to skip repeats.", "Lessons 10, 26"],
  ["Is the input sorted?", "Sorted input suggests binary search or two pointers. Unsorted input may need a sort first.", "Lessons 21, 28"],
  ["What if the input is empty, or has one element?", "Tells you the base case (the simplest case) and what the function must return.", "Lesson 11"],
  ["What should I return when there is no answer?", "It could be -1, null, an empty array or false. The interviewer decides, so ask.", "Lesson 11"],
  ["May I modify the input? Do I need to preserve order?", "If yes, you can change the data in place (sink an island, swap). If no, you must make a copy.", "Lesson 8"],
  ["Is there exactly one answer, or several (and do you want all of them)?", "With one answer you can stop early. With many answers you must collect them all.", "Lesson 33"],
];

const complexityRows: string[][] = [
  ["Say what n is", "\"n is the length of nums.\" In a grid: \"R rows, C columns\". In a graph: \"V vertices (points), E edges (links)\".", "A complexity means nothing if you do not say what n is."],
  ["Name the biggest cost", "\"Time is O(n log n) because the sort is the slowest part. The loop after it is only O(n).\"", "Shows you can find the slowest part (the bottleneck)."],
  ["Count extra memory, including the call stack", "\"Memory is O(n) for the map. The recursion also uses O(h) call stack, where h is the tree height.\"", "Interviewers often ask about the hidden memory that recursion uses."],
  ["Say best, average and worst case when they differ", "\"A hash lookup is O(1) on average. Quick sort is O(n log n) on average but O(n²) in the worst case.\"", "Lesson 12."],
  ["Offer one trade-off", "\"We could save memory by sorting in place. The cost is O(n log n) time, and we lose the original order.\"", "Turns a single number into a talk about design choices."],
];

const mistakeRows: string[][] = [
  ["Starting to code in the first minute", "You may solve the wrong problem, or find an edge case at minute 30.", "Spend the first 10 minutes on questions, examples and a plan."],
  ["Coding in silence", "The interviewer cannot give you credit or hints for thinking they cannot hear.", "Say your decisions in short sentences: first what, then why."],
  ["Jumping to the clever solution and never mentioning brute force", "If the clever idea fails, you have nothing. You also lose the chance to show how you improved the answer.", "Always say the brute force and its cost first, even if it is one sentence."],
  ["Short, unclear names (a, m, t, x2)", "You will mix them up when you do a dry run and feel stressed.", "Use needed, indexOf, left, right, best."],
  ["Saying \"done\" without testing", "A one-character bug (< instead of <=) goes unseen.", "Always follow one example and one edge case through the code."],
  ["Testing only the example from the problem", "The example is chosen so that it works. Bugs hide at the edges.", "Add empty input, one element, duplicates and negatives."],
  ["Going quiet and staying stuck for minutes", "Silence looks like panic, and it wastes time.", "Say what you tried and where it fails. Ask for a hint after about 5 minutes."],
  ["Arguing with a hint", "Interviewers give hints to help you do well.", "Say \"let me think about that\", try the hint, and tell them what happened."],
  ["Forgetting to talk about complexity until asked", "It is part of the answer. It is not an extra question.", "Say the time and memory cost before the interviewer has to ask."],
  ["Rewriting everything when you find a bug", "It costs minutes and adds new bugs.", "Point to the line, change that line, and run the failing case again."],
  ["Making it too complicated (classes, generics, input checks)", "Fewer lines mean fewer bugs and faster dry runs.", "Write one function that solves the problem as stated. Mention input checks instead of writing them."],
];

const gotchaRows: string[][] = [
  ["-7 % 3", "-1", "The result has the sign of the left number. For a result that is never negative, use ((x % m) + m) % m, which gives 2."],
  ["Math.floor(-7 / 2) and Math.trunc(-7 / 2)", "-4 and -3", "floor rounds down. trunc cuts off the fraction. They differ only for negative numbers."],
  ["Math.round(-2.5) and Math.round(2.5)", "-2 and 3", "A half is rounded towards +Infinity (up)."],
  ["\"10\" < \"9\"", "true", "Two strings are compared character by character, as text. Convert them with Number(...) first."],
  ["(2 ** 31 + 2 ** 31) >> 1", "0", "A shift first turns the number into 32 bits. Use Math.floor((lo + hi) / 2) instead. It stays exact below 2^53."],
  ["Math.max() and Math.min() with no arguments", "-Infinity and Infinity", "Handy as starting values for \"best so far\", but surprising on an empty array."],
  ["[].reduce((a, b) => a + b)", "TypeError", "Without a starting value, reduce on an empty array gives an error. Write reduce(fn, 0)."],
  ["Math.max(...hugeArray)", "RangeError", "Spreading hundreds of thousands of values into arguments uses up the call stack (150,000 values failed in Node 22, 125,000 still worked; the limit differs between engines). Use a loop."],
  ["for (const i in [5])", "i is the string \"0\"", "for…in walks the keys as text. Use for…of to get the values, or use an index loop."],
];

export default function DsaLessonFiftyNinePage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="why">The interview is a conversation</h2>
      <p>
        You now know the main data structures and patterns. A coding interview tests one more thing. Can you use them{" "}
        <em>while another person watches</em>, in about 45 minutes, on a problem you have not seen before? Interviewers do not only
        ask &quot;did the code pass?&quot; They also ask: Can I follow how this person thinks? Would I enjoy working with them?
        Do they notice problems before I point them out?
      </p>
      <p>
        That is good news, because thinking and speaking clearly are skills you can practise. This lesson gives you a fixed routine
        to follow every time. On interview day you can then spend your energy on the problem, and not on deciding what to do next.
        The routine has six steps: <strong>clarify, examples, plan, code, test, analyse</strong>. We use{" "}
        <Link href="/dsa/lesson-26">Two Sum</Link> as our example all the way through, because you already know it.
      </p>

      <h2 id="timeline">The 45 minutes at a glance</h2>
      <DryRun
        title="a 45-minute interview, minute by minute"
        cols={["Minutes", "Phase", "What you do", "What you might say"]}
        rows={timelineRows}
        note="Real interviews start with a few minutes of introductions and end with your questions. So you often have only about 35 minutes for the problem itself. Keep the same balance: roughly a third of the time for questions and planning, a third for coding, and the rest for testing and talking."
      />
      <Callout kind="note" label="If you run short on time">
        Never skip the testing step. A brute-force answer that works and that you have tested is worth more than a faster answer that
        is not finished. If time is almost over, say so: &quot;I won&apos;t finish the faster version. Here is how I would finish it.&quot;
      </Callout>

      <h2 id="clarify">Step 1: clarify the problem</h2>
      <p>
        Problem statements are short and a little vague on purpose. Asking questions is not a sign of weakness. It is the first thing
        a real engineer does with a new task. First, <strong>say the problem again in your own words</strong>. Then a
        misunderstanding shows up now, and not at minute 30. Next, ask the questions whose answers would change your solution.
      </p>
      <DryRun
        title="the clarifying questions that matter most"
        cols={["Ask", "Why the answer changes your solution", "Where we covered it"]}
        rows={clarifyRows}
        note="Do not ask all eight every time. Pick the ones that are really open. If the statement already says the array is sorted, do not ask. Lesson 11 has the full method for reading a problem."
      />

      <h2 id="examples">Step 2: examples and edge cases, out loud</h2>
      <p>
        Take the example from the problem and solve it by hand. Say each step out loud: &quot;nums is 2, 7, 11, 15 and the target is 9.
        2 and 7 add up to 9, so the answer is indices 0 and 1.&quot; This shows you understood the problem. The way you solved it by
        hand is often the algorithm itself.
      </p>
      <p>
        Then make up <strong>edge cases</strong>. These are small, odd inputs where code often breaks. Here is a checklist you can
        trust: empty input, one element, two elements, all elements equal, duplicates, negatives and zero, already sorted, sorted in
        reverse, the largest allowed size, and &quot;no answer exists&quot;. Say them out loud and write the expected answers next to
        them. You will use the same list again in step 5.
      </p>

      <h2 id="brute">Step 3: brute force, then optimise</h2>
      <p>
        Always say the <strong>brute force</strong> first, even if you already see a better answer. Brute force means trying every
        possibility in the simplest way. It is correct, it shows you can solve the problem, and it gives you a cost to beat. Then ask:{" "}
        <em>where is the wasted work?</em> It is usually one of these. You search for something that a map could look up (lesson 26).
        Or you work out again something that a running total could remember (lesson 20). Or you scan a sorted range that binary search
        could cut in half (lesson 28). Or you solve the same small problem many times (lesson 54).
      </p>
      <CodeBlock lang="js" code={bruteCode} />
      <p>
        Say it like climbing a ladder: &quot;Brute force is O(n²) time. Sorting gives O(n log n) time with O(1) extra memory, if I may
        change the order. A Set (a collection that remembers values and checks &quot;seen it?&quot; in O(1) time) gives O(n) time but uses O(n) memory. Which trade-off would you like?&quot; Offering the choice is a
        strong move. Then <strong>agree on the plan before you type</strong>: &quot;Does that approach sound reasonable to you?&quot;
      </p>

      <h2 id="clean">Step 4: clean code under time pressure</h2>
      <p>
        You write for two readers: the interviewer, and yourself ten minutes from now, when you must dry-run the code. So:
      </p>
      <ul>
        <li>Write one function with a clear name and inputs, in the same form the problem gave you.</li>
        <li>Choose names that mean something (<code>needed</code>, <code>left</code>, <code>best</code>), not <code>a</code>, <code>t</code>, <code>m</code>.</li>
        <li>Handle the special cases first with an early return (leave the function at once), then write the main logic.</li>
        <li>Explain in blocks, not word by word: &quot;now the loop that builds the map&quot;.</li>
        <li>Use built-in tools you know well (<code>Map</code>, <code>Set</code>, <code>Math.max</code>). Do not write a heap from memory unless asked. JavaScript has no built-in priority queue, so just say &quot;I would use a priority queue here&quot;.</li>
        <li>If a helper function slows you down, give it a name, use it, and write its body later.</li>
      </ul>
      <CodeBlock lang="js" code={tidyCode} />

      <h2 id="test">Step 5: test with a dry run</h2>
      <p>
        When the code is written, do not say &quot;I think it works.&quot; <strong>Run it by hand</strong>. This is the dry-run habit you
        built in lesson 1. Point at each line and say the value of each variable. Write the variables in a small table next to the code.
        Use three kinds of input. First, the example from the problem. Second, one edge case from step 2. Third, if you have time, one
        case made to break your idea (for Two Sum: the same number used twice).
      </p>
      <CodeBlock lang="js" code={testCode} />
      <p>
        If you find a bug yourself, you earn credit (&quot;good catch, that is an off-by-one&quot;, which means a mistake of 1 in a
        count or index). If the interviewer finds it, it costs you. When you find a bug, change the smallest thing. Run the case that
        failed. Then run the earlier cases again to check that nothing else broke.
      </p>

      <h2 id="complexity">Step 6: state time and space complexity</h2>
      <p>
        Give the analysis before you are asked. A good answer has the same few parts every time:
      </p>
      <DryRun
        title="how to state complexity"
        cols={["Do this", "Example", "Why"]}
        rows={complexityRows}
        note="Practise one sentence like this: “Time is O(…) because …, memory is O(…) because …, where n is …”."
      />
      <p>
        The interviewer may then ask &quot;can you do better?&quot; They may be hinting that a better solution exists, or they may just
        want to see how you react. Think out loud about the slowest part. Is it the sort? The lookup? The repeated work? You do not
        need to find a miracle. It is also a good answer to explain the lowest possible cost (&quot;I must at least read every element,
        so O(n) time is the minimum&quot;).
      </p>

      <h2 id="hints">Using hints well</h2>
      <p>
        Hints are normal. Almost every interviewer plans to give some. What they watch is <em>how you use them</em>.
      </p>
      <ol>
        <li><strong>Get stuck out loud.</strong> Say what you have tried and where it fails: &quot;sorting loses the original indices, so I need a way to keep them&quot;. That is a clear question, and it earns a clear hint.</li>
        <li><strong>Ask for a direction, not the answer.</strong> &quot;Should I think more about the data structure or about the algorithm?&quot;</li>
        <li><strong>Say the hint again in your own words</strong> and say what it changes: &quot;So you suggest a map from value to index. Then each lookup is O(1).&quot;</li>
        <li><strong>Do not feel bad about it.</strong> A hint at minute 15 costs far less than a silent dead end until minute 40.</li>
        <li><strong>Do not ignore it.</strong> If the interviewer mentions a data structure or a limit, use it straight away.</li>
      </ol>
      <Callout kind="ok" label="A rule of thumb">
        If you have made no progress for about five minutes, say so and ask for a hint. If you have a working but slow solution, say
        &quot;I have a correct O(n²) solution. I would like to improve it. May I think for a minute?&quot; Both are good signs to an interviewer.
      </Callout>

      <h2 id="js">JavaScript-specific tips</h2>
      <p>
        JavaScript has a few behaviours that can quietly break an answer that is otherwise correct. We ran every sample below to check
        the printed values. Knowing these behaviours shows that you have experience.
      </p>

      <h3>sort() compares text by default</h3>
      <p>
        If you give <code>sort()</code> no comparator (a small function that says which of two values comes first), it turns the values
        into strings. Then <code>10</code> sorts before <code>9</code>. For numbers, always pass <code>(a, b) =&gt; a - b</code>{" "}
        (lesson 18). It also sorts <strong>in place</strong>, which means it changes the original array. Copy first with{" "}
        <code>[...arr]</code> if you need to keep the original.
      </p>
      <CodeBlock lang="js" code={sortCode} />

      <h3>-0, NaN and decimals</h3>
      <p>
        Three kinds of values break the usual idea of &quot;equal&quot;. First, <code>-0</code> (negative zero) is a real value. It
        equals <code>0</code> under <code>===</code>, but <code>Object.is</code> and <code>console.log</code> treat it as different.
        It appears from <code>0 * -5</code> and similar sums, and it can make a check of the expected output fail. Second,{" "}
        <code>NaN</code> (&ldquo;not a number&rdquo;) is never equal to anything, even itself. Use <code>Number.isNaN</code> to test
        for it. Third, computers store decimals as binary fractions, so <code>0.1 + 0.2</code> is not exactly <code>0.3</code>.
      </p>
      <CodeBlock lang="js" code={equalityCode} />

      <h3>Map and Set against plain objects</h3>
      <p>
        A plain object is fine for counting letters. But its keys are always strings, keys that look like whole numbers get reordered,
        and it already has inherited names like <code>constructor</code>. A <code>Map</code> keeps the type of each key and the order in
        which you added them. Neither one compares arrays by their contents. For pairs, build a text key such as{" "}
        <code>&quot;row,col&quot;</code> (lesson 10).
      </p>
      <CodeBlock lang="js" code={keysCode} />

      <h3>Integers: 2^53 and 32 bits</h3>
      <p>
        JavaScript numbers are 64-bit decimal-style numbers (called doubles). They do not wrap around like a 32-bit <code>int</code>
        does in Java or C++. But whole numbers are exact only up to <code>2^53 - 1</code>. This leads to two traps. First, a product or
        sum above that limit loses digits, and nothing warns you. For &quot;give the answer modulo 1e9 + 7&quot; questions (the
        remainder after dividing by 1e9 + 7), use <code>BigInt</code> (a number type for very big whole numbers) or split the
        multiplication. Second, the bitwise operators (<code>|</code>, <code>&amp;</code>, <code>^</code>, <code>&lt;&lt;</code>,{" "}
        <code>&gt;&gt;</code>) first turn the number into 32 bits. So they are the wrong tool for big values (lesson 58).
      </p>
      <CodeBlock lang="js" code={bigCode} />

      <h3>Array holes</h3>
      <p>
        <code>new Array(3)</code> makes three empty slots (holes), not three <code>undefined</code> values. Methods such as{" "}
        <code>map</code> and <code>forEach</code> skip these holes. Build arrays with <code>fill</code> or <code>Array.from</code>.
        Holes also appear when you write <code>delete arr[i]</code> or assign to an index past the end of the array.
      </p>
      <CodeBlock lang="js" code={holesCode} />

      <h3>Recursion depth is limited</h3>
      <p>
        Each function call uses space on the call stack (the list of calls that are still waiting to finish). JavaScript limits this to
        about ten thousand calls for simple functions. In our test the function below reached about 10,900 calls in Node 22. Browsers and bigger functions
        give other numbers. A recursion that goes n = 100,000 calls deep, such as a depth-first search down a long chain, gives a{" "}
        <code>RangeError</code>. In an interview, ask for the maximum depth. If it can reach 10^5, say that you will switch to your own
        stack (an array that you push to and pop from).
      </p>
      <CodeBlock lang="js" code={recursionCode} />

      <h3>shift() can be slow; use a head index</h3>
      <p>
        <code>queue.shift()</code> removes the first element and moves all the others down by one. So it can cost O(n) for each call.
        (JavaScript engines speed this up for small arrays, but you cannot count on it.) In our test run for this lesson, emptying 100,000
        elements with <code>shift</code> took over ten seconds. With an index it took about a millisecond. For BFS (breadth-first search: visit everything one step away, then two steps away, and so on, using a queue;
        lessons 39 and 50), move a <code>head</code> index forward instead. The same advice applies to <code>unshift</code>, and to{" "}
        <code>splice</code> in the middle of a big array.
      </p>
      <CodeBlock lang="js" code={queueCode} />

      <h3>Destructuring swaps</h3>
      <p>
        <code>[a, b] = [b, a]</code> swaps two values without a temporary variable. It also works on array slots. There is one trap. A
        line that starts with <code>[</code> is joined to the line before it if that line has no semicolon. So if you write without
        semicolons, the swap can give an error or do something else without warning. End the line before it with <code>;</code>.
      </p>
      <CodeBlock lang="js" code={swapCode} />

      <h3>2-D arrays: fill and copying</h3>
      <p>
        The most common bug with grids: <code>Array(3).fill(Array(3).fill(0))</code> puts <em>one</em> inner array into all three rows.
        So changing one row changes all of them. Build each row separately. Copying has the same problem. <code>[...grid]</code> is a
        shallow copy. This means it copies only the outer array, and the rows are still shared. Copy each row, or use{" "}
        <code>structuredClone</code>, which copies at any depth (lesson 25).
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
        note="Pick the two that you know from yourself. Practise the fix on purpose in your next five problems."
      />

      <h2 id="practice">Mock interview walk-throughs</h2>
      <p>
        These four are different from the practice questions in earlier lessons. Each one is a <strong>script</strong>. It has the
        problem, the examples, the approaches, and a green box at the end with <strong>what you would say out loud at each step</strong>.
        Read the problem, close the solutions, and first try to say your own version out loud. Then compare.
      </p>
      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Say the six steps (clarify, examples, plan, code, test, analyse) and about how many minutes each one gets.</>,
          <>Write down five clarifying questions that fit almost any array problem.</>,
          <>Say the step-by-step path from brute force to the best answer out loud for Two Sum. Then do it for another problem you choose.</>,
          <>List six JavaScript surprises from this lesson, with a one-line fix for each.</>,
          <>Explain why <code>Array(3).fill(Array(3).fill(0))</code> is a bug. Give two ways to fix it.</>,
          <>Pick a practice question from any earlier lesson. Solve it on paper in 30 minutes and explain it out loud as you go.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        The last lesson, <Link href="/dsa/lesson-60">Lesson 60</Link>, turns everything into a plan. It has a cheat sheet that links the
        words of a problem to the right method and lesson. It has an eight-week practice schedule. It has a spaced-repetition routine
        (you review things again after longer and longer gaps). It also has mock interviews where you must spot the pattern from the
        words alone.
      </p>
    </DsaLessonPage>
  );
}
