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
    title: "Call Stack and Code Execution",
    summary:
      "Trace function calls step by step as contexts are pushed and popped, and watch it happen live in Node and Chrome DevTools.",
    readTime: "10 min",
    published: false,
  },
  {
    number: 3,
    slug: "lesson-3",
    title: "Hoisting: var, let, const and Functions",
    summary:
      "Why you can call a function before it is written, why var gives undefined, and how to predict the output of hoisted code before running it.",
    readTime: "10 min",
    published: false,
  },
  {
    number: 4,
    slug: "lesson-4",
    title: "Functions and Variable Environments",
    summary:
      "Each function call gets its own execution context with its own memory. What that means for variables with the same name in different functions.",
    readTime: "9 min",
    published: false,
  },
  {
    number: 5,
    slug: "lesson-5",
    title: "Window Object and Global this",
    summary:
      "What the engine creates before your first line runs: the global object, the global this, and why var on the top level ends up on window.",
    readTime: "7 min",
    published: false,
  },
  {
    number: 6,
    slug: "lesson-6",
    title: "undefined vs. Not Defined",
    summary:
      "undefined is a placeholder, not an absence. The difference between the two, and why JavaScript is called loosely typed.",
    readTime: "6 min",
    published: false,
  },
  {
    number: 7,
    slug: "lesson-7",
    title: "Scope Chain and Lexical Environment",
    summary:
      "How the engine finds a variable: the lexical environment, the reference to the parent, and tracing a lookup through nested scopes until it hits null.",
    readTime: "12 min",
    published: false,
  },
  {
    number: 8,
    slug: "lesson-8",
    title: "let, const, var and the Temporal Dead Zone",
    summary:
      "let and const are hoisted too — just somewhere else. The Temporal Dead Zone, the three kinds of errors, and why let/const behave differently from var.",
    readTime: "11 min",
    published: false,
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
