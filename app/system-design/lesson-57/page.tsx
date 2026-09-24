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
              guessing how many you'd need (buy too few and you crash on launch day; buy too many and you waste money),
            </li>
            <li>renting space in a data centre and wiring it up,</li>
            <li>and hiring people to replace failed disks at 2 AM.</li>
          </ul>
          <p>
            Today you can start a server, a managed database, a global CDN and a message queue{" "}
            <strong>in minutes</strong>, pay by the hour (or by the request), and shut it all down when you're done.
          </p>
          <p>
            But the cloud has its own concepts, failure modes and surprise bills. To design systems on it, you need to
            understand <strong>regions, availability zones, service models, serverless, and cost</strong>.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about <strong>electricity</strong>.
          </p>
          <p>
            A century ago, many factories built their <strong>own power plants</strong>. Then public power grids
            appeared, and factories simply <strong>plugged in and paid for what they used</strong>. They got cheaper,
            more reliable power, and could focus on making their products.
          </p>
          <p>
            <strong>Cloud computing</strong> is the same shift for computing. Instead of owning data centres, you{" "}
            <strong>rent computing, storage and ready-made services</strong> from providers like{" "}
            <strong>AWS, Google Cloud and Microsoft Azure</strong>, on demand, and pay for what you use.
          </p>
          <p>
            Just like a power grid, the cloud is built with{" "}
            <strong>multiple independent power stations and lines</strong>, so one failure doesn't black out the whole
            city. But <strong>you</strong> still need to connect your house properly.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="global-infrastructure-regions-and-availability-zones">
            Global infrastructure: regions and availability zones
          </h3>
          <Layers
            caption="The cloud's physical hierarchy, from widest to closest to users."
            layers={[
              {
                name: <>Region</>,
                tech: <>e.g. ap-south-1 (Mumbai)</>,
                desc: <>tens of ms+ apart; choose for latency, laws and cost</>,
              },
              {
                name: <>Availability zone × 3</>,
                tech: <>separate data centres</>,
                desc: <>own power, cooling and network; ~1–2 ms apart</>,
              },
              { name: <>Data centre(s)</>, tech: <>inside each AZ</>, desc: <>racks of servers</> },
              { name: <>Edge locations</>, tech: <>hundreds worldwide</>, desc: <>CDN and DNS close to users</> },
            ]}
          />
          <ul>
            <li>
              <strong>Region:</strong> a geographic area (like Mumbai, Frankfurt or Virginia) with{" "}
              <strong>multiple availability zones</strong>. Regions are <strong>isolated</strong> from each other, so a
              problem in one shouldn't affect another.
            </li>
            <li>
              <strong>Availability Zone (AZ):</strong> one or more data centres inside a region, with{" "}
              <strong>independent power, cooling and networking</strong>, a few kilometres apart, connected by fast
              private links. AZs are designed to <strong>fail independently</strong>: a fire, flood or power cut in one
              shouldn't take down the others.
            </li>
            <li>
              <strong>Edge locations:</strong> many small sites worldwide for <strong>CDN caching</strong>, DNS and edge
              compute (post 14).
            </li>
          </ul>
          <p>
            <strong>Design implications:</strong>
          </p>
          <ul>
            <li>
              <strong>Single AZ:</strong> simple, but one data-centre problem takes you down. Fine for dev and test, but
              not for production.
            </li>
            <li>
              <strong>Multi-AZ (the production standard):</strong> run servers, databases (with standby replicas) and
              load balancers across <strong>2–3 AZs</strong> in one region. This survives the loss of a data centre, at
              low latency and modest cost (post 40).
            </li>
            <li>
              <strong>Multi-region:</strong> survives the loss of an <strong>entire region</strong> and serves global
              users with low latency, but it's <strong>much</strong> more complex and expensive, especially for data
              replication and consistency (posts 24 and 27–28). Use it for the most critical systems, or when
              regulations require it.
            </li>
            <li>
              <strong>Choose regions</strong> based on <strong>user location</strong> (latency),{" "}
              <strong>data residency laws</strong> (some data must stay in a country),{" "}
              <strong>service availability</strong> (not every service is in every region) and <strong>price</strong>{" "}
              (it differs by region).
            </li>
          </ul>
          <h3 id="service-models-who-manages-what">Service models: who manages what</h3>
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
              <strong>IaaS (Infrastructure as a Service):</strong> rent <strong>virtual machines</strong>, disks and
              networks. It gives maximum control, but you manage the OS, patching and scaling.
            </li>
            <li>
              <strong>PaaS / managed containers:</strong> give the platform <strong>your code or container</strong>, and
              it runs, scales and patches for you.
            </li>
            <li>
              <strong>Serverless / FaaS (Functions as a Service):</strong> upload <strong>functions</strong>. They run{" "}
              <strong>only when triggered</strong> and scale automatically, and you pay per request.
            </li>
            <li>
              <strong>SaaS:</strong> use complete software.
            </li>
            <li>
              <strong>Managed services</strong> for building blocks: managed databases (RDS, Cloud SQL, Aurora), caches
              (ElastiCache, Memorystore), queues (SQS, Pub/Sub), object storage (S3, GCS) and search (OpenSearch
              Service). You get backups, replication, patching and failover{" "}
              <strong>without running the servers yourself</strong>.
            </li>
          </ul>
          <p>
            <strong>A common rule:</strong> prefer <strong>managed services</strong> for undifferentiated heavy lifting
            (databases, queues, load balancers). Spend your team's time on <strong>your product</strong>, not on
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
                  <td>Fargate / App Runner</td>
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
              <strong>VPC (Virtual Private Cloud):</strong> your private network in the cloud.
            </li>
            <li>
              <strong>Subnets:</strong> public ones (reachable from the internet, for load balancers) and private ones
              (for app servers and databases).
            </li>
            <li>
              <strong>Security groups / firewall rules:</strong> which traffic is allowed.
            </li>
            <li>
              <strong>NAT gateways</strong> give private servers outbound internet access. (Remember from post 40: make
              them redundant per AZ.)
            </li>
          </ul>
          <h3 id="serverless">Serverless</h3>
          <p>
            <strong>Serverless</strong> doesn't mean "no servers". It means <strong>you don't manage them</strong>. With
            functions like <strong>AWS Lambda</strong>:
          </p>
          <Flow
            caption="How a serverless function runs."
            nodes={[
              { title: <>Event</>, desc: <>HTTP request, file uploaded to S3, queue message, schedule</> },
              {
                title: <>Platform starts the function if needed</>,
                desc: <>a cold start adds latency — ms to seconds</>,
                tone: "warn",
              },
              { title: <>Your code runs</>, desc: <>stateless; state lives in databases, caches and object storage</> },
              { title: <>Scales automatically</>, desc: <>0 → thousands of parallel copies</>, tone: "good" },
              { title: <>Billing</>, desc: <>requests × execution time — nothing when idle</> },
            ]}
          />
          <p>
            <strong>Great for:</strong>
          </p>
          <ul>
            <li>
              <strong>spiky or unpredictable traffic</strong> (scales from zero to thousands and back),
            </li>
            <li>
              <strong>event processing:</strong> resizing images on upload, processing queue messages, webhooks,
            </li>
            <li>
              <strong>scheduled jobs</strong> and glue between services,
            </li>
            <li>
              <strong>low-traffic APIs and internal tools</strong> (costs almost nothing when idle),
            </li>
            <li>small teams that don't want to manage infrastructure.</li>
          </ul>
          <p>
            <strong>Watch out for:</strong>
          </p>
          <ul>
            <li>
              <strong>Cold starts.</strong> When a function hasn't run recently, the platform must start a new
              environment first, adding latency (from tens of milliseconds to seconds, depending on language and size).
              Mitigations include provisioned or "minimum" instances, smaller packages and faster runtimes.
            </li>
            <li>
              <strong>Time and resource limits</strong> (for example, maximum run times of minutes). Long jobs need
              other tools (post 38).
            </li>
            <li>
              <strong>Statelessness.</strong> Keep state in databases, caches or object storage (post 7).
            </li>
            <li>
              <strong>Database connection storms.</strong> Thousands of function copies can each open a database
              connection and exhaust it. Use connection poolers or proxies (post 5).
            </li>
            <li>
              <strong>Cost at high, steady load.</strong> Pay-per-request can become <strong>more expensive</strong>{" "}
              than always-on servers when traffic is constant and heavy.
            </li>
            <li>
              <strong>Debugging and vendor lock-in.</strong> Local testing, tracing and portability take more effort.
            </li>
          </ul>
          <p>
            <strong>Serverless containers</strong> (like Cloud Run and AWS Fargate) are a popular middle ground: you
            ship a normal container, and the platform runs and scales it, sometimes down to zero.
          </p>
          <h3 id="the-shared-responsibility-model">The shared responsibility model</h3>
          <p>
            Security and reliability are <strong>shared</strong> between you and the provider:
          </p>
          <ul>
            <li>
              <strong>The provider secures "the cloud":</strong> physical data centres, hardware, the virtualisation
              layer, and the managed services' infrastructure.
            </li>
            <li>
              <strong>You secure "in the cloud":</strong> your data, identities and access (IAM), configuration (like{" "}
              <strong>not</strong> making buckets public, post 52), network rules, application code, OS patching (for
              IaaS), encryption choices and backups (post 45).
            </li>
          </ul>
          <p>
            The more managed the service, the more the provider handles. But{" "}
            <strong>your data, access control and configuration are always your responsibility</strong>. Most cloud
            breaches come from <strong>customer misconfiguration</strong>, not from the provider being hacked.
          </p>
          <h3 id="cost-awareness-the-cloud-bill">Cost awareness: the cloud bill</h3>
          <p>
            Cloud makes it easy to <strong>spend</strong> money, sometimes by accident. Know the main cost drivers:
          </p>
          <ul>
            <li>
              <strong>Compute</strong> (VMs, containers, functions), where right-sizing and turning off idle resources
              matters,
            </li>
            <li>
              <strong>Storage</strong> (disks, object storage, backups, snapshots), and storage classes and lifecycle
              rules help (post 17),
            </li>
            <li>
              <strong>Data transfer (egress)</strong>: data <strong>leaving</strong> the cloud, crossing regions, or
              even <strong>crossing AZs</strong> is often charged. This can be a surprisingly large part of the bill
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
              <strong>Reserved instances and savings plans</strong> give a discount for committing to 1–3 years of
              steady usage.
            </li>
            <li>
              <strong>Spot / preemptible instances</strong> can be up to about 90% cheaper, but can be taken away at
              short notice. They're great for batch jobs and stateless workers that tolerate interruptions.
            </li>
            <li>
              <strong>Auto-scaling</strong> and scheduling (turn off dev environments at night).
            </li>
            <li>
              <strong>CDN caching</strong> reduces origin egress.
            </li>
            <li>
              <strong>Tag resources</strong> by team and project, set <strong>budgets and alerts</strong>, and review
              costs regularly. This practice is often called <strong>FinOps</strong>.
            </li>
          </ul>
          <Stats
            caption="Where cloud bills usually surprise people."
            stats={[
              {
                value: <>Egress</>,
                label: <>data out to the internet</>,
                sub: <>often the biggest shock — use a CDN</>,
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
            Don't click around consoles to build production. Define infrastructure in <strong>code</strong>, with{" "}
            <strong>Terraform / OpenTofu</strong>, <strong>AWS CloudFormation / CDK</strong>, <strong>Pulumi</strong>{" "}
            and similar tools:
          </p>
          <CodeBlock lang="hcl" code={code1} />
          <ul>
            <li>
              ✅ <strong>Repeatable:</strong> the same code builds dev, staging and prod, and rebuilds after a disaster
              (post 45).
            </li>
            <li>
              ✅ <strong>Reviewable:</strong> changes go through pull requests, like application code.
            </li>
            <li>
              ✅ <strong>Auditable:</strong> Git history shows who changed what.
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              ✅ <strong>Speed and agility:</strong> resources in minutes, and easy experimentation.
            </li>
            <li>
              ✅ <strong>Elasticity:</strong> scale up and down with demand, and pay for what you use.
            </li>
            <li>
              ✅ <strong>Global reach and built-in redundancy</strong> (regions, AZs, edge).
            </li>
            <li>
              ✅ <strong>Managed services</strong> remove huge amounts of operational work.
            </li>
            <li>
              ❌ <strong>Cost can surprise you</strong>, especially egress, idle resources and high steady workloads.
            </li>
            <li>
              ❌ <strong>Vendor lock-in:</strong> deep use of provider-specific services makes switching expensive.
            </li>
            <li>
              ❌ <strong>Less control:</strong> you depend on the provider's reliability, limits and roadmap.
            </li>
            <li>
              ❌ <strong>New skills are needed:</strong> IAM, networking, cost management and shared responsibility.
            </li>
          </ul>
          <p>
            <strong>Multi-cloud</strong> (using several providers) can reduce lock-in and meet some regulatory needs,
            but it <strong>adds a lot of complexity</strong>. Most companies are better off doing{" "}
            <strong>one cloud well</strong>, with good architecture (multi-AZ, backups and portable tooling like
            containers and Terraform).
          </p>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>AWS's beginnings.</strong> Amazon launched <strong>S3</strong> and <strong>EC2</strong> in 2006,
            after years of building internal infrastructure for its own retail business. It's widely seen as the start
            of modern cloud computing. Google Cloud and Microsoft Azure followed, and cloud became the default for new
            companies.
          </p>
          <p>
            <strong>AWS Lambda (2014)</strong> made functions-as-a-service mainstream. A 2019 UC Berkeley paper, "Cloud
            Programming Simplified: A Berkeley View on Serverless Computing", argued that serverless would become the
            dominant way to program the cloud, while listing its current limitations.
          </p>
          <p>
            <strong>Region outages and multi-AZ design.</strong> Big cloud incidents, like several well-known AWS
            US-East-1 outages, have repeatedly shown that systems designed across <strong>multiple AZs</strong> or{" "}
            <strong>multiple regions</strong>, with static stability, survive much better than those in one place (post
            40).
          </p>
          <p>
            <strong>Leaving the cloud.</strong> Some companies with <strong>large, steady, predictable</strong>{" "}
            workloads have moved parts of their infrastructure <strong>back to their own hardware</strong> to save
            money. Dropbox did this for file storage (post 17), and 37signals (the makers of Basecamp and HEY) wrote
            publicly about expecting to save <strong>millions of dollars</strong> by leaving the cloud. The lesson isn't
            "cloud is bad". It's that <strong>cloud is best for variable, fast-changing needs</strong>, and very large
            steady workloads may justify owning hardware.
          </p>
          <p>
            <strong>Serverless in practice.</strong> Many companies use serverless for{" "}
            <strong>event-driven glue</strong>: resizing images when they're uploaded to object storage, processing
            webhooks, sending notifications from queues, and nightly reports. They keep core high-traffic APIs on
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
                      A region is a geographic area (Mumbai, Ireland) containing several availability zones. Each AZ is
                      one or more data centres with independent power, cooling and networking, linked to the others by
                      low-latency private links. Spread across AZs for high availability; use multiple regions for
                      disaster recovery and global latency.
                    </p>
                  </>
                ),
              },
              {
                q: <>Compare IaaS, PaaS and serverless.</>,
                a: (
                  <>
                    <p>
                      IaaS gives you virtual machines — you manage the OS and everything above it. PaaS and managed
                      containers run your application for you. Serverless runs individual functions on demand, scaling
                      to zero and billing per invocation, with cold starts, time limits and statelessness as trade-offs.
                    </p>
                  </>
                ),
              },
              {
                q: <>When is serverless a good fit, and when isn't it?</>,
                a: (
                  <>
                    <p>
                      Good for spiky or low-volume workloads, event processing, glue code and scheduled jobs, where
                      scale-to-zero and no servers to manage matter. Less good for steady high throughput (often cheaper
                      on containers), latency-critical paths hurt by cold starts, long-running jobs, or workloads that
                      need many connections to a traditional database.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is the shared responsibility model?</>,
                a: (
                  <>
                    <p>
                      The provider secures the cloud itself — facilities, hardware, hypervisors, managed-service
                      internals. You secure what you put in it — your data, identities and access policies, network
                      rules, OS patching on VMs, and application code. The split shifts with the service model.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why use infrastructure as code?</>,
                a: (
                  <>
                    <p>
                      Environments become versioned, reviewable, repeatable and quick to rebuild — for disaster recovery
                      or a new region — with drift detection and no undocumented manual clicks. Terraform, OpenTofu,
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
                      Tag resources by owner, set budgets and alerts, rightsize and autoscale, use reserved or spot
                      capacity where it fits, put a CDN in front of egress, minimise cross-AZ chatter, apply storage
                      lifecycle rules, and review costs regularly as an engineering metric.
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
