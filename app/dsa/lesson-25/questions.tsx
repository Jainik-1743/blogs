import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";

/** Lesson 25 practice questions: matrices. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Matrix diagonal sum"
        level="Easy"
        examples={[
          { input: "[[1, 2, 3], [4, 5, 6], [7, 8, 9]]", output: "25", why: "Main diagonal 1 + 5 + 9, other diagonal 3 + 7 (the centre 5 is counted once)." },
          { input: "[[5]]", output: "5", why: "One cell." },
        ]}
        hints={[<>Main diagonal: (i, i). Other diagonal: (i, n − 1 − i). For odd n they share the centre.</>]}
        approaches={[
          {
            name: "One loop over i",
            idea: <p>Add both diagonal cells for each row, skipping the second when it is the same cell.</p>,
            code: `function diagonalSum(mat) {
  const n = mat.length;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += mat[i][i];
    if (i !== n - 1 - i) sum += mat[i][n - 1 - i];
  }
  return sum;
}

console.log(diagonalSum([[1, 2, 3], [4, 5, 6], [7, 8, 9]])); // 25
console.log(diagonalSum([[5]]));                             // 5`,
            explain: <p>O(n) time. Only the diagonal cells are visited, not all n² cells.</p>,
          },
        ]}
        compare={<p>Do not use a double loop with an <code>if</code> to find the diagonals. Use the indices directly. (LeetCode 1572.)</p>}
      >
        <p>Return the sum of both diagonals of a square matrix, counting the centre once.</p>
      </Problem>

      <Problem
        n={2}
        title="Transpose matrix"
        level="Easy"
        examples={[
          { input: "[[1, 2, 3], [4, 5, 6]]", output: "[[1, 4], [2, 5], [3, 6]]", why: "2 × 3 becomes 3 × 2: row r becomes column r." },
        ]}
        hints={[<>The result has <code>cols</code> rows and <code>rows</code> columns. <code>t[c][r] = m[r][c]</code>.</>]}
        approaches={[
          {
            name: "New matrix",
            idea: <p>Create a cols × rows matrix and copy each cell to its swapped position.</p>,
            code: `function transpose(m) {
  const rows = m.length, cols = m[0].length;
  const t = Array.from({ length: cols }, () => new Array(rows));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) t[c][r] = m[r][c];
  return t;
}

console.log(transpose([[1, 2, 3], [4, 5, 6]])); // [ [ 1, 4 ], [ 2, 5 ], [ 3, 6 ] ]`,
            explain: <p>O(rows × cols). A non-square matrix cannot easily be transposed in place, because its shape changes (rows × cols becomes cols × rows).</p>,
          },
          {
            name: "With map",
            idea: <p>Column c of m is row c of the result.</p>,
            code: `const transpose = (m) => m[0].map((_, c) => m.map((row) => row[c]));

console.log(transpose([[1, 2, 3], [4, 5, 6]])); // [ [ 1, 4 ], [ 2, 5 ], [ 3, 6 ] ]`,
            explain: <p>Same cost, but shorter. Make sure you can also write the loop version.</p>,
          },
        ]}
        compare={<p>(LeetCode 867.)</p>}
      >
        <p>Return the transpose of a matrix (rows become columns).</p>
      </Problem>

      <Problem
        n={3}
        title="Rotate image"
        level="Medium"
        examples={[
          { input: "[[1, 2, 3], [4, 5, 6], [7, 8, 9]]", output: "[[7, 4, 1], [8, 5, 2], [9, 6, 3]]", why: "90° clockwise." },
          { input: "[[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]]", output: "[[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]]", why: "The first column read upwards becomes the first row." },
        ]}
        hints={[<>In place: transpose, then reverse each row.</>, <>Where does (r, c) go? To (c, n − 1 − r).</>]}
        approaches={[
          {
            name: "Copy with the index formula",
            idea: <p>Write each value to its new position in a new matrix.</p>,
            code: `function rotate(m) {
  const n = m.length;
  const out = Array.from({ length: n }, () => new Array(n));
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) out[c][n - 1 - r] = m[r][c];
  return out;
}

console.log(rotate([[1, 2, 3], [4, 5, 6], [7, 8, 9]])); // [ [ 7, 4, 1 ], [ 8, 5, 2 ], [ 9, 6, 3 ] ]`,
            explain: <p>O(n²) time and O(n²) extra space. This is not allowed when the question says &ldquo;in place&rdquo;.</p>,
          },
          {
            name: "Transpose + reverse rows (in place)",
            idea: <p>The method from the lesson.</p>,
            code: `function rotate(m) {
  const n = m.length;
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) [m[i][j], m[j][i]] = [m[j][i], m[i][j]];
  for (const row of m) row.reverse();
  return m;
}

console.log(rotate([[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]]));
// [ [ 15, 13, 2, 5 ], [ 14, 3, 4, 1 ], [ 12, 6, 8, 9 ], [ 16, 7, 10, 11 ] ]`,
            explain: <p>O(n²) time, O(1) extra space. The inner loop starts at <code>j = i + 1</code> so that each pair is swapped only once.</p>,
          },
        ]}
        compare={<p>The in-place version is expected. (LeetCode 48.)</p>}
      >
        <p>Rotate an n × n matrix 90° clockwise, in place.</p>
      </Problem>

      <Problem
        n={4}
        title="Spiral matrix"
        level="Medium"
        examples={[
          { input: "[[1, 2, 3], [4, 5, 6], [7, 8, 9]]", output: "[1, 2, 3, 6, 9, 8, 7, 4, 5]", why: "Clockwise from the top-left, moving inwards." },
          { input: "[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]", output: "[1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]", why: "A non-square matrix: the last ring is a single row." },
        ]}
        hints={[<>Four boundaries: top, bottom, left, right. Shrink each after reading its side.</>, <>Check the boundaries again before you read the bottom row and the left column.</>]}
        approaches={[
          {
            name: "Four boundaries",
            idea: <p>The method from the lesson.</p>,
            code: `function spiralOrder(m) {
  const out = [];
  let top = 0, bottom = m.length - 1, left = 0, right = m[0].length - 1;
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) out.push(m[top][c]);
    top++;
    for (let r = top; r <= bottom; r++) out.push(m[r][right]);
    right--;
    if (top <= bottom) {
      for (let c = right; c >= left; c--) out.push(m[bottom][c]);
      bottom--;
    }
    if (left <= right) {
      for (let r = bottom; r >= top; r--) out.push(m[r][left]);
      left++;
    }
  }
  return out;
}

console.log(spiralOrder([[1, 2, 3], [4, 5, 6], [7, 8, 9]]));           // [ 1, 2, 3, 6, 9, 8, 7, 4, 5 ]
console.log(spiralOrder([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]])); // [ 1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7 ]`,
            explain: (
              <DryRun
                title="3 × 4 example, one row per side"
                cols={["Side", "Reads", "Boundary after"]}
                rows={[
                  ["top →", "1 2 3 4", "top = 1"],
                  ["right ↓", "8 12", "right = 2"],
                  ["bottom ←", "11 10 9", "bottom = 1"],
                  ["left ↑", "5", "left = 1"],
                  ["top →", "6 7", "top = 2 (loop ends)"],
                ]}
              />
            ),
          },
        ]}
        compare={<p>O(rows × cols) time. Test with a single row, a single column and a non-square matrix. (LeetCode 54.)</p>}
      >
        <p>Return all values of the matrix in spiral order.</p>
      </Problem>

      <Problem
        n={5}
        title="Set matrix zeroes (O(1) space)"
        level="Medium"
        examples={[
          { input: "[[1, 1, 1], [1, 0, 1], [1, 1, 1]]", output: "[[1, 0, 1], [0, 0, 0], [1, 0, 1]]", why: "The 0 clears row 1 and column 1." },
          { input: "[[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]]", output: "[[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]]", why: "Zeros in the first row clear columns 0 and 3." },
        ]}
        hints={[
          <>The Sets version uses O(rows + cols) extra space. Where else could you store the marks?</>,
          <>Use the first row and first column as markers. But first remember, in two separate flags, whether they contained a 0 themselves.</>,
        ]}
        approaches={[
          {
            name: "Row and column Sets",
            idea: <p>The version from the lesson.</p>,
            code: `function setZeroes(m) {
  const rows = new Set(), cols = new Set();
  m.forEach((row, r) => row.forEach((v, c) => { if (v === 0) { rows.add(r); cols.add(c); } }));
  m.forEach((row, r) => row.forEach((_, c) => { if (rows.has(r) || cols.has(c)) row[c] = 0; }));
  return m;
}

console.log(setZeroes([[1, 1, 1], [1, 0, 1], [1, 1, 1]])); // [ [ 1, 0, 1 ], [ 0, 0, 0 ], [ 1, 0, 1 ] ]`,
            explain: <p>O(rows × cols) time, O(rows + cols) space.</p>,
          },
          {
            name: "First row and column as markers",
            idea: (
              <ol>
                <li>Remember whether row 0 and column 0 contain a zero.</li>
                <li>For every other zero at (r, c), set <code>m[r][0] = 0</code> and <code>m[0][c] = 0</code>.</li>
                <li>Clear inner cells using those marks, then clear row 0 and column 0 if needed.</li>
              </ol>
            ),
            code: `function setZeroes(m) {
  const R = m.length, C = m[0].length;
  const firstRow = m[0].some((v) => v === 0);
  const firstCol = m.some((row) => row[0] === 0);
  for (let r = 1; r < R; r++)
    for (let c = 1; c < C; c++)
      if (m[r][c] === 0) { m[r][0] = 0; m[0][c] = 0; }
  for (let r = 1; r < R; r++)
    for (let c = 1; c < C; c++)
      if (m[r][0] === 0 || m[0][c] === 0) m[r][c] = 0;
  if (firstRow) m[0].fill(0);
  if (firstCol) for (let r = 0; r < R; r++) m[r][0] = 0;
  return m;
}

console.log(setZeroes([[1, 1, 1], [1, 0, 1], [1, 1, 1]]));
// [ [ 1, 0, 1 ], [ 0, 0, 0 ], [ 1, 0, 1 ] ]
console.log(setZeroes([[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]]));
// [ [ 0, 0, 0, 0 ], [ 0, 4, 5, 0 ], [ 0, 3, 1, 0 ] ]`,
            explain: <p>O(1) extra space. The two flags are needed because the marks from other cells overwrite row 0 and column 0.</p>,
          },
        ]}
        compare={<p>Give the Sets version first. The marker version is the follow-up. (LeetCode 73.)</p>}
      >
        <p>If a cell is 0, set its entire row and column to 0, in place.</p>
      </Problem>

      <Problem
        n={6}
        title="Search a fully sorted matrix"
        level="Medium"
        examples={[
          { input: "matrix = [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], target = 3", output: "true", why: "3 is in row 0." },
          { input: "same matrix, target = 13", output: "false", why: "13 would be between 11 and 16, but is not there." },
        ]}
        hints={[<>Each row starts after the previous row ends, so the whole matrix is one sorted list.</>, <>Binary search on index i; read <code>m[Math.floor(i / cols)][i % cols]</code>.</>]}
        approaches={[
          {
            name: "Binary search on a virtual 1-D array",
            idea: <p>Search indices 0 … rows × cols − 1 and convert each index to a cell.</p>,
            code: `function searchMatrix(m, target) {
  const cols = m[0].length;
  let lo = 0, hi = m.length * cols - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const v = m[Math.floor(mid / cols)][mid % cols];
    if (v === target) return true;
    if (v < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return false;
}

const M = [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]];
console.log(searchMatrix(M, 3));  // true
console.log(searchMatrix(M, 13)); // false`,
            explain: <p>O(log(rows × cols)) time. The index conversion is useful in many other problems too.</p>,
          },
        ]}
        compare={<p>(LeetCode 74.)</p>}
      >
        <p>Each row is sorted, and the first value of each row is greater than the last value of the previous row. Return whether <code>target</code> is in the matrix.</p>
      </Problem>

      <Problem
        n={7}
        title="Search a row- and column-sorted matrix"
        level="Medium"
        examples={[
          { input: "the 4 × 4 matrix from the lesson, target = 9", output: "true", why: "Found at (2, 2) in four steps." },
          { input: "the same matrix, target = 20", output: "false", why: "The walk leaves the grid without finding it." },
        ]}
        hints={[<>The 1-D trick does not work: row 1 does not start after row 0 ends.</>, <>Start at the top-right corner.</>]}
        approaches={[
          {
            name: "Staircase from the top-right",
            idea: <p>Too big → move left. Too small → move down.</p>,
            code: `function searchMatrix(m, target) {
  let r = 0, c = m[0].length - 1;
  while (r < m.length && c >= 0) {
    if (m[r][c] === target) return true;
    if (m[r][c] > target) c--;
    else r++;
  }
  return false;
}

const M = [[1, 4, 7, 11], [2, 5, 8, 12], [3, 6, 9, 16], [10, 13, 14, 17]];
console.log(searchMatrix(M, 9));  // true
console.log(searchMatrix(M, 20)); // false`,
            explain: <p>O(rows + cols) time, O(1) extra space. The bottom-left corner works too, with the directions swapped. The top-left and bottom-right corners do not work, because from there both moves go in the same direction (both make the value bigger, or both make it smaller), so you cannot tell which way to go.</p>,
          },
        ]}
        compare={<p>Know which kind of &ldquo;sorted matrix&rdquo; you have before choosing the search. (LeetCode 240.)</p>}
      >
        <p>Each row is sorted left to right and each column is sorted top to bottom. Return whether <code>target</code> is in the matrix.</p>
      </Problem>
    </>
  );
}
