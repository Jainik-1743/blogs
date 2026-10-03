import type { Metadata } from "next";
import Callout from "@/components/Callout";
import CommandList from "@/components/CommandList";
import InterviewQA from "@/components/InterviewQA";
import LessonIntro from "@/components/LessonIntro";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { getLesson } from "@/lib/lessons";

const lesson = getLesson("lesson-15")!;

export const metadata: Metadata = {
  title: `Lesson 15 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Concept: describe the cloud, do not click it" },
  { id: "why-this-matters", label: "Why clicking and shell history stop working" },
  { id: "vocabulary", label: "The nine words of Terraform" },
  { id: "install", label: "Install and connect to AWS" },
  { id: "workflow", label: "The daily loop: init, plan, apply" },
  { id: "state-bucket", label: "First, a safe home for state" },
  { id: "project", label: "Build the project, file by file" },
  { id: "reading-plan", label: "How to read a plan" },
  { id: "state", label: "State: the part everyone gets wrong" },
  { id: "gotchas", label: "Six common pitfalls on day one" },
  { id: "import", label: "Adopting the things you already built by hand" },
  { id: "modules", label: "Modules and environments" },
  { id: "ci", label: "Terraform in a pipeline" },
  { id: "cost", label: "What this costs" },
  { id: "troubleshooting", label: "Troubleshooting table" },
  { id: "interview", label: "Interview corner" },
  { id: "practice", label: "Practice task before Lesson 16" },
  { id: "conclusion", label: "Conclusion" },
];

const words: [string, string, string][] = [
  ["Provider", "A plugin that knows how to talk to one platform's API (AWS, GitHub, Cloudflare…)", "provider \"aws\" { … }"],
  ["Resource", "One thing to create and manage: a VPC, a server, a DNS record", "resource \"aws_vpc\" \"main\" { … }"],
  ["Data source", "Read-only lookup of something that already exists", "data \"aws_route53_zone\" \"main\" { … }"],
  ["Variable", "An input, so the same code works for dev and prod", "variable \"region\" { … }  →  var.region"],
  ["Local", "A named expression to avoid repeating yourself", "locals { azs = [ … ] }  →  local.azs"],
  ["Output", "A value printed or passed on after apply", "output \"alb_dns\" { value = … }"],
  ["Module", "A folder of Terraform reused like a function", "module \"web\" { source = \"./modules/web\" }"],
  ["State", "Terraform's record of which real things it created and their current settings", "terraform.tfstate"],
  ["Plan", "A preview: what would change, computed by comparing code, state and reality", "terraform plan"],
];

const gotchas: [string, string, string][] = [
  ["Default egress rule is removed", "A Security Group created in Terraform has no outbound rule (the console adds allow-all for you). Servers cannot reach the internet, ECR or SSM", "Add an explicit aws_vpc_security_group_egress_rule allowing all outbound"],
  ["Autoscaling fights Terraform", "The ASG changes desired_capacity at runtime; the next plan wants to reset it", "lifecycle { ignore_changes = [desired_capacity] }"],
  ["A \"small\" change replaces the resource", "Some attributes cannot change in place (an RDS identifier, a subnet's AZ). The plan shows -/+ destroy and then create", "Read every -/+ before applying. Use prevent_destroy on data stores"],
  ["Secrets end up in state", "Generated passwords and connection strings are stored in plain text in terraform.tfstate", "Encrypt the bucket, restrict access, prefer managed secrets, never commit state"],
  ["count shifts and destroys things", "Removing an item in the middle of a count list renumbers everything after it", "Use for_each with stable keys for anything that is not identical"],
  ["Changed in the console, Terraform reverts it", "Terraform enforces its own code. Manual edits are \"drift\" and are overwritten on the next apply", "Change the code, not the console. Detect drift with plan -refresh-only"],
];

const trouble: [string, string, string][] = [
  ["Error acquiring the state lock", "Another run is in progress, or a previous run crashed mid-apply and left the lock", "Wait; if certain no run is active: terraform force-unlock <ID>"],
  ["No valid credential sources found", "Terraform cannot find AWS credentials", "aws sts get-caller-identity works? Then set AWS_PROFILE or export credentials; in CI use OIDC"],
  ["Error: … already exists", "The real resource exists but is not in state", "Import it (import block) or delete it if it is a leftover from a failed run"],
  ["Provider produced inconsistent result / eventual consistency", "AWS was still propagating a new resource", "Re-run apply; it usually resolves itself"],
  ["Plan shows changes you did not make", "Drift (console edits), a provider upgrade, or a data source that changed", "Read the diff per attribute; run plan -refresh-only to see pure drift"],
  ["Cycle: A depends on B depends on A", "Two resources reference each other", "Break it with a separate rule resource (e.g. aws_vpc_security_group_*_rule instead of inline rules)"],
  ["Destroy fails: DependencyViolation", "Something outside Terraform (a manual ENI, a leftover resource) still uses the VPC/subnet", "Find and delete the blocker, then destroy again"],
];

export default function LessonFifteenPage() {
  return (
    <article>
      <LessonIntro lesson={lesson} outline={outline} />

      <div className="lesson">
        <h2 id="concept">Concept</h2>
        <p>
          <strong>Terraform</strong> lets you write down your whole cloud — network, servers,
          database, DNS — as text files, and then makes reality match the files. This is called{" "}
          <strong>Infrastructure as Code</strong> (IaC). You stop <em>doing</em> steps and start{" "}
          <em>declaring</em> the result you want.
        </p>
        <Callout kind="note" label="The analogy — a blueprint, not a builder's diary">
          <p className="mb-0">
            The lessons so far were a builder&apos;s diary: &ldquo;I did this, then this, then
            that.&rdquo; If the building burns down, the diary is nearly useless — you cannot even
            remember which of two hundred commands mattered. Terraform is the <strong>architect&apos;s
            blueprint</strong>: it says what the building <em>is</em>. Hand the blueprint to a
            builder (Terraform) and they construct it, repair differences, or build a second identical
            one.
          </p>
        </Callout>
        <p>
          The style is <strong>declarative</strong>: you do not write &ldquo;create a subnet, then
          attach a route&rdquo;; you write &ldquo;there is a subnet with this range and this route
          table&rdquo;, and Terraform works out the order, what already exists, and what has changed.
        </p>

        <h2 id="why-this-matters">Why clicking and shell history stop working</h2>
        <p>
          Count what you created by hand in Lessons 6–13: dozens of objects across ten services,
          with IDs copied between commands. Now imagine:
        </p>
        <ul>
          <li>
            <strong>&ldquo;Recreate production for a staging environment.&rdquo;</strong> Without IaC
            that is days of careful clicking and guesswork. With it:{" "}
            <code>terraform apply -var environment=staging</code>.
          </li>
          <li>
            <strong>&ldquo;Who changed the security group last Tuesday?&rdquo;</strong> Console
            changes leave no reviewable trail. Terraform changes are Git commits and pull requests
            with an author and a reviewer.
          </li>
          <li>
            <strong>Disaster recovery.</strong> Region outage, account compromise, an accidental
            delete: rebuild the whole estate in minutes from the repository, not from someone&apos;s
            memory.
          </li>
          <li>
            <strong>Drift.</strong> Someone &ldquo;just quickly&rdquo; opens port 22 to the world in
            the console and forgets. Terraform detects the difference on the next plan.
          </li>
          <li>
            <strong>Cost control.</strong> Tear down the expensive ALB tier for the weekend with one
            command, and bring it back on Monday — exactly as it was.
          </li>
          <li>
            <strong>Onboarding and audit.</strong> The repository <em>is</em> the documentation, and
            it is always correct because it is the thing that builds the system.
          </li>
        </ul>

        <h2 id="vocabulary">The nine words of Terraform</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Word</th>
                <th>Meaning</th>
                <th>Looks like</th>
              </tr>
            </thead>
            <tbody>
              {words.map(([w, m, e]) => (
                <tr key={w}>
                  <td className="whitespace-nowrap"><strong>{w}</strong></td>
                  <td>{m}</td>
                  <td><code>{e}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Files are written in <strong>HCL</strong> (HashiCorp Configuration Language). It reads like
          structured settings, not a programming language:
        </p>
        <Script
          title="the shape of every Terraform block"
          code={`resource "aws_s3_bucket" "uploads" {     # resource "<TYPE>" "<YOUR NAME FOR IT>"
  bucket = "myapp-uploads-abcd1234"       # argument = value
  tags   = { Name = "uploads" }
}

# Refer to it from anywhere with  <TYPE>.<NAME>.<ATTRIBUTE>
#   aws_s3_bucket.uploads.arn
# Terraform sees that reference and knows: create the bucket BEFORE whatever uses its ARN.`}
        />
        <Callout kind="ok" label="References build the dependency graph for you">
          <p className="mb-0">
            You never write &ldquo;do A before B&rdquo;. When B mentions <code>A.id</code>, Terraform
            orders them, and runs independent resources in parallel. That is why an apply that took
            you two hours by hand takes ten minutes.
          </p>
        </Callout>
        <Callout kind="note" label="OpenTofu">
          <p className="mb-0">
            <strong>OpenTofu</strong> is a community fork of Terraform under an open-source licence,
            with the same language and workflow (<code>tofu</code> instead of <code>terraform</code>).
            Everything in this lesson applies to both. Pick one per project and stay with it.
          </p>
        </Callout>

        <h2 id="install">Install and connect to AWS</h2>
        <p>
          Install the Terraform CLI (Homebrew on macOS, winget on Windows, HashiCorp&apos;s apt
          repository on Ubuntu) — version 1.10 or newer, for the S3 locking used below. It uses the
          same credentials as the AWS CLI from Lesson 5, so check those still show your IAM user,
          never root.
        </p>
        <p>
          Terraform acts as <strong>you</strong>, so its power equals your power. Later, in CI, it
          gets its own role (a broader one than the app-deploy role of Lesson 14, kept separate on
          purpose).
        </p>

        <h2 id="workflow">The daily loop: init, plan, apply</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Command</th>
                <th>What it does</th>
                <th>Changes anything real?</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><code>terraform init</code></td><td>Downloads providers and modules, connects the state backend. Run once per checkout and after adding providers</td><td>No</td></tr>
              <tr><td><code>terraform fmt</code></td><td>Formats the files to the standard style</td><td>No</td></tr>
              <tr><td><code>terraform validate</code></td><td>Checks syntax and internal consistency</td><td>No</td></tr>
              <tr><td><code>terraform plan</code></td><td>Compares code ↔ state ↔ real AWS and prints what <em>would</em> change</td><td>No</td></tr>
              <tr><td><code>terraform apply</code></td><td>Shows the plan, asks for <code>yes</code>, then makes the changes</td><td className="font-semibold text-amber-300">Yes</td></tr>
              <tr><td><code>terraform destroy</code></td><td>Deletes everything it manages</td><td className="font-semibold text-red-300">Yes — everything</td></tr>
            </tbody>
          </table>
        </div>
        <Callout kind="warn" label="Plan is the safety net. Read it.">
          <p className="mb-0">
            The single habit that separates safe Terraform users from those who lose infrastructure by mistake:{" "}
            <strong>read the plan before typing yes</strong>, looking especially for anything marked
            for destroy or replacement. In teams, the plan is posted on the pull request so a
            reviewer reads it too.
          </p>
        </Callout>

        <h2 id="state-bucket">First, a safe home for state</h2>
        <p>
          Terraform remembers what it built in a <strong>state file</strong>. By default that is a
          file on your laptop — one lost laptop, or two teammates, and you have a disaster. So state
          lives in an <strong>S3 bucket</strong> with versioning (undo), encryption and locking (so two
          applies cannot run at once). It is a chicken-and-egg problem — the bucket has to exist
          before Terraform can use it — so we create <em>just this one</em> bucket by hand.
        </p>
        <p>
          In the S3 console, create <code>myapp-tfstate-&lt;account-id&gt;</code> in{" "}
          <code>ap-south-1</code>, with <strong>versioning on</strong> (every old state kept),
          default encryption, and Block Public Access left on.
        </p>
        <p>
          Historically locking needed a separate DynamoDB table. Since Terraform 1.10 the S3 backend
          can lock with a lock file in the bucket itself (<code>use_lockfile = true</code>), which
          removes one whole service from the setup.
        </p>

        <h2 id="project">Build the project, file by file</h2>
        <p>
          Terraform reads every <code>.tf</code> file in a folder as one configuration, so splitting
          by topic is purely for humans. A layout that scales:
        </p>
        <Script
          title="the repository"
          code={`infra/
├── versions.tf        # Terraform + provider versions and the state backend
├── variables.tf       # inputs
├── network.tf         # VPC, subnets, gateway, routes            (Lesson 6)
├── security.tf        # security groups                          (Lesson 6)
├── database.tf        # RDS                                      (Lesson 8)
├── compute.tf         # ALB, launch template, Auto Scaling       (Lesson 12)
├── dns.tf             # Route 53 records                         (Lesson 13)
├── outputs.tf         # values worth printing
├── user-data.sh.tftpl # the boot script, with placeholders       (Lesson 12)
├── prod.tfvars        # values for production (no secrets!)
└── .gitignore         # see below`}
        />
        <h3>versions.tf — pin everything</h3>
        <Script
          title="versions.tf"
          code={`terraform {
  required_version = ">= 1.10"

  required_providers {
    aws    = { source = "hashicorp/aws",    version = "~> 6.0" }
    random = { source = "hashicorp/random", version = "~> 3.6" }
  }

  backend "s3" {
    bucket       = "myapp-tfstate-123456789012"   # the bucket you just created
    key          = "prod/terraform.tfstate"       # one state file per environment
    region       = "ap-south-1"
    encrypt      = true
    use_lockfile = true                           # native locking, no DynamoDB
  }
}

provider "aws" {
  region = var.region

  # Every resource that supports tags gets these, automatically — vital for cost reports (Lesson 19)
  default_tags {
    tags = {
      Project     = var.project
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}`}
        />
        <p>
          <code>~&gt; 6.0</code> means &ldquo;any 6.x, never 7&rdquo;: you get fixes, not breaking
          changes. Terraform records the exact versions in <code>.terraform.lock.hcl</code>, which
          you <strong>commit</strong> so everyone (and CI) uses identical providers.
        </p>
        <h3>variables.tf</h3>
        <p>
          Inputs with defaults: <code>project</code> (&ldquo;myapp&rdquo;),{" "}
          <code>environment</code>, <code>region</code>, <code>domain</code>, instance sizes, and
          the Auto Scaling <code>min_size</code> / <code>max_size</code>. Every file below refers
          to them as <code>var.project</code> and so on, instead of repeating values.
        </p>
        <h3>network.tf — Lesson 6, as code</h3>
        <p>
          One <code>aws_vpc</code>, two public and two private <code>aws_subnet</code>s (made with{" "}
          <code>count = 2</code>, one per Availability Zone), an{" "}
          <code>aws_internet_gateway</code>, and the public route table with its{" "}
          <code>0.0.0.0/0 → gateway</code> row plus two associations. Exactly the pieces you
          clicked through in Lesson 6 — each becomes one block, about 50 lines in all.
        </p>
        <Callout kind="note" label="Or use a community module">
          <p className="mb-0">
            The whole network is about 20 lines with the popular{" "}
            <code>terraform-aws-modules/vpc/aws</code> module, which also handles NAT gateways and
            flow logs. Writing it by hand once — as here — is how you understand what the module is
            doing for you. Check the registry for the current major version before using it.
          </p>
        </Callout>
        <h3>security.tf — Security Groups that reference each other</h3>
        <p>
          The best file to read closely, because it shows how blocks <em>refer</em> to each other.
          Trimmed to the interesting parts:
        </p>
        <Script
          title="security.tf (excerpt)"
          code={`resource "aws_security_group" "web" {
  name   = "\${var.project}-web-sg"
  vpc_id = aws_vpc.main.id                 # a reference: Terraform creates the VPC first
}

# ALB -> app servers: the source is a SECURITY GROUP, not an IP
resource "aws_vpc_security_group_ingress_rule" "web_from_alb" {
  security_group_id            = aws_security_group.web.id
  referenced_security_group_id = aws_security_group.alb.id
  from_port                    = 80
  to_port                      = 80
  ip_protocol                  = "tcp"
}

# IMPORTANT: unlike the console, Terraform removes the default "allow all outbound" rule.
# Without an egress rule the servers cannot reach ECR, SSM, S3 or the internet.
resource "aws_vpc_security_group_egress_rule" "web_out" {
  security_group_id = aws_security_group.web.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}`}
        />
        <p>
          The <code>alb</code> and <code>db</code> groups and their rules follow the same pattern:
          internet → ALB on 80/443, ALB → web on 80, web → db on 5432.
        </p>
        <h3>database.tf — Lesson 8, as code</h3>
        <p>
          The same settings as Lesson 8&apos;s table, as code: a subnet group of the private
          subnets, <code>publicly_accessible = false</code>, the <code>db</code> security group,
          encryption, 7-day backups and <code>deletion_protection = true</code>. The admin password
          comes from a <code>random_password</code> resource, and one extra line makes even{" "}
          <code>terraform destroy</code> refuse to touch the database:
        </p>
        <Script
          title="database.tf (excerpt)"
          code={`lifecycle {
  prevent_destroy = true
}`}
        />
        <h3>compute.tf — Lesson 12, as code</h3>
        <p>
          The largest file, because Lesson 12 had the most pieces: the ALB, its target group with
          the <code>/api/health</code> check, the HTTPS listener (using the ACM certificate,
          looked up with a <code>data</code> block) and the HTTP→HTTPS redirect listener, the
          launch template (IMDSv2, hop limit 2, encrypted disk, and the user-data script filled in
          with <code>templatefile()</code>), and the Auto Scaling group with ELB health checks and
          a rolling <code>instance_refresh</code>. Nothing new — the same fields you set in the
          console, now reviewable in a pull request.
        </p>
        <h3>dns.tf and outputs.tf</h3>
        <p>
          <code>dns.tf</code> holds the alias records from Lesson 13, pointing at{" "}
          <code>aws_lb.app.dns_name</code> — so if the ALB is ever replaced, the record follows it
          automatically. <code>outputs.tf</code> prints the useful values after an apply (the ALB
          name, the database endpoint), and <code>prod.tfvars</code> holds this environment&apos;s
          values. Add <code>.terraform/</code>, <code>*.tfstate</code> and any secret{" "}
          <code>.tfvars</code> to <code>.gitignore</code>.
        </p>
        <p>Now run the loop, from the <code>infra/</code> folder:</p>
        <CommandList
          title="The first apply"
          commands={[
            { cmd: "terraform init", note: "Downloads the providers and connects to the S3 backend. “Terraform has been successfully initialized!”" },
            { cmd: "terraform plan -var-file=prod.tfvars -out=tfplan", note: "Preview, saved to a file so what you review is exactly what gets applied" },
            { cmd: "terraform apply tfplan", note: "Applies that saved plan. ~10–15 minutes (RDS is the slow one)" },
          ]}
        />
        <p>
          Then run the plan once more. &ldquo;No changes. Your infrastructure matches the
          configuration.&rdquo; is the sign of a healthy setup.
        </p>

        <h2 id="reading-plan">How to read a plan</h2>
        <Script
          title="terraform plan (abridged)"
          code={`  # aws_security_group.web will be updated in-place
  ~ resource "aws_security_group" "web" {
      ~ description = "App servers" -> "App servers behind the ALB"   # (~ change in place)
    }

  # aws_subnet.private[1] must be replaced
-/+ resource "aws_subnet" "private" {                                  # (-/+ destroy, then create!)
      ~ availability_zone = "ap-south-1b" -> "ap-south-1c" # forces replacement
    }

  # aws_route53_record.old will be destroyed
  - resource "aws_route53_record" "old" { ... }                        # (- delete)

  # aws_s3_bucket.assets will be created
  + resource "aws_s3_bucket" "assets" { ... }                          # (+ create)

Plan: 1 to add, 1 to change, 2 to destroy.`}
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Meaning</th>
                <th>Your reaction</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><code>+</code></td><td>Create</td><td>Usually fine</td></tr>
              <tr><td><code>~</code></td><td>Update in place</td><td>Check which attribute changes and whether it causes downtime</td></tr>
              <tr><td><code>-</code></td><td>Destroy</td><td>Stop. Is this intended? Is it data?</td></tr>
              <tr><td><code>-/+</code></td><td>Destroy and recreate (replacement)</td><td className="font-semibold text-red-300">Highest attention. For a database, disk or load balancer this can mean data loss or downtime. Look for “forces replacement”</td></tr>
            </tbody>
          </table>
        </div>

        <h2 id="state">State: the part everyone gets wrong</h2>
        <p>
          The state file is a JSON map from &ldquo;this block in my code&rdquo; to &ldquo;that real
          resource ID in AWS&rdquo;. Terraform needs it to know that{" "}
          <code>aws_vpc.main</code> <em>is</em> <code>vpc-0abc…</code>. Lose it and Terraform forgets
          it owns anything: the next apply tries to create everything again and collides with what
          exists.
        </p>
        <ul>
          <li>
            <strong>Remote and locked</strong>: the S3 backend gives one shared truth, and locking
            makes a second concurrent apply wait instead of corrupting it.
          </li>
          <li>
            <strong>Never edit it by hand.</strong> Use the <code>terraform state</code> commands (
            <code>list</code>, <code>show</code>, <code>mv</code> when you rename a resource,{" "}
            <code>rm</code> to make Terraform forget something without destroying it).
          </li>
          <li>
            <strong>It contains secrets.</strong> The generated database password is stored in it in
            plain text. Encrypt the bucket, allow only the Terraform role to read it, and never put
            the state (or a <code>.tfvars</code> holding secrets) in Git. Better still, reduce what
            reaches state: for RDS you can set <code>manage_master_user_password = true</code> so AWS
            creates the password in Secrets Manager and it never passes through Terraform.
          </li>
          <li>
            <strong>One state per environment.</strong> A separate <code>key</code> (or folder) for
            dev, staging and prod keeps a mistake in dev from touching prod, and keeps each plan
            fast.
          </li>
        </ul>
        <p>
          You will also meet: listing everything in state, showing one resource&apos;s recorded
          attributes, a <em>refresh-only</em> plan that reports drift without proposing changes,
          and <code>-replace</code> to force one resource to be recreated.
        </p>

        <h2 id="gotchas">Six common pitfalls on day one</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pitfall</th>
                <th>What happens</th>
                <th>Fix</th>
              </tr>
            </thead>
            <tbody>
              {gotchas.map(([g, w, f]) => (
                <tr key={g}>
                  <td><strong>{g}</strong></td>
                  <td>{w}</td>
                  <td>{f}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3>The two lifecycle settings to know</h3>
        <Script
          title="lifecycle"
          code={`lifecycle {
  prevent_destroy       = true          # plan/apply/destroy refuses to delete this. Use on databases, state buckets
  ignore_changes        = [desired_capacity]   # something else legitimately changes this; do not fight it
  create_before_destroy = true          # build the replacement first, then remove the old one (zero downtime)
}`}
        />

        <h2 id="import">Adopting the things you already built by hand</h2>
        <p>
          You already have a state bucket, an IAM role from Lesson 5, maybe a domain zone. Terraform
          can <strong>adopt</strong> existing resources instead of recreating them. Write the
          resource block, then an <code>import</code> block that says which real thing it is:
        </p>
        <Script
          title="import.tf"
          code={`import {
  to = aws_s3_bucket.uploads
  id = "myapp-uploads-abcd1234"          # the bucket's real name
}

resource "aws_s3_bucket" "uploads" {
  bucket = "myapp-uploads-abcd1234"
}`}
        />
        <p>
          Terraform can even write the resource block for you from the real settings
          (<code>-generate-config-out</code>). Review that generated file, apply, and the plan must
          then say &ldquo;no changes&rdquo; — if it shows changes, your code differs from reality;
          decide which is right.
        </p>
        <p>
          Migrate in slices, not all at once: import one area (say the network), get to a clean
          &ldquo;no changes&rdquo; plan, commit, then the next. Big-bang imports are where mistakes
          creep in.
        </p>

        <h2 id="modules">Modules and environments</h2>
        <p>
          When the same shape is needed twice — a staging and a prod copy — a <strong>module</strong>{" "}
          packages it. A module is just a folder of <code>.tf</code> files with variables in and
          outputs out; calling it is like calling a function. Staging becomes a few lines that
          call the same module with smaller sizes:
        </p>
        <Script
          title="layout"
          code={`infra/
├── modules/
│   └── web-stack/          # network + ALB + ASG + RDS: everything above, parameterised
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
└── envs/
    ├── staging/
    │   ├── main.tf         # calls the module with small sizes
    │   └── backend.tf      # its own state key: staging/terraform.tfstate
    └── prod/
        ├── main.tf         # calls the same module with real sizes and Multi-AZ
        └── backend.tf      # prod/terraform.tfstate`}
        />
        <Callout kind="note" label="Workspaces vs folders">
          <p className="mb-0">
            Terraform also has <em>workspaces</em>, multiple states from one folder. They are handy for
            throwaway copies, but for real environments most teams prefer <strong>separate folders and
            state</strong>: the code path shows exactly which environment you are touching, and access
            can be restricted per environment. Do not start with a module until you have two
            copies to justify it; premature abstraction is expensive to undo.
          </p>
        </Callout>

        <h2 id="ci">Terraform in a pipeline</h2>
        <p>
          The mature workflow: nobody applies from a laptop. A pull request runs{" "}
          <code>plan</code> and posts it; merging runs <code>apply</code> after approval. Every
          infrastructure change is reviewed exactly like code, with a plan attached.
        </p>
        <ul>
          <li>
            <strong>On a pull request</strong> that touches <code>infra/</code>: init,{" "}
            <code>fmt -check</code>, validate, then plan — and post the plan as a PR comment.
          </li>
          <li>
            <strong>On merge to main</strong>: the same plan, then <code>apply</code>, behind the{" "}
            <code>production</code> environment&apos;s approval.
          </li>
          <li>
            Authenticated with OIDC (Lesson 14) as a role called <code>github-terraform</code>.
          </li>
        </ul>
        <p>
          The <code>github-terraform</code> role needs wide permissions (it creates VPCs and IAM
          roles), which is exactly why it is a <strong>separate role</strong> from the narrow{" "}
          <code>github-deploy</code> of Lesson 14, trusted only for the <code>infra</code> path and the
          production environment. Add <code>tflint</code> and a policy scanner such as{" "}
          <code>checkov</code> or <code>tfsec</code> to catch open Security Groups and unencrypted
          disks before they exist.
        </p>
        <Callout kind="warn" label="Deploy pipeline and infrastructure pipeline: keep them apart">
          <p className="mb-0">
            The app pipeline ships frequently with narrow rights; the Terraform pipeline changes
            rarely with broad rights and stricter approval. Merging them gives every app commit the
            power to rewrite your network. Note also that Terraform&apos;s <code>image_tag</code>{" "}
            variable should <em>not</em> be how you deploy versions: the app pipeline updates the SSM
            parameter, and Terraform stays out of that loop.
          </p>
        </Callout>

        <h2 id="cost">What this costs</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Item</th><th>Cost</th></tr>
            </thead>
            <tbody>
              <tr><td>Terraform / OpenTofu CLI</td><td className="font-semibold text-emerald-300">Free</td></tr>
              <tr><td>S3 state bucket (a few KB of state, versioned)</td><td>Pennies per month</td></tr>
              <tr><td>HCP Terraform (hosted runs), optional</td><td>Free tier for small teams; paid beyond</td></tr>
              <tr><td>What Terraform <em>creates</em></td><td>Exactly what those resources cost. Terraform is free; your ALB is not</td></tr>
            </tbody>
          </table>
        </div>
        <Callout kind="ok" label="The biggest cost saving">
          <p className="mb-0">
            <code>terraform destroy</code> removes the ALB, servers and NAT-like extras when you are
            not studying, and <code>apply</code> brings the identical stack back. (The database has{" "}
            <code>prevent_destroy</code>; for a practice account, remove that line first or target the
            compute layer with a separate folder.) It turns an $70/month lab into a few dollars of
            weekend use.
          </p>
        </Callout>

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
                  <td><code>{s}</code></td>
                  <td>{c}</td>
                  <td>{f}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 id="interview">Interview corner</h2>
        <InterviewQA
          items={[
            {
              q: "What is Terraform state and why is it stored remotely?",
              a: (
                <p className="mb-0">
                  State maps configuration to real resource IDs and attributes so Terraform can compute
                  diffs. Remote storage (S3 with versioning, encryption and locking) gives teams one
                  shared source of truth, prevents concurrent applies, and avoids loss of a laptop
                  file. It can hold secrets, so access must be restricted.
                </p>
              ),
            },
            {
              q: "Declarative vs imperative — what is the difference and why does it matter?",
              a: (
                <p className="mb-0">
                  Imperative scripts list steps and break when run twice or from a different starting
                  point. Declarative code describes the desired end state and the tool computes the
                  steps, making runs idempotent: applying the same code repeatedly converges on the same
                  result.
                </p>
              ),
            },
            {
              q: "count vs for_each?",
              a: (
                <p className="mb-0">
                  <code>count</code> indexes resources by position, so removing an item in the middle
                  renumbers and recreates the rest. <code>for_each</code> keys them by a stable string
                  or map key, so adding or removing one entry only affects that entry. Prefer{" "}
                  <code>for_each</code> unless the items are truly identical.
                </p>
              ),
            },
            {
              q: "Someone changed a security group in the console. What happens on the next apply?",
              a: (
                <p className="mb-0">
                  Terraform detects drift in plan and reverts the resource to match the code (unless it
                  is in <code>ignore_changes</code>). The fix is cultural and technical: change through
                  code, restrict console write access, and run scheduled drift-detection plans.
                </p>
              ),
            },
            {
              q: "A plan shows -/+ on your database. What do you do?",
              a: (
                <p className="mb-0">
                  Stop and find the attribute marked “forces replacement”. Revert or work around it
                  (a different change path, or a snapshot-restore plan). Protect stateful resources with{" "}
                  <code>prevent_destroy</code> and deletion protection so a replacement fails loudly.
                </p>
              ),
            },
            {
              q: "How do you bring existing manually created infrastructure under Terraform?",
              a: (
                <p className="mb-0">
                  Write matching resource blocks and use <code>import</code> blocks (or{" "}
                  <code>terraform import</code>), optionally generating config with{" "}
                  <code>-generate-config-out</code>, then iterate until the plan shows no changes.
                  Migrate one area at a time.
                </p>
              ),
            },
            {
              q: "How would you manage dev, staging and prod?",
              a: (
                <p className="mb-0">
                  Shared modules with separate root configurations and separate state per environment
                  (or workspaces for ephemeral copies), environment-specific tfvars, separate AWS
                  accounts ideally, and a pipeline that plans on PR and applies on merge with approval
                  for prod.
                </p>
              ),
            },
          ]}
        />

        <hr />

        <h2 id="practice">Practice task before Lesson 16</h2>
        <ol>
          <li>
            Create the state bucket, then write the <code>infra/</code> files described above. Run{" "}
            <code>init</code>, <code>plan</code> and read the whole plan top to bottom before applying.
          </li>
          <li>
            Apply, then run <code>plan</code> again and confirm &ldquo;No changes&rdquo;.
          </li>
          <li>
            Cause drift on purpose: add a random inbound rule to a Security Group in the console. Run{" "}
            <code>terraform plan</code>, read how it reports the change, then <code>apply</code> to
            revert it.
          </li>
          <li>
            Change <code>max_size</code> to 8 and see the plan is an in-place update. Change the
            database <code>identifier</code> and see it becomes <code>-/+</code> (do <em>not</em>{" "}
            apply that!).
          </li>
          <li>
            Import your existing uploads bucket with an <code>import</code> block and get to a clean
            plan.
          </li>
          <li>
            Run <code>terraform destroy</code> on a throwaway copy (remove the DB&apos;s{" "}
            <code>prevent_destroy</code> first), time it, then <code>apply</code> again and time the
            rebuild. Write down how long recreating production would take from scratch.
          </li>
        </ol>
        <Callout kind="ok" label="Optional stretch">
          <p className="mb-0">
            Add the <code>terraform.yml</code> workflow, create the <code>github-terraform</code> role
            with a trust policy limited to your repo, and open a PR that changes a tag. Watch the plan
            run; merge and approve; watch the apply.
          </p>
        </Callout>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          The architecture you built by hand over thirteen lessons is now a few hundred lines of
          reviewable text that anyone can rebuild, compare and roll back.
        </p>
        <ul>
          <li>
            <strong>Declare the result</strong>, let Terraform work out order and differences; the
            resource reference graph handles dependencies.
          </li>
          <li>
            <strong>init → plan → apply</strong>, and <em>read the plan</em>, hunting for{" "}
            <code>-/+</code> and destroys.
          </li>
          <li>
            <strong>State is precious</strong>: remote, versioned, encrypted, locked, never edited by
            hand, never in Git, and one per environment.
          </li>
          <li>
            <strong>Protect stateful things</strong> with <code>prevent_destroy</code>,{" "}
            <code>ignore_changes</code> where something else legitimately changes a value, and{" "}
            <code>for_each</code> over <code>count</code>.
          </li>
          <li>
            <strong>Infra changes go through PRs</strong> with plan output, on a separate,
            tightly-controlled role from the app pipeline.
          </li>
        </ul>
        <p>
          Now the fun stretch: make the app faster with a cache. Next up is Redis for sessions,
          rate limits and hot data.
        </p>

        <hr />
        <p>
          End of Lesson 15. Next: <strong>Lesson 16 — Redis: Caching and Sessions</strong>.
        </p>
      </div>

      <LessonPager slug={lesson.slug} />
    </article>
  );
}
