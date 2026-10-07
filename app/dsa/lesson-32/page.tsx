import type { Metadata } from "next";
import Callout from "@/components/Callout";
import CodeTrace from "@/components/dsa/CodeTrace";
import DryRun from "@/components/dsa/DryRun";
import DsaLessonPage from "@/components/dsa/DsaLesson";
import Questions from "./questions";
import Recall from "@/components/dsa/Recall";
import CodeBlock from "@/components/sd/CodeBlock";
import { getDsaLesson } from "@/lib/dsa";
import { tracer } from "@/lib/dsa-trace";

const lesson = getDsaLesson("lesson-32");

export const metadata: Metadata = {
  title: `Lesson 32 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Every call is a node" },
  { id: "draw", label: "Drawing a recursion tree" },
  { id: "trace", label: "Traced: the calls of fib(4)" },
  { id: "cost", label: "Reading cost off the tree" },
  { id: "styles", label: "Parameter-based vs return-based recursion" },
  { id: "branching", label: "Multiple recursive calls" },
  { id: "power", label: "Fast power: a tree that is a single line" },
  { id: "memo", label: "Preview: the cost of repeated work" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const fibCode = `function fib(n) {
  if (n <= 1) return n;          // base case
  return fib(n - 1) + fib(n - 2);   // two smaller problems
}
console.log(fib(4)); // 3`;

const traceSrc = `function fib(n) {
  if (n <= 1) return n;
  const a = fib(n - 1);
  const b = fib(n - 2);
  return a + b;
}
console.log(fib(4));`;

function fibTrace() {
  const t = tracer();
  let calls = 0;
  const run = (n: number, depth: number): number => {
    calls++;
    const id = calls;
    t.step(1, "run", `call #${id}: fib(${n})`, `A new call starts, ${depth} level${depth === 1 ? "" : "s"} below fib(4). Calls so far: ${id}.`, { n, depth, calls: id }, "n");
    if (n <= 1) {
      t.step(2, "check", `fib(${n}) is a base case → returns ${n}`, "No more calls: this is a leaf of the recursion tree.", { n, depth, calls: id });
      return n;
    }
    const a = run(n - 1, depth + 1);
    const b = run(n - 2, depth + 1);
    t.step(5, "update", `fib(${n}) = ${a} + ${b} = ${a + b}`, `Both children have returned; this node combines their answers and returns to its parent.`, { n, a, b, depth, calls });
    return a + b;
  };
  const result = run(4, 1);
  t.print(result);
  t.step(7, "print", "console.log(fib(4))", `The whole tree had ${calls} calls (nodes). fib(2) was computed twice, and fib(1) three times.`, { result, calls });
  return t.steps;
}

const sumCode = `// Return-based: the answer is built on the way BACK up.
function sumReturn(arr, i = 0) {
  if (i === arr.length) return 0;            // nothing left to add
  return arr[i] + sumReturn(arr, i + 1);     // my value + the sum of the rest
}

// Parameter-based: the answer is carried DOWN and handed back at the bottom.
function sumParam(arr, i = 0, total = 0) {
  if (i === arr.length) return total;        // the accumulated total is the answer
  return sumParam(arr, i + 1, total + arr[i]);
}

console.log(sumReturn([3, 1, 4])); // 8
console.log(sumParam([3, 1, 4]));  // 8`;

const collectCode = `// Parameter-based with a shared result list: typical for "generate everything" problems.
function evensUpTo(n) {
  const out = [];
  (function go(i) {
    if (i > n) return;
    if (i % 2 === 0) out.push(i);
    go(i + 1);
  })(0);
  return out;
}

console.log(evensUpTo(7)); // [0, 2, 4, 6]`;

const powerCode = `function myPow(x, n) {
  if (n < 0) return 1 / myPow(x, -n);       // a negative power is the reciprocal
  if (n === 0) return 1;                    // base case: x^0 = 1
  const half = myPow(x, Math.floor(n / 2)); // ONE call on half the size
  return n % 2 === 0 ? half * half : half * half * x;
}

console.log(myPow(2, 10));  // 1024
console.log(myPow(2, -2));  // 0.25
console.log(myPow(2, 31));  // 2147483648`;

const countCode = `let calls = 0;
function fibNaive(n) {
  calls++;
  return n <= 1 ? n : fibNaive(n - 1) + fibNaive(n - 2);
}
console.log(fibNaive(20), calls); // 6765 21891

calls = 0;
const memo = new Map();
function fibMemo(n) {
  calls++;
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n);        // already solved: reuse it
  const value = fibMemo(n - 1) + fibMemo(n - 2);
  memo.set(n, value);
  return value;
}
console.log(fibMemo(30), calls); // 832040 59`;

export default function DsaLessonThirtyTwoPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">Every call is a node</h2>
      <p>
        Lesson 14 taught recursion as &ldquo;a function that calls itself on a smaller problem&rdquo;. Part 8 builds on it, so you
        need one more picture: the <strong>recursion tree</strong>. Draw every call as a <strong>node</strong>; draw an arrow
        from a call to each call it makes (its <strong>children</strong>). The first call is the <strong>root</strong>; calls
        that stop at the base case are the <strong>leaves</strong>.
      </p>
      <p>
        Once you can draw that tree, three questions become easy: <em>what does this function return</em> (read the leaves, then
        combine upwards), <em>how long does it take</em> (count the nodes), and <em>how much memory does it use</em> (the height
        of the tree, because that is how many calls are open at once).
      </p>

      <h2 id="draw">Drawing a recursion tree</h2>
      <p>For Fibonacci, each call makes two children: <code>fib(n − 1)</code> and <code>fib(n − 2)</code>.</p>
      <CodeBlock lang="js" code={fibCode} />
      <CodeBlock
        lang="text"
        code={`                    fib(4)
                  /        \\
             fib(3)          fib(2)
            /      \\        /     \\
        fib(2)    fib(1)  fib(1)  fib(0)
        /    \\
    fib(1)  fib(0)`}
      />
      <p>
        Drawing steps: write the first call; below it, write each call it makes; repeat for every node that is not a base
        case. At the leaves write the base-case value, then work back up: each node&apos;s value is the combination of its
        children (here, their sum).
      </p>

      <h2 id="trace">Traced: the calls of fib(4)</h2>
      <CodeTrace
        code={traceSrc}
        steps={fibTrace()}
        caption="Calls happen in depth-first order: go all the way down the left branch, come back up, then try the right."
      />
      <Callout kind="note" label="Depth-first order">
        The order in the trace is how the call stack behaves: the left child runs to completion (and returns) before the right
        child starts. Only the calls on the <em>path from the root to the current node</em> are open at any moment.
      </Callout>

      <h2 id="cost">Reading cost off the tree</h2>
      <DryRun
        title="what the tree tells you"
        cols={["Question", "Look at…", "fib(4)"]}
        rows={[
          ["Time", "the number of nodes × work per node", "9 nodes × O(1) = 9 steps"],
          ["Space (stack)", "the height of the tree", "height 4 → at most 4 open calls"],
          ["Branching factor", "children per node", "2"],
          ["Leaves", "base cases reached", "5 (three fib(1), two fib(0))"],
        ]}
        note="For the call stack, space is the height, not the number of nodes. Calls that have returned are gone."
      />
      <p>
        <strong>General rule:</strong> if each call makes <code>b</code> calls and the tree has height <code>h</code>, there are
        about <code>b<sup>h</sup></code> nodes. Fibonacci branches by 2 and has height n, so the tree has about 2<sup>n</sup>{" "}
        nodes: <strong>O(2<sup>n</sup>) time</strong> and O(n) space. A function that makes <em>one</em> call per level over n
        levels (like the sum below) has n nodes: O(n) time and O(n) space.
      </p>

      <h2 id="styles">Parameter-based vs return-based recursion</h2>
      <p>There are two ways for information to travel through the tree:</p>
      <ul>
        <li><strong>Return-based</strong> — each call <em>returns</em> its answer and the parent combines them. The answer is built on the way <em>up</em>. (Sum, Fibonacci, tree height.)</li>
        <li><strong>Parameter-based</strong> — each call receives what has been decided so far as <em>parameters</em>, and the answer is complete at the bottom. The answer travels <em>down</em>. (Running totals, the current path, a result list shared by all calls.)</li>
      </ul>
      <CodeBlock lang="js" code={sumCode} />
      <p>
        Parameter-based recursion is the one you will use for generating things (all subsets, all permutations — the next two
        lessons): the parameters hold the choices made so far, and at a leaf you save the finished choice.
      </p>
      <CodeBlock lang="js" code={collectCode} />

      <h2 id="branching">Multiple recursive calls</h2>
      <p>
        When a function makes <strong>two or more</strong> recursive calls per node, the tree fans out. Two situations:
      </p>
      <ul>
        <li><strong>Independent subproblems</strong> (merge sort splits the array into two halves): the pieces do not overlap, so the work adds up sensibly: O(n log n).</li>
        <li><strong>Overlapping subproblems</strong> (Fibonacci): the same sub-tree appears many times, so you do the same work again and again. That is exactly what memoisation (Part 14) removes.</li>
      </ul>
      <p>
        <em>Tower of Hanoi</em> is the classic branching-by-two tree with no overlap: to move n disks, move n − 1 out of the
        way, move the big one, then move n − 1 back on top. The tree has 2<sup>n</sup> − 1 nodes, one per move, so the number of
        moves is exactly 2<sup>n</sup> − 1 (Practice question 4).
      </p>

      <h2 id="power">Fast power: a tree that is a single line</h2>
      <p>
        To compute x<sup>n</sup>, multiplying x by itself n times needs n steps. But x<sup>n</sup> = (x<sup>n/2</sup>)². Make{" "}
        <strong>one</strong> recursive call on half the exponent and reuse its result: the tree is a single chain of length{" "}
        log₂ n.
      </p>
      <CodeBlock lang="js" code={powerCode} />
      <DryRun
        title="myPow(2, 10): the chain of calls"
        cols={["Call", "n", "half = result of…", "Returns"]}
        rows={[
          ["myPow(2, 10)", "10 (even)", "myPow(2, 5)", "32 × 32 = 1024"],
          ["myPow(2, 5)", "5 (odd)", "myPow(2, 2)", "4 × 4 × 2 = 32"],
          ["myPow(2, 2)", "2 (even)", "myPow(2, 1)", "2 × 2 = 4"],
          ["myPow(2, 1)", "1 (odd)", "myPow(2, 0)", "1 × 1 × 2 = 2"],
          ["myPow(2, 0)", "0", "(base case)", "1"],
        ]}
        note="Five calls instead of ten multiplications; for n = 1,000,000 it is about 20 calls instead of a million."
      />
      <Callout kind="warn" label="Call it once, not twice">
        Writing <code>myPow(x, n/2) * myPow(x, n/2)</code> makes <strong>two</strong> calls per level, so the tree has n leaves
        and you are back to O(n). Store the half in a variable and use it twice.
      </Callout>

      <h2 id="memo">Preview: the cost of repeated work</h2>
      <p>
        Count the calls. The naive Fibonacci tree for <code>fib(30)</code> has <strong>2,692,537</strong> nodes. Remember each
        answer the first time you compute it, and the tree shrinks to <strong>59</strong>:
      </p>
      <CodeBlock lang="js" code={countCode} />
      <p>
        This is <strong>memoisation</strong>: a Map from the arguments to the answer, checked at the top of the function. It
        works whenever the same call can appear in more than one place in the tree. You will use it properly in Part 14; for
        now just notice that the recursion tree shows you <em>when</em> it will help — look for repeated sub-trees.
      </p>

      <h2 id="practice">Practice questions</h2>
      <p>For every question, draw the tree for a tiny input before you write any code.</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Draw the recursion tree of fib(5) from memory and count its nodes.</>,
          <>State how time and space are read from a recursion tree.</>,
          <>Explain the difference between parameter-based and return-based recursion, with an example of each.</>,
          <>Explain why fast power calls itself once, and what happens if it calls itself twice.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        With recursion trees you can see how a function explores. <strong>Lesson 33</strong> uses a tree whose branches are{" "}
        <em>choices</em>: pick or skip an item, and the leaves are all subsets, permutations and combinations.
      </p>
    </DsaLessonPage>
  );
}
