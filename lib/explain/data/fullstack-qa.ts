import type { ExplainerData } from "../types.ts";

/** Explainers for the "fullstack-qa" series. Names must start with "fullstack-qa-" followed by the lesson number. */
export const DATA: ExplainerData = {
  // ---- lessons 0-19 ----
  /* ---- lesson 0 ---- */
  "fullstack-qa-0-answer-shape": {
    kind: "flow",
    title: "The shape of a 4+ years answer",
    nodes: [
      { id: "q", label: "Question", sub: "A page re-renders too often", col: 0, row: 0, tone: "client" },
      { id: "ask", label: "Ask first", sub: "How big is it?", col: 1.5, row: 0, tone: "server" },
      { id: "def", label: "Define", sub: "Plain words", col: 3, row: 0, tone: "data" },
      { id: "cost", label: "Trade-off", sub: "What it costs", col: 3, row: 1.4, tone: "warn" },
      { id: "ex", label: "Example", sub: "A real number", col: 1.5, row: 1.4, tone: "store" },
      { id: "chk", label: "Check", sub: "How you would prove it", col: 0, row: 1.4, tone: "queue" },
    ],
    edges: [
      { id: "e1", from: "q", to: "ask" },
      { id: "e2", from: "ask", to: "def" },
      { id: "e3", from: "def", to: "cost" },
      { id: "e4", from: "cost", to: "ex" },
      { id: "e5", from: "ex", to: "chk" },
    ],
    steps: [
      {
        title: "A 4+ years question asks for judgement",
        note: "The question is not what a hook is. It is how you would find out why a page re-renders too often. The interviewer listens for a definition, a trade-off, a real example and honesty about limits.",
        appear: ["q"],
        focus: ["q"],
      },
      {
        title: "First, ask one or two clarifying questions",
        note: "A question can have several correct answers. Ask how big the data is, how many users there are and what the deadline is. This shows that you do not build more than the problem needs.",
        appear: ["ask", "e1"],
        focus: ["ask", "e1"],
        set: { ask: "How big? How many users?" },
      },
      {
        title: "Define the idea in one or two plain sentences",
        note: "No buzzwords. A short, clear definition proves you understand the idea and gives the interviewer something to build on.",
        appear: ["def", "e2"],
        focus: ["def", "e2"],
        set: { def: "One or two plain sentences" },
      },
      {
        title: "Give the simple option, then say what it costs",
        note: "Every choice has a price: faster but uses more memory, simpler but does not scale past one server. Say which option is enough for now and what would make you change it.",
        appear: ["cost", "e3"],
        focus: ["cost", "e3"],
        set: { cost: "Simple first, then its cost" },
      },
      {
        title: "Add a short example with a number",
        note: "For example: the page took 4.2 seconds, a 600 KB library was used in one place, loading it lazily brought the page to 2.1 seconds. Numbers make the story believable.",
        appear: ["ex", "e4"],
        focus: ["ex", "e4"],
        set: { ex: "4.2 s down to 2.1 s" },
      },
      {
        title: "End with how you would check it",
        note: "One sentence is enough: I would confirm it with the profiler, or add a test that fails without the fix. It shows that you treat your own answer as a claim to prove.",
        appear: ["chk", "e5"],
        focus: ["chk", "e5"],
        set: { chk: "I would confirm it with the profiler" },
      },
      {
        title: "If you do not know, say so and reason",
        note: "Say plainly what you have not used, connect it to something you know, and say how you would test it. An honest answer that reasons well scores higher than a confident guess that turns out wrong.",
        focus: ["q", "ask", "def", "cost", "ex", "chk"],
      },
    ],
  },

  /* ---- lesson 1 ---- */
  "fullstack-qa-1-cascade-winner": {
    kind: "array",
    title: "Which CSS rule wins? The cascade, question by question",
    cells: [
      ["p", "none", "0-0-1", "1", "red"],
      ["#id.x", "utilities", "1-1-0", "2", "blue"],
      ["p.x", "base", "0-1-1", "3", "green"],
      [".x", "utilities", "0-1-0", "4", "orange"],
    ],
    indexLabels: ["selector", "layer", "score", "order", "color"],
    steps: [
      {
        title: "Four rules all set the color of one paragraph",
        note: "The paragraph is p id=id class=x. Layers are set up as base first, then utilities. Which color does the browser pick? The cascade asks its questions in a fixed order, and specificity is only the fourth.",
        mark: [[0, 4], [1, 4], [2, 4], [3, 4]],
      },
      {
        title: "Questions 1 and 2: relevance and origin",
        note: "All four selectors match the paragraph, all are author styles, and none uses important. Nobody drops out yet.",
        mark: [[0, 0], [1, 0], [2, 0], [3, 0]],
      },
      {
        title: "Question 3: layers. Unlayered CSS beats every layer",
        note: "The plain p rule is outside any layer, so it beats all three layered rules even though its score is the lowest. The paragraph is red. This is the trap when you add layers to an old project.",
        done: [[0, 0], [0, 4]],
        dim: [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [2, 0], [2, 1], [2, 2], [2, 3], [2, 4], [3, 0], [3, 1], [3, 2], [3, 3], [3, 4]],
        mark: [[0, 1]],
      },
      {
        title: "The fix: put the old CSS into a layer too",
        note: "Move the old p rule into the base layer. Now every rule sits in a layer, so the layer order can decide.",
        cells: [
          ["p", "base", "0-0-1", "1", "red"],
          ["#id.x", "utilities", "1-1-0", "2", "blue"],
          ["p.x", "base", "0-1-1", "3", "green"],
          [".x", "utilities", "0-1-0", "4", "orange"],
        ],
        mark: [[0, 1]],
      },
      {
        title: "Question 3 again: the later layer wins",
        note: "Utilities comes after base, so the two utilities rules beat the two base rules. Layer order beats specificity, which is why a utility class can win with a weak selector.",
        mark: [[1, 1], [3, 1]],
        dim: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [2, 0], [2, 1], [2, 2], [2, 3], [2, 4]],
      },
      {
        title: "Question 4: specificity, compared left to right",
        note: "#id.x scores 1-1-0 and .x scores 0-1-0. The ID column is compared first and 1 beats 0, so blue wins. The columns never carry over: eleven classes would still lose to one ID.",
        done: [[1, 0], [1, 2], [1, 4]],
        dim: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [2, 0], [2, 1], [2, 2], [2, 3], [2, 4], [3, 0], [3, 1], [3, 2], [3, 3], [3, 4]],
      },
      {
        title: "Question 5: order of appearance only breaks ties",
        note: "Now imagine the second rule were just .x. Both utilities rules score 0-1-0, so the one written last wins and the paragraph turns orange. Order is the last question, not the first.",
        cells: [
          ["p", "base", "0-0-1", "1", "red"],
          [".x", "utilities", "0-1-0", "2", "blue"],
          ["p.x", "base", "0-1-1", "3", "green"],
          [".x", "utilities", "0-1-0", "4", "orange"],
        ],
        done: [[3, 0], [3, 2], [3, 3], [3, 4]],
        dim: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [2, 0], [2, 1], [2, 2], [2, 3], [2, 4]],
      },
    ],
  },

  /* ---- lesson 2 ---- */
  "fullstack-qa-2-class-scanner": {
    kind: "flow",
    title: "Why a dynamic Tailwind class name makes no CSS",
    nodes: [
      { id: "bad", label: "Broken source", sub: "bg-${color}-600", col: 0, row: 0, tone: "warn" },
      { id: "good", label: "Working source", sub: "red: bg-red-600", col: 0, row: 1.4, tone: "store" },
      { id: "scan", label: "Scanner", sub: "reads plain text", col: 1.8, row: 0.7, tone: "server" },
      { id: "css", label: "Output CSS", sub: "empty so far", col: 3.6, row: 0.7, tone: "data" },
    ],
    edges: [
      { id: "e-bad", from: "bad", to: "scan", label: "bg- and -600" },
      { id: "e-good", from: "good", to: "scan", label: "bg-red-600" },
      { id: "e-out", from: "scan", to: "css", label: "known utilities" },
    ],
    steps: [
      {
        title: "Tailwind scans your files as plain text",
        note: "The Oxide scanner never runs or parses your code. It takes every word that could be a class name and asks one question: do I know a utility with this exact name?",
        appear: ["scan", "css"],
        focus: ["scan"],
      },
      {
        title: "A template string hides the class name",
        note: "In the broken badge the class is built from a variable. In the source file the scanner only sees the pieces bg- and -600. The full name bg-red-600 does not exist as text anywhere.",
        appear: ["bad", "e-bad"],
        focus: ["bad", "e-bad"],
        set: { scan: "sees bg- and -600" },
      },
      {
        title: "No utility matches, so no CSS is written",
        note: "Neither piece is a utility name, so the scanner ignores them. At run time the badge gets the class bg-red-600, but the stylesheet has no rule for it and the badge has no background.",
        focus: ["scan", "css"],
        set: { css: "nothing for red-600" },
      },
      {
        title: "Write every full class name out as text",
        note: "The fix is a lookup object. The strings bg-red-600 and bg-blue-600 appear in full in the source, and the code only picks one of them at run time.",
        appear: ["good", "e-good"],
        focus: ["good", "e-good"],
        set: { scan: "sees bg-red-600" },
      },
      {
        title: "The scanner finds a known utility and writes the CSS",
        note: "bg-red-600 is a real utility, so its rule is added to the output. Unused classes are never written, which is why the output stays small.",
        appear: ["e-out"],
        focus: ["e-out", "css"],
        set: { css: "bg-red-600 rule" },
      },
      {
        title: "A value that arrives at run time needs a CSS variable",
        note: "If the color comes from a database or a user setting, no class name can work. Write one full class that reads a variable, like bg-(--bg), and set the variable with an inline style.",
        focus: ["good", "scan", "css"],
        set: { good: "bg-(--bg) + style var", scan: "sees bg-(--bg)", css: "bg-(--bg) rule" },
      },
    ],
  },

  /* ---- lesson 3 ---- */
  "fullstack-qa-3-narrowing-closure": {
    kind: "trace",
    title: "Why TypeScript forgets a narrowing inside a callback",
    lang: "ts",
    varsTitle: "Type the checker believes",
    code: [
      "type User = { name: string };",
      "declare function get(): User | null;",
      "",
      "let user = get();",
      "if (user) {",
      "  const u = user;              // a const copy",
      "  console.log(user.name);",
      "  setTimeout(() => {",
      "    console.log(user.name);    // TS18047",
      "    console.log(u.name);",
      "  });",
      "}",
      "user = null;",
    ],
    steps: [
      {
        line: 4,
        vars: [["user", "User | null"]],
        title: "user starts as User or null",
        note: "get() may return nothing, so the variable has a union type. Reading user.name now would be an error.",
      },
      {
        line: 5,
        vars: [["user", "User"]],
        title: "The if check narrows user to User",
        note: "Inside the if block the checker knows that user is not null, so it treats the variable as User.",
      },
      {
        line: 6,
        vars: [["user", "User"], ["u", "User"]],
        title: "A const copy has one type for its whole life",
        note: "u is a const. It can never be reassigned, so its type stays User wherever you use it. Keep this in mind for the callback.",
      },
      {
        line: 7,
        vars: [["user", "User"], ["u", "User"]],
        title: "Reading user.name right here is fine",
        note: "No code can run between the check and this line, so the narrowing is still true.",
      },
      {
        line: [8, 9],
        vars: [["user", "User | null  (in the callback)"], ["u", "User"]],
        title: "Inside the callback the narrowing is lost: TS18047",
        note: "The callback runs later. Between now and then the variable could change, and the checker sees that user is reassigned further down. It cannot promise that user is still not null, so it reports 'possibly null'.",
      },
      {
        line: 13,
        vars: [["user", "null  (reassigned)"], ["u", "User"]],
        title: "The later assignment is the real cause",
        note: "Without the line user = null, the narrowing would stay valid in the callback. Any later assignment to a let variable makes the checker drop the narrowing inside closures.",
      },
      {
        line: 10,
        vars: [["user", "null  (reassigned)"], ["u", "User"]],
        title: "Fix: use the const copy inside the callback",
        note: "u is a const, so its narrowing never expires and u.name compiles. Declaring the original with const instead of let works too.",
      },
    ],
  },

  /* ---- lesson 4 ---- */
  "fullstack-qa-4-context-rerender": {
    kind: "flow",
    title: "Why a memoized consumer still re-renders on context change",
    nodes: [
      { id: "prov", label: "Provider", sub: "unrelated state changes", col: 0, row: 0.7, tone: "server" },
      { id: "ca", label: "Context A", sub: "value={{ n: 1 }}", col: 1.6, row: 0, tone: "warn" },
      { id: "cb", label: "Context B", sub: "value in useMemo", col: 1.6, row: 1.4, tone: "store" },
      { id: "ua", label: "Memo consumer A", sub: "renders: 1", col: 3.4, row: 0, tone: "client" },
      { id: "ub", label: "Memo consumer B", sub: "renders: 1", col: 3.4, row: 1.4, tone: "client" },
    ],
    edges: [
      { id: "e-pa", from: "prov", to: "ca", label: "value" },
      { id: "e-pb", from: "prov", to: "cb", label: "value" },
      { id: "e-ua", from: "ca", to: "ua", label: "reads" },
      { id: "e-ub", from: "cb", to: "ub", label: "reads" },
    ],
    steps: [
      {
        title: "Two memoized consumers read two contexts",
        note: "One provider feeds two contexts. Consumer A gets an object written inline in the value prop. Consumer B gets an object kept by useMemo. Both consumers are wrapped in memo and have rendered once.",
        appear: ["prov", "ca", "cb", "ua", "ub", "e-pa", "e-pb", "e-ua", "e-ub"],
        focus: ["prov"],
      },
      {
        title: "Unrelated state makes the provider render again",
        note: "The provider has some state that has nothing to do with the contexts, and it changes. Rendering the provider runs its code again, including the lines that build the values.",
        focus: ["prov"],
        set: { prov: "render 2" },
      },
      {
        title: "Inline value: a new object every time",
        note: "The braces create a fresh object on every render. React compares context values with Object.is, and a new object is a different value, even when it holds the same data.",
        focus: ["ca", "e-pa"],
        set: { ca: "new object" },
      },
      {
        title: "useMemo value: the same object comes back",
        note: "useMemo returns the stored object because nothing it depends on changed. The comparison says the value is the same, so this context does not notify its readers.",
        focus: ["cb", "e-pb"],
        set: { cb: "same object" },
      },
      {
        title: "memo does not stop a context update",
        note: "memo only skips renders that come from the parent. A context change reaches the consumer directly, so consumer A renders again even though its props did not change.",
        focus: ["ua", "e-ua"],
        set: { ua: "renders: 2" },
      },
      {
        title: "Consumer B does not render",
        note: "Its context value did not change, and its parent did not pass new props, so memo can skip the work.",
        focus: ["ub"],
      },
      {
        title: "Render the provider once more: 3 against 1",
        note: "A second unrelated change repeats the pattern. After two provider renders, consumer A has rendered 3 times and consumer B once. That is the measurement from the lesson.",
        focus: ["prov", "ua", "ub"],
        set: { prov: "render 3", ua: "renders: 3" },
      },
      {
        title: "The fixes, from simple to heavy",
        note: "Memoize the value with useMemo. Split one big context into a rarely changing one for actions and an often changing one for data. Or use a store with selectors, such as Zustand, so a component reads only its own slice.",
        focus: ["cb", "ub"],
      },
    ],
  },

  /* ---- lesson 5 ---- */
  "fullstack-qa-5-partial-prerender": {
    kind: "flow",
    title: "Partial Prerendering: one page, three kinds of parts",
    nodes: [
      { id: "page", label: "app/page.tsx", sub: "one route", col: 0, row: 0.8, tone: "plain" },
      { id: "h1", label: "Heading", sub: "static", col: 1.5, row: 0, tone: "store" },
      { id: "prod", label: "Products", sub: "use cache", col: 1.5, row: 1, tone: "data" },
      { id: "greet", label: "Greeting", sub: "reads cookies()", col: 1.5, row: 2, tone: "warn" },
      { id: "shell", label: "Static shell", sub: "built before any request", col: 3, row: 0.5, tone: "server" },
      { id: "browser", label: "Browser", sub: "a visitor", col: 4.4, row: 1.5, tone: "client" },
    ],
    edges: [
      { id: "e-h1", from: "page", to: "h1" },
      { id: "e-prod", from: "page", to: "prod" },
      { id: "e-greet", from: "page", to: "greet" },
      { id: "s-h1", from: "h1", to: "shell" },
      { id: "s-prod", from: "prod", to: "shell" },
      { id: "s-greet", from: "greet", to: "shell", label: "fallback only", dashed: true },
      { id: "e-shell", from: "shell", to: "browser", label: "sent at once" },
      { id: "e-stream", from: "greet", to: "browser", label: "streams in later" },
    ],
    steps: [
      {
        title: "Every route is prerendered as far as it can be",
        note: "You no longer choose static or dynamic per route. Next.js splits one page into parts, and each part is static, cached or dynamic.",
        appear: ["page", "h1", "prod", "greet", "e-h1", "e-prod", "e-greet"],
        focus: ["page"],
      },
      {
        title: "Static: rendered at build time",
        note: "A heading, a layout or a pure calculation never changes between visitors. It becomes part of the static shell with no extra work.",
        focus: ["h1"],
        set: { h1: "built at build time" },
      },
      {
        title: "Cached: rendered once, then reused",
        note: "The function marked with use cache runs once and its result is stored. It is reused until the lifetime from cacheLife runs out, then it is rebuilt.",
        focus: ["prod"],
        set: { prod: "stored, then reused" },
      },
      {
        title: "Dynamic: needs the request, so it cannot be built early",
        note: "cookies(), headers(), searchParams and uncached fetches only exist when a visitor arrives. This part must wait for the request and must sit inside a Suspense boundary.",
        focus: ["greet"],
        set: { greet: "waits for the request" },
      },
      {
        title: "The build assembles a static shell",
        note: "The shell holds the heading, the cached products and the Suspense fallback in place of the greeting. In the build output this route is marked with a half circle for a static shell plus streaming parts.",
        appear: ["shell", "s-h1", "s-prod", "s-greet"],
        focus: ["shell", "s-h1", "s-prod", "s-greet"],
      },
      {
        title: "A visitor gets the shell immediately",
        note: "The shell needs no work at request time, so it arrives fast, often straight from a CDN. The visitor sees the page with a loading placeholder where the greeting goes.",
        appear: ["browser", "e-shell"],
        focus: ["browser", "e-shell"],
        set: { browser: "sees page + loading" },
      },
      {
        title: "The dynamic part streams in",
        note: "Meanwhile the server renders the greeting with the visitor's cookies and streams it into the placeholder. The reader never waits for it to see the rest of the page.",
        appear: ["e-stream"],
        focus: ["greet", "e-stream", "browser"],
        set: { browser: "greeting arrives" },
      },
      {
        title: "Forget the Suspense boundary and the build fails",
        note: "If cookies() is read with no boundary around it, the build stops with an error that offers three ways out: stream it with Suspense, cache it with use cache, or allow a blocking route with instant set to false.",
        focus: ["greet", "s-greet"],
        set: { greet: "no Suspense = error" },
      },
    ],
  },

  /* ---- lesson 6 ---- */
  "fullstack-qa-6-node-order": {
    kind: "trace",
    title: "Node event loop: in what order do these five lines print?",
    lang: "js",
    varsTitle: "Waiting to run",
    code: [
      "// order.cjs (CommonJS)",
      'setTimeout(() => console.log("timeout"), 0);',
      'setImmediate(() => console.log("immediate"));',
      'process.nextTick(() => console.log("nextTick"));',
      'Promise.resolve().then(() => console.log("promise"));',
      'console.log("sync");',
      "// script ends, the event loop starts",
    ],
    steps: [
      {
        line: 2,
        vars: [["timers phase", "timeout"]],
        title: "setTimeout puts a callback in the timers phase",
        note: "Nothing runs yet. The callback waits for the timers phase and only runs when its time is due, which for 0 ms means as soon as the loop gets there.",
      },
      {
        line: 3,
        vars: [["timers phase", "timeout"], ["check phase", "immediate"]],
        title: "setImmediate puts a callback in the check phase",
        note: "The check phase comes right after the poll phase, which handles finished I/O. That is the whole job of setImmediate: run soon, after I/O.",
      },
      {
        line: 4,
        vars: [["timers phase", "timeout"], ["check phase", "immediate"], ["nextTick queue", "nextTick"]],
        title: "nextTick joins its own queue",
        note: "process.nextTick is not a phase. Its queue is emptied after the current script and again after every callback, before the loop moves on.",
      },
      {
        line: 5,
        vars: [["timers phase", "timeout"], ["check phase", "immediate"], ["nextTick queue", "nextTick"], ["microtasks", "promise"]],
        title: "A resolved promise puts its then in the microtask queue",
        note: "Promise callbacks wait in the microtask queue. In a CommonJS file the nextTick queue is emptied first, then the microtasks.",
      },
      {
        line: 6,
        out: "sync",
        title: "Synchronous code runs first, right now",
        note: "Everything above only scheduled work. The one console.log that runs at once is the plain call, so sync prints before anything else.",
      },
      {
        line: 7,
        out: "nextTick",
        vars: [["timers phase", "timeout"], ["check phase", "immediate"], ["microtasks", "promise"]],
        title: "The script ends: the nextTick queue drains first",
        note: "Before the loop turns even once, Node runs all nextTick callbacks. In an ES module file the order of this step and the next one would be swapped, because a module runs inside a promise job.",
      },
      {
        line: 7,
        out: "promise",
        vars: [["timers phase", "timeout"], ["check phase", "immediate"]],
        title: "Then the microtask queue drains",
        note: "The promise callback runs now. A nextTick that keeps scheduling more nextTicks would starve everything below, because this queue must be empty before the loop moves on.",
      },
      {
        line: 2,
        out: "timeout",
        vars: [["check phase", "immediate"]],
        title: "The loop starts: the timers phase runs the due timer",
        note: "From the main script the timer may or may not be due yet, since startup takes about a millisecond. That is why timeout and immediate can swap here.",
      },
      {
        line: 3,
        out: "immediate",
        vars: [],
        title: "The check phase runs setImmediate",
        note: "Inside an I/O callback the order is fixed and setImmediate always wins, because the loop is in the poll phase and the check phase comes right next.",
      },
    ],
  },

  /* ---- lesson 7 ---- */
  "fullstack-qa-7-replica-election": {
    kind: "seq",
    title: "A MongoDB replica set loses its primary",
    actors: [
      { name: "Client", sub: "w: majority" },
      { name: "Primary A", sub: "takes writes" },
      { name: "Secondary B", sub: "copies A" },
      { name: "Secondary C", sub: "copies A" },
    ],
    steps: [
      { from: 0, to: 1, label: "insert, w: majority", title: "The client writes with a majority write concern", note: "Writes go to the primary. w majority tells it not to say OK until a majority of the voting members have the write, not only itself." },
      { from: 1, to: 2, label: "replicate the write", title: "The primary copies the write to a secondary", note: "Secondaries read the primary's log and apply the same changes. The copy to B is enough here, because 2 out of 3 members is a majority." },
      { from: 2, to: 1, label: "I have it", title: "The secondary confirms", note: "Now A and B both hold the write. A write held by a majority will survive a failover." },
      { from: 1, to: 0, label: "OK: A and B have it", title: "Only now does the client get its OK", note: "With w 1, the primary would have said OK at once. If it then failed before copying the write, the write could be rolled back later. Majority avoids that surprise." },
      { from: 1, to: 1, self: true, label: "primary stops answering", title: "The primary goes down", note: "From this moment there is no primary, so the replica set accepts no writes. Reads and writes to the old primary fail until a new one is chosen." },
      { from: 2, to: 2, self: true, label: "no heartbeat for 10 s", title: "A secondary notices the silence", note: "By default a secondary calls an election when it has heard nothing from the primary for 10 seconds (electionTimeoutMillis). The docs say a new primary usually takes under about 12 seconds." },
      { from: 2, to: 3, label: "vote for me?", title: "It asks the other voting member for a vote", note: "An election needs a majority of the voting members. That is why you use an odd number of members: with 3 you can lose 1 and still hold an election." },
      { from: 3, to: 2, label: "yes: 2 of 3 is a majority", title: "B wins and becomes the new primary", note: "B votes for itself and C agrees, so B has 2 of 3 votes. An arbiter would vote too but holds no data, which weakens w majority, so avoid it when you can." },
      { from: 0, to: 2, label: "insert, w: majority", title: "Writes work again against the new primary", note: "The driver finds the new primary and the client writes as before. The write from step 1 is safe, because B already had it." },
    ],
  },

  /* ---- lesson 8 ---- */
  "fullstack-qa-8-migration-drift": {
    kind: "flow",
    title: "Prisma migrate: how drift hides from migrate status",
    nodes: [
      { id: "files", label: "Migrations", sub: "SQL files", col: 0, row: 0, tone: "store" },
      { id: "hist", label: "History table", sub: "applied list", col: 0, row: 2, tone: "data" },
      { id: "shadow", label: "Shadow DB", sub: "temporary copy", col: 2.2, row: 0, tone: "queue" },
      { id: "dev", label: "Dev database", sub: "your real tables", col: 2.2, row: 2, tone: "data" },
      { id: "hand", label: "Manual ALTER", sub: "ADD COLUMN views", col: 4.4, row: 2, tone: "warn" },
    ],
    edges: [
      { id: "e-rec", from: "files", to: "hist", label: "status compares", both: true },
      { id: "e-replay", from: "files", to: "shadow", label: "replay all files" },
      { id: "e-cmp", from: "shadow", to: "dev", label: "dev compares", both: true },
      { id: "e-hand", from: "hand", to: "dev", label: "by hand" },
    ],
    steps: [
      {
        title: "Two records of what has been applied",
        note: "The migration files hold the SQL. The history table (_prisma_migrations) in the database remembers which files ran. migrate status only compares these two.",
        appear: ["files", "hist", "e-rec"],
        focus: ["files", "hist"],
      },
      {
        title: "migrate dev replays every file in a shadow database",
        note: "Prisma creates a temporary shadow database and runs all migration files in it, so it knows what the schema should look like. This is why your local user needs the right to create databases.",
        appear: ["shadow", "e-replay"],
        focus: ["shadow", "e-replay"],
      },
      {
        title: "It compares the shadow database with your dev database",
        note: "If both look the same, there is nothing to do. If they differ, you have drift: the real database no longer matches what the migration history says.",
        appear: ["dev", "e-cmp"],
        focus: ["e-cmp"],
        set: { shadow: "same tables", dev: "same tables" },
      },
      {
        title: "Someone changes the database by hand",
        note: "A teammate runs ALTER TABLE to add a views column, with no migration file. The real table now has a column that no file knows about.",
        appear: ["hand", "e-hand"],
        focus: ["hand", "e-hand", "dev"],
        set: { dev: "has extra column views" },
      },
      {
        title: "migrate status still says: up to date",
        note: "It only compares migration files with the history table, and those did not change. It never looks at the real tables, so it cannot see the manual change.",
        focus: ["e-rec", "files", "hist"],
        set: { hist: "Up to date!" },
      },
      {
        title: "migrate dev finds the drift",
        note: "The shadow database has no views column and the dev database has one. Prisma reports drift and offers a reset, which drops all your local data.",
        focus: ["e-cmp", "shadow", "dev"],
        set: { shadow: "no views column" },
      },
      {
        title: "The safe fix: write it down, then mark it applied",
        note: "Add views to the schema and put the matching ALTER TABLE into a new migration folder. Then run migrate resolve with applied, so Prisma records it without running it again. In production you never want a reset.",
        focus: ["files", "hist"],
        set: { files: "+ views migration", hist: "views recorded" },
      },
      {
        title: "The replay now includes the column, so it all matches",
        note: "The shadow database gets the views column from the new file, and the comparison finds nothing to change. migrate dev says it is already in sync, and nobody lost any data.",
        focus: ["e-replay", "shadow", "e-cmp"],
        set: { shadow: "has views column", dev: "in sync" },
      },
    ],
  },

  /* ---- lesson 9 ---- */
  "fullstack-qa-9-hasura-compiler": {
    kind: "flow",
    title: "How Hasura turns one GraphQL query into one SQL statement",
    nodes: [
      { id: "client", label: "Client", sub: "role: user", col: 0, row: 0, tone: "client" },
      { id: "parse", label: "GraphQL AST", sub: "parsed query", col: 1.5, row: 0, tone: "server" },
      { id: "comp", label: "SQL AST", sub: "compiler output", col: 3, row: 0, tone: "server" },
      { id: "pg", label: "PostgreSQL", sub: "runs it", col: 4.5, row: 0, tone: "data" },
      { id: "perm", label: "Permission", sub: "user_id = X-Hasura-User-Id", col: 3, row: 1.5, tone: "warn" },
      { id: "res", label: "JSON result", sub: "shape of the query", col: 4.5, row: 1.5, tone: "store" },
    ],
    edges: [
      { id: "e1", from: "client", to: "parse", label: "query + token" },
      { id: "e2", from: "parse", to: "comp", label: "compile" },
      { id: "e3", from: "comp", to: "pg", label: "one SQL" },
      { id: "e4", from: "perm", to: "comp", label: "row filter" },
      { id: "e5", from: "pg", to: "res", label: "rows as JSON" },
    ],
    steps: [
      {
        title: "A client sends a query with its role",
        note: "The request carries a GraphQL query for users and their orders, plus a role and a user id in the session variables. Hasura has one GraphQL schema per role.",
        appear: ["client"],
        focus: ["client"],
      },
      {
        title: "Hasura parses the query into a tree",
        note: "An AST is the parsed structure of the query. Nothing has run yet, and no code is waiting to fetch each field.",
        appear: ["parse", "e1"],
        focus: ["parse", "e1"],
      },
      {
        title: "A compiler, not a chain of resolvers",
        note: "Hasura does not run a function per field. It compiles the whole GraphQL tree into a SQL tree, so a query with any depth becomes a single statement.",
        appear: ["comp", "e2"],
        focus: ["comp", "e2"],
      },
      {
        title: "The permission filter goes inside the SQL",
        note: "The row filter for the role user, here user_id equals X-Hasura-User-Id, is written into the statement itself. The client cannot skip it. A wrong filter is a data leak, so review it before launch.",
        appear: ["perm", "e4"],
        focus: ["perm", "e4", "comp"],
      },
      {
        title: "One statement, one round trip",
        note: "The nesting happens inside the database with json_agg and row_to_json. Because users and their orders come back together, the N+1 problem does not appear for database relationships.",
        appear: ["pg", "e3"],
        focus: ["pg", "e3"],
        set: { pg: "one round trip" },
      },
      {
        title: "The database builds the JSON for you",
        note: "Postgres returns rows already shaped like the GraphQL answer, so Hasura mostly passes the result along.",
        appear: ["res", "e5"],
        focus: ["res", "e5"],
      },
      {
        title: "The cost moves to the database",
        note: "Indexes on the join and filter columns now matter a lot. The Analyze button in the Console shows the generated SQL and its plan. Remote relationships to another API are not SQL joins, so N+1 can still appear there.",
        focus: ["pg"],
        set: { pg: "needs indexes" },
      },
    ],
  },
  // ---- end 0-19 ----
};
