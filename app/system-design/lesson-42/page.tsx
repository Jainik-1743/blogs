import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Compare, Flow, QA, Stats } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import CircuitBreaker from "@/components/sd/widgets/CircuitBreaker";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-42")!;

export const metadata: Metadata = {
  title: `Lesson 42 — ${lesson.title}`,
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

const code1 = `// Resilience4j-style example (Java)
CircuitBreaker cb = CircuitBreaker.of("reviews", CircuitBreakerConfig.custom()
    .failureRateThreshold(50)                          // open at 50% failures
    .slowCallRateThreshold(50)
    .slowCallDurationThreshold(Duration.ofMillis(800))
    .minimumNumberOfCalls(20)
    .waitDurationInOpenState(Duration.ofSeconds(30))    // cool-down
    .permittedNumberOfCallsInHalfOpenState(5)
    .build());

Supplier<List<Review>> call = CircuitBreaker.decorateSupplier(cb, () -> reviewsClient.get(productId));
List<Review> reviews = Try.ofSupplier(call).getOrElse(Collections.emptyList());   // fallback`;

export default function SdLessonFourTwoPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            You've added timeouts and careful retries (post 41). Now the reviews service goes{" "}
            <strong>completely down</strong>. Every product-page request still:
          </p>
          <ol>
            <li>calls reviews,</li>
            <li>waits the full 500 ms timeout,</li>
            <li>maybe retries once, and waits another 500 ms,</li>
            <li>then gives up.</li>
          </ol>
          <p>
            So every product page is now <strong>1 second slower</strong>. At 5,000 requests per second, that's
            thousands of threads tied up <strong>waiting for a service you already know is dead</strong>, and those
            threads are shared with pricing, stock and checkout calls. Soon <strong>everything</strong> is slow.
          </p>
          <p>
            Timeouts limit how long you wait <strong>per call</strong>. What's missing is a way to{" "}
            <strong>stop calling a dependency that's clearly broken</strong>, and to make sure one bad dependency{" "}
            <strong>can't use up all your resources</strong>. That's what <strong>circuit breakers</strong> and{" "}
            <strong>bulkheads</strong> do.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            <strong>Circuit breaker, like the one in your home's electrical panel.</strong> When there's a dangerous
            fault (a short circuit), the breaker <strong>trips</strong> and cuts the power instantly, protecting the
            wiring and the house. After the problem is fixed, you <strong>reset</strong> it. In software, a circuit
            breaker watches calls to a dependency. When too many fail, it <strong>trips</strong> and{" "}
            <strong>stops sending calls for a while</strong>, failing fast instead of waiting. Then it carefully{" "}
            <strong>tests</strong> whether the dependency has recovered.
          </p>
          <p>
            <strong>Bulkhead, like the compartments in a ship.</strong> Ships are divided into{" "}
            <strong>watertight compartments</strong> (bulkheads). If the hull is breached, only <strong>one</strong>{" "}
            compartment floods, and the ship stays afloat. In software, a bulkhead gives each dependency its{" "}
            <strong>own separate pool</strong> of resources (threads, connections, instances), so one failing dependency
            can only exhaust <strong>its own</strong> pool, not everyone's.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="circuit-breaker-three-states">Circuit breaker: three states</h3>
          <CircuitBreaker caption="Drive a circuit breaker by hand. Send calls, make the downstream service sick, and watch it trip, fail fast, test and recover." />
          <p>
            <strong>1. Closed (normal).</strong> Calls go through as usual. The breaker <strong>counts</strong>{" "}
            successes, failures and slow calls in a rolling window, such as the last 100 calls or the last 10 seconds.
          </p>
          <p>
            <strong>2. Open (tripped).</strong> When failures cross a <strong>threshold</strong> (for example, "more
            than 50% failed, with at least 20 calls in the window"), the breaker <strong>opens</strong>. Now{" "}
            <strong>every call fails immediately</strong>, without contacting the dependency. The app returns a{" "}
            <strong>fallback</strong> or a fast error.
          </p>
          <ul>
            <li>
              The dependency gets <strong>breathing room</strong> to recover, with no pile of requests hitting it.
            </li>
            <li>
              Your service <strong>doesn't waste threads</strong> waiting on timeouts.
            </li>
          </ul>
          <p>
            <strong>3. Half-open (testing).</strong> After a <strong>cool-down period</strong> (for example, 30
            seconds), the breaker lets <strong>a few test calls</strong> through.
          </p>
          <ul>
            <li>
              If they <strong>succeed</strong>, the breaker goes back to <strong>closed</strong>.
            </li>
            <li>
              If they <strong>fail</strong>, it goes back to <strong>open</strong> for another cool-down.
            </li>
          </ul>
          <h3 id="what-counts-as-a-failure">What counts as a failure?</h3>
          <ul>
            <li>Errors: exceptions, 5xx responses, connection failures.</li>
            <li>
              <strong>Timeouts.</strong>
            </li>
            <li>
              <strong>Slow calls.</strong> Many libraries can trip on "more than X% of calls slower than 2 seconds",
              because slowness is often the first sign of trouble.
            </li>
            <li>
              Usually <strong>not</strong> client errors like <code>400</code> or <code>404</code>. Those mean the
              request was wrong, not that the dependency is unhealthy.
            </li>
          </ul>
          <h3 id="fallbacks-what-to-do-when-the-circuit-is-open">Fallbacks: what to do when the circuit is open</h3>
          <p>
            A circuit breaker is only as good as its <strong>fallback</strong>:
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Dependency down</th>
                  <th>Fallback</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Recommendations</td>
                  <td>Show "popular items" from a cache, or hide the section</td>
                </tr>
                <tr>
                  <td>Reviews</td>
                  <td>Hide reviews, show "Reviews temporarily unavailable"</td>
                </tr>
                <tr>
                  <td>Profile pictures</td>
                  <td>Show default avatars</td>
                </tr>
                <tr>
                  <td>Exchange rates</td>
                  <td>Use the last known cached rate (with a timestamp)</td>
                </tr>
                <tr>
                  <td>Search</td>
                  <td>Show a simpler category browse</td>
                </tr>
                <tr>
                  <td>Payments</td>
                  <td>
                    <strong>No fake fallback!</strong> Show a clear error: "Payment is temporarily unavailable, please
                    try again"
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>Never fake success</strong> for critical operations. A fallback should <strong>degrade</strong> the
            experience honestly, not hide a real failure (post 44).
          </p>
          <CodeBlock lang="java" code={code1} />
          <h3 id="bulkheads-isolate-resources">Bulkheads: isolate resources</h3>
          <p>
            Without bulkheads, <strong>one shared pool</strong> serves every dependency:
          </p>
          <Stats
            caption="Without bulkheads, one slow dependency starves everyone."
            stats={[
              { value: <>200</>, label: <>shared threads</>, sub: <>one pool for every dependency</> },
              { value: <>200</>, label: <>held by reviews</>, sub: <>slow calls pile up and never let go</> },
              { value: <>0</>, label: <>left for pricing and stock</>, sub: <>so checkout slows too</> },
            ]}
          />
          <p>
            With bulkheads, <strong>each dependency has its own limit</strong>:
          </p>
          <Compare
            caption="With bulkheads, each dependency can only exhaust its own pool."
            columns={[
              {
                title: <>reviews pool (30)</>,
                items: [
                  { sign: "-", text: <>FULL — extra calls rejected at once</> },
                  { sign: "+", text: <>Goes straight to the fallback: hide reviews</> },
                ],
              },
              { title: <>pricing pool (50)</>, items: [{ sign: "+", text: <>Working normally ✅</> }] },
              { title: <>stock pool (50)</>, items: [{ sign: "+", text: <>Working normally ✅</> }] },
            ]}
          />
          <p>
            Reviews can only ever use its 30 slots. When they're full, extra review calls are{" "}
            <strong>rejected immediately</strong> (and go to the fallback), and pricing and stock keep working.
          </p>
          <p>
            <strong>Ways to build bulkheads:</strong>
          </p>
          <ul>
            <li>
              <strong>Separate thread pools or concurrency limits (semaphores)</strong> per dependency.
            </li>
            <li>
              <strong>Separate connection pools</strong> per database or downstream service.
            </li>
            <li>
              <strong>Separate queues and workers</strong> per job type (like the priority queues in post 38).
            </li>
            <li>
              <strong>Separate instances or clusters</strong> for critical vs non-critical traffic. For example, a
              dedicated set of servers for checkout, isolated from browsing traffic.
            </li>
            <li>
              <strong>Per-tenant limits</strong>, so one noisy customer can't use all the capacity (like the cells and
              shuffle sharding in post 40).
            </li>
            <li>
              <strong>Kubernetes resource limits</strong> per container, so one runaway service can't eat a whole node's
              CPU and memory.
            </li>
          </ul>
          <h3 id="how-the-patterns-work-together">How the patterns work together</h3>
          <Flow
            caption="The patterns stacked around one dependency, outermost first."
            dir="row"
            nodes={[
              { title: <>Request</> },
              { title: <>Bulkhead</>, desc: <>max 30 concurrent</> },
              { title: <>Circuit breaker</>, desc: <>open → fail fast</> },
              { title: <>Timeout</>, desc: <>500 ms</> },
              { title: <>Retry</>, desc: <>×1 with jitter</> },
              { title: <>Reviews service</>, tone: "good" },
            ]}
          />
          <ul>
            <li>
              <strong>Timeouts</strong> limit each call.
            </li>
            <li>
              <strong>Retries</strong> handle brief blips.
            </li>
            <li>
              <strong>Circuit breakers</strong> stop calls to a clearly broken dependency.
            </li>
            <li>
              <strong>Bulkheads</strong> stop any one dependency from exhausting shared resources.
            </li>
            <li>
              <strong>Fallbacks</strong> keep the user experience as good as possible.
            </li>
          </ul>
          <h3 id="where-to-put-them">Where to put them</h3>
          <ul>
            <li>
              <strong>In application code</strong>, with libraries: <strong>Resilience4j</strong> (Java),{" "}
              <strong>Polly</strong> (.NET), <strong>opossum</strong> (Node.js), <strong>pybreaker</strong> (Python) and{" "}
              <strong>gobreaker</strong> (Go).
            </li>
            <li>
              <strong>In the network layer</strong>, with a proxy or service mesh. <strong>Envoy</strong>,{" "}
              <strong>Istio</strong> and <strong>Linkerd</strong> offer circuit breaking (connection and request limits)
              and <strong>outlier detection</strong>, which temporarily removes individual unhealthy hosts from load
              balancing. No code changes are needed, but it's less aware of your business fallbacks.
            </li>
          </ul>
          <p>Many systems use both: the mesh for generic protection, the app for smart fallbacks.</p>
          <h3 id="pitfalls">Pitfalls</h3>
          <ul>
            <li>
              <strong>Breakers that hide problems.</strong> An open breaker plus a quiet fallback can mask an outage for
              hours. <strong>Alert when breakers open.</strong>
            </li>
            <li>
              <strong>Wrong scope.</strong> One breaker for a whole service can trip because of{" "}
              <strong>one bad host</strong>, and a per-host breaker may miss a service-wide problem. Choose deliberately
              (outlier detection is often per host).
            </li>
            <li>
              <strong>Thresholds too sensitive</strong>, so the breaker trips on normal noise. Use a{" "}
              <strong>minimum number of calls</strong> and rolling windows.
            </li>
            <li>
              <strong>Thresholds too relaxed</strong>, so the breaker never trips in time to help.
            </li>
            <li>
              <strong>No fallback</strong>, so an open breaker just returns errors faster. That's still better than
              hanging, but plan real fallbacks for non-critical features.
            </li>
            <li>
              <strong>Bulkheads sized badly.</strong> If they're too small, you reject requests in normal peaks. Size
              them from <strong>Little's Law</strong> (post 8): concurrency ≈ requests per second × latency.
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Circuit breakers:</strong> fail fast, protect the dependency and preserve your resources, but add
              tuning, states to reason about, and possibly <strong>false trips</strong>.
            </li>
            <li>
              <strong>Bulkheads:</strong> strong isolation, so one failure stays contained, but resources are{" "}
              <strong>reserved per pool</strong>, so idle pools can't lend capacity to busy ones.
            </li>
            <li>
              <strong>Fallbacks:</strong> a better user experience during failures, but extra code paths to build and{" "}
              <strong>test</strong>. Untested fallbacks often fail too.
            </li>
            <li>
              <strong>Mesh-level vs app-level:</strong> no code changes vs business-aware behaviour. It's often best to
              use both.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>
              Michael Nygard's <em>Release It!</em>
            </strong>{" "}
            (first published in 2007) popularised the circuit breaker and bulkhead patterns for software, based on real
            production failures, like a single slow integration that locked up an entire retail site. Martin Fowler's
            short article "CircuitBreaker" made the pattern widely known.
          </p>
          <p>
            <strong>Netflix Hystrix.</strong> Netflix built <strong>Hystrix</strong> around 2012 to wrap every call to a
            dependency with <strong>timeouts, circuit breakers, bulkheads (separate thread pools) and fallbacks</strong>
            , because with hundreds of dependencies, <em>something</em> was always failing. Hystrix was later put into
            maintenance mode, and Netflix and the community recommended newer tools like <strong>Resilience4j</strong>{" "}
            and adaptive concurrency limits. The ideas live on everywhere.
          </p>
          <p>
            <strong>Envoy and service meshes.</strong> Envoy (post 13) includes circuit-breaking limits (maximum
            connections, pending requests, retries) and outlier detection, and meshes like Istio expose these as
            configuration. Many companies get baseline bulkheads and breakers "for free" through their mesh.
          </p>
          <p>
            <strong>Degraded pages on big sites.</strong> When a major e-commerce or streaming site has trouble, you
            often see <strong>parts</strong> of pages disappear (recommendations, "customers also bought", reviews)
            while browsing and checkout keep working. That's circuit breakers and fallbacks doing their job.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>Explain the three states of a circuit breaker.</>,
                a: (
                  <>
                    <p>
                      Closed: calls pass through while failures and slow calls are counted in a rolling window. Open:
                      once a threshold is crossed, calls fail immediately without touching the dependency, for a
                      cool-down period. Half-open: a few trial calls are allowed; success closes the breaker, failure
                      re-opens it.
                    </p>
                  </>
                ),
              },
              {
                q: <>What's the difference between a timeout and a circuit breaker?</>,
                a: (
                  <>
                    <p>
                      A timeout bounds how long one call may wait. A circuit breaker looks across many calls and, once a
                      dependency is clearly unhealthy, stops making calls at all — saving threads and giving the
                      dependency room to recover.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is a bulkhead?</>,
                a: (
                  <>
                    <p>
                      Isolating resources per dependency, workload or tenant — separate thread pools, concurrency
                      limits, connection pools, queues or instances — so one slow or failing part can only exhaust its
                      own share, not the whole service.
                    </p>
                  </>
                ),
              },
              {
                q: <>What makes a good fallback?</>,
                a: (
                  <>
                    <p>
                      An honest, degraded experience for non-critical features: cached or popular items instead of
                      recommendations, hiding reviews, default avatars, the last known exchange rate with a timestamp.
                      For critical actions like payments, fail clearly instead of faking success.
                    </p>
                  </>
                ),
              },
              {
                q: <>How would you size a bulkhead?</>,
                a: (
                  <>
                    <p>
                      With Little's Law: concurrency ≈ requests per second to that dependency × its normal latency, plus
                      headroom. Too small rejects normal peaks; too large stops protecting everyone else.
                    </p>
                  </>
                ),
              },
              {
                q: <>What's the risk of circuit breakers in production?</>,
                a: (
                  <>
                    <p>
                      A quiet fallback can hide an outage for hours, and badly tuned thresholds cause false trips or
                      trip too late. Alert whenever a breaker opens, require a minimum call volume before tripping, and
                      test fallbacks regularly.
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
              A <strong>circuit breaker</strong> watches failures and slow calls. It <strong>opens</strong> to fail
              fast, then goes <strong>half-open</strong> to test recovery, and <strong>closes</strong> when the
              dependency is healthy.
            </li>
            <li>
              Always pair breakers with sensible <strong>fallbacks</strong>, and <strong>never fake success</strong> for
              critical actions like payments.
            </li>
            <li>
              A <strong>bulkhead</strong> gives each dependency, tenant or workload its{" "}
              <strong>own limited pool</strong>, so one failure can't exhaust everything.
            </li>
            <li>
              Combine <strong>timeouts + limited retries + circuit breakers + bulkheads + fallbacks</strong>, in code
              (Resilience4j, Polly…) and/or in the mesh (Envoy, Istio).
            </li>
            <li>
              <strong>Alert when breakers open</strong>, size bulkheads with <strong>Little's Law</strong>, and{" "}
              <strong>test fallbacks</strong>.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>Martin Fowler's article "CircuitBreaker"</li>
            <li>Azure Architecture Center patterns "Circuit Breaker" and "Bulkhead"</li>
            <li>
              <em>Release It!</em> (2nd edition) by Michael Nygard (the chapters on "Circuit Breaker" and "Bulkheads")
            </li>
            <li>The Resilience4j documentation</li>
            <li>The Netflix Hystrix wiki page "How it Works" (for the history and ideas)</li>
            <li>The Envoy documentation on circuit breaking and outlier detection</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
