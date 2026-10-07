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
  ["JavaScript engine", "A JavaScript engine is a program that reads JavaScript code and runs it. Chrome and Node.js use an engine called V8."],
  ["Variable", <>A variable is a named place in memory that holds a value. In <code>var n = 2</code>, <code>n</code> is the variable and <code>2</code> is its value.</>],
  ["Function", <>A function is a named block of code that you can run again and again. <code>square(4)</code> runs the code inside <code>square</code> with the value 4.</>],
  ["Parameter and argument", <>A parameter is a name in the function&apos;s brackets, like <code>num</code> in <code>square(num)</code>. An argument is the real value you pass when you call it, like <code>4</code> in <code>square(4)</code>.</>],
  ["undefined", <><code>undefined</code> is a special value that means &ldquo;this variable exists, but nothing has been put in it yet.&rdquo; (Lesson 6 explains it fully.)</>],
  ["Execution context", "An execution context is a container that the engine creates to run a piece of code. It has a memory half (names and values) and a code half (the line that is running now). Think of a workbench: the tools are laid out first, then the work starts."],
  ["Global execution context (GEC)", "The global execution context is the first context. The engine creates it when your file starts, and everything at the top level of the file lives in it."],
  ["Memory component", <>The memory component is the half of a context that stores every variable and function as key → value pairs. A key → value pair is a name together with the value stored under it, like <code>n → 2</code>. Its other name is the <strong>variable environment</strong>.</>],
  ["Code component", <>The code component is the half of a context that runs the code one line at a time. Its other name is the <strong>thread of execution</strong>.</>],
  ["Memory creation phase", <>Phase 1. The engine reads through the code and sets aside memory for every variable (with the value <code>undefined</code>) and every function (with its whole body).</>],
  ["Code execution phase", "Phase 2. The engine runs the code line by line. It replaces the placeholders with real values and calls the functions."],
  ["Hoisting", "Hoisting is the effect of the memory creation phase: names look as if they were lifted to the top of their scope before the code runs, so you can use them early. Lesson 3 explains it fully."],
  ["Scope", "Scope is the part of the code where a name can be seen and used. Lesson 7 explains it fully."],
  ["Closure", "A closure is a function that keeps access to the variables of the place where it was created, even after that place has finished running. Lesson 10 explains it fully."],
  ["Stack", "A stack is a list where you can only add an item on the top and remove the item on the top. Think of a pile of plates. The last item added is the first one removed (Last In, First Out, or LIFO)."],
  ["Call stack", "The call stack is a stack that keeps track of which execution context is running. A new context is pushed (added) on top. A finished context is popped (removed) from the top. The context on top is the one that runs."],
  ["Function invocation", <>A function invocation (also called a function call) means running a function by writing <code>()</code> after its name. Every invocation creates a brand-new execution context.</>],
  ["Thread", "A thread is one path of work that a program follows, one step at a time. JavaScript has one main thread, so it is called single-threaded."],
  ["Synchronous", "Synchronous means one step after another: each step waits until the step before it has finished."],
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
      A container (environment) that the engine creates to run JavaScript code. It has two parts: a{" "}
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
      every variable (set to <code>undefined</code>) and function (the whole function body
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
      A stack (a list where you add and remove only at the top) that the engine uses to manage execution contexts. The global context sits
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
      current one to finish. Async work (work that finishes later, such as timers and fetch) is handled outside the engine and
      comes back through the event loop — Lesson 14.
    </>,
  ],
  [
    "Does the same function called twice share memory between calls?",
    <>
      No. Each invocation creates a fresh execution context with its own memory. Local variables
      from the first call are gone by the time the second call runs. The only way to share is
      through an outer scope — which is what closures (Lesson 10) are about. A closure is a function that keeps access to the variables of the place where it was created.
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
          line 1. It first builds a container — the execution context — and only then runs
          your code inside it. Every function you call gets its own container. Understanding what
          goes into that container, and in what order, is what makes hoisting, scope, closures and{" "}
          <code>this</code> easy to understand. (<code>this</code> is a keyword that points to an
          object. Lesson 5 explains it.)
        </p>
        <p>
          Imagine the execution context as a box with two halves. The left half is a table of
          names and values. The right half is a pointer that walks through your code one line at a
          time. The engine always fills the left half <em>completely</em> before it starts walking
          the right half. That order is the source of almost every &ldquo;why did JavaScript do
          that?&rdquo; moment you will ever have. (The engine does not literally have a left and a right
          half. This is a picture to help you remember.)
        </p>

        <h2 id="why-this-matters">Why this matters</h2>
        <p>
          You can write a lot of working JavaScript without knowing any of this. But the moment
          something surprises you — a variable that is <code>undefined</code> when you are sure you
          assigned it, a function that works when called &ldquo;too early&rdquo;, a counter inside
          a loop that prints the wrong number every time — the only real explanation is the
          execution context. Interviewers know this, which is why it is one of the most-asked
          fundamentals: it is a short question that shows whether you understand the
          language or only use it.
        </p>
        <p>
          Every later lesson in this series builds directly on top of today: the call stack
          (Lesson 2) is a stack <em>of execution contexts</em>; hoisting (Lesson 3) is the result of
          the memory phase; scope (Lesson 7) is how one context can see the names of another;
          closures (Lesson 10) are a function keeping the variables of its context alive.
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
        <Callout kind="note" label="Difference in one line">
          <p className="mb-0">
            An <strong>execution context</strong> is one box that holds the memory and the running
            code for one piece of code. The <strong>call stack</strong> is the pile that holds those
            boxes, so the engine knows which box is running now.
          </p>
        </Callout>

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
            whichever you like, but know both.
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
              The engine reads through the code from top to bottom <em>without running anything</em>. For
              every <code>var</code> it finds, it reserves a slot in memory and puts the special
              placeholder <code>undefined</code> in it. (This is true for <code>var</code>. Lesson 3
              shows that <code>let</code> and <code>const</code> are handled differently.) For every function declaration, it reserves
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
              on the call stack. When the last line finishes, the context is removed.
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
            <code>num</code> and <code>ans</code>. In the second call, <code>ans</code> starts as{" "}
            <code>undefined</code> again. It remembers nothing from the first call.
          </li>
          <li>
            <strong><code>return</code> does two jobs</strong>: it hands a value back, and it hands{" "}
            <em>control</em> back to the line that made the call. The function&apos;s context is
            deleted the moment that happens.
          </li>
        </ul>

        <h2 id="call-stack">The call stack: how contexts are managed</h2>
        <p>
          You just watched contexts pile up and disappear. The structure that manages them is the{" "}
          <strong>call stack</strong>. A stack is a list where you only add and remove at the top, like a
          pile of plates. The call stack follows one simple rule: the context on top is the one
          currently running. The global context is pushed first and sits at the bottom the whole
          time. Every function invocation pushes a new context on top; every return pops it. When
          the program finishes, the global context is popped and the stack is empty.
        </p>
        <p>
          This is why the global context is only ever destroyed at the very end, and why a function
          called inside a function inside a function produces three contexts stacked up, popped
          off in reverse order. Lesson 2 explains this in detail. For today, just remember the picture.
        </p>
        <Callout kind="note" label="Six names, one thing">
          <p className="mb-0">
            <strong>Call stack</strong>, <strong>execution context stack</strong>,{" "}
            <strong>program stack</strong>, <strong>control stack</strong>,{" "}
            <strong>runtime stack</strong>, <strong>machine stack</strong>. Blog posts and
            interviewers use all of them. They all mean the same structure.
          </p>
        </Callout>

        <h2 id="single-threaded">Synchronous, single-threaded — what that actually means</h2>
        <p>
          You will often hear &ldquo;JavaScript is a synchronous, single-threaded language.&rdquo;
          Now that you know the execution context, you can say exactly what it means:
        </p>
        <ul>
          <li>
            <strong>Single-threaded</strong> — a thread is one path of work that a program follows, one
            step at a time. JavaScript has <em>one</em> call stack, so it has one thread of
            execution. The engine can only be inside one context at a time.
          </li>
          <li>
            <strong>Synchronous</strong> — it means one step after another. Inside that thread, lines run
            in order. The engine does not move to the next line until the current one has finished.
            It never jumps ahead or runs two lines at once.
          </li>
        </ul>
        <Callout kind="warn" label="Then how does setTimeout work?">
          <p className="mb-0">
            The engine itself is synchronous. Anything asynchronous (work that finishes later, such as
            timers, network calls and DOM events) is handled by the environment <em>around</em> the
            engine (the browser or Node). When the work is done, the event loop puts the result onto
            the call stack. The event loop is a mechanism that waits until the call stack is empty and
            then moves the next finished task onto it. Lesson 14 explains it. For now: the engine you
            are learning about today runs strictly one line at a time.
          </p>
        </Callout>

        <h2 id="devtools">See it happen: Node and Chrome DevTools</h2>
        <p>
          Do not just trust the trace above. Watch the real engine do it. DevTools (short for developer
          tools) is the set of debugging panels built into Chrome. A debugger is a tool that lets you
          pause a running program and look inside it. A breakpoint is a marker on a line that tells
          the debugger to pause there. Save the example as <code>index.js</code> and use either method.
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
              disappears.
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
                  get the same Sources / Scope / Call Stack panels as Method 1. (Node wraps your file in a function, so your names may be listed under <strong>Local</strong> instead of{" "}
                  <strong>Global</strong>.)
                </>
              ),
            },
          ]}
        />
        <p>
          Prefer staying in the terminal? Run <code>node inspect index.js</code>. It starts paused on
          the first line. Type <code>n</code> to step to the next line, <code>repl</code> to open a
          prompt where you can type a name to see its value, and <code>c</code> to continue.
        </p>
        <Callout kind="ok" label="What you should see">
          <p className="mb-0">
            Paused on line 1, the global scope already contains every variable as{" "}
            <code>undefined</code> and the function in full. That single screenshot proves
            everything in this lesson.
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
            Explain the memory phase and the code phase to someone in under one minute, without
            looking at this page. If nobody is there, say it out loud to yourself.
          </li>
        </ol>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          JavaScript does not run your file top to bottom. It first builds a{" "}
          <strong>global execution context</strong>, fills its <strong>memory</strong> with every
          variable (<code>undefined</code>) and every function (its full body), and only then runs
          the <strong>code</strong> one line at a time on a single thread. Every function call
          builds a brand-new context of its own, pushes it on the <strong>call stack</strong>,
          runs it, and throws it away on return. Remember this picture. The next thirteen lessons all add
          details to it.
        </p>
      </div>

      <LessonPager slug="lesson-1" lessons={JS_LESSONS} href={jsLessonHref} series={JS_SERIES} />
    </article>
  );
}
