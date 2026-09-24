import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Compare, Flow, Layers, QA } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import Backoff from "@/components/sd/widgets/Backoff";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-38")!;

export const metadata: Metadata = {
  title: `Lesson 38 — ${lesson.title}`,
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

const code1 = `// BullMQ example: enqueue in the request, process in a worker
await emailQueue.add("welcome", { userId: 42 }, { attempts: 5, backoff: { type: "exponential", delay: 2000 } });

new Worker("email", async (job) => {
  await sendWelcomeEmail(job.data.userId);   // should be idempotent (post 37)!
});`;

export default function SdLessonThreeEightPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>Your app has a lot of work that shouldn't happen inside a web request:</p>
          <ul>
            <li>sending welcome emails,</li>
            <li>generating a 40-page PDF report,</li>
            <li>transcoding uploaded videos,</li>
            <li>cleaning up expired sessions every night,</li>
            <li>syncing data to a partner's API that is slow and often down.</li>
          </ul>
          <p>You move it all into background jobs, and things get better, until:</p>
          <ul>
            <li>
              one malformed job <strong>fails forever</strong> and blocks everything behind it,
            </li>
            <li>
              a partner API outage causes <strong>millions of retries</strong> that make the outage worse,
            </li>
            <li>
              a nightly cleanup job <strong>runs twice</strong> because two servers both thought they should run it,
            </li>
            <li>
              a deploy <strong>kills</strong> a half-finished video transcode.
            </li>
          </ul>
          <p>
            Background jobs are simple to start and surprisingly easy to get wrong. This post covers how to run them
            reliably, and what to do with the jobs that <strong>keep failing</strong>.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about a <strong>laundry service</strong>.
          </p>
          <ul>
            <li>
              Customers drop off bags (jobs) at the counter and get a receipt immediately (the request returns fast).
            </li>
            <li>Washers (workers) take bags from the pile and process them.</li>
            <li>
              <strong>Express bags</strong> go in a separate pile so they're not stuck behind huge wedding loads
              (priority queues).
            </li>
            <li>
              If a machine jams, they <strong>try again</strong> later, not instantly and not forever.
            </li>
            <li>
              If a bag <strong>can't</strong> be washed (a strange fabric, no label), it goes to a{" "}
              <strong>"problem shelf"</strong> where a manager decides what to do. It doesn't stay in the main pile
              blocking others. That shelf is the <strong>dead-letter queue</strong>.
            </li>
          </ul>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="task-queues-vs-message-brokers">Task queues vs message brokers</h3>
          <ul>
            <li>
              A <strong>message broker</strong> (RabbitMQ, SQS, Redis, Kafka) moves messages.
            </li>
            <li>
              A <strong>task queue framework</strong> runs <strong>jobs</strong> on top of a broker, with helpful
              features: retries, scheduling, priorities, job status and dashboards.
            </li>
          </ul>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Framework</th>
                  <th>Language</th>
                  <th>Typical broker</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Celery</strong>
                  </td>
                  <td>Python</td>
                  <td>RabbitMQ, Redis</td>
                </tr>
                <tr>
                  <td>
                    <strong>Sidekiq</strong>
                  </td>
                  <td>Ruby</td>
                  <td>Redis</td>
                </tr>
                <tr>
                  <td>
                    <strong>BullMQ</strong>
                  </td>
                  <td>Node.js</td>
                  <td>Redis</td>
                </tr>
                <tr>
                  <td>
                    <strong>RQ</strong>
                  </td>
                  <td>Python</td>
                  <td>Redis</td>
                </tr>
                <tr>
                  <td>
                    <strong>Hangfire</strong>
                  </td>
                  <td>.NET</td>
                  <td>SQL Server, Redis</td>
                </tr>
                <tr>
                  <td>
                    <strong>Laravel Queues / Horizon</strong>
                  </td>
                  <td>PHP</td>
                  <td>Redis, SQS, database</td>
                </tr>
                <tr>
                  <td>
                    <strong>Cloud Tasks / SQS + Lambda</strong>
                  </td>
                  <td>Any</td>
                  <td>Managed</td>
                </tr>
              </tbody>
            </table>
          </div>
          <CodeBlock lang="js" code={code1} />
          <h3 id="designing-good-jobs">Designing good jobs</h3>
          <p>
            <strong>1. Keep job payloads small: pass IDs, not whole objects.</strong>
          </p>
          <Compare
            caption="Pass IDs, not objects."
            columns={[
              {
                title: <>✅ Small payload</>,
                items: [
                  { sign: "+", text: <>&#123; "userId": 42 &#125;</> },
                  { sign: "+", text: <>The worker loads fresh data when it runs</> },
                  { sign: "+", text: <>Tiny queue footprint</> },
                ],
              },
              {
                title: <>❌ Whole object</>,
                items: [
                  { sign: "-", text: <>&#123; "user": &#123; …200 fields… &#125; &#125;</> },
                  { sign: "-", text: <>Stale by the time the job runs</> },
                  { sign: "-", text: <>Bloats the queue and leaks data into logs</> },
                ],
              },
            ]}
          />
          <p>
            <strong>2. Make every job idempotent.</strong> Jobs <strong>will</strong> run more than once, because of
            retries, crashes and redeliveries (post 37). "Send welcome email" should check "already sent?" first.
            "Charge invoice" should use an idempotency key.
          </p>
          <p>
            <strong>3. Make big jobs resumable, or split them.</strong> A job processing 1 million rows should work in{" "}
            <strong>chunks</strong> (like 1,000 rows each) and record progress, or fan out into many small jobs. Then a
            crash means redoing 1,000 rows, not 1 million.
          </p>
          <p>
            <strong>4. Set timeouts.</strong> A job stuck forever holds a worker forever. Give each job type a sensible
            maximum run time.
          </p>
          <p>
            <strong>5. Separate queues by priority and duration.</strong>
          </p>
          <Layers
            caption="Separate queues by urgency, so a flood of reports never delays an OTP."
            layers={[
              {
                name: <>critical</>,
                tech: <>OTPs, password resets, payment webhooks</>,
                desc: <>few, fast, dedicated workers</>,
              },
              { name: <>default</>, tech: <>emails, notifications</>, desc: <>normal priority</> },
              { name: <>bulk</>, tech: <>reports, exports, backfills</>, desc: <>slow, can wait</> },
            ]}
          />
          <p>
            This way, a flood of slow report jobs never delays OTP emails. Give each queue its own workers, or weighted
            priority.
          </p>
          <h3 id="workers-in-practice">Workers in practice</h3>
          <ul>
            <li>
              <strong>Concurrency:</strong> each worker process can run several jobs at once (threads, async or
              processes, post 4). Tune this to your workload: CPU-bound jobs get fewer, I/O-bound jobs get more.
            </li>
            <li>
              <strong>Prefetch:</strong> how many jobs a worker grabs in advance. Too high, and one worker hoards jobs
              while others sit idle.
            </li>
            <li>
              <strong>Visibility timeouts and heartbeats:</strong> long jobs must <strong>extend</strong> their lease
              (post 18). Otherwise the queue assumes the worker died and hands the job to someone else,{" "}
              <strong>while the first worker is still running it</strong>.
            </li>
            <li>
              <strong>Graceful shutdown:</strong> on deploy, workers should <strong>stop taking new jobs</strong>,
              finish (or safely release) current ones, then exit. Configure a shutdown grace period long enough for
              typical jobs.
            </li>
            <li>
              <strong>Auto-scaling on queue depth and job age,</strong> not only CPU.
            </li>
          </ul>
          <h3 id="scheduled-and-recurring-jobs">Scheduled and recurring jobs</h3>
          <ul>
            <li>
              <strong>Delayed jobs:</strong> "send a reminder in 24 hours", "retry in 5 minutes". Most frameworks
              support scheduling a job for later.
            </li>
            <li>
              <strong>Recurring jobs (cron):</strong> "every night at 2 AM, clean up expired sessions".
            </li>
          </ul>
          <p>
            <strong>The distributed cron problem:</strong> if you run the cron schedule on <strong>every</strong>{" "}
            server, the job runs <strong>N times</strong>. Solutions:
          </p>
          <ul>
            <li>
              a <strong>single scheduler</strong> process (with a standby) that enqueues the job once,
            </li>
            <li>
              <strong>leader election</strong> or a <strong>distributed lock</strong> (for example, a Redis lock with a
              TTL, or a database advisory lock) so only one instance runs it,
            </li>
            <li>
              platform features like <strong>Kubernetes CronJobs</strong> or cloud schedulers,
            </li>
            <li>
              and, as always, making the job <strong>idempotent</strong>, so an accidental double run is harmless.
            </li>
          </ul>
          <h3 id="workflow-engines-for-multi-step-jobs">Workflow engines for multi-step jobs</h3>
          <p>
            Some "jobs" are really <strong>long, multi-step processes</strong>: "charge card → reserve stock → book
            courier → send confirmation", and if booking fails, refund the card. Coding this as a chain of queued jobs
            with manual state tracking gets messy.
          </p>
          <p>
            <strong>Workflow engines</strong> handle the state, retries, timeouts and compensation for you:
          </p>
          <ul>
            <li>
              <strong>Temporal</strong> (created by engineers who originally built Uber's Cadence),
            </li>
            <li>
              <strong>AWS Step Functions</strong>,
            </li>
            <li>
              <strong>Apache Airflow</strong> (for data pipelines),
            </li>
            <li>
              <strong>Azure Durable Functions</strong>.
            </li>
          </ul>
          <p>
            These connect directly to <strong>sagas</strong> (post 39).
          </p>
          <hr />
          <h3 id="retries">Retries</h3>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Transient vs permanent failures</h4>
          <p>
            Before retrying, ask: <strong>will trying again help?</strong>
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Failure</th>
                  <th>Type</th>
                  <th>Retry?</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Timeout, connection reset, 503, 429</td>
                  <td>
                    <strong>Transient</strong>
                  </td>
                  <td>✅ Yes, with backoff</td>
                </tr>
                <tr>
                  <td>Database deadlock / serialization failure</td>
                  <td>
                    <strong>Transient</strong>
                  </td>
                  <td>✅ Yes</td>
                </tr>
                <tr>
                  <td>400 Bad Request, invalid data, missing record</td>
                  <td>
                    <strong>Permanent</strong>
                  </td>
                  <td>❌ No: retrying won't fix it</td>
                </tr>
                <tr>
                  <td>401/403 (bad credentials)</td>
                  <td>
                    Usually <strong>permanent</strong>
                  </td>
                  <td>❌ Alert humans</td>
                </tr>
                <tr>
                  <td>Bug in your code</td>
                  <td>
                    <strong>Permanent</strong> (until fixed)
                  </td>
                  <td>❌ Park it, fix, then replay</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>Retrying permanent failures wastes resources and delays everything else.</p>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Retry with exponential backoff and jitter</h4>
          <p>Don't retry immediately and don't retry forever:</p>
          <Backoff caption="Forty jobs fail at the same moment and retry five times. Compare fixed retries, exponential backoff, and backoff with jitter by the spikes they send at a recovering service." />
          <p>
            Add <strong>random jitter</strong> (for example, wait between 0 and 8 seconds instead of exactly 8), so
            thousands of failed jobs <strong>don't all retry at the same instant</strong> and hammer the recovering
            service. (Post 41 covers this in depth.)
          </p>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Retry storms</h4>
          <p>When a downstream service (like a partner API) goes down:</p>
          <ul>
            <li>every job fails and retries,</li>
            <li>the retries add load exactly when the service is weakest,</li>
            <li>its recovery is delayed, which causes more failures and more retries.</li>
          </ul>
          <p>Protections:</p>
          <ul>
            <li>
              <strong>cap attempts</strong> per job,
            </li>
            <li>
              use <strong>backoff with jitter</strong>,
            </li>
            <li>
              keep <strong>retry budgets</strong> (for example, "retries may add at most 10% extra load"),
            </li>
            <li>
              use <strong>circuit breakers</strong>: after many failures, pause calls to that service for a while (post
              42),
            </li>
            <li>
              <strong>rate-limit</strong> workers that call fragile third parties.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Retries and ordering</h4>
          <p>
            Queues with strict ordering (Kafka partitions, FIFO queues) have a special problem: if message #5 fails and
            you retry it in place, <strong>every message behind it waits</strong>. That's head-of-line blocking again.
            The common solution is <strong>retry topics</strong>:
          </p>
          <Flow
            caption="Retry topics keep the main stream moving while failures wait."
            nodes={[
              { title: <>Main topic</>, desc: <>consumer processes normally</> },
              { title: <>retry-1m topic</>, desc: <>re-consumed after 1 minute</>, label: <>fails</> },
              { title: <>retry-10m topic</>, desc: <>re-consumed after 10 minutes</>, label: <>fails again</> },
              {
                title: <>DLQ topic</>,
                desc: <>parked, alerted on, replayed after a fix</>,
                label: <>still failing</>,
                tone: "bad",
              },
            ]}
          />
          <p>
            The main topic keeps flowing while failed messages wait in separate topics with increasing delays. (Accept
            that this breaks strict ordering for the failed messages, or hold back later messages for the same key if
            order really matters.)
          </p>
          <hr />
          <h3 id="dead-letter-queues-dlqs">Dead-letter queues (DLQs)</h3>
          <p>
            A <strong>dead-letter queue</strong> is where messages go after they've{" "}
            <strong>failed too many times</strong> (or are clearly invalid). It's the "problem shelf".
          </p>
          <Flow
            caption="The life of a job that keeps failing."
            nodes={[
              { title: <>Worker picks up the job</>, desc: <>attempt 1</> },
              { title: <>Fails — transient?</>, desc: <>retry with backoff + jitter, up to N times</>, tone: "warn" },
              {
                title: <>Still failing</>,
                desc: <>move to the dead-letter queue with the error, stack trace and attempt count</>,
                tone: "bad",
              },
              { title: <>Alert fires</>, desc: <>DLQ size or growth crossed a threshold</> },
              { title: <>Engineer inspects</>, desc: <>fixes the bug or the bad data</> },
              {
                title: <>Redrive</>,
                desc: <>replay to the main queue, rate-limited, with idempotent consumers</>,
                tone: "good",
              },
            ]}
          />
          <p>
            <strong>Why DLQs matter:</strong>
          </p>
          <ul>
            <li>
              <strong>Poison messages</strong> (ones that always fail) stop blocking or wasting workers.
            </li>
            <li>
              <strong>Nothing is silently lost.</strong> Failed work is kept for investigation.
            </li>
            <li>
              After fixing the bug or data, you can <strong>replay</strong> them.
            </li>
          </ul>
          <p>
            <strong>Built-in support:</strong>
          </p>
          <ul>
            <li>
              <strong>Amazon SQS:</strong> a "redrive policy" moves a message to a DLQ after{" "}
              <code>maxReceiveCount</code> failed receives. There's also a "redrive" feature to move messages back.
            </li>
            <li>
              <strong>RabbitMQ:</strong> dead-letter exchanges, where rejected or expired messages are routed to another
              exchange.
            </li>
            <li>
              <strong>Kafka:</strong> no built-in DLQ; you build it with retry and DLQ topics (Kafka Connect and many
              frameworks provide this).
            </li>
            <li>
              <strong>Task frameworks:</strong> Sidekiq's "Dead" set, Celery and BullMQ failed-job lists.
            </li>
          </ul>
          <p>
            <strong>DLQ best practices:</strong>
          </p>
          <ol>
            <li>
              <strong>Alert on DLQ size and growth.</strong> A DLQ nobody watches is a black hole.
            </li>
            <li>
              <strong>Store context</strong> with each dead message: the error, stack trace, attempt count and
              timestamps.
            </li>
            <li>
              <strong>Build tooling</strong> to inspect, fix and <strong>safely replay</strong> messages, individually
              or in bulk.
            </li>
            <li>
              <strong>Replay carefully:</strong> make sure the bug is fixed and consumers are idempotent. Replaying
              50,000 messages at once can overload systems, so rate-limit it.
            </li>
            <li>
              <strong>Set retention.</strong> DLQ messages expire too (SQS keeps them for up to 14 days), so act within
              that window.
            </li>
          </ol>
          <h3 id="what-to-monitor">What to monitor</h3>
          <ul>
            <li>
              <strong>Queue depth</strong> (jobs waiting) and <strong>oldest job age</strong>. Age is often the better
              signal: "OTP jobs are 3 minutes old" is an incident.
            </li>
            <li>
              <strong>Throughput</strong> (jobs processed per second) and <strong>failure rate</strong> per job type.
            </li>
            <li>
              <strong>Retry counts</strong> and <strong>DLQ size</strong>.
            </li>
            <li>
              <strong>Job duration</strong> (p50/p99), to catch slow jobs before they time out.
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Background jobs:</strong> fast responses and resilience, but results arrive later, and you need
              workers, a queue and monitoring.
            </li>
            <li>
              <strong>Aggressive retries:</strong> recover quickly from blips, but risk retry storms and duplicate side
              effects.
            </li>
            <li>
              <strong>Few retries:</strong> low load, but more work ends up in the DLQ needing manual handling.
            </li>
            <li>
              <strong>Retry topics:</strong> keep the main flow moving, but more topics to manage and relaxed ordering.
            </li>
            <li>
              <strong>Workflow engines:</strong> great for complex multi-step processes, but another system to learn and
              run.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>GitHub and Resque.</strong> GitHub created <strong>Resque</strong>, a Redis-backed Ruby job queue,
            to run its background work, and open-sourced it in 2009. It inspired many later tools (including Sidekiq),
            and shows how central background jobs are to web applications.
          </p>
          <p>
            <strong>Uber's retries and DLQs on Kafka.</strong> Uber wrote about building reliable reprocessing on Kafka
            using <strong>retry topics with increasing delays</strong> and <strong>dead-letter topics</strong>, so
            failed messages don't block real-time pipelines and can be replayed after fixes.
          </p>
          <p>
            <strong>Slack's job queue.</strong> Slack has written about scaling its job queue (which runs work like
            message indexing, notifications and link previews) after an incident in which its Redis-based queue became
            overloaded. It added Kafka in front as a durable buffer, a good example of treating the job system itself as
            critical infrastructure.
          </p>
          <p>
            <strong>Temporal at many companies.</strong> Temporal grew out of Cadence, which was built at Uber to run
            long-running workflows reliably. Companies now use it for order fulfilment, payments, onboarding flows and
            infrastructure automation, where retries, timeouts and compensation must be handled carefully.
          </p>
          <p>
            <strong>Email and OTP delivery.</strong> Transactional email and SMS systems typically use separate
            high-priority queues for OTPs and password resets, with aggressive monitoring of <strong>job age</strong>,
            because an OTP arriving after it has expired is as bad as never sending it.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>Which failures should a job retry?</>,
                a: (
                  <>
                    <p>
                      Transient ones: timeouts, connection resets, 429 and 503 responses, deadlocks and serialization
                      failures. Not permanent ones like 400 validation errors, missing records, bad credentials or code
                      bugs — those should go to a DLQ or alert a human, because retrying only wastes capacity.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is a retry storm, and how do you prevent it?</>,
                a: (
                  <>
                    <p>
                      When a dependency fails, every client retries and the extra load keeps it down. Prevent it with
                      capped attempts, exponential backoff with jitter, retry budgets, circuit breakers and rate limits
                      on calls to fragile services.
                    </p>
                  </>
                ),
              },
              {
                q: <>What's a dead-letter queue for?</>,
                a: (
                  <>
                    <p>
                      It holds messages that failed repeatedly or are invalid, so poison messages stop blocking or
                      wasting workers and nothing is silently lost. Alert on it, store error context with each message,
                      and replay after fixing the cause.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you stop a cron job from running on every server?</>,
                a: (
                  <>
                    <p>
                      Run the schedule in a single scheduler (with a standby), use leader election or a distributed lock
                      with a TTL, or use Kubernetes CronJobs or a cloud scheduler — and make the job idempotent so an
                      accidental double run is harmless.
                    </p>
                  </>
                ),
              },
              {
                q: <>A long-running job is processed twice even though it never failed. Why?</>,
                a: (
                  <>
                    <p>
                      Its visibility timeout or lease expired while it was still running, so the queue assumed the
                      worker died and gave the job to another worker. Extend the lease with heartbeats, set timeouts
                      longer than the job, or split it into smaller chunks.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do workers handle deploys safely?</>,
                a: (
                  <>
                    <p>
                      On SIGTERM they stop taking new jobs, finish or safely release in-flight ones within a grace
                      period, then exit. Long jobs should checkpoint progress so they can resume after a restart.
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
              Background jobs keep requests fast. Use <strong>task frameworks</strong> (Celery, Sidekiq, BullMQ…) on top
              of a broker.
            </li>
            <li>
              Design jobs to be <strong>small (pass IDs), idempotent, chunked, time-limited</strong>, and separated into{" "}
              <strong>priority queues</strong>.
            </li>
            <li>
              Handle <strong>graceful shutdown</strong>, <strong>lease extension</strong> for long jobs, and{" "}
              <strong>distributed cron</strong> (a single scheduler or locks, plus idempotency).
            </li>
            <li>
              <strong>Retry only transient failures</strong>, with <strong>exponential backoff + jitter</strong>, capped
              attempts and retry budgets. Beware <strong>retry storms</strong>.
            </li>
            <li>
              Send repeatedly failing messages to a <strong>dead-letter queue</strong>. <strong>Alert on it</strong>,
              inspect it, fix the cause, and <strong>replay safely</strong>.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>The System Design Primer on GitHub (section "Task queues")</li>
            <li>The Celery documentation and the Sidekiq wiki ("Best Practices")</li>
            <li>The Amazon SQS Developer Guide section on dead-letter queues</li>
            <li>The RabbitMQ documentation on dead letter exchanges</li>
            <li>
              Uber's engineering blog post "Building Reliable Reprocessing and Dead Letter Queues with Apache Kafka"
            </li>
            <li>The Temporal documentation</li>
            <li>The AWS Builders' Library article "Avoiding insurmountable queue backlogs"</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
