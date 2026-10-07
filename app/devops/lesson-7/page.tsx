import type { Metadata } from "next";
import Callout from "@/components/Callout";
import CommandList from "@/components/CommandList";
import Pm2Loop from "@/components/figures/Pm2Loop";
import InterviewQA from "@/components/InterviewQA";
import LessonIntro from "@/components/LessonIntro";
import LessonPager from "@/components/LessonPager";
import { getLesson } from "@/lib/lessons";

const lesson = getLesson("lesson-7")!;

export const metadata: Metadata = {
  title: `Lesson 7 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Concept: a computer you rent by the second" },
  { id: "why-this-matters", label: "Why do it by hand first" },
  { id: "vocabulary", label: "The seven words you must know" },
  { id: "sizing", label: "Instance types and picking a size" },
  { id: "launch", label: "Launch the server" },
  { id: "connect", label: "Connect with SSH" },
  { id: "setup", label: "Prepare the server" },
  { id: "deploy", label: "Deploy Next.js by hand" },
  { id: "pm2", label: "Keep it alive with PM2" },
  { id: "role", label: "Prove the IAM role works" },
  { id: "update", label: "Deploying a new version" },
  { id: "storage", label: "Disks, stop vs terminate, and the bill" },
  { id: "troubleshooting", label: "Troubleshooting table" },
  { id: "interview", label: "Interview corner" },
  { id: "practice", label: "Practice task before Lesson 8" },
  { id: "conclusion", label: "Conclusion" },
];

const vocab: [string, string, string][] = [
  ["AMI", "Amazon Machine Image: a template that a server is created from. It holds the operating system and any pre-installed software.", "Ubuntu Server 24.04 LTS"],
  ["Instance type", "The hardware size of the server: how many virtual CPUs (vCPU) and how much memory (RAM).", "t3.small = 2 vCPU, 2 GB"],
  ["EBS volume", "Elastic Block Store volume: the server’s hard disk. It is a separate network disk, so it survives when you stop the server.", "20 GB gp3"],
  ["Key pair", "Two linked keys used to log in without a password. AWS keeps the public key on the server. You keep the private key in a .pem file.", "myapp-key.pem"],
  ["Security Group", "The firewall you built in Lesson 6. It lists which network traffic may reach the server.", "web-sg"],
  ["Instance profile", "A holder that lets a server wear an IAM role (Lesson 5). The console makes one for you when you pick a role.", "myapp-ec2-role"],
  ["Elastic IP", "A fixed public IP address that stays yours when the server stops and starts.", "13.233.x.x"],
];

const sizes: [string, string, string, string][] = [
  ["t3.micro", "2 / 1 GB", "~$8", "Fine to run a small app. Too small to run next build, because it runs out of memory."],
  ["t3.small", "2 / 2 GB", "~$16", "Our choice for this course. It builds a normal Next.js app without trouble (with swap)."],
  ["t3.medium", "2 / 4 GB", "~$32", "Comfortable for a build, the app and a few background jobs."],
  ["t4g.small", "2 / 2 GB", "~$13", "Same size on ARM (Graviton). About 20% cheaper, but it needs an arm64 image."],
  ["c7i.large", "2 / 4 GB", "~$65", "Compute-optimised: steady, high CPU use (video, heavy APIs)."],
];

const trouble: [string, string, string][] = [
  ["ssh: Connection timed out", "The Security Group has no port-22 rule for your current IP, or the instance has no public IP or route", "Use the Lesson 6 checklist. Update the “My IP” SSH rule to your current IP"],
  ["Permission denied (publickey)", "Wrong username, wrong key, or .pem file permissions too open", "Ubuntu AMIs use the user ubuntu. Run chmod 400 key.pem. Pass the key with -i"],
  ["WARNING: UNPROTECTED PRIVATE KEY FILE", "Other users can read the .pem file", "chmod 400 ~/.ssh/myapp-key.pem"],
  ["Build killed / “JavaScript heap out of memory”", "The instance does not have enough RAM", "Add a 2 GB swap file (below) or use t3.small or larger"],
  ["App works on :3000 from the server, not from your laptop", "Port 3000 is not open, or the app listens only on 127.0.0.1", "Open 3000 to your IP only. Check with ss -tlnp"],
  ["502/blank after a reboot", "PM2 did not restart the app", "Run pm2 startup, then pm2 save (below)"],
  ["Instance was reachable, now the IP changed", "Public IPs are released when you stop the server", "Attach an Elastic IP"],
];

export default function LessonSevenPage() {
  return (
    <article>
      <LessonIntro lesson={lesson} outline={outline} />

      <div className="lesson">
        <h2 id="concept">Concept</h2>
        <p>
          <strong>EC2</strong> (Elastic Compute Cloud) is an AWS service that gives you a{" "}
          <strong>computer to rent, billed by the second</strong>. It is a real Linux machine with
          a CPU, memory and a disk, in an AWS data centre. You get a login and full control. You
          can install anything, run anything and break anything. One rented machine is called an{" "}
          <strong>instance</strong>.
        </p>
        <p>
          This is the moment the whole course has been leading to. Lesson 1 taught you Linux.
          Lesson 2 taught you the network. Lesson 5 taught you identity, and Lesson 6 built the
          room where this server will live. Now you put the first server in that room and run your
          Next.js app on a machine you control.
        </p>
        <Callout kind="note" label="What Vercel did that you now do">
          <p className="mb-0">
            On Vercel, <code>git push</code> built your app, started it, gave it HTTPS, restarted it
            after a crash and scaled it. On EC2 you do each of these things yourself, one at a
            time. That is why we do it by hand <em>first</em>. Lessons 9, 14 and 15 then automate
            steps that you already understand.
          </p>
        </Callout>

        <h2 id="why-this-matters">Why do it by hand first</h2>
        <p>
          Real teams do not log in to servers with SSH to deploy. They use pipelines. A pipeline
          (CI/CD, short for continuous integration and continuous delivery) is a set of steps that
          builds, tests and deploys your code automatically. So why learn the manual way?
        </p>
        <ul>
          <li>
            <strong>You cannot automate what you do not understand.</strong> A pipeline is just
            this lesson&apos;s commands written in a YAML file (a simple text format for settings).
            When the pipeline breaks at 2 a.m., you log in with SSH and run the steps yourself.
          </li>
          <li>
            <strong>Every production problem ends at a server.</strong> You read logs, check a
            process and find a full disk. This lesson teaches those skills.
          </li>
          <li>
            <strong>It shows what Vercel hid.</strong> Environment variables live in a file. A
            program must watch your process and restart it. Memory is limited. Disks fill up.
          </li>
        </ul>

        <h2 id="vocabulary">The seven words you must know</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Word</th>
                <th>What it is</th>
                <th>Ours</th>
              </tr>
            </thead>
            <tbody>
              {vocab.map(([w, what, ours]) => (
                <tr key={w}>
                  <td className="whitespace-nowrap"><strong>{w}</strong></td>
                  <td>{what}</td>
                  <td><code>{ours}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 id="sizing">Instance types and picking a size</h2>
        <p>
          An instance type name is a code. In <code>t3.small</code>, <code>t</code> is the{" "}
          <strong>family</strong> (general purpose, burstable), <code>3</code> is the{" "}
          <strong>generation</strong> and <code>small</code> is the <strong>size</strong>. A{" "}
          <code>g</code> in the family (<code>t4g</code>, <code>m7g</code>) means an ARM
          &ldquo;Graviton&rdquo; CPU. ARM is a different CPU design. It is cheaper for the same
          power, but your software must be built for ARM.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>vCPU / RAM</th>
                <th>Per month (approx.)</th>
                <th>Verdict</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map(([t, spec, price, verdict]) => (
                <tr key={t}>
                  <td className="whitespace-nowrap"><code>{t}</code></td>
                  <td className="whitespace-nowrap">{spec}</td>
                  <td className="whitespace-nowrap">{price}</td>
                  <td>{verdict}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>Prices are on-demand (pay as you go) for Mumbai, running all month. Always check the current pricing page.</p>
        <Callout kind="note" label="What “burstable” means">
          <p className="mb-0">
            <code>t</code> instances earn CPU credits while they are idle and spend them when they
            are busy, like a mobile data plan with rollover. A small web app that idles at 5% CPU is
            a good fit. If a server runs at 100% for hours, it uses up its credits. T3 instances
            start in &ldquo;unlimited&rdquo; mode by default. They do not slow down, but AWS charges
            you extra for the surplus credits. (In &ldquo;standard&rdquo; mode, they slow down
            instead.) For constant heavy load, choose the <code>m</code> or <code>c</code> families.
          </p>
        </Callout>

        <h2 id="launch">Launch the server</h2>
        <p>
          Go to EC2 → <strong>Launch instance</strong>. The form is long, but only a few fields
          matter. Leave everything else at its default.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Field</th>
                <th>Set it to</th>
                <th>Why</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Image (AMI)</td>
                <td>Ubuntu Server 24.04 LTS</td>
                <td>LTS means long-term support: it gets security fixes for years. Every command in this course assumes it</td>
              </tr>
              <tr>
                <td>Instance type</td>
                <td><code>t3.small</code></td>
                <td>2 GB RAM — enough for <code>next build</code> with swap</td>
              </tr>
              <tr>
                <td>Key pair</td>
                <td>Create new, ED25519, <code>.pem</code></td>
                <td>Your way in over SSH (secure remote login). AWS shows the private key <strong>only once</strong></td>
              </tr>
              <tr>
                <td>Network</td>
                <td><code>myapp</code> VPC, a <strong>public</strong> subnet, <code>web-sg</code></td>
                <td>The network from Lesson 6, so it gets a public IP</td>
              </tr>
              <tr>
                <td>Storage</td>
                <td>20 GB gp3, <strong>encrypted</strong></td>
                <td>Encryption at rest (data is scrambled on the disk) costs nothing and does not slow the server in a way you will notice</td>
              </tr>
              <tr>
                <td>Advanced → IAM instance profile</td>
                <td><code>myapp-ec2-role</code></td>
                <td>The role from Lesson 5 — AWS access with no keys on disk</td>
              </tr>
              <tr>
                <td>Advanced → Metadata version</td>
                <td><strong>V2 only (token required)</strong></td>
                <td>IMDSv2 (the safer version of the instance metadata service, explained below) blocks a whole group of attacks that steal the server&apos;s credentials</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout kind="warn" label="Lose the key and you are locked out">
          <p className="mb-0">
            The <code>.pem</code> file downloads once, and AWS never shows it again. Move it to{" "}
            <code>~/.ssh/</code> and set its permissions to <code>400</code> (only you can read it;
            see Lesson 1. SSH refuses keys that other users can read). Also back it up in a
            password manager.
          </p>
        </Callout>
        <p>
          Then give the server a permanent address: EC2 → <strong>Elastic IPs</strong> → Allocate →
          Associate with your instance. Without it, the public IP changes every time the server
          stops and starts, which breaks your DNS record (the entry that links your domain name to
          the IP). Every public IPv4 address costs $0.005 per hour, whether it is attached or not.
          So release the Elastic IP when you delete the server.
        </p>

        <h2 id="connect">Connect with SSH</h2>
        <CommandList
          title="Log in"
          commands={[
            { cmd: "ssh -i ~/.ssh/myapp-key.pem ubuntu@SERVER_IP", note: "The first time, it asks you to trust the server fingerprint (the server&apos;s ID). Type yes. The user name on Ubuntu images is always ubuntu" },
          ]}
        />
        <p>
          Tip: add a <code>Host myapp</code> entry to <code>~/.ssh/config</code> on your laptop. Put
          the IP, user and key path in it. From then on, <code>ssh myapp</code> is enough.
        </p>

        <h2 id="setup">Prepare the server</h2>
        <p>A fresh server has nothing on it but Linux. Do these once, in order:</p>
        <ol className="steps">
          <li>
            <h3>Update the system</h3>
            <p>
              Install the security fixes released since the image was built. Also install{" "}
              <code>git</code> and the build tools that some npm packages need. If the kernel (the
              core of the operating system) is updated, you may need to reboot.
            </p>
          </li>
          <li>
            <h3>Add a swap file — the safety net for small servers</h3>
            <p>
              Swap is a part of the disk that the system uses as emergency memory when RAM is full.
              It is slow, but it turns &ldquo;process killed&rdquo; into &ldquo;build took a bit
              longer&rdquo;. <code>next build</code> is the step that uses the most memory in the
              life of your app. A 2 GB swap file is enough on a t3.small.
            </p>
          </li>
          <li>
            <h3>Install Node.js</h3>
            <p>
              Install Node 22 LTS from NodeSource (a package source for Node) and enable{" "}
              <code>corepack</code>. Corepack is a Node tool that gives you the pnpm or yarn
              version your project expects. Node 24 is the newer LTS, so either works. What matters
              is to use the same Node major version on your laptop, in CI and on the server.
              Otherwise you will chase &ldquo;works on my machine&rdquo; bugs.
            </p>
          </li>
          <li>
            <h3>Give the server read-only access to your repository</h3>
            <p>
              A private repository needs credentials. Do <em>not</em> copy your personal SSH key
              onto a server. Instead, make a new key on the server. Add its public half in GitHub →
              repo → Settings → <strong>Deploy keys</strong>. A deploy key is an SSH key that works
              for one repository only. Leave &ldquo;Allow write access&rdquo; unchecked. If the
              server is ever broken into, the attacker can read one repository. They cannot push
              code or touch your other projects. This is least privilege (Lesson 5) applied to Git.
            </p>
          </li>
        </ol>

        <h2 id="deploy">Deploy Next.js by hand</h2>
        <p>
          Clone the repository into your home folder. Create a <code>.env</code> file next to it and
          set its permissions to <code>600</code> (only you can read and write it; Lesson 1). On
          Vercel these values lived in a dashboard. Here they are in a file. For now the file needs
          only <code>NODE_ENV=production</code> and <code>PORT=3000</code>. The database comes in
          Lesson 8. AWS credentials are <em>not</em> in the file on purpose, because the IAM role
          provides them. Then run:
        </p>
        <CommandList
          title="Build it"
          commands={[
            { cmd: "pnpm install --frozen-lockfile && pnpm build", note: "Install exactly the versions in the lockfile (the file that records every package version), then build the app" },
          ]}
        />
        <Callout kind="warn" label="Two common .env mistakes">
          <ul className="mb-0">
            <li>
              Variables that start with <code>NEXT_PUBLIC_</code> are copied into the JavaScript{" "}
              <strong>at build time</strong>. If you change one, you must build again. A restart
              is not enough.
            </li>
            <li>
              Never commit <code>.env</code>. If it is already in Git, treat every secret in it as
              leaked and replace it with a new one.
            </li>
          </ul>
        </Callout>
        <h3>See it in your browser</h3>
        <p>
          The app listens on port 3000 (a port is a numbered door on a computer for network
          traffic), but <code>web-sg</code> does not allow that port. Add a temporary inbound rule
          for port 3000 with the source <strong>My IP</strong>. Then{" "}
          <code>http://SERVER_IP:3000</code> works, but only for you. Delete that rule after Lesson
          10, when Nginx takes over ports 80 and 443. Port 3000 must never be public.
        </p>

        <h2 id="pm2">Keep it alive with PM2</h2>
        <p>
          <strong>PM2</strong> is a process manager for Node.js. It starts your app, restarts it if
          it crashes, and can start it again after a reboot. You need it because{" "}
          <code>pnpm start</code> in your SSH session stops the moment you close the terminal. This
          is the problem from Lesson 1 again: something other than your shell must own the
          process.
        </p>
        <Pm2Loop />
        <CommandList
          title="PM2 setup — one time"
          commands={[
            { cmd: "pm2 start pnpm --name myapp -- start", note: "Run “pnpm start” under PM2. PM2 restarts the app whenever it crashes. (Install PM2 first with: sudo npm install -g pm2)" },
            { cmd: "pm2 startup", note: "Make PM2 itself start when the server boots. It PRINTS a sudo command. Copy that line and run it" },
            { cmd: "pm2 save", note: "Save the current process list, so that the server brings myapp back after a boot" },
          ]}
        />
        <p>
          Test it: reboot the server, wait a minute, log in again and run <code>pm2 status</code>.
          If <code>myapp</code> is online, it survives reboots. If not, you skipped{" "}
          <code>startup</code> or <code>save</code>. Day to day you will mostly use{" "}
          <code>pm2 logs</code>, <code>pm2 restart</code> and <code>pm2 status</code>.
        </p>

        <h2 id="role">Prove the IAM role works</h2>
        <p>
          Lesson 5 promised that the server could call AWS <strong>without any access keys</strong>.
          Run <code>aws sts get-caller-identity</code> on the server. This command shows who AWS
          thinks you are. The ARN now says <code>assumed-role/myapp-ec2-role/i-0abc…</code>. You
          are wearing the role, and there is no credentials file in <code>~/.aws</code>.
        </p>
        <p>
          The temporary credentials come from the <strong>instance metadata service</strong> (IMDS).
          This is a small web service that every instance can reach at the address{" "}
          <code>169.254.169.254</code>. The credentials are replaced automatically every few hours.
          The AWS SDK in your Node app reads them the same way. This is why the S3 upload code in
          Lesson 5 needed no keys. The role only allows <code>s3:PutObject</code> and{" "}
          <code>s3:GetObject</code> on one bucket. So even a fully hacked app cannot delete your
          database.
        </p>

        <h2 id="update">Deploying a new version</h2>
        <p>
          Now the loop you will repeat until Lesson 14 automates it. Pull the new code, install,
          build, then run <code>pm2 reload myapp</code>. Reload is a gentle restart. (For a true
          zero-downtime reload, PM2 must run your app in cluster mode. In the simple setup here,
          expect a short gap.) Put the four steps in a small <code>deploy.sh</code> script that
          stops at the first error. Then you never skip a step at 11 p.m.
        </p>
        <p>
          Notice what is wrong with this way. Lesson 14 fixes each problem. The build runs{" "}
          <em>on the production server</em>, so it competes with live traffic. A failed build can
          leave the site broken. There is no easy rollback (going back to the previous version).
          Only people with SSH access can deploy.
        </p>

        <h2 id="storage">Disks, stop vs terminate, and the bill</h2>
        <h3>The disk</h3>
        <p>
          The root disk is an <strong>EBS volume</strong>. This is a drive that connects to the
          server over the network. It is billed per GB per month (roughly $0.10 per GB for gp3, so
          20 GB costs about $2). gp3 is a type of SSD disk. The disk survives when you stop the
          server. You can make it bigger later without downtime, but you can never make it smaller.
        </p>
        <p>
          When something fails for no clear reason, check the free disk space first. When the disk
          is more than 90% full, builds and logs start to break. The usual causes are logs,{" "}
          <code>node_modules</code> and old builds.
        </p>
        <h3>Stop, terminate — and what each costs</h3>
        <p>
          <strong>Stop</strong> switches the server off, like shutting down a PC, and you can
          start it again later. <strong>Terminate</strong> deletes the server for good. They are
          different, so choose carefully.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>Server</th>
                <th>Disk</th>
                <th>You keep paying for</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Stop</strong></td>
                <td>Powered off, can be started again</td>
                <td>Kept</td>
                <td>The disk + the Elastic IP. <em>Not</em> the compute</td>
              </tr>
              <tr>
                <td><strong>Terminate</strong></td>
                <td>Destroyed forever</td>
                <td>Deleted (default)</td>
                <td>Nothing — but release the Elastic IP yourself</td>
              </tr>
              <tr>
                <td><strong>Reboot</strong></td>
                <td>Restarts, same host</td>
                <td>Kept</td>
                <td>Same as running</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout kind="ok" label="When you finish studying for the day">
          <p className="mb-0">
            <strong>Stop</strong> the instance. A stopped t3.small costs about $6 a month (disk
            plus IP) instead of $16. Start it again tomorrow from the console. The Elastic IP means
            your address does not change.
          </p>
        </Callout>
        <h3>Everything this lesson costs</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Item</th><th>Approx. per month</th></tr>
            </thead>
            <tbody>
              <tr><td>t3.small, running 24/7</td><td>~$16 (~₹1,350)</td></tr>
              <tr><td>20 GB gp3 disk</td><td>~$2</td></tr>
              <tr><td>Elastic / public IPv4</td><td>~$3.60</td></tr>
              <tr><td>Data out to the internet</td><td>First 100 GB/month free, then ~$0.109/GB</td></tr>
              <tr><td>Key pair, instance profile, Security Groups</td><td className="font-semibold text-emerald-300">Free</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          New AWS accounts may also get promotional credits and a free plan for the first six
          months. Check the Billing console to see what your account has. Do not assume anything
          is free, and keep the Lesson 5 budget alert on.
        </p>

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
              q: "What is the difference between stopping and terminating an EC2 instance?",
              a: (
                <p className="mb-0">
                  Stop switches the machine off. The EBS disk and the Elastic IP stay, and you keep
                  paying for them, but you do not pay for compute. Terminate deletes the instance
                  and, by default, its root disk. Terminate cannot be undone.
                </p>
              ),
            },
            {
              q: "How does an application on EC2 call S3 securely?",
              a: (
                <p className="mb-0">
                  Attach an IAM role to the instance through an instance profile. The SDK gets
                  short-lived credentials from the instance metadata service by itself. There are
                  no access keys on disk, the permissions are narrow, and the credentials expire.
                </p>
              ),
            },
            {
              q: "What is IMDSv2 and why enforce it?",
              a: (
                <p className="mb-0">
                  The instance metadata service (169.254.169.254) gives out the role credentials.
                  IMDSv2 is the second version. It first needs a session token, which you get with
                  a PUT request. This stops simple SSRF bugs (server-side request forgery, where an
                  attacker tricks your server into calling an address for them) from reading the
                  credentials with a single GET request.
                </p>
              ),
            },
            {
              q: "Your instance’s public IP changed after a restart. Why and how do you fix it?",
              a: (
                <p className="mb-0">
                  An auto-assigned public IP is released when you stop the instance, and a new one is
                  given when you start it. Attach an Elastic IP. Better still, put the servers
                  behind a load balancer and point DNS at the load balancer.
                </p>
              ),
            },
            {
              q: "The app works, then a reboot leaves the site down. What did you forget?",
              a: (
                <p className="mb-0">
                  Nothing starts the process again after boot. With PM2, run{" "}
                  <code>pm2 startup</code> and <code>pm2 save</code>. Other options are a systemd
                  service (the Linux way to run background services) or Docker with a restart
                  policy.
                </p>
              ),
            },
            {
              q: "On-demand, Reserved, Savings Plans, Spot — when is each right?",
              a: (
                <p className="mb-0">
                  On-demand means pay as you go. Use it for short or unpredictable work. Savings
                  Plans and Reserved Instances mean you promise to use a steady amount for one or
                  three years, and in return you pay roughly 30–70% less. Spot means you use spare
                  AWS capacity at a big discount, but AWS can take it back with two minutes of
                  notice. Use Spot for work that can be interrupted and holds no data, such as batch
                  jobs and workers.
                </p>
              ),
            },
            {
              q: "Why is running the build on the production server a bad idea?",
              a: (
                <p className="mb-0">
                  The build competes with live traffic for CPU and RAM. It can fail halfway and leave
                  a broken release. It is hard to repeat the same way twice, and it gives no
                  rollback. Build once in CI (or in a container image) and ship the finished result,
                  called the artefact. See Lessons 9 and 14.
                </p>
              ),
            },
          ]}
        />

        <hr />

        <h2 id="practice">Practice task before Lesson 8</h2>
        <ol>
          <li>
            Launch the server and deploy your Next.js app as above. Open{" "}
            <code>http://SERVER_IP:3000</code> from your laptop.
          </li>
          <li>
            Reboot the instance and confirm the app comes back by itself without you touching it.
          </li>
          <li>
            Run <code>aws sts get-caller-identity</code> on the server. Find the role name in the
            ARN. Then run <code>aws s3 ls</code> — it should be denied. Which line in the Lesson 5
            policy explains why?
          </li>
          <li>
            Kill the app&apos;s process on purpose and watch PM2 start it again. Look at the
            restart counter in <code>pm2 status</code>.
          </li>
          <li>
            Add a page to your app, push it, and deploy it by hand. Measure how long the site was
            unavailable, if at all. Write down two ways this process could go wrong.
          </li>
          <li>
            When you are done for the day, stop the instance. Start it tomorrow and
            confirm the IP is unchanged.
          </li>
        </ol>
        <Callout kind="ok" label="Optional stretch">
          <p className="mb-0">
            Change the <code>web-sg</code> SSH rule to a different (wrong) IP and try to log in.
            Watch it hang. Then fix it. Seeing what a Security Group block looks like from the
            outside helps you recognise every later &ldquo;timeout&rdquo;.
          </p>
        </Callout>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          You now have a real server running your real app. You also know which parts of a Vercel
          deploy you replaced.
        </p>
        <ul>
          <li>
            <strong>EC2</strong> = a rented Linux computer. You choose the image, the size, the
            disk and the network.
          </li>
          <li>
            <strong>Safe defaults that cost nothing</strong>: an encrypted disk, IMDSv2 required,
            SSH only from your IP, an IAM role instead of keys, and a read-only deploy key.
          </li>
          <li>
            <strong>Something must watch your process</strong>: use PM2 with <code>startup</code>{" "}
            and <code>save</code>, so the app survives crashes and reboots.
          </li>
          <li>
            <strong>Stop it, do not forget it</strong>: a running instance bills every second. A
            stopped one costs only its disk and IP.
          </li>
          <li>
            <strong>The manual deploy is the blueprint</strong> for every automation to come:
            Docker (Lesson 9), CI/CD (14), Terraform (15).
          </li>
        </ul>
        <p>
          The app is running, but it has nowhere to keep data. Next we add a managed PostgreSQL
          database that sits safely in the private subnet.
        </p>

        <hr />
        <p>
          End of Lesson 7. Next: <strong>Lesson 8 — RDS: Managed PostgreSQL</strong>.
        </p>
      </div>

      <LessonPager slug={lesson.slug} />
    </article>
  );
}
