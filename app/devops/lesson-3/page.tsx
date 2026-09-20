import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import CommandList from "@/components/CommandList";
import DnsLookupStepper from "@/components/figures/DnsLookupStepper";
import DnsResolution from "@/components/figures/DnsResolution";
import WildcardRecord from "@/components/figures/WildcardRecord";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { getLesson, SERIES } from "@/lib/lessons";

const lesson = getLesson("lesson-3")!;

export const metadata: Metadata = {
  title: `Lesson 3 — ${lesson.title}`,
  description: lesson.summary,
};

/** In-page index. Each entry links to a section heading below. */
const outline = [
  { id: "concept", label: "Concept: the internet's phone book" },
  { id: "why-this-matters", label: "Why this matters — Route 53 and subdomains" },
  { id: "architecture", label: "Architecture — how DNS resolution works" },
  { id: "records", label: "DNS record types explained" },
  { id: "ttl", label: "Why TTL matters practically" },
  { id: "real-example", label: "Real example — setting up a domain on Route 53" },
  { id: "wildcard", label: "The subdomain trick for multi-tenant SaaS" },
  { id: "commands", label: "Commands reference" },
  { id: "propagation", label: "Why “propagation takes 24–48 hours” is mostly a myth" },
  { id: "practice", label: "Practice task before Lesson 4" },
  { id: "conclusion", label: "Conclusion" },
];

const records: [string, string, React.ReactNode][] = [
  ["A", "Domain to IPv4 address — the most basic mapping", <code>yourapp.com → 52.66.12.9</code>],
  ["AAAA", "Domain to IPv6 address", "rarely needed for beginners"],
  ["CNAME", "Domain to another domain name (an alias)", <code>www.yourapp.com → yourapp.com</code>],
  ["MX", "Where email for this domain should go", <code>yourapp.com → mail server</code>],
  ["TXT", "Text info, used for verification", "domain ownership proof, SPF for email"],
  ["NS", "Which nameservers are authoritative for this domain", "points to Route 53"],
  ["TTL", "Time To Live — how long resolvers cache the answer, in seconds", <><code>300</code> = 5 minutes</>],
];

export default function LessonThreePage() {
  return (
    <article>
      <header className="mb-8 border-b border-line pb-6">
        <nav className="mb-4 font-mono text-[0.8rem] text-ink-dim" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-sky">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/${SERIES.slug}`} className="hover:text-sky">{SERIES.title}</Link>
          <span className="mx-2">/</span>
          <span>Lesson {String(lesson.number).padStart(2, "0")}</span>
        </nav>
        <p className="mb-2 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">
          Lesson 3 · {lesson.readTime} read
        </p>
        <h1 className="mb-2 text-[2.4rem] font-bold leading-tight tracking-tight text-sky max-sm:text-[2rem]">
          {lesson.title}
        </h1>
        <p className="max-w-[60ch] text-[1.15rem] text-ink-dim">{lesson.summary}</p>
      </header>

      <section className="mb-10 rounded-xl border border-line bg-bg-elev px-6 py-5" aria-labelledby="learn">
        <h2 id="learn" className="mb-2 text-[1.1rem] font-semibold text-sky">
          What you&apos;ll learn in this lesson
        </h2>
        <ol className="m-0 list-decimal pl-5 marker:text-sky">
          {outline.map((item) => (
            <li key={item.id} className="my-1">
              <a href={`#${item.id}`} className="text-ink hover:text-sky">
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </section>

      <div className="lesson">
        <h2 id="concept">Concept</h2>
        <p>
          DNS (Domain Name System) is the internet&apos;s phone book. Computers only understand IP
          addresses like <code>52.66.12.9</code>, but humans can&apos;t remember thousands of
          these numbers. DNS lets you type <code>yourapp.com</code> instead, and quietly
          translates it into the correct IP address behind the scenes, every single time you
          visit.
        </p>

        <h2 id="why-this-matters">Why this matters</h2>
        <p>
          Route 53 is AWS&apos;s DNS service, and it is the very last piece connecting your
          finished infrastructure to a real domain name people can type. But DNS also solves a
          bigger problem for a SaaS builder: <strong>subdomains</strong>. For a multi-tenant
          product, you will likely want each customer to get their own space —{" "}
          <code>acme.yourapp.com</code>, <code>rathod-electricals.yourapp.com</code> — and that
          entire pattern is built with one single DNS record, covered later on this page.
        </p>

        <h2 id="architecture">Architecture — how DNS resolution works</h2>
        <p>
          This chain runs the first time anyone looks up your domain. After that, the answer gets
          cached for a while (governed by TTL — explained below), so repeat visits skip straight
          to the end.
        </p>
        <DnsResolution />
        <DnsLookupStepper />

        <h2 id="records">DNS record types explained</h2>
        <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Record</th>
              <th>What it does</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            {records.map(([type, what, example]) => (
              <tr key={type}>
                <td><strong>{type}</strong></td>
                <td>{what}</td>
                <td>{example}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        <h2 id="ttl">Why TTL matters practically</h2>
        <p>
          If you set TTL to 300 seconds and then change your server&apos;s IP, the whole internet
          catches up within 5 minutes. If you had left the default TTL of 3600 seconds (1 hour) or
          more, some visitors would keep hitting the old IP for up to an hour.
        </p>
        <Callout kind="note" label="Common practice">
          <p className="mb-0">
            Before any planned server migration, lower the TTL a day in advance, make the change,
            then raise it back once things are stable. This gives you a fast, predictable cutover
            instead of an unpredictable one.
          </p>
        </Callout>

        <h2 id="real-example">Real example — setting up a domain on Route 53</h2>
        <ol className="steps">
          <li>
            <h3>Buy the domain</h3>
            <p>
              Through Route 53 directly, or through GoDaddy / Namecheap (often cheaper) — both
              work exactly the same way after purchase.
            </p>
          </li>
          <li>
            <h3>Create a Hosted Zone in Route 53</h3>
            <p>
              This is Route 53&apos;s container for all of your domain&apos;s DNS records — A,
              CNAME, MX, everything lives inside one hosted zone.
            </p>
          </li>
          <li>
            <h3>Point your domain&apos;s nameservers to Route 53</h3>
            <p>
              If you bought the domain elsewhere, update the NS records at your registrar to point
              to the four nameservers Route 53 gives you. This is the one step that connects
              &ldquo;who sold you the name&rdquo; to &ldquo;who actually controls where it
              points.&rdquo;
            </p>
          </li>
          <li>
            <h3>Add an A record</h3>
            <pre>
              <code>yourapp.com → 52.66.12.9</code>
            </pre>
            <p>
              This points your bare domain to your EC2&apos;s public IP, or later, to your load
              balancer.
            </p>
          </li>
          <li>
            <h3>Add a CNAME for www</h3>
            <pre>
              <code>www.yourapp.com → yourapp.com</code>
            </pre>
            <p>So both the bare domain and the www version reach the same place.</p>
          </li>
        </ol>

        <h2 id="wildcard">The subdomain trick for multi-tenant SaaS</h2>
        <p>
          This is the part that matters most for a multi-tenant product. One single DNS record can
          handle unlimited customer subdomains, forever, with zero extra DNS work per customer.
        </p>
        <Callout kind="ok" label="The wildcard record">
          <pre className="my-0">
            <code>{`Type:  A
Name:  *.yourapp.com   (the * is a wildcard)
Value: 52.66.12.9`}</code>
          </pre>
        </Callout>
        <WildcardRecord />
        <p>
          Now <code>acme.yourapp.com</code>, <code>rathod-electricals.yourapp.com</code>, and any
          subdomain you haven&apos;t even thought of yet — all resolve to the same server
          automatically. Your Next.js app then reads the subdomain from the incoming request (
          <code>req.headers.host</code>) and decides which tenant&apos;s data to load.
        </p>
        <Callout kind="ok" label="No DNS change per customer">
          <p className="mb-0">
            No DNS change needed every time you onboard a new customer. This is exactly how real
            multi-tenant SaaS products such as Notion, Shopify and Slack work under the hood.
          </p>
        </Callout>

        <h2 id="commands">Commands reference</h2>
        <CommandList
          title="Looking things up"
          commands={[
            { cmd: "dig yourapp.com", note: "Look up a domain's IP address — the basic check" },
            { cmd: "nslookup yourapp.com", note: "Works everywhere, simpler output" },
            { cmd: "dig yourapp.com +short", note: "See only the answer, nothing else" },
            { cmd: "dig yourapp.com NS", note: "Check which nameservers control a domain" },
            { cmd: "dig yourapp.com MX", note: "Check a specific record type — here, mail" },
            { cmd: "dig yourapp.com TXT", note: "Verification and SPF records" },
            { cmd: "dig yourapp.com +trace", note: "See the full resolution chain, step by step — root → TLD → authoritative" },
            { cmd: "whois yourapp.com", note: "Domain registration details — owner, expiry, registrar" },
            { cmd: "dig @8.8.8.8 yourapp.com", note: "Bypass your local DNS cache and ask a specific resolver directly" },
          ]}
        />

        <h3>AWS CLI — creating records in Route 53</h3>
        <CommandList
          title="Route 53"
          commands={[
            { cmd: "aws route53 list-hosted-zones", note: "List your hosted zones — you need the zone Id for the next command" },
          ]}
        />
        <Script
          title="create-a-record.sh"
          code={`# Create an A record pointing to your EC2 IP
aws route53 change-resource-record-sets \\
  --hosted-zone-id Z1234567890 \\
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "yourapp.com",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [{"Value": "52.66.12.9"}]
      }
    }]
  }'`}
        />

        <h2 id="propagation">Why &ldquo;propagation takes 24–48 hours&rdquo; is mostly a myth</h2>
        <p>
          People often say DNS takes 24 to 48 hours to propagate — this is mostly outdated advice
          based on high default TTL values. In reality, the <strong>authoritative</strong> answer
          (Route 53&apos;s own record) updates instantly the moment you save it.
        </p>
        <Callout kind="warn" label="What actually takes time">
          <p className="mb-0">
            Every DNS resolver around the world that had <strong>cached</strong> your old answer —
            and that delay is bounded exactly by whatever TTL you set. Set TTL to 300 before a
            change, and the whole internet is caught up in 5 minutes, not 2 days.
          </p>
        </Callout>

        <hr />

        <h2 id="practice">Practice task before Lesson 4</h2>
        <p>
          You don&apos;t need to own a domain for this. Every command below is read-only and
          works against any public domain — use a site you know, then try your own if you have
          one.
        </p>
        <Script
          title="practice.sh"
          code={`# 1. The basic lookup — what IP does the name resolve to?
dig github.com +short

# 2. Who is authoritative? Which nameservers hold the real records?
dig github.com NS +short

# 3. Watch the whole chain: root → .com TLD → authoritative → answer
dig github.com +trace

# 4. Read the TTL — the number after the name in the ANSWER section
dig github.com          # how many seconds until resolvers re-ask?
dig github.com          # run again: the TTL counts down — that's the cache

# 5. Ask two different resolvers and compare
dig @8.8.8.8 github.com +short      # Google
dig @1.1.1.1 github.com +short      # Cloudflare

# 6. Different record types
dig github.com MX +short
dig github.com TXT +short
dig www.github.com CNAME +short     # is www an alias or its own A record?

# 7. Prove that a wildcard exists (or doesn't)
dig anything-at-all.vercel.app +short   # Vercel uses a wildcard — any name answers`}
        />
        <p>Then answer these in your own words:</p>
        <ol>
          <li>
            In the <code>+trace</code> output, which server answered the final question, and what
            record type did it return?
          </li>
          <li>
            You are moving your app to a new EC2 tomorrow at 10am. What do you change today, and
            why does the order matter?
          </li>
          <li>
            Explain the difference between an A record and a CNAME. When would a CNAME be the
            wrong choice for the bare domain <code>yourapp.com</code>?
          </li>
          <li>
            Your customer <code>acme</code> signs up. What DNS work is needed for{" "}
            <code>acme.yourapp.com</code> to work? What does your Next.js app have to do?
          </li>
        </ol>
        <Callout kind="ok" label="Optional stretch">
          <p className="mb-0">
            If you own a domain, create a Hosted Zone for it in Route 53 (about $0.50/month) and
            add one TXT record like <code>test=hello</code> with TTL 60. Then run{" "}
            <code>dig yourdomain.com TXT</code> against <code>@8.8.8.8</code> and time how long
            it takes to show up. It will be seconds, not days.
          </p>
        </Callout>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          DNS is a phone book with a cache in front of it. The authoritative answer lives in one
          place — for you, a Route 53 hosted zone — and every resolver in the world keeps a copy
          for exactly as long as the TTL tells it to.
        </p>
        <ul>
          <li>
            <strong>Resolution chain</strong>: browser → resolver → root → TLD → authoritative
            (Route 53) → IP. It runs once per TTL window, then it&apos;s served from cache.
          </li>
          <li>
            <strong>Records you&apos;ll actually use</strong>: <code>A</code> for the bare domain
            → IP, <code>CNAME</code> for <code>www</code> → bare domain, <code>NS</code> to hand
            control to Route 53, <code>TXT</code> for verification.
          </li>
          <li>
            <strong>TTL is your cutover dial</strong>: lower it to 300 a day before a change,
            change, raise it back. &ldquo;24–48 hours&rdquo; is old TTL folklore, not a law.
          </li>
          <li>
            <strong>One wildcard record</strong> (<code>*.yourapp.com</code>) serves every
            customer subdomain forever. Onboarding a tenant becomes an app-level decision read from
            the <code>Host</code> header, not a DNS ticket.
          </li>
        </ul>
        <p>
          With Lesson 2 you learned how a request reaches an IP and a port. Now you know how the
          name becomes that IP in the first place. Next, we lock the door: HTTPS and TLS.
        </p>

        <hr />
        <p>
          End of Lesson 3. Next: <strong>Lesson 4 — HTTPS, SSL and TLS</strong>.
        </p>
      </div>

      <LessonPager slug={lesson.slug} />
    </article>
  );
}
