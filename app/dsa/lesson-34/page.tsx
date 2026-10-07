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

const lesson = getDsaLesson("lesson-34");

export const metadata: Metadata = {
  title: `Lesson 34 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Backtracking = depth-first search plus pruning" },
  { id: "template", label: "The template" },
  { id: "combo", label: "Combination sum: reuse allowed" },
  { id: "trace", label: "Traced: combination sum for target 7" },
  { id: "palin", label: "Palindrome partitioning: where to cut" },
  { id: "word", label: "Word search: backtracking on a grid" },
  { id: "queens", label: "N-Queens: pruning with three sets" },
  { id: "cost", label: "Why pruning matters, and what it costs" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "Part 8 complete — what's next" },
];

const templateSrc = `function backtrack(state) {
  if (isComplete(state)) { save(state); return; }      // 1. a full answer: record it
  for (const choice of choicesFrom(state)) {
    if (!isValid(state, choice)) continue;             // 2. PRUNE: skip a choice that can never lead to an answer
    apply(state, choice);                              // 3. choose
    backtrack(state);                                  // 4. explore
    undo(state, choice);                               // 5. un-choose
  }
}`;

const comboCode = `function combinationSum(candidates, target) {
  candidates = [...candidates].sort((a, b) => a - b);        // sorting lets us stop early
  const out = [], path = [];
  function go(start, remaining) {
    if (remaining === 0) { out.push([...path]); return; }    // exactly reached the target
    for (let i = start; i < candidates.length; i++) {
      if (candidates[i] > remaining) break;                  // prune: this and every larger value is too big
      path.push(candidates[i]);
      go(i, remaining - candidates[i]);                      // i, not i + 1: the same number may be reused
      path.pop();
    }
  }
  go(0, target);
  return out;
}

console.log(JSON.stringify(combinationSum([2, 3, 6, 7], 7))); // [[2,2,3],[7]]
console.log(JSON.stringify(combinationSum([2, 3, 5], 8)));    // [[2,2,2,2],[2,3,3],[3,5]]
console.log(JSON.stringify(combinationSum([2], 1)));          // []`;

const traceSrc = `const nums = [2, 3, 6, 7], target = 7;
const out = [], path = [];
function go(start, remaining) {
  if (remaining === 0) { out.push([...path]); return; }
  for (let i = start; i < nums.length; i++) {
    if (nums[i] > remaining) break;
    path.push(nums[i]);
    go(i, remaining - nums[i]);
    path.pop();
  }
}
go(0, target);
console.log(out);`;

function comboTrace() {
  const t = tracer();
  const nums = [2, 3, 6, 7], target = 7;
  const out: number[][] = [];
  const path: number[] = [];
  const go = (start: number, remaining: number) => {
    if (remaining === 0) {
      out.push([...path]);
      t.step(4, "print", `remaining = 0 → save [${path.join(", ")}]`, "The path adds up to the target exactly: that is an answer.", { path, remaining, saved: out.length });
      return;
    }
    for (let i = start; i < nums.length; i++) {
      if (nums[i] > remaining) {
        t.step(6, "stop", `${nums[i]} > ${remaining}: prune`, `${nums[i]} is too big, and the list is sorted, so every later number is too big as well. Stop this loop.`, { path, start, i, remaining }, "remaining");
        break;
      }
      path.push(nums[i]);
      t.step(7, "update", `choose ${nums[i]} → path [${path.join(", ")}], ${remaining - nums[i]} left`, `Add ${nums[i]} and recurse with ${remaining - nums[i]} still to reach. Starting from index ${i} again means ${nums[i]} may be used repeatedly.`, { path, remaining: remaining - nums[i], saved: out.length }, "path");
      go(i, remaining - nums[i]);
      path.pop();
      t.step(9, "update", `undo ${nums[i]} → path [${path.join(", ")}]`, "Back out of this choice and try the next candidate.", { path, remaining, saved: out.length }, "path");
    }
  };
  t.step(2, "start", "out = [], path = []", "path holds the numbers chosen so far. We want paths that add up to 7.", { nums, target, path, out: [] });
  go(0, target);
  t.print(out.map((p) => `[${p.join(",")}]`).join(" "));
  t.step(12, "print", "console.log(out)", "Two combinations: [2, 2, 3] and [7]. Notice how many branches were cut by the “too big” check.", { saved: out.length });
  return t.steps;
}

const palinCode = `function partition(s) {
  const out = [], path = [];
  const isPal = (l, r) => {
    while (l < r) if (s[l++] !== s[r--]) return false;
    return true;
  };
  function go(start) {
    if (start === s.length) { out.push([...path]); return; }   // cut the whole string: one answer
    for (let end = start; end < s.length; end++) {
      if (!isPal(start, end)) continue;                        // prune: only cut after a palindrome
      path.push(s.slice(start, end + 1));
      go(end + 1);
      path.pop();
    }
  }
  go(0);
  return out;
}

console.log(JSON.stringify(partition("aab"))); // [["a","a","b"],["aa","b"]]`;

const wordCode = `function exist(board, word) {
  const R = board.length, C = board[0].length;
  function dfs(r, c, k) {
    if (k === word.length) return true;                       // matched every letter
    if (r < 0 || c < 0 || r >= R || c >= C || board[r][c] !== word[k]) return false;   // prune
    const saved = board[r][c];
    board[r][c] = "#";                                        // choose: mark this cell as used
    const found = dfs(r + 1, c, k + 1) || dfs(r - 1, c, k + 1) || dfs(r, c + 1, k + 1) || dfs(r, c - 1, k + 1);
    board[r][c] = saved;                                      // un-choose: free the cell for other paths
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
console.log(exist(board, "ABCB"));   // false`;

const queensCode = `function solveNQueens(n) {
  const out = [], queens = [];                    // queens[row] = the column of that row's queen
  const cols = new Set(), diag1 = new Set(), diag2 = new Set();
  function go(row) {
    if (row === n) {
      out.push(queens.map((c) => ".".repeat(c) + "Q" + ".".repeat(n - c - 1)));
      return;
    }
    for (let c = 0; c < n; c++) {
      if (cols.has(c) || diag1.has(row - c) || diag2.has(row + c)) continue;   // attacked: prune
      cols.add(c); diag1.add(row - c); diag2.add(row + c); queens.push(c);
      go(row + 1);
      queens.pop(); cols.delete(c); diag1.delete(row - c); diag2.delete(row + c);
    }
  }
  go(0);
  return out;
}

console.log(solveNQueens(4).length);                         // 2
console.log(JSON.stringify(solveNQueens(4)[0]));             // [".Q..","...Q","Q...","..Q."]
console.log(solveNQueens(8).length);                         // 92`;

export default function DsaLessonThirtyFourPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">Backtracking = depth-first search plus pruning</h2>
      <p>
        Lesson 33 generated <em>every</em> subset or permutation. Real problems usually want only the answers that satisfy a{" "}
        <strong>constraint</strong>: numbers that add up to a target, cuts that are palindromes, queens that do not attack each
        other. Walking the whole tree and filtering at the end would be wasteful. <strong>Backtracking</strong> checks the
        constraint <em>while building</em>, and the moment a partial answer can no longer succeed it abandons that branch and
        steps back (&ldquo;backtracks&rdquo;) to try the next choice. Cutting off a branch early is called{" "}
        <strong>pruning</strong>.
      </p>
      <p>
        There is nothing new in the mechanics: it is the choose–explore–un-choose loop from Lesson 33 with one extra line that
        says &ldquo;this choice is no good, skip it&rdquo;.
      </p>

      <h2 id="template">The template</h2>
      <CodeBlock lang="js" code={templateSrc} />
      <p>
        For any new problem, answer five questions and the code writes itself: <strong>What is the state</strong> (the path)?{" "}
        <strong>When is it complete</strong> (save it)? <strong>What are the choices</strong> at each step?{" "}
        <strong>Which choices are invalid</strong> (prune)? <strong>How do I undo</strong> a choice?
      </p>

      <h2 id="combo">Combination sum: reuse allowed</h2>
      <p>
        Given distinct positive numbers and a target, find every combination that adds up to the target; a number may be used
        any number of times. State: the path and the <code>remaining</code> amount. Complete: <code>remaining === 0</code>.
        Prune: a number larger than <code>remaining</code>. Two details make it correct and efficient:
      </p>
      <ul>
        <li><strong>Recurse with <code>i</code>, not <code>i + 1</code></strong>, so the same number can be chosen again; but never look backwards (<code>start</code> only moves forward), so <code>[2, 3]</code> and <code>[3, 2]</code> are not both produced.</li>
        <li><strong>Sort first</strong>, so when one number is too big you can <code>break</code> instead of <code>continue</code>: all later ones are bigger.</li>
      </ul>
      <CodeBlock lang="js" code={comboCode} />

      <h2 id="trace">Traced: combination sum for target 7</h2>
      <CodeTrace
        code={traceSrc}
        steps={comboTrace()}
        caption="Choose, recurse, undo. A “prune” step ends a loop early because no remaining candidate can fit."
      />
      <DryRun
        title="candidates [2, 3, 6, 7], target 7"
        cols={["Path", "remaining", "What happens"]}
        rows={[
          ["[]", "7", "try 2, 3, 6, 7 in turn"],
          ["[2]", "5", "try 2, 3 (6 is too big)"],
          ["[2, 2]", "3", "try 2, 3 (6 is too big)"],
          ["[2, 2, 2]", "1", "2 > 1: prune, dead end"],
          ["[2, 2, 3]", "0", "save → answer"],
          ["[2, 3]", "2", "3 > 2: prune, dead end"],
          ["[3, 3]", "1", "3 > 1: prune, dead end"],
          ["[7]", "0", "save → answer"],
        ]}
        highlight={4}
        note="The whole search is just 10 calls, instead of the dozens an unpruned walk would make."
      />

      <h2 id="palin">Palindrome partitioning: where to cut</h2>
      <p>
        Split a string into pieces so that <strong>every piece is a palindrome</strong>. At each position the choice is{" "}
        <em>how long the next piece is</em>. The pruning rule: only choose a piece that is itself a palindrome. When the start
        reaches the end of the string, every piece so far was valid, so the path is an answer.
      </p>
      <CodeBlock lang="js" code={palinCode} />

      <h2 id="word">Word search: backtracking on a grid</h2>
      <p>
        Does a word appear in a grid, moving up, down, left or right, without reusing a cell? From each starting cell, try to
        match the next letter in each of the four directions. The twist is <strong>marking cells as used</strong>: set the
        cell to a placeholder (<code>&quot;#&quot;</code>) when you step on it, and <em>restore</em> it when you leave — the
        un-choose step. Prune immediately when the cell is out of bounds, already used, or the wrong letter.
      </p>
      <CodeBlock lang="js" code={wordCode} />
      <Callout kind="warn" label="Always restore what you changed">
        The most common backtracking bug is forgetting the undo. If the cell is not restored, a failed path leaves a hole in the
        grid and later paths wrongly fail.
      </Callout>

      <h2 id="queens">N-Queens: pruning with three sets</h2>
      <p>
        Place n queens on an n × n board so none attacks another (same row, column or diagonal). Place one queen per{" "}
        <strong>row</strong>; the choice in each row is the column. A queen at <code>(row, c)</code> attacks its column{" "}
        <code>c</code>, and two diagonals: cells with the same <code>row − c</code> (one direction) and the same{" "}
        <code>row + c</code> (the other). Keep three Sets, so the &ldquo;is this cell attacked?&rdquo; check is O(1).
      </p>
      <CodeBlock lang="js" code={queensCode} />

      <h2 id="cost">Why pruning matters, and what it costs</h2>
      <DryRun
        title="the effect of pruning"
        cols={["Problem", "Without pruning", "With pruning"]}
        rows={[
          ["N-Queens, n = 8", "8⁸ = 16.7 million placements", "2,057 calls (92 answers)"],
          ["combination sum", "every sequence of numbers", "stops when the sum exceeds the target"],
          ["word search", "every path of any length", "stops at the first mismatching letter"],
          ["palindrome partitioning", "all 2ⁿ⁻¹ ways of cutting", "only cuts that leave a palindrome"],
        ]}
        note="Pruning does not change the worst-case Big-O, which is still exponential for these problems, but it often cuts the real running time by orders of magnitude."
      />
      <p>
        Backtracking problems are exponential in the worst case, so they appear with small inputs. Interviewers expect you to
        say so, and to point at your pruning rule as the reason it is fast enough.
      </p>

      <h2 id="practice">Practice questions</h2>
      <p>For each, write the five questions (state, complete, choices, prune, undo) as comments before coding.</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write the backtracking template from memory and name the pruning line.</>,
          <>Explain why combination sum recurses with <code>i</code> but combination sum II recurses with <code>i + 1</code>.</>,
          <>Explain how the three Sets in N-Queens replace scanning the board.</>,
          <>Explain what goes wrong if you forget to restore a cell in word search.</>,
        ]}
      />

      <h2 id="next">Part 8 complete — what&apos;s next</h2>
      <p>
        You can now explore decision trees with and without constraints. <strong>Part 9</strong> changes the data structure:
        linked lists, where every element points to the next, and where rearranging pointers (rather than shifting array
        slots) is the whole game.
      </p>
    </DsaLessonPage>
  );
}
