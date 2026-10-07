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
          <>The state is the path and the amount you still need. It is complete when that amount is exactly 0.</>,
          <>You may use a number again, so make the recursive call with the same index. If you only look forward, [2, 3] and [3, 2] do not both appear.</>,
          <>Sort the numbers, and use <code>break</code> as soon as a number is bigger than what remains.</>,
        ]}
        approaches={[
          {
            name: "Backtracking with pruning",
            idea: <p>This is the algorithm we traced. Choose a number, make the recursive call with the smaller target, then undo.</p>,
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
            explain: <p>The number of combinations can grow exponentially, so the worst case cannot be better. Pruning keeps it fast in real use.</p>,
          },
        ]}
        compare={<p>(LeetCode 39.)</p>}
      >
        <p>You get different positive integers and a target. Return all different combinations that add up to the target. You may use the same number as many times as you want.</p>
      </Problem>

      <Problem
        n={2}
        title="Combination sum II"
        level="Medium"
        examples={[
          { input: "candidates = [10, 1, 2, 7, 6, 1, 5], target = 8", output: "[[1,1,6],[1,2,5],[1,7],[2,6]]", why: "Each number is used at most once. The two 1s are different elements, but they must not make the same combination twice." },
          { input: "candidates = [2, 5, 2, 1, 2], target = 5", output: "[[1,2,2],[5]]", why: "Only different combinations." },
        ]}
        hints={[
          <>Each element can be used only once, so make the recursive call with <code>i + 1</code>.</>,
          <>The input has repeated values. Sort, and skip a value that is equal to the one before it at the same level (Lesson 33, Subsets II).</>,
        ]}
        approaches={[
          {
            name: "Sort, skip duplicates at each level, no reuse",
            idea: <p>Use both ideas together: <code>i + 1</code> in the recursive call, and <code>i &gt; start &amp;&amp; same as previous → continue</code>.</p>,
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
            explain: <p>Without the skip line, you would make [1, 2, 5] twice, once for each 1. Sorting also lets you use the early <code>break</code>.</p>,
          },
        ]}
        compare={<p>(LeetCode 40.)</p>}
      >
        <p>You get numbers that may repeat, and a target. Return all different combinations that add up to the target. You may use each element at most once.</p>
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
          <>At each start position, the choice is where the next piece ends.</>,
          <>Choose only a piece that is a palindrome. When the start reaches the end of the string, save the path.</>,
        ]}
        approaches={[
          {
            name: "Backtrack with a palindrome check",
            idea: <p>Try every end position for the current start. Skip pieces that are not palindromes. Make the recursive call from end + 1.</p>,
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
            explain: <p>The worst case is O(n · 2<sup>n</sup>). A string of one repeated letter makes every cut valid. The palindrome check costs O(n) for each piece.</p>,
          },
          {
            name: "Work out the palindromes first",
            idea: <p>Build a table <code>pal[i][j]</code> once with dynamic programming (solving small parts first and reusing their answers). Then each check takes O(1).</p>,
            code: `function partition(s) {
  const n = s.length;
  const pal = Array.from({ length: n }, () => new Array(n).fill(false));
  for (let i = n - 1; i >= 0; i--)
    for (let j = i; j < n; j++)
      pal[i][j] = s[i] === s[j] && (j - i < 2 || pal[i + 1][j - 1]);   // the two ends match and the inside is a palindrome

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
            explain: <p>The table costs O(n²) to build. After that, every check is O(1). This is your first look at dynamic programming.</p>,
          },
        ]}
        compare={<p>Start with the first one. Then mention the table as a way to make it faster. (LeetCode 131.)</p>}
      >
        <p>Split a string so that every piece is a palindrome. Return all the possible ways to split it.</p>
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
          <>Start a search from every cell. From a cell, try to match the next letter going up, down, left and right.</>,
          <>One path cannot use a cell twice. Mark the cell as used, and put it back when the search leaves the cell.</>,
          <>Stop a path at once when it goes outside the grid, reaches a used cell, or finds a wrong letter.</>,
        ]}
        approaches={[
          {
            name: "Backtracking with marking inside the board",
            idea: <p>While a cell is on the current path, write a placeholder in it. Put the letter back afterwards.</p>,
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
            explain: <p>The time is O(R · C · 3<sup>L</sup>) for a word of length L (three directions after the first step). The stack space is O(L). The <code>||</code> chain stops at the first success. Each cell is put back before the function returns, so the board is not left changed.</p>,
          },
          {
            name: "A visited grid instead of changing the board",
            idea: <p>If you must not change the input, keep a separate grid of true/false values.</p>,
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
            explain: <p>It is the same search, with O(R · C) extra memory for the visited grid.</p>,
          },
        ]}
        compare={<p>Marking inside the board is shorter. Mention the visited grid when the interviewer says &ldquo;don&apos;t change the input&rdquo;. (LeetCode 79.)</p>}
      >
        <p>You get a grid of letters and a word. Return <code>true</code> if the word can be spelled with cells that touch each other (left, right, up or down). You may use each cell at most once.</p>
      </Problem>

      <Problem
        n={5}
        title="N-Queens"
        level="Hard"
        examples={[
          { input: "n = 4", output: '[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]', why: "There are two ways to place 4 queens so that none attacks another." },
          { input: "n = 1", output: '[["Q"]]', why: "A single queen." },
        ]}
        hints={[
          <>Put one queen in each row. The choice in each row is the column.</>,
          <>A queen attacks its column and both diagonals. Which number stays the same along each diagonal?</>,
          <>Along one diagonal, <code>row − col</code> stays the same. Along the other diagonal, <code>row + col</code> stays the same.</>,
        ]}
        approaches={[
          {
            name: "Backtracking with three Sets",
            idea: <p>Go row by row. Try each column that is not in <code>cols</code>, <code>diag1</code> (row − col) or <code>diag2</code> (row + col).</p>,
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
            explain: <p>For n = 8 the search makes 2,057 calls. It does not check all 8<sup>8</sup> placements. The worst case is still exponential, but the Sets make the attack check O(1).</p>,
          },
        ]}
        compare={<p>(LeetCode 51. LeetCode&apos;s N-Queens II is the same problem, but it only counts the solutions.)</p>}
      >
        <p>Place n queens on an n × n board so that no two queens attack each other. Return every different solution as a list of board rows.</p>
      </Problem>

      <Problem
        n={6}
        title="Combination sum III"
        level="Medium"
        examples={[
          { input: "k = 3, n = 7", output: "[[1, 2, 4]]", why: "Three different digits from 1 to 9 that add up to 7." },
          { input: "k = 3, n = 9", output: "[[1,2,6],[1,3,5],[2,3,4]]", why: "Three combinations." },
          { input: "k = 4, n = 1", output: "[]", why: "Four digits cannot sum to 1." },
        ]}
        hints={[
          <>The numbers you can use are fixed: 1 to 9, each used at most once.</>,
          <>The path is complete when it has k numbers. It is an answer if the sum is n. Prune when the sum is already bigger than n.</>,
        ]}
        approaches={[
          {
            name: "Backtracking over 1–9",
            idea: <p>Loop from <code>start</code> to 9 and make the recursive call with <code>i + 1</code>. Stop early when the number is bigger than the sum that remains.</p>,
            code: `function combinationSum3(k, n) {
  const out = [], path = [];
  function go(start, remaining) {
    if (path.length === k) {
      if (remaining === 0) out.push([...path]);
      return;
    }
    for (let i = start; i <= 9; i++) {
      if (i > remaining) break;                   // prune: this number alone is already too big
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
            explain: <p>There are at most C(9, k) combinations, so the search is very small. The point is to use the same template with slightly different rules.</p>,
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
          { input: 's = "25525511135"', output: '["255.255.11.135","255.255.111.35"]', why: "Four parts. Each part is from 0 to 255 and has no zero at the front." },
          { input: 's = "0000"', output: '["0.0.0.0"]', why: "A part can be 0, but it cannot be 00." },
          { input: 's = "101023"', output: '5 addresses', why: "There are several ways to cut six digits into four parts." },
        ]}
        hints={[
          <>There are four parts. Each part has 1 to 3 digits. At each step, the choice is how long the part is.</>,
          <>Prune a part that starts with a zero (unless it is just &ldquo;0&rdquo;) or has a value above 255.</>,
          <>It is an answer only if exactly four parts use the whole string.</>,
        ]}
        approaches={[
          {
            name: "Backtrack on part lengths",
            idea: <p>Choose a length of 1 to 3 and check that the piece is valid. Then make the recursive call for the next part. Save the answer when four parts use the whole string.</p>,
            code: `function restoreIpAddresses(s) {
  const out = [], parts = [];
  function go(start) {
    if (parts.length === 4) {
      if (start === s.length) out.push(parts.join("."));
      return;
    }
    for (let len = 1; len <= 3 && start + len <= s.length; len++) {
      const seg = s.slice(start, start + len);
      if (seg.length > 1 && seg[0] === "0") break;     // no zero at the front
      if (Number(seg) > 255) break;                    // too big (longer pieces are even bigger)
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
            explain: <p>The search tree has at most 3 choices at each of 4 levels, so at most 81 leaves. The running time is effectively constant, O(1), for any input length that can make an address.</p>,
          },
        ]}
        compare={<p>(LeetCode 93.) Here the tree is small. The hard part is to write the validity checks correctly.</p>}
      >
        <p>You get a string of digits. Return every valid IPv4 address (four numbers separated by dots) that you can make by adding three dots. You cannot change the order of the digits or remove any digit.</p>
      </Problem>

      <DryRun
        title="State, choices and pruning for each problem"
        cols={["Problem", "Choice at each step", "Prune when…", "Save when…"]}
        rows={[
          ["combination sum", "which number (may be used again)", "number > remaining", "remaining = 0"],
          ["combination sum II", "which number (once, skip repeated values)", "number > remaining", "remaining = 0"],
          ["palindrome partitioning", "end of the next piece", "piece is not a palindrome", "start = length"],
          ["word search", "one of 4 neighbours", "out of bounds / used / wrong letter", "all letters matched"],
          ["N-Queens", "column in this row", "column or diagonal attacked", "row = n"],
          ["restore IP", "part length 1–3", "leading zero or > 255", "4 parts use all digits"],
        ]}
      />
    </>
  );
}
