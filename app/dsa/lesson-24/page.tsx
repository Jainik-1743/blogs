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

const lesson = getDsaLesson("lesson-24");

export const metadata: Metadata = {
  title: `Lesson 24 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "The largest sum of any subarray" },
  { id: "brute", label: "Brute force: every start, every end" },
  { id: "idea", label: "The key question: extend or start again?" },
  { id: "trace", label: "Traced: Kadane on the classic example" },
  { id: "which", label: "Returning the subarray itself" },
  { id: "stock", label: "Best time to buy and sell stock" },
  { id: "product", label: "Maximum product: track the minimum too" },
  { id: "circular", label: "Circular subarrays" },
  { id: "practice", label: "Practice questions (6)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const bruteCode = `function maxSubArrayBrute(nums) {
  let best = -Infinity;
  for (let i = 0; i < nums.length; i++) {
    let sum = 0;
    for (let j = i; j < nums.length; j++) {
      sum += nums[j];                    // sum of nums[i..j]
      best = Math.max(best, sum);
    }
  }
  return best;
}

console.log(maxSubArrayBrute([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 6`;

const kadaneCode = `const nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
let cur = nums[0];
let best = nums[0];
for (let i = 1; i < nums.length; i++) {
  cur = Math.max(nums[i], cur + nums[i]);
  best = Math.max(best, cur);
}
console.log(best);`;

function kadaneTrace() {
  const t = tracer();
  const nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
  let cur = nums[0];
  t.step(2, "start", "cur = -2", "cur is the best sum of a subarray that ends exactly here. Only one subarray ends at index 0.", { nums, cur }, "cur");
  let best = nums[0];
  t.step(3, "start", "best = -2", "The best sum seen anywhere so far.", { nums, cur, best }, "best");
  for (let i = 1; i < nums.length; i++) {
    const extend = cur + nums[i];
    const startAgain = nums[i];
    cur = Math.max(startAgain, extend);
    t.step(5, "update", `i = ${i}: max(${startAgain}, ${extend}) = ${cur}`, extend >= startAgain ? `Extend: adding ${nums[i]} to the previous run (${extend}) is at least as good as starting fresh.` : `Start again at index ${i}: the previous run was negative and would only drag ${nums[i]} down.`, { nums, i, cur, best }, "cur");
    const before = best;
    best = Math.max(best, cur);
    if (best !== before) t.step(6, "update", `best = ${best}`, "A new best subarray.", { nums, i, cur, best }, "best");
  }
  t.print(best);
  t.step(8, "print", "console.log(best)", "[4, −1, 2, 1] = 6. One pass, two variables.", { nums, best });
  return t.steps;
}

const withIndexCode = `function maxSubArrayRange(nums) {
  let cur = nums[0], best = nums[0];
  let start = 0, bestStart = 0, bestEnd = 0;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > cur + nums[i]) {       // starting again is better
      cur = nums[i];
      start = i;
    } else {
      cur += nums[i];
    }
    if (cur > best) {
      best = cur;
      bestStart = start;
      bestEnd = i;
    }
  }
  return { best, sub: nums.slice(bestStart, bestEnd + 1) };
}

console.log(maxSubArrayRange([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // { best: 6, sub: [ 4, -1, 2, 1 ] }`;

const stockCode = `function maxProfit(prices) {
  let minPrice = Infinity, best = 0;
  for (const p of prices) {
    minPrice = Math.min(minPrice, p);        // cheapest day to buy so far
    best = Math.max(best, p - minPrice);     // sell today?
  }
  return best;
}

console.log(maxProfit([7, 1, 5, 3, 6, 4])); // 5   buy at 1, sell at 6
console.log(maxProfit([7, 6, 4, 3, 1]));    // 0   never profitable`;

const productCode = `function maxProduct(nums) {
  let hi = nums[0], lo = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    const x = nums[i];
    const candidates = [x, hi * x, lo * x];
    hi = Math.max(...candidates);           // largest product ending here
    lo = Math.min(...candidates);           // smallest (most negative) product ending here
    best = Math.max(best, hi);
  }
  return best;
}

console.log(maxProduct([2, 3, -2, 4]));     // 6
console.log(maxProduct([-2, 3, -4]));       // 24   the two negatives multiply`;

const circularCode = `function maxSubarraySumCircular(nums) {
  let total = 0;
  let curMax = 0, bestMax = -Infinity;
  let curMin = 0, bestMin = Infinity;
  for (const x of nums) {
    total += x;
    curMax = Math.max(x, curMax + x);
    bestMax = Math.max(bestMax, curMax);
    curMin = Math.min(x, curMin + x);
    bestMin = Math.min(bestMin, curMin);
  }
  if (bestMax < 0) return bestMax;           // all negative: the wrap trick would give 0
  return Math.max(bestMax, total - bestMin);
}

console.log(maxSubarraySumCircular([5, -3, 5]));    // 10   wraps around: [5, 5]
console.log(maxSubarraySumCircular([-3, -2, -3]));  // -2`;

export default function DsaLessonTwentyFourPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">The largest sum of any subarray</h2>
      <p>
        You get an array with positive and negative numbers. Find the subarray with the largest sum. (A subarray
        is a block of items that sit next to each other.) For <code>[-2, 1, -3, 4, -1, 2, 1, -5, 4]</code> the
        answer is 6, from <code>[4, -1, 2, 1]</code>. Notice that this block includes a −1. Sometimes it is worth
        accepting a small loss to reach bigger gains later.
      </p>
      <p>
        A sliding window does not work here (Lesson 23). With negative numbers, shrinking the window can make the sum
        bigger or smaller, so the window rules break. <strong>Kadane&apos;s algorithm</strong> solves the problem
        in one pass with a different idea. It is named after Jay Kadane, who found it.
      </p>

      <h2 id="brute">Brute force: every start, every end</h2>
      <CodeBlock lang="js" code={bruteCode} />
      <p>For each start, we keep a running sum as the end moves. This avoids an O(n³) solution (adding up every subarray from scratch). But it still costs O(n²) steps.</p>

      <h2 id="idea">The key question: extend or start again?</h2>
      <p>
        Walk from left to right and keep one number called <code>cur</code>. It is the best sum of a subarray that{" "}
        <strong>ends exactly at the current index</strong>. For the next item x there are only two choices:
      </p>
      <ul>
        <li><strong>Extend</strong> the best subarray ending at the previous index: <code>cur + x</code>.</li>
        <li><strong>Start again</strong> with x alone: <code>x</code>.</li>
      </ul>
      <Callout kind="ok" label="Kadane's algorithm in one line">
        <p className="mb-0">
          <code>cur = Math.max(x, cur + x)</code>. If the sum so far is negative, it can only make the new sum
          smaller. So drop it and start again from x. The answer is the largest <code>cur</code> you ever see.
        </p>
      </Callout>

      <h2 id="trace">Traced: Kadane on the classic example</h2>
      <CodeTrace
        code={kadaneCode}
        steps={kadaneTrace()}
        caption="At each index, cur answers: what is the best subarray that ends here? best keeps the largest of those answers."
      />
      <DryRun
        title="cur and best at every index"
        cols={["i", "x", "cur", "best", "choice"]}
        rows={[
          ["0", "−2", "−2", "−2", "first item"],
          ["1", "1", "1", "1", "start again"],
          ["2", "−3", "−2", "1", "extend"],
          ["3", "4", "4", "4", "start again"],
          ["4", "−1", "3", "4", "extend"],
          ["5", "2", "5", "5", "extend"],
          ["6", "1", "6", "6", "extend"],
          ["7", "−5", "1", "6", "extend"],
          ["8", "4", "5", "6", "extend"],
        ]}
        highlight={6}
      />
      <p>
        It is important to start <code>cur</code> and <code>best</code> at <code>nums[0]</code>, not at 0. Take an
        array where every number is negative, like <code>[-3, -1, -2]</code>. The answer is −1. If you start at 0,
        the code wrongly returns 0. This is also your first <strong>dynamic programming</strong> solution. Dynamic
        programming means you build the answer for each step from the answer for the previous step (Part 14).
      </p>

      <h2 id="which">Returning the subarray itself</h2>
      <p>
        Sometimes you must return the subarray itself, not just its sum. To do this, remember where the current run
        started. Whenever you find a new best sum, save that start position:
      </p>
      <CodeBlock lang="js" code={withIndexCode} />

      <h2 id="stock">Best time to buy and sell stock</h2>
      <p>
        You get the price of a stock for each day. Buy on one day and sell on a later day, to make the largest
        profit. The same &ldquo;best ending here&rdquo; thinking works. If you sell today, the best you can do is
        to have bought at the <strong>cheapest price seen so far</strong>. Keep track of that lowest price as you
        walk through the prices.
      </p>
      <CodeBlock lang="js" code={stockCode} />
      <p>
        This is Kadane&apos;s idea in another form. The profit from day i to day j equals the sum of the daily price
        changes between them. So the best trade is the maximum subarray of the list of daily changes.
      </p>

      <h2 id="product">Maximum product: track the minimum too</h2>
      <p>
        For the largest <em>product</em>, one number is not enough. A very negative product can become the largest
        positive product when you multiply it by another negative number. So keep two numbers: the largest product
        and the smallest product that end at the current index:
      </p>
      <CodeBlock lang="js" code={productCode} />
      <DryRun
        title="maxProduct([-2, 3, -4])"
        cols={["x", "candidates", "hi", "lo", "best"]}
        rows={[
          ["−2", "—", "−2", "−2", "−2"],
          ["3", "3, −6, −6", "3", "−6", "3"],
          ["−4", "−4, −12, 24", "24", "−12", "24"],
        ]}
        highlight={2}
        note="The smallest product −6 (from −2 × 3) became the largest, 24, when multiplied by −4."
      />

      <h2 id="circular">Circular subarrays</h2>
      <p>
        Now imagine the array is a circle, so a subarray may wrap from the end back to the start. A wrapping
        subarray is everything <em>except</em> a block in the middle. So the best wrapping sum is{" "}
        <code>total − (the minimum subarray sum)</code>. Run Kadane for the maximum and for the minimum together.
        Then take the better of the two cases:
      </p>
      <CodeBlock lang="js" code={circularCode} />
      <p>
        There is one edge case. If every value is negative, the minimum subarray is the whole array. Then{" "}
        <code>total − bestMin</code> would be 0, which means an empty subarray, and that is not allowed. In this
        case, return the normal maximum.
      </p>

      <h2 id="practice">Practice questions</h2>
      <p>For each question, first say what &ldquo;the best answer that ends at index i&rdquo; means. Then write the one-line update.</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write Kadane&apos;s algorithm from memory and explain &ldquo;extend or start again&rdquo;.</>,
          <>Say why <code>cur</code> and <code>best</code> start at <code>nums[0]</code> and not 0.</>,
          <>Explain why the maximum product needs the minimum product too.</>,
          <>Explain the circular case using &ldquo;total minus the minimum subarray&rdquo;.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        Lesson 25 finishes Part 4 with <strong>2-D arrays</strong>. A 2-D array is a grid with rows and columns. You
        will transpose a matrix (swap its rows and columns), rotate it, read it in a spiral, and search a sorted
        matrix. These are all common interview questions.
      </p>
    </DsaLessonPage>
  );
}
