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

// Server → sender: acknowledgement (✓ sent: stored durably)
{ "type": "ack", "clientMsgId": "c-7f3a…", "messageId": "1789012345678901234", "seq": 1042 }

// Server → recipients: new message
{ "type": "message", "conversationId": "conv_881", "messageId": "1789012345678901234",
  "seq": 1042, "senderId": "42", "body": "Lunch at 1?", "createdAt": "…" }

// Client → server: receipts
{ "type": "delivered", "conversationId": "conv_881", "upToSeq": 1042 }
{ "type": "read",      "conversationId": "conv_881", "upToSeq": 1042 }

// Reconnect / sync
{ "type": "sync", "conversations": [ { "id": "conv_881", "afterSeq": 1038 } ] }`;

const code2 = `conversations:        conversation_id, type (direct/group), created_at, last_seq
conversation_members: conversation_id, user_id, role, joined_at,
                      last_delivered_seq, last_read_seq
messages:             PARTITION KEY (conversation_id [, time_bucket])
                      CLUSTERING KEY seq (or message_id) DESC
                      sender_id, body / media_ref, created_at, type, edited/deleted flags
user_inbox (optional):user_id → list of (conversation_id, last_seq, unread_count) for the chat list
devices:              user_id, device_id, push_token, platform, last_seen`;

const code3 = `-- Messages partitioned by conversation (and a time bucket for very busy groups),
-- newest first — "load the latest 50 messages" is one partition read.
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
              messages to arrive <strong>instantly</strong> (well under a second),
            </li>
            <li>
              <strong>never</strong> to lose a message, even on flaky mobile networks,
            </li>
            <li>
              messages to appear <strong>in the right order</strong>,
            </li>
            <li>
              to see <strong>who's online</strong> and "typing…",
            </li>
            <li>
              <strong>read receipts</strong> (✓✓),
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
            This case study combines almost everything from this blog:{" "}
            <strong>
              WebSockets, stateful services, pub/sub, message IDs and ordering, wide-column storage, sharding, delivery
              guarantees, caching, presence, push notifications and security.
            </strong>{" "}
            It's one of the richest system design problems.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about an <strong>old-fashioned telephone exchange combined with a post office</strong>.
          </p>
          <ul>
            <li>
              <strong>The exchange</strong> keeps a <strong>live line</strong> open to every connected person (a
              WebSocket connection) and knows <strong>which switchboard</strong> each person is plugged into.
            </li>
            <li>
              When you send a message, the exchange <strong>writes it into a logbook first</strong> (durable storage),
              so nothing is lost.
            </li>
            <li>
              Then it <strong>rings the recipient's line</strong> if they're connected. If they're <strong>not</strong>,
              the message waits in the logbook, and the <strong>post office sends them a card</strong> saying "you have
              a new message" (a push notification).
            </li>
            <li>
              When the recipient reconnects, they ask: <strong>"what did I miss since message #1041?"</strong>, and get
              everything, in order.
            </li>
          </ul>
          <p>Two rules shape the whole design:</p>
          <ol>
            <li>
              <strong>Store first, then deliver.</strong> Delivery is a <em>notification</em>; storage is the{" "}
              <em>truth</em>.
            </li>
            <li>
              <strong>Every message has a position</strong> (a sequence or ID) within its conversation, so ordering and
              "catch-up" are simple.
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
              <strong>Send and receive text messages</strong> in real time. Media (images, voice notes) is also
              supported.
            </li>
            <li>
              <strong>Message history:</strong> scroll back and search recent conversations.
            </li>
            <li>
              <strong>Multi-device sync:</strong> the same account on phone, tablet and web.
            </li>
            <li>
              <strong>Online presence</strong> ("online", "last seen") and <strong>typing indicators</strong>.
            </li>
            <li>
              <strong>Delivery and read receipts.</strong>
            </li>
            <li>
              <strong>Push notifications</strong> when the user is offline or the app is in the background.
            </li>
          </ol>
          <p>
            <strong>Out of scope:</strong> voice and video calls, stories, payments, channels with millions of followers
            (a different "broadcast" design).
          </p>
          <p>
            <strong>Non-functional:</strong>
          </p>
          <ul>
            <li>
              <strong>Low latency:</strong> a message is delivered to an online recipient in{" "}
              <strong>&lt; 500 ms</strong> (p99), ideally ~100 ms within a region.
            </li>
            <li>
              <strong>Durability:</strong> <strong>no message loss</strong> once the sender sees "sent" (✓).
            </li>
            <li>
              <strong>Ordering:</strong> messages in a conversation appear in a <strong>consistent order</strong> for
              everyone.
            </li>
            <li>
              <strong>High availability:</strong> chat is core to the app.
            </li>
            <li>
              <strong>Scale:</strong> tens of millions of daily users, millions of concurrent connections.
            </li>
            <li>
              <strong>Security and privacy:</strong> encryption in transit, and ideally{" "}
              <strong>end-to-end encryption</strong> (post 51).
            </li>
          </ul>
          <h3 id="step-2-estimation">Step 2: Estimation</h3>
          <p>Assumptions:</p>
          <ul>
            <li>
              <strong>50M daily active users</strong>, each sending <strong>40 messages per day</strong>.
            </li>
            <li>
              <strong>Peak concurrent connections:</strong> about 20% of DAU, so <strong>10M</strong> online at once.
            </li>
            <li>
              <strong>Average message size:</strong> ~200 bytes of text + metadata. Media is stored separately in object
              storage.
            </li>
            <li>
              Average <strong>group size</strong> for delivery: ~5 recipients per message (most chats are 1:1 or small
              groups).
            </li>
          </ul>
          <Stats
            caption="Chat at scale, estimated."
            stats={[
              { value: <>~70 K / s</>, label: <>messages at peak</>, sub: <>2 B a day</> },
              { value: <>~350 K / s</>, label: <>deliveries at peak</>, sub: <>~5 recipients per message</> },
              {
                value: <>~146 TB / year</>,
                label: <>message storage</>,
                sub: <>before replication, excluding media</>,
              },
              {
                value: <>~150</>,
                label: <>gateway servers</>,
                sub: <>10 M connections ÷ ~100 K each, plus headroom</>,
              },
            ]}
          />
          <p>
            <strong>So this means:</strong>
          </p>
          <ul>
            <li>
              <strong>Write-heavy storage</strong> with time-ordered access per conversation, which is a great fit for{" "}
              <strong>wide-column / LSM-based</strong> databases (posts 20 and 22), partitioned by conversation.
            </li>
            <li>
              <strong>Many persistent connections</strong>, so we need a{" "}
              <strong>dedicated, horizontally scaled WebSocket gateway tier</strong> (post 33).
            </li>
            <li>
              <strong>High fan-out</strong> for groups, so we need an efficient <strong>routing / pub-sub layer</strong>{" "}
              between servers.
            </li>
          </ul>
          <h3 id="step-3-api-protocol-and-data-model">Step 3: API, protocol and data model</h3>
          <p>
            <strong>Connection:</strong> clients keep a <strong>WebSocket</strong> to a gateway (post 33), and send and
            receive small JSON or binary frames:
          </p>
          <CodeBlock lang="json" code={code1} />
          <p>
            <strong>REST APIs</strong> handle non-real-time actions: create group, add members, upload media (via
            pre-signed URLs, post 17), load older history pages (cursor pagination, post 34).
          </p>
          <p>
            <strong>Data model:</strong>
          </p>
          <CodeBlock code={code2} />
          <ul>
            <li>
              <strong>Messages are partitioned by conversation</strong>, so "get the latest 50 messages in conv_881" is
              one fast partition read, newest first.
            </li>
            <li>
              Very active conversations can grow huge, so add a <strong>time bucket</strong> to the partition key (for
              example, one partition per conversation per 10 days) to keep partitions bounded (post 25).
            </li>
          </ul>
          <h3 id="step-4-high-level-design">Step 4: High-level design</h3>
          <Flow
            caption="The chat architecture, following one message."
            nodes={[
              { title: <>Clients</>, desc: <>WebSocket for real time, HTTPS for history, groups and media URLs</> },
              { title: <>WebSocket gateways</>, desc: <>stateful, many; hold connections only</> },
              {
                title: <>Chat service</>,
                desc: <>stateless — assigns the conversation seq, persists, then fans out</>,
              },
              { title: <>Message store</>, desc: <>Cassandra / ScyllaDB, partitioned by conversation</> },
              {
                title: <>Routing pub/sub + presence registry</>,
                desc: <>user → gateway and devices, heartbeats with TTLs</>,
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
              <strong>client message ID</strong> (for dedup).
            </li>
            <li>
              The gateway forwards it to the <strong>chat service</strong>, which checks that Asha is a member of{" "}
              <code>conv_881</code> (authorisation, post 49).
            </li>
            <li>
              The chat service assigns the next <strong>sequence number</strong> for the conversation and a{" "}
              <strong>message ID</strong>, and <strong>writes the message to the message store</strong>.
            </li>
            <li>
              Once it's <strong>durably stored</strong>, the server sends an <strong>ack</strong> to Asha (✓ sent).
            </li>
            <li>
              The chat service looks up recipients' <strong>sessions</strong> in the registry ("Ravi is on gateway 7, on
              2 devices") and <strong>publishes</strong> the message to those gateways via pub/sub.
            </li>
            <li>
              Gateway 7 pushes it to Ravi's connected devices. Ravi's app replies <strong>delivered</strong> (✓✓), and
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
              <strong>Gateways are stateful</strong> (they hold connections) but <strong>thin</strong>: authentication,
              heartbeats and forwarding. The business logic lives in stateless chat services (post 7).
            </li>
            <li>
              <strong>Scale horizontally.</strong> Estimate connections per server (post 33), and balance{" "}
              <strong>connections</strong> with least-connections routing.
            </li>
            <li>
              <strong>Session registry:</strong> when a device connects, record{" "}
              <code>user → &#123;gateway_id, device_id&#125;</code> in Redis with a <strong>TTL</strong>, refreshed by{" "}
              <strong>heartbeats</strong> (every ~30 s). If a gateway dies, its entries expire.
            </li>
            <li>
              <strong>Reconnect storms:</strong> when a gateway restarts, its thousands of clients reconnect. Use{" "}
              <strong>exponential backoff with jitter</strong> on the client (post 41), and <strong>drain</strong>{" "}
              gateways gradually during deploys.
            </li>
            <li>
              <strong>Mobile reality:</strong> networks switch between Wi-Fi and mobile data, and apps get suspended in
              the background. Clients must <strong>reconnect and sync</strong> smoothly.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">
            Deep dive 2: Message IDs, sequence numbers and ordering
          </h4>
          <p>
            <strong>The problem:</strong> messages from different senders, via different servers, can arrive in
            different orders. Clocks on phones can be wrong (post 28).
          </p>
          <p>
            <strong>The solution: the server assigns an order per conversation.</strong>
          </p>
          <ul>
            <li>
              <strong>A per-conversation sequence number</strong> (1, 2, 3…) is assigned by the chat service when
              storing. It gives a <strong>clear order</strong> and makes <strong>gaps easy to detect</strong> ("I have
              1038, the server says the latest is 1042, so I'm missing 1039–1041").
              <ul>
                <li>
                  The sequence needs a single writer per conversation, or an atomic counter (like a Redis{" "}
                  <code>INCR</code> on <code>seq:conv_881</code>, or conditional writes in the database).
                </li>
              </ul>
            </li>
            <li>
              <strong>Globally unique, time-ordered IDs</strong> (Snowflake-style, post 60) give each message a unique,
              roughly time-sorted ID without coordination. Many systems use both: a Snowflake-style{" "}
              <code>message_id</code>, plus a per-conversation <code>seq</code> for ordering and sync.
            </li>
            <li>
              <strong>Never trust client timestamps for ordering.</strong> Show them as "sent at" if you like, but order
              by the server's sequence.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">
            Deep dive 3: Delivery guarantees, with no loss and no duplicates
          </h4>
          <ul>
            <li>
              <strong>Store first, then acknowledge.</strong> The sender's ✓ means "durably stored", so a server crash
              after that can't lose the message.
            </li>
            <li>
              <strong>Client retries.</strong> If the sender doesn't get an ack (the network dropped), it{" "}
              <strong>resends</strong> with the{" "}
              <strong>
                same <code>clientMsgId</code>
              </strong>
              . The server <strong>dedups</strong> by <code>(sender, clientMsgId)</code> and returns the original ack
              (post 34). There are no duplicate messages.
            </li>
            <li>
              <strong>Delivery to recipients is at-least-once.</strong> The pub/sub push may fail or duplicate, so
              recipients <strong>dedup by message ID</strong>.
            </li>
            <li>
              <strong>Catch-up sync is the safety net.</strong> On every (re)connect, the client sends its{" "}
              <strong>
                last seen <code>seq</code> per conversation
              </strong>
              , and the server returns everything newer from the message store. Even if a real-time push was lost,{" "}
              <strong>sync fills the gap</strong>.
            </li>
          </ul>
          <Compare
            caption="Two delivery paths. The fast one may miss; the reliable one never does."
            columns={[
              {
                title: <>Real-time push — fast path</>,
                items: [
                  { sign: "+", text: <>Milliseconds, over the open WebSocket</> },
                  { sign: "-", text: <>May miss: a dropped connection, a gateway restart</> },
                ],
              },
              {
                title: <>Sync on connect — reliable path</>,
                items: [
                  { sign: "+", text: <>“Give me everything after seq 1038” for each conversation</> },
                  { sign: "+", text: <>Reads from durable storage — never misses</> },
                ],
                verdict: <>Together: the message was stored before it was ever pushed</>,
              },
            ]}
          />
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 4: Storage</h4>
          <p>
            <strong>Why wide-column (Cassandra/ScyllaDB) or similar:</strong>
          </p>
          <ul>
            <li>
              <strong>Massive write volume</strong> (tens of thousands of writes per second), and LSM storage handles it
              well (post 22).
            </li>
            <li>
              The <strong>access pattern</strong> is always "messages in conversation X, newest first, paginated", which
              is one partition, read in clustering order (post 20).
            </li>
            <li>
              <strong>Horizontal scale</strong> and multi-datacentre replication are built in (post 24).
            </li>
          </ul>
          <CodeBlock lang="sql" code={code3} />
          <p>
            <strong>Other storage pieces:</strong>
          </p>
          <ul>
            <li>
              <strong>Conversation lists and unread counts</strong> (the chat list screen): a per-user{" "}
              <strong>inbox</strong> table, or a cache in Redis, updated when messages arrive.
            </li>
            <li>
              <strong>Media:</strong> in <strong>object storage</strong>, uploaded directly with pre-signed URLs, and
              served through a <strong>CDN</strong>. Messages only store a reference (post 17).
            </li>
            <li>
              <strong>Search:</strong> recent history can be searched through a <strong>search index</strong> fed
              asynchronously (post 19), unless messages are end-to-end encrypted (see below).
            </li>
            <li>
              <strong>Retention:</strong> policies to delete or archive old messages, and features like "disappearing
              messages".
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 5: Group chats and fan-out</h4>
          <p>
            For a group of N members, one message becomes <strong>N deliveries</strong>:
          </p>
          <ul>
            <li>
              <strong>Small and medium groups</strong> (up to hundreds): the chat service looks up members (cached),
              finds their sessions, and publishes to their gateways. It's the same as 1:1, multiplied.
            </li>
            <li>
              <strong>Store once, deliver many.</strong> The message is stored <strong>once</strong> in the
              conversation's partition, not copied per member. Each member tracks <code>last_read_seq</code>, so{" "}
              <strong>unread count = latest seq − last_read_seq</strong>.
            </li>
            <li>
              <strong>Large groups and channels</strong> (thousands or more) change the design. Pushing every message to
              every member in real time is expensive, so systems often push only to{" "}
              <strong>currently active viewers</strong>, and let others <strong>pull</strong> when they open the
              channel, similar to the news-feed trade-offs in post 64.
            </li>
            <li>
              <strong>Limit group sizes</strong> for full-featured groups (many apps do), and offer "broadcast channels"
              for huge audiences.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 6: Presence and typing indicators</h4>
          <p>
            <strong>Presence ("online / last seen"):</strong>
          </p>
          <ul>
            <li>
              Based on <strong>heartbeats</strong>: while a device's WebSocket is alive and heartbeating, the user is
              online. When heartbeats stop (after, say, 60 seconds), the user becomes offline, and{" "}
              <code>last_seen</code> is updated.
            </li>
            <li>
              <strong>The fan-out problem:</strong> a user with 500 contacts going online and offline would trigger 500
              updates <strong>each time</strong>, and phones reconnect constantly. Mitigations:
              <ul>
                <li>
                  <strong>Lazy presence:</strong> only fetch or subscribe to presence for contacts{" "}
                  <strong>currently visible on screen</strong> (the chat list, or an open chat).
                </li>
                <li>
                  <strong>Debounce:</strong> don't broadcast brief disconnects (like switching from Wi-Fi to mobile
                  data).
                </li>
                <li>
                  <strong>Coarse "last seen"</strong> ("last seen today at 10:30") instead of second-by-second updates.
                </li>
              </ul>
            </li>
            <li>
              Presence is <strong>soft state</strong>: eventually consistent, stored in memory (Redis) with TTLs, and
              never in the main message database.
            </li>
          </ul>
          <p>
            <strong>Typing indicators</strong> are <strong>ephemeral</strong>: they're sent over the WebSocket,{" "}
            <strong>never stored</strong>, rate-limited (for example, at most one event every few seconds), and dropped
            if delivery fails. This is a case where <strong>at-most-once</strong> is fine (post 37).
          </p>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 7: Multi-device sync and receipts</h4>
          <ul>
            <li>
              Each <strong>device</strong> has its own connection and its own sync cursor (<code>last_seq</code> per
              conversation).
            </li>
            <li>
              Messages the user sends from their phone are also delivered to their <strong>other devices</strong>{" "}
              (they're recipients too).
            </li>
            <li>
              <strong>Read state is per user</strong> (not per device): reading on the laptop clears the unread badge on
              the phone. Sync <code>last_read_seq</code> to all devices.
            </li>
            <li>
              <strong>Receipts</strong> are just small events that update <code>last_delivered_seq</code> and{" "}
              <code>last_read_seq</code> per member. In groups, show "read by 12" aggregated, instead of storing a
              receipt for every member × message.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 8: Security and end-to-end encryption</h4>
          <ul>
            <li>
              <strong>TLS</strong> for all connections, and authenticated WebSockets (tokens validated at connection
              time, and refreshed).
            </li>
            <li>
              <strong>Authorisation on every action:</strong> can this user post in this conversation, or add members?
            </li>
            <li>
              <strong>Abuse controls:</strong> rate limits on sending (post 43), spam detection, blocking and reporting.
            </li>
            <li>
              <strong>End-to-end encryption (E2EE)</strong> (post 51): messages are encrypted on the sender's device,
              and only recipients' devices can decrypt. The server stores and routes <strong>encrypted blobs</strong> it
              can't read.
              <ul>
                <li>
                  It's widely done with the <strong>Signal Protocol</strong>. Groups often use "sender keys" so a
                  message is encrypted once for the group.
                </li>
                <li>
                  Trade-offs: <strong>no server-side search or content moderation</strong> on message content, more
                  complex <strong>multi-device</strong> support (each device has its own keys), and{" "}
                  <strong>backups</strong> must also be encrypted.
                </li>
              </ul>
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 9: Reliability and operations</h4>
          <ul>
            <li>
              <strong>Multi-AZ</strong> gateways, chat services, pub/sub and a replicated message store (post 40).
            </li>
            <li>
              <strong>Graceful degradation:</strong> if presence or typing indicators fail, messaging still works. If
              search is down, chats still load (post 44).
            </li>
            <li>
              <strong>Backpressure:</strong> if a recipient's gateway is slow, don't block senders. Queue briefly, drop
              ephemeral events, and rely on sync.
            </li>
            <li>
              <strong>Observability:</strong> end-to-end <strong>message latency</strong> (send → delivered), ack
              latency, connection counts per gateway, reconnect rates, sync lag and push success (posts 46–47).
            </li>
            <li>
              <strong>SLOs</strong>, for example "99% of messages delivered to online recipients within 500 ms".
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
              <strong>Trade-offs:</strong> E2EE (privacy) vs server features (search, moderation); real-time fan-out vs
              pull for large groups; strong ordering per conversation vs global ordering (not needed).
            </li>
            <li>
              <strong>Next steps:</strong> voice and video calls (WebRTC), large broadcast channels, message search with
              E2EE-friendly designs, and multi-region active-active.
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
                  <td>Long polling (simpler, higher overhead)</td>
                  <td>WebSockets (real-time, stateful gateways)</td>
                </tr>
                <tr>
                  <td>Ordering</td>
                  <td>Client timestamps (simple, wrong)</td>
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
            <strong>WhatsApp and Erlang.</strong> WhatsApp famously served enormous numbers of users with a{" "}
            <strong>very small engineering team</strong>, using <strong>Erlang</strong> on FreeBSD servers. In 2012 it
            wrote about handling around <strong>2 million concurrent connections on a single server</strong>. Erlang's
            lightweight processes (post 4) are a natural fit for holding millions of long-lived connections.
          </p>
          <p>
            <strong>Discord's message storage.</strong> Discord stores messages partitioned by{" "}
            <strong>channel and time bucket</strong>, ordered by <strong>Snowflake IDs</strong>, first in Cassandra and
            later in ScyllaDB as volume grew to <strong>trillions</strong> of messages (posts 20 and 29). It's almost
            exactly the storage design described above.
          </p>
          <p>
            <strong>Facebook Messenger's storage migration.</strong> Messenger moved its message storage from HBase to a
            MySQL-based system (using the MyRocks storage engine, post 22) to improve performance and reliability,
            migrating billions of users' message histories with careful dual-running and verification.
          </p>
          <p>
            <strong>Slack's real-time messaging.</strong> Slack has described its architecture for real-time messaging,
            with gateway servers holding WebSocket connections and channel servers routing messages, built to handle
            millions of simultaneous users across many workspaces.
          </p>
          <p>
            <strong>Signal and WhatsApp E2EE.</strong> WhatsApp uses the <strong>Signal Protocol</strong> to end-to-end
            encrypt messages for billions of users, and has described how it handles multi-device support by giving each
            device its own identity keys.
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
                      Chat needs low-latency pushes in both directions (messages, typing, receipts), which a persistent
                      two-way connection gives cheaply. Scale with many stateless-logic gateway servers that only hold
                      connections, a presence registry mapping users to gateways, and a pub/sub layer to route messages
                      between gateways.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you guarantee message order?</>,
                a: (
                  <>
                    <p>
                      Order within each conversation by assigning a monotonically increasing sequence number when the
                      message is persisted (per-conversation counter, or a single owner per conversation). Clients
                      display by seq and use gaps to detect missing messages. Global order across conversations isn't
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
                      Persist before acknowledging to the sender or pushing to recipients, deduplicate by client message
                      ID so retries are safe, and on every reconnect sync each conversation from the last seq the client
                      has. The push is a notification; storage is the truth.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you handle a recipient who is offline?</>,
                a: (
                  <>
                    <p>
                      The presence registry shows no live connection, so the chat service triggers a mobile push
                      notification via APNs or FCM. When the app opens, it connects and syncs missed messages from
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
                      A wide-column store like Cassandra or ScyllaDB: huge write volume, append-mostly data, and a
                      simple access pattern — latest messages in one conversation — which maps to partition key
                      conversation_id (plus a time bucket) with clustering on seq.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do group chats change the design?</>,
                a: (
                  <>
                    <p>
                      Fan-out grows with group size, so large groups use fan-out on read (members fetch from the
                      conversation) rather than writing a copy per member; receipts are aggregated; and member lists are
                      cached. Very large groups behave more like channels.
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
              <strong>Store first, then deliver.</strong> The sender's ✓ means durable. Recipients get{" "}
              <strong>real-time pushes</strong>, backed by <strong>sync on reconnect</strong> from storage.
            </li>
            <li>
              Use <strong>server-assigned per-conversation sequence numbers</strong> (plus Snowflake-style IDs) for{" "}
              <strong>ordering and gap detection</strong>, and <strong>client message IDs</strong> for{" "}
              <strong>dedup</strong> on retries.
            </li>
            <li>
              Store messages in a <strong>write-optimised store partitioned by conversation and time bucket</strong>.
              Keep media in <strong>object storage + CDN</strong>.
            </li>
            <li>
              <strong>Presence is soft state</strong> (heartbeats, TTLs, lazy subscription),{" "}
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
