import Problem from "@/components/dsa/Problem";

/** Lesson 56 practice questions: 2-D dynamic programming. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Unique paths"
        level="Medium"
        examples={[
          { input: "m = 3, n = 7", output: "28", why: "A 3 by 7 grid has 28 different right-or-down routes to the far corner." },
          { input: "m = 3, n = 2", output: "3", why: "Right-down-down, down-right-down and down-down-right." },
          { input: "m = 1, n = 1", output: "1", why: "You are already at the goal, so there is one (empty) route." },
        ]}
        hints={[
          <>State: dp[r][c] is the number of ways to reach cell (r, c).</>,
          <>The last move came from above or from the left. Do you add the two counts, or pick one?</>,
          <>Each row only needs the row above it. Could one array be enough?</>,
        ]}
        approaches={[
          {
            name: "2-D table",
            idea: <p>Fill the first row and the first column with 1 (there is one straight route). Then use <code>dp[r][c] = dp[r-1][c] + dp[r][c-1]</code>.</p>,
            code: `function uniquePaths(m, n) {
  const dp = Array.from({ length: m }, () => new Array(n).fill(1));
  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) {
      dp[r][c] = dp[r - 1][c] + dp[r][c - 1];
    }
  }
  return dp[m - 1][n - 1];
}

console.log(uniquePaths(3, 7)); // 28
console.log(uniquePaths(3, 2)); // 3
console.log(uniquePaths(1, 1)); // 1`,
            explain: <p>O(m × n) time and memory. Each cell is worked out from two neighbours that are already filled.</p>,
          },
          {
            name: "One row",
            idea: <p>Keep one array <code>dp</code> for the current row. Before the update, <code>dp[c]</code> is the cell above. <code>dp[c - 1]</code> is already the cell to the left.</p>,
            code: `function uniquePaths(m, n) {
  const dp = new Array(n).fill(1);
  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) {
      dp[c] += dp[c - 1];            // above (old dp[c]) + left (new dp[c - 1])
    }
  }
  return dp[n - 1];
}

console.log(uniquePaths(3, 7)); // 28
console.log(uniquePaths(3, 2)); // 3
console.log(uniquePaths(1, 1)); // 1`,
            explain: <p>O(m × n) time, O(n) memory. Going left to right is correct here, because we <em>want</em> the left cell to be already updated for this row.</p>,
          },
          {
            name: "Counting with a formula",
            idea: <p>Every route has exactly <code>m - 1</code> down moves and <code>n - 1</code> right moves. A route is just a choice of which of the <code>m + n - 2</code> moves are the down ones. The answer is C(m + n - 2, m - 1), which means &ldquo;the number of ways to choose m - 1 things from m + n - 2&rdquo;.</p>,
            code: `function uniquePaths(m, n) {
  const total = m + n - 2;
  const k = Math.min(m, n) - 1;
  let result = 1;
  for (let i = 1; i <= k; i++) {
    result = (result * (total - k + i)) / i;   // this is always a whole number
  }
  return Math.round(result);
}

console.log(uniquePaths(3, 7)); // 28
console.log(uniquePaths(3, 2)); // 3
console.log(uniquePaths(1, 1)); // 1`,
            explain: <p>O(min(m, n)) time, O(1) memory. It is a nice shortcut here. But it stops working as soon as there are obstacles, so the DP is worth knowing.</p>,
          },
        ]}
        compare={<p>Learn the table, because the same shape solves the obstacle and cost versions. The formula is a good way to check your answer. (LeetCode 62.)</p>}
      >
        <p>
          A robot stands in the top-left of an <code>m × n</code> grid. It can only move right or down. Return the number of different routes to
          the bottom-right corner.
        </p>
      </Problem>

      <Problem
        n={2}
        title="Unique paths II"
        level="Medium"
        examples={[
          { input: "obstacleGrid = [[0,0,0],[0,1,0],[0,0,0]]", output: "2", why: "The centre is blocked. Both routes go around it: right-right-down-down and down-down-right-right." },
          { input: "obstacleGrid = [[0,1],[0,0]]", output: "1", why: "Only down then right works." },
          { input: "obstacleGrid = [[1,0]]", output: "0", why: "The start itself is blocked." },
        ]}
        hints={[
          <>The state is the same as before. How many ways are there to reach a blocked cell?</>,
          <>Check for an obstacle first, before you add the neighbours.</>,
          <>The start cell is special. It has one way if it is open.</>,
        ]}
        approaches={[
          {
            name: "2-D table",
            idea: <p>Obstacle cell: 0. Start cell: 1. Any other cell: the cell above plus the cell to the left. A place off the grid counts as 0.</p>,
            code: `function uniquePathsWithObstacles(grid) {
  const rows = grid.length, cols = grid[0].length;
  const dp = Array.from({ length: rows }, () => new Array(cols).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) continue;                  // stays 0
      if (r === 0 && c === 0) { dp[r][c] = 1; continue; }
      dp[r][c] = (r > 0 ? dp[r - 1][c] : 0) + (c > 0 ? dp[r][c - 1] : 0);
    }
  }
  return dp[rows - 1][cols - 1];
}

console.log(uniquePathsWithObstacles([[0, 0, 0], [0, 1, 0], [0, 0, 0]])); // 2
console.log(uniquePathsWithObstacles([[0, 1], [0, 0]]));                  // 1
console.log(uniquePathsWithObstacles([[1, 0]]));                          // 0`,
            explain: <p>O(rows × cols) time and memory. If the start is blocked, every cell stays 0, so the answer is 0.</p>,
          },
          {
            name: "One row",
            idea: <p>Start with <code>dp = [1, 0, 0, ...]</code>, which says &ldquo;one way to be just above the first cell&rdquo;. For every cell: if it is blocked, set it to 0. Otherwise add the cell on the left.</p>,
            code: `function uniquePathsWithObstacles(grid) {
  const cols = grid[0].length;
  const dp = new Array(cols).fill(0);
  dp[0] = 1;
  for (const row of grid) {
    for (let c = 0; c < cols; c++) {
      if (row[c] === 1) dp[c] = 0;            // blocked: nothing reaches it
      else if (c > 0) dp[c] += dp[c - 1];     // above (kept in dp[c]) + left
    }
  }
  return dp[cols - 1];
}

console.log(uniquePathsWithObstacles([[0, 0, 0], [0, 1, 0], [0, 0, 0]])); // 2
console.log(uniquePathsWithObstacles([[0, 1], [0, 0]]));                  // 1
console.log(uniquePathsWithObstacles([[1, 0]]));                          // 0`,
            explain: <p>O(rows × cols) time, O(cols) memory. The first column keeps its value from the row above until an obstacle sets it to 0.</p>,
          },
        ]}
        compare={<p>The table is easier to get right. The single row is the follow-up question. (LeetCode 63.)</p>}
      >
        <p>
          This is the same robot and grid as the last question, but some cells hold an obstacle (<code>1</code>; free cells are <code>0</code>).
          The robot cannot enter an obstacle. Return the number of routes to the bottom-right corner.
        </p>
      </Problem>

      <Problem
        n={3}
        title="Minimum path sum"
        level="Medium"
        examples={[
          { input: "grid = [[1,3,1],[1,5,1],[4,2,1]]", output: "7", why: "Route 1 → 3 → 1 → 1 → 1 sums to 7." },
          { input: "grid = [[1,2,3],[4,5,6]]", output: "12", why: "Route 1 → 2 → 3 → 6 sums to 12." },
        ]}
        hints={[
          <>State: dp[r][c] is the lowest cost to arrive at (r, c).</>,
          <>You pay for the cell, plus the cheaper of the two ways in.</>,
          <>On the first row and column there is only one way in. Treat a missing neighbour as Infinity (a number bigger than any other).</>,
        ]}
        approaches={[
          {
            name: "Recursion with memo",
            idea: <p><code>best(r, c)</code> is the lowest cost from <code>(r, c)</code> to the end: the cell plus the cheaper of going down or going right. A memo is a saved-answers list. We save the answer for each cell. Without it, the code would walk every route one by one.</p>,
            code: `function minPathSum(grid) {
  const rows = grid.length, cols = grid[0].length;
  const memo = new Map();
  function best(r, c) {
    if (r === rows - 1 && c === cols - 1) return grid[r][c];
    const key = r * cols + c;
    if (memo.has(key)) return memo.get(key);
    const down = r + 1 < rows ? best(r + 1, c) : Infinity;
    const right = c + 1 < cols ? best(r, c + 1) : Infinity;
    const result = grid[r][c] + Math.min(down, right);
    memo.set(key, result);
    return result;
  }
  return best(0, 0);
}

console.log(minPathSum([[1, 3, 1], [1, 5, 1], [4, 2, 1]])); // 7
console.log(minPathSum([[1, 2, 3], [4, 5, 6]]));            // 12`,
            explain: <p>One saved answer per cell, so O(rows × cols) time and memory. The call depth is rows + cols. Without the memo, the number of calls grows as fast as the number of routes. That is exponential, which means it doubles again and again.</p>,
          },
          {
            name: "One row, bottom-up",
            idea: <p>Walk the grid in reading order (left to right, top to bottom) and keep one array. Before the update, <code>dp[c]</code> is the cost from above. <code>dp[c - 1]</code> is the cost from the left.</p>,
            code: `function minPathSum(grid) {
  const rows = grid.length, cols = grid[0].length;
  const dp = new Array(cols).fill(Infinity);
  dp[0] = 0;                                   // so the start cell costs only itself
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const fromLeft = c > 0 ? dp[c - 1] : Infinity;
      dp[c] = grid[r][c] + Math.min(dp[c], fromLeft);
    }
  }
  return dp[cols - 1];
}

console.log(minPathSum([[1, 3, 1], [1, 5, 1], [4, 2, 1]])); // 7
console.log(minPathSum([[1, 2, 3], [4, 5, 6]]));            // 12`,
            explain: <p>O(rows × cols) time, O(cols) memory. On the first row, <code>dp[c]</code> is still <code>Infinity</code>, so only the left neighbour counts. In the first column there is no left neighbour, so only the cell above counts.</p>,
          },
        ]}
        compare={<p>Start with the memo, because it follows how you think. Use the row version when memory matters. A greedy method (&ldquo;always pick the cheaper next step&rdquo;) fails, because a cheap step can lead into expensive cells. (LeetCode 64.)</p>}
      >
        <p>
          Given a grid of numbers that are zero or more, find a route from the top-left to the bottom-right (moving only right or down) with the
          smallest total of cell values. Return that total.
        </p>
      </Problem>

      <Problem
        n={4}
        title="Partition equal subset sum"
        level="Medium"
        examples={[
          { input: "nums = [1,5,11,5]", output: "true", why: "[1,5,5] and [11] both sum to 11." },
          { input: "nums = [1,2,3,5]", output: "false", why: "The total is 11, which is odd, so no even split exists." },
        ]}
        hints={[
          <>If the total is odd, stop. Otherwise, what sum must one subset reach?</>,
          <>It is a knapsack problem. The items are the numbers, and you ask if you can hit the target exactly.</>,
          <>Each number is used once. Which direction should the sum loop go?</>,
        ]}
        approaches={[
          {
            name: "Recursion with memo",
            idea: <p><code>can(i, rest)</code> asks: do some numbers from index <code>i</code> onward add up to <code>rest</code>? Take <code>nums[i]</code> or skip it. Save each answer by <code>(i, rest)</code>.</p>,
            code: `function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2 !== 0) return false;
  const memo = new Map();
  function can(i, rest) {
    if (rest === 0) return true;
    if (i === nums.length || rest < 0) return false;
    const key = i * (total + 1) + rest;
    if (memo.has(key)) return memo.get(key);
    const result = can(i + 1, rest - nums[i]) || can(i + 1, rest);
    memo.set(key, result);
    return result;
  }
  return can(0, total / 2);
}

console.log(canPartition([1, 5, 11, 5])); // true
console.log(canPartition([1, 2, 3, 5]));  // false`,
            explain: <p>There are at most n × target different states, so O(n × target) time and memory. Without the memo it tries up to 2<sup>n</sup> subsets.</p>,
          },
          {
            name: "1-D true/false table, sums going downwards",
            idea: <p><code>dp[s]</code> is true when some subset adds up to <code>s</code>. For each number <code>x</code>, go through <code>s</code> from high to low and set <code>dp[s] = dp[s] || dp[s - x]</code>.</p>,
            code: `function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2 !== 0) return false;
  const target = total / 2;
  const dp = new Array(target + 1).fill(false);
  dp[0] = true;
  for (const x of nums) {
    for (let s = target; s >= x; s--) {
      if (dp[s - x]) dp[s] = true;
    }
  }
  return dp[target];
}

console.log(canPartition([1, 5, 11, 5])); // true
console.log(canPartition([1, 2, 3, 5]));  // false`,
            explain: <p>O(n × target) time, O(target) memory. We go downwards, so each number joins a subset at most once. Going upwards would let a number be used again. For [2, 6] (target 4) it would wrongly say <code>true</code> by using the 2 twice.</p>,
          },
        ]}
        compare={<p>Use the 1-D table. The memo is a good first step, because it shows the take-or-skip idea. (LeetCode 416.)</p>}
      >
        <p>
          Given an array of positive whole numbers, return <code>true</code> if it can be split into two subsets (groups) with equal sums.
        </p>
      </Problem>

      <Problem
        n={5}
        title="Coin change II"
        level="Medium"
        examples={[
          { input: "amount = 5, coins = [1,2,5]", output: "4", why: "5; 2+2+1; 2+1+1+1; 1+1+1+1+1." },
          { input: "amount = 3, coins = [2]", output: "0", why: "Two cannot add up to three." },
          { input: "amount = 10, coins = [10]", output: "1", why: "A single 10." },
        ]}
        hints={[
          <>Count combinations. 2+1 and 1+2 are the same answer.</>,
          <>State: dp[a] is the number of ways to make a using the coin types handled so far. What should dp[0] be?</>,
          <>Which loop goes on the outside, coins or amounts? Which direction should the amount loop go?</>,
        ]}
        approaches={[
          {
            name: "2-D table (coin types × amount)",
            idea: <p><code>dp[i][a]</code> is the number of combinations that make <code>a</code> using only the first <code>i</code> coin types. Either do not use coin <code>i</code> at all (<code>dp[i-1][a]</code>), or use it at least once (<code>dp[i][a - coin]</code>, in the same row, because the coin can be used again).</p>,
            code: `function change(amount, coins) {
  const n = coins.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(amount + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i][0] = 1;       // one way to make 0 with any coins: take nothing
  for (let i = 1; i <= n; i++) {
    const coin = coins[i - 1];
    for (let a = 1; a <= amount; a++) {
      dp[i][a] = dp[i - 1][a] + (a >= coin ? dp[i][a - coin] : 0);
    }
  }
  return dp[n][amount];
}

console.log(change(5, [1, 2, 5]));  // 4
console.log(change(3, [2]));        // 0
console.log(change(10, [10]));      // 1`,
            explain: <p>O(n × amount) time and memory. Notice that the second term reads the <em>same</em> row <code>i</code>. That is how &ldquo;use this coin as often as you like&rdquo; looks in a table.</p>,
          },
          {
            name: "1-D, coins outside, amounts going upwards",
            idea: <p>Squash the rows into one array. With coins on the outside, each combination is built in one fixed coin order, so it is counted once. Amounts going upwards lets a coin be used again.</p>,
            code: `function change(amount, coins) {
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1;
  for (const coin of coins) {
    for (let a = coin; a <= amount; a++) {
      dp[a] += dp[a - coin];
    }
  }
  return dp[amount];
}

console.log(change(5, [1, 2, 5]));  // 4
console.log(change(3, [2]));        // 0
console.log(change(10, [10]));      // 1`,
            explain: <p>O(n × amount) time, O(amount) memory. If you swap the two loops, you count ordered sequences (permutations). Then amount 3 with coins [1, 2] gives 3 instead of 2.</p>,
          },
        ]}
        compare={<p>Write the 1-D version, and be ready to explain the loop order. Interviewers often ask exactly this: combinations or permutations. (LeetCode 518.)</p>}
      >
        <p>
          Given coin values (you have unlimited coins of each) and a target <code>amount</code>, return the number of different combinations of
          coins that make exactly that amount. Return 0 if it is impossible.
        </p>
      </Problem>

      <Problem
        n={6}
        title="Target sum"
        level="Medium"
        examples={[
          { input: "nums = [1,1,1,1,1], target = 3", output: "5", why: "Choose which one of the 1s gets a minus sign: -1+1+1+1+1 and four others. That is five ways to total 3." },
          { input: "nums = [1], target = 1", output: "1", why: "+1." },
        ]}
        hints={[
          <>Every number gets a plus or a minus. Trying every choice (brute force) means 2<sup>n</sup> options.</>,
          <>Describe each situation as (index, running sum). Then identical situations can share one saved answer.</>,
          <>Call the group with plus signs P and the group with minus signs N. Then P + N = total and P − N = target. What is P?</>,
        ]}
        approaches={[
          {
            name: "Recursion with memo",
            idea: <p><code>ways(i, sum)</code> counts the sign choices for the numbers from <code>i</code> onward that make the running <code>sum</code> reach the target. Try +<code>nums[i]</code> and -<code>nums[i]</code>. Save each answer by <code>(i, sum)</code>.</p>,
            code: `function findTargetSumWays(nums, target) {
  const memo = new Map();
  function ways(i, sum) {
    if (i === nums.length) return sum === target ? 1 : 0;
    const key = i + "," + sum;
    if (memo.has(key)) return memo.get(key);
    const result = ways(i + 1, sum + nums[i]) + ways(i + 1, sum - nums[i]);
    memo.set(key, result);
    return result;
  }
  return ways(0, 0);
}

console.log(findTargetSumWays([1, 1, 1, 1, 1], 3)); // 5
console.log(findTargetSumWays([1], 1));             // 1`,
            explain: <p>The running sum stays between -total and +total, so there are at most n × (2 × total + 1) states. Without the memo it can try 2<sup>n</sup> paths.</p>,
          },
          {
            name: "Turn it into counting subsets",
            idea: <p>Let P be the sum of the numbers with a plus sign, and N the sum of the numbers with a minus sign. Then P + N = total and P − N = target, so P = (total + target) / 2. Now count the subsets that add up to P, using a 0/1 knapsack that counts. If <code>total + target</code> is odd, or <code>|target| &gt; total</code>, the answer is 0.</p>,
            code: `function findTargetSumWays(nums, target) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (Math.abs(target) > total || (total + target) % 2 !== 0) return 0;
  const want = (total + target) / 2;
  const dp = new Array(want + 1).fill(0);
  dp[0] = 1;
  for (const x of nums) {
    for (let s = want; s >= x; s--) {      // downwards: each number is used once
      dp[s] += dp[s - x];
    }
  }
  return dp[want];
}

console.log(findTargetSumWays([1, 1, 1, 1, 1], 3)); // 5
console.log(findTargetSumWays([1], 1));             // 1`,
            explain: <p>In the first example total = 5, so P = (5 + 3) / 2 = 4. There are 5 ways to choose four of the five ones. This takes O(n × P) time and O(P) memory. Zeros in the input work correctly: a 0 doubles the counts, because it can take either sign.</p>,
          },
        ]}
        compare={<p>The subset-sum version is shorter and uses less memory. The memo is easier to think of first. Both are fine. (LeetCode 494.)</p>}
      >
        <p>
          Given an array of whole numbers (zero or more) and a <code>target</code>, put a <code>+</code> or <code>-</code> in front of every number.
          Return how many ways of choosing the signs make the result equal <code>target</code>.
        </p>
      </Problem>

      <Problem
        n={7}
        title="Maximal square"
        level="Medium"
        examples={[
          { input: 'matrix = [["1","0","1","0","0"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]]', output: "4", why: "The largest square made only of 1s is 2 × 2 (for example rows 1-2, columns 2-3). Its area is 4." },
          { input: 'matrix = [["0","1"],["1","0"]]', output: "1", why: "No 1s form a bigger square, so the best is a single cell. The area is 1." },
          { input: 'matrix = [["0"]]', output: "0", why: "No 1s at all." },
        ]}
        hints={[
          <>Return the area (side × side), not the side length.</>,
          <>State: dp[r][c] is the side length of the biggest square of 1s whose bottom-right corner is (r, c).</>,
          <>A square with side k at (r, c) needs squares with side k − 1 ending at the cell above, the cell to the left, and the cell diagonally up-left.</>,
        ]}
        approaches={[
          {
            name: "Brute force",
            idea: <p>Treat every cell as a top-left corner. Grow the square one size at a time, as long as the new bottom row and new right column are all 1s.</p>,
            code: `function maximalSquare(matrix) {
  const rows = matrix.length, cols = matrix[0].length;
  let best = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (matrix[r][c] !== "1") continue;
      let side = 1;
      while (r + side < rows && c + side < cols) {
        let ok = true;
        for (let k = 0; k <= side; k++) {              // the new row and the new column
          if (matrix[r + side][c + k] !== "1" || matrix[r + k][c + side] !== "1") { ok = false; break; }
        }
        if (!ok) break;
        side++;
      }
      best = Math.max(best, side);
    }
  }
  return best * best;
}

console.log(maximalSquare([["1", "0", "1", "0", "0"], ["1", "0", "1", "1", "1"], ["1", "1", "1", "1", "1"], ["1", "0", "0", "1", "0"]])); // 4
console.log(maximalSquare([["0", "1"], ["1", "0"]])); // 1
console.log(maximalSquare([["0"]]));                  // 0`,
            explain: <p>O(rows × cols × min(rows, cols)²) in the worst case. Each corner may grow to the full size and re-check a row and a column at each step. This is fine for small grids but too slow for big ones.</p>,
          },
          {
            name: "DP using the bottom-right corner",
            idea: <p>If the cell is <code>&quot;1&quot;</code>, then <code>dp[r][c] = 1 + min(dp[r-1][c], dp[r][c-1], dp[r-1][c-1])</code>. Otherwise it is 0. The smallest of the three neighbours limits how big the square can be. Add one extra row and column of zeros, so the edges need no special case.</p>,
            code: `function maximalSquare(matrix) {
  const rows = matrix.length, cols = matrix[0].length;
  const dp = Array.from({ length: rows + 1 }, () => new Array(cols + 1).fill(0));   // extra row and column of zeros
  let side = 0;
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      if (matrix[r - 1][c - 1] === "1") {
        dp[r][c] = 1 + Math.min(dp[r - 1][c], dp[r][c - 1], dp[r - 1][c - 1]);
        side = Math.max(side, dp[r][c]);
      }
    }
  }
  return side * side;
}

console.log(maximalSquare([["1", "0", "1", "0", "0"], ["1", "0", "1", "1", "1"], ["1", "1", "1", "1", "1"], ["1", "0", "0", "1", "0"]])); // 4
console.log(maximalSquare([["0", "1"], ["1", "0"]])); // 1
console.log(maximalSquare([["0"]]));                  // 0`,
            explain: <p>O(rows × cols) time and memory. You can shrink the memory to two rows (or one row plus one saved diagonal value). Why use the smallest of the three? A square with side 3 needs three overlapping squares with side 2 (above, left and diagonal). Any 0 in the 3 × 3 block makes one of those three smaller.</p>,
          },
        ]}
        compare={<p>Brute force is a good way to understand the problem. But the corner DP with the smallest of three neighbours is the answer interviewers expect. (LeetCode 221.)</p>}
      >
        <p>
          Given a grid (matrix) of the characters <code>&quot;0&quot;</code> and <code>&quot;1&quot;</code>, find the largest square made only of{" "}
          <code>&quot;1&quot;</code>s and return its <strong>area</strong>.
        </p>
      </Problem>
    </>
  );
}
