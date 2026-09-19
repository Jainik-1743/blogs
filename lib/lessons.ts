export type Lesson = {
  /** Lesson number, starting at 0 (the book's "first page"). */
  number: number;
  slug: string;
  title: string;
  summary: string;
  /** Approximate reading time, e.g. "12 min". */
  readTime?: string;
  published: boolean;
};

export const SERIES = {
  slug: "devops",
  title: "DevOps, From Zero",
  tagline:
    "A lesson-by-lesson series that takes you from \"just git push to Vercel\" to running your own production setup on raw AWS — servers, networking, databases, and the mindset behind them.",
  started: "2026",
};

/**
 * Single source of truth for the series. Every table of contents, breadcrumb
 * and prev/next pager is generated from this list.
 */
export const LESSONS: Lesson[] = [
  {
    number: 0,
    slug: "lesson-0",
    title: "The Big Picture: Vercel vs AWS Mindset",
    summary:
      "Before touching a single server, understand what problem AWS is actually solving for you. No cost, no server — only clear thinking, plus a safe account setup.",
    readTime: "10 min",
    published: true,
  },
  {
    number: 1,
    slug: "lesson-1",
    title: "Linux Fundamentals: Shell, SSH, Users, Permissions",
    summary:
      "Every EC2 server is a Linux box with no screen. Filesystem, permissions, users, processes — and the fix for “my app dies when I close the terminal”.",
    readTime: "18 min",
    published: true,
  },
  {
    number: 2,
    slug: "lesson-2",
    title: "Networking Basics: IP, Ports, TCP/UDP and Firewalls",
    summary:
      "How a browser request actually finds and reaches your server. The layer Vercel hides completely, and the one you must understand before EC2 makes any sense.",
    readTime: "16 min",
    published: true,
  },
  {
    number: 3,
    slug: "lesson-3",
    title: "DNS Deep Dive: From Domain Name to Server",
    summary:
      "How a domain name turns into a server address — records, TTL, Route 53, and the one wildcard record that serves unlimited customer subdomains for a multi-tenant SaaS.",
    readTime: "14 min",
    published: true,
  },
  {
    number: 4,
    slug: "lesson-4",
    title: "HTTPS, SSL and TLS: Certificates, Let’s Encrypt, ACM",
    summary:
      "What a certificate actually proves, how the TLS handshake works, and the two ways you will get free certificates on AWS.",
    published: false,
  },
  {
    number: 5,
    slug: "lesson-5",
    title: "AWS Account and IAM: Identity and Access",
    summary:
      "Users, roles, policies and least privilege — who is allowed to do what, and how to never leak a key again.",
    published: false,
  },
  {
    number: 6,
    slug: "lesson-6",
    title: "VPC: Subnets, Route Tables, Security Groups",
    summary:
      "Your own private network inside AWS. Public and private subnets, how traffic gets in and out, and where your database hides.",
    published: false,
  },
  {
    number: 7,
    slug: "lesson-7",
    title: "EC2: Launch Your First Server and Deploy Next.js Manually",
    summary:
      "SSH in, install Node, clone, .env, build, and keep it alive with PM2 — the manual deploy every later lesson automates.",
    published: false,
  },
  {
    number: 8,
    slug: "lesson-8",
    title: "RDS: Managed PostgreSQL",
    summary:
      "A real database that AWS backs up, patches and fails over for you — and how to connect it privately from your app server.",
    published: false,
  },
  {
    number: 9,
    slug: "lesson-9",
    title: "Docker: Containerize Your Next.js and Node App",
    summary:
      "Images, layers, Dockerfiles and Compose — build once, run the same thing on your laptop and on EC2.",
    published: false,
  },
  {
    number: 10,
    slug: "lesson-10",
    title: "Nginx: Reverse Proxy",
    summary:
      "The receptionist in front of your app: TLS termination, static files, compression, and why port 3000 never goes public.",
    published: false,
  },
  {
    number: 11,
    slug: "lesson-11",
    title: "S3 and CloudFront: Static Assets and CDN",
    summary:
      "Uploads, images and built assets in S3, served from edge locations near your users.",
    published: false,
  },
  {
    number: 12,
    slug: "lesson-12",
    title: "ALB and Auto Scaling: Scaling to 1000+ Concurrent Users",
    summary:
      "One server becomes many. Health checks, target groups, and servers that appear when traffic spikes and vanish when it drops.",
    published: false,
  },
  {
    number: 13,
    slug: "lesson-13",
    title: "Route 53: Production Domain",
    summary:
      "Hosted zones, alias records to your load balancer and CDN, and health-checked routing for a real domain.",
    published: false,
  },
  {
    number: 14,
    slug: "lesson-14",
    title: "CI/CD with GitHub Actions",
    summary:
      "Lint, test, build and deploy on every push — automatically, with no one SSH-ing into a server.",
    published: false,
  },
  {
    number: 15,
    slug: "lesson-15",
    title: "Terraform: Infrastructure as Code",
    summary:
      "Describe your whole cloud in files, review it in pull requests, and rebuild it in minutes.",
    published: false,
  },
  {
    number: 16,
    slug: "lesson-16",
    title: "Redis: Caching and Sessions",
    summary:
      "Fast in-memory storage for sessions, rate limits and hot data — and when not to reach for it.",
    published: false,
  },
  {
    number: 17,
    slug: "lesson-17",
    title: "Monitoring and Logging with CloudWatch",
    summary:
      "Knowing what your system is doing before your users tell you: metrics, logs, alarms and dashboards.",
    published: false,
  },
  {
    number: 18,
    slug: "lesson-18",
    title: "Security Hardening and Backups",
    summary:
      "Locking down what you built: patching, secrets, least privilege, automated backups and tested restores.",
    published: false,
  },
  {
    number: 19,
    slug: "lesson-19",
    title: "Cost Review and Final Production Architecture",
    summary:
      "Where the money goes, how to cut it, and the complete architecture you have built — box by box.",
    published: false,
  },
];

/** Standalone background reading that sits beside the numbered lessons. */
export type Reading = {
  slug: string;
  title: string;
  summary: string;
  readTime?: string;
};

export const READINGS: Reading[] = [
  {
    slug: "hosting-platforms",
    title: "Hosting Platforms Explained",
    summary:
      "Vercel, Railway, Render, Dokploy, Coolify, AWS, Kubernetes — where each one fits, and why the real question is stateless vs persistent.",
    readTime: "9 min",
  },
];

export function readingHref(reading: Reading): string {
  return `/${SERIES.slug}/${reading.slug}`;
}

export function getLesson(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

export function getNeighbours(slug: string): { prev?: Lesson; next?: Lesson } {
  const i = LESSONS.findIndex((l) => l.slug === slug);
  if (i === -1) return {};
  return { prev: LESSONS[i - 1], next: LESSONS[i + 1] };
}

export function lessonHref(lesson: Lesson): string {
  return `/${SERIES.slug}/${lesson.slug}`;
}
