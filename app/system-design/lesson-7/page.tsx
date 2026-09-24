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
            Your app runs on one server, and traffic has doubled in three months. CPU sits at 90%, pages are slowing
            down, and a big sale is coming next week. You have two options:
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
            Both work, but they lead to very different systems. And if you choose "more servers", you may discover a
            surprise. Users keep getting logged out, and uploaded profile pictures randomly disappear. That's a{" "}
            <strong>state</strong> problem, and it's the hidden reason many apps can't simply "add more servers".
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>Imagine a busy chai stall.</p>
          <p>
            <strong>Vertical scaling (scale up)</strong> means giving your one chaiwala a bigger stove, a bigger pot and
            faster hands. It's simple. Nothing about how the stall works changes. But one person can only get so fast,
            bigger equipment gets very expensive, and if they fall sick, the stall closes.
          </p>
          <p>
            <strong>Horizontal scaling (scale out)</strong> means opening more counters with more chaiwalas, and having
            someone at the front direct customers to whichever counter is free. You can keep adding counters almost
            forever, and if one chaiwala takes a break, the others keep serving. But now you need coordination. If a
            customer paid at counter 1 and comes back to counter 3 for their change, counter 3 needs to know about it.
          </p>
          <p>
            That "does counter 3 know about you?" question is the <strong>stateless vs stateful</strong> idea. It
            decides how easily you can scale out.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="vertical-scaling">Vertical scaling</h3>
          <p>
            You move to a machine with more CPU cores, more RAM, faster disks or a faster network. In the cloud this can
            be as easy as changing the instance size and restarting.
          </p>
          <CodeBlock code={code1} />
          <p>
            <strong>Good things:</strong>
          </p>
          <ul>
            <li>No code changes. Your app doesn't know anything changed.</li>
            <li>No distributed-system problems: one machine, one memory, one clock.</li>
            <li>Great for databases, which are hard to split across machines.</li>
          </ul>
          <p>
            <strong>Limits:</strong>
          </p>
          <ul>
            <li>
              <strong>There's a ceiling.</strong> Even the biggest cloud machines have limits.
            </li>
            <li>
              <strong>The cost curve is steep.</strong> A machine twice as big often costs more than twice as much at
              the high end.
            </li>
            <li>
              <strong>It's still a single point of failure.</strong> One machine means one hardware failure takes you
              down.
            </li>
            <li>
              <strong>It usually needs a restart</strong>, which means downtime.
            </li>
          </ul>
          <h3 id="horizontal-scaling">Horizontal scaling</h3>
          <p>
            You run many copies of your app on many machines, with a <strong>load balancer</strong> in front that
            spreads requests between them.
          </p>
          <AsciiDiagram text={diagram1} />
          <p>
            <strong>Good things:</strong>
          </p>
          <ul>
            <li>Almost unlimited growth. Just add servers.</li>
            <li>
              <strong>Fault tolerance.</strong> If server 2 dies, the load balancer sends traffic to 1 and 3.
            </li>
            <li>
              <strong>Cheaper hardware.</strong> Many ordinary machines instead of one huge one.
            </li>
            <li>
              <strong>Zero-downtime deploys.</strong> Update servers one at a time.
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
              Some parts, especially the <strong>database</strong>, don't scale out easily. Part 4 covers replication
              and sharding.
            </li>
          </ul>
          <h3 id="different-tiers-scale-differently">Different tiers scale differently</h3>
          <ul>
            <li>
              <strong>The web/app tier</strong> is usually easy to scale out, <em>if</em> it's stateless.
            </li>
            <li>
              <strong>Caches</strong> can be scaled out with partitioning.
            </li>
            <li>
              <strong>Databases</strong> are hard. Most teams scale the database <strong>vertically first</strong>, then
              add <strong>read replicas</strong>, and only shard when nothing else works.
            </li>
          </ul>
          <p>
            A very common real-world setup is <strong>many small app servers + one big database</strong> (plus
            replicas).
          </p>
          <h3 id="what-is-state">What is "state"?</h3>
          <p>
            <strong>State</strong> is any data a server remembers between requests. Common examples:
          </p>
          <ul>
            <li>
              <strong>Login sessions</strong> kept in server memory.
            </li>
            <li>
              <strong>Uploaded files</strong> saved to the server's local disk.
            </li>
            <li>
              <strong>In-memory caches</strong> holding user-specific data.
            </li>
            <li>
              <strong>Open connections</strong>, like WebSockets for chat.
            </li>
          </ul>
          <p>Here's why state breaks horizontal scaling:</p>
          <SequenceDiagram
            caption="Why in-memory sessions break when you add a second server."
            actors={["User", "Load balancer", "Server A", "Server B"]}
            messages={[
              { from: 0, to: 1, label: <>POST /login</> },
              { from: 1, to: 2, label: <>forward</> },
              { from: 2, to: 2, label: <>remember session 123 = Asha (in RAM)</> },
              { from: 2, to: 0, label: <>Set-Cookie: session=123</>, reply: true },
              { from: 0, to: 1, label: <>GET /dashboard (cookie 123)</> },
              { from: 1, to: 3, label: <>forward — round robin</> },
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
            handles the next request, the image "doesn't exist".
          </p>
          <h3 id="making-services-stateless">Making services stateless</h3>
          <p>
            A <strong>stateless</strong> server keeps nothing important in its own memory or disk between requests. Any
            server can handle any request. You move the state somewhere shared:
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
                    A shared store like <strong>Redis</strong>, or signed <strong>tokens</strong> (like JWTs) that the
                    client sends each time
                  </td>
                </tr>
                <tr>
                  <td>Uploaded files</td>
                  <td>
                    <strong>Object storage</strong> (like Amazon S3)
                  </td>
                </tr>
                <tr>
                  <td>Cached data</td>
                  <td>
                    A shared cache (<strong>Redis / Memcached</strong>)
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
            caption="The stateless layout. App servers are interchangeable; everything they must remember lives in shared stores."
            layers={[
              { name: <>Load balancer</>, desc: <>any server can take any request</> },
              { name: <>App servers × N</>, desc: <>stateless — add, remove, restart or replace at will</> },
              { name: <>Redis</>, tech: <>sessions, cache</>, desc: <>shared by every app server</> },
              { name: <>Database</>, tech: <>business data</>, desc: <>the source of truth</> },
              { name: <>Object storage (S3)</>, tech: <>uploaded files</>, desc: <>never on a server's local disk</> },
            ]}
          />
          <p>
            Now servers are <strong>interchangeable</strong>, like identical counters at the chai stall. You can add
            servers, remove them, restart them or replace them at any time. This is the key idea behind the well-known
            "Twelve-Factor App" guidelines: <em>run your app as stateless processes</em>.
          </p>
          <h3 id="sticky-sessions-a-shortcut-with-costs">Sticky sessions: a shortcut with costs</h3>
          <p>
            Another option is <strong>sticky sessions</strong>: the load balancer always sends the same user to the same
            server, usually using a cookie. It's a quick fix, but:
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
            </li>
          </ul>
          <p>
            Use sticky sessions only when you truly must, such as for some long-lived connections. Otherwise, make the
            app stateless.
          </p>
          <h3 id="some-things-are-naturally-stateful">Some things are naturally stateful</h3>
          <p>
            Not everything can be stateless. Databases, chat servers holding WebSocket connections, multiplayer game
            servers and stream processors all <em>have</em> to hold state. They're scaled with extra techniques:
          </p>
          <ul>
            <li>replication (copies),</li>
            <li>partitioning (each server owns part of the data or part of the users),</li>
            <li>routing that sends each user or key to the right server.</li>
          </ul>
          <p>We'll cover these in later series.</p>
          <h3 id="auto-scaling">Auto-scaling</h3>
          <p>
            With stateless servers, you can let the cloud <strong>add and remove servers automatically</strong> based on
            a signal:
          </p>
          <ul>
            <li>CPU usage (for example, "keep average CPU around 60%"),</li>
            <li>requests per second,</li>
            <li>queue length (for background workers).</li>
          </ul>
          <p>Two practical points:</p>
          <ul>
            <li>
              <strong>New servers take time to start and warm up</strong>, from seconds to minutes. Auto-scaling reacts{" "}
              <em>after</em> load rises, so for predictable spikes (a sale, a big match),{" "}
              <strong>scale up in advance</strong>.
            </li>
            <li>
              Set a <strong>minimum</strong> number of servers, so a failure never leaves you with zero.
            </li>
          </ul>
          <h3 id="why-10-servers-aren-t-10-faster">Why 10 servers aren't 10× faster</h3>
          <p>Adding servers rarely gives perfect linear growth:</p>
          <ul>
            <li>
              <strong>Shared bottlenecks.</strong> All servers still use the same database, cache or third-party API.
            </li>
            <li>
              <strong>Coordination costs.</strong> Servers may need to talk to each other, share locks or sync data.
            </li>
            <li>
              <strong>Amdahl's law.</strong> If part of the work can't be split, like one shared database write, that
              part limits your total speedup, no matter how many servers you add.
            </li>
          </ul>
          <p>
            Scalability isn't just adding boxes. It's <strong>removing the shared bottlenecks</strong> one by one.
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
                  { sign: "+", text: <>Zero-downtime rolling deploys</> },
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
                  <td>❌ Needs LB, stateless design</td>
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
            <li>The bottleneck is a database that's hard to split.</li>
            <li>You need a quick fix before a deadline, while you plan a longer-term change.</li>
          </ul>
          <p>
            <strong>Don't</strong> scale out before making the app stateless. You'll just get random logouts and missing
            files.
          </p>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Stack Overflow</strong> is famous for serving a huge global audience with a{" "}
            <strong>surprisingly small number of powerful servers</strong>, including large SQL Server database
            machines. The team chose to scale up, and to tune performance carefully, instead of splitting into hundreds
            of services. It shows vertical scaling can go a very long way.
          </p>
          <p>
            <strong>Let's Encrypt</strong>, which issues certificates for hundreds of millions of websites, wrote about
            upgrading its main database to much more powerful servers instead of redesigning the database layer. It's a
            clear, practical example of choosing vertical scaling for a database.
          </p>
          <p>
            <strong>Netflix</strong> runs its services as large fleets of stateless instances in the cloud, using
            auto-scaling to add capacity in the evening when viewing peaks and remove it overnight. Because the
            instances are interchangeable, Netflix can even deliberately kill random ones in production (their "Chaos
            Monkey" tool) to prove the system survives.
          </p>
          <p>
            <strong>Live sports streaming</strong> platforms know exactly when the big match starts, so they{" "}
            <strong>pre-scale</strong> their fleets before the first ball instead of relying only on auto-scaling.
            Waiting for CPU to rise would be too late when millions of people join within minutes.
          </p>
          <p>
            <strong>Your own projects.</strong> If you deploy a Node.js or Next.js app to a platform like Vercel, Render
            or Kubernetes, you're often running several instances without realising it. Storing sessions in memory or
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
                      When the app is small and a bigger machine buys years of headroom, when the bottleneck is a
                      database that is hard to split, or as a quick fix before a deadline. It keeps the system simple —
                      at the price of a ceiling and a single point of failure.
                    </p>
                  </>
                ),
              },
              {
                q: <>What does it mean for a service to be stateless, and why does it matter?</>,
                a: (
                  <>
                    <p>
                      A stateless server keeps nothing important in its own memory or disk between requests; sessions,
                      files and caches live in shared stores. Then any server can handle any request, so you can add,
                      remove and replace servers freely — the precondition for horizontal scaling and auto-scaling.
                    </p>
                  </>
                ),
              },
              {
                q: <>What's wrong with sticky sessions?</>,
                a: (
                  <>
                    <p>
                      They pin users to servers, so load becomes uneven, users lose their sessions when their server
                      dies, and scaling in or deploying means draining attached users. Use them only when needed, such
                      as for some long-lived connections.
                    </p>
                  </>
                ),
              },
              {
                q: <>You added 10 servers but throughput only doubled. Why?</>,
                a: (
                  <>
                    <p>
                      A shared bottleneck — usually the database, a cache, a lock or a third-party API — now limits
                      everyone. Amdahl's law: the part of the work that can't be parallelised caps the total speed-up.
                      Find it with metrics and remove it (caching, replicas, batching, partitioning).
                    </p>
                  </>
                ),
              },
              {
                q: <>Why pre-scale before a big known event instead of relying on auto-scaling?</>,
                a: (
                  <>
                    <p>
                      Auto-scaling reacts after load rises, and new instances take minutes to boot and warm up. When
                      millions of users arrive in minutes — a match, a sale — waiting for CPU to climb is too late, so
                      capacity is added in advance.
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
