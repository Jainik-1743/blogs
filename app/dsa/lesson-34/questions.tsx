import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";

/** Lesson 34 practice questions: backtracking. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Combination sum"
        level="Medium"
        examples={[
          { input: "candidates = [2, 3, 6, 7], target = 7", output: "[[2, 2, 3], [7]]", why: "2 + 2 + 3 = 7 and 7 = 7. Numbers may be reused." },
          { input: "candidates = [2, 3, 5], target = 8", output: "[[2,2,2,2],[2,3,3],[3,5]]", why: "Three combinations." },
          { input: "candidates = [2], target = 1", output: "[]", why: "No combination." },
        ]}
        hints={[
          <>State: the path and the amount still needed. Complete when it is exactly 0.</>,
          <>Reuse is allowed, so recurse with the same index. Looking only forward avoids [2, 3] and [3, 2] both appearing.</>,
          <>Sort and <code>break</code> as soon as a candidate exceeds what remains.</>,
        ]}
        approaches={[
          {
            name: "Backtracking with pruning",
            idea: <p>The traced algorithm: choose a candidate, recurse on the reduced target, undo.</p>,
            code: `function combinationSum(candidates, target) {
  candidates = [...candidates].sort((a, b) => a - b);
  const out = [], path = [];
  function go(start, remaining) {
    if (remaining === 0) { out.push([...path]); return; }
    for (let i = start; i < candidates.length; i++) {
      if (candidates[i] > remaining) break;
      path.push(candidates[i]);
      go(i, remaining - candidates[i]);
      path.pop();
    }
  }
  go(0, target);
  return out;
}

console.log(JSON.stringify(combinationSum([2, 3, 6, 7], 7))); // [[2,2,3],[7]]
console.log(JSON.stringify(combinationSum([2, 3, 5], 8)));    // [[2,2,2,2],[2,3,3],[3,5]]
console.log(JSON.stringify(combinationSum([2], 1)));          // []`,
            explain: <p>The number of combinations can be exponential, so there is no better worst case; pruning keeps it fast in practice.</p>,
          },
        ]}
        compare={<p>(LeetCode 39.)</p>}
      >
        <p>Given distinct positive integers and a target, return all unique combinations that sum to the target. The same number may be used an unlimited number of times.</p>
      </Problem>

      <Problem
        n={2}
        title="Combination sum II"
        level="Medium"
        examples={[
          { input: "candidates = [10, 1, 2, 7, 6, 1, 5], target = 8", output: "[[1,1,6],[1,2,5],[1,7],[2,6]]", why: "Each number is used at most once, and the two 1s are different elements but must not produce duplicate combinations." },
          { input: "candidates = [2, 5, 2, 1, 2], target = 5", output: "[[1,2,2],[5]]", why: "Only distinct combinations." },
        ]}
        hints={[
          <>Each element can be used once: recurse with <code>i + 1</code>.</>,
          <>Duplicates in the input: sort, and skip a value equal to the previous at the same level (Lesson 33, Subsets II).</>,
        ]}
        approaches={[
          {
            name: "Sort, skip duplicates at each level, no reuse",
            idea: <p>Combine the two ideas: <code>i + 1</code> for the recursion and <code>i &gt; start &amp;&amp; same as previous → continue</code>.</p>,
            code: `function combinationSum2(candidates, target) {
  candidates = [...candidates].sort((a, b) => a - b);
  const out = [], path = [];
  function go(start, remaining) {
    if (remaining === 0) { out.push([...path]); return; }
    for (let i = start; i < candidates.length; i++) {
      if (candidates[i] > remaining) break;
      if (i > start && candidates[i] === candidates[i - 1]) continue;
      path.push(candidates[i]);
      go(i + 1, remaining - candidates[i]);
      path.pop();
    }
  }
  go(0, target);
  return out;
}

console.log(JSON.stringify(combinationSum2([10, 1, 2, 7, 6, 1, 5], 8))); // [[1,1,6],[1,2,5],[1,7],[2,6]]
console.log(JSON.stringify(combinationSum2([2, 5, 2, 1, 2], 5)));        // [[1,2,2],[5]]`,
            explain: <p>Without the skip line you would produce [1, 2, 5] twice (using either 1). Sorting also enables the early <code>break</code>.</p>,
          },
        ]}
        compare={<p>(LeetCode 40.)</p>}
      >
        <p>Given candidates that may contain duplicates and a target, return all unique combinations summing to the target. Each element may be used at most once.</p>
      </Problem>

      <Problem
        n={3}
        title="Palindrome partitioning"
        level="Medium"
        examples={[
          { input: 's = "aab"', output: '[["a","a","b"],["aa","b"]]', why: "Every piece is a palindrome." },
          { input: 's = "a"', output: '[["a"]]', why: "One piece." },
        ]}
        hints={[
          <>At each start position, the choice is the end of the next piece.</>,
          <>Only choose a piece that is a palindrome. When the start reaches the end of the string, save the path.</>,
        ]}
        approaches={[
          {
            name: "Backtrack with a palindrome check",
            idea: <p>Try every end for the current start; skip non-palindromes; recurse from end + 1.</p>,
            code: `function partition(s) {
  const out = [], path = [];
  const isPal = (l, r) => {
    while (l < r) if (s[l++] !== s[r--]) return false;
    return true;
  };
  function go(start) {
    if (start === s.length) { out.push([...path]); return; }
    for (let end = start; end < s.length; end++) {
      if (!isPal(start, end)) continue;
      path.push(s.slice(start, end + 1));
      go(end + 1);
      path.pop();
    }
  }
  go(0);
  return out;
}

console.log(JSON.stringify(partition("aab"))); // [["a","a","b"],["aa","b"]]
console.log(JSON.stringify(partition("a")));   // [["a"]]
console.log(partition("aaa").length);          // 4`,
            explain: <p>Worst case O(n · 2<sup>n</sup>) (a string of one repeated letter has every cut valid). The palindrome check is O(n) per piece.</p>,
          },
          {
            name: "Precompute palindromes",
            idea: <p>Build a table <code>pal[i][j]</code> once with dynamic programming, so each check is O(1).</p>,
            code: `function partition(s) {
  const n = s.length;
  const pal = Array.from({ length: n }, () => new Array(n).fill(false));
  for (let i = n - 1; i >= 0; i--)
    for (let j = i; j < n; j++)
      pal[i][j] = s[i] === s[j] && (j - i < 2 || pal[i + 1][j - 1]);   // ends match and the inside is a palindrome

  const out = [], path = [];
  function go(start) {
    if (start === n) { out.push([...path]); return; }
    for (let end = start; end < n; end++) {
      if (!pal[start][end]) continue;
      path.push(s.slice(start, end + 1));
      go(end + 1);
      path.pop();
    }
  }
  go(0);
  return out;
}

console.log(JSON.stringify(partition("aab"))); // [["a","a","b"],["aa","b"]]
console.log(partition("aaaa").length);         // 8`,
            explain: <p>The table costs O(n²) to build, then every check is O(1). A first taste of dynamic programming.</p>,
          },
        ]}
        compare={<p>Start with the first; mention the table as an optimisation. (LeetCode 131.)</p>}
      >
        <p>Partition a string so that every substring is a palindrome. Return all possible partitions.</p>
      </Problem>

      <Problem
        n={4}
        title="Word search"
        level="Medium"
        examples={[
          { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', output: "true", why: "A → B → C → C → E → D along the grid." },
          { input: 'same board, word = "SEE"', output: "true", why: "S → E → E." },
          { input: 'same board, word = "ABCB"', output: "false", why: "The B would have to be reused." },
        ]}
        hints={[
          <>Start a search from every cell. From a cell, try to match the next letter up, down, left and right.</>,
          <>A cell cannot be reused in one path: mark it as used, and restore it when the search leaves.</>,
          <>Stop a path immediately on out-of-bounds, a used cell or a wrong letter.</>,
        ]}
        approaches={[
          {
            name: "Backtracking with in-place marking",
            idea: <p>Overwrite the cell with a placeholder while it is on the current path and put the letter back afterwards.</p>,
            code: `function exist(board, word) {
  const R = board.length, C = board[0].length;
  function dfs(r, c, k) {
    if (k === word.length) return true;
    if (r < 0 || c < 0 || r >= R || c >= C || board[r][c] !== word[k]) return false;
    const saved = board[r][c];
    board[r][c] = "#";
    const found = dfs(r + 1, c, k + 1) || dfs(r - 1, c, k + 1) || dfs(r, c + 1, k + 1) || dfs(r, c - 1, k + 1);
    board[r][c] = saved;
    return found;
  }
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++)
      if (dfs(r, c, 0)) return true;
  return false;
}

const board = [["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]];
console.log(exist(board, "ABCCED")); // true
console.log(exist(board, "SEE"));    // true
console.log(exist(board, "ABCB"));   // false`,
            explain: <p>O(R · C · 3<sup>L</sup>) time for a word of length L (three directions after the first step), O(L) stack space. The <code>||</code> chain stops at the first success, so the board is restored along the way before returning.</p>,
          },
          {
            name: "A visited matrix instead of changing the board",
            idea: <p>If you must not modify the input, keep a separate boolean grid.</p>,
            code: `function exist(board, word) {
  const R = board.length, C = board[0].length;
  const seen = Array.from({ length: R }, () => new Array(C).fill(false));
  function dfs(r, c, k) {
    if (k === word.length) return true;
    if (r < 0 || c < 0 || r >= R || c >= C || seen[r][c] || board[r][c] !== word[k]) return false;
    seen[r][c] = true;
    const found = dfs(r + 1, c, k + 1) || dfs(r - 1, c, k + 1) || dfs(r, c + 1, k + 1) || dfs(r, c - 1, k + 1);
    seen[r][c] = false;
    return found;
  }
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++)
      if (dfs(r, c, 0)) return true;
  return false;
}

console.log(exist([["a", "b"], ["c", "d"]], "abdc")); // true
console.log(exist([["a", "b"], ["c", "d"]], "abcd")); // false`,
            explain: <p>The same search with O(R · C) extra memory for the visited grid.</p>,
          },
        ]}
        compare={<p>The in-place trick is shorter; mention the visited matrix when the interviewer says &ldquo;don&apos;t modify the input&rdquo;. (LeetCode 79.)</p>}
      >
        <p>Given a grid of letters and a word, return <code>true</code> if the word can be built from adjacent cells (horizontally or vertically), using each cell at most once.</p>
      </Problem>

      <Problem
        n={5}
        title="N-Queens"
        level="Hard"
        examples={[
          { input: "n = 4", output: '[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]', why: "Two ways to place 4 non-attacking queens." },
          { input: "n = 1", output: '[["Q"]]', why: "A single queen." },
        ]}
        hints={[
          <>One queen per row, so the choice in each row is the column.</>,
          <>A queen attacks its column and both diagonals. Which numbers are constant along each diagonal?</>,
          <>Along one diagonal <code>row − col</code> is constant; along the other, <code>row + col</code>.</>,
        ]}
        approaches={[
          {
            name: "Backtracking with three Sets",
            idea: <p>Row by row, try each column that is not in <code>cols</code>, <code>diag1</code> (row − col) or <code>diag2</code> (row + col).</p>,
            code: `function solveNQueens(n) {
  const out = [], queens = [];
  const cols = new Set(), diag1 = new Set(), diag2 = new Set();
  function go(row) {
    if (row === n) {
      out.push(queens.map((c) => ".".repeat(c) + "Q" + ".".repeat(n - c - 1)));
      return;
    }
    for (let c = 0; c < n; c++) {
      if (cols.has(c) || diag1.has(row - c) || diag2.has(row + c)) continue;
      cols.add(c); diag1.add(row - c); diag2.add(row + c); queens.push(c);
      go(row + 1);
      queens.pop(); cols.delete(c); diag1.delete(row - c); diag2.delete(row + c);
    }
  }
  go(0);
  return out;
}

console.log(JSON.stringify(solveNQueens(4)));  // [[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]
console.log(JSON.stringify(solveNQueens(1)));  // [["Q"]]
console.log(solveNQueens(6).length);           // 4
console.log(solveNQueens(8).length);           // 92`,
            explain: <p>The search makes 2,057 calls for n = 8 instead of checking all 8<sup>8</sup> placements. The worst case is still exponential, but the Sets make the attack check O(1).</p>,
          },
        ]}
        compare={<p>(LeetCode 51; question 6 of LeetCode&apos;s N-Queens II just counts the solutions.)</p>}
      >
        <p>Place n queens on an n × n board so that no two attack each other. Return every distinct solution as a list of board rows.</p>
      </Problem>

      <Problem
        n={6}
        title="Combination sum III"
        level="Medium"
        examples={[
          { input: "k = 3, n = 7", output: "[[1, 2, 4]]", why: "Three different digits 1–9 adding to 7." },
          { input: "k = 3, n = 9", output: "[[1,2,6],[1,3,5],[2,3,4]]", why: "Three combinations." },
          { input: "k = 4, n = 1", output: "[]", why: "Four digits cannot sum to 1." },
        ]}
        hints={[
          <>The candidates are fixed: 1 to 9, each used at most once.</>,
          <>Complete when the path has k numbers; it is an answer if the sum is n. Prune when the sum already exceeds n.</>,
        ]}
        approaches={[
          {
            name: "Backtracking over 1–9",
            idea: <p>Loop from <code>start</code> to 9, recurse with <code>i + 1</code>, and stop early once the remaining sum is too small.</p>,
            code: `function combinationSum3(k, n) {
  const out = [], path = [];
  function go(start, remaining) {
    if (path.length === k) {
      if (remaining === 0) out.push([...path]);
      return;
    }
    for (let i = start; i <= 9; i++) {
      if (i > remaining) break;                   // prune: even this number alone is too big
      path.push(i);
      go(i + 1, remaining - i);
      path.pop();
    }
  }
  go(1, n);
  return out;
}

console.log(JSON.stringify(combinationSum3(3, 7))); // [[1,2,4]]
console.log(JSON.stringify(combinationSum3(3, 9))); // [[1,2,6],[1,3,5],[2,3,4]]
console.log(JSON.stringify(combinationSum3(4, 1))); // []`,
            explain: <p>At most C(9, k) combinations: a tiny search space. The point is applying the template to a slightly different set of rules.</p>,
          },
        ]}
        compare={<p>(LeetCode 216.)</p>}
      >
        <p>Find all combinations of k different numbers from 1 to 9 that add up to n.</p>
      </Problem>

      <Problem
        n={7}
        title="Restore IP addresses"
        level="Medium"
        examples={[
          { input: 's = "25525511135"', output: '["255.255.11.135","255.255.111.35"]', why: "Four parts, each 0–255 with no leading zeros." },
          { input: 's = "0000"', output: '["0.0.0.0"]', why: "A part may be exactly 0, but not 00." },
          { input: 's = "101023"', output: '5 addresses', why: "Several ways to cut six digits into four parts." },
        ]}
        hints={[
          <>Four parts. Each part has 1 to 3 digits. At each step the choice is the part length.</>,
          <>Prune a part with a leading zero (unless it is just &ldquo;0&rdquo;) or a value above 255.</>,
          <>It is an answer only if exactly four parts use up the whole string.</>,
        ]}
        approaches={[
          {
            name: "Backtrack on part lengths",
            idea: <p>Choose a length of 1–3, check the segment is valid, recurse for the next part; save when four parts consume the string.</p>,
            code: `function restoreIpAddresses(s) {
  const out = [], parts = [];
  function go(start) {
    if (parts.length === 4) {
      if (start === s.length) out.push(parts.join("."));
      return;
    }
    for (let len = 1; len <= 3 && start + len <= s.length; len++) {
      const seg = s.slice(start, start + len);
      if (seg.length > 1 && seg[0] === "0") break;     // no leading zeros
      if (Number(seg) > 255) break;                    // too large (longer segments are larger still)
      parts.push(seg);
      go(start + len);
      parts.pop();
    }
  }
  go(0);
  return out;
}

console.log(JSON.stringify(restoreIpAddresses("25525511135"))); // ["255.255.11.135","255.255.111.35"]
console.log(JSON.stringify(restoreIpAddresses("0000")));        // ["0.0.0.0"]
console.log(JSON.stringify(restoreIpAddresses("101023")));      // ["1.0.10.23","1.0.102.3","10.1.0.23","10.10.2.3","101.0.2.3"]`,
            explain: <p>The search tree has at most 3 choices at each of 4 levels: at most 81 leaves. So the running time is effectively constant, O(1) for any input length that can form an address.</p>,
          },
        ]}
        compare={<p>(LeetCode 93.) A good example of backtracking where the tree is small and the whole difficulty is writing the validity checks correctly.</p>}
      >
        <p>Given a string of digits, return every valid IPv4 address that can be formed by inserting three dots (without reordering or removing digits).</p>
      </Problem>

      <DryRun
        title="State, choices and pruning for each problem"
        cols={["Problem", "Choice at each step", "Prune when…", "Save when…"]}
        rows={[
          ["combination sum", "which candidate (may repeat)", "candidate > remaining", "remaining = 0"],
          ["combination sum II", "which candidate (once, skip dup.)", "candidate > remaining", "remaining = 0"],
          ["palindrome partitioning", "end of the next piece", "piece is not a palindrome", "start = length"],
          ["word search", "one of 4 neighbours", "out of bounds / used / wrong letter", "all letters matched"],
          ["N-Queens", "column in this row", "column or diagonal attacked", "row = n"],
          ["restore IP", "part length 1–3", "leading zero or > 255", "4 parts use all digits"],
        ]}
      />
    </>
  );
}
