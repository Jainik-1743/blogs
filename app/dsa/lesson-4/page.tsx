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

const lesson = getDsaLesson("lesson-4");

export const metadata: Metadata = {
  title: `Lesson 4 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "why", label: "Why loops exist" },
  { id: "anatomy", label: "The three parts of a for loop" },
  { id: "order", label: "The exact order things happen" },
  { id: "trace1", label: "Traced: printing 1 to 3" },
  { id: "count", label: "How many times will it run?" },
  { id: "variations", label: "Counting down, skipping, starting at 0" },
  { id: "accumulator", label: "The accumulator: adding things up" },
  { id: "trace2", label: "Traced: the sum of 1 to 4" },
  { id: "break", label: "break and continue" },
  { id: "mistakes", label: "Off-by-one and other loop bugs" },
  { id: "recipe", label: "A recipe for writing any loop" },
  { id: "practice", label: "Practice questions (10)" },
  { id: "recall", label: "Make it stick" },
];

const withoutLoop = `console.log(1);
console.log(2);
console.log(3);
console.log(4);
console.log(5);
// ...and for 1 to 1000? 1000 lines. There has to be a better way.`;

const firstLoop = `for (let i = 1; i <= 5; i++) {
  console.log(i);
}

/* Output:
1
2
3
4
5
*/`;

const anatomy = `for (let i = 1;   i <= 5;   i++) {
//   ─────────   ──────   ───
//   1. START    2. CHECK    4. UPDATE
//   runs once   before      after every
//   at the      every       iteration
//   beginning   iteration
  console.log(i);   // 3. BODY — runs only while CHECK is true
}`;

const printCode = `for (let i = 1; i <= 3; i++) {
  console.log(i);
}
console.log("done");`;

function printTrace() {
  const t = tracer();
  let i = 1;
  t.step(1, "start", "START: let i = 1", "Runs exactly once. The loop variable i is created with value 1.", { i }, "i");
  while (true) {
    const ok = i <= 3;
    if (!ok) {
      t.step(1, "stop", `CHECK: ${i} <= 3 is false`, "The condition failed, so the loop ends. The body does NOT run again and i is not updated.", { i });
      break;
    }
    t.step(1, "check", `CHECK: ${i} <= 3 is true`, "The condition passed, so the body runs.", { i });
    t.print(String(i));
    t.step(2, "print", `BODY: console.log(${i})`, `Prints the current value of i: ${i}.`, { i });
    i++;
    t.step(1, "update", `UPDATE: i++ → i is now ${i}`, "After the body, the update runs. Then it goes straight back to CHECK.", { i }, "i");
  }
  t.print("done");
  t.step(4, "print", "After the loop", "The program continues with the first line after the closing brace.", {});
  return t.steps;
}

const variations = `// Count down: start high, check >=, update with --
for (let i = 5; i >= 1; i--) console.log(i);   // 5 4 3 2 1 (one per line)

// Every second number: update with += 2
for (let i = 2; i <= 10; i += 2) console.log(i); // 2 4 6 8 10

// Run exactly n times, counting from 0 — the most common form in DSA
const n = 3;
for (let i = 0; i < n; i++) console.log("hello"); // hello ×3 (i is 0, 1, 2)`;

const sumCode = `let sum = 0;
for (let i = 1; i <= 4; i++) {
  sum = sum + i;
}
console.log(sum);`;

function sumTrace() {
  const t = tracer();
  let sum = 0;
  t.step(1, "start", "let sum = 0", "The accumulator starts empty — 0 is “nothing added yet”. It lives OUTSIDE the loop so it keeps its value between iterations.", { sum }, "sum");
  let i = 1;
  t.step(2, "start", "START: let i = 1", "Create the loop variable.", { sum, i }, "i");
  while (true) {
    if (!(i <= 4)) {
      t.step(2, "stop", `CHECK: ${i} <= 4 is false`, "Loop ends. sum holds the total of 1 + 2 + 3 + 4.", { sum, i });
      break;
    }
    t.step(2, "check", `CHECK: ${i} <= 4 is true`, "Run the body.", { sum, i });
    const before = sum;
    sum = sum + i;
    t.step(3, "run", `sum = ${before} + ${i} = ${sum}`, "Add the current i to the running total.", { sum, i }, "sum");
    i++;
    t.step(2, "update", `UPDATE: i is now ${i}`, "Back to CHECK.", { sum, i }, "i");
  }
  t.print(String(sum));
  t.step(5, "print", "console.log(sum)", "Prints 10.", { sum });
  return t.steps;
}

const breakContinue = `// break: leave the loop immediately
for (let i = 1; i <= 10; i++) {
  if (i === 4) break;
  console.log(i);          // 1 2 3, then the loop stops at 4
}

// continue: skip the rest of THIS iteration, go to the update
for (let i = 1; i <= 5; i++) {
  if (i % 2 === 0) continue;
  console.log(i);          // 1 3 5 — even numbers are skipped
}

/* Output:
1
2
3
1
3
5
*/`;

export default function DsaLessonFourPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="why">Why loops exist</h2>
      <p>Print the numbers from 1 to 5. With what you know so far:</p>
      <CodeBlock lang="js" code={withoutLoop} />
      <p>
        A <strong>loop</strong> says &ldquo;repeat this block, and stop when a condition is no
        longer true&rdquo;. The same output in three lines:
      </p>
      <CodeBlock lang="js" code={firstLoop} />
      <p>
        Change <code>5</code> to <code>1000</code> and it prints a thousand lines — the code stays
        three lines long. Nearly every DSA solution has at least one loop in it, so this lesson is
        the foundation for everything after. Take your time and trace every example.
      </p>

      <h2 id="anatomy">The three parts of a for loop</h2>
      <CodeBlock lang="js" code={anatomy} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Part</th>
              <th>Here</th>
              <th>Job</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>1. Start</td><td><code>let i = 1</code></td><td>Create the loop variable. Runs <strong>once</strong>.</td></tr>
            <tr><td>2. Check</td><td><code>i &lt;= 5</code></td><td>Asked <strong>before every iteration</strong>. True → run the body. False → leave the loop.</td></tr>
            <tr><td>3. Body</td><td><code>console.log(i)</code></td><td>The work to repeat. Can use <code>i</code>.</td></tr>
            <tr><td>4. Update</td><td><code>i++</code></td><td>Runs <strong>after every iteration</strong>, moving <code>i</code> towards the stopping point.</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        The variable is usually called <code>i</code> (for &ldquo;index&rdquo;). It is the loop
        variable: the counter that changes every iteration and decides when the loop stops.
      </p>

      <h2 id="order">The exact order things happen</h2>
      <p>This is the most important part to remember. For <code>for (start; check; update) {"{ body }"}</code>:</p>
      <Callout kind="ok" label="The order of execution">
        <p className="mb-0 font-mono text-[0.95rem]">
          start → check → body → update → check → body → update → check → … → check (false) → exit
        </p>
      </Callout>
      <ul>
        <li>Start happens <strong>once</strong>, before anything else.</li>
        <li>Check happens <strong>one more time than the body</strong> — the final, failing check is what ends the loop.</li>
        <li>Update always comes <strong>after</strong> the body, never before.</li>
      </ul>

      <h2 id="trace1">Traced: printing 1 to 3</h2>
      <p>Press Next and say each step out loud before you see it. Pay attention to the order of check, body and update:</p>
      <CodeTrace
        code={printCode}
        steps={printTrace()}
        caption="Yellow is a check, blue the body printing, violet the update. The loop ends on a check, with i = 4."
      />
      <DryRun
        title="for (let i = 1; i <= 3; i++)"
        cols={["Iteration", "i at check", "i <= 3?", "Prints", "i after update"]}
        rows={[
          ["1", "1", "true", "1", "2"],
          ["2", "2", "true", "2", "3"],
          ["3", "3", "true", "3", "4"],
          ["—", "4", "false", "(loop ends)", "—"],
        ]}
        highlight={3}
        note="Three iterations of the body, four checks. After the loop, i would be 4 — one past the last value printed."
      />

      <h2 id="count">How many times will it run?</h2>
      <p>You will be asked this constantly — and it is how you will later work out Big-O (Lesson 12). Two forms cover almost everything:</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Loop</th>
              <th>i takes the values</th>
              <th>Runs</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>for (let i = 1; i &lt;= n; i++)</code></td><td>1, 2, …, n</td><td><strong>n</strong> times</td></tr>
            <tr><td><code>for (let i = 0; i &lt; n; i++)</code></td><td>0, 1, …, n − 1</td><td><strong>n</strong> times</td></tr>
            <tr><td><code>for (let i = a; i &lt;= b; i++)</code></td><td>a, a + 1, …, b</td><td><strong>b − a + 1</strong> times</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        The second form (start at 0, use <code>&lt;</code>) may look unusual now, but it is the most
        common one in DSA, because arrays and strings number their items from 0 (Lesson 8).
      </p>

      <h2 id="variations">Counting down, skipping, starting at 0</h2>
      <p>Change any of the three parts to change the pattern of values:</p>
      <CodeBlock lang="js" code={variations} />
      <Callout kind="note" label="Short bodies">
        <p className="mb-0">
          When the body is one statement you may leave out the braces, as above. While learning,
          keep the braces — it prevents a common mistake when you add a second line later.
        </p>
      </Callout>

      <h2 id="accumulator">The accumulator: adding things up</h2>
      <p>
        Printing is useful, but most loop problems ask for <strong>one answer</strong> built from
        many steps: a total, a count, a product. The pattern is always the same three moves:
      </p>
      <ol>
        <li>
          <strong>Before the loop</strong>, create a variable for the answer and give it a starting
          value: <code>0</code> for a sum or a count, <code>1</code> for a product.
        </li>
        <li><strong>Inside the loop</strong>, update it with this iteration&apos;s value.</li>
        <li><strong>After the loop</strong>, it holds the answer.</li>
      </ol>
      <p>
        That variable is called an <strong>accumulator</strong>. It must live <em>outside</em> the
        loop — declared inside, it would be reset to 0 on every iteration.
      </p>

      <h2 id="trace2">Traced: the sum of 1 to 4</h2>
      <CodeTrace
        code={sumCode}
        steps={sumTrace()}
        caption="Watch sum grow: 0 → 1 → 3 → 6 → 10. Each iteration adds the current i."
      />
      <DryRun
        title="sum of 1 to 4"
        cols={["i", "sum before", "sum = sum + i", "sum after"]}
        rows={[
          ["1", "0", "0 + 1", "1"],
          ["2", "1", "1 + 2", "3"],
          ["3", "3", "3 + 3", "6"],
          ["4", "6", "6 + 4", "10"],
          ["5", "—", "check fails, loop ends", "10"],
        ]}
        highlight={4}
      />

      <h2 id="break">break and continue</h2>
      <p>
        Two keywords change this normal order. <code>break</code> leaves the loop right now —
        useful once you have found what you were looking for. <code>continue</code> skips the rest
        of this iteration and jumps to the update.
      </p>
      <CodeBlock lang="js" code={breakContinue} />

      <h2 id="mistakes">Off-by-one and other loop bugs</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Bug</th>
              <th>Looks like</th>
              <th>What happens</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Off-by-one</strong></td>
              <td><code>i &lt; 5</code> when you meant <code>i &lt;= 5</code></td>
              <td>Runs one time too few (or too many). The most common loop bug of all — always check the first and last value of i.</td>
            </tr>
            <tr>
              <td>Accumulator inside the loop</td>
              <td><code>for (…) {"{ let sum = 0; sum += i; }"}</code></td>
              <td>sum is reset every iteration; the answer is just the last i.</td>
            </tr>
            <tr>
              <td>Update goes the wrong way</td>
              <td><code>for (let i = 1; i &lt;= 5; i--)</code></td>
              <td>i never reaches 5: an infinite loop. Press Ctrl+C to stop the program.</td>
            </tr>
            <tr>
              <td>Wrong starting value</td>
              <td>Product starting at <code>0</code></td>
              <td>Anything × 0 is 0. Products start at 1.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="recipe">A recipe for writing any loop</h2>
      <ol>
        <li><strong>What values should i take?</strong> Write the first and the last one. That gives the start and the check.</li>
        <li><strong>How does i move?</strong> +1, −1, +2… That is the update.</li>
        <li><strong>What happens on each iteration?</strong> That is the body.</li>
        <li><strong>Do I need an answer at the end?</strong> Then add an accumulator before the loop.</li>
        <li><strong>Dry-run the first two and the last iteration.</strong> Most bugs appear there.</li>
      </ol>

      <h2 id="practice">Practice questions</h2>
      <p>Use the recipe for each one. Write the dry-run table for at least the first three before opening the answers.</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write the order of execution from memory: start → check → body → update → … Where does the loop end?</>,
          <>Without running it: how many times does <code>for (let i = 3; i &lt;= 9; i++)</code> run? And <code>for (let i = 0; i &lt; 9; i += 3)</code>? (7 and 3.)</>,
          <>Write factorial from scratch and dry-run it for n = 4 in a table.</>,
        ]}
      />
      <p>
        Next lesson: the <code>while</code> loop — for when you don&apos;t know in advance how many
        times to repeat — and taking a number apart digit by digit.
      </p>
    </DsaLessonPage>
  );
}
