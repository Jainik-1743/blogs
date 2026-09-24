import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import { Compare, Flow, Layers, QA } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-51")!;

export const metadata: Metadata = {
  title: `Lesson 51 — ${lesson.title}`,
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

export default function SdLessonFiveOnePage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>Three breaches from the same imaginary company:</p>
          <ol>
            <li>
              An attacker gets onto the office Wi-Fi and reads traffic between two internal services. It wasn't
              encrypted, because "it's inside our network".
            </li>
            <li>
              A backup of the customer database is left in a misconfigured storage bucket. It wasn't encrypted, so every
              name, phone number and address leaks.
            </li>
            <li>
              A developer pushes code to a public GitHub repo with <code>DB_PASSWORD=Sup3rS3cret!</code> in a config
              file. Within minutes, automated bots find it and log into production.
            </li>
          </ol>
          <p>
            None of these needed a genius hacker. They needed <strong>missing encryption</strong> and{" "}
            <strong>badly handled secrets</strong>. For system designers, the question isn't "how does AES work
            mathematically?". It's{" "}
            <strong>
              where data is encrypted, who holds the keys, and how secrets are stored, delivered and rotated.
            </strong>
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about a <strong>bank</strong>.
          </p>
          <ul>
            <li>
              <strong>Encryption in transit</strong> is the <strong>armoured van</strong> that moves cash between
              branches. Even if someone stops the van, they can't get at the money.
            </li>
            <li>
              <strong>Encryption at rest</strong> is the <strong>locked vault</strong>. If someone breaks into the
              building, the cash is still locked away.
            </li>
            <li>
              <strong>Keys</strong> are the vault combinations. A vault is only as safe as its combination. If you write
              the combination on a sticky note on the vault door, the vault is useless.
            </li>
            <li>
              <strong>Secrets management</strong> is how the bank <strong>stores, hands out, changes and tracks</strong>{" "}
              those combinations: only the right people get them, only when needed, they're changed regularly, and every
              use is logged.
            </li>
          </ul>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <hr />
          <h3 id="part-1-the-building-blocks-in-plain-words">Part 1: The building blocks (in plain words)</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tool</th>
                  <th>What it does</th>
                  <th>Example use</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Symmetric encryption</strong> (AES-256-GCM, ChaCha20-Poly1305)
                  </td>
                  <td>One key locks and unlocks. Very fast</td>
                  <td>Encrypting files, database fields, TLS session data</td>
                </tr>
                <tr>
                  <td>
                    <strong>Asymmetric encryption</strong> (RSA, elliptic curves)
                  </td>
                  <td>Public key locks, private key unlocks; slower</td>
                  <td>Key exchange in TLS, encrypting a key for someone</td>
                </tr>
                <tr>
                  <td>
                    <strong>Digital signatures</strong> (ECDSA, Ed25519, RSA)
                  </td>
                  <td>Private key signs, public key verifies</td>
                  <td>JWTs (post 49), software updates, certificates</td>
                </tr>
                <tr>
                  <td>
                    <strong>Hashing</strong> (SHA-256)
                  </td>
                  <td>One-way fingerprint; can't be reversed</td>
                  <td>Checksums, file integrity</td>
                </tr>
                <tr>
                  <td>
                    <strong>Password hashing</strong> (Argon2id, bcrypt)
                  </td>
                  <td>Deliberately slow, salted hashing</td>
                  <td>Storing passwords (post 49)</td>
                </tr>
                <tr>
                  <td>
                    <strong>HMAC</strong>
                  </td>
                  <td>A keyed hash, proving a message wasn't altered and came from someone with the key</td>
                  <td>Webhook signatures (post 34), API request signing</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>Key point: encoding ≠ encryption ≠ hashing.</strong>
          </p>
          <ul>
            <li>
              <strong>Base64 is encoding</strong>. Anyone can decode it, so it's <strong>not</strong> security.
            </li>
            <li>
              <strong>Encryption</strong> can be reversed <strong>with the key</strong>.
            </li>
            <li>
              <strong>Hashing</strong> can't be reversed at all.
            </li>
          </ul>
          <p>
            <strong>Use authenticated encryption</strong> (like AES-GCM), which protects both <strong>secrecy</strong>{" "}
            and <strong>integrity</strong>, so tampering is detected.
          </p>
          <p>
            <strong>Don't roll your own crypto.</strong> Use well-reviewed libraries (like libsodium or Google Tink, or
            your platform's standard crypto library) and managed services. Most real crypto failures come from{" "}
            <strong>misuse</strong>: reusing nonces, weak random numbers, hard-coded keys, or home-made schemes. Very
            few come from breaking the algorithms.
          </p>
          <hr />
          <h3 id="part-2-encryption-in-transit">Part 2: Encryption in transit</h3>
          <p>
            <strong>Use TLS everywhere.</strong> It's not just between users and your load balancer (post 3), but also:
          </p>
          <ul>
            <li>between the load balancer and app servers (re-encryption),</li>
            <li>between services,</li>
            <li>between apps and databases, caches and message brokers,</li>
            <li>between data centres and clouds.</li>
          </ul>
          <p>
            The old idea of "inside our network, so it's safe" has been replaced by <strong>zero trust</strong>: assume
            the internal network may be compromised, and <strong>authenticate and encrypt every connection</strong>.
          </p>
          <p>
            <strong>mTLS (mutual TLS).</strong> With normal TLS, only the <strong>server</strong> proves its identity.
            With <strong>mTLS</strong>, <strong>both sides</strong> present certificates, so service A knows it's really
            talking to service B, and B knows the caller is really A.
          </p>
          <Compare
            caption="TLS proves the server; mTLS proves both sides."
            columns={[
              {
                title: <>Normal TLS</>,
                items: [
                  { sign: "·", text: <>Client asks “who are you?”</> },
                  { sign: "·", text: <>Server shows its certificate ✅</> },
                  { sign: "-", text: <>The server can't cryptographically tell which client is calling</> },
                ],
                verdict: <>Browsers talking to websites</>,
              },
              {
                title: <>Mutual TLS (mTLS)</>,
                items: [
                  { sign: "·", text: <>Client shows a certificate ✅</> },
                  { sign: "·", text: <>Server shows a certificate ✅</> },
                  { sign: "+", text: <>Both sides authenticated and encrypted</> },
                ],
                verdict: <>Service-to-service traffic, often automated by a service mesh</>,
              },
            ]}
          />
          <p>Managing certificates for hundreds of services by hand is painful, so:</p>
          <ul>
            <li>
              <strong>service meshes</strong> (Istio, Linkerd) automatically give each service a certificate, rotate it
              often, and enforce mTLS between sidecars (post 13),
            </li>
            <li>
              <strong>workload identity systems</strong> (like SPIFFE/SPIRE) issue short-lived identities to services.
            </li>
          </ul>
          <p>
            <strong>Certificate management:</strong>
          </p>
          <ul>
            <li>
              <strong>automate renewal</strong> (ACME / Let's Encrypt, cloud certificate managers),
            </li>
            <li>
              <strong>monitor expiry dates</strong>. Expired certificates are a classic outage (post 40),
            </li>
            <li>
              use <strong>modern TLS versions</strong> (TLS 1.2 at minimum, TLS 1.3 preferred) and disable old, weak
              ones.
            </li>
          </ul>
          <hr />
          <h3 id="part-3-encryption-at-rest">Part 3: Encryption at rest</h3>
          <p>
            <strong>Layers of encryption at rest:</strong>
          </p>
          <Layers
            caption="Layers of encryption at rest. Each protects against a different leak."
            layers={[
              {
                name: <>4 · Application / field-level</>,
                tech: <>Aadhaar, PAN, card numbers, health data</>,
                desc: <>protects fields even from DB admins and DB dumps</>,
              },
              { name: <>3 · Database (TDE)</>, tech: <>data files and backups</>, desc: <>protects stolen DB files</> },
              {
                name: <>2 · Storage / volume / bucket</>,
                tech: <>disks, snapshots, objects</>,
                desc: <>protects stolen disks and snapshots</>,
              },
              {
                name: <>1 · Physical disk</>,
                tech: <>drive-level encryption</>,
                desc: <>protects hardware that walks out the door</>,
              },
            ]}
          />
          <ul>
            <li>
              <strong>Disk, volume and bucket encryption</strong> (usually on by default in the major clouds today)
              protects against <strong>stolen or discarded hardware</strong>, and some misconfigurations.
            </li>
            <li>
              <strong>Database Transparent Data Encryption (TDE)</strong> encrypts database files and backups
              automatically.
            </li>
            <li>
              <strong>Application-level (field-level) encryption</strong> means the app encrypts sensitive fields{" "}
              <strong>before</strong> saving them, so the database only ever sees ciphertext.
            </li>
          </ul>
          <p>
            <strong>Important:</strong> disk, volume and database encryption are <strong>transparent</strong>. Anyone
            who can <strong>query</strong> the database (an attacker with stolen app credentials, or an SQL injection,
            post 52) sees <strong>decrypted</strong> data. They mainly protect against{" "}
            <strong>physical theft and some storage leaks</strong>. For the most sensitive data, add{" "}
            <strong>field-level encryption</strong>, <strong>tokenisation</strong>, and strict{" "}
            <strong>access control</strong>.
          </p>
          <p>
            <strong>Tokenisation</strong> replaces sensitive data (like a card number) with a{" "}
            <strong>meaningless token</strong> (<code>tok_9f3a…</code>). The real value is stored in a separate, highly
            protected <strong>vault</strong>. Most of your systems only handle tokens, so a breach of them reveals
            nothing useful. That's how payment providers keep merchants out of the scope of card-data regulations (PCI
            DSS).
          </p>
          <p>
            <strong>Backups must be encrypted too</strong> (post 45), and their keys must be available during a
            disaster, but <strong>not</strong> to an attacker.
          </p>
          <hr />
          <h3 id="part-4-key-management-and-envelope-encryption">Part 4: Key management and envelope encryption</h3>
          <p>
            Encryption moves the problem from "protect the data" to "<strong>protect the keys</strong>". Keys should:
          </p>
          <ul>
            <li>
              <strong>never</strong> be hard-coded in source code,
            </li>
            <li>
              be stored in a <strong>Key Management Service (KMS)</strong> or a{" "}
              <strong>Hardware Security Module (HSM)</strong>, which is special hardware designed so keys can't be
              extracted,
            </li>
            <li>
              have <strong>strict access control</strong> and <strong>audit logs</strong> of every use,
            </li>
            <li>
              be <strong>rotated</strong> regularly.
            </li>
          </ul>
          <p>
            <strong>Envelope encryption</strong> is how KMS systems (AWS KMS, Google Cloud KMS, Azure Key Vault,
            HashiCorp Vault) work at scale:
          </p>
          <SequenceDiagram
            caption="Envelope encryption. The master key never leaves KMS; data is encrypted locally with a throwaway data key."
            actors={["App", "KMS", "Storage"]}
            messages={[
              { from: 0, to: 0, label: <>generate a random data key (DEK)</> },
              { from: 0, to: 0, label: <>encrypt the record with the DEK (AES-GCM)</> },
              { from: 0, to: 1, label: <>encrypt this DEK with the master key</> },
              { from: 1, to: 0, label: <>encrypted DEK</>, reply: true },
              { from: 0, to: 2, label: <>store encrypted data + encrypted DEK</> },
              {
                from: 0,
                to: 0,
                label: <>To read — send the encrypted DEK to KMS, which checks permissions and logs the request</>,
                divider: true,
              },
              { from: 0, to: 1, label: <>decrypt DEK</> },
              { from: 1, to: 0, label: <>plain DEK</>, note: <>used once in memory, then discarded</>, reply: true },
            ]}
          />
          <Flow
            caption="Why envelope encryption scales. KMS only ever handles tiny keys."
            nodes={[
              { title: <>KMS / HSM</>, desc: <>master key — never leaves, every use audited</> },
              {
                title: <>Each record</>,
                desc: <>encrypted_data + encrypted_DEK, stored together</>,
                label: <>encrypts and decrypts small data keys only</>,
              },
              {
                title: <>Rotation</>,
                desc: <>re-wrap data keys with a new master key — no need to re-encrypt terabytes</>,
                tone: "good",
              },
            ]}
          />
          <p>
            <strong>Why it's clever:</strong>
          </p>
          <ul>
            <li>
              <strong>Huge data never goes to KMS</strong>, only tiny keys, so it's fast and cheap.
            </li>
            <li>
              <strong>Rotating the master key</strong> means re-encrypting the small DEKs,{" "}
              <strong>not all your data</strong>.
            </li>
            <li>
              <strong>Access to KMS is controlled and logged</strong>, so you can see exactly which service decrypted
              what, and cut off access instantly.
            </li>
            <li>
              <strong>Crypto-shredding:</strong> delete the key, and the data encrypted with it becomes unreadable.
              That's useful for "delete my data" requests and for retiring old backups.
            </li>
          </ul>
          <hr />
          <h3 id="part-5-end-to-end-encryption-e2ee">Part 5: End-to-end encryption (E2EE)</h3>
          <p>
            With <strong>end-to-end encryption</strong>, data is encrypted <strong>on the sender's device</strong> and
            only decrypted <strong>on the recipient's device</strong>. The{" "}
            <strong>server in the middle can't read it at all</strong>.
          </p>
          <Compare
            caption="Where the plaintext exists."
            columns={[
              {
                title: <>TLS only</>,
                items: [
                  { sign: "·", text: <>Phone A ═TLS═► Server ═TLS═► Phone B</> },
                  { sign: "-", text: <>The server can read every message</> },
                ],
                verdict: <>Most web apps and APIs</>,
              },
              {
                title: <>End-to-end encryption</>,
                items: [
                  { sign: "·", text: <>Phone A ═══ encrypted blob ═══► Phone B</> },
                  { sign: "+", text: <>The server only relays what it can't read</> },
                  { sign: "-", text: <>No server-side search, moderation or easy multi-device recovery</> },
                ],
                verdict: <>WhatsApp, Signal, iMessage</>,
              },
            ]}
          />
          <ul>
            <li>
              ✅ The strongest privacy. Even the service provider, or anyone who breaches it, can't read messages.
            </li>
            <li>
              ❌ <strong>Server-side features become hard:</strong> search, spam filtering, content moderation, backups
              and multi-device sync all need special designs.
            </li>
            <li>
              ❌ <strong>Key management moves to users' devices.</strong> If a user loses all their devices and backups,
              their messages may be gone.
            </li>
          </ul>
          <hr />
          <h3 id="part-6-secrets-management">Part 6: Secrets management</h3>
          <p>
            <strong>What counts as a secret:</strong>
          </p>
          <ul>
            <li>database passwords,</li>
            <li>API keys (payment, SMS and email providers),</li>
            <li>OAuth client secrets (post 50),</li>
            <li>JWT signing keys (post 49),</li>
            <li>TLS private keys,</li>
            <li>encryption keys,</li>
            <li>webhook signing secrets,</li>
            <li>cloud access keys.</li>
          </ul>
          <p>
            <strong>Anti-patterns (all very common):</strong>
          </p>
          <ul>
            <li>
              ❌ secrets <strong>in source code</strong> or committed config files (even in private repos),
            </li>
            <li>
              ❌ secrets baked into <strong>Docker images</strong>,
            </li>
            <li>
              ❌ secrets printed in <strong>logs</strong>, CI output or error messages,
            </li>
            <li>
              ❌ secrets shared over <strong>chat or email</strong>,
            </li>
            <li>
              ❌ <strong>one shared admin key</strong> used by every service and every engineer,
            </li>
            <li>
              ❌ <strong>long-lived secrets</strong> that are never rotated.
            </li>
          </ul>
          <p>
            <strong>Better: a secrets manager.</strong> Store secrets in a dedicated, encrypted, access-controlled,
            audited system:
          </p>
          <ul>
            <li>
              <strong>HashiCorp Vault</strong> (or its open-source fork OpenBao),
            </li>
            <li>
              <strong>AWS Secrets Manager / Parameter Store</strong>, <strong>Google Secret Manager</strong>,{" "}
              <strong>Azure Key Vault</strong>,
            </li>
            <li>
              <strong>Kubernetes Secrets</strong>. ⚠️ By default, these are only <strong>base64-encoded</strong> in
              etcd, not encrypted. Enable <strong>encryption at rest</strong> for etcd, restrict access with RBAC, and
              consider the <strong>External Secrets Operator</strong> (to sync from a cloud secrets manager),{" "}
              <strong>Sealed Secrets</strong>, or <strong>SOPS</strong> for secrets stored in Git.
            </li>
          </ul>
          <p>
            Apps fetch secrets <strong>at runtime</strong>. They're injected as files or environment variables by the
            platform, or read through the secrets manager's API.
          </p>
          <p>
            <strong>Best: avoid long-lived secrets entirely.</strong>
          </p>
          <ul>
            <li>
              <strong>Workload identity / IAM roles:</strong> your service runs with an <strong>identity</strong>{" "}
              granted by the platform (like an AWS IAM role for a pod or VM), and gets{" "}
              <strong>short-lived credentials automatically</strong>. There are no keys in configuration at all.
            </li>
            <li>
              <strong>Dynamic secrets:</strong> tools like Vault can create a{" "}
              <strong>unique database username and password for each app instance</strong>, valid for an hour, then
              delete it automatically.
            </li>
            <li>
              <strong>OIDC federation from CI/CD:</strong> instead of storing cloud keys in GitHub Actions or GitLab,
              the CI job presents a short-lived OIDC token, and the cloud exchanges it for temporary credentials.
            </li>
          </ul>
          <p>
            <strong>Rotation and revocation.</strong>
          </p>
          <ul>
            <li>
              <strong>Rotate secrets regularly</strong>, and <strong>immediately</strong> when someone leaves or a leak
              is suspected.
            </li>
            <li>
              <strong>Design apps to handle rotation without downtime.</strong> For example, accept{" "}
              <strong>both</strong> old and new keys during a transition window, and reload secrets without restarting.
            </li>
            <li>
              <strong>Keep an inventory:</strong> which secrets exist, who owns them, what uses them, and when they were
              last rotated.
            </li>
          </ul>
          <p>
            <strong>Detect leaks early.</strong>
          </p>
          <ul>
            <li>
              <strong>Pre-commit hooks and CI scanners</strong> (gitleaks, trufflehog, detect-secrets) block commits
              containing secrets.
            </li>
            <li>
              <strong>GitHub secret scanning and push protection</strong> detect known key formats and can block pushes.
              Many providers (like cloud and payment companies) automatically revoke their keys when they're found in
              public repos.
            </li>
          </ul>
          <p>
            <strong>If a secret leaks, respond in this order:</strong>
          </p>
          <ol>
            <li>
              <strong>Revoke or rotate it immediately.</strong> Deleting the commit isn't enough; it's in Git history
              and in scrapers' copies.
            </li>
            <li>
              <strong>Check logs</strong> for any use of the leaked secret.
            </li>
            <li>
              <strong>Assess and contain</strong> any damage.
            </li>
            <li>
              <strong>Clean up</strong> the repository history if needed.
            </li>
            <li>
              <strong>Do a blameless postmortem</strong> (post 48) and add the controls that would have prevented it.
            </li>
          </ol>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Encryption everywhere:</strong> strong protection, at a small CPU and latency cost (usually
              negligible with modern hardware and TLS 1.3), plus certificate and key management work.
            </li>
            <li>
              <strong>Field-level encryption:</strong> protects the most sensitive data even from database access, but
              makes <strong>searching, sorting and indexing</strong> those fields hard, and adds complexity.
            </li>
            <li>
              <strong>End-to-end encryption:</strong> maximum privacy, but limits server-side features and makes account
              recovery harder.
            </li>
            <li>
              <strong>Managed KMS and secrets managers:</strong> secure, audited and convenient, but cost money and add
              a dependency. <strong>Cache</strong> secrets and data keys carefully, so a KMS blip doesn't take you down.
            </li>
            <li>
              <strong>Short-lived, dynamic credentials:</strong> a tiny window for attackers, but more moving parts, and
              they require platform support.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Uber (2016).</strong> Attackers found{" "}
            <strong>cloud access credentials in a private code repository</strong> used by Uber engineers, then used
            them to access stored data on tens of millions of riders and drivers. The incident, and the company's
            handling of it, led to major fines and legal consequences. It's the textbook case for{" "}
            <strong>never storing secrets in code</strong>, even in private repositories.
          </p>
          <p>
            <strong>Toyota (2022).</strong> Toyota disclosed that an access key for a customer-data server had been{" "}
            <strong>publicly visible on GitHub for about five years</strong>, after a contractor accidentally published
            source code. It shows why <strong>automated secret scanning</strong> matters.
          </p>
          <p>
            <strong>Heartbleed (2014).</strong> A bug in the widely used OpenSSL library let attackers read chunks of
            server memory, potentially including <strong>private TLS keys</strong> and passwords. Huge numbers of
            websites had to patch, <strong>revoke and reissue certificates</strong>, and rotate secrets. It showed how
            important <strong>key rotation</strong> and <strong>dependency updates</strong> are (post 52).
          </p>
          <p>
            <strong>WhatsApp and Signal.</strong> WhatsApp completed its rollout of{" "}
            <strong>end-to-end encryption</strong> for all messages in 2016, using the <strong>Signal Protocol</strong>,
            which was developed by the team behind the Signal messaging app. Billions of people now use E2EE daily
            without noticing.
          </p>
          <p>
            <strong>Payment tokenisation.</strong> When an online store saves "your card ending in 4242", it usually
            stores a <strong>token</strong> from its payment provider, not the card number. The provider holds the real
            data in a highly secured vault, which keeps the store's systems out of most card-security audits.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>Why encrypt traffic inside your own network?</>,
                a: (
                  <>
                    <p>
                      Because “inside” isn't safe: compromised hosts, misconfigured networks, shared cloud
                      infrastructure and insiders can all read plaintext. Zero-trust networking encrypts and
                      authenticates every hop, typically with mTLS between services.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is envelope encryption?</>,
                a: (
                  <>
                    <p>
                      Data is encrypted locally with a random data key; the data key is then encrypted by a master key
                      held in a KMS or HSM, and stored alongside the data. The master key never leaves the KMS, access
                      to it is permissioned and audited, and rotation only re-wraps small keys.
                    </p>
                  </>
                ),
              },
              {
                q: <>When do you need field-level encryption on top of disk encryption?</>,
                a: (
                  <>
                    <p>
                      When some fields are sensitive enough that database admins, backups, analytics copies or a
                      SQL-injection dump must not reveal them — national IDs, card numbers, health data. Disk and
                      database encryption only protect against stolen media.
                    </p>
                  </>
                ),
              },
              {
                q: <>Where should application secrets live?</>,
                a: (
                  <>
                    <p>
                      In a secrets manager (Vault, AWS Secrets Manager, GCP Secret Manager), delivered at runtime to
                      authorised workloads via their platform identity — never in code, images or git. Prefer
                      short-lived, dynamically generated credentials, rotate regularly, and audit access.
                    </p>
                  </>
                ),
              },
              {
                q: <>A secret was pushed to a public repository. What do you do?</>,
                a: (
                  <>
                    <p>
                      Treat it as compromised immediately: revoke and rotate it first (deleting the commit isn't enough
                      — bots scan within minutes), check audit logs for misuse, then remove it from history and add
                      pre-commit and CI secret scanning.
                    </p>
                  </>
                ),
              },
              {
                q: <>What's the trade-off of end-to-end encryption?</>,
                a: (
                  <>
                    <p>
                      The server can't read messages, which protects users against server breaches and insiders — but it
                      also can't search, moderate, back up or sync content in plaintext, so multi-device support and key
                      recovery need careful protocol design.
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
              Use the right tool: <strong>AES-GCM</strong> for data, <strong>public-key crypto</strong> for key exchange
              and signatures, <strong>HMAC</strong> for message integrity, and <strong>Argon2id/bcrypt</strong> for
              passwords. <strong>Base64 is not encryption</strong>, and <strong>don't roll your own crypto</strong>.
            </li>
            <li>
              <strong>Encrypt in transit everywhere</strong> (TLS, <strong>mTLS</strong> between services, zero trust)
              and automate certificate renewal and monitoring.
            </li>
            <li>
              <strong>Encrypt at rest</strong> in layers. Transparent disk and database encryption{" "}
              <strong>doesn't</strong> stop someone who can query the database, so add{" "}
              <strong>field-level encryption</strong> or <strong>tokenisation</strong> for sensitive data.
            </li>
            <li>
              Protect keys with <strong>KMS/HSM</strong> and <strong>envelope encryption</strong>, which gives cheap
              rotation, audit logs and crypto-shredding.
            </li>
            <li>
              Keep secrets <strong>out of code, images and logs</strong>. Use a <strong>secrets manager</strong>, prefer{" "}
              <strong>workload identity and short-lived credentials</strong>, <strong>rotate</strong> regularly,{" "}
              <strong>scan</strong> for leaks, and <strong>revoke immediately</strong> if one leaks.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              OWASP Cheat Sheet Series: Cryptographic Storage, Transport Layer Security, Secrets Management, and Key
              Management cheat sheets
            </li>
            <li>
              The AWS KMS documentation on envelope encryption, and Google Cloud's "Encryption at rest" documentation
            </li>
            <li>The HashiCorp Vault documentation</li>
            <li>The Kubernetes documentation "Good practices for Kubernetes Secrets"</li>
            <li>
              <em>Serious Cryptography</em> (2nd edition) by Jean-Philippe Aumasson
            </li>
            <li>The Signal Protocol technical documentation</li>
            <li>The gitleaks and SOPS projects on GitHub</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
