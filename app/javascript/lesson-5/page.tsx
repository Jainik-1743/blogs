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
    <>A Global Execution Context (the first container the engine creates to run code), its Variable Environment (its memory), a global object (the one object that holds global names), and a <code>this</code> keyword pointing at that global object.</>,
  ],
  [
    "What is the global object called in a browser vs. in Node.js?",
    <><code>window</code> in a browser, <code>global</code> in Node.js, and <code>self</code> in a Web Worker. <code>globalThis</code> works as a universal name in any environment.</>,
  ],
  [
    <>At the top level, what does <code>this</code> equal?</>,
    <>The global object. In a browser classic script, <code>this === window</code>. (In an ES module it is <code>undefined</code>.)</>,
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
    <>Because <code>window</code> only exists in the main browser thread. Code meant to run in Node.js or Web Workers needed one name that works everywhere, and <code>globalThis</code> is that name.</>,
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
          a Global Execution Context (Lesson 1), and inside it, two things you didn&apos;t ask
          for — a <strong>global object</strong>, and a keyword called <strong><code>this</code></strong>{" "}
          that points straight at it. This lesson is entirely about those two things: what
          they&apos;re called, how they relate, and the one rule that changes in strict mode.
        </p>
        <h3>Key terms, explained simply</h3>
        <ul>
          <li>
            <strong>Global object</strong> is the one object the engine creates for the whole program.
            Every global <code>var</code> and every top-level function becomes a property of it, and
            built-in tools such as <code>console</code> and <code>setTimeout</code> are found on it.
            An <strong>object</strong> is a collection of named values, and each name and value pair
            is a <strong>property</strong>.
          </li>
          <li>
            <strong><code>this</code></strong> is a keyword (a reserved word with a special meaning)
            that gives your code access to an object. Which object depends on how and where the code
            runs. At the top level it is the global object.
          </li>
          <li>
            <strong>Strict mode</strong> is an optional setting that makes JavaScript stricter. You
            turn it on by writing <code>&apos;use strict&apos;;</code> at the top of a script or
            function. It turns some silent mistakes into errors and changes a few rules, such as the
            value of <code>this</code> in a plain function call.
          </li>
          <li>
            <strong>Environment</strong> (or runtime) is the place where JavaScript runs and the
            tools that place gives it. The main ones are a <strong>browser</strong>,{" "}
            <strong>Node.js</strong> (a program that runs JavaScript outside a browser, for example on
            a server) and a <strong>Web Worker</strong> (a script that runs in the background of a web
            page, on its own thread, separate from the page).
          </li>
          <li>
            <strong>Plain function call</strong> means calling a function by its name alone, like{" "}
            <code>greet()</code>, not as a method (<code>obj.greet()</code>) and not with{" "}
            <code>call</code>, <code>apply</code> or <code>bind</code>. Lesson 5 only needs this case.
          </li>
        </ul>

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
            Picture a brand-new hotel on its first day, before any guest has arrived. The
            building already exists — a reception counter, an address, a lobby. Nobody built that
            because of a guest request. It is just there, the moment the hotel opens.
          </p>
          <p className="mb-0">
            Now imagine someone walks into the empty lobby and asks &ldquo;who&apos;s in charge
            here?&rdquo; No specific guest is being addressed, so the answer is the person at the
            front desk. That default answer is what <code>this</code> is at the global level: when
            nothing else is specified, it points to the building&apos;s own front desk, the global
            object.
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
            None of this depends on you writing code. The engine always sets it up when a program
            starts. So the global object and <code>this</code> are not things your code creates.
            They are given to you.
          </p>
        </Callout>

        <h2 id="names">One Object, Many Names</h2>
        <p>
          The global object is the same idea everywhere, but different JavaScript environments give
          it different names:
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
              <tr><td>Web Worker (and service worker)</td><td><code>self</code></td></tr>
              <tr><td>Universal (any environment)</td><td><code>globalThis</code></td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Because the names differed, JavaScript added{" "}
          <strong><code>globalThis</code></strong> in 2020 (ES2020). It is one name that works in
          any environment, whether browser, Node or other.
        </p>
        <GlobalNames />

        <h2 id="thiswindow">this === window At The Top Level</h2>
        <Script title="routes.js" code={routes} />
        <p>
          All three print the same value. A <code>var</code> at the global level becomes a property{" "}
          <code>x</code> of <code>window</code> (Lesson 3&apos;s Object Environment
          Record), and <code>this</code> at the global level points to that same{" "}
          <code>window</code> object. These are three routes to the same box. This is true in a
          browser script. See the note below for Node.js and modules.
        </p>
        <ThreeRoutesStepper />
        <Callout kind="warn" label="Not every top level works this way">
          <p className="mb-0">
            In a browser <code>&lt;script type=&quot;module&quot;&gt;</code> (an ES module), the top-level{" "}
            <code>this</code> is <code>undefined</code>, and a top-level <code>var</code> does not become a
            property of <code>window</code>. In a Node.js file, a top-level <code>var</code> stays private to
            that file, and the top-level <code>this</code> is <code>module.exports</code> (an empty object at
            first), not <code>global</code>. This lesson&apos;s examples are for a classic browser script.
          </p>
        </Callout>

        <h2 id="shared">The Shared Register — Multiple Script Tags</h2>
        <p>
          This part is easy to miss. A <code>&lt;script&gt;</code> tag is the HTML tag that loads
          JavaScript into a page. If a page loads{" "}
          <strong>two separate <code>&lt;script&gt;</code> tags</strong>, they don&apos;t get their
          own private globals. They share the same <code>window</code>.
        </p>
        <Script title="index.html" code={shared} />
        <SharedWindowStepper />
        <Callout kind="warn">
          <p className="mb-0">
            A <code>var</code> declared in the first tag can be read, and overwritten, from the second.
            This is the same &ldquo;public noticeboard&rdquo; collision risk from Lesson 3, shown
            across whole <code>&lt;script&gt;</code> tags.
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
                <td>Top level of a classic script</td>
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
          <code>&apos;use strict&apos;</code> does not change <code>this</code> at the very top of a
          script. It is <code>window</code> either way. What it changes is <code>this</code>{" "}
          inside a plain function call (a call with no owner object). Normally that also defaults to{" "}
          <code>window</code>, but strict mode makes it <code>undefined</code> instead. This stops
          functions from accidentally writing onto the global object.
        </p>

        <h2 id="live">See It Live — Console &amp; DevTools</h2>
        <ol className="steps">
          <li>
            <h3>Open the browser console</h3>
            <p>Any page → DevTools (the debugging tools built into the browser, opened with F12) → Console tab.</p>
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
            At the global level, <code>this</code> refers to the global object. No function is
            involved yet. The full rules for <code>this</code> inside functions and methods depend
            on how the function is called, and they are covered in their own lesson.
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
            They don&apos;t. Every classic <code>&lt;script&gt;</code> tag on the same page shares one
            <code>window</code> object, which is how global variables leak and
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
