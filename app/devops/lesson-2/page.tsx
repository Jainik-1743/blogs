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
  { id: "commands", label: "Commands reference" },
  { id: "practice", label: "Practice task before Lesson 3" },
  { id: "conclusion", label: "Conclusion" },
];

const terms: [string, React.ReactNode][] = [
  ["IP address", <>A number that identifies a device on a network — like a house address. Example: <code>52.66.12.9</code></>],
  ["Port", "A specific door on that address, numbered 0–65535. One IP can have many doors, each running a different service."],
  ["Public IP", "Reachable from anywhere on the internet."],
  ["Private IP", "Only reachable from inside the same network, such as inside your VPC."],
  ["TCP", "Reliable, ordered delivery. Checks that every packet arrived correctly. Used for websites, databases, SSH."],
  ["UDP", "Fast, no delivery guarantee. Used for video calls, DNS lookups, gaming."],
  ["Firewall / Security Group", "A rule list that decides which ports are allowed in or out."],
  ["localhost / 127.0.0.1", "“This same machine only.” Never leaves the server."],
  ["0.0.0.0", "“All network interfaces.” When a server binds here, it becomes reachable from outside too."],
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
  ["Type", "A shortcut for common services", "HTTPS, SSH, Custom TCP"],
  ["Protocol", "TCP, UDP, or ICMP (for ping)", "TCP"],
  ["Port range", "Which door", "443"],
  ["Source", "Who is allowed through", <><code>0.0.0.0/0</code> (anyone), your specific IP, or another security group</>],
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
          Every computer that talks over the internet needs three things: an{" "}
          <strong>address</strong> (IP), a specific <strong>door</strong> on that address (port),
          and an agreed <strong>language</strong> for how the conversation happens (protocol — TCP
          or UDP). When your browser opens <code>yourapp.com</code>, it is really connecting to
          something like <code>52.66.12.9:443</code> and speaking HTTPS over TCP. Everything else
          in networking is convenience built on top of that one idea.
        </p>

        <h2 id="why-this-matters">Why this matters</h2>
        <p>
          On Vercel, &ldquo;make my app reachable&rdquo; was automatic — you never thought about
          it. On EC2, you personally decide: which port your app listens on, which ports the
          outside world is allowed to reach, and whether traffic arrives directly or through a
          proxy.
        </p>
        <p>
          Get this wrong and you get the classic beginner experience: your app is running
          perfectly, <code>curl localhost:3000</code> works fine on the server itself, but the
          browser on your laptop just times out forever. That is a{" "}
          <strong>networking problem</strong>, not a code problem — and this lesson is what lets
          you diagnose it in 30 seconds instead of an hour.
        </p>

        <h2 id="terms">Key terms, explained simply</h2>
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

        <h2 id="building">Think of your server like an office building</h2>
        <p>
          Before the technical diagram, here is the plain-English picture. Keep this in your head
          — every term above maps to something in this story.
        </p>
        <ServerDoors />
        <ul>
          <li>
            <strong>IP address</strong> is the building&apos;s street address. Every building
            needs one so post can find it.
          </li>
          <li>
            <strong>Port</strong> is the door number of one specific room. Door 22 leads to the
            security room (SSH). Door 80 leads to reception (website). Door 443 leads to the
            secure reception (HTTPS website). Door 5432 leads to the record room (your database).
            One building, many rooms, many doors — each one running something different.
          </li>
          <li>
            <strong>Security Group</strong> is the guard standing at the main gate. By default,
            the guard says <strong>no</strong> to everyone. Nobody enters unless you give a
            specific instruction: &ldquo;let people through door 80 and door 443 only.&rdquo;
            Every other door stays locked, even if something useful sits right behind it.
          </li>
          <li>
            <strong>localhost</strong> means a room only reachable by someone already inside the
            building. <strong>0.0.0.0</strong> means the room is open to the whole building
            network — but the guard at the gate still decides if outsiders can enter the building
            at all.
          </li>
          <li>
            <strong>Nginx</strong> is the receptionist. Visitors don&apos;t wander straight to any
            room. They knock on the receptionist&apos;s door (80/443, the only doors the guard
            allows), and the receptionist quietly walks them to the real room inside — your
            Next.js app, sitting privately on door 3000, a room outsiders could never reach
            directly.
          </li>
        </ul>
        <Callout kind="note" label="The full journey in one line">
          <p className="mb-0">
            Browser knocks on your building&apos;s address, door 443 → security guard checks the
            rule list, allows it → receptionist (Nginx) answers → receptionist quietly walks the
            visitor to the real room (your Next.js app) inside, which no outsider could ever reach
            directly.
          </p>
        </Callout>

        <h2 id="architecture">Architecture — the full request flow</h2>
        <p>
          Now the same journey, drawn as a technical diagram. Notice that port 3000 never appears
          anywhere in the path from the outside — only Nginx is exposed. This is the real
          production pattern.
        </p>
        <RequestFlow />

        <h2 id="ports">Common ports you&apos;ll actually use</h2>
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

        <h2 id="tcp-udp">TCP vs UDP — why it matters for your stack</h2>
        <ul>
          <li>
            <strong>TCP</strong> is like a phone call where you keep saying &ldquo;did you hear
            that? okay, next sentence.&rdquo; Slower, but nothing gets missed. Used for websites,
            databases, logins — anywhere losing a piece of data is unacceptable.
          </li>
          <li>
            <strong>UDP</strong> is like shouting instructions to someone walking away — fast, but
            if they miss a word, nobody repeats it. Used for video calls, quick DNS lookups, live
            gaming — anywhere speed matters more than perfection.
          </li>
        </ul>
        <p>
          Your entire web app (HTTP requests, database connections, SSH) uses TCP. UDP mainly
          shows up in DNS lookups (Lesson 3) and live video/voice features, if you ever add them. For almost
          everything you build: <strong>TCP is your world.</strong>
        </p>
        <Callout kind="note" label="A quick word on IP ranges (CIDR)">
          <p className="mb-0">
            You will see addresses written like <code>10.0.0.0/16</code>. The number after the
            slash tells you how many addresses are in that block — a smaller number means a bigger
            range. <code>/16</code> is about 65,000 addresses, <code>/24</code> is about 256
            addresses, and <code>/32</code> is exactly one. Full detail comes with VPCs in a later
            lesson; for now just recognise the notation.
          </p>
        </Callout>

        <h2 id="security-groups">Security Groups — in detail</h2>
        <p>
          A Security Group is a <strong>virtual firewall</strong> attached directly to your EC2
          server. If the whole building has a guard at the main gate, a Security Group is that
          guard — checking every visitor before they can even knock.
        </p>
        <Callout kind="warn" label="The most important rule to remember">
          <p className="mb-0">
            The moment you create an EC2 server, its Security Group blocks{" "}
            <strong>all inbound traffic by default</strong>. Nothing gets in — not HTTP, not SSH,
            nothing — until you personally write a rule that allows it. This is called{" "}
            <strong>allow-listing</strong>, and it is the safest possible starting point.
          </p>
        </Callout>
        <p>
          Outbound traffic (your server calling out to the internet, such as downloading npm
          packages) is allowed by default, so your server still functions normally while staying
          locked down from the outside.
        </p>

        <h3>Security Groups are &ldquo;stateful&rdquo;</h3>
        <p>
          If you allow an inbound request on port 443, the <strong>response</strong> to that
          request is automatically allowed back out — no separate outbound rule is needed. The
          guard remembers who was let in and automatically lets the reply go back to that same
          visitor.
        </p>
        <p>
          This matters because AWS also has a stricter firewall called a{" "}
          <strong>Network ACL</strong> (covered with VPCs later), which is <em>stateless</em> —
          you must write rules for both directions separately. Security Groups are the simpler,
          friendlier one, and cover 95% of your daily work.
        </p>

        <h3>Every rule has four parts</h3>
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

        <h3>A real, production-style setup for your Next.js app server</h3>
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
              <td>Never exposed publicly — Nginx handles it internally</td>
            </tr>
          </tbody>
        </table>

        <h3>A different setup for your RDS PostgreSQL database</h3>
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
                Only your app server can reach the database — nothing else on the internet can
                even attempt to connect
              </td>
            </tr>
          </tbody>
        </table>
        <p>
          That last row is one of the most important patterns in real AWS setups: instead of
          writing an IP address as the source, you write{" "}
          <strong>another security group&apos;s ID</strong>. This means &ldquo;only traffic from
          servers belonging to this other group is allowed.&rdquo; Even if your app server&apos;s
          IP changes, the rule still works, and the database stays completely invisible to the
          public internet.
        </p>

        <Callout kind="warn" label="The #1 beginner security mistake">
          <p className="mb-0">
            Setting SSH (port 22) source to <code>0.0.0.0/0</code> — &ldquo;anyone in the world
            can attempt to log in.&rdquo; The moment an EC2 server goes live with this setting,
            automated bots start hammering it with login attempts within minutes. Always restrict
            SSH to your own IP address, using <code>/32</code> to mean &ldquo;exactly this one
            address, nothing else.&rdquo;
          </p>
        </Callout>

        <h3>Managing security groups with the AWS CLI</h3>
        <CommandList
          title="Security groups"
          commands={[
            {
              cmd: 'aws ec2 create-security-group --group-name myapp-app-sg --description "App server"',
              note: "Create a new security group. The output gives you its GroupId (sg-...)",
            },
            {
              cmd: "aws ec2 authorize-security-group-ingress --group-id sg-0123456789abcdef0 --protocol tcp --port 443 --cidr 0.0.0.0/0",
              note: "Allow HTTPS from anywhere",
            },
            {
              cmd: "aws ec2 authorize-security-group-ingress --group-id sg-0123456789abcdef0 --protocol tcp --port 22 --cidr 103.45.12.8/32",
              note: "Allow SSH only from your own IP",
            },
            {
              cmd: "aws ec2 describe-security-groups --group-ids sg-0123456789abcdef0",
              note: "See all current rules",
            },
          ]}
        />
        <Callout kind="note" label="Good to know">
          <p className="mb-0">
            A single EC2 server can have multiple security groups attached at once, and AWS
            combines all their rules together. This lets you organise cleanly — one group for basic
            web access, another for admin/SSH access, another for internal database access — and
            mix and match per server.
          </p>
        </Callout>

        <h2 id="real-example">Real example — a debugging story</h2>
        <p>
          You deploy your Next.js app. You open the browser on your laptop, type the server&apos;s
          address — nothing loads. Here is exactly how to think through it, step by step.
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
              If nothing shows up, the app isn&apos;t running at all — fix that first, before
              touching networking.
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
              In production, keeping it on <code>127.0.0.1</code> and using Nginx in front is the
              safer, correct pattern.
            </p>
          </li>
          <li>
            <h3>&ldquo;Did the guard even let me near the door?&rdquo;</h3>
            <p>From your own laptop, test whether the port is reachable at all.</p>
            <CommandList
              title="From your laptop"
              commands={[
                { cmd: "nc -zv <your-ec2-public-ip> 3000", note: "Two very different answers mean two very different problems:" },
              ]}
            />
            <ul>
              <li>
                <strong className="text-red-300">&ldquo;Connection refused&rdquo;</strong> —
                someone opened the door and said nobody lives here. Nothing is running on that
                port.
              </li>
              <li>
                <strong className="text-red-300">&ldquo;Connection timed out&rdquo;</strong> —
                you&apos;re not even allowed near the door. The Security Group is blocking you
                before you get close. This is the single most common beginner mistake.
              </li>
            </ul>
          </li>
        </ol>
        <Callout kind="ok" label="The three-check sequence">
          <p className="mb-0">
            Almost every &ldquo;my app doesn&apos;t load&rdquo; problem on AWS traces back to one
            of these three checks. Learn this sequence once, and you will debug networking issues
            in minutes instead of hours.
          </p>
        </Callout>

        <h2 id="commands">Commands reference</h2>
        <CommandList
          title="Find your IP addresses"
          commands={[
            { cmd: "curl ifconfig.me", note: "Your public IP, as seen from the internet" },
            { cmd: "hostname -I", note: "Your private IP inside the network" },
          ]}
        />
        <CommandList
          title="Reachability"
          commands={[
            { cmd: "ping google.com", note: "Basic reachability (often blocked in cloud — that's normal)" },
            { cmd: "nc -zv example.com 443", note: "Is a specific port open? (Mac/Linux)" },
            { cmd: "telnet example.com 443", note: "Older, works everywhere" },
            { cmd: "traceroute google.com", note: "Trace the path a request takes (Windows: tracert)" },
          ]}
        />
        <CommandList
          title="What is listening"
          commands={[
            { cmd: "sudo ss -tulpn", note: <>Every listening port and its interface. <code>127.0.0.1:3000</code> = local only · <code>0.0.0.0:3000</code> = open to outside (if firewall allows)</> },
            { cmd: "curl -I http://localhost:3000", note: <>Test an HTTP response directly. <code>-I</code> = headers only, fast check</> },
            { cmd: "curl -I https://yourapp.com", note: "Same check, from the outside through the whole path" },
          ]}
        />
        <Callout kind="note" label="A real cost note, since it's networking-related">
          <p className="mb-0">
            AWS traffic <strong>into</strong> your server (data transfer IN) is free. Traffic{" "}
            <strong>out</strong> to the internet (data transfer OUT) is billed, roughly $0.09/GB
            after a small free tier. This becomes relevant once your app has real users downloading
            PDFs or images — we size this properly in the cost lesson.
          </p>
        </Callout>

        <hr />

        <h2 id="practice">Practice task before Lesson 3</h2>
        <p>
          Still no EC2 needed. Your own laptop is a server too — it has an IP, ports, and a
          process listening on one of them. Run your Next.js app and inspect it the way you would
          on a real server.
        </p>
        <Script
          title="practice.sh"
          code={`# 1. Who am I on the network?
curl ifconfig.me                       # public IP — what the internet sees
hostname -I 2>/dev/null || ipconfig getifaddr en0   # private IP (Linux || Mac)

# 2. Start your app, then look at it from the outside
npm run dev &                          # Next.js on port 3000
sudo ss -tulpn | grep 3000             # Linux — which interface? 127.0.0.1 or 0.0.0.0 / *?
lsof -iTCP:3000 -sTCP:LISTEN           # Mac equivalent

# 3. Knock on the door three ways
curl -I http://localhost:3000          # from inside — expect HTTP/1.1 200
nc -zv 127.0.0.1 3000                  # expect "succeeded"
nc -zv 127.0.0.1 3001                  # nothing there — expect "Connection refused"

# 4. Watch a real TLS website answer on 443
nc -zv google.com 443
curl -I https://google.com

# 5. Read your own CIDR: how many addresses do these hold?
#    10.0.0.0/16   10.0.1.0/24   103.45.12.8/32`}
        />
        <p>Then answer these in your own words:</p>
        <ol>
          <li>
            <code>nc</code> says &ldquo;Connection refused&rdquo; on 3001 but would say
            &ldquo;timed out&rdquo; on a locked EC2 port. Why are those two messages different,
            and which one points at the Security Group?
          </li>
          <li>
            Your app listens on <code>127.0.0.1:3000</code>. Nginx listens on <code>0.0.0.0:443</code>.
            Which of the two does the Security Group need a rule for, and why is that enough?
          </li>
          <li>
            Why is the RDS rule&apos;s source a <em>security group ID</em> instead of the app
            server&apos;s IP address?
          </li>
          <li>
            Write the three inbound rules (type, port, source) you would attach to your own app
            server. If any source is <code>0.0.0.0/0</code>, say why it is safe there.
          </li>
        </ol>
        <Callout kind="ok" label="Optional stretch">
          <p className="mb-0">
            In the AWS console open <strong>EC2 → Security Groups</strong> and create the
            <code>myapp-app-sg</code> group from this lesson with its three rules. A security group
            costs nothing on its own and is not attached to any server yet — but it will be ready
            the day you launch one.
          </p>
        </Callout>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          Networking on AWS is not mysterious once you hold on to the one idea from the top of this
          lesson: <strong>address, door, language</strong>. An IP finds the machine, a port picks
          the service on it, and TCP carries the conversation reliably. Everything else is a rule
          about who may knock on which door.
        </p>
        <ul>
          <li>
            <strong>Public vs private</strong>: only Nginx on 80/443 is ever public. Your app on{" "}
            <code>127.0.0.1:3000</code> and your database on 5432 stay private for their whole
            life.
          </li>
          <li>
            <strong>Security Groups</strong>: deny everything inbound by default, allow only what
            you list, stateful so replies come back on their own. SSH from your IP with{" "}
            <code>/32</code>, never from <code>0.0.0.0/0</code>.
          </li>
          <li>
            <strong>Group-to-group rules</strong>: the database allows the app server&apos;s
            security group, not an IP — so it stays invisible to the internet even when servers
            come and go.
          </li>
          <li>
            <strong>The three-check debug sequence</strong>: is the process running (
            <code>ps</code>, <code>ss</code>)? Which interface is it bound to? Can the port be
            reached from outside (<code>nc -zv</code>)? &ldquo;Refused&rdquo; means nothing is
            listening; &ldquo;timed out&rdquo; means the firewall.
          </li>
        </ul>
        <p>
          You now know what Vercel was quietly doing for you every time you clicked deploy — and
          you can do it yourself, on purpose, with the doors you choose.
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
