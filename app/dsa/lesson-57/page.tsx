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
  t.step(2, "start", "table of zeros", `Rows are prefixes of "abcde" (0 to 5 characters), columns are prefixes of "ace" (0 to 3). Row 0 and column 0 stay 0.`, { a, b, dp: snap() }, "dp");
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        t.step(6, "update", `"${a[i - 1]}" = "${b[j - 1]}": dp[${i}][${j}] = ${dp[i][j]}`, `The last characters match, so take the diagonal value dp[${i - 1}][${j - 1}] = ${dp[i - 1][j - 1]} and add 1.`, { i, j, dp: snap() }, "dp");
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        t.step(8, "update", `"${a[i - 1]}" ≠ "${b[j - 1]}": dp[${i}][${j}] = ${dp[i][j]}`, `No match, so keep the better of the cell above (${dp[i - 1][j]}) and the cell to the left (${dp[i][j - 1]}).`, { i, j, dp: snap() }, "dp");
      }
    }
  }
  t.print(dp[m][n]);
  t.step(12, "done", `answer = dp[${m}][${n}] = ${dp[m][n]}`, `The bottom-right cell is the LCS of the whole strings: "ace".`, { dp: snap() }, "dp");
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
  ["10", "[10]", "tails was empty: start a subsequence of length 1"],
  ["9", "[9]", "9 replaces 10: a smaller tail for length 1 is strictly better"],
  ["2", "[2]", "2 replaces 9, same reason"],
  ["5", "[2, 5]", "5 is bigger than every tail: extend, length 2"],
  ["3", "[2, 3]", "3 replaces 5: now length 2 can end at 3"],
  ["7", "[2, 3, 7]", "extend, length 3"],
  ["101", "[2, 3, 7, 101]", "extend, length 4"],
  ["18", "[2, 3, 7, 18]", "18 replaces 101. The answer is the length of tails: 4"],
];

export default function DsaLessonFiftySevenPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="why">Two strings, one table</h2>
      <p>
        Lesson 56 filled two-dimensional tables for grids and knapsack. Strings fit the same mould: when a question compares two
        strings, let <strong>one dimension walk along each string</strong>. The cell <code>dp[i][j]</code> then answers the
        question about the <em>first i characters of the first string</em> and the <em>first j characters of the second</em>. Each
        cell is worked out from its neighbours above, to the left and diagonally up-left, exactly like the grid paths you already know.
      </p>
      <p>
        One piece of vocabulary matters here. A <strong>subsequence</strong> keeps characters in their original order but may skip
        some: <code>&quot;ace&quot;</code> is a subsequence of <code>&quot;abcde&quot;</code>. A <strong>substring</strong> must be
        contiguous (no gaps): <code>&quot;bcd&quot;</code> is a substring, <code>&quot;ace&quot;</code> is not. Read the
        question twice for which one it asks about, because the techniques differ.
      </p>

      <h2 id="lcs">Longest common subsequence</h2>
      <p>
        The <strong>longest common subsequence</strong> (LCS) of two strings is the longest sequence of characters that appears, in
        order, in both. For <code>&quot;abcde&quot;</code> and <code>&quot;ace&quot;</code> it is <code>&quot;ace&quot;</code>, length 3.
      </p>
      <p>
        Define <code>dp[i][j]</code> as the LCS length of <code>a[0..i)</code> and <code>b[0..j)</code> (the first i and first j
        characters). Look only at the last character of each prefix:
      </p>
      <ul>
        <li>
          If <code>a[i-1] === b[j-1]</code>, matching them is never a mistake, so <code>dp[i][j] = dp[i-1][j-1] + 1</code>.
        </li>
        <li>
          Otherwise at least one of the two last characters is not used, so the answer is the better of dropping a&apos;s last
          character (<code>dp[i-1][j]</code>) or b&apos;s (<code>dp[i][j-1]</code>).
        </li>
      </ul>
      <p>
        A row and a column of zeros for the empty prefixes makes the indexing clean: that is why the table has{" "}
        <code>m + 1</code> rows and <code>n + 1</code> columns.
      </p>
      <CodeBlock lang="js" code={lcsCode} />
      <p>
        Time and space are O(m × n). Because row <code>i</code> only reads row <code>i-1</code>, you can keep just two rows and
        reduce space to O(n), at the price of no longer being able to recover the string.
      </p>

      <h2 id="trace">Traced: filling the LCS table</h2>
      <CodeTrace
        code={traceSrc}
        steps={lcsTrace()}
        caption="Matches (line 6) climb diagonally; mismatches (line 8) copy the better neighbour. The final 3 is the bottom-right corner."
      />

      <h2 id="recover">Recovering the actual string</h2>
      <p>
        The table holds lengths, not letters. To get an actual LCS, start at the bottom-right corner and retrace the decisions: if the
        two characters match, that character is in the answer and you step diagonally; otherwise step toward the neighbour
        that supplied the larger value. You collect the letters from the end, so reverse them at the end.
      </p>
      <CodeBlock lang="js" code={lcsRecoverCode} />
      <Callout kind="note" label="Several answers can tie">
        When the cell above and the cell to the left are equal, either direction leads to a valid longest subsequence, so there may be
        more than one correct string. Interview questions usually ask only for the length; if they ask for the string, any valid
        one is normally accepted, but say so out loud.
      </Callout>

      <h2 id="edit">Edit distance</h2>
      <p>
        The <strong>edit distance</strong> between two words is the fewest single-character operations (insert, delete or replace
        one character) needed to turn the first into the second. Let <code>dp[i][j]</code> be the cost of turning the first{" "}
        <code>i</code> characters of <code>word1</code> into the first <code>j</code> characters of <code>word2</code>. Every
        operation corresponds to a move on the table:
      </p>
      <ul>
        <li>
          <strong>Replace</strong>: fix the last characters by swapping one for the other, then solve the smaller problem:{" "}
          <code>dp[i-1][j-1] + 1</code> (the diagonal neighbour).
        </li>
        <li>
          <strong>Delete</strong> word1&apos;s last character: <code>dp[i-1][j] + 1</code> (the cell above).
        </li>
        <li>
          <strong>Insert</strong> word2&apos;s last character onto word1: <code>dp[i][j-1] + 1</code> (the cell to the left).
        </li>
        <li>
          If the two last characters are already equal, no operation is needed: copy <code>dp[i-1][j-1]</code>.
        </li>
      </ul>
      <p>
        The border is not zero this time: turning <code>i</code> characters into an empty string takes <code>i</code> deletions, and
        building <code>j</code> characters from nothing takes <code>j</code> insertions.
      </p>
      <CodeBlock lang="js" code={editCode} />
      <DryRun
        title={'"horse" to "ros": the full table (row = prefix of horse, column = prefix of ros)'}
        cols={["", "(empty)", "r", "o", "s"]}
        rows={editRows}
        highlight={5}
        note="The last row is the answer row; its last cell, 3, is the edit distance (horse → rorse → rose → ros: replace h by r, delete r, delete e). The first row (0 1 2 3) and first column (0 to 5) are the border: the cost of building or deleting a prefix outright."
      />

      <h2 id="palin">Longest palindromic subsequence</h2>
      <p>
        A <strong>palindrome</strong> reads the same in both directions. There are two clean ways to find the longest palindromic{" "}
        <em>subsequence</em> of <code>s</code>.
      </p>
      <p>
        <strong>Way 1: LCS with the reverse.</strong> A subsequence that appears in <code>s</code> and also in{" "}
        <code>reverse(s)</code> reads the same both ways, so the LCS of the two is the answer. You have nothing new to learn.
      </p>
      <CodeBlock lang="js" code={lpsReverseCode} />
      <p>
        <strong>Way 2: interval DP.</strong> Let <code>dp[i][j]</code> be the answer for the slice <code>s[i..j]</code>. If the ends
        match they wrap the best palindrome of the inside, adding 2; otherwise drop one end. The table is filled by{" "}
        <em>increasing slice length</em>, which is what the bottom-up row order below achieves: <code>dp[i]</code> needs{" "}
        <code>dp[i+1]</code>, so <code>i</code> runs downward.
      </p>
      <CodeBlock lang="js" code={lpsIntervalCode} />
      <p>
        Both are O(n²). Interval DP is worth recognising because many problems of the form &quot;best answer for the slice from i to
        j&quot; have this shape.
      </p>

      <h2 id="lis">LIS in O(n log n)</h2>
      <p>
        Lesson 55 solved the <strong>longest increasing subsequence</strong> (LIS, strictly increasing) with O(n²) DP. Here is that
        version again as a baseline:
      </p>
      <CodeBlock lang="js" code={lisSlowCode} />
      <p>
        The faster method keeps an array <code>tails</code>, where <code>tails[k]</code> is the <strong>smallest possible last
        value</strong> of any increasing subsequence of length <code>k + 1</code> seen so far. Smaller is better, since a small tail
        is easier to extend. Two facts follow: <code>tails</code> is always sorted increasing, so we can use binary search, and for each
        new number <code>x</code> there are only two cases:
      </p>
      <ul>
        <li>
          <code>x</code> is bigger than every tail: it extends the longest subsequence, so append it.
        </li>
        <li>
          Otherwise find the first tail that is <code>&gt;= x</code> (binary search) and overwrite it with <code>x</code>: a
          subsequence of that length can now end on a smaller value.
        </li>
      </ul>
      <CodeBlock lang="js" code={lisFastCode} />
      <DryRun
        title="nums = [10, 9, 2, 5, 3, 7, 101, 18]"
        cols={["x", "tails after it", "What happened"]}
        rows={tailsRows}
        highlight={7}
        note="The length of tails is the answer. Binary search costs O(log n) per number, so O(n log n) in total. We use >= (find the first tail not smaller than x) because the subsequence must be strictly increasing: an equal value must replace, not extend."
      />
      <Callout kind="warn" label="tails is NOT the subsequence">
        Only its <em>length</em> is guaranteed correct. The values in <code>tails</code> may come from different positions and need not
        form a subsequence of the input, as this tiny example shows:
      </Callout>
      <CodeBlock lang="js" code={lisTailsCode} />
      <p>
        To rebuild the actual subsequence you would also remember, for each element, the index it extended, and walk back from the last
        tail. Questions almost always ask only for the length.
      </p>

      <h2 id="practice">Practice questions</h2>
      <p>
        For each one, say aloud what <code>dp[i][j]</code> (or <code>dp[i]</code>) means before you write a line of code.
      </p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write the LCS recurrence from memory, including what the border rows hold.</>,
          <>Walk back through an LCS table to produce the string, and say why you reverse at the end.</>,
          <>Map insert, delete and replace to the three neighbouring cells in edit distance.</>,
          <>Explain two ways to get the longest palindromic subsequence.</>,
          <>Explain what <code>tails[k]</code> means in the O(n log n) LIS, and why tails is not the subsequence.</>,
          <>Say the difference between a subsequence and a substring.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        That finishes dynamic programming. <strong>Lesson 58</strong> opens the last part with two compact toolkits that interviews
        love: the <strong>trie</strong>, a tree built for prefixes, and <strong>bit manipulation</strong>, small tricks that work on
        the binary form of numbers. After that, Lesson 59 shows how to run the interview itself.
      </p>
    </DsaLessonPage>
  );
}
