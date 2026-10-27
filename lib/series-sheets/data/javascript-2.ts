import type { CheatSheet } from "../types.ts";

/** Cheat sheet for the "javascript-2" series. See scripts/SERIES-SHEETS.md. */
export const SHEET: CheatSheet | null = {
  intro:
    "The deeper half of JavaScript: prototypes, `this` and classes, promises, modules, iterators, the DOM, errors and copying, and memory. Rules and traps for the night before an interview.",
  sections: [
    {
      title: "Prototype chain and new",
      lesson: 0,
      blocks: [
        {
          kind: "points",
          items: [
            "An object is a bag of properties plus one hidden `[[Prototype]]` link. A **read** walks the chain until `null`; a **write** makes an own property.",
            "`Fn.prototype` becomes the prototype of `new Fn()` objects. `__proto__` reads or writes any object's link; prefer `Object.getPrototypeOf`.",
            "`new` = create an object from `Fn.prototype`, run `Fn` with `this` = it, return it (unless `Fn` returns another object).",
          ],
        },
        {
          kind: "code",
          lang: "js",
          code: "function myNew(Ctor, ...args) {\n  const obj = Object.create(Ctor.prototype);\n  const r = Ctor.apply(obj, args);\n  return r instanceof Object ? r : obj;\n}",
        },
        {
          kind: "callout",
          tone: "warn",
          text: "`obj.count++` on an inherited `count` creates an own property. `obj.list.push(1)` on an inherited array changes the shared one. Put mutable defaults in the constructor.",
        },
      ],
    },
    {
      title: "Descriptors, freeze and own keys",
      lesson: 0,
      blocks: [
        {
          kind: "table",
          head: ["Call", "Add", "Delete", "Change values"],
          rows: [
            ["`preventExtensions`", "No", "Yes", "Yes"],
            ["`seal`", "No", "No", "Yes"],
            ["`freeze`", "No", "No", "No"],
          ],
        },
        {
          kind: "points",
          items: [
            "All three are **shallow**. Sloppy mode fails silently; strict mode throws `TypeError`.",
            "Descriptor: `value`, `writable`, `enumerable`, `configurable` (or `get`, `set`). Assignment sets all on; `defineProperty` sets all off.",
            "`in` and `for...in` see the whole chain. `Object.hasOwn`, `keys`, `entries` see own properties only.",
          ],
        },
      ],
    },
    {
      title: "How this is decided",
      lesson: 1,
      blocks: [
        {
          kind: "table",
          head: ["Order", "Call site", "this is"],
          rows: [
            ["1", "`new Fn()`", "The new object"],
            ["2", "`fn.call(x)`, `apply`, `bind`", "`x`"],
            ["3", "`obj.fn()`", "`obj` (the receiver)"],
            ["4", "`fn()`", "`undefined` (strict) or global"],
            ["Arrow", "Anywhere", "`this` of the code around it; fixed"],
          ],
        },
        {
          kind: "pairs",
          rows: [
            ["fn.call(x, a, b)", "Run now, arguments listed"],
            ["fn.apply(x, [a, b])", "Run now, arguments in an array"],
            ["fn.bind(x, a)", "Return a new function, `this` fixed, not run"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "`const f = obj.method; f()` loses `this`. Fix: wrapper `() => obj.method()`, `bind`, or an arrow field. `removeEventListener` needs the same reference.",
        },
      ],
    },
    {
      title: "Classes, private fields, super",
      lesson: 1,
      blocks: [
        {
          kind: "code",
          lang: "js",
          code: "class Animal {\n  #age = 0;                 // truly private\n  static count = 0;\n  constructor(name) { this.name = name; }\n  speak() { return this.name; }\n}\nclass Dog extends Animal {\n  constructor(name) {\n    super(name);       // before any this\n    this.tricks = [];\n  }\n}",
        },
        {
          kind: "points",
          items: [
            "A class is a function; methods sit on `Class.prototype`. Extras over functions: needs `new`, always strict, methods not enumerable, `#private`.",
            "`#x` is enforced and hidden from `keys` and `JSON`; `_x` is only a habit.",
            "`this` before `super()` is a `ReferenceError`. Child fields are not set while the parent constructor runs.",
            "`instanceof` checks `Ctor.prototype` on the chain. Use `Array.isArray` for arrays. Mixin: `const M = Base => class extends Base {}`.",
          ],
        },
      ],
    },
    {
      title: "Promises and the event loop",
      lesson: 2,
      blocks: [
        {
          kind: "points",
          items: [
            "States: **pending**, then **fulfilled** or **rejected**, once. Handlers always run later as microtasks.",
            "`then` returns a new promise: a returned value fulfills, a returned promise is followed, a throw rejects, a missing handler passes through.",
            "Order: sync code, then `nextTick` (Node CJS), then promise microtasks, then timers. Microtasks always beat the next timer.",
          ],
        },
        {
          kind: "code",
          lang: "js",
          code: "setTimeout(() => log(\"timer\"), 0);\nPromise.resolve().then(() => log(\"p\"));\nprocess.nextTick(() => log(\"tick\"));\nlog(\"sync\");\n// sync, tick, p (promise), timer",
          note: "Node CommonJS. In a browser there is no nextTick.",
        },
      ],
    },
    {
      title: "Combinators and async/await",
      lesson: 2,
      blocks: [
        {
          kind: "table",
          head: ["Method", "Fulfills when", "Rejects when"],
          rows: [
            ["`all`", "All succeed", "First failure"],
            ["`allSettled`", "All finish (reports each)", "Never"],
            ["`race`", "First to settle wins", "If first settled is a failure"],
            ["`any`", "First success", "All fail: `AggregateError`"],
          ],
        },
        {
          kind: "code",
          lang: "js",
          code: "const [a, b] = await Promise.all(\n  [getA(), getB()]);\nconst ctl = new AbortController();\nfetch(url, { signal: ctl.signal });\nctl.abort();                    // cancel\nAbortSignal.timeout(3000);   // TimeoutError",
          note: "Two awaits in a row cost the sum; start both first for the max.",
        },
        {
          kind: "callout",
          tone: "warn",
          text: "`forEach` does not wait for `await`. `return await` is needed inside `try/catch`. An unhandled rejection ends a Node 15+ process with exit code 1.",
        },
      ],
    },
    {
      title: "CommonJS vs ES modules",
      lesson: 3,
      blocks: [
        {
          kind: "table",
          head: ["Topic", "CommonJS", "ES modules"],
          rows: [
            ["Syntax", "`require`, `module.exports`", "`import`, `export`"],
            ["Loaded", "Run time, synchronous", "Static: link, then run"],
            ["Values", "Copy of `module.exports`", "Live bindings"],
            ["Extras", "`require` inside `if`", "Top-level `await`, tree shaking"],
          ],
        },
        {
          kind: "points",
          items: [
            "`exports` only points at `module.exports`. `exports = {}` does nothing; `module.exports = {}` replaces all.",
            "Node: `.mjs` is ESM, `.cjs` is CJS, `.js` follows `package.json` `\"type\"`. ESM needs full file extensions.",
            "CJS loads ESM with `await import()`; `require()` works on Node 22.12+ unless the module uses top-level `await`.",
          ],
        },
        {
          kind: "code",
          lang: "js",
          code: "const m = await import(\"./chart.js\");",
          note: "import() returns a promise of the namespace; bundlers split one file per call. Prefer named exports over default.",
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Cycles: CJS gives a partly filled export; ESM `const` exports hit the temporal dead zone. Fix by moving shared code to a third module. Tree shaking is blocked by CJS and side effects.",
        },
      ],
    },
    {
      title: "Iterators and generators",
      lesson: 4,
      blocks: [
        {
          kind: "points",
          items: [
            "**Iterable**: has a `Symbol.iterator` method. **Iterator**: has `next()` returning `{ value, done }`. A generator is both.",
            "`for...of` calls `Symbol.iterator`, loops `next()`, and calls `return()` on `break`, `return` or throw.",
            "`for...in` gives string keys, inherited too. `for...of` gives values and throws on plain objects.",
            "`next(x)` becomes the paused `yield`'s result; the first `next` argument is dropped. `throw()` and `return()` finish it.",
          ],
        },
        {
          kind: "code",
          lang: "js",
          code: "function* naturals() {\n  let n = 1;\n  while (true) yield n++;  // infinite\n}\nconst odd = naturals()\n  .filter(n => n % 2).take(3);\nodd.toArray();      // [1, 3, 5] Node 22\n\nasync function* pages() {  // for await\n  for (let i = 1; ; i++)\n    yield await load(i);\n}",
        },
      ],
    },
    {
      title: "Symbols",
      lesson: 4,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["Symbol.iterator", "Powers `for...of` and spread"],
            ["Symbol.asyncIterator", "Powers `for await`"],
            ["Symbol.toPrimitive", "Hint: `default`, `string` or `number`"],
            ["Symbol.toStringTag", "The X in `[object X]`"],
            ["Symbol.hasInstance", "Customises `instanceof`"],
            ["Symbol.species", "Constructor used by `map`/`filter` in subclasses"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Symbols are unique, hidden from `keys` and `JSON`, but not private: `getOwnPropertySymbols` finds them. Use `#private` for privacy.",
        },
      ],
    },
    {
      title: "DOM and events",
      lesson: 5,
      blocks: [
        {
          kind: "table",
          head: ["Pair", "Difference"],
          rows: [
            ["`childNodes` / `children`", "All nodes with text / elements only"],
            ["`querySelectorAll`", "Static `NodeList` snapshot"],
            ["`getElementsByTagName`", "Live `HTMLCollection`"],
            ["`stopPropagation`", "Stops travel to other elements"],
            ["`preventDefault`", "Stops browser action (needs `cancelable`)"],
            ["`target` / `currentTarget`", "Origin (fixed) / current listener (changes)"],
          ],
        },
        {
          kind: "points",
          items: [
            "Phases: capture (down), target, bubble (up). Default listeners run on bubble; `{ capture: true }` runs on the way down.",
            "Use `textContent` for untrusted text. `innerHTML` can run code (XSS) and `+=` destroys listeners.",
            "`focus`, `blur`, `mouseenter` do not bubble; use `focusin`, `focusout`.",
          ],
        },
      ],
    },
    {
      title: "Delegation, options and custom events",
      lesson: 5,
      blocks: [
        {
          kind: "code",
          lang: "js",
          code: "list.addEventListener(\"click\", e => {\n  const li = e.target.closest(\"li\");\n  if (li) select(li);\n}, { signal: ctl.signal });\n\nel.dispatchEvent(new CustomEvent(\n  \"app:save\",\n  { detail: { id: 1 }, bubbles: true }));",
          note: "`ctl.abort()` removes the listener. dispatchEvent is synchronous. Custom events do not bubble by default.",
        },
        {
          kind: "points",
          items: [
            "Options: `once`, `capture`, `passive` (promise not to `preventDefault`, keeps scrolling smooth), `signal`.",
            "`removeEventListener` needs the same function reference; a new arrow never matches.",
            "Setting `.value` fires no `input`/`change`. `input` fires per edit; `change` on commit. jsdom has no layout (all sizes `0`).",
          ],
        },
      ],
    },
    {
      title: "Errors and async errors",
      lesson: 6,
      blocks: [
        {
          kind: "code",
          lang: "js",
          code: "class AppError extends Error {\n  constructor(msg, opts) {\n    super(msg, opts);   // passes cause\n    this.name = \"AppError\";\n  }\n}\ntry { await load(); }  // await inside try\ncatch (e) {\n  throw new AppError(\"load\", { cause: e });\n}\nfinally { release(); }",
        },
        {
          kind: "points",
          items: [
            "Throw `Error` objects: they have `stack`, `cause` and `instanceof`. A thrown string has no stack.",
            "`return` inside `finally` replaces the earlier return and any error.",
            "`JSON.stringify(err)` is `{}`: `message` and `stack` are not enumerable. Build `{ name, message, stack, cause }`.",
            "`try { asyncFn(); }` misses the rejection. Use `await` inside `try`, or `.catch`.",
          ],
        },
      ],
    },
    {
      title: "Proxy and Reflect",
      lesson: 6,
      blocks: [
        {
          kind: "code",
          lang: "js",
          code: "const user = new Proxy({}, {\n  set(t, k, v, r) {\n    if (k === \"age\" && !Number.isInteger(v))\n      throw new TypeError(\"age\");\n    return Reflect.set(t, k, v, r);\n  },\n});",
          note: "Reflect does the default and returns true/false; it takes a receiver.",
        },
        {
          kind: "points",
          items: [
            "Traps cover get, set, delete, `in`, keys and calls. Use cases: validation, logging reads.",
            "Limits: `#private` fields fail through a proxy, invariants block lies about read-only props, and reads were about 6x slower in the lesson run.",
          ],
        },
      ],
    },
    {
      title: "Copying and immutable updates",
      lesson: 6,
      blocks: [
        {
          kind: "table",
          head: ["Tool", "Result"],
          rows: [
            ["Spread, `assign`, `slice`, `concat`", "Shallow: nested objects are shared"],
            ["`JSON.parse(JSON.stringify(x))`", "Dates become strings; `undefined`, functions, `Map` lost"],
            ["`structuredClone`", "Deep; keeps `Date`, `Map`, `Set`, cycles"],
            ["`structuredClone` limits", "Throws on functions, symbols, `WeakMap`; loses prototype"],
          ],
        },
        {
          kind: "code",
          lang: "js",
          code: "const next = { ...state,\n  user: { ...state.user,\n    prefs: { ...state.user.prefs,\n      theme: \"light\" } } };\nconst s = arr.toSorted((a, b) => a - b);\n// also toReversed, toSpliced, with(i, v)",
          note: "toSorted with no compare function still sorts as text.",
        },
        {
          kind: "callout",
          tone: "warn",
          text: "`Object.freeze` is shallow: nested edits and a frozen `Map`'s `set` still work. Use a recursive `deepFreeze`, or `readonly` types.",
        },
      ],
    },
    {
      title: "Garbage collection and leaks",
      lesson: 7,
      blocks: [
        {
          kind: "points",
          items: [
            "Freed by **reachability** from roots (globals, stack, timers, listeners), not by whether you still use it.",
            "Five usual leaks: unbounded cache, forgotten listener, uncleared timer, closure capturing too much, detached DOM node.",
            "`WeakMap`/`WeakSet`: keys are objects, held weakly, not iterable, no `size`. `WeakRef` and `FinalizationRegistry` are never for correctness.",
            "Buffers live outside the heap: watch `arrayBuffers` and `rss`, not only `heapUsed`.",
          ],
        },
        {
          kind: "steps",
          items: [
            "Confirm growth in `rss` and `heapUsed`; reproduce in a loop with `--expose-gc`.",
            "Take two heap snapshots (`--inspect` or `v8.writeHeapSnapshot()`).",
            "Compare, sort by retained size, follow the retainer chain to a root.",
            "Cut that path, then check memory stays flat.",
          ],
        },
      ],
    },
    {
      title: "Interview one-liners",
      lesson: 0,
      blocks: [
        {
          kind: "table",
          head: ["Question", "Short answer"],
          rows: [
            ["`__proto__` vs `prototype`?", "`prototype` is on constructors; `__proto__` is any object's actual link."],
            ["call vs apply vs bind?", "Run with listed args; run with array; return a bound function."],
            ["Class just sugar?", "Mostly; plus needs `new`, strict, `#private`."],
            ["`all` vs `allSettled`?", "`all` fails on the first failure; `allSettled` reports every outcome."],
            ["CJS vs ESM?", "Run-time copies vs static live bindings."],
            ["Shallow vs deep copy?", "Shallow shares nested objects; `structuredClone` copies all levels."],
            ["Map vs WeakMap?", "Map keeps keys alive; WeakMap lets them be collected."],
            ["Memory leak?", "Memory you no longer need but can still reach."],
          ],
        },
      ],
    },
  ],
};
