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
          <p>Your public API (an interface that other programs call over the internet) is running well. Then:</p>
          <ul>
            <li>
              A customer's script has a bug and calls <code>GET /orders</code> <strong>5,000 times per second</strong>{" "}
              in a loop.
            </li>
            <li>
              A bot (a program that acts like a user) tries <strong>millions of passwords</strong> on your login endpoint.
            </li>
            <li>Someone scrapes your whole product catalogue every hour. (Scraping means copying data from a site with a program.)</li>
            <li>A free-plan user's traffic slows the API down for paying customers.</li>
          </ul>
          <p>
            Your servers are overloaded, the database is at 100%, and <strong>every</strong> customer suffers because
            of <strong>one</strong> client that behaves badly.
          </p>
          <p>
            <strong>Rate limiting</strong> is a rule that controls <strong>how many requests a client can make in a given
            time</strong>. It protects your system, keeps usage fair between customers, controls costs, and blocks many
            kinds of abuse.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about the <strong>entry gate at a busy metro station</strong> during rush hour.
          </p>
          <ul>
            <li>
              The gates let people through at a <strong>steady rate</strong> that the platform can handle.
            </li>
            <li>
              A short burst (a group of friends arriving together) is fine. But if <strong>thousands</strong> try to
              enter at once, guards <strong>hold people back</strong> so the platform does not overflow.
            </li>
            <li>Everyone gets a fair chance.</li>
          </ul>
          <p>
            A rate limiter is that gate. For each <strong>client</strong> (a user, an API key or an IP address), it
            keeps track of recent requests and decides:
          </p>
          <ul>
            <li>
              <strong>Allow</strong>: the client is under the limit, so let the request pass.
            </li>
            <li>
              <strong>Reject</strong>: the client is over the limit, so return <code>429 Too Many Requests</code> (an
              HTTP status code) and say when to try again.
            </li>
          </ul>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="what-to-limit-and-where">What to limit, and where</h3>
          <p>
            <strong>Who is limited (the "key"):</strong> the key is the label that the limiter counts requests for.
          </p>
          <ul>
            <li>
              <strong>per user or per API key</strong> (a secret code that identifies a customer's app): the most common
              choice for APIs where users log in,
            </li>
            <li>
              <strong>per IP address:</strong> for traffic from users who are not logged in, like login pages and sign-up.
              (But many users can share one IP behind NAT, which lets many devices share one public address.)
            </li>
            <li>
              <strong>per endpoint:</strong> stricter limits on expensive endpoints (search, exports) or sensitive ones
              (login, OTP, password reset),
            </li>
            <li>
              <strong>per tenant or plan</strong> (a tenant is one customer account): "Free: 100 requests per minute; Pro:
              1,000",
            </li>
            <li>
              <strong>global:</strong> protect a weak downstream system (one that you call), for example "at most 500 calls
              per second to the SMS provider".
            </li>
          </ul>
          <p>
            <strong>Where to enforce:</strong>
          </p>
          <ul>
            <li>
              <strong>the API gateway or edge</strong> (post 13; a gateway is the single entry point in front of your
              services): it stops bad traffic early, before it costs anything,
            </li>
            <li>
              <strong>the service itself:</strong> for limits that know your business ("5 OTP requests per phone number
              per hour"; an OTP is a one-time password),
            </li>
            <li>
              <strong>the client:</strong> a well-made SDK (a code library for your API) can limit itself to avoid being
              rejected.
            </li>
          </ul>
          <h3 id="algorithm-1-fixed-window-counter">Algorithm 1: Fixed window counter</h3>
          <p>
            Count requests in <strong>fixed time windows</strong> (for example, each calendar minute). Set the count back
            to zero when the window changes. A window is a block of time.
          </p>
          <AsciiDiagram text={diagram1} />
          <CodeBlock code={code1} />
          <ul>
            <li>
              ✅ <strong>Very simple</strong> and uses little memory (one counter per key per window).
            </li>
            <li>
              ❌ <strong>The boundary burst problem.</strong> A client can send 100 requests at 12:00:59 and another 100
              at 12:01:00. That is <strong>200 requests in 2 seconds</strong>, double the intended rate.
            </li>
          </ul>
          <RateLimiter caption="Three limiters, each allowing 5 requests per 5 seconds. Fire requests by hand — try a burst just before and just after a fixed-window boundary." />
          <h3 id="algorithm-2-sliding-window-log">Algorithm 2: Sliding window log</h3>
          <p>
            Store the <strong>time of every request</strong> (a timestamp). For each new request, remove the timestamps
            that are older than the window, and count what is left. Allow the request if the count is under the limit.
          </p>
          <CodeBlock code={code2} />
          <p>
            Redis is a fast in-memory data store. In Redis, a <strong>sorted set</strong> (a list kept in order by a
            score) works well. The score is the timestamp.
          </p>
          <ul>
            <li>
              ✅ <strong>Exact.</strong> No boundary bursts.
            </li>
            <li>
              ❌ <strong>Uses a lot of memory.</strong> It stores one entry per request. A limit of 10,000 per hour means
              up to 10,000 timestamps per client.
            </li>
          </ul>
          <h3 id="algorithm-3-sliding-window-counter-approximate">Algorithm 3: Sliding window counter (approximate)</h3>
          <p>
            A good middle way: keep counters for the <strong>current</strong> and the <strong>previous</strong> fixed
            window. Then <strong>weight</strong> the previous one by how much of it still overlaps the sliding window.
            (A sliding window is a window that moves with the clock, always covering the last 60 seconds.)
          </p>
          <CodeBlock code={code3} />
          <p>
            <strong>Example:</strong> the limit is 100 per minute. The time is 12:01:15, which is <strong>25%</strong> into
            the current minute. So 75% of the previous minute is still inside the sliding window.
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
              ✅ <strong>Reduces boundary bursts</strong>, and uses <strong>only two counters</strong> per key.
            </li>
            <li>
              ❌ <strong>Approximate.</strong> It assumes that requests in the previous window were spread evenly. In
              practice the result is very close.
            </li>
            <li>It is widely used at large scale.</li>
          </ul>
          <h3 id="algorithm-4-token-bucket-the-most-popular-for-apis">
            Algorithm 4: Token bucket (the most popular for APIs)
          </h3>
          <p>
            Picture a <strong>bucket that holds tokens</strong>. A token is a permission to make one request:
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
            You do not need a timer that adds tokens. Just store <code>tokens</code> and <code>last_refill_time</code>.
            On each request, work out the new count:
          </p>
          <CodeBlock code={code4} />
          <ul>
            <li>
              ✅ <strong>Allows short bursts</strong> (good for real users, who click in quick groups) and still enforces an{" "}
              <strong>average rate</strong>.
            </li>
            <li>
              ✅ <strong>Uses little memory</strong> (two numbers per key) and is easy to understand. It has two settings:{" "}
              <strong>burst</strong> and <strong>rate</strong>.
            </li>
            <li>❌ Two settings to tune.</li>
          </ul>
          <p>
            This is why <strong>token bucket is the most common choice for APIs</strong>. It is used in AWS API
            throttling, many API gateways, and Stripe's request limiter.
          </p>
          <h3 id="algorithm-5-leaky-bucket">Algorithm 5: Leaky bucket</h3>
          <p>
            Picture a <strong>bucket with a small hole in the bottom</strong>:
          </p>
          <ul>
            <li>
              Requests pour <strong>into</strong> the bucket (a queue is a line of waiting items).
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
              ✅ <strong>A perfectly smooth output rate.</strong> It is ideal for protecting a downstream system that
              needs steady traffic (like a partner API or an SMS gateway).
            </li>
            <li>
              ❌ Bursts are <strong>queued</strong> (which adds latency, the waiting time) or dropped. It is less
              friendly for interactive APIs.
            </li>
            <li>
              NGINX (a popular web server) has a <code>limit_req</code> setting that uses the leaky bucket method.
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
                  <td>Steady output to weak downstream services</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3 id="distributed-rate-limiting">Distributed rate limiting</h3>
          <p>
            Say you have 20 API servers. Each server cannot keep its own counter. A client could get 20× the limit by
            spreading requests across servers. You need a <strong>shared</strong> view of the counts. This is
            called <strong>distributed rate limiting</strong>.
          </p>
          <p>
            <strong>Option 1: A central store (usually Redis).</strong> Every server checks and updates the counter in
            Redis. A race condition can happen: two servers read "99" at the same time and both allow the request. To
            avoid it, make the check-and-update <strong>atomic</strong> (one step that cannot be split). Use{" "}
            <code>INCR</code> or a <strong>Lua script</strong> (a small program) that Redis runs as one step:
          </p>
          <CodeBlock lang="lua" code={code5} />
          <ul>
            <li>✅ Accurate and simple.</li>
            <li>
              ❌ Adds one network call per request (often about a millisecond), and Redis becomes a dependency.{" "}
              <strong>Decide what happens if Redis is down.</strong> <strong>Fail open</strong> means allow the traffic.
              This is usually right for general APIs. <strong>Fail closed</strong> means block the traffic. This may be
              right for login or OTP endpoints.
            </li>
          </ul>
          <p>
            <strong>Option 2: Local counters with periodic sync.</strong> Each server enforces a <strong>share</strong>{" "}
            of the limit by itself, and shares its counts with the others every second or so. It is faster, but not
            exact.
          </p>
          <p>
            <strong>Option 3: A dedicated rate-limit service</strong>, like Envoy's global rate-limit service. Gateways
            and proxies (servers that pass traffic on) call it.
          </p>
          <p>
            <strong>Multi-region:</strong> counters in different regions (separate cloud areas) are hard to keep exactly
            the same (posts 27–28). Common ways are a separate budget for each region, or accepting that clients may
            go a little over the limit.
          </p>
          <h3 id="telling-clients-about-limits">Telling clients about limits</h3>
          <p>
            Good APIs make limits <strong>visible</strong> to the client. They do it with HTTP headers (extra lines of
            information in a response):
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
              <code>RateLimit-*</code> headers show the limit, how many requests remain, and when it resets. The IETF is
              still working on a standard for them as a draft, and the exact names may change. Many APIs use{" "}
              <code>X-RateLimit-*</code> variants. With these headers, clients can{" "}
              <strong>slow down before</strong> they hit the limit.
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
              <strong>Throttling:</strong> often means slowing requests down (making them wait in a queue) instead of
              rejecting them.
            </li>
            <li>
              <strong>Load shedding</strong> (post 44): rejects requests because <strong>the server</strong> is
              overloaded, no matter who sent them. "<em>We</em> cannot handle more right now."
            </li>
          </ul>
          <p>
            You usually need <strong>both</strong> rate limiting and load shedding. Rate limits do not protect you if{" "}
            <strong>all</strong> clients are within their limits but the total is still too much.
          </p>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Strict limits:</strong> strong protection and costs that you can predict, but you may block real
              bursts and annoy good customers.
            </li>
            <li>
              <strong>Generous limits:</strong> happy users, but less protection against abuse and overload.
            </li>
            <li>
              <strong>Exact algorithms (sliding log):</strong> precise, but they use a lot of memory.{" "}
              <strong>Approximate ones (sliding counter, token bucket):</strong> cheap and good enough for most cases.
            </li>
            <li>
              <strong>Central Redis:</strong> accurate across servers, but it adds a network call and a dependency.{" "}
              <strong>Local counters:</strong> fast, but not exact.
            </li>
            <li>
              <strong>Fail open vs fail closed</strong> when the limiter is broken: stay available, or stay protected.
              Choose for each endpoint.
            </li>
            <li>
              <strong>IP-based limits:</strong> simple for traffic without a login, but unfair to many users behind one
              NAT (offices, mobile carriers). Attackers can also easily spread requests across many IPs.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Stripe's four limiters.</strong> Stripe wrote about using <strong>four types</strong> of limiters:
          </p>
          <ol>
            <li>
              a <strong>request rate limiter</strong> (a token bucket for each user),
            </li>
            <li>
              a <strong>concurrent requests limiter</strong> (how many requests a user can have running at the same time),
            </li>
            <li>
              a <strong>fleet usage load shedder</strong> (it keeps some capacity of the whole server fleet for critical
              requests),
            </li>
            <li>
              a <strong>worker utilisation load shedder</strong> (dropping lower-priority traffic when workers are
              busy).
            </li>
          </ol>
          <p>It is a good real example of using rate limiting and load shedding together.</p>
          <p>
            <strong>Cloudflare's rate limiting at scale.</strong> Cloudflare described how it built rate limiting across its
            global network for millions of domains. It uses a <strong>sliding-window approximation</strong> with only two
            counters per key, because storing the timestamp of every request would cost far too much at its scale.
          </p>
          <p>
            <strong>GitHub's API limits.</strong> GitHub's REST API allows a set number of requests per hour for
            logged-in (authenticated) users, commonly 5,000, and far fewer for requests without a login (60 per hour per
            IP). It returns <code>X-RateLimit-*</code> headers with every response, so clients can pace themselves.
          </p>
          <p>
            <strong>OTP and login protection.</strong> Banks, UPI apps (apps for instant payments in India) and most login pages limit OTP requests and login
            attempts per phone number, account and IP. This protects users from brute-force attacks (guessing many
            passwords or codes). It also protects the company from big SMS bills that bots create (this abuse is
            sometimes called "SMS pumping").
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
                      Fixed window counts per calendar window. It is simple, but it allows up to 2× the limit around
                      window boundaries. A sliding log is exact, but it stores every timestamp. A sliding window counter
                      weights the previous window, so two counters give a close match to a true sliding window. A token
                      bucket allows bursts up to its capacity and enforces an average refill rate. This is why most APIs
                      use it.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you rate-limit across 20 API servers?</>,
                a: (
                  <>
                    <p>
                      Use a shared store like Redis with an atomic check-and-update (INCR, or a Lua script that
                      implements the token bucket), or a dedicated rate-limit service. If not, each server counts on its
                      own and a client gets 20× the limit. Decide whether to fail open or closed if the store is down.
                    </p>
                  </>
                ),
              },
              {
                q: <>What should a rate-limited response look like?</>,
                a: (
                  <>
                    <p>
                      Status 429 Too Many Requests with a Retry-After header. Add RateLimit (or X-RateLimit) headers
                      that show the limit, the remaining requests and the reset time. Add a clear error body that names
                      the plan limit. Well-behaved clients wait and pace themselves using those headers.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why isn't per-IP limiting enough?</>,
                a: (
                  <>
                    <p>
                      Many real users share one IP behind NAT (offices, mobile carriers), so they get blocked
                      unfairly. Attackers spread requests across thousands of IPs. Prefer limits per API key, user or
                      account. Use IP limits mainly for endpoints without a login.
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
                      work because the whole server is overloaded, no matter who sent it (“we cannot take more right
                      now”). You need both: every client can be within its limit while the total is still more than the
                      capacity.
                    </p>
                  </>
                ),
              },
              {
                q: <>Leaky bucket or token bucket for calling a fragile SMS provider?</>,
                a: (
                  <>
                    <p>
                      A leaky bucket. It queues bursts and releases them at a fixed rate. This is what a downstream
                      service with a hard limit on throughput needs. A token bucket would let bursts go straight
                      through.
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
