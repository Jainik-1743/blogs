import type { CheatSheet } from "../types.ts";

/** Cheat sheet for the "security" series. See scripts/SERIES-SHEETS.md. */
export const SHEET: CheatSheet | null = {
  intro:
    "The attacks and the fixes for a web app, from injection and XSS to passwords, secrets, supply chain and incidents. One rule runs through all of it: **everything from outside your code is untrusted**, so keep data away from code.",
  sections: [
    {
      title: "The security mindset",
      lesson: 0,
      blocks: [
        {
          kind: "points",
          items: [
            "Attackers send the **unexpected**: a fourth dropdown value, `/notes/18`, a fake `X-User-Id`, a huge input.",
            "**Defence in depth**: layers make one bug smaller. A read-only DB user stopped writes despite injectable SQL.",
            "**Least privilege** and **fail closed**: smallest power that works, and an error means no.",
            "**STRIDE**: Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation.",
            "Threat model: what are we building, what can go wrong, what will we do, did we do enough.",
          ],
        },
      ],
    },
    {
      title: "OWASP Top 10:2025",
      lesson: 0,
      blocks: [
        {
          kind: "table",
          head: ["#", "Category"],
          mono: [0],
          rows: [
            ["A01", "Broken Access Control (includes SSRF, CSRF)"],
            ["A02", "Security Misconfiguration"],
            ["A03", "Software Supply Chain Failures"],
            ["A04", "Cryptographic Failures"],
            ["A05", "Injection (SQL, OS, NoSQL, XSS)"],
            ["A06", "Insecure Design"],
            ["A07", "Authentication Failures"],
            ["A08", "Software or Data Integrity Failures"],
            ["A09", "Security Logging & Alerting Failures"],
            ["A10", "Mishandling of Exceptional Conditions"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Name the edition. \"A03 is Injection\" was the 2021 numbering. In 2025 Injection is A05.",
        },
      ],
    },
    {
      title: "Injection: never mix data into code",
      lesson: 1,
      blocks: [
        {
          kind: "code",
          lang: "js",
          code:
            "// BAD: name = admin'--  logs in as admin\n`... WHERE name = '${name}'`\n\n// GOOD: SQL and values travel separately\ndb.prepare(\n  \"SELECT id FROM users\n  WHERE name = ? AND pw = ?\"\n).get(name, pw);",
          note: "Escaping quotes is a weak fix. Use the interface made to carry data.",
        },
        {
          kind: "table",
          head: ["Interpreter", "Attack", "Data channel"],
          rows: [
            ["SQL", "`admin'--`, `' OR '1'='1`, `UNION`", "`?` parameters"],
            ["Shell", "`Sam; echo INJECTED`", "`execFile(prog, [args])`, `--` before values"],
            ["MongoDB", "`{\"password\":{\"$ne\":null}}`", "Check `typeof` is string at the edge"],
            ["Sort column", "`?sort=name; DROP...`", "Allow-list, `Object.hasOwn`"],
          ],
        },
        {
          kind: "points",
          items: [
            "A plain-object lookup of `constructor` returns an inherited function. Use `Object.hasOwn` or a `Map`.",
            "`exec` runs `;` `|` `&&`. `execFile` does not, but `-la` can still be an option. Never `shell: true`.",
          ],
        },
      ],
    },
    {
      title: "XSS and CSP",
      lesson: 2,
      blocks: [
        {
          kind: "points",
          items: [
            "**Reflected**: payload in the link. **Stored**: saved, hits every visitor. **DOM**: page JS writes it, e.g. `innerHTML = location.hash`.",
            "Fix: **encode output for the place it lands** (HTML text, attribute, JS string, URL, CSS each differ). `<` becomes `&lt;`.",
            "`HttpOnly` hides the cookie, but the script can still act as the user. It reduces damage only.",
          ],
        },
        {
          kind: "table",
          head: ["Framework", "Safe by default", "The hole"],
          rows: [
            ["React", "`{value}`", "`dangerouslySetInnerHTML`"],
            ["Vue", "`{{ value }}`", "`v-html`"],
            ["Plain JS", "`textContent`", "`innerHTML`"],
          ],
        },
        {
          kind: "pairs",
          rows: [
            ["default-src 'self'", "Load things from my origin only"],
            ["script-src 'self'", "No inline scripts. Use a nonce or hash to allow one"],
            ["frame-ancestors 'none'", "Nobody may frame the page"],
            ["Content-Security-Policy-Report-Only", "Log what would break, block nothing"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "CSP is a net, not a cure. `'unsafe-inline'` or `https:` wildcards give almost no protection.",
        },
      ],
    },
    {
      title: "CSRF, clickjacking, headers",
      lesson: 2,
      blocks: [
        {
          kind: "points",
          items: [
            "**CSRF**: the browser attaches your cookie to a request another site started. The attacker cannot read the reply, only trigger the action.",
            "Defence: explicit `SameSite`, a random **session-bound token**, check `Origin` or `Sec-Fetch-Site`. **GET never changes data.**",
          ],
        },
        {
          kind: "table",
          head: ["SameSite", "Cookie sent when"],
          rows: [
            ["`Strict`", "Request starts on your own site only"],
            ["`Lax`", "Also top-level link navigation (GET). Not cross-site POST"],
            ["`None`", "Always (needs `Secure`)"],
          ],
        },
        {
          kind: "pairs",
          rows: [
            ["frame-ancestors / X-Frame-Options", "Stop clickjacking (Chromium: `ERR_BLOCKED_BY_RESPONSE`)"],
            ["Strict-Transport-Security", "HTTPS only. Only send over HTTPS"],
            ["X-Content-Type-Options: nosniff", "No file-type guessing"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "`helmet()` sets a sensible group. Cookie flags are yours. Check the real response with `curl -I`.",
        },
      ],
    },
    {
      title: "Storing passwords",
      lesson: 3,
      blocks: [
        {
          kind: "points",
          items: [
            "Never store or encrypt the password. Store a **slow, salted hash**. A salt is random, per user, not secret.",
            "SHA-256 is fast: about 330,000 guesses per second on one JS thread. Same password gave the same hash for alice and dave.",
            "Same error for every login failure: \"Email or password is incorrect\". Run a dummy hash for unknown users.",
          ],
        },
        {
          kind: "table",
          head: ["Function", "OWASP minimum"],
          rows: [
            ["Argon2id (first choice)", "19 MiB memory, 2 iterations, 1 parallelism"],
            ["scrypt", "N=2^17, r=8, p=1. Set `maxmem` or Node throws"],
            ["bcrypt (legacy)", "Work factor 10+, 72 byte limit"],
            ["PBKDF2 (FIPS)", "600,000+ iterations, HMAC-SHA-256"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Rules that help: 8+ chars with MFA, allow 64+, any character, block breached passwords, no forced rotation.",
        },
      ],
    },
    {
      title: "Sessions and JWT",
      lesson: 3,
      blocks: [
        {
          kind: "code",
          lang: "text",
          code:
            "Set-Cookie: __Host-sid=<randomBytes(32)>;\n  Path=/; Secure; HttpOnly;\n  SameSite=Lax; Max-Age=3600",
          note: "New ID at login (stops fixation). Idle and absolute timeouts. Never in localStorage.",
        },
        {
          kind: "points",
          items: [
            "`__Host-` forces `Secure`, `Path=/`, no `Domain`. `Secure` does nothing if the site also serves plain HTTP: redirect and use HSTS.",
            "A JWT payload is **base64url, readable by anyone**. The signature only stops edits. No secrets inside.",
            "Verify: pin the algorithm in code (reject `alg: none`), require `exp`, check `iss` and `aud`, use a 32+ byte secret.",
          ],
        },
      ],
    },
    {
      title: "Reset, MFA and guessing limits",
      lesson: 3,
      blocks: [
        {
          kind: "steps",
          items: [
            "Same message whether the email exists or not.",
            "Token: 32 random bytes, store only its SHA-256, **single use**, about 15 minutes.",
            "On use: mark used, end other sessions, email \"password changed\". Never email the password.",
          ],
        },
        {
          kind: "table",
          head: ["MFA method", "Weak spot"],
          rows: [
            ["TOTP app (RFC 6238)", "Phishable within 30 s. Reject a replayed code"],
            ["SMS or call", "SIM swap. OWASP: restricted"],
            ["Passkey / FIDO2", "Phishing resistant. Needs recovery plan"],
            ["Recovery codes", "Single use, stored hashed"],
          ],
        },
        {
          kind: "points",
          items: [
            "Rate limit per **account and per IP**. Prefer growing delays to hard locks. Check the limiter before hashing.",
            "Credential stuffing: breached-password block, MFA, one error text, alert on failure spikes.",
          ],
        },
      ],
    },
    {
      title: "Access control (IDOR)",
      lesson: 4,
      blocks: [
        {
          kind: "code",
          lang: "sql",
          code:
            "-- owner id comes from the SESSION\nSELECT * FROM notes\n WHERE id = $1 AND owner_id = $2;",
          note: "Login passed but nobody asked \"is it yours?\" That is an IDOR (BOLA in APIs).",
        },
        {
          kind: "points",
          items: [
            "Check **every method** (read, update, delete, export), on the server, in one central layer. Hidden buttons are not security.",
            "**Deny by default**: no matching rule means no (`?? false`). Random UUIDs are a bonus, not the lock.",
            "**Mass assignment**: `Object.assign(me, body)` lets `role: admin` in. Allow-list fields or use a DTO, and keep the owner check.",
          ],
        },
        {
          kind: "table",
          head: ["Code", "Use when"],
          rows: [
            ["401", "Not logged in"],
            ["403", "Known user, no. Existence is public"],
            ["404", "Existence is private: \"not yours\" looks like \"not there\""],
          ],
        },
      ],
    },
    {
      title: "Crypto, randomness, TLS",
      lesson: 5,
      blocks: [
        {
          kind: "table",
          head: ["Tool", "Key?", "Reversible?", "Use"],
          rows: [
            ["Hash", "No", "No", "Fingerprint, slow hash for passwords"],
            ["Encoding", "No", "Yes, anyone", "base64 is not security"],
            ["HMAC", "Yes", "No", "Webhook signs, JWT HS256"],
            ["Encryption", "Yes", "With key", "AES-256-GCM for data to read back"],
          ],
        },
        {
          kind: "points",
          items: [
            "GCM: new random 12-byte IV **every time**, store IV + 16-byte tag + ciphertext. A flipped bit throws.",
            "Secrets use `randomBytes`, `randomUUID`, `randomInt`. Never `Math.random`.",
            "TLS gives identity, privacy, integrity. Never set `rejectUnauthorized: false`. HSTS: short `max-age` first.",
          ],
        },
      ],
    },
    {
      title: "A secret leaked: what now",
      lesson: 5,
      blocks: [
        {
          kind: "steps",
          items: [
            "**Rotate now**: new key, deploy, revoke the old one.",
            "Check the provider logs and billing for use.",
            "Remove from code, load from a secret store.",
            "Add scanning and push protection.",
          ],
        },
        {
          kind: "points",
          items: [
            "Deleting `.env` in the next commit changes the latest snapshot only. `git log -p` still shows it.",
            "`NEXT_PUBLIC_` values are inlined into the browser bundle. Public by design.",
          ],
        },
      ],
    },
    {
      title: "Dependencies and CI",
      lesson: 6,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["npm ci", "Exact lock file tree. Fails if out of sync"],
            ["ignore-scripts=true", "In `.npmrc`: no silent `postinstall`"],
            ["npm audit --audit-level=high", "Exit 1 on high or critical. Known issues only"],
          ],
        },
        {
          kind: "points",
          items: [
            "Entry routes: typosquatting, install scripts, account takeover, new owner (event-stream), dependency confusion (use `@scope/`).",
            "One `npm install express` brought 65 packages. Read lock file diffs for odd `resolved` hosts.",
          ],
        },
        {
          kind: "code",
          lang: "yaml",
          code:
            "permissions:\n  contents: read\n# pin to a full SHA, not a tag\n- uses: actions/checkout@<40-char-sha>\n  with: { persist-credentials: false }\n# untrusted text via env, not run:\n- env:\n    TITLE: ${{ github.event.pr.title }}\n  run: echo \"$TITLE\"",
          note: "Avoid pull_request_target with PR code. tj-actions moved its tags in 2025.",
        },
      ],
    },
    {
      title: "SSRF and file uploads",
      lesson: 7,
      blocks: [
        {
          kind: "points",
          items: [
            "**SSRF**: your server fetches an attacker URL and reaches `127.0.0.1`, internal hosts, or `169.254.169.254` (cloud metadata).",
            "An allow-list still leaked through a **redirect**. Use `redirect: \"manual\"` or re-check each hop. Allow only `http:` and `https:`.",
            "Open URLs: resolve, then check the **IP**, inside the connection's own lookup (stops DNS rebinding). `::ffff:7f00:1` is loopback.",
          ],
        },
        {
          kind: "table",
          head: ["Upload risk", "Defence"],
          rows: [
            ["`../victim.txt` name", "Generate the name (`randomUUID()` + ext). Check `startsWith(dir + sep)`"],
            ["`shell.js`", "Extension allow-list, 415 otherwise"],
            ["Fake `Content-Type`", "Ignore it. Check magic bytes. Re-encode images"],
            ["Huge body", "Stop reading at the limit, 413. Set proxy limit, quota"],
          ],
        },
      ],
    },
    {
      title: "Errors, CORS, rate limits",
      lesson: 7,
      blocks: [
        {
          kind: "points",
          items: [
            "Errors: log the stack under an **error ID**, return only `{ error, errorId }`. Debug off in production. Do not fail open.",
            "Limiter: return **429** with `Retry-After`. In-memory counts are per process, so use Redis or the gateway. Limit sizes too (`?limit=`).",
            "CORS is a browser rule that relaxes same-origin. It is not authentication and does not stop CSRF.",
          ],
        },
        {
          kind: "table",
          head: ["CORS mistake", "Why bad"],
          rows: [
            ["Reflect `Origin` + credentials", "Any site reads logged-in data"],
            ["Allow `null`", "Sandboxed pages send it"],
            ["`endsWith(\"example.com\")`", "`evilexample.com` passes. Compare exactly"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "OWASP API Top 10: API1 BOLA, API3 field level, API5 function level, API4 no limits, API7 SSRF.",
        },
      ],
    },
    {
      title: "Review, scanners, incident",
      lesson: 8,
      blocks: [
        {
          kind: "table",
          head: ["Scanner", "Misses"],
          rows: [
            ["SAST (Semgrep, CodeQL)", "A missing owner check: no pattern to match"],
            ["DAST (OWASP ZAP)", "Code no request reaches; logic bugs"],
            ["SCA (`npm audit`)", "Brand-new malicious versions"],
            ["Secrets (gitleaks)", "Shapeless secrets. `gitleaks git` scans history"],
          ],
        },
        {
          kind: "steps",
          items: [
            "Declare, name one lead and a note-taker.",
            "Contain: revoke, disable, roll back. Do not delete evidence.",
            "Rotate every secret that may be exposed.",
            "Save logs and snapshots with times.",
            "Scope: first bad event, what was touched.",
            "Tell owners (GDPR can mean 72 hours), then fix with a test.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "In review, hunt new doors (input, route, outbound call, package) and deleted checks. Write the test with the fix.",
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
            ["SQL injection fix?", "Parameterised queries; allow-list names; least-privilege DB user."],
            ["Why does CSRF work?", "Cookie is sent whoever starts the request. SameSite plus token."],
            ["Store passwords?", "Argon2id or scrypt, unique salt, tuned cost."],
            ["Do UUIDs fix IDOR?", "No. Check ownership on the server."],
            ["Key committed?", "Rotate first, check logs, then clean up."],
            ["We use HTTPS, so safe?", "No. It protects the pipe, not the endpoints."],
          ],
        },
      ],
    },
  ],
};
