import type { CheatSheet } from "../types.ts";

/** Cheat sheet for the "debugging" series. See scripts/SERIES-SHEETS.md. */
export const SHEET: CheatSheet | null = {
  intro:
    "Symptom, likely cause, how to check, fix. Always measure and isolate before you change code, and finish with a guard so the problem does not return.",
  sections: [
    {
      title: "The four moves and the first fork",
      lesson: 0,
      blocks: [
        {
          kind: "steps",
          items: [
            "**Measure**: what, how slow vs what, for whom, since when, what changed. Use p50, p95, p99, not averages.",
            "**Isolate**: which layer owns the time? Network, server, database, main thread, render.",
            "**Hypothesize**: one cause that can be proved wrong. Bisect, remove, compare fast with slow.",
            "**Verify**: change one thing, compare with the baseline, then add a guard (budget, test, alert).",
          ],
        },
        {
          kind: "table",
          head: ["Network timing is large in", "Meaning"],
          rows: [
            ["DNS, connect, SSL", "Distance, no keep-alive, many origins"],
            ["Waiting (TTFB)", "**Backend**: code, DB, external calls, cold start"],
            ["Content download", "Big payload, no compression"],
          ],
        },
      ],
    },
    {
      title: "API fast, UI slow",
      lesson: 1,
      blocks: [
        {
          kind: "table",
          head: ["Suspect", "Fix"],
          rows: [
            ["Too many DOM nodes (tens of thousands)", "Paginate, virtualise, `content-visibility: auto`"],
            ["Huge payload, slow JSON.parse", "Send fewer fields, Brotli, Web Worker, stream NDJSON"],
            ["Re-render storm", "Colocate state, `memo`, split context, selectors"],
            ["Hydration cost", "Server Components, code split, Suspense"],
            ["Client waterfall", "`Promise.all`, fetch on server, prefetch"],
          ],
        },
      ],
    },
    {
      title: "Slow endpoint (TTFB) and caching",
      lesson: 2,
      blocks: [
        {
          kind: "table",
          head: ["Suspect", "Check", "Fix"],
          rows: [
            ["N+1 queries", "Trace shows 100+ similar queries", "`include`, join, `IN`, DataLoader"],
            ["Missing index", "`EXPLAIN (ANALYZE, BUFFERS)`: Seq Scan", "Composite index; `CREATE INDEX CONCURRENTLY`"],
            ["Unbounded query", "`SELECT *` with no limit", "`LIMIT`, cursor, fewer columns"],
            ["Serial external calls", "Waterfall of spans", "`Promise.all`, timeout, breaker"],
            ["Pool exhausted", "Pool wait, fast queries", "Short transactions, pooler"],
          ],
        },
        {
          kind: "points",
          items: [
            "Cache last. Cache-aside with a TTL, explicit delete on write, or versioned keys (`product:v2:id`).",
            "Stampede: single flight, a short lock, jittered TTLs, stale-while-revalidate.",
          ],
        },
      ],
    },
    {
      title: "Re-renders",
      lesson: 3,
      blocks: [
        {
          kind: "points",
          items: [
            "A component re-renders when its **state** changes, its **parent** renders, a **context** it reads changes, or its **store** slice changes.",
            "Profile first: React DevTools Profiler, \"why did this render\", highlight updates.",
          ],
        },
        {
          kind: "steps",
          items: [
            "**Colocate state**: move it down into the small component that uses it.",
            "**Pass children**: elements made by the parent are not re-created.",
            "**Split** fast-changing parts from slow, expensive ones.",
            "`memo` with **stable props**. It fails with new `{}`, `[]` or `() =>` each render.",
            "`useMemo` and `useCallback` on purpose. Split contexts or use selectors.",
          ],
        },
      ],
    },
    {
      title: "Memory leaks",
      lesson: 4,
      blocks: [
        {
          kind: "table",
          head: ["Source", "Fix"],
          rows: [
            ["addEventListener never removed", "Remove in effect cleanup, same function reference"],
            ["setInterval, subscriptions, sockets", "Clear or unsubscribe on unmount"],
            ["Detached DOM nodes", "Drop references; destroy chart or map instances"],
            ["Cache or array that only grows", "LRU with max size or TTL"],
          ],
        },
        {
          kind: "steps",
          items: [
            "Performance monitor: healthy is a sawtooth, a leak is a staircase.",
            "Memory tab: force GC, snapshot 1, repeat the action 10 times, GC, snapshot 2.",
            "Compare; sort by retained size; filter \"Detached\". Counts that grow with the repeats are the leak.",
            "Read the **Retainers** chain, fix it, repeat and compare.",
          ],
        },
      ],
    },
    {
      title: "Async bugs in the frontend",
      lesson: 5,
      blocks: [
        {
          kind: "table",
          head: ["Bug", "Fix"],
          rows: [
            ["Effect fetches twice in dev (Strict Mode)", "Make it idempotent with cleanup. Do not remove Strict Mode"],
            ["Old response overwrites new (race)", "`AbortController` in cleanup, or an `ignore` flag, or React Query or SWR"],
            ["Double submit", "Disable button, pending state; server `Idempotency-Key` plus unique constraint"],
            ["Own app causes 429", "Dedupe, poll less, pause when hidden, back off, honour `Retry-After`"],
            ["Stale closure in interval or handler", "`setCount(c => c + 1)`, refs, `useEffectEvent`, right deps"],
          ],
        },
        {
          kind: "code",
          lang: "tsx",
          code:
            "useEffect(() => {\n  const c = new AbortController();\n  fetch(url, { signal: c.signal })\n    .then(r => r.json()).then(setData)\n    .catch(e => {\n      if (e.name !== \"AbortError\") setErr(e);\n    });\n  return () => c.abort();\n}, [url]);",
          note: "Debounce cuts the number of requests. Abort makes the latest one win.",
        },
      ],
    },
    {
      title: "Bundle size and LCP",
      lesson: 6,
      blocks: [
        {
          kind: "steps",
          items: [
            "Measure: `next experimental-analyze`, `source-map-explorer`, Lighthouse. Quote parsed and compressed size.",
            "Quick wins: remove dead deps, `lodash-es` single imports, drop duplicate versions, modern `browserslist`.",
            "Split heavy parts (charts, editors, PDF) with dynamic `import()`. Move formatting to Server Components.",
            "Brotli, hashed files with `immutable`, CDN. Lock in a budget (`size-limit`, Lighthouse CI).",
          ],
        },
        {
          kind: "table",
          head: ["Hint", "Use"],
          rows: [
            ["preload", "Needed now: LCP image, key font"],
            ["prefetch", "Likely next page, idle priority"],
            ["preconnect", "Critical third-party origin"],
          ],
        },
      ],
    },
    {
      title: "Long lists and tables",
      lesson: 7,
      blocks: [
        {
          kind: "table",
          head: ["Need", "Choose"],
          rows: [
            ["Huge, searchable, shareable pages", "Server-side pagination"],
            ["Skimmed feed", "Infinite scroll with a cap"],
            ["Big table or log, scrolled a lot", "Virtualization with overscan"],
            ["Long page that rarely changes", "`content-visibility: auto`"],
            ["Heavy sort or filter", "Web Worker, or the server with indexes"],
          ],
        },
        {
          kind: "points",
          items: [
            "Cost: set `aria-rowcount` and `aria-rowindex`; Ctrl+F, focus and print only see drawn rows.",
            "50k-row sort freezes: virtualise, `memo` rows with stable keys, sort once in `useMemo`, then worker or server.",
          ],
        },
      ],
    },
    {
      title: "Layout shift (CLS) and INP",
      lesson: 8,
      blocks: [
        {
          kind: "table",
          head: ["CLS cause", "Fix"],
          rows: [
            ["Image or iframe with no size", "`width` and `height` or `aspect-ratio`"],
            ["Late ad, embed, banner", "Reserve `min-height`; add below content"],
            ["Font swap", "`font-display: swap` plus matched fallback metrics"],
            ["Animating top, height", "Animate `transform`, `opacity`"],
          ],
        },
        {
          kind: "table",
          head: ["INP cause", "Fix"],
          rows: [
            ["Heavy handler", "Do the minimum, defer: `startTransition`, `scheduler.yield()`"],
            ["Input re-renders page", "Colocate state, `useDeferredValue`"],
            ["Giant controlled form", "Uncontrolled inputs, React Hook Form, validate on blur"],
          ],
        },
      ],
    },
    {
      title: "Production symptoms",
      lesson: 9,
      blocks: [
        {
          kind: "table",
          head: ["Symptom", "Likely cause and fix"],
          rows: [
            ["CORS error in prod only", "Exact origin allow-list; CORS before auth so the `OPTIONS` preflight gets 2xx"],
            ["Random logouts", "Session store TTL or eviction, refresh race (one refresh promise), different secrets"],
            ["ChunkLoadError after deploy", "Old chunks deleted: HTML `no-cache`, hashed names, keep last builds"],
            ["Intermittent 502 or 504", "Node `keepAliveTimeout` above LB idle timeout (65 s vs 60 s)"],
            ["Too many DB connections", "Instances x pool size; use a pooler, one client per process"],
            ["Charged twice", "Idempotency key end to end, pass to provider, idempotent consumers"],
          ],
        },
      ],
    },
    {
      title: "Incident playbook",
      lesson: 10,
      blocks: [
        {
          kind: "steps",
          items: [
            "**Declare** early and assign roles: commander, investigator, communicator. Keep a timeline.",
            "**Assess** who, how badly, getting worse? Set a SEV level.",
            "**Mitigate before diagnosing**: roll back or flag off, then scale or shed load, fail over, isolate.",
            "**Investigate**: what changed? Dashboards (RED), deploys, errors, logs by request ID, traces, saturation.",
            "**Communicate** often. **Verify** in metrics. Write a **blameless postmortem**: prevent, detect, mitigate items.",
          ],
        },
        {
          kind: "pairs",
          rows: [
            ["10x traffic", "Cache or stale, scale out, rate limit with 429, degrade, block abuse"],
            ["Cascade from slow dependency", "Breaker, short timeouts, bulkhead, flag it off"],
            ["Queue backing up", "Poison message to DLQ, fix consumer, scale"],
          ],
        },
      ],
    },
    {
      title: "Backend scenarios",
      lesson: 11,
      blocks: [
        {
          kind: "table",
          head: ["Symptom", "Cause and fix"],
          rows: [
            ["500 for some users", "Request ID, stack trace, what they share. Validate input, backfill data"],
            ["Coupon used twice under load", "Check-then-write race: atomic `UPDATE`, unique constraint, lock"],
            ["Pool timeouts, DB CPU low", "Long transactions; no network calls inside them"],
            ["Webhook duplicated or out of order", "Dedupe by event ID, idempotent handler, verify signature, reply 2xx fast"],
            ["List slower deeper", "Offset: switch to keyset with a composite index"],
            ["Report endpoint times out", "Return `202` with a job id; worker; poll"],
            ["Migration froze the table", "`CONCURRENTLY`, `NOT VALID`, `lock_timeout = '3s'`"],
          ],
        },
      ],
    },
    {
      title: "Frontend scenarios",
      lesson: 12,
      blocks: [
        {
          kind: "table",
          head: ["Symptom", "Cause and fix"],
          rows: [
            ["List stale after a save", "`invalidateQueries`, `setQueryData`, or `revalidatePath`"],
            ["Slow on old phones", "CPU throttle 4x to 6x; less JS, Server Components, lazy load"],
            ["5,000 updates a second", "Batch and flush every 100 to 250 ms; latest per key; cap history"],
            ["SPA not indexed, empty share", "SSR or static, with title, canonical and Open Graph in HTML"],
            ["Flaky E2E tests", "Auto-waiting locators, own data per test, mock third parties, trace"],
          ],
        },
      ],
    },
    {
      title: "Security scenarios",
      lesson: 13,
      blocks: [
        {
          kind: "table",
          head: ["Attack", "Root fix"],
          rows: [
            ["Stored XSS", "Escape; allow-list sanitiser for HTML; check URLs; CSP"],
            ["IDOR (/orders/124)", "Scope every query to owner or tenant; return 404"],
            ["Password reset takeover", "Single-use hashed token, short life, same reply for all emails, config base URL"],
            ["CORS reflects any origin", "Exact allow-list; no `*` with credentials; no `endsWith`"],
            ["SQL injection", "Parameterised queries everywhere"],
            ["SSRF in link preview", "Block private, loopback, link-local IPs; limit redirects; IMDSv2"],
            ["Leaked key in Git", "Rotate first, then clean history"],
          ],
        },
      ],
    },
    {
      title: "Engineering judgement",
      lesson: 14,
      blocks: [
        {
          kind: "steps",
          items: [
            "Clarify goal and limits. List 2 or 3 options, including do nothing.",
            "Compare on risk, cost, time, ease to undo. Recommend one and say what would change your mind.",
            "Roll out in small steps with a rollback and a measure. Tell stakeholders outcomes and risks.",
          ],
        },
        {
          kind: "pairs",
          rows: [
            ["Monolith or microservices?", "Fix tests, CI, flags first; modular monolith; extract with strangler"],
            ["Rewrite or refactor?", "Strangler fig plus characterisation tests"],
            ["Rename a column, zero downtime", "Expand, dual-write, batch backfill, verify, switch reads, drop later"],
            ["Multi-tenant leaks", "Tenant id in every query, RLS, tenant from the session, cross-tenant tests"],
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
            ["\"The page is slow.\" First move?", "Measure, then split network, server and main thread. No `useMemo` or Redis yet."],
            ["API fast, UI slow?", "Main-thread work: DOM size, renders, parsing, hydration."],
            ["Typing shows old results?", "Race: abort the previous request, debounce, key by query."],
            ["Incident at 3 a.m.?", "Acknowledge, what changed, scope, roll back, communicate, postmortem."],
          ],
        },
      ],
    },
  ],
};
