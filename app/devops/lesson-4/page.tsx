import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import CommandList from "@/components/CommandList";
import ChainOfTrust from "@/components/figures/ChainOfTrust";
import HttpVsHttps from "@/components/figures/HttpVsHttps";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
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
  ["Encryption", "Nobody in between can read the data", "Passwords and session cookies stolen on public WiFi"],
  ["Authentication", "You are really talking to yourapp.com, not an impostor", "Someone sets up a fake WiFi hotspot, serves a fake login page, collects credentials"],
  ["Integrity", "Nobody modified the data in transit", "An ISP or network injects ads, or swaps a bank account number in a page"],
];

const terms: [string, string][] = [
  ["SSL", "The old name (Secure Sockets Layer). Outdated technology, but people still say “SSL certificate” out of habit."],
  ["TLS", "The current, actual technology (Transport Layer Security). This is what really runs today."],
  ["Certificate", "A digital ID card for your domain, proving “this server really is yourapp.com”."],
  ["CA (Certificate Authority)", "A trusted company that issues certificates. Browsers ship with a built-in list of CAs they trust."],
  ["Public key", "Shared openly, used to encrypt data sent to your server."],
  ["Private key", "Kept secret on your server only, used to decrypt that data. If this leaks, your HTTPS is broken."],
  ["Let's Encrypt", "A free, automated CA that issues real, browser-trusted certificates at no cost."],
  ["AWS ACM", "AWS Certificate Manager. Free, auto-renewing, built for use with ALB and CloudFront."],
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
          HTTP sends everything as <strong>plain readable text</strong>.
        </p>
        <ul>
          <li>
            Think of HTTP like writing a message on a <strong>postcard</strong>. Every postman,
            every sorting office, every person who touches it along the way can read it without
            opening anything.
          </li>
          <li>
            HTTPS is the same message sealed inside a <strong>locked box</strong>, where only the
            recipient has the key. Anyone can still see a box travelling, and see who it is
            addressed to — but they cannot read what is inside.
          </li>
        </ul>
        <p>
          The technology doing the locking is called <strong>TLS</strong> (Transport Layer
          Security). You will hear people say &ldquo;SSL certificate&rdquo; constantly — SSL was
          the older version of the same idea, now obsolete, but the name stuck out of habit. When
          someone says SSL today, they almost always mean TLS.
        </p>

        <h2 id="leak">What actually leaks without HTTPS</h2>
        <p>
          Say your app is live on EC2 with no HTTPS, and a customer logs in from a café WiFi. Here
          is literally what travels across that network:
        </p>
        <pre className="border-l-red-400">
          <code>{`POST /api/login HTTP/1.1
Host: yourapp.com
Content-Type: application/json

{"email":"user@example.com","password":"Acme@2026"}`}</code>
        </pre>
        <Callout kind="warn" label="Readable by anyone on the same WiFi">
          <p className="mb-0">
            Every character of that is readable by anyone on the same WiFi using free, widely
            available tools. And it is not just the password — the <strong>session cookie</strong>{" "}
            sent afterwards leaks too, which means someone can copy it and become logged in{" "}
            <em>as that user</em> without ever knowing the password.
          </p>
        </Callout>
        <p>With HTTPS enabled, the exact same login sends this instead:</p>
        <pre className="border-l-emerald-400">
          <code>16 03 03 00 45 8f a3 d9 e2 b1 7c 4f 6a 2d 91 ...</code>
        </pre>
        <p>Meaningless bytes. Same request, same data, completely unreadable.</p>
        <HttpVsHttps />

        <h2 id="three-jobs">HTTPS does three jobs, not one</h2>
        <p>Most people only know about the first. All three matter.</p>
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
            The second job — <strong>authentication</strong> — is what certificates are actually
            for. Encryption alone is useless if you are carefully encrypting your password and
            sending it securely <em>to a criminal</em>.
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
          Your browser has never heard of <code>yourapp.com</code>. So how does it decide to trust
          it?
        </p>
        <Callout kind="note" label="Think of a passport">
          <p className="mb-0">
            A border officer in another country does not know you personally. But they trust the
            Indian government, and the Indian government has issued you a document saying who you
            are. Trust flows from an authority both sides already accept.
          </p>
        </Callout>
        <p>
          Certificates work identically. Every browser and operating system ships with a built-in
          list of <strong>Root Certificate Authorities</strong> it trusts — roughly 150
          organisations, baked in at install time.
        </p>
        <ChainOfTrust />
        <p>
          If any link in that chain is missing, expired, or signed by someone the browser does not
          recognise, you get the red warning page.
        </p>

        <h2 id="handshake">The handshake, step by step</h2>
        <p>
          This all happens in milliseconds, once per connection, before your page starts loading.
        </p>
        <ol className="steps">
          <li>
            <h3>Browser says hello</h3>
            <p>
              It connects and says &ldquo;I want to speak TLS, and here are the encryption methods
              I support.&rdquo;
            </p>
          </li>
          <li>
            <h3>Server sends its certificate</h3>
            <p>Along with the intermediate chain, and picks one of the offered encryption methods.</p>
          </li>
          <li>
            <h3>Browser verifies the certificate</h3>
            <p>
              Three checks: Is it signed by a trusted CA? Is today&apos;s date within its validity
              window? Does the domain name on it actually match the site I typed?
            </p>
          </li>
          <li>
            <h3>Both sides agree a shared key</h3>
            <p>
              A key exchange produces a shared secret key that was never transmitted in readable
              form.
            </p>
          </li>
          <li>
            <h3>Everything after this is encrypted</h3>
            <p>
              All page content, form submissions and API calls now travel inside the encrypted
              tunnel.
            </p>
          </li>
        </ol>
        <Callout kind="warn" label="Step 3 is where all the security lives">
          <p className="mb-0">
            If any of those three checks fails, the browser refuses to continue and shows a
            warning instead of your site.
          </p>
        </Callout>

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
                <td>Automatic, forever, zero work</td>
                <td>Automatic via timer, every 90 days</td>
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
            ACM certificates cannot be installed on a plain EC2 server. AWS never gives you the
            private key — the certificate only works when attached to an AWS service that
            terminates TLS for you (ALB, CloudFront, API Gateway). So for your first single-server
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
              Port 80 must be <strong>open</strong> in your Security Group — Let&apos;s Encrypt
              proves you own the domain by fetching a file over port 80
            </li>
          </ol>
          <p className="mb-0">
            If either is wrong, Certbot fails. Most &ldquo;certbot is not working&rdquo; problems
            are actually DNS or Security Group problems.
          </p>
        </Callout>
        <CommandList
          title="On the EC2 server"
          commands={[
            { cmd: "sudo apt update && sudo apt install certbot python3-certbot-nginx -y", note: "1. Install Certbot with the Nginx plugin" },
            { cmd: "sudo certbot --nginx -d yourapp.com -d www.yourapp.com", note: "2. Request the certificate — include BOTH bare and www versions. Certbot asks for your email (for expiry warnings), verifies domain ownership, then edits your Nginx config automatically." },
            { cmd: "sudo certbot renew --dry-run", note: "3. Confirm auto-renewal works" },
            { cmd: "sudo systemctl status certbot.timer", note: "4. Check the renewal timer is active" },
          ]}
        />
        <Callout kind="ok" label="That is genuinely it">
          <p className="mb-0">
            Certbot writes the certificate paths into your Nginx config and adds the
            HTTP-to-HTTPS redirect for you, automatically.
          </p>
        </Callout>

        <h2 id="nginx">The Nginx config afterward</h2>
        <Script
          title="/etc/nginx/sites-available/yourapp.com"
          code={`# The secure server block
server {
    listen 443 ssl;
    server_name yourapp.com www.yourapp.com;

    ssl_certificate     /etc/letsencrypt/live/yourapp.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourapp.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Anyone arriving on plain HTTP gets pushed to HTTPS
server {
    listen 80;
    server_name yourapp.com www.yourapp.com;
    return 301 https://$host$request_uri;
}`}
        />
        <p>
          Note <code>fullchain.pem</code> — that file contains your certificate{" "}
          <strong>plus</strong> the intermediate, which is exactly the chain from the diagram
          above.
        </p>
        <Callout kind="warn" label="privkey.pem is your private key">
          <p className="mb-0">
            If that file ever leaks, your HTTPS is compromised and the certificate must be revoked
            and reissued. It should be readable only by root — straight back to the file
            permissions from Lesson 1.
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
                <td>Certificate covers yourapp.com but you visited www.yourapp.com</td>
                <td>Reissue including both: <code>-d yourapp.com -d www.yourapp.com</code></td>
              </tr>
              <tr>
                <td><code>ERR_CERT_DATE_INVALID</code></td>
                <td>Certificate expired</td>
                <td><code>sudo certbot renew</code>, then check why the timer did not run</td>
              </tr>
              <tr>
                <td><strong>Mixed content</strong> warning</td>
                <td>Page loads over HTTPS but pulls an image or script over <code>http://</code></td>
                <td>Use relative paths (<code>/logo.png</code>) or <code>https://</code> everywhere</td>
              </tr>
              <tr>
                <td><code>ERR_TOO_MANY_REDIRECTS</code></td>
                <td>Load balancer already handles TLS, but Nginx also redirects to HTTPS — infinite loop</td>
                <td>Check the <code>X-Forwarded-Proto</code> header instead of <code>$scheme</code></td>
              </tr>
              <tr>
                <td>Certbot &ldquo;challenge failed&rdquo;</td>
                <td>DNS not pointing at the server yet, or port 80 closed</td>
                <td>Fix DNS first with <code>dig</code>, open port 80 in the Security Group</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          The mixed-content one catches almost everyone on their first HTTPS migration — the page
          loads fine, but images silently vanish and the padlock shows a warning instead of a
          clean lock.
        </p>

        <h2 id="verify">Verifying it yourself</h2>
        <CommandList
          title="From any machine"
          commands={[
            { cmd: "openssl s_client -connect yourapp.com:443 -servername yourapp.com", note: "Full certificate details for any live site" },
            { cmd: "echo | openssl s_client -connect yourapp.com:443 2>/dev/null | openssl x509 -noout -dates", note: "Just the expiry dates — quick check" },
            { cmd: "curl -I http://yourapp.com", note: <>Confirm the HTTP → HTTPS redirect is working. Should return <code>HTTP/1.1 301 Moved Permanently</code></> },
          ]}
        />
        <p>
          From the browser, clicking the padlock icon next to the URL shows the issuer, the
          validity dates, and the full certificate chain — the same information, in a friendlier
          form.
        </p>

        <h2 id="limits">What HTTPS does not do</h2>
        <Callout kind="warn" label="It protects data in transit, nothing else">
          <p className="mb-0">
            HTTPS protects data <strong>while it travels</strong>. It does nothing for data
            sitting in your database, and nothing against bad application code such as SQL
            injection. A site can have a perfect certificate and still be completely insecure.
            Those are separate problems, covered in Lesson 18.
          </p>
        </Callout>
        <h3>Cost</h3>
        <p>
          Both ACM and Let&apos;s Encrypt certificates are <strong>free, forever</strong>. The
          only indirect cost is the Load Balancer that ACM requires, which is priced properly in
          Lesson 12.
        </p>

        <hr />

        <h2 id="practice">Practice task before Lesson 5</h2>
        <p>
          You don&apos;t have a server yet, so today you inspect certificates that already exist.
          Every command is read-only and works from your laptop.
        </p>
        <Script
          title="practice.sh"
          code={`# 1. Watch a real handshake and read the chain (look for "Certificate chain" and "Verify return code: 0 (ok)")
openssl s_client -connect github.com:443 -servername github.com </dev/null

# 2. Just the dates — when does it expire?
echo | openssl s_client -connect github.com:443 2>/dev/null | openssl x509 -noout -dates

# 3. Who issued it, and for which names? (look at CN and "Subject Alternative Name")
echo | openssl s_client -connect github.com:443 2>/dev/null | openssl x509 -noout -issuer -subject -ext subjectAltName

# 4. Prove that the wrong name fails check #3 of the handshake
openssl s_client -connect github.com:443 -servername example.org </dev/null 2>&1 | grep "Verify return code"

# 5. See an HTTP → HTTPS redirect in action
curl -I http://github.com          # expect 301 and a Location: https://... header

# 6. Visit https://expired.badssl.com and https://wrong.host.badssl.com in your browser
#    and read the exact error names Chrome shows you`}
        />
        <p>Then answer these in your own words:</p>
        <ol>
          <li>
            The three checks in handshake step 3 — which one did <code>wrong.host.badssl.com</code>{" "}
            fail, and which one did <code>expired.badssl.com</code> fail?
          </li>
          <li>
            Why can&apos;t you use a free ACM certificate on your first EC2 server, and what will
            you use instead?
          </li>
          <li>
            Certbot&apos;s &ldquo;challenge failed&rdquo;. Name the two things from Lessons 2 and
            3 you check before touching Certbot again.
          </li>
          <li>
            Your site has a perfect padlock but a customer&apos;s data was stolen from the
            database. Did HTTPS fail? Why not?
          </li>
        </ol>
        <Callout kind="ok" label="Optional stretch">
          <p className="mb-0">
            Open <code>chrome://settings/security</code> → Manage certificates, and find the root
            store. Count how many Root CAs your machine trusts. Every HTTPS site you have ever
            visited was vouched for by one of them.
          </p>
        </Callout>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          HTTPS is HTTP inside a locked box. TLS does the locking, a certificate proves whose box
          it is, and a chain of trust back to a Root CA is why your browser believes that proof
          without ever having met your server.
        </p>
        <ul>
          <li>
            <strong>Three jobs</strong>: encryption (nobody reads it), authentication (it really
            is yourapp.com), integrity (nobody changed it). Certificates exist for the second
            one.
          </li>
          <li>
            <strong>The handshake</strong> costs milliseconds; step 3 — trusted CA, valid dates,
            matching name — is where every red warning page comes from.
          </li>
          <li>
            <strong>Two free sources</strong>: Let&apos;s Encrypt (Certbot) for a raw EC2 +
            Nginx box in Lesson 7; ACM once an ALB or CloudFront terminates TLS for you from
            Lesson 12.
          </li>
          <li>
            <strong>Before Certbot</strong>: DNS must resolve to the server and port 80 must be
            open. After Certbot: guard <code>privkey.pem</code> like the <code>.env</code> from
            Lesson 1.
          </li>
          <li>
            <strong>Not a security blanket</strong>: HTTPS protects data in transit only. The
            database and the code are Lesson 18&apos;s problem.
          </li>
        </ul>
        <p>
          Lessons 2, 3 and 4 together are the whole path from a typed domain name to an encrypted
          conversation with your app. Next we go back inside the AWS account and set up identity
          properly.
        </p>

        <hr />
        <p>
          End of Lesson 4. Next: <strong>Lesson 5 — AWS Account and IAM</strong>.
        </p>
        <p>
          Before Lesson 5, read:{" "}
          <Link href={readingHref(piecesReading)}>{piecesReading.title} →</Link> — Nginx, PM2,
          load balancers, RDS, VPC and every other name Lessons 0–4 mentioned but did not yet
          explain, each with a flow diagram and the minimal &ldquo;how&rdquo;.
        </p>
      </div>

      <LessonPager slug={lesson.slug} />
    </article>
  );
}
