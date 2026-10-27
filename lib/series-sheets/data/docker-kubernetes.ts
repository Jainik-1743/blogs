import type { CheatSheet } from "../types.ts";

/** Cheat sheet for the "docker-kubernetes" series. See scripts/SERIES-SHEETS.md. */
export const SHEET: CheatSheet | null = {
  intro:
    "Docker and Kubernetes from the process in a box up to probes, rollouts and debugging, plus the answers interviewers ask for. A container is a **process with limits**, not a small VM.",
  sections: [
    {
      title: "What a container is",
      lesson: 0,
      blocks: [
        {
          kind: "points",
          items: [
            "A container is a normal process. **Namespaces** limit what it sees, **cgroups** limit what it can use.",
            "It **shares the host kernel** (same `uname -r`), so it starts fast but is less isolated than a VM.",
            "An **image** is read-only layers plus config. A **container** adds a thin writable layer and a process.",
            "A **tag** can move, a **digest** (`image@sha256:...`) cannot. Avoid `latest`.",
            "`free` inside a container shows host memory. The cgroup files show the real limit.",
          ],
        },
        {
          kind: "pairs",
          rows: [
            ["docker run -d -p 8088:8080 IMG", "Start in the background, publish a port"],
            ["docker ps -a", "List containers, including stopped ones"],
            ["docker logs NAME", "What the process wrote to stdout and stderr"],
            ["docker exec -it NAME sh", "Start a second process in the same namespaces"],
            ["docker stop NAME", "SIGTERM, then SIGKILL after 10 seconds"],
            ["docker rm NAME / docker rmi IMG", "Delete a container / an image"],
          ],
        },
      ],
    },
    {
      title: "Dockerfile instructions",
      lesson: 1,
      blocks: [
        {
          kind: "table",
          head: ["Instruction", "What it does"],
          rows: [
            ["`FROM`", "Base image. Pin a specific tag."],
            ["`WORKDIR`", "Working folder (use it, not `RUN cd`)"],
            ["`COPY` / `ADD`", "Copy files in. Prefer `COPY`; `ADD` also fetches URLs."],
            ["`RUN`", "Runs at build time and makes a layer"],
            ["`ARG` / `ENV`", "Build-time only / saved in the image"],
            ["`EXPOSE`", "Documentation only, publishes nothing"],
            ["`USER`", "Run as non-root (`node` is UID 1000)"],
            ["`CMD` / `ENTRYPOINT`", "Default args / the fixed program"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "`ARG`, `ENV` and copied-then-deleted files stay readable in `docker history`. Use `RUN --mount=type=secret` for tokens.",
        },
      ],
    },
    {
      title: "Fast, small, safe images",
      lesson: 1,
      blocks: [
        {
          kind: "code",
          lang: "dockerfile",
          code: "FROM node:22-alpine AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM node:22-alpine\nWORKDIR /app\nCOPY --from=build /app/dist ./dist\nUSER node\nCMD [\"node\", \"dist/server.js\"]",
          note: "Deps before source keeps the cache. Multi-stage gave 243 MB vs 1.69 GB.",
        },
        {
          kind: "points",
          items: [
            "Cache order: least-changing first. Rebuild took 1.6 s instead of 7.1 s.",
            "Layers only add. Delete files in the **same** `RUN` that made them.",
            "Exec form `CMD [\"node\",...]` lets SIGTERM reach the app. Shell form wraps it in `sh -c`.",
            "`.dockerignore`: `node_modules`, `.git`, `.env`, logs. Lint with `hadolint`.",
          ],
        },
      ],
    },
    {
      title: "Volumes, networks, ports",
      lesson: 2,
      blocks: [
        {
          kind: "table",
          head: ["Storage", "Use for"],
          rows: [
            ["Named volume", "Data that must outlive the container (databases)"],
            ["Bind mount", "Host folder, good for development; add `:ro`"],
            ["`tmpfs`", "Memory-only scratch space"],
          ],
        },
        {
          kind: "points",
          items: [
            "Use a **user-defined network**: containers reach each other by name. The default bridge has no name lookup.",
            "`-p 8080:3000` binds all interfaces. Use `-p 127.0.0.1:8080:3000` for private services.",
            "A mounted folder must be writable by the container user (`chown` it in the image).",
          ],
        },
      ],
    },
    {
      title: "Run containers safely",
      lesson: 2,
      blocks: [
        {
          kind: "code",
          lang: "bash",
          code: "docker run -d --name hard \\\n  --read-only --tmpfs /tmp \\\n  --cap-drop ALL \\\n  --security-opt no-new-privileges \\\n  --memory 128m --pids-limit 100 \\\n  --user 1000:1000 IMG",
          note: "Verified: the app still served traffic with all of this on.",
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Never mount `/var/run/docker.sock` or use `--privileged`. The socket is root on the host. `-e` values show in `docker inspect`.",
        },
      ],
    },
    {
      title: "Docker Compose",
      lesson: 3,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["docker compose up -d --build", "Start the stack, rebuild images first"],
            ["docker compose up -d --wait", "Return when services are running or healthy"],
            ["docker compose logs -f api", "Follow one service"],
            ["docker compose run --rm api CMD", "One-off container (migrations)"],
            ["docker compose down", "Remove containers and networks, keep volumes"],
            ["docker compose down -v", "Also delete volumes. Data is gone."],
            ["docker compose config", "Show the merged file, check syntax"],
          ],
        },
        {
          kind: "points",
          items: [
            "Service names are DNS names on the project network.",
            "Short `depends_on` only orders start. Use a `healthcheck` plus `condition: service_healthy`, and still retry in the app.",
            "`compose.override.yaml` for development, `profiles` for optional services. Quote port strings.",
          ],
        },
      ],
    },
    {
      title: "Kubernetes architecture",
      lesson: 4,
      blocks: [
        {
          kind: "table",
          head: ["Part", "Job"],
          rows: [
            ["API server", "The only door. Every part talks through it."],
            ["etcd", "Stores all cluster state"],
            ["Scheduler", "Picks a node for each new Pod"],
            ["Controller manager", "Runs the reconcile loops"],
            ["kubelet / kube-proxy", "On each node: runs Pods / routes Service traffic"],
          ],
        },
        {
          kind: "points",
          items: [
            "**Reconcile loop:** make `status` (current) equal `spec` (desired), forever.",
            "A naked Pod is not replaced. **Deployment** owns a **ReplicaSet** owns **Pods**.",
            "The Deployment `selector` must match template labels and is immutable.",
          ],
        },
      ],
    },
    {
      title: "Rollouts and declarative work",
      lesson: 4,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["kubectl apply -f FILE", "Create or update from a file"],
            ["kubectl diff -f FILE", "Preview the change"],
            ["kubectl apply --dry-run=server -f FILE", "Validate on the server"],
            ["kubectl set image deploy/N C=IMG:1.1", "Start a rolling update"],
            ["kubectl rollout status|history|undo", "Watch / list / go back (deploy/NAME)"],
            ["kubectl rollout restart deploy/N", "Replace all Pods, rolling"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Defaults are `maxSurge: 25%` and `maxUnavailable: 25%`. `rollout undo` makes a **new** revision. Check your context before you apply.",
        },
      ],
    },
    {
      title: "Services and Ingress",
      lesson: 5,
      blocks: [
        {
          kind: "table",
          head: ["Type", "Reachable from"],
          rows: [
            ["`ClusterIP` (default)", "Inside the cluster only"],
            ["`NodePort`", "Any node IP, port 30000-32767"],
            ["`LoadBalancer`", "Cloud load balancer address"],
            ["`ExternalName`", "A DNS alias to an outside name"],
            ["Headless (`clusterIP: None`)", "DNS returns the pod IPs"],
          ],
        },
        {
          kind: "table",
          head: ["Port field", "Meaning"],
          rows: [
            ["`containerPort`", "What the app listens on (documentation)"],
            ["`targetPort`", "Pod port the Service sends to (defaults to `port`)"],
            ["`port`", "Port clients use on the Service"],
            ["`nodePort`", "Port opened on every node"],
          ],
        },
        {
          kind: "points",
          items: [
            "DNS: `svc`, `svc.ns`, `svc.ns.svc.cluster.local`. Only **ready** pods are in the EndpointSlice.",
            "Ingress is rules only and needs a controller. `pathType` (`Exact`, `Prefix`) is required. Gateway API is the future.",
            "NetworkPolicy needs a CNI that enforces it. By default all pods can talk.",
          ],
        },
      ],
    },
    {
      title: "Config, Secrets, storage",
      lesson: 6,
      blocks: [
        {
          kind: "points",
          items: [
            "ConfigMap and Secret values are **strings**. Quote numbers and booleans.",
            "Env vars are fixed at start. Mounted files update later (not with `subPath`). Use `rollout restart`.",
            "**PVC** asks, **PV** is the disk, **StorageClass** makes it on demand. An unbound PVC leaves the Pod `Pending`.",
            "**StatefulSet:** stable names, DNS and a disk per pod. No replication for you.",
          ],
        },
        {
          kind: "table",
          head: ["Access mode", "Meaning"],
          rows: [
            ["`ReadWriteOnce`", "One node at a time"],
            ["`ReadWriteOncePod`", "Exactly one pod"],
            ["`ReadOnlyMany`", "Many nodes, read-only"],
            ["`ReadWriteMany`", "Many nodes, needs NFS or similar"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "**base64 is not encryption.** Secrets sit plain in etcd by default. `kubectl apply` can copy one into an annotation. Use RBAC, encryption at rest, `kubeconform -strict`.",
        },
      ],
    },
    {
      title: "Probes, resources, scaling",
      lesson: 7,
      blocks: [
        {
          kind: "table",
          head: ["Probe", "Failure means"],
          rows: [
            ["`readinessProbe`", "Stop sending traffic"],
            ["`livenessProbe`", "Restart (never check the database)"],
            ["`startupProbe`", "Slow start; holds off the other two"],
          ],
        },
        {
          kind: "table",
          head: ["Field", "Default"],
          rows: [
            ["`periodSeconds`", "10"],
            ["`timeoutSeconds`", "1"],
            ["`failureThreshold`", "3"],
            ["`initialDelaySeconds`", "0"],
          ],
        },
        {
          kind: "table",
          head: ["QoS class", "Rule"],
          rows: [
            ["Guaranteed", "Requests equal limits for CPU and memory"],
            ["Burstable", "Some requests or limits"],
            ["BestEffort", "None. Evicted first."],
          ],
        },
        {
          kind: "code",
          lang: "text",
          code: "desired = ceil(current\n  x metric / target)\n4 pods, 90% vs 70%: ceil(5.14) = 6",
          note: "Needs CPU requests and metrics-server. Tolerance 10%.",
        },
      ],
    },
    {
      title: "Zero downtime and disruption",
      lesson: 7,
      blocks: [
        {
          kind: "steps",
          items: [
            "Readiness probe on every pod, so new pods only get traffic when ready.",
            "`maxUnavailable: 0` and `maxSurge: 1` (or more).",
            "Handle SIGTERM and add a `preStop` sleep. Grace period is 30 s.",
            "At least 2 replicas and a **PodDisruptionBudget**.",
          ],
        },
        {
          kind: "points",
          items: [
            "Requests schedule. Limits enforce: CPU throttles, memory OOM-kills (`137`).",
            "A stuck rollout shows `ProgressDeadlineExceeded`. It does not roll back by itself.",
            "A PDB covers voluntary disruption only. Too strict, it blocks node drains.",
          ],
        },
      ],
    },
    {
      title: "Debugging",
      lesson: 8,
      blocks: [
        {
          kind: "table",
          head: ["Exit code", "Meaning"],
          rows: [
            ["`125` / `126` / `127`", "Docker failed / not runnable / not found"],
            ["`137`", "SIGKILL (128+9): OOM, `docker kill`, stop timeout"],
            ["`143`", "SIGTERM (128+15)"],
          ],
        },
        {
          kind: "table",
          head: ["Status", "Look at"],
          rows: [
            ["`Pending`", "`describe` events: `FailedScheduling`"],
            ["`ImagePullBackOff`", "`describe`: name, tag, credentials"],
            ["`CrashLoopBackOff`", "`logs --previous`, exit code"],
            ["`Running` but `0/1`", "Readiness probe; empty endpoints"],
          ],
        },
        {
          kind: "pairs",
          rows: [
            ["kubectl describe pod NAME", "Events at the bottom"],
            ["kubectl logs NAME --previous", "Output of the crashed container"],
            ["kubectl debug -it POD --image=busybox", "Ephemeral container, no shell needed"],
            ["kubectl get events --sort-by=...", "Recent events (sort by .lastTimestamp)"],
          ],
        },
      ],
    },
    {
      title: "Interview one-liners",
      lesson: 9,
      blocks: [
        {
          kind: "table",
          head: ["Question", "Short answer"],
          rows: [
            ["Container vs VM?", "A process on the shared kernel, not a guest OS."],
            ["CMD vs ENTRYPOINT?", "CMD is default args, ENTRYPOINT is the program."],
            ["ARG vs ENV?", "Build-time vs saved in the image. Neither is secret."],
            ["Does `depends_on` wait?", "No. Only with `service_healthy`."],
            ["Is Secret encrypted?", "No, only base64, until you enable encryption."],
            ["ConfigMap changed?", "Env vars stay old. Restart the pods."],
            ["Namespace a boundary?", "Naming scope, not a security boundary."],
            ["Pending pod?", "`describe`: resources, selector, taint, PVC."],
            ["Unready, Service errors?", "Check endpoints: selector typo or unready pods."],
          ],
        },
      ],
    },
  ],
};
