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

const lesson = getDsaLesson("lesson-1");

export const metadata: Metadata = {
  title: `Lesson 1 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "A program is a recipe" },
  { id: "why", label: "Why this matters for DSA interviews" },
  { id: "run", label: "Three ways to run JavaScript" },
  { id: "print", label: "console.log — making the program talk" },
  { id: "order", label: "Top to bottom, one line at a time" },
  { id: "comments", label: "Comments — notes the computer ignores" },
  { id: "errors", label: "Reading an error message" },
  { id: "habit", label: "The habit: predict, then run" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
];

const firstProgram = `console.log("Hello, World!");`;

const printing = `console.log("I am learning DSA");   // text goes inside quotes
console.log(42);                     // numbers do not need quotes
console.log(10 + 5);                 // JavaScript calculates first: 15
console.log("10 + 5");               // inside quotes it is just text
console.log("Total:", 10 + 5);       // several values, separated by a space

/* Output:
I am learning DSA
42
15
10 + 5
Total: 15
*/`;

const orderCode = `console.log("Wake up");
console.log("Brush teeth");
console.log(2 * 3);
console.log("Go to work");`;

function orderTrace() {
  const t = tracer();
  t.step(1, "start", "The computer starts at line 1", "A program always starts at the first line and moves down. Nothing has been printed yet.");
  t.print("Wake up");
  t.step(1, "print", "Line 1 prints “Wake up”", "console.log puts the text in the console. Then the computer moves to the next line.");
  t.print("Brush teeth");
  t.step(2, "print", "Line 2 prints “Brush teeth”", "Same thing, one line further down. It never skips ahead and never goes back up by itself.");
  t.print(6);
  t.step(3, "print", "Line 3 calculates 2 * 3, then prints 6", "No quotes, so it is maths: JavaScript works out 2 × 3 = 6 first, then prints the result.");
  t.print("Go to work");
  t.step(4, "print", "Line 4 prints “Go to work”", "The last line runs.");
  t.step(4, "done", "No more lines — the program ends", "Four statements, four outputs, in exactly the order they were written.");
  return t.steps;
}

const comments = `// This whole line is a comment. The computer skips it.
console.log("This runs");   // a comment can also sit at the end of a line

/*
  A multi-line comment.
  Useful for longer explanations.
*/
// console.log("This does NOT run — it has been 'commented out'");

/* Output:
This runs
*/`;

const errors = `console.log("Start");
consol.log("Oops");   // typo: consol instead of console
console.log("End");`;

const errorText = `Start
ReferenceError: consol is not defined
    at Object.<anonymous> (/Users/you/dsa/hello.js:2:1)`;

export default function DsaLessonOnePage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">A program is a recipe</h2>
      <p>
        A recipe is a list of steps: boil water, add rice, wait ten minutes. You follow them{" "}
        <strong>in order</strong>, one at a time, exactly as written. A program is the same thing
        for a computer: a list of instructions, called <strong>statements</strong>, that the
        computer follows from the first line to the last.
      </p>
      <p>
        The computer follows your instructions exactly. It does what you wrote, not what you
        meant. If an instruction contains a spelling mistake, the computer stops and reports an
        error. Errors are normal, and in this lesson you will learn how to read them.
      </p>
      <p>
        This series uses <strong>JavaScript</strong>. It runs in every browser and with{" "}
        Node.js on any computer, its syntax is similar to other common interview languages such as Java, C++ and Python,
        and every idea you learn here applies to them as well.
      </p>

      <h2 id="why">Why this matters for DSA interviews</h2>
      <p>
        DSA — data structures and algorithms — may sound like a large topic, but every interview
        question has the same shape: <em>here is some input, write a small program that produces the right
        output</em>. Before you can learn clever methods, you need two basic skills:
      </p>
      <ol>
        <li>Writing statements the computer accepts.</li>
        <li>
          <strong>Predicting exactly what a program will print</strong>, line by line, before you
          run it. This is called a dry run, and it is the skill this whole series is built on.
        </li>
      </ol>
      <p>
        Interviewers often ask &ldquo;what does this code print?&rdquo; or &ldquo;walk me through
        your code with this example&rdquo;. If you can dry-run, you can answer both.
      </p>

      <h2 id="run">Three ways to run JavaScript</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Where</th>
              <th>How</th>
              <th>Best for</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Browser console</strong></td>
              <td>Open Chrome, press <code>F12</code> (or Cmd+Option+J on Mac), click <em>Console</em>, type a line, press Enter.</td>
              <td>Trying one line right now, with nothing to install.</td>
            </tr>
            <tr>
              <td><strong>Node.js REPL</strong></td>
              <td>Install Node.js (the LTS version from nodejs.org), open a terminal, type <code>node</code>.</td>
              <td>Quick experiments. Type <code>.exit</code> to leave.</td>
            </tr>
            <tr>
              <td><strong>A file</strong> (recommended)</td>
              <td>Write code in a file like <code>hello.js</code> in VS Code, then in the terminal run <code>node hello.js</code>.</td>
              <td>Everything in this series. You can edit, save and run again.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>Create <code>hello.js</code>, put this one line in it, save, and run <code>node hello.js</code>:</p>
      <CodeBlock lang="js" code={firstProgram} />
      <p>
        The terminal shows <code>Hello, World!</code>. You have written and run a program. Every
        program in this series is run the same way.
      </p>
      <Callout kind="note" label="Online, with nothing installed">
        <p className="mb-0">
          If you can&apos;t install anything yet, any online JavaScript playground (search
          &ldquo;JavaScript online compiler&rdquo;) or LeetCode&apos;s own editor works too. Use
          the browser console at minimum — but move to files soon, because interviews expect you to
          write a whole function, not one line.
        </p>
      </Callout>

      <h2 id="print">console.log — making the program talk</h2>
      <p>
        <code>console.log(something)</code> prints <em>something</em> on its own line. It is how a
        program shows you what it is doing, and it will be your main debugging tool for the whole
        series. The rules:
      </p>
      <CodeBlock lang="js" code={printing} />
      <ul>
        <li>
          <strong>Text goes inside quotes</strong> — <code>&quot;double&quot;</code> or{" "}
          <code>&apos;single&apos;</code>, both work. Without quotes, JavaScript thinks you mean a
          name of something.
        </li>
        <li>
          <strong>Numbers need no quotes</strong>, and maths is calculated <em>before</em> printing.
        </li>
        <li>
          <strong>Quotes turn maths into text</strong>: <code>&quot;10 + 5&quot;</code> prints
          exactly those characters.
        </li>
        <li>
          <strong>Commas print several values</strong> on one line, with a space between them.
        </li>
        <li>
          <strong>Each console.log starts a new line.</strong>
        </li>
      </ul>

      <h2 id="order">Top to bottom, one line at a time</h2>
      <p>
        The computer runs statement 1, then 2, then 3. It never jumps ahead, and (until you learn
        loops in Lesson 4) it never goes back. Step through this with the buttons — watch the
        highlighted line and the console:
      </p>
      <CodeTrace
        code={orderCode}
        steps={orderTrace()}
        caption="Each press of Next runs one line. The console only grows downward, in the same order as the code."
      />
      <p>The same thing written down on paper is a <strong>dry-run table</strong>:</p>
      <DryRun
        title="the morning program"
        cols={["Line", "What happens", "Console so far"]}
        rows={[
          ["1", "print text", "Wake up"],
          ["2", "print text", "Wake up · Brush teeth"],
          ["3", "calculate 2 * 3 = 6, print it", "… · 6"],
          ["4", "print text", "… · 6 · Go to work"],
        ]}
        note="A table may seem unnecessary for four lines. Once you start using loops, it is the most reliable way to check your understanding."
      />

      <h2 id="comments">Comments — notes the computer ignores</h2>
      <p>
        Anything after <code>//</code> on a line, or between <code>/*</code> and{" "}
        <code>*/</code>, is a <strong>comment</strong>. The computer skips it. Use comments to
        explain <em>why</em> you did something, and to switch a line off temporarily without
        deleting it.
      </p>
      <CodeBlock lang="js" code={comments} />
      <p>
        In this series, the expected output is often shown in an <code>/* Output: … */</code>{" "}
        comment at the bottom of the code, so you can check your prediction.
      </p>

      <h2 id="errors">Reading an error message</h2>
      <p>An error is not a failure. It is the computer telling you exactly where the problem is. Run this:</p>
      <CodeBlock lang="js" code={errors} />
      <Callout kind="bad" label="What the terminal shows">
        <pre className="my-1">
          <code>{errorText}</code>
        </pre>
      </Callout>
      <p>Read it in three parts:</p>
      <ol>
        <li>
          <strong>What already ran</strong>: <code>Start</code> printed — so line 1 was fine.
        </li>
        <li>
          <strong>The error type and message</strong>: <code>ReferenceError: consol is not defined</code>{" "}
          — &ldquo;you used a name I have never heard of&rdquo;.
        </li>
        <li>
          <strong>Where</strong>: <code>hello.js:2:1</code> — file <code>hello.js</code>, line 2,
          column 1.
        </li>
      </ol>
      <p>
        Notice <code>End</code> never printed. When a program hits an error it stops right there.
        The three errors you will meet most at the start:
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Error</th>
              <th>Usually means</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>ReferenceError</code></td>
              <td>A misspelt or undefined name</td>
              <td><code>consol.log</code>, <code>Console.log</code> (capital C)</td>
            </tr>
            <tr>
              <td><code>SyntaxError</code></td>
              <td>The code is not valid JavaScript — the program does not run <em>at all</em></td>
              <td>A missing quote or bracket: <code>console.log(&quot;Hi)</code></td>
            </tr>
            <tr>
              <td><code>TypeError</code></td>
              <td>A value was used in a way its type does not allow</td>
              <td>Calling something that is not a function: <code>console.lg(&quot;Hi&quot;)</code> — <code>console.lg</code> does not exist, so it is <code>undefined</code>, and <code>undefined</code> cannot be called</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Callout kind="warn" label="JavaScript is case-sensitive">
        <p className="mb-0">
          <code>console</code>, <code>Console</code> and <code>CONSOLE</code> are three different
          names. Only the first one exists.
        </p>
      </Callout>

      <h2 id="habit">The habit: predict, then run</h2>
      <p>
        Every time you see code in this series — before you run it, before you open an answer —{" "}
        <strong>write down what you think it prints</strong>. Then run it and compare. When you are
        wrong, that is the most valuable moment: find the exact line where your prediction and the
        actual result differed. Do this for a few weeks and you will be able to &ldquo;run&rdquo;
        code in your head, which is exactly what an interviewer is checking.
      </p>

      <h2 id="practice">Practice questions</h2>
      <p>
        Try each one in a file before opening the answer. They start very easy on purpose — the
        goal is to become comfortable writing and running code.
      </p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write, from memory, a program that prints three lines, and run it with <code>node</code>.</>,
          <>Explain to yourself (out loud is best) why <code>&quot;2&quot; + &quot;3&quot;</code> prints 23.</>,
          <>Break a working program on purpose — remove a quote, misspell console — and read each error: type, message, line number.</>,
        ]}
      />
      <p>
        Next lesson: storing values in <strong>variables</strong>, and the operators —
        especially <code>%</code> — that almost every DSA problem uses.
      </p>
    </DsaLessonPage>
  );
}
