import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";

/** Lesson 20 practice questions: prefix sums, running totals and prefix sums in a Map. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Running sum"
        level="Easy"
        examples={[{ input: "[1, 2, 3, 4]", output: "[1, 3, 6, 10]", why: "Each value is the sum of everything up to and including it." }]}
        hints={[<>Each answer is the previous answer plus the current value.</>]}
        approaches={[
          {
            name: "Recompute each sum",
            idea: <p>For each i, add up nums[0..i] from scratch.</p>,
            code: `function runningSum(nums) {
  return nums.map((_, i) => nums.slice(0, i + 1).reduce((a, b) => a + b, 0));
}

console.log(runningSum([1, 2, 3, 4])); // [ 1, 3, 6, 10 ]`,
            explain: <p>O(n²): the slice and the sum are hidden loops.</p>,
          },
          {
            name: "Carry the total",
            idea: <p>Add each value to the one before it, in place.</p>,
            code: `function runningSum(nums) {
  for (let i = 1; i < nums.length; i++) nums[i] += nums[i - 1];
  return nums;
}

console.log(runningSum([1, 2, 3, 4]));    // [ 1, 3, 6, 10 ]
console.log(runningSum([3, 1, 2, 10, 1])); // [ 3, 4, 6, 16, 17 ]`,
            explain: <p>O(n), O(1) extra space. This is a prefix array without the leading 0.</p>,
          },
        ]}
        compare={<p>The whole lesson in one line: reuse the previous total instead of recomputing it. (LeetCode 1480.)</p>}
      >
        <p>Return the running sum of <code>nums</code>.</p>
      </Problem>

      <Problem
        n={2}
        title="Range sum query"
        level="Easy"
        examples={[
          { input: "nums = [-2, 0, 3, -5, 2, -1]; sumRange(0, 2), sumRange(2, 5), sumRange(0, 5)", output: "1, -1, -3", why: "−2 + 0 + 3 = 1; 3 − 5 + 2 − 1 = −1; the whole array is −3." },
        ]}
        hints={[<>Build the prefix array in the constructor. Each query is then one subtraction.</>]}
        approaches={[
          {
            name: "Prefix array in a class",
            idea: <p>Pay O(n) once, answer each query in O(1).</p>,
            code: `class NumArray {
  constructor(nums) {
    this.pre = [0];
    for (const x of nums) this.pre.push(this.pre[this.pre.length - 1] + x);
  }
  sumRange(left, right) {
    return this.pre[right + 1] - this.pre[left];
  }
}

const na = new NumArray([-2, 0, 3, -5, 2, -1]);
console.log(na.sumRange(0, 2)); // 1
console.log(na.sumRange(2, 5)); // -1
console.log(na.sumRange(0, 5)); // -3`,
            explain: <p>O(n) to build, O(1) per query, O(n) space. Negative values work exactly the same.</p>,
          },
        ]}
        compare={<p>The standard prefix-sum design question. If the array could also be <em>updated</em>, a prefix array would need O(n) per update — a different structure (a Fenwick or segment tree) is used then. (LeetCode 303.)</p>}
      >
        <p>Design a class that is given an array once and then answers many &ldquo;sum of nums[left..right]&rdquo; queries quickly.</p>
      </Problem>

      <Problem
        n={3}
        title="Find pivot index"
        level="Easy"
        examples={[
          { input: "[1, 7, 3, 6, 5, 6]", output: "3", why: "Left of index 3: 1 + 7 + 3 = 11. Right: 5 + 6 = 11." },
          { input: "[1, 2, 3]", output: "-1", why: "No index balances." },
          { input: "[2, 1, -1]", output: "0", why: "Edge case: the left of index 0 is empty (sum 0); the right is 1 + (−1) = 0." },
        ]}
        hints={[<>right sum = total − left sum − nums[i].</>]}
        approaches={[
          {
            name: "Total and a running left sum",
            idea: <p>Compute the total once, then walk with a left sum.</p>,
            code: `function pivotIndex(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  let left = 0;
  for (let i = 0; i < nums.length; i++) {
    if (left === total - left - nums[i]) return i;
    left += nums[i];
  }
  return -1;
}

console.log(pivotIndex([1, 7, 3, 6, 5, 6])); // 3
console.log(pivotIndex([1, 2, 3]));          // -1
console.log(pivotIndex([2, 1, -1]));         // 0`,
            explain: <p>O(n) time, O(1) space. Checking before adding <code>nums[i]</code> to <code>left</code> keeps the pivot itself out of both sides.</p>,
          },
        ]}
        compare={<p>Note the edge case in example 3: an index can be the pivot even when one side is empty. (LeetCode 724.)</p>}
      >
        <p>Return the leftmost index where the sum of the values strictly to its left equals the sum strictly to its right, or −1.</p>
      </Problem>

      <Problem
        n={4}
        title="Product of array except self"
        level="Medium"
        examples={[
          { input: "[1, 2, 3, 4]", output: "[24, 12, 8, 6]", why: "For index 0: 2 × 3 × 4 = 24, and so on." },
          { input: "[-1, 1, 0, -3, 3]", output: "[0, 0, 9, 0, 0]", why: "Only index 2 (the zero) has a product of non-zero values: −1 × 1 × −3 × 3 = 9." },
        ]}
        hints={[
          <>Division is not allowed (and would fail with zeros).</>,
          <>out[i] = (product of everything left of i) × (product of everything right of i).</>,
        ]}
        approaches={[
          {
            name: "Two passes with running products",
            idea: <p>Left pass stores the left product; right pass multiplies in the right product.</p>,
            code: `function productExceptSelf(nums) {
  const n = nums.length;
  const out = new Array(n);
  let left = 1;
  for (let i = 0; i < n; i++) { out[i] = left; left *= nums[i]; }
  let right = 1;
  for (let i = n - 1; i >= 0; i--) { out[i] *= right; right *= nums[i]; }
  return out;
}

console.log(productExceptSelf([1, 2, 3, 4]));      // [ 24, 12, 8, 6 ]
console.log(productExceptSelf([-1, 1, 0, -3, 3])); // [ -0, 0, 9, -0, 0 ]`,
            explain: <p>O(n) time, O(1) extra space besides the output. JavaScript prints <code>-0</code> where a negative was multiplied by 0; <code>-0 === 0</code> is true, so it is the correct answer.</p>,
          },
        ]}
        compare={<p>A classic: prefix and suffix products without division. (LeetCode 238.)</p>}
      >
        <p>Return an array where each position holds the product of every other value. Do it in O(n) without division.</p>
      </Problem>

      <Problem
        n={5}
        title="Subarray sum equals k"
        level="Medium"
        examples={[
          { input: "nums = [1, 1, 1], k = 2", output: "2", why: "[1, 1] starting at index 0, and [1, 1] starting at index 1." },
          { input: "nums = [1, 2, 3], k = 3", output: "2", why: "[1, 2] and [3]." },
        ]}
        hints={[
          <>Brute force: every start, every end. O(n²).</>,
          <>A subarray ending here sums to k exactly when an earlier prefix sum equals (current prefix − k). Count earlier prefix sums in a Map.</>,
        ]}
        approaches={[
          {
            name: "Every start, running sum",
            idea: <p>For each start, extend the end one by one while keeping a running sum.</p>,
            code: `function subarraySum(nums, k) {
  let count = 0;
  for (let i = 0; i < nums.length; i++) {
    let s = 0;
    for (let j = i; j < nums.length; j++) {
      s += nums[j];
      if (s === k) count++;
    }
  }
  return count;
}

console.log(subarraySum([1, 1, 1], 2)); // 2`,
            explain: <p>O(n²) time — too slow for 2 × 10<sup>4</sup> values with many queries, but a correct baseline.</p>,
          },
          {
            name: "Prefix sums in a Map",
            idea: <p>The algorithm from the lesson.</p>,
            code: `function subarraySum(nums, k) {
  const seen = new Map([[0, 1]]);
  let sum = 0, count = 0;
  for (const x of nums) {
    sum += x;
    count += seen.get(sum - k) ?? 0;
    seen.set(sum, (seen.get(sum) ?? 0) + 1);
  }
  return count;
}

console.log(subarraySum([1, 1, 1], 2)); // 2
console.log(subarraySum([1, 2, 3], 3)); // 2`,
            explain: <p>O(n) time, O(n) space. Works with negative numbers and zeros.</p>,
          },
        ]}
        compare={<p>One of the most important medium problems. Learn the four lines inside the loop by heart. (LeetCode 560.)</p>}
      >
        <p>Return the number of subarrays whose values add up to exactly <code>k</code>. Values may be negative.</p>
      </Problem>

      <Problem
        n={6}
        title="Longest subarray with equal 0s and 1s"
        level="Medium"
        examples={[
          { input: "[0, 1]", output: "2", why: "One 0 and one 1." },
          { input: "[0, 1, 0]", output: "2", why: "[0, 1] or [1, 0]." },
          { input: "[0, 0, 1, 0, 0, 0, 1, 1]", output: "6", why: "Indices 2–7: [1, 0, 0, 0, 1, 1] has three of each." },
        ]}
        hints={[
          <>Treat each 0 as −1. Then &ldquo;equal counts&rdquo; means &ldquo;sum is 0&rdquo;.</>,
          <>A subarray has sum 0 when two prefix sums are equal. For the <em>longest</em>, remember the <em>first</em> index of each prefix sum.</>,
        ]}
        approaches={[
          {
            name: "Prefix sum → first index",
            idea: <p>Running sum with 0 as −1. If the same sum was seen before at index j, the part after j sums to 0.</p>,
            code: `function findMaxLength(nums) {
  const first = new Map([[0, -1]]);    // sum 0 "seen" just before index 0
  let sum = 0, best = 0;
  for (let i = 0; i < nums.length; i++) {
    sum += nums[i] === 1 ? 1 : -1;
    if (first.has(sum)) best = Math.max(best, i - first.get(sum));
    else first.set(sum, i);            // keep only the earliest index
  }
  return best;
}

console.log(findMaxLength([0, 1]));                   // 2
console.log(findMaxLength([0, 1, 0]));                // 2
console.log(findMaxLength([0, 0, 1, 0, 0, 0, 1, 1])); // 6`,
            explain: (
              <DryRun
                title="[0, 1, 0]"
                cols={["i", "value as ±1", "sum", "first seen", "length"]}
                rows={[
                  ["", "", "0", "−1", ""],
                  ["0", "−1", "−1", "new → 0", ""],
                  ["1", "+1", "0", "at −1", "1 − (−1) = 2"],
                  ["2", "−1", "−1", "at 0", "2 − 0 = 2"],
                ]}
              />
            ),
          },
        ]}
        compare={<p>Two changes from Question 5: store the first <em>index</em> (not a count), and transform the values (0 → −1). O(n) time and space. (LeetCode 525.)</p>}
      >
        <p>Given an array of 0s and 1s, return the length of the longest subarray with an equal number of each.</p>
      </Problem>

      <Problem
        n={7}
        title="Subarray sums divisible by k"
        level="Medium"
        examples={[
          { input: "nums = [4, 5, 0, -2, -3, 1], k = 5", output: "7", why: "For example [5], [5, 0], [0], [-2, -3] and [4, 5, 0, -2, -3, 1] — seven in total." },
          { input: "nums = [5], k = 9", output: "0", why: "5 is not divisible by 9." },
        ]}
        hints={[
          <>A subarray sum is divisible by k when two prefix sums have the <em>same remainder</em> modulo k.</>,
          <>Count remainders in a Map. Remember from Lesson 13: in JavaScript, <code>-7 % 5</code> is <code>-2</code>, so normalise.</>,
        ]}
        approaches={[
          {
            name: "Count prefix remainders",
            idea: <p>Like Question 5, but the Map key is <code>sum mod k</code>, made non-negative.</p>,
            code: `function subarraysDivByK(nums, k) {
  const seen = new Map([[0, 1]]);
  let sum = 0, count = 0;
  for (const x of nums) {
    sum += x;
    const r = ((sum % k) + k) % k;     // always 0..k-1, even for negative sums
    count += seen.get(r) ?? 0;
    seen.set(r, (seen.get(r) ?? 0) + 1);
  }
  return count;
}

console.log(subarraysDivByK([4, 5, 0, -2, -3, 1], 5)); // 7
console.log(subarraysDivByK([5], 9));                  // 0`,
            explain: <p>O(n) time, O(k) space. Without the <code>+ k</code> fix, the remainders −2 and 3 would be counted as different, and the answer would be wrong.</p>,
          },
        ]}
        compare={<p>Prefix sums combined with modular arithmetic — two earlier lessons in one problem. (LeetCode 974.)</p>}
      >
        <p>Return the number of non-empty subarrays whose sum is divisible by <code>k</code>.</p>
      </Problem>
    </>
  );
}
