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

const lesson = getDsaLesson("lesson-56");

export const metadata: Metadata = {
  title: `Lesson 56 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "idea", label: "When one index is not enough" },
  { id: "paths", label: "Grid paths" },
  { id: "obstacles", label: "Paths with obstacles" },
  { id: "minpath", label: "Minimum path sum" },
  { id: "trace", label: "Traced: minimum path sum" },
  { id: "knap", label: "0/1 knapsack" },
  { id: "rolling", label: "One row, capacity downwards" },
  { id: "partition", label: "Partition equal subset sum" },
  { id: "unbounded", label: "Unbounded knapsack: coin change II" },
  { id: "order", label: "Loop order: combinations vs permutations" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const pathsCode = `// State: dp[r][c] = the number of ways to reach cell (r, c) moving only right or down.
function uniquePaths(rows, cols) {
  const dp = Array.from({ length: rows }, () => new Array(cols).fill(1));  // first row and column: exactly 1 way
  for (let r = 1; r < rows; r++) {
    for (let c = 1; c < cols; c++) {
      dp[r][c] = dp[r - 1][c] + dp[r][c - 1];   // arrive from above, or from the left
    }
  }
  return dp[rows - 1][cols - 1];
}

console.log(uniquePaths(3, 3)); // 6
console.log(uniquePaths(3, 7)); // 28`;

const obstaclesCode = `// Same state, but an obstacle cell has 0 ways to be reached.
function uniquePathsWithObstacles(grid) {
  const rows = grid.length, cols = grid[0].length;
  const dp = Array.from({ length: rows }, () => new Array(cols).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) { dp[r][c] = 0; continue; }       // blocked
      if (r === 0 && c === 0) { dp[r][c] = 1; continue; }     // the start
      const above = r > 0 ? dp[r - 1][c] : 0;
      const left = c > 0 ? dp[r][c - 1] : 0;
      dp[r][c] = above + left;
    }
  }
  return dp[rows - 1][cols - 1];
}

console.log(uniquePathsWithObstacles([[0, 0, 0], [0, 1, 0], [0, 0, 0]])); // 2
console.log(uniquePathsWithObstacles([[0, 1], [0, 0]]));                  // 1`;

const minPathCode = `// State: dp[r][c] = the smallest sum of a path from the top-left to (r, c).
function minPathSum(grid) {
  const rows = grid.length, cols = grid[0].length;
  const dp = Array.from({ length: rows }, () => new Array(cols).fill(0));
  dp[0][0] = grid[0][0];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === 0 && c === 0) continue;
      const fromAbove = r > 0 ? dp[r - 1][c] : Infinity;   // off the grid = not an option
      const fromLeft = c > 0 ? dp[r][c - 1] : Infinity;
      dp[r][c] = grid[r][c] + Math.min(fromAbove, fromLeft);
    }
  }
  return dp[rows - 1][cols - 1];
}

console.log(minPathSum([[1, 3, 1], [1, 5, 1], [4, 2, 1]])); // 7`;

const knapTableCode = `// 0/1 knapsack: each item is used at most once.
// State: dp[i][w] = the best total value using only the first i items with capacity w.
function knapsack(weights, values, capacity) {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));  // row 0: no items, value 0
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i - 1][w];                              // skip item i
      if (weights[i - 1] <= w) {                            // or take it, if it fits
        dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - weights[i - 1]] + values[i - 1]);
      }
    }
  }
  return dp[n][capacity];
}

console.log(knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7)); // 9   (the items of weight 3 and 4)`;

const knapRowCode = `// Row i only reads row i - 1, so one array is enough, IF capacity runs downwards.
function knapsack(weights, values, capacity) {
  const dp = new Array(capacity + 1).fill(0);
  for (let i = 0; i < weights.length; i++) {
    for (let w = capacity; w >= weights[i]; w--) {          // high to low
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    }
  }
  return dp[capacity];
}

console.log(knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7)); // 9`;

const knapWrongCode = `// The same loop with capacity going UP: this no longer means 'each item once'.
function ascending(weights, values, capacity) {
  const dp = new Array(capacity + 1).fill(0);
  for (let i = 0; i < weights.length; i++) {
    for (let w = weights[i]; w <= capacity; w++) {          // low to high
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    }
  }
  return dp[capacity];
}

// One item, weight 2 and value 3, capacity 6. Correct answer: 3 (we own just one).
console.log(ascending([2], [3], 6)); // 9   the item was counted three times`;

const partitionCode = `// Can the numbers be split into two groups with equal sums?
// That is: is there a subset that adds up to exactly half the total?
function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2 !== 0) return false;        // an odd total cannot be split evenly
  const target = total / 2;
  const dp = new Array(target + 1).fill(false);   // dp[s] = can some chosen subset sum to exactly s?
  dp[0] = true;                             // the empty subset sums to 0
  for (const x of nums) {
    for (let s = target; s >= x; s--) {     // downwards: each number used at most once
      if (dp[s - x]) dp[s] = true;
    }
  }
  return dp[target];
}

console.log(canPartition([1, 5, 11, 5])); // true   (11 and 1 + 5 + 5)
console.log(canPartition([1, 2, 3, 5]));  // false`;

const coinWaysCode = `// Coin change II: the number of COMBINATIONS of coins that make the amount (each coin reusable).
// State: dp[a] = the number of ways to make amount a using the coin types processed so far.
function change(amount, coins) {
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1;                                // one way to make 0: take nothing
  for (const coin of coins) {               // coins on the OUTSIDE
    for (let a = coin; a <= amount; a++) {  // upwards: the same coin may be used again
      dp[a] += dp[a - coin];
    }
  }
  return dp[amount];
}

console.log(change(5, [1, 2, 5])); // 4   (5, 2+2+1, 2+1+1+1, 1+1+1+1+1)
console.log(change(3, [2]));       // 0`;

const permsCode = `// Swap the loops (amount outside, coins inside) and the count changes meaning.
function countOrderedWays(amount, coins) {
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1;
  for (let a = 1; a <= amount; a++) {       // amount on the OUTSIDE
    for (const coin of coins) {
      if (coin <= a) dp[a] += dp[a - coin];
    }
  }
  return dp[amount];
}

console.log(countOrderedWays(3, [1, 2])); // 3   (1+1+1, 1+2 and 2+1 all count)`;

const traceSrc = `const rows = grid.length, cols = grid[0].length;
const dp = Array.from({ length: rows }, () => new Array(cols).fill(0));
dp[0][0] = grid[0][0];
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    if (r === 0 && c === 0) continue;
    const fromAbove = r > 0 ? dp[r - 1][c] : Infinity;
    const fromLeft = c > 0 ? dp[r][c - 1] : Infinity;
    dp[r][c] = grid[r][c] + Math.min(fromAbove, fromLeft);
  }
}
return dp[rows - 1][cols - 1];`;

function minPathTrace() {
  const t = tracer();
  const grid = [[1, 3, 1], [1, 5, 1], [4, 2, 1]];
  const rows = grid.length, cols = grid[0].length;
  t.step(1, "start", "a 3 by 3 grid", "Each cell costs what it shows. We want the cheapest route from the top-left to the bottom-right, moving only right or down.", { grid, rows, cols });
  const dp: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(0));
  t.step(2, "update", "dp starts as all zeros", "dp[r][c] will mean: the cheapest cost of reaching cell (r, c).", { dp }, "dp");
  dp[0][0] = grid[0][0];
  t.step(3, "update", "dp[0][0] = grid[0][0] = 1", "Standing on the start costs just that cell.", { dp }, "dp");
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === 0 && c === 0) continue;
      const fromAbove = r > 0 ? dp[r - 1][c] : Infinity;
      const fromLeft = c > 0 ? dp[r][c - 1] : Infinity;
      dp[r][c] = grid[r][c] + Math.min(fromAbove, fromLeft);
      const from = fromAbove === Infinity ? "only the left neighbour exists" : fromLeft === Infinity ? "only the cell above exists" : `above costs ${fromAbove}, left costs ${fromLeft}: take the cheaper`;
      t.step(9, "update", `dp[${r}][${c}] = ${grid[r][c]} + ${Math.min(fromAbove, fromLeft)} = ${dp[r][c]}`, `Cell cost ${grid[r][c]}; ${from}.`, { r, c, fromAbove, fromLeft, dp }, "dp");
    }
  }
  t.print(dp[rows - 1][cols - 1]);
  t.step(12, "done", `return dp[2][2] = ${dp[rows - 1][cols - 1]}`, "The cheapest route is right, right, down, down: 1 + 3 + 1 + 1 + 1 = 7.", { dp }, "dp");
  return t.steps;
}

function knapRows(): string[][] {
  const weights = [1, 3, 4, 5], values = [1, 4, 5, 7], capacity = 7;
  const dp = new Array(capacity + 1).fill(0);
  const rows: string[][] = [["start", "-", `[${dp.join(", ")}]`]];
  for (let i = 0; i < weights.length; i++) {
    for (let w = capacity; w >= weights[i]; w--) dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    rows.push([`item ${i + 1}`, `weight ${weights[i]}, value ${values[i]}`, `[${dp.join(", ")}]`]);
  }
  return rows;
}

const orderRows: string[][] = [
  ["coins outside, amounts inside (change)", "[1, 0, 0, 0]", "[1, 1, 1, 1]", "[1, 1, 2, 2]", "2  (1+1+1, 1+2)"],
  ["amounts outside, coins inside", "[1, 0, 0, 0]", "dp[1] = dp[0] = 1", "dp[2] = dp[1] + dp[0] = 2, dp[3] = dp[2] + dp[1] = 3", "3  (1+1+1, 1+2, 2+1)"],
];

export default function DsaLessonFiftySixPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="idea">When one index is not enough</h2>
      <p>
        Lesson 55 stored one answer per index. Many problems need <strong>two</strong> numbers to describe a subproblem: a row and a
        column on a board, or &ldquo;which items have I considered&rdquo; and &ldquo;how much capacity is left&rdquo;. Then the table is{" "}
        <strong>2-D</strong>: <code>dp[i][j]</code> answers one small question for each pair. The recipe is unchanged: say in words what{" "}
        <code>dp[i][j]</code> means, fix the base cases, write the transition from the last decision, and fill in an order where every
        answer is ready before it is needed.
      </p>

      <h2 id="paths">Grid paths</h2>
      <p>
        A robot starts at the top-left of a grid and may move only <strong>right</strong> or <strong>down</strong>. How many different
        routes reach the bottom-right? State: <strong>dp[r][c] = the number of ways to reach cell (r, c)</strong>. The last move into
        that cell came from above or from the left, and those are different routes, so the counts add. The top row and left column can
        be reached in exactly one way (straight along the edge).
      </p>
      <CodeBlock lang="js" code={pathsCode} />
      <p>Time and space are O(rows × cols). Each cell is computed once from two neighbours.</p>

      <h2 id="obstacles">Paths with obstacles</h2>
      <p>
        Now some cells are blocked (marked 1). Nothing about the idea changes except that a blocked cell has{" "}
        <strong>0</strong> ways to be reached, and so contributes 0 to the cells after it. Be careful with the edges: a blocked cell in
        the first row cuts off everything after it in that row, and that falls out of the formula by itself.
      </p>
      <CodeBlock lang="js" code={obstaclesCode} />
      <Callout kind="warn" label="Blocked start">
        If the start cell itself is blocked, the answer is 0. The code above handles it because the obstacle check comes first.
      </Callout>

      <h2 id="minpath">Minimum path sum</h2>
      <p>
        Each cell has a cost; find the right-and-down route with the smallest total. Same moves, but now we <em>minimise</em> instead of
        count: <strong>dp[r][c] = the smallest sum of a route from the top-left to (r, c)</strong>. Pay for the cell, plus the cheaper
        of the two ways in. Cells on an edge have only one way in, so treat a missing neighbour as <code>Infinity</code> (it never wins a minimum).
      </p>
      <CodeBlock lang="js" code={minPathCode} />

      <h2 id="trace">Traced: minimum path sum</h2>
      <CodeTrace
        code={traceSrc}
        steps={minPathTrace()}
        caption="The table fills row by row. Look at dp[1][1]: the cell costs 5 and the cheaper way in costs 2, so 7. The final answer reaches the corner through dp[1][2] = 6, not through that expensive middle."
      />

      <h2 id="knap">0/1 knapsack</h2>
      <p>
        You have items, each with a <strong>weight</strong> and a <strong>value</strong>, and a bag that holds total weight at most{" "}
        <code>capacity</code>. Pick items to maximise total value. &ldquo;0/1&rdquo; means each item is taken once or not at all.
      </p>
      <p>
        State: <strong>dp[i][w] = the best total value using only the first i items with capacity w</strong>. For item <code>i</code> the last
        decision is binary. <em>Skip</em> it: the answer is <code>dp[i-1][w]</code>. <em>Take</em> it (only if it fits): you gain its
        value and have <code>w - weight</code> capacity left for the earlier items: <code>dp[i-1][w - weight] + value</code>. Keep the
        larger.
      </p>
      <CodeBlock lang="js" code={knapTableCode} />
      <p>That is O(n × capacity) time and space.</p>

      <h2 id="rolling">One row, capacity downwards</h2>
      <p>
        Row <code>i</code> only reads row <code>i - 1</code>, so a single array can be reused: after processing item{" "}
        <code>i</code>, <code>dp[w]</code> holds what row <code>i</code> would have held. Space drops to O(capacity). But there is one trap:
        the <strong>capacity loop must go from high to low</strong>.
      </p>
      <CodeBlock lang="js" code={knapRowCode} />
      <DryRun
        title="weights [1, 3, 4, 5], values [1, 4, 5, 7], capacity 7"
        cols={["After", "Item", "dp[0..7]"]}
        rows={knapRows()}
        note="The last entry is the answer, 9, from the items of weight 3 and 4 (value 4 + 5)."
      />
      <p>
        <strong>Why downwards?</strong> The update for <code>dp[w]</code> reads <code>dp[w - weight]</code>, a <em>smaller</em> index. If
        we go from high to low, that smaller cell has not been touched yet during this item, so it still holds the answer from{" "}
        <em>before</em> this item, and the item is added at most once. If we go from low to high, the smaller cell has already been
        updated for this item, so it may already include the item, and we add it again on top. The loop then silently allows
        unlimited copies:
      </p>
      <CodeBlock lang="js" code={knapWrongCode} />

      <h2 id="partition">Partition equal subset sum</h2>
      <p>
        Can an array of positive integers be split into two groups with equal sums? If the total is odd, no. Otherwise we need some
        subset adding to exactly <strong>half the total</strong> (the rest then automatically makes the other half). That is knapsack in
        disguise, where the weights are the numbers, the capacity is the target, and the question is a yes/no &ldquo;can we hit it
        exactly?&rdquo; State: <strong>dp[s] = true if some subset of the numbers seen so far sums to exactly s</strong>. Each number is used
        once, so the loop runs downwards.
      </p>
      <CodeBlock lang="js" code={partitionCode} />

      <h2 id="unbounded">Unbounded knapsack: coin change II</h2>
      <p>
        <strong>Unbounded</strong> means each item may be used any number of times. Coin change II asks: with unlimited coins of
        given values, in how many different <em>combinations</em> can you make the amount? (Two answers that use the same coins in
        a different order count as one.) The rolling-array loop is the one that looked like a bug a moment ago: capacity runs{" "}
        <strong>upwards</strong>, because reading a cell that already includes the current coin is exactly what lets us reuse it.
      </p>
      <CodeBlock lang="js" code={coinWaysCode} />

      <h2 id="order">Loop order: combinations vs permutations</h2>
      <p>
        With the coins on the outside, we decide how many of coin 1 to use, then coin 2, and so on. Every way is built in a fixed coin
        order, so 1 + 2 and 2 + 1 cannot both appear: you are counting <strong>combinations</strong>. Put the amount on the outside and the
        coins inside, and at each amount <em>any</em> coin may be the last one added, so different orders of the same coins are counted
        separately: <strong>permutations</strong> (this is the question &ldquo;Combination Sum IV&rdquo;). Same recurrence, loops swapped, different question.
      </p>
      <CodeBlock lang="js" code={permsCode} />
      <DryRun
        title="amount 3, coins [1, 2]: the table dp[0..3]"
        cols={["Loop order", "Start", "After coin 1 / amount 1", "After coin 2 / amounts 2 and 3", "Answer"]}
        rows={orderRows}
        note="Combinations: 1+1+1 and 1+2. Permutations add 2+1 as a separate answer."
      />

      <h2 id="practice">Practice questions</h2>
      <p>
        Before coding, say what <code>dp[i][j]</code> means and which direction each loop should run, and why.
      </p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write the state sentence and transition for unique paths, then adapt it for obstacles and minimum path sum.</>,
          <>Write 0/1 knapsack as a 2-D table, then as one row.</>,
          <>Explain why the 0/1 row goes from high capacity to low, and what breaks otherwise.</>,
          <>Turn &ldquo;partition equal subset sum&rdquo; into a subset-sum-to-half question.</>,
          <>Explain why coin change II iterates capacity upwards.</>,
          <>Say which loop order counts combinations and which counts permutations, and why.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        Two-index tables also fit problems on <em>two strings</em>: let <code>dp[i][j]</code> describe the first <code>i</code> characters of one
        string and the first <code>j</code> of the other. <strong>Lesson 57</strong> does exactly that for longest common subsequence and
        edit distance, then returns to the longest increasing subsequence with an O(n log n) method.
      </p>
    </DsaLessonPage>
  );
}
