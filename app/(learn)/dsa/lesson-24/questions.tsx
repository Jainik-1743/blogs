import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";

/** Lesson 24 practice questions: Kadane's algorithm and its relatives. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Maximum subarray"
        level="Medium"
        examples={[
          { input: "[-2, 1, -3, 4, -1, 2, 1, -5, 4]", output: "6", why: "[4, −1, 2, 1]." },
          { input: "[1]", output: "1", why: "One item." },
          { input: "[-3, -1, -2]", output: "-1", why: "Edge case: all numbers are negative. The best subarray is the single largest value." },
        ]}
        hints={[<>The best sum that ends at i is max(nums[i], the best sum that ends at i − 1, plus nums[i]).</>]}
        approaches={[
          {
            name: "Every start, running sum",
            idea: <p>This is the brute force method. It tries every start and every end.</p>,
            code: `function maxSubArray(nums) {
  let best = -Infinity;
  for (let i = 0; i < nums.length; i++) {
    let s = 0;
    for (let j = i; j < nums.length; j++) best = Math.max(best, (s += nums[j]));
  }
  return best;
}

console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 6`,
            explain: <p>O(n²). It is too slow for 10<sup>5</sup> values.</p>,
          },
          {
            name: "Kadane",
            idea: <p>At each item, extend the current run or start again. Keep the best sum you have seen.</p>,
            code: `function maxSubArray(nums) {
  let cur = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    best = Math.max(best, cur);
  }
  return best;
}

console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 6
console.log(maxSubArray([1]));                             // 1
console.log(maxSubArray([-3, -1, -2]));                    // -1`,
            explain: <p>O(n) time, O(1) space.</p>,
          },
        ]}
        compare={<p>Kadane is the answer interviewers expect. Be ready to return the start and end indices as a follow-up question. (LeetCode 53.)</p>}
      >
        <p>Return the largest sum of any subarray that has at least one item.</p>
      </Problem>

      <Problem
        n={2}
        title="Best time to buy and sell stock"
        level="Easy"
        examples={[
          { input: "[7, 1, 5, 3, 6, 4]", output: "5", why: "Buy at 1 (day 1), sell at 6 (day 4)." },
          { input: "[7, 6, 4, 3, 1]", output: "0", why: "The prices only fall, so do not trade." },
        ]}
        hints={[<>You must buy before you sell. For each day, ask: what is the cheapest earlier price?</>]}
        approaches={[
          {
            name: "Every pair of days",
            idea: <p>Try every buy day with every later sell day.</p>,
            code: `function maxProfit(prices) {
  let best = 0;
  for (let i = 0; i < prices.length; i++)
    for (let j = i + 1; j < prices.length; j++)
      best = Math.max(best, prices[j] - prices[i]);
  return best;
}

console.log(maxProfit([7, 1, 5, 3, 6, 4])); // 5`,
            explain: <p>O(n²).</p>,
          },
          {
            name: "Minimum so far",
            idea: <p>Keep the lowest price seen so far. On each day, try to sell.</p>,
            code: `function maxProfit(prices) {
  let minPrice = Infinity, best = 0;
  for (const p of prices) {
    minPrice = Math.min(minPrice, p);
    best = Math.max(best, p - minPrice);
  }
  return best;
}

console.log(maxProfit([7, 1, 5, 3, 6, 4])); // 5
console.log(maxProfit([7, 6, 4, 3, 1]));    // 0`,
            explain: <p>O(n) time, O(1) space. First update the lowest price, then try to sell. This way you never sell before you buy. (If you buy and sell on the same day, the profit is 0.)</p>,
          },
        ]}
        compare={<p>This is a very common first question. (LeetCode 121.)</p>}
      >
        <p>Choose one day to buy and a later day to sell. Return the largest profit. If you cannot make a profit, return 0.</p>
      </Problem>

      <Problem
        n={3}
        title="Buy and sell stock, many trades"
        level="Medium"
        examples={[
          { input: "[7, 1, 5, 3, 6, 4]", output: "7", why: "Buy 1 sell 5 (+4), buy 3 sell 6 (+3)." },
          { input: "[1, 2, 3, 4, 5]", output: "4", why: "Buy 1 sell 5 — the same as collecting every daily rise." },
        ]}
        hints={[<>You can trade as many times as you like, and you hold at most one share. So you can collect every price rise.</>]}
        approaches={[
          {
            name: "Sum of positive daily changes",
            idea: <p>Add <code>prices[i] − prices[i − 1]</code> whenever the result is positive.</p>,
            code: `function maxProfit(prices) {
  let profit = 0;
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > prices[i - 1]) profit += prices[i] - prices[i - 1];
  }
  return profit;
}

console.log(maxProfit([7, 1, 5, 3, 6, 4])); // 7
console.log(maxProfit([1, 2, 3, 4, 5]));    // 4`,
            explain: <p>O(n) time. A long rise from 1 to 5 earns the same as its daily steps, 1+1+1+1. So splitting a trade into smaller trades never loses money.</p>,
          },
        ]}
        compare={<p>Read the rules with care. One trade (Question 2) and many trades need very different solutions. (LeetCode 122.)</p>}
      >
        <p>You may buy and sell as many times as you like, but you can hold at most one share at a time. Return the largest profit.</p>
      </Problem>

      <Problem
        n={4}
        title="Maximum product subarray"
        level="Medium"
        examples={[
          { input: "[2, 3, -2, 4]", output: "6", why: "[2, 3]." },
          { input: "[-2, 0, -1]", output: "0", why: "The 0 breaks any product; [0] itself gives 0." },
          { input: "[-2, 3, -4]", output: "24", why: "All three: the negatives cancel." },
        ]}
        hints={[<>A negative number turns the smallest product into the largest one. So keep both.</>]}
        approaches={[
          {
            name: "Kadane with max and min",
            idea: <p>For each x, the new largest and smallest products come from three choices: x alone, hi × x and lo × x.</p>,
            code: `function maxProduct(nums) {
  let hi = nums[0], lo = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    const x = nums[i];
    const a = hi * x, b = lo * x;
    hi = Math.max(x, a, b);
    lo = Math.min(x, a, b);
    best = Math.max(best, hi);
  }
  return best;
}

console.log(maxProduct([2, 3, -2, 4])); // 6
console.log(maxProduct([-2, 0, -1]));   // 0
console.log(maxProduct([-2, 3, -4]));   // 24`,
            explain: <p>O(n) time, O(1) space. Work out <code>a</code> and <code>b</code> before you change <code>hi</code>. The new <code>lo</code> must use the old <code>hi</code>.</p>,
          },
        ]}
        compare={<p>This is a classic follow-up to Question 1. (LeetCode 152.)</p>}
      >
        <p>Return the largest product of any subarray that has at least one item.</p>
      </Problem>

      <Problem
        n={5}
        title="Maximum sum circular subarray"
        level="Medium"
        examples={[
          { input: "[1, -2, 3, -2]", output: "3", why: "[3]." },
          { input: "[5, -3, 5]", output: "10", why: "Wrap around: [5, 5]." },
          { input: "[-3, -2, -3]", output: "-2", why: "All numbers are negative, so the best is −2 on its own." },
        ]}
        hints={[<>The best subarray either does not wrap (use normal Kadane), or it wraps. If it wraps, its sum is the total minus the smallest middle part.</>]}
        approaches={[
          {
            name: "Max Kadane and min Kadane together",
            idea: <p>Make one pass. Work out the total, the best maximum and the best minimum.</p>,
            code: `function maxSubarraySumCircular(nums) {
  let total = 0, curMax = 0, bestMax = -Infinity, curMin = 0, bestMin = Infinity;
  for (const x of nums) {
    total += x;
    curMax = Math.max(x, curMax + x);
    bestMax = Math.max(bestMax, curMax);
    curMin = Math.min(x, curMin + x);
    bestMin = Math.min(bestMin, curMin);
  }
  return bestMax < 0 ? bestMax : Math.max(bestMax, total - bestMin);
}

console.log(maxSubarraySumCircular([1, -2, 3, -2])); // 3
console.log(maxSubarraySumCircular([5, -3, 5]));     // 10
console.log(maxSubarraySumCircular([-3, -2, -3]));   // -2`,
            explain: (
              <DryRun
                title="[5, −3, 5]"
                cols={["Case", "Value"]}
                rows={[["Best non-wrapping (Kadane)", "7  ([5, −3, 5])"], ["Total", "7"], ["Smallest subarray", "−3"], ["Best wrapping = 7 − (−3)", "10"]]}
                highlight={3}
              />
            ),
          },
        ]}
        compare={<p>O(n) time, O(1) space. The key idea is to change &ldquo;wraps around&rdquo; into &ldquo;everything except a middle part&rdquo;. (LeetCode 918.)</p>}
      >
        <p>The array is circular, so the end connects back to the start. Return the largest sum of a subarray that has at least one item. The subarray may wrap around.</p>
      </Problem>

      <Problem
        n={6}
        title="Maximum absolute sum of any subarray"
        level="Medium"
        examples={[
          { input: "[1, -3, 2, 3, -4]", output: "5", why: "[2, 3] has sum 5. The most negative subarray sum is only −4, so 5 is the answer." },
          { input: "[2, -5, 1, -4, 3, -2]", output: "8", why: "[−5, 1, −4] has sum −8, and |−8| = 8." },
        ]}
        hints={[<>The absolute value of a sum is its size without the minus sign. The largest one comes from either the largest sum or the smallest (most negative) sum.</>]}
        approaches={[
          {
            name: "Max and min Kadane",
            idea: <p>Run both versions in one pass. Return the larger of the best maximum and −(the best minimum).</p>,
            code: `function maxAbsoluteSum(nums) {
  let curMax = 0, curMin = 0, best = 0;
  for (const x of nums) {
    curMax = Math.max(x, curMax + x);
    curMin = Math.min(x, curMin + x);
    best = Math.max(best, curMax, -curMin);
  }
  return best;
}

console.log(maxAbsoluteSum([1, -3, 2, 3, -4]));     // 5
console.log(maxAbsoluteSum([2, -5, 1, -4, 3, -2])); // 8`,
            explain: <p>O(n) time, O(1) space. There is another way to see it. The answer equals (largest prefix sum) − (smallest prefix sum), using Lesson 20.</p>,
          },
        ]}
        compare={<p>When you know the max version and the min version of Kadane, many variations take only a few lines. (LeetCode 1749.)</p>}
      >
        <p>Return the largest absolute value of the sum of any subarray. The empty subarray, with sum 0, is allowed.</p>
      </Problem>
    </>
  );
}
