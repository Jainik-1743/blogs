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

const lesson = getDsaLesson("lesson-6");

export const metadata: Metadata = {
  title: `Lesson 6 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "A loop inside a loop is a grid" },
  { id: "clock", label: "The clock picture" },
  { id: "trace", label: "Traced: every (row, column) pair" },
  { id: "rows", label: "Building one row, then printing it" },
  { id: "recipe", label: "The three-question recipe for any pattern" },
  { id: "count", label: "How many times does the inside run?" },
  { id: "practice", label: "Practice: 11 patterns and grids" },
  { id: "recall", label: "Make it stick" },
];

const gridCode = `for (let i = 1; i <= 2; i++) {
  for (let j = 1; j <= 3; j++) {
    console.log(i, j);
  }
}`;

function gridTrace() {
  const t = tracer();
  for (let i = 1; i <= 2; i++) {
    t.step(1, "check", `Outer: row i = ${i}`, i === 1 ? "The outer loop starts row 1." : "The outer loop moves to the next row. The inner loop will now start again from j = 1.", { i }, "i");
    for (let j = 1; j <= 3; j++) {
      t.step(2, "check", `Inner: column j = ${j}`, j === 1 ? "The inner loop starts again at j = 1 in every row." : "The inner loop moves one column right.", { i, j }, "j");
      t.print(`${i} ${j}`);
      t.step(3, "print", `Print ${i} ${j}`, `Row ${i}, column ${j}.`, { i, j });
    }
    t.step(2, "stop", "Inner check: j = 4 <= 3 is false", `The inner loop is finished for row ${i}. The computer goes back to the outer loop's update.`, { i, j: 4 });
  }
  t.step(1, "stop", "Outer check: i = 3 <= 2 is false", "Both loops are done: 2 rows × 3 columns = 6 prints.", { i: 3 });
  return t.steps;
}

const rowBuild = `const N = 3;
for (let i = 1; i <= N; i++) {      // one iteration per ROW
  let row = "";                     // a fresh, empty row each time
  for (let j = 1; j <= N; j++) {    // one iteration per COLUMN
    row += "*";                     // add one star to this row
  }
  console.log(row);                 // print the finished row — AFTER the inner loop
}

/* Output:
***
***
***
*/`;

const pairs = `let count = 0;
for (let i = 1; i <= 4; i++) {
  for (let j = 1; j <= 4; j++) {
    count++;
  }
}
console.log(count); // 16  (4 rows × 4 columns)`;

export default function DsaLessonSixPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">A loop inside a loop is a grid</h2>
      <p>
        A <strong>nested loop</strong> is a loop that has another loop inside its body. The outer loop
        is the first one. The inner loop is the one inside it. One rule makes nested loops easy to
        predict: <strong>for every single iteration of the outer loop, the inner loop runs
        completely, from start to finish.</strong>
      </p>
      <p>
        Picture a grid. The outer loop picks a <strong>row</strong>. The inner loop walks along every{" "}
        <strong>column</strong> of that row. When the row is done, the outer loop moves down one row,
        and the inner loop starts again from the first column. This is why the outer variable is
        usually called <code>i</code> (row) and the inner one <code>j</code> (column).
      </p>
      <p>
        Patterns (stars, numbers, triangles) are a common way to practise this. Companies often ask
        them in campus and first-round interviews, because they test whether you can control two
        loops at once. After this lesson, comparing every pair of items in an array (Lessons 8 and
        21) will feel natural.
      </p>

      <h2 id="clock">The clock picture</h2>
      <p>
        A clock works like a nested loop. The hour hand is the outer loop. The minute hand is the inner
        loop. For every <em>one</em> step of the hour hand, the minute hand goes all the way round
        (60 steps) and then starts again from 0.
      </p>

      <h2 id="trace">Traced: every (row, column) pair</h2>
      <CodeTrace
        code={gridCode}
        steps={gridTrace()}
        caption="Watch j restart at 1 every time i changes. The inner loop finishes completely before i moves on."
      />
      <DryRun
        title="2 rows × 3 columns"
        cols={["i (row)", "j values in this row", "Printed"]}
        rows={[
          ["1", "1, 2, 3", "1 1 · 1 2 · 1 3"],
          ["2", "1, 2, 3", "2 1 · 2 2 · 2 3"],
        ]}
        note="Total prints: 2 × 3 = 6."
      />

      <h2 id="rows">Building one row, then printing it</h2>
      <p>
        <code>console.log</code> always ends the line, so you cannot print stars one by one on the same
        line. Do this instead. Start each row with an <strong>empty string</strong> (a string with no
        characters, written as <code>&quot;&quot;</code>). Let the inner loop add characters to it.
        Print the row when it is complete.
      </p>
      <CodeBlock lang="js" code={rowBuild} />
      <Callout kind="warn" label="Where each line goes is the whole skill">
        <ul className="mb-0">
          <li><code>let row = &quot;&quot;</code> goes <strong>inside the outer loop, before the inner one</strong>. Then every row starts empty.</li>
          <li><code>console.log(row)</code> goes <strong>inside the outer loop, after the inner one</strong>. Then it prints once for each row.</li>
          <li>If you put the print inside the inner loop, you get one line for every star instead.</li>
        </ul>
      </Callout>

      <h2 id="recipe">The three-question recipe for any pattern</h2>
      <ol>
        <li><strong>How many rows?</strong> That is the outer loop: <code>i</code> from 1 to N.</li>
        <li>
          <strong>In row i, what is printed, and how many of it?</strong> Write it down for rows 1, 2,
          3 and 4. Then look for a rule that uses <em>i</em>, such as &ldquo;i stars&rdquo;,
          &ldquo;N − i + 1 stars&rdquo; or &ldquo;the numbers 1 to i&rdquo;.
        </li>
        <li><strong>Build it</strong>: the inner loop (or loops) follows that rule. Then print the row.</li>
      </ol>
      <DryRun
        title="discovering the rule for a right triangle (N = 4)"
        cols={["Row i", "Looks like", "Stars in the row"]}
        rows={[
          ["1", "*", "1"],
          ["2", "**", "2"],
          ["3", "***", "3"],
          ["4", "****", "4"],
        ]}
        note="Stars = i. So the inner loop is for (let j = 1; j <= i; j++). Its stopping point depends on the outer variable."
      />

      <h2 id="count">How many times does the inside run?</h2>
      <CodeBlock lang="js" code={pairs} />
      <p>
        A loop of N inside a loop of N runs its body N × N times. For N = 1,000 that is a million
        iterations. Keep this in mind. In Lesson 12 it is called <strong>O(n²)</strong> (&ldquo;order
        n squared&rdquo;), a way to say that the work grows with the square of the input size. A big
        part of DSA is learning tricks to avoid doing all N × N steps.
      </p>

      <h2 id="practice">Practice: 11 patterns and grids</h2>
      <p>For each one, answer the three recipe questions on paper first. Most examples use N = 4.</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Say the rule out loud: &ldquo;for every iteration of the outer loop, the inner loop runs…&rdquo;</>,
          <>Without looking, write the pyramid for N = 3 and its table of spaces and stars.</>,
          <>Explain where <code>let row = &quot;&quot;</code> and <code>console.log(row)</code> must go, and what goes wrong if either moves.</>,
        ]}
      />
      <p>
        Next lesson: <strong>functions</strong>. A function packs code into a named block so you can
        reuse it. It is also the format of every interview answer.
      </p>
    </DsaLessonPage>
  );
}
