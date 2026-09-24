import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import EventLoopPlayers from "@/components/figures/EventLoopPlayers";
import EventLoopStepper from "@/components/figures/EventLoopStepper";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { JS_LESSONS, JS_SERIES, jsLessonHref } from "@/lib/javascript";

const lesson = JS_LESSONS.find((l) => l.slug === "lesson-14")!;

export const metadata: Metadata = {
  title: `Lesson 14 — ${lesson.title}`,
  description: lesson.summary,
};

/** In-page index. Each entry links to a section heading below. */
const outline = [
  { id: "concept", label: "Concept" },
  { id: "why", label: "Why this matters" },
  { id: "analogy", label: "The front desk — an analogy" },
  { id: "players", label: "The four players" },
  { id: "rule", label: "The golden rule: microtasks drain first" },
  { id: "trace", label: "Tracing the classic example" },
  { id: "async-await", label: "async/await — microtasks in disguise" },
  { id: "rendering", label: "Where rendering fits in the loop" },
  { id: "starvation", label: "Starvation — when microtasks never stop" },
  { id: "node", label: "A quick note on Node.js" },
  { id: "live", label: "See it live — DevTools" },
  { id: "pitfalls", label: "Common misconceptions" },
  { id: "interview", label: "Interview questions" },
  { id: "conclusion", label: "Tying all 14 lessons together" },
];

const classicExample = `console.log("1: sync start");

setTimeout(() => {
  console.log("2: setTimeout callback");
}, 0);

Promise.resolve().then(() => {
  console.log("3: promise callback");
});

console.log("4: sync end");

// Output:
// 1: sync start
// 4: sync end
// 3: promise callback
// 2: setTimeout callback`;

const asyncAwait = `async function checkIn() {
  console.log("2: checkIn starts");
  await null;
  console.log("4: after await");
}

console.log("1: script start");
setTimeout(() => console.log("6: timeout"), 0);
checkIn();
Promise.resolve().then(() => console.log("5: then"));
console.log("3: script end");

// 1: script start
// 2: checkIn starts
// 3: script end
// 4: after await
// 5: then
// 6: timeout`;

const frames = `// Blocks rendering: the browser can't paint until this task ends
button.addEventListener("click", () => {
  box.style.transform = "translateX(0)";
  heavyWork(); // 300 ms of synchronous work — the page freezes
  box.style.transform = "translateX(200px)";
});

// Runs just before the next paint — the right place for visual updates
let x = 0;
function animate() {
  box.style.transform = \`translateX(\${x++}px)\`;
  if (x < 200) requestAnimationFrame(animate);
}
requestAnimationFrame(animate);`;

const starvation = `function scheduleMicrotaskForever() {
  Promise.resolve().then(() => {
    console.log("microtask running...");
    scheduleMicrotaskForever(); // queues another one before this one even finishes
  });
}

scheduleMicrotaskForever();

setTimeout(() => {
  console.log("this setTimeout may never run");
}, 0);`;

const questions: [React.ReactNode, React.ReactNode][] = [
  [
    "Why doesn't a slow network request freeze the JavaScript call stack?",
    "The request is handed off to a Web API outside the JS engine; the call stack moves on immediately, and only the eventual result is scheduled to come back onto the stack later, via a queue and the event loop.",
  ],
  [
    "What is the exact priority rule between the microtask queue and the callback queue?",
    "After the call stack empties, the entire microtask queue is drained — including any new microtasks queued during that draining — before even one item from the callback queue is processed.",
  ],
  [
    "Does setTimeout(fn, 0) run before or after a Promise.resolve().then() registered afterward?",
    <>After — the promise callback is a microtask and always drains before the <code>setTimeout</code> callback, a macrotask, gets its turn, regardless of the order they were registered in.</>,
  ],
  [
    "What causes callback-queue starvation?",
    "A microtask that keeps scheduling another microtask before the queue can empty — since the callback queue (and rendering) only gets a turn once the microtask queue is completely drained.",
  ],
  [
    "Are Web APIs like setTimeout and fetch part of the JavaScript engine?",
    <>No — they&apos;re provided by the surrounding runtime environment (the browser or Node.js), not by the JS engine itself, which only knows how to parse, compile, and execute JavaScript syntax.</>,
  ],
  [
    "When does the code after an await run?",
    <>As a microtask. The <code>async</code> function runs synchronously up to the <code>await</code>, then returns a pending promise; the rest of the function is queued and runs after the current synchronous code finishes — before any <code>setTimeout</code> callback, but in order with other microtasks.</>,
  ],
  [
    "Predict the output: console.log(1); setTimeout(() => console.log(2)); Promise.resolve().then(() => console.log(3)); (async () => { console.log(4); await null; console.log(5); })(); console.log(6);",
    <><code>1 4 6 3 5 2</code>. Synchronous first (1, then the async function up to its await prints 4, then 6), then microtasks in the order they were queued (the <code>.then</code> printing 3, then the continuation printing 5), and finally the timer (2).</>,
  ],
  [
    "Why can a long-running promise chain freeze the page even though no single step is slow?",
    "Rendering only happens between tasks, after the microtask queue is completely empty. If microtasks keep queueing more microtasks, the queue never empties, so the browser can't paint or handle input — the same starvation that blocks the callback queue.",
  ],
];

export default function JsLessonFourteenPage() {
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
          Lesson 14 (Final) · {lesson.readTime} read
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
          JavaScript is <strong>single-threaded</strong> — one call stack (Lesson 2), one thing
          running at any given instant. On its own, that should mean a slow operation like a
          network request freezes everything else. It doesn&apos;t, because the{" "}
          <strong>JS Runtime Environment</strong> (Lesson 13) hands slow work off to the browser,
          and the <strong>event loop</strong> is the mechanism that decides when the results of
          that work are allowed back onto the call stack.
        </p>

        <h2 id="why">Why This Matters</h2>
        <ul>
          <li>
            It&apos;s the single most commonly misunderstood part of JavaScript, and one of the
            most asked interview topics of all.
          </li>
          <li>
            It explains real bugs: why a <code>setTimeout(fn, 0)</code> never runs
            &ldquo;immediately,&rdquo; and why a chain of promises can starve a UI from updating.
          </li>
          <li>
            It&apos;s the final piece connecting every earlier lesson — the call stack, closures,
            and now the queues — into one complete mental model of what actually happens when a JS
            file runs.
          </li>
        </ul>

        <h2 id="analogy">The Front Desk — An Analogy</h2>
        <Callout kind="note" label="One clerk, two trays, and a strict habit">
          <p>
            A single front desk clerk (the <strong>call stack</strong>) can only help one guest at
            a time. Long jobs — room service, laundry, a wake-up call (Lesson 11) — get handed off
            to background departments (<strong>Web APIs</strong>) who work independently and
            don&apos;t block the clerk at all.
          </p>
          <p className="mb-0">
            When a background department finishes, it doesn&apos;t walk up and interrupt the clerk
            mid-conversation. It drops a note into one of two trays on the desk: a small{" "}
            <strong>Priority tray</strong> (the <strong>microtask queue</strong> — promise results)
            and a larger <strong>Regular tray</strong> (the <strong>callback queue</strong> —
            timers, clicks). The clerk only ever looks at either tray once their current guest is
            fully handled <em>and</em> the desk is completely clear. And critically, the clerk has
            a strict habit: <strong>empty the Priority tray all the way down to nothing</strong>{" "}
            before picking up even one note from the Regular tray — no matter how many new priority
            notes keep arriving in the meantime.
          </p>
        </Callout>

        <h2 id="players">The Four Players</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Role</th>
                <th>Examples</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Call Stack</td>
                <td>Runs one thing at a time, synchronously (Lesson 2)</td>
                <td>Your actual running code</td>
              </tr>
              <tr>
                <td>Web APIs</td>
                <td>Do the slow work in the background, outside the engine (Lesson 13)</td>
                <td><code>setTimeout</code>, <code>fetch</code>, DOM events</td>
              </tr>
              <tr>
                <td>Callback / Macrotask Queue</td>
                <td>Holds finished callbacks, waiting their turn — one is processed per event loop cycle</td>
                <td>setTimeout callbacks, click handlers</td>
              </tr>
              <tr>
                <td>Microtask Queue</td>
                <td>Holds finished promise callbacks — the entire queue drains every cycle</td>
                <td><code>.then()</code>, <code>.catch()</code>, <code>.finally()</code>, <code>queueMicrotask()</code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          The <strong>event loop</strong> itself isn&apos;t a queue — it&apos;s the clerk: a
          continuous loop that checks &ldquo;is the call stack empty?&rdquo; and, the instant it
          is, decides what gets pulled onto it next, following the golden rule below.
        </p>
        <EventLoopPlayers />

        <h2 id="rule">The Golden Rule: Microtasks Drain First</h2>
        <Callout kind="ok">
          <p className="mb-0">
            After the currently running code finishes and the call stack is empty, the event loop
            runs <strong>every microtask in the queue, one after another, until it&apos;s
            completely empty</strong> — including new microtasks added by microtasks that were
            already running — before it takes even one item from the callback queue. Only once the
            microtask queue is fully empty does exactly one callback-queue item get its turn.
          </p>
        </Callout>

        <h2 id="trace">Tracing The Classic Example</h2>
        <Script title="classic-example.js" code={classicExample} />
        <ol className="steps">
          <li>
            <h3>The synchronous code runs first, fully</h3>
            <p>
              <code>&quot;1: sync start&quot;</code> logs immediately. <code>setTimeout</code>{" "}
              hands its callback to the Web API and returns instantly — it does not wait, even
              with a delay of <code>0</code>. <code>Promise.resolve().then(...)</code> registers
              its callback into the microtask queue. <code>&quot;4: sync end&quot;</code> logs.
            </p>
          </li>
          <li>
            <h3>The call stack is now empty — golden rule kicks in</h3>
            <p>
              Before touching the callback queue at all, the event loop drains the microtask queue
              completely. There&apos;s exactly one microtask waiting: the promise callback.
            </p>
          </li>
          <li>
            <h3>&quot;3: promise callback&quot; runs</h3>
            <p>The microtask queue is now empty.</p>
          </li>
          <li>
            <h3>Only now does the callback queue get its turn</h3>
            <p>
              <code>&quot;2: setTimeout callback&quot;</code> finally runs — last, even though it
              was scheduled before the promise.
            </p>
          </li>
        </ol>
        <EventLoopStepper scenario="classic" />
        <Callout kind="warn">
          <p className="mb-0">
            This is why <code>setTimeout(fn, 0)</code> never truly means &ldquo;run this
            immediately.&rdquo; It means &ldquo;run this as a macrotask, after the current code{" "}
            <em>and</em> every pending microtask are done&rdquo; — always at least one full cycle
            later.
          </p>
        </Callout>

        <h2 id="async-await">async/await — Microtasks In Disguise</h2>
        <p>
          <code>async</code>/<code>await</code> doesn&apos;t add a new queue or a new kind of
          scheduling — it is written on top of promises, so it follows exactly the same rules. Two
          facts explain every <code>async</code> puzzle:
        </p>
        <ul>
          <li>
            An <code>async</code> function runs <strong>synchronously</strong>, on the current
            call stack, right up to its first <code>await</code>. Calling it is not deferred.
          </li>
          <li>
            <code>await</code> pauses the function and schedules <strong>the rest of it</strong> as
            a microtask. The function returns a pending promise straight away, and the caller keeps
            running.
          </li>
        </ul>
        <Script title="async-await.js" code={asyncAwait} />
        <EventLoopStepper scenario="async" />
        <Callout kind="note">
          <p className="mb-0">
            That&apos;s why &ldquo;<code>await</code> blocks&rdquo; is only half true. It pauses{" "}
            <em>that one function</em>; it never blocks the call stack, the rest of your script, or
            the browser. Code after an <code>await</code> always runs after the current synchronous
            code has finished — and before any timer or click handler.
          </p>
        </Callout>

        <h2 id="rendering">Where Rendering Fits In The Loop</h2>
        <p>
          The browser paints the screen from the same thread that runs your JavaScript, so
          painting has to take a turn in the loop too. One full turn looks like this:
        </p>
        <ol className="steps">
          <li>
            <h3>Run one task from the callback queue</h3>
            <p>A timer callback, a click handler, the initial script — exactly one.</p>
          </li>
          <li>
            <h3>Drain the entire microtask queue</h3>
            <p>Every promise callback and <code>await</code> continuation, including new ones added along the way.</p>
          </li>
          <li>
            <h3>Maybe render</h3>
            <p>
              If it&apos;s time for a new frame (about every 16 ms at 60 Hz), run{" "}
              <code>requestAnimationFrame</code> callbacks, recalculate styles and layout, and
              paint.
            </p>
          </li>
          <li>
            <h3>Repeat</h3>
            <p>Pick the next task, and go round again.</p>
          </li>
        </ol>
        <p>
          Two practical rules fall straight out of that order. Any single task or microtask chain
          that runs for 300 ms delays the next paint by 300 ms — the page looks frozen, and clicks
          feel ignored. And visual updates belong in <code>requestAnimationFrame</code>, which runs
          right before the paint, rather than in a <code>setTimeout</code> that may fire between
          frames.
        </p>
        <Script title="rendering.js" code={frames} />

        <h2 id="starvation">Starvation — When Microtasks Never Stop</h2>
        <Script title="starvation.js" code={starvation} />
        <EventLoopStepper scenario="starvation" />
        <Callout kind="bad">
          <p className="mb-0">
            Because the microtask queue must be fully drained before the callback queue gets a
            single turn, a microtask that keeps scheduling another microtask can — in principle —
            keep the callback queue (and browser rendering, which also waits for an empty
            microtask queue) starved indefinitely. This is a genuine, documented failure mode in
            real applications with runaway promise chains, not just a theoretical curiosity.
          </p>
        </Callout>

        <h2 id="node">A Quick Note On Node.js</h2>
        <Callout kind="note">
          <p className="mb-0">
            Everything above describes the browser&apos;s event loop. Node.js runs the same core
            idea — one call stack, a microtask queue that drains fully between macrotasks — but its
            macrotask side is organized into distinct <strong>phases</strong> (timers, I/O
            callbacks, close callbacks, and more) managed by a library called{" "}
            <strong>libuv</strong>, and it adds its own extra-high-priority queue,{" "}
            <code>process.nextTick()</code>. The mental model from this lesson transfers directly;
            Node&apos;s phase system is worth a dedicated look if you&apos;re going deep on backend
            work, but it&apos;s outside the scope of this core-JavaScript block.
          </p>
        </Callout>

        <h2 id="live">See It Live — DevTools</h2>
        <ol className="steps">
          <li>
            <h3>Paste the classic example into the console</h3>
            <p>Confirm the output order matches the trace above.</p>
          </li>
          <li>
            <h3>Open the Performance tab and record</h3>
            <p>
              Re-run the snippet with recording on — you&apos;ll see the synchronous block, then a
              microtasks marker, then the timer firing as a separate task.
            </p>
          </li>
          <li>
            <h3>Try nesting more .then() calls</h3>
            <p>
              Chain three or four <code>.then()</code>s after the first — notice they all still
              run before the single <code>setTimeout</code>, because each one re-queues into the
              still-draining microtask queue.
            </p>
          </li>
          <li>
            <h3>Swap the delay to 1000</h3>
            <p>
              The relative order doesn&apos;t change — the promise callback still always wins,
              regardless of the timer&apos;s delay, because the golden rule isn&apos;t about speed,
              it&apos;s about queue priority.
            </p>
          </li>
        </ol>

        <h2 id="pitfalls">Common Misconceptions</h2>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;JavaScript can run things in parallel because of async code.&rdquo;</strong>{" "}
            No — there is still only one call stack. Async APIs create the appearance of
            concurrency by offloading work elsewhere and scheduling the result, never by running
            your JS on more than one thread at once.
          </p>
        </Callout>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;A Promise&apos;s executor function itself runs
            asynchronously.&rdquo;</strong> It doesn&apos;t — the function you pass to{" "}
            <code>new Promise((resolve, reject) =&gt; {"{...}"})</code> runs synchronously,
            immediately. Only <code>.then()</code>/<code>.catch()</code>/<code>.finally()</code>{" "}
            callbacks are deferred as microtasks.
          </p>
        </Callout>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;setTimeout(fn, 0) queues fn to run next, right after the current
            line.&rdquo;</strong> It queues <code>fn</code> as a macrotask — which still waits
            behind the entire, possibly-growing microtask queue before it gets a turn.
          </p>
        </Callout>

        <h2 id="interview">Interview Questions</h2>
        {questions.map(([q, a], i) => (
          <details key={i} className="my-3 rounded-xl border border-line bg-bg-elev px-5 py-3">
            <summary className="cursor-pointer font-semibold text-ink">{q}</summary>
            <p className="mb-0 mt-2 text-ink-dim">{a}</p>
          </details>
        ))}

        <h2 id="conclusion">Tying All 14 Lessons Together</h2>
        <Callout kind="ok" label="What actually happens when your JS file runs">
          <p className="mb-0">
            The engine (Lesson 13) parses your file and builds a Global Execution Context (Lesson
            1), pushing it onto the call stack (Lesson 2). During its memory phase,{" "}
            <code>var</code>s and function declarations are hoisted (Lessons 1, 8), while{" "}
            <code>let</code>/<code>const</code> sit in the Temporal Dead Zone (Lesson 8) inside
            their own block scope (Lesson 9). As functions are called, each gets its own execution
            context and Variable Environment (Lesson 4), linked outward through the scope chain
            (Lesson 7) to whatever it could see at the moment it was defined — the mechanism that
            also gives functions their closures (Lesson 10), letting them outlive the very call
            that created them (Lesson 11). Along the way, functions pass freely as values (Lesson
            12) — as callbacks, as event listeners — and whenever one of those needs to wait, it
            steps outside the call stack entirely, into Web APIs and the two queues this lesson
            just walked through, coordinated the whole time by the event loop. That&apos;s the
            full model, start to finish.
          </p>
        </Callout>
      </div>

      <LessonPager slug="lesson-14" lessons={JS_LESSONS} href={jsLessonHref} series={JS_SERIES} />
    </article>
  );
}
