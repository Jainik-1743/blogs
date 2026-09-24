import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Compare, QA, Stats } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-52")!;

export const metadata: Metadata = {
  title: `Lesson 52 — ${lesson.title}`,
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

const code1 = `GET /api/accounts/1002/statement           ← logged in as account 1001… and it works 😱
PATCH /api/users/1001  {"role": "admin"}   ← the server blindly saves "role" (mass assignment)`;

const code2 = `// ❌ Vulnerable: input is glued into the SQL string
const q = \`SELECT * FROM users WHERE email = '\${req.body.email}'\`;
// input:  ' OR '1'='1   → query becomes: ... WHERE email = '' OR '1'='1'  → returns every user`;

export default function SdLessonFiveTwoPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            When you read about a major data breach, it's rarely a cinematic "genius hacker breaks unbreakable
            encryption" story. It's usually something like:
          </p>
          <ul>
            <li>an API that returned any customer's record if you changed the ID in the URL,</li>
            <li>a login form that let a crafted input run database commands,</li>
            <li>a server that was months behind on a security patch,</li>
            <li>a cloud server tricked into revealing its own access credentials.</li>
          </ul>
          <p>
            The same few mistakes appear again and again. The <strong>OWASP Top 10</strong> is a list of the most
            critical, most common web application security risks, published by <strong>OWASP</strong> (the Open
            Worldwide Application Security Project), a non-profit community. For backend developers and system
            designers, it's the best checklist to start with.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think of the OWASP Top 10 as the <strong>most common ways houses get burgled</strong>:
          </p>
          <ul>
            <li>
              the back door was left unlocked (<strong>broken access control</strong>),
            </li>
            <li>
              a stranger was let in because they said "I'm from the gas company" (<strong>injection</strong>: trusting
              input),
            </li>
            <li>
              the lock was an old model with a known weakness (<strong>vulnerable components</strong>),
            </li>
            <li>
              the spare key was under the doormat (<strong>misconfiguration</strong>),
            </li>
            <li>
              the alarm wasn't connected, so nobody noticed for weeks (<strong>logging and monitoring failures</strong>
              ).
            </li>
          </ul>
          <p>
            Burglars don't pick the hardest target. They check the <strong>common weak spots</strong>. Fix those first,
            and most attacks fail.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <Stats
            caption="The OWASP Top 10 (2021) at a glance."
            stats={[
              { value: <>A01</>, label: <>Broken access control</>, sub: <>the most common — check every object</> },
              { value: <>A02</>, label: <>Cryptographic failures</>, sub: <>plaintext, weak algorithms, bad keys</> },
              { value: <>A03</>, label: <>Injection</>, sub: <>SQL, command, NoSQL, XSS</> },
              { value: <>A04</>, label: <>Insecure design</>, sub: <>missing threat modelling and limits</> },
              {
                value: <>A05–A06</>,
                label: <>Misconfiguration, outdated components</>,
                sub: <>defaults, open buckets, old libraries</>,
              },
              {
                value: <>A07–A10</>,
                label: <>Auth failures, integrity, logging, SSRF</>,
                sub: <>the rest of the list</>,
              },
            ]}
          />
          <p>
            The list below follows the <strong>OWASP Top 10 (2021 edition)</strong>, which is still widely used in
            training and audits. OWASP also published an updated <strong>2025 edition</strong> that reorganises some
            categories. For example, software supply chain problems get their own category, and a new category covers
            mishandling of errors and exceptional conditions. The ideas below still apply, but{" "}
            <strong>check the official OWASP site for the current list and numbering</strong> before publishing or
            auditing against it.
          </p>
          <hr />
          <h3 id="a01-broken-access-control">A01: Broken Access Control</h3>
          <p>
            <strong>What it is:</strong> users can do or see things they shouldn't:
          </p>
          <ul>
            <li>
              reading other users' data by changing an ID (<strong>IDOR</strong>, post 49),
            </li>
            <li>calling admin endpoints as a normal user,</li>
            <li>
              modifying a price or <code>role</code> field in a request,
            </li>
            <li>accessing another tenant's data in a SaaS app.</li>
          </ul>
          <p>
            <strong>It's the #1 risk</strong> in the 2021 list.
          </p>
          <CodeBlock lang="http" code={code1} />
          <p>
            <strong>Fixes:</strong>
          </p>
          <ul>
            <li>
              <strong>Check authorisation on every request, for every object</strong>, on the server. Never trust the
              client.
            </li>
            <li>
              <strong>Deny by default.</strong> Endpoints require explicit permissions.
            </li>
            <li>
              <strong>Scope queries</strong> to the current user or tenant (<code>WHERE tenant_id = ?</code>), and
              consider database row-level security.
            </li>
            <li>
              <strong>Allow-list the fields</strong> users can update, to avoid "mass assignment" (users setting{" "}
              <code>role</code>, <code>price</code> or <code>is_verified</code>).
            </li>
            <li>
              Use hard-to-guess IDs as an <strong>extra</strong> layer, but{" "}
              <strong>never as the only protection</strong>.
            </li>
            <li>
              <strong>Test access control</strong> with automated tests ("user A cannot read user B's order").
            </li>
          </ul>
          <hr />
          <h3 id="a02-cryptographic-failures">A02: Cryptographic Failures</h3>
          <p>
            <strong>What it is:</strong> sensitive data isn't properly protected:
          </p>
          <ul>
            <li>sent over plain HTTP,</li>
            <li>stored unencrypted,</li>
            <li>passwords hashed with MD5 or SHA-1,</li>
            <li>weak or hard-coded keys,</li>
            <li>old TLS versions (post 51).</li>
          </ul>
          <p>
            <strong>Fixes:</strong>
          </p>
          <ul>
            <li>
              <strong>HTTPS everywhere</strong>, with HSTS, and TLS between internal services.
            </li>
            <li>
              <strong>Encrypt sensitive data at rest</strong>, with field-level encryption or tokenisation for the most
              sensitive data.
            </li>
            <li>
              <strong>Argon2id, bcrypt or scrypt</strong> for passwords (post 49).
            </li>
            <li>
              <strong>Keys in a KMS or secrets manager</strong>, and rotated (post 51).
            </li>
            <li>
              <strong>Don't store what you don't need.</strong> Data you never collect can't leak.
            </li>
          </ul>
          <hr />
          <h3 id="a03-injection">A03: Injection</h3>
          <p>
            <strong>What it is:</strong> untrusted input is treated as <strong>code or commands</strong>: SQL, NoSQL, OS
            commands, LDAP, and template injection. (The 2021 edition also groups{" "}
            <strong>cross-site scripting (XSS)</strong> here.)
          </p>
          <p>
            <strong>SQL injection example:</strong>
          </p>
          <CodeBlock lang="js" code={code2} />
          <Compare
            caption="Injection, and its one reliable fix."
            columns={[
              {
                title: <>❌ String-built SQL</>,
                items: [
                  { sign: "-", text: <>Input is glued into the query text</> },
                  { sign: "-", text: <>' OR '1'='1 turns the WHERE into “always true”</> },
                  { sign: "-", text: <>Returns every user — or worse, runs DROP TABLE</> },
                ],
              },
              {
                title: <>✅ Parameterised query</>,
                items: [
                  { sign: "+", text: <>The query and the data travel separately</> },
                  { sign: "+", text: <>Input is always treated as data, never as SQL</> },
                  { sign: "+", text: <>The same principle applies to OS commands, LDAP, NoSQL and templates</> },
                ],
              },
            ]}
          />
          <p>
            <strong>Fixes:</strong>
          </p>
          <ul>
            <li>
              <strong>Parameterised queries and prepared statements</strong>, always. ORMs do this by default, but be
              careful with "raw query" features.
            </li>
            <li>
              <strong>Never build shell commands from input.</strong> Use safe library APIs, or strict allow-lists.
            </li>
            <li>
              <strong>Validate input</strong> (type, length, format, allowed values), and <strong>encode output</strong>{" "}
              for its context (HTML, URL, JavaScript) to prevent XSS. Modern frameworks (React, Angular, template
              engines) escape by default, so be careful with "raw HTML" features.
            </li>
            <li>
              <strong>Least-privilege database accounts:</strong> the app's DB user shouldn't be able to{" "}
              <code>DROP</code> tables.
            </li>
          </ul>
          <hr />
          <h3 id="a04-insecure-design">A04: Insecure Design</h3>
          <p>
            <strong>What it is:</strong> the <strong>design itself</strong> is unsafe, even if the code is written
            perfectly. For example:
          </p>
          <ul>
            <li>a password reset that relies on easily guessed "security questions",</li>
            <li>no limits on how many coupons one account can redeem,</li>
            <li>a checkout that trusts the price sent from the browser,</li>
            <li>no rate limit on OTP attempts.</li>
          </ul>
          <p>
            <strong>Fixes:</strong>
          </p>
          <ul>
            <li>
              <strong>Threat modelling</strong> during design: ask "how could this feature be abused?" before building
              it.
            </li>
            <li>
              <strong>Secure design patterns:</strong> server-side price calculation, rate limits (post 43), idempotency
              (post 34), and step-up authentication for sensitive actions.
            </li>
            <li>
              <strong>Abuse-case tests</strong> alongside normal test cases.
            </li>
          </ul>
          <hr />
          <h3 id="a05-security-misconfiguration">A05: Security Misconfiguration</h3>
          <p>
            <strong>What it is:</strong> insecure settings:
          </p>
          <ul>
            <li>default passwords left unchanged,</li>
            <li>public storage buckets,</li>
            <li>debug mode or detailed stack traces in production,</li>
            <li>unnecessary open ports, admin panels exposed to the internet,</li>
            <li>
              permissive CORS (<code>Access-Control-Allow-Origin: *</code> with credentials),
            </li>
            <li>missing security headers.</li>
          </ul>
          <p>
            <strong>Fixes:</strong>
          </p>
          <ul>
            <li>
              <strong>Hardened, repeatable configuration</strong> through <strong>infrastructure as code</strong>,
              reviewed like application code.
            </li>
            <li>
              <strong>Disable</strong> debug mode, directory listings and default accounts in production.
            </li>
            <li>
              <strong>Private by default</strong>: storage buckets, databases and admin tools aren't public (post 17).
            </li>
            <li>
              <strong>Security headers:</strong> <code>Content-Security-Policy</code>,{" "}
              <code>Strict-Transport-Security</code>, <code>X-Content-Type-Options: nosniff</code>, and{" "}
              <code>frame-ancestors</code> (or <code>X-Frame-Options</code>).
            </li>
            <li>
              <strong>Automated configuration scanning</strong> (cloud security posture tools, Kubernetes policy tools).
            </li>
          </ul>
          <hr />
          <h3 id="a06-vulnerable-and-outdated-components">A06: Vulnerable and Outdated Components</h3>
          <p>
            <strong>What it is:</strong> using libraries, frameworks, operating systems or containers with{" "}
            <strong>known vulnerabilities</strong>. Modern apps contain hundreds of dependencies, and one bad one is
            enough.
          </p>
          <p>
            <strong>Fixes:</strong>
          </p>
          <ul>
            <li>
              <strong>Know what you run:</strong> keep a <strong>software bill of materials (SBOM)</strong> listing
              every component.
            </li>
            <li>
              <strong>Automated dependency scanning</strong> (Dependabot, Renovate, Snyk, OSV-Scanner) and{" "}
              <strong>container image scanning</strong>.
            </li>
            <li>
              <strong>Patch quickly</strong>, especially for critical, actively exploited vulnerabilities. Have a
              process to deploy urgent patches within hours or days.
            </li>
            <li>
              <strong>Remove unused dependencies</strong>, and prefer well-maintained ones.
            </li>
          </ul>
          <hr />
          <h3 id="a07-identification-and-authentication-failures">A07: Identification and Authentication Failures</h3>
          <p>
            <strong>What it is:</strong> weak login and session handling:
          </p>
          <ul>
            <li>allowing weak or breached passwords,</li>
            <li>
              no protection against <strong>credential stuffing</strong> (attackers trying leaked username/password
              pairs from other sites),
            </li>
            <li>no MFA,</li>
            <li>session IDs in URLs,</li>
            <li>sessions that never expire,</li>
            <li>predictable reset tokens.</li>
          </ul>
          <p>
            <strong>Fixes (post 49):</strong>
          </p>
          <ul>
            <li>
              <strong>MFA</strong> and <strong>passkeys</strong>; breached-password checks.
            </li>
            <li>
              <strong>Rate limiting</strong> and bot detection on login, OTP and password reset endpoints (post 43).
            </li>
            <li>
              <strong>Secure session cookies</strong> (<code>HttpOnly</code>, <code>Secure</code>, <code>SameSite</code>
              ), <strong>session expiry</strong>, and <strong>new session IDs after login</strong>.
            </li>
            <li>
              <strong>Single-use, short-lived, random</strong> reset tokens.
            </li>
            <li>
              <strong>Use a proven identity provider</strong> or library instead of building auth from scratch.
            </li>
          </ul>
          <hr />
          <h3 id="a08-software-and-data-integrity-failures">A08: Software and Data Integrity Failures</h3>
          <p>
            <strong>What it is:</strong> trusting code or data <strong>without verifying it</strong>:
          </p>
          <ul>
            <li>installing unverified updates or plugins,</li>
            <li>insecure CI/CD pipelines,</li>
            <li>
              <strong>deserialising</strong> untrusted data into objects (which can lead to remote code execution in
              some languages),
            </li>
            <li>webhooks accepted without checking signatures.</li>
          </ul>
          <p>
            This includes <strong>supply-chain attacks</strong>, where attackers compromise a dependency or build system
            to reach many victims at once.
          </p>
          <p>
            <strong>Fixes:</strong>
          </p>
          <ul>
            <li>
              <strong>Verify signatures</strong> on artefacts and updates, and <strong>sign</strong> your own builds
              (for example with Sigstore). Follow frameworks like <strong>SLSA</strong> for build integrity.
            </li>
            <li>
              <strong>Lock dependency versions</strong> (lockfiles), use trusted registries, and review new
              dependencies.
            </li>
            <li>
              <strong>Protect CI/CD:</strong> least-privilege tokens, protected branches, required code reviews, and
              OIDC instead of long-lived cloud keys (post 51).
            </li>
            <li>
              <strong>Avoid unsafe deserialisation.</strong> Use simple data formats (JSON) with schema validation.
            </li>
            <li>
              <strong>Verify webhook signatures</strong> (HMAC, post 34).
            </li>
          </ul>
          <hr />
          <h3 id="a09-security-logging-and-monitoring-failures">A09: Security Logging and Monitoring Failures</h3>
          <p>
            <strong>What it is:</strong> attacks happen, and <strong>nobody notices</strong>, or there are no logs to
            investigate afterwards. Breaches often go undetected for months.
          </p>
          <p>
            <strong>Fixes (posts 46–48):</strong>
          </p>
          <ul>
            <li>
              <strong>Log security events:</strong> logins (success and failure), password and MFA changes, permission
              changes, access denials, admin actions and high-value transactions.
            </li>
            <li>
              <strong>Centralise logs</strong>, protect them from tampering, and keep them long enough to investigate.
            </li>
            <li>
              <strong>Alert</strong> on suspicious patterns: spikes in failed logins, access from unusual locations,
              mass data exports.
            </li>
            <li>
              <strong>Never log secrets or sensitive data</strong> (post 51).
            </li>
            <li>
              <strong>Have an incident response plan</strong>, and practise it (post 48).
            </li>
          </ul>
          <hr />
          <h3 id="a10-server-side-request-forgery-ssrf">A10: Server-Side Request Forgery (SSRF)</h3>
          <p>
            <strong>What it is:</strong> the attacker makes <strong>your server</strong> send requests to places it
            shouldn't. For example, a "fetch image from URL" feature is abused to request{" "}
            <strong>internal services</strong> or the <strong>cloud metadata endpoint</strong>, which can return{" "}
            <strong>temporary cloud credentials</strong>.
          </p>
          <SequenceDiagram
            caption="SSRF — making your own server fetch a URL it should never reach."
            actors={["Attacker", "Your API", "Cloud metadata (169.254.169.254)"]}
            messages={[
              {
                from: 0,
                to: 1,
                label: (
                  <>
                    POST /preview-link &#123;url:{" "}
                    <a href="http://169.254.169.254/…/credentials}" target="_blank" rel="noopener noreferrer">
                      http://169.254.169.254/…/credentials&#125;
                    </a>
                  </>
                ),
              },
              { from: 1, to: 2, label: <>GET — from inside your network</> },
              { from: 2, to: 1, label: <>temporary IAM credentials</>, reply: true },
              { from: 1, to: 0, label: <>“link preview” containing the keys 😱</>, reply: true },
              {
                from: 0,
                to: 0,
                label: (
                  <>
                    Fix — allow-list destinations, block private and metadata IPs, require IMDSv2, and give the server
                    minimal IAM rights
                  </>
                ),
                divider: true,
              },
            ]}
          />
          <p>
            <strong>Fixes:</strong>
          </p>
          <ul>
            <li>
              <strong>Allow-list</strong> the destinations your server may fetch (domains and schemes).
            </li>
            <li>
              <strong>Block private and internal IP ranges</strong>, including <code>169.254.169.254</code>, localhost
              and internal subnets, <strong>after DNS resolution</strong>. Also re-check after redirects.
            </li>
            <li>
              Use <strong>IMDSv2</strong> on AWS (session-based metadata access), or the equivalent protections on other
              clouds.
            </li>
            <li>
              Run URL-fetching features in an <strong>isolated network</strong> or service with no access to internal
              systems.
            </li>
            <li>
              Give servers <strong>least-privilege cloud roles</strong>, so stolen credentials can do little.
            </li>
          </ul>
          <hr />
          <h3 id="beyond-the-top-10-apis">Beyond the Top 10: APIs</h3>
          <p>
            OWASP also publishes an <strong>API Security Top 10</strong>, which matters a lot for backend and mobile
            systems. Its top risks include:
          </p>
          <ul>
            <li>
              <strong>broken object-level authorisation</strong> (IDOR),
            </li>
            <li>
              <strong>broken authentication</strong>,
            </li>
            <li>
              <strong>broken object property-level authorisation</strong> (exposing or allowing edits to fields users
              shouldn't touch),
            </li>
            <li>
              <strong>unrestricted resource consumption</strong> (no rate limits, no pagination limits, posts 34 and
              43),
            </li>
            <li>
              <strong>broken function-level authorisation</strong> (normal users calling admin functions).
            </li>
          </ul>
          <h3 id="building-security-into-the-process">Building security into the process</h3>
          <ul>
            <li>
              <strong>Design:</strong> threat modelling ("what could go wrong?") for new features and architectures.
            </li>
            <li>
              <strong>Code:</strong> secure defaults, frameworks that escape output and parameterise queries, and{" "}
              <strong>code review</strong>.
            </li>
            <li>
              <strong>CI/CD:</strong> static analysis (SAST), dependency and secret scanning, container scanning, and
              infrastructure-as-code checks.
            </li>
            <li>
              <strong>Testing:</strong> dynamic scanning (DAST), security unit tests, and{" "}
              <strong>penetration testing</strong> for important systems.
            </li>
            <li>
              <strong>Production:</strong> a WAF (web application firewall) as an <strong>extra</strong> layer (not a
              replacement for fixing code), monitoring, and a <strong>bug bounty or responsible-disclosure</strong>{" "}
              programme.
            </li>
            <li>
              <strong>People:</strong> training (for example, the free PortSwigger Web Security Academy labs), clear
              security ownership, and blameless incident reviews.
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Security controls add friction:</strong> MFA, reviews, scanning and patching take time. But fixing
              a breach costs far more, in money, trust and legal consequences.
            </li>
            <li>
              <strong>Automated scanners</strong> catch known issues cheaply, but produce false positives and miss logic
              flaws (like broken access control). You need <strong>both</strong> tools and human review.
            </li>
            <li>
              <strong>WAFs</strong> give quick protection against common attacks, but can be bypassed and can block
              legitimate traffic. They're a <strong>safety net, not a fix</strong>.
            </li>
            <li>
              <strong>Fast patching</strong> reduces exposure, but risks breaking changes. Good tests and staged
              rollouts (Part 10) make fast patching safe.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Equifax (2017).</strong> Attackers exploited a{" "}
            <strong>known vulnerability in the Apache Struts web framework</strong>, a flaw for which a patch had been
            available for about two months. Personal data of around <strong>147 million people</strong> was exposed.
            It's the classic example of <strong>A06: Vulnerable and Outdated Components</strong>.
          </p>
          <p>
            <strong>Capital One (2019).</strong> An attacker used an <strong>SSRF</strong> weakness, made possible by a
            misconfigured web application firewall, to reach the cloud <strong>metadata service</strong>, obtain
            temporary credentials, and read data from storage buckets. Around <strong>100 million</strong> customers in
            the US and Canada were affected. It's a textbook <strong>A10: SSRF</strong> case, and a big reason cloud
            providers pushed stronger metadata protections like IMDSv2.
          </p>
          <p>
            <strong>MOVEit (2023).</strong> A <strong>SQL injection</strong> vulnerability in the MOVEit Transfer
            file-sharing software was exploited by a ransomware group to steal data from{" "}
            <strong>thousands of organisations</strong> worldwide, including governments, banks and airlines. It shows
            that injection is still a top threat decades after it was first understood.
          </p>
          <p>
            <strong>Log4Shell (2021).</strong> A critical flaw in <strong>Log4j</strong>, a Java logging library used
            almost everywhere, let attackers run code on servers just by getting a specially crafted string logged.
            Organisations worldwide scrambled to <strong>find where Log4j was used</strong>, and that's exactly why{" "}
            <strong>SBOMs</strong> and dependency inventories matter.
          </p>
          <p>
            <strong>Supply-chain attacks: SolarWinds (2020) and the xz backdoor (2024).</strong> Attackers compromised
            SolarWinds' build system and shipped malicious updates to thousands of customers, including government
            agencies. In 2024, a backdoor was discovered in the widely used <strong>xz</strong> compression library,
            planted over years by a contributor who had gained maintainers' trust. It was caught by a Microsoft
            engineer, Andres Freund, who noticed SSH logins were slightly slower than expected. Both are{" "}
            <strong>A08: integrity failures</strong> that pushed the industry towards signed builds, SLSA and closer
            scrutiny of dependencies.
          </p>
          <p>
            <strong>Optus (2022).</strong> Australian telecom Optus suffered a breach affecting millions of current and
            former customers. It was widely reported to involve an{" "}
            <strong>API endpoint that returned customer data without proper authentication</strong>, a painful example
            of <strong>broken access control</strong> in APIs.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>What is the most common web vulnerability today, and how do you prevent it?</>,
                a: (
                  <>
                    <p>
                      Broken access control — especially object-level authorization (IDOR) and mass assignment. Check
                      ownership or permission for every object on every request, deny by default, allow-list which
                      fields a client may set, and test authorization explicitly.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you prevent SQL injection?</>,
                a: (
                  <>
                    <p>
                      Use parameterised queries or prepared statements everywhere (an ORM does this if you don't bypass
                      it), validate input types, and run the database user with least privilege. Never build SQL by
                      concatenating strings.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is SSRF, and why is it dangerous in the cloud?</>,
                a: (
                  <>
                    <p>
                      Server-side request forgery tricks your server into fetching an attacker-chosen URL from inside
                      your network — for example the instance metadata endpoint, which can hand out credentials.
                      Allow-list destinations, block private and link-local ranges, require IMDSv2 and minimise the
                      server's IAM permissions.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you protect against vulnerable dependencies?</>,
                a: (
                  <>
                    <p>
                      Keep an SBOM, scan dependencies continuously (Dependabot, Snyk, osv), patch quickly, pin versions
                      and verify integrity, remove unused packages, and watch for supply-chain attacks such as
                      typosquatting and compromised maintainers.
                    </p>
                  </>
                ),
              },
              {
                q: <>What are the classic XSS defences?</>,
                a: (
                  <>
                    <p>
                      Context-aware output encoding (modern frameworks do this by default — avoid bypasses like
                      dangerouslySetInnerHTML), sanitising any HTML you must render, a strict Content-Security-Policy,
                      and HttpOnly cookies so a successful XSS can't steal sessions.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you build security into the development process?</>,
                a: (
                  <>
                    <p>
                      Threat-model new designs, use secure defaults and shared libraries, run SAST, DAST and dependency
                      scanning in CI, do security-focused code review, keep security logging with alerts, and run
                      regular penetration tests and bug bounties.
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
              The <strong>OWASP Top 10</strong> lists the most common, critical web risks. Most breaches exploit these{" "}
              <strong>basic</strong> weaknesses, not exotic ones. (Check the latest edition. The 2025 update reorganises
              some categories.)
            </li>
            <li>
              <strong>Access control</strong> (A01) is the top risk: check{" "}
              <strong>every object on every request</strong>, deny by default, and allow-list updatable fields.
            </li>
            <li>
              <strong>Injection</strong> is prevented with <strong>parameterised queries</strong>, input validation and
              output encoding. <strong>SSRF</strong> is prevented with allow-lists, blocked internal IPs and IMDSv2.
            </li>
            <li>
              Keep <strong>components patched</strong> (SBOMs, scanners), secure the{" "}
              <strong>supply chain and CI/CD</strong> (signing, lockfiles, OIDC), and avoid{" "}
              <strong>misconfigurations</strong> with infrastructure as code and private-by-default settings.
            </li>
            <li>
              <strong>Log and monitor security events</strong>, practise incident response, and build security into{" "}
              <strong>design, code review, CI/CD and testing</strong>, not just a final audit.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>The official OWASP Top 10 (the 2021 edition, and the newer 2025 edition)</li>
            <li>The OWASP API Security Top 10</li>
            <li>
              The OWASP Cheat Sheet Series (SQL Injection Prevention, SSRF Prevention, Input Validation, and Cross-Site
              Scripting Prevention cheat sheets)
            </li>
            <li>The OWASP Application Security Verification Standard (ASVS)</li>
            <li>The PortSwigger Web Security Academy (free, hands-on labs for each vulnerability type)</li>
            <li>The SLSA framework and the OSV vulnerability database</li>
          </ul>
          <p>
            <em>
              This wraps up Part 9. Next up, Part 10: Architecture &amp; Deployment, starting with "Monolith vs
              Microservices: An Honest Comparison".
            </em>
          </p>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
