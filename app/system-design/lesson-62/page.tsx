import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Flow, QA, Stats } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-62")!;

export const metadata: Metadata = {
  title: `Lesson 62 — ${lesson.title}`,
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

const code1 = `POST /v1/notifications
Idempotency-Key: order-5521-shipped            ← a retry will not send the message twice
{
  "userId": "42",
  "type": "order_shipped",                     ← points to the template, category and priority
  "channels": ["push", "email"],
  "data": { "orderId": "5521", "eta": "Thu" },
  "priority": "high",
  "sendAt": null
}

202 Accepted  { "notificationId": "ntf_8f2a" }   ← accepted, and will be delivered later (asynchronously)`;

const code2 = `users_contact:      user_id, email, phone, locale, timezone
device_tokens:      user_id, platform (ios/android/web), token, app_version, last_seen
preferences:        user_id, category (marketing/transactional/social…), channel, enabled,
                    quiet_hours
templates:          type, channel, locale, subject/body with placeholders, version
notifications_log:  notification_id, user_id, type, channel, status, provider_msg_id,
                    timestamps (created, sent, delivered, opened), error`;

export default function SdLessonSixTwoPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>Almost every app sends notifications:</p>
          <ul>
            <li>"Your OTP is 482913" (SMS),</li>
            <li>"Your order has been shipped" (push + email),</li>
            <li>"Ravi commented on your photo" (push, in-app),</li>
            <li>"Your monthly statement is ready" (email),</li>
            <li>"Flash sale starts in 1 hour!" (push to 20 million users).</li>
          </ul>
          <p>
            At first, each team calls the SMS provider or the email API <strong>directly from its own code</strong>. (A provider is a company that sends the messages for you, like an SMS or email service.) Soon you see problems:
          </p>
          <ul>
            <li>
              users get the <strong>same notification twice</strong>,
            </li>
            <li>
              OTPs (one-time passwords, like a login code) arrive <strong>after they have expired</strong>,
            </li>
            <li>
              a big marketing send <strong>blocks</strong> transactional messages (messages caused by a user action, like an order update),
            </li>
            <li>
              a user who turned off promotional emails <strong>still gets them</strong>, and complains or reports you
              as spam,
            </li>
            <li>
              an SMS provider outage means <strong>nobody can log in</strong>,
            </li>
            <li>and nobody can answer "did this user actually receive the message?".</li>
          </ul>
          <p>
            A <strong>central notification system</strong> solves these problems once, for every team. It is one shared service that all other services use to send messages to users.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about a <strong>big post office sorting centre</strong>.
          </p>
          <ul>
            <li>Anyone in the city can drop off mail (in our system, other services send notification requests).</li>
            <li>
              The sorting centre checks each item:{" "}
              <strong>Is the address valid? Has this person asked not to get junk mail? Is it urgent?</strong>
            </li>
            <li>
              <strong>Express mail</strong> (OTPs) goes in a fast lane, and <strong>bulk flyers</strong> (marketing) go
              in a slow lane. This way flyers never delay urgent letters.
            </li>
            <li>
              Mail goes out through <strong>different carriers</strong> (post, courier, email, SMS). If one carrier
              is on strike, the centre <strong>switches to another</strong>.
            </li>
            <li>
              It keeps <strong>tracking records</strong>: sent, delivered, opened, bounced (returned because it could not be delivered).
            </li>
          </ul>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="step-1-requirements">Step 1: Requirements</h3>
          <p>
            <strong>Functional:</strong>
          </p>
          <ol>
            <li>
              Send notifications through <strong>several channels</strong>: <strong>mobile push</strong> (a message shown on the phone screen, for iOS and Android),{" "}
              <strong>SMS</strong>, <strong>email</strong> and <strong>in-app</strong> (a notification inbox inside the app, or
              live messages through a WebSocket, which is a connection that stays open).
            </li>
            <li>
              Support <strong>transactional</strong> (OTP, order updates, security alerts) and{" "}
              <strong>marketing / bulk</strong> notifications (campaigns).
            </li>
            <li>
              <strong>User preferences:</strong> the user can opt in or out (say yes or no) for each channel and category, and set quiet hours (times with no messages) and a language.
            </li>
            <li>
              <strong>Templates</strong> (message text with blanks that are filled in for each user) with personalisation (
              <code>Hi &#123;&#123;name&#125;&#125;, your order &#123;&#123;orderId&#125;&#125; has shipped</code>) and
              localisation.
            </li>
            <li>
              <strong>Scheduling:</strong> send at a set time, or at a set time in the user's own time zone.
            </li>
            <li>
              <strong>Tracking:</strong> know if a message was sent, delivered, opened, clicked, failed or bounced.
            </li>
          </ol>
          <p>
            <strong>Out of scope:</strong> building our own SMS or email delivery systems (we use providers), and
            the screen for designing campaigns.
          </p>
          <p>
            <strong>Non-functional:</strong>
          </p>
          <ul>
            <li>
              <strong>Reliability:</strong> notifications must not be <strong>lost</strong>. Aim for{" "}
              <strong>at-least-once delivery with deduplication</strong>. At-least-once means every message arrives, but it may arrive twice. Deduplication removes the second copy, so users do not get duplicates (post 37).
            </li>
            <li>
              <strong>Low latency for critical messages:</strong> OTPs and security alerts must arrive within{" "}
              <strong>seconds</strong>.
            </li>
            <li>
              <strong>High throughput for bulk:</strong> millions of messages in minutes, <strong>without</strong>{" "}
              slowing down transactional traffic. (Throughput is how much work is done per second.)
            </li>
            <li>
              <strong>Scalable and extensible:</strong> it can grow, and it is easy to add a new channel (say, WhatsApp) or a new provider.
            </li>
            <li>
              <strong>Respect user choices and the law:</strong> opt-outs, consent (permission from the user) and anti-spam rules.
            </li>
          </ul>
          <h3 id="step-2-estimation">Step 2: Estimation</h3>
          <p>Assumptions:</p>
          <ul>
            <li>
              <strong>50M users</strong>, about <strong>10M push</strong>, <strong>1M SMS</strong> and{" "}
              <strong>5M email</strong> notifications on a normal day. (M means million.)
            </li>
            <li>
              Occasionally, a <strong>marketing campaign</strong> to <strong>20M users</strong> within{" "}
              <strong>10 minutes</strong>.
            </li>
          </ul>
          <Stats
            caption="The numbers that shape the design."
            stats={[
              { value: <>~185 / s</>, label: <>normal-day average</>, sub: <>16 M notifications a day</> },
              { value: <>~1,000 / s</>, label: <>normal peaks</> },
              {
                value: <>~33,000 / s</>,
                label: <>a campaign</>,
                sub: <>20 M users in 10 minutes; this is what drives the design</>,
              },
              { value: <>~3 TB / year</>, label: <>delivery logs</>, sub: <>keep detail for ~90 days</> },
            ]}
          />
          <p>
            <strong>So this means:</strong>
          </p>
          <ul>
            <li>
              Normal load is modest. <strong>Campaign bursts</strong> are about 30 times higher. So we need{" "}
              <strong>queues</strong> (waiting lines for jobs) to soak up bursts, and <strong>separate lanes</strong> so bursts do not delay OTPs.
            </li>
            <li>
              <strong>Third-party providers have rate limits.</strong> We must <strong>throttle</strong> (slow down on purpose) what we send them. A rate limiter is a part that limits how many requests a caller can make in a period of time (post 43).
            </li>
            <li>
              Status logs grow quickly. So use <strong>storage split by time</strong> (one partition per day or month), and delete old data after a retention period.
            </li>
          </ul>
          <h3 id="step-3-api-and-data-model">Step 3: API and data model</h3>
          <p>
            <strong>Send API</strong> (the request that other internal services call):
          </p>
          <CodeBlock lang="http" code={code1} />
          <p>
            Bulk sends use a <strong>campaign</strong> API. It points to an <strong>audience segment</strong> (a saved group of users) and does not need millions of single calls.
          </p>
          <p>
            <strong>Core data:</strong>
          </p>
          <CodeBlock code={code2} />
          <h3 id="step-4-high-level-design">Step 4: High-level design</h3>
          <Flow
            caption="The notification pipeline, end to end."
            nodes={[
              { title: <>Order · Auth · Social · Campaign services</>, desc: <>call one Notification API</> },
              {
                title: <>Notification API</>,
                desc: <>validate → idempotency check (is this a repeat?) → add contacts, preferences and template</>,
              },
              {
                title: <>Priority queues</>,
                desc: <>critical (OTP, security) · transactional · bulk; they never share workers</>,
              },
              {
                title: <>Channel workers</>,
                desc: <>push → APNs/FCM · SMS → provider A (fallback B) · email → SES (Amazon Simple Email Service, a service that sends email for you) · in-app → inbox + WebSocket</>,
              },
              {
                title: <>Retry queues + DLQ</>,
                desc: <>short-term failures are retried after a wait; messages that always fail are set aside (DLQ = dead-letter queue)</>,
                tone: "warn",
              },
              {
                title: <>Tracking service</>,
                desc: <>delivered / bounced / opened callbacks → notifications_log</>,
                tone: "good",
              },
            ]}
          />
          <p>
            <strong>The flow for "order shipped":</strong>
          </p>
          <ol>
            <li>
              The order service calls the Notification API with an <strong>idempotency key</strong>. This is a unique ID for the request. If the same key arrives again, the system knows it is a repeat.
            </li>
            <li>
              The API <strong>removes duplicates</strong>, loads the user's <strong>preferences</strong> (email allowed? push
              enabled?), picks the <strong>channels</strong>, fills in the <strong>templates</strong> in the user's language,
              and applies <strong>quiet hours</strong> (messages that are not urgent wait until morning).
            </li>
            <li>
              Messages go into the <strong>transactional</strong> queue for each channel.
            </li>
            <li>
              <strong>Push workers</strong> (programs that take jobs from the queue) send to <strong>APNs</strong> (Apple Push Notification service) and <strong>FCM</strong> (Firebase Cloud Messaging, from Google)
              using the user's <strong>device tokens</strong> (an address for one app on one phone). <strong>Email workers</strong> call the email provider.
            </li>
            <li>
              Providers report the <strong>delivery status</strong> (in their replies and through webhooks, which are calls that the provider sends to you), and the tracking service
              updates the log.
            </li>
            <li>
              Failures are <strong>retried with backoff</strong> (waiting longer each time), and permanent failures go to a <strong>DLQ</strong>{" "}
              (dead-letter queue, a place for messages that cannot be processed, post 38).
            </li>
          </ol>
          <h3 id="step-5-deep-dives">Step 5: Deep dives</h3>
          <SequenceDiagram
            caption="An OTP on the critical lane, with provider fallback."
            actors={["Auth service", "Notification API", "Critical queue", "SMS worker", "Provider A", "Provider B"]}
            messages={[
              { from: 0, to: 1, label: <>send OTP · Idempotency-Key login-42-8812</> },
              { from: 1, to: 2, label: <>enqueue (priority: critical)</> },
              { from: 2, to: 3, label: <>job</> },
              { from: 3, to: 4, label: <>send</> },
              { from: 4, to: 3, label: <>timeout / 5xx</>, reply: true },
              { from: 3, to: 5, label: <>send (fallback)</>, note: <>circuit breaker opened on A</> },
              { from: 5, to: 3, label: <>accepted · msg id</>, reply: true },
              {
                from: 0,
                to: 0,
                label: (
                  <>
                    A delivery receipt later updates notifications_log. OTP jobs older than about 2 minutes are dropped, not sent
                    late
                  </>
                ),
                divider: true,
              },
            ]}
          />
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">
            Deep dive 1: Priority lanes, so OTPs never wait behind marketing
          </h4>
          <ul>
            <li>
              <strong>Separate queues or topics per priority</strong> (and per channel), each with{" "}
              <strong>their own workers</strong>. This is a <strong>bulkhead</strong>: like the walls in a ship, a problem in one part does not flood the others (post 42).
            </li>
            <li>
              <strong>Critical:</strong> OTPs, password resets, security alerts, payment confirmations. Low latency,
              highest priority, and watched by <strong>message age</strong>, which is how long the oldest message has waited ("the oldest OTP must be less than 10 seconds old").
            </li>
            <li>
              <strong>Transactional:</strong> order and delivery updates.
            </li>
            <li>
              <strong>Bulk / marketing:</strong> campaigns. Throttled, and it can be delayed or <strong>shed</strong> (dropped on purpose) when the system is
              busy (post 44).
            </li>
            <li>
              <strong>Provider capacity is shared</strong>, so keep part of each provider's rate limit for critical
              traffic only.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 2: Reliability and no duplicates</h4>
          <ul>
            <li>
              <strong>At-least-once delivery</strong> through queues (post 37). A worker only sends an acknowledgement (a "done" signal to the queue){" "}
              <strong>after</strong> the provider accepts the message. If the worker crashes before that, the queue sends the job again.
            </li>
            <li>
              <strong>Remove duplicates at two levels:</strong>
              <ul>
                <li>
                  <strong>Request level:</strong> the <code>Idempotency-Key</code> from the calling service (post 34).
                </li>
                <li>
                  <strong>Send level:</strong> a <code>(notification_id, channel)</code> record, marked as sent. Workers
                  check it before sending, so a queue message that arrives again does not send twice.
                </li>
              </ul>
            </li>
            <li>
              <strong>Pass an idempotency key to providers</strong> if they support it.
            </li>
            <li>
              <strong>Transactional outbox</strong> in calling services (post 37). An outbox is a database table where a service writes the messages it still has to send. The service saves the notification request in its own database in the same transaction as the order change. So "save order as shipped" and "request
              a notification" cannot get out of sync.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">
            Deep dive 3: Third-party providers, limits and failover
          </h4>
          <ul>
            <li>
              <strong>Respect provider rate limits.</strong> Use a <strong>token bucket per provider</strong> (a token bucket is a counter that refills at a steady rate, and each request spends one token; post 43)
              so the provider does not slow you down or block you.
            </li>
            <li>
              <strong>Retry transient errors</strong> (errors that may go away: timeouts; 5xx errors, which are replies with a status code from 500 to 599 that mean the server had a problem; and 429 too many requests) with <strong>backoff + jitter</strong>. Backoff means waiting longer each time. Jitter means adding a random bit to the wait, so retries do not all happen together.{" "}
              <strong>Do not retry permanent errors</strong> (invalid number, unsubscribed, bad token).
            </li>
            <li>
              <strong>Fail over</strong> (switch) to a <strong>backup provider</strong> for SMS and email when the main provider's
              error rate jumps. A <strong>circuit breaker</strong> for each provider (post 42) makes this automatic. A circuit breaker stops calls to a service that keeps failing.
            </li>
            <li>
              <strong>Handle provider feedback:</strong>
              <ul>
                <li>
                  <strong>Email bounces and spam complaints:</strong> a hard bounce means the address does not exist. Stop emailing addresses that hard-bounce or
                  complain. If you do not, your sender reputation gets worse, and delivery gets worse for <strong>everyone</strong>.
                </li>
                <li>
                  <strong>Invalid push tokens:</strong> APNs and FCM tell you when a device token is not valid any more
                  (for example, the app was uninstalled). <strong>Delete those tokens.</strong>
                </li>
              </ul>
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 4: Push notifications specifics</h4>
          <ul>
            <li>
              Each device registers with APNs or FCM and gets a <strong>device token</strong>. The app sends the token to your
              backend, which saves it in <code>device_tokens</code>.
            </li>
            <li>
              Users have <strong>several devices</strong> (phone, tablet, web). So send to each active token, or only to the
              most recently used one, depending on the notification.
            </li>
            <li>
              Keep payloads (the data in the message) <strong>small</strong>, and do not put sensitive data in push text, because it may show on a locked
              screen. For example, write "You have a new message", not the message itself.
            </li>
            <li>
              <strong>Collapse keys / thread IDs</strong> stop floods. A collapse key is a label that tells the push service to replace an older waiting message that has the same label with the newer one. They group messages, so the user sees "5 new messages" instead of 5 separate alerts.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 5: User experience and respect</h4>
          <ul>
            <li>
              <strong>Preferences and consent:</strong> users choose categories and channels, and{" "}
              <strong>marketing requires opt-in</strong> (the user must say yes first) in many regions. Include an <strong>unsubscribe link</strong> in
              marketing emails.
            </li>
            <li>
              <strong>Per-user rate limits and digests:</strong> do not send 40 "someone liked your post" pushes in an
              hour. <strong>Group</strong> them into one digest (a summary message), for example "Ravi and 39 others liked your post".
            </li>
            <li>
              <strong>Quiet hours and time zones:</strong> send messages that are not urgent at sensible local times.
            </li>
            <li>
              <strong>Smart channel selection:</strong> if the user is <strong>active in the app right now</strong>,
              show an in-app notification instead of a push. If a push is not opened, you may send an email later.
            </li>
            <li>
              <strong>Localisation:</strong> one template per language, with a default language to use if one is missing.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 6: Big campaigns</h4>
          <p>For 20M messages:</p>
          <ol>
            <li>
              The campaign service <strong>works out the audience</strong> in batches (for example, 10,000 users per
              job), and leaves out users who have opted out.
            </li>
            <li>
              It <strong>enqueues batches</strong> into the bulk lane.
            </li>
            <li>
              Workers <strong>slow down</strong> to stay within provider limits, and <strong>spread the sends</strong> over the planned
              time window.
            </li>
            <li>
              <strong>Monitor and pause</strong> the campaign if error rates or complaints jump. A kill switch is a control that turns something off at once (post
              44).
            </li>
          </ol>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 7: Tracking and observability</h4>
          <ul>
            <li>
              <strong>Status lifecycle:</strong> <code>accepted → queued → sent → delivered → opened/clicked</code>, or{" "}
              <code>failed / bounced / suppressed (opted-out)</code>.
            </li>
            <li>
              <strong>Dashboards:</strong> delivery rate per channel and provider, latency (especially OTP{" "}
              <strong>end-to-end</strong> time), queue ages, DLQ size, bounce and complaint rates (posts 46–48).
            </li>
            <li>
              <strong>SLOs</strong> (service level objectives, which are reliability targets), for example "99% of OTPs delivered to the provider within 5 seconds" (post 47).
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 8: Security and abuse</h4>
          <ul>
            <li>
              <strong>Only trusted internal services</strong> can call the send API. Each service proves who it is (service authentication, post 49).
            </li>
            <li>
              <strong>Protect OTP endpoints</strong> from abuse: rate limits per phone number, IP and device. Watch for{" "}
              <strong>SMS pumping</strong> fraud. Here bots trigger a large number of SMS messages to premium-rate numbers, so that the
              attackers earn money from the charges (post 43).
            </li>
            <li>
              <strong>Do not log full OTPs</strong> or sensitive message content (post 51).
            </li>
            <li>
              <strong>Check provider webhooks.</strong> The provider signs each status callback, and you verify the signature to be sure it is real (post 34).
            </li>
          </ul>
          <h3 id="wrap-up">Wrap-up</h3>
          <ul>
            <li>
              <strong>Key decisions:</strong> one central, <strong>asynchronous</strong> system (it answers "202 Accepted" and sends later) with{" "}
              <strong>priority lanes per channel</strong>; <strong>preferences, templates and dedup</strong> applied
              centrally; <strong>channel workers</strong> with{" "}
              <strong>provider rate limits, retries, circuit breakers and failover</strong>; <strong>tracking</strong>{" "}
              via provider callbacks.
            </li>
            <li>
              <strong>Trade-offs:</strong> at-least-once plus dedup is reliable, but the dedup storage is complex.
              Batching and quiet hours give a better experience, but messages that are not urgent arrive later. Several
              providers make the system resilient, but cost more to connect and pay for.
            </li>
            <li>
              <strong>Next steps:</strong> choosing the best send time with machine learning, ranking channels, WhatsApp and other
              messaging channels, and a self-service campaign screen.
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
                  <td>Sending model</td>
                  <td>Synchronous from each service (simple, fragile)</td>
                  <td>Central async system with queues (reliable, scalable)</td>
                </tr>
                <tr>
                  <td>Delivery guarantee</td>
                  <td>At-most-once (no duplicates, may lose)</td>
                  <td>At-least-once + dedup (no loss, more complexity)</td>
                </tr>
                <tr>
                  <td>Lanes</td>
                  <td>One queue (simple)</td>
                  <td>Priority lanes (OTPs never wait)</td>
                </tr>
                <tr>
                  <td>Providers</td>
                  <td>One per channel (simple)</td>
                  <td>Primary + fallback (resilient, costlier)</td>
                </tr>
                <tr>
                  <td>Frequency</td>
                  <td>Send every event (timely, noisy)</td>
                  <td>Digests + per-user limits (respectful, delayed)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Netflix's RENO.</strong> Netflix described its{" "}
            <strong>Rapid Event Notification System (RENO)</strong>, which sends events to its apps on many devices (for
            example, to refresh a viewing list after activity on another device). It uses queues with priorities and a mix of
            push and pull delivery. It supports many devices per user.
          </p>
          <p>
            <strong>LinkedIn's notification systems.</strong> LinkedIn has written about <strong>Concourse</strong>, a
            system that creates personal notifications almost in real time. It has also written about a service called{" "}
            <strong>Air Traffic Controller</strong>. It decides{" "}
            <strong>whether, when and through which channel</strong> to notify a member, so that people are not flooded
            with messages.
          </p>
          <p>
            <strong>Slack's "should we send a notification?" flowchart.</strong> Slack once shared a famous, very
            complex flowchart. It shows the many checks that decide whether a notification is sent: is the user active? Is the channel muted? Is do-not-disturb on? Was the user mentioned? What are the preferences? It shows how much{" "}
            <strong>logic about preferences and context</strong> a good notification system needs.
          </p>
          <p>
            <strong>OTP delivery in banking and payments.</strong> Banks and payment apps depend on OTP SMS for logins
            and payments. They usually use <strong>several SMS providers</strong> with automatic failover, and
            watch the <strong>delivery time</strong> closely, because an OTP that arrives late stops the customer
            from paying.
          </p>
          <p>
            <strong>Email sender reputation.</strong> Email providers such as Gmail and Outlook filter mail by
            sender reputation (a score of how trustworthy the sender is). Companies that keep emailing addresses that bounce, or ignore spam complaints, see their
            messages go to the spam folder for <strong>all</strong> users. That is why suppression lists (lists of addresses you must not email) and bounce handling are
            essential.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>How do you make sure a critical OTP is not stuck behind a marketing campaign?</>,
                a: (
                  <>
                    <p>
                      Use separate priority queues, with their own workers for each class (critical, transactional, bulk).
                      Give each class its own rate limits, and set alerts on the age of the oldest critical message.
                      Campaigns go through their own throttled lane.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you avoid sending duplicate notifications?</>,
                a: (
                  <>
                    <p>
                      Callers send an idempotency key (like order-5521-shipped). The API saves it under a unique
                      constraint, a database rule that rejects the same value twice. Workers are idempotent for each notification and channel. Idempotent means that doing an action twice has the same result as doing it once. Calls to providers reuse the
                      notification ID if the provider supports it.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you handle a failing SMS or email provider?</>,
                a: (
                  <>
                    <p>
                      Retry with backoff and jitter for transient errors. Use a circuit breaker for each provider, switch
                      automatically to a second provider, keep a DLQ for permanent failures, and show delivery rates
                      for each provider on dashboards.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do user preferences and quiet hours fit in?</>,
                a: (
                  <>
                    <p>
                      Check them when the request is enriched, before it goes into a queue. Check the opt-ins for each category and channel,
                      unsubscribes (required by law for marketing), the locale (language and region) for templates, and quiet hours that follow the user's time zone and delay
                      messages that are not critical. Security notifications ignore marketing opt-outs.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you send 20 million campaign messages in ten minutes?</>,
                a: (
                  <>
                    <p>
                      Fan out in batches. A campaign job splits the audience into chunks and puts them on the bulk
                      lane. Workers scale horizontally (more machines are added) while the rate limits and quotas of each provider are respected.
                      Progress is tracked for each chunk, so after a crash the job continues instead of starting again.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you track whether notifications were delivered?</>,
                a: (
                  <>
                    <p>
                      Store a log row for each notification and channel, with its provider message ID. Then update the status from
                      provider webhooks (delivered, bounced, opened) and in-app read events. This helps support, retries,
                      analytics and removing dead device tokens.
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
              Build <strong>one central, asynchronous notification system</strong> instead of every service calling
              providers directly.
            </li>
            <li>
              Use <strong>priority lanes</strong> (critical / transactional / bulk) per channel, so{" "}
              <strong>OTPs never wait behind campaigns</strong>, and monitor <strong>message age</strong>.
            </li>
            <li>
              Guarantee <strong>at-least-once delivery with deduplication</strong> (idempotency keys + a record of what was sent),
              and use the <strong>outbox</strong> pattern in calling services.
            </li>
            <li>
              Wrap providers with <strong>rate limits, retries (transient only), circuit breakers and failover</strong>.
              Handle <strong>bounces, complaints and invalid push tokens</strong>.
            </li>
            <li>
              Respect users:{" "}
              <strong>preferences and consent, quiet hours, digests, per-user limits and localisation</strong>.{" "}
              <strong>Track</strong> every status, protect OTP endpoints from <strong>abuse</strong>, and never log
              secrets.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              <em>System Design Interview</em> by Alex Xu (chapter 10, "Design A Notification System")
            </li>
            <li>The Netflix Tech Blog post "Rapid Event Notification System at Netflix"</li>
            <li>LinkedIn Engineering posts on Concourse and on notification volume control (Air Traffic Controller)</li>
            <li>
              Apple's documentation on sending notification requests to APNs, and Firebase Cloud Messaging's
              architecture overview
            </li>
            <li>The Amazon SQS documentation on dead-letter queues, and Amazon SNS documentation on mobile push</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
