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

const lesson = getDsaLesson("lesson-2");

export const metadata: Metadata = {
  title: `Lesson 2 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "A variable is a labelled box" },
  { id: "let-const", label: "let and const" },
  { id: "names", label: "Naming rules" },
  { id: "types", label: "The five basic data types" },
  { id: "maths", label: "Arithmetic operators" },
  { id: "modulo", label: "% and Math.floor — the two most useful operators" },
  { id: "math", label: "Useful Math functions" },
  { id: "strings", label: "Joining text, and a common + mistake" },
  { id: "convert", label: "Converting between text and numbers" },
  { id: "shorthand", label: "Shorthand operators: += and ++" },
  { id: "swap", label: "Traced: swapping two variables" },
  { id: "practice", label: "Practice questions (8)" },
  { id: "recall", label: "Make it stick" },
];

const boxes = `let age = 21;          // make a box called age, put 21 in it
console.log(age);      // 21

age = 22;              // replace what is in the box (no "let" the second time)
console.log(age);      // 22

const pi = 3.14159;    // a box that can never be given a new value
console.log(pi);       // 3.14159`;

const constError = `const pi = 3.14159;
pi = 3;   // TypeError: Assignment to constant variable.`;

const types = `let count = 7;              // number   (whole or decimal, one type for both)
let price = 99.5;           // number
let name = "Asha";          // string   (text, in quotes)
let isOpen = true;          // boolean  (only true or false)
let score;                  // undefined (made, but nothing put in yet)
let winner = null;          // null     ("empty on purpose")

console.log(typeof count);  // number
console.log(typeof name);   // string
console.log(typeof isOpen); // boolean
console.log(typeof score);  // undefined`;

const maths = `console.log(7 + 2);    // 9
console.log(7 - 2);    // 5
console.log(7 * 2);    // 14
console.log(7 / 2);    // 3.5   (normal division keeps the decimal)
console.log(7 % 2);    // 1     (remainder)
console.log(2 ** 5);   // 32    (power: 2 × 2 × 2 × 2 × 2)
console.log(2 + 3 * 4);   // 14  (* before +, like school maths)
console.log((2 + 3) * 4); // 20  (brackets first)`;

const modulo = `let n = 4729;

console.log(n % 10);             // 9     the LAST digit
console.log(Math.floor(n / 10)); // 472   n WITHOUT its last digit
console.log(n % 100);            // 29    the last two digits

console.log(10 % 2);             // 0     remainder 0 → 10 is even
console.log(7 % 2);              // 1     remainder 1 → 7 is odd
console.log(15 % 5);             // 0     remainder 0 → 15 is divisible by 5

console.log(Math.floor(17 / 5)); // 3     how many whole 5s fit in 17
console.log(17 % 5);             // 2     what is left over`;

const mathFns = `console.log(Math.abs(-7));       // 7     distance from zero
console.log(Math.min(4, 9, 2));  // 2     smallest
console.log(Math.max(4, 9, 2));  // 9     largest
console.log(Math.round(2.5));    // 3     nearest whole number
console.log(Math.floor(2.9));    // 2     round down
console.log(Math.ceil(2.1));     // 3     round up
console.log(Math.trunc(-2.9));   // -2    drop the decimal part
console.log(Math.sqrt(49));      // 7     square root
console.log(Math.pow(2, 10));    // 1024  same as 2 ** 10`;

const convert = `console.log(Number("42"));       // 42    text → number
console.log(Number("4x"));       // NaN   "Not a Number": the text is not a valid number
console.log(parseInt("42px"));   // 42    reads digits from the start, stops at the first non-digit
console.log(String(42));         // 42    number → text
console.log((42).toString(2));   // 101010  the number written in binary
console.log(typeof String(42));  // string`;

const strings = `let first = "Asha";
let city = "Pune";

console.log("Hi " + first);                    // Hi Asha
console.log(first + " lives in " + city);      // Asha lives in Pune
console.log(\`\${first} lives in \${city}\`);     // Asha lives in Pune  (template literal)
console.log(\`2 + 3 = \${2 + 3}\`);              // 2 + 3 = 5`;

const trap = `console.log(5 + 3);      // 8      number + number → add
console.log("5" + 3);    // 53     string + anything → JOIN
console.log(5 + 3 + "5");// 85     left to right: 5 + 3 = 8, then 8 + "5" = "85"
console.log("5" + 3 + 5);// 535    "5" + 3 = "53", then "53" + 5 = "535"
console.log("5" - 3);    // 2      - only means subtract, so "5" becomes 5
console.log(Number("42") + 1); // 43  convert text to a number first`;

const shorthand = `let total = 10;
total += 5;    // same as total = total + 5   → 15
total -= 3;    // total = total - 3           → 12
total *= 2;    // total = total * 2           → 24
total++;       // total = total + 1           → 25
total--;       // total = total - 1           → 24
console.log(total); // 24`;

const swapCode = `let a = 5;
let b = 9;
let temp = a;
a = b;
b = temp;
console.log(a, b);`;

function swapTrace() {
  const t = tracer();
  let a: number | undefined, b: number | undefined, temp: number | undefined;
  t.step(1, "start", "Start", "No boxes exist yet.");
  a = 5;
  t.step(1, "run", "let a = 5", "A box called a now holds 5.", { a }, "a");
  b = 9;
  t.step(2, "run", "let b = 9", "A box called b now holds 9.", { a, b }, "b");
  temp = a;
  t.step(3, "run", "let temp = a", "Copy a's value (5) into a spare box. Without this, the 5 would be lost on the next line.", { a, b, temp }, "temp");
  a = b;
  t.step(4, "run", "a = b", "a gets b's value. a's old 5 is overwritten — but temp still remembers it.", { a, b, temp }, "a");
  b = temp;
  t.step(5, "run", "b = temp", "b gets the 5 back from temp. Swapped.", { a, b, temp }, "b");
  t.print(`${a} ${b}`);
  t.step(6, "print", "console.log(a, b)", "Prints 9 5.", { a, b, temp });
  return t.steps;
}

export default function DsaLessonTwoPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">A variable is a labelled box</h2>
      <p>
        Programs need to remember things: a score, a name, a running total. A{" "}
        <strong>variable</strong> is a box with a label on it. You put a value in the box, and
        later you use the label to get the value back — or replace it with a new one.
      </p>
      <p>
        In every DSA problem you will keep a few variables: the answer so far, a counter, the
        position you are looking at. Tracking what is in each box, line by line, is the dry run.
      </p>

      <h2 id="let-const">let and const</h2>
      <CodeBlock lang="js" code={boxes} />
      <ul>
        <li>
          <code>let</code> makes a box whose value you can change later. Write <code>let</code>{" "}
          only the first time; afterwards just use the name.
        </li>
        <li>
          <code>const</code> makes a box that keeps its value forever. Trying to put something new
          in it is an error:
        </li>
      </ul>
      <CodeBlock lang="js" code={constError} />
      <Callout kind="note" label="Which one to use">
        <p className="mb-0">
          Use <code>const</code> by default, and <code>let</code> when the value must change —
          counters, totals, the current position. You may see <code>var</code> in old code; it is
          the old way and has surprising rules, so don&apos;t use it.
        </p>
      </Callout>

      <h2 id="names">Naming rules</h2>
      <ul>
        <li>Letters, digits, <code>_</code> and <code>$</code> only; cannot start with a digit (<code>2nd</code> is invalid, <code>second</code> is fine).</li>
        <li>Case-sensitive: <code>total</code> and <code>Total</code> are different boxes.</li>
        <li>No reserved words: you cannot name a variable <code>let</code>, <code>if</code> or <code>for</code>.</li>
        <li>
          The JavaScript style is <strong>camelCase</strong>: <code>maxValue</code>,{" "}
          <code>studentCount</code>. Short names like <code>i</code>, <code>n</code>,{" "}
          <code>sum</code> are normal in DSA code.
        </li>
      </ul>

      <h2 id="types">The five basic data types</h2>
      <p>Every value has a type. <code>typeof</code> tells you which:</p>
      <CodeBlock lang="js" code={types} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Examples</th>
              <th>Used in DSA for</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>number</code></td><td><code>0</code>, <code>-4</code>, <code>3.14</code></td><td>Counts, sums, positions, answers</td></tr>
            <tr><td><code>string</code></td><td><code>&quot;abc&quot;</code>, <code>&apos;hello&apos;</code></td><td>Text problems: palindromes, anagrams</td></tr>
            <tr><td><code>boolean</code></td><td><code>true</code>, <code>false</code></td><td>Yes/no answers: &ldquo;is it sorted?&rdquo;, &ldquo;found it?&rdquo;</td></tr>
            <tr><td><code>undefined</code></td><td>a box with nothing put in it</td><td>Spotting bugs: you read something that was never set</td></tr>
            <tr><td><code>null</code></td><td><code>null</code></td><td>&ldquo;No answer&rdquo; on purpose, e.g. &ldquo;no repeating character&rdquo;</td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="maths">Arithmetic operators</h2>
      <CodeBlock lang="js" code={maths} />
      <p>
        The order is the one from school: brackets, then <code>**</code>, then <code>*</code>{" "}
        <code>/</code> <code>%</code>, then <code>+</code> <code>-</code>, and left to right
        otherwise. When in doubt, add brackets — they cost nothing and make your intent clear.
      </p>

      <h2 id="modulo">% and Math.floor — the two most useful operators</h2>
      <p>
        <code>%</code> (modulo) gives the <strong>remainder</strong> of a division.{" "}
        <code>Math.floor(x)</code> rounds <em>down</em> to a whole number, so{" "}
        <code>Math.floor(a / b)</code> is &ldquo;how many whole times b fits in a&rdquo;. Together
        they answer three questions you will meet over and over:
      </p>
      <CodeBlock lang="js" code={modulo} />
      <DryRun
        title="17 ÷ 5 like at school"
        cols={["Question", "Expression", "Answer"]}
        rows={[
          ["How many whole 5s fit in 17?", "Math.floor(17 / 5)", "3"],
          ["What is left over?", "17 % 5", "2"],
          ["Check: 3 × 5 + 2", "15 + 2", "17 ✓"],
        ]}
      />
      <Callout kind="ok" label="Remember these three lines">
        <ul className="mb-0">
          <li><code>n % 2 === 0</code> → n is even (Lesson 3).</li>
          <li><code>n % 10</code> → the last digit of n.</li>
          <li><code>Math.floor(n / 10)</code> → n with its last digit removed (Lesson 5 loops this).</li>
        </ul>
      </Callout>

      <h2 id="math">Useful Math functions</h2>
      <p>
        JavaScript has a built-in <code>Math</code> object with the functions you need most often.
        These appear constantly in DSA answers:
      </p>
      <CodeBlock lang="js" code={mathFns} />
      <Callout kind="note" label="floor vs trunc for negative numbers">
        <p className="mb-0">
          <code>Math.floor(-2.9)</code> is −3 (it always rounds <em>down</em>), while{" "}
          <code>Math.trunc(-2.9)</code> is −2 (it just removes the decimal part). For positive numbers
          they give the same answer.
        </p>
      </Callout>

      <h2 id="strings">Joining text, and a common + mistake</h2>
      <p>
        <code>+</code> between strings <strong>joins</strong> them. The modern way to build text
        is a <strong>template literal</strong>: backticks <code>`…`</code> with{" "}
        <code>{"${…}"}</code> placeholders for values.
      </p>
      <CodeBlock lang="js" code={strings} />
      <p>
        Be careful: if <em>either</em> side of <code>+</code> is a string, JavaScript joins instead of
        adding. It works left to right, one <code>+</code> at a time:
      </p>
      <CodeBlock lang="js" code={trap} />
      <Callout kind="warn" label="Why this matters in real code">
        <p className="mb-0">
          Input from a form, a file, or a test harness often arrives as <em>text</em>.{" "}
          <code>&quot;5&quot; + 3</code> silently gives <code>&quot;53&quot;</code> and every later
          step is wrong. Convert with <code>Number(x)</code> first.
        </p>
      </Callout>

      <h2 id="convert">Converting between text and numbers</h2>
      <p>
        Input often arrives as text, and output often needs to be text. These conversions come up
        all the time:
      </p>
      <CodeBlock lang="js" code={convert} />
      <p>
        <code>NaN</code> means &ldquo;Not a Number&rdquo;. It appears when a conversion or calculation
        fails. Check for it with <code>Number.isNaN(x)</code>.
      </p>

      <h2 id="shorthand">Shorthand operators: += and ++</h2>
      <p>Updating a variable from its own value is so common it has short forms. You will use <code>+=</code> and <code>++</code> in nearly every loop.</p>
      <CodeBlock lang="js" code={shorthand} />

      <h2 id="swap">Traced: swapping two variables</h2>
      <p>
        A common first question: swap the values in <code>a</code> and <code>b</code>. The obvious attempt{" "}
        <code>a = b; b = a;</code> fails — after the first line both boxes hold 9 and the 5 is gone.
        You need a spare box. Step through it:
      </p>
      <CodeTrace
        code={swapCode}
        steps={swapTrace()}
        caption="The highlighted row in Variables is the box that just changed. temp exists only to remember a's old value."
      />

      <h2 id="practice">Practice questions</h2>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write from memory: how to get the last digit of <code>n</code>, and <code>n</code> without its last digit.</>,
          <>Without running it, say what <code>1 + 2 + &quot;3&quot;</code> and <code>&quot;1&quot; + 2 + 3</code> print — and why they differ.</>,
          <>Swap two variables using a temp variable, then explain why <code>a = b; b = a;</code> fails.</>,
        ]}
      />
      <p>
        Next lesson: making decisions with <code>if</code> / <code>else</code> — even or odd,
        largest of three, and other common interview questions.
      </p>
    </DsaLessonPage>
  );
}
