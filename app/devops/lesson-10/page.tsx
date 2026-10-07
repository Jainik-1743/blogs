import type { Metadata } from "next";
import Callout from "@/components/Callout";
import CommandList from "@/components/CommandList";
import NginxFlow from "@/components/figures/NginxFlow";
import InterviewQA from "@/components/InterviewQA";
import LessonIntro from "@/components/LessonIntro";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { getLesson } from "@/lib/lessons";

const lesson = getLesson("lesson-10")!;

export const metadata: Metadata = {
  title: `Lesson 10 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Concept: the receptionist" },
  { id: "why-this-matters", label: "Why port 3000 should never be public" },
  { id: "jobs", label: "The six jobs Nginx does for you" },
  { id: "install", label: "Install and first look" },
  { id: "anatomy", label: "How an Nginx config is organised" },
  { id: "proxy", label: "The reverse-proxy config, line by line" },
  { id: "headers", label: "Why the forwarded headers matter" },
  { id: "performance", label: "Compression, caching and upload limits" },
  { id: "protect", label: "Protecting the app: rate limits and security headers" },
  { id: "https", label: "HTTPS with Certbot" },
  { id: "alb", label: "Nginx behind a load balancer" },
  { id: "tenants", label: "Multi-tenant subdomains" },
  { id: "firewall", label: "Close the door on 3000" },
  { id: "operate", label: "Operating Nginx: test, reload, logs" },
  { id: "troubleshooting", label: "502, 504, 413 and other errors decoded" },
  { id: "interview", label: "Interview corner" },
  { id: "practice", label: "Practice task before Lesson 11" },
  { id: "conclusion", label: "Conclusion" },
];

const jobs: [string, string, string][] = [
  ["1. Terminates HTTPS", "Does the encryption work (HTTPS, using a certificate). “Terminate” means Nginx ends the encrypted connection, so your app only speaks plain HTTP on its own machine (localhost).", "Lesson 4 — done once, in one place"],
  ["2. Forwards requests", "Passes each request to the right app on a private port. For example, / goes to Next.js and /api-v2 goes to another service.", "One public door, many apps behind it"],
  ["3. Compresses", "Gzip is a way to shrink text files. Nginx gzips HTML, CSS, JS and JSON before it sends them. Text often becomes 60–80% smaller.", "Pages load faster, bandwidth costs less"],
  ["4. Caches static files", "Keeps copies of files that never change (/_next/static) and serves them itself, so Node is not bothered.", "Node does app logic, not file serving"],
  ["5. Protects", "Limits how fast one visitor can send requests (rate limiting), caps upload sizes, adds security headers, and hides which software you use.", "A shield in front of a process that can break"],
  ["6. Survives your app", "Keeps answering with a clean error page when Node restarts or crashes.", "Deploys and crashes look clean to users"],
];

const errors: [string, string, string][] = [
  ["502 Bad Gateway", "Nginx is fine, but it could not talk to the app. The app is down, crashed, still starting, or on a different port.", "docker ps / pm2 status; curl -I http://127.0.0.1:3000; check the port in proxy_pass; sudo tail /var/log/nginx/error.log (“connect() failed … Connection refused”)"],
  ["504 Gateway Timeout", "The app accepted the request but took longer than proxy_read_timeout (default 60 s) to answer.", "Find the slow endpoint and fix it. If the work is really long, raise the timeout for that location only."],
  ["413 Request Entity Too Large", "Upload bigger than client_max_body_size (default 1 MB)", "Raise it to what you need (10m, 50m). Better still, upload big files straight to S3 (Lesson 11)."],
  ["Too many redirects (redirect loop)", "The app and Nginx (or the ALB) both redirect HTTP to HTTPS, and the app does not see X-Forwarded-Proto: https.", "Pass X-Forwarded-Proto, make the app trust it, and redirect in only one place."],
  ["Default “Welcome to nginx!” page", "Your site file is not enabled, or the default site is answering first.", "Make the symlink in sites-enabled, remove the default site, run nginx -t, then reload."],
  ["nginx: [emerg] bind() to 0.0.0.0:80 failed (Address already in use)", "Another program (Apache, a Docker container) already uses port 80.", "Run sudo ss -tlnp | grep :80 to find it, then stop that service."],
  ["Certificate not renewing", "The certbot timer is not running, or port 80 is blocked so the ownership check fails.", "Run sudo certbot renew --dry-run. Check that the Security Group allows port 80."],
];

export default function LessonTenPage() {
  return (
    <article>
      <LessonIntro lesson={lesson} outline={outline} />

      <div className="lesson">
        <h2 id="concept">Concept</h2>
        <p>
          <strong>Nginx</strong> (say &ldquo;engine-x&rdquo;) is a web server program. Most often it
          does one special job: it works as a <strong>reverse proxy</strong>. A reverse proxy is a
          server that stands in front of your app. It takes every request from the internet and{" "}
          <em>passes it on</em> to the app.
        </p>
        <p>
          A <strong>port</strong> is a numbered door on a computer. Nginx listens on the public
          doors 80 (HTTP) and 443 (HTTPS). Your real app stays private on port 3000 and never meets
          the internet.
        </p>
        <Callout kind="note" label="The analogy — the hotel receptionist">
          <p className="mb-0">
            In a hotel, guests do not walk into the kitchen and shout their order at the chef. They
            talk to the receptionist. The receptionist checks who they are, sends troublemakers
            away, writes the request down clearly, and passes it to the right team. The chef (Node)
            can focus on cooking. Nginx is the receptionist. Your app is the chef.
          </p>
        </Callout>
        <NginxFlow />
        <p>
          The word <em>reverse</em> tells it apart from a normal (forward) proxy. A forward proxy
          stands in front of <em>clients</em> (the users) and hides who they are. A reverse proxy
          stands in front of <em>servers</em> and hides which server really answered.
        </p>

        <h2 id="why-this-matters">Why port 3000 should never be public</h2>
        <p>
          In Lesson 7 you opened <code>http://SERVER_IP:3000</code> directly. That was only a test
          door. Now you must close it. <strong>Node.js</strong> is the program that runs JavaScript
          on a server, and Next.js runs on top of it. They are good at running your app logic. They
          are not built to face the open internet alone:
        </p>
        <ul>
          <li>
            <strong>No HTTPS of their own.</strong> HTTPS is HTTP with encryption, so nobody on the
            network can read the traffic. Without it, the browser shows &ldquo;Not secure&rdquo;.
          </li>
          <li>
            <strong>Slow-client attacks.</strong> An attacker opens thousands of connections and
            sends one byte a minute (this attack is called &ldquo;Slowloris&rdquo;). The server
            keeps every connection open and can run out of room for real users. Nginx is built to
            handle exactly this.
          </li>
          <li>
            <strong>Nothing between the world and your code.</strong> There is no rate limit (a cap on
            how many requests one visitor can make), no size cap on uploads, and no safety
            headers.
          </li>
          <li>
            <strong>Ugly URLs.</strong> Nobody wants to type <code>:3000</code>.
          </li>
        </ul>

        <h2 id="jobs">The six jobs Nginx does for you</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Job</th>
                <th>What it means</th>
                <th>Benefit</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(([j, what, why]) => (
                <tr key={j}>
                  <td className="whitespace-nowrap"><strong>{j}</strong></td>
                  <td>{what}</td>
                  <td>{why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout kind="note" label="Do I still need Nginx if I use an ALB?">
          <p className="mb-0">
            Partly. An ALB (Application Load Balancer, Lesson 12) is an AWS service that shares
            requests across many servers. It also ends HTTPS, so many teams skip Nginx once they
            have an ALB. Nginx is still useful for compression, caching static files, rate
            limiting, and routing by hostname on a single server. It is also useful when you have
            no ALB yet. The same ideas appear in ALB rules, Kubernetes ingress and API gateways, so
            it is worth learning them once.
          </p>
        </Callout>

        <h2 id="install">Install and first look</h2>
        <p>
          On the server, install the <code>nginx</code> package. It starts at once as a{" "}
          <strong>systemd service</strong> (systemd is the Linux tool that starts and stops
          background programs). It listens on port 80 and shows a &ldquo;Welcome to nginx!&rdquo;
          page.
        </p>
        <p>
          For this to work from your laptop, the Security Group (the AWS firewall for a server) must
          allow ports 80 and 443. In Lesson 6 we allowed them only from the future load balancer.
          Until Lesson 12, open them to the whole internet on the app&apos;s group.
        </p>
        <p>
          In the console, add inbound rules for HTTP 80 and HTTPS 443 from{" "}
          <code>0.0.0.0/0</code> to <code>web-sg</code>, then browse to{" "}
          <code>http://SERVER_IP</code> — you should see the welcome page.
        </p>

        <h2 id="anatomy">How an Nginx config is organised</h2>
        <p>Configuration is text files in <code>/etc/nginx/</code>. The layout on Ubuntu:</p>
        <Script
          title="the files that matter"
          code={`/etc/nginx/
├── nginx.conf              # the main file: workers, logging, gzip defaults; includes the folders below
├── sites-available/        # one file per website — all of them, enabled or not
│   ├── default
│   └── myapp               # ← the file you will create
└── sites-enabled/          # symlinks (shortcuts) to the files in sites-available that are LIVE
    └── myapp -> ../sites-available/myapp

/var/log/nginx/
├── access.log              # one line per request
└── error.log               # what went wrong`}
        />
        <p>
          Think of the config as boxes inside boxes. A <strong>directive</strong> is one setting, such
          as <code>listen 80;</code>. A <strong>block</strong> is a pair of curly braces that groups
          settings. There are three levels:
        </p>
        <Script
          title="the nesting"
          code={`http {                              # everything about web traffic
    server {                        # one website (matched by port + server_name)
        listen 80;
        server_name yourapp.com;
        location / {                # one URL path inside that site
            proxy_pass http://127.0.0.1:3000;
        }
    }
}`}
        />
        <p>
          <strong>Enabled vs available</strong> is a safe habit. You write the site in{" "}
          <code>sites-available</code> and test it. Then you <em>enable</em> it with a symlink (a
          small shortcut file that points to another file). To switch the site off, remove the
          symlink. Your work is not deleted.
        </p>

        <h2 id="proxy">The reverse-proxy config, line by line</h2>
        <p>
          Create <code>/etc/nginx/sites-available/myapp</code>. This is the core of a production-ready
          file. We add more to it later in the lesson.
        </p>
        <Script
          title="/etc/nginx/sites-available/myapp"
          code={`# Lets WebSocket connections pass through (a WebSocket is a long-lived two-way connection: chat, live updates)
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    listen [::]:80;                       # same, for IPv6 (the newer kind of IP address)
    server_name yourapp.com www.yourapp.com;

    location / {
        proxy_pass http://127.0.0.1:3000;     # forward to the app on the private port
        proxy_http_version 1.1;               # needed for WebSockets

        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade           $http_upgrade;
        proxy_set_header Connection        $connection_upgrade;

        proxy_read_timeout 60s;               # give up waiting for the app after 60 s
    }
}`}
        />
        <CommandList
          title="Enable it"
          commands={[
            { cmd: "sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/", note: "Turn the site on. Also delete sites-enabled/default, so the welcome page stops answering" },
            { cmd: "sudo nginx -t", note: "ALWAYS test the config before you reload. It prints “syntax is ok” and “test is successful”" },
            { cmd: "sudo systemctl reload nginx", note: "Apply the change without cutting any open connection (a restart would cut them)" },
          ]}
        />
        <h3>What each line does</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Directive</th>
                <th>Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><code>listen 80</code></td><td>Accept plain HTTP connections on port 80.</td></tr>
              <tr><td><code>server_name</code></td><td>Which hostnames this site answers for. One server can host many sites. Nginx picks the site by the <code>Host</code> header, a line in the request that says which domain the user typed.</td></tr>
              <tr><td><code>location /</code></td><td>Applies to every path that starts with <code>/</code>. That means all paths, unless a more specific location exists.</td></tr>
              <tr><td><code>proxy_pass http://127.0.0.1:3000</code></td><td>The one line that makes it a reverse proxy. Use <code>127.0.0.1</code>, not <code>localhost</code>. The name <code>localhost</code> can point to the IPv6 address <code>::1</code>, and your app may not listen there.</td></tr>
              <tr><td><code>proxy_http_version 1.1</code></td><td>Older Nginx versions talk to the app with HTTP 1.0 by default. HTTP 1.0 cannot upgrade to WebSockets or keep connections open. Set 1.1.</td></tr>
              <tr><td><code>proxy_read_timeout</code></td><td>How long Nginx waits for the app to send data before it gives up and returns 504 (default 60 s).</td></tr>
            </tbody>
          </table>
        </div>

                <Callout kind="note" label="Streaming pages need buffering off">
          <p className="mb-0">
            Next.js can send a page in pieces (streaming). By default Nginx collects the whole
            answer before it sends it on, which breaks streaming. If you use streaming, have the
            app send the header <code>X-Accel-Buffering: no</code>, or add{" "}
            <code>proxy_buffering off;</code> to the <code>location</code> block.
          </p>
        </Callout>

        <h2 id="headers">Why the forwarded headers matter</h2>
        <p>
          A reverse proxy has a side effect: <strong>your app no longer talks to the user. It talks
          to Nginx.</strong> A <strong>header</strong> is a named line of extra information that
          travels with a request. Without help, the app thinks every request comes from{" "}
          <code>127.0.0.1</code>, over plain HTTP, for <code>localhost:3000</code>. That breaks real
          features. So Nginx adds headers that tell the app the truth:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Header Nginx adds</th>
                <th>Tells the app</th>
                <th>What breaks without it</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>Host</code></td>
                <td>The domain the user typed</td>
                <td>Finding the customer (tenant) from the subdomain, full URLs, cookies for the wrong domain</td>
              </tr>
              <tr>
                <td><code>X-Forwarded-For</code> / <code>X-Real-IP</code></td>
                <td>The user&apos;s real IP</td>
                <td>Every log line and every rate limiter sees 127.0.0.1</td>
              </tr>
              <tr>
                <td><code>X-Forwarded-Proto</code></td>
                <td>Whether the user used http or https</td>
                <td>Redirect loops, cookies not marked Secure, http:// links in emails</td>
              </tr>
              <tr>
                <td><code>Upgrade</code> / <code>Connection</code></td>
                <td>&ldquo;Switch this connection to WebSocket&rdquo;</td>
                <td>Live features fail without any error</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout kind="warn" label="Trust these headers only from your own proxy">
          <p className="mb-0">
            Any client can send a fake <code>X-Forwarded-For</code> header. This is safe here only
            because the app can be reached <em>only</em> through Nginx (port 3000 is closed; see the
            next section). If the app were public, an attacker could fake their IP and get past every
            check. This is one more reason to keep the port private.
          </p>
        </Callout>

        <h2 id="performance">Compression, caching and upload limits</h2>
        <p>Add these to the same <code>server</code> block. First compression and the upload cap:</p>
        <Script
          title="inside server { ... }"
          code={`client_max_body_size 10m;             # reject uploads bigger than 10 MB with 413

gzip on;
gzip_comp_level 5;                    # 1 = fast but bigger files … 9 = slow but smaller files. 4–6 is a good balance
gzip_min_length 1024;                 # tiny responses are not worth compressing
gzip_proxied any;                     # also compress responses that came from the app behind Nginx
gzip_types text/plain text/css text/xml application/json application/javascript
           application/xml image/svg+xml;   # text formats only. Images and PDFs are already compressed`}
        />
        <p>
          Next.js can also gzip by itself. Doing it in Nginx frees Node&apos;s CPU for real work. If
          you turn on Nginx compression, set <code>compress: false</code> in{" "}
          <code>next.config.ts</code> so the work is not done twice.
        </p>
        <h3>Cache the immutable static files</h3>
        <p>
          Next.js puts its build files under <code>/_next/static/</code>. Each file name contains a{" "}
          <strong>hash</strong>, a short code made from the file&apos;s content. When the content
          changes, the name changes. So a file with a given name never changes, and it is safe to
          cache for a whole year. Let Nginx keep a copy and answer from it, so Node is not bothered.
        </p>
        <p>
          This needs two pieces of config: a small cache defined at the top of the file, and a{" "}
          <code>location /_next/static/</code> block that uses it. Next.js already sends the header{" "}
          <code>Cache-Control: public, max-age=31536000, immutable</code> for these files, and Nginx
          passes it on to browsers. (This header tells the browser: keep this file for a year, it
          will never change.)
        </p>
        <Script
          title="cache for /_next/static"
          code={`proxy_cache_path /var/cache/nginx/next levels=1:2 keys_zone=next_static:10m
                 max_size=1g inactive=7d;               # top of the file, outside server { }

location /_next/static/ {                                # inside server { }
    proxy_cache next_static;                             # use the cache defined above
    proxy_cache_valid 200 365d;                          # keep good answers for a year
    proxy_pass http://127.0.0.1:3000;
}`}
        />
        <p>
          Lesson 11 takes this idea further. It moves these files to a CDN (Content Delivery
          Network: servers around the world that keep copies of your files close to users).
        </p>

        <h2 id="protect">Protecting the app: rate limits and security headers</h2>
        <h3>Rate limiting</h3>
        <p>
          <strong>Rate limiting</strong> means capping how many requests one visitor can make in a
          given time. Without it, a script can call a login form or a search endpoint ten thousand
          times a second. That can crash your database or let attackers guess passwords. Nginx can
          stop the extra requests before Node ever sees them:
        </p>
        <Script
          title="rate limiting: define once, apply to /api/"
          code={`limit_req_zone $binary_remote_addr zone=perip:10m rate=10r/s;   # top of the file

location /api/ {                                                  # inside server { }
    limit_req zone=perip burst=20 nodelay;
    limit_req_status 429;                                         # "Too Many Requests"
    proxy_pass http://127.0.0.1:3000;
}`}
        />
        <p>
          The zone <code>perip</code> keeps one counter for each client IP address (it uses 10 MB of
          memory). <code>rate</code> is the steady speed that is allowed. <code>burst</code> is how
          many extra requests may wait in line for a moment. <code>nodelay</code> serves those
          waiting requests at once instead of spacing them out. For a login endpoint, use a much
          stricter rate, for example <code>rate=5r/m</code> (5 per minute).
        </p>
                <h3>Security headers</h3>
        <p>
          A security header is an instruction that tells the browser to be stricter. Add these three
          and hide the Nginx version number:
        </p>
        <Script
          title="inside server { ... }"
          code={`add_header X-Content-Type-Options "nosniff" always;            # stop browsers from guessing file types
add_header X-Frame-Options "SAMEORIGIN" always;                # stop other sites from showing your page in a hidden frame (clickjacking)
add_header Referrer-Policy "strict-origin-when-cross-origin" always;   # share less of your URL with other sites
server_tokens off;                                             # hide the Nginx version number`}
        />
        <Callout kind="warn" label="Two common mistakes">
          <ul className="mb-0">
            <li>
              <code>add_header</code> in a <code>location</code> block <strong>replaces</strong>{" "}
              (it does not add to) the headers set in the outer <code>server</code> block. If a
              location uses any <code>add_header</code>, repeat the security headers there.
            </li>
            <li>
              Add <code>Strict-Transport-Security</code> (HSTS) only after HTTPS works everywhere.
              HSTS is a header that tells browsers &ldquo;always use HTTPS for this site&rdquo; for
              the time you set (often a year). If HTTPS breaks, visitors are locked out.
            </li>
          </ul>
        </Callout>

        <h2 id="https">HTTPS with Certbot</h2>
        <p>
          Lesson 4 explained certificates. A <strong>certificate</strong> is a file that proves your
          server really owns the domain. <strong>Let&apos;s Encrypt</strong> is a free service that
          issues certificates. <strong>Certbot</strong> is a tool that gets a certificate for you and
          sets up Nginx to use it. Before you start, you need two things. First, a DNS{" "}
          <code>A</code> record from Lesson 3. DNS is the internet&apos;s phone book, and an{" "}
          <code>A</code> record is one entry in it that points a domain name at an IP address. Here it
          points your domain at the server&apos;s Elastic IP (an Elastic IP is a fixed public IP address
          that AWS lets you keep). Second, port 80 open, because Let&apos;s Encrypt checks that you own the domain by
          making an HTTP request to it.
        </p>
        <CommandList
          title="Get a free certificate"
          commands={[
            { cmd: "sudo certbot --nginx -d yourapp.com -d www.yourapp.com", note: "Proves you own the domain, downloads the certificate, and edits your config. It adds a 443 server block and an HTTP to HTTPS redirect. Install certbot and python3-certbot-nginx first" },
          ]}
        />
        <p>
          A Let&apos;s Encrypt certificate lasts 90 days. A systemd timer renews it automatically when
          30 days are left. This stops the 3 a.m. &ldquo;certificate expired&rdquo; outage. Run{" "}
          <code>sudo certbot renew --dry-run</code> once to be sure renewal works.
        </p>
        <p>Open your config afterwards and read what Certbot changed. Always review generated configuration:</p>
        <p>
          Certbot added a <code>listen 443 ssl</code> block with the two certificate paths. It also
          changed the port-80 block into a small redirect to https. This is the same shape as in
          Lesson 4.
        </p>
        <p>
          Test it. <code>curl -I http://yourapp.com</code> should return <code>301</code> (a &ldquo;moved
          permanently&rdquo; answer) that points to https. <code>curl -I https://yourapp.com</code>{" "}
          should return <code>200</code>. Then check your domain with <em>ssllabs.com/ssltest</em>.
          The Certbot defaults usually score an A.
        </p>
        <Callout kind="note" label="Redirecting www to the bare domain (or the reverse)">
          <p className="mb-0">
            Search engines treat <code>www.yourapp.com</code> and <code>yourapp.com</code> as two
            sites. Pick one as the official address. For the other name, add a small{" "}
            <code>server</code> block that contains{" "}
            <code>return 301 https://yourapp.com$request_uri;</code>.
          </p>
        </Callout>

        <h2 id="alb">Nginx behind a load balancer</h2>
        <p>
          In Lesson 12 an ALB will sit in front of your servers and end HTTPS itself. It uses a free
          ACM certificate (ACM is AWS Certificate Manager, a service that issues and renews
          certificates). The VPC (Virtual Private Cloud) is your own private network inside AWS. Then Nginx receives plain HTTP from the
          ALB, and two things change:
        </p>
        <ul>
          <li>
            <strong>No Certbot on the servers.</strong> Nginx listens only on port 80, and the
            certificate lives on the ALB.
          </li>
          <li>
            <strong>The real client IP and protocol arrive in headers from the ALB</strong>, not
            from the connection itself. So Nginx must believe those headers when they come from your
            VPC. It must also pass the ALB&apos;s protocol header on instead of replacing it.
          </li>
        </ul>
        <p>That gives three small changes, all in the server block:</p>
        <ul>
          <li>
            <strong>Trust the ALB&apos;s headers only from inside the VPC</strong>{" "}
            (<code>set_real_ip_from 10.0.0.0/16</code> plus{" "}
            <code>real_ip_header X-Forwarded-For</code>). Then logs and rate limits see the real
            visitor&apos;s IP. (<code>10.0.0.0/16</code> is an example. Use your own VPC range.)
          </li>
          <li>
            <strong>Forward the ALB&apos;s <code>X-Forwarded-Proto</code></strong> instead of
            Nginx&apos;s own <code>$scheme</code>. Behind an ALB, <code>$scheme</code> is always
            &ldquo;http&rdquo;.
          </li>
          <li>
            <strong>A cheap health endpoint</strong> (<code>location = /nginx-health</code>{" "}
            that returns 200). A health check is a small request that a load balancer sends again and
            again to see if a server is alive. This one is answered by Nginx itself, so it does not
            wake the app.
          </li>
        </ul>
                <Script
          title="inside server { ... } when an ALB is in front"
          code={`set_real_ip_from 10.0.0.0/16;          # the ALB is inside your VPC range
real_ip_header X-Forwarded-For;        # read the visitor IP from this header
real_ip_recursive on;

location = /nginx-health {             # cheap check for the ALB
    access_log off;
    return 200 "ok";
}

# in location / { }, replace the old line with:
proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;   # the ALB's value`}
        />
        <p>
          If you get this wrong, you will see a classic problem: a <em>redirect loop</em>. The app
          thinks the request was HTTP (because Nginx said so), so it redirects to HTTPS. The ALB
          sends the request back, and the browser gives up.
        </p>
        <p>
          Note: the Lesson 12 build publishes the container straight on port 80 and does not use
          Nginx. This section is for the case where you keep Nginx on each server.
        </p>

        <h2 id="tenants">Multi-tenant subdomains</h2>
        <p>
          A <strong>tenant</strong> is one customer of your app. Lesson 3 set up a wildcard DNS record{" "}
          <code>*.yourapp.com</code>, so every customer gets a subdomain with no extra DNS work.
          Nginx makes the same idea work on the server. One <code>server</code> block answers for{" "}
          <em>all</em> subdomains, and the app finds the tenant from the <code>Host</code> header
          that we already pass on.
        </p>
        <Script
          title="one block, every customer"
          code={`server_name yourapp.com *.yourapp.com;   # wildcard match
proxy_set_header Host $host;             # the app reads "acme.yourapp.com" → tenant "acme"`}
        />
        <Callout kind="warn" label="Wildcard HTTPS needs a different challenge">
          <p className="mb-0">
            You cannot prove ownership of <code>*.yourapp.com</code> with an HTTP request. Let&apos;s
            Encrypt needs a DNS challenge: you prove ownership by adding a TXT record to your DNS (a TXT record is a DNS entry that holds
            plain text).
            With Route 53 this is automatic:{" "}
            <code>sudo certbot certonly --dns-route53 -d yourapp.com -d &quot;*.yourapp.com&quot;</code>.
            It needs the <code>python3-certbot-dns-route53</code> plugin and an IAM role that may
            edit the hosted zone. Or skip all of this. Put the wildcard certificate on the ALB with
            ACM, which handles wildcards and renewals for free (Lesson 12).
          </p>
        </Callout>

        <h2 id="firewall">Close the door on 3000</h2>
        <p>
          Now that Nginx is the front door, make sure it is the <em>only</em> door. Check two
          places:
        </p>
        <ol>
          <li>Delete the temporary port-3000 rule from Lesson 7 in <code>web-sg</code>.</li>
          <li>
            On the server, run <code>sudo ss -tlnp | grep 3000</code>. The address must be{" "}
            <code>127.0.0.1:3000</code> (with Docker, use <code>-p 127.0.0.1:3000:3000</code>). It
            must never be <code>0.0.0.0:3000</code>, which means &ldquo;open to everyone&rdquo;.
          </li>
          <li>
            From your laptop, <code>http://SERVER_IP:3000</code> must time out or be refused, while{" "}
            <code>https://yourapp.com</code> still works.
          </li>
        </ol>

        <h2 id="operate">Operating Nginx: test, reload, logs</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Command</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Test config before applying</td><td><code>sudo nginx -t</code></td></tr>
              <tr><td>Apply config without cutting open connections</td><td><code>sudo systemctl reload nginx</code></td></tr>
              <tr><td>Watch requests live</td><td><code>sudo tail -f /var/log/nginx/access.log</code></td></tr>
              <tr><td>See errors</td><td><code>sudo tail -f /var/log/nginx/error.log</code></td></tr>
            </tbody>
          </table>
        </div>
        <p>A line in the access log reads like this, left to right:</p>
        <Script
          title="/var/log/nginx/access.log"
          code={`203.0.113.7 - - [15/Jan/2026:09:30:12 +0000] "GET /dashboard HTTP/2.0" 200 5123 "https://yourapp.com/" "Mozilla/5.0 ..."
# client IP        timestamp                    method path  protocol  status bytes  referrer            browser`}
        />
        <Callout kind="ok" label="The habit that prevents outages">
          <p className="mb-0">
            Run <code>nginx -t</code> <em>before</em> every reload. If the new config has a typo, a
            reload is refused and Nginx keeps the old config. But a restart with a typo can leave
            Nginx stopped, and then every site on the server is down. The <code>-t</code> check
            finds the typo first, while the old config keeps serving.
          </p>
        </Callout>

        <h2 id="troubleshooting">502, 504, 413 and other errors decoded</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>You see</th>
                <th>It means</th>
                <th>Do this</th>
              </tr>
            </thead>
            <tbody>
              {errors.map(([e, m, d]) => (
                <tr key={e}>
                  <td><code>{e}</code></td>
                  <td>{m}</td>
                  <td>{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout kind="note" label="The 5xx cheat-sheet">
          <p className="mb-0">
            A 5xx code means the server side had an error. <strong>502</strong> = the app is not there
            (or it refused the connection). <strong>503</strong> = the service is overloaded or
            switched off on purpose. <strong>504</strong> = the app is there but too slow. If the
            browser shows Nginx&apos;s error page, Nginx is healthy and the problem is <em>behind</em>{" "}
            it. Always read <code>error.log</code> first.
          </p>
        </Callout>

        <h2 id="interview">Interview corner</h2>
        <InterviewQA
          items={[
            {
              q: "What is a reverse proxy and why use one?",
              a: (
                <p className="mb-0">
                  It is a server that stands in front of your application servers. It receives client
                  requests and passes them on. It does HTTPS, compression, caching, rate limiting
                  and routing in one place. It hides your internal setup, and it protects the app
                  from slow or harmful clients.
                </p>
              ),
            },
            {
              q: "Forward proxy vs reverse proxy?",
              a: (
                <p className="mb-0">
                  A forward proxy works for the clients (a company proxy, a VPN). It hides the client
                  from servers. A reverse proxy works for the servers. It hides the servers from
                  clients.
                </p>
              ),
            },
            {
              q: "Users get 502 right after a deploy. Where do you look?",
              a: (
                <p className="mb-0">
                  I read the Nginx error log and look for “connection refused”. Then I check that the app
                  process or container is running on the expected port. Often the app crashed at
                  start (a bad env variable or a failed migration) or is still starting. I would add
                  a health check and a zero-downtime reload.
                </p>
              ),
            },
            {
              q: "Why does the app need X-Forwarded-Proto?",
              a: (
                <p className="mb-0">
                  TLS (the encryption layer) ends at the proxy, so the app sees plain HTTP. The header
                  tells the app the original protocol. The app needs this for redirects, secure
                  cookies and links it builds. Without it, you get redirect loops.
                </p>
              ),
            },
            {
              q: "reload vs restart in Nginx?",
              a: (
                <p className="mb-0">
                  Reload starts new worker processes with the new config. The old workers finish the
                  requests they are already handling, so no connection is cut. If the new config is
                  broken, the reload fails and the old config keeps running. Restart stops
                  everything and starts again. Always run <code>nginx -t</code> first.
                </p>
              ),
            },
            {
              q: "How would you rate-limit a login endpoint?",
              a: (
                <p className="mb-0">
                  I define a <code>limit_req_zone</code> keyed on the client IP, with a strict rate (a few
                  per minute). I add <code>limit_req</code> with a small burst on that location and
                  return 429. I also make sure Nginx can see the real client IP (the real_ip module
                  behind an ALB). Otherwise every user shares one counter.
                </p>
              ),
            },
            {
              q: "Nginx vs ALB — which do you pick?",
              a: (
                <p className="mb-0">
                  I pick an ALB when I need many servers, health checks, managed certificates and
                  autoscaling. I pick Nginx for a single host, for detailed caching or header rules,
                  or as a helper next to the app. Many production systems use both: the ALB outside
                  and Nginx on each server.
                </p>
              ),
            },
          ]}
        />

        <hr />

        <h2 id="practice">Practice task before Lesson 11</h2>
        <ol>
          <li>
            Install Nginx, write the <code>myapp</code> site, enable it, and reach your app on plain
            port 80 with no port number.
          </li>
          <li>
            Point a real (or free) domain at the Elastic IP, run Certbot, and confirm the padlock
            and the HTTP→HTTPS redirect.
          </li>
          <li>
            Prove port 3000 is closed from the internet with the checks in the lesson.
          </li>
          <li>
            Stop the app and load
            the site. You should see a <code>502</code>. Find the matching line in{" "}
            <code>error.log</code>. Start the app again.
          </li>
          <li>
            Add rate limiting to an endpoint and refresh it quickly many times (or loop it
            with <code>curl</code>). Watch the 200s turn into 429s.
          </li>
          <li>
            Make a deliberate typo in the config and run <code>sudo nginx -t</code>. Read the error,
            fix it, and only then reload.
          </li>
        </ol>
        <Callout kind="ok" label="Optional stretch">
          <p className="mb-0">
            Add the wildcard <code>server_name *.yourapp.com</code> block and make your app print
            the subdomain from the <code>Host</code> header. Test it by sending a fake{" "}
            <code>Host: acme.yourapp.com</code> header with curl before touching DNS.
          </p>
        </Callout>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          Nginx is the receptionist that lets your app stay private and fast. Every public request
          meets it first.
        </p>
        <ul>
          <li>
            <strong>Reverse proxy</strong>: public 80/443 to private 3000. Port 3000 is never
            open to the internet, neither in the Security Group <em>nor</em> in Docker&apos;s
            publish setting.
          </li>
          <li>
            <strong>Pass on the facts</strong>: <code>Host</code>, <code>X-Forwarded-For</code> and{" "}
            <code>X-Forwarded-Proto</code>, so the app still knows who, where and how.
          </li>
          <li>
            <strong>Do the cheap work at the front door</strong>: gzip, caching of static files, upload
            limits, rate limits, security headers.
          </li>
          <li>
            <strong>HTTPS in one command</strong> with Certbot, plus a renewal timer that you have
            checked.
          </li>
          <li>
            <strong>Test before you reload</strong> (<code>nginx -t</code>), and read{" "}
            <code>error.log</code> before guessing.
          </li>
        </ul>
        <p>
          The app is now reachable, secure and quick. Next, we move the heavy files (images, uploads
          and built assets) off the server completely, to S3 and CloudFront.
        </p>

        <hr />
        <p>
          End of Lesson 10. Next: <strong>Lesson 11 — S3 and CloudFront: Static Assets and
          CDN</strong>.
        </p>
      </div>

      <LessonPager slug={lesson.slug} />
    </article>
  );
}
