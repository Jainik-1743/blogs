import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import CallStackStepper from "@/components/figures/CallStackStepper";
import Figure from "@/components/figures/Figure";
import PushPop from "@/components/figures/PushPop";
import StackOverflowStepper from "@/components/figures/StackOverflowStepper";
import StackTraceMap from "@/components/figures/StackTraceMap";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { JS_LESSONS, JS_SERIES, jsLessonHref } from "@/lib/javascript";

const lesson = JS_LESSONS.find((l) => l.slug === "lesson-2")!;

export const metadata: Metadata = {
  title: `Lesson 2 — ${lesson.title}`,
  description: lesson.summary,
};

/** In-page index. Each entry links to a section heading below. */
const outline = [
  { id: "concept", label: "Concept" },
  { id: "why", label: "Why this matters" },
  { id: "tray", label: "The receptionist's tray — an analogy" },
  { id: "rules", label: "The two rules: push and pop" },
  { id: "sits", label: "What actually sits on the stack" },
  { id: "example", label: "Real example — traced line by line" },
  { id: "separate", label: "Same function, separate calls" },
  { id: "overflow", label: "Stack overflow — when the tray runs out" },
  { id: "trace", label: "Reading a real stack trace" },
  { id: "live", label: "See it live — terminal & DevTools" },
  { id: "pitfalls", label: "Common misconceptions" },
  { id: "interview", label: "Interview questions" },
];

const example = `var hotelName = "Grand Palace";

function bookRoom(guestName) {
  var roomNumber = 101;
  checkAvailability(roomNumber);
  console.log(guestName + " booked room " + roomNumber);
}

function checkAvailability(room) {
  var isFree = true;
  console.log("Room " + room + " available: " + isFree);
}

bookRoom("Aditi");`;

const separate = `function bookRoom(guestName) {
  var roomNumber = Math.floor(Math.random() * 100);
  console.log(guestName + " got room " + roomNumber);
}

bookRoom("Aditi");
bookRoom("Rahul");`;

const overflow = `function countDown(n) {
  console.log(n);
  countDown(n - 1); // never stops — no condition to stop it
}

countDown(5);`;

const trace = `Uncaught RangeError: Maximum call stack size exceeded
    at countDown (index.js:3)
    at countDown (index.js:3)
    at countDown (index.js:3)
    at countDown (index.js:3)
    ...`;

const questions: [string, React.ReactNode][] = [
  [
    "What is the Call Stack, and why does it matter that JS is single-threaded?",
    "The structure that tracks which Execution Context is currently running. Because JS is single-threaded, only one context can ever be on top and running at a time.",
  ],
  [
    "What are the two operations on the stack, and when does each happen?",
    "Push, when a function is called; pop, the instant that function finishes.",
  ],
  [
    "Why is it called LIFO, and how does that show up in real code?",
    "Last In, First Out — whichever function was called most recently is always the first one to finish and get removed, before anything below it can continue.",
  ],
  [
    "What causes “Maximum call stack size exceeded,” and what's this commonly called?",
    "Pushing far more Execution Contexts than the stack has room for, usually from recursion with no stopping point — commonly called a stack overflow.",
  ],
  [
    "If the same function is called 3 separate times, how many Execution Contexts are created in total?",
    "Three — completely separate ones, none of them sharing memory with each other.",
  ],
  [
    "What determines exactly when an Execution Context gets popped?",
    <>The moment its function finishes running — hits its last line, or a <code>return</code> statement.</>,
  ],
  [
    "How do you read the order of a printed stack trace?",
    "Top to bottom: the top line is the most recent, deepest call at the moment of the crash; each line below walks back toward the Global Execution Context.",
  ],
  [
    "Does the Global Execution Context ever get popped, and when?",
    "Yes — but only once, right at the very end, after every other context has already finished and the program has nothing left to run.",
  ],
];

export default function JsLessonTwoPage() {
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
          Lesson 2 · {lesson.readTime} read
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
          JavaScript is <strong>single-threaded</strong> — one worker, one task, one moment. But
          your code is full of functions calling other functions calling other functions. So how
          does the engine always know exactly which piece of code is running right now, and where
          to go back to once it&apos;s done?
        </p>
        <p>
          The answer is a structure called the <strong>Call Stack</strong>. Every Execution
          Context you met in Lesson 1 doesn&apos;t just float around on its own — it gets placed
          on this stack, and the engine only ever runs whatever sits on <strong>top</strong>.
        </p>
        <Callout kind="note">
          <p className="mb-0">
            &ldquo;Stack&rdquo; here means exactly what it means with a stack of plates. You can
            only add a plate to the top, and you can only take the top plate off. You can&apos;t
            pull one out from the middle without everything above it toppling. JavaScript&apos;s
            Call Stack follows that exact same rule.
          </p>
        </Callout>

        <h2 id="why">Why This Matters</h2>
        <ul>
          <li>
            It&apos;s why synchronous code always finishes completely, top to bottom, before the
            next unrelated line even gets a chance to start.
          </li>
          <li>
            It&apos;s directly responsible for the famous{" "}
            <code>Maximum call stack size exceeded</code> error — and for why that error&apos;s
            common nickname is a &ldquo;stack overflow.&rdquo;
          </li>
          <li>
            It&apos;s what lets you read an error&apos;s stack trace and know exactly which
            function called which, in what order, right up to the crash.
          </li>
          <li>
            It&apos;s the foundation for the Event Loop, much later in this course — the event
            loop&apos;s entire job is watching whether this stack is empty or not.
          </li>
        </ul>

        <h2 id="tray">The Receptionist&apos;s Tray — An Analogy</h2>
        <Callout kind="note" label="One receptionist, one tray">
          <p>
            A hotel has <strong>one receptionist</strong> on the desk — one worker, one task at a
            time, exactly like JavaScript. She keeps a tray on her desk for index cards.
          </p>
          <p>
            Her shift starts → she drops in a card: <strong>&ldquo;Run the Front Desk Today.&rdquo;</strong>{" "}
            It sits at the very bottom, and stays there her whole shift.
          </p>
          <p>
            A guest calls to book a room → she writes <strong>&ldquo;Book Room&rdquo;</strong> and
            places it <em>on top</em> of the tray. She stops whatever she was doing and works on
            this new card immediately.
          </p>
          <p>
            Mid-booking she needs to confirm a room is free → she writes{" "}
            <strong>&ldquo;Check Availability&rdquo;</strong> and places it{" "}
            <em>on top of &ldquo;Book Room.&rdquo;</em> She works on this first, because it&apos;s
            now the topmost card.
          </p>
          <p>
            The room checks out free → she <strong>removes &ldquo;Check Availability&rdquo;</strong>{" "}
            from the tray entirely and goes straight back to &ldquo;Book Room&rdquo; — exactly where
            she paused.
          </p>
          <p className="mb-0">
            Booking confirmed → she <strong>removes &ldquo;Book Room&rdquo;</strong> too. Back to
            &ldquo;Run the Front Desk Today,&rdquo; at the bottom, where she stays until the shift
            ends.
          </p>
        </Callout>
        <Figure caption="The tray over one booking. Cards only ever go on top and only ever come off the top." note="analogy">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[
              ["shift starts", ["Run the Front Desk Today"]],
              ["guest calls", ["Run the Front Desk Today", "Book Room"]],
              ["confirm it's free", ["Run the Front Desk Today", "Book Room", "Check Availability"]],
              ["room is free", ["Run the Front Desk Today", "Book Room"]],
              ["booking confirmed", ["Run the Front Desk Today"]],
            ].map(([label, cards], i) => (
              <div key={label as string} className="flex min-w-[9.5rem] flex-1 flex-col">
                <div className="flex h-[9.5rem] flex-col-reverse gap-1 rounded-lg border border-line bg-bg-code p-1.5">
                  {(cards as string[]).map((c, ci) => {
                    const top = ci === (cards as string[]).length - 1;
                    return (
                      <div
                        key={c}
                        className={`rounded-md border px-2 py-1 text-center text-[0.7rem] font-semibold ${
                          ci === 0 ? "border-line bg-bg-elev text-ink" : ci === 1 ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-200" : "border-violet-400/50 bg-violet-400/10 text-violet-200"
                        } ${top ? "" : "opacity-60"}`}
                      >
                        {c}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 text-center font-mono text-[0.68rem] uppercase tracking-[0.08em] text-ink-dim">
                  {i + 1}. {label as string}
                </div>
              </div>
            ))}
          </div>
        </Figure>
        <p>
          She only ever works on the card sitting on top. She never reaches underneath while
          something sits above it. That single rule — top card only — is the entire Call Stack.
        </p>

        <h2 id="rules">The Two Rules: Push and Pop</h2>
        <p>Everything the Call Stack does comes down to exactly two operations:</p>
        <ul>
          <li>
            <strong>Push</strong> — whenever a function is called, a fresh Execution Context is
            created for it and placed on <em>top</em> of the stack. Nothing below it is touched;
            it just waits, paused, underneath.
          </li>
          <li>
            <strong>Pop</strong> — the instant a function finishes (its last line runs, or it hits{" "}
            <code>return</code>), its Execution Context is removed from the top, and control goes
            straight back to whichever context is now exposed on top.
          </li>
        </ul>
        <p>
          Together, push and pop make the stack <strong>LIFO — Last In, First Out.</strong>{" "}
          Whatever was pushed most recently is always the very first thing to get popped.
        </p>
        <PushPop />

        <h2 id="sits">What Actually Sits On The Stack</h2>
        <p>
          Quick recap from Lesson 1, because it matters here:{" "}
          <strong>Execution Context (EC)</strong> is the general term.{" "}
          <strong>Global Execution Context (GEC)</strong> is just one specific EC — the first one,
          created automatically, sitting at the very bottom. Every function call creates another
          specific kind, a <strong>Function Execution Context</strong>, which gets pushed above
          whatever&apos;s already there.
        </p>
        <Callout kind="note">
          <p className="mb-0">
            GEC is pushed exactly once, automatically, right when the program starts — and it is
            the very last thing popped, only once the entire program has nothing left to run.
          </p>
        </Callout>

        <h2 id="example">Real Example — Traced Line By Line</h2>
        <Script title="stack.js" code={example} />
        <CallStackStepper />
        <ol className="steps">
          <li>
            <h3>Global EC pushed</h3>
            <p>
              Stack: <code>[ Global ]</code>. Memory phase reserves <code>hotelName → undefined</code>,
              plus both functions in full. Code phase runs: <code>hotelName = &quot;Grand Palace&quot;</code>,
              then <code>bookRoom(&quot;Aditi&quot;)</code> is called.
            </p>
          </li>
          <li>
            <h3><code>bookRoom</code> EC pushed</h3>
            <p>
              Stack: <code>[ Global, bookRoom ]</code>. Its own private memory:{" "}
              <code>guestName → &quot;Aditi&quot;</code>, <code>roomNumber → undefined</code>. Code
              runs: <code>roomNumber = 101</code>, then <code>checkAvailability(101)</code> is
              called.
            </p>
          </li>
          <li>
            <h3><code>checkAvailability</code> EC pushed</h3>
            <p>
              Stack: <code>[ Global, bookRoom, checkAvailability ]</code>. Its own private memory:{" "}
              <code>room → 101</code>, <code>isFree → undefined</code>. Code runs:{" "}
              <code>isFree = true</code>, then prints <code>Room 101 available: true</code>.
            </p>
          </li>
          <li>
            <h3><code>checkAvailability</code> finishes → popped</h3>
            <p>
              Stack: <code>[ Global, bookRoom ]</code>. Its memory is discarded completely.
              Control returns to <code>bookRoom</code>, right after the call, which prints{" "}
              <code>Aditi booked room 101</code>.
            </p>
          </li>
          <li>
            <h3><code>bookRoom</code> finishes → popped</h3>
            <p>
              Stack: <code>[ Global ]</code>. Program has nothing left → Global is popped too.
              Stack: <code>[ ]</code>.
            </p>
          </li>
        </ol>

        <h2 id="separate">Same Function, Separate Calls</h2>
        <p>
          It isn&apos;t only <em>different</em> functions that get different ECs — the{" "}
          <strong>same function called twice</strong> gets two completely separate, brand-new ECs
          that share nothing.
        </p>
        <Script title="separate.js" code={separate} />
        <Callout kind="ok">
          <p className="mb-0">
            1st call → fresh EC → its own <code>roomNumber</code>, say <code>42</code> → prints{" "}
            <code>Aditi got room 42</code> → popped, thrown away entirely.
            <br />
            2nd call → a brand-new, separate EC (never the reused first one) → its own{" "}
            <code>roomNumber</code>, say <code>77</code> → prints <code>Rahul got room 77</code> →
            popped.
          </p>
        </Callout>
        <Figure caption="Two calls, two contexts, two separate memories. The second one is built from scratch after the first is already gone." note="separate calls">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            {[
              ["1st call", "bookRoom(\"Aditi\")", [["guestName", "\"Aditi\""], ["roomNumber", "42"]], "popped · gone"],
              ["2nd call", "bookRoom(\"Rahul\")", [["guestName", "\"Rahul\""], ["roomNumber", "77"]], "popped · gone"],
            ].map(([label, call, vars, end], i) => (
              <div key={label as string} className={`${i === 1 ? "sm:col-start-3" : ""} overflow-hidden rounded-lg border border-emerald-400/50`}>
                <div className="border-b border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-emerald-200">
                  {label as string} · {call as string}
                </div>
                <ul className="m-0 list-none space-y-1 p-3 font-mono text-[0.8rem]">
                  {(vars as string[][]).map(([k, v]) => (
                    <li key={k} className="flex justify-between rounded bg-bg-code px-2 py-1">
                      <span className="text-sky-strong">{k}</span>
                      <span className="text-emerald-200">{v}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-line px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.08em] text-ink-dim">{end as string}</div>
              </div>
            ))}
            <div className="row-start-2 text-center font-mono text-[0.72rem] text-ink-dim sm:col-start-2 sm:row-start-1">
              shares<br />nothing<br />⟷
            </div>
          </div>
        </Figure>
        <p>
          Even though it&apos;s the exact same function, Aditi&apos;s card and Rahul&apos;s card
          never see each other&apos;s sticky note.
        </p>

        <h2 id="overflow">Stack Overflow — When The Tray Runs Out</h2>
        <p>
          The tray isn&apos;t infinite — the stack has a fixed amount of memory set aside for it.
          If a function keeps calling itself with no stopping point, cards keep getting pushed, one
          after another, with nothing ever being popped in between:
        </p>
        <Script title="overflow.js" code={overflow} />
        <p>
          Each call is still waiting on the next one to finish before it can finish itself, so
          nothing ever gets popped — the tray just keeps growing. Eventually there&apos;s genuinely
          no more room, and JS throws:
        </p>
        <Callout kind="bad">
          <p className="mb-0"><code>RangeError: Maximum call stack size exceeded</code></p>
        </Callout>
        <StackOverflowStepper />
        <Callout kind="note">
          <p className="mb-0">
            This is exactly why every recursive function needs a <strong>base case</strong> — a
            condition that stops it from calling itself further, so the stack can start popping
            back down. A working version:{" "}
            <code>function countDown(n) {"{"} if (n &lt; 0) return; console.log(n); countDown(n - 1); {"}"}</code>
          </p>
        </Callout>

        <h2 id="trace">Reading A Real Stack Trace</h2>
        <p>
          When an error is thrown, JS prints a <strong>stack trace</strong> — and it&apos;s exactly
          what the name says: a printout of what was still sitting on the Call Stack at the moment
          things broke.
        </p>
        <Script title="console" code={trace} />
        <p>
          Read it <strong>top to bottom</strong>: the top line is exactly where you were standing
          the instant it broke — the most recent, deepest call. Each line below it is one card
          further down the tray, walking back toward Global at the very bottom (most engines cut
          the printout off after a limited number of frames, since there could be thousands).
        </p>
        <StackTraceMap />

        <h2 id="live">See It Live — Terminal &amp; DevTools</h2>

        <h3>Option A — Node.js debugger</h3>
        <ol className="steps">
          <li>
            <h3>Save the file</h3>
            <p>
              Save the <code>hotelName</code> / <code>bookRoom</code> example from earlier as{" "}
              <code>stack.js</code>.
            </p>
          </li>
          <li>
            <h3>Launch with the inspector</h3>
            <Script title="terminal" code="node --inspect-brk stack.js" />
          </li>
          <li>
            <h3>Attach Chrome</h3>
            <p>
              Open <code>chrome://inspect</code>, click <strong>inspect</strong> under Remote
              Target.
            </p>
          </li>
          <li>
            <h3>Step into every call</h3>
            <p>
              Use Step Into (not Step Over) on <code>bookRoom(...)</code> and{" "}
              <code>checkAvailability(...)</code>.
            </p>
          </li>
          <li>
            <h3>Watch the Call Stack panel</h3>
            <p>
              Watch a new frame appear every time you step into a call, and disappear the instant
              that function returns — this panel <em>is</em> the tray, shown live.
            </p>
          </li>
        </ol>

        <h3>Option B — Trigger an overflow directly</h3>
        <ol className="steps">
          <li>
            <h3>Open the console</h3>
            <p>Any page → DevTools (F12) → Console tab.</p>
          </li>
          <li>
            <h3>Paste the broken <code>countDown</code></h3>
            <p>The version with no base case, from the Stack Overflow section above.</p>
          </li>
          <li>
            <h3>Run it</h3>
            <p>
              Watch the console print <code>RangeError: Maximum call stack size exceeded</code>{" "}
              along with a (truncated) stack trace — real proof the tray ran out of room.
            </p>
          </li>
        </ol>

        <h2 id="pitfalls">Common Misconceptions</h2>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;The call stack and the memory heap are the same thing.&rdquo;</strong>{" "}
            They&apos;re not. The heap is a separate area where objects and functions actually
            live in memory. The call stack only tracks the <em>order</em> of what&apos;s currently
            running — it&apos;s a to-do tray, not a warehouse.
          </p>
        </Callout>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;Recursion is dangerous and should be avoided.&rdquo;</strong> Recursion
            itself is completely normal and used constantly. The danger is only recursion with no
            base case, or one that legitimately needs more depth than the stack can hold.
          </p>
        </Callout>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;The stack keeps a record of every function that ever ran.&rdquo;</strong>{" "}
            The opposite is true — the moment an EC is popped, it and its memory are thrown away
            completely. Nothing is kept around afterward.
          </p>
        </Callout>

        <h2 id="interview">Interview Questions</h2>
        {questions.map(([q, a]) => (
          <details key={q} className="my-3 rounded-xl border border-line bg-bg-elev px-5 py-3">
            <summary className="cursor-pointer font-semibold text-ink">{q}</summary>
            <p className="mb-0 mt-2 text-ink-dim">{a}</p>
          </details>
        ))}
      </div>

      <LessonPager slug="lesson-2" lessons={JS_LESSONS} href={jsLessonHref} series={JS_SERIES} />
    </article>
  );
}
