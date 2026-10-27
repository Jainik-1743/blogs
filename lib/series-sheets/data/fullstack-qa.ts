import type { CheatSheet } from "../types.ts";

/** Cheat sheet for the "fullstack-qa" series. See scripts/SERIES-SHEETS.md. */
export const SHEET: CheatSheet | null = {
  intro:
    "The facts a 4+ year full-stack interview probes: current versions, comparison tables, traps and short model answers. Versions used in the lessons: Tailwind 4, TypeScript 7, React 19, Next.js 16, Express 5, Prisma 7.",
  sections: [
    {
      title: "HTML and CSS",
      lesson: 1,
      blocks: [
        {
          kind: "table",
          head: ["Attribute", "Behaviour"],
          mono: [0],
          rows: [
            ["defer", "Parallel download, runs after parsing, in order"],
            ["async", "Runs on arrival, no fixed order (analytics)"],
            ["preload / preconnect", "Fetch a known file now / open the connection early"],
            ["fetchpriority=\"high\"", "Eager hint for the one LCP image"],
          ],
        },
        {
          kind: "points",
          items: [
            "Cascade: importance and layers, then specificity (IDs, classes, types), then order. **Unlayered CSS beats layers.**",
            "`:where()` scores zero; `:is()` takes its strongest argument. `border-box` makes width include padding and border.",
            "Flex item overflows: `min-width: 0`. Margin collapse is vertical only; `display: flow-root` stops it.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "`z-index` only works inside a stacking context, and `opacity` or `transform` on a parent traps it. Sticky fails under `overflow: hidden`.",
        },
      ],
    },
    {
      title: "Tailwind CSS v4",
      lesson: 2,
      blocks: [
        {
          kind: "table",
          head: ["v3 habit", "v4"],
          rows: [
            ["`@tailwind base; ...`", "`@import \"tailwindcss\";`"],
            ["`tailwind.config.js` and `content`", "`@theme { }` in CSS; automatic detection"],
            ["`darkMode: 'class'`", "`@custom-variant dark (...)`"],
            ["`bg-[--brand]`", "`bg-(--brand)`"],
            ["`shadow-sm`, `outline-none`, `ring`", "`shadow-xs`, `outline-hidden`, `ring-3`"],
          ],
        },
        {
          kind: "points",
          items: [
            "Tailwind reads files as **plain text**: write full class names. `bg-${color}-500` is never generated.",
            "`cn()` = `clsx` (join, skip falsy) + `twMerge` (last conflicting class wins). `cva` builds variant props.",
            "`@theme inline` when a token points at another variable. `hover:` only fires on hover-capable devices.",
          ],
        },
      ],
    },
    {
      title: "TypeScript 6 and 7",
      lesson: 3,
      blocks: [
        {
          kind: "table",
          head: ["Old belief", "Now"],
          rows: [
            ["`strict` is off by default", "On by default"],
            ["`@types/*` load automatically", "`types` is empty: add `\"types\": [\"node\"]`"],
            ["`baseUrl` with `paths`", "`baseUrl` removed; put the prefix in `paths`"],
            ["`moduleResolution: node`", "Removed: `bundler` or `nodenext`"],
          ],
        },
        {
          kind: "pairs",
          rows: [
            ["noUncheckedIndexedAccess", "`arr[0]` is `T | undefined`"],
            ["exactOptionalPropertyTypes", "`x?: T` means missing, not `undefined`"],
            ["verbatimModuleSyntax", "Needs `import type` (error TS1484)"],
            ["erasableSyntaxOnly", "No `enum` or parameter properties"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "`unknown` = check before use, `any` = skip checks, `never` = impossible. Prefer an `as const` object plus union over `enum`.",
        },
      ],
    },
    {
      title: "React 19 reviews",
      lesson: 4,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["useEffect(() => setX(f(y)), [y])", "Derived state: compute during render"],
            ["fetch in effect, no cleanup", "Race: `AbortController` or a data library"],
            ["Context value `{{ a, b }}` inline", "New object every render: memoize or split"],
            ["`key={i}` on a changing list", "State moves to the wrong row: stable id"],
            ["`{n && <A/>}` with `n = 0`", "Renders `0`: use `n > 0 &&`"],
            ["`items.sort()` on state", "Mutates: `[...items].sort()` or `toSorted()`"],
          ],
        },
        {
          kind: "table",
          head: ["Feature", "Version"],
          rows: [
            ["`use`, Actions, `useActionState`, `useOptimistic`", "19.0"],
            ["`ref` as a prop; Context as its own provider", "19.0"],
            ["`Activity`, `useEffectEvent`", "19.2"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "`useFormStatus` only sees a parent form element. Actions reset uncontrolled fields: return the submitted values.",
        },
      ],
    },
    {
      title: "Next.js 16",
      lesson: 5,
      blocks: [
        {
          kind: "points",
          items: [
            "Server Components by default. A Client Component also runs on the server when prerendering.",
            "`params`, `searchParams`, `cookies()` are Promises: **await** them. `middleware.ts` is now `proxy.ts` (Node runtime).",
            "Turbopack is the default. Caching is opt-in with `use cache`; `fetch` is not cached by default.",
          ],
        },
        {
          kind: "table",
          head: ["Function", "Use"],
          mono: [0],
          rows: [
            ["updateTag(t)", "Server Actions only. Expire now (read your own writes)"],
            ["revalidateTag(t, \"max\")", "Mark stale; serve old while rebuilding"],
            ["revalidatePath(p)", "One route, less precise"],
            ["refresh()", "Re-fetch the current route payload"],
          ],
        },
        {
          kind: "code",
          lang: "ts",
          code: "export async function getProducts() {\n  \"use cache\";\n  cacheLife(\"hours\");\n  cacheTag(\"products\");\n  return db.product.findMany();\n}",
        },
        {
          kind: "callout",
          tone: "warn",
          text: "A Server Action is a public POST. Authenticate, validate, and authorize inside it. `NEXT_PUBLIC_` values are frozen at build.",
        },
      ],
    },
    {
      title: "Node.js and Express 5",
      lesson: 6,
      blocks: [
        {
          kind: "points",
          items: [
            "Order: sync code, `nextTick`, promises, timers, I/O, `setImmediate`. In ES modules, promises run before `nextTick`.",
            "The libuv pool has 4 threads by default (`fs`, `dns.lookup`, `zlib`, some crypto). Network I/O does not use it.",
            "Respect `write()` returning `false`, or use `pipeline()`.",
          ],
        },
        {
          kind: "table",
          head: ["Tool", "Use it for"],
          rows: [
            ["worker_threads", "CPU-heavy work in one process"],
            ["cluster", "All cores on one machine, shared port"],
            ["child_process", "Other programs (`ffmpeg`, Python)"],
          ],
        },
        {
          kind: "table",
          head: ["Express 4", "Express 5"],
          rows: [
            ["Async errors need `.catch(next)`", "Rejections reach the error handler"],
            ["`/*`", "`/*splat` (array in `req.params`)"],
            ["`req.body` is `{}` without parser", "`undefined`"],
          ],
        },
      ],
    },
    {
      title: "MongoDB",
      lesson: 7,
      blocks: [
        {
          kind: "table",
          head: ["Embed when", "Reference when"],
          rows: [
            ["Read together, small, bounded list", "Child read alone, or shared by many parents"],
            ["Child changes only with the parent", "Child changes often; list can grow forever"],
          ],
        },
        {
          kind: "points",
          items: [
            "One document is always atomic. Limit is **16 MiB**, so unbounded arrays are the top anti-pattern.",
            "Compound index order: **Equality, Sort, Range**. TTL index needs a date; it runs about every 60 s.",
            "Only one text index per collection. Multikey: at most one array field per compound index.",
            "ObjectId is 12 bytes (time, random, counter). Never compare it with a plain string.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Use `w: \"majority\"` for important writes. Transactions are for multi-document work, not one order with embedded items.",
        },
      ],
    },
    {
      title: "Prisma 7 and SQL traps",
      lesson: 8,
      blocks: [
        {
          kind: "table",
          head: ["Command", "Where"],
          mono: [0],
          rows: [
            ["migrate dev", "Local only; shadow database"],
            ["migrate deploy", "CI and production; never resets"],
            ["db push", "Prototypes; no migration file"],
            ["migrate resolve", "Fix history without running SQL"],
          ],
        },
        {
          kind: "points",
          items: [
            "In v7, `migrate dev` no longer runs `generate` or seed. The URL lives in `prisma.config.ts`.",
            "Sequential `$transaction([...])` vs interactive `async (tx)`: only the second can use earlier results.",
            "`include` runs 2 queries by default; `relationJoins` makes it 1.",
            "Use tagged `$queryRaw`. `$queryRawUnsafe` with joined strings is an injection hole.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "SQL traps: `NOT IN` with `NULL`, `LEFT JOIN` plus `WHERE`, join fan-out, window frames. Set a pool timeout.",
        },
      ],
    },
    {
      title: "GraphQL and Hasura",
      lesson: 9,
      blocks: [
        {
          kind: "table",
          head: ["Aspect", "Hasura v2", "Hasura v3 (DDN)"],
          rows: [
            ["Engine", "Haskell, talks to the DB", "Rust, via data connectors"],
            ["Config", "Metadata, `hasura` CLI", "OpenDD, `ddn` CLI"],
            ["Schema", "One per role", "One built schema, role annotations"],
          ],
        },
        {
          kind: "points",
          items: [
            "Hasura compiles GraphQL to one SQL statement, so DB relations avoid N+1. **Index your columns.**",
            "Permissions per role, table and operation use session variables (JWT claims or webhook).",
            "Event triggers are at least once; retries are off by default. Make handlers idempotent.",
            "Plain GraphQL: per-request DataLoader, `!` bubbles to the nearest nullable parent, cursors beat offset on deep pages.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Community Edition (v2) has no API limits, `@cached` or per-role introspection control.",
        },
      ],
    },
    {
      title: "LLMs, agents and RAG",
      lesson: 10,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["Workflow", "Code decides the path (chain, route, parallel, evaluator)"],
            ["Agent", "Model uses tools in a loop with a stop rule"],
            ["MCP tools", "Model calls them (`get_order`)"],
            ["MCP resources", "App reads them (URI)"],
            ["MCP prompts", "User picks them (slash command)"],
          ],
        },
        {
          kind: "table",
          head: ["RAG symptom", "Fix"],
          rows: [
            ["Right doc exists, not retrieved", "Hybrid search, better chunks, reranker"],
            ["Model ignores good context", "Fewer, better chunks; rerank"],
            ["Confident with no source", "Score threshold and a refuse path"],
            ["Leaks private data", "Filter by ACL inside the query"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Prompt first, RAG for your changing data, fine-tune for style. Measure recall@k, MRR, faithfulness. AI SDK: set `stopWhen` or the loop stops after one step.",
        },
      ],
    },
    {
      title: "Redis caching",
      lesson: 18,
      blocks: [
        {
          kind: "table",
          head: ["Pattern", "Write path"],
          rows: [
            ["Cache-aside", "Write the DB, then delete the key"],
            ["Write-through", "Cache and DB together; both agree"],
            ["Write-behind", "Cache first, DB later; can lose writes"],
          ],
        },
        {
          kind: "pairs",
          rows: [
            ["Hash", "A session or user's fields"],
            ["Sorted set", "Leaderboard, delayed jobs, rate window"],
            ["Stream", "Reliable queue with consumer groups"],
            ["HyperLogLog", "Approximate unique count"],
          ],
        },
        {
          kind: "points",
          items: [
            "Stampede: single-flight, `SET k v NX PX`, early refresh, or serve stale. Always a TTL with jitter.",
            "RDB = snapshot; AOF = log (`everysec` loses about 1 s). Neither is a backup.",
            "Default eviction is `noeviction`. Caches want `allkeys-lru` or `allkeys-lfu`.",
          ],
        },
      ],
    },
    {
      title: "Queues and webhooks",
      lesson: 19,
      blocks: [
        {
          kind: "table",
          head: ["Delivery", "Meaning"],
          rows: [
            ["At-most-once", "May be lost, never repeated"],
            ["At-least-once", "Never lost, may repeat"],
            ["Exactly-once", "Only special closed setups"],
          ],
        },
        {
          kind: "points",
          items: [
            "Build **at-least-once plus idempotent** handlers. Retries: attempts, backoff with jitter, dead-letter queue.",
            "**Outbox**: event row and business row in one transaction, then a relay publishes.",
            "Webhooks: raw body, HMAC with constant-time compare, timestamp check, fast `2xx`, dedupe by event id.",
          ],
        },
        {
          kind: "table",
          head: ["Trait", "RabbitMQ", "Kafka", "SQS"],
          rows: [
            ["Replay", "No", "Yes (offset)", "No"],
            ["Order", "Per queue", "Per partition", "FIFO group"],
          ],
        },
      ],
    },
    {
      title: "Auth: OAuth, OIDC, sessions",
      lesson: 22,
      blocks: [
        {
          kind: "table",
          head: ["Token", "Purpose", "Keep it"],
          rows: [
            ["Access", "Call an API; minutes", "Server side"],
            ["Refresh", "Get new access tokens", "Server only"],
            ["ID (JWT)", "Who logged in; read once", "Not stored"],
          ],
        },
        {
          kind: "pairs",
          rows: [
            ["`state`", "Stops login CSRF"],
            ["PKCE verifier", "Stops code theft"],
            ["`nonce`", "Stops ID token replay"],
          ],
        },
        {
          kind: "points",
          items: [
            "OAuth = what may this app do; OIDC = who is this user. Use code flow with PKCE; no implicit or password grant.",
            "Database sessions revoke at once. JWT sessions cannot before expiry.",
            "Link accounts only on a verified email. Passkeys are phishing-resistant; TOTP is phishable.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "`proxy.ts` is an optimistic check only. Check again in the data layer, every action, and inside the query.",
        },
      ],
    },
    {
      title: "Testing",
      lesson: 21,
      blocks: [
        {
          kind: "table",
          head: ["Double", "Real code?", "Use"],
          rows: [
            ["Stub", "No", "Fixed answer"],
            ["Spy", "Yes", "Check a call happened"],
            ["Mock", "No", "Check how it was called"],
            ["Fake", "Simple version", "Replace a database or queue"],
          ],
        },
        {
          kind: "pairs",
          rows: [
            ["getBy...", "Throws if missing: must be there"],
            ["queryBy...", "Returns `null`: assert it is absent"],
            ["findBy...", "Waits: it appears soon"],
          ],
        },
        {
          kind: "points",
          items: [
            "Vitest globals are off; `vi.mock` is hoisted (`vi.hoisted`). MSW fakes the network, not `fetch`.",
            "Playwright: use retrying `expect`, never `waitForTimeout`. Test the DB with the real engine.",
            "Coverage shows untested code, not tested behaviour.",
          ],
        },
      ],
    },
    {
      title: "Deploy, Docker and ops",
      lesson: 26,
      blocks: [
        {
          kind: "table",
          head: ["Strategy", "Trade-off"],
          rows: [
            ["Rolling", "Cheap; old and new run together"],
            ["Blue-green", "Instant rollback; double capacity"],
            ["Canary", "Few users hurt; needs metrics"],
            ["Recreate", "Simple; downtime"],
          ],
        },
        {
          kind: "points",
          items: [
            "Dockerfile: multi-stage, copy the lockfile first, `npm ci`, `.dockerignore`, non-root `USER`, start `node` directly.",
            "Migrations: expand then contract. Never drop or rename in the same release.",
            "Logs say what, metrics say that something is wrong, traces say where.",
          ],
        },
        {
          kind: "table",
          head: ["SLO", "Downtime in 30 days"],
          rows: [
            ["99.9%", "43.2 minutes"],
            ["99.99%", "4.3 minutes"],
          ],
        },
      ],
    },
    {
      title: "Interview one-liners",
      lesson: 24,
      blocks: [
        {
          kind: "table",
          head: ["Question", "Short answer"],
          rows: [
            ["Merge vs rebase?", "Merge keeps history. Rebase rewrites it. Never rebase shared commits."],
            ["reset vs revert?", "`reset` moves the branch. `revert` adds an undo commit (safe if pushed)."],
            ["Safe force push?", "`--force-with-lease`, plus `--force-if-includes`."],
            ["Trunk-based vs Gitflow?", "Trunk with flags for web apps. Gitflow for parallel versions."],
            ["`^1.2.3` vs `~1.2.3`?", "`<2.0.0` vs `<1.3.0`. The lockfile is the truth; use `npm ci`."],
            ["Password hashing?", "Argon2id (OWASP e.g. `m=19456, t=2, p=1`). bcrypt cuts input at 72 bytes."],
            ["SSRF defence?", "Allow `http(s)`, check resolved IPs, no redirects, isolate."],
            ["SSE or WebSocket?", "SSE server to browser; WebSocket two-way. Add heartbeat."],
          ],
        },
      ],
    },
  ],
};
