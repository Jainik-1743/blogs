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

const lesson = getDsaLesson("lesson-54");

export const metadata: Metadata = {
  title: `Lesson 54 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "why", label: "The same work, again and again" },
  { id: "two", label: "Two properties that make DP work" },
  { id: "recipe", label: "The four questions" },
  { id: "plain", label: "Step 1: plain recursion" },
  { id: "memo", label: "Step 2: memoisation (top-down)" },
  { id: "trace", label: "Traced: climbing stairs with a cache" },
  { id: "tab", label: "Step 3: tabulation (bottom-up)" },
  { id: "space", label: "Step 4: reducing space" },
  { id: "stairs", label: "Climbing stairs and minimum cost" },
  { id: "greedy", label: "When greedy fails, DP still works" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const plainCode = `let calls = 0;
function fib(n) {                            // fib(0) = 0, fib(1) = 1, fib(n) = fib(n-1) + fib(n-2)
  calls++;
  if (n <= 1) return n;                      // base cases
  return fib(n - 1) + fib(n - 2);
}

console.log(fib(20), calls); // 6765 21891`;

const plainBigCode = `let calls = 0;
function fib(n) {
  calls++;
  return n <= 1 ? n : fib(n - 1) + fib(n - 2);
}
console.log(fib(30), calls); // 832040 2692537`;

const memoCode = `let calls = 0;
function fibMemo(n, memo = new Map()) {
  calls++;
  if (n <= 1) return n;                      // base cases
  if (memo.has(n)) return memo.get(n);       // already solved: reuse the answer
  const answer = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  memo.set(n, answer);                       // write the answer down before returning
  return answer;
}

console.log(fibMemo(30), calls); // 832040 59
calls = 0;
console.log(fibMemo(50), calls); // 12586269025 99`;

const tabCode = `function fibTab(n) {
  if (n <= 1) return n;
  const dp = new Array(n + 1).fill(0);       // dp[i] = fib(i)
  dp[0] = 0;                                 // base cases first
  dp[1] = 1;
  for (let i = 2; i <= n; i++) {             // fill in an order where the inputs already exist
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}

console.log(fibTab(10)); // 55
console.log(fibTab(50)); // 12586269025`;

const spaceCode = `function fibSpace(n) {
  if (n <= 1) return n;
  let prev = 0, curr = 1;                    // fib(i-2) and fib(i-1): all that the next value needs
  for (let i = 2; i <= n; i++) {
    [prev, curr] = [curr, prev + curr];      // slide the window one step to the right
  }
  return curr;
}

console.log(fibSpace(10)); // 55
console.log(fibSpace(50)); // 12586269025`;

const stairsCode = `// Climbing stairs: each move is 1 or 2 steps. In how many ways can you reach step n?
// ways(n) = ways(n-1) + ways(n-2): your last move was a 1-step from n-1, or a 2-step from n-2.

function waysMemo(n, memo = new Map()) {     // top-down
  if (n <= 1) return 1;                      // one way to stand still, one way to reach step 1
  if (memo.has(n)) return memo.get(n);
  const answer = waysMemo(n - 1, memo) + waysMemo(n - 2, memo);
  memo.set(n, answer);
  return answer;
}

function waysTab(n) {                        // bottom-up, O(1) space
  let prev = 1, curr = 1;                    // ways(0) and ways(1)
  for (let i = 2; i <= n; i++) [prev, curr] = [curr, prev + curr];
  return curr;
}

console.log(waysMemo(5), waysTab(5));   // 8 8
console.log(waysMemo(10), waysTab(10)); // 89 89`;

const minCostCode = `// Min cost climbing stairs: cost[i] is paid when you step OFF stair i (1 or 2 steps up).
// Start on stair 0 or 1 for free; the goal is "one past the last stair", index n.
function minCostClimbingStairs(cost) {
  const n = cost.length;
  const dp = new Array(n + 1).fill(0);       // dp[i] = cheapest way to be standing on step i
  for (let i = 2; i <= n; i++) {
    dp[i] = Math.min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2]);
  }
  return dp[n];
}

console.log(minCostClimbingStairs([10, 15, 20]));                        // 15
console.log(minCostClimbingStairs([1, 100, 1, 1, 1, 100, 1, 1, 100, 1])); // 6`;

const coinCode = `// Fewest coins for an amount. Lesson 47: greedy (biggest coin first) can be wrong.
function greedyCoins(coins, amount) {
  const sorted = [...coins].sort((a, b) => b - a);
  let count = 0;
  for (const c of sorted) {
    count += Math.floor(amount / c);
    amount %= c;
  }
  return amount === 0 ? count : -1;
}

// DP: dp[a] = fewest coins that add up to exactly a.
function dpCoins(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;                                 // zero coins make amount 0
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);   // try c as the last coin
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

console.log(greedyCoins([1, 3, 4], 6)); // 3   (4 + 1 + 1)
console.log(dpCoins([1, 3, 4], 6));     // 2   (3 + 3)`;

const traceSrc = `const memo = new Map();
function ways(n) {
  if (n <= 1) return 1;
  if (memo.has(n)) return memo.get(n);
  const result = ways(n - 1) + ways(n - 2);
  memo.set(n, result);
  return result;
}
ways(5);`;

function stairsTrace() {
  const t = tracer();
  const memo = new Map<number, number>();
  const stack: number[] = [];
  let calls = 0;
  let hits = 0;
  const snap = () => ({ stack: [...stack], memo, calls, hits });
  t.step(1, "start", "memo = empty Map", "The notebook where we will write down every answer we compute.", { memo }, "memo");

  function ways(n: number): number {
    calls++;
    stack.push(n);
    t.step(2, "run", `call ways(${n})`, `Call number ${calls}. The stack of open calls is shown below.`, snap(), "stack");
    if (n <= 1) {
      t.step(3, "check", `base case: ways(${n}) = 1`, `There is exactly one way to reach step ${n}. No recursion needed.`, snap());
      stack.pop();
      return 1;
    }
    if (memo.has(n)) {
      hits++;
      t.step(4, "check", `cache hit: ways(${n}) = ${memo.get(n)}`, `We solved ways(${n}) earlier, so we just read it. This one hit removes an entire subtree of calls.`, snap(), "hits");
      stack.pop();
      return memo.get(n)!;
    }
    t.step(4, "check", `cache miss for ${n}`, `Nothing written down for ${n} yet, so we must compute it from ways(${n - 1}) and ways(${n - 2}).`, snap());
    const a = ways(n - 1);
    const b = ways(n - 2);
    const result = a + b;
    t.step(5, "update", `ways(${n}) = ${a} + ${b} = ${result}`, `Both smaller answers are known, so add them.`, { ...snap(), result }, "result");
    memo.set(n, result);
    t.step(6, "update", `memo[${n}] = ${result}`, `Write the answer down before returning, so any later call for ${n} is free.`, { ...snap(), result }, "memo");
    stack.pop();
    return result;
  }

  const answer = ways(5);
  t.step(9, "done", `ways(5) = ${answer}`, `Only ${calls} calls instead of 15 for the plain recursion: ${hits} of them were cache hits that skipped a whole subtree.`, { answer, ...snap() });
  return t.steps;
}

const propertyRows: string[][] = [
  ["Overlapping subproblems", "the same smaller question comes up many times", "fib(3) is needed by both fib(5) and fib(4)", "caching pays off"],
  ["Optimal substructure", "the best answer is built from best answers to smaller questions", "the cheapest way to reach step 5 uses the cheapest way to reach step 4 or 3", "the transition is valid"],
];

const recipeRows: string[][] = [
  ["Fibonacci", "i: which number", "dp[i] = dp[i-1] + dp[i-2]", "dp[0] = 0, dp[1] = 1", "i upwards"],
  ["Climbing stairs", "i: which step", "dp[i] = dp[i-1] + dp[i-2]", "dp[0] = 1, dp[1] = 1", "i upwards"],
  ["Min cost climbing", "i: which step we stand on", "dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2])", "dp[0] = dp[1] = 0", "i upwards"],
  ["Fewest coins", "a: the amount left", "dp[a] = 1 + min(dp[a - c]) over coins c ≤ a", "dp[0] = 0", "a upwards"],
];

const compareRows: string[][] = [
  ["Plain recursion", "O(φⁿ), about 1.6ⁿ", "O(n) call stack", "never reuses anything"],
  ["Memoisation (top-down)", "O(n)", "O(n) cache + O(n) call stack", "easy to write from the recursion; only computes what is needed"],
  ["Tabulation (bottom-up)", "O(n)", "O(n) table", "no recursion, so no stack overflow; computes every entry"],
  ["Space-reduced", "O(n)", "O(1)", "keep only the last few entries"],
];

const coinRows: string[][] = [
  ["0", "0", "base case"],
  ["1", "1", "1 + dp[0]"],
  ["2", "2", "1 + dp[1]"],
  ["3", "1", "1 + dp[0] using the coin 3"],
  ["4", "1", "1 + dp[0] using the coin 4"],
  ["5", "2", "1 + dp[1] using the coin 4"],
  ["6", "2", "1 + dp[3] using the coin 3, which is 3 + 3"],
];

export default function DsaLessonFiftyFourPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="why">The same work, again and again</h2>
      <p>
        Part 14 is about one big idea: <strong>dynamic programming</strong> (DP). Despite the grand name, it is just{" "}
        &ldquo;recursion that remembers&rdquo;. You break a problem into smaller versions of itself, as in Part 8, but you refuse to
        solve the same small version twice.
      </p>
      <p>
        Lesson 32 introduced <strong>recursion trees</strong>, with every call drawn as a node. Here is the plain Fibonacci
        function (each number is the sum of the previous two) with a counter for the calls it makes:
      </p>
      <CodeBlock lang="js" code={plainCode} />
      <p>
        Just to compute <code>fib(20)</code> the function runs 21,891 times. For 30 it is far worse:
      </p>
      <CodeBlock lang="js" code={plainBigCode} />
      <p>
        Nearly 2.7 million calls for an answer that is only the 30th term. Each call to <code>fib(n)</code> spawns two more, so the
        tree roughly doubles at each level. The cause is visible in the tree: <code>fib(5)</code> calls <code>fib(4)</code> and{" "}
        <code>fib(3)</code>, but <code>fib(4)</code> also calls <code>fib(3)</code>. That <code>fib(3)</code> subtree is built twice,
        and inside it <code>fib(2)</code> is built again and again. There are only n + 1 <em>different</em> questions, yet we answer
        them exponentially many times.
      </p>

      <h2 id="two">Two properties that make DP work</h2>
      <p>
        DP applies when a problem has both of these:
      </p>
      <DryRun
        title="the DP checklist"
        cols={["Property", "Meaning", "Example", "What it gives us"]}
        rows={propertyRows}
        note="Fibonacci and climbing stairs do not minimise anything, so optimal substructure is trivially true there. It starts to matter when a problem asks for a minimum, a maximum or a count."
      />
      <p>
        The word <strong>subproblem</strong> just means &ldquo;the same question with a smaller input&rdquo;. If subproblems
        do <em>not</em> overlap (merge sort&apos;s two halves never share work) then caching does nothing, and plain divide and conquer is
        the right tool. If they overlap, DP turns exponential time into polynomial time.
      </p>

      <h2 id="recipe">The four questions</h2>
      <p>
        Every DP solution answers the same four questions. Write them down before any code:
      </p>
      <ol>
        <li><strong>State.</strong> What small set of values identifies one subproblem? (For Fibonacci: just <code>i</code>.)</li>
        <li><strong>Transition.</strong> How is the answer for a state built from answers to smaller states?</li>
        <li><strong>Base cases.</strong> Which states can be answered immediately, with no recursion?</li>
        <li><strong>Order.</strong> In what order must we fill states so that everything a state needs is already known? (Smaller to larger, for most 1-D problems.)</li>
      </ol>
      <DryRun
        title="the four questions, applied"
        cols={["Problem", "State", "Transition", "Base case", "Order"]}
        rows={recipeRows}
      />
      <p>
        Once you can state the transition as a formula, the three coding styles below are mostly mechanical translations.
      </p>

      <h2 id="plain">Step 1: plain recursion</h2>
      <p>
        Always start here. Write the recursion that is obviously right, even if it is slow: it is your specification, and it
        tells you the state and the transition. The Fibonacci function at the top of this lesson is already that first step.
        (Lesson 47&apos;s brute-force coin counter is another: &ldquo;try every first coin&rdquo;.)
      </p>

      <h2 id="memo">Step 2: memoisation (top-down)</h2>
      <p>
        <strong>Memoisation</strong> (from &ldquo;memo&rdquo;, a note to yourself, not &ldquo;memorisation&rdquo;) keeps the
        recursion exactly as it was and adds a notebook: before computing a state, look it up; after computing it, write it down.
        The cache is usually a <code>Map</code> (lesson 32 used the same trick) or an array indexed by the state. It is called{" "}
        <strong>top-down</strong> because you start at the big question and let recursion find the smaller ones.
      </p>
      <CodeBlock lang="js" code={memoCode} />
      <p>
        Now <code>fibMemo(30)</code> makes 59 calls instead of 2.7 million. Why 59? Each of the 29 states from 2 to 30 does real work
        once (that is 29 calls that go on to recurse), and each of those makes two calls, 58 in total, plus the first call: 1 + 58 = 59.
        In general about 2n calls, so O(n) time. The notebook costs O(n) space, and the recursion depth is O(n) too.
      </p>

      <h2 id="trace">Traced: climbing stairs with a cache</h2>
      <p>
        Here is the stairs problem you will meet shortly: <code>ways(n)</code> counts the ways to climb n stairs taking 1 or 2 steps
        at a time. Watch the notebook fill, and look for the <strong>cache hits</strong>, the moments a whole branch of the
        tree is skipped.
      </p>
      <CodeTrace
        code={traceSrc}
        steps={stairsTrace()}
        caption="Fifteen calls shrink to nine. The hit on ways(2) saves a subtree under ways(4), and the hit on ways(3) saves another under ways(5)."
      />

      <h2 id="tab">Step 3: tabulation (bottom-up)</h2>
      <p>
        <strong>Tabulation</strong> flips the direction: skip the recursion, build a table <code>dp</code> (a plain array), fill in the base
        cases, then loop from small states to large so that every value you need is already in the table. It is called{" "}
        <strong>bottom-up</strong>.
      </p>
      <CodeBlock lang="js" code={tabCode} />
      <p>
        There is no call stack to overflow, and the loop is tight and fast. The cost is that you must get the <em>order</em> right yourself,
        and you fill every entry even if the final answer only needs some.
      </p>

      <h2 id="space">Step 4: reducing space</h2>
      <p>
        Look at the transition: <code>dp[i]</code> reads only <code>dp[i-1]</code> and <code>dp[i-2]</code>. Older entries are never
        touched again, so the full table is wasted. Keep just the last two values:
      </p>
      <CodeBlock lang="js" code={spaceCode} />
      <DryRun
        title="the same problem, four ways"
        cols={["Style", "Time", "Space", "Notes"]}
        rows={compareRows}
        note="Rule of thumb: write the recursion, add the memo if it is slow, convert to a table if you want to avoid recursion, and shrink the table last, only if the transition looks back a fixed distance."
      />
      <Callout kind="warn" label="Recursion depth in JavaScript">
        The memoised version recurses n levels deep. For n in the tens of thousands, the call stack can overflow, which is one practical
        reason to prefer the bottom-up loop on large inputs.
      </Callout>

      <h2 id="stairs">Climbing stairs and minimum cost</h2>
      <p>
        <strong>Climbing stairs</strong>: you may take 1 or 2 steps at a time; in how many different ways can you reach step n? Your last move
        was either a 1-step from step n − 1 or a 2-step from step n − 2, and those two cases never overlap, so{" "}
        <code>ways(n) = ways(n-1) + ways(n-2)</code>. It is Fibonacci in disguise, only with different base cases (one way to reach step 0 by
        doing nothing, one way to reach step 1).
      </p>
      <CodeBlock lang="js" code={stairsCode} />
      <p>
        <strong>Min cost climbing stairs</strong> adds a price per stair and asks for the cheapest route. The state is the step we are
        standing on, and the transition takes the cheaper of the two ways to arrive. Now optimal substructure is doing real work: the cheapest
        route to step i must contain a cheapest route to whichever step it came from.
      </p>
      <CodeBlock lang="js" code={minCostCode} />

      <h2 id="greedy">When greedy fails, DP still works</h2>
      <p>
        Lesson 47 ended with a counterexample: with coins 1, 3 and 4 and an amount of 6, the greedy rule &ldquo;take the biggest coin
        that fits&rdquo; gives 4 + 1 + 1 (three coins), but 3 + 3 uses only two. Greedy commits to one choice and never looks back. DP
        instead <em>tries every possible last coin</em> and trusts the already-computed best answer for what remains.
      </p>
      <CodeBlock lang="js" code={coinCode} />
      <DryRun
        title="dp[a] for coins 1, 3, 4"
        cols={["Amount a", "dp[a]", "How"]}
        rows={coinRows}
        note="Lesson 55 builds this out properly as the coin change problem; for now, notice that it has the same four ingredients as Fibonacci."
      />

      <h2 id="practice">Practice questions</h2>
      <p>
        For each one, write the state, the transition and the base cases first. Then code the plain recursion, add the cache, and
        try to shrink it.
      </p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Explain why plain recursive Fibonacci is exponential, using the recursion tree.</>,
          <>Name the two properties of a DP problem and give an example of each.</>,
          <>List the four questions: state, transition, base cases, order.</>,
          <>Turn a recursive function into a memoised one by adding a cache lookup and a cache write.</>,
          <>Convert the memoised version to a bottom-up table, then reduce it to O(1) space.</>,
          <>Show with coins 1, 3, 4 and amount 6 why greedy fails but DP succeeds.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        <strong>Lesson 55</strong> practises this recipe on classic 1-D problems: house robber (take or skip), coin change,
        decode ways, word break and the longest increasing subsequence. In each, the whole trick is choosing the state and the transition.
      </p>
    </DsaLessonPage>
  );
}
