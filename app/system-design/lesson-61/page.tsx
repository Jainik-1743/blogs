import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { QA, Stats } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import RateLimiter from "@/components/sd/widgets/RateLimiter";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-61")!;

export const metadata: Metadata = {
  title: `Lesson 61 — ${lesson.title}`,
  description: lesson.summary,
};

/** In-page index. Each entry links to a section heading below. */
const outline = [
  { id: "the-problem", label: "The Problem" },
  { id: "the-core-idea", label: "The Core Idea" },
  { id: "how-it-works", label: "How It Works" },
  { id: "trade-offs", label: "Trade-offs" },
  { id: "in-the-real-world", label: "In the Real World" },
  { id: "interview-questions", label: "Interview Questions" },
  { id: "key-takeaways", label: "Key Takeaways" },
  { id: "further-reading", label: "Further Reading" },
];

const code1 = `check(keys: [ {rule_id, key} ], cost = 1) →
   { allowed: bool, limit, remaining, reset_seconds, retry_after_seconds }`;

const code2 = `rules:
  - id: plan-free
    match: { plan: free }
    key: api_key
    algorithm: token_bucket
    capacity: 100          # burst
    refill_per_second: 1.67  # ≈100/min
  - id: plan-pro
    match: { plan: pro }
    key: api_key
    algorithm: token_bucket
    capacity: 2000
    refill_per_second: 33.3
  - id: login-per-ip
    match: { route: "POST /login" }
    key: client_ip
    algorithm: sliding_window_counter
    limit: 10
    window_seconds: 60
    fail_mode: closed      # security-sensitive: block if limiter is down
  - id: sms-global
    match: { route: "POST /otp/send" }
    key: global
    algorithm: token_bucket
    capacity: 500
    refill_per_second: 200  # protect the SMS provider`;

const code3 = `HTTP/1.1 429 Too Many Requests
Retry-After: 18
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 18`;

const code4 = `rl:{<key>}:<rule_id>          e.g.  rl:{ak_9f2c}:plan-pro
TTL ≈ time for the bucket to refill fully (or window × 2) → idle keys expire on their own`;

export default function SdLessonSixOnePage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            Your company runs a public API used by <strong>50,000 developer accounts</strong>. You need to:
          </p>
          <ul>
            <li>stop one buggy script from overwhelming everything,</li>
            <li>block bots from brute-forcing the login and OTP endpoints,</li>
            <li>enforce plan limits ("Free: 100 requests per minute; Pro: 2,000"),</li>
            <li>protect fragile downstream systems (like the SMS provider),</li>
            <li>
              and do all of it for <strong>100,000 requests per second</strong> across{" "}
              <strong>dozens of servers in several regions</strong>, adding <strong>almost no latency</strong>.
            </li>
          </ul>
          <p>
            In post 43 we learned the <strong>algorithms</strong> (token bucket, sliding windows and so on). This post
            designs the <strong>whole distributed system</strong>: where it runs, how rules are managed, how counters
            are shared, how it fails, and how it's monitored.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about <strong>security at a large stadium</strong> with many entry gates.
          </p>
          <ul>
            <li>
              Each ticket holder may enter <strong>once</strong>, and each group booking may bring{" "}
              <strong>up to 10 people per 15 minutes</strong>.
            </li>
            <li>
              There are <strong>20 gates</strong>. If each gate kept its <strong>own</strong> count, a group could send
              10 people through <strong>each</strong> gate, 200 in total.
            </li>
            <li>
              So all gates check a <strong>shared, live counter</strong> ("how many from booking #42 have entered?"),
              quickly, without making the queue slow.
            </li>
            <li>
              If the central system fails, security must decide: <strong>let people in</strong> (fail open) or{" "}
              <strong>stop everyone</strong> (fail closed)?
            </li>
          </ul>
          <p>
            A distributed rate limiter is exactly this: <strong>fast, shared counting</strong>, with{" "}
            <strong>clear rules</strong> and a <strong>plan for failure</strong>.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="step-1-requirements">Step 1: Requirements</h3>
          <p>
            <strong>Functional:</strong>
          </p>
          <ol>
            <li>
              Limit requests per <strong>key</strong>: API key, user ID, IP address, or combinations (such as user +
              endpoint).
            </li>
            <li>
              Support <strong>multiple rules</strong> with different limits and windows: per plan, per endpoint, per
              region, and global.
            </li>
            <li>
              When a request is over the limit, return <strong>HTTP 429</strong> with{" "}
              <strong>
                <code>Retry-After</code>
              </strong>{" "}
              and rate-limit headers.
            </li>
            <li>
              Allow <strong>rule changes without redeploying</strong> services.
            </li>
            <li>
              Optional: <strong>soft limits</strong> (warn or log only) and <strong>per-customer overrides</strong>.
            </li>
          </ol>
          <p>
            <strong>Non-functional:</strong>
          </p>
          <ul>
            <li>
              <strong>Low latency:</strong> add <strong>&lt; 1–2 ms</strong> per request (p99).
            </li>
            <li>
              <strong>High throughput:</strong> 100k+ checks per second, growing.
            </li>
            <li>
              <strong>Highly available:</strong> the limiter must{" "}
              <strong>never become the reason the API is down</strong>.
            </li>
            <li>
              <strong>Accurate enough:</strong> small over-allowance (a few percent) is acceptable. Big errors aren't.
            </li>
            <li>
              <strong>Distributed:</strong> consistent limits across many API servers (and reasonable behaviour across
              regions).
            </li>
            <li>
              <strong>Observable:</strong> see who is being limited, and why.
            </li>
          </ul>
          <h3 id="step-2-estimation">Step 2: Estimation</h3>
          <p>Assumptions:</p>
          <ul>
            <li>
              <strong>Peak 100,000 API requests per second</strong>, across all servers.
            </li>
            <li>
              <strong>About 10 million distinct keys</strong> active per day (API keys, users and IPs).
            </li>
            <li>
              On average, each request is checked against <strong>2 rules</strong> (for example, per-key plan limit +
              per-endpoint limit).
            </li>
          </ul>
          <Stats
            caption="Sizing the limiter."
            stats={[
              { value: <>200 K / s</>, label: <>checks</>, sub: <>100 K requests × 2 rules each</> },
              { value: <>~100 B</>, label: <>per key per rule</>, sub: <>two numbers + the key name</> },
              {
                value: <>~2 GB</>,
                label: <>of counters</>,
                sub: <>10 M keys × 2 rules — a few GB with Redis overhead</>,
              },
              {
                value: <>&lt; 1 ms</>,
                label: <>budget per check</>,
                sub: <>it sits on every request's critical path</>,
              },
            ]}
          />
          <p>
            <strong>So this means:</strong>
          </p>
          <ul>
            <li>
              <strong>Memory is small.</strong> Everything fits in an in-memory store like Redis.
            </li>
            <li>
              <strong>Throughput is significant.</strong> 200k operations per second needs a{" "}
              <strong>Redis cluster</strong> with several shards, since a single Redis node handles very roughly 100k
              simple operations per second.
            </li>
            <li>
              <strong>The latency budget is tight</strong>, so we should <strong>minimise network round trips</strong>{" "}
              (one atomic call per check, or batched checks).
            </li>
          </ul>
          <h3 id="step-3-api-and-rule-model">Step 3: API and rule model</h3>
          <p>
            <strong>The limiter's internal interface:</strong>
          </p>
          <CodeBlock lang="http" code={code1} />
          <p>
            <strong>Rules as configuration</strong> (stored centrally, cached locally):
          </p>
          <CodeBlock lang="yaml" code={code2} />
          <p>
            <strong>Responses to clients</strong> (post 43):
          </p>
          <CodeBlock lang="http" code={code3} />
          <p>
            Successful responses should include the <code>RateLimit-*</code> headers too, so clients can slow down{" "}
            <strong>before</strong> being blocked.
          </p>
          <h3 id="step-4-high-level-design">Step 4: High-level design</h3>
          <p>
            <strong>Where should it run?</strong>
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Placement</th>
                  <th>Pros</th>
                  <th>Cons</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Client-side</strong>
                  </td>
                  <td>Reduces useless traffic</td>
                  <td>Can't be trusted (clients can ignore it)</td>
                </tr>
                <tr>
                  <td>
                    <strong>In each service (library/middleware)</strong>
                  </td>
                  <td>Business-aware (knows plans, endpoints)</td>
                  <td>Duplicated across services and languages</td>
                </tr>
                <tr>
                  <td>
                    <strong>API gateway / edge (recommended primary)</strong>
                  </td>
                  <td>One place, stops traffic early, language-independent</td>
                  <td>Less business context (unless passed in)</td>
                </tr>
                <tr>
                  <td>
                    <strong>Dedicated rate-limit service</strong>
                  </td>
                  <td>Central logic, reusable by gateways and services</td>
                  <td>Extra network hop</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            A common design: <strong>the API gateway enforces most limits</strong>, calling a{" "}
            <strong>shared counter store</strong>, while services add <strong>business-specific limits</strong> ("max 5
            OTPs per phone number per hour") where needed.
          </p>
          <SequenceDiagram
            caption="One request through the rate-limit middleware. Blocked requests never reach a backend."
            actors={["Client", "Gateway", "Redis Cluster", "Backend"]}
            messages={[
              { from: 0, to: 1, label: <>GET /v1/orders (api key ak_9f2c)</> },
              { from: 1, to: 1, label: <>match rules from local cache → plan-pro, per-route</> },
              {
                from: 1,
                to: 2,
                label: <>EVALSHA token_bucket rl:&#123;ak_9f2c&#125;:plan-pro</>,
                note: <>one atomic, pipelined call</>,
              },
              { from: 2, to: 1, label: <>allowed · remaining 1,412</>, reply: true },
              { from: 1, to: 3, label: <>forward request</> },
              { from: 3, to: 0, label: <>200 OK + RateLimit headers</>, reply: true },
              {
                from: 0,
                to: 0,
                label: <>If Redis says no → 429 + Retry-After straight from the gateway</>,
                divider: true,
              },
            ]}
          />
          <RateLimiter caption="The algorithms the rules choose between — try each one." />
          <h3 id="step-5-deep-dives">Step 5: Deep dives</h3>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 1: Choosing the algorithm per rule</h4>
          <p>(See post 43 for how each algorithm works.)</p>
          <ul>
            <li>
              <strong>Token bucket</strong> for <strong>plan limits</strong>: it allows natural bursts, and the burst
              and rate are easy to explain to customers.
            </li>
            <li>
              <strong>Sliding window counter</strong> for <strong>abuse limits</strong> like login attempts: smooth and
              cheap, with no boundary double-bursts.
            </li>
            <li>
              <strong>Leaky bucket / global token bucket</strong> for <strong>protecting downstream systems</strong>{" "}
              (SMS, payment providers) at a steady rate.
            </li>
            <li>
              <strong>Concurrency limits</strong> (in-flight requests per key) for <strong>expensive endpoints</strong>{" "}
              like exports and reports. These limit <strong>how many at once</strong>, not per minute.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 2: Atomic counting in Redis</h4>
          <p>
            The classic race: two gateway nodes read "99 of 100", and both allow the request, making{" "}
            <strong>101</strong>. Fix it with <strong>atomic operations</strong>:
          </p>
          <ul>
            <li>
              <strong>Fixed window:</strong> <code>INCR</code> + <code>EXPIRE</code> (INCR is atomic).
            </li>
            <li>
              <strong>Token bucket or sliding window:</strong> a small <strong>Lua script</strong> that reads, updates
              and returns the decision <strong>in one atomic step</strong> (post 43 has an example). Redis runs scripts
              one at a time, so there are no races.
            </li>
          </ul>
          <p>
            <strong>Minimise round trips:</strong>
          </p>
          <ul>
            <li>
              <strong>Check multiple rules in one script call</strong>, or pipeline them.
            </li>
            <li>
              <strong>Keep keys for the same user on the same Redis shard</strong> using <strong>hash tags</strong> (for
              example <code>rl:&#123;api_key_123&#125;:plan</code> and <code>rl:&#123;api_key_123&#125;:route</code>),
              so a single script can update them together in Redis Cluster.
            </li>
          </ul>
          <p>
            <strong>Key design and expiry:</strong>
          </p>
          <CodeBlock lang="http" code={code4} />
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">
            Deep dive 3: Performance, local caching and batching
          </h4>
          <p>
            A Redis call per request adds a network round trip (typically well under 1 ms in the same zone).
            Optimisations:
          </p>
          <ul>
            <li>
              <strong>Local rule cache:</strong> rules rarely change, so each gateway keeps them in memory and refreshes
              every few seconds (or on a push notification).
            </li>
            <li>
              <strong>Local "definitely blocked" cache:</strong> once a key is over its limit, remember "blocked until
              time T" <strong>locally</strong>, and reject further requests <strong>without calling Redis</strong>. This
              helps enormously during attacks.
            </li>
            <li>
              <strong>Local pre-allocation (token leasing):</strong> for very high-volume keys, a gateway can{" "}
              <strong>reserve a batch of tokens</strong> (say 50) from Redis and spend them locally, syncing again when
              they run out. There are fewer Redis calls, at the cost of slight inaccuracy.
            </li>
            <li>
              <strong>Approximate local limiting</strong> for extreme scale: each of N gateways enforces roughly{" "}
              <code>limit / N</code> locally, with periodic sync. It's very fast, but less accurate when traffic is
              uneven across gateways.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 4: Failure handling</h4>
          <p>
            What happens if Redis is <strong>slow or down</strong>?
          </p>
          <ul>
            <li>
              <strong>Timeout fast</strong> (for example, 5–20 ms) so the limiter never adds big latency (post 41).
            </li>
            <li>
              <strong>Circuit breaker</strong> around Redis (post 42): if it's failing, <strong>skip the calls</strong>{" "}
              for a while.
            </li>
            <li>
              <strong>Fail open or fail closed, per rule:</strong>
              <ul>
                <li>
                  <strong>Fail open</strong> (allow traffic) for general API plan limits. Availability matters more, and
                  it's usually the right default.
                </li>
                <li>
                  <strong>Fail closed</strong> (block) for <strong>security-critical</strong> rules like login, OTP and
                  password reset, where letting attackers through is worse. Or{" "}
                  <strong>fall back to local, per-node limits</strong>, which still give rough protection.
                </li>
              </ul>
            </li>
            <li>
              <strong>Redis high availability:</strong> replicas plus automatic failover (Redis Cluster, Sentinel or a
              managed service). Losing some counter state during failover is acceptable, because limits just reset
              briefly.
            </li>
          </ul>
          <p>
            <strong>The limiter must never take the API down.</strong> Load-test it, and practise its failure modes
            (post 40).
          </p>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 5: Multiple regions</h4>
          <p>
            If the API runs in <strong>India, Europe and the US</strong>, where do counters live?
          </p>
          <ul>
            <li>
              <strong>Per-region counters (the common choice):</strong> each region enforces limits with its own Redis.
              It's fast and simple. A client using several regions at once could get up to about N × the limit. Mitigate
              by giving each region a <strong>share</strong> of the limit, or by routing each customer to a{" "}
              <strong>home region</strong>.
            </li>
            <li>
              <strong>Global counters</strong> in one region: accurate, but adds cross-region latency (100+ ms) to every
              request, which is usually unacceptable.
            </li>
            <li>
              <strong>Async sync between regions</strong> (like CRDT-style counters, post 28): regions share usage every
              few seconds. It's eventually accurate, and a good middle ground for strict enterprise quotas.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 6: Rules management</h4>
          <ul>
            <li>
              <strong>Store rules</strong> in a database or a Git repository (reviewed like code), with a small admin UI
              for support teams.
            </li>
            <li>
              <strong>Distribute</strong> by gateways <strong>polling</strong> every few seconds, or by{" "}
              <strong>pushing</strong> updates (for example, via a pub/sub channel).
            </li>
            <li>
              <strong>Validate</strong> rules before applying them, and support <strong>dry-run / shadow mode</strong>:
              log "would have blocked" without blocking, to test a new rule safely.
            </li>
            <li>
              Support <strong>per-customer overrides</strong> ("customer X gets 10× for their launch day"), with expiry.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 7: Monitoring</h4>
          <p>Track:</p>
          <ul>
            <li>
              <strong>checks per second</strong> and limiter <strong>latency</strong> (p50/p99),
            </li>
            <li>
              <strong>blocked requests</strong> by rule, key, plan and endpoint (<strong>top offenders</strong>),
            </li>
            <li>
              <strong>Redis health</strong> (latency, memory, errors), plus{" "}
              <strong>fail-open / fail-closed events</strong>,
            </li>
            <li>
              <strong>customer impact:</strong> are paying customers being limited unexpectedly? That's a signal to
              adjust plans or rules.
            </li>
          </ul>
          <p>Alert on sudden spikes in blocked requests (an attack, or a bad rule) and on limiter errors.</p>
          <h3 id="wrap-up">Wrap-up</h3>
          <ul>
            <li>
              <strong>Key decisions:</strong> enforce at the <strong>API gateway</strong> with{" "}
              <strong>Redis Cluster</strong> counters; <strong>atomic Lua scripts</strong>;{" "}
              <strong>token bucket</strong> for plans, <strong>sliding window</strong> for abuse,{" "}
              <strong>global buckets</strong> for fragile downstreams; <strong>rules as cached config</strong>;{" "}
              <strong>429 + headers</strong>.
            </li>
            <li>
              <strong>Trade-offs:</strong> per-region counters (fast, slightly generous) vs global accuracy; fail open
              for availability vs fail closed for security; local optimisations for speed vs exactness.
            </li>
            <li>
              <strong>Next steps:</strong> adaptive limits based on backend health (link to load shedding, post 44),
              per-customer usage dashboards, and billing integration.
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Decision</th>
                  <th>Option A</th>
                  <th>Option B</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Placement</td>
                  <td>Gateway (central, early)</td>
                  <td>In-service (business-aware) — often both</td>
                </tr>
                <tr>
                  <td>Counter store</td>
                  <td>Central Redis (accurate)</td>
                  <td>Local per-node (fast, approximate)</td>
                </tr>
                <tr>
                  <td>Failure mode</td>
                  <td>Fail open (availability)</td>
                  <td>Fail closed (security) — choose per rule</td>
                </tr>
                <tr>
                  <td>Multi-region</td>
                  <td>Per-region counters (fast)</td>
                  <td>Global/synced counters (accurate, slower/complex)</td>
                </tr>
                <tr>
                  <td>Algorithm</td>
                  <td>Token bucket (bursts OK)</td>
                  <td>Sliding window (smooth) / leaky bucket (steady output)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Stripe</strong> described running <strong>several kinds of limiters</strong>: a request-rate limiter
            using token buckets in Redis, a concurrent-requests limiter, and two load shedders that protect critical
            traffic when the fleet is under strain. It's a real-world example of rate limiting and load shedding working
            together.
          </p>
          <p>
            <strong>Cloudflare</strong> rate-limits traffic for millions of websites across its global network. It has
            described using a <strong>sliding-window approximation</strong> with minimal memory per key, and making
            decisions at the edge close to users.
          </p>
          <p>
            <strong>Envoy's global rate-limit service.</strong> Lyft open-sourced a <strong>rate-limit service</strong>{" "}
            (written in Go, backed by Redis) that Envoy proxies call to decide whether to allow requests. It's a
            ready-made version of the "dedicated rate-limit service" design above, used by many companies.
          </p>
          <p>
            <strong>GitHub's API limits.</strong> GitHub publishes <strong>primary</strong> rate limits (a number of
            requests per hour per user or app) and <strong>secondary</strong> limits (for example, on concurrent
            requests and rapid content creation) to protect against abuse, and returns rate-limit headers on every
            response.
          </p>
          <p>
            <strong>Figma</strong> wrote about designing its own rate limiter, comparing the memory and accuracy
            trade-offs of different algorithms, and settling on a Redis-backed sliding-window approach. It's a good
            small-company example of choosing an algorithm based on real constraints.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>Where would you put the rate limiter?</>,
                a: (
                  <>
                    <p>
                      As middleware in the API gateway or edge, so rejected traffic never reaches backends, with a
                      shared counter store (Redis Cluster) behind it. Business-specific limits — OTPs per phone number —
                      can live inside the owning service using the same library.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you keep counters correct with many gateway nodes?</>,
                a: (
                  <>
                    <p>
                      Do the read-compute-write atomically in Redis with a Lua script (or INCR for simple windows),
                      sharded by key with hash tags so all of one key's data sits on one shard, and pipeline multiple
                      rule checks in one round trip.
                    </p>
                  </>
                ),
              },
              {
                q: <>What happens if Redis is unavailable?</>,
                a: (
                  <>
                    <p>
                      Decide per rule: fail open for general API limits (availability first, perhaps with a local
                      in-memory fallback limiter), fail closed for security-sensitive rules like login and OTP. Alert
                      either way.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you handle a single extremely hot key?</>,
                a: (
                  <>
                    <p>
                      Combine a small local token bucket on each gateway node with periodic sync to the global counter,
                      so most checks never cross the network, or give that key a dedicated shard. Accept slight
                      over-allowance in exchange.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do rules change without redeploying?</>,
                a: (
                  <>
                    <p>
                      Store them in a database or config repository, push or poll them to gateways and cache them
                      locally, version them, and roll changes out gradually — a bad rule can block every customer at
                      once.
                    </p>
                  </>
                ),
              },
              {
                q: <>How would you do this across regions?</>,
                a: (
                  <>
                    <p>
                      Usually per-region counters with a share of the global limit each, which is fast and tolerant of
                      cross-region partitions, or asynchronous sync of counts between regions, accepting brief
                      over-allowance. Strongly consistent global counters would add cross-region latency to every
                      request.
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
              A distributed rate limiter needs <strong>fast shared counting</strong>, <strong>clear rules</strong>,{" "}
              <strong>good client communication</strong> (429 + headers) and a <strong>safe failure plan</strong>.
            </li>
            <li>
              <strong>Estimate:</strong> 100k req/s × 2 rules ≈ 200k checks/s, but only a few GB of memory, so a{" "}
              <strong>Redis Cluster</strong> fits well.
            </li>
            <li>
              Enforce at the <strong>API gateway</strong> (plus business rules in services), with{" "}
              <strong>atomic Lua scripts</strong>, <strong>hash-tagged keys</strong>, <strong>TTLs</strong>, and{" "}
              <strong>local caches</strong> for rules and blocked keys.
            </li>
            <li>
              <strong>Fail open</strong> for general limits and <strong>fail closed (or fall back locally)</strong> for
              security-critical ones. The limiter must <strong>never be the outage</strong>.
            </li>
            <li>
              For multiple regions, use <strong>per-region counters with shared quotas</strong> or async sync. Manage{" "}
              <strong>rules as reviewed config</strong> with a <strong>dry-run mode</strong>, and{" "}
              <strong>monitor</strong> blocks, latency and offenders.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              <em>System Design Interview</em> by Alex Xu (chapter 4, "Design A Rate Limiter")
            </li>
            <li>Stripe's blog post "Scaling your API with rate limiters"</li>
            <li>Cloudflare's blog post "Counting things, a lot of different things"</li>
            <li>The Envoy proxy rate-limit service project on GitHub</li>
            <li>Figma's blog post "An alternative approach to rate limiting"</li>
            <li>The Redis documentation on scripting with Lua</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
