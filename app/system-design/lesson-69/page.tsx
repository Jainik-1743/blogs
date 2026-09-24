import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Flow, Layers, QA } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import Estimator from "@/components/sd/widgets/Estimator";
import Nines from "@/components/sd/widgets/Nines";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-69")!;

export const metadata: Metadata = {
  title: `Lesson 69 — ${lesson.title}`,
  description: lesson.summary,
};

/** In-page index. Each entry links to a section heading below. */
const outline = [
  { id: "how-to-use-this-page", label: "How to Use This Page" },
  { id: "1-the-5-step-design-framework-memorise-this", label: "1. The 5-Step Design Framework (memorise this)" },
  { id: "2-numbers-every-engineer-should-know", label: "2. Numbers Every Engineer Should Know" },
  { id: "3-key-formulas", label: "3. Key Formulas" },
  { id: "4-availability-nines", label: '4. Availability "Nines"' },
  { id: "5-recap-by-series-one-screen-each", label: "5. Recap by Series (one screen each)" },
  { id: "6-if-you-need-x-use-y-cheat-sheet", label: '6. "If You Need X, Use Y" Cheat Sheet' },
  { id: "7-the-big-trade-offs", label: "7. The Big Trade-offs" },
  { id: "8-common-problems-fixes", label: "8. Common Problems → Fixes" },
  { id: "9-security-quick-checklist", label: "9. Security Quick Checklist" },
  { id: "10-case-studies-in-one-line-each", label: "10. Case Studies in One Line Each" },
  { id: "11-the-reference-architecture-mini-version", label: "11. The Reference Architecture (mini version)" },
  { id: "12-interview-do-s-and-don-ts", label: "12. Interview Do's and Don'ts" },
  { id: "13-the-10-rules-to-remember-forever", label: "13. The 10 Rules to Remember Forever" },
  { id: "interview-questions", label: "Interview Questions" },
  { id: "key-takeaways", label: "Key Takeaways" },
  { id: "further-reading", label: "Further Reading" },
];

const code1 = `Average QPS        = requests per day ÷ 86,400
Peak QPS           = average × 2–10
Storage            = items/day × size × retention (× replicas if you manage them)
Bandwidth          = QPS × response size
Cache size (80/20) = ~20% of daily hot data
Servers            = peak QPS ÷ QPS per server  (+ headroom, + 1 zone failure)
Little's Law       = in-flight requests = arrival rate × time per request
Availability       = MTBF ÷ (MTBF + MTTR)
Series             = A × B × C            (always lower)
Parallel           = 1 − (1−A)(1−B)       (higher, if failures are independent)
Error budget       = 1 − SLO
Burn rate          = observed error rate ÷ allowed error rate
Quorum             = W + R > N  → reads see the latest write
Hit ratio          = cache hits ÷ total requests
Retry amplification = attempts per layer ^ number of layers
Base62 codes       = 62^length   (6 → 56.8B, 7 → 3.5T)`;

export default function SdLessonSixNinePage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="how-to-use-this-page" title="How to Use This Page">
          <p>
            This is the <strong>whole 65-post series squeezed into one page</strong>. Read it:
          </p>
          <ul>
            <li>
              <strong>before an interview or design review</strong> (15 minutes),
            </li>
            <li>
              <strong>when you forget a number or pattern</strong>,
            </li>
            <li>
              <strong>as a revision sheet</strong> after finishing the series.
            </li>
          </ul>
          <p>Each section ends with the post numbers to read if you want more detail.</p>
          <hr />
        </Section>

        <Section
          id="1-the-5-step-design-framework-memorise-this"
          title="1. The 5-Step Design Framework (memorise this)"
        >
          <Flow
            caption="The framework to memorise."
            nodes={[
              {
                title: <>Requirements</>,
                desc: <>functional (3–5 use cases) + non-functional (scale, latency, availability, consistency)</>,
              },
              {
                title: <>Estimation</>,
                desc: <>QPS (average + peak), storage, bandwidth, cache size → “so this means…”</>,
              },
              {
                title: <>API &amp; data</>,
                desc: <>endpoints/events, entities, access patterns, storage choice, IDs and keys</>,
              },
              {
                title: <>High-level</>,
                desc: <>client → DNS/CDN → LB → gateway → services → cache / DB / storage / queue</>,
              },
              {
                title: <>Deep dives</>,
                desc: <>bottlenecks, failures, consistency, hot keys, security, monitoring</>,
                tone: "warn",
              },
              { title: <>Wrap-up</>, desc: <>trade-offs, risks, next steps</>, tone: "good" },
            ]}
          />
          <p>
            <strong>Interview time budget (45–60 min):</strong> requirements 5–8 · estimation 3–5 · API/data 5–8 ·
            high-level 10–15 · deep dives 10–15 · wrap-up 2–5.
          </p>
          <p>
            <em>(Posts 6, 59)</em>
          </p>
          <hr />
        </Section>

        <Section id="2-numbers-every-engineer-should-know" title="2. Numbers Every Engineer Should Know">
          <p>
            <strong>Time conversions</strong>
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Seconds</th>
                  <th>Shortcut</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1 day</td>
                  <td>86,400</td>
                  <td>
                    ≈ <strong>100k</strong>
                  </td>
                </tr>
                <tr>
                  <td>1 month</td>
                  <td>~2.6M</td>
                  <td>≈ 2.5M</td>
                </tr>
                <tr>
                  <td>1 year</td>
                  <td>~31.5M</td>
                  <td>≈ 30M</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul>
            <li>
              <strong>1M requests/day ≈ 12 per second</strong>
            </li>
            <li>
              <strong>100M requests/day ≈ 1,200 per second</strong>
            </li>
            <li>
              <strong>Peak ≈ 2–10× average</strong> (use ~3× if unsure)
            </li>
          </ul>
          <p>
            <strong>Data sizes:</strong> KB = 10³ · MB = 10⁶ · GB = 10⁹ · TB = 10¹² · PB = 10¹⁵ (2¹⁰ ≈ 1,000).{" "}
            <strong>1 GB/s ≈ 8 Gbps.</strong>
          </p>
          <p>
            <strong>Latency (rough orders of magnitude)</strong>
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Operation</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>L1 cache</td>
                  <td>~1 ns</td>
                </tr>
                <tr>
                  <td>RAM access</td>
                  <td>~100 ns</td>
                </tr>
                <tr>
                  <td>SSD random read</td>
                  <td>~16–100 µs</td>
                </tr>
                <tr>
                  <td>Round trip in same data centre</td>
                  <td>~0.5 ms</td>
                </tr>
                <tr>
                  <td>Redis GET (same zone)</td>
                  <td>&lt; 1 ms</td>
                </tr>
                <tr>
                  <td>Simple indexed DB query</td>
                  <td>~1–10 ms</td>
                </tr>
                <tr>
                  <td>HDD seek</td>
                  <td>~2–10 ms</td>
                </tr>
                <tr>
                  <td>Cross-continent round trip</td>
                  <td>~100–250 ms</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>Lessons:</strong> memory ≫ SSD ≫ disk · network within a DC is cheap, across continents is expensive
            · sequential ≫ random · fewer round trips = faster.
          </p>
          <p>
            <strong>Rough capacity guesses (always verify):</strong>
          </p>
          <ul>
            <li>one app server: hundreds to a few thousand simple req/s,</li>
            <li>one PostgreSQL/MySQL: thousands to tens of thousands of simple queries/s,</li>
            <li>one Redis node: ~100k simple ops/s,</li>
            <li>one WebSocket gateway: ~100k mostly idle connections (tuned).</li>
          </ul>
          <p>
            <em>(Posts 8, 10)</em>
          </p>
          <hr />
        </Section>

        <Section id="3-key-formulas" title="3. Key Formulas">
          <CodeBlock code={code1} />
          <p>
            <em>(Posts 8–10, 24, 41, 47, 60)</em>
          </p>
          <hr />
          <Estimator caption="Practise the estimation step here — move the sliders and read off QPS, storage and servers." />
        </Section>

        <Section id="4-availability-nines" title={'4. Availability "Nines"'}>
          <Nines caption="The nines, interactive — and what series vs parallel does to them." />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Availability</th>
                  <th>Downtime / year</th>
                  <th>Downtime / month</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>99%</td>
                  <td>~3.65 days</td>
                  <td>~7.3 hours</td>
                </tr>
                <tr>
                  <td>99.9%</td>
                  <td>~8.8 hours</td>
                  <td>~43.8 minutes</td>
                </tr>
                <tr>
                  <td>99.95%</td>
                  <td>~4.4 hours</td>
                  <td>~21.9 minutes</td>
                </tr>
                <tr>
                  <td>99.99%</td>
                  <td>~52.6 minutes</td>
                  <td>~4.4 minutes</td>
                </tr>
                <tr>
                  <td>99.999%</td>
                  <td>~5.3 minutes</td>
                  <td>~26 seconds</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul>
            <li>
              Each extra nine costs <strong>much more</strong>.
            </li>
            <li>Faster recovery (lower MTTR) is often the cheapest improvement.</li>
            <li>
              <strong>99.9% × 3 services in series ≈ 99.7%.</strong>
            </li>
          </ul>
          <p>
            <em>(Posts 9, 47)</em>
          </p>
          <hr />
        </Section>

        <Section id="5-recap-by-series-one-screen-each" title="5. Recap by Series (one screen each)">
          <h3 id="part-1-foundations-posts-1-5">
            Part 1: Foundations <em>(posts 1–5)</em>
          </h3>
          <ul>
            <li>
              <strong>DNS</strong> turns names into IPs, with caching controlled by <strong>TTL</strong>.{" "}
              <strong>IP + routers + BGP</strong> move packets.
            </li>
            <li>
              <strong>TCP</strong> is reliable, ordered and needs a handshake. <strong>UDP</strong> is fast, with no
              guarantees. <strong>QUIC</strong> is reliable UDP and powers <strong>HTTP/3</strong>.
            </li>
            <li>
              <strong>HTTP:</strong> methods (GET/PUT/DELETE are idempotent; POST isn't) and status codes (2xx ok, 4xx
              client error, 5xx server error; 502/503/504 differ).
            </li>
            <li>
              <strong>TLS</strong> gives encryption, integrity and identity (certificates). TLS 1.3 takes 1 round trip.
            </li>
            <li>
              <strong>Concurrency:</strong> processes vs threads, event loops vs thread pools.{" "}
              <strong>Never block the event loop.</strong> Race conditions are fixed with atomic operations, locks or
              the DB.
            </li>
            <li>
              <strong>SQL:</strong> keys, joins, <strong>indexes</strong> (left-prefix rule), <strong>EXPLAIN</strong>,
              and the <strong>N+1</strong> problem. <strong>Connections are limited</strong>, so use pools and
              PgBouncer.
            </li>
          </ul>
          <h3 id="part-2-core-concepts-posts-6-10">
            Part 2: Core concepts <em>(posts 6–10)</em>
          </h3>
          <ul>
            <li>
              <strong>Requirements first</strong>, and make them measurable. Say what's <strong>out of scope</strong>.
            </li>
            <li>
              <strong>Vertical</strong> scaling (a bigger box) vs <strong>horizontal</strong> (more boxes). Scaling out
              needs <strong>stateless</strong> servers.
            </li>
            <li>
              <strong>Latency vs throughput.</strong> Use <strong>percentiles (p99)</strong>, not averages.{" "}
              <strong>The tail becomes common at scale.</strong>
            </li>
            <li>
              <strong>Availability nines</strong>, series vs parallel, and MTBF/MTTR.
            </li>
            <li>
              <strong>Estimate</strong> traffic, storage, bandwidth and servers, always ending with{" "}
              <strong>"so this means…"</strong>.
            </li>
          </ul>
          <h3 id="part-3-building-blocks-posts-11-19">
            Part 3: Building blocks <em>(posts 11–19)</em>
          </h3>
          <ul>
            <li>
              <strong>Request path:</strong> DNS → CDN → LB → gateway → app → cache → DB, with queues on the side.
            </li>
            <li>
              <strong>Load balancers:</strong> L4 (IP/port) vs L7 (HTTP). Algorithms include round robin, least
              connections, consistent hashing and power of two choices. <strong>Shallow health checks.</strong>
            </li>
            <li>
              <strong>Reverse proxy</strong> handles TLS, compression, caching and routing. <strong>API gateway</strong>{" "}
              adds auth, rate limits and routing. <strong>BFF</strong> gives each client its own API.
            </li>
            <li>
              <strong>CDN:</strong> edge caching via <code>Cache-Control</code>, <strong>hashed file names</strong>,
              purges and origin shield.
            </li>
            <li>
              <strong>Caching:</strong> cache-aside plus <strong>delete on write</strong>, TTL on everything. LRU/LFU
              eviction. Defend against <strong>stampedes, avalanches, penetration and hot keys</strong>.
            </li>
            <li>
              <strong>Object storage</strong> for files: <strong>pre-signed URLs</strong> + CDN, lifecycle rules,
              private by default.
            </li>
            <li>
              <strong>Queues</strong> decouple work, absorb spikes and scale via competing consumers. Messages may
              arrive <strong>twice</strong>.
            </li>
            <li>
              <strong>Search</strong> uses an <strong>inverted index</strong>, analysers and BM25. Keep it in sync via
              CDC. It can always be rebuilt.
            </li>
          </ul>
          <h3 id="part-4-databases-posts-20-29">
            Part 4: Databases <em>(posts 20–29)</em>
          </h3>
          <ul>
            <li>
              <strong>SQL</strong> (joins, transactions, flexibility) vs <strong>NoSQL</strong> (key-value, document,
              wide-column, graph). <strong>Pick by access pattern.</strong>
            </li>
            <li>
              <strong>ACID</strong> and isolation levels. Watch for <strong>lost updates and write skew</strong>. Fixes:{" "}
              <strong>
                atomic updates, <code>FOR UPDATE</code>, unique constraints, Serializable + retry
              </strong>
              .
            </li>
            <li>
              <strong>B-tree</strong> (read-optimised, in-place) vs <strong>LSM</strong> (write-optimised, compaction,
              Bloom filters).
            </li>
            <li>
              <strong>Normalise</strong> for correctness, <strong>denormalise</strong> hot paths for reads, and keep
              copies in sync.
            </li>
            <li>
              <strong>Replication:</strong> single-leader (async vs sync), lag problems (
              <strong>read-your-writes</strong>), failover, <strong>split brain</strong>. Multi-leader and leaderless
              use <strong>quorums</strong>.
            </li>
            <li>
              <strong>Sharding:</strong> range, hash or directory. The <strong>shard key</strong> is critical. Watch for
              hot keys, cross-shard queries and resharding.
            </li>
            <li>
              <strong>Consistent hashing:</strong> a ring plus virtual nodes means only ~1/N of keys move.
            </li>
            <li>
              <strong>CAP:</strong> during a partition, choose C or A. <strong>PACELC:</strong> otherwise, latency or
              consistency.
            </li>
            <li>
              <strong>Consistency models:</strong> linearizable → causal → session guarantees → eventual.{" "}
              <strong>Choose per feature.</strong>
            </li>
            <li>
              <strong>Default: PostgreSQL + Redis.</strong> Add specialised stores only when needed.
            </li>
          </ul>
          <h3 id="part-5-apis-posts-30-34">
            Part 5: APIs <em>(posts 30–34)</em>
          </h3>
          <ul>
            <li>
              <strong>REST:</strong> nouns + HTTP verbs, correct status codes, consistent errors, OpenAPI.
            </li>
            <li>
              <strong>gRPC:</strong> Protobuf + HTTP/2, streaming, <strong>deadlines</strong>. Needs L7 or client-side
              load balancing. Mainly used <strong>internally</strong>.
            </li>
            <li>
              <strong>GraphQL:</strong> clients pick their fields. Watch <strong>N+1 (DataLoader)</strong>, cost limits
              and harder caching.
            </li>
            <li>
              <strong>Real time:</strong> polling → long polling → <strong>SSE</strong> (one-way) →{" "}
              <strong>WebSockets</strong> (two-way). Scale with gateways + pub/sub.
            </li>
            <li>
              <strong>Idempotency keys</strong> make retries safe. <strong>Cursor pagination</strong> stays stable.{" "}
              <strong>Versioning:</strong> add, don't break. Deprecate slowly.
            </li>
          </ul>
          <h3 id="part-6-async-and-events-posts-35-39">
            Part 6: Async &amp; events <em>(posts 35–39)</em>
          </h3>
          <ul>
            <li>
              <strong>Queue:</strong> one consumer per message. <strong>Pub/sub:</strong> every subscriber gets a copy.
              Combine them with fan-out or consumer groups.
            </li>
            <li>
              <strong>Kafka:</strong> partitioned log, <strong>key → partition → order</strong>, consumer groups,
              offsets, lag, retention and compaction.
            </li>
            <li>
              <strong>Delivery:</strong> at-most-once (may lose), <strong>at-least-once (may duplicate)</strong>, and{" "}
              <strong>effectively-once = at-least-once + idempotent consumers</strong>.
            </li>
            <li>
              <strong>Outbox pattern</strong> solves the dual-write problem (DB + event).
            </li>
            <li>
              <strong>Jobs:</strong> small payloads (IDs), idempotent, chunked.{" "}
              <strong>Retries only for transient errors</strong>, with backoff + jitter, then a <strong>DLQ</strong>.
            </li>
            <li>
              <strong>Event-driven:</strong> events vs commands, choreography vs orchestration,{" "}
              <strong>sagas with compensations</strong>.
            </li>
          </ul>
          <h3 id="part-7-reliability-posts-40-45">
            Part 7: Reliability <em>(posts 40–45)</em>
          </h3>
          <ul>
            <li>
              <strong>Find SPOFs</strong>, including hidden ones: DNS, certificates, NAT, config, auth, people.
              Redundancy across <strong>3 AZs</strong>, and <strong>test failover</strong>.
            </li>
            <li>
              <strong>Timeouts on every call.</strong> Retry at <strong>one layer</strong>, with{" "}
              <strong>exponential backoff + jitter</strong> and retry budgets.
            </li>
            <li>
              <strong>Circuit breaker</strong> (closed → open → half-open) plus <strong>fallbacks</strong>.{" "}
              <strong>Bulkheads</strong> isolate resource pools.
            </li>
            <li>
              <strong>Rate limiting:</strong> token bucket (API favourite), sliding window, leaky bucket. Distributed
              via <strong>Redis + Lua</strong>. Return <strong>429 + Retry-After</strong>.
            </li>
            <li>
              <strong>Load shedding</strong> and <strong>graceful degradation</strong> under overload. Prioritise
              critical traffic.
            </li>
            <li>
              <strong>Backups ≠ replication.</strong> Use <strong>RPO/RTO</strong>, PITR, the 3-2-1 rule and immutable
              backups. <strong>Test restores.</strong>
            </li>
          </ul>
          <h3 id="part-8-observability-posts-46-48">
            Part 8: Observability <em>(posts 46–48)</em>
          </h3>
          <ul>
            <li>
              <strong>Logs</strong> (what happened), <strong>metrics</strong> (numbers over time),{" "}
              <strong>traces</strong> (where time went). Use <strong>OpenTelemetry</strong>.
            </li>
            <li>
              Watch <strong>Golden Signals / RED / USE</strong>. <strong>No high-cardinality labels</strong> in metrics.
            </li>
            <li>
              <strong>SLI → SLO → SLA</strong>, error budgets and <strong>burn-rate alerts</strong>.
            </li>
            <li>
              <strong>Alert on symptoms</strong>, give every alert a runbook, <strong>mitigate first</strong>, and write{" "}
              <strong>blameless postmortems</strong>.
            </li>
          </ul>
          <h3 id="part-9-security-posts-49-52">
            Part 9: Security <em>(posts 49–52)</em>
          </h3>
          <ul>
            <li>
              <strong>AuthN</strong> (who you are) ≠ <strong>AuthZ</strong> (what you can do).{" "}
              <strong>Check every object</strong> (prevent IDOR).
            </li>
            <li>
              Passwords with <strong>Argon2id/bcrypt</strong>, plus <strong>MFA / passkeys</strong>. Sessions in{" "}
              <strong>HttpOnly; Secure; SameSite</strong> cookies.
            </li>
            <li>
              <strong>JWT</strong> is signed, not encrypted. Keep them short-lived, with{" "}
              <strong>rotating refresh tokens</strong>. Pin the algorithm.
            </li>
            <li>
              <strong>OAuth 2.0</strong> = delegated access (<strong>Auth Code + PKCE</strong>). <strong>OIDC</strong> =
              login (ID token).
            </li>
            <li>
              <strong>TLS everywhere, mTLS</strong> between services, <strong>KMS + envelope encryption</strong>, a{" "}
              <strong>secrets manager</strong>, and no secrets in code.
            </li>
            <li>
              <strong>OWASP:</strong> broken access control, injection (<strong>parameterise</strong>),
              misconfiguration, vulnerable components (<strong>patch</strong>), SSRF, supply chain.
            </li>
          </ul>
          <h3 id="part-10-architecture-and-deployment-posts-53-58">
            Part 10: Architecture &amp; deployment <em>(posts 53–58)</em>
          </h3>
          <ul>
            <li>
              <strong>Monolith first</strong>, then a <strong>modular monolith</strong>, then microservices when teams
              and scale demand it. Migrate with the <strong>strangler fig</strong>. Avoid a{" "}
              <strong>distributed monolith</strong>.
            </li>
            <li>
              <strong>Service discovery:</strong> registry + health checks, client-side or server-side, DNS, service
              mesh.
            </li>
            <li>
              <strong>Docker:</strong> images, layers, multi-stage builds, non-root, no secrets. Use{" "}
              <strong>
                version tags, not <code>latest</code>
              </strong>
              .
            </li>
            <li>
              <strong>Kubernetes:</strong> desired state + reconciliation. Pods, Deployments, Services, Ingress,{" "}
              <strong>readiness vs liveness</strong>, requests/limits, HPA.
            </li>
            <li>
              <strong>Cloud:</strong> regions → AZs (<strong>multi-AZ in production</strong>), IaaS/PaaS/serverless,
              shared responsibility, <strong>egress costs</strong>, IaC.
            </li>
            <li>
              <strong>CI/CD:</strong> small, frequent merges, <strong>canary / blue-green</strong>, feature flags,{" "}
              <strong>expand-and-contract</strong> migrations, <strong>DORA</strong> metrics.
            </li>
          </ul>
          <h3 id="part-11-case-studies-posts-59-65">
            Part 11: Case studies <em>(posts 59–65)</em>
          </h3>
          <p>See the one-liners in section 10 of this page.</p>
          <hr />
        </Section>

        <Section id="6-if-you-need-x-use-y-cheat-sheet" title={'6. "If You Need X, Use Y" Cheat Sheet'}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Need</th>
                  <th>Use</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Find servers by name</td>
                  <td>DNS</td>
                </tr>
                <tr>
                  <td>Serve static files fast worldwide</td>
                  <td>CDN</td>
                </tr>
                <tr>
                  <td>Spread traffic, survive server loss</td>
                  <td>Load balancer + stateless servers</td>
                </tr>
                <tr>
                  <td>Auth, rate limits, routing for APIs</td>
                  <td>API gateway</td>
                </tr>
                <tr>
                  <td>Fast reads of hot data</td>
                  <td>Redis (cache-aside)</td>
                </tr>
                <tr>
                  <td>Transactions + flexible queries</td>
                  <td>PostgreSQL / MySQL</td>
                </tr>
                <tr>
                  <td>Huge write-heavy, time-ordered data</td>
                  <td>Cassandra / ScyllaDB</td>
                </tr>
                <tr>
                  <td>Simple key lookups at massive scale</td>
                  <td>DynamoDB / key-value store</td>
                </tr>
                <tr>
                  <td>Relationships (friends of friends)</td>
                  <td>Graph DB</td>
                </tr>
                <tr>
                  <td>Files, images, video, backups</td>
                  <td>Object storage (S3) + CDN</td>
                </tr>
                <tr>
                  <td>Full-text search</td>
                  <td>Elasticsearch / OpenSearch (or Postgres FTS)</td>
                </tr>
                <tr>
                  <td>Analytics over billions of rows</td>
                  <td>Data warehouse (BigQuery, Snowflake, ClickHouse)</td>
                </tr>
                <tr>
                  <td>Scale DB reads</td>
                  <td>Read replicas</td>
                </tr>
                <tr>
                  <td>Scale DB writes / size</td>
                  <td>Sharding (good shard key)</td>
                </tr>
                <tr>
                  <td>Spread keys across changing servers</td>
                  <td>Consistent hashing</td>
                </tr>
                <tr>
                  <td>Background work</td>
                  <td>Queue + workers</td>
                </tr>
                <tr>
                  <td>Many services reacting to events</td>
                  <td>Kafka / pub-sub</td>
                </tr>
                <tr>
                  <td>DB change → events reliably</td>
                  <td>Outbox + CDC</td>
                </tr>
                <tr>
                  <td>Multi-service transaction</td>
                  <td>Saga (with compensations)</td>
                </tr>
                <tr>
                  <td>Safe retries</td>
                  <td>Idempotency keys + unique constraints</td>
                </tr>
                <tr>
                  <td>Unique IDs across servers</td>
                  <td>Snowflake IDs / UUIDv7</td>
                </tr>
                <tr>
                  <td>Server push, one way</td>
                  <td>SSE</td>
                </tr>
                <tr>
                  <td>Two-way real time</td>
                  <td>WebSockets</td>
                </tr>
                <tr>
                  <td>Fast internal calls</td>
                  <td>gRPC</td>
                </tr>
                <tr>
                  <td>Client-specific data shapes</td>
                  <td>GraphQL / BFF</td>
                </tr>
                <tr>
                  <td>Stop abusive clients</td>
                  <td>Rate limiting (token bucket)</td>
                </tr>
                <tr>
                  <td>Survive overload</td>
                  <td>Load shedding, graceful degradation</td>
                </tr>
                <tr>
                  <td>Survive a failing dependency</td>
                  <td>Timeouts, retries + jitter, circuit breaker, bulkhead</td>
                </tr>
                <tr>
                  <td>Recover from deletes/corruption</td>
                  <td>Backups + PITR</td>
                </tr>
                <tr>
                  <td>Know what's wrong</td>
                  <td>Logs, metrics, traces, SLO alerts</td>
                </tr>
                <tr>
                  <td>Login with Google etc.</td>
                  <td>OAuth 2.0 + OIDC</td>
                </tr>
                <tr>
                  <td>Encrypt data &amp; manage keys</td>
                  <td>TLS/mTLS, KMS, secrets manager</td>
                </tr>
                <tr>
                  <td>Run many containers</td>
                  <td>Kubernetes / managed containers</td>
                </tr>
                <tr>
                  <td>Release safely</td>
                  <td>CI/CD + canary + feature flags</td>
                </tr>
              </tbody>
            </table>
          </div>
          <hr />
        </Section>

        <Section id="7-the-big-trade-offs" title="7. The Big Trade-offs">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Trade-off</th>
                  <th>Choose the left when…</th>
                  <th>Choose the right when…</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Consistency vs availability</strong>
                  </td>
                  <td>Money, stock, uniqueness</td>
                  <td>Feeds, likes, catalogues</td>
                </tr>
                <tr>
                  <td>
                    <strong>Latency vs consistency</strong>
                  </td>
                  <td>Correctness matters most</td>
                  <td>Speed matters most (read nearest copy)</td>
                </tr>
                <tr>
                  <td>
                    <strong>SQL vs NoSQL</strong>
                  </td>
                  <td>Relations, transactions, ad-hoc queries</td>
                  <td>Huge scale, simple known access patterns</td>
                </tr>
                <tr>
                  <td>
                    <strong>Normalise vs denormalise</strong>
                  </td>
                  <td>Write correctness, flexibility</td>
                  <td>Read speed on hot paths</td>
                </tr>
                <tr>
                  <td>
                    <strong>Push (fan-out on write) vs pull</strong>
                  </td>
                  <td>Normal users, fast reads</td>
                  <td>Celebrities, inactive users</td>
                </tr>
                <tr>
                  <td>
                    <strong>Sync vs async</strong>
                  </td>
                  <td>User must see the result now</td>
                  <td>Work can happen later</td>
                </tr>
                <tr>
                  <td>
                    <strong>Monolith vs microservices</strong>
                  </td>
                  <td>Small team, changing domain</td>
                  <td>Many teams, clear boundaries, mature platform</td>
                </tr>
                <tr>
                  <td>
                    <strong>Vertical vs horizontal</strong>
                  </td>
                  <td>Quick fix, databases</td>
                  <td>Stateless tiers, long-term growth</td>
                </tr>
                <tr>
                  <td>
                    <strong>Cache vs fresh read</strong>
                  </td>
                  <td>Read-heavy, staleness OK</td>
                  <td>Must be exact (checkout, balance)</td>
                </tr>
                <tr>
                  <td>
                    <strong>301 vs 302 redirect</strong>
                  </td>
                  <td>Less load, no analytics</td>
                  <td>Analytics and control</td>
                </tr>
                <tr>
                  <td>
                    <strong>Sessions vs JWT</strong>
                  </td>
                  <td>First-party web, easy revocation</td>
                  <td>APIs, mobile, service-to-service</td>
                </tr>
                <tr>
                  <td>
                    <strong>Fail open vs fail closed</strong>
                  </td>
                  <td>General limits (availability)</td>
                  <td>Security limits (login, OTP)</td>
                </tr>
                <tr>
                  <td>
                    <strong>Blue-green vs canary</strong>
                  </td>
                  <td>Instant switch, can afford 2×</td>
                  <td>Smallest blast radius, good metrics</td>
                </tr>
                <tr>
                  <td>
                    <strong>Build vs buy (managed)</strong>
                  </td>
                  <td>Core differentiator, huge scale</td>
                  <td>Undifferentiated heavy lifting</td>
                </tr>
              </tbody>
            </table>
          </div>
          <hr />
        </Section>

        <Section id="8-common-problems-fixes" title="8. Common Problems → Fixes">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Problem</th>
                  <th>Fix</th>
                  <th>Post</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Slow query</td>
                  <td>Index, EXPLAIN, fix N+1</td>
                  <td>5, 22</td>
                </tr>
                <tr>
                  <td>DB overloaded by reads</td>
                  <td>Cache + read replicas</td>
                  <td>15, 24</td>
                </tr>
                <tr>
                  <td>DB overloaded by writes/size</td>
                  <td>Shard, or a write-optimised DB</td>
                  <td>25</td>
                </tr>
                <tr>
                  <td>"Too many connections"</td>
                  <td>Connection pools, PgBouncer</td>
                  <td>5</td>
                </tr>
                <tr>
                  <td>Users logged out randomly</td>
                  <td>Stateless servers, sessions in Redis</td>
                  <td>7</td>
                </tr>
                <tr>
                  <td>User doesn't see own update</td>
                  <td>Read-your-writes (read from primary)</td>
                  <td>24</td>
                </tr>
                <tr>
                  <td>Cache stampede</td>
                  <td>Locks, stale-while-revalidate, early refresh</td>
                  <td>16</td>
                </tr>
                <tr>
                  <td>Many keys expire at once</td>
                  <td>TTL jitter</td>
                  <td>16</td>
                </tr>
                <tr>
                  <td>Hot key / celebrity</td>
                  <td>Local cache, key replication, pull model</td>
                  <td>16, 64</td>
                </tr>
                <tr>
                  <td>Double charges</td>
                  <td>Idempotency keys</td>
                  <td>34</td>
                </tr>
                <tr>
                  <td>Duplicate messages</td>
                  <td>Idempotent consumers + dedup table</td>
                  <td>37</td>
                </tr>
                <tr>
                  <td>DB updated but event lost</td>
                  <td>Transactional outbox</td>
                  <td>37</td>
                </tr>
                <tr>
                  <td>Poison message blocks queue</td>
                  <td>Retries + DLQ</td>
                  <td>38</td>
                </tr>
                <tr>
                  <td>One slow dependency slows everything</td>
                  <td>Timeouts, circuit breaker, bulkhead</td>
                  <td>41–42</td>
                </tr>
                <tr>
                  <td>Retry storm</td>
                  <td>Backoff + jitter, retry budget, one layer</td>
                  <td>41</td>
                </tr>
                <tr>
                  <td>Traffic spike overload</td>
                  <td>Queue, rate limiting, load shedding</td>
                  <td>43–44</td>
                </tr>
                <tr>
                  <td>Accidental data deletion</td>
                  <td>Backups + PITR, soft deletes</td>
                  <td>45</td>
                </tr>
                <tr>
                  <td>Noisy alerts</td>
                  <td>Symptom-based SLO burn-rate alerts</td>
                  <td>47–48</td>
                </tr>
                <tr>
                  <td>IDOR data leak</td>
                  <td>Per-object authorisation</td>
                  <td>49</td>
                </tr>
                <tr>
                  <td>Leaked secret</td>
                  <td>Rotate immediately, secrets manager, scanning</td>
                  <td>51</td>
                </tr>
                <tr>
                  <td>Deploy breaks prod</td>
                  <td>Canary, auto-rollback, feature flags</td>
                  <td>58</td>
                </tr>
                <tr>
                  <td>Schema change breaks old code</td>
                  <td>Expand and contract</td>
                  <td>58</td>
                </tr>
              </tbody>
            </table>
          </div>
          <hr />
        </Section>

        <Section id="9-security-quick-checklist" title="9. Security Quick Checklist">
          <ul>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              HTTPS/TLS everywhere, mTLS internally, HSTS
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Passwords hashed with Argon2id/bcrypt, MFA/passkeys available
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Sessions in <code>HttpOnly; Secure; SameSite</code> cookies, or short-lived JWT + rotating refresh tokens
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              <strong>Authorisation checked on every object</strong> (tenant/user scoping)
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Parameterised queries, input validation, output encoding
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Rate limits on login, OTP and expensive endpoints
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Secrets in a secrets manager, never in code, images or logs
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Data encrypted at rest (KMS), sensitive fields tokenised or encrypted
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Dependencies and images scanned and patched, SBOM kept
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              SSRF protections (allow-lists, block metadata IPs)
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Security events logged and alerted on
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Least privilege for users, services and cloud roles
            </li>
          </ul>
          <p>
            <em>(Posts 49–52)</em>
          </p>
          <hr />
        </Section>

        <Section id="10-case-studies-in-one-line-each" title="10. Case Studies in One Line Each">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>System</th>
                  <th>The core idea</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>URL shortener</strong>
                  </td>
                  <td>
                    Read-heavy KV lookup: <strong>7-char Base62 codes</strong> (random or scrambled Snowflake), Redis
                    cache, shard by code, <strong>302 + async analytics</strong>.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Rate limiter</strong>
                  </td>
                  <td>
                    Gateway middleware + <strong>Redis Cluster with atomic Lua</strong>; token bucket for plans, sliding
                    window for abuse; <strong>429 + headers</strong>; fail open vs closed per rule.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Notification system</strong>
                  </td>
                  <td>
                    <strong>Async, central service</strong> with <strong>priority lanes</strong> (OTP never waits),
                    preferences/templates, <strong>dedup</strong>, provider rate limits + failover, tracking.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Chat system</strong>
                  </td>
                  <td>
                    <strong>WebSocket gateways</strong> + pub/sub + session registry;{" "}
                    <strong>store first, then deliver</strong>; per-conversation <strong>sequence numbers</strong>;{" "}
                    <strong>sync on reconnect</strong>; wide-column storage.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>News feed</strong>
                  </td>
                  <td>
                    <strong>Hybrid fan-out</strong> (push for normal users, pull for celebrities); feed cache of{" "}
                    <strong>post IDs</strong>; <strong>batch hydration</strong>; read-time ranking; cursor pagination.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Pastebin</strong>
                  </td>
                  <td>
                    Metadata in DB, <strong>content in object storage + CDN</strong>, random IDs, expiry cleanup job.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <em>(Posts 59–64)</em>
          </p>
          <p>
            <strong>Other classic problems to practise:</strong> web crawler, search autocomplete (trie + cache),
            YouTube (upload → transcode queue → CDN), Google Drive (chunked sync + object storage), ride-hailing
            (geospatial index + real-time location), payment system (idempotency + ledger + reconciliation), leaderboard
            (Redis sorted sets), distributed ID generator, key-value store, metrics/monitoring system.
          </p>
          <hr />
        </Section>

        <Section id="11-the-reference-architecture-mini-version" title="11. The Reference Architecture (mini version)">
          <Layers
            caption="The reference architecture, mini version."
            layers={[
              { name: <>Clients → DNS → CDN / WAF</>, desc: <>the edge</> },
              { name: <>Load balancer → API gateway</>, desc: <>the front door</> },
              { name: <>Stateless services</>, desc: <>multi-AZ, on Kubernetes</> },
              { name: <>Redis · SQL primary + replicas/shards · object storage · search</>, desc: <>the data tier</> },
              { name: <>Queue / Kafka → workers</>, desc: <>outbox, DLQ, sagas</> },
              {
                name: <>Observability · security · CI/CD · IaC · backups/DR · autoscaling</>,
                desc: <>around everything</>,
              },
            ]}
          />
          <p>
            <strong>Growth path:</strong> one server → separate DB → LB + stateless servers → cache + CDN → replicas +
            queues → split + shard → multi-region. <strong>Move only when the numbers say so.</strong>
          </p>
          <p>
            <em>(Post 68)</em>
          </p>
          <hr />
        </Section>

        <Section id="12-interview-do-s-and-don-ts" title="12. Interview Do's and Don'ts">
          <p>
            <strong>Do:</strong>
          </p>
          <ul>
            <li>
              ✅ Ask clarifying questions, and <strong>state your assumptions</strong>.
            </li>
            <li>
              ✅ Put <strong>numbers</strong> on everything (QPS, storage, latency).
            </li>
            <li>
              ✅ Start <strong>simple</strong>, then evolve ("v1 → at 10× we'd…").
            </li>
            <li>
              ✅ Walk each use case <strong>through your diagram</strong>.
            </li>
            <li>
              ✅ Compare <strong>options</strong> and explain <strong>trade-offs</strong>.
            </li>
            <li>
              ✅ Talk about <strong>failures, monitoring and security</strong>.
            </li>
            <li>✅ Check in with the interviewer at each step.</li>
          </ul>
          <p>
            <strong>Don't:</strong>
          </p>
          <ul>
            <li>❌ Jump to Kafka, Kubernetes or microservices without a reason.</li>
            <li>❌ Design for Google scale when the requirement is small.</li>
            <li>❌ Use averages instead of p99.</li>
            <li>❌ Forget that retries cause duplicates.</li>
            <li>❌ Treat replication as backup.</li>
            <li>❌ Spend all your time on one component.</li>
            <li>❌ Stay silent. Think out loud.</li>
          </ul>
          <hr />
        </Section>

        <Section id="13-the-10-rules-to-remember-forever" title="13. The 10 Rules to Remember Forever">
          <ol>
            <li>
              <strong>Requirements and numbers first.</strong>
            </li>
            <li>
              <strong>Start simple. Scale when measured.</strong>
            </li>
            <li>
              <strong>Every choice is a trade-off. Say it out loud.</strong>
            </li>
            <li>
              <strong>Data is the hard part:</strong> model, consistency, partitioning, backups.
            </li>
            <li>
              <strong>Cache hot reads. Queue slow work.</strong>
            </li>
            <li>
              <strong>Make every write safe to retry.</strong>
            </li>
            <li>
              <strong>Everything fails:</strong> timeouts, retries + jitter, circuit breakers, redundancy.
            </li>
            <li>
              <strong>Measure what users feel:</strong> p99, SLOs, symptom alerts.
            </li>
            <li>
              <strong>Ship small, gradual, reversible changes.</strong>
            </li>
            <li>
              <strong>Get the security basics right, everywhere.</strong>
            </li>
          </ol>
          <hr />
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>1 million requests a day is roughly how many per second?</>,
                a: (
                  <>
                    <p>About 12 on average (1,000,000 ÷ 86,400). Multiply by 2–10 for the peak — use ~3× if unsure.</p>
                  </>
                ),
              },
              {
                q: <>How much downtime does 99.9% allow per month?</>,
                a: (
                  <>
                    <p>About 43.8 minutes (8.8 hours a year). 99.99% allows about 4.4 minutes a month.</p>
                  </>
                ),
              },
              {
                q: <>Replication, sharding, backups — what does each give you?</>,
                a: (
                  <>
                    <p>
                      Replication: availability and read scaling. Sharding: write throughput and data size. Backups: the
                      ability to go back in time after deletes, corruption or ransomware.
                    </p>
                  </>
                ),
              },
              {
                q: <>What's the safe default caching pattern?</>,
                a: (
                  <>
                    <p>
                      Cache-aside: read the cache, load from the database on a miss and populate it, delete the key on
                      write, and set a TTL on everything.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you make a POST safe to retry?</>,
                a: (
                  <>
                    <p>
                      An idempotency key stored under a unique constraint with the saved response, so a retry returns
                      the original result instead of repeating the side effect.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is W + R &gt; N?</>,
                a: (
                  <>
                    <p>
                      The quorum condition: with N replicas, if writes wait for W acknowledgements and reads query R
                      replicas with W + R &gt; N, every read overlaps the latest write.
                    </p>
                  </>
                ),
              },
              {
                q: <>At-least-once delivery means what for consumers?</>,
                a: (
                  <>
                    <p>They must be idempotent, because any message may be processed more than once.</p>
                  </>
                ),
              },
              {
                q: <>The four golden signals?</>,
                a: (
                  <>
                    <p>Latency, traffic, errors and saturation.</p>
                  </>
                ),
              },
              {
                q: <>Fan-out on write or on read for a news feed?</>,
                a: (
                  <>
                    <p>
                      A hybrid: push to followers' feed caches for normal authors, pull celebrities' recent posts at
                      read time, and merge.
                    </p>
                  </>
                ),
              },
              {
                q: <>The top API vulnerability?</>,
                a: (
                  <>
                    <p>
                      Broken object-level authorization (IDOR) — check that the caller may access this specific object
                      on every request.
                    </p>
                  </>
                ),
              },
            ]}
          />
        </Section>

        <Section id="key-takeaways" title="Key Takeaways" kind="takeaways">
          <ul>
            <li>
              Use the <strong>5-step framework</strong> for every design: requirements → estimation → API &amp; data →
              high-level → deep dives (+ trade-offs).
            </li>
            <li>
              Keep the <strong>numbers and formulas</strong> handy: 1 day ≈ 100k s, 1M/day ≈ 12 QPS, the nines table,
              Little's Law, W + R &gt; N, Base62 sizes.
            </li>
            <li>
              Know <strong>which building block solves which problem</strong>, and the <strong>big trade-offs</strong>{" "}
              (consistency vs availability, push vs pull, sync vs async, monolith vs microservices).
            </li>
            <li>
              Recognise <strong>common problems and their standard fixes</strong>, and run through the{" "}
              <strong>security checklist</strong>.
            </li>
            <li>
              When in doubt: <strong>simple, measured, observable, safe to retry, safe to deploy.</strong>
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              The companion reference posts: <em>"System Design Series: The Conclusion"</em>,{" "}
              <em>"System Design Glossary: Every Short Form Explained"</em> and{" "}
              <em>"The Complete System Design Architecture"</em>
            </li>
            <li>
              <em>Designing Data-Intensive Applications</em> by Martin Kleppmann
            </li>
            <li>
              <em>System Design Interview</em> Volumes 1 and 2 by Alex Xu (and Sahn Lam)
            </li>
            <li>The System Design Primer on GitHub</li>
            <li>
              <em>Site Reliability Engineering</em> by Google
            </li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
