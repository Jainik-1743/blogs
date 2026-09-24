import type { Metadata } from "next";
import Callout from "@/components/Callout";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Compare, Flow, QA, Stats } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-3")!;

export const metadata: Metadata = {
  title: `Lesson 3 — ${lesson.title}`,
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

const code1 = `POST /api/orders HTTP/1.1
Host: shop.example.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOi...
Content-Length: 42

{"productId": 991, "quantity": 2}`;

const code2 = `HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/orders/5521

{"id": 5521, "status": "pending"}`;

export default function SdLessonThreePage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            TCP gets bytes from one computer to another reliably. But bytes alone don't mean anything. The browser and
            the server need a shared language, a way to say things like:
          </p>
          <ul>
            <li>"Give me this page."</li>
            <li>"Here is a new order."</li>
            <li>"You're not allowed to see that."</li>
            <li>"Try again later."</li>
          </ul>
          <p>
            That language is <strong>HTTP</strong>.
          </p>
          <p>
            There's a second problem too. Your data passes through Wi-Fi routers, internet providers and many other
            networks. Anyone along the way could read your password or change the page you receive.{" "}
            <strong>HTTPS</strong> solves that by wrapping HTTP in encryption called <strong>TLS</strong>.
          </p>
          <p>
            Almost every system you design will talk HTTP. Load balancers, CDNs, caches and API gateways all depend on
            it. Using it correctly is a big part of good system design.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            HTTP is like <strong>ordering at a restaurant</strong>:
          </p>
          <ul>
            <li>
              You (the client) make a <strong>request</strong>: "One pizza, no onions, please."
            </li>
            <li>
              The waiter (the server) gives a <strong>response</strong>: "Here's your pizza" (success), "We're out of
              pizza" (not found), or "The kitchen is on fire" (server error).
            </li>
          </ul>
          <p>
            Every request says <strong>what action</strong> you want (the method) and <strong>what thing</strong> you
            want it on (the URL). Every response starts with a <strong>status code</strong> that tells you, in one
            number, how it went.
          </p>
          <p>
            HTTPS is the same conversation in a <strong>sealed, tamper-proof envelope</strong>. Only you and the
            restaurant can read it, and you've checked the restaurant's ID to make sure it's really them.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="what-an-http-request-looks-like">What an HTTP request looks like</h3>
          <p>HTTP is surprisingly readable. Here's a real request:</p>
          <CodeBlock lang="http" code={code1} />
          <ul>
            <li>
              <strong>First line:</strong> method (<code>POST</code>), path (<code>/api/orders</code>), version.
            </li>
            <li>
              <strong>Headers:</strong> extra information as <code>Key: Value</code> pairs.
            </li>
            <li>
              <strong>Blank line</strong>, then the <strong>body</strong> (the data).
            </li>
          </ul>
          <p>And the response:</p>
          <CodeBlock lang="http" code={code2} />
          <p>
            Try it yourself: <code>curl -v https://example.com</code> shows every line.
          </p>
          <h3 id="http-methods">HTTP methods</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Meaning</th>
                  <th>Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>GET</td>
                  <td>Read something</td>
                  <td>
                    <code>GET /products/991</code>
                  </td>
                </tr>
                <tr>
                  <td>POST</td>
                  <td>Create something or trigger an action</td>
                  <td>
                    <code>POST /orders</code>
                  </td>
                </tr>
                <tr>
                  <td>PUT</td>
                  <td>Replace something completely</td>
                  <td>
                    <code>PUT /users/7</code> with the full profile
                  </td>
                </tr>
                <tr>
                  <td>PATCH</td>
                  <td>Change part of something</td>
                  <td>
                    <code>PATCH /users/7</code> with <code>&#123;"city": "Pune"&#125;</code>
                  </td>
                </tr>
                <tr>
                  <td>DELETE</td>
                  <td>Remove something</td>
                  <td>
                    <code>DELETE /cart/items/3</code>
                  </td>
                </tr>
                <tr>
                  <td>HEAD</td>
                  <td>Like GET, but headers only</td>
                  <td>Check whether a file changed</td>
                </tr>
                <tr>
                  <td>OPTIONS</td>
                  <td>"What am I allowed to do here?"</td>
                  <td>Used by browsers for CORS checks</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>Three properties of methods matter a lot in system design:</p>
          <ul>
            <li>
              <strong>Safe</strong> means the method doesn't change anything on the server. GET and HEAD are safe, so
              crawlers and caches can call them freely.
            </li>
            <li>
              <strong>Idempotent</strong> means doing it once or ten times has the same result.
              <ul>
                <li>GET, PUT and DELETE are idempotent. Deleting item 3 twice still leaves item 3 deleted.</li>
                <li>
                  <strong>POST is not.</strong> Sending "create order" twice may create two orders.
                </li>
              </ul>
            </li>
            <li>
              <strong>Cacheable</strong> means the response can be stored and reused. GET responses usually are.
            </li>
          </ul>
          <p>
            <strong>Why idempotency matters:</strong> networks fail. Say your app sends "pay ₹500" and the connection
            drops before the response arrives. Did the payment go through? If the request is idempotent, you can simply
            retry it. If it's a plain POST, retrying might <strong>charge the customer twice</strong>. We'll cover how
            companies like Stripe solve this with <em>idempotency keys</em> in Part 5.
          </p>
          <h3 id="status-codes">Status codes</h3>
          <p>The first digit tells you the category:</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Range</th>
                  <th>Meaning</th>
                  <th>Think of it as</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1xx</td>
                  <td>Informational</td>
                  <td>"Hold on…"</td>
                </tr>
                <tr>
                  <td>2xx</td>
                  <td>Success</td>
                  <td>"Done!"</td>
                </tr>
                <tr>
                  <td>3xx</td>
                  <td>Redirect</td>
                  <td>"It's over there."</td>
                </tr>
                <tr>
                  <td>4xx</td>
                  <td>Client error</td>
                  <td>"You did something wrong."</td>
                </tr>
                <tr>
                  <td>5xx</td>
                  <td>Server error</td>
                  <td>"We did something wrong."</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>The ones you'll use most:</p>
          <ul>
            <li>
              <strong>200 OK:</strong> success.
            </li>
            <li>
              <strong>201 Created:</strong> a new thing was created (often with a <code>Location</code> header pointing
              to it).
            </li>
            <li>
              <strong>204 No Content:</strong> success, with nothing to return (common for DELETE).
            </li>
            <li>
              <strong>301 Moved Permanently:</strong> the URL changed forever. Browsers and search engines remember it.
            </li>
            <li>
              <strong>302 Found / 307 Temporary Redirect:</strong> go there <em>for now</em>.
            </li>
            <li>
              <strong>304 Not Modified:</strong> "your cached copy is still good", so no body needs to be sent. This
              saves lots of bandwidth.
            </li>
            <li>
              <strong>400 Bad Request:</strong> the input is broken (bad JSON, missing field).
            </li>
            <li>
              <strong>401 Unauthorized:</strong> "I don't know who you are". You need to log in.
            </li>
            <li>
              <strong>403 Forbidden:</strong> "I know who you are, but you're not allowed".
            </li>
            <li>
              <strong>404 Not Found:</strong> no such thing.
            </li>
            <li>
              <strong>409 Conflict:</strong> clashes with the current state (for example, that username is taken).
            </li>
            <li>
              <strong>429 Too Many Requests:</strong> you hit a rate limit. Slow down.
            </li>
            <li>
              <strong>500 Internal Server Error:</strong> the server's code crashed.
            </li>
            <li>
              <strong>502 Bad Gateway:</strong> a proxy or load balancer got a bad answer from the server behind it.
            </li>
            <li>
              <strong>503 Service Unavailable:</strong> overloaded or under maintenance. Try later.
            </li>
            <li>
              <strong>504 Gateway Timeout:</strong> a proxy or load balancer waited too long for the server behind it.
            </li>
          </ul>
          <p>
            When you're debugging production issues, <strong>502, 503 and 504 point to different problems</strong>:
          </p>
          <ul>
            <li>
              <strong>502:</strong> the app crashed or returned garbage.
            </li>
            <li>
              <strong>503:</strong> there are no healthy servers, or the app is overloaded.
            </li>
            <li>
              <strong>504:</strong> the app is too slow.
            </li>
          </ul>
          <h3 id="important-headers">Important headers</h3>
          <ul>
            <li>
              <strong>
                <code>Content-Type</code>:
              </strong>{" "}
              what format the body is in (<code>application/json</code>, <code>text/html</code>).
            </li>
            <li>
              <strong>
                <code>Authorization</code>:
              </strong>{" "}
              who you are (a token or credentials).
            </li>
            <li>
              <strong>
                <code>Cache-Control</code>:
              </strong>{" "}
              caching rules, for example <code>max-age=3600</code> means "you can reuse this for an hour".
            </li>
            <li>
              <strong>
                <code>ETag</code> / <code>If-None-Match</code>:
              </strong>{" "}
              a fingerprint of the content. The browser sends it back, and if nothing changed the server replies{" "}
              <code>304</code>.
            </li>
            <li>
              <strong>
                <code>Retry-After</code>:
              </strong>{" "}
              sent with 429 or 503, tells the client when to try again.
            </li>
            <li>
              <strong>
                <code>Location</code>:
              </strong>{" "}
              where the new or redirected thing is.
            </li>
            <li>
              <strong>
                <code>X-Forwarded-For</code>:
              </strong>{" "}
              added by proxies and load balancers so the app knows the real client IP.
            </li>
          </ul>
          <h3 id="http-is-stateless-and-cookies-add-memory">HTTP is stateless, and cookies add memory</h3>
          <p>Each HTTP request stands alone. The server doesn't naturally remember that you logged in a moment ago.</p>
          <p>
            <strong>Cookies</strong> fix this. The server sends <code>Set-Cookie: session=abc123</code>, and the browser
            sends <code>Cookie: session=abc123</code> with every later request to that site. We'll dig into sessions,
            cookies and tokens in the security series.
          </p>
          <h3 id="cors-in-one-paragraph">CORS in one paragraph</h3>
          <p>
            Browsers block a web page on <code>site-a.com</code> from reading responses from <code>api.site-b.com</code>{" "}
            unless <code>site-b</code> explicitly allows it. That's the <strong>same-origin policy</strong>, and it
            protects you from malicious sites reading your bank data. <strong>CORS</strong> (Cross-Origin Resource
            Sharing) is how a server says "requests from <code>site-a.com</code> are OK", using headers like{" "}
            <code>Access-Control-Allow-Origin</code>. If you've built a React frontend and a separate API, you've
            probably met a CORS error.
          </p>
          <h3 id="http-versions-1-1-2-and-3">HTTP versions: 1.1, 2 and 3</h3>
          <p>
            <strong>HTTP/1.1 (1997)</strong>
          </p>
          <ul>
            <li>
              Text-based. A connection can be reused (keep-alive), but it handles <strong>one request at a time</strong>
              .
            </li>
            <li>Browsers open about 6 connections per site to work around this.</li>
            <li>
              Developers used tricks like bundling all JS into one file and combining icons into one "sprite" image.
            </li>
          </ul>
          <p>
            <strong>HTTP/2 (2015)</strong>
          </p>
          <ul>
            <li>Binary instead of text.</li>
            <li>
              <strong>Multiplexing:</strong> many requests and responses share <strong>one connection</strong> at the
              same time.
            </li>
            <li>Headers are compressed (called HPACK).</li>
            <li>
              The problem that remains: it still runs on TCP, so one lost packet blocks <strong>all</strong> the streams
              (TCP head-of-line blocking).
            </li>
          </ul>
          <p>
            <strong>HTTP/3 (2022)</strong>
          </p>
          <ul>
            <li>
              Runs on <strong>QUIC over UDP</strong>.
            </li>
            <li>A lost packet only delays the stream it belongs to.</li>
            <li>Faster connection setup, and better on mobile networks.</li>
          </ul>
          <Compare
            caption="Three generations of HTTP. Each one removes a waiting line the previous one had."
            columns={[
              {
                title: <>HTTP/1.1 (1997)</>,
                items: [
                  { sign: "·", text: <>One request at a time per connection</> },
                  { sign: "-", text: <>Browsers open ~6 connections per site to cope</> },
                  { sign: "-", text: <>Text headers repeated on every request</> },
                ],
                verdict: <>Still everywhere; fine behind a CDN</>,
              },
              {
                title: <>HTTP/2 (2015)</>,
                items: [
                  { sign: "+", text: <>Many requests multiplexed on one connection</> },
                  { sign: "+", text: <>Binary framing and compressed headers (HPACK)</> },
                  { sign: "-", text: <>Still TCP: one lost packet stalls every stream</> },
                ],
                verdict: <>The default for most sites and APIs today</>,
              },
              {
                title: <>HTTP/3 (2022)</>,
                items: [
                  { sign: "+", text: <>Runs on QUIC over UDP</> },
                  { sign: "+", text: <>A lost packet only delays its own stream</> },
                  { sign: "+", text: <>Faster setup; survives network switches</> },
                ],
                verdict: <>Mobile users on patchy networks gain the most</>,
              },
            ]}
          />
          <hr />
          <h3 id="https-and-tls">HTTPS and TLS</h3>
          <p>
            HTTPS = HTTP + <strong>TLS</strong> (Transport Layer Security). TLS gives you three things:
          </p>
          <ol>
            <li>
              <strong>Confidentiality.</strong> Nobody in the middle can read the data.
            </li>
            <li>
              <strong>Integrity.</strong> Nobody can secretly change it on the way.
            </li>
            <li>
              <strong>Authentication.</strong> You're really talking to <code>yourbank.com</code>, not an impostor.
            </li>
          </ol>
          <h3 id="two-kinds-of-encryption-working-together">Two kinds of encryption working together</h3>
          <ul>
            <li>
              <strong>Symmetric encryption</strong> uses one shared key to lock and unlock (for example, AES). It's very
              fast. The problem: how do two strangers agree on a secret key over a public network?
            </li>
            <li>
              <strong>Asymmetric encryption</strong> uses a key pair: a public key (shared with everyone) and a private
              key (kept secret). It's slower, but solves the "strangers" problem.
            </li>
          </ul>
          <p>
            TLS uses <strong>asymmetric crypto during the handshake</strong> to safely agree on a key, then switches to{" "}
            <strong>fast symmetric encryption</strong> for the actual data.
          </p>
          <p>
            Here's an analogy. Asymmetric crypto is like a padlock that anyone can snap shut but only the owner can
            open. You use it once to send a secret code safely. From then on, you both use that code to talk quickly.
          </p>
          <h3 id="certificates-proving-who-you-are">Certificates: proving who you are</h3>
          <p>
            How do you know the public key really belongs to <code>yourbank.com</code>? Through a{" "}
            <strong>certificate</strong>. It's a digital ID card that says "this public key belongs to yourbank.com",
            signed by a trusted <strong>Certificate Authority (CA)</strong>.
          </p>
          <Flow
            caption="The chain of trust. Your browser only trusts the top of the chain; each link vouches for the next."
            nodes={[
              {
                title: <>Root CA</>,
                desc: <>pre-installed in your OS or browser — trusted by default</>,
                tone: "good",
              },
              { title: <>Intermediate CA</>, desc: <>keeps the precious root key offline</>, label: <>signs</> },
              {
                title: <>yourbank.com certificate</>,
                desc: <>contains the site's public key, domain name and expiry date</>,
                label: <>signs</>,
              },
            ]}
          />
          <p>Your browser checks:</p>
          <ul>
            <li>Is this chain signed by a CA I trust?</li>
            <li>Is the certificate expired?</li>
            <li>Does it match the domain I typed?</li>
          </ul>
          <p>If any check fails, you see a big warning page.</p>
          <h3 id="the-tls-1-3-handshake">The TLS 1.3 handshake</h3>
          <SequenceDiagram
            caption="A TLS 1.3 handshake. One round trip, then everything is encrypted."
            actors={["Browser", "Server"]}
            messages={[
              {
                from: 0,
                to: 1,
                label: <>ClientHello + key share</>,
                note: <>“I support these ciphers; here's my half of the key”</>,
              },
              { from: 1, to: 0, label: <>ServerHello + key share</>, note: <>“Here's my half”</>, reply: true },
              {
                from: 1,
                to: 0,
                label: <>Certificate + Finished</>,
                note: <>proof it owns yourbank.com's private key</>,
                reply: true,
              },
              {
                from: 0,
                to: 0,
                label: <>Both sides now compute the same session key (asymmetric → symmetric)</>,
                divider: true,
              },
              {
                from: 0,
                to: 1,
                label: <>encrypted GET /account</>,
                note: <>fast symmetric encryption (AES) from here on</>,
              },
              { from: 1, to: 0, label: <>encrypted 200 OK</>, reply: true },
            ]}
          />
          <ul>
            <li>
              <strong>TLS 1.3</strong> needs just <strong>one round trip</strong>. The older TLS 1.2 needed two.
            </li>
            <li>
              On a repeat visit, TLS 1.3 can even send data immediately ("0-RTT"). But that data could be replayed by an
              attacker, so it should only be used for safe requests like GET.
            </li>
          </ul>
          <p>
            Add it all up for a brand-new HTTPS connection over TCP: 1 round trip (TCP) + 1 round trip (TLS 1.3) + 1
            round trip (HTTP request and response) = about <strong>3 round trips</strong> before the first byte of the
            page. At 100 ms per round trip, that's 300 ms of pure waiting. This is why{" "}
            <strong>connection reuse, CDNs and HTTP/3 matter.</strong>
          </p>
          <h3 id="where-to-terminate-tls">Where to "terminate" TLS</h3>
          <p>In a real system, you choose where the encryption is removed:</p>
          <ul>
            <li>
              <strong>At the load balancer (most common).</strong> The LB decrypts traffic, reads the HTTP (so it can
              route by URL), and forwards it to the app servers. It's simpler, and certificates live in one place.
            </li>
            <li>
              <strong>Re-encrypt to the backend.</strong> The LB decrypts, then encrypts again to the app servers. This
              is safer inside your network and often required in finance and healthcare.
            </li>
            <li>
              <strong>Passthrough.</strong> The LB doesn't decrypt at all; the app servers do. The downside is that the
              LB can't see URLs or headers.
            </li>
          </ul>
          <h3 id="hsts">HSTS</h3>
          <p>
            Even with HTTPS, a user might type <code>http://yourbank.com</code>. That first plain-text request can be
            intercepted. <strong>HSTS</strong> (HTTP Strict Transport Security) is a header that tells the browser: "for
            the next year, only ever use HTTPS for this site".
          </p>
          <Stats
            caption="The latency bill for the first byte of a brand-new HTTPS page, at 100 ms per round trip."
            stats={[
              { value: <>1 RTT</>, label: <>TCP handshake</>, sub: <>100 ms</> },
              { value: <>1 RTT</>, label: <>TLS 1.3 handshake</>, sub: <>100 ms (TLS 1.2: 2 RTT)</> },
              { value: <>1 RTT</>, label: <>request + response</>, sub: <>100 ms</> },
              {
                value: <>≈ 300 ms</>,
                label: <>before the first byte</>,
                sub: <>why connection reuse, CDNs and HTTP/3 matter</>,
              },
            ]}
          />
          <Callout kind="note" label="Debugging 5xx errors">
            <p>
              <strong>502</strong> — the app crashed or sent garbage back to the proxy. <strong>503</strong> — no
              healthy servers, or the app is shedding load. <strong>504</strong> — the app answered, but too slowly for
              the proxy's timeout. Three different fixes, so return the right one.
            </p>
          </Callout>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>HTTP/2 and HTTP/3</strong> make pages faster but add complexity in servers and proxies. Some older
              tools don't support them.
            </li>
            <li>
              <strong>TLS</strong> adds a small amount of CPU cost and handshake latency. Modern hardware makes the CPU
              cost tiny; the latency is the real cost. Connection reuse mostly removes it.
            </li>
            <li>
              <strong>Terminating TLS at the load balancer</strong> is simple and lets it route smartly, but traffic
              inside your network is then unencrypted unless you re-encrypt.
            </li>
            <li>
              <strong>Long cache times</strong> (<code>Cache-Control: max-age</code>) make sites fast but make updates
              slow to reach users. Use versioned file names like <code>app.3f2a.js</code> to get both.
            </li>
            <li>
              <strong>Choosing status codes:</strong> returning <code>200</code> with{" "}
              <code>&#123;"error": "..."&#125;</code> in the body feels easy, but it breaks monitoring, caching and
              client retry logic. Use the real codes.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>"Not Secure" in Chrome.</strong> Since 2018, Chrome labels every plain HTTP page as "Not Secure".
            Combined with free certificates, this pushed most of the web to HTTPS within a few years.
          </p>
          <p>
            <strong>Let's Encrypt</strong> is a non-profit certificate authority that gives out free certificates, and
            tools like Certbot renew them automatically. It issues certificates for hundreds of millions of websites.
            Because its certificates are short-lived, automation is a must, and that's a good thing:{" "}
            <strong>expired certificates are a classic cause of outages</strong>. In February 2020, Microsoft Teams went
            down for hours because an authentication certificate expired. In December 2018, millions of O2 mobile
            customers in the UK lost data service after an expired certificate in Ericsson's network software.
          </p>
          <p>
            <strong>Stripe's API</strong> is a well-known example of good HTTP design. It uses proper status codes (
            <code>402</code> when a card is declined, <code>429</code> for rate limits), clear JSON error bodies, and an{" "}
            <code>Idempotency-Key</code> header so clients can safely retry payments.
          </p>
          <p>
            <strong>GitHub's API</strong> returns <code>ETag</code> headers. If your app sends back{" "}
            <code>If-None-Match</code> and nothing has changed, GitHub replies <code>304 Not Modified</code>, and these
            conditional requests don't count against your rate limit. It's a real example of HTTP caching saving money
            on both sides.
          </p>
          <p>
            <strong>Google and Cloudflare</strong> were early adopters of HTTP/2 and HTTP/3. Much of the traffic to
            Google services from Chrome now uses QUIC.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>What is the difference between PUT, PATCH and POST?</>,
                a: (
                  <>
                    <p>
                      PUT replaces a resource completely and is idempotent. PATCH changes part of it (not guaranteed
                      idempotent, though it often is). POST creates something or triggers an action and is not
                      idempotent, so sending it twice may create two orders.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why does idempotency matter so much?</>,
                a: (
                  <>
                    <p>
                      Networks fail after a request is sent but before the response arrives, so clients must retry
                      without knowing whether the first attempt worked. Idempotent operations can be retried safely. For
                      non-idempotent ones like payments, the client sends an idempotency key so the server can recognise
                      and dedupe the retry.
                    </p>
                  </>
                ),
              },
              {
                q: <>401 vs 403?</>,
                a: (
                  <>
                    <p>
                      401 Unauthorized means “I don't know who you are” — authenticate first. 403 Forbidden means “I
                      know who you are, and you're not allowed to do this.”
                    </p>
                  </>
                ),
              },
              {
                q: <>How does TLS use both asymmetric and symmetric encryption?</>,
                a: (
                  <>
                    <p>
                      Asymmetric cryptography (key shares plus the certificate's key pair) lets two strangers agree on a
                      shared secret and proves the server's identity. It is slow, so once the handshake is done both
                      sides switch to fast symmetric encryption like AES-GCM with that secret for the actual data.
                    </p>
                  </>
                ),
              },
              {
                q: <>Where would you terminate TLS in a web architecture, and why?</>,
                a: (
                  <>
                    <p>
                      Usually at the load balancer or CDN edge: certificates live in one place and the balancer can read
                      HTTP to route by path and header. In regulated environments you re-encrypt from the balancer to
                      the backends, and you use passthrough only when the backend itself must hold the keys.
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
              HTTP is a simple <strong>request/response</strong> language: a <strong>method + URL</strong> in the
              request, a <strong>status code + body</strong> in the response.
            </li>
            <li>
              Know which methods are <strong>safe</strong> and <strong>idempotent</strong>. That's what makes{" "}
              <strong>retries</strong> safe or dangerous.
            </li>
            <li>
              Status codes are signals for clients, caches and monitoring. <strong>502, 503 and 504</strong> point to
              different problems.
            </li>
            <li>
              <strong>HTTP/2</strong> multiplexes many requests over one connection. <strong>HTTP/3</strong> moves to
              QUIC to avoid TCP's head-of-line blocking.
            </li>
            <li>
              <strong>HTTPS = HTTP + TLS</strong>: encrypted, tamper-proof, and verified through{" "}
              <strong>certificates</strong>. TLS 1.3 needs only one round trip, and most systems terminate TLS at the
              load balancer.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>MDN Web Docs: the HTTP overview, methods, status codes, caching and CORS guides</li>
            <li>
              <em>High Performance Browser Networking</em> by Ilya Grigorik (chapter 4 on TLS, and the chapters on
              HTTP/1.1 and HTTP/2)
            </li>
            <li>RFC 9110 (HTTP semantics) and RFC 8446 (TLS 1.3)</li>
            <li>"The Illustrated TLS 1.3 Connection" (every byte of a real handshake, explained)</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
