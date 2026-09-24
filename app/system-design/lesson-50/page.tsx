import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { QA } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-50")!;

export const metadata: Metadata = {
  title: `Lesson 50 — ${lesson.title}`,
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

const code1 = `{
  "iss": "https://accounts.google.com",
  "sub": "110169484474386276334",      ← stable, unique user ID at this provider
  "aud": "your-client-id",
  "exp": 1803000000,
  "iat": 1802996400,
  "nonce": "n-0S6_WzA2Mj",
  "email": "asha@example.com",
  "email_verified": true,
  "name": "Asha Kulkarni"
}`;

export default function SdLessonFiveZeroPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            A photo-printing website wants to print photos from your Google Photos. In the bad old days, it would ask
            for your <strong>Google password</strong>. That meant:
          </p>
          <ul>
            <li>the printing site could read your email, delete your files, and change your password,</li>
            <li>
              if the printing site got hacked, <strong>your whole Google account</strong> was exposed,
            </li>
            <li>
              the only way to stop it was to <strong>change your password</strong>, which also broke every other app.
            </li>
          </ul>
          <p>
            Today you click "Sign in with Google" or "Allow access to your photos", approve a screen listing{" "}
            <strong>exactly</strong> what's being shared, and never type your Google password anywhere else. That's{" "}
            <strong>OAuth 2.0</strong> (for granting access) and <strong>OpenID Connect</strong> (for logging in).
          </p>
          <p>
            They're behind almost every "Continue with Google/Apple/Microsoft/GitHub" button, and most modern API
            security. They're also widely <strong>misunderstood</strong> and <strong>misused</strong>.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think of a <strong>valet key</strong> for a car.
          </p>
          <ul>
            <li>
              You give the valet a <strong>special key</strong> that can{" "}
              <strong>start the car and drive it a short distance</strong>, but{" "}
              <strong>can't open the boot or the glovebox</strong>.
            </li>
            <li>
              The valet never gets your <strong>main key</strong>.
            </li>
            <li>
              You can <strong>take the valet key back</strong> at any time.
            </li>
          </ul>
          <p>
            <strong>OAuth 2.0</strong> is a system for handing out <strong>valet keys (access tokens)</strong> to apps:
          </p>
          <ul>
            <li>
              <strong>limited</strong> in what they can do (scopes),
            </li>
            <li>
              <strong>limited in time</strong> (expiry),
            </li>
            <li>
              <strong>revocable</strong>,
            </li>
            <li>
              and <strong>without sharing your password</strong>.
            </li>
          </ul>
          <p>
            <strong>OpenID Connect (OIDC)</strong> adds an <strong>ID card</strong> on top: a standard way for the app
            to learn <strong>who you are</strong>, so it can log you in.
          </p>
          <blockquote>
            <p>
              <strong>OAuth 2.0 = authorization ("this app may access these things").</strong>
              <strong>OpenID Connect = authentication ("this person is Asha, verified by Google").</strong>
            </p>
          </blockquote>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="the-four-roles">The four roles</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Who it is</th>
                  <th>Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Resource owner</strong>
                  </td>
                  <td>The user who owns the data</td>
                  <td>You</td>
                </tr>
                <tr>
                  <td>
                    <strong>Client</strong>
                  </td>
                  <td>The app that wants access</td>
                  <td>The photo-printing website</td>
                </tr>
                <tr>
                  <td>
                    <strong>Authorization server</strong>
                  </td>
                  <td>Issues tokens after the user approves</td>
                  <td>Google's login and consent service</td>
                </tr>
                <tr>
                  <td>
                    <strong>Resource server</strong>
                  </td>
                  <td>The API holding the data</td>
                  <td>The Google Photos API</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3 id="key-terms">Key terms</h3>
          <ul>
            <li>
              <strong>Access token:</strong> the "valet key" the client sends to the API (
              <code>Authorization: Bearer &lt;token&gt;</code>). It's short-lived (minutes to an hour).
            </li>
            <li>
              <strong>Refresh token:</strong> used to get new access tokens without asking the user again. It's
              long-lived, stored securely, and revocable (post 49).
            </li>
            <li>
              <strong>Scopes:</strong> <strong>what</strong> the token allows, such as <code>photos.read</code>,{" "}
              <code>calendar.readonly</code> or <code>repo:status</code>.{" "}
              <strong>Request the fewest scopes you need.</strong>
            </li>
            <li>
              <strong>Consent:</strong> the screen where the user approves the requested scopes.
            </li>
            <li>
              <strong>Redirect URI:</strong> where the authorization server sends the user back after approval. It{" "}
              <strong>must be pre-registered</strong> and exactly matched.
            </li>
            <li>
              <strong>Client ID / client secret:</strong> identify the app. <strong>Confidential clients</strong>{" "}
              (server-side apps) can keep a secret. <strong>Public clients</strong> (mobile apps, single-page apps){" "}
              <strong>can't</strong>, because anything in their code can be extracted.
            </li>
          </ul>
          <h3 id="the-main-flow-authorization-code-pkce">The main flow: Authorization Code + PKCE</h3>
          <p>
            This is <strong>the recommended flow for almost every app</strong>: server-side web apps, single-page apps
            and mobile apps.
          </p>
          <SequenceDiagram
            caption="Authorization Code + PKCE — the recommended flow for almost every app. The code travels through the browser; tokens never do."
            actors={["User", "Client app", "Auth server", "API"]}
            messages={[
              { from: 0, to: 1, label: <>Connect Google Photos</> },
              { from: 1, to: 1, label: <>code_verifier (random), code_challenge = SHA256(verifier)</> },
              { from: 1, to: 0, label: <>redirect to /authorize · scope, state, code_challenge</>, reply: true },
              { from: 0, to: 2, label: <>log in + approve “photos.read”</> },
              { from: 2, to: 0, label: <>redirect back · code=ABC123&amp;state=xyz</>, reply: true },
              { from: 0, to: 1, label: <>?code=ABC123&amp;state=xyz</> },
              { from: 1, to: 1, label: <>check state == xyz</> },
              { from: 1, to: 2, label: <>POST /token · code + code_verifier</> },
              {
                from: 2,
                to: 1,
                label: <>access token (+ refresh, id_token)</>,
                note: <>SHA256(verifier) matched</>,
                reply: true,
              },
              { from: 1, to: 3, label: <>GET /photos · Bearer access token</> },
              { from: 3, to: 1, label: <>photos ✅</>, reply: true },
            ]}
          />
          <p>
            <strong>Why the two-step "code, then token" dance?</strong> The authorization <strong>code</strong> travels
            through the browser (in the redirect URL), which is a risky place. It's{" "}
            <strong>short-lived, single-use</strong>, and useless on its own. The <strong>tokens</strong> are fetched in
            a separate, direct request from the client to the authorization server.
          </p>
          <p>
            <strong>What PKCE adds.</strong> PKCE (Proof Key for Code Exchange, pronounced "pixy") protects against an
            attacker who <strong>steals the authorization code</strong>, for example through a malicious app registered
            for the same redirect scheme on a phone.
          </p>
          <ul>
            <li>
              The client creates a random{" "}
              <strong>
                <code>code_verifier</code>
              </strong>{" "}
              and sends only its <strong>hash</strong> (<code>code_challenge</code>) at the start.
            </li>
            <li>
              To swap the code for tokens, the client must present the <strong>original verifier</strong>.
            </li>
            <li>
              An attacker with only the stolen code <strong>can't</strong> complete the exchange.
            </li>
          </ul>
          <p>
            PKCE was first designed for mobile apps, but is now <strong>recommended for all clients</strong>, including
            server-side ones.
          </p>
          <p>
            <strong>
              What <code>state</code> does.
            </strong>{" "}
            The <code>state</code> parameter is a random value the client generates and checks when the user comes back.
            It stops <strong>CSRF-style attacks</strong>, where an attacker tricks your app into accepting{" "}
            <em>their</em> authorization code and linking <em>their</em> account.
          </p>
          <h3 id="client-credentials-machine-to-machine">Client Credentials: machine-to-machine</h3>
          <p>
            When <strong>no user</strong> is involved, for example a backend service calling another company's API, or
            one internal service calling another:
          </p>
          <SequenceDiagram
            caption="Client Credentials — machine to machine, no user involved."
            actors={["Service A", "Auth server", "API"]}
            messages={[
              { from: 0, to: 1, label: <>POST /token · grant_type=client_credentials, scope=reports.read</> },
              {
                from: 1,
                to: 0,
                label: <>access token</>,
                note: <>authenticated by secret, private-key JWT or mTLS</>,
                reply: true,
              },
              { from: 0, to: 2, label: <>GET /reports · Bearer …</> },
              { from: 2, to: 0, label: <>200 OK</>, reply: true },
            ]}
          />
          <p>
            The service authenticates as <strong>itself</strong>. Keep its secret safe (post 51), or better, use
            private-key JWT client authentication or mTLS instead of a shared secret.
          </p>
          <h3 id="device-authorization-flow">Device Authorization flow</h3>
          <p>
            This is for devices with <strong>no browser or keyboard</strong>, like smart TVs, game consoles and
            command-line tools:
          </p>
          <SequenceDiagram
            caption="The Device Authorization flow — how you log in on a TV."
            actors={["TV", "Auth server", "Your phone"]}
            messages={[
              { from: 0, to: 1, label: <>request device code</> },
              { from: 1, to: 0, label: <>user code WDJB-MJHT + verification URL</>, reply: true },
              { from: 0, to: 0, label: <>show “go to example.com/activate, enter WDJB-MJHT”</> },
              { from: 2, to: 1, label: <>enter code, log in, approve</> },
              { from: 0, to: 1, label: <>poll: approved yet?</> },
              { from: 1, to: 0, label: <>access + refresh tokens</>, reply: true },
            ]}
          />
          <p>That's why you log into streaming apps on a TV by typing a short code on your phone.</p>
          <h3 id="deprecated-flows-don-t-use-these">Deprecated flows: don't use these</h3>
          <ul>
            <li>
              <strong>Implicit flow:</strong> tokens were returned directly in the browser URL. This leaked tokens
              through history, logs and referrer headers. It's replaced by <strong>Authorization Code + PKCE</strong>.
            </li>
            <li>
              <strong>Resource Owner Password Credentials:</strong> the app collects the user's{" "}
              <strong>password</strong> and sends it to the auth server. That defeats the whole point of OAuth. Don't
              use it.
            </li>
          </ul>
          <p>
            The <strong>OAuth 2.0 Security Best Current Practice (RFC 9700)</strong> and the upcoming{" "}
            <strong>OAuth 2.1</strong> consolidate these rules: PKCE for everyone, no implicit or password grants, exact
            redirect URI matching, and short-lived, sender-constrained or rotating tokens.
          </p>
          <h3 id="access-token-formats">Access token formats</h3>
          <ul>
            <li>
              <strong>Opaque tokens:</strong> random strings. The API must ask the authorization server "is this token
              valid, and what are its scopes?" (called <strong>token introspection</strong>). They're easy to revoke,
              but add a call per request (which can be cached).
            </li>
            <li>
              <strong>JWT access tokens:</strong> self-contained and signed (post 49). The API{" "}
              <strong>verifies them locally</strong> using the authorization server's public keys (from its{" "}
              <strong>JWKS</strong> endpoint). That's fast, but revocation relies on <strong>short expiry</strong>.
            </li>
          </ul>
          <p>
            <strong>The API must validate every token:</strong>
          </p>
          <ul>
            <li>
              the <strong>signature</strong> (for JWTs),
            </li>
            <li>
              <strong>expiry</strong> (<code>exp</code>),
            </li>
            <li>
              <strong>issuer</strong> (<code>iss</code>): is it from <em>our</em> authorization server?
            </li>
            <li>
              <strong>audience</strong> (<code>aud</code>): was it issued <em>for this API</em>? A token meant for
              another API must be rejected.
            </li>
            <li>
              <strong>scopes</strong>: does this token allow <em>this</em> action?
            </li>
          </ul>
          <h3 id="openid-connect-adding-login">OpenID Connect: adding login</h3>
          <p>
            OAuth alone doesn't tell the client <strong>who the user is</strong>. An access token is meant for the{" "}
            <strong>API</strong>, not for the client to read. Early "Login with X" features misused access tokens for
            identity, causing security bugs. <strong>OpenID Connect (OIDC)</strong> fixes this.
          </p>
          <p>
            <strong>What OIDC adds:</strong>
          </p>
          <ul>
            <li>
              <strong>
                The <code>openid</code> scope:
              </strong>{" "}
              asking for it means "I want to log the user in".
            </li>
            <li>
              <strong>The ID token:</strong> a <strong>JWT for the client</strong>, describing the authenticated user:
            </li>
          </ul>
          <CodeBlock lang="json" code={code1} />
          <ul>
            <li>
              <strong>
                The <code>userinfo</code> endpoint:
              </strong>{" "}
              fetches more profile details using the access token.
            </li>
            <li>
              <strong>Discovery:</strong> a standard URL (<code>/.well-known/openid-configuration</code>) lists the
              provider's endpoints, supported features and <strong>JWKS</strong> keys, so libraries can configure
              themselves automatically.
            </li>
            <li>
              <strong>
                The <code>nonce</code>:
              </strong>{" "}
              a random value the client sends and then checks in the ID token, to prevent replay attacks.
            </li>
          </ul>
          <p>
            <strong>ID token vs access token:</strong>
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>ID token</th>
                  <th>Access token</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Purpose</td>
                  <td>
                    Tells the <strong>client</strong> who logged in
                  </td>
                  <td>
                    Lets the client call an <strong>API</strong>
                  </td>
                </tr>
                <tr>
                  <td>
                    Audience (<code>aud</code>)
                  </td>
                  <td>The client app</td>
                  <td>The API (resource server)</td>
                </tr>
                <tr>
                  <td>Who reads it</td>
                  <td>The client</td>
                  <td>The API</td>
                </tr>
                <tr>
                  <td>Send it to APIs?</td>
                  <td>❌ No</td>
                  <td>✅ Yes</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>
              Identify users by <code>iss</code> + <code>sub</code>, not by email.
            </strong>{" "}
            Emails can change, and the same email might exist at different providers.
          </p>
          <h3 id="security-checklist">Security checklist</h3>
          <ul>
            <li>
              ✅ Use <strong>Authorization Code + PKCE</strong> (and <code>state</code>, and <code>nonce</code> for
              OIDC).
            </li>
            <li>
              ✅ <strong>Register exact redirect URIs</strong>, with no wildcards. Open redirects are a classic
              token-stealing hole.
            </li>
            <li>
              ✅ Request <strong>minimal scopes</strong>. Ask for more only when the user actually needs the feature
              ("incremental consent").
            </li>
            <li>
              ✅ Keep <strong>access tokens short-lived</strong>. <strong>Rotate refresh tokens</strong> and store them
              securely.
            </li>
            <li>
              ✅ <strong>Validate every token</strong>: signature, <code>exp</code>, <code>iss</code>, <code>aud</code>{" "}
              and scopes.
            </li>
            <li>
              ✅ For single-page apps, prefer a <strong>BFF</strong> (post 13) that keeps tokens on the server, giving
              the browser only an <code>HttpOnly</code> session cookie.
            </li>
            <li>
              ✅ Protect <strong>client secrets</strong>, or avoid them with private-key JWT or mTLS client
              authentication.
            </li>
            <li>
              ✅ Let users <strong>see and revoke</strong> connected apps.
            </li>
            <li>
              ✅ <strong>Use a well-tested library or identity provider.</strong> Don't hand-roll OAuth.
            </li>
          </ul>
          <h3 id="build-or-buy">Build or buy?</h3>
          <p>
            Running your own authorization server means handling login, MFA, passkeys, account recovery, token signing,
            key rotation, consent, security patches and compliance. Most teams use:
          </p>
          <ul>
            <li>
              <strong>managed identity providers:</strong> Auth0/Okta, Microsoft Entra ID, AWS Cognito, Google Identity
              Platform, Firebase Auth, Clerk,
            </li>
            <li>
              <strong>open-source servers:</strong> <strong>Keycloak</strong>, Ory, Authentik, Zitadel,
            </li>
            <li>
              <strong>social login:</strong> Google, Apple, Microsoft, GitHub.
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>OAuth/OIDC:</strong> no password sharing, fine-grained scopes, revocable access and SSO. But the
              flows are complex, redirects and tokens are easy to misconfigure, and you depend on the identity provider.
            </li>
            <li>
              <strong>Opaque tokens:</strong> easy revocation and hidden contents, but an introspection call per
              request. <strong>JWT access tokens:</strong> fast local checks, but revocation relies on short expiry.
            </li>
            <li>
              <strong>Social login:</strong> fewer passwords and less friction, but you depend on external providers,
              and some users don't want to link accounts.
            </li>
            <li>
              <strong>Managed IdP:</strong> fast, secure and full-featured, but costs money and adds vendor lock-in.{" "}
              <strong>Self-hosted (Keycloak):</strong> full control, but you own the operations and security patching.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>"Sign in with Google / Apple / Microsoft."</strong> These buttons use{" "}
            <strong>OpenID Connect</strong>. The app receives an ID token proving who you are, and never sees your
            password. Apple's version also lets users <strong>hide their real email</strong>, giving each app a unique
            relay address.
          </p>
          <p>
            <strong>GitHub OAuth apps and fine-grained tokens.</strong> When a CI service or code-review tool asks to
            access your GitHub repositories, it uses OAuth with <strong>scopes</strong>. GitHub has also introduced{" "}
            <strong>fine-grained tokens</strong> that limit access to specific repositories and permissions, which is
            least privilege in practice.
          </p>
          <p>
            <strong>Smart TV logins.</strong> Logging into YouTube, Netflix or other apps on a TV by visiting a URL on
            your phone and entering a short code is the <strong>Device Authorization flow</strong> in action.
          </p>
          <p>
            <strong>Open banking.</strong> In many countries, open-banking regulations let third-party apps (budgeting
            tools, payment apps) access bank data or initiate payments only{" "}
            <strong>with the customer's explicit consent</strong>, using OAuth 2.0-based security profiles with strict
            extra requirements.
          </p>
          <p>
            <strong>Enterprise SSO.</strong> Companies use identity providers like Okta or Microsoft Entra ID so
            employees log in once and access Slack, email, HR tools and internal apps through OIDC or SAML. When someone
            leaves, disabling one account removes access everywhere.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>What's the difference between OAuth 2.0 and OpenID Connect?</>,
                a: (
                  <>
                    <p>
                      OAuth 2.0 is delegated authorization: a client gets a scoped, expiring access token to call an API
                      on the user's behalf. OpenID Connect adds authentication on top: the openid scope, an ID token (a
                      JWT for the client describing who logged in), a userinfo endpoint and discovery.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why use the authorization code flow instead of returning tokens directly?</>,
                a: (
                  <>
                    <p>
                      The redirect passes through the browser, where URLs leak into history, logs and referrers. A
                      short-lived, single-use code is useless alone; the client swaps it for tokens in a direct
                      back-channel request — and PKCE ensures only the client that started the flow can do so.
                    </p>
                  </>
                ),
              },
              {
                q: <>What does PKCE protect against?</>,
                a: (
                  <>
                    <p>
                      Stolen authorization codes. The client sends a hash of a random verifier at the start and must
                      present the original verifier to redeem the code, so an attacker who intercepts the code can't
                      exchange it. It's now recommended for all clients.
                    </p>
                  </>
                ),
              },
              {
                q: <>What must an API check on every access token?</>,
                a: (
                  <>
                    <p>
                      Signature (or introspection for opaque tokens), expiry, issuer (our authorization server),
                      audience (issued for this API) and scopes (allows this action).
                    </p>
                  </>
                ),
              },
              {
                q: <>ID token vs access token?</>,
                a: (
                  <>
                    <p>
                      The ID token is for the client — it proves who authenticated and is never sent to APIs. The access
                      token is for the resource server. Identify users by iss + sub, not by email.
                    </p>
                  </>
                ),
              },
              {
                q: <>Which OAuth flows should you avoid?</>,
                a: (
                  <>
                    <p>
                      The implicit flow (tokens in the browser URL) and the resource owner password grant (the app
                      collects the user's password). Both are deprecated in OAuth 2.1 in favour of Authorization Code +
                      PKCE.
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
              <strong>OAuth 2.0</strong> is <strong>delegated authorization</strong>. Apps get{" "}
              <strong>limited, expiring, revocable access tokens</strong> (with <strong>scopes</strong>) without the
              user's password.
            </li>
            <li>
              The four roles are <strong>resource owner, client, authorization server</strong> and{" "}
              <strong>resource server</strong>.
            </li>
            <li>
              Use <strong>Authorization Code + PKCE</strong> (with <code>state</code>) for user-facing apps,{" "}
              <strong>Client Credentials</strong> for machine-to-machine, and <strong>Device flow</strong> for TVs and
              CLIs. <strong>Avoid the implicit and password grants.</strong>
            </li>
            <li>
              <strong>OpenID Connect</strong> adds <strong>login</strong>: the <strong>ID token</strong> is for the
              client, the <strong>access token</strong> is for the API. Identify users by{" "}
              <strong>
                <code>iss</code> + <code>sub</code>
              </strong>
              .
            </li>
            <li>
              Validate every token (<strong>signature, exp, iss, aud, scopes</strong>), register{" "}
              <strong>exact redirect URIs</strong>, keep tokens <strong>short-lived</strong>, and{" "}
              <strong>use proven libraries or identity providers</strong>.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>RFC 6749 (The OAuth 2.0 Authorization Framework) and RFC 7636 (PKCE)</li>
            <li>RFC 9700 (OAuth 2.0 Security Best Current Practice) and the OAuth 2.1 draft</li>
            <li>The OpenID Connect Core 1.0 specification</li>
            <li>The oauth.net website (a community guide to OAuth 2.0 and 2.1)</li>
            <li>
              <em>OAuth 2.0 Simplified</em> by Aaron Parecki (also available as a free online guide)
            </li>
            <li>The Keycloak documentation (to run your own identity provider locally and experiment)</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
