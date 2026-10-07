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
          { input: "nums1 = [4, 1, 2], nums2 = [1, 3, 4, 2]", output: "[-1, 3, -1]", why: "In nums2, nothing bigger comes after 4. After 1 comes 3. Nothing bigger comes after 2." },
          { input: "nums1 = [2, 4], nums2 = [1, 2, 3, 4]", output: "[3, -1]", why: "After 2 the next bigger number is 3. There is none for 4." },
        ]}
        hints={[
          <>nums1 is a subset of nums2 (every number in nums1 is also in nums2). Work out the next greater element for <em>every</em> value of nums2 once, and then look the answers up.</>,
          <>Store the answers in a Map. Each value points to its next greater value.</>,
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
            explain: <p>O(m·n), where m is the length of nums1 and n is the length of nums2.</p>,
          },
          {
            name: "Monotonic stack plus a Map",
            idea: <p>Go through nums2 once with the stack. Whenever you pop a value, its answer is the current value. Then look up each nums1 value in the Map.</p>,
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
            explain: <p>O(m + n). You can store values (not indices) because all the values in nums2 are different.</p>,
          },
        ]}
        compare={<p>Use the stack with a Map. (LeetCode 496.)</p>}
      >
        <p>For each number in <code>nums1</code>, find the first bigger number to its right in <code>nums2</code>. If there is none, the answer is −1. All numbers are different.</p>
      </Problem>

      <Problem
        n={2}
        title="Next greater element II"
        level="Medium"
        examples={[
          { input: "[1, 2, 1]", output: "[2, -1, 2]", why: "The last 1 wraps around to the start and finds 2." },
          { input: "[1, 2, 3, 4, 3]", output: "[2, 3, 4, -1, 4]", why: "The last 3 wraps around and finds 4." },
        ]}
        hints={[
          <>A circular array works like the same array repeated again and again. How many laps are enough?</>,
        ]}
        approaches={[
          {
            name: "Scan up to n−1 steps for each item",
            idea: <p>For every index, check the next n − 1 positions. Use modulo (<code>%</code>, the remainder) to wrap back to the start.</p>,
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
            idea: <p>Loop <code>i</code> from 0 to 2n − 1 and read <code>nums[i % n]</code>. Push indices only during the first lap.</p>,
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
            explain: <p>O(n). There are at most n pushes and n pops in total. Two laps are enough, because any answer is within n − 1 steps.</p>,
          },
        ]}
        compare={<p>Use the stack. (LeetCode 503.)</p>}
      >
        <p>The same question, but the array is circular. The search for the next greater value may wrap around to the start.</p>
      </Problem>

      <Problem
        n={3}
        title="Daily temperatures"
        level="Medium"
        examples={[
          { input: "[73, 74, 75, 71, 69, 72, 76, 73]", output: "[1, 1, 4, 2, 1, 1, 0, 0]", why: "From 75 (day 2) you wait four days for 76." },
          { input: "[30, 40, 50, 60]", output: "[1, 1, 1, 0]", why: "A warmer day follows each day, except the last day." },
        ]}
        hints={[
          <>It is the same pattern, but the answer is a distance. Store indices (positions).</>,
        ]}
        approaches={[
          {
            name: "Scan forward",
            idea: <p>For each day, look ahead until you find a warmer day.</p>,
            code: `function dailyTemperatures(temps) {
  return temps.map((t, i) => {
    for (let j = i + 1; j < temps.length; j++) if (temps[j] > t) return j - i;
    return 0;
  });
}

console.log(dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73])); // [1, 1, 4, 2, 1, 1, 0, 0]`,
            explain: <p>O(n²) when the temperatures keep going down.</p>,
          },
          {
            name: "Monotonic stack of indices",
            idea: <p>Pop every waiting day that is colder than today. Its answer is <code>i − j</code>.</p>,
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
            name: "Scan from the right and jump ahead",
            idea: <p>Walk backwards and use the answers you already have to jump ahead. If <code>temps[j]</code> is not warmer, jump to the day <code>j + answer[j]</code>, which was warmer than day <code>j</code>.</p>,
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
            explain: <p>O(n) without a stack, but it is harder to prove that it works. It is good to know it exists. In an interview, use the stack.</p>,
          },
        ]}
        compare={<p>Use the stack. (LeetCode 739.)</p>}
      >
        <p>For each day, return how many days you must wait for a warmer temperature. If it never gets warmer, return 0.</p>
      </Problem>

      <Problem
        n={4}
        title="Online stock span"
        level="Medium"
        examples={[
          { input: "next(100), next(80), next(60), next(70), next(60), next(75), next(85)", output: "1, 1, 1, 2, 1, 4, 6", why: "75 spans back over 60, 70, 60 and itself. 85 spans over everything except 100." },
        ]}
        hints={[
          <>Prices arrive one at a time, so you cannot look ahead. Keep a stack of earlier prices.</>,
          <>If a smaller price is already counted in a span, you do not need to look at its days again.</>,
        ]}
        approaches={[
          {
            name: "Walk back through all prices",
            idea: <p>Keep every price. For each new price, count backwards while the earlier prices are at most today&apos;s price.</p>,
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
            explain: <p>O(n) per call. If the prices keep going up, the total is O(n²).</p>,
          },
          {
            name: "Monotonic stack of [price, span]",
            idea: <p>Pop all entries with a price ≤ today&apos;s price, and add their spans to today&apos;s span. Then push the result.</p>,
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
            explain: <p>The average cost is O(1) per call (amortised), because each entry is pushed once and popped at most once.</p>,
          },
        ]}
        compare={<p>Use the stack with spans. (LeetCode 901.)</p>}
      >
        <p>Each call <code>next(price)</code> returns the number of days in a row, up to and including today, with a price ≤ today&apos;s price.</p>
      </Problem>

      <Problem
        n={5}
        title="Largest rectangle in histogram"
        level="Hard"
        examples={[
          { input: "[2, 1, 5, 6, 2, 3]", output: "10", why: "Bars 5 and 6, width 2, height 5." },
          { input: "[2, 4]", output: "4", why: "Either one bar of height 4, or two bars of height 2 side by side." },
        ]}
        hints={[
          <>Pick one bar to be the shortest bar in the rectangle. How far can the rectangle go to the left and to the right?</>,
          <>The limits are the previous smaller bar and the next smaller bar.</>,
        ]}
        approaches={[
          {
            name: "Expand from every bar",
            idea: <p>For each bar, walk left and right as long as the bars are at least as tall. The area is height × width.</p>,
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
            idea: <p>When a shorter bar arrives, pop the taller bars. Each popped bar's rectangle spans from the new stack top to the current index. Add a bar of height 0 at the end to empty the stack.</p>,
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
            explain: <p>O(n). When two bars have equal heights, the later bar is popped first, and its width stops at the earlier equal bar. But the earlier bar is popped afterwards, and its rectangle covers the full width. So the biggest area is still correct.</p>,
          },
        ]}
        compare={<p>Use the stack. This is one of the hard questions that interviewers ask most. Practise until you can write it without looking. (LeetCode 84.)</p>}
      >
        <p>You get the bar heights (each bar has width 1). Return the area of the largest rectangle that fits inside the histogram.</p>
      </Problem>

      <Problem
        n={6}
        title="Trapping rain water"
        level="Hard"
        examples={[
          { input: "[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]", output: "6", why: "Water pools form between the taller bars." },
          { input: "[4, 2, 0, 3, 2, 5]", output: "9", why: "Water fills the space between the walls of height 4 and 5." },
        ]}
        hints={[
          <>The water above one bar is <code>min(tallest bar to its left, tallest bar to its right) − its own height</code>.</>,
          <>You can work out the tallest bar on each side first and store it. Or you can use two pointers and skip the extra arrays.</>,
        ]}
        approaches={[
          {
            name: "Biggest so far from the left and from the right",
            idea: <p>The arrays <code>leftMax[i]</code> and <code>rightMax[i]</code> give the two walls for every bar. Add up <code>min(...) − height</code> for all bars.</p>,
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
            explain: <p>O(n) time, O(n) space. It is the same idea as a prefix sum (a running total), but it keeps the biggest value so far instead of the sum.</p>,
          },
          {
            name: "Monotonic stack",
            idea: <p>Keep the indices of bars whose heights go down. When a taller bar arrives, pop the floor bar. Then fill the pool between the new top bar and the current bar.</p>,
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
            explain: <p>O(n) time, O(n) space. This version counts the water in horizontal layers, not bar by bar.</p>,
          },
          {
            name: "Two pointers",
            idea: <p>Move in from the shorter side. The water level there is set by the tallest bar seen so far on that side, because the other side has a wall that is equal or taller.</p>,
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
            explain: <p>O(n) time and O(1) space. This is the best final answer. Show the left-and-right-maximum version first, because it is easy to explain.</p>,
          },
        ]}
        compare={<p>Take the interviewer step by step: first the left and right maximum arrays, then two pointers. (LeetCode 42.)</p>}
      >
        <p>You get the heights of bars that are each 1 wide. Work out how much rain water is trapped between them.</p>
      </Problem>

      <Problem
        n={7}
        title="Remove K digits"
        level="Medium"
        examples={[
          { input: "num = \"1432219\", k = 3", output: "\"1219\"", why: "Remove 4, 3 and 2. What is left is the smallest possible number." },
          { input: "num = \"10200\", k = 1", output: "\"200\"", why: "Remove the 1, then remove the zero at the front." },
          { input: "num = \"10\", k = 2", output: "\"0\"", why: "If you remove everything, the answer is zero." },
        ]}
        hints={[
          <>If a digit is bigger than the digit after it, remove it first. The earlier a digit is, the more it matters.</>,
          <>Keep a stack of digits that never go down. Pop while the new digit is smaller and you still have removals left.</>,
        ]}
        approaches={[
          {
            name: "Try every removal (brute force)",
            idea: <p>Try deleting each digit, and repeat this k times. Each time, keep the smaller result.</p>,
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
            explain: <p>Far too slow for long inputs (up to 10⁵ digits). But it makes the goal clear.</p>,
          },
          {
            name: "Monotonic stack",
            idea: (
              <ol>
                <li>For each digit: while <code>k &gt; 0</code> and the stack top is bigger than the digit, pop the top. That is one removal.</li>
                <li>Push the digit.</li>
                <li>If you still have removals left, remove digits from the end. The stack never goes down, so its end holds the biggest digits.</li>
                <li>Remove the zeros at the front. If nothing is left, return &quot;0&quot;.</li>
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
            explain: <p>O(n). You can compare the digit characters directly, because "0" &lt; "9" in text order, just like in number order.</p>,
          },
        ]}
        compare={<p>Use the stack. This is another &quot;remove the earlier, bigger item&quot; problem in disguise. (LeetCode 402.)</p>}
      >
        <p>Remove exactly <code>k</code> digits from a number string. The number that is left must be as small as possible.</p>
      </Problem>
    </>
  );
}
