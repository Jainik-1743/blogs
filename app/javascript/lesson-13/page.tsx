import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import EngineRuntimeMap from "@/components/figures/EngineRuntimeMap";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { JS_LESSONS, JS_SERIES, jsLessonHref } from "@/lib/javascript";

const lesson = JS_LESSONS.find((l) => l.slug === "lesson-13")!;

export const metadata: Metadata = {
  title: `Lesson 13 — ${lesson.title}`,
  description: lesson.summary,
};

/** In-page index. Each entry links to a section heading below. */
const outline = [
  { id: "concept", label: "Concept" },
  { id: "why", label: "Why this matters" },
  { id: "analogy", label: "The kitchen — an analogy" },
  { id: "jre", label: "The JS Engine vs. the JS Runtime Environment" },
  { id: "parsing", label: "Step 1 — Parsing: tokens and the AST" },
  { id: "compile", label: "Step 2 — Compilation: why JS is JIT-compiled" },
  { id: "tiers", label: "Beyond Ignition and TurboFan — the extra tiers" },
  { id: "shapes", label: "Why property access is fast — hidden classes" },
  { id: "execute", label: "Step 3 — Execution: heap, stack, and Orinoco" },
  { id: "gc", label: "Garbage collection, properly explained" },
  { id: "live", label: "See it live — feel the JIT warm-up" },
  { id: "pitfalls", label: "Common misconceptions" },
  { id: "interview", label: "Interview questions" },
];

const astExample = `let a = 7;`;

const astTree = `{
  "type": "VariableDeclaration",
  "declarations": [
    {
      "type": "VariableDeclarator",
      "id": { "type": "Identifier", "name": "a" },
      "init": { "type": "Literal", "value": 7 }
    }
  ],
  "kind": "let"
}`;

const hiddenClasses = `function makeRoom(number, guest) {
  this.number = number; // same order, every time...
  this.guest = guest;   // ...means every room shares one hidden class
}

const room1 = new makeRoom(305, "A. Sharma");
const room2 = new makeRoom(306, "R. Iyer");
// room1 and room2 share the same hidden class — fast, predictable access`;

const jitWarmup = `function square(n) {
  return n * n;
}

console.time("cold run");
for (let i = 0; i < 5_000_000; i++) square(i);
console.timeEnd("cold run");

console.time("warm run");
for (let i = 0; i < 5_000_000; i++) square(i);
console.timeEnd("warm run");`;

const questions: [React.ReactNode, React.ReactNode][] = [
  [
    "What are the three broad steps a JS engine takes to run your code?",
    "Parsing (source code → AST), compilation (AST → bytecode, with hot paths further optimized into machine code), and execution (using the call stack and memory heap, with the garbage collector reclaiming unused memory).",
  ],
  [
    "What is an AST, and why does the engine build one?",
    "An Abstract Syntax Tree — a structured, tree-shaped representation of what the source code means. Every later step (interpreting, compiling, optimizing) operates on this tree rather than on raw text.",
  ],
  [
    "What does JIT compilation mean, and why does V8 use it?",
    "Just-In-Time compilation combines an interpreter (fast to start) with a compiler (fast to run) so code begins executing immediately while frequently-run (\"hot\") functions get optimized into fast machine code in the background.",
  ],
  [
    "Name V8's interpreter, its top-tier optimizing compiler, and its garbage collector.",
    "Ignition (interpreter), TurboFan (optimizing compiler), and Orinoco (garbage collector).",
  ],
  [
    "What is Mark-and-Sweep, in one sentence?",
    "Starting from reachable roots, the collector marks every object it can still reach as alive, then frees the memory of everything left unmarked.",
  ],
];

export default function JsLessonThirteenPage() {
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
          Lesson 13 · {lesson.readTime} read
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
          A <strong>JavaScript engine</strong> is a program that takes your JavaScript source code
          — plain text — and actually runs it. It does this in three broad steps:{" "}
          <strong>parsing</strong> the text into a structure it can understand,{" "}
          <strong>compiling</strong> that structure into something the CPU can execute quickly, and{" "}
          <strong>executing</strong> it while managing memory as it goes. Google&apos;s{" "}
          <strong>V8</strong> (used in Chrome and Node.js) is the engine we&apos;ll use as the
          concrete example throughout, since it&apos;s the one you&apos;re running JavaScript on
          every single day.
        </p>

        <h2 id="why">Why This Matters</h2>
        <ul>
          <li>
            It explains <em>why</em> execution contexts, the call stack, and closures behave the
            way the earlier lessons described — they&apos;re not arbitrary rules, they&apos;re how
            the engine is actually built.
          </li>
          <li>
            It explains real performance advice you&apos;ve probably heard without knowing why
            it&apos;s true — like &ldquo;don&apos;t change an object&apos;s shape after creating
            it.&rdquo;
          </li>
          <li>
            It sets up Lesson 14: the event loop isn&apos;t part of the JS engine at all — you
            can&apos;t understand where the engine&apos;s job ends and the browser&apos;s job
            begins until you&apos;ve seen the engine&apos;s actual boundary.
          </li>
        </ul>

        <h2 id="analogy">The Kitchen — An Analogy</h2>
        <Callout kind="note" label="Order ticket, line cook, and the chef who notices a pattern">
          <p>
            A guest hands the waiter a spoken order. The waiter can&apos;t cook from spoken words
            directly — first it gets written down as a structured <strong>order ticket</strong>:
            dish, quantity, modifications, in a fixed format the kitchen understands. That&apos;s{" "}
            <strong>parsing</strong> — turning free-form text into a structured representation.
          </p>
          <p>
            A line cook picks up the ticket and starts cooking immediately, step by step, exactly
            as written — fast to start, but not the fastest possible way to cook if this exact
            dish keeps coming in. That&apos;s the <strong>interpreter</strong>.
          </p>
          <p className="mb-0">
            Now imagine the head chef notices the kitchen has made the exact same complicated dish
            forty times tonight. Instead of re-reading the ticket line-by-line every time, the chef
            writes a <strong>pre-optimized prep sheet</strong> for that specific dish — precomputed
            steps, no wasted motion — and hands it to the line cook for every future order of that
            same dish. That&apos;s the <strong>optimizing compiler</strong>, kicking in only for
            the &ldquo;hot,&rdquo; frequently-run parts of your code.
          </p>
        </Callout>

        <h2 id="jre">The JS Engine vs. The JS Runtime Environment</h2>
        <p>
          This distinction matters and is easy to blur: the <strong>JS Engine</strong> (V8) only
          contains the parser, compiler/interpreter, the call stack, and the memory heap — the
          parts that actually understand and run JavaScript syntax. The{" "}
          <strong>JS Runtime Environment</strong> is the bigger container around it — the engine{" "}
          <em>plus</em> everything the browser (or Node.js) bolts on: Web APIs like{" "}
          <code>setTimeout</code> and <code>fetch</code> (Lesson 5, Lesson 12), the callback queue,
          the microtask queue, and the event loop that ties it all together (full detail in Lesson
          14).
        </p>
        <Callout kind="note">
          <p className="mb-0">
            <code>setTimeout</code>, DOM APIs, and <code>fetch</code> are <strong>not part of the
            JS engine</strong> — the engine has no idea what a timer or a webpage even is.
            They&apos;re provided by whatever environment is hosting the engine, and handed to your
            code through the global object (<code>window</code> in browsers), exactly as Lesson 5
            described.
          </p>
        </Callout>
        <EngineRuntimeMap />

        <h2 id="parsing">Step 1 — Parsing: Tokens And The AST</h2>
        <Script title="ast-example.js" code={astExample} />
        <p>
          Before anything runs, the engine&apos;s parser breaks this line into{" "}
          <strong>tokens</strong> — <code>let</code>, <code>a</code>, <code>=</code>,{" "}
          <code>7</code>, <code>;</code> — the smallest meaningful pieces of syntax. Then it
          arranges those tokens into an <strong>Abstract Syntax Tree (AST)</strong>: a structured,
          tree-shaped representation of what the code actually means, roughly like this:
        </p>
        <Script title="ast-shape.json" code={astTree} />
        <p>
          Every later step — interpreting, compiling, optimizing — works off this tree, not the
          raw text. You can generate an AST for any snippet yourself at{" "}
          <a href="https://astexplorer.net" target="_blank" rel="noopener noreferrer">astexplorer.net</a>{" "}
          to see this structure firsthand.
        </p>

        <h2 id="compile">Step 2 — Compilation: Why JS Is JIT-Compiled</h2>
        <p>
          A common myth is that JavaScript is &ldquo;just interpreted.&rdquo; It isn&apos;t —
          modern engines use <strong>JIT (Just-In-Time) compilation</strong>, which blends two
          older approaches:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Approach</th>
                <th>Strength</th>
                <th>Weakness</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Pure interpreter</td>
                <td>Starts running instantly, line by line</td>
                <td>Re-does the same work every time a line re-runs — slow for hot loops</td>
              </tr>
              <tr>
                <td>Pure ahead-of-time compiler</td>
                <td>Produces fast machine code</td>
                <td>Has to fully compile everything upfront before anything runs — slow to start</td>
              </tr>
              <tr>
                <td>JIT (both together)</td>
                <td>Starts instantly <em>and</em> gets fast where it counts</td>
                <td>More moving parts internally</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          In V8, this plays out as two named components working <strong>simultaneously</strong>,
          not one after the other:
        </p>
        <ul>
          <li>
            <strong>Ignition</strong> — the interpreter. It converts the AST into{" "}
            <strong>bytecode</strong> and starts executing immediately, function by function, with
            zero delay.
          </li>
          <li>
            <strong>TurboFan</strong> — the optimizing compiler. It watches which functions are
            called repeatedly (&ldquo;hot&rdquo; functions) and, in the background, compiles just
            those into highly optimized machine code — the &ldquo;prep sheet&rdquo; from the
            kitchen analogy.
          </li>
        </ul>
        <Callout kind="note">
          <p className="mb-0">
            If TurboFan&apos;s assumptions about a function&apos;s inputs turn out to be wrong
            later (say, a function that always received numbers suddenly receives a string), V8{" "}
            <strong>deoptimizes</strong> — it throws away the optimized version and safely falls
            back to Ignition&apos;s bytecode for that function. This safety net is exactly what
            makes it safe for TurboFan to optimize aggressively in the first place.
          </p>
        </Callout>

        <h2 id="tiers">Beyond Ignition And TurboFan — The Extra Tiers</h2>
        <p>
          Modern V8 doesn&apos;t jump straight from &ldquo;interpreted&rdquo; to &ldquo;fully
          optimized&rdquo; — it added two intermediate tiers to smooth out the climb, so that
          mildly-warm functions aren&apos;t stuck paying interpreter overhead while waiting to
          become &ldquo;hot enough&rdquo; for full optimization:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tier</th>
                <th>Role</th>
                <th>Roughly triggers after</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Ignition</td><td>Baseline interpreter — always runs first</td><td>Every function, immediately</td></tr>
              <tr><td>Sparkplug</td><td>A fast, non-optimizing compiler that removes interpreter overhead</td><td>A handful of calls</td></tr>
              <tr><td>Maglev</td><td>A mid-tier optimizer for functions that are warm but not yet &ldquo;hot&rdquo;</td><td>A few hundred calls</td></tr>
              <tr><td>TurboFan</td><td>The top-tier optimizer, generating near-native machine code</td><td>Several thousand calls</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          You don&apos;t need to memorize these to understand JavaScript&apos;s execution model —
          Ignition and TurboFan cover the core idea perfectly well. But knowing they exist explains
          why V8&apos;s real-world performance keeps improving version after version without you
          changing a single line of your own code.
        </p>

        <h2 id="shapes">Why Property Access Is Fast — Hidden Classes</h2>
        <p>
          JavaScript objects are dynamic — you can add or remove properties at any time. Naively,
          that should make <code>obj.roomNumber</code> as slow as a hash-table lookup every single
          time. V8 avoids that with <strong>hidden classes</strong> (internally called{" "}
          <strong>Maps</strong>, or &ldquo;shapes&rdquo;): whenever you create objects the same
          way, V8 quietly gives them the same hidden class, recording exactly which properties
          exist and at what fixed offset — turning property access into a near-instant, direct
          memory read instead of a lookup.
        </p>
        <Script title="hidden-classes.js" code={hiddenClasses} />
        <Callout kind="warn">
          <p className="mb-0">
            If you add properties to different instances in a <strong>different order</strong>, or
            add properties long after creation, V8 has to create separate hidden classes for each
            shape — this is called going <strong>polymorphic</strong> (a few shapes) or{" "}
            <strong>megamorphic</strong> (many shapes), and it&apos;s a genuine, measurable
            performance cliff. This is the real, technical reason behind the common advice
            &ldquo;initialize all of an object&apos;s properties in the constructor, in the same
            order, every time.&rdquo;
          </p>
        </Callout>

        <h2 id="execute">Step 3 — Execution: Heap, Stack, And Orinoco</h2>
        <p>
          Execution needs two things you&apos;ve already met, formally named here: the{" "}
          <strong>call stack</strong> (Lesson 2) tracks which function is currently running, and
          the <strong>memory heap</strong> is the much larger, less organized region where objects,
          arrays, and functions actually live. Primitive values tied to a running function usually
          live right on the stack; anything that needs to outlive a single function call —
          including the variables a closure holds onto (Lesson 10) — lives in the heap.
        </p>

        <h2 id="gc">Garbage Collection, Properly Explained</h2>
        <p>
          The heap fills up as your program creates objects, so the engine needs to reclaim memory
          from objects nothing references anymore. V8&apos;s collector is called{" "}
          <strong>Orinoco</strong>, and it works on a simple observation: <strong>most objects die
          young</strong>. So it splits the heap into two generations and treats them very
          differently:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Generation</th>
                <th>Holds</th>
                <th>Algorithm</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Young generation</td>
                <td>Newly created, mostly short-lived objects</td>
                <td>Scavenger — copies survivors between two small spaces; frequent, very fast</td>
              </tr>
              <tr>
                <td>Old generation</td>
                <td>Objects that survived long enough to be &ldquo;promoted&rdquo;</td>
                <td>Mark-Sweep-Compact — walks the object graph from the roots (Lesson 2/13), marks what&apos;s reachable, frees the rest; runs less often, mostly in the background</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          At its core, <strong>Mark-and-Sweep</strong> is the idea to hold onto: starting from your
          program&apos;s &ldquo;roots&rdquo; (global variables, the current call stack, and
          anything a live closure still references), the collector marks every object it can reach
          as alive. Everything left unmarked is unreachable garbage — nothing in your code can
          possibly get to it anymore — and its memory is freed. This is precisely why closures
          (Lesson 10) can keep a Lexical Environment alive indefinitely: as long as a reachable
          function still points to it, it&apos;s marked &ldquo;alive&rdquo; and never swept.
        </p>

        <h2 id="live">See It Live — Feel The JIT Warm-Up</h2>
        <Script title="jit-warmup.js" code={jitWarmup} />
        <ol className="steps">
          <li>
            <h3>Paste this into the console</h3>
            <p>Run it in Chrome DevTools or Node.</p>
          </li>
          <li>
            <h3>Compare the two timings</h3>
            <p>The second loop is typically noticeably faster.</p>
          </li>
          <li>
            <h3>Why</h3>
            <p>
              By the time the first loop finishes, <code>square</code> has been called millions of
              times — hot enough that TurboFan has very likely compiled it into optimized machine
              code. The second loop reaps the benefit.
            </p>
          </li>
        </ol>

        <h2 id="pitfalls">Common Misconceptions</h2>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;JavaScript is purely interpreted, unlike compiled languages.&rdquo;</strong>{" "}
            Modern engines JIT-compile it — an interpreter starts execution instantly, and a
            compiler optimizes the hot paths in the background, at the same time.
          </p>
        </Callout>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;The event loop and callback queue are part of the JS engine.&rdquo;</strong>{" "}
            They&apos;re not — they belong to the surrounding runtime environment (the browser or
            Node.js), not to V8 itself. Full detail in Lesson 14.
          </p>
        </Callout>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;Garbage collection only runs when the program is about to run out of
            memory.&rdquo;</strong> V8 runs GC proactively and incrementally, often during
            otherwise-idle moments, specifically to avoid ever letting memory pressure build up to
            that point.
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

      <LessonPager slug="lesson-13" lessons={JS_LESSONS} href={jsLessonHref} series={JS_SERIES} />
    </article>
  );
}
