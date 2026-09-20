import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import ErrorTaxonomy from "@/components/figures/ErrorTaxonomy";
import ParseVsRuntimeStepper from "@/components/figures/ParseVsRuntimeStepper";
import TdzTraceStepper from "@/components/figures/TdzTraceStepper";
import TypeofTdzStepper from "@/components/figures/TypeofTdzStepper";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { JS_LESSONS, JS_SERIES, jsLessonHref } from "@/lib/javascript";

const lesson = JS_LESSONS.find((l) => l.slug === "lesson-8")!;

export const metadata: Metadata = {
  title: `Lesson 8 — ${lesson.title}`,
  description: lesson.summary,
};

/** In-page index. Each entry links to a section heading below. */
const outline = [
  { id: "concept", label: "Concept" },
  { id: "why", label: "Why this matters" },
  { id: "blueprint", label: "The blueprint vs. the locked room — an analogy" },
  { id: "redeclare", label: "Redeclaration: var allows it, let and const don't" },
  { id: "parsetime", label: "The parse-time twist: why some errors crash everything" },
  { id: "taxonomy", label: "The five error types — full taxonomy" },
  { id: "typeofgotcha", label: "The typeof exception: TDZ breaks the safety net" },
  { id: "minimize", label: "Minimizing your own TDZ window" },
  { id: "example", label: "Real example — traced line by line" },
  { id: "live", label: "See it live — console & DevTools" },
  { id: "pitfalls", label: "Common misconceptions" },
  { id: "interview", label: "Interview questions" },
];

const redeclare = `var guestCount = 10;
var guestCount = 20; // totally fine — var allows redeclaring

let roomNumber = 101;
let roomNumber = 102; // SyntaxError: Identifier 'roomNumber' has already been declared

let discountRate = 5;
var discountRate = 10; // also SyntaxError — mixing var with an existing let in the same scope`;

const syntax = `console.log("This never prints — not even this line!");
let x = 1;
let x = 2; // SyntaxError: Identifier 'x' has already been declared`;

const tdz = `console.log("This DOES print completely fine");
console.log(y); // ReferenceError: Cannot access 'y' before initialization
let y = 1;`;

const typeofCode = `console.log(typeof unicornVariable); // "undefined" — safe, never declared anywhere

console.log(typeof discountRate);    // ReferenceError! — even typeof can't rescue a TDZ access
let discountRate = 10;`;

const example = `function checkIn() {
  console.log(typeof roomReady); // ReferenceError — TDZ, not "undefined"
  let roomReady = true;
  console.log(roomReady);        // true

  let roomReady = false;         // SyntaxError, caught before checkIn() even runs
}
checkIn();`;

const questions: [React.ReactNode, React.ReactNode][] = [
  [
    "Can you redeclare a var in the same scope? Can you redeclare a let?",
    <><code>var</code> can be redeclared freely in the same scope. <code>let</code>/<code>const</code> throw a <code>SyntaxError</code> if redeclared in the same scope.</>,
  ],
  [
    "Why does a SyntaxError sometimes prevent even correct code from running?",
    <>Because the engine parses the entire file before executing any of it — a <code>SyntaxError</code> is caught during that parse phase, so nothing in the file runs at all, not even code positioned before the mistake.</>,
  ],
  [
    "Name the five error types covered here, and what triggers each.",
    "“is not defined” (never declared), “cannot access before initialization” (TDZ), duplicate declaration (redeclaring let/const), missing initializer (uninitialized const), and assignment to constant (reassigning const).",
  ],
  [
    "Does typeof ever throw an error?",
    "Yes — one exception. It's safe on a name that was never declared at all, but it still throws if the name exists and is currently inside the TDZ.",
  ],
  [
    "How can you minimize the practical impact of the TDZ in your own code?",
    <>Declare variables as close to the top of their scope as possible, and default to <code>const</code>, using <code>let</code> only where reassignment is truly needed.</>,
  ],
  [
    "What's the difference between a SyntaxError and a runtime error like ReferenceError or TypeError?",
    "A SyntaxError is found while the engine reads the file, before execution begins. ReferenceError and TypeError only happen once execution reaches the offending line.",
  ],
];

export default function JsLessonEightPage() {
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
          Lesson 8 · {lesson.readTime} read
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
          Quick recap from Lesson 3: <code>let</code> and <code>const</code> are hoisted into a
          locked state called the Temporal Dead Zone (TDZ) — they exist in memory, but touching
          them before their declaration line throws instead of returning <code>undefined</code>.
          This lesson goes past that basic behaviour into the parts that actually trip people up:
          what happens when you declare the same name twice, why some mistakes stop your entire
          file from running at all, and one real exception to a rule you learned as absolute in
          Lesson 6.
        </p>

        <h2 id="why">Why This Matters</h2>
        <ul>
          <li>
            Redeclaration bugs are common when refactoring — knowing exactly which combinations
            throw and which don&apos;t saves real debugging time.
          </li>
          <li>
            Understanding that some errors are caught <em>before</em> your code even starts running
            explains why &ldquo;but the console.log above the error never even printed&rdquo;
            happens.
          </li>
          <li>
            The five distinct error types are a favourite interview drill — knowing which one
            applies to which mistake proves real understanding, not memorized keywords.
          </li>
          <li>
            The <code>typeof</code> TDZ exception is a genuine gotcha that catches even experienced
            developers off guard.
          </li>
        </ul>

        <h2 id="blueprint">The Blueprint vs. The Locked Room — An Analogy</h2>
        <Callout kind="note" label="Two completely different kinds of &ldquo;it didn't work&rdquo;">
          <p>
            Imagine a building inspector reviewing the hotel&apos;s blueprint{" "}
            <strong>before construction even starts</strong>. If the blueprint itself has a real
            mistake — say, the same room number used twice on the same floor — the inspector
            rejects it outright. Construction never begins. Not even the perfectly fine lobby on
            that same blueprint gets built that day, because the whole plan was thrown out before a
            single brick was laid.
          </p>
          <p>
            Now imagine the blueprint was fine, construction went ahead, and the hotel opened. A
            guest tries a specific room before it&apos;s officially ready and finds the door locked
            — that&apos;s the TDZ. Everything else in the hotel is running completely normally; only
            that one specific room is temporarily off-limits.
          </p>
          <p className="mb-0">
            One is a <strong>plan that never gets approved at all</strong>. The other is a{" "}
            <strong>working building with one locked door</strong>. JavaScript treats these as two
            entirely different categories of error.
          </p>
        </Callout>

        <h2 id="redeclare">Redeclaration: var Allows It, let And const Don&apos;t</h2>
        <Script title="redeclare.js" code={redeclare} />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Combination in the same scope</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><code>var</code> declared twice</td><td className="font-semibold text-emerald-300">Allowed</td></tr>
              <tr><td><code>let</code> declared twice</td><td className="font-semibold text-red-300"><code>SyntaxError</code></td></tr>
              <tr><td><code>const</code> declared twice</td><td className="font-semibold text-red-300"><code>SyntaxError</code></td></tr>
              <tr><td><code>var</code> then <code>let</code>/<code>const</code> with the same name</td><td className="font-semibold text-red-300"><code>SyntaxError</code></td></tr>
            </tbody>
          </table>
        </div>

        <h2 id="parsetime">The Parse-Time Twist: Why Some Errors Crash Everything</h2>
        <p>
          Before running a single line, the JS engine <strong>reads and checks your entire file first</strong>.
          A duplicate <code>let</code> declaration is caught right here, during this check — which
          means the error exists before execution has even started.
        </p>
        <Script title="syntax.js" code={syntax} />
        <p>Compare that with a TDZ violation, which is a genuine <strong>runtime</strong> error:</p>
        <Script title="tdz.js" code={tdz} />
        <ParseVsRuntimeStepper />
        <Callout kind="warn">
          <p className="mb-0">
            Same file structure, wildly different outcomes. A <code>SyntaxError</code> is found
            while the engine is still reading your file — nothing runs, not even correct code
            positioned before the mistake. A <code>ReferenceError</code> only happens once execution
            actually reaches that specific line — everything before it runs completely normally.
          </p>
        </Callout>

        <h2 id="taxonomy">The Five Error Types — Full Taxonomy</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Error</th>
                <th>Cause</th>
                <th>Example</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><code>ReferenceError: x is not defined</code></td><td>Name never declared anywhere in scope</td><td><code>console.log(neverDeclared)</code></td></tr>
              <tr><td><code>ReferenceError: Cannot access &apos;x&apos; before initialization</code></td><td>Accessed during the TDZ</td><td><code>console.log(a); let a = 1;</code></td></tr>
              <tr><td><code>SyntaxError: Identifier has already been declared</code></td><td>Redeclaring a <code>let</code>/<code>const</code></td><td><code>let x = 1; let x = 2;</code></td></tr>
              <tr><td><code>SyntaxError: Missing initializer in const declaration</code></td><td>An uninitialized <code>const</code></td><td><code>const x;</code></td></tr>
              <tr><td><code>TypeError: Assignment to constant variable</code></td><td>Reassigning a <code>const</code></td><td><code>const x = 1; x = 2;</code></td></tr>
            </tbody>
          </table>
        </div>
        <ErrorTaxonomy />
        <Callout kind="note">
          <p className="mb-0">
            Five genuinely different mistakes, five genuinely different error names. Interviewers
            use this table constantly — being able to name the exact error for a given snippet,
            without running it, is a strong, quick signal that you actually understand what&apos;s
            happening rather than just recognizing keywords.
          </p>
        </Callout>

        <h2 id="typeofgotcha">The typeof Exception: TDZ Breaks The Safety Net</h2>
        <p>
          Lesson 6 taught you that <code>typeof</code> is always safe — it never throws, even on a
          name that was never declared. That rule has exactly one exception, and it&apos;s the TDZ:
        </p>
        <Script title="typeof.js" code={typeofCode} />
        <TypeofTdzStepper />
        <Callout kind="bad">
          <p className="mb-0">
            <code>typeof</code> only protects you against a name that{" "}
            <strong>doesn&apos;t exist at all</strong>. It offers zero protection against a name
            that exists but is still locked in the TDZ — that still throws, safety net or not. This
            single case is genuinely easy to get wrong, including for experienced developers
            who&apos;ve internalized &ldquo;typeof is always safe&rdquo; a little too literally.
          </p>
        </Callout>

        <h2 id="minimize">Minimizing Your Own TDZ Window</h2>
        <p>
          The TDZ exists for every <code>let</code>/<code>const</code> from the top of its scope
          until its declaration line runs. You can&apos;t remove it, but you can make it as short
          as possible:
        </p>
        <ul>
          <li>Declare variables as close as possible to the top of the scope they belong to.</li>
          <li>Avoid deeply separating a variable&apos;s declaration from its first real use.</li>
          <li>
            Prefer <code>const</code> by default, use <code>let</code> only when reassignment is
            genuinely needed, and avoid <code>var</code> entirely in new code — this alone
            sidesteps almost every mistake in this lesson.
          </li>
        </ul>

        <h2 id="example">Real Example — Traced Line By Line</h2>
        <Script title="checkin.js" code={example} />
        <TdzTraceStepper />
        <ol className="steps">
          <li>
            <h3>File is parsed first</h3>
            <p>
              The engine reads through <code>checkIn</code>&apos;s body ahead of time and finds two{" "}
              <code>let roomReady</code> declarations in the same scope — a <code>SyntaxError</code>{" "}
              is raised immediately.
            </p>
          </li>
          <li>
            <h3>Nothing inside checkIn ever runs</h3>
            <p>
              Not the first <code>console.log</code>, not the assignment, not the second{" "}
              <code>console.log</code> — the whole function body is invalid before{" "}
              <code>checkIn()</code> is ever called.
            </p>
          </li>
          <li>
            <h3>Fixing it</h3>
            <p>
              Remove the duplicate declaration, and now the first line correctly throws a{" "}
              <em>different</em> error — a TDZ <code>ReferenceError</code> from the{" "}
              <code>typeof</code> gotcha — since <code>roomReady</code> hasn&apos;t been declared
              yet at that point.
            </p>
          </li>
        </ol>

        <h2 id="live">See It Live — Console &amp; DevTools</h2>
        <ol className="steps">
          <li>
            <h3>Open the console</h3>
            <p>Any page → DevTools (F12) → Console tab.</p>
          </li>
          <li>
            <h3>Trigger a SyntaxError</h3>
            <Script title="console" code={`let a = 1;\nlet a = 2; // SyntaxError, shown instantly — before you even press enter on the next line`} />
          </li>
          <li>
            <h3>Trigger a TDZ ReferenceError</h3>
            <Script title="console" code={`console.log(typeof b); // ReferenceError\nlet b = 1;`} />
          </li>
          <li>
            <h3>Compare with an undeclared name</h3>
            <Script title="console" code={`console.log(typeof totallyUnknown); // "undefined" — no error at all`} />
          </li>
          <li>
            <h3>Confirm the difference side by side</h3>
            <p>
              Notice the console still shows the SyntaxError as a red flag attached to the whole
              snippet, not to one specific executed line — visual proof it was caught before
              execution.
            </p>
          </li>
        </ol>

        <h2 id="pitfalls">Common Misconceptions</h2>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;All JavaScript errors behave the same way — they just stop at the line that&apos;s wrong.&rdquo;</strong>{" "}
            Not true. A <code>SyntaxError</code> is caught while the engine is still reading your
            file, before anything runs — even correct code above the mistake never executes. A{" "}
            <code>ReferenceError</code> or <code>TypeError</code> only fires once execution actually
            reaches that line.
          </p>
        </Callout>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;typeof never throws, under any circumstances.&rdquo;</strong> It
            doesn&apos;t throw for a name that was never declared — but it does throw for a name
            that exists and is still stuck in the TDZ.
          </p>
        </Callout>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;var and let behave the same way regarding redeclaration, just with different scoping.&rdquo;</strong>{" "}
            They don&apos;t — <code>var</code> happily allows redeclaring the same name in the same
            scope; <code>let</code>/<code>const</code> throw a <code>SyntaxError</code> immediately
            if you try.
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

      <LessonPager slug="lesson-8" lessons={JS_LESSONS} href={jsLessonHref} series={JS_SERIES} />
    </article>
  );
}
