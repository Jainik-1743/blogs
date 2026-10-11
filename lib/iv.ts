import type { AccentName } from "./accents";
import type { Lesson } from "./lessons";

/**
 * The interview-prep series: five lesson-style series for a senior frontend engineer moving
 * towards full-stack roles. Each lesson is a Markdown file at content/<series-slug>/NN.md;
 * this file only lists them (title, summary, reading time) so that every table of contents,
 * breadcrumb, pager and search result is generated from one place.
 */

export type IvLesson = Lesson & { tags: string[] };

export type IvSeries = {
  slug: string;
  title: string;
  /** Short name used in breadcrumbs. */
  short: string;
  tagline: string;
  started: string;
  accent: AccentName;
  lessons: IvLesson[];
};

/**
 * How many lessons of each series (counted from the top) have a Markdown file. The rest are
 * listed as "coming soon" and are not routed. Raise a number as each lesson is written.
 */
const WRITTEN: Record<string, number> = { browser: 10, backend: 12, debugging: 15, "design-problems": 8, "frontend-depth": 7, "fullstack-qa": 39, "team-lead": 18, "low-level-design": 10, "design-cases": 12, "cs-foundations": 8, "git-github": 6, "testing": 6, "typescript": 8, "sql-postgres": 8, "javascript-2": 8, "ai-engineering": 5, "career": 3, security: 9, "api-design": 10, "react": 10, "nodejs": 10 };

type Row = [title: string, summary: string, readTime: string, tags: string[]];

function lessons(rows: Row[], written: number): IvLesson[] {
  return rows.map(([title, summary, readTime, tags], number) => ({
    number,
    slug: `lesson-${number}`,
    title,
    summary,
    readTime,
    published: number < written,
    tags,
  }));
}

export const BROWSER_SERIES: IvSeries = {
  slug: "browser",
  title: "The Browser Contract: Auth, Storage, Security & HTTP",
  short: "The Browser Contract",
  tagline:
    "What happens between the address bar and your React app, and the safety choices interviewers like to ask about: storage, sessions vs JWT, XSS and CSRF, CORS, HTTP caching, status codes, rendering and Core Web Vitals.",
  started: "2026",
  accent: "rose",
  lessons: lessons([
    ["What Happens When You Type a URL (The Full Version)", "The full trip from pressing Enter to seeing pixels: DNS, TCP, TLS, HTTP, then reading the page and painting it. Caches skip most steps. Every other lesson in this series fits on this map.", "18 min", ["browser", "networking", "rendering", "interview"]],
    ["Storage in the Browser: Cookies, localStorage, sessionStorage and IndexedDB", "How long each one lasts, how big it can be, and who can read it: the tab, the site, the server or JavaScript. It ends with a table that answers: where should this data go?", "15 min", ["cookies", "storage", "security"]],
    ["Sessions vs JWT: Stateful vs Stateless Login", "What a signed JWT is, how it is different from a plain session ID, and where “stateless” stops helping: logging out, expiry, refresh tokens and the claims you must check.", "20 min", ["auth", "jwt", "sessions"]],
    ["Where Do Tokens Live? XSS, CSRF and the Storage Trade-off", "localStorage lets XSS steal tokens. Cookies let CSRF attacks use you. Safe patterns: HttpOnly cookies with SameSite or CSRF tokens, access tokens kept in memory, and a backend-for-frontend.", "18 min", ["auth", "xss", "csrf", "security"]],
    ["CORS Explained: Same-Origin Policy, Preflights and Credentials", "Why CORS protects the browser and is not a firewall for the server, what makes a preflight request, and why you cannot use a wildcard origin together with credentials.", "15 min", ["cors", "http", "security"]],
    ["HTTP Caching: Cache-Control, ETags and the CDN in Between", "Fresh or must-check, no-cache vs no-store, immutable for hashed files, stale-while-revalidate, and what a shared cache must never store.", "20 min", ["caching", "http", "cdn", "performance"]],
    ["HTTP Semantics Interviewers Ask: Methods, Idempotency, Status Codes, Redirects", "Safe vs idempotent methods, 401 vs 403, 409, 422 and 429, and the 301/302/307/308 table. All based on the HTTP specification.", "15 min", ["http", "rest", "status-codes"]],
    ["Frontend Security Checklist: XSS, CSP, Clickjacking and Supply Chain", "dangerouslySetInnerHTML, CSP nonces, frame-ancestors, Subresource Integrity and risky packages. Each one asks: what would you check in a code review?", "18 min", ["security", "xss", "csp"]],
    ["Browser Rendering and the Event Loop in Practice", "Parse, style, layout, paint and composite. Also layout thrashing, and where tasks, microtasks and requestAnimationFrame fit.", "18 min", ["rendering", "event-loop", "performance"]],
    ["Core Web Vitals for Engineers: LCP, INP and CLS", "What each metric measures, its “good” limit at the 75th percentile, why INP replaced FID, and the difference between field data and lab data.", "18 min", ["performance", "web-vitals", "seo"]],
  ], WRITTEN["browser"]),
};

export const BACKEND_SERIES: IvSeries = {
  slug: "backend",
  title: "Backend in Depth: Designing an API You'd Put in Production",
  short: "Backend in Depth",
  tagline:
    "From folder structure to N+1 queries: the choices a senior full-stack engineer must explain. Clean code, layers, REST design, validation, errors, logging, auth, databases, Prisma, GraphQL, Node speed and testing.",
  started: "2026",
  accent: "teal",
  lessons: lessons([
    ["Clean Code for Backends: Naming, Small Functions and Boundaries", "The few clean-code rules that improve backend code reviews: pure domain logic, clear dependencies, no hidden I/O, and when not to add an abstraction.", "15 min", ["clean-code", "solid", "design"]],
    ["API Folder Structure: Routes, Controllers, Services, Repositories", "Layers vs grouping by business feature, what goes in each layer, and why the request object should never reach your service layer.", "20 min", ["architecture", "express", "structure"]],
    ["REST API Design Best Practices: Resources, Versioning, Status Codes", "Nouns, not verbs. One error format. Ways to version an API. Idempotency keys for POST, and partial updates.", "18 min", ["rest", "api-design", "http"]],
    ["Validation at the Edge: Schemas, DTOs and Trusting Nothing", "Check input where it enters the API, share schemas with the frontend, and keep validation errors apart from business-rule errors.", "15 min", ["validation", "security", "typescript"]],
    ["Error Handling: Operational vs Programmer Errors", "One central error handler, typed error classes, how Express 5 treats rejected promises, and when to let the process crash and restart.", "18 min", ["errors", "express", "node"]],
    ["Logging and Observability: Structured Logs, Correlation IDs, Metrics", "JSON logs, log levels, request IDs that follow a request through every service, and what you must never log.", "15 min", ["logging", "observability", "operations"]],
    ["Authentication and Authorization on the Server", "Password hashing, session stores, checking JWTs properly, role-based vs attribute-based access control, and checking ownership on every resource.", "18 min", ["auth", "security", "rbac"]],
    ["Database Fundamentals for API Engineers: Indexes, Transactions, Isolation", "B-tree indexes, reading EXPLAIN ANALYZE, transactions and isolation levels, and the race conditions they stop, like selling too many items.", "20 min", ["postgres", "sql", "indexes", "transactions"]],
    ["Prisma in Production: N+1, include, Batching and Connection Pools", "How N+1 appears in loops and GraphQL resolvers, how Prisma batches findUnique, how it loads relations, and why you share a single client.", "18 min", ["prisma", "orm", "performance"]],
    ["REST vs GraphQL (vs Hasura): How to Choose", "Fetching too much or too little, how caching is different, changing the schema over time, limits on query cost, and where an auto-generated API fits.", "18 min", ["graphql", "rest", "hasura"]],
    ["Node.js Performance Basics: Event Loop Blocking, Streams, Workers", "Why one heavy CPU job can stop every request, plus streams for large data and worker threads.", "15 min", ["node", "performance", "streams"]],
    ["Testing an API: Unit, Integration and Contract", "Where to spend your testing effort in a backend, testing against a real database, and contract tests between the frontend and the API.", "15 min", ["testing", "node", "quality"]],
  ], WRITTEN["backend"]),
};

export const DEBUGGING_SERIES: IvSeries = {
  slug: "debugging",
  title: "Scenario Debugging: The “It's Slow, Fix It” Guide",
  short: "Scenario Debugging",
  tagline:
    "Scenario questions answered with one method you can repeat: measure, isolate, fix, check. API fast but UI slow, UI fast but API slow, re-renders, memory leaks, duplicate requests, slow first loads, huge lists and layout shift. Plus many cases about incidents, backend, frontend, security and architecture.",
  started: "2026",
  accent: "amber",
  lessons: lessons([
    ["The Debugging Method: Measure, Isolate, Hypothesize, Verify", "The method every answer in this series uses: which DevTools panel or server number answers which question, and how to explain your choices out loud.", "12 min", ["method", "performance", "interview"]],
    ["“The API Is Fast but the UI Is Slow”: How to Solve It", "The network tab says 80 ms, but users wait two seconds. Long main-thread tasks, huge JSON, many re-renders, layout thrashing and hydration cost, all linked to INP.", "20 min", ["frontend", "inp", "react", "scenario"]],
    ["“The UI Is Fast but the API Takes Too Long”: How to Solve It", "Follow the request: DNS and TLS, cold starts, N+1 queries, missing indexes, slow calls to other services, big payloads and missing caches. Then the UX fixes while the backend is repaired.", "20 min", ["backend", "latency", "caching", "scenario"]],
    ["Unnecessary Re-renders: Finding and Fixing Them", "The React Profiler, context updates that re-render every consumer, props that change each time, using memo on purpose and not everywhere, and what the React Compiler changes.", "18 min", ["react", "performance", "profiler"]],
    ["Memory Leaks in Single-Page Apps", "Timers and listeners that are never cleared, detached DOM nodes, closures that hold big objects and caches that only grow. Also how to confirm a leak with heap snapshots.", "15 min", ["memory", "react", "devtools"]],
    ["Duplicate Requests, Race Conditions and Stale Responses", "Strict Mode running effects twice, double-click submits, responses that arrive in the wrong order, AbortController, removing duplicate requests, and idempotency keys on the server.", "15 min", ["react", "fetch", "race-conditions"]],
    ["Slow First Load: Bundles, Code Splitting and LCP", "Bundle analysis, code splitting by route, image optimisation, font loading, preload and preconnect, and Server Components with streaming.", "18 min", ["bundle", "lcp", "nextjs"]],
    ["Rendering 10,000 Rows: Virtualization, Pagination and Web Workers", "Windowing, content-visibility, rendering in small chunks, and moving sort and filter work off the main thread.", "15 min", ["lists", "virtualization", "performance"]],
    ["Layout Shift and Janky Interactions", "Layout shift from images, ads and late fonts, and slow input from heavy event handlers. It ends with a short checklist.", "12 min", ["cls", "inp", "css"]],
    ["Quick Scenario Round: 15 Questions, 15 Clear Answers", "CORS failing only in production, random logouts, 429 errors caused by your own frontend, growing server memory and more. Each answer: find it, fix it, stop it coming back.", "25 min", ["scenario", "interview", "cheat-sheet"]],
    ["Production Incidents: Step-by-Step Guide", "Detect, reduce the harm, find the cause, tell people, fix, learn. Roll back first, roles and severity, and eleven incident cases from latency that doubled overnight to a vulnerability found in production.", "20 min", ["incidents", "on-call", "postmortem", "scenario"]],
    ["Backend and API Scenario Bank", "Sixteen server-side cases in find, fix, prevent form: duplicate webhooks, full connection pools, cron jobs that run twice, breaking API changes, stale caches, locking migrations and more.", "22 min", ["backend", "scenario", "api", "interview"]],
    ["Frontend and React Scenario Bank", "Sixteen frontend cases: old data after a save, live dashboards that freeze, SEO on a client-rendered app, token expiry, flaky E2E tests, micro-frontends, design systems and step-by-step migrations.", "22 min", ["frontend", "react", "scenario", "architecture"]],
    ["Security and Auth Scenario Bank", "Fourteen “you found a flaw” cases: stored XSS, IDOR, password-reset abuse, open redirects, SSRF, credential stuffing, a leaked key and a hacked third-party script.", "20 min", ["security", "auth", "scenario", "owasp"]],
    ["Architecture, Data and Team Judgement Scenarios", "Monolith or microservices, rewrite or refactor, migrations with no downtime, safe backfills, multi-tenancy, tech debt, unrealistic deadlines, code-review disagreements and build vs buy.", "22 min", ["architecture", "migrations", "leadership", "scenario"]],
  ], WRITTEN["debugging"]),
};

export const DESIGN_SERIES: IvSeries = {
  slug: "design-problems",
  title: "Practical Design Problems: From Whiteboard to Working Code",
  short: "Practical Design Problems",
  tagline:
    "Small, practical design problems with the details interviewers listen for: IDs, collisions, caching, headers and what happens when things fail. A URL shortener, a rate limiter, pagination, file upload, notifications, autocomplete and classic mini-designs.",
  started: "2026",
  accent: "indigo",
  lessons: lessons([
    ["How to Run a Practical Design Interview", "Requirements, API, data model, main algorithm, scale and failure, trade-offs. A frame you can repeat for every design question that follows.", "10 min", ["method", "interview"]],
    ["Design a URL Shortener (Long URL to Short URL)", "Making IDs, Base62, collisions, caching for read-heavy traffic, 301 vs 302 and analytics, custom aliases, expiry and stopping abuse.", "25 min", ["design", "url-shortener", "base62", "caching"]],
    ["Design a Rate Limiter", "Token bucket, leaky bucket, fixed and sliding windows, where to apply limits, 429 with Retry-After, and the new RateLimit headers.", "22 min", ["design", "rate-limiting", "redis"]],
    ["Design Pagination: Offset vs Cursor (Keyset)", "Why a large OFFSET is slow, how keyset paging works with a stable sort and a tiebreaker, opaque cursors and GraphQL connections.", "18 min", ["design", "pagination", "sql"]],
    ["Design File Upload (Including Large Files)", "Multipart uploads vs presigned URLs, chunked and resumable uploads, a progress bar, checking files, and why the API server should not pass gigabytes through itself.", "20 min", ["design", "uploads", "s3", "security"]],
    ["Design a Notification System (In-App, Push, Email)", "Polling, long polling, server-sent events and WebSockets, fan-out with queues, read state, user settings, retries and removing duplicates.", "20 min", ["design", "notifications", "websockets", "queues"]],
    ["Design Autocomplete / Typeahead (Frontend System Design)", "Debouncing, caching results for each query, cancelling old requests, keyboard accessibility and a trie on the backend.", "18 min", ["design", "frontend", "autocomplete"]],
    ["Design an LRU Cache, Idempotent Payments and Other Classic Mini-Problems", "Short worked designs: an LRU cache, idempotency keys, a job queue with retries and backoff, and feature flags.", "20 min", ["design", "lru", "idempotency", "retries"]],
  ], WRITTEN["design-problems"]),
};

export const FRONTEND_SERIES: IvSeries = {
  slug: "frontend-depth",
  title: "Senior Frontend Depth: React Internals, TypeScript & Testing",
  short: "Senior Frontend Depth",
  tagline:
    "Topics that come up most in interviews: how React really renders, hooks in depth, concurrent React and Server Components, how to manage state, advanced TypeScript, how to test, and accessibility.",
  started: "2026",
  accent: "lime",
  lessons: lessons([
    ["React Rendering Model: Render, Commit, Reconciliation and Keys", "What “render” really means, how React finds what changed between renders, why keys matter and how batching works.", "18 min", ["react", "reconciliation", "keys"]],
    ["Hooks in Depth: Effects, Refs and the Rules", "Effect dependencies, stale closures, useRef vs state, useLayoutEffect and the idea behind “You Might Not Need an Effect”.", "18 min", ["react", "hooks", "effects"]],
    ["Concurrent React, Suspense and Server Components in Next.js", "Transitions, Suspense boundaries, streaming SSR, hydration errors and the line between server and client components.", "20 min", ["react", "nextjs", "suspense", "rsc"]],
    ["State Management Decisions: Local, Context, Server Cache, Global Store", "How to sort state into kinds (UI, server, URL, form) and pick a tool for each kind, instead of arguing about libraries.", "15 min", ["react", "state", "architecture"]],
    ["Advanced TypeScript for Interviews: Generics, Narrowing, Utility and Conditional Types", "Generic constraints, discriminated unions, infer, mapped types, satisfies, and keeping API response types correct from the server to the UI.", "20 min", ["typescript", "generics", "types"]],
    ["Frontend Testing Strategy: Unit, Integration, E2E and What to Skip", "Test what users see, not how the code is built. Mock the network, not your modules. Keep end-to-end tests for the key flows only.", "15 min", ["testing", "react", "quality"]],
    ["Accessibility Essentials Interviewers Check", "Semantic HTML first, focus in modals, ARIA only when needed, and testing with the keyboard.", "12 min", ["accessibility", "html", "aria"]],
  ], WRITTEN["frontend-depth"]),
};

export const FULLSTACK_SERIES: IvSeries = {
  slug: "fullstack-qa",
  title: "Full-Stack Interview Questions for 4+ Years",
  short: "Full-Stack Questions",
  tagline:
    "Real questions for a full-stack engineer with four or more years of experience: HTML and CSS, Tailwind, TypeScript, React, Next.js, Node.js, Express, MongoDB, Prisma, Hasura, LLMs, agents, RAG, the AI SDK, Meilisearch, Mixpanel and the libraries teams use every day. Every answer is written in plain English.",
  started: "2026",
  accent: "violet",
  lessons: lessons([
    ["How to Use This Question Bank", "What interviewers expect at 4+ years, how the questions are grouped, and a one-page map of every topic.", "8 min", ["roadmap", "interview"]],
    ["HTML & CSS Interview Questions", "Semantic HTML, the cascade, layout with flexbox and grid, container queries, stacking contexts, and common CSS traps.", "32 min", ["html", "css"]],
    ["Tailwind CSS Interview Questions", "Tailwind v4, how utilities are generated, dynamic class names, class merging, design tokens and keeping Tailwind code tidy.", "27 min", ["tailwind", "css"]],
    ["TypeScript Interview Questions", "Generics, narrowing, utility types, tsconfig flags, typing React and APIs, and the errors that confuse people.", "31 min", ["typescript"]],
    ["React Interview Questions", "Component design, hooks, rendering cost, forms, data fetching, React 19, and code-review style questions.", "36 min", ["react"]],
    ["Next.js Interview Questions", "App Router, Server and Client Components, caching, Server Actions, proxy, rendering modes and deployment.", "34 min", ["nextjs"]],
    ["Node.js & Express Interview Questions", "Event loop, streams, workers, Express 5, security, graceful shutdown and performance.", "29 min", ["nodejs", "express"]],
    ["MongoDB Interview Questions", "Schema design, indexes, aggregation, transactions, replica sets, sharding and common anti-patterns.", "31 min", ["mongodb"]],
    ["Prisma & SQL Interview Questions", "Prisma 7, migrations, relations, transactions, N+1, raw queries, and the SQL behind it.", "30 min", ["prisma", "sql"]],
    ["Hasura & GraphQL Interview Questions", "How Hasura works, permissions, remote schemas, actions, events, subscriptions and GraphQL core ideas.", "29 min", ["hasura", "graphql"]],
    ["LLMs, Agentic AI, RAG and Harnesses", "Agent vs agentic AI, workflows vs agents, the harness, MCP, RAG end to end, evaluation and safety.", "45 min", ["ai", "llm", "rag"]],
    ["Vercel AI SDK Interview Questions", "streamText, tools, structured output, multi-step loops, useChat, testing and security.", "40 min", ["ai-sdk"]],
    ["Meilisearch & Mixpanel Interview Questions", "Search relevance, indexing and security with Meilisearch; events, identity and funnels with Mixpanel.", "39 min", ["search", "analytics"]],
    ["Popular Libraries Interviewers Ask About", "TanStack Query, Zustand, Zod, React Hook Form, auth libraries, Redis, BullMQ, Stripe, testing tools and more.", "39 min", ["libraries"]],
    ["The Experience-Level Round", "Ownership, trade-offs, debugging stories, code review and system-design-lite questions with model answers.", "32 min", ["behavioural", "experience"]],
    ["JavaScript Core Interview Questions", "Types and coercion, prototypes, classes, this, copying, Map and Set, iterators, modules, newer array methods and “what does this print” puzzles.", "39 min", ["javascript"]],
    ["Async JavaScript, Promises and the Event Loop", "Order puzzles in the browser and Node, promise rules, combinators, concurrency limits, cancellation, race conditions and async memory leaks.", "36 min", ["javascript", "async"]],
    ["JavaScript Coding Round: Polyfills and Utilities", "Tested solutions for debounce, throttle, curry, memoize, deep clone, promise polyfills, a pool, an event emitter, an LRU cache and live-coding tips.", "35 min", ["javascript", "coding"]],
    ["Redis and Caching Interview Questions", "Cache-aside and the other patterns, TTL and invalidation, stampedes, data types, persistence, eviction, rate limiting, locks and client settings that matter.", "40 min", ["redis", "caching"]],
    ["Queues, Background Jobs and Webhooks", "Why queues, BullMQ, retries and backoff, dead letters, idempotency, the outbox pattern, receiving and sending webhooks, RabbitMQ vs Kafka vs SQS.", "30 min", ["queues", "webhooks"]],
    ["Realtime: WebSockets, SSE and Socket.IO", "Polling vs SSE vs WebSocket, handshake and heartbeats, Socket.IO rooms and acks, scaling with Redis, auth, backpressure and proxy timeouts.", "38 min", ["realtime"]],
    ["Testing Tools: Jest, Vitest, Testing Library, Playwright", "Mocks and fake timers, MSW, user-event, testing hooks and Server Components, Playwright locators and flaky tests, database tests with Prisma.", "28 min", ["testing"]],
    ["Auth Libraries, OAuth and OIDC", "OAuth vs OpenID Connect, code flow with PKCE, tokens and rotation, Auth.js and Better Auth, protecting Next.js 16, RBAC, passkeys and MFA.", "42 min", ["auth", "oauth"]],
    ["Payments and Third-Party Integrations", "Stripe Checkout and Payment Intents, webhooks, idempotency keys, S3 uploads, email deliverability, timeouts, retries and circuit breakers.", "44 min", ["payments", "integrations"]],
    ["Git, Team Workflow and Monorepos", "Merge vs rebase, undoing mistakes, reflog, bisect, branching models, code review, pnpm workspaces, Turborepo, changesets and versioning.", "30 min", ["git", "monorepo"]],
    ["State and Data Libraries in Depth", "Redux Toolkit, TanStack Query v5, Zustand and Jotai, server state vs client state, optimistic updates, hydration with the App Router, forms with Zod.", "36 min", ["state", "react"]],
    ["Deployment, CI/CD and Monitoring", "Vercel deploys, Docker for Node, GitHub Actions, feature flags, safe rollouts and migrations, Sentry, OpenTelemetry and SLOs.", "43 min", ["deploy", "monitoring"]],
    ["SEO, i18n, PWA and PostgreSQL Deeper", "Next.js metadata and sitemaps, locale routing and plurals, service workers, window functions, JSONB, EXPLAIN, locks, vacuum and PgBouncer.", "41 min", ["seo", "postgres"]],
    ["Accessibility Beyond the Basics", "WCAG 2.2 criteria in plain words, forms, focus and dialogs, live regions, ARIA, contrast numbers and testing, one level past Frontend Depth Lesson 6.", "20 min", ["accessibility", "wcag", "testing"]],
    ["GraphQL Beyond Hasura", "Schema design, nullability, DataLoader, cursor pagination, errors, mutations, limits, subscriptions, federation, and when not to use GraphQL.", "22 min", ["graphql", "dataloader", "api-design"]],
    ["tRPC, REST and OpenAPI", "tRPC for your own TypeScript app, REST plus OpenAPI for outside callers: generated clients, contract tests, breaking changes, problem-details errors and idempotency keys.", "24 min", ["trpc", "openapi", "api-design"]],
    ["Security in Depth for Full-Stack Developers", "SSRF, path traversal, prototype pollution, ReDoS, unsafe deserialization, injection, password hashing, headers, rate limits, secrets, supply chain, uploads and a threat-model routine.", "32 min", ["security", "owasp", "nodejs"]],
    ["Full-Stack Performance: From Database to Browser", "Find the bottleneck first, then fix the database, caching, compression, streaming and bundle size, and measure each change with p50, p95 and p99.", "42 min", ["performance", "postgres", "load-testing"]],
    ["Node.js Internals Interviewers Ask About", "Event loop phases, microtask and nextTick order, the threadpool, backpressure, workers, memory, and the Node 22 tools with stable or experimental labels.", "43 min", ["nodejs", "event-loop", "internals"]],
    ["Containers, Kubernetes, Terraform and AWS for Full-Stack Interviews", "Containers versus VMs, Kubernetes objects, probes, rollouts, Helm, platform choice, IAM, Terraform state, secrets and cost.", "38 min", ["kubernetes", "terraform", "aws"]],
    ["Vector Databases, pgvector, Retrieval Evals and LLM Cost", "Distance measures, HNSW and IVFFlat, the filter trap, hybrid search, golden sets, judges, prompt caching and tracing.", "40 min", ["vector-db", "rag", "evals"]],
    ["System Design Mock Interview: How to Talk Through It", "Say a system design answer out loud: the 45-minute clock, the first five minutes, drawing boxes, one-sentence trade-offs, failure questions, numbers and a full walkthrough with timings.", "30 min", ["system-design", "interview", "communication"]],
    ["Live Coding and Take-Home Rounds", "A 45-minute routine, a take-home checklist and six full-stack tasks with tested code.", "42 min", ["live-coding", "take-home", "testing"]],
    ["Behavioural Questions, Salary and Offers", "Behavioural answers, conflict stories, salary talks, offers and the first 90 days.", "28 min", ["behavioural", "salary", "offers"]],
  ], WRITTEN["fullstack-qa"]),
};

export const TEAMLEAD_SERIES: IvSeries = {
  slug: "team-lead",
  title: "Team Lead & Development Mindset: The Questions Behind \"Why?\"",
  short: "Team Lead Mindset",
  tagline:
    "How a team lead thinks and the questions they ask: why this package, why this language, what are you thinking, how long will it take, what if it fails. Simple answer shapes, checklists and model answers for developers who want to lead.",
  started: "2026",
  accent: "orange",
  lessons: lessons([
    ["How a Team Lead Thinks: The Questions Behind \"Why?\"", "The six-step answer shape (goal, options, choice, reason, risk, plan B), how to think out loud, and a map of the questions a lead asks.", "15 min", ["mindset", "leadership", "interview"]],
    ["Why This Package? Choosing and Carrying Dependencies", "Six questions before you add a dependency, npm commands to check health, how to plan the exit, and a short decision-note template.", "14 min", ["packages", "npm", "dependencies"]],
    ["Why This Language or Framework? Decisions You Can Explain Later", "Start from the problem and the team, boring technology and innovation tokens, handling a team that wants something new, and writing decision records.", "14 min", ["languages", "frameworks", "decisions"]],
    ["Estimates, Code Review and Priorities", "Honest ranges with named unknowns, missed deadlines, quick fix versus proper fix, reviewing for better-not-perfect, and saying no with an option.", "15 min", ["estimates", "code-review", "priorities"]],
    ["Incidents, Team Health and Growing as a Lead", "Fix first and be blameless, DORA delivery measures without a people scoreboard, feedback, juniors, and your first weeks as a lead.", "15 min", ["incidents", "leadership", "teams"]],
    ["Design Docs, RFCs and Writing Things Down", "What real projects (Rust, Kubernetes, Python) put in a design doc, status words, a simple review process, when not to write one, and tips for clear writing.", "15 min", ["design-docs", "rfc", "writing"]],
    ["Technical Debt, Quality and the Rewrite Trap", "Debt as a loan with interest, refactor or rewrite, a test plan, what to monitor, and lessons from five famous public outages.", "16 min", ["technical-debt", "testing", "reliability"]],
    ["Laws and Biases Every Lead Should Know", "Conway, Brooks, Goodhart, Gall, Hyrum, Chesterton and more, each in one sentence with a lead's use, plus common thinking biases.", "14 min", ["laws", "biases", "decisions"]],
    ["1:1s, Feedback, Delegation and Conflict", "How to run a 1:1, give specific feedback, delegate with a clear owner, handle disagreement, and build trust.", "15 min", ["people", "feedback", "delegation"]],
    ["Mentoring, Onboarding and Hiring", "Context before answers, a first-90-days plan for a new hire, fair work-like interviews, and what the popular lists say about hiring.", "15 min", ["mentoring", "onboarding", "hiring"]],
    ["Stakeholders, Meetings and Change", "Explaining the why before the what, a five-line status update, fewer and better meetings, preparing people for change, and planning around outcomes.", "14 min", ["communication", "meetings", "planning"]],
    ["Sources and Reading List: Popular Repos and Documents", "The most-starred GitHub lists and well-known documents behind this series, which I read directly, which I only know from summaries, and which I could not open.", "10 min", ["sources", "reading", "learning"]],
    ["Technical Strategy and Roadmaps", "Strategy versus wish list, roadmaps as bets with date ranges, saying no, build versus buy, migrations and a one-page strategy template.", "8 min", ["strategy", "roadmap", "build-vs-buy"]],
    ["Career Growth, Promotion and the Staff-Engineer Path", "Ladders, scope versus output, the IC and manager tracks, sponsorship versus mentorship, and a promotion packet template.", "9 min", ["career-ladders", "promotion", "staff-engineer"]],
    ["A Security Mindset for Team Leads", "A 30-minute threat model, supply-chain hygiene, secrets, access reviews, SECURITY.md and security in code review.", "13 min", ["security", "threat-modelling", "supply-chain"]],
    ["Rules for AI-Assisted Coding on a Team", "The author owns every line, what to allow, reviewing generated code harder, agent permissions, helping juniors, measuring honestly and a one-page policy.", "14 min", ["ai-assistants", "policy", "code-review"]],
    ["Scaling Teams, Ownership and On-Call", "Splitting teams with Conway in mind, a service catalogue, humane on-call, avoiding hero culture, toil and cross-team dependencies.", "14 min", ["scaling", "on-call", "ownership"]],
    ["Culture, Psychological Safety and Retrospectives", "Daily habits that build culture, psychological safety, the brilliant jerk, remote habits, a retro template and Etsy's incident debrief method.", "15 min", ["culture", "retrospectives", "psychological-safety"]],
  ], WRITTEN["team-lead"]),
};

export const LLD_SERIES: IvSeries = {
  slug: "low-level-design",
  title: "Design Patterns and Low-Level Design (OOD) for Interviews",
  short: "Design Patterns & LLD",
  tagline:
    "Object-oriented design interviews and the design patterns behind them: SOLID, creational, structural and behavioural patterns, the patterns you already use, and worked class designs for a parking lot, LRU cache, vending machine, elevator, blackjack, chat server, rate limiter and notifications. All examples are TypeScript that was run.",
  started: "2026",
  accent: "pink",
  lessons: lessons([
    ["How to Run a Low-Level Design Interview, and SOLID in Plain Words", "The five-step routine, composition over inheritance, SOLID with before and after examples, and ASCII UML.", "20 min", ["lld", "solid", "interviews"]],
    ["Creational Patterns: Factory, Builder, Singleton and Friends", "Factories, builder, the module singleton and its traps, prototype, and dependency injection as the practical replacement.", "20 min", ["creational-patterns", "singleton", "dependency-injection"]],
    ["Structural Patterns: Adapter, Decorator, Facade, Proxy and Composite", "The intent of each pattern, how to tell them apart, and the JavaScript Proxy object.", "18 min", ["structural-patterns", "decorator", "proxy"]],
    ["Behavioural Patterns: Strategy, Observer, Command, State and Chain of Responsibility", "The five main behavioural patterns plus iterator and template method, with runnable TypeScript.", "20 min", ["behavioural-patterns", "state-machine", "observer"]],
    ["Patterns You Already Use: Middleware, Hooks, Dependency Injection, and Anti-Patterns", "Express and Koa middleware, EventEmitter, Redux, React, and the anti-patterns that spoil designs.", "20 min", ["middleware", "anti-patterns", "react"]],
    ["Design a Parking Lot", "Best-fit and nearest-spot strategies, hourly pricing with a daily cap, and a double-booking race fixed with compare-and-set.", "28 min", ["parking-lot", "strategy", "concurrency"]],
    ["Design an LRU Cache and a Hash Map", "Chaining and resize, a map plus doubly linked list, TTL, and stampede control.", "30 min", ["lru", "hash-map", "ttl"]],
    ["Design a Vending Machine and an Elevator (State Machines)", "The State pattern versus a transition table, and elevator scheduling compared by floors travelled.", "30 min", ["state-machine", "state-pattern", "scheduling"]],
    ["Design a Deck of Cards, Blackjack and a Chat Server (Class Models)", "Ace scoring, stacked-deck tests, and a chat server built with the observer pattern.", "30 min", ["blackjack", "chat-server", "class-design"]],
    ["Design a Rate Limiter and a Notification Service (Class Models)", "Token bucket and window limiters, channel strategy, backoff with jitter, and idempotency.", "32 min", ["rate-limiter", "notifications", "idempotency"]],
  ], WRITTEN["low-level-design"]),
};

export const DESIGNCASES_SERIES: IvSeries = {
  slug: "design-cases",
  title: "System Design Case Studies, Part 2",
  short: "System Design Case Studies 2",
  tagline:
    "Twelve more system design case studies, each with requirements, back-of-envelope numbers, API, data model, architecture, deep dives, failure modes and a runnable simulation: web crawler, key-value store, Dropbox-style sync, collaborative editing, CDN, top-K, unique IDs, multi-region, matching engine, sales ranking, finance pipeline and scaling on AWS.",
  started: "2026",
  accent: "sky",
  lessons: lessons([
    ["Design a Web Crawler", "The URL frontier, politeness, Bloom-filter dedup and trap defence, with a crawler simulation you can run.", "25 min", ["crawler", "bloom-filter", "politeness"]],
    ["Design a Key-Value Store (Like Redis or Dynamo)", "A write-ahead log and snapshots on one node, then a consistent-hash ring, N/R/W quorum and version vectors across many.", "22 min", ["key-value", "consistent-hashing", "quorum"]],
    ["Design a File Sync Service Like Dropbox", "Content-defined chunking, dedup, journal-based sync and conflicted copies.", "22 min", ["file-sync", "chunking", "dedup"]],
    ["Design Collaborative Editing Like Google Docs", "Operational transformation versus CRDTs, cursors and presence, and an operation log with snapshots.", "24 min", ["ot", "crdt", "collaboration"]],
    ["Design a CDN", "Edge caches, cache keys and TTL, purging, request coalescing and hit-ratio arithmetic, with an edge-cache simulation.", "22 min", ["cdn", "caching", "edge"]],
    ["Design Trending Topics and Top-K Requests", "Streaming counts, sliding windows, a count-min sketch with a heap, and merging top-K across partitions.", "22 min", ["top-k", "count-min-sketch", "streaming"]],
    ["Design a Unique ID Generator", "Auto-increment limits, UUID v4 and v7, ULID, Snowflake bit maths, clock skew and ticket servers, with a tested generator.", "14 min", ["unique-id", "snowflake", "uuid"]],
    ["Design a System Across Multiple Data Centres", "Active-passive versus active-active, DNS steering, sync versus async replication, split brain and failback, with an RPO simulation.", "15 min", ["multi-region", "replication", "failover"]],
    ["Design a Stock Exchange Matching Engine", "A price-time priority order book, a single-threaded sequencer, event-log replay, market data and risk checks, with a tested engine.", "20 min", ["matching-engine", "order-book", "event-sourcing"]],
    ["Design Sales Ranking by Category", "Hourly buckets and a sliding-window aggregator feeding per-category sorted sets, with freshness, hot categories and backfill.", "18 min", ["ranking", "sorted-set", "windowed-aggregation"]],
    ["Design a Personal-Finance Data Pipeline (Mint-Style)", "Idempotent ingest, dedup, rules-first categorisation, budget alerts, reconciliation and token security.", "22 min", ["data-pipeline", "idempotency", "security"]],
    ["From One User to Millions: Scaling a Web App on AWS", "Ten scaling stages with trigger, change and cost, the metric that tells you, AWS services in plain words, and a queueing arithmetic demo.", "20 min", ["scaling", "aws", "capacity-planning"]],
  ], WRITTEN["design-cases"]),
};

export const CSFOUNDATIONS_SERIES: IvSeries = {
  slug: "cs-foundations",
  title: "Computer Science Foundations Interviewers Assume",
  short: "CS Foundations",
  tagline:
    "The computer science underneath your code: how programs run, memory and CPU caches, floating point, Unicode, binary and bit tricks, probability, hard problems and string searching, explained in plain English with runnable examples.",
  started: "2026",
  accent: "amber",
  lessons: lessons([
    ["How a Computer Runs Your Program", "From source code to machine code: compiling, interpreting and JIT, the stack and the heap, function calls, stack overflow and garbage collection.", "20 min", ["computer-science", "memory", "runtime"]],
    ["Memory, CPU Caches and Why Array Order Matters", "The memory hierarchy, cache lines, locality, and a timing experiment that walks a matrix row by row and column by column.", "15 min", ["memory", "caches", "performance"]],
    ["Floating Point: Why 0.1 + 0.2 Is Not 0.3", "IEEE 754 doubles with bit-level demos, rounding, safe integers, comparing floats and handling money.", "16 min", ["floating-point", "ieee-754", "numbers"]],
    ["Unicode, UTF-8 and Strings That Lie", "Code points, UTF-16 code units, bytes and grapheme clusters, why emoji lengths surprise you, normalisation and safe truncation.", "20 min", ["unicode", "utf-8", "strings"]],
    ["Binary, Endianness and Bit Tricks", "Reading binary and hex, two's complement, JavaScript's 32-bit bitwise operators, masks, endianness and DataView.", "17 min", ["binary", "endianness", "bit-manipulation"]],
    ["Combinatorics and Probability for Interviews", "Counting rules, permutations and combinations, the birthday paradox, expected value, Bayes in plain words, Fisher-Yates and reservoir sampling.", "17 min", ["probability", "combinatorics", "sampling"]],
    ["P, NP and Hard Problems: What to Say in an Interview", "Complexity classes in plain words, NP-complete examples, and what to do when a problem is hard: exact for small inputs, approximation and heuristics.", "15 min", ["np-complete", "complexity", "algorithms"]],
    ["String Searching: Naive, KMP, Rabin-Karp and Z", "The naive worst case, KMP with a traced failure function, Rabin-Karp collisions, the Z-array and a tiny Aho-Corasick, with local timings.", "14 min", ["algorithms", "strings", "interviews"]],
  ], WRITTEN["cs-foundations"]),
};

export const GITGITHUB_SERIES: IvSeries = {
  slug: "git-github",
  title: "Git and GitHub From Zero",
  short: "Git & GitHub",
  tagline:
    "Git from the first commit to team workflows: the mental model, the daily loop, branches and conflicts, remotes and pull requests, undoing mistakes and rebase. Every command was run in a throwaway repository and the real output is shown.",
  started: "2026",
  accent: "indigo",
  lessons: lessons([
    ["The Mental Model: Snapshots, Commits and Branches", "The working tree, the staging area and the repository, how a commit is a snapshot with a parent, and how branches and HEAD are just pointers.", "7 min", ["git", "internals", "beginner"]],
    ["The Daily Loop: Status, Add, Commit, Diff and Log", "The commands you use every day, .gitignore, good commit messages and staging parts of a file with git add -p.", "9 min", ["git", "commits", "workflow"]],
    ["Branches, Merging and Conflicts", "Fast-forward versus merge commits, and a real merge conflict resolved step by step.", "8 min", ["git", "branching", "merge"]],
    ["Remotes, Pull Requests and Code Review", "Remotes, fetch versus pull, upstream tracking, forks, and the pull request flow with review habits.", "9 min", ["git", "github", "pull-requests"]],
    ["Undoing Things Safely: Restore, Reset, Revert, Reflog and Friends", "The undo tools run for real, recovering a lost commit with reflog, bisect, and a table of which command to use.", "10 min", ["git", "undo", "recovery"]],
    ["Rebase, Clean History and Team Workflows", "Rebase versus merge, tidying history, force-with-lease, branch protection, CODEOWNERS and a first GitHub Actions workflow.", "11 min", ["git", "rebase", "ci"]],
  ], WRITTEN["git-github"]),
};

export const TESTING_SERIES: IvSeries = {
  slug: "testing",
  title: "Testing From Zero: What, Why and How",
  short: "Testing From Zero",
  tagline:
    "Testing from the first test to a team strategy: the shapes of a test suite, unit tests and test doubles, UI tests with Testing Library, API and integration tests, end-to-end tests with Playwright, and TDD, property-based and mutation testing. Every example was run.",
  started: "2026",
  accent: "lime",
  lessons: lessons([
    ["Why We Test, and the Shapes of a Test Suite", "What tests prove and do not prove, the pyramid, trophy and honeycomb as models, what to test, a first node:test run, and bad tests.", "12 min", ["testing", "fundamentals", "node-test"]],
    ["Unit Tests and Test Doubles", "Arrange-act-assert, stubs, mocks, spies and fakes, fake timers, async errors, test isolation, and why mocking your own internals hurts.", "13 min", ["unit-testing", "vitest", "test-doubles"]],
    ["Testing UI Components with Testing Library", "Queries by role, user-event, async UI, mocking the network with MSW, forms and error states.", "13 min", ["react-testing", "msw", "accessibility"]],
    ["Integration and API Tests", "Testing an Express API in-process, test database strategies, contracts, webhooks and queues.", "15 min", ["testing", "api", "integration"]],
    ["End-to-End Tests with Playwright, and Fixing Flaky Tests", "Playwright locators, auto-waiting, traces and isolation, with four flaky tests reproduced and fixed.", "17 min", ["playwright", "e2e", "flaky-tests"]],
    ["TDD, Property-Based Testing, Mutation Testing and a Team Strategy", "A TDD kata, fast-check shrinking, Stryker mutation testing, coverage, and a one-page team test strategy.", "19 min", ["tdd", "mutation-testing", "strategy"]],
  ], WRITTEN["testing"]),
};

export const TYPESCRIPT_SERIES: IvSeries = {
  slug: "typescript",
  title: "TypeScript From Zero to Confident",
  short: "TypeScript From Zero",
  tagline:
    "TypeScript from the first project to real-world configuration: basic types and narrowing, objects and classes, functions and generics, utility and conditional types, modules and tsconfig, React and runtime validation with Zod, and migrating to strict mode. Every compiler error shown was reproduced.",
  started: "2026",
  accent: "emerald",
  lessons: lessons([
    ["Why TypeScript, and Your First Project", "What TypeScript is and is not, why types are erased at runtime, setting up a project, a tsconfig explained line by line, and reading your first compiler errors.", "20 min", ["typescript", "setup", "tsconfig"]],
    ["Basic Types, Inference and Narrowing", "Primitives, unions, literal types, any versus unknown versus never, inference, narrowing and discriminated unions.", "22 min", ["typescript", "types", "narrowing"]],
    ["Objects, Interfaces, Type Aliases and Classes", "Object types, interface versus type, structural typing, excess-property checks, classes, enums versus unions, as const and satisfies.", "22 min", ["typescript", "types", "classes"]],
    ["Functions and Generics", "Function types, overloads, this parameters, generics and constraints, a typed fetch wrapper and a typed event emitter.", "24 min", ["typescript", "generics", "functions"]],
    ["Utility, Mapped and Conditional Types", "Built-in helper types, mapped and conditional types, infer, template literal types, and when not to be clever.", "28 min", ["typescript", "generics", "type-level"]],
    ["Modules, Declaration Files and tsconfig in Real Projects", "ES modules versus CommonJS, moduleResolution, paths, .d.ts files, @types, project references, and tsconfig for Node, Vite and Next.js.", "25 min", ["typescript", "tsconfig", "modules"]],
    ["TypeScript with React, Node and Runtime Validation", "Typed React and Express, plus Zod validation and branded types, because types vanish at runtime.", "30 min", ["typescript", "react", "zod"]],
    ["Common Errors, Strictness Migration and Reading Error Messages", "Reading long errors bottom-up, the common error codes, and a measured step-by-step migration to strict mode.", "25 min", ["typescript", "errors", "migration"]],
  ], WRITTEN["typescript"]),
};

export const SQLPOSTGRES_SERIES: IvSeries = {
  slug: "sql-postgres",
  title: "SQL and PostgreSQL From Zero",
  short: "SQL & PostgreSQL",
  tagline:
    "SQL and PostgreSQL from your first SELECT to production habits: joins, aggregates, window functions, schema design, indexes and EXPLAIN, transactions and locks, JSONB and safe migrations. Every query was run on a real PostgreSQL server and the real output is shown.",
  started: "2026",
  accent: "teal",
  lessons: lessons([
    ["Tables, SELECT and WHERE", "What a relational database is, running PostgreSQL, a small shop schema, SELECT, WHERE, NULL logic, and INSERT, UPDATE and DELETE with RETURNING.", "18 min", ["sql", "postgresql", "select"]],
    ["Joins: Combining Tables", "Primary and foreign keys, inner, left, right, full and cross joins with drawn result tables, self joins and the NULL trap in left joins.", "18 min", ["sql", "joins", "postgresql"]],
    ["Aggregates, GROUP BY and HAVING", "COUNT, SUM and AVG, GROUP BY rules, HAVING versus WHERE, FILTER, date_trunc reports and the order a SELECT is evaluated.", "20 min", ["sql", "aggregates", "group-by"]],
    ["Subqueries, CTEs and Window Functions", "Scalar, IN and EXISTS subqueries, WITH queries, a recursive category tree, ranking, LAG and LEAD, running totals and top-N per group.", "22 min", ["sql", "cte", "window-functions"]],
    ["Designing a Schema: Keys, Normalisation and Constraints", "Identity versus UUID keys, normal forms with a flat-to-normalised redesign, ON DELETE, enums, money, timestamptz and soft deletes.", "22 min", ["sql", "schema-design", "constraints"]],
    ["Indexes and EXPLAIN", "How a B-tree helps, composite, covering and partial indexes, and reading real EXPLAIN ANALYZE plans on a million rows.", "24 min", ["sql", "indexes", "explain"]],
    ["Transactions, Isolation Levels and Locks", "Atomicity, read committed versus repeatable read versus serializable with two real sessions, row locks, SKIP LOCKED, deadlocks and retries.", "22 min", ["sql", "transactions", "locks"]],
    ["PostgreSQL Features: JSONB, Full-Text Search, Arrays and Safe Migrations", "JSONB with GIN indexes, full-text search, arrays, upserts, and expand-and-contract migrations that do not lock a busy table.", "24 min", ["postgresql", "jsonb", "migrations"]],
  ], WRITTEN["sql-postgres"]),
};

export const JAVASCRIPT2_SERIES: IvSeries = {
  slug: "javascript-2",
  title: "JavaScript Part 2: Objects, Async and Modules",
  short: "JavaScript Part 2",
  tagline:
    "The second half of JavaScript: objects and prototypes, this and classes, promises and async/await, modules, iterators and generators, the DOM and events, errors and Proxy, and memory. Each idea is traced with small examples that were run.",
  started: "2026",
  accent: "amber",
  lessons: lessons([
    ["Objects and the Prototype Chain", "Property descriptors, how lookup walks the prototype chain, new traced step by step, shadowing, freeze and seal.", "25 min", ["objects", "prototypes", "descriptors"]],
    ["this, call/apply/bind and Classes", "The four rules for this, arrow functions, call, apply and bind, and classes shown as sugar over prototypes.", "25 min", ["this", "classes", "bind"]],
    ["Promises and async/await From the Ground Up", "Promise states, microtask order, a promise built by hand, async/await, the combinators and AbortController.", "30 min", ["promises", "async-await", "abortcontroller"]],
    ["Modules: ES Modules, CommonJS, Bundlers and Tree Shaking", "Live bindings versus copies, Node's module rules, circular imports, and a real bundle built with esbuild.", "30 min", ["modules", "esm", "bundlers"]],
    ["Iterators, Generators and Symbols", "The iteration protocol, writing iterators and generators by hand, lazy sequences, async iterators and symbols.", "28 min", ["iterators", "generators", "symbols"]],
    ["The DOM and Events", "The DOM tree, changing nodes, capturing and bubbling traced, event delegation, custom events and forms, run with jsdom.", "28 min", ["dom", "events", "delegation"]],
    ["Errors, Proxy, Reflect, Copying and Immutability", "Throwing and catching, Proxy traps with Reflect, shallow versus deep copies, structuredClone and immutable updates.", "30 min", ["errors", "proxy", "immutability"]],
    ["Memory, Garbage Collection and WeakMap/WeakRef", "Reachability, five usual leaks measured, WeakMap and WeakRef, typed arrays and how to find a leak with heap snapshots.", "22 min", ["memory", "garbage-collection", "weakmap"]],
  ], WRITTEN["javascript-2"]),
};

export const AIENGINEERING_SERIES: IvSeries = {
  slug: "ai-engineering",
  title: "AI Engineering for Full-Stack Developers",
  short: "AI Engineering",
  tagline:
    "Building LLM features you can trust: the OWASP Top 10 for LLM apps, prompt injection and safe tools, evaluation harnesses, cost and latency, and observability with guardrails. Every demo uses a deterministic fake model, so nothing needs an API key.",
  started: "2026",
  accent: "rose",
  lessons: lessons([
    ["Securing LLM Applications: The OWASP Top 10 for LLM Apps in Code", "The ten 2025 OWASP risks for LLM applications, each with a plain definition, a vulnerable sketch, a fix and a one-line interview answer.", "14 min", ["security", "owasp", "llm"]],
    ["Prompt Injection and Safe Tool Use for Agents", "Direct and indirect injection, a mock agent leaking private notes, and a policy layer that blocks the leak.", "13 min", ["security", "agents", "prompt-injection"]],
    ["Building an Evaluation Harness for an LLM Feature", "A golden set, code checks and a mock judge, confidence intervals, and a CI gate that catches a regression.", "14 min", ["evals", "testing", "llm"]],
    ["Cost, Latency and Caching for LLM Features", "Token arithmetic, time to first token, prompt and response caching, model routing, batching, timeouts and budgets, with a simulation.", "20 min", ["cost", "latency", "caching"]],
    ["Observability and Guardrails for LLM Features in Production", "What to log and what never to log, spans, redaction, schema validation, a circuit breaker, a kill switch, prompt versions and an incident playbook.", "18 min", ["observability", "guardrails", "production"]],
  ], WRITTEN["ai-engineering"]),
};

export const CAREER_SERIES: IvSeries = {
  slug: "career",
  title: "Software Engineer Career and Interview Playbook",
  short: "Career Playbook",
  tagline:
    "How to prepare for software engineering interviews: a resume that gets read, a study plan mapped to the DSA lessons on this site, and mock interviews with a scoring sheet and a mistake log. Built from the public Tech Interview Handbook.",
  started: "2026",
  accent: "sky",
  lessons: lessons([
    ["A Resume Guide for Software Engineers", "A one-page, scannable resume built from the Tech Interview Handbook guide: structure, strong bullets, ATS myths versus facts, and five before-and-after rewrites.", "15 min", ["resume", "career", "interviews"]],
    ["A Coding-Interview Study Plan Mapped to This Site", "The handbook's 3-month plan (about 11 hours a week), three ways to order your study, and a 12-week table that points to the matching DSA lessons.", "14 min", ["study-plan", "dsa", "interviews"]],
    ["Practising Well: Mock Interviews, Feedback Loops and Nerves", "The four things interviewers score, techniques for before, during and after coding and when stuck, a mock-interview routine, a scoring sheet and a mistake log.", "14 min", ["mock-interviews", "practice", "feedback"]],
  ], WRITTEN["career"]),
};

export const SECURITY_SERIES: IvSeries = {
  slug: "security",
  title: "Security for Developers: Web App Security From Zero",
  short: "Security for Developers",
  tagline:
    "The security a working developer needs: how attackers think, injection, XSS and CSRF, passwords and login, access control, secrets and cryptography, dependencies and supply chain, and APIs. Small examples, every one run, based on OWASP, PortSwigger and the Node.js security guides.",
  started: "2026",
  accent: "violet",
  lessons: lessons([
    ["The Security Mindset: Threats, Attack Surface and the OWASP Top 10", "How attackers think, what to protect, threat modelling in four questions, defence in depth, least privilege, and a map of the OWASP Top 10 so you know where each lesson fits.", "12 min", ["security", "owasp", "threat-modeling", "beginner"]],
    ["Injection: SQL Injection, Command Injection and How to Stop Them", "A real SQL injection on a tiny login, then the fix with parameterised queries. Also command injection, NoSQL injection and the rule behind all of them: never mix data into code.", "14 min", ["security", "injection", "sql", "owasp"]],
    ["XSS, CSRF, Clickjacking and Security Headers", "How a script gets into your page and how to stop it with output encoding and CSP, how CSRF uses your cookies, SameSite and CSRF tokens, frame-ancestors, and the headers worth setting.", "16 min", ["security", "xss", "csrf", "csp", "headers"]],
    ["Passwords and Login: Hashing, Sessions, MFA and Rate Limits", "Why you never store passwords, hashing with a salt (scrypt and Argon2), safe sessions and JWT mistakes, password reset flows, MFA, and stopping brute force.", "16 min", ["security", "auth", "passwords", "sessions", "jwt"]],
    ["Access Control: IDOR, Roles and Mass Assignment", "The number one web risk: checking who you are but not what you may do. IDOR with a real example, deny by default, roles and ownership checks, and mass assignment.", "14 min", ["security", "authorization", "idor", "rbac"]],
    ["Secrets, Encryption and Data Protection", "Where secrets leak (git, logs, front-end bundles), hashing vs encryption vs encoding, TLS in plain words, safe randomness, encrypting data with AES-GCM, and handling personal data.", "15 min", ["security", "secrets", "cryptography", "tls", "privacy"]],
    ["Dependencies and the Supply Chain: npm, Lockfiles and GitHub Actions", "How a package you did not write can hurt you: typosquatting, install scripts, malicious updates. Lockfiles, npm audit, Dependabot, secret scanning and securing your CI.", "13 min", ["security", "supply-chain", "npm", "github-actions"]],
    ["APIs and Servers: SSRF, File Uploads, Rate Limits and Misconfiguration", "Server-side request forgery, unsafe file uploads, missing rate limits, verbose errors, CORS mistakes and the OWASP API Top 10, each with a small example and a fix.", "15 min", ["security", "api", "ssrf", "uploads", "owasp"]],
    ["Security in Practice: Code Review Checklist, Testing, Incidents and Interview Answers", "A review checklist you can use tomorrow, SAST, DAST and dependency scans, what to do in the first hour of an incident, and the security questions interviewers ask with model answers.", "16 min", ["security", "code-review", "incident-response", "interview"]],
  ], WRITTEN["security"]),
};

export const APIDESIGN_SERIES: IvSeries = {
  slug: "api-design",
  title: "API Design: REST, GraphQL and gRPC From Zero",
  short: "API Design",
  tagline:
    "How to design an API other developers enjoy using: resources and URLs, methods and status codes, errors, pagination, versioning, idempotency, authentication, rate limits, OpenAPI, and when to choose GraphQL or gRPC. Small examples, every one run.",
  started: "2026",
  accent: "indigo",
  lessons: lessons([
    ["What Makes a Good API: Resources, URLs and the Contract", "What an API contract is, REST in plain words, naming resources and URLs, and the rules that make an API predictable.", "12 min", ["api", "rest", "design", "beginner"]],
    ["HTTP Methods, Status Codes and Idempotency in Practice", "GET, POST, PUT, PATCH and DELETE used correctly, the status codes that matter, and why idempotency decides whether a retry is safe.", "14 min", ["api", "http", "idempotency", "status-codes"]],
    ["Request and Response Design: JSON Shapes, Errors and Validation", "Consistent JSON, naming, dates and money, one error format (RFC 9457 problem details), validation with clear messages, and what never to return.", "14 min", ["api", "json", "errors", "validation"]],
    ["Pagination, Filtering and Sorting", "Offset versus cursor pagination with real timings, stable ordering, filters, sorting, and how to return links and counts.", "14 min", ["api", "pagination", "performance"]],
    ["Versioning, Compatibility and Evolving an API", "Breaking versus safe changes, URL, header and date versions, deprecation, and how to change an API without breaking clients.", "13 min", ["api", "versioning", "compatibility"]],
    ["Idempotency Keys, Retries, Webhooks and Rate Limits", "Safe retries with idempotency keys, webhooks with signatures and retries, rate limit headers, and long-running jobs.", "15 min", ["api", "webhooks", "rate-limiting", "retries"]],
    ["API Authentication and Authorization: API Keys, OAuth 2.0 and Scopes", "API keys, bearer tokens, OAuth 2.0 flows in plain words, scopes, and common mistakes. Ties back to the Security series.", "15 min", ["api", "oauth", "auth", "security"]],
    ["Documenting APIs: OpenAPI, Contracts and Testing", "Write an OpenAPI file, generate docs, validate requests and responses against it, contract tests and mock servers.", "13 min", ["api", "openapi", "testing", "documentation"]],
    ["GraphQL and gRPC: When Not to Use REST", "What problems GraphQL and gRPC solve, the real costs (N+1, caching, tooling), a small working example of each, and a decision table.", "15 min", ["api", "graphql", "grpc"]],
    ["API Design Interview Questions and Review Checklist", "A checklist to review any API, and the questions interviewers ask with model answers.", "15 min", ["api", "interview", "checklist"]],
  ], WRITTEN["api-design"]),
};

export const REACT_SERIES: IvSeries = {
  slug: "react",
  title: "React in Depth: From Components to Performance",
  short: "React in Depth",
  tagline:
    "React from the first component to confident senior answers: how rendering really works, state, effects, hooks rules, forms, data fetching, context, performance, patterns, testing and a React interview Q&A. Every example was run.",
  started: "2026",
  accent: "sky",
  lessons: lessons([
    ["Thinking in React: Components, Props and JSX", "What React is, how JSX becomes function calls, components as functions, props, and the one-way data flow.", "12 min", ["react", "jsx", "components", "beginner"]],
    ["State and Rendering: What Really Happens When State Changes", "State, re-renders, batching, how React compares trees, keys, and the render-then-commit steps, with a traced example.", "15 min", ["react", "state", "rendering", "reconciliation"]],
    ["Effects and the Lifecycle: useEffect Without the Confusion", "What an effect is, dependencies, cleanup, why effects run twice in development, and when you do not need an effect.", "15 min", ["react", "useEffect", "effects", "hooks"]],
    ["Hooks in Depth: useRef, useMemo, useCallback, useReducer and Custom Hooks", "Each hook with one small reason to use it, the rules of hooks and why they exist, and how to write a custom hook.", "16 min", ["react", "hooks", "useReducer", "custom-hooks"]],
    ["Forms, Events and Controlled Inputs", "Controlled and uncontrolled inputs, form actions and useActionState in React 19, validation, and accessibility basics.", "14 min", ["react", "forms", "events", "accessibility"]],
    ["Data Fetching, Caching and Server State", "fetch in effects and its bugs, race conditions, loading and error states, TanStack Query ideas, and Suspense with use().", "15 min", ["react", "data-fetching", "suspense", "tanstack-query"]],
    ["Context, State Management and Choosing Where State Lives", "Lifting state, context and its re-render cost, reducers, Zustand and Redux Toolkit at a glance, and a simple decision table.", "14 min", ["react", "context", "state-management", "zustand"]],
    ["Performance: Memoization, Lists, Code Splitting and the React Compiler", "Find slow renders with the Profiler, memo, virtualised lists, lazy loading, transitions, and what the React Compiler changes.", "16 min", ["react", "performance", "memo", "compiler"]],
    ["Patterns, Server Components and Testing React", "Composition patterns, error boundaries, portals, Server and Client Components in plain words, and testing with Testing Library.", "16 min", ["react", "patterns", "server-components", "testing"]],
    ["React Interview Questions With Model Answers", "The questions asked at every level: rendering, keys, hooks, state, performance, and the traps, with first-person answers.", "18 min", ["react", "interview"]],
  ], WRITTEN["react"]),
};

export const NODEJS_SERIES: IvSeries = {
  slug: "nodejs",
  title: "Node.js From Zero: Event Loop, Streams and Servers",
  short: "Node.js From Zero",
  tagline:
    "Node.js the way a working developer needs it: the event loop, modules, files and streams, building an HTTP server without a framework, Express and Fastify, errors and logging, async patterns, worker threads and production habits. Every example was run.",
  started: "2026",
  accent: "emerald",
  lessons: lessons([
    ["What Node.js Is and How It Runs Your Code", "V8, libuv and the runtime, the single thread and what it means, modules (ESM and CommonJS), npm, and running your first script.", "12 min", ["nodejs", "runtime", "modules", "beginner"]],
    ["The Event Loop: Timers, Promises and the Poll Phase", "The loop phases, microtasks versus macrotasks, process.nextTick, setImmediate, and how a blocked loop freezes everything. Traced and run.", "16 min", ["nodejs", "event-loop", "async"]],
    ["Files, Paths and Buffers", "fs and fs/promises, paths, buffers and encodings, reading and writing safely, and watching files.", "13 min", ["nodejs", "fs", "buffers"]],
    ["Streams and Backpressure", "Readable, writable and transform streams, pipeline, backpressure shown with real memory numbers, and when streams beat reading whole files.", "16 min", ["nodejs", "streams", "backpressure"]],
    ["An HTTP Server From Scratch", "The node:http module, routing by hand, reading bodies, headers and status codes, then why a framework helps.", "14 min", ["nodejs", "http", "server"]],
    ["Express and Fastify: Middleware, Routing and Validation", "The middleware idea, Express 5 and Fastify side by side, error handling middleware, validation with schemas.", "15 min", ["nodejs", "express", "fastify", "middleware"]],
    ["Errors, Logging and Graceful Shutdown", "Operational versus programmer errors, uncaught exceptions, structured logs, health checks, and shutting down without dropping requests.", "15 min", ["nodejs", "errors", "logging", "shutdown"]],
    ["Concurrency: Promises, Worker Threads, Clusters and Child Processes", "Promise.all and limits, CPU work in worker_threads, cluster and why containers often replace it, and a timed comparison.", "16 min", ["nodejs", "concurrency", "worker-threads"]],
    ["Testing, Performance and Production Habits", "node:test, profiling with --cpu-prof, memory leaks, configuration, Docker basics, and a production checklist.", "15 min", ["nodejs", "testing", "performance", "production"]],
    ["Node.js Interview Questions With Model Answers", "Event loop, streams, errors, scaling and security questions with model answers.", "16 min", ["nodejs", "interview"]],
  ], WRITTEN["nodejs"]),
};

export const IV_SERIES: IvSeries[] = [BROWSER_SERIES, BACKEND_SERIES, DEBUGGING_SERIES, DESIGN_SERIES, FRONTEND_SERIES, FULLSTACK_SERIES, TEAMLEAD_SERIES, LLD_SERIES, DESIGNCASES_SERIES, CSFOUNDATIONS_SERIES, GITGITHUB_SERIES, TESTING_SERIES, TYPESCRIPT_SERIES, SQLPOSTGRES_SERIES, JAVASCRIPT2_SERIES, AIENGINEERING_SERIES, CAREER_SERIES, SECURITY_SERIES, APIDESIGN_SERIES, REACT_SERIES, NODEJS_SERIES];

export function getIvSeries(slug: string): IvSeries | undefined {
  return IV_SERIES.find((s) => s.slug === slug);
}

export const ivLessonHref = (series: IvSeries, lesson: Lesson) => `/${series.slug}/${lesson.slug}`;
