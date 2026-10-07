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
    capacity: 100          # the biggest burst allowed
    refill_per_second: 1.67  # about 100 per minute
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
    fail_mode: closed      # security-sensitive: block requests if the limiter is down
  - id: sms-global
    match: { route: "POST /otp/send" }
    key: global
    algorithm: token_bucket
    capacity: 500
    refill_per_second: 200  # protects the SMS provider`;

const code3 = `HTTP/1.1 429 Too Many Requests
Retry-After: 18
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 18`;

const code4 = `rl:{<key>}:<rule_id>          e.g.  rl:{ak_9f2c}:plan-pro
TTL ≈ time for the bucket to refill fully (or window × 2) → keys that nobody uses expire on their own`;

export default function SdLessonSixOnePage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            Your company runs a public API (a web service that other developers' programs call) used by <strong>50,000 developer accounts</strong>. You need to:
          </p>
          <ul>
            <li>stop one buggy script from overloading everything,</li>
            <li>stop bots from trying thousands of passwords or codes (brute force) on the login and OTP endpoints. An OTP is a one-time password, like an SMS code.</li>
            <li>enforce plan limits ("Free: 100 requests per minute; Pro: 2,000"),</li>
            <li>protect weak systems that your API calls (called downstream systems), like the SMS provider,</li>
            <li>
              and do all of it for <strong>100,000 requests per second</strong> across{" "}
              <strong>dozens of servers in several regions</strong>, while adding <strong>almost no delay (latency)</strong>.
            </li>
          </ul>
          <p>
            A <strong>rate limiter</strong> is a part that limits how many requests one caller can make in a period of time. In post 43 we learned the <strong>algorithms</strong> (token bucket, sliding windows and so on). This post
            designs the <strong>whole distributed system</strong> (a system that runs on many machines). We look at where it runs, how rules are managed, how counters
            are shared, how it fails, and how it is monitored.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about <strong>security at a large stadium</strong> with many entry gates.
          </p>
          <ul>
            <li>
              Each ticket holder may enter <strong>once</strong>, and each group booking may bring in{" "}
              <strong>up to 10 people per 15 minutes</strong>.
            </li>
            <li>
              There are <strong>20 gates</strong>. If each gate kept its <strong>own</strong> count, a group could send
              10 people through <strong>each</strong> gate. That makes 200 in total.
            </li>
            <li>
              So all gates check one <strong>shared, live counter</strong> ("how many from booking #42 have entered?").
              The check is quick, so the queue does not get slow.
            </li>
            <li>
              If the central system fails, security must decide: <strong>let people in</strong> (this is called "fail open") or{" "}
              <strong>stop everyone</strong> ("fail closed")?
            </li>
          </ul>
          <p>
            A distributed rate limiter is exactly this. It has <strong>fast, shared counting</strong>,{" "}
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
              Limit requests per <strong>key</strong>. A key is whatever identifies the caller: an API key, a user ID, an IP address, or a combination (such as user +
              endpoint, where an endpoint is one URL path of the API).
            </li>
            <li>
              Support <strong>many rules</strong> with different limits and time windows: per plan, per endpoint, per
              region, and global.
            </li>
            <li>
              When a request is over the limit, return <strong>HTTP 429</strong> (the status code for "Too Many Requests") with{" "}
              <strong>
                <code>Retry-After</code>
              </strong>{" "}
              and rate-limit headers.
            </li>
            <li>
              Allow <strong>rule changes without redeploying</strong> (releasing new code for) the services.
            </li>
            <li>
              Optional: <strong>soft limits</strong> (only warn or write a log, do not block) and <strong>per-customer overrides</strong> (special limits for one customer).
            </li>
          </ol>
          <p>
            <strong>Non-functional:</strong>
          </p>
          <ul>
            <li>
              <strong>Low latency:</strong> add <strong>less than 1–2 ms</strong> per request (p99, which means 99 out of 100 requests).
            </li>
            <li>
              <strong>High throughput:</strong> more than 100,000 checks per second, and growing.
            </li>
            <li>
              <strong>Highly available:</strong> the limiter must{" "}
              <strong>never become the reason the API is down</strong>.
            </li>
            <li>
              <strong>Accurate enough:</strong> a small over-allowance (letting a few percent too many through) is acceptable. Big errors are not.
            </li>
            <li>
              <strong>Distributed:</strong> the same limit must apply across many API servers (and work reasonably across
              regions).
            </li>
            <li>
              <strong>Observable:</strong> you can see who is being limited, and why.
            </li>
          </ul>
          <h3 id="step-2-estimation">Step 2: Estimation</h3>
          <p>Assumptions:</p>
          <ul>
            <li>
              <strong>Peak of 100,000 API requests per second</strong> (the busiest time), across all servers.
            </li>
            <li>
              <strong>About 10 million different keys</strong> active per day (API keys, users and IPs).
            </li>
            <li>
              On average, each request is checked against <strong>2 rules</strong> (for example, the plan limit for the key + a
              limit for the endpoint).
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
                sub: <>10 M keys × 2 rules; a few GB with Redis overhead</>,
              },
              {
                value: <>&lt; 1 ms</>,
                label: <>budget per check</>,
                sub: <>it is on the path of every request</>,
              },
            ]}
          />
          <p>
            <strong>So this means:</strong>
          </p>
          <ul>
            <li>
              <strong>Memory is small.</strong> Everything fits in an in-memory store (a database that keeps data in RAM, so it is very fast), such as Redis. Redis is an open-source in-memory data store that keeps keys and values in memory and answers in well under a millisecond.
            </li>
            <li>
              <strong>Throughput is high.</strong> 200,000 operations per second needs a{" "}
              <strong>Redis cluster</strong> with several shards. A shard is one part of the data, kept on its own node (machine), so the work is shared. One Redis node handles only very roughly 100,000
              simple operations per second.
            </li>
            <li>
              <strong>The latency budget is tight</strong>, so we should <strong>use as few network round trips as possible</strong>{" "}
              (one atomic call per check, or checks sent together in a batch). An atomic call is one that cannot be split or interrupted.
            </li>
          </ul>
          <h3 id="step-3-api-and-rule-model">Step 3: API and rule model</h3>
          <p>
            <strong>The limiter's internal interface</strong> (how other parts of the system call it):
          </p>
          <CodeBlock lang="http" code={code1} />
          <p>
            <strong>Rules as configuration</strong> (stored in one central place, and cached, which means copied, on each gateway):
          </p>
          <CodeBlock lang="yaml" code={code2} />
          <p>
            <strong>Responses to clients</strong> (post 43):
          </p>
          <CodeBlock lang="http" code={code3} />
          <p>
            Successful responses should include the <code>RateLimit-*</code> headers too, so clients can slow down{" "}
            <strong>before</strong> they are blocked. A header is an extra named line of information sent with an HTTP message. <code>Retry-After</code> is a standard HTTP header that tells the client how many seconds to wait. The{" "}
            <code>RateLimit-*</code> names come from an IETF draft (a proposed internet standard that is not final yet) that is still changing, and many APIs use the older{" "}
            <code>X-RateLimit-*</code> names instead.
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
                  <td>Cannot be trusted (clients can ignore it)</td>
                </tr>
                <tr>
                  <td>
                    <strong>In each service (library/middleware)</strong>
                  </td>
                  <td>Knows the business rules (plans, endpoints)</td>
                  <td>Duplicated across services and languages</td>
                </tr>
                <tr>
                  <td>
                    <strong>API gateway / edge (recommended primary)</strong>
                  </td>
                  <td>One place, stops traffic early, works for any language</td>
                  <td>Knows less about the business (unless you pass it in)</td>
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
            A common design: <strong>the API gateway enforces most limits</strong>. (An API gateway is the single front door that all API requests pass through.) It calls a{" "}
            <strong>shared counter store</strong>. Services add <strong>business-specific limits</strong> ("max 5
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
                note: <>EVALSHA runs a saved Lua script inside Redis. One atomic call (pipelined: sent together with others)</>,
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
              <strong>Token bucket</strong> for <strong>plan limits</strong>. A bucket fills with tokens at a steady rate, and each request takes one. It allows short bursts, and the burst size
              and the rate are easy to explain to customers.
            </li>
            <li>
              <strong>Sliding window counter</strong> for <strong>abuse limits</strong> like login attempts. It counts requests in the last N seconds. It is smooth and
              cheap, and it avoids the problem where a caller sends a full burst at the end of one window and another at the start of the next.
            </li>
            <li>
              <strong>Leaky bucket / global token bucket</strong> (a leaky bucket is a queue that lets requests out at one fixed speed, like water dripping from a small hole) for <strong>protecting downstream systems</strong>{" "}
              (SMS and payment providers). They send requests on at a steady rate.
            </li>
            <li>
              <strong>Concurrency limits</strong> (how many requests per key are running at the same moment) for <strong>expensive endpoints</strong>{" "}
              like exports and reports. These limit <strong>how many at once</strong>, not how many per minute.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 2: Atomic counting in Redis</h4>
          <p>
            Here is the classic race condition (two things happen at the same time and clash). Two gateway nodes read "99 of 100", and both allow the request. That makes{" "}
            <strong>101</strong>. Fix it with <strong>atomic operations</strong>:
          </p>
          <ul>
            <li>
              <strong>Fixed window:</strong> <code>INCR</code> + <code>EXPIRE</code>. <code>INCR</code> is a Redis command that adds 1 to a counter in one atomic step. <code>EXPIRE</code> tells Redis to delete the key after some time.
            </li>
            <li>
              <strong>Token bucket or sliding window:</strong> a small <strong>Lua script</strong> (a short program that runs inside Redis) that reads, updates
              and returns the decision <strong>in one atomic step</strong> (post 43 has an example). Redis runs scripts
              one at a time, so there are no races.
            </li>
          </ul>
          <p>
            <strong>Use fewer round trips:</strong>
          </p>
          <ul>
            <li>
              <strong>Check several rules in one script call</strong>, or pipeline them (send many commands in one go and read all the answers together).
            </li>
            <li>
              <strong>Keep keys for the same user on the same Redis shard</strong> using <strong>hash tags</strong>. Redis only hashes the part inside the curly braces to choose the shard. For
              example, <code>rl:&#123;api_key_123&#125;:plan</code> and <code>rl:&#123;api_key_123&#125;:route</code> land on the same shard,
              so a single script can update them together in Redis Cluster.
            </li>
          </ul>
          <p>
            <strong>Key names and expiry:</strong> (TTL means time to live, the time after which Redis deletes a key.)
          </p>
          <CodeBlock lang="http" code={code4} />
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">
            Deep dive 3: Performance, local caching and batching
          </h4>
          <p>
            A Redis call for every request adds a network round trip. This is typically well under 1 ms inside the same zone.
            Ways to make it faster:
          </p>
          <ul>
            <li>
              <strong>Local rule cache:</strong> rules rarely change, so each gateway keeps them in its own memory and reloads
              them every few seconds (or when it receives a push message).
            </li>
            <li>
              <strong>Local "definitely blocked" cache:</strong> once a key is over its limit, remember "blocked until
              time T" <strong>locally</strong>, and reject more requests from it <strong>without calling Redis</strong>. This
              helps a lot during attacks.
            </li>
            <li>
              <strong>Local pre-allocation (token leasing):</strong> for keys with very many requests, a gateway can{" "}
              <strong>reserve a batch of tokens</strong> (say 50) from Redis and spend them locally. It talks to Redis again when
              they run out. There are fewer Redis calls, but the count is a little less accurate.
            </li>
            <li>
              <strong>Approximate local limiting</strong> for extreme scale: each of N gateways enforces about{" "}
              <code>limit / N</code> locally and syncs from time to time. It is very fast, but less accurate when traffic is
              not spread evenly across the gateways.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 4: Failure handling</h4>
          <p>
            What happens if Redis is <strong>slow or down</strong>?
          </p>
          <ul>
            <li>
              <strong>Use a short timeout</strong> (for example, 5–20 ms; a timeout is the longest you wait for an answer) so the limiter never adds a big delay (post 41).
            </li>
            <li>
              <strong>Circuit breaker</strong> around Redis (post 42). This is a switch that stops calls to a service that keeps failing. If Redis is failing, <strong>skip the calls</strong>{" "}
              for a while.
            </li>
            <li>
              <strong>Fail open or fail closed, per rule:</strong>
              <ul>
                <li>
                  <strong>Fail open</strong> (allow the traffic) for general API plan limits. Availability matters more, and
                  this is usually the right default.
                </li>
                <li>
                  <strong>Fail closed</strong> (block the traffic) for <strong>security-critical</strong> rules like login, OTP and
                  password reset, where letting attackers through is worse. Or{" "}
                  <strong>fall back to local limits on each node</strong>, which still give rough protection.
                </li>
              </ul>
            </li>
            <li>
              <strong>Redis high availability:</strong> replicas (copies) plus automatic failover (a spare takes over when the main node dies). Use Redis Cluster (Redis split into shards that fail over by themselves), Sentinel (a helper program that watches Redis and promotes a replica when the main node dies) or a
              managed service (a cloud company runs Redis for you). Losing some counters during a failover is acceptable, because the limits just start again
              for a short time.
            </li>
          </ul>
          <p>
            <strong>The limiter must never take the API down.</strong> Load-test it (send it a lot of test traffic), and practise what happens when it fails
            (post 40).
          </p>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 5: Multiple regions</h4>
          <p>
            If the API runs in <strong>India, Europe and the US</strong>, where do counters live?
          </p>
          <ul>
            <li>
              <strong>Per-region counters (the common choice):</strong> each region enforces limits with its own Redis.
              It is fast and simple. A client that uses several regions at once could get up to about N times the limit (N is the number of regions). Reduce this
              by giving each region a <strong>share</strong> of the limit, or by sending each customer to one{" "}
              <strong>home region</strong>.
            </li>
            <li>
              <strong>Global counters</strong> in one region: accurate, but they add delay between regions (100 ms or more) to every
              request. This is usually not acceptable.
            </li>
            <li>
              <strong>Async sync between regions</strong> (for example CRDT-style counters, special counters that can be merged without conflicts, post 28). The regions share their usage every
              few seconds. The result becomes accurate after a short time (eventually accurate). It is a good middle choice for strict enterprise quotas.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 6: Rules management</h4>
          <ul>
            <li>
              <strong>Store rules</strong> in a database or a Git repository (reviewed like code), with a small admin page
              for support teams.
            </li>
            <li>
              <strong>Send the rules out</strong> by letting gateways <strong>poll</strong> (ask for updates) every few seconds, or by{" "}
              <strong>pushing</strong> updates to them (for example, through a pub/sub channel, where subscribers get messages that a publisher sends).
            </li>
            <li>
              <strong>Validate</strong> (check) rules before you apply them. Also support <strong>dry-run / shadow mode</strong>:
              write "would have blocked" to the log without blocking, so you can test a new rule safely.
            </li>
            <li>
              Support <strong>per-customer overrides</strong> ("customer X gets 10 times the limit on their launch day"), with an end date.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 7: Monitoring</h4>
          <p>Track:</p>
          <ul>
            <li>
              <strong>checks per second</strong> and limiter <strong>latency</strong> (p50 is the typical request, p99 is the slow end),
            </li>
            <li>
              <strong>blocked requests</strong> by rule, key, plan and endpoint (<strong>top offenders</strong>),
            </li>
            <li>
              <strong>Redis health</strong> (latency, memory, errors), plus{" "}
              <strong>fail-open / fail-closed events</strong>,
            </li>
            <li>
              <strong>customer impact:</strong> are paying customers being limited when they should not be? That is a sign that you should
              change the plans or rules.
            </li>
          </ul>
          <p>Send an alert when blocked requests suddenly jump (it may be an attack, or a bad rule) and when the limiter has errors.</p>
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
              <strong>Trade-offs:</strong> per-region counters (fast, slightly too generous) or global accuracy; fail open
              for availability or fail closed for security; local shortcuts for speed or exact counts.
            </li>
            <li>
              <strong>Next steps:</strong> adaptive limits that change with the health of the backend (see load shedding, post 44),
              usage dashboards for each customer, and a link to billing.
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
            that uses token buckets in Redis, a concurrent-requests limiter, and two load shedders (they drop less important requests) that protect critical
            traffic when the servers are under strain. It is a real example of rate limiting and load shedding working
            together.
          </p>
          <p>
            <strong>Cloudflare</strong> rate-limits traffic for millions of websites across its global network. It has
            described using a <strong>sliding-window approximation</strong> that needs very little memory per key, and making
            decisions at the edge, close to users.
          </p>
          <p>
            <strong>Envoy's global rate-limit service.</strong> Lyft open-sourced a <strong>rate-limit service</strong>{" "}
            (written in Go, backed by Redis) that Envoy proxies (Envoy is a popular network proxy) call to decide whether to allow a request. It is a
            ready-made version of the "dedicated rate-limit service" design above, and many companies use it.
          </p>
          <p>
            <strong>GitHub's API limits.</strong> GitHub publishes <strong>primary</strong> rate limits (a number of
            requests per hour per user or app) and <strong>secondary</strong> limits (for example, on concurrent
            requests and rapid content creation) to protect against abuse. It also returns rate-limit headers on every
            response.
          </p>
          <p>
            <strong>Figma</strong> wrote about designing its own rate limiter. It compared how much memory and how much accuracy each algorithm gives, and chose a Redis-backed sliding-window approach. It is a good
            example of choosing an algorithm based on real constraints.
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
                      As middleware (code that runs on every request) in the API gateway or at the edge, so rejected traffic never reaches the backends. A
                      shared counter store (Redis Cluster) sits behind it. Business-specific limits, such as OTPs per phone number,
                      can live inside the service that owns them, using the same library.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you keep counters correct with many gateway nodes?</>,
                a: (
                  <>
                    <p>
                      Do the read, calculate and write steps atomically in Redis with a Lua script (or INCR for simple windows).
                      Shard by key and use hash tags, so all the data of one key sits on one shard. Pipeline several
                      rule checks into one round trip.
                    </p>
                  </>
                ),
              },
              {
                q: <>What happens if Redis is unavailable?</>,
                a: (
                  <>
                    <p>
                      Decide for each rule. Fail open for general API limits (availability comes first, maybe with a local
                      in-memory backup limiter). Fail closed for security-sensitive rules like login and OTP. Send an alert
                      in both cases.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you handle a single extremely hot key?</>,
                a: (
                  <>
                    <p>
                      Use a small local token bucket on each gateway node and sync it with the global counter from time to time,
                      so most checks never cross the network. Or give that key its own shard. In return, accept that a few
                      extra requests may get through.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do rules change without redeploying?</>,
                a: (
                  <>
                    <p>
                      Store them in a database or a config repository. Push them to the gateways or let the gateways poll,
                      and cache them locally. Keep versions of the rules, and roll changes out slowly, because one bad rule can block every customer at
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
                      Usually each region has its own counters and a share of the global limit. This is fast and still works if the
                      link between regions breaks (a network partition). Another way is to sync the counts between regions
                      asynchronously and accept a short over-allowance. Strongly consistent global counters would add
                      delay between regions to every request.
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
              <strong>Estimate:</strong> 100,000 requests/s × 2 rules ≈ 200,000 checks/s, but only a few GB of memory, so a{" "}
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
