import type { Metadata } from "next";
import ArrayBoxes from "@/components/dsa/ArrayBoxes";
import Callout from "@/components/Callout";
import CodeTrace from "@/components/dsa/CodeTrace";
import DryRun from "@/components/dsa/DryRun";
import DsaLessonPage from "@/components/dsa/DsaLesson";
import Questions from "./questions";
import Recall from "@/components/dsa/Recall";
import CodeBlock from "@/components/sd/CodeBlock";
import { getDsaLesson } from "@/lib/dsa";
import { tracer } from "@/lib/dsa-trace";

const lesson = getDsaLesson("lesson-20");

export const metadata: Metadata = {
  title: `Lesson 20 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Many range sums, one pass" },
  { id: "build", label: "Building the prefix array" },
  { id: "trace", label: "Traced: build, then answer a range query" },
  { id: "formula", label: "The range formula, and why the extra 0" },
  { id: "pivot", label: "Pivot index: left sum vs right sum" },
  { id: "products", label: "Prefix and suffix products" },
  { id: "count", label: "Subarray sum equals k: prefix sums + a Map" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const slowCode = `const nums = [3, 1, 4, 1, 5];
function rangeSum(l, r) {            // sum of nums[l..r], inclusive
  let s = 0;
  for (let i = l; i <= r; i++) s += nums[i];
  return s;                          // O(r - l + 1) for every query
}
console.log(rangeSum(1, 3));         // 6`;

const traceCode = `const nums = [3, 1, 4, 1, 5];
const pre = [0];
for (let i = 0; i < nums.length; i++) {
  pre.push(pre[i] + nums[i]);
}
const l = 1, r = 3;
console.log(pre[r + 1] - pre[l]);`;

function prefixTrace() {
  const t = tracer();
  const nums = [3, 1, 4, 1, 5];
  t.step(1, "start", "nums = [3, 1, 4, 1, 5]", "We want any range sum to be instant.", { nums }, "nums");
  const pre = [0];
  t.step(2, "start", "pre = [0]", "pre[i] will be the sum of the first i items. The sum of the first 0 items is 0.", { nums, pre: [...pre] }, "pre");
  for (let i = 0; i < nums.length; i++) {
    pre.push(pre[i] + nums[i]);
    t.step(4, "update", `pre[${i + 1}] = pre[${i}] + nums[${i}] = ${pre[i]} + ${nums[i]} = ${pre[i + 1]}`, `The running total after ${i + 1} item${i ? "s" : ""}. Each new total reuses the previous one: O(1) per step.`, { nums, pre: [...pre], i }, "pre");
  }
  const l = 1, r = 3;
  t.step(6, "start", "query: l = 1, r = 3", "Sum of nums[1..3] = 1 + 4 + 1.", { nums, pre: [...pre], l, r });
  t.print(pre[r + 1] - pre[l]);
  t.step(7, "print", `pre[4] - pre[1] = ${pre[4]} - ${pre[1]} = ${pre[4] - pre[1]}`, "The total of the first 4 items minus the total of the first 1 item leaves exactly items 1 to 3.", { nums, pre: [...pre], l, r });
  return t.steps;
}

const pivotCode = `function pivotIndex(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  let left = 0;                                   // sum of everything before i
  for (let i = 0; i < nums.length; i++) {
    const right = total - left - nums[i];          // sum of everything after i
    if (left === right) return i;
    left += nums[i];
  }
  return -1;
}

console.log(pivotIndex([1, 7, 3, 6, 5, 6])); // 3   (1 + 7 + 3 = 11 = 5 + 6)
console.log(pivotIndex([1, 2, 3]));          // -1`;

const productCode = `function productExceptSelf(nums) {
  const n = nums.length;
  const out = new Array(n).fill(1);
  let left = 1;
  for (let i = 0; i < n; i++) {        // out[i] = product of everything to the left
    out[i] = left;
    left *= nums[i];
  }
  let right = 1;
  for (let i = n - 1; i >= 0; i--) {   // multiply in the product of everything to the right
    out[i] *= right;
    right *= nums[i];
  }
  return out;
}

console.log(productExceptSelf([1, 2, 3, 4])); // [ 24, 12, 8, 6 ]`;

const countCode = `function subarraySum(nums, k) {
  const seen = new Map([[0, 1]]);   // prefix sum 0 has been "seen" once: before any item
  let sum = 0, count = 0;
  for (const x of nums) {
    sum += x;                                   // prefix sum up to here
    count += seen.get(sum - k) ?? 0;            // earlier prefixes that leave exactly k
    seen.set(sum, (seen.get(sum) ?? 0) + 1);
  }
  return count;
}

console.log(subarraySum([1, 2, 3], 3));     // 2   ([1, 2] and [3])
console.log(subarraySum([1, -1, 1], 1));    // 3   ([1], [1], [1, -1, 1])`;

export default function DsaLessonTwentyPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">Many range sums, one pass</h2>
      <p>
        A <strong>subarray</strong> is a block of items that sit next to each other in an array, like{" "}
        <code>nums[1..3]</code> (the items at index 1, 2 and 3). Many problems ask for the sum of many different
        subarrays. If you add the items up one by one, each question costs O(n) steps (the steps grow with the
        array length n):
      </p>
      <CodeBlock lang="js" code={slowCode} />
      <p>
        A query is one question, such as &ldquo;what is the sum of this range?&rdquo;. With 10<sup>5</sup> queries
        on 10<sup>5</sup> items, that is 10<sup>10</sup> steps, which is far too slow. The fix uses the
        pre-computation idea from Lesson 15. Pre-computation means you do some work once, before the questions
        come, and save the result. Here you spend one pass building <strong>running totals</strong>. After that,
        every range sum is just one subtraction.
      </p>

      <h2 id="build">Building the prefix array</h2>
      <p>
        A <strong>prefix sum</strong> array is an array of running totals. In the array <code>pre</code>, the value
        at position i is the sum of the first i items of <code>nums</code>. A running total is the sum so far, like
        the total on a shop receipt that grows with each item. <code>pre</code> starts with a 0 (the sum of no
        items), so it is one item longer than <code>nums</code>:
      </p>
      <ArrayBoxes values={[3, 1, 4, 1, 5]} name="nums" caption="The input." />
      <ArrayBoxes
        values={[0, 3, 4, 8, 9, 14]}
        name="pre"
        highlight={[1, 4]}
        caption="pre[i] = nums[0] + … + nums[i − 1]. Each value is the previous one plus one more item."
        note="Highlighted: pre[1] = 3 and pre[4] = 9, used by the query below."
      />

      <h2 id="trace">Traced: build, then answer a range query</h2>
      <CodeTrace
        code={traceCode}
        steps={prefixTrace()}
        caption="O(n) once to build. After that, every range sum costs one subtraction."
      />

      <h2 id="formula">The range formula, and why the extra 0</h2>
      <Callout kind="ok" label="Range sum with a prefix array">
        <p className="mb-0">
          <code>sum(nums[l..r]) = pre[r + 1] - pre[l]</code>
        </p>
      </Callout>
      <p>
        <code>pre[r + 1]</code> is the sum of everything from index 0 to r. <code>pre[l]</code> is the sum of
        everything from index 0 to l − 1. If you subtract the second from the first, the part before l is removed,
        and only the range l..r is left. The leading 0 lets ranges that start at index 0 work without a special
        case: <code>sum(0..r) = pre[r + 1] - pre[0] = pre[r + 1] - 0</code>.
      </p>
      <DryRun
        title="queries on nums = [3, 1, 4, 1, 5]"
        cols={["Range", "Formula", "Answer", "Check"]}
        rows={[
          ["0..4", "pre[5] − pre[0] = 14 − 0", "14", "3+1+4+1+5"],
          ["1..3", "pre[4] − pre[1] = 9 − 3", "6", "1+4+1"],
          ["2..2", "pre[3] − pre[2] = 8 − 4", "4", "just 4"],
          ["3..4", "pre[5] − pre[3] = 14 − 8", "6", "1+5"],
        ]}
      />

      <h2 id="pivot">Pivot index: left sum vs right sum</h2>
      <p>
        Sometimes you do not need the whole prefix array. One running total is enough. The pivot index is the
        position where the sum of the items on its left equals the sum of the items on its right. If you know the
        total of all items, the right sum is <code>total - left - nums[i]</code>:
      </p>
      <CodeBlock lang="js" code={pivotCode} />

      <h2 id="products">Prefix and suffix products</h2>
      <p>
        The same idea works for multiplication, and from both directions. A prefix product is a running product,
        and a suffix product is a running product from the right end. Take the problem &ldquo;the product of every
        item except <code>nums[i]</code>&rdquo;. The answer is (the product of everything to the left) ×
        (the product of everything to the right). A pass from the left fills in the left products. A pass from the
        right multiplies in the right products. You never divide, so zeros cause no problem.
      </p>
      <CodeBlock lang="js" code={productCode} />
      <DryRun
        title="productExceptSelf([1, 2, 3, 4])"
        cols={["i", "left product", "right product", "out[i]"]}
        rows={[
          ["0", "1", "2 × 3 × 4 = 24", "24"],
          ["1", "1", "3 × 4 = 12", "12"],
          ["2", "1 × 2 = 2", "4", "8"],
          ["3", "1 × 2 × 3 = 6", "1", "6"],
        ]}
      />

      <h2 id="count">Subarray sum equals k: prefix sums + a Map</h2>
      <p>
        This is the most important prefix-sum problem: <em>how many subarrays add up to exactly k?</em> Checking
        every subarray costs O(n²). The prefix idea turns the check into a quick lookup.
      </p>
      <p>
        A subarray from i to j has the sum <code>pre[j + 1] - pre[i]</code>. We want that sum to equal k. That is
        the same as <code>pre[i] = pre[j + 1] - k</code>. So as we walk forward with the running sum, we ask:{" "}
        <strong>how many earlier prefix sums equal (current sum − k)?</strong> A Map is a collection of key and
        value pairs, and it finds a key very fast. Use a Map that stores how many times each prefix sum has
        appeared (Lesson 15). Then each question is answered in O(1), which means one quick step.
      </p>
      <CodeBlock lang="js" code={countCode} />
      <DryRun
        title="subarraySum([1, 2, 3], k = 3)"
        cols={["x", "sum", "look for sum − 3", "found", "count", "seen after"]}
        rows={[
          ["", "0", "", "", "0", "{0: 1}"],
          ["1", "1", "−2", "0", "0", "{0: 1, 1: 1}"],
          ["2", "3", "0", "1", "1", "{0: 1, 1: 1, 3: 1}"],
          ["3", "6", "3", "1", "2", "{0: 1, 1: 1, 3: 1, 6: 1}"],
        ]}
        highlight={3}
        note="At sum 3, the earlier prefix 0 gives [1, 2]. At sum 6, the earlier prefix 3 gives [3]."
      />
      <Callout kind="warn" label="Why start the Map with 0 → 1?">
        <p className="mb-0">
          A subarray that starts at index 0 needs the &ldquo;empty prefix&rdquo; (sum 0) to subtract. Without this
          first entry, the subarray <code>[1, 2]</code> above would be missed. This method also works with negative
          numbers. The sliding window of Lesson 23 does not, because it needs non-negative values.
        </p>
      </Callout>

      <h2 id="practice">Practice questions</h2>
      <p>For each question, decide which you need: the whole prefix array, just one running total, or prefix sums in a Map.</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Build the prefix array for [2, 5, 1, 3] and use it to find sum(1..2).</>,
          <>Write the range formula and explain the leading 0.</>,
          <>Explain product-except-self with a left pass and a right pass.</>,
          <>Write subarray-sum-equals-k from memory, including the starting Map entry.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        Lesson 21 covers <strong>two pointers</strong>. You use two indices that move through the array together.
        They can start at both ends and move towards the middle, or they can move in the same direction. With them
        you can solve pair sums, 3Sum and partitioning in a single pass.
      </p>
    </DsaLessonPage>
  );
}
