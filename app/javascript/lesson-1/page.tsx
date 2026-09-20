import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import CommandList from "@/components/CommandList";
import ExecutionContextBox from "@/components/figures/ExecutionContextBox";
import ExecutionContextStepper from "@/components/figures/ExecutionContextStepper";
import Figure from "@/components/figures/Figure";
import HopChain from "@/components/figures/HopChain";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { JS_LESSONS, JS_SERIES, jsLessonHref } from "@/lib/javascript";

const lesson = JS_LESSONS.find((l) => l.slug === "lesson-1")!;

export const metadata: Metadata = {
  title: `Lesson 1 — ${lesson.title}`,
  description: lesson.summary,
};

/** In-page index. Each entry links to a section heading below. */
const outline = [
  { id: "concept", label: "Concept: everything happens inside an execution context" },
  { id: "why-this-matters", label: "Why this matters" },
  { id: "two-components", label: "The two halves of an execution context" },
  { id: "two-phases", label: "The two phases: memory first, then code" },
  { id: "traced-example", label: "Traced example — step through it live" },
  { id: "call-stack", label: "The call stack: how contexts are managed" },
  { id: "single-threaded", label: "Synchronous, single-threaded — what that actually means" },
  { id: "devtools", label: "See it happen: Node and Chrome DevTools" },
  { id: "predict", label: "Predict the output" },
  { id: "interview", label: "Interview questions" },
  { id: "practice", label: "Practice before Lesson 2" },
  { id: "conclusion", label: "Conclusion" },
];

const terms: [string, React.ReactNode][] = [
  ["Execution context", "The environment in which a piece of JavaScript runs. Think of it as a box with a memory half and a code half."],
  ["Global execution context (GEC)", "The very first context, created when your file starts. Everything at the top level of the file lives here."],
  ["Memory component", <>Also called the <strong>variable environment</strong>. Stores every variable and function as key → value pairs.</>],
  ["Code component", <>Also called the <strong>thread of execution</strong>. Runs the code one line at a time.</>],
  ["Memory creation phase", <>Phase 1. The engine scans the code and allocates memory for every variable (<code>undefined</code>) and function (its whole body).</>],
  ["Code execution phase", "Phase 2. The engine runs the code line by line, replacing placeholders with real values and invoking functions."],
  ["Call stack", "A stack that keeps track of which execution context is running. New contexts are pushed on top; finished ones are popped off."],
  ["Function invocation", <>Calling a function with <code>()</code>. Every invocation creates a brand-new execution context.</>],
];

const example = `var n = 2;
function square(num) {
  var ans = num * num;
  return ans;
}
var square2 = square(n);
var square4 = square(4);`;

const predict = `console.log(a);
console.log(greet);
console.log(greet());

var a = 10;
function greet() {
  return "hello";
}`;

const questions: [string, React.ReactNode][] = [
  [
    "What is an execution context?",
    <>
      The environment where JavaScript code is evaluated and executed. It has two parts: a{" "}
      <strong>memory component</strong> (variable environment) that stores variables and functions
      as key–value pairs, and a <strong>code component</strong> (thread of execution) that runs the
      code one line at a time. Every JS program starts by creating a global execution context, and
      every function call creates a new one.
    </>,
  ],
  [
    "What are the two phases of an execution context?",
    <>
      <strong>Memory creation phase</strong>: the engine scans the code and allocates memory for
      every variable (initialised to <code>undefined</code>) and function (the whole function body
      is stored). <strong>Code execution phase</strong>: the engine runs the code line by line,
      assigning real values and executing function calls.
    </>,
  ],
  [
    "Why does console.log(x) print undefined when x is declared with var later in the file?",
    <>
      Because of the memory creation phase. Before any code runs, <code>x</code> already exists
      in memory with the placeholder <code>undefined</code>. When the <code>console.log</code>{" "}
      runs in the code phase, it finds that placeholder. The real value is only assigned when
      execution reaches the <code>x = ...</code> line. (This is the mechanism behind hoisting,
      Lesson 3.)
    </>,
  ],
  [
    "Why can you call a function before it is defined?",
    <>
      During the memory phase, a function <em>declaration</em> is stored in full — not as{" "}
      <code>undefined</code>. So by the time the code phase reaches the call, the entire function
      body is already in memory.
    </>,
  ],
  [
    "What happens when a function is invoked?",
    <>
      A new execution context is created just for that call and pushed onto the call stack. It
      goes through its own memory phase (parameters and local variables reserved) and code phase.
      When the function returns, or finishes, its context is deleted and popped off the stack, and
      control goes back to the line that called it.
    </>,
  ],
  [
    "What is the call stack?",
    <>
      A stack data structure the engine uses to manage execution contexts. The global context sits
      at the bottom. Each function call pushes a new context on top; the one on top is always the
      one running. When it finishes it is popped. When the program ends, the global context is
      popped too and the stack is empty. Other names you will hear: execution context stack,
      program stack, control stack, runtime stack, machine stack.
    </>,
  ],
  [
    "JavaScript is “synchronous single-threaded”. What does that mean?",
    <>
      <strong>Single-threaded</strong>: there is one call stack, so only one command runs at a
      time. <strong>Synchronous</strong>: commands run in order, and the next line waits for the
      current one to finish. Async behaviour (timers, fetch) is handled outside the engine and
      comes back through the event loop — Lesson 14.
    </>,
  ],
  [
    "Does the same function called twice share memory between calls?",
    <>
      No. Each invocation creates a fresh execution context with its own memory. Local variables
      from the first call are gone by the time the second call runs. The only way to share is
      through an outer scope — which is what closures (Lesson 10) are about.
    </>,
  ],
];

export default function JsLessonOnePage() {
  return (
    <article>
      <header className="mb-8 border-b border-line pb-6">
        <nav className="mb-4 font-mono text-[0.8rem] text-ink-dim" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-sky">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/${JS_SERIES.slug}`} className="hover:text-sky">{JS_SERIES.title}</Link>
          <span className="mx-2">/</span>
          <span>Lesson {String(lesson.number).padStart(2, "0")}</span>
        </nav>
        <p className="mb-2 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">
          Lesson 1 · {lesson.readTime} read
        </p>
        <h1 className="mb-2 text-[2.4rem] font-bold leading-tight tracking-tight text-sky max-sm:text-[2rem]">
          {lesson.title}
        </h1>
        <p className="max-w-[60ch] text-[1.15rem] text-ink-dim">{lesson.summary}</p>
      </header>

      <section className="mb-10 rounded-xl border border-line bg-bg-elev px-6 py-5" aria-labelledby="learn">
        <h2 id="learn" className="mb-2 text-[1.1rem] font-semibold text-sky">
          What you&apos;ll learn in this lesson
        </h2>
        <ol className="m-0 list-decimal pl-5 marker:text-sky">
          {outline.map((item) => (
            <li key={item.id} className="my-1">
              <a href={`#${item.id}`} className="text-ink hover:text-sky">
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </section>

      <div className="lesson">
        <h2 id="concept">Concept</h2>
        <p>
          <strong>Everything in JavaScript happens inside an execution context.</strong> That one
          sentence is the whole lesson. When you run a file, the engine does not just start at
          line 1 and go. It first builds a container — the execution context — and only then runs
          your code inside it. Every function you call gets its own container. Understanding what
          goes into that container, and in what order, is what makes hoisting, scope, closures and{" "}
          <code>this</code> stop feeling like magic.
        </p>
        <p>
          Imagine the execution context as a box with two halves. The left half is a table of
          names and values. The right half is a pointer that walks through your code one line at a
          time. The engine always fills the left half <em>completely</em> before it starts walking
          the right half. That order is the source of almost every &ldquo;why did JavaScript do
          that?&rdquo; moment you will ever have.
        </p>

        <h2 id="why-this-matters">Why this matters</h2>
        <p>
          You can write a lot of working JavaScript without knowing any of this. But the moment
          something surprises you — a variable that is <code>undefined</code> when you are sure you
          assigned it, a function that works when called &ldquo;too early&rdquo;, a counter inside
          a loop that prints the wrong number five times — the only real explanation is the
          execution context. Interviewers know this, which is why it is one of the most-asked
          fundamentals: it is a two-minute question that reveals whether you understand the
          language or just use it.
        </p>
        <p>
          Every later lesson in this series builds directly on top of today: the call stack
          (Lesson 2) is a stack <em>of execution contexts</em>; hoisting (Lesson 3) is the memory
          phase; scope (Lesson 7) is how one context can see another; closures (Lesson 10) are a
          function keeping its context alive.
        </p>

        <h3>Key terms, explained simply</h3>
        <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Term</th>
              <th>Simple meaning</th>
            </tr>
          </thead>
          <tbody>
            {terms.map(([term, meaning]) => (
              <tr key={term}>
                <td className="whitespace-nowrap"><strong>{term}</strong></td>
                <td>{meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        <h2 id="two-components">The two halves of an execution context</h2>
        <p>
          Here is the box. The left half is the <strong>memory component</strong> — the official
          name is <em>variable environment</em>. It stores every variable and function as a{" "}
          key → value pair. The right half is the <strong>code component</strong> — official name{" "}
          <em>thread of execution</em>. It executes your code one line at a time, top to bottom.
        </p>
        <ExecutionContextBox />
        <Callout kind="note" label="Both names matter">
          <p className="mb-0">
            Interviewers use both sets of names. <strong>Memory component = variable
            environment</strong>. <strong>Code component = thread of execution</strong>. Use
            whichever you like, but recognise both.
          </p>
        </Callout>

        <h2 id="two-phases">The two phases: memory first, then code</h2>
        <p>
          When the engine creates an execution context, it works in two strictly ordered phases.
        </p>
        <ol className="steps">
          <li>
            <h3>Memory creation phase</h3>
            <p>
              The engine scans the code from top to bottom <em>without running anything</em>. For
              every <code>var</code> it finds, it reserves a slot in memory and puts the special
              placeholder <code>undefined</code> in it. For every function declaration, it reserves
              a slot and stores the <strong>entire function body</strong> in it. When this phase
              ends, every name in your file already exists in memory.
            </p>
          </li>
          <li>
            <h3>Code execution phase</h3>
            <p>
              Now the engine goes back to line 1 and runs the code for real. Each assignment
              replaces the <code>undefined</code> placeholder with the actual value. Each function
              call creates a brand-new execution context (with its own two phases) and pushes it
              on the call stack. When the last line finishes, the context is destroyed.
            </p>
          </li>
        </ol>
        <Figure caption="What the engine does with one file, in order." note="lifecycle">
          <HopChain
            label="Execution context lifecycle"
            hops={[
              { title: "Run index.js", desc: "engine starts", tone: "plain", edge: "creates" },
              { title: "Global execution context", desc: "pushed onto the call stack", tone: "sky", edge: "phase 1" },
              { title: "Memory creation", desc: "every var → undefined, every function → its code", tone: "purple", edge: "phase 2" },
              { title: "Code execution", desc: "line by line; each function call = a new context", tone: "ok", edge: "last line done" },
              { title: "Context destroyed", desc: "popped off the stack", tone: "plain" },
            ]}
          />
        </Figure>

        <h2 id="traced-example">Traced example — step through it live</h2>
        <p>
          This is the program we will trace. It is deliberately tiny: one variable, one function,
          two calls. Read it once, guess what memory looks like after the memory phase, then step
          through the trace below and check your guess.
        </p>
        <Script title="index.js" code={example} />
        <ExecutionContextStepper />
        <p>Three things to notice in the trace:</p>
        <ul>
          <li>
            <strong>After the memory phase, before any code runs,</strong> <code>n</code>,{" "}
            <code>square2</code> and <code>square4</code> are all <code>undefined</code>, but{" "}
            <code>square</code> already holds the full function. Nothing has &ldquo;executed&rdquo;
            yet.
          </li>
          <li>
            <strong>Each call to <code>square</code> gets its own context</strong> with its own{" "}
            <code>num</code> and <code>ans</code>. The second call starts from{" "}
            <code>undefined</code> again — it remembers nothing from the first call.
          </li>
          <li>
            <strong><code>return</code> does two jobs</strong>: it hands a value back, and it hands{" "}
            <em>control</em> back to the line that made the call. The function&apos;s context is
            deleted the moment that happens.
          </li>
        </ul>

        <h2 id="call-stack">The call stack: how contexts are managed</h2>
        <p>
          You just watched contexts stack up and disappear. The structure that manages that is the{" "}
          <strong>call stack</strong>. It follows one simple rule: the context on top is the one
          currently running. The global context is pushed first and sits at the bottom the whole
          time. Every function invocation pushes a new context on top; every return pops it. When
          the program finishes, the global context is popped and the stack is empty.
        </p>
        <p>
          This is why the global context is only ever destroyed at the very end, and why a function
          called inside a function inside a function produces three contexts stacked up, popped
          off in reverse order. Lesson 2 goes deep on this; today, just hold the picture.
        </p>
        <Callout kind="note" label="Five names, one thing">
          <p className="mb-0">
            <strong>Call stack</strong>, <strong>execution context stack</strong>,{" "}
            <strong>program stack</strong>, <strong>control stack</strong>,{" "}
            <strong>runtime stack</strong>, <strong>machine stack</strong>. Blog posts and
            interviewers use all of them. They are the same structure.
          </p>
        </Callout>

        <h2 id="single-threaded">Synchronous, single-threaded — what that actually means</h2>
        <p>
          You will hear &ldquo;JavaScript is a synchronous, single-threaded language&rdquo; a
          hundred times. With the execution context in your head, it is easy to say precisely:
        </p>
        <ul>
          <li>
            <strong>Single-threaded</strong> — there is <em>one</em> call stack, so there is one
            thread of execution. The engine can only be inside one context at a time.
          </li>
          <li>
            <strong>Synchronous</strong> — inside that thread, lines run in order. The engine does
            not move to the next line until the current one has finished. It never jumps ahead or
            runs two lines at once.
          </li>
        </ul>
        <Callout kind="warn" label="Then how does setTimeout work?">
          <p className="mb-0">
            The engine itself is synchronous. Anything asynchronous — timers, network calls, DOM
            events — is handled by the environment <em>around</em> the engine (the browser or
            Node), and the result is fed back into the call stack later through the event loop.
            That is Lesson 14. For now: the engine you are learning about today is strictly one
            line at a time.
          </p>
        </Callout>

        <h2 id="devtools">See it happen: Node and Chrome DevTools</h2>
        <p>
          Do not take the trace above on faith. Watch the real engine do it. Save the example as{" "}
          <code>index.js</code> and use either method.
        </p>

        <h3>Method 1 — Chrome DevTools (recommended the first time)</h3>
        <ol className="steps">
          <li>
            <h3>Create a page that loads the file</h3>
            <Script
              title="index.html"
              code={`<!doctype html>
<html>
  <body>
    <script src="index.js"></script>
  </body>
</html>`}
            />
          </li>
          <li>
            <h3>Open it and set a breakpoint on line 1</h3>
            <p>
              Open <code>index.html</code> in Chrome, press <kbd>F12</kbd>, go to the{" "}
              <strong>Sources</strong> tab, click <code>index.js</code>, and click the line number{" "}
              <strong>1</strong> to add a breakpoint. Reload the page. Execution pauses{" "}
              <em>before</em> line 1 runs.
            </p>
          </li>
          <li>
            <h3>Look at Scope while paused on line 1</h3>
            <p>
              On the right, expand <strong>Scope → Global</strong>. You will see{" "}
              <code>n: undefined</code>, <code>square2: undefined</code>,{" "}
              <code>square4: undefined</code> and <code>square: ƒ square(num)</code>. Nothing has
              executed and yet every name exists. <strong>That is the memory phase, live.</strong>
            </p>
          </li>
          <li>
            <h3>Step and watch the Call Stack panel</h3>
            <p>
              Press <strong>Step</strong> (<kbd>F9</kbd>) repeatedly. Watch <code>n</code> become{" "}
              <code>2</code>. When you step into <code>square(n)</code>, a new entry{" "}
              <code>square</code> appears in the <strong>Call Stack</strong> panel above{" "}
              <code>(anonymous)</code> (the global context), and <strong>Scope → Local</strong>{" "}
              shows <code>num</code> and <code>ans</code>. When <code>return</code> runs, the entry
              vanishes.
            </p>
          </li>
        </ol>

        <h3>Method 2 — Node with the inspector</h3>
        <CommandList
          title="Debug in Node"
          commands={[
            {
              cmd: "node --inspect-brk index.js",
              note: (
                <>
                  Starts Node paused on the first line and opens a debugger port. The{" "}
                  <code>-brk</code> is what makes it pause before line 1 — without it the script
                  finishes before you can attach.
                </>
              ),
            },
            {
              cmd: "chrome://inspect",
              note: (
                <>
                  Open this URL in Chrome and click <strong>inspect</strong> under your script. You
                  get the same Sources / Scope / Call Stack panels as Method 1.
                </>
              ),
            },
          ]}
        />
        <p>
          Prefer staying in the terminal? Add a <code>debugger;</code> statement as the first line
          of the file and run <code>node inspect index.js</code>. Type <code>n</code> to step to
          the next line, <code>repl</code> to inspect variables, and <code>c</code> to continue.
        </p>
        <Callout kind="ok" label="What you should see">
          <p className="mb-0">
            Paused on line 1, the global scope already contains every variable as{" "}
            <code>undefined</code> and the function in full. That single screenshot is the proof
            of everything in this lesson.
          </p>
        </Callout>

        <h2 id="predict">Predict the output</h2>
        <p>
          Before running it, write down what each of the three <code>console.log</code> lines
          prints. Then reason through the memory phase and the code phase.
        </p>
        <Script title="predict.js" code={predict} />
        <details className="my-5 rounded-xl border border-line bg-bg-elev px-5 py-4">
          <summary className="cursor-pointer font-semibold text-sky">Show the answer</summary>
          <Script title="output" code={`undefined\n[Function: greet]\nhello`} />
          <p className="mb-0">
            Memory phase: <code>a → undefined</code>, <code>greet → {"{ …code }"}</code>. Code
            phase, line 1: <code>a</code> is found in memory holding <code>undefined</code>, so
            that is printed. Line 2: <code>greet</code> holds the whole function, so the function
            is printed. Line 3: the function is invoked — a new context is created, it returns{" "}
            <code>&quot;hello&quot;</code>, the context is popped, and <code>hello</code> is
            printed. Only <em>then</em> does line 5 assign <code>10</code> to <code>a</code>.
          </p>
        </details>

        <h2 id="interview">Interview questions</h2>
        <p>
          These are the questions this lesson lets you answer. Try to answer each one out loud
          before opening it.
        </p>
        {questions.map(([q, a]) => (
          <details key={q} className="my-3 rounded-xl border border-line bg-bg-elev px-5 py-3">
            <summary className="cursor-pointer font-semibold text-ink">{q}</summary>
            <p className="mb-0 mt-2 text-ink-dim">{a}</p>
          </details>
        ))}

        <h2 id="practice">Practice before Lesson 2</h2>
        <ol>
          <li>
            Take the traced example and draw the execution contexts on paper — the global one and
            both <code>square</code> contexts — showing memory after phase 1 and after phase 2 for
            each. Compare against the stepper above.
          </li>
          <li>
            Run Method 1 in Chrome and take a screenshot of the Scope panel while paused on line 1.
            Look at it until it feels obvious that nothing has run yet.
          </li>
          <li>
            Change <code>var square2 = square(n);</code> to call a function that itself calls{" "}
            <code>square</code>. Predict how many contexts stack up, then confirm it in the Call
            Stack panel.
          </li>
          <li>
            Explain the memory phase and code phase to someone (or to a rubber duck) in under one
            minute, without looking at this page.
          </li>
        </ol>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          JavaScript does not run your file top to bottom. It first builds a{" "}
          <strong>global execution context</strong>, fills its <strong>memory</strong> with every
          variable (<code>undefined</code>) and every function (its full body), and only then runs
          the <strong>code</strong> one line at a time on a single thread. Every function call
          builds a brand-new context of its own, pushes it on the <strong>call stack</strong>,
          runs it, and throws it away on return. Hold that picture — the next thirteen lessons are
          all details of it.
        </p>
      </div>

      <LessonPager slug="lesson-1" lessons={JS_LESSONS} href={jsLessonHref} series={JS_SERIES} />
    </article>
  );
}
