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
            It is easy to freeze. It is also easy to do the opposite: you start drawing Kafka clusters and sharded
            databases before anyone knows what the system should do. Both lead to bad designs:
          </p>
          <ul>
            <li>the first because nothing gets decided,</li>
            <li>the second because you are solving problems nobody has.</li>
          </ul>
          <p>
            In the last 58 posts we learned the building blocks: load balancers, caches, databases, queues,
            replication, sharding, consistency, reliability patterns, observability and security. This part of the course puts them
            together. Before we design real systems, we need a <strong>process you can repeat</strong>. It is a framework that
            works for <strong>any</strong> design problem, in an interview or in a real design document. (Here, a "system" is
            a set of programs and machines that work together to do a job.)
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about how an <strong>architect designs a house</strong>:
          </p>
          <ol>
            <li>
              <strong>Listen:</strong> "How many people? What is your budget? Do you work from home?" (requirements)
            </li>
            <li>
              <strong>Measure:</strong> the size of the land, the number of rooms, and how much water and power you need
              (estimation)
            </li>
            <li>
              <strong>Define the connections:</strong> where the doors, pipes and wires go (the API, which is how parts talk to each other, and the data model, which is how data is organised)
            </li>
            <li>
              <strong>Sketch the floor plan:</strong> the main rooms and how they connect (the high-level design)
            </li>
            <li>
              <strong>Work out the hard parts:</strong> the staircase, the walls that hold up the house, safety in an earthquake (deep
              dives)
            </li>
          </ol>
          <p>
            At the end, <strong>explain the choices</strong>: "We put the kitchen here because…, and we chose this over
            that because…". These are the trade-offs. A trade-off means you give up one good thing to get another.
          </p>
          <p>
            A good system design follows the same shape. The framework keeps you <strong>organised</strong>. It makes sure
            you <strong>do not skip important questions</strong>. It also shows <strong>how you think</strong>, which matters
            more than any single "right answer".
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="key-terms">Key terms in plain words</h3>
          <ul>
            <li>
              <strong>Functional requirement:</strong> something the system must <em>do</em>, such as "shorten a URL".
            </li>
            <li>
              <strong>Non-functional requirement:</strong> how <em>well</em> the system must do it, such as how fast, how
              reliable or how big.
            </li>
            <li>
              <strong>QPS:</strong> queries per second, the number of requests the system gets each second.
            </li>
            <li>
              <strong>Latency and p99:</strong> latency is how long one request takes. "p99 under 50 ms" means 99 out of 100
              requests finish in less than 50 ms.
            </li>
            <li>
              <strong>Availability:</strong> the share of time the system works. "99.99%" allows only about 52 minutes of
              downtime a year.
            </li>
            <li>
              <strong>Back-of-the-envelope estimation:</strong> quick rough maths, like you would do on the back of an
              envelope, to learn how big the problem is.
            </li>
            <li>
              <strong>API (Application Programming Interface):</strong> the list of requests that other programs can send to
              your system, and the answers they get.
            </li>
            <li>
              <strong>Access pattern:</strong> how your data is read and written, for example "look up one row by its code".
            </li>
            <li>
              <strong>Bottleneck:</strong> the one part that is slowest, so it limits the whole system.
            </li>
            <li>
              <strong>SPOF (single point of failure):</strong> one part that, if it breaks, stops the whole system.
            </li>
            <li>
              <strong>Load balancer:</strong> a server that spreads incoming requests across several servers.
            </li>
            <li>
              <strong>Cache:</strong> a fast, small store that keeps copies of data that is read often, so you do not ask the slow database every time.
            </li>
            <li>
              <strong>CDN (content delivery network):</strong> a network of servers around the world that keeps copies of files close to users.
            </li>
            <li>
              <strong>Queue:</strong> a line of tasks waiting to be done. A program adds a task to the end, and a worker takes tasks from the front.
            </li>
            <li>
              <strong>Stateless:</strong> a server is stateless when it keeps no user data between requests, so any server can answer any request.
            </li>
            <li>
              <strong>Kafka:</strong> a popular system that stores a stream of messages so that many programs can read them. <strong>Microservices</strong> are
              many small programs that each do one job and talk over the network.
            </li>
            <li>
              <strong>Metadata:</strong> data about other data, for example the owner and expiry date of a paste.
            </li>
          </ul>
          <h3 id="the-five-steps-at-a-glance">The five steps at a glance</h3>
          <Flow
            caption="The five steps, with a rough time budget for a 45-minute interview."
            nodes={[
              { title: <>Requirements</>, desc: <>~5 min — what it does and how well; what is out of scope</> },
              { title: <>Estimation</>, desc: <>~5 min — QPS, storage, bandwidth: how big is this?</> },
              { title: <>API &amp; data model</>, desc: <>~5 min — the contract and the main access patterns</> },
              { title: <>High-level design</>, desc: <>~10 min — the fewest boxes and arrows that work end to end</> },
              {
                title: <>Deep dives</>,
                desc: <>~15 min — bottlenecks, failures, scaling, the interesting parts</>,
                tone: "warn",
              },
              { title: <>Wrap-up</>, desc: <>~5 min — trade-offs made, what you would do next</>, tone: "good" },
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
            <strong>Never start designing right away.</strong> Ask questions until the problem is clear (post 6).
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
              What is <strong>out of scope</strong> (not part of this design)? Say it out loud: "I will skip payments and admin tools for now."
            </li>
          </ul>
          <p>
            <strong>Non-functional requirements: how well must it do it?</strong>
          </p>
          <ul>
            <li>
              <strong>Scale:</strong> daily active users (people who use it each day), requests per second, data size, and growth.
            </li>
            <li>
              <strong>Latency:</strong> how fast must the key actions feel (p99 targets, post 8)?
            </li>
            <li>
              <strong>Availability:</strong> how bad is downtime (post 9)? Which parts are critical?
            </li>
            <li>
              <strong>Consistency:</strong> is slightly old (stale) data OK, or must every user see the exact latest data (posts 27–28)?
            </li>
            <li>
              <strong>Durability:</strong> may we ever lose saved data? (Durable data stays safe even after crashes.)
            </li>
            <li>
              <strong>Read/write ratio:</strong> is it read-heavy (feeds, product catalogues) or write-heavy (logs, chat)?
            </li>
            <li>
              <strong>Limits from geography, security, compliance (legal rules) and cost.</strong>
            </li>
          </ul>
          <p>
            <strong>Write them down</strong>, and check them with the other person:
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
            Do <strong>quick maths</strong> to learn the <strong>size</strong> of the problem (post 10):
          </p>
          <ul>
            <li>
              <strong>Traffic:</strong> the average QPS and the <strong>peak</strong> QPS (the busiest moment), for reads and writes separately.
            </li>
            <li>
              <strong>Storage:</strong> per item × items per day × retention.
            </li>
            <li>
              <strong>Bandwidth:</strong> QPS × response size.
            </li>
            <li>
              <strong>Memory:</strong> how much hot data (data that is read often) to keep in a cache. The 80/20 rule says that about 20% of the data gets about 80% of the reads.
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
            Do not spend 15 minutes on arithmetic. <strong>Round the numbers a lot.</strong> The goal is{" "}
            the <strong>order of magnitude</strong>, which means "is it about 10, 1,000 or 1,000,000?".
          </p>
          <h3 id="step-3-define-the-api-and-data-model">Step 3: Define the API and data model</h3>
          <p>
            <strong>API.</strong> Write down the main endpoints (the URLs a client can call) or operations (posts 30–34). In the example, a 301 redirect is cached by browsers, and a 302 redirect is not:
          </p>
          <CodeBlock lang="http" code={code1} />
          <p>Think about:</p>
          <ul>
            <li>
              <strong>idempotency</strong> for creates (it means that sending the same request twice has the same effect as sending it once, post 34),
            </li>
            <li>
              <strong>pagination</strong> for lists (returning a long list in small pages),
            </li>
            <li>
              <strong>authentication</strong> (checking who the caller is) and <strong>rate limits</strong> (a cap on how many requests one caller may send, posts 43 and 49),
            </li>
            <li>
              <strong>sync vs async:</strong> does the client need the result now (synchronous), or can the work run later as a background job (asynchronous, post 18)?
            </li>
            <li>
              whether <strong>REST, gRPC, GraphQL or WebSockets</strong> fits best. These are different styles for programs to talk to each other (posts 30–33).
            </li>
          </ul>
          <p>
            <strong>Data model.</strong> List the core <strong>entities</strong> (the main kinds of things you store, like a user or a URL), their key fields, and the{" "}
            <strong>access patterns</strong>. In the example, PK means primary key, the field that identifies each row:
          </p>
          <CodeBlock code={code2} />
          <p>
            Then choose the storage based on those patterns (posts 20 and 29): relational, key-value, wide-column, document,
            search or object storage.
          </p>
          <h3 id="step-4-high-level-design">Step 4: High-level design</h3>
          <p>
            Draw the <strong>main components and the flow of data</strong> that cover the core use cases{" "}
            <strong>from start to finish</strong>. Start <strong>simple</strong>, then improve it step by step:
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
            <li>Use the standard building blocks (post 11). Do not invent strange new components.</li>
            <li>
              Mark what is <strong>synchronous</strong> and what is <strong>asynchronous</strong>.
            </li>
            <li>
              Show where the <strong>data lives</strong> and which service <strong>owns</strong> it (the only one allowed to change it).
            </li>
            <li>
              Keep it <strong>readable</strong>: 6–12 boxes, not 40.
            </li>
          </ul>
          <h3 id="step-5-deep-dives-and-scaling">Step 5: Deep dives and scaling</h3>
          <p>
            Now go deeper on the <strong>hardest or most important parts</strong>. Pick 2–3 topics that matter most{" "}
            <strong>for this system</strong>, or follow what the interviewer asks:
          </p>
          <p>
            <strong>Scaling:</strong>
          </p>
          <ul>
            <li>
              Where is the <strong>bottleneck</strong> when traffic grows 10 or 100 times?
            </li>
            <li>
              <strong>Cache</strong> hot data (posts 15–16). <strong>CDN</strong> for static content (post 14).
            </li>
            <li>
              <strong>Read replicas</strong> (extra copies of the database that only answer reads, post 24). <strong>Sharding</strong> (splitting data across several databases), with a clear shard key, the field that decides which database holds a row (posts 25–26).
            </li>
            <li>
              <strong>Queues</strong> to soak up sudden spikes of work (posts 18 and 35).
            </li>
          </ul>
          <p>
            <strong>Reliability:</strong>
          </p>
          <ul>
            <li>
              <strong>SPOFs</strong> and redundancy (spare copies) across AZs, which are separate data centres (post 40).
            </li>
            <li>
              <strong>Timeouts, retries and circuit breakers</strong> (a circuit breaker stops calling a service that keeps failing, posts 41–42).
            </li>
            <li>
              <strong>Rate limiting and load shedding</strong> (load shedding means dropping some requests on purpose so the rest still work, posts 43–44).
            </li>
            <li>
              <strong>Backups and DR</strong> (disaster recovery: how you get running again after a big failure, post 45).
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
              <strong>Transactions</strong> (a group of changes that all happen or none happen), idempotency, handling duplicates and keeping the right order (posts 21, 34 and 37).
            </li>
          </ul>
          <p>
            <strong>Operability and security:</strong>
          </p>
          <ul>
            <li>
              <strong>Monitoring and SLOs:</strong> what would you alert on? An SLO (service level objective) is a reliability target, such as "99.9% of requests succeed" (posts 46–48).
            </li>
            <li>
              <strong>AuthN / AuthZ</strong>, sensitive data and abuse. AuthN (authentication) checks who you are. AuthZ (authorization) checks what you are allowed to do (posts 49–52).
            </li>
            <li>
              <strong>Deployments:</strong> how do you ship changes safely (post 58)?
            </li>
          </ul>
          <p>
            <strong>Good deep dives compare options:</strong> "We could do A or B. A is simpler but fails when X. Given
            our requirement of Y, I would choose B."
          </p>
          <h3 id="wrap-up-trade-offs-and-next-steps">Wrap-up: trade-offs and next steps</h3>
          <p>Finish by summing up:</p>
          <ul>
            <li>
              <strong>Key decisions and why</strong> (for example "hybrid fan-out, because of celebrity accounts". Fan-out means copying one post to many followers' feeds).
            </li>
            <li>
              <strong>Trade-offs accepted</strong> ("feeds may be a few seconds stale").
            </li>
            <li>
              <strong>Risks and bottlenecks</strong> you would watch.
            </li>
            <li>
              <strong>What you would do next</strong> with more time ("multi-region, better ranking, analytics").
            </li>
          </ul>
          <hr />
          <h3 id="a-mini-example-design-pastebin-in-5-steps">A mini example: "Design Pastebin" in 5 steps</h3>
          <ol>
            <li>
              <strong>Requirements:</strong> users paste text and get a link, and anyone with the link can read it. Pastes can optionally expire and are up to 1 MB. The system is read-heavy (about 10:1), and pastes must not be lost.
            </li>
            <li>
              <strong>Estimation:</strong> 1M new pastes a day ≈ 12 writes/s. 10M reads a day ≈ 120 reads/s (peak around
              500/s). With an average paste of 10 KB, that is 10 GB a day ≈ 3.6 TB a year.
            </li>
            <li>
              <strong>API and data:</strong> <code>POST /pastes</code> returns <code>&#123;id&#125;</code>, and{" "}
              <code>GET /pastes/&#123;id&#125;</code> returns the content. Metadata (data about the paste, like owner and expiry) goes in a database. The content goes in{" "}
              <strong>object storage</strong>, a cheap service for storing big files (post 17).
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
              <strong>Deep dives:</strong> making IDs (random Base62 vs counters; Base62 uses the 62 characters a–z, A–Z and 0–9), caching popular pastes, cleaning up
              expired pastes, abuse (spam, malware, rate limits), and CDN caching rules.
            </li>
          </ol>
          <p>
            Wrap-up: this is a simple, read-heavy design. Caching and a CDN (a network that serves copies of files from places near the user) give most of the scale, and object
            storage keeps the database small.
          </p>
          <h3 id="common-mistakes">Common mistakes</h3>
          <ul>
            <li>
              ❌ <strong>Jumping into details</strong> (Kafka partitions, database choice) before the requirements are
              clear.
            </li>
            <li>
              ❌ <strong>Designing for Google scale</strong> when the real need is 1,000 users.
            </li>
            <li>
              ❌ <strong>Silent thinking.</strong> Explain your reasoning as you go. The process matters.
            </li>
            <li>
              ❌ <strong>Buzzword architecture:</strong> adding trendy tools like microservices, Kafka, Kubernetes and GraphQL without
              saying <em>why</em>.
            </li>
            <li>
              ❌ <strong>Ignoring failure:</strong> acting as if every component always works.
            </li>
            <li>
              ❌ <strong>No trade-offs:</strong> showing one option as perfect. Every choice has a cost.
            </li>
            <li>
              ❌ <strong>Spending all the time on one part</strong> and never finishing the design from start to finish.
            </li>
            <li>
              ❌ <strong>Not checking back</strong> with the interviewer or stakeholders (people who care about the result), for example "Does this match what you had
              in mind?".
            </li>
          </ul>
          <h3 id="communication-tips">Communication tips</h3>
          <ul>
            <li>
              <strong>Think out loud</strong>, and <strong>say your assumptions</strong> clearly ("I will assume 50M daily
              users").
            </li>
            <li>
              <strong>Check in</strong> at the end of each step.
            </li>
            <li>
              <strong>Start simple, then improve:</strong> "Version 1 is a single database. At 10 times the traffic we would add…"
            </li>
            <li>
              <strong>Use numbers</strong> to support your decisions.
            </li>
            <li>
              <strong>Admit uncertainty:</strong> "I am not sure about the exact limits of X, but I would check with a load
              test."
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>A structured framework</strong> makes sure you miss nothing important. But if you follow it too strictly,
              it can feel like a robot. Change how deep you go in each step to fit the problem.
            </li>
            <li>
              <strong>Time on requirements vs design:</strong> too little time on requirements leads to the wrong design, and too much leaves
              no time to design. Aim for clarity, not perfection.
            </li>
            <li>
              <strong>Breadth vs depth:</strong> cover the whole system first, then go deep on 2–3 areas. You cannot go deep
              everywhere in a short time.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Design docs at big tech companies.</strong> Companies like Google, Uber and many others write a{" "}
            <strong>design document</strong> or <strong>RFC</strong> (request for comments, a document that others review) before they build big systems. These usually
            include the background, goals and <strong>non-goals</strong> (things you will not do), the proposed design,{" "}
            <strong>other options that were considered</strong>, and topics that touch every part (security, privacy, monitoring, rollout
            plan). This is the same framework in written form.
          </p>
          <p>
            <strong>Amazon's "working backwards".</strong> Amazon teams often start with a{" "}
            <strong>press release and FAQ</strong> (a PR/FAQ). It describes the product from the customer's point of view,{" "}
            <em>before</em> any design. It makes the team get clear on the <strong>functional requirements</strong> and
            the customer value first. This is exactly step 1.
          </p>
          <p>
            <strong>Architecture Decision Records.</strong> Many teams write down important decisions as short{" "}
            <strong>ADRs</strong> (Architecture Decision Records, post 6). An ADR has the context, the decision, the other options and the results. It is the "wrap-up and
            trade-offs" step, saved for future engineers.
          </p>
          <p>
            <strong>System design interviews.</strong> Most large tech companies have system design rounds for
            mid-level and senior engineers. Interviewers usually look for{" "}
            <strong>
              structured thinking, clear requirements, sensible estimates, a working end-to-end design, and thoughtful
              trade-offs
            </strong>
            , not architectures learned by heart.
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
                      Clarify the requirements. Pin down the core features and what is out of scope. Then write the non-functional
                      requirements as numbers: scale, read/write ratio, latency, availability and consistency needs.
                      Do this before you draw anything.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why do an estimate before designing?</>,
                a: (
                  <>
                    <p>
                      The numbers decide the architecture. 40 writes a second fit on one primary database, but 400,000
                      do not. Estimation tells you whether you need caching, sharding, CDNs or queues, and where to
                      spend your deep-dive time.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you choose what to deep-dive on?</>,
                a: (
                  <>
                    <p>
                      Follow the bottlenecks that your estimate shows, and the requirement that is hardest to meet. Examples are the busy
                      read path, the table with many writes, or the flow where consistency is critical. Also look at the ways
                      your design can fail. Ask the interviewer which area interests them.
                    </p>
                  </>
                ),
              },
              {
                q: <>What are common system design interview mistakes?</>,
                a: (
                  <>
                    <p>
                      Jumping into components before the requirements, building for a scale nobody asked for,
                      naming technologies without explaining the trade-offs, ignoring how things fail, staying silent
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
                      Sum up the design and compare it with the requirements. State the key trade-offs you made and why. Point
                      out the weak spots you know about. Say what you would add next with more time or more scale, such as monitoring,
                      multi-region or analytics.
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
              <strong>Explain trade-offs</strong> and assumptions out loud. There is no single right answer, only
              answers with good reasons.
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
