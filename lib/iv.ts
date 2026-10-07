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
const WRITTEN: Record<string, number> = { browser: 10, backend: 12, debugging: 10, "design-problems": 0, "frontend-depth": 0 };

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
    "Everything that happens between the address bar and your React tree, and the security trade-offs interviewers love to probe: storage, sessions vs JWT, XSS and CSRF, CORS, HTTP caching, status codes, rendering and Core Web Vitals.",
  started: "2026",
  accent: "rose",
  lessons: lessons([
    ["What Happens When You Type a URL (The Senior Version)", "DNS, TCP, TLS, HTTP, then parsing, rendering and first paint: the full journey from the Enter key to pixels, with the caches that skip almost every step. Every other lesson in this series fits somewhere on this map.", "18 min", ["browser", "networking", "rendering", "interview"]],
    ["Storage in the Browser: Cookies, localStorage, sessionStorage and IndexedDB", "Scope, lifetime, size, and who can read each one: the tab, the origin, the server or JavaScript. Ends with a decision table for “where does this data belong?”", "15 min", ["cookies", "storage", "security"]],
    ["Sessions vs JWT: Stateful vs Stateless Auth Without the Hype", "What a signed JWT really is, how it differs from an opaque session ID, and where “stateless” stops helping: revocation, expiry, refresh tokens and the claims you must validate.", "20 min", ["auth", "jwt", "sessions"]],
    ["Where Do Tokens Live? XSS, CSRF and the Storage Trade-off", "localStorage exposes tokens to XSS; cookies expose you to CSRF. The patterns that hold up: HttpOnly cookies with SameSite or CSRF tokens, in-memory access tokens and the backend-for-frontend pattern.", "18 min", ["auth", "xss", "csrf", "security"]],
    ["CORS Demystified: Same-Origin Policy, Preflights and Credentials", "Why CORS is a browser protection and not a server firewall, what triggers a preflight, and why a wildcard origin cannot be combined with credentials.", "15 min", ["cors", "http", "security"]],
    ["HTTP Caching: Cache-Control, ETags and the CDN in Between", "Freshness vs validation, no-cache vs no-store, immutable for hashed assets, stale-while-revalidate, and what a shared cache must never store.", "20 min", ["caching", "http", "cdn", "performance"]],
    ["HTTP Semantics Interviewers Ask: Methods, Idempotency, Status Codes, Redirects", "Safe vs idempotent methods, 401 vs 403, 409, 422 and 429, and the 301/302/307/308 matrix, all grounded in the HTTP specification.", "15 min", ["http", "rest", "status-codes"]],
    ["Frontend Security Checklist: XSS, CSP, Clickjacking and Supply Chain", "dangerouslySetInnerHTML, CSP nonces, frame-ancestors, Subresource Integrity and dependency risk, each framed as “what would you check in a code review?”", "18 min", ["security", "xss", "csp"]],
    ["Browser Rendering and the Event Loop in Practice", "Parse, style, layout, paint, composite, plus layout thrashing and where tasks, microtasks and requestAnimationFrame fit.", "18 min", ["rendering", "event-loop", "performance"]],
    ["Core Web Vitals for Engineers: LCP, INP and CLS", "What each metric measures, its “good” threshold at the 75th percentile, why INP replaced FID, and the difference between field data and lab data.", "18 min", ["performance", "web-vitals", "seo"]],
  ], WRITTEN["browser"]),
};

export const BACKEND_SERIES: IvSeries = {
  slug: "backend",
  title: "Backend in Depth: Designing an API You'd Put in Production",
  short: "Backend in Depth",
  tagline:
    "From folder structure to N+1 queries: the decisions a senior full-stack engineer is expected to defend. Clean code, layered architecture, REST design, validation, error handling, logging, auth, databases, Prisma, GraphQL, Node performance and testing.",
  started: "2026",
  accent: "teal",
  lessons: lessons([
    ["Clean Code for Backends: Naming, Small Functions and Boundaries", "The few clean-code rules that change backend code reviews: pure domain logic, explicit dependencies, no hidden I/O, and when not to abstract.", "15 min", ["clean-code", "solid", "design"]],
    ["API Folder Structure: Routes, Controllers, Services, Repositories", "Layered folders versus structuring by business component, what belongs in each layer, and why the request object should never reach your service layer.", "20 min", ["architecture", "express", "structure"]],
    ["REST API Design Best Practices: Resources, Versioning, Status Codes", "Nouns instead of verbs, a consistent error format, versioning strategies, idempotency keys for POST and partial updates.", "18 min", ["rest", "api-design", "http"]],
    ["Validation at the Edge: Schemas, DTOs and Trusting Nothing", "Validate input where it enters the API, share schemas with the frontend, and keep validation errors separate from business-rule errors.", "15 min", ["validation", "security", "typescript"]],
    ["Error Handling That Doesn't Lie: Operational vs Programmer Errors", "Centralised error middleware, typed error classes, how Express 5 handles rejected promises, and when to let the process crash and restart.", "18 min", ["errors", "express", "node"]],
    ["Logging and Observability: Structured Logs, Correlation IDs, Metrics", "JSON logs, log levels, request IDs carried through every service, and what you must never log.", "15 min", ["logging", "observability", "operations"]],
    ["Authentication and Authorization on the Server", "Password hashing, session stores, verifying JWTs properly, role-based vs attribute-based access control and checking ownership on every resource.", "18 min", ["auth", "security", "rbac"]],
    ["Database Fundamentals for API Engineers: Indexes, Transactions, Isolation", "B-tree indexes, reading EXPLAIN ANALYZE, transactions and isolation levels, and the race conditions they prevent such as overselling.", "20 min", ["postgres", "sql", "indexes", "transactions"]],
    ["Prisma in Production: N+1, include, Batching and Connection Pools", "How N+1 appears in loops and GraphQL resolvers, how Prisma batches findUnique, relation load strategies and sharing a single client.", "18 min", ["prisma", "orm", "performance"]],
    ["REST vs GraphQL (vs Hasura): Choosing, Not Preaching", "Over- and under-fetching, how caching differs, schema evolution, query-cost limits and where an auto-generated API fits.", "18 min", ["graphql", "rest", "hasura"]],
    ["Node.js Performance Basics: Event Loop Blocking, Streams, Workers", "Why one CPU-heavy transform can stall every request, plus streams for large payloads and worker threads.", "15 min", ["node", "performance", "streams"]],
    ["Testing an API: Unit, Integration and Contract", "Where to put testing effort in a backend, testing against a real database, and contract tests between the frontend and the API.", "15 min", ["testing", "node", "quality"]],
  ], WRITTEN["backend"]),
};

export const DEBUGGING_SERIES: IvSeries = {
  slug: "debugging",
  title: "Scenario Debugging: The “It's Slow, Fix It” Playbook",
  short: "Scenario Debugging",
  tagline:
    "Logical and scenario questions answered with one repeatable method: measure, isolate, fix, verify. API fast but UI slow, UI fast but API slow, re-renders, memory leaks, duplicate requests, slow first loads, huge lists and layout shift.",
  started: "2026",
  accent: "amber",
  lessons: lessons([
    ["The Debugging Method: Measure, Isolate, Hypothesize, Verify", "The framework every answer in this series reuses: which DevTools panel or server metric answers which question, and how to talk through trade-offs out loud.", "12 min", ["method", "performance", "interview"]],
    ["“The API Is Fast but the UI Is Slow”: How to Solve It", "The network tab says 80 ms but users wait two seconds. Long main-thread tasks, oversized JSON, re-render storms, layout thrashing and hydration cost, framed around INP.", "20 min", ["frontend", "inp", "react", "scenario"]],
    ["“The UI Is Fast but the API Takes Too Long”: How to Solve It", "Trace the request: DNS and TLS, cold starts, N+1 queries, missing indexes, slow downstream calls, payload size and missing caching, then the UX fixes while the backend is repaired.", "20 min", ["backend", "latency", "caching", "scenario"]],
    ["Unnecessary Re-renders: Finding and Fixing Them", "The React Profiler, context updates that re-render every consumer, unstable props, using memo deliberately rather than everywhere, and where the React Compiler changes the advice.", "18 min", ["react", "performance", "profiler"]],
    ["Memory Leaks in Single-Page Apps", "Intervals and listeners never cleared, detached DOM nodes, closures holding large objects and caches that only grow, plus how to confirm a leak with heap snapshots.", "15 min", ["memory", "react", "devtools"]],
    ["Duplicate Requests, Race Conditions and Stale Responses", "Strict Mode running effects twice, double-click submits, out-of-order responses, AbortController, request deduplication and idempotency keys on the server.", "15 min", ["react", "fetch", "race-conditions"]],
    ["Slow First Load: Bundles, Code Splitting and LCP", "Bundle analysis, route-level code splitting, image optimisation, font loading, preload and preconnect, and Server Components with streaming.", "18 min", ["bundle", "lcp", "nextjs"]],
    ["Rendering 10,000 Rows: Virtualization, Pagination and Web Workers", "Windowing, content-visibility, rendering in chunks, and moving sort and filter work off the main thread.", "15 min", ["lists", "virtualization", "performance"]],
    ["Layout Shift and Janky Interactions", "Layout shift from images, ads and late-loading fonts, plus input lag from heavy event handlers, ending with a short checklist.", "12 min", ["cls", "inp", "css"]],
    ["Scenario Lightning Round: 15 Questions, 15 Structured Answers", "CORS failing only in production, random logouts, 429s triggered by your own frontend, a growing server memory and more, each answered as diagnose, fix, prevent.", "25 min", ["scenario", "interview", "cheat-sheet"]],
  ], WRITTEN["debugging"]),
};

export const DESIGN_SERIES: IvSeries = {
  slug: "design-problems",
  title: "Practical Design Problems: From Whiteboard to Working Code",
  short: "Practical Design Problems",
  tagline:
    "Low-level, practical design problems with the details interviewers listen for: IDs, collisions, caching, headers and failure modes. A URL shortener, a rate limiter, pagination, file upload, notifications, autocomplete and classic mini-designs.",
  started: "2026",
  accent: "indigo",
  lessons: lessons([
    ["How to Run a Practical Design Interview", "Requirements, API, data model, core algorithm, scale and failure, trade-offs: a repeatable frame for every design question that follows.", "10 min", ["method", "interview"]],
    ["Design a URL Shortener (Long URL to Short URL)", "ID generation, Base62, collisions, caching for read-heavy traffic, 301 vs 302 and analytics, custom aliases, expiry and abuse prevention.", "25 min", ["design", "url-shortener", "base62", "caching"]],
    ["Design a Rate Limiter", "Token bucket, leaky bucket, fixed and sliding windows, where to enforce limits, 429 with Retry-After and the emerging RateLimit headers.", "22 min", ["design", "rate-limiting", "redis"]],
    ["Design Pagination: Offset vs Cursor (Keyset)", "Why a large OFFSET is slow, how keyset pagination works with a stable sort and a tiebreaker, opaque cursors and GraphQL connections.", "18 min", ["design", "pagination", "sql"]],
    ["Design File Upload (Including Large Files)", "Multipart uploads vs presigned URLs, chunked and resumable uploads, progress UI, validation and why the API server should not proxy gigabytes.", "20 min", ["design", "uploads", "s3", "security"]],
    ["Design a Notification System (In-App, Push, Email)", "Polling vs long polling vs server-sent events vs WebSockets, fan-out through queues, read state, preferences, retries and dedupe.", "20 min", ["design", "notifications", "websockets", "queues"]],
    ["Design Autocomplete / Typeahead (Frontend System Design)", "Debouncing, caching results per query, cancelling stale requests, keyboard accessibility and a trie on the backend.", "18 min", ["design", "frontend", "autocomplete"]],
    ["Design an LRU Cache, Idempotent Payments and Other Classic Mini-Problems", "Short worked designs: an LRU cache, idempotency keys, a job queue with retries and backoff, and feature flags.", "20 min", ["design", "lru", "idempotency", "retries"]],
  ], WRITTEN["design-problems"]),
};

export const FRONTEND_SERIES: IvSeries = {
  slug: "frontend-depth",
  title: "Senior Frontend Depth: React Internals, TypeScript & Testing",
  short: "Senior Frontend Depth",
  tagline:
    "High-frequency topics the established question banks stress: how React really renders, hooks in depth, concurrent React and Server Components, state-management decisions, advanced TypeScript, testing strategy and accessibility.",
  started: "2026",
  accent: "lime",
  lessons: lessons([
    ["React Rendering Model: Render, Commit, Reconciliation and Keys", "What “render” really means, how React decides what changed between renders, why keys matter and how batching works.", "18 min", ["react", "reconciliation", "keys"]],
    ["Hooks in Depth: Effects, Refs and the Rules", "Effect dependencies, stale closures, useRef vs state, useLayoutEffect and the thinking behind “You Might Not Need an Effect”.", "18 min", ["react", "hooks", "effects"]],
    ["Concurrent React, Suspense and Server Components in Next.js", "Transitions, Suspense boundaries, streaming SSR, hydration errors and the boundary between server and client components.", "20 min", ["react", "nextjs", "suspense", "rsc"]],
    ["State Management Decisions: Local, Context, Server Cache, Global Store", "How to classify state (UI, server, URL, form) and pick a tool for each kind instead of debating libraries.", "15 min", ["react", "state", "architecture"]],
    ["Advanced TypeScript for Interviews: Generics, Narrowing, Utility and Conditional Types", "Generic constraints, discriminated unions, infer, mapped types, satisfies, and keeping API response types correct from server to UI.", "20 min", ["typescript", "generics", "types"]],
    ["Frontend Testing Strategy: Unit, Integration, E2E and What to Skip", "Test behaviour rather than implementation, mock the network rather than modules, and keep end-to-end tests for critical flows only.", "15 min", ["testing", "react", "quality"]],
    ["Accessibility Essentials Interviewers Check", "Semantic HTML first, focus management in modals, ARIA only when needed and testing with the keyboard.", "12 min", ["accessibility", "html", "aria"]],
  ], WRITTEN["frontend-depth"]),
};

export const IV_SERIES: IvSeries[] = [BROWSER_SERIES, BACKEND_SERIES, DEBUGGING_SERIES, DESIGN_SERIES, FRONTEND_SERIES];

export function getIvSeries(slug: string): IvSeries | undefined {
  return IV_SERIES.find((s) => s.slug === slug);
}

export const ivLessonHref = (series: IvSeries, lesson: Lesson) => `/${series.slug}/${lesson.slug}`;
