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

const lesson = getDsaLesson("lesson-57");

export const metadata: Metadata = {
  title: `Lesson 57 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "why", label: "Two strings, one table" },
  { id: "lcs", label: "Longest common subsequence" },
  { id: "trace", label: "Traced: filling the LCS table" },
  { id: "recover", label: "Recovering the actual string" },
  { id: "edit", label: "Edit distance" },
  { id: "palin", label: "Longest palindromic subsequence" },
  { id: "lis", label: "LIS in O(n log n)" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const lcsCode = `// Length of the longest common subsequence of a and b.
// dp[i][j] = LCS length of the first i characters of a and the first j characters of b.
function lcs(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));   // row 0 and column 0 stay 0: an empty prefix has no common part
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;                  // the two last characters match: extend the diagonal
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);  // drop a's last character, or drop b's
      }
    }
  }
  return dp[m][n];
}

console.log(lcs("abcde", "ace"));   // 3
console.log(lcs("abc", "def"));     // 0
console.log(lcs("AGGTAB", "GXTXAYB")); // 4`;

const lcsRecoverCode = `// Same table, then walk back from the bottom-right corner to read off one actual LCS.
function lcsString(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const letters = [];
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      letters.push(a[i - 1]);                  // this character is part of the answer
      i--; j--;                                // move diagonally
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;                                     // the value came from above: skip a's character
    } else {
      j--;                                     // the value came from the left: skip b's character
    }
  }
  return letters.reverse().join("");           // we collected the letters from the end, so reverse them
}

console.log(lcsString("abcde", "ace"));        // ace
console.log(lcsString("AGGTAB", "GXTXAYB"));   // GTAB`;

const editCode = `// Minimum insert / delete / replace operations to turn word1 into word2.
// dp[i][j] = edits to turn the first i characters of word1 into the first j characters of word2.
function editDistance(word1, word2) {
  const m = word1.length, n = word2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;   // turn i characters into nothing: i deletions
  for (let j = 0; j <= n; j++) dp[0][j] = j;   // build j characters from nothing: j insertions
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];           // last characters already agree: no operation needed
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j - 1],                    // replace word1's last character with word2's
          dp[i - 1][j],                        // delete word1's last character
          dp[i][j - 1],                        // insert word2's last character at the end
        );
      }
    }
  }
  return dp[m][n];
}

console.log(editDistance("horse", "ros"));           // 3
console.log(editDistance("intention", "execution")); // 5
console.log(editDistance("", "abc"));                // 3`;

const lpsReverseCode = `// A palindrome reads the same forwards and backwards, so the longest palindromic
// subsequence of s is the longest common subsequence of s and its reverse.
function longestPalindromeSubseq(s) {
  const t = s.split("").reverse().join("");
  const n = s.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = s[i - 1] === t[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[n][n];
}

console.log(longestPalindromeSubseq("bbbab"));  // 4   ("bbbb")
console.log(longestPalindromeSubseq("cbbd"));   // 2   ("bb")`;

const lpsIntervalCode = `// Interval DP: dp[i][j] = longest palindromic subsequence inside s[i..j] (both ends included).
function longestPalindromeSubseq(s) {
  const n = s.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = n - 1; i >= 0; i--) {           // go from the bottom row up: dp[i] needs dp[i + 1]
    dp[i][i] = 1;                              // a single character is a palindrome of length 1
    for (let j = i + 1; j < n; j++) {
      if (s[i] === s[j]) {
        dp[i][j] = dp[i + 1][j - 1] + 2;       // matching ends wrap whatever is best in between
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);   // drop the left end, or drop the right end
      }
    }
  }
  return dp[0][n - 1];
}

console.log(longestPalindromeSubseq("bbbab"));  // 4
console.log(longestPalindromeSubseq("cbbd"));   // 2
console.log(longestPalindromeSubseq("a"));      // 1`;

const lisSlowCode = `// O(n^2): best[i] = length of the longest increasing subsequence that ENDS at index i.
function lisQuadratic(nums) {
  const best = new Array(nums.length).fill(1);
  let answer = 0;
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) best[i] = Math.max(best[i], best[j] + 1);
    }
    answer = Math.max(answer, best[i]);
  }
  return answer;
}

console.log(lisQuadratic([10, 9, 2, 5, 3, 7, 101, 18])); // 4`;

const lisFastCode = `// O(n log n). tails[k] = the smallest possible LAST value of an increasing subsequence of length k + 1.
// tails is always sorted, so we can binary search it.
function lengthOfLIS(nums) {
  const tails = [];
  for (const x of nums) {
    let lo = 0, hi = tails.length;             // find the first index whose value is >= x
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = x;                             // lo === tails.length means "extend by one"; otherwise "lower an existing tail"
  }
  return tails.length;
}

console.log(lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18])); // 4
console.log(lengthOfLIS([0, 1, 0, 3, 2, 3]));            // 4
console.log(lengthOfLIS([7, 7, 7, 7]));                  // 1`;

const lisTailsCode = `// Watch tails change. Note that it is NOT the subsequence itself.
function showTails(nums) {
  const tails = [];
  for (const x of nums) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < x) lo = mid + 1; else hi = mid;
    }
    tails[lo] = x;
    console.log(x, "->", [...tails]);
  }
}

showTails([4, 5, 1]);
// 4 -> [ 4 ]
// 5 -> [ 4, 5 ]
// 1 -> [ 1, 5 ]      but 1, 5 is not a subsequence of [4, 5, 1]: the 5 comes BEFORE the 1`;

const traceSrc = `const m = a.length, n = b.length;
const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
for (let i = 1; i <= m; i++) {
  for (let j = 1; j <= n; j++) {
    if (a[i - 1] === b[j - 1]) {
      dp[i][j] = dp[i - 1][j - 1] + 1;
    } else {
      dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
}
return dp[m][n];`;

function lcsTrace() {
  const t = tracer();
  const a = "abcde";
  const b = "ace";
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  const snap = () => dp.map((r) => [...r]);
  t.step(2, "start", "table of zeros", `Each row is the start of "abcde" (0 to 5 characters). Each column is the start of "ace" (0 to 3). Row 0 and column 0 stay 0.`, { a, b, dp: snap() }, "dp");
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        t.step(6, "update", `"${a[i - 1]}" = "${b[j - 1]}": dp[${i}][${j}] = ${dp[i][j]}`, `The last characters match. So take the value diagonally up-left, dp[${i - 1}][${j - 1}] = ${dp[i - 1][j - 1]}, and add 1.`, { i, j, dp: snap() }, "dp");
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        t.step(8, "update", `"${a[i - 1]}" ≠ "${b[j - 1]}": dp[${i}][${j}] = ${dp[i][j]}`, `No match. So keep the bigger of the cell above (${dp[i - 1][j]}) and the cell to the left (${dp[i][j - 1]}).`, { i, j, dp: snap() }, "dp");
      }
    }
  }
  t.print(dp[m][n]);
  t.step(12, "done", `answer = dp[${m}][${n}] = ${dp[m][n]}`, `The bottom-right cell is the answer for the whole strings. The longest common subsequence is "ace".`, { dp: snap() }, "dp");
  return t.steps;
}

const editRows: string[][] = [
  ["", "0", "1", "2", "3"],
  ["h", "1", "1", "2", "3"],
  ["o", "2", "2", "1", "2"],
  ["r", "3", "2", "2", "2"],
  ["s", "4", "3", "3", "2"],
  ["e", "5", "4", "4", "3"],
];

const tailsRows: string[][] = [
  ["10", "[10]", "tails was empty, so start a subsequence of length 1"],
  ["9", "[9]", "9 replaces 10. A smaller last value for length 1 is always better"],
  ["2", "[2]", "2 replaces 9, for the same reason"],
  ["5", "[2, 5]", "5 is bigger than every tail, so add it. Length is now 2"],
  ["3", "[2, 3]", "3 replaces 5. Now length 2 can end at 3"],
  ["7", "[2, 3, 7]", "add it. Length is now 3"],
  ["101", "[2, 3, 7, 101]", "add it. Length is now 4"],
  ["18", "[2, 3, 7, 18]", "18 replaces 101. The answer is the length of tails, which is 4"],
];

export default function DsaLessonFiftySevenPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="why">Two strings, one table</h2>
      <p>
        Lesson 56 filled two-dimensional tables (tables with rows and columns) for grids and knapsack. Strings work the same way.
        When a question compares two strings, let <strong>one side of the table follow each string</strong>. The cell{" "}
        <code>dp[i][j]</code> then answers the question about the <em>first i characters of the first string</em> and the{" "}
        <em>first j characters of the second string</em>. Each cell is worked out from its neighbours: the cell above, the cell to
        the left, and the cell diagonally up-left. This is just like the grid paths you already know.
      </p>
      <p>
        Two words matter here. A <strong>subsequence</strong> keeps the characters in their original order, but it may skip some.{" "}
        <code>&quot;ace&quot;</code> is a subsequence of <code>&quot;abcde&quot;</code>. A <strong>substring</strong> must be one
        unbroken piece, with no gaps. <code>&quot;bcd&quot;</code> is a substring, but <code>&quot;ace&quot;</code> is not. Read the
        question twice to see which one it asks about, because the methods are different.
      </p>

      <h2 id="lcs">Longest common subsequence</h2>
      <p>
        The <strong>longest common subsequence</strong> (LCS) of two strings is the longest run of characters that appears in both
        strings, in the same order. For <code>&quot;abcde&quot;</code> and <code>&quot;ace&quot;</code> it is{" "}
        <code>&quot;ace&quot;</code>, with length 3.
      </p>
      <p>
        Let <code>dp[i][j]</code> be the LCS length of <code>a[0..i)</code> and <code>b[0..j)</code> (the first i characters of a and the
        first j characters of b). A prefix is the start of a string. Look only at the last character of each prefix:
      </p>
      <ul>
        <li>
          If <code>a[i-1] === b[j-1]</code>, the two characters match. Using them is never a mistake, so{" "}
          <code>dp[i][j] = dp[i-1][j-1] + 1</code>.
        </li>
        <li>
          If they do not match, at least one of the two last characters is not used. So the answer is the bigger of two choices. You can
          drop a&apos;s last character (<code>dp[i-1][j]</code>), or drop b&apos;s last character (<code>dp[i][j-1]</code>).
        </li>
      </ul>
      <p>
        We add a row and a column of zeros for the empty prefixes. This keeps the index numbers simple. That is why the table has{" "}
        <code>m + 1</code> rows and <code>n + 1</code> columns.
      </p>
      <CodeBlock lang="js" code={lcsCode} />
      <p>
        Time and memory are both O(m × n). Row <code>i</code> only reads row <code>i-1</code>. So you can keep just two rows and use
        only O(n) memory. The cost is that you can no longer rebuild the string itself.
      </p>

      <h2 id="trace">Traced: filling the LCS table</h2>
      <CodeTrace
        code={traceSrc}
        steps={lcsTrace()}
        caption="A match (line 6) takes the diagonal value and adds 1. A mismatch (line 8) copies the bigger neighbour. The final 3 is the bottom-right corner."
      />

      <h2 id="recover">Recovering the actual string</h2>
      <p>
        The table holds lengths, not letters. To get a real LCS, start at the bottom-right corner and follow the choices backwards.
        If the two characters match, that character is in the answer, and you move diagonally up-left. If they do not match, move
        to the neighbour with the bigger value. You collect the letters from the end of the string to the start, so reverse them
        at the end.
      </p>
      <CodeBlock lang="js" code={lcsRecoverCode} />
      <Callout kind="note" label="Several answers can tie">
        Sometimes the cell above and the cell to the left are equal. Then either direction gives a valid longest subsequence, so
        there can be more than one correct string. Interview questions usually ask only for the length. If they ask for the string,
        any valid one is normally accepted, but say this out loud.
      </Callout>

      <h2 id="edit">Edit distance</h2>
      <p>
        The <strong>edit distance</strong> between two words is the smallest number of one-character changes (insert, delete or replace
        one character) needed to turn the first word into the second. Let <code>dp[i][j]</code> be the cost of turning the first{" "}
        <code>i</code> characters of <code>word1</code> into the first <code>j</code> characters of <code>word2</code>. Each change
        matches one move on the table:
      </p>
      <ul>
        <li>
          <strong>Replace</strong>: swap the last character of word1 for the last character of word2. Then solve the smaller problem:{" "}
          <code>dp[i-1][j-1] + 1</code> (the cell diagonally up-left).
        </li>
        <li>
          <strong>Delete</strong> word1&apos;s last character: <code>dp[i-1][j] + 1</code> (the cell above).
        </li>
        <li>
          <strong>Insert</strong> word2&apos;s last character onto word1: <code>dp[i][j-1] + 1</code> (the cell to the left).
        </li>
        <li>
          If the two last characters are already equal, you need no change. Copy <code>dp[i-1][j-1]</code>.
        </li>
      </ul>
      <p>
        This time the border (the first row and first column) is not zero. Turning <code>i</code> characters into an empty string
        takes <code>i</code> deletions. Building <code>j</code> characters from nothing takes <code>j</code> insertions.
      </p>
      <CodeBlock lang="js" code={editCode} />
      <DryRun
        title={'"horse" to "ros": the full table (row = prefix of horse, column = prefix of ros)'}
        cols={["", "(empty)", "r", "o", "s"]}
        rows={editRows}
        highlight={5}
        note="The last row is the answer row. Its last cell, 3, is the edit distance (horse → rorse → rose → ros: replace h by r, delete r, delete e). The first row (0 1 2 3) and the first column (0 to 5) are the border. They show the cost of building a prefix from nothing, or deleting it completely."
      />

      <h2 id="palin">Longest palindromic subsequence</h2>
      <p>
        A <strong>palindrome</strong> reads the same forwards and backwards, like &ldquo;level&rdquo;. There are two clear ways to find
        the longest palindromic <em>subsequence</em> of <code>s</code>.
      </p>
      <p>
        <strong>Way 1: LCS with the reversed string.</strong> A subsequence that appears in <code>s</code> and also in{" "}
        <code>reverse(s)</code> reads the same both ways. So the LCS of the two strings is the answer. You have nothing new to learn.
      </p>
      <CodeBlock lang="js" code={lpsReverseCode} />
      <p>
        <strong>Way 2: interval DP.</strong> An interval is a slice of the string from position i to position j. Let{" "}
        <code>dp[i][j]</code> be the answer for the slice <code>s[i..j]</code>. If the two ends match, they wrap around the best
        palindrome of the inside, and we add 2. If they do not match, drop one end. We must fill the table from short slices to long
        slices. The code does this by looping bottom-up: <code>dp[i]</code> needs <code>dp[i+1]</code>, so <code>i</code> runs
        downwards.
      </p>
      <CodeBlock lang="js" code={lpsIntervalCode} />
      <p>
        Both take O(n²) time. Interval DP is worth knowing. Many problems that ask for &quot;the best answer for the slice from i to
        j&quot; look like this.
      </p>

      <h2 id="lis">LIS in O(n log n)</h2>
      <p>
        Lesson 55 solved the <strong>longest increasing subsequence</strong> (LIS) with an O(n²) DP. &ldquo;Strictly increasing&rdquo;
        means every number is bigger than the one before it. Here is that slower version again, so we can compare:
      </p>
      <CodeBlock lang="js" code={lisSlowCode} />
      <p>
        The faster method keeps an array called <code>tails</code>. The value <code>tails[k]</code> is the <strong>smallest possible
        last value</strong> of any increasing subsequence with length <code>k + 1</code> that we have seen so far. A smaller last value
        is better, because it is easier to add to. Two facts follow. First, <code>tails</code> is always sorted from small to big, so
        we can use binary search (repeatedly check the middle to find a spot quickly). Second, each new number <code>x</code> has only
        two cases:
      </p>
      <ul>
        <li>
          <code>x</code> is bigger than every tail. It makes the longest subsequence one longer, so add it at the end.
        </li>
        <li>
          Otherwise, find the first tail that is <code>&gt;= x</code> (use binary search) and replace it with <code>x</code>. A
          subsequence of that length can now end on a smaller value.
        </li>
      </ul>
      <CodeBlock lang="js" code={lisFastCode} />
      <DryRun
        title="nums = [10, 9, 2, 5, 3, 7, 101, 18]"
        cols={["x", "tails after it", "What happened"]}
        rows={tailsRows}
        highlight={7}
        note="The length of tails is the answer. Binary search costs O(log n) for each number, so the total is O(n log n). We use >= (find the first tail that is not smaller than x). The subsequence must be strictly increasing, so an equal value must replace a tail and must not extend it."
      />
      <Callout kind="warn" label="tails is NOT the subsequence">
        Only its <em>length</em> is always correct. The values in <code>tails</code> may come from different positions. They do not
        have to form a subsequence of the input. This small example shows it:
      </Callout>
      <CodeBlock lang="js" code={lisTailsCode} />
      <p>
        To rebuild the real subsequence, you would also remember, for each element, which earlier index it extended. Then you walk
        back from the last tail. Questions almost always ask only for the length.
      </p>

      <h2 id="practice">Practice questions</h2>
      <p>
        For each question, say out loud what <code>dp[i][j]</code> (or <code>dp[i]</code>) means before you write any code.
      </p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write the LCS rule from memory. Include what the border row and column hold.</>,
          <>Walk back through an LCS table to get the string. Say why you reverse it at the end.</>,
          <>Match insert, delete and replace to the three neighbouring cells in edit distance.</>,
          <>Explain two ways to find the longest palindromic subsequence.</>,
          <>Explain what <code>tails[k]</code> means in the O(n log n) LIS. Say why tails is not the subsequence.</>,
          <>Say how a subsequence is different from a substring.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        That finishes dynamic programming. <strong>Lesson 58</strong> starts the last part with two small toolkits that interviews
        often use. One is the <strong>trie</strong>, a tree made for working with the starts of words (prefixes). The other is{" "}
        <strong>bit manipulation</strong>, which means small tricks that work on the binary form of numbers (the 0s and 1s a computer
        uses). After that, Lesson 59 shows how to run the interview itself.
      </p>
    </DsaLessonPage>
  );
}
