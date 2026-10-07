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
  { id: "idea", label: "When one number is not enough" },
  { id: "paths", label: "Grid paths" },
  { id: "obstacles", label: "Paths with obstacles" },
  { id: "minpath", label: "Minimum path sum" },
  { id: "trace", label: "Traced: minimum path sum" },
  { id: "knap", label: "0/1 knapsack" },
  { id: "rolling", label: "One row, capacity going downwards" },
  { id: "partition", label: "Partition equal subset sum" },
  { id: "unbounded", label: "Unbounded knapsack: coin change II" },
  { id: "order", label: "Loop order: combinations or permutations" },
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
  t.step(1, "start", "a 3 by 3 grid", "Each cell has a cost. We want the cheapest route from the top-left to the bottom-right. We can only move right or down.", { grid, rows, cols });
  const dp: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(0));
  t.step(2, "update", "dp starts as all zeros", "dp[r][c] will mean: the lowest cost to reach cell (r, c).", { dp }, "dp");
  dp[0][0] = grid[0][0];
  t.step(3, "update", "dp[0][0] = grid[0][0] = 1", "Starting here costs only this one cell.", { dp }, "dp");
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === 0 && c === 0) continue;
      const fromAbove = r > 0 ? dp[r - 1][c] : Infinity;
      const fromLeft = c > 0 ? dp[r][c - 1] : Infinity;
      dp[r][c] = grid[r][c] + Math.min(fromAbove, fromLeft);
      const from = fromAbove === Infinity ? "only the left cell exists" : fromLeft === Infinity ? "only the cell above exists" : `above costs ${fromAbove}, left costs ${fromLeft}, so take the cheaper one`;
      t.step(9, "update", `dp[${r}][${c}] = ${grid[r][c]} + ${Math.min(fromAbove, fromLeft)} = ${dp[r][c]}`, `This cell costs ${grid[r][c]}. ${from}.`, { r, c, fromAbove, fromLeft, dp }, "dp");
    }
  }
  t.print(dp[rows - 1][cols - 1]);
  t.step(12, "done", `return dp[2][2] = ${dp[rows - 1][cols - 1]}`, "The cheapest route goes right, right, down, down. The cost is 1 + 3 + 1 + 1 + 1 = 7.", { dp }, "dp");
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
        Lesson 55 saved one answer for each index. Some problems need <strong>two</strong> numbers to describe a small part of the problem
        (a subproblem). For example, a row and a column on a board. Or &ldquo;how many items have I looked at&rdquo; and &ldquo;how much
        room is left in the bag&rdquo;. Then the table is <strong>2-D</strong> (two-dimensional, like a spreadsheet with rows and
        columns). Each cell <code>dp[i][j]</code> answers one small question for one pair of numbers. The recipe is the same as before.
        First say in words what <code>dp[i][j]</code> means. Then set the starting values (the base cases). Then write the rule
        (the transition) that uses the last choice you made. Last, fill the table in an order where each answer is ready before you need it.
      </p>

      <h2 id="paths">Grid paths</h2>
      <p>
        A robot starts at the top-left of a grid. It can only move <strong>right</strong> or <strong>down</strong>. How many different
        routes reach the bottom-right? The meaning of one cell (the &ldquo;state&rdquo;) is: <strong>dp[r][c] = the number of ways to reach
        cell (r, c)</strong>. The robot came into that cell from above or from the left. Those are different routes, so we add the two counts.
        The top row and the left column have exactly one way each (straight along the edge).
      </p>
      <CodeBlock lang="js" code={pathsCode} />
      <p>Time and memory are both O(rows × cols). Each cell is worked out once, using its two neighbours.</p>

      <h2 id="obstacles">Paths with obstacles</h2>
      <p>
        Now some cells are blocked (marked 1). The idea stays the same. A blocked cell has <strong>0</strong> ways to be reached,
        so it adds 0 to the cells after it. Watch the edges. A blocked cell in the first row cuts off everything after it in that row.
        The formula does this by itself, so you need no extra code.
      </p>
      <CodeBlock lang="js" code={obstaclesCode} />
      <Callout kind="warn" label="Blocked start">
        If the start cell is blocked, the answer is 0. The code above handles this because it checks for an obstacle first.
      </Callout>

      <h2 id="minpath">Minimum path sum</h2>
      <p>
        Each cell has a cost. Find the right-and-down route with the smallest total. The moves are the same, but now we find the
        <em>smallest</em> value instead of counting: <strong>dp[r][c] = the smallest total cost of a route from the top-left to (r, c)</strong>.
        Pay for the cell itself, plus the cheaper of the two ways in. A cell on an edge has only one way in. So we treat the missing
        neighbour as <code>Infinity</code> (a number bigger than any other), because it can never be the smallest.
      </p>
      <CodeBlock lang="js" code={minPathCode} />

      <h2 id="trace">Traced: minimum path sum</h2>
      <CodeTrace
        code={traceSrc}
        steps={minPathTrace()}
        caption="The table fills row by row. Look at dp[1][1]. The cell costs 5 and the cheaper way in costs 2, so it is 7. The final route reaches the corner through dp[1][2] = 6, so it avoids that expensive middle cell."
      />

      <h2 id="knap">0/1 knapsack</h2>
      <p>
        You have some items. Each item has a <strong>weight</strong> and a <strong>value</strong>. You also have a bag that can hold a total
        weight of at most <code>capacity</code>. Pick items to get the biggest total value. &ldquo;0/1&rdquo; means you take each item
        once, or not at all. Think of packing a suitcase for a trip: each thing goes in once, and the case has a weight limit.
      </p>
      <p>
        State: <strong>dp[i][w] = the best total value when you use only the first i items and the bag holds weight w</strong>. For
        item <code>i</code> you make one yes-or-no choice. <em>Skip</em> it: the answer is <code>dp[i-1][w]</code>. <em>Take</em> it
        (only if it fits): you gain its value, and you have <code>w - weight</code> room left for the earlier items. That gives{" "}
        <code>dp[i-1][w - weight] + value</code>. Keep the larger of the two.
      </p>
      <CodeBlock lang="js" code={knapTableCode} />
      <p>This takes O(n × capacity) time and memory.</p>

      <h2 id="rolling">One row, capacity downwards</h2>
      <p>
        Row <code>i</code> only reads row <code>i - 1</code>. So one array is enough. After we process item <code>i</code>,{" "}
        <code>dp[w]</code> holds what row <code>i</code> would have held. Memory drops to O(capacity). But there is one trap: the{" "}
        <strong>capacity loop must go from high to low</strong>.
      </p>
      <CodeBlock lang="js" code={knapRowCode} />
      <DryRun
        title="weights [1, 3, 4, 5], values [1, 4, 5, 7], capacity 7"
        cols={["After", "Item", "dp[0..7]"]}
        rows={knapRows()}
        note="The last number is the answer, 9. It comes from the items with weight 3 and weight 4 (value 4 + 5)."
      />
      <p>
        <strong>Why downwards?</strong> The update for <code>dp[w]</code> reads <code>dp[w - weight]</code>, which is a <em>smaller</em>{" "}
        index. When we go from high to low, that smaller cell has not changed yet for this item. It still holds the answer from{" "}
        <em>before</em> this item, so the item is added at most once. When we go from low to high, the smaller cell was already
        updated for this item. It may already include the item, so we add the item again. The loop then allows unlimited copies,
        and nothing warns you:
      </p>
      <CodeBlock lang="js" code={knapWrongCode} />

      <h2 id="partition">Partition equal subset sum</h2>
      <p>
        Can an array of positive whole numbers be split into two groups with equal sums? If the total is odd, the answer is no.
        Otherwise we need a subset (some of the numbers) that adds up to exactly <strong>half the total</strong>. The numbers left over
        then make the other half. This is knapsack in disguise. The weights are the numbers, the capacity is the target, and the
        question is yes or no: &ldquo;can we hit the target exactly?&rdquo; State: <strong>dp[s] = true if some subset of the numbers
        seen so far adds up to exactly s</strong>. Each number is used once, so the loop runs downwards.
      </p>
      <CodeBlock lang="js" code={partitionCode} />

      <h2 id="unbounded">Unbounded knapsack: coin change II</h2>
      <p>
        <strong>Unbounded</strong> means you can use each item as many times as you like. Coin change II asks this. You have unlimited
        coins of given values. In how many different <em>combinations</em> can you make the amount? (The same coins in a different
        order count as one answer.) The one-row loop here is the one that looked like a bug a moment ago. Capacity now runs{" "}
        <strong>upwards</strong>. Reading a cell that already includes the current coin is exactly what lets us use the coin again.
      </p>
      <CodeBlock lang="js" code={coinWaysCode} />

      <h2 id="order">Loop order: combinations vs permutations</h2>
      <p>
        Put the coins on the outside. We decide how many of coin 1 to use, then coin 2, and so on. Every way is built in one fixed coin
        order. So 1 + 2 and 2 + 1 cannot both appear. You are counting <strong>combinations</strong> (order does not matter). Now put the
        amount on the outside and the coins inside. At each amount, <em>any</em> coin can be the last one added. So different orders of
        the same coins are counted separately. These are <strong>permutations</strong> (order matters). This is the question
        &ldquo;Combination Sum IV&rdquo;. The rule is the same, only the loops are swapped, and so the question changes.
      </p>
      <CodeBlock lang="js" code={permsCode} />
      <DryRun
        title="amount 3, coins [1, 2]: the table dp[0..3]"
        cols={["Loop order", "Start", "After coin 1 / amount 1", "After coin 2 / amounts 2 and 3", "Answer"]}
        rows={orderRows}
        note="Combinations: 1+1+1 and 1+2. Permutations also count 2+1 as a separate answer."
      />

      <h2 id="practice">Practice questions</h2>
      <p>
        Before you write code, say what <code>dp[i][j]</code> means. Also say which direction each loop should run, and why.
      </p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write the state sentence and the rule for unique paths. Then change it for obstacles and for minimum path sum.</>,
          <>Write 0/1 knapsack as a 2-D table. Then write it again with one row.</>,
          <>Explain why the 0/1 loop goes from high capacity to low. Say what goes wrong if it does not.</>,
          <>Turn &ldquo;partition equal subset sum&rdquo; into the question &ldquo;can a subset add up to half the total?&rdquo;</>,
          <>Explain why coin change II loops over the amount upwards.</>,
          <>Say which loop order counts combinations and which counts permutations. Say why.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        Tables with two numbers also fit problems on <em>two strings</em>. Let <code>dp[i][j]</code> describe the first <code>i</code>{" "}
        characters of one string and the first <code>j</code> characters of the other. <strong>Lesson 57</strong> does this for longest
        common subsequence and edit distance. Then it comes back to the longest increasing subsequence with a faster O(n log n) method.
      </p>
    </DsaLessonPage>
  );
}
