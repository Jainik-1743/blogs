import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Flow, QA } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-33")!;

export const metadata: Metadata = {
  title: `Lesson 33 — ${lesson.title}`,
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

const code1 = `setInterval(async () => {
  const res = await fetch("/api/notifications?since=" + lastSeen);
  render(await res.json());
}, 5000);`;

const code2 = `GET /events
Accept: text/event-stream

HTTP/1.1 200 OK
Content-Type: text/event-stream

id: 101
event: order_status
data: {"orderId": 5521, "status": "out_for_delivery"}

id: 102
event: order_status
data: {"orderId": 5521, "status": "delivered"}`;

const code3 = `const events = new EventSource("/events");
events.addEventListener("order_status", (e) => {
  const update = JSON.parse(e.data);
  showStatus(update.status);
});`;

const code4 = `const ws = new WebSocket("wss://chat.example.com/ws");
ws.onmessage = (e) => handle(JSON.parse(e.data));
ws.send(JSON.stringify({ type: "message", to: "ravi", text: "hi" }));`;

export default function SdLessonThreeThreePage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            HTTP works like this: <strong>the client asks, the server answers</strong>. The server can't start a
            conversation. But many features need the <strong>server to tell the client</strong> something the moment it
            happens:
          </p>
          <ul>
            <li>"You have a new message."</li>
            <li>"Your food is out for delivery."</li>
            <li>"The stock price just changed."</li>
            <li>"Your teammate edited this document."</li>
            <li>"The AI is still writing its answer…"</li>
          </ul>
          <p>
            How do you get updates from server to client in real time, for millions of users, without melting your
            servers? There are four main techniques:{" "}
            <strong>short polling, long polling, Server-Sent Events (SSE) and WebSockets</strong>. Each suits different
            situations.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Imagine you're waiting for a <strong>parcel delivery</strong>.
          </p>
          <ul>
            <li>
              <strong>Short polling:</strong> you open the door <strong>every 5 minutes</strong> to check if it has
              arrived. It's simple, but it's mostly wasted trips, and you might see it up to 5 minutes late.
            </li>
            <li>
              <strong>Long polling:</strong> you call the courier and say "
              <strong>don't hang up until my parcel is here</strong>". When it arrives, they tell you, and you call
              again for the next one.
            </li>
            <li>
              <strong>Server-Sent Events (SSE):</strong> you subscribe to <strong>SMS updates</strong> from the courier.
              They message you every time something changes. It's one-way: you can't reply by SMS.
            </li>
            <li>
              <strong>WebSockets:</strong> you and the courier keep a <strong>phone call open</strong> the whole time,
              and <strong>either of you</strong> can speak at any moment.
            </li>
          </ul>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="1-short-polling">1. Short polling</h3>
          <p>The client asks for updates every N seconds:</p>
          <SequenceDiagram
            caption="Short polling. Most requests come back empty, and updates arrive up to one interval late."
            actors={["Client", "Server"]}
            messages={[
              { from: 0, to: 1, label: <>GET /notifications?since=…</> },
              { from: 1, to: 0, label: <>nothing new</>, reply: true },
              { from: 0, to: 1, label: <>GET /notifications?since=…</>, note: <>5 s later</> },
              { from: 1, to: 0, label: <>nothing new</>, reply: true },
              { from: 0, to: 1, label: <>GET /notifications?since=…</>, note: <>5 s later</> },
              { from: 1, to: 0, label: <>1 new message!</>, reply: true },
            ]}
          />
          <CodeBlock lang="js" code={code1} />
          <ul>
            <li>
              ✅ <strong>Dead simple.</strong> It works everywhere, with any backend, load balancer and CDN.
            </li>
            <li>
              ❌ <strong>Wasteful.</strong> Most requests return nothing.
            </li>
            <li>
              ❌ <strong>Delay.</strong> On average, updates arrive half an interval late.
            </li>
          </ul>
          <p>
            Quick maths (post 10):{" "}
            <strong>1 million users polling every 5 seconds = 200,000 requests per second</strong>, mostly returning
            "nothing new". That's a lot of servers doing almost nothing useful.
          </p>
          <p>
            <strong>Good for:</strong> low-frequency updates, a small number of users, checking a background job's
            status ("Is my report ready?"), or dashboards refreshed every minute.
          </p>
          <h3 id="2-long-polling">2. Long polling</h3>
          <p>
            The client sends a request, and the server <strong>holds it open</strong> until there's news or a timeout
            (say 30 seconds). Then the client <strong>immediately</strong> sends another request.
          </p>
          <SequenceDiagram
            caption="Long polling. The server holds each request until there's news or a timeout, then the client asks again at once."
            actors={["Client", "Server"]}
            messages={[
              { from: 0, to: 1, label: <>GET /updates</> },
              { from: 1, to: 1, label: <>hold… until news arrives</> },
              { from: 1, to: 0, label: <>1 new message</>, reply: true },
              { from: 0, to: 1, label: <>GET /updates</>, note: <>immediately</> },
              { from: 1, to: 1, label: <>hold… 30 s, nothing</> },
              { from: 1, to: 0, label: <>timeout, nothing new</>, reply: true },
              { from: 0, to: 1, label: <>GET /updates</> },
            ]}
          />
          <ul>
            <li>
              ✅ <strong>Near real-time</strong>, using plain HTTP, so it works through almost every proxy and firewall.
            </li>
            <li>
              ✅ <strong>Much less wasted traffic</strong> than short polling.
            </li>
            <li>
              ❌ <strong>Each waiting client holds a request open</strong> on the server. With thread-per-request
              servers (post 4), that's a thread per user. Event-loop servers (Node.js, Go, NGINX) handle this much
              better.
            </li>
            <li>
              ❌ There's still overhead from <strong>reconnecting</strong> after every message, and message ordering and
              gaps need care.
            </li>
          </ul>
          <p>
            <strong>Good for:</strong> a fallback when WebSockets aren't possible, and moderate real-time needs. Early
            versions of many chat apps used long polling.
          </p>
          <h3 id="3-server-sent-events-sse">3. Server-Sent Events (SSE)</h3>
          <p>
            The client opens <strong>one long-lived HTTP connection</strong>, and the server{" "}
            <strong>streams events</strong> down it whenever it likes. It's <strong>one-way</strong>: server to client.
          </p>
          <CodeBlock lang="http" code={code2} />
          <p>In the browser, it's just a few lines:</p>
          <CodeBlock lang="js" code={code3} />
          <ul>
            <li>
              ✅ <strong>Simple.</strong> It's plain HTTP with a text format, and it works with normal load balancers,
              auth cookies and HTTP/2.
            </li>
            <li>
              ✅ <strong>Automatic reconnect built in.</strong> The browser reconnects and sends{" "}
              <code>Last-Event-ID</code>, so the server can <strong>resume</strong> from where the client left off.
            </li>
            <li>
              ✅ Great for <strong>streaming text</strong>.
            </li>
            <li>
              ❌ <strong>Server → client only.</strong> To send data up, the client uses normal HTTP requests (which is
              often perfectly fine).
            </li>
            <li>
              ❌ <strong>Text only</strong> (binary data must be encoded).
            </li>
            <li>
              ❌ With <strong>HTTP/1.1</strong>, browsers allow only about <strong>6 connections per domain</strong>,
              and each SSE stream uses one. HTTP/2 multiplexing removes this problem.
            </li>
          </ul>
          <p>
            <strong>Good for:</strong> live feeds, notifications, sports scores, stock tickers, progress bars,
            deployment logs, and <strong>streaming AI responses</strong> word by word.
          </p>
          <h3 id="4-websockets">4. WebSockets</h3>
          <p>
            A WebSocket starts as an HTTP request that asks to <strong>upgrade</strong> the connection, and then becomes
            a <strong>persistent, two-way channel</strong>:
          </p>
          <SequenceDiagram
            caption="A WebSocket starts as one HTTP request, then becomes a two-way channel."
            actors={["Client", "Server"]}
            messages={[
              { from: 0, to: 1, label: <>GET /chat · Upgrade: websocket</> },
              { from: 1, to: 0, label: <>101 Switching Protocols</>, reply: true },
              { from: 0, to: 0, label: <>Full duplex — either side may send a frame at any time</>, divider: true },
              { from: 0, to: 1, label: <>&#123;type: message, to: ravi, text: hi&#125;</> },
              { from: 1, to: 0, label: <>&#123;type: typing, from: ravi&#125;</>, reply: true },
              { from: 1, to: 0, label: <>&#123;type: message, from: ravi, text: hello!&#125;</>, reply: true },
              { from: 0, to: 1, label: <>ping</>, note: <>heartbeat every ~30 s</> },
              { from: 1, to: 0, label: <>pong</>, reply: true },
            ]}
          />
          <CodeBlock lang="js" code={code4} />
          <ul>
            <li>
              ✅ <strong>True two-way, low-latency</strong> communication, with very little overhead per message after
              setup.
            </li>
            <li>
              ✅ Supports <strong>binary</strong> data (games, audio).
            </li>
            <li>
              ❌ <strong>Stateful connections.</strong> Each server holds many open connections, which makes scaling,
              deploys and load balancing harder (see below).
            </li>
            <li>
              ❌ <strong>Some proxies and corporate firewalls</strong> interfere with long-lived connections. Use{" "}
              <code>wss://</code> (TLS), which usually gets through.
            </li>
            <li>
              ❌ <strong>No built-in reconnect or resume.</strong> You must build heartbeats, reconnection and message
              recovery yourself (or use a library such as Socket.IO).
            </li>
          </ul>
          <p>
            <strong>Good for:</strong> chat, multiplayer games, collaborative editors, live trading screens, and
            anything where <strong>both sides</strong> send frequent messages.
          </p>
          <h3 id="comparison">Comparison</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Short polling</th>
                  <th>Long polling</th>
                  <th>SSE</th>
                  <th>WebSockets</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Direction</td>
                  <td>Client asks</td>
                  <td>Client asks, server delays</td>
                  <td>
                    <strong>Server → client</strong>
                  </td>
                  <td>
                    <strong>Both ways</strong>
                  </td>
                </tr>
                <tr>
                  <td>Latency</td>
                  <td>Up to the interval</td>
                  <td>Low</td>
                  <td>Low</td>
                  <td>
                    <strong>Lowest</strong>
                  </td>
                </tr>
                <tr>
                  <td>Server cost</td>
                  <td>High (many empty requests)</td>
                  <td>Medium (held requests)</td>
                  <td>Low–medium (open streams)</td>
                  <td>Low–medium (open connections)</td>
                </tr>
                <tr>
                  <td>Protocol</td>
                  <td>Plain HTTP</td>
                  <td>Plain HTTP</td>
                  <td>Plain HTTP</td>
                  <td>Upgraded protocol</td>
                </tr>
                <tr>
                  <td>Auto-reconnect</td>
                  <td>N/A</td>
                  <td>Manual</td>
                  <td>✅ Built in</td>
                  <td>❌ Build it yourself</td>
                </tr>
                <tr>
                  <td>Binary data</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>❌ (text)</td>
                  <td>✅</td>
                </tr>
                <tr>
                  <td>Best for</td>
                  <td>Rare updates, job status</td>
                  <td>Fallback, moderate real-time</td>
                  <td>Feeds, notifications, AI streaming</td>
                  <td>Chat, games, collaboration</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3 id="scaling-persistent-connections">Scaling persistent connections</h3>
          <p>
            With SSE and WebSockets, each user keeps a connection open <strong>to one specific server</strong>. That
            creates new design problems.
          </p>
          <p>
            <strong>1. Connection capacity.</strong> A well-tuned server can hold tens or even hundreds of thousands of
            mostly-idle connections, but you must tune file-descriptor limits, memory per connection and timeouts.
            Estimate it: <strong>10 million online users ÷ 100k connections per server = 100 gateway servers</strong>.
          </p>
          <p>
            <strong>2. Routing messages to the right server.</strong> User A is connected to <strong>gateway 1</strong>.
            User B is connected to <strong>gateway 7</strong>. When A sends B a message, how does it reach gateway 7?
          </p>
          <Flow
            caption="Delivering a message between users connected to different gateway servers."
            nodes={[
              { title: <>User A's connection</>, desc: <>a WebSocket to gateway 1</> },
              { title: <>Gateway 1</>, desc: <>stores the message durably first, then publishes it</> },
              { title: <>Pub/Sub backplane</>, desc: <>Redis, NATS or Kafka — every gateway subscribes</> },
              { title: <>Presence registry</>, desc: <>“user B is on gateway 7”</> },
              { title: <>Gateway 7</>, desc: <>pushes the frame down B's socket</> },
              {
                title: <>User B</>,
                desc: <>sees it in milliseconds; on reconnect, replays anything missed by sequence number</>,
                tone: "good",
              },
            ]}
          />
          <p>The common pattern:</p>
          <ul>
            <li>
              <strong>Gateways</strong> only manage connections.
            </li>
            <li>
              A <strong>pub/sub system</strong> (Redis Pub/Sub, NATS, Kafka) passes messages between gateways.
            </li>
            <li>
              A <strong>presence registry</strong> records which user is connected to which gateway.
            </li>
          </ul>
          <p>We'll design this fully in the chat-system case study (post 63).</p>
          <p>
            <strong>3. Load balancing.</strong> Balancing <strong>connections</strong> evenly matters more than
            balancing requests. Use least-connections balancing, and remember that a new server starts empty. Long-lived
            connections don't rebalance on their own.
          </p>
          <p>
            <strong>4. Deploys and restarts.</strong> Restarting a gateway drops every connection on it. Clients must{" "}
            <strong>reconnect with backoff and random jitter</strong>, or thousands reconnecting at the same instant
            will create a stampede (Part 7). Drain connections gradually during deploys.
          </p>
          <p>
            <strong>5. Heartbeats.</strong> Send <strong>ping/pong</strong> messages every 20–60 seconds. They detect
            dead connections (like a phone that went into a tunnel), and they stop proxies from closing "idle"
            connections.
          </p>
          <p>
            <strong>6. Don't lose messages.</strong> Connections will drop. So:
          </p>
          <ul>
            <li>
              give messages <strong>sequence numbers or IDs</strong>,
            </li>
            <li>
              on reconnect, the client says "the last thing I got was #1041", and the server <strong>replays</strong>{" "}
              what was missed from storage,
            </li>
            <li>
              <strong>store</strong> messages durably first, then push them. The push is a <strong>notification</strong>
              , not the only copy.
            </li>
          </ul>
          <h3 id="beyond-these-four">Beyond these four</h3>
          <ul>
            <li>
              <strong>Webhooks:</strong> server-to-<strong>server</strong> push. "Call my URL when a payment succeeds"
              (post 34 covers making them reliable).
            </li>
            <li>
              <strong>Mobile push notifications</strong> (APNs, FCM): reach phones even when the app is closed (post
              62).
            </li>
            <li>
              <strong>WebRTC:</strong> peer-to-peer audio and video (post 2).
            </li>
            <li>
              <strong>MQTT:</strong> a lightweight publish/subscribe protocol for IoT devices.
            </li>
            <li>
              <strong>WebTransport:</strong> a newer, QUIC-based option for low-latency, two-way communication.
            </li>
          </ul>
          <h3 id="choosing">Choosing</h3>
          <Flow
            caption="Choosing a push technique."
            nodes={[
              { title: <>Does the server need to push at all?</>, desc: <>if not, plain REST requests</> },
              { title: <>Short polling</>, desc: <>job status, slow dashboards</>, label: <>updates minutes apart</> },
              {
                title: <>Server-Sent Events</>,
                desc: <>feeds, notifications, streaming AI text</>,
                label: <>server → client only</>,
                tone: "good",
              },
              {
                title: <>WebSockets</>,
                desc: <>chat, games, collaborative editing</>,
                label: <>frequent messages both ways</>,
                tone: "good",
              },
              {
                title: <>Long polling</>,
                desc: <>the fallback that works everywhere</>,
                label: <>networks that block both</>,
                tone: "muted",
              },
            ]}
          />
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Polling:</strong> simplest, and stateless on the server, but wasteful and delayed.
            </li>
            <li>
              <strong>SSE:</strong> simple, HTTP-friendly and auto-reconnecting, but one-way and text-only.
            </li>
            <li>
              <strong>WebSockets:</strong> the most powerful and efficient for chatty two-way traffic, but stateful. You
              must handle scaling, routing, reconnection and message recovery yourself.
            </li>
            <li>
              <strong>All persistent approaches</strong> make servers <strong>stateful</strong> (post 7), which
              complicates deployments, auto-scaling and load balancing.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Slack and Discord</strong> use WebSockets to push messages, typing indicators and presence to
            clients in real time. Discord's "gateway" handles a huge number of concurrent WebSocket connections, with
            backend systems routing events to the right gateway servers.
          </p>
          <p>
            <strong>AI chat assistants.</strong> When an AI assistant shows its answer word by word, that streaming is
            commonly done with <strong>Server-Sent Events</strong>. Major AI APIs stream generated text to developers as
            SSE events, which shows that SSE is ideal for one-way, incremental text.
          </p>
          <p>
            <strong>Food delivery and ride tracking.</strong> Seeing your rider move on the map combines techniques: the
            rider's app sends location updates frequently, and your app receives updates through a persistent connection
            or frequent polling, with push notifications for major events like "arriving now".
          </p>
          <p>
            <strong>Stock trading apps and live cricket scores</strong> push price or score updates many times per
            second to many users, typically using WebSockets or SSE, with a pub/sub layer fanning the same update out to
            everyone watching.
          </p>
          <p>
            <strong>Status checks.</strong> Many "your export is being prepared" features simply{" "}
            <strong>short-poll</strong> a job-status endpoint every few seconds. When updates are rare and users are
            few, it's the simplest reliable choice.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>Compare polling, long polling, SSE and WebSockets.</>,
                a: (
                  <>
                    <p>
                      Short polling asks on a timer: simple but wasteful and delayed. Long polling holds each request
                      until there's news: near real-time over plain HTTP, but it reconnects constantly. SSE streams
                      server-to-client events over one HTTP connection with built-in reconnect and resume. WebSockets
                      upgrade to a persistent two-way channel with the lowest latency, but you handle reconnects and
                      state yourself.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why is SSE a good fit for streaming AI responses?</>,
                a: (
                  <>
                    <p>
                      The data flows one way, as incremental text. SSE is plain HTTP (works with proxies, auth and
                      HTTP/2), trivial to consume with EventSource, and resumes from the last event ID after a drop. The
                      client sends its prompt with a normal POST.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you route a message to a user connected to a different server?</>,
                a: (
                  <>
                    <p>
                      Keep a presence registry of which gateway holds each user's connection, and connect gateways
                      through a pub/sub backplane like Redis, NATS or Kafka. The sender's gateway publishes; the
                      recipient's gateway receives and pushes down the socket.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you avoid losing messages when WebSocket connections drop?</>,
                a: (
                  <>
                    <p>
                      Persist messages before pushing and treat the push as a notification. Give messages sequence
                      numbers; on reconnect the client sends the last one it saw and the server replays the rest. Use
                      heartbeats to detect dead connections.
                    </p>
                  </>
                ),
              },
              {
                q: <>What happens to WebSocket clients when you deploy a gateway?</>,
                a: (
                  <>
                    <p>
                      Every connection on it drops. Drain gateways gradually, and make clients reconnect with
                      exponential backoff plus random jitter so thousands don't reconnect at the same instant and
                      stampede the remaining servers.
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
              HTTP is <strong>client-initiated</strong>. For server push, choose between{" "}
              <strong>short polling, long polling, SSE and WebSockets</strong>.
            </li>
            <li>
              <strong>Short polling</strong> is simple but wasteful. <strong>Long polling</strong> is near real-time
              over plain HTTP.
            </li>
            <li>
              <strong>SSE</strong> is <strong>one-way, HTTP-friendly and auto-reconnecting</strong>, which makes it
              ideal for feeds, notifications and streaming AI text.
            </li>
            <li>
              <strong>WebSockets</strong> give <strong>two-way, low-latency</strong> channels, which makes them ideal
              for chat, games and collaboration.
            </li>
            <li>
              Persistent connections need <strong>gateways + pub/sub + presence registry</strong>, plus{" "}
              <strong>heartbeats, reconnect with jitter and message replay</strong>. Store first, then push.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>RFC 6455 (The WebSocket Protocol) and RFC 6202 (long polling and HTTP streaming best practices)</li>
            <li>MDN Web Docs guides on the WebSockets API and Server-Sent Events</li>
            <li>
              <em>High Performance Browser Networking</em> by Ilya Grigorik (chapters on XMLHttpRequest, Server-Sent
              Events and WebSocket)
            </li>
            <li>Slack's engineering blog post "Real-time Messaging"</li>
            <li>Discord's blog post "How Discord Scaled Elixir to 5,000,000 Concurrent Users"</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
