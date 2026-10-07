import Problem from "@/components/dsa/Problem";

/** Lesson 40 practice questions: the monotonic stack. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Next greater element I"
        level="Easy"
        examples={[
          { input: "nums1 = [4, 1, 2], nums2 = [1, 3, 4, 2]", output: "[-1, 3, -1]", why: "In nums2, after 4 nothing is greater; after 1 comes 3; after 2 nothing." },
          { input: "nums1 = [2, 4], nums2 = [1, 2, 3, 4]", output: "[3, -1]", why: "After 2 the next greater is 3; 4 has none." },
        ]}
        hints={[
          <>nums1 is a subset of nums2. Compute the next greater element for <em>every</em> value of nums2 once, and look them up.</>,
          <>Store the answers in a Map from value to its next greater value.</>,
        ]}
        approaches={[
          {
            name: "Brute force per query",
            idea: <p>For each value of nums1, find it in nums2 and scan to the right.</p>,
            code: `function nextGreaterElement(nums1, nums2) {
  return nums1.map((x) => {
    const start = nums2.indexOf(x);
    for (let j = start + 1; j < nums2.length; j++) if (nums2[j] > x) return nums2[j];
    return -1;
  });
}

console.log(nextGreaterElement([4, 1, 2], [1, 3, 4, 2])); // [-1, 3, -1]`,
            explain: <p>O(m·n).</p>,
          },
          {
            name: "Monotonic stack plus a Map",
            idea: <p>One pass over nums2 with the stack; whenever a value is popped, its answer is the current value. Then answer each nums1 value from the Map.</p>,
            code: `function nextGreaterElement(nums1, nums2) {
  const next = new Map();
  const stack = [];
  for (const x of nums2) {
    while (stack.length && stack[stack.length - 1] < x) next.set(stack.pop(), x);
    stack.push(x);
  }
  return nums1.map((x) => next.get(x) ?? -1);
}

console.log(nextGreaterElement([4, 1, 2], [1, 3, 4, 2])); // [-1, 3, -1]
console.log(nextGreaterElement([2, 4], [1, 2, 3, 4]));    // [3, -1]`,
            explain: <p>O(m + n). Storing values (not indices) is fine because the values in nums2 are distinct.</p>,
          },
        ]}
        compare={<p>The stack with a Map. (LeetCode 496.)</p>}
      >
        <p>For each number in <code>nums1</code>, find the first greater number to its right in <code>nums2</code> (or −1). All numbers are distinct.</p>
      </Problem>

      <Problem
        n={2}
        title="Next greater element II"
        level="Medium"
        examples={[
          { input: "[1, 2, 1]", output: "[2, -1, 2]", why: "The last 1 wraps around to the start and finds 2." },
          { input: "[1, 2, 3, 4, 3]", output: "[2, 3, 4, -1, 4]", why: "The last 3 wraps and finds 4." },
        ]}
        hints={[
          <>A circular array is the same array repeated. How many laps are enough?</>,
        ]}
        approaches={[
          {
            name: "Scan up to n−1 steps for each item",
            idea: <p>For every index, check the next n − 1 positions using modulo.</p>,
            code: `function nextGreaterElements(nums) {
  const n = nums.length;
  return nums.map((x, i) => {
    for (let step = 1; step < n; step++) {
      const y = nums[(i + step) % n];
      if (y > x) return y;
    }
    return -1;
  });
}

console.log(nextGreaterElements([1, 2, 1])); // [2, -1, 2]`,
            explain: <p>O(n²).</p>,
          },
          {
            name: "Stack over two laps",
            idea: <p>Loop <code>i</code> from 0 to 2n − 1, reading <code>nums[i % n]</code>, pushing indices only in the first lap.</p>,
            code: `function nextGreaterElements(nums) {
  const n = nums.length;
  const out = new Array(n).fill(-1);
  const stack = [];
  for (let i = 0; i < 2 * n; i++) {
    const x = nums[i % n];
    while (stack.length && nums[stack[stack.length - 1]] < x) out[stack.pop()] = x;
    if (i < n) stack.push(i);
  }
  return out;
}

console.log(nextGreaterElements([1, 2, 1]));       // [2, -1, 2]
console.log(nextGreaterElements([1, 2, 3, 4, 3])); // [2, 3, 4, -1, 4]`,
            explain: <p>O(n): at most n pushes and n pops overall. Two laps suffice because any answer is within n − 1 steps.</p>,
          },
        ]}
        compare={<p>The stack. (LeetCode 503.)</p>}
      >
        <p>The same question for a circular array, where the search for the next greater value may wrap around.</p>
      </Problem>

      <Problem
        n={3}
        title="Daily temperatures"
        level="Medium"
        examples={[
          { input: "[73, 74, 75, 71, 69, 72, 76, 73]", output: "[1, 1, 4, 2, 1, 1, 0, 0]", why: "From 75 (day 2) you wait four days for 76." },
          { input: "[30, 40, 50, 60]", output: "[1, 1, 1, 0]", why: "Each day is followed by a warmer one, except the last." },
        ]}
        hints={[
          <>The same pattern, but the answer is a distance. Store indices.</>,
        ]}
        approaches={[
          {
            name: "Scan forward",
            idea: <p>For each day, scan ahead until a warmer day appears.</p>,
            code: `function dailyTemperatures(temps) {
  return temps.map((t, i) => {
    for (let j = i + 1; j < temps.length; j++) if (temps[j] > t) return j - i;
    return 0;
  });
}

console.log(dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73])); // [1, 1, 4, 2, 1, 1, 0, 0]`,
            explain: <p>O(n²) for a descending array.</p>,
          },
          {
            name: "Monotonic stack of indices",
            idea: <p>Pop every waiting day colder than today; its answer is <code>i − j</code>.</p>,
            code: `function dailyTemperatures(temps) {
  const answer = new Array(temps.length).fill(0);
  const stack = [];
  for (let i = 0; i < temps.length; i++) {
    while (stack.length && temps[stack[stack.length - 1]] < temps[i]) {
      const j = stack.pop();
      answer[j] = i - j;
    }
    stack.push(i);
  }
  return answer;
}

console.log(dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73])); // [1, 1, 4, 2, 1, 1, 0, 0]
console.log(dailyTemperatures([30, 40, 50, 60]));                  // [1, 1, 1, 0]`,
            explain: <p>O(n) time and space.</p>,
          },
          {
            name: "Scan from the right with jumps",
            idea: <p>Walking backwards, use already-computed answers to jump: if <code>temps[j]</code> is not warmer, jump to the day <code>j + answer[j]</code> that was warmer than it.</p>,
            code: `function dailyTemperatures(temps) {
  const n = temps.length;
  const answer = new Array(n).fill(0);
  for (let i = n - 2; i >= 0; i--) {
    let j = i + 1;
    while (j < n && temps[j] <= temps[i]) {
      if (answer[j] === 0) { j = n; break; }   // nothing warmer than temps[j] exists, so nothing warmer than temps[i] either
      j += answer[j];
    }
    answer[i] = j < n ? j - i : 0;
  }
  return answer;
}

console.log(dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73])); // [1, 1, 4, 2, 1, 1, 0, 0]`,
            explain: <p>O(n) without an explicit stack, but it is harder to prove. Good to know it exists; use the stack in an interview.</p>,
          },
        ]}
        compare={<p>The stack. (LeetCode 739.)</p>}
      >
        <p>For each day, return how many days you must wait for a warmer temperature (0 if never).</p>
      </Problem>

      <Problem
        n={4}
        title="Online stock span"
        level="Medium"
        examples={[
          { input: "next(100), next(80), next(60), next(70), next(60), next(75), next(85)", output: "1, 1, 1, 2, 1, 4, 6", why: "75 spans back over 60, 70, 60 and itself; 85 spans over everything except 100." },
        ]}
        hints={[
          <>Prices arrive one at a time, so you cannot look ahead. Keep a stack of earlier prices.</>,
          <>If a smaller price is already summarised by a span, you do not need to look at its days again.</>,
        ]}
        approaches={[
          {
            name: "Walk back through all prices",
            idea: <p>Keep every price; for each new one count backwards while prices are at most today&apos;s.</p>,
            code: `class StockSpanner {
  constructor() { this.prices = []; }
  next(price) {
    this.prices.push(price);
    let span = 0;
    for (let i = this.prices.length - 1; i >= 0 && this.prices[i] <= price; i--) span++;
    return span;
  }
}

const s = new StockSpanner();
console.log([100, 80, 60, 70, 60, 75, 85].map((p) => s.next(p))); // [1, 1, 1, 2, 1, 4, 6]`,
            explain: <p>O(n) per call, O(n²) overall for an increasing sequence.</p>,
          },
          {
            name: "Monotonic stack of [price, span]",
            idea: <p>Pop all entries with price ≤ today&apos;s, adding their spans to today&apos;s. Push the result.</p>,
            code: `class StockSpanner {
  constructor() { this.stack = []; }
  next(price) {
    let span = 1;
    while (this.stack.length && this.stack[this.stack.length - 1][0] <= price) {
      span += this.stack.pop()[1];
    }
    this.stack.push([price, span]);
    return span;
  }
}

const s = new StockSpanner();
console.log([100, 80, 60, 70, 60, 75, 85].map((p) => s.next(p))); // [1, 1, 1, 2, 1, 4, 6]`,
            explain: <p>Amortised O(1) per call, since each entry is pushed and popped at most once.</p>,
          },
        ]}
        compare={<p>The stack with spans. (LeetCode 901.)</p>}
      >
        <p>Each call <code>next(price)</code> returns the number of consecutive days up to and including today with a price ≤ today&apos;s.</p>
      </Problem>

      <Problem
        n={5}
        title="Largest rectangle in histogram"
        level="Hard"
        examples={[
          { input: "[2, 1, 5, 6, 2, 3]", output: "10", why: "Bars 5 and 6, width 2, height 5." },
          { input: "[2, 4]", output: "4", why: "Either one bar of 4, or two bars of height 2." },
        ]}
        hints={[
          <>Fix a bar as the shortest bar in the rectangle. How far left and right can it extend?</>,
          <>Those limits are the previous smaller and next smaller bars.</>,
        ]}
        approaches={[
          {
            name: "Expand from every bar",
            idea: <p>For each bar, walk left and right while bars are at least as tall; area = height × width.</p>,
            code: `function largestRectangle(heights) {
  let best = 0;
  for (let i = 0; i < heights.length; i++) {
    let l = i, r = i;
    while (l > 0 && heights[l - 1] >= heights[i]) l--;
    while (r < heights.length - 1 && heights[r + 1] >= heights[i]) r++;
    best = Math.max(best, heights[i] * (r - l + 1));
  }
  return best;
}

console.log(largestRectangle([2, 1, 5, 6, 2, 3])); // 10`,
            explain: <p>O(n²).</p>,
          },
          {
            name: "Monotonic stack (increasing heights)",
            idea: <p>When a shorter bar arrives, pop taller bars; each popped bar's rectangle spans between the new stack top and the current index. Add a height-0 bar at the end to flush.</p>,
            code: `function largestRectangle(heights) {
  const stack = [];
  let best = 0;
  for (let i = 0; i <= heights.length; i++) {
    const h = i === heights.length ? 0 : heights[i];
    while (stack.length && heights[stack[stack.length - 1]] > h) {
      const height = heights[stack.pop()];
      const left = stack.length ? stack[stack.length - 1] : -1;
      best = Math.max(best, height * (i - left - 1));
    }
    stack.push(i);
  }
  return best;
}

console.log(largestRectangle([2, 1, 5, 6, 2, 3])); // 10
console.log(largestRectangle([2, 4]));             // 4
console.log(largestRectangle([1, 1, 1, 1]));       // 4`,
            explain: <p>O(n). For equal heights the earlier bar is popped with a width that stops at the equal bar, but the later equal bar then covers the full width, so the maximum is still correct.</p>,
          },
        ]}
        compare={<p>The stack. This is one of the most-asked hard questions; practise until you can write it without looking. (LeetCode 84.)</p>}
      >
        <p>Given bar heights (each bar has width 1), return the area of the largest rectangle that fits inside the histogram.</p>
      </Problem>

      <Problem
        n={6}
        title="Trapping rain water"
        level="Hard"
        examples={[
          { input: "[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]", output: "6", why: "Pools form between the taller bars." },
          { input: "[4, 2, 0, 3, 2, 5]", output: "9", why: "Water fills between the walls of 4 and 5." },
        ]}
        hints={[
          <>The water above one bar is <code>min(tallest to its left, tallest to its right) − its height</code>.</>,
          <>You can precompute the tallest on each side, or avoid the arrays with two pointers.</>,
        ]}
        approaches={[
          {
            name: "Prefix and suffix maximums",
            idea: <p>Arrays <code>leftMax[i]</code> and <code>rightMax[i]</code> give the walls for every bar; sum <code>min(...) − height</code>.</p>,
            code: `function trap(height) {
  const n = height.length;
  const leftMax = new Array(n), rightMax = new Array(n);
  let m = 0;
  for (let i = 0; i < n; i++) { m = Math.max(m, height[i]); leftMax[i] = m; }
  m = 0;
  for (let i = n - 1; i >= 0; i--) { m = Math.max(m, height[i]); rightMax[i] = m; }
  let water = 0;
  for (let i = 0; i < n; i++) water += Math.min(leftMax[i], rightMax[i]) - height[i];
  return water;
}

console.log(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1])); // 6
console.log(trap([4, 2, 0, 3, 2, 5]));                    // 9`,
            explain: <p>O(n) time, O(n) space. It is the same idea as a prefix sum, using maximum instead of sum.</p>,
          },
          {
            name: "Monotonic stack",
            idea: <p>Keep indices of decreasing bars. When a taller bar arrives, pop the floor and fill the pool between the new top and the current bar.</p>,
            code: `function trap(height) {
  const stack = [];
  let water = 0;
  for (let i = 0; i < height.length; i++) {
    while (stack.length && height[stack[stack.length - 1]] < height[i]) {
      const bottom = stack.pop();
      if (!stack.length) break;
      const left = stack[stack.length - 1];
      water += (i - left - 1) * (Math.min(height[left], height[i]) - height[bottom]);
    }
    stack.push(i);
  }
  return water;
}

console.log(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1])); // 6
console.log(trap([4, 2, 0, 3, 2, 5]));                    // 9`,
            explain: <p>O(n) time, O(n) space. Water is counted in horizontal layers rather than per bar.</p>,
          },
          {
            name: "Two pointers",
            idea: <p>Move inwards from the shorter side. Its water level is limited by its own running maximum, since the other side has an equal or taller wall.</p>,
            code: `function trap(height) {
  let l = 0, r = height.length - 1, leftMax = 0, rightMax = 0, water = 0;
  while (l < r) {
    if (height[l] < height[r]) {
      leftMax = Math.max(leftMax, height[l]);
      water += leftMax - height[l++];
    } else {
      rightMax = Math.max(rightMax, height[r]);
      water += rightMax - height[r--];
    }
  }
  return water;
}

console.log(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1])); // 6
console.log(trap([4, 2, 0, 3, 2, 5]));                    // 9`,
            explain: <p>O(n) time and O(1) space. The best final answer; present the prefix/suffix version first because it is easy to justify.</p>,
          },
        ]}
        compare={<p>Walk the interviewer up: prefix/suffix, then two pointers. (LeetCode 42.)</p>}
      >
        <p>Given the heights of bars of width 1, compute how much rain water is trapped between them.</p>
      </Problem>

      <Problem
        n={7}
        title="Remove K digits"
        level="Medium"
        examples={[
          { input: "num = \"1432219\", k = 3", output: "\"1219\"", why: "Removing 4, 3 and 2 leaves the smallest possible number." },
          { input: "num = \"10200\", k = 1", output: "\"200\"", why: "Remove the 1; strip the leading zero." },
          { input: "num = \"10\", k = 2", output: "\"0\"", why: "Removing everything gives zero." },
        ]}
        hints={[
          <>A digit that is larger than the one after it should be removed first: the earlier a digit is, the more it matters.</>,
          <>Keep a stack of digits that never decrease; pop while the new digit is smaller and you still have removals left.</>,
        ]}
        approaches={[
          {
            name: "Try every removal (brute force)",
            idea: <p>Try deleting each digit, k times, always keeping the smaller result.</p>,
            code: `function removeKdigits(num, k) {
  while (k > 0 && num.length > 0) {
    let best = null;
    for (let i = 0; i < num.length; i++) {
      const cand = num.slice(0, i) + num.slice(i + 1);
      if (best === null || BigInt(cand || "0") < BigInt(best || "0")) best = cand;
    }
    num = best;
    k--;
  }
  num = num.replace(/^0+/, "");
  return num === "" ? "0" : num;
}

console.log(removeKdigits("1432219", 3)); // 1219
console.log(removeKdigits("10200", 1));   // 200`,
            explain: <p>Far too slow for long inputs (up to 10⁵ digits), but it clarifies the goal.</p>,
          },
          {
            name: "Monotonic stack",
            idea: (
              <ol>
                <li>For each digit, while <code>k &gt; 0</code> and the stack top is larger than the digit, pop it (one removal).</li>
                <li>Push the digit.</li>
                <li>If removals remain, drop them from the end (the stack is non-decreasing, so the end is the largest).</li>
                <li>Strip leading zeros; return &quot;0&quot; for an empty result.</li>
              </ol>
            ),
            code: `function removeKdigits(num, k) {
  const stack = [];
  for (const d of num) {
    while (k > 0 && stack.length && stack[stack.length - 1] > d) { stack.pop(); k--; }
    stack.push(d);
  }
  while (k > 0) { stack.pop(); k--; }
  const result = stack.join("").replace(/^0+/, "");
  return result === "" ? "0" : result;
}

console.log(removeKdigits("1432219", 3)); // 1219
console.log(removeKdigits("10200", 1));   // 200
console.log(removeKdigits("10", 2));      // 0`,
            explain: <p>O(n). Comparing digit characters directly works because "0" &lt; "9" in text order, the same as in number order.</p>,
          },
        ]}
        compare={<p>The stack: another &quot;remove the earlier, larger item&quot; problem in disguise. (LeetCode 402.)</p>}
      >
        <p>Remove exactly <code>k</code> digits from a number string so the remaining number is as small as possible.</p>
      </Problem>
    </>
  );
}
