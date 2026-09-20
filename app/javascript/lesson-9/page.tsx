import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import BlockWall from "@/components/figures/BlockWall";
import NestedBlocksCase from "@/components/figures/NestedBlocksCase";
import ShadowStepper from "@/components/figures/ShadowStepper";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { JS_LESSONS, JS_SERIES, jsLessonHref } from "@/lib/javascript";

const lesson = JS_LESSONS.find((l) => l.slug === "lesson-9")!;

export const metadata: Metadata = {
  title: `Lesson 9 — ${lesson.title}`,
  description: lesson.summary,
};

/** In-page index. Each entry links to a section heading below. */
const outline = [
  { id: "concept", label: "Concept" },
  { id: "why", label: "Why this matters" },
  { id: "door", label: "The meeting room door — an analogy" },
  { id: "block", label: "What counts as a block" },
  { id: "creates", label: "What a block actually creates in memory" },
  { id: "varvslet", label: "var vs. let/const inside a block" },
  { id: "nested", label: "Nested blocks — the chain, one brace at a time" },
  { id: "shadowing", label: "Shadowing — when names repeat" },
  { id: "danger", label: "Why var shadowing is dangerous" },
  { id: "illegal", label: "Illegal shadowing — the one combination that throws" },
  { id: "boundary", label: "The function-boundary exception — why the same pair is legal there" },
  { id: "params", label: "Shadowing parameters and built-ins" },
  { id: "switch", label: "The switch trap — one block for every case" },
  { id: "smell", label: "When shadowing is a smell, and when it is fine" },
  { id: "live", label: "See it live — DevTools" },
  { id: "pitfalls", label: "Common misconceptions" },
  { id: "interview", label: "Interview questions" },
];

const blocks = `{
  // a bare block — still a block
}

if (true) {
  // this counts too
}

for (let i = 0; i < 3; i++) {
  // and this
}`;

const creates = `{
  // no let/const here → the engine creates no environment for this block
  var x = 1;
}

{
  let y = 2;   // → a real block environment is created on entry, discarded on exit
}`;

const varVsLet = `{
  var a = 10;
  let b = 20;
}

console.log(a); // 10 — var walked straight out
console.log(b); // ReferenceError — let stayed inside, now gone`;

const nested = `let floor = 1;
{
  let wing = "north";
  {
    let room = 101;
    console.log(room, wing, floor); // 101 north 1
  }
}`;

const shadowLet = `let discount = 100;
{
  let discount = 20; // a genuinely separate variable, in its own block
  console.log(discount); // 20
}
console.log(discount); // 100 — untouched`;

const shadowVar = `var discount = 100;
{
  var discount = 20; // NOT a separate copy — this is the same variable
}
console.log(discount); // 20, not 100!`;

const illegal = `let discount = 100;
{
  var discount = 20; // SyntaxError: Identifier 'discount' has already been declared
}`;

const boundary = `let discount = 100;

function applyOffer() {
  var discount = 20;     // fine — this var belongs to applyOffer, not to Global
  console.log(discount); // 20
}

applyOffer();
console.log(discount);   // 100 — the outer let was never in the same scope`;

const params = `function checkIn(guestName) {
  let guestName = "Rahul";     // SyntaxError — the parameter already owns this name
}

function checkOut(guestName) {
  {
    let guestName = "Rahul";   // fine — a nested block is a different scope
    console.log(guestName);    // "Rahul"
  }
  console.log(guestName);      // the original argument, untouched
}`;

const switchCode = `switch (roomType) {
  case "single":
    let rate = 100;   // declared in the switch's one shared block
    break;
  case "double":
    let rate = 180;   // SyntaxError: Identifier 'rate' has already been declared
    break;
}

// the fix: give each case its own braces
switch (roomType) {
  case "single": {
    let rate = 100;
    break;
  }
  case "double": {
    let rate = 180;
    break;
  }
}`;

const questions: [React.ReactNode, React.ReactNode][] = [
  [
    "What is a block in JavaScript?",
    <>Any code inside <code>{"{ }"}</code> — an <code>if</code>, a loop, or a standalone <code>{"{ }"}</code> on its own.</>,
  ],
  [
    "Does var respect block scope?",
    <>No — <code>var</code> only respects function scope. A <code>var</code> declared inside a block is still accessible outside it.</>,
  ],
  [
    "Is var shadowing “real” shadowing?",
    <>Not genuinely — since <code>var</code> ignores blocks, there was only ever one variable. Declaring it again inside a block just reassigns the same one, rather than creating a separate copy.</>,
  ],
  [
    "What happens if you shadow an outer let with an inner var in a nested block?",
    <>A <code>SyntaxError</code> — the escaping <code>var</code> tries to attach to the same scope the outer <code>let</code> already occupies, and the two can&apos;t coexist.</>,
  ],
  [
    "Is shadowing a let with another let allowed?",
    "Yes — that creates two genuinely separate, independent variables, one per scope.",
  ],
  [
    "What does a block actually create at runtime?",
    <>If it contains a <code>let</code>, <code>const</code> or <code>class</code> declaration, entering the block creates a new Lexical Environment (a memory record plus an outer reference to the surrounding scope), and leaving it discards that environment. A block with only <code>var</code>s or statements creates nothing — there is nothing block-scoped to hold.</>,
  ],
  [
    "How does a lookup inside three nested blocks find a variable declared at the top?",
    <>Exactly as it does through nested functions (Lesson 7): own block first, then the outer reference to the enclosing block, then the next, until Global. A block&apos;s environment is an ordinary link in the scope chain.</>,
  ],
  [
    "Why is let outside / var inside a block a SyntaxError, but let outside / var inside a function fine?",
    <>The <code>var</code> hoists to the nearest <em>function</em> scope. In a block, that is the very scope where the outer <code>let</code> already lives — two declarations of one name in one scope, which is illegal. Inside a function, the <code>var</code> lands in that function&apos;s own scope, a different one from the outer <code>let</code>, so it is ordinary legal shadowing.</>,
  ],
  [
    "Can you redeclare a function parameter with let in the function body?",
    <>Not at the top level of the body — parameters and the body&apos;s top-level <code>let</code>/<code>const</code> share one scope, so it is a <code>SyntaxError</code>. Inside a nested block within the body it is allowed, as normal shadowing.</>,
  ],
  [
    "Why does declaring the same let in two switch cases throw?",
    <>A <code>switch</code> statement has one block for all its cases — <code>case</code> labels do not open scopes. Two <code>let rate</code> in different cases are two declarations in the same scope. Wrap each case body in its own <code>{"{ }"}</code> to give it a scope.</>,
  ],
];

export default function JsLessonNinePage() {
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
          Lesson 9 · {lesson.readTime} read
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
          A <strong>block</strong> is simply any code between <code>{"{ }"}</code> — an{" "}
          <code>if</code>, a <code>for</code> loop, or just a bare <code>{"{ }"}</code> on its own.{" "}
          <code>let</code> and <code>const</code> treat that boundary as a real wall.{" "}
          <code>var</code> ignores it completely. That one difference is the entire lesson — and it
          has a sharp edge called <strong>shadowing</strong> that can genuinely break your code if
          you don&apos;t know it&apos;s there.
        </p>

        <h2 id="why">Why This Matters</h2>
        <ul>
          <li>
            It explains why the same variable name can safely repeat inside nested <code>if</code>{" "}
            blocks with <code>let</code>, but silently corrupts data with <code>var</code>.
          </li>
          <li>
            It&apos;s a very common real bug: a <code>var</code> inside a loop or an <code>if</code>{" "}
            block quietly overwriting a variable you thought was separate.
          </li>
          <li>
            It&apos;s a frequent interview trap — predicting the output of nested blocks with
            repeated names.
          </li>
          <li>
            It closes the loop on Lessons 7 and 8: a block is a link in the scope chain, with its
            own TDZ for anything declared inside it. Once you can see the environment a block
            creates, every shadowing rule in this lesson follows from Lesson 7&apos;s
            &ldquo;nearest match wins&rdquo;.
          </li>
        </ul>

        <h2 id="door">The Meeting Room Door — An Analogy</h2>
        <Callout kind="note" label="One respects the door, one walks through the wall">
          <p>
            A meeting room has a door. Anything written on the whiteboard <strong>inside</strong>{" "}
            that room, using <code>let</code>/<code>const</code> rules, stays inside — step outside,
            and it&apos;s gone, exactly like Lesson 3.
          </p>
          <p className="mb-0">
            But <code>var</code> doesn&apos;t care that a door exists at all. Whatever it writes
            ends up on the <strong>main office notice board</strong> outside, regardless of which
            room it was written from. It walks straight through the wall.
          </p>
        </Callout>

        <h2 id="block">What Counts As A Block</h2>
        <Script title="blocks.js" code={blocks} />
        <p>
          Any <code>{"{ }"}</code> counts — it doesn&apos;t need to be attached to an{" "}
          <code>if</code> or a loop.
        </p>
        <p>
          Two braces that look like blocks but are not: the <code>{"{ }"}</code> of an object
          literal (<code>{"{ name: \"Aditi\" }"}</code>) is a value, not a scope; and the body of a
          function is technically a <em>function</em> scope — it contains everything a block scope
          does, plus it is the one boundary <code>var</code> respects.
        </p>

        <h2 id="creates">What A Block Actually Creates In Memory</h2>
        <p>
          A block is not a scope by decoration; it is a scope because entering it can create a
          real <strong>Lexical Environment</strong> (Lesson 7): a memory record for the block&apos;s
          own <code>let</code>/<code>const</code>/<code>class</code> declarations, plus an outer
          reference to the environment the block sits inside. Leaving the block discards that
          environment. Everything else in this lesson is a consequence of that one object existing
          — or not.
        </p>
        <Script title="creates.js" code={creates} />
        <p>
          The first block declares nothing block-scoped, so the engine has nothing to put in a
          block environment and creates none; the <code>var</code> was hoisted to the enclosing
          function long before the braces were reached. The second block declares a{" "}
          <code>let</code>, so on entry it gets an environment holding <code>y</code> (locked in
          its TDZ until line 7 runs — Lesson 8), and on exit that environment is dropped.
        </p>
        <Callout kind="note">
          <p className="mb-0">
            This is also why a block&apos;s bindings are created <em>when the block is entered</em>,
            not when the file loads. A function&apos;s memory phase reserves its own <code>var</code>s
            and function declarations; the <code>let</code>s inside a nested block wait until
            execution actually reaches the <code>{"{"}</code>. The stepper in the next section
            shows the block environment appearing at exactly that line.
          </p>
        </Callout>

        <h2 id="varvslet">var vs. let/const Inside A Block</h2>
        <Script title="var-vs-let.js" code={varVsLet} />
        <Callout kind="note">
          <p className="mb-0">
            <code>var</code> was never block-scoped to begin with — it only respects function
            boundaries (Lesson 3). <code>{"{ }"}</code> means nothing to it.
          </p>
        </Callout>
        <BlockWall />

        <h2 id="nested">Nested Blocks — The Chain, One Brace At A Time</h2>
        <p>
          Blocks nest, and each nested block that declares something gets its own environment,
          whose outer reference points at the enclosing block&apos;s environment. The result is the
          same scope chain Lesson 7 built out of functions — just with braces as the links.
        </p>
        <Script title="nested.js" code={nested} />
        <NestedBlocksCase />
        <p>
          Nothing new is happening here: <code>room</code> is found locally, <code>wing</code> one
          hop up, <code>floor</code> two hops up. The point is that a block is a{" "}
          <em>first-class</em> link in that chain, indistinguishable from a function&apos;s scope
          as far as lookup is concerned. Which is exactly why shadowing behaves the way it does.
        </p>

        <h2 id="shadowing">Shadowing — When Names Repeat</h2>
        <p>
          <strong>Shadowing</strong> is what happens when an inner scope declares a variable with
          the same name as one in an outer scope. With <code>let</code>/<code>const</code>, this is
          completely safe:
        </p>
        <Script title="shadow-let.js" code={shadowLet} />
        <p>
          Two totally separate <code>discount</code>s, living in two separate memory spaces. The
          inner one temporarily &ldquo;shadows&rdquo; the outer one, but never touches it.
        </p>
        <p>
          In chain terms: the block environment has its own <code>discount</code>, so any lookup
          from inside the block stops at the first level — nearest match wins — and the outer
          binding is never consulted. It is not hidden by magic; it is one link further down a
          chain the lookup never walks.
        </p>

        <h2 id="danger">Why var Shadowing Is Dangerous</h2>
        <Script title="shadow-var.js" code={shadowVar} />
        <Callout kind="bad">
          <p className="mb-0">
            This isn&apos;t really &ldquo;shadowing&rdquo; at all — it&apos;s the exact same{" "}
            <code>discount</code> being overwritten. Because <code>var</code> ignores the block
            wall, there was only ever <strong>one</strong> <code>discount</code> in this whole
            scope. Writing <code>var discount</code> again inside the block doesn&apos;t create a
            new one — it just reassigns the one that already existed.
          </p>
        </Callout>
        <ShadowStepper />

        <h2 id="illegal">Illegal Shadowing — The One Combination That Throws</h2>
        <Script title="illegal.js" code={illegal} />
        <p>
          This one specifically fails. <code>var</code> tries to attach itself to the nearest
          function/global scope — but a <code>let</code> with the same name already exists right
          there, and the two can&apos;t coexist. Every other combination is fine:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Outer</th>
                <th>Inner (in a nested block)</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><code>let</code></td><td><code>let</code></td><td className="font-semibold text-emerald-300">Allowed — genuinely separate variables</td></tr>
              <tr><td><code>var</code></td><td><code>let</code></td><td className="font-semibold text-emerald-300">Allowed — let stays contained in the block</td></tr>
              <tr><td><code>var</code></td><td><code>var</code></td><td className="font-semibold text-emerald-300">Allowed — but it&apos;s really the same variable (see above)</td></tr>
              <tr><td><code>let</code></td><td><code>var</code></td><td className="font-semibold text-red-300"><code>SyntaxError</code> — var collides with the outer let</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          The mechanism is Lesson 8&apos;s redeclaration rule, seen from a new angle. The engine
          hoists <code>var discount</code> out of the block to the nearest function scope — here,
          Global. Global already holds a <code>let discount</code>. That is two declarations of one
          name in one scope, which is exactly the duplicate-<code>let</code> <code>SyntaxError</code>{" "}
          — caught at parse time, before any line runs. The braces did not protect the{" "}
          <code>var</code>, because braces never do.
        </p>

        <h2 id="boundary">The Function-Boundary Exception — Why The Same Pair Is Legal There</h2>
        <p>
          Read the previous rule carefully and a loophole appears: the collision happens only
          because the <code>var</code> hoists to the <em>same</em> scope as the <code>let</code>.
          Put a function boundary between them and the <code>var</code> hoists to the function
          instead — a different scope, no collision, ordinary shadowing.
        </p>
        <Script title="boundary.js" code={boundary} />
        <p>
          Same keywords, same names, same nesting — but the inner declaration is inside a function
          body rather than a bare block, so <code>var discount</code> belongs to{" "}
          <code>applyOffer</code>&apos;s own memory. The outer <code>let</code> is one link up the
          chain, untouched. So the precise statement of the illegal case is: <strong>a{" "}
          <code>var</code> may not hoist into a scope that already has a <code>let</code>/
          <code>const</code> of the same name</strong>. A block cannot stop that hoisting; a
          function can.
        </p>

        <h2 id="params">Shadowing Parameters And Built-Ins</h2>
        <p>
          A function&apos;s parameters live in the same scope as the top level of its body. That
          makes a parameter behave like a <code>let</code> already declared on line 0 of the
          function — so redeclaring it with <code>let</code> at the top level of the body is a
          duplicate declaration, while shadowing it inside a nested block is legal.
        </p>
        <Script title="params.js" code={params} />
        <p>
          The same logic covers built-in names. <code>let undefined = 5;</code> at the top level of
          a script is a <code>SyntaxError</code> in a browser, because <code>undefined</code> is
          already a property of the global object; inside a block or a function it is legal, and
          creates a genuinely separate binding that shadows the real one for that scope. Legal is
          not the same as wise — shadowing <code>undefined</code>, <code>name</code>,{" "}
          <code>length</code> or <code>event</code> is a reliable way to confuse the next person to
          read the code.
        </p>

        <h2 id="switch">The switch Trap — One Block For Every Case</h2>
        <p>
          A <code>switch</code> statement has exactly one block: the braces after{" "}
          <code>switch (…)</code>. <code>case</code> labels are labels — they do not open a scope.
          So two <code>case</code>s that each declare <code>let rate</code> are two declarations in
          one scope, and that is a <code>SyntaxError</code> before the file runs.
        </p>
        <Script title="switch.js" code={switchCode} />
        <p>
          The fix is the general one: if you want a scope, write braces. Wrapping each case body
          in <code>{"{ }"}</code> gives every case its own block environment, and the shared-block
          problem disappears. Linters flag the unwrapped version as <code>no-case-declarations</code>.
        </p>

        <h2 id="smell">When Shadowing Is A Smell, And When It Is Fine</h2>
        <p>
          Everything above describes what the engine <em>allows</em>. What you should{" "}
          <em>do</em> is a narrower question.
        </p>
        <ul>
          <li>
            <strong>Fine:</strong> short-lived names in small, obviously separate scopes — the{" "}
            <code>i</code> of two sibling loops, an <code>error</code> in two separate{" "}
            <code>catch</code> blocks, a callback parameter that reuses a conventional name.
          </li>
          <li>
            <strong>Smell:</strong> shadowing a name from an enclosing scope that is still in use
            around the inner scope. Anyone reading the inner code has to remember which{" "}
            <code>discount</code> they are looking at, and a later refactor that removes the inner
            declaration silently changes which binding the inner code touches — from a private
            copy to the outer original.
          </li>
          <li>
            <strong>Always a bug:</strong> <code>var</code> &ldquo;shadowing&rdquo; inside a block.
            It looks like a separate variable and is not. Modern code avoids <code>var</code>{" "}
            entirely (Lesson 8), which removes this class of bug outright.
          </li>
        </ul>
        <Callout kind="ok" label="Practical rule">
          <p className="mb-0">
            Turn on <code>no-shadow</code> in your linter and treat every warning as a naming
            decision: either the inner thing really is different — give it a different name — or it
            is the same thing, and you did not need a new declaration at all.
          </p>
        </Callout>

        <h2 id="live">See It Live — DevTools</h2>
        <ol className="steps">
          <li>
            <h3>Paste the var-shadowing example</h3>
            <p>The one under &ldquo;Why var shadowing is dangerous,&rdquo; into the console.</p>
          </li>
          <li>
            <h3>Set a breakpoint inside the block</h3>
            <p>On the line <code>var discount = 20;</code>.</p>
          </li>
          <li>
            <h3>Check the Scope panel</h3>
            <p>
              Notice there&apos;s only <strong>one</strong> <code>discount</code> listed, under the
              outer scope — not two. Stepping past this line updates that single value from{" "}
              <code>100</code> to <code>20</code>, live.
            </p>
          </li>
          <li>
            <h3>Repeat with the let version</h3>
            <p>
              This time the Scope panel shows two genuinely separate entries while paused inside
              the block — the outer <code>discount</code> untouched, a second one local to the
              block.
            </p>
          </li>
          <li>
            <h3>Look for the Block entry itself</h3>
            <p>
              In the <code>let</code> version the panel gains a section titled{" "}
              <strong>Block</strong> while you are paused inside the braces, holding the inner{" "}
              <code>discount</code>. Step past the closing <code>{"}"}</code> and the whole Block
              section vanishes — that is the block environment being discarded. In the{" "}
              <code>var</code> version there is never a Block section at all, because no
              environment was ever created.
            </p>
          </li>
        </ol>

        <h2 id="pitfalls">Common Misconceptions</h2>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;Shadowing always means two separate variables.&rdquo;</strong> Only with{" "}
            <code>let</code>/<code>const</code>. A <code>var</code> &ldquo;shadow&rdquo; is really
            just the same variable being reassigned, since <code>var</code> was never block-scoped
            to begin with.
          </p>
        </Callout>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;You can shadow any variable with any keyword.&rdquo;</strong> Not quite
            — shadowing a <code>let</code> with a <code>var</code> in a nested block throws a{" "}
            <code>SyntaxError</code>, because the escaping <code>var</code> collides with the
            existing <code>let</code>.
          </p>
        </Callout>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;A bare <code>{"{ }"}</code> block does nothing on its own.&rdquo;</strong>{" "}
            It still creates a real scope boundary for <code>let</code>/<code>const</code>, even
            with no <code>if</code> or loop attached to it.
          </p>
        </Callout>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;let outside, var inside is always illegal.&rdquo;</strong> Only when the{" "}
            <code>var</code> hoists into the same scope as the <code>let</code> — a bare block. Put
            the <code>var</code> inside a function and it hoists to that function instead, which is
            ordinary, legal shadowing.
          </p>
        </Callout>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;Each <code>case</code> in a switch is its own block.&rdquo;</strong>{" "}
            <code>case</code> is a label, not a scope. All cases share the switch&apos;s single
            block unless you add braces yourself.
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

      <LessonPager slug="lesson-9" lessons={JS_LESSONS} href={jsLessonHref} series={JS_SERIES} />
    </article>
  );
}
