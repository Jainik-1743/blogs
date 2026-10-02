import type { Metadata } from "next";
import Callout from "@/components/Callout";
import CommandList from "@/components/CommandList";
import DeployPipeline from "@/components/figures/DeployPipeline";
import InterviewQA from "@/components/InterviewQA";
import LessonIntro from "@/components/LessonIntro";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { getLesson } from "@/lib/lessons";

const lesson = getLesson("lesson-9")!;

export const metadata: Metadata = {
  title: `Lesson 9 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Concept: ship the whole box, not just the code" },
  { id: "why-this-matters", label: "Why this matters" },
  { id: "vocabulary", label: "Image, container, registry — the three words" },
  { id: "vs-vm", label: "Container vs virtual machine" },
  { id: "install", label: "Install Docker" },
  { id: "first", label: "Your first containers" },
  { id: "layers", label: "Layers and the build cache" },
  { id: "dockerfile", label: "A production Dockerfile for Next.js" },
  { id: "run", label: "Build it and run it" },
  { id: "config", label: "Config, secrets, ports and data" },
  { id: "compose", label: "Docker Compose — the whole stack in one file" },
  { id: "ec2", label: "Run it on EC2" },
  { id: "ecr", label: "Registries and ECR" },
  { id: "debugging", label: "Debugging containers" },
  { id: "mistakes", label: "Ten mistakes to skip" },
  { id: "interview", label: "Interview corner" },
  { id: "practice", label: "Practice task before Lesson 10" },
  { id: "conclusion", label: "Conclusion" },
];

const words: [string, string, string][] = [
  ["Image", "A frozen, read-only package: your code + Node + libraries + settings. Built once.", "A recipe card plus all the ingredients, sealed in a box"],
  ["Container", "A running instance of an image. Start ten from one image, get ten identical processes.", "A dish cooked from that box"],
  ["Registry", "A server that stores images so other machines can download them.", "The warehouse: Docker Hub, GitHub Container Registry, AWS ECR"],
  ["Dockerfile", "The text file of instructions to build an image.", "The recipe"],
  ["Volume", "A folder that lives outside the container and survives it being deleted.", "A fridge the dish cannot throw away"],
];

const vs: [string, string, string][] = [
  ["Contains", "Your app + its libraries", "A whole operating system + your app"],
  ["Size", "Tens to hundreds of MB", "Gigabytes"],
  ["Starts in", "Under a second", "Tens of seconds to minutes"],
  ["Isolation", "Shares the host’s kernel; process-level walls", "Own kernel; hardware-level walls"],
  ["Density", "Dozens per machine", "A handful per machine"],
  ["An EC2 instance is", "—", "A virtual machine. Containers run inside it"],
];

const mistakes: [string, string][] = [
  ["Using the :latest tag in production", "You cannot tell which version is running or roll back. Tag with the Git commit SHA."],
  ["Running as root inside the container", "A break-out has full power. Add a USER line with a normal user."],
  ["Copying .env or .git into the image", "Secrets baked into a layer are readable by anyone who pulls it. Use .dockerignore and runtime env."],
  ["COPY . . before npm install", "Every code change reinstalls all dependencies. Copy the lockfile first."],
  ["Storing uploads or databases inside the container", "It is deleted with the container. Use volumes, S3 or RDS."],
  ["One giant image with Node, build tools and source", "Slow, large and exposes more. Use a multi-stage build."],
  ["Forgetting the restart policy", "A crash or a reboot leaves the site down. Use --restart unless-stopped."],
  ["Binding the app to 127.0.0.1 inside the container", "Nothing outside can connect. Bind to 0.0.0.0."],
  ["Using localhost as the database host in Compose", "localhost inside a container is the container itself. Use the service name."],
  ["Never pruning", "Old images fill the 20 GB disk. docker system prune on a schedule."],
];

export default function LessonNinePage() {
  return (
    <article>
      <LessonIntro lesson={lesson} outline={outline} />

      <div className="lesson">
        <h2 id="concept">Concept</h2>
        <p>
          <strong>Docker</strong> packages your application together with everything it needs to run
          — the exact Node version, the libraries, the system tools, the start command — into a
          single <strong>image</strong>. Any computer with Docker can run that image and get{" "}
          <strong>exactly the same behaviour</strong>: your laptop, your teammate&apos;s Windows PC,
          a CI server, an EC2 instance.
        </p>
        <Callout kind="note" label="The analogy — the shipping container">
          <p className="mb-0">
            Before standard shipping containers, every cargo was loaded differently for every ship
            and port. Then the industry agreed on one box: any crane, ship or truck can move it
            without caring what is inside. Docker is that box for software. The server does not care
            whether the app inside is Node, Python or Java — it just runs the box.
          </p>
        </Callout>

        <h2 id="why-this-matters">Why this matters</h2>
        <p>
          In Lesson 7 you set up a server by hand: install Node, clone, build, PM2. It worked — but
          look at what you created: <strong>a server that only you know how to rebuild</strong>.
        </p>
        <ul>
          <li>
            <strong>&ldquo;Works on my machine.&rdquo;</strong> Your laptop has Node 22.3, the
            server has 22.11, and a native module behaves differently. Docker removes the
            difference: the same image everywhere.
          </li>
          <li>
            <strong>Slow, error-prone setup.</strong> A new server means repeating 20 manual steps.
            With Docker the steps are written once, in the Dockerfile.
          </li>
          <li>
            <strong>Auto Scaling needs it.</strong> Lesson 12 creates servers automatically when
            traffic rises. A fresh server must become ready with zero human steps — &ldquo;install
            Docker, pull image, run&rdquo; is three commands.
          </li>
          <li>
            <strong>Easy rollback.</strong> Every release is an image with a version. Rolling back
            is running the previous tag.
          </li>
          <li>
            <strong>Build once, ship the artefact.</strong> The build happens in CI, not on the
            production server that is trying to serve customers.
          </li>
        </ul>
        <DeployPipeline />

        <h2 id="vocabulary">Image, container, registry — the three words</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Word</th>
                <th>What it is</th>
                <th>Think of it as</th>
              </tr>
            </thead>
            <tbody>
              {words.map(([w, what, like]) => (
                <tr key={w}>
                  <td className="whitespace-nowrap"><strong>{w}</strong></td>
                  <td>{what}</td>
                  <td>{like}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          The relationship, the one to burn in: <strong>Dockerfile → (build) → Image → (run) →
          Container</strong>. And images travel between machines through a registry: build once,{" "}
          <em>push</em>, then <em>pull</em> anywhere.
        </p>

        <h2 id="vs-vm">Container vs virtual machine</h2>
        <p>
          Your EC2 instance <em>is</em> a virtual machine: a whole pretend computer with its own
          operating system. Containers are lighter: they share the host&apos;s operating-system
          kernel and only isolate the <em>process</em> and its files.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Container</th>
                <th>Virtual machine (EC2)</th>
              </tr>
            </thead>
            <tbody>
              {vs.map(([k, c, v]) => (
                <tr key={k}>
                  <td><strong>{k}</strong></td>
                  <td>{c}</td>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          They stack, they do not compete: <strong>containers run on top of EC2</strong>. AWS also
          offers services that run containers for you (ECS, EKS, App Runner — see Lesson 19), but
          the skill of writing a good image is identical.
        </p>

        <h2 id="install">Install Docker</h2>
        <h3>On your laptop</h3>
        <p>
          Install <strong>Docker Desktop</strong> (Mac, Windows) or Docker Engine (Linux). On
          Windows use the WSL 2 backend from Lesson 1. Then check it works:
        </p>
        <CommandList
          title="Laptop"
          commands={[
            { cmd: "docker run hello-world", note: "Downloads a tiny image and runs it. “Hello from Docker!” means everything works end to end" },
          ]}
        />
        <h3>On the Ubuntu EC2 server</h3>
        <p>
          Follow Docker&apos;s own &ldquo;Install Docker Engine on Ubuntu&rdquo; page: it adds
          Docker&apos;s signed package repository, then installs the engine plus the Compose
          plugin. Afterwards, add the <code>ubuntu</code> user to the <code>docker</code> group so
          you don&apos;t need <code>sudo</code> each time, and log out and back in.
        </p>
        <Callout kind="warn" label="Membership of the docker group equals root">
          <p className="mb-0">
            Anyone who can run <code>docker</code> can mount the host&apos;s filesystem and become
            root. Add only trusted admins to that group, exactly as you would to{" "}
            <code>sudo</code> (Lesson 1).
          </p>
        </Callout>

        <h2 id="first">Your first containers</h2>
        <CommandList
          title="Your first container"
          commands={[
            { cmd: "docker run -d --name web -p 8080:80 nginx", note: "Download the official nginx image, start it in the background (-d), and map laptop port 8080 → container port 80. Visit http://localhost:8080" },
          ]}
        />
        <p>
          From there the verbs are what you would guess: list running containers, follow one
          container&apos;s logs (that is where app output goes), open a shell inside it, stop it,
          remove it. Removing a container leaves its image on disk for next time.
        </p>
        <p>
          <strong>Port mapping</strong> deserves a sentence, because it confuses everyone once:{" "}
          <code>-p 8080:80</code> means <em>host port : container port</em>. The container has its
          own private network; without <code>-p</code>, nothing outside can reach it. The number on
          the <em>left</em> is the door on your machine that a visitor uses.
        </p>

        <h2 id="layers">Layers and the build cache</h2>
        <p>
          An image is a stack of <strong>layers</strong>, one per Dockerfile instruction. Docker
          caches each layer and reuses it if the instruction and everything before it are unchanged.
          This one fact explains most Dockerfile advice.
        </p>
        <Script
          title="The order of instructions decides your build time"
          code={`# SLOW: any code change invalidates the COPY, so npm install re-runs every time
COPY . .
RUN npm install

# FAST: dependencies change rarely, code changes constantly — put the rarely-changing thing first
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile     # cached until the lockfile changes
COPY . .                               # only this layer rebuilds on a code change`}
        />
        <p>
          Rule: <strong>put what changes least at the top, what changes most at the bottom.</strong>{" "}
          A cached rebuild takes seconds; an uncached one takes minutes.
        </p>

        <h2 id="dockerfile">A production Dockerfile for Next.js</h2>
        <p>
          First enable Next.js&apos;s <strong>standalone output</strong>, which traces exactly which
          files the server needs and copies only those (typically shrinking the image from 1 GB to
          about 150 MB):
        </p>
        <Script
          title="next.config.ts"
          code={`import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;`}
        />
        <p>Now the Dockerfile — a <strong>multi-stage build</strong>, read top to bottom:</p>
        <Script
          title="Dockerfile"
          code={`# ---------- Stage 1: install dependencies ----------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# ---------- Stage 2: build the app ----------
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm build

# ---------- Stage 3: the small image we actually ship ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \\
    PORT=3000 \\
    HOSTNAME=0.0.0.0

# A normal user, not root
RUN addgroup -S app && adduser -S app -G app

# Copy ONLY the output. No source, no dev dependencies, no build tools.
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public

USER app
EXPOSE 3000
CMD ["node", "server.js"]`}
        />
        <h3>Reading it line by line</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Instruction</th>
                <th>Why it is there</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>FROM node:22-alpine AS deps</code></td>
                <td>Start from an official image with Node 22 on Alpine Linux (tiny, ~50 MB). <code>AS</code> names the stage so later stages can copy from it. Pin the same major version you use locally.</td>
              </tr>
              <tr>
                <td><code>COPY package.json pnpm-lock.yaml</code> then <code>RUN pnpm install --frozen-lockfile</code></td>
                <td>The cache trick above. <code>--frozen-lockfile</code> fails instead of silently changing versions.</td>
              </tr>
              <tr>
                <td>Three <code>FROM</code>s (multi-stage)</td>
                <td>Each stage is thrown away except the last. Compilers, dev dependencies and source never reach the shipped image: smaller and safer.</td>
              </tr>
              <tr>
                <td><code>ENV HOSTNAME=0.0.0.0</code></td>
                <td>Makes the server listen on all interfaces. Without it the standalone server can bind to the container&apos;s own loopback and be unreachable.</td>
              </tr>
              <tr>
                <td><code>adduser</code> + <code>USER app</code></td>
                <td>The process runs unprivileged. If someone exploits the app, they are not root in the container.</td>
              </tr>
              <tr>
                <td><code>EXPOSE 3000</code></td>
                <td>Documentation only. It does <em>not</em> publish the port — <code>-p</code> does.</td>
              </tr>
              <tr>
                <td><code>CMD [&quot;node&quot;, &quot;server.js&quot;]</code></td>
                <td>The command that runs when a container starts. The array form runs Node as PID 1 so it receives stop signals properly.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3>The .dockerignore file — do not skip it</h3>
        <p>
          <code>COPY . .</code> copies everything in the folder. <code>.dockerignore</code> tells
          Docker what to leave out. Without it, your <code>.env</code> secrets, your{" "}
          <code>.git</code> history and a 1 GB local <code>node_modules</code> go into the build.
        </p>
        <Script
          title=".dockerignore"
          code={`node_modules
.next
.git
.env*
*.pem`}
        />

        <h2 id="run">Build it and run it</h2>
        <CommandList
          title="On your laptop"
          commands={[
            { cmd: "docker build -t myapp:dev .", note: "Build an image named myapp, tag dev, from the Dockerfile here. First build is slow; the cached second one takes seconds. Expect roughly 150–250 MB" },
            { cmd: "docker run --rm -p 3000:3000 --env-file .env.local myapp:dev", note: "Run it, loading variables at run time. --rm deletes the container on exit. Visit http://localhost:3000" },
          ]}
        />
        <Callout kind="note" label="Build-time vs run-time variables">
          <p className="mb-0">
            <code>NEXT_PUBLIC_*</code> variables are baked into the JavaScript during{" "}
            <code>pnpm build</code>, so inside Docker they must be supplied at <em>build</em> time
            (<code>ARG NEXT_PUBLIC_API_URL</code> then <code>docker build --build-arg …</code>).
            Everything else (database URL, secrets) is read at <em>run</em> time and must never be in
            the image.
          </p>
        </Callout>

        <h2 id="config">Config, secrets, ports and data</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Need</th>
                <th>Do this</th>
                <th>Not this</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Database URL, API keys</td>
                <td><code>--env-file</code> or <code>-e</code> at run time (or fetched from SSM/Secrets Manager — Lesson 18)</td>
                <td><code>COPY .env</code> or <code>ENV SECRET=…</code> in the Dockerfile</td>
              </tr>
              <tr>
                <td>AWS permissions</td>
                <td>The instance&apos;s IAM role — containers inherit it automatically</td>
                <td>Access keys inside the image</td>
              </tr>
              <tr>
                <td>User uploads, files</td>
                <td>S3 (Lesson 11)</td>
                <td>A folder inside the container</td>
              </tr>
              <tr>
                <td>Database files</td>
                <td>RDS (Lesson 8), or a named volume for local dev</td>
                <td>The container&apos;s own filesystem</td>
              </tr>
              <tr>
                <td>Logs</td>
                <td>Write to stdout/stderr; Docker and CloudWatch collect them</td>
                <td>Log files inside the container</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout kind="warn" label="Anything in an image layer is public to whoever can pull it">
          <p className="mb-0">
            Deleting a secret in a later Dockerfile line does <strong>not</strong> remove it — it
            still exists in the earlier layer. If a secret ever entered an image, rotate the secret;
            do not just rebuild.
          </p>
        </Callout>

        <h2 id="compose">Docker Compose — the whole stack in one file</h2>
        <p>
          Real apps are several containers: the app, a database, later Redis. <strong>Docker
          Compose</strong> describes them all in one file and starts them with one command. It is
          the standard tool for local development and for simple single-server setups.
        </p>
        <Script
          title="docker-compose.yml — local development"
          code={`services:
  app:
    build: .
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgresql://appuser:devpass@db:5432/myapp   # host is the SERVICE NAME "db"
    depends_on: [db]

  db:
    image: postgres:16
    environment: { POSTGRES_USER: appuser, POSTGRES_PASSWORD: devpass, POSTGRES_DB: myapp }
    volumes: [pgdata:/var/lib/postgresql/data]   # data survives \`docker compose down\`

volumes:
  pgdata:`}
        />
        <p>
          <code>docker compose up -d</code> builds and starts everything in the background;{" "}
          <code>docker compose down</code> stops and removes the containers but keeps the data
          volume (add <code>-v</code> to delete the data too).
        </p>
        <Callout kind="note" label="Why “db” works as a hostname">
          <p className="mb-0">
            Compose creates a private network for the project and gives each service a DNS name equal
            to its service name. From <code>app</code>, the host <code>db</code> resolves to the
            database container. That is also why <code>localhost</code> would be wrong: inside the{" "}
            <code>app</code> container, localhost is <code>app</code> itself.
          </p>
        </Callout>
        <p>
          <strong>In production, do not put the database in Compose.</strong> Use RDS (Lesson 8) and
          set <code>DATABASE_URL</code> to its endpoint. The dev compose file above mirrors production
          closely enough to catch mistakes, without the cost.
        </p>

        <h2 id="ec2">Run it on EC2</h2>
        <p>
          Here is where Lesson 7&apos;s twenty manual steps collapse. On the server, once Docker is
          installed, deploying is <em>pull and run</em>. (We copy the image over by hand this time;
          the next section uses a registry, which is the real answer.)
        </p>
        <p>
          Put the production variables in <code>~/myapp.env</code> on the server (set to{" "}
          <code>600</code>, never in Git, never in the image), then:
        </p>
        <Script
          title="on the server"
          code={`docker run -d --name myapp \\
  --restart unless-stopped \\
  --env-file ~/myapp.env \\
  -p 127.0.0.1:3000:3000 \\
  --memory 1g \\
  --log-opt max-size=10m --log-opt max-file=3 \\
  myapp:1.0.0`}
        />
        <p>Each flag earns its place:</p>
        <ul>
          <li>
            <code>--restart unless-stopped</code> replaces PM2: Docker restarts the container after a
            crash and after a reboot.
          </li>
          <li>
            <code>-p 127.0.0.1:3000:3000</code> publishes the port <strong>only on the
            server&apos;s loopback</strong>. Nginx (Lesson 10) reaches it; the internet cannot.
            Compare that with plain <code>-p 3000:3000</code>, which listens on every interface —
            and note Docker edits the firewall itself, so it can be reachable even when you thought
            a rule blocked it.
          </li>
          <li>
            <code>--memory 1g</code> caps memory so a leak restarts one container instead of
            starving the whole server.
          </li>
          <li>
            <code>--log-opt max-size</code> stops the JSON logs from silently filling the disk — a
            classic outage.
          </li>
        </ul>

        <Callout kind="warn" label="If the container cannot find AWS credentials">
          <p className="mb-0">
            The instance metadata service (Lesson 7) answers only a limited number of network hops.
            A container is one hop further than the host, so with the default limit of 1 the AWS SDK
            inside the container fails with &ldquo;could not load credentials&rdquo; even though the
            host works. Raise it once to 2, keeping IMDSv2 required: EC2 → your instance → Actions
            → Instance settings → <strong>Modify instance metadata options</strong>.
          </p>
        </Callout>

        <h2 id="ecr">Registries and ECR</h2>
        <p>
          &ldquo;Copy the image to the server&rdquo; does not scale. A registry is the standard
          hand-off: CI pushes an image, every server pulls it. AWS&apos;s own is{" "}
          <strong>ECR</strong> (Elastic Container Registry): private by default, integrated with IAM,
          and free to pull from inside the same region.
        </p>
        <p>The flow has three steps, from your laptop or (later) from CI:</p>
        <ol>
          <li>
            Create a private repository in ECR named <code>myapp</code>, with{" "}
            <strong>scan on push</strong> turned on so every image is checked for known
            vulnerabilities.
          </li>
          <li>Log Docker in to ECR with a temporary token from the AWS CLI (it lasts 12 hours).</li>
          <li>
            Build the image, tag it with the Git commit (<code>myapp:a1b2c3d</code>), and push.
          </li>
        </ol>
        <p>
          You don&apos;t need to memorise the exact commands: the ECR console&apos;s{" "}
          <strong>View push commands</strong> button shows them, filled in with your account and
          region.
        </p>
        <p>
          On the server, the <em>role</em> from Lesson 5 needs permission to pull. Attach the AWS
          managed policy <code>AmazonEC2ContainerRegistryReadOnly</code> to{" "}
          <code>myapp-ec2-role</code>; the server then logs in and pulls the same way, with no
          keys — the role is used.
        </p>
        <Callout kind="ok" label="Tag with the commit SHA, never rely on latest">
          <p className="mb-0">
            <code>myapp:latest</code> is a moving label. Two servers pulling &ldquo;latest&rdquo; an
            hour apart can run different code, and you can never say what production is running.{" "}
            <code>myapp:a1b2c3d</code> always points to one exact build, is instantly traceable to a
            commit, and rollback is running the previous SHA. Add an ECR lifecycle rule to expire
            old images so storage (about $0.10 per GB-month) does not grow forever.
          </p>
        </Callout>

        <h2 id="debugging">Debugging containers</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Problem</th>
                <th>First command</th>
                <th>What to look for</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Container exits immediately</td>
                <td><code>docker ps -a</code> then <code>docker logs myapp</code></td>
                <td>Exit code and the last error. Exit 1 = app crashed; 137 = killed for memory</td>
              </tr>
              <tr>
                <td>Cannot reach it from the browser</td>
                <td><code>docker port myapp</code> and <code>ss -tlnp</code></td>
                <td>Is the port published? Is the app bound to 0.0.0.0, not 127.0.0.1?</td>
              </tr>
              <tr>
                <td>Env var missing or wrong</td>
                <td><code>docker exec myapp env</code></td>
                <td>The real environment the process sees</td>
              </tr>
              <tr>
                <td>Cannot reach RDS or another service</td>
                <td><code>docker exec -it myapp sh</code> then <code>wget -qO- host:port</code></td>
                <td>Test the network from the container&apos;s point of view</td>
              </tr>
              <tr>
                <td>Disk full</td>
                <td><code>docker system df</code></td>
                <td>Images, build cache and container logs. Clean with <code>docker system prune -a</code></td>
              </tr>
              <tr>
                <td>Image too big</td>
                <td><code>docker history --no-trunc</code></td>
                <td>Which layer added hundreds of MB</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout kind="warn" label="docker exec edits do not last">
          <p className="mb-0">
            If you fix something by shelling into a container, that fix disappears the next time the
            container is replaced. Containers are disposable. Make the fix in the Dockerfile or the
            config, rebuild, redeploy. This is the mindset shift from Lesson 7&apos;s pet server to
            cattle.
          </p>
        </Callout>

        <h2 id="mistakes">Ten mistakes to skip</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mistake</th>
                <th>Why it hurts / the fix</th>
              </tr>
            </thead>
            <tbody>
              {mistakes.map(([m, why]) => (
                <tr key={m}>
                  <td><strong>{m}</strong></td>
                  <td>{why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 id="interview">Interview corner</h2>
        <InterviewQA
          items={[
            {
              q: "What is the difference between an image and a container?",
              a: (
                <p className="mb-0">
                  An image is an immutable, layered template. A container is a running (or stopped)
                  instance of an image with a thin writable layer on top. Many containers can start
                  from one image.
                </p>
              ),
            },
            {
              q: "How is a container different from a virtual machine?",
              a: (
                <p className="mb-0">
                  A VM virtualises hardware and runs its own kernel; a container shares the host
                  kernel and isolates processes using namespaces and cgroups. Containers are
                  smaller, start in milliseconds and pack more densely, with weaker isolation.
                </p>
              ),
            },
            {
              q: "Why order Dockerfile instructions the way we did?",
              a: (
                <p className="mb-0">
                  Layer caching: an unchanged instruction and everything above it is reused. Copy
                  dependency manifests and install first, copy source last, so a code edit does not
                  reinstall dependencies.
                </p>
              ),
            },
            {
              q: "What is a multi-stage build and why use one?",
              a: (
                <p className="mb-0">
                  Several <code>FROM</code> stages in one Dockerfile; only the last becomes the
                  image. Build tools, dev dependencies and source stay in earlier stages, producing a
                  smaller, safer runtime image.
                </p>
              ),
            },
            {
              q: "How do you handle secrets with Docker?",
              a: (
                <p className="mb-0">
                  Never bake them into the image. Inject at run time via environment variables or
                  files from a secret store (SSM Parameter Store, Secrets Manager), and use the
                  instance/task IAM role for AWS access. If one leaks into a layer, rotate it.
                </p>
              ),
            },
            {
              q: "Your container keeps restarting. Walk me through it.",
              a: (
                <p className="mb-0">
                  <code>docker ps -a</code> for exit code and restart count; <code>docker logs</code>{" "}
                  for the error; exit 137 suggests out-of-memory (raise the limit or fix the leak);
                  check env vars with <code>docker exec … env</code>; run the same image
                  interactively to reproduce.
                </p>
              ),
            },
            {
              q: "Why not tag production images :latest?",
              a: (
                <p className="mb-0">
                  It is mutable, so you cannot identify what is deployed, servers can diverge, and
                  rollback is ambiguous. Immutable tags (commit SHA or semantic version) make
                  deployments traceable and reversible.
                </p>
              ),
            },
          ]}
        />

        <hr />

        <h2 id="practice">Practice task before Lesson 10</h2>
        <ol>
          <li>
            Add <code>output: &quot;standalone&quot;</code>, the Dockerfile and{" "}
            <code>.dockerignore</code> to your Next.js repo. Build it and run it locally. Note the
            image size.
          </li>
          <li>
            Change one line of source, rebuild, and watch which steps say <code>CACHED</code>. Now
            change a dependency and see the difference.
          </li>
          <li>
            Write a <code>docker-compose.yml</code> with your app and Postgres. Run the app, create
            a row, run <code>docker compose down</code> then <code>up</code> and confirm the row
            survived. Then run <code>down -v</code> and confirm it did not.
          </li>
          <li>
            Create the ECR repository, push an image tagged with your Git SHA, and confirm it in
            the console. Read the scan results.
          </li>
          <li>
            On the EC2 server: install Docker, remove the app from PM2,
            pull your image and run it with the flags from this lesson. Confirm it survives{" "}
            <code>sudo reboot</code>.
          </li>
          <li>
            Explain in two sentences why <code>-p 127.0.0.1:3000:3000</code> is safer than{" "}
            <code>-p 3000:3000</code>.
          </li>
        </ol>
        <Callout kind="ok" label="Optional stretch">
          <p className="mb-0">
            Run <code>docker scout quickview myapp:dev</code> (or <code>trivy image myapp:dev</code>)
            to scan for known vulnerabilities. Try switching the base image from{" "}
            <code>node:22-alpine</code> to <code>node:22-slim</code> and compare size and findings.
          </p>
        </Callout>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          Docker turns &ldquo;a server only you can rebuild&rdquo; into &ldquo;an image anyone can
          run&rdquo;. It is the hinge between the manual world of Lesson 7 and the automated world
          of Lessons 12–15.
        </p>
        <ul>
          <li>
            <strong>Dockerfile → image → container.</strong> Registry to move images between
            machines.
          </li>
          <li>
            <strong>Layer order = build speed.</strong> Lockfile and install first, source last.
          </li>
          <li>
            <strong>Ship small and safe</strong>: multi-stage build, standalone output, non-root
            user, a real <code>.dockerignore</code>.
          </li>
          <li>
            <strong>Config at run time, never in the image.</strong> Secrets from the environment or
            a secret store; AWS access from the IAM role.
          </li>
          <li>
            <strong>Containers are disposable.</strong> State lives in RDS and S3; fixes go into the
            Dockerfile; tags are commit SHAs.
          </li>
        </ul>
        <p>
          The app now runs in a container listening on a private port. Next we put a proper
          receptionist in front of it: Nginx.
        </p>

        <hr />
        <p>
          End of Lesson 9. Next: <strong>Lesson 10 — Nginx: Reverse Proxy</strong>.
        </p>
      </div>

      <LessonPager slug={lesson.slug} />
    </article>
  );
}
