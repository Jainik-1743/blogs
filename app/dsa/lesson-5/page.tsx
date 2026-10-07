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

const lesson = getDsaLesson("lesson-5");

export const metadata: Metadata = {
  title: `Lesson 5 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Repeat while a condition is true" },
  { id: "syntax", label: "The while loop, next to for" },
  { id: "digits", label: "The digit loop: n % 10 and Math.floor(n / 10)" },
  { id: "trace", label: "Traced: the sum of the digits of 472" },
  { id: "build", label: "Building a number: reverse" },
  { id: "infinite", label: "Infinite loops, and how to avoid them" },
  { id: "dowhile", label: "do … while (rarely needed)" },
  { id: "choose", label: "for or while? A simple rule" },
  { id: "practice", label: "Practice questions (10)" },
  { id: "recall", label: "Make it stick" },
];

const sideBySide = `// for: start, check and update all in one line
for (let i = 1; i <= 3; i++) {
  console.log(i);
}

// while: the same loop with the three parts spread out
let i = 1;              // start   (before the loop)
while (i <= 3) {        // check
  console.log(i);
  i++;                  // update  (last line of the body — easy to forget!)
}

/* Output:
1
2
3
1
2
3
*/`;

const digitCode = `let n = 472;
let sum = 0;
while (n > 0) {
  sum += n % 10;
  n = Math.floor(n / 10);
}
console.log(sum);`;

function digitTrace() {
  const t = tracer();
  let n = 472;
  t.step(1, "start", "let n = 472", "The number to take apart.", { n }, "n");
  let sum = 0;
  t.step(2, "start", "let sum = 0", "Accumulator for the answer.", { n, sum }, "sum");
  while (true) {
    if (!(n > 0)) {
      t.step(3, "stop", `CHECK: ${n} > 0 is false`, "Every digit has been removed, so n is 0 and the loop ends. We never had to know that there were 3 digits.", { n, sum });
      break;
    }
    t.step(3, "check", `CHECK: ${n} > 0 is true`, "There are still digits left.", { n, sum });
    const d = n % 10;
    sum += d;
    t.step(4, "run", `sum += ${n} % 10 → +${d} = ${sum}`, `${n} % 10 is ${d}, the last digit. Add it.`, { n, sum }, "sum");
    const old = n;
    n = Math.floor(n / 10);
    t.step(5, "update", `n = floor(${old} / 10) = ${n}`, "Cut off the last digit. This is the update that moves us towards n = 0.", { n, sum }, "n");
  }
  t.print(String(sum));
  t.step(7, "print", "console.log(sum)", "4 + 7 + 2 = 13.", { n, sum });
  return t.steps;
}

const reverse = `let n = 1234;
let rev = 0;
while (n > 0) {
  const digit = n % 10;      // take the last digit
  rev = rev * 10 + digit;    // shift rev left, put the digit on the end
  n = Math.floor(n / 10);    // drop the last digit
}
console.log(rev); // 4321`;

const infinite = `let i = 1;
while (i <= 5) {
  console.log(i);
  // i++ is missing, so i stays 1 and 1 is printed forever. Press Ctrl+C to stop.
}`;

const doWhile = `let n = 0;
let digits = 0;
do {
  digits++;
  n = Math.floor(n / 10);
} while (n > 0);
console.log(digits); // 1  (0 has one digit; a plain while would say 0)`;

export default function DsaLessonFivePage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">Repeat while a condition is true</h2>
      <p>
        A <code>for</code> loop is perfect when you know the range, such as 1 to N or 0 to length − 1.
        But sometimes you only know the <strong>stopping condition</strong>. Examples are &ldquo;keep
        dividing until nothing is left&rdquo;, &ldquo;keep doubling until you pass 1000&rdquo; and
        &ldquo;keep asking until the password is right&rdquo;. For these, use a <code>while</code>{" "}
        loop. A <code>while</code> loop is a loop that repeats its body for as long as a condition
        stays true.
      </p>

      <h2 id="syntax">The while loop, next to for</h2>
      <CodeBlock lang="js" code={sideBySide} />
      <p>
        A <code>while</code> loop has only the <strong>check</strong> in its brackets. The start goes
        before the loop. The update goes inside the body, usually as the last line. The order of
        execution from Lesson 4 is the same: check, body, check, body, and so on, until a check
        fails and the loop ends.
      </p>

      <h2 id="digits">The digit loop: n % 10 and Math.floor(n / 10)</h2>
      <p>
        A <strong>digit</strong> is one of the symbols 0 to 9 that make up a number. The number 472 has
        three digits. In Lesson 2 you took the digits off a three-digit number by writing the same two
        lines three times. A <code>while</code> loop can do it for a number of <em>any</em> length,
        because it keeps going until there are no digits left:
      </p>
      <Callout kind="ok" label="The digit loop: learn this shape by heart">
        <pre className="my-1">
          <code>{`while (n > 0) {
  const digit = n % 10;      // the last digit
  // ...use digit...
  n = Math.floor(n / 10);    // remove the last digit
}`}</code>
        </pre>
      </Callout>
      <p>
        Counting digits, adding digits, reversing a number, checking a palindrome number and finding
        Armstrong numbers all use this same loop. Only the line in the middle is different.
      </p>

      <h2 id="trace">Traced: the sum of the digits of 472</h2>
      <CodeTrace
        code={digitCode}
        steps={digitTrace()}
        caption="n loses one digit per iteration: 472 → 47 → 4 → 0. The loop stops when nothing is left."
      />
      <DryRun
        title="sum of digits of 472"
        cols={["n at check", "n > 0?", "n % 10", "sum after", "n after"]}
        rows={[
          ["472", "true", "2", "2", "47"],
          ["47", "true", "7", "9", "4"],
          ["4", "true", "4", "13", "0"],
          ["0", "false", "—", "13", "(loop ends)"],
        ]}
        highlight={3}
      />

      <h2 id="build">Building a number: reverse</h2>
      <p>
        Taking digits apart is half the skill. The other half is putting them back together. To
        reverse a number, you build a new number, <code>rev</code>, one digit at a time.{" "}
        <code>rev * 10</code> moves every digit of <code>rev</code> one place to the left. This makes
        an empty place at the end. Then <code>+ digit</code> fills that place.
      </p>
      <CodeBlock lang="js" code={reverse} />
      <DryRun
        title="reverse 1234"
        cols={["n", "digit = n % 10", "rev = rev * 10 + digit", "n after"]}
        rows={[
          ["1234", "4", "0 × 10 + 4 = 4", "123"],
          ["123", "3", "4 × 10 + 3 = 43", "12"],
          ["12", "2", "43 × 10 + 2 = 432", "1"],
          ["1", "1", "432 × 10 + 1 = 4321", "0"],
        ]}
        highlight={3}
      />

      <h2 id="infinite">Infinite loops, and how to avoid them</h2>
      <p>
        A <code>while</code> loop stops only when its condition becomes false. If nothing in the body
        moves towards that, the loop runs forever. This is called an <strong>infinite loop</strong>:
      </p>
      <CodeBlock lang="js" code={infinite} />
      <p>Before running any <code>while</code> loop, ask one question:</p>
      <Callout kind="warn" label="Ask: what line makes the condition false eventually?">
        <p className="mb-0">
          Find that line. In the digit loop it is <code>n = Math.floor(n / 10)</code>. The number n
          becomes smaller in every iteration, so it must reach 0. If you cannot point at such a line,
          you probably have an infinite loop. If one is already running, press <strong>Ctrl+C</strong>{" "}
          in the terminal to stop it.
        </p>
      </Callout>

      <h2 id="dowhile">do … while (rarely needed)</h2>
      <p>
        <code>do {"{ … }"} while (condition)</code> is a loop that runs the body first and checks the
        condition afterwards. So the body always runs at least once. It helps in a case like the one
        below, where the number 0 still has one digit. But you will rarely need it in DSA.
      </p>
      <CodeBlock lang="js" code={doWhile} />

      <h2 id="choose">for or while? A simple rule</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>If you know…</th>
              <th>Use</th>
              <th>Examples</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>the range of values (from … to …)</td><td><code>for</code></td><td>1 to N, every item of an array, every character of a string</td></tr>
            <tr><td>only when to stop</td><td><code>while</code></td><td>until n is 0, until a value passes a limit, two pointers meeting in the middle (Lesson 21)</td></tr>
          </tbody>
        </table>
      </div>
      <p>Anything one loop can do, the other can do too. This rule only helps you pick the one that is easier to read.</p>

      <h2 id="practice">Practice questions</h2>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write the digit loop from memory, and say which line guarantees it ends.</>,
          <>Reverse 905 on paper with a dry-run table. (Answer: 509.)</>,
          <>Rewrite <code>for (let i = 10; i &gt; 0; i -= 3)</code> as a <code>while</code> loop and list the values of i.</>,
        ]}
      />
      <p>Next lesson: loops <em>inside</em> other loops (nested loops), and how to draw patterns with them.</p>
    </DsaLessonPage>
  );
}
