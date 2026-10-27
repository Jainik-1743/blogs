import type { CheatSheet } from "../types.ts";

/** Cheat sheet for the "design-problems" series. See scripts/SERIES-SHEETS.md. */
export const SHEET: CheatSheet | null = {
  intro:
    "The six-step frame, the numbers worth knowing, and the API, data model and core trick of each classic design problem. Lead the talk, use numbers, and always say what fails.",
  sections: [
    {
      title: "The six-step frame",
      lesson: 0,
      blocks: [
        {
          kind: "steps",
          items: [
            "**Clarify**: what, who, out of scope. Functional and non-functional.",
            "**Estimate**: requests per second, storage, read:write ratio.",
            "**API**: methods, status codes, errors, auth, pagination, idempotency.",
            "**Data model**: what is stored, how it is read, keys and indexes.",
            "**Core design**: the hard part, with alternatives and a choice.",
            "**Scale and fail**: 10x traffic, a dependency down, hot keys, abuse.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "45 min: 5 clarify and estimate, 10 API and data, 15 core, 10 scale and failure, 5 wrap-up. Say: \"A gives X but costs Y; given Z I choose A.\"",
        },
      ],
    },
    {
      title: "Back-of-envelope numbers",
      lesson: 0,
      blocks: [
        {
          kind: "table",
          head: ["Fact", "Approximation"],
          rows: [
            ["Seconds in a day", "86,400, about 10^5"],
            ["1 million requests a day", "about 12 per second"],
            ["100 million a day", "about 1,200 per second"],
            ["Peak traffic", "Average x 2 to 10 (use 3 to 5)"],
            ["1M rows x 1 KB", "about 1 GB (1B rows is 1 TB)"],
            ["Latency", "Memory 100 ns, Redis 0.5 ms, SSD 100 us, region hop 100 ms+"],
          ],
        },
        {
          kind: "code",
          lang: "text",
          code:
            "writes: 100M/month = 40/s (peak 200)\nreads 100x = 4,000/s (peak 20,000)\n6B links x 500 B = 3 TB\nhot 20%: 20M x 500 B = 10 GB\n  (one Redis node)",
          note: "Then say the conclusion: writes are small, reads are the problem.",
        },
      ],
    },
    {
      title: "URL shortener: codes",
      lesson: 1,
      blocks: [
        {
          kind: "table",
          head: ["Approach", "Collisions", "Catch"],
          rows: [
            ["Hash + truncate", "Yes, handle them", "Same URL gets same code for every user"],
            ["Random + retry", "Rare; retry on unique error", "Simple. Watch how full the space gets"],
            ["Counter + Base62", "None", "Guessable unless scrambled; needs ranges"],
            ["Key generation service", "None", "Another service to run"],
          ],
        },
        {
          kind: "points",
          items: [
            "**Base62** (`0-9a-zA-Z`) is URL-safe. 7 characters give 62^7, about **3.5 trillion**; 6B links use 0.17%.",
            "Base64 has `+`, `/` and `=`, which are not URL-safe.",
            "Retry loop: insert, catch Prisma `P2002` (unique violation), make a new code, up to 5 tries.",
          ],
        },
      ],
    },
    {
      title: "URL shortener: redirect and reads",
      lesson: 1,
      blocks: [
        {
          kind: "table",
          head: ["Aspect", "301 Moved Permanently", "302 Found"],
          rows: [
            ["Browser cache", "Strong; may skip your server", "Not cached by default"],
            ["Analytics", "Lost on repeat clicks", "Every click counted"],
            ["Change or disable link", "Hard (stale cache)", "Easy, instant"],
          ],
        },
        {
          kind: "points",
          items: [
            "Analytics, expiry or edits: **302**. Permanent links, least load: 301.",
            "**Cache-aside** in Redis with TTL no longer than the link's life. **Negative-cache** unknown codes (60 s) against scanners.",
            "Statuses: `404` unknown, `410` expired, `409` alias taken, `429` rate limited.",
            "Log clicks to a queue, never in the redirect request.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Abuse: allow only http and https, check blocklists, block SSRF if you fetch the target, reject reserved aliases (`api`, `admin`), do not number codes in order.",
        },
      ],
    },
    {
      title: "Rate limiter: design",
      lesson: 2,
      blocks: [
        {
          kind: "table",
          head: ["Algorithm", "Memory per key", "Note"],
          rows: [
            ["Fixed window", "1 counter", "2x burst at the boundary"],
            ["Sliding log", "Many timestamps", "Exact, costly"],
            ["Sliding counter", "2 counters", "Smooth estimate; good default per minute"],
            ["Token bucket", "2 values", "Controlled bursts; usual API default"],
            ["Leaky bucket", "Queue", "Smooth output for a constant-rate service"],
          ],
        },
        {
          kind: "points",
          items: [
            "A limiter is **key + rule + algorithm + shared state + response**.",
            "Rate limit counts per period; **quota** counts a long period; **concurrency limit** counts running now; **load shedding** protects the system.",
            "Place it at the edge or gateway first, then app middleware for per-user rules.",
          ],
        },
      ],
    },
    {
      title: "Rate limiter: correct and visible",
      lesson: 2,
      blocks: [
        {
          kind: "code",
          lang: "lua",
          code:
            "-- ARGV: capacity, rate, nowMs, cost\ntokens = min(capacity,\n  tokens + elapsed * rate)\nif tokens >= cost then\n  tokens = tokens - cost\n  allowed = 1\nend\nHSET key tokens ts\nPEXPIRE key (idle keys vanish)",
          note: "Run it as one Lua script so check-and-update is atomic. INCR then EXPIRE is not atomic.",
        },
        {
          kind: "code",
          lang: "http",
          code:
            "429 Too Many Requests\nRetry-After: 18\nX-RateLimit-Limit: 100\nX-RateLimit-Remaining: 0",
        },
        {
          kind: "points",
          items: [
            "**Fail open** for most APIs; **fail closed** for login, OTP, reset. Choose per rule, with a short timeout.",
            "Users behind one NAT: key on user id or API key, IP only as a wide outer layer. Trust `X-Forwarded-For` from trusted proxies only.",
          ],
        },
      ],
    },
    {
      title: "Pagination: offset vs cursor",
      lesson: 3,
      blocks: [
        {
          kind: "table",
          head: ["Aspect", "Offset", "Cursor (keyset)"],
          rows: [
            ["Cost", "Grows with offset, O(offset)", "Fast at any depth"],
            ["Data changes", "Duplicates and skips", "Stable"],
            ["Jump to page N", "Yes", "No"],
            ["Total count", "`COUNT(*)`, slow", "Not cheap"],
          ],
        },
        {
          kind: "code",
          lang: "sql",
          code:
            "SELECT * FROM orders\nWHERE (created_at, id) < ($1, $2)\nORDER BY created_at DESC, id DESC\nLIMIT 21;  -- limit + 1: hasMore",
          note: "Needs index (created_at DESC, id DESC) and a unique tiebreaker.",
        },
      ],
    },
    {
      title: "Pagination: cursors and choosing",
      lesson: 3,
      blocks: [
        {
          kind: "points",
          items: [
            "Cursor is **opaque** base64url JSON. Validate it strictly, use parameterised queries; sign it with HMAC if needed.",
            "Put a fingerprint of sort and filters in the cursor. Keep full timestamp precision.",
            "Cap `limit`, set a default, cap offset depth. Backwards: flip comparison and sort, then reverse.",
            "Counts: approximate, cached, a counter table, or \"10,000+\".",
          ],
        },
        {
          kind: "table",
          head: ["Situation", "Choose"],
          rows: [
            ["Small table, admin page jumps", "Offset"],
            ["Feed, timeline, log, big table, public API", "Cursor"],
            ["Infinite scroll, Load more", "Cursor"],
            ["Ranked search results", "`search_after`"],
          ],
        },
      ],
    },
    {
      title: "File upload",
      lesson: 4,
      blocks: [
        {
          kind: "steps",
          items: [
            "Browser asks the API to upload (name, type, size). API validates, saves a `PENDING` row, returns a **presigned URL**.",
            "Browser `PUT`s the bytes straight to object storage. Your servers stay out of the data path.",
            "Storage event goes to a queue. Worker verifies, scans, makes thumbnails, sets `READY` or `REJECTED`.",
            "Client polls or gets a push. A cleanup job removes stale `PENDING` rows.",
          ],
        },
        {
          kind: "points",
          items: [
            "Large files: **multipart**, parts 5 MB to 5 GB, up to 10,000 parts, 5 TB object. Parallel parts, retry each, resume with `ListParts`.",
            "Add lifecycle rule `AbortIncompleteMultipartUpload`. CORS must expose `ETag`.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Timeouts behind the load balancer mean bytes pass through it. Move to presigned direct upload.",
        },
      ],
    },
    {
      title: "File upload: validate and serve",
      lesson: 4,
      blocks: [
        {
          kind: "table",
          head: ["Check", "How"],
          rows: [
            ["Size", "`content-length-range` in policy, recheck after"],
            ["Type", "Allow-list plus magic bytes; header and extension lie"],
            ["Name", "Server-made key, never the client name"],
            ["Content", "Malware scan; re-encode images; cap pixels"],
            ["Archives", "Cap unpacked size and nesting (zip bomb)"],
          ],
        },
        {
          kind: "points",
          items: [
            "Serve from a **separate domain**, with `X-Content-Type-Options: nosniff` and `Content-Disposition: attachment`.",
            "Private files: private bucket and short-lived signed GET URLs.",
          ],
        },
      ],
    },
    {
      title: "Notification system",
      lesson: 5,
      blocks: [
        {
          kind: "table",
          head: ["Transport", "Use"],
          rows: [
            ["Polling", "Simple; wasteful, delayed"],
            ["Long polling", "Lower delay; still a connection each"],
            ["**SSE**", "Server to client only; auto reconnect, `Last-Event-ID`"],
            ["WebSocket", "Two-way; sticky routing and heartbeats"],
          ],
        },
        {
          kind: "points",
          items: [
            "Pipeline: events, bus, notification service (recipients, preferences, dedupe, template), **one queue per channel**, workers.",
            "Table has `UNIQUE (user_id, dedupe_key)`, a partial index on unread, and `deliveries (notification_id, channel)`.",
            "Queues are **at-least-once**, so dedupe key plus idempotent senders plus DLQ.",
            "Digest, quiet hours (user time zone), frequency caps, critical messages always allowed.",
          ],
        },
      ],
    },
    {
      title: "Notifications: scenarios",
      lesson: 5,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["3 tabs open", "3 SSE connections; or a leader tab via `BroadcastChannel`; use HTTP/2"],
            ["Broadcast to 1M", "Fan-out on write (batched, throttled) or on read; hybrid; FCM topics"],
            ["Offline user", "Saved in-app list, Web Push, email or SMS fallback"],
            ["Estimate", "20M a day, about 230/s (peak 2,000), 100,000 open connections"],
            ["The bell", "List + unread count + stream; optimistic read; `aria-live=\"polite\"`"],
          ],
        },
      ],
    },
    {
      title: "Search autocomplete",
      lesson: 6,
      blocks: [
        {
          kind: "steps",
          items: [
            "Minimum 2 characters. **Debounce** 150 to 300 ms.",
            "Check the per-prefix cache. On a miss, abort the previous request and fetch.",
            "Ignore stale responses (compare the returned `query`). Cache by prefix.",
            "Combobox ARIA, arrow keys, Enter, Escape. Handle IME. Highlight safely.",
          ],
        },
        {
          kind: "table",
          head: ["Backend option", "Note"],
          rows: [
            ["SQL LIKE 'pre%'", "Index with `text_pattern_ops`; ranking is weak"],
            ["Search engine", "Typo tolerance, ranking; heavier"],
            ["**Trie**, top-k at each node", "Lookup is O(prefix length); build offline"],
            ["Hash map prefix to top-k", "Cap prefix length (20)"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Serve `GET /v1/suggest` with `Cache-Control: public, max-age=300` at the CDN. Fail softly: hide suggestions if slow.",
        },
      ],
    },
    {
      title: "Payments, retries, flags, LRU",
      lesson: 7,
      blocks: [
        {
          kind: "points",
          items: [
            "**Idempotency key** per intended payment, unique on `(account_id, key)`, with request hash. Same key + same hash returns the saved response; different hash is `422`; in progress is `409`.",
            "Pass the key to the provider too. A timeout means **unknown**, not failed. Payments are a state machine with conditional `UPDATE`.",
            "**Full jitter**: `delay = random(0, min(cap, base * 2^attempt))`. Retry temporary errors on idempotent calls only; one layer only.",
            "**Flag**: `hash(flagKey + userId) % 100 < percent`. Same answer every time; raising 10 to 20 keeps the first 10%.",
            "Flags: evaluate locally, safe default, kill switch, audit log, owner and end date. Not for authorization.",
          ],
        },
        {
          kind: "code",
          lang: "js",
          code:
            "get(k): v = map.get(k)\n  map.delete(k); map.set(k, v)\nput(k, v): map.delete(k)\n  map.set(k, v)\n  if (map.size > cap)\n    delete map.keys().next().value",
          note: "A Map keeps insertion order, so the first key is the least recently used.",
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
            ["301 or 302?", "302 for analytics and control; 301 for permanent and light."],
            ["Offset or cursor?", "Cursor for feeds and big data; offset for small admin tables."],
            ["Why presigned URLs?", "Bytes skip your servers: no double bandwidth, no LB timeouts."],
            ["Exactly-once?", "At-least-once delivery plus idempotent handlers."],
            ["Fail open or closed?", "Open for most APIs; closed for login, OTP and reset."],
            ["Why jitter?", "Clients that failed together would retry together."],
            ["Why a cursor tiebreaker?", "Equal sort values make the page edge ambiguous."],
          ],
        },
      ],
    },
  ],
};
