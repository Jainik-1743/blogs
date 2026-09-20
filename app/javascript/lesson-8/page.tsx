import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import ConstBindingBox from "@/components/figures/ConstBindingBox";
import ErrorTaxonomy from "@/components/figures/ErrorTaxonomy";
import KeywordMatrix from "@/components/figures/KeywordMatrix";
import LoopBindingStepper from "@/components/figures/LoopBindingStepper";
import ParseVsRuntimeStepper from "@/components/figures/ParseVsRuntimeStepper";
import TdzTimingStepper from "@/components/figures/TdzTimingStepper";
import TdzTraceStepper from "@/components/figures/TdzTraceStepper";
import TdzWindowDiagram from "@/components/figures/TdzWindowDiagram";
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
  { id: "matrix", label: "The three keywords side by side" },
  { id: "scope", label: "Function scope vs. block scope — and what loops do" },
  { id: "window", label: "The TDZ, precisely: where it starts and where it ends" },
  { id: "temporal", label: "Why \"temporal\" — it is about time, not position" },
  { id: "disguise", label: "The TDZ in disguise: shadowing and default parameters" },
  { id: "redeclare", label: "Redeclaration: var allows it, let and const don't" },
  { id: "parsetime", label: "The parse-time twist: why some errors crash everything" },
  { id: "taxonomy", label: "The five error types — full taxonomy" },
  { id: "typeofgotcha", label: "The typeof exception: TDZ breaks the safety net" },
  { id: "construle", label: "const: a frozen binding, not a frozen value" },
  { id: "minimize", label: "Minimizing your own TDZ window — and which keyword to use" },
  { id: "example", label: "Real example — traced line by line" },
  { id: "live", label: "See it live — console & DevTools" },
  { id: "pitfalls", label: "Common misconceptions" },
  { id: "interview", label: "Interview questions" },
];

const scopeCode = `function checkIn() {
  if (true) {
    var floor = 3;            // belongs to checkIn, not to the if
    let wing = "north";       // belongs to the if block only
    const suite = false;      // belongs to the if block only
  }
  console.log(floor);         // 3
  console.log(typeof wing);   // "undefined" — gone with the block
}`;

const loopVar = `for (var i = 0; i < 3; i++) {
  console.log(i);
}
console.log(i); // 3 — leaked out of the loop`;

const loopLet = `for (let i = 0; i < 3; i++) {
  console.log(i);
}
console.log(i); // ReferenceError: i is not defined`;

const windowCode = `function checkIn() {
  // TDZ for roomNumber starts here — the top of the scope
  console.log(typeof roomNumber); // ReferenceError
  let roomNumber;                  // ← declaration evaluated: TDZ ends
  console.log(roomNumber);         // undefined — unlocked, just empty
  roomNumber = 101;
}`;

const temporal = `function readRoom() {
  return roomNumber; // written ABOVE the let, both times
}

readRoom();          // ① ReferenceError — called before line 6 has run
let roomNumber = 101;
readRoom();          // ② 101 — same function, called after line 6 ran`;

const shadowTdz = `let roomNumber = 101;

{
  console.log(roomNumber); // ReferenceError — NOT 101
  let roomNumber = 202;    // this inner let shadows the outer one
}                          // …and its TDZ covers the whole block`;

const paramTdz = `function book(nights = stay, stay = 1) {
  return nights * stay;
}
book();      // ReferenceError: Cannot access 'stay' before initialization
book(2);     // 2 — nights was given, so \`stay\` is never read early`;

const constObj = `const guest = { name: "Aditi", room: 101 };

guest.room = 102;              // fine — the object changed, the binding did not
guest = { name: "Rahul" };     // TypeError: Assignment to constant variable.

const frozen = Object.freeze({ name: "Aditi", room: 101 });
frozen.room = 102;             // silently ignored (throws in strict mode)
console.log(frozen.room);      // 101`;

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
    "Is let hoisted? Then why does reading it early throw instead of giving undefined?",
    <>Yes, all three keywords are hoisted — a slot is reserved in the memory phase. The difference is the slot&apos;s starting state: <code>var</code> is initialised to <code>undefined</code> immediately; <code>let</code>/<code>const</code> are left uninitialised (locked) until their declaration is evaluated. Reading a locked binding throws a <code>ReferenceError</code>. The locked stretch is the Temporal Dead Zone.</>,
  ],
  [
    "What is the scope of var versus let/const?",
    <><code>var</code> is function-scoped: it belongs to the nearest enclosing function (or Global) and ignores all other braces. <code>let</code>/<code>const</code> are block-scoped: they belong to the nearest enclosing <code>{"{ }"}</code> of any kind and cease to exist when it closes.</>,
  ],
  [
    "What does for (let i = 0; …) do differently from for (var i = 0; …)?",
    <>With <code>var</code> there is one <code>i</code> slot for the whole loop, which survives after it ends. With <code>let</code> the engine creates a fresh binding for every iteration — three iterations, three separate slots — and discards them when the loop ends, so <code>i</code> is not defined afterwards. The per-iteration binding is what makes closures inside the loop capture the right value.</>,
  ],
  [
    "Exactly where does the TDZ start and end?",
    <>It starts at the top of the enclosing scope (the opening brace, or the first line of the function/file), not at the line just above the declaration. It ends the moment the declaration is evaluated — for <code>let x;</code> with no initialiser, that sets <code>x</code> to <code>undefined</code> and unlocks it.</>,
  ],
  [
    "Why is it called the *Temporal* Dead Zone?",
    <>Because it is defined by time, not position. A function that reads a <code>let</code> variable can be written above the declaration and still work — as long as it is <em>called</em> after the declaration has been evaluated. The same function called before that moment throws. Scope is decided by where code is written (lexical); readiness is decided by when it runs (temporal).</>,
  ],
  [
    "Can shadowing cause a TDZ error even when the outer variable is initialised?",
    <>Yes. An inner <code>let</code> with the same name creates a separate binding with its own TDZ covering the whole inner block. Lookups inside the block resolve to the inner binding first (nearest match wins), so reading the name before the inner declaration throws — the initialised outer value is never reached.</>,
  ],
  [
    "Why does function f(a = b, b = 1) {} throw when called with no arguments?",
    <>Default parameters are evaluated left to right in their own scope, like a sequence of <code>let</code> declarations. Evaluating <code>a = b</code> reads <code>b</code> while it is still in its TDZ. A default may refer to parameters on its left, never on its right.</>,
  ],
  [
    "Does const make a value immutable?",
    <>No — it makes the <em>binding</em> immutable: the name can never be re-pointed, and it must be given a value on the declaration line. An object or array it points to can still be mutated through it. <code>Object.freeze</code> is the (shallow) way to freeze the value itself.</>,
  ],
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
          Lesson 3 gave you the headline: <code>var</code>, <code>let</code> and <code>const</code>{" "}
          are all hoisted, and the difference is what happens next — <code>var</code> starts as{" "}
          <code>undefined</code>, <code>let</code>/<code>const</code> start <em>locked</em> in the
          Temporal Dead Zone (TDZ). This lesson is the full picture. Every axis on which the three
          keywords differ, in one grid. Function scope versus block scope, including the one place
          it bites hardest: loops. Exactly which lines the TDZ covers, why it is called{" "}
          <em>temporal</em> rather than positional, and the two places it hides where you would
          not expect it. Then the parts that trip up even experienced developers: redeclaration,
          errors that stop your whole file before a single line runs, the five distinct error
          messages, and the one real exception to &ldquo;<code>typeof</code> is always safe&rdquo;.
        </p>
        <Callout kind="note">
          <p className="mb-0">
            One mental model carries the whole lesson: <strong>a declaration reserves a slot in the
            memory phase; the keyword decides what the slot starts as, which braces own it, and
            what you are allowed to do to it afterwards.</strong> Everything below is a consequence
            of those three decisions.
          </p>
        </Callout>

        <h2 id="why">Why This Matters</h2>
        <ul>
          <li>
            &ldquo;Which keyword should I use?&rdquo; is answered properly only once you can see all
            the differences at once — scope, initial value, reassignment, redeclaration and the
            global object — rather than the one or two you happen to remember.
          </li>
          <li>
            The loop case (<code>for (var i…)</code> versus <code>for (let i…)</code>) is behind
            the single most famous JavaScript interview question, which Lesson 11 traces in full.
            This lesson gives you the memory picture it depends on.
          </li>
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

        <h2 id="matrix">The Three Keywords Side By Side</h2>
        <p>
          Before going deep on any one row, here is the whole table. Read it top to bottom once
          now; the rest of the lesson explains the rows that need explaining.
        </p>
        <KeywordMatrix />
        <p>
          Three things to notice. First, the <strong>hoisting row is identical</strong> — the
          engine reserves a slot for all three in the memory phase (Lesson 1). Second, the
          differences split cleanly into two families: <code>var</code> on one side,{" "}
          <code>let</code>/<code>const</code> on the other, with <code>const</code> adding exactly
          two extra rules on top of <code>let</code> (must initialise, cannot reassign). Third,
          the last row is the mechanism behind several of the others — <code>let</code>/
          <code>const</code> live in a private record the engine controls directly (Lesson 3),
          which is what makes a &ldquo;locked&rdquo; state possible at all.
        </p>

        <h2 id="scope">Function Scope vs. Block Scope — And What Loops Do</h2>
        <p>
          <code>var</code> is <strong>function-scoped</strong>: it belongs to the nearest enclosing
          function (or to Global if there is none), and it ignores every other pair of braces on
          the way. <code>let</code> and <code>const</code> are <strong>block-scoped</strong>: they
          belong to the nearest enclosing <code>{"{ }"}</code> of any kind — <code>if</code>,{" "}
          <code>for</code>, <code>while</code>, a bare block, a function body.
        </p>
        <Script title="scope.js" code={scopeCode} />
        <p>
          Inside <code>checkIn</code>, <code>floor</code> is hoisted to the function&apos;s own
          memory during the memory phase, exactly as if it had been written on the first line of
          the function — the <code>if</code> braces are invisible to it. <code>wing</code> and{" "}
          <code>suite</code> are created when the block is entered and destroyed when it closes;
          by line 8 they do not exist anywhere in the scope chain (Lesson 7).
        </p>
        <p>
          The place this matters most is a <code>for</code> loop, because a loop is a block that
          runs many times:
        </p>
        <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-4">
          <Script title="loop-var.js" code={loopVar} />
          <Script title="loop-let.js" code={loopLet} />
        </div>
        <p>
          The visible difference is the last line. The important difference is invisible: with{" "}
          <code>var</code> there is <strong>one</strong> <code>i</code> for the whole loop, mutated
          three times. With <code>let</code>, the engine creates a{" "}
          <strong>fresh binding for every iteration</strong> — three separate slots that happen to
          share a name — and throws them all away when the loop ends.
        </p>
        <LoopBindingStepper />
        <Callout kind="note" label="Why the per-iteration binding matters">
          <p className="mb-0">
            Right now the three <code>let</code> slots look like a technicality — the console
            output is identical. It stops being a technicality the moment something inside the loop
            body <em>remembers</em> <code>i</code> for later, such as a <code>setTimeout</code>{" "}
            callback. That is the <code>var</code>-prints-<code>3, 3, 3</code> interview classic,
            and it is entirely explained by &ldquo;one slot versus three slots&rdquo;. Lesson 11
            traces it step by step; bank the picture now.
          </p>
        </Callout>

        <h2 id="window">The TDZ, Precisely: Where It Starts And Where It Ends</h2>
        <p>
          &ldquo;Before the declaration&rdquo; is the informal description. The precise one has
          two ends:
        </p>
        <ul>
          <li>
            <strong>It starts at the top of the enclosing scope</strong> — the opening brace of the
            block (or the first line of the function or file) — not at the line above the
            declaration. Every line of the scope that comes before the declaration is in the zone.
          </li>
          <li>
            <strong>It ends when the declaration is evaluated</strong> — when execution actually
            reaches and runs the <code>let</code>/<code>const</code> line. For <code>let</code>{" "}
            with no initialiser, that moment sets the binding to <code>undefined</code>: unlocked,
            merely empty, readable without error.
          </li>
        </ul>
        <Script title="window.js" code={windowCode} />
        <TdzWindowDiagram />
        <p>
          Line 5 is the detail people miss. <code>let roomNumber;</code> is not &ldquo;still
          uninitialised&rdquo; — evaluating the declaration <em>is</em> the initialisation, to{" "}
          <code>undefined</code>. After that line, <code>roomNumber</code> behaves like any empty
          variable. The lock is tied to the declaration being <em>reached</em>, not to a value
          being provided.
        </p>

        <h2 id="temporal">Why &ldquo;Temporal&rdquo; — It Is About Time, Not Position</h2>
        <p>
          The name is precise. The dead zone is a stretch of <em>time</em> during execution — from
          the scope being entered until the declaration runs — not a stretch of <em>lines</em> in
          the file. The cleanest proof is a function that reads the variable, written above the
          declaration both times, called twice:
        </p>
        <Script title="temporal.js" code={temporal} />
        <TdzTimingStepper />
        <Callout kind="note">
          <p className="mb-0">
            Same function, same line 2, same position above the <code>let</code>. Call ① throws,
            call ② returns <code>101</code>. Nothing about the code&apos;s layout changed between
            them — only <em>when</em> the read happened relative to the declaration being
            evaluated. That is the whole meaning of &ldquo;temporal&rdquo;, and it is why a
            lexical (position-based) rule like scope (Lesson 7) and a temporal rule like the TDZ
            can coexist: scope decides <em>which</em> binding a name refers to; the TDZ decides
            whether that binding is <em>ready yet</em>.
          </p>
        </Callout>

        <h2 id="disguise">The TDZ In Disguise: Shadowing And Default Parameters</h2>
        <p>
          Two places the TDZ appears where people do not expect a declaration to matter at all.
        </p>
        <h3>Shadowing creates a fresh TDZ for the inner name</h3>
        <Script title="shadow-tdz.js" code={shadowTdz} />
        <p>
          The outer <code>roomNumber</code> is fully initialised — <code>101</code> is right there.
          But the block declares its <em>own</em> <code>roomNumber</code> (Lesson 7&apos;s
          shadowing), so inside the block every reference to that name resolves to the inner
          binding, which is locked from the block&apos;s opening brace until line 5. The lookup
          never climbs to the outer <code>101</code>, because the nearest match wins — and the
          nearest match is in its dead zone. Reading line 4, you would swear it prints{" "}
          <code>101</code>. It throws.
        </p>
        <h3>Default parameters are evaluated left to right, in their own scope</h3>
        <Script title="param-tdz.js" code={paramTdz} />
        <p>
          Parameters with defaults behave like a sequence of <code>let</code> declarations,
          evaluated in order. When <code>book()</code> is called with no arguments, the engine
          evaluates <code>nights = stay</code> first — and <code>stay</code>, one position to the
          right, is still in its TDZ. Give <code>nights</code> a value and its default expression
          is never evaluated, so <code>stay</code> is never read early and nothing throws. A
          default may refer to any parameter to its <em>left</em>, never to its right.
        </p>

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

        <h2 id="construle">const: A Frozen Binding, Not A Frozen Value</h2>
        <p>
          <code>const</code> is <code>let</code> plus two rules: the declaration must carry an
          initialiser (otherwise a <code>SyntaxError</code> at parse time — there would never be a
          moment to give it a value), and the binding can never be reassigned (a{" "}
          <code>TypeError</code> at runtime). Both rules are about the <strong>binding</strong> —
          the arrow from the name to the value. Neither says anything about the value at the other
          end of the arrow.
        </p>
        <Script title="const.js" code={constObj} />
        <ConstBindingBox />
        <p>
          For primitives (numbers, strings, booleans) the distinction is invisible, because a
          primitive cannot be changed in place — the only way to &ldquo;change&rdquo; it is to
          re-point the binding, which <code>const</code> forbids. For objects and arrays the
          distinction is everything: <code>guest.room = 102</code> reaches through the arrow and
          edits the object; the arrow itself is untouched. If you want the object frozen too,
          that is a separate, explicit request — <code>Object.freeze</code> — and it is shallow:
          nested objects inside remain mutable.
        </p>

        <h2 id="minimize">Minimizing Your Own TDZ Window — And Which Keyword To Use</h2>
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
        <Callout kind="ok" label="The decision rule, in one line">
          <p className="mb-0">
            <strong><code>const</code> unless you will reassign; then <code>let</code>; never{" "}
            <code>var</code>.</strong> The reasoning is the matrix above: <code>const</code> gives
            you block scope, no accidental global property, no silent redeclaration, and a
            guarantee that the name always points at the same thing — every one of those is a
            class of bug removed. Reach for <code>let</code> only when the binding genuinely has
            to move (a loop counter, an accumulator). The only time you will still meet{" "}
            <code>var</code> is in code written before 2015, and in interview questions designed
            to check you understand why it was replaced.
          </p>
        </Callout>

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
            <h3>Watch the TDZ in the Scope panel</h3>
            <Script title="scope-panel.js" code={`function checkIn() {
  debugger;            // paused here, roomNumber is in the TDZ
  let roomNumber = 101;
  debugger;            // paused here, it is 101
}
checkIn();`} />
            <p>
              At the first pause, open <strong>Scope → Local</strong>: Chrome lists{" "}
              <code>roomNumber</code> already, with the value{" "}
              <code>&lt;value unavailable&gt;</code> — its way of showing a binding that exists
              but is locked. Resume to the second pause and the same entry reads <code>101</code>.
              That is the TDZ, rendered by the engine itself.
            </p>
          </li>
          <li>
            <h3>Count the loop slots</h3>
            <Script title="console" code={`for (let i = 0; i < 3; i++) { debugger; }`} />
            <p>
              Each time it pauses, <strong>Scope → Block</strong> shows an <code>i</code> — and
              stepping to the next iteration shows a <em>new</em> Block scope, not the same one
              with a bigger number. Swap <code>let</code> for <code>var</code> and the Block scope
              disappears: <code>i</code> now sits in <strong>Local</strong> (or Global) for the
              whole loop.
            </p>
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

        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;The TDZ is the lines above the declaration.&rdquo;</strong> It is the{" "}
            <em>time</em> before the declaration is evaluated. A function written above the{" "}
            <code>let</code> reads it fine when called after the <code>let</code> has run, and
            throws when called before — same lines, different moment.
          </p>
        </Callout>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;If the outer variable is initialised, an inner one with the same name is safe to read.&rdquo;</strong>{" "}
            Shadowing gives the inner name its own binding with its own TDZ, and the lookup stops
            at the nearest match — so the initialised outer value is never even consulted.
          </p>
        </Callout>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;<code>const</code> makes the object immutable.&rdquo;</strong> It makes
            the <em>binding</em> immutable. Properties of the object can still be changed; only
            re-pointing the name is forbidden. Freezing the value is a separate operation.
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
