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

// ✅ Waiting is fine – the loop serves other users meanwhile
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
            None of these are ordinary logic bugs. They are <strong>concurrency</strong> problems. Concurrency means
            handling many tasks during the same period of time. These problems come from how one server handles many
            things at once.
          </p>
          <p>
            Before you can scale to many servers, you have to understand how <strong>one</strong> server handles
            thousands of requests at the same time. That depends on processes, threads, and the way your language and
            framework handle waiting.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about a <strong>restaurant kitchen</strong>.
          </p>
          <ul>
            <li>
              A <strong>process</strong> is a running program with its own private memory. It is like a{" "}
              <strong>separate kitchen</strong>. It has its own space, equipment and ingredients. Two kitchens share
              nothing unless they pass food through a window on purpose. They are safe from each other, but expensive
              to build.
            </li>
            <li>
              A <strong>thread</strong> is one path of work that runs inside a process and shares the process's memory.
              It is like a <strong>cook</strong> inside a kitchen. Several cooks share the same fridge and stove. This
              is efficient, but two cooks can grab the same pan at once and cause a mess.
            </li>
            <li>
              <strong>Concurrency</strong> is one cook handling several dishes by switching between them: stir the soup,
              flip the pancake, check the oven.
            </li>
            <li>
              <strong>Parallelism</strong> is several cooks working at the same time.
            </li>
            <li>
              Difference in one line: a process is a separate kitchen, a thread is a cook in the kitchen. Concurrency
              is about switching between tasks, parallelism is about running tasks at the same instant.
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
            wait 50 ms for the database. A good cook does not stand and stare at the oven. They start the next dish.{" "}
            <strong>Good servers do not sit idle while waiting either.</strong> (CPU means the processor, the part of
            the computer that does the calculations.)
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
                  <td>Heavy (megabytes of memory, slower to start)</td>
                  <td>Lighter</td>
                </tr>
                <tr>
                  <td>Communication</td>
                  <td>Harder (pipes, sockets or shared files)</td>
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
            <strong>Context switching.</strong> A CPU core runs one thing at a time. The operating system (OS) quickly
            switches between threads, so it looks like they all run together. This switch is called a context switch.
            Each switch costs time, because the OS must save one thread's state and load another's. With a few threads,
            this cost is tiny. With 10,000 threads, the CPU can spend a big share of its time just switching.
          </p>
          <h3 id="cpu-bound-vs-i-o-bound-work">CPU-bound vs I/O-bound work</h3>
          <ul>
            <li>
              <strong>CPU-bound</strong> work is work where the processor is the slow part, because it is busy all the
              time: resizing images, encrypting data, video encoding, machine learning. More CPU cores help.
            </li>
            <li>
              <strong>I/O-bound</strong> work is work where most of the time is spent waiting for input or output
              (I/O): database queries, calls to other APIs, reading files. Handling more waiting requests at once
              helps. More CPU does not.
            </li>
          </ul>
          <p>
            <strong>Most web backends are I/O-bound.</strong> This is why many modern tools (Node.js, NGINX, Go, async
            Python) are built to wait efficiently.
          </p>
          <h3 id="blocking-vs-non-blocking-i-o">Blocking vs non-blocking I/O</h3>
          <ul>
            <li>
              <strong>Blocking I/O.</strong> The thread calls <code>db.query()</code> and <strong>stops</strong> until
              the answer comes back. It is simple to write. To serve 1,000 waiting requests at once, you need about
              1,000 threads.
            </li>
            <li>
              <strong>Non-blocking I/O.</strong> The thread says "start this query and tell me when it is done", then
              moves on to other work. The operating system tells it when the data is ready, using tools like{" "}
              <code>epoll</code> on Linux or <code>kqueue</code> on macOS. One thread can manage{" "}
              <strong>thousands</strong> of connections. An <strong>event loop</strong> is a loop that waits for such
              "ready" events and runs a small piece of code for each one.
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
            Around 1999, engineers asked, "How can one server handle 10,000 connections at once?" This became known as
            the <strong>C10K problem</strong> (C10K means 10 thousand connections). Non-blocking I/O and event loops
            were the answer.
          </p>
          <h3 id="how-popular-servers-handle-concurrency">How popular servers handle concurrency</h3>
          <p>
            <strong>1. Process per request (old CGI, early PHP setups).</strong> Each request starts a new process. It is
            safe and simple, but very heavy. It is rarely used this way today.
          </p>
          <p>
            <strong>
              2. Thread per request with a thread pool (Java Spring/Tomcat, older Ruby and Python servers).
            </strong>{" "}
            A thread pool is a fixed group of ready threads that are reused. With a pool of, say, 200 threads, each
            request borrows a thread until it finishes.
          </p>
          <ul>
            <li>Easy to write and debug, since the code reads top to bottom.</li>
            <li>If all 200 threads are waiting on a slow database, request 201 must wait in a queue.</li>
          </ul>
          <p>
            <strong>3. Event loop (Node.js, NGINX, Redis).</strong> A single thread runs a loop: take the next ready
            event, run a short piece of code, repeat. Slow work is started and the result comes back later. It comes
            back as a callback (a function that is called when the work is done), a promise (an object that stands for
            a future result) or an <code>await</code> (a keyword that waits for a promise without blocking the loop).
          </p>
          <ul>
            <li>Excellent for I/O-heavy work with many connections.</li>
            <li>
              <strong>The golden rule: never block the event loop.</strong> One heavy calculation in Node.js stops{" "}
              <em>every</em> user's request until it finishes.
            </li>
          </ul>
          <CodeBlock lang="js" code={code1} />
          <p>
            <strong>4. Lightweight threads (Go goroutines, Java 21 virtual threads, Erlang/Elixir processes).</strong>{" "}
            You write simple blocking-style code, but the runtime (the system that runs your program) uses only a few
            real OS threads and switches cheaply between <strong>very lightweight</strong> tasks. A goroutine (Go's
            lightweight task) starts with only about 2 KB of memory, so one server can run hundreds of thousands of
            them.
          </p>
          <ul>
            <li>You get both: easy code and high concurrency.</li>
          </ul>
          <p>
            <strong>5. Async/await (Python asyncio, Rust Tokio, C#).</strong> This works like the event loop, but the
            code is easier to read. You mark each waiting point with <code>await</code>, and the function pauses there
            without blocking other work.
          </p>
          <p>
            <strong>Multiple processes for multiple cores.</strong> A single-threaded event loop uses only one CPU core
            (a core is one processing unit inside the CPU). So in production you run <strong>several copies</strong>:
          </p>
          <ul>
            <li>Node.js runs one process per core (for example, with PM2 or cluster mode).</li>
            <li>NGINX runs one worker process per core.</li>
            <li>Python web apps run several Gunicorn or Uvicorn workers.</li>
          </ul>
          <h3 id="race-conditions-when-threads-collide">Race conditions: when threads collide</h3>
          <p>
            When threads share memory, you cannot predict the order in which they run. A <strong>race condition</strong>{" "}
            is a bug where the result depends on which thread happens to run first. Here is the classic example:
          </p>
          <SequenceDiagram
            caption="A race condition. Balance ₹100, two ₹80 withdrawals at the same moment. Each thread's code is “correct”."
            actors={["Thread A", "Database", "Thread B"]}
            messages={[
              { from: 0, to: 1, label: <>read balance</> },
              { from: 1, to: 0, label: <>100</>, reply: true },
              { from: 2, to: 1, label: <>read balance</> },
              { from: 1, to: 2, label: <>100</>, note: <>A has not written yet</>, reply: true },
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
            Each thread's code was "correct", but together they give a wrong result. This is a race condition. The
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
              <strong>Locks (mutexes).</strong> A lock is a "key" that only one thread can hold at a time. Only the
              thread with the key may enter the "critical section" (the code that touches the shared data). This is
              correct but reduces parallelism.
            </li>
            <li>
              <strong>Atomic operations.</strong> An atomic operation is one that cannot be cut in the middle by
              another thread. Do read-check-write as one unbreakable step. Examples:{" "}
              <code>counter.incrementAndGet()</code>, or Redis <code>INCR</code>.
            </li>
            <li>
              <strong>Let the database do it.</strong> For example,{" "}
              <code>UPDATE accounts SET balance = balance - 80 WHERE id = 1 AND balance &gt;= 80</code>. The database
              runs this as one safe step, and you check how many rows changed. If zero rows changed, the balance was too
              low.
            </li>
            <li>
              <strong>Avoid shared state.</strong> Give each request its own data, and let parts of the system talk
              through messages or queues.
            </li>
          </ul>
          <Flow
            caption="Four ways to fix a race condition, from most to least common in web backends."
            nodes={[
              {
                title: <>Let the database do it</>,
                desc: <>UPDATE … SET balance = balance − 80 WHERE balance &gt;= 80, then check rows changed</>,
                tone: "good",
              },
              { title: <>Atomic operations</>, desc: <>Redis INCR, compare-and-swap, counter.incrementAndGet()</> },
              {
                title: <>Locks (mutexes)</>,
                desc: <>one thread in the critical section at a time — correct, but makes work happen one by one</>,
              },
              {
                title: <>Avoid shared state</>,
                desc: <>each request owns its data; talk through messages and queues</>,
              },
            ]}
          />
          <p>
            <strong>Important:</strong> race conditions do not only happen inside one server. Say you have 10 servers
            behind a load balancer (a server that shares requests between them).{" "}
            <strong>In-memory locks in your code no longer help</strong>, because each server has its own memory. You
            need protection in the database, or a distributed lock (a lock that all servers share). This is a big theme
            in later lessons.
          </p>
          <h3 id="deadlocks">Deadlocks</h3>
          <p>
            A <strong>deadlock</strong> happens when two threads each hold something the other needs, and both wait
            forever:
          </p>
          <CodeBlock code={code2} />
          <p>
            The simplest prevention is to <strong>always take locks in the same order</strong>. Adding{" "}
            <strong>timeouts</strong> to lock waits also helps. Difference in one line: in a race condition the result
            is wrong, in a deadlock nothing moves at all.
          </p>
          <h3 id="pools-bounded-is-better-than-unlimited">Pools: bounded is better than unlimited</h3>
          <p>
            Servers use <strong>pools</strong>. A pool is a fixed set of ready-to-use resources that are borrowed and
            given back: thread pools, database connection pools, worker pools. Why not just create a new thread or
            connection whenever you need one?
          </p>
          <ul>
            <li>Creating them is slow.</li>
            <li>
              If creation has no limit, a traffic spike makes you create thousands. You run out of memory and crash,
              and <strong>every</strong> user is down.
            </li>
          </ul>
          <p>
            A bounded pool (one with a maximum size) with a queue works better under heavy load. Some requests wait or
            are rejected, but the server survives.
          </p>
          <p>
            Pool size is a real design decision. A useful rule is <strong>Little's Law</strong> (more in a later
            lesson): the average number in use = arrival rate × time each one is held. If you get 200 requests per
            second and each holds a database connection for 50 ms, then on average 200 × 0.05 ={" "}
            <strong>10 connections</strong> are in use.
          </p>
          <h3 id="a-note-on-python-s-gil">A note on Python's GIL</h3>
          <p>
            Standard Python (CPython, the usual Python program) has a <strong>Global Interpreter Lock</strong> (GIL).
            The GIL is a lock that lets only one thread run Python code at a time. So:
          </p>
          <ul>
            <li>
              Threads help Python with <strong>I/O-bound</strong> work, because the lock is released while waiting.
            </li>
            <li>
              Threads do not help much with <strong>CPU-bound</strong> work.
            </li>
          </ul>
          <p>
            That is why Python apps use multiple processes (Gunicorn workers, <code>multiprocessing</code>) or async to
            scale. Newer Python versions (3.13 and later) offer an optional "free-threaded" build without the GIL, but
            the GIL is still the default and most production code still assumes it.
          </p>
          <Stats
            caption="Rough memory cost of one unit of concurrency. This is why the model you pick sets your upper limit."
            stats={[
              { value: <>~1 MB</>, label: <>OS thread stack</>, sub: <>10,000 threads ≈ 10 GB</> },
              { value: <>~2 KB</>, label: <>Go goroutine</>, sub: <>start size; hundreds of thousands per server</> },
              { value: <>a few KB</>, label: <>event-loop connection</>, sub: <>just a socket and a callback</> },
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
                  <td>Memory used by each thread; limited by pool size</td>
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
              when the slow part is the database, not your server (more threads only means more queries waiting),
            </li>
            <li>when the work is CPU-bound and you already use every core,</li>
            <li>when threads fight over the same lock.</li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>NGINX</strong> uses a small number of worker processes (usually one per CPU core). Each runs an
            event loop that handles thousands of connections. This is why NGINX can serve a huge number of connections
            with little memory. Apache's traditional model used a process or thread per connection and needed far more
            memory for the same load.
          </p>
          <p>
            <strong>Node.js</strong> made event loops popular for application code. Companies like Netflix and PayPal
            have used Node.js for I/O-heavy web layers. A classic Node.js problem is one slow JSON parse, or one badly
            written regular expression (a text-matching pattern), that blocks the loop and makes the whole service stop
            responding.
          </p>
          <p>
            <strong>Redis</strong> (a very fast in-memory data store) runs commands on a single main thread. That
            sounds limiting, but it keeps data in memory and usually does not wait for the disk, so it handles a very
            large number of operations per second. Being single-threaded also means every command is naturally{" "}
            <strong>atomic</strong>: there are no race conditions between commands inside Redis.
          </p>
          <p>
            <strong>Discord and WhatsApp</strong> rely on Erlang/Elixir, whose lightweight processes let one machine
            hold a huge number of connected users. WhatsApp reported about 2 million connections on a single server
            (in 2012) with a very small engineering team.
          </p>
          <p>
            <strong>Go at scale.</strong> Many cloud tools, including Docker, Kubernetes and much of Cloudflare's and
            Uber's backend infrastructure, are written in Go, largely because goroutines make high-concurrency servers
            simple to write.
          </p>
          <p>
            <strong>Ticket booking (think concert or train tickets).</strong> When thousands of people click "Book" on
            the last few seats at the same second, race conditions cost real money. These systems use database locks,
            atomic updates and queues so that each seat is sold only once.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>What is the difference between a process and a thread?</>,
                a: (
                  <>
                    <p>
                      A process has its own private memory. Threads live inside a process and share its memory.
                      Threads are cheaper to create and talk to each other through shared variables. But a bug in one
                      thread can damage or crash the whole process. Processes are isolated from each other, so one
                      crash does not affect the others.
                    </p>
                  </>
                ),
              },
              {
                q: <>Concurrency vs parallelism?</>,
                a: (
                  <>
                    <p>
                      Concurrency means a program handles many tasks in the same period by switching between them, even
                      on one core. Parallelism means several tasks really run at the same instant on several cores. An
                      event loop is concurrent but not parallel. A thread pool on an 8-core machine can be both.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why is Node.js good for I/O-heavy work but bad for CPU-heavy work?</>,
                a: (
                  <>
                    <p>
                      Its single event-loop thread starts an I/O task and moves on, so thousands of requests can wait
                      cheaply. But CPU-heavy work runs on that same thread and blocks every other request until it
                      finishes. Put CPU work in worker threads, separate processes or a job queue.
                    </p>
                  </>
                ),
              },
              {
                q: <>How would you prevent two users from booking the last seat?</>,
                a: (
                  <>
                    <p>
                      Do not rely on a check in memory, because it cannot work with many servers. Let the database
                      decide in one atomic step. Use a conditional UPDATE (… WHERE seats_left &gt; 0) and check how many
                      rows changed. Or use a UNIQUE constraint on (show_id, seat_no). Or lock the row with SELECT … FOR
                      UPDATE inside a transaction.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why should thread and connection pools be bounded?</>,
                a: (
                  <>
                    <p>
                      With no limit, a traffic spike uses up all the memory and crashes the server for everyone. A
                      bounded pool makes extra requests wait in a queue or fail fast, so the server keeps working at its
                      real capacity. Size it with Little's Law: arrival rate × time each request holds the resource.
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
              with <strong>atomic operations, locks, or the database</strong>, and remember that in-memory locks do not
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
