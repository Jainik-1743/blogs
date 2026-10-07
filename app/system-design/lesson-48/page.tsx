import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import { Compare, Flow, QA, Timeline } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-48")!;

export const metadata: Metadata = {
  title: `Lesson 48 — ${lesson.title}`,
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

export default function SdLessonFourEightPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            It is 3:12 AM. The on-call engineer's phone buzzes. (On-call means it is this person's turn to respond to problems outside work hours.) The alert says: <strong>"CPU &gt; 80% on db-3."</strong> They wake up,
            log in, and find… nothing wrong. Users are fine. It was only a nightly batch job (a task that runs by itself at night). An alert is an automatic message that tells people something may be wrong. At 3:40 AM:{" "}
            <strong>"Disk 75% on worker-12."</strong> Also fine. By the end of the week they've had 60 alerts, and 55 of
            them didn't matter.
          </p>
          <p>
            So on Friday night, when a <strong>real</strong> alert fires ("checkout errors 12%"), it gets <strong>snoozed</strong> (ignored for a while) with all the others. Customers can't pay for two hours.
          </p>
          <p>
            Afterwards, a manager asks, <strong>"Whose fault was this?"</strong> The engineer who snoozed the alert gets
            blamed. From then on, people start <strong>hiding</strong> their mistakes instead of reporting them.
          </p>
          <p>
            Three things turn observability data (posts 46–47) into a system that really gets more reliable over time: good monitoring, <strong>good alerts</strong> and a <strong>healthy way to learn from incidents</strong>. An incident is any unplanned event that hurts users.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            <strong>Alerting is like a smoke alarm.</strong>
          </p>
          <ul>
            <li>
              A good smoke alarm goes off when there's <strong>real danger</strong> and you need to{" "}
              <strong>act now</strong>.
            </li>
            <li>
              A smoke alarm that goes off <strong>every time you make toast</strong> gets its battery removed, and then
              it's silent during a real fire.
            </li>
          </ul>
          <p>
            <strong>Postmortems are like how aviation handles incidents.</strong> When something goes wrong with a
            plane, investigators don't just ask "which pilot messed up?". They ask:{" "}
            <strong>what in the system allowed this to happen, and how do we stop it happening to anyone again?</strong>{" "}
            Pilots are encouraged to report near-misses (events that almost caused harm) without fear of punishment. This culture is a big reason why flying is so safe.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="part-1-monitoring-and-dashboards">Part 1: Monitoring and dashboards</h3>
          <p>
            <strong>Monitoring</strong> means you keep collecting and watching signals (metrics, logs and traces, post 46) to know how healthy your system is. A <strong>dashboard</strong> is one screen of graphs that shows these signals.
          </p>
          <p>
            <strong>Useful dashboards, from the top down (start with the user, end with the machines):</strong>
          </p>
          <ol>
            <li>
              <strong>User-journey / SLO dashboard:</strong> are users OK? SLIs, error budgets and burn rates for login,
              search, checkout and so on (post 47).
            </li>
            <li>
              <strong>Service overview:</strong> for each service, the <strong>golden signals</strong> (latency as the median and p99, traffic, errors, saturation), plus deploy markers. A deploy marker is a line on the graph that shows when a new version went out.
            </li>
            <li>
              <strong>Dependency dashboards:</strong> databases, caches, queues and third-party APIs. For a queue, lag means how far behind the readers are. Depth means how many messages are waiting.
            </li>
            <li>
              <strong>Infrastructure:</strong> nodes, containers, CPU, memory, disks and networks (the USE method).
            </li>
          </ol>
          <p>
            Design dashboards so an on-call engineer can go from <strong>"users are affected"</strong> to{" "}
            <strong>"it's this service"</strong> to <strong>"it's this dependency"</strong> in a few clicks.
          </p>
          <p>
            <strong>Other monitoring types:</strong>
          </p>
          <ul>
            <li>
              <strong>Synthetic monitoring:</strong> scripted "robot users" that log in, search and check out every minute from several places. They find problems even when real traffic is low, like at night.
            </li>
            <li>
              <strong>Real User Monitoring (RUM):</strong> measures what <strong>real users' browsers and apps</strong> experience. It collects page load times, JavaScript errors and crash rates, split by device, country and network.
            </li>
            <li>
              <strong>Heartbeat / "dead man's switch" monitoring:</strong> you get an alert when an <strong>expected signal stops</strong>. For example, a nightly backup job did not report success (post 45). Here, silence is the warning.
            </li>
          </ul>
          <h3 id="part-2-alerting-that-people-trust">Part 2: Alerting that people trust</h3>
          <Flow
            caption="Three tests for every page. Fail any one and it isn't a page."
            nodes={[
              { title: <>Urgent?</>, desc: <>it needs action now, not tomorrow morning</> },
              {
                title: <>Actionable?</>,
                desc: <>there is something a human can actually do (and a runbook says what)</>,
              },
              { title: <>User-impacting?</>, desc: <>real or imminent pain for users</> },
              { title: <>Passes all three</>, desc: <>page, with a runbook link</>, tone: "good" },
              { title: <>Otherwise</>, desc: <>a ticket, a dashboard panel — or delete it</>, tone: "muted" },
            ]}
          />
          <p>
            An alert that <strong>wakes someone up</strong> is called a <strong>page</strong>. Every page should pass three tests:
          </p>
          <ol>
            <li>
              <strong>Urgent:</strong> it needs action <strong>now</strong>, not tomorrow morning.
            </li>
            <li>
              <strong>Actionable:</strong> there's something a human can actually do.
            </li>
            <li>
              <strong>User-impacting</strong> (or about to be): it reflects real or imminent pain for users.
            </li>
          </ol>
          <p>
            If an alert fails any test, it should be a <strong>ticket</strong> (a task handled during work hours), a <strong>dashboard</strong> item, or it should be <strong>deleted</strong>.
          </p>
          <p>
            <strong>Alert on symptoms, investigate causes.</strong> A symptom is what users feel (errors, slowness). A cause is the reason inside the system (high CPU, a full disk).
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>❌ Cause-based page</th>
                  <th>✅ Symptom-based page</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>"CPU &gt; 80% on db-3"</td>
                  <td>"Checkout error budget burning at 14× (1h/5m)"</td>
                </tr>
                <tr>
                  <td>"Pod restarted"</td>
                  <td>"Login success rate below SLO"</td>
                </tr>
                <tr>
                  <td>"Disk 75% on worker-12"</td>
                  <td>"Search p99 latency &gt; 1 s for 10 minutes"</td>
                </tr>
                <tr>
                  <td>"Queue has 1,000 messages"</td>
                  <td>"OTP messages older than 2 minutes"</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            High CPU is only a problem <strong>if it hurts users</strong>. Put causes on <strong>dashboards</strong> for
            investigation, and <strong>page on symptoms</strong>, ideally SLO burn rates (post 47).
          </p>
          <p>
            <strong>Some cause-based alerts are still worth having</strong>, especially <strong>predictive</strong> ones. A predictive alert looks ahead, for example "disk will be full in 4 hours at the current rate" or "certificate expires in 7 days". These should usually be <strong>tickets</strong>, not 3 AM pages, unless the deadline is very close.
          </p>
          <p>
            <strong>Every alert needs a runbook.</strong> A runbook is a short written guide that tells the on-call person what to do. It explains what the alert means, how to check the impact, the common causes, and the steps to reduce the harm (mitigation). Mitigation steps include rollback, failover, scale up and a kill switch. These are explained in Part 3. With a runbook, anyone on call can respond, not only the expert.
          </p>
          <p>
            <strong>Fighting alert fatigue.</strong> Alert fatigue means people get so many alerts that they stop paying attention to them. Here is how to fight it:
          </p>
          <ul>
            <li>
              <strong>Review alerts regularly:</strong> "Which alerts fired? Were they useful? Did anyone act?" Delete
              or fix noisy ones.
            </li>
            <li>
              <strong>Group and de-duplicate:</strong> one incident shouldn't produce 200 separate pages. Tools like Prometheus Alertmanager or PagerDuty group related alerts. (PagerDuty is a service that sends alerts to the on-call person's phone.)
            </li>
            <li>
              <strong>Use sensible durations:</strong> alert only when the problem lasts "for 5 minutes", not on a single data point.
            </li>
            <li>
              <strong>Route to the right team</strong>, based on service ownership.
            </li>
            <li>
              <strong>Track pages per on-call shift.</strong> A common goal is{" "}
              <strong>no more than a couple of pages per shift</strong>, so each one gets full attention.
            </li>
          </ul>
          <p>
            <strong>On-call practices:</strong>
          </p>
          <ul>
            <li>
              <strong>Rotations</strong> (weekly is common) with a <strong>primary</strong> and a{" "}
              <strong>secondary</strong> engineer.
            </li>
            <li>
              <strong>Escalation policies:</strong> these are rules for who gets paged next. For example, if the primary does not acknowledge (reply to) the page within 5 minutes, page the secondary, then the manager.
            </li>
            <li>
              <strong>Handoffs</strong> between shifts: the outgoing person tells the next person about ongoing issues and recent changes.
            </li>
            <li>
              <strong>A sustainable load:</strong> compensate on-call time, and make fixing noisy alerts part of the
              job.
            </li>
          </ul>
          <h3 id="part-3-incident-response">Part 3: Incident response</h3>
          <p>
            An <strong>incident</strong> is any unplanned event that hurts (or threatens) users or the business. A clear process keeps people calm and organised.
          </p>
          <p>
            <strong>The lifecycle:</strong>
          </p>
          <Flow
            caption="The incident lifecycle. Reduce the harm first; understand the cause second."
            nodes={[
              { title: <>Detect</>, desc: <>an SLO alert, a synthetic check, or a user report</> },
              { title: <>Triage</>, desc: <>how bad (SEV1–3)? who's needed? declare an Incident Commander</> },
              {
                title: <>Mitigate</>,
                desc: <>roll back, fail over, scale, shed load, flip a kill switch — fast</>,
                tone: "warn",
              },
              { title: <>Resolve</>, desc: <>fix the underlying cause</> },
              { title: <>Learn</>, desc: <>blameless postmortem with owned, tracked action items</>, tone: "good" },
            ]}
          />
          <p>
            <strong>Severity levels</strong> (SEV) say how serious an incident is, so people know how fast to act. For example:
          </p>
          <ul>
            <li>
              <strong>SEV1:</strong> major outage. Many users cannot use a core feature (like payments). Everyone helps, and you tell the public.
            </li>
            <li>
              <strong>SEV2:</strong> significant degradation or a partial outage.
            </li>
            <li>
              <strong>SEV3:</strong> minor impact, with a workaround available.
            </li>
          </ul>
          <p>
            <strong>Clear roles</strong> help in larger incidents. They come from the way emergency services run their incidents:
          </p>
          <ul>
            <li>
              <strong>Incident Commander (IC):</strong> leads the response, makes decisions and keeps the big picture. The IC <strong>does not</strong> debug (look for the bug).
            </li>
            <li>
              <strong>Operations / subject-matter experts:</strong> investigate and apply fixes.
            </li>
            <li>
              <strong>Communications lead:</strong> updates the status page, customer support and leadership at regular
              intervals.
            </li>
            <li>
              <strong>Scribe:</strong> writes a timeline of what was seen, tried and decided. This is very useful for the postmortem.
            </li>
          </ul>
          <p>
            <strong>Mitigate first, investigate later.</strong> The first goal is to <strong>stop user pain</strong>,
            even before you know the root cause. Common quick mitigations:
          </p>
          <ul>
            <li>
              <strong>roll back</strong> the latest deploy. This means going back to the previous version. It is the most common fix, because most incidents follow a change,
            </li>
            <li>
              <strong>fail over</strong> to another zone or region. This means switching traffic to a healthy copy of the system (post 40),
            </li>
            <li>
              <strong>scale up</strong> (add more servers), or <strong>shed load</strong> (refuse some requests on purpose so the rest still work) (post 44),
            </li>
            <li>
              <strong>flip a feature flag / kill switch</strong>. A feature flag is a setting that turns a feature on or off without a new release. A kill switch is a flag for turning a feature off fast (post 44),
            </li>
            <li>
              <strong>block</strong> abusive traffic (post 43).
            </li>
          </ul>
          <p>Root-cause analysis can happen once users are safe.</p>
          <h3 id="part-4-blameless-postmortems">Part 4: Blameless postmortems</h3>
          <p>
            After a serious incident, write a <strong>postmortem</strong>. A postmortem is a written review of what happened, why, and what to change. It is also called an incident review or retrospective. The goal is <strong>learning</strong>, not punishment.
          </p>
          <p>
            <strong>Why blameless?</strong> Almost every incident involves a human action. Someone deployed, someone ran a command, or someone missed an alert. But if people are <strong>punished</strong> for mistakes:
          </p>
          <ul>
            <li>
              they <strong>hide</strong> mistakes and near-misses,
            </li>
            <li>
              the real <strong>system problems</strong> (missing safeguards, confusing tools, noisy alerts, time
              pressure) never get fixed,
            </li>
            <li>
              <strong>the same incident happens again</strong> with a different person.
            </li>
          </ul>
          <p>
            A blameless postmortem assumes{" "}
            <strong>people acted reasonably with the information and tools they had</strong>, and asks{" "}
            <strong>how the system made the mistake easy and the impact large</strong>.
          </p>
          <Compare
            caption="The same incident, written two ways."
            columns={[
              {
                title: <>❌ Blame</>,
                items: [
                  { sign: "-", text: <>“Ravi ran the wrong command and deleted the table.”</> },
                  { sign: "-", text: <>Lesson learned: be more careful (nothing changes)</> },
                  { sign: "-", text: <>Next time, people hide mistakes</> },
                ],
              },
              {
                title: <>✅ Blameless</>,
                items: [
                  {
                    sign: "+",
                    text: <>Prod (the live system) accepted a destructive command from a manual session with no confirmation</>,
                  },
                  { sign: "+", text: <>The script targeted prod by default</> },
                  { sign: "+", text: <>Backups hadn't been restore-tested in 6 months</> },
                  { sign: "+", text: <>Each becomes an action item with an owner</> },
                ],
              },
            ]}
          />
          <p>
            <strong>A postmortem usually has a timeline like this:</strong>
          </p>
          <Timeline
            caption="The postmortem's timeline, reconstructed from the scribe's notes."
            events={[
              { time: <>19:02</>, text: <>deploy v2027.03.12-3 starts — canary stage (a small first release) skipped</> },
              { time: <>19:04</>, text: <>checkout error rate rises to 18%</>, tone: "bad" },
              { time: <>19:06</>, text: <>SLO burn-rate alert pages on-call</>, tone: "good" },
              {
                time: <>19:15</>,
                text: <>alert acknowledged — on-call was busy with a noisy disk alert</>,
                tone: "warn",
              },
              { time: <>19:40</>, text: <>SEV1 declared, Incident Commander assigned</> },
              { time: <>20:55</>, text: <>rollback completed</> },
              { time: <>21:10</>, text: <>error rate back to normal</>, tone: "good" },
            ]}
          />
          <p>
            <strong>Good postmortem habits:</strong>
          </p>
          <ul>
            <li>
              Look for <strong>contributing factors</strong>, in the plural. Complex failures rarely have one "root cause" (the single main reason). Safety engineers often use the <strong>"Swiss cheese" model</strong>. Each layer of defence is a slice of cheese with holes. An incident happens when the holes in several slices line up.
            </li>
            <li>
              <strong>"5 whys"</strong> means asking "why?" again and again. It helps you dig deeper. Do not stop at "human error". Keep asking <em>why</em> the system allowed it.
            </li>
            <li>
              Include <strong>what went well</strong>, so you keep doing it.
            </li>
            <li>
              <strong>Action items</strong> must be <strong>specific, owned and tracked</strong> until done. A postmortem whose actions nobody tracks is just a story.
            </li>
            <li>
              <strong>Share widely</strong>, internally and sometimes publicly. Other teams learn too.
            </li>
            <li>
              <strong>Review near-misses</strong> as well. They are free lessons.
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>More alerts:</strong> you catch more problems, but alert fatigue means you miss the important
              ones. <strong>Fewer, symptom-based alerts</strong> give higher trust, though some early warning signs may
              only appear on dashboards.
            </li>
            <li>
              <strong>Page vs ticket:</strong> paging gets a fast response but costs people's sleep and health. Reserve
              pages for urgent, user-impacting issues.
            </li>
            <li>
              <strong>Formal incident process:</strong> clear coordination for big incidents, but overhead for small
              ones. Scale the process to the severity.
            </li>
            <li>
              <strong>Detailed postmortems:</strong> deep learning, but they take time. Write them for significant
              incidents and useful near-misses, not every blip.
            </li>
            <li>
              <strong>Public postmortems:</strong> build customer trust and share industry knowledge, but need care with
              sensitive details.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Etsy and blameless culture.</strong> John Allspaw's 2012 post "Blameless PostMortems and a Just
            Culture", written while he was at Etsy, helped spread the idea through the tech industry. Engineers were
            encouraged to give detailed accounts of their actions without fear of punishment, so the company could fix
            the underlying systems.
          </p>
          <p>
            <strong>Google's postmortem culture.</strong> Google's SRE book has a full chapter on postmortem culture. It
            describes blameless write-ups, shared postmortem repositories, and even "postmortem of the month" reading
            clubs, so lessons spread across teams.
          </p>
          <p>
            <strong>Public postmortems.</strong> Companies like Cloudflare, GitHub, GitLab and AWS publish detailed
            public incident reports. Cloudflare's 2019 write-up is about a single regular expression (a text-matching pattern) that pushed CPU to 100% across its global network for about half an hour. It explained exactly what happened and what changed
            afterwards. These reports are some of the best free learning material in the industry. (The GitHub
            collection "danluu/post-mortems" gathers hundreds of them.)
          </p>
          <p>
            <strong>Knight Capital (2012).</strong> A trading firm deployed new software to its servers, but one of eight servers was missed. A reused configuration flag then switched on <strong>old, unused code</strong> on that server. In about 45 minutes, automated trading caused losses of about $440 million (the company's own figure). The company never recovered as an independent firm. It later merged with another firm. It's often studied as a lesson in deployment safety, monitoring, runbooks
            and incident response, far more than as one person's error.
          </p>
          <p>
            <strong>Incident command in tech.</strong> PagerDuty's open incident-response documentation (based on the incident command used by emergency services) is widely used by companies to define roles like Incident Commander,
            scribe and communications lead.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>What makes a good alert?</>,
                a: (
                  <>
                    <p>
                      It's urgent, actionable and tied to user impact — ideally an SLO burn-rate alert — with a runbook
                      explaining what it means and how to mitigate. Anything that fails those tests belongs on a
                      dashboard or in a ticket queue.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why alert on symptoms rather than causes?</>,
                a: (
                  <>
                    <p>
                      Causes like high CPU or a pod restart often don't hurt users, so paging on them creates noise and
                      alert fatigue. Symptoms like error rate, latency and burned error budget describe what users feel.
                      Keep causes on dashboards for investigation, plus a few predictive tickets (disk full in 4 hours,
                      certificate expiring).
                    </p>
                  </>
                ),
              },
              {
                q: <>What are the roles in incident response?</>,
                a: (
                  <>
                    <p>
                      An Incident Commander who coordinates and decides but doesn't debug; subject-matter experts who
                      investigate and fix; a communications lead who updates the status page, support and leadership;
                      and a scribe who records the timeline.
                    </p>
                  </>
                ),
              },
              {
                q: <>What's the first priority in an incident?</>,
                a: (
                  <>
                    <p>
                      Mitigate user impact — roll back the last change, fail over, scale, shed load or flip a feature
                      flag — even before the root cause is known. Investigation continues once users are safe.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why should postmortems be blameless?</>,
                a: (
                  <>
                    <p>
                      Punishing individuals makes people hide mistakes and near-misses, so the system weaknesses that
                      made the error easy and its impact large never get fixed. Blameless reviews assume people acted
                      reasonably with what they had, and look for contributing factors and concrete, owned fixes.
                    </p>
                  </>
                ),
              },
              {
                q: <>What belongs in a postmortem?</>,
                a: (
                  <>
                    <p>
                      Impact and duration, a timeline, contributing factors (usually several), what went well, and
                      specific action items with owners and due dates that are tracked to completion — then share it
                      widely.
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
              <strong>Monitor from the user down</strong>: SLO dashboards → service golden signals → dependencies →
              infrastructure, plus <strong>synthetic checks</strong>, <strong>RUM</strong> and{" "}
              <strong>heartbeat</strong> monitors.
            </li>
            <li>
              <strong>Page only for urgent, actionable, user-impacting problems.</strong> Alert on{" "}
              <strong>symptoms</strong> (SLO burn rates), not causes, and give <strong>every alert a runbook</strong>.
            </li>
            <li>
              Fight <strong>alert fatigue</strong>: review, delete or fix noisy alerts, group duplicates, and keep
              on-call sustainable.
            </li>
            <li>
              In incidents: <strong>clear roles</strong> (Incident Commander, experts, comms, scribe),{" "}
              <strong>severity levels</strong>, and <strong>mitigate first</strong> (roll back, fail over, shed load,
              flip flags).
            </li>
            <li>
              Run <strong>blameless postmortems</strong> that look for <strong>contributing factors</strong>, record
              what went well, and produce <strong>owned, tracked action items</strong>. Share them widely.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              <em>Site Reliability Engineering</em> by Google (chapters "Monitoring Distributed Systems", "Managing
              Incidents" and "Postmortem Culture: Learning from Failure")
            </li>
            <li>
              <em>The Site Reliability Workbook</em> by Google (chapter "Monitoring")
            </li>
            <li>Rob Ewaschuk's document "My Philosophy on Alerting" (a widely shared Google SRE essay)</li>
            <li>PagerDuty's open-source Incident Response and Postmortem guides</li>
            <li>Atlassian's incident management and postmortem guides</li>
            <li>John Allspaw's article "Blameless PostMortems and a Just Culture"</li>
            <li>The "post-mortems" collection on GitHub by Dan Luu</li>
          </ul>
          <p>
            <em>
              This wraps up Part 8. Next up, Part 9: Security for System Designers, starting with "Authentication vs
              Authorization: Sessions, Cookies &amp; JWT".
            </em>
          </p>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
