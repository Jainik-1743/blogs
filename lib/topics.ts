/**
 * Topic pages: one page per subject that cuts across series ("Caching" gathers the caching lessons from
 * System Design, the Browser series, DevOps and so on). A lesson belongs to a topic when its title matches
 * the topic's words, or when its whole series is listed. Topics with fewer than MIN_LESSONS lessons are dropped.
 */
export type TopicDef = {
  slug: string;
  title: string;
  /** Two or three sentences for the top of the page; also the meta description. */
  blurb: string;
  /** Matched against the lesson title (without "Lesson N:") and its tags. */
  match?: RegExp;
  /** Never match lessons from these series (stops look-alike words from other subjects). */
  skipSeries?: string[];
  /** Skip titles matching this. */
  skipTitle?: RegExp;
  /** Every lesson of these series belongs to the topic. */
  series?: string[];
};

export const MIN_LESSONS = 4;

export const TOPICS: TopicDef[] = [
  {
    slug: "caching",
    title: "Caching",
    blurb: "Where to cache, how long to keep things, and how to throw old data away without breaking users: browser caches, CDNs, Redis and server caches, collected from every series.",
    match: /\b(cach\w*|cdn|redis|memcached|ttl)\b/,
  },
  {
    slug: "security",
    title: "Security",
    blurb: "Threats and defences for developers: injection, XSS, CSRF, secrets, encryption, HTTPS and the OWASP lists, from the browser to the server to LLM apps.",
    match: /\b(secur\w*|owasp|xss|csrf|injection|vulnerab\w*|encrypt\w*|tls|ssl|cors|secrets?|threat\w*)\b/,
    skipTitle: /patterns you already use/,
  },
  {
    slug: "authentication",
    title: "Authentication and authorization",
    blurb: "How login works and how to keep it safe: passwords, sessions, cookies, JWTs, OAuth and OpenID Connect, and deciding what each user is allowed to do.",
    match: /\b(auth\w*|login|oauth\w*|jwt|sessions?|passwords?|sso|cookies?)\b/,
    skipTitle: /redis: caching/,
  },
  {
    slug: "performance",
    title: "Performance",
    blurb: "Why things are slow and how to make them fast: latency and percentiles, Core Web Vitals, bundles, rendering, event-loop blocking and cost, with lessons from both the front end and the back end.",
    match: /\b(performance|latency|optimi[sz]\w*|speed|web vitals|profil\w*|lazy|bundle\w*)\b/,
  },
  {
    slug: "databases",
    title: "Databases and SQL",
    blurb: "Choosing a database, designing a schema, indexes, transactions and replication, plus the SQL and PostgreSQL series, gathered into one reading list.",
    match: /\b(databases?|sql|postgres\w*|indexes|indexing|transactions?|mongo\w*|nosql|orm|prisma|quer(y|ies)|schema)\b/,
    skipTitle: /anatomy of a request|seo, i18n/,
  },
  {
    slug: "testing",
    title: "Testing",
    blurb: "Unit, integration and end-to-end tests, test doubles, flaky tests and test strategy for a team, from the Testing series and from the lessons on APIs and front ends.",
    match: /\b(tests?|testing|tdd|mock\w*|e2e|playwright|jest|vitest)\b/,
    skipTitle: /mock interview/,
  },
  {
    slug: "networking",
    title: "Networking and HTTP",
    blurb: "How data travels: IP, TCP and UDP, DNS, HTTP and HTTPS, load balancers, proxies and WebSockets, with the networking basics every developer should know.",
    match: /\b(network\w*|http\w*|dns|tcp|udp|websockets?|load balanc\w*|prox(y|ies))\b/,
    skipTitle: /errors, proxy|structural patterns/,
  },
  {
    slug: "containers",
    title: "Docker and Kubernetes",
    blurb: "Containers from the first Dockerfile to a running Kubernetes cluster: images, networks, volumes, pods, services and debugging.",
    match: /\b(docker\w*|kubernetes|k8s|containers?|helm|pods?)\b/,
  },
  {
    slug: "observability",
    title: "Observability and reliability",
    blurb: "Logs, metrics and traces, SLOs and error budgets, alerting, incidents and post-mortems: how to know what your system is doing and fix it fast.",
    match: /\b(observab\w*|monitor\w*|logging|logs\b|metrics|tracing|alert\w*|slos?|sre|incidents?|on-call)\b/,
    skipSeries: ["git-github"],
  },
  {
    slug: "apis",
    title: "API design",
    blurb: "Designing APIs people enjoy using: REST, GraphQL and gRPC, status codes, pagination, versioning, idempotency, rate limiting and documentation.",
    match: /\b(apis?|rest(ful)?|graphql|grpc|webhooks?|openapi|rate limit\w*|pagination|idempotency)\b/,
    skipSeries: ["git-github"],
    skipTitle: /the api is fast|the ui is fast|rendering 10,000/,
  },
  {
    slug: "scalability",
    title: "Scalability and distributed systems",
    blurb: "Scaling past one machine: load balancing, replication, sharding, queues, Kafka, consistency and availability, and the trade-offs behind each choice.",
    match: /\b(scal\w*|shard\w*|replicat\w*|partition\w*|queues?|kafka|distributed|consistency|availability|throughput)\b/,
    skipSeries: ["dsa", "team-lead", "observability"],
  },
  {
    slug: "async",
    title: "Async and concurrency",
    blurb: "The event loop, promises and async/await, threads and workers, and the race conditions that appear when things happen at the same time.",
    match: /\b(async\w*|promises?|await|concurren\w*|threads?|event loop|parallel\w*|race conditions?|callbacks?)\b/,
    skipSeries: ["devops"],
  },
  {
    slug: "ai",
    title: "AI and LLM apps",
    blurb: "Building with language models safely: evaluation, prompt injection, cost and caching, guardrails, retrieval and agents.",
    match: /\b(ai|llms?|prompts?|embeddings?|rag|agents?|evals?|hallucinat\w*)\b/,
    skipTitle: /vercel ai sdk interview/,
  },
  {
    slug: "deployment",
    title: "Deployment and CI/CD",
    blurb: "Getting code to production and keeping it there: servers, pipelines, GitHub Actions, Terraform, blue-green and canary releases, and running on AWS or Vercel.",
    match: /\b(deploy\w*|ci\/cd|pipelines?|terraform|release\w*|rollback|aws|vercel|hosting)\b/,
    skipTitle: /vercel ai sdk|data pipeline/,
  },
  {
    slug: "patterns",
    title: "Architecture and design patterns",
    blurb: "Patterns that keep code and systems understandable: monolith or microservices, event-driven design, creational, structural and behavioural patterns, and reliability patterns such as circuit breakers.",
    match: /\b(patterns?|architectur\w*|microservices?|monolith\w*|solid|clean code|ddd|hexagonal|event-driven)\b/,
    skipSeries: ["dsa", "git-github", "javascript", "devops"],
  },
  {
    slug: "react",
    title: "React and Next.js",
    blurb: "Components, hooks, rendering, server components, data fetching and the Next.js App Router, plus the deeper front-end lessons on state, concurrency and testing.",
    series: ["react", "nextjs", "frontend-depth"],
  },
];

export const topicBySlug = (slug: string) => TOPICS.find((t) => t.slug === slug);
