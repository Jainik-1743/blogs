import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import { BindTimerLoop, HelperTimerLoop, IifeTimerLoop, LetTimerLoop, NaiveTimerLoop } from "@/components/figures/TimerLoopCases";
import TimerTimeline from "@/components/figures/TimerTimeline";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { JS_LESSONS, JS_SERIES, jsLessonHref } from "@/lib/javascript";

const lesson = JS_LESSONS.find((l) => l.slug === "lesson-11")!;

export const metadata: Metadata = {
  title: `Lesson 11 — ${lesson.title}`,
  description: lesson.summary,
};

/** In-page index. Each entry links to a section heading below. */
const outline = [
  { id: "problem", label: "The problem, stated precisely" },
  { id: "analogy", label: "The wake-up call sheet — an analogy" },
  { id: "naive", label: "The naive attempt — and why it fails" },
  { id: "trace", label: "Tracing it, step by step" },
  { id: "fix1", label: "Fix 1 — swap var for let" },
  { id: "fix2", label: "Fix 2 — wrap it in a closure (IIFE)" },
  { id: "fix3", label: "Fix 3 — pass i as a function parameter" },
  { id: "fix4", label: "Fix 4 — pre-bind the argument" },
  { id: "compare", label: "All four, side by side" },
  { id: "timing", label: "A note on setTimeout's timing" },
  { id: "live", label: "See it live — DevTools" },
  { id: "pitfalls", label: "Common misconceptions" },
  { id: "interview", label: "Interview questions" },
];

const naive = `for (var i = 1; i <= 5; i++) {
  setTimeout(() => {
    console.log(i);
  }, i * 1000);
}

// Expected: 1, 2, 3, 4, 5 (one per second)
// Actual:   6, 6, 6, 6, 6`;

const fix1 = `for (let i = 1; i <= 5; i++) {
  setTimeout(() => {
    console.log(i);
  }, i * 1000);
}
// 1, 2, 3, 4, 5 — one per second`;

const fix2 = `for (var i = 1; i <= 5; i++) {
  (function (capturedI) {
    setTimeout(() => {
      console.log(capturedI);
    }, capturedI * 1000);
  })(i);
}
// 1, 2, 3, 4, 5`;

const fix3 = `function scheduleLog(n) {
  setTimeout(() => {
    console.log(n);
  }, n * 1000);
}

for (var i = 1; i <= 5; i++) {
  scheduleLog(i);
}
// 1, 2, 3, 4, 5`;

const fix4 = `for (var i = 1; i <= 5; i++) {
  setTimeout(
    console.log.bind(null, i),
    i * 1000
  );
}
// 1, 2, 3, 4, 5`;

const questions: [React.ReactNode, React.ReactNode][] = [
  [
    "Why does the naive var + setTimeout loop print the same number every time?",
    <>Because <code>var</code> creates one shared variable for the entire loop. All the callbacks close over that same variable, and by the time any of them run, the loop has already finished and the variable holds its final value.</>,
  ],
  [
    "Name three ways to fix it without simply switching var to let.",
    <>Wrap the body in an IIFE that takes the current value as a parameter; extract the body into a helper function and call it with the current value; or use <code>.bind()</code> to lock in the current value as an argument.</>,
  ],
  [
    "Why does passing i into a helper function fix the bug?",
    "Every function call gets its own private Variable Environment (Lesson 4). Each call to the helper creates a new, independent copy of its parameter, so each returned/scheduled closure captures its own value instead of a shared one.",
  ],
  [
    "Does simply adding let fix a nested var inside the loop body too?",
    <>No — only the loop&apos;s own control variable becomes per-iteration with <code>let</code>. A <code>var</code> declared inside the loop body is still function/global-scoped and still shared across iterations, exactly as in Lesson 9.</>,
  ],
  [
    "Does setTimeout(fn, 1000) guarantee the callback runs at exactly 1000ms?",
    "No — it guarantees a minimum delay of about 1000ms. The callback can run later if the call stack is still busy when that time is reached.",
  ],
];

export default function JsLessonElevenPage() {
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
          Lesson 11 · {lesson.readTime} read
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
        <h2 id="problem">The Problem, Stated Precisely</h2>
        <p>
          Print the numbers 1 through 5, one per second — <code>1</code> after 1 second,{" "}
          <code>2</code> after 2 seconds, and so on — using a loop and <code>setTimeout</code>. It
          sounds trivial. The obvious first attempt is wrong, and understanding exactly{" "}
          <em>why</em> it&apos;s wrong is what makes this question worth asking.
        </p>

        <h2 id="analogy">The Wake-Up Call Sheet — An Analogy</h2>
        <Callout kind="note" label="One shared slip vs. five separate slips">
          <p>
            A guest asks the front desk for five wake-up calls, one every hour, for rooms 1 through
            5. The desk clerk scribbles the room number on a <strong>single sticky note</strong>,
            reuses that same note for every request, and hands it to the wake-up-call team to act
            on later, one hour at a time.
          </p>
          <p>
            By the time the first wake-up call actually happens an hour later, the clerk has
            already overwritten that same sticky note five times — it now just says{" "}
            <strong>&ldquo;6&rdquo;</strong>. Every single wake-up call rings for room 6, because
            there was only ever one note, shared and repeatedly overwritten.
          </p>
          <p className="mb-0">
            The fix, in every version below, is the same idea: give each wake-up call{" "}
            <strong>its own separate note</strong>, written and sealed the moment the request is
            made — not one shared note read later, after all five requests have already been
            scribbled over it.
          </p>
        </Callout>

        <h2 id="naive">The Naive Attempt — And Why It Fails</h2>
        <Script title="naive.js" code={naive} />
        <Callout kind="bad">
          <p className="mb-0">
            This is the exact bug from Lesson 10&apos;s loop example, just dressed up with
            increasing delays. <code>var</code> is not block-scoped (Lesson 9) — there is only{" "}
            <strong>one</strong> <code>i</code> shared by the entire loop and by all five arrow
            functions. The <code>setTimeout</code> delays only control <em>when</em> each callback
            runs — they don&apos;t stop the loop from finishing first, every single time, before
            any callback fires.
          </p>
        </Callout>
        <TimerTimeline />

        <h2 id="trace">Tracing It, Step By Step</h2>
        <NaiveTimerLoop />
        <ol className="steps">
          <li>
            <h3>The loop runs to completion immediately</h3>
            <p>
              <code>setTimeout</code> doesn&apos;t pause the loop — it just hands each callback off
              to be run later, and the loop moves straight on to the next iteration. All five{" "}
              <code>setTimeout</code> calls happen within a few milliseconds of each other.
            </p>
          </li>
          <li>
            <h3>i keeps incrementing, in the same shared spot</h3>
            <p>
              By the time the loop&apos;s condition <code>i &lt;= 5</code> finally fails,{" "}
              <code>i</code> has been incremented one last time — to <code>6</code> — and the loop
              exits.
            </p>
          </li>
          <li>
            <h3>All five callbacks were closures over that one i</h3>
            <p>
              None of the five arrow functions got their own copy of <code>i</code>. Each one just
              closed over the single, shared <code>i</code> variable — the same one the loop itself
              was using.
            </p>
          </li>
          <li>
            <h3>A second (or more) later, each callback finally runs</h3>
            <p>
              By now <code>i</code> is <code>6</code> and will never change again. Every callback
              reads the same, final, shared value — five wake-up calls, one overwritten sticky
              note.
            </p>
          </li>
        </ol>
        <Callout kind="note">
          <p className="mb-0">
            Notice this trace doesn&apos;t need the full machinery of the event loop (that&apos;s
            Lesson 14) — it only needs one fact: <code>setTimeout</code>&apos;s callback always
            runs <em>later</em>, after the synchronous code around it has already finished. That
            single fact is enough to explain the entire bug.
          </p>
        </Callout>

        <h2 id="fix1">Fix 1 — Swap var For let</h2>
        <Script title="fix1-let.js" code={fix1} />
        <p>
          Covered in full in Lesson 10: <code>let</code> creates a{" "}
          <strong>brand-new binding of <code>i</code> for every iteration</strong> of the loop. Five
          iterations, five completely independent <code>i</code> variables, five separate closures
          — each one permanently capturing its own value. This is the modern, default answer, and
          in real code it&apos;s the one you should actually use.
        </p>
        <LetTimerLoop />

        <h2 id="fix2">Fix 2 — Wrap It In A Closure (IIFE)</h2>
        <p>
          Before <code>let</code> existed, this was <em>the</em> standard interview answer, and it
          still shows up when someone asks &ldquo;solve it without changing var.&rdquo; An{" "}
          <strong>IIFE</strong> (Immediately Invoked Function Expression) creates a brand-new
          function scope on every iteration, and that new scope is where the closure actually
          forms:
        </p>
        <Script title="fix2-iife.js" code={fix2} />
        <p>
          The IIFE runs <strong>immediately</strong>, on every single iteration, taking the current
          value of <code>i</code> as its parameter <code>capturedI</code> right then and there. Each
          of the five IIFE calls gets its own private Variable Environment (Lesson 4) — its own
          separate <code>capturedI</code> — and the inner <code>setTimeout</code> callback closes
          over that private copy instead of the shared, looping <code>i</code>.
        </p>
        <IifeTimerLoop />

        <h2 id="fix3">Fix 3 — Pass i As A Function Parameter</h2>
        <Script title="fix3-helper.js" code={fix3} />
        <p>
          Same underlying idea as the IIFE, just cleaner: every call to <code>scheduleLog(i)</code>{" "}
          creates a brand-new function call, and every function call gets its own fresh Variable
          Environment (Lesson 4) — including its own private copy of the parameter <code>n</code>.
          Five calls, five independent <code>n</code>s, five correct closures.
        </p>
        <HelperTimerLoop />

        <h2 id="fix4">Fix 4 — Pre-Bind The Argument</h2>
        <Script title="fix4-bind.js" code={fix4} />
        <p>
          <code>.bind()</code> creates a new function with <code>i</code>&apos;s{" "}
          <strong>current value</strong> permanently locked in as an argument, right at the moment{" "}
          <code>.bind()</code> is called — not read later when the timer fires. It sidesteps
          closures entirely by baking the value in up front, rather than relying on scope at all.
        </p>
        <BindTimerLoop />

        <h2 id="compare">All Four, Side By Side</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fix</th>
                <th>What actually creates the new scope</th>
                <th>Still uses var?</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1. <code>let</code></td><td>A fresh block-scoped binding per loop iteration</td><td className="font-semibold text-red-300">No</td></tr>
              <tr><td>2. IIFE</td><td>A new function call, invoked immediately, per iteration</td><td className="font-semibold text-emerald-300">Yes</td></tr>
              <tr><td>3. Helper function</td><td>A new function call (not immediately invoked) per iteration</td><td className="font-semibold text-emerald-300">Yes</td></tr>
              <tr><td>4. <code>.bind()</code></td><td>No new scope — the value is baked into the function directly</td><td className="font-semibold text-emerald-300">Yes</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          All four are legitimate, correct answers. In real code, reach for <code>let</code> —
          it&apos;s simpler and it&apos;s what it was designed for. The other three are worth
          knowing because interviewers often specifically ask you to solve it{" "}
          <strong>without</strong> touching <code>var</code>.
        </p>

        <h2 id="timing">A Note On setTimeout&apos;s Timing</h2>
        <Callout kind="warn">
          <p className="mb-0">
            <code>setTimeout(fn, 1000)</code> does not guarantee the callback fires at{" "}
            <em>exactly</em> 1000ms — it guarantees <strong>at least</strong> 1000ms. If the call
            stack is busy running other code when the 1000ms mark arrives, the callback waits until
            the stack is free. The full reason why — the callback queue, the microtask queue, and
            the event loop that connects them — is coming in Lesson 14. For this lesson, the
            relative ordering (1 before 2 before 3...) is guaranteed even if the exact millisecond
            isn&apos;t.
          </p>
        </Callout>

        <h2 id="live">See It Live — DevTools</h2>
        <ol className="steps">
          <li>
            <h3>Paste the naive var version</h3>
            <p>
              Run it in the console and watch all five logs arrive together, showing{" "}
              <code>6</code> five times.
            </p>
          </li>
          <li>
            <h3>Set a breakpoint inside the arrow function</h3>
            <p>On the <code>console.log(i)</code> line, then re-run.</p>
          </li>
          <li>
            <h3>Check the Closure section each time it pauses</h3>
            <p>
              All five pauses will show the exact same <code>Closure (loop scope)</code> entry,
              with <code>i</code> already at <code>6</code> in every single one.
            </p>
          </li>
          <li>
            <h3>Repeat with the let version</h3>
            <p>
              This time each pause shows a genuinely different <code>Closure</code> entry — a fresh{" "}
              <code>i</code> per iteration, exactly as Lesson 10 described.
            </p>
          </li>
        </ol>

        <h2 id="pitfalls">Common Misconceptions</h2>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;setTimeout(fn, 0) or a longer delay pauses the loop until it fires.&rdquo;</strong>{" "}
            No — <code>setTimeout</code> never blocks anything. It schedules the callback and
            returns immediately; the loop keeps running without waiting.
          </p>
        </Callout>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;The IIFE fix works because it runs the code earlier.&rdquo;</strong> It
            doesn&apos;t change <em>when</em> the <code>console.log</code> runs — it changes{" "}
            <em>which variable</em> the callback closes over, by creating a brand-new scope per
            iteration.
          </p>
        </Callout>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;You need let to fix this — there&apos;s no other way.&rdquo;</strong>{" "}
            <code>let</code> is the simplest fix, not the only one. Any technique that creates a
            fresh scope per iteration works, which is why the IIFE and helper-function fixes are
            still asked about.
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

      <LessonPager slug="lesson-11" lessons={JS_LESSONS} href={jsLessonHref} series={JS_SERIES} />
    </article>
  );
}
