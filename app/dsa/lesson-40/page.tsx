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

const lesson = getDsaLesson("lesson-40");

export const metadata: Metadata = {
  title: `Lesson 40 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "problem", label: "The question: next greater element" },
  { id: "idea", label: "The idea: a stack of items still waiting" },
  { id: "trace", label: "Traced: daily temperatures" },
  { id: "template", label: "The pattern and its four versions" },
  { id: "circular", label: "Arrays that wrap around" },
  { id: "span", label: "Stock span: looking backwards" },
  { id: "histogram", label: "Largest rectangle in a histogram" },
  { id: "rain", label: "Trapping rain water" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const bruteCode = `// For each item, scan right until something bigger appears.
function nextGreaterBrute(nums) {
  const out = new Array(nums.length).fill(-1);
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[j] > nums[i]) { out[i] = nums[j]; break; }
    }
  }
  return out;
}
console.log(nextGreaterBrute([2, 1, 5, 3, 4])); // [5, 5, -1, 4, -1]   O(n²) in the worst case (a descending array)`;

const stackCode = `function nextGreater(nums) {
  const out = new Array(nums.length).fill(-1);
  const stack = [];                                   // indices still waiting for a greater value; their values never increase
  for (let i = 0; i < nums.length; i++) {
    while (stack.length && nums[stack[stack.length - 1]] < nums[i]) {
      out[stack.pop()] = nums[i];                     // nums[i] is the answer for everything it is bigger than
    }
    stack.push(i);
  }
  return out;                                         // what is left on the stack keeps its -1
}

console.log(nextGreater([2, 1, 5, 3, 4])); // [5, 5, -1, 4, -1]
console.log(nextGreater([4, 3, 2, 1]));    // [-1, -1, -1, -1]`;

const traceSrc = `const answer = new Array(n).fill(0);
const stack = [];
for (let i = 0; i < n; i++) {
  while (stack.length && temps[stack[stack.length - 1]] < temps[i]) {
    const j = stack.pop();
    answer[j] = i - j;
  }
  stack.push(i);
}`;

function tempsTrace() {
  const t = tracer();
  const temps = [73, 74, 75, 71, 69, 72, 76, 73];
  const n = temps.length;
  const answer = new Array(n).fill(0);
  const stack: number[] = [];
  const shown = () => stack.map((i) => `${temps[i]} (day ${i})`);
  t.step(1, "start", "answer = [0,…,0], stack = []", "The stack holds the days that are still waiting for a warmer day. Their temperatures never go up from bottom to top. That is what monotonic means: always going the same way.", { answer: [...answer], stack: [] });
  for (let i = 0; i < n; i++) {
    t.step(3, "check", `day ${i}: ${temps[i]}°`, "Today may be the warmer day that some of the waiting days are looking for.", { i, today: temps[i], answer: [...answer], stack: shown() }, "i");
    while (stack.length && temps[stack[stack.length - 1]] < temps[i]) {
      const j = stack.pop()!;
      answer[j] = i - j;
      t.step(6, "update", `day ${j} (${temps[j]}°) is answered: ${i - j} day${i - j === 1 ? "" : "s"}`, `${temps[i]}° is warmer than ${temps[j]}°. Day ${j} waited ${i} − ${j} = ${i - j} days.`, { i, answer: [...answer], stack: shown() }, "answer");
    }
    stack.push(i);
    t.step(8, "update", `push day ${i}`, "Now today also waits for a warmer day.", { i, answer: [...answer], stack: shown() }, "stack");
  }
  t.step(9, "done", "answer is complete", "The days still on the stack (76° and 73°) never saw a warmer day, so they keep 0.", { answer: [...answer], stack: shown() });
  return t.steps;
}

const templateRows: string[][] = [
  ["next greater to the right", "pop while the stack top < current", "the current item is the answer for each item you pop"],
  ["next smaller to the right", "pop while the stack top > current", "same idea, with the comparison the other way round"],
  ["previous greater / smaller to the left", "the popped items are not the answer. Read the stack top before you push", "after popping, the top is the nearest bigger (or smaller) value on the left"],
  ["equal values", "choose < or <= on purpose", "decides whether an equal value counts as 'greater'"],
];

const circularCode = `// Next greater element, treating the array as a circle.
function nextGreaterCircular(nums) {
  const n = nums.length;
  const out = new Array(n).fill(-1);
  const stack = [];
  for (let i = 0; i < 2 * n; i++) {          // go around twice
    const x = nums[i % n];
    while (stack.length && nums[stack[stack.length - 1]] < x) {
      out[stack.pop()] = x;
    }
    if (i < n) stack.push(i);                // only push during the first lap
  }
  return out;
}

console.log(nextGreaterCircular([1, 2, 1]));    // [2, -1, 2]
console.log(nextGreaterCircular([5, 4, 3, 2, 1])); // [-1, 5, 5, 5, 5]`;

const spanCode = `class StockSpanner {
  constructor() { this.stack = []; }                 // [price, span] pairs, prices strictly decreasing
  next(price) {
    let span = 1;
    while (this.stack.length && this.stack[this.stack.length - 1][0] <= price) {
      span += this.stack.pop()[1];                   // absorb the span of every smaller-or-equal day
    }
    this.stack.push([price, span]);
    return span;
  }
}

const s = new StockSpanner();
console.log([100, 80, 60, 70, 60, 75, 85].map((p) => s.next(p))); // [1, 1, 1, 2, 1, 4, 6]`;

const histogramCode = `function largestRectangle(heights) {
  const stack = [];                                   // indices of bars with increasing heights
  let best = 0;
  for (let i = 0; i <= heights.length; i++) {
    const h = i === heights.length ? 0 : heights[i];  // a bar of height 0 at the end flushes the stack
    while (stack.length && heights[stack[stack.length - 1]] > h) {
      const height = heights[stack.pop()];
      const left = stack.length ? stack[stack.length - 1] : -1;   // the first smaller bar on the left
      best = Math.max(best, height * (i - left - 1));             // i is the first smaller bar on the right
    }
    stack.push(i);
  }
  return best;
}

console.log(largestRectangle([2, 1, 5, 6, 2, 3])); // 10  (heights 5 and 6, width 2)
console.log(largestRectangle([2, 4]));             // 4
console.log(largestRectangle([1, 1, 1, 1]));       // 4`;

const rainStackCode = `function trapStack(height) {
  const stack = [];                                   // indices of bars, heights decreasing
  let water = 0;
  for (let i = 0; i < height.length; i++) {
    while (stack.length && height[stack[stack.length - 1]] < height[i]) {
      const bottom = stack.pop();                     // the floor of a pool
      if (!stack.length) break;                       // no left wall
      const left = stack[stack.length - 1];
      const width = i - left - 1;
      const depth = Math.min(height[left], height[i]) - height[bottom];
      water += width * depth;
    }
    stack.push(i);
  }
  return water;
}

console.log(trapStack([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1])); // 6
console.log(trapStack([4, 2, 0, 3, 2, 5]));                    // 9`;

const rainTwoPointerCode = `function trap(height) {
  let l = 0, r = height.length - 1;
  let leftMax = 0, rightMax = 0, water = 0;
  while (l < r) {
    if (height[l] < height[r]) {            // the shorter side decides: its water level is limited by its own max
      leftMax = Math.max(leftMax, height[l]);
      water += leftMax - height[l];
      l++;
    } else {
      rightMax = Math.max(rightMax, height[r]);
      water += rightMax - height[r];
      r--;
    }
  }
  return water;
}

console.log(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1])); // 6
console.log(trap([4, 2, 0, 3, 2, 5]));                    // 9`;

export default function DsaLessonFortyPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="problem">The question: next greater element</h2>
      <p>
        The <strong>next greater element</strong> of an item is the first item to its <em>right</em> that is bigger than it. For every item in an array, find it. If there is none, the answer is -1. For{" "}
        <code>[2, 1, 5, 3, 4]</code> the answers are <code>[5, 5, -1, 4, -1]</code>. The simple way is to scan to the right from every item:
      </p>
      <CodeBlock lang="js" code={bruteCode} />
      <p>
        If the array goes down (descending), every scan runs to the end. So this is <strong>O(n²)</strong>, which is slow for big arrays. Questions like this (&quot;the
        next warmer day&quot;, &quot;how many days was the price below today&quot;, &quot;the nearest taller building&quot;) come up again and again.
        One structure solves them all in O(n).
      </p>

      <h2 id="idea">The idea: a stack of unanswered items</h2>
      <p>
        Walk from left to right. Keep a stack of the items that <strong>are still waiting</strong> for their answer. When a new
        value arrives, it is the answer for every waiting item that is smaller than it. So pop those items and record the answer. Then
        push the new value, because it now waits for its own answer. The values in the stack never go up from bottom to
        top, because every smaller value is popped when a bigger one arrives. A stack that stays in order like this is called a{" "}
        <strong>monotonic stack</strong> (monotonic means always going the same way).
      </p>
      <CodeBlock lang="js" code={stackCode} />
      <p>
        Why is it O(n)? Each index is pushed once and popped at most once. So the inner <code>while</code> loop does not multiply the
        work of the outer loop. Across the whole run, it runs at most n times in total.
      </p>

      <h2 id="trace">Traced: daily temperatures</h2>
      <p>
        <em>Daily Temperatures</em>: for each day, how many days until a warmer day? It is the same pattern. But the answer is the distance
        between two positions, so the stack stores <strong>indices</strong> (positions) instead of values.
      </p>
      <CodeTrace
        code={traceSrc}
        steps={tempsTrace()}
        caption="Day 6 (76°) answers four waiting days at once. The two days left on the stack never see a warmer day, so their answer stays 0."
      />

      <h2 id="template">The template and its variations</h2>
      <DryRun
        title="one idea, four versions"
        cols={["Wanted", "Rule", "Note"]}
        rows={templateRows}
        note="Store indices when you need distances or widths. Store values when you only need the value. Storing indices works in both cases."
      />
      <Callout kind="warn" label="Strict or not strict?">
        Whether you pop while <code>&lt;</code> or <code>&lt;=</code> decides what happens with equal values. For &quot;next
        <em> strictly</em> greater&quot; (it must be bigger, not equal), pop while <code>&lt;</code>. If an equal value should count as the answer, use <code>&lt;=</code>. Test with
        an array like <code>[2, 2]</code> before you submit.
      </Callout>

      <h2 id="circular">Circular arrays</h2>
      <p>
        Sometimes the array wraps around: after the last item, you look at the first item again. In this case, loop through the indices <strong>twice</strong>{" "}
        using <code>i % n</code> (the remainder after dividing i by n, which sends the index back to the start). Push only during the first lap. The second lap lets every item see the items that come before it.
      </p>
      <CodeBlock lang="js" code={circularCode} />

      <h2 id="span">Stock span: looking backwards</h2>
      <p>
        The <em>span</em> of today&apos;s price is the number of days in a row, ending today, with a price that is today&apos;s price or lower. The
        stack holds <code>[price, span]</code> pairs. A new price takes in every pair on top of the stack that has a smaller or equal price. It adds
        their spans to its own. So no day is ever counted twice.
      </p>
      <CodeBlock lang="js" code={spanCode} />

      <h2 id="histogram">Largest rectangle in a histogram</h2>
      <p>
        A <strong>histogram</strong> is a bar chart: bars of different heights, all of width 1, standing side by side. You get the heights of the bars. Find the largest rectangle that fits inside the bars. For each bar, the widest rectangle that uses its
        full height goes left and right until it meets a <em>shorter</em> bar. Those edges are exactly the
        previous smaller and next smaller elements. A monotonic stack of increasing heights finds them in one pass. When a shorter bar
        arrives at index <code>i</code>, each taller bar on the stack is finished. Its right edge is <code>i</code>. Its left
        edge is the bar that is now under it on the stack.
      </p>
      <CodeBlock lang="js" code={histogramCode} />
      <DryRun
        title="heights [2, 1, 5, 6, 2, 3]"
        cols={["Event", "Stack (heights)", "Rectangle found"]}
        rows={[
          ["i=0, h=2: push", "2", "-"],
          ["i=1, h=1: pop 2 (left = -1)", "1", "2 × (1 − (−1) − 1) = 2"],
          ["i=2, h=5: push", "1, 5", "-"],
          ["i=3, h=6: push", "1, 5, 6", "-"],
          ["i=4, h=2: pop 6 (left = 2)", "1, 5", "6 × (4 − 2 − 1) = 6"],
          ["i=4: pop 5 (left = 1)", "1", "5 × (4 − 1 − 1) = 10"],
          ["i=4: push", "1, 2", "-"],
          ["i=5, h=3: push", "1, 2, 3", "-"],
          ["i=6 (sentinel 0): pop 3, 2, 1", "empty", "3×1=3, 2×4=8, 1×6=6"],
        ]}
        note="The best rectangle is 10. It is made by the bars of height 5 and 6 side by side. The sentinel is a fake extra bar of height 0 added at the end. It forces every bar still on the stack to be finished."
      />

      <h2 id="rain">Trapping rain water</h2>
      <p>
        Water sits above a bar. It rises up to the lower of the two tallest bars, one on each side. A monotonic stack finds each &quot;pool&quot; as
        soon as its right wall appears. Pop the floor. The new top of the stack is the left wall. The pool holds{" "}
        <em>width × (lower wall − floor)</em> water.
      </p>
      <CodeBlock lang="js" code={rainStackCode} />
      <p>
        There is also a smarter version with two pointers. It needs only O(1) space (a fixed amount of extra memory, however long the input is). The shorter side always decides the water level at
        its own position, because the other side has a wall at least as tall:
      </p>
      <CodeBlock lang="js" code={rainTwoPointerCode} />
      <p>
        The best answer is to know both. The stack version shows the pattern. The two-pointer version shows that you can save memory
        once you understand why it works.
      </p>

      <h2 id="practice">Practice questions</h2>
      <p>Ask yourself: &quot;What is each item waiting for?&quot; The answer is the condition that pops the stack.</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Explain what is in the stack at any moment. Explain why it is called monotonic.</>,
          <>Explain why the loop inside a loop is still O(n).</>,
          <>Say when to store indices instead of values.</>,
          <>Explain how each histogram bar finds its left and right edges.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        That completes the linear structures (the ones where items sit in a line): arrays, strings, hash maps, linked lists, stacks and queues. <strong>Lesson 41</strong>{" "}
        begins the next part with the first structure that is not a line: <strong>binary trees</strong>. In a binary tree, a node has up to two children.
      </p>
    </DsaLessonPage>
  );
}
