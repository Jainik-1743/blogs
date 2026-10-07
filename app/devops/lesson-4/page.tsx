import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import CommandList from "@/components/CommandList";
import ChainOfTrust from "@/components/figures/ChainOfTrust";
import HttpVsHttps from "@/components/figures/HttpVsHttps";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import TlsHandshakeStepper from "@/components/figures/TlsHandshakeStepper";
import { getLesson, READINGS, readingHref, SERIES } from "@/lib/lessons";

const piecesReading = READINGS.find((r) => r.slug === "the-pieces")!;

const lesson = getLesson("lesson-4")!;

export const metadata: Metadata = {
  title: `Lesson 4 — ${lesson.title}`,
  description: lesson.summary,
};

/** In-page index. Each entry links to a section heading below. */
const outline = [
  { id: "concept", label: "Concept — postcard vs sealed box" },
  { id: "leak", label: "What actually leaks without HTTPS" },
  { id: "three-jobs", label: "The three jobs HTTPS does" },
  { id: "terms", label: "Key terms explained" },
  { id: "trust", label: "The chain of trust" },
  { id: "handshake", label: "The handshake, step by step" },
  { id: "options", label: "Two ways to get a free certificate" },
  { id: "real-example", label: "Real example — HTTPS on EC2" },
  { id: "nginx", label: "The Nginx config afterward" },
  { id: "errors", label: "Common errors you will hit" },
  { id: "verify", label: "Verifying it yourself" },
  { id: "limits", label: "What HTTPS does not do" },
  { id: "practice", label: "Practice task before Lesson 5" },
  { id: "conclusion", label: "Conclusion" },
];

const jobs: [string, string, string][] = [
  ["Encryption", "Nobody in between can read the data (the data is scrambled)", "Passwords and session cookies (small data the site uses to remember you are logged in) get stolen on public WiFi"],
  ["Authentication", "You are really talking to yourapp.com, not to a fake", "Someone sets up a fake WiFi hotspot, shows a fake login page and collects logins"],
  ["Integrity", "Nobody changed the data on the way", "A network adds ads to your page, or swaps a bank account number in it"],
];

const terms: [string, string][] = [
  ["SSL", "SSL (Secure Sockets Layer) is the old name and the old technology. It is no longer safe or used, but people still say “SSL certificate” out of habit."],
  ["TLS", "TLS (Transport Layer Security) is the set of rules that encrypts (scrambles) data between a browser and a server. It is what really runs today. HTTPS means HTTP carried inside TLS."],
  ["Certificate", "A certificate is a digital ID card for your domain. It proves “this server really is yourapp.com”."],
  ["CA (Certificate Authority)", "A CA (Certificate Authority) is a trusted organisation that issues certificates. Browsers come with a built-in list of CAs they trust."],
  ["Public key", "One half of a key pair. It is shared openly inside your certificate. Anyone can use it to check a proof that only the private key could make."],
  ["Private key", "The other half of the key pair. It stays secret on your server. The server uses it to prove it owns the certificate. If it leaks, someone else can pretend to be your site."],
  ["Let's Encrypt", "A free CA that issues browser-trusted certificates automatically, at no cost."],
  ["AWS ACM", "AWS Certificate Manager. A service that gives you certificates. Public certificates are free and renew by themselves when used with AWS services like ALB and CloudFront."],
];

const yes = "font-semibold text-emerald-300";
const no = "font-semibold text-red-300";

export default function LessonFourPage() {
  return (
    <article>
      <header className="mb-8 border-b border-line pb-6">
        <nav className="mb-4 font-mono text-[0.8rem] text-ink-dim" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-sky">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/${SERIES.slug}`} className="hover:text-sky">{SERIES.title}</Link>
          <span className="mx-2">/</span>
          <span>Lesson {String(lesson.number).padStart(2, "0")}</span>
        </nav>
        <p className="mb-2 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">
          Lesson 4 · {lesson.readTime} read
        </p>
        <h1 className="mb-2 text-[2.4rem] font-bold leading-tight tracking-tight text-sky max-sm:text-[2rem]">
          {lesson.title}
        </h1>
        <p className="max-w-[60ch] text-[1.15rem] text-ink-dim">{lesson.summary}</p>
      </header>

      <section className="mb-10 rounded-xl border border-line bg-bg-elev px-6 py-5" aria-labelledby="learn">
        <h2 id="learn" className="mb-2 text-[1.1rem] font-semibold text-sky">
          What you&apos;ll learn in this lesson
        </h2>
        <ol className="m-0 list-decimal pl-5 marker:text-sky">
          {outline.map((item) => (
            <li key={item.id} className="my-1">
              <a href={`#${item.id}`} className="text-ink hover:text-sky">
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </section>

      <div className="lesson">
        <h2 id="concept">Concept — postcard vs sealed box</h2>
        <p>
          HTTP (HyperText Transfer Protocol) is the set of rules that browsers and servers use to
          talk. It sends everything as <strong>plain readable text</strong>. HTTPS is HTTP made
          safe.
        </p>
        <ul>
          <li>
            HTTP is like a message written on a <strong>postcard</strong>. Every postman and every
            sorting office that touches it can read it. Nothing needs to be opened.
          </li>
          <li>
            HTTPS is the same message inside a <strong>locked box</strong>. Only the receiver has
            the key. People can still see the box travelling and who it is addressed to. But they
            cannot read what is inside.
          </li>
        </ul>
        <p>
          The technology that does the locking is <strong>TLS</strong> (Transport Layer
          Security). You will often hear &ldquo;SSL certificate&rdquo;. SSL was the older
          version of the same idea. It is now obsolete, but the name stuck. When someone says SSL
          today, they almost always mean TLS.
        </p>

        <h2 id="leak">What actually leaks without HTTPS</h2>
        <p>
          Say your app is live on EC2 with no HTTPS, and a customer logs in from a café WiFi.
          This is what travels across that network:
        </p>
        <pre className="border-l-red-400">
          <code>{`POST /api/login HTTP/1.1
Host: yourapp.com
Content-Type: application/json

{"email":"user@example.com","password":"Acme@2026"}`}</code>
        </pre>
        <Callout kind="warn" label="Readable by anyone on the same WiFi">
          <p className="mb-0">
            Anyone on the same WiFi can read every character, using free tools. The password is
            not the only leak. The <strong>session cookie</strong> sent afterwards leaks too. A
            thief can copy it and be logged in <em>as that user</em> without knowing the
            password.
          </p>
        </Callout>
        <p>With HTTPS enabled, the exact same login sends this instead:</p>
        <pre className="border-l-emerald-400">
          <code>17 03 03 00 45 8f a3 d9 e2 b1 7c 4f 6a 2d 91 ...</code>
        </pre>
        <p>These are meaningless bytes. It is the same request and the same data, but nobody can read it.</p>
        <HttpVsHttps />

        <h2 id="three-jobs">HTTPS does three jobs, not one</h2>
        <p>Most people only know the first one. All three matter.</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Job</th>
                <th>What it means</th>
                <th>What breaks without it</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(([job, meaning, breaks]) => (
                <tr key={job}>
                  <td className="whitespace-nowrap"><strong>{job}</strong></td>
                  <td>{meaning}</td>
                  <td>{breaks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout kind="note" label="Certificates are for the second job">
          <p className="mb-0">
            The second job, <strong>authentication</strong> (proving who you are talking to), is
            what certificates are for. Encryption alone is not enough. You could encrypt your
            password perfectly and still send it <em>to a criminal</em>.
          </p>
        </Callout>

        <h2 id="terms">Key terms explained</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Term</th>
                <th>Simple meaning</th>
              </tr>
            </thead>
            <tbody>
              {terms.map(([term, meaning]) => (
                <tr key={term}>
                  <td className="whitespace-nowrap"><strong>{term}</strong></td>
                  <td>{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 id="trust">The chain of trust</h2>
        <p>
          Your browser has never heard of <code>yourapp.com</code>. So why does it trust it?
        </p>
        <Callout kind="note" label="Think of a passport">
          <p className="mb-0">
            A border officer in another country does not know you. But they trust the Indian
            government, and the Indian government gave you a passport that says who you are.
            Trust comes from an authority that both sides already accept.
          </p>
        </Callout>
        <p>
          Certificates work the same way. Every browser and operating system comes with a built-in
          list of <strong>Root Certificate Authorities</strong> (the top-level CAs) that it
          trusts. The list has more than 100 root certificates. A root CA signs an intermediate
          certificate. The intermediate signs yours. This is the chain.
        </p>
        <ChainOfTrust />
        <p>
          If any link in the chain is missing, expired, or signed by someone the browser does not
          know, you see the red warning page.
        </p>

        <h2 id="handshake">The handshake, step by step</h2>
        <p>
          The handshake is the short opening talk between browser and server. It takes
          milliseconds. It happens once per connection, before your page starts to load.
        </p>
        <ol className="steps">
          <li>
            <h3>Browser says hello</h3>
            <p>
              It connects and says &ldquo;I want to use TLS. Here are the encryption methods I
              support.&rdquo;
            </p>
          </li>
          <li>
            <h3>Server sends its certificate</h3>
            <p>It also sends the intermediate certificates (the chain), and picks one of the encryption methods the browser offered.</p>
          </li>
          <li>
            <h3>Browser verifies the certificate</h3>
            <p>
              It makes three checks. Is it signed by a trusted CA? Is today&apos;s date inside its
              valid dates? Does the domain name on it match the site I typed?
            </p>
          </li>
          <li>
            <h3>Both sides agree a shared key</h3>
            <p>
              A key exchange is a way for two sides to create the same secret key without sending
              it over the network. Both sides now have a shared secret key. Nobody who watched the
              talk can work it out.
            </p>
          </li>
          <li>
            <h3>Everything after this is encrypted</h3>
            <p>
              All page content, form data and API calls now travel inside the encrypted
              connection (the &ldquo;tunnel&rdquo;).
            </p>
          </li>
        </ol>
        <Callout kind="warn" label="Step 3 is where all the security lives">
          <p className="mb-0">
            If any of the three checks fails, the browser stops and shows a warning instead of
            your site.
          </p>
        </Callout>
        <TlsHandshakeStepper />

        <h2 id="options">Two ways to get a free certificate</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>AWS ACM</th>
                <th>Let&apos;s Encrypt (Certbot)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Cost</strong></td>
                <td>Free</td>
                <td>Free</td>
              </tr>
              <tr>
                <td><strong>Renewal</strong></td>
                <td>Automatic, no work from you (for certificates used with AWS services)</td>
                <td>Certificates last 90 days. A timer renews them automatically</td>
              </tr>
              <tr>
                <td><strong>Works on raw EC2 + Nginx</strong></td>
                <td className={no}>No</td>
                <td className={yes}>Yes</td>
              </tr>
              <tr>
                <td><strong>Works with ALB / CloudFront</strong></td>
                <td className={yes}>Yes</td>
                <td>Not needed there</td>
              </tr>
              <tr>
                <td><strong>When you will use it</strong></td>
                <td>Lesson 12 onward, once you have a Load Balancer</td>
                <td><strong>Lesson 7</strong>, your first EC2 deploy</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout kind="note" label="The key limitation">
          <p className="mb-0">
            The normal free ACM certificate cannot be installed on a plain EC2 server. AWS never
            gives you its private key. It works only when attached to an AWS service that ends
            (terminates) TLS for you, such as ALB, CloudFront or API Gateway. (Since 2025, ACM
            also sells &ldquo;exportable&rdquo; certificates that you can put on any server, but
            they are paid, so they are not part of this course.) For your first single-server
            deployment, Let&apos;s Encrypt is the answer.
          </p>
        </Callout>

        <h2 id="real-example">Real example — HTTPS on your EC2 server</h2>
        <Callout kind="warn" label="Two things must already be true before you start">
          <p>This is where Lessons 2 and 3 connect:</p>
          <ol className="mb-2">
            <li>
              <code>yourapp.com</code> DNS must already point to your EC2&apos;s IP — verify with{" "}
              <code>dig yourapp.com +short</code>
            </li>
            <li>
              Port 80 must be <strong>open</strong> in your Security Group. Let&apos;s Encrypt
              checks that you own the domain by fetching a small file from your server over
              port 80
            </li>
          </ol>
          <p className="mb-0">
            If either one is wrong, Certbot fails. Most &ldquo;certbot does not work&rdquo;
            problems are really DNS or Security Group problems.
          </p>
        </Callout>
        <p>
          Certbot is a free tool that gets Let&apos;s Encrypt certificates and sets them up for
          you. Install it with its Nginx plugin. Then ask for a certificate that covers{" "}
          <strong>both</strong> the bare name and the www name:
        </p>
        <CommandList
          title="On the EC2 server"
          commands={[
            { cmd: "sudo apt install certbot python3-certbot-nginx -y", note: "Install Certbot with the Nginx plugin" },
            { cmd: "sudo certbot --nginx -d yourapp.com -d www.yourapp.com", note: "Request the certificate. Certbot asks for an email (for expiry warnings), proves you own the domain, then edits your Nginx config." },
          ]}
        />
        <p>
          Certbot also sets up a timer that renews the certificate before its 90 days end. You do
          not need to touch it. But test it once with{" "}
          <code>sudo certbot renew --dry-run</code>, so you are not surprised in three months.
          (Let&apos;s Encrypt plans shorter lifetimes in the future. The timer handles that too.)
        </p>
        <Callout kind="ok" label="That is genuinely it">
          <p className="mb-0">
            Certbot writes the certificate paths into your Nginx config and adds the
            HTTP-to-HTTPS redirect for you.
          </p>
        </Callout>

        <h2 id="nginx">The Nginx config afterward</h2>
        <Script
          title="/etc/nginx/sites-available/yourapp.com — the parts Certbot adds"
          code={`server {
    listen 443 ssl;
    ssl_certificate     /etc/letsencrypt/live/yourapp.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourapp.com/privkey.pem;
    # ...your existing location / { proxy_pass ... } stays as it was
}

server {
    listen 80;                                  # plain HTTP
    return 301 https://$host$request_uri;       # push everyone to HTTPS
}`}
        />
        <p>
          Look at <code>fullchain.pem</code>. This file holds your certificate{" "}
          <strong>plus</strong> the intermediate certificate. That is the chain from the diagram
          above.
        </p>
        <Callout kind="warn" label="privkey.pem is your private key">
          <p className="mb-0">
            If that file leaks, someone else can pretend to be your site. You must revoke the
            certificate (cancel it) and get a new one. Only root should be able to read it. This
            goes back to the file permissions in Lesson 1.
          </p>
        </Callout>

        <h2 id="errors">Common errors you will actually hit</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Error</th>
                <th>Cause</th>
                <th>Fix</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>ERR_CERT_COMMON_NAME_INVALID</code></td>
                <td>The certificate covers yourapp.com, but you visited www.yourapp.com</td>
                <td>Get a new certificate with both names: <code>-d yourapp.com -d www.yourapp.com</code></td>
              </tr>
              <tr>
                <td><code>ERR_CERT_DATE_INVALID</code></td>
                <td>The certificate has expired</td>
                <td>Run <code>sudo certbot renew</code>, then find out why the timer did not run</td>
              </tr>
              <tr>
                <td><strong>Mixed content</strong> warning</td>
                <td>The page loads over HTTPS but asks for an image or script over <code>http://</code></td>
                <td>Use relative paths (<code>/logo.png</code>) or <code>https://</code> for everything</td>
              </tr>
              <tr>
                <td><code>ERR_TOO_MANY_REDIRECTS</code></td>
                <td>The load balancer already handles TLS, but Nginx also redirects to HTTPS. This makes an endless loop</td>
                <td>Check the <code>X-Forwarded-Proto</code> header (it tells Nginx if the user came in with http or https) instead of <code>$scheme</code></td>
              </tr>
              <tr>
                <td>Certbot &ldquo;challenge failed&rdquo;</td>
                <td>DNS does not point to the server yet, or port 80 is closed</td>
                <td>Check DNS with <code>dig</code> and fix it. Open port 80 in the Security Group</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Mixed content is the most common problem when you first move to HTTPS. The page loads,
          but some images quietly disappear, and the padlock shows a warning instead of a clean
          lock.
        </p>

        <h2 id="verify">Verifying it yourself</h2>
        <CommandList
          title="From any machine"
          commands={[
            { cmd: "curl -I http://yourapp.com", note: <>Should return <code>301 Moved Permanently</code> and a <code>Location</code> header with the https:// address</> },
          ]}
        />
        <p>
          In the browser, click the padlock icon next to the address. It shows the issuer, the
          valid dates and the full certificate chain. It is the same information in an easier
          form.
        </p>

        <h2 id="limits">What HTTPS does not do</h2>
        <Callout kind="warn" label="It protects data in transit, nothing else">
          <p className="mb-0">
            HTTPS protects data <strong>while it travels</strong>. It does nothing for data stored
            in your database. It does nothing against bad code, such as SQL injection (an attack
            where a user types database commands into a form). A site can have a perfect
            certificate and still be unsafe. These are separate problems. Lesson 18 covers them.
          </p>
        </Callout>
        <h3>Cost</h3>
        <p>
          Let&apos;s Encrypt certificates are <strong>free</strong>. Public ACM certificates are
          free too, when used with AWS services such as a load balancer. The only indirect cost
          is the Load Balancer that ACM needs. Lesson 12 prices it properly.
        </p>

        <hr />

        <h2 id="practice">Practice task before Lesson 5</h2>
        <p>
          You do not have a server yet, so today you look at certificates that already exist.
          Every command only reads data and works from your laptop.
        </p>
        <Script
          title="practice.sh"
          code={`curl -I http://github.com      # expect 301 and a Location: https://... header`}
        />
        <p>
          Then open <code>https://github.com</code> and click the padlock: find the issuer, the
          expiry date and the chain. Finally visit <code>https://expired.badssl.com</code> and{" "}
          <code>https://wrong.host.badssl.com</code> and read the exact error each one shows.
        </p>
        <p>Then answer these in your own words:</p>
        <ol>
          <li>
            Look at the three checks in handshake step 3. Which one did{" "}
            <code>wrong.host.badssl.com</code> fail? Which one did <code>expired.badssl.com</code>{" "}
            fail?
          </li>
          <li>
            Why can you not use a free ACM certificate on your first EC2 server? What will you use
            instead?
          </li>
          <li>
            Certbot says &ldquo;challenge failed&rdquo;. Name the two things from Lessons 2 and 3
            that you check before you run Certbot again.
          </li>
          <li>
            Your site has a perfect padlock, but a customer&apos;s data was stolen from the
            database. Did HTTPS fail? Why or why not?
          </li>
        </ol>
        <Callout kind="ok" label="Optional stretch">
          <p className="mb-0">
            Open <code>chrome://settings/security</code> → Manage certificates, and find the list
            of trusted root certificates. Count how many your machine trusts. Every HTTPS site
            you have visited was vouched for by one of them.
          </p>
        </Callout>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          HTTPS is HTTP inside a locked box. TLS does the locking. A certificate proves whose box
          it is. A chain of trust back to a Root CA is why your browser believes that proof,
          even though it has never met your server.
        </p>
        <ul>
          <li>
            <strong>Three jobs</strong>: encryption (nobody can read it), authentication (it
            really is yourapp.com) and integrity (nobody changed it). Certificates are for the
            second job.
          </li>
          <li>
            <strong>The handshake</strong> takes milliseconds. Step 3 (trusted CA, valid dates,
            matching name) is where every red warning page comes from.
          </li>
          <li>
            <strong>Two free sources</strong>: Let&apos;s Encrypt (Certbot) for a plain EC2 + Nginx
            server in Lesson 7, and ACM from Lesson 12, once an ALB or CloudFront ends TLS for
            you.
          </li>
          <li>
            <strong>Before Certbot</strong>: DNS must point to the server and port 80 must be
            open. After Certbot: protect <code>privkey.pem</code> like the <code>.env</code> file
            from Lesson 1.
          </li>
          <li>
            <strong>Not a full protection</strong>: HTTPS protects data in transit only. The
            database and the code are the topic of Lesson 18.
          </li>
        </ul>
        <p>
          Lessons 2, 3 and 4 together show the whole path from a typed domain name to an encrypted
          talk with your app. Next we go back into the AWS account and set up identity
          properly.
        </p>

        <hr />
        <p>
          End of Lesson 4. Next: <strong>Lesson 5 — AWS Account and IAM</strong>.
        </p>
        <p>
          Before Lesson 5, read:{" "}
          <Link href={readingHref(piecesReading)}>{piecesReading.title} →</Link> — Nginx, PM2,
          load balancers, RDS, VPC and every other name that Lessons 0–4 mention but do not yet
          explain, each with a flow diagram and a short &ldquo;how&rdquo;.
        </p>
      </div>

      <LessonPager slug={lesson.slug} />
    </article>
  );
}
