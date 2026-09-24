import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Flow, QA, Stats } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import Estimator from "@/components/sd/widgets/Estimator";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-10")!;

export const metadata: Metadata = {
  title: `Lesson 10 — ${lesson.title}`,
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

const code1 = `Average QPS = requests per day ÷ 86,400   (≈ ÷ 100,000)
Peak QPS    = average QPS × 2 to 10       (depends on how "spiky" traffic is)`;

const code2 = `10M users × 50 views = 500 million views/day
500M ÷ 100,000 ≈ 5,000 reads/second (average)
Peak ≈ 5,000 × 3 = 15,000 reads/second`;

const code3 = `10M × 0.2 = 2 million uploads/day
2M ÷ 100,000 = 20 uploads/second (average)
Peak ≈ 60 uploads/second`;

const code4 = `2M uploads/day × 2 MB = 4 TB per day
4 TB × 365 ≈ 1.5 PB per year
5 years ≈ 7.5 PB`;

const code5 = `2M photos/day × 1 KB = 2 GB per day
× 365 ≈ 730 GB per year
5 years ≈ 3.7 TB`;

const code6 = `500M views/day × 200 KB = 100 TB per day
100 TB ÷ 86,400 s ≈ 1.2 GB per second ≈ ~10 Gbps average
Peak ≈ 30 Gbps`;

const code7 = `4 TB/day ÷ 86,400 ≈ 46 MB/s ≈ ~0.4 Gbps average`;

const code8 = `500M reads/day × 1 KB metadata = 500 GB of metadata read per day
Cache 20% ≈ 100 GB`;

const code9 = `Peak 15,000–17,000 QPS ÷ 1,000 ≈ 15–17 servers
Add headroom (run ~60–70% busy) and room for one zone failing → ~25–30 servers`;

export default function SdLessonOneZeroPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            Someone asks: "We're building a photo-sharing app. Do we need one database or fifty? Will the photos fit on
            a few disks, or do we need petabytes of storage? How big should the cache be?"
          </p>
          <p>
            You could guess. You could build it and find out, expensively. Or you could spend{" "}
            <strong>five minutes with rough maths</strong> and get answers that are close enough to make good decisions.
          </p>
          <p>
            That's <strong>back-of-the-envelope estimation</strong>: quick, rough calculations (the kind you could do on
            the back of an envelope) that tell you the <strong>size</strong> of a problem. It's used in real design
            reviews, in capacity planning, and in almost every system-design interview.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Suppose you're planning food for a wedding. You don't count every grain of rice. You think: "About 500
            guests, each eats about 200 g of rice, so 100 kg. Add 20% extra in case, so about 120 kg." That's close
            enough to order the right amount. It's clearly not 10 kg, and it's not 1,000 kg.
          </p>
          <p>Estimation in system design works the same way:</p>
          <ul>
            <li>
              <strong>Round aggressively.</strong> 86,400 seconds in a day becomes about 100,000.
            </li>
            <li>
              <strong>Write down your assumptions.</strong> "Average photo is 2 MB."
            </li>
            <li>
              <strong>Get the order of magnitude right.</strong> Is it 10, 1,000 or 1,000,000? Being off by 20% is fine.
              Being off by 100× is not.
            </li>
          </ul>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="the-numbers-you-need-to-remember">The numbers you need to remember</h3>
          <p>
            <strong>Powers of two (data sizes):</strong>
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Approx. bytes</th>
                  <th>Easy way to remember</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1 KB</td>
                  <td>1,000 (really 1,024)</td>
                  <td>A short text message or a small JSON object</td>
                </tr>
                <tr>
                  <td>1 MB</td>
                  <td>1 million</td>
                  <td>A high-quality photo is a few MB</td>
                </tr>
                <tr>
                  <td>1 GB</td>
                  <td>1 billion</td>
                  <td>About an hour of standard-definition video</td>
                </tr>
                <tr>
                  <td>1 TB</td>
                  <td>1 trillion</td>
                  <td>A large laptop drive</td>
                </tr>
                <tr>
                  <td>1 PB</td>
                  <td>1,000 TB</td>
                  <td>Big-company territory</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Handy shortcut: <strong>2^10 ≈ 1,000</strong>, so 2^20 ≈ 1 million, 2^30 ≈ 1 billion, 2^40 ≈ 1 trillion.
          </p>
          <p>
            <strong>Time conversions:</strong>
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Seconds</th>
                  <th>Rounded</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1 day</td>
                  <td>86,400</td>
                  <td>~100,000 (10^5)</td>
                </tr>
                <tr>
                  <td>1 month</td>
                  <td>~2.6 million</td>
                  <td>~2.5 million</td>
                </tr>
                <tr>
                  <td>1 year</td>
                  <td>~31.5 million</td>
                  <td>~30 million</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            So <strong>1 million requests per day ≈ 12 requests per second</strong> on average. Remember that one; it's
            very useful.
          </p>
          <p>
            <strong>Latency numbers (rough orders of magnitude):</strong>
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Operation</th>
                  <th>Rough time</th>
                  <th>Feels like (if 1 ns = 1 second)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Read from CPU L1 cache</td>
                  <td>~1 ns</td>
                  <td>1 second</td>
                </tr>
                <tr>
                  <td>Read from main memory (RAM)</td>
                  <td>~100 ns</td>
                  <td>~2 minutes</td>
                </tr>
                <tr>
                  <td>Read 1 MB sequentially from RAM</td>
                  <td>a few µs</td>
                  <td>about an hour</td>
                </tr>
                <tr>
                  <td>Random read from SSD</td>
                  <td>~16–100 µs</td>
                  <td>hours to about a day</td>
                </tr>
                <tr>
                  <td>Round trip within one data centre</td>
                  <td>~0.5 ms</td>
                  <td>~6 days</td>
                </tr>
                <tr>
                  <td>Read 1 MB sequentially from SSD</td>
                  <td>~0.1–1 ms</td>
                  <td>days to ~2 weeks</td>
                </tr>
                <tr>
                  <td>Hard disk seek</td>
                  <td>~2–10 ms</td>
                  <td>~1–4 months</td>
                </tr>
                <tr>
                  <td>Round trip India ↔ US, or Europe ↔ US</td>
                  <td>~100–250 ms</td>
                  <td>~3–8 years</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Exact numbers change with hardware. What matters are the <strong>big lessons</strong>:
          </p>
          <ul>
            <li>
              <strong>Memory is much faster than disk.</strong> That's why caches exist.
            </li>
            <li>
              <strong>SSDs are much faster than spinning disks</strong>, especially for random reads.
            </li>
            <li>
              <strong>The network inside a data centre is fast. Across continents it's slow</strong>, and the speed of
              light won't improve.
            </li>
            <li>
              <strong>Reading data sequentially is much faster than jumping around.</strong>
            </li>
            <li>
              <strong>Avoid unnecessary network round trips</strong>, especially long-distance ones.
            </li>
          </ul>
          <p>
            <strong>Rough capacity anchors (very workload-dependent):</strong>
          </p>
          <ul>
            <li>
              One well-tuned app server: roughly <strong>hundreds to a few thousand simple requests per second</strong>.
            </li>
            <li>
              One relational database (PostgreSQL/MySQL) on good hardware: often{" "}
              <strong>thousands to tens of thousands of simple queries per second</strong>.
            </li>
            <li>
              One Redis instance: often <strong>tens of thousands to 100,000+ simple operations per second</strong>.
            </li>
          </ul>
          <p>
            Treat these as starting guesses, not facts. Real numbers depend heavily on what each request does, so
            measure your own system when it matters.
          </p>
          <h3 id="the-estimation-recipe">The estimation recipe</h3>
          <p>Most estimates follow the same steps:</p>
          <Flow
            caption="The estimation recipe. Every step feeds the next, and every step ends with “so the design needs…”."
            nodes={[
              { title: <>Users</>, desc: <>how many daily active users (DAU)?</> },
              { title: <>Actions</>, desc: <>reads and writes per user per day</> },
              { title: <>Traffic</>, desc: <>requests/day → average QPS → peak QPS</> },
              { title: <>Storage</>, desc: <>size per item × items per day × days kept (× copies)</> },
              { title: <>Bandwidth</>, desc: <>QPS × size of each response</> },
              { title: <>Memory / cache</>, desc: <>how much hot data to keep in RAM</> },
              { title: <>Servers</>, desc: <>peak QPS ÷ what one server handles, plus headroom</>, tone: "good" },
            ]}
          />
          <p>Two formulas do most of the work:</p>
          <CodeBlock code={code1} />
          <p>
            A social app with an evening rush might use ×3. A ticket sale that opens at exactly 10:00 AM might need ×50
            or more.
          </p>
          <h3 id="worked-example-a-photo-sharing-app">Worked example: a photo-sharing app</h3>
          <p>
            Let's estimate for an Instagram-like app. We write our <strong>assumptions first</strong>:
          </p>
          <ul>
            <li>
              <strong>10 million daily active users (DAU).</strong>
            </li>
            <li>
              Each user <strong>views 50 photos per day</strong>.
            </li>
            <li>
              <strong>1 in 5 users uploads one photo per day</strong> (0.2 uploads per user).
            </li>
            <li>
              Average original photo size: <strong>2 MB</strong>.
            </li>
            <li>
              Photos are shown in the feed as a <strong>resized ~200 KB</strong> version.
            </li>
            <li>
              Each photo has about <strong>1 KB of metadata</strong> (owner, caption, time, location).
            </li>
            <li>
              <strong>Peak traffic = 3× average.</strong>
            </li>
            <li>
              Keep photos <strong>forever</strong>. Plan for <strong>5 years</strong>.
            </li>
          </ul>
          <p>
            <strong>Step 1: Traffic (QPS)</strong>
          </p>
          <p>Reads (photo views):</p>
          <CodeBlock code={code2} />
          <p>(With the exact 86,400, it's about 5,800 average and 17,000 peak. Close enough.)</p>
          <p>Writes (uploads):</p>
          <CodeBlock code={code3} />
          <p>
            <strong>Insight:</strong> the ratio is <strong>250 reads for every write</strong>. This is a{" "}
            <strong>very read-heavy</strong> system, so we should design for fast reads: caching, CDNs, read replicas.
          </p>
          <p>
            <strong>Step 2: Storage</strong>
          </p>
          <p>Photos:</p>
          <CodeBlock code={code4} />
          <p>
            Plus resized versions (thumbnails and feed-size images), say another 20%, so about{" "}
            <strong>9 PB over 5 years</strong>.
          </p>
          <p>
            <strong>Insight:</strong> this is far too much for database servers, so photos go in{" "}
            <strong>object storage</strong> (like Amazon S3). Object storage handles copying data for durability for
            you, so we don't need to multiply by the replication factor ourselves here.
          </p>
          <p>Metadata:</p>
          <CodeBlock code={code5} />
          <p>
            <strong>Insight:</strong> metadata is small. A single well-configured relational database with replicas can
            hold this for years. We don't need to shard on day one, but we should plan for it.
          </p>
          <p>
            <strong>Step 3: Bandwidth</strong>
          </p>
          <p>Outgoing (serving feed photos):</p>
          <CodeBlock code={code6} />
          <p>Incoming (uploads):</p>
          <CodeBlock code={code7} />
          <p>
            <strong>Insight:</strong> ~10–30 Gbps of image traffic is a strong signal to use a <strong>CDN</strong>. You
            don't want all of that coming from your own servers. It also shows why resizing images matters. Serving the
            original 2 MB file instead of 200 KB would mean <strong>10× more bandwidth</strong> and a much bigger bill.
          </p>
          <p>
            <strong>Step 4: Cache (memory)</strong>
          </p>
          <p>
            A common rule is the <strong>80/20 rule</strong>: about 20% of the content gets 80% of the views. So let's
            cache metadata for the "hot" 20% of daily reads:
          </p>
          <CodeBlock code={code8} />
          <p>
            <strong>Insight:</strong> 100 GB fits comfortably in a small Redis cluster, a few nodes with plenty of RAM.
            The photos themselves are cached by the CDN, not by Redis.
          </p>
          <p>
            <strong>Step 5: Number of servers</strong>
          </p>
          <p>
            Assume one app server can handle about <strong>1,000 requests per second</strong> for these simple API
            calls:
          </p>
          <CodeBlock code={code9} />
          <p>
            <strong>Insight:</strong> this is a <strong>horizontally scaled, stateless app tier</strong> (post 7). Tens
            of servers is very manageable, so we don't need anything exotic.
          </p>
          <p>
            <strong>The summary you'd write on a whiteboard:</strong>
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>What</th>
                  <th>Estimate</th>
                  <th>Design impact</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Read QPS (peak)</td>
                  <td>~15–17k</td>
                  <td>Cache + CDN + read replicas</td>
                </tr>
                <tr>
                  <td>Write QPS (peak)</td>
                  <td>~60</td>
                  <td>A single primary DB is fine for writes</td>
                </tr>
                <tr>
                  <td>Photo storage</td>
                  <td>~1.5 PB/year</td>
                  <td>Object storage, not a database</td>
                </tr>
                <tr>
                  <td>Metadata</td>
                  <td>~730 GB/year</td>
                  <td>One relational DB + replicas for now</td>
                </tr>
                <tr>
                  <td>Egress bandwidth</td>
                  <td>~10–30 Gbps</td>
                  <td>CDN is required; resize images</td>
                </tr>
                <tr>
                  <td>Cache</td>
                  <td>~100 GB</td>
                  <td>Small Redis cluster</td>
                </tr>
                <tr>
                  <td>App servers</td>
                  <td>~25–30</td>
                  <td>Stateless, behind a load balancer</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            In about ten minutes, we've gone from "a photo app" to concrete decisions about storage type, CDN, cache
            size and server count.
          </p>
          <Estimator caption="Your own envelope. Move the sliders and watch every number — and the design it implies — change together." />
          <h3 id="tips-for-good-estimates">Tips for good estimates</h3>
          <ul>
            <li>
              <strong>Write assumptions down and say them out loud.</strong> If someone says "users upload more like 1
              photo a day", you just multiply by 5.
            </li>
            <li>
              <strong>Round to easy numbers.</strong> 86,400 becomes 100,000; 2.6 million becomes 2.5 million. Your
              answer will be within about 20%, which is fine.
            </li>
            <li>
              <strong>Use scientific notation for big numbers.</strong> 5 × 10^8 is easier to multiply than 500,000,000.
            </li>
            <li>
              <strong>Keep units attached.</strong> Mixing up bits and bytes (Gbps vs GB/s) is a common 8× mistake: 1
              GB/s ≈ 8 Gbps.
            </li>
            <li>
              <strong>Sanity-check the result.</strong> "10 PB for a small startup?" If it looks odd, recheck your
              assumptions.
            </li>
            <li>
              <strong>Use estimates to make decisions</strong>, not to show off maths. Always finish with "so this
              means…".
            </li>
            <li>
              <strong>Separate reads and writes.</strong> They usually lead to different design choices.
            </li>
            <li>
              <strong>Don't forget peaks.</strong> Systems fail at peak, not on average.
            </li>
          </ul>
          <h3 id="common-mistakes">Common mistakes</h3>
          <ul>
            <li>Using average QPS to size servers and forgetting peak traffic.</li>
            <li>
              Forgetting that data <strong>accumulates</strong> over years.
            </li>
            <li>
              Ignoring <strong>metadata vs media</strong> differences: one is small and structured, the other huge and
              unstructured.
            </li>
            <li>Spending 20 minutes on precise arithmetic. Precision doesn't matter here; direction does.</li>
            <li>Treating capacity anchors (like "1,000 requests per server") as facts instead of assumptions.</li>
          </ul>
          <Stats
            caption="The anchors that make every estimate fast."
            stats={[
              { value: <>~100 K</>, label: <>seconds in a day</>, sub: <>really 86,400</> },
              { value: <>~12 QPS</>, label: <>per 1 M requests/day</>, sub: <>average, before peaks</> },
              { value: <>2¹⁰ ≈ 10³</>, label: <>KB → MB → GB → TB</>, sub: <>each step ×1,000</> },
              { value: <>×8</>, label: <>bytes → bits</>, sub: <>1 GB/s ≈ 8 Gbps</> },
              { value: <>~100 ns</>, label: <>RAM read</>, sub: <>vs ~100 µs SSD, ~100+ ms across continents</> },
              { value: <>×3</>, label: <>typical peak</>, sub: <>×50 for a flash sale at 10:00 sharp</> },
            ]}
          />
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Estimates are rough by design.</strong> They're great for choosing an architecture, but not for
              final hardware orders or budgets. For those, <strong>load-test</strong> the real system.
            </li>
            <li>
              <strong>Over-estimating</strong> leads to over-engineering and wasted money.{" "}
              <strong>Under-estimating</strong> leads to outages. When unsure, estimate a range ("between 10k and 30k
              QPS") and design for the high end of what's realistic in the next year or two.
            </li>
            <li>
              <strong>Rules of thumb</strong> (80/20 caching, 3× peak) are starting points. Real traffic patterns can be
              very different, so replace assumptions with real metrics once you have them.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Capacity planning at big companies.</strong> Before big events (a festive-season sale, a product
            launch, a cricket final), engineering teams at e-commerce and streaming companies estimate expected peak
            traffic from past events and growth, then scale up and load-test ahead of time. It's this same estimation
            recipe, just done with real historical data.
          </p>
          <p>
            <strong>Jeff Dean's latency numbers.</strong> Google engineer Jeff Dean popularised a list of "latency
            numbers every programmer should know" in talks about building large systems at Google. Versions of that list
            are still shared widely today, and some interactive versions show how the numbers have changed over the
            years.
          </p>
          <p>
            <strong>Cloud bills.</strong> Many startups have been surprised by large{" "}
            <strong>data transfer (egress)</strong> bills. A quick bandwidth estimate like the one above (10+ Gbps of
            images) would have shown early that a CDN and image resizing were needed, both for speed and for cost.
          </p>
          <p>
            <strong>System design interviews.</strong> Almost every system-design interview at large tech companies
            includes a quick estimation step. Interviewers care less about the exact number and more about whether you
            state assumptions clearly, handle units correctly, and{" "}
            <strong>use the numbers to justify design choices</strong>.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>Estimate the QPS for a service with 50 million DAU, each making 20 requests a day.</>,
                a: (
                  <>
                    <p>
                      50 M × 20 = 1 billion requests a day. Divide by ~100,000 seconds: about 10,000 QPS on average
                      (11,600 with the exact 86,400). With a 3× peak factor, plan for ~30,000–35,000 QPS.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you estimate storage for five years?</>,
                a: (
                  <>
                    <p>
                      Size per item × items per day × 365 × 5, then multiply by the replication factor if you store
                      copies yourself (often 3), and add room for indexes and growth. Split media from metadata — they
                      usually end up in different systems.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why separate reads and writes in an estimate?</>,
                a: (
                  <>
                    <p>
                      They lead to different designs. A 250:1 read-heavy system wants caching, CDNs and read replicas; a
                      write-heavy one wants partitioning, queues and write-optimised storage. A single “QPS” number
                      hides that choice.
                    </p>
                  </>
                ),
              },
              {
                q: <>What's a common unit mistake?</>,
                a: (
                  <>
                    <p>
                      Mixing bits and bytes: network links are sold in bits per second, storage in bytes. 1 GB/s is
                      about 8 Gbps, so confusing them is an 8× error. Also watch KB vs KiB, and per-day vs per-second.
                    </p>
                  </>
                ),
              },
              {
                q: <>How precise should an estimate be?</>,
                a: (
                  <>
                    <p>
                      Right to within a factor of two or so. The goal is the order of magnitude that drives a decision —
                      one database or fifty, RAM or disk, CDN or not. State assumptions out loud and round aggressively
                      instead of spending minutes on arithmetic.
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
              Estimation gives you the <strong>order of magnitude</strong> fast. That's enough to choose an
              architecture.
            </li>
            <li>
              Memorise a few anchors:
              <ul>
                <li>
                  <strong>1 day ≈ 100k seconds</strong>; <strong>1M requests/day ≈ 12 QPS</strong>.
                </li>
                <li>
                  <strong>Memory is much faster than SSD, which is much faster than disk.</strong>
                </li>
                <li>
                  <strong>Cross-continent round trips take ~100+ ms.</strong>
                </li>
              </ul>
            </li>
            <li>
              Follow the recipe:{" "}
              <strong>users → actions → QPS (average and peak) → storage → bandwidth → cache → servers.</strong>
            </li>
            <li>
              <strong>Write assumptions down</strong>, round aggressively, keep units straight, and always end with{" "}
              <strong>"so the design needs…"</strong>.
            </li>
            <li>
              Replace estimates with <strong>real measurements and load tests</strong> once the system exists.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              <em>System Design Interview: An Insider's Guide</em> by Alex Xu (chapter 2, "Back-of-the-envelope
              Estimation")
            </li>
            <li>
              The System Design Primer on GitHub (sections "Back-of-the-envelope calculations", "Powers of two table"
              and "Latency numbers every programmer should know")
            </li>
            <li>The "napkin-math" project on GitHub by Simon Eskildsen (modern, benchmarked reference numbers)</li>
            <li>Jeff Dean's talk "Designs, Lessons and Advice from Building Large Distributed Systems"</li>
          </ul>
          <p>
            <em>
              This wraps up Part 2. Next up, Part 3: The Building Blocks, starting with "Anatomy of a Request: From
              Browser to Database".
            </em>
          </p>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
