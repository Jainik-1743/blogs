import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import { Flow, Layers, QA } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-68")!;

export const metadata: Metadata = {
  title: `Lesson 68 — ${lesson.title}`,
  description: lesson.summary,
};

/** In-page index. Each entry links to a section heading below. */
const outline = [
  { id: "why-this-page-exists", label: "Why This Page Exists" },
  { id: "the-core-idea", label: "The Core Idea" },
  { id: "the-big-picture", label: "The Big Picture" },
  { id: "how-it-works", label: "How It Works" },
  { id: "trade-offs", label: "Trade-offs" },
  { id: "in-the-real-world", label: "In the Real World" },
  { id: "interview-questions", label: "Interview Questions" },
  { id: "key-takeaways", label: "Key Takeaways" },
  { id: "further-reading", label: "Further Reading" },
];

export default function SdLessonSixEightPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="why-this-page-exists" title="Why This Page Exists">
          <p>
            Over 65 posts, we learned each building block <strong>one at a time</strong>. This page puts{" "}
            <strong>all of them into one picture</strong>: a complete, production-style reference architecture, with
            every layer explained in simple words, how requests flow through it, how it grows from one server to
            millions of users, and which post covers each part.
          </p>
          <p>
            <strong>Important:</strong> no real system needs <em>every</em> box on day one. Think of this as a{" "}
            <strong>map of all possible parts</strong>, not a shopping list. Start small, and add pieces when real
            problems (and numbers) appear.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think of a large system as a <strong>city</strong>:
          </p>
          <ul>
            <li>
              <strong>Roads and addresses</strong> (DNS, networking) help people find places.
            </li>
            <li>
              <strong>Gates and security checkpoints</strong> (CDN, WAF, load balancers, API gateway) control who enters
              and where they go.
            </li>
            <li>
              <strong>Offices and shops</strong> (application services) do the real work.
            </li>
            <li>
              <strong>Warehouses and libraries</strong> (databases, caches, object storage, search) store everything.
            </li>
            <li>
              <strong>The postal system</strong> (queues, event streams, workers) carries messages that don't need an
              instant reply.
            </li>
            <li>
              <strong>Police, hospitals and fire brigades</strong> (security, reliability patterns) keep things safe
              when something goes wrong.
            </li>
            <li>
              <strong>CCTV and control rooms</strong> (observability) show what's happening.
            </li>
            <li>
              <strong>Construction crews</strong> (CI/CD, Kubernetes, cloud) build and change the city without shutting
              it down.
            </li>
          </ul>
        </Section>

        <Section id="the-big-picture" title="The Big Picture">
          <Layers
            caption="The complete architecture, layer by layer. Scroll down for each layer in detail."
            layers={[
              {
                name: <>1 · Clients</>,
                tech: <>web · mobile · partners</>,
                desc: <>HTTPS (TLS 1.3, HTTP/2–3), WebSocket/SSE, webhooks</>,
              },
              {
                name: <>2 · Edge</>,
                tech: <>DNS (GeoDNS/anycast, 2 providers) · CDN · WAF · DDoS</>,
                desc: <>static files and cached pages near users</>,
              },
              {
                name: <>3 · Entry / traffic</>,
                tech: <>L4/L7 load balancers · API gateway / BFFs · WebSocket gateways</>,
                desc: <>auth check, rate limits, routing, presence</>,
              },
              {
                name: <>4 · Application</>,
                tech: <>stateless services on Kubernetes across 3 AZs</>,
                desc: <>REST/GraphQL outside, gRPC inside; timeouts, retries, breakers, bulkheads</>,
              },
              { name: <>5 · Cache</>, tech: <>Redis cluster</>, desc: <>sessions, hot data, counters, rate limits</> },
              {
                name: <>6 · Databases</>,
                tech: <>SQL primary + replicas, shards when needed; NoSQL where it fits</>,
                desc: <>the source of truth</>,
              },
              {
                name: <>7 · Object storage</>,
                tech: <>S3-style + CDN</>,
                desc: <>images, video, documents, backups</>,
              },
              { name: <>8 · Search</>, tech: <>Elasticsearch / OpenSearch</>, desc: <>fed by CDC and events</> },
              {
                name: <>9 · Async</>,
                tech: <>queues · Kafka · outbox + CDC · workers · retry topics + DLQs · sagas</>,
                desc: <>everything that can wait a moment</>,
              },
              {
                name: <>10 · Data &amp; analytics</>,
                tech: <>warehouse / lake · stream processing · BI · ML</>,
                desc: <>fed by CDC and events</>,
              },
              {
                name: <>11 · External services</>,
                tech: <>payments · SMS · email · push · maps · identity</>,
                desc: <>rate-limited, behind circuit breakers</>,
              },
              {
                name: <>12 · Cross-cutting</>,
                tech: <>observability · security · delivery · platform · resilience &amp; DR</>,
                desc: <>everywhere, around everything</>,
              },
            ]}
          />
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="layer-1-clients">Layer 1: Clients</h3>
          <p>
            <strong>What:</strong> web apps, mobile apps, and other companies' systems (partners) that use your APIs.
          </p>
          <p>
            <strong>Key ideas:</strong>
          </p>
          <ul>
            <li>
              <strong>Never trust the client.</strong> Validate and authorise everything on the server (post 52).
            </li>
            <li>
              <strong>Clients can help.</strong> Local caching, retries with backoff and jitter (post 41), offline
              queues, and prefetching the next page.
            </li>
            <li>
              <strong>Mobile apps live for years</strong>, so APIs must stay backward compatible (post 34).
            </li>
            <li>
              Real-time features use <strong>WebSockets or SSE</strong> (post 33). Background notifications use{" "}
              <strong>push</strong> (post 62).
            </li>
          </ul>
          <p>
            <strong>Posts:</strong> 1, 3, 30–34, 41, 62.
          </p>
          <h3 id="layer-2-edge-dns-cdn-waf">Layer 2: Edge (DNS, CDN, WAF)</h3>
          <p>
            <strong>What:</strong> the first things a request touches, often in a city near the user.
          </p>
          <ul>
            <li>
              <strong>DNS</strong> turns names into IPs. <strong>GeoDNS or Anycast</strong> sends users to the nearest
              region. Use <strong>two DNS providers</strong> for critical sites (posts 1 and 11).
            </li>
            <li>
              The <strong>CDN</strong> caches static files, images, video segments and public pages at the edge, which
              cuts latency and origin load (post 14).
            </li>
            <li>
              The <strong>WAF and DDoS protection</strong> block common attacks and floods before they reach you (posts
              14 and 52).
            </li>
            <li>
              <strong>TLS</strong> often terminates here or at the load balancer (post 3).
            </li>
          </ul>
          <p>
            <strong>Rule of thumb:</strong> anything public and cacheable should be served from the edge.
          </p>
          <h3 id="layer-3-entry-and-traffic-management">Layer 3: Entry and traffic management</h3>
          <p>
            <strong>What:</strong> components that receive requests and send them to the right place.
          </p>
          <ul>
            <li>
              <strong>Load balancers (L4/L7)</strong> spread traffic, run health checks, and support zero-downtime
              deploys. They're redundant across zones (post 12).
            </li>
            <li>
              <strong>The API gateway / BFF</strong> handles authentication checks, <strong>rate limiting</strong>,
              routing to services, request shaping and API keys (posts 13, 43 and 61).
            </li>
            <li>
              <strong>WebSocket gateways</strong> hold persistent connections for chat and live updates, with a{" "}
              <strong>presence and session registry</strong> (posts 33 and 63).
            </li>
          </ul>
          <p>
            <strong>Rule of thumb:</strong> put <strong>generic concerns</strong> (auth, rate limits, routing) here, and
            keep <strong>business logic</strong> in services.
          </p>
          <h3 id="layer-4-application-services">Layer 4: Application services</h3>
          <p>
            <strong>What:</strong> where business logic runs: orders, payments, users, feeds and so on.
          </p>
          <ul>
            <li>
              <strong>Stateless services</strong> (post 7) mean any instance can handle any request, so you scale out by
              adding instances.
            </li>
            <li>
              <strong>Monolith vs microservices</strong> (post 53): start with a <strong>(modular) monolith</strong>,
              and split into services when teams and scale require it.
            </li>
            <li>
              <strong>Communication:</strong> <strong>REST or GraphQL</strong> to clients, and <strong>gRPC</strong>{" "}
              between services (posts 30–32). <strong>Service discovery</strong> lets services find each other (post
              54).
            </li>
            <li>
              <strong>Resilience on every call:</strong> timeouts, limited retries with jitter, circuit breakers,
              bulkheads and fallbacks (posts 41–42).
            </li>
            <li>
              <strong>Runs on:</strong> containers (post 55), orchestrated by Kubernetes (post 56), across{" "}
              <strong>3 availability zones</strong> (posts 40 and 57).
            </li>
          </ul>
          <h3 id="layer-5-cache">Layer 5: Cache</h3>
          <p>
            <strong>What:</strong> fast, in-memory copies of hot data (post 15).
          </p>
          <ul>
            <li>
              <strong>Redis cluster</strong> for: object cache (product, profile), <strong>sessions</strong> (post 49),{" "}
              <strong>counters</strong>, <strong>rate-limit buckets</strong> (post 43), <strong>feed lists</strong>{" "}
              (post 64), leaderboards and presence.
            </li>
            <li>
              <strong>Patterns:</strong> cache-aside, delete on write, TTL on everything (post 16).
            </li>
            <li>
              <strong>Protect against:</strong> stampedes, avalanches (TTL jitter), penetration and hot keys (post 16).
            </li>
            <li>
              <strong>Always plan for "the cache is down"</strong> (post 16).
            </li>
          </ul>
          <h3 id="layer-6-databases-the-source-of-truth">Layer 6: Databases (the source of truth)</h3>
          <p>
            <strong>What:</strong> durable, authoritative data.
          </p>
          <ul>
            <li>
              <strong>Default:</strong> <strong>PostgreSQL/MySQL</strong> with a <strong>primary + replicas</strong>{" "}
              across zones (posts 5, 20 and 24).
            </li>
            <li>
              <strong>Scale path:</strong> indexes → caching → a bigger machine → read replicas → functional split →{" "}
              <strong>sharding</strong> with a good shard key (posts 22 and 24–26).
            </li>
            <li>
              <strong>Special workloads:</strong> wide-column (Cassandra/ScyllaDB) for huge write-heavy streams like
              chat messages. Key-value (DynamoDB) for simple lookups at massive scale (posts 20 and 29).
            </li>
            <li>
              <strong>Correctness:</strong> transactions and isolation levels, unique constraints, idempotency keys
              (posts 21 and 34).
            </li>
            <li>
              <strong>Consistency:</strong> strong for money and uniqueness, eventual for feeds and counts (posts
              27–28).
            </li>
            <li>
              <strong>Backups + PITR</strong> in another region: <strong>replication is not a backup</strong> (post 45).
            </li>
          </ul>
          <h3 id="layer-7-object-storage">Layer 7: Object storage</h3>
          <p>
            <strong>What:</strong> files, images, videos, documents, exports and backups (post 17).
          </p>
          <ul>
            <li>
              <strong>Pre-signed URLs:</strong> clients upload and download <strong>directly</strong>, without going
              through app servers.
            </li>
            <li>
              <strong>The CDN</strong> in front for fast delivery.
            </li>
            <li>
              <strong>Lifecycle rules</strong> move old data to cheaper storage classes.
            </li>
            <li>
              <strong>Private by default</strong>, encrypted, and versioned for important data.
            </li>
          </ul>
          <h3 id="layer-8-search">Layer 8: Search</h3>
          <p>
            <strong>What:</strong> full-text search, filters and facets, and sometimes vector search (post 19).
          </p>
          <ul>
            <li>
              <strong>Elasticsearch/OpenSearch</strong>, or <strong>PostgreSQL full-text search</strong> for smaller
              needs.
            </li>
            <li>
              <strong>Kept in sync</strong> via <strong>CDC or events</strong>, never as the source of truth (it can
              always be rebuilt).
            </li>
          </ul>
          <h3 id="layer-9-asynchronous-processing">Layer 9: Asynchronous processing</h3>
          <p>
            <strong>What:</strong> everything the user doesn't need to wait for.
          </p>
          <ul>
            <li>
              <strong>Queues</strong> (SQS, RabbitMQ) for jobs: emails, image processing, reports (posts 18 and 38).
            </li>
            <li>
              <strong>An event log (Kafka)</strong> for event streaming between services, CDC and analytics pipelines
              (posts 35–36 and 39).
            </li>
            <li>
              <strong>The outbox pattern + CDC</strong> reliably connect database changes to events (post 37).
            </li>
            <li>
              <strong>Workers</strong> with <strong>idempotent processing</strong>,{" "}
              <strong>retries with backoff</strong> and <strong>DLQs</strong> (posts 37–38).
            </li>
            <li>
              <strong>Workflows and sagas</strong> for multi-step business processes, with compensating actions (post
              39).
            </li>
          </ul>
          <p>
            <strong>Rule of thumb:</strong>{" "}
            <strong>save the essential state synchronously, and do the rest asynchronously.</strong>
          </p>
          <h3 id="layer-10-data-and-analytics">Layer 10: Data and analytics</h3>
          <p>
            <strong>What:</strong> reporting, dashboards, machine learning and business intelligence.
          </p>
          <ul>
            <li>
              <strong>Data flows</strong> from databases and events (via CDC or Kafka) into a{" "}
              <strong>warehouse or lake</strong> (BigQuery, Snowflake, ClickHouse).
            </li>
            <li>
              <strong>Stream processing</strong> (Flink, Kafka Streams) for real-time metrics, fraud detection and
              alerts.
            </li>
            <li>
              <strong>Keep heavy analytics away</strong> from the production database (post 5).
            </li>
          </ul>
          <h3 id="layer-11-external-services">Layer 11: External services</h3>
          <p>
            <strong>What:</strong> payment gateways, SMS, email, push notifications, maps and identity providers.
          </p>
          <ul>
            <li>
              <strong>Treat them as unreliable:</strong> timeouts, retries only for transient errors,{" "}
              <strong>circuit breakers</strong>, and <strong>backup providers</strong> for critical channels (posts
              41–42 and 62).
            </li>
            <li>
              <strong>Respect their rate limits</strong> with token buckets (post 43).
            </li>
            <li>
              <strong>Verify webhooks</strong> with signatures, and handle them idempotently (post 34).
            </li>
          </ul>
          <h3 id="layer-12-cross-cutting-concerns">Layer 12: Cross-cutting concerns</h3>
          <p>
            These apply to <strong>every</strong> layer.
          </p>
          <p>
            <strong>Observability</strong> (posts 46–48):
          </p>
          <ul>
            <li>
              structured logs, metrics (Golden Signals, RED, USE) and distributed traces with{" "}
              <strong>OpenTelemetry</strong>,
            </li>
            <li>
              <strong>SLOs and error budgets</strong> for key user journeys,
            </li>
            <li>
              <strong>symptom-based alerts</strong>, runbooks, on-call and <strong>blameless postmortems</strong>.
            </li>
          </ul>
          <p>
            <strong>Security</strong> (posts 49–52):
          </p>
          <ul>
            <li>
              <strong>AuthN</strong> (sessions, JWT, OAuth/OIDC, MFA, passkeys) and <strong>AuthZ</strong> (per-object
              checks, RBAC/ReBAC),
            </li>
            <li>
              <strong>TLS everywhere, mTLS</strong> between services, <strong>KMS and envelope encryption</strong>, and
              a <strong>secrets manager</strong>,
            </li>
            <li>
              <strong>OWASP basics:</strong> parameterised queries, patched dependencies, SSRF protections, security
              headers, logging.
            </li>
          </ul>
          <p>
            <strong>Delivery</strong> (post 58):
          </p>
          <ul>
            <li>
              <strong>CI:</strong> build, test and scan every change. <strong>CD:</strong> canary or blue-green rollouts
              with automatic rollback.
            </li>
            <li>
              <strong>Feature flags</strong>, <strong>expand-and-contract</strong> database migrations, and{" "}
              <strong>GitOps</strong>.
            </li>
          </ul>
          <p>
            <strong>Platform</strong> (posts 55–57):
          </p>
          <ul>
            <li>
              <strong>cloud regions and AZs</strong>, VPC networking and <strong>infrastructure as code</strong>,
            </li>
            <li>
              <strong>Kubernetes</strong> (or a simpler managed platform), <strong>autoscaling</strong>, and{" "}
              <strong>cost management</strong>.
            </li>
          </ul>
          <p>
            <strong>Resilience and DR</strong> (posts 40, 44 and 45):
          </p>
          <ul>
            <li>
              no single points of failure, <strong>multi-AZ</strong> by default, <strong>multi-region</strong> for
              critical systems,
            </li>
            <li>
              <strong>load shedding and graceful degradation</strong>, <strong>backups, PITR and DR drills</strong>, and{" "}
              <strong>chaos testing</strong>.
            </li>
          </ul>
          <hr />
          <h3 id="how-requests-flow-through-the-architecture">How requests flow through the architecture</h3>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Flow 1: A read ("show product page")</h4>
          <SequenceDiagram
            caption="Flow 1 — browsing a product page. Most of it is served from caches."
            actors={["Browser", "CDN", "Gateway", "Catalog service", "Redis", "DB replica"]}
            messages={[
              { from: 0, to: 1, label: <>HTML shell, JS, CSS, images</> },
              { from: 1, to: 0, label: <>cache HIT, served nearby</>, reply: true },
              { from: 0, to: 2, label: <>GET /api/products/991</>, note: <>auth OK, rate limit OK</> },
              { from: 2, to: 3, label: <>route</> },
              { from: 3, to: 4, label: <>GET product:991</> },
              { from: 4, to: 3, label: <>HIT (~1 ms)</>, reply: true },
              {
                from: 0,
                to: 0,
                label: (
                  <>
                    On a miss — read a DB replica and fill Redis; pricing and stock are read fresh, with timeouts and
                    fallbacks
                  </>
                ),
                divider: true,
              },
              { from: 3, to: 0, label: <>JSON (+ Cache-Control where safe)</>, reply: true },
            ]}
          />
          <p>
            <strong>Key ideas:</strong> CDN for static content, cache-aside for data, replicas for reads, and fallbacks
            for optional parts.
          </p>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Flow 2: A write ("place order")</h4>
          <Flow
            caption="Flow 2 — placing an order. Synchronous where it must be, asynchronous everywhere else."
            nodes={[
              {
                title: <>Gateway → order service</>,
                desc: <>authenticate, rate-limit, validate, check authorisation</>,
              },
              {
                title: <>One DB transaction</>,
                desc: <>reserve stock atomically, create the order, insert an OUTBOX event — COMMIT</>,
              },
              {
                title: <>Charge payment</>,
                desc: <>via the provider with an idempotency key, a timeout and a circuit breaker</>,
              },
              { title: <>201 “Order placed”</>, tone: "good" },
              { title: <>Outbox relay / CDC → Kafka “OrderPlaced”</>, label: <>async</> },
              {
                title: <>Consumers</>,
                desc: <>notifications (email + push) · warehouse (packing) · search &amp; analytics · loyalty points</>,
              },
            ]}
          />
          <p>
            <strong>Key ideas:</strong> transactions for correctness, idempotency for safe retries, the outbox for
            reliable events, and async fan-out for everything else. Multi-step flows can be an{" "}
            <strong>orchestrated saga</strong>.
          </p>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Flow 3: Real time ("chat message")</h4>
          <SequenceDiagram
            caption="Flow 3 — sending a chat message."
            actors={["Sender", "Gateway A", "Chat service", "Store", "Gateway B", "Recipient"]}
            messages={[
              { from: 0, to: 1, label: <>message over WebSocket</> },
              { from: 1, to: 2, label: <>forward</> },
              { from: 2, to: 3, label: <>assign seq, persist</> },
              { from: 2, to: 0, label: <>✓ stored</>, reply: true },
              { from: 2, to: 4, label: <>via registry + pub/sub</> },
              { from: 4, to: 5, label: <>✓✓ delivered</> },
              {
                from: 0,
                to: 0,
                label: <>Offline? → push via APNs/FCM; on reconnect the client syncs “messages after seq N”</>,
                divider: true,
              },
            ]}
          />
          <p>
            <strong>Key ideas:</strong> store first, then deliver, with per-conversation ordering and sync on reconnect.
          </p>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Flow 4: Background job ("export my data")</h4>
          <Flow
            caption="Flow 4 — a long-running export, done in the background."
            nodes={[
              { title: <>App → API</>, desc: <>create a job record (status: queued), enqueue it</> },
              { title: <>202 Accepted &#123;jobId&#125;</>, tone: "good" },
              {
                title: <>Worker</>,
                desc: <>processes in chunks, writes the file to object storage, marks the job done</>,
              },
              { title: <>Notify</>, desc: <>email / push / in-app with a pre-signed download link</> },
              { title: <>Failures</>, desc: <>retries with backoff → DLQ + alert</>, tone: "warn" },
            ]}
          />
          <hr />
          <h3 id="how-the-architecture-grows-from-1-user-to-millions">
            How the architecture grows: from 1 user to millions
          </h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>Users (rough)</th>
                  <th>What you add</th>
                  <th>Why</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>0. Prototype</strong>
                  </td>
                  <td>1–100</td>
                  <td>One server: app + DB together</td>
                  <td>Fastest to build</td>
                </tr>
                <tr>
                  <td>
                    <strong>1. Separate DB</strong>
                  </td>
                  <td>100–10k</td>
                  <td>App server + managed database (with backups)</td>
                  <td>DB and app scale separately; safer data</td>
                </tr>
                <tr>
                  <td>
                    <strong>2. Horizontal app tier</strong>
                  </td>
                  <td>10k–100k</td>
                  <td>Load balancer + 2–3 stateless app servers; sessions in Redis</td>
                  <td>Redundancy and zero-downtime deploys</td>
                </tr>
                <tr>
                  <td>
                    <strong>3. Cache + CDN</strong>
                  </td>
                  <td>100k–1M</td>
                  <td>Redis cache, CDN for static files and media, object storage</td>
                  <td>Most reads never touch the DB</td>
                </tr>
                <tr>
                  <td>
                    <strong>4. Read replicas + async</strong>
                  </td>
                  <td>1M–10M</td>
                  <td>DB replicas, queues and workers, search index</td>
                  <td>Scale reads; move slow work out of requests</td>
                </tr>
                <tr>
                  <td>
                    <strong>5. Observability &amp; reliability</strong>
                  </td>
                  <td>(every stage, growing)</td>
                  <td>Metrics, tracing, SLOs, alerts, circuit breakers, rate limits</td>
                  <td>See and survive problems</td>
                </tr>
                <tr>
                  <td>
                    <strong>6. Split &amp; shard</strong>
                  </td>
                  <td>10M+</td>
                  <td>Split into services by domain; shard the biggest tables; Kafka for events</td>
                  <td>Team autonomy; write scale</td>
                </tr>
                <tr>
                  <td>
                    <strong>7. Multi-region</strong>
                  </td>
                  <td>Global</td>
                  <td>Multiple regions, GeoDNS, replicated data, DR drills</td>
                  <td>Low global latency; survive region loss</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>Remember:</strong> move to the next stage when <strong>measurements</strong> show you need it, not
            because a big company does it.
          </p>
          <hr />
          <h3 id="decision-cheat-sheet">Decision cheat sheet</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>If you need…</th>
                  <th>Reach for…</th>
                  <th>Post</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Faster global delivery of static content</td>
                  <td>CDN</td>
                  <td>14</td>
                </tr>
                <tr>
                  <td>To spread traffic and survive server loss</td>
                  <td>Load balancer + stateless servers</td>
                  <td>7, 12</td>
                </tr>
                <tr>
                  <td>Faster reads of hot data</td>
                  <td>Redis cache (cache-aside)</td>
                  <td>15–16</td>
                </tr>
                <tr>
                  <td>To scale reads on the DB</td>
                  <td>Read replicas</td>
                  <td>24</td>
                </tr>
                <tr>
                  <td>To scale writes / huge data</td>
                  <td>Sharding (good shard key) or a distributed DB</td>
                  <td>25–26</td>
                </tr>
                <tr>
                  <td>Transactions and flexible queries</td>
                  <td>PostgreSQL / MySQL</td>
                  <td>20–21</td>
                </tr>
                <tr>
                  <td>Massive write-heavy, time-ordered data</td>
                  <td>Cassandra / ScyllaDB</td>
                  <td>20, 22</td>
                </tr>
                <tr>
                  <td>Files, images, video, backups</td>
                  <td>Object storage + CDN</td>
                  <td>17</td>
                </tr>
                <tr>
                  <td>Full-text search</td>
                  <td>Elasticsearch / OpenSearch (or Postgres FTS)</td>
                  <td>19</td>
                </tr>
                <tr>
                  <td>Work that can happen later</td>
                  <td>Queue + workers</td>
                  <td>18, 38</td>
                </tr>
                <tr>
                  <td>Many services reacting to events</td>
                  <td>Kafka / pub-sub</td>
                  <td>35–36, 39</td>
                </tr>
                <tr>
                  <td>Safe retries</td>
                  <td>Idempotency keys + unique constraints</td>
                  <td>34, 37</td>
                </tr>
                <tr>
                  <td>Real-time server push</td>
                  <td>WebSockets / SSE</td>
                  <td>33</td>
                </tr>
                <tr>
                  <td>Internal fast service calls</td>
                  <td>gRPC</td>
                  <td>31</td>
                </tr>
                <tr>
                  <td>Flexible client data needs</td>
                  <td>GraphQL</td>
                  <td>32</td>
                </tr>
                <tr>
                  <td>Protection from abusive clients</td>
                  <td>Rate limiting</td>
                  <td>43, 61</td>
                </tr>
                <tr>
                  <td>Protection from overload</td>
                  <td>Load shedding, graceful degradation</td>
                  <td>44</td>
                </tr>
                <tr>
                  <td>Protection from failing dependencies</td>
                  <td>Timeouts, retries + jitter, circuit breakers, bulkheads</td>
                  <td>41–42</td>
                </tr>
                <tr>
                  <td>Recovery from deletion or corruption</td>
                  <td>Backups + PITR, DR plan</td>
                  <td>45</td>
                </tr>
                <tr>
                  <td>Knowing what's happening</td>
                  <td>Logs, metrics, traces, SLOs</td>
                  <td>46–48</td>
                </tr>
                <tr>
                  <td>Secure login and access</td>
                  <td>Sessions/JWT, OAuth/OIDC, MFA, RBAC</td>
                  <td>49–50</td>
                </tr>
                <tr>
                  <td>Protecting data and secrets</td>
                  <td>TLS/mTLS, KMS, secrets manager</td>
                  <td>51</td>
                </tr>
                <tr>
                  <td>Running many containers</td>
                  <td>Kubernetes (or managed containers)</td>
                  <td>55–56</td>
                </tr>
                <tr>
                  <td>Safe releases</td>
                  <td>CI/CD, canary, feature flags</td>
                  <td>58</td>
                </tr>
              </tbody>
            </table>
          </div>
          <hr />
          <h3 id="mapping-non-functional-requirements-to-architecture">
            Mapping non-functional requirements to architecture
          </h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Requirement</th>
                  <th>Architectural answers</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Scalability</strong>
                  </td>
                  <td>Stateless services, horizontal scaling, caching, replicas, sharding, queues, CDN, autoscaling</td>
                </tr>
                <tr>
                  <td>
                    <strong>Availability</strong>
                  </td>
                  <td>
                    No SPOFs, multi-AZ, health checks, failover, graceful degradation, load shedding, multi-region
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Low latency</strong>
                  </td>
                  <td>CDN, caching, nearby regions, connection reuse, async work, good indexes, avoiding N+1</td>
                </tr>
                <tr>
                  <td>
                    <strong>Durability</strong>
                  </td>
                  <td>Replication, WAL, object storage, backups + PITR, off-site copies</td>
                </tr>
                <tr>
                  <td>
                    <strong>Consistency</strong>
                  </td>
                  <td>Transactions, leader reads for critical data, unique constraints, idempotency, sagas</td>
                </tr>
                <tr>
                  <td>
                    <strong>Security</strong>
                  </td>
                  <td>
                    TLS/mTLS, strong auth, per-object authorisation, encryption, secrets management, WAF, patching
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Observability</strong>
                  </td>
                  <td>Structured logs, metrics, traces, SLOs, alerting, dashboards</td>
                </tr>
                <tr>
                  <td>
                    <strong>Maintainability</strong>
                  </td>
                  <td>Clear boundaries (modular monolith / services), APIs as contracts, IaC, CI/CD, ADRs</td>
                </tr>
                <tr>
                  <td>
                    <strong>Cost efficiency</strong>
                  </td>
                  <td>Right-sizing, autoscaling, caching, storage tiers, spot instances, fewer moving parts</td>
                </tr>
              </tbody>
            </table>
          </div>
          <hr />
          <h3 id="common-anti-patterns-in-the-big-picture">Common anti-patterns in the big picture</h3>
          <ul>
            <li>
              ❌ <strong>Everything synchronous:</strong> one slow dependency makes every page slow.
            </li>
            <li>
              ❌ <strong>A shared database between many services:</strong> a "distributed monolith" (post 53).
            </li>
            <li>
              ❌ <strong>No timeouts:</strong> a cascading failure waiting to happen (post 41).
            </li>
            <li>
              ❌ <strong>A cache without a plan for failure:</strong> the database dies when the cache does (post 16).
            </li>
            <li>
              ❌ <strong>A single region, single AZ, single DNS provider, single certificate process:</strong> hidden
              SPOFs (post 40).
            </li>
            <li>
              ❌ <strong>Replication instead of backups:</strong> mistakes copied everywhere (post 45).
            </li>
            <li>
              ❌ <strong>Secrets in code, trusting the client, unpatched dependencies</strong> (posts 51–52).
            </li>
            <li>
              ❌ <strong>Big-bang deploys</strong> without canaries or rollback (post 58).
            </li>
            <li>
              ❌ <strong>Adding every box on day one:</strong> complexity without need (post 6).
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>More layers</strong> give more scale, safety and flexibility, but also{" "}
              <strong>more latency, cost and operational work</strong>. Every box needs owning, monitoring, securing and
              paying for.
            </li>
            <li>
              <strong>Microservices + Kafka + Kubernetes</strong> give team autonomy and independent scaling, at a high{" "}
              <strong>complexity</strong> cost. Only worth it with the team size and platform maturity to match.
            </li>
            <li>
              <strong>Multi-region</strong> survives region failures and serves global users fast, but makes{" "}
              <strong>data consistency</strong> and costs much harder.
            </li>
            <li>
              <strong>Managed cloud services</strong> reduce operations but add <strong>cost and lock-in</strong>.
              Self-hosting gives control, but you do the work.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <ul>
            <li>
              <strong>Netflix</strong> follows much of this map: clients → edge (its own Open Connect CDN) → API gateway
              → hundreds of microservices on AWS → caches and Cassandra → Kafka-based data pipelines, with chaos
              engineering and deep observability.
            </li>
            <li>
              <strong>Instagram and Shopify</strong> show the <strong>simpler path</strong>: large-scale products built
              on relational databases, caching, queues and careful sharding, with a (modular) monolith at the core for a
              long time.
            </li>
            <li>
              <strong>Discord and WhatsApp</strong> emphasise the <strong>real-time path</strong>: WebSocket gateways,
              efficient runtimes (Elixir or Erlang) and write-optimised message storage.
            </li>
            <li>
              <strong>Stripe</strong> emphasises <strong>correctness and API design</strong>: idempotency, careful
              versioning, rate limiting and load shedding.
            </li>
            <li>
              <strong>Amazon</strong> popularised <strong>service ownership</strong>, cell-based isolation, static
              stability and safe, automated deployments, much of it shared in the AWS Builders' Library.
            </li>
          </ul>
          <p>
            Each company uses the same building blocks, arranged around <strong>its own requirements</strong>.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>Walk me through a production-grade web architecture.</>,
                a: (
                  <>
                    <p>
                      Clients hit DNS and a CDN/WAF at the edge, then load balancers and an API gateway for auth, rate
                      limits and routing. Stateless services run across availability zones and read from a cache before
                      the database (primary, replicas, shards). Files live in object storage, search indexes and
                      analytics are fed by CDC and events, and slow work goes through queues to workers — all observed,
                      secured and deployed through CI/CD.
                    </p>
                  </>
                ),
              },
              {
                q: <>Which parts of that architecture are stateful, and how is each made highly available?</>,
                a: (
                  <>
                    <p>
                      Databases (replication across AZs with automatic failover, plus backups and PITR), caches
                      (replicas or clusters, and an app that survives cache loss), queues and Kafka (replicated
                      partitions), object storage (replicated by the provider), and WebSocket gateways (reconnect with
                      jitter plus sync from storage). Everything else is stateless and simply scaled out.
                    </p>
                  </>
                ),
              },
              {
                q: <>How does the architecture evolve from one user to millions?</>,
                a: (
                  <>
                    <p>
                      One server and database → separate the database and add a CDN → load-balanced stateless app
                      servers → cache and read replicas → queues and workers → search and analytics fed by CDC →
                      sharding the hottest tables → multiple regions. Each step is triggered by a measured bottleneck.
                    </p>
                  </>
                ),
              },
              {
                q: <>Where does the outbox pattern sit, and why?</>,
                a: (
                  <>
                    <p>
                      Inside the service that owns the data: the state change and the event are written in one local
                      transaction, then a relay or CDC publishes to Kafka. It removes the dual-write gap between the
                      database and the event stream.
                    </p>
                  </>
                ),
              },
              {
                q: <>What belongs in the cross-cutting layer?</>,
                a: (
                  <>
                    <p>
                      Observability (logs, metrics, traces, SLOs, alerts), security (identity, authorisation, TLS/mTLS,
                      KMS, secrets, WAF, scanning), delivery (CI/CD, canaries, feature flags), platform (regions, IaC,
                      Kubernetes, autoscaling, cost) and resilience (multi-AZ, backups, DR drills, chaos tests,
                      postmortems).
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
              A complete system has <strong>12 layers</strong>:
              <ul>
                <li>clients,</li>
                <li>edge (DNS, CDN, WAF),</li>
                <li>entry (load balancers, gateway, WebSocket gateways),</li>
                <li>application services,</li>
                <li>cache, databases, object storage, search,</li>
                <li>async processing, data and analytics, external services,</li>
                <li>
                  and cross-cutting <strong>observability, security, delivery, platform and resilience</strong>.
                </li>
              </ul>
            </li>
            <li>
              <strong>Save essential state synchronously</strong> (with transactions and idempotency) and{" "}
              <strong>do the rest asynchronously</strong> (with the outbox, queues or Kafka, and idempotent workers).
            </li>
            <li>
              <strong>Scale in stages:</strong> separate the DB → load balancer + stateless servers → cache + CDN →
              replicas + async → split and shard → multi-region, <strong>driven by measurements</strong>.
            </li>
            <li>
              Use the <strong>decision cheat sheet</strong> and <strong>NFR mapping</strong> to choose components for a
              reason, and avoid the <strong>anti-patterns</strong>.
            </li>
            <li>
              Every real company uses <strong>the same building blocks, in different combinations</strong>. Your job as
              a designer is to choose the right combination <strong>for your requirements</strong>.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              <em>Designing Data-Intensive Applications</em> by Martin Kleppmann
            </li>
            <li>
              <em>System Design Interview</em> Volumes 1 and 2 by Alex Xu (and Sahn Lam)
            </li>
            <li>The System Design Primer on GitHub (its overview diagram and "real world architectures" section)</li>
            <li>
              The AWS Well-Architected Framework, the Google Cloud Architecture Framework and the Azure Architecture
              Center
            </li>
            <li>The AWS Builders' Library</li>
            <li>
              The companion posts in this series: <em>"System Design Series: The Conclusion"</em> and{" "}
              <em>"System Design Glossary: Every Short Form Explained"</em>
            </li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
