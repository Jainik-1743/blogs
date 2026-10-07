import Problem from "@/components/dsa/Problem";

/** Lesson 57 practice questions: DP on strings. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Longest common subsequence"
        level="Medium"
        examples={[
          { input: 'text1 = "abcde", text2 = "ace"', output: "3", why: 'The longest common subsequence is "ace".' },
          { input: 'text1 = "abc", text2 = "abc"', output: "3", why: "The strings are identical." },
          { input: 'text1 = "abc", text2 = "def"', output: "0", why: "No character is shared." },
        ]}
        hints={[
          <>Let <code>dp[i][j]</code> be the answer for the first i characters of one string and the first j of the other.</>,
          <>Look at the last characters of the two prefixes. What if they are equal? What if they differ?</>,
          <>Equal: 1 + the answer without both. Different: the better of dropping one or the other.</>,
        ]}
        approaches={[
          {
            name: "Top-down recursion with memoisation",
            idea: <p>Define <code>solve(i, j)</code> on the first i and j characters and cache each pair. Without the cache the recursion branches twice at every mismatch and is exponential.</p>,
            code: `function longestCommonSubsequence(text1, text2) {
  const memo = new Map();
  function solve(i, j) {
    if (i === 0 || j === 0) return 0;
    const key = i * 1001 + j;
    if (memo.has(key)) return memo.get(key);
    const result = text1[i - 1] === text2[j - 1]
      ? solve(i - 1, j - 1) + 1
      : Math.max(solve(i - 1, j), solve(i, j - 1));
    memo.set(key, result);
    return result;
  }
  return solve(text1.length, text2.length);
}

console.log(longestCommonSubsequence("abcde", "ace")); // 3
console.log(longestCommonSubsequence("abc", "abc"));   // 3
console.log(longestCommonSubsequence("abc", "def"));   // 0`,
            explain: <p>There are m × n distinct pairs and each is computed once, so O(m × n) time and space. The recursion depth can reach m + n, which is fine for the usual limit of 1000 characters each.</p>,
          },
          {
            name: "Bottom-up table",
            idea: <p>Fill an (m+1) × (n+1) table row by row, with zeros for the empty prefixes.</p>,
            code: `function longestCommonSubsequence(text1, text2) {
  const m = text1.length, n = text2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = text1[i - 1] === text2[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

console.log(longestCommonSubsequence("abcde", "ace")); // 3
console.log(longestCommonSubsequence("abc", "abc"));   // 3
console.log(longestCommonSubsequence("abc", "def"));   // 0`,
            explain: <p>The same O(m × n) with no recursion, and the table is what you walk back through if asked for the string itself.</p>,
          },
          {
            name: "Two rows only",
            idea: <p>Row i reads only row i-1 and the cell to its own left, so keep a <code>prev</code> and a <code>curr</code> row and swap them.</p>,
            code: `function longestCommonSubsequence(text1, text2) {
  const n = text2.length;
  let prev = new Array(n + 1).fill(0);
  for (let i = 1; i <= text1.length; i++) {
    const curr = new Array(n + 1).fill(0);
    for (let j = 1; j <= n; j++) {
      curr[j] = text1[i - 1] === text2[j - 1]
        ? prev[j - 1] + 1
        : Math.max(prev[j], curr[j - 1]);
    }
    prev = curr;
  }
  return prev[n];
}

console.log(longestCommonSubsequence("abcde", "ace")); // 3
console.log(longestCommonSubsequence("abc", "abc"));   // 3
console.log(longestCommonSubsequence("abc", "def"));   // 0`,
            explain: <p>Time is still O(m × n) but space drops to O(n). For the best saving make the second string the shorter one.</p>,
          },
        ]}
        compare={<p>Start with the table: it is the version everybody expects, and the other two are tweaks of it. Mention the two-row optimisation if space comes up. (LeetCode 1143.)</p>}
      >
        <p>
          Given two strings <code>text1</code> and <code>text2</code>, return the length of their longest common subsequence, or 0 if
          there is none. A subsequence keeps the original order but may skip characters.
        </p>
      </Problem>

      <Problem
        n={2}
        title="Edit distance"
        level="Medium"
        examples={[
          { input: 'word1 = "horse", word2 = "ros"', output: "3", why: "horse → rorse (replace h with r) → rose (delete r) → ros (delete e)." },
          { input: 'word1 = "intention", word2 = "execution"', output: "5", why: "Delete t, replace i with e, replace n with x, replace n with c, insert u." },
        ]}
        hints={[
          <><code>dp[i][j]</code> = fewest edits to turn the first i characters of word1 into the first j of word2.</>,
          <>If the last characters match, nothing is spent on them. If not, you have three choices of operation.</>,
          <>What do an empty prefix and a non-empty one cost? Those are your border values.</>,
        ]}
        approaches={[
          {
            name: "Top-down recursion with memoisation",
            idea: <p>Compare the last characters of the two prefixes. If equal, drop both for free; otherwise try replace, delete and insert, and take 1 + the cheapest. Cache every (i, j).</p>,
            code: `function minDistance(word1, word2) {
  const memo = new Map();
  function solve(i, j) {
    if (i === 0) return j;                  // build j characters from nothing: j insertions
    if (j === 0) return i;                  // remove i characters: i deletions
    const key = i * 1001 + j;
    if (memo.has(key)) return memo.get(key);
    let result;
    if (word1[i - 1] === word2[j - 1]) {
      result = solve(i - 1, j - 1);
    } else {
      result = 1 + Math.min(solve(i - 1, j - 1), solve(i - 1, j), solve(i, j - 1));
    }
    memo.set(key, result);
    return result;
  }
  return solve(word1.length, word2.length);
}

console.log(minDistance("horse", "ros"));           // 3
console.log(minDistance("intention", "execution")); // 5
console.log(minDistance("", "a"));                  // 1`,
            explain: <p>Without the memo each mismatch branches three ways, which is exponential. With it, there are m × n states of O(1) work each.</p>,
          },
          {
            name: "Bottom-up table",
            idea: <p>Fill the table with the border 0..m down the first column and 0..n along the first row, then each cell from its left, upper and diagonal neighbours.</p>,
            code: `function minDistance(word1, word2) {
  const m = word1.length, n = word2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

console.log(minDistance("horse", "ros"));           // 3
console.log(minDistance("intention", "execution")); // 5
console.log(minDistance("", "a"));                  // 1`,
            explain: <p>O(m × n) time and space. The diagonal move is replace, the upward move is delete, the leftward move is insert.</p>,
          },
          {
            name: "Two rows",
            idea: <p>Each row needs only the row above, so keep two arrays. The first cell of row i is i (all deletions).</p>,
            code: `function minDistance(word1, word2) {
  const n = word2.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= word1.length; i++) {
    const curr = new Array(n + 1);
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      curr[j] = word1[i - 1] === word2[j - 1]
        ? prev[j - 1]
        : 1 + Math.min(prev[j - 1], prev[j], curr[j - 1]);
    }
    prev = curr;
  }
  return prev[n];
}

console.log(minDistance("horse", "ros"));           // 3
console.log(minDistance("intention", "execution")); // 5
console.log(minDistance("", "a"));                  // 1`,
            explain: <p>The same O(m × n) time with O(n) space.</p>,
          },
        ]}
        compare={<p>The full table is the clearest to explain because you can point at the three neighbours and name the operation each one stands for. Offer the two-row version as the space improvement. (LeetCode 72.)</p>}
      >
        <p>
          Given two strings <code>word1</code> and <code>word2</code>, return the minimum number of operations to convert{" "}
          <code>word1</code> into <code>word2</code>. The allowed operations are insert a character, delete a character and replace a
          character.
        </p>
      </Problem>

      <Problem
        n={3}
        title="Longest palindromic subsequence"
        level="Medium"
        examples={[
          { input: 's = "bbbab"', output: "4", why: 'One longest palindromic subsequence is "bbbb".' },
          { input: 's = "cbbd"', output: "2", why: 'One longest palindromic subsequence is "bb".' },
        ]}
        hints={[
          <>A palindrome is its own reverse. What known problem compares a string with another string?</>,
          <>Or try the slice <code>s[i..j]</code>: what do the two end characters tell you if they are equal? If they differ?</>,
        ]}
        approaches={[
          {
            name: "LCS of the string and its reverse",
            idea: <p>A subsequence of s that is also a subsequence of reverse(s) reads the same in both directions, so run the LCS table on the two strings.</p>,
            code: `function longestPalindromeSubseq(s) {
  const t = s.split("").reverse().join("");
  const n = s.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = s[i - 1] === t[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[n][n];
}

console.log(longestPalindromeSubseq("bbbab")); // 4
console.log(longestPalindromeSubseq("cbbd"));  // 2
console.log(longestPalindromeSubseq("a"));     // 1`,
            explain: <p>O(n²) time and space. It reuses the previous problem and is hard to get wrong, which makes it a good first answer under pressure.</p>,
          },
          {
            name: "Interval DP",
            idea: <p><code>dp[i][j]</code> is the answer for <code>s[i..j]</code>. Equal ends add 2 to the answer for the inside; unequal ends drop one end. Loop <code>i</code> downward so <code>dp[i+1]</code> is ready.</p>,
            code: `function longestPalindromeSubseq(s) {
  const n = s.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    dp[i][i] = 1;
    for (let j = i + 1; j < n; j++) {
      if (s[i] === s[j]) dp[i][j] = dp[i + 1][j - 1] + 2;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
    }
  }
  return dp[0][n - 1];
}

console.log(longestPalindromeSubseq("bbbab")); // 4
console.log(longestPalindromeSubseq("cbbd"));  // 2
console.log(longestPalindromeSubseq("a"));     // 1`,
            explain: <p>When j = i + 1 and the characters match, <code>dp[i+1][j-1]</code> is <code>dp[i+1][i]</code>, an empty slice, which is still 0 because the table was filled with zeros. O(n²) time and space.</p>,
          },
        ]}
        compare={<p>Both are O(n²). The reverse trick is quicker to write; the interval version shows you recognise a pattern that reappears in many other problems. (LeetCode 516.)</p>}
      >
        <p>
          Given a string <code>s</code>, return the length of its longest palindromic <em>subsequence</em> (characters in order, gaps
          allowed).
        </p>
      </Problem>

      <Problem
        n={4}
        title="Longest increasing subsequence in O(n log n)"
        level="Medium"
        examples={[
          { input: "nums = [10,9,2,5,3,7,101,18]", output: "4", why: "One longest increasing subsequence is [2, 3, 7, 18]." },
          { input: "nums = [0,1,0,3,2,3]", output: "4", why: "For example [0, 1, 2, 3]." },
          { input: "nums = [7,7,7,7]", output: "1", why: "The subsequence must be strictly increasing, so equal values do not count." },
        ]}
        hints={[
          <>The O(n²) DP asks, for each element, which earlier smaller element to extend. Can you make that choice faster?</>,
          <>Keep <code>tails[k]</code>: the smallest last value of any increasing subsequence of length k + 1. Is that array sorted?</>,
          <>For a new number, binary search the first tail that is <code>&gt;=</code> it and overwrite that slot (or append).</>,
        ]}
        approaches={[
          {
            name: "DP in O(n²)",
            idea: <p><code>best[i]</code> is the longest increasing subsequence ending at index i: 1 plus the best of all earlier smaller values.</p>,
            code: `function lengthOfLIS(nums) {
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

console.log(lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18])); // 4
console.log(lengthOfLIS([0, 1, 0, 3, 2, 3]));            // 4
console.log(lengthOfLIS([7, 7, 7, 7]));                  // 1`,
            explain: <p>Two nested loops over n elements give O(n²) time and O(n) space. Fine for n up to a couple of thousand, too slow beyond that.</p>,
          },
          {
            name: "Tails array with binary search",
            idea: <p>Keep a sorted <code>tails</code>. For each number, binary search for the first tail that is at least as large and replace it; if none is, append. The final length is the answer.</p>,
            code: `function lengthOfLIS(nums) {
  const tails = [];
  for (const x of nums) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = x;
  }
  return tails.length;
}

console.log(lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18])); // 4
console.log(lengthOfLIS([0, 1, 0, 3, 2, 3]));            // 4
console.log(lengthOfLIS([7, 7, 7, 7]));                  // 1`,
            explain: <p>Replacing a tail never changes how long the subsequences are, it only makes it easier to extend them later. Each number costs one O(log n) binary search, so O(n log n) time and O(n) space. Remember <code>tails</code> is not itself a valid subsequence; only its length is the answer.</p>,
          },
        ]}
        compare={<p>Give the O(n²) DP first if you are unsure, then offer the tails method as the optimisation. If the interviewer asks for the subsequence itself, the quadratic DP with parent pointers is simpler to explain. (LeetCode 300.)</p>}
      >
        <p>
          Given an integer array <code>nums</code>, return the length of the longest strictly increasing subsequence. Aim for O(n log n).
        </p>
      </Problem>

      <Problem
        n={5}
        title="Delete operation for two strings"
        level="Medium"
        examples={[
          { input: 'word1 = "sea", word2 = "eat"', output: "2", why: 'Delete "s" from "sea" and "t" from "eat"; both become "ea".' },
          { input: 'word1 = "leetcode", word2 = "etco"', output: "4", why: 'The common subsequence "etco" has length 4, so delete the other 4 characters of "leetcode" and nothing from "etco".' },
        ]}
        hints={[
          <>Only deletions are allowed. What is left in each string when you finish? It must be the same string, and it is a subsequence of both.</>,
          <>To delete as little as possible, keep as much as possible. Which problem is that?</>,
        ]}
        approaches={[
          {
            name: "Through the LCS length",
            idea: <p>Whatever survives must be a common subsequence. Keep the longest one, delete everything else from both strings: <code>m + n - 2 × LCS</code>.</p>,
            code: `function minDistance(word1, word2) {
  const m = word1.length, n = word2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = word1[i - 1] === word2[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return m + n - 2 * dp[m][n];
}

console.log(minDistance("sea", "eat"));          // 2
console.log(minDistance("leetcode", "etco"));    // 4
console.log(minDistance("abc", "abc"));          // 0`,
            explain: <p>O(m × n) time and space. Each deleted character is in one of the strings but not in the kept subsequence, so the total deletions are (m - L) + (n - L).</p>,
          },
          {
            name: "Direct DP on deletions",
            idea: <p>Same table shape as edit distance, but only deletions: a match is free, a mismatch costs one deletion from either side. Borders are i and j.</p>,
            code: `function minDistance(word1, word2) {
  const m = word1.length, n = word2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

console.log(minDistance("sea", "eat"));          // 2
console.log(minDistance("leetcode", "etco"));    // 4
console.log(minDistance("abc", "abc"));          // 0`,
            explain: <p>This is edit distance without the replace move. It gives the same answers as the LCS formula, in the same O(m × n).</p>,
          },
        ]}
        compare={<p>The LCS formula is one line once you spot it, and spotting it is the point of the question. The direct DP is a good fallback if the link does not come to you. (LeetCode 583.)</p>}
      >
        <p>
          Given two strings <code>word1</code> and <code>word2</code>, return the minimum number of single-character deletions (from
          either string) needed to make them equal.
        </p>
      </Problem>

      <Problem
        n={6}
        title="Longest palindromic substring"
        level="Medium"
        examples={[
          { input: 's = "babad"', output: '"bab"', why: '"aba" is also a valid answer.' },
          { input: 's = "cbbd"', output: '"bb"', why: "The longest palindrome is the even-length run in the middle." },
        ]}
        hints={[
          <>This time the characters must be contiguous. Every palindrome has a centre.</>,
          <>From each possible centre, grow outward while the two sides match. How many centres are there (think of even-length palindromes too)?</>,
          <>Alternatively, <code>dp[i][j]</code> = &quot;is <code>s[i..j]</code> a palindrome?&quot; depends on the ends and on <code>dp[i+1][j-1]</code>.</>,
        ]}
        approaches={[
          {
            name: "Brute force: check every substring",
            idea: <p>Try all start and end pairs, test each for being a palindrome, keep the longest.</p>,
            code: `function longestPalindrome(s) {
  let best = "";
  for (let i = 0; i < s.length; i++) {
    for (let j = i; j < s.length; j++) {
      if (j - i + 1 <= best.length) continue;
      let l = i, r = j, ok = true;
      while (l < r) {
        if (s[l++] !== s[r--]) { ok = false; break; }
      }
      if (ok) best = s.slice(i, j + 1);
    }
  }
  return best;
}

console.log(longestPalindrome("babad")); // bab
console.log(longestPalindrome("cbbd"));  // bb`,
            explain: <p>There are O(n²) substrings and each check costs O(n): O(n³) in total. Mention it to show you have a baseline, then improve.</p>,
          },
          {
            name: "Expand around each centre",
            idea: <p>A palindrome mirrors around its centre: one character for odd length, or the gap between two characters for even length. That is 2n - 1 centres. Grow outward from each while both sides match.</p>,
            code: `function longestPalindrome(s) {
  let start = 0, bestLen = 0;
  function expand(l, r) {
    while (l >= 0 && r < s.length && s[l] === s[r]) { l--; r++; }
    const len = r - l - 1;                    // the loop overshot by one on each side
    if (len > bestLen) { bestLen = len; start = l + 1; }
  }
  for (let i = 0; i < s.length; i++) {
    expand(i, i);                             // odd length, centre at i
    expand(i, i + 1);                         // even length, centre between i and i + 1
  }
  return s.slice(start, start + bestLen);
}

console.log(longestPalindrome("babad")); // bab
console.log(longestPalindrome("cbbd"));  // bb
console.log(longestPalindrome("a"));     // a`,
            explain: <p>Each expansion is O(n) in the worst case (a string like &quot;aaaa…&quot;), and there are 2n - 1 of them, so O(n²) time and O(1) extra space.</p>,
          },
          {
            name: "DP table",
            idea: <p><code>isPal[i][j]</code> is true when <code>s[i] === s[j]</code> and the inside <code>s[i+1..j-1]</code> is a palindrome (or has at most one character). Fill from the bottom row upward.</p>,
            code: `function longestPalindrome(s) {
  const n = s.length;
  const isPal = Array.from({ length: n }, () => new Array(n).fill(false));
  let start = 0, bestLen = 1;
  for (let i = n - 1; i >= 0; i--) {
    for (let j = i; j < n; j++) {
      if (s[i] === s[j] && (j - i < 2 || isPal[i + 1][j - 1])) {
        isPal[i][j] = true;
        if (j - i + 1 > bestLen) { bestLen = j - i + 1; start = i; }
      }
    }
  }
  return s.slice(start, start + bestLen);
}

console.log(longestPalindrome("babad")); // aba   ("bab" is equally valid)
console.log(longestPalindrome("cbbd"));  // bb
console.log(longestPalindrome("a"));     // a`,
            explain: <p>O(n²) time and O(n²) space. It is the DP an interviewer may expect, but it uses more memory than expanding around centres for the same time.</p>,
          },
        ]}
        compare={<p>Prefer expanding around centres: O(n²) time, O(1) space and short. Know the DP version because it generalises. (Manacher&apos;s algorithm reaches O(n) but is rarely expected.) (LeetCode 5.)</p>}
      >
        <p>
          Given a string <code>s</code>, return its longest palindromic <em>substring</em> (contiguous). If several have the same
          length, any is accepted.
        </p>
      </Problem>

      <Problem
        n={7}
        title="Palindromic substrings"
        level="Medium"
        examples={[
          { input: 's = "abc"', output: "3", why: 'Only the single letters "a", "b", "c" are palindromes.' },
          { input: 's = "aaa"', output: "6", why: '"a" three times, "aa" twice and "aaa" once. Substrings at different positions count separately.' },
        ]}
        hints={[
          <>Same centres as the longest palindromic substring, but now count every expansion step that still matches.</>,
          <>Each successful step of an expansion is one more palindrome.</>,
        ]}
        approaches={[
          {
            name: "Expand around each centre",
            idea: <p>For every odd and even centre, grow outward and add one to the count each time the two sides match.</p>,
            code: `function countSubstrings(s) {
  let count = 0;
  function expand(l, r) {
    while (l >= 0 && r < s.length && s[l] === s[r]) {
      count++;                                // s[l..r] is a palindrome
      l--; r++;
    }
  }
  for (let i = 0; i < s.length; i++) {
    expand(i, i);
    expand(i, i + 1);
  }
  return count;
}

console.log(countSubstrings("abc")); // 3
console.log(countSubstrings("aaa")); // 6`,
            explain: <p>Every palindromic substring has exactly one centre, so each is counted exactly once. O(n²) time, O(1) space.</p>,
          },
          {
            name: "DP table",
            idea: <p>Use the same <code>isPal[i][j]</code> table as before and count the true cells.</p>,
            code: `function countSubstrings(s) {
  const n = s.length;
  const isPal = Array.from({ length: n }, () => new Array(n).fill(false));
  let count = 0;
  for (let i = n - 1; i >= 0; i--) {
    for (let j = i; j < n; j++) {
      if (s[i] === s[j] && (j - i < 2 || isPal[i + 1][j - 1])) {
        isPal[i][j] = true;
        count++;
      }
    }
  }
  return count;
}

console.log(countSubstrings("abc")); // 3
console.log(countSubstrings("aaa")); // 6`,
            explain: <p>O(n²) time and O(n²) space; each cell decides one substring.</p>,
          },
        ]}
        compare={<p>Expanding around centres wins on memory and is shorter. This question is the counting twin of LeetCode 5, so solving one gives you the other. (LeetCode 647.)</p>}
      >
        <p>
          Given a string <code>s</code>, return the number of palindromic substrings in it. Substrings with different start or end
          positions count separately, even if their text is the same.
        </p>
      </Problem>
    </>
  );
}
