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
  author: "Jainik",
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
    title: "Linux Fundamentals: Where Every Server Starts",
    summary: "Filesystem, permissions, processes, and the commands you'll type a thousand times.",
    published: false,
  },
  {
    number: 2,
    slug: "lesson-2",
    title: "Git Beyond Commit: Branching Workflows That Scale",
    summary: "Trunk-based development, pull requests, and keeping history useful.",
    published: false,
  },
  {
    number: 3,
    slug: "lesson-3",
    title: "Networking Essentials for People Who Deploy Things",
    summary: "DNS, ports, HTTP, TLS, and reverse proxies — just enough to debug production.",
    published: false,
  },
  {
    number: 4,
    slug: "lesson-4",
    title: "Containers with Docker: Build Once, Run Anywhere",
    summary: "Images, layers, Dockerfiles, and Compose for local environments.",
    published: false,
  },
  {
    number: 5,
    slug: "lesson-5",
    title: "CI/CD with GitHub Actions: Your First Real Pipeline",
    summary: "Lint, test, build and deploy on every push — automatically.",
    published: false,
  },
  {
    number: 6,
    slug: "lesson-6",
    title: "Infrastructure as Code with Terraform",
    summary: "Describe your cloud in files, review it in PRs, and rebuild it in minutes.",
    published: false,
  },
  {
    number: 7,
    slug: "lesson-7",
    title: "Kubernetes: Running Containers at Scale",
    summary: "Pods, Deployments, Services, Ingress — and when you don't need K8s at all.",
    published: false,
  },
  {
    number: 8,
    slug: "lesson-8",
    title: "Observability: Logs, Metrics, Traces",
    summary: "Knowing what your system is doing before your users tell you.",
    published: false,
  },
  {
    number: 9,
    slug: "lesson-9",
    title: "DevSecOps: Security That Ships With the Code",
    summary: "Secrets, scanning, least privilege, and supply-chain hygiene.",
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
