import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Compare, Flow, QA, Stats } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-4")!;

export const metadata: Metadata = {
  title: `Lesson 4 — ${lesson.title}`,
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

const code1 = `// ❌ Blocks every user for seconds
app.get("/report", (req, res) => {
  const result = heavyCalculation();   // CPU work on the event loop
  res.json(result);
});

// ✅ Waiting is fine – the loop serves others meanwhile
app.get("/user/:id", async (req, res) => {
  const user = await db.findUser(req.params.id);  // I/O, non-blocking
  res.json(user);
});`;

const code2 = `Thread A: holds Lock 1, waits for Lock 2
Thread B: holds Lock 2, waits for Lock 1
→ both stuck forever`;

export default function SdLessonFourPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            Your API works perfectly on your laptop with one user. Then you launch, and 5,000 people use it at the same
            moment. Suddenly:
          </p>
          <ul>
            <li>Requests pile up and time out.</li>
            <li>Memory usage explodes.</li>
            <li>Some users see another user's cart.</li>
            <li>A balance goes negative even though your code "checks" it first.</li>
          </ul>
          <p>
            None of these are logic bugs in the normal sense. They're <strong>concurrency</strong> problems. They're
            about how one server handles many things at once.
          </p>
          <p>
            Before you can scale to many servers, you have to understand how <strong>one</strong> server juggles
            thousands of requests. That depends on processes, threads, and the way your language and framework handle
            waiting.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about a <strong>restaurant kitchen</strong>.
          </p>
          <ul>
            <li>
              A <strong>process</strong> is like a <strong>separate kitchen</strong>. It has its own space, equipment
              and ingredients. Two kitchens don't share anything unless they deliberately pass food through a window.
              They're safe from each other, but expensive to build.
            </li>
            <li>
              A <strong>thread</strong> is like a <strong>cook</strong> inside a kitchen. Several cooks share the same
              fridge and stove. That's efficient, but two cooks can grab the same pan at once and cause chaos.
            </li>
            <li>
              <strong>Concurrency</strong> is one cook handling several dishes by switching between them: stir the soup,
              flip the pancake, check the oven.
            </li>
            <li>
              <strong>Parallelism</strong> is several cooks literally working at the same time.
            </li>
          </ul>
          <blockquote>
            <p>
              Concurrency is about <em>dealing</em> with many things at once. Parallelism is about <em>doing</em> many
              things at once. <em>(Rob Pike)</em>
            </p>
          </blockquote>
          <p>
            One more key idea: most backend work is <strong>waiting</strong>. A request might need 2 ms of CPU and then
            wait 50 ms for the database. A good cook doesn't stand staring at the oven; they start the next dish.{" "}
            <strong>Good servers don't sit idle while waiting either.</strong>
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="process-vs-thread">Process vs thread</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Process</th>
                  <th>Thread</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Memory</td>
                  <td>Own private memory</td>
                  <td>Shares memory with other threads in the same process</td>
                </tr>
                <tr>
                  <td>Creation cost</td>
                  <td>Heavy (MBs, slower to start)</td>
                  <td>Lighter</td>
                </tr>
                <tr>
                  <td>Communication</td>
                  <td>Harder (pipes, sockets, shared files)</td>
                  <td>Easy (shared variables), but risky</td>
                </tr>
                <tr>
                  <td>If it crashes</td>
                  <td>Other processes are fine</td>
                  <td>Can take down the whole process</td>
                </tr>
                <tr>
                  <td>Example</td>
                  <td>Each Chrome tab is (roughly) its own process</td>
                  <td>Threads in one Java web server handling requests</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>Context switching.</strong> A CPU core runs one thing at a time. The operating system rapidly
            switches between threads to create the illusion that they all run together. Each switch costs time: saving
            one thread's state and loading another's. With a few threads, that's nothing. With 10,000 threads, the CPU
            can spend a big share of its time just switching.
          </p>
          <h3 id="cpu-bound-vs-i-o-bound-work">CPU-bound vs I/O-bound work</h3>
          <ul>
            <li>
              <strong>CPU-bound</strong> work keeps the processor busy: resizing images, encrypting data, video
              encoding, machine learning. More CPU cores help.
            </li>
            <li>
              <strong>I/O-bound</strong> work spends most of its time waiting: database queries, calling other APIs,
              reading files. More waiting slots help; more CPU doesn't.
            </li>
          </ul>
          <p>
            <strong>Most web backends are I/O-bound.</strong> That fact explains why so many modern tools (Node.js,
            NGINX, Go, async Python) are designed around waiting efficiently.
          </p>
          <h3 id="blocking-vs-non-blocking-i-o">Blocking vs non-blocking I/O</h3>
          <ul>
            <li>
              <strong>Blocking I/O.</strong> The thread calls <code>db.query()</code> and <strong>stops</strong> until
              the answer comes back. Simple to write. To serve 1,000 waiting requests at once, you need about 1,000
              threads.
            </li>
            <li>
              <strong>Non-blocking I/O.</strong> The thread says "start this query and tell me when it's done", then
              moves on to other work. The operating system notifies it when the data is ready, using tools like{" "}
              <code>epoll</code> on Linux or <code>kqueue</code> on macOS. One thread can manage{" "}
              <strong>thousands</strong> of connections.
            </li>
          </ul>
          <Compare
            caption="The same three requests, each spending most of its life waiting on the database."
            columns={[
              {
                title: <>Blocking — thread per request</>,
                items: [
                  { sign: "·", text: <>Thread 1: work → wait for DB → work</> },
                  { sign: "·", text: <>Thread 2: work → wait for DB → work</> },
                  { sign: "·", text: <>Thread 3: work → wait for DB → work</> },
                  { sign: "-", text: <>Many threads, mostly idle, each holding memory</> },
                  { sign: "+", text: <>Code reads top to bottom</> },
                ],
                verdict: <>Moderate traffic; simple business apps</>,
              },
              {
                title: <>Non-blocking — event loop</>,
                items: [
                  { sign: "·", text: <>One thread: req1, req2, req3 … req1 done, req3 done, req2 done</> },
                  { sign: "+", text: <>Thousands of connections on one thread</> },
                  { sign: "+", text: <>Tiny memory per connection</> },
                  { sign: "-", text: <>One CPU-heavy task freezes everyone</> },
                ],
                verdict: <>Proxies, real-time apps, I/O-heavy APIs</>,
              },
            ]}
          />
          <p>
            In the early 2000s, engineers asked, "How can one server handle 10,000 connections at once?" This became
            known as the <strong>C10K problem</strong>. Non-blocking I/O and event loops were the answer.
          </p>
          <h3 id="how-popular-servers-handle-concurrency">How popular servers handle concurrency</h3>
          <p>
            <strong>1. Process per request (old CGI, early PHP setups).</strong> Each request starts a new process. It's
            safe and simple, but very heavy. Rarely used this way today.
          </p>
          <p>
            <strong>
              2. Thread per request with a thread pool (Java Spring/Tomcat, older Ruby and Python servers).
            </strong>{" "}
            A fixed pool of, say, 200 threads. Each request borrows a thread until it finishes.
          </p>
          <ul>
            <li>Easy to write and debug, since code reads top to bottom.</li>
            <li>If all 200 threads are waiting on a slow database, request 201 must queue.</li>
          </ul>
          <p>
            <strong>3. Event loop (Node.js, NGINX, Redis).</strong> A single thread runs a loop: take the next ready
            event, run a short piece of code, repeat. Slow work is handed off and comes back later as a callback,
            promise or <code>await</code>.
          </p>
          <ul>
            <li>Excellent for I/O-heavy work with many connections.</li>
            <li>
              <strong>The golden rule: never block the event loop.</strong> One heavy calculation in Node.js freezes{" "}
              <em>every</em> user's request until it finishes.
            </li>
          </ul>
          <CodeBlock lang="js" code={code1} />
          <p>
            <strong>4. Lightweight threads (Go goroutines, Java 21 virtual threads, Erlang/Elixir processes).</strong>{" "}
            You write simple blocking-style code, but the runtime secretly uses a few real OS threads and switches
            cheaply between <strong>very lightweight</strong> tasks. A goroutine starts with just a few KB of memory, so
            one server can run hundreds of thousands of them.
          </p>
          <ul>
            <li>This is the "best of both worlds": easy code and high concurrency.</li>
          </ul>
          <p>
            <strong>5. Async/await (Python asyncio, Rust Tokio, C#).</strong> Like the event loop, but with cleaner
            syntax. You mark waiting points with <code>await</code>.
          </p>
          <p>
            <strong>Multiple processes for multiple cores.</strong> A single-threaded event loop uses only one CPU core.
            So in production you run <strong>several copies</strong>:
          </p>
          <ul>
            <li>Node.js runs one process per core (for example, with PM2 or cluster mode).</li>
            <li>NGINX runs one worker process per core.</li>
            <li>Python web apps run several Gunicorn or Uvicorn workers.</li>
          </ul>
          <h3 id="race-conditions-when-threads-collide">Race conditions: when threads collide</h3>
          <p>When threads share memory, the order in which they run is unpredictable. Here's the classic bug:</p>
          <SequenceDiagram
            caption="A race condition. Balance ₹100, two ₹80 withdrawals at the same moment. Each thread's code is “correct”."
            actors={["Thread A", "Database", "Thread B"]}
            messages={[
              { from: 0, to: 1, label: <>read balance</> },
              { from: 1, to: 0, label: <>100</>, reply: true },
              { from: 2, to: 1, label: <>read balance</> },
              { from: 1, to: 2, label: <>100</>, note: <>A hasn't written yet</>, reply: true },
              { from: 0, to: 0, label: <>100 ≥ 80? yes</> },
              { from: 0, to: 1, label: <>write 20</> },
              { from: 2, to: 2, label: <>100 ≥ 80? yes</> },
              { from: 2, to: 1, label: <>write 20</> },
              {
                from: 0,
                to: 0,
                label: <>₹160 withdrawn, balance shows ₹20 💸 — fix: one atomic UPDATE … WHERE balance &gt;= 80</>,
                divider: true,
              },
            ]}
          />
          <p>
            Each thread's code was "correct", but together they're wrong. This is a <strong>race condition</strong>. The
            same bug appears as:
          </p>
          <ul>
            <li>two people booking the last seat,</li>
            <li>overselling the last item in stock,</li>
            <li>a counter losing updates.</li>
          </ul>
          <p>
            <strong>Fixes:</strong>
          </p>
          <ul>
            <li>
              <strong>Locks (mutexes).</strong> Only one thread at a time may enter the "critical section". This is
              correct but reduces parallelism.
            </li>
            <li>
              <strong>Atomic operations.</strong> Do read-check-write as one unbreakable step. Examples:{" "}
              <code>counter.incrementAndGet()</code>, or Redis <code>INCR</code>.
            </li>
            <li>
              <strong>Let the database do it.</strong> For example,{" "}
              <code>UPDATE accounts SET balance = balance - 80 WHERE id = 1 AND balance &gt;= 80</code>. The database
              runs this safely, and you check how many rows changed.
            </li>
            <li>
              <strong>Avoid shared state.</strong> Give each request its own data, and communicate through messages or
              queues.
            </li>
          </ul>
          <p>
            <strong>Important:</strong> race conditions don't only happen inside one server. With 10 servers behind a
            load balancer, <strong>in-memory locks in your code no longer help</strong>, because each server has its own
            memory. You need database-level protection or a distributed lock. This is a big theme in later posts.
          </p>
          <h3 id="deadlocks">Deadlocks</h3>
          <p>A deadlock happens when two threads each hold something the other needs, and both wait forever:</p>
          <CodeBlock code={code2} />
          <Flow
            caption="Four ways to kill a race condition, from most to least common in web backends."
            nodes={[
              {
                title: <>Let the database do it</>,
                desc: <>UPDATE … SET balance = balance − 80 WHERE balance &gt;= 80, then check rows changed</>,
                tone: "good",
              },
              { title: <>Atomic operations</>, desc: <>Redis INCR, compare-and-swap, counter.incrementAndGet()</> },
              {
                title: <>Locks (mutexes)</>,
                desc: <>one thread in the critical section at a time — correct, but serialises work</>,
              },
              {
                title: <>Avoid shared state</>,
                desc: <>each request owns its data; talk through messages and queues</>,
              },
            ]}
          />
          <p>
            The simplest prevention is to <strong>always take locks in the same order</strong>. Adding{" "}
            <strong>timeouts</strong> to lock waits also helps.
          </p>
          <h3 id="pools-bounded-is-better-than-unlimited">Pools: bounded is better than unlimited</h3>
          <p>
            Servers use <strong>pools</strong>: thread pools, database connection pools, worker pools. Why not just
            create a new thread or connection whenever you need one?
          </p>
          <ul>
            <li>Creating them is slow.</li>
            <li>
              Unlimited creation means that during a traffic spike, you create thousands, run out of memory and crash,
              taking <strong>every</strong> user down.
            </li>
          </ul>
          <p>
            A bounded pool with a queue behaves better under load. Some requests wait or are rejected, but the server
            survives.
          </p>
          <p>
            Pool size is a real design decision. A handy rule is <strong>Little's Law</strong> (more in Part 2). If you
            get 200 requests per second and each holds a database connection for 50 ms, then on average 200 × 0.05 ={" "}
            <strong>10 connections</strong> are in use.
          </p>
          <h3 id="a-note-on-python-s-gil">A note on Python's GIL</h3>
          <p>
            Standard Python (CPython) has a <strong>Global Interpreter Lock</strong>. It lets only one thread run Python
            code at a time. So:
          </p>
          <ul>
            <li>
              Threads help Python with <strong>I/O-bound</strong> work, because the lock is released while waiting.
            </li>
            <li>
              Threads don't help much with <strong>CPU-bound</strong> work.
            </li>
          </ul>
          <p>
            That's why Python apps use multiple processes (Gunicorn workers, <code>multiprocessing</code>) or async for
            scale. Newer Python versions offer an experimental "free-threaded" build without the GIL, but most
            production code still assumes it.
          </p>
          <Stats
            caption="Rough memory cost of one unit of concurrency. This is why the model you pick sets your ceiling."
            stats={[
              { value: <>~1 MB</>, label: <>OS thread stack</>, sub: <>10,000 threads ≈ 10 GB</> },
              { value: <>~2–8 KB</>, label: <>Go goroutine</>, sub: <>hundreds of thousands per server</> },
              { value: <>~1 KB</>, label: <>event-loop connection</>, sub: <>just a socket and a callback</> },
              { value: <>several MB</>, label: <>PostgreSQL connection</>, sub: <>a whole OS process each</> },
            ]}
          />
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Pros</th>
                  <th>Cons</th>
                  <th>Good for</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Thread per request</td>
                  <td>Simple code, easy debugging</td>
                  <td>Memory per thread; limited by pool size</td>
                  <td>Classic business apps, moderate traffic</td>
                </tr>
                <tr>
                  <td>Event loop</td>
                  <td>Huge numbers of connections, low memory</td>
                  <td>Must never block; CPU work hurts everyone</td>
                  <td>Proxies, real-time apps, I/O-heavy APIs</td>
                </tr>
                <tr>
                  <td>Lightweight threads</td>
                  <td>
                    Simple code <em>and</em> high concurrency
                  </td>
                  <td>Runtime-specific; still need care with shared data</td>
                  <td>High-traffic services (Go, Elixir, Java 21)</td>
                </tr>
                <tr>
                  <td>Multiple processes</td>
                  <td>Uses all cores, crash isolation</td>
                  <td>More memory, no shared state</td>
                  <td>Scaling single-threaded runtimes</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>When adding threads makes things worse:</strong>
          </p>
          <ul>
            <li>
              when the bottleneck is the database, not your server (more threads just means more waiting queries),
            </li>
            <li>when the work is CPU-bound and you already use every core,</li>
            <li>when threads fight over the same lock.</li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>NGINX</strong> uses a small number of worker processes (usually one per CPU core). Each runs an
            event loop that handles thousands of connections. That's why NGINX can serve huge numbers of connections
            with little memory. Apache's traditional model used a process or thread per connection and needed far more
            memory for the same load.
          </p>
          <p>
            <strong>Node.js</strong> made event loops popular for application code. Companies like Netflix and PayPal
            have used Node.js for I/O-heavy web layers. The classic Node.js incident is a single slow JSON parse, or a
            badly written regular expression, blocking the loop and making the whole service unresponsive.
          </p>
          <p>
            <strong>Redis</strong> runs commands on a single main thread. That sounds limiting, but because it keeps
            data in memory and never waits on disk for normal commands, it handles very large numbers of operations per
            second. Being single-threaded also means every command is naturally <strong>atomic</strong>: no race
            conditions inside Redis.
          </p>
          <p>
            <strong>Discord and WhatsApp</strong> rely on Erlang/Elixir, whose lightweight processes let one machine
            hold a huge number of connected users. WhatsApp was famous for handling millions of connections per server
            with a very small engineering team.
          </p>
          <p>
            <strong>Go at scale.</strong> Many cloud tools, including Docker, Kubernetes and much of Cloudflare's and
            Uber's backend infrastructure, are written in Go, largely because goroutines make high-concurrency servers
            simple to write.
          </p>
          <p>
            <strong>Ticket booking (think concert or train tickets).</strong> When thousands of people click "Book" on
            the last few seats at the same second, race conditions become real money. These systems use database locks,
            atomic updates and queues so that one seat is sold only once.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>What's the difference between a process and a thread?</>,
                a: (
                  <>
                    <p>
                      A process has its own private memory space; threads live inside a process and share its memory.
                      Threads are cheaper to create and communicate through shared variables, but a bug in one can
                      corrupt or crash the whole process, while processes are isolated from each other.
                    </p>
                  </>
                ),
              },
              {
                q: <>Concurrency vs parallelism?</>,
                a: (
                  <>
                    <p>
                      Concurrency is structuring a program to deal with many tasks at once by interleaving them, even on
                      one core. Parallelism is actually executing several tasks at the same instant on multiple cores.
                      An event loop is concurrent but not parallel; a thread pool on an 8-core machine can be both.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why is Node.js good for I/O-heavy work but bad for CPU-heavy work?</>,
                a: (
                  <>
                    <p>
                      Its single event-loop thread starts I/O and moves on, so thousands of requests can wait cheaply.
                      But any CPU-heavy work runs on that same thread and blocks every other request until it finishes.
                      CPU work belongs in worker threads, separate processes or a job queue.
                    </p>
                  </>
                ),
              },
              {
                q: <>How would you prevent two users from booking the last seat?</>,
                a: (
                  <>
                    <p>
                      Don't rely on an in-memory check — with many servers it cannot work. Make the database decide
                      atomically: a conditional UPDATE (… WHERE seats_left &gt; 0) and check the affected row count, a
                      UNIQUE constraint on (show_id, seat_no), or a row lock with SELECT … FOR UPDATE inside a
                      transaction.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why should thread and connection pools be bounded?</>,
                a: (
                  <>
                    <p>
                      Unlimited creation turns a traffic spike into memory exhaustion and a crash for everyone. A
                      bounded pool makes excess requests queue or fail fast, so the server keeps serving at its real
                      capacity. Size it with Little's Law: arrival rate × time each request holds the resource.
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
              A <strong>process</strong> has its own memory. <strong>Threads</strong> share memory inside a process:
              cheaper, but riskier.
            </li>
            <li>
              Most backends are <strong>I/O-bound</strong>, so the key question is how a server handles{" "}
              <strong>waiting</strong>.
            </li>
            <li>
              There are three main approaches:
              <ul>
                <li>
                  <strong>Thread pools:</strong> simple code, but each waiting request holds a thread.
                </li>
                <li>
                  <strong>Event loops:</strong> efficient, but never block them.
                </li>
                <li>
                  <strong>Lightweight threads:</strong> simple code and high concurrency.
                </li>
              </ul>
            </li>
            <li>
              <strong>Race conditions</strong> happen when shared data is read and written without protection. Fix them
              with <strong>atomic operations, locks, or the database</strong>, and remember that in-memory locks don't
              work across multiple servers.
            </li>
            <li>
              Always use <strong>bounded pools</strong>. Unlimited threads or connections crash servers during spikes.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              <em>Operating Systems: Three Easy Pieces</em> by Remzi and Andrea Arpaci-Dusseau (free online; the
              chapters on processes, threads and locks)
            </li>
            <li>"The C10K problem" by Dan Kegel</li>
            <li>The Node.js guide "The Node.js Event Loop"</li>
            <li>Rob Pike's talk "Concurrency Is Not Parallelism"</li>
            <li>
              <em>Java Concurrency in Practice</em> by Brian Goetz et al.
            </li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
