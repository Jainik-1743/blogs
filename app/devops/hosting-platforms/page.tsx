import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import FlowChain from "@/components/FlowChain";
import StatelessDiagram from "@/components/figures/StatelessDiagram";
import TimeLimitBars from "@/components/figures/TimeLimitBars";
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
    desc: "Managed PaaS (a service that runs your app for you). Almost no setup. You push code and they run everything.",
  },
  {
    title: "Dokploy / Coolify / CapRover",
    desc: "Self-hosted PaaS. The same easy experience, but you install it on your own server.",
  },
  {
    title: "Raw AWS (this course)",
    desc: "Full control over every layer. You build and secure everything yourself.",
  },
  {
    title: "Kubernetes / ECS",
    desc: "Container orchestration (software that runs and manages many containers) for very large systems and big teams.",
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
          Vercel, Railway, Render, Dokploy, Coolify, AWS and Kubernetes. See where each one fits and
          what it can and cannot do. The choice depends on one simple idea: stateless or
          persistent.
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
          All hosting options sit on one ladder. As you go down the ladder, your{" "}
          <strong>control grows</strong>, and so does your <strong>responsibility for setup</strong>.
          At large scale, the cost usually goes down as well.
        </p>
        <FlowChain nodes={ladder} />
        <div className="-mt-3 mb-6 flex justify-between font-mono text-[0.75rem] text-ink-dim">
          <span>← Less work, less control</span>
          <span>More work, more control →</span>
        </div>

        <h2 id="platforms">Platform by platform</h2>

        <h3>1. Vercel</h3>
        <p>
          Vercel is built mainly for frontend code and for Next.js (a framework for building React
          websites that can also run backend code). You push to GitHub, and it builds and
          deploys your app automatically. It gives you free HTTPS and a global CDN (a network of
          servers around the world that keep copies of your files close to users). The developer
          experience is excellent.
        </p>
        <p>
          Many people get one point wrong: <strong>Vercel can run backend code.</strong> Next.js API
          routes run as serverless functions. A serverless function is a small piece of backend code
          that the platform starts when a request arrives and stops afterwards. So &ldquo;Vercel is
          frontend only&rdquo; is not correct.
        </p>
        <p>Where Vercel is a poor fit:</p>
        <ul>
          <li>
            Long-running work. Every function has a time limit. The default is short, and the
            maximum depends on your plan and settings. The maximum is minutes, not hours. A heavy PDF
            job or a long calculation can be stopped half way. Check the current limits in
            Vercel&apos;s documentation.
          </li>
          <li>
            WebSockets and other always-open connections. A WebSocket is a connection that stays
            open so the server and the browser can send messages to each other at any time. Vercel
            now has some WebSocket support, but a normal always-on server is simpler for this.
          </li>
          <li>
            Background workers that keep running all the time. Vercel can run short background
            tasks and scheduled jobs (cron jobs, which are tasks that run at set times). It does not run a worker that never stops.
          </li>
          <li>
            Some languages and frameworks. Python works. PHP and Laravel are not officially
            supported. Only a community runtime exists for PHP.
          </li>
        </ul>
        <TimeLimitBars />

        <h3>2. Railway and Render</h3>
        <p>
          These are also managed PaaS, but they are made for full-stack applications, not only
          frontend. They run a <strong>real always-on server process</strong> for you. A process is
          a running program. They also offer managed PostgreSQL and Redis as add-ons (a managed
          database is one that the provider runs and backs up for you).
        </p>
        <p>
          The price is based on usage, which means compute hours plus resources. For a long-running
          Node.js backend this is often cheaper than Vercel. Setup stays very easy. But you still do
          not own or control the machine underneath.
        </p>
        <Callout kind="ok" label="Good fit when">
          <p className="mb-0">
            You want to launch fast and you need a real backend with background jobs. You do not
            want to learn about servers right now.
          </p>
        </Callout>

        <h3>3. Dokploy, Coolify, CapRover</h3>
        <p>
          These are a different kind of thing, not just another step on the ladder. They are{" "}
          <strong>self-hosted PaaS software</strong>. Self-hosted means you run it yourself. They
          are open-source tools that give you an experience like Vercel: git push, automatic build,
          automatic deploy and automatic SSL (HTTPS certificates). But <em>you</em> install them on
          your own server. The server can be an AWS EC2 instance, a Hostinger VPS (a rented virtual
          server) or a DigitalOcean droplet (DigitalOcean&apos;s name for a rented virtual server). Any server that runs Linux will do.
        </p>
        <p>
          So Dokploy is not a hosting company. It is a dashboard that you run on servers you
          already have.
        </p>
        <Callout kind="note" label="Key insight">
          <p className="mb-0">
            Dokploy needs exactly what this course teaches: a Linux server, networking, DNS (the
            system that turns a domain name into a server address), HTTPS (web traffic encrypted
            with a certificate) and Docker (a tool that packs an app into a container). If you learn raw AWS first, Dokploy is easy later. It is only software
            installed on an EC2 server that you already know how to secure and debug.
          </p>
        </Callout>

        <h3>4. Raw AWS</h3>
        <p>
          Raw AWS gives you the most flexibility. You can put your frontend on S3 plus CloudFront
          (S3 stores the files and CloudFront delivers them fast and cheaply). Your backend runs on
          EC2, which is a virtual server. At the start you can also run both on one single EC2
          server. That is simpler, and it is what we build first in this course.
        </p>
        <p>
          The cost is mostly fixed for each resource, not for each request. A small EC2 server plus a
          small RDS database costs roughly <strong>$15 to $25 per month</strong>, whether you have
          10 users or 500. (RDS is a database that AWS runs for you. Prices change by region, so
          check the current price list.)
        </p>

        <h3>5. Kubernetes and ECS</h3>
        <p>
          This is the advanced end. Kubernetes and ECS (the AWS container service) start, stop and
          connect many containers for teams that run many services at large scale. A container is a
          packaged app that runs the same everywhere. It is good to know these tools exist. But do
          not learn them yet. For a new SaaS (a product sold as an online subscription) they are
          too much.
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
                <td>Serverless functions</td>
                <td className={no}>Not officially</td>
                <td>No always-on server process. Functions have time limits</td>
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
                <td>You set up every part yourself</td>
              </tr>
              <tr>
                <td><strong>Dokploy</strong></td>
                <td className={yes}>Yes</td>
                <td className={yes}>Yes</td>
                <td className={yes}>Yes</td>
                <td>You look after the server underneath it</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          So if your project is in PHP, Vercel is not a good choice. Railway, AWS, Dokploy or
          classic shared PHP hosting are better options.
        </p>

        <h2 id="stateless-vs-persistent">The real deciding factor: stateless vs persistent</h2>
        <p>
          People often think the question is &ldquo;frontend or backend&rdquo;. That is not the
          real question. The real question is <strong>stateless or persistent</strong>.
        </p>
        <div className="my-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-bg-elev px-5 py-4">
            <h3 className="mt-0">Stateless</h3>
            <p className="mb-0 text-[0.95rem] text-ink-dim">
              The server remembers nothing from before this request. Each request is handled on its
              own, from a clean start. Anything that happened during it is gone once the answer is
              sent.
            </p>
          </div>
          <div className="rounded-xl border border-line bg-bg-elev px-5 py-4">
            <h3 className="mt-0">Persistent</h3>
            <p className="mb-0 text-[0.95rem] text-ink-dim">
              The server is one process that keeps running. It can hold things in memory, such as a
              variable, a cache or an open connection. That memory stays across many requests.
            </p>
          </div>
        </div>

        <Callout kind="note" label="Simple analogy">
          <p className="mb-0">
            Stateless is like a food truck that drives away after every customer. A fresh truck
            comes for the next customer and has no idea what the last person ordered. Persistent is
            like a restaurant that stays open all day. It has the same kitchen and the same staff. It
            knows what is cooking and keeps a running bill.
          </p>
        </Callout>

        <StatelessDiagram />

        <h3>Same code, two different results</h3>
        <div className="my-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-bg-elev px-5 py-4">
            <h3 className="mt-0">On Vercel (stateless)</h3>
            <p className="text-[0.95rem] text-ink-dim">
              Each request may run on a different, separate instance of your code. So this counter
              can go back to 0 at any time.
            </p>
            <pre className="my-0">
              <code>{`// pages/api/counter.js
let counter = 0;   // not reliable

export default function handler(req, res) {
  counter++;
  res.json({ counter });
}`}</code>
            </pre>
          </div>
          <div className="rounded-xl border border-line bg-bg-elev px-5 py-4">
            <h3 className="mt-0">On EC2 or Railway (persistent)</h3>
            <p className="text-[0.95rem] text-ink-dim">
              The same process answers every request, so the counter really does go up every time.
            </p>
            <pre className="my-0">
              <code>{`// server.js — runs all the time
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
            On a stateless platform, never keep important data (state) in a variable. Always save
            it in a database or in Redis (a fast in-memory store). On a persistent server you can
            choose. That choice is why we learn EC2. Even on a persistent server, remember this: if
            you run more than one server, a variable in one server is not seen by the others.
          </p>
        </Callout>

        <h2 id="how-to-choose">How to choose, practically</h2>
        <ul>
          <li>
            <strong>Only a frontend, or small API routes with quick database queries?</strong>{" "}
            Vercel is fine. Keep it simple.
          </li>
          <li>
            <strong>Need long background jobs, PDF generation, WebSockets or PHP?</strong> A
            persistent server is the easier choice: Railway, Dokploy or AWS.
          </li>
          <li>
            <strong>Want to launch fast without learning servers today?</strong> Use Railway. Move
            later, when you have paying customers.
          </li>
          <li>
            <strong>Want full control and the lowest cost at scale?</strong> Use raw AWS. This course
            builds it step by step.
          </li>
        </ul>
        <p>
          Many solo SaaS builders launch first on Railway or on self-hosted Dokploy. Launching fast
          matters more at the start. Later, when real users and real scale arrive, they move to raw
          AWS. This course gives you the raw AWS foundation in both cases. It is the skill that lets
          you set up, secure and debug every option above it, including Dokploy, instead of
          guessing.
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
