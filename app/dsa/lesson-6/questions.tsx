import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";

/** Lesson 6 practice questions. Every question shows each way to solve it. All examples use N = 4. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Solid square"
        level="Easy"
        examples={[{ input: "N = 4", output: "****\n****\n****\n****", why: "4 rows, and every row has 4 stars." }]}
        hints={[<>How many rows? How many stars in each row — does that number change from row to row?</>, <>Use the outer loop for the rows. The inner loop adds N stars to a row string. Then print the row.</>]}
        approaches={[
          {
            name: "Nested loops",
            idea: <p>The outer loop makes N rows. For each row, the inner loop adds N stars, then the row is printed.</p>,
            code: `const N = 4;
for (let i = 1; i <= N; i++) {
  let row = "";
  for (let j = 1; j <= N; j++) {
    row += "*";
  }
  console.log(row);
}

/* Output:
****
****
****
****
*/`,
            explain: <p>The inner count (N) does not depend on <code>i</code>, so every row is the same. This is the template (the basic shape to copy) for every pattern below.</p>,
          },
          {
            name: "Build the row once with repeat",
            idea: <p>Every row is identical, so make it once with <code>&quot;*&quot;.repeat(N)</code> and print it N times.</p>,
            code: `const N = 4;
const row = "*".repeat(N);
for (let i = 1; i <= N; i++) {
  console.log(row);
}

/* Output:
****
****
****
****
*/`,
            explain: <p><code>text.repeat(k)</code> is a string method (a function that belongs to text) that returns the text repeated k times. Building the row once avoids doing the same work in every row.</p>,
          },
        ]}
        compare={<p>Write Approach 1 while you are learning. Interviewers who ask pattern questions want to see the two loops. Use <code>repeat</code> in everyday code.</p>}
      >
        <p>Print an N × N square of stars.</p>
      </Problem>

      <Problem
        n={2}
        title="Right-angled triangle"
        level="Easy"
        examples={[{ input: "N = 4", output: "*\n**\n***\n****", why: "Row 1 has 1 star, row 2 has 2 stars, and so on. Row 4 has 4 stars." }]}
        hints={[<>Write down the number of stars in rows 1, 2, 3, 4. How does it relate to the row number <code>i</code>?</>, <>Row <code>i</code> has <code>i</code> stars, so the inner loop runs while <code>j &lt;= i</code>.</>]}
        approaches={[
          {
            name: "Inner loop up to i",
            idea: <p>This is the same as the square, with one change: the inner loop stops at <code>i</code> instead of N.</p>,
            code: `const N = 4;
for (let i = 1; i <= N; i++) {
  let row = "";
  for (let j = 1; j <= i; j++) {
    row += "*";
  }
  console.log(row);
}

/* Output:
*
**
***
****
*/`,
            explain: <p>The key to every triangle is this: the stopping point of the inner loop depends on the outer variable.</p>,
          },
          {
            name: "One loop, a growing row",
            idea: <p>Each row is the previous row plus one star. Keep the row from one iteration to the next, and add one star each time.</p>,
            code: `const N = 4;
let row = "";
for (let i = 1; i <= N; i++) {
  row += "*";          // one more star than last time
  console.log(row);
}

/* Output:
*
**
***
****
*/`,
            explain: <p>Here <code>row</code> is declared <em>outside</em> the loop, so it keeps its stars from the previous iteration. Only one loop is needed.</p>,
          },
          {
            name: "repeat(i)",
            idea: <p>Row <code>i</code> is simply <code>&quot;*&quot;.repeat(i)</code>.</p>,
            code: `const N = 4;
for (let i = 1; i <= N; i++) {
  console.log("*".repeat(i));
}

/* Output:
*
**
***
****
*/`,
            explain: <p>This is the shortest version. The inner loop is hidden inside <code>repeat</code>.</p>,
          },
        ]}
        compare={<p>Approach 1 is the one to understand. Approach 2 shows a useful idea. When each row extends the previous one, keep the previous row instead of building it again.</p>}
      >
        <p>Row i has i stars.</p>
      </Problem>

      <Problem
        n={3}
        title="Number triangle"
        level="Easy"
        examples={[{ input: "N = 4", output: "1\n1 2\n1 2 3\n1 2 3 4", why: "Row i shows the numbers from 1 to i, separated by spaces." }]}
        hints={[<>The shape is the same as question 2. What do you print instead of a star?</>, <>Print the column number <code>j</code>. Remove the extra space at the end with <code>trimEnd()</code>.</>]}
        approaches={[
          {
            name: "Print the column number j",
            idea: <p>Use the same loops as the triangle, but add <code>j</code> and a space instead of a star.</p>,
            code: `const N = 4;
for (let i = 1; i <= N; i++) {
  let row = "";
  for (let j = 1; j <= i; j++) {
    row += j + " ";
  }
  console.log(row.trimEnd());   // remove the space after the last number
}

/* Output:
1
1 2
1 2 3
1 2 3 4
*/`,
            explain: <p><code>trimEnd()</code> removes spaces at the end of the text. Some online judges (websites that check your answer automatically) compare output character by character. For them, a space at the end of a line can make a correct answer fail.</p>,
          },
          {
            name: "One loop, a growing row",
            idea: <p>Each row is the previous row with the next number added.</p>,
            code: `const N = 4;
let row = "";
for (let i = 1; i <= N; i++) {
  row += (i === 1 ? "" : " ") + i;   // add a space before every number except the first
  console.log(row);
}

/* Output:
1
1 2
1 2 3
1 2 3 4
*/`,
            explain: <p>Adding the space <em>before</em> each number (except the first) avoids a space at the end, so you do not need <code>trimEnd</code>.</p>,
          },
        ]}
        compare={<p>Both are correct. Approach 1 matches the general recipe, and it is easier to change for other patterns.</p>}
      >
        <p>Row i shows the numbers 1 to i.</p>
      </Problem>

      <Problem
        n={4}
        title="Repeated row number"
        level="Easy"
        examples={[{ input: "N = 4", output: "1\n2 2\n3 3 3\n4 4 4 4", why: "Row i shows the number i, written i times." }]}
        hints={[<>Compare with question 3. Which variable do you print now: the row <code>i</code> or the column <code>j</code>?</>]}
        approaches={[
          {
            name: "Print the row number i",
            idea: <p>This is question 3 with one letter changed. Print <code>i</code> instead of <code>j</code>.</p>,
            code: `const N = 4;
for (let i = 1; i <= N; i++) {
  let row = "";
  for (let j = 1; j <= i; j++) {
    row += i + " ";
  }
  console.log(row.trimEnd());
}

/* Output:
1
2 2
3 3 3
4 4 4 4
*/`,
            explain: <p>Pattern questions train you to say whether a value depends on the row or on the column.</p>,
          },
          {
            name: "repeat a small piece",
            idea: <p>Repeat the small piece of text <code>&quot;i &quot;</code> (the number i and a space) i times. Then remove the final space.</p>,
            code: `const N = 4;
for (let i = 1; i <= N; i++) {
  console.log((i + " ").repeat(i).trimEnd());
}

/* Output:
1
2 2
3 3 3
4 4 4 4
*/`,
            explain: <p><code>(i + &quot; &quot;)</code> is text like <code>&quot;3 &quot;</code>. Repeating it 3 times gives <code>&quot;3 3 3 &quot;</code>.</p>,
          },
        ]}
      >
        <p>Row i shows the number i, i times.</p>
      </Problem>

      <Problem
        n={5}
        title="Inverted triangle"
        level="Easy"
        examples={[{ input: "N = 4", output: "****\n***\n**\n*", why: "Row 1 has 4 stars and each row after it has one fewer." }]}
        hints={[<>Make a small table: row 1 has 4 stars, row 2 has 3, row 3 has 2 and row 4 has 1. What formula using N and i gives these numbers?</>, <>Stars in row i = N − i + 1. Or count i down from N to 1.</>]}
        approaches={[
          {
            name: "Formula N − i + 1",
            idea: <p>Let the rows count up, and give row <code>i</code> exactly N − i + 1 stars.</p>,
            code: `const N = 4;
for (let i = 1; i <= N; i++) {
  let row = "";
  for (let j = 1; j <= N - i + 1; j++) {
    row += "*";
  }
  console.log(row);
}

/* Output:
****
***
**
*
*/`,
            explain: <DryRun title="stars per row, N = 4" cols={["i", "N − i + 1"]} rows={[["1", "4"], ["2", "3"], ["3", "2"], ["4", "1"]]} />,
          },
          {
            name: "Count the rows down",
            idea: <p>Let <code>i</code> go from N down to 1 and print <code>i</code> stars.</p>,
            code: `const N = 4;
for (let i = N; i >= 1; i--) {
  let row = "";
  for (let j = 1; j <= i; j++) {
    row += "*";
  }
  console.log(row);
}

/* Output:
****
***
**
*
*/`,
            explain: <p>This is the triangle from question 2, with the outer loop reversed. It is often the easiest way to turn a pattern upside down.</p>,
          },
        ]}
        compare={<p>Both are correct. Pick the rule that you can explain most easily. Approach 2 is usually quicker to write.</p>}
      >
        <p>Row 1 has N stars, and each row after it has one star fewer.</p>
      </Problem>

      <Problem
        n={6}
        title="Centred pyramid"
        level="Medium"
        examples={[{ input: "N = 4", output: "   *\n  ***\n *****\n*******", why: "Row i has N − i spaces, then 2i − 1 stars: 3+1, 2+3, 1+5, 0+7." }]}
        hints={[
          <>Each row has two parts: some spaces, then some stars.</>,
          <>Fill in a table for rows 1 to 4 with the number of spaces and stars. Find a formula that uses <code>i</code> for each column of the table.</>,
          <>Spaces = N − i. Stars = 2i − 1. Use two inner loops, one after the other.</>,
        ]}
        approaches={[
          {
            name: "Two inner loops: spaces, then stars",
            idea: <p>For each row, first add N − i spaces, then 2i − 1 stars.</p>,
            code: `const N = 4;
for (let i = 1; i <= N; i++) {
  let row = "";
  for (let s = 1; s <= N - i; s++) row += " ";       // spaces
  for (let k = 1; k <= 2 * i - 1; k++) row += "*";   // stars
  console.log(row);
}

/* Output:
   *
  ***
 *****
*******
*/`,
            explain: <DryRun title="pyramid, N = 4" cols={["i", "spaces = N − i", "stars = 2i − 1"]} rows={[["1", "3", "1"], ["2", "2", "3"], ["3", "1", "5"], ["4", "0", "7"]]} />,
          },
          {
            name: "Visit every cell and decide",
            idea: <p>The pyramid fits in a grid that is 2N − 1 columns wide. A cell gets a star if its distance from the centre column is less than <code>i</code>. Otherwise it gets a space.</p>,
            code: `const N = 4;
const width = 2 * N - 1;
const centre = N;                      // columns are numbered 1..width
for (let i = 1; i <= N; i++) {
  let row = "";
  for (let j = 1; j <= width; j++) {
    row += Math.abs(j - centre) < i ? "*" : " ";
  }
  console.log(row.trimEnd());
}

/* Output:
   *
  ***
 *****
*******
*/`,
            explain: <p><code>Math.abs(j - centre)</code> is how far column j is from the centre (<code>Math.abs</code> removes a minus sign, so the distance is never negative). In row 1, only the centre itself (distance 0) gets a star. In row 4, every column with a distance of up to 3 gets one.</p>,
          },
          {
            name: "repeat",
            idea: <p>Build each row from two repeated pieces of text: spaces and stars.</p>,
            code: `const N = 4;
for (let i = 1; i <= N; i++) {
  console.log(" ".repeat(N - i) + "*".repeat(2 * i - 1));
}

/* Output:
   *
  ***
 *****
*******
*/`,
            explain: <p>These are the same formulas as in Approach 1, but you do not write the inner loops yourself.</p>,
          },
        ]}
        compare={<p>Approach 1 is the standard answer. Approach 2 is a powerful general technique. For any shape, ask: &ldquo;for cell (i, j), what belongs here?&rdquo;</p>}
      >
        <p>Print a pyramid of stars, with each row centred.</p>
      </Problem>

      <Problem
        n={7}
        title="Hollow square"
        level="Medium"
        examples={[{ input: "N = 4", output: "****\n*  *\n*  *\n****", why: "Stars only on the border: the first and last row, and the first and last column." }]}
        hints={[<>Visit every cell of the N × N grid.</>, <>A cell is on the border if it is in the first or last row, or in the first or last column. Print a star there and a space everywhere else.</>]}
        approaches={[
          {
            name: "Decide for every cell",
            idea: <p>Loop over every (row, column) cell and print a star only on the border.</p>,
            code: `const N = 4;
for (let i = 1; i <= N; i++) {
  let row = "";
  for (let j = 1; j <= N; j++) {
    const onBorder = i === 1 || i === N || j === 1 || j === N;
    row += onBorder ? "*" : " ";
  }
  console.log(row);
}

/* Output:
****
*  *
*  *
****
*/`,
            explain: <p>This &ldquo;what belongs in cell (i, j)?&rdquo; approach works for every pattern. You will use it for matrices (grids of numbers) in Lesson 25.</p>,
          },
          {
            name: "Build the two kinds of row",
            idea: <p>There are only two kinds of row: a full row of stars, and a row with a star at each end and spaces in between.</p>,
            code: `const N = 4;
const full = "*".repeat(N);
const middle = N === 1 ? "*" : "*" + " ".repeat(N - 2) + "*";
for (let i = 1; i <= N; i++) {
  console.log(i === 1 || i === N ? full : middle);
}

/* Output:
****
*  *
*  *
****
*/`,
            explain: <p>Each kind of row is built once. The check for <code>N === 1</code> handles an edge case (an unusual input). With N = 1, <code>N - 2</code> would be −1, and <code>repeat</code> would throw an error.</p>,
          },
        ]}
        compare={<p>Approach 1 is the general method, and it handles N = 1 by itself. Approach 2 is faster to run, but you must think about the edge case.</p>}
      >
        <p>Print the border of an N × N square, with spaces inside.</p>
      </Problem>

      <Problem
        n={8}
        title="Floyd's triangle"
        level="Easy"
        examples={[{ input: "N = 4", output: "1\n2 3\n4 5 6\n7 8 9 10", why: "The numbers keep counting from row to row: row 2 continues where row 1 stopped." }]}
        hints={[<>The shape is the right triangle. The numbers do not start again in each row.</>, <>Keep one counter that is declared outside both loops. Add 1 to it after every number you print.</>]}
        approaches={[
          {
            name: "A counter outside both loops",
            idea: <p>Print the counter in every cell. Increase it after each number.</p>,
            code: `const N = 4;
let num = 1;                       // lives outside both loops
for (let i = 1; i <= N; i++) {
  let row = "";
  for (let j = 1; j <= i; j++) {
    row += num + " ";
    num++;
  }
  console.log(row.trimEnd());
}

/* Output:
1
2 3
4 5 6
7 8 9 10
*/`,
            explain: <p>If <code>num</code> were declared inside the outer loop, it would go back to 1 in every row. The place where you declare a variable decides how long it keeps its value.</p>,
          },
          {
            name: "Calculate the first number of each row",
            idea: <p>Before row i there are 1 + 2 + … + (i − 1) = i(i − 1)/2 numbers. So row i starts at i(i − 1)/2 + 1.</p>,
            code: `const N = 4;
for (let i = 1; i <= N; i++) {
  const start = (i * (i - 1)) / 2 + 1;
  let row = "";
  for (let j = 0; j < i; j++) {
    row += start + j + " ";
  }
  console.log(row.trimEnd());
}

/* Output:
1
2 3
4 5 6
7 8 9 10
*/`,
            explain: <p>Row 4 starts at 4 × 3 / 2 + 1 = 7. This version can print any single row without working out the rows before it.</p>,
          },
        ]}
        compare={<p>Approach 1 is the simplest. Approach 2 uses the sum formula from Lesson 4. It is useful if you need only one row.</p>}
      >
        <p>Fill a right triangle with consecutive numbers (1, 2, 3, and so on) starting at 1.</p>
      </Problem>

      <Problem
        n={9}
        title="0-1 triangle"
        level="Medium"
        examples={[{ input: "N = 4", output: "1\n0 1\n1 0 1\n0 1 0 1", why: "The values alternate between 1 and 0. A cell holds 1 when its row number plus its column number is even." }]}
        hints={[<>Write the row number and the column number for a few cells and add them. When is the value 1?</>, <>Value = 1 if <code>(i + j) % 2 === 0</code>, otherwise 0.</>]}
        approaches={[
          {
            name: "Formula from (i + j)",
            idea: <p>Cell (i, j) holds 1 when i + j is even and 0 when it is odd.</p>,
            code: `const N = 4;
for (let i = 1; i <= N; i++) {
  let row = "";
  for (let j = 1; j <= i; j++) {
    row += ((i + j) % 2 === 0 ? 1 : 0) + " ";
  }
  console.log(row.trimEnd());
}

/* Output:
1
0 1
1 0 1
0 1 0 1
*/`,
            explain: <p>Cell (1,1): 1 + 1 = 2, which is even, so the value is 1. Cell (2,1): 3 is odd, so the value is 0. Cell (2,2): 4 is even, so the value is 1. It is the same rule that colours a chessboard.</p>,
          },
          {
            name: "Start value per row, then flip",
            idea: <p>Odd rows start with 1 and even rows start with 0. After each number, flip the value (1 becomes 0, and 0 becomes 1).</p>,
            code: `const N = 4;
for (let i = 1; i <= N; i++) {
  let value = i % 2 === 1 ? 1 : 0;
  let row = "";
  for (let j = 1; j <= i; j++) {
    row += value + " ";
    value = 1 - value;          // flip
  }
  console.log(row.trimEnd());
}

/* Output:
1
0 1
1 0 1
0 1 0 1
*/`,
            explain: <p><code>1 - value</code> turns 1 into 0 and 0 into 1. The code follows the pattern in the same way as you would describe it in words.</p>,
          },
        ]}
        compare={<p>Both are correct. Approach 1 shows the habit of looking for a formula that uses (i, j). Approach 2 is easier to find by looking at the output.</p>}
      >
        <p>Print a triangle of alternating 1s and 0s, as in the example.</p>
      </Problem>

      <Problem
        n={10}
        title="Count the pairs"
        level="Medium"
        examples={[{ input: "N = 4", output: "6", why: "The pairs are (1,2) (1,3) (1,4) (2,3) (2,4) (3,4)." }]}
        hints={[<>For each first number i, which second numbers j are allowed?</>, <>Start the inner loop at <code>i + 1</code>. Then j is always bigger than i, and no pair is counted twice.</>]}
        approaches={[
          {
            name: "Nested loops, inner starts at i + 1",
            idea: <p>For each i, count every j from i + 1 to N.</p>,
            code: `function countPairs(N) {
  let count = 0;
  for (let i = 1; i <= N; i++) {
    for (let j = i + 1; j <= N; j++) {
      count++;
    }
  }
  return count;
}

console.log(countPairs(4)); // 6
console.log(countPairs(5)); // 10`,
            explain: <p>This is the shape of every brute-force &ldquo;compare every pair&rdquo; solution. Brute force means trying every possibility. An example is the first approach to Two Sum (Lesson 26).</p>,
          },
          {
            name: "Formula N × (N − 1) / 2",
            idea: <p>Number 1 pairs with N − 1 others, number 2 with N − 2 others, and so on. The total is (N − 1) + … + 1 = N(N − 1)/2.</p>,
            code: `function countPairs(N) {
  return (N * (N - 1)) / 2;
}

console.log(countPairs(4)); // 6
console.log(countPairs(5)); // 10`,
            explain: <p>This is the sum formula from Lesson 4 again. The count grows like N², which is a hint that comparing every pair becomes very slow for large N.</p>,
          },
        ]}
        compare={<p>If you only need the count, use the formula. If you need to do something with each pair, you need the loops. This is why Part 4 teaches ways to avoid checking every pair.</p>}
      >
        <p>How many pairs (i, j) are there with 1 ≤ i &lt; j ≤ N?</p>
      </Problem>

      <Problem
        n={11}
        title="Pascal's triangle"
        level="Medium"
        examples={[{ input: "N = 5", output: "1\n1 1\n1 2 1\n1 3 3 1\n1 4 6 4 1", why: "Each row starts and ends with 1. Every number in the middle is the sum of the two numbers above it, for example 3 = 1 + 2." }]}
        hints={[
          <>Each row can be built from the row above it.</>,
          <>Keep the previous row in a list. The new row is 1, then the sums of neighbouring pairs from the previous row, then 1 again.</>,
        ]}
        approaches={[
          {
            name: "Build each row from the previous one",
            idea: <p>Keep the previous row as an array (a list). For the new row, add neighbouring pairs from the previous row, and put 1 at both ends.</p>,
            code: `const N = 5;
let prev = [];
for (let i = 0; i < N; i++) {
  const row = [1];
  for (let j = 1; j < i; j++) {
    row.push(prev[j - 1] + prev[j]);    // the two numbers above
  }
  if (i > 0) row.push(1);
  console.log(row.join(" "));
  prev = row;
}

/* Output:
1
1 1
1 2 1
1 3 3 1
1 4 6 4 1
*/`,
            explain: <p>This uses arrays from Lesson 8. <code>push</code> adds an item to the end. <code>prev[j]</code> reads the item at a position. <code>join(&quot; &quot;)</code> turns the row into text. This is LeetCode 118.</p>,
          },
          {
            name: "Calculate each number directly",
            idea: <p>The numbers in row i are &ldquo;i choose 0&rdquo;, &ldquo;i choose 1&rdquo; and so on. &ldquo;i choose k&rdquo; is the number of ways to pick k items from i items. Each number can be worked out from the one before it: next = current × (i − k) / (k + 1).</p>,
            code: `const N = 5;
for (let i = 0; i < N; i++) {
  let value = 1;
  let row = "";
  for (let k = 0; k <= i; k++) {
    row += value + " ";
    value = (value * (i - k)) / (k + 1);
  }
  console.log(row.trimEnd());
}

/* Output:
1
1 1
1 2 1
1 3 3 1
1 4 6 4 1
*/`,
            explain: <p>For row 4 (counting rows from 0, so this is the fifth row): 1, then 1 × 4 / 1 = 4, then 4 × 3 / 2 = 6, then 6 × 2 / 3 = 4, then 4 × 1 / 4 = 1. You do not need to store the previous row.</p>,
          },
        ]}
        compare={<p>Approach 1 is the answer interviewers expect, and it is easier to explain. Approach 2 is a short maths option that needs no extra list.</p>}
      >
        <p>Print the first N rows of Pascal&apos;s triangle.</p>
      </Problem>
    </>
  );
}
