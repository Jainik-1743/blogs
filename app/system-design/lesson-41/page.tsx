import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Flow, QA, Stats, Timeline } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import Backoff from "@/components/sd/widgets/Backoff";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-41")!;

export const metadata: Metadata = {
  title: `Lesson 41 — ${lesson.title}`,
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

const code1 = `// Node.js fetch with a timeout using AbortController
const res = await fetch(url, { signal: AbortSignal.timeout(300) });  // 300 ms total`;

const code2 = `# Python requests: (connect timeout, read timeout)
requests.get(url, timeout=(0.5, 2.0))`;

const code3 = `wait = base × 2^attempt       (capped at some maximum)

base = 100 ms:
  attempt 1 → 100 ms
  attempt 2 → 200 ms
  attempt 3 → 400 ms
  attempt 4 → 800 ms
  attempt 5 → 1.6 s  … up to a cap (e.g., 10–30 s for background work)`;

const code4 = `Full jitter (recommended default):
  wait = random(0, min(cap, base × 2^attempt))

Equal jitter:
  temp = min(cap, base × 2^attempt)
  wait = temp/2 + random(0, temp/2)

Decorrelated jitter:
  wait = min(cap, random(base, previous_wait × 3))`;

const code5 = `async function withRetry(fn, { attempts = 3, base = 100, cap = 2000 } = {}) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      if (!isTransient(err) || i === attempts - 1) throw err;
      const delay = Math.random() * Math.min(cap, base * 2 ** i);  // full jitter
      await new Promise(r => setTimeout(r, delay));
    }
  }
}`;

export default function SdLessonFourOnePage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            The recommendations service slows down. It doesn't fail; it just takes <strong>30 seconds</strong> to answer
            instead of 50 ms. Here's what happens next:
          </p>
          <ol>
            <li>
              The product-page service calls it <strong>without a timeout</strong>, so each request waits 30 seconds.
            </li>
            <li>
              All of the product service's threads fill up with waiting requests (post 4, Little's Law in post 8).
            </li>
            <li>
              The product service stops answering, and <strong>the homepage and checkout break too</strong>, because
              they call the product service.
            </li>
            <li>
              Clients see errors and <strong>retry</strong>, which doubles or triples the load.
            </li>
            <li>
              The recommendations service, already struggling, gets <strong>even more</strong> traffic and falls over
              completely.
            </li>
          </ol>
          <p>
            One slow dependency took down the whole site. This is a <strong>cascading failure</strong>, and the two most
            common causes are <strong>missing timeouts</strong> and <strong>naive retries</strong>. Getting these two
            right is one of the highest-value reliability skills.
          </p>
          <Timeline
            caption="Anatomy of a cascading failure, starting from one slow service."
            events={[
              {
                time: <>t = 0</>,
                text: <>recommendations slows from 50 ms to 30 s — it doesn't fail, it just hangs</>,
              },
              {
                time: <>t + 10 s</>,
                text: <>product service calls it with no timeout; its threads fill with waiting requests</>,
                tone: "warn",
              },
              {
                time: <>t + 30 s</>,
                text: <>product service stops answering → homepage and checkout break too</>,
                tone: "bad",
              },
              {
                time: <>t + 40 s</>,
                text: <>clients see errors and retry, doubling or tripling the load</>,
                tone: "bad",
              },
              { time: <>t + 60 s</>, text: <>recommendations, now flooded, falls over completely</>, tone: "bad" },
            ]}
          />
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about calling a <strong>customer support line</strong>.
          </p>
          <ul>
            <li>
              <strong>A timeout</strong> is deciding "<strong>if nobody answers in 2 minutes, I'll hang up</strong>".
              Without that rule, you could sit on hold forever while everything else in your day waits.
            </li>
            <li>
              <strong>A retry</strong> is calling again after hanging up. Sensible, <em>if</em> the problem was
              temporary.
            </li>
            <li>
              <strong>Backoff</strong> is waiting <strong>longer between each attempt</strong>: 1 minute, then 5, then
              15. If the line is overloaded, calling back instantly just adds to the queue.
            </li>
            <li>
              <strong>Jitter</strong> is adding a bit of <strong>randomness</strong> to when you call back. If the line
              went down at 10:00 and <strong>everyone</strong> calls back at exactly 10:05, it crashes again. If people
              call back at random times between 10:03 and 10:10, it copes.
            </li>
          </ul>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="part-1-timeouts">Part 1: Timeouts</h3>
          <p>
            <strong>Every network call needs a timeout.</strong> Many libraries and HTTP clients have{" "}
            <strong>no timeout, or a very long one, by default</strong>. Always set them explicitly.
          </p>
          <p>
            <strong>Types of timeouts:</strong>
          </p>
          <ul>
            <li>
              <strong>Connect timeout:</strong> how long to wait to <strong>establish</strong> the connection. It's
              usually short (like 100 ms–1 s), because a healthy server accepts quickly.
            </li>
            <li>
              <strong>Read (response) timeout:</strong> how long to wait for data once connected.
            </li>
            <li>
              <strong>Total (request) timeout:</strong> the overall limit, including retries.
            </li>
            <li>
              <strong>Idle timeouts</strong> for keep-alive connections, and <strong>pool acquire timeouts</strong> for
              how long to wait for a free connection from a pool.
            </li>
          </ul>
          <CodeBlock lang="js" code={code1} />
          <CodeBlock lang="python" code={code2} />
          <h3 id="choosing-timeout-values">Choosing timeout values</h3>
          <p>
            Use <strong>measured latency</strong>, not guesses:
          </p>
          <ul>
            <li>
              Look at the dependency's <strong>p99 or p99.9 latency</strong> (post 8). If p99 is 120 ms, a timeout of
              maybe <strong>300–500 ms</strong> leaves room for normal slowness while cutting off truly stuck calls.
            </li>
            <li>
              <strong>Too short:</strong> you time out on normal-but-slow requests and create extra retries (false
              failures).
            </li>
            <li>
              <strong>Too long:</strong> stuck calls hold resources and cause cascades.
            </li>
          </ul>
          <p>
            Also consider <strong>what the user can tolerate</strong>. If the whole page must load in 1 second, a single
            dependency can't be allowed 5 seconds.
          </p>
          <h3 id="deadline-propagation">Deadline propagation</h3>
          <p>
            In a chain of services, each hop should know <strong>how much time is left</strong>:
          </p>
          <Flow
            caption="Deadline propagation. Every hop knows how much of the user's budget is left."
            nodes={[
              { title: <>User request</>, desc: <>1,000 ms budget</> },
              { title: <>API gateway</>, desc: <>950 ms left</> },
              { title: <>Product service</>, desc: <>fans out in parallel</> },
              { title: <>Pricing</>, desc: <>given 300 ms</> },
              { title: <>Reviews</>, desc: <>given 300 ms</> },
              {
                title: <>Reviews DB</>,
                desc: <>~250 ms left — if the remaining budget is too small, fail fast or fall back</>,
                tone: "warn",
              },
            ]}
          />
          <p>
            If the product service has only 200 ms left, it shouldn't start a call that normally takes 400 ms. It should{" "}
            <strong>fail fast</strong> or use a fallback. gRPC propagates deadlines automatically (post 31). With HTTP,
            you can pass a deadline header.
          </p>
          <p>
            <strong>Stop work when the caller has given up.</strong> If the user closed the page or the upstream timed
            out, continuing to compute the response is pure waste. Use cancellation where your framework supports it.
          </p>
          <h3 id="part-2-retries">Part 2: Retries</h3>
          <p>
            Retries turn <strong>temporary</strong> failures into successes. But used carelessly, they turn small
            problems into <strong>outages</strong>.
          </p>
          <p>
            <strong>When to retry:</strong>
          </p>
          <ul>
            <li>
              ✅ <strong>Transient errors:</strong> timeouts, connection resets, <code>503 Service Unavailable</code>,{" "}
              <code>429 Too Many Requests</code> (after the <code>Retry-After</code> delay), <code>502/504</code> from a
              proxy, database deadlocks.
            </li>
            <li>
              ❌ <strong>Permanent errors:</strong> <code>400</code>, <code>401</code>, <code>403</code>,{" "}
              <code>404</code>, <code>422</code>, validation failures. Retrying won't help.
            </li>
          </ul>
          <p>
            <strong>Only retry safe operations:</strong>
          </p>
          <ul>
            <li>
              <strong>Idempotent</strong> operations (GET, PUT, DELETE) are safe to retry.
            </li>
            <li>
              <strong>Non-idempotent</strong> operations (POST, "charge card") are safe{" "}
              <strong>only with idempotency keys</strong> (post 34).
            </li>
          </ul>
          <h3 id="retry-amplification">Retry amplification</h3>
          <p>
            Here's the hidden danger. Imagine <strong>each layer</strong> makes <strong>3 attempts</strong> (1 try + 2
            retries):
          </p>
          <Stats
            caption="Retry amplification. Three attempts at each of four layers."
            stats={[
              { value: <>3 × 3 × 3 × 3</>, label: <>attempts multiply</>, sub: <>one per layer</> },
              { value: <>81</>, label: <>calls to the database</>, sub: <>for one user action</> },
              {
                value: <>4⁵ = 1,024</>,
                label: <>with 4 attempts over 5 layers</>,
                sub: <>exactly when it's already struggling</>,
              },
            ]}
          />
          <p>
            With 4 attempts per layer across 5 layers, that's 4⁵ = <strong>1,024</strong> calls to the bottom service
            for one user action. When the bottom service is <strong>already struggling</strong>, this multiplication
            finishes it off.
          </p>
          <p>Rules to prevent amplification:</p>
          <ol>
            <li>
              <strong>Retry at one layer only</strong>, usually the one closest to the failure or the edge, not at every
              layer.
            </li>
            <li>
              <strong>Cap attempts</strong>, typically 2–3 in total.
            </li>
            <li>
              <strong>Use retry budgets.</strong> Allow retries to add at most, say, <strong>10% extra load</strong>. If
              more than 10% of recent requests are already retries, stop retrying and fail fast. (gRPC, Envoy and some
              libraries support this.)
            </li>
            <li>
              <strong>
                Honour <code>Retry-After</code>
              </strong>{" "}
              from servers.
            </li>
            <li>
              <strong>Combine with circuit breakers</strong> (post 42), which stop calling a dependency that's clearly
              down.
            </li>
          </ol>
          <h3 id="part-3-exponential-backoff">Part 3: Exponential backoff</h3>
          <p>
            Don't retry immediately. <strong>Wait longer after each failure:</strong>
          </p>
          <CodeBlock code={code3} />
          <p>
            This gives the struggling service <strong>time to recover</strong>, and reduces load while it does.
          </p>
          <h3 id="part-4-jitter">Part 4: Jitter</h3>
          <p>
            Backoff alone has a flaw. If 10,000 clients all fail at <strong>the same moment</strong> (say, the database
            blipped), they all retry at <strong>exactly</strong> 100 ms, then 200 ms, then 400 ms. They stay{" "}
            <strong>synchronised</strong> in waves, and every wave hits the server at once. This is the{" "}
            <strong>thundering herd</strong>.
          </p>
          <Backoff caption="Forty clients fail at the same instant. Switch strategies and watch how retries hit the recovering server." />
          <p>
            <strong>Jitter</strong> adds randomness to the wait. The most common forms:
          </p>
          <CodeBlock code={code4} />
          <p>
            AWS analysed these variants and found that <strong>full jitter</strong> and{" "}
            <strong>decorrelated jitter</strong> spread load much better, and complete work with far fewer total calls,
            than plain exponential backoff.
          </p>
          <CodeBlock lang="js" code={code5} />
          <p>
            <strong>Jitter isn't only for retries.</strong> Use it anywhere many clients act on a schedule:
          </p>
          <ul>
            <li>
              <strong>cron jobs</strong> across thousands of servers,
            </li>
            <li>
              <strong>cache TTLs</strong> (the avalanche in post 16),
            </li>
            <li>
              <strong>client reconnects</strong> after a WebSocket server restarts (post 33),
            </li>
            <li>
              <strong>mobile apps syncing</strong> "every hour".
            </li>
          </ul>
          <h3 id="putting-it-together-a-checklist-for-every-network-call">
            Putting it together: a checklist for every network call
          </h3>
          <Flow
            caption="A checklist for every network call."
            nodes={[
              {
                title: <>Connect timeout and total timeout</>,
                desc: <>from the dependency's p99 and the user's budget</>,
                tone: "good",
              },
              {
                title: <>Deadline passed downstream</>,
                desc: <>and work cancelled when the caller gives up</>,
                tone: "good",
              },
              {
                title: <>Retry only transient errors</>,
                desc: <>timeouts, resets, 503, 429 after Retry-After</>,
                tone: "good",
              },
              { title: <>Only idempotent operations</>, desc: <>or with idempotency keys</>, tone: "good" },
              { title: <>2–3 attempts, at one layer</>, desc: <>never at every layer</>, tone: "good" },
              { title: <>Exponential backoff with full jitter</>, desc: <>capped</>, tone: "good" },
              { title: <>Retry budget or circuit breaker</>, desc: <>for when it's really down</>, tone: "good" },
              { title: <>Metrics</>, desc: <>timeouts, retries and success-after-retry rates</>, tone: "good" },
            ]}
          />
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Short timeouts:</strong> protect resources and fail fast, but risk cutting off legitimate slow
              requests.
            </li>
            <li>
              <strong>Long timeouts:</strong> fewer false failures, but a risk of resource exhaustion and cascades.
            </li>
            <li>
              <strong>More retries:</strong> better success during brief blips, but amplified load during real outages,
              and higher tail latency.
            </li>
            <li>
              <strong>Fewer retries:</strong> safer under stress, but more user-visible errors for brief blips.
            </li>
            <li>
              <strong>Backoff and jitter:</strong> smoother recovery, but individual requests may wait longer before
              succeeding.
            </li>
            <li>
              <strong>Retrying at the edge vs in the middle:</strong> retrying close to the client gives the best view
              of the user's budget. Retrying close to the dependency is faster and cheaper per attempt.{" "}
              <strong>Pick one.</strong>
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>AWS's "Timeouts, retries, and backoff with jitter."</strong> Amazon's Builders' Library article
            describes how Amazon services use timeouts based on measured latency, limit retries (for example, retrying
            at one layer only), and use jitter. The earlier AWS Architecture Blog post "Exponential Backoff and Jitter"
            compared jitter strategies with simulations, and its advice is now built into the AWS SDKs.
          </p>
          <p>
            <strong>Google SRE's cascading failures.</strong> Google's SRE book describes how overload, missing
            deadlines and retries combine into cascading failures, and recommends <strong>deadline propagation</strong>,{" "}
            <strong>limited retries</strong> and <strong>retry budgets</strong>, all of which are standard features in
            Google's internal RPC system and in gRPC.
          </p>
          <p>
            <strong>Mobile apps reconnecting.</strong> When a popular app's backend restarts, millions of clients
            reconnecting at once can knock it over again. Messaging and social apps use{" "}
            <strong>randomised reconnect delays</strong> (jitter) so reconnections are spread over time.
          </p>
          <p>
            <strong>Payment timeouts.</strong> Payment systems are the classic place where a timeout doesn't mean
            failure: the charge may have succeeded. That's why payment flows combine timeouts with{" "}
            <strong>idempotency keys</strong> and <strong>status checks</strong> ("query the payment by its reference")
            instead of blindly retrying the charge (post 34).
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>How do you choose a timeout value?</>,
                a: (
                  <>
                    <p>
                      From measured latency and the caller's budget: a bit above the dependency's p99 or p99.9 (say
                      300–500 ms if p99 is 120 ms), and never more than the remaining end-to-end budget. Set separate
                      connect and total timeouts, and never rely on library defaults.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is retry amplification, and how do you avoid it?</>,
                a: (
                  <>
                    <p>
                      When every layer retries, attempts multiply: three attempts at four layers is 81 calls at the
                      bottom for one user action, arriving exactly when that service is weakest. Retry at one layer
                      only, cap attempts at 2–3, use retry budgets, honour Retry-After, and add circuit breakers.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why add jitter to exponential backoff?</>,
                a: (
                  <>
                    <p>
                      Without it, clients that failed together retry together in synchronised waves (a thundering herd)
                      that knock the recovering service back down. Randomising the wait — full jitter: random(0, base ×
                      2ⁿ) — spreads retries out and completes the work with fewer total calls.
                    </p>
                  </>
                ),
              },
              {
                q: <>Which errors should you retry?</>,
                a: (
                  <>
                    <p>
                      Transient ones: timeouts, connection resets, 502, 503 and 504, 429 (after Retry-After), deadlocks.
                      Not 400, 401, 403, 404 or 422 — retrying can't fix a bad request — and non-idempotent calls only
                      with an idempotency key.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is deadline propagation?</>,
                a: (
                  <>
                    <p>
                      Passing the remaining time budget along the call chain so each service knows how long it has,
                      skips work that can't finish in time, and cancels in-flight calls once the original caller has
                      given up. gRPC does it natively; with HTTP, use a deadline header.
                    </p>
                  </>
                ),
              },
              {
                q: <>A payment call timed out. Should you retry it?</>,
                a: (
                  <>
                    <p>
                      Not blindly — a timeout doesn't mean it failed; the charge may have gone through. Retry only with
                      the same idempotency key, or first query the payment's status by its reference.
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
              <strong>Every network call needs a timeout</strong>: connect, request and total. Base the values on{" "}
              <strong>measured p99</strong> and the <strong>user's latency budget</strong>.
            </li>
            <li>
              <strong>Propagate deadlines</strong> through service chains, and <strong>stop work</strong> when the
              caller has given up.
            </li>
            <li>
              <strong>Retry only transient errors</strong>, only <strong>idempotent</strong> operations (or with
              idempotency keys), with <strong>2–3 attempts max</strong>, at <strong>one layer</strong>.
            </li>
            <li>
              Beware <strong>retry amplification</strong> (attempts multiply across layers). Use{" "}
              <strong>retry budgets</strong> and circuit breakers.
            </li>
            <li>
              Use <strong>exponential backoff with full jitter</strong>, and add jitter anywhere many clients act on a
              schedule (cron, TTLs, reconnects).
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>The AWS Builders' Library article "Timeouts, retries, and backoff with jitter"</li>
            <li>The AWS Architecture Blog post "Exponential Backoff and Jitter" by Marc Brooker</li>
            <li>
              <em>Site Reliability Engineering</em> by Google (chapter "Addressing Cascading Failures")
            </li>
            <li>Azure Architecture Center pattern "Retry"</li>
            <li>The gRPC documentation on deadlines</li>
            <li>
              <em>Release It!</em> (2nd edition) by Michael Nygard (the chapter on stability patterns: timeouts)
            </li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
