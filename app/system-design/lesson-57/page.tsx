import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Flow, Layers, QA, Stats } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-57")!;

export const metadata: Metadata = {
  title: `Lesson 57 — ${lesson.title}`,
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

const code1 = `resource "aws_s3_bucket" "uploads" {
  bucket = "myshop-user-uploads"
}
resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket                  = aws_s3_bucket.uploads.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}`;

export default function SdLessonFiveSevenPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>Twenty years ago, launching a new product meant:</p>
          <ul>
            <li>ordering servers weeks or months in advance,</li>
            <li>
              guessing how many you would need (buy too few and you crash on launch day; buy too many and you waste money),
            </li>
            <li>renting space in a data centre and wiring it up,</li>
            <li>and hiring people to replace failed disks at 2 AM.</li>
          </ul>
          <p>
            Today you can start a server, a managed database, a global CDN and a message queue{" "}
            <strong>in minutes</strong>. You pay by the hour (or by the request), and you shut it all down when you are done.
            (A CDN is a network of servers around the world that keep copies of your files close to users. A message
            queue is a waiting line where programs leave messages for other programs.)
          </p>
          <p>
            But the cloud has its own ideas, its own ways to fail, and surprise bills. To design systems on it, you need to
            understand <strong>regions, availability zones, service models, serverless and cost</strong>.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about <strong>electricity</strong>.
          </p>
          <p>
            A century ago, many factories built their <strong>own power plants</strong>. Then public power grids
            appeared. Factories simply <strong>plugged in and paid for what they used</strong>. They got cheaper and more reliable
            power, and they could focus on making their products.
          </p>
          <p>
            <strong>Cloud computing</strong> is the same change for computing. It means renting computers and services over
            the internet. Instead of owning data centres, you{" "}
            <strong>rent computing power, storage and ready-made services</strong> from providers like{" "}
            <strong>AWS, Google Cloud and Microsoft Azure</strong>. You get them when you need them, and you pay for what you use.
          </p>
          <p>
            Like a power grid, the cloud is built with{" "}
            <strong>many independent power stations and lines</strong>, so one failure does not black out the whole
            city. But <strong>you</strong> still need to wire your own house correctly.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="key-terms">Key terms in plain words</h3>
          <ul>
            <li>
              <strong>Latency:</strong> the time a request takes to travel and get an answer. Low latency means fast.
            </li>
            <li>
              <strong>High availability:</strong> a design that keeps the system working even when some parts fail.
            </li>
            <li>
              <strong>Disaster recovery:</strong> the plan and tools to bring a system back after a very big failure,
              such as a whole region going down.
            </li>
            <li>
              <strong>Elasticity:</strong> the ability to grow and shrink resources quickly as demand changes.
            </li>
            <li>
              <strong>Object storage</strong> (like S3) is a service that stores files as "objects" in buckets. You read
              and write them over HTTP, and it keeps many copies for safety.
            </li>
            <li>
              <strong>Terraform</strong> is a tool that reads text files (written in a language called HCL) that describe
              your cloud resources, and then creates them. <strong>OpenTofu</strong> is an open-source fork of Terraform.
            </li>
            <li>
              <strong>AWS Lambda</strong> is Amazon's serverless function service. It runs your code when an event
              arrives.
            </li>
          </ul>
          <h3 id="global-infrastructure-regions-and-availability-zones">
            Global infrastructure: regions and availability zones
          </h3>
          <Layers
            caption="The cloud's physical hierarchy, from widest to closest to users."
            layers={[
              {
                name: <>Region</>,
                tech: <>e.g. ap-south-1 (Mumbai)</>,
                desc: <>far apart (tens of ms or more); choose for latency, laws and cost</>,
              },
              {
                name: <>Availability zone × 3</>,
                tech: <>separate data centres</>,
                desc: <>own power, cooling and network; single-digit ms apart</>,
              },
              { name: <>Data centre(s)</>, tech: <>inside each AZ</>, desc: <>racks of servers</> },
              { name: <>Edge locations</>, tech: <>hundreds worldwide</>, desc: <>CDN and DNS close to users</> },
            ]}
          />
          <ul>
            <li>
              <strong>Region:</strong> a geographic area (like Mumbai, Frankfurt or Virginia) with{" "}
              <strong>several availability zones</strong>. Regions are <strong>isolated</strong> from each other, so a
              problem in one should not affect another.
            </li>
            <li>
              <strong>Availability Zone (AZ):</strong> one or more data centres inside a region. Each has{" "}
              <strong>its own power, cooling and networking</strong>. AZs are some distance apart (AWS says up to about
              100 km) and are joined by fast private links. They are designed to <strong>fail independently</strong>: a
              fire, flood or power cut in one should not take down the others.
            </li>
            <li>
              <strong>Edge locations:</strong> many small sites around the world. They are used for <strong>CDN caching</strong>, DNS (the
              service that turns names into IP addresses) and edge compute, which means running code close to users (post 14).
            </li>
          </ul>
          <p>
            <strong>Design implications:</strong>
          </p>
          <ul>
            <li>
              <strong>Single AZ:</strong> simple, but one data-centre problem takes you down. This is fine for dev and test, but
              not for production.
            </li>
            <li>
              <strong>Multi-AZ (the production standard):</strong> run servers, databases (with standby replicas, which are spare copies ready to take over) and
              load balancers across <strong>2–3 AZs</strong> in one region. You survive the loss of a data centre. Latency stays low and the extra
              cost is small (post 40).
            </li>
            <li>
              <strong>Multi-region:</strong> survives the loss of an <strong>entire region</strong> and serves users around the world with low latency.
              But it is <strong>much</strong> more complex and expensive, especially for copying data between regions
              and keeping it consistent (posts 24 and 27–28). Use it for the most critical systems, or when
              the law requires it.
            </li>
            <li>
              <strong>Choose regions</strong> based on <strong>user location</strong> (latency),{" "}
              <strong>data residency laws</strong> (rules that say some data must stay in one country),{" "}
              <strong>service availability</strong> (not every service exists in every region) and <strong>price</strong>{" "}
              (it is different in each region).
            </li>
          </ul>
          <h3 id="service-models-who-manages-what">Service models: who manages what</h3>
          <p>
            A <strong>service model</strong> tells you how much of the work the provider does and how much you do. Think of
            getting a meal: you can buy groceries and cook (IaaS), order a meal kit (PaaS), order from a menu (serverless)
            or eat in a restaurant (SaaS).
          </p>
          <Layers
            caption="Who manages what. Each step up hands more of the stack to the provider."
            layers={[
              {
                name: <>SaaS</>,
                tech: <>Gmail, Slack, Salesforce</>,
                desc: <>provider runs everything; you just use it</>,
              },
              {
                name: <>Serverless (FaaS)</>,
                tech: <>Lambda, Cloud Functions</>,
                desc: <>you ship functions; provider runs runtime, OS, servers</>,
              },
              {
                name: <>PaaS / containers</>,
                tech: <>Heroku, Cloud Run, ECS Fargate</>,
                desc: <>you ship the app; provider runs runtime and OS</>,
              },
              {
                name: <>IaaS</>,
                tech: <>EC2, Compute Engine, Azure VMs</>,
                desc: <>you run OS and app; provider runs servers and data centre</>,
              },
              { name: <>On-premises</>, tech: <>your own data centre</>, desc: <>you run everything</> },
            ]}
          />
          <ul>
            <li>
              <strong>IaaS (Infrastructure as a Service):</strong> rent <strong>virtual machines</strong> (computers that run as software), disks and
              networks. You get the most control, but you manage the operating system, the security updates (patching) and the scaling.
            </li>
            <li>
              <strong>PaaS (Platform as a Service) / managed containers:</strong> you give the platform{" "}
              <strong>your code or container</strong>. It runs, scales and patches it for you.
            </li>
            <li>
              <strong>Serverless / FaaS (Functions as a Service):</strong> you upload small pieces of code called <strong>functions</strong>. They run{" "}
              <strong>only when something triggers them</strong>. They scale automatically, and you pay per request.
            </li>
            <li>
              <strong>SaaS (Software as a Service):</strong> you use finished software, like Gmail or Slack, in a browser.
            </li>
            <li>
              <strong>Managed services</strong> for building blocks: managed databases (RDS, Cloud SQL, Aurora), caches
              (ElastiCache, Memorystore), queues (SQS, Pub/Sub), object storage (S3, GCS) and search (OpenSearch
              Service). You get backups, replication (extra copies of data), patching and failover (automatic switch to a spare when something breaks){" "}
              <strong>without running the servers yourself</strong>.
            </li>
          </ul>
          <p>
            <strong>A common rule:</strong> prefer <strong>managed services</strong> for "undifferentiated heavy lifting".
            This means hard work that every company needs but that does not make your product special, like databases,
            queues and load balancers. Spend your team's time on <strong>your product</strong>, not on
            patching database servers.
          </p>
          <h3 id="core-building-blocks-rough-equivalents">Core building blocks (rough equivalents)</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Need</th>
                  <th>AWS</th>
                  <th>Google Cloud</th>
                  <th>Azure</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Virtual machines</td>
                  <td>EC2</td>
                  <td>Compute Engine</td>
                  <td>Virtual Machines</td>
                </tr>
                <tr>
                  <td>Containers (managed K8s)</td>
                  <td>EKS</td>
                  <td>GKE</td>
                  <td>AKS</td>
                </tr>
                <tr>
                  <td>Serverless containers</td>
                  <td>Fargate / ECS Express Mode</td>
                  <td>Cloud Run</td>
                  <td>Container Apps</td>
                </tr>
                <tr>
                  <td>Functions</td>
                  <td>Lambda</td>
                  <td>Cloud Functions / Cloud Run functions</td>
                  <td>Azure Functions</td>
                </tr>
                <tr>
                  <td>Object storage</td>
                  <td>S3</td>
                  <td>Cloud Storage</td>
                  <td>Blob Storage</td>
                </tr>
                <tr>
                  <td>Relational DB</td>
                  <td>RDS / Aurora</td>
                  <td>Cloud SQL / AlloyDB / Spanner</td>
                  <td>Azure SQL / Database for PostgreSQL</td>
                </tr>
                <tr>
                  <td>NoSQL</td>
                  <td>DynamoDB</td>
                  <td>Firestore / Bigtable</td>
                  <td>Cosmos DB</td>
                </tr>
                <tr>
                  <td>Queues / pub-sub</td>
                  <td>SQS / SNS</td>
                  <td>Pub/Sub</td>
                  <td>Service Bus / Event Grid</td>
                </tr>
                <tr>
                  <td>CDN</td>
                  <td>CloudFront</td>
                  <td>Cloud CDN</td>
                  <td>Azure Front Door / CDN</td>
                </tr>
                <tr>
                  <td>DNS</td>
                  <td>Route 53</td>
                  <td>Cloud DNS</td>
                  <td>Azure DNS</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>Networking basics:</strong>
          </p>
          <ul>
            <li>
              <strong>VPC (Virtual Private Cloud):</strong> your own private network inside the cloud. Other customers cannot see it.
            </li>
            <li>
              <strong>Subnets:</strong> smaller parts of the VPC. Public ones can be reached from the internet (used for load balancers). Private ones
              cannot (used for app servers and databases).
            </li>
            <li>
              <strong>Security groups / firewall rules:</strong> rules that say which network traffic is allowed in and out.
            </li>
            <li>
              <strong>NAT gateways</strong> let private servers open connections to the internet, while the internet cannot open connections to
              them. (Remember from post 40: use one per AZ, so there is a spare.)
            </li>
          </ul>
          <h3 id="serverless">Serverless</h3>
          <p>
            <strong>Serverless</strong> does not mean "no servers". Servers still exist. It means <strong>you do not manage them</strong>. With
            functions like <strong>AWS Lambda</strong>, this is what happens:
          </p>
          <Flow
            caption="How a serverless function runs."
            nodes={[
              { title: <>Event</>, desc: <>HTTP request, file uploaded to S3, queue message, schedule</> },
              {
                title: <>Platform starts the function if needed</>,
                desc: <>a cold start (slow first run) adds delay of ms to seconds</>,
                tone: "warn",
              },
              { title: <>Your code runs</>, desc: <>stateless (keeps nothing between runs); data lives in databases, caches and object storage</> },
              { title: <>Scales automatically</>, desc: <>0 → thousands of parallel copies</>, tone: "good" },
              { title: <>Billing</>, desc: <>requests × execution time — nothing when idle</> },
            ]}
          />
          <p>
            <strong>Great for:</strong>
          </p>
          <ul>
            <li>
              <strong>traffic that jumps up and down or is hard to predict</strong> (scales from zero to thousands and back),
            </li>
            <li>
              <strong>event processing:</strong> resizing images on upload, processing queue messages, webhooks,
            </li>
            <li>
              <strong>scheduled jobs</strong> and "glue" (small pieces of code that connect services),
            </li>
            <li>
              <strong>low-traffic APIs and internal tools</strong> (costs almost nothing when idle),
            </li>
            <li>small teams that do not want to manage infrastructure.</li>
          </ul>
          <p>
            <strong>Watch out for:</strong>
          </p>
          <ul>
            <li>
              <strong>Cold starts.</strong> If a function has not run for a while, the platform must first start a new
              environment for it. This adds delay, from tens of milliseconds to a few seconds, depending on the language and
              the size of the code. You can reduce it with provisioned or "minimum" instances (copies kept ready), smaller packages and faster runtimes.
            </li>
            <li>
              <strong>Time and resource limits</strong>. For example, AWS Lambda stops a function after 15 minutes at most. Long jobs need
              other tools (post 38).
            </li>
            <li>
              <strong>Statelessness.</strong> The function forgets everything after it runs. Keep your data in databases, caches or object storage (post 7).
            </li>
            <li>
              <strong>Database connection storms.</strong> Thousands of function copies can each open their own database
              connection, and the database runs out of connections. Use a connection pooler or proxy, which shares a few connections between many clients (post 5).
            </li>
            <li>
              <strong>Cost at high, steady load.</strong> Paying per request can cost <strong>more</strong>{" "}
              than always-on servers when traffic is constant and heavy.
            </li>
            <li>
              <strong>Debugging and vendor lock-in.</strong> Vendor lock-in means it is hard to move to another provider. Testing on your laptop, tracing requests and moving to another provider all take more effort.
            </li>
          </ul>
          <p>
            <strong>Serverless containers</strong> (like Cloud Run and AWS Fargate) are a popular middle choice. You
            give the platform a normal container, and it runs and scales the container for you, sometimes down to zero copies.
          </p>
          <h3 id="the-shared-responsibility-model">The shared responsibility model</h3>
          <p>
            You and the provider <strong>share</strong> the work of security and reliability:
          </p>
          <ul>
            <li>
              <strong>The provider secures "the cloud":</strong> the physical data centres, the hardware, the virtualisation
              layer (the software that creates virtual machines), and the machines behind the managed services.
            </li>
            <li>
              <strong>You secure "in the cloud":</strong> your data, identities and access (IAM, the system of users and permissions), configuration (for example{" "}
              <strong>not</strong> making storage buckets public, post 52), network rules, application code, operating system patching (for
              IaaS), encryption choices and backups (post 45).
            </li>
          </ul>
          <p>
            The more managed the service is, the more the provider handles. But{" "}
            <strong>your data, your access control and your configuration are always your job</strong>. Many cloud
            breaches come from <strong>customer misconfiguration</strong> (wrong settings), not from the provider being hacked.
          </p>
          <h3 id="cost-awareness-the-cloud-bill">Cost awareness: the cloud bill</h3>
          <p>
            The cloud makes it easy to <strong>spend</strong> money, sometimes by accident. Know what costs the most:
          </p>
          <ul>
            <li>
              <strong>Compute</strong> (VMs, containers, functions). Right-sizing (choosing the right machine size) and turning off unused resources help here,
            </li>
            <li>
              <strong>Storage</strong> (disks, object storage, backups, snapshots). Cheaper storage classes and lifecycle
              rules (which move old data to cheaper storage) help (post 17),
            </li>
            <li>
              <strong>Data transfer (egress)</strong>: you are often charged when data <strong>leaves</strong> the cloud, moves between regions, or
              even <strong>moves between AZs</strong>. This can be a surprisingly large part of the bill
              (post 10),
            </li>
            <li>
              <strong>Managed services</strong> priced per hour, per request or per GB.
            </li>
          </ul>
          <p>
            <strong>Saving tips:</strong>
          </p>
          <ul>
            <li>
              <strong>Reserved instances and savings plans</strong> give a discount if you promise to use a set amount for 1 or 3 years.
            </li>
            <li>
              <strong>Spot / preemptible instances</strong> use spare capacity of the provider and can cost up to about 90% less. But the provider can take them back at
              short notice. They are great for batch jobs and stateless workers that can handle being stopped.
            </li>
            <li>
              <strong>Auto-scaling</strong> (adding and removing machines automatically) and scheduling (turn off dev environments at night).
            </li>
            <li>
              <strong>CDN caching</strong> reduces egress from your origin (the main servers), because the CDN answers many requests itself.
            </li>
            <li>
              <strong>Tag resources</strong> (add labels) by team and project, set <strong>budgets and alerts</strong>, and review
              costs often. This habit is called <strong>FinOps</strong> (cloud financial management).
            </li>
          </ul>
          <Stats
            caption="Where cloud bills usually surprise people."
            stats={[
              {
                value: <>Egress</>,
                label: <>data out to the internet</>,
                sub: <>often the biggest surprise — use a CDN</>,
              },
              {
                value: <>Idle capacity</>,
                label: <>oversized instances left running</>,
                sub: <>rightsize and autoscale</>,
              },
              {
                value: <>NAT &amp; cross-AZ traffic</>,
                label: <>per-GB charges</>,
                sub: <>chatty services across zones add up</>,
              },
              {
                value: <>Logs &amp; metrics</>,
                label: <>observability data</>,
                sub: <>sample, set retention, drop unused series</>,
              },
            ]}
          />
          <h3 id="infrastructure-as-code">Infrastructure as code</h3>
          <p>
            Do not build production by clicking around in web consoles. <strong>Infrastructure as code</strong> means you write your servers, networks and databases as text files that a tool reads and creates. Use{" "}
            <strong>Terraform / OpenTofu</strong>, <strong>AWS CloudFormation / CDK</strong>, <strong>Pulumi</strong>{" "}
            and similar tools. The example below is Terraform (HCL) code that creates a private storage bucket:
          </p>
          <CodeBlock lang="hcl" code={code1} />
          <ul>
            <li>
              ✅ <strong>Repeatable:</strong> the same code builds dev, staging and production. It can also rebuild everything after a disaster
              (post 45).
            </li>
            <li>
              ✅ <strong>Reviewable:</strong> changes go through pull requests (a teammate checks them first), like application code.
            </li>
            <li>
              ✅ <strong>Auditable:</strong> the Git history shows who changed what and when.
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              ✅ <strong>Speed and flexibility:</strong> you get resources in minutes, and it is easy to try new ideas.
            </li>
            <li>
              ✅ <strong>Elasticity:</strong> you grow and shrink with demand, and pay for what you use.
            </li>
            <li>
              ✅ <strong>Global reach and built-in redundancy</strong> (spare copies and spare parts) through regions, AZs and edge locations.
            </li>
            <li>
              ✅ <strong>Managed services</strong> remove a lot of day-to-day work.
            </li>
            <li>
              ❌ <strong>The cost can surprise you</strong>, especially egress, unused resources and high steady workloads.
            </li>
            <li>
              ❌ <strong>Vendor lock-in:</strong> if you use many services that only one provider has, switching later is expensive.
            </li>
            <li>
              ❌ <strong>Less control:</strong> you depend on the provider's reliability, limits and future plans.
            </li>
            <li>
              ❌ <strong>You need new skills:</strong> IAM, networking, cost management and shared responsibility.
            </li>
          </ul>
          <p>
            <strong>Multi-cloud</strong> means using several providers. It can reduce lock-in and meet some legal needs,
            but it <strong>adds a lot of complexity</strong>. Most companies do better by using{" "}
            <strong>one cloud well</strong>, with good design (multi-AZ, backups and tools that work anywhere, like
            containers and Terraform).
          </p>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>AWS's beginnings.</strong> Amazon launched <strong>S3</strong> and <strong>EC2</strong> in 2006,
            after years of building internal infrastructure for its own retail business. Many people see this as the start
            of modern cloud computing. Google Cloud and Microsoft Azure followed, and the cloud became the default for new
            companies.
          </p>
          <p>
            <strong>AWS Lambda (2014)</strong> made functions-as-a-service common. A 2019 UC Berkeley paper, "Cloud
            Programming Simplified: A Berkeley View on Serverless Computing", said that serverless would become the
            main way to program the cloud. It also listed the limits it had at that time.
          </p>
          <p>
            <strong>Region outages and multi-AZ design.</strong> Big cloud incidents, like several well-known AWS
            US-East-1 outages, have shown again and again that systems built across <strong>several AZs</strong> or{" "}
            <strong>several regions</strong> survive much better than those in one place. "Static stability" means the system keeps working without needing to
            change anything during the failure (post 40).
          </p>
          <p>
            <strong>Leaving the cloud.</strong> Some companies with <strong>large, steady, predictable</strong>{" "}
            workloads have moved parts of their systems <strong>back to their own hardware</strong> to save
            money. Dropbox did this for file storage (post 17). 37signals (the makers of Basecamp and HEY) said
            publicly that it expected to save <strong>millions of dollars</strong> by leaving the cloud. The lesson is not
            "the cloud is bad". The lesson is that <strong>the cloud is best for needs that change a lot and quickly</strong>, and very large
            steady workloads may be cheaper on your own hardware.
          </p>
          <p>
            <strong>Serverless in practice.</strong> Many companies use serverless for{" "}
            <strong>event-driven glue</strong> (code that reacts to events): resizing images when they are uploaded to object storage, processing
            webhooks (calls that other services send to you), sending notifications from queues, and nightly reports. They keep the main high-traffic APIs on
            containers.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>What's the difference between a region and an availability zone?</>,
                a: (
                  <>
                    <p>
                      A region is a geographic area (Mumbai, Ireland) that contains several availability zones. Each AZ is
                      one or more data centres with its own power, cooling and networking. AZs are linked to each other by
                      fast private links. Spread your system across AZs for high availability. Use several regions for
                      disaster recovery and for low latency around the world.
                    </p>
                  </>
                ),
              },
              {
                q: <>Compare IaaS, PaaS and serverless.</>,
                a: (
                  <>
                    <p>
                      IaaS gives you virtual machines. You manage the operating system and everything above it. PaaS and managed
                      containers run your application for you. Serverless runs single functions when needed, scales
                      down to zero and bills per call. The costs of serverless are cold starts, time limits and having no memory between runs.
                    </p>
                  </>
                ),
              },
              {
                q: <>When is serverless a good fit, and when isn't it?</>,
                a: (
                  <>
                    <p>
                      It is good for traffic that jumps up and down, low-volume work, event processing, glue code and scheduled jobs.
                      In these cases, scaling to zero and having no servers to manage matter. It is less good for steady
                      high traffic (often cheaper on containers), for paths where cold starts hurt latency, for
                      long-running jobs, and for work that needs many connections to a traditional database.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is the shared responsibility model?</>,
                a: (
                  <>
                    <p>
                      The provider secures the cloud itself: the buildings, the hardware, the hypervisors (the software that runs
                      VMs) and the insides of managed services. You secure what you put in it: your data, identities and
                      access policies, network rules, operating system patches on VMs, and application code. The split moves
                      depending on the service model.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why use infrastructure as code?</>,
                a: (
                  <>
                    <p>
                      Environments are kept in version control, can be reviewed, can be repeated and are quick to rebuild, for
                      example after a disaster or in a new region. You can also detect drift (when the real setup no longer
                      matches the code), and there are no manual clicks that nobody wrote down. Terraform, OpenTofu,
                      Pulumi and CloudFormation are common tools.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you keep a cloud bill under control?</>,
                a: (
                  <>
                    <p>
                      Tag resources by owner, set budgets and alerts, choose the right sizes and autoscale, use reserved or spot
                      capacity where it fits, put a CDN in front to cut egress, reduce traffic between AZs, use storage
                      lifecycle rules, and review costs often like any other engineering metric.
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
              The cloud lets you <strong>rent</strong> compute, storage and managed services <strong>on demand</strong>,
              and pay for what you use.
            </li>
            <li>
              <strong>Regions</strong> are isolated geographic areas. <strong>Availability Zones</strong> are
              independent data centres within a region. <strong>Production should be multi-AZ</strong>, and multi-region
              is for the most critical or global systems.
            </li>
            <li>
              The service models are <strong>IaaS → PaaS / containers → serverless → SaaS</strong>. Prefer{" "}
              <strong>managed services</strong> for databases, queues and load balancers.
            </li>
            <li>
              <strong>Serverless</strong> is great for spiky and event-driven work. Watch{" "}
              <strong>cold starts, limits, DB connections and costs at steady high load</strong>.
            </li>
            <li>
              Understand the <strong>shared responsibility model</strong>, <strong>watch costs</strong> (especially
              egress), and build everything with <strong>infrastructure as code</strong>.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>The AWS documentation on Regions and Availability Zones</li>
            <li>
              The AWS Well-Architected Framework, the Google Cloud Architecture Framework and the Azure Well-Architected
              Framework
            </li>
            <li>The AWS Shared Responsibility Model</li>
            <li>
              The paper "Cloud Programming Simplified: A Berkeley View on Serverless Computing" (UC Berkeley, 2019)
            </li>
            <li>The AWS Lambda documentation on the execution environment and cold starts</li>
            <li>"The Open Guide to Amazon Web Services" (a community guide on GitHub)</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
