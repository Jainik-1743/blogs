import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import { Compare, Flow, Layers, QA } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-44")!;

export const metadata: Metadata = {
  title: `Lesson 44 — ${lesson.title}`,
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

export default function SdLessonFourFourPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            It's the biggest sale of the year. Traffic is <strong>5× your planned peak</strong>. Every server is at 100%
            CPU, the database is saturated, and response times climb from 200 ms to 30 seconds. Soon{" "}
            <strong>nobody</strong> can do anything: browsing, searching, adding to cart and paying all fail.
          </p>
          <p>
            Here's the painful part. If the system had <strong>refused 30% of requests quickly</strong>, or{" "}
            <strong>switched off</strong> heavy features like personalised recommendations, the other 70% of users could
            have shopped and paid normally.
          </p>
          <p>
            When overload is unavoidable, trying to serve <strong>everyone</strong> usually means serving{" "}
            <strong>no one</strong> well. <strong>Graceful degradation</strong> and <strong>load shedding</strong> are
            about <strong>failing partially, on purpose</strong>, so the most important things keep working.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            <strong>Graceful degradation is like a restaurant on a crazy-busy night.</strong> The kitchen can't make the
            full 80-item menu for everyone. So the manager switches to a <strong>short menu</strong> of the 10 most
            popular dishes that are quick to cook. Customers get a slightly simpler experience, but{" "}
            <strong>everyone still eats</strong>.
          </p>
          <p>
            <strong>Load shedding is like a hospital emergency department during a disaster.</strong> When patients
            arrive faster than doctors can treat them, staff <strong>triage</strong>: critical patients are treated
            first, minor injuries are asked to wait or go elsewhere. Turning some people away early is better than{" "}
            <strong>everyone</strong> waiting until it's too late.
          </p>
          <p>
            Both ideas accept a hard truth:{" "}
            <strong>your capacity is limited, so decide in advance what matters most.</strong>
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="part-1-graceful-degradation">Part 1: Graceful degradation</h3>
          <p>
            Identify which features are <strong>critical</strong> and which are <strong>nice-to-have</strong>, then make
            the nice-to-haves <strong>optional</strong> under stress.
          </p>
          <p>
            <strong>Example for an e-commerce site:</strong>
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tier</th>
                  <th>Features</th>
                  <th>Under stress</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Critical</strong>
                  </td>
                  <td>Login, product page basics, cart, checkout, payment</td>
                  <td>Must keep working</td>
                </tr>
                <tr>
                  <td>
                    <strong>Important</strong>
                  </td>
                  <td>Search, order history, stock status</td>
                  <td>Keep, maybe simplified</td>
                </tr>
                <tr>
                  <td>
                    <strong>Nice-to-have</strong>
                  </td>
                  <td>
                    Personalised recommendations, reviews, "people also bought", live chat widget, animated banners
                  </td>
                  <td>
                    <strong>Turn off or replace</strong> with static versions
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>Degradation techniques:</strong>
          </p>
          <ul>
            <li>
              <strong>Serve stale or cached data.</strong> Show cached prices on product listings (while checkout
              re-checks the real price), cached search results, or yesterday's "popular items" instead of live
              personalisation (posts 15–16).
            </li>
            <li>
              <strong>Simplify responses.</strong> Return fewer items per page, fewer fields and smaller images.
            </li>
            <li>
              <strong>Turn off expensive features</strong> with <strong>feature flags or kill switches</strong>, flipped
              manually or automatically when load or error rates cross a threshold.
            </li>
            <li>
              <strong>Use static fallbacks.</strong> Show a pre-built, CDN-served version of the homepage or product
              pages.
            </li>
            <li>
              <strong>Go read-only.</strong> If the database can't take writes, let users <strong>browse</strong> but
              show "Ordering is temporarily paused" instead of failing randomly.
            </li>
            <li>
              <strong>Queue non-urgent work.</strong> Emails, analytics and notifications go to queues and catch up
              later (post 18).
            </li>
            <li>
              <strong>Use circuit-breaker fallbacks</strong> (post 42) for failing dependencies.
            </li>
          </ul>
          <p>
            <strong>Design for degradation up front.</strong> When building each feature, ask:
          </p>
          <ul>
            <li>"What happens if this dependency is slow or down?"</li>
            <li>"Can this page render without it?"</li>
            <li>"Is there a flag to turn it off?"</li>
          </ul>
          <p>
            A page that <strong>requires</strong> 12 services to all succeed is fragile. A page that{" "}
            <strong>gracefully skips</strong> 8 optional ones is resilient.
          </p>
          <Flow
            caption="A degradation ladder for a sale day — each rung is a flag you can flip."
            nodes={[
              { title: <>Normal</>, desc: <>full personalised experience</>, tone: "muted" },
              { title: <>Brownout</>, desc: <>lower image quality, hide “people also bought”</> },
              {
                title: <>Serve stale</>,
                desc: <>cached prices on listings, yesterday's popular items instead of live recommendations</>,
              },
              { title: <>Static fallback</>, desc: <>CDN-served homepage and product pages</> },
              { title: <>Read-only</>, desc: <>browse works; “ordering is paused for a moment”</>, tone: "warn" },
              { title: <>Always protected</>, desc: <>login, cart, checkout, payment</>, tone: "good" },
            ]}
          />
          <h3 id="part-2-load-shedding">Part 2: Load shedding</h3>
          <p>
            <strong>Load shedding</strong> means <strong>rejecting some requests on purpose</strong> when a server is
            overloaded, so it can serve the rest well.
          </p>
          <p>
            <strong>Why reject instead of queueing?</strong> If a server accepts more work than it can do:
          </p>
          <ul>
            <li>
              requests <strong>queue up</strong> and latency climbs (post 8),
            </li>
            <li>
              clients <strong>time out</strong> after, say, 5 seconds, but the server <strong>keeps working</strong> on
              those requests anyway, wasting effort on answers nobody will receive,
            </li>
            <li>
              the timeouts trigger <strong>retries</strong>, which add even more load (post 41),
            </li>
            <li>
              memory fills up, garbage collection thrashes, and the server may crash, which makes things worse for
              everyone.
            </li>
          </ul>
          <p>
            <strong>Rejecting early and cheaply</strong> (in microseconds, with a quick <code>503</code> and{" "}
            <code>Retry-After</code>) keeps the server in its <strong>efficient zone</strong>, and the requests it
            accepts complete quickly.
          </p>
          <Compare
            caption="What happens past capacity."
            columns={[
              {
                title: <>Without shedding</>,
                items: [
                  { sign: "·", text: <>Accepts everything; queues grow; latency climbs</> },
                  { sign: "-", text: <>Clients time out while the server keeps working on their requests</> },
                  { sign: "-", text: <>Timeouts trigger retries → even more load</> },
                  { sign: "-", text: <>Congestive collapse: more load, less useful work</> },
                ],
              },
              {
                title: <>With shedding</>,
                items: [
                  { sign: "·", text: <>Rejects the excess in microseconds with 503 + Retry-After</> },
                  { sign: "+", text: <>Accepted requests stay fast</> },
                  { sign: "+", text: <>Throughput holds at maximum capacity</> },
                  { sign: "+", text: <>Clients back off instead of piling on</> },
                ],
              },
            ]}
          />
          <p>
            This collapse is called <strong>congestive collapse</strong>: beyond a point, more load means{" "}
            <strong>less</strong> useful work.
          </p>
          <h3 id="when-to-shed">When to shed</h3>
          <p>Signals that a server is overloaded:</p>
          <ul>
            <li>
              <strong>Concurrency (in-flight requests)</strong> above a limit, often the most reliable signal.
            </li>
            <li>
              <strong>Queue length or queue wait time</strong> too high.
            </li>
            <li>
              <strong>CPU or memory</strong> over a threshold.
            </li>
            <li>
              <strong>Latency</strong> rising above target.
            </li>
          </ul>
          <p>
            <strong>Adaptive concurrency limits.</strong> Rather than a fixed number like "max 200 in-flight requests",
            some systems <strong>learn</strong> the right limit automatically, similar to TCP congestion control (post
            2). The limit rises while latency stays good, and drops when latency climbs. Netflix's open-source{" "}
            <em>concurrency-limits</em> library and Envoy's adaptive concurrency filter work this way.
          </p>
          <h3 id="what-to-shed-prioritisation">What to shed: prioritisation</h3>
          <p>
            Not all requests are equal. Tag requests with a <strong>priority</strong> or <strong>criticality</strong>{" "}
            and shed the least important first:
          </p>
          <Layers
            caption="Shed from the bottom up. Tag every request with a criticality."
            layers={[
              {
                name: <>1 · Critical</>,
                tech: <>checkout, payment, login, LB health checks</>,
                desc: <>never shed while anything else can be</>,
              },
              { name: <>2 · High</>, desc: <>product pages, cart</> },
              { name: <>3 · Medium</>, desc: <>search, browsing, order history</> },
              { name: <>4 · Low</>, desc: <>recommendations, analytics events, prefetching</> },
              {
                name: <>5 · Sheddable</>,
                tech: <>background syncs, crawlers and bots, retries</>,
                desc: <>first to go</>,
              },
            ]}
          />
          <ul>
            <li>
              <strong>User-initiated</strong> requests matter more than <strong>background</strong> ones (like a phone
              app prefetching data).
            </li>
            <li>
              <strong>Retries</strong> can be shed before first attempts. They're already part of the problem.
            </li>
            <li>
              <strong>Bots and crawlers</strong> go first.
            </li>
            <li>
              <strong>Paying customers</strong> or critical tenants may get priority (with care for fairness).
            </li>
          </ul>
          <h3 id="where-to-shed">Where to shed</h3>
          <ul>
            <li>
              <strong>At the edge or load balancer:</strong> the cheapest place. Rejected requests never reach your
              servers.
            </li>
            <li>
              <strong>At the API gateway:</strong> by route or priority (post 13).
            </li>
            <li>
              <strong>In each service:</strong> a small check at the very start of request handling ("am I over my
              concurrency limit? is this low priority?").
            </li>
            <li>
              <strong>In queues:</strong> drop or delay low-priority jobs when the backlog grows (post 38).
            </li>
          </ul>
          <h3 id="smart-queue-handling-under-overload">Smart queue handling under overload</h3>
          <ul>
            <li>
              <strong>Bounded queues.</strong> Never let queues grow without limit.
            </li>
            <li>
              <strong>Drop requests that have waited too long.</strong> If a request sat in a queue longer than the
              client's timeout, the client has already given up, so <strong>don't process it</strong>. (This is
              sometimes called deadline-aware or "controlled delay" queueing.)
            </li>
            <li>
              <strong>LIFO under overload.</strong> Some systems switch from first-in-first-out to{" "}
              <strong>last-in-first-out</strong> when overloaded. The newest requests are the ones whose clients are
              most likely still waiting, and old ones are probably already timed out.
            </li>
          </ul>
          <h3 id="tell-clients-to-back-off">Tell clients to back off</h3>
          <p>
            When shedding, respond with{" "}
            <strong>
              <code>503 Service Unavailable</code>
            </strong>{" "}
            (or <code>429</code> for per-client limits) and a{" "}
            <strong>
              <code>Retry-After</code>
            </strong>{" "}
            header. Well-built clients (post 41) back off with jitter instead of hammering you.
          </p>
          <h3 id="brownouts-and-waiting-rooms">Brownouts and waiting rooms</h3>
          <ul>
            <li>
              <strong>Brownouts:</strong> deliberately and temporarily <strong>turn down</strong> non-essential features
              (like image quality or recommendations) to reduce load, before things get critical.
            </li>
            <li>
              <strong>Virtual waiting rooms:</strong> for predictable huge spikes (concert ticket sales, product
              launches, big sales), put users in a <strong>queue page</strong> ("You're number 18,402 in line") and let
              them into the site at a rate the system can handle. That's load shedding with good manners.
            </li>
          </ul>
          <h3 id="test-it">Test it</h3>
          <p>As with failover (post 40), untested degradation often fails when needed:</p>
          <ul>
            <li>
              <strong>load-test</strong> beyond peak to see how the system behaves when overloaded,
            </li>
            <li>
              <strong>practise flipping kill switches</strong>,
            </li>
            <li>
              <strong>check that fallback pages</strong> and read-only modes actually work.
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Degradation:</strong> core features survive, but users get a reduced experience. Each fallback
              path needs building and testing.
            </li>
            <li>
              <strong>Load shedding:</strong> the system stays healthy and fast for accepted requests, but{" "}
              <strong>some users see errors</strong> on purpose. Priorities must be chosen carefully and fairly.
            </li>
            <li>
              <strong>Static limits:</strong> simple, but may be wrong as hardware or code changes.{" "}
              <strong>Adaptive limits:</strong> self-tuning, but more complex, and they need good latency signals.
            </li>
            <li>
              <strong>Waiting rooms:</strong> controlled and fair during extreme spikes, but users wait, and it adds
              infrastructure.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Netflix's prioritised load shedding.</strong> Netflix wrote about adding{" "}
            <strong>priority-based load shedding</strong> at its API gateway. Requests are tagged by importance (for
            example, requests that start playback are more important than background prefetching or logging), and when
            the system is stressed, low-priority traffic is shed first. Members can still press play even during
            incidents.
          </p>
          <p>
            <strong>Amazon's load shedding.</strong> The AWS Builders' Library article "Using load shedding to avoid
            overload" explains how Amazon services reject excess requests early, prioritise important work, and avoid
            wasting effort on requests whose clients have already timed out.
          </p>
          <p>
            <strong>Google's criticality levels.</strong> Google's SRE book describes tagging requests with{" "}
            <strong>criticality</strong> (such as critical, sheddable-plus and sheddable) so that during overload,
            backends reject the least critical requests first. The same book documents how overload leads to cascading
            failures when this isn't done.
          </p>
          <p>
            <strong>Ticket sales and waiting rooms.</strong> Ticketing sites for concerts and big sporting events, and
            sites for sneaker drops and flash sales, commonly use <strong>virtual waiting rooms</strong> to admit users
            at a controlled rate, instead of letting a massive rush take the site down for everyone.
          </p>
          <p>
            <strong>Big sale days in e-commerce.</strong> During major sales, large retailers often simplify pages, turn
            off heavy personalisation, rely heavily on CDN-cached content, and protect checkout capacity. That's
            graceful degradation, planned weeks in advance.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>What is graceful degradation? Give examples.</>,
                a: (
                  <>
                    <p>
                      Deliberately reducing functionality under stress so the core keeps working: turning off
                      recommendations and reviews, serving cached or static pages, returning fewer items, going
                      read-only, or queueing non-urgent work — all controlled by feature flags or kill switches.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why reject requests instead of queueing them during overload?</>,
                a: (
                  <>
                    <p>
                      Queued requests wait past their clients' timeouts, so the server does work nobody receives while
                      latency climbs and retries add load — congestive collapse. Rejecting the excess early and cheaply
                      keeps accepted requests fast and the server in its efficient zone.
                    </p>
                  </>
                ),
              },
              {
                q: <>What signals would you use to decide when to shed load?</>,
                a: (
                  <>
                    <p>
                      In-flight concurrency over a limit (often the most reliable), queue length or queue wait time,
                      latency above target, and CPU or memory saturation. Adaptive concurrency limits learn the right
                      cap from latency, much like TCP congestion control.
                    </p>
                  </>
                ),
              },
              {
                q: <>What would you shed first on an e-commerce site?</>,
                a: (
                  <>
                    <p>
                      Bots and crawlers, background syncs and prefetches, retries, analytics events and recommendation
                      calls — long before checkout, payment and login.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you handle a known massive spike like a ticket sale?</>,
                a: (
                  <>
                    <p>
                      Pre-scale, pre-warm caches and CDN, plan which features to switch off, and put a virtual waiting
                      room in front that admits users at a rate the system can handle, rather than letting the rush take
                      the site down for everyone.
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
              Under extreme load, trying to serve everyone often means serving <strong>no one</strong>.{" "}
              <strong>Fail partially, on purpose.</strong>
            </li>
            <li>
              <strong>Graceful degradation:</strong> rank features by importance, and switch off or simplify
              non-critical ones (stale cache, static fallbacks, read-only mode, feature flags) to protect the core.
            </li>
            <li>
              <strong>Load shedding:</strong> <strong>reject excess requests early and cheaply</strong> (503 +{" "}
              <code>Retry-After</code>) to avoid congestive collapse, using concurrency or latency limits, ideally{" "}
              <strong>adaptive</strong>.
            </li>
            <li>
              <strong>Prioritise:</strong> shed bots, background work, retries and low-value features before checkout,
              payments and login.
            </li>
            <li>
              Use <strong>bounded queues</strong>, drop requests that have <strong>already timed out</strong>, consider{" "}
              <strong>waiting rooms</strong> for planned spikes, and <strong>test</strong> it all.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>The AWS Builders' Library article "Using load shedding to avoid overload"</li>
            <li>
              <em>Site Reliability Engineering</em> by Google (chapters "Handling Overload" and "Addressing Cascading
              Failures")
            </li>
            <li>The Netflix Tech Blog post "Keeping Netflix Reliable Using Prioritized Load Shedding"</li>
            <li>Netflix's open-source concurrency-limits project on GitHub</li>
            <li>Stripe's blog post "Scaling your API with rate limiters" (its sections on load shedders)</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
