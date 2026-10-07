import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import IsolationStepper from "@/components/figures/IsolationStepper";
import OuterReference from "@/components/figures/OuterReference";
import ParamsMemory from "@/components/figures/ParamsMemory";
import SiblingLookupStepper from "@/components/figures/SiblingLookupStepper";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { JS_LESSONS, JS_SERIES, jsLessonHref } from "@/lib/javascript";

const lesson = JS_LESSONS.find((l) => l.slug === "lesson-4")!;

export const metadata: Metadata = {
  title: `Lesson 4 — ${lesson.title}`,
  description: lesson.summary,
};

/** In-page index. Each entry links to a section heading below. */
const outline = [
  { id: "concept", label: "Concept" },
  { id: "why", label: "Why this matters" },
  { id: "assistants", label: "The two assistants — an analogy" },
  { id: "isolation", label: "The isolation example — traced line by line" },
  { id: "rule1", label: "Rule 1: outward yes, sideways never" },
  { id: "rule2", label: "Rule 2: fresh every time, gone when popped" },
  { id: "params", label: "Parameters are part of the Variable Environment too" },
  { id: "live", label: "See it live — DevTools" },
  { id: "pitfalls", label: "Common misconceptions" },
  { id: "interview", label: "Interview questions" },
];

const isolation = `var roomNumber = 1;

function frontDesk() {
  var roomNumber = 10;
  console.log(roomNumber);
}

function housekeeping() {
  var roomNumber = 100;
  console.log(roomNumber);
}

frontDesk();
housekeeping();
console.log(roomNumber);`;

const siblings = `function frontDesk() {
  var roomNumber = 10;
}

function housekeeping() {
  console.log(roomNumber); // ReferenceError — can't see frontDesk's local roomNumber
}

frontDesk();
housekeeping();`;

const params = `function checkIn(guestName) {
  console.log(guestName); // "Aditi" — not undefined, even on this very first line
  var stayNights = 3;
}
checkIn("Aditi");`;

const questions: [React.ReactNode, React.ReactNode][] = [
  [
    <>If two different functions both declare <code>var x</code>, do they conflict?</>,
    "No — each function call gets its own separate Variable Environment, so identically named variables in different functions never interfere with each other.",
  ],
  [
    "Can a function access another function's local variables just because it was called right after it?",
    "No. Access only goes outward via the Lexical Environment's outer reference (a link to the surrounding scope) to parent scopes — never sideways to an unrelated function's scope.",
  ],
  [
    "What happens to a function's Variable Environment after it returns?",
    "Its Execution Context is popped off the call stack and the Variable Environment is discarded. That memory can then be freed by the garbage collector (the part of the engine that frees memory nothing can reach any more), unless a closure is holding a reference to it.",
  ],
  [
    "If the same function is called 3 times, are the Variable Environments shared?",
    "No — three separate, independent Variable Environments are created, one per call, sharing nothing with each other.",
  ],
  [
    <>Is a function parameter <code>undefined</code> at the very first line of the function body?</>,
    <>No — parameters are assigned their real value during the memory creation phase itself, since the value is already known at the call site, unlike a <code>var</code> declared inside the body.</>,
  ],
  [
    "What is the one exception to a function's memory always being thrown away after it returns?",
    "A closure — when an inner function keeps a live reference to its outer function's variables even after that outer function has finished running.",
  ],
];

export default function JsLessonFourPage() {
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
          Lesson 4 · {lesson.readTime} read
        </p>
        <h1 className="mb-2 text-[2.4rem] font-bold leading-tight tracking-tight text-sky max-sm:text-[2rem]">
          {lesson.title}
        </h1>
        <p className="max-w-[60ch] text-[1.15rem] text-ink-dim">{lesson.summary}</p>
      </header>

      <section className="mb-10 rounded-xl border border-line bg-bg-elev px-6 py-5" aria-labelledby="learn">
        <h2 id="learn" className="mb-2 text-[1.1rem] font-semibold text-sky">
          On this page
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
          Lesson 1 showed that every Execution Context has a memory component, also called the{" "}
          <strong>Variable Environment</strong>. The Variable Environment is the part of a context
          that stores the variables and functions declared inside it, as name → value pairs. (To be
          exact, the official language rules, called the ECMAScript specification, keep{" "}
          <code>var</code> and function declarations here, and <code>let</code> and{" "}
          <code>const</code> in the Lexical Environment. In this series, think of the Variable
          Environment as &ldquo;the context&apos;s own memory.&rdquo;) This lesson looks at what
          happens to it on every function call.
        </p>
        <Callout kind="note">
          <p className="mb-0">
            The core idea in one line: every function call gets its{" "}
            <strong>own, completely separate</strong> Variable Environment — even if two different
            functions, or the same function called twice, use a variable with the exact same name.
            A <strong>local variable</strong> is a variable declared inside a function. Only that
            function&apos;s code can see it.
          </p>
        </Callout>

        <h2 id="why">Why This Matters</h2>
        <ul>
          <li>
            It&apos;s why you can safely reuse simple variable names like <code>result</code>,{" "}
            <code>count</code>, or <code>temp</code> across dozens of functions in the same file
            without ever worrying about collisions.
          </li>
          <li>
            It&apos;s the foundation for a rule that is often tested in interviews: a
            function can look <em>outward</em> for variables, but never <em>sideways</em> into an
            unrelated function.
          </li>
          <li>
            It explains exactly when memory gets cleaned up after a function runs — and sets up the
            one deliberate exception to that rule, which is closures, one of the biggest topics
            later in this course. A closure is a function that keeps access to the variables of the
            place where it was created, even after that place has finished running.
          </li>
        </ul>

        <h2 id="assistants">The Two Assistants — An Analogy</h2>
        <Callout kind="note" label="Three notepads, one label">
          <p>
            The head receptionist keeps her own notepad. On it: &ldquo;Room Number: 1.&rdquo; She
            calls over her <strong>front-desk assistant</strong> for a quick task — he has his own,
            completely separate notepad, and if he writes &ldquo;Room Number: 10&rdquo; on his page,
            that&apos;s entirely his. It has nothing to do with hers.
          </p>
          <p>
            Later, she calls the <strong>housekeeping assistant</strong> over for a different task.
            He, too, has his own separate notepad — &ldquo;Room Number: 100&rdquo; on his page,
            unrelated to either of the other two.
          </p>
          <p className="mb-0">
            There are three notepads. All of them have a line labelled &ldquo;Room Number,&rdquo; and
            none of them affects the others.
          </p>
        </Callout>

        <h2 id="isolation">The Isolation Example — Traced Line By Line</h2>
        <Script title="isolation.js" code={isolation} />
        <Callout kind="ok">
          <p className="mb-0">
            Output: <code>10</code>, then <code>100</code>, then <code>1</code> — three completely
            different <code>roomNumber</code>s, three separate memory spots, no interference.
          </p>
        </Callout>
        <IsolationStepper />
        <ol className="steps">
          <li>
            <h3>Global EC — memory phase</h3>
            <p><code>roomNumber → undefined</code>, both functions fully hoisted.</p>
          </li>
          <li>
            <h3>Global EC — code phase begins</h3>
            <p><code>roomNumber = 1</code> runs.</p>
          </li>
          <li>
            <h3><code>frontDesk()</code> called</h3>
            <p>
              Brand-new EC pushed, with its <strong>own private</strong> <code>roomNumber</code>{" "}
              (<code>undefined → 10</code>). Prints <code>10</code>. Popped — its entire notepad
              thrown away.
            </p>
          </li>
          <li>
            <h3><code>housekeeping()</code> called</h3>
            <p>
              Another brand-new, <strong>unrelated</strong> EC pushed, with its own private{" "}
              <code>roomNumber</code> (<code>undefined → 100</code>). Prints <code>100</code>.
              Popped.
            </p>
          </li>
          <li>
            <h3>Back in Global</h3>
            <p>
              <code>roomNumber</code> here was never touched by either call — prints <code>1</code>.
            </p>
          </li>
        </ol>

        <h2 id="rule1">Rule 1: Outward Yes, Sideways Never</h2>
        <p>
          A function <strong>can</strong> see variables from the scope it was written inside. A scope
          is the part of the code where a name can be seen. This works because every context has a{" "}
          <strong>Lexical Environment</strong>: its own local memory plus an{" "}
          <strong>outer reference</strong>, which is a link to the Lexical Environment of the scope
          around it (Lesson 7 explains this fully). A function can <strong>never</strong> see
          another function&apos;s local variables just because it ran right before or after it.
        </p>
        <Script title="siblings.js" code={siblings} />
        <SiblingLookupStepper />
        <Callout kind="note">
          <p className="mb-0">
            The front-desk assistant and the housekeeping assistant don&apos;t share notepads just
            because one worked right before the other. They&apos;re{" "}
            <strong>siblings, not parent and child</strong> — only the head receptionist&apos;s
            notepad (global) is something either of them could ever look up to. Never each
            other&apos;s.
          </p>
        </Callout>
        <OuterReference />

        <h2 id="rule2">Rule 2: Fresh Every Time, Gone When Popped</h2>
        <p>
          The moment an Execution Context is popped off the call stack (Lesson 2), its entire
          Variable Environment is discarded. The garbage collector, the part of the engine that
          automatically frees memory that nothing can reach any more, is then free to reclaim
          that memory. Calling the same function 5 times in a row creates{" "}
          <strong>5 separate, independent</strong> Variable Environments — never shared, never
          reused.
        </p>
        <Callout kind="warn">
          <p className="mb-0">
            There is one deliberate exception to &ldquo;gone means gone.&rdquo; It is called a{" "}
            <strong>closure</strong>, and it gets its own lesson (Lesson 10). For now, remember the
            normal rule: once popped, the memory is thrown away.
          </p>
        </Callout>

        <h2 id="params">Parameters Are Part Of The Variable Environment Too</h2>
        <p>
          A <strong>parameter</strong> is a name written in the function&apos;s brackets, like{" "}
          <code>guestName</code> below. The value you pass in when you call the function is the{" "}
          <strong>argument</strong>. A parameter already has its real value the instant the
          function starts — during the memory phase itself — because the argument was already known
          at the <strong>call site</strong> (the place in the code where the function is called). That&apos;s
          different from a plain <code>var</code> written inside the body, which still starts as{" "}
          <code>undefined</code>.
        </p>
        <Script title="params.js" code={params} />
        <ParamsMemory />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Identifier</th>
                <th>Kind</th>
                <th>Value at the start of the function</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>guestName</code></td>
                <td>parameter</td>
                <td><code>&quot;Aditi&quot;</code> — already assigned</td>
              </tr>
              <tr>
                <td><code>stayNights</code></td>
                <td><code>var</code> inside the body</td>
                <td><code>undefined</code>, until its own line runs</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 id="live">See It Live — DevTools</h2>
        <ol className="steps">
          <li>
            <h3>Set two breakpoints</h3>
            <p>
              One on the <code>console.log</code> line inside <code>frontDesk</code>, one on the
              same line inside <code>housekeeping</code>.
            </p>
          </li>
          <li>
            <h3>Run the isolation example</h3>
            <p>
              Hit the first breakpoint — open the Scope panel and confirm <code>roomNumber</code>{" "}
              reads <code>10</code>, under a <strong>Local</strong> bucket separate from{" "}
              <strong>Global</strong>.
            </p>
          </li>
          <li>
            <h3>Resume to the second breakpoint</h3>
            <p>
              The earlier <strong>Local</strong> bucket for <code>frontDesk</code> is completely
              gone from the panel now — a fresh <strong>Local</strong> bucket for{" "}
              <code>housekeeping</code> shows <code>roomNumber: 100</code> instead. Two separate
              notepads, shown live.
            </p>
          </li>
          <li>
            <h3>Check the Global bucket throughout</h3>
            <p>
              <code>roomNumber: 1</code> in the <strong>Global</strong> bucket never changes across
              either breakpoint. This shows that neither function touched it.
            </p>
          </li>
        </ol>

        <h2 id="pitfalls">Common Misconceptions</h2>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;Two functions using the same variable name will conflict or overwrite each other.&rdquo;</strong>{" "}
            They won&apos;t — each function call gets its own isolated Variable Environment.
            Identical names in different functions never collide.
          </p>
        </Callout>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;A function can access a variable from a sibling function if it was called nearby.&rdquo;</strong>{" "}
            Access only goes outward through the Lexical Environment&apos;s outer reference,
            never sideways to another function&apos;s local scope, whatever the call order is.
          </p>
        </Callout>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;Function memory is always cleaned up immediately after the function returns, no exceptions.&rdquo;</strong>{" "}
            True almost always. The exception is when a closure keeps a reference to that memory, which
            prevents it from being thrown away. Lesson 10 covers this.
          </p>
        </Callout>

        <h2 id="interview">Interview Questions</h2>
        {questions.map(([q, a], i) => (
          <details key={i} className="my-3 rounded-xl border border-line bg-bg-elev px-5 py-3">
            <summary className="cursor-pointer font-semibold text-ink">{q}</summary>
            <p className="mb-0 mt-2 text-ink-dim">{a}</p>
          </details>
        ))}
      </div>

      <LessonPager slug="lesson-4" lessons={JS_LESSONS} href={jsLessonHref} series={JS_SERIES} />
    </article>
  );
}
