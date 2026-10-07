import type { GlossaryEntry } from "./glossary";

/** Terms per interview series (key = series slug). Filled in alongside the lessons. */
export const IV_TERMS: Record<string, GlossaryEntry[]> = {
  browser: [
    // ── Network ────────────────────────────────────────────────────────────
    { term: "DNS", full: "Domain Name System", desc: "The internet's phone book: turns a name like react.dev into an IP address. Answers are cached according to a TTL.", lesson: 0, group: "Network" },
    { term: "TCP", full: "Transmission Control Protocol", desc: "The reliable, ordered connection underneath HTTP/1.1 and HTTP/2. Opening one costs a three-way handshake, one round trip.", lesson: 0, group: "Network" },
    { term: "QUIC", full: "QUIC", desc: "The UDP-based transport under HTTP/3. It merges the transport and TLS handshakes and avoids TCP's head-of-line blocking.", lesson: 0, group: "Network" },
    { term: "TLS", full: "Transport Layer Security", desc: "The encryption layer behind HTTPS. The browser checks the server's certificate and both sides agree on session keys.", lesson: 0, group: "Network" },
    { term: "RTT", full: "Round-trip time", desc: "How long a packet takes to reach the server and come back. Every handshake costs at least one RTT, which is why distance matters.", lesson: 0, group: "Network" },
    { term: "TTL", full: "Time to live", desc: "How long a DNS answer may be cached before it must be looked up again.", lesson: 0, group: "Network" },
    { term: "CDN", full: "Content Delivery Network", desc: "Servers around the world that keep copies of your files close to users, cutting distance and load on your origin.", lesson: 5, group: "Network" },
    { term: "HSTS", full: "HTTP Strict Transport Security", desc: "A header telling the browser to use HTTPS only for this site, so it never sends an insecure first request.", lesson: 0, group: "Network" },
    { term: "bfcache", full: "Back/forward cache", desc: "Lets the browser restore an entire page, JavaScript state included, from memory when you press Back or Forward.", lesson: 0, group: "Network" },
    // ── HTTP ───────────────────────────────────────────────────────────────
    { term: "CORS", full: "Cross-Origin Resource Sharing", desc: "Headers with which a server lets other origins read its responses. Enforced by browsers only; it is not a firewall.", lesson: 4, group: "HTTP" },
    { term: "preflight", aliases: ["Preflight"], full: "CORS preflight", desc: "An OPTIONS request the browser sends first to ask whether a cross-origin request with a given method or headers is allowed.", lesson: 4, group: "HTTP" },
    { term: "ETag", full: "Entity tag", desc: "A fingerprint of a response. The browser sends it back in If-None-Match so the server can answer 304 Not Modified instead of resending the body.", lesson: 5, group: "HTTP" },
    { term: "idempotent", aliases: ["Idempotent", "idempotency"], full: "Idempotent", desc: "Doing it once or many times leaves the server in the same state, so it is safe to retry. PUT and DELETE are; POST is not.", lesson: 6, group: "HTTP" },
    { term: "Origin", full: "Origin", desc: "Scheme + host + port. Two URLs are same-origin only if all three match; the same-origin policy is built on it.", lesson: 4, group: "HTTP" },
    { term: "TTFB", full: "Time to First Byte", desc: "Time from sending the request to receiving the first byte of the response: network time plus all server work.", lesson: 0, group: "HTTP" },
    // ── Storage and auth ───────────────────────────────────────────────────
    { term: "HttpOnly", full: "HttpOnly cookie attribute", desc: "Hides the cookie from JavaScript, so an XSS payload cannot read it. It cannot stop the payload from using the session.", lesson: 1, group: "Storage and auth" },
    { term: "SameSite", full: "SameSite cookie attribute", desc: "Strict, Lax or None: whether the cookie is sent on cross-site requests. The main built-in CSRF defence.", lesson: 1, group: "Storage and auth" },
    { term: "IndexedDB", full: "IndexedDB", desc: "An asynchronous, transactional database in the browser for large or structured data, usable from workers.", lesson: 1, group: "Storage and auth" },
    { term: "JWT", full: "JSON Web Token", desc: "A signed token of three base64url parts (header.payload.signature). Readable by anyone who holds it; the signature proves it was not altered.", lesson: 2, group: "Storage and auth" },
    { term: "JWKS", full: "JSON Web Key Set", desc: "A published list of public keys that services use to verify tokens signed with a private key.", lesson: 2, group: "Storage and auth" },
    { term: "refresh token", aliases: ["Refresh token", "refresh tokens"], full: "Refresh token", desc: "A longer-lived credential used only to get new short-lived access tokens, ideally rotated on every use.", lesson: 2, group: "Storage and auth" },
    { term: "BFF", full: "Backend for Frontend", desc: "A server you own between the browser and downstream APIs. It holds the tokens so the browser only ever has a session cookie.", lesson: 3, group: "Storage and auth" },
    // ── Security ───────────────────────────────────────────────────────────
    { term: "XSS", full: "Cross-Site Scripting", desc: "An attacker gets their JavaScript to run on your origin, so it can read storage and act as the user.", lesson: 3, group: "Security" },
    { term: "CSRF", full: "Cross-Site Request Forgery", desc: "Another site makes the victim's browser send a request to yours, and the browser attaches the cookies automatically.", lesson: 3, group: "Security" },
    { term: "CSP", full: "Content Security Policy", desc: "A response header listing which sources of scripts, styles and frames the browser may use. A backstop if escaping fails.", lesson: 7, group: "Security" },
    { term: "SRI", full: "Subresource Integrity", desc: "An integrity hash on a script or stylesheet tag. The browser refuses the file if its content does not match.", lesson: 7, group: "Security" },
    { term: "nonce", aliases: ["Nonce"], full: "Nonce", desc: "A random one-time value generated per response and used to mark which inline scripts a CSP allows.", lesson: 7, group: "Security" },
    { term: "clickjacking", aliases: ["Clickjacking"], full: "Clickjacking", desc: "Framing your site invisibly on another page to trick users into clicking your buttons. Stopped by frame-ancestors.", lesson: 7, group: "Security" },
    // ── Rendering and performance ──────────────────────────────────────────
    { term: "DOM", full: "Document Object Model", desc: "The tree of elements the browser builds from your HTML. JavaScript reads and changes the page through it.", lesson: 0, group: "Rendering and performance" },
    { term: "CSSOM", full: "CSS Object Model", desc: "The browser's tree of styles. Painting waits for it, which is why CSS blocks rendering.", lesson: 0, group: "Rendering and performance" },
    { term: "hydration", aliases: ["Hydration"], full: "Hydration", desc: "React re-running on the client over server-rendered HTML to attach event handlers. Until it finishes, buttons look ready but do nothing.", lesson: 0, group: "Rendering and performance" },
    { term: "reflow", aliases: ["Reflow"], full: "Reflow (layout)", desc: "Recalculating the size and position of elements. Expensive, and triggered by changing width, height, margin and similar.", lesson: 8, group: "Rendering and performance" },
    { term: "layout thrashing", aliases: ["Layout thrashing"], full: "Layout thrashing", desc: "Alternating layout reads and style writes in a loop so the browser recalculates layout every iteration.", lesson: 8, group: "Rendering and performance" },
    { term: "long task", aliases: ["long tasks", "Long task"], full: "Long task", desc: "Any task that holds the main thread for more than 50 ms, delaying input and painting.", lesson: 8, group: "Rendering and performance" },
    { term: "LCP", full: "Largest Contentful Paint", desc: "When the largest visible element (usually the hero image or heading) is painted. Good is 2.5 s or less.", lesson: 9, group: "Rendering and performance" },
    { term: "INP", full: "Interaction to Next Paint", desc: "How long the page takes to visually respond to clicks, taps and keys, across the whole visit. Good is 200 ms or less. Replaced FID in 2024.", lesson: 9, group: "Rendering and performance" },
    { term: "CLS", full: "Cumulative Layout Shift", desc: "A score for how much visible content jumps around unexpectedly. Good is 0.1 or less.", lesson: 9, group: "Rendering and performance" },
    { term: "FID", full: "First Input Delay", desc: "The old responsiveness metric: only the delay before the first interaction was handled. Replaced by INP.", lesson: 9, group: "Rendering and performance" },
    { term: "FCP", full: "First Contentful Paint", desc: "When the first text or image appears on screen.", lesson: 0, group: "Rendering and performance" },
    { term: "TBT", full: "Total Blocking Time", desc: "A lab metric: the total time the main thread was blocked by long tasks. Used as a proxy for INP in Lighthouse.", lesson: 9, group: "Rendering and performance" },
    { term: "CrUX", full: "Chrome UX Report", desc: "Google's dataset of real-user performance measurements, used by PageSpeed Insights and Search Console.", lesson: 9, group: "Rendering and performance" },
    { term: "RUM", full: "Real User Monitoring", desc: "Measuring performance from real visitors' browsers rather than in a lab test.", lesson: 9, group: "Rendering and performance" },
  ],
  backend: [{ term: "DTO", full: "Data Transfer Object", desc: "A plain object that defines the shape of data crossing a boundary, such as a request body.", lesson: 3, group: "Design" }],
  debugging: [{ term: "INP", full: "Interaction to Next Paint", desc: "A Core Web Vital measuring how quickly the page responds to clicks, taps and key presses.", lesson: 1, group: "Metrics" }],
  "design-problems": [{ term: "Base62", full: "Base62", desc: "An encoding using 0-9, a-z and A-Z: 62 URL-safe characters.", lesson: 1, group: "Encoding" }],
  "frontend-depth": [{ term: "Reconciliation", full: "Reconciliation", desc: "How React compares the new tree of elements with the previous one to decide what to change.", lesson: 0, group: "React" }],
};
