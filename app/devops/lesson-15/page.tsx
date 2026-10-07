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
  ["Provider", "A plugin that lets Terraform talk to one platform, such as AWS, GitHub or Cloudflare", "provider \"aws\" { … }"],
  ["Resource", "One thing for Terraform to create and manage, such as a VPC, a server or a DNS record", "resource \"aws_vpc\" \"main\" { … }"],
  ["Data source", "A read-only lookup of something that already exists", "data \"aws_route53_zone\" \"main\" { … }"],
  ["Variable", "An input value, so the same code can work for dev and prod", "variable \"region\" { … }  →  var.region"],
  ["Local", "A named value you define once, so you do not repeat yourself", "locals { azs = [ … ] }  →  local.azs"],
  ["Output", "A value that Terraform prints or passes on after apply", "output \"alb_dns\" { value = … }"],
  ["Module", "A folder of Terraform code that you reuse, like a function", "module \"web\" { source = \"./modules/web\" }"],
  ["State", "Terraform's notes about which real things it created and their settings", "terraform.tfstate"],
  ["Plan", "A preview of what would change. Terraform works it out by comparing your code, the state and the real cloud", "terraform plan"],
];

const gotchas: [string, string, string][] = [
  ["Default egress rule is removed", "A Security Group created in Terraform has no outbound rule (the console adds an allow-all outbound rule for you). The servers cannot reach the internet, ECR or SSM", "Add an explicit aws_vpc_security_group_egress_rule allowing all outbound"],
  ["Autoscaling fights Terraform", "The Auto Scaling group changes desired_capacity while running, and the next plan wants to reset it", "lifecycle { ignore_changes = [desired_capacity] }"],
  ["A \"small\" change replaces the resource", "Some settings cannot be changed in place (an RDS identifier, a subnet's AZ). The plan shows -/+, which means destroy and then create", "Read every -/+ before you apply. Use prevent_destroy on anything that stores data"],
  ["Secrets end up in state", "Generated passwords and connection strings are saved as plain text in terraform.tfstate", "Encrypt the bucket, limit who can read it, prefer managed secrets, and never commit state to Git"],
  ["count shifts and destroys things", "If you remove an item from the middle of a count list, every item after it gets a new number", "Use for_each with stable keys unless the items are truly identical"],
  ["Changed in the console, Terraform reverts it", "Terraform enforces its own code. Manual edits are called \"drift\", and the next apply overwrites them", "Change the code, not the console. Find drift with plan -refresh-only"],
];

const trouble: [string, string, string][] = [
  ["Error acquiring the state lock", "Another run is in progress, or an earlier run crashed during apply and left the lock behind", "Wait. If you are sure no run is active, use terraform force-unlock <ID>"],
  ["No valid credential sources found", "Terraform cannot find AWS credentials", "Does aws sts get-caller-identity work? Then set AWS_PROFILE or export the credentials. In CI use OIDC"],
  ["Error: … already exists", "The real resource exists but is not in the state", "Import it (with an import block), or delete it if it is a leftover from a failed run"],
  ["Provider produced inconsistent result / eventual consistency", "AWS was still spreading the new resource through its systems", "Run apply again. It usually fixes itself"],
  ["Plan shows changes you did not make", "Drift (console edits), a provider upgrade, or a data source that changed", "Read the difference setting by setting. Run plan -refresh-only to see only drift"],
  ["Cycle: A depends on B depends on A", "Two resources refer to each other", "Break the loop with a separate rule resource (for example aws_vpc_security_group_*_rule instead of inline rules)"],
  ["Destroy fails: DependencyViolation", "Something outside Terraform (a manual network interface, a leftover resource) still uses the VPC or subnet", "Find and delete the blocker, then run destroy again"],
];

export default function LessonFifteenPage() {
  return (
    <article>
      <LessonIntro lesson={lesson} outline={outline} />

      <div className="lesson">
        <h2 id="concept">Concept</h2>
        <p>
          <strong>Terraform</strong> is a tool that lets you write down your whole cloud as text
          files. That includes the network, servers, database and DNS (the system that turns names
          into addresses). Then Terraform makes the real cloud match the files. This is called{" "}
          <strong>Infrastructure as Code</strong> (IaC). You stop <em>doing</em> steps by hand. You
          start <em>declaring</em> the result you want. (<em>Infrastructure</em> means the basic
          parts that your app runs on: networks, servers and databases.)
        </p>
        <Callout kind="note" label="The analogy — a blueprint, not a builder's diary">
          <p className="mb-0">
            The lessons so far were a builder&apos;s diary: &ldquo;I did this, then this, then
            that.&rdquo; If the building burns down, the diary is almost useless. You cannot tell
            which of two hundred commands mattered. Terraform is the <strong>architect&apos;s
            blueprint</strong>. It says what the building <em>is</em>. Give the blueprint to a
            builder (Terraform). The builder constructs the building, repairs any differences, or
            builds a second identical one.
          </p>
        </Callout>
        <p>
          This style is called <strong>declarative</strong>. You do not write &ldquo;create a subnet,
          then attach a route&rdquo;. That would be <em>imperative</em>, a list of steps. Instead you
          write &ldquo;there is a subnet with this range and this route table&rdquo;. Terraform
          works out the order, what already exists and what has changed.
        </p>

        <h2 id="why-this-matters">Why clicking and shell history stop working</h2>
        <p>
          Count what you created by hand in Lessons 6 to 13. (A VPC is your private network inside AWS. A
          subnet is a smaller part of it. A Security Group is a firewall for a server. An ALB is a
          load balancer that shares web requests between servers. RDS is the AWS managed database
          service.) It was dozens of objects across ten
          services, with IDs copied from one command to the next. Now imagine these situations:
        </p>
        <ul>
          <li>
            <strong>&ldquo;Recreate production as a staging environment.&rdquo;</strong> (Staging is
            a practice copy of production.) Without IaC this means days of careful clicking and
            guessing. With IaC you run{" "}
            <code>terraform apply -var environment=staging</code>.
          </li>
          <li>
            <strong>&ldquo;Who changed the security group last Tuesday?&rdquo;</strong> Console
            changes leave no trail that you can review. Terraform changes are Git commits and pull
            requests. Each one has an author and a reviewer.
          </li>
          <li>
            <strong>Disaster recovery.</strong> Imagine a region outage, a hacked account or an
            accidental delete. You can rebuild everything from the repository in a short time. You
            do not need to rely on someone&apos;s memory.
          </li>
          <li>
            <strong>Drift.</strong> Drift means the real cloud no longer matches your code. For
            example, someone quickly opens port 22 to the whole world in the console and forgets.
            Terraform finds the difference on the next plan.
          </li>
          <li>
            <strong>Cost control.</strong> Delete the expensive ALB layer for the weekend with one
            command. Bring it back on Monday exactly as it was.
          </li>
          <li>
            <strong>Onboarding and audit.</strong> New people can learn from the repository, and
            auditors can check it. The repository <em>is</em> the documentation. It is always
            correct because it is what builds the system.
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
          <strong>Idempotent</strong> means that running the same action again and again gives the
          same result. Terraform is idempotent: a second apply with the same code changes nothing.
          Terraform files are written in <strong>HCL</strong> (HashiCorp Configuration Language),
          which is a simple language for describing settings. It reads like a list of settings, not
          like a programming language:
        </p>
        <Script
          title="the shape of every Terraform block"
          code={`resource "aws_s3_bucket" "uploads" {     # resource "<TYPE>" "<YOUR NAME FOR IT>"
  bucket = "myapp-uploads-abcd1234"       # setting = value
  tags   = { Name = "uploads" }
}

# Refer to it from anywhere with  <TYPE>.<NAME>.<ATTRIBUTE>
#   aws_s3_bucket.uploads.arn      (an ARN is the unique AWS name of a resource)
# Terraform sees that reference and knows: create the bucket BEFORE whatever uses its ARN.`}
        />
        <Callout kind="ok" label="References build the dependency graph for you">
          <p className="mb-0">
            You never write &ldquo;do A before B&rdquo;. When B mentions <code>A.id</code>, Terraform
            puts them in the right order. It builds independent resources at the same time. That is
            why an apply that took you two hours by hand can take ten minutes.
          </p>
        </Callout>
        <Callout kind="note" label="OpenTofu">
          <p className="mb-0">
            <strong>OpenTofu</strong> is a copy of Terraform (a &ldquo;fork&rdquo;) that the community
            keeps under an open-source licence. It has the same language and workflow. You type{" "}
            <code>tofu</code> instead of <code>terraform</code>. Everything in this lesson works with
            both. Pick one for each project and keep using it.
          </p>
        </Callout>

        <h2 id="install">Install and connect to AWS</h2>
        <p>
          Install the Terraform CLI (command-line program). Use Homebrew on macOS, winget on Windows
          or HashiCorp&apos;s apt repository on Ubuntu. Use version 1.11 or newer. Version 1.10 has
          the S3 locking used below only as an experimental feature. Terraform uses the same
          credentials as the AWS CLI from Lesson 5. Check that they still show your IAM user, never
          the root user. (An IAM user is a person&apos;s login inside your AWS account. The root user
          is the all-powerful first login, which you should not use for daily work.)
        </p>
        <p>
          Terraform acts as <strong>you</strong>, so it can do everything you can do. Later, in CI, it
          gets its own role. A role is a set of AWS permissions that a person or program can take
          on. This role is broader than the app-deploy role of Lesson 14, and we keep them separate
          on purpose.
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
              <tr><td><code>terraform init</code></td><td>Downloads providers and modules and connects the state backend (the place where state is stored). Run it once per checkout and after you add a provider</td><td>No</td></tr>
              <tr><td><code>terraform fmt</code></td><td>Formats the files in the standard style</td><td>No</td></tr>
              <tr><td><code>terraform validate</code></td><td>Checks the syntax and that the files agree with each other</td><td>No</td></tr>
              <tr><td><code>terraform plan</code></td><td>Compares your code, the state and the real AWS, and prints what <em>would</em> change</td><td>No</td></tr>
              <tr><td><code>terraform apply</code></td><td>Shows the plan, asks you to type <code>yes</code>, then makes the changes</td><td className="font-semibold text-amber-300">Yes</td></tr>
              <tr><td><code>terraform destroy</code></td><td>Deletes everything that Terraform manages</td><td className="font-semibold text-red-300">Yes — everything</td></tr>
            </tbody>
          </table>
        </div>
        <Callout kind="warn" label="Plan is the safety net. Read it.">
          <p className="mb-0">
            One habit separates safe Terraform users from people who lose infrastructure by mistake:{" "}
            <strong>read the plan before you type yes</strong>. Look most closely for anything marked
            for destroy or replacement. In teams, the plan is posted on the pull request so a
            reviewer reads it too.
          </p>
        </Callout>

        <h2 id="state-bucket">First, a safe home for state</h2>
        <p>
          A <strong>state file</strong> is a file in which Terraform remembers what it built. By default this file
          is on your laptop. If you lose the laptop, or if two teammates work at once, you have a
          disaster. So we keep state in an <strong>S3 bucket</strong> (an AWS storage folder) with
          three protections. Versioning keeps old copies, so you can undo. Encryption protects the
          contents. Locking stops two applies from running at once. There is a chicken-and-egg
          problem: the bucket must exist before Terraform can use it. So we create <em>just this
          one</em> bucket by hand.
        </p>
        <p>
          In the S3 console, create a bucket named <code>myapp-tfstate-&lt;account-id&gt;</code> in
          the <code>ap-south-1</code> region. Turn <strong>versioning on</strong> (every old state
          is kept). Keep default encryption on. Leave Block Public Access on.
        </p>
        <p>
          In the past, locking needed a separate DynamoDB table (an AWS database service). Now the S3
          backend can lock with a small lock file inside the bucket
          (<code>use_lockfile = true</code>). It was added as experimental in Terraform 1.10 and is
          stable from 1.11. This removes one whole service from the setup.
        </p>

        <h2 id="project">Build the project, file by file</h2>
        <p>
          Terraform reads every <code>.tf</code> file in a folder as one configuration. So the split
          into files is only to help humans. Here is a layout that keeps working as the project
          grows:
        </p>
        <Script
          title="the repository"
          code={`infra/
├── versions.tf        # Terraform and provider versions, and the state backend
├── variables.tf       # input values
├── network.tf         # VPC, subnets, gateway, routes            (Lesson 6)
├── security.tf        # security groups                          (Lesson 6)
├── database.tf        # RDS                                      (Lesson 8)
├── compute.tf         # ALB, launch template, Auto Scaling       (Lesson 12)
├── dns.tf             # Route 53 records                         (Lesson 13)
├── outputs.tf         # values worth printing
├── user-data.sh.tftpl # the boot script, with blanks to fill in  (Lesson 12)
├── prod.tfvars        # values for production (no secrets!)
└── .gitignore         # see below`}
        />
        <h3>versions.tf — pin every version</h3>
        <p>
          &ldquo;Pin&rdquo; means to fix a version so it cannot change by surprise.
        </p>
        <Script
          title="versions.tf"
          code={`terraform {
  required_version = ">= 1.11"

  required_providers {
    aws    = { source = "hashicorp/aws",    version = "~> 6.0" }
    random = { source = "hashicorp/random", version = "~> 3.6" }
  }

  backend "s3" {
    bucket       = "myapp-tfstate-123456789012"   # the bucket you just created
    key          = "prod/terraform.tfstate"       # one state file for each environment
    region       = "ap-south-1"
    encrypt      = true
    use_lockfile = true                           # locking inside S3, no DynamoDB needed
  }
}

provider "aws" {
  region = var.region

  # Every resource that supports tags gets these automatically. Tags are labels, and they matter for cost reports (Lesson 19)
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
          <code>~&gt; 6.0</code> means &ldquo;any 6.x version, but never 7&rdquo;. You get fixes but
          not breaking changes. Terraform writes the exact versions it chose into{" "}
          <code>.terraform.lock.hcl</code>. You <strong>commit</strong> that file to Git (Git is the version-control tool that records every change to your files), so
          everyone, including CI, uses identical providers.
        </p>
        <h3>variables.tf</h3>
        <p>
          This file lists the input values, with defaults: <code>project</code> (&ldquo;myapp&rdquo;),{" "}
          <code>environment</code>, <code>region</code>, <code>domain</code>, the instance sizes, and
          the Auto Scaling <code>min_size</code> and <code>max_size</code>. Every file below uses
          them as <code>var.project</code> and so on, so you do not repeat values.
        </p>
        <h3>network.tf — Lesson 6, as code</h3>
        <p>
          You need one <code>aws_vpc</code> and four <code>aws_subnet</code> blocks: two public and
          two private. Make each pair with <code>count = 2</code>, one per Availability Zone (a
          separate data centre area). Add an <code>aws_internet_gateway</code>. Add the public route
          table with its <code>0.0.0.0/0 → gateway</code> row (<code>0.0.0.0/0</code> means &ldquo;every address&rdquo;, so all internet traffic goes through the gateway), plus two associations (links from
          the table to the public subnets). These are the same pieces you clicked through in Lesson
          6. Each becomes one block, about 50 lines in all.
        </p>
        <Callout kind="note" label="Or use a community module">
          <p className="mb-0">
            The whole network takes about 20 lines with the popular{" "}
            <code>terraform-aws-modules/vpc/aws</code> module. This module also sets up NAT gateways
            and flow logs. Write the network by hand once, as here. Then you understand what the
            module does for you. Check the Terraform Registry for the current major version before
            you use the module.
          </p>
        </Callout>
        <h3>security.tf — Security Groups that reference each other</h3>
        <p>
          This is the best file to read closely, because it shows how blocks <em>refer</em> to each
          other. Here are the interesting parts:
        </p>
        <Script
          title="security.tf (excerpt)"
          code={`resource "aws_security_group" "web" {
  name   = "\${var.project}-web-sg"
  vpc_id = aws_vpc.main.id                 # a reference, so Terraform creates the VPC first
}

# ALB -> app servers: the traffic source is a SECURITY GROUP, not an IP address
resource "aws_vpc_security_group_ingress_rule" "web_from_alb" {
  security_group_id            = aws_security_group.web.id
  referenced_security_group_id = aws_security_group.alb.id
  from_port                    = 80
  to_port                      = 80
  ip_protocol                  = "tcp"
}

# IMPORTANT: unlike the console, Terraform removes the default "allow all outbound" rule.
# Without an egress (outbound) rule the servers cannot reach ECR, SSM, S3 or the internet.
resource "aws_vpc_security_group_egress_rule" "web_out" {
  security_group_id = aws_security_group.web.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}`}
        />
        <p>
          The <code>alb</code> and <code>db</code> groups and their rules follow the same pattern.
          The internet reaches the ALB on ports 80 and 443. The ALB reaches the web servers on port
          80. The web servers reach the database on port 5432.
        </p>
        <h3>database.tf — Lesson 8, as code</h3>
        <p>
          These are the same settings as in Lesson 8&apos;s table, written as code. They are a subnet
          group made of the private subnets, <code>publicly_accessible = false</code>, the{" "}
          <code>db</code> security group, encryption, 7-day backups and{" "}
          <code>deletion_protection = true</code>. The admin password comes from a{" "}
          <code>random_password</code> resource. One extra setting makes even{" "}
          <code>terraform destroy</code> refuse to delete the database:
        </p>
        <Script
          title="database.tf (excerpt)"
          code={`lifecycle {
  prevent_destroy = true
}`}
        />
        <h3>compute.tf — Lesson 12, as code</h3>
        <p>
          This is the largest file, because Lesson 12 had the most pieces. It holds these parts:
        </p>
        <ul>
          <li>The ALB and its target group, with the <code>/api/health</code> check.</li>
          <li>
            The HTTPS listener (the part of the ALB that waits for requests on one port), which uses the ACM certificate (ACM, AWS Certificate Manager, issues free TLS certificates for HTTPS) that a <code>data</code> block looks
            up. Also the listener that redirects HTTP to HTTPS.
          </li>
          <li>
            The launch template. It sets IMDSv2 (the safer way for a server to read its own
            details), a hop limit of 2, an encrypted disk, and the user-data script (the script that
            runs on first boot), filled in with <code>templatefile()</code>.
          </li>
          <li>
            The Auto Scaling group with ELB health checks and a rolling{" "}
            <code>instance_refresh</code>. A rolling refresh replaces servers a few at a time.
          </li>
        </ul>
        <p>
          Nothing here is new. These are the same fields you set in the console. Now a pull request
          can review them.
        </p>
        <h3>dns.tf and outputs.tf</h3>
        <p>
          <code>dns.tf</code> holds the alias records from Lesson 13. They point at{" "}
          <code>aws_lb.app.dns_name</code>, so if the ALB is replaced, the record follows it
          automatically. <code>outputs.tf</code> prints useful values after an apply, such as the ALB
          name and the database endpoint. <code>prod.tfvars</code> holds the values for this
          environment. Add <code>.terraform/</code>, <code>*.tfstate</code> and any{" "}
          <code>.tfvars</code> file that holds secrets to <code>.gitignore</code>.
        </p>
        <p>Now run the loop, from the <code>infra/</code> folder:</p>
        <CommandList
          title="The first apply"
          commands={[
            { cmd: "terraform init", note: "Downloads the providers and connects to the S3 backend. You should see “Terraform has been successfully initialized!”" },
            { cmd: "terraform plan -var-file=prod.tfvars -out=tfplan", note: "Shows the preview and saves it to a file, so what you review is exactly what gets applied" },
            { cmd: "terraform apply tfplan", note: "Applies that saved plan. It takes about 10 to 15 minutes (RDS is the slow one)" },
          ]}
        />
        <p>
          Then run the plan once more. If you see &ldquo;No changes. Your infrastructure matches
          the configuration.&rdquo;, your setup is healthy.
        </p>

        <h2 id="reading-plan">How to read a plan</h2>
        <Script
          title="terraform plan (abridged)"
          code={`  # aws_security_group.web will be updated in-place
  ~ resource "aws_security_group" "web" {
      ~ description = "App servers" -> "App servers behind the ALB"   # (~ changed in place)
    }

  # aws_subnet.private[1] must be replaced
-/+ resource "aws_subnet" "private" {                                  # (-/+ destroy, then create again!)
      ~ availability_zone = "ap-south-1b" -> "ap-south-1c" # forces replacement
    }

  # aws_route53_record.old will be destroyed
  - resource "aws_route53_record" "old" { ... }                        # (- will be deleted)

  # aws_s3_bucket.assets will be created
  + resource "aws_s3_bucket" "assets" { ... }                          # (+ will be created)

Plan: 2 to add, 1 to change, 2 to destroy.`}
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
              <tr><td><code>~</code></td><td>Update in place</td><td>Check which setting changes and whether it causes downtime</td></tr>
              <tr><td><code>-</code></td><td>Destroy</td><td>Stop. Did you mean to do this? Does it hold data?</td></tr>
              <tr><td><code>-/+</code></td><td>Destroy, then create again (replacement)</td><td className="font-semibold text-red-300">Pay the most attention here. For a database, disk or load balancer it can mean lost data or downtime. Look for the words “forces replacement”</td></tr>
            </tbody>
          </table>
        </div>

        <h2 id="state">State: the part everyone gets wrong</h2>
        <p>
          The state file is a JSON file (a text format for structured data). It links &ldquo;this
          block in my code&rdquo; to &ldquo;that real resource ID in AWS&rdquo;. Terraform needs it
          to know that <code>aws_vpc.main</code> <em>is</em> <code>vpc-0abc…</code>. If you lose it,
          Terraform forgets that it owns anything. The next apply then tries to create everything
          again and clashes with what already exists.
        </p>
        <ul>
          <li>
            <strong>Remote and locked</strong>: the S3 backend gives the whole team one shared copy.
            Locking makes a second apply that starts at the same time wait, instead of corrupting
            the state.
          </li>
          <li>
            <strong>Never edit it by hand.</strong> Use the <code>terraform state</code> commands
            instead. <code>list</code> and <code>show</code> look at the state. <code>mv</code> is for
            when you rename a resource. <code>rm</code> makes Terraform forget something without
            destroying it.
          </li>
          <li>
            <strong>It contains secrets.</strong> The generated database password is saved in it as
            plain text. Encrypt the bucket. Allow only the Terraform role to read it. Never put the
            state, or a <code>.tfvars</code> file that holds secrets, in Git. It is even better to
            keep secrets out of the state. For RDS you can set{" "}
            <code>manage_master_user_password = true</code>. Then AWS creates the password in
            Secrets Manager (an AWS service for storing secrets), and the password does not pass
            through Terraform.
          </li>
          <li>
            <strong>One state for each environment.</strong> Use a separate <code>key</code> (or
            folder) for dev, staging and prod. Then a mistake in dev cannot touch prod, and each plan
            stays fast.
          </li>
        </ul>
        <p>
          You will also use a few more commands. One lists everything in the state. One shows the
          saved settings of one resource. A <em>refresh-only</em> plan (<code>plan -refresh-only</code>)
          reports drift without proposing changes. The <code>-replace</code> option forces one
          resource to be created again.
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
        <h3>Three lifecycle settings to know</h3>
        <p>
          A <code>lifecycle</code> block changes how Terraform treats one resource. Here are the three
          settings you will use most.
        </p>
        <Script
          title="lifecycle"
          code={`lifecycle {
  prevent_destroy       = true          # plan, apply and destroy refuse to delete this. Use it on databases and state buckets
  ignore_changes        = [desired_capacity]   # something else changes this on purpose, so do not fight it
  create_before_destroy = true          # build the replacement first, then remove the old one (no downtime)
}`}
        />

        <h2 id="import">Adopting the things you already built by hand</h2>
        <p>
          You already have a state bucket, an IAM role from Lesson 5 and maybe a domain zone.
          Terraform can <strong>adopt</strong> resources that already exist, instead of creating
          them again. Write the resource block. Then add an <code>import</code> block that says
          which real thing it is:
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
          Terraform can even write the resource block for you from the real settings. Use{" "}
          <code>-generate-config-out</code> for this. Review the generated file and apply it. After
          that, the plan must say &ldquo;no changes&rdquo;. If it shows changes, your code differs
          from reality. Decide which one is right.
        </p>
        <p>
          Move in small slices, not all at once. Import one area, for example the network. Get a
          clean &ldquo;no changes&rdquo; plan. Commit. Then do the next area. Importing everything at
          once is where mistakes happen.
        </p>

        <h2 id="modules">Modules and environments</h2>
        <p>
          Sometimes you need the same setup twice, for example a staging copy and a prod copy. A{" "}
          <strong>module</strong> packages the setup so you can reuse it. A module is a folder of{" "}
          <code>.tf</code> files. Variables go in and outputs come out, so using a module is like
          calling a function. Staging becomes a few lines that call the same module with smaller
          sizes:
        </p>
        <Script
          title="layout"
          code={`infra/
├── modules/
│   └── web-stack/          # network + ALB + ASG + RDS: everything above, with inputs for the differences
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
            Terraform also has <em>workspaces</em>. A workspace is a separate state kept in the same
            folder. They are handy for throwaway copies. For real environments, most teams prefer{" "}
            <strong>separate folders and separate state</strong>. The folder name shows exactly which
            environment you are touching, and you can limit access for each environment. Do not
            create a module until you have two copies that need it. Making something general too
            early is hard to undo.
          </p>
        </Callout>

        <h2 id="ci">Terraform in a pipeline</h2>
        <p>
          In a mature team, nobody runs apply from a laptop. A pull request runs <code>plan</code>{" "}
          and posts the result. Merging the pull request runs <code>apply</code> after approval.
          Every infrastructure change is reviewed like code, with a plan attached.
        </p>
        <ul>
          <li>
            <strong>On a pull request</strong> that changes <code>infra/</code>: run init,{" "}
            <code>fmt -check</code> and validate. Then run plan and post the plan as a comment on the
            pull request.
          </li>
          <li>
            <strong>On merge to main</strong>: run the same plan, then <code>apply</code>. The{" "}
            <code>production</code> environment in GitHub must approve it first.
          </li>
          <li>
            The job signs in to AWS with OIDC (Lesson 14), as a role called{" "}
            <code>github-terraform</code>.
          </li>
        </ul>
        <p>
          The <code>github-terraform</code> role needs wide permissions, because it creates VPCs and
          IAM roles. That is why it is a <strong>separate role</strong> from the narrow{" "}
          <code>github-deploy</code> role of Lesson 14. It is trusted only for the <code>infra</code>{" "}
          path and the production environment. You can also add <code>tflint</code> (a checker for
          Terraform mistakes) and a policy scanner such as <code>checkov</code> or{" "}
          <code>trivy</code> (the tool that replaced <code>tfsec</code>). They catch open Security
          Groups and unencrypted disks before those exist.
        </p>
        <Callout kind="warn" label="Deploy pipeline and infrastructure pipeline: keep them apart">
          <p className="mb-0">
            The app pipeline runs often and has narrow rights. The Terraform pipeline runs rarely, has
            broad rights and needs stricter approval. If you merge them, every app commit gets the
            power to rewrite your network. Also, do <em>not</em> use a Terraform <code>image_tag</code>{" "}
            variable to deploy new versions. The app pipeline updates the SSM parameter (a stored
            setting in AWS Systems Manager), and Terraform stays out of that loop.
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
              <tr><td>S3 state bucket (a few KB of state, versioned)</td><td>A few cents per month</td></tr>
              <tr><td>HCP Terraform (HashiCorp&apos;s hosted service that runs Terraform for you), optional</td><td>Free tier for small setups (up to 500 managed resources); paid beyond that</td></tr>
              <tr><td>What Terraform <em>creates</em></td><td>Exactly what those resources cost. Terraform is free, but your ALB is not</td></tr>
            </tbody>
          </table>
        </div>
        <Callout kind="ok" label="The biggest cost saving">
          <p className="mb-0">
            <code>terraform destroy</code> removes the ALB, the servers and other paid extras when you
            are not studying. Then <code>apply</code> brings the identical setup back. (The database
            has <code>prevent_destroy</code>. In a practice account, remove that line first, or keep
            the compute layer in a separate folder and destroy only that.) This can turn a lab that
            costs about $70 a month into a few dollars of weekend use.
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
                  State links my code to the real resource IDs and settings, so Terraform can work out
                  what is different. I store it remotely, in S3 with versioning, encryption and
                  locking. That gives the team one shared copy and stops two applies from running at
                  once. It also means a lost laptop does not lose the state. The state can contain
                  secrets, so I limit who can read it.
                </p>
              ),
            },
            {
              q: "Declarative vs imperative — what is the difference and why does it matter?",
              a: (
                <p className="mb-0">
                  An imperative script lists steps. It can break if you run it twice or start from a
                  different point. Declarative code describes the end state you want, and the tool
                  works out the steps. This makes runs idempotent. Idempotent means that running the
                  same code again and again gives the same result.
                </p>
              ),
            },
            {
              q: "count vs for_each?",
              a: (
                <p className="mb-0">
                  <code>count</code> numbers resources by position. If I remove an item in the middle,
                  the rest get new numbers and are created again. <code>for_each</code> names each
                  resource with a stable key, such as a string. Adding or removing one entry then
                  affects only that entry. I prefer <code>for_each</code> unless the items are truly
                  identical.
                </p>
              ),
            },
            {
              q: "Someone changed a security group in the console. What happens on the next apply?",
              a: (
                <p className="mb-0">
                  Terraform finds the drift in the plan, and apply changes the resource back to match the
                  code (unless that setting is in <code>ignore_changes</code>). The fix is about people
                  and tools. We make changes through code, we limit who can write in the console, and we
                  run plans on a schedule to look for drift.
                </p>
              ),
            },
            {
              q: "A plan shows -/+ on your database. What do you do?",
              a: (
                <p className="mb-0">
                  I stop and find the setting marked “forces replacement”. Then I undo that change or
                  find another way, such as a different change path or a plan that restores from a
                  snapshot. I protect resources that hold data with <code>prevent_destroy</code> and
                  deletion protection, so a replacement fails with a clear error.
                </p>
              ),
            },
            {
              q: "How do you bring existing manually created infrastructure under Terraform?",
              a: (
                <p className="mb-0">
                  I write matching resource blocks and use <code>import</code> blocks (or the{" "}
                  <code>terraform import</code> command). I can also generate the config with{" "}
                  <code>-generate-config-out</code>. Then I repeat until the plan shows no changes. I
                  move one area at a time.
                </p>
              ),
            },
            {
              q: "How would you manage dev, staging and prod?",
              a: (
                <p className="mb-0">
                  I use shared modules. Each environment has its own top-level configuration and its own
                  state. For short-lived copies, workspaces also work. Each environment has its own
                  tfvars file. Ideally each has its own AWS account. A pipeline plans on each pull
                  request and applies after merge, with an approval step for prod.
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
            <code>init</code> and <code>plan</code>. Read the whole plan from top to bottom before
            you apply.
          </li>
          <li>
            Apply, then run <code>plan</code> again and confirm &ldquo;No changes&rdquo;.
          </li>
          <li>
            Cause drift on purpose. Add an extra inbound rule to a Security Group in the console. Run{" "}
            <code>terraform plan</code> and read how it reports the change. Then run{" "}
            <code>apply</code> to undo it.
          </li>
          <li>
            Change <code>max_size</code> to 8 and check that the plan is an in-place update. Change
            the database <code>identifier</code> and check that it becomes <code>-/+</code>. Do{" "}
            <em>not</em> apply that one!
          </li>
          <li>
            Import your existing uploads bucket with an <code>import</code> block. Get a clean plan.
          </li>
          <li>
            Run <code>terraform destroy</code> on a throwaway copy. Remove the database&apos;s{" "}
            <code>prevent_destroy</code> first. Time it. Then run <code>apply</code> again and time
            the rebuild. Write down how long it would take to rebuild production from nothing.
          </li>
        </ol>
        <Callout kind="ok" label="Optional stretch">
          <p className="mb-0">
            Add the <code>terraform.yml</code> workflow. Create the <code>github-terraform</code> role
            with a trust policy (the rule for who may use the role) limited to your repo. Open a pull
            request that changes a tag. Watch the plan run. Then merge, approve and watch the apply.
          </p>
        </Callout>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          You built this architecture by hand over thirteen lessons. Now it is a few hundred lines of
          text that people can review. Anyone can rebuild it, compare it and roll it back.
        </p>
        <ul>
          <li>
            <strong>Declare the result</strong> and let Terraform work out the order and the
            differences. The references between resources set the dependencies.
          </li>
          <li>
            <strong>init, then plan, then apply</strong>. <em>Read the plan</em> and look for{" "}
            <code>-/+</code> and destroys.
          </li>
          <li>
            <strong>State is precious.</strong> Keep it remote, versioned, encrypted and locked. Never
            edit it by hand. Never put it in Git. Use one state for each environment.
          </li>
          <li>
            <strong>Protect things that hold data</strong> with <code>prevent_destroy</code>. Use{" "}
            <code>ignore_changes</code> where something else changes a value on purpose. Prefer{" "}
            <code>for_each</code> over <code>count</code>.
          </li>
          <li>
            <strong>Infrastructure changes go through pull requests</strong> with the plan output.
            They use a separate role, with tight control, that is different from the app pipeline.
          </li>
        </ul>
        <p>
          Next we make the app faster with a cache. Lesson 16 covers Redis for sessions, rate limits
          and data that is read often.
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
