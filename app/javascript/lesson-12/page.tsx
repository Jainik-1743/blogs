import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import CallbackHandoff from "@/components/figures/CallbackHandoff";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { JS_LESSONS, JS_SERIES, jsLessonHref } from "@/lib/javascript";

const lesson = JS_LESSONS.find((l) => l.slug === "lesson-12")!;

export const metadata: Metadata = {
  title: `Lesson 12 — ${lesson.title}`,
  description: lesson.summary,
};

/** In-page index. Each entry links to a section heading below. */
const outline = [
  { id: "concept", label: "Concept" },
  { id: "why", label: "Why this matters" },
  { id: "analogy", label: "The instruction card — an analogy" },
  { id: "proof", label: "Proof: functions are values" },
  { id: "hof", label: "Higher-order functions" },
  { id: "callbacks", label: "Callbacks — sync vs. async" },
  { id: "listeners", label: "Event listeners are just callbacks" },
  { id: "removing", label: "Removing listeners correctly" },
  { id: "this", label: "this inside a listener — a Lesson 5 callback" },
  { id: "live", label: "See it live — DevTools" },
  { id: "pitfalls", label: "Common misconceptions" },
  { id: "interview", label: "Interview questions" },
];

const proof = `function greetGuest() {
  console.log("Welcome to the front desk!");
}

console.log(typeof greetGuest); // "function" — it's a value, with a type, like anything else

const alsoGreet = greetGuest; // assigned to another variable — no () means "don't call it, just copy the reference"
alsoGreet(); // Welcome to the front desk!

const staffActions = [greetGuest, () => console.log("Checking in guest...")];
staffActions[1](); // Checking in guest...`;

const hof = `function repeatTask(times, callback) {
  for (let i = 1; i <= times; i++) {
    callback(i);
  }
}

repeatTask(3, (round) => {
  console.log(\`Cleaning pass \${round} complete\`);
});
// Cleaning pass 1 complete
// Cleaning pass 2 complete
// Cleaning pass 3 complete`;

const listeners = `const checkoutButton = document.querySelector("#checkout-button");

function handleCheckout() {
  console.log("Guest checked out");
}

checkoutButton.addEventListener("click", handleCheckout);`;

const removing = `// Works — same function reference passed to both calls
checkoutButton.addEventListener("click", handleCheckout);
checkoutButton.removeEventListener("click", handleCheckout);

// Does NOT work — two different anonymous functions, even though they look identical
checkoutButton.addEventListener("click", () => console.log("Guest checked out"));
checkoutButton.removeEventListener("click", () => console.log("Guest checked out"));`;

const thisInListener = `checkoutButton.addEventListener("click", function () {
  console.log(this); // the button element itself — a regular function's this is set by how it's called
});

checkoutButton.addEventListener("click", () => {
  console.log(this); // whatever \`this\` was in the surrounding scope when the listener was defined — NOT the button
});`;

const questions: [React.ReactNode, React.ReactNode][] = [
  [
    "What does it mean for functions to be \"first-class\" in JavaScript?",
    "Functions can be assigned to variables, stored in data structures, passed as arguments, and returned from other functions — treated as ordinary values, just like numbers or strings.",
  ],
  [
    "What is a higher-order function?",
    "A function that either accepts another function as an argument, or returns a function (or both).",
  ],
  [
    "What is the difference between a synchronous and an asynchronous callback?",
    <>A synchronous callback runs immediately, within the same call, before the outer function returns. An asynchronous callback runs later, after the current call stack has cleared — like a <code>setTimeout</code> or event listener callback.</>,
  ],
  [
    "Why does removeEventListener sometimes silently fail to remove a listener?",
    <>Because it was called with a function reference that isn&apos;t the exact same one used in <code>addEventListener</code> — usually a newly written anonymous function that only looks identical.</>,
  ],
  [
    "Why does this behave differently between a regular function and an arrow function used as a listener?",
    <>A regular function&apos;s <code>this</code> is set dynamically by how it&apos;s called — the browser sets it to the element the event fired on. An arrow function has no <code>this</code> of its own; it keeps whatever <code>this</code> its surrounding scope had at definition time.</>,
  ],
];

export default function JsLessonTwelvePage() {
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
          Lesson 12 · {lesson.readTime} read
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
          JavaScript treats functions as <strong>first-class citizens</strong> — a fancy way of
          saying a function can do everything any other value (a number, a string, an object) can
          do: get assigned to a variable, get stored inside an array or object, get passed into
          another function as an argument, and get returned out of a function. A{" "}
          <strong>callback</strong> is simply a function passed into another function, to be run
          later, by that other function. An <strong>event listener</strong> is just a callback
          registered with the browser, to be run later, whenever a particular event happens.
        </p>

        <h2 id="why">Why This Matters</h2>
        <ul>
          <li>
            It&apos;s the mechanism underneath every <code>addEventListener</code>, every{" "}
            <code>setTimeout</code>, and every function factory from Lesson 10 — they all rely on
            functions being passable, storable values.
          </li>
          <li>
            It explains why a function can be &ldquo;handed off&rdquo; to run somewhere else,
            later, without losing access to the data it needs — that&apos;s the closure link from
            Lesson 10, doing its job.
          </li>
          <li>
            Getting <code>removeEventListener</code> and <code>this</code> inside listeners wrong
            is one of the most common real-world bugs in UI code.
          </li>
        </ul>

        <h2 id="analogy">The Instruction Card — An Analogy</h2>
        <Callout kind="note" label="A written instruction you can hand to anyone">
          <p>
            A guest writes an instruction on a card: <strong>&ldquo;When the fire alarm rings,
            evacuate guests from Floor 3.&rdquo;</strong> That card is not the action itself —
            it&apos;s a portable set of instructions. The guest can hand it to the front desk. The
            front desk can hand it to security. Security can pin it to a board and only act on it
            later, whenever the alarm actually rings.
          </p>
          <p className="mb-0">
            That card is exactly what a function is in JavaScript — a self-contained, portable set
            of instructions you can pass around freely. A <strong>callback</strong> is that card
            handed to someone else to read later. An <strong>event listener</strong> is that card
            pinned specifically to the fire alarm, to be read the moment it rings.
          </p>
        </Callout>

        <h2 id="proof">Proof: Functions Are Values</h2>
        <Script title="functions-as-values.js" code={proof} />
        <Callout kind="note">
          <p className="mb-0">
            <code>greetGuest</code> (no parentheses) refers to the function itself, as a value.{" "}
            <code>greetGuest()</code> (with parentheses) calls it and refers to whatever it
            returns. Mixing these two up is one of the most common bugs when passing callbacks —
            more on this below.
          </p>
        </Callout>

        <h2 id="hof">Higher-Order Functions</h2>
        <p>
          A <strong>higher-order function</strong> is any function that either accepts another
          function as an argument, or returns a function. You&apos;ve already met one — Lesson
          10&apos;s <code>createCounter</code> is higher-order because it <em>returns</em> a
          function. Here&apos;s one that <em>accepts</em> a function:
        </p>
        <Script title="repeat-task.js" code={hof} />
        <p>
          <code>repeatTask</code> doesn&apos;t know or care what <code>callback</code> actually
          does — its only job is to call it, at the right time, with the right argument. This
          separation — &ldquo;when to run&rdquo; decided by one function, &ldquo;what to run&rdquo;
          decided by whoever calls it — is the entire point of accepting a function as an argument.
        </p>
        <CallbackHandoff />

        <h2 id="callbacks">Callbacks — Sync vs. Async</h2>
        <p>Not all callbacks run at the same moment relative to the code around them:</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>When it runs</th>
                <th>Example</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Synchronous callback</td>
                <td>Immediately, before the outer function even returns</td>
                <td><code>repeatTask</code> above — <code>callback(i)</code> runs right there, inside the loop</td>
              </tr>
              <tr>
                <td>Asynchronous callback</td>
                <td>Later, after the current call stack has fully cleared</td>
                <td><code>setTimeout(callback, 1000)</code> — the call stack moves on immediately; <code>callback</code> runs after the delay</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Both are callbacks — a function handed to another function to be run on its behalf. What
          changes is only <em>when</em> that run actually happens, which is a preview of the event
          loop machinery in Lesson 14.
        </p>

        <h2 id="listeners">Event Listeners Are Just Callbacks</h2>
        <Script title="listener.js" code={listeners} />
        <p>
          <code>addEventListener</code> is a higher-order function too — you&apos;re handing it a
          callback (<code>handleCheckout</code>), and the browser holds onto that reference and
          invokes it later, whenever a <code>click</code> event actually happens on that button.
          Nothing new is happening here conceptually — it&apos;s <code>repeatTask</code>&apos;s
          pattern, except the browser decides when to call your function instead of a{" "}
          <code>for</code> loop deciding.
        </p>

        <h2 id="removing">Removing Listeners Correctly</h2>
        <Script title="remove-listener.js" code={removing} />
        <Callout kind="bad">
          <p className="mb-0">
            <code>removeEventListener</code> needs the <strong>exact same function reference</strong>{" "}
            that was passed to <code>addEventListener</code> — not a function that merely does the
            same thing. Two separately written arrow functions are two separate values in memory,
            even with identical code inside them, so the second one never actually removes
            anything. Always store the callback in a named variable or named function if
            you&apos;ll ever need to remove it.
          </p>
        </Callout>

        <h2 id="this">this Inside A Listener — A Lesson 5 Callback</h2>
        <Script title="this-in-listener.js" code={thisInListener} />
        <p>
          This is Lesson 5&apos;s rule about <code>this</code>, applied to a real, common
          situation: a regular <code>function</code> passed as a listener gets <code>this</code>{" "}
          set to the element the event fired on. An <strong>arrow function</strong> never gets its
          own <code>this</code> — it keeps whatever <code>this</code> its surrounding scope had
          (often the global object, per Lesson 5), which is almost never what you want inside a
          listener that needs to reference the clicked element.
        </p>

        <h2 id="live">See It Live — DevTools</h2>
        <ol className="steps">
          <li>
            <h3>Open any page and select an element</h3>
            <p>In the Elements panel, then switch to the Console.</p>
          </li>
          <li>
            <h3>Add a named listener</h3>
            <p>
              <code>{`function log(){ console.log(this) }`}</code> then{" "}
              <code>{`$0.addEventListener('click', log)`}</code> — <code>$0</code> refers to the
              currently selected element.
            </p>
          </li>
          <li>
            <h3>Click the element and inspect this</h3>
            <p>Confirm it logs the element itself, not <code>window</code>.</p>
          </li>
          <li>
            <h3>Try removeEventListener with a fresh arrow function</h3>
            <p>
              <code>{`$0.removeEventListener('click', () => console.log(this))`}</code> — click
              again and notice the original listener is still very much alive.
            </p>
          </li>
        </ol>

        <h2 id="pitfalls">Common Misconceptions</h2>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;Passing greetGuest() as a callback passes the function.&rdquo;</strong>{" "}
            It doesn&apos;t — the parentheses call it immediately and pass whatever it{" "}
            <em>returns</em>. To pass the function itself, leave the parentheses off:{" "}
            <code>greetGuest</code>, not <code>greetGuest()</code>.
          </p>
        </Callout>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;Every callback is asynchronous.&rdquo;</strong> No —{" "}
            <code>repeatTask</code>&apos;s callback runs synchronously, immediately, inside the
            loop. Only callbacks handed to things like <code>setTimeout</code>, promises, or
            browser events are asynchronous.
          </p>
        </Callout>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;removeEventListener with the &lsquo;same-looking&rsquo; function should
            work.&rdquo;</strong> It needs the identical reference, not identical-looking code. Two
            separate function expressions are two separate values.
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

      <LessonPager slug="lesson-12" lessons={JS_LESSONS} href={jsLessonHref} series={JS_SERIES} />
    </article>
  );
}
