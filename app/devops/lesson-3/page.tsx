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
  { id: "commands", label: "Looking it up yourself" },
  { id: "propagation", label: "Why “propagation takes 24–48 hours” is mostly a myth" },
  { id: "practice", label: "Practice task before Lesson 4" },
  { id: "conclusion", label: "Conclusion" },
];

const records: [string, string, React.ReactNode][] = [
  ["A", "Points a domain to an IPv4 address (the usual kind, like 52.66.12.9). The most basic record", <code>yourapp.com → 52.66.12.9</code>],
  ["AAAA", "Points a domain to an IPv6 address (the newer, longer kind)", "you rarely need it at first"],
  ["CNAME", "Points a domain to another domain name (an alias). It cannot be used for the bare domain itself", <code>www.yourapp.com → yourapp.com</code>],
  ["MX", "Says which mail server receives email for this domain", <code>yourapp.com → mail server</code>],
  ["TXT", "Holds text. Used to prove things about a domain", "proof of domain ownership, SPF (a list of servers allowed to send your email)"],
  ["NS", "Says which nameservers (the servers that hold your records) are in charge of this domain", "points to Route 53"],
  ["TTL", "Time To Live. It is not a record type but a setting on a record: how many seconds a resolver may keep (cache) the answer", <><code>300</code> = 5 minutes</>],
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
          DNS (Domain Name System) is the internet&apos;s phone book. It is a system that turns a
          name into an IP address. Computers find each other with IP addresses like{" "}
          <code>52.66.12.9</code>. People cannot remember so many numbers. So you type{" "}
          <code>yourapp.com</code>, and DNS looks up the right IP address for you each time you
          visit.
        </p>

        <h2 id="why-this-matters">Why this matters</h2>
        <p>
          Route 53 is the AWS DNS service. It is the last piece that connects your finished setup
          to a domain name people can type. DNS also helps a SaaS builder with{" "}
          <strong>subdomains</strong>. A subdomain is a name added in front of your domain. In a
          multi-tenant product (many customers share one app), each customer can get their own
          name, such as <code>acme.yourapp.com</code> or{" "}
          <code>rathod-electricals.yourapp.com</code>. One DNS record can do this. You will see
          it later in this lesson.
        </p>

        <h2 id="architecture">Architecture — how DNS resolution works</h2>
        <p>
          This chain runs the first time someone looks up your domain. After that, the answer is
          cached (saved for a while). The TTL setting, explained below, decides how long. So
          repeat visits skip most of the chain. The resolver in the chain is the server (often
          run by your internet provider) that does the lookup for you.
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
          TTL (Time To Live) is the number of seconds a resolver may keep an answer before it
          asks again. Say you set TTL to 300 seconds and then change your server&apos;s IP. Most
          of the internet catches up within 5 minutes. Many domain providers use a default of
          3600 seconds (1 hour) or more. With that, some visitors keep going to the old IP for up
          to an hour.
        </p>
        <Callout kind="note" label="Common practice">
          <p className="mb-0">
            Before a planned server move, lower the TTL a day before. Then make the change. Then
            raise the TTL again when all is stable. The switch (cutover) is then fast and you
            know when it ends.
          </p>
        </Callout>

        <h2 id="real-example">Real example — setting up a domain on Route 53</h2>
        <ol className="steps">
          <li>
            <h3>Buy the domain</h3>
            <p>
              Buy it through Route 53, or through GoDaddy or Namecheap (often cheaper). A
              registrar is a company that sells domain names. After you buy, both ways work the
              same.
            </p>
          </li>
          <li>
            <h3>Create a Hosted Zone in Route 53</h3>
            <p>
              A hosted zone is Route 53&apos;s container for all the DNS records of one domain. A,
              CNAME, MX and all other records live inside one hosted zone.
            </p>
          </li>
          <li>
            <h3>Point your domain&apos;s nameservers to Route 53</h3>
            <p>
              If you bought the domain elsewhere, change the nameservers at your registrar to the
              four nameservers that Route 53 gives you. This step links &ldquo;who sold you the
              name&rdquo; to &ldquo;who decides where the name points.&rdquo;
            </p>
          </li>
          <li>
            <h3>Add an A record</h3>
            <pre>
              <code>yourapp.com → 52.66.12.9</code>
            </pre>
            <p>
              This points your bare domain (the name with nothing in front, like yourapp.com) to
              your EC2&apos;s public IP. Later it will point to your load balancer. (For a load
              balancer, Route 53 uses an &ldquo;alias&rdquo; A record, because a CNAME is not
              allowed on the bare domain.)
            </p>
          </li>
          <li>
            <h3>Add a CNAME for www</h3>
            <pre>
              <code>www.yourapp.com → yourapp.com</code>
            </pre>
            <p>Now both the bare domain and the www version reach the same place.</p>
          </li>
        </ol>

        <h2 id="wildcard">The subdomain trick for multi-tenant SaaS</h2>
        <p>
          This matters most for a multi-tenant product. One DNS record can serve any number of
          customer subdomains, with no extra DNS work for each new customer.
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
          other subdomain all go to the same server. (The wildcard does not cover the bare{" "}
          <code>yourapp.com</code>. That needs its own record.) Your Next.js app reads the
          subdomain from the incoming request (<code>req.headers.host</code>, the{" "}
          <code>Host</code> header that holds the address the user typed) and decides which
          tenant&apos;s data to load. For HTTPS you will also need a certificate that covers{" "}
          <code>*.yourapp.com</code>.
        </p>
        <Callout kind="ok" label="No DNS change per customer">
          <p className="mb-0">
            You do not change DNS each time a new customer joins. Many real multi-tenant products
            work this way. For example, Slack gives each team a name like{" "}
            <code>team.slack.com</code>, and Shopify gives each store a name like{" "}
            <code>store.myshopify.com</code>.
          </p>
        </Callout>

        <h2 id="commands">Looking it up yourself</h2>
        <p>
          You can ask DNS questions from any laptop with <code>dig</code>, a tool that looks up
          DNS records. Three lookups cover most cases: &ldquo;what IP does this name point
          to?&rdquo;, &ldquo;show me every step of the chain&rdquo;, and &ldquo;ask Google&apos;s
          resolver directly, not my local one&rdquo;. You can also ask for one record type, such
          as <code>NS</code>, <code>MX</code> or <code>TXT</code>.
        </p>
        <CommandList
          title="Looking things up"
          commands={[
            { cmd: "dig yourapp.com +short", note: "What IP does the name resolve to?" },
            { cmd: "dig yourapp.com +trace", note: "The full chain, step by step: root → TLD (the part after the dot, like .com) → authoritative (the server that holds your record)" },
            { cmd: "dig @8.8.8.8 yourapp.com +short", note: "Skip your local resolver and ask Google's public resolver (8.8.8.8) directly" },
          ]}
        />

        <h3>Creating a record in Route 53</h3>
        <p>
          In Route 53 you create a record by giving it a name, picking a type (<code>A</code>,{" "}
          <code>CNAME</code> and so on), setting a TTL and giving the value. Every DNS provider
          uses these same four fields. The console is fine for this. Lesson 13 does it properly
          for production.
        </p>

        <h2 id="propagation">Why &ldquo;propagation takes 24–48 hours&rdquo; is mostly a myth</h2>
        <p>
          People often say DNS takes 24 to 48 hours to propagate (spread across the internet).
          This is mostly old advice from the days of high default TTL values. The{" "}
          <strong>authoritative</strong> answer (the one on Route 53&apos;s own servers) is
          usually updated everywhere in Route 53 within about 60 seconds after you save it.
        </p>
        <Callout kind="warn" label="What actually takes time">
          <p className="mb-0">
            Resolvers around the world that had <strong>cached</strong> your old answer keep it
            until its TTL ends. That wait is limited by the TTL you set. Set the TTL to 300
            before a change, and most of the internet catches up in about 5 minutes, not 2 days.
          </p>
        </Callout>

        <hr />

        <h2 id="practice">Practice task before Lesson 4</h2>
        <p>
          You do not need to own a domain. Every command below only reads data and works on any
          public domain. Use a site you know. Then try your own domain if you have one.
        </p>
        <Script
          title="practice.sh"
          code={`dig github.com +short          # the IP it resolves to
dig github.com +trace          # root → .com → GitHub's nameservers → answer
dig github.com                 # run twice: the TTL in the ANSWER counts down`}
        />
        <p>Then answer these in your own words:</p>
        <ol>
          <li>
            In the <code>+trace</code> output, which server answered the final question, and what
            record type did it return?
          </li>
          <li>
            You will move your app to a new EC2 tomorrow at 10am. What do you change today? Why
            does the order matter?
          </li>
          <li>
            Explain the difference between an A record and a CNAME. Why can you not use a CNAME
            for the bare domain <code>yourapp.com</code>? (Hint: the bare domain, called the zone
            apex, must also hold NS and SOA records, and a CNAME cannot sit beside other
            records.)
          </li>
          <li>
            Your customer <code>acme</code> signs up. What DNS work do you need for{" "}
            <code>acme.yourapp.com</code> to work? What must your Next.js app do?
          </li>
        </ol>
        <Callout kind="ok" label="Optional stretch">
          <p className="mb-0">
            If you own a domain, create a Hosted Zone for it in Route 53 (about $0.50 per month).
            Add one TXT record such as <code>test=hello</code> with TTL 60. Then run{" "}
            <code>dig @8.8.8.8 yourdomain.com TXT</code> and time how long it takes to show up.
            It should take seconds, not days. (Your domain must use Route 53&apos;s nameservers
            for this to work.)
          </p>
        </Callout>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          DNS is a phone book with a cache in front of it. The real (authoritative) answer lives
          in one place. For you, that is a Route 53 hosted zone. Resolvers around the world keep
          a copy for as long as the TTL allows.
        </p>
        <ul>
          <li>
            <strong>Resolution chain</strong>: browser → resolver → root → TLD → authoritative
            (Route 53) → IP. It runs once per TTL period. After that, the answer comes from the
            cache.
          </li>
          <li>
            <strong>Records you&apos;ll actually use</strong>: <code>A</code> for the bare domain
            → IP, <code>CNAME</code> for <code>www</code> → bare domain, <code>NS</code> to hand
            control to Route 53, <code>TXT</code> for verification.
          </li>
          <li>
            <strong>TTL is your cutover dial</strong>: lower it to 300 a day before a change, make
            the change, then raise it again. &ldquo;24–48 hours&rdquo; is old advice, not a rule.
          </li>
          <li>
            <strong>One wildcard record</strong> (<code>*.yourapp.com</code>) serves every
            customer subdomain. Adding a new customer is then done in your app, using the{" "}
            <code>Host</code> header, not in DNS.
          </li>
        </ul>
        <p>
          In Lesson 2 you learned how a request reaches an IP and a port. Now you know how a name
          becomes that IP. Next, we lock the door: HTTPS and TLS.
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
