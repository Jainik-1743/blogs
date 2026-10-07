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

const lesson = getDsaLesson("lesson-55");

export const metadata: Metadata = {
  title: `Lesson 55 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "state", label: "Defining the state in words" },
  { id: "robber", label: "House robber" },
  { id: "circle", label: "House robber II: a circle" },
  { id: "coin", label: "Coin change" },
  { id: "trace", label: "Traced: coin change" },
  { id: "decode", label: "Decode ways" },
  { id: "word", label: "Word break" },
  { id: "lis", label: "Longest increasing subsequence" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const robberMemoCode = `// State: best(i) = the most money you can take from houses i, i+1, ... to the end.
function rob(nums) {
  const memo = new Map();
  function best(i) {
    if (i >= nums.length) return 0;         // no houses left
    if (memo.has(i)) return memo.get(i);
    const skip = best(i + 1);               // leave house i alone
    const take = nums[i] + best(i + 2);     // rob it, so house i+1 is off limits
    const result = Math.max(skip, take);
    memo.set(i, result);
    return result;
  }
  return best(0);
}

console.log(rob([1, 2, 3, 1]));    // 4
console.log(rob([2, 7, 9, 3, 1])); // 12`;

const robberTableCode = `// State: dp[i] = the most money you can take from the FIRST i houses.
function rob(nums) {
  const n = nums.length;
  const dp = new Array(n + 1).fill(0);      // dp[0] = 0: no houses, no money
  dp[1] = nums[0];
  for (let i = 2; i <= n; i++) {
    dp[i] = Math.max(dp[i - 1],             // skip house i (it is nums[i - 1])
                     dp[i - 2] + nums[i - 1]); // rob it
  }
  return dp[n];
}

console.log(rob([2, 7, 9, 3, 1])); // 12`;

const robberRollCode = `// dp[i] only reads dp[i - 1] and dp[i - 2], so two variables are enough.
function rob(nums) {
  let twoBack = 0;                          // dp[i - 2]
  let oneBack = 0;                          // dp[i - 1]
  for (const money of nums) {
    const current = Math.max(oneBack, twoBack + money);
    twoBack = oneBack;
    oneBack = current;
  }
  return oneBack;
}

console.log(rob([2, 7, 9, 3, 1])); // 12
console.log(rob([5]));             // 5`;

const circularCode = `function robLine(nums, lo, hi) {            // the line version, restricted to nums[lo..hi]
  let twoBack = 0, oneBack = 0;
  for (let i = lo; i <= hi; i++) {
    const current = Math.max(oneBack, twoBack + nums[i]);
    twoBack = oneBack;
    oneBack = current;
  }
  return oneBack;
}

function robCircle(nums) {
  if (nums.length === 1) return nums[0];    // the two ranges below would both be empty
  const withoutLast = robLine(nums, 0, nums.length - 2);
  const withoutFirst = robLine(nums, 1, nums.length - 1);
  return Math.max(withoutFirst, withoutLast);
}

console.log(robCircle([2, 3, 2])); // 3
console.log(robCircle([1, 2, 3, 1])); // 4
console.log(robCircle([1]));       // 1`;

const coinCode = `// State: dp[a] = the fewest coins that make exactly the amount a (Infinity if impossible).
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;                                // zero coins make zero
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a && dp[a - coin] + 1 < dp[a]) {
        dp[a] = dp[a - coin] + 1;           // use one 'coin', then solve the smaller amount
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

console.log(coinChange([1, 3, 4], 6)); // 2   (3 + 3, where greedy would pick 4 + 1 + 1)
console.log(coinChange([2], 3));       // -1
console.log(coinChange([5], 0));       // 0`;

const coinMemoCode = `// The same idea top-down: ask for the smaller amount, remember each answer.
function coinChange(coins, amount) {
  const memo = new Map();
  function fewest(rest) {
    if (rest === 0) return 0;
    if (rest < 0) return Infinity;          // overshot: this path is impossible
    if (memo.has(rest)) return memo.get(rest);
    let best = Infinity;
    for (const coin of coins) best = Math.min(best, fewest(rest - coin) + 1);
    memo.set(rest, best);
    return best;
  }
  const answer = fewest(amount);
  return answer === Infinity ? -1 : answer;
}

console.log(coinChange([1, 3, 4], 6)); // 2
console.log(coinChange([2], 3));       // -1`;

const decodeCode = `// State: dp[i] = the number of ways to decode the first i characters of s.
function numDecodings(s) {
  const n = s.length;
  const dp = new Array(n + 1).fill(0);
  dp[0] = 1;                                // one way to decode nothing: the empty message
  for (let i = 1; i <= n; i++) {
    if (s[i - 1] !== "0") dp[i] += dp[i - 1];   // last character alone is a letter (1-9)
    if (i >= 2) {
      const two = Number(s.slice(i - 2, i));
      if (two >= 10 && two <= 26) dp[i] += dp[i - 2]; // last two characters form a letter (10-26)
    }
  }
  return dp[n];
}

console.log(numDecodings("12"));  // 2   (AB, L)
console.log(numDecodings("226")); // 3   (BZ, VF, BBF)
console.log(numDecodings("06"));  // 0   (a leading zero cannot be decoded)`;

const wordBreakCode = `// State: dp[i] = true if the first i characters of s can be split into dictionary words.
function wordBreak(s, wordDict) {
  const words = new Set(wordDict);          // O(1) membership tests
  const dp = new Array(s.length + 1).fill(false);
  dp[0] = true;                             // the empty prefix is trivially fine
  for (let i = 1; i <= s.length; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] && words.has(s.slice(j, i))) {  // prefix j works, and s[j..i) is a word
        dp[i] = true;
        break;
      }
    }
  }
  return dp[s.length];
}

console.log(wordBreak("leetcode", ["leet", "code"]));                  // true
console.log(wordBreak("catsandog", ["cats", "dog", "sand", "and", "cat"])); // false`;

const lisCode = `// State: dp[i] = the length of the longest increasing subsequence that ENDS at nums[i].
function lengthOfLIS(nums) {
  const dp = new Array(nums.length).fill(1);   // every element alone is a subsequence of length 1
  let best = 0;
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);  // extend a chain ending at j
    }
    best = Math.max(best, dp[i]);           // the chain may end anywhere
  }
  return best;
}

console.log(lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18])); // 4   (2, 3, 7, 18)
console.log(lengthOfLIS([7, 7, 7]));                      // 1   (strictly increasing: equal values do not extend)`;

const traceSrc = `const dp = new Array(amount + 1).fill(Infinity);
dp[0] = 0;
for (let a = 1; a <= amount; a++) {
  for (const coin of coins) {
    if (coin <= a && dp[a - coin] + 1 < dp[a]) {
      dp[a] = dp[a - coin] + 1;
    }
  }
}
return dp[amount] === Infinity ? -1 : dp[amount];`;

function coinTrace() {
  const t = tracer();
  const coins = [1, 3, 4];
  const amount = 6;
  const dp: number[] = new Array(amount + 1).fill(Infinity);
  t.step(1, "start", "dp starts as all Infinity", "Infinity means 'no way found yet'. We use it (not -1 or 0) so the check dp[a - coin] + 1 < dp[a] stays correct, because Infinity + 1 is still Infinity.", { coins, amount, dp }, "dp");
  dp[0] = 0;
  t.step(2, "update", "dp[0] = 0", "Making the amount 0 needs zero coins. Every other answer is built from this one.", { dp }, "dp");
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a && dp[a - coin] + 1 < dp[a]) {
        const old = dp[a];
        dp[a] = dp[a - coin] + 1;
        t.step(6, "update", `dp[${a}] = dp[${a - coin}] + 1 = ${dp[a]}`, `Coin ${coin} fits. Amount ${a - coin} needs ${dp[a - coin]} coin(s), so ${a} needs one more. That beats ${old === Infinity ? "Infinity" : old}.`, { a, coin, dp }, "dp");
      } else if (coin > a) {
        t.step(5, "check", `coin ${coin} is bigger than ${a}, skip`, `A coin worth ${coin} cannot be used to make ${a}.`, { a, coin, dp }, "coin");
      } else {
        t.step(5, "check", `coin ${coin} gives ${dp[a - coin] + 1}, no better than ${dp[a]}`, `dp[${a - coin}] + 1 = ${dp[a - coin] + 1}, which is not better than the current dp[${a}] = ${dp[a]}.`, { a, coin, dp }, "coin");
      }
    }
  }
  t.print(dp[amount]);
  t.step(10, "done", `return dp[${amount}] = ${dp[amount]}`, "The best way to make 6 is 3 + 3, which is two coins. A greedy 'biggest coin first' choice would have taken 4 + 1 + 1, which is three coins.", { dp }, "dp");
  return t.steps;
}

const robberRows: string[][] = [
  ["0", "-", "-", "-", "0"],
  ["1", "2", "0", "0 + 2 = 2", "2"],
  ["2", "7", "2", "0 + 7 = 7", "7"],
  ["3", "9", "7", "2 + 9 = 11", "11"],
  ["4", "3", "11", "7 + 3 = 10", "11"],
  ["5", "1", "11", "11 + 1 = 12", "12"],
];

const decodeRows: string[][] = [
  ["0", "(empty)", "-", "-", "1"],
  ["1", "2", "yes: dp[0] = 1", "-", "1"],
  ["2", "22", "yes: dp[1] = 1", "22 is a letter: dp[0] = 1", "2"],
  ["3", "226", "yes: dp[2] = 2", "26 is a letter: dp[1] = 1", "3"],
];

export default function DsaLessonFiftyFivePage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="state">Defining the state in words</h2>
      <p>
        In lesson 54 you made slow recursion fast by remembering answers. Now we turn that into a habit. The most important
        sentence in any dynamic programming (DP) solution is the one that starts{" "}
        <strong>&ldquo;dp[i] means &hellip;&rdquo;</strong>. This sentence defines the <strong>state</strong>. The state is the small question whose
        answer you save for each value of <code>i</code>. When the state is clear, three more things follow almost by themselves:
      </p>
      <ol>
        <li>
          <strong>Base case:</strong> the answer for the smallest inputs. You know it without thinking (for example <code>dp[0]</code>).
        </li>
        <li>
          <strong>Transition:</strong> a formula that gives <code>dp[i]</code> from answers you already have. To find it, ask
          &ldquo;what was the last decision?&rdquo;
        </li>
        <li>
          <strong>Order:</strong> fill the array so that every answer is ready before you use it (usually from left to right).
        </li>
      </ol>
      <p>
        <strong>1-D</strong> DP means the state needs only one index, so the table is a single array. Say the sentence out loud
        before you write any code. This is the best habit in this whole chapter. If you cannot finish the sentence, you do not have a solution yet.
      </p>

      <h2 id="robber">House robber</h2>
      <p>
        A row of houses holds <code>nums[i]</code> money each. You may not rob two houses that are next to each other. What is the most money you can take?
        For every house the last decision is simple: <strong>skip it</strong> or <strong>rob it</strong>. If you rob house{" "}
        <code>i</code>, you cannot rob house <code>i + 1</code>, so you continue from <code>i + 2</code>. Here is the state, looking forward:
      </p>
      <CodeBlock lang="js" code={robberMemoCode} />
      <p>
        Without the memo, this recursion calls itself twice per house, so the time is O(2<sup>n</sup>). With the memo, each{" "}
        <code>best(i)</code> is worked out only once. The time and space are O(n). You can also state the same problem looking{" "}
        <em>backward</em>. That gives a loop with no recursion at all. This is called <strong>tabulation</strong>, which means filling a table from the bottom up:
      </p>
      <CodeBlock lang="js" code={robberTableCode} />
      <DryRun
        title="nums = [2, 7, 9, 3, 1]"
        cols={["i", "house i", "skip: dp[i-1]", "rob: dp[i-2] + money", "dp[i]"]}
        rows={robberRows}
        note="Each row takes the larger of the two choices. The answer 12 is 2 + 9 + 1."
      />
      <p>
        Notice that each row only looks at the two rows before it. When a table is used like this, you can throw the rest away and keep
        just two variables. This cuts the space from O(n) to O(1):
      </p>
      <CodeBlock lang="js" code={robberRollCode} />

      <h2 id="circle">House robber II: a circle</h2>
      <p>
        Now the houses stand in a circle. The first and the last house are neighbours, so you cannot rob both. Do not invent a new
        formula. Instead, split the problem into two problems with a straight row. Any valid plan skips the first house <em>or</em> skips the last one.
        Solve both rows and take the better answer.
      </p>
      <CodeBlock lang="js" code={circularCode} />
      <Callout kind="warn" label="One house">
        With a single house, both ranges are empty and would give 0. Handle <code>nums.length === 1</code> on its own.
      </Callout>

      <h2 id="coin">Coin change</h2>
      <p>
        You get coin values and a target <code>amount</code>. Find the <strong>fewest coins</strong> that add up to it. You can use
        each coin value as many times as you like. If it is impossible, return <code>-1</code>. Greedy (always taking the biggest coin first) fails here. For coins 1, 3, 4 and
        amount 6, the biggest coin first gives 4 + 1 + 1 = 3 coins, but 3 + 3 uses only 2 coins.
      </p>
      <p>
        State: <strong>dp[a] = the fewest coins that make exactly the amount a</strong>. The last decision is which coin you used
        last. If it was <code>coin</code>, the rest is the smaller problem <code>dp[a - coin]</code>, plus one. Try every coin and keep the
        smallest result. For amounts that cannot be made, we store <code>Infinity</code>. This works well because Infinity never wins a
        &ldquo;smallest&rdquo; comparison, and <code>Infinity + 1</code> is still <code>Infinity</code>. We turn it into <code>-1</code> only at the very end.
      </p>
      <CodeBlock lang="js" code={coinCode} />
      <p>Here is the top-down version of the same state. It uses a memo (a saved-answers notebook) instead of a loop:</p>
      <CodeBlock lang="js" code={coinMemoCode} />
      <p>
        The time is O(amount × number of coins) and the space is O(amount). Both versions are correct, but the table avoids deep recursion for large amounts.
      </p>

      <h2 id="trace">Traced: coin change</h2>
      <CodeTrace
        code={traceSrc}
        steps={coinTrace()}
        caption="Step through coins [1, 3, 4] and amount 6. Watch dp[6]. It first becomes 3 with coin 1, then 2 with coin 3, and coin 4 cannot beat that."
      />

      <h2 id="decode">Decode ways</h2>
      <p>
        A message of digits is decoded with <code>1 = A, 2 = B, &hellip;, 26 = Z</code>. Count the ways to read a string of digits. State:{" "}
        <strong>dp[i] = the number of ways to decode the first i characters</strong>. The last letter used either one digit (valid when
        it is 1 to 9, never <code>0</code>) or two digits (valid when they make a number from 10 to 26). The two counts add up:
      </p>
      <CodeBlock lang="js" code={decodeCode} />
      <DryRun
        title='s = "226"'
        cols={["i", "prefix", "one digit ok?", "two digits ok?", "dp[i]"]}
        rows={decodeRows}
        note="dp[3] = 3: BZ (2, 26), VF (22, 6) and BBF (2, 2, 6)."
      />

      <h2 id="word">Word break</h2>
      <p>
        Can the string <code>s</code> be cut into pieces that are all in a dictionary (a list of allowed words)? State:{" "}
        <strong>dp[i] = true if the first i characters can be split into dictionary words</strong>. The last word is{" "}
        <code>s[j..i)</code> for some cut point <code>j</code>. If the start of the string of length <code>j</code> works, and the slice is a word, then the
        start of length <code>i</code> works too.
      </p>
      <CodeBlock lang="js" code={wordBreakCode} />
      <p>
        The time is O(n² × the cost of one slice and lookup), which is roughly O(n³) for long words. The space is O(n). Tip: if the longest dictionary word has
        length <code>L</code>, try only <code>j</code> values from <code>i - L</code> upwards. That makes it O(n × L).
      </p>

      <h2 id="lis">Longest increasing subsequence</h2>
      <p>
        A <strong>subsequence</strong> keeps items in their original order but may skip some. (A subarray is different: it must be one
        unbroken piece.) Find the length of the longest <em>strictly increasing</em> subsequence, where every number is bigger than the one before. State:{" "}
        <strong>dp[i] = the length of the longest increasing subsequence that ends at nums[i]</strong>. Look back at every earlier
        smaller number <code>nums[j]</code> and add one to its chain. The answer is the biggest value over all <code>i</code>, because the
        best chain can end anywhere.
      </p>
      <CodeBlock lang="js" code={lisCode} />
      <p>
        The time is O(n²) and the space is O(n). A cleverer method with binary search (halving the search range each time) reaches O(n log n). You will meet it in lesson 57.
      </p>
      <Callout kind="note" label="The 'ends at' trick">
        A common move is to define the state as &ldquo;the best answer <em>ending exactly at i</em>&rdquo; instead of &ldquo;the best answer in the first i items&rdquo;. It forces
        the choice to connect to the next item. At the end, you take the biggest value overall.
      </Callout>

      <h2 id="practice">Practice questions</h2>
      <p>
        For each question, first write &ldquo;dp[i] means &hellip;&rdquo;. Then write the base case, the transition and the order. Only then write the code.
      </p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Finish the sentence &ldquo;dp[i] means &hellip;&rdquo; for house robber, coin change and LIS (longest increasing subsequence).</>,
          <>Write house robber with two variables and say why two are enough.</>,
          <>Explain how a circle becomes two straight rows in house robber II.</>,
          <>Say why coin change fills the table with Infinity, and when you change it to -1.</>,
          <>Name the two cases that add up in decode ways, and say when each one is valid.</>,
          <>Write word break and LIS, and give their time costs.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        So far every state had one index. <strong>Lesson 56</strong> adds a second index. You get a grid of subproblems, used for paths on a board and for the{" "}
        <strong>knapsack</strong> family of problems, where you choose items without going over a size limit (the capacity).
      </p>
    </DsaLessonPage>
  );
}
