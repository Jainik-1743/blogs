import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { AsciiDiagram, Flow, QA, Stats } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import Percentiles from "@/components/sd/widgets/Percentiles";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-8")!;

export const metadata: Metadata = {
  title: `Lesson 8 — ${lesson.title}`,
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

const code1 = `Requests in the system at once  =  Arrival rate  ×  Time each request spends
            L                   =       λ        ×          W`;

const code2 = `L = 500 × 0.04 = 20 requests in flight at any moment`;

const diagram1 = `Latency
  │                                    ╱
  │                                  ╱
  │                               ╱      ← near 100%: the queue grows without limit
  │                          __╱
  │_______________________╱              ← headroom: run here (50–70%)
  └──────────────────────────────────── Utilisation
   0%        50%        70%     90% 100%`;

const code3 = `1 − 0.99^50  ≈ 40%`;

export default function SdLessonEightPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            Your dashboard says: <strong>"Average response time: 80 ms."</strong> Everything looks great. But support
            tickets keep coming in: "The app is so slow!", "Checkout froze for 5 seconds!"
          </p>
          <p>
            Both are true. The average hides the painful truth:{" "}
            <strong>most requests are fast, but a few are very slow</strong>, and your busiest, most valuable users hit
            those slow requests all the time.
          </p>
          <p>
            To design fast systems you need the right words and the right numbers: <strong>latency</strong>,{" "}
            <strong>throughput</strong> and <strong>percentiles</strong>.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think of a <strong>highway toll booth</strong>.
          </p>
          <ul>
            <li>
              <strong>Latency</strong> is how long <strong>one car</strong> takes to get through the booth: 30 seconds.
            </li>
            <li>
              <strong>Throughput</strong> is how many cars get through <strong>per hour</strong>: 120.
            </li>
            <li>
              <strong>Bandwidth</strong> is the maximum possible: with 4 booths open, maybe 480 cars per hour.
            </li>
          </ul>
          <p>
            These are related but different. Opening more booths raises throughput, but doesn't make any single car
            faster. A faster payment system (like FASTag) lowers latency <em>and</em> raises throughput.
          </p>
          <p>
            Now imagine 99 cars pass in 30 seconds, but 1 car takes 20 minutes because the driver can't find their
            wallet. The <em>average</em> looks fine, but everyone stuck behind that car is furious.{" "}
            <strong>Percentiles</strong> tell you about those slow cases.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="latency">Latency</h3>
          <p>
            <strong>Latency</strong> is the time from sending a request to getting the response. For a web request, it's
            made of:
          </p>
          <Flow
            caption="Where the time goes in one request. Only the last box is your code."
            dir="row"
            nodes={[
              { title: <>Network</>, desc: <>distance, round trips</> },
              { title: <>Queue</>, desc: <>waiting behind others</> },
              { title: <>Service time</>, desc: <>code, DB, other services</>, tone: "warn" },
            ]}
          />
          <ul>
            <li>
              <strong>Network time:</strong> travel between client and server. Distance matters (see post 1).
            </li>
            <li>
              <strong>Queue time:</strong> waiting because the server is busy with other requests.
            </li>
            <li>
              <strong>Service time:</strong> the actual work: running code, querying the database, calling other
              services.
            </li>
          </ul>
          <p>
            You'll often hear <strong>response time</strong> used to mean the same thing.
          </p>
          <h3 id="throughput">Throughput</h3>
          <p>
            <strong>Throughput</strong> is how much work the system completes per unit of time. It's often measured as:
          </p>
          <ul>
            <li>
              <strong>RPS/QPS:</strong> requests or queries per second,
            </li>
            <li>
              <strong>TPS:</strong> transactions per second,
            </li>
            <li>
              <strong>MB/s:</strong> data per second.
            </li>
          </ul>
          <p>
            <strong>Bandwidth</strong> is the <em>capacity</em> (the size of the pipe). <strong>Throughput</strong> is
            what you <em>actually</em> get through it.
          </p>
          <h3 id="little-s-law-the-link-between-them">Little's Law: the link between them</h3>
          <p>There's a simple, very useful formula:</p>
          <CodeBlock code={code1} />
          <p>
            <strong>Example:</strong> your API gets <strong>500 requests per second</strong>, and each takes{" "}
            <strong>40 ms</strong> (0.04 s).
          </p>
          <CodeBlock code={code2} />
          <p>
            So you need at least about 20 worker threads or connections to keep up. If the database slows down and
            requests now take 400 ms, you suddenly have <strong>200 in flight</strong>. Your pool of 50 threads is
            overwhelmed, requests queue up, and latency climbs even more.
          </p>
          <p>
            <strong>This is how a slow database turns into a full outage.</strong>
          </p>
          <h3 id="why-latency-explodes-when-servers-get-busy">Why latency explodes when servers get busy</h3>
          <p>
            When a server is lightly used, requests are handled right away. As it gets busier, requests start waiting in
            a queue. The relationship is <strong>not linear</strong>:
          </p>
          <AsciiDiagram caption="Latency vs utilisation — the hockey stick" text={diagram1} />
          <p>
            At 50% busy, waits are short. At 90%, they're much longer. Near 100%, the queue grows without limit. That's
            why teams usually run servers at around <strong>50–70% CPU</strong>, not 95%. The spare capacity (headroom)
            absorbs bursts.
          </p>
          <p>
            Think of a supermarket checkout. When the cashier is idle half the time, you walk right up. When they're
            busy 95% of the time, one slow customer creates a long line.
          </p>
          <h3 id="trading-latency-for-throughput-and-back">Trading latency for throughput (and back)</h3>
          <ul>
            <li>
              <strong>Batching</strong> (sending 100 writes at once) raises throughput, but each item waits for the
              batch, so latency goes up.
            </li>
            <li>
              <strong>Caching</strong> lowers latency by skipping slow work.
            </li>
            <li>
              <strong>Parallel calls</strong> (calling three services at once instead of one after another) lower
              latency.
            </li>
            <li>
              <strong>More servers</strong> raise throughput, but don't make a single request faster.
            </li>
          </ul>
          <h3 id="why-averages-lie">Why averages lie</h3>
          <p>Latency is rarely spread out evenly. Most requests are fast, and a "long tail" is slow:</p>
          <Percentiles caption="Real latency has a long tail. Add slow paths and watch p99 run away while the average barely moves — then see what fan-out does to it." />
          <p>
            One 5-second request can hide among 99 fast ones and barely move the average. Also, an average of 80 ms
            might mean <em>nobody</em> actually saw 80 ms: half saw 20 ms and half saw 140 ms.
          </p>
          <h3 id="percentiles">Percentiles</h3>
          <p>
            A <strong>percentile</strong> answers: "what latency were X% of requests faster than?"
          </p>
          <ul>
            <li>
              <strong>p50 (median):</strong> half the requests were faster than this. The "typical" user.
            </li>
            <li>
              <strong>p90:</strong> 90% were faster, so 1 in 10 was slower.
            </li>
            <li>
              <strong>p95:</strong> 1 in 20 was slower.
            </li>
            <li>
              <strong>p99:</strong> 1 in 100 was slower.
            </li>
            <li>
              <strong>p99.9:</strong> 1 in 1,000 was slower.
            </li>
          </ul>
          <p>
            <strong>Example:</strong> 100 requests sorted from fastest to slowest.
          </p>
          <ul>
            <li>
              The 50th is <strong>p50 = 45 ms</strong>.
            </li>
            <li>
              The 99th is <strong>p99 = 1,200 ms</strong>.
            </li>
          </ul>
          <p>
            "p99 = 1.2 s" means <strong>1% of your requests take over 1.2 seconds</strong>. At 1 million requests a day,
            that's <strong>10,000 slow experiences every day</strong>.
          </p>
          <h3 id="why-the-tail-matters-more-at-scale">Why the tail matters more at scale</h3>
          <p>
            <strong>Users make many requests.</strong> Loading one page might trigger 50 API calls. If each has a 1%
            chance of being slow, the chance the page has <em>at least one</em> slow call is:
          </p>
          <CodeBlock code={code3} />
          <p>
            So your "rare" p99 becomes something <strong>40% of page loads</strong> feel.
          </p>
          <p>
            <strong>Fan-out makes it worse.</strong> A search request might ask 100 servers in parallel and wait for all
            of them. Even if each server is slow only 1% of the time:
          </p>
          <Stats
            caption="The rare slow case becomes the common case once one page makes many calls."
            stats={[
              { value: <>1%</>, label: <>one call is slow</>, sub: <>that's p99</> },
              { value: <>~40%</>, label: <>of page loads with 50 calls</>, sub: <>1 − 0.99⁵⁰</> },
              { value: <>~63%</>, label: <>of searches fanning out to 100 servers</>, sub: <>1 − 0.99¹⁰⁰</> },
            ]}
          />
          <p>
            This is the key idea behind Google's famous paper "The Tail at Scale":{" "}
            <strong>in big systems, the rare slow case becomes the common case.</strong>
          </p>
          <p>
            <strong>Your heaviest users feel it most.</strong> The customer with 5,000 items in their order history, or
            the seller with the biggest shop, often triggers the slowest queries. These are frequently your most
            valuable users.
          </p>
          <h3 id="common-causes-of-tail-latency">Common causes of tail latency</h3>
          <ul>
            <li>
              <strong>Garbage collection pauses</strong> (in Java, Go, Node.js).
            </li>
            <li>
              <strong>Queueing</strong> during short bursts.
            </li>
            <li>
              <strong>Cache misses</strong>: the data had to come from the database.
            </li>
            <li>
              <strong>"Noisy neighbours"</strong>: other workloads on the same machine.
            </li>
            <li>
              <strong>Retries</strong> after a timeout.
            </li>
            <li>
              <strong>Big users with big data</strong>, as mentioned above.
            </li>
            <li>
              <strong>Cold starts</strong>: a new server or serverless function starting up.
            </li>
          </ul>
          <h3 id="techniques-to-cut-the-tail">Techniques to cut the tail</h3>
          <ul>
            <li>
              <strong>Timeouts</strong>, so one slow call can't hang forever (Part 7).
            </li>
            <li>
              <strong>Caching</strong> hot data.
            </li>
            <li>
              <strong>Hedged requests</strong>: if a response hasn't arrived by the p95 time, send a second copy to
              another server and use whichever answers first. Google uses this idea.
            </li>
            <li>
              <strong>Keep servers below saturation</strong> (the headroom from above).
            </li>
            <li>
              <strong>Paginate or limit</strong> heavy queries, so no single request does unlimited work.
            </li>
          </ul>
          <h3 id="measuring-percentiles-correctly">Measuring percentiles correctly</h3>
          <ul>
            <li>
              Record latencies in <strong>histograms</strong>. Tools like Prometheus, Datadog and HdrHistogram support
              this.
            </li>
            <li>
              <strong>You cannot average percentiles.</strong> If server A has p99 = 100 ms and server B has p99 = 900
              ms, the combined p99 is <strong>not</strong> 500 ms. Combine the raw histograms, then compute the
              percentile.
            </li>
            <li>
              Measure from the <strong>user's side</strong> too, not just the server's. The network and the browser add
              time.
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Optimising for p99</strong> often costs more (extra servers for headroom, hedged requests that add
              load, more caching) than optimising for the average.
            </li>
            <li>
              <strong>Batching</strong> improves throughput and cost, but hurts latency.
            </li>
            <li>
              <strong>Running servers "hot"</strong> (high utilisation) saves money but makes latency spiky and outages
              more likely.
            </li>
            <li>
              <strong>Chasing p99.9</strong> may not be worth it for low-traffic internal tools. It matters most for
              high-traffic, user-facing paths like search, checkout and login.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Amazon and the 99.9th percentile.</strong> Amazon's well-known Dynamo paper explains that its
            internal services set performance targets at the <strong>99.9th percentile</strong>, not the average,
            because the customers with the most activity often have the slowest requests, and those are exactly the
            customers Amazon most wants to keep happy.
          </p>
          <p>
            <strong>"Every 100 ms costs money."</strong> Widely quoted early studies from Amazon and Google found that
            small increases in latency (on the order of 100–500 ms) measurably reduced sales or searches. The exact
            numbers are old, but the lesson has been confirmed many times:{" "}
            <strong>users notice slowness, and they leave.</strong>
          </p>
          <p>
            <strong>Google's "The Tail at Scale".</strong> Google engineers Jeff Dean and Luiz André Barroso showed how
            fan-out across many servers turns rare slowdowns into common ones, and described techniques like hedged
            requests to fight it. It's one of the most influential papers on performance.
          </p>
          <p>
            <strong>Everyday apps.</strong> When a food-delivery app's restaurant list loads instantly but the "place
            order" button sometimes spins for several seconds, that's tail latency on one specific endpoint. Averages
            across the whole app wouldn't show it. A per-endpoint p99 would.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>What's the difference between latency and throughput?</>,
                a: (
                  <>
                    <p>
                      Latency is how long one request takes; throughput is how many requests complete per second. They
                      are linked but separate: more servers raise throughput without making any single request faster,
                      while batching raises throughput at the cost of per-item latency.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why do we track p99 instead of the average?</>,
                a: (
                  <>
                    <p>
                      Latency distributions have long tails. The average hides a slow 1% — which at a million requests a
                      day is 10,000 bad experiences — and often falls where no request actually landed. p99 describes
                      the experience of your unluckiest users, who are frequently your heaviest users.
                    </p>
                  </>
                ),
              },
              {
                q: <>Use Little's Law: 2,000 requests per second, each takes 50 ms. How many are in flight?</>,
                a: (
                  <>
                    <p>
                      L = λ × W = 2,000 × 0.05 = 100 concurrent requests, so you need at least ~100 worker slots or
                      connections. If latency grows to 500 ms, that jumps to 1,000 — which is how a slow dependency
                      exhausts pools and cascades into an outage.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why not run servers at 95% CPU to save money?</>,
                a: (
                  <>
                    <p>
                      Queueing delay grows non-linearly with utilisation. Near saturation, any burst builds a queue that
                      takes a long time to drain, so tail latency explodes and small hiccups turn into outages. Headroom
                      around 50–70% absorbs bursts.
                    </p>
                  </>
                ),
              },
              {
                q: <>Can you average the p99 of two servers?</>,
                a: (
                  <>
                    <p>
                      No. Percentiles don't average. Merge the underlying histograms (or raw samples) and compute the
                      percentile from the combined data.
                    </p>
                  </>
                ),
              },
              {
                q: <>How would you reduce tail latency in a fan-out service?</>,
                a: (
                  <>
                    <p>
                      Set timeouts, cache hot data, keep servers below saturation, cap the work per request, and use
                      hedged requests: if a reply is later than the p95, send a duplicate to another replica and take
                      whichever returns first.
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
              <strong>Latency</strong> = time per request. <strong>Throughput</strong> = requests per second.{" "}
              <strong>Bandwidth</strong> = maximum capacity.
            </li>
            <li>
              <strong>Little's Law</strong> (<code>L = λ × W</code>) links them. A slower backend means more requests in
              flight and bigger pools needed.
            </li>
            <li>
              Latency <strong>rises sharply</strong> as servers approach full utilisation, so keep{" "}
              <strong>headroom</strong>.
            </li>
            <li>
              <strong>Averages hide slow requests.</strong> Use percentiles: <strong>p50, p95, p99, p99.9</strong>.
            </li>
            <li>
              At scale, <strong>the tail becomes the common case</strong> because of multiple calls per page and
              fan-out. Measure with histograms, and never average percentiles.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>"The Tail at Scale" by Jeffrey Dean and Luiz André Barroso (Communications of the ACM, 2013)</li>
            <li>The Dynamo paper from Amazon (SOSP 2007), its section on service level agreements</li>
            <li>Gil Tene's talk "How NOT to Measure Latency"</li>
            <li>
              <em>Systems Performance</em> by Brendan Gregg (chapter 2, "Methodologies")
            </li>
            <li>The System Design Primer on GitHub (section "Latency vs throughput")</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
