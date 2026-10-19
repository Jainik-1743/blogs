import type { ExplainerData } from "../types.ts";

/** Explainers for the "docker-kubernetes" series. Names must start with "docker-kubernetes-" followed by the lesson number. */
export const DATA: ExplainerData = {
  /* ------------------------------------------------------------ lesson 0 */
  "docker-kubernetes-0-container-is-a-process": {
    kind: "flow",
    title: "A container is a process with a private view and limits",
    nodes: [
      { id: "image", label: "Image", sub: "read-only layers", col: 0, row: 0, tone: "store" },
      { id: "wl", label: "Writable layer", sub: "one per container", col: 0, row: 2, tone: "data" },
      { id: "proc", label: "Process", sub: "sleep 300", col: 1.7, row: 1, tone: "server" },
      { id: "ns", label: "Namespaces", sub: "its own view", col: 3.4, row: 0, tone: "client" },
      { id: "cg", label: "cgroup", sub: "its limits", col: 3.4, row: 2, tone: "warn" },
    ],
    edges: [
      { id: "e-img", from: "image", to: "proc", label: "its files (/)" },
      { id: "e-wl", from: "wl", to: "proc", label: "its writes" },
      { id: "e-ns", from: "ns", to: "proc", label: "what it sees" },
      { id: "e-cg", from: "cg", to: "proc", label: "what it may use" },
    ],
    steps: [
      {
        title: "A container is a normal process on the host",
        note: "docker run busybox sleep 300 starts one ordinary process. The host can see it with ps. There is no second operating system, just the same kernel with extra rules.",
        appear: ["proc"],
        focus: ["proc"],
      },
      {
        title: "Its files come from the image",
        note: "The process sees a private root folder built from the image. Images are immutable and made of layers. The busybox image has one layer of about 2.2 MB.",
        appear: ["image", "e-img"],
        focus: ["image", "e-img"],
      },
      {
        title: "Writes go to a thin layer on top",
        note: "The image never changes. Each container gets its own writable layer. Two containers from one image share the image layers, but a file written in one is invisible in the other.",
        appear: ["wl", "e-wl"],
        focus: ["wl", "e-wl"],
      },
      {
        title: "Namespaces give it a private view",
        note: "In the lesson's check, five of the numbers differed from the host: pid, net, mnt, uts and ipc. So the container has its own process list, network, file system view, hostname and shared memory.",
        appear: ["ns", "e-ns"],
        set: { ns: "pid net mnt uts ipc" },
        focus: ["ns", "e-ns"],
      },
      {
        title: "cgroups limit what it may use",
        note: "Namespaces control what a process can see, not how much it eats. With --memory 64m --cpus 0.5 --pids-limit 50, the kernel counts and caps memory, CPU time and the number of processes.",
        appear: ["cg", "e-cg"],
        set: { cg: "64 MiB, 0.5 CPU, 50 pids" },
        focus: ["cg", "e-cg"],
      },
      {
        title: "Go over the memory limit and the kernel kills it",
        note: "A loop that kept growing a string, run with a 32 MB limit, was killed by the kernel. The exit code is 137, which is 128 + 9 (SIGKILL), and Docker records OOMKilled=true.",
        set: { cg: "limit 32 MB reached", proc: "killed, exit 137" },
        focus: ["cg", "proc"],
      },
      {
        title: "docker rm throws the writable layer away",
        note: "Containers are meant to be thrown away. When the container is removed, its writable layer goes with it. Data that must stay needs a volume, which lesson 2 covers.",
        set: { wl: "deleted with the container", proc: "removed" },
        focus: ["wl"],
      },
    ],
  },

  /* ------------------------------------------------------------ lesson 1 */
  "docker-kubernetes-1-build-cache": {
    kind: "flow",
    title: "Why instruction order decides how fast a rebuild is",
    nodes: [
      { id: "g1", label: "COPY package.json", sub: "good Dockerfile", col: 0, row: 0, tone: "server" },
      { id: "g2", label: "RUN npm ci", col: 1.5, row: 0, tone: "server" },
      { id: "g3", label: "COPY src", col: 3, row: 0, tone: "server" },
      { id: "g4", label: "RUN npm run build", col: 4.5, row: 0, tone: "server" },
      { id: "b1", label: "COPY . /app", sub: "bad Dockerfile", col: 0, row: 1.4, tone: "warn" },
      { id: "b2", label: "RUN npm install", col: 1.5, row: 1.4, tone: "warn" },
      { id: "b3", label: "RUN npm run build", col: 3, row: 1.4, tone: "warn" },
    ],
    edges: [
      { id: "eg1", from: "g1", to: "g2" },
      { id: "eg2", from: "g2", to: "g3" },
      { id: "eg3", from: "g3", to: "g4" },
      { id: "eb1", from: "b1", to: "b2" },
      { id: "eb2", from: "b2", to: "b3" },
    ],
    steps: [
      {
        title: "The good file copies only package files first",
        note: "It copies package.json and the lock file, installs with npm ci, and only then copies the source. Dependencies change rarely and source changes all the time, so the slow step gets cached.",
        appear: ["g1", "g2", "g3", "g4", "eg1", "eg2", "eg3"],
        focus: ["g1", "g2"],
      },
      {
        title: "The bad file copies everything first",
        note: "COPY . /app comes before npm install. The copied layer now contains the source files too, so any edit changes it.",
        appear: ["b1", "b2", "b3", "eb1", "eb2"],
        focus: ["b1", "b2"],
      },
      {
        title: "Now edit one line in src/server.ts",
        note: "Docker asks for every step: have I done exactly this before, with the same inputs? For COPY the inputs are the contents of the copied files. Only src and the layers after it have new inputs in the good file.",
        set: { g3: "changed", b1: "changed" },
        focus: ["g3", "b1"],
      },
      {
        title: "Good file: the install is reused",
        note: "The first two steps print CACHED and cost nothing. Only the copy of src and the build run again. Once one step changes, every step after it must run again.",
        set: { g1: "CACHED", g2: "CACHED", g3: "ran", g4: "ran" },
        focus: ["g1", "g2", "g3", "g4"],
      },
      {
        title: "Bad file: npm install runs again",
        note: "The copied layer changed, so every later step is rebuilt, including the install. Docker cannot know that your dependencies did not change.",
        set: { b1: "ran", b2: "ran again", b3: "ran" },
        focus: ["b1", "b2", "b3"],
      },
      {
        title: "7.1 seconds against 1.6 seconds",
        note: "That was a tiny app on a warm network. With hundreds of packages the same shape is minutes against seconds, on every build in CI. Rule: put what changes least at the top and what changes most at the bottom.",
        set: { g4: "total 1.6 s", b3: "total 7.1 s" },
        focus: ["g4", "b3"],
      },
    ],
  },

  /* ------------------------------------------------------------ lesson 2 */
  "docker-kubernetes-2-volume-survives": {
    kind: "flow",
    title: "The container is disposable, the volume is not",
    nodes: [
      { id: "pg1", label: "pg1", sub: "postgres:16-alpine", col: 0, row: 0, tone: "server" },
      { id: "vol", label: "Volume pgdata", sub: "empty", col: 1.8, row: 1.3, tone: "store" },
      { id: "pg2", label: "pg2", sub: "postgres:16-alpine", col: 3.6, row: 0, tone: "server" },
    ],
    edges: [
      { id: "e-pg1", from: "pg1", to: "vol", label: "data folder" },
      { id: "e-pg2", from: "pg2", to: "vol", label: "same data folder" },
    ],
    steps: [
      {
        title: "Create a named volume",
        note: "docker volume create pgdata makes a folder that Docker manages on the host, with its own life cycle. It does not belong to any container.",
        appear: ["vol"],
        focus: ["vol"],
      },
      {
        title: "Start Postgres with the volume on its data folder",
        note: "The flag -v pgdata:/var/lib/postgresql/data mounts the volume where Postgres keeps its files. Without it the data would live in the container's writable layer.",
        appear: ["pg1", "e-pg1"],
        focus: ["pg1", "e-pg1"],
      },
      {
        title: "Create a table and insert a row",
        note: "The table notes and the row 'survives' are written through the container into the volume, not into the container's own layer.",
        set: { vol: "table notes, 1 row", pg1: "wrote the row" },
        focus: ["pg1", "vol"],
      },
      {
        title: "docker rm -f pg1 deletes the container",
        note: "The container and its writable layer are gone. The named volume is not removed by docker rm, so the data is still in /var/lib/docker/volumes/pgdata/_data.",
        hide: ["pg1", "e-pg1"],
        focus: ["vol"],
      },
      {
        title: "A brand-new container uses the same volume",
        note: "pg2 is a new container from the same image. It mounts pgdata on the same data folder and Postgres finds its files as it left them.",
        appear: ["pg2", "e-pg2"],
        focus: ["pg2", "e-pg2"],
      },
      {
        title: "The row is still there",
        note: "select * from notes returns id 1, survives. Remember that named volumes stay until you run docker volume rm or prune, which is safe for data but easy to forget on a disk.",
        set: { pg2: "select: 1, survives" },
        focus: ["pg2", "vol"],
      },
    ],
  },

  "docker-kubernetes-2-name-lookup": {
    kind: "seq",
    title: "Finding a container by name: appnet versus the default bridge",
    actors: [
      { name: "Test container", sub: "runs wget" },
      { name: "Docker DNS", sub: "only on appnet" },
      { name: "web1", sub: "on appnet" },
      { name: "web0", sub: "default bridge" },
    ],
    steps: [
      {
        title: "On appnet the test container asks for web1",
        note: "appnet is a user-defined network. It has an embedded DNS server that maps container names to IP addresses, so wget http://web1:8080 starts with a name lookup.",
        from: 0,
        to: 1,
        label: "where is web1?",
      },
      {
        title: "The embedded DNS answers with an address",
        note: "Docker knows who is on appnet. Names are better than IPs because an IP changes every time a container is recreated.",
        from: 1,
        to: 0,
        label: "web1 is 172.30.0.2",
      },
      {
        title: "The request reaches web1",
        note: "The test container connects to the address and gets the server's own container ID back. Everything on one user-defined network can reach everything else by name.",
        from: 0,
        to: 2,
        label: "GET /hostname",
      },
      {
        title: "On the default bridge the name does not work",
        note: "Now the test container is on the default bridge, and wget http://web0:8080 fails with bad address. The default bridge has no name lookup, so the request never even starts.",
        from: 0,
        to: 0,
        self: true,
        label: "wget web0: bad address",
      },
      {
        title: "Only the raw IP address works there",
        note: "With docker inspect you can find 172.17.0.2 and use it, and it works. But that IP changes when the container is recreated, so you do not want it in config. Always create a network for your app.",
        from: 0,
        to: 3,
        label: "GET http://172.17.0.2:8080",
      },
    ],
  },

  /* ------------------------------------------------------------ lesson 3 */
  "docker-kubernetes-3-startup-race": {
    kind: "seq",
    title: "Started is not ready: depends_on with a health check",
    actors: [
      { name: "Compose", sub: "docker compose up" },
      { name: "db", sub: "Postgres" },
      { name: "api", sub: "Node app" },
    ],
    steps: [
      {
        title: "Compose starts the db container",
        note: "With the short form of depends_on, Compose would now start api straight away, because db is running. That is the start-up race. Here db has a health check, so Compose will wait.",
        from: 0,
        to: 1,
        label: "start notes-db-1",
      },
      {
        title: "Postgres needs a few seconds to get ready",
        note: "The process is running, but it is still setting up and refuses connections. Compose shows the container as health: starting.",
        from: 1,
        to: 1,
        self: true,
        label: "initialising, refusing connections",
      },
      {
        title: "Docker runs the health check on a timer",
        note: "The test is pg_isready, which ships with Postgres. It runs inside the container every 3 seconds, and it exits with 0 only when the server accepts connections.",
        from: 0,
        to: 1,
        label: "pg_isready (every 3 s)",
      },
      {
        title: "Not ready yet, so api keeps waiting",
        note: "While the check fails, Compose prints Waiting. With condition service_healthy it will not start api. Without it, api would start now, get ECONNREFUSED and exit with code 1.",
        from: 1,
        to: 0,
        label: "not ready, try again",
      },
      {
        title: "The check succeeds and db becomes healthy",
        note: "After a success the container is marked healthy. After 10 failures in a row it would be marked unhealthy instead.",
        from: 1,
        to: 0,
        label: "exit 0: Healthy",
      },
      {
        title: "Only now does Compose start api",
        note: "condition: service_healthy is the rule that held api back. The other conditions are service_started (the default) and service_completed_successfully, for one-time jobs such as a migration.",
        from: 0,
        to: 2,
        label: "start notes-api-1",
      },
      {
        title: "api connects to a ready database",
        note: "The connection is accepted on the first try. Remember that depends_on only helps at start-up: the database can restart later, so a robust app still retries its connections.",
        from: 2,
        to: 1,
        label: "connect: accepted",
      },
    ],
  },

  /* ------------------------------------------------------------ lesson 4 */
  "docker-kubernetes-4-reconcile-loop": {
    kind: "flow",
    title: "From kubectl apply to running Pods, and self-healing",
    nodes: [
      { id: "you", label: "kubectl", sub: "apply Deployment", col: 0, row: 1, tone: "client" },
      { id: "api", label: "API server", sub: "the front door", col: 1.7, row: 1, tone: "server" },
      { id: "etcd", label: "etcd", sub: "keeps all state", col: 1.7, row: 0, tone: "data" },
      { id: "ctrl", label: "Controllers", sub: "desired vs current", col: 3.4, row: 0, tone: "queue" },
      { id: "sch", label: "Scheduler", sub: "picks a node", col: 3.4, row: 1, tone: "queue" },
      { id: "kub", label: "kubelet", sub: "on each node", col: 3.4, row: 2, tone: "queue" },
      { id: "pods", label: "Pods", sub: "none yet", col: 1.7, row: 2, tone: "store" },
    ],
    edges: [
      { id: "e-apply", from: "you", to: "api", label: "3 replicas" },
      { id: "e-etcd", from: "api", to: "etcd", label: "store" },
      { id: "e-ctrl", from: "ctrl", to: "api", label: "create objects" },
      { id: "e-sch", from: "sch", to: "api", label: "set node name" },
      { id: "e-kub", from: "kub", to: "pods", label: "start containers" },
    ],
    steps: [
      {
        title: "kubectl sends the Deployment to the API server",
        note: "Everything in Kubernetes goes through the API server. It checks the request, and the object says what you want: 3 replicas of notes-api. That is the desired state.",
        appear: ["you", "api", "e-apply"],
        focus: ["you", "e-apply", "api"],
      },
      {
        title: "The API server stores it in etcd",
        note: "etcd is the database of the cluster. The object is now saved, but nothing runs yet. Kubernetes only recorded your wish.",
        appear: ["etcd", "e-etcd"],
        focus: ["etcd", "e-etcd"],
      },
      {
        title: "Controllers see a gap and create Pod objects",
        note: "A controller is a loop: compare desired with current, and fix the difference. The Deployment controller makes a ReplicaSet, and the ReplicaSet controller makes 3 Pod objects. It asks the API server and does not run anything itself.",
        appear: ["ctrl", "e-ctrl", "pods"],
        set: { pods: "3 created, no node" },
        focus: ["ctrl", "e-ctrl", "pods"],
      },
      {
        title: "The scheduler gives each Pod a node",
        note: "The scheduler looks for Pods with no node and writes a node name into each one, again through the API server. It never talks to the kubelet directly.",
        appear: ["sch", "e-sch"],
        set: { pods: "3 with a node" },
        focus: ["sch", "e-sch"],
      },
      {
        title: "The kubelet on that node starts the containers",
        note: "Every kubelet watches the API for Pods assigned to its node. When it sees one, it starts the containers through the container runtime and keeps watching them.",
        appear: ["kub", "e-kub"],
        set: { pods: "3 Running" },
        focus: ["kub", "e-kub", "pods"],
      },
      {
        title: "Delete one Pod: desired is 3, current is 2",
        note: "In the lesson's experiment, kubectl delete pod removed one of the three Pods. Nothing is wrong with the Deployment, the world just changed.",
        set: { pods: "2 Running", you: "delete one Pod" },
        focus: ["pods", "you"],
      },
      {
        title: "The loop notices and closes the gap",
        note: "The ReplicaSet controller sees 2 where the spec says 3 and creates a new Pod within seconds. It is not a repair program. It just keeps comparing, forever.",
        set: { pods: "3 Running again" },
        focus: ["ctrl", "e-ctrl", "pods"],
      },
    ],
  },

  /* ------------------------------------------------------------ lesson 5 */
  "docker-kubernetes-5-service-to-pods": {
    kind: "flow",
    title: "A Service gives changing Pods one stable address",
    nodes: [
      { id: "client", label: "Client pod", sub: "calls notes-api", col: 0, row: 1, tone: "client" },
      { id: "dns", label: "Cluster DNS", sub: "name to virtual IP", col: 1.7, row: 0, tone: "server" },
      { id: "svc", label: "Service notes-api", sub: "ClusterIP, port 80", col: 1.7, row: 1, tone: "server" },
      { id: "eps", label: "EndpointSlice", sub: "ready Pod addresses", col: 1.7, row: 2, tone: "data" },
      { id: "pa", label: "Pod A", sub: "app: notes-api", col: 3.4, row: 0, tone: "store" },
      { id: "pb", label: "Pod B", sub: "app: notes-api", col: 3.4, row: 1, tone: "store" },
      { id: "pc", label: "Pod C", sub: "app: notes-api", col: 3.4, row: 2, tone: "store" },
    ],
    edges: [
      { id: "e-dns", from: "client", to: "dns", label: "notes-api?" },
      { id: "e-svc", from: "client", to: "svc", label: "port 80" },
      { id: "e-eps", from: "eps", to: "svc", label: "who is ready?" },
      { id: "e-sa", from: "svc", to: "pa" },
      { id: "e-sb", from: "svc", to: "pb", label: "one chosen Pod" },
      { id: "e-sc", from: "svc", to: "pc" },
    ],
    steps: [
      {
        title: "Pods come and go, and each one has its own IP",
        note: "A dead Pod is replaced by a new one with a new IP. Scaling changes the set, and a rolling update replaces all of them. A client cannot depend on any single address.",
        appear: ["pa", "pb", "pc"],
        focus: ["pa", "pb", "pc"],
      },
      {
        title: "The client uses a name, not an IP",
        note: "As in Compose, you connect to a name. Cluster DNS gives every Service a name like notes-api, and the full form is notes-api.default.svc.cluster.local.",
        appear: ["client", "dns", "e-dns"],
        focus: ["client", "dns", "e-dns"],
      },
      {
        title: "The Service has a virtual IP that never changes",
        note: "The default type is ClusterIP. The address is virtual: no network card owns it. It lasts for the life of the Service and only works inside the cluster.",
        appear: ["svc", "e-svc"],
        focus: ["svc", "e-svc"],
      },
      {
        title: "A label selector finds the Pods",
        note: "The Service selects Pods labelled app: notes-api. A control loop keeps an EndpointSlice up to date: the list of Pod addresses behind the Service, with a ready flag for each.",
        appear: ["eps", "e-eps", "e-sa", "e-sb", "e-sc"],
        focus: ["eps", "e-eps", "e-sa", "e-sb", "e-sc"],
      },
      {
        title: "kube-proxy rules send each connection to one Pod",
        note: "Each node programs packet rules that rewrite the virtual IP to one ready Pod. There is no central proxy for ClusterIP traffic. The choice is made when the connection opens.",
        focus: ["client", "svc", "e-sb", "pb"],
      },
      {
        title: "A Pod is replaced and the client notices nothing",
        note: "Pod B dies and a new Pod takes its place with a new IP. The EndpointSlice is updated. The client still calls the same name and the same virtual IP.",
        set: { pb: "new Pod, new IP" },
        focus: ["pb", "eps"],
      },
      {
        title: "A Pod that is not ready gets no traffic",
        note: "Pod C is running but its readiness check fails. It stays in the list with a not-ready flag and the Service skips it. If the list is ever empty, no Pod matched the selector or none is ready.",
        hide: ["e-sc"],
        set: { pc: "running, not ready" },
        focus: ["pc", "eps"],
      },
    ],
  },

  /* ------------------------------------------------------------ lesson 6 */
  "docker-kubernetes-6-config-change": {
    kind: "flow",
    title: "What happens to a pod when its ConfigMap changes",
    nodes: [
      { id: "cm", label: "ConfigMap notes-config", sub: "LOG_LEVEL=info", col: 0, row: 1, tone: "store" },
      { id: "pa", label: "Pod A: env var", sub: "LOG_LEVEL=info", col: 1.8, row: 0, tone: "server" },
      { id: "pb", label: "Pod B: volume file", sub: "file says info", col: 1.8, row: 2, tone: "server" },
      { id: "pn", label: "New Pod", sub: "starts with debug", col: 3.6, row: 0, tone: "data" },
    ],
    edges: [
      { id: "e-a", from: "cm", to: "pa", label: "read at start" },
      { id: "e-b", from: "cm", to: "pb", label: "mounted as file" },
      { id: "e-n", from: "pa", to: "pn", label: "rollout restart", dashed: true },
    ],
    steps: [
      {
        title: "Two Pods read the same ConfigMap",
        note: "Pod A takes LOG_LEVEL as an environment variable. Pod B mounts the ConfigMap as a volume, so each key becomes a file. The ConfigMap by itself does nothing until a Pod refers to it.",
        appear: ["cm", "pa", "pb", "e-a", "e-b"],
        focus: ["cm", "pa", "pb"],
      },
      {
        title: "You change LOG_LEVEL to debug",
        note: "The ConfigMap object is updated at once. The question is what the running Pods do about it.",
        set: { cm: "LOG_LEVEL=debug" },
        focus: ["cm"],
      },
      {
        title: "The environment variable never changes",
        note: "The environment of a container is fixed when it starts. Pod A keeps saying info until it is replaced. This is a common interview trap.",
        focus: ["pa"],
      },
      {
        title: "The mounted file updates after a delay",
        note: "The kubelet syncs the volume on its normal loop, so the delay can be around a minute. Your app must re-read the file to notice. A file mounted with subPath would never update.",
        set: { pb: "file says debug, later" },
        focus: ["pb", "e-b"],
      },
      {
        title: "kubectl rollout restart replaces the Pods",
        note: "The simplest way to roll out a config change is to make Kubernetes replace the Pods one by one. The new Pods read the new value when they start.",
        appear: ["pn", "e-n"],
        set: { pa: "being replaced" },
        focus: ["pn", "e-n"],
      },
    ],
  },

  "docker-kubernetes-6-claim-and-volume": {
    kind: "flow",
    title: "A claim finds storage: PVC, StorageClass and PV",
    nodes: [
      { id: "pod", label: "Pod", sub: "mounts claim uploads", col: 0, row: 1, tone: "server" },
      { id: "pvc", label: "PVC uploads", sub: "asks for 5Gi, RWO", col: 1.6, row: 1, tone: "queue" },
      { id: "sc", label: "StorageClass", sub: "default class", col: 3.2, row: 0, tone: "client" },
      { id: "pv", label: "Volume (PV)", sub: "none yet", col: 3.2, row: 1, tone: "store" },
      { id: "disk", label: "Real disk", sub: "cloud disk or NFS", col: 4.8, row: 1, tone: "data" },
    ],
    edges: [
      { id: "e-claim", from: "pod", to: "pvc", label: "claimName" },
      { id: "e-sc", from: "sc", to: "pv", label: "provisions" },
      { id: "e-bind", from: "pvc", to: "pv", label: "binds" },
      { id: "e-disk", from: "pv", to: "disk", label: "backed by" },
    ],
    steps: [
      {
        title: "The Pod does not ask for a disk, it asks for a claim",
        note: "Think of renting an apartment. The PersistentVolume is the apartment and the claim is your request: 5Gi, read-write by one node. The developer never needs to know which cloud is underneath.",
        appear: ["pod", "pvc", "e-claim"],
        focus: ["pod", "pvc", "e-claim"],
      },
      {
        title: "With no matching storage, the claim stays Pending",
        note: "If the cluster has no default StorageClass and no matching volume, the claim waits. The lesson's lab showed the event 'no persistent volumes available for this claim', and the Pod that uses it stays Pending too.",
        appear: ["pv"],
        set: { pvc: "Pending" },
        focus: ["pvc", "pv"],
      },
      {
        title: "A StorageClass can make storage on demand",
        note: "Most clusters use dynamic provisioning. The StorageClass says how to create a disk, and its reclaimPolicy and volumeBindingMode decide what happens later.",
        appear: ["sc"],
        focus: ["sc"],
      },
      {
        title: "WaitForFirstConsumer waits for the Pod",
        note: "A cloud disk lives in one zone. If it were created before the Pod is scheduled, it might land in zone A while the Pod runs in zone B and never starts. This mode waits until the Pod has a node.",
        set: { sc: "WaitForFirstConsumer" },
        focus: ["sc"],
      },
      {
        title: "The disk is created and the claim binds to it",
        note: "The provisioner creates the real disk and a PersistentVolume that describes it. The claim then binds to that volume.",
        appear: ["e-sc", "e-bind", "disk", "e-disk"],
        set: { pvc: "Bound", pv: "5Gi volume" },
        focus: ["sc", "pv", "disk"],
      },
      {
        title: "The Pod mounts the folder",
        note: "Now the Pod can start and write to /var/lib/notes/uploads. Deleting the Pod does not delete the claim, so the data outlives the Pod.",
        set: { pod: "mounted, writing" },
        focus: ["pod", "e-claim"],
      },
      {
        title: "Deleting the claim can destroy the disk",
        note: "reclaimPolicy Delete (the default for dynamic volumes) removes the real disk and your data when the claim is deleted. Retain keeps it. Know which one applies before you delete a claim.",
        set: { pv: "Delete: disk removed" },
        focus: ["pvc", "pv"],
      },
    ],
  },

  /* ------------------------------------------------------------ lesson 7 */
  "docker-kubernetes-7-rolling-update": {
    kind: "array",
    title: "A rolling update with maxSurge 1 and maxUnavailable 0",
    cells: ["v1", "v1", "v1", "v1", "-"],
    indexLabels: ["pod 1", "pod 2", "pod 3", "pod 4", "spare"],
    steps: [
      {
        title: "Four ready pods run version 1",
        note: "Each cell is one pod. The Deployment has 4 replicas, maxSurge 1 and maxUnavailable 0. So there may be up to 5 pods during the update, and at least 4 must stay ready.",
        done: [0, 1, 2, 3],
      },
      {
        title: "Start one extra pod with version 2",
        note: "Changing the image creates a new ReplicaSet. The surge pod is allowed because maxSurge is 1. It is running but not ready yet, so it gets no traffic. The 4 old pods keep serving.",
        cells: ["v1", "v1", "v1", "v1", "v2 new"],
        pointers: [{ at: 4, label: "new" }],
        mark: [4],
        done: [0, 1, 2, 3],
      },
      {
        title: "The readiness probe passes",
        note: "The Deployment counts a pod as available only when it is ready. This probe is the gate. If the new version crashed or never got ready, the rollout would stop here and the old pods would keep serving.",
        cells: ["v1", "v1", "v1", "v1", "v2 ready"],
        done: [0, 1, 2, 3, 4],
      },
      {
        title: "Only now may an old pod stop",
        note: "Five pods are ready, so one old pod can go and the count is still 4. With maxUnavailable 0, no pod is ever stopped before a replacement is ready.",
        cells: ["v1 stop", "v1", "v1", "v1", "v2 ready"],
        pointers: [{ at: 0, label: "stop" }],
        mark: [0],
        done: [1, 2, 3, 4],
      },
      {
        title: "Start the next version 2 pod in its place",
        note: "The same dance repeats. A new pod starts, and the ready count stays at 4 until it passes its probe.",
        cells: ["v2 new", "v1", "v1", "v1", "v2 ready"],
        pointers: [{ at: 0, label: "new" }],
        mark: [0],
        done: [1, 2, 3, 4],
      },
      {
        title: "Repeat until one old pod is left",
        note: "Start one, wait for ready, stop one old pod. At every moment at least 4 pods can answer requests, so users see no gap. The price is room for one extra pod and a slower update.",
        cells: ["v2 ready", "v2 ready", "v2 ready", "v1", "v2 ready"],
        done: [0, 1, 2, 3, 4],
      },
      {
        title: "The last old pod stops",
        note: "No replacement is needed now, because 4 version 2 pods are ready. The old ReplicaSet stays at 0 replicas as history, which is what makes kubectl rollout undo possible.",
        cells: ["v2 ready", "v2 ready", "v2 ready", "stopped", "v2 ready"],
        dim: [3],
        done: [0, 1, 2, 4],
      },
    ],
  },

  "docker-kubernetes-7-graceful-shutdown": {
    kind: "seq",
    title: "How a pod is shut down without dropping requests",
    actors: [
      { name: "kubelet", sub: "on the node" },
      { name: "Service endpoints", sub: "who gets traffic" },
      { name: "Your app", sub: "Node.js server" },
    ],
    steps: [
      {
        title: "The pod is marked as terminating",
        note: "A rolling update, a scale down or a node drain all end like this. First the pod is removed from the Service endpoints, so new traffic should stop coming.",
        from: 0,
        to: 1,
        label: "remove this pod",
      },
      {
        title: "The preStop hook runs: sleep 5",
        note: "Other nodes and load balancers need a moment to learn about the change. The sleep keeps the app serving for five more seconds while the news spreads. It is a boring and effective fix.",
        from: 0,
        to: 2,
        label: "preStop: sleep 5",
      },
      {
        title: "A late request still arrives",
        note: "Removal and SIGTERM happen at about the same time, so some requests still arrive after the app is told to stop. Because of the sleep, the app can still answer them.",
        from: 1,
        to: 2,
        label: "last requests arrive",
      },
      {
        title: "The container gets SIGTERM",
        note: "SIGTERM is the polite request to stop. The grace period is terminationGracePeriodSeconds, 30 by default.",
        from: 0,
        to: 2,
        label: "SIGTERM",
      },
      {
        title: "The app finishes in-flight work and exits",
        note: "In Node.js this means calling server.close() in a SIGTERM handler: stop accepting new connections, finish the requests in flight, then exit.",
        from: 2,
        to: 2,
        self: true,
        label: "server.close(), finish requests",
      },
      {
        title: "If the app ignores SIGTERM, it is killed",
        note: "After the grace period, anything still running gets SIGKILL, with exit code 137. A server with no handler makes every rollout wait the full 30 seconds per pod for no reason.",
        from: 0,
        to: 2,
        label: "30 s later: SIGKILL (137)",
      },
    ],
  },

  /* ------------------------------------------------------------ lesson 8 */
  "docker-kubernetes-8-debug-pod-status": {
    kind: "flow",
    title: "Read the status word, then run the matching command",
    nodes: [
      { id: "get", label: "kubectl get pods", sub: "step 1: state", col: 0, row: 1, tone: "client" },
      { id: "pend", label: "Pending", sub: "never placed", col: 1.7, row: 0, tone: "warn" },
      { id: "crash", label: "CrashLoopBackOff", sub: "starts, exits, restarts", col: 1.7, row: 1, tone: "warn" },
      { id: "ready", label: "Running 0/1", sub: "not ready", col: 1.7, row: 2, tone: "warn" },
      { id: "a1", label: "describe pod", sub: "read the events", col: 3.5, row: 0, tone: "server" },
      { id: "a2", label: "logs --previous", sub: "why did the last run die?", col: 3.5, row: 1, tone: "server" },
      { id: "a3", label: "describe pod", sub: "read the probe events", col: 3.5, row: 2, tone: "server" },
    ],
    edges: [
      { id: "e-p", from: "get", to: "pend" },
      { id: "e-c", from: "get", to: "crash" },
      { id: "e-r", from: "get", to: "ready" },
      { id: "e-a1", from: "pend", to: "a1" },
      { id: "e-a2", from: "crash", to: "a2" },
      { id: "e-a3", from: "ready", to: "a3" },
    ],
    steps: [
      {
        title: "Step 1 of the method: look at the state",
        note: "Before you edit any YAML, ask what the thing is doing right now. kubectl get pods shows the status word and the restart count. Steps 1 to 3 cost seconds and nearly always name the cause.",
        appear: ["get"],
        focus: ["get"],
      },
      {
        title: "Pending: the scheduler could not place the Pod",
        note: "The answer is in the events from describe pod. The format is always 0/N nodes are available followed by the reason for each group of nodes.",
        appear: ["pend", "e-p", "a1", "e-a1"],
        set: { a1: "Insufficient cpu" },
        focus: ["pend", "a1", "e-a1"],
      },
      {
        title: "Other Pending reasons look just as clear",
        note: "A node selector that matches no node, or a missing volume claim, shows up as a different message in the same event. Read the reason: it is the whole answer.",
        set: { a1: "node selector, or claim not found" },
        focus: ["a1"],
      },
      {
        title: "CrashLoopBackOff: read the last run's logs",
        note: "The container starts, exits, and is restarted after a wait that doubles (10 s, 20 s, 40 s, up to 5 minutes). logs --previous shows why the last run died. A missing DATABASE_URL is a typical cause.",
        appear: ["crash", "e-c", "a2", "e-a2"],
        set: { a2: "missing DATABASE_URL" },
        focus: ["crash", "a2", "e-a2"],
      },
      {
        title: "Running but 0/1: the readiness probe fails",
        note: "The Pod is up, but the probe says it cannot take traffic, so a Service in front of it has no endpoints. The events from describe pod show Readiness probe failed.",
        appear: ["ready", "e-r", "a3", "e-a3"],
        set: { a3: "Readiness probe failed" },
        focus: ["ready", "a3", "e-a3"],
      },
      {
        title: "Then compare, change one thing, check again",
        note: "Ask what differs from the version that worked: a new image, a new setting, a new limit. Change one thing only and look again, or you will not know what helped.",
        focus: ["a1", "a2", "a3"],
      },
    ],
  },

  /* ------------------------------------------------------------ lesson 9 */
  "docker-kubernetes-9-answer-shape": {
    kind: "flow",
    title: "The four signals of a strong interview answer",
    nodes: [
      { id: "q", label: "Question: how do you keep a database password out of Git and images?", col: 0, row: 0, span: 4, tone: "client" },
      { id: "s1", label: "1. One line first", sub: "Not in the image, and not in a manifest in Git.", col: 0, row: 1, span: 2, tone: "server" },
      { id: "s2", label: "2. The mechanism", sub: "ARG and ENV end up in image layers and in docker history.", col: 2, row: 1, span: 2, tone: "server" },
      { id: "s4", label: "4. A way to check", sub: "docker history on the image: is the value in any layer?", col: 0, row: 2, span: 2, tone: "data" },
      { id: "s3", label: "3. Name the trap", sub: "Secrets are only base64, not encrypted.", col: 2, row: 2, span: 2, tone: "warn" },
    ],
    edges: [
      { id: "e-q", from: "q", to: "s1" },
      { id: "e-12", from: "s1", to: "s2" },
      { id: "e-23", from: "s2", to: "s3" },
      { id: "e-34", from: "s3", to: "s4" },
    ],
    steps: [
      {
        title: "Interviewers listen for four signals",
        note: "Whatever the topic, strong answers show the same four things. Here is one question, and an answer built piece by piece. Say the order of your steps out loud for scenario questions.",
        appear: ["q"],
        focus: ["q"],
      },
      {
        title: "Signal 1: a clear one-line answer first",
        note: "Start with the short version, then add detail, the way 'A container is a process, not a VM' does. Here: the password must never be written into the image or committed to Git.",
        appear: ["s1", "e-q"],
        focus: ["s1", "e-q"],
      },
      {
        title: "Signal 2: the mechanism, not just the name",
        note: "Say how it works. 'Namespaces isolate what it sees, cgroups limit what it uses' is the style. Here: a secret passed with ARG or ENV is stored in the layers, so anyone with the image can read it.",
        appear: ["s2", "e-12"],
        focus: ["s2", "e-12"],
      },
      {
        title: "Signal 3: name the trap",
        note: "Mention the common mistake. People say Kubernetes Secrets are encrypted, but they are only base64 unless encryption at rest is turned on. Use an external secret manager, encryption at rest and tight RBAC.",
        appear: ["s3", "e-23"],
        focus: ["s3", "e-23"],
      },
      {
        title: "Signal 4: say how you would check",
        note: "Showing how you verify is worth more than showing you remember. 'I would run docker history on the image and check that the value is in no layer' is calm and testable.",
        appear: ["s4", "e-34"],
        focus: ["s4", "e-34"],
      },
      {
        title: "Calm, ordered steps beat a fast guess",
        note: "For a scenario like 'the site is down after a deploy', give the order you would look in. All four signals together make an answer that is short, true and easy to follow.",
        focus: ["s1", "s2", "s3", "s4"],
      },
    ],
  },
};
