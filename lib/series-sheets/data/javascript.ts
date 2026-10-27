import type { CheatSheet } from "../types.ts";

/** Cheat sheet for the "javascript" series. See scripts/SERIES-SHEETS.md. */
export const SHEET: CheatSheet | null = {
  intro:
    "How JavaScript really runs: execution contexts, the call stack, hoisting, scope, closures, the engine and the event loop. Built for the night before an interview. The same model explains most traps.",
  sections: [
    {
      title: "Execution context",
      lesson: 1,
      blocks: [
        {
          kind: "points",
          items: [
            "Everything runs inside an **execution context**: a **memory** half (variable environment, key to value pairs) and a **code** half (thread of execution).",
            "The global context is created first. **Every function call** makes a new context, deleted when the call ends.",
            "Phase 1, **memory creation**: `var` gets `undefined`, a function declaration gets its whole body. Phase 2, **code execution**: line by line.",
          ],
        },
        {
          kind: "code",
          lang: "js",
          code: "console.log(a);        // undefined\nconsole.log(greet());  // \"hello\"\nvar a = 10;\nfunction greet() { return \"hello\"; }",
          note: "Memory phase explains why both lines run without errors.",
        },
        {
          kind: "callout",
          tone: "tip",
          text: "JavaScript is **synchronous and single-threaded**: one stack, one command at a time. Async work happens outside the engine (Lesson 14).",
        },
      ],
    },
    {
      title: "Call stack",
      lesson: 2,
      blocks: [
        {
          kind: "points",
          items: [
            "A **stack** (LIFO): **push** a context on a call, **pop** it when the function finishes (last line or `return`).",
            "The global context is at the bottom and is popped once, at the very end.",
            "Same function called 3 times = 3 separate contexts that share nothing.",
            "Stack trace: read **top to bottom**. The top is the deepest, most recent call.",
          ],
        },
        {
          kind: "code",
          lang: "js",
          code: "function f() { return f(); }\nf();   // no stop condition\n// RangeError: Maximum call stack\n// size exceeded",
          note: "A stack overflow: recursion with no stopping point.",
        },
      ],
    },
    {
      title: "var, let, const and the TDZ",
      lesson: 3,
      blocks: [
        {
          kind: "table",
          head: ["Topic", "var", "let", "const"],
          rows: [
            ["Scope", "Function", "Block", "Block"],
            ["Hoisted", "Yes, as `undefined`", "Yes, but locked (TDZ)", "Yes, but locked (TDZ)"],
            ["Redeclare", "Allowed", "SyntaxError", "SyntaxError"],
            ["Reassign", "Yes", "Yes", "No (`TypeError`)"],
            ["On `window`", "Yes", "No", "No"],
          ],
        },
        {
          kind: "points",
          items: [
            "**TDZ** (temporal dead zone): from the top of the scope until the declaration runs. Reading throws `ReferenceError: Cannot access before initialization`.",
            "`const` locks the **binding**, not the value: `obj.x = 1` still works. `Object.freeze` is shallow.",
            "`let` and `const` live in a declarative record, `var` in the global object. That is why `let` stopped global name clashes.",
          ],
        },
      ],
    },
    {
      title: "Function scope vs block scope",
      lesson: 4,
      blocks: [
        {
          kind: "points",
          items: [
            "Each call gets its **own variable environment**: two functions with `var x` never clash.",
            "Access goes **outward** through the outer reference, never sideways. Parameters are set in the memory phase.",
            "After a function returns, its environment is freed, unless a **closure** still holds it.",
          ],
        },
        {
          kind: "code",
          lang: "js",
          code: "for (var i = 0; i < 3; i++) {}\nconsole.log(i);   // 3, var ignores block\nfor (let j = 0; j < 3; j++) {}\nconsole.log(j);   // ReferenceError",
          note: "`let` makes a fresh binding per iteration and discards them.",
        },
      ],
    },
    {
      title: "The global object and this",
      lesson: 5,
      blocks: [
        {
          kind: "table",
          head: ["Where", "Global object"],
          rows: [
            ["Browser", "`window`"],
            ["Node.js", "`global`"],
            ["Web Worker", "`self`"],
            ["Anywhere", "`globalThis`"],
          ],
        },
        {
          kind: "points",
          items: [
            "Even an empty file gets a global context, a global object and `this`. At top level of a classic script `this === window` (`undefined` in an ES module).",
            "Two script tags share one `window`: a second `var count` overwrites the first.",
            "`'use strict'` does not change top-level `this`. It only makes `this` `undefined` in a plain function call.",
          ],
        },
      ],
    },
    {
      title: "undefined, null and not defined",
      lesson: 6,
      blocks: [
        {
          kind: "table",
          head: ["Term", "Meaning"],
          rows: [
            ["`undefined`", "Memory reserved, no value yet (set by the engine)"],
            ["`null`", "Empty on purpose (set by you)"],
            ["not defined", "Never declared: `ReferenceError`"],
          ],
        },
        {
          kind: "points",
          items: [
            "Falsy values: `undefined`, `null`, `0` (and `-0`), `0n`, `\"\"`, `false`, `NaN`.",
            "`typeof undeclared` returns `\"undefined\"` without throwing.",
            "JavaScript is **loosely (dynamically) typed**: the type belongs to the value, not the variable.",
            "Never assign `undefined` yourself. Use `null` for \"intentionally empty\".",
          ],
        },
      ],
    },
    {
      title: "Scope chain and shadowing",
      lesson: 7,
      blocks: [
        {
          kind: "points",
          items: [
            "A **lexical environment** = local memory + a link to its parent. Global links to `null`.",
            "Lookup goes inside out until found. Not found anywhere: `ReferenceError`.",
            "JavaScript is **lexically (statically) scoped**: scope depends on where code is written, not who calls it.",
            "**Shadowing**: a local name hides an outer one. The outer value is unchanged.",
            "Global can never reach into a function's locals.",
          ],
        },
        {
          kind: "code",
          lang: "js",
          code: "const x = \"global\";\nfunction a() {\n  const x = \"local\";   // shadows\n  function b() { return x; }\n  return b();           // \"local\"\n}",
        },
      ],
    },
    {
      title: "TDZ details and the five errors",
      lesson: 8,
      blocks: [
        {
          kind: "points",
          items: [
            "The TDZ is about **time**, not position: a function above the declaration works if it is called after the declaration ran.",
            "Shadowing: an inner `let x` has its own TDZ, so the outer `x` is never reached.",
            "`function f(a = b, b = 1)` throws: defaults run left to right like `let`. `typeof` is safe on undeclared names but **throws in the TDZ**.",
            "A `SyntaxError` is found at parse time, so nothing in the file runs.",
          ],
        },
        {
          kind: "table",
          head: ["Message", "Cause"],
          rows: [
            ["`x is not defined`", "Never declared"],
            ["`Cannot access 'x' before initialization`", "Inside the TDZ"],
            ["`Identifier 'x' has already been declared`", "Redeclared `let` or `const`"],
            ["`Missing initializer in const declaration`", "`const x;`"],
            ["`Assignment to constant variable`", "Reassigned `const`"],
          ],
        },
      ],
    },
    {
      title: "Blocks and shadowing rules",
      lesson: 9,
      blocks: [
        {
          kind: "points",
          items: [
            "A block (`if`, loop, bare braces) creates a new lexical environment only if it holds `let`, `const`, `class` or a function declaration.",
            "`var` ignores blocks, so a `var` \"shadow\" is the same variable reassigned.",
            "`switch` has **one** block for all cases: two `let rate` in different cases throw. Wrap each case body in braces.",
          ],
        },
        {
          kind: "table",
          head: ["Outer", "Inner", "Result"],
          rows: [
            ["`let x`", "`let x` in a block", "Legal shadowing"],
            ["`let x`", "`var x` in a block", "`SyntaxError`"],
            ["`let x`", "`var x` in a function", "Legal"],
            ["Parameter `a`", "`let a` at top of body", "`SyntaxError`"],
          ],
        },
      ],
    },
    {
      title: "Closures",
      lesson: 10,
      blocks: [
        {
          kind: "points",
          items: [
            "A **closure** = a function plus a live reference to the lexical environment where it was created.",
            "It holds the **variable** (a reference), not a copy of the value.",
            "Each call of the outer function makes a separate closure with its own variables.",
            "Uses: private state, factories, callbacks, once and memo helpers.",
            "A leak happens if something (a never-removed listener) keeps the closure alive.",
          ],
        },
        {
          kind: "code",
          lang: "js",
          code: "function counter() {\n  let n = 0;\n  return () => ++n;   // keeps n alive\n}\nconst c = counter();\nc(); c();             // 1, 2",
        },
      ],
    },
    {
      title: "The loop and setTimeout bug",
      lesson: 11,
      blocks: [
        {
          kind: "code",
          lang: "js",
          code: "for (var i = 1; i <= 3; i++) {\n  setTimeout(() => log(i), i * 1000);\n}\n// 4 4 4  (one shared i, loop already done)",
          note: "All callbacks close over one variable.",
        },
        {
          kind: "table",
          head: ["Fix", "How"],
          rows: [
            ["`let`", "Fresh binding per iteration"],
            ["IIFE", "`(function (j) { ... })(i)` copies the value"],
            ["Helper function", "Call it with `i`: own environment per call"],
            ["`bind`", "`log.bind(null, i)` fixes the argument"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "`let` only fixes the loop variable. A `var` inside the loop body is still shared. `setTimeout(fn, 1000)` means at least 1000 ms.",
        },
      ],
    },
    {
      title: "First-class functions and callbacks",
      lesson: 12,
      blocks: [
        {
          kind: "points",
          items: [
            "**First-class**: functions can be assigned, stored, passed and returned like any value.",
            "**Higher-order function**: takes a function, returns one, or both.",
            "**Sync callback** runs before the outer call returns. **Async callback** runs later (timers, events).",
            "A regular-function listener gets `this` = the element. An arrow function keeps the outer `this`.",
          ],
        },
        {
          kind: "code",
          lang: "js",
          code: "const off = pct => price =>\n  price * (100 - pct) / 100;\nconst d20 = off(20);   // keeps pct\n\nel.addEventListener(\"click\", onClick);\nel.removeEventListener(\"click\", onClick);\nel.addEventListener(\"click\", f,\n  { once: true });",
          note: "An anonymous listener needs an AbortController signal or `once`.",
        },
      ],
    },
    {
      title: "Engine and runtime",
      lesson: 13,
      blocks: [
        {
          kind: "steps",
          items: [
            "**Parse**: source to tokens to an **AST**.",
            "**Compile** (JIT): Ignition (interpreter) makes bytecode; hot code goes to TurboFan machine code.",
            "**Execute**: call stack plus memory heap. Orinoco collects garbage.",
          ],
        },
        {
          kind: "points",
          items: [
            "The engine only parses, compiles and runs. `setTimeout` and `fetch` come from the **runtime** (browser or Node).",
            "Objects with the same properties in the same order share a **hidden class**, so access is fast. Different shapes make it slower.",
            "**Deoptimization**: if a function gets a new type or shape, optimized code is dropped and bytecode runs.",
            "**Mark-and-sweep**: mark all reachable objects, free the rest. Cycles are fine. Leaks are things still reachable by accident.",
          ],
        },
      ],
    },
    {
      title: "Event loop and queues",
      lesson: 14,
      blocks: [
        {
          kind: "points",
          items: [
            "Players: **call stack**, **Web APIs**, **microtask queue** (promises, `await`), **callback queue** (timers, events).",
            "When the stack is empty, the **whole microtask queue drains** (including new ones) before one callback task runs. Rendering comes after.",
            "Code after `await` is a microtask. A microtask that keeps queuing microtasks **starves** timers and painting.",
          ],
        },
        {
          kind: "code",
          lang: "js",
          code: "log(1);   // log = console.log\nsetTimeout(() => log(2));\nPromise.resolve().then(() => log(3));\n(async () => {\n  log(4); await null; log(5);\n})();\nlog(6);\n// 1 4 6 3 5 2",
          note: "Sync first, then microtasks in order, then the timer.",
        },
      ],
    },
    {
      title: "Interview one-liners",
      lesson: 1,
      blocks: [
        {
          kind: "table",
          head: ["Question", "Short answer"],
          rows: [
            ["Why does `var` print `undefined`?", "The memory phase reserved it as `undefined` before any code ran."],
            ["Is `let` hoisted?", "Yes, but locked in the TDZ until its declaration runs."],
            ["`undefined` vs not defined?", "Reserved but empty vs never declared (`ReferenceError`)."],
            ["What is a closure?", "A function with a live reference to its creation scope."],
            ["Lexical or dynamic scope?", "Lexical: fixed by where the code is written."],
            ["`setTimeout 0` vs `Promise.then`?", "The promise runs first: microtasks drain before timers."],
            ["Does `const` make a value immutable?", "No, only the binding. Use `Object.freeze` (shallow)."],
          ],
        },
      ],
    },
  ],
};
