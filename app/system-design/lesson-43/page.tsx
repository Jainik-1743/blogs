import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { AsciiDiagram, Flow, QA, Stats, Timeline } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import RateLimiter from "@/components/sd/widgets/RateLimiter";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-43")!;

export const metadata: Metadata = {
  title: `Lesson 43 — ${lesson.title}`,
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

const diagram1 = `Limit: 100 requests per minute

12:00:00 ─────────────── 12:01:00 ─────────────── 12:02:00
   count: 0 → 1 → … → 100 ✅   count resets to 0
   request 101 → ❌ 429`;

const code1 = `key = "rl:user42:" + current_minute   (e.g., rl:user42:202702251200)
count = INCR key
if count == 1: EXPIRE key 60
if count > 100: reject`;

const code2 = `Limit 5 per 60 s. Log: [12:00:05, 12:00:20, 12:00:41, 12:00:50, 12:00:58]
New request at 12:01:10 → drop 12:00:05 (older than 60 s) → 4 left → allow ✅, add 12:01:10`;

const code3 = `estimated_count = current_window_count
                + previous_window_count × (1 − elapsed_fraction_of_current_window)`;

const code4 = `tokens = min(capacity, tokens + (now − last_refill_time) × refill_rate)
if tokens >= 1: tokens -= 1 → allow
else: reject (and compute when the next token will arrive → Retry-After)`;

const code5 = `-- Token bucket in Redis (runs atomically)
local key = KEYS[1]
local capacity, rate, now = tonumber(ARGV[1]), tonumber(ARGV[2]), tonumber(ARGV[3])
local b = redis.call("HMGET", key, "tokens", "ts")
local tokens = tonumber(b[1]) or capacity
local ts = tonumber(b[2]) or now
tokens = math.min(capacity, tokens + (now - ts) * rate)
local allowed = 0
if tokens >= 1 then tokens = tokens - 1; allowed = 1 end
redis.call("HSET", key, "tokens", tokens, "ts", now)
redis.call("EXPIRE", key, math.ceil(capacity / rate) * 2)
return allowed`;

const code6 = `HTTP/1.1 429 Too Many Requests
Retry-After: 12
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 12
Content-Type: application/problem+json

{"title": "Rate limit exceeded", "detail": "100 requests per minute allowed on the Free plan."}`;

export default function SdLessonFourThreePage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>Your public API is running smoothly. Then:</p>
          <ul>
            <li>
              A customer's script has a bug and calls <code>GET /orders</code> <strong>5,000 times per second</strong>{" "}
              in a loop.
            </li>
            <li>
              A bot tries <strong>millions of passwords</strong> against your login endpoint.
            </li>
            <li>Someone scrapes your entire product catalogue every hour.</li>
            <li>A free-plan user's traffic slows the API down for paying customers.</li>
          </ul>
          <p>
            Your servers are overwhelmed, the database is at 100%, and <strong>every</strong> customer suffers because
            of <strong>one</strong> misbehaving client.
          </p>
          <p>
            <strong>Rate limiting</strong> controls <strong>how many requests a client can make in a given time</strong>
            . It protects your system, keeps usage fair between customers, controls costs, and blocks many kinds of
            abuse.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about the <strong>entry gate at a busy metro station</strong> during rush hour.
          </p>
          <ul>
            <li>
              The gates let people through at a <strong>steady rate</strong> the platform can handle.
            </li>
            <li>
              A short burst (a group of friends arriving together) is fine, but if <strong>thousands</strong> try to
              enter at once, guards <strong>hold people back</strong> so the platform doesn't overflow.
            </li>
            <li>Everyone gets a fair chance.</li>
          </ul>
          <p>
            A rate limiter is that gate. For each <strong>client</strong> (a user, an API key or an IP address), it
            tracks recent requests and decides:
          </p>
          <ul>
            <li>
              <strong>Allow</strong>: under the limit, go ahead.
            </li>
            <li>
              <strong>Reject</strong>: over the limit, return <code>429 Too Many Requests</code> and say when to try
              again.
            </li>
          </ul>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="what-to-limit-and-where">What to limit, and where</h3>
          <p>
            <strong>Who is limited (the "key"):</strong>
          </p>
          <ul>
            <li>
              <strong>per user or per API key:</strong> the most common for authenticated APIs,
            </li>
            <li>
              <strong>per IP address:</strong> for anonymous traffic like login pages and sign-up (but many users can
              share one IP behind NAT),
            </li>
            <li>
              <strong>per endpoint:</strong> stricter limits on expensive endpoints (search, exports) or sensitive ones
              (login, OTP, password reset),
            </li>
            <li>
              <strong>per tenant or plan:</strong> "Free: 100 requests per minute; Pro: 1,000",
            </li>
            <li>
              <strong>global:</strong> protect a fragile downstream system ("at most 500 calls per second to the SMS
              provider").
            </li>
          </ul>
          <p>
            <strong>Where to enforce:</strong>
          </p>
          <ul>
            <li>
              <strong>the API gateway or edge</strong> (post 13): stops bad traffic early, before it costs anything,
            </li>
            <li>
              <strong>the service itself:</strong> for business-aware limits ("5 OTP requests per phone number per
              hour"),
            </li>
            <li>
              <strong>the client:</strong> a well-behaved SDK can limit itself to avoid being rejected.
            </li>
          </ul>
          <h3 id="algorithm-1-fixed-window-counter">Algorithm 1: Fixed window counter</h3>
          <p>
            Count requests in <strong>fixed time windows</strong> (for example, each calendar minute). Reset the count
            when the window changes.
          </p>
          <AsciiDiagram text={diagram1} />
          <CodeBlock code={code1} />
          <ul>
            <li>
              ✅ <strong>Very simple</strong> and memory-cheap (one counter per key per window).
            </li>
            <li>
              ❌ <strong>The boundary burst problem.</strong> A client can send 100 requests at 12:00:59 and another 100
              at 12:01:00, so <strong>200 requests in 2 seconds</strong>, double the intended rate.
            </li>
          </ul>
          <RateLimiter caption="Three limiters, each allowing 5 requests per 5 seconds. Fire requests by hand — try a burst just before and just after a fixed-window boundary." />
          <h3 id="algorithm-2-sliding-window-log">Algorithm 2: Sliding window log</h3>
          <p>
            Store the <strong>timestamp of every request</strong>. For each new request, drop timestamps older than the
            window, count what's left, and allow the request if the count is under the limit.
          </p>
          <CodeBlock code={code2} />
          <p>
            In Redis, a <strong>sorted set</strong> works well (the score is the timestamp).
          </p>
          <ul>
            <li>
              ✅ <strong>Exact.</strong> No boundary bursts.
            </li>
            <li>
              ❌ <strong>Memory-heavy.</strong> It stores one entry per request. A limit of 10,000 per hour means up to
              10,000 timestamps per client.
            </li>
          </ul>
          <h3 id="algorithm-3-sliding-window-counter-approximate">Algorithm 3: Sliding window counter (approximate)</h3>
          <p>
            A clever middle ground: keep counters for the <strong>current</strong> and <strong>previous</strong> fixed
            windows, and <strong>weight</strong> the previous one by how much of it still overlaps the sliding window.
          </p>
          <CodeBlock code={code3} />
          <p>
            <strong>Example:</strong> limit 100 per minute. It's 12:01:15, which is <strong>25%</strong> into the
            current minute.
          </p>
          <ul>
            <li>
              Previous window (12:00–12:01): <strong>80</strong> requests.
            </li>
            <li>
              Current window so far: <strong>30</strong> requests.
            </li>
          </ul>
          <Stats
            caption="The sliding window counter, worked through. Limit 100 per minute, 25% into the current minute."
            stats={[
              { value: <>80</>, label: <>previous window</>, sub: <>12:00–12:01</> },
              { value: <>30</>, label: <>current window so far</>, sub: <>12:01:00–12:01:15</> },
              { value: <>30 + 80 × 0.75 = 90</>, label: <>weighted estimate</>, sub: <>under 100 → allow ✅</> },
            ]}
          />
          <ul>
            <li>
              ✅ <strong>Smooths out boundary bursts</strong>, and uses <strong>just two counters</strong> per key.
            </li>
            <li>
              ❌ <strong>Approximate.</strong> It assumes requests in the previous window were spread evenly, but in
              practice it's very close.
            </li>
            <li>Widely used at large scale.</li>
          </ul>
          <h3 id="algorithm-4-token-bucket-the-most-popular-for-apis">
            Algorithm 4: Token bucket (the most popular for APIs)
          </h3>
          <p>
            Picture a <strong>bucket that holds tokens</strong>:
          </p>
          <ul>
            <li>
              It has a <strong>maximum capacity</strong> (for example, 20 tokens), which is the{" "}
              <strong>burst size</strong>.
            </li>
            <li>
              Tokens are <strong>added at a steady rate</strong> (for example, 10 per second), which is the{" "}
              <strong>sustained rate</strong>.
            </li>
            <li>
              Each request <strong>takes one token</strong>. If the bucket is <strong>empty</strong>, the request is
              rejected (or waits).
            </li>
          </ul>
          <Timeline
            caption="A token bucket with capacity 20, refilling 10 tokens a second."
            events={[
              { time: <>t = 0</>, text: <>bucket full — 20 tokens</> },
              { time: <>burst</>, text: <>20 requests arrive at once → all allowed; bucket empty</>, tone: "good" },
              { time: <>next request, same instant</>, text: <>no tokens → 429, Retry-After ≈ 0.1 s</>, tone: "bad" },
              { time: <>t = 0.5 s</>, text: <>5 tokens refilled → 5 more requests allowed</>, tone: "good" },
            ]}
          />
          <p>
            You don't need a timer adding tokens. Just store <code>tokens</code> and <code>last_refill_time</code>, and
            on each request compute:
          </p>
          <CodeBlock code={code4} />
          <ul>
            <li>
              ✅ <strong>Allows short bursts</strong> (good for real users, who click in bursts) while enforcing an{" "}
              <strong>average rate</strong>.
            </li>
            <li>
              ✅ <strong>Memory-cheap</strong> (two numbers per key) and easy to reason about with two knobs:{" "}
              <strong>burst</strong> and <strong>rate</strong>.
            </li>
            <li>❌ Two parameters to tune.</li>
          </ul>
          <p>
            This is why <strong>token bucket is the most common choice for APIs</strong>. It's used in AWS API
            throttling, many API gateways, and Stripe's request limiter.
          </p>
          <h3 id="algorithm-5-leaky-bucket">Algorithm 5: Leaky bucket</h3>
          <p>
            Picture a <strong>bucket with a small hole in the bottom</strong>:
          </p>
          <ul>
            <li>
              Requests pour <strong>into</strong> the bucket (a queue).
            </li>
            <li>
              They <strong>leak out</strong> and are processed at a <strong>constant rate</strong>.
            </li>
            <li>
              If the bucket <strong>overflows</strong> (the queue is full), new requests are rejected.
            </li>
          </ul>
          <Flow
            caption="A leaky bucket turns bursty input into a steady output rate."
            dir="row"
            nodes={[
              { title: <>Bursty input</>, desc: <>██ █ ████ █ ██████</>, tone: "warn" },
              { title: <>Queue</>, desc: <>capacity 10; overflow is rejected</> },
              { title: <>Steady output</>, desc: <>▪ ▪ ▪ ▪ ▪ at a fixed rate</>, tone: "good" },
            ]}
          />
          <ul>
            <li>
              ✅ <strong>A perfectly smooth output rate.</strong> It's ideal for protecting a downstream system that
              needs steady traffic (like a partner API or an SMS gateway).
            </li>
            <li>
              ❌ Bursts are <strong>queued</strong> (adding latency) or dropped. It's less friendly for interactive
              APIs.
            </li>
            <li>
              NGINX's <code>limit_req</code> works on leaky-bucket principles.
            </li>
          </ul>
          <h3 id="comparison">Comparison</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Algorithm</th>
                  <th>Bursts</th>
                  <th>Accuracy</th>
                  <th>Memory per key</th>
                  <th>Best for</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Fixed window</td>
                  <td>Allows 2× at boundaries</td>
                  <td>Low</td>
                  <td>1 counter</td>
                  <td>Simple, low-stakes limits</td>
                </tr>
                <tr>
                  <td>Sliding log</td>
                  <td>No</td>
                  <td>Exact</td>
                  <td>1 entry per request</td>
                  <td>Low limits where precision matters (login attempts)</td>
                </tr>
                <tr>
                  <td>Sliding window counter</td>
                  <td>Smoothed</td>
                  <td>Approximate (good)</td>
                  <td>2 counters</td>
                  <td>Large-scale limits</td>
                </tr>
                <tr>
                  <td>
                    <strong>Token bucket</strong>
                  </td>
                  <td>
                    <strong>Allowed up to capacity</strong>
                  </td>
                  <td>Good</td>
                  <td>2 numbers</td>
                  <td>
                    <strong>Most APIs</strong>
                  </td>
                </tr>
                <tr>
                  <td>Leaky bucket</td>
                  <td>Queued/smoothed</td>
                  <td>Good</td>
                  <td>Queue</td>
                  <td>Steady output to fragile downstreams</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3 id="distributed-rate-limiting">Distributed rate limiting</h3>
          <p>
            With 20 API servers, each server can't keep its own counter. A client could get 20× the limit by spreading
            requests across servers. You need a <strong>shared</strong> view.
          </p>
          <p>
            <strong>Option 1: A central store (usually Redis).</strong> Every server checks and updates the counter in
            Redis. To avoid race conditions (two servers reading "99" at the same time and both allowing), make the
            check-and-update <strong>atomic</strong>, using <code>INCR</code> or a <strong>Lua script</strong> that
            Redis runs as one step:
          </p>
          <CodeBlock lang="lua" code={code5} />
          <ul>
            <li>✅ Accurate and simple.</li>
            <li>
              ❌ Adds a network hop per request (usually under a millisecond), and Redis becomes a dependency.{" "}
              <strong>Decide what happens if Redis is down: fail open</strong> (allow traffic, which is usually right
              for general APIs) <strong>or fail closed</strong> (block, which may be right for login or OTP endpoints).
            </li>
          </ul>
          <p>
            <strong>Option 2: Local counters with periodic sync.</strong> Each server enforces a <strong>share</strong>{" "}
            of the limit locally, and syncs with the others every second or so. It's faster, but approximate.
          </p>
          <p>
            <strong>Option 3: A dedicated rate-limit service</strong>, like Envoy's global rate-limit service, called by
            gateways and proxies.
          </p>
          <p>
            <strong>Multi-region:</strong> counters in different regions are hard to keep perfectly in sync (posts
            27–28). Common approaches are per-region budgets, or accepting slight over-allowance.
          </p>
          <h3 id="telling-clients-about-limits">Telling clients about limits</h3>
          <p>
            Good APIs make limits <strong>visible</strong>:
          </p>
          <CodeBlock lang="http" code={code6} />
          <ul>
            <li>
              <strong>
                <code>429</code>
              </strong>{" "}
              is the standard status code.
            </li>
            <li>
              <strong>
                <code>Retry-After</code>
              </strong>{" "}
              tells the client how long to wait. Well-behaved clients (post 41) honour it.
            </li>
            <li>
              <code>RateLimit-*</code> headers (being standardised by the IETF; many APIs use <code>X-RateLimit-*</code>{" "}
              variants) show the limit, how many requests remain, and when it resets. Clients can then{" "}
              <strong>slow down before</strong> hitting the limit.
            </li>
            <li>
              <strong>Document</strong> limits clearly per plan and endpoint.
            </li>
          </ul>
          <h3 id="rate-limiting-vs-throttling-vs-load-shedding">Rate limiting vs throttling vs load shedding</h3>
          <ul>
            <li>
              <strong>Rate limiting:</strong> limits <strong>each client</strong> to a fair share. "<em>You</em> are
              sending too much."
            </li>
            <li>
              <strong>Throttling:</strong> often used to mean slowing requests down (queuing or delaying) rather than
              rejecting them.
            </li>
            <li>
              <strong>Load shedding</strong> (post 44): rejects requests because <strong>the server</strong> is
              overloaded, whoever sent them. "<em>We</em> can't handle more right now."
            </li>
          </ul>
          <p>
            You usually need <strong>both</strong> rate limiting and load shedding. Rate limits don't protect you if{" "}
            <strong>all</strong> clients are within their limits but the total is still too much.
          </p>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Strict limits:</strong> strong protection and predictable costs, but you may block legitimate
              bursts and frustrate good customers.
            </li>
            <li>
              <strong>Generous limits:</strong> a happy user experience, but less protection against abuse and overload.
            </li>
            <li>
              <strong>Exact algorithms (sliding log):</strong> precise, but memory-heavy.{" "}
              <strong>Approximate (sliding counter, token bucket):</strong> cheap and good enough for most cases.
            </li>
            <li>
              <strong>Central Redis:</strong> accurate across servers, but an extra hop and a dependency.{" "}
              <strong>Local:</strong> fast, but approximate.
            </li>
            <li>
              <strong>Fail open vs fail closed</strong> when the limiter is broken: availability vs protection. Choose
              per endpoint.
            </li>
            <li>
              <strong>IP-based limits:</strong> simple for anonymous traffic, but unfair to many users behind one NAT
              (offices, mobile carriers), and easy for attackers to spread across many IPs.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Stripe's four limiters.</strong> Stripe wrote about using <strong>four types</strong> of limiters:
          </p>
          <ol>
            <li>
              a <strong>request rate limiter</strong> (token bucket per user),
            </li>
            <li>
              a <strong>concurrent requests limiter</strong> (how many requests a user can have in flight at once),
            </li>
            <li>
              a <strong>fleet usage load shedder</strong> (reserving capacity for critical requests),
            </li>
            <li>
              a <strong>worker utilisation load shedder</strong> (dropping lower-priority traffic when workers are
              busy).
            </li>
          </ol>
          <p>It's a great real example of combining rate limiting and load shedding.</p>
          <p>
            <strong>Cloudflare's rate limiting at scale.</strong> Cloudflare described building rate limiting across its
            global network for millions of domains, using a <strong>sliding-window approximation</strong> with just two
            counters per key, because storing every request's timestamp was far too expensive at its scale.
          </p>
          <p>
            <strong>GitHub's API limits.</strong> GitHub's REST API allows a set number of requests per hour for
            authenticated users (commonly 5,000) and far fewer for unauthenticated requests (60 per hour per IP), and
            returns <code>X-RateLimit-*</code> headers with every response so clients can pace themselves.
          </p>
          <p>
            <strong>OTP and login protection.</strong> Banks, UPI apps and most login pages limit OTP requests and login
            attempts per phone number, account and IP. This protects users from brute-force attacks and the company from
            SMS bills run up by bots (a form of abuse sometimes called "SMS pumping").
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>Compare fixed window, sliding window and token bucket rate limiting.</>,
                a: (
                  <>
                    <p>
                      Fixed window counts per calendar window — simple, but allows up to 2× the limit around window
                      boundaries. A sliding log is exact but stores every timestamp. A sliding window counter weights
                      the previous window to approximate a true sliding window with two counters. A token bucket allows
                      bursts up to its capacity and enforces an average refill rate, which is why most APIs use it.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you rate-limit across 20 API servers?</>,
                a: (
                  <>
                    <p>
                      Use a shared store like Redis with an atomic check-and-update (INCR, or a Lua script implementing
                      the token bucket), or a dedicated rate-limit service. Otherwise each server counts separately and
                      a client gets 20× the limit. Decide whether to fail open or closed if the store is down.
                    </p>
                  </>
                ),
              },
              {
                q: <>What should a rate-limited response look like?</>,
                a: (
                  <>
                    <p>
                      429 Too Many Requests with Retry-After, plus RateLimit (or X-RateLimit) headers giving the limit,
                      remaining requests and reset time, and a clear error body naming the plan limit. Well-behaved
                      clients back off and pace themselves from those headers.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why isn't per-IP limiting enough?</>,
                a: (
                  <>
                    <p>
                      Many legitimate users share one IP behind NAT (offices, mobile carriers), so they get blocked
                      unfairly, while attackers spread requests across thousands of IPs. Prefer limits per API key, user
                      or account, and use IP limits mainly for anonymous endpoints.
                    </p>
                  </>
                ),
              },
              {
                q: <>What's the difference between rate limiting and load shedding?</>,
                a: (
                  <>
                    <p>
                      Rate limiting caps each client's fair share (“you are sending too much”). Load shedding rejects
                      work because the server as a whole is overloaded, whoever sent it (“we can't take more right
                      now”). You need both: every client can be within its limit while the total still exceeds capacity.
                    </p>
                  </>
                ),
              },
              {
                q: <>Leaky bucket or token bucket for calling a fragile SMS provider?</>,
                a: (
                  <>
                    <p>
                      A leaky bucket: it queues bursts and releases them at a fixed rate, which is exactly what a
                      downstream with a hard throughput cap needs. A token bucket would let bursts straight through.
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
              <strong>Rate limiting</strong> caps requests per client per time window, for{" "}
              <strong>protection, fairness, cost control and abuse prevention</strong>.
            </li>
            <li>
              Know the five algorithms: <strong>fixed window</strong> (simple, boundary bursts),{" "}
              <strong>sliding log</strong> (exact, memory-heavy), <strong>sliding window counter</strong> (approximate,
              cheap), <strong>token bucket</strong> (bursts plus average rate, the API favourite) and{" "}
              <strong>leaky bucket</strong> (smooth output).
            </li>
            <li>
              For many servers, use a <strong>shared, atomic store</strong> (Redis + Lua) or a rate-limit service, and
              decide <strong>fail open vs fail closed</strong>.
            </li>
            <li>
              Return{" "}
              <strong>
                <code>429</code> + <code>Retry-After</code>
              </strong>{" "}
              and <strong>rate-limit headers</strong>, and document limits per plan and endpoint.
            </li>
            <li>
              Rate limiting protects against <strong>individual</strong> clients. Pair it with{" "}
              <strong>load shedding</strong> to protect against <strong>total</strong> overload.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              <em>System Design Interview</em> by Alex Xu (chapter 4, "Design A Rate Limiter")
            </li>
            <li>Stripe's blog post "Scaling your API with rate limiters"</li>
            <li>
              Cloudflare's blog post on how it built rate limiting for millions of domains ("Counting things, a lot of
              different things")
            </li>
            <li>Azure Architecture Center patterns "Rate Limiting" and "Throttling"</li>
            <li>The NGINX blog post on rate limiting with NGINX</li>
            <li>The IETF draft on standard RateLimit header fields for HTTP</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
