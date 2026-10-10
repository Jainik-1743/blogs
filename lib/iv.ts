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
const WRITTEN: Record<string, number> = { browser: 10, backend: 12, debugging: 15, "design-problems": 8, "frontend-depth": 7, "fullstack-qa": 28, "team-lead": 6 };

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
    ["Sources and Reading List: Popular Repos and Documents", "The most-starred GitHub lists and well-known documents behind this series, which I read directly, which I only know from summaries, and which I could not open.", "10 min", ["sources", "reading", "learning"]],
  ], WRITTEN["team-lead"]),
};

export const IV_SERIES: IvSeries[] = [BROWSER_SERIES, BACKEND_SERIES, DEBUGGING_SERIES, DESIGN_SERIES, FRONTEND_SERIES, FULLSTACK_SERIES, TEAMLEAD_SERIES];

export function getIvSeries(slug: string): IvSeries | undefined {
  return IV_SERIES.find((s) => s.slug === slug);
}

export const ivLessonHref = (series: IvSeries, lesson: Lesson) => `/${series.slug}/${lesson.slug}`;
