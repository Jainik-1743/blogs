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
Idempotency-Key: order-5521-shipped            ← retries never double-send
{
  "userId": "42",
  "type": "order_shipped",                     ← maps to template, category, priority
  "channels": ["push", "email"],
  "data": { "orderId": "5521", "eta": "Thu" },
  "priority": "high",
  "sendAt": null
}

202 Accepted  { "notificationId": "ntf_8f2a" }   ← accepted for asynchronous delivery`;

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
            At first, each team calls the SMS provider or email API <strong>directly from its own code</strong>. Soon:
          </p>
          <ul>
            <li>
              users get the <strong>same notification twice</strong>,
            </li>
            <li>
              OTPs arrive <strong>after they've expired</strong>,
            </li>
            <li>
              a marketing blast <strong>blocks</strong> transactional messages,
            </li>
            <li>
              a user who turned off promotional emails <strong>still gets them</strong> (and complains, or reports you
              as spam),
            </li>
            <li>
              an SMS provider outage means <strong>nobody can log in</strong>,
            </li>
            <li>and nobody can answer "did this user actually receive the message?".</li>
          </ul>
          <p>
            A <strong>central notification system</strong> solves these problems once, for every team.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about a <strong>big post office sorting centre</strong>.
          </p>
          <ul>
            <li>Anyone in the city can drop off mail (other services send notification requests).</li>
            <li>
              The sorting centre checks each item:{" "}
              <strong>Is the address valid? Has this person asked not to receive junk mail? Is it urgent?</strong>
            </li>
            <li>
              <strong>Express mail</strong> (OTPs) goes in a fast lane, and <strong>bulk flyers</strong> (marketing) go
              in a slow lane, so flyers never delay urgent letters.
            </li>
            <li>
              Mail goes out through <strong>different carriers</strong> (post, courier, email, SMS), and if one carrier
              is on strike, the centre <strong>switches to another</strong>.
            </li>
            <li>
              It keeps <strong>tracking records</strong>: sent, delivered, opened, bounced.
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
              Send notifications through <strong>multiple channels</strong>: <strong>mobile push</strong> (iOS/Android),{" "}
              <strong>SMS</strong>, <strong>email</strong> and <strong>in-app</strong> (a notification inbox, or
              real-time via WebSocket).
            </li>
            <li>
              Support <strong>transactional</strong> (OTP, order updates, security alerts) and{" "}
              <strong>marketing / bulk</strong> notifications (campaigns).
            </li>
            <li>
              <strong>User preferences:</strong> opt in/out per channel and category, quiet hours and language.
            </li>
            <li>
              <strong>Templates</strong> with personalisation (
              <code>Hi &#123;&#123;name&#125;&#125;, your order &#123;&#123;orderId&#125;&#125; has shipped</code>) and
              localisation.
            </li>
            <li>
              <strong>Scheduling:</strong> send at a specific time, or in the user's local time zone.
            </li>
            <li>
              <strong>Tracking:</strong> sent, delivered, opened, clicked, failed or bounced.
            </li>
          </ol>
          <p>
            <strong>Out of scope:</strong> building our own SMS or email delivery infrastructure (we use providers), and
            the campaign-design UI.
          </p>
          <p>
            <strong>Non-functional:</strong>
          </p>
          <ul>
            <li>
              <strong>Reliability:</strong> notifications must not be <strong>lost</strong>. Aim for{" "}
              <strong>at-least-once delivery with deduplication</strong>, so users don't get duplicates (post 37).
            </li>
            <li>
              <strong>Low latency for critical messages:</strong> OTPs and security alerts delivered in{" "}
              <strong>seconds</strong>.
            </li>
            <li>
              <strong>High throughput for bulk:</strong> millions of messages in minutes, <strong>without</strong>{" "}
              hurting transactional traffic.
            </li>
            <li>
              <strong>Scalable and extensible:</strong> easy to add a new channel (say, WhatsApp) or a new provider.
            </li>
            <li>
              <strong>Respect user choices and laws:</strong> opt-outs, consent and anti-spam rules.
            </li>
          </ul>
          <h3 id="step-2-estimation">Step 2: Estimation</h3>
          <p>Assumptions:</p>
          <ul>
            <li>
              <strong>50M users</strong>, about <strong>10M push</strong>, <strong>1M SMS</strong> and{" "}
              <strong>5M email</strong> notifications on a normal day.
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
                sub: <>20 M users in 10 minutes — the real design driver</>,
              },
              { value: <>~3 TB / year</>, label: <>delivery logs</>, sub: <>keep detail for ~90 days</> },
            ]}
          />
          <p>
            <strong>So this means:</strong>
          </p>
          <ul>
            <li>
              Normal load is modest. <strong>Campaign bursts</strong> are about 30× higher, so we need{" "}
              <strong>queues</strong> to absorb bursts and <strong>separate lanes</strong> so bursts don't delay OTPs.
            </li>
            <li>
              <strong>Third-party providers have rate limits.</strong> We must <strong>throttle</strong> what we send
              them (post 43).
            </li>
            <li>
              Status logs grow quickly, so use <strong>time-partitioned storage</strong> with retention.
            </li>
          </ul>
          <h3 id="step-3-api-and-data-model">Step 3: API and data model</h3>
          <p>
            <strong>Send API</strong> (used by internal services):
          </p>
          <CodeBlock lang="http" code={code1} />
          <p>
            Bulk sends use a <strong>campaign</strong> API that references an <strong>audience segment</strong>, not
            millions of individual calls.
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
                desc: <>validate → idempotency check → enrich with contacts, preferences, template</>,
              },
              {
                title: <>Priority queues</>,
                desc: <>critical (OTP, security) · transactional · bulk — never share workers</>,
              },
              {
                title: <>Channel workers</>,
                desc: <>push → APNs/FCM · SMS → provider A (fallback B) · email → SES · in-app → inbox + WebSocket</>,
              },
              {
                title: <>Retry queues + DLQ</>,
                desc: <>transient failures back off; poison messages park</>,
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
              The order service calls the Notification API with an <strong>idempotency key</strong>.
            </li>
            <li>
              The API <strong>dedups</strong>, loads the user's <strong>preferences</strong> (email allowed? push
              enabled?), picks the <strong>channels</strong>, renders <strong>templates</strong> in the user's language,
              and applies <strong>quiet hours</strong> (non-urgent messages wait until morning).
            </li>
            <li>
              Messages go into the <strong>transactional</strong> queue for each channel.
            </li>
            <li>
              <strong>Push workers</strong> send to <strong>APNs</strong> (Apple) and <strong>FCM</strong> (Google)
              using the user's <strong>device tokens</strong>. <strong>Email workers</strong> call the email provider.
            </li>
            <li>
              Providers report <strong>delivery status</strong> (via responses and webhooks), and the tracking service
              updates the log.
            </li>
            <li>
              Failures are <strong>retried with backoff</strong>, and permanent failures go to a <strong>DLQ</strong>{" "}
              (post 38).
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
                    Delivery receipt later updates notifications_log; OTP jobs older than ~2 min are dropped, not sent
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
              <strong>dedicated workers</strong>. This is a <strong>bulkhead</strong> (post 42).
            </li>
            <li>
              <strong>Critical:</strong> OTPs, password resets, security alerts, payment confirmations. Low latency,
              highest priority, monitored by <strong>message age</strong> ("oldest OTP must be &lt; 10 seconds").
            </li>
            <li>
              <strong>Transactional:</strong> order and delivery updates.
            </li>
            <li>
              <strong>Bulk / marketing:</strong> campaigns. Throttled, and can be delayed or <strong>shed</strong> under
              load (post 44).
            </li>
            <li>
              <strong>Provider capacity is shared</strong>, so reserve part of each provider's rate limit for critical
              traffic.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 2: Reliability and no duplicates</h4>
          <ul>
            <li>
              <strong>At-least-once delivery</strong> through queues (post 37). A worker only acknowledges{" "}
              <strong>after</strong> the provider accepts the message.
            </li>
            <li>
              <strong>Deduplication at two levels:</strong>
              <ul>
                <li>
                  <strong>Request level:</strong> the <code>Idempotency-Key</code> from the calling service (post 34).
                </li>
                <li>
                  <strong>Send level:</strong> a <code>(notification_id, channel)</code> record, marked as sent. Workers
                  check it before sending, so a redelivered queue message doesn't send twice.
                </li>
              </ul>
            </li>
            <li>
              <strong>Pass idempotency to providers</strong> where they support it.
            </li>
            <li>
              <strong>Transactional outbox</strong> in calling services (post 37): "save order as shipped" and "request
              a notification" can't get out of sync.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">
            Deep dive 3: Third-party providers, limits and failover
          </h4>
          <ul>
            <li>
              <strong>Respect provider rate limits.</strong> Use a <strong>token bucket per provider</strong> (post 43)
              to avoid being throttled or blocked.
            </li>
            <li>
              <strong>Retry transient errors</strong> (timeouts, 5xx, 429) with <strong>backoff + jitter</strong>.{" "}
              <strong>Don't retry permanent errors</strong> (invalid number, unsubscribed, bad token).
            </li>
            <li>
              <strong>Fail over</strong> to a <strong>backup provider</strong> (for SMS and email) when the primary's
              error rate spikes. A <strong>circuit breaker</strong> per provider (post 42) makes this automatic.
            </li>
            <li>
              <strong>Handle provider feedback:</strong>
              <ul>
                <li>
                  <strong>Email bounces and spam complaints:</strong> stop emailing addresses that hard-bounce or
                  complain, or your sender reputation (and delivery for <strong>everyone</strong>) suffers.
                </li>
                <li>
                  <strong>Invalid push tokens:</strong> APNs and FCM tell you when a device token is no longer valid
                  (for example, the app was uninstalled). <strong>Delete those tokens.</strong>
                </li>
              </ul>
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 4: Push notifications specifics</h4>
          <ul>
            <li>
              Each device registers with APNs or FCM and gets a <strong>device token</strong>. The app sends it to your
              backend, which stores it in <code>device_tokens</code>.
            </li>
            <li>
              Users have <strong>multiple devices</strong> (phone, tablet, web), so send to each active token, or to the
              most recently used one, depending on the notification.
            </li>
            <li>
              Keep payloads <strong>small</strong>, and don't put sensitive data in push text (it may appear on a locked
              screen). For example: "You have a new message", not the message content.
            </li>
            <li>
              <strong>Collapse keys / thread IDs</strong> stop floods ("5 new messages" instead of 5 separate alerts).
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 5: User experience and respect</h4>
          <ul>
            <li>
              <strong>Preferences and consent:</strong> users choose categories and channels, and{" "}
              <strong>marketing requires opt-in</strong> in many regions. Include <strong>unsubscribe links</strong> in
              marketing emails.
            </li>
            <li>
              <strong>Per-user rate limits and digests:</strong> don't send 40 "someone liked your post" pushes in an
              hour. <strong>Batch</strong> them into a digest ("Ravi and 39 others liked your post").
            </li>
            <li>
              <strong>Quiet hours and time zones:</strong> schedule non-urgent messages for sensible local times.
            </li>
            <li>
              <strong>Smart channel selection:</strong> if the user is <strong>active in the app right now</strong>,
              show an in-app notification instead of a push. If a push isn't opened, maybe send an email later.
            </li>
            <li>
              <strong>Localisation:</strong> templates per language, with safe fallbacks.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 6: Big campaigns</h4>
          <p>For 20M messages:</p>
          <ol>
            <li>
              The campaign service <strong>resolves the audience</strong> in batches (for example, 10,000 users per
              job), filtering out users who've opted out.
            </li>
            <li>
              It <strong>enqueues batches</strong> into the bulk lane.
            </li>
            <li>
              Workers <strong>throttle</strong> to provider limits, and <strong>spread sends</strong> over the planned
              time window.
            </li>
            <li>
              <strong>Monitor and pause</strong> the campaign if error rates or complaints spike (a kill switch, post
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
              <strong>SLOs</strong>, for example "99% of OTPs delivered to the provider within 5 seconds" (post 47).
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 8: Security and abuse</h4>
          <ul>
            <li>
              <strong>Only trusted internal services</strong> can call the send API (service authentication, post 49).
            </li>
            <li>
              <strong>Protect OTP endpoints</strong> from abuse: rate limits per phone number, IP and device. Watch for{" "}
              <strong>SMS pumping</strong> fraud, where bots trigger large numbers of SMS messages to premium numbers to
              earn money from the charges (post 43).
            </li>
            <li>
              <strong>Don't log full OTPs</strong> or sensitive message content (post 51).
            </li>
            <li>
              <strong>Sign provider webhooks</strong>, and verify signatures on status callbacks (post 34).
            </li>
          </ul>
          <h3 id="wrap-up">Wrap-up</h3>
          <ul>
            <li>
              <strong>Key decisions:</strong> one central, <strong>asynchronous</strong> system (202 Accepted) with{" "}
              <strong>priority lanes per channel</strong>; <strong>preferences, templates and dedup</strong> applied
              centrally; <strong>channel workers</strong> with{" "}
              <strong>provider rate limits, retries, circuit breakers and failover</strong>; <strong>tracking</strong>{" "}
              via provider callbacks.
            </li>
            <li>
              <strong>Trade-offs:</strong> at-least-once plus dedup (reliable) vs the complexity of dedup storage;
              batching and quiet hours (a better experience) vs slower delivery for non-urgent messages; multiple
              providers (resilient) vs integration and cost.
            </li>
            <li>
              <strong>Next steps:</strong> ML-based send-time optimisation, channel ranking, WhatsApp and other
              messaging channels, and a self-service campaign UI.
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
            example, to refresh a viewing list after activity elsewhere). It uses priority-based queues and a hybrid of
            push and pull delivery, and supports many devices per user.
          </p>
          <p>
            <strong>LinkedIn's notification systems.</strong> LinkedIn has written about <strong>Concourse</strong>, a
            system for generating personalised notifications in near real time, and about a service it called{" "}
            <strong>Air Traffic Controller</strong>, which decides{" "}
            <strong>whether, when and through which channel</strong> to notify a member, to avoid overwhelming people
            with too many messages.
          </p>
          <p>
            <strong>Slack's "should we send a notification?" flowchart.</strong> Slack once shared a now-famous, very
            complex flowchart showing the many checks (is the user active? channel muted? do-not-disturb? mentioned?
            preferences?) that decide whether a notification is sent. It's a great illustration of how much{" "}
            <strong>logic around preferences and context</strong> a good notification system needs.
          </p>
          <p>
            <strong>OTP delivery in banking and payments.</strong> Banks and payment apps depend on OTP SMS for logins
            and transactions, and typically use <strong>multiple SMS providers</strong> with automatic failover, plus
            strict monitoring of <strong>delivery time</strong>, because an OTP that arrives late blocks the customer
            from paying.
          </p>
          <p>
            <strong>Email sender reputation.</strong> Email providers such as Gmail and Outlook filter mail based on
            sender reputation. Companies that keep emailing addresses that bounce, or ignore spam complaints, see their
            messages land in spam for <strong>all</strong> users. That's why suppression lists and bounce handling are
            essential.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>How do you make sure a critical OTP isn't stuck behind a marketing campaign?</>,
                a: (
                  <>
                    <p>
                      Separate priority queues with dedicated workers per class (critical, transactional, bulk),
                      per-class rate limits, and alerts on the age of the oldest critical message. Campaigns go through
                      their own throttled lane.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you avoid sending duplicate notifications?</>,
                a: (
                  <>
                    <p>
                      Callers send an idempotency key (like order-5521-shipped); the API records it under a unique
                      constraint. Workers are idempotent per notification and channel, and provider calls reuse the
                      notification ID where providers support it.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you handle a failing SMS or email provider?</>,
                a: (
                  <>
                    <p>
                      Retries with backoff and jitter for transient errors, a circuit breaker per provider, automatic
                      fallback to a secondary provider, a DLQ for permanent failures, and dashboards of delivery rates
                      per provider.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do user preferences and quiet hours fit in?</>,
                a: (
                  <>
                    <p>
                      Check them during enrichment, before enqueueing: per category and channel opt-ins, unsubscribes
                      (legally required for marketing), locale for templates, and time-zone-aware quiet hours that delay
                      non-critical messages. Security notifications bypass marketing opt-outs.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you send 20 million campaign messages in ten minutes?</>,
                a: (
                  <>
                    <p>
                      Fan out in batches: a campaign job splits the audience into chunks, enqueues them on the bulk
                      lane, and workers scale horizontally while per-provider rate limits and quotas are respected, with
                      progress tracked per chunk so a crash resumes instead of restarting.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you track whether notifications were delivered?</>,
                a: (
                  <>
                    <p>
                      Store a log row per notification and channel with its provider message ID, then update status from
                      provider webhooks (delivered, bounced, opened) and in-app read events — for support, retries,
                      analytics and pruning dead device tokens.
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
              Guarantee <strong>at-least-once delivery with deduplication</strong> (idempotency keys + a sent record),
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
