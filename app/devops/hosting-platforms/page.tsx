import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import FlowChain from "@/components/FlowChain";
import { LESSONS, lessonHref, READINGS, SERIES } from "@/lib/lessons";

const reading = READINGS.find((r) => r.slug === "hosting-platforms")!;
const lessonZero = LESSONS[0];

export const metadata: Metadata = {
  title: reading.title,
  description: reading.summary,
};

const outline = [
  { id: "ladder", label: "The hosting ladder" },
  { id: "platforms", label: "Platform by platform: Vercel, Railway, Dokploy, AWS, Kubernetes" },
  { id: "who-runs-what", label: "Which platform runs what" },
  { id: "stateless-vs-persistent", label: "The real deciding factor: stateless vs persistent" },
  { id: "how-to-choose", label: "How to choose, practically" },
];

/** Top to bottom: less work / less control → more work / more control. */
const ladder = [
  {
    title: "Vercel / Railway / Render",
    desc: "Managed PaaS. Zero setup. You only push code, they run everything.",
  },
  {
    title: "Dokploy / Coolify / CapRover",
    desc: "Self-hosted PaaS. Same easy experience, but installed on your own server.",
  },
  {
    title: "Raw AWS (this course)",
    desc: "Full control over every layer. You build and secure everything yourself.",
  },
  {
    title: "Kubernetes / ECS",
    desc: "Container orchestration for very large scale and big teams.",
  },
];

const yes = "text-emerald-300 font-semibold";
const no = "text-rose-300 font-semibold";

export default function HostingPlatformsPage() {
  return (
    <article>
      <header className="mb-8 border-b border-line pb-6">
        <nav className="mb-4 font-mono text-[0.8rem] text-ink-dim" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-sky">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/${SERIES.slug}`} className="hover:text-sky">{SERIES.title}</Link>
          <span className="mx-2">/</span>
          <span>Background reading</span>
        </nav>
        <p className="mb-2 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">
          Background reading · {reading.readTime} read
        </p>
        <h1 className="mb-2 text-[2.4rem] font-bold leading-tight tracking-tight text-sky max-sm:text-[2rem]">
          {reading.title}
        </h1>
        <p className="max-w-[60ch] text-[1.15rem] text-ink-dim">
          Vercel, Railway, Render, Dokploy, Coolify, AWS, Kubernetes — where each one fits, what it
          can and cannot do, and why the choice depends on one simple idea: stateless or persistent.
        </p>
      </header>

      <section className="mb-10 rounded-xl border border-line bg-bg-elev px-6 py-5" aria-labelledby="learn">
        <h2 id="learn" className="mb-2 text-[1.1rem] font-semibold text-sky">
          What this reading covers
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
        <h2 id="ladder">The hosting ladder</h2>
        <p>
          All hosting options sit on one single ladder. As you go down this ladder, your{" "}
          <strong>control increases</strong>, but your <strong>setup responsibility also
          increases</strong>. And generally, the cost at large scale goes down.
        </p>
        <FlowChain nodes={ladder} />
        <div className="-mt-3 mb-6 flex justify-between font-mono text-[0.75rem] text-ink-dim">
          <span>← Less work, less control</span>
          <span>More work, more control →</span>
        </div>

        <h2 id="platforms">Platform by platform</h2>

        <h3>1. Vercel</h3>
        <p>
          Built mainly for frontend and Next.js. You push to GitHub, it builds and deploys
          automatically, gives free HTTPS and a global CDN. Really excellent developer experience.
        </p>
        <p>
          One important point people get wrong: <strong>Vercel can run backend code.</strong>{" "}
          Next.js API routes run as serverless functions. So &ldquo;Vercel is frontend only&rdquo;
          is not fully correct.
        </p>
        <p>What Vercel genuinely cannot do:</p>
        <ul>
          <li>
            Long-running work — functions have a time limit (10 seconds on free plan, up to 60
            seconds on paid). Heavy PDF generation or long calculation will fail in between.
          </li>
          <li>WebSockets and always-open connections.</li>
          <li>Background jobs and scheduled workers that keep running.</li>
          <li>PHP, Python (Django), Laravel — no support for these runtimes.</li>
        </ul>

        <h3>2. Railway and Render</h3>
        <p>
          Also managed PaaS, but designed for full-stack applications, not only frontend. They run
          a <strong>real always-on server process</strong> for you, and give managed PostgreSQL and
          Redis as add-ons.
        </p>
        <p>
          Pricing is based on usage (compute hours plus resources). For a long-running Node.js
          backend this usually comes cheaper than Vercel. Setup remains very easy — but you still
          do not own or control the underlying machine.
        </p>
        <Callout kind="ok" label="Good fit when">
          <p className="mb-0">
            You want to launch fast, you need a real backend with background jobs, and you do not
            want to learn servers right now.
          </p>
        </Callout>

        <h3>3. Dokploy, Coolify, CapRover</h3>
        <p>
          These are different in nature, not just different in level. These are{" "}
          <strong>self-hosted PaaS software</strong> — open source tools that give you a Vercel-like
          experience (git push, auto build, auto deploy, automatic SSL), but <em>you</em> install
          them on your own server. That server can be an AWS EC2 instance, a Hostinger VPS, a
          DigitalOcean droplet — anything running Linux.
        </p>
        <p>
          So Dokploy is not a hosting company. It is a dashboard that you run on infrastructure you
          already own.
        </p>
        <Callout kind="note" label="Key insight">
          <p className="mb-0">
            Dokploy needs exactly the things this course teaches — a Linux server, networking, DNS,
            HTTPS and Docker. If you learn raw AWS first, then Dokploy becomes very easy later,
            because it is just software installed on an EC2 box you already know how to secure and
            debug.
          </p>
        </Callout>

        <h3>4. Raw AWS</h3>
        <p>
          Maximum flexibility. Your frontend can go on S3 plus CloudFront (fast and cheap), while
          your backend runs on EC2. Or in the beginning, run both together on one single EC2
          instance — simpler, and that is exactly what we build first in this course.
        </p>
        <p>
          Cost is mostly fixed per resource, not per request. Around{" "}
          <strong>$15 to $25 per month</strong> for a small EC2 plus small RDS, whether you have 10
          users or 500.
        </p>

        <h3>5. Kubernetes and ECS</h3>
        <p>
          The advanced end. Container orchestration for teams running many services at real scale.
          Definitely worth knowing that it exists — but not worth learning at this stage. For a new
          SaaS this is over-engineering.
        </p>

        <h2 id="who-runs-what">Which platform runs what</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[560px]">
            <thead>
              <tr>
                <th>Platform</th>
                <th>Frontend</th>
                <th>Backend</th>
                <th>PHP</th>
                <th>Main catch</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Vercel</strong></td>
                <td className={yes}>Excellent</td>
                <td>Serverless only</td>
                <td className={no}>No</td>
                <td>No long-running or always-on processes</td>
              </tr>
              <tr>
                <td><strong>Railway / Render</strong></td>
                <td className={yes}>Yes</td>
                <td className={yes}>Yes, real server</td>
                <td className={yes}>Yes</td>
                <td>Managed, so less raw control than AWS</td>
              </tr>
              <tr>
                <td><strong>AWS</strong></td>
                <td className={yes}>Yes</td>
                <td className={yes}>Yes</td>
                <td className={yes}>Yes</td>
                <td>You configure every single thing yourself</td>
              </tr>
              <tr>
                <td><strong>Dokploy</strong></td>
                <td className={yes}>Yes</td>
                <td className={yes}>Yes</td>
                <td className={yes}>Yes</td>
                <td>You manage the server underneath it</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          So if your project is in PHP, Vercel is completely out. Railway, AWS, Dokploy or classic
          shared PHP hosting are your options.
        </p>

        <h2 id="stateless-vs-persistent">The real deciding factor: stateless vs persistent</h2>
        <p>
          People usually think the question is &ldquo;frontend or backend&rdquo;. That is not the
          real question. The real question is <strong>stateless or persistent</strong>.
        </p>
        <div className="my-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-bg-elev px-5 py-4">
            <h3 className="mt-0">Stateless</h3>
            <p className="mb-0 text-[0.95rem] text-ink-dim">
              The server has no memory of anything from before this exact request. Every request is
              handled fresh, in isolation, and whatever happened during it disappears the moment it
              is answered.
            </p>
          </div>
          <div className="rounded-xl border border-line bg-bg-elev px-5 py-4">
            <h3 className="mt-0">Persistent</h3>
            <p className="mb-0 text-[0.95rem] text-ink-dim">
              The server is one continuously running process. It can hold things in memory — a
              variable, a cache, an open connection — and that memory stays across many requests.
            </p>
          </div>
        </div>

        <Callout kind="note" label="Simple analogy">
          <p className="mb-0">
            Stateless is like a food truck that packs up and drives away after every single
            customer, and a fresh truck comes for the next customer — it has no idea what the
            previous person ordered. Persistent is like a restaurant that stays open the whole day —
            same kitchen, same staff, remembers what is cooking, keeps a running account.
          </p>
        </Callout>

        <h3>Same code, two different results</h3>
        <div className="my-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-bg-elev px-5 py-4">
            <h3 className="mt-0">On Vercel (stateless)</h3>
            <p className="text-[0.95rem] text-ink-dim">
              Each request may run on a different isolated instance, so this counter can reset to 0
              at any time.
            </p>
            <pre className="my-0">
              <code>{`// pages/api/counter.js
let counter = 0;   // unreliable

export default function handler(req, res) {
  counter++;
  res.json({ counter });
}`}</code>
            </pre>
          </div>
          <div className="rounded-xl border border-line bg-bg-elev px-5 py-4">
            <h3 className="mt-0">On EC2 or Railway (persistent)</h3>
            <p className="text-[0.95rem] text-ink-dim">
              Same process answers every request, so the counter genuinely increases every time.
            </p>
            <pre className="my-0">
              <code>{`// server.js — runs 24/7
let counter = 0;   // reliable

app.get('/counter', (req, res) => {
  counter++;
  res.json({ counter });
});`}</code>
            </pre>
          </div>
        </div>

        <Callout kind="warn" label="The rule to remember">
          <p className="mb-0">
            On a stateless platform you must never keep real state in a variable. Always put it in
            a database or in Redis. On a persistent server you get the choice — and that choice is
            exactly why we learn EC2.
          </p>
        </Callout>

        <h2 id="how-to-choose">How to choose, practically</h2>
        <ul>
          <li>
            <strong>Only frontend, or small API routes with quick database queries?</strong> Vercel
            is perfectly fine. Do not over-engineer.
          </li>
          <li>
            <strong>Need background jobs, PDF generation, WebSockets, or a PHP runtime?</strong> You
            need a persistent server — Railway, Dokploy or AWS.
          </li>
          <li>
            <strong>Want to launch fast without learning servers today?</strong> Railway. Migrate
            later when you have paying customers.
          </li>
          <li>
            <strong>Want full control and lowest cost at scale?</strong> Raw AWS — and that is what
            this course builds, step by step.
          </li>
        </ul>
        <p>
          Many solo SaaS builders actually launch on Railway or self-hosted Dokploy first, because
          shipping fast matters more in the beginning, and then move to raw AWS once real users and
          real scale arrive. This course gives you the raw AWS foundation either way — because it is
          the skill that turns every option above it, including Dokploy, into something you can set
          up, secure and debug yourself instead of guessing.
        </p>

        <hr />
        <p className="text-ink-dim">
          Background reading for the AWS DevOps course. Read{" "}
          <Link href={lessonHref(lessonZero)}>Lesson 0 — {lessonZero.title}</Link> first if you
          have not already.
        </p>
      </div>

      <nav className="mt-14 grid grid-cols-1 gap-4 border-t border-line pt-8 sm:grid-cols-2" aria-label="Navigation">
        <Link
          href={`/${SERIES.slug}`}
          className="block rounded-xl border border-line px-5 py-4 text-ink hover:border-sky hover:bg-sky-soft hover:no-underline"
        >
          <div className="font-mono text-[0.75rem] uppercase tracking-[0.1em] text-sky">← Series index</div>
          <div className="font-semibold">{SERIES.title}</div>
        </Link>
        <Link
          href={lessonHref(lessonZero)}
          className="block rounded-xl border border-line px-5 py-4 text-ink hover:border-sky hover:bg-sky-soft hover:no-underline sm:text-right"
        >
          <div className="font-mono text-[0.75rem] uppercase tracking-[0.1em] text-sky">Start here →</div>
          <div className="font-semibold">Lesson 0: {lessonZero.title}</div>
        </Link>
      </nav>
    </article>
  );
}
