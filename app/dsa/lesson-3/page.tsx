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

const lesson = getDsaLesson("lesson-3");

export const metadata: Metadata = {
  title: `Lesson 3 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Making decisions in code" },
  { id: "compare", label: "Comparisons give true or false" },
  { id: "if", label: "if and else" },
  { id: "ladder", label: "else if — choosing one of many" },
  { id: "logic", label: "&&, || and ! — combining conditions" },
  { id: "ternary", label: "The one-line if: ? :" },
  { id: "truthy", label: "Truthy and falsy values" },
  { id: "switch", label: "switch — matching one value against many" },
  { id: "trace", label: "Traced: a grading program" },
  { id: "mistakes", label: "Four common mistakes" },
  { id: "practice", label: "Practice questions (9)" },
  { id: "recall", label: "Make it stick" },
];

const compare = `console.log(5 > 3);      // true
console.log(5 < 3);      // false
console.log(5 >= 5);     // true    (greater than OR equal)
console.log(4 <= 3);     // false
console.log(7 === 7);    // true    (equal: same value AND same type)
console.log(7 === "7");  // false   (number vs string)
console.log(7 !== 8);    // true    (not equal)`;

const ifElse = `const temperature = 31;

if (temperature > 30) {
  console.log("It's hot — drink water");
} else {
  console.log("Nice weather");
}
console.log("Have a good day");

/* Output:
It's hot — drink water
Have a good day
*/`;

const ladder = `const marks = 82;

if (marks >= 90) {
  console.log("A");
} else if (marks >= 75) {
  console.log("B");          // ← this one runs
} else if (marks >= 50) {
  console.log("C");          // skipped, even though 82 >= 50 is also true
} else {
  console.log("F");
}

/* Output:
B
*/`;

const logic = `const age = 20;
const hasTicket = true;

console.log(age >= 18 && hasTicket);  // true   both must be true
console.log(age < 13 || age > 60);    // false  at least one must be true
console.log(!hasTicket);              // false  ! flips true ↔ false

const n = 15;
if (n % 3 === 0 && n % 5 === 0) {
  console.log("divisible by both");   // divisible by both
}`;

const ternary = `const n = 7;
const kind = n % 2 === 0 ? "even" : "odd";
console.log(kind); // odd`;

const truthy = `// These six values count as false inside a condition ("falsy"):
//   false, 0, "" (empty text), null, undefined, NaN
// Every other value counts as true ("truthy") — including "0", "false" and [].

const name = "";
if (name) {
  console.log("Hello, " + name);
} else {
  console.log("No name given"); // No name given
}

const count = 0;
console.log(count ? "has items" : "empty"); // empty`;

const switchCode = `const day = 3;
let name;

switch (day) {
  case 1:
    name = "Monday";
    break;
  case 2:
    name = "Tuesday";
    break;
  case 3:
    name = "Wednesday";   // ← day is 3, so this case runs
    break;                // ← break leaves the switch
  default:
    name = "Unknown";     // runs when no case matches
}

console.log(name); // Wednesday`;

const fallThrough = `const month = 4;
let days;

switch (month) {
  case 4:
  case 6:
  case 9:
  case 11:
    days = 30;            // several cases can share one block
    break;
  case 2:
    days = 28;
    break;
  default:
    days = 31;
}

console.log(days); // 30`;

const gradeCode = `const marks = 82;
if (marks >= 90) {
  console.log("A");
} else if (marks >= 75) {
  console.log("B");
} else {
  console.log("C or below");
}
console.log("done");`;

function gradeTrace() {
  const t = tracer();
  const marks = 82;
  t.step(1, "run", "const marks = 82", "Store the input.", { marks }, "marks");
  t.step(2, "check", "Is marks >= 90?", "82 >= 90 is false, so the block on line 3 is skipped. Move to the next else if.", { marks });
  t.step(4, "check", "Is marks >= 75?", "82 >= 75 is true — enter this block.", { marks });
  t.print("B");
  t.step(5, "print", "Print B", "Inside the block that matched.", { marks });
  t.step(6, "run", "Skip the else", "One block of the ladder already ran, so every remaining else if / else is skipped without even being checked.", { marks });
  t.print("done");
  t.step(9, "print", "Continue after the whole if", "Code after the ladder always runs.", { marks });
  return t.steps;
}

const mistakeAssign = `let n = 5;
if (n = 10) {            // ✗ ONE equals sign: this SETS n to 10
  console.log("ten?");   // runs, because 10 counts as true
}
console.log(n);          // 10 — the bug changed n!

/* Output:
ten?
10
*/`;

export default function DsaLessonThreePage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">Making decisions in code</h2>
      <p>
        So far every line runs, top to bottom. Real programs need to <em>decide</em>: if it is
        raining, take an umbrella; otherwise, don&apos;t. A <strong>condition</strong> is a question
        whose answer is <code>true</code> or <code>false</code>, and <code>if</code> runs a block of
        code only when the answer is <code>true</code>.
      </p>
      <p>
        Almost every DSA solution has decisions inside it: &ldquo;is this number bigger than my
        best so far?&rdquo;, &ldquo;have I found the target?&rdquo;, &ldquo;is this character a
        vowel?&rdquo;. This lesson is where those come from.
      </p>

      <h2 id="compare">Comparisons give true or false</h2>
      <CodeBlock lang="js" code={compare} />
      <Callout kind="warn" label="Always use === (three equals)">
        <p className="mb-0">
          <code>==</code> (two) converts types before comparing, so <code>7 == &quot;7&quot;</code>{" "}
          is <code>true</code> — a common source of hidden bugs. <code>===</code> compares value{" "}
          <em>and</em> type. Use <code>===</code> and <code>!==</code> every time.
        </p>
      </Callout>

      <h2 id="if">if and else</h2>
      <CodeBlock lang="js" code={ifElse} />
      <ul>
        <li>The condition goes in round brackets <code>( )</code>; the code to run goes in curly braces <code>{"{ }"}</code>.</li>
        <li><code>else</code> is optional. It runs when the condition is <code>false</code>.</li>
        <li>Exactly one of the two blocks runs — never both, never neither.</li>
        <li>Indent the code inside braces. The computer does not need it, but people reading your code (including interviewers) do.</li>
      </ul>

      <h2 id="ladder">else if — choosing one of many</h2>
      <p>
        When there are more than two possibilities, chain them. The computer checks from the top
        and runs <strong>only the first block whose condition is true</strong>, then jumps past the
        whole chain.
      </p>
      <CodeBlock lang="js" code={ladder} />
      <Callout kind="ok" label="Order matters">
        <p className="mb-0">
          82 is also &ge; 50, but &ldquo;C&rdquo; never prints because the ladder already stopped at
          &ldquo;B&rdquo;. That is why you check the <strong>strictest</strong> condition first
          (&ge; 90 before &ge; 75 before &ge; 50). Reverse the order and everyone above 50 gets a C.
        </p>
      </Callout>

      <h2 id="logic">&amp;&amp;, || and ! — combining conditions</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Operator</th>
              <th>Read it as</th>
              <th>True when</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>a &amp;&amp; b</code></td><td>a AND b</td><td>both are true</td></tr>
            <tr><td><code>a || b</code></td><td>a OR b</td><td>at least one is true</td></tr>
            <tr><td><code>!a</code></td><td>NOT a</td><td>a is false</td></tr>
          </tbody>
        </table>
      </div>
      <CodeBlock lang="js" code={logic} />

      <h2 id="ternary">The one-line if: ? :</h2>
      <p>
        When you only need to <em>choose a value</em>, <code>condition ? valueIfTrue :
        valueIfFalse</code> does it in one line. Use it for simple choices; for anything with more
        than one step, a normal <code>if</code> is clearer.
      </p>
      <CodeBlock lang="js" code={ternary} />

      <h2 id="truthy">Truthy and falsy values</h2>
      <p>
        A condition does not have to be a comparison. JavaScript can turn <em>any</em> value into true or
        false. Six values count as <strong>false</strong>; everything else counts as{" "}
        <strong>true</strong>.
      </p>
      <CodeBlock lang="js" code={truthy} />
      <Callout kind="warn" label="Be careful with 0">
        <p className="mb-0">
          <code>if (count)</code> is false when <code>count</code> is <code>0</code>. If 0 is a valid
          value in your problem (an index, a score), write the comparison in full:{" "}
          <code>if (count !== undefined)</code> or <code>if (index &gt;= 0)</code>.
        </p>
      </Callout>

      <h2 id="switch">switch — matching one value against many</h2>
      <p>
        When you compare <strong>one</strong> value against a list of exact options (a day number, a
        command, a menu choice), <code>switch</code> is easier to read than a long{" "}
        <code>else if</code> chain.
      </p>
      <CodeBlock lang="js" code={switchCode} />
      <ul>
        <li>JavaScript compares the value with each <code>case</code> using <code>===</code>.</li>
        <li>
          <code>break</code> ends the switch. Without it, the code <em>continues into the next
          case</em> (this is called falling through).
        </li>
        <li><code>default</code> runs when no case matches, like a final <code>else</code>.</li>
      </ul>
      <p>Falling through is useful when several values share the same result:</p>
      <CodeBlock lang="js" code={fallThrough} />
      <Callout kind="note" label="switch or if?">
        <p className="mb-0">
          Use <code>switch</code> for exact matches against a list of values. Use{" "}
          <code>if / else if</code> for ranges (<code>marks &gt;= 90</code>) and for conditions that
          combine several checks.
        </p>
      </Callout>

      <h2 id="trace">Traced: a grading program</h2>
      <CodeTrace
        code={gradeCode}
        steps={gradeTrace()}
        caption="Watch the checks: line 2 is false and skipped, line 4 is true and runs, and the else is never even examined."
      />
      <p>Try it in your head with <code>marks = 95</code> and <code>marks = 40</code>: which lines run each time?</p>
      <DryRun
        title="three inputs through the same ladder"
        cols={["marks", "marks >= 90?", "marks >= 75?", "Prints"]}
        rows={[
          ["95", "true", "(not checked)", "A"],
          ["82", "false", "true", "B"],
          ["40", "false", "false", "C or below"],
        ]}
      />

      <h2 id="mistakes">Four common mistakes</h2>
      <ol>
        <li>
          <strong>One equals sign in a condition.</strong> <code>=</code> assigns,{" "}
          <code>===</code> compares. This code has a serious bug:
          <CodeBlock lang="js" code={mistakeAssign} />
        </li>
        <li>
          <strong>Wrong order in a ladder</strong> — a broad condition placed first matches
          values meant for later branches (see above).
        </li>
        <li>
          <strong>Chaining comparisons like maths.</strong> <code>1 &lt; x &lt; 5</code> does not
          mean &ldquo;x is between 1 and 5&rdquo;. Write <code>x &gt; 1 &amp;&amp; x &lt; 5</code>.
        </li>
        <li>
          <strong>Separate ifs instead of else if.</strong> Three separate <code>if</code>s are all
          checked and several can run; an <code>else if</code> chain runs at most one.
        </li>
      </ol>

      <h2 id="practice">Practice questions</h2>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write the leap-year rule as a single condition from memory.</>,
          <>Explain why FizzBuzz must check &ldquo;divisible by both&rdquo; first.</>,
          <>Find the bug in <code>if (x = 0)</code>, and say what happens to <code>x</code>.</>,
        ]}
      />
      <p>
        Next lesson — the most important one in Part 1: the <code>for</code> loop, traced step by
        step until the pattern is clear.
      </p>
    </DsaLessonPage>
  );
}
