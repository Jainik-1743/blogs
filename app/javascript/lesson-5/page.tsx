import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import EmptyFileStepper from "@/components/figures/EmptyFileStepper";
import GlobalNames from "@/components/figures/GlobalNames";
import SharedWindowStepper from "@/components/figures/SharedWindowStepper";
import ThreeRoutesStepper from "@/components/figures/ThreeRoutesStepper";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { JS_LESSONS, JS_SERIES, jsLessonHref } from "@/lib/javascript";

const lesson = JS_LESSONS.find((l) => l.slug === "lesson-5")!;

export const metadata: Metadata = {
  title: `Lesson 5 — ${lesson.title}`,
  description: lesson.summary,
};

/** In-page index. Each entry links to a section heading below. */
const outline = [
  { id: "concept", label: "Concept" },
  { id: "why", label: "Why this matters" },
  { id: "hotel", label: "The hotel before any guest arrives — an analogy" },
  { id: "shortest", label: "The shortest JS program" },
  { id: "names", label: "One object, many names" },
  { id: "thiswindow", label: "this === window at the top level" },
  { id: "shared", label: "The shared register — multiple script tags" },
  { id: "strict", label: "Strict mode changes the rule — but only sometimes" },
  { id: "live", label: "See it live — console & DevTools" },
  { id: "pitfalls", label: "Common misconceptions" },
  { id: "interview", label: "Interview questions" },
];

const empty = `// this file is completely empty
// and yet: a Global Execution Context, a global object, and \`this\` already exist`;

const routes = `var x = 10;

console.log(x);        // 10
console.log(this.x);   // 10
console.log(window.x); // 10`;

const shared = `<script>
  var hotelName = "Grand Palace";
</script>

<script>
  console.log(hotelName); // "Grand Palace" — fully visible here too
  hotelName = "Overwritten!";
</script>`;

const strict = `'use strict';
console.log(this); // still window — top-level this is unaffected by strict mode

function greet() {
  console.log(this);
}
greet(); // undefined in strict mode (would be window without 'use strict')`;

const questions: [React.ReactNode, React.ReactNode][] = [
  [
    "What gets created even in a completely empty JS file?",
    <>A Global Execution Context, its Variable Environment, a global object, and a <code>this</code> binding pointing at that global object.</>,
  ],
  [
    "What is the global object called in a browser vs. in Node.js?",
    <><code>window</code> in a browser, <code>global</code> in Node.js — and <code>globalThis</code> works as a universal name in any environment.</>,
  ],
  [
    <>At the top level, what does <code>this</code> equal?</>,
    <>The global object — in a browser, <code>this === window</code>.</>,
  ],
  [
    <>If two separate <code>&lt;script&gt;</code> tags both declare <code>var count</code>, do they conflict?</>,
    <>Yes — both tags share the same <code>window</code> object, so the second declaration silently overwrites the first.</>,
  ],
  [
    <>Does <code>&apos;use strict&apos;</code> change <code>this</code> at the very top of a script?</>,
    <>No — top-level <code>this</code> is still the global object under strict mode. Strict mode only changes <code>this</code> inside a plain function call, making it <code>undefined</code> instead of the global object.</>,
  ],
  [
    <>Why was <code>globalThis</code> introduced if <code>window</code> already existed?</>,
    <>Because <code>window</code> only exists in browsers — code meant to run in Node.js or Web Workers needed one name that resolves correctly everywhere, which <code>globalThis</code> provides.</>,
  ],
];

export default function JsLessonFivePage() {
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
          Lesson 5 · {lesson.readTime} read
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
          Before you write a single line of code, JavaScript has already done real work: it created
          a Global Execution Context (Lesson 1), and inside it, two things you haven&apos;t asked
          for — a <strong>global object</strong>, and a keyword called <strong><code>this</code></strong>{" "}
          that points straight at it. This lesson is entirely about those two things: what
          they&apos;re called, how they relate, and the one rule that quietly flips depending on
          strict mode.
        </p>

        <h2 id="why">Why This Matters</h2>
        <ul>
          <li>
            It explains why <code>var</code> at the top level and a property on <code>window</code>{" "}
            are, underneath, the exact same thing — not a coincidence, a direct consequence of
            Lesson 3&apos;s Object Environment Record.
          </li>
          <li>
            It explains a very real source of production bugs: two separate{" "}
            <code>&lt;script&gt;</code> tags on the same page silently sharing — and overwriting —
            the same global variables.
          </li>
          <li>
            It&apos;s the correct starting anchor for the full <code>this</code> rule set (method
            calls, arrow functions, <code>call</code>/<code>apply</code>/<code>bind</code>) that gets
            its own dedicated lesson later — you need the global case solid before the rest makes
            sense.
          </li>
        </ul>

        <h2 id="hotel">The Hotel Before Any Guest Arrives — An Analogy</h2>
        <Callout kind="note" label="The building exists before anyone checks in">
          <p>
            Picture a brand-new hotel on its very first day, before a single guest has arrived. The
            building already exists — a reception counter, an address, a lobby. Nobody built that
            because of a guest request; it&apos;s just there, guaranteed, the moment the hotel opens.
          </p>
          <p className="mb-0">
            Now imagine someone walks into the empty lobby and asks &ldquo;who&apos;s in charge
            here?&rdquo; With no specific guest being addressed, the answer defaults to whoever&apos;s
            standing at the front desk — the receptionist herself. That default answer is exactly
            what <code>this</code> is, at the global level: when nothing else has been specified,
            it defaults to the building&apos;s own front desk, the global object.
          </p>
        </Callout>

        <h2 id="shortest">The Shortest JS Program</h2>
        <p>
          Take a completely empty <code>.js</code> file. Zero lines of code. JS still does real
          work behind the scenes: it builds a Global Execution Context, reserves its Variable
          Environment, creates a global object, and sets <code>this</code> to point at it.
        </p>
        <Script title="empty.js" code={empty} />
        <EmptyFileStepper />
        <Callout kind="note">
          <p className="mb-0">
            None of this depends on you writing code. It&apos;s guaranteed infrastructure the engine
            sets up the instant a program starts running — proof that the global object and{" "}
            <code>this</code> aren&apos;t things your code creates, they&apos;re things you&apos;re
            handed.
          </p>
        </Callout>

        <h2 id="names">One Object, Many Names</h2>
        <p>
          The global object is the same idea everywhere, but different JavaScript environments call
          it by different names:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Environment</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Browser</td><td><code>window</code></td></tr>
              <tr><td>Node.js</td><td><code>global</code></td></tr>
              <tr><td>Web Worker</td><td><code>self</code></td></tr>
              <tr><td>Universal (any environment)</td><td><code>globalThis</code></td></tr>
            </tbody>
          </table>
        </div>
        <p>
          The naming inconsistency was annoying enough that JS added{" "}
          <strong><code>globalThis</code></strong> — one name guaranteed to work in any environment,
          browser or Node or otherwise.
        </p>
        <GlobalNames />

        <h2 id="thiswindow">this === window At The Top Level</h2>
        <Script title="routes.js" code={routes} />
        <p>
          All three print the same value. <code>var</code> at the global level attaches{" "}
          <code>x</code> directly onto <code>window</code> (Lesson 3&apos;s Object Environment
          Record), and <code>this</code> at the global level is simply a pointer to that same{" "}
          <code>window</code> object. Three different routes to the exact same box.
        </p>
        <ThreeRoutesStepper />

        <h2 id="shared">The Shared Register — Multiple Script Tags</h2>
        <p>
          Here&apos;s the part that&apos;s easy to miss: if a page loads{" "}
          <strong>two separate <code>&lt;script&gt;</code> tags</strong>, they don&apos;t get their
          own private globals — they share the exact same <code>window</code>.
        </p>
        <Script title="index.html" code={shared} />
        <SharedWindowStepper />
        <Callout kind="warn">
          <p className="mb-0">
            A <code>var</code> declared in the first tag is completely visible — and overwritable —
            from the second. This is the exact same &ldquo;public noticeboard&rdquo; collision risk
            from Lesson 3, just proven at the level of whole <code>&lt;script&gt;</code> tags
            instead of individual functions.
          </p>
        </Callout>

        <h2 id="strict">Strict Mode Changes The Rule — But Only Sometimes</h2>
        <Script title="strict.js" code={strict} />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Where</th>
                <th>Non-strict mode</th>
                <th>Strict mode</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Top level of a script</td>
                <td><code>this</code> = <code>window</code></td>
                <td><code>this</code> = <code>window</code> (unchanged)</td>
              </tr>
              <tr>
                <td>Inside a plain function call, no owner object</td>
                <td><code>this</code> = <code>window</code></td>
                <td><code>this</code> = <code>undefined</code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <code>&apos;use strict&apos;</code> does not touch <code>this</code> at the very top of a
          script — it&apos;s <code>window</code> either way. What it changes is <code>this</code>{" "}
          inside a plain function call with no owner — normally that also defaults to{" "}
          <code>window</code>, but strict mode deliberately makes it <code>undefined</code> instead,
          specifically to stop functions from accidentally writing onto the global object.
        </p>

        <h2 id="live">See It Live — Console &amp; DevTools</h2>
        <ol className="steps">
          <li>
            <h3>Open the browser console</h3>
            <p>Any page → DevTools (F12) → Console tab.</p>
          </li>
          <li>
            <h3>Confirm the identity directly</h3>
            <Script title="console" code={`console.log(this === window); // true`} />
          </li>
          <li>
            <h3>Attach a global variable and check all three routes</h3>
            <Script title="console" code={`var hotelName = "Grand Palace";\nconsole.log(hotelName, this.hotelName, window.hotelName); // all three match`} />
          </li>
          <li>
            <h3>Check the universal name</h3>
            <Script title="console" code={`console.log(globalThis === window); // true, in a browser`} />
          </li>
          <li>
            <h3>Try the strict-mode function case</h3>
            <p>
              Paste the <code>&apos;use strict&apos;</code> example from above and confirm{" "}
              <code>greet()</code> logs <code>undefined</code> instead of <code>window</code>.
            </p>
          </li>
        </ol>

        <h2 id="pitfalls">Common Misconceptions</h2>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;<code>this</code> always refers to the current function.&rdquo;</strong>{" "}
            At the global level, <code>this</code> refers to the global object — it has nothing to
            do with any function yet. The full call-site-dependent rules for <code>this</code>{" "}
            inside functions and methods are covered in their own lesson.
          </p>
        </Callout>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;Strict mode makes <code>this</code> undefined everywhere, including at the top of the script.&rdquo;</strong>{" "}
            Not true — top-level <code>this</code> stays as the global object in strict mode too.
            Only a plain function call&apos;s <code>this</code> switches to <code>undefined</code>.
          </p>
        </Callout>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;Each <code>&lt;script&gt;</code> tag gets its own separate global scope.&rdquo;</strong>{" "}
            They don&apos;t — every <code>&lt;script&gt;</code> tag on the same page shares one
            single <code>window</code> object, which is exactly how global variables leak and
            collide across them.
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

      <LessonPager slug="lesson-5" lessons={JS_LESSONS} href={jsLessonHref} series={JS_SERIES} />
    </article>
  );
}
