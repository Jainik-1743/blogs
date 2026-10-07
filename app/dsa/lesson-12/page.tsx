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

const lesson = getDsaLesson("lesson-12");

export const metadata: Metadata = {
  title: `Lesson 12 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Why we count steps, not seconds" },
  { id: "counting", label: "Counting the steps of a loop" },
  { id: "notation", label: "Big-O: keep only what grows" },
  { id: "rates", label: "The growth rates you will meet" },
  { id: "log", label: "O(log n): the halving loop" },
  { id: "trace", label: "Traced: halving 16 down to 1" },
  { id: "reading", label: "Reading Big-O from code" },
  { id: "hidden", label: "Hidden loops in built-in methods" },
  { id: "space", label: "Space complexity" },
  { id: "cases", label: "Best, average and worst case" },
  { id: "constraints", label: "From constraints to approach" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const sumCode = `function sum(nums) {
  let total = 0;                              // 1 step
  for (let i = 0; i < nums.length; i++) {     // n + 1 checks, n updates
    total += nums[i];                         // n steps
  }
  return total;                               // 1 step
}`;

const halvingCode = `let n = 16;
let steps = 0;
while (n > 1) {
  n = Math.floor(n / 2);
  steps++;
}
console.log(steps);`;

function halvingTrace() {
  const t = tracer();
  let n = 16;
  t.step(1, "start", "n = 16", "The size of the problem.", { n }, "n");
  let steps = 0;
  t.step(2, "start", "steps = 0", "Counts how many times the loop body runs.", { n, steps }, "steps");
  while (n > 1) {
    t.step(3, "check", `${n} > 1? yes`, "Still more than one left, so halve again.", { n, steps });
    n = Math.floor(n / 2);
    t.step(4, "update", `n = ${n}`, "Half of the problem is thrown away in a single step.", { n, steps }, "n");
    steps++;
    t.step(5, "update", `steps = ${steps}`, "One more halving done.", { n, steps }, "steps");
  }
  t.step(3, "stop", `${n} > 1? no`, "We reached 1, so the loop ends.", { n, steps });
  t.print(steps);
  t.step(7, "print", "console.log(steps)", "16 → 8 → 4 → 2 → 1 took 4 halvings, and 2⁴ = 16. That 4 is log₂ 16.", { n, steps });
  return t.steps;
}

const shapes = `// O(1) — the same work for any n
const first = nums[0];

// O(n) — one loop over the input
for (let i = 0; i < n; i++) { /* ... */ }

// O(n) — two loops one after the other: n + n = 2n → O(n)
for (let i = 0; i < n; i++) { /* ... */ }
for (let j = 0; j < n; j++) { /* ... */ }

// O(n²) — a loop inside a loop: n × n
for (let i = 0; i < n; i++) {
  for (let j = 0; j < n; j++) { /* ... */ }
}

// O(n²) — the inner loop starts at i + 1: about n²/2, still O(n²)
for (let i = 0; i < n; i++) {
  for (let j = i + 1; j < n; j++) { /* ... */ }
}

// O(log n) — the loop variable doubles (or n halves) each time
for (let i = 1; i < n; i *= 2) { /* ... */ }

// O(n + m) — two different inputs, one after the other
for (const a of arrA) { /* ... */ }
for (const b of arrB) { /* ... */ }

// O(n × m) — two different inputs, one inside the other
for (const a of arrA) {
  for (const b of arrB) { /* ... */ }
}`;

const hiddenCode = `// Looks like one loop. Is really two.
function commonValues(a, b) {
  const result = [];
  for (const x of a) {           // runs n times
    if (b.includes(x)) {         // includes scans b: up to m steps
      result.push(x);
    }
  }
  return result;                 // O(n × m) in total
}

// Same result, really one pass over each array
function commonValuesFast(a, b) {
  const inB = new Set(b);        // m steps, once
  const result = [];
  for (const x of a) {           // n times
    if (inB.has(x)) {            // 1 step
      result.push(x);
    }
  }
  return result;                 // O(n + m)
}`;

export default function DsaLessonTwelvePage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">Why we count steps, not seconds</h2>
      <p>
        In Lesson 11 we kept saying that one solution was &ldquo;faster&rdquo; than another. How can
        we know that before running it? Timing with a stopwatch does not help much: the same code
        runs at different speeds on a laptop and a phone, and on a small input almost everything looks
        instant.
      </p>
      <p>
        Instead, we count <strong>steps</strong> — simple operations like a comparison, an addition
        or reading <code>arr[i]</code> — and ask one question: <strong>when the input gets bigger,
        how quickly does the number of steps grow?</strong> The answer is written in{" "}
        <strong>Big-O</strong> notation, and it is the language every interviewer uses to talk about
        efficiency.
      </p>

      <h2 id="counting">Counting the steps of a loop</h2>
      <p>Take the simplest loop there is — adding up an array — and count:</p>
      <CodeBlock lang="js" code={sumCode} />
      <p>
        Adding the comments together gives 1 + (n + 1) + n + n + 1 = <strong>3n + 3</strong> steps for
        an array of length n. Check it against a few sizes:
      </p>
      <DryRun
        title="steps taken by sum(nums)"
        cols={["n (length)", "3n + 3", "Growth"]}
        rows={[
          ["10", "33", ""],
          ["100", "303", "×10 input → about ×10 steps"],
          ["1,000", "3,003", "×10 input → about ×10 steps"],
          ["1,000,000", "3,000,003", "×1000 input → about ×1000 steps"],
        ]}
        note="Double the input and the work doubles. That straight-line growth is what O(n) means."
      />

      <h2 id="notation">Big-O: keep only what grows</h2>
      <p>
        Exact counts like 3n + 3 depend on small details — whether <code>i++</code> counts as one step
        or two, for example. Big-O ignores those details with two rules:
      </p>
      <ol>
        <li><strong>Drop constant factors.</strong> 3n and n grow the same way: double n, double the work. So 3n → n.</li>
        <li><strong>Keep only the fastest-growing term.</strong> In n² + n + 3, once n is 1,000 the n² part is 1,000,000 and the rest is about 1,000. The small terms stop mattering. So n² + n + 3 → n².</li>
      </ol>
      <DryRun
        title="simplifying to Big-O"
        cols={["Exact count", "Big-O", "Said as"]}
        rows={[
          ["3n + 3", "O(n)", "linear"],
          ["5", "O(1)", "constant"],
          ["n²/2 + n/2", "O(n²)", "quadratic"],
          ["2n + 100", "O(n)", "linear"],
          ["n² + 1000n", "O(n²)", "quadratic"],
        ]}
      />
      <p>
        So the <code>sum</code> function is <strong>O(n)</strong>. This measure of how steps grow
        with the input is called <strong>time complexity</strong>.
      </p>

      <h2 id="rates">The growth rates you will meet</h2>
      <p>Almost every solution in this series falls into one of these, ordered from fastest to slowest:</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Big-O</th>
              <th>Name</th>
              <th>Typical code</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>O(1)</td><td>constant</td><td>No loop over the input</td><td><code>arr[i]</code>, Map <code>get</code>, a maths formula</td></tr>
            <tr><td>O(log n)</td><td>logarithmic</td><td>Halve the problem each step</td><td>Binary search (Lesson 28)</td></tr>
            <tr><td>O(n)</td><td>linear</td><td>One loop</td><td>Sum, max, linear search</td></tr>
            <tr><td>O(n log n)</td><td>n log n</td><td>Good sorting</td><td><code>arr.sort()</code>, merge sort (Lesson 17)</td></tr>
            <tr><td>O(n²)</td><td>quadratic</td><td>A loop inside a loop</td><td>Checking every pair</td></tr>
            <tr><td>O(2ⁿ)</td><td>exponential</td><td>Try every subset</td><td>Subsets (Lesson 33)</td></tr>
          </tbody>
        </table>
      </div>
      <p>The difference between them is not small. Here are the step counts as n grows:</p>
      <DryRun
        title="steps for each growth rate"
        cols={["n", "log n", "n", "n log n", "n²", "2ⁿ"]}
        rows={[
          ["10", "≈ 3", "10", "≈ 33", "100", "1,024"],
          ["100", "≈ 7", "100", "≈ 660", "10,000", "≈ 10³⁰"],
          ["1,000", "≈ 10", "1,000", "≈ 10,000", "1,000,000", "far too many"],
          ["1,000,000", "≈ 20", "1,000,000", "≈ 20,000,000", "10¹²", "far too many"],
        ]}
        highlight={3}
        note="A computer does very roughly 10⁸ simple steps per second. For n = 1,000,000: O(n) takes about 0.01 seconds, O(n log n) about 0.2 seconds, and O(n²) about 3 hours."
      />
      <Callout kind="ok" label="The idea to remember">
        <p className="mb-0">
          For large inputs, the growth rate matters far more than the speed of the computer or small
          code optimisations. Changing an O(n²) solution into an O(n) one is usually the main
          improvement an interviewer is looking for.
        </p>
      </Callout>

      <h2 id="log">O(log n): the halving loop</h2>
      <p>
        One growth rate needs a little more explanation. A <strong>logarithm</strong> answers the
        question: <em>how many times can I halve n before I reach 1?</em>
      </p>
      <ul>
        <li>16 → 8 → 4 → 2 → 1: four halvings, so log₂ 16 = 4.</li>
        <li>1,024 → … → 1: ten halvings, so log₂ 1,024 = 10.</li>
        <li>1,000,000 → … → 1: about twenty halvings.</li>
      </ul>
      <p>
        So any loop that throws away half of what is left on each step is O(log n). It grows so
        slowly that even for a billion items it runs only about 30 times. In Big-O the base of the
        logarithm does not matter (dividing by 10 instead of 2 is only a constant factor), so we just
        write <code>log n</code>. You have already met one: the digit loop from Lesson 5 divides by 10
        each time, so it is O(log n) in the size of the number.
      </p>

      <h2 id="trace">Traced: halving 16 down to 1</h2>
      <CodeTrace
        code={halvingCode}
        steps={halvingTrace()}
        caption="The loop body runs once per halving. Make n twice as big (32) and the loop runs only one more time."
      />

      <h2 id="reading">Reading Big-O from code</h2>
      <p>You rarely need to count exactly. Look at the shape of the loops instead:</p>
      <ul>
        <li><strong>One after another → add.</strong> Two separate loops over n are n + n = 2n, which is O(n).</li>
        <li><strong>One inside another → multiply.</strong> A loop of n inside a loop of n is n × n = O(n²).</li>
        <li><strong>Halving or doubling → log.</strong> A loop variable that is multiplied or divided by 2 each time gives O(log n).</li>
        <li><strong>Two inputs → two letters.</strong> If the input is two arrays of lengths n and m, write O(n + m) or O(n × m). Do not combine them into one n.</li>
      </ul>
      <CodeBlock lang="js" code={shapes} />

      <h2 id="hidden">Hidden loops in built-in methods</h2>
      <p>
        Some JavaScript methods look like a single step but contain a loop inside them. Putting
        one of these inside your own loop turns O(n) into O(n²) without any visible nested loop.
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Operation</th>
              <th>Cost</th>
              <th>Why</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>arr[i]</code>, <code>arr.length</code>, <code>push</code>, <code>pop</code></td><td>O(1)</td><td>Works at one known position</td></tr>
            <tr><td>Map / Set: <code>get</code>, <code>set</code>, <code>has</code>, <code>add</code>, <code>delete</code></td><td>O(1) on average</td><td>Jumps straight to the key (Lesson 15)</td></tr>
            <tr><td><code>includes</code>, <code>indexOf</code>, <code>find</code></td><td>O(n)</td><td>Linear search through the array</td></tr>
            <tr><td><code>shift</code>, <code>unshift</code>, <code>splice</code></td><td>O(n)</td><td>Every later item has to move one position</td></tr>
            <tr><td><code>slice</code>, <code>[...arr]</code>, <code>concat</code>, <code>join</code></td><td>O(n)</td><td>Copies every item</td></tr>
            <tr><td><code>new Set(arr)</code>, <code>map</code>, <code>filter</code>, <code>reduce</code></td><td>O(n)</td><td>Visits every item</td></tr>
            <tr><td><code>sort</code></td><td>O(n log n)</td><td>Sorting (Lessons 16–18)</td></tr>
          </tbody>
        </table>
      </div>
      <CodeBlock lang="js" code={hiddenCode} />

      <h2 id="space">Space complexity</h2>
      <p>
        Time is not the only cost. <strong>Space complexity</strong> measures how much{" "}
        <em>extra</em> memory a solution needs as the input grows. The input itself is not counted.
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Extra space</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>A few number variables (<code>total</code>, <code>i</code>, <code>max</code>)</td><td>O(1)</td></tr>
            <tr><td>A copy of the array, or a new array of results</td><td>O(n)</td></tr>
            <tr><td>A Set or Map holding every value</td><td>O(n)</td></tr>
            <tr><td>An n × n grid</td><td>O(n²)</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        Many improvements trade space for time. In the hidden-loop example above,{" "}
        <code>commonValuesFast</code> uses an extra Set (O(m) space) to drop from O(n × m) to O(n + m)
        time. That is usually a good trade, but be ready to say it out loud: &ldquo;this is O(n) time
        and O(n) extra space&rdquo;. Interviewers expect both numbers.
      </p>

      <h2 id="cases">Best, average and worst case</h2>
      <p>The same code can do very different amounts of work depending on the input. Take linear search:</p>
      <CodeBlock lang="js" code={`function indexOf(nums, target) {\n  for (let i = 0; i < nums.length; i++) {\n    if (nums[i] === target) return i;\n  }\n  return -1;\n}`} />
      <DryRun
        title="linear search on n items"
        cols={["Case", "When", "Steps"]}
        rows={[
          ["Best", "target is the first item", "1 → O(1)"],
          ["Average", "target is somewhere in the middle", "about n/2 → O(n)"],
          ["Worst", "target is last, or not there at all", "n → O(n)"],
        ]}
        highlight={2}
      />
      <p>
        Unless someone says otherwise, Big-O means the <strong>worst case</strong>. It is the only one
        you can promise: the best case depends on luck. The one common exception is Map and Set,
        where we quote the average O(1) because the worst case almost never happens in practice.
      </p>

      <h2 id="constraints">From constraints to approach</h2>
      <p>
        This is where Big-O pays off in interviews. Combine the constraints (Lesson 11) with the rule
        of thumb of about 10<sup>8</sup> simple steps per second, and the size of n tells you which
        growth rate you need <em>before</em> you start designing:
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>If n is at most…</th>
              <th>This is fast enough</th>
              <th>Typical technique</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>about 10</td><td>O(n!)</td><td>Try every ordering (permutations)</td></tr>
            <tr><td>about 20</td><td>O(2ⁿ)</td><td>Try every subset (backtracking)</td></tr>
            <tr><td>about 500</td><td>O(n³)</td><td>Three nested loops</td></tr>
            <tr><td>about 5,000</td><td>O(n²)</td><td>Check every pair</td></tr>
            <tr><td>10<sup>5</sup> to 10<sup>6</sup></td><td>O(n log n) or O(n)</td><td>Sorting, one pass with a Map or Set, two pointers</td></tr>
            <tr><td>10<sup>9</sup> or more</td><td>O(log n) or O(1)</td><td>Binary search, a maths formula</td></tr>
          </tbody>
        </table>
      </div>
      <Callout kind="note" label="Try it on Lesson 11">
        <p className="mb-0">
          <code>secondLargest</code> allowed up to 10<sup>5</sup> values. O(n²) would be 10<sup>10</sup>{" "}
          steps — far too slow. So we needed O(n log n) (sort) or O(n) (one pass), and both of our
          solutions qualify. In &ldquo;Maximum product of two elements&rdquo;, n was at most 500, so even
          the O(n²) pair check was acceptable.
        </p>
      </Callout>

      <h2 id="practice">Practice questions</h2>
      <p>
        For every solution below, state its time and space complexity before reading the explanation.
        Saying both numbers should become automatic.
      </p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write the six growth rates in order, from fastest to slowest, with one example of each.</>,
          <>Explain why a loop that halves n is O(log n), using 16 as the example.</>,
          <>Name three array methods that hide an O(n) loop, and say why putting them inside a loop is a problem.</>,
          <>From memory, fill in the &ldquo;if n is at most… then this is fast enough&rdquo; table.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        You can now read a problem carefully and judge how fast a solution must be. Lesson 13 covers
        the basic maths that appears in many problems: divisors, prime numbers, the greatest common
        divisor and fast powers. Several of these turn an O(n) loop into O(√n) or O(log n) — and you
        now have the words to say exactly why that matters.
      </p>
    </DsaLessonPage>
  );
}
