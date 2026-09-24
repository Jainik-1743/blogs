import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Compare, QA } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import JwtAnatomy from "@/components/sd/widgets/JwtAnatomy";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-49")!;

export const metadata: Metadata = {
  title: `Lesson 49 — ${lesson.title}`,
  description: lesson.summary,
};

/** In-page index. Each entry links to a section heading below. */
const outline = [
  { id: "the-problem", label: "The Problem" },
  { id: "the-core-idea", label: "The Core Idea" },
  { id: "how-it-works", label: "How It Works" },
  { id: "trade-offs", label: "Trade-offs" },
  { id: "in-the-real-world", label: "In the Real World" },
  { id: "interview-questions", label: "Interview Questions" },
  { id: "key-takeaways", label: "Key Takeaways" },
  { id: "further-reading", label: "Further Reading" },
];

const code1 = `Set-Cookie: sid=k9Fq…; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400`;

const code2 = `roles:  admin → [read, write, delete, manage_users]
        editor → [read, write]
        viewer → [read]`;

const code3 = `// ❌ Vulnerable
app.get("/invoices/:id", requireLogin, async (req, res) => {
  res.json(await db.invoices.findById(req.params.id));
});

// ✅ Fixed: always scope to the current user/tenant
app.get("/invoices/:id", requireLogin, async (req, res) => {
  const invoice = await db.invoices.findOne({ id: req.params.id, customerId: req.user.id });
  if (!invoice) return res.status(404).end();   // 404 hides whether it exists
  res.json(invoice);
});`;

export default function SdLessonFourNinePage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            A new API goes live. Every endpoint checks "is the user logged in?". Then someone notices that changing the
            number in the URL, from <code>GET /invoices/1001</code> to <code>GET /invoices/1002</code>, shows{" "}
            <strong>another customer's invoice</strong>. The user <em>was</em> logged in. They just weren't{" "}
            <em>allowed</em> to see that invoice.
          </p>
          <p>
            Elsewhere, the team switches from server sessions to JWTs "because they scale better". Then an account is
            hacked, and they discover they <strong>can't log the attacker out</strong>: the stolen token stays valid for
            30 days.
          </p>
          <p>
            Most security problems in real systems aren't exotic cryptography attacks. They come from mixing up{" "}
            <strong>who you are</strong> (authentication) with <strong>what you're allowed to do</strong>{" "}
            (authorization), and from choosing session and token designs without understanding their trade-offs.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about checking into a <strong>hotel</strong>.
          </p>
          <ul>
            <li>
              <strong>Authentication (AuthN): "Who are you?"</strong> At the front desk, you show your ID, and the staff
              confirm you are who you claim to be.
            </li>
            <li>
              <strong>The key card is the session or token.</strong> Instead of showing your ID at every door, you get a
              key card that <strong>proves you already checked in</strong>.
            </li>
            <li>
              <strong>Authorization (AuthZ): "What are you allowed to do?"</strong> Your key card opens{" "}
              <strong>your room</strong>, the gym and the pool, but <strong>not</strong> other guests' rooms or the
              staff office.
            </li>
          </ul>
          <p>Two important lessons from the hotel:</p>
          <ol>
            <li>
              <strong>Having a key card (being logged in) doesn't mean you can open every door.</strong> Every door must
              check permission.
            </li>
            <li>
              <strong>If a key card is stolen</strong>, the hotel must be able to <strong>cancel it</strong> quickly.
            </li>
          </ol>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <hr />
          <h3 id="part-1-authentication-proving-identity">Part 1: Authentication, proving identity</h3>
          <p>
            <strong>Passwords, stored safely.</strong>
          </p>
          <ul>
            <li>
              <strong>Never store passwords in plain text</strong> or with fast hashes like MD5 or SHA-256. Attackers
              who steal the database can try billions of guesses per second against fast hashes.
            </li>
            <li>
              Use a <strong>slow, salted password-hashing algorithm</strong> designed for this:{" "}
              <strong>Argon2id</strong> (recommended first), <strong>scrypt</strong> or <strong>bcrypt</strong>. Each
              password gets a random <strong>salt</strong>, so identical passwords produce different hashes.
            </li>
            <li>
              Check new passwords against lists of <strong>known breached passwords</strong>, and prefer{" "}
              <strong>long passphrases</strong> over complex rules. (NIST's modern guidance recommends this, and
              discourages forced periodic changes.)
            </li>
            <li>
              Protect login from <strong>brute force</strong> with <strong>rate limiting</strong> per account and per IP
              (post 43), and use CAPTCHA or step-up checks after repeated failures.
            </li>
            <li>
              Use <strong>generic error messages</strong> ("invalid email or password"), so attackers can't discover
              which emails have accounts.
            </li>
          </ul>
          <p>
            <strong>Multi-factor authentication (MFA).</strong> A second factor stops most account takeovers, even when
            passwords leak:
          </p>
          <ul>
            <li>
              <strong>TOTP apps</strong> (like Google Authenticator), which produce 6-digit codes that change every 30
              seconds,
            </li>
            <li>
              <strong>SMS OTP</strong>, which is better than nothing but vulnerable to SIM-swap attacks,
            </li>
            <li>
              <strong>push approvals</strong>, which are convenient but vulnerable to "MFA fatigue" (spamming prompts
              until someone taps approve). Use <strong>number matching</strong> to reduce this,
            </li>
            <li>
              <strong>hardware security keys</strong> and <strong>passkeys</strong>, the strongest options.
            </li>
          </ul>
          <p>
            <strong>Passkeys (WebAuthn / FIDO2).</strong> Passkeys replace passwords with{" "}
            <strong>public-key cryptography</strong>. Your device stores a private key, and the website stores only the
            public key. Signing in means your device proves it has the private key, unlocked by your fingerprint, face
            or PIN.
          </p>
          <ul>
            <li>
              ✅ <strong>Phishing-resistant:</strong> a passkey only works on the real website's domain.
            </li>
            <li>✅ Nothing secret is stored on the server to steal.</li>
            <li>Apple, Google and Microsoft all support passkeys, and many major sites offer them.</li>
          </ul>
          <p>
            <strong>Single sign-on (SSO).</strong> With SSO, users log in once with an{" "}
            <strong>identity provider</strong> (Google, Microsoft Entra ID, Okta, a company's own login) and access many
            apps. This uses <strong>OAuth 2.0 / OpenID Connect</strong> or <strong>SAML</strong> (post 50).
          </p>
          <hr />
          <h3 id="part-2-staying-logged-in-sessions-vs-tokens">Part 2: Staying logged in, sessions vs tokens</h3>
          <p>
            After login, the server needs a way to recognise the user on <strong>every request</strong>, because HTTP is
            stateless (post 3). There are two main approaches.
          </p>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Option A: Server-side sessions</h4>
          <SequenceDiagram
            caption="Server-side sessions. Only a random ID travels; the data stays on the server, so logout is instant."
            actors={["Browser", "App server", "Redis"]}
            messages={[
              { from: 0, to: 1, label: <>POST /login (email + password)</> },
              { from: 1, to: 2, label: <>SET session:k9Fq… = &#123;user 42, roles, expires&#125;</> },
              { from: 1, to: 0, label: <>Set-Cookie: sid=k9Fq…; HttpOnly; Secure; SameSite=Lax</>, reply: true },
              { from: 0, to: 1, label: <>GET /account (cookie sid=k9Fq…)</> },
              { from: 1, to: 2, label: <>GET session:k9Fq…</> },
              { from: 2, to: 1, label: <>user 42</>, reply: true },
              { from: 1, to: 0, label: <>200 OK</>, reply: true },
              {
                from: 0,
                to: 0,
                label: <>Logout or ban → DEL session:k9Fq… — revoked everywhere at once</>,
                divider: true,
              },
            ]}
          />
          <ul>
            <li>
              ✅ <strong>Easy to revoke.</strong> Delete the session and the user is logged out{" "}
              <strong>instantly</strong>, everywhere you choose.
            </li>
            <li>
              ✅ <strong>Small cookie.</strong> Only a random ID travels. The data stays on the server.
            </li>
            <li>✅ Simple, mature and well understood.</li>
            <li>
              ❌ <strong>A lookup on every request.</strong> You need a <strong>shared session store</strong> (like
              Redis) so any server can check any session (post 7). This is usually fast and cheap.
            </li>
            <li>❌ Harder to use across many domains or for non-browser clients.</li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Option B: Tokens (JWT)</h4>
          <p>
            A <strong>JSON Web Token (JWT)</strong> is a <strong>signed</strong> piece of data that the client sends
            with each request. The server can <strong>verify the signature</strong> without looking anything up.
          </p>
          <p>
            A JWT has three parts, <strong>header.payload.signature</strong>, each Base64URL-encoded:
          </p>
          <JwtAnatomy caption="A JWT, colour-coded into its three parts. Try editing the payload and see why the server rejects it." />
          <p>
            <strong>Standard claims:</strong>
          </p>
          <ul>
            <li>
              <code>iss</code> (issuer): who created the token.
            </li>
            <li>
              <code>sub</code> (subject): who the token is about (the user ID).
            </li>
            <li>
              <code>aud</code> (audience): which service it's meant for.
            </li>
            <li>
              <code>exp</code> (expiry), <code>iat</code> (issued at), <code>nbf</code> (not before).
            </li>
            <li>
              <code>jti</code>: a unique token ID (useful for revocation lists).
            </li>
          </ul>
          <p>
            <strong>Signing algorithms:</strong>
          </p>
          <ul>
            <li>
              <strong>HS256 (HMAC with a shared secret).</strong> The same secret signs and verifies, so{" "}
              <strong>every service that verifies can also create tokens</strong>. It's only suitable within one trusted
              service.
            </li>
            <li>
              <strong>RS256 / ES256 (public-key signatures).</strong> The auth server signs with a{" "}
              <strong>private key</strong>, and every other service verifies with the <strong>public key</strong>.
              That's safer for many services. Public keys are often published at a <strong>JWKS</strong> (JSON Web Key
              Set) endpoint.
            </li>
          </ul>
          <p>
            ⚠️ <strong>JWTs are signed, not encrypted.</strong> Anyone holding the token can{" "}
            <strong>decode and read</strong> the payload.{" "}
            <strong>Never put secrets or sensitive personal data in a JWT.</strong> (Encrypted tokens, called JWE,
            exist, but are less common.)
          </p>
          <p>
            <strong>Why people like JWTs:</strong>
          </p>
          <ul>
            <li>
              ✅ <strong>Stateless verification:</strong> no session lookup, so any service can check the token locally.
            </li>
            <li>
              ✅ Useful for <strong>APIs, mobile apps, and passing identity between services</strong>.
            </li>
            <li>✅ A standard format, widely supported by libraries and identity providers.</li>
          </ul>
          <p>
            <strong>The big JWT problem: revocation.</strong> Because servers don't look tokens up,{" "}
            <strong>a valid token keeps working until it expires</strong>, even after the user logs out, changes their
            password, or is banned. Solutions:
          </p>
          <ul>
            <li>
              <strong>Short-lived access tokens</strong> (5–15 minutes) plus <strong>refresh tokens</strong> (below).
            </li>
            <li>
              A <strong>deny list</strong> of revoked token IDs (<code>jti</code>) checked on each request. But that's a
              lookup again, just like sessions.
            </li>
            <li>
              <strong>Token versioning:</strong> store a <code>token_version</code> per user. Bump it to invalidate all
              older tokens (this also needs a lookup, but it's small and easily cached).
            </li>
          </ul>
          <p>
            <strong>Common JWT mistakes (all real, all seen in production):</strong>
          </p>
          <ul>
            <li>
              accepting <code>"alg": "none"</code> (unsigned tokens), or letting the token{" "}
              <strong>choose its own algorithm</strong>. Always <strong>pin the expected algorithm</strong> on the
              server,
            </li>
            <li>
              <strong>not checking</strong> <code>exp</code>, <code>aud</code> or <code>iss</code>,
            </li>
            <li>
              <strong>algorithm confusion</strong>, like treating a public key as an HMAC secret,
            </li>
            <li>
              <strong>long expiry times</strong> (days or weeks) with no revocation plan,
            </li>
            <li>
              <strong>huge tokens</strong> stuffed with permissions, sent on every request,
            </li>
            <li>
              <strong>
                storing tokens in <code>localStorage</code>
              </strong>
              , where any cross-site scripting (XSS) bug can steal them.
            </li>
          </ul>
          <p>
            <strong>Use a well-maintained library</strong>, and follow the JWT Best Current Practices (RFC 8725).
          </p>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Access tokens + refresh tokens</h4>
          <p>A common, safer token design:</p>
          <SequenceDiagram
            caption="Access + refresh tokens with rotation. Stateless where it's hot, revocable where it matters."
            actors={["Client", "API", "Auth server"]}
            messages={[
              { from: 0, to: 1, label: <>GET /orders · Bearer access (10 min)</> },
              { from: 1, to: 0, label: <>200 OK</>, note: <>verified locally, no lookup</>, reply: true },
              { from: 0, to: 0, label: <>Ten minutes later the access token has expired</>, divider: true },
              { from: 0, to: 1, label: <>GET /orders · Bearer access</> },
              { from: 1, to: 0, label: <>401 token expired</>, reply: true },
              { from: 0, to: 2, label: <>POST /token · refresh token R1</> },
              { from: 2, to: 2, label: <>R1 in DB and not revoked? → invalidate R1</> },
              { from: 2, to: 0, label: <>new access token + refresh token R2</>, note: <>rotation</>, reply: true },
            ]}
          />
          <ul>
            <li>
              Access tokens are <strong>verified statelessly</strong> (fast), and a stolen one works for only minutes.
            </li>
            <li>
              Refresh tokens are <strong>checked against the database</strong>, so they <strong>can be revoked</strong>.
              Logging out or changing the password deletes them.
            </li>
            <li>
              <strong>Refresh token rotation:</strong> each use returns a new refresh token and invalidates the old one.
              If an old refresh token is ever used again, that suggests it was stolen, so revoke the whole chain.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Where to keep tokens in a browser</h4>
          <ul>
            <li>
              <strong>
                <code>HttpOnly</code> cookies
              </strong>{" "}
              can't be read by JavaScript, which protects them from XSS theft.{" "}
              <strong>This is the recommended place.</strong>
            </li>
            <li>
              <strong>
                <code>localStorage</code> or <code>sessionStorage</code>
              </strong>{" "}
              is readable by any script on the page, so one XSS bug leaks every token.
            </li>
            <li>
              For single-page apps, a common pattern is the <strong>Backend-for-Frontend (BFF)</strong> (post 13). The
              BFF holds the tokens server-side and gives the browser only an <code>HttpOnly</code> session cookie.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Cookie security settings</h4>
          <CodeBlock lang="http" code={code1} />
          <ul>
            <li>
              <strong>
                <code>HttpOnly</code>:
              </strong>{" "}
              JavaScript can't read it (blocks XSS token theft).
            </li>
            <li>
              <strong>
                <code>Secure</code>:
              </strong>{" "}
              it's only sent over HTTPS.
            </li>
            <li>
              <strong>
                <code>SameSite</code>:
              </strong>
              <ul>
                <li>
                  <code>Strict</code>: never sent with requests from other sites.
                </li>
                <li>
                  <code>Lax</code>: sent on top-level navigation, but not on most cross-site requests. It's a good
                  default, and blocks most <strong>CSRF</strong>.
                </li>
                <li>
                  <code>None</code>: always sent, and must be used with <code>Secure</code>. It's needed for some
                  cross-site setups.
                </li>
              </ul>
            </li>
            <li>
              <strong>
                <code>Domain</code> / <code>Path</code>:
              </strong>{" "}
              keep the scope as narrow as possible.
            </li>
            <li>
              <strong>An expiry</strong>, plus <strong>server-side expiry</strong> as well.
            </li>
          </ul>
          <p>
            <strong>CSRF (Cross-Site Request Forgery):</strong> a malicious site tricks your browser into sending a
            request to another site <strong>with your cookies attached</strong>, such as "transfer money". Defences:
          </p>
          <ul>
            <li>
              <code>SameSite</code> cookies,
            </li>
            <li>
              <strong>anti-CSRF tokens</strong> in forms and state-changing requests,
            </li>
            <li>
              checking the <code>Origin</code> header.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Sessions or JWTs?</h4>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Server sessions</th>
                  <th>JWT access tokens</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Revocation</td>
                  <td>✅ Instant</td>
                  <td>❌ Hard (short expiry + refresh tokens)</td>
                </tr>
                <tr>
                  <td>Lookup per request</td>
                  <td>Yes (fast Redis lookup)</td>
                  <td>No (verify signature)</td>
                </tr>
                <tr>
                  <td>Best for</td>
                  <td>First-party web apps</td>
                  <td>APIs, mobile apps, service-to-service, third-party access</td>
                </tr>
                <tr>
                  <td>Size</td>
                  <td>Tiny cookie</td>
                  <td>Bigger (claims + signature)</td>
                </tr>
                <tr>
                  <td>Complexity</td>
                  <td>Low</td>
                  <td>Higher (keys, rotation, expiry, refresh)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>A practical default:</strong> use{" "}
            <strong>
              server-side sessions with <code>HttpOnly</code> cookies
            </strong>{" "}
            for your own website. Use <strong>short-lived JWT access tokens with rotating refresh tokens</strong> for
            APIs, mobile apps and between services, often issued by an OAuth 2.0 / OpenID Connect provider (post 50).
          </p>
          <hr />
          <h3 id="part-3-authorization-what-you-may-do">Part 3: Authorization, what you may do</h3>
          <p>
            Authentication tells you <strong>who</strong>. Authorization decides <strong>what they can do</strong>.
            Common models:
          </p>
          <p>
            <strong>RBAC (Role-Based Access Control).</strong> Users get <strong>roles</strong>, and roles have{" "}
            <strong>permissions</strong>.
          </p>
          <CodeBlock code={code2} />
          <p>
            It's simple and very common, but it gets messy when you need rules like "can edit only documents in{" "}
            <em>their</em> team".
          </p>
          <p>
            <strong>ABAC (Attribute-Based Access Control).</strong> Decisions use <strong>attributes</strong> of the
            user, the resource and the context:
          </p>
          <Compare
            caption="Three authorization models, from simplest to most expressive."
            columns={[
              {
                title: <>RBAC</>,
                items: [
                  { sign: "·", text: <>users → roles → permissions</> },
                  { sign: "+", text: <>Simple; easy to audit</> },
                  { sign: "-", text: <>Explodes into many roles for “only their team's documents”</> },
                ],
                verdict: <>Admin panels, most business apps</>,
              },
              {
                title: <>ABAC</>,
                items: [
                  { sign: "·", text: <>rules over user, resource and context attributes</> },
                  { sign: "+", text: <>Very flexible (department, clearance, time)</> },
                  { sign: "-", text: <>Harder to understand and audit</> },
                ],
                verdict: <>Regulated and enterprise data</>,
              },
              {
                title: <>ReBAC</>,
                items: [
                  { sign: "·", text: <>permissions follow relationships (member → team → folder → doc)</> },
                  { sign: "+", text: <>Natural for sharing models</> },
                  { sign: "-", text: <>Needs a dedicated system (Zanzibar, SpiceDB, OpenFGA)</> },
                ],
                verdict: <>Drive, GitHub, Notion-style sharing</>,
              },
            ]}
          />
          <p>It's very flexible, but harder to understand and audit.</p>
          <p>
            <strong>ReBAC (Relationship-Based Access Control).</strong> Permissions come from{" "}
            <strong>relationships</strong>: "Asha is an <strong>editor</strong> of document D because she's a{" "}
            <strong>member</strong> of team T, which <strong>owns</strong> folder F, which <strong>contains</strong> D."
            It's perfect for sharing models like Google Drive, GitHub or Notion. Google described its system for this,{" "}
            <strong>Zanzibar</strong>, in a 2019 paper. Open-source systems inspired by it include{" "}
            <strong>SpiceDB</strong> and <strong>OpenFGA</strong>.
          </p>
          <p>
            <strong>ACLs (Access Control Lists).</strong> Each resource lists who can do what. It's simple for small
            systems.
          </p>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Where to check permissions</h4>
          <ul>
            <li>
              <strong>The API gateway</strong> can check "is there a valid token?" and coarse rules (post 13).
            </li>
            <li>
              <strong>Each service must check object-level permissions:</strong> "is user 42 allowed to read{" "}
              <strong>invoice 1002</strong>?"
            </li>
            <li>
              <strong>The data layer</strong> can add a safety net, like row-level security in PostgreSQL, or always
              filtering queries by <code>tenant_id</code>.
            </li>
          </ul>
          <p>
            <strong>The #1 API vulnerability</strong> is <strong>broken object-level authorization</strong> (also called
            IDOR, Insecure Direct Object Reference): checking that a user is logged in, but <strong>not</strong>{" "}
            checking that they own the object they're requesting. The invoice example at the start of this post is
            exactly this.
          </p>
          <CodeBlock lang="js" code={code3} />
          <p>
            <strong>Policy engines</strong> let you write authorization rules <strong>outside</strong> application code,
            so they're consistent and auditable:
          </p>
          <ul>
            <li>
              <strong>Open Policy Agent (OPA)</strong> with its Rego language,
            </li>
            <li>
              <strong>Cedar</strong> (from AWS),
            </li>
            <li>or Zanzibar-style services.</li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Service-to-service identity</h4>
          <p>Services must authenticate each other too:</p>
          <ul>
            <li>
              <strong>API keys:</strong> simple, but long-lived secrets to manage (post 51).
            </li>
            <li>
              <strong>OAuth client credentials:</strong> short-lived tokens (post 50).
            </li>
            <li>
              <strong>mTLS (mutual TLS):</strong> both sides present certificates, and service meshes can automate this
              (post 51).
            </li>
            <li>
              <strong>Workload identity</strong> (for example, SPIFFE, cloud IAM roles): platform-issued identities
              without hard-coded secrets.
            </li>
          </ul>
          <p>
            <strong>The principle of least privilege</strong> applies everywhere: every user, service and key should
            have the <strong>minimum permissions needed</strong>, and nothing more.
          </p>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Sessions:</strong> simple and instantly revocable, but they need a shared store.
            </li>
            <li>
              <strong>JWTs:</strong> stateless and good for distributed APIs, but hard to revoke, easy to misconfigure,
              and larger.
            </li>
            <li>
              <strong>Short token lifetimes:</strong> safer, but more refresh traffic and complexity.
            </li>
            <li>
              <strong>RBAC:</strong> simple, but becomes coarse or explodes into many roles.{" "}
              <strong>ABAC and ReBAC:</strong> fine-grained, but more complex, and they need tooling.
            </li>
            <li>
              <strong>Central policy engines:</strong> consistent and auditable, but add another dependency and a little
              latency.
            </li>
            <li>
              <strong>MFA and passkeys:</strong> much better security, at the cost of some user friction and recovery
              flows to design (lost phones!).
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Facebook's plain-text password logs (2019).</strong> Facebook disclosed that it had found{" "}
            <strong>hundreds of millions of user passwords stored in plain text in internal logs</strong>, accessible to
            employees, though it said there was no evidence of misuse. It's a reminder that "never store passwords in
            plain text" includes <strong>logs</strong> (post 46).
          </p>
          <p>
            <strong>Passkeys go mainstream.</strong> Since 2022, Apple, Google and Microsoft have supported passkeys
            across their platforms, and services like Google accounts, GitHub, PayPal and Amazon offer them. It's one of
            the biggest shifts in authentication in decades.
          </p>
          <p>
            <strong>Google Zanzibar.</strong> Google's Zanzibar handles authorization checks for products like Drive,
            YouTube and Photos, answering "can this user access this object?" consistently across the globe at very high
            volume. Its paper inspired a wave of open-source ReBAC systems.
          </p>
          <p>
            <strong>JWT "alg: none" vulnerabilities.</strong> In 2015, security researchers showed that several popular
            JWT libraries could be tricked into accepting <strong>unsigned</strong> tokens, or into confusing
            algorithms. Libraries were fixed, and "always pin the algorithm" became standard advice.
          </p>
          <p>
            <strong>Broken object-level authorization in the news.</strong> Many real data leaks, from telecom companies
            to fitness apps, came from APIs that returned any record by ID without checking ownership. That's why it
            sits at the top of the OWASP API Security Top 10 (post 52).
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>What's the difference between authentication and authorization?</>,
                a: (
                  <>
                    <p>
                      Authentication establishes who the user is (password, passkey, MFA, SSO). Authorization decides
                      what that identity may do with a specific resource. Being logged in never implies access to every
                      object.
                    </p>
                  </>
                ),
              },
              {
                q: <>How should passwords be stored?</>,
                a: (
                  <>
                    <p>
                      Never in plain text or with fast hashes like MD5 or SHA-256. Use a slow, salted password hash —
                      Argon2id first, or scrypt or bcrypt — check new passwords against breached lists, rate-limit
                      logins and add MFA.
                    </p>
                  </>
                ),
              },
              {
                q: <>Sessions or JWTs?</>,
                a: (
                  <>
                    <p>
                      Server-side sessions in HttpOnly, Secure, SameSite cookies suit first-party web apps: small,
                      simple and instantly revocable, at the cost of a fast lookup. JWT access tokens suit APIs, mobile
                      apps and service-to-service calls because they verify locally, but they're hard to revoke — so
                      keep them short-lived with rotating refresh tokens.
                    </p>
                  </>
                ),
              },
              {
                q: <>What are common JWT mistakes?</>,
                a: (
                  <>
                    <p>
                      Accepting alg: none or letting the token pick its algorithm, not validating exp, aud and iss,
                      algorithm confusion between HMAC and public keys, long expiries with no revocation plan, putting
                      sensitive data in the readable payload, and storing tokens in localStorage.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is IDOR / broken object-level authorization, and how do you prevent it?</>,
                a: (
                  <>
                    <p>
                      Returning an object by ID after checking only that the user is logged in, so changing the ID
                      exposes someone else's data. Scope every query to the current user or tenant (WHERE id = ? AND
                      customer_id = ?), return 404 when not found, and back it up with row-level security.
                    </p>
                  </>
                ),
              },
              {
                q: <>How does refresh-token rotation detect theft?</>,
                a: (
                  <>
                    <p>
                      Each refresh returns a new refresh token and invalidates the old one. If an already-used token is
                      presented again, two parties hold it — so the server revokes the whole token family and forces
                      re-login.
                    </p>
                  </>
                ),
              },
            ]}
          />
        </Section>

        <Section id="key-takeaways" title="Key Takeaways" kind="takeaways">
          <ul>
            <li>
              <strong>Authentication</strong> = who you are. <strong>Authorization</strong> = what you can do. Being
              logged in <strong>doesn't</strong> grant access to every object.
            </li>
            <li>
              Store passwords with <strong>Argon2id, scrypt or bcrypt</strong>, rate-limit logins, and add{" "}
              <strong>MFA</strong>. <strong>Passkeys</strong> are the strongest, phishing-resistant option.
            </li>
            <li>
              <strong>Server sessions</strong> in <code>HttpOnly; Secure; SameSite</code> cookies are simple and
              instantly revocable, the best default for first-party web apps.
            </li>
            <li>
              <strong>JWTs</strong> are signed, not encrypted. Pin the algorithm, validate <code>exp</code>/
              <code>aud</code>/<code>iss</code>, keep them <strong>short-lived</strong>, and use{" "}
              <strong>rotating refresh tokens</strong> for revocation. Don't store them in <code>localStorage</code>.
            </li>
            <li>
              Check <strong>object-level authorization</strong> on every request (to prevent IDOR). Choose{" "}
              <strong>RBAC, ABAC or ReBAC</strong> to fit your sharing model, and apply <strong>least privilege</strong>{" "}
              to users and services.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              OWASP Cheat Sheet Series: Authentication, Password Storage, Session Management, Authorization, CSRF
              Prevention, and JSON Web Token cheat sheets
            </li>
            <li>NIST Special Publication 800-63B (Digital Identity Guidelines: Authentication)</li>
            <li>RFC 7519 (JSON Web Token) and RFC 8725 (JWT Best Current Practices)</li>
            <li>RFC 6265 (HTTP cookies) and MDN's guide to using HTTP cookies</li>
            <li>The Google paper "Zanzibar: Google's Consistent, Global Authorization System" (USENIX ATC 2019)</li>
            <li>The W3C WebAuthn specification and the passkeys.dev developer resource</li>
            <li>The Open Policy Agent documentation</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
