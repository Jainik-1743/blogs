import type { CheatSheet } from "../types.ts";

/** Cheat sheet for the "browser" series. See scripts/SERIES-SHEETS.md. */
export const SHEET: CheatSheet | null = {
  intro:
    "What the browser does between Enter and a usable page, and the rules you need in an interview: storage, auth, CORS, caching, HTTP codes, security and speed. Always **break time down by layer** and use numbers.",
  sections: [
    {
      title: "Enter to pixels: 11 steps",
      lesson: 0,
      blocks: [
        {
          kind: "steps",
          items: [
            "**Input**: URL or search? Normalise it (add scheme, lowercase host).",
            "**Shortcuts**: HSTS, Service Worker, HTTP cache, bfcache.",
            "**DNS**: browser, OS, resolver, then root, TLD, authoritative.",
            "**TCP** handshake (1 RTT) or **QUIC** for HTTP/3.",
            "**TLS 1.3**: 1 RTT, certificate checked.",
            "**Request** with cookies, then **server work** (CDN, app, DB). Time to first byte is **TTFB**.",
            "**Parse** HTML to DOM and CSS to CSSOM. **Style, layout, paint, composite**.",
            "**After load**: hydration, lazy resources, API calls. Painted is not interactive.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Cold HTTPS over TCP is DNS + 1 RTT + 1 RTT before the first request byte. At 250 ms RTT that is 500 ms or more.",
        },
      ],
    },
    {
      title: "What skips work",
      lesson: 0,
      blocks: [
        {
          kind: "table",
          head: ["Cache", "Skips"],
          rows: [
            ["bfcache", "Everything (whole page from memory)"],
            ["Service Worker", "The network"],
            ["HTTP cache, fresh", "DNS, TCP, TLS, request, server"],
            ["HTTP cache, `304`", "Only the body download"],
            ["Connection reuse (H2/H3)", "TCP and TLS handshakes"],
            ["CDN / Redis", "Origin work / database work"],
          ],
        },
        {
          kind: "table",
          head: ["Script tag", "Blocks parsing?", "Order kept?"],
          rows: [
            ["Plain `script`", "Yes", "Yes"],
            ["`async`", "Only while running", "No"],
            ["`defer` / `type=module`", "No (runs after parse)", "Yes"],
          ],
        },
        {
          kind: "points",
          items: [
            "`dns-prefetch` looks up, `preconnect` opens DNS+TCP+TLS, `preload` fetches one file.",
            "CSS blocks rendering. Plain JS blocks parsing. HTTP/3 removes TCP head-of-line blocking.",
          ],
        },
      ],
    },
    {
      title: "Five browser stores",
      lesson: 1,
      blocks: [
        {
          kind: "table",
          head: ["Store", "Lives", "Size", "Sent to server?"],
          rows: [
            ["Cookie", "Until `Max-Age`/`Expires`", "~4 KB each", "**Yes, every request**"],
            ["`localStorage`", "Until cleared", "~5 MB", "No"],
            ["`sessionStorage`", "Until the tab closes", "~5 MB", "No"],
            ["IndexedDB", "Until cleared", "Large, async", "No"],
            ["Cache API", "Until evicted", "Large, async", "No"],
          ],
        },
        {
          kind: "points",
          items: [
            "`localStorage`: sync, strings only, shared by **every script** on the origin, `storage` event in other tabs.",
            "Storage can vanish (Safari ~7 days idle, low space). Wrap calls in `try/catch`. Keep the real copy on the server.",
            "Secrets go **nowhere** in the browser. Theme the server needs: cookie. Big or binary data: IndexedDB.",
          ],
        },
      ],
    },
    {
      title: "Cookie attributes",
      lesson: 1,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["HttpOnly", "JS cannot read it (stops theft, not use)"],
            ["Secure", "Send over HTTPS only"],
            ["SameSite", "Lax, Strict or None. `None` needs `Secure`. Set it yourself"],
            ["Domain", "Omit = exact host. Set = all subdomains (riskier)"],
            ["Path", "Convenience only, not a security wall"],
            ["__Host- prefix", "Forces `Secure`, `Path=/`, no `Domain`"],
            ["Partitioned", "Third-party cookie kept per top-level site"],
          ],
        },
        {
          kind: "code",
          lang: "http",
          code: "Set-Cookie: __Host-sid=abc; Path=/; Secure;\n  HttpOnly; SameSite=Lax; Max-Age=3600",
          note: "A good session cookie.",
        },
      ],
    },
    {
      title: "Session vs JWT and claims",
      lesson: 2,
      blocks: [
        {
          kind: "table",
          head: ["Aspect", "Server session", "JWT"],
          rows: [
            ["Data lives", "Server (Redis/DB)", "In the token"],
            ["Per request", "Store lookup", "Signature check, no I/O"],
            ["Logout / revoke", "Easy: delete record", "Hard until `exp`"],
            ["Role change", "Next request", "After expiry or refresh"],
            ["Best for", "First-party web apps", "APIs, mobile, many services"],
          ],
        },
        {
          kind: "pairs",
          rows: [
            ["iss / aud", "Issuer you expect / token is for your API"],
            ["sub", "The user"],
            ["exp / nbf / iat", "Expiry / not before / issued at (Unix seconds)"],
            ["jti", "Token ID, for a deny list"],
          ],
        },
        {
          kind: "points",
          items: [
            "Pin `algorithms` when verifying. Defeats `alg: none` and RS256-to-HS256 confusion.",
            "`decode` only reads. `verify` checks signature and claims. Treat `kid` as untrusted input.",
            "HS256 = one shared secret (verifier can forge). RS256/ES256 = private signs, public verifies (JWKS).",
            "Access token 5 to 15 min. Refresh token in HttpOnly cookie, **recorded on the server**, rotated on each use.",
            "Reused old refresh token means theft: revoke the whole family. \"Log out everywhere\": bump `tokenVersion`.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "A signed JWT (JWS) is **not encrypted**. Anyone can base64-decode the payload. Never put secrets in it.",
        },
      ],
    },
    {
      title: "XSS vs CSRF and token homes",
      lesson: 3,
      blocks: [
        {
          kind: "table",
          head: ["Where", "XSS steals it?", "CSRF?"],
          rows: [
            ["`localStorage` token", "**Yes**", "No"],
            ["Non-HttpOnly cookie", "Yes", "Yes"],
            ["HttpOnly cookie", "No, but XSS can still use it", "Yes, defend"],
            ["JS memory", "Harder", "No"],
          ],
        },
        {
          kind: "points",
          items: [
            "Strong defaults: HttpOnly session cookie; access token in memory + HttpOnly refresh cookie; or a **BFF** (no tokens in the browser).",
            "CSRF layers: `SameSite`, CSRF token, `Origin` check, `Sec-Fetch-Site`, custom header, never change data on `GET`.",
            "`Lax` fails against sibling subdomains (same site, different origin). JWT in a cookie still needs CSRF defence.",
          ],
        },
      ],
    },
    {
      title: "CORS",
      lesson: 4,
      blocks: [
        {
          kind: "points",
          items: [
            "Origin = scheme + host + port. CORS lets a server allow other origins to **read** responses. It is browser-only.",
            "Simple request: `GET`/`HEAD`/`POST` with form-type `Content-Type`. JSON, `Authorization` or `PUT`/`DELETE` trigger an `OPTIONS` preflight.",
            "With credentials: `credentials: \"include\"`, exact origin (no `*`), `Allow-Credentials: true`, `Vary: Origin`.",
          ],
        },
        {
          kind: "code",
          lang: "http",
          code: "Allow-Origin: https://app.example.com\nAllow-Methods: GET, POST, PUT\nAllow-Headers: content-type, authorization\nAllow-Credentials: true\nMax-Age: 600\nVary: Origin",
          note: "Preflight reply (204). Each name starts with Access-Control-.",
        },
        {
          kind: "callout",
          tone: "warn",
          text: "CORS is not API security and not CSRF protection. Put CORS middleware before auth, or the preflight gets `401`. A `5xx` without headers shows as a CORS error.",
        },
      ],
    },
    {
      title: "Cache-Control directives",
      lesson: 5,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["max-age=N", "Fresh for N seconds, no request"],
            ["s-maxage=N", "Shared caches only, overrides `max-age`"],
            ["no-cache", "Store, but **revalidate** before each use"],
            ["no-store", "Never store (sensitive data)"],
            ["private / public", "Browser only / any cache"],
            ["immutable", "Never changes at this URL"],
            ["stale-while-revalidate=N", "Serve old copy while refreshing"],
            ["ETag / If-None-Match", "Validator. Unchanged gives `304`, no body"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "`304` saves the download but still costs a round trip. No `Cache-Control` means guessed (heuristic) freshness.",
        },
      ],
    },
    {
      title: "Caching recipe and stale deploys",
      lesson: 5,
      blocks: [
        {
          kind: "table",
          head: ["Resource", "Header"],
          rows: [
            ["Hashed JS/CSS, `/_next/static`", "`public, max-age=31536000, immutable`"],
            ["HTML", "`no-cache`"],
            ["Public API data", "`public, s-maxage=60, stale-while-revalidate=300`"],
            ["Per-user data", "`private, no-cache` or `no-store`"],
          ],
        },
        {
          kind: "points",
          items: [
            "Stale after deploy? Check HTML `max-age`, CDN copy (`Age`, `x-cache`), unhashed names, deleted old chunks, Service Worker, API caching.",
            "Cache-bust by changing the URL (content hash). Send `Vary` for `Accept-Encoding`, `Origin`.",
          ],
        },
      ],
    },
    {
      title: "Methods and status codes",
      lesson: 6,
      blocks: [
        {
          kind: "table",
          head: ["Method", "Safe", "Idempotent"],
          rows: [
            ["`GET` / `HEAD` / `OPTIONS`", "Yes", "Yes"],
            ["`PUT` / `DELETE`", "No", "Yes"],
            ["`POST`", "No", "**No** (use an idempotency key)"],
            ["`PATCH`", "No", "Depends on the patch"],
          ],
        },
        {
          kind: "pairs",
          rows: [
            ["401", "Not logged in (send `WWW-Authenticate`)"],
            ["403", "Logged in, not allowed"],
            ["409 / 412", "State conflict / `If-Match` failed"],
            ["422 / 400", "Valid format, bad meaning / broken request"],
            ["429", "Rate limited, send `Retry-After`"],
            ["202", "Accepted, work queued"],
            ["502 / 503 / 504", "Bad upstream / overloaded / upstream timeout"],
          ],
        },
      ],
    },
    {
      title: "Redirects",
      lesson: 6,
      blocks: [
        {
          kind: "table",
          head: ["Code", "Permanent?", "Method kept?"],
          rows: [
            ["301", "Yes (cached)", "May become `GET`"],
            ["302", "No", "May become `GET`"],
            ["303", "No", "Always `GET`"],
            ["307", "No", "**Kept**"],
            ["308", "Yes (cached)", "**Kept**"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "After a form `POST` use `303` (Post/Redirect/Get). Moved `POST` API: `307` or `308`. Unsure it is permanent: use `302`/`307`.",
        },
      ],
    },
    {
      title: "Frontend security and headers",
      lesson: 7,
      blocks: [
        {
          kind: "points",
          items: [
            "React escapes `{value}`. Sinks: `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `javascript:` in `href`, `postMessage` without `event.origin`.",
            "Sanitise HTML with an **allow-list** (DOMPurify). Allow only `http:`/`https:` URLs.",
            "Authorization lives on the server. Hiding a button is not security.",
            "Supply chain: lockfile + `npm ci`, audit in CI, few deps, no install scripts, SRI on third-party files.",
          ],
        },
        {
          kind: "pairs",
          rows: [
            ["Strict-Transport-Security", "HTTPS only for a set time (HSTS)"],
            ["X-Content-Type-Options: nosniff", "No MIME guessing"],
            ["Referrer-Policy", "`strict-origin-when-cross-origin`"],
            ["Permissions-Policy", "Switch off camera, mic, geolocation"],
            ["frame-ancestors / X-Frame-Options", "Stops clickjacking"],
            ["COOP / COEP", "Isolate the page (`SharedArrayBuffer`)"],
          ],
        },
        {
          kind: "code",
          lang: "http",
          code: "Content-Security-Policy: default-src 'self';\n  script-src 'nonce-R4ND0M'\n    'strict-dynamic';\n  object-src 'none'; base-uri 'none';\n  frame-ancestors 'none'",
          note: "Start with Content-Security-Policy-Report-Only.",
        },
      ],
    },
    {
      title: "Rendering and the event loop",
      lesson: 8,
      blocks: [
        {
          kind: "points",
          items: [
            "One main thread runs JS and rendering. Frame budget **16.7 ms** (60 Hz). Long task: over **50 ms**.",
            "Loop: one task, then **all microtasks**, then rAF callbacks, then style, layout, paint.",
            "Animate `transform` and `opacity` (composite only), not `top`, `width`, `height` (layout).",
            "Layout thrashing: read (`offsetHeight`), write, read... Batch reads first, then writes, in rAF.",
            "Use `{ passive: true }`, `IntersectionObserver`, `scheduler.yield()`, Web Workers, `content-visibility: auto`.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Order: sync code, promise/microtask, timeout. A long microtask chain starves rendering. Debug in the Performance panel with 4x CPU throttle.",
        },
      ],
    },
    {
      title: "Core Web Vitals",
      lesson: 9,
      blocks: [
        {
          kind: "table",
          head: ["Metric", "Good", "Poor"],
          rows: [
            ["LCP (loading)", "≤ 2.5 s", "> 4 s"],
            ["INP (response)", "≤ 200 ms", "> 500 ms"],
            ["CLS (stability)", "≤ 0.1", "> 0.25"],
          ],
        },
        {
          kind: "points",
          items: [
            "Judged at the **75th percentile** of real users, mobile and desktop apart.",
            "LCP = TTFB + load delay + load duration + render delay. Hero: img tag, `fetchpriority=\"high\"`, `srcset`, never lazy.",
            "INP = input delay + processing + presentation. CLS fix: set `width`/`height` or `aspect-ratio`, reserve ad slots.",
            "Field data (CrUX, `web-vitals`) says what users feel. Lab (Lighthouse) reproduces. INP replaced FID in March 2024.",
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
            ["`no-cache` vs `no-store`?", "Revalidate before use vs never store."],
            ["Does HttpOnly stop XSS?", "No. It stops cookie theft, not use of the session."],
            ["Is CORS a firewall?", "No. Browser-only; it blocks reading the response, not the request."],
            ["401 vs 403?", "Not logged in vs logged in but not allowed."],
            ["JWT logout?", "Drop client token, revoke refresh token, short `exp`, deny list or version."],
            ["Why INP over FID?", "It covers all interactions and the full delay."],
            ["Why does the Postman call work?", "Postman does not enforce CORS."],
          ],
        },
      ],
    },
  ],
};
