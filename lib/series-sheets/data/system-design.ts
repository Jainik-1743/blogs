import type { CheatSheet } from "../types.ts";

/** Cheat sheet for the "system-design" series. See scripts/SERIES-SHEETS.md. */
export const SHEET: CheatSheet | null = {
  intro:
    "The numbers, formulas, trade-offs and standard fixes from the whole series, in the order you use them in a design interview: requirements, estimates, building blocks, data, reliability, security, deployment.",
  sections: [
    {
      title: "The 5-step framework",
      lesson: 59,
      blocks: [
        {
          kind: "steps",
          items: [
            "**Requirements** (5-8 min): 3-5 use cases, measurable non-functional needs (scale, latency, availability, consistency), what is out of scope.",
            "**Estimation** (3-5): average and peak QPS, storage, bandwidth, cache. End with \"so this means...\".",
            "**API and data** (5-8): endpoints or events, entities, access patterns, storage choice, IDs.",
            "**High-level design** (10-15): client, DNS/CDN, LB, gateway, services, cache / DB / storage / queue. Walk each use case through it.",
            "**Deep dives** (10-15): bottlenecks, failures, consistency, hot keys, security, monitoring.",
            "**Wrap-up** (2-5): trade-offs, risks, next steps.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Start simple, put numbers on everything, say each trade-off out loud, and never stay silent.",
        },
      ],
    },
    {
      title: "Numbers to know",
      lesson: 10,
      blocks: [
        {
          kind: "table",
          head: ["Operation", "Rough time"],
          rows: [
            ["L1 cache / RAM read", "~1 ns / ~100 ns"],
            ["SSD random read", "~16-100 µs"],
            ["Round trip in one data centre", "~0.5 ms"],
            ["Indexed DB query / Redis GET", "~1-10 ms / < 1 ms"],
            ["HDD seek", "~2-10 ms"],
            ["Cross-continent round trip", "~100-250 ms"],
          ],
        },
        {
          kind: "pairs",
          rows: [
            ["1 day", "86,400 s, call it **100k**"],
            ["1 month / 1 year", "~2.6M s / ~31.5M s"],
            ["1M requests/day", "**~12 per second**"],
            ["Peak", "2-10x average (3x if unsure)"],
            ["One app server", "hundreds to a few thousand req/s"],
            ["One SQL DB / one Redis", "1k-10k+ queries/s / ~100k ops/s"],
          ],
        },
      ],
    },
    {
      title: "Formulas and the nines",
      lesson: 9,
      blocks: [
        {
          kind: "code",
          code: "Avg QPS  = requests/day / 86,400\nStorage  = items/day x size x years\nBandwidth= QPS x response size\nServers  = peak QPS / QPS per server\n           (+ headroom)\nLittle   = in flight = rate x time\nAvail.   = MTBF / (MTBF + MTTR)\nSeries   = A x B x C (lower)\nParallel = 1 - (1-A)(1-B)\nQuorum   = W + R > N\nBase62   = 62^len (6: 56.8B, 7: 3.5T)",
        },
        {
          kind: "table",
          head: ["Availability", "Down / year", "Down / month"],
          rows: [
            ["99%", "~3.65 days", "~7.3 h"],
            ["99.9%", "~8.8 h", "~43.8 min"],
            ["99.99%", "~52.6 min", "~4.4 min"],
            ["99.999%", "~5.3 min", "~26 s"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Use p99, not averages: the slow tail is common at scale. Three 99.9% services in series give ~99.7%. Faster recovery (MTTR) is the cheapest nine.",
        },
      ],
    },
    {
      title: "Request path: HTTP, load balancer, CDN",
      lesson: 12,
      blocks: [
        {
          kind: "table",
          head: ["Balancer", "L4", "L7"],
          rows: [
            ["Sees", "IP and port", "Full HTTP request"],
            ["Routes by URL/header", "No", "Yes"],
            ["Speed / AWS", "Faster / NLB", "Slightly slower / ALB"],
          ],
        },
        {
          kind: "points",
          items: [
            "Algorithms: round robin, least connections, **power of two choices**, consistent hashing. Keep health checks **shallow**.",
            "GET, PUT, DELETE are idempotent, POST is not. 502 bad gateway, 503 unavailable, 504 gateway timeout. TLS 1.3 takes 1 round trip.",
            "**API gateway** = reverse proxy plus auth, rate limits, routing. **BFF** = one API per client type.",
            "**CDN**: `Cache-Control` sets lifetime, hashed file names avoid stale files, an origin shield protects the origin.",
          ],
        },
      ],
    },
    {
      title: "Caching",
      lesson: 16,
      blocks: [
        {
          kind: "points",
          items: [
            "**Cache-aside** is the safe default: read cache, load on miss and fill, **delete** the key on write, TTL on everything.",
            "Hit ratio 95% to 99% cuts backend load 5x. Evict with LRU or LFU. Read critical values (price at checkout, balance) from the source.",
          ],
        },
        {
          kind: "table",
          head: ["Problem", "Fix"],
          rows: [
            ["Stampede (many misses)", "Lock, stale-while-revalidate, early refresh"],
            ["Avalanche (mass expiry)", "TTL jitter"],
            ["Penetration (missing data)", "Cache \"not found\", Bloom filter"],
            ["Hot key", "Local cache, key replication"],
          ],
        },
      ],
    },
    {
      title: "Choosing a database, ACID",
      lesson: 21,
      blocks: [
        {
          kind: "table",
          head: ["Need", "Use"],
          rows: [
            ["Transactions, flexible queries", "PostgreSQL / MySQL (default, plus Redis)"],
            ["Huge write-heavy, time-ordered", "Cassandra / ScyllaDB"],
            ["Simple key lookups at scale", "DynamoDB / key-value"],
            ["Relationships", "Graph DB"],
            ["Full-text search / analytics", "Elasticsearch / warehouse"],
          ],
        },
        {
          kind: "table",
          head: ["Isolation level", "Dirty", "Non-rep.", "Phantom"],
          rows: [
            ["Read Uncommitted", "Yes", "Yes", "Yes"],
            ["Read Committed", "No", "Yes", "Yes"],
            ["Repeatable Read", "No", "No", "Depends"],
            ["Serializable", "No", "No", "No"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Lost update and write skew need `UPDATE ... SET x = x - 1 WHERE x > 0`, `FOR UPDATE`, a unique constraint, or Serializable plus retry.",
        },
      ],
    },
    {
      title: "Indexes, replication, sharding",
      lesson: 25,
      blocks: [
        {
          kind: "table",
          head: ["Structure", "Good at", "How"],
          rows: [
            ["B-tree", "Reads, ranges", "Sorted pages, updated in place"],
            ["LSM-tree", "Writes", "Append, then compact; Bloom filters"],
          ],
        },
        {
          kind: "points",
          items: [
            "Multi-column index helps only from its **left prefix**. Check with `EXPLAIN ANALYZE`. Fix N+1 with a join.",
            "**Replication** (availability, read scale): async is fast but can lose writes and lag. Read your own writes from the leader.",
            "**Sharding** (write scale, size): range, hash, directory or geo. A good shard key is even, matches queries, rarely changes.",
            "`hash % N` moves most keys. **Consistent hashing** (ring plus virtual nodes) moves ~1/N.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Replication is not a backup: replicas copy deletes and corruption at once.",
        },
      ],
    },
    {
      title: "CAP and consistency models",
      lesson: 27,
      blocks: [
        {
          kind: "points",
          items: [
            "In a partition you pick **consistency** (refuse) or **availability** (answer, maybe stale). PACELC: otherwise, latency or consistency.",
            "Choose consistency for money, stock, uniqueness. Choose availability for feeds, likes, catalogues.",
          ],
        },
        {
          kind: "table",
          head: ["Model", "Promise"],
          rows: [
            ["Linearizable", "Acts like one copy; costs latency"],
            ["Causal", "Cause is seen before effect"],
            ["Session", "Read-your-writes, monotonic reads"],
            ["Eventual", "Copies agree later"],
          ],
        },
      ],
    },
    {
      title: "APIs and real time",
      lesson: 34,
      blocks: [
        {
          kind: "table",
          head: ["Choice", "Best for", "Watch"],
          rows: [
            ["REST", "Simple, public APIs", "Right status codes, no 200 on error"],
            ["gRPC", "Internal calls", "Set deadlines; needs L7 balancing"],
            ["GraphQL", "Varied clients", "N+1 (DataLoader), cost limits"],
            ["SSE", "Feeds, notifications", "One way only"],
            ["WebSocket", "Chat, games", "Gateways, heartbeats, replay"],
          ],
        },
        {
          kind: "points",
          items: [
            "**Idempotency key**: unique constraint plus saved response, so a retried POST does not charge twice.",
            "**Cursor pagination** stays stable as data changes; offset only for small lists. Add fields, never break clients.",
          ],
        },
      ],
    },
    {
      title: "Queues, Kafka, delivery",
      lesson: 37,
      blocks: [
        {
          kind: "table",
          head: ["Delivery", "Risk", "Use"],
          rows: [
            ["At-most-once", "Loss (ack first)", "Rarely"],
            ["At-least-once", "Duplicates", "Default"],
            ["Effectively-once", "None, if idempotent", "At-least-once + dedup"],
          ],
        },
        {
          kind: "points",
          items: [
            "Queue: one consumer gets each message. Pub/sub: every subscriber gets a copy.",
            "Kafka: the **key picks the partition**, order holds only within one. One consumer per partition per group. Watch **lag**. Use `acks=all`.",
            "**Outbox** fixes the dual write (DB updated, event lost). Failing jobs: transient retries only, then a **DLQ**.",
          ],
        },
      ],
    },
    {
      title: "Resilience and rate limiting",
      lesson: 41,
      blocks: [
        {
          kind: "code",
          code: "delay = random(0,\n  min(cap, base * 2^attempt))",
          note: "Exponential backoff with full jitter.",
        },
        {
          kind: "points",
          items: [
            "Timeout on every call. Retry only transient, idempotent errors, 2-3 attempts, at **one layer** (attempts multiply per layer).",
            "Circuit breaker: closed, open (fail fast), half-open (test calls). **Bulkhead** = separate pools. Shed load with `503` + `Retry-After`.",
          ],
        },
        {
          kind: "table",
          head: ["Rate limiter", "Trade-off"],
          rows: [
            ["Fixed window", "Simple; double burst at the boundary"],
            ["Sliding log", "Exact; one entry per request"],
            ["Sliding counter", "Approximate; two counters"],
            ["Token bucket", "Bursts plus average rate; API favourite"],
            ["Leaky bucket", "Smooth output for fragile downstreams"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Share counters in Redis with an atomic Lua script. Return `429` + `Retry-After`. Fail open for general limits, closed for login and OTP.",
        },
      ],
    },
    {
      title: "Backups, SLOs, observability",
      lesson: 47,
      blocks: [
        {
          kind: "table",
          head: ["DR strategy", "RPO", "RTO"],
          rows: [
            ["Backup and restore", "Hours", "Hours to days"],
            ["Pilot light", "Minutes", "Tens of minutes"],
            ["Warm standby", "Seconds-minutes", "Minutes"],
            ["Active-active", "~0", "~0 to minutes"],
          ],
        },
        {
          kind: "points",
          items: [
            "Backups: 3-2-1 rule, immutable copies, PITR (base backup + WAL), **test restores**.",
            "SLI = good events / valid events. SLO = target. SLA = looser promise. **Error budget = 1 - SLO.**",
            "Burn rate 14.4x (1.44% errors vs 0.1% allowed) spends the 30-day budget in ~2 days: page. Alert on symptoms.",
            "Golden signals: latency, traffic, errors, saturation. Logs say what, metrics say how much, traces say where.",
          ],
        },
      ],
    },
    {
      title: "Security checklist",
      lesson: 49,
      blocks: [
        {
          kind: "points",
          items: [
            "AuthN is who you are, AuthZ is what you may do. Hash passwords with Argon2id or bcrypt; offer MFA or passkeys.",
            "Cookies: `HttpOnly; Secure; SameSite`. JWTs are signed, not encrypted: pin the algorithm, check `exp`/`aud`/`iss`, short life, rotating refresh.",
            "OAuth: Auth Code + PKCE for users, Client Credentials for services. OIDC adds the ID token for login.",
          ],
        },
        {
          kind: "table",
          head: ["Threat", "Defence"],
          rows: [
            ["IDOR / broken access", "Check every object; deny by default"],
            ["Injection", "Parameterised queries, output encoding"],
            ["SSRF", "Allow-lists, block internal and metadata IPs"],
            ["Leaked secret", "Rotate now; secrets manager; scanning"],
          ],
        },
      ],
    },
    {
      title: "Architecture and deployment",
      lesson: 58,
      blocks: [
        {
          kind: "points",
          items: [
            "Monolith first, then modular monolith, then microservices when teams demand it. Migrate with the strangler fig. Avoid the distributed monolith.",
            "Containers: version tags (not `latest`), non-root, no secrets. Kubernetes: readiness vs liveness, requests/limits, spread across 3 zones (150% of peak).",
          ],
        },
        {
          kind: "table",
          head: ["Strategy", "Idea"],
          rows: [
            ["Rolling", "Gradual, no downtime"],
            ["Blue-green", "Instant switch and rollback; 2x resources"],
            ["Canary", "Few users first; smallest blast radius"],
            ["Shadow", "Copied traffic, no user impact"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Feature flags separate deploy from release. Change schemas with expand-and-contract.",
        },
      ],
    },
    {
      title: "Case studies in one line",
      lesson: 60,
      blocks: [
        {
          kind: "table",
          head: ["System", "Core idea"],
          rows: [
            ["URL shortener", "7-char Base62, Redis cache, shard by code, `302` + async analytics"],
            ["Rate limiter", "Gateway + Redis Cluster + Lua; `429` with headers"],
            ["Notifications", "Async, priority lanes (OTP first), dedup, provider failover"],
            ["Chat", "WebSocket gateways + pub/sub; store first, then deliver; sequence numbers"],
            ["News feed", "Hybrid fan-out; cache post IDs; batch hydration; cursors"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Shortener: 100M new/month is ~40 writes/s and ~3,800 reads/s (100:1); 12B URLs fit in 7 Base62 characters.",
        },
      ],
    },
    {
      title: "Interview one-liners",
      lesson: 69,
      blocks: [
        {
          kind: "table",
          head: ["Question", "Short answer"],
          rows: [
            ["1M requests/day per second?", "~12 average (÷ 86,400); peak 2-10x"],
            ["Downtime at 99.9%?", "~43.8 min a month, ~8.8 h a year"],
            ["Replication, sharding, backups?", "Availability + reads; writes + size; go back in time"],
            ["W + R > N?", "Quorum: a read always meets the latest write"],
            ["At-least-once means?", "Duplicates happen, so consumers must be idempotent"],
            ["Feed fan-out?", "Hybrid: push normal authors, pull celebrities"],
            ["Top API vulnerability?", "IDOR: check access to each object"],
            ["Monolith or microservices?", "Monolith first; split when teams and scale demand"],
          ],
        },
      ],
    },
  ],
};
