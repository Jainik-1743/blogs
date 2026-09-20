import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import FalsyChips from "@/components/figures/FalsyChips";
import LooseTypingStepper from "@/components/figures/LooseTypingStepper";
import RoomBoard from "@/components/figures/RoomBoard";
import UndefinedTraceStepper from "@/components/figures/UndefinedTraceStepper";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { JS_LESSONS, JS_SERIES, jsLessonHref } from "@/lib/javascript";

const lesson = JS_LESSONS.find((l) => l.slug === "lesson-6")!;

export const metadata: Metadata = {
  title: `Lesson 6 — ${lesson.title}`,
  description: lesson.summary,
};

/** In-page index. Each entry links to a section heading below. */
const outline = [
  { id: "concept", label: "Concept" },
  { id: "why", label: "Why this matters" },
  { id: "board", label: "The room board — an analogy" },
  { id: "undefined", label: "undefined — reserved but empty" },
  { id: "notdefined", label: "Not defined — never existed at all" },
  { id: "typeof", label: "The safe check: typeof on an undeclared variable" },
  { id: "nullundefined", label: "null vs. undefined — two different kinds of \"nothing\"" },
  { id: "falsy", label: "Where undefined sits among the falsy values" },
  { id: "loose", label: "Why JS is called loosely typed" },
  { id: "antipattern", label: "The anti-pattern: don't assign undefined yourself" },
  { id: "example", label: "Real example — traced line by line" },
  { id: "live", label: "See it live — console & DevTools" },
  { id: "pitfalls", label: "Common misconceptions" },
  { id: "interview", label: "Interview questions" },
];

const undefinedCode = `console.log(guestName); // undefined
var guestName;`;

const notDefined = `console.log(mysteryGuest); // ReferenceError: mysteryGuest is not defined`;

const typeofCode = `console.log(mysteryGuest);        // ReferenceError — crashes
console.log(typeof mysteryGuest); // "undefined" — perfectly safe, no crash`;

const falsyIf = `if (undefined) {
  // never runs
}`;

const loose = `let value = 101;       // number
value = "Room 101";    // now a string
value = true;          // now a boolean
value = undefined;     // now... undefined`;

const anti = `// avoid this
var guestName = undefined;

// prefer this instead
var guestName; // naturally undefined, nothing extra needed
// or, if you deliberately want to represent "no value" on purpose:
var guestName = null;`;

const example = `console.log(hotelName);      // undefined — reserved, not yet assigned
console.log(typeof unknownX); // "undefined" — never declared, but typeof is safe
console.log(unknownX);       // ReferenceError: unknownX is not defined

var hotelName = "Grand Palace";
console.log(hotelName);      // "Grand Palace"`;

const questions: [React.ReactNode, React.ReactNode][] = [
  [
    "What is the real difference between undefined and “not defined”?",
    <><code>undefined</code> means memory was reserved for the variable but no value assigned yet. &ldquo;Not defined&rdquo; means the name was never declared anywhere, so no memory exists for it at all — referencing it throws a ReferenceError.</>,
  ],
  [
    "Why doesn't typeof throw an error on an undeclared variable?",
    <><code>typeof</code> is specifically designed to be a safe existence check — it returns the string <code>&quot;undefined&quot;</code> for both an empty declared variable and a never-declared one, instead of crashing.</>,
  ],
  [
    "What's the practical difference between null and undefined?",
    <><code>undefined</code> is set automatically by the engine to mean &ldquo;not yet assigned.&rdquo; <code>null</code> is set deliberately by the programmer to mean &ldquo;intentionally empty.&rdquo;</>,
  ],
  [
    "Is undefined truthy or falsy?",
    <>Falsy — along with <code>null</code>, <code>0</code>, <code>&quot;&quot;</code>, <code>false</code>, and <code>NaN</code>.</>,
  ],
  [
    "Why is JavaScript called a loosely typed language?",
    "Because a variable's type isn't fixed at declaration — the same variable can hold a number, then a string, then a boolean, with no restriction, since the type is just whatever the current value happens to be.",
  ],
  [
    "Is it good practice to manually assign undefined to a variable?",
    <>No — it blurs the engine&apos;s own signal for &ldquo;not yet assigned.&rdquo; If you want to represent &ldquo;intentionally empty&rdquo; in your own code, assign <code>null</code> instead.</>,
  ],
];

export default function JsLessonSixPage() {
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
          Lesson 6 · {lesson.readTime} read
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
          <code>undefined</code> and &ldquo;not defined&rdquo; both sound like &ldquo;there&apos;s
          nothing here,&rdquo; but they describe two genuinely different situations in memory:
        </p>
        <ul>
          <li>
            <strong><code>undefined</code></strong> — a real value, meaning memory <em>was</em>{" "}
            reserved for this name, but no value has been assigned to it yet.
          </li>
          <li>
            <strong>&ldquo;not defined&rdquo;</strong> — not a value at all, but an error. It means
            this name was never reserved in memory anywhere in scope, because it was never declared.
          </li>
        </ul>
        <Callout kind="note">
          <p className="mb-0">
            One is JavaScript telling you &ldquo;this exists, it&apos;s just empty right now.&rdquo;
            The other is JavaScript telling you &ldquo;this doesn&apos;t exist, and never
            has.&rdquo; Confusing the two is one of the most common small misunderstandings in the
            language — and a favourite thing for interviewers to probe.
          </p>
        </Callout>

        <h2 id="why">Why This Matters</h2>
        <ul>
          <li>
            It&apos;s the direct payoff of Lesson 1&apos;s memory creation phase — this lesson is
            where that phase&apos;s behaviour finally gets its two proper names and its two proper
            outcomes.
          </li>
          <li>
            Knowing the difference tells you instantly whether a bug is a typo (undeclared variable)
            or a timing issue (declared but not yet assigned).
          </li>
          <li>
            It sets up a genuinely useful defensive pattern — checking for a variable&apos;s
            existence safely with <code>typeof</code>, without ever risking a crash.
          </li>
          <li>
            It explains why JavaScript is called a loosely (or &ldquo;weakly&rdquo;) typed
            language, and what that actually means in practice, not just as a buzzword.
          </li>
        </ul>

        <h2 id="board">The Room Board — An Analogy</h2>
        <Callout kind="note" label="A reserved-but-empty room vs. a room number that doesn't exist">
          <p>
            Picture the hotel&apos;s room status board. Room 101 has a slot on that board —
            it&apos;s a real, reserved room — but right now its status card just says &ldquo;Vacant,
            not yet assigned a guest.&rdquo; That&apos;s <code>undefined</code>: a real, reserved
            slot, currently empty.
          </p>
          <p className="mb-0">
            Now imagine someone asks the receptionist about &ldquo;Room 999.&rdquo; There is no
            slot for Room 999 on the board at all — the hotel was never built with that room. Asking
            about it doesn&apos;t return &ldquo;vacant,&rdquo; it gets you told outright:
            &ldquo;there is no such room here.&rdquo; That&apos;s &ldquo;not defined&rdquo; — not
            an empty slot, but the total absence of one.
          </p>
        </Callout>

        <h2 id="undefined">undefined — Reserved But Empty</h2>
        <Script title="undefined.js" code={undefinedCode} />
        <p>
          During the memory creation phase (Lesson 1), JS reserved a slot for{" "}
          <code>guestName</code> and filled it with the placeholder value <code>undefined</code> —
          a real, legitimate value in JavaScript, not an error and not &ldquo;nothing.&rdquo; The
          variable genuinely exists; it just hasn&apos;t been given a real value yet.
        </p>

        <h2 id="notdefined">Not Defined — Never Existed At All</h2>
        <Script title="not-defined.js" code={notDefined} />
        <p>
          <code>mysteryGuest</code> was never declared anywhere in any reachable scope. No memory
          was ever reserved for it, so referencing it directly throws a{" "}
          <strong>ReferenceError</strong> — a hard stop, not a value you can read.
        </p>
        <RoomBoard />

        <h2 id="typeof">The Safe Check: typeof On An Undeclared Variable</h2>
        <Script title="typeof.js" code={typeofCode} />
        <Callout kind="ok">
          <p className="mb-0">
            <code>typeof</code> is a genuine exception to the ReferenceError rule: checking the type
            of a variable that was never declared at all still safely returns the string{" "}
            <code>&quot;undefined&quot;</code>, instead of throwing. This makes <code>typeof</code>{" "}
            a reliable way to check &ldquo;does this even exist?&rdquo; without risking a crash —
            commonly used to detect whether an optional global (like a library loaded from a CDN)
            is actually present.
          </p>
        </Callout>

        <h2 id="nullundefined">null vs. undefined — Two Different Kinds Of &ldquo;Nothing&rdquo;</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                <th><code>undefined</code></th>
                <th><code>null</code></th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>Who sets it</strong></td><td>The engine, automatically</td><td>You, deliberately, in your own code</td></tr>
              <tr><td><strong>Meaning</strong></td><td>&ldquo;Not yet assigned&rdquo;</td><td>&ldquo;Intentionally empty&rdquo;</td></tr>
              <tr><td><strong>Typical use</strong></td><td>The default state before assignment</td><td>Explicitly clearing or resetting a value on purpose</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Both represent &ldquo;nothing,&rdquo; but from opposite directions: <code>undefined</code>{" "}
          is what JS gives you by default when it hasn&apos;t been told anything yet.{" "}
          <code>null</code> is what you hand back to JS yourself, on purpose, to say &ldquo;I know
          there&apos;s nothing here.&rdquo;
        </p>

        <h2 id="falsy">Where undefined Sits Among The Falsy Values</h2>
        <p>
          <code>undefined</code> is one of JavaScript&apos;s small set of <strong>falsy</strong>{" "}
          values — values that behave like <code>false</code> inside a condition:
        </p>
        <Script title="falsy.js" code={falsyIf} />
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Falsy values in JavaScript</th></tr>
            </thead>
            <tbody>
              <tr><td><code>undefined</code>, <code>null</code>, <code>0</code>, <code>&quot;&quot;</code> (empty string), <code>false</code>, <code>NaN</code></td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Everything else — including <code>&quot;0&quot;</code> the string, an empty array{" "}
          <code>[]</code>, and an empty object <code>{"{}"}</code> — is truthy.
        </p>
        <FalsyChips />

        <h2 id="loose">Why JS Is Called Loosely Typed</h2>
        <Script title="loose.js" code={loose} />
        <p>
          The same variable can hold a number, then a string, then a boolean, with no restriction
          and no error. JavaScript is called <strong>loosely typed</strong> (or &ldquo;weakly
          typed&rdquo;) precisely because of this — a variable&apos;s type isn&apos;t fixed at
          declaration, it&apos;s just whatever the current value happens to be.{" "}
          <code>undefined</code> is a natural part of this: it&apos;s simply another type a variable
          can carry, same as any other.
        </p>
        <LooseTypingStepper />

        <h2 id="antipattern">The Anti-Pattern: Don&apos;t Assign undefined Yourself</h2>
        <Script title="anti-pattern.js" code={anti} />
        <Callout kind="warn">
          <p className="mb-0">
            <code>undefined</code> is meant to be the engine&apos;s own signal — &ldquo;nobody has
            assigned this yet.&rdquo; Writing <code>= undefined</code> yourself blurs that signal:
            now you can&apos;t tell whether it&apos;s empty because nobody got to it yet, or
            because someone deliberately reset it. If you want to represent &ldquo;intentionally
            empty&rdquo; in your own code, reach for <code>null</code> instead — that&apos;s
            exactly what it&apos;s for.
          </p>
        </Callout>

        <h2 id="example">Real Example — Traced Line By Line</h2>
        <Script title="undefined.js" code={example} />
        <UndefinedTraceStepper />
        <ol className="steps">
          <li>
            <h3>Memory phase</h3>
            <p>
              <code>hotelName → undefined</code> reserved. <code>unknownX</code> is never declared
              anywhere, so nothing is reserved for it at all.
            </p>
          </li>
          <li>
            <h3><code>console.log(hotelName)</code></h3>
            <p>Prints <code>undefined</code> — the reserved slot exists, just empty so far.</p>
          </li>
          <li>
            <h3><code>console.log(typeof unknownX)</code></h3>
            <p>
              Prints <code>&quot;undefined&quot;</code> — safe, because <code>typeof</code> never
              throws, even on a name that was never declared.
            </p>
          </li>
          <li>
            <h3><code>console.log(unknownX)</code></h3>
            <p>
              Throws <code>ReferenceError: unknownX is not defined</code> — direct access has no
              such safety net.
            </p>
          </li>
          <li>
            <h3><code>hotelName</code> is assigned</h3>
            <p>Now printing it gives the real value, <code>&quot;Grand Palace&quot;</code>.</p>
          </li>
        </ol>

        <h2 id="live">See It Live — Console &amp; DevTools</h2>
        <ol className="steps">
          <li>
            <h3>Open the console</h3>
            <p>Any page → DevTools (F12) → Console tab.</p>
          </li>
          <li>
            <h3>Declare without assigning</h3>
            <Script title="console" code={`var guestName;\nconsole.log(guestName); // undefined`} />
          </li>
          <li>
            <h3>Reference something never declared</h3>
            <Script title="console" code={`console.log(neverDeclared); // ReferenceError, in red`} />
          </li>
          <li>
            <h3>Compare with typeof</h3>
            <Script title="console" code={`console.log(typeof neverDeclared); // "undefined" — no error this time`} />
          </li>
          <li>
            <h3>Set a breakpoint before any declarations run</h3>
            <p>
              Open the Scope panel — you&apos;ll see <code>guestName</code> already listed under
              Global with the value <code>undefined</code>, even before its line has executed,
              direct proof of the memory creation phase from Lesson 1.
            </p>
          </li>
        </ol>

        <h2 id="pitfalls">Common Misconceptions</h2>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;undefined and not defined are just two ways of saying the same thing.&rdquo;</strong>{" "}
            They&apos;re not — <code>undefined</code> is a real value for a variable that exists
            but is empty; &ldquo;not defined&rdquo; is a ReferenceError for a name that was never
            declared at all.
          </p>
        </Callout>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;undefined and null are interchangeable.&rdquo;</strong> Both represent
            &ldquo;nothing,&rdquo; but <code>undefined</code> is the engine&apos;s default for
            not-yet-assigned, while <code>null</code> is a value you assign deliberately to mean
            &ldquo;intentionally empty.&rdquo;
          </p>
        </Callout>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;Checking a variable directly is just as safe as using typeof.&rdquo;</strong>{" "}
            Only if you&apos;re certain it was declared somewhere. For anything that might not
            exist at all — an optional global, a variable from another script —{" "}
            <code>typeof</code> is the crash-proof way to check.
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

      <LessonPager slug="lesson-6" lessons={JS_LESSONS} href={jsLessonHref} series={JS_SERIES} />
    </article>
  );
}
