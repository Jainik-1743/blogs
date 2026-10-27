import type { CheatSheet } from "../types.ts";

/** Cheat sheet for the "nextjs" series. See scripts/SERIES-SHEETS.md. */
export const SHEET: CheatSheet | null = {
  intro:
    "The Next.js 16 App Router on one page: routing, Server and Client Components, caching, Server Actions, route handlers, auth, rendering modes, SEO, config and deployment. Check every tutorial's version: 16 changed several APIs.",
  sections: [
    {
      title: "Routing and special files",
      lesson: 0,
      blocks: [
        {
          kind: "points",
          items: [
            "Each folder in `app/` is a URL segment. It is public only with a `page` (or `route`) file. `(group)` adds no URL part. `_private` is skipped.",
            "`[slug]` one segment. `[...parts]` one or more. `[[...rest]]` zero or more.",
            "`params` and `searchParams` are **Promises**: `const { slug } = await props.params`.",
            "`generateStaticParams` builds known values (`●`). `dynamicParams = false` makes the rest 404.",
            "Use the Link component for internal links (no reload, prefetch, layout state kept). A plain anchor reloads the page.",
          ],
        },
        {
          kind: "pairs",
          rows: [
            ["layout.tsx", "Wraps pages, stays mounted, keeps state"],
            ["template.tsx", "Like layout, new instance per navigation"],
            ["loading.tsx", "Suspense fallback for the whole page"],
            ["error.tsx", "Error boundary: must be `'use client'`"],
            ["not-found.tsx", "404 screen, also for `notFound()`"],
            ["route.ts", "HTTP endpoint. Never beside `page.tsx`"],
            ["proxy.ts", "Runs before requests (was `middleware.ts`)"],
          ],
        },
      ],
    },
    {
      title: "Server and Client Components",
      lesson: 1,
      blocks: [
        {
          kind: "table",
          head: ["Aspect", "Server Component", "Client Component"],
          rows: [
            ["Default", "Yes", "Needs `'use client'`"],
            ["Can use", "`async`, DB, secrets", "State, effects, handlers, `window`"],
            ["Code sent to browser", "No", "Yes"],
            ["Rendered on server", "Yes", "Yes, then hydrated"],
          ],
        },
        {
          kind: "points",
          items: [
            "`'use client'` marks a boundary: the file and its imports ship. Keep it on small interactive leaves, never on a page or layout.",
            "A Server Component goes inside a Client one only as `children` or a prop, never by import.",
            "Props crossing the boundary: plain data, `Date`, `Map`, `Set`, `bigint` work. Functions and class instances give a 500.",
            "Stream a promise: start it on the server, pass it down, read it with `use` inside Suspense.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Props are public (the RSC payload is in the page). Never pass a whole DB row: send a DTO. Add `import 'server-only'` to server files.",
        },
      ],
    },
    {
      title: "Fetching and request memoization",
      lesson: 2,
      blocks: [
        {
          kind: "points",
          items: [
            "Fetch in an `async` Server Component. No effect, no loading state, secrets stay on the server.",
            "Identical `fetch` calls in one render run once (memoization, one render only). Wrap DB reads in React `cache()`.",
            "Independent requests: `Promise.all` or one Suspense box each. Sequential awaits took 1.5 s, parallel 0.5 s.",
            "Do not fetch your own route handler from a Server Component. Share a function.",
          ],
        },
        {
          kind: "table",
          head: ["Default model", "Result"],
          rows: [
            ["`fetch(url)`, no request data", "Prerendered at build, then frozen"],
            ["`cache: 'no-store'`", "Dynamic (`ƒ`)"],
            ["`next: { revalidate: 60 }`", "Stale-while-revalidate"],
            ["`cookies()` / `headers()` / `searchParams`", "Dynamic"],
          ],
        },
      ],
    },
    {
      title: "Cache Components (use cache)",
      lesson: 2,
      blocks: [
        {
          kind: "code",
          lang: "ts",
          code: "// next.config.ts\nconst nextConfig = {\n  cacheComponents: true };\n\nasync function getPosts() {\n  \"use cache\";\n  cacheLife(\"hours\");\n  cacheTag(\"posts\");\n  return db.posts.findMany();\n}",
          note: "Everything is dynamic until you cache it. Arguments form the cache key.",
        },
        {
          kind: "table",
          head: ["cacheLife", "Meaning"],
          rows: [
            ["`stale`", "Browser reuses its copy without asking (default 5 min)"],
            ["`revalidate`", "Server refreshes in background after this"],
            ["`expire`", "After this, next request waits for fresh data"],
          ],
        },
        {
          kind: "points",
          items: [
            "Uncached or runtime data outside Suspense **fails the build**: stream it, cache it, or block on purpose.",
            "`cookies()` inside `use cache` fails: read outside, pass as an argument. `Date.now()` needs `connection()` or caching.",
            "`dynamic` and `revalidate` exports are build errors when `cacheComponents` is on.",
          ],
        },
      ],
    },
    {
      title: "Revalidation and cache layers",
      lesson: 2,
      blocks: [
        {
          kind: "table",
          head: ["Function", "Behaviour", "Where"],
          rows: [
            ["`revalidateTag(tag, 'max')`", "Stale-while-revalidate", "Actions, handlers"],
            ["`updateTag(tag)`", "Expire now, read your writes", "Server Actions only"],
            ["`revalidatePath(p)`", "Invalidate a route", "Actions, handlers"],
            ["`refresh()`", "Re-render current route, cache untouched", "Server Actions"],
          ],
        },
        {
          kind: "points",
          items: [
            "Layers: request memoization (one render), `use cache` (server), prerendered output (build or CDN), router cache (browser, 5 min).",
            "One-argument `revalidateTag('x')` is deprecated. Test caching with `build` + `start`, never `dev`.",
            "Default `use cache` store is in memory: serverless instances do not share it.",
          ],
        },
      ],
    },
    {
      title: "Server Actions",
      lesson: 3,
      blocks: [
        {
          kind: "code",
          lang: "ts",
          code: "\"use server\";\nexport async function addTodo(_p, fd) {\n  const u = await verifySession();\n  const r = Schema.safeParse(\n    { t: fd.get(\"t\") });\n  if (!r.success)\n    return { errors: r.error.flatten() };\n  await db.todo.create(\n    { ...r.data, owner: u.id });\n  updateTag(\"todos\"); // before redirect\n  return { ok: true };\n}",
          note: "Use with `useActionState`. Return expected errors, throw unexpected ones.",
        },
        {
          kind: "points",
          items: [
            "Works with JavaScript off (plain POST). With JS it is one fetch round trip that also returns the fresh page.",
            "An action is a **public POST endpoint**: authenticate, authorize the row (IDOR), validate, in every action. Hidden button is not security.",
            "Next.js checks `Origin` vs host, caps the body at 1 MB, hides action ids. `curl` skips the origin check.",
            "`redirect()` throws: never inside `try/catch`. Revalidate before it. Actions run one at a time.",
            "Extra argument: `action.bind(null, id)`. Treat it as client input.",
          ],
        },
      ],
    },
    {
      title: "Route Handlers",
      lesson: 4,
      blocks: [
        {
          kind: "points",
          items: [
            "`route.ts` exports `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`. A missing method gives `405`.",
            "In the default model `GET` handlers are dynamic. Cache with `dynamic = 'force-static'` or `revalidate`. Only `GET` caches.",
            "Validate query, body (`400` bad JSON, `422` bad fields), headers. Use `201`, `204`, `404`. Keep one error shape.",
            "Webhooks: HMAC the **raw body**, compare with `timingSafeEqual`, then parse.",
            "CORS is a browser rule, not a firewall. Allow-list the origin, send `Vary: Origin`.",
            "Auth, validation and rate limiting inside every handler.",
          ],
        },
        {
          kind: "table",
          head: ["You need…", "Use"],
          rows: [
            ["Render a page's data", "Server Component"],
            ["Mutation from your UI", "Server Action"],
            ["Public URL (mobile, webhook, partner)", "Route Handler"],
            ["Redirect or rewrite by cookie or header", "Proxy"],
            ["Fixed redirects, rewrites, headers", "`next.config.ts`"],
          ],
        },
      ],
    },
    {
      title: "Proxy",
      lesson: 4,
      blocks: [
        {
          kind: "points",
          items: [
            "`proxy.ts` (renamed from `middleware.ts`) can redirect, rewrite, set headers. One file per project.",
            "Always set a `matcher`, or it also runs on `_next/static`, images and `public/`.",
            "`NextResponse.next({ request: { headers } })` changes what the app receives. `response.headers.set` changes what the client gets.",
            "Not for slow work, DB calls or `fetch` caching. Config redirects run before Proxy.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Proxy is an optimistic filter, not a lock. A client can forge any header Proxy does not overwrite (an excluded route let `x-user-hint: admin` through).",
        },
      ],
    },
    {
      title: "Auth: three jobs, five places",
      lesson: 5,
      blocks: [
        {
          kind: "points",
          items: [
            "**Authentication** proves who. **Session** remembers it (cookie). **Authorization** decides what they may do.",
            "Session cookie set on the server: `httpOnly`, `secure`, `sameSite`, expiry. `await cookies()`. A signed token is readable, so keep secrets out.",
            "Pin the algorithm (`algorithms: ['HS256']`) when verifying. Bad token gives `null`.",
            "Hash passwords with a slow hash (bcrypt). Give one vague login error.",
          ],
        },
        {
          kind: "table",
          head: ["Place", "Verdict"],
          rows: [
            ["Data Access Layer (`server-only`, `cache()`)", "The real check, near the data, return DTOs"],
            ["`proxy.ts`", "Quick redirect only"],
            ["`layout.tsx`", "**Skipped on client navigation**"],
            ["Server Action, Route Handler", "Each needs its own check"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Stateless cookie: cannot revoke early. Database session: instant logout and role change. Wrong owner: `403`, or `404` to hide it exists.",
        },
      ],
    },
    {
      title: "Static, ISR, streaming, PPR",
      lesson: 6,
      blocks: [
        {
          kind: "table",
          head: ["Symbol", "Meaning"],
          rows: [
            ["`○` Static", "Built once, `s-maxage=31536000`"],
            ["`●` SSG", "Static with `generateStaticParams`"],
            ["`ƒ` Dynamic", "Per request, `private, no-store`"],
            ["`◐` Partial Prerender", "Static shell plus streamed parts (Cache Components)"],
          ],
        },
        {
          kind: "points",
          items: [
            "Static pages are frozen: `new Date()` shows build time. `revalidate = 5` means stale after 5 s, next visit rebuilds (`x-nextjs-cache`: HIT, STALE, MISS).",
            "Streaming: shell first, each Suspense box when ready, siblings in parallel. Prefer small boundaries. Do not `await` request data at the top of a layout.",
            "**Status code is fixed after the first chunk**: `notFound()` inside Suspense gives `200` plus `noindex`. Decide 404 and redirects before the boundary.",
          ],
        },
      ],
    },
    {
      title: "Metadata, SEO, images, fonts",
      lesson: 7,
      blocks: [
        {
          kind: "points",
          items: [
            "Export `metadata` or `generateMetadata` (Server Component). `viewport` is separate. Set `metadataBase` once, or social images point at localhost.",
            "Metadata merges **shallowly**: a page's `openGraph` replaces the layout's. Share data with `cache()`.",
            "Bots wait for the title in the head: keep `generateMetadata` fast.",
            "`opengraph-image.tsx`, `sitemap.ts`, `robots.ts` make real files. `Disallow` is not `noindex` and not security.",
            "`next/image`: set `width`/`height` (no shift), AVIF/WebP, `remotePatterns`. `priority` is deprecated: use `preload` or `fetchPriority`.",
            "`next/font` self-hosts and adds a size-matched fallback.",
          ],
        },
      ],
    },
    {
      title: "Env vars, config, deployment",
      lesson: 8,
      blocks: [
        {
          kind: "steps",
          items: [
            "Env load order: real environment, `.env.$(NODE_ENV).local`, `.env.local`, `.env.$(NODE_ENV)`, `.env`.",
            "Server variables stay on the server. `NEXT_PUBLIC_` values are **inlined at build time**; `docker run -e` cannot change them.",
            "Static pages read env at build. Dynamic routes read it per request.",
            "`output: 'standalone'`: run `node server.js`, copy `public` and `.next/static` yourself (402 MB to 67 MB).",
            "Docker: multi-stage, non-root user, `HOSTNAME=0.0.0.0`, `ARG` for public values.",
            "`instrumentation.ts`: `register()` once, `onRequestError` for errors. Add a cheap dynamic health route.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Several instances need a shared cache handler, the same `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` and a deployment ID. Proxies that buffer break streaming (`X-Accel-Buffering: no`).",
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
            ["Does `'use client'` mean browser only?", "No. Also rendered on the server, then hydrated."],
            ["Is `fetch` cached in 16?", "No, but a page with no request data is frozen at build."],
            ["Layout auth check enough?", "No. Layouts skip on client navigation."],
            ["Server Action secure if button hidden?", "No. Public POST endpoint."],
            ["Why old price in prod, fine in dev?", "Static page frozen at build. Dev renders on demand."],
            ["`redirect()` in try/catch?", "It throws; the catch swallows it."],
            ["`NEXT_PUBLIC_` wrong in prod?", "Frozen at build time, not run time."],
            ["`getServerSideProps` replacement?", "Server Component on a dynamic route."],
          ],
        },
      ],
    },
  ],
};
