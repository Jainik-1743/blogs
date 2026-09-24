import type { Lesson } from "./lessons";

export const JS_SERIES = {
  slug: "javascript",
  title: "JavaScript Core Mastery",
  tagline:
    "A lesson-by-lesson deep dive into how JavaScript actually runs under the hood — execution context, call stack, scope, closures, this, and the event loop. Pure execution-model JavaScript: no array methods, no framework code.",
  started: "2026",
  /** The site default; see the accent rules in globals.css. */
  accent: "sky",
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
    title: "let, const, var and the Temporal Dead Zone",
    summary:
      "The full picture of the three declaration keywords: every axis they differ on, function scope versus block scope (and what loops do), exactly where the TDZ starts and ends and why it is temporal rather than positional, the places it hides, redeclaration, errors that stop your file before it runs, and the one exception to \"typeof is always safe\".",
    readTime: "18 min",
    published: true,
  },
  {
    number: 9,
    slug: "lesson-9",
    title: "Block Scope and Shadowing",
    summary:
      "A block is anything inside { }. Simple idea — but var and let react to that boundary in completely different, and sometimes dangerous, ways. What a block creates in memory, how nested blocks chain, and every shadowing rule — legal, illegal, and the function-boundary exception.",
    readTime: "14 min",
    published: true,
  },
  {
    number: 10,
    slug: "lesson-10",
    title: "Closures",
    summary:
      "A function that remembers where it was born — even after the place it was born in is gone. This is the one exception to \"popped execution context = memory freed\" that Lesson 2 promised we'd come back to.",
    readTime: "13 min",
    published: true,
  },
  {
    number: 11,
    slug: "lesson-11",
    title: "setTimeout and Closures: The Interview Classic",
    summary:
      "One loop, one setTimeout, one wrong answer almost everyone gives the first time. This lesson is dedicated entirely to the single most-asked closures question in JavaScript interviews — and four different, genuinely correct ways to fix it.",
    readTime: "12 min",
    published: true,
  },
  {
    number: 12,
    slug: "lesson-12",
    title: "First-Class Functions, Callbacks and Event Listeners",
    summary:
      "Functions as values: passing them as arguments, returning them from other functions, sync vs async callbacks stepped side by side, and attaching and removing event listeners without leaking memory.",
    readTime: "14 min",
    published: true,
  },
  {
    number: 13,
    slug: "lesson-13",
    title: "JS Engine and V8 Architecture",
    summary:
      "Parser, interpreter (Ignition), compiler (TurboFan), memory heap and garbage collection — what the engine does between your file and the CPU. Watch a function climb V8's tiers and fall back on a deopt, and step through mark-and-sweep.",
    readTime: "16 min",
    published: true,
  },
  {
    number: 14,
    slug: "lesson-14",
    title: "Async JS and the Event Loop",
    summary:
      "Call stack, Web APIs, callback queue, microtask queue and the event loop that ties them together, stepped tick by tick — plus async/await, where rendering fits, starvation, and why setTimeout(0) is not 0.",
    readTime: "20 min",
    published: true,
  },
];

/** Standalone background reading that sits beside the numbered lessons. */
export type JsReading = {
  slug: string;
  title: string;
  summary: string;
  readTime?: string;
};

export const JS_READINGS: JsReading[] = [
  {
    slug: "recap",
    title: "Core JavaScript: The Last-Minute Recap",
    summary:
      "All 14 lessons, compressed into one read for the morning of an interview — concept, a runnable example with its real output, and a ready-made spoken answer for each, plus an output-prediction drill and rapid-fire Q&A.",
    readTime: "30 min",
  },
];

export function jsReadingHref(reading: JsReading): string {
  return `/${JS_SERIES.slug}/${reading.slug}`;
}

export function jsLessonHref(lesson: Lesson): string {
  return `/${JS_SERIES.slug}/${lesson.slug}`;
}
