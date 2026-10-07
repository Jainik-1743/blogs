import type { Metadata } from "next";
import Callout from "@/components/Callout";
import VpcLayout from "@/components/figures/VpcLayout";
import InterviewQA from "@/components/InterviewQA";
import LessonIntro from "@/components/LessonIntro";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { getLesson } from "@/lib/lessons";

const lesson = getLesson("lesson-6")!;

export const metadata: Metadata = {
  title: `Lesson 6 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Concept: your own private network" },
  { id: "why-this-matters", label: "Why this matters" },
  { id: "building", label: "The analogy — an office building" },
  { id: "cidr", label: "IP ranges and CIDR, once and for all" },
  { id: "pieces", label: "The seven pieces of a VPC" },
  { id: "public-private", label: "What makes a subnet public or private" },
  { id: "security", label: "Security Groups vs Network ACLs" },
  { id: "nat", label: "NAT Gateway — and why it can raise your bill" },
  { id: "default-vpc", label: "The default VPC — and why we do not use it" },
  { id: "build", label: "Build it: the full VPC, step by step" },
  { id: "debugging", label: "When something cannot connect — the checklist" },
  { id: "cost", label: "What this costs" },
  { id: "interview", label: "Interview corner" },
  { id: "practice", label: "Practice task before Lesson 7" },
  { id: "conclusion", label: "Conclusion" },
];

const pieces: [string, string, string][] = [
  ["VPC", "Your whole private network. It has one address range and lives inside one AWS region.", "10.0.0.0/16"],
  ["Subnet", "A smaller slice of the VPC’s address range. It lives in exactly one Availability Zone.", "10.0.1.0/24 in ap-south-1a"],
  ["Route table", "A list of rules that say “traffic going to X, send it to Y”. Every subnet uses one.", "0.0.0.0/0 → igw-…"],
  ["Internet Gateway (IGW)", "A VPC component that connects the VPC to the public internet, like a front door. Free. One per VPC.", "igw-0abc…"],
  ["NAT Gateway", "A one-way door. Private servers can call out to the internet, but nobody can call in.", "nat-0abc… (paid)"],
  ["Security Group", "A firewall attached to a resource (server, database or load balancer). It lists which traffic is allowed.", "web-sg, db-sg"],
  ["Network ACL", "A basic firewall attached to a whole subnet. You rarely edit it.", "default: allow all"],
];

const checklist: [string, string, string][] = [
  ["1", "Is the instance running and did it pass both status checks?", "EC2 → Instances → Status check column"],
  ["2", "Does it have a public IP (or Elastic IP)?", "A private-only instance can never be reached from the internet"],
  ["3", "Does the Security Group allow this port from your IP?", "Inbound rules — most common cause, by far"],
  ["4", "Does the subnet’s route table have 0.0.0.0/0 → igw?", "This is what makes a subnet public"],
  ["5", "Does the Network ACL allow it in both directions?", "Default NACL allows everything; custom ones deny by default"],
  ["6", "Is a program really listening on that port on the server?", "Run ss -tlnp on the server. A port with no program behind it is not a firewall problem"],
  ["7", "Is the server’s own firewall (ufw) blocking it?", "Ubuntu AMIs have ufw turned off, but check with: sudo ufw status"],
];

export default function LessonSixPage() {
  return (
    <article>
      <LessonIntro lesson={lesson} outline={outline} />

      <div className="lesson">
        <h2 id="concept">Concept</h2>
        <p>
          A <strong>VPC</strong> (Virtual Private Cloud) is <strong>your own private network
          inside AWS</strong>. It is a part of AWS&apos;s huge data centres that belongs only to
          you. It has its own range of IP addresses, its own doors to the internet and its own
          firewalls. (An IP address is the number that identifies a computer on a network. A
          firewall is a filter that allows or blocks network traffic.) Nothing gets in or out
          unless you built a door for it.
        </p>
        <p>
          In Lesson 2 you learned how a request travels across the internet to a server. A VPC is{" "}
          <em>the network on the server&apos;s side of that journey</em>. On Vercel this layer is
          hidden. On AWS you design it yourself.
        </p>
        <Callout kind="ok" label="A VPC costs nothing">
          <p className="mb-0">
            The VPC, subnets, route tables, Internet Gateway and Security Groups are all free. You
            only pay for the <em>things you put inside</em> (servers, databases). You also pay
            for one optional piece, the NAT Gateway, which we cover carefully below.
          </p>
        </Callout>

        <h2 id="why-this-matters">Why this matters</h2>
        <p>Many serious AWS mistakes are networking mistakes:</p>
        <ul>
          <li>
            A database is launched with a public IP and a Security Group that allows{" "}
            <code>0.0.0.0/0</code> (every address on the internet) on port 5432 (the PostgreSQL
            port). Within hours, bots try passwords against it. This is how many &ldquo;company X
            leaked millions of records&rdquo; stories begin.
          </li>
          <li>
            A server &ldquo;cannot be reached&rdquo; for two days, because nobody knew that the{" "}
            <em>route table</em> was the problem and not the Security Group.
          </li>
          <li>
            A NAT Gateway is left running for a month. It quietly costs more than the servers.
          </li>
        </ul>
        <p>
          A well-designed VPC makes the safe choice the default. The database <em>physically
          cannot</em> be reached from the internet, because there is no path to it. This is much
          stronger than a firewall rule that you hope nobody edits.
        </p>
        <Callout kind="note" label="Fresher or four years in — same idea">
          <p className="mb-0">
            If you are new, use this lesson to learn the words you will see in every AWS diagram.
            If you have some experience, keep the main idea. A subnet is public <em>only</em>{" "}
            because of one route-table row. Security has two separate layers (the network shape
            and the firewall), and both should say no.
          </p>
        </Callout>

        <h2 id="building">The analogy — an office building</h2>
        <p>Picture a company that rents a whole building.</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>In the building</th>
                <th>In AWS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>The building itself, with its own address block</td>
                <td><strong>VPC</strong></td>
              </tr>
              <tr>
                <td>Floors (some open to visitors, some staff-only)</td>
                <td><strong>Subnets</strong> (public / private)</td>
              </tr>
              <tr>
                <td>The main entrance on the street</td>
                <td><strong>Internet Gateway</strong></td>
              </tr>
              <tr>
                <td>Signs in the lift: “visitors → floor 1, finance → floor 3”</td>
                <td><strong>Route tables</strong></td>
              </tr>
              <tr>
                <td>A guard at each office door checking a list of names</td>
                <td><strong>Security Groups</strong></td>
              </tr>
              <tr>
                <td>A guard at each floor&apos;s lift lobby</td>
                <td><strong>Network ACLs</strong></td>
              </tr>
              <tr>
                <td>A phone line staff can dial <em>out</em> on, but nobody can dial <em>in</em> on</td>
                <td><strong>NAT Gateway</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          The reception desk and the shop front are on the public floor. The finance department
          and the safe are on a staff-only floor with <strong>no door to the street at all</strong>.
          This one design choice does most of the security work.
        </p>

        <h2 id="cidr">IP ranges and CIDR, once and for all</h2>
        <p>
          <strong>CIDR</strong> (Classless Inter-Domain Routing) is a short way to write a whole
          range of IP addresses, such as <code>10.0.0.0/16</code>. You met it in Lesson 2. Now it
          is practical, because AWS asks you to choose a range when you create a VPC. The rule is
          short:
        </p>
        <Callout kind="note" label="The only CIDR rule you need">
          <p className="mb-0">
            An IPv4 address has 32 bits (32 on/off switches). In <code>10.0.0.0/16</code>, the
            number after the slash says that the first 16 bits are fixed and the other 16 are
            free. The count of addresses is <strong>2^(32 − prefix)</strong>. So /16 = 65,536
            addresses, /24 = 256, /28 = 16, and /32 = exactly one.
          </p>
        </Callout>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>CIDR</th>
                <th>Addresses</th>
                <th>Typical use</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>10.0.0.0/16</code></td>
                <td>65,536</td>
                <td>The whole VPC (the largest AWS allows is /16)</td>
              </tr>
              <tr>
                <td><code>10.0.1.0/24</code></td>
                <td>256 (251 usable)</td>
                <td>One subnet</td>
              </tr>
              <tr>
                <td><code>10.0.1.0/28</code></td>
                <td>16 (11 usable)</td>
                <td>The smallest AWS subnet</td>
              </tr>
              <tr>
                <td><code>203.0.113.7/32</code></td>
                <td>1</td>
                <td>&ldquo;Only my office IP&rdquo; in a Security Group</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <strong>Why 251 and not 256?</strong> AWS keeps five addresses in every subnet for its own
          use: the network address, the VPC router, the DNS server, one saved for future use, and
          the broadcast address. (The router passes traffic between networks. DNS turns names into
          IP addresses. A broadcast address sends a message to every device at once.) This is a
          favourite interview question.
        </p>
        <h3>Choosing the range — three practical rules</h3>
        <ul>
          <li>
            Use a <strong>private range</strong>: <code>10.0.0.0/8</code>,{" "}
            <code>172.16.0.0/12</code> or <code>192.168.0.0/16</code>. These ranges are reserved
            for private networks and are never used on the public internet.
          </li>
          <li>
            <strong>Do not overlap</strong> with any network you may connect later, such as your
            office, a second VPC or a partner. Two networks with the same range cannot be joined.
            This is hard to fix afterwards, so real teams plan the ranges on paper first.
          </li>
          <li>
            Leave room to grow. A /16 VPC with /24 subnets costs nothing. It gives you room for 256
            subnets of 251 usable addresses each.
          </li>
        </ul>

        <h2 id="pieces">The seven pieces of a VPC</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Piece</th>
                <th>What it does</th>
                <th>Example</th>
              </tr>
            </thead>
            <tbody>
              {pieces.map(([name, what, example]) => (
                <tr key={name}>
                  <td className="whitespace-nowrap"><strong>{name}</strong></td>
                  <td>{what}</td>
                  <td><code>{example}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>Here is the layout this whole course builds. Read it top to bottom, like a request would.</p>
        <VpcLayout />
        <h3>Availability Zones — why we make four subnets, not two</h3>
        <p>
          A <strong>region</strong> is a geographic area where AWS runs data centres, such as{" "}
          <code>ap-south-1</code> (Mumbai). Each region has several separate groups of data
          centres called <strong>Availability Zones</strong> (AZs), for example{" "}
          <code>ap-south-1a</code>, <code>1b</code> and <code>1c</code>. They are far enough apart
          that a fire or a power cut in one does not affect the others.
        </p>
        <p>
          A subnet lives in <em>one</em> AZ. To survive the failure of an AZ, you need each kind of
          subnet in at least two AZs. Two services require this later:
        </p>
        <ul>
          <li>
            The <strong>load balancer</strong> (Lesson 12) needs subnets in at least two AZs. A
            load balancer is a service that shares incoming requests between several servers.
          </li>
          <li>
            An <strong>RDS subnet group</strong> (Lesson 8) needs subnets in at least two AZs, even
            if you run only one database. RDS is the AWS managed database service.
          </li>
        </ul>
        <p>
          So we create <strong>four subnets</strong>: one public and one private in AZ{" "}
          <code>a</code>, and one public and one private in AZ <code>b</code>. This is cheap
          (subnets are free) and saves you a rebuild later.
        </p>

        <h2 id="public-private">What makes a subnet public or private</h2>
        <p>
          Many people misunderstand this idea in AWS networking, but it is simple.
        </p>
        <Callout kind="warn" label="The definition — memorise it">
          <p className="mb-0">
            A subnet is <strong>public</strong> if its route table has a row{" "}
            <code>0.0.0.0/0 → Internet Gateway</code>. A subnet is <strong>private</strong> if it
            does not. <em>There is no &ldquo;public&rdquo; checkbox on the subnet itself.</em>
          </p>
        </Callout>
        <p>
          A route table works like the signs in a lift. When traffic leaves, AWS looks for the
          row with the most specific matching range first. Here are two examples:
        </p>
        <Script
          title="Route table of a PUBLIC subnet"
          code={`Destination       Target
10.0.0.0/16       local          # anything inside the VPC stays inside
0.0.0.0/0         igw-0abc123    # everything else goes out the front door`}
        />
        <Script
          title="Route table of a PRIVATE subnet"
          code={`Destination       Target
10.0.0.0/16       local          # can talk to other subnets in this VPC
                                 # no 0.0.0.0/0 row = no path to the internet at all`}
        />
        <p>
          The <code>local</code> row is added automatically and cannot be deleted. It is the reason
          an app server in a public subnet can reach a database in a private subnet with no extra
          setup. Inside the VPC, every subnet has a route to every other subnet.{" "}
          <em>Security Groups</em>, not routes, decide who is actually allowed in.
        </p>
        <h3>A public subnet is not enough — the public IP</h3>
        <p>
          For a server to be reachable from the internet, it needs <strong>both</strong> a public
          subnet <strong>and</strong> a public IP address. The public IP can be assigned
          automatically, or it can be an Elastic IP (a fixed public address, from Lesson 7). A
          server in a public subnet without a public IP can talk to other servers inside the VPC.
          It cannot reach the internet, and the internet cannot reach it. The reason is that the
          IGW only translates addresses for instances that have a public one. This is a common
          mistake. Remember: you need the route <em>and</em> the public IP.
        </p>

        <h2 id="security">Security Groups vs Network ACLs</h2>
        <p>
          You have used Security Groups since Lesson 2. AWS also gives you a second, older
          firewall called a <strong>Network ACL</strong> (NACL, where ACL means access control
          list). Here is how they differ. The question &ldquo;explain SG vs NACL&rdquo; is asked in
          almost every AWS interview.
        </p>
        <p>
          Two words in the table need a plain explanation. <strong>Stateful</strong> means the
          firewall remembers a connection. If a request is allowed in, the reply is allowed out
          automatically. <strong>Stateless</strong> means the firewall remembers nothing, so you
          must write a rule for the reply traffic too.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Security Group</th>
                <th>Network ACL</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Attached to</strong></td>
                <td>A resource (instance, database, load balancer)</td>
                <td>A whole subnet</td>
              </tr>
              <tr>
                <td><strong>Rule types</strong></td>
                <td>Allow only</td>
                <td>Allow and Deny</td>
              </tr>
              <tr>
                <td><strong>State</strong></td>
                <td>Stateful — replies are allowed automatically</td>
                <td>Stateless — you must allow the return traffic yourself</td>
              </tr>
              <tr>
                <td><strong>Rule evaluation</strong></td>
                <td>All rules together</td>
                <td>Numbered, lowest number first, first match wins</td>
              </tr>
              <tr>
                <td><strong>Default</strong></td>
                <td>Inbound: deny all. Outbound: allow all</td>
                <td>Default NACL allows everything</td>
              </tr>
              <tr>
                <td><strong>You edit it</strong></td>
                <td>Constantly</td>
                <td>Almost never</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <strong>Our rule:</strong> leave the NACL at its default (allow all) and do your real work
          with Security Groups. Use a NACL only for one job that Security Groups cannot do:{" "}
          <em>block</em> a bad IP range for a whole subnet.
        </p>
        <h3>The best Security Group trick — reference another group</h3>
        <p>
          Instead of an IP address, a rule can name <em>another Security Group</em> as the source.
          This keeps the database private, even when you add more servers:
        </p>
        <Script
          title="Security Groups we create in this lesson"
          code={`alb-sg   inbound: 80, 443   from 0.0.0.0/0        # the public front door
web-sg   inbound: 80, 443   from alb-sg           # only the load balancer may talk to servers
         inbound: 22        from YOUR-IP/32       # only you may SSH
db-sg    inbound: 5432      from web-sg           # only app servers may reach Postgres
cache-sg inbound: 6379      from web-sg           # only app servers may reach Redis`}
        />
        <p>
          Auto Scaling is the AWS feature that adds or removes servers when traffic changes. When
          it launches a tenth server, that server joins <code>web-sg</code> and may reach the
          database at once. There is no rule to edit and no IP to allow. A stranger who has the
          database password still cannot connect, because their machine is not in{" "}
          <code>web-sg</code>. Layer one (the private subnet) and layer two (the Security Group)
          both say no.
        </p>

        <h2 id="nat">NAT Gateway — and why it can raise your bill</h2>
        <p>
          Here is a real problem. A server in the private subnet needs to download operating-system
          security updates. But it has no route to the internet. That was the whole point. How does
          it reach the update servers?
        </p>
        <p>
          A <strong>NAT Gateway</strong> (NAT means Network Address Translation) is an AWS service
          that lets private servers start connections to the internet without being reachable from
          it. It sits in a <em>public</em> subnet. Private servers send their outbound traffic to
          it. It forwards the traffic using its own public IP and passes the replies back.
          Outsiders cannot start a connection to the private server. The door opens one way only,
          like a phone that can call out but has no number for people to call in.
        </p>
        <Callout kind="warn" label="The bill nobody warns you about">
          <p>
            A NAT Gateway costs roughly <strong>$0.056 per hour (about $40 a month) plus $0.056
            per GB</strong> it processes in Mumbai. The hourly charge applies even when it is idle.
            For a small project this can be double the cost of everything else together. Prices
            change, so check the current VPC pricing page.
          </p>
          <p className="mb-0">
            Many beginners create one in the wizard, forget it, and find the cost a month later.
          </p>
        </Callout>
        <h3>Ways to avoid paying for it</h3>
        <ul>
          <li>
            <strong>Our approach in this course: skip the NAT.</strong> The database never needs to
            call the internet, because AWS patches RDS for you. Only the app servers need outbound
            access. They live in the public subnet, where the Internet Gateway gives it to them
            for free.
          </li>
          <li>
            <strong>VPC endpoints</strong> are private doors from your VPC to an AWS service. The{" "}
            <strong>Gateway type, for S3 and DynamoDB, is free.</strong> It lets private servers
            reach S3 without a NAT and without using the internet. Add one whenever a private
            server talks to S3.
          </li>
          <li>
            <strong>Interface endpoints</strong> (for SSM, ECR, Secrets Manager and others) cost
            about $0.011 per hour per AZ. This can be cheaper than a NAT if you need only a few
            services.
          </li>
          <li>
            <strong>Real production</strong> usually does use a NAT (one per AZ, so that one AZ
            failure does not cut off the others). If your traffic is high, it is worth it. At the
            size of this course, it is not.
          </li>
        </ul>
        <Callout kind="note" label="Public IPv4 is not free either">
          <p className="mb-0">
            Since February 2024, AWS charges about $0.005 per hour (roughly $3.60 a month) for every
            public IPv4 address. This includes the ones on your own servers and load balancers. It
            is small for one address, but it is a good reason not to give public IPs to things that
            do not need them.
          </p>
        </Callout>

        <h2 id="default-vpc">The default VPC — and why we do not use it</h2>
        <p>
          Every region in a new AWS account already has a <strong>default VPC</strong>. It has a
          public subnet in every AZ and an Internet Gateway attached. This is why the
          &ldquo;launch instance&rdquo; wizard works for a beginner: it puts your server in the
          default VPC without telling you.
        </p>
        <p>The default VPC is fine for learning EC2 in ten minutes. It is wrong for real work:</p>
        <ul>
          <li>Every subnet is public, so there is nowhere safe to put a database.</li>
          <li>Instances get public IPs by default.</li>
          <li>You did not design it, so you do not know exactly what is in it.</li>
        </ul>
        <p>
          You should know that it exists and that you can leave it alone. Do not delete it,
          because some services expect it. We build our own VPC.
        </p>

        <h2 id="build">Build it: the full VPC, step by step</h2>
        <p>
          The console builds most of this on one screen. Take your time and read each field. Every
          box matches one piece from the diagram above. In Lesson 15 you will write the same
          network as code with Terraform (a tool that creates cloud resources from text files).
        </p>
        <ol className="steps">
          <li>
            <h3>Create the VPC and its subnets</h3>
            <p>
              VPC → <strong>Create VPC</strong> → choose <strong>VPC and more</strong>. Name it{" "}
              <code>myapp</code>, CIDR <code>10.0.0.0/16</code>, <strong>2</strong> Availability
              Zones, <strong>2</strong> public and <strong>2</strong> private subnets, NAT gateways{" "}
              <strong>None</strong> (they cost money — see above), VPC endpoints{" "}
              <strong>None</strong>, and keep DNS hostnames enabled (RDS endpoint names need it).
            </p>
            <p>
              The preview on the right is the resource map. It shows four subnets, one Internet
              Gateway and route tables that are already connected. Create it.
            </p>
          </li>
          <li>
            <h3>Read what the wizard made</h3>
            <p>
              Open the <strong>public</strong> route table: it has the <code>local</code> row plus{" "}
              <code>0.0.0.0/0 → igw-…</code>. That one row is the whole difference between public
              and private. The private route tables have only <code>local</code>. An Internet
              Gateway that no route points to does nothing. The route is the sign that sends
              traffic to the door.
            </p>
            <p>
              On each public subnet, turn on <strong>auto-assign public IPv4</strong> (Edit subnet
              settings), so servers launched there get a public address.
            </p>
          </li>
          <li>
            <h3>Create the three Security Groups</h3>
            <p>EC2 → Security Groups → Create, in the <code>myapp</code> VPC:</p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Group</th>
                    <th>Inbound rule</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>alb-sg</code></td>
                    <td>HTTP 80, HTTPS 443</td>
                    <td><code>0.0.0.0/0</code> — the whole internet</td>
                  </tr>
                  <tr>
                    <td><code>web-sg</code></td>
                    <td>HTTP 80, HTTPS 443</td>
                    <td>the group <code>alb-sg</code></td>
                  </tr>
                  <tr>
                    <td><code>web-sg</code></td>
                    <td>SSH 22</td>
                    <td>&ldquo;My IP&rdquo; (a <code>/32</code>)</td>
                  </tr>
                  <tr>
                    <td><code>db-sg</code></td>
                    <td>PostgreSQL 5432</td>
                    <td>the group <code>web-sg</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              For the group-to-group rules, type <code>sg-</code> in the source box and pick the
              group by name. This is the trick from above: the rule follows the servers, not their
              IP addresses.
            </p>
            <Callout kind="warn" label="Your IP changes">
              <p className="mb-0">
                Home and mobile connections often get a new IP address after some days. If SSH
                suddenly times out next week, update the &ldquo;My IP&rdquo; rule. SSH is the secure
                remote login tool, and it uses port 22. In Lesson 18 you will remove port 22 and
                use SSM Session Manager instead (an AWS tool that opens a shell without any open
                port).
              </p>
            </Callout>
          </li>
          <li>
            <h3>Write down the IDs</h3>
            <p>
              Later lessons ask for &ldquo;the private subnets&rdquo; or &ldquo;web-sg&rdquo;.
              Keep a note of the VPC ID, the four subnet IDs and the three Security Group IDs. The
              console shows them all on the VPC&apos;s resource map.
            </p>
          </li>
        </ol>

        <h2 id="debugging">When something cannot connect — the checklist</h2>
        <p>
          Sooner or later you will watch an <code>ssh</code> command hang or a browser spinner
          turn forever. Do not guess. Check the request&apos;s path <em>in order</em>. A packet is
          a small piece of data sent over the network, so follow the packet:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Question</th>
                <th>Where to look</th>
              </tr>
            </thead>
            <tbody>
              {checklist.map(([n, q, where]) => (
                <tr key={n}>
                  <td>{n}</td>
                  <td>{q}</td>
                  <td>{where}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3>Read the symptom, not just the failure</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>What you see</th>
                <th>What it usually means</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>Connection timed out</code> (hangs)</td>
                <td>Something is <em>silently dropping</em> the packets: a Security Group, a route table or a NACL. Nothing answered at all.</td>
              </tr>
              <tr>
                <td><code>Connection refused</code> (instant)</td>
                <td>The packet <em>arrived</em>, but no program is listening on that port. The network is fine. The app is not running, or it listens on the wrong address.</td>
              </tr>
              <tr>
                <td><code>Permission denied (publickey)</code></td>
                <td>The network is fine. The key file is wrong, the username is wrong (use <code>ubuntu</code> on Ubuntu, not <code>ec2-user</code>), or the <code>.pem</code> file permissions are too open.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout kind="ok" label="A useful tool: VPC Reachability Analyzer">
          <p className="mb-0">
            In the console, go to VPC → Reachability Analyzer. Pick a source and a destination. AWS
            then tells you <em>exactly which part</em> (Security Group, route or NACL) blocks the
            path. It costs about $0.10 per analysis and can save hours.
          </p>
        </Callout>

        <h2 id="cost">What this costs</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Cost in Mumbai (approx.)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>VPC, subnets, route tables, Security Groups, NACLs</td><td className="font-semibold text-emerald-300">Free</td></tr>
              <tr><td>Internet Gateway</td><td className="font-semibold text-emerald-300">Free (you pay for data leaving AWS)</td></tr>
              <tr><td>Gateway endpoint for S3</td><td className="font-semibold text-emerald-300">Free</td></tr>
              <tr><td>Public IPv4 address, each</td><td>~$0.005/hour (~$3.60/month)</td></tr>
              <tr><td>NAT Gateway</td><td>~$0.056/hour + ~$0.056/GB (~$40/month idle)</td></tr>
              <tr><td>Interface endpoint, each per AZ</td><td>~$0.011/hour (~$8/month)</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Everything you built above is free. We are deliberately <strong>not</strong> creating a
          NAT Gateway in this course.
        </p>

        <h2 id="interview">Interview corner</h2>
        <p>
          Read the question and try to answer out loud in two sentences. Then open the answer.
          These questions come up in real AWS interviews.
        </p>
        <InterviewQA
          items={[
            {
              q: "What makes a subnet public?",
              a: (
                <p className="mb-0">
                  Its route table has a route for <code>0.0.0.0/0</code> that points to an Internet
                  Gateway. The subnet has no &ldquo;public&rdquo; setting of its own. Instances in
                  it also need a public IP or an Elastic IP to be reachable from the internet.
                </p>
              ),
            },
            {
              q: "Security Group vs Network ACL?",
              a: (
                <p className="mb-0">
                  Security Groups are stateful, attach to resources, and have only allow rules.
                  NACLs are stateless, attach to subnets, have both allow and deny rules, and are
                  checked in number order. In practice you manage Security Groups and leave NACLs at
                  the default.
                </p>
              ),
            },
            {
              q: "How can a private-subnet server download updates without being reachable from the internet?",
              a: (
                <p className="mb-0">
                  Through a NAT Gateway in a public subnet. Outbound connections go out and the
                  replies come back, but nobody outside can start a connection in. For S3 only, a
                  free Gateway VPC endpoint avoids the NAT completely.
                </p>
              ),
            },
            {
              q: "Why does a subnet have only 251 usable addresses in a /24?",
              a: (
                <p className="mb-0">
                  AWS keeps five addresses in each subnet: the network address, the VPC router, DNS,
                  one for future use, and the broadcast address.
                </p>
              ),
            },
            {
              q: "Your app in a public subnet cannot reach the internet, though the route to the IGW exists. Why?",
              a: (
                <p className="mb-0">
                  The instance has no public IP or Elastic IP. The Internet Gateway only translates
                  addresses for instances that have one. Also check the outbound Security Group
                  rules and the NACL.
                </p>
              ),
            },
            {
              q: "Design a VPC for a web app with a database. What goes where?",
              a: (
                <p className="mb-0">
                  One VPC, two AZs, and a public and a private subnet in each. Put the load balancer
                  in the public subnets. Put the app servers in public subnets (cheap) or private
                  subnets (stricter, but they need a NAT or endpoints). Put the database and cache in
                  private subnets, with Security Groups that accept traffic only from the app&apos;s
                  Security Group.
                </p>
              ),
            },
            {
              q: "Two VPCs need to talk to each other. What are the options and the catch?",
              a: (
                <p className="mb-0">
                  VPC peering is a direct link between two VPCs. It is simple, but it is not
                  transitive (if A peers with B and B peers with C, A still cannot reach C). Transit
                  Gateway is a central hub that connects many VPCs, and it costs more. The catch for
                  both: the CIDR ranges must not overlap.
                </p>
              ),
            },
          ]}
        />

        <hr />

        <h2 id="practice">Practice task before Lesson 7</h2>
        <p>
          Build the network from the previous section. Then check that it works as designed.
          Everything is free.
        </p>
        <ol>
          <li>
            Confirm four subnets, one Internet Gateway, one custom route
            table and three Security Groups exist in the console (VPC → Your VPCs → the resource
            map shows the picture).
          </li>
          <li>
            Open the resource map and find the line from the public route table to the IGW. Now
            delete that one route in the console. What do you predict happens to the public
            subnets? Add it back.
          </li>
          <li>
            Draw the VPC on paper without looking. Label each subnet with its CIDR, its AZ and
            whether it is public. Compare your drawing with the figure above.
          </li>
          <li>
            Write down, for each Security Group, <em>who</em> may connect on <em>which port</em>.
            Which of the three has a rule that names another group instead of an IP, and why is
            that better?
          </li>
          <li>
            Stretch: create a free S3 Gateway endpoint (VPC → Endpoints → Create → S3,
            type Gateway, pick your route tables). It adds a route to the table. Find it.
          </li>
        </ol>
        <Callout kind="ok" label="Cleaning up">
          <p className="mb-0">
            Nothing here costs money, so keep it all. Lessons 7 and 8 launch resources into these
            subnets. If you ever need to delete, work in reverse order: instances first, then
            Security Groups (not the default one), then detach and delete the IGW, then the
            subnets and route tables, and last the VPC.
          </p>
        </Callout>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          A VPC is a private building you rent inside AWS. Subnets are its floors. Route tables are
          the signs that decide where traffic goes. The Internet Gateway is the front door. Security
          Groups are the guards at each office.
        </p>
        <ul>
          <li>
            <strong>Public vs private</strong> is one route-table row: <code>0.0.0.0/0 → igw</code>.
            Delete it and the subnet is private.
          </li>
          <li>
            <strong>Two layers of safety</strong>: the database is in a private subnet <em>and</em>{" "}
            its Security Group accepts only the app&apos;s Security Group.
          </li>
          <li>
            <strong>Two AZs</strong> from day one, because the load balancer and RDS both demand
            it.
          </li>
          <li>
            <strong>NAT Gateways cost money and are easy to forget.</strong> Skip them until your
            traffic needs them. Use free S3 endpoints instead.
          </li>
          <li>
            <strong>Debug in path order</strong>: instance → public IP → Security Group → route →
            NACL → listening port. &ldquo;Timed out&rdquo; means something blocked the traffic.
            &ldquo;Refused&rdquo; means no program was listening.
          </li>
        </ul>
        <p>
          The network exists, but it is empty. Next we put the first real server in it: EC2.
        </p>

        <hr />
        <p>
          End of Lesson 6. Next: <strong>Lesson 7 — EC2: Launch Your First Server and Deploy
          Next.js Manually</strong>.
        </p>
      </div>

      <LessonPager slug={lesson.slug} />
    </article>
  );
}
