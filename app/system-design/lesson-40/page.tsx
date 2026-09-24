import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import { Compare, Flow, QA, Stats } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-40")!;

export const metadata: Metadata = {
  title: `Lesson 40 — ${lesson.title}`,
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

export default function SdLessonFourZeroPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>Your architecture diagram looks solid:</p>
          <ul>
            <li>a load balancer,</li>
            <li>five app servers,</li>
            <li>a Redis cache,</li>
            <li>a PostgreSQL primary with a replica.</li>
          </ul>
          <p>
            Then one night, the whole site goes down. The cause turns out to be none of those boxes. It's the{" "}
            <strong>one NAT gateway</strong> that all outbound traffic goes through. Or the{" "}
            <strong>one DNS provider</strong>. Or an <strong>expired certificate</strong>. Or the{" "}
            <strong>one engineer</strong> who knew how to restart the payment integration, who is on holiday.
          </p>
          <p>
            In post 9 we learned how availability "adds up". In this series we learn how to{" "}
            <strong>build systems that keep working when parts break</strong>. Step one is finding every{" "}
            <strong>single point of failure (SPOF)</strong>, then adding <strong>redundancy</strong> and{" "}
            <strong>failover</strong> that actually work.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            A <strong>single point of failure</strong> is any part whose failure{" "}
            <strong>takes the whole system (or a critical feature) down</strong>.
          </p>
          <p>
            Think about a <strong>hospital</strong>:
          </p>
          <ul>
            <li>
              It has <strong>backup generators</strong> in case the power grid fails.
            </li>
            <li>
              <strong>Several doctors</strong> are on call, not just one.
            </li>
            <li>
              There are <strong>two roads</strong> in, in case one is blocked.
            </li>
            <li>
              <strong>Oxygen supply</strong> comes from a main tank <em>and</em> backup cylinders.
            </li>
            <li>
              And they <strong>test</strong> the generators regularly. A backup that doesn't start when needed is worse
              than useless, because it gave false confidence.
            </li>
          </ul>
          <p>
            Reliable systems follow the same rules:{" "}
            <strong>find the SPOFs, add a spare, make switching to the spare automatic, and test it regularly.</strong>
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="step-1-find-the-spofs">Step 1: Find the SPOFs</h3>
          <p>
            Walk the <strong>path of a request</strong> (post 11) and ask of every box and arrow:{" "}
            <strong>"What happens if this dies right now?"</strong>
          </p>
          <Flow
            caption="Walk the request path and ask of every box: what happens if this dies right now?"
            nodes={[
              { title: <>User</> },
              { title: <>DNS</>, desc: <>one provider? → nobody can find you</> },
              { title: <>CDN · Load balancer</>, desc: <>one instance? one zone?</> },
              { title: <>App servers</>, desc: <>stateless and N+1?</> },
              { title: <>Cache</>, desc: <>can the database survive without it?</> },
              { title: <>Database</>, desc: <>automatic failover — and tested?</>, tone: "warn" },
              {
                title: <>Payment · email · object storage</>,
                desc: <>third parties need fallbacks or buffers</>,
                tone: "warn",
              },
            ]}
          />
          <p>Obvious SPOFs:</p>
          <ul>
            <li>a single database primary (without automatic failover),</li>
            <li>a single load balancer,</li>
            <li>a single app server,</li>
            <li>
              everything running in <strong>one availability zone</strong> or <strong>one region</strong>.
            </li>
          </ul>
          <p>
            <strong>Hidden SPOFs, which cause many real outages:</strong>
          </p>
          <ul>
            <li>
              <strong>DNS provider</strong>: one provider down means nobody can find you (post 1).
            </li>
            <li>
              <strong>Certificates</strong>: one expired certificate breaks HTTPS for everyone (post 3).
            </li>
            <li>
              <strong>NAT gateway, VPN or firewall</strong>: one box that all traffic must pass through.
            </li>
            <li>
              <strong>Configuration or feature-flag service</strong>: if every service needs it to start, it can block
              recovery.
            </li>
            <li>
              <strong>Authentication service</strong>: if it's down, nobody can log in, even though everything else
              works.
            </li>
            <li>
              <strong>A shared database or cache used by "independent" services.</strong>
            </li>
            <li>
              <strong>Third-party APIs</strong>: payments, SMS, maps.
            </li>
            <li>
              <strong>The deploy pipeline</strong>: you can't ship the fix if CI/CD is down.
            </li>
            <li>
              <strong>People and knowledge</strong>: "only Ravi knows how this works."
            </li>
            <li>
              <strong>The monitoring system</strong>: if it runs on the same infrastructure, it goes down <em>with</em>{" "}
              the thing it should alert you about.
            </li>
          </ul>
          <h3 id="step-2-understand-blast-radius">Step 2: Understand blast radius</h3>
          <p>
            Not every failure is equal. <strong>Blast radius</strong> is how much of the system (and how many users) one
            failure affects.
          </p>
          <p>Ways to shrink it:</p>
          <ul>
            <li>
              <strong>Isolate features.</strong> If recommendations fail, checkout should keep working (post 44).
            </li>
            <li>
              <strong>Cells.</strong> Split the system into several <strong>independent copies</strong> (cells), each
              serving a subset of customers. A bad deploy or overload in cell 3 affects only cell 3's customers.
            </li>
            <li>
              <strong>Shuffle sharding.</strong> Give each customer a random <strong>combination</strong> of servers. If
              one customer sends "poison" traffic that kills its servers, very few other customers share{" "}
              <strong>exactly</strong> the same combination, so they're barely affected.
            </li>
          </ul>
          <Compare
            caption="Why shuffle sharding shrinks the blast radius of a bad customer."
            columns={[
              {
                title: <>Normal sharding (4 shards)</>,
                items: [
                  { sign: "·", text: <>A and B share shard 1</> },
                  { sign: "-", text: <>A's poison traffic kills shard 1 → B is down too</> },
                ],
              },
              {
                title: <>Shuffle sharding (2 of 8 servers each)</>,
                items: [
                  { sign: "·", text: <>A → 1, 5 B → 2, 7 C → 1, 7</> },
                  { sign: "+", text: <>A kills 1 and 5 → B unaffected, C loses only one server</> },
                  { sign: "+", text: <>Few customers share exactly the same pair</> },
                ],
              },
            ]}
          />
          <h3 id="step-3-add-redundancy">Step 3: Add redundancy</h3>
          <p>
            <strong>Redundancy</strong> means having <strong>more than one</strong> of anything critical.
          </p>
          <p>
            <strong>Redundancy at every layer:</strong>
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Layer</th>
                  <th>Redundancy</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>DNS</td>
                  <td>Two DNS providers, or a highly redundant managed DNS</td>
                </tr>
                <tr>
                  <td>Edge</td>
                  <td>CDN (itself globally redundant), or even two CDNs</td>
                </tr>
                <tr>
                  <td>Load balancer</td>
                  <td>Pair with floating IP, or a managed multi-zone LB</td>
                </tr>
                <tr>
                  <td>App servers</td>
                  <td>N+1 or more stateless servers across zones (post 7)</td>
                </tr>
                <tr>
                  <td>Cache</td>
                  <td>Replicas / cluster; app survives cache loss (post 16)</td>
                </tr>
                <tr>
                  <td>Database</td>
                  <td>Primary + replicas in different zones with automatic failover (post 24)</td>
                </tr>
                <tr>
                  <td>Storage</td>
                  <td>Object storage replicated across zones (post 17)</td>
                </tr>
                <tr>
                  <td>Data centre</td>
                  <td>
                    Multiple <strong>availability zones</strong>
                  </td>
                </tr>
                <tr>
                  <td>Region</td>
                  <td>Multi-region for the most critical systems</td>
                </tr>
                <tr>
                  <td>Dependencies</td>
                  <td>Backup providers (a second SMS/email provider), queues to buffer outages</td>
                </tr>
                <tr>
                  <td>People</td>
                  <td>Documented runbooks, on-call rotations, shared knowledge</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>Capacity planning: N+1 and N+2.</strong>
          </p>
          <ul>
            <li>
              <strong>N</strong> = the number of servers needed to handle peak load.
            </li>
            <li>
              <strong>N+1</strong> = one extra, so you can lose one server (or take one down to deploy) without
              overload.
            </li>
            <li>
              <strong>N+2</strong> = survive a failure <strong>during</strong> maintenance.
            </li>
          </ul>
          <p>
            <strong>Zone math.</strong> If you run in <strong>3 availability zones</strong> and must survive losing{" "}
            <strong>one</strong>, the remaining 2 must handle 100% of traffic. So each zone needs capacity for{" "}
            <strong>50% of peak</strong>, which means <strong>150% of peak</strong> in total. With only{" "}
            <strong>2 zones</strong>, each needs <strong>100%</strong>, so you pay double. That's why three zones is a
            common sweet spot.
          </p>
          <h3 id="step-4-failover-switching-to-the-spare">Step 4: Failover, switching to the spare</h3>
          <p>
            Redundancy is only useful if traffic <strong>moves</strong> to the healthy copy.
          </p>
          <p>
            <strong>Active-passive (hot, warm, cold standby):</strong>
          </p>
          <Compare
            caption="Two ways to run a spare."
            columns={[
              {
                title: <>Active-passive</>,
                items: [
                  { sign: "·", text: <>Active takes all traffic; passive waits</> },
                  { sign: "·", text: <>Hot (seconds) · warm (minutes) · cold (hours)</> },
                  { sign: "+", text: <>Simple data story: one writer</> },
                  { sign: "-", text: <>Idle hardware; failover must be detected and executed</> },
                ],
              },
              {
                title: <>Active-active</>,
                items: [
                  { sign: "·", text: <>Both serve traffic all the time</> },
                  { sign: "+", text: <>No idle hardware; near-instant failover</> },
                  { sign: "-", text: <>Each node needs headroom for the other's load</> },
                  { sign: "-", text: <>Two writers means conflicts to resolve</> },
                ],
              },
            ]}
          />
          <ul>
            <li>
              <strong>Hot standby:</strong> running and in sync, so it takes over in seconds.
            </li>
            <li>
              <strong>Warm standby:</strong> running but smaller, or slightly behind. It takes minutes, and may need
              scaling up.
            </li>
            <li>
              <strong>Cold standby:</strong> not running. It must be started and restored, which takes hours.
            </li>
          </ul>
          <p>
            <strong>Active-active:</strong>
          </p>
          <Stats
            caption="Zone maths — capacity needed to survive losing one availability zone."
            stats={[
              { value: <>2 zones</>, label: <>100% each</>, sub: <>200% of peak in total</> },
              { value: <>3 zones</>, label: <>50% each</>, sub: <>150% of peak — the common sweet spot</> },
              { value: <>N+1</>, label: <>one spare</>, sub: <>survive a failure or a deploy</> },
              { value: <>N+2</>, label: <>two spares</>, sub: <>survive a failure during maintenance</> },
            ]}
          />
          <ul>
            <li>✅ No idle hardware, and failover is almost instant because both are already serving.</li>
            <li>
              ❌ For data, both accepting writes means <strong>conflicts</strong> (multi-leader, post 24). Each node
              must have <strong>spare capacity</strong> to absorb the other's load.
            </li>
          </ul>
          <h3 id="failure-detection-the-hard-part">Failure detection: the hard part</h3>
          <p>
            How do you know something has <strong>failed</strong>?
          </p>
          <ul>
            <li>
              <strong>Health checks</strong> and <strong>heartbeats</strong> (post 12).
            </li>
            <li>
              <strong>Timeouts</strong>: "no heartbeat for 10 seconds means dead".
            </li>
          </ul>
          <p>The trade-off:</p>
          <ul>
            <li>
              <strong>Detect too slowly:</strong> users see errors for longer.
            </li>
            <li>
              <strong>Detect too eagerly:</strong> a brief network blip or a long garbage-collection pause triggers{" "}
              <strong>unnecessary failover</strong>, which itself causes disruption. The system can also{" "}
              <strong>flap</strong> back and forth.
            </li>
          </ul>
          <p>
            <strong>Split brain</strong> (post 24): the "dead" node was actually alive but cut off, and now{" "}
            <strong>two</strong> nodes both think they're in charge. Prevent it with:
          </p>
          <ul>
            <li>
              <strong>quorum</strong>: only the side with a <strong>majority</strong> can act (etcd, ZooKeeper, Raft),
            </li>
            <li>
              <strong>fencing</strong>: make sure the old primary can no longer write (revoke its access, power it off,
              or use fencing tokens).
            </li>
          </ul>
          <h3 id="automatic-vs-manual-failover">Automatic vs manual failover</h3>
          <ul>
            <li>
              <strong>Automatic:</strong> fast (seconds), works at 3 AM, and needed for high availability targets.{" "}
              <strong>But</strong> a bad detector can fail over when it shouldn't, and cascading automation can make an
              incident worse.
            </li>
            <li>
              <strong>Manual:</strong> a human confirms the situation first, which is safer for complex cases.{" "}
              <strong>But</strong> it's slow, and depends on someone being awake and knowing what to do.
            </li>
          </ul>
          <p>
            Many teams <strong>automate common, well-understood failovers</strong> (a database replica promotion within
            a region), and keep <strong>human approval</strong> for big, risky ones (moving everything to another
            region).
          </p>
          <h3 id="static-stability">Static stability</h3>
          <p>
            A statically stable system <strong>keeps working during a failure without needing to make changes</strong>.
            For example:
          </p>
          <ul>
            <li>
              <strong>pre-provision</strong> enough capacity in each zone, so losing a zone doesn't require launching
              new servers (the control plane that launches servers might be affected too),
            </li>
            <li>
              <strong>cache configuration locally</strong>, so services keep running if the configuration service is
              down,
            </li>
            <li>
              make sure <strong>recovery doesn't depend on the thing that failed</strong>.
            </li>
          </ul>
          <h3 id="step-5-test-it-regularly">Step 5: Test it, regularly</h3>
          <p>
            Untested failover <strong>usually fails</strong> when you need it. Common approaches:
          </p>
          <ul>
            <li>
              <strong>Game days:</strong> planned exercises where the team deliberately breaks something (like failing
              over the database) and practises the response.
            </li>
            <li>
              <strong>Chaos engineering:</strong> deliberately inject failures (kill servers, add latency, cut network
              links) in a controlled way, ideally in production, to prove the system copes.
            </li>
            <li>
              <strong>Disaster recovery drills:</strong> actually restore from backups, and actually fail over regions
              (post 45).
            </li>
            <li>
              <strong>Runbooks:</strong> written, step-by-step instructions for each failure scenario, kept up to date
              after every drill and incident.
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>More redundancy:</strong> higher availability, but <strong>more cost</strong> (spare capacity,
              extra zones or regions) and <strong>more complexity</strong>.
            </li>
            <li>
              <strong>Complexity is itself a risk.</strong> Failover systems can have bugs, and many big outages were{" "}
              <strong>caused or worsened</strong> by automation meant to protect the system.
            </li>
            <li>
              <strong>Active-active:</strong> no wasted capacity and instant failover, but harder data consistency, and
              every node needs headroom.
            </li>
            <li>
              <strong>Fast failure detection:</strong> quick recovery, but more false positives and flapping.
            </li>
            <li>
              <strong>Multi-region:</strong> survives region failures, but is expensive, and makes data replication and
              consistency much harder (posts 24, 27–28).
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Netflix and Chaos Monkey.</strong> Netflix built <strong>Chaos Monkey</strong>, a tool that randomly
            terminates production server instances during working hours, to force every team to build services that
            survive losing any server. It later extended the idea to larger failures, including simulating the loss of
            an entire AWS region. Its "Simian Army" helped popularise <strong>chaos engineering</strong> across the
            industry.
          </p>
          <p>
            <strong>Big cloud region outages.</strong> Major cloud providers have had significant regional incidents.
            For example, AWS's US-East-1 region has had several widely felt outages over the years, including one in
            October 2025 where a DNS-related problem affecting DynamoDB cascaded to many other services. Companies
            running everything in a single region went down. Companies with <strong>multi-region failover</strong> or{" "}
            <strong>static stability</strong> stayed up or recovered faster. These events are the main reason large
            companies invest in multi-region designs.
          </p>
          <p>
            <strong>Certificate expiry outages.</strong> As in post 3, Microsoft Teams (2020) and O2's UK mobile network
            (2018, via Ericsson software) suffered outages from expired certificates. A certificate is a classic hidden
            SPOF, and the fix is automated renewal plus monitoring of expiry dates.
          </p>
          <p>
            <strong>Dyn DNS attack (2016).</strong> When the DNS provider Dyn was hit by a massive attack, many sites
            that relied <strong>only</strong> on Dyn became unreachable. Many companies added a{" "}
            <strong>second DNS provider</strong> afterwards (post 1).
          </p>
          <p>
            <strong>AWS cells and shuffle sharding.</strong> AWS has written about using{" "}
            <strong>cell-based architecture</strong> and <strong>shuffle sharding</strong> in its own services, so that
            a failure or a misbehaving customer affects only a small slice of users rather than everyone.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>How do you find single points of failure?</>,
                a: (
                  <>
                    <p>
                      Walk the full request path and every dependency, asking “what if this dies now?” Include the
                      hidden ones: DNS, certificates, NAT gateways, config and auth services, shared databases,
                      third-party APIs, the deploy pipeline, monitoring on the same infrastructure, and people who hold
                      unique knowledge.
                    </p>
                  </>
                ),
              },
              {
                q: <>Active-passive vs active-active?</>,
                a: (
                  <>
                    <p>
                      Active-passive keeps a standby (hot, warm or cold) that takes over on failure — simpler for data,
                      but it idles and failover must work. Active-active serves traffic on all nodes, so failover is
                      near-instant and no hardware idles, but each node needs headroom and multi-writer data needs
                      conflict handling.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is split brain, and how do you prevent it?</>,
                a: (
                  <>
                    <p>
                      Two nodes both act as primary after a partition. Prevent it with quorum (only a majority side may
                      act, via Raft or etcd) and fencing (revoke the old primary's access, power it off, or reject its
                      stale fencing tokens).
                    </p>
                  </>
                ),
              },
              {
                q: <>What is static stability?</>,
                a: (
                  <>
                    <p>
                      A system that keeps working through a failure without having to change anything — pre-provisioned
                      capacity in every zone, locally cached configuration, and recovery that doesn't depend on the
                      control plane that might itself be failing.
                    </p>
                  </>
                ),
              },
              {
                q: <>How much capacity do you need to survive losing one of three zones?</>,
                a: (
                  <>
                    <p>
                      The two remaining zones must carry 100% of peak, so each zone needs 50% of peak — 150% of peak in
                      total, versus 200% with only two zones.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you know your failover works?</>,
                a: (
                  <>
                    <p>
                      You test it: scheduled game days, chaos experiments in production, real restores and region
                      failovers, and runbooks updated after every drill. Untested redundancy usually fails when it's
                      needed.
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
              A <strong>single point of failure</strong> is anything whose loss takes down the system.{" "}
              <strong>Walk the request path</strong> and hunt for hidden ones: DNS, certificates, NAT, config, auth,
              shared databases, third parties, people.
            </li>
            <li>
              <strong>Shrink the blast radius</strong> with isolation, <strong>cells</strong> and{" "}
              <strong>shuffle sharding</strong>.
            </li>
            <li>
              Add <strong>redundancy at every layer</strong>, and plan capacity (<strong>N+1</strong>, and zone math: 3
              zones → 150% total capacity).
            </li>
            <li>
              <strong>Failover</strong> can be active-passive (hot, warm, cold) or active-active. Detection is the hard
              part, so guard against <strong>false positives</strong> and <strong>split brain</strong> with quorum and
              fencing.
            </li>
            <li>
              Aim for <strong>static stability</strong>, and <strong>test failover regularly</strong> (game days, chaos
              engineering, drills). Untested redundancy is only hope.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              The AWS Builders' Library articles "Static stability using Availability Zones" and "Workload isolation
              using shuffle-sharding"
            </li>
            <li>
              AWS Well-Architected Framework (the Reliability pillar) and AWS's guidance on cell-based architecture
            </li>
            <li>
              <em>Site Reliability Engineering</em> by Google (chapters on "Addressing Cascading Failures" and "Managing
              Critical State")
            </li>
            <li>"Principles of Chaos Engineering" (the manifesto from the chaos engineering community)</li>
            <li>Netflix Tech Blog posts on the Simian Army and Chaos Monkey</li>
            <li>The System Design Primer on GitHub (section "Availability patterns")</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
