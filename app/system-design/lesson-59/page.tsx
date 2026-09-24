import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Compare, Flow, QA } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-59")!;

export const metadata: Metadata = {
  title: `Lesson 59 — ${lesson.title}`,
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

const code1 = `POST /v1/urls     { longUrl, customAlias?, expiresAt? }  → 201 { shortUrl }
GET  /{code}      → 301/302 redirect to longUrl`;

const code2 = `url_mappings: code (PK), long_url, created_at, expires_at, owner_id
Access pattern: lookup by code (very hot), insert (rare)`;

export default function SdLessonFiveNinePage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            Someone says: <strong>"Design YouTube."</strong> Or "Design a chat app." Or, at work, "We need a
            notification system by next quarter."
          </p>
          <p>
            It's easy to freeze, or to do the opposite and immediately start drawing Kafka clusters and sharded
            databases before anyone knows what the system is supposed to do. Both lead to bad designs:
          </p>
          <ul>
            <li>the first because nothing gets decided,</li>
            <li>the second because you're solving problems nobody has.</li>
          </ul>
          <p>
            Over the last 58 posts we've collected the building blocks: load balancers, caches, databases, queues,
            replication, sharding, consistency, reliability patterns, observability and security. This series puts them
            together. Before designing real systems, we need a <strong>repeatable process</strong>, a framework that
            works for <strong>any</strong> design problem, in an interview or in a real design document.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about how an <strong>architect designs a house</strong>:
          </p>
          <ol>
            <li>
              <strong>Listen:</strong> "How many people? What's your budget? Do you work from home?" (requirements)
            </li>
            <li>
              <strong>Measure:</strong> the plot size, the number of rooms, how much water and power is needed
              (estimation)
            </li>
            <li>
              <strong>Define the connections:</strong> where the doors, plumbing and wiring go (APIs and data model)
            </li>
            <li>
              <strong>Sketch the floor plan:</strong> the main rooms and how they connect (high-level design)
            </li>
            <li>
              <strong>Detail the tricky parts:</strong> the staircase, the load-bearing walls, earthquake safety (deep
              dives)
            </li>
          </ol>
          <p>
            And finally, <strong>explain the choices</strong>: "We put the kitchen here because…, and we chose this over
            that because…" (trade-offs).
          </p>
          <p>
            A good system design follows the same shape. The framework keeps you <strong>structured</strong>, makes sure
            you <strong>don't skip important questions</strong>, and shows <strong>how you think</strong>, which matters
            more than any single "right answer".
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="the-five-steps-at-a-glance">The five steps at a glance</h3>
          <Flow
            caption="The five steps, with a rough time budget for a 45-minute interview."
            nodes={[
              { title: <>Requirements</>, desc: <>~5 min — what it does and how well; what's out of scope</> },
              { title: <>Estimation</>, desc: <>~5 min — QPS, storage, bandwidth: how big is this?</> },
              { title: <>API &amp; data model</>, desc: <>~5 min — the contract and the main access patterns</> },
              { title: <>High-level design</>, desc: <>~10 min — the fewest boxes and arrows that work end to end</> },
              {
                title: <>Deep dives</>,
                desc: <>~15 min — bottlenecks, failures, scaling, the interesting parts</>,
                tone: "warn",
              },
              { title: <>Wrap-up</>, desc: <>~5 min — trade-offs made, what you'd do next</>, tone: "good" },
            ]}
          />
          <p>
            <strong>A rough time budget for a 45–60 minute interview:</strong>
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Step</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1. Requirements</td>
                  <td>5–8 min</td>
                </tr>
                <tr>
                  <td>2. Estimation</td>
                  <td>3–5 min</td>
                </tr>
                <tr>
                  <td>3. API &amp; data model</td>
                  <td>5–8 min</td>
                </tr>
                <tr>
                  <td>4. High-level design</td>
                  <td>10–15 min</td>
                </tr>
                <tr>
                  <td>5. Deep dives &amp; scaling</td>
                  <td>10–15 min</td>
                </tr>
                <tr>
                  <td>Wrap-up</td>
                  <td>2–5 min</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>In a real design document, the same steps become the sections of the document.</p>
          <hr />
          <h3 id="step-1-clarify-requirements">Step 1: Clarify requirements</h3>
          <p>
            <strong>Never start designing immediately.</strong> Ask questions until the problem is clear (post 6).
          </p>
          <p>
            <strong>Functional requirements: what does it do?</strong>
          </p>
          <ul>
            <li>
              Who are the <strong>users</strong>? (consumers, businesses, internal teams)
            </li>
            <li>
              What are the <strong>core use cases</strong>? Pick the <strong>3–5 most important</strong> ones.
            </li>
            <li>
              What's <strong>out of scope</strong>? Say it out loud: "I'll skip payments and admin tools for now."
            </li>
          </ul>
          <p>
            <strong>Non-functional requirements: how well must it do it?</strong>
          </p>
          <ul>
            <li>
              <strong>Scale:</strong> daily active users, requests per second, data size, growth.
            </li>
            <li>
              <strong>Latency:</strong> how fast must key actions feel (p99 targets, post 8)?
            </li>
            <li>
              <strong>Availability:</strong> how bad is downtime (post 9)? Which parts are critical?
            </li>
            <li>
              <strong>Consistency:</strong> is slightly stale data OK, or must it be exact (posts 27–28)?
            </li>
            <li>
              <strong>Durability:</strong> can we ever lose data?
            </li>
            <li>
              <strong>Read/write ratio:</strong> read-heavy (feeds, catalogues) or write-heavy (logs, chat)?
            </li>
            <li>
              <strong>Geography, security, compliance and cost</strong> constraints.
            </li>
          </ul>
          <p>
            <strong>Write them down</strong>, and confirm them:
          </p>
          <Compare
            caption="Step 1 for a URL shortener — split, measurable, with scope stated."
            columns={[
              {
                title: <>Functional</>,
                items: [
                  { sign: "·", text: <>Shorten a long URL</> },
                  { sign: "·", text: <>Visiting the short URL redirects to the original</> },
                  { sign: "·", text: <>Optional: custom alias, expiry</> },
                  { sign: "-", text: <>Out of scope: accounts, analytics dashboards</> },
                ],
              },
              {
                title: <>Non-functional</>,
                items: [
                  { sign: "·", text: <>100 M new URLs/month, ~100 : 1 reads to writes</> },
                  { sign: "·", text: <>Redirect p99 &lt; 50 ms</> },
                  { sign: "·", text: <>Redirects 99.99% available</> },
                  { sign: "·", text: <>Links must never be lost</> },
                ],
              },
            ]}
          />
          <h3 id="step-2-back-of-the-envelope-estimation">Step 2: Back-of-the-envelope estimation</h3>
          <p>
            Do <strong>quick maths</strong> to understand the <strong>size</strong> of the problem (post 10):
          </p>
          <ul>
            <li>
              <strong>Traffic:</strong> average and <strong>peak</strong> QPS, for reads and writes separately.
            </li>
            <li>
              <strong>Storage:</strong> per item × items per day × retention.
            </li>
            <li>
              <strong>Bandwidth:</strong> QPS × response size.
            </li>
            <li>
              <strong>Memory:</strong> how much hot data to cache (the 80/20 rule).
            </li>
          </ul>
          <p>
            <strong>Always end with "so this means…":</strong>
          </p>
          <ul>
            <li>"Only ~40 writes per second, so one primary database handles writes easily."</li>
            <li>"~12,000 reads per second at peak, so we need caching and replicas."</li>
            <li>"About 6 TB over 10 years, which fits in a sharded or single large database."</li>
          </ul>
          <p>
            Don't spend 15 minutes on arithmetic. <strong>Round aggressively.</strong> The goal is{" "}
            <strong>order of magnitude</strong>.
          </p>
          <h3 id="step-3-define-the-api-and-data-model">Step 3: Define the API and data model</h3>
          <p>
            <strong>API.</strong> Write the main endpoints or operations (posts 30–34):
          </p>
          <CodeBlock lang="http" code={code1} />
          <p>Think about:</p>
          <ul>
            <li>
              <strong>idempotency</strong> for creates (post 34),
            </li>
            <li>
              <strong>pagination</strong> for lists,
            </li>
            <li>
              <strong>authentication</strong> and <strong>rate limits</strong> (posts 43 and 49),
            </li>
            <li>
              <strong>sync vs async:</strong> does the client need the result now, or can it be a job (post 18)?
            </li>
            <li>
              whether <strong>REST, gRPC, GraphQL or WebSockets</strong> fits (posts 30–33).
            </li>
          </ul>
          <p>
            <strong>Data model.</strong> List the core <strong>entities</strong>, their key fields, and the{" "}
            <strong>access patterns</strong>:
          </p>
          <CodeBlock code={code2} />
          <p>
            Then choose storage based on those patterns (posts 20 and 29): relational, key-value, wide-column, document,
            search, object storage…
          </p>
          <h3 id="step-4-high-level-design">Step 4: High-level design</h3>
          <p>
            Draw the <strong>main components and data flow</strong> that satisfy the core use cases{" "}
            <strong>end to end</strong>. Start <strong>simple</strong>, then evolve:
          </p>
          <Flow
            caption="A typical first high-level design. Start here, then deepen where the numbers point."
            dir="row"
            nodes={[
              { title: <>Client</> },
              { title: <>DNS / CDN</> },
              { title: <>Load balancer</> },
              { title: <>API servers</> },
              { title: <>Cache</> },
              { title: <>Database</> },
              { title: <>Queue → workers</> },
            ]}
          />
          <p>
            <strong>Walk through each core use case on the diagram:</strong> "When a user creates a URL, the request
            goes here, then here… When someone visits a short URL, it goes here…"
          </p>
          <p>
            <strong>Tips:</strong>
          </p>
          <ul>
            <li>Use the standard building blocks (post 11). Don't invent exotic components.</li>
            <li>
              Mark what's <strong>synchronous</strong> vs <strong>asynchronous</strong>.
            </li>
            <li>
              Show where <strong>data lives</strong> and which service <strong>owns</strong> it.
            </li>
            <li>
              Keep it <strong>readable</strong>: 6–12 boxes, not 40.
            </li>
          </ul>
          <h3 id="step-5-deep-dives-and-scaling">Step 5: Deep dives and scaling</h3>
          <p>
            Now go deeper on the <strong>hardest or most important parts</strong>. Pick 2–3 topics that matter most{" "}
            <strong>for this system</strong> (or follow the interviewer's lead):
          </p>
          <p>
            <strong>Scaling:</strong>
          </p>
          <ul>
            <li>
              Where is the <strong>bottleneck</strong> at 10× or 100× traffic?
            </li>
            <li>
              <strong>Cache</strong> hot data (posts 15–16). <strong>CDN</strong> for static content (post 14).
            </li>
            <li>
              <strong>Read replicas</strong> (post 24). <strong>Sharding</strong>, with a clear shard key (posts 25–26).
            </li>
            <li>
              <strong>Queues</strong> to absorb spikes (posts 18 and 35).
            </li>
          </ul>
          <p>
            <strong>Reliability:</strong>
          </p>
          <ul>
            <li>
              <strong>SPOFs</strong> and redundancy across AZs (post 40).
            </li>
            <li>
              <strong>Timeouts, retries, circuit breakers</strong> (posts 41–42).
            </li>
            <li>
              <strong>Rate limiting and load shedding</strong> (posts 43–44).
            </li>
            <li>
              <strong>Backups and DR</strong> (post 45).
            </li>
          </ul>
          <p>
            <strong>Data correctness:</strong>
          </p>
          <ul>
            <li>
              <strong>Consistency needs</strong> per feature (post 28).
            </li>
            <li>
              <strong>Transactions</strong>, idempotency, duplicate handling and ordering (posts 21, 34 and 37).
            </li>
          </ul>
          <p>
            <strong>Operability and security:</strong>
          </p>
          <ul>
            <li>
              <strong>Monitoring and SLOs:</strong> what would you alert on (posts 46–48)?
            </li>
            <li>
              <strong>AuthN / AuthZ</strong>, sensitive data, abuse (posts 49–52).
            </li>
            <li>
              <strong>Deployments:</strong> how do you ship changes safely (post 58)?
            </li>
          </ul>
          <p>
            <strong>Good deep dives compare options:</strong> "We could do A or B. A is simpler but fails when X. Given
            our requirement of Y, I'd choose B."
          </p>
          <h3 id="wrap-up-trade-offs-and-next-steps">Wrap-up: trade-offs and next steps</h3>
          <p>Finish by summarising:</p>
          <ul>
            <li>
              <strong>Key decisions and why</strong> ("hybrid fan-out, because of celebrity accounts").
            </li>
            <li>
              <strong>Trade-offs accepted</strong> ("feeds may be a few seconds stale").
            </li>
            <li>
              <strong>Risks and bottlenecks</strong> you'd watch.
            </li>
            <li>
              <strong>What you'd do next</strong> with more time ("multi-region, better ranking, analytics").
            </li>
          </ul>
          <hr />
          <h3 id="a-mini-example-design-pastebin-in-5-steps">A mini example: "Design Pastebin" in 5 steps</h3>
          <ol>
            <li>
              <strong>Requirements:</strong> users paste text and get a link, anyone with the link can read it, optional
              expiry, pastes up to 1 MB. The system is read-heavy (about 10:1), and pastes must not be lost.
            </li>
            <li>
              <strong>Estimation:</strong> 1M new pastes a day ≈ 12 writes/s. 10M reads a day ≈ 120 reads/s (peak around
              500/s). With an average paste of 10 KB, that's 10 GB a day ≈ 3.6 TB a year.
            </li>
            <li>
              <strong>API and data:</strong> <code>POST /pastes</code> returns <code>&#123;id&#125;</code>, and{" "}
              <code>GET /pastes/&#123;id&#125;</code> returns the content. Metadata goes in a database; content goes in{" "}
              <strong>object storage</strong> (post 17).
            </li>
            <li>
              <strong>High-level design:</strong>
            </li>
          </ol>
          <Flow
            caption="The mini Pastebin design."
            nodes={[
              { title: <>Client → load balancer → API servers</>, desc: <>stateless</> },
              { title: <>Metadata DB</>, desc: <>id, owner, expiry, storage key</> },
              { title: <>Object storage</>, desc: <>the paste content itself — big and cheap</> },
              { title: <>CDN + cache</>, desc: <>popular pastes and hot metadata</>, tone: "good" },
              { title: <>Background worker</>, desc: <>deletes expired pastes</> },
            ]}
          />
          <ol start={5}>
            <li>
              <strong>Deep dives:</strong> ID generation (random Base62 vs counters), caching popular pastes, expiry
              cleanup, abuse (spam, malware, rate limits), and CDN caching rules.
            </li>
          </ol>
          <p>
            Wrap-up: this is a simple, read-heavy design. Most of the scale comes from caching and a CDN, and object
            storage keeps the database small.
          </p>
          <h3 id="common-mistakes">Common mistakes</h3>
          <ul>
            <li>
              ❌ <strong>Jumping into details</strong> (Kafka partitions, database choice) before requirements are
              clear.
            </li>
            <li>
              ❌ <strong>Designing for Google scale</strong> when the requirement is 1,000 users.
            </li>
            <li>
              ❌ <strong>Silent thinking.</strong> Explain your reasoning as you go; the process matters.
            </li>
            <li>
              ❌ <strong>Buzzword architecture:</strong> adding microservices, Kafka, Kubernetes and GraphQL without
              saying <em>why</em>.
            </li>
            <li>
              ❌ <strong>Ignoring failure:</strong> assuming every component is always up.
            </li>
            <li>
              ❌ <strong>No trade-offs:</strong> presenting one option as perfect. Every choice has a cost.
            </li>
            <li>
              ❌ <strong>Spending all the time on one part</strong> and never finishing the end-to-end design.
            </li>
            <li>
              ❌ <strong>Not checking back</strong> with the interviewer or stakeholders ("Does this match what you had
              in mind?").
            </li>
          </ul>
          <h3 id="communication-tips">Communication tips</h3>
          <ul>
            <li>
              <strong>Think out loud</strong>, and <strong>state assumptions</strong> clearly ("I'll assume 50M daily
              users").
            </li>
            <li>
              <strong>Check in</strong> at the end of each step.
            </li>
            <li>
              <strong>Start simple, then evolve:</strong> "Version 1 is a single database; at 10× we'd add…"
            </li>
            <li>
              <strong>Use numbers</strong> to justify decisions.
            </li>
            <li>
              <strong>Admit uncertainty:</strong> "I'm not sure about X's exact limits, but I'd verify with a load
              test."
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>A structured framework</strong> makes sure nothing important is missed, but used too rigidly it
              can feel mechanical. Adapt the depth of each step to the problem.
            </li>
            <li>
              <strong>Time on requirements vs design:</strong> too little leads to the wrong design, and too much leaves
              no time to design. Aim for clarity, not perfection.
            </li>
            <li>
              <strong>Breadth vs depth:</strong> cover the whole system first, then go deep on 2–3 areas. Going deep
              everywhere isn't possible in limited time.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Design docs at big tech companies.</strong> Companies like Google, Uber and many others write a{" "}
            <strong>design document</strong> or <strong>RFC</strong> before building significant systems. These usually
            include context, goals and <strong>non-goals</strong>, a proposed design,{" "}
            <strong>alternatives considered</strong>, and cross-cutting concerns (security, privacy, monitoring, rollout
            plan). That's the same framework in written form.
          </p>
          <p>
            <strong>Amazon's "working backwards".</strong> Amazon teams often start with a{" "}
            <strong>press release and FAQ</strong> (a PR/FAQ) describing the product from the customer's point of view,{" "}
            <em>before</em> any design. It forces clarity about the <strong>functional requirements</strong> and
            customer value first, which is exactly step 1.
          </p>
          <p>
            <strong>Architecture Decision Records.</strong> Many teams record important decisions as short{" "}
            <strong>ADRs</strong> (post 6): context, decision, alternatives and consequences. They're the "wrap-up and
            trade-offs" step, preserved for future engineers.
          </p>
          <p>
            <strong>System design interviews.</strong> Most large tech companies include system design rounds for
            mid-level and senior engineers. Interviewers typically look for{" "}
            <strong>
              structured thinking, clear requirements, sensible estimates, a working end-to-end design, and thoughtful
              trade-offs
            </strong>
            , not memorised architectures.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>What's the first thing you do in a system design interview?</>,
                a: (
                  <>
                    <p>
                      Clarify requirements. Pin down the core features and what's out of scope, then the non-functional
                      requirements as numbers — scale, read/write ratio, latency, availability, consistency needs —
                      before drawing anything.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why do an estimate before designing?</>,
                a: (
                  <>
                    <p>
                      The numbers decide the architecture: 40 writes a second fits one primary database, 400,000
                      doesn't. Estimation tells you whether you need caching, sharding, CDNs or queues, and where to
                      spend the deep-dive time.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you choose what to deep-dive on?</>,
                a: (
                  <>
                    <p>
                      Follow the bottlenecks your estimate reveals and the requirement that is hardest to meet — the hot
                      read path, the write-heavy table, the consistency-critical flow — plus the failure modes of your
                      design. Ask the interviewer which area interests them.
                    </p>
                  </>
                ),
              },
              {
                q: <>What are common system design interview mistakes?</>,
                a: (
                  <>
                    <p>
                      Jumping into components before requirements, over-engineering for scale nobody asked for,
                      name-dropping technologies without explaining trade-offs, ignoring failure modes, going silent
                      instead of thinking out loud, and never checking in with the interviewer.
                    </p>
                  </>
                ),
              },
              {
                q: <>How should you wrap up?</>,
                a: (
                  <>
                    <p>
                      Summarise the design against the requirements, state the key trade-offs you made and why, point
                      out the known weak spots, and say what you'd add next with more time or scale — monitoring,
                      multi-region, analytics.
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
              Use a <strong>repeatable framework</strong>:{" "}
              <strong>requirements → estimation → API &amp; data model → high-level design → deep dives</strong>, then a{" "}
              <strong>wrap-up</strong> of trade-offs.
            </li>
            <li>
              <strong>Clarify first:</strong> functional requirements, out-of-scope items, and{" "}
              <strong>measurable</strong> non-functional requirements (scale, latency, availability, consistency).
            </li>
            <li>
              <strong>Estimate</strong> to find the order of magnitude, and always end with{" "}
              <strong>"so this means…"</strong>.
            </li>
            <li>
              <strong>Design end to end, simply first</strong>, walking each use case through the diagram. Then{" "}
              <strong>deep-dive</strong> into the 2–3 hardest parts: scaling, failures, correctness, security and
              operations.
            </li>
            <li>
              <strong>Explain trade-offs</strong> and assumptions out loud. There's no single right answer, only
              well-reasoned ones.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              <em>System Design Interview: An Insider's Guide</em> by Alex Xu (chapter 3, "A Framework For System Design
              Interviews")
            </li>
            <li>The System Design Primer on GitHub (section "How to approach a system design interview question")</li>
            <li>The roadmap.sh System Design roadmap</li>
            <li>Malte Ubl's article "Design Docs at Google"</li>
            <li>Michael Nygard's article "Documenting Architecture Decisions"</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
