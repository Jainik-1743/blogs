import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import CommandList from "@/components/CommandList";
import InterviewQA from "@/components/InterviewQA";
import LessonIntro from "@/components/LessonIntro";
import LessonPager from "@/components/LessonPager";
import { getLesson, lessonHref } from "@/lib/lessons";

const lesson = getLesson("lesson-13")!;
const dnsLesson = getLesson("lesson-3")!;

export const metadata: Metadata = {
  title: `Lesson 13 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Concept: from a long AWS name to yourapp.com" },
  { id: "recap", label: "What Lesson 3 gave you, and what is new here" },
  { id: "alias", label: "Alias records — the AWS-only record type" },
  { id: "point", label: "Point the domain at the ALB and CloudFront" },
  { id: "routing", label: "Routing policies: simple, weighted, latency, failover" },
  { id: "health", label: "Health checks and DNS failover" },
  { id: "private", label: "Private hosted zones — names that only exist inside the VPC" },
  { id: "email", label: "Email records: MX, SPF, DKIM, DMARC" },
  { id: "cutover", label: "Moving a live domain without downtime" },
  { id: "domain-safety", label: "Protecting the domain itself" },
  { id: "cost", label: "What this costs" },
  { id: "troubleshooting", label: "Troubleshooting table" },
  { id: "interview", label: "Interview corner" },
  { id: "practice", label: "Practice task before Lesson 14" },
  { id: "conclusion", label: "Conclusion" },
];

const policies: [string, string, string][] = [
  ["Simple", "One record gives one answer (or several values, returned in random order)", "The default. One site, one destination"],
  ["Weighted", "Splits traffic by percentage, such as 90 / 10", "Canary releases (a small test group goes first), moves from an old setup, A/B tests"],
  ["Latency", "Answers with the AWS region that is fastest for the user", "The same app runs in several regions"],
  ["Failover", "The primary record answers while it is healthy. The secondary takes over if the health check fails", "A maintenance page, or a standby region"],
  ["Geolocation", "Answers by the user's country or continent", "Content for legal or regional reasons, sites in different languages"],
  ["Geoproximity / IP-based", "Chooses by distance (you can adjust it), or by the caller's IP range", "Advanced traffic control"],
];

const trouble: [string, string, string][] = [
  ["dig shows the old IP hours after the change", "DNS resolvers (the servers that look up names for users) still keep the old answer until its old TTL ends", "You should have lowered the TTL a day earlier. Run dig @8.8.8.8 and dig @ns-xxx.awsdns-xx.com to see the real (authoritative) answer"],
  ["Works on your phone, not on your laptop", "Your laptop or your internet provider's resolver has a saved answer (or a saved “does not exist” answer)", "Clear the cache: sudo dscacheutil -flushcache and sudo killall -HUP mDNSResponder (macOS), or ipconfig /flushdns (Windows). Or test with another resolver"],
  ["Cannot create a CNAME at the bare domain", "DNS does not allow a CNAME next to the other records that every bare domain has (SOA, NS)", "Use an alias A record (Route 53) on the bare domain. Use a CNAME only for subdomains"],
  ["Certificate error on the new domain", "The ACM certificate does not cover that name, is not validated, or (for CloudFront) is not in us-east-1", "Check the certificate's domain list and status. A wildcard does not cover the bare domain"],
  ["ERR_NAME_NOT_RESOLVED for a whole domain", "The nameservers at the registrar do not match the four NS values of the hosted zone, or the domain has expired", "Compare the registrar's NS list with the NS record of the hosted zone. Check the expiry date"],
  ["The bare domain works, www does not (or the other way round)", "Only one of the two records exists", "Create both. Pick one as the official address and redirect the other to it"],
  ["Weighted routing sends everything to one side", "A weight is 0, a health check is failing, or resolvers keep the old answer (caching)", "Check the weight, the record ID and the attached health check of each record"],
  ["Email stopped working after the DNS move", "The MX, SPF and DKIM records were not copied to the new hosted zone", "Export the old zone before you move. Recreate every record type, not only A"],
];

export default function LessonThirteenPage() {
  return (
    <article>
      <LessonIntro lesson={lesson} outline={outline} />

      <div className="lesson">
        <h2 id="concept">Concept</h2>
        <p>
          Your load balancer (an ALB, Application Load Balancer, is an AWS service that shares incoming web
          requests between several servers) answers at a name like{" "}
          <code>myapp-alb-1234567890.ap-south-1.elb.amazonaws.com</code>. Your CDN (CloudFront is the AWS content delivery network, a service that keeps copies of your files
          on servers around the world) answers at{" "}
          <code>d1234abcd.cloudfront.net</code>. No customer will ever type either name. This lesson
          connects <strong>your real domain</strong> to them with <strong>Route 53</strong>, the AWS
          DNS service. DNS (Domain Name System) is the system that turns a name such as{" "}
          <code>yourapp.com</code> into the IP address of a server. We also add features for
          production: routing that checks health, private internal names, email records, and a way
          to move a live domain without anyone noticing.
        </p>
        <Callout kind="note" label="The analogy — the phone book, with a smart operator">
          <p className="mb-0">
            Lesson 3 described DNS as the phone book of the internet. Route 53 is a phone book with an
            operator. The operator can give a different number depending on who is calling, which
            numbers work right now, and where the caller is. The operator can also point to AWS things
            by <em>name</em>. When the number behind the name changes, the book updates itself.
          </p>
        </Callout>

        <h2 id="recap">What Lesson 3 gave you, and what is new here</h2>
        <p>
          If any of these words feels unclear, read{" "}
          <Link href={lessonHref(dnsLesson)}>Lesson 3: {dnsLesson.title}</Link> again first. This
          lesson builds on it:
        </p>
        <ul>
          <li>
            <strong>Hosted zone</strong>: the container for all the DNS records of one domain. You
            already created one and pointed your registrar&apos;s nameservers at it. (The registrar is
            the company where you bought the domain.)
          </li>
          <li>
            <strong>Records</strong> are the entries in a zone. An <code>A</code> record points a name to
            an IP address. A <code>CNAME</code> record points a name to another name. An{" "}
            <code>MX</code> record says where to deliver mail. A <code>TXT</code> record holds free
            text, often used as a proof. An <code>NS</code> record says which servers hold the zone.{" "}
            <strong>TTL</strong> (time to live) is how many seconds an answer may be saved (cached).
          </li>
          <li>
            <strong>Wildcard record</strong>: <code>*.yourapp.com</code> answers for any subdomain, so each
            customer (tenant) can have one.
          </li>
        </ul>
        <p>New in this lesson:</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>New idea</th>
                <th>Why you need it</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Alias records</td><td>Point the bare domain at an ALB or CloudFront (a CNAME is not allowed there)</td></tr>
              <tr><td>Routing policies</td><td>Send 10% of users to a new setup, or switch to a backup</td></tr>
              <tr><td>Health checks</td><td>Stop giving out the address of something that is down</td></tr>
              <tr><td>Private hosted zones</td><td>Give the database an internal name that does not change</td></tr>
              <tr><td>Email records</td><td>Make mail from your domain reach the inbox, not spam</td></tr>
              <tr><td>Cutover procedure</td><td>Move a live domain with no downtime</td></tr>
            </tbody>
          </table>
        </div>

        <h2 id="alias">Alias records — the AWS-only record type</h2>
        <p>
          A load balancer&apos;s address is a <em>name</em>, so the obvious record is a CNAME:{" "}
          <code>yourapp.com → myapp-alb-….elb.amazonaws.com</code>. But DNS has a strict rule:{" "}
          <strong>a CNAME cannot exist next to any other record with the same name</strong>. The bare
          domain (also called the &ldquo;apex&rdquo;, <code>yourapp.com</code>) always has other
          records. It must have an <code>SOA</code> record (basic facts about the zone) and{" "}
          <code>NS</code> records, and it usually has <code>MX</code> too. So the bare domain cannot
          be a CNAME.
        </p>
        <p>
          Route 53 solves this with the <strong>Alias record</strong>. To the outside world it looks
          like an <code>A</code> record (or an <code>AAAA</code> record, which is the same thing for IPv6 addresses, the newer, longer kind). But Route 53 works it out inside, and it returns the current
          IP addresses of the AWS resource that it names.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>CNAME</th>
                <th>Alias (A / AAAA)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>Allowed at the apex</strong></td><td className="font-semibold text-red-300">No</td><td className="font-semibold text-emerald-300">Yes</td></tr>
              <tr><td><strong>Can point at</strong></td><td>Any domain name</td><td>Certain AWS resources (ALB, CloudFront, S3 website, API Gateway…) or another record in the same zone</td></tr>
              <tr><td><strong>Query cost</strong></td><td>Charged</td><td className="font-semibold text-emerald-300">Free for AWS targets</td></tr>
              <tr><td><strong>Follows IP changes</strong></td><td>Yes (extra lookup)</td><td>Yes, automatically, in a single step</td></tr>
              <tr><td><strong>TTL</strong></td><td>You choose</td><td>Set by AWS (60 s for most targets)</td></tr>
              <tr><td><strong>Can check target health</strong></td><td>No</td><td>Yes (<code>EvaluateTargetHealth</code>)</td></tr>
            </tbody>
          </table>
        </div>
        <Callout kind="ok" label="Rule of thumb">
          <p className="mb-0">
            Do you point to an AWS resource? Use <strong>Alias.</strong> Do you point to something
            outside AWS (a SaaS product, your old host)? A subdomain can use a CNAME. The bare domain
            needs an A record with an IP address.
          </p>
        </Callout>

        <h2 id="point">Point the domain at the ALB and CloudFront</h2>
        <p>
          This is what we connect: <code>yourapp.com</code> and <code>*.yourapp.com</code> go to the
          ALB (the app). <code>assets.yourapp.com</code> goes to CloudFront (Lesson 11).
        </p>
        <ol className="steps">
          <li>
            <h3>Create three alias records</h3>
            <p>
              Go to Route 53 → your hosted zone → Create record. For each record, turn on{" "}
              <strong>Alias</strong> and pick the target from the dropdown list. The console fills in
              the target&apos;s address and its hosted-zone ID for you.
            </p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Record name</th>
                    <th>Type</th>
                    <th>Alias to</th>
                    <th>Evaluate target health</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><code>yourapp.com</code></td><td>A</td><td>Application Load Balancer → <code>myapp-alb</code></td><td>Yes</td></tr>
                  <tr><td><code>*.yourapp.com</code></td><td>A</td><td>Application Load Balancer → <code>myapp-alb</code></td><td>Yes</td></tr>
                  <tr><td><code>assets.yourapp.com</code></td><td>A</td><td>CloudFront distribution (Lesson 11)</td><td>No</td></tr>
                </tbody>
              </table>
            </div>
            <ul>
              <li>
                The wildcard record does <em>not</em> cover the bare domain, so you create both records.
              </li>
              <li>
                All CloudFront distributions use the same fixed hosted-zone ID. The ID of an ALB is
                different in each region. So it is better to pick from the dropdown list than to
                type it.
              </li>
              <li>
                A change goes from <em>PENDING</em> to <em>INSYNC</em> on all Route 53 servers, usually
                within a minute.
              </li>
            </ul>
          </li>
          <li>
            <h3>Check it from the outside</h3>
            <CommandList
              title="Verify"
              commands={[
                { cmd: "dig +short acme.yourapp.com", note: "dig is a command-line tool that asks DNS servers questions. Any subdomain should answer through the wildcard with the ALB's IPs. There are several, one per AZ. You never type them, because they can change" },
                { cmd: "curl -sI https://yourapp.com", note: "You should see HTTP/2 200 and a valid certificate. The answer comes from your Auto Scaling group through the ALB" },
              ]}
            />
          </li>
          <li>
            <h3>Redirect www to the bare domain (or the reverse)</h3>
            <p>
              Create <code>www</code> as an alias to the ALB as well. Then add one{" "}
              <strong>rule on the ALB&apos;s HTTPS listener</strong>. The rule says: if the host
              header is <code>www.yourapp.com</code>, redirect (301) to <code>https://yourapp.com</code>
              and keep the path and query. Search engines treat the two names as separate sites, so
              pick one as the official name.
            </p>
          </li>
        </ol>

        <h2 id="routing">Routing policies: simple, weighted, latency, failover</h2>
        <p>
          A normal record always gives the same answer. Route 53 can choose the answer depending on
          conditions. You choose a <strong>routing policy</strong> for each record.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Policy</th>
                <th>What it does</th>
                <th>Typical use</th>
              </tr>
            </thead>
            <tbody>
              {policies.map(([p, what, use]) => (
                <tr key={p}>
                  <td className="whitespace-nowrap"><strong>{p}</strong></td>
                  <td>{what}</td>
                  <td>{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3>Weighted routing — the safest way to migrate</h3>
        <p>
          Say you have an old setup (the app on Vercel) and a new one (the ALB). Instead of moving
          everyone at once, create <strong>two records with the same name</strong>. Give each one its
          own record ID (the API calls it SetIdentifier) and a weight. Traffic is split in that
          ratio:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Record</th>
                <th>Record ID</th>
                <th>Weight</th>
                <th>Points to</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><code>yourapp.com</code> A</td><td><code>new-aws-stack</code></td><td>10</td><td>alias → the ALB</td></tr>
              <tr><td><code>yourapp.com</code> A</td><td><code>old-stack</code></td><td>90</td><td>the old host&apos;s IP, TTL 60</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Start at 10. Watch the error rate and the delay for an hour. Then go to 50, then 100, and
          then remove the old record. If anything looks wrong, set the weight to 0. A rollback takes
          as long as your TTL. This is the DNS version of a canary release (a small group of users
          tries the new version first).
        </p>
        <Callout kind="note" label="DNS load-splitting is coarse">
          <p className="mb-0">
            Weights apply to each <em>DNS answer</em>, not to each request, and resolvers save answers.
            A big office that uses one resolver all goes to the same side until the TTL ends. The
            percentages even out across many users, but they are not exact. For exact splits inside
            one setup, use ALB weighted target groups instead.
          </p>
        </Callout>

        <h2 id="health">Health checks and DNS failover</h2>
        <p>
          A Route 53 <strong>health check</strong> is a robot that runs outside your VPC, in several
          AWS locations. It requests a URL every 10 or 30 seconds. If enough of these robots see
          failures, the check turns unhealthy. Any record that is tied to it is then removed from the
          answers. Your endpoint must be reachable from the internet for this to work.
        </p>
        <p>
          Create one in Route 53 → Health checks. Use HTTPS, <code>yourapp.com</code>, the path{" "}
          <code>/api/health</code>, an interval of 30 seconds, and unhealthy after 3 failures. Then
          attach it to a record.
        </p>
        <p>
          <strong>Failover routing</strong> uses the health check. You make two records. One is marked{" "}
          <code>PRIMARY</code> (with the health check) and one is marked <code>SECONDARY</code>.
          While the primary is healthy, everyone gets it. When it fails, DNS switches to the
          secondary. A common cheap secondary is a simple{" "}
          <strong>&ldquo;we&apos;ll be right back&rdquo; page in S3 (the AWS file storage service) behind CloudFront</strong>. The
          site shows a simple page instead of failing completely, and it costs very little.
        </p>
        <Callout kind="warn" label="What DNS failover cannot do">
          <p className="mb-0">
            It is not instant. Detection takes about 90 seconds (3 failures × 30 s). Then the saved
            answers must also expire (the TTL). So expect two to five minutes. Fast failover{" "}
            <em>inside</em> one region is the ALB&apos;s job (it takes seconds). Use Route 53 failover
            when a whole setup or a whole region fails, not for one sick server. And test it: switch
            off the primary and time the change. A failover that you have not tested is only a hope,
            not a plan.
          </p>
        </Callout>

        <h2 id="private">Private hosted zones — names that only exist inside the VPC</h2>
        <p>
          A <strong>private hosted zone</strong> is a zone that is attached to a VPC. Its records
          answer only to resources inside that VPC, and the internet cannot see them. It solves a
          problem from Lesson 8. The RDS hostname (
          <code>myapp-db.abc123xyz.ap-south-1.rds.amazonaws.com</code>) is pasted into{" "}
          <code>.env</code> and SSM. When you restore a snapshot or the database fails over, the
          hostname changes, and you must edit every config.
        </p>
        <p>The fix is to give the database a name that <em>you</em> control.</p>
        <p>
          Create a private hosted zone <code>internal.yourapp.com</code> and attach it to the{" "}
          <code>myapp</code> VPC. Add one CNAME in it: <code>db.internal.yourapp.com</code> points to
          the RDS endpoint, with a TTL of 60. The app&apos;s connection string now uses{" "}
          <code>@db.internal.yourapp.com:5432</code>.
        </p>
        <p>
          Do you restore a snapshot? Update <em>one</em> record instead of the config of every server.
          The VPC needs the settings <code>enableDnsHostnames</code> and{" "}
          <code>enableDnsSupport</code> (we set the first one in Lesson 6). There is one catch. The
          RDS certificate contains the AWS hostname, not your custom name. If your database driver
          checks that the name matches, the check fails. With <code>sslmode=require</code> the
          traffic is still encrypted, but the name is not checked. Or you can give the driver the
          AWS name as the TLS server name.
        </p>

        <h2 id="email">Email records: MX, SPF, DKIM, DMARC</h2>
        <p>
          When your domain sends email (welcome messages, password resets), DNS decides whether the
          mail reaches the inbox or the spam folder. The <code>MX</code> record says where to deliver
          mail that is sent to you. Three more records prove that mail that
          claims to come from <code>yourapp.com</code> is real. <strong>SPF</strong> is a record that lists the servers allowed to send mail for your domain. <strong>DKIM</strong> is a record that holds a public key, so receivers can check that a message was signed by you. <strong>DMARC</strong> is a record that tells receivers what to do with mail that fails SPF or DKIM. Amazon SES is the AWS service for
          sending email:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Record</th>
                <th>Says</th>
                <th>Example</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>MX</strong></td>
                <td>Where to <em>deliver</em> mail that is sent to you</td>
                <td><code>10 inbound-smtp.ap-south-1.amazonaws.com</code> or your Google/Zoho mail servers</td>
              </tr>
              <tr>
                <td><strong>SPF</strong> (TXT at the apex)</td>
                <td>Which servers may <em>send</em> mail as your domain</td>
                <td><code>&quot;v=spf1 include:amazonses.com ~all&quot;</code></td>
              </tr>
              <tr>
                <td><strong>DKIM</strong> (CNAMEs from your sender)</td>
                <td>A public key, so receivers can check the digital signature of each message</td>
                <td>three CNAMEs that SES (or your mail provider) gives you</td>
              </tr>
              <tr>
                <td><strong>DMARC</strong> (TXT at <code>_dmarc</code>)</td>
                <td>What to do when SPF or DKIM checks fail, and where to send reports</td>
                <td><code>&quot;v=DMARC1; p=none; rua=mailto:dmarc@yourapp.com&quot;</code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout kind="note" label="The safe order">
          <p className="mb-0">
            Start DMARC with <code>p=none</code> (only watch). Read the reports for a few weeks to find
            every sender that is allowed. Then change to <code>quarantine</code> (send failing mail
            to spam) and finally to <code>reject</code> (refuse failing mail). If you jump straight to{" "}
            <code>reject</code>, your own invoices can disappear without a sign. Amazon SES and
            similar services give you the exact records to paste. Your job is to know where they go
            and why.
          </p>
        </Callout>

        <h2 id="cutover">Moving a live domain without downtime</h2>
        <p>
          Here is the situation. The site runs on Vercel (or an old host) and you are moving it to this
          AWS setup. DNS is where downtime can sneak in, because old answers stay in caches. A
          runbook (a list of steps to follow) for this move looks like this:
        </p>
        <ol className="steps">
          <li>
            <h3>Two days before: copy everything and lower the TTL</h3>
            <p>
              Export the existing zone. Recreate <em>every</em> record type in the Route 53 hosted zone:
              MX, TXT, and verification CNAMEs, not only the A record. Then lower the TTL of the
              records that will change to <strong>60 seconds</strong>. Wait at least as long as the{" "}
              <em>old</em> TTL, so that the change reaches everywhere. This one step makes the
              switch fast and easy to undo.
            </p>
          </li>
          <li>
            <h3>Test the new setup for real before anyone is sent to it</h3>
            <CommandList
              title="Bypass DNS and talk to the ALB directly"
              commands={[
                { cmd: "curl -sI --resolve yourapp.com:443:<ALB-IP> https://yourapp.com/", note: "Sends the request for yourapp.com to one of the ALB's IPs, and the certificate still checks out. Test login, uploads and every important page. No DNS change is needed" },
              ]}
            />
          </li>
          <li>
            <h3>Cut over — weighted first if you can</h3>
            <p>
              Change the nameservers at the registrar to the four Route 53 NS values only if the zone is{" "}
              <em>completely</em> ready. If it is not, change only the records. Use the weighted
              move from above (10, then 50, then 100), or switch the record at a quiet hour.
            </p>
          </li>
          <li>
            <h3>Watch, keep the old stack, then raise the TTL</h3>
            <p>
              Keep the old host running for at least the old TTL plus one day. Users behind resolvers
              with old saved answers still reach it. Watch the 5xx rate and the delay on the ALB.
              When all is stable, raise the TTL again to 300–3600 seconds. This lowers query costs
              and speeds up lookups. Only then turn off the old setup.
            </p>
          </li>
        </ol>
        <Callout kind="ok" label="The TTL trade-off in one line">
          <p className="mb-0">
            A low TTL means changes work fast, but there are more queries and the first lookups are a
            little slower. A high TTL is the opposite. Use <strong>a high TTL most of the time and a
            low TTL around changes</strong>.
          </p>
        </Callout>

        <h2 id="domain-safety">Protecting the domain itself</h2>
        <p>
          A perfect setup is worth nothing if someone else controls the domain. Real incidents come
          from the boring parts:
        </p>
        <ul>
          <li>
            <strong>Expiry.</strong> Turn on auto-renew and keep a valid payment method. Companies have
            lost domains because a card expired. Also put the expiry date in a calendar.
          </li>
          <li>
            <strong>Security of the registrar account.</strong> The account that owns the domain has the
            highest power. Use MFA (a second login step, such as a code from an app). Use a shared
            team mailbox, not one person&apos;s address, as the contact. Do not reuse passwords.
            Whoever controls this account controls all your DNS.
          </li>
          <li>
            <strong>Domain lock and privacy.</strong> Turn on the transfer lock, which stops anyone from
            moving the domain away. WHOIS privacy hides your personal details from the public
            registration database. Route 53 Domains includes it for free on most TLDs (a TLD is the
            ending, such as .com).
          </li>
          <li>
            <strong>Dangling records.</strong> A dangling record points to something that no longer
            exists. For example, it may point to an S3 bucket, an ELB or a third-party service that
            you deleted. Someone else can claim that name and take over your subdomain. This is
            called a &ldquo;subdomain takeover&rdquo;. Delete the DNS record when you delete the
            resource behind it.
          </li>
          <li>
            <strong>CAA record.</strong> This is a short record that limits which certificate
            authorities (the companies that issue certificates) may issue certificates for your
            domain. Examples: <code>0 issue &quot;amazon.com&quot;</code> and{" "}
            <code>0 issue &quot;letsencrypt.org&quot;</code>.
          </li>
          <li>
            <strong>DNSSEC</strong> adds digital signatures to your DNS answers, so nobody can fake
            them. Route 53 supports it. But it adds risk: one mistake with a key can make the domain
            stop working. Turn it on on purpose, after you understand it. Do not turn it on just
            because it exists.
          </li>
        </ul>

        <h2 id="cost">What this costs</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Item</th><th>Approx. price</th></tr>
            </thead>
            <tbody>
              <tr><td>Hosted zone (public or private)</td><td>$0.50 per month each</td></tr>
              <tr><td>Standard queries</td><td>$0.40 per million</td></tr>
              <tr><td>Alias queries to ALB / CloudFront / S3</td><td className="font-semibold text-emerald-300">Free</td></tr>
              <tr><td>Health check (basic)</td><td>~$0.50–$2.00 per month each, depending on options (HTTPS and fast checks cost extra)</td></tr>
              <tr><td>Domain registration</td><td>Depends on the TLD: .com is about $14–15 a year. Check the current price for others</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          The whole DNS part of this project costs roughly <strong>$1–3 a month</strong> plus the
          domain fee. It is the cheapest part of the setup, and it gives you a lot of control.
        </p>

        <h2 id="troubleshooting">Troubleshooting table</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Symptom</th>
                <th>Likely cause</th>
                <th>Fix</th>
              </tr>
            </thead>
            <tbody>
              {trouble.map(([s, c, f]) => (
                <tr key={s}>
                  <td>{s}</td>
                  <td>{c}</td>
                  <td>{f}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3>Two lookups that solve most DNS problems</h3>
        <CommandList
          title="Debugging DNS"
          commands={[
            { cmd: "dig NS yourapp.com +short", note: "Which nameservers does the world think are in charge? The answer must equal the NS record of the hosted zone. A mismatch is the #1 cause of “my records don't work”" },
            { cmd: "dig @ns-123.awsdns-45.org yourapp.com", note: "Ask Route 53 directly. You get the real answer and no cache is used. If this answer is right but users still see old answers, the cause is the TTL. Wait" },
          ]}
        />
        <p>
          Use these together with <code>dig +trace</code> and a question to a public resolver (Lesson
          3). They solve almost every DNS problem.
        </p>

        <h2 id="interview">Interview corner</h2>
        <InterviewQA
          items={[
            {
              q: "Why can't you put a CNAME on the root domain, and what does Route 53 do instead?",
              a: (
                <p className="mb-0">
                  A CNAME cannot exist next to other records with the same name, and the bare domain must
                  have SOA and NS records (and often MX). Route 53 offers alias records instead. They
                  look like A or AAAA records, and Route 53 works out the current IPs of the AWS
                  resource inside. They are allowed on the bare domain, and queries to them are
                  free.
                </p>
              ),
            },
            {
              q: "How would you migrate a production site to a new host with no downtime?",
              a: (
                <p className="mb-0">
                  I recreate all records and lower the TTLs well before the move. I test the new setup
                  directly with <code>curl --resolve</code>. I move traffic step by step with weighted
                  records and watch the results. I keep the old setup running for at least the old
                  TTL. Then I raise the TTLs again and switch the old setup off.
                </p>
              ),
            },
            {
              q: "What is a private hosted zone used for?",
              a: (
                <p className="mb-0">
                  It holds internal names that work only inside the VPCs that are attached to it, such as{" "}
                  <code>db.internal.example.com</code>. Applications no longer depend on endpoint
                  names that AWS generates, and the internal layout stays out of public DNS.
                </p>
              ),
            },
            {
              q: "Explain Route 53 failover routing and its limits.",
              a: (
                <p className="mb-0">
                  There is a primary and a secondary record, with a health check on the primary. If the
                  check fails, Route 53 answers with the secondary. The time it needs is the detection
                  time plus the TTL of the saved answers. That means minutes, not seconds. So it suits
                  the failure of a whole site or region, not a problem with one server.
                </p>
              ),
            },
            {
              q: "Users in one office still reach the old server after your DNS change. Why?",
              a: (
                <p className="mb-0">
                  Their resolver keeps the old answer until the previous TTL ends (some resolvers also
                  ignore low TTLs). I ask the authoritative server (the nameserver that holds the real records, not a cache) to confirm that
                  the change is live. For future changes, I lower the TTL beforehand.
                </p>
              ),
            },
            {
              q: "What are SPF, DKIM and DMARC?",
              a: (
                <p className="mb-0">
                  SPF lists the servers that may send mail for the domain. DKIM signs messages with a key
                  that is published in DNS. DMARC sets the policy (none, quarantine or reject) and the
                  reports for mail that fails those checks. Together they stop faked mail
                  (spoofing) and help mail reach the inbox.
                </p>
              ),
            },
            {
              q: "What is a subdomain takeover?",
              a: (
                <p className="mb-0">
                  A DNS record still points to a cloud resource that was deleted (a bucket, an app, an
                  ELB). An attacker claims that resource name and can then serve content on your
                  subdomain. You prevent it by deleting DNS records together with the resources they
                  point to.
                </p>
              ),
            },
          ]}
        />

        <hr />

        <h2 id="practice">Practice task before Lesson 14</h2>
        <ol>
          <li>
            Create alias records for the apex, <code>*</code> and <code>www</code> pointing at the
            ALB, and <code>assets</code> pointing at CloudFront. Verify each with <code>dig</code>{" "}
            and <code>curl</code>.
          </li>
          <li>
            Add the ALB rule that redirects <code>www</code> to the bare domain and confirm the
            301 with <code>curl -I</code>.
          </li>
          <li>
            Create two weighted records for a test subdomain (<code>canary.yourapp.com</code>). Point
            one to the ALB and one to a plain IP, with weights 50/50. Look it up many times in a row
            and watch the split (and the caching).
          </li>
          <li>
            Create a Route 53 health check on <code>/api/health</code>. Stop the app on every server
            (or temporarily change the target group path), and watch the health check turn
            unhealthy in the console.
          </li>
          <li>
            Create the private hosted zone, add <code>db.internal.yourapp.com</code>, and from an EC2
            server run <code>dig +short db.internal.yourapp.com</code>. From your laptop the same
            command should return nothing.
          </li>
          <li>
            Write down the cutover runbook for your own domain in six bullet points. Include the TTL
            you would set and when.
          </li>
        </ol>
        <Callout kind="ok" label="Optional stretch">
          <p className="mb-0">
            Add a CAA record and an SPF + DMARC (<code>p=none</code>) record. Then check the result
            with a public tool such as mxtoolbox.com or Google&apos;s Admin Toolbox.
          </p>
        </Callout>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          Route 53 is where the long AWS names become your own brand. It also gives you safe tools for
          changing things in production.
        </p>
        <ul>
          <li>
            <strong>Alias records</strong> for anything in AWS, including the bare domain, where a CNAME
            is not allowed.
          </li>
          <li>
            <strong>Routing policies</strong> turn DNS into a traffic tool: weighted records for step by
            step moves, failover for outages of a whole site.
          </li>
          <li>
            <strong>Private zones</strong> give internal resources names that stay the same after
            restores and failovers.
          </li>
          <li>
            <strong>Email needs its own records</strong> (MX, SPF, DKIM, DMARC), and every record type
            must move with the zone.
          </li>
          <li>
            <strong>TTL is your rollback speed.</strong> Keep it low around changes and high the rest of
            the time. Test with <code>--resolve</code> before you switch.
          </li>
        </ul>
        <p>
          The whole setup is now live on your own domain. But you built it by hand, and you deploy by
          logging in over SSH. Now it is time to automate the release with CI/CD.
        </p>

        <hr />
        <p>
          End of Lesson 13. Next: <strong>Lesson 14 — CI/CD with GitHub Actions</strong>.
        </p>
      </div>

      <LessonPager slug={lesson.slug} />
    </article>
  );
}
