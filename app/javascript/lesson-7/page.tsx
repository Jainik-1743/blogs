import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import ScopeChainDiagram from "@/components/figures/ScopeChainDiagram";
import { ScopeCase1, ScopeCase2, ScopeCase3, ScopeCase4 } from "@/components/figures/ScopeCases";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { JS_LESSONS, JS_SERIES, jsLessonHref } from "@/lib/javascript";

const lesson = JS_LESSONS.find((l) => l.slug === "lesson-7")!;

export const metadata: Metadata = {
  title: `Lesson 7 — ${lesson.title}`,
  description: lesson.summary,
};

/** In-page index. Each entry links to a section heading below. */
const outline = [
  { id: "concept", label: "Concept" },
  { id: "why", label: "Why this matters" },
  { id: "board", label: "The chain of notice-boards — an analogy" },
  { id: "definition", label: "Lexical Environment — the formal definition" },
  { id: "lexical", label: "Lexical (static) scope vs. dynamic scope" },
  { id: "case1", label: "Case 1: reading straight from global" },
  { id: "case2", label: "Case 2: nested functions, chain goes as deep as needed" },
  { id: "case3", label: "Case 3: shadowing — the nearest name wins" },
  { id: "case4", label: "Case 4: the one-way street" },
  { id: "live", label: "See it live — DevTools scope panel" },
  { id: "pitfalls", label: "Common misconceptions" },
  { id: "interview", label: "Interview questions" },
];

const case1 = `function frontDesk() {
  console.log(discountRate); // 10
}

var discountRate = 10;
frontDesk();`;

const case2 = `function frontDesk() {
  checkAvailability();

  function checkAvailability() {
    console.log(discountRate); // 10
  }
}

var discountRate = 10;
frontDesk();`;

const case3 = `function frontDesk() {
  checkAvailability();

  function checkAvailability() {
    var discountRate = 100;
    console.log(discountRate); // 100
  }
}

var discountRate = 10;
frontDesk();`;

const case4 = `function frontDesk() {
  var discountRate = 10;
  checkAvailability();

  function checkAvailability() {
    console.log(discountRate); // 10 — inner sees outer, as always
  }
}

frontDesk();
console.log(discountRate); // ReferenceError: discountRate is not defined`;

const questions: [React.ReactNode, React.ReactNode][] = [
  [
    "What is a Lexical Environment?",
    <>The place where the engine keeps one scope&apos;s names and values: its own local memory, plus a reference (link) to its parent&apos;s Lexical Environment. This repeats all the way up to Global, which points to <code>null</code> (nothing).</>,
  ],
  [
    "What is the scope chain?",
    "The list of scopes that JS checks, from the inside out, when a variable isn't found locally: the parent's Lexical Environment, then its parent, one level at a time, until the variable is found or Global is reached.",
  ],
  [
    "Is JavaScript lexically scoped or dynamically scoped?",
    "Lexically (statically) scoped. A function's scope is fixed by where it is written and nested in the source code, not by which function calls it while the program runs.",
  ],
  [
    "What happens when a local variable has the same name as a global one?",
    "Shadowing. The local variable wins for any code running inside that inner scope. The global one is unchanged, only hidden from that scope.",
  ],
  [
    "Can the global scope access a variable declared inside a function?",
    "No — the scope chain only runs outward and upward. A function can reach a global variable, but global can never reach back down into a function's local variables.",
  ],
  [
    "If a variable isn't found anywhere in the entire scope chain, including Global, what happens?",
    <>A <code>ReferenceError</code> — the name was never defined anywhere reachable from where you&apos;re standing.</>,
  ],
];

export default function JsLessonSevenPage() {
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
          Lesson 7 · {lesson.readTime} read
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
          Lesson 4 gave one rule: a function can look <em>outward</em> to its parent scope,
          never sideways. A <strong>scope</strong> is the part of the code where a name can be seen
          and used. A <strong>nested function</strong> is a function written inside another
          function, and the outer one is its <strong>parent</strong>. This lesson stretches the rule
          across as many levels as your code has. A function nested three functions deep can still
          reach all the way up to global, checking one level at a time. That upward walk has a
          name: the <strong>scope chain</strong>. It is built from something you met briefly in
          Lesson 4: the <strong>Lexical Environment</strong>.
        </p>

        <h2 id="why">Why This Matters</h2>
        <ul>
          <li>
            It&apos;s the one rule behind every &ldquo;why can this function see that
            variable?&rdquo; question you will debug.
          </li>
          <li>
            It explains exactly what happens when the same variable name exists at multiple levels
            — which one actually gets used, and why.
          </li>
          <li>
            It&apos;s the foundation for closures (Lesson 10). A closure is a function that keeps access
            to the variables of the place where it was created, even after that place has finished
            running. You cannot understand closures until this lesson is clear.
          </li>
          <li>
            Knowing JS is <em>lexically</em> scoped (not dynamically scoped) tells you that scope is
            decided when you write the code, not when it runs. Interviewers use this to check
            real understanding.
          </li>
        </ul>

        <h2 id="board">The Chain Of Notice-Boards — An Analogy</h2>
        <Callout kind="note" label="Walking up the chain of command, one office at a time">
          <p>
            A trainee at the front desk needs a piece of information — say, today&apos;s discount
            rate. She first checks her own small notepad. Not there? She walks up to her direct
            supervisor&apos;s office and checks the board there. Still not there? She walks up
            again, to the branch manager&apos;s board. Still nothing? Finally, head office&apos;s
            master board — the one everyone in the whole building can see.
          </p>
          <p className="mb-0">
            She always walks <strong>up</strong>, one office at a time, in order. She never walks
            sideways into a colleague&apos;s office at her own level, and she never walks back down
            into a junior trainee&apos;s desk below her. That upward-only, one-level-at-a-time walk
            is the entire scope chain.
          </p>
        </Callout>

        <h2 id="definition">Lexical Environment — The Formal Definition</h2>
        <p>
          A <strong>Lexical Environment</strong> is the place where the engine keeps the names and
          values of one scope. It is two things together: <strong>its own local memory</strong>, plus{" "}
          <strong>a reference to its parent&apos;s Lexical Environment</strong> (a reference is a
          link that points to something else). That is the whole mechanism. It repeats at every
          level, because the parent&apos;s Lexical Environment has the same two parts and points to
          its own parent, all the way up to Global. Global&apos;s reference points to{" "}
          <code>null</code>, a value that means &ldquo;nothing here,&rdquo; so the chain ends.
        </p>
        <Callout kind="note" label="Scope vs. Lexical Environment, in one line">
          <p className="mb-0">
            <strong>Scope</strong> is the rule: which part of the code can see which names. A{" "}
            <strong>Lexical Environment</strong> is the data the engine keeps to follow that rule: the
            memory of one scope plus the link to its parent.
          </p>
        </Callout>
        <Callout kind="note">
          <p className="mb-0">
            When you look up a variable, JS checks the current Lexical Environment&apos;s local
            memory first. Not found? It follows that one reference upward and checks there. Still
            not found? It follows the next reference up. This upward walk, from one Lexical
            Environment to its parent, is what &ldquo;the scope chain&rdquo; means. The scope chain is
            the list of scopes JavaScript checks, in order, from the inside out.
          </p>
        </Callout>

        <h2 id="lexical">Lexical (Static) Scope vs. Dynamic Scope</h2>
        <p>
          &ldquo;Lexical&rdquo; means <strong>based on where something is written in your code</strong>{" "}
          — not on which function called it. JavaScript decides scope this way. It helps to compare
          it with the other model:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Lexical (static) scope — what JS uses</th>
                <th>Dynamic scope — a different model</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>Decided by</strong></td><td>Where the function is physically written/nested in the source code</td><td>Which function called it while the program runs</td></tr>
              <tr><td><strong>Fixed at</strong></td><td>The moment you write the code</td><td>The moment the code runs</td></tr>
              <tr><td><strong>Predictable from</strong></td><td>Reading the file alone</td><td>Tracing the actual call sequence</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          A function&apos;s scope chain is decided when you write it inside another function in your
          source file. It has nothing to do with who calls it later. That is why you can find the
          chain just by reading the code, without running it. (JavaScript does not use dynamic
          scope.)
        </p>

        <h2 id="case1">Case 1: Reading Straight From Global</h2>
        <Script title="case1.js" code={case1} />
        <p>
          <code>frontDesk</code>&apos;s own local memory has no <code>discountRate</code>, so it
          follows its outer reference straight to Global. It finds the name there, with the value{" "}
          <code>10</code>.
        </p>
        <ScopeCase1 />

        <h2 id="case2">Case 2: Nested Functions — The Chain Goes As Deep As Needed</h2>
        <Script title="case2.js" code={case2} />
        <p>
          <code>checkAvailability</code> is nested inside <code>frontDesk</code>. Its own memory has
          no <code>discountRate</code> — it checks its parent, <code>frontDesk</code>&apos;s memory.
          Not there either, so it keeps going up to Global, where it finds <code>10</code>. This takes
          two hops up the chain.
        </p>
        <ScopeChainDiagram />
        <ScopeCase2 />

        <h2 id="case3">Case 3: Shadowing — The Nearest Name Wins</h2>
        <Script title="case3.js" code={case3} />
        <Callout kind="ok">
          <p className="mb-0">
            This time <code>checkAvailability</code> has its <strong>own local</strong>{" "}
            <code>discountRate</code>, so the lookup stops at the first level. It does not continue up toward{" "}
            <code>frontDesk</code> or Global. The nearest match always wins. This is called{" "}
            <strong>shadowing</strong>: a variable in an inner scope has the same name as one in an
            outer scope, and the inner one &ldquo;hides&rdquo; the outer one for any code running
            inside the inner scope.
          </p>
        </Callout>
        <ScopeCase3 />

        <h2 id="case4">Case 4: The One-Way Street</h2>
        <Script title="case4.js" code={case4} />
        <Callout kind="bad">
          <p className="mb-0">
            Global can never reach down into a function&apos;s local memory. The reference only points{" "}
            <strong>outward and upward</strong>, never the other way. This is the
            same one-way rule from Lesson 4, now stated in full:{" "}
            <strong>
              a function can access a global variable, but the global scope can never access a
              local variable declared inside a function.
            </strong>
          </p>
        </Callout>
        <ScopeCase4 />

        <h2 id="live">See It Live — DevTools Scope Panel</h2>
        <ol className="steps">
          <li>
            <h3>Set a breakpoint</h3>
            <p>
              On the <code>console.log(discountRate)</code> line inside{" "}
              <code>checkAvailability</code> in the Case 2 example.
            </p>
          </li>
          <li>
            <h3>Open the Scope panel</h3>
            <p>Sources tab, while paused at that breakpoint.</p>
          </li>
          <li>
            <h3>Read the panel top to bottom</h3>
            <p>
              The panel lists the scopes from the inside out. First is <strong>Local</strong>{" "}
              (<code>checkAvailability</code>&apos;s own scope, without <code>discountRate</code>), and
              last is <strong>Global</strong>, where <code>discountRate: 10</code> shows up. DevTools
              shows a <strong>Closure (functionName)</strong> entry for an outer function only when the
              inner function uses one of that outer function&apos;s variables. In Case 2 it does not,
              so you will normally see only Local and Global. To see a Closure entry, add{" "}
              <code>var floor = 3;</code> inside <code>frontDesk</code> and print it from{" "}
              <code>checkAvailability</code>. The panel shows the scope chain in the order the engine
              walks it.
            </p>
          </li>
        </ol>

        <h2 id="pitfalls">Common Misconceptions</h2>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;A function&apos;s scope depends on which function called it.&rdquo;</strong>{" "}
            No — that would be dynamic scope, which JS doesn&apos;t use. A function&apos;s scope
            chain is fixed by where it is written and nested in the code, before
            it runs.
          </p>
        </Callout>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;If a local variable shadows a global one, the global value is lost forever.&rdquo;</strong>{" "}
            It isn&apos;t lost. It is hidden only for code running inside that inner
            scope. The global variable is unchanged and available everywhere else.
          </p>
        </Callout>
        <Callout kind="bad">
          <p className="mb-0">
            <strong>&ldquo;Global scope can peek into any function&apos;s variables if it really needs to.&rdquo;</strong>{" "}
            It can&apos;t. The chain only runs outward and upward, never
            down into a function&apos;s private memory.
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

      <LessonPager slug="lesson-7" lessons={JS_LESSONS} href={jsLessonHref} series={JS_SERIES} />
    </article>
  );
}
