import type { CheatSheet } from "../types.ts";

/** Cheat sheet for the "api-design" series. See scripts/SERIES-SHEETS.md. */
export const SHEET: CheatSheet | null = {
  intro:
    "How to design an HTTP API that stays boring and safe: names, verbs, shapes, errors, lists, change, retries, security, contracts, and when to pick GraphQL or gRPC. An API is a **contract**.",
  sections: [
    {
      title: "Resources and URLs",
      lesson: 0,
      blocks: [
        {
          kind: "points",
          items: [
            "**Nouns** in the URL, verbs from HTTP, numbers from HTTP status codes. `POST /getUser` is a smell.",
            "Plural collections (`/orders/42`), one case style, nest only for ownership and stop at two levels.",
            "Path is **identity**, query string is **options**: `/orders?status=paid&limit=20`.",
            "Action that is not CRUD: make a sub-resource, `POST /orders/42/cancellation`.",
            "Return an object (`{\"items\":[...]}`), not a bare array, so you can add fields later.",
            "**Stateless**: each request carries all it needs, so any server can answer it.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Never delete behind a `GET`: crawlers and prefetchers will call it. Never answer `200` with `{\"ok\":false}`.",
        },
      ],
    },
    {
      title: "Methods: safe and idempotent",
      lesson: 1,
      blocks: [
        {
          kind: "table",
          head: ["Method", "Use", "Safe", "Idempotent"],
          rows: [
            ["GET / HEAD", "Read", "yes", "yes"],
            ["POST", "Create, or run an action", "no", "no"],
            ["PUT", "Replace the whole resource", "no", "yes"],
            ["PATCH", "Change a few fields", "no", "no"],
            ["DELETE", "Remove", "no", "yes"],
            ["OPTIONS", "Ask what is allowed", "yes", "yes"],
          ],
        },
        {
          kind: "points",
          items: [
            "Idempotent means the same **state** after many calls, not the same reply: `DELETE` gives `204`, then `404`.",
            "`PUT` with a missing field drops that field. Use `PATCH` for partial change.",
            "Creating `POST` returns `201` plus a `Location` header.",
          ],
        },
        {
          kind: "code",
          lang: "http",
          code: "GET /orders/7\n<- 200  ETag: \"v3\"\n\nPATCH /orders/7\nIf-Match: \"v3\"\n<- 200 new ETag \"v4\"\n\n(second editor, still \"v3\")\n<- 412 Precondition Failed",
          note: "Reload, merge, and try again with the new ETag.",
        },
      ],
    },
    {
      title: "Status codes that matter",
      lesson: 1,
      blocks: [
        {
          kind: "table",
          head: ["Code", "Meaning"],
          mono: [0],
          rows: [
            ["200 / 201 / 204", "OK with body / created / OK with no body"],
            ["202", "Accepted, work not done yet (job)"],
            ["304", "Not modified, use your cached copy"],
            ["400", "Broken request: bad JSON, wrong type"],
            ["401", "Not authenticated (who are you?)"],
            ["403", "Authenticated, not allowed"],
            ["404", "Not found (or hidden on purpose)"],
            ["409", "Clashes with current state"],
            ["412", "`If-Match` failed, your version is old"],
            ["422", "Valid JSON, values break the rules"],
            ["429", "Rate limited, send `Retry-After`"],
            ["500 / 502 / 503 / 504", "Bug / bad upstream / overloaded / upstream slow"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Retry network errors, `429`, `503` and `504` with backoff. Do not retry `4xx` that fails the same way.",
        },
      ],
    },
    {
      title: "Shapes and formats",
      lesson: 2,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["Dates", "RFC 3339 in UTC with `Z`: `2026-10-11T15:00:00Z`"],
            ["Money", "Integer minor units plus currency: `{\"amount\":1999,\"currency\":\"EUR\"}`"],
            ["Big ids", "Strings, so JavaScript does not round them"],
            ["Names", "One style everywhere (`snake_case` or `camelCase`)"],
            ["null vs absent", "Decide once and document it"],
            ["Envelope", "Only for collections (`items` plus paging)"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Floats lie: `0.1 + 0.2 = 0.30000000000000004`. Never use them for money.",
        },
      ],
    },
    {
      title: "Input, output and errors",
      lesson: 2,
      blocks: [
        {
          kind: "points",
          items: [
            "Never return the database row. Build the response with a mapper (an **allow-list** of fields).",
            "**Mass assignment**: never copy unknown input keys into the database. One extra `\"role\":\"admin\"` made an admin.",
            "The edge checks the shape. The database enforces rules that must hold under races (unique, foreign key).",
          ],
        },
        {
          kind: "code",
          lang: "json",
          code: "// Content-Type: application/problem+json\n{ \"type\": \".../problems/validation-error\",\n  \"title\": \"Invalid fields\",\n  \"status\": 422,\n  \"detail\": \"1 problem found.\",\n  \"instance\": \"/users\",\n  \"errors\": [{\"pointer\": \"/email\"}] }",
          note: "RFC 9457. Never leak stack traces or table names: log them and send a request id.",
        },
      ],
    },
    {
      title: "Pagination, filtering, sorting",
      lesson: 3,
      blocks: [
        {
          kind: "table",
          head: ["Question", "Offset", "Cursor"],
          rows: [
            ["Deep pages", "Slower with depth", "Flat cost"],
            ["Data changes while paging", "Duplicates and gaps", "Correct"],
            ["Go to page 7", "Yes", "No"],
            ["Sync or export", "Risky", "Right choice"],
          ],
        },
        {
          kind: "points",
          items: [
            "Every list gets a **default limit**, a **max limit** and a stable order from version one.",
            "Cursor query: `WHERE (created_at, id) < (?, ?) ORDER BY created_at DESC, id DESC LIMIT n+1`.",
            "Sort needs a **tie-breaker** (`id`). Without it a test lost 3 of 12 rows.",
            "Make cursors **opaque**, tie them to the query, return a `next` link.",
            "Allow-list sort fields. Never paste client text into `ORDER BY`.",
            "Skip total counts by default: expensive and hard to remove later.",
          ],
        },
      ],
    },
    {
      title: "Breaking and safe changes",
      lesson: 4,
      blocks: [
        {
          kind: "table",
          head: ["Change to a response", "Verdict"],
          rows: [
            ["Add an optional field or endpoint", "Safe"],
            ["Remove, rename or retype a field", "Breaking"],
            ["Add a value to a returned enum", "Breaking unless enum is open"],
            ["Stricter request validation", "Breaking"],
            ["New required request field", "Breaking"],
            ["Add pagination to an unpaged list", "Breaking"],
            ["Change a status or error code", "Breaking"],
          ],
        },
        {
          kind: "points",
          items: [
            "**Expand and contract**: add the new, keep the old, migrate clients, remove the old.",
            "Clients are **tolerant readers**: ignore unknown fields, handle unknown enum values.",
          ],
        },
      ],
    },
    {
      title: "Versioning and deprecation",
      lesson: 4,
      blocks: [
        {
          kind: "table",
          head: ["Style", "Trade-off"],
          rows: [
            ["`/v1/` in path", "Obvious and easy to route, new URLs for all"],
            ["`?api-version=date`", "Stable paths, easy to forget"],
            ["Header", "Clean URLs, hidden, needs `Vary`"],
            ["Media type", "Per resource, weaker tooling"],
          ],
        },
        {
          kind: "steps",
          items: [
            "Mark `deprecated: true` in the spec and write a migration guide.",
            "Send `Deprecation` (RFC 9745) and `Sunset` (RFC 8594) headers with the date.",
            "Monitor who still calls it and get client consent.",
            "After the sunset date answer `410 Gone` with a problem body.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Never move unversioned callers to the newest version silently. Keep one internal model, one translator per version.",
        },
      ],
    },
    {
      title: "Idempotency keys and retries",
      lesson: 5,
      blocks: [
        {
          kind: "code",
          lang: "http",
          code: "POST /payments\nIdempotency-Key: 8e03978e-40d5-...\n\n{\"amount\": 500}\n\n# same key, same body -> replay reply\n# still running        -> 409\n# same key, new body   -> 422",
          note: "One key per intended action, not per attempt. Scope it by account, keep it a day or more.",
        },
        {
          kind: "points",
          items: [
            "Store key, owner, body fingerprint, state, status and response.",
            "**Claim the key atomically** in the database. A check-then-save gap let three charges through.",
            "Client backoff: exponential delay plus **jitter**, honour `Retry-After`, cap the tries.",
            "Slow work: reply `202` plus `Location` of a job resource, then poll or send a webhook.",
          ],
        },
      ],
    },
    {
      title: "Webhooks and rate limits",
      lesson: 5,
      blocks: [
        {
          kind: "code",
          lang: "js",
          code: "sig = \"v1,\" + base64(\n  HMAC_SHA256(secret,\n    `${id}.${ts}.${rawBody}`))\n// headers: webhook-id,\n//  -timestamp, -signature",
          note: "Sign the raw bytes. Compare in constant time (`timingSafeEqual`). Reject old timestamps (about 5 min).",
        },
        {
          kind: "points",
          items: [
            "Duplicates are normal: dedupe by event id. Do not promise order. Reply fast, process later.",
            "Answer limits with `429`, `Retry-After` and a problem body. Count by API key or user, not just IP.",
          ],
        },
        {
          kind: "table",
          head: ["Limiter", "Note"],
          rows: [
            ["Fixed window", "Simple, but allows 2x burst at the edge"],
            ["Sliding window", "Smooth, more memory"],
            ["Token bucket", "Bursts up to B, steady rate R"],
            ["Concurrency limit", "Guards slow endpoints"],
          ],
        },
      ],
    },
    {
      title: "Auth: keys, JWT, OAuth",
      lesson: 6,
      blocks: [
        {
          kind: "points",
          items: [
            "**401** not authenticated, **403** not allowed, **404** to hide that an object exists.",
            "API keys identify **apps**: store only hashes, show once, add a prefix, scopes and rotation. Never in URLs or in mobile code.",
            "A JWT is **signed, not secret**. Set `algorithms` yourself, check `iss`, `aud`, `exp`, reject `alg: none`.",
            "Access tokens 5 to 15 minutes; refresh tokens go only to the auth server. Prefer RS256 over a shared HS256 secret.",
          ],
        },
        {
          kind: "table",
          head: ["Situation", "Flow"],
          rows: [
            ["User in web, mobile or SPA", "Authorization code + PKCE"],
            ["Server as itself", "Client credentials"],
            ["TV or CLI", "Device authorization"],
            ["Implicit, password", "Do not use"],
          ],
        },
        {
          kind: "steps",
          items: [
            "Client makes a `code_verifier`; challenge = base64url(SHA-256(verifier)).",
            "Browser goes to `/authorize` with `state`, `code_challenge`, `S256`.",
            "Redirect returns a `code`; client checks `state`.",
            "Client `POST /token` with code and verifier; server checks the hash.",
          ],
        },
      ],
    },
    {
      title: "Authorization: where APIs break",
      lesson: 6,
      blocks: [
        {
          kind: "table",
          head: ["OWASP API", "Meaning"],
          rows: [
            ["API1 BOLA", "Object id taken, owner never checked"],
            ["API3 Property level", "Mass assignment and over-exposure"],
            ["API5 Function level", "Admin function open to users"],
            ["API7 SSRF", "API fetches a caller-given URL"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "**Scopes** limit the app. **Ownership checks** limit the user. You need both. Take the user from the token, never `?userId=`. Default to deny.",
        },
      ],
    },
    {
      title: "OpenAPI contract",
      lesson: 7,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["openapi / info", "Spec version (`3.1.0`), title, your API version"],
            ["servers / paths", "Base URLs / every URL and its methods"],
            ["components", "Reusable schemas, responses, parameters; use `$ref`"],
            ["security", "Which scheme guards which operation"],
            ["webhooks", "Calls your server sends out (3.1)"],
          ],
        },
        {
          kind: "points",
          items: [
            "Use a **validator** and a **linter**: a weak file was valid, yet lint found an undeclared path parameter.",
            "One file gives docs, request checks, mock server, SDKs and breaking-change diffs.",
            "**Contract test** against the real server catches drift (right status, four wrong fields).",
            "Requests: `additionalProperties: false`. Responses: stay open.",
            "Spec-first for shared APIs, code-first for one team. It cannot state business rules.",
          ],
        },
      ],
    },
    {
      title: "GraphQL and gRPC",
      lesson: 8,
      blocks: [
        {
          kind: "table",
          head: ["Aspect", "REST", "GraphQL", "gRPC"],
          rows: [
            ["Best for", "Public CRUD", "Varied clients", "Internal calls"],
            ["Wire", "JSON", "JSON", "Protobuf"],
            ["Caching", "HTTP, easy", "Hard", "In the app"],
            ["Browser", "Native", "Native", "Needs gateway"],
            ["Risk", "Round trips", "N+1, cost", "Tooling"],
          ],
        },
        {
          kind: "points",
          items: [
            "GraphQL returns `200` even with `errors`: always read the `errors` array. `!` decides how far a null spreads.",
            "**N+1**: DataLoader, one per request (11 DB calls became 2).",
            "Client sets the cost: limit depth, list size, cost, timeouts, batching. Depth 9 meant 9,841 calls.",
            "gRPC: field numbers are the contract. Use deadlines, not plain timeouts.",
          ],
        },
        {
          kind: "pairs",
          rows: [
            ["INVALID_ARGUMENT", "400"],
            ["NOT_FOUND / EXISTS", "404 / 409"],
            ["UNAUTHENTICATED / DENIED", "401 / 403"],
            ["RESOURCE_EXHAUSTED", "429"],
            ["UNAVAILABLE / DEADLINE", "503 (retry) / 504"],
          ],
        },
      ],
    },
    {
      title: "API review checklist",
      lesson: 9,
      blocks: [
        {
          kind: "steps",
          items: [
            "Names and URLs, then methods and status codes.",
            "Shapes and one error format, then lists.",
            "Change and compatibility, then retries.",
            "Security (BOLA first), then docs and contract.",
            "Style fit (REST, GraphQL, gRPC) and operations.",
          ],
        },
        {
          kind: "points",
          items: [
            "Common smells: verbs in URLs, always `200`, float prices, client sends `price`, `X-User-Id` as auth, unbounded lists.",
            "Protect a business rule at the lowest layer: a database constraint stops double booking.",
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
            ["Safe vs idempotent", "Safe changes nothing; idempotent gives the same state when repeated"],
            ["POST times out", "Retry with the same `Idempotency-Key`"],
            ["401 vs 403", "Who are you vs you may not"],
            ["Offset vs cursor", "Offset slows and skips; cursor stays flat"],
            ["Breaking change", "Removing, renaming, retyping, tighter input"],
            ["Verify a webhook", "HMAC of raw body, timestamp, constant time"],
            ["BOLA", "Missing owner check on an object id"],
            ["Charged twice?", "Check for key reuse and a non-atomic claim"],
            ["Choose a style", "REST first, GraphQL for varied clients, gRPC inside"],
          ],
        },
      ],
    },
  ],
};
