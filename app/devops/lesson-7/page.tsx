import type { Metadata } from "next";
import Callout from "@/components/Callout";
import CommandList from "@/components/CommandList";
import Pm2Loop from "@/components/figures/Pm2Loop";
import InterviewQA from "@/components/InterviewQA";
import LessonIntro from "@/components/LessonIntro";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
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
  ["AMI", "Amazon Machine Image: the template a server is created from — the operating system plus preinstalled software.", "Ubuntu Server 24.04 LTS"],
  ["Instance type", "The hardware size: how many CPUs and how much memory.", "t3.small = 2 vCPU, 2 GB"],
  ["EBS volume", "The server’s hard disk. A separate network disk that survives a stop.", "20 GB gp3"],
  ["Key pair", "A public/private key pair. AWS keeps the public half on the server; you keep the .pem file.", "myapp-key.pem"],
  ["Security Group", "The firewall you built in Lesson 6.", "web-sg"],
  ["Instance profile", "The wrapper that lets a server wear an IAM role (Lesson 5).", "myapp-ec2-profile"],
  ["Elastic IP", "A public address that stays yours even when the server stops and starts.", "13.233.x.x"],
];

const sizes: [string, string, string, string][] = [
  ["t3.micro", "2 / 1 GB", "~$8", "Fine to run a small app. Too small to run next build — it runs out of memory."],
  ["t3.small", "2 / 2 GB", "~$16", "Our choice for this course. Builds a normal Next.js app comfortably."],
  ["t3.medium", "2 / 4 GB", "~$32", "Comfortable for build + app + a few background jobs."],
  ["t4g.small", "2 / 2 GB", "~$13", "Same size on ARM (Graviton). ~20% cheaper; needs an arm64 image."],
  ["c7i.large", "2 / 4 GB", "~$65", "Compute-optimised: steady, high CPU (video, heavy APIs)."],
];

const trouble: [string, string, string][] = [
  ["ssh: Connection timed out", "Security Group has no port-22 rule for your current IP, or the instance has no public IP / route", "Lesson 6 checklist. Re-run the checkip command and update the /32 rule"],
  ["Permission denied (publickey)", "Wrong username, wrong key, or .pem permissions too open", "Ubuntu AMIs use ubuntu. chmod 400 key.pem. Pass -i explicitly"],
  ["WARNING: UNPROTECTED PRIVATE KEY FILE", "The .pem is readable by others", "chmod 400 ~/.ssh/myapp-key.pem"],
  ["Build killed / “JavaScript heap out of memory”", "Not enough RAM on the instance", "Add a 2 GB swap file (below) or use t3.small or larger"],
  ["App works on :3000 from the server, not from your laptop", "Port 3000 not open, or app bound to 127.0.0.1", "Open 3000 to your IP only; check with ss -tlnp"],
  ["502/blank after a reboot", "PM2 did not restart the app", "pm2 startup then pm2 save (below)"],
  ["Instance was reachable, now the IP changed", "Public IPs are released on stop/start", "Attach an Elastic IP"],
];

export default function LessonSevenPage() {
  return (
    <article>
      <LessonIntro lesson={lesson} outline={outline} />

      <div className="lesson">
        <h2 id="concept">Concept</h2>
        <p>
          <strong>EC2</strong> (Elastic Compute Cloud) is a <strong>computer you rent from AWS,
          billed by the second</strong>. It is a real Linux machine with a CPU, memory and a disk,
          sitting in an AWS data centre. You get a login and full control: install anything, run
          anything, break anything.
        </p>
        <p>
          This is the moment the whole course has been building towards. Lesson 1 taught you Linux,
          Lesson 2 the network, Lesson 5 the identity, Lesson 6 the room this server will live in.
          Now you put the first server in it and get your Next.js app running on a machine you
          control.
        </p>
        <Callout kind="note" label="What Vercel did that you now do">
          <p className="mb-0">
            On Vercel, <code>git push</code> built your app, started it, gave it HTTPS, restarted it
            when it crashed and scaled it. On EC2 you do every one of those things, one at a time.
            That is exactly why we do it by hand <em>first</em>: Lessons 9, 14 and 15 automate
            steps you have already understood.
          </p>
        </Callout>

        <h2 id="why-this-matters">Why do it by hand first</h2>
        <p>
          Real teams do not SSH into servers to deploy — they use pipelines. So why learn this?
        </p>
        <ul>
          <li>
            <strong>You cannot automate what you do not understand.</strong> A CI/CD pipeline is
            just this lesson&apos;s commands written in a YAML file. When the pipeline breaks at
            2 a.m., you debug it by SSH-ing in and running the steps yourself.
          </li>
          <li>
            <strong>Every production incident ends at a server.</strong> Reading logs, checking a
            process, finding a full disk — all the skills below.
          </li>
          <li>
            <strong>It exposes what Vercel hid</strong>: environment variables live in a file, the
            process must be supervised, memory is finite, disks fill up.
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
          An instance type name reads like a code: <code>t3.small</code> =
          <strong> family</strong> <code>t</code> (general purpose, burstable),{" "}
          <strong>generation</strong> <code>3</code>, <strong>size</strong> <code>small</code>. A{" "}
          <code>g</code> in the family (<code>t4g</code>, <code>m7g</code>) means an ARM
          &ldquo;Graviton&rdquo; CPU: cheaper for the same power, but the software must be built
          for ARM.
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
        <p>Prices are on-demand for Mumbai, running all month. Always check the current pricing page.</p>
        <Callout kind="note" label="What “burstable” means">
          <p className="mb-0">
            <code>t</code> instances earn CPU credits while idle and spend them when busy, like a
            mobile data plan with rollover. A small web app that idles at 5% CPU is perfect. A
            server pinned at 100% for hours runs out of credits and slows down (or, in
            &ldquo;unlimited&rdquo; mode, bills extra). For constant heavy load pick <code>m</code>{" "}
            or <code>c</code> families instead.
          </p>
        </Callout>

        <h2 id="launch">Launch the server</h2>
        <p>
          Every step has a console equivalent (EC2 → Launch instance), but the CLI keeps it exact
          and repeatable. We assume the variables saved in Lesson 6.
        </p>
        <ol className="steps">
          <li>
            <h3>Load your network and pick the operating system</h3>
            <Script
              title="1 · variables and AMI"
              code={`source ~/myapp-network.env
export AWS_REGION=ap-south-1

# AWS publishes the current Ubuntu 24.04 image ID as a public parameter, so you never hard-code it
AMI_ID=$(aws ssm get-parameter \\
  --name /aws/service/canonical/ubuntu/server/24.04/stable/current/amd64/hvm/ebs-gp3/ami-id \\
  --query Parameter.Value --output text)
echo $AMI_ID`}
            />
          </li>
          <li>
            <h3>Create the key pair — the only copy of the private key you will ever get</h3>
            <Script
              title="2 · key pair"
              code={`aws ec2 create-key-pair --key-name myapp-key --key-type ed25519 \\
  --query KeyMaterial --output text > ~/.ssh/myapp-key.pem
chmod 400 ~/.ssh/myapp-key.pem   # SSH refuses keys other users can read`}
            />
            <Callout kind="warn" label="Lose it and you are locked out">
              <p className="mb-0">
                AWS never shows the private key again. Back it up to a password manager. If it is
                gone, the fix is to launch a new instance (or use SSM Session Manager — Lesson 18).
              </p>
            </Callout>
          </li>
          <li>
            <h3>Create the instance profile for the role from Lesson 5</h3>
            <p>
              A role cannot be attached to a server directly; it goes inside an{" "}
              <em>instance profile</em>. (The console creates this wrapper silently, which is why
              many people never learn it exists.)
            </p>
            <Script
              title="3 · profile"
              code={`aws iam create-instance-profile --instance-profile-name myapp-ec2-profile
aws iam add-role-to-instance-profile \\
  --instance-profile-name myapp-ec2-profile --role-name myapp-ec2-role`}
            />
          </li>
          <li>
            <h3>Launch it</h3>
            <Script
              title="4 · run-instances"
              code={`INSTANCE_ID=$(aws ec2 run-instances \\
  --image-id $AMI_ID \\
  --instance-type t3.small \\
  --key-name myapp-key \\
  --subnet-id $PUB_A \\
  --security-group-ids $WEB_SG \\
  --iam-instance-profile Name=myapp-ec2-profile \\
  --metadata-options HttpTokens=required \\
  --block-device-mappings 'DeviceName=/dev/sda1,Ebs={VolumeSize=20,VolumeType=gp3,Encrypted=true}' \\
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=myapp-web}]' \\
  --query 'Instances[0].InstanceId' --output text)

aws ec2 wait instance-running --instance-ids $INSTANCE_ID
echo $INSTANCE_ID`}
            />
            <p>What the interesting flags do:</p>
            <ul>
              <li>
                <code>--subnet-id $PUB_A</code>: the public subnet from Lesson 6, so it gets a
                public IP.
              </li>
              <li>
                <code>--metadata-options HttpTokens=required</code>: forces{" "}
                <strong>IMDSv2</strong>, the token-based version of the metadata service. It blocks
                a whole class of attacks where a bug in your app is tricked into leaking the
                server&apos;s credentials. Always set it.
              </li>
              <li>
                <code>Encrypted=true</code>: the disk is encrypted at rest with no performance
                cost. There is no reason not to.
              </li>
            </ul>
          </li>
          <li>
            <h3>Give it a permanent public address</h3>
            <Script
              title="5 · Elastic IP"
              code={`ALLOC_ID=$(aws ec2 allocate-address --domain vpc --query AllocationId --output text)
aws ec2 associate-address --instance-id $INSTANCE_ID --allocation-id $ALLOC_ID
SERVER_IP=$(aws ec2 describe-addresses --allocation-ids $ALLOC_ID --query 'Addresses[0].PublicIp' --output text)
echo $SERVER_IP    # this is the address you will use — and later point DNS at`}
            />
            <p>
              Without an Elastic IP the public address changes every time the server stops and
              starts, breaking your DNS record. An Elastic IP{" "}
              <strong>attached to a running instance</strong> costs the same $0.005/hour as any
              public IPv4. One left <em>unattached</em> costs the same too — release it when you
              delete the server.
            </p>
          </li>
        </ol>

        <h2 id="connect">Connect with SSH</h2>
        <CommandList
          title="Log in"
          commands={[
            { cmd: "ssh -i ~/.ssh/myapp-key.pem ubuntu@$SERVER_IP", note: "First time it asks to trust the server fingerprint — type yes. The username on Ubuntu images is always ubuntu (Amazon Linux uses ec2-user)" },
            { cmd: "whoami && hostname && uname -a", note: "You are now typing on a computer in Mumbai" },
          ]}
        />
        <p>Typing that long command gets old. Put it in a config file on your laptop:</p>
        <Script
          title="~/.ssh/config (on your laptop)"
          code={`Host myapp
  HostName 13.233.x.x            # your Elastic IP
  User ubuntu
  IdentityFile ~/.ssh/myapp-key.pem
  ServerAliveInterval 60         # keeps an idle session from dropping

# now simply:   ssh myapp        scp file.txt myapp:~        ssh -L 5433:... myapp`}
        />

        <h2 id="setup">Prepare the server</h2>
        <p>
          A fresh server has nothing on it but Linux. Do these once, in order. Everything runs{" "}
          <em>on the server</em>.
        </p>
        <ol className="steps">
          <li>
            <h3>Update the system</h3>
            <CommandList
              title="Patch first"
              commands={[
                { cmd: "sudo apt update && sudo apt upgrade -y", note: "Security fixes released since the image was built. A kernel update may ask you to reboot: sudo reboot" },
                { cmd: "sudo apt install -y git build-essential unzip", note: "git to fetch code; build tools some npm packages compile native code with" },
                { cmd: "sudo snap install aws-cli --classic", note: "The AWS CLI, so you can test the IAM role from the server itself" },
              ]}
            />
          </li>
          <li>
            <h3>Add a swap file — the safety net for small servers</h3>
            <p>
              Swap uses part of the disk as emergency memory. It is slow, but it turns
              &ldquo;process killed&rdquo; into &ldquo;build took a bit longer&rdquo;, and{" "}
              <code>next build</code> is the most memory-hungry moment of the app&apos;s life.
            </p>
            <Script
              title="2GB swap"
              code={`sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab   # survive reboots
free -h                                                        # Swap row should show 2.0Gi`}
            />
          </li>
          <li>
            <h3>Install Node.js</h3>
            <Script
              title="Node 22 LTS from NodeSource"
              code={`curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo corepack enable            # gives you pnpm / yarn matching your lockfile
node -v && npm -v && pnpm -v`}
            />
            <Callout kind="warn" label="Piping a script into a root shell">
              <p className="mb-0">
                <code>curl … | sudo bash</code> runs whatever the URL returns as root. For a
                well-known vendor that is normal practice, but the habit to build is: download the
                script, read it, then run it. Use the same Node major version as your laptop and CI,
                or you will chase &ldquo;works on my machine&rdquo; bugs.
              </p>
            </Callout>
          </li>
          <li>
            <h3>Give the server read-only access to your repository</h3>
            <p>
              A private repository needs credentials. Do <em>not</em> copy your personal SSH key
              onto a server. Create a <strong>deploy key</strong>: a key that belongs to one
              repository and is read-only.
            </p>
            <Script
              title="deploy key"
              code={`ssh-keygen -t ed25519 -C "myapp-server" -f ~/.ssh/deploy_key -N ""
cat ~/.ssh/deploy_key.pub      # copy this whole line

# GitHub → your repo → Settings → Deploy keys → Add deploy key
#   Title: myapp-server     Key: (paste)     leave "Allow write access" UNCHECKED

cat >> ~/.ssh/config <<'EOF'
Host github.com
  IdentityFile ~/.ssh/deploy_key
  IdentitiesOnly yes
EOF
ssh -T git@github.com           # "Hi org/repo! You've successfully authenticated"`}
            />
            <p>
              If this server is ever compromised, the attacker can read one repository — they
              cannot push code or touch your other projects. That is least privilege, from Lesson 5,
              applied to Git.
            </p>
          </li>
        </ol>

        <h2 id="deploy">Deploy Next.js by hand</h2>
        <Script
          title="on the server"
          code={`cd ~
git clone git@github.com:YOUR-ORG/myapp.git
cd myapp

# 1. Environment variables. On Vercel these were in a dashboard; here they are a file.
nano .env
chmod 600 .env                   # only the ubuntu user may read it (Lesson 1)

# 2. Install exactly what the lockfile says, then build
pnpm install --frozen-lockfile
pnpm build

# 3. Run it once, in the foreground, to prove it works
pnpm start                       # Ctrl+C to stop`}
        />
        <p>A starter <code>.env</code> for now (the database arrives in Lesson 8):</p>
        <Script
          title=".env"
          code={`NODE_ENV=production
PORT=3000
# DATABASE_URL=postgresql://...     added in Lesson 8
# AWS credentials: deliberately NOT here. The IAM role provides them (Lesson 5).`}
        />
        <Callout kind="warn" label="Two .env traps that catch everyone once">
          <ul className="mb-0">
            <li>
              Variables starting with <code>NEXT_PUBLIC_</code> are baked into the JavaScript{" "}
              <strong>at build time</strong>. Change one and you must run <code>pnpm build</code>{" "}
              again; restarting is not enough.
            </li>
            <li>
              Never commit <code>.env</code>. If it is in Git already, treat every secret in it as
              leaked and rotate it.
            </li>
          </ul>
        </Callout>
        <h3>See it in your browser</h3>
        <p>
          The app listens on port 3000, but <code>web-sg</code> does not allow that port. Open it{" "}
          <strong>only to your own IP</strong>, temporarily — from your laptop:
        </p>
        <CommandList
          title="Temporary door for testing"
          commands={[
            { cmd: "aws ec2 authorize-security-group-ingress --group-id $WEB_SG --protocol tcp --port 3000 --cidr $(curl -s https://checkip.amazonaws.com)/32", note: "Now http://SERVER_IP:3000 works — but only from your IP" },
            { cmd: "aws ec2 revoke-security-group-ingress --group-id $WEB_SG --protocol tcp --port 3000 --cidr <YOUR-IP>/32", note: "Close it again after Lesson 10, when Nginx takes over ports 80/443. Port 3000 must never be public" },
          ]}
        />

        <h2 id="pm2">Keep it alive with PM2</h2>
        <p>
          <code>pnpm start</code> in your SSH session dies the moment you close the terminal. That
          is Lesson 1&apos;s problem returning: something other than your shell must own the
          process.
        </p>
        <Pm2Loop />
        <Script
          title="PM2 setup — one time"
          code={`sudo npm install -g pm2

pm2 start pnpm --name myapp -- start   # run "pnpm start" under PM2's supervision
pm2 status                             # online, uptime, restarts, memory
pm2 logs myapp                         # live logs (Ctrl+C leaves logs, not the app)

# The step people forget: make PM2 itself start on boot
pm2 startup systemd                    # PRINTS a "sudo env PATH=... pm2 startup ..." line
# → copy that printed line and run it
pm2 save                               # remember the current process list`}
        />
        <p>
          Prove it: run <code>sudo reboot</code>, wait a minute, log back in and check{" "}
          <code>pm2 status</code>. If <code>myapp</code> is online, it survives reboots. If not, you
          skipped <code>pm2 startup</code> or <code>pm2 save</code>.
        </p>
        <CommandList
          title="PM2 commands you will use weekly"
          commands={[
            { cmd: "pm2 restart myapp", note: "Stop and start (a few seconds of downtime)" },
            { cmd: "pm2 reload myapp", note: "Zero-downtime swap. Needs cluster mode: pm2 start ... -i max" },
            { cmd: "pm2 logs myapp --lines 200", note: "Last 200 lines. Errors are in ~/.pm2/logs/" },
            { cmd: "pm2 monit", note: "Live CPU/memory dashboard in the terminal" },
            { cmd: "pm2 delete myapp", note: "Remove it from PM2 entirely" },
          ]}
        />

        <h2 id="role">Prove the IAM role works</h2>
        <p>
          Lesson 5 promised that the server could call AWS <strong>without any access keys</strong>.
          Verify it — this is the payoff of the identity lesson:
        </p>
        <Script
          title="on the server"
          code={`aws sts get-caller-identity
# "Arn": "arn:aws:sts::123456789012:assumed-role/myapp-ec2-role/i-0abc..."
#                                    ^^^^^^^^^^^^ you are wearing the role, no keys anywhere

ls ~/.aws 2>/dev/null || echo "no credentials file — correct"

# Where do those temporary credentials come from? The metadata service, using IMDSv2:
TOKEN=$(curl -s -X PUT http://169.254.169.254/latest/api/token \\
  -H "X-aws-ec2-metadata-token-ttl-seconds: 60")
curl -s -H "X-aws-ec2-metadata-token: $TOKEN" \\
  http://169.254.169.254/latest/meta-data/iam/security-credentials/
# prints: myapp-ec2-role`}
        />
        <p>
          Those credentials rotate automatically every few hours. The AWS SDK inside your Node app
          fetches them the same way, which is why the S3 upload code in Lesson 5 needed no keys.
          Because the role only allows <code>s3:PutObject</code> and <code>s3:GetObject</code> on one
          bucket, even a completely compromised app cannot delete your database.
        </p>

        <h2 id="update">Deploying a new version</h2>
        <p>
          Now the loop you will repeat until Lesson 14 automates it. Put it in a script so you never
          skip a step at 11 p.m.:
        </p>
        <Script
          title="~/deploy.sh"
          code={`#!/usr/bin/env bash
set -euo pipefail              # stop at the first error; never deploy half a release

cd ~/myapp
git pull --ff-only             # refuse if history diverged
pnpm install --frozen-lockfile
pnpm build
pm2 reload myapp || pm2 start pnpm --name myapp -- start
pm2 save
echo "Deployed $(git rev-parse --short HEAD)"`}
        />
        <p>
          Run with <code>chmod +x ~/deploy.sh && ~/deploy.sh</code>. Notice what is wrong with this,
          because Lesson 14 fixes each item: the build runs <em>on the production server</em>{" "}
          (competing with live traffic), a failed build can leave the site broken, there is no easy
          rollback, and only people with SSH access can deploy.
        </p>

        <h2 id="storage">Disks, stop vs terminate, and the bill</h2>
        <h3>The disk</h3>
        <p>
          The root disk is an <strong>EBS volume</strong>: a network drive, billed per GB-month
          (about $0.10 per GB for gp3 in Mumbai, so 20 GB ≈ $2). It survives stopping the server. You
          can enlarge it later without downtime, but you can never shrink it. Watch it fill:
        </p>
        <CommandList
          title="Is the disk full?"
          commands={[
            { cmd: "df -h /", note: "Used and free space on the root disk. At 90%+, things start failing mysteriously" },
            { cmd: "sudo du -xh / --max-depth=2 2>/dev/null | sort -h | tail -15", note: "Find what is eating it. Usually logs, node_modules or old builds" },
            { cmd: "sudo journalctl --vacuum-time=7d", note: "Trim system logs older than a week" },
          ]}
        />
        <h3>Stop, terminate — and what each costs</h3>
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
            <strong>Stop</strong> the instance. A stopped t3.small costs about $2 a month (disk
            plus IP) instead of $16. Start it tomorrow: <code>aws ec2 start-instances
            --instance-ids $INSTANCE_ID</code>. The Elastic IP means your address does not change.
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
          New AWS accounts also get promotional credits and a free plan for the first six months;
          check the Billing console for what your account has. Assume nothing is free and keep the
          Lesson 5 budget alert on.
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
                  Stop powers the machine off; the EBS disk and Elastic IP remain and you keep paying
                  for them, but not for compute. Terminate destroys the instance and, by default,
                  its root disk. Terminate is irreversible.
                </p>
              ),
            },
            {
              q: "How does an application on EC2 call S3 securely?",
              a: (
                <p className="mb-0">
                  Attach an IAM role through an instance profile. The SDK fetches short-lived
                  credentials from the instance metadata service automatically. No access keys on
                  disk, and the permissions are scoped and expire.
                </p>
              ),
            },
            {
              q: "What is IMDSv2 and why enforce it?",
              a: (
                <p className="mb-0">
                  The instance metadata service (169.254.169.254) hands out the role credentials.
                  IMDSv2 requires a session token obtained with a PUT request, which blocks simple
                  server-side request forgery bugs from reading the credentials with one GET.
                </p>
              ),
            },
            {
              q: "Your instance’s public IP changed after a restart. Why and how do you fix it?",
              a: (
                <p className="mb-0">
                  Auto-assigned public IPs are released on stop and re-assigned on start. Associate
                  an Elastic IP, or better, put the servers behind a load balancer and point DNS at
                  that.
                </p>
              ),
            },
            {
              q: "The app works, then a reboot leaves the site down. What did you forget?",
              a: (
                <p className="mb-0">
                  Nothing brings the process back after boot. With PM2, run <code>pm2 startup</code>{" "}
                  and <code>pm2 save</code>; otherwise use a systemd service or run it in Docker
                  with a restart policy.
                </p>
              ),
            },
            {
              q: "On-demand, Reserved, Savings Plans, Spot — when is each right?",
              a: (
                <p className="mb-0">
                  On-demand for unpredictable or short use. Savings Plans / Reserved for steady
                  baseline load you will run for one to three years (roughly 30–70% cheaper). Spot
                  for interruptible, stateless work such as batch jobs and workers; AWS can reclaim
                  it with two minutes of notice.
                </p>
              ),
            },
            {
              q: "Why is running the build on the production server a bad idea?",
              a: (
                <p className="mb-0">
                  The build competes with live traffic for CPU and RAM, can fail halfway and leave a
                  broken release, is not reproducible, and gives no rollback. Build once in CI (or a
                  container image) and ship the artefact — Lessons 9 and 14.
                </p>
              ),
            },
          ]}
        />

        <hr />

        <h2 id="practice">Practice task before Lesson 8</h2>
        <ol>
          <li>
            Launch the server and deploy your Next.js app with the commands above. Open{" "}
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
            Kill the app on purpose: <code>pm2 stop myapp</code>, then <code>kill -9</code> its
            process ID when running. Watch PM2 restart it. Check <code>pm2 status</code> for the
            restart counter.
          </li>
          <li>
            Add a page to your app, push, and run <code>~/deploy.sh</code>. Time how long the site
            was unavailable, if at all. Write down two ways this process could go wrong.
          </li>
          <li>
            When you are done for the day, stop the instance from the CLI. Start it tomorrow and
            confirm the IP is unchanged.
          </li>
        </ol>
        <Callout kind="ok" label="Optional stretch">
          <p className="mb-0">
            Change the <code>web-sg</code> SSH rule to a different (wrong) IP and try to log in.
            Watch it hang. Then fix it. Feeling what a Security Group block looks like from the
            outside makes every later &ldquo;timeout&rdquo; easy to recognise.
          </p>
        </Callout>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          You now have a real server running your real app, and you know exactly which parts of a
          Vercel deploy that replaced.
        </p>
        <ul>
          <li>
            <strong>EC2</strong> = a rented Linux computer. You choose the image, the size, the
            disk and the network.
          </li>
          <li>
            <strong>Security defaults that cost nothing</strong>: encrypted disk, IMDSv2 required,
            SSH only from your IP, an IAM role instead of keys, a read-only deploy key.
          </li>
          <li>
            <strong>Process supervision is not optional</strong>: PM2 plus <code>startup</code> and{" "}
            <code>save</code> so the app survives crashes and reboots.
          </li>
          <li>
            <strong>Stop, do not forget</strong>: a running instance bills every second; a stopped
            one costs only its disk and IP.
          </li>
          <li>
            <strong>The manual deploy is the blueprint</strong> for every automation to come:
            Docker (Lesson 9), CI/CD (14), Terraform (15).
          </li>
        </ul>
        <p>
          The app is running, but it has nowhere to keep data. Next: a managed PostgreSQL database
          that lives safely in the private subnet.
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
