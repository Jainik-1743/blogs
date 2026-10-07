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
  t.step(1, "start", "dp starts as all Infinity", "Infinity means 'no way found yet'. Using it (not -1 or 0) keeps the comparison dp[a - coin] + 1 < dp[a] honest, because Infinity + 1 is still Infinity.", { coins, amount, dp }, "dp");
  dp[0] = 0;
  t.step(2, "update", "dp[0] = 0", "Making amount 0 needs zero coins. Every other answer is built from this one.", { dp }, "dp");
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a && dp[a - coin] + 1 < dp[a]) {
        const old = dp[a];
        dp[a] = dp[a - coin] + 1;
        t.step(6, "update", `dp[${a}] = dp[${a - coin}] + 1 = ${dp[a]}`, `Coin ${coin} fits: amount ${a - coin} costs ${dp[a - coin]} coin(s), so ${a} costs one more. That beats ${old === Infinity ? "Infinity" : old}.`, { a, coin, dp }, "dp");
      } else if (coin > a) {
        t.step(5, "check", `coin ${coin} is bigger than ${a}, skip`, `A coin worth ${coin} cannot be part of making ${a}.`, { a, coin, dp }, "coin");
      } else {
        t.step(5, "check", `coin ${coin} gives ${dp[a - coin] + 1}, no better than ${dp[a]}`, `dp[${a - coin}] + 1 = ${dp[a - coin] + 1}, which does not beat the current dp[${a}] = ${dp[a]}.`, { a, coin, dp }, "coin");
      }
    }
  }
  t.print(dp[amount]);
  t.step(10, "done", `return dp[${amount}] = ${dp[amount]}`, "The best split of 6 is 3 + 3, two coins. A greedy 'biggest coin first' choice would have taken 4 + 1 + 1, three coins.", { dp }, "dp");
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
        In lesson 54 you turned slow recursion into fast code by remembering answers. Now we make that a habit. The most important
        sentence in any dynamic programming (DP) solution is the one that starts{" "}
        <strong>&ldquo;dp[i] means &hellip;&rdquo;</strong>. That sentence defines the <strong>state</strong>: the small question whose
        answer you store for each value of <code>i</code>. Once the state is clear, three more things follow almost mechanically:
      </p>
      <ol>
        <li>
          <strong>Base case:</strong> the answer for the smallest inputs, known without thinking (for example <code>dp[0]</code>).
        </li>
        <li>
          <strong>Transition:</strong> a formula that gets <code>dp[i]</code> from answers you already have. It comes from asking
          &ldquo;what was the last decision?&rdquo;
        </li>
        <li>
          <strong>Order:</strong> fill the array so every answer is ready before it is used (usually left to right).
        </li>
      </ol>
      <p>
        <strong>1-D</strong> DP means the state needs only one index, so the table is a single array. Writing the sentence out loud
        before any code is the best habit in this whole chapter; if you cannot finish it, you do not yet have a solution.
      </p>

      <h2 id="robber">House robber</h2>
      <p>
        A row of houses holds <code>nums[i]</code> money each. You may not rob two neighbouring houses. What is the most you can take?
        The last decision for any house is simple: <strong>skip it</strong> or <strong>rob it</strong>. Robbing house{" "}
        <code>i</code> forbids house <code>i + 1</code>, so you continue from <code>i + 2</code>. Say the state looking forward:
      </p>
      <CodeBlock lang="js" code={robberMemoCode} />
      <p>
        Without the memo this recursion calls itself twice per house, so it takes O(2<sup>n</sup>) time. With the memo each{" "}
        <code>best(i)</code> is computed once: O(n) time and space. The same problem can be stated looking{" "}
        <em>backward</em>, which gives a loop with no recursion at all (<strong>tabulation</strong>, filling a table bottom-up):
      </p>
      <CodeBlock lang="js" code={robberTableCode} />
      <DryRun
        title="nums = [2, 7, 9, 3, 1]"
        cols={["i", "house i", "skip: dp[i-1]", "rob: dp[i-2] + money", "dp[i]"]}
        rows={robberRows}
        note="Each row takes the larger of the two choices. The answer 12 is 2 + 9 + 1."
      />
      <p>
        Notice that a row only looks at the two rows above it. When a table is read like that, you can throw the rest away and keep
        two variables, which cuts space from O(n) to O(1):
      </p>
      <CodeBlock lang="js" code={robberRollCode} />

      <h2 id="circle">House robber II: a circle</h2>
      <p>
        Now the houses stand in a circle, so the first and last are neighbours and cannot both be robbed. Rather than invent a new
        recurrence, split the problem into two line problems: any valid plan avoids the first house <em>or</em> avoids the last one.
        Solve both lines and take the better answer.
      </p>
      <CodeBlock lang="js" code={circularCode} />
      <Callout kind="warn" label="One house">
        With a single house, the two ranges are both empty and would give 0. Handle <code>nums.length === 1</code> on its own.
      </Callout>

      <h2 id="coin">Coin change</h2>
      <p>
        Given coin values and a target <code>amount</code>, find the <strong>fewest coins</strong> that sum to it (you can reuse
        each coin value as often as you like), or <code>-1</code> if it is impossible. Greedy fails here: for coins 1, 3, 4 and
        amount 6, taking the biggest coin first gives 4 + 1 + 1 = 3 coins, but 3 + 3 uses only 2.
      </p>
      <p>
        State: <strong>dp[a] = the fewest coins that make exactly the amount a</strong>. The last decision is which coin you used
        last; if it was <code>coin</code>, the rest is the smaller problem <code>dp[a - coin]</code>, plus one. Try every coin and keep the
        minimum. For amounts that cannot be made we store <code>Infinity</code>, which is neat because it loses every minimum
        comparison and <code>Infinity + 1</code> is still <code>Infinity</code>; we convert it to <code>-1</code> only at the very end.
      </p>
      <CodeBlock lang="js" code={coinCode} />
      <p>The top-down version of the same state, with a memo instead of a loop:</p>
      <CodeBlock lang="js" code={coinMemoCode} />
      <p>
        Time is O(amount × number of coins); space is O(amount). Both versions are correct, but the table avoids deep recursion for large amounts.
      </p>

      <h2 id="trace">Traced: coin change</h2>
      <CodeTrace
        code={traceSrc}
        steps={coinTrace()}
        caption="Step through coins [1, 3, 4] and amount 6. Watch dp[6]: it first becomes 3 via coin 1, then 2 via coin 3, and coin 4 cannot beat it."
      />

      <h2 id="decode">Decode ways</h2>
      <p>
        A message of digits is decoded with <code>1 = A, 2 = B, &hellip;, 26 = Z</code>. Count the ways to read a digit string. State:{" "}
        <strong>dp[i] = the number of ways to decode the first i characters</strong>. The last letter used either one digit (valid when
        it is 1 to 9, never <code>0</code>) or two digits (valid when they form 10 to 26). The ways add up:
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
        Can the string <code>s</code> be cut into pieces that are all in a dictionary? State:{" "}
        <strong>dp[i] = true if the first i characters can be split into dictionary words</strong>. The last word is{" "}
        <code>s[j..i)</code> for some cut point <code>j</code>: if the prefix of length <code>j</code> works and the slice is a word, the
        prefix of length <code>i</code> works too.
      </p>
      <CodeBlock lang="js" code={wordBreakCode} />
      <p>
        Time is O(n² × cost of one slice and lookup), so roughly O(n³) for long words; space O(n). Tip: if the longest dictionary word has
        length <code>L</code>, only try <code>j</code> from <code>i - L</code>, which makes it O(n × L).
      </p>

      <h2 id="lis">Longest increasing subsequence</h2>
      <p>
        A <strong>subsequence</strong> keeps elements in their original order but may skip some (unlike a subarray, which must be
        contiguous). Find the length of the longest <em>strictly increasing</em> one. State:{" "}
        <strong>dp[i] = the length of the longest increasing subsequence that ends at nums[i]</strong>. Look back at every earlier
        smaller number <code>nums[j]</code> and extend its chain by one. The answer is the maximum over all <code>i</code>, because the
        best chain can end anywhere.
      </p>
      <CodeBlock lang="js" code={lisCode} />
      <p>
        That is O(n²) time and O(n) space. A cleverer method with binary search reaches O(n log n); it is the subject of lesson 57.
      </p>
      <Callout kind="note" label="The 'ends at' trick">
        Defining the state as &ldquo;the best answer <em>ending exactly at i</em>&rdquo; (instead of &ldquo;the best in the first i&rdquo;) is
        a very common move. It forces the choice to connect to the next element, and you take the overall maximum at the end.
      </Callout>

      <h2 id="practice">Practice questions</h2>
      <p>
        For each one, write &ldquo;dp[i] means &hellip;&rdquo; first. Then base case, transition, order, and only then code.
      </p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Finish the sentence &ldquo;dp[i] means &hellip;&rdquo; for house robber, coin change and LIS.</>,
          <>Write house robber with two variables and say why that is enough.</>,
          <>Explain how a circle becomes two lines in house robber II.</>,
          <>Say why coin change fills the table with Infinity, and when you convert it to -1.</>,
          <>Name the two cases that add up in decode ways, and when each is valid.</>,
          <>Write word break and LIS, with their time complexities.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        So far every state had one index. <strong>Lesson 56</strong> adds a second: a grid of subproblems for paths on a board and the{" "}
        <strong>knapsack</strong> family, where you choose items under a capacity.
      </p>
    </DsaLessonPage>
  );
}
