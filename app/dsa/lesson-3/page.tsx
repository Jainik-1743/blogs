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
  t.step(4, "check", "Is marks >= 75?", "82 >= 75 is true, so enter this block.", { marks });
  t.print("B");
  t.step(5, "print", "Print B", "Inside the block that matched.", { marks });
  t.step(6, "run", "Skip the else", "One block of the chain already ran, so every remaining else if / else is skipped without being checked.", { marks });
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
        So far every line runs, from top to bottom. Real programs also need to <em>decide</em>. For
        example: if it is raining, take an umbrella. Otherwise, do not. A <strong>condition</strong>{" "}
        is a question whose answer is <code>true</code> or <code>false</code>. Those two values are
        called <strong>booleans</strong>. The <code>if</code> statement runs a <strong>block</strong>{" "}
        (a group of lines inside curly braces) only when the condition is <code>true</code>.
      </p>
      <p>
        Almost every DSA solution has decisions inside it. Examples are &ldquo;is this number bigger
        than my best so far?&rdquo;, &ldquo;have I found the target?&rdquo; and &ldquo;is this
        character a vowel?&rdquo;. This lesson teaches how to write them.
      </p>

      <h2 id="compare">Comparisons give true or false</h2>
      <p>
        A <strong>comparison operator</strong> compares two values and gives <code>true</code> or{" "}
        <code>false</code>. The operators are <code>&gt;</code> (greater than), <code>&lt;</code>{" "}
        (less than), <code>&gt;=</code>, <code>&lt;=</code>, <code>===</code> (equal) and{" "}
        <code>!==</code> (not equal).
      </p>
      <CodeBlock lang="js" code={compare} />
      <Callout kind="warn" label="Always use === (three equals)">
        <p className="mb-0">
          <code>==</code> (two equals signs) changes the type of a value before it compares. So{" "}
          <code>7 == &quot;7&quot;</code> is <code>true</code>. This is a common cause of bugs that
          are hard to see. <code>===</code> compares the value <em>and</em> the type. Use{" "}
          <code>===</code> and <code>!==</code> every time.
        </p>
      </Callout>

      <h2 id="if">if and else</h2>
      <CodeBlock lang="js" code={ifElse} />
      <ul>
        <li>The condition goes in round brackets <code>( )</code>. The code to run goes in curly braces <code>{"{ }"}</code>.</li>
        <li><code>else</code> is optional. Its block runs when the condition is <code>false</code>.</li>
        <li>When there is an <code>else</code>, exactly one of the two blocks runs. Never both, and never neither.</li>
        <li>Indent the code inside the braces (move it to the right). The computer does not need this, but people who read your code, including interviewers, do.</li>
      </ul>

      <h2 id="ladder">else if — choosing one of many</h2>
      <p>
        When there are more than two possibilities, chain them with <code>else if</code>. The
        computer checks the conditions from the top. It runs <strong>only the first block whose
        condition is true</strong>, then it skips the rest of the chain.
      </p>
      <CodeBlock lang="js" code={ladder} />
      <Callout kind="ok" label="Order matters">
        <p className="mb-0">
          82 is also &ge; 50, but &ldquo;C&rdquo; is never printed, because the chain already stopped at
          &ldquo;B&rdquo;. So check the <strong>strictest</strong> condition first (&ge; 90, then
          &ge; 75, then &ge; 50). If you reverse the order, everyone above 50 gets a C.
        </p>
      </Callout>

      <h2 id="logic">&amp;&amp;, || and ! — combining conditions</h2>
      <p>
        <strong>Logical operators</strong> join or change conditions. <code>&amp;&amp;</code> means
        AND, <code>||</code> means OR, and <code>!</code> means NOT.
      </p>
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
        The <strong>ternary operator</strong> is an operator with three parts. It chooses one of two
        values: <code>condition ? valueIfTrue : valueIfFalse</code>. If the condition is true, you
        get the first value. If not, you get the second. Use it for simple choices. For anything
        with more than one step, a normal <code>if</code> is clearer.
      </p>
      <CodeBlock lang="js" code={ternary} />

      <h2 id="truthy">Truthy and falsy values</h2>
      <p>
        A condition does not have to be a comparison. JavaScript can treat <em>any</em> value as true or
        false inside a condition. A value that counts as false is called <strong>falsy</strong>. A
        value that counts as true is called <strong>truthy</strong>. These six common values are
        falsy. Every other value is truthy. (There are two rare extra falsy values, <code>-0</code>{" "}
        and <code>0n</code>, which you will not need now.)
      </p>
      <CodeBlock lang="js" code={truthy} />
      <Callout kind="warn" label="Be careful with 0">
        <p className="mb-0">
          <code>if (count)</code> is false when <code>count</code> is <code>0</code>. Sometimes 0 is a
          real value in your problem, such as an index or a score. Then write the full comparison:{" "}
          <code>if (count !== undefined)</code> or <code>if (index &gt;= 0)</code>.
        </p>
      </Callout>

      <h2 id="switch">switch — matching one value against many</h2>
      <p>
        A <code>switch</code> statement compares <strong>one</strong> value against a list of exact
        options (a day number, a command, a menu choice). Each option is a <code>case</code>. It is
        easier to read than a long <code>else if</code> chain.
      </p>
      <CodeBlock lang="js" code={switchCode} />
      <ul>
        <li>JavaScript compares the value with each <code>case</code> using <code>===</code>.</li>
        <li>
          <code>break</code> ends the switch. Without it, the code <em>continues into the next
          case</em>. This is called falling through.
        </li>
        <li><code>default</code> runs when no case matches. It works like a final <code>else</code>.</li>
      </ul>
      <p>Falling through is useful when several values share the same result:</p>
      <CodeBlock lang="js" code={fallThrough} />
      <Callout kind="note" label="switch or if?">
        <p className="mb-0">
          Use <code>switch</code> for exact matches against a list of values. Use{" "}
          <code>if / else if</code> for ranges (like <code>marks &gt;= 90</code>) and for conditions
          that combine several checks.
        </p>
      </Callout>

      <h2 id="trace">Traced: a grading program</h2>
      <p>Step through this program. It turns marks into a grade.</p>
      <CodeTrace
        code={gradeCode}
        steps={gradeTrace()}
        caption="Watch the checks. Line 2 is false, so its block is skipped. Line 4 is true, so its block runs. The else is never even checked."
      />
      <p>Now try it in your head with <code>marks = 95</code> and <code>marks = 40</code>. Which lines run each time?</p>
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
          <strong>One equals sign in a condition.</strong> <code>=</code> assigns a value,{" "}
          <code>===</code> compares two values. This code has a serious bug:
          <CodeBlock lang="js" code={mistakeAssign} />
        </li>
        <li>
          <strong>Wrong order in an else-if chain.</strong> A broad condition placed first matches
          values that were meant for later branches (see above).
        </li>
        <li>
          <strong>Chaining comparisons like maths.</strong> <code>1 &lt; x &lt; 5</code> does not
          mean &ldquo;x is between 1 and 5&rdquo;. JavaScript first works out <code>1 &lt; x</code>,
          which gives <code>true</code> or <code>false</code>, and then compares that result with 5.
          Write <code>x &gt; 1 &amp;&amp; x &lt; 5</code> instead.
        </li>
        <li>
          <strong>Separate ifs instead of else if.</strong> With three separate <code>if</code>{" "}
          statements, all three are checked, and more than one can run. An <code>else if</code>{" "}
          chain runs at most one block.
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
        Next lesson is the most important one in Part 1: the <code>for</code> loop (code that repeats
        a block many times). We trace it step by step until the pattern is clear.
      </p>
    </DsaLessonPage>
  );
}
