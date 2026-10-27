import type { CheatSheet } from "../types.ts";

/** Cheat sheet for the "devops" series. See scripts/SERIES-SHEETS.md. */
export const SHEET: CheatSheet | null = {
  intro:
    "Moving a Next.js SaaS from Vercel to AWS: Linux, network, DNS, IAM, EC2, RDS, Docker, S3, load balancing, CI/CD, Terraform, monitoring, security and cost. **AWS bills for existing, not for using**, so every box you add needs a reason.",
  sections: [
    {
      title: "Account, CLI and Linux basics",
      lesson: 1,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["aws sts get-caller-identity", "Who am I? The ARN must say `user/`, never root"],
            ["chmod 600 .env", "Only you can read secrets"],
            ["chmod 400 key.pem", "SSH refuses looser key files"],
            ["ps aux | grep node", "Is the app running?"],
            ["df -h", "Disk full? Check this first"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Root user: MFA on, no keys, never for daily work. Closing the terminal kills `npm start`; use **PM2**.",
        },
      ],
    },
    {
      title: "Ports, firewalls, first debug",
      lesson: 2,
      blocks: [
        {
          kind: "points",
          items: [
            "Ports: **22** SSH, **80** HTTP, **443** HTTPS, **5432** Postgres, **6379** Redis. Port 3000 is never public.",
            "Security Group: inbound **denied** by default, **stateful** (replies return by themselves).",
            "SSH source is your `/32`, never `0.0.0.0/0`. A DB rule's source is the **app's group**.",
          ],
        },
        {
          kind: "table",
          head: ["You see", "It means"],
          rows: [
            ["Connection refused", "Host reached, nothing listens on that port"],
            ["Timed out", "Firewall or Security Group drops it"],
          ],
        },
        {
          kind: "code",
          lang: "bash",
          code: "ps aux | grep node\nsudo ss -tulpn | grep 3000\nnc -zv SERVER_IP 3000",
          note: "Running? Listening where? Reachable from your laptop?",
        },
      ],
    },
    {
      title: "DNS and Route 53",
      lesson: 3,
      blocks: [
        {
          kind: "table",
          head: ["Record", "Holds"],
          rows: [
            ["A / AAAA", "Name to IPv4 / IPv6"],
            ["CNAME", "Alias to another name; not allowed at the apex"],
            ["MX / TXT / NS", "Mail / text, SPF / nameservers"],
            ["Alias (A)", "Route 53 only: apex to ALB or CloudFront, free"],
          ],
        },
        {
          kind: "points",
          items: [
            "**TTL** is how long resolvers cache. Lower it to 60 to 300 before a move, raise it after. '24 to 48 hours' is a myth.",
            "`*.yourapp.com` serves every tenant subdomain, not the bare domain. The app reads `Host`.",
            "Migrate with **weighted** records (10, 50, 100). Copy MX, SPF, DKIM too.",
          ],
        },
        {
          kind: "pairs",
          rows: [
            ["dig NAME +short", "What IP does it resolve to?"],
            ["curl --resolve H:443:IP URL", "Test the new stack before DNS"],
          ],
        },
      ],
    },
    {
      title: "HTTPS and certificates",
      lesson: 4,
      blocks: [
        {
          kind: "table",
          head: ["Item", "ACM", "Let's Encrypt"],
          rows: [
            ["Plain EC2 + Nginx", "No", "Yes (Certbot)"],
            ["ALB / CloudFront", "Yes", "Not needed"],
          ],
        },
        {
          kind: "code",
          lang: "bash",
          code: "sudo certbot --nginx \\\n  -d yourapp.com -d www.yourapp.com\nsudo certbot renew --dry-run\ncurl -I http://yourapp.com",
          note: "Expect 301 to https. Needs DNS at the server and port 80 open.",
        },
        {
          kind: "table",
          head: ["Error", "Fix"],
          rows: [
            ["CERT_COMMON_NAME_INVALID", "Name not on the cert: add `-d` for both names"],
            ["CERT_DATE_INVALID", "Expired: `certbot renew`, find why the timer failed"],
            ["Too many redirects", "ALB and Nginx both redirect: use `X-Forwarded-Proto`"],
          ],
        },
      ],
    },
    {
      title: "IAM in one page",
      lesson: 5,
      blocks: [
        {
          kind: "points",
          items: [
            "**User** = person, **group** = department, **policy** = rule card, **role** = temporary key card for machines.",
            "Everything is **denied by default**. An explicit `Deny` always wins.",
            "Attach policies to groups, not users. People use Identity Center; machines use roles.",
          ],
        },
        {
          kind: "code",
          lang: "json",
          code: "{\n  \"Effect\": \"Allow\",\n  \"Action\": [\n    \"s3:PutObject\",\n    \"s3:GetObject\"\n  ],\n  \"Resource\":\n    \"arn:aws:s3:::myapp-pdfs/*\"\n}",
          note: "Effect, Action, Resource. `/*` means every object in the bucket.",
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Long-lived keys in a `.env` are the costliest mistake. Never commit them. Set a budget alert first.",
        },
      ],
    },
    {
      title: "VPC: public, private, CIDR",
      lesson: 6,
      blocks: [
        {
          kind: "table",
          head: ["CIDR", "Addresses", "Use"],
          rows: [
            ["/16", "65,536", "Whole VPC (largest allowed)"],
            ["/24", "256 (251 usable)", "One subnet"],
            ["/28", "16 (11 usable)", "Smallest subnet"],
          ],
        },
        {
          kind: "points",
          items: [
            "AWS keeps **5** addresses per subnet. Private ranges: `10/8`, `172.16/12`, `192.168/16`. Peered VPCs must not overlap.",
            "**Public subnet** = route `0.0.0.0/0` to the Internet Gateway, plus a public IP. Private = only the `local` route.",
          ],
        },
        {
          kind: "table",
          head: ["Item", "Security Group", "Network ACL"],
          rows: [
            ["Attached to", "Resource", "Subnet"],
            ["Rules", "Allow only", "Allow and deny"],
            ["State", "Stateful", "Stateless"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "A NAT Gateway costs about $40 a month idle plus $0.056/GB. Use the free S3 gateway endpoint instead.",
        },
      ],
    },
    {
      title: "EC2 and PM2",
      lesson: 7,
      blocks: [
        {
          kind: "table",
          head: ["Setting", "Choice"],
          rows: [
            ["Image / size", "Ubuntu 24.04 LTS, `t3.small` (~$16/month)"],
            ["Role", "`myapp-ec2-role`: no keys on disk"],
          ],
        },
        {
          kind: "pairs",
          rows: [
            ["ssh -i key.pem ubuntu@IP", "Ubuntu user is always `ubuntu`"],
            ["pm2 start pnpm --name myapp -- start", "Run under PM2"],
            ["pm2 startup && pm2 save", "Survive a reboot"],
          ],
        },
        {
          kind: "points",
          items: [
            "**Stop** keeps disk and Elastic IP (about $6/month). **Terminate** deletes for good; release the IP yourself.",
            "`NEXT_PUBLIC_*` is baked in at build time: rebuild. Add swap for `next build`.",
          ],
        },
      ],
    },
    {
      title: "Data tier: RDS and Redis",
      lesson: 8,
      blocks: [
        {
          kind: "table",
          head: ["Item", "Multi-AZ standby", "Read replica"],
          rows: [
            ["Purpose", "Stay up", "Share reads"],
            ["Replication", "Synchronous", "Asynchronous"],
            ["Failover", "Automatic, 1 to 2 min", "Manual promote"],
          ],
        },
        {
          kind: "points",
          items: [
            "RDS: private subnet group, public access **No**, `db-sg` only from `web-sg`. App uses `appuser`, never `dbadmin`.",
            "Point-in-time restore makes a **new instance**. Multi-AZ copies a `DROP TABLE` too; only backups help.",
            "Connections: **servers x pool <= 80%** of `max_connections` (about 100 on micro). Fix: smaller pool, bigger box, RDS Proxy or PgBouncer.",
          ],
        },
        {
          kind: "points",
          items: [
            "Redis: cache-aside with a **TTL** (plus jitter), tenant ID in every key, revocable sessions, `INCR` rate limits.",
            "Eviction: `allkeys-lru` for a cache, `noeviction` for queues. Never the only copy; fail open.",
          ],
        },
      ],
    },
    {
      title: "Docker and Nginx",
      lesson: 9,
      blocks: [
        {
          kind: "points",
          items: [
            "Order layers: copy lockfile and install first, `COPY . .` last. Multi-stage build, standalone output, non-root `USER`, `HOSTNAME=0.0.0.0`.",
            "`.dockerignore` holds `.env*`, `.git`. Tag by commit SHA, never `latest`. Secrets at run time, not in layers.",
          ],
        },
        {
          kind: "code",
          lang: "bash",
          code: "docker run -d --name myapp \\\n  --restart unless-stopped \\\n  --env-file ~/myapp.env \\\n  -p 127.0.0.1:3000:3000 \\\n  --memory 1g myapp:a1b2c3d",
          note: "Exit 137 means killed, often out of memory.",
        },
        {
          kind: "table",
          head: ["Nginx", "Cause and fix"],
          rows: [
            ["502", "App down or wrong port: `curl -I 127.0.0.1:3000`"],
            ["504", "Slower than `proxy_read_timeout` (60 s)"],
            ["413", "Body over `client_max_body_size` (1 MB)"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Run `sudo nginx -t` before every `systemctl reload nginx`. Use `127.0.0.1`, not `localhost`, in `proxy_pass`.",
        },
      ],
    },
    {
      title: "S3 and CloudFront",
      lesson: 11,
      blocks: [
        {
          kind: "points",
          items: [
            "Files go in S3, the **key** goes in the database. Key shape: `tenants/ID/uploads/UUID`; never raw user names.",
            "Block Public Access on. App reads and writes through its instance role.",
          ],
        },
        {
          kind: "steps",
          items: [
            "Browser asks the API to upload.",
            "API checks login, returns a **presigned PUT URL** (5 minutes).",
            "Browser PUTs straight to S3 with the same `Content-Type`.",
            "API saves the key. Needs bucket CORS for your origins, never `*`.",
          ],
        },
        {
          kind: "table",
          head: ["Stale file fix", "Verdict"],
          rows: [
            ["Invalidate a path", "First 1,000 paths a month free"],
            ["Versioned file names", "Best: cache forever"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "The CloudFront certificate must live in `us-east-1`. Keep the bucket private with OAC and a policy on `AWS:SourceArn`.",
        },
      ],
    },
    {
      title: "ALB and Auto Scaling",
      lesson: 12,
      blocks: [
        {
          kind: "table",
          head: ["Part", "Job"],
          rows: [
            ["Listener", "Port and protocol; holds the cert and rules"],
            ["Target group", "The servers plus their health check"],
            ["Launch template, ASG", "Server recipe; min and max count over AZs"],
          ],
        },
        {
          kind: "points",
          items: [
            "Stateless first: sessions to cookie or Redis, files to S3, cron to one scheduler.",
            "Policy: target tracking on CPU (about 50%). Scale out fast, in slowly.",
            "Keep the health check shallow: a DB check can fail every server at once.",
            "Deploy: new tag in SSM, then **instance refresh** (min healthy 100%, max 110%). Rollback is the old tag.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Random 502s: Node keep-alive (5 s) is shorter than the ALB idle timeout (60 s). Set `KEEP_ALIVE_TIMEOUT=65000`. 503 = no targets, 504 = slower than 60 s.",
        },
      ],
    },
    {
      title: "CI/CD and Terraform",
      lesson: 14,
      blocks: [
        {
          kind: "steps",
          items: [
            "Push: lint, types, tests.",
            "Build the image, tag it with the SHA, push to ECR.",
            "Approval gate on the `production` environment.",
            "Migrations through SSM, then instance refresh.",
          ],
        },
        {
          kind: "points",
          items: [
            "**OIDC**, no stored keys: the trust policy `sub` pins `repo:ORG/app:ref:refs/heads/main`; the job needs `id-token: write`.",
            "Deploys use `concurrency` with `cancel-in-progress: false`. Pin actions to a SHA.",
          ],
        },
        {
          kind: "table",
          head: ["Plan symbol", "Meaning"],
          rows: [
            ["+", "Create"],
            ["~", "Update in place: check for downtime"],
            ["-", "Destroy: does it hold data?"],
            ["-/+", "Replace: read 'forces replacement'"],
          ],
        },
        {
          kind: "points",
          items: [
            "Terraform loop: `init`, `plan`, read it, `apply`. State lives in a versioned, locked S3 bucket and holds secrets.",
            "Use `for_each` not `count`; `prevent_destroy` on data; `ignore_changes` on `desired_capacity`.",
          ],
        },
      ],
    },
    {
      title: "Monitoring and alerts",
      lesson: 17,
      blocks: [
        {
          kind: "table",
          head: ["Signal", "Watch"],
          rows: [
            ["Latency", "ALB `TargetResponseTime` p95, not average"],
            ["Traffic / errors", "`RequestCount` / `HTTPCode_Target_5XX_Count`"],
            ["Saturation", "CPU, memory, disk, DB connections"],
          ],
        },
        {
          kind: "points",
          items: [
            "Alarms: 5xx >= 5 (2 of 3 min), p95 > 1 s, healthy hosts < 1, no requests for 10 min, RDS free storage < 5 GB.",
            "EC2 shows no memory or disk without the **CloudWatch agent**. Docker `awslogs` ships logs off the server.",
            "Alert on symptoms; page for outages. Every alarm links a runbook. Log JSON with `requestId`, `tenantId`.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Log ingestion costs about $0.50 to $0.70 per GB. Use 30-day retention, `info` level, no health-check lines.",
        },
      ],
    },
    {
      title: "Security and backups",
      lesson: 18,
      blocks: [
        {
          kind: "points",
          items: [
            "AWS secures the cloud; you secure what is in it. Only the ALB takes `0.0.0.0/0` (80, 443). Never 22, 3389, 5432, 6379, 3000.",
            "**Session Manager** replaces SSH (`AmazonSSMManagedInstanceCore`, close 22). IMDSv2 required, EBS encryption default.",
            "Secrets in SSM SecureString or Secrets Manager. Turn on CloudTrail and GuardDuty.",
            "Backups 3-2-1. A backup is real only after a **restore drill**; the time it takes is your RTO.",
          ],
        },
        {
          kind: "steps",
          items: [
            "Leaked key: `aws iam update-access-key --status Inactive` (do not delete yet).",
            "Attach an explicit Deny-all to that identity.",
            "Read CloudTrail by key ID, in every region.",
            "Remove unknown instances, users, roles; rotate what it could reach.",
          ],
        },
      ],
    },
    {
      title: "Cost levers",
      lesson: 19,
      blocks: [
        {
          kind: "table",
          head: ["Size", "Per month"],
          rows: [
            ["Starter, one server", "about $35"],
            ["Production (this course)", "about $130"],
            ["Resilient (Multi-AZ, scaled)", "about $390"],
          ],
        },
        {
          kind: "table",
          head: ["Lever", "Typical saving"],
          rows: [
            ["Delete orphans (disks, IPs, snapshots)", "10 to 30%"],
            ["Right-size from 2 weeks of CPU and memory", "20 to 50% of compute"],
            ["Graviton (`t4g`)", "About 20%"],
            ["Savings Plan on the steady baseline", "30 to 60%"],
            ["Stop non-prod; skip NAT; log retention", "60 to 70%; $40+; big"],
          ],
        },
      ],
    },
    {
      title: "Interview one-liners",
      lesson: 0,
      blocks: [
        {
          kind: "table",
          head: ["Question", "Short answer"],
          rows: [
            ["PaaS vs IaaS?", "PaaS hides servers (Vercel); IaaS gives raw blocks you wire up (AWS)."],
            ["What makes a subnet public?", "A `0.0.0.0/0` route to an Internet Gateway, plus a public IP."],
            ["Refused vs timed out?", "Refused: nothing listens. Timed out: a firewall drops packets."],
            ["SG vs NACL?", "SG stateful, allow only, per resource. NACL stateless, per subnet."],
            ["Multi-AZ vs replica?", "Multi-AZ is uptime; a replica is read speed. Backups cover mistakes."],
            ["How does EC2 call S3?", "An instance role gives short-lived credentials; no keys on disk."],
          ],
        },
      ],
    },
  ],
};
