import type { CheatSheet } from "../types.ts";

/** Cheat sheet for the "backend" series. See scripts/SERIES-SHEETS.md. */
export const SHEET: CheatSheet | null = {
  intro:
    "A Node and Express backend in one page: clean code, layers, REST rules, validation, errors, logs, auth, databases, Prisma, GraphQL, performance and tests. Keep rules easy to find, test and trust.",
  sections: [
    {
      title: "Clean backend code",
      lesson: 0,
      blocks: [
        {
          kind: "points",
          items: [
            "**Name by intent.** Small functions, one job, guard clauses instead of nesting.",
            "**Pure logic in the middle, I/O at the edges.** Pass in the clock, repositories and gateways instead of importing them.",
            "Dependency injection needs no framework: a function that takes its dependencies as arguments.",
            "**DRY is about knowledge**, not text. Abstract on the third repeat. Delete layers that give nothing back.",
            "Automate standards: strict types, lint, CI, architecture checks. Refactor a 600-line controller behind tests, in small steps.",
          ],
        },
        {
          kind: "pairs",
          rows: [
            ["S", "One reason to change per module"],
            ["O", "Add behaviour without editing old code"],
            ["L", "Subtypes work wherever the base type does"],
            ["I", "Small interfaces, no unused methods"],
            ["D", "Depend on abstractions, inject the real thing"],
          ],
        },
      ],
    },
    {
      title: "Layers and folders",
      lesson: 1,
      blocks: [
        {
          kind: "table",
          head: ["Layer", "Does", "Must not"],
          rows: [
            ["Routes", "Match path, add middleware", "Hold logic"],
            ["Controller", "Read `req`, call one service, pick status", "Touch the DB, hold rules"],
            ["Service", "Business rules, transactions", "Import `express`, see `req`"],
            ["Repository", "Queries, rows to objects", "Decide business"],
          ],
        },
        {
          kind: "points",
          items: [
            "Dependencies point **down only**. `req` never enters a service, so a CLI or queue worker can reuse it.",
            "Group **by feature**, with layers inside. Each module exposes a small public surface.",
            "Split `app.ts` (`buildApp()`) from `server.ts` (`listen()`) so tests can import the app.",
            "Input shape: middleware. Business rules and ownership: service. Auth: middleware. Env config: one file checked at startup.",
          ],
        },
      ],
    },
    {
      title: "REST API rules",
      lesson: 2,
      blocks: [
        {
          kind: "table",
          head: ["Operation", "Request", "Success"],
          mono: [1],
          rows: [
            ["List", "GET /orders?status=paid&limit=20", "200"],
            ["Create", "POST /orders", "201 + Location"],
            ["Replace", "PUT /orders/7", "200 or 204"],
            ["Partial", "PATCH /orders/7", "200 or 204"],
            ["Delete", "DELETE /orders/7", "204"],
            ["Async work", "POST /reports", "202 + Location"],
          ],
        },
        {
          kind: "points",
          items: [
            "Nouns for resources, methods for actions, status codes for results. Never `200` for errors.",
            "Always paginate, cap page size, allow only known filters and sorts.",
            "Dates ISO 8601 UTC, money as integer minor units, ids as strings.",
            "Version with `/v1` by default. Prefer additive changes and warn before retiring.",
            "`Idempotency-Key` makes POST safe to retry. `ETag` plus `If-Match` stops lost updates (`412`).",
          ],
        },
      ],
    },
    {
      title: "Status codes to know",
      lesson: 2,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["400 / 422", "Malformed / valid format, bad values"],
            ["401 / 403", "Not logged in / not allowed"],
            ["404", "No such resource (or hidden)"],
            ["409", "Clash with state: duplicate, old version"],
            ["412", "`If-Match` condition false"],
            ["415", "Body format not accepted"],
            ["429", "Rate limited"],
            ["207", "Per-item results of a batch"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "One error format (problem details): stable `code`, message, field paths and a request id.",
        },
      ],
    },
    {
      title: "Validate at the edge",
      lesson: 3,
      blocks: [
        {
          kind: "table",
          head: ["Where", "Trusted?"],
          rows: [
            ["Client", "No: user experience only"],
            ["Server edge", "Yes: reject bad input"],
            ["Business layer", "Yes: rules that need data"],
            ["Database", "Final net: NOT NULL, UNIQUE, CHECK, FK"],
          ],
        },
        {
          kind: "points",
          items: [
            "**Parse, don't validate**: a schema turns input into a typed object (`z.infer` gives the type).",
            "Query and path params arrive as **strings**: coerce them.",
            "**Mass assignment**: one strict schema per endpoint. Fields like `isAdmin` or `role` are set only by the server.",
            "Validation error (`400`/`422`, field paths) is not a business error (`409`/`422`, domain `code`).",
            "Limit body size, parameterise SQL, validate config at startup, share schemas with the frontend.",
          ],
        },
      ],
    },
    {
      title: "Errors and shutdown",
      lesson: 4,
      blocks: [
        {
          kind: "table",
          head: ["Kind", "Operational", "Programmer"],
          rows: [
            ["What", "World misbehaves", "A bug"],
            ["Examples", "Bad input, timeout, no row", "`undefined` property"],
            ["Do", "Handle, map to status, `warn`", "Log `fatal`, `500`, restart"],
          ],
        },
        {
          kind: "points",
          items: [
            "Typed errors with `status`, stable `code` and `cause`. Throw domain errors, map them in **one** central handler.",
            "Express 5 forwards rejected async handlers. Express 4 needs a wrapper.",
            "Never catch `uncaughtException` and carry on. Log, exit, let a supervisor restart.",
            "Log the error once. Return a request id, not a stack trace.",
          ],
        },
        {
          kind: "code",
          lang: "ts",
          code: "process.on(\"SIGTERM\", () => {\n  server.close(() =>\n    prisma.$disconnect()\n      .finally(() => process.exit(0)));\n  setTimeout(() => process.exit(0),\n    10_000).unref();\n});",
          note: "Retry only idempotent, short failures, with backoff and jitter. Set timeouts.",
        },
      ],
    },
    {
      title: "Logs, metrics, traces",
      lesson: 5,
      blocks: [
        {
          kind: "table",
          head: ["Pillar", "Answers"],
          rows: [
            ["Logs", "What happened, in detail"],
            ["Metrics", "How much, how often, how fast"],
            ["Traces", "Where the time went across services"],
          ],
        },
        {
          kind: "points",
          items: [
            "Structured JSON logs to stdout with **pino**, with secret redaction. Levels: `fatal error warn info debug trace`.",
            "A **request id** on every line: `AsyncLocalStorage` carries it, return it, pass it to other services.",
            "Fixed message, variables in fields. Never log passwords, tokens or personal data.",
            "**RED**: rate, errors, duration (p50/p95/p99, not averages). **USE** for resources. Add event-loop lag.",
            "Log the route pattern `/orders/:id`, not the raw path. Alert on symptoms, add a runbook.",
          ],
        },
      ],
    },
    {
      title: "Passwords and sessions",
      lesson: 6,
      blocks: [
        {
          kind: "points",
          items: [
            "Hash with **Argon2id**, then scrypt, then bcrypt (cost 10 or more, 72-byte limit). Never SHA-256 or MD5.",
            "Salt per password is built in. Pick settings costing tens of milliseconds and rehash on login when they change.",
            "Use the async API (hashing blocks the loop). Rate-limit login, give one generic error to stop user enumeration.",
            "Session ids: high entropy, renew on login (stops **session fixation**).",
          ],
        },
        {
          kind: "table",
          head: ["Model", "Idea"],
          rows: [
            ["RBAC", "Roles hold permissions; role explosion risk"],
            ["ABAC", "Rules on user, resource and context"],
            ["ReBAC", "Access from relationships (owner, member)"],
            ["Ownership", "`resource.ownerId === user.id`"],
          ],
        },
      ],
    },
    {
      title: "Authorization",
      lesson: 6,
      blocks: [
        {
          kind: "code",
          lang: "ts",
          code: "// ownership lives in the query\nconst order = await db.order\n  .findFirst({\n    where: { id, userId: user.id },\n  });\nif (!order) throw new NotFound();",
          note: "Not yours returns 404, so you do not reveal that it exists.",
        },
        {
          kind: "points",
          items: [
            "Most severe bugs are missing object-level checks: `/orders/123` becomes `/orders/124`.",
            "Limit every query by owner or tenant. Keep rules in policy functions. **Default deny.**",
            "Take roles and ids from the session, never from the request body.",
            "Test three cases: another user, no user, a lower role.",
          ],
        },
      ],
    },
    {
      title: "Indexes and EXPLAIN",
      lesson: 7,
      blocks: [
        {
          kind: "points",
          items: [
            "An index trades **slower writes for faster reads**. Design it from real queries.",
            "Composite `(user_id, status, created_at)` works for the leftmost prefix. `WHERE status = ...` alone does not use it.",
            "Index foreign keys yourself in PostgreSQL.",
            "No help: tiny tables, low selectivity, functions on the column, leading wildcard `LIKE`.",
          ],
        },
        {
          kind: "table",
          head: ["Plan node", "Meaning"],
          rows: [
            ["Seq Scan", "Whole table; red flag on big ones"],
            ["Index Scan", "Walk index, then fetch rows"],
            ["Index Only Scan", "Answered from the index alone"],
            ["Sort (Disk)", "Index gave no order; spilled to disk"],
            ["Nested Loop, big loops", "N+1 inside the database"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Run `EXPLAIN (ANALYZE, BUFFERS)`. Compare estimated and actual rows.",
        },
      ],
    },
    {
      title: "Transactions and races",
      lesson: 7,
      blocks: [
        {
          kind: "table",
          head: ["PostgreSQL level", "Behaviour"],
          rows: [
            ["Read Committed (default)", "Each statement sees committed data; lost updates possible"],
            ["Repeatable Read", "One snapshot; may fail, retry"],
            ["Serializable", "Stops write skew; always retry"],
          ],
        },
        {
          kind: "code",
          lang: "sql",
          code: "UPDATE products\nSET stock = stock - 1\nWHERE id = $1 AND stock >= 1;\n-- 1 row = reserved, 0 = sold out",
          note: "Overselling fix. Others: `SELECT ... FOR UPDATE`, a `version` column, `CHECK (stock >= 0)`.",
        },
        {
          kind: "points",
          items: [
            "ACID: atomic, consistent, isolated, durable (write-ahead log). Keep transactions **short**.",
            "Fix races in the database, not with `if` in app code. Use `UNIQUE` for \"only one\" rules.",
            "Deadlock: lock in a consistent order, retry the loser.",
          ],
        },
      ],
    },
    {
      title: "Prisma: N+1 and pools",
      lesson: 8,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["include / select", "Eager load; `select` trims the payload"],
            ["`in` query", "Batch by hand: one query for all ids"],
            ["DataLoader", "Batch per tick; new loader per request"],
            ["_count", "Count in the DB, not by loading rows"],
            ["createMany", "Batch writes instead of loops"],
          ],
        },
        {
          kind: "points",
          items: [
            "**N+1**: one query for the list, then one per row. Find it by logging query counts.",
            "Prisma batches same-tick `findUnique` calls automatically.",
            "One `PrismaClient` per process (the `globalThis` trick for hot reload).",
            "Serverless: a pooler (PgBouncer) plus a small pool per instance (1 to 5).",
            "Migrations must be backward compatible. Interactive transactions hold a connection.",
          ],
        },
      ],
    },
    {
      title: "REST, GraphQL, Hasura",
      lesson: 9,
      blocks: [
        {
          kind: "table",
          head: ["Aspect", "REST", "GraphQL"],
          rows: [
            ["Shape", "Server decides", "Client picks fields"],
            ["Caching", "HTTP, simple", "Hard: one POST URL"],
            ["Fetching", "Over/under-fetch", "Exact data"],
            ["Risk", "Endpoint sprawl", "Cost, N+1, authz"],
          ],
        },
        {
          kind: "points",
          items: [
            "GraphQL needs limits on depth and cost, page-size caps, persisted queries, per-field authorization and a dataloader per request.",
            "Errors come back as `200` with an `errors` array: monitor that.",
            "Evolve by adding fields and deprecating. **Hasura** gives instant GraphQL on Postgres, but logic lives in metadata.",
            "Choose by how different your clients are and your caching needs, not fashion.",
          ],
        },
      ],
    },
    {
      title: "Node performance",
      lesson: 10,
      blocks: [
        {
          kind: "points",
          items: [
            "Node runs JS on **one thread**: a slow sync task stalls every request. Watch event-loop lag.",
            "Blockers: big `JSON.parse`, sync fs, heavy regex, CPU loops, sync crypto.",
            "The libuv pool (default 4) serves fs, DNS lookup, some crypto and zlib.",
            "**Stream** big data with `pipeline` (backpressure), or use presigned URLs. `async/await` is not parallel.",
          ],
        },
        {
          kind: "table",
          head: ["Option", "Use for"],
          rows: [
            ["cluster / PM2", "All cores for an I/O-bound API"],
            ["worker_threads", "CPU-bound work"],
            ["child_process", "Other programs (ffmpeg)"],
            ["More containers", "The usual cloud answer"],
          ],
        },
      ],
    },
    {
      title: "Testing",
      lesson: 11,
      blocks: [
        {
          kind: "table",
          head: ["Level", "Tests", "Share"],
          rows: [
            ["Unit", "Pure logic, policies", "Many"],
            ["Integration", "HTTP to a real database", "Thick layer"],
            ["Contract", "Frontend and backend agree", "A few"],
            ["E2E", "Login, checkout", "Very few"],
          ],
        },
        {
          kind: "points",
          items: [
            "**Mock the edges**, not your own code. A mocked DB hides bad SQL and constraints.",
            "Cover unhappy paths: validation, auth, other users, conflicts, dependency failures.",
            "Concurrency rule? Fire parallel requests at the last item in stock.",
            "Keep tests independent, deterministic and fast. Flakiness is a bug. Coverage is not the goal.",
          ],
        },
      ],
    },
    {
      title: "Interview one-liners",
      lesson: 11,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["Controller vs service", "HTTP in one, business rules in the other"],
            ["Safe POST retry", "`Idempotency-Key` stored in the DB"],
            ["Stop mass assignment", "Strict schema per endpoint"],
            ["Operational vs bug", "Handle it vs log and restart"],
            ["Intermittent 500", "Request id, structured logs, traces"],
            ["Store passwords", "Argon2id, salted, slow, async"],
            ["IDOR on /orders/124", "Filter the query by owner"],
            ["Overselling", "Atomic conditional `UPDATE`"],
            ["p99 spikes", "Something blocks the event loop"],
          ],
        },
      ],
    },
  ],
};
