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
    rollingUpdate: { maxUnavailable: 0, maxSurge: 1 }   # no downtime during the update
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
            You have put your services in containers (post 55). Now you have <strong>30 services</strong>, each running{" "}
            <strong>3–20 containers</strong>, across <strong>15 servers</strong>. Someone has to do all of this work:
          </p>
          <ul>
            <li>
              decide <strong>which server</strong> each container runs on, based on the free CPU and memory,
            </li>
            <li>
              <strong>restart</strong> containers that crash, and <strong>move</strong> them when a server dies,
            </li>
            <li>
              <strong>scale</strong> up at 7 PM (add more copies) and down at 3 AM (remove copies),
            </li>
            <li>
              <strong>roll out</strong> new versions without downtime, and <strong>roll back</strong> (go back to the old version) when a new one is bad,
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
            Doing this by hand with scripts and SSH does not scale. <strong>Kubernetes</strong> (often written as{" "}
            <strong>K8s</strong>) is an open-source platform that does all of this <strong>automatically</strong>. You
            describe what you want, and it makes it happen. This kind of work is called{" "}
            <strong>container orchestration</strong>: starting, stopping, placing and connecting many containers like a
            conductor leads an orchestra.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about a <strong>very well organised shipping port</strong>.
          </p>
          <ul>
            <li>
              You give the <strong>port authority</strong> your instructions: "Keep 5 containers of product A and 3 of
              product B available at all times, each with this much space."
            </li>
            <li>
              The <strong>crane operators</strong> (the scheduler) decide which <strong>dock</strong> (a server) has
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
              Customers do not need to know which dock holds what. They go to the <strong>"Product A" counter</strong>,
              which always knows where the current containers are. In Kubernetes, this counter is called a Service.
            </li>
          </ul>
          <p>
            Kubernetes is <strong>declarative</strong>. This means you describe the <strong>desired state</strong> (the result you want),
            for example "I want 5 replicas (copies) of this image, with this much CPU, reachable at this name". You do
            not write the steps. Kubernetes then <strong>keeps working to make reality match your description</strong>.
            The opposite style is <em>imperative</em>, where you give step-by-step commands.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="key-terms">Key terms in plain words</h3>
          <ul>
            <li>
              <strong>Cluster:</strong> a group of machines that work together as one system.
            </li>
            <li>
              <strong>Node:</strong> one machine (real or virtual) in the cluster. It runs your containers.
            </li>
            <li>
              <strong>Pod:</strong> the smallest thing Kubernetes runs. It holds one or more containers that run together.
            </li>
            <li>
              <strong>Replica:</strong> one copy of a pod. "5 replicas" means 5 identical copies.
            </li>
            <li>
              <strong>Control plane:</strong> the part of Kubernetes that makes decisions. The nodes do the actual work.
            </li>
            <li>
              <strong>YAML:</strong> a simple text format for settings, written as indented keys and values. You write
              your Kubernetes objects in YAML.
            </li>
            <li>
              <strong>kubectl:</strong> the command-line tool you use to talk to a cluster.
            </li>
            <li>
              <strong>Label and selector:</strong> a label is a key=value tag on an object (like <code>app: orders-api</code>).
              A selector is a rule that finds all objects with a given label.
            </li>
            <li>
              <strong>Endpoints:</strong> the list of pod addresses that a Service currently sends traffic to. Only
              ready pods are on the list.
            </li>
            <li>
              <strong>Stateless and stateful:</strong> a stateless app keeps no important data inside itself, so any copy
              can be replaced. A stateful app (like a database) keeps data that must not be lost.
            </li>
          </ul>
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
              <strong>kube-apiserver:</strong> the front door. Every change goes through its API (a set of web requests that tools can call).
            </li>
            <li>
              <strong>etcd:</strong> a small database that stores data as key-value pairs. It keeps copies on several
              machines and uses the Raft algorithm (post 24), a method that lets several machines vote and agree on one value, so the copies always agree. It holds all cluster state.{" "}
              <strong>Back it up.</strong>
            </li>
            <li>
              <strong>kube-scheduler:</strong> chooses a node for each new pod. It looks at the resources the pod asks
              for, any placement rules, and how to spread pods out.
            </li>
            <li>
              <strong>controller-manager:</strong> runs many <strong>controllers</strong>. A controller is a loop that
              watches the state and fixes any difference from what you asked for.
            </li>
          </ul>
          <p>
            <strong>Worker nodes (the muscle):</strong>
          </p>
          <ul>
            <li>
              <strong>kubelet:</strong> a small program (an agent) on each node. It starts and stops containers and
              reports their status to the control plane.
            </li>
            <li>
              <strong>Container runtime:</strong> the program that actually runs the containers, such as containerd or
              CRI-O. It runs OCI images (post 55).
            </li>
            <li>
              <strong>kube-proxy / CNI network plugin:</strong> these set up the network between pods and send Service
              traffic to the right pod. (CNI means Container Network Interface.)
            </li>
          </ul>
          <p>
            Managed services (<strong>Amazon EKS, Google GKE, Azure AKS</strong> and others) run the control plane for
            you. Most teams use one of these instead of running the control plane themselves.
          </p>
          <h3 id="the-reconciliation-loop">The reconciliation loop</h3>
          <p>This loop is the main idea of Kubernetes. A "loop" here is a job that repeats forever:</p>
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
            Every controller does this, over and over. Say a node dies and 2 pods disappear. The Deployment's controller
            sees <strong>"desired 5, current 3"</strong> and creates 2 new pods on other nodes.{" "}
            <strong>You do not write the recovery steps. You only state the goal.</strong>
          </p>
          <h3 id="core-objects">Core objects</h3>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Pod</h4>
          <p>
            A pod is the <strong>smallest unit you can deploy</strong>. It is one or more containers that{" "}
            <strong>share</strong> one network address (IP) and can share storage volumes.
          </p>
          <ul>
            <li>
              Usually there is <strong>one main container</strong> per pod. Sometimes there are also{" "}
              <strong>sidecars</strong>: helper containers that run next to the main one, such as a logging agent or a
              service-mesh proxy (post 54).
            </li>
            <li>
              Pods are <strong>disposable</strong>. They are replaced, not repaired, and each new pod gets a new IP.
              Never depend on one specific pod.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deployment (and ReplicaSet)</h4>
          <p>
            A <strong>Deployment</strong> is the most common way to run <strong>stateless</strong> apps. It says "run N
            copies of this pod template, and update them safely". (A pod template is the blueprint for the pods.)
          </p>
          <CodeBlock lang="yaml" code={code1} />
          <p>
            The Deployment manages <strong>ReplicaSets</strong>. A ReplicaSet keeps the right number of pods running.
            Say you change the image to <code>1.4.3</code>. The Deployment then does a <strong>rolling update</strong>:
            it starts new pods and stops old ones a little at a time, so the app stays up. In the example above,{" "}
            <code>maxUnavailable: 0</code> and <code>maxSurge: 1</code> mean that no pod may be missing, and at most one extra pod may exist during the update. The command{" "}
            <strong>
              <code>kubectl rollout undo</code>
            </strong>{" "}
            goes back to the previous version.
          </p>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Other workload types</h4>
          <ul>
            <li>
              <strong>StatefulSet:</strong> for <strong>stateful</strong> apps (databases, Kafka, which passes streams of messages between programs, or ZooKeeper, a coordination service). Its pods get{" "}
              <strong>fixed names</strong> (<code>db-0</code>, <code>db-1</code>), <strong>their own storage that stays with them</strong>, and
              they start and stop in a set order.
            </li>
            <li>
              <strong>DaemonSet:</strong> runs <strong>one pod on every node</strong>. It is used for log collectors, monitoring
              agents and network plugins.
            </li>
            <li>
              <strong>Job:</strong> runs pods <strong>until the work is finished</strong>, then stops. Examples are a database migration or a batch
              import.
            </li>
            <li>
              <strong>CronJob:</strong> runs Jobs <strong>on a schedule</strong>, like "every night at 2 AM" (post 38).
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Service: a stable address for changing pods</h4>
          <p>
            Pods come and go, so their IPs keep changing. A <strong>Service</strong> fixes this. It gives a set of pods (chosen by{" "}
            <strong>labels</strong>) one <strong>stable name and virtual IP</strong>. It also load-balances (shares) the
            traffic between the pods that are <strong>ready</strong> (post 54):
          </p>
          <CodeBlock lang="yaml" code={code2} />
          <p>
            Other pods can now call <code>http://orders-api</code>. The cluster DNS (the name lookup service) turns that name into the Service IP.
          </p>
          <p>
            <strong>Service types:</strong>
          </p>
          <ul>
            <li>
              <strong>ClusterIP</strong> (the default): reachable <strong>inside</strong> the cluster only.
            </li>
            <li>
              <strong>NodePort:</strong> opens the same port on every node. It is rarely used directly.
            </li>
            <li>
              <strong>LoadBalancer:</strong> asks the cloud provider to create an <strong>external load balancer</strong> (a machine that
              spreads incoming traffic, post 12).
            </li>
            <li>
              <strong>Headless</strong> (<code>clusterIP: None</code>): has no single virtual IP. DNS returns the IPs of the individual pods. It is often used with
              StatefulSets.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Ingress and Gateway API: HTTP traffic from outside</h4>
          <p>
            An <strong>Ingress</strong> routes web traffic (HTTP and HTTPS) from outside the cluster to Services. It
            chooses the Service by <strong>host name and path</strong>, and it can handle TLS (the encryption for HTTPS).
            The <strong>Gateway API</strong> is the newer and more powerful design for the same job. The Kubernetes
            project now adds new features only to the Gateway API, and the Ingress API is frozen. An{" "}
            <strong>Ingress controller</strong> (NGINX, Traefik, Envoy-based gateways or cloud load balancers) is the
            program that does the actual work. It is an L7 load balancer and reverse proxy (posts 12–13) that Kubernetes
            manages. "L7" means it understands HTTP. A reverse proxy is a server that receives requests for your
            servers and passes them on.
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
              <strong>ConfigMap:</strong> settings that are not secret (feature settings, URLs). They are given to the
              container as environment variables or files.
            </li>
            <li>
              <strong>Secret:</strong> sensitive values such as passwords. ⚠️ By default they are only{" "}
              <strong>base64-encoded</strong>. Base64 is a way to write data as text. It is not encryption, and anyone can
              decode it. So turn on <strong>encryption at rest</strong> for etcd (data is encrypted on disk), limit access
              with RBAC (rules about who may do what), and think about syncing secrets from an external secrets manager
              (post 51).
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Namespaces</h4>
          <p>
            <strong>Namespaces</strong> divide one cluster into <strong>virtual sections</strong> (for example <code>payments</code>
            , <code>search</code> and <code>staging</code>). Each section has its own resources, access rules (RBAC) and quotas
            (limits). They are useful for separating teams and environments. But{" "}
            <strong>on their own they are not a strong security wall</strong>. Add NetworkPolicies and RBAC.
          </p>
          <h3 id="health-checks-liveness-readiness-startup">Health checks: liveness, readiness, startup</h3>
          <p>
            A <strong>probe</strong> is a check that Kubernetes runs on a container again and again, for example by calling a URL such as{" "}
            <code>/healthz</code>. The answer decides what Kubernetes does next. There are three kinds.
          </p>
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
                verdict: <>Java (JVM) apps and others with a long start-up</>,
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
            <strong>database</strong>. If the database has a short problem, <strong>every pod restarts at once</strong>.
            This makes the outage much worse. Liveness should only check "is this process healthy?". Use readiness, with
            care, for temporary "not ready" states (post 12).
          </p>
          <h3 id="resources-scheduling-and-scaling">Resources, scheduling and scaling</h3>
          <p>
            <strong>Requests and limits:</strong>
          </p>
          <ul>
            <li>
              <strong>Requests:</strong> the amount of CPU and memory the pod is <strong>guaranteed</strong>. The scheduler uses it to choose a node for the pod.
            </li>
            <li>
              <strong>Limits:</strong> the <strong>most</strong> the pod may use. If it goes over the <strong>memory</strong>{" "}
              limit, the container is killed ("OOMKilled", where OOM means out of memory). If it reaches the <strong>CPU</strong> limit, it is slowed down
              (this is called throttling). In the example, <code>250m</code> means 250 millicores, which is a quarter of one CPU core.
            </li>
            <li>
              Setting requests correctly matters for both <strong>reliability</strong> and <strong>cost</strong>.
            </li>
          </ul>
          <p>
            <strong>Scaling:</strong>
          </p>
          <ul>
            <li>
              <strong>Horizontal Pod Autoscaler (HPA):</strong> adds or removes <strong>pods</strong> automatically. It
              looks at CPU, memory or custom metrics (like requests per second or queue length). "Horizontal" means more
              copies, not bigger ones:
            </li>
          </ul>
          <CodeBlock lang="yaml" code={code3} />
          <ul>
            <li>
              <strong>Vertical Pod Autoscaler (VPA):</strong> changes a pod's <strong>requests and limits</strong> based
              on what it really uses. "Vertical" means a bigger pod, not more pods.
            </li>
            <li>
              <strong>Cluster Autoscaler / Karpenter:</strong> tools that add or remove <strong>nodes</strong>. They add nodes when
              pods cannot be placed, and remove nodes that are barely used.
            </li>
            <li>
              <strong>Event-driven autoscaling (KEDA):</strong> a tool that scales based on events, such as queue length or Kafka lag
              (how far a consumer is behind). It can even scale down to zero pods.
            </li>
          </ul>
          <p>
            <strong>Spreading for availability:</strong> use <strong>topology spread constraints</strong> or{" "}
            <strong>pod anti-affinity</strong> (rules that keep pods apart) to spread replicas across{" "}
            <strong>nodes and availability zones</strong>. An availability zone is one or more separate data centres inside one region, with their own power and network.
            This way, one failure does not take out every replica (post 40). A <strong>PodDisruptionBudget</strong>{" "}
            limits how many replicas planned maintenance may remove (evict) at the same time. Bin-packing means fitting many pods tightly onto few nodes to save money.
          </p>
          <h3 id="storage">Storage</h3>
          <ul>
            <li>
              <strong>Volumes</strong> attach storage to pods. A plain volume may disappear with the pod.
            </li>
            <li>
              <strong>PersistentVolume (PV):</strong> a piece of storage that lives on after the pod is gone (like a cloud disk).
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
            You can run databases on Kubernetes, often with <strong>operators</strong> (explained below). But many teams
            choose <strong>managed databases</strong> outside the cluster because they are simpler.
          </p>
          <h3 id="security-basics">Security basics</h3>
          <ul>
            <li>
              <strong>RBAC</strong> (role-based access control) decides who can do what through the API. "Who" can be people or service accounts (identities for programs).
            </li>
            <li>
              <strong>NetworkPolicies</strong> control which pods may talk to which. By default, every pod can talk to every other pod.
            </li>
            <li>
              <strong>Pod security:</strong> run as non-root, with a read-only root file system and only the Linux capabilities you need
              (post 55).
            </li>
            <li>
              <strong>Admission policies</strong> (tools like Kyverno or OPA Gatekeeper) check every new object and reject unsafe ones.
            </li>
            <li>
              <strong>Keep the cluster and nodes patched</strong>, and scan images.
            </li>
          </ul>
          <h3 id="the-ecosystem">The ecosystem</h3>
          <ul>
            <li>
              <strong>Helm:</strong> a package manager for Kubernetes (like npm for your cluster). It bundles YAML files into reusable,
              configurable packages called "charts".
            </li>
            <li>
              <strong>Kustomize:</strong> keeps one base set of YAML and adds small changes on top for each environment (it is built into{" "}
              <code>kubectl</code>).
            </li>
            <li>
              <strong>Operators:</strong> controllers that contain expert knowledge about running complex software ("how to
              run PostgreSQL or Kafka"). They add new object types to Kubernetes with{" "}
              <strong>Custom Resource Definitions (CRDs)</strong>.
            </li>
            <li>
              <strong>GitOps (Argo CD, Flux):</strong> you keep the desired state in <strong>Git</strong>, and a controller
              keeps the cluster the same as the repository (post 58).
            </li>
            <li>
              <strong>Service meshes (Istio, Linkerd):</strong> a layer of helper proxies that gives services mTLS
              (both sides prove who they are and encrypt the traffic), traffic control and observability (the ability to see what is happening) between services
              (posts 51 and 54).
            </li>
          </ul>
          <h3 id="do-you-need-kubernetes">Do you need Kubernetes?</h3>
          <p>
            Kubernetes is powerful, but it is <strong>complex</strong>. <strong>It is a good fit when you have:</strong>
          </p>
          <ul>
            <li>many services and teams,</li>
            <li>a need for portability across clouds or on-premises,</li>
            <li>a platform team to run it,</li>
            <li>workloads that benefit from bin-packing, auto-scaling and self-healing (automatic restart and replacement of failed parts).</li>
          </ul>
          <p>
            <strong>It may not be a good fit (yet) when you have:</strong>
          </p>
          <ul>
            <li>a small app or small team,</li>
            <li>
              or a simpler managed platform (a PaaS, serverless, or a managed container service like AWS ECS/Fargate
              or Google Cloud Run) that would do the job with far less work to run it (post 57).
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
              ❌ <strong>Complexity:</strong> there are many concepts, a lot of YAML, and hard topics like networking, security and
              upgrades. It takes real time to learn (a steep <strong>learning curve</strong>).
            </li>
            <li>
              ❌ <strong>Operational cost:</strong> even with managed control planes, someone must manage nodes,
              add-ons, upgrades, security and cost.
            </li>
            <li>
              ❌ <strong>Easy to set up wrongly:</strong> wrong probes, missing resource requests, no
              PodDisruptionBudgets, network policies that are too open.
            </li>
            <li>
              ❌ <strong>Stateful workloads</strong> need extra care (StatefulSets, operators, backups).
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>From Borg to Kubernetes.</strong> Google ran its services for years on <strong>Borg</strong>, an
            internal cluster manager, and later on <strong>Omega</strong>. Engineers who worked on them created{" "}
            <strong>Kubernetes</strong>. Google made it open source in <strong>2014</strong> and released version 1.0 in 2015.
            At that time it was given to the newly formed Cloud Native Computing Foundation. The paper "Borg, Omega, and
            Kubernetes" explains the lessons that were carried over.
          </p>
          <p>
            <strong>Pokémon GO (2016).</strong> Pokémon GO ran on Google Kubernetes Engine at launch. Google said
            that traffic reached <strong>many times</strong> the worst case they had planned for, within days. The game
            scaled up quickly on the platform. It is a famous example of Kubernetes scaling during a sudden,
            unexpected spike.
          </p>
          <p>
            <strong>Spotify's migration.</strong> Spotify had built its own container orchestration tool (Helios). Later it moved to Kubernetes to
            use the larger community and tools around it, instead of keeping its own system.
          </p>
          <p>
            <strong>Stripe and Kubernetes.</strong> Stripe has written about how it learned to run Kubernetes reliably.
            It tested a lot, adopted it step by step, and built trust before moving critical workloads. This shows that
            adopting Kubernetes is a <strong>long process</strong>, not a single switch.
          </p>
          <p>
            <strong>Kubernetes everywhere.</strong> Today, Kubernetes runs in every major cloud (EKS, GKE, AKS), in
            company data centres, and even on edge devices (small machines near the user) and in retail stores. It has become the common "operating system"
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
                      It runs many containers across many machines in a reliable way. It places containers on nodes, restarts
                      failed ones, replaces lost nodes, rolls out new versions with no downtime, finds and balances
                      services, handles config and secrets, and scales automatically. All of this is driven by a
                      declared desired state.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is the reconciliation loop?</>,
                a: (
                  <>
                    <p>
                      Controllers keep comparing the desired state (stored through the API server in etcd) with the actual
                      state. When they differ, they act to close the gap by creating, deleting or updating pods. This is
                      why Kubernetes heals itself: the pods of a dead node are simply created again on another node.
                    </p>
                  </>
                ),
              },
              {
                q: <>Pod, Deployment, Service — what's the difference?</>,
                a: (
                  <>
                    <p>
                      A pod is the smallest unit. It is one or more closely linked containers that share one network
                      namespace (the same IP). A Deployment manages a set of identical pods and rolls out new versions.
                      A Service gives a stable name and virtual IP, and it shares traffic between the ready pods that
                      match a label selector.
                    </p>
                  </>
                ),
              },
              {
                q: <>Liveness vs readiness probes?</>,
                a: (
                  <>
                    <p>
                      Readiness decides whether a pod gets traffic. If it fails, the pod is taken out of the Service
                      endpoints, but it is not restarted. Liveness decides whether the container is stuck. If it fails,
                      the container is restarted. Do not make liveness depend on outside services. If it does, one short
                      database problem can restart everything.
                    </p>
                  </>
                ),
              },
              {
                q: <>What are resource requests and limits?</>,
                a: (
                  <>
                    <p>
                      Requests are what the scheduler reserves when it places a pod. Limits cap what the pod may use. A
                      container that reaches its CPU limit is slowed down (throttled). A container that goes over its
                      memory limit is killed (OOM-killed). Set requests from real usage, and always set memory limits.
                    </p>
                  </>
                ),
              },
              {
                q: <>Does every team need Kubernetes?</>,
                a: (
                  <>
                    <p>
                      No. It adds a lot of work to run and understand. Small teams are often better served by a PaaS,
                      serverless or a managed container service. Kubernetes pays off when you have many services,
                      several teams and a platform team. A managed offering like EKS, GKE or AKS also helps.
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
