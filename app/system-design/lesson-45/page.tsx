import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import { Compare, Flow, QA, Stats, Timeline } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-45")!;

export const metadata: Metadata = {
  title: `Lesson 45 — ${lesson.title}`,
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

export default function SdLessonFourFivePage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            You've done everything in this series: replicas in three zones, automatic failover, circuit breakers, load
            shedding. Then:
          </p>
          <ul>
            <li>
              an engineer runs <code>DELETE FROM orders</code>{" "}
              <strong>
                without a <code>WHERE</code> clause
              </strong>{" "}
              on production,
            </li>
            <li>
              or ransomware <strong>encrypts</strong> your database servers,
            </li>
            <li>
              or a software bug <strong>silently corrupts</strong> customer records for two weeks,
            </li>
            <li>
              or a <strong>fire</strong> destroys the data centre.
            </li>
          </ul>
          <p>
            Replication doesn't help with <strong>any</strong> of these. It faithfully copies the deletion, the
            encryption or the corruption to every replica within milliseconds. Your "highly available" system now has{" "}
            <strong>three perfect copies of the wrong data</strong>.
          </p>
          <p>
            <strong>Backups</strong> and <strong>disaster recovery (DR)</strong> exist for exactly these cases. The two
            numbers that drive every decision are <strong>RPO</strong> and <strong>RTO</strong>.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about your <strong>phone's photos</strong>.
          </p>
          <ul>
            <li>
              <strong>Replication</strong> is like having your photos synced across your phone and tablet. If your phone
              breaks, the tablet still has them. But if you <strong>delete</strong> an album on your phone, it's{" "}
              <strong>deleted on the tablet too</strong>.
            </li>
            <li>
              <strong>A backup</strong> is like a <strong>separate copy</strong> on an external drive or in cloud
              storage, taken last Sunday. If you delete an album by mistake, you can <strong>go back</strong> to
              Sunday's copy.
            </li>
            <li>
              <strong>Disaster recovery</strong> is your <strong>plan</strong> for getting back to normal: where the
              backups are, how to restore them, how long it takes, and who does it.
            </li>
          </ul>
          <p>Two questions define the plan:</p>
          <ul>
            <li>
              <strong>RPO (Recovery Point Objective):</strong> "How much data can we afford to <strong>lose</strong>?"
              If you back up every Sunday and lose your phone on Saturday, you lose almost a week of photos.
            </li>
            <li>
              <strong>RTO (Recovery Time Objective):</strong> "How long can we afford to be <strong>down</strong>?" How
              long does it take to get a new phone and restore everything?
            </li>
          </ul>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="rpo-and-rto">RPO and RTO</h3>
          <Timeline
            caption="RPO looks backwards from the disaster; RTO looks forwards."
            events={[
              { time: <>02:00</>, text: <>last good backup or copy</> },
              {
                time: <>02:00 → 10:42</>,
                text: <>everything written here may be lost — this gap is the RPO</>,
                tone: "warn",
              },
              { time: <>10:42</>, text: <>disaster: DELETE FROM orders with no WHERE</>, tone: "bad" },
              { time: <>10:42 → 11:30</>, text: <>down while restoring — this gap is the RTO</>, tone: "warn" },
              { time: <>11:30</>, text: <>service restored</>, tone: "good" },
            ]}
          />
          <ul>
            <li>
              <strong>RPO</strong> is measured <strong>backwards</strong> from the disaster: the maximum acceptable{" "}
              <strong>data loss</strong>, as time.
              <ul>
                <li>RPO = 24 hours: daily backups are enough.</li>
                <li>RPO = 5 minutes: you need continuous log shipping or replication.</li>
                <li>RPO ≈ 0: you need synchronous replication (and backups for logical errors).</li>
              </ul>
            </li>
            <li>
              <strong>RTO</strong> is measured <strong>forwards</strong>: the maximum acceptable{" "}
              <strong>downtime</strong>.
              <ul>
                <li>RTO = 1 day: restoring from backups onto new servers is fine.</li>
                <li>RTO = 15 minutes: you need a warm standby ready to take over.</li>
                <li>RTO ≈ 0: you need active-active across regions.</li>
              </ul>
            </li>
          </ul>
          <p>
            <strong>Lower RPO and RTO cost more money and complexity.</strong> Set them <strong>per system</strong>,
            based on business impact:
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>System</th>
                  <th>Example RPO</th>
                  <th>Example RTO</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Payments / ledger</td>
                  <td>~0 (no lost transactions)</td>
                  <td>Minutes</td>
                </tr>
                <tr>
                  <td>Orders</td>
                  <td>Minutes</td>
                  <td>&lt; 1 hour</td>
                </tr>
                <tr>
                  <td>Product catalogue</td>
                  <td>Hours (can re-import)</td>
                  <td>Hours</td>
                </tr>
                <tr>
                  <td>Analytics warehouse</td>
                  <td>1 day</td>
                  <td>1–2 days</td>
                </tr>
                <tr>
                  <td>Internal wiki</td>
                  <td>1 day</td>
                  <td>1 day</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3 id="replication-is-not-a-backup">Replication is not a backup</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Replication</th>
                  <th>Backup</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Purpose</td>
                  <td>Availability: survive machine/zone failure</td>
                  <td>
                    Recovery: go <strong>back in time</strong>
                  </td>
                </tr>
                <tr>
                  <td>Protects against hardware failure</td>
                  <td>✅</td>
                  <td>✅ (slower)</td>
                </tr>
                <tr>
                  <td>Protects against accidental delete / bad migration</td>
                  <td>❌ (copied instantly)</td>
                  <td>✅</td>
                </tr>
                <tr>
                  <td>Protects against corruption / ransomware</td>
                  <td>❌</td>
                  <td>✅ (if isolated and immutable)</td>
                </tr>
                <tr>
                  <td>Time to recover</td>
                  <td>Seconds–minutes</td>
                  <td>Minutes–hours+</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>You need both.</strong>
          </p>
          <h3 id="types-of-backups">Types of backups</h3>
          <ul>
            <li>
              <strong>Full backup:</strong> a complete copy of everything. Simple to restore, but slow and large.
            </li>
            <li>
              <strong>Incremental backup:</strong> only what changed <strong>since the last backup</strong> (of any
              kind). Small and fast to take, but restoring needs the full backup <strong>plus every incremental</strong>{" "}
              in the chain.
            </li>
            <li>
              <strong>Differential backup:</strong> everything changed <strong>since the last full backup</strong>.
              Restoring needs the full backup plus the latest differential.
            </li>
            <li>
              <strong>Snapshots:</strong> point-in-time copies of disks or volumes (cloud disk snapshots, file-system
              snapshots). Fast, but check that they're <strong>consistent</strong> for databases (use the database's own
              backup tools or freeze writes briefly).
            </li>
            <li>
              <strong>Logical backups:</strong> exports of data as SQL or other formats (like <code>pg_dump</code>).
              Portable and good for small databases or single tables, but slow for large ones.
            </li>
            <li>
              <strong>Physical backups:</strong> copies of the database's files (like <code>pg_basebackup</code>). Fast
              for large databases.
            </li>
          </ul>
          <h3 id="point-in-time-recovery-pitr">Point-in-time recovery (PITR)</h3>
          <p>
            Databases write every change to their <strong>write-ahead log</strong> (post 21). If you keep:
          </p>
          <ol>
            <li>
              a <strong>base backup</strong> (say, nightly), <strong>plus</strong>
            </li>
            <li>
              <strong>every WAL file since then</strong> (continuous archiving, often to object storage),
            </li>
          </ol>
          <p>
            then you can restore to <strong>any moment</strong>, for example{" "}
            <strong>
              10:41:59, one second before the bad <code>DELETE</code> ran
            </strong>
            .
          </p>
          <Flow
            caption="Point-in-time recovery: a base backup plus the archived write-ahead log."
            dir="row"
            nodes={[
              { title: <>Base backup</>, desc: <>02:00</> },
              { title: <>+ WAL replayed</>, desc: <>up to 10:41:59</> },
              { title: <>Database</>, desc: <>one second before the mistake</>, tone: "good" },
            ]}
          />
          <p>
            PITR gives a very low RPO for logical mistakes. Managed databases (Amazon RDS, Cloud SQL, Azure Database)
            offer it with a few clicks, usually for a retention window like 7–35 days.
          </p>
          <h3 id="the-3-2-1-rule-and-beyond">The 3-2-1 rule (and beyond)</h3>
          <p>A classic rule for safe backups:</p>
          <ul>
            <li>
              <strong>3</strong> copies of your data (the original plus 2 backups),
            </li>
            <li>
              on <strong>2</strong> different types of storage or media,
            </li>
            <li>
              with <strong>1</strong> copy <strong>off-site</strong> (another region, or another provider).
            </li>
          </ul>
          <p>Modern additions, especially because of ransomware:</p>
          <ul>
            <li>
              <strong>Immutable backups:</strong> backups that <strong>can't be changed or deleted</strong> for a set
              period, even by administrators (for example, object-lock features in S3-compatible storage).
            </li>
            <li>
              <strong>Isolated or "air-gapped" backups:</strong> stored in a separate account with different
              credentials, so an attacker who breaks into production <strong>can't delete the backups too</strong>.
            </li>
            <li>
              <strong>Encrypted backups</strong>, with keys managed carefully (Part 9). A backup you can't decrypt is
              useless.
            </li>
          </ul>
          <Stats
            caption="The 3-2-1 rule, plus the modern additions ransomware made necessary."
            stats={[
              { value: <>3</>, label: <>copies</>, sub: <>the original + 2 backups</> },
              { value: <>2</>, label: <>kinds of storage</>, sub: <>so one failure mode can't take both</> },
              { value: <>1</>, label: <>off-site</>, sub: <>another region or provider</> },
              {
                value: <>+</>,
                label: <>immutable &amp; isolated</>,
                sub: <>object lock, separate account and credentials</>,
              },
            ]}
          />
          <h3 id="other-protective-habits">Other protective habits</h3>
          <ul>
            <li>
              <strong>Soft deletes:</strong> mark rows as deleted (<code>deleted_at</code>) instead of removing them
              immediately, so they're easy to undo.
            </li>
            <li>
              <strong>Delayed replicas:</strong> a replica that deliberately stays, say, <strong>1 hour behind</strong>.
              If a bad change happens, you can stop it before it catches up and recover quickly.
            </li>
            <li>
              <strong>Audit logs:</strong> record who changed what and when, so you know <strong>what</strong> to
              restore.
            </li>
            <li>
              <strong>Safe migrations:</strong> reviewed, tested scripts; backups taken right before risky changes; and
              restricted direct production access.
            </li>
          </ul>
          <h3 id="disaster-recovery-strategies">Disaster recovery strategies</h3>
          <p>AWS describes four common DR strategies, from cheapest and slowest to most expensive and fastest:</p>
          <Compare
            caption="The four disaster-recovery strategies, cheapest and slowest first."
            columns={[
              {
                title: <>Backup &amp; restore</>,
                items: [
                  { sign: "·", text: <>Backups in another region; rebuild when needed</> },
                  { sign: "·", text: <>RPO hours · RTO hours to days</> },
                ],
                verdict: <>Internal tools, analytics</>,
              },
              {
                title: <>Pilot light</>,
                items: [
                  { sign: "·", text: <>Core pieces (a DB replica) running; the rest off</> },
                  { sign: "·", text: <>RPO minutes · RTO tens of minutes</> },
                ],
                verdict: <>Important but not instant</>,
              },
              {
                title: <>Warm standby</>,
                items: [
                  { sign: "·", text: <>A scaled-down full copy running</> },
                  { sign: "·", text: <>RPO seconds–minutes · RTO minutes</> },
                ],
                verdict: <>Orders, core APIs</>,
              },
              {
                title: <>Multi-site active-active</>,
                items: [
                  { sign: "·", text: <>Two or more regions serving traffic</> },
                  { sign: "·", text: <>RPO ~0 · RTO ~0–minutes</> },
                ],
                verdict: <>Payments, ledgers — at the highest cost</>,
              },
            ]}
          />
          <p>
            <strong>Infrastructure as code</strong> (Terraform, CloudFormation, Pulumi) makes the cheaper strategies
            much faster, because you can rebuild whole environments from code instead of from memory.
          </p>
          <h3 id="test-your-restores">Test your restores</h3>
          <p>
            <strong>A backup you've never restored is not a backup. It's a hope.</strong> Common failures found only
            during a real emergency:
          </p>
          <ul>
            <li>backups were silently failing for months,</li>
            <li>backups were empty, partial or corrupted,</li>
            <li>
              the restore takes <strong>12 hours</strong>, far beyond the RTO,
            </li>
            <li>nobody knows the steps, or the only person who does is unavailable,</li>
            <li>the encryption keys or credentials needed to restore are missing,</li>
            <li>
              the backup is fine, but the app can't start because of other missing pieces (secrets, DNS, configuration).
            </li>
          </ul>
          <p>Good practice:</p>
          <ul>
            <li>
              <strong>automated restore tests</strong>, for example restoring last night's backup to a test environment
              every day and running checks on it,
            </li>
            <li>
              <strong>regular DR drills</strong>: actually fail over to the DR region, or rebuild from backups, and time
              it,
            </li>
            <li>
              <strong>monitor backups</strong>: alert on failed or missing backups, and on backups that are unexpectedly
              small,
            </li>
            <li>
              <strong>written runbooks</strong>, updated after every drill.
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Lower RPO:</strong> less data lost, but more frequent backups or continuous replication, and more
              cost.
            </li>
            <li>
              <strong>Lower RTO:</strong> faster recovery, but standby infrastructure running all the time, and more
              complexity.
            </li>
            <li>
              <strong>Multi-site active-active:</strong> near-zero downtime, but the highest cost, plus hard data
              consistency problems (posts 24, 27–28).
            </li>
            <li>
              <strong>Long retention:</strong> you can recover from old corruption, but it costs more storage, and there
              are privacy and compliance issues with keeping personal data for a long time.
            </li>
            <li>
              <strong>Immutable, isolated backups:</strong> strong protection from ransomware and mistakes, but more
              careful management of accounts, keys and lifecycle rules.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>GitLab (2017).</strong> During a stressful incident, an engineer accidentally deleted data from
            GitLab's primary production database. The team then discovered that{" "}
            <strong>several of their backup methods weren't working</strong> as expected. They eventually restored from
            a copy that was about <strong>six hours old</strong>, losing some data. GitLab live-streamed the recovery
            and published a very open postmortem. It's now a classic lesson:{" "}
            <strong>test your backups and restores</strong>.
          </p>
          <p>
            <strong>The OVHcloud data-centre fire (2021).</strong> A fire destroyed one of OVHcloud's data centres in
            Strasbourg, France, and damaged another. Customers whose backups were stored{" "}
            <strong>in the same location</strong> as their servers lost data permanently. Those with{" "}
            <strong>off-site</strong> backups could recover. It's the 3-2-1 rule proven the hard way.
          </p>
          <p>
            <strong>Code Spaces (2014).</strong> An attacker gained access to the company's cloud account and{" "}
            <strong>deleted its servers, data and backups</strong>, which were all in the same account. The company shut
            down. It's the reason modern advice insists on <strong>isolated, immutable backups</strong> with separate
            credentials.
          </p>
          <p>
            <strong>
              Pixar and <em>Toy Story 2</em>.
            </strong>{" "}
            In a famous story, a mistaken command started deleting the files for <em>Toy Story 2</em> during production,
            and the backups turned out to be faulty. The film was saved because a technical director had a{" "}
            <strong>copy on her home computer</strong>. It's a lucky off-site backup, and a reminder not to rely on
            luck.
          </p>
          <p>
            <strong>Managed database PITR.</strong> Cloud database services make point-in-time recovery standard. Many
            teams have recovered from accidental deletes by restoring a copy of the database to "five minutes before the
            mistake" and then copying back only the affected rows.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>Why isn't replication a backup?</>,
                a: (
                  <>
                    <p>
                      Replication copies every change — including accidental deletes, bad migrations, corruption and
                      ransomware encryption — to every replica within milliseconds. It protects against hardware and
                      zone failure, not against logical mistakes. Only a backup lets you go back in time.
                    </p>
                  </>
                ),
              },
              {
                q: <>Define RPO and RTO.</>,
                a: (
                  <>
                    <p>
                      RPO (recovery point objective) is the maximum acceptable data loss, measured backwards from the
                      disaster. RTO (recovery time objective) is the maximum acceptable downtime until service is
                      restored. Lower values need more frequent backups or replication, and standby capacity.
                    </p>
                  </>
                ),
              },
              {
                q: <>How does point-in-time recovery work?</>,
                a: (
                  <>
                    <p>
                      Take periodic base backups and continuously archive the write-ahead log. To recover, restore the
                      base backup and replay the WAL up to a chosen moment — for example one second before the bad
                      statement ran.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you protect backups from ransomware?</>,
                a: (
                  <>
                    <p>
                      Store them immutably (object lock or WORM retention) in a separate, isolated account with
                      different credentials, encrypted with carefully managed keys, and off-site — so an attacker who
                      owns production can't delete or encrypt them too.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you know your backups work?</>,
                a: (
                  <>
                    <p>
                      Restore them, automatically and regularly — for example, restore last night's backup into a test
                      environment every day and run checks — and alert on missing, failed or suspiciously small backups.
                      Time full DR drills against your RTO.
                    </p>
                  </>
                ),
              },
              {
                q: <>Which DR strategy would you choose for a payments ledger?</>,
                a: (
                  <>
                    <p>
                      Close to zero RPO and minutes of RTO: synchronous or near-synchronous cross-zone replication, a
                      warm standby or active-active in another region, plus point-in-time backups for logical errors —
                      with regular failover drills.
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
              <strong>Replication ≠ backup.</strong> Replicas copy mistakes, corruption and ransomware instantly. You
              need <strong>backups</strong> to go <strong>back in time</strong>.
            </li>
            <li>
              <strong>RPO</strong> = how much data you can lose. <strong>RTO</strong> = how long you can be down. Set
              both <strong>per system</strong>, based on business impact.
            </li>
            <li>
              Use <strong>full, incremental and differential</strong> backups, snapshots, and{" "}
              <strong>point-in-time recovery</strong> (base backup + archived WAL).
            </li>
            <li>
              Follow <strong>3-2-1</strong>, plus <strong>immutable and isolated</strong> backups and careful key
              management. Add <strong>soft deletes</strong>, <strong>delayed replicas</strong> and{" "}
              <strong>audit logs</strong>.
            </li>
            <li>
              Pick a <strong>DR strategy</strong> (backup &amp; restore → pilot light → warm standby → active-active) to
              match your RPO/RTO, and <strong>test restores and failovers regularly</strong>.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>The AWS whitepaper "Disaster Recovery of Workloads on AWS: Recovery in the Cloud"</li>
            <li>
              <em>Site Reliability Engineering</em> by Google (chapter "Data Integrity: What You Read Is What You
              Wrote")
            </li>
            <li>The PostgreSQL documentation chapter "Continuous Archiving and Point-in-Time Recovery (PITR)"</li>
            <li>GitLab's public postmortem of its January 31, 2017 database outage</li>
            <li>Microsoft Azure's reliability and business continuity documentation</li>
          </ul>
          <p>
            <em>
              This wraps up Part 7. Next up, Part 8: Observability, starting with "Logs, Metrics &amp; Traces: The Three
              Pillars".
            </em>
          </p>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
