import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import Script from "@/components/Script";
import { JS_LESSONS, JS_READINGS, JS_SERIES, jsLessonHref } from "@/lib/javascript";

const reading = JS_READINGS.find((r) => r.slug === "recap")!;

export const metadata: Metadata = {
  title: reading.title,
  description: reading.summary,
};

const outline = [
  { id: "l1", label: "1. Execution Context" },
  { id: "l2", label: "2. Call Stack" },
  { id: "l3", label: "3. var, let, const" },
  { id: "l4", label: "4. Variable Environments" },
  { id: "l5", label: "5. Window & Global this" },
  { id: "l6", label: "6. undefined vs. Not Defined" },
  { id: "l7", label: "7. Scope Chain" },
  { id: "l8", label: "8. Temporal Dead Zone" },
  { id: "l9", label: "9. Block Scope & Shadowing" },
  { id: "l10", label: "10. Closures" },
  { id: "l11", label: "11. setTimeout + Closures" },
  { id: "l12", label: "12. Callbacks & Listeners" },
  { id: "l13", label: "13. JS Engine & V8" },
  { id: "l14", label: "14. Event Loop" },
  { id: "drill", label: "Output-prediction drill" },
  { id: "rapidfire", label: "Rapid-fire Q&A" },
];

const c1 = `console.log(count);     // undefined  ← memory phase already created it
console.log(increment); // ƒ increment() { ... }  ← whole function is ready

var count = 0;
function increment() {
  count++;
}

increment();
console.log(count);     // 1  ← now the code phase has run`;

const c2 = `let count = 0;

function bump() {
  count++;
  console.log("bump →", count);
}

function runTwice() {
  bump();
  bump();
  console.log("runTwice done");
}

runTwice();
// bump → 1
// bump → 2
// runTwice done

// Stack over time:
// [GEC] → [GEC, runTwice] → [GEC, runTwice, bump] → [GEC, runTwice]
//       → [GEC, runTwice, bump] → [GEC, runTwice] → [GEC]`;

const c3 = `var count = 0;
count++;              // fine
var count = 10;       // fine — var can be redeclared

let total = 0;
total++;              // fine — reassigning is allowed
// let total = 5;     // SyntaxError: Identifier 'total' has already been declared

const LIMIT = 5;
// LIMIT++;           // TypeError: Assignment to constant variable

const counter = { count: 0 };
counter.count++;      // ALLOWED — mutating the object's contents
console.log(counter); // { count: 1 }
// counter = {};      // TypeError — reassigning the binding is not allowed`;

const c4 = `function counter() {
  let count = 0;   // brand new variable on EVERY call
  count++;
  return count;
}

console.log(counter()); // 1
console.log(counter()); // 1  ← NOT 2 — fresh environment each time
console.log(counter()); // 1`;

const c5 = `var count = 0;
let total = 0;

console.log(window.count);    // 0          ← var attaches to window
console.log(window.total);    // undefined  ← let does not
console.log(this === window); // true       ← at top level, non-strict

function bump() {
  console.log(this === window); // true in non-strict, undefined-this in strict mode
}
bump();`;

const c6 = `var count;
console.log(count);          // undefined      ← declared, no value yet
console.log(typeof count);   // "undefined"

console.log(total);          // ReferenceError: total is not defined
console.log(typeof total);   // "undefined"    ← safe, doesn't throw

let score = null;            // deliberately empty — different intent
console.log(score);          // null
console.log(typeof score);   // "object"  ← famous JS quirk, worth knowing`;

const c7 = `let count = 100;         // global

function outer() {
  let step = 5;          // outer's scope

  function inner() {
    count += step;       // both found by walking outward
    console.log(count);
  }

  inner();
}

outer();                 // 105
console.log(step);       // ReferenceError — lookup never goes inward`;

const c8 = `// ---- TDZ starts here for \`count\` ----
console.log(total);   // undefined  ← var: hoisted AND initialized
console.log(count);   // ReferenceError: Cannot access 'count' before initialization

var total = 0;
let count = 0;
// ---- TDZ for \`count\` ends on the line above ----

count++;
console.log(count);   // 1`;

const c9 = `let count = 1;
{
  let count = 99;      // a separate variable, living only in this block
  count++;
  console.log(count);  // 100
}
console.log(count);    // 1   ← outer one never touched

var total = 1;
{
  var total = 99;      // NOT a copy — the exact same variable
  total++;
}
console.log(total);    // 100 ← the outer value was overwritten`;

const c10 = `function createCounter() {
  let count = 0;             // lives in createCounter's lexical environment

  return function () {
    count++;                 // still reachable after createCounter() has returned
    return count;
  };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2   ← count SURVIVED — this is the closure
console.log(counter()); // 3

const another = createCounter();
console.log(another()); // 1   ← a completely independent closure
console.log(counter()); // 4   ← the first one is untouched`;

const c11 = `// BROKEN — one shared \`count\`
for (var count = 1; count <= 3; count++) {
  setTimeout(() => console.log(count), count * 1000);
}
// 4, 4, 4   ← loop finished long before any callback ran

// FIX 1 — let gives each iteration its own binding
for (let count = 1; count <= 3; count++) {
  setTimeout(() => console.log(count), count * 1000);
}
// 1, 2, 3

// FIX 2 — IIFE creates a new scope per iteration (the pre-ES6 answer)
for (var count = 1; count <= 3; count++) {
  (function (captured) {
    setTimeout(() => console.log(captured), captured * 1000);
  })(count);
}
// 1, 2, 3`;

const c12 = `let count = 0;

function bumpAndLog(step) {
  count += step;
  console.log(count);
}

// higher-order function: takes a callback, decides when to call it
function repeat(times, callback) {
  for (let i = 1; i <= times; i++) callback(i);
}

repeat(3, bumpAndLog);
// 1
// 3   (1 + 2)
// 6   (3 + 3)

// Listener gotcha
const btn = document.querySelector("#bump");
btn.addEventListener("click", bumpAndLog);
btn.removeEventListener("click", bumpAndLog);   // works — same reference
btn.removeEventListener("click", (n) => count++); // does nothing — new function`;

const c13 = `function increment(n) {
  return n + 1;
}

let count = 0;
for (let i = 0; i < 1_000_000; i++) {
  count = increment(count);
}
console.log(count); // 1000000

// What V8 did:
// 1. Parse    → tokens → AST
// 2. Ignition → bytecode, runs immediately
// 3. TurboFan → notices increment() is "hot" after thousands of calls,
//               compiles it to optimized machine code mid-run
// 4. Orinoco  → frees memory nothing can reach anymore (Mark-and-Sweep)`;

const c14 = `let count = 0;

console.log("sync start", ++count);        // sync start 1

setTimeout(() => {
  console.log("macrotask", ++count);       // runs LAST
}, 0);

Promise.resolve().then(() => {
  console.log("microtask", ++count);       // runs before the timer
});

console.log("sync end", ++count);          // sync end 2

// Output:
// sync start 1
// sync end 2
// microtask 3   ← microtask queue drains first
// macrotask 4   ← even with a 0ms delay`;

const drill: { code: string; answer: React.ReactNode }[] = [
  {
    code: `console.log(count);
var count = 5;
console.log(count);`,
    answer: (
      <>
        <strong>undefined, then 5.</strong> In the memory creation phase <code>count</code> was
        created and set to <code>undefined</code>; the assignment to 5 only happens when the code
        phase reaches that line.
      </>
    ),
  },
  {
    code: `function counter() {
  let count = 0;
  count++;
  return count;
}
console.log(counter(), counter(), counter());`,
    answer: (
      <>
        <strong>1 1 1.</strong> Every call creates a fresh variable environment, so{" "}
        <code>count</code> starts at 0 each time. No closure is involved — nothing is retained
        between calls.
      </>
    ),
  },
  {
    code: `function createCounter() {
  let count = 0;
  return () => ++count;
}
const a = createCounter();
const b = createCounter();
console.log(a(), a(), b());`,
    answer: (
      <>
        <strong>1 2 1.</strong> <code>a</code> holds a closure over its own <code>count</code>, so
        it increments across calls. <code>b</code> is a separate call to <code>createCounter</code>
        , so it gets a completely independent <code>count</code> starting at 0.
      </>
    ),
  },
  {
    code: `let count = 1;
{
  var count2 = 2;
  let count3 = 3;
}
console.log(count2);
console.log(count3);`,
    answer: (
      <>
        <strong>2, then ReferenceError: count3 is not defined.</strong> <code>var</code> ignores
        the block and leaks out to the enclosing scope; <code>let</code> is confined to the block
        and no longer exists once it ends.
      </>
    ),
  },
  {
    code: `console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");`,
    answer: (
      <>
        <strong>A, D, C, B.</strong> Synchronous code first (A, D). Then the stack empties and the
        microtask queue drains completely (C). Only then does one macrotask run (B) — the 0ms
        delay doesn&apos;t change the priority.
      </>
    ),
  },
  {
    code: `for (var i = 1; i <= 3; i++) {
  setTimeout(() => console.log(i), 0);
}`,
    answer: (
      <>
        <strong>4, 4, 4.</strong> One shared <code>i</code>; by the time the callbacks run, the
        loop has finished and <code>i</code> is 4. The one-word fix: change <code>var</code> to{" "}
        <code>let</code>, which creates a fresh binding per iteration → 1, 2, 3.
      </>
    ),
  },
];

const rapidfire: [string, React.ReactNode][] = [
  ["What are the two phases of an execution context?", <>Memory creation phase (vars get <code>undefined</code>, function declarations get their full body) and code execution phase (runs line by line).</>],
  ["Are let and const hoisted?", "Yes — but into a separate, uninitialized state called the Temporal Dead Zone, so accessing them early throws \"Cannot access before initialization\" instead of returning undefined."],
  ["Difference between undefined and not defined?", "undefined = the variable exists but has no value yet. not defined = it was never declared; accessing it throws a ReferenceError."],
  ["Why can I mutate an object declared with const?", "const locks the binding, not the contents. The variable can't point somewhere new, but the object it points to is still mutable."],
  ["Is the scope chain decided at call time or author time?", "Author time — JavaScript is lexically (statically) scoped. Where the function is written determines what it can see, not where it's called from."],
  ["What exactly is a closure?", "A function together with a live reference to the lexical environment it was created in, which keeps those variables alive even after the outer function has returned and been popped off the stack."],
  ["Does a closure capture a value or a reference?", "A reference. If the outer variable changes after the closure is created, the closure sees the new value — that's exactly why the var-loop bug prints the final value."],
  ["Two calls to the same factory — do they share a closure?", "No. Each call creates its own execution context and its own lexical environment, so each returned function gets a completely independent set of variables."],
  ["Can closures cause memory leaks?", "Yes — anything still referenced by a live closure can't be garbage collected. A common real case is an event listener that's never removed, keeping its entire surrounding scope alive."],
  ["Why does removeEventListener sometimes do nothing?", "Because it was passed a different function reference. It must receive the exact same function object that was added — an identical-looking new arrow function won't match."],
  ["Name V8's interpreter, optimizing compiler, and garbage collector.", "Ignition, TurboFan, and Orinoco. Ignition and TurboFan work simultaneously — that's what JIT compilation means."],
  ["Is setTimeout part of JavaScript?", "No. It's a Web API provided by the browser (or by Node's runtime), exposed through the global object. The engine itself only has the call stack and heap."],
  ["Promise .then() vs setTimeout(fn, 0) — which runs first?", "The promise callback. It's a microtask, and the entire microtask queue drains before a single macrotask (the timer) is allowed to run."],
  ["What is starvation in the event loop?", "When microtasks keep scheduling more microtasks, the queue never empties — so the callback queue and even browser rendering never get a turn."],
  ["Is JavaScript single-threaded or multi-threaded?", "Single-threaded — one call stack, one thing at a time. Concurrency comes from offloading work to Web APIs and scheduling the results back through the queues, not from extra JS threads."],
];

function Card({
  id,
  num,
  title,
  bullets,
  code,
  codeTitle,
  callout,
  say,
}: {
  id: string;
  num: number;
  title: string;
  bullets: React.ReactNode[];
  code: string;
  codeTitle: string;
  callout?: React.ReactNode;
  say: React.ReactNode;
}) {
  return (
    <div id={id} className="mb-8 rounded-xl border border-line bg-bg-elev px-6 py-5 scroll-mt-24">
      <h2 className="mb-3 flex items-baseline gap-3 text-[1.25rem] font-bold text-ink">
        <span className="rounded-md bg-sky-soft px-2 py-0.5 font-mono text-[0.8rem] text-sky">{num}</span>
        {title}
      </h2>
      <ul className="mb-3">
        {bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
      <Script title={codeTitle} code={code} />
      {callout}
      <Callout kind="note" label="Say it like this">
        <p className="mb-0">{say}</p>
      </Callout>
    </div>
  );
}

export default function JsRecapPage() {
  return (
    <article>
      <header className="mb-8 border-b border-line pb-6">
        <nav className="mb-4 font-mono text-[0.8rem] text-ink-dim" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-sky">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/${JS_SERIES.slug}`} className="hover:text-sky">{JS_SERIES.title}</Link>
          <span className="mx-2">/</span>
          <span>Recap</span>
        </nav>
        <p className="mb-2 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">
          {JS_SERIES.title} · Final Recap · {reading.readTime} read
        </p>
        <h1 className="mb-2 text-[2.4rem] font-bold leading-tight tracking-tight text-sky max-sm:text-[2rem]">
          {reading.title}
        </h1>
        <p className="max-w-[60ch] text-[1.15rem] text-ink-dim">{reading.summary}</p>
      </header>

      <Callout kind="note">
        <p className="mb-0">
          <strong>How to use this page:</strong> each section is <em>concept → example → what to
          actually say out loud</em>. Don&apos;t skim the examples — read the output comment and
          make sure you would have predicted it. If you wouldn&apos;t have, that&apos;s the one
          lesson to re-open before you close your laptop.
        </p>
      </Callout>

      <section className="mb-10 rounded-xl border border-line bg-bg-elev px-6 py-5" aria-labelledby="learn">
        <h2 id="learn" className="mb-2 text-[1.1rem] font-semibold text-sky">
          Jump to
        </h2>
        <ol className="m-0 grid list-decimal grid-cols-1 gap-x-6 pl-5 marker:text-sky sm:grid-cols-2">
          {outline.map((item) => (
            <li key={item.id} className="my-1">
              <a href={`#${item.id}`} className="text-ink hover:text-sky">
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </section>

      <Card
        id="l1"
        num={1}
        title="Execution Context"
        codeTitle="execution-context.js"
        code={c1}
        bullets={[
          <>Before a single line runs, JS creates the <strong>Global Execution Context (GEC)</strong>.</>,
          <>Every context is built in <strong>two phases</strong>: the <strong>memory creation phase</strong> scans the whole scope and allocates memory upfront, then the <strong>code execution phase</strong> runs line by line.</>,
          <>In the memory phase, <code>var</code> gets <code>undefined</code> and a function declaration gets its <strong>entire body</strong>. That&apos;s all hoisting is.</>,
        ]}
        say={
          <>&ldquo;JavaScript creates an execution context in two phases. In the memory phase it allocates space for every variable and function — vars get <code>undefined</code>, function declarations get their full definition. Then the execution phase runs the code line by line. That&apos;s why I can log a <code>var</code> before its line and get <code>undefined</code> instead of an error.&rdquo;</>
        }
      />

      <Card
        id="l2"
        num={2}
        title="Call Stack"
        codeTitle="call-stack.js"
        code={c2}
        bullets={[
          <>The call stack tracks which execution context is running right now. <strong>LIFO</strong> — last in, first out.</>,
          "Each call pushes a context; each return pops it off, handing control back to whatever was underneath.",
          <>No base case in a recursive function → the stack fills → <code>RangeError: Maximum call stack size exceeded</code>.</>,
        ]}
        say={
          <>&ldquo;The call stack is how JS keeps track of where it is. Calling a function pushes a new execution context on top; returning pops it off. Since there&apos;s only one stack, only one thing runs at a time — and infinite recursion overflows it.&rdquo;</>
        }
      />

      <Card
        id="l3"
        num={3}
        title="var, let, const"
        codeTitle="declarations.js"
        code={c3}
        bullets={[
          "Scope: var is function/global, let and const are block.",
          "All three are hoisted — var to undefined, let/const into the TDZ.",
          "var can be redeclared; let/const throw a SyntaxError on redeclaration.",
          "const locks the binding, not the value — mutation is still allowed.",
        ]}
        say={
          <>&ldquo;<code>const</code> freezes the binding, not the value. I can&apos;t point the variable at something new, but if it holds an object I can still change what&apos;s inside it — which is why <code>counter.count++</code> works on a <code>const</code> object.&rdquo;</>
        }
      />

      <Card
        id="l4"
        num={4}
        title="Functions & Variable Environments"
        codeTitle="variable-environment.js"
        code={c4}
        bullets={[
          <>Every function <strong>call</strong> gets its own private <strong>Variable Environment</strong> — its own fresh copy of parameters and local variables.</>,
          "Two calls to the same function never share local state. That environment dies when the call ends — unless a closure keeps it alive (section 10).",
          "A function can read outward into its parent's scope; the parent can never read inward.",
        ]}
        callout={
          <Callout kind="warn">
            <p className="mb-0">
              Hold this example in your head — section 10 uses the exact same counter and gets{" "}
              <code>1, 2, 3</code> instead. The <em>only</em> difference is a closure. That
              contrast is the cleanest way to prove you understand both.
            </p>
          </Callout>
        }
        say={
          <>&ldquo;Each function call creates its own execution context with its own variable environment, so local variables are completely isolated per call. That&apos;s why calling this counter three times gives me 1, 1, 1 — every call starts from a fresh <code>count</code>.&rdquo;</>
        }
      />

      <Card
        id="l5"
        num={5}
        title="Window & Global this"
        codeTitle="global-this.js"
        code={c5}
        bullets={[
          <>In a browser the global object is <code>window</code>; <code>globalThis</code> is the portable name that works in Node too.</>,
          <>At the top level (non-strict), <code>this === window</code>.</>,
          <>Global <code>var</code> and function declarations attach to <code>window</code>; <code>let</code>/<code>const</code> do not.</>,
        ]}
        say={
          <>&ldquo;At global scope <code>this</code> is the window object. <code>var</code> declarations become properties of window, but <code>let</code> and <code>const</code> are stored in a separate declarative record, so you won&apos;t find them on <code>window</code> even though they&apos;re global.&rdquo;</>
        }
      />

      <Card
        id="l6"
        num={6}
        title="undefined vs. Not Defined"
        codeTitle="undefined-vs-not-defined.js"
        code={c6}
        bullets={[
          "undefined — the variable exists in memory, it just hasn't been given a value yet.",
          "not defined — the variable was never declared anywhere; accessing it throws a ReferenceError.",
          <><code>typeof</code> is the one safe existence check — it never throws on an undeclared name.</>,
        ]}
        say={
          <>&ldquo;<code>undefined</code> means the variable exists but hasn&apos;t been assigned yet — that&apos;s the placeholder JS puts there during the memory phase. <code>not defined</code> means it was never declared at all, which is a ReferenceError. They&apos;re completely different situations.&rdquo;</>
        }
      />

      <Card
        id="l7"
        num={7}
        title="Scope Chain & Lexical Environment"
        codeTitle="scope-chain.js"
        code={c7}
        bullets={[
          "Every execution context has a Lexical Environment = its own local memory + a reference to its parent's lexical environment.",
          "Variable lookup walks outward only: local → parent → grandparent → global → else ReferenceError.",
          "It's lexical/static: determined by where the function is written, never by where it's called.",
        ]}
        say={
          <>&ldquo;When a variable isn&apos;t found locally, JS follows the lexical environment&apos;s outer reference up the scope chain until it finds it or hits global. It&apos;s decided at author time by where the function sits in the code, not at call time.&rdquo;</>
        }
      />

      <Card
        id="l8"
        num={8}
        title="Temporal Dead Zone (TDZ)"
        codeTitle="tdz.js"
        code={c8}
        bullets={[
          "The TDZ is the gap between the start of a scope and the line where a let/const is declared.",
          "The variable is hoisted — it exists — but it's uninitialized and untouchable until its line runs.",
          "That error is distinct from \"not defined\" and interviewers listen for the difference.",
        ]}
        say={
          <>&ldquo;<code>let</code> and <code>const</code> <em>are</em> hoisted — people often say they aren&apos;t, which isn&apos;t accurate. They&apos;re hoisted into a separate memory space but left uninitialized, so accessing them before their declaration throws &lsquo;cannot access before initialization&rsquo; rather than giving <code>undefined</code>.&rdquo;</>
        }
      />

      <Card
        id="l9"
        num={9}
        title="Block Scope & Shadowing"
        codeTitle="block-scope.js"
        code={c9}
        bullets={[
          "Any { } is a block — an if, a loop, or a bare block on its own.",
          "let/const are contained by it; var walks straight through it and attaches to the nearest function/global scope.",
          "Shadowing a let with an inner let creates a genuinely separate variable. Doing it with var isn't shadowing at all — it's the same variable being overwritten.",
          <>Shadowing an outer <code>let</code> with an inner <code>var</code> → <code>SyntaxError</code> (illegal shadowing).</>,
        ]}
        say={
          <>&ldquo;<code>var</code> isn&apos;t block scoped, so re-declaring it inside a block doesn&apos;t shadow anything — it&apos;s literally the same variable, and mutating it leaks out. With <code>let</code> the inner one is a separate variable that disappears when the block ends.&rdquo;</>
        }
      />

      <Card
        id="l10"
        num={10}
        title="Closures"
        codeTitle="closures.js"
        code={c10}
        bullets={[
          "A closure = a function + a live reference to the lexical environment it was created in. Not a copy — a reference.",
          "It's the exception to \"popped context = memory freed\": if a returned function still points into that environment, it stays alive in memory.",
          "Each call to the outer function creates a separate, independent closure.",
        ]}
        callout={
          <Callout kind="ok">
            <p className="mb-0">
              <strong>The money comparison:</strong> section 4&apos;s counter printed{" "}
              <code>1, 1, 1</code> because each call made a fresh <code>count</code>. This one
              prints <code>1, 2, 3</code> because the returned function holds onto one single{" "}
              <code>count</code> that never gets garbage collected. Saying that out loud proves you
              understand execution contexts <em>and</em> closures in one sentence.
            </p>
          </Callout>
        }
        say={
          <>&ldquo;A closure is a function bundled with a live reference to its outer scope. When <code>createCounter</code> returns, its execution context is popped off the stack, but because the returned function still references <code>count</code>, that memory isn&apos;t garbage collected — so the count keeps incrementing. And calling <code>createCounter</code> again gives a totally separate counter.&rdquo;</>
        }
      />

      <Card
        id="l11"
        num={11}
        title="setTimeout + Closures (The Classic)"
        codeTitle="settimeout-closures.js"
        code={c11}
        bullets={[
          "setTimeout never pauses the loop — it hands the callback off and the loop finishes immediately.",
          <>With <code>var</code> there is <strong>one shared</strong> variable; all callbacks read its final value. With <code>let</code> each iteration gets its own binding.</>,
          <>Four valid fixes: <code>let</code>, an IIFE, a helper function, or <code>.bind()</code>.</>,
        ]}
        say={
          <>&ldquo;With <code>var</code> there&apos;s only one variable for the whole loop, and all three callbacks close over that same one — by the time they run, it&apos;s already 4. <code>let</code> creates a fresh binding per iteration so each callback captures its own value. If I&apos;m told to keep <code>var</code>, I&apos;d wrap the body in an IIFE that takes the current value as a parameter, which creates a new scope each iteration.&rdquo;</>
        }
      />

      <Card
        id="l12"
        num={12}
        title="First-Class Functions, Callbacks & Listeners"
        codeTitle="callbacks-listeners.js"
        code={c12}
        bullets={[
          "Functions are values — assignable, storable, passable, returnable.",
          <>A <strong>higher-order function</strong> takes and/or returns a function. A <strong>callback</strong> is a function handed off to be run later — synchronously or asynchronously.</>,
          <><code>removeEventListener</code> needs the <strong>identical reference</strong>, not identical-looking code.</>,
          <>In a listener: a regular function&apos;s <code>this</code> is the element; an arrow function&apos;s <code>this</code> comes from the surrounding scope.</>,
        ]}
        say={
          <>&ldquo;Functions are first-class values in JS, so I can pass one into another function and let it decide when to invoke it — that&apos;s a callback, and <code>addEventListener</code> is just a higher-order function doing exactly that. The common bug is trying to remove a listener with a new inline arrow function — it has to be the same reference.&rdquo;</>
        }
      />

      <Card
        id="l13"
        num={13}
        title="JS Engine & V8"
        codeTitle="engine-v8.js"
        code={c13}
        bullets={[
          "Three steps: parse (source → tokens → AST), compile, execute.",
          <>JS is <strong>JIT-compiled</strong>: <strong>Ignition</strong> (interpreter) starts running bytecode instantly while <strong>TurboFan</strong> (optimizing compiler) compiles hot functions into fast machine code in the background — at the same time, not one after the other.</>,
          <>Execution uses the <strong>call stack</strong> + <strong>memory heap</strong>; <strong>Orinoco</strong> is V8&apos;s garbage collector, built on <strong>Mark-and-Sweep</strong>.</>,
          <>The <strong>engine</strong> is only the parser, compiler, stack and heap. Web APIs, the queues and the event loop belong to the <strong>runtime environment</strong> around it.</>,
        ]}
        say={
          <>&ldquo;V8 parses the code into an AST, then Ignition turns that into bytecode and starts executing right away. Meanwhile TurboFan watches for hot functions and compiles those to optimized machine code in the background — that&apos;s JIT, getting an interpreter&apos;s fast startup plus a compiler&apos;s fast execution. And <code>setTimeout</code> isn&apos;t part of the engine at all; it&apos;s a browser API.&rdquo;</>
        }
      />

      <Card
        id="l14"
        num={14}
        title="Async JS & The Event Loop"
        codeTitle="event-loop.js"
        code={c14}
        bullets={[
          "One call stack, one thing at a time. Slow work is handed off to Web APIs, outside the engine.",
          "Finished work queues up in the callback (macrotask) queue — timers, clicks — or the microtask queue — promise callbacks.",
          "Golden rule: once the stack is empty, the entire microtask queue drains before one macrotask runs.",
          <>So <code>setTimeout(fn, 0)</code> never means &ldquo;now&rdquo; — it means &ldquo;after current code and every pending microtask.&rdquo;</>,
        ]}
        say={
          <>&ldquo;All the synchronous code runs first. Then, once the stack is empty, the event loop drains the entire microtask queue — promise callbacks — before taking a single item from the callback queue. That&apos;s why a promise <code>.then()</code> always beats a <code>setTimeout</code> with zero delay, no matter which was scheduled first.&rdquo;</>
        }
      />

      <hr className="my-12 border-line" />

      <section id="drill" className="scroll-mt-24">
        <h2 className="mb-2 text-[1.6rem] font-semibold text-sky">Output-Prediction Drill</h2>
        <p className="mb-4 max-w-[60ch] text-ink-dim">
          Predict the output before expanding. Six snippets, one per high-risk area — this is the
          exact format most JS interviews use.
        </p>
        {drill.map((d, i) => (
          <details key={i} className="my-3 rounded-xl border border-line bg-bg-elev px-5 py-3">
            <summary className="cursor-pointer font-semibold text-ink">
              {i + 1}. What logs, and why?
            </summary>
            <div className="mt-3">
              <Script title={`drill-${i + 1}.js`} code={d.code} />
              <p className="mb-0 text-ink-dim">{d.answer}</p>
            </div>
          </details>
        ))}
      </section>

      <hr className="my-12 border-line" />

      <section id="rapidfire" className="scroll-mt-24">
        <h2 className="mb-2 text-[1.6rem] font-semibold text-sky">Rapid-Fire Q&amp;A</h2>
        <p className="mb-4 max-w-[60ch] text-ink-dim">
          Read the question, answer out loud, then expand to check. If you stumble, that&apos;s
          your re-read list.
        </p>
        {rapidfire.map(([q, a], i) => (
          <details key={i} className="my-3 rounded-xl border border-line bg-bg-elev px-5 py-3">
            <summary className="cursor-pointer font-semibold text-ink">{q}</summary>
            <p className="mb-0 mt-2 text-ink-dim">{a}</p>
          </details>
        ))}
      </section>

      <hr className="my-12 border-line" />

      <p className="mb-8 text-center text-ink-dim">
        That&apos;s the entire execution model — memory phase to microtask queue. You built it
        lesson by lesson; this was just the fast lap.
      </p>

      <section>
        <h3 className="mb-3 text-[1.1rem] font-semibold text-sky">All 14 full lessons</h3>
        <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
          {JS_LESSONS.map((l) => (
            <Link key={l.slug} href={jsLessonHref(l)} className="text-sky hover:underline">
              {l.number}. {l.title}
            </Link>
          ))}
        </div>
      </section>

      <nav className="mt-14 border-t border-line pt-8" aria-label="Series navigation">
        <Link
          href={`/${JS_SERIES.slug}`}
          className="block rounded-xl border border-line px-5 py-4 text-ink hover:border-sky hover:bg-sky-soft hover:no-underline"
        >
          <div className="font-mono text-[0.75rem] uppercase tracking-[0.1em] text-sky">← Series index</div>
          <div className="font-semibold">{JS_SERIES.title}</div>
        </Link>
      </nav>
    </article>
  );
}
