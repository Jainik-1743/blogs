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
  ["Simple", "One record, one answer (or several values, returned in random order)", "The default. One site, one destination"],
  ["Weighted", "Split traffic by percentage: 90 / 10", "Canary releases, migrations from an old stack, A/B tests"],
  ["Latency", "Answer with the AWS region that is fastest for the user", "The same app deployed in several regions"],
  ["Failover", "Primary answers while healthy; secondary takes over if the health check fails", "A maintenance page or a standby region"],
  ["Geolocation", "Answer by the user's country or continent", "Legal/regional content, language sites"],
  ["Geoproximity / IP-based", "Bias by distance, or by the caller's IP range", "Advanced traffic engineering"],
];

const trouble: [string, string, string][] = [
  ["dig shows the old IP hours after the change", "Resolvers still cache the old answer for its previous TTL", "You should have lowered the TTL a day earlier. Check with dig @8.8.8.8 and dig @ns-xxx.awsdns-xx.com to see the authoritative answer"],
  ["Works on your phone, not on your laptop", "Your laptop/ISP resolver has a cached (or negative-cached) answer", "sudo dscacheutil -flushcache (macOS) / ipconfig /flushdns (Windows), or test with another resolver"],
  ["Cannot create a CNAME at the bare domain", "DNS forbids a CNAME beside the other records every apex has (SOA, NS)", "Use an alias A record (Route 53) at the apex; CNAME only for subdomains"],
  ["Certificate error on the new domain", "ACM certificate does not cover that name, is not validated, or (CloudFront) is not in us-east-1", "Check the certificate's domain list and status; wildcard does not cover the apex"],
  ["ERR_NAME_NOT_RESOLVED for a whole domain", "Registrar nameservers do not match the hosted zone’s four NS values, or the domain expired", "Compare the registrar's NS list to the hosted zone NS record; check domain expiry"],
  ["Subdomain works, www does not (or vice versa)", "Only one of the two records was created", "Create both, and pick one as the canonical, redirecting the other"],
  ["Weighted routing sends everything to one side", "Records lack distinct SetIdentifiers, a weight is 0, or a health check is failing", "Inspect each record's weight, identifier and attached health check"],
  ["Email stopped working after the DNS move", "MX/SPF/DKIM records were not copied to the new hosted zone", "Export the old zone before moving; recreate every record type, not just A"],
];

export default function LessonThirteenPage() {
  return (
    <article>
      <LessonIntro lesson={lesson} outline={outline} />

      <div className="lesson">
        <h2 id="concept">Concept</h2>
        <p>
          Your load balancer answers at a name like{" "}
          <code>myapp-alb-1234567890.ap-south-1.elb.amazonaws.com</code>. Your CDN answers at{" "}
          <code>d1234abcd.cloudfront.net</code>. No customer will ever type either. This lesson
          connects <strong>your real domain</strong> to them with <strong>Route 53</strong>, AWS&apos;s
          DNS service, and adds the production features around it: health-checked routing, private
          internal names, email records, and how to move a live domain without anyone noticing.
        </p>
        <Callout kind="note" label="The analogy — the phone book, with a smart operator">
          <p className="mb-0">
            Lesson 3 taught DNS as the internet&apos;s phone book. Route 53 is a phone book with an
            operator: it can hand out a different number depending on who is calling, which numbers
            are currently working, and where the caller is. And it can point at AWS things by{" "}
            <em>name</em>, so when the number behind the name changes, the book updates itself.
          </p>
        </Callout>

        <h2 id="recap">What Lesson 3 gave you, and what is new here</h2>
        <p>
          If any of these words feels rusty, re-read{" "}
          <Link href={lessonHref(dnsLesson)}>Lesson 3: {dnsLesson.title}</Link> first — this lesson
          builds directly on it:
        </p>
        <ul>
          <li>
            <strong>Hosted zone</strong>: the container for all of a domain&apos;s records. You
            already created one and pointed your registrar&apos;s nameservers at it.
          </li>
          <li>
            <strong>Records</strong>: A, CNAME, MX, TXT, NS. <strong>TTL</strong>: how long answers
            may be cached.
          </li>
          <li>
            <strong>Wildcard record</strong>: <code>*.yourapp.com</code> for tenant subdomains.
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
              <tr><td>Routing policies</td><td>Send 10% of users to a new stack; fail over to a backup</td></tr>
              <tr><td>Health checks</td><td>Stop handing out the address of something that is down</td></tr>
              <tr><td>Private hosted zones</td><td>Give the database a stable internal name</td></tr>
              <tr><td>Email records</td><td>Make your domain send mail that does not land in spam</td></tr>
              <tr><td>Cutover procedure</td><td>Move a live production domain with no downtime</td></tr>
            </tbody>
          </table>
        </div>

        <h2 id="alias">Alias records — the AWS-only record type</h2>
        <p>
          A load balancer&apos;s address is a <em>name</em>, so the obvious record is a CNAME:{" "}
          <code>yourapp.com → myapp-alb-….elb.amazonaws.com</code>. But DNS has a hard rule:{" "}
          <strong>a CNAME cannot coexist with any other record at the same name</strong>, and the bare
          domain (the &ldquo;apex&rdquo;, <code>yourapp.com</code>) always has other records: the
          mandatory <code>SOA</code> and <code>NS</code>, usually <code>MX</code> too. So the apex
          cannot be a CNAME.
        </p>
        <p>
          Route 53&apos;s answer is the <strong>Alias record</strong>: it looks like an{" "}
          <code>A</code> record to the outside world but is resolved inside Route 53, which returns
          the current IP addresses of the AWS resource it names.
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
              <tr><td><strong>Can point at</strong></td><td>Any domain name</td><td>Specific AWS resources (ALB, CloudFront, S3 website, API Gateway…) or another record in the same zone</td></tr>
              <tr><td><strong>Query cost</strong></td><td>Charged</td><td className="font-semibold text-emerald-300">Free for AWS targets</td></tr>
              <tr><td><strong>Follows IP changes</strong></td><td>Yes (extra lookup)</td><td>Yes, automatically, in one step</td></tr>
              <tr><td><strong>TTL</strong></td><td>You choose</td><td>Set by AWS (60 s for most targets)</td></tr>
              <tr><td><strong>Can check target health</strong></td><td>No</td><td>Yes (<code>EvaluateTargetHealth</code>)</td></tr>
            </tbody>
          </table>
        </div>
        <Callout kind="ok" label="Rule of thumb">
          <p className="mb-0">
            Pointing at an AWS resource? <strong>Alias.</strong> Pointing at something outside AWS
            (a SaaS, your old host)? A subdomain can use a CNAME; the apex needs an A record with an
            IP.
          </p>
        </Callout>

        <h2 id="point">Point the domain at the ALB and CloudFront</h2>
        <p>
          The architecture we are wiring: <code>yourapp.com</code> and{" "}
          <code>*.yourapp.com</code> → ALB (the app); <code>assets.yourapp.com</code> → CloudFront
          (Lesson 11).
        </p>
        <ol className="steps">
          <li>
            <h3>Create three alias records</h3>
            <p>
              Route 53 → your hosted zone → Create record. For each one, turn on{" "}
              <strong>Alias</strong> and pick the target from the dropdown — the console fills in
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
                The wildcard record does <em>not</em> cover the bare domain, so you create both.
              </li>
              <li>
                Every CloudFront distribution shares one fixed hosted-zone ID; an ALB&apos;s differs
                by region. That&apos;s why picking from the dropdown beats typing.
              </li>
              <li>
                Changes go from <em>PENDING</em> to <em>INSYNC</em> on all Route 53 servers in
                about 30 seconds.
              </li>
            </ul>
          </li>
          <li>
            <h3>Check it from the outside</h3>
            <CommandList
              title="Verify"
              commands={[
                { cmd: "dig +short acme.yourapp.com", note: "Any subdomain resolves through the wildcard to the ALB's IPs (several, one per AZ — you never type them; they can change)" },
                { cmd: "curl -sI https://yourapp.com", note: "HTTP/2 200 and a valid certificate, served by your Auto Scaling group through the ALB" },
              ]}
            />
          </li>
          <li>
            <h3>Redirect www to the bare domain (or the reverse)</h3>
            <p>
              Create <code>www</code> as an alias to the ALB as well, then add one{" "}
              <strong>rule on the ALB&apos;s HTTPS listener</strong>: if the host header is{" "}
              <code>www.yourapp.com</code>, redirect (301) to <code>https://yourapp.com</code>,
              keeping the path and query. Search engines treat the two names as separate sites, so
              pick one canonical name.
            </p>
          </li>
        </ol>

        <h2 id="routing">Routing policies: simple, weighted, latency, failover</h2>
        <p>
          A normal record has one answer. Route 53 can make the answer depend on conditions. You pick
          a <strong>routing policy</strong> per record.
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
          You have an old stack (say, the app on Vercel) and a new one (the ALB). Instead of flipping
          everyone at once, create <strong>two records with the same name</strong>, each with a
          distinct record ID and a weight. Traffic splits in that ratio:
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
          Start at 10, watch error rates and latency for an hour, then 50, then 100, then remove the
          old record. If anything looks wrong, set the weight to 0: rollback takes as long as your
          TTL. This is the DNS version of a canary release.
        </p>
        <Callout kind="note" label="DNS load-splitting is coarse">
          <p className="mb-0">
            Weights apply per <em>DNS answer</em>, not per request, and resolvers cache answers. A
            big company&apos;s office behind one resolver all lands on the same side for the TTL.
            Percentages average out across many users but are not exact. For precise splits inside
            one stack, use ALB weighted target groups instead.
          </p>
        </Callout>

        <h2 id="health">Health checks and DNS failover</h2>
        <p>
          A Route 53 <strong>health check</strong> is a robot outside your VPC — running in several
          AWS locations — that requests a URL every 10 or 30 seconds. If enough of them see failures,
          the check turns unhealthy and any record tied to it is withdrawn from answers.
        </p>
        <p>
          You create one in Route 53 → Health checks: HTTPS, <code>yourapp.com</code>, path{" "}
          <code>/api/health</code>, every 30 seconds, unhealthy after 3 failures. Then attach it to
          a record.
        </p>
        <p>
          <strong>Failover routing</strong> uses it. Two records, one marked <code>PRIMARY</code>{" "}
          (with the health check) and one <code>SECONDARY</code>. While the primary is healthy
          everyone gets it; when it fails, DNS answers switch to the secondary. The classic, cheap
          secondary is a static <strong>&ldquo;we&apos;ll be right back&rdquo; page in S3 behind
          CloudFront</strong> — a graceful degradation at very low cost.
        </p>
        <Callout kind="warn" label="What DNS failover cannot do">
          <p className="mb-0">
            It is not instant. Detection takes ~90 seconds (3 failures × 30 s) plus the TTL for
            cached answers to expire, so expect two to five minutes. For fast failover <em>inside</em>{" "}
            one region, that is the ALB&apos;s job (seconds). Use Route 53 failover for whole-stack or
            whole-region failure, not for a single sick server. And test it: pull the primary and
            time the switch. An untested failover is a hope, not a plan.
          </p>
        </Callout>

        <h2 id="private">Private hosted zones — names that only exist inside the VPC</h2>
        <p>
          A <strong>private hosted zone</strong> is a zone attached to a VPC: its records answer only
          to resources inside that VPC and are invisible to the internet. It solves a problem from
          Lesson 8: the RDS hostname (<code>myapp-db.abc123xyz.ap-south-1.rds.amazonaws.com</code>) is
          pasted into <code>.env</code> and SSM. When you restore a snapshot or fail over, the
          hostname changes and every config must be edited.
        </p>
        <p>Give the database a name <em>you</em> control instead.</p>
        <p>
          Create a private hosted zone <code>internal.yourapp.com</code> attached to the{" "}
          <code>myapp</code> VPC, and in it one CNAME: <code>db.internal.yourapp.com</code> → the
          RDS endpoint, TTL 60. The app&apos;s connection string now uses{" "}
          <code>@db.internal.yourapp.com:5432</code>.
        </p>
        <p>
          Restore a snapshot? Update <em>one</em> record instead of every server&apos;s config. The
          VPC needs <code>enableDnsHostnames</code> and <code>enableDnsSupport</code> (we set the
          first in Lesson 6). One catch: TLS verification against the RDS certificate will fail on a
          custom name, because the certificate names the AWS hostname — keep{" "}
          <code>sslmode=require</code> (encrypted) or pass the AWS name as the TLS server name.
        </p>

        <h2 id="email">Email records: MX, SPF, DKIM, DMARC</h2>
        <p>
          The moment your domain sends email (welcome messages, password resets), DNS decides whether
          it reaches inboxes or spam. Three TXT-style records prove that mail claiming to be from{" "}
          <code>yourapp.com</code> really is:
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
                <td>Where to <em>deliver</em> mail sent to you</td>
                <td><code>10 inbound-smtp.ap-south-1.amazonaws.com</code> or your Google/Zoho mail servers</td>
              </tr>
              <tr>
                <td><strong>SPF</strong> (TXT at the apex)</td>
                <td>Which servers may <em>send</em> as your domain</td>
                <td><code>&quot;v=spf1 include:amazonses.com ~all&quot;</code></td>
              </tr>
              <tr>
                <td><strong>DKIM</strong> (CNAMEs from your sender)</td>
                <td>A public key so recipients can verify each message&apos;s signature</td>
                <td>three CNAMEs SES/your provider gives you</td>
              </tr>
              <tr>
                <td><strong>DMARC</strong> (TXT at <code>_dmarc</code>)</td>
                <td>What to do when SPF/DKIM fail, and where to send reports</td>
                <td><code>&quot;v=DMARC1; p=none; rua=mailto:dmarc@yourapp.com&quot;</code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout kind="note" label="The safe order">
          <p className="mb-0">
            Start DMARC at <code>p=none</code> (monitor only), read the reports for a few weeks to
            find every legitimate sender, then tighten to <code>quarantine</code> and finally{" "}
            <code>reject</code>. Jumping straight to <code>reject</code> silently drops your own
            invoices. Amazon SES and similar services give you the exact records to paste; the
            skill is knowing where they go and why.
          </p>
        </Callout>

        <h2 id="cutover">Moving a live domain without downtime</h2>
        <p>
          The scenario: the site currently runs on Vercel (or an old host) and you are moving it to
          this AWS stack. DNS is where downtime creeps in, because old answers linger in caches. The
          professional runbook:
        </p>
        <ol className="steps">
          <li>
            <h3>Two days before: copy everything and lower the TTL</h3>
            <p>
              Export the existing zone and recreate <em>every</em> record type (MX, TXT, verification
              CNAMEs — not just the A record) in the Route 53 hosted zone. Then lower the TTL of the
              records that will change to <strong>60 seconds</strong>, and wait at least the{" "}
              <em>old</em> TTL for that to take effect everywhere. This single step is what makes
              the cutover fast and reversible.
            </p>
          </li>
          <li>
            <h3>Test the new stack for real before anyone is sent to it</h3>
            <CommandList
              title="Bypass DNS and talk to the ALB directly"
              commands={[
                { cmd: "curl -sI --resolve yourapp.com:443:<ALB-IP> https://yourapp.com/", note: "Sends the request for yourapp.com to one of the ALB's IPs while the certificate still validates. Test login, uploads, every important page — no DNS change needed" },
              ]}
            />
          </li>
          <li>
            <h3>Cut over — weighted first if you can</h3>
            <p>
              Change nameservers at the registrar to the four Route 53 NS values only if the zone
              is <em>completely</em> ready; otherwise change just the records. Use the weighted
              migration above (10 → 50 → 100) or flip the record at a quiet hour.
            </p>
          </li>
          <li>
            <h3>Watch, keep the old stack, then raise the TTL</h3>
            <p>
              Keep the old host running for at least the old TTL plus a day: stragglers behind
              cached resolvers still reach it. Monitor 5xx rate and latency on the ALB. Once stable,
              raise the TTL back to 300–3600 seconds to cut query costs and speed up resolution, and
              only then turn off the old stack.
            </p>
          </li>
        </ol>
        <Callout kind="ok" label="The TTL trade-off in one line">
          <p className="mb-0">
            Low TTL = changes take effect fast, but more queries and slightly slower first
            lookups. High TTL = the reverse. Run <strong>high in steady state, low around
            changes</strong>.
          </p>
        </Callout>

        <h2 id="domain-safety">Protecting the domain itself</h2>
        <p>
          A perfect infrastructure is worthless if someone else controls the domain. Real incidents
          come from the boring parts:
        </p>
        <ul>
          <li>
            <strong>Expiry.</strong> Turn on auto-renew, and keep a valid payment method. Companies
            have lost domains to an expired card. Put the expiry date in a calendar too.
          </li>
          <li>
            <strong>Registrar account security.</strong> The account that owns the domain is a
            root-level identity: MFA, a shared team mailbox (not one person&apos;s address) as the
            contact, and no reuse of passwords. Whoever controls it controls all your DNS.
          </li>
          <li>
            <strong>Domain lock and privacy.</strong> Enable transfer lock. WHOIS privacy hides
            personal details (Route 53 Domains includes it free on most TLDs).
          </li>
          <li>
            <strong>Dangling records.</strong> A record pointing at an S3 bucket, ELB or third-party
            service you deleted can be claimed by someone else — &ldquo;subdomain takeover&rdquo;.
            Delete DNS records when you delete the resource behind them.
          </li>
          <li>
            <strong>CAA record.</strong> A one-line record restricting which authorities may issue
            certificates for your domain: <code>0 issue &quot;amazon.com&quot;</code> and{" "}
            <code>0 issue &quot;letsencrypt.org&quot;</code>.
          </li>
          <li>
            <strong>DNSSEC</strong> signs your zone so answers cannot be forged. Route 53 supports
            it, but it adds operational risk (a key mistake makes the domain unresolvable). Turn it on
            deliberately once you understand it, not by reflex.
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
              <tr><td>Health check (basic)</td><td>~$0.50–$1.00 per month each</td></tr>
              <tr><td>Domain registration</td><td>Varies by TLD: .com ≈ $13/year, .in ≈ $9–15/year</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          The whole DNS layer of this project is roughly <strong>$1–3 a month</strong> plus the domain
          fee — the cheapest and highest-leverage tier in the architecture.
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
            { cmd: "dig NS yourapp.com +short", note: "Which nameservers does the world think are authoritative? Must equal the hosted zone's NS record — the #1 cause of “my records don't work”" },
            { cmd: "dig @ns-123.awsdns-45.org yourapp.com", note: "Ask Route 53 directly — the truth, ignoring every cache. If this is right but users see old answers, it is TTL; wait" },
          ]}
        />
        <p>
          Together with <code>dig +trace</code> and asking a public resolver (Lesson 3), these
          solve almost every DNS problem.
        </p>

        <h2 id="interview">Interview corner</h2>
        <InterviewQA
          items={[
            {
              q: "Why can't you put a CNAME on the root domain, and what does Route 53 do instead?",
              a: (
                <p className="mb-0">
                  A CNAME cannot coexist with other records at the same name, and the apex must
                  have SOA and NS (and often MX). Route 53 offers alias records: A/AAAA-type records
                  resolved internally to an AWS resource&apos;s current IPs, allowed at the apex and
                  free of query charges.
                </p>
              ),
            },
            {
              q: "How would you migrate a production site to a new host with no downtime?",
              a: (
                <p className="mb-0">
                  Recreate all records, lower TTLs well ahead, test the new stack directly with{" "}
                  <code>curl --resolve</code>, shift traffic gradually with weighted records, monitor,
                  keep the old stack alive for at least the old TTL, then raise TTLs and decommission.
                </p>
              ),
            },
            {
              q: "What is a private hosted zone used for?",
              a: (
                <p className="mb-0">
                  Internal names resolvable only inside associated VPCs, such as{" "}
                  <code>db.internal.example.com</code>. It decouples applications from
                  auto-generated endpoint names and keeps internal topology out of public DNS.
                </p>
              ),
            },
            {
              q: "Explain Route 53 failover routing and its limits.",
              a: (
                <p className="mb-0">
                  Primary and secondary records with a health check on the primary; if the check
                  fails, Route 53 answers with the secondary. It is bounded by detection time plus
                  the TTL of cached answers, so it is minutes, not seconds — suited to
                  region/site-level failure, not single-instance problems.
                </p>
              ),
            },
            {
              q: "Users in one office still reach the old server after your DNS change. Why?",
              a: (
                <p className="mb-0">
                  Their resolver is caching the old answer until the previous TTL expires (some
                  resolvers also ignore low TTLs). Query the authoritative server to confirm
                  the change is live, and plan future changes by lowering TTL beforehand.
                </p>
              ),
            },
            {
              q: "What are SPF, DKIM and DMARC?",
              a: (
                <p className="mb-0">
                  SPF lists servers allowed to send for the domain; DKIM signs messages with a key
                  published in DNS; DMARC sets the policy (none/quarantine/reject) and reporting for
                  mail failing those checks. Together they prevent spoofing and improve deliverability.
                </p>
              ),
            },
            {
              q: "What is a subdomain takeover?",
              a: (
                <p className="mb-0">
                  A DNS record still points to a deprovisioned cloud resource (bucket, app, ELB).
                  An attacker claims that resource name and now serves content on your subdomain.
                  Prevent it by deleting DNS records together with the resources they reference.
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
            Create two weighted records for a test subdomain (<code>canary.yourapp.com</code>), one
            to the ALB and one to a plain IP, weights 50/50. Look it up many times in a row and
            observe the split (and the caching).
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
            Write down the cutover runbook for your own domain in six bullet points, including the TTL
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
          Route 53 is where the long AWS names become your brand, and where you get the safest
          possible handles for changing things in production.
        </p>
        <ul>
          <li>
            <strong>Alias records</strong> for anything in AWS — including the bare domain, where a
            CNAME is illegal.
          </li>
          <li>
            <strong>Routing policies</strong> turn DNS into a traffic tool: weighted for gradual
            migrations, failover for whole-site outages.
          </li>
          <li>
            <strong>Private zones</strong> give internal resources stable names that survive
            restores and failovers.
          </li>
          <li>
            <strong>Email needs its own records</strong> (MX, SPF, DKIM, DMARC), and every record
            type must move with the zone.
          </li>
          <li>
            <strong>TTL is your rollback speed:</strong> low around changes, high the rest of the
            time; test with <code>--resolve</code> before switching.
          </li>
        </ul>
        <p>
          The whole architecture is now live on your own domain. But you have built it by hand, and
          you deploy by SSH-ing around. Time to automate the release with CI/CD.
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
