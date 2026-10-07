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
  { id: "concept", label: "Backtracking = depth-first search plus pruning (cutting off bad branches)" },
  { id: "template", label: "The template" },
  { id: "combo", label: "Combination sum: reuse allowed" },
  { id: "trace", label: "Traced: combination sum for target 7" },
  { id: "palin", label: "Palindrome partitioning: where to cut" },
  { id: "word", label: "Word search: backtracking on a grid" },
  { id: "queens", label: "N-Queens: pruning with three Sets" },
  { id: "cost", label: "Why pruning matters, and what it costs" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "Part 8 complete: what's next" },
];

const templateSrc = `function backtrack(state) {
  if (isComplete(state)) { save(state); return; }      // 1. a full answer: save it
  for (const choice of choicesFrom(state)) {
    if (!isValid(state, choice)) continue;             // 2. PRUNE: skip a choice that can never lead to an answer
    apply(state, choice);                              // 3. choose
    backtrack(state);                                  // 4. explore
    undo(state, choice);                               // 5. un-choose (undo)
  }
}`;

const comboCode = `function combinationSum(candidates, target) {
  candidates = [...candidates].sort((a, b) => a - b);        // sorting lets us stop early
  const out = [], path = [];
  function go(start, remaining) {
    if (remaining === 0) { out.push([...path]); return; }    // we reached the target exactly
    for (let i = start; i < candidates.length; i++) {
      if (candidates[i] > remaining) break;                  // prune: this value and every larger value is too big
      path.push(candidates[i]);
      go(i, remaining - candidates[i]);                      // i, not i + 1: the same number may be used again
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
      t.step(4, "print", `remaining = 0 → save [${path.join(", ")}]`, "The path adds up to exactly the target, so this is an answer.", { path, remaining, saved: out.length });
      return;
    }
    for (let i = start; i < nums.length; i++) {
      if (nums[i] > remaining) {
        t.step(6, "stop", `${nums[i]} > ${remaining}: prune`, `${nums[i]} is too big. The list is sorted, so every later number is too big too. Stop this loop.`, { path, start, i, remaining }, "remaining");
        break;
      }
      path.push(nums[i]);
      t.step(7, "update", `choose ${nums[i]} → path [${path.join(", ")}], ${remaining - nums[i]} left`, `Add ${nums[i]}, then make the recursive call with ${remaining - nums[i]} still to reach. We start from index ${i} again, so ${nums[i]} can be used more than once.`, { path, remaining: remaining - nums[i], saved: out.length }, "path");
      go(i, remaining - nums[i]);
      path.pop();
      t.step(9, "update", `undo ${nums[i]} → path [${path.join(", ")}]`, "Undo this choice and try the next number.", { path, remaining, saved: out.length }, "path");
    }
  };
  t.step(2, "start", "out = [], path = []", "path holds the numbers chosen so far. We want paths that add up to 7.", { nums, target, path, out: [] });
  go(0, target);
  t.print(out.map((p) => `[${p.join(",")}]`).join(" "));
  t.step(12, "print", "console.log(out)", "We found two combinations: [2, 2, 3] and [7]. Notice how many branches the “too big” check cut off.", { saved: out.length });
  return t.steps;
}

const palinCode = `function partition(s) {
  const out = [], path = [];
  const isPal = (l, r) => {
    while (l < r) if (s[l++] !== s[r--]) return false;
    return true;
  };
  function go(start) {
    if (start === s.length) { out.push([...path]); return; }   // we cut the whole string: one answer
    for (let end = start; end < s.length; end++) {
      if (!isPal(start, end)) continue;                        // prune: only cut when the piece is a palindrome
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
    if (k === word.length) return true;                       // every letter matched
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
  const out = [], queens = [];                    // queens[row] = the column of the queen in that row
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
      <h2 id="concept">Backtracking = depth-first search plus pruning (cutting off bad branches)</h2>
      <p>
        Lesson 33 made <em>every</em> subset or permutation. Real problems usually want only the answers that follow a{" "}
        <strong>rule</strong> (a constraint). For example: numbers that add up to a target, cuts where every piece is a palindrome, or queens that do not attack each
        other. It would be a waste to walk the whole tree and filter at the end. <strong>Backtracking</strong> checks the
        rule <em>while building</em> the answer. As soon as a partial answer cannot work any more, it drops that branch and
        steps back (&ldquo;backtracks&rdquo;) to try the next choice. Cutting off a branch early is called{" "}
        <strong>pruning</strong>, like cutting a dead branch off a real tree.
      </p>
      <p>
        There is nothing new in how it works. It is the same choose, explore, un-choose loop from Lesson 33, with one extra line that
        says &ldquo;this choice is no good, skip it&rdquo;.
      </p>

      <h2 id="template">The template</h2>
      <CodeBlock lang="js" code={templateSrc} />
      <p>
        For any new problem, answer five questions and the code is easy to write. <strong>What is the state</strong> (the path so far)?{" "}
        <strong>When is it complete</strong> (then save it)? <strong>What are the choices</strong> at each step?{" "}
        <strong>Which choices are not allowed</strong> (prune them)? <strong>How do I undo</strong> a choice?
      </p>

      <h2 id="combo">Combination sum: reuse allowed</h2>
      <p>
        You get different positive numbers and a target. Find every combination that adds up to the target. A number may be used
        any number of times. The state is the path and the <code>remaining</code> amount. It is complete when <code>remaining === 0</code>.
        Prune any number that is larger than <code>remaining</code>. Two details make the code correct and fast.
      </p>
      <ul>
        <li><strong>Make the recursive call with <code>i</code>, not <code>i + 1</code></strong>, so the same number can be chosen again. But never look backwards (<code>start</code> only moves forward). Then <code>[2, 3]</code> and <code>[3, 2]</code> are not both made.</li>
        <li><strong>Sort first.</strong> Then, when one number is too big, you can use <code>break</code> (stop the whole loop) instead of <code>continue</code> (skip only this number), because all later numbers are bigger.</li>
      </ul>
      <CodeBlock lang="js" code={comboCode} />

      <h2 id="trace">Traced: combination sum for target 7</h2>
      <CodeTrace
        code={traceSrc}
        steps={comboTrace()}
        caption="Choose, recurse, undo. A “prune” step ends a loop early because none of the remaining numbers can fit."
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
        note="The whole search is just 10 calls. A walk without pruning would make dozens."
      />

      <h2 id="palin">Palindrome partitioning: where to cut</h2>
      <p>
        Split a string into pieces so that <strong>every piece is a palindrome</strong> (a word that reads the same forwards and backwards, like &ldquo;aba&rdquo;). At each position the choice is{" "}
        <em>how long the next piece is</em>. The pruning rule is to choose only a piece that is a palindrome. When the start
        reaches the end of the string, every piece so far was valid, so the path is an answer.
      </p>
      <CodeBlock lang="js" code={palinCode} />

      <h2 id="word">Word search: backtracking on a grid</h2>
      <p>
        Is a word hidden in a grid of letters? You can move up, down, left or right, and you cannot use a cell twice. From each starting cell, try to
        match the next letter in each of the four directions. The special part is <strong>marking cells as used</strong>. When you step on a cell, change it to a
        placeholder (<code>&quot;#&quot;</code>). When you leave, <em>put the letter back</em>. That is the
        un-choose step. Stop that path at once when the cell is outside the grid, already used, or the wrong letter.
      </p>
      <CodeBlock lang="js" code={wordCode} />
      <Callout kind="warn" label="Always put back what you changed">
        The most common backtracking bug is to forget the undo. If you do not put the cell back, a path that failed leaves a hole in the
        grid, and later paths fail by mistake.
      </Callout>

      <h2 id="queens">N-Queens: pruning with three Sets</h2>
      <p>
        Place n queens (chess pieces) on an n × n board so that no queen attacks another. Queens attack along the same row, column or diagonal. Place one queen in each{" "}
        <strong>row</strong>. The choice in each row is the column. A queen at <code>(row, c)</code> attacks its column{" "}
        <code>c</code> and two diagonals. One diagonal is the cells with the same <code>row − c</code>. The other diagonal is the cells with the same{" "}
        <code>row + c</code>. Keep three Sets, so the question &ldquo;is this cell attacked?&rdquo; takes O(1) time (the same short time every time).
      </p>
      <CodeBlock lang="js" code={queensCode} />

      <h2 id="cost">Why pruning matters, and what it costs</h2>
      <DryRun
        title="The effect of pruning"
        cols={["Problem", "Without pruning", "With pruning"]}
        rows={[
          ["N-Queens, n = 8", "8⁸ = 16.7 million placements", "2,057 calls (92 answers)"],
          ["combination sum", "every sequence of numbers", "stops when the sum is bigger than the target"],
          ["word search", "every path of any length", "stops at the first letter that does not match"],
          ["palindrome partitioning", "all 2ⁿ⁻¹ ways to cut", "only cuts that make a palindrome"],
        ]}
        note="Pruning does not change the worst-case Big-O (the time in the worst case). It is still exponential, which means it grows very fast. But pruning often makes the real running time many times smaller."
      />
      <p>
        In the worst case, backtracking takes exponential time. That is why these problems have small inputs. Interviewers expect you to
        say this. They also expect you to point at your pruning rule as the reason your code is fast enough.
      </p>

      <h2 id="practice">Practice questions</h2>
      <p>For each question, write the five answers (state, complete, choices, prune, undo) as comments before you write the code.</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write the backtracking template from memory and point at the pruning line.</>,
          <>Explain why combination sum recurses with <code>i</code> but combination sum II recurses with <code>i + 1</code>.</>,
          <>Explain how the three Sets in N-Queens save you from scanning the board.</>,
          <>Explain what goes wrong if you forget to put a cell back in word search.</>,
        ]}
      />

      <h2 id="next">Part 8 complete: what&apos;s next</h2>
      <p>
        You can now explore decision trees, with rules and without rules. <strong>Part 9</strong> uses a new data structure:
        linked lists. In a linked list, every element points to the next one. The main skill is to change the pointers
        instead of moving items around in an array.
      </p>
    </DsaLessonPage>
  );
}
