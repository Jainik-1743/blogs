import type { CheatSheet } from "../types.ts";

/** Cheat sheet for the "nodejs" series. See scripts/SERIES-SHEETS.md. */
export const SHEET: CheatSheet | null = {
  intro:
    "Node.js on one page: the runtime and event loop, files, streams, servers, Express and Fastify, errors and shutdown, concurrency, tests, memory and config. Waiting is cheap, thinking is expensive.",
  sections: [
    {
      title: "What Node is",
      lesson: 0,
      blocks: [
        {
          kind: "points",
          items: [
            "**V8** runs your JavaScript, **libuv** does the waiting, built-in modules give files, network and more.",
            "Your JS runs on **one thread**. A pool of **4** threads (`UV_THREADPOOL_SIZE`) serves fs, DNS lookup, some crypto and zlib. Network I/O does not use it.",
            "Exit code `0` is success. Use `process.argv`, `process.env`, `process.exitCode`.",
            "Prefix built-ins: `node:fs`, `node:path`, `node:http`, `node:test`.",
          ],
        },
        {
          kind: "table",
          head: ["File", "Treated as"],
          mono: [0],
          rows: [
            [".mjs", "Always ESM"],
            [".cjs", "Always CommonJS"],
            [".js", "ESM only if `\"type\": \"module\"`"],
          ],
        },
        {
          kind: "pairs",
          rows: [
            ["node --watch app.js", "Restart when a used file changes"],
            ["node --env-file=.env app.js", "Load variables; the real env wins"],
            ["npm ci", "Exact install from the lock file (CI)"],
          ],
        },
      ],
    },
    {
      title: "Event loop order",
      lesson: 1,
      blocks: [
        {
          kind: "steps",
          items: [
            "Sync code runs to its end first.",
            "`process.nextTick` queue, then promise microtasks (ESM: promises first).",
            "Timers, pending, idle, **poll** (I/O), **check** (`setImmediate`), close.",
            "After every callback the microtask queues empty again.",
          ],
        },
        {
          kind: "code",
          lang: "js",
          code: "// CommonJS output order:\n// sync, nextTick, then.. queueMicrotask,\n// then setImmediate / setTimeout 0\nsetTimeout(f, 0);\nsetImmediate(g);\nPromise.resolve().then(h);\nprocess.nextTick(i);",
          note: "In an I/O callback `setImmediate` always beats `setTimeout 0`. In the main script it varies.",
        },
        {
          kind: "points",
          items: [
            "A timer delay is a **minimum**: a 500 ms timer ran at 1252 ms after a 1 s block.",
            "Recursive `nextTick` or promises **starve** I/O and timers. Chunk with `setImmediate`.",
            "`await` pauses the function, not the thread. Callback errors do not travel up.",
          ],
        },
      ],
    },
    {
      title: "Files and paths",
      lesson: 2,
      blocks: [
        {
          kind: "points",
          items: [
            "Use `node:fs/promises` in servers. `readFileSync` froze a 10 ms heartbeat for 1325 ms.",
            "Say the encoding: `readFile(f, \"utf8\")`. Without it you get a Buffer.",
            "Handle errors by `e.code`: `ENOENT`, `EEXIST`, `EACCES`. Do not call `access` first (race).",
            "Flag `\"wx\"` creates only if the file is new.",
            "Atomic write: write a temp file, then `rename`. `fs.watch` fires duplicate events.",
          ],
        },
        {
          kind: "code",
          lang: "js",
          code: "const root = path.resolve(base);\nconst full = path.resolve(root, input);\nif (!full.startsWith(root + path.sep))\n  throw new Error(\"traversal\");\n// then fs.realpath for symlinks",
          note: "Anchor paths on `import.meta.dirname`, never the cwd. Use `path.join`, not string glue.",
        },
        {
          kind: "points",
          items: [
            "Buffers are raw bytes outside the heap. `subarray` shares memory; `allocUnsafe` may leak old data.",
            "Decoding chunk by chunk can split a multi-byte character.",
          ],
        },
      ],
    },
    {
      title: "Streams and backpressure",
      lesson: 3,
      blocks: [
        {
          kind: "table",
          head: ["Kind", "Examples"],
          rows: [
            ["Readable", "`createReadStream`, incoming request, stdin"],
            ["Writable", "`createWriteStream`, response, stdout"],
            ["Duplex", "TCP socket"],
            ["Transform", "`createGzip()`, `createHash()`"],
          ],
        },
        {
          kind: "code",
          lang: "js",
          code: "import { pipeline } from\n  \"node:stream/promises\";\nawait pipeline(\n  createReadStream(\"in.csv\"),\n  createGzip(),\n  createWriteStream(\"in.csv.gz\"),\n);",
          note: "Handles backpressure, forwards errors, destroys all streams on failure.",
        },
        {
          kind: "points",
          items: [
            "Memory follows chunk size: 82 MB against about 850 MB for a 302 MB file.",
            "`write()` returning `false` means wait for `drain`. Ignoring it queued 625 MB.",
            "`pipe()` left the source open when the target failed. Use `pipeline`.",
            "Chunks are not lines. Use `readline`. Skip streams for tiny data.",
          ],
        },
      ],
    },
    {
      title: "Raw HTTP server",
      lesson: 4,
      blocks: [
        {
          kind: "points",
          items: [
            "Handler is `(req, res)`: `req` is readable, `res` is writable. Headers are lower case; query values are strings.",
            "One `try/catch`: known errors carry a status (`HttpError`), unknown ones log and return `500`.",
            "Limit body size (`413`), check content type (`415`), bad JSON (`400`). `404` no path, `405` wrong method.",
            "Use `Buffer.byteLength` for `Content-Length`. `listen(0)` picks a free port (tests).",
            "50 requests with a 100 ms wait finished in 132 ms. One sync route freezes all.",
          ],
        },
        {
          kind: "table",
          head: ["Setting", "Limits", "Default"],
          mono: [0],
          rows: [
            ["keepAliveTimeout", "Idle kept connection", "5000 ms"],
            ["headersTimeout", "Receiving headers", "60000 ms max"],
            ["requestTimeout", "Whole request", "300000 ms"],
            ["timeout", "Socket inactivity", "0 (none)"],
          ],
        },
      ],
    },
    {
      title: "Express 5 and Fastify 5",
      lesson: 5,
      blocks: [
        {
          kind: "code",
          lang: "js",
          code: "app.use(express.json());   // parsers\napp.use(routes);\napp.use((req, res) =>      // 404\n  res.status(404).json({}));\napp.use((err, req, res, next) =>\n  res.status(500).json({}));  // 4 args",
          note: "Order is everything: logger, parsers, routes, 404, then the error handler last.",
        },
        {
          kind: "table",
          head: ["Topic", "Express 5", "Fastify 5"],
          rows: [
            ["Validation", "Bring a library", "JSON Schema built in"],
            ["Async errors", "Caught (new in 5)", "Caught"],
            ["Logging", "Add a library", "pino built in"],
            ["Structure", "Ordered middleware", "Hooks and plugins"],
            ["Default error", "HTML page", "JSON object"],
          ],
        },
        {
          kind: "points",
          items: [
            "Middleware is `(req, res, next)`: answer, call `next()`, or pass an error.",
            "Express 5 paths: `*path`, not `*`. The default error page can show file paths.",
            "Fastify hooks: `onRequest`, `preParsing`, `preValidation`, `preHandler`, `preSerialization`, `onSend`, `onResponse`.",
            "Schema coercion turns `\"7\"` into `7`. A response schema filters leaks.",
          ],
        },
      ],
    },
    {
      title: "Errors, logs, health, shutdown",
      lesson: 6,
      blocks: [
        {
          kind: "table",
          head: ["Kind", "Example", "Plan"],
          rows: [
            ["Operational", "`ENOENT`, `ECONNREFUSED`, bad input", "Handle, retry, 4xx or 5xx"],
            ["Programmer", "`TypeError`, bad state", "Log, restart"],
          ],
        },
        {
          kind: "points",
          items: [
            "`try/catch` misses callbacks and floating promises. An unhandled rejection crashes the process (Node 15+): usually right.",
            "`uncaughtException` and `unhandledRejection` listeners: log and exit only. An emitter with no `'error'` listener throws.",
            "pino: JSON to stdout, levels, child logger with request id, redact secrets. Pretty-print only in dev.",
            "Liveness stays light; readiness says \"can I take traffic\" and turns `503` during shutdown.",
            "Exit codes: `0` success, `1` failure, `128+N` signal (`SIGTERM` is 143).",
          ],
        },
        {
          kind: "steps",
          items: [
            "On `SIGTERM` set a flag so readiness fails.",
            "`server.close()`: refuse new connections, finish in-flight work.",
            "Close the database and other resources.",
            "Exit with `process.exitCode`, with a safety timer. Test with `curl` and `kill`.",
          ],
        },
      ],
    },
    {
      title: "Concurrency tools",
      lesson: 7,
      blocks: [
        {
          kind: "table",
          head: ["Call", "Result", "Use when"],
          mono: [0],
          rows: [
            ["Promise.all", "All values; rejects on first error", "Need every result"],
            ["Promise.allSettled", "Each status, never rejects", "Partial success fine"],
            ["Promise.race", "First to settle", "Timeouts"],
            ["Promise.any", "First success", "Mirrors"],
          ],
        },
        {
          kind: "points",
          items: [
            "Independent awaits go in `Promise.all`: 1507 ms in sequence against 301 ms.",
            "`Promise.all` does not cancel the rest. Use `AbortSignal.timeout(ms)` on every network call.",
            "Unlimited concurrency failed 25 of 30 requests. A `mapLimit` kept a peak of 5.",
            "`fib(40)` made `/health` take over 1 s. In a worker it took 3 ms.",
            "`exec` with user input is injection: use `execFile` or `spawn` with an argument array.",
          ],
        },
        {
          kind: "table",
          head: ["Problem", "Tool"],
          rows: [
            ["Heavy JS in a request", "`worker_threads` pool"],
            ["Idle cores, no orchestrator", "`cluster` or PM2"],
            ["Orchestrator exists", "One process per container"],
            ["Long job", "Queue plus a worker service"],
          ],
        },
      ],
    },
    {
      title: "Tests and profiling",
      lesson: 8,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["node --test", "Run built-in tests (`*.test.mjs`)"],
            ["--test-name-pattern=404", "Run matching tests only"],
            ["--cpu-prof", "Write a CPU profile; read self time"],
            ["--heap-prof", "Allocation sampling"],
            ["--inspect", "DevTools port; never expose publicly"],
            ["--max-old-space-size=64", "Heap limit; exceeding it exits 134"],
          ],
        },
        {
          kind: "points",
          items: [
            "Use `node:assert/strict`, inject dependencies to fake them, start apps on port 0, test error paths.",
            "Do not guess about speed: 88% of one run sat in one function.",
            "`monitorEventLoopDelay` showed a 300 ms block as a 309 ms maximum.",
            "Leak: `heapUsed` keeps rising after GC (441 MB unbounded against 4.7 MB bounded cache). Compare heap snapshots and read retainers.",
          ],
        },
      ],
    },
    {
      title: "Config and Docker",
      lesson: 8,
      blocks: [
        {
          kind: "points",
          items: [
            "Read config from the environment once at start-up, validate, convert types (all values are strings), freeze.",
            "Fail fast if `PORT` is missing. Real environment beats `.env`.",
            "Docker: pin the base image, cache dependencies, run as non-root `node` user.",
            "Start with `CMD [\"node\", \"server.js\"]` so Node gets `SIGTERM`. `npm start` may not pass it on.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Before shipping: logs with request id, `/health` and `/ready`, tested shutdown, metrics for loop delay and `heapUsed`, `npm ci`, a rollback.",
        },
      ],
    },
    {
      title: "Security habits",
      lesson: 9,
      blocks: [
        {
          kind: "points",
          items: [
            "**Prototype pollution**: reject `__proto__`, `constructor`, `prototype` keys; use `Object.create(null)` or `Map`.",
            "**ReDoS**: avoid nested quantifiers on user input.",
            "Compare secrets with `timingSafeEqual`.",
            "Packages run with your full power. Commit the lock file, run `npm audit`.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "`exec(\"echo \" + name)` with `x; echo INJECTED` ran both commands. `execFile` printed it as plain text.",
        },
      ],
    },
    {
      title: "Common wrong answers",
      lesson: 9,
      blocks: [
        {
          kind: "table",
          head: ["Wrong", "Right"],
          rows: [
            ["Single thread means one thing at a time", "Waits on many, runs JS one piece at a time"],
            ["`async` makes heavy work non-blocking", "It stays on your thread"],
            ["Catch in `uncaughtException`, carry on", "Log, shut down, restart"],
            ["`Promise.all` cancels the others", "It does not"],
            ["`pipe` handles errors", "Use `pipeline`"],
            ["Always use `cluster`", "One process per container"],
          ],
        },
      ],
    },
    {
      title: "Interview one-liners",
      lesson: 9,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["Default thread pool", "4"],
            ["nextTick or promise first?", "CJS nextTick; ESM promise"],
            ["exit or exitCode?", "`exitCode`; `exit` can lose output"],
            ["Stop a hanging fetch", "`AbortSignal.timeout(ms)`"],
            ["`server.close()`", "No new connections, waits for open ones"],
            ["`Object.create(null)`", "No prototype, no `__proto__` tricks"],
            ["Unsure about speed?", "Say how you would measure it"],
            ["Where do errors go?", "Rejections; log and exit if a bug"],
          ],
        },
      ],
    },
  ],
};
