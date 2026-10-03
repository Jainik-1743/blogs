import type { Metadata } from "next";
import Callout from "@/components/Callout";
import CodeTrace from "@/components/dsa/CodeTrace";
import DsaLessonPage from "@/components/dsa/DsaLesson";
import Questions from "./questions";
import Recall from "@/components/dsa/Recall";
import CodeBlock from "@/components/sd/CodeBlock";
import { getDsaLesson } from "@/lib/dsa";
import { tracer } from "@/lib/dsa-trace";

const lesson = getDsaLesson("lesson-7");

export const metadata: Metadata = {
  title: `Lesson 7 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "A function is a machine" },
  { id: "syntax", label: "Defining and calling" },
  { id: "params", label: "Parameters and arguments" },
  { id: "return", label: "return vs console.log" },
  { id: "trace", label: "Traced: jumping into a function and back" },
  { id: "scope", label: "Variables inside stay inside" },
  { id: "early", label: "return ends the function early" },
  { id: "arrow", label: "Arrow functions" },
  { id: "defaults", label: "Default parameter values" },
  { id: "values-refs", label: "Passing values vs passing references" },
  { id: "interview", label: "Why every interview answer is a function" },
  { id: "practice", label: "Practice questions (10)" },
  { id: "recall", label: "Make it stick" },
];

const basic = `function greet(name) {          // define: "here is how to greet someone"
  return "Hello, " + name + "!";
}

console.log(greet("Asha"));     // Hello, Asha!
console.log(greet("Rahul"));    // Hello, Rahul!`;

const params = `function add(a, b) {   // a and b are PARAMETERS: names for the inputs
  return a + b;
}

console.log(add(2, 3));   // 5    2 and 3 are ARGUMENTS: the actual values
console.log(add(10, -4)); // 6
console.log(add(7));      // NaN  b was not given, so it is undefined; 7 + undefined is NaN`;

const returnVsLog = `function doubleLog(n) {
  console.log(n * 2);   // shows the value on screen... and that's all
}

function doubleReturn(n) {
  return n * 2;         // hands the value BACK to whoever called it
}

const x = doubleLog(5);    // prints 10 — but x gets nothing
const y = doubleReturn(5); // prints nothing — y gets 10

console.log(x);  // undefined
console.log(y);  // 10
console.log(doubleReturn(5) + 1); // 11 — a returned value can be used in more maths

/* Output:
10
undefined
10
11
*/`;

const callCode = `function square(x) {
  const result = x * x;
  return result;
}

const a = square(3);
const b = square(4);
console.log(a + b);`;

function callTrace() {
  const t = tracer();
  t.step(1, "start", "Define square", "Defining a function does NOT run it. JavaScript just remembers the recipe and skips to line 6.");
  t.step(6, "run", "Call square(3)", "The call jumps INTO the function. The argument 3 is copied into the parameter x.", {});
  t.step(2, "run", "const result = 3 * 3", "Inside the function, x is 3. result becomes 9.", { x: 3, result: 9 }, "result");
  t.step(3, "run", "return result", "return hands 9 back to line 6 and the function ends. x and result disappear.", { x: 3, result: 9 });
  t.step(6, "update", "a = 9", "Back on line 6: the call is replaced by its returned value.", { a: 9 }, "a");
  t.step(7, "run", "Call square(4)", "A brand-new call. x is now 4 — nothing is left over from the first call.", { a: 9 });
  t.step(2, "run", "const result = 4 * 4", "result becomes 16.", { a: 9, x: 4, result: 16 }, "result");
  t.step(3, "run", "return result", "Hands 16 back to line 7.", { a: 9, x: 4, result: 16 });
  t.step(7, "update", "b = 16", "The call is replaced by 16.", { a: 9, b: 16 }, "b");
  t.print("25");
  t.step(8, "print", "console.log(a + b)", "9 + 16 = 25.", { a: 9, b: 16 });
  return t.steps;
}

const scopeError = `function makeTotal() {
  let total = 100;      // exists only while makeTotal runs
  return total;
}

console.log(makeTotal()); // 100
console.log(total);       // ReferenceError: total is not defined`;

const early = `function firstDivisor(n) {
  for (let d = 2; d < n; d++) {
    if (n % d === 0) {
      return d;          // found one: leave the function (and the loop) immediately
    }
  }
  return -1;             // reached only if the loop never returned
}

console.log(firstDivisor(15)); // 3
console.log(firstDivisor(13)); // -1`;

const arrow = `// these three are the same function
function square1(n) { return n * n; }
const square2 = function (n) { return n * n; };
const square3 = (n) => n * n;         // arrow function: short, returns automatically

console.log(square1(5), square2(5), square3(5)); // 25 25 25`;

const defaults = `function greet(name = "friend") {   // "friend" is used when no name is given
  return "Hello, " + name;
}

console.log(greet("Asha")); // Hello, Asha
console.log(greet());       // Hello, friend`;

const valuesRefs = `function addOne(n) {
  n = n + 1;            // changes the function's own copy only
}
let x = 5;
addOne(x);
console.log(x);         // 5  numbers are passed as a copy

function addItem(list) {
  list.push(99);        // changes the array the caller passed in
}
const nums = [1, 2];
addItem(nums);
console.log(nums);      // [ 1, 2, 99 ]  arrays and objects are shared`;

const leetShape = `/**
 * @param {number[]} nums
 * @return {number}
 */
var maxValue = function (nums) {
  // your code here — RETURN the answer, don't print it
};`;

export default function DsaLessonSevenPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">A function is a machine</h2>
      <p>
        A juicer: oranges go in, juice comes out. You don&apos;t rebuild the juicer every morning —
        you build it once and use it whenever you want. A <strong>function</strong> is a named
        machine made of code: you give it inputs, it does its work, and it gives back a result.
      </p>
      <p>
        So far you have been writing the same logic (is it even? sum of digits? is it prime?) again
        and again. A function lets you write it <em>once</em>, give it a name, and use it from
        anywhere — even from inside other functions.
      </p>

      <h2 id="syntax">Defining and calling</h2>
      <CodeBlock lang="js" code={basic} />
      <ul>
        <li><strong>Defining</strong> (<code>function greet(name) {"{ … }"}</code>) builds the machine. Nothing runs yet.</li>
        <li><strong>Calling</strong> (<code>greet(&quot;Asha&quot;)</code>) switches it on. The round brackets are what make it run.</li>
        <li>You can call it as many times as you like, with different inputs.</li>
      </ul>

      <h2 id="params">Parameters and arguments</h2>
      <CodeBlock lang="js" code={params} />
      <p>
        <strong>Parameters</strong> are the input names in the definition; <strong>arguments</strong>{" "}
        are the actual values in a call. They are matched up by position: first argument → first
        parameter. Missing arguments become <code>undefined</code> — and <code>NaN</code>
        (&ldquo;Not a Number&rdquo;) is what you get when you do maths with it.
      </p>

      <h2 id="return">return vs console.log</h2>
      <p>This is the most important distinction in this lesson, and one of the most common mistakes in interviews.</p>
      <CodeBlock lang="js" code={returnVsLog} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th></th>
              <th><code>console.log(v)</code></th>
              <th><code>return v</code></th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Who sees the value</td><td>A human, on screen</td><td>The code that called the function</td></tr>
            <tr><td>Can it be used afterwards?</td><td>No — it is gone</td><td>Yes — store it, compare it, add to it</td></tr>
            <tr><td>What the function gives back</td><td><code>undefined</code></td><td><code>v</code></td></tr>
            <tr><td>In an interview / LeetCode</td><td>Wrong answer</td><td>Correct</td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="trace">Traced: jumping into a function and back</h2>
      <CodeTrace
        code={callCode}
        steps={callTrace()}
        caption="Calls jump into the function, and return jumps back to the exact line that made the call. x and result exist only during a call."
      />
      <p>
        This &ldquo;jump in, jump back&rdquo; is managed by the <strong>call stack</strong>, which
        the JavaScript series covers in depth. For DSA you need one fact now: every call gets its
        own fresh copy of the parameters and inner variables.
      </p>

      <h2 id="scope">Variables inside stay inside</h2>
      <CodeBlock lang="js" code={scopeError} />
      <p>
        A variable created inside a function exists only while that call runs. This is useful:
        your <code>i</code> or <code>sum</code> inside one function can never clash with an{" "}
        <code>i</code> or <code>sum</code> somewhere else. To get a value out, return it.
      </p>

      <h2 id="early">return ends the function early</h2>
      <p>
        <code>return</code> doesn&apos;t just give a value back — it stops the function on the
        spot, even in the middle of a loop. That makes &ldquo;search until found&rdquo; very clean:
      </p>
      <CodeBlock lang="js" code={early} />
      <Callout kind="note" label="A common pattern">
        <p className="mb-0">
          &ldquo;Return as soon as you know the answer; return the default at the very end.&rdquo;
          Here <code>-1</code> means &ldquo;not found&rdquo; — a convention you will see in many
          search problems (Lesson 8, Lesson 28).
        </p>
      </Callout>

      <h2 id="arrow">Arrow functions</h2>
      <p>You will see a shorter syntax in modern code. It behaves the same for everything in this series:</p>
      <CodeBlock lang="js" code={arrow} />

      <h2 id="defaults">Default parameter values</h2>
      <p>
        A parameter can have a default value, used when the caller does not pass that argument.
        It avoids the <code>undefined</code> and <code>NaN</code> problems shown above.
      </p>
      <CodeBlock lang="js" code={defaults} />

      <h2 id="values-refs">Passing values vs passing references</h2>
      <p>
        What happens when a function changes a parameter? It depends on the type of value:
      </p>
      <CodeBlock lang="js" code={valuesRefs} />
      <ul>
        <li>
          <strong>Numbers, strings and booleans</strong> are passed as a <em>copy</em>. Changing the
          parameter inside the function never changes the caller&apos;s variable.
        </li>
        <li>
          <strong>Arrays and objects</strong> are passed as a <em>reference</em> — the function
          receives directions to the same array, not a copy. Changes made inside the function are
          visible outside.
        </li>
      </ul>
      <Callout kind="warn" label="Why this matters in interviews">
        <p className="mb-0">
          Many problems say &ldquo;modify the array <strong>in place</strong>&rdquo; (LeetCode 283,
          Move Zeroes). That works only because arrays are passed by reference. When a problem says
          &ldquo;do not modify the input&rdquo;, copy the array first (Lesson 8 shows how).
        </p>
      </Callout>

      <h2 id="interview">Why every interview answer is a function</h2>
      <p>On LeetCode and in most interviews you are given a function to fill in, like this:</p>
      <CodeBlock lang="js" code={leetShape} />
      <p>
        The judge calls your function with test inputs and compares what you <strong>return</strong>{" "}
        with the expected answer. So from now on, every practice answer in this series is a function
        that returns its result, followed by a few <code>console.log</code> calls to test it — exactly
        how you would check your own work before submitting.
      </p>

      <h2 id="practice">Practice questions</h2>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Explain the difference between <code>return</code> and <code>console.log</code> in one sentence each.</>,
          <>Write <code>isPrime</code> with an early return, from memory.</>,
          <>What does a function return if it has no <code>return</code> statement?</>,
        ]}
      />
      <p>
        Next lesson: <strong>arrays</strong> — storing many values in one variable — and the first
        real interview questions.
      </p>
    </DsaLessonPage>
  );
}
