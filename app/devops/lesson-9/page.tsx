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
  ["Image", "A read-only package that holds your code, Node, libraries and settings. You build it once and it never changes.", "A recipe card plus all the ingredients, sealed in a box"],
  ["Container", "A running copy of an image. Start ten containers from one image and you get ten identical running programs.", "A dish cooked from that box"],
  ["Registry", "A server that stores images, so that other machines can download them.", "The warehouse: Docker Hub, GitHub Container Registry, AWS ECR"],
  ["Dockerfile", "A text file with the steps to build an image.", "The recipe"],
  ["Volume", "A folder that lives outside the container, so the data stays even if the container is deleted.", "A fridge that stays when the dish is thrown away"],
];

const vs: [string, string, string][] = [
  ["Contains", "Your app and its libraries", "A whole operating system and your app"],
  ["Size", "Tens to hundreds of MB", "Gigabytes"],
  ["Starts in", "Under a second", "Tens of seconds to minutes"],
  ["Isolation", "Shares the host’s kernel (the core of the operating system). Walls are at process level", "Has its own kernel. Walls are at hardware level"],
  ["Density", "Dozens per machine", "A few per machine"],
  ["An EC2 instance is", "—", "A virtual machine. Containers run inside it"],
];

const mistakes: [string, string][] = [
  ["Using the :latest tag in production", "You cannot tell which version is running, and you cannot roll back. Tag with the Git commit SHA (the short ID of a commit)."],
  ["Running as root inside the container", "If an attacker breaks out, they have full power. Add a USER line with a normal user."],
  ["Copying .env or .git into the image", "Secrets inside a layer can be read by anyone who pulls the image. Use .dockerignore and pass variables at run time."],
  ["COPY . . before npm install", "Every code change reinstalls all dependencies. Copy the lockfile first."],
  ["Storing uploads or databases inside the container", "They are deleted with the container. Use volumes, S3 or RDS."],
  ["One giant image with Node, build tools and source", "It is slow, large and has more to attack. Use a multi-stage build."],
  ["Forgetting the restart policy", "A crash or a reboot leaves the site down. Use --restart unless-stopped."],
  ["Binding the app to 127.0.0.1 inside the container", "Nothing outside the container can connect. Bind to 0.0.0.0."],
  ["Using localhost as the database host in Compose", "Inside a container, localhost means the container itself. Use the service name."],
  ["Never pruning", "Old images fill the 20 GB disk. Run docker system prune on a schedule."],
];

export default function LessonNinePage() {
  return (
    <article>
      <LessonIntro lesson={lesson} outline={outline} />

      <div className="lesson">
        <h2 id="concept">Concept</h2>
        <p>
          <strong>Docker</strong> is a tool that packs your application and everything it needs
          into one package called an <strong>image</strong>. That includes the exact Node version,
          the libraries, the system tools and the start command. Any computer with Docker can run
          the image and get <strong>exactly the same behaviour</strong>. This works on your laptop,
          your teammate&apos;s Windows PC, a CI server (a machine that builds and tests your code
          automatically) and an EC2 instance.
        </p>
        <Callout kind="note" label="The analogy — the shipping container">
          <p className="mb-0">
            Before standard shipping containers, every cargo was loaded in a different way for
            every ship and port. Then the industry agreed on one standard box. Any crane, ship or
            truck can move it without knowing what is inside. Docker is that box for software. The
            server does not care whether the app inside is Node, Python or Java. It just runs the
            box.
          </p>
        </Callout>

        <h2 id="why-this-matters">Why this matters</h2>
        <p>
          In Lesson 7 you set up a server by hand: install Node, clone, build, PM2. It worked. But
          look at what you made: <strong>a server that only you know how to rebuild</strong>.
        </p>
        <ul>
          <li>
            <strong>&ldquo;Works on my machine.&rdquo;</strong> Your laptop has Node 22.3 and the
            server has 22.11, so a native module (code written in C or C++ that Node loads) behaves
            differently. Docker removes the difference: the same image runs everywhere.
          </li>
          <li>
            <strong>Slow setup with many mistakes.</strong> A new server means repeating 20 manual
            steps. With Docker you write the steps once, in the Dockerfile.
          </li>
          <li>
            <strong>Auto Scaling needs it.</strong> Lesson 12 creates servers automatically when
            traffic grows. A new server must be ready with no human steps. &ldquo;Install Docker,
            pull the image, run it&rdquo; is only three commands.
          </li>
          <li>
            <strong>Easy rollback.</strong> Every release is an image with a version. To roll back
            (go back to the old version), you run the previous tag.
          </li>
          <li>
            <strong>Build once, ship the result.</strong> The build happens in CI, not on the
            production server that is busy serving customers.
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
          Remember this chain: <strong>Dockerfile → (build) → Image → (run) → Container</strong>.
          In one line: an image is the frozen package, and a container is that package running.
          Images move between machines through a registry. Build once, <em>push</em> the image to
          the registry, then <em>pull</em> it on any machine.
        </p>
        <p>
          A <strong>tag</strong> is a label on an image, such as <code>myapp:1.0.0</code>. The part
          before the colon is the name, and the part after it is the version.
        </p>

        <h2 id="vs-vm">Container vs virtual machine</h2>
        <p>
          A <strong>virtual machine</strong> (VM) is a whole pretend computer, with its own
          operating system, running on real hardware. Your EC2 instance <em>is</em> a virtual
          machine. A <strong>container</strong> is lighter. It shares the host&apos;s
          operating-system kernel and only separates a <em>process</em> and its files from the
          others.
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
          They work together, not against each other: <strong>containers run on top of EC2</strong>.
          AWS also has services that run containers for you (ECS, EKS and App Runner; see Lesson
          19). Writing a good image is the same skill for all of them.
        </p>

        <h2 id="install">Install Docker</h2>
        <h3>On your laptop</h3>
        <p>
          Install <strong>Docker Desktop</strong> (Mac, Windows) or Docker Engine (Linux). Docker
          Engine is the background program that builds and runs containers. On Windows, use the
          WSL 2 backend (Linux inside Windows) from Lesson 1. Then check that it works:
        </p>
        <CommandList
          title="Laptop"
          commands={[
            { cmd: "docker run hello-world", note: "Downloads a tiny image and runs it. The message “Hello from Docker!” means that everything works" },
          ]}
        />
        <h3>On the Ubuntu EC2 server</h3>
        <p>
          Follow Docker&apos;s own &ldquo;Install Docker Engine on Ubuntu&rdquo; page. It adds
          Docker&apos;s signed package source, then installs the engine and the Compose plugin.
          Afterwards, add the <code>ubuntu</code> user to the <code>docker</code> group, so that
          you do not need <code>sudo</code> each time. Then log out and log in again.
        </p>
        <Callout kind="warn" label="Membership of the docker group equals root">
          <p className="mb-0">
            Anyone who can run <code>docker</code> can attach the host&apos;s files to a container
            and become root. Add only trusted admins to that group, as you would for{" "}
            <code>sudo</code> (Lesson 1).
          </p>
        </Callout>

        <h2 id="first">Your first containers</h2>
        <CommandList
          title="Your first container"
          commands={[
            { cmd: "docker run -d --name web -p 8080:80 nginx", note: "Download the official nginx image (nginx is a web server), start it in the background (-d), and connect laptop port 8080 to container port 80. Visit http://localhost:8080" },
          ]}
        />
        <p>
          The other commands are easy to guess. You can list running containers (<code>docker
          ps</code>), follow a container&apos;s logs (<code>docker logs</code>, where the app&apos;s
          output goes), open a shell inside it (<code>docker exec -it</code>), stop it (
          <code>docker stop</code>) and remove it (<code>docker rm</code>). Removing a container
          keeps its image on disk for next time.
        </p>
        <p>
          <strong>Port mapping</strong> confuses everyone at first. <code>-p 8080:80</code> means{" "}
          <em>host port : container port</em>. The container has its own private network. Without{" "}
          <code>-p</code>, nothing outside can reach it. The number on the <em>left</em> is the
          door on your machine that a visitor uses.
        </p>

        <h2 id="layers">Layers and the build cache</h2>
        <p>
          An image is a stack of <strong>layers</strong>. A layer is one saved step of the build.
          Instructions that change files (<code>RUN</code>, <code>COPY</code>, <code>ADD</code>)
          each make a layer. Docker keeps each layer in a <strong>cache</strong> (a store of
          earlier results). It reuses a layer if its instruction and everything before it did not
          change. This one fact explains most Dockerfile advice.
        </p>
        <Script
          title="The order of instructions decides your build time"
          code={`# SLOW: any code change makes the COPY layer new, so npm install runs again every time
COPY . .
RUN npm install

# FAST: dependencies change rarely and code changes often, so put the rarely-changing step first
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile     # cached until the lockfile changes
COPY . .                               # only this layer rebuilds on a code change`}
        />
        <p>
          Rule: <strong>put what changes least at the top and what changes most at the bottom.</strong>{" "}
          A rebuild that uses the cache takes seconds. One without the cache takes minutes.
        </p>

        <h2 id="dockerfile">A production Dockerfile for Next.js</h2>
        <p>
          First turn on Next.js&apos;s <strong>standalone output</strong>. It finds exactly which
          files the server needs and copies only those. This can shrink the app files a lot, so
          the image is often a few hundred MB instead of over 1 GB:
        </p>
        <Script
          title="next.config.ts"
          code={`import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;`}
        />
        <p>
          Now the Dockerfile. It is a <strong>multi-stage build</strong>: one Dockerfile with
          several steps (stages), where only the last stage becomes the final image. Read it from
          top to bottom:
        </p>
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
                <td>Start from an official image with Node 22 on Alpine Linux (a very small Linux; the whole image is roughly 150 MB on disk). <code>AS</code> gives the stage a name, so later stages can copy from it. Use the same major Node version as on your laptop (Node 24 also works if that is what you use everywhere).</td>
              </tr>
              <tr>
                <td><code>COPY package.json pnpm-lock.yaml</code> then <code>RUN pnpm install --frozen-lockfile</code></td>
                <td>This is the cache trick from above. <code>--frozen-lockfile</code> stops with an error instead of quietly changing package versions.</td>
              </tr>
              <tr>
                <td>Three <code>FROM</code>s (multi-stage)</td>
                <td>Every stage is thrown away except the last one. Compilers, dev dependencies and source code never reach the shipped image, so it is smaller and safer.</td>
              </tr>
              <tr>
                <td><code>ENV HOSTNAME=0.0.0.0</code></td>
                <td>Makes the server listen on all network interfaces. Without it, the standalone server may listen only on the container&apos;s own loopback address (127.0.0.1, which only the container itself can reach), so nothing outside can connect.</td>
              </tr>
              <tr>
                <td><code>adduser</code> + <code>USER app</code></td>
                <td>The process runs as a normal user, not as root. If someone breaks into the app, they are not root in the container.</td>
              </tr>
              <tr>
                <td><code>EXPOSE 3000</code></td>
                <td>A note for readers only. It does <em>not</em> open the port. Only <code>-p</code> does that.</td>
              </tr>
              <tr>
                <td><code>CMD [&quot;node&quot;, &quot;server.js&quot;]</code></td>
                <td>The command that runs when a container starts. The array form runs Node directly, without a shell in between. Node becomes PID 1 (the first process in the container), so it receives stop signals from Docker.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3>The .dockerignore file — do not skip it</h3>
        <p>
          <code>COPY . .</code> copies everything in the folder. The <code>.dockerignore</code>{" "}
          file tells Docker what to leave out. Without it, your <code>.env</code> secrets, your{" "}
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
            { cmd: "docker build -t myapp:dev .", note: "Build an image named myapp with the tag dev, from the Dockerfile in this folder. The first build is slow. A second build that uses the cache takes seconds. Expect a few hundred MB" },
            { cmd: "docker run --rm -p 3000:3000 --env-file .env.local myapp:dev", note: "Run it and load the variables when it starts. --rm deletes the container when it stops. Visit http://localhost:3000" },
          ]}
        />
        <Callout kind="note" label="Build-time vs run-time variables">
          <p className="mb-0">
            <code>NEXT_PUBLIC_*</code> variables are copied into the JavaScript during{" "}
            <code>pnpm build</code>. So inside Docker you must give them at <em>build</em> time
            (<code>ARG NEXT_PUBLIC_API_URL</code>, then <code>docker build --build-arg …</code>).
            Everything else, such as the database URL and secrets, is read at <em>run</em> time
            and must never be in the image.
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
                <td>The instance&apos;s IAM role. Containers use it automatically (see the hop limit note below)</td>
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
                <td>Write to stdout and stderr (the normal output streams); Docker and CloudWatch collect them</td>
                <td>Log files inside the container</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout kind="warn" label="Anything in an image layer is public to whoever can pull it">
          <p className="mb-0">
            Deleting a secret in a later Dockerfile line does <strong>not</strong> remove it. It
            still exists in the earlier layer. If a secret ever got into an image, replace the
            secret with a new one. Do not just rebuild.
          </p>
        </Callout>

        <h2 id="compose">Docker Compose — the whole stack in one file</h2>
        <p>
          Real apps use several containers: the app, a database, and later Redis (a fast in-memory
          data store). <strong>Docker Compose</strong> is a tool that describes all of them in one
          file and starts them with one command. It is the standard tool for local development
          and for simple single-server setups.
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
          <code>docker compose up -d</code> builds and starts everything in the background.{" "}
          <code>docker compose down</code> stops and removes the containers, but it keeps the data
          volume. Add <code>-v</code> to delete the data too.
        </p>
        <Callout kind="note" label="Why “db” works as a hostname">
          <p className="mb-0">
            Compose creates a private network for the project. Each service gets a DNS name (a
            name that points to an address) equal to its service name. From <code>app</code>, the
            name <code>db</code> points to the database container. This is also why{" "}
            <code>localhost</code> would be wrong. Inside the <code>app</code> container,
            localhost means <code>app</code> itself.
          </p>
        </Callout>
        <p>
          <strong>In production, do not put the database in Compose.</strong> Use RDS (Lesson 8) and
          set <code>DATABASE_URL</code> to its endpoint. The dev compose file above is close
          enough to production to catch mistakes, and it costs nothing.
        </p>

        <h2 id="ec2">Run it on EC2</h2>
        <p>
          Here the twenty manual steps of Lesson 7 shrink to a few. Once Docker is installed on the
          server, deploying means <em>pull and run</em>. (This time we copy the image to the server
          by hand. The next sections use a registry, which is the proper way.)
        </p>
        <p>
          Put the production variables in <code>~/myapp.env</code> on the server. Set its
          permissions to <code>600</code>, and never put it in Git or in the image. Then run:
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
            <code>--restart unless-stopped</code> replaces PM2. Docker starts the container again
            after a crash and after a reboot.
          </li>
          <li>
            <code>-p 127.0.0.1:3000:3000</code> opens the port <strong>only on the server&apos;s
            loopback address</strong> (127.0.0.1, which only the server itself can reach). Nginx
            (Lesson 10) can reach it, and the internet cannot. Plain <code>-p 3000:3000</code>{" "}
            listens on every interface. Docker also changes the firewall rules by itself, so the
            port can be open to the world even if you thought a firewall rule blocked it.
          </li>
          <li>
            <code>--memory 1g</code> limits memory. If the app leaks memory, only one container
            restarts and the whole server does not run out of memory.
          </li>
          <li>
            <code>--log-opt max-size</code> stops the JSON log files from quietly filling the disk.
            This is a common cause of outages.
          </li>
        </ul>

        <Callout kind="warn" label="If the container cannot find AWS credentials">
          <p className="mb-0">
            The instance metadata service (Lesson 7) only answers requests that travel a limited
            number of network hops (steps between devices). A container is one hop further away
            than the host. On many instances the hop limit is 1, so the AWS SDK inside the
            container fails with &ldquo;could not load credentials&rdquo;, even though the host
            works. (Some images, such as Amazon Linux 2023, already use 2.) Set it to 2 once, and
            keep IMDSv2 required: EC2 → your instance → Actions → Instance settings →{" "}
            <strong>Modify instance metadata options</strong>.
          </p>
        </Callout>

        <h2 id="ecr">Registries and ECR</h2>
        <p>
          &ldquo;Copy the image to the server&rdquo; does not work for many servers. A registry is
          the standard hand-over point. CI pushes an image, and every server pulls it. AWS&apos;s
          own registry is <strong>ECR</strong> (Elastic Container Registry). It is private by
          default, works with IAM, and has no data transfer charge when you pull from inside the
          same region.
        </p>
        <p>The flow has three steps. You can do them from your laptop or (later) from CI:</p>
        <ol>
          <li>
            Create a private repository in ECR named <code>myapp</code>. Turn on{" "}
            <strong>scan on push</strong>, so every image is checked for known vulnerabilities
            (security holes that are already public).
          </li>
          <li>Log Docker in to ECR with a temporary token from the AWS CLI. The token lasts 12 hours.</li>
          <li>
            Build the image, tag it with the Git commit (<code>myapp:a1b2c3d</code>), and push it.
          </li>
        </ol>
        <p>
          You do not need to memorise the exact commands. The <strong>View push commands</strong>{" "}
          button in the ECR console shows them, already filled in with your account and region.
        </p>
        <p>
          On the server, the <em>role</em> from Lesson 5 needs permission to pull images. Attach
          the AWS-managed policy <code>AmazonEC2ContainerRegistryReadOnly</code> to{" "}
          <code>myapp-ec2-role</code>. The server then logs in and pulls in the same way, using
          the role and no keys.
        </p>
        <Callout kind="ok" label="Tag with the commit SHA, never rely on latest">
          <p className="mb-0">
            <code>myapp:latest</code> is a label that moves to each new image. Two servers that pull
            &ldquo;latest&rdquo; an hour apart can run different code, and you can never say what
            production is running. <code>myapp:a1b2c3d</code> always points to one exact build, you
            can trace it to one commit, and a rollback means running the previous SHA. Add an ECR
            lifecycle rule (an automatic cleanup rule) to delete old images, so storage (about
            $0.10 per GB-month) does not keep growing.
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
                <td>The exit code and the last error. Exit 1 means the app crashed. Exit 137 means the container was killed, often because it ran out of memory</td>
              </tr>
              <tr>
                <td>Cannot reach it from the browser</td>
                <td><code>docker port myapp</code> and <code>ss -tlnp</code></td>
                <td>Is the port opened with -p? Does the app listen on 0.0.0.0 and not only on 127.0.0.1?</td>
              </tr>
              <tr>
                <td>Env var missing or wrong</td>
                <td><code>docker exec myapp env</code></td>
                <td>The real environment variables that the process sees</td>
              </tr>
              <tr>
                <td>Cannot reach RDS or another service</td>
                <td><code>docker exec -it myapp sh</code> then <code>wget -qO- host:port</code></td>
                <td>Test the network from inside the container</td>
              </tr>
              <tr>
                <td>Disk full</td>
                <td><code>docker system df</code></td>
                <td>How much space images, the build cache and container logs use. Clean up with <code>docker system prune -a</code></td>
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
            If you fix something by logging into a container, the fix disappears the next time the
            container is replaced. Containers are disposable. Make the fix in the Dockerfile or in
            the config, then rebuild and redeploy. This is a change of thinking. The server in
            Lesson 7 was like a pet that you care for one by one. Containers are like farm
            animals: you replace them, you do not repair them.
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
                  An image is a template that cannot be changed, made of layers. A container is a
                  running (or stopped) copy of an image, with a thin writable layer on top. Many
                  containers can start from one image.
                </p>
              ),
            },
            {
              q: "How is a container different from a virtual machine?",
              a: (
                <p className="mb-0">
                  A VM imitates hardware and runs its own kernel. A container shares the host
                  kernel and separates processes using Linux namespaces (which hide other processes
                  and files) and cgroups (which limit CPU and memory). Containers are smaller, start
                  in a fraction of a second and pack more tightly on a machine, but the separation
                  is weaker.
                </p>
              ),
            },
            {
              q: "Why order Dockerfile instructions the way we did?",
              a: (
                <p className="mb-0">
                  Layer caching. Docker reuses a layer if its instruction and everything above it are
                  unchanged. Copy the dependency files and install first, and copy the source code
                  last. Then a code edit does not reinstall the dependencies.
                </p>
              ),
            },
            {
              q: "What is a multi-stage build and why use one?",
              a: (
                <p className="mb-0">
                  It is a Dockerfile with several <code>FROM</code> stages. Only the last stage
                  becomes the final image. Build tools, dev dependencies and source code stay in the
                  earlier stages, so the final image is smaller and safer.
                </p>
              ),
            },
            {
              q: "How do you handle secrets with Docker?",
              a: (
                <p className="mb-0">
                  Never put them inside the image. Give them to the container at run time, as
                  environment variables or as files from a secret store (SSM Parameter Store or
                  Secrets Manager). Use the instance or task IAM role for AWS access. If a secret
                  gets into a layer, replace it with a new one.
                </p>
              ),
            },
            {
              q: "Your container keeps restarting. Walk me through it.",
              a: (
                <p className="mb-0">
                  First run <code>docker ps -a</code> to see the exit code and restart count. Then
                  run <code>docker logs</code> to read the error. Exit 137 points to running out of
                  memory (raise the limit or fix the leak). Check the environment variables with{" "}
                  <code>docker exec … env</code>. Then run the same image by hand to reproduce the
                  problem.
                </p>
              ),
            },
            {
              q: "Why not tag production images :latest?",
              a: (
                <p className="mb-0">
                  The tag can be moved to a different image, so you cannot tell what is deployed.
                  Servers can end up running different code, and a rollback is unclear. Tags that
                  never change (a commit SHA or a version number) make deployments easy to trace and
                  to undo.
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
            Change one line of source, rebuild, and watch which steps say <code>CACHED</code>. Then
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
          run&rdquo;. It is the link between the manual work of Lesson 7 and the automation of
          Lessons 12–15.
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
            <strong>Ship small and safe</strong>: use a multi-stage build, standalone output, a
            non-root user and a proper <code>.dockerignore</code>.
          </li>
          <li>
            <strong>Give config at run time, never inside the image.</strong> Take secrets from the
            environment or a secret store, and get AWS access from the IAM role.
          </li>
          <li>
            <strong>Containers are disposable.</strong> State lives in RDS and S3; fixes go into the
            Dockerfile; tags are commit SHAs.
          </li>
        </ul>
        <p>
          The app now runs in a container that listens on a private port. Next we put a proper
          receptionist in front of it: Nginx (a web server that receives requests and passes them
          to your app).
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
