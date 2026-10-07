import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Compare, Flow, QA, Stats } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-63")!;

export const metadata: Metadata = {
  title: `Lesson 63 — ${lesson.title}`,
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

const code1 = `// Client → server: send a message
{ "type": "send", "clientMsgId": "c-7f3a…", "conversationId": "conv_881",
  "body": "Lunch at 1?", "sentAt": "2027-05-06T08:00:01Z" }

// Server → sender: acknowledgement (✓ sent: the message is safely stored)
{ "type": "ack", "clientMsgId": "c-7f3a…", "messageId": "1789012345678901234", "seq": 1042 }

// Server → recipients: new message
{ "type": "message", "conversationId": "conv_881", "messageId": "1789012345678901234",
  "seq": 1042, "senderId": "42", "body": "Lunch at 1?", "createdAt": "…" }

// Client → server: receipts
{ "type": "delivered", "conversationId": "conv_881", "upToSeq": 1042 }
{ "type": "read",      "conversationId": "conv_881", "upToSeq": 1042 }

// Reconnect and catch up (sync)
{ "type": "sync", "conversations": [ { "id": "conv_881", "afterSeq": 1038 } ] }`;

const code2 = `conversations:        conversation_id, type (direct/group), created_at, last_seq
conversation_members: conversation_id, user_id, role, joined_at,
                      last_delivered_seq, last_read_seq
messages:             PARTITION KEY (conversation_id [, time_bucket])
                      CLUSTERING KEY seq (or message_id) DESC
                      sender_id, body / media_ref, created_at, type, edited/deleted flags
user_inbox (optional):user_id → list of (conversation_id, last_seq, unread_count) for the chat list
devices:              user_id, device_id, push_token, platform, last_seen`;

const code3 = `-- Messages are split into partitions by conversation (plus a time bucket for very busy groups),
-- and stored newest first. So "load the latest 50 messages" reads just one partition.
PRIMARY KEY ((conversation_id, bucket), seq)  WITH CLUSTERING ORDER BY (seq DESC)`;

export default function SdLessonSixThreePage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            Design a chat app like <strong>WhatsApp, Messenger, Slack or Discord</strong>. Users expect:
          </p>
          <ul>
            <li>
              messages to arrive <strong>instantly</strong> (in well under a second),
            </li>
            <li>
              to <strong>never</strong> lose a message, even on weak mobile networks,
            </li>
            <li>
              messages to appear <strong>in the right order</strong>,
            </li>
            <li>
              to see <strong>who is online</strong> and "typing…",
            </li>
            <li>
              <strong>read receipts</strong> (✓✓, which show that the other person has read the message),
            </li>
            <li>
              to switch between <strong>phone and laptop</strong> and see the same conversation,
            </li>
            <li>
              <strong>group chats</strong> with hundreds of people,
            </li>
            <li>
              and a <strong>push notification</strong> when the app is closed.
            </li>
          </ul>
          <p>
            This case study uses almost everything from this course:{" "}
            <strong>
              WebSockets, stateful services, pub/sub, message IDs and ordering, wide-column storage, sharding, delivery
              guarantees, caching, presence, push notifications and security. We explain each of these terms when it first appears below.
            </strong>{" "}
            It is one of the richest system design problems.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about an <strong>old telephone exchange together with a post office</strong>.
          </p>
          <ul>
            <li>
              <strong>The exchange</strong> keeps a <strong>live line</strong> open to every connected person. In our system, this live line is a
              WebSocket connection: a connection between the app and the server that stays open, so both sides can send data at any time. The exchange also knows <strong>which switchboard</strong> each person is plugged into.
            </li>
            <li>
              When you send a message, the exchange <strong>writes it into a logbook first</strong> (durable storage, which keeps data safe even after a crash),
              so nothing is lost.
            </li>
            <li>
              Then it <strong>rings the recipient's line</strong> if they are connected. If they are <strong>not</strong>,
              the message waits in the logbook, and the <strong>post office sends them a card</strong> saying "you have
              a new message". This card is a push notification (a message that appears on the phone even when the app is closed).
            </li>
            <li>
              When the recipient connects again, they ask: <strong>"what did I miss since message #1041?"</strong>. They then get
              everything they missed, in order.
            </li>
          </ul>
          <p>Two rules decide the whole design:</p>
          <ol>
            <li>
              <strong>Store first, then deliver.</strong> Delivery is only a <em>notification</em>. The stored copy is the{" "}
              <em>truth</em>.
            </li>
            <li>
              <strong>Every message has a position</strong> (a sequence number or ID) inside its conversation. This makes ordering and
              "catch-up" (getting the messages you missed) simple.
            </li>
          </ol>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="step-1-requirements">Step 1: Requirements</h3>
          <p>
            <strong>Functional:</strong>
          </p>
          <ol>
            <li>
              <strong>1:1 chat</strong> and <strong>group chat</strong> (say, up to 500 members).
            </li>
            <li>
              <strong>Send and receive text messages</strong> in real time. Media (images and voice notes) is also
              supported.
            </li>
            <li>
              <strong>Message history:</strong> scroll back and search recent conversations.
            </li>
            <li>
              <strong>Multi-device sync:</strong> the same account on phone, tablet and web.
            </li>
            <li>
              <strong>Online presence</strong> ("online", "last seen") and <strong>typing indicators</strong> (the "typing…" sign).
            </li>
            <li>
              <strong>Delivery and read receipts.</strong>
            </li>
            <li>
              <strong>Push notifications</strong> when the user is offline or the app is in the background.
            </li>
          </ol>
          <p>
            <strong>Out of scope</strong> (not covered here): voice and video calls, stories, payments, and channels with millions of followers
            (these need a different "broadcast" design).
          </p>
          <p>
            <strong>Non-functional:</strong>
          </p>
          <ul>
            <li>
              <strong>Low latency:</strong> a message reaches an online recipient in{" "}
              <strong>less than 500 ms</strong> (p99, which means 99 out of 100 messages), and ideally in about 100 ms inside one region.
            </li>
            <li>
              <strong>Durability:</strong> <strong>no message is lost</strong> once the sender sees "sent" (✓).
            </li>
            <li>
              <strong>Ordering:</strong> messages in a conversation appear in the <strong>same order</strong> for
              everyone.
            </li>
            <li>
              <strong>High availability:</strong> the service is almost always up, because chat is the main feature of the app.
            </li>
            <li>
              <strong>Scale:</strong> tens of millions of daily users, and millions of connections at the same time (concurrent connections).
            </li>
            <li>
              <strong>Security and privacy:</strong> encryption in transit (while data travels), and ideally{" "}
              <strong>end-to-end encryption</strong>, where only the sender and the receiver can read the message (post 51).
            </li>
          </ul>
          <h3 id="step-2-estimation">Step 2: Estimation</h3>
          <p>Assumptions:</p>
          <ul>
            <li>
              <strong>50M daily active users</strong> (DAU, people who use the app each day), each sending <strong>40 messages per day</strong>.
            </li>
            <li>
              <strong>Peak concurrent connections:</strong> at the busiest time, about 20% of DAU are connected, so <strong>10M</strong> are online at once.
            </li>
            <li>
              <strong>Average message size:</strong> ~200 bytes of text + metadata. Media is stored separately in object
              storage.
            </li>
            <li>
              Average <strong>group size</strong> for delivery: about 5 recipients per message (most chats are 1:1 or small
              groups).
            </li>
          </ul>
          <Stats
            caption="Chat at scale, estimated."
            stats={[
              { value: <>~70 K / s</>, label: <>messages at peak</>, sub: <>2 B a day, with a peak about 3 times the average</> },
              { value: <>~350 K / s</>, label: <>deliveries at peak</>, sub: <>~5 recipients per message</> },
              {
                value: <>~146 TB / year</>,
                label: <>message storage</>,
                sub: <>before replication, excluding media</>,
              },
              {
                value: <>~150</>,
                label: <>gateway servers</>,
                sub: <>10 M connections ÷ about 100 K each, plus spare room</>,
              },
            ]}
          />
          <p>
            <strong>So this means:</strong>
          </p>
          <ul>
            <li>
              <strong>Storage with many writes</strong> and reads in time order for each conversation. This is a great fit for{" "}
              <strong>wide-column / LSM-based</strong> databases, split by conversation (posts 20 and 22). A wide-column database stores rows in partitions, and each partition holds rows sorted by a key. LSM (log-structured merge tree) is a storage design that is very fast at writing, because it only appends data.
            </li>
            <li>
              <strong>Many connections that stay open</strong>, so we need a{" "}
              <strong>separate layer of WebSocket gateway servers that scales by adding more machines</strong> (post 33). A gateway here is a server that only holds the connections.
            </li>
            <li>
              <strong>High fan-out</strong> for groups. Fan-out means one message must go to many receivers. So we need an efficient <strong>routing / pub-sub layer</strong>{" "}
              between servers. Pub/sub (publish and subscribe) means a sender publishes a message to a topic, and every subscriber of that topic receives it.
            </li>
          </ul>
          <h3 id="step-3-api-protocol-and-data-model">Step 3: API, protocol and data model</h3>
          <p>
            <strong>Connection:</strong> each client keeps a <strong>WebSocket</strong> open to a gateway (post 33), and sends and
            receives small JSON or binary frames (frames are single messages on the connection):
          </p>
          <CodeBlock lang="json" code={code1} />
          <p>
            <strong>REST APIs</strong> (normal web requests) handle actions that are not real-time: create a group, add members, upload media (using
            pre-signed URLs, which are temporary links that allow one upload, post 17), and load older history pages (cursor pagination, which means "give me the next page after this marker", post 34).
          </p>
          <p>
            <strong>Data model:</strong>
          </p>
          <CodeBlock code={code2} />
          <ul>
            <li>
              <strong>Messages are partitioned by conversation</strong>, so "get the latest 50 messages in conv_881" is
              one fast read of one partition, newest first.
            </li>
            <li>
              Very active conversations can grow huge. So add a <strong>time bucket</strong> to the partition key (for
              example, one partition per conversation per 10 days) to keep each partition from growing without limit (post 25).
            </li>
          </ul>
          <h3 id="step-4-high-level-design">Step 4: High-level design</h3>
          <Flow
            caption="The chat architecture, following one message."
            nodes={[
              { title: <>Clients</>, desc: <>WebSocket for real time; HTTPS for history, groups and media links</> },
              { title: <>WebSocket gateways</>, desc: <>stateful (they remember connections), many of them; they only hold connections</> },
              {
                title: <>Chat service</>,
                desc: <>stateless; gives the message its sequence number, saves it, then sends it to all receivers</>,
              },
              { title: <>Message store</>, desc: <>Cassandra / ScyllaDB, partitioned by conversation</> },
              {
                title: <>Routing pub/sub + presence registry</>,
                desc: <>user → gateway and devices; heartbeats (small "I am alive" signals) with TTLs (time to live: entries expire)</>,
              },
              { title: <>Recipient's gateway → device</>, desc: <>live delivery</>, tone: "good" },
              { title: <>Offline?</>, desc: <>notification service → APNs / FCM push</>, tone: "warn" },
              { title: <>Media</>, desc: <>pre-signed upload to object storage, served via CDN</> },
            ]}
          />
          <SequenceDiagram
            caption="One message, from ✓ sent to ✓✓ read."
            actors={["Asha", "Gateway A", "Chat service", "Store", "Gateway B", "Ravi"]}
            messages={[
              { from: 0, to: 1, label: <>send &#123;clientMsgId c-7f3a, "Lunch at 1?"&#125;</> },
              { from: 1, to: 2, label: <>forward</> },
              { from: 2, to: 3, label: <>persist · seq 1042 in conv_881</> },
              { from: 2, to: 0, label: <>ack ✓ sent · messageId, seq 1042</>, note: <>stored durably</>, reply: true },
              { from: 2, to: 4, label: <>route (Ravi is on gateway B)</> },
              { from: 4, to: 5, label: <>message seq 1042</> },
              { from: 5, to: 2, label: <>delivered up to 1042</>, reply: true },
              { from: 2, to: 0, label: <>✓✓ delivered</>, reply: true },
              { from: 5, to: 2, label: <>read up to 1042</>, reply: true },
              { from: 2, to: 0, label: <>✓✓ read (blue)</>, reply: true },
            ]}
          />
          <p>
            <strong>Sending a message, step by step:</strong>
          </p>
          <ol>
            <li>
              Asha's app sends <code>send</code> over its WebSocket to <strong>gateway 3</strong>, with a{" "}
              <strong>client message ID</strong> (used to remove duplicates, called dedup).
            </li>
            <li>
              The gateway forwards it to the <strong>chat service</strong>, which checks that Asha is a member of{" "}
              <code>conv_881</code> (this is authorisation: checking what a user is allowed to do, post 49).
            </li>
            <li>
              The chat service gives the message the next <strong>sequence number</strong> in the conversation and a{" "}
              <strong>message ID</strong>, and <strong>writes the message to the message store</strong>.
            </li>
            <li>
              Once the message is <strong>safely stored</strong>, the server sends an <strong>ack</strong> (acknowledgement, a "got it" reply) to Asha (✓ sent).
            </li>
            <li>
              The chat service looks up the recipients' <strong>sessions</strong> in the registry ("Ravi is on gateway 7, on
              2 devices") and <strong>publishes</strong> the message to those gateways through pub/sub.
            </li>
            <li>
              Gateway 7 sends it to Ravi's connected devices. Ravi's app replies <strong>delivered</strong> (✓✓), and
              later <strong>read</strong> (blue ✓✓).
            </li>
            <li>
              If Ravi has <strong>no active connection</strong>, the notification service sends a{" "}
              <strong>push notification</strong> (post 62).
            </li>
          </ol>
          <h3 id="step-5-deep-dives">Step 5: Deep dives</h3>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 1: The connection (gateway) layer</h4>
          <ul>
            <li>
              <strong>Gateways are stateful</strong> (stateful means a server remembers data between requests, here the open connections) but <strong>thin</strong>: they only do authentication (checking who the user is),
              heartbeats and forwarding. The business logic lives in stateless chat services, which keep no connection data. Stateless means a server remembers nothing between requests, so any server can handle any request (post 7).
            </li>
            <li>
              <strong>Scale horizontally</strong> (add more machines). Estimate how many connections one server can hold (post 33), and spread{" "}
              <strong>connections</strong> with least-connections routing, which sends each new connection to the server that has the fewest.
            </li>
            <li>
              <strong>Session registry:</strong> when a device connects, save{" "}
              <code>user → &#123;gateway_id, device_id&#125;</code> in Redis (a fast in-memory database) with a <strong>TTL</strong>. Each{" "}
              <strong>heartbeat</strong> (every 30 s or so) renews it. If a gateway dies, its entries expire.
            </li>
            <li>
              <strong>Reconnect storms:</strong> when a gateway restarts, its thousands of clients reconnect all at once. Use{" "}
              <strong>exponential backoff with jitter</strong> on the client (wait longer after each failed try, plus a random extra delay, post 41). Also <strong>drain</strong>{" "}
              gateways slowly during deploys, which means moving their clients away a few at a time.
            </li>
            <li>
              <strong>How mobile phones really behave:</strong> networks switch between Wi-Fi and mobile data, and the system pauses apps in
              the background. Clients must <strong>reconnect and sync</strong> without problems.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">
            Deep dive 2: Message IDs, sequence numbers and ordering
          </h4>
          <p>
            <strong>The problem:</strong> messages from different senders, through different servers, can arrive in
            different orders. The clocks on phones can also be wrong (post 28).
          </p>
          <p>
            <strong>The solution: the server assigns an order per conversation.</strong>
          </p>
          <ul>
            <li>
              <strong>A per-conversation sequence number</strong> (1, 2, 3…) is given by the chat service when
              it stores the message. It gives a <strong>clear order</strong> and makes <strong>gaps easy to find</strong> ("I have
              1038, the server says the latest is 1042, so I am missing 1039–1041").
              <ul>
                <li>
                  The sequence needs one single writer for each conversation, or an atomic counter (one that cannot be interrupted), like a Redis{" "}
                  <code>INCR</code> on <code>seq:conv_881</code>, or conditional writes in the database.
                </li>
              </ul>
            </li>
            <li>
              <strong>Globally unique, time-ordered IDs</strong> (a Snowflake ID is a 64-bit number built from a timestamp, a machine number and a counter, so IDs sort by time; post 60) give each message a unique ID that is
              roughly sorted by time, and the servers do not need to talk to each other to make them. Many systems use both: a Snowflake-style{" "}
              <code>message_id</code>, plus a per-conversation <code>seq</code> for ordering and sync.
            </li>
            <li>
              <strong>Never trust client timestamps for ordering.</strong> You can show them as "sent at", but order
              the messages by the server's sequence.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">
            Deep dive 3: Delivery guarantees, with no loss and no duplicates
          </h4>
          <ul>
            <li>
              <strong>Store first, then acknowledge.</strong> The sender's ✓ means "safely stored", so a server crash
              after that cannot lose the message.
            </li>
            <li>
              <strong>Client retries.</strong> If the sender does not get an ack (the network dropped), it{" "}
              <strong>sends the message again</strong> with the{" "}
              <strong>
                same <code>clientMsgId</code>
              </strong>
              . The server <strong>removes duplicates</strong> by checking <code>(sender, clientMsgId)</code> and returns the first ack again
              (post 34). So there are no duplicate messages.
            </li>
            <li>
              <strong>Delivery to recipients is at-least-once.</strong> This means a message always arrives, but it may arrive twice. The pub/sub push may fail or be repeated, so
              recipients <strong>remove duplicates by message ID</strong>.
            </li>
            <li>
              <strong>Catch-up sync is the safety net.</strong> Each time the client connects or reconnects, it sends its{" "}
              <strong>
                last seen <code>seq</code> per conversation
              </strong>
              . The server returns everything newer from the message store. Even if a real-time push was lost,{" "}
              <strong>sync fills the gap</strong>.
            </li>
          </ul>
          <Compare
            caption="Two delivery paths. The fast one may miss a message; the reliable one never does."
            columns={[
              {
                title: <>Real-time push — fast path</>,
                items: [
                  { sign: "+", text: <>Milliseconds, over the open WebSocket</> },
                  { sign: "-", text: <>May miss a message: a dropped connection or a gateway restart</> },
                ],
              },
              {
                title: <>Sync on connect — reliable path</>,
                items: [
                  { sign: "+", text: <>“Give me everything after seq 1038” for each conversation</> },
                  { sign: "+", text: <>Reads from safe storage, so it never misses</> },
                ],
                verdict: <>Together they work, because the message was stored before it was ever pushed</>,
              },
            ]}
          />
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 4: Storage</h4>
          <p>
            <strong>Why wide-column (Cassandra/ScyllaDB) or similar:</strong> Cassandra is an open-source wide-column database that spreads data over many machines and is very fast at writes. ScyllaDB is a database that works like Cassandra but is written in C++ to be faster. A partition key is the column value that decides which machine and partition holds a row.
          </p>
          <ul>
            <li>
              <strong>Very many writes</strong> (tens of thousands per second), and LSM storage handles them
              well (post 22).
            </li>
            <li>
              The <strong>access pattern</strong> (how the data is read) is always "messages in conversation X, newest first, a page at a time". This is one partition, read in clustering order, which is the sort order inside the partition (post 20).
            </li>
            <li>
              <strong>Horizontal scaling</strong> and copying data to several data centres (replication) are built in (post 24).
            </li>
          </ul>
          <CodeBlock lang="sql" code={code3} />
          <p>
            <strong>Other storage pieces:</strong>
          </p>
          <ul>
            <li>
              <strong>Conversation lists and unread counts</strong> (the chat list screen): a per-user{" "}
              <strong>inbox</strong> table, or a cache in Redis. It is updated when messages arrive.
            </li>
            <li>
              <strong>Media:</strong> kept in <strong>object storage</strong> (a service for big files), uploaded directly with pre-signed URLs, and
              served through a <strong>CDN</strong> (servers near the user that keep copies of files). Messages only store a reference to the file (post 17).
            </li>
            <li>
              <strong>Search:</strong> you can search recent history with a <strong>search index</strong>. It is filled
              asynchronously, which means a little later (post 19). This is not possible on the server if messages are end-to-end encrypted (see below).
            </li>
            <li>
              <strong>Retention:</strong> rules that delete or archive old messages, and features like "disappearing
              messages".
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 5: Group chats and fan-out</h4>
          <p>
            For a group of N members, one message becomes <strong>N deliveries</strong>:
          </p>
          <ul>
            <li>
              <strong>Small and medium groups</strong> (up to hundreds): the chat service looks up the members (from a cache), finds
              their sessions, and publishes to their gateways. It is the same as 1:1 chat, repeated for each member.
            </li>
            <li>
              <strong>Store once, deliver many.</strong> The message is stored <strong>once</strong> in the
              conversation's partition, not copied for each member. Each member keeps their own <code>last_read_seq</code> (the last message they read), so{" "}
              <strong>unread count = latest seq − last_read_seq</strong>.
            </li>
            <li>
              <strong>Large groups and channels</strong> (thousands of members or more) change the design. Pushing every message to
              every member in real time is expensive. So systems often push only to{" "}
              <strong>people who are looking at the channel now</strong>, and let the others <strong>pull</strong> (fetch the messages themselves) when they open the
              channel. This is similar to the news-feed trade-offs in post 64.
            </li>
            <li>
              <strong>Limit the group size</strong> for groups with all features (many apps do), and offer "broadcast channels"
              for huge audiences.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 6: Presence and typing indicators</h4>
          <p>
            <strong>Presence ("online / last seen"):</strong>
          </p>
          <ul>
            <li>
              Based on <strong>heartbeats</strong>: while a device's WebSocket is alive and sending heartbeats, the user is
              online. When the heartbeats stop (after, say, 60 seconds), the user becomes offline, and{" "}
              <code>last_seen</code> is updated.
            </li>
            <li>
              <strong>The fan-out problem:</strong> a user with 500 contacts who goes online or offline would cause 500
              updates <strong>each time</strong>, and phones reconnect all the time. Ways to reduce this:
              <ul>
                <li>
                  <strong>Lazy presence:</strong> only fetch or subscribe to presence for contacts{" "}
                  <strong>that are visible on screen right now</strong> (the chat list, or an open chat).
                </li>
                <li>
                  <strong>Debounce:</strong> wait a little before reacting, and do not announce very short disconnects (like switching from Wi-Fi to mobile
                  data).
                </li>
                <li>
                  <strong>Coarse "last seen"</strong> ("last seen today at 10:30") instead of second-by-second updates.
                </li>
              </ul>
            </li>
            <li>
              Presence is <strong>soft state</strong>: it is data that may be a little old and that is fine to lose. It becomes correct after a short time (eventually consistent). It is stored in memory (Redis) with TTLs, and
              never in the main message database.
            </li>
          </ul>
          <p>
            <strong>Typing indicators</strong> are <strong>ephemeral</strong> (they last only a moment). They are sent over the WebSocket,{" "}
            <strong>never stored</strong>, rate-limited (for example, at most one event every few seconds), and dropped
            if delivery fails. Here <strong>at-most-once</strong> delivery (it may be lost, but it is never repeated) is fine (post 37).
          </p>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 7: Multi-device sync and receipts</h4>
          <ul>
            <li>
              Each <strong>device</strong> has its own connection and its own sync cursor. A cursor is a marker of how far the device has read: <code>last_seq</code> for each
              conversation.
            </li>
            <li>
              Messages that the user sends from their phone are also delivered to their <strong>other devices</strong>{" "}
              (they are receivers too).
            </li>
            <li>
              <strong>Read state belongs to the user</strong> (not to a device): reading on the laptop clears the unread badge on
              the phone. Sync <code>last_read_seq</code> to all devices.
            </li>
            <li>
              <strong>Receipts</strong> are just small events that update <code>last_delivered_seq</code> and{" "}
              <code>last_read_seq</code> for each member. In groups, show a total like "read by 12", instead of storing a
              receipt for every member and every message.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 8: Security and end-to-end encryption</h4>
          <ul>
            <li>
              <strong>TLS</strong> (Transport Layer Security, a protocol that encrypts data between two machines; it is the encryption used by HTTPS) for all connections, and authenticated WebSockets (a token is checked when the connection starts, and it is renewed from time to time).
            </li>
            <li>
              <strong>Check permission on every action:</strong> may this user post in this conversation, or add members?
            </li>
            <li>
              <strong>Abuse controls:</strong> limits on how fast a user can send (post 43), spam detection, and tools to block and report users.
            </li>
            <li>
              <strong>End-to-end encryption (E2EE)</strong> (post 51): messages are encrypted on the sender's device,
              and only the recipients' devices can decrypt them. The server stores and routes <strong>encrypted blobs</strong> (unreadable chunks of data) that it
              cannot read.
              <ul>
                <li>
                  It is widely done with the <strong>Signal Protocol</strong>, an open set of rules that lets two devices share secret keys and encrypt messages so that nobody in the middle can read them. Groups often use "sender keys", so a
                  message is encrypted once for the whole group.
                </li>
                <li>
                  Trade-offs: <strong>no server-side search or content moderation</strong> (checking messages for bad content) of message content, more
                  complex <strong>multi-device</strong> support (each device has its own keys), and{" "}
                  <strong>backups</strong> must also be encrypted.
                </li>
              </ul>
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 9: Reliability and operations</h4>
          <ul>
            <li>
              <strong>Multi-AZ</strong> (several separate data centres) for gateways, chat services, pub/sub, and a message store that keeps copies of the data (post 40).
            </li>
            <li>
              <strong>Graceful degradation:</strong> if one part fails, the important parts keep working. If presence or typing indicators fail, messaging still works. If
              search is down, chats still load (post 44).
            </li>
            <li>
              <strong>Backpressure:</strong> this means handling the case where a receiver is slower than the sender. If a recipient's gateway is slow, do not block senders. Queue messages for a short time, drop
              short-lived events, and rely on sync.
            </li>
            <li>
              <strong>Observability</strong> (being able to see what the system is doing): the full <strong>message latency</strong> (from send to delivered), ack
              latency, connection counts for each gateway, reconnect rates, sync lag and push success (posts 46–47).
            </li>
            <li>
              <strong>SLOs</strong> (service level objectives, reliability targets), for example "99% of messages delivered to online recipients within 500 ms".
            </li>
          </ul>
          <h3 id="wrap-up">Wrap-up</h3>
          <ul>
            <li>
              <strong>Key decisions:</strong>
              <ul>
                <li>
                  <strong>WebSocket gateways</strong> + stateless <strong>chat services</strong> +{" "}
                  <strong>pub/sub routing</strong> + a <strong>session registry</strong>.
                </li>
                <li>
                  <strong>Store first, then deliver</strong>, with <strong>per-conversation sequence numbers</strong>{" "}
                  and <strong>Snowflake-style IDs</strong>.
                </li>
                <li>
                  <strong>Client-side dedup IDs</strong> plus <strong>sync-on-reconnect</strong>, for no loss and no
                  duplicates.
                </li>
                <li>
                  A <strong>wide-column message store</strong> partitioned by conversation (plus time buckets).
                </li>
                <li>
                  <strong>Lazy, heartbeat-based presence</strong>, and <strong>push notifications</strong> for offline
                  users.
                </li>
              </ul>
            </li>
            <li>
              <strong>Trade-offs:</strong> E2EE gives privacy but removes server features (search, moderation). Real-time fan-out is faster, but pull is cheaper for large groups. We keep strict ordering inside one conversation, and we do not need one global order.
            </li>
            <li>
              <strong>Next steps:</strong> voice and video calls (WebRTC, a browser technology for live audio and video), large broadcast channels, message search that works with
              E2EE, and multi-region active-active (several regions all serving users at once).
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Decision</th>
                  <th>Option A</th>
                  <th>Option B</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Transport</td>
                  <td>Long polling (the client keeps asking the server for news; simpler, but more overhead)</td>
                  <td>WebSockets (real-time, stateful gateways)</td>
                </tr>
                <tr>
                  <td>Ordering</td>
                  <td>Client timestamps (simple, but wrong)</td>
                  <td>Server-assigned per-conversation sequence (correct)</td>
                </tr>
                <tr>
                  <td>Delivery</td>
                  <td>Push only (fast, can miss)</td>
                  <td>Push + sync on reconnect (reliable)</td>
                </tr>
                <tr>
                  <td>Storage</td>
                  <td>Relational (flexible queries)</td>
                  <td>Wide-column partitioned by conversation (write-scale)</td>
                </tr>
                <tr>
                  <td>Group delivery</td>
                  <td>Fan-out to all members (instant)</td>
                  <td>Pull for large groups (cheaper, slightly delayed)</td>
                </tr>
                <tr>
                  <td>Privacy</td>
                  <td>Server can read (search, moderation)</td>
                  <td>End-to-end encrypted (private, fewer server features)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>WhatsApp and Erlang.</strong> WhatsApp became famous for serving a huge number of users with a{" "}
            <strong>very small engineering team</strong>. It used <strong>Erlang</strong> (a programming language made for many small tasks at once) on FreeBSD servers. In 2012 it
            wrote about handling around <strong>2 million connections at the same time on a single server</strong>. Erlang's lightweight processes (tiny tasks that use very little memory, post 4) are a natural fit for holding millions of connections that stay open for a long time.
          </p>
          <p>
            <strong>Discord's message storage.</strong> Discord stores messages split by{" "}
            <strong>channel and time bucket</strong>, ordered by <strong>Snowflake IDs</strong>. First it used Cassandra, and
            later it moved to ScyllaDB when the volume grew to <strong>trillions</strong> of messages (posts 20 and 29). It is almost
            exactly the storage design described above.
          </p>
          <p>
            <strong>Facebook Messenger's storage migration.</strong> Messenger moved its message storage from HBase to a
            MySQL-based system (using the MyRocks storage engine, post 22) to improve speed and reliability.
            It moved the message histories of billions of users. To do this safely, it ran both systems at the same time and checked the results.
          </p>
          <p>
            <strong>Slack's real-time messaging.</strong> Slack has described how its real-time messaging works.
            Gateway servers hold the WebSocket connections, and channel servers route the messages. The system is built for
            millions of users at the same time across many workspaces.
          </p>
          <p>
            <strong>Signal and WhatsApp E2EE.</strong> WhatsApp uses the <strong>Signal Protocol</strong> to end-to-end
            encrypt messages for billions of users. It has also described how it supports several devices: each
            device gets its own identity keys.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>Why WebSockets for chat, and how do you scale them?</>,
                a: (
                  <>
                    <p>
                      Chat needs fast pushes in both directions (messages, typing, receipts), and a two-way connection that
                      stays open gives this cheaply. To scale, use many gateway servers that only hold connections and
                      have no business logic. Add a presence registry that maps users to gateways, and a pub/sub layer that
                      routes messages between gateways.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you guarantee message order?</>,
                a: (
                  <>
                    <p>
                      Order the messages inside each conversation by giving each one a sequence number that always goes up, when the
                      message is stored. This can be a counter for each conversation, or one single owner for each conversation. Clients
                      show messages in seq order and use gaps to find missing messages. A global order across all conversations is not
                      needed.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you make sure no message is lost?</>,
                a: (
                  <>
                    <p>
                      Store the message before you acknowledge it to the sender or push it to recipients. Remove duplicates by client message
                      ID, so retries are safe. On every reconnect, sync each conversation from the last seq the client
                      has. The push is only a notification. Storage is the truth.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you handle a recipient who is offline?</>,
                a: (
                  <>
                    <p>
                      The presence registry shows no live connection, so the chat service sends a mobile push
                      notification through APNs (Apple) or FCM (Google). When the app opens, it connects and syncs the missed messages from
                      storage by sequence number.
                    </p>
                  </>
                ),
              },
              {
                q: <>Which database would you use for messages, and why?</>,
                a: (
                  <>
                    <p>
                      A wide-column store like Cassandra or ScyllaDB. There are very many writes, the data is mostly appended, and the
                      access pattern is simple: the latest messages in one conversation. This maps to the partition key
                      conversation_id (plus a time bucket), with clustering on seq.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do group chats change the design?</>,
                a: (
                  <>
                    <p>
                      Fan-out grows with the group size. So large groups use fan-out on read (members fetch from the
                      conversation) and not a written copy for each member. Receipts are added up into totals, and member lists are
                      cached. Very large groups work more like channels.
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
              A chat system is{" "}
              <strong>
                WebSocket gateways + stateless chat services + pub/sub routing + a session/presence registry + a durable
                message store + push notifications
              </strong>
              .
            </li>
            <li>
              <strong>Store first, then deliver.</strong> The sender's ✓ means the message is safely stored. Recipients get{" "}
              <strong>real-time pushes</strong>, backed by <strong>sync on reconnect</strong> from storage.
            </li>
            <li>
              Use <strong>server-assigned per-conversation sequence numbers</strong> (plus Snowflake-style IDs) for{" "}
              <strong>ordering and gap detection</strong>, and <strong>client message IDs</strong> for{" "}
              <strong>dedup</strong> on retries.
            </li>
            <li>
              Store messages in a <strong>store that is fast at writing, split by conversation and time bucket</strong>.
              Keep media in <strong>object storage + CDN</strong>.
            </li>
            <li>
              <strong>Presence is soft state</strong> (data that may be a little old: heartbeats, TTLs, lazy subscription),{" "}
              <strong>typing is ephemeral</strong>, <strong>large groups need pull</strong>, and <strong>E2EE</strong>{" "}
              trades server features for privacy.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              <em>System Design Interview</em> by Alex Xu (chapter 12, "Design A Chat System")
            </li>
            <li>
              Discord's blog posts on storing billions and trillions of messages, and "How Discord Scaled Elixir to
              5,000,000 Concurrent Users"
            </li>
            <li>Slack's engineering blog post "Real-time Messaging"</li>
            <li>WhatsApp's engineering blog posts on scaling Erlang ("1 million is so 2011")</li>
            <li>LinkedIn Engineering's post on its real-time presence platform</li>
            <li>The Signal Protocol technical documentation and WhatsApp's encryption white paper</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
