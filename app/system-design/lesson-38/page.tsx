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
          <p>
            A <strong>background job</strong> is a piece of work that runs outside the web request, so the user does
            not wait for it. A <strong>worker</strong> is a program that picks jobs from a queue and runs them. Your app
            has a lot of work that should not happen inside a web request:
          </p>
          <ul>
            <li>sending welcome emails,</li>
            <li>generating a 40-page PDF report,</li>
            <li>transcoding uploaded videos,</li>
            <li>cleaning up expired sessions every night,</li>
            <li>syncing data to a partner's API that is slow and often down.</li>
          </ul>
          <p>You move it all into background jobs, and things get better. Then problems start:</p>
          <ul>
            <li>
              one broken job <strong>fails forever</strong> and blocks everything behind it,
            </li>
            <li>
              a partner API outage causes <strong>millions of retries</strong> that make the outage worse,
            </li>
            <li>
              a nightly cleanup job <strong>runs twice</strong> because two servers both thought they should run it,
            </li>
            <li>
              a deploy <strong>stops</strong> a video conversion in the middle.
            </li>
          </ul>
          <p>
            Background jobs are easy to start, but also easy to get wrong. This post shows how to run them reliably,
            and what to do with jobs that <strong>keep failing</strong>.
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
              <strong>Express bags</strong> go in a separate pile, so they are not stuck behind huge wedding loads
              (priority queues).
            </li>
            <li>
              If a machine jams, the staff <strong>try again</strong> later. Not at once, and not forever.
            </li>
            <li>
              If a bag <strong>cannot</strong> be washed (a strange fabric, no label), it goes to a{" "}
              <strong>"problem shelf"</strong> where a manager decides what to do. It does not stay in the main pile
              and block the others. That shelf is the <strong>dead-letter queue</strong> (a queue that holds jobs
              which failed too many times).
            </li>
          </ul>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="task-queues-vs-message-brokers">Task queues vs message brokers</h3>
          <ul>
            <li>
              A <strong>message broker</strong> (RabbitMQ, SQS, Redis, Kafka) is a server that stores messages and
              passes them from senders to receivers.
            </li>
            <li>
              A <strong>task queue framework</strong> is a library that runs <strong>jobs</strong> on top of a broker.
              It adds useful features: retries, scheduling, priorities, job status and dashboards.
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
            <strong>1. Keep job payloads small: pass IDs, not whole objects.</strong> The payload is the data you put
            inside the job message.
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
            <strong>2. Make every job idempotent.</strong> Idempotent means running it many times gives the same result
            as running it once. Jobs <strong>will</strong> run more than once, because of retries, crashes and
            redelivery (post 37). "Send welcome email" should first check "already sent?". "Charge invoice" should use
            an idempotency key (a unique label that lets the receiver spot a repeat).
          </p>
          <p>
            <strong>3. Make big jobs resumable, or split them.</strong> A job that handles 1 million rows should work
            in <strong>chunks</strong> (for example 1,000 rows each) and save its progress. Or it can fan out into many
            small jobs. Then a crash means redoing 1,000 rows, not 1 million.
          </p>
          <p>
            <strong>4. Set timeouts.</strong> A timeout is a maximum time you allow. A job that is stuck forever holds a
            worker forever. Give each job type a sensible maximum run time.
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
            This way, a flood of slow report jobs never delays OTP emails (OTP means one-time password, a short code
            sent to a user). Give each queue its own workers, or give them weighted priority (a bigger share of worker
            time for important queues).
          </p>
          <h3 id="workers-in-practice">Workers in practice</h3>
          <ul>
            <li>
              <strong>Concurrency</strong> is how many jobs one worker runs at the same time (with threads, async code
              or processes, post 4). Tune it to your work. CPU-bound jobs (they spend time calculating) get a low
              number. I/O-bound jobs (they spend time waiting for networks or disks) get a higher number.
            </li>
            <li>
              <strong>Prefetch</strong> is how many jobs a worker takes from the queue in advance. If it is too high,
              one worker keeps many jobs while other workers sit idle.
            </li>
            <li>
              <strong>Visibility timeout and heartbeat.</strong> When a worker takes a job, the queue hides it for a
              set time. This is the visibility timeout, or lease. A heartbeat is a regular "I am still alive" signal.
              Long jobs must <strong>extend</strong> their lease (post 18). Otherwise the queue thinks the worker died
              and gives the job to someone else, <strong>while the first worker is still running it</strong>.
            </li>
            <li>
              <strong>Graceful shutdown</strong> means stopping in a clean way. On deploy, workers should{" "}
              <strong>stop taking new jobs</strong>, finish (or safely give back) their current jobs, then exit. Set a
              grace period (the time allowed to finish) that is long enough for typical jobs.
            </li>
            <li>
              <strong>Auto-scaling</strong> means adding or removing workers by itself. Base it on queue depth (how
              many jobs wait) and job age, not only on CPU.
            </li>
          </ul>
          <h3 id="scheduled-and-recurring-jobs">Scheduled and recurring jobs</h3>
          <ul>
            <li>
              <strong>Delayed jobs</strong> run later: "send a reminder in 24 hours", "retry in 5 minutes". Most
              frameworks can schedule a job for later.
            </li>
            <li>
              <strong>Recurring jobs (cron)</strong> run again and again on a time rule. Cron is the classic Unix
              scheduler. Example: "every night at 2 AM, clean up expired sessions".
            </li>
          </ul>
          <p>
            <strong>The distributed cron problem:</strong> if you run the cron schedule on <strong>every</strong>{" "}
            server, the job runs <strong>N times</strong> (once per server). Fixes:
          </p>
          <ul>
            <li>
              a <strong>single scheduler</strong> process (with a standby one ready) that adds the job to the queue
              once,
            </li>
            <li>
              <strong>leader election</strong> (the servers vote so that only one is in charge) or a{" "}
              <strong>distributed lock</strong> (a lock that all servers share, so only one can hold it). Examples are a
              Redis lock with a TTL (time to live: the lock frees itself after a set time) or a database advisory lock,
            </li>
            <li>
              platform features like <strong>Kubernetes CronJobs</strong> or cloud schedulers,
            </li>
            <li>
              and, as always, making the job <strong>idempotent</strong>, so an accidental double run does no harm.
            </li>
          </ul>
          <h3 id="workflow-engines-for-multi-step-jobs">Workflow engines for multi-step jobs</h3>
          <p>
            Some "jobs" are really <strong>long processes with many steps</strong>: "charge card → reserve stock → book
            courier → send confirmation". If booking fails, you must refund the card. Building this as a chain of queued
            jobs, with your own state tracking, gets messy.
          </p>
          <p>
            A <strong>workflow engine</strong> is a tool that runs multi-step processes for you. It keeps the state,
            and handles retries, timeouts and compensation (undo steps, like the refund):
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
            These tools are closely linked to <strong>sagas</strong> (a saga is a long process made of steps, where each
            step has an undo step, post 39).
          </p>
          <hr />
          <h3 id="retries">Retries</h3>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Transient vs permanent failures</h4>
          <p>
            A <strong>retry</strong> means running a failed job again. Before you retry, ask:{" "}
            <strong>will trying again help?</strong> A <strong>transient</strong> failure is short and goes away by
            itself. A <strong>permanent</strong> failure stays until someone fixes it.
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
                  <td>Database deadlock (two transactions wait for each other) / serialization failure</td>
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
          <p>
            <strong>Backoff</strong> means waiting before a retry. <strong>Exponential</strong> backoff makes the wait
            longer each time, for example 1s, 2s, 4s, 8s. Do not retry at once, and do not retry forever:
          </p>
          <Backoff caption="Forty jobs fail at the same moment and retry five times. Compare fixed retries, exponential backoff, and backoff with jitter by the spikes they send at a recovering service." />
          <p>
            Add <strong>random jitter</strong>. Jitter is a small random change to the wait time. For example, wait
            between 0 and 8 seconds instead of exactly 8. Then thousands of failed jobs{" "}
            <strong>do not all retry at the same instant</strong> and overload the service that is trying to recover.
            (Post 41 covers this in depth.)
          </p>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Retry storms</h4>
          <p>
            A <strong>retry storm</strong> is when many retries together overload a service that is already weak. It
            happens when a downstream service (a service you call, like a partner API) goes down:
          </p>
          <ul>
            <li>every job fails and retries,</li>
            <li>the retries add load exactly when the service is weakest,</li>
            <li>its recovery is delayed, which causes more failures and more retries.</li>
          </ul>
          <p>How to protect yourself:</p>
          <ul>
            <li>
              <strong>cap attempts</strong> per job (set a maximum number),
            </li>
            <li>
              use <strong>backoff with jitter</strong>,
            </li>
            <li>
              keep <strong>retry budgets</strong> (a limit on total retries, for example "retries may add at most 10%
              extra load"),
            </li>
            <li>
              use <strong>circuit breakers</strong>. A circuit breaker is like an electric fuse: after many failures it
              stops calls to that service for a while (post 42),
            </li>
            <li>
              <strong>rate-limit</strong> workers that call weak third-party services (a rate limit caps how many calls
              per second are allowed).
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Retries and ordering</h4>
          <p>
            Queues with strict order (Kafka partitions, FIFO queues) have a special problem. Say message #5 fails and
            you retry it in place. Then <strong>every message behind it must wait</strong>. This is called head-of-line
            blocking: one stuck item at the front of the line blocks all the others. The common fix is{" "}
            <strong>retry topics</strong> (a topic is a named message stream in Kafka):
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
            The main topic keeps flowing while failed messages wait in separate topics with longer and longer delays.
            This breaks strict order for the failed messages. If order really matters, hold back the later messages
            that have the same key.
          </p>
          <hr />
          <h3 id="dead-letter-queues-dlqs">Dead-letter queues (DLQs)</h3>
          <p>
            A <strong>dead-letter queue</strong> (DLQ) is a separate queue that holds messages after they have{" "}
            <strong>failed too many times</strong> (or are clearly invalid). It is the "problem shelf".
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
              <strong>Poison messages</strong> (messages that always fail) stop blocking workers or wasting their time.
            </li>
            <li>
              <strong>Nothing is lost without a sign.</strong> Failed work is kept so you can look at it.
            </li>
            <li>
              After you fix the bug or the data, you can <strong>replay</strong> (send again) the messages.
            </li>
          </ul>
          <p>
            <strong>Built-in support:</strong>
          </p>
          <ul>
            <li>
              <strong>Amazon SQS:</strong> a "redrive policy" moves a message to a DLQ after{" "}
              <code>maxReceiveCount</code> failed receives. There is also a "redrive" feature to move messages back.
            </li>
            <li>
              <strong>RabbitMQ:</strong> dead-letter exchanges. Rejected or expired messages are sent to another
              exchange.
            </li>
            <li>
              <strong>Kafka:</strong> there is no built-in DLQ for normal consumers. You build one with retry and DLQ
              topics (Kafka Connect sink connectors and many frameworks give you this).
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
              <strong>Alert on DLQ size and growth.</strong> A DLQ that nobody watches is a black hole.
            </li>
            <li>
              <strong>Store context</strong> with each dead message: the error, the stack trace (the list of function
              calls at the error), the attempt count and the times.
            </li>
            <li>
              <strong>Build tools</strong> to look at, fix and <strong>safely replay</strong> messages, one by one or
              in bulk.
            </li>
            <li>
              <strong>Replay with care.</strong> Make sure the bug is fixed and consumers are idempotent. Replaying
              50,000 messages at once can overload systems, so rate-limit it.
            </li>
            <li>
              <strong>Set retention</strong> (how long messages are kept). DLQ messages expire too. SQS keeps them for
              up to 14 days, so act within that time.
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
              <strong>Job duration</strong>, as p50 and p99. p50 is the typical time (half the jobs are faster). p99 is
              the slow end (99 of 100 jobs are faster). Watch it to catch slow jobs before they time out.
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
            <strong>GitHub and Resque.</strong> GitHub created <strong>Resque</strong>, a Ruby job queue that stores
            jobs in Redis. It used it for its background work and open-sourced it in 2009. It inspired many later tools
            (including Sidekiq). It shows how central background jobs are to web applications.
          </p>
          <p>
            <strong>Uber's retries and DLQs on Kafka.</strong> Uber wrote about building reliable reprocessing on Kafka.
            They used <strong>retry topics with longer and longer delays</strong> and{" "}
            <strong>dead-letter topics</strong>. So failed messages do not block real-time pipelines, and can be
            replayed after a fix.
          </p>
          <p>
            <strong>Slack's job queue.</strong> Slack has written about scaling its job queue. The queue runs work like
            message indexing, notifications and link previews. An incident overloaded its Redis-based queue. Slack then
            added Kafka in front as a durable buffer (a safe place to hold jobs). It is a good example of treating the
            job system itself as critical infrastructure.
          </p>
          <p>
            <strong>Temporal at many companies.</strong> Temporal grew out of Cadence, which was built at Uber to run
            long workflows reliably. Companies now use it for order fulfilment, payments, onboarding flows and
            infrastructure automation. In these cases retries, timeouts and compensation must be handled with care.
          </p>
          <p>
            <strong>Email and OTP delivery.</strong> Transactional email and SMS systems (those that send messages
            caused by a user action) usually use separate high-priority queues for OTPs and password resets. They watch{" "}
            <strong>job age</strong> closely, because an OTP that arrives after it has expired is as bad as no OTP.
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
