import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import BlockScopeBox from "@/components/figures/BlockScopeBox";
import BlockScopeStepper from "@/components/figures/BlockScopeStepper";
import TdzStepper from "@/components/figures/TdzStepper";
import TwoRecords from "@/components/figures/TwoRecords";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { JS_LESSONS, JS_SERIES, jsLessonHref } from "@/lib/javascript";

const lesson = JS_LESSONS.find((l) => l.slug === "lesson-3")!;

export const metadata: Metadata = {
  title: `Lesson 3 — ${lesson.title}`,
  description: lesson.summary,
};

/** In-page index. Each entry links to a section heading below. */
const outline = [
  { id: "concept", label: "Concept" },
  { id: "why", label: "Why this matters" },
  { id: "room", label: "The locked meeting room — an analogy" },
  { id: "var", label: "var — hoisted and ready" },
  { id: "letconst", label: "let and const — hoisted but locked" },
  { id: "construle", label: "const's extra rule" },
  { id: "scope", label: "Block scope vs. function scope" },
  { id: "hood", label: "Under the hood — two memory records" },
  { id: "live", label: "See it live — window & DevTools" },
  { id: "example", label: "Real example — traced line by line" },
  { id: "pitfalls", label: "Common misconceptions" },
  { id: "interview", label: "Interview questions" },
];

const varCode = `console.log(guestName); // undefined
var guestName = "Aditi";`;

const letCode = `console.log(guestName); // ReferenceError: Cannot access 'guestName' before initialization
let guestName = "Aditi";`;

const constMissing = `const roomNumber; // SyntaxError: Missing initializer in const declaration`;

const constMutate = `const guest = { name: "Aditi", room: 101 };

guest.room = 102;   // fine — mutating a property
console.log(guest); // { name: "Aditi", room: 102 }

guest = { name: "Rahul" }; // TypeError: Assignment to constant variable.`;

const blockCode = `if (true) {
  var a = "visible everywhere";
  let b = "visible only inside these { }";
}

console.log(a); // "visible everywhere"
console.log(b); // ReferenceError: b is not defined`;

const windowCode = `var guestName = "Aditi";
let roomNumber = 101;
const hotelName = "Grand Palace";

console.log(window.guestName);   // "Aditi"
console.log(window.roomNumber);  // undefined
console.log(window.hotelName);   // undefined

console.log(guestName, roomNumber, hotelName); // all three work fine by name`;

const example = `var hotelName = "Grand Palace";

function checkIn(guestName) {
  if (guestName) {
    let roomNumber = 101;
    const confirmed = true;
    console.log(guestName + " checked into room " + roomNumber);
  }
  console.log(typeof roomNumber); // "undefined" — roomNumber never leaked out
}

checkIn("Aditi");`;

const questions: [React.ReactNode, React.ReactNode][] = [
  [
    <>Are <code>let</code> and <code>const</code> hoisted?</>,
    <>Yes — all three are. <code>let</code>/<code>const</code> are hoisted into a locked state (the TDZ) instead of getting <code>undefined</code> immediately.</>,
  ],
  [
    "What's the practical difference between “Cannot access before initialization” and “x is not defined”?",
    "The first means the binding exists but is still in the TDZ. The second means the name was never declared anywhere in scope at all.",
  ],
  [
    <>Does <code>const</code> make an object immutable?</>,
    "No — it only locks the binding (the variable name) from being reassigned. Properties inside the object can still be changed freely.",
  ],
  [
    <>Where do <code>var</code> declarations get stored at the global level, and how can you prove it?</>,
    <>In the Object Environment Record, tied to the real global object — provable by checking <code>window.varName</code>, which returns the value.</>,
  ],
  [
    <>Why doesn&apos;t <code>window.letName</code> work for a global <code>let</code>?</>,
    <>Because <code>let</code> is stored in the Declarative Environment Record, a separate store never attached to the global object.</>,
  ],
  [
    <>Why were <code>let</code>/<code>const</code> introduced, given <code>var</code> already existed?</>,
    <>To stop global variable collisions — since <code>var</code> attaches to the shared global object, two different scripts declaring the same name silently overwrite each other; <code>let</code>/<code>const</code> stay private instead.</>,
  ],
  [
    <>Does a <code>let</code> declared inside an <code>if</code> block exist outside of it?</>,
    <>No — <code>let</code>/<code>const</code> are block-scoped; they cease to exist the instant the enclosing <code>{"{ }"}</code> ends. <code>var</code> would still be accessible outside.</>,
  ],
  [
    "What actually makes the TDZ enforceable at the engine level?",
    <>Because <code>let</code>/<code>const</code> bindings live in a private record the engine directly controls, rather than as ordinary object properties, it can flag a binding as &ldquo;exists but locked&rdquo; and throw, instead of silently returning <code>undefined</code> the way a missing object property would.</>,
  ],
];

export default function JsLessonThreePage() {
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
          Lesson 3 · {lesson.readTime} read
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
          <code>var</code>, <code>let</code>, and <code>const</code> are all hoisted — memory is
          reserved for every one of them before your code runs (Lesson 1). That part is identical.
          What&apos;s completely different is{" "}
          <strong>
            what value they start with, whether you&apos;re allowed to touch them before their line
            runs, whether <code>{"{ }"}</code> blocks contain them, and even which physical part of
            memory they&apos;re stored in.
          </strong>{" "}
          This lesson covers all four differences, with real, checkable examples for each.
        </p>

        <h2 id="why">Why This Matters</h2>
        <ul>
          <li>
            Three declarations can produce three completely different results for the exact same
            mistake — printing a variable before its line runs — and interviewers use this to check
            if you understand hoisting properly, not just the keyword.
          </li>
          <li>
            Explains why old JS code is full of global-variable collisions, and exactly what{" "}
            <code>let</code>/<code>const</code> were built to stop.
          </li>
          <li>
            Sets up the classic <code>var</code>-inside-a-loop bug with <code>setTimeout</code>{" "}
            that you&apos;ll trace fully once we reach closures.
          </li>
          <li>
            The internal storage split you&apos;ll see here previews exactly how global{" "}
            <code>this</code> gets set up too — the subject of Lesson 5.
          </li>
        </ul>

        <h2 id="room">The Locked Meeting Room — An Analogy</h2>
        <Callout kind="note" label="The PA system vs. the private meeting room">
          <p>
            <strong><code>var</code></strong> is like an announcement made over the hotel&apos;s PA
            system. The moment it&apos;s declared, it&apos;s also pinned to the hotel&apos;s{" "}
            <strong>public noticeboard</strong> — where any other script, any other part of the
            hotel, can read it or overwrite it. Stand in the lobby before the announcement is made,
            and you just hear silence (<code>undefined</code>) — not an error. And it doesn&apos;t
            matter which room you&apos;re in; the announcement reaches the whole building, not just
            one meeting room.
          </p>
          <p>
            <strong><code>let</code>/<code>const</code></strong> are a locked meeting room.
            It&apos;s reserved on the day&apos;s schedule ahead of time (hoisted), but the door
            stays locked until the meeting&apos;s actual start time — try the handle early and
            you&apos;re turned away at the door, told the room isn&apos;t ready yet, not that
            it&apos;s empty. And this room&apos;s schedule is kept in a{" "}
            <strong>private day-planner</strong>, never pinned to the public noticeboard — no other
            script can read or collide with it. Once the meeting ends (the block closes),
            everything discussed inside stops existing outside those walls.
          </p>
          <p className="mb-0">
            <strong><code>const</code></strong> is that same locked room, except the guest assigned
            to it is locked in for the whole booking — you can rearrange the furniture inside all
            you like, but that guest can never be swapped out for a different room.
          </p>
        </Callout>

        <h2 id="var">var — Hoisted And Ready</h2>
        <Script title="var.js" code={varCode} />
        <p>
          No error. <code>guestName</code> already existed in memory from the memory creation phase
          — just empty. Peek at it early, and it simply looks blank.
        </p>

        <h2 id="letconst">let and const — Hoisted But Locked</h2>
        <Script title="let.js" code={letCode} />
        <p>
          <code>let</code> is hoisted too — that part is a common myth to unlearn. The real
          difference: <code>var</code> gets a placeholder value (<code>undefined</code>) the instant
          memory is reserved. <code>let</code>/<code>const</code> get <strong>locked</strong>{" "}
          instead, from the top of the scope until their declaration line actually runs. This
          locked stretch has a name: the <strong>Temporal Dead Zone (TDZ)</strong>.
        </p>
        <TdzStepper />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>What you do</th>
                <th>What happens</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>console.log(x)</code> before <code>var x = 5</code></td>
                <td><code>undefined</code> — no error</td>
              </tr>
              <tr>
                <td><code>console.log(x)</code> before <code>let x = 5</code> (in the TDZ)</td>
                <td><code>ReferenceError: Cannot access &apos;x&apos; before initialization</code></td>
              </tr>
              <tr>
                <td><code>console.log(y)</code>, <code>y</code> never declared anywhere</td>
                <td><code>ReferenceError: y is not defined</code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout kind="warn">
          <p className="mb-0">
            Notice these are three genuinely different situations with three different messages.
            &ldquo;Cannot access before initialization&rdquo; (TDZ, it exists but is locked) and
            &ldquo;is not defined&rdquo; (never existed at all) get mixed up constantly — knowing
            them apart is a very common interview check.
          </p>
        </Callout>

        <h2 id="construle">const&apos;s Extra Rule</h2>
        <Script title="const.js" code={constMissing} />
        <p>
          <code>const</code> must be given a value on the same line it&apos;s declared — no
          exceptions.
        </p>
        <Script title="const-object.js" code={constMutate} />
        <Callout kind="note">
          <p className="mb-0">
            <code>const</code> doesn&apos;t freeze the <em>value</em> — it freezes the{" "}
            <em>binding</em> (the variable name itself). You can&apos;t point <code>guest</code>{" "}
            at a different object, but you can still reach inside the same object and change
            what&apos;s in it.
          </p>
        </Callout>

        <h2 id="scope">Block Scope vs. Function Scope</h2>
        <Script title="block.js" code={blockCode} />
        <p>
          <code>var</code> ignores <code>{"{ }"}</code> entirely — it only respects function
          boundaries. <code>let</code>/<code>const</code> respect <code>{"{ }"}</code> strictly:
          the moment the block ends, they&apos;re gone.
        </p>
        <BlockScopeBox />

        <h2 id="hood">Under The Hood — Two Memory Records</h2>
        <p>
          Here&apos;s the part that isn&apos;t a metaphor. Inside the Global Execution
          Context&apos;s memory, JS actually keeps <strong>two separate records</strong>, not one
          flat bucket:
        </p>
        <ul>
          <li>
            <strong>Object Environment Record</strong> — physically tied to the real global object
            (<code>window</code> in a browser). <code>var</code> and function declarations are
            stored here, which means they become <strong>actual properties on that object.</strong>
          </li>
          <li>
            <strong>Declarative Environment Record</strong> — a separate, private record, not tied
            to any object at all. <code>let</code>, <code>const</code>, and <code>class</code>{" "}
            declarations live here instead.
          </li>
        </ul>
        <TwoRecords />
        <Callout kind="note">
          <p className="mb-0">
            <strong>Why this split exists:</strong> in early JS, every global <code>var</code>{" "}
            really did become a <code>window</code> property, so two libraries both declaring{" "}
            <code>var user</code> on the same page would silently overwrite each other.{" "}
            <code>let</code>/<code>const</code> (2015) were built specifically to stop this, by
            keeping their bindings off the global object entirely. This same private record is also
            exactly what makes the TDZ possible — since these bindings aren&apos;t ordinary object
            properties, the engine can mark one &ldquo;exists but locked&rdquo; and throw a real
            error, instead of just returning <code>undefined</code> like a missing property would.
          </p>
        </Callout>

        <h2 id="live">See It Live — window &amp; DevTools</h2>

        <h3>Check the two records directly</h3>
        <Script title="records.js" code={windowCode} />
        <Callout kind="warn">
          <p className="mb-0">
            Run this as a real <code>&lt;script&gt;</code> in a browser page, or paste it into the
            Chrome console — not inside a Node.js file. Node wraps every file in its own function
            behind the scenes, so even <code>var</code> at the top of a Node file never touches
            Node&apos;s <code>global</code> object either. This experiment only shows the true
            difference in a browser&apos;s actual global scope.
          </p>
        </Callout>

        <h3>Watch it in the Scope panel</h3>
        <ol className="steps">
          <li>
            <h3>Set a breakpoint</h3>
            <p>Anywhere after all three declarations have run.</p>
          </li>
          <li>
            <h3>Open the Scope panel</h3>
            <p>Sources tab → the Scope sidebar, while paused.</p>
          </li>
          <li>
            <h3>Look for two separate buckets</h3>
            <p>
              <strong>Global</strong> — this is <code>window</code>, and you&apos;ll see{" "}
              <code>guestName</code> sitting right there as a property. <strong>Script</strong> — a
              separate bucket holding <code>roomNumber</code> and <code>hotelName</code>. That
              &ldquo;Script&rdquo; bucket is the Declarative Environment Record, visible proof
              it&apos;s a different storage area from <code>window</code>.
            </p>
          </li>
        </ol>

        <h2 id="example">Real Example — Traced Line By Line</h2>
        <Script title="checkin.js" code={example} />
        <BlockScopeStepper />
        <ol className="steps">
          <li>
            <h3>Global EC pushed</h3>
            <p>
              <code>hotelName → undefined</code> reserved, then assigned{" "}
              <code>&quot;Grand Palace&quot;</code>. <code>checkIn</code> fully hoisted.{" "}
              <code>checkIn(&quot;Aditi&quot;)</code> called.
            </p>
          </li>
          <li>
            <h3><code>checkIn</code> EC pushed</h3>
            <p>
              Its own memory: <code>guestName → &quot;Aditi&quot;</code>. The <code>if</code>{" "}
              block is entered.
            </p>
          </li>
          <li>
            <h3>Inside the <code>if</code> block</h3>
            <p>
              <code>roomNumber</code> and <code>confirmed</code> exist only for these{" "}
              <code>{"{ }"}</code> — hoisted into the TDZ at the top of the block, then unlocked the
              instant their lines run. Prints <code>Aditi checked into room 101</code>.
            </p>
          </li>
          <li>
            <h3>Back outside the block</h3>
            <p>
              <code>roomNumber</code> no longer exists here at all —{" "}
              <code>typeof roomNumber</code> safely prints <code>&quot;undefined&quot;</code>{" "}
              instead of throwing, since <code>typeof</code> on a truly undeclared name
              doesn&apos;t error the way reading it directly would.
            </p>
          </li>
          <li>
            <h3><code>checkIn</code> finishes → popped</h3>
            <p>Its whole private memory, block-scoped variables included, is discarded completely.</p>
          </li>
        </ol>

        <h2 id="pitfalls">Common Misconceptions</h2>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;<code>let</code> isn&apos;t hoisted, only <code>var</code> is.&rdquo;</strong>{" "}
            Both are hoisted. The difference is what happens after: <code>var</code> gets{" "}
            <code>undefined</code> immediately, <code>let</code> gets locked in the TDZ until its
            line runs.
          </p>
        </Callout>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;<code>const</code> means the value can never change.&rdquo;</strong> Only
            the binding is locked — you can&apos;t reassign the variable itself. If it holds an
            object or array, its contents can still be freely mutated.
          </p>
        </Callout>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;The TDZ is just a lint rule, not something the engine actually enforces.&rdquo;</strong>{" "}
            It&apos;s a real runtime check, tied directly to the Declarative Environment Record —
            accessing a locked binding throws a genuine <code>ReferenceError</code>, not a warning.
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

      <LessonPager slug="lesson-3" lessons={JS_LESSONS} href={jsLessonHref} series={JS_SERIES} />
    </article>
  );
}
