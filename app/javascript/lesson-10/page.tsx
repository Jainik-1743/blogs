import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import ClosureFormStepper from "@/components/figures/ClosureFormStepper";
import ClosureLink from "@/components/figures/ClosureLink";
import IndependentClosuresStepper from "@/components/figures/IndependentClosuresStepper";
import LoopClosureStepper from "@/components/figures/LoopClosureStepper";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { JS_LESSONS, JS_SERIES, jsLessonHref } from "@/lib/javascript";

const lesson = JS_LESSONS.find((l) => l.slug === "lesson-10")!;

export const metadata: Metadata = {
  title: `Lesson 10 — ${lesson.title}`,
  description: lesson.summary,
};

/** In-page index. Each entry links to a section heading below. */
const outline = [
  { id: "concept", label: "Concept" },
  { id: "why", label: "Why this matters" },
  { id: "analogy", label: "The waiter's notepad — an analogy" },
  { id: "form", label: "How a closure actually forms" },
  { id: "loopbug", label: "The classic loop bug — var vs let" },
  { id: "uses", label: "What closures are actually used for" },
  { id: "memory", label: "Closures and memory" },
  { id: "live", label: "See it live — DevTools" },
  { id: "pitfalls", label: "Common misconceptions" },
  { id: "interview", label: "Interview questions" },
  { id: "ts", label: "Three simple examples in TypeScript" },
];

const form = `function makeRoomKey() {
  let roomNumber = 305; // lives in makeRoomKey's Lexical Environment

  return function showRoom() {
    console.log(roomNumber);
  };
}

const showMyRoom = makeRoomKey(); // makeRoomKey() has already run, returned, and popped off the stack
showMyRoom(); // 305 — still works`;

const loop = `for (var i = 1; i <= 3; i++) {
  setTimeout(() => console.log(i), 1000);
}
// after 1 second: 4, 4, 4

for (let i = 1; i <= 3; i++) {
  setTimeout(() => console.log(i), 1000);
}
// after 1 second: 1, 2, 3`;

const counter = `function createCounter() {
  let count = 0; // nobody outside can touch this directly
  return {
    increment: () => ++count,
    getValue: () => count,
  };
}`;

const ts1 = `function createCounter(start: number): () => number {
  let count = start;
  return function (): number {
    count += 1;
    return count;
  };
}

const counter = createCounter(0);
console.log(counter()); // 1
console.log(counter()); // 2`;

const ts2 = `function createDiscountApplier(discountPercent: number): (price: number) => number {
  return (price: number): number => price - (price * discountPercent) / 100;
}

const applyTenPercentOff = createDiscountApplier(10);
console.log(applyTenPercentOff(500)); // 450`;

const ts3 = `function createHotelRoom(roomNumber: number) {
  let isOccupied = false; // private — no direct access from outside

  return {
    checkIn: (): void => { isOccupied = true; },
    checkOut: (): void => { isOccupied = false; },
    status: (): string => \`Room \${roomNumber} is \${isOccupied ? "occupied" : "free"}\`,
  };
}

const room305 = createHotelRoom(305);
room305.checkIn();
console.log(room305.status()); // Room 305 is occupied`;

const questions: [React.ReactNode, React.ReactNode][] = [
  [
    "What is a closure, in your own words?",
    "A function combined with a live reference to the Lexical Environment it was created in, letting it access those variables even after the outer function has finished executing.",
  ],
  [
    "Why does a var loop with setTimeout log the final value three times, while let logs 1, 2, 3?",
    <><code>var</code> creates one shared variable for the whole loop, so every callback closes over that single, final value. <code>let</code> creates a fresh, independent binding per iteration, so each callback closes over its own value.</>,
  ],
  [
    "Do two calls to the same outer function share a closure?",
    "No — each call creates its own separate Lexical Environment, so each returned closure has its own independent copy of the outer variables.",
  ],
  [
    "Does a closure store a value or a reference?",
    "A reference to the variable's actual location in memory — not a snapshot of its value at creation time.",
  ],
  [
    "Can closures cause memory leaks?",
    "Yes — if something keeps referencing a closure (like an event listener that's never removed), the entire outer scope it depends on is kept alive in memory indefinitely.",
  ],
];

export default function JsLessonTenPage() {
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
          Lesson 10 · {lesson.readTime} read
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
          A <strong>closure</strong> is a function bundled together with the variables it was
          surrounded by when it was created — its outer <strong>Lexical Environment</strong>{" "}
          (Lesson 7). Even after the outer function has finished running, returned a value, and
          been popped off the call stack, the inner function can still reach into those variables
          — not a copy of them, the actual, live variables.
        </p>
        <Callout kind="note">
          <p className="mb-0">
            Formally: <strong>a closure = a function + a live reference to its outer Lexical Environment.</strong>{" "}
            That reference is created the moment the function is defined, not when it&apos;s
            called.
          </p>
        </Callout>

        <h2 id="why">Why This Matters</h2>
        <ul>
          <li>
            It directly contradicts the simple mental model from Lesson 2 (&ldquo;popped context,
            memory freed&rdquo;) — closures are the reason that model needed an asterisk.
          </li>
          <li>
            It&apos;s how JavaScript gives you private data without classes — a variable no one
            outside can touch directly, only through a function you handed them.
          </li>
          <li>
            It quietly powers things you already use: <code>setTimeout</code> callbacks, event
            listeners, <code>useState</code>-style patterns, debounce/throttle utilities,
            memoization.
          </li>
          <li>
            It&apos;s one of the most asked interview topics in JavaScript — usually through the
            loop-and-<code>setTimeout</code> question below.
          </li>
        </ul>

        <h2 id="analogy">The Waiter&apos;s Notepad — An Analogy</h2>
        <Callout kind="note" label="The guest checks out. The notepad doesn't forget the room.">
          <p>
            A waiter takes a room-service order: <strong>Room 305</strong>, two coffees, no sugar.
            He writes it on his notepad and walks off to the kitchen. By the time he&apos;s back,
            the guest has already checked out — the front desk has closed that guest&apos;s file
            completely.
          </p>
          <p>
            But the waiter&apos;s notepad still says <strong>Room 305</strong>. He doesn&apos;t
            need the front desk&apos;s file anymore — he&apos;s carrying his own private reference
            to that exact room number, and he can act on it whenever he&apos;s ready.
          </p>
          <p className="mb-0">
            The outer function (the guest&apos;s stay) is over. The inner function (the waiter
            carrying his notepad) still remembers exactly what it needs — because it kept its own
            reference, not a phone call back to a desk that no longer has the file.
          </p>
        </Callout>

        <h2 id="form">How A Closure Actually Forms</h2>
        <Script title="closure.js" code={form} />
        <p>Step by step, what actually happens:</p>
        <ol>
          <li>
            <code>makeRoomKey()</code> is called. A new Execution Context is pushed.{" "}
            <code>roomNumber</code> is created inside its Lexical Environment.
          </li>
          <li>
            The inner function <code>showRoom</code> is created. At creation time, it silently
            attaches a hidden link to <code>makeRoomKey</code>&apos;s Lexical Environment — this
            link is the closure.
          </li>
          <li>
            <code>makeRoomKey()</code> returns <code>showRoom</code>, and its Execution Context is
            popped off the call stack (Lesson 2 — it is gone from the stack).
          </li>
          <li>
            Normally, everything inside a popped context is garbage-collected. But{" "}
            <code>showRoom</code> still holds that hidden link to <code>roomNumber</code> — so the
            engine keeps that specific Lexical Environment alive in memory, even with nothing left
            on the stack pointing to it.
          </li>
          <li>
            When <code>showMyRoom()</code> is finally called later, it reads{" "}
            <code>roomNumber</code> straight from that still-alive Lexical Environment. Not a saved
            copy — the same variable.
          </li>
        </ol>
        <ClosureFormStepper />
        <ClosureLink />

        <h2 id="loopbug">The Classic Loop Bug — var vs let</h2>
        <p>
          This is the single most common closures interview question, and it&apos;s really a
          Lesson 9 (scoping) problem wearing a closures costume:
        </p>
        <Script title="loop.js" code={loop} />
        <p>
          <strong>Why the var version breaks:</strong> <code>var</code> is not block-scoped
          (Lesson 9) — there is only <strong>one</strong> <code>i</code> for the entire loop. All
          three arrow functions close over that same single <code>i</code>. By the time any of them
          actually runs (a full second later), the loop has already finished and <code>i</code> is{" "}
          <code>4</code>. All three closures read the same final value.
        </p>
        <p>
          <strong>Why the let version works:</strong> <code>let</code> creates a{" "}
          <strong>fresh binding of <code>i</code> for every single iteration</strong> of the loop —
          three separate, independent variables, each living in its own block scope. Each arrow
          function closes over its own private copy. That&apos;s why <code>let</code> loops
          correctly are the default choice for callbacks inside loops.
        </p>
        <LoopClosureStepper />
        <Callout kind="ok">
          <p className="mb-0">
            This is the loop-bug question interviewers love: it forces you to prove you understand
            block scope (Lesson 9) <em>and</em> closures at the same time.
          </p>
        </Callout>

        <h2 id="uses">What Closures Are Actually Used For</h2>
        <h3>1. Private data, without a class</h3>
        <Script title="counter.js" code={counter} />
        <p>
          There is no way to reach <code>count</code> from outside except through{" "}
          <code>increment</code> and <code>getValue</code>. The variable is genuinely private —
          closures gave you encapsulation for free.
        </p>
        <IndependentClosuresStepper />
        <h3>2. Function factories</h3>
        <p>
          A function that builds and returns other, more specific functions — each one remembering
          the settings it was built with. (Full example in the TypeScript section below.)
        </p>
        <h3>3. Callbacks that need context</h3>
        <p>
          Every <code>setTimeout</code>, every event listener, every <code>.then()</code> — all of
          them are closures, quietly carrying whatever variables they need from where they were
          defined to whenever they eventually run.
        </p>

        <h2 id="memory">Closures and Memory</h2>
        <p>
          Lesson 2 said popped execution contexts get garbage-collected. Closures are the reason
          that&apos;s not the whole story: as long as <em>something</em> still holds a reference to
          a closure (a variable, an event listener, a pending timer), the outer Lexical Environment
          it depends on is kept alive — even though its Execution Context left the call stack long
          ago.
        </p>
        <Callout kind="warn">
          <p className="mb-0">
            This is genuinely useful, but it&apos;s also a real source of memory leaks in
            production apps — an event listener that&apos;s never removed keeps its entire closure
            (and everything it references) alive forever. Once nothing references a closure
            anymore, it becomes eligible for garbage collection like anything else.
          </p>
        </Callout>

        <h2 id="live">See It Live — DevTools</h2>
        <ol className="steps">
          <li>
            <h3>Paste the makeRoomKey example</h3>
            <p>
              Run <code>const showMyRoom = makeRoomKey();</code> in the console, then set a
              breakpoint inside <code>showRoom</code>.
            </p>
          </li>
          <li>
            <h3>Call showMyRoom() and hit the breakpoint</h3>
            <p>Open the Scope panel while paused inside the function.</p>
          </li>
          <li>
            <h3>Look for a section literally called &ldquo;Closure&rdquo;</h3>
            <p>
              Chrome DevTools labels it by the outer function&apos;s name — you&apos;ll see{" "}
              <code>Closure (makeRoomKey)</code> listing <code>roomNumber: 305</code>, proving
              it&apos;s still alive.
            </p>
          </li>
          <li>
            <h3>Compare with the var loop example</h3>
            <p>
              Set a breakpoint inside the <code>setTimeout</code> callback and watch all three
              callbacks share the exact same <code>i</code> in their Closure section.
            </p>
          </li>
        </ol>

        <h2 id="pitfalls">Common Misconceptions</h2>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;A closure copies the variable&apos;s value.&rdquo;</strong> No — it
            keeps a live reference. If the outer variable changes after the closure is created,
            the closure sees the new value, not a frozen snapshot.
          </p>
        </Callout>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;Closures only happen when a function is returned.&rdquo;</strong>{" "}
            Returning is just the most visible case. Passing a function to <code>setTimeout</code>,
            an event listener, or anywhere else it outlives its original call also creates and
            relies on a closure.
          </p>
        </Callout>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;Every function call creates a new closure over the same shared data.&rdquo;</strong>{" "}
            Each call to an outer function creates a brand-new, independent Lexical Environment.
            Two separate calls to <code>createCounter()</code> produce two completely independent
            counters that never interfere with each other.
          </p>
        </Callout>

        <h2 id="interview">Interview Questions</h2>
        {questions.map(([q, a], i) => (
          <details key={i} className="my-3 rounded-xl border border-line bg-bg-elev px-5 py-3">
            <summary className="cursor-pointer font-semibold text-ink">{q}</summary>
            <p className="mb-0 mt-2 text-ink-dim">{a}</p>
          </details>
        ))}

        <h2 id="ts">Three Simple Examples In TypeScript</h2>
        <span className="inline-block rounded-md bg-[#3178c6] px-2 py-0.5 font-mono text-[0.7rem] font-bold tracking-[0.03em] text-white">TypeScript</span>
        <h3>1. A private counter</h3>
        <Script title="counter.ts" code={ts1} />
        <p>
          <code>count</code> is only reachable through the returned function — there&apos;s no
          other way to read or change it from outside.
        </p>

        <h3>2. A function factory (discount applier)</h3>
        <Script title="discount.ts" code={ts2} />
        <p>
          <code>applyTenPercentOff</code> permanently remembers <code>discountPercent = 10</code>,
          no matter how many different prices you later pass it.
        </p>

        <h3>3. A tiny hotel room object with private status</h3>
        <Script title="room.ts" code={ts3} />
        <p>
          Three separate closures — <code>checkIn</code>, <code>checkOut</code>, and{" "}
          <code>status</code> — all sharing the same private <code>isOccupied</code> variable
          through the same Lexical Environment.
        </p>
      </div>

      <LessonPager slug="lesson-10" lessons={JS_LESSONS} href={jsLessonHref} series={JS_SERIES} />
    </article>
  );
}
