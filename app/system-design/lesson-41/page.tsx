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

const code3 = `wait = base × 2^(attempt − 1)       (attempt counts from 1; capped at some maximum)

base = 100 ms:
  attempt 1 → 100 ms
  attempt 2 → 200 ms
  attempt 3 → 400 ms
  attempt 4 → 800 ms
  attempt 5 → 1.6 s  … up to a cap (e.g., 10–30 s for background work)`;

const code4 = `(Here "attempt" counts from 0, so the first retry waits at most the base time.)

Full jitter (recommended default):
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
            The recommendations service slows down. It does not fail. It just takes <strong>30 seconds</strong> to answer
            instead of 50 ms. Here is what happens next:
          </p>
          <ol>
            <li>
              The product-page service calls it <strong>without a timeout</strong> (a limit on how long to wait), so each
              request waits 30 seconds.
            </li>
            <li>
              All of the product service's threads fill up with waiting requests (post 4). A thread is one worker that
              handles one request at a time. Little's Law (post 8) says that slow requests need many more workers.
            </li>
            <li>
              The product service stops answering, and <strong>the homepage and checkout break too</strong>, because
              they call the product service.
            </li>
            <li>
              Clients see errors and <strong>retry</strong> (send the request again), which doubles or triples the load.
            </li>
            <li>
              The recommendations service is already struggling. It gets <strong>even more</strong> traffic and stops
              working completely.
            </li>
          </ol>
          <p>
            One slow dependency (a service you call) took down the whole site. This is a{" "}
            <strong>cascading failure</strong>: one failure causes the next, like falling dominoes. The two most common
            causes are <strong>missing timeouts</strong> and <strong>naive retries</strong> (retries with no limits).
            Getting these two right is one of the most valuable reliability skills.
          </p>
          <Timeline
            caption="Anatomy of a cascading failure, starting from one slow service."
            events={[
              {
                time: <>t = 0</>,
                text: <>recommendations slows from 50 ms to 30 s — it does not fail, it just hangs</>,
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
              <strong>A timeout</strong> is a limit on how long you wait. It is like deciding "<strong>if nobody
              answers in 2 minutes, I will hang up</strong>". Without that rule, you could sit on hold forever while
              everything else in your day waits.
            </li>
            <li>
              <strong>A retry</strong> is calling again after you hang up. This makes sense <em>if</em> the problem was
              short.
            </li>
            <li>
              <strong>Backoff</strong> means waiting <strong>longer between each attempt</strong>: 1 minute, then 5, then
              15. If the line is overloaded, calling back at once only makes the queue longer.
            </li>
            <li>
              <strong>Jitter</strong> means adding a bit of <strong>randomness</strong> to when you call back. Say the
              line went down at 10:00 and <strong>everyone</strong> calls back at exactly 10:05. It crashes again. If
              people call back at random times between 10:03 and 10:10, the line copes.
            </li>
          </ul>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="part-1-timeouts">Part 1: Timeouts</h3>
          <p>
            <strong>Every network call needs a timeout.</strong> Many libraries and HTTP clients have{" "}
            <strong>no timeout, or a very long one, by default</strong>. Always set timeouts yourself.
          </p>
          <p>
            <strong>Types of timeouts:</strong>
          </p>
          <ul>
            <li>
              <strong>Connect timeout:</strong> how long to wait to <strong>open</strong> the connection. It is usually
              short (like 100 ms–1 s), because a healthy server accepts quickly.
            </li>
            <li>
              <strong>Read (response) timeout:</strong> how long to wait for data after the connection is open. In some
              tools, such as Python requests, this is the wait between pieces of data, not the whole download.
            </li>
            <li>
              <strong>Total (request) timeout:</strong> the overall limit for the whole call, including retries if you
              count them together.
            </li>
            <li>
              <strong>Idle timeouts</strong> close keep-alive connections (connections kept open for reuse) that nobody
              uses. <strong>Pool acquire timeouts</strong> limit how long to wait for a free connection from a pool (a
              ready-made set of connections that many requests share).
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
              Look at the dependency's <strong>p99 or p99.9 latency</strong> (post 8). Latency is the time a call takes.
              p99 is the time that 99 out of 100 calls beat. If p99 is 120 ms, a timeout of about{" "}
              <strong>300–500 ms</strong> leaves room for normal slow calls and still cuts off calls that are really
              stuck.
            </li>
            <li>
              <strong>Too short:</strong> you time out on requests that are slow but normal. This creates extra retries
              (false failures).
            </li>
            <li>
              <strong>Too long:</strong> stuck calls hold resources and cause cascading failures.
            </li>
          </ul>
          <p>
            Also think about <strong>how long the user will wait</strong>. If the whole page must load in 1 second, one
            dependency cannot be allowed 5 seconds.
          </p>
          <h3 id="deadline-propagation">Deadline propagation</h3>
          <p>
            <strong>Deadline propagation</strong> means passing the remaining time along the chain. In a chain of
            services, each step (hop) should know <strong>how much time is left</strong>:
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
            If the product service has only 200 ms left, it should not start a call that normally takes 400 ms. It
            should <strong>fail fast</strong> (give an error at once) or use a fallback (a simpler backup answer). gRPC
            has deadlines built in (post 31). In most languages you pass the incoming deadline on to the next call. With
            plain HTTP, you can send a deadline in a header.
          </p>
          <p>
            <strong>Stop work when the caller has given up.</strong> If the user closed the page, or the service that called you (the upstream) has timed
            out, then going on with the work is a waste. Use cancellation (a way to tell running work to stop) where
            your framework supports it.
          </p>
          <h3 id="part-2-retries">Part 2: Retries</h3>
          <p>
            A retry sends the same request again after a failure. Retries turn <strong>temporary</strong> failures
            into successes. But if you use them carelessly, they turn small problems into <strong>outages</strong>.
          </p>
          <p>
            <strong>When to retry:</strong>
          </p>
          <ul>
            <li>
              ✅ <strong>Transient errors:</strong> timeouts, connection resets, <code>503 Service Unavailable</code>,{" "}
              <code>429 Too Many Requests</code> (after the <code>Retry-After</code> delay, a header in which the server
              says how long to wait), <code>502/504</code> from a proxy, and database deadlocks (two transactions that
              wait for each other).
            </li>
            <li>
              ❌ <strong>Permanent errors:</strong> <code>400</code>, <code>401</code>, <code>403</code>,{" "}
              <code>404</code>, <code>422</code>, validation failures. Retrying will not help.
            </li>
          </ul>
          <p>
            <strong>Only retry safe operations:</strong>
          </p>
          <ul>
            <li>
              <strong>Idempotent</strong> operations are safe to retry. Idempotent means that doing it many times has the
              same result as doing it once. GET, PUT and DELETE are idempotent.
            </li>
            <li>
              <strong>Non-idempotent</strong> operations (POST, "charge card") are safe to retry{" "}
              <strong>only with idempotency keys</strong> (post 34). An idempotency key is a unique label that lets the
              server spot a repeated request.
            </li>
          </ul>
          <h3 id="retry-amplification">Retry amplification</h3>
          <p>
            Here is the hidden danger, called <strong>retry amplification</strong>: retries at many layers multiply.
            Imagine <strong>each layer</strong> makes <strong>3 attempts</strong> (1 try + 2 retries):
          </p>
          <Stats
            caption="Retry amplification. Three attempts at each of four layers."
            stats={[
              { value: <>3 × 3 × 3 × 3</>, label: <>attempts multiply</>, sub: <>one per layer</> },
              { value: <>81</>, label: <>calls to the database</>, sub: <>for one user action</> },
              {
                value: <>4⁵ = 1,024</>,
                label: <>with 4 attempts over 5 layers</>,
                sub: <>exactly when it is already struggling</>,
              },
            ]}
          />
          <p>
            With 4 attempts per layer across 5 layers, that's 4⁵ = <strong>1,024</strong> calls to the bottom service
            for one user action. When the bottom service is <strong>already struggling</strong>, this
            multiplication finishes it off.
          </p>
          <p>Rules to prevent amplification:</p>
          <ol>
            <li>
              <strong>Retry at one layer only</strong>, usually the one closest to the failure or to the edge. Do not
              retry at every layer.
            </li>
            <li>
              <strong>Cap attempts</strong>, which means set a maximum. Usually 2–3 in total.
            </li>
            <li>
              <strong>Use retry budgets.</strong> A retry budget is a limit on how many retries you allow. For example,
              retries may add at most <strong>10% extra load</strong>. If more than 10% of recent requests are already
              retries, stop retrying and fail fast. (Envoy, gRPC retry throttling and some libraries support this.)
            </li>
            <li>
              <strong>
                Honour <code>Retry-After</code>
              </strong>{" "}
              from servers. This means: wait at least as long as the server asks.
            </li>
            <li>
              <strong>Combine with circuit breakers</strong> (post 42). A circuit breaker stops calls to a dependency that
              is clearly down, like a fuse that cuts the power.
            </li>
          </ol>
          <h3 id="part-3-exponential-backoff">Part 3: Exponential backoff</h3>
          <p>
            <strong>Exponential backoff</strong> means that the wait doubles after each failure. Do not retry at once.{" "}
            <strong>Wait longer after each failure:</strong>
          </p>
          <CodeBlock code={code3} />
          <p>
            This gives the struggling service <strong>time to recover</strong>, and it lowers the load while the service
            recovers.
          </p>
          <h3 id="part-4-jitter">Part 4: Jitter</h3>
          <p>
            Backoff alone has a flaw. Say 10,000 clients all fail at <strong>the same moment</strong> (for example,
            the database had a short problem). They all retry at <strong>exactly</strong> 100 ms, then 200 ms, then 400
            ms. They stay <strong>in step</strong> and arrive in waves, and every wave hits the server at once. This is
            the <strong>thundering herd</strong> (a huge crowd of clients that all act at the same moment).
          </p>
          <Backoff caption="Forty clients fail at the same instant. Switch strategies and watch how retries hit the recovering server." />
          <p>
            <strong>Jitter</strong> adds random time to the wait, so clients no longer act together. The most common
            forms:
          </p>
          <CodeBlock code={code4} />
          <p>
            AWS tested these variants and found that <strong>full jitter</strong> and{" "}
            <strong>decorrelated jitter</strong> spread the load much better than plain exponential backoff. They also
            finish the work with far fewer total calls.
          </p>
          <CodeBlock lang="js" code={code5} />
          <p>
            <strong>Jitter is not only for retries.</strong> Use it anywhere many clients act on a schedule:
          </p>
          <ul>
            <li>
              <strong>cron jobs</strong> (jobs that run on a time schedule) across thousands of servers,
            </li>
            <li>
              <strong>cache TTLs</strong> (the time after which a cached item expires; many items that expire together
              cause the cache avalanche in post 16),
            </li>
            <li>
              <strong>client reconnects</strong> after a WebSocket server restarts (a WebSocket is a long-lived
              connection, post 33),
            </li>
            <li>
              <strong>mobile apps that sync</strong> "every hour".
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
              { title: <>Retry budget or circuit breaker</>, desc: <>for when it is really down</>, tone: "good" },
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
              <strong>More retries:</strong> better success during short problems, but more load during real outages,
              and a higher tail latency (the time of the slowest requests).
            </li>
            <li>
              <strong>Fewer retries:</strong> safer under stress, but users see more errors during short problems.
            </li>
            <li>
              <strong>Backoff and jitter:</strong> smoother recovery, but a single request may wait longer before it
              succeeds.
            </li>
            <li>
              <strong>Retrying at the edge vs in the middle:</strong> retrying close to the client gives the best view
              of the user's time budget. Retrying close to the dependency is faster and cheaper per attempt.{" "}
              <strong>Pick one layer.</strong>
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>AWS's "Timeouts, retries, and backoff with jitter."</strong> Amazon's Builders' Library article
            describes how Amazon services set timeouts from measured latency, limit retries (for example, retry at one
            layer only), and use jitter. An earlier AWS Architecture Blog post, "Exponential Backoff and Jitter",
            compared jitter strategies with simulations. The AWS SDKs now use exponential backoff with jitter.
          </p>
          <p>
            <strong>Google SRE's cascading failures.</strong> Google's SRE book (SRE means site reliability engineering) describes how overload,
            missing deadlines and retries together cause cascading failures. It recommends{" "}
            <strong>deadline propagation</strong>, <strong>limited retries</strong> and <strong>retry budgets</strong>.
            Similar ideas are built into gRPC.
          </p>
          <p>
            <strong>Mobile apps reconnecting.</strong> When a popular app's backend restarts, millions of clients
            may reconnect at once and knock it down again. Messaging and social apps use{" "}
            <strong>random reconnect delays</strong> (jitter), so the reconnections are spread over time.
          </p>
          <p>
            <strong>Payment timeouts.</strong> Payment systems are the classic case where a timeout does not mean
            failure: the charge may have worked. This is why payment flows combine timeouts with{" "}
            <strong>idempotency keys</strong> and <strong>status checks</strong> ("look up the payment by its
            reference") instead of retrying the charge without thinking (post 34).
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
                      Use measured latency and the caller's time budget. Set it a bit above the dependency's p99 or
                      p99.9 (say 300–500 ms if p99 is 120 ms), and never more than the time left in the whole request.
                      Set separate connect and total timeouts, and never rely on library defaults.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is retry amplification, and how do you avoid it?</>,
                a: (
                  <>
                    <p>
                      When every layer retries, the attempts multiply. Three attempts at four layers is 81 calls at the
                      bottom for one user action, and they arrive exactly when that service is weakest. To avoid it:
                      retry at one layer only, cap attempts at 2–3, use retry budgets, honour Retry-After, and add
                      circuit breakers.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why add jitter to exponential backoff?</>,
                a: (
                  <>
                    <p>
                      Without it, clients that failed together retry together in waves (a thundering herd), and the
                      waves knock the recovering service down again. Make the wait random. Full jitter is random(0,
                      base × 2ⁿ). It spreads the retries out and finishes the work with fewer total calls.
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
                      Do not retry 400, 401, 403, 404 or 422, because retrying cannot fix a bad request. Retry
                      non-idempotent calls only with an idempotency key.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is deadline propagation?</>,
                a: (
                  <>
                    <p>
                      You pass the remaining time budget along the call chain. So each service knows how long it has,
                      skips work that cannot finish in time, and cancels calls in progress once the original caller has
                      given up. gRPC has this built in. With HTTP, use a deadline header.
                    </p>
                  </>
                ),
              },
              {
                q: <>A payment call timed out. Should you retry it?</>,
                a: (
                  <>
                    <p>
                      Not blindly. A timeout does not mean it failed, because the charge may have gone through. Retry
                      only with the same idempotency key, or first look up the payment's status by its reference.
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
