import Problem from "@/components/dsa/Problem";

/** Lesson 54 practice questions: from plain recursion to memoization and tabulation on easy 1-D problems. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Fibonacci number"
        level="Easy"
        examples={[
          { input: "n = 2", output: "1", why: "F(2) = F(1) + F(0) = 1 + 0." },
          { input: "n = 4", output: "3", why: "F(4) = F(3) + F(2) = 2 + 1." },
          { input: "n = 0", output: "0", why: "F(0) = 0 by definition." },
        ]}
        hints={[
          <>The definition is already a recursion (a function that calls itself): <code>F(n) = F(n-1) + F(n-2)</code>.</>,
          <>Draw the tree of calls for F(5). Which parts of the tree repeat?</>,
          <>Each value depends only on the two before it. How many variables do you need?</>,
        ]}
        approaches={[
          {
            name: "Plain recursion",
            idea: <p>Copy the definition into code. It is correct, but every call starts two more calls.</p>,
            code: `function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

console.log(fib(2)); // 1
console.log(fib(4)); // 3
console.log(fib(0)); // 0`,
            explain: <p>The tree of calls has about 1.6ⁿ boxes, so the time grows exponentially (O(2ⁿ) is an easy upper limit). The space is the recursion depth, O(n). It is fine for n up to 30, but far too slow for bigger n.</p>,
          },
          {
            name: "Memoization (top-down)",
            idea: <p>Use the same recursion plus a Map. Look the answer up before you work it out. Store it before you return.</p>,
            code: `function fib(n, memo = new Map()) {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n);
  const answer = fib(n - 1, memo) + fib(n - 2, memo);
  memo.set(n, answer);
  return answer;
}

console.log(fib(2));  // 1
console.log(fib(4));  // 3
console.log(fib(30)); // 832040`,
            explain: <p>Each of the n + 1 states is worked out once. The time is O(n). The space is O(n) for the cache and the call stack.</p>,
          },
          {
            name: "Bottom-up with two variables",
            idea: <p>Go from 2 up to n and keep only the last two Fibonacci numbers.</p>,
            code: `function fib(n) {
  if (n <= 1) return n;
  let prev = 0, curr = 1;
  for (let i = 2; i <= n; i++) {
    [prev, curr] = [curr, prev + curr];
  }
  return curr;
}

console.log(fib(2));  // 1
console.log(fib(4));  // 3
console.log(fib(0));  // 0
console.log(fib(30)); // 832040`,
            explain: <p>The time is O(n) and the space is O(1). There is no recursion at all.</p>,
          },
        ]}
        compare={<p>In an interview, write the loop with two variables. If you mention the memo version first, it shows you understand why it works. (LeetCode 509.)</p>}
      >
        <p>
          The Fibonacci numbers follow these rules: <code>F(0) = 0</code>, <code>F(1) = 1</code> and{" "}
          <code>F(n) = F(n − 1) + F(n − 2)</code> for n &gt; 1. Given <code>n</code>, return <code>F(n)</code>.
        </p>
      </Problem>

      <Problem
        n={2}
        title="Climbing stairs"
        level="Easy"
        examples={[
          { input: "n = 2", output: "2", why: "1+1 or 2." },
          { input: "n = 3", output: "3", why: "1+1+1, 1+2 or 2+1." },
          { input: "n = 5", output: "8", why: "ways(5) = ways(4) + ways(3) = 5 + 3." },
        ]}
        hints={[
          <>Think about the very last move. Where were you standing before it?</>,
          <>You were on step n − 1 (then you took a 1-step) or on step n − 2 (then you took a 2-step). These two cases never overlap.</>,
          <>What are the answers for n = 0 and n = 1?</>,
        ]}
        approaches={[
          {
            name: "Plain recursion",
            idea: <p><code>ways(n) = ways(n-1) + ways(n-2)</code>, with <code>ways(0) = ways(1) = 1</code>.</p>,
            code: `function climbStairs(n) {
  if (n <= 1) return 1;
  return climbStairs(n - 1) + climbStairs(n - 2);
}

console.log(climbStairs(2)); // 2
console.log(climbStairs(3)); // 3
console.log(climbStairs(5)); // 8`,
            explain: <p>The time grows exponentially, because the answer for the same step is worked out again in many branches.</p>,
          },
          {
            name: "Memoization",
            idea: <p>Save <code>ways(n)</code> in a Map (the cache).</p>,
            code: `function climbStairs(n, memo = new Map()) {
  if (n <= 1) return 1;
  if (memo.has(n)) return memo.get(n);
  const answer = climbStairs(n - 1, memo) + climbStairs(n - 2, memo);
  memo.set(n, answer);
  return answer;
}

console.log(climbStairs(2));  // 2
console.log(climbStairs(3));  // 3
console.log(climbStairs(5));  // 8
console.log(climbStairs(45)); // 1836311903`,
            explain: <p>The time and space are O(n). The answer for each step is worked out once.</p>,
          },
          {
            name: "Tabulation with O(1) space",
            idea: <p>Fill in answers going upwards. Remember only the last two answers.</p>,
            code: `function climbStairs(n) {
  let prev = 1, curr = 1;                    // ways(0) and ways(1)
  for (let i = 2; i <= n; i++) {
    [prev, curr] = [curr, prev + curr];
  }
  return curr;
}

console.log(climbStairs(2));  // 2
console.log(climbStairs(3));  // 3
console.log(climbStairs(5));  // 8
console.log(climbStairs(45)); // 1836311903`,
            explain: <p>The time is O(n) and the space is O(1). The sequence is Fibonacci, moved by one place.</p>,
          },
        ]}
        compare={<p>Use the table (bottom-up) loop. Be ready to explain the recurrence (a formula that uses earlier answers): the last move was 1 step or 2 steps. That is the real point of the question. (LeetCode 70.)</p>}
      >
        <p>
          You are climbing a staircase with <code>n</code> steps. Each move climbs 1 or 2 steps. In how many different ways can you reach the
          top?
        </p>
      </Problem>

      <Problem
        n={3}
        title="Min cost climbing stairs"
        level="Easy"
        examples={[
          { input: "cost = [10,15,20]", output: "15", why: "Start on stair 1 (cost 15), then jump two stairs to the top." },
          { input: "cost = [1,100,1,1,1,100,1,1,100,1]", output: "6", why: "Use the stairs at positions 0, 2, 4, 6, 7 and 9. They all cost 1. Skip every stair that costs 100." },
        ]}
        hints={[
          <>The top is one position past the last stair, at position <code>n</code>. You pay <code>cost[i]</code> when you leave stair i.</>,
          <>Let <code>dp[i]</code> be the cheapest total cost to stand on position i. You came from position i − 1 or i − 2.</>,
          <>You can start on stair 0 or 1 for free, so <code>dp[0] = dp[1] = 0</code>.</>,
        ]}
        approaches={[
          {
            name: "Recursion with memo (top-down)",
            idea: <p><code>best(i)</code> is the cheapest cost to reach position i. The formula is <code>best(i) = min(best(i-1) + cost[i-1], best(i-2) + cost[i-2])</code>.</p>,
            code: `function minCostClimbingStairs(cost) {
  const memo = new Map();
  function best(i) {
    if (i <= 1) return 0;                    // starting on stair 0 or 1 is free
    if (memo.has(i)) return memo.get(i);
    const answer = Math.min(best(i - 1) + cost[i - 1], best(i - 2) + cost[i - 2]);
    memo.set(i, answer);
    return answer;
  }
  return best(cost.length);
}

console.log(minCostClimbingStairs([10, 15, 20]));                         // 15
console.log(minCostClimbingStairs([1, 100, 1, 1, 1, 100, 1, 1, 100, 1])); // 6`,
            explain: <p>The time and space are O(n) (the cache plus the recursion). Without the memo the time would grow exponentially, just like Fibonacci.</p>,
          },
          {
            name: "Bottom-up with two variables",
            idea: <p>Go upwards from position 2. Keep the cheapest cost of the last two positions.</p>,
            code: `function minCostClimbingStairs(cost) {
  let twoBack = 0, oneBack = 0;              // dp[i-2] and dp[i-1], starting at i = 2
  for (let i = 2; i <= cost.length; i++) {
    const here = Math.min(oneBack + cost[i - 1], twoBack + cost[i - 2]);
    twoBack = oneBack;
    oneBack = here;
  }
  return oneBack;
}

console.log(minCostClimbingStairs([10, 15, 20]));                         // 15
console.log(minCostClimbingStairs([1, 100, 1, 1, 1, 100, 1, 1, 100, 1])); // 6`,
            explain: <p>The time is O(n) and the space is O(1). Step-by-step check on <code>[10,15,20]</code>: i = 2 gives min(0 + 15, 0 + 10) = 10; i = 3 gives min(10 + 20, 0 + 15) = 15.</p>,
          },
        ]}
        compare={<p>Use bottom-up with two variables. (LeetCode 746.)</p>}
      >
        <p>
          <code>cost[i]</code> is the price of stepping off stair i, after which you may climb 1 or 2 stairs. You may start on stair 0 or
          stair 1. Return the smallest cost to reach the top, which is just past the last stair.
        </p>
      </Problem>

      <Problem
        n={4}
        title="N-th Tribonacci number"
        level="Easy"
        examples={[
          { input: "n = 4", output: "4", why: "T0 = 0, T1 = 1, T2 = 1, T3 = 2, T4 = 4 (each term is the sum of the three before it)." },
          { input: "n = 25", output: "1389537", why: "The same rule is applied 25 times." },
        ]}
        hints={[
          <>This is Fibonacci with three terms: <code>T(n) = T(n-1) + T(n-2) + T(n-3)</code>.</>,
          <>There are three base cases: T(0), T(1), T(2).</>,
          <>How many earlier values must you remember?</>,
        ]}
        approaches={[
          {
            name: "Memoized recursion",
            idea: <p>Recurse on the three earlier terms and save each result in a cache.</p>,
            code: `function tribonacci(n, memo = new Map()) {
  if (n === 0) return 0;
  if (n <= 2) return 1;
  if (memo.has(n)) return memo.get(n);
  const answer = tribonacci(n - 1, memo) + tribonacci(n - 2, memo) + tribonacci(n - 3, memo);
  memo.set(n, answer);
  return answer;
}

console.log(tribonacci(4));  // 4
console.log(tribonacci(25)); // 1389537`,
            explain: <p>Each state makes three calls, but each state is solved only once. The time and space are O(n). Without the cache the time would grow exponentially.</p>,
          },
          {
            name: "Bottom-up with three variables",
            idea: <p>Slide a window of three values along the sequence (always keep the latest three).</p>,
            code: `function tribonacci(n) {
  if (n === 0) return 0;
  if (n <= 2) return 1;
  let a = 0, b = 1, c = 1;                   // T(i-3), T(i-2), T(i-1)
  for (let i = 3; i <= n; i++) {
    [a, b, c] = [b, c, a + b + c];
  }
  return c;
}

console.log(tribonacci(4));  // 4
console.log(tribonacci(25)); // 1389537
console.log(tribonacci(0));  // 0`,
            explain: <p>The time is O(n) and the space is O(1). This is the Fibonacci loop with one more variable.</p>,
          },
        ]}
        compare={<p>Use the loop with three variables. The question tests whether you can change the Fibonacci pattern to a different number of earlier terms. (LeetCode 1137.)</p>}
      >
        <p>
          The Tribonacci numbers are defined by <code>T(0) = 0</code>, <code>T(1) = 1</code>, <code>T(2) = 1</code> and{" "}
          <code>T(n+3) = T(n) + T(n+1) + T(n+2)</code>. Given <code>n</code>, return <code>T(n)</code>.
        </p>
      </Problem>

      <Problem
        n={5}
        title="House robber (a preview of lesson 55)"
        level="Medium"
        examples={[
          { input: "nums = [1,2,3,1]", output: "4", why: "Rob house 0 (1) and house 2 (3). 1 + 3 = 4." },
          { input: "nums = [2,7,9,3,1]", output: "12", why: "Rob houses 0, 2 and 4: 2 + 9 + 1 = 12." },
        ]}
        hints={[
          <>You cannot rob two houses next to each other. For each house you decide: skip it or rob it.</>,
          <>Let <code>best(i)</code> be the most money from houses 0..i. If you skip house i, you get <code>best(i-1)</code>.</>,
          <>If you rob house i, you must have skipped house i − 1. You get <code>nums[i] + best(i-2)</code>.</>,
        ]}
        approaches={[
          {
            name: "Recursion with memo",
            idea: <p>State: house index. Transition: <code>best(i) = max(best(i-1), nums[i] + best(i-2))</code>. Base case: there is nothing to rob before house 0.</p>,
            code: `function rob(nums) {
  const memo = new Map();
  function best(i) {                         // most money from houses 0..i
    if (i < 0) return 0;
    if (memo.has(i)) return memo.get(i);
    const answer = Math.max(best(i - 1), nums[i] + best(i - 2));
    memo.set(i, answer);
    return answer;
  }
  return best(nums.length - 1);
}

console.log(rob([1, 2, 3, 1]));    // 4
console.log(rob([2, 7, 9, 3, 1])); // 12`,
            explain: <p>The time and space are O(n). The state, the transition and the base case are written in the comments above. This has the same shape as stairs, but with a max instead of a sum.</p>,
          },
          {
            name: "Bottom-up with two variables",
            idea: <p>Keep the best totals for the last two houses. Update them as you go along the row.</p>,
            code: `function rob(nums) {
  let twoBack = 0, oneBack = 0;              // best(i-2) and best(i-1)
  for (const money of nums) {
    const here = Math.max(oneBack, twoBack + money);
    twoBack = oneBack;
    oneBack = here;
  }
  return oneBack;
}

console.log(rob([1, 2, 3, 1]));    // 4
console.log(rob([2, 7, 9, 3, 1])); // 12
console.log(rob([5]));             // 5`,
            explain: <p>The time is O(n) and the space is O(1). Lesson 55 comes back to this problem and to the version where the houses are in a circle.</p>,
          },
        ]}
        compare={<p>Use bottom-up with two variables when you feel ready. The memo form makes the formula easiest to see. (LeetCode 198. It is a medium problem, shown here as a preview.)</p>}
      >
        <p>
          Houses in a row hold <code>nums[i]</code> money each. If you rob two houses next to each other, an alarm goes off. Return the most money you can
          rob without setting off the alarm.
        </p>
      </Problem>

      <Problem
        n={6}
        title="Pascal's triangle"
        level="Easy"
        examples={[
          { input: "numRows = 5", output: "[[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]", why: "Each inner number is the sum of the two numbers above it." },
          { input: "numRows = 1", output: "[[1]]", why: "It is just the top row." },
        ]}
        hints={[
          <>Each row starts and ends with 1.</>,
          <>Every other number is the sum of the two numbers directly above it in the row before.</>,
          <>Row r depends only on row r − 1. So this is a table that you fill one row at a time.</>,
        ]}
        approaches={[
          {
            name: "Build each row from the previous",
            idea: <p>Start with <code>[[1]]</code>. For each new row, begin and end with 1 and fill in the middle from the row above.</p>,
            code: `function generate(numRows) {
  const triangle = [[1]];
  for (let r = 1; r < numRows; r++) {
    const prev = triangle[r - 1];
    const row = [1];
    for (let j = 1; j < r; j++) row.push(prev[j - 1] + prev[j]);
    row.push(1);
    triangle.push(row);
  }
  return triangle;
}

console.log(generate(5)); // [[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]
console.log(generate(1)); // [[1]]`,
            explain: <p>The time and space are O(numRows²), because the output itself has that many numbers. The formula <code>row[j] = prev[j-1] + prev[j]</code> is a bottom-up DP table.</p>,
          },
          {
            name: "Recursive cell with memo",
            idea: <p>Let <code>cell(r, c)</code> be the value in row r, column c. It is 1 on the two edges. Everywhere else it is the sum of the two cells above it. Save each cell in a cache.</p>,
            code: `function generate(numRows) {
  const memo = new Map();
  function cell(r, c) {
    if (c === 0 || c === r) return 1;
    const key = r + "," + c;
    if (memo.has(key)) return memo.get(key);
    const value = cell(r - 1, c - 1) + cell(r - 1, c);
    memo.set(key, value);
    return value;
  }
  const triangle = [];
  for (let r = 0; r < numRows; r++) {
    const row = [];
    for (let c = 0; c <= r; c++) row.push(cell(r, c));
    triangle.push(row);
  }
  return triangle;
}

console.log(generate(5)); // [[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]
console.log(generate(1)); // [[1]]`,
            explain: <p>The state now has two parts, row and column, so the cache key joins them. The cost is the same, O(numRows²). Without the memo, cells would be worked out again an enormous number of times.</p>,
          },
        ]}
        compare={<p>The row-by-row table is simpler, and it is what interviewers expect. The memo version has a state with two values, which is a preview of 2-D DP (tables with rows and columns). (LeetCode 118.)</p>}
      >
        <p>
          Given <code>numRows</code>, return the first <code>numRows</code> rows of Pascal&apos;s triangle. In this triangle, each number is the
          sum of the two numbers directly above it, and each row begins and ends with 1.
        </p>
      </Problem>

      <Problem
        n={7}
        title="Pascal's triangle II"
        level="Easy"
        examples={[
          { input: "rowIndex = 3", output: "[1,3,3,1]", why: "This is row 3 (counting from 0)." },
          { input: "rowIndex = 0", output: "[1]", why: "This is the top row." },
          { input: "rowIndex = 1", output: "[1,1]", why: "This is row 1." },
        ]}
        hints={[
          <>You only need the last row, not the whole triangle. Can you change one array in place?</>,
          <>If you update from left to right, you overwrite a value you still need. Which direction avoids that?</>,
          <>Going from right to left, <code>row[j] += row[j-1]</code> uses the old values on its left.</>,
        ]}
        approaches={[
          {
            name: "Build the full triangle",
            idea: <p>Generate all rows as in the previous question and return the last one.</p>,
            code: `function getRow(rowIndex) {
  let prev = [1];
  const all = [prev];
  for (let r = 1; r <= rowIndex; r++) {
    const row = [1];
    for (let j = 1; j < r; j++) row.push(prev[j - 1] + prev[j]);
    row.push(1);
    all.push(row);
    prev = row;
  }
  return all[rowIndex];
}

console.log(getRow(3)); // [ 1, 3, 3, 1 ]
console.log(getRow(0)); // [ 1 ]
console.log(getRow(1)); // [ 1, 1 ]`,
            explain: <p>The time and space are O(rowIndex²), because it keeps every row even though only one is needed.</p>,
          },
          {
            name: "One array, updated right to left",
            idea: <p>Start with <code>[1]</code>. To get to the next row, add a 1 at the end. Then, going from right to left, add each number&apos;s left neighbour to it.</p>,
            code: `function getRow(rowIndex) {
  const row = [1];
  for (let r = 1; r <= rowIndex; r++) {
    row.push(1);                             // the new row is one longer
    for (let j = r - 1; j >= 1; j--) {
      row[j] += row[j - 1];                  // right to left: row[j-1] is still the old value
    }
  }
  return row;
}

console.log(getRow(3)); // [ 1, 3, 3, 1 ]
console.log(getRow(0)); // [ 1 ]
console.log(getRow(1)); // [ 1, 1 ]`,
            explain: <p>The time is O(rowIndex²), but the extra space is only O(rowIndex). This is the space-saving step from the lesson. Row r reads only row r − 1, so one array is enough, as long as you update in the safe direction.</p>,
          },
        ]}
        compare={<p>Use the single array. The direction of the inner loop is the whole lesson here. (LeetCode 119.)</p>}
      >
        <p>
          Given <code>rowIndex</code> (counting from 0), return that row of Pascal&apos;s triangle. Try to use only O(rowIndex) extra space.
        </p>
      </Problem>
    </>
  );
}
