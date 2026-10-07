import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { AsciiDiagram, Compare, Layers, QA } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-7")!;

export const metadata: Metadata = {
  title: `Lesson 7 — ${lesson.title}`,
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

const code1 = `Before:   [ 4 CPU | 16 GB ]
After:    [ 64 CPU | 512 GB ]`;

const diagram1 = `                ┌──► [ App server 1 ]
Users ──► [LB] ─┼──► [ App server 2 ]  ──► Database
                └──► [ App server 3 ]`;

export default function SdLessonSevenPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            Your app runs on one server, and traffic has doubled in three months. The CPU (the processor that does the
            work) is 90% busy, pages are getting slower, and a big sale starts next week. You have two options:
          </p>
          <ul>
            <li>
              <strong>Buy a bigger server.</strong>
            </li>
            <li>
              <strong>Add more servers.</strong>
            </li>
          </ul>
          <p>
            Both work, but they lead to very different systems. And if you choose "more servers", you may get a
            surprise. Users keep getting logged out, and uploaded profile pictures randomly disappear. This is a{" "}
            <strong>state</strong> problem. It is the hidden reason why many apps cannot simply "add more servers".
            Scaling means making a system able to handle more load.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>Imagine a busy chai stall.</p>
          <p>
            <strong>Vertical scaling (scale up)</strong> means giving your one chaiwala (tea seller) a bigger stove, a
            bigger pot and faster hands. It is simple. Nothing about how the stall works changes. But one person can
            only get so fast, bigger equipment gets very expensive, and if the chaiwala falls sick, the stall closes.
          </p>
          <p>
            <strong>Horizontal scaling (scale out)</strong> means opening more counters with more chaiwalas, and having
            someone at the front send customers to whichever counter is free. You can keep adding counters almost
            forever, and if one chaiwala takes a break, the others keep serving. But now you need coordination. Say a
            customer paid at counter 1 and comes back to counter 3 for their change. Counter 3 needs to know about the
            payment.
          </p>
          <p>
            The question "does counter 3 know about you?" is the <strong>stateless vs stateful</strong> idea. It
            decides how easily you can scale out.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="vertical-scaling">Vertical scaling</h3>
          <p>
            You move to a machine with more CPU cores, more RAM (the fast working memory), faster disks or a faster
            network. In the cloud this can be as easy as changing the instance size (the size of the rented virtual
            machine) and restarting.
          </p>
          <CodeBlock code={code1} />
          <p>
            <strong>Good things:</strong>
          </p>
          <ul>
            <li>No code changes. Your app does not know that anything changed.</li>
            <li>
              No distributed-system problems. (A distributed system is a system that runs on many machines.) You have
              one machine, one memory and one clock.
            </li>
            <li>Good for databases, which are hard to split across machines.</li>
          </ul>
          <p>
            <strong>Limits:</strong>
          </p>
          <ul>
            <li>
              <strong>There is a ceiling.</strong> Even the biggest cloud machines have limits.
            </li>
            <li>
              <strong>The cost grows fast.</strong> At the high end, a machine twice as big often costs more than twice
              as much.
            </li>
            <li>
              <strong>It is still a single point of failure.</strong> A single point of failure is one part that, if it
              breaks, stops the whole system. With one machine, one hardware failure takes you down.
            </li>
            <li>
              <strong>It usually needs a restart</strong>, which means downtime.
            </li>
          </ul>
          <h3 id="horizontal-scaling">Horizontal scaling</h3>
          <p>
            You run many copies of your app on many machines. A <strong>load balancer</strong> sits in front of them. It
            is a server that spreads the incoming requests between the machines.
          </p>
          <AsciiDiagram text={diagram1} />
          <p>
            <strong>Good things:</strong>
          </p>
          <ul>
            <li>Almost unlimited growth. You just add servers.</li>
            <li>
              <strong>Fault tolerance.</strong> This means the system keeps working when a part fails. If server 2
              dies, the load balancer sends traffic to servers 1 and 3.
            </li>
            <li>
              <strong>Cheaper hardware.</strong> You use many ordinary machines (commodity machines) instead of one huge
              one.
            </li>
            <li>
              <strong>Zero-downtime deploys.</strong> A deploy is putting a new version of your app on the servers. You
              update the servers one at a time, so the site never goes down.
            </li>
          </ul>
          <p>
            <strong>Challenges:</strong>
          </p>
          <ul>
            <li>You need a load balancer (covered in Part 3).</li>
            <li>
              Your app must be <strong>stateless</strong> (see below).
            </li>
            <li>
              Some parts, especially the <strong>database</strong>, do not scale out easily. Part 4 covers replication
              (keeping copies of data on several machines) and sharding (splitting data across several machines).
            </li>
          </ul>
          <h3 id="different-tiers-scale-differently">Different tiers scale differently</h3>
          <ul>
            <li>
              <strong>The web/app tier</strong> (the servers that run your application code) is usually easy to scale
              out, <em>if</em> it is stateless.
            </li>
            <li>
              <strong>Caches</strong> can be scaled out with partitioning (each server holds a different part of the
              data).
            </li>
            <li>
              <strong>Databases</strong> are hard. Most teams scale the database <strong>vertically first</strong>, then
              add <strong>read replicas</strong> (extra copies that only answer reads), and shard only when nothing else
              works.
            </li>
          </ul>
          <p>
            A very common setup in real systems is <strong>many small app servers + one big database</strong> (plus
            replicas).
          </p>
          <h3 id="what-is-state">What is "state"?</h3>
          <p>
            <strong>State</strong> is any data that a server remembers between requests. Common examples:
          </p>
          <ul>
            <li>
              <strong>Login sessions</strong> kept in server memory. (A session is the server's record that you are
              logged in.)
            </li>
            <li>
              <strong>Uploaded files</strong> saved to the server's local disk.
            </li>
            <li>
              <strong>In-memory caches</strong> holding user-specific data.
            </li>
            <li>
              <strong>Open connections</strong>, like WebSockets for chat. (A WebSocket is a connection that stays
              open so that the server and the browser can send messages at any time.)
            </li>
          </ul>
          <p>Here is why state breaks horizontal scaling:</p>
          <SequenceDiagram
            caption="Why in-memory sessions break when you add a second server."
            actors={["User", "Load balancer", "Server A", "Server B"]}
            messages={[
              { from: 0, to: 1, label: <>POST /login</> },
              { from: 1, to: 2, label: <>forward</> },
              { from: 2, to: 2, label: <>remember session 123 = Asha (in RAM)</> },
              { from: 2, to: 0, label: <>Set-Cookie: session=123</>, reply: true },
              { from: 0, to: 1, label: <>GET /dashboard (cookie 123)</> },
              { from: 1, to: 3, label: <>forward — round robin (servers take turns)</> },
              {
                from: 3,
                to: 0,
                label: <>401 “Please log in again” 😩</>,
                note: <>B has never heard of session 123</>,
                reply: true,
              },
            ]}
          />
          <p>
            The same thing happens with files. The profile picture was saved to Server A's disk, so when Server B
            handles the next request, the image "does not exist".
          </p>
          <h3 id="making-services-stateless">Making services stateless</h3>
          <p>
            A <strong>stateless</strong> server keeps nothing important in its own memory or disk between requests. Any
            server can handle any request. Difference in one line: a stateful server remembers you, a stateless server
            does not need to. You move the state to a shared place:
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>State</th>
                  <th>Move it to</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Login sessions</td>
                  <td>
                    A shared store like <strong>Redis</strong> (a very fast in-memory data store), or signed{" "}
                    <strong>tokens</strong> (like JWTs, small signed texts) that the client sends each time
                  </td>
                </tr>
                <tr>
                  <td>Uploaded files</td>
                  <td>
                    <strong>Object storage</strong> (a service that stores files, like Amazon S3)
                  </td>
                </tr>
                <tr>
                  <td>Cached data</td>
                  <td>
                    A shared cache (<strong>Redis / Memcached</strong>, a fast store of saved answers that all servers
                    use)
                  </td>
                </tr>
                <tr>
                  <td>Business data</td>
                  <td>
                    The <strong>database</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <Layers
            caption="The stateless layout. App servers are interchangeable. Everything they must remember lives in shared stores."
            layers={[
              { name: <>Load balancer</>, desc: <>any server can take any request</> },
              { name: <>App servers × N</>, desc: <>stateless — you can add, remove, restart or replace them at any time</> },
              { name: <>Redis</>, tech: <>sessions, cache</>, desc: <>shared by every app server</> },
              { name: <>Database</>, tech: <>business data</>, desc: <>the source of truth (the one place that holds the correct data)</> },
              { name: <>Object storage (S3)</>, tech: <>uploaded files</>, desc: <>never on a server's local disk</> },
            ]}
          />
          <p>
            Now servers are <strong>interchangeable</strong>, like identical counters at the chai stall. You can add
            servers, remove them, restart them or replace them at any time. This is the key idea behind the well-known
            "Twelve-Factor App" guidelines (a popular list of rules for building web apps):{" "}
            <em>run your app as stateless processes</em>.
          </p>
          <h3 id="sticky-sessions-a-shortcut-with-costs">Sticky sessions: a shortcut with costs</h3>
          <p>
            Another option is <strong>sticky sessions</strong>: the load balancer always sends the same user to the same
            server, usually using a cookie. It is a quick fix, but:
          </p>
          <ul>
            <li>
              <strong>Load becomes uneven.</strong> One server might get all the heavy users.
            </li>
            <li>
              <strong>When that server dies, its users lose their sessions.</strong>
            </li>
            <li>
              <strong>Scaling down or deploying is harder</strong>, because users are "attached" to specific machines.
              Scaling down means removing servers.
            </li>
          </ul>
          <p>
            Use sticky sessions only when you really must, such as for some long-lived connections. Otherwise, make the
            app stateless.
          </p>
          <h3 id="some-things-are-naturally-stateful">Some things are naturally stateful</h3>
          <p>
            Not everything can be stateless. Databases, chat servers holding WebSocket connections, multiplayer game
            servers and stream processors all <em>have</em> to hold state. They are scaled with extra techniques:
          </p>
          <ul>
            <li>replication (copies),</li>
            <li>partitioning (each server owns part of the data or part of the users),</li>
            <li>routing that sends each user or key to the right server.</li>
          </ul>
          <p>We cover these in later lessons.</p>
          <h3 id="auto-scaling">Auto-scaling</h3>
          <p>
            <strong>Auto-scaling</strong> means the cloud adds and removes servers for you, based on a signal. It works
            well with stateless servers. Common signals:
          </p>
          <ul>
            <li>CPU usage (for example, "keep average CPU around 60%"),</li>
            <li>requests per second,</li>
            <li>queue length (for background workers).</li>
          </ul>
          <p>Two practical points:</p>
          <ul>
            <li>
              <strong>New servers take time to start and warm up</strong> (to load code and fill caches), from seconds
              to minutes. Auto-scaling reacts <em>after</em> the load rises, so for spikes that you can predict (a
              sale, a big match), <strong>add servers in advance</strong>.
            </li>
            <li>
              Set a <strong>minimum</strong> number of servers, so that a failure never leaves you with none.
            </li>
          </ul>
          <h3 id="why-10-servers-aren-t-10-faster">Why 10 servers aren't 10× faster</h3>
          <p>Adding servers rarely gives perfect linear growth (twice the servers, twice the speed):</p>
          <ul>
            <li>
              <strong>Shared bottlenecks.</strong> A bottleneck is the one slow part that limits everything else. All
              servers still use the same database, cache or third-party API (a service run by another company).
            </li>
            <li>
              <strong>Coordination costs.</strong> Servers may need to talk to each other, share locks (a lock lets
              only one worker use something at a time) or keep data in sync.
            </li>
            <li>
              <strong>Amdahl's law.</strong> If part of the work cannot be split, like one shared database write, that
              part limits your total speed-up, no matter how many servers you add.
            </li>
          </ul>
          <p>
            Scalability is not just adding machines. It is <strong>removing the shared bottlenecks</strong> one by
            one.
          </p>
          <Compare
            caption="The two directions you can grow."
            columns={[
              {
                title: <>Vertical — scale up</>,
                items: [
                  { sign: "+", text: <>No code changes at all</> },
                  { sign: "+", text: <>No distributed-systems problems</> },
                  { sign: "-", text: <>Hard ceiling on machine size</> },
                  { sign: "-", text: <>Price climbs steeply at the top end</> },
                  { sign: "-", text: <>Still one machine: a single point of failure</> },
                ],
                verdict: <>Databases, early-stage apps, a quick fix before a deadline</>,
              },
              {
                title: <>Horizontal — scale out</>,
                items: [
                  { sign: "+", text: <>Nearly unlimited: just add servers</> },
                  { sign: "+", text: <>Survives a server dying</> },
                  { sign: "+", text: <>Zero-downtime rolling deploys (update servers one by one)</> },
                  { sign: "-", text: <>Needs a load balancer and stateless design</> },
                  { sign: "-", text: <>Shared bottlenecks (the database) remain</> },
                ],
                verdict: <>Web and app tiers, workers, caches</>,
              },
            ]}
          />
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Vertical</th>
                  <th>Horizontal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Simplicity</td>
                  <td>✅ Very simple</td>
                  <td>❌ Needs a load balancer (LB) and a stateless design</td>
                </tr>
                <tr>
                  <td>Max scale</td>
                  <td>❌ Hardware ceiling</td>
                  <td>✅ Nearly unlimited</td>
                </tr>
                <tr>
                  <td>Fault tolerance</td>
                  <td>❌ Single point of failure</td>
                  <td>✅ Survives server failures</td>
                </tr>
                <tr>
                  <td>Cost at large scale</td>
                  <td>❌ Steep</td>
                  <td>✅ Commodity machines</td>
                </tr>
                <tr>
                  <td>Best for</td>
                  <td>Databases, early-stage apps, quick fixes</td>
                  <td>Web/app tiers, workers, caches</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>When vertical scaling is the right answer:</strong>
          </p>
          <ul>
            <li>Your app is small and a bigger machine solves the problem for years.</li>
            <li>The bottleneck is a database that is hard to split.</li>
            <li>You need a quick fix before a deadline, while you plan a longer-term change.</li>
          </ul>
          <p>
            <strong>Do not</strong> scale out before making the app stateless. You will just get random logouts and
            missing files.
          </p>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Stack Overflow</strong> is known for serving a huge global audience with a{" "}
            <strong>small number of powerful servers</strong>, including large SQL Server database machines. The team
            chose to scale up, and to tune performance carefully, instead of splitting into hundreds of services. This
            shows that vertical scaling can go a very long way.
          </p>
          <p>
            <strong>Let's Encrypt</strong>, which issues certificates for hundreds of millions of websites, wrote about
            upgrading its main database to much more powerful servers instead of redesigning the database layer. This
            is a clear, practical example of choosing vertical scaling for a database.
          </p>
          <p>
            <strong>Netflix</strong> runs its services as large groups of stateless instances in the cloud. It uses
            auto-scaling to add capacity in the evening when viewing peaks and to remove it overnight. Because the
            instances are interchangeable, Netflix can even stop random ones on purpose in production (with its "Chaos
            Monkey" tool) to prove that the system survives.
          </p>
          <p>
            <strong>Live sports streaming</strong> platforms know exactly when the big match starts, so they{" "}
            <strong>pre-scale</strong> (add servers early) before the first ball instead of relying only on
            auto-scaling. Waiting for the CPU load to rise would be too late when millions of people join within
            minutes.
          </p>
          <p>
            <strong>Your own projects.</strong> If you deploy a Node.js or Next.js app to a platform like Vercel, Render
            or Kubernetes, you are often running several instances without realising it. Keeping sessions in memory or
            files on local disk "works on my machine", then breaks in production for exactly the reasons above.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>When would you scale vertically rather than horizontally?</>,
                a: (
                  <>
                    <p>
                      When the app is small and a bigger machine gives you years of room to grow, when the bottleneck is
                      a database that is hard to split, or as a quick fix before a deadline. It keeps the system simple.
                      The price is a ceiling and a single point of failure.
                    </p>
                  </>
                ),
              },
              {
                q: <>What does it mean for a service to be stateless, and why does it matter?</>,
                a: (
                  <>
                    <p>
                      A stateless server keeps nothing important in its own memory or disk between requests. Sessions,
                      files and caches live in shared stores. Then any server can handle any request, so you can add,
                      remove and replace servers freely. This is required for horizontal scaling and auto-scaling.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is wrong with sticky sessions?</>,
                a: (
                  <>
                    <p>
                      They tie users to servers. So the load becomes uneven, users lose their sessions when their server
                      dies, and scaling in or deploying means waiting for attached users to finish. Use them only when
                      needed, such as for some long-lived connections.
                    </p>
                  </>
                ),
              },
              {
                q: <>You added 10 servers but throughput only doubled. Why?</>,
                a: (
                  <>
                    <p>
                      A shared bottleneck now limits everyone. It is usually the database, a cache, a lock or a
                      third-party API. Amdahl's law says that the part of the work that cannot be done in parallel
                      limits the total speed-up. Find the bottleneck with metrics and remove it (with caching, replicas,
                      batching or partitioning).
                    </p>
                  </>
                ),
              },
              {
                q: <>Why pre-scale before a big known event instead of relying on auto-scaling?</>,
                a: (
                  <>
                    <p>
                      Auto-scaling reacts after the load rises, and new instances take minutes to start and warm up.
                      When millions of users arrive within minutes, such as for a match or a sale, waiting for the CPU
                      load to climb is too late. So you add capacity in advance.
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
              <strong>Vertical scaling</strong> means a bigger machine: simple, but limited, expensive at the top end,
              and a single point of failure.
            </li>
            <li>
              <strong>Horizontal scaling</strong> means more machines behind a load balancer: nearly unlimited and
              fault-tolerant, but it needs stateless design.
            </li>
            <li>
              <strong>State</strong> (sessions, local files, in-memory data) is what stops apps from scaling out. Move
              it to <strong>Redis, object storage or the database</strong>.
            </li>
            <li>
              Avoid <strong>sticky sessions</strong> unless you truly need them.
            </li>
            <li>
              <strong>Databases</strong> usually scale vertically first. Scaling well means finding and removing{" "}
              <strong>shared bottlenecks</strong>.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>The Twelve-Factor App (factor VI, "Processes")</li>
            <li>The System Design Primer on GitHub (sections "Horizontal scaling" and "Application layer")</li>
            <li>
              <em>System Design Interview: An Insider's Guide</em> by Alex Xu (chapter 1)
            </li>
            <li>The Harvard CS75 scalability lecture by David Malan</li>
            <li>Let's Encrypt's blog post about its next-generation database servers</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
