import type { Glossary, GlossaryEntry } from "./glossary";

/**
 * Every term the JavaScript series leans on, with a one-line meaning and the lesson that
 * explains it. Hovering (or tapping) any of these inside a /javascript lesson shows the entry
 * in place; the full list is rendered at /javascript/glossary.
 *
 * Capitalised terms (GEC, TDZ, V8 …) are marked everywhere they appear. Lowercase ones
 * (closure, scope, hoisting …) are marked only on their first use per page.
 */
const ENTRIES: GlossaryEntry[] = [
  // ── Execution model ────────────────────────────────────────────────────
  { term: "execution context", aliases: ["Execution context", "execution contexts", "Execution Context"], full: "Execution context", desc: "The container the engine builds before running any code: a memory half (variables and functions) and a code half (the line currently running). Every function call gets its own.", lesson: 1, group: "Execution model" },
  { term: "GEC", aliases: ["global execution context", "Global execution context", "Global Execution Context"], full: "Global Execution Context", desc: "The very first execution context, created when the file starts and destroyed only when the program ends. It sits at the bottom of the call stack the whole time.", lesson: 1, group: "Execution model" },
  { term: "memory component", aliases: ["variable environment", "Variable environment"], full: "Memory component / variable environment", desc: "The half of an execution context that stores every variable and function as a key → value pair. Filled completely before any code runs.", lesson: 1, group: "Execution model" },
  { term: "code component", aliases: ["thread of execution", "Thread of execution"], full: "Code component / thread of execution", desc: "The half of an execution context that runs your code one line at a time, top to bottom.", lesson: 1, group: "Execution model" },
  { term: "memory creation phase", aliases: ["Memory creation phase", "memory phase"], full: "Memory creation phase", desc: "Phase 1 of every execution context. The engine scans the code without running it: every var gets undefined, every function declaration gets its whole body.", lesson: 1, group: "Execution model" },
  { term: "code execution phase", aliases: ["Code execution phase", "code phase"], full: "Code execution phase", desc: "Phase 2. The engine goes back to line 1 and runs the code for real, replacing each undefined placeholder with its actual value.", lesson: 1, group: "Execution model" },
  { term: "call stack", aliases: ["Call stack", "Call Stack"], full: "Call stack", desc: "The stack of execution contexts. The one on top is running; a function call pushes a new one, return pops it. Also called the execution context stack, program stack or runtime stack.", lesson: 2, group: "Execution model" },
  { term: "invocation", aliases: ["function invocation", "invoked"], full: "Function invocation", desc: "Calling a function with parentheses: square(4). It creates a brand-new execution context and pushes it onto the call stack.", lesson: 1, group: "Execution model" },
  { term: "single-threaded", aliases: ["Single-threaded"], full: "Single-threaded", desc: "JavaScript has exactly one call stack, so it can run exactly one line at a time. Everything that looks parallel is queued around that one thread.", lesson: 1, group: "Execution model" },
  { term: "synchronous", aliases: ["Synchronous"], full: "Synchronous", desc: "Each line finishes before the next one starts. The engine never skips ahead; it can only wait or move on to the next line.", lesson: 1, group: "Execution model" },
  { term: "hoisting", aliases: ["Hoisting", "hoisted"], full: "Hoisting", desc: "The effect of the memory creation phase: names exist before the line that declares them. Functions are fully usable early; var reads as undefined; let and const throw until their line runs.", lesson: 3, group: "Execution model" },
  { term: "window", aliases: ["global object", "Global object"], full: "Global object (window in browsers, globalThis everywhere)", desc: "The object the engine creates alongside the global execution context. Top-level var and function declarations become its properties; at top level, this points to it.", lesson: 5, group: "Execution model" },
  { term: "not defined", full: "ReferenceError: x is not defined", desc: "The name was never given any memory at all. Different from undefined, which means the slot exists but has no value yet.", lesson: 6, group: "Execution model" },
  { term: "loosely typed", aliases: ["Loosely typed", "dynamically typed"], full: "Loosely (dynamically) typed", desc: "A variable has no fixed type: the same slot can hold a number, then a string, then a function. The type belongs to the value, not the variable.", lesson: 6, group: "Execution model" },

  // ── Scope ──────────────────────────────────────────────────────────────
  { term: "scope", aliases: ["Scope"], full: "Scope", desc: "Where a variable can be seen from. A function can see its own variables and everything its parents can see, but not the other way round.", lesson: 7, group: "Scope" },
  { term: "lexical environment", aliases: ["Lexical environment", "Lexical Environment"], full: "Lexical environment", desc: "A context's own memory plus a reference to the memory of the context it was written inside. “Lexical” means “decided by where the code sits in the file”.", lesson: 7, group: "Scope" },
  { term: "scope chain", aliases: ["Scope chain"], full: "Scope chain", desc: "The path the engine walks to find a variable: this context's memory, then its parent's, then the parent's parent, until it hits the global one and then null.", lesson: 7, group: "Scope" },
  { term: "TDZ", aliases: ["Temporal Dead Zone", "temporal dead zone"], full: "Temporal Dead Zone", desc: "The stretch between the start of a scope and the line that declares a let or const. The name is hoisted but reading it throws a ReferenceError.", lesson: 8, group: "Scope" },
  { term: "block scope", aliases: ["Block scope"], full: "Block scope", desc: "Anything inside a pair of curly braces { }. let and const belong to the block they are declared in; var ignores blocks and belongs to the function.", lesson: 9, group: "Scope" },
  { term: "shadowing", aliases: ["Shadowing", "shadow"], full: "Variable shadowing", desc: "Declaring a variable in an inner scope with the same name as one outside. The inner one hides the outer one until the inner scope ends.", lesson: 9, group: "Scope" },
  { term: "closure", aliases: ["closures", "Closure", "Closures"], full: "Closure", desc: "A function bundled with the lexical environment it was written in. It keeps that environment alive even after the outer function has returned.", lesson: 10, group: "Scope" },

  // ── Functions ──────────────────────────────────────────────────────────
  { term: "function declaration", aliases: ["Function declaration", "function declarations"], full: "Function declaration", desc: "function square() { … } written as a statement. Fully hoisted: the whole body is in memory before line 1 runs.", lesson: 1, group: "Functions" },
  { term: "function expression", aliases: ["Function expression", "function expressions"], full: "Function expression", desc: "A function stored in a variable: const square = function () { … }. Hoisted like a variable, not like a function — calling it early fails.", lesson: 3, group: "Functions" },
  { term: "arrow function", aliases: ["Arrow function", "arrow functions"], full: "Arrow function", desc: "The () => { … } syntax. Shorter, and it does not get its own this — it uses the this of the code around it.", lesson: 12, group: "Functions" },
  { term: "first-class functions", aliases: ["First-class functions", "first-class citizens"], full: "First-class functions", desc: "Functions are values: they can be stored in variables, passed as arguments and returned from other functions, like any number or string.", lesson: 12, group: "Functions" },
  { term: "higher-order function", aliases: ["Higher-order function", "higher-order functions"], full: "Higher-order function", desc: "A function that takes another function as an argument or returns one. setTimeout, addEventListener and array.map are all higher-order.", lesson: 12, group: "Functions" },
  { term: "callback", aliases: ["callbacks", "Callback"], full: "Callback function", desc: "A function you hand to someone else to call later — when a timer fires, a click happens or a request finishes.", lesson: 12, group: "Functions" },
  { term: "event listener", aliases: ["event listeners", "Event listener"], full: "Event listener", desc: "A callback attached to an element with addEventListener. It holds a closure over its surroundings, which is why forgetting to remove one can leak memory.", lesson: 12, group: "Functions" },
  { term: "parameter", aliases: ["parameters", "Parameter"], full: "Parameter", desc: "The name in the function definition (num in function square(num)). Just a local variable of that call's execution context, filled from the argument.", lesson: 1, group: "Functions" },
  { term: "argument", aliases: ["arguments", "Argument"], full: "Argument", desc: "The value you actually pass when calling: square(4). It is copied into the matching parameter.", lesson: 1, group: "Functions" },

  // ── Async ──────────────────────────────────────────────────────────────
  { term: "event loop", aliases: ["Event loop", "Event Loop"], full: "Event loop", desc: "A tiny loop that watches the call stack and, whenever it is empty, moves the next waiting callback from a queue onto the stack.", lesson: 14, group: "Async" },
  { term: "Web APIs", aliases: ["Web API", "web APIs"], full: "Web APIs (browser-provided)", desc: "setTimeout, fetch, DOM events, localStorage — features the browser gives JavaScript that are not part of the language itself. Node provides its own equivalents.", lesson: 14, group: "Async" },
  { term: "callback queue", aliases: ["Callback queue", "task queue", "macrotask queue"], full: "Callback (task) queue", desc: "Where finished timers and events wait for the call stack to empty. The event loop takes from it one callback at a time.", lesson: 14, group: "Async" },
  { term: "microtask queue", aliases: ["Microtask queue", "microtasks"], full: "Microtask queue", desc: "A higher-priority queue for promise callbacks. It is fully drained before the event loop takes anything from the callback queue.", lesson: 14, group: "Async" },
  { term: "starvation", aliases: ["Starvation"], full: "Starvation", desc: "When microtasks keep adding more microtasks, so the callback queue never gets a turn and timers and clicks stall.", lesson: 14, group: "Async" },
  { term: "setTimeout", full: "setTimeout(callback, ms)", desc: "Ask the browser to run a callback after at least ms milliseconds. “At least”, because the callback still has to wait for an empty call stack.", lesson: 11, group: "Async" },
  { term: "promise", aliases: ["promises", "Promise", "Promises"], full: "Promise", desc: "An object standing in for a value that will arrive later. Its .then callbacks go to the microtask queue.", lesson: 14, group: "Async" },

  // ── Engine ─────────────────────────────────────────────────────────────
  { term: "V8", full: "V8 JavaScript engine", desc: "Google's engine, used by Chrome and Node.js. It parses, interprets and compiles your JavaScript into machine code.", lesson: 13, group: "Engine" },
  { term: "JIT", aliases: ["just-in-time"], full: "Just-In-Time compilation", desc: "Start by interpreting code so it runs immediately, then compile the hot parts to fast machine code while the program is running.", lesson: 13, group: "Engine" },
  { term: "Ignition", full: "Ignition (V8's interpreter)", desc: "The part of V8 that turns your code into bytecode and starts running it straight away.", lesson: 13, group: "Engine" },
  { term: "TurboFan", full: "TurboFan (V8's optimising compiler)", desc: "The part of V8 that watches which functions run often and compiles those into optimised machine code.", lesson: 13, group: "Engine" },
  { term: "memory heap", aliases: ["Memory heap", "heap"], full: "Memory heap", desc: "Where objects, arrays and function bodies live. Unstructured, unlike the stack; cleaned by the garbage collector.", lesson: 13, group: "Engine" },
  { term: "garbage collection", aliases: ["Garbage collection", "garbage collector"], full: "Garbage collection", desc: "The engine automatically frees memory for anything nothing can reach any more. V8's collector is called Orinoco.", lesson: 13, group: "Engine" },
  { term: "AST", full: "Abstract Syntax Tree", desc: "The tree the parser builds from your source text before anything runs. Every token becomes a node.", lesson: 13, group: "Engine" },
  { term: "ECMAScript", aliases: ["ES spec", "the spec"], full: "ECMAScript specification", desc: "The written standard that defines the JavaScript language. Engines like V8 implement it; browsers add the Web APIs on top.", lesson: 13, group: "Engine" },

  // ── Tools ──────────────────────────────────────────────────────────────
  { term: "Node.js", aliases: ["Node"], full: "Node.js", desc: "V8 plus a set of server-side APIs (files, network) so JavaScript can run outside a browser.", lesson: 1, group: "Tools" },
  { term: "DevTools", aliases: ["Chrome DevTools"], full: "Chrome DevTools", desc: "The panel behind F12. The Sources tab shows the call stack and every scope's variables while paused on a breakpoint.", lesson: 1, group: "Tools" },
  { term: "breakpoint", aliases: ["breakpoints", "Breakpoint"], full: "Breakpoint", desc: "A marker on a line that pauses execution when reached, so you can inspect memory and the call stack at that exact moment.", lesson: 1, group: "Tools" },
  { term: "debugger", full: "debugger statement", desc: "Writing debugger; in code acts like a breakpoint whenever DevTools or the Node inspector is open.", lesson: 1, group: "Tools" },
  { term: "REPL", full: "Read–Eval–Print Loop", desc: "The interactive prompt you get from typing node with no file: type a line, see the result, repeat.", lesson: 1, group: "Tools" },
];

export const JS_GLOSSARY: Glossary = {
  series: "javascript",
  seriesTitle: "JavaScript Core Mastery",
  groups: ["Execution model", "Scope", "Functions", "Async", "Engine", "Tools"],
  entries: ENTRIES,
};
