import type { CheatSheet } from "../types.ts";

/** Cheat sheet for the "design-cases" series. See scripts/SERIES-SHEETS.md. */
export const SHEET: CheatSheet | null = {
  intro:
    "The twelve case studies on one page: the key numbers, the one idea that makes each design work, and the failure each one must survive. All figures are the lessons' own assumptions, so label yours too.",
  sections: [
    {
      title: "The 8 steps of every case",
      lesson: 0,
      blocks: [
        {
          kind: "steps",
          items: [
            "**Requirements**: what it does, scale, what is out of scope.",
            "**Numbers**: label each as an assumption, show the arithmetic, end with \"so this means...\".",
            "**API** and **data model**: the few calls and tables that matter.",
            "**Architecture**: one diagram, then walk each use case through it.",
            "**Deep dives** on the 2-3 hardest parts.",
            "**Failure modes and trade-offs**: say them out loud.",
            "A 60-second spoken answer.",
          ],
        },
      ],
    },
    {
      title: "Web crawler",
      lesson: 0,
      blocks: [
        {
          kind: "code",
          code: "1B pages/month = ~400 pages/s\npeak ~800; 100 KB/page = 40 MB/s\n100 TB/month raw\n1 req/s per host -> need >= 400\nhosts crawled at once",
        },
        {
          kind: "table",
          head: ["Seen set, 10B URLs", "Memory"],
          rows: [
            ["Full URLs (~100 B each)", "1 TB"],
            ["8-byte hashes", "80 GB"],
            ["Bloom filter, 1% false positives", "~12 GB"],
          ],
        },
        {
          kind: "points",
          items: [
            "Frontier = priority queues plus **one queue per host** with a next-allowed time. Shard by host.",
            "Hash content to drop duplicate pages. Cap URL length, depth and pages per host against traps. Honour `robots.txt` and `Retry-After`.",
          ],
        },
      ],
    },
    {
      title: "Key-value store",
      lesson: 1,
      blocks: [
        {
          kind: "code",
          code: "10B keys x 1.05 KB = 10.5 TB\nx3 copies = 31.5 TB\n1.2 TB usable each -> ~30 machines\n1M ops/s, 90% reads\n-> ~70k replica ops/s per machine",
          note: "Replication multiplies the work. Write that multiplication down.",
        },
        {
          kind: "points",
          items: [
            "One node: hash table + **write-ahead log** + snapshots. The `fsync` policy is the durability dial.",
            "Consistent hashing with virtual nodes: 6th node moves 16.7% of keys, `hash % N` moves 82.8%.",
            "N=3, R=2, W=2 gives R + W > N. Conflicts: version vectors keep siblings, last-write-wins loses data.",
            "Repair: hinted handoff, read repair, anti-entropy. If fewer than R replicas are alive, fail with `503`.",
          ],
        },
      ],
    },
    {
      title: "File sync service",
      lesson: 2,
      blocks: [
        {
          kind: "code",
          code: "100M users x 2 GB = 200 PB\ndedup 25% -> 150 PB\n200M changes/day = ~2,300 commits/s\n(peak ~7,000)\n1 GB file, 4 MB chunks: ~10 KB meta\n1 GB file, 4 KB chunks: ~10 MB",
        },
        {
          kind: "points",
          items: [
            "Name each chunk by its **hash**: dedup, safe retries, cheap renames. The server re-hashes every chunk.",
            "**Content-defined chunking**: a 10-byte insert re-sent 3.4 KiB instead of 400 KiB.",
            "Upload chunks first, commit last. Resume = ask which hashes are missing.",
            "Notifications are hints, the **journal** is the truth. Conflicts: compare-and-set on `baseRev`, keep both copies.",
          ],
        },
      ],
    },
    {
      title: "Collaborative editing",
      lesson: 3,
      blocks: [
        {
          kind: "table",
          head: ["Aspect", "OT", "CRDT"],
          rows: [
            ["Idea", "Rewrite an op against accepted ones", "Permanent id per character"],
            ["Order set by", "One server per document", "Nobody; ops commute"],
            ["Cost", "Central, offline merge is slow", "Metadata and tombstones"],
          ],
        },
        {
          kind: "points",
          items: [
            "Apply edits locally first. 5M open docs, 10% typing at 2 msg/s = 1M msgs/s in.",
            "Op log is ~400x the text (25 MB vs 60 KB), so **snapshot every ~1,000 ops**: open = snapshot + short replay.",
            "Cursors and presence are temporary: throttled, never logged. Dedupe ops by `clientSeq`; check the ACL on every message.",
          ],
        },
      ],
    },
    {
      title: "CDN",
      lesson: 4,
      blocks: [
        {
          kind: "table",
          head: ["Hit ratio", "Origin req/s", "Avg latency"],
          rows: [
            ["50%", "50,000", "135 ms"],
            ["90%", "10,000", "43 ms"],
            ["99%", "1,000", "22.3 ms"],
            ["99.9%", "100", "20.2 ms"],
          ],
        },
        {
          kind: "points",
          items: [
            "Origin load = `R x (1 - hit)`. Think in miss ratio: 90% to 99% is **10x less**. (100k req/s, 20 ms hit, 250 ms miss.)",
            "Edge, then shield, then origin. Edge ends TLS. Users reach it by GeoDNS or anycast.",
            "The **cache key** controls hit ratio: one tracking parameter cost 27 points. Coalescing turned 1,603 origin fetches into 4.",
            "Hashed URLs, purge by tag, `stale-while-revalidate`. Never cache `Set-Cookie` or `private` responses.",
          ],
        },
      ],
    },
    {
      title: "Trending topics (top-K)",
      lesson: 5,
      blocks: [
        {
          kind: "code",
          code: "add(x):   each row i: t[i][h_i(x)]++\ncount(x): min over rows of t[i][h_i(x)]",
          note: "Count-min sketch: never undercounts. 2,000 x 5 x 4 B = 40 KB per bucket.",
        },
        {
          kind: "points",
          items: [
            "5B events/day = ~58k/s, ~175k/s peak. If exact counters fit (50M items ~ 0.9 GB), **use them**.",
            "A sketch cannot list keys, so pair it with a **min-heap of size K**.",
            "Sliding window = a ring of per-minute sketches, summed. Partition by item: global top-K = top-K of local lists.",
            "Hot key: pre-aggregate and split into sub-keys. Trending means rising: use ratio to baseline or decay.",
          ],
        },
      ],
    },
    {
      title: "Unique ID generator",
      lesson: 6,
      blocks: [
        {
          kind: "code",
          code: "1 sign | 41 time | 10 worker | 12 seq\n41 bits ms = 69.7 years (own epoch)\n1,024 workers\n4,096 IDs per ms per worker",
        },
        {
          kind: "table",
          head: ["Option", "Catch"],
          rows: [
            ["32-bit auto-increment", "Full in 3 h at 200k IDs/s; one machine"],
            ["UUIDv4", "No coordination, but random keys hurt B-trees"],
            ["UUIDv7 / ULID", "48-bit time first, 128 bits"],
            ["Snowflake", "Time-ordered 64 bits; needs worker leases"],
          ],
        },
        {
          kind: "points",
          items: [
            "Three failures: clock steps back (wait or refuse), sequence overflow (wait for next ms), duplicate worker number (lease it).",
            "Send IDs as strings in JSON. They are only roughly time-ordered.",
          ],
        },
      ],
    },
    {
      title: "Multi-data-centre systems",
      lesson: 7,
      blocks: [
        {
          kind: "table",
          head: ["Remote RTT", "Commit", "Serial writes/s"],
          rows: [
            ["1 ms", "~3 ms", "333"],
            ["20 ms", "~22 ms", "45"],
            ["80 ms", "~82 ms", "12"],
            ["160 ms", "~162 ms", "6"],
          ],
        },
        {
          kind: "points",
          items: [
            "Distance sets the floor: New York to London is ~56 ms round trip in straight fibre.",
            "Async replication loses `write rate x lag`: 1,000 writes/s x 4 s = 4,000. DNS failover = detection + TTL (30 s + 60 s = 90 s).",
            "Two independent 99.9% sites give 99.9999%, an upper bound: a bad release hits both.",
            "Split brain: majority vote with a third voter, fencing epochs, leases. The minority stops writing. Each site must carry 100% of load.",
          ],
        },
      ],
    },
    {
      title: "Stock exchange matching engine",
      lesson: 8,
      blocks: [
        {
          kind: "table",
          head: ["Step of a 100 µs budget", "µs"],
          rows: [
            ["Network in + decode", "10"],
            ["Risk checks / sequencer", "5 / 2"],
            ["Append to log + replicate", "40"],
            ["Match", "3"],
            ["Network out / slack", "10 / 30"],
          ],
        },
        {
          kind: "points",
          items: [
            "Book = sorted price levels + FIFO queue per level + `id` map for O(1) cancel. Best price first, then oldest. Trade at the **maker's price**.",
            "**One sequencer, one thread** per symbol group: deterministic. The command log is the truth; replay rebuilds state.",
            "Volume is small (500M orders/day ~ 21k/s); the tail latency is the product. Reject orders if the log write fails. Never block on a slow feed subscriber.",
          ],
        },
      ],
    },
    {
      title: "Sales rank by category",
      lesson: 9,
      blocks: [
        {
          kind: "code",
          code: "1B sales/month = ~400/s\nreads 100:1 = 40k/s\npeak 5x: 2,000 sales/s, 200k reads/s\n20M members x 64 B = ~1.3 GB/window\n(3 windows ~4 GB)\ntop-100 x 1,000 categories = ~5 MB",
        },
        {
          kind: "points",
          items: [
            "Write path: stream, dedupe by event id, hourly buckets. Read path: a precomputed Redis sorted set (`ZINCRBY`) behind a cache.",
            "7-day window = 168 hourly buckets: add new, subtract expired. **Apply pending changes before expiring.**",
            "Coalescing: 100,000 writes became 200 in a flash sale, only 2.3% fewer on spread data. Hot category: micro-batch, shard and merge.",
            "Keep raw sales to rebuild into a versioned key, then switch.",
          ],
        },
      ],
    },
    {
      title: "Bank transactions app (Mint-style)",
      lesson: 10,
      blocks: [
        {
          kind: "steps",
          items: [
            "Link via an aggregator and keep its token, **never the bank password** (envelope-encrypted).",
            "Fetch pages. Upsert on `(account_id, provider_txn_id)`; move the cursor only after the page is saved.",
            "Replace pending rows with posted ones using a tombstone.",
            "Categorise rules first, model for the long tail; the user override wins.",
            "Total, alert (one row per sent alert), reconcile against the bank balance.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "5B transactions/month = ~2,000 writes/s, 250 GB/month (~9 TB in 3 years). Reads are only ~200/s. The limit is the aggregator and slow banks.",
        },
      ],
    },
    {
      title: "Scaling stages, one by one",
      lesson: 11,
      blocks: [
        {
          kind: "table",
          head: ["Stage", "Trigger", "Cost"],
          rows: [
            ["Split the DB", "DB and web fight for memory", "Network hop"],
            ["Cache (Redis)", "DB CPU high on repeated reads", "Stale data, stampede"],
            ["LB + stateless", "App CPU above 60-70%", "Health checks, deploys"],
            ["Read replicas", "Read load despite cache", "Replication lag"],
            ["CDN", "Static bytes or distant users", "Invalidation"],
            ["Queues + workers", "Slow work, spikes", "Retries, duplicates, DLQ"],
            ["Shard", "Write rate beyond one machine", "Cross-shard queries"],
            ["Multi-region", "Continents, regional outage", "Biggest: consistency"],
          ],
        },
        {
          kind: "points",
          items: [
            "Change only what a number tells you: load test, profile, fix the bottleneck, repeat. Shard last, multi-region after that.",
            "Latency 50 ms becomes 500 ms at 90% busy and 5,000 ms at 99%: plan for 70-80%. Cache hit 90% to 99% cuts DB reads from 4,000 to 400/s.",
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
            ["Crawler politeness?", "A queue per host with a next-allowed time; need rate x delay hosts"],
            ["Bloom filter vs exact set?", "12 GB vs 80 GB; no false negatives, misses ~1% of new URLs"],
            ["OT or CRDT?", "OT: central, compact. CRDT: offline, decentralised, heavier"],
            ["Why chase hit ratio?", "Origin load = R x (1 - h), so 90% to 99% is 10x less"],
            ["Snowflake clock goes back?", "Wait on small steps, refuse large ones"],
            ["Sync vs async across sites?", "Sync pays the RTT every write; async loses rate x lag"],
            ["Why one thread to match?", "Deterministic, replayable, and fast enough"],
            ["When to shard?", "Last: after indexes, cache, a bigger box and replicas"],
          ],
        },
      ],
    },
  ],
};
