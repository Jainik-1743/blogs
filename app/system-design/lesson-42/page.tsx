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
            You have added timeouts and careful retries (post 41). Now the reviews service goes{" "}
            <strong>completely down</strong>. Every product-page request still does this:
          </p>
          <ol>
            <li>calls reviews,</li>
            <li>waits the full 500 ms timeout (the longest time it will wait),</li>
            <li>maybe retries once, and waits another 500 ms,</li>
            <li>then gives up.</li>
          </ol>
          <p>
            So every product page is now <strong>1 second slower</strong>. At 5,000 requests per second, thousands of
            threads are stuck <strong>waiting for a service that you already know is dead</strong>. (A thread is one
            worker that handles one request at a time.) Those threads are shared with pricing, stock and checkout
            calls. Soon <strong>everything</strong> is slow.
          </p>
          <p>
            Timeouts limit how long you wait <strong>per call</strong>. What is missing is a way to{" "}
            <strong>stop calling a dependency that is clearly broken</strong>. A dependency is another service that you
            call. You also need to make sure that one bad dependency <strong>cannot use up all your resources</strong>.
            That is what <strong>circuit breakers</strong> and <strong>bulkheads</strong> do.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            <strong>A circuit breaker is like the one in your home's electrical panel.</strong> When there is a
            dangerous fault (a short circuit), the breaker <strong>trips</strong> and cuts the power at once. This
            protects the wiring and the house. After the problem is fixed, you <strong>reset</strong> it. In software,
            a circuit breaker is a small piece of code that watches the calls to a dependency. When too many calls
            fail, it <strong>trips</strong> and <strong>stops sending calls for a while</strong>. It returns an error
            at once (this is called failing fast) instead of waiting. Then it carefully <strong>tests</strong> whether
            the dependency has recovered.
          </p>
          <p>
            <strong>A bulkhead is like the compartments in a ship.</strong> Ships are divided into{" "}
            <strong>watertight compartments</strong> (bulkheads). If the hull is damaged, only <strong>one</strong>{" "}
            compartment fills with water, and the ship stays afloat. In software, a bulkhead gives each dependency its{" "}
            <strong>own separate pool</strong> of resources (threads, connections, instances). A pool is a fixed set of
            items that can be shared and reused. So one failing dependency can use up only <strong>its own</strong>{" "}
            pool, not everyone's.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="circuit-breaker-three-states">Circuit breaker: three states</h3>
          <CircuitBreaker caption="Drive a circuit breaker by hand. Send calls, make the downstream service sick, and watch it trip, fail fast, test and recover." />
          <p>
            <strong>1. Closed (normal).</strong> Calls go through as usual. The breaker <strong>counts</strong>{" "}
            successes, failures and slow calls in a rolling window. A rolling window is the most recent set of calls,
            such as the last 100 calls or the last 10 seconds.
          </p>
          <p>
            <strong>2. Open (tripped).</strong> When failures cross a <strong>threshold</strong> (a limit; for example, "more
            than 50% failed, with at least 20 calls in the window"), the breaker <strong>opens</strong>. Now{" "}
            <strong>every call fails immediately</strong>, without contacting the dependency. The app returns a{" "}
            <strong>fallback</strong> (a simpler backup answer) or a fast error.
          </p>
          <ul>
            <li>
              The dependency gets <strong>space to breathe</strong> and recover, because no pile of requests hits it.
            </li>
            <li>
              Your service <strong>does not waste threads</strong> on waiting for timeouts.
            </li>
          </ul>
          <p>
            <strong>3. Half-open (testing).</strong> After a <strong>cool-down period</strong> (a wait time; for example, 30
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
              Usually <strong>not</strong> client errors like <code>400</code> or <code>404</code>. Those mean that the
              request was wrong. They do not mean that the dependency is unhealthy.
            </li>
          </ul>
          <h3 id="fallbacks-what-to-do-when-the-circuit-is-open">Fallbacks: what to do when the circuit is open</h3>
          <p>
            A circuit breaker is only as good as its <strong>fallback</strong>. A fallback is what you do instead when
            the real call is not possible:
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
            experience in an honest way (give a simpler result), and not hide a real failure (post 44).
          </p>
          <CodeBlock lang="java" code={code1} />
          <h3 id="bulkheads-isolate-resources">Bulkheads: isolate resources</h3>
          <p>
            Without bulkheads, <strong>one shared pool</strong> serves every dependency. The pool is limited, so it can run
            out:
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
            Reviews can only ever use its 30 slots. When they are full, extra review calls are{" "}
            <strong>rejected at once</strong> (and go to the fallback), and pricing and stock keep working.
          </p>
          <p>
            <strong>Ways to build bulkheads:</strong>
          </p>
          <ul>
            <li>
              <strong>Separate thread pools or concurrency limits (semaphores)</strong> per dependency. A semaphore is a
              counter that allows only a fixed number of calls at the same time.
            </li>
            <li>
              <strong>Separate connection pools</strong> per database or downstream service (a downstream service is one
              that you call).
            </li>
            <li>
              <strong>Separate queues and workers</strong> per job type (like the priority queues in post 38).
            </li>
            <li>
              <strong>Separate instances or clusters</strong> (groups of servers) for critical and non-critical traffic.
              For example, a dedicated set of servers for checkout, kept apart from browsing traffic.
            </li>
            <li>
              <strong>Per-tenant limits</strong> (a tenant is one customer or one customer account), so one noisy
              customer cannot use all the capacity (like the cells and shuffle sharding in post 40).
            </li>
            <li>
              <strong>Kubernetes resource limits</strong> per container, so one runaway service cannot eat all the CPU and
              memory of a node (a node is one machine in the cluster).
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
              <strong>Retries</strong> handle short problems.
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
              <strong>In the network layer</strong>, with a proxy or a service mesh. A proxy is a server that passes
              traffic on. A service mesh is a set of proxies that manage traffic between your services.{" "}
              <strong>Envoy</strong>, <strong>Istio</strong> and <strong>Linkerd</strong> offer circuit breaking
              (limits on connections and requests) and <strong>outlier detection</strong>, which removes single
              unhealthy hosts from load balancing for a while. You need no code changes, but it knows less about your
              business fallbacks.
            </li>
          </ul>
          <p>Many systems use both: the mesh for general protection, and the app for smart fallbacks.</p>
          <h3 id="pitfalls">Pitfalls</h3>
          <ul>
            <li>
              <strong>Breakers that hide problems.</strong> An open breaker with a quiet fallback can hide an outage for
              hours. <strong>Send an alert when a breaker opens.</strong>
            </li>
            <li>
              <strong>Wrong scope.</strong> One breaker for a whole service can trip because of{" "}
              <strong>one bad host</strong>. A breaker for each host may miss a problem that affects the whole service.
              Choose with care (outlier detection often works per host).
            </li>
            <li>
              <strong>Thresholds too sensitive</strong>, so the breaker trips on normal small errors. Use a{" "}
              <strong>minimum number of calls</strong> and rolling windows.
            </li>
            <li>
              <strong>Thresholds too loose</strong>, so the breaker does not trip in time to help.
            </li>
            <li>
              <strong>No fallback</strong>, so an open breaker only returns errors faster. That is still better than
              hanging, but plan real fallbacks for non-critical features.
            </li>
            <li>
              <strong>Bulkheads with the wrong size.</strong> If they are too small, you reject requests during normal
              busy times. Work out the size with <strong>Little's Law</strong> (post 8): concurrency ≈ requests per
              second × latency. (Latency is how long one call takes. Concurrency is how many calls run at once.)
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Circuit breakers:</strong> they fail fast, protect the dependency and save your resources. But they
              need tuning, add states to think about, and may cause <strong>false trips</strong> (a trip when the
              dependency was fine).
            </li>
            <li>
              <strong>Bulkheads:</strong> strong isolation, so one failure stays contained, but resources are{" "}
              <strong>reserved per pool</strong>, so idle pools cannot lend capacity to busy ones.
            </li>
            <li>
              <strong>Fallbacks:</strong> a better user experience during failures, but extra code paths to build and{" "}
              <strong>test</strong>. Fallbacks that were never tested often fail too.
            </li>
            <li>
              <strong>Mesh-level vs app-level:</strong> no code changes, or behaviour that knows your business. It is
              often best to use both.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>
              Michael Nygard's <em>Release It!</em>
            </strong>{" "}
            (first published in 2007) made the circuit breaker and bulkhead patterns popular for software. The book is
            based on real production failures, such as one slow integration that froze a whole retail site. Martin
            Fowler's short article "CircuitBreaker" made the pattern widely known.
          </p>
          <p>
            <strong>Netflix Hystrix.</strong> Netflix built <strong>Hystrix</strong> (a Java library) around 2012. It wrapped every call to a
            dependency with <strong>timeouts, circuit breakers, bulkheads (separate thread pools) and fallbacks</strong>
            . Netflix had hundreds of dependencies, so <em>something</em> was always failing. Hystrix was later put into
            maintenance mode (no new features). Its own page now points to newer tools like{" "}
            <strong>Resilience4j</strong> and adaptive concurrency limits. The ideas live on everywhere.
          </p>
          <p>
            <strong>Envoy and service meshes.</strong> Envoy (post 13) includes circuit-breaking limits (maximum
            connections, pending requests, retries) and outlier detection. Meshes like Istio let you set these in
            configuration. Many companies get basic bulkheads and breakers "for free" through their mesh.
          </p>
          <p>
            <strong>Degraded pages on big sites.</strong> When a major e-commerce or streaming site has trouble, you
            often see <strong>parts</strong> of pages disappear (recommendations, "customers also bought", reviews)
            while browsing and checkout keep working. This is circuit breakers and fallbacks doing their job.
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
                      Closed: calls pass through, and failures and slow calls are counted in a rolling window. Open:
                      when a threshold is crossed, calls fail at once without touching the dependency, for a cool-down
                      period. Half-open: a few trial calls are allowed. If they succeed, the breaker closes. If they
                      fail, it opens again.
                    </p>
                  </>
                ),
              },
              {
                q: <>What's the difference between a timeout and a circuit breaker?</>,
                a: (
                  <>
                    <p>
                      A timeout limits how long one call may wait. A circuit breaker looks at many calls. When a
                      dependency is clearly unhealthy, it stops making calls at all. This saves threads and gives the
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
                      It means keeping resources apart for each dependency, workload or tenant. You use separate thread
                      pools, concurrency limits, connection pools, queues or instances. Then one slow or failing part
                      can use up only its own share, not the whole service.
                    </p>
                  </>
                ),
              },
              {
                q: <>What makes a good fallback?</>,
                a: (
                  <>
                    <p>
                      An honest, simpler experience for non-critical features: cached or popular items instead of
                      recommendations, hidden reviews, default avatars, or the last known exchange rate with a
                      timestamp. For critical actions like payments, show a clear error and never fake success.
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
                      some extra room. If it is too small, it rejects normal busy times. If it is too large, it stops
                      protecting everyone else.
                    </p>
                  </>
                ),
              },
              {
                q: <>What's the risk of circuit breakers in production?</>,
                a: (
                  <>
                    <p>
                      A quiet fallback can hide an outage for hours. Badly tuned thresholds cause false trips, or trip
                      too late. Send an alert whenever a breaker opens, require a minimum number of calls before it
                      trips, and test fallbacks regularly.
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
              <strong>own limited pool</strong>, so one failure cannot use up everything.
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
