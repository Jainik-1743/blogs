import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import FlowChain from "@/components/FlowChain";
import AccountSetupFlow from "@/components/figures/AccountSetupFlow";
import ArchitectureMap from "@/components/figures/ArchitectureMap";
import CallerIdentityAnatomy from "@/components/figures/CallerIdentityAnatomy";
import CostCurveChart from "@/components/figures/CostCurveChart";
import MultiTenantSaas from "@/components/figures/MultiTenantSaas";
import PaasIaasStack from "@/components/figures/PaasIaasStack";
import RegionLatency from "@/components/figures/RegionLatency";
import ResponsibilityMatrix from "@/components/figures/ResponsibilityMatrix";
import VercelWalls from "@/components/figures/VercelWalls";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { getLesson, READINGS, readingHref, SERIES } from "@/lib/lessons";

const lesson = getLesson("lesson-0")!;
const hostingReading = READINGS.find((r) => r.slug === "hosting-platforms")!;

export const metadata: Metadata = {
  title: `Lesson 0 — ${lesson.title}`,
  description: lesson.summary,
};

/** In-page index. Each entry links to a section heading below. */
const outline = [
  { id: "concept", label: "Concept: PaaS vs IaaS" },
  { id: "why-this-matters", label: "Why this matters — where Vercel hits a wall" },
  { id: "architecture", label: "Architecture — where you are going" },
  { id: "real-example", label: "Real example: a multi-tenant SaaS" },
  { id: "commands", label: "Commands — your only setup for today" },
  { id: "practice", label: "Practice task before Lesson 1" },
  { id: "conclusion", label: "Conclusion" },
];

/** The full target setup. Every future lesson fills in one box of this flow. */
const architecture = [
  { title: "Browser / User", desc: "Someone opens yourapp.com" },
  { title: "Route 53 (DNS)", desc: "Turns your domain name into a server IP address" },
  {
    title: "CloudFront (CDN)",
    desc: "Keeps copies of your static files on servers around the world, so pages load fast",
  },
  {
    title: "ALB + EC2 (Auto Scaling)",
    desc: "The load balancer shares traffic between your app servers, which run Next.js / Node.js. When more users come, more servers start automatically",
  },
  {
    title: "RDS (PostgreSQL)",
    desc: "Your managed database. AWS does the backups, the software updates (patching) and the switch to a spare copy if the main one fails (failover)",
  },
];

const services: [string, string][] = [
  ["EC2", "EC2 (Elastic Compute Cloud) is a virtual computer that you rent from AWS. You install whatever you want on it."],
  ["VPC", "VPC (Virtual Private Cloud) is your own private network inside AWS. It keeps your servers closed to the rest of the world."],
  ["IAM", "IAM (Identity and Access Management) is the service that decides who is allowed to do what. It manages users, roles and permissions."],
  ["ALB", "Application Load Balancer. It is a service that shares incoming web traffic between many servers."],
  ["Auto Scaling", "A service that adds servers when traffic is high and removes them when traffic is low."],
  ["S3", "S3 (Simple Storage Service) stores files such as images, PDFs, backups and uploads."],
  ["RDS", "RDS (Relational Database Service) is a managed PostgreSQL / MySQL database. AWS runs the database for you."],
  ["CloudFront", "A CDN (Content Delivery Network) is a group of servers around the world that keep copies of your files close to your users."],
  ["Route 53", "The AWS DNS service. DNS (Domain Name System) is the internet's phone book. It connects your domain name to your AWS setup."],
];

export default function LessonZeroPage() {
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
          Lesson 0 · {lesson.readTime} read
        </p>
        <h1 className="mb-2 text-[2.4rem] font-bold leading-tight tracking-tight text-sky max-sm:text-[2rem]">
          {lesson.title}
        </h1>
        <p className="max-w-[60ch] text-[1.15rem] text-ink-dim">{lesson.summary}</p>
      </header>

      {/* What you'll learn — the lesson's own index */}
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
          <strong>Vercel is a PaaS</strong> — Platform as a Service. A PaaS is a service that runs
          your code for you. You do a <code>git push</code>, and Vercel decides the rest: where
          your code runs, how it grows with more users, and how HTTPS works. You never see a
          server. Everything is hidden from you.
        </p>
        <p>
          <strong>AWS is IaaS</strong> — Infrastructure as a Service. An IaaS gives you only raw
          building blocks: a virtual computer, a network, a database. <em>You</em> connect them
          together. Nothing is hidden. At first this feels hard. But many backend engineers know
          AWS for this reason, and the ideas you learn (servers, networks, databases) also help
          on other cloud providers.
        </p>
        <PaasIaasStack />
        <p>
          Here is the same idea, job by job. Every cell marked <strong>You</strong> on the AWS side
          is something this course teaches you to do.
        </p>
        <ResponsibilityMatrix />

        <h2 id="why-this-matters">Why this matters</h2>
        <p>Vercel is very good. But you will hit its limits when:</p>
        <ul>
          <li>
            <strong>Cost goes up at scale</strong> — Vercel charges by usage, such as requests and
            bandwidth (data sent out). With small traffic it is cheap. When many real users come,
            the bill grows fast.
          </li>
          <li>
            <strong>You need long-running work</strong> — background jobs, PDF generation, queue
            workers (programs that take jobs from a waiting list). Serverless functions (small
            pieces of code that run only when called) have a time limit, and they stop when it ends.
          </li>
          <li>
            <strong>You need a real database beside your app</strong> — not a separate paid
            service with its own limits and bill.
          </li>
          <li>
            <strong>You need full control</strong> — your own caching, Redis (a fast in-memory data
            store), and private networking. For a multi-tenant SaaS this control matters a lot.
          </li>
        </ul>
        <VercelWalls />

        <Callout kind="note" label="One-line mental model">
          <p className="mb-1">
            <strong>Vercel</strong> = you pay for usage, almost no setup, cheap at the start,
            expensive when you grow.
          </p>
          <p className="mb-0">
            <strong>AWS</strong> = you pay for the resources you run (mostly a fixed cost), you do
            all the setup, and it is cheap at scale <em>only if you manage it well</em>.
          </p>
        </Callout>
        <CostCurveChart />

        <Callout kind="warn" label="Common misunderstanding to correct">
          <p className="mb-0">
            AWS is not cheap by itself. If you leave a server running idle, or pick a server that
            is bigger than you need, AWS can cost <em>more</em> than Vercel. On AWS nobody
            tunes the cost for you. Managing it well is a skill, and this course teaches it.
          </p>
        </Callout>

        <h2 id="architecture">Architecture — where you are going</h2>
        <p>
          This is the full target setup. Every later lesson fills in one box of this flow. Today
          you only need to recognise the names.
        </p>
        <FlowChain nodes={architecture} />
        <p>
          The flow above is the path one request takes. The map below shows the same pieces as they
          sit in AWS. Some are global. Some live inside your region (a region is a group of AWS
          data centres in one area). Some are hidden inside your private network, where the
          internet cannot reach them.
        </p>
        <ArchitectureMap />

        <h3>What each name means, in one line</h3>
        <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Simple meaning</th>
            </tr>
          </thead>
          <tbody>
            {services.map(([name, meaning]) => (
              <tr key={name}>
                <td className="whitespace-nowrap"><strong>{name}</strong></td>
                <td>{meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        <h2 id="real-example">Real example</h2>
        <p>
          Take a multi-tenant SaaS. SaaS means Software as a Service: an app that people use
          online. Multi-tenant means many companies (tenants) use one application, but each
          company&apos;s data is kept separate. Such a project needs:
        </p>
        <ul>
          <li>
            A real PostgreSQL database that you control, not a shared serverless database with
            limits on connections.
          </li>
          <li>
            Room to run background jobs, such as making PDF quotations or sending emails, with no
            time limit.
          </li>
          <li>
            A way to grow from one app server to many servers, for example when a client&apos;s
            whole team logs in at month end.
          </li>
        </ul>
        <MultiTenantSaas />
        <Callout kind="ok" label="Approximate cost">
          <p className="mb-0">
            One small EC2 instance plus one small RDS instance costs roughly{" "}
            <strong>$15 to $25 per month</strong> (around ₹1,300 to ₹2,100). Prices change by
            region and over time, so check the AWS pricing page. The cost stays almost the same
            with 10 users or 500 users. That is the main difference from pay-per-request pricing.
          </p>
        </Callout>

        <h2 id="commands">Commands — your only setup for today</h2>
        <p>
          You create no AWS resources today, so you pay nothing. You only set up your identity in
          a safe way.
        </p>
        <AccountSetupFlow />

        <ol className="steps">
          <li>
            <h3>Create your AWS account</h3>
            <p>
              Go to aws.amazon.com and sign up. This creates a <strong>root user</strong>, the
              owner login of the account. It can do everything. Use it only when you must, and
              never for daily work. Think of it like your bank locker key: very powerful, so keep
              it locked away.
            </p>
          </li>
          <li>
            <h3>Turn on MFA for the root user</h3>
            <p>
              MFA (multi-factor authentication) means you need a second proof besides your
              password, such as a code from your phone. Go to Security Credentials, then
              Multi-factor authentication, and add an authenticator app. Do this on the same day.
              This one step stops many of the most common and costly account break-ins.
            </p>
          </li>
          <li>
            <h3>Create an IAM admin user for yourself</h3>
            <p>
              An IAM user is a login for one person inside your account. Open IAM, then Users, then
              Create user. Attach the <code>AdministratorAccess</code> policy (a policy is a list
              of allowed actions). This is the user you work with every day, not the root user.
            </p>
          </li>
          <li>
            <h3>Install the AWS CLI on your machine</h3>
            <p>
              CLI means Command Line Interface. It is a tool that lets you control AWS by typing
              commands, instead of clicking in the website.
            </p>
            <pre>
              <code>{`# On Mac
brew install awscli

# On Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install`}</code>
            </pre>
          </li>
          <li>
            <h3>Connect the CLI to your IAM user</h3>
            <p>
              An Access Key is a pair of values (an ID and a secret) that works like a username and
              password for the CLI. Create one for your IAM user in the AWS console. Then run this
              and paste the values.
            </p>
            <pre>
              <code>{`aws configure

# AWS Access Key ID:     <paste here>
# AWS Secret Access Key: <paste here>
# Default region name:   ap-south-1   (Mumbai)
# Default output format: json`}</code>
            </pre>
            <p>
              Choose the Mumbai region so your servers are physically near your users in India.
              Shorter distance means less delay, so pages load faster.
            </p>
            <RegionLatency />
          </li>
          <li>
            <h3>Verify that everything is working</h3>
            <pre>
              <code>{`aws sts get-caller-identity`}</code>
            </pre>
            <p>
              This command asks AWS &ldquo;who am I?&rdquo;. If it prints your IAM user&apos;s ARN
              (the unique name of a thing in AWS) and it does <em>not</em> say &ldquo;root&rdquo;,
              your setup is correct and safe. Lesson 0 is complete.
            </p>
            <CallerIdentityAnatomy />
          </li>
        </ol>

        <Callout kind="warn" label="Important safety habit">
          <p className="mb-0">
            Never put your Access Key inside your project code or push it to GitHub. Bots find
            leaked keys within minutes and misuse them, and the bill comes to you. Keep keys only
            in <code>aws configure</code> or in environment variables.
          </p>
        </Callout>

        <hr />

        <h2 id="practice">Practice task before Lesson 1</h2>
        <p>
          Nothing here creates a paid resource. The goal is to check that your CLI talks to AWS as
          the right user, in the right region, and that you can read what it says back.
        </p>
        <Script
          title="practice.sh"
          code={`aws sts get-caller-identity          # 1. who am I? the Arn must contain "user/", never "root"
aws configure get region             # 2. must print ap-south-1
aws ec2 describe-regions --output table   # 3. list the AWS regions — find ap-south-1 (Mumbai) in it
aws iam list-users                   # 4. you should see exactly one user: the IAM admin you created
aws s3 ls                            # 5. lists your buckets — an empty result is correct, nothing exists yet`}
        />
        <p>Then answer these in your own words. You do not need to write them down, but be sure you can:</p>
        <ol>
          <li>Why did we create an IAM user instead of using the root account every day?</li>
          <li>
            Vercel charges per request. An EC2 server costs the same whether it serves 10 or 500
            users. When is each model cheaper?
          </li>
          <li>
            In the architecture flow above, which box handles &ldquo;yourapp.com&rdquo; → IP address,
            and which box adds more servers when traffic grows?
          </li>
          <li>
            Where on your machine does <code>aws configure</code> store your keys? (Hint:{" "}
            <code>cat ~/.aws/credentials</code>.) Why must that file never be committed to git?
          </li>
        </ol>
        <Callout kind="ok" label="Optional stretch">
          <p className="mb-0">
            Log into the AWS console and open <strong>Billing → Budgets</strong>. Create a budget
            of <strong>$5 per month</strong> with an email alert. It costs nothing and it is the
            best protection against a forgotten server that quietly runs for weeks.
          </p>
        </Callout>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          Vercel is a PaaS: you push code and the platform hides the servers from you. AWS is IaaS:
          you get raw building blocks (compute, network, database) and connect them yourself.
          That extra work is the price of control. You need that control when you have
          long-running jobs, a real database next to your app, or a bill that grows with every
          request.
        </p>
        <ul>
          <li>
            <strong>Cost model</strong>: Vercel is cheap with little traffic and expensive at
            scale. AWS is mostly a fixed cost. It is cheap at scale <em>only</em> if you manage
            it well, because nobody tunes it for you.
          </li>
          <li>
            <strong>The target architecture</strong>: Route 53 → CloudFront → ALB + EC2 (Auto
            Scaling) → RDS. Every future lesson fills in one of those boxes.
          </li>
          <li>
            <strong>Security first</strong>: the root user is locked away with MFA, an IAM admin
            user does the daily work, and access keys live only in <code>aws configure</code>,
            never in your repository.
          </li>
          <li>
            <strong>Region</strong>: <code>ap-south-1</code> (Mumbai), so your servers are close
            to your users.
          </li>
        </ul>
        <p>
          You have spent nothing, and you have a safe, checked AWS identity. From here on, every
          lesson builds something real on top of it.
        </p>

        <hr />
        <p>
          End of Lesson 0. Next: <strong>Lesson 1 — Linux Fundamentals</strong>.
        </p>
        <p>
          Also read:{" "}
          <Link href={readingHref(hostingReading)}>{hostingReading.title} →</Link> — where Vercel,
          Railway, Dokploy and AWS each fit, and why the deciding factor is stateless (keeps nothing between requests) vs persistent (keeps data over time).
        </p>
      </div>

      <LessonPager slug={lesson.slug} />
    </article>
  );
}
