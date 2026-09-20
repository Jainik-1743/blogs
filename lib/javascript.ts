import type { Lesson } from "./lessons";

export const JS_SERIES = {
  slug: "javascript",
  title: "JavaScript Core Mastery",
  tagline:
    "A lesson-by-lesson deep dive into how JavaScript actually runs under the hood — execution context, call stack, scope, closures, this, and the event loop. Pure execution-model JavaScript: no array methods, no framework code.",
  started: "2026",
};

/**
 * Single source of truth for the JavaScript series. The index page, and every
 * future breadcrumb and prev/next pager, is generated from this list.
 */
export const JS_LESSONS: Lesson[] = [
  {
    number: 1,
    slug: "lesson-1",
    title: "How JS Works: The Execution Context",
    summary:
      "Everything in JavaScript happens inside an execution context. How the global one is created — memory phase first, then code phase — and why that order explains almost everything that follows.",
    readTime: "12 min",
    published: true,
  },
  {
    number: 2,
    slug: "lesson-2",
    title: "The Call Stack",
    summary:
      "JavaScript can only ever do one thing at a time. This is the structure that decides exactly what runs right now, what's paused and waiting its turn, and what happens the moment a function calls itself one time too many.",
    readTime: "12 min",
    published: true,
  },
  {
    number: 3,
    slug: "lesson-3",
    title: "Var, Let, and Const",
    summary:
      "All three get hoisted. What happens after that — what value they start with, where they're actually stored in memory, and when you're allowed to touch them — is where they completely part ways.",
    readTime: "12 min",
    published: true,
  },
  {
    number: 4,
    slug: "lesson-4",
    title: "Functions and Variable Environments",
    summary:
      "Every function call gets its own private notepad of variables — even the same function, called twice, never shares a page. This lesson is about exactly what goes in that notepad, who's allowed to read it, and when it gets thrown away.",
    readTime: "10 min",
    published: true,
  },
  {
    number: 5,
    slug: "lesson-5",
    title: "Window and Global This",
    summary:
      "Even a completely empty JS file isn't really empty — the engine still builds a global object and points a keyword called this straight at it. Here's exactly what gets built, what it's called in different places, and the one rule that quietly changes depending on strict mode.",
    readTime: "9 min",
    published: true,
  },
  {
    number: 6,
    slug: "lesson-6",
    title: "Undefined vs Not Defined",
    summary:
      "These sound like the same complaint — \"there's nothing there\" — but JavaScript treats them as two completely different situations, one safe and expected, the other a genuine error. Mixing them up is one of the most common small misunderstandings in the language.",
    readTime: "9 min",
    published: true,
  },
  {
    number: 7,
    slug: "lesson-7",
    title: "Scope Chain and Lexical Environment",
    summary:
      "Lesson 4 showed one function looking outward to Global. This lesson extends that into a full chain — as many levels deep as your code is nested — and gives it a proper name: lexical scope, decided entirely by where you physically wrote your code, never by which function called which.",
    readTime: "11 min",
    published: true,
  },
  {
    number: 8,
    slug: "lesson-8",
    title: "The Temporal Dead Zone, In Full",
    summary:
      "Lesson 3 introduced the TDZ. This lesson goes further: what happens when you redeclare a variable, why some mistakes crash your whole file before a single line runs, and a genuine exception to the \"typeof is always safe\" rule from Lesson 6.",
    readTime: "10 min",
    published: true,
  },
  {
    number: 9,
    slug: "lesson-9",
    title: "Block Scope and Shadowing",
    summary:
      "What a pair of curly braces actually does, which declarations respect it, and the rules for shadowing a variable legally and illegally.",
    readTime: "9 min",
    published: false,
  },
  {
    number: 10,
    slug: "lesson-10",
    title: "Closures",
    summary:
      "A function bundled with its lexical scope. Closure-based examples you can run, the real use cases, and the memory cost of keeping a scope alive.",
    readTime: "14 min",
    published: false,
  },
  {
    number: 11,
    slug: "lesson-11",
    title: "setTimeout and Closures: The Interview Classic",
    summary:
      "Print 1 to 5 with a one-second gap. Why the var version prints 6 five times, and the two fixes that show you understand closures.",
    readTime: "10 min",
    published: false,
  },
  {
    number: 12,
    slug: "lesson-12",
    title: "First-Class Functions, Callbacks and Event Listeners",
    summary:
      "Functions as values: passing them as arguments, returning them, callbacks, and attaching and removing event listeners without leaking memory.",
    readTime: "12 min",
    published: false,
  },
  {
    number: 13,
    slug: "lesson-13",
    title: "JS Engine and V8 Architecture",
    summary:
      "Parser, interpreter (Ignition), compiler (TurboFan), memory heap and garbage collection — what the engine does between your file and the CPU.",
    readTime: "13 min",
    published: false,
  },
  {
    number: 14,
    slug: "lesson-14",
    title: "Async JS and the Event Loop",
    summary:
      "Call stack, Web APIs, callback queue, microtask queue and the event loop that ties them together — plus starvation, and why setTimeout(0) is not 0.",
    readTime: "16 min",
    published: false,
  },
];

export function jsLessonHref(lesson: Lesson): string {
  return `/${JS_SERIES.slug}/${lesson.slug}`;
}
