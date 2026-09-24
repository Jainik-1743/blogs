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

const code1 = `FROM node:20
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["node", "server.js"]`;

const code2 = `# ---- Stage 1: build ----
FROM node:20-slim AS build
WORKDIR /app
# Copy dependency files FIRST (better layer caching)
COPY package*.json ./
# Install exact versions from the lockfile
RUN npm ci
COPY . .
# e.g., compile TypeScript
RUN npm run build
# Remove dev dependencies
RUN npm prune --omit=dev

# ---- Stage 2: run ----
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
# Don't run as root
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]`;

const code3 = `node_modules
.git
.env
*.log
coverage`;

const code4 = `docker build -t myshop/api:1.4.2 .

# -p: host port 8080 → container port 3000
# -e: config via environment variables
# --memory / --cpus: resource limits (cgroups)
docker run -d --name api \\
  -p 8080:3000 \\
  -e DATABASE_URL=postgres://... \\
  --memory 512m --cpus 1 \\
  myshop/api:1.4.2

docker ps                  # list running containers
docker logs -f api         # view logs (write logs to stdout!)
docker exec -it api sh     # open a shell inside (for debugging)
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

const code6 = `docker compose up     # starts API + PostgreSQL + Redis, networked together`;

export default function SdLessonFiveFivePage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>"It works on my machine!"</p>
          <p>
            Your Node.js app runs perfectly on your laptop. On the test server, it crashes because the server has a
            different Node version. On production, an image library is missing a system package. A new teammate spends{" "}
            <strong>two days</strong> installing the right versions of PostgreSQL, Redis, Python and a PDF tool just to
            run the project locally.
          </p>
          <p>
            And when you want to run <strong>20 copies</strong> of a service on a few big servers, installing everything
            directly on each machine becomes a mess of conflicting versions and leftover files.
          </p>
          <p>
            <strong>Containers</strong> fix this by packaging an application{" "}
            <strong>together with everything it needs</strong> into one standard unit that runs the same way everywhere.{" "}
            <strong>Docker</strong> made containers easy, and they're now the default way to ship software.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about <strong>shipping containers</strong> in global trade.
          </p>
          <p>
            Before standard shipping containers, loading a ship was slow and chaotic. Sacks, barrels, crates and loose
            goods of every shape had to be handled individually, differently at every port.
          </p>
          <p>
            Then came the <strong>standard steel container</strong>. Whatever is inside (bananas, cars, electronics),
            the container is the <strong>same size and shape</strong>. Cranes, ships, trains and trucks all know how to
            move it, and nobody needs to know what's inside to transport it.
          </p>
          <p>Software containers do the same:</p>
          <ul>
            <li>Inside: your app, its runtime (like Node 20 or Python 3.12), libraries and config.</li>
            <li>
              Outside: a <strong>standard format</strong> that any container platform (a laptop, a CI server,
              Kubernetes, a cloud service) knows how to run.
            </li>
          </ul>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
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
            <strong>How containers work under the hood (Linux):</strong>
          </p>
          <ul>
            <li>
              <strong>Namespaces</strong> give each container its <strong>own view</strong> of the system: its own
              process list, network interfaces, file system, hostname and users. A container "thinks" it's alone on the
              machine.
            </li>
            <li>
              <strong>cgroups (control groups)</strong> <strong>limit resources</strong>, like "this container can use
              at most 1 CPU and 512 MB of memory".
            </li>
            <li>
              A <strong>layered file system</strong> (like OverlayFS) stacks read-only image layers with a thin writable
              layer on top.
            </li>
          </ul>
          <p>
            Containers are <strong>isolated processes</strong>, not tiny virtual machines. That's why they're so fast
            and light. (For stronger isolation, there are also sandboxed runtimes like gVisor and lightweight VMs like
            Firecracker.)
          </p>
          <h3 id="images-containers-and-registries">Images, containers and registries</h3>
          <ul>
            <li>
              <strong>Image:</strong> a <strong>read-only template</strong>, your app plus everything it needs, built
              from a <strong>Dockerfile</strong>. Think of it as the <strong>recipe and ingredients, packed</strong>.
            </li>
            <li>
              <strong>Container:</strong> a <strong>running instance</strong> of an image, the{" "}
              <strong>dish being served</strong>. You can run many containers from one image.
            </li>
            <li>
              <strong>Registry:</strong> a place to <strong>store and share</strong> images: Docker Hub, GitHub
              Container Registry (GHCR), Amazon ECR, Google Artifact Registry and others.
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
          <p>A simple (not yet optimised) Dockerfile for a Node.js API:</p>
          <CodeBlock lang="dockerfile" code={code1} />
          <p>
            It works, but the image is <strong>large</strong> (the full Node image plus dev tools), and{" "}
            <strong>every code change reinstalls all dependencies</strong>.
          </p>
          <p>
            A better, <strong>multi-stage</strong> Dockerfile:
          </p>
          <CodeBlock lang="dockerfile" code={code2} />
          <p>
            <strong>Why this is better:</strong>
          </p>
          <ul>
            <li>
              <strong>Layer caching.</strong> Docker caches each step. Because <code>package.json</code> is copied{" "}
              <strong>before</strong> the source code, dependencies are only reinstalled when <strong>they</strong>{" "}
              change, not on every code edit. Builds go from minutes to seconds.
            </li>
            <li>
              <strong>Multi-stage builds.</strong> Compilers, dev dependencies and build tools stay in the first stage.
              The final image contains <strong>only what's needed to run</strong>, so it's smaller, faster to pull, and
              has less to attack.
            </li>
            <li>
              <strong>Slim base images.</strong> <code>-slim</code>, <code>alpine</code> or <strong>distroless</strong>{" "}
              images (which contain almost nothing but your app and its runtime) reduce size and vulnerabilities.
            </li>
            <li>
              <strong>A non-root user.</strong> If an attacker breaks into the app, they don't get root inside the
              container.
            </li>
          </ul>
          <p>
            <strong>
              A <code>.dockerignore</code> file
            </strong>{" "}
            keeps junk out of the image:
          </p>
          <CodeBlock code={code3} />
          <p>
            ⚠️ <strong>Never put secrets in images</strong> (like <code>.env</code> files, API keys or{" "}
            <code>COPY credentials.json</code>). Anyone who pulls the image can extract them, even from old layers. Pass
            secrets at <strong>runtime</strong> instead (post 51).
          </p>
          <h3 id="running-containers">Running containers</h3>
          <CodeBlock lang="bash" code={code4} />
          <p>
            <strong>Key ideas:</strong>
          </p>
          <ul>
            <li>
              <strong>Containers are disposable.</strong> Anything written inside the container disappears when it's
              removed. Store data in <strong>volumes</strong>, databases or object storage (post 17).
            </li>
            <li>
              <strong>Volumes</strong> persist data outside the container's lifecycle:{" "}
              <code>-v pgdata:/var/lib/postgresql/data</code>.
            </li>
            <li>
              <strong>Configuration comes from the environment</strong>, not baked into the image (the Twelve-Factor App
              idea). One image goes through dev, staging and prod with different settings.
            </li>
            <li>
              <strong>Logs go to stdout and stderr.</strong> The platform collects them (post 46).
            </li>
          </ul>
          <Compare
            caption="The naive Dockerfile vs the production one."
            columns={[
              {
                title: <>Naive</>,
                items: [
                  { sign: "-", text: <>FROM node:20 — a large base image</> },
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
              <strong>labels that can be moved</strong> to point at a different image.
            </li>
            <li>
              <strong>Digests</strong> like <code>myshop/api@sha256:9f86d0…</code> identify{" "}
              <strong>one exact image</strong> forever.
            </li>
          </ul>
          <p>
            <strong>
              Avoid <code>:latest</code> in production.
            </strong>{" "}
            It's unclear what version is running, and it can change underneath you. Use <strong>version tags</strong>{" "}
            (or git commit SHAs), and for maximum safety, deploy by <strong>digest</strong>.
          </p>
          <h3 id="docker-compose-for-local-development">Docker Compose for local development</h3>
          <p>
            <strong>Docker Compose</strong> runs a whole multi-container setup with one command. That's perfect for the
            "new teammate spends two days installing things" problem:
          </p>
          <CodeBlock lang="yaml" code={code5} />
          <CodeBlock lang="bash" code={code6} />
          <p>
            Services find each other <strong>by name</strong> (<code>db</code>, <code>cache</code>), which is service
            discovery in miniature (post 54). (The passwords above are only for local development. Never use them in
            real environments.)
          </p>
          <h3 id="the-container-ecosystem-and-standards">The container ecosystem and standards</h3>
          <ul>
            <li>
              The <strong>Open Container Initiative (OCI)</strong> defines standard <strong>image</strong> and{" "}
              <strong>runtime</strong> formats, so images built with Docker run on any compliant platform.
            </li>
            <li>
              <strong>containerd</strong> and <strong>runc</strong> are the low-level runtimes that actually run
              containers (Docker uses them internally, and so does Kubernetes).
            </li>
            <li>
              <strong>Podman</strong> is a popular Docker alternative that can run without a background daemon and as a
              non-root user.
            </li>
            <li>
              <strong>Kubernetes</strong> (post 56) orchestrates containers across many machines. It runs OCI images and
              doesn't need Docker itself on the servers.
            </li>
          </ul>
          <h3 id="container-security-basics">Container security basics</h3>
          <ul>
            <li>
              ✅ <strong>Minimal base images</strong>, and rebuild regularly to pick up security patches.
            </li>
            <li>
              ✅ <strong>Scan images</strong> for known vulnerabilities (Trivy, Grype, registry scanners) in CI (post
              52).
            </li>
            <li>
              ✅ <strong>Run as non-root</strong>, drop unnecessary Linux capabilities, and use read-only file systems
              where possible.
            </li>
            <li>
              ✅ <strong>No secrets in images.</strong> Inject them at runtime.
            </li>
            <li>
              ✅ <strong>Pin versions</strong> of base images, and <strong>sign images</strong> (for example with
              Sigstore/cosign) so you can verify what you deploy.
            </li>
            <li>
              ✅ <strong>Set resource limits</strong>, so one container can't starve others (the bulkheads in post 42).
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
              ❌ <strong>Weaker isolation than VMs</strong> (the shared kernel). Very sensitive multi-tenant workloads
              may need sandboxes or VMs.
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
            <strong>When you might not need containers:</strong> simple apps deployed to a fully managed platform (many
            PaaS and serverless platforms build and run your code for you, though often using containers under the
            hood).
          </p>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Docker's launch (2013).</strong> Solomon Hykes demonstrated Docker at PyCon in 2013, and it spread
            extremely fast. Container technology (Linux namespaces and cgroups) already existed, but Docker made it{" "}
            <strong>easy</strong>, with a simple CLI, Dockerfiles and a public image registry (Docker Hub).
          </p>
          <p>
            <strong>Google and containers.</strong> Long before Docker, Google ran almost everything in containers on
            its internal cluster manager, <strong>Borg</strong>, launching billions of containers per week. The Linux
            cgroups feature was originally contributed largely by Google engineers. Borg's lessons later shaped
            Kubernetes (post 56).
          </p>
          <p>
            <strong>The OCI standard (2015).</strong> Docker and other industry players created the{" "}
            <strong>Open Container Initiative</strong>, so container images and runtimes would be vendor-neutral. That's
            why an image built on your laptop runs on AWS, Google Cloud, Azure or your own Kubernetes cluster.
          </p>
          <p>
            <strong>Dev environments with Compose.</strong> Many companies ship a <code>docker-compose.yml</code> with
            each repository, so new developers can run the whole stack locally with one command, turning onboarding from
            days into minutes.
          </p>
          <p>
            <strong>Kubernetes dropping "dockershim" (2022).</strong> Kubernetes removed its built-in Docker Engine
            integration in version 1.24. It caused confusion ("Is Docker dead?"), but images built with Docker{" "}
            <strong>kept working</strong>, because Kubernetes runs <strong>OCI images</strong> through containerd or
            CRI-O. It's a nice lesson in why open standards matter.
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
                      A VM virtualises hardware and runs its own guest OS kernel, so it's heavy but strongly isolated. A
                      container is an isolated process on the host's shared kernel (namespaces for isolation, cgroups
                      for limits), so it's lightweight and fast to start, with weaker isolation.
                    </p>
                  </>
                ),
              },
              {
                q: <>What are image layers, and why does Dockerfile order matter?</>,
                a: (
                  <>
                    <p>
                      Each instruction creates a cached, read-only layer; when one changes, it and every layer after it
                      rebuild. Copy dependency manifests and install dependencies before copying source code, so code
                      changes don't reinstall dependencies.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why use multi-stage builds?</>,
                a: (
                  <>
                    <p>
                      To build with a full toolchain in one stage and copy only the built output and runtime
                      dependencies into a slim final image. That gives smaller images, a smaller attack surface and
                      faster pulls.
                    </p>
                  </>
                ),
              },
              {
                q: <>Tags vs digests?</>,
                a: (
                  <>
                    <p>
                      A tag like :1.4.2 or :latest is a movable label that can be repointed to different content. A
                      digest (sha256:…) identifies exact, immutable content. Deploy by digest, or at least by immutable
                      version tags, never :latest.
                    </p>
                  </>
                ),
              },
              {
                q: <>How should a containerised app handle config and logs?</>,
                a: (
                  <>
                    <p>
                      Config and secrets come in via environment variables or mounted secrets at runtime, never baked
                      into the image; logs go to stdout/stderr for the platform to collect. The container itself stays
                      stateless and disposable.
                    </p>
                  </>
                ),
              },
              {
                q: <>What are basic container security practices?</>,
                a: (
                  <>
                    <p>
                      Minimal base images, run as a non-root user, drop Linux capabilities, a read-only filesystem where
                      possible, scan images for vulnerabilities, sign them and verify signatures before deploy, and
                      never put secrets into image layers.
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
              sharing the host kernel, which makes it much lighter than a VM.
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
