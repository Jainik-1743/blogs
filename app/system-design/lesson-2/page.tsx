import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import { AsciiDiagram, Compare, QA, Stats } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-2")!;

export const metadata: Metadata = {
  title: `Lesson 2 — ${lesson.title}`,
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

const diagram1 = `Arrived:  [1] [2] [ ] [4] [5] [6]
                   ▲
          lost ─── everything behind it waits,
                   even though 4, 5 and 6 are already here`;

export default function SdLessonTwoPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            In the last post we saw that data travels as packets. But the internet makes <strong>no promises</strong>{" "}
            about those packets:
          </p>
          <ul>
            <li>Some get lost.</li>
            <li>Some arrive twice.</li>
            <li>Some arrive in the wrong order: packet 5 before packet 3.</li>
          </ul>
          <p>
            For a bank transfer, that is unacceptable. For a live video call, waiting for a lost packet is worse than
            just skipping it.
          </p>
          <p>
            So which do you want: <strong>"everything, in order, no matter how long it takes"</strong> or{" "}
            <strong>"fast, even if a bit is missing"</strong>? That choice is the difference between{" "}
            <strong>TCP</strong> and <strong>UDP</strong>, and it shapes how chat apps, games, video streaming and APIs
            are built.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>Think about two ways to send documents to a friend.</p>
          <p>
            <strong>TCP is like a courier with tracking.</strong> You number every page. The friend confirms each page
            they receive. If page 7 goes missing, you send it again. Your friend puts the pages in order before reading.
            It's reliable, but there is extra back-and-forth.
          </p>
          <p>
            <strong>UDP is like shouting across a room.</strong> You just say things. There's no "did you hear that?"
            and no repeating. If a word gets lost in the noise, it's gone. But it's very fast and very simple.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>TCP</th>
                  <th>UDP</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Connection</td>
                  <td>Must set up first (handshake)</td>
                  <td>None, just send</td>
                </tr>
                <tr>
                  <td>Delivery</td>
                  <td>Guaranteed (lost data is resent)</td>
                  <td>Not guaranteed</td>
                </tr>
                <tr>
                  <td>Order</td>
                  <td>Always in order</td>
                  <td>Can arrive in any order</td>
                </tr>
                <tr>
                  <td>Speed</td>
                  <td>More overhead, slower to start</td>
                  <td>Minimal overhead</td>
                </tr>
                <tr>
                  <td>Header size</td>
                  <td>20+ bytes</td>
                  <td>8 bytes</td>
                </tr>
                <tr>
                  <td>Used for</td>
                  <td>Web pages, APIs, email, file downloads, databases</td>
                  <td>Video calls, online games, DNS, live streaming</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="tcp-the-three-way-handshake">TCP: the three-way handshake</h3>
          <p>Before sending any data, TCP opens a connection with three messages:</p>
          <SequenceDiagram
            caption="The TCP three-way handshake. One full round trip passes before a single byte of real data moves."
            actors={["Client", "Server"]}
            messages={[
              { from: 0, to: 1, label: <>SYN</>, note: <>“Can we talk? My numbers start at 100”</> },
              { from: 1, to: 0, label: <>SYN-ACK</>, note: <>“Got your 100. Mine start at 500”</>, reply: true },
              { from: 0, to: 1, label: <>ACK</>, note: <>“Got your 500. Let's go.”</> },
              { from: 0, to: 0, label: <>Connection open — data can now flow both ways</>, divider: true },
              { from: 0, to: 1, label: <>GET /index.html</>, note: <>the first real bytes, 1 RTT later</> },
              { from: 1, to: 0, label: <>200 OK + data</>, reply: true },
            ]}
          />
          <p>
            This costs <strong>one full round trip</strong> before any real data is sent. If the server is 100 ms away,
            you've waited 100 ms just to say hello. This is why:
          </p>
          <ul>
            <li>
              <strong>Keep-alive</strong> (reusing one connection for many requests) matters so much.
            </li>
            <li>
              <strong>Connection pools</strong> in backends keep connections open instead of making new ones for every
              database query.
            </li>
          </ul>
          <h3 id="tcp-how-reliability-works">TCP: how reliability works</h3>
          <ul>
            <li>
              <strong>Sequence numbers.</strong> Every byte has a number, so the receiver can put data back in order and
              spot gaps.
            </li>
            <li>
              <strong>Acknowledgements (ACKs).</strong> The receiver says "I've got everything up to byte 4,000".
            </li>
            <li>
              <strong>Retransmission.</strong> If the sender doesn't get an ACK in time, it sends the data again.
            </li>
          </ul>
          <h3 id="tcp-flow-control-and-congestion-control">TCP: flow control and congestion control</h3>
          <p>These two ideas sound alike but protect different things.</p>
          <ul>
            <li>
              <strong>Flow control</strong> protects the <strong>receiver</strong>. The receiver says "I only have room
              for 64 KB right now, don't send more". This is the <em>receive window</em>.
            </li>
            <li>
              <strong>Congestion control</strong> protects the <strong>network</strong>. TCP starts slowly (called{" "}
              <strong>slow start</strong>), sends more and more while things go well, and backs off sharply when packets
              are lost, because loss usually means the road is jammed. Modern algorithms like <strong>CUBIC</strong>{" "}
              (the Linux default) and <strong>BBR</strong> (created by Google) are smarter versions of this.
            </li>
          </ul>
          <p>
            A practical result: <strong>a brand-new TCP connection is slow at first</strong>. It needs a few round trips
            to "ramp up". That's another reason reusing connections is faster.
          </p>
          <h3 id="tcp-head-of-line-blocking">TCP: head-of-line blocking</h3>
          <p>
            TCP promises order. So if packet 3 is lost, packets 4, 5 and 6 may have already arrived, but the app{" "}
            <strong>can't see them</strong> until packet 3 is resent and arrives.
          </p>
          <AsciiDiagram caption="Head-of-line blocking" text={diagram1} />
          <p>
            This is called <strong>head-of-line blocking</strong>. It's fine for downloading a file. It's painful for a
            video call, where old data is useless.
          </p>
          <h3 id="closing-a-tcp-connection">Closing a TCP connection</h3>
          <p>
            Connections close with FIN and ACK messages. The side that closes first then waits in a state called{" "}
            <strong>TIME_WAIT</strong> for a short time, to catch any stray packets.
          </p>
          <p>
            On a very busy server that opens and closes thousands of short connections, these waiting connections can
            pile up and use up the available ports. This is one more reason to reuse connections.
          </p>
          <h3 id="udp-just-send-it">UDP: just send it</h3>
          <p>
            UDP has no handshake, no ACKs, no retransmission and no ordering. The app hands UDP a message (a{" "}
            <em>datagram</em>) and it goes. The header is only 8 bytes: source port, destination port, length and
            checksum.
          </p>
          <p>This means:</p>
          <ul>
            <li>
              <strong>No setup delay.</strong> The first message leaves immediately.
            </li>
            <li>
              <strong>No waiting for lost packets.</strong> The app gets whatever arrives.
            </li>
            <li>
              <strong>The app decides what to do about loss.</strong> A video app might hide a lost frame. A game might
              just use the next position update.
            </li>
          </ul>
          <h3 id="when-udp-apps-still-need-some-reliability">When UDP apps still need some reliability</h3>
          <p>
            Many UDP apps build <strong>their own small version</strong> of the features they need. For example:
          </p>
          <ul>
            <li>
              A game sends player positions over UDP (it's fine to lose one, because a newer one is coming in 16 ms),
              but adds sequence numbers so it can ignore old, out-of-order updates.
            </li>
            <li>A video call adds timestamps to play audio smoothly, and may resend only important frames.</li>
          </ul>
          <h3 id="quic-the-best-of-both">QUIC: the best of both</h3>
          <p>
            <strong>QUIC</strong> is a newer protocol, originally built at Google and now an internet standard. It runs{" "}
            <strong>on top of UDP</strong> but adds TCP-like reliability, built-in encryption, and multiple independent
            streams.
          </p>
          <ul>
            <li>
              <strong>Faster setup.</strong> It combines the connection and encryption handshakes into one round trip,
              and can use zero round trips when reconnecting to a known server.
            </li>
            <li>
              <strong>No head-of-line blocking between streams.</strong> If a packet for image A is lost, image B keeps
              loading.
            </li>
            <li>
              <strong>Connection migration.</strong> If your phone switches from Wi-Fi to mobile data, the connection
              can survive.
            </li>
          </ul>
          <p>
            Why build it on UDP instead of creating a new protocol? Because routers, firewalls and home routers across
            the world only understand TCP and UDP. A brand-new protocol would get blocked. UDP lets QUIC travel through
            the existing internet. <strong>HTTP/3 runs on QUIC.</strong>
          </p>
          <h3 id="choosing-between-them">Choosing between them</h3>
          <Compare
            caption="Which transport? Ask one question first: does every byte have to arrive, in order?"
            columns={[
              {
                title: <>TCP</>,
                items: [
                  { sign: "+", text: <>Every byte arrives, in order</> },
                  { sign: "+", text: <>OS handles retries, flow and congestion control</> },
                  { sign: "-", text: <>Handshake before any data</> },
                  { sign: "-", text: <>One lost packet blocks everything behind it</> },
                ],
                verdict: <>APIs, web pages, payments, file transfer, databases, email</>,
              },
              {
                title: <>UDP</>,
                items: [
                  { sign: "+", text: <>No setup — the first message leaves at once</> },
                  { sign: "+", text: <>Old data is simply skipped, never waited for</> },
                  { sign: "-", text: <>No delivery or order guarantees</> },
                  { sign: "-", text: <>Some firewalls block it; needs a TCP fallback</> },
                ],
                verdict: <>Voice and video calls, games, DNS, live telemetry</>,
              },
              {
                title: <>QUIC (HTTP/3)</>,
                items: [
                  { sign: "+", text: <>Reliable and encrypted, built on UDP</> },
                  { sign: "+", text: <>1-RTT setup, 0-RTT on reconnect</> },
                  { sign: "+", text: <>A lost packet only stalls its own stream</> },
                  { sign: "·", text: <>Survives Wi-Fi → mobile network switches</> },
                ],
                verdict: <>Modern web traffic, especially on mobile</>,
              },
            ]}
          />
          <Stats
            caption="What each one costs you, per packet and per connection."
            stats={[
              { value: <>20–60 B</>, label: <>TCP header</>, sub: <>sequence numbers, ACKs, windows</> },
              { value: <>8 B</>, label: <>UDP header</>, sub: <>ports, length, checksum — that's all</> },
              { value: <>1 RTT</>, label: <>TCP setup</>, sub: <>before the first byte of data</> },
              { value: <>0 RTT</>, label: <>UDP setup</>, sub: <>just send</> },
            ]}
          />
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <p>
            <strong>TCP</strong>
          </p>
          <ul>
            <li>✅ Reliable, ordered, well understood; works everywhere.</li>
            <li>✅ The operating system handles the hard parts for you.</li>
            <li>❌ Handshake delay on every new connection.</li>
            <li>❌ Head-of-line blocking.</li>
            <li>❌ Slow start on fresh connections.</li>
          </ul>
          <p>
            <strong>UDP</strong>
          </p>
          <ul>
            <li>✅ Very low overhead and latency; no setup.</li>
            <li>✅ Great for real-time data where old data is useless.</li>
            <li>❌ No delivery or order guarantees; you build what you need yourself.</li>
            <li>❌ Some corporate firewalls block UDP, so apps often need a TCP fallback.</li>
            <li>❌ No built-in congestion control. A careless UDP app can flood a network.</li>
          </ul>
          <p>
            <strong>When NOT to use UDP:</strong> anything where losing data means wrong results, such as payments,
            orders, account updates or file uploads. Just use TCP (or HTTP on top of it).
          </p>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Zoom, Google Meet and WhatsApp calls</strong> send audio and video mostly over UDP (usually through
            WebRTC or similar technology). If a packet is lost, you might hear a tiny glitch, but the call keeps going
            in real time. If the network blocks UDP, these apps often fall back to TCP, and calls usually feel laggier.
          </p>
          <p>
            <strong>Online games</strong> like Fortnite, Valorant or Call of Duty send player movement over UDP many
            times per second. Losing one update doesn't matter because the next one arrives milliseconds later. Things
            like purchases in the in-game store go over normal HTTPS, which uses TCP.
          </p>
          <p>
            <strong>DNS</strong> mostly uses UDP. A question and answer usually fit in a single small packet, so a
            handshake would double the time. If an answer is too big, DNS switches to TCP.
          </p>
          <p>
            <strong>Google, YouTube and Cloudflare</strong> serve a large share of their traffic over HTTP/3, which runs
            on QUIC over UDP. Mobile users on patchy networks benefit the most.
          </p>
          <p>
            <strong>Netflix and YouTube videos</strong> are mostly delivered over TCP (HTTP), unlike video calls. Why? A
            movie isn't live, so the player can <strong>buffer</strong> several seconds ahead. Reliability matters more
            than a few extra milliseconds.
          </p>
          <p>
            <strong>Databases</strong> such as PostgreSQL and MySQL use TCP. A query result with a missing row would be
            a bug, not a glitch.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>When would you choose UDP over TCP?</>,
                a: (
                  <>
                    <p>
                      When fresh data beats complete data: voice and video calls, multiplayer games, live telemetry, and
                      small request/response lookups like DNS. In those cases waiting for a lost packet is worse than
                      skipping it, and the app can add just the reliability it needs (sequence numbers, occasional
                      resends).
                    </p>
                  </>
                ),
              },
              {
                q: <>What is head-of-line blocking, and how does QUIC avoid it?</>,
                a: (
                  <>
                    <p>
                      TCP delivers bytes strictly in order, so one lost packet holds back everything that arrived after
                      it. HTTP/2 multiplexes many streams over one TCP connection, so one loss stalls all of them. QUIC
                      tracks ordering per stream on top of UDP, so a lost packet only delays the stream it belongs to.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why is a brand-new TCP connection slow, and what do systems do about it?</>,
                a: (
                  <>
                    <p>
                      It costs a handshake round trip, and slow start sends only a little data at first, ramping up over
                      several round trips. Systems reuse connections: HTTP keep-alive, connection pools to databases,
                      and long-lived connections between services.
                    </p>
                  </>
                ),
              },
              {
                q: <>Flow control vs congestion control — what does each protect?</>,
                a: (
                  <>
                    <p>
                      Flow control protects the receiver: it advertises a receive window so the sender never overruns
                      its buffer. Congestion control protects the network: TCP grows its sending rate while things go
                      well and backs off sharply on packet loss, which usually signals a jammed path.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why was QUIC built on UDP instead of as a brand-new protocol?</>,
                a: (
                  <>
                    <p>
                      Middleboxes. Routers, firewalls and home NAT boxes across the internet only understand TCP and
                      UDP, and block anything else. Building on UDP lets QUIC pass through the existing internet while
                      implementing reliability and encryption in user space.
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
              <strong>TCP</strong> gives you reliable, ordered delivery, at the cost of handshakes, ACKs and possible
              head-of-line blocking.
            </li>
            <li>
              <strong>UDP</strong> gives you speed and simplicity, but no guarantees. The app handles loss itself.
            </li>
            <li>
              New TCP connections are slow to start, so <strong>reuse connections</strong> with keep-alive and
              connection pools.
            </li>
            <li>
              Use UDP when <strong>fresh data beats complete data</strong>: calls, games, live streams.
            </li>
            <li>
              <strong>QUIC</strong> (and HTTP/3) builds reliability and encryption on top of UDP, getting much of TCP's
              safety with less delay.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              <em>High Performance Browser Networking</em> by Ilya Grigorik (chapters 2 and 3, "Building Blocks of TCP"
              and "Building Blocks of UDP")
            </li>
            <li>
              <em>Computer Networking: A Top-Down Approach</em> by Kurose and Ross (chapter 3, the transport layer)
            </li>
            <li>RFC 9293 (TCP) and RFC 9000 (QUIC), the official specifications</li>
            <li>Cloudflare's blog post "The Road to QUIC"</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
