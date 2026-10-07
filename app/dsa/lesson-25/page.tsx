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

const lesson = getDsaLesson("lesson-25");

export const metadata: Metadata = {
  title: `Lesson 25 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "An array of rows" },
  { id: "create", label: "Creating a matrix (and the shared-row trap)" },
  { id: "loop", label: "Looping: rows, columns, diagonals, neighbours" },
  { id: "sums", label: "Row and column sums" },
  { id: "transpose", label: "Transpose and rotate by 90°" },
  { id: "spiral", label: "Spiral order with four boundaries" },
  { id: "zeroes", label: "Set matrix zeroes" },
  { id: "search", label: "Searching a sorted matrix" },
  { id: "trace", label: "Traced: the staircase search" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "Part 4 complete — what's next" },
];

const createCode = `const rows = 3, cols = 4;

// Correct: a new row array for every row
const grid = Array.from({ length: rows }, () => new Array(cols).fill(0));
grid[0][1] = 5;
console.log(grid[0][1], grid[1][1]); // 5 0

// Trap: fill() puts the SAME row object in every slot
const bad = new Array(rows).fill(new Array(cols).fill(0));
bad[0][1] = 5;
console.log(bad[0][1], bad[1][1]);   // 5 5   ← every "row" changed`;

const loopCode = `const m = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];
const rows = m.length, cols = m[0].length;

for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    // m[r][c] — row first, then column
  }
}

// Diagonals of a square matrix
let main = 0, anti = 0;
for (let i = 0; i < rows; i++) {
  main += m[i][i];                 // top-left to bottom-right
  anti += m[i][cols - 1 - i];      // top-right to bottom-left
}
console.log(main, anti);           // 15 15

// The four neighbours of (r, c), skipping cells outside the grid
const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];   // up, down, left, right
function neighbours(r, c) {
  const out = [];
  for (const [dr, dc] of DIRS) {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) out.push(m[nr][nc]);
  }
  return out;
}
console.log(neighbours(0, 0));     // [ 4, 2 ]
console.log(neighbours(1, 1));     // [ 2, 8, 4, 6 ]`;

const sumsCode = `const m = [
  [3, 1, 2],
  [0, 4, 5],
];
const rowSums = m.map((row) => row.reduce((a, b) => a + b, 0));
const colSums = new Array(m[0].length).fill(0);
for (const row of m) {
  for (let c = 0; c < row.length; c++) colSums[c] += row[c];
}
console.log(rowSums, colSums); // [ 6, 9 ] [ 3, 5, 7 ]`;

const rotateCode = `function rotate(m) {
  const n = m.length;
  // 1. transpose: swap across the main diagonal (only j > i, or each pair swaps twice)
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      [m[i][j], m[j][i]] = [m[j][i], m[i][j]];
    }
  }
  // 2. reverse every row
  for (const row of m) row.reverse();
  return m;
}

console.log(rotate([[1, 2, 3], [4, 5, 6], [7, 8, 9]]));
// [ [ 7, 4, 1 ], [ 8, 5, 2 ], [ 9, 6, 3 ] ]`;

const spiralCode = `function spiralOrder(m) {
  const out = [];
  let top = 0, bottom = m.length - 1, left = 0, right = m[0].length - 1;
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) out.push(m[top][c]);          // → along the top
    top++;
    for (let r = top; r <= bottom; r++) out.push(m[r][right]);        // ↓ down the right
    right--;
    if (top <= bottom) {
      for (let c = right; c >= left; c--) out.push(m[bottom][c]);     // ← along the bottom
      bottom--;
    }
    if (left <= right) {
      for (let r = bottom; r >= top; r--) out.push(m[r][left]);       // ↑ up the left
      left++;
    }
  }
  return out;
}

console.log(spiralOrder([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]));
// [ 1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7 ]`;

const zeroesCode = `function setZeroes(m) {
  const zeroRows = new Set(), zeroCols = new Set();
  for (let r = 0; r < m.length; r++)                       // pass 1: find the zeros
    for (let c = 0; c < m[0].length; c++)
      if (m[r][c] === 0) { zeroRows.add(r); zeroCols.add(c); }
  for (let r = 0; r < m.length; r++)                       // pass 2: write the zeros
    for (let c = 0; c < m[0].length; c++)
      if (zeroRows.has(r) || zeroCols.has(c)) m[r][c] = 0;
  return m;
}

console.log(setZeroes([[1, 1, 1], [1, 0, 1], [1, 1, 1]]));
// [ [ 1, 0, 1 ], [ 0, 0, 0 ], [ 1, 0, 1 ] ]`;

const flatCode = `// Rows sorted, and each row starts after the previous row ends:
// the matrix is really one sorted list of rows × cols values.
function searchMatrix(m, target) {
  const rows = m.length, cols = m[0].length;
  let lo = 0, hi = rows * cols - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const v = m[Math.floor(mid / cols)][mid % cols];    // 1-D index → (row, column)
    if (v === target) return true;
    if (v < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return false;
}

console.log(searchMatrix([[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 3));  // true
console.log(searchMatrix([[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 13)); // false`;

const stairCode = `const m = [
  [1, 4, 7, 11],
  [2, 5, 8, 12],
  [3, 6, 9, 16],
  [10, 13, 14, 17],
];
const target = 9;
let r = 0, c = m[0].length - 1;
while (r < m.length && c >= 0) {
  if (m[r][c] === target) break;
  if (m[r][c] > target) c--;
  else r++;
}
console.log(r, c);`;

function stairTrace() {
  const t = tracer();
  const m = [[1, 4, 7, 11], [2, 5, 8, 12], [3, 6, 9, 16], [10, 13, 14, 17]];
  const target = 9;
  let r = 0, c = m[0].length - 1;
  t.step(8, "start", "start at the top-right corner: (0, 3)", "From here, moving left gives smaller values and moving down gives bigger values. So each direction has one clear meaning.", { target, r, c, value: m[r][c] });
  while (r < m.length && c >= 0) {
    if (m[r][c] === target) {
      t.step(10, "check", `m[${r}][${c}] = ${m[r][c]} === 9`, "Found it.", { target, r, c, value: m[r][c] });
      break;
    }
    if (m[r][c] > target) {
      t.step(11, "check", `${m[r][c]} > 9`, `Everything below ${m[r][c]} in column ${c} is even bigger, so we can skip the whole column. Move left.`, { target, r, c, value: m[r][c] });
      c--;
      t.step(11, "update", `c = ${c}`, "One column eliminated.", { target, r, c, value: m[r][c] }, "c");
    } else {
      t.step(12, "check", `${m[r][c]} < 9`, `Everything to the left of ${m[r][c]} in row ${r} is even smaller, so we can skip the whole row. Move down.`, { target, r, c, value: m[r][c] });
      r++;
      t.step(12, "update", `r = ${r}`, "One row eliminated.", { target, r, c, value: m[r][c] }, "r");
    }
  }
  t.print(`${r} ${c}`);
  t.step(14, "print", "console.log(r, c)", "Each step removes one row or one column. So there are at most rows + cols steps: O(m + n).", { r, c });
  return t.steps;
}

export default function DsaLessonTwentyFivePage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">An array of rows</h2>
      <p>
        A <strong>matrix</strong> (also called a grid) is a table of values arranged in rows and columns, like a
        spreadsheet. In JavaScript it is an array whose items are also arrays, one array for each row.{" "}
        <code>m[r][c]</code> means &ldquo;go to row r, then take column c&rdquo;. It is the nested-loop grid from
        Lesson 6, now holding data. Images, game boards, maps and spreadsheets are all matrices. Part 13 will treat
        grids as graphs (points joined by links).
      </p>

      <h2 id="create">Creating a matrix (and the shared-row trap)</h2>
      <CodeBlock lang="js" code={createCode} />
      <Callout kind="warn" label="Always create rows with Array.from">
        <p className="mb-0">
          <code>new Array(rows).fill(row)</code> puts a reference to the same row in every slot (Lesson 8 explained
          references: a reference is an arrow that points to one object, not a copy of it). So there is only one row,
          shown many times. Changing one cell then changes that column in every row. Use{" "}
          <code>Array.from({"{ length: rows }"}, () =&gt; new Array(cols).fill(0))</code> instead. It runs the function once
          for each row, so every row is a new array.
        </p>
      </Callout>

      <h2 id="loop">Looping: rows, columns, diagonals, neighbours</h2>
      <CodeBlock lang="js" code={loopCode} />
      <p>
        The <strong>direction array</strong> <code>DIRS</code> is a small list of steps: each pair is how much to change
        the row and the column. It is worth learning by heart. It turns &ldquo;check up, down, left and right&rdquo;
        into one short loop. The <strong>bounds check</strong> (the <code>if</code> that tests the new position is
        inside the grid) stops you from reading outside the grid. Reading outside is the most common matrix bug. You will
        use this pattern in every grid problem in Part 13.
      </p>

      <h2 id="sums">Row and column sums</h2>
      <CodeBlock lang="js" code={sumsCode} />
      <p>
        Visiting every cell once takes O(rows × cols) time. This is the number of cells, which is the size of the
        input. So it is linear time for a matrix.
      </p>

      <h2 id="transpose">Transpose and rotate by 90°</h2>
      <p>
        The <strong>transpose</strong> of a matrix turns its rows into columns: <code>t[c][r] = m[r][c]</code>. To
        rotate a square matrix 90° clockwise <em>in place</em> (using the same matrix, with no second one), transpose it
        and then reverse each row:
      </p>
      <DryRun
        title="rotating [[1, 2, 3], [4, 5, 6], [7, 8, 9]] clockwise"
        cols={["Step", "Row 0", "Row 1", "Row 2"]}
        rows={[
          ["start", "1 2 3", "4 5 6", "7 8 9"],
          ["transpose", "1 4 7", "2 5 8", "3 6 9"],
          ["reverse each row", "7 4 1", "8 5 2", "9 6 3"],
        ]}
        highlight={2}
        note="For anticlockwise, reverse each row first and then transpose. Another way is to transpose and then reverse the order of the rows."
      />
      <CodeBlock lang="js" code={rotateCode} />

      <h2 id="spiral">Spiral order with four boundaries</h2>
      <p>
        Reading a matrix in a spiral means: right along the top, down the right side, left along the bottom, up the
        left side, then repeat on the inside. This tests whether you handle boundaries carefully. Keep four boundaries
        (top, bottom, left, right). After you read a side, move that boundary one step inwards:
      </p>
      <CodeBlock lang="js" code={spiralCode} />
      <p>
        The two <code>if</code> checks matter when the matrix is not square. After you read the top row and the right
        column, what is left may be a single row or a single column. Without the checks, you would read it twice.
      </p>

      <h2 id="zeroes">Set matrix zeroes</h2>
      <p>
        The task: if a cell is 0, set its whole row and column to 0. If you write zeros while you are still scanning,
        the new zeros look like original zeros and spread too far. So do it in two passes. First scan and remember which
        rows and columns to clear. Then write the zeros:
      </p>
      <CodeBlock lang="js" code={zeroesCode} />
      <p>
        This takes O(rows × cols) time and O(rows + cols) extra space. A common follow-up asks for O(1) extra space
        (a fixed amount, however big the matrix is). The idea is to use the first row and first column of the matrix
        itself as the markers (Practice question 5).
      </p>

      <h2 id="search">Searching a sorted matrix</h2>
      <p>There are two common kinds of &ldquo;sorted matrix&rdquo;. They need different searches:</p>
      <ul>
        <li>
          <strong>Fully sorted</strong> (each row is sorted, and each row starts after the previous one ends): this is
          one sorted list folded into rows. Use <strong>binary search</strong> (a search that checks the middle value
          and throws away half of the range each time) over the indices 0 … rows × cols − 1. Turn an index into a
          cell with <code>row = Math.floor(i / cols)</code> and <code>col = i % cols</code>. It takes
          O(log(rows × cols)) time.
        </li>
        <li>
          <strong>Rows and columns sorted separately</strong> (every row is sorted, and every column is sorted, but rows
          do not follow each other): start at the top-right corner and walk like a staircase. It takes O(rows + cols)
          time.
        </li>
      </ul>
      <CodeBlock lang="js" code={flatCode} />
      <p>Lesson 28 explains binary search in full. Here, look only at how the index is converted to a row and a column.</p>

      <h2 id="trace">Traced: the staircase search</h2>
      <CodeTrace
        code={stairCode}
        steps={stairTrace()}
        caption="At the top-right corner, a value that is too big rules out its whole column. A value that is too small rules out its whole row."
      />

      <h2 id="practice">Practice questions</h2>
      <p>Draw a small matrix on paper for every question. Most matrix bugs are index mistakes, and a drawing shows them at once.</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write the safe way to create a rows × cols grid, and explain the <code>fill</code> trap.</>,
          <>Write the four-direction neighbour loop with its bounds check.</>,
          <>Rotate a 3 × 3 matrix by hand: transpose, then reverse rows.</>,
          <>Explain why the staircase search starts at the top-right corner.</>,
        ]}
      />

      <h2 id="next">Part 4 complete — what&apos;s next</h2>
      <p>
        You now know the main array patterns: read/write pointers, prefix sums, two pointers, fixed and variable
        windows, Kadane&apos;s algorithm and matrix traversal. Together they solve many of the array questions in
        interviews.
      </p>
      <p>
        <strong>Part 5 — Hashing Patterns</strong> goes back to Maps and Sets and uses them to solve problems: Two Sum,
        &ldquo;have I seen this before?&rdquo;, longest consecutive sequence, grouping anagrams and finding the majority
        element.
      </p>
    </DsaLessonPage>
  );
}
