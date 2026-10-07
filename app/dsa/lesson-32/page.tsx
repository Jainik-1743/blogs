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
  { id: "styles", label: "Passing answers down vs returning answers up" },
  { id: "branching", label: "Many recursive calls" },
  { id: "power", label: "Fast power: a tree that is one straight line" },
  { id: "memo", label: "Preview: the cost of repeating work" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const fibCode = `function fib(n) {
  if (n <= 1) return n;          // base case: stop here
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
    t.step(1, "run", `call #${id}: fib(${n})`, `A new call starts. It is ${depth} level${depth === 1 ? "" : "s"} down in the tree (the first call is level 1). Calls so far: ${id}.`, { n, depth, calls: id }, "n");
    if (n <= 1) {
      t.step(2, "check", `fib(${n}) is a base case → returns ${n}`, "This call makes no more calls, so it is a leaf (an end point) of the recursion tree.", { n, depth, calls: id });
      return n;
    }
    const a = run(n - 1, depth + 1);
    const b = run(n - 2, depth + 1);
    t.step(5, "update", `fib(${n}) = ${a} + ${b} = ${a + b}`, `Both child calls have returned. This node adds their answers and gives the result to its parent (the call above it).`, { n, a, b, depth, calls });
    return a + b;
  };
  const result = run(4, 1);
  t.print(result);
  t.step(7, "print", "console.log(fib(4))", `The whole tree had ${calls} calls (nodes). fib(2) was worked out twice, and fib(1) three times.`, { result, calls });
  return t.steps;
}

const sumCode = `// Return-based: the answer is built on the way back UP.
function sumReturn(arr, i = 0) {
  if (i === arr.length) return 0;            // nothing left to add
  return arr[i] + sumReturn(arr, i + 1);     // my value + the sum of the rest
}

// Parameter-based: the answer is carried DOWN and given back at the bottom.
function sumParam(arr, i = 0, total = 0) {
  if (i === arr.length) return total;        // the total we collected is the answer
  return sumParam(arr, i + 1, total + arr[i]);
}

console.log(sumReturn([3, 1, 4])); // 8
console.log(sumParam([3, 1, 4]));  // 8`;

const collectCode = `// Parameter-based with one shared result list: common when you must list everything.
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
  if (n < 0) return 1 / myPow(x, -n);       // a negative power means 1 divided by the positive power
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
  if (memo.has(n)) return memo.get(n);        // already solved: reuse the answer
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
        Lesson 14 taught recursion as &ldquo;a function that calls itself on a smaller problem&rdquo;. Part 8 builds on this, so you
        need one more picture: the <strong>recursion tree</strong>. It is like a family tree. Draw every call as a <strong>node</strong> (a dot or box). Draw an arrow
        from a call to each call it makes. These are its <strong>children</strong>. The first call is the <strong>root</strong>. Calls
        that stop at the base case (the simplest case, which needs no more calls) are the <strong>leaves</strong>.
      </p>
      <p>
        Once you can draw that tree, three questions become easy. <em>What does this function return?</em> Read the leaves, then
        combine the answers going up. <em>How long does it take?</em> Count the nodes. <em>How much memory does it use?</em> Look at the height
        of the tree, because that is how many calls are open at the same time.
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
        To draw the tree, follow these steps. Write the first call. Below it, write each call it makes. Repeat this for every node that is not a base
        case. At the leaves, write the base-case value. Then work back up. The value of each node is made from its
        children (here, the sum of the two).
      </p>

      <h2 id="trace">Traced: the calls of fib(4)</h2>
      <CodeTrace
        code={traceSrc}
        steps={fibTrace()}
        caption="Calls run in depth-first order: go all the way down the left branch, come back up, then do the right branch."
      />
      <Callout kind="note" label="Depth-first order">
        The order in the trace shows how the call stack works. The call stack is the pile of calls that are waiting to finish, like a stack of plates. The left child runs to the end and returns before the right
        child starts. At any moment, only the calls on the <em>path from the root to the current node</em> are open.
      </Callout>

      <h2 id="cost">Reading cost off the tree</h2>
      <DryRun
        title="What the tree tells you"
        cols={["Question", "Look at…", "fib(4)"]}
        rows={[
          ["Time", "the number of nodes × work per node", "9 nodes × O(1) = 9 steps"],
          ["Space (stack)", "the height of the tree", "height 4 → at most 4 open calls"],
          ["Branching factor (how many branches each node has)", "children per node", "2"],
          ["Leaves", "base cases reached", "5 (three fib(1), two fib(0))"],
        ]}
        note="For the call stack, the space is the height, not the number of nodes. Calls that have already returned are gone."
      />
      <p>
        <strong>General rule:</strong> if each call makes <code>b</code> calls and the tree has height <code>h</code>, there are
        about <code>b<sup>h</sup></code> nodes. Fibonacci makes 2 calls each time and has height n, so the tree has about 2<sup>n</sup>{" "}
        nodes. That means <strong>O(2<sup>n</sup>) time</strong> (the time doubles every time n grows by 1) and O(n) space. A function that makes <em>one</em> call per level over n
        levels (like the sum below) has n nodes, so it takes O(n) time and O(n) space.
      </p>

      <h2 id="styles">Passing answers down vs returning answers up</h2>
      <p>Information can travel through the tree in two ways.</p>
      <ul>
        <li><strong>Return-based:</strong> each call <em>returns</em> its answer, and the parent combines the answers. The answer is built on the way <em>up</em>. (Examples: sum, Fibonacci, tree height.)</li>
        <li><strong>Parameter-based:</strong> each call receives what has been decided so far as <em>parameters</em> (the values you pass in). The answer is complete at the bottom. The answer travels <em>down</em>. (Examples: a running total, the current path, a result list shared by all calls.)</li>
      </ul>
      <CodeBlock lang="js" code={sumCode} />
      <p>
        You will use parameter-based recursion when you need to list things, such as all subsets or all permutations (the next two
        lessons). The parameters hold the choices made so far. At a leaf, you save the finished choice.
      </p>
      <CodeBlock lang="js" code={collectCode} />

      <h2 id="branching">Many recursive calls</h2>
      <p>
        When a function makes <strong>two or more</strong> recursive calls per node, the tree spreads out like a fan. There are two cases.
      </p>
      <ul>
        <li><strong>Independent subproblems</strong> (merge sort cuts the array into two halves): the pieces do not overlap, so the total work stays small: O(n log n).</li>
        <li><strong>Overlapping subproblems</strong> (Fibonacci): the same sub-tree appears many times, so you do the same work again and again. Memoisation (remembering answers you already worked out, Part 14) removes this repeated work.</li>
      </ul>
      <p>
        <em>Tower of Hanoi</em> is the classic puzzle with 2 calls per node and no overlap. To move n disks, first move n − 1 disks out of the
        way. Then move the big disk. Then move the n − 1 disks back on top. The tree has 2<sup>n</sup> − 1 nodes, one per move, so the number of
        moves is exactly 2<sup>n</sup> − 1 (Practice question 4).
      </p>

      <h2 id="power">Fast power: a tree that is one straight line</h2>
      <p>
        To work out x<sup>n</sup> (x multiplied by itself n times), the simple way takes n steps. But x<sup>n</sup> = (x<sup>n/2</sup>)². So make{" "}
        <strong>one</strong> recursive call on half the exponent (the small number n) and reuse its result. The tree is then one chain of about{" "}
        log₂ n calls. (log₂ n means how many times you can halve n before you reach 1.)
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
        note="Five calls instead of ten multiplications. For n = 1,000,000 it is about 20 calls instead of a million."
      />
      <Callout kind="warn" label="Call it once, not twice">
        If you write <code>myPow(x, n/2) * myPow(x, n/2)</code>, you make <strong>two</strong> calls per level. Then the tree has n leaves
        and you are back to O(n). Save the half result in a variable and use that variable twice.
      </Callout>

      <h2 id="memo">Preview: the cost of repeating work</h2>
      <p>
        Let us count the calls. The simple Fibonacci tree for <code>fib(30)</code> has <strong>2,692,537</strong> nodes. If you remember each
        answer the first time you work it out, the tree shrinks to <strong>59</strong> nodes.
      </p>
      <CodeBlock lang="js" code={countCode} />
      <p>
        This is <strong>memoisation</strong>. It is a Map (a lookup table) from the inputs to the answer, and you check it at the top of the function. It
        helps whenever the same call can appear in more than one place in the tree. You will learn it fully in Part 14. For
        now, just see that the recursion tree shows you <em>when</em> it will help: look for sub-trees that appear more than once.
      </p>

      <h2 id="practice">Practice questions</h2>
      <p>For every question, draw the tree for a very small input before you write any code.</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Draw the recursion tree of fib(5) from memory and count its nodes.</>,
          <>Say how you read the time and the space from a recursion tree.</>,
          <>Explain the difference between parameter-based and return-based recursion. Give one example of each.</>,
          <>Explain why fast power calls itself only once, and what happens if it calls itself twice.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        With recursion trees you can see how a function explores all the options. <strong>Lesson 33</strong> uses a tree whose branches are{" "}
        <em>choices</em>: pick an item or skip it. The leaves of that tree are all the subsets, permutations and combinations.
      </p>
    </DsaLessonPage>
  );
}
