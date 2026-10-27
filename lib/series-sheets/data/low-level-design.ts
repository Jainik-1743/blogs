import type { CheatSheet } from "../types.ts";

/** Cheat sheet for the "low-level-design" series. See scripts/SERIES-SHEETS.md. */
export const SHEET: CheatSheet | null = {
  intro:
    "The routine, the SOLID checks, the patterns with their trigger and trap, and the class shapes of the classic LLD problems. Say what hurts first, then name the pattern.",
  sections: [
    {
      title: "The 5-step routine",
      lesson: 0,
      blocks: [
        {
          kind: "steps",
          items: [
            "**Requirements** (about 5 min): who uses it, what it must do, what is out of scope. Read 4 to 6 back.",
            "**Entities**: underline the nouns. Identity and life means a class; a small value is a value object.",
            "**Class sketch**: verbs become methods on the class that owns the data. Rules that may change go behind an interface.",
            "**Key flow** as real code: at least one path is working, not hand-waved.",
            "**Extensions**: show that a new rule is a small edit. Say a trade-off out loud.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Do not name a pattern before the problem needs it. Say the pain first (\"the fee rule will change\"), then the pattern.",
        },
      ],
    },
    {
      title: "SOLID and small rules",
      lesson: 0,
      blocks: [
        {
          kind: "table",
          head: ["Letter", "Meaning", "Smell"],
          rows: [
            ["**S** Single responsibility", "One reason to change", "Class formats, saves and calculates"],
            ["**O** Open/closed", "Add code, do not edit tested code", "Long `if / else if` on a type"],
            ["**L** Liskov", "A child works wherever the parent does", "Child throws \"not supported\""],
            ["**I** Interface segregation", "Small interfaces", "Empty or throwing methods"],
            ["**D** Dependency inversion", "Depend on an interface you own", "`new SmtpMailer()` in business code"],
          ],
        },
        {
          kind: "points",
          items: [
            "Prefer **composition** (\"has a\") to inheritance (\"is a\"). Use `extends` only for a true is-a, when you own both classes.",
            "Classes are nouns, methods are verbs. Avoid `Manager`, `Helper`, `Util`. Make small classes `readonly`.",
          ],
        },
      ],
    },
    {
      title: "Creational patterns",
      lesson: 1,
      blocks: [
        {
          kind: "table",
          head: ["You see", "Reach for"],
          rows: [
            ["new X() in many files, kind chosen at run time", "Factory (a `Map` registry stops the `switch` growing)"],
            ["A matching set (theme, vendor)", "Abstract Factory"],
            ["Many options with rules between them", "Builder (else an options object)"],
            ["\"There must be one\"", "Build one in the composition root, inject it"],
            ["A big template object to duplicate", "Prototype: `structuredClone` or `clone()`"],
            ["Code needs a service", "Constructor injection"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Singleton traps: hidden dependency, shared test state, not one across processes or module URLs. Spread `{...o}` is a shallow copy.",
        },
      ],
    },
    {
      title: "Structural patterns",
      lesson: 2,
      blocks: [
        {
          kind: "table",
          head: ["Pattern", "Intent", "Wrapper interface"],
          rows: [
            ["**Adapter**", "Make a thing fit the shape I want", "Different"],
            ["**Decorator**", "Add logging, cache, retry", "Same"],
            ["**Facade**", "One simple door, with undo on failure", "New, smaller"],
            ["**Proxy**", "Lazy load, permission, remote", "Same"],
            ["**Composite**", "Leaf and group look the same (tree)", "Same"],
          ],
        },
        {
          kind: "points",
          items: [
            "Decorator is chosen by the caller and the inner object always exists. Proxy may never touch the real object.",
            "**Stack order matters**: `WithLog(WithCache(WithRetry(base)))` caches the final answer. Cache inside retry checks the cache on every attempt.",
            "Keep `add()` on the composite only, so a leaf cannot be asked to add children.",
          ],
        },
      ],
    },
    {
      title: "Behavioural patterns",
      lesson: 3,
      blocks: [
        {
          kind: "table",
          head: ["Your need", "Pattern"],
          rows: [
            ["A rule that changes or differs per case", "Strategy (often a function)"],
            ["Many things react to X", "Observer"],
            ["Undo, queue, retry, audit", "Command (`do()` and `undo()`)"],
            ["Behaviour depends on a changing status", "State"],
            ["A request passes checks or levels", "Chain of Responsibility"],
            ["Walk a collection, lazily", "Iterator (a generator method)"],
            ["Same steps, few differ", "Template Method, or Strategy"],
          ],
        },
        {
          kind: "points",
          items: [
            "**Strategy vs State**: the caller picks a strategy; a state is the object's own condition and picks the next state.",
            "**Observer**: `subscribe` returns an unsubscribe function, loop over a copy, catch errors per listener.",
            "**Command vs Strategy**: a command is one request with data; keep it if you need history.",
          ],
        },
      ],
    },
    {
      title: "Patterns in real code",
      lesson: 4,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["Express / Koa middleware", "Chain of Responsibility with an onion: code after `next()` is a decorator"],
            ["EventEmitter", "Observer. Sync listeners, `error` with no listener throws, leaks"],
            ["Redux", "Action is a command as data, reducer is pure, `subscribe` is Observer"],
            ["Custom hook", "Reuse by composition, no base class"],
            ["React Context", "Dependency injection, not a store; all consumers re-render"],
            ["JS Proxy", "Dynamic decorator or guard; a trap runs on every access"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Request hangs? A middleware neither responded nor called `next()`, or called it twice, or forgot `await next()`.",
        },
      ],
    },
    {
      title: "Anti-patterns",
      lesson: 4,
      blocks: [
        {
          kind: "table",
          head: ["Smell", "Fix"],
          rows: [
            ["God object (validate, save, email)", "Split by reason to change; facade only coordinates"],
            ["Premature abstraction (flags, \"kind\")", "Rule of three: abstract on the third repeat"],
            ["Singleton abuse", "Create once, inject"],
            ["Anemic model (rules in services)", "Put rules next to the data"],
            ["Over-engineering", "Plain function now, pattern when case two is real"],
          ],
        },
      ],
    },
    {
      title: "Parking lot",
      lesson: 5,
      blocks: [
        {
          kind: "code",
          lang: "ts",
          code:
            "class Spot { fits(v); claim(plate);\n  release() }\ninterface AllocationStrategy {\n  choose(spots): Spot | undefined }\ninterface PricingStrategy {\n  feeCents(v, minutes): number }\nclass HourlyPricing // rounds up\nclass DailyCap // decorates pricing\nclass ParkingLot {\n  constructor(spots, alloc,\n    pricing, now)\n  park(v): Ticket | null\n  unpark(id, v): { feeCents,\n    minutes }\n}",
          note: "Vehicle and Ticket are plain data. Money in integer cents, time from an injected clock.",
        },
        {
          kind: "table",
          head: ["Allocation", "Cost"],
          rows: [
            ["First free", "Wastes large spots on small vehicles"],
            ["Nearest to entrance", "Trucks lose large spots"],
            ["Best fit (smallest that fits)", "Motorcycle may get a far spot"],
            ["Spread by level", "More walking"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Check-then-act is a race. Make it one step: SQL `UPDATE ... WHERE plate IS NULL` (1 row), Redis `SET NX`.",
        },
      ],
    },
    {
      title: "Hash map and LRU cache",
      lesson: 6,
      blocks: [
        {
          kind: "points",
          items: [
            "**Hash map**: buckets plus a hash function; chaining on collision. Resize at load factor about 0.75 and **rehash every key** (`hash % buckets` changes).",
            "**LRU** = `Map` from key to node + **doubly** linked list in use order. Sentinel head and tail remove edge cases.",
            "Store the **key in the node**, so evicting the tail can call `map.delete(node.key)`.",
            "**TTL**: store `expiresAt`, check on `get`, inject the clock. Lazy expiry is simplest; a sweep frees memory sooner.",
          ],
        },
        {
          kind: "table",
          head: ["Concern", "Answer"],
          rows: [
            ["Stampede on one key", "Share the in-flight promise per key"],
            ["Threads", "`get` mutates the list: one lock, or shard by key hash"],
            ["Many servers", "Shared cache such as Redis"],
            ["LRU vs LFU vs FIFO", "LRU is default; a scan can flush it"],
          ],
        },
      ],
    },
    {
      title: "State machines",
      lesson: 7,
      blocks: [
        {
          kind: "steps",
          items: [
            "Name the states and events, then write the **transition table** first.",
            "Every cell is a move or \"not allowed\". Prefer one state value to several booleans.",
            "Pick the style: **State pattern** (object per state) for rich behaviour, **table** for mostly \"go to X\".",
            "Failures are results; an invalid transition throws. Refund first, then change state.",
          ],
        },
        {
          kind: "table",
          head: ["Elevator scheduler", "Rule", "Weak spot"],
          rows: [
            ["First come first served", "Oldest request", "Zig-zags (19 floors in the demo)"],
            ["SCAN", "Keep direction, stop on path, then turn", "Far opposite request waits (8 floors)"],
          ],
        },
      ],
    },
    {
      title: "Cards, chat server, call center",
      lesson: 8,
      blocks: [
        {
          kind: "points",
          items: [
            "A `Card` is data. `BlackjackHand` **scores**, since an ace depends on the hand: count aces as 1, add 10 once if no bust.",
            "Shuffle with **Fisher-Yates** and inject the random source. Test rounds with stacked decks.",
            "Chat: `User`, `FriendRequest` (pending to accepted or rejected, once), `Chat` (members, messages), `ChatServer` enforces cross-object rules.",
            "Online delivery is Observer. Unread is a **read position** per user per chat. Order comes from per-chat ids.",
            "Call center: Chain of Responsibility (operator, supervisor, director) plus a queue when all are busy.",
          ],
        },
      ],
    },
    {
      title: "Rate limiter",
      lesson: 9,
      blocks: [
        {
          kind: "code",
          lang: "ts",
          code:
            "interface RateLimiter {\n  allow(key, cost = 1): Decision\n}  // allowed, remaining, retryAfterMs\nclass TokenBucket(cap, refill, now)\nclass FixedWindow(limit, ms, now)\nclass SlidingWindowLog(limit, ms)",
          note: "Return retryAfterMs so the HTTP layer can send 429 and Retry-After.",
        },
        {
          kind: "table",
          head: ["Algorithm", "State per key", "Weak spot"],
          rows: [
            ["Token bucket", "2 numbers", "Big bucket, big burst"],
            ["Fixed window", "1 counter", "Up to 2x limit at a boundary"],
            ["Sliding log", "Timestamps", "Memory grows with limit"],
            ["Sliding counter", "2 counters", "An estimate"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Many servers: shared store with an atomic update, and decide fail open or fail closed. Delete idle full buckets.",
        },
      ],
    },
    {
      title: "Notification service",
      lesson: 9,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["EventBus", "Observer: producers do not know who listens"],
            ["Channel per medium", "Strategy: add Slack with one class"],
            ["templates", "Data: text changes without code"],
            ["withRetry", "Backoff, cap, jitter, skip `PermanentError`"],
            ["done keyed eventId:channel", "Idempotency; store the promise for concurrent copies"],
            ["deadLetters", "Failures kept, not lost"],
          ],
        },
        {
          kind: "points",
          items: [
            "Wait before attempt n: random between 0 and `min(cap, base * 2^n)`. Jitter stops a synchronised retry storm.",
            "Crash after send, before record, gives at-least-once. Pass your key to the provider to get closer to once.",
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
            ["Adapter vs Decorator?", "Adapter changes the interface; decorator keeps it and adds behaviour."],
            ["Decorator vs Proxy?", "Decorator adds a feature; proxy controls access to the real object."],
            ["Strategy vs State?", "Caller picks a strategy; a state changes itself."],
            ["Factory Method vs Abstract Factory?", "One product via an overridable step, vs a matching family."],
            ["Inversion vs injection?", "Inversion is the rule; injection is passing it in, often by constructor."],
            ["Observer vs pub/sub?", "Pub/sub adds a broker between them and can cross processes."],
            ["Undo and redo?", "Commands with `undo()`; undo and redo stacks; a new command clears redo."],
            ["Why a doubly linked list?", "Move or remove a node in O(1) needs its previous node."],
          ],
        },
      ],
    },
  ],
};
