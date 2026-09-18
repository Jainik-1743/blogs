import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import FlowChain from "@/components/FlowChain";
import CostCurveChart from "@/components/figures/CostCurveChart";
import PaasIaasStack from "@/components/figures/PaasIaasStack";
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
  { title: "Route 53 (DNS)", desc: "Converts your domain name into a server IP address" },
  {
    title: "CloudFront (CDN)",
    desc: "Caches your static files in servers all around the world, so pages load fast",
  },
  {
    title: "ALB + EC2 (Auto Scaling)",
    desc: "Load balancer sends traffic to your app servers running Next.js / Node.js. More users, more servers start automatically",
  },
  {
    title: "RDS (PostgreSQL)",
    desc: "Your managed database. AWS handles backup, patching and failover for you",
  },
];

const services: [string, string][] = [
  ["EC2", "A virtual computer you rent from AWS. You install whatever you want on it."],
  ["VPC", "Your own private network inside AWS, so your servers are not open to the whole world."],
  ["IAM", "Who is allowed to do what. Users, roles and permissions."],
  ["ALB", "Application Load Balancer. It divides incoming traffic between many servers."],
  ["Auto Scaling", "Automatically adds servers when traffic is high, removes them when traffic is low."],
  ["S3", "File storage. Images, PDFs, backups, uploads."],
  ["RDS", "Managed PostgreSQL / MySQL. AWS runs the database for you."],
  ["CloudFront", "CDN. Keeps copies of your files near your users worldwide."],
  ["Route 53", "DNS. Connects your domain name to your AWS setup."],
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
          <strong>Vercel is a PaaS</strong> — Platform as a Service. You do a <code>git push</code>,
          and after that Vercel decides everything: where your code will run, how it will scale,
          how HTTPS will work. You never see a server. Everything is hidden behind the scene.
        </p>
        <p>
          <strong>AWS is IaaS</strong> — Infrastructure as a Service. AWS gives you only raw
          building blocks: a virtual computer, a network, a database. <em>You</em> have to connect
          all of them together. Nothing is hidden from you. In the beginning this feels difficult,
          but this is exactly why every serious backend engineer knows AWS — this knowledge works
          everywhere, it is not tied to one company&apos;s platform.
        </p>
        <PaasIaasStack />

        <h2 id="why-this-matters">Why this matters</h2>
        <p>Vercel is very good, no doubt. But you will face a wall when:</p>
        <ul>
          <li>
            <strong>Cost goes up at scale</strong> — Vercel charges per request and per bandwidth.
            At small traffic it is cheap, but when real users come, the bill grows fast.
          </li>
          <li>
            <strong>You need long-running work</strong> — background jobs, PDF generation, queue
            workers. Serverless functions have a time limit and they stop in between.
          </li>
          <li>
            <strong>You need a real database beside your app</strong> — not a separate paid
            service billed per connection.
          </li>
          <li>
            <strong>You need full control</strong> — custom caching, Redis, private networking.
            For a multi-tenant SaaS this control is very important.
          </li>
        </ul>

        <Callout kind="note" label="One-line mental model">
          <p className="mb-1">
            <strong>Vercel</strong> = pay per traffic, zero setup, cheap in the beginning,
            expensive at scale.
          </p>
          <p className="mb-0">
            <strong>AWS</strong> = pay per resource (mostly fixed cost), full setup
            responsibility, cheap at scale <em>only if you manage it properly</em>.
          </p>
        </Callout>
        <CostCurveChart />

        <Callout kind="warn" label="Common misunderstanding to correct">
          <p className="mb-0">
            AWS is not automatically cheap. If you leave a server running idle, or you take a
            bigger server than needed, AWS will cost you <em>more</em> than Vercel — because there
            nobody is optimising it for you. Managing it properly is a skill, and that skill is
            exactly what this course teaches.
          </p>
        </Callout>

        <h2 id="architecture">Architecture — where you are going</h2>
        <p>
          This is the full target setup. Every future lesson will fill in one box of this flow.
          Today you only need to recognise the names, nothing more.
        </p>
        <FlowChain nodes={architecture} />

        <h3>What each name means, in one line</h3>
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

        <h2 id="real-example">Real example</h2>
        <p>
          Take a multi-tenant SaaS — many companies using one application, but each company&apos;s
          data kept separate. What such a project actually needs:
        </p>
        <ul>
          <li>
            A real PostgreSQL database that you control, not a shared serverless DB with
            connection limits.
          </li>
          <li>
            Space to run background jobs — generating PDF quotations, sending emails — without any
            timeout.
          </li>
          <li>
            Ability to turn one app server into many servers, when a client&apos;s full team logs
            in at month end.
          </li>
        </ul>
        <Callout kind="ok" label="Approximate cost">
          <p className="mb-0">
            One small EC2 instance plus one small RDS instance comes to roughly{" "}
            <strong>$15 to $25 per month</strong> (around ₹1,300 to ₹2,100), and this stays almost
            the same whether you have 10 users or 500 users. That is the main difference from
            per-request pricing.
          </p>
        </Callout>

        <h2 id="commands">Commands — your only setup for today</h2>
        <p>
          No AWS resources are created today, so nothing to pay. We only set up your identity in
          the safe way.
        </p>

        <ol className="steps">
          <li>
            <h3>Create your AWS account</h3>
            <p>
              Go to aws.amazon.com and sign up. This creates a <strong>root user</strong>. Do this
              once, then never use the root user for daily work. Think of it like your bank locker
              key — very powerful, so keep it locked away.
            </p>
          </li>
          <li>
            <h3>Turn on MFA for the root user</h3>
            <p>
              Go to Security Credentials, then Multi-factor authentication. Add your phone
              authenticator app. Do this immediately, on the same day. This single step prevents
              the most common and most costly AWS account hack.
            </p>
          </li>
          <li>
            <h3>Create an IAM admin user for yourself</h3>
            <p>
              Open IAM, then Users, then Add user. Attach the <code>AdministratorAccess</code>{" "}
              policy. This is the user you will actually work with every day, not the root user.
            </p>
          </li>
          <li>
            <h3>Install the AWS CLI on your machine</h3>
            <p>
              CLI means Command Line Interface — a way to control AWS by typing commands, instead
              of clicking in the website.
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
              First generate an Access Key for your IAM user in the AWS console, then run this and
              paste the values.
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
              This directly reduces page load time.
            </p>
          </li>
          <li>
            <h3>Verify that everything is working</h3>
            <pre>
              <code>{`aws sts get-caller-identity`}</code>
            </pre>
            <p>
              If this prints your IAM user&apos;s ARN and it does <em>not</em> say
              &ldquo;root&rdquo;, your setup is correct and safe. Lesson 0 is complete.
            </p>
          </li>
        </ol>

        <Callout kind="warn" label="Important safety habit">
          <p className="mb-0">
            Never put your Access Key inside your project code or push it to GitHub. Keys leaked on
            GitHub get misused within minutes, and the bill comes to you. Keep them only in{" "}
            <code>aws configure</code> or in environment variables.
          </p>
        </Callout>

        <hr />

        <h2 id="practice">Practice task before Lesson 1</h2>
        <p>
          Nothing here creates a paid resource. The goal is to prove that your CLI talks to AWS as
          the right user, in the right region, and that you can read what it says back.
        </p>
        <Script
          title="practice.sh"
          code={`aws sts get-caller-identity          # 1. who am I? the Arn must contain "user/", never "root"
aws configure get region             # 2. must print ap-south-1
aws ec2 describe-regions --output table   # 3. list every AWS region — find ap-south-1 (Mumbai) in it
aws iam list-users                   # 4. you should see exactly one user: the IAM admin you created
aws s3 ls                            # 5. lists your buckets — an empty result is correct, nothing exists yet`}
        />
        <p>Then answer these in your own words — no need to write them down, just be sure you can:</p>
        <ol>
          <li>Why did we create an IAM user instead of using the root account every day?</li>
          <li>
            Vercel charges per request; an EC2 server costs the same whether it serves 10 or 500
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
            single best protection against a forgotten server quietly running for weeks.
          </p>
        </Callout>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          Vercel is a PaaS: you push code and the platform hides the servers from you. AWS is IaaS:
          you get raw building blocks — compute, network, database — and wire them together
          yourself. That extra work is the price of control, and control is what you need once
          you have long-running jobs, a real database next to your app, or a bill that grows with
          every request.
        </p>
        <ul>
          <li>
            <strong>Cost model</strong>: Vercel is cheap at zero traffic and expensive at scale.
            AWS is a mostly fixed cost — cheap at scale <em>only</em> if you manage it, because
            nobody optimises it for you.
          </li>
          <li>
            <strong>The target architecture</strong>: Route 53 → CloudFront → ALB + EC2 (Auto
            Scaling) → RDS. Every future lesson fills in one of those boxes.
          </li>
          <li>
            <strong>Security first</strong>: root user locked away with MFA, an IAM admin user for
            daily work, and access keys that live only in <code>aws configure</code> — never in
            your repository.
          </li>
          <li>
            <strong>Region</strong>: <code>ap-south-1</code> (Mumbai), so your servers sit close
            to your users.
          </li>
        </ul>
        <p>
          You have spent nothing, and you have a safe, verified AWS identity. From here on, every
          lesson builds something real on top of it.
        </p>

        <hr />
        <p>
          End of Lesson 0. Next: <strong>Lesson 1 — Linux Fundamentals</strong>.
        </p>
        <p>
          Also read:{" "}
          <Link href={readingHref(hostingReading)}>{hostingReading.title} →</Link> — where Vercel,
          Railway, Dokploy and AWS each fit, and why the deciding factor is stateless vs persistent.
        </p>
      </div>

      <LessonPager slug={lesson.slug} />
    </article>
  );
}
