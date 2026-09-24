import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Compare, Flow, Layers, QA } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-56")!;

export const metadata: Metadata = {
  title: `Lesson 56 — ${lesson.title}`,
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

const code1 = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: orders-api
spec:
  replicas: 3
  selector:
    matchLabels: { app: orders-api }
  strategy:
    type: RollingUpdate
    rollingUpdate: { maxUnavailable: 0, maxSurge: 1 }   # zero-downtime rollout
  template:
    metadata:
      labels: { app: orders-api }
    spec:
      containers:
        - name: api
          image: myshop/orders-api:1.4.2
          ports: [{ containerPort: 3000 }]
          envFrom:
            - configMapRef: { name: orders-config }
            - secretRef:    { name: orders-secrets }
          resources:
            requests: { cpu: "250m", memory: "256Mi" }
            limits:   { memory: "512Mi" }
          readinessProbe:
            httpGet: { path: /ready, port: 3000 }
            periodSeconds: 5
          livenessProbe:
            httpGet: { path: /healthz, port: 3000 }
            initialDelaySeconds: 10
            periodSeconds: 10`;

const code2 = `apiVersion: v1
kind: Service
metadata:
  name: orders-api
spec:
  selector: { app: orders-api }
  ports: [{ port: 80, targetPort: 3000 }]
  type: ClusterIP`;

const code3 = `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: orders-api }
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: orders-api }
  minReplicas: 3
  maxReplicas: 30
  metrics:
    - type: Resource
      resource: { name: cpu, target: { type: Utilization, averageUtilization: 65 } }`;

export default function SdLessonFiveSixPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            You've containerised your services (post 55). Now you have <strong>30 services</strong>, each running{" "}
            <strong>3–20 containers</strong>, across <strong>15 servers</strong>. Someone has to:
          </p>
          <ul>
            <li>
              decide <strong>which server</strong> each container runs on, based on free CPU and memory,
            </li>
            <li>
              <strong>restart</strong> containers that crash, and <strong>move</strong> them when a server dies,
            </li>
            <li>
              <strong>scale</strong> up at 7 PM and down at 3 AM,
            </li>
            <li>
              <strong>roll out</strong> new versions without downtime, and <strong>roll back</strong> bad ones,
            </li>
            <li>
              let services <strong>find each other</strong> as containers move around (post 54),
            </li>
            <li>
              deliver <strong>config and secrets</strong> to the right containers,
            </li>
            <li>
              route <strong>external traffic</strong> to the right services.
            </li>
          </ul>
          <p>
            Doing this with scripts and SSH doesn't scale. <strong>Kubernetes</strong> (often shortened to{" "}
            <strong>K8s</strong>) is a platform that does all of this <strong>automatically</strong>, based on a
            description of what you want.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about a <strong>very organised shipping port</strong>.
          </p>
          <ul>
            <li>
              You give the <strong>port authority</strong> your instructions: "Keep 5 containers of product A and 3 of
              product B available at all times, each with this much space."
            </li>
            <li>
              The <strong>port crane operators</strong> (the scheduler) decide which <strong>dock</strong> (server) has
              room for each container.
            </li>
            <li>
              <strong>Dock supervisors</strong> (kubelets) on each dock make sure their containers are actually there
              and working.
            </li>
            <li>
              If a container is damaged, a new one is brought in. If a whole dock floods, its containers are moved to
              other docks.
            </li>
            <li>
              Customers don't need to know which dock holds what. They go to the <strong>"Product A" counter</strong>,
              which always knows where the current containers are (a Service).
            </li>
          </ul>
          <p>
            Kubernetes is <strong>declarative</strong>: you describe the <strong>desired state</strong> ("I want 5
            replicas of this image, with this much CPU, reachable at this name"), and Kubernetes{" "}
            <strong>continuously works to make reality match it</strong>.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="architecture-control-plane-and-nodes">Architecture: control plane and nodes</h3>
          <Layers
            caption="A Kubernetes cluster: one control plane deciding, many nodes doing."
            layers={[
              {
                name: <>kube-apiserver</>,
                tech: <>the front door</>,
                desc: <>kubectl, controllers and kubelets all talk only to it</>,
              },
              {
                name: <>etcd</>,
                tech: <>the cluster's database</>,
                desc: <>desired and current state (a Raft-replicated CP store)</>,
              },
              { name: <>kube-scheduler</>, tech: <>placement</>, desc: <>picks a node for each new pod</> },
              {
                name: <>controller-manager</>,
                tech: <>control loops</>,
                desc: <>Deployments, ReplicaSets, nodes, jobs</>,
              },
              {
                name: <>Worker nodes × N</>,
                tech: <>kubelet · kube-proxy / CNI · container runtime</>,
                desc: <>run the pods</>,
              },
            ]}
          />
          <p>
            <strong>The control plane (the brain):</strong>
          </p>
          <ul>
            <li>
              <strong>kube-apiserver:</strong> the front door. Every change goes through its API.
            </li>
            <li>
              <strong>etcd:</strong> a consistent, replicated key-value store (using Raft, post 24) that holds all
              cluster state. <strong>Back it up!</strong>
            </li>
            <li>
              <strong>kube-scheduler:</strong> chooses a node for each new pod, based on requested resources,
              constraints and spreading rules.
            </li>
            <li>
              <strong>controller-manager:</strong> runs many <strong>controllers</strong>, loops that watch the state
              and fix differences.
            </li>
          </ul>
          <p>
            <strong>Worker nodes (the muscle):</strong>
          </p>
          <ul>
            <li>
              <strong>kubelet:</strong> the agent on each node that starts and stops containers and reports their
              status.
            </li>
            <li>
              <strong>Container runtime:</strong> containerd or CRI-O runs the OCI images (post 55).
            </li>
            <li>
              <strong>kube-proxy / CNI network plugin:</strong> handles pod networking and Service routing.
            </li>
          </ul>
          <p>
            Managed services (<strong>Amazon EKS, Google GKE, Azure AKS</strong> and others) run the control plane for
            you. Most teams use one of these rather than operating it themselves.
          </p>
          <h3 id="the-reconciliation-loop">The reconciliation loop</h3>
          <p>This is the heart of Kubernetes:</p>
          <Flow
            caption="The reconciliation loop — the one idea behind everything Kubernetes does."
            nodes={[
              { title: <>Observe current state</>, desc: <>3 pods running</> },
              { title: <>Compare with desired state</>, desc: <>the Deployment says 5</> },
              { title: <>Act to close the gap</>, desc: <>create 2 pods</> },
              {
                title: <>Repeat forever</>,
                desc: <>a node dies → its pods are re-created elsewhere automatically</>,
                tone: "good",
              },
            ]}
          />
          <p>
            Every controller does this, over and over. If a node dies and 2 pods disappear, the Deployment's controller
            notices <strong>"desired 5, current 3"</strong> and creates 2 new pods elsewhere.{" "}
            <strong>You don't write the recovery steps. You declare the goal.</strong>
          </p>
          <h3 id="core-objects">Core objects</h3>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Pod</h4>
          <p>
            The <strong>smallest deployable unit</strong>: one or more containers that <strong>share</strong> a network
            address (IP) and can share storage volumes.
          </p>
          <ul>
            <li>
              Usually <strong>one main container</strong> per pod, sometimes with <strong>sidecars</strong> (a logging
              agent, or a service-mesh proxy, post 54).
            </li>
            <li>
              Pods are <strong>disposable</strong>. They get replaced, not repaired, and each new pod gets a new IP.
              Never rely on a specific pod.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deployment (and ReplicaSet)</h4>
          <p>
            The most common way to run <strong>stateless</strong> apps. A <strong>Deployment</strong> says "run N copies
            of this pod template, and update them safely":
          </p>
          <CodeBlock lang="yaml" code={code1} />
          <p>
            The Deployment manages <strong>ReplicaSets</strong>, which keep the right number of pods running. When you
            change the image to <code>1.4.3</code>, it performs a <strong>rolling update</strong>: new pods are started,
            old ones stopped gradually, and{" "}
            <strong>
              <code>kubectl rollout undo</code>
            </strong>{" "}
            rolls back.
          </p>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Other workload types</h4>
          <ul>
            <li>
              <strong>StatefulSet:</strong> for <strong>stateful</strong> apps (databases, Kafka, ZooKeeper). Pods get{" "}
              <strong>stable names</strong> (<code>db-0</code>, <code>db-1</code>), <strong>stable storage</strong>, and
              ordered startup and shutdown.
            </li>
            <li>
              <strong>DaemonSet:</strong> runs <strong>one pod on every node</strong>, for log collectors, monitoring
              agents and network plugins.
            </li>
            <li>
              <strong>Job:</strong> runs pods <strong>to completion</strong> (like a database migration or a batch
              import).
            </li>
            <li>
              <strong>CronJob:</strong> runs Jobs <strong>on a schedule</strong> (post 38).
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Service: a stable address for changing pods</h4>
          <p>
            Pods come and go, so a <strong>Service</strong> gives a set of pods (selected by <strong>labels</strong>) a{" "}
            <strong>stable name and virtual IP</strong>, and load-balances traffic to the <strong>ready</strong> ones
            (post 54):
          </p>
          <CodeBlock lang="yaml" code={code2} />
          <p>
            Other pods can now call <code>http://orders-api</code>, and cluster DNS resolves it.
          </p>
          <p>
            <strong>Service types:</strong>
          </p>
          <ul>
            <li>
              <strong>ClusterIP</strong> (the default): reachable <strong>inside</strong> the cluster only.
            </li>
            <li>
              <strong>NodePort:</strong> opens a port on every node. It's rarely used directly.
            </li>
            <li>
              <strong>LoadBalancer:</strong> asks the cloud to create an <strong>external load balancer</strong> (post
              12).
            </li>
            <li>
              <strong>Headless</strong> (<code>clusterIP: None</code>): returns individual pod IPs, often used with
              StatefulSets.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Ingress and Gateway API: HTTP traffic from outside</h4>
          <p>
            An <strong>Ingress</strong> (or the newer, more powerful <strong>Gateway API</strong>) routes external
            HTTP(S) traffic to Services by <strong>host and path</strong>, with TLS. An{" "}
            <strong>Ingress controller</strong> (NGINX, Traefik, Envoy-based gateways or cloud load balancers) does the
            actual work. It's an L7 load balancer / reverse proxy (posts 12–13) managed by Kubernetes.
          </p>
          <Flow
            caption="How outside traffic reaches pods."
            nodes={[
              { title: <>Internet</> },
              { title: <>Ingress / Gateway</>, desc: <>TLS and host/path routing</> },
              {
                title: <>Service orders-api</>,
                desc: <>a stable virtual IP and DNS name</>,
                label: <>shop.com/api/orders</>,
              },
              { title: <>orders-api pods × 3</>, label: <>selects ready pods only</>, tone: "good" },
            ]}
          />
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">ConfigMap and Secret</h4>
          <ul>
            <li>
              <strong>ConfigMap:</strong> non-secret configuration (feature settings, URLs), injected as environment
              variables or files.
            </li>
            <li>
              <strong>Secret:</strong> sensitive values. ⚠️ They're only <strong>base64-encoded</strong> by default, so
              enable <strong>encryption at rest</strong> for etcd, restrict access with RBAC, and consider syncing from
              an external secrets manager (post 51).
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Namespaces</h4>
          <p>
            <strong>Namespaces</strong> divide one cluster into <strong>virtual sections</strong> (<code>payments</code>
            , <code>search</code>, <code>staging</code>), with their own resources, access rules (RBAC) and quotas.
            They're useful for separating teams and environments, but{" "}
            <strong>they're not strong security boundaries</strong> on their own. Add NetworkPolicies and RBAC.
          </p>
          <h3 id="health-checks-liveness-readiness-startup">Health checks: liveness, readiness, startup</h3>
          <Compare
            caption="Three probes, three different questions."
            columns={[
              {
                title: <>Liveness</>,
                items: [
                  { sign: "·", text: <>“Is this container stuck?”</> },
                  { sign: "-", text: <>Failing → the container is restarted</> },
                ],
                verdict: <>Deadlocks, unrecoverable states</>,
              },
              {
                title: <>Readiness</>,
                items: [
                  { sign: "·", text: <>“Should this pod get traffic right now?”</> },
                  { sign: "-", text: <>Failing → removed from Service endpoints, not restarted</> },
                ],
                verdict: <>Warm-up, dependency blips, draining</>,
              },
              {
                title: <>Startup</>,
                items: [
                  { sign: "·", text: <>“Has a slow-starting app finished booting?”</> },
                  { sign: "+", text: <>Holds the other probes off until it passes</> },
                ],
                verdict: <>JVMs and apps with long start-up</>,
              },
            ]}
          />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Probe</th>
                  <th>Question</th>
                  <th>If it fails…</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Readiness</strong>
                  </td>
                  <td>
                    "Can this pod handle traffic <strong>right now</strong>?"
                  </td>
                  <td>
                    Removed from Service endpoints (no traffic), <strong>not restarted</strong>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Liveness</strong>
                  </td>
                  <td>
                    "Is this pod <strong>stuck or broken</strong>?"
                  </td>
                  <td>
                    <strong>Restarted</strong>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Startup</strong>
                  </td>
                  <td>
                    "Has the app <strong>finished starting</strong>?"
                  </td>
                  <td>Liveness and readiness checks wait until it succeeds</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>Common mistake:</strong> making the <strong>liveness</strong> probe check the{" "}
            <strong>database</strong>. When the database has a hiccup, <strong>every pod restarts at once</strong>,
            making the outage much worse. Liveness should check only "is this process healthy?". Use readiness,
            carefully, for temporary "not ready" states (post 12).
          </p>
          <h3 id="resources-scheduling-and-scaling">Resources, scheduling and scaling</h3>
          <p>
            <strong>Requests and limits:</strong>
          </p>
          <ul>
            <li>
              <strong>Requests:</strong> what the pod is <strong>guaranteed</strong>. The scheduler uses this to place
              pods.
            </li>
            <li>
              <strong>Limits:</strong> the <strong>maximum</strong> it may use. Going over the <strong>memory</strong>{" "}
              limit kills the container ("OOMKilled"). Hitting the <strong>CPU</strong> limit slows it down
              (throttling).
            </li>
            <li>
              Setting requests correctly is key to both <strong>reliability</strong> and <strong>cost</strong>.
            </li>
          </ul>
          <p>
            <strong>Scaling:</strong>
          </p>
          <ul>
            <li>
              <strong>Horizontal Pod Autoscaler (HPA):</strong> adds or removes <strong>pods</strong> based on CPU,
              memory or custom metrics (like requests per second or queue length):
            </li>
          </ul>
          <CodeBlock lang="yaml" code={code3} />
          <ul>
            <li>
              <strong>Vertical Pod Autoscaler (VPA):</strong> adjusts a pod's <strong>requests and limits</strong> based
              on actual usage.
            </li>
            <li>
              <strong>Cluster Autoscaler / Karpenter:</strong> add or remove <strong>nodes</strong> when pods can't be
              scheduled, or nodes are underused.
            </li>
            <li>
              <strong>Event-driven autoscaling (KEDA):</strong> scales on queue depth, Kafka lag and so on, even down to
              zero.
            </li>
          </ul>
          <p>
            <strong>Spreading for availability:</strong> use <strong>topology spread constraints</strong> or{" "}
            <strong>pod anti-affinity</strong> to spread replicas across <strong>nodes and availability zones</strong>,
            so one failure doesn't take out every replica (post 40). A <strong>PodDisruptionBudget</strong> stops
            maintenance from evicting too many replicas at once.
          </p>
          <h3 id="storage">Storage</h3>
          <ul>
            <li>
              <strong>Volumes</strong> attach storage to pods.
            </li>
            <li>
              <strong>PersistentVolume (PV):</strong> a piece of storage (like a cloud disk).
            </li>
            <li>
              <strong>PersistentVolumeClaim (PVC):</strong> a pod's <strong>request</strong> for storage ("I need 50 GB
              of fast SSD").
            </li>
            <li>
              <strong>StorageClass:</strong> defines <strong>types</strong> of storage and creates volumes on demand.
            </li>
          </ul>
          <p>
            Running databases on Kubernetes is possible (often with <strong>operators</strong>, below), but many teams
            prefer <strong>managed databases</strong> outside the cluster for simplicity.
          </p>
          <h3 id="security-basics">Security basics</h3>
          <ul>
            <li>
              <strong>RBAC</strong> controls who (people and service accounts) can do what via the API.
            </li>
            <li>
              <strong>NetworkPolicies</strong> control which pods can talk to which. The default is "everything can talk
              to everything".
            </li>
            <li>
              <strong>Pod security:</strong> run as non-root, with a read-only root file system and minimal capabilities
              (post 55).
            </li>
            <li>
              <strong>Admission policies</strong> (tools like Kyverno or OPA Gatekeeper) reject unsafe configurations.
            </li>
            <li>
              <strong>Keep the cluster and nodes patched</strong>, and scan images.
            </li>
          </ul>
          <h3 id="the-ecosystem">The ecosystem</h3>
          <ul>
            <li>
              <strong>Helm:</strong> a package manager for Kubernetes. It bundles YAML into reusable, configurable
              "charts".
            </li>
            <li>
              <strong>Kustomize:</strong> layers environment-specific changes over base YAML (built into{" "}
              <code>kubectl</code>).
            </li>
            <li>
              <strong>Operators:</strong> controllers that encode operational knowledge for complex software ("how to
              run PostgreSQL or Kafka"), extending Kubernetes with <strong>Custom Resource Definitions (CRDs)</strong>.
            </li>
            <li>
              <strong>GitOps (Argo CD, Flux):</strong> the desired state lives in <strong>Git</strong>, and a controller
              keeps the cluster in sync with the repository (post 58).
            </li>
            <li>
              <strong>Service meshes (Istio, Linkerd):</strong> mTLS, traffic control and observability between services
              (posts 51 and 54).
            </li>
          </ul>
          <h3 id="do-you-need-kubernetes">Do you need Kubernetes?</h3>
          <p>
            Kubernetes is powerful, but it's <strong>complex</strong>. <strong>Good fits:</strong>
          </p>
          <ul>
            <li>many services and teams,</li>
            <li>a need for portability across clouds or on-premises,</li>
            <li>a platform team to run it,</li>
            <li>workloads that benefit from bin-packing, auto-scaling and self-healing.</li>
          </ul>
          <p>
            <strong>Maybe not (yet):</strong>
          </p>
          <ul>
            <li>a small app or small team,</li>
            <li>
              or when a simpler managed platform (a PaaS, serverless, or managed container services like AWS ECS/Fargate
              or Google Cloud Run) would do the job with far less operational work (post 57).
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              ✅{" "}
              <strong>
                Self-healing, automated rollouts and rollbacks, auto-scaling, service discovery, config management
              </strong>
              , and efficient <strong>bin-packing</strong> of workloads onto servers.
            </li>
            <li>
              ✅ <strong>Declarative and portable:</strong> the same concepts work across clouds and on-premises, with a
              huge ecosystem.
            </li>
            <li>
              ❌ <strong>Complexity:</strong> many concepts, a lot of YAML, networking, security and upgrades. It has a
              real <strong>learning curve</strong>.
            </li>
            <li>
              ❌ <strong>Operational cost:</strong> even with managed control planes, someone must manage nodes,
              add-ons, upgrades, security and cost.
            </li>
            <li>
              ❌ <strong>Easy to misconfigure:</strong> wrong probes, missing resource requests, no
              PodDisruptionBudgets, open network policies.
            </li>
            <li>
              ❌ <strong>Stateful workloads</strong> need extra care (StatefulSets, operators, backups).
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>From Borg to Kubernetes.</strong> Google ran its services for years on <strong>Borg</strong>, an
            internal cluster manager, and later <strong>Omega</strong>. Engineers who worked on them created{" "}
            <strong>Kubernetes</strong>, open-sourced it in <strong>2014</strong>, and released version 1.0 in 2015,
            when it was donated to the newly formed Cloud Native Computing Foundation. The paper "Borg, Omega, and
            Kubernetes" explains the lessons carried over.
          </p>
          <p>
            <strong>Pokémon GO (2016).</strong> Pokémon GO ran on Google Kubernetes Engine at launch. Google described
            traffic reaching <strong>many times</strong> the original worst-case estimate within days, and the game
            scaling up rapidly on the platform. It's a famous example of Kubernetes-based scaling under an unexpected
            spike.
          </p>
          <p>
            <strong>Spotify's migration.</strong> Spotify had built its own container orchestration tool (Helios), and
            later migrated to Kubernetes to benefit from the wider community and ecosystem, rather than maintaining its
            own system.
          </p>
          <p>
            <strong>Stripe and Kubernetes.</strong> Stripe has written about learning to operate Kubernetes reliably,
            including testing, gradual adoption and building confidence before moving critical workloads. It's a useful
            reminder that adopting Kubernetes is a <strong>journey</strong>, not a switch.
          </p>
          <p>
            <strong>Kubernetes everywhere.</strong> Today, Kubernetes runs in every major cloud (EKS, GKE, AKS), in
            company data centres, and even on edge devices and in retail stores, making it the common "operating system"
            for containerised workloads.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>What problem does Kubernetes solve?</>,
                a: (
                  <>
                    <p>
                      Running many containers across many machines reliably: scheduling them onto nodes, restarting
                      failures, replacing lost nodes, rolling out new versions with no downtime, service discovery and
                      load balancing, config and secrets, and autoscaling — all driven by declarative desired state.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is the reconciliation loop?</>,
                a: (
                  <>
                    <p>
                      Controllers continuously compare the desired state stored in the API server (etcd) with actual
                      state and act to close the gap — creating, deleting or updating pods. That's why Kubernetes
                      self-heals: a dead node's pods are simply re-created elsewhere.
                    </p>
                  </>
                ),
              },
              {
                q: <>Pod, Deployment, Service — what's the difference?</>,
                a: (
                  <>
                    <p>
                      A pod is the smallest unit: one or more tightly coupled containers sharing a network namespace. A
                      Deployment manages a replicated set of pods and rolls out new versions. A Service gives a stable
                      name and virtual IP that load-balances across the ready pods matching a label selector.
                    </p>
                  </>
                ),
              },
              {
                q: <>Liveness vs readiness probes?</>,
                a: (
                  <>
                    <p>
                      Readiness decides whether a pod receives traffic; failing it removes the pod from Service
                      endpoints without restarting it. Liveness decides whether the container is stuck; failing it
                      restarts the container. Don't make liveness depend on external dependencies, or one database blip
                      restarts everything.
                    </p>
                  </>
                ),
              },
              {
                q: <>What are resource requests and limits?</>,
                a: (
                  <>
                    <p>
                      Requests are what the scheduler reserves when placing a pod; limits cap what it may use. CPU over
                      the limit is throttled; memory over the limit gets the container OOM-killed. Set requests from
                      real usage and always set memory limits.
                    </p>
                  </>
                ),
              },
              {
                q: <>Does every team need Kubernetes?</>,
                a: (
                  <>
                    <p>
                      No. It adds real operational complexity. Small teams are often better served by a PaaS, serverless
                      or a managed container service. Kubernetes pays off with many services, several teams and a
                      platform team — or via a managed offering like EKS, GKE or AKS.
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
              Kubernetes <strong>orchestrates containers across many machines</strong> using a{" "}
              <strong>declarative desired state</strong> and <strong>reconciliation loops</strong>.
            </li>
            <li>
              The <strong>control plane</strong> (API server, etcd, scheduler, controllers) decides.{" "}
              <strong>Nodes</strong> (kubelet, runtime) run <strong>pods</strong>.
            </li>
            <li>
              Core objects:
              <ul>
                <li>
                  <strong>Pods</strong> (disposable units),
                </li>
                <li>
                  <strong>Deployments</strong> (stateless apps, rolling updates),
                </li>
                <li>
                  <strong>StatefulSets / DaemonSets / Jobs / CronJobs</strong>,
                </li>
                <li>
                  <strong>Services</strong> (stable names), <strong>Ingress / Gateway API</strong> (external HTTP),
                </li>
                <li>
                  <strong>ConfigMaps / Secrets</strong>, <strong>Namespaces</strong>.
                </li>
              </ul>
            </li>
            <li>
              Use <strong>readiness vs liveness</strong> probes correctly, set{" "}
              <strong>resource requests and limits</strong>, and spread replicas across <strong>zones</strong> with{" "}
              <strong>PodDisruptionBudgets</strong>.
            </li>
            <li>
              Scale with <strong>HPA / VPA / cluster autoscaling</strong>, extend with{" "}
              <strong>Helm, operators and GitOps</strong>, and weigh Kubernetes' power against its{" "}
              <strong>complexity</strong>. Simpler platforms may be enough.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>The official Kubernetes documentation: "Concepts"</li>
            <li>The paper "Large-scale cluster management at Google with Borg" (EuroSys 2015)</li>
            <li>
              The article "Borg, Omega, and Kubernetes" by Burns, Grant, Oppenheimer, Brewer and Wilkes (ACM Queue,
              2016)
            </li>
            <li>
              <em>Kubernetes: Up and Running</em> (3rd edition) by Brendan Burns, Joe Beda, Kelsey Hightower and Lachlan
              Evenson
            </li>
            <li>"Kubernetes The Hard Way" by Kelsey Hightower (on GitHub)</li>
            <li>Stripe's engineering blog post on operating Kubernetes reliably</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
