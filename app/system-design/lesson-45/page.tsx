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
            You have done everything in this part: replicas (live copies of the database) in three zones, automatic
            failover, circuit breakers, load shedding. Then something like this happens:
          </p>
          <ul>
            <li>
              an engineer runs <code>DELETE FROM orders</code>{" "}
              <strong>
                without a <code>WHERE</code> clause
              </strong>{" "}
              on production. (Without <code>WHERE</code>, the command deletes every row. "Production" is the live
              system that real users use.)
            </li>
            <li>
              or ransomware (a program that locks your files and asks for money) <strong>encrypts</strong> your database
              servers,
            </li>
            <li>
              or a software bug <strong>silently corrupts</strong> (damages) customer records for two weeks,
            </li>
            <li>
              or a <strong>fire</strong> destroys the data centre (the building that holds your servers).
            </li>
          </ul>
          <p>
            Replication does not help with <strong>any</strong> of these (except the fire, if the copies are in another
            place). Replication means keeping live copies of data on several servers. It copies the deletion, the
            encryption or the corruption to every replica within milliseconds. Your "highly available" system now has{" "}
            <strong>three perfect copies of the wrong data</strong>.
          </p>
          <p>
            A <strong>backup</strong> is a separate copy of data from an earlier moment, kept so you can restore it.{" "}
            <strong>Disaster recovery (DR)</strong> is the plan and the setup for getting your system working again
            after a big failure. Both exist for exactly these cases. Two numbers drive every decision:{" "}
            <strong>RPO</strong> and <strong>RTO</strong>.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about your <strong>phone's photos</strong>.
          </p>
          <ul>
            <li>
              <strong>Replication</strong> is like having your photos synced between your phone and tablet. If your
              phone breaks, the tablet still has them. But if you <strong>delete</strong> an album on your phone, it is{" "}
              <strong>deleted on the tablet too</strong>.
            </li>
            <li>
              <strong>A backup</strong> is like a <strong>separate copy</strong> on an external drive or in cloud
              storage, taken last Sunday. If you delete an album by mistake, you can <strong>go back</strong> to
              Sunday's copy.
            </li>
            <li>
              <strong>Disaster recovery</strong> is your <strong>plan</strong> for getting back to normal. It says where
              the backups are, how to restore them, how long it takes, and who does it.
            </li>
          </ul>
          <p>Two questions shape the plan:</p>
          <ul>
            <li>
              <strong>RPO (Recovery Point Objective):</strong> "How much data can we afford to <strong>lose</strong>?"
              It is measured in time. If you back up every Sunday and lose your phone on Saturday, you lose almost a
              week of photos.
            </li>
            <li>
              <strong>RTO (Recovery Time Objective):</strong> "How long can we afford to be <strong>down</strong>?" It is
              also measured in time. How long does it take to get a new phone and restore everything?
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
              <strong>RPO</strong> is measured <strong>backwards</strong> from the disaster. It is the most{" "}
              <strong>data loss</strong> you accept, shown as a length of time.
              <ul>
                <li>RPO = 24 hours: daily backups are enough.</li>
                <li>
                  RPO = 5 minutes: you need continuous log shipping (sending the database's change log to another
                  place all the time) or replication.
                </li>
                <li>
                  RPO ≈ 0: you need synchronous replication, where a write counts as done only after the copy has it
                  (and you still need backups for logical errors, which means human or software mistakes).
                </li>
              </ul>
            </li>
            <li>
              <strong>RTO</strong> is measured <strong>forwards</strong> from the disaster. It is the longest{" "}
              <strong>downtime</strong> you accept.
              <ul>
                <li>RTO = 1 day: restoring from backups onto new servers is fine.</li>
                <li>RTO = 15 minutes: you need a warm standby (a smaller copy that is already running) ready to take over.</li>
                <li>RTO ≈ 0: you need active-active across regions (all copies serve traffic all the time).</li>
              </ul>
            </li>
          </ul>
          <p>
            <strong>A lower RPO and RTO cost more money and add more complexity.</strong> Set them{" "}
            <strong>for each system</strong>, based on the harm to the business:
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
                  <td>Availability: survive the failure of a machine or zone</td>
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
                  <td>✅ (if isolated and immutable, which means kept apart and never changeable)</td>
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
            <strong>You need both.</strong> Replication keeps the system running. Backups let you go back to an earlier
            time.
          </p>
          <h3 id="types-of-backups">Types of backups</h3>
          <ul>
            <li>
              <strong>Full backup:</strong> a complete copy of everything. It is simple to restore, but slow to make and
              large.
            </li>
            <li>
              <strong>Incremental backup:</strong> only what changed <strong>since the last backup</strong> (of any
              kind). It is small and fast to make. But to restore you need the full backup{" "}
              <strong>plus every incremental</strong> in the chain.
            </li>
            <li>
              <strong>Differential backup:</strong> everything that changed <strong>since the last full backup</strong>.
              To restore you need the full backup plus the latest differential. (Difference in one line: incremental
              looks back to the last backup of any kind, differential looks back to the last full one.)
            </li>
            <li>
              <strong>Snapshots:</strong> copies of a disk or volume at one moment (cloud disk snapshots, file-system
              snapshots). They are fast. For databases, check that they are <strong>consistent</strong>, which means
              the data is not caught half-written. Use the database's own backup tools, or pause writes for a moment.
            </li>
            <li>
              <strong>Logical backups:</strong> exports of the data as SQL or another format (like <code>pg_dump</code>).
              They are portable and good for small databases or single tables, but slow for large ones.
            </li>
            <li>
              <strong>Physical backups:</strong> copies of the database's own files (like <code>pg_basebackup</code>).
              They are fast for large databases.
            </li>
          </ul>
          <h3 id="point-in-time-recovery-pitr">Point-in-time recovery (PITR)</h3>
          <p>
            <strong>Point-in-time recovery (PITR)</strong> means restoring a database to an exact moment. Databases
            write every change to their <strong>write-ahead log</strong> first (WAL, post 21). The WAL is a
            record of all changes, in order. If you keep:
          </p>
          <ol>
            <li>
              a <strong>base backup</strong> (say, nightly), <strong>plus</strong>
            </li>
            <li>
              <strong>every WAL file since then</strong> (continuous archiving, often to object storage, a service for
              storing files),
            </li>
          </ol>
          <p>
            then you restore the base backup and replay the WAL (apply the changes again, in order). You can stop at{" "}
            <strong>any moment</strong>, for example{" "}
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
            offer it with a few clicks. You can only go back as far as the retention window (how long data is kept).
            The window is set by you, often between 1 and 35 days, and the limits differ between services.
          </p>
          <h3 id="the-3-2-1-rule-and-beyond">The 3-2-1 rule (and beyond)</h3>
          <p>A classic rule for safe backups is called 3-2-1:</p>
          <ul>
            <li>
              <strong>3</strong> copies of your data (the original plus 2 backups),
            </li>
            <li>
              on <strong>2</strong> different types of storage or media,
            </li>
            <li>
              with <strong>1</strong> copy <strong>off-site</strong> (in another place, such as another region or another
              provider).
            </li>
          </ul>
          <p>Modern additions, especially because of ransomware:</p>
          <ul>
            <li>
              <strong>Immutable backups:</strong> backups that <strong>cannot be changed or deleted</strong> for a set
              time, even by administrators. Example: the object lock feature in S3-compatible storage.
            </li>
            <li>
              <strong>Isolated or "air-gapped" backups:</strong> kept in a separate account with different logins (air
              gapped originally meant not connected to any network). An attacker who breaks into production{" "}
              <strong>then cannot delete the backups too</strong>.
            </li>
            <li>
              <strong>Encrypted backups</strong> (scrambled so only key holders can read them), with the keys managed
              carefully (Part 9). A backup that you cannot decrypt is useless.
            </li>
          </ul>
          <Stats
            caption="The 3-2-1 rule, plus the modern additions ransomware made necessary."
            stats={[
              { value: <>3</>, label: <>copies</>, sub: <>the original + 2 backups</> },
              { value: <>2</>, label: <>kinds of storage</>, sub: <>so one kind of failure cannot take both</> },
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
              <strong>Soft deletes:</strong> mark rows as deleted (with a <code>deleted_at</code> column) instead of
              removing them at once, so they are easy to undo.
            </li>
            <li>
              <strong>Delayed replicas:</strong> a replica that stays, on purpose, about <strong>1 hour behind</strong>.
              If a bad change happens, you can stop the replica before the change reaches it, and recover quickly.
            </li>
            <li>
              <strong>Audit logs:</strong> a record of who changed what and when, so you know <strong>what</strong> to
              restore.
            </li>
            <li>
              <strong>Safe migrations</strong> (changes to the database structure): scripts that are reviewed and tested,
              a backup taken right before a risky change, and limited direct access to production.
            </li>
          </ul>
          <h3 id="disaster-recovery-strategies">Disaster recovery strategies</h3>
          <p>
            AWS describes four common DR strategies. They go from cheapest and slowest to most expensive and fastest.
            A region is a cloud area, and a standby is a spare copy:
          </p>
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
            <strong>Infrastructure as code</strong> means describing your servers and networks in code files. Tools are
            Terraform, CloudFormation and Pulumi. It makes the cheaper strategies much faster, because you can rebuild
            whole environments from code and not from memory.
          </p>
          <h3 id="test-your-restores">Test your restores</h3>
          <p>
            <strong>A backup that you have never restored is not a backup. It is only a hope.</strong> These are common
            failures that people find only during a real emergency:
          </p>
          <ul>
            <li>backups were silently failing for months,</li>
            <li>backups were empty, partial or corrupted,</li>
            <li>
              the restore takes <strong>12 hours</strong>, far beyond the RTO,
            </li>
            <li>nobody knows the steps, or the only person who does is not available,</li>
            <li>the encryption keys or logins needed to restore are missing,</li>
            <li>
              the backup is fine, but the app cannot start because other pieces are missing (secrets, DNS, settings).
            </li>
          </ul>
          <p>Good habits:</p>
          <ul>
            <li>
              <strong>automatic restore tests</strong>. For example, restore last night's backup to a test environment
              every day and run checks on it,
            </li>
            <li>
              <strong>regular DR drills</strong>: really switch to the DR region, or rebuild from backups, and measure
              how long it takes,
            </li>
            <li>
              <strong>monitor backups</strong>: send an alert for failed or missing backups, and for backups that are
              smaller than expected,
            </li>
            <li>
              <strong>written runbooks</strong> (step-by-step guides), updated after every drill.
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Lower RPO:</strong> less data is lost, but you need more frequent backups or continuous
              replication, and it costs more.
            </li>
            <li>
              <strong>Lower RTO:</strong> faster recovery, but standby systems must run all the time, and it is more
              complex.
            </li>
            <li>
              <strong>Multi-site active-active:</strong> almost no downtime, but the highest cost, and hard problems with
              keeping data consistent (posts 24, 27–28).
            </li>
            <li>
              <strong>Long retention:</strong> you can recover from old corruption, but it costs more storage. There are
              also privacy and legal rules (compliance) about keeping personal data for a long time.
            </li>
            <li>
              <strong>Immutable, isolated backups:</strong> strong protection from ransomware and mistakes, but you must
              manage accounts, keys and lifecycle rules (rules for how long to keep data) with more care.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>GitLab (2017).</strong> During a stressful incident, an engineer accidentally deleted data from
            GitLab's primary production database. The team then found that{" "}
            <strong>several of their backup methods were not working</strong> as expected. They finally restored from
            a copy that was about <strong>six hours old</strong>, so some data was lost. GitLab live-streamed the
            recovery and published a very open postmortem (a report written after an incident). It is now a classic
            lesson: <strong>test your backups and restores</strong>.
          </p>
          <p>
            <strong>The OVHcloud data-centre fire (2021).</strong> A fire destroyed one of OVHcloud's data centres in
            Strasbourg, France, and damaged another. Customers whose backups were kept{" "}
            <strong>in the same place</strong> as their servers lost data for good. Customers with{" "}
            <strong>off-site</strong> backups could recover. It shows the 3-2-1 rule in the hardest way.
          </p>
          <p>
            <strong>Code Spaces (2014).</strong> An attacker got into the company's cloud account and{" "}
            <strong>deleted its servers, data and backups</strong>, which were all in the same account. The company shut
            down. This is why modern advice insists on <strong>isolated, immutable backups</strong> with separate
            logins.
          </p>
          <p>
            <strong>
              Pixar and <em>Toy Story 2</em>.
            </strong>{" "}
            In a famous story, a wrong command started deleting the files for <em>Toy Story 2</em> while the film was
            being made, and the backups turned out to be faulty. The film was saved because a technical director had a{" "}
            <strong>copy on her home computer</strong>. It was a lucky off-site backup, and a reminder not to count on
            luck.
          </p>
          <p>
            <strong>Managed database PITR.</strong> Cloud database services make point-in-time recovery a standard feature. Many
            teams have recovered from accidental deletes. They restored a copy of the database to "five minutes before
            the mistake" and then copied back only the affected rows.
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
                      Replication copies every change to every replica within milliseconds. This includes accidental
                      deletes, bad migrations, corruption and ransomware encryption. It protects against hardware and
                      zone failure, but not against logical mistakes. Only a backup lets you go back in time.
                    </p>
                  </>
                ),
              },
              {
                q: <>Define RPO and RTO.</>,
                a: (
                  <>
                    <p>
                      RPO (recovery point objective) is the most data loss you accept, measured backwards from the
                      disaster. RTO (recovery time objective) is the longest downtime you accept, until the service is
                      back. Lower values need more frequent backups or replication, and standby capacity.
                    </p>
                  </>
                ),
              },
              {
                q: <>How does point-in-time recovery work?</>,
                a: (
                  <>
                    <p>
                      Take base backups on a schedule and keep archiving the write-ahead log all the time. To recover,
                      restore the base backup and replay the WAL up to a chosen moment, for example one second before the
                      bad statement ran.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you protect backups from ransomware?</>,
                a: (
                  <>
                    <p>
                      Store them as immutable (object lock or WORM, which means write once, read many) in a separate,
                      isolated account with different logins. Encrypt them with carefully managed keys and keep a copy
                      off-site. Then an attacker who controls production cannot delete or encrypt them too.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you know your backups work?</>,
                a: (
                  <>
                    <p>
                      Restore them, automatically and regularly. For example, restore last night's backup into a test
                      environment every day and run checks. Send alerts for missing, failed or suspiciously small
                      backups. Time full DR drills and compare with your RTO.
                    </p>
                  </>
                ),
              },
              {
                q: <>Which DR strategy would you choose for a payments ledger?</>,
                a: (
                  <>
                    <p>
                      Aim for an RPO close to zero and an RTO of minutes. Use synchronous or near-synchronous
                      replication across zones, and a warm standby or active-active in another region. Add
                      point-in-time backups for logical errors, and run failover drills regularly.
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
