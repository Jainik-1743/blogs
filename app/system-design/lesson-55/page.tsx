import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Compare, Flow, QA } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-55")!;

export const metadata: Metadata = {
  title: `Lesson 55 — ${lesson.title}`,
  description: lesson.summary,
};

/** In-page index. Each entry links to a section heading below. */
const outline = [
  { id: "the-problem", label: "The Problem" },
  { id: "the-core-idea", label: "The Core Idea" },
  { id: "how-it-works", label: "How It Works" },
  { id: "trade-offs", label: "Trade-offs" },
  { id: "in-the-real-world", label: "In the Real World" },
  { id: "interview-questions", label: "Interview Questions" },
  { id: "key-takeaways", label: "Key Takeaways" },
  { id: "further-reading", label: "Further Reading" },
];

const code1 = `FROM node:24
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["node", "server.js"]`;

const code2 = `# ---- Stage 1: build ----
FROM node:24-slim AS build
WORKDIR /app
# Copy the dependency files FIRST (so Docker can cache this step)
COPY package*.json ./
# Install the exact versions listed in the lockfile
RUN npm ci
COPY . .
# For example, compile TypeScript
RUN npm run build
# Remove the dev dependencies (tools only needed to build)
RUN npm prune --omit=dev

# ---- Stage 2: run ----
FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
# Do not run as root (the all-powerful user)
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]`;

const code3 = `node_modules
.git
.env
*.log
coverage`;

const code4 = `docker build -t myshop/api:1.4.2 .

# -p: connect port 8080 on your machine to port 3000 in the container
# -e: pass settings as environment variables
# --memory / --cpus: limits on memory and CPU (these use cgroups)
docker run -d --name api \\
  -p 8080:3000 \\
  -e DATABASE_URL=postgres://... \\
  --memory 512m --cpus 1 \\
  myshop/api:1.4.2

docker ps                  # list the running containers
docker logs -f api         # follow the logs (your app should write logs to stdout)
docker exec -it api sh     # open a shell inside the container (for debugging)
docker stop api`;

const code5 = `# docker-compose.yml
services:
  api:
    build: .
    ports: ["8080:3000"]
    environment:
      DATABASE_URL: postgres://app:secret@db:5432/shop
      REDIS_URL: redis://cache:6379
    depends_on: [db, cache]

  db:
    image: postgres:16
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: shop
    volumes: ["pgdata:/var/lib/postgresql/data"]

  cache:
    image: redis:7

volumes:
  pgdata:`;

const code6 = `docker compose up     # starts the API, PostgreSQL and Redis, all connected on one network`;

export default function SdLessonFiveFivePage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>"It works on my machine!"</p>
          <p>
            Your Node.js app runs perfectly on your laptop. On the test server, it crashes because the server has a
            different Node version. In production, an image library needs a system package that is not installed. A new
            teammate spends <strong>two days</strong> installing the right versions of PostgreSQL, Redis, Python and a
            PDF tool just to run the project on their laptop.
          </p>
          <p>
            Now imagine you want to run <strong>20 copies</strong> of a service on a few big servers. If you install
            everything directly on each machine, the versions start to clash and old files are left behind.
          </p>
          <p>
            A <strong>container</strong> is a standard package that holds an application{" "}
            <strong>together with everything it needs to run</strong> (its runtime, libraries and settings). It runs the
            same way on every machine.{" "}
            <strong>Docker</strong> is the most popular tool for building and running containers. It made containers
            easy to use, and today they are the default way to ship software.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about <strong>shipping containers</strong> in global trade.
          </p>
          <p>
            Before standard shipping containers, loading a ship was slow and messy. Sacks, barrels, crates and loose
            goods of every shape had to be handled one by one, and each port did it differently.
          </p>
          <p>
            Then came the <strong>standard steel container</strong>. Whatever is inside (bananas, cars, electronics),
            the container is the <strong>same size and shape</strong>. Cranes, ships, trains and trucks all know how to
            move it. Nobody needs to know what is inside to carry it.
          </p>
          <p>Software containers work the same way:</p>
          <ul>
            <li>
              Inside: your app, its runtime (the program that runs your code, like Node 24 or Python 3.12), its
              libraries and its settings.
            </li>
            <li>
              Outside: a <strong>standard format</strong> that any container platform (a laptop, a CI server,
              Kubernetes, a cloud service) knows how to run.
            </li>
          </ul>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="key-terms">Key terms in plain words</h3>
          <ul>
            <li>
              <strong>Kernel:</strong> the core part of an operating system. It controls the CPU, memory, disk and
              network for all programs.
            </li>
            <li>
              <strong>Virtual machine (VM):</strong> a pretend computer, run by software, that has its own full
              operating system. A <strong>hypervisor</strong> is the software that creates and runs VMs.
            </li>
            <li>
              <strong>Container:</strong> a normal process on a machine that is isolated (kept apart) from other
              processes. It looks like a small computer to the app inside, but it uses the host's kernel.
            </li>
            <li>
              <strong>Image:</strong> a read-only package that contains your app and everything it needs. A{" "}
              <strong>Dockerfile</strong> is a text file with the steps to build an image.
            </li>
            <li>
              <strong>Registry:</strong> a server that stores images so that other machines can download (pull) them.
            </li>
            <li>
              <strong>Volume:</strong> a folder that lives outside the container, so its data stays after the
              container is deleted.
            </li>
            <li>
              <strong>stdout and stderr:</strong> the two normal output streams of a program. Normal messages go to
              stdout. Error messages go to stderr.
            </li>
            <li>
              <strong>Root:</strong> the all-powerful user account on Linux. It can change anything on the machine.
            </li>
            <li>
              <strong>Environment variable:</strong> a named setting (like <code>DATABASE_URL</code>) that you give to a
              program from outside, when it starts. The program reads it while it runs.
            </li>
            <li>
              <strong>Lockfile:</strong> a file (like <code>package-lock.json</code>) that records the exact version of
              every library your project uses, so every install gets the same versions.
            </li>
            <li>
              <strong>YAML:</strong> a plain-text format for settings, written as indented <code>key: value</code> lines.
              Docker Compose files use it.
            </li>
            <li>
              <strong>Port:</strong> a number that picks one network door on a machine. <code>8080:3000</code> means
              "machine port 8080 leads to container port 3000".
            </li>
          </ul>
          <h3 id="containers-vs-virtual-machines">Containers vs virtual machines</h3>
          <Compare
            caption="Virtual machines vs containers."
            columns={[
              {
                title: <>Virtual machines</>,
                items: [
                  { sign: "·", text: <>Hypervisor on host hardware</> },
                  { sign: "·", text: <>Each VM boots its own guest OS</> },
                  { sign: "+", text: <>Strong isolation — separate kernels</> },
                  { sign: "-", text: <>Gigabytes each; minutes to boot</> },
                ],
                verdict: <>Multi-tenant isolation, different OSes</>,
              },
              {
                title: <>Containers</>,
                items: [
                  { sign: "·", text: <>Container runtime on one host kernel</> },
                  { sign: "·", text: <>Each app packs only its libraries</> },
                  { sign: "+", text: <>Megabytes; start in milliseconds</> },
                  { sign: "+", text: <>Dense packing, identical everywhere</> },
                  { sign: "-", text: <>Shared kernel = weaker isolation</> },
                ],
                verdict: <>Packaging and shipping services</>,
              },
            ]}
          />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Virtual machine</th>
                  <th>Container</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>What's inside</td>
                  <td>
                    A <strong>full operating system</strong> + app
                  </td>
                  <td>
                    Just the <strong>app + its libraries</strong>
                  </td>
                </tr>
                <tr>
                  <td>Kernel</td>
                  <td>Each VM has its own</td>
                  <td>
                    <strong>Shares the host's kernel</strong>
                  </td>
                </tr>
                <tr>
                  <td>Size</td>
                  <td>Gigabytes</td>
                  <td>Often tens to hundreds of MB</td>
                </tr>
                <tr>
                  <td>Start time</td>
                  <td>Tens of seconds to minutes</td>
                  <td>
                    <strong>Milliseconds to seconds</strong>
                  </td>
                </tr>
                <tr>
                  <td>Density</td>
                  <td>Fewer per server</td>
                  <td>
                    <strong>Many</strong> per server
                  </td>
                </tr>
                <tr>
                  <td>Isolation</td>
                  <td>Strong (hardware-level)</td>
                  <td>Good, but weaker (shared kernel)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>How containers work on Linux:</strong>
          </p>
          <ul>
            <li>
              <strong>Namespaces</strong> are a Linux feature that gives each container its <strong>own view</strong>{" "}
              of the system: its own process list, network interfaces, file system, hostname and users. The container
              "thinks" it is alone on the machine.
            </li>
            <li>
              <strong>cgroups (control groups)</strong> are a Linux feature that <strong>limits resources</strong>.
              For example: "this container can use at most 1 CPU and 512 MB of memory".
            </li>
            <li>
              A <strong>layered file system</strong> (like OverlayFS) stacks the read-only image layers on top of each
              other. A thin writable layer goes on the very top. A "layer" is one set of file changes made by one
              Dockerfile step.
            </li>
          </ul>
          <p>
            Containers are <strong>isolated processes</strong>, not tiny virtual machines. That is why they are fast
            and light. (If you need stronger isolation, you can use gVisor, which adds an extra layer between the
            container and the kernel, or Firecracker, which starts very small and fast VMs.)
          </p>
          <h3 id="images-containers-and-registries">Images, containers and registries</h3>
          <ul>
            <li>
              <strong>Image:</strong> a <strong>read-only template</strong>. It holds your app plus everything it
              needs, and you build it from a <strong>Dockerfile</strong>. Think of it as a{" "}
              <strong>recipe with all the ingredients, packed in a box</strong>.
            </li>
            <li>
              <strong>Container:</strong> a <strong>running copy</strong> of an image. It is{" "}
              <strong>the dish that was cooked from the recipe</strong>. You can run many containers from one image.
            </li>
            <li>
              <strong>Registry:</strong> a place to <strong>store and share</strong> images. Examples are Docker Hub, GitHub
              Container Registry (GHCR), Amazon ECR and Google Artifact Registry.
            </li>
          </ul>
          <Flow
            caption="The container supply chain."
            dir="row"
            nodes={[
              { title: <>Dockerfile</> },
              { title: <>Image</>, desc: <>immutable layers</>, label: <>docker build</> },
              { title: <>Registry</>, desc: <>Docker Hub, ECR, GHCR</>, label: <>docker push</> },
              { title: <>Run anywhere</>, desc: <>laptop, CI, Kubernetes</>, label: <>docker pull</>, tone: "good" },
            ]}
          />
          <h3 id="a-dockerfile-step-by-step">A Dockerfile, step by step</h3>
          <p>
            Here is a simple Dockerfile for a Node.js API. It is not optimised yet. Each line is an instruction:{" "}
            <code>FROM</code> picks the base image, <code>WORKDIR</code> sets the folder, <code>COPY</code> copies
            files in, <code>RUN</code> runs a command while building, <code>EXPOSE</code> documents the port, and{" "}
            <code>CMD</code> is the command that starts the app.
          </p>
          <CodeBlock lang="dockerfile" code={code1} />
          <p>
            It works, but the image is <strong>large</strong> (the full Node image plus dev tools). Also,{" "}
            <strong>every code change reinstalls all dependencies</strong>.
          </p>
          <p>
            A better Dockerfile is a <strong>multi-stage</strong> one. It uses more than one <code>FROM</code>. The
              first stage builds the app. The second stage is the small image that you ship. (<code>npm ci</code>{" "}
              installs the exact versions from the lockfile, and it fails if the lockfile does not match{" "}
              <code>package.json</code>.)
          </p>
          <CodeBlock lang="dockerfile" code={code2} />
          <p>
            <strong>Why this is better:</strong>
          </p>
          <ul>
            <li>
              <strong>Layer caching.</strong> Docker saves (caches) the result of each step and reuses it if nothing
              changed. Here <code>package.json</code> is copied <strong>before</strong> the source code. So
              dependencies are only reinstalled when <strong>they</strong> change, not on every code edit. Builds can
              go from minutes to seconds.
            </li>
            <li>
              <strong>Multi-stage builds.</strong> Compilers, dev dependencies and build tools stay in the first stage.
              The final image contains <strong>only what is needed to run</strong>. So it is smaller, faster to
              download and has less for an attacker to target.
            </li>
            <li>
              <strong>Slim base images.</strong> A base image is the image you start from (the <code>FROM</code> line).
              Small ones, such as <code>-slim</code>, <code>alpine</code> or <strong>distroless</strong> (almost
              nothing except your app and its runtime), reduce size and the number of known security holes.
            </li>
            <li>
              <strong>A non-root user.</strong> If an attacker breaks into the app, they do not get root power inside
              the container.
            </li>
          </ul>
          <p>
            <strong>
              A <code>.dockerignore</code> file
            </strong>{" "}
            tells Docker which files to leave out of the image (so they are not copied by <code>COPY . .</code>):
          </p>
          <CodeBlock code={code3} />
          <p>
            ⚠️ <strong>Never put secrets in images</strong> (like <code>.env</code> files, API keys or{" "}
            <code>COPY credentials.json</code>). Anyone who downloads the image can read them, even from old layers.
            Pass secrets when the container <strong>starts</strong> instead (post 51).
          </p>
          <h3 id="running-containers">Running containers</h3>
          <CodeBlock lang="bash" code={code4} />
          <p>
            <strong>Key ideas:</strong>
          </p>
          <ul>
            <li>
              <strong>Containers are disposable.</strong> Anything written inside the container disappears when the
              container is removed. Store data in <strong>volumes</strong>, databases or object storage (post 17).
            </li>
            <li>
              <strong>Volumes</strong> keep data outside the container, so the data stays after the container is
              gone: <code>-v pgdata:/var/lib/postgresql/data</code>.
            </li>
            <li>
              <strong>Configuration comes from the environment</strong>, not from inside the image (this is an idea
              from the Twelve-Factor App, a well-known list of good practices for web apps). One image can move through
              dev, staging and production with different settings.
            </li>
            <li>
              <strong>Logs go to stdout and stderr.</strong> The platform collects them from there (post 46).
            </li>
          </ul>
          <Compare
            caption="The naive Dockerfile vs the production one."
            columns={[
              {
                title: <>Naive</>,
                items: [
                  { sign: "-", text: <>FROM node:24 — a large base image</> },
                  { sign: "-", text: <>COPY . . before npm install — every code change re-installs dependencies</> },
                  { sign: "-", text: <>Dev dependencies and build tools shipped to production</> },
                  { sign: "-", text: <>Runs as root</> },
                ],
              },
              {
                title: <>Multi-stage</>,
                items: [
                  { sign: "+", text: <>Slim base image; build stage separate from runtime stage</> },
                  { sign: "+", text: <>Copy package files first → cached dependency layer</> },
                  { sign: "+", text: <>npm ci from the lockfile; prune dev dependencies</> },
                  { sign: "+", text: <>USER node — never root</> },
                ],
              },
            ]}
          />
          <h3 id="tags-vs-digests">Tags vs digests</h3>
          <ul>
            <li>
              <strong>Tags</strong> like <code>myshop/api:1.4.2</code> or <code>:latest</code> are{" "}
              <strong>labels that can be moved</strong> to point at a different image later.
            </li>
            <li>
              <strong>Digests</strong> like <code>myshop/api@sha256:9f86d0…</code> identify{" "}
              <strong>one exact image</strong> forever. A digest is a hash (a fingerprint) of the image content.
            </li>
          </ul>
          <p>
            <strong>
              Avoid <code>:latest</code> in production.
            </strong>{" "}
            You cannot tell which version is running, and the image behind the tag can change without warning. Use{" "}
            <strong>version tags</strong> (or git commit SHAs). For the most safety, deploy by <strong>digest</strong>.
          </p>
          <h3 id="docker-compose-for-local-development">Docker Compose for local development</h3>
          <p>
            <strong>Docker Compose</strong> is a tool that runs a whole set of containers from one YAML file, with one
            command. It solves the "new teammate spends two days installing things" problem:
          </p>
          <CodeBlock lang="yaml" code={code5} />
          <CodeBlock lang="bash" code={code6} />
          <p>
            Services find each other <strong>by name</strong> (<code>db</code>, <code>cache</code>). This is service
            discovery in a small form (post 54). Note that <code>depends_on</code> only controls the start order. It
            does not wait until the database is ready to accept connections. (The passwords above are only for local
            development. Never use them in real environments.)
          </p>
          <h3 id="the-container-ecosystem-and-standards">The container ecosystem and standards</h3>
          <ul>
            <li>
              The <strong>Open Container Initiative (OCI)</strong> is a group that defines standard <strong>image</strong> and{" "}
              <strong>runtime</strong> formats. Because of this, images built with Docker run on any platform that follows the standard.
            </li>
            <li>
              <strong>containerd</strong> and <strong>runc</strong> are the low-level programs that actually run
              containers. Docker uses them inside, and so does Kubernetes.
            </li>
            <li>
              <strong>Podman</strong> is a popular Docker alternative. It can run without a daemon (a program that always runs in the
              background) and as a non-root user.
            </li>
            <li>
              <strong>Kubernetes</strong> (post 56) is a system that starts, stops and manages containers across many
              machines. It runs OCI images and does not need Docker itself on the servers.
            </li>
          </ul>
          <h3 id="container-security-basics">Container security basics</h3>
          <ul>
            <li>
              ✅ <strong>Minimal base images</strong>. Rebuild regularly to get security patches.
            </li>
            <li>
              ✅ <strong>Scan images</strong> for known security holes (vulnerabilities) with tools like Trivy or Grype.
              Do it in CI, the automatic build-and-test step (post 52).
            </li>
            <li>
              ✅ <strong>Run as non-root</strong>. Remove Linux capabilities you do not need (a capability is one small
              special power of root). Use read-only file systems where you can.
            </li>
            <li>
              ✅ <strong>No secrets in images.</strong> Inject them at runtime.
            </li>
            <li>
              ✅ <strong>Pin versions</strong> of base images (use an exact version, not "latest"). Also{" "}
              <strong>sign images</strong>, for example with Sigstore/cosign, so you can check who made what you
              deploy.
            </li>
            <li>
              ✅ <strong>Set resource limits</strong>, so one container cannot take all the CPU or memory from the
              others (these are the bulkheads from post 42).
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              ✅ <strong>Consistency:</strong> the same image runs everywhere, which ends "works on my machine".
            </li>
            <li>
              ✅ <strong>Speed and density:</strong> fast starts and many containers per server, ideal for scaling and
              microservices.
            </li>
            <li>
              ✅ <strong>Isolation of dependencies:</strong> different apps can use different versions side by side.
            </li>
            <li>
              ✅ <strong>Standard packaging</strong> for CI/CD, Kubernetes and cloud platforms.
            </li>
            <li>
              ❌ <strong>Weaker isolation than VMs</strong> (the kernel is shared). If many untrusted customers share
              one machine (multi-tenant) and the data is very sensitive, you may need sandboxes or VMs.
            </li>
            <li>
              ❌ <strong>New skills and tooling:</strong> images, registries, networking and storage.
            </li>
            <li>
              ❌ <strong>Stateful workloads</strong> (databases) need careful handling of volumes and backups.
            </li>
            <li>
              ❌ <strong>Image sprawl and vulnerabilities</strong> if images aren't maintained and scanned.
            </li>
          </ul>
          <p>
            <strong>When you might not need containers:</strong> simple apps on a fully managed platform. A PaaS
            (platform as a service) or serverless platform builds and runs your code for you. Often it uses
            containers inside, but you do not have to manage them.
          </p>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Docker's launch (2013).</strong> Solomon Hykes demonstrated Docker at PyCon in 2013, and it spread
            very fast. The base technology (Linux namespaces and cgroups) already existed. Docker made it{" "}
            <strong>easy</strong>, with a simple command-line tool, Dockerfiles and a public image registry (Docker Hub).
          </p>
          <p>
            <strong>Google and containers.</strong> Long before Docker, Google ran almost everything in containers on
            its internal cluster manager, <strong>Borg</strong>. Google has said it started billions of containers per week.
            Google engineers wrote much of the first Linux cgroups feature. The lessons from Borg later shaped
            Kubernetes (post 56).
          </p>
          <p>
            <strong>The OCI standard (2015).</strong> Docker and other companies created the{" "}
            <strong>Open Container Initiative</strong>, so that container images and runtimes would not belong to one
            vendor. That is why an image built on your laptop runs on AWS, Google Cloud, Azure or your own Kubernetes
            cluster.
          </p>
          <p>
            <strong>Dev environments with Compose.</strong> Many companies ship a <code>docker-compose.yml</code> with
            each repository, so new developers can run the whole system on their laptop with one command. Onboarding (getting a new person
            started) goes from days to minutes.
          </p>
          <p>
            <strong>Kubernetes dropping "dockershim" (2022).</strong> Kubernetes removed its built-in Docker Engine
            integration in version 1.24. This caused confusion ("Is Docker dead?"). But images built with Docker{" "}
            <strong>kept working</strong>, because Kubernetes runs <strong>OCI images</strong> through containerd or
            CRI-O. It shows why open standards matter.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>What's the difference between a container and a virtual machine?</>,
                a: (
                  <>
                    <p>
                      A VM pretends to be a whole computer and runs its own guest operating system and kernel. So it is heavy
                      but strongly isolated. A container is an isolated process that uses the host's kernel. Namespaces
                      give the isolation and cgroups give the limits. So it is light and starts fast, but the
                      isolation is weaker.
                    </p>
                  </>
                ),
              },
              {
                q: <>What are image layers, and why does Dockerfile order matter?</>,
                a: (
                  <>
                    <p>
                      Each instruction creates a cached, read-only layer. When one layer changes, it and every layer after it
                      are rebuilt. So copy the dependency files and install dependencies before you copy the source
                      code. Then a code change does not reinstall the dependencies.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why use multi-stage builds?</>,
                a: (
                  <>
                    <p>
                      You build with all the tools in one stage. Then you copy only the built output and the runtime
                      dependencies into a small final image. This gives smaller images, less for an attacker to target
                      and faster downloads.
                    </p>
                  </>
                ),
              },
              {
                q: <>Tags vs digests?</>,
                a: (
                  <>
                    <p>
                      A tag like :1.4.2 or :latest is a label that can be moved to different content. A
                      digest (sha256:…) is a fingerprint of exact content that cannot change. Deploy by digest, or at
                      least by version tags that you never move. Never deploy :latest.
                    </p>
                  </>
                ),
              },
              {
                q: <>How should a containerised app handle config and logs?</>,
                a: (
                  <>
                    <p>
                      Config and secrets come in at start time, through environment variables or mounted secret files.
                      They are never built into the image. Logs go to stdout and stderr, and the platform collects them.
                      The container itself keeps no data (it is stateless) and can be thrown away.
                    </p>
                  </>
                ),
              },
              {
                q: <>What are basic container security practices?</>,
                a: (
                  <>
                    <p>
                      Use minimal base images. Run as a non-root user. Remove Linux capabilities you do not need. Use a
                      read-only file system where possible. Scan images for vulnerabilities. Sign images and check the
                      signatures before you deploy. Never put secrets into image layers.
                    </p>
                  </>
                ),
              },
            ]}
          />
        </Section>

        <Section id="key-takeaways" title="Key Takeaways" kind="takeaways">
          <ul>
            <li>
              A <strong>container</strong> packages an app with its dependencies into a{" "}
              <strong>standard, portable unit</strong>. It's an <strong>isolated process</strong> (namespaces + cgroups)
              sharing the host kernel. This makes it much lighter than a VM.
            </li>
            <li>
              <strong>Image = template</strong>, <strong>container = running instance</strong>,{" "}
              <strong>registry = where images are stored</strong>.
            </li>
            <li>
              Write good Dockerfiles:
              <ul>
                <li>
                  <strong>copy dependency files first</strong> (layer caching),
                </li>
                <li>
                  use <strong>multi-stage builds</strong> and <strong>slim or distroless</strong> bases,
                </li>
                <li>
                  <strong>run as non-root</strong>,
                </li>
                <li>
                  add a{" "}
                  <strong>
                    <code>.dockerignore</code>
                  </strong>
                  ,
                </li>
                <li>
                  and <strong>never bake in secrets</strong>.
                </li>
              </ul>
            </li>
            <li>
              Containers are <strong>disposable</strong>: keep data in volumes or databases, config in environment
              variables, and logs on stdout. Use <strong>version tags or digests</strong>, not <code>:latest</code>.
            </li>
            <li>
              Use <strong>Docker Compose</strong> for local multi-service setups, <strong>scan and sign</strong> images,
              and rely on <strong>OCI standards</strong> for portability.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>The official Docker documentation: "Get started" and "Building best practices"</li>
            <li>The Open Container Initiative (OCI) specifications</li>
            <li>The Docker Compose documentation</li>
            <li>The OWASP Docker Security Cheat Sheet</li>
            <li>Julia Evans' article "What even is a container?"</li>
            <li>The Twelve-Factor App (factors on config, logs and disposability)</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
