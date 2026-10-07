import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import CommandList from "@/components/CommandList";
import RequestFlow from "@/components/figures/RequestFlow";
import ServerDoors from "@/components/figures/ServerDoors";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { getLesson, SERIES } from "@/lib/lessons";

const lesson = getLesson("lesson-2")!;

export const metadata: Metadata = {
  title: `Lesson 2 — ${lesson.title}`,
  description: lesson.summary,
};

/** In-page index. Each entry links to a section heading below. */
const outline = [
  { id: "concept", label: "Concept: address, door, language" },
  { id: "why-this-matters", label: "Why this matters — it works on the server, not in the browser" },
  { id: "terms", label: "Key terms, explained simply" },
  { id: "building", label: "Think of your server like an office building" },
  { id: "architecture", label: "Architecture — the full request flow" },
  { id: "ports", label: "Common ports you'll actually use" },
  { id: "tcp-udp", label: "TCP vs UDP — why it matters for your stack" },
  { id: "security-groups", label: "Security Groups in detail" },
  { id: "real-example", label: "Real example — a debugging story" },
  { id: "practice", label: "Practice task before Lesson 3" },
  { id: "conclusion", label: "Conclusion" },
];

const terms: [string, React.ReactNode][] = [
  ["IP address", <>A number that identifies one device on a network, like a house address. Example: <code>52.66.12.9</code></>],
  ["Port", "A numbered door on that address, from 0 to 65535. One IP can have many doors. Each door can lead to a different program (service)."],
  ["Public IP", "An address that anyone on the internet can reach."],
  ["Private IP", "An address that can be reached only from inside the same network, such as inside your VPC (your private network in AWS)."],
  ["TCP", "TCP (Transmission Control Protocol) is a set of rules for reliable delivery. It makes sure every piece of data (packet) arrives, in the right order. Websites, databases and SSH use it."],
  ["UDP", "UDP (User Datagram Protocol) is a set of rules for fast delivery with no guarantee. Some packets may be lost. Video calls, DNS lookups and games use it."],
  ["Firewall / Security Group", "A firewall is a program or device that blocks or allows network traffic by rules. A Security Group is the AWS firewall for your server. It is a list of rules about which ports are allowed in or out."],
  ["localhost / 127.0.0.1", "“This same machine only.” Traffic to this address never leaves the server."],
  ["0.0.0.0", "“All network interfaces” (all the network connections of the machine). When a program listens on this address, it can be reached from outside too."],
];

const ports: [number, string][] = [
  [22, "SSH — server login"],
  [80, "HTTP"],
  [443, "HTTPS"],
  [3000, "Next.js dev server (default)"],
  [5432, "PostgreSQL"],
  [6379, "Redis"],
  [3306, "MySQL"],
];

const ruleParts: [string, string, React.ReactNode][] = [
  ["Type", "A shortcut name for a common service", "HTTPS, SSH, Custom TCP"],
  ["Protocol", "TCP, UDP, or ICMP (for ping)", "TCP"],
  ["Port range", "Which door (port) is open", "443"],
  ["Source", "Who may come in", <><code>0.0.0.0/0</code> (anyone), your specific IP, or another security group</>],
];

export default function LessonTwoPage() {
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
          Lesson 2 · {lesson.readTime} read
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
          Every computer that talks over the internet needs three things. First, an{" "}
          <strong>address</strong> (the IP address). Second, a <strong>door</strong> on that
          address (the port). Third, an agreed <strong>language</strong> for the talk (the
          protocol, such as TCP or UDP). A protocol is a set of rules for how two computers
          talk. When your browser opens <code>yourapp.com</code>, it connects to something like{" "}
          <code>52.66.12.9:443</code> and speaks HTTPS over TCP. Everything else in networking is
          built on this one idea.
        </p>

        <h2 id="why-this-matters">Why this matters</h2>
        <p>
          On Vercel, making your app reachable was automatic. You never thought about it. On EC2,
          you decide three things. Which port does your app listen on? Which ports may the
          outside world reach? Does traffic arrive directly, or through a proxy (a program that
          receives requests and passes them on to your app)?
        </p>
        <p>
          If you get this wrong, you will see a common beginner problem. Your app runs well, and{" "}
          <code>curl localhost:3000</code> works on the server itself. But the browser on your
          laptop waits and then times out. This is a <strong>networking problem</strong>, not a
          code problem. This lesson helps you find the cause in minutes instead of hours.
        </p>

        <h2 id="terms">Key terms, explained simply</h2>
        <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Term</th>
              <th>Simple meaning</th>
            </tr>
          </thead>
          <tbody>
            {terms.map(([term, meaning]) => (
              <tr key={term}>
                <td className="whitespace-nowrap"><strong>{term}</strong></td>
                <td>{meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        <h2 id="building">Think of your server like an office building</h2>
        <p>
          Before the technical diagram, here is a simple picture. Keep it in mind. Every term
          above matches something in this story.
        </p>
        <ServerDoors />
        <ul>
          <li>
            <strong>IP address</strong> is the building&apos;s street address. Every building
            needs one so the post can find it.
          </li>
          <li>
            <strong>Port</strong> is the door number of one room. Door 22 leads to the
            security room (SSH). Door 80 leads to reception (website). Door 443 leads to the
            secure reception (HTTPS website). Door 5432 leads to the record room (your database).
            One building has many rooms and many doors. Each room does a different job.
          </li>
          <li>
            <strong>Security Group</strong> is the guard at the main gate. By default, the
            guard says <strong>no</strong> to everyone. Nobody enters until you give an
            instruction, such as &ldquo;let people through door 80 and door 443 only.&rdquo; Every
            other door stays locked, even if something useful is behind it.
          </li>
          <li>
            <strong>localhost</strong> is a room that only someone already inside the building
            can reach. <strong>0.0.0.0</strong> is a room open to the whole building network. But
            the guard at the gate still decides whether outsiders can enter the building at all.
          </li>
          <li>
            <strong>Nginx</strong> is the receptionist. It is a web server program that
            receives requests and passes them to your app (a reverse proxy). Visitors do not walk
            straight to any room. They knock on the receptionist&apos;s door (80/443, the only
            doors the guard allows). The receptionist then walks them to the real room inside:
            your Next.js app on door 3000. Outsiders can never reach that room directly.
          </li>
        </ul>
        <Callout kind="note" label="The full journey in one line">
          <p className="mb-0">
            The browser knocks on your building&apos;s address, door 443 → the security guard
            checks the rule list and allows it → the receptionist (Nginx) answers → the
            receptionist walks the visitor to the real room (your Next.js app) inside. No outsider
            can reach that room directly.
          </p>
        </Callout>

        <h2 id="architecture">Architecture — the full request flow</h2>
        <p>
          Here is the same journey as a technical diagram. Port 3000 does not appear anywhere on
          the path from the outside. Only Nginx is exposed. Real production servers are set up
          this way.
        </p>
        <RequestFlow />

        <h2 id="ports">Common ports you&apos;ll actually use</h2>
        <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Port</th>
              <th>Service</th>
            </tr>
          </thead>
          <tbody>
            {ports.map(([port, service]) => (
              <tr key={port}>
                <td><strong>{port}</strong></td>
                <td>{service}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        <h2 id="tcp-udp">TCP vs UDP — why it matters for your stack</h2>
        <ul>
          <li>
            <strong>TCP</strong> is like a phone call where you keep asking &ldquo;did you hear
            that? OK, next sentence.&rdquo; It is slower, but nothing is missed. It is used for
            websites, databases and logins, where losing data is not acceptable.
          </li>
          <li>
            <strong>UDP</strong> is like shouting instructions to someone who is walking away. It
            is fast, but if they miss a word, nobody repeats it. It is used for video calls,
            quick DNS lookups and live games, where speed matters more than perfection.
          </li>
        </ul>
        <p>
          Your web app (HTTP requests, database connections, SSH) uses TCP. UDP mainly appears in
          DNS lookups (Lesson 3) and in live video or voice features, if you add them. (Newer
          HTTP/3 also uses UDP, but you can ignore that for now.) For almost everything you
          build, <strong>TCP is the one that matters.</strong>
        </p>
        <Callout kind="note" label="A quick word on IP ranges (CIDR)">
          <p className="mb-0">
            You will see addresses written like <code>10.0.0.0/16</code>. This is CIDR notation:
            a way to write a whole block of IP addresses. The number after the slash tells you
            the size of the block. A smaller number means a bigger block. <code>/16</code> is
            65,536 addresses, <code>/24</code> is 256 addresses, and <code>/32</code> is exactly
            one. Lesson 6 (VPC) explains this in full. For now, just recognise it.
          </p>
        </Callout>

        <h2 id="security-groups">Security Groups — in detail</h2>
        <p>
          A Security Group is a <strong>virtual firewall</strong> (a firewall made of software)
          that you attach to your EC2 server&apos;s network connection. In the building story, it
          is the guard at the main gate. The guard checks every visitor before they can knock.
        </p>
        <Callout kind="warn" label="The most important rule to remember">
          <p className="mb-0">
            A new Security Group blocks <strong>all inbound traffic by default</strong>. Inbound
            means traffic coming in to your server. Nothing gets in (not HTTP, not SSH) until you
            write a rule that allows it. This is called <strong>allow-listing</strong>: only what
            is on the list may enter. It is the safest place to start.
          </p>
        </Callout>
        <p>
          Outbound traffic is allowed by default. Outbound means your server calling out to the
          internet, for example to download npm packages. So your server works normally, and the
          outside is still locked out.
        </p>

        <h3>Security Groups are &ldquo;stateful&rdquo;</h3>
        <p>
          &ldquo;Stateful&rdquo; means the firewall remembers connections. If you allow an
          inbound request on port 443, the <strong>response</strong> to that request is allowed
          back out automatically. You do not need a separate outbound rule. The guard remembers
          who came in and lets the reply go back to that same visitor.
        </p>
        <p>
          AWS also has a second firewall called a <strong>Network ACL</strong> (Lesson 6, VPC). It
          works on a whole subnet (a part of your network), not on one server. It is{" "}
          <em>stateless</em>, so you must write rules for both directions. Security Groups are
          simpler, and you will use them most of the time.
        </p>

        <h3>Every rule has four parts</h3>
        <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Part</th>
              <th>Meaning</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            {ruleParts.map(([part, meaning, example]) => (
              <tr key={part}>
                <td className="whitespace-nowrap"><strong>{part}</strong></td>
                <td>{meaning}</td>
                <td>{example}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        <h3>A real, production-style setup for your Next.js app server</h3>
        <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Port</th>
              <th>Source</th>
              <th>Why</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>SSH</td>
              <td>22</td>
              <td className="text-emerald-300">
                Your IP only
                <br />
                <code>103.45.12.8/32</code>
              </td>
              <td>Never leave this open to everyone — see warning below</td>
            </tr>
            <tr>
              <td>HTTP</td>
              <td>80</td>
              <td className="text-emerald-300"><code>0.0.0.0/0</code></td>
              <td>Public website, anyone can visit</td>
            </tr>
            <tr>
              <td>HTTPS</td>
              <td>443</td>
              <td className="text-emerald-300"><code>0.0.0.0/0</code></td>
              <td>Public secure website</td>
            </tr>
            <tr>
              <td>Custom TCP</td>
              <td>3000</td>
              <td className="font-semibold text-red-300">not added at all</td>
              <td>Never open to the public — Nginx talks to it inside the server</td>
            </tr>
          </tbody>
        </table>
        </div>

        <h3>A different setup for your RDS PostgreSQL database</h3>
        <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Port</th>
              <th>Source</th>
              <th>Why</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>PostgreSQL</td>
              <td>5432</td>
              <td>
                <strong>Your app&apos;s security group</strong> (not an IP, not{" "}
                <code>0.0.0.0/0</code>)
              </td>
              <td>
                Only your app server can reach the database. Nobody else on the internet can even
                try to connect
              </td>
            </tr>
          </tbody>
        </table>
        </div>
        <p>
          That last row is an important pattern in real AWS setups. Instead of an IP address, the
          source is <strong>another security group&apos;s ID</strong>. It means &ldquo;allow
          traffic only from servers in that other group.&rdquo; If your app server&apos;s IP
          changes, the rule still works. The database stays hidden from the public internet.
        </p>

        <Callout kind="warn" label="The #1 beginner security mistake">
          <p className="mb-0">
            Setting the SSH (port 22) source to <code>0.0.0.0/0</code>. It means &ldquo;anyone in
            the world may try to log in.&rdquo; Automated bots start sending login attempts to a
            new server within minutes. Always limit SSH to your own IP address. Use{" "}
            <code>/32</code>, which means &ldquo;exactly this one address, nothing else.&rdquo;
          </p>
        </Callout>

        <h3>Managing security groups</h3>
        <p>
          You create a security group, then add one rule per door: HTTPS from anywhere, SSH only
          from your own <code>/32</code>. You can do this in the console or in the CLI. Lesson 6
          builds the real ones step by step, so there is nothing to run yet.
        </p>
        <Callout kind="note" label="Good to know">
          <p className="mb-0">
            One EC2 server can have several security groups at once. AWS adds all their rules
            together. This keeps things tidy: one group for web access, one for SSH access, one
            for database access. You can mix them for each server.
          </p>
        </Callout>

        <h2 id="real-example">Real example — a debugging story</h2>
        <p>
          You deploy your Next.js app. You open the browser on your laptop and type the
          server&apos;s address. Nothing loads. Here is how to think it through, step by step.
        </p>
        <ol className="steps">
          <li>
            <h3>&ldquo;Is anyone actually in the room?&rdquo;</h3>
            <p>SSH into the server and check if the app process is even running.</p>
            <CommandList
              title="On the server"
              commands={[
                { cmd: "ps aux | grep node", note: "Is a node process alive at all?" },
                { cmd: "sudo ss -tulpn | grep 3000", note: "Is anything listening on port 3000?" },
              ]}
            />
            <p>
              If nothing shows up, the app is not running. Fix that first, before you touch
              networking.
            </p>
          </li>
          <li>
            <h3>&ldquo;Is the room locked to insiders only?&rdquo;</h3>
            <p>Check which interface the app is actually listening on.</p>
            <CommandList
              title="On the server"
              commands={[
                { cmd: "sudo ss -tulpn", note: <><code>127.0.0.1:3000</code> = only the server itself can reach it · <code>0.0.0.0:3000</code> = open to the network (if the firewall allows)</> },
              ]}
            />
            <p>
              In production, keep the app on <code>127.0.0.1</code> and put Nginx in front. This
              is the safer and correct way.
            </p>
          </li>
          <li>
            <h3>&ldquo;Did the guard even let me near the door?&rdquo;</h3>
            <p>From your own laptop, test whether the port is reachable at all.</p>
            <CommandList
              title="From your laptop"
              commands={[
                { cmd: "nc -zv <your-ec2-public-ip> 3000", note: "nc (netcat) tries to connect to a port. Two different answers mean two different problems:" },
              ]}
            />
            <ul>
              <li>
                <strong className="text-red-300">&ldquo;Connection refused&rdquo;</strong> —
                you reached the door, and the server said nobody lives here. Nothing is running
                on that port.
              </li>
              <li>
                <strong className="text-red-300">&ldquo;Connection timed out&rdquo;</strong> —
                you are not even allowed near the door. The Security Group blocks you before you
                get close. This is the most common beginner mistake.
              </li>
            </ul>
          </li>
        </ol>
        <Callout kind="ok" label="The three-check sequence">
          <p className="mb-0">
            Most &ldquo;my app does not load&rdquo; problems on AWS come from one of these three
            checks. Learn this order once, and you will fix network problems in minutes instead
            of hours.
          </p>
        </Callout>

        <Callout kind="note" label="A real cost note, since it's networking-related">
          <p className="mb-0">
            Data coming <strong>into</strong> AWS from the internet is free. Data going{" "}
            <strong>out</strong> to the internet is billed, roughly $0.09 to $0.11 per GB
            depending on the region, after a free monthly amount (100 GB at the time of writing).
            This matters once real users download PDFs or images. Lesson 19, the cost review,
            looks at it properly.
          </p>
        </Callout>

        <hr />

        <h2 id="practice">Practice task before Lesson 3</h2>
        <p>
          You still do not need EC2. Your laptop can act as a server too. It has an IP, ports, and
          a process listening on one of them. Run your Next.js app and inspect it as you would a
          real server.
        </p>
        <Script
          title="practice.sh"
          code={`npm run dev &                 # Next.js on port 3000
curl -I http://localhost:3000 # from inside — expect HTTP/1.1 200
nc -zv 127.0.0.1 3000         # expect "succeeded"
nc -zv 127.0.0.1 3001         # nothing there — expect "Connection refused"`}
        />
        <p>
          Then work out, on paper, how many addresses are in <code>10.0.0.0/16</code>,{" "}
          <code>10.0.1.0/24</code> and <code>103.45.12.8/32</code>. (Hint: an IPv4 address has 32
          bits, and the number after the slash is how many bits are fixed.)
        </p>
        <p>Then answer these in your own words:</p>
        <ol>
          <li>
            <code>nc</code> says &ldquo;Connection refused&rdquo; on 3001, but it would say
            &ldquo;timed out&rdquo; on a locked EC2 port. Why are the two messages different?
            Which one points at the Security Group?
          </li>
          <li>
            Your app listens on <code>127.0.0.1:3000</code>. Nginx listens on{" "}
            <code>0.0.0.0:443</code>. Which of the two needs a Security Group rule? Why is that
            enough?
          </li>
          <li>
            Why is the RDS rule&apos;s source a <em>security group ID</em> instead of the app
            server&apos;s IP address?
          </li>
          <li>
            Write the three inbound rules (type, port, source) for your own app server. If any
            source is <code>0.0.0.0/0</code>, say why that is safe there.
          </li>
        </ol>
        <Callout kind="ok" label="Optional stretch">
          <p className="mb-0">
            In the AWS console open <strong>EC2 → Security Groups</strong> and create the{" "}
            <code>myapp-app-sg</code> group from this lesson with its three rules. A security
            group costs nothing and is not attached to any server yet. It will be ready when you
            launch one.
          </p>
        </Callout>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          Networking on AWS is not hard once you remember the one idea from the top of this
          lesson: <strong>address, door, language</strong>. An IP finds the machine. A port picks
          the service on it. TCP carries the talk reliably. Everything else is a rule about who
          may knock on which door.
        </p>
        <ul>
          <li>
            <strong>Public vs private</strong>: only Nginx on 80/443 is public. Your app on{" "}
            <code>127.0.0.1:3000</code> and your database on 5432 always stay private.
          </li>
          <li>
            <strong>Security Groups</strong>: they block all inbound traffic by default, allow
            only what you list, and are stateful, so replies come back on their own. Allow SSH
            from your IP with <code>/32</code>, never from <code>0.0.0.0/0</code>.
          </li>
          <li>
            <strong>Group-to-group rules</strong>: the database allows the app server&apos;s
            security group, not an IP. So it stays hidden from the internet even when servers
            come and go.
          </li>
          <li>
            <strong>The three-check debug order</strong>: Is the process running (
            <code>ps</code>, <code>ss</code>)? Which interface is it listening on? Can you reach
            the port from outside (<code>nc -zv</code>)? &ldquo;Refused&rdquo; means nothing is
            listening. &ldquo;Timed out&rdquo; means the firewall blocked you.
          </li>
        </ul>
        <p>
          You now know what Vercel did for you every time you deployed. You can do it yourself,
          with the doors you choose.
        </p>

        <hr />
        <p>
          End of Lesson 2. Next: <strong>Lesson 3 — DNS Deep Dive</strong>.
        </p>
      </div>

      <LessonPager slug={lesson.slug} />
    </article>
  );
}
