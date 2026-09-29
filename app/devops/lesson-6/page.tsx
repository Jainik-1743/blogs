import type { Metadata } from "next";
import Callout from "@/components/Callout";
import CommandList from "@/components/CommandList";
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
  { id: "nat", label: "NAT Gateway — and why it can wreck your bill" },
  { id: "default-vpc", label: "The default VPC — and why we do not use it" },
  { id: "build", label: "Build it: the full VPC, step by step" },
  { id: "debugging", label: "When something cannot connect — the checklist" },
  { id: "cost", label: "What this costs" },
  { id: "interview", label: "Interview corner" },
  { id: "practice", label: "Practice task before Lesson 7" },
  { id: "conclusion", label: "Conclusion" },
];

const pieces: [string, string, string][] = [
  ["VPC", "The whole private network. One address range, inside one AWS region.", "10.0.0.0/16"],
  ["Subnet", "A slice of the VPC that lives in exactly one Availability Zone.", "10.0.1.0/24 in ap-south-1a"],
  ["Route table", "A list of rules: “traffic going to X, send it to Y”. Every subnet uses one.", "0.0.0.0/0 → igw-…"],
  ["Internet Gateway (IGW)", "The VPC’s front door to the public internet. Free. One per VPC.", "igw-0abc…"],
  ["NAT Gateway", "A one-way door: private servers can call out, nobody can call in.", "nat-0abc… (paid)"],
  ["Security Group", "A firewall attached to a resource (server, database, load balancer).", "web-sg, db-sg"],
  ["Network ACL", "A coarse firewall attached to a whole subnet. Rarely edited.", "default: allow all"],
];

const checklist: [string, string, string][] = [
  ["1", "Is the instance running and did it pass both status checks?", "EC2 → Instances → Status check column"],
  ["2", "Does it have a public IP (or Elastic IP)?", "A private-only instance can never be reached from the internet"],
  ["3", "Does the Security Group allow this port from your IP?", "Inbound rules — most common cause, by far"],
  ["4", "Does the subnet’s route table have 0.0.0.0/0 → igw?", "This is what makes a subnet public"],
  ["5", "Does the Network ACL allow it in both directions?", "Default NACL allows everything; custom ones deny by default"],
  ["6", "Is something actually listening on that port on the server?", "ss -tlnp on the server. A closed port is not a firewall problem"],
  ["7", "Is the OS firewall (ufw) blocking it?", "Ubuntu AMIs ship with ufw disabled, but check: sudo ufw status"],
];

export default function LessonSixPage() {
  return (
    <article>
      <LessonIntro lesson={lesson} outline={outline} />

      <div className="lesson">
        <h2 id="concept">Concept</h2>
        <p>
          A <strong>VPC</strong> (Virtual Private Cloud) is <strong>your own private network
          inside AWS</strong>. It is a section of AWS&apos;s giant data centres that belongs to you
          alone, with its own range of IP addresses, its own doors to the internet, and its own
          firewalls. Nothing gets in or out unless you built a door for it.
        </p>
        <p>
          In Lesson 2 you learned how one request travels across the internet to a server. A VPC
          is <em>the network on the server&apos;s side of that journey</em> — and unlike Vercel,
          where this layer is invisible, on AWS you design it yourself.
        </p>
        <Callout kind="ok" label="A VPC costs nothing">
          <p className="mb-0">
            The VPC, subnets, route tables, Internet Gateway and Security Groups are all free. You
            only pay for the <em>things you put inside</em> (servers, databases) and for one
            optional piece, the NAT Gateway, which we treat carefully below.
          </p>
        </Callout>

        <h2 id="why-this-matters">Why this matters</h2>
        <p>Almost every serious AWS mistake is a networking mistake:</p>
        <ul>
          <li>
            A database launched with a public IP and a Security Group that says{" "}
            <code>0.0.0.0/0</code> on port 5432. Within hours, bots are trying passwords against it.
            This is how most &ldquo;company X leaked millions of records&rdquo; stories begin.
          </li>
          <li>
            A server that &ldquo;cannot be reached&rdquo; for two days because nobody knew the{" "}
            <em>route table</em> was the problem, not the Security Group.
          </li>
          <li>
            A NAT Gateway left running for a month that quietly cost more than the servers
            themselves.
          </li>
        </ul>
        <p>
          A well-designed VPC makes the safe choice the default: the database <em>physically
          cannot</em> be reached from the internet, because there is no path to it. That is far
          stronger than a firewall rule you hope nobody edits.
        </p>
        <Callout kind="note" label="Fresher or four years in — same idea">
          <p className="mb-0">
            If you are new, treat this lesson as learning the vocabulary of every AWS diagram you
            will ever see. If you have some experience, the value is the mental model: a subnet is
            public <em>only</em> because of one route-table row, and security is two independent
            layers (network shape + firewall) that should both say no.
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
          The reception desk and the shop-front live on the public floor. The finance department
          and the safe live on a staff-only floor with <strong>no door to the street at all</strong>.
          That single design decision does most of the security work.
        </p>

        <h2 id="cidr">IP ranges and CIDR, once and for all</h2>
        <p>
          You met CIDR in Lesson 2. Here it stops being theory, because AWS asks you to choose a
          range when you create a VPC. The rule is short:
        </p>
        <Callout kind="note" label="The only CIDR rule you need">
          <p className="mb-0">
            <code>10.0.0.0/16</code> means &ldquo;the first 16 bits are fixed, the remaining 16 are
            free&rdquo;. <strong>2^(32 − prefix) addresses.</strong> So /16 = 65,536 addresses,
            /24 = 256, /28 = 16, /32 = exactly one.
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
          <strong>Why 251 and not 256?</strong> AWS reserves five addresses in every subnet: the
          network address, the VPC router, the DNS server, one reserved for future use, and the
          broadcast address. It is a favourite interview trivia question.
        </p>
        <h3>Choosing the range — three practical rules</h3>
        <ul>
          <li>
            Use a <strong>private range</strong>: <code>10.0.0.0/8</code>,{" "}
            <code>172.16.0.0/12</code> or <code>192.168.0.0/16</code>. These are never routed on the
            public internet.
          </li>
          <li>
            <strong>Do not overlap</strong> with anything you may connect to later — your office
            network, a second VPC, a partner. Two networks with the same range cannot be joined.
            This is painful to fix afterwards, which is why real teams plan it on paper first.
          </li>
          <li>
            Leave room to grow. Making the VPC a /16 and each subnet a /24 costs nothing and gives
            you 256 subnets of 251 addresses each.
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
          A region such as <code>ap-south-1</code> (Mumbai) is made of several separate data
          centres called <strong>Availability Zones</strong> (AZs): <code>ap-south-1a</code>,{" "}
          <code>1b</code>, <code>1c</code>. They are far enough apart that a fire or power cut in one
          does not touch the others.
        </p>
        <p>
          A subnet lives in <em>one</em> AZ. So to survive an AZ failure you need each kind of
          subnet in at least two AZs. Two services force this on you later:
        </p>
        <ul>
          <li>
            The <strong>load balancer</strong> (Lesson 12) needs subnets in at least two AZs.
          </li>
          <li>
            An <strong>RDS subnet group</strong> (Lesson 8) needs subnets in at least two AZs, even
            if you only run a single database.
          </li>
        </ul>
        <p>
          So we create <strong>four subnets</strong>: public and private, each in AZ <code>a</code>{" "}
          and AZ <code>b</code>. It is cheap (subnets are free) and saves a rebuild.
        </p>

        <h2 id="public-private">What makes a subnet public or private</h2>
        <p>
          This is the most misunderstood idea in AWS networking, and it is beautifully simple.
        </p>
        <Callout kind="warn" label="The definition — memorise it">
          <p className="mb-0">
            A subnet is <strong>public</strong> if its route table has a row{" "}
            <code>0.0.0.0/0 → Internet Gateway</code>. A subnet is <strong>private</strong> if it
            does not. <em>There is no &ldquo;public&rdquo; checkbox on the subnet itself.</em>
          </p>
        </Callout>
        <p>Reading a route table works like reading a sign in a lift. Rows are matched by the most specific range first:</p>
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
          The <code>local</code> row is added automatically and cannot be deleted. It is why an app
          server in a public subnet can reach a database in a private subnet without any extra
          setup: inside the VPC, everything can route to everything. <em>Security Groups</em>, not
          routes, decide who is actually allowed in.
        </p>
        <h3>A public subnet is not enough — the public IP</h3>
        <p>
          For a server to be reachable from the internet it needs <strong>both</strong> a public
          subnet <strong>and</strong> a public IP address (auto-assigned, or an Elastic IP from
          Lesson 7). A server in a public subnet with no public IP can talk to other servers inside
          the VPC, but it cannot reach the internet and the internet cannot reach it, because the
          IGW only translates addresses for instances that have a public one. This trips up many
          people, so remember: route <em>and</em> public IP, both.
        </p>

        <h2 id="security">Security Groups vs Network ACLs</h2>
        <p>
          You have used Security Groups since Lesson 2. AWS gives you a second, older firewall
          too. Here is how they differ, because &ldquo;explain SG vs NACL&rdquo; is asked in almost
          every AWS interview.
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
          <strong>Our rule:</strong> leave the NACL at its default (allow all) and do all your real
          work with Security Groups. Reach for a NACL only for one job Security Groups cannot do:
          <em> explicitly blocking</em> a bad IP range for a whole subnet.
        </p>
        <h3>The best Security Group trick — reference another group</h3>
        <p>
          Instead of writing an IP address, a rule can name <em>another Security Group</em> as the
          source. This is how we make the database private in a way that survives scaling:
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
          When Auto Scaling launches a tenth server it joins <code>web-sg</code> and instantly may
          reach the database — no rule to edit, no IP to whitelist. And a stranger with the
          database password still cannot connect, because their machine is not in{" "}
          <code>web-sg</code>. Layer one (the private subnet) and layer two (the Security Group)
          both say no.
        </p>

        <h2 id="nat">NAT Gateway — and why it can wreck your bill</h2>
        <p>
          Here is a real problem. Your database server in the private subnet needs to download
          operating-system security updates. But it has no route to the internet — that was the
          whole point. How does it reach the update servers?
        </p>
        <p>
          A <strong>NAT Gateway</strong> sits in a <em>public</em> subnet. Private servers send
          their outbound traffic to it; it forwards the traffic using its own public IP and passes
          the replies back. Outsiders cannot start a connection to the private server — the door
          only opens one way, like a phone that can call out but has no number.
        </p>
        <Callout kind="warn" label="The bill nobody warns you about">
          <p>
            A NAT Gateway costs roughly <strong>$0.056 per hour (about $40 a month) plus $0.056
            per GB</strong> it processes in Mumbai — even when idle. For a small project that can
            be double the cost of everything else combined. Prices change, so check the current
            VPC pricing page.
          </p>
          <p className="mb-0">
            Many beginners create one during the wizard, forget it, and discover it a month later.
          </p>
        </Callout>
        <h3>Ways to avoid paying for it</h3>
        <ul>
          <li>
            <strong>Our approach in this course: skip the NAT.</strong> The database never needs to
            call the internet — AWS patches RDS for you. Only the app servers need outbound access,
            and they live in the public subnet where the Internet Gateway already gives it to them
            for free.
          </li>
          <li>
            <strong>VPC endpoints for S3 and DynamoDB (Gateway type) are free.</strong> They give
            private servers a private path to S3 without a NAT and without touching the internet.
            Add one whenever a private server talks to S3.
          </li>
          <li>
            <strong>Interface endpoints</strong> (for SSM, ECR, Secrets Manager and others) cost
            about $0.011/hour per AZ. Cheaper than a NAT if you only need a few services.
          </li>
          <li>
            <strong>Real production</strong> usually does use a NAT (one per AZ for resilience). If
            your traffic is high, it is worth it. At the scale of this course, it is not.
          </li>
        </ul>
        <Callout kind="note" label="Public IPv4 is not free either">
          <p className="mb-0">
            Since February 2024 AWS charges about $0.005 per hour (roughly $3.60 a month) for every
            public IPv4 address, including the ones on your own servers and load balancers. Small
            per address, but it is why you should not hand out public IPs to things that do not need
            them.
          </p>
        </Callout>

        <h2 id="default-vpc">The default VPC — and why we do not use it</h2>
        <p>
          Every region in a new AWS account already contains a <strong>default VPC</strong>, with
          public subnets in every AZ and an Internet Gateway attached. That is why the &ldquo;launch
          instance&rdquo; wizard just works for a beginner: it quietly drops your server in there.
        </p>
        <p>The default VPC is fine for learning EC2 in ten minutes. It is wrong for anything real:</p>
        <ul>
          <li>Every subnet is public — there is nowhere to hide a database.</li>
          <li>Instances get public IPs by default.</li>
          <li>You did not design it, so you do not know what is in it.</li>
        </ul>
        <p>
          You should know it exists, and know that you can leave it alone (do not delete it; some
          services expect it). We build our own.
        </p>

        <h2 id="build">Build it: the full VPC, step by step</h2>
        <p>
          You can click through the console (VPC → &ldquo;Create VPC&rdquo; → &ldquo;VPC and
          more&rdquo; builds most of this in one screen), but doing it once with the CLI shows you
          exactly what each object is. Lesson 15 turns this into Terraform.
        </p>
        <Callout kind="note" label="Shell variables hold the IDs">
          <p className="mb-0">
            Each AWS command returns a new ID (<code>vpc-0abc…</code>). We capture it in a variable
            with <code>--query … --output text</code> so the next command can use it. Run all of it
            in <em>one terminal session</em>, or the variables disappear.
          </p>
        </Callout>
        <ol className="steps">
          <li>
            <h3>Create the VPC</h3>
            <Script
              title="1 · the network"
              code={`export AWS_REGION=ap-south-1

VPC_ID=$(aws ec2 create-vpc --cidr-block 10.0.0.0/16 \\
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=myapp-vpc}]' \\
  --query Vpc.VpcId --output text)

# Servers get DNS names like ip-10-0-1-5.ap-south-1.compute.internal, and RDS needs this
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-hostnames
echo $VPC_ID`}
            />
          </li>
          <li>
            <h3>Create four subnets — public and private, in two AZs</h3>
            <Script
              title="2 · subnets"
              code={`mk_subnet () {  # usage: mk_subnet NAME CIDR AZ
  aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block $2 --availability-zone $3 \\
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$1}]" \\
    --query Subnet.SubnetId --output text
}

PUB_A=$(mk_subnet myapp-public-a  10.0.1.0/24 ap-south-1a)
PRV_A=$(mk_subnet myapp-private-a 10.0.2.0/24 ap-south-1a)
PUB_B=$(mk_subnet myapp-public-b  10.0.3.0/24 ap-south-1b)
PRV_B=$(mk_subnet myapp-private-b 10.0.4.0/24 ap-south-1b)

# Servers launched in the public subnets get a public IP automatically
aws ec2 modify-subnet-attribute --subnet-id $PUB_A --map-public-ip-on-launch
aws ec2 modify-subnet-attribute --subnet-id $PUB_B --map-public-ip-on-launch`}
            />
            <p>
              At this point all four subnets are <em>identical</em> — none is public yet. The next
              two steps are what create the difference.
            </p>
          </li>
          <li>
            <h3>Create the Internet Gateway and attach it</h3>
            <Script
              title="3 · the front door"
              code={`IGW_ID=$(aws ec2 create-internet-gateway \\
  --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=myapp-igw}]' \\
  --query InternetGateway.InternetGatewayId --output text)

aws ec2 attach-internet-gateway --internet-gateway-id $IGW_ID --vpc-id $VPC_ID`}
            />
            <p>
              An IGW that exists but is not <em>referenced by a route</em> does nothing. Attaching
              it is like building the front door; the route table is the sign that points visitors
              to it.
            </p>
          </li>
          <li>
            <h3>Make the public subnets public — one route, two associations</h3>
            <Script
              title="4 · the route that makes a subnet public"
              code={`PUB_RT=$(aws ec2 create-route-table --vpc-id $VPC_ID \\
  --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=myapp-public-rt}]' \\
  --query RouteTable.RouteTableId --output text)

# THE row. This single line is the difference between public and private.
aws ec2 create-route --route-table-id $PUB_RT --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW_ID

aws ec2 associate-route-table --route-table-id $PUB_RT --subnet-id $PUB_A
aws ec2 associate-route-table --route-table-id $PUB_RT --subnet-id $PUB_B`}
            />
            <p>
              The private subnets are still attached to the VPC&apos;s <em>main</em> route table,
              which only has the <code>local</code> row. That is exactly what we want. Confirm with:
            </p>
            <CommandList
              title="Check your work"
              commands={[
                { cmd: "aws ec2 describe-route-tables --filters Name=vpc-id,Values=$VPC_ID --query 'RouteTables[].{Name:Tags[?Key==`Name`]|[0].Value,Routes:Routes[].GatewayId}' --output json", note: "The public table shows an igw-… entry; the main table shows only “local”" },
              ]}
            />
          </li>
          <li>
            <h3>Create the Security Groups</h3>
            <Script
              title="5 · firewalls, referencing each other"
              code={`mk_sg () {  # usage: mk_sg NAME DESCRIPTION
  aws ec2 create-security-group --group-name $1 --description "$2" --vpc-id $VPC_ID \\
    --query GroupId --output text
}

ALB_SG=$(mk_sg alb-sg "Public load balancer")
WEB_SG=$(mk_sg web-sg "App servers")
DB_SG=$(mk_sg db-sg "Postgres")

MY_IP=$(curl -s https://checkip.amazonaws.com)

# Internet -> load balancer
aws ec2 authorize-security-group-ingress --group-id $ALB_SG --protocol tcp --port 80  --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $ALB_SG --protocol tcp --port 443 --cidr 0.0.0.0/0

# Load balancer -> app servers (source is a GROUP, not an IP)
aws ec2 authorize-security-group-ingress --group-id $WEB_SG --protocol tcp --port 80  --source-group $ALB_SG
aws ec2 authorize-security-group-ingress --group-id $WEB_SG --protocol tcp --port 443 --source-group $ALB_SG

# You -> app servers, SSH only from your own IP
aws ec2 authorize-security-group-ingress --group-id $WEB_SG --protocol tcp --port 22 --cidr $MY_IP/32

# App servers -> database
aws ec2 authorize-security-group-ingress --group-id $DB_SG --protocol tcp --port 5432 --source-group $WEB_SG`}
            />
            <Callout kind="warn" label="Your IP changes">
              <p className="mb-0">
                Home and mobile connections change IP every few days. When SSH suddenly times out
                next week, the fix is to update the <code>/32</code> rule. In Lesson 18 you will
                remove port 22 entirely and use SSM Session Manager instead.
              </p>
            </Callout>
          </li>
          <li>
            <h3>Save the IDs — later lessons need them</h3>
            <Script
              title="6 · write it down"
              code={`cat > ~/myapp-network.env <<EOF
VPC_ID=$VPC_ID
PUB_A=$PUB_A
PUB_B=$PUB_B
PRV_A=$PRV_A
PRV_B=$PRV_B
ALB_SG=$ALB_SG
WEB_SG=$WEB_SG
DB_SG=$DB_SG
EOF
echo "Saved. In any new terminal run:  source ~/myapp-network.env"`}
            />
          </li>
        </ol>

        <h2 id="debugging">When something cannot connect — the checklist</h2>
        <p>
          Sooner or later you will stare at a hanging <code>ssh</code> command or a browser
          spinner. Networking problems are solved by walking the request&apos;s path{" "}
          <em>in order</em> instead of guessing. Follow the packet:
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
                <td>Something is <em>silently dropping</em> packets: Security Group, route table or NACL. Nothing answered at all.</td>
              </tr>
              <tr>
                <td><code>Connection refused</code> (instant)</td>
                <td>The packet <em>arrived</em>, but nothing is listening on that port. The network is fine; the app is not running or is bound to the wrong address.</td>
              </tr>
              <tr>
                <td><code>Permission denied (publickey)</code></td>
                <td>The network is fine. Wrong key file, wrong username (<code>ubuntu</code> not <code>ec2-user</code>), or <code>.pem</code> permissions too open.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout kind="ok" label="A superpower: VPC Reachability Analyzer">
          <p className="mb-0">
            In the console, VPC → Reachability Analyzer. Pick a source and a destination and AWS
            tells you <em>exactly which component</em> (Security Group, route, NACL) blocks the
            path. It costs about $0.10 per analysis and saves hours.
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
          Read the question, try to answer out loud in two sentences, then open it. Every one of
          these comes up in real AWS interviews.
        </p>
        <InterviewQA
          items={[
            {
              q: "What makes a subnet public?",
              a: (
                <p className="mb-0">
                  Its route table contains a route for <code>0.0.0.0/0</code> that targets an
                  Internet Gateway. Nothing on the subnet itself says &ldquo;public&rdquo;. Instances
                  in it also need a public or Elastic IP to be reachable from the internet.
                </p>
              ),
            },
            {
              q: "Security Group vs Network ACL?",
              a: (
                <p className="mb-0">
                  Security Groups are stateful, attach to resources, and only have allow rules.
                  NACLs are stateless, attach to subnets, support allow and deny, and are evaluated
                  in numbered order. In practice you manage Security Groups and leave NACLs at the
                  default.
                </p>
              ),
            },
            {
              q: "How can a private-subnet server download updates without being reachable from the internet?",
              a: (
                <p className="mb-0">
                  Through a NAT Gateway in a public subnet: outbound connections are translated and
                  replies return, but inbound connections cannot be initiated. For S3 specifically, a
                  free Gateway VPC endpoint avoids the NAT altogether.
                </p>
              ),
            },
            {
              q: "Why does a subnet have only 251 usable addresses in a /24?",
              a: (
                <p className="mb-0">
                  AWS reserves five per subnet: network address, VPC router, DNS, one for future
                  use, and broadcast.
                </p>
              ),
            },
            {
              q: "Your app in a public subnet cannot reach the internet, though the route to the IGW exists. Why?",
              a: (
                <p className="mb-0">
                  The instance has no public or Elastic IP. The Internet Gateway only performs
                  address translation for instances that have one. Also check the outbound Security
                  Group rules and the NACL.
                </p>
              ),
            },
            {
              q: "Design a VPC for a web app with a database. What goes where?",
              a: (
                <p className="mb-0">
                  One VPC, two AZs, a public and a private subnet in each. Load balancer in public
                  subnets. App servers in public (cheap) or private (stricter, needs NAT or
                  endpoints). Database and cache in private subnets with Security Groups that accept
                  traffic only from the app&apos;s Security Group.
                </p>
              ),
            },
            {
              q: "Two VPCs need to talk to each other. What are the options and the catch?",
              a: (
                <p className="mb-0">
                  VPC peering (simple, one-to-one, not transitive) or Transit Gateway (hub for many
                  VPCs, costs more). The catch for both: the CIDR ranges must not overlap.
                </p>
              ),
            },
          ]}
        />

        <hr />

        <h2 id="practice">Practice task before Lesson 7</h2>
        <p>
          Run the six steps in the previous section, then prove to yourself that the network behaves
          as designed. Everything is free.
        </p>
        <ol>
          <li>
            Run all six steps and confirm four subnets, one Internet Gateway, one custom route
            table and three Security Groups exist in the console (VPC → Your VPCs → the resource
            map shows the picture).
          </li>
          <li>
            Open the resource map and find the line from the public route table to the IGW. Now
            delete that one route in the console. What do you predict happens to the public
            subnets? Add it back.
          </li>
          <li>
            Draw the VPC on paper — no looking. Label each subnet with its CIDR, AZ and whether it
            is public. Compare with the figure above.
          </li>
          <li>
            Write down, for each Security Group, <em>who</em> may connect on <em>which port</em>.
            Which of the three has a rule that names another group instead of an IP, and why is
            that better?
          </li>
          <li>
            Stretch: create a free S3 Gateway endpoint (<code>aws ec2 create-vpc-endpoint --vpc-id
            $VPC_ID --service-name com.amazonaws.ap-south-1.s3 --route-table-ids $PUB_RT</code>).
            It adds a route to the table. Find it.
          </li>
        </ol>
        <Callout kind="ok" label="Cleaning up">
          <p className="mb-0">
            Nothing here costs money, so keep it all — Lessons 7 and 8 launch resources into these
            subnets. If you ever need to delete, do it in reverse: instances, then Security Groups
            (not the default one), detach and delete the IGW, subnets, route tables, and finally
            the VPC.
          </p>
        </Callout>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          A VPC is a private building you rent inside AWS. Subnets are its floors, route tables are
          the signs that decide where traffic goes, the Internet Gateway is the front door, and
          Security Groups are the guards at each office.
        </p>
        <ul>
          <li>
            <strong>Public vs private</strong> is one route-table row: <code>0.0.0.0/0 → igw</code>.
            Delete it and the subnet is private.
          </li>
          <li>
            <strong>Two layers of safety</strong>: the database sits in a private subnet <em>and</em>{" "}
            its Security Group accepts only the app&apos;s Security Group.
          </li>
          <li>
            <strong>Two AZs</strong> from day one, because the load balancer and RDS both demand
            it.
          </li>
          <li>
            <strong>NAT Gateways are paid and easy to forget.</strong> Skip them until traffic
            justifies them; use free S3 endpoints instead.
          </li>
          <li>
            <strong>Debug in path order</strong>: instance → public IP → Security Group → route →
            NACL → listening port. &ldquo;Timed out&rdquo; means blocked; &ldquo;refused&rdquo; means
            nothing was listening.
          </li>
        </ul>
        <p>
          The network exists and is empty. Next we put the first real server in it: EC2.
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
