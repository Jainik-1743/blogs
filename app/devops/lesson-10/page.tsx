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
  ["1. Terminates HTTPS", "Handles the certificate and encryption so your app only ever speaks plain HTTP on localhost.", "Lesson 4 — done once, in one place"],
  ["2. Forwards requests", "Sends each request to the right app on a private port: / to Next.js, /api-v2 to another service.", "One public door, many apps behind it"],
  ["3. Compresses", "Gzips HTML, CSS, JS and JSON on the way out — often 70–80% smaller.", "Pages load faster, bandwidth costs less"],
  ["4. Caches static files", "Serves /_next/static from memory or disk without waking Node.", "Node handles logic, not file serving"],
  ["5. Protects", "Rate-limits abusers, caps upload sizes, adds security headers, hides your stack.", "A shield in front of a fragile process"],
  ["6. Survives your app", "Keeps answering (with a clean error page) when Node restarts or crashes.", "Deploys and crashes stop being ugly"],
];

const errors: [string, string, string][] = [
  ["502 Bad Gateway", "Nginx is fine but could not talk to the app: app is down, crashed, still starting, or on a different port", "docker ps / pm2 status; curl -I http://127.0.0.1:3000; check the port in proxy_pass; sudo tail /var/log/nginx/error.log (“connect() failed … Connection refused”)"],
  ["504 Gateway Timeout", "The app accepted the request but took longer than proxy_read_timeout (default 60 s)", "Find the slow endpoint. Fix it — or, if legitimately long, raise the timeout for that location only"],
  ["413 Request Entity Too Large", "Upload bigger than client_max_body_size (default 1 MB)", "Raise it to what you need (10m, 50m) — and better, upload big files straight to S3 (Lesson 11)"],
  ["Too many redirects (redirect loop)", "App and Nginx (or ALB) both redirect HTTP→HTTPS, and the app does not see X-Forwarded-Proto: https", "Pass X-Forwarded-Proto; make the app trust it; redirect in exactly one place"],
  ["Default “Welcome to nginx!” page", "Your site file is not enabled, or the default site is winning", "Symlink into sites-enabled, remove default, nginx -t, reload"],
  ["nginx: [emerg] bind() to 0.0.0.0:80 failed (Address already in use)", "Something else (Apache, a Docker container) owns port 80", "sudo ss -tlnp | grep :80; stop that service"],
  ["Certificate not renewing", "The certbot timer is not running, or port 80 is blocked so the challenge fails", "sudo certbot renew --dry-run; check Security Group allows 80"],
];

export default function LessonTenPage() {
  return (
    <article>
      <LessonIntro lesson={lesson} outline={outline} />

      <div className="lesson">
        <h2 id="concept">Concept</h2>
        <p>
          <strong>Nginx</strong> (say &ldquo;engine-x&rdquo;) is a web server that most often
          plays a supporting role: the <strong>reverse proxy</strong>. It sits on the public ports
          80 and 443, receives every request from the internet, and <em>forwards</em> it to your
          real app, which runs privately on port 3000 and never meets the internet.
        </p>
        <Callout kind="note" label="The analogy — the hotel receptionist">
          <p className="mb-0">
            Guests never walk into the kitchen and shout their order at the chef. They speak to the
            receptionist, who checks who they are, turns away troublemakers, writes down the request
            properly, and passes it to the right department. The chef (Node) concentrates on
            cooking. Nginx is the receptionist; your app is the chef.
          </p>
        </Callout>
        <NginxFlow />
        <p>
          The word <em>reverse</em> is what separates it from a normal (forward) proxy. A forward
          proxy stands in front of <em>clients</em> and hides who they are; a reverse proxy stands in
          front of <em>servers</em> and hides which server actually answered.
        </p>

        <h2 id="why-this-matters">Why port 3000 should never be public</h2>
        <p>
          In Lesson 7 you visited <code>http://SERVER_IP:3000</code> directly. That was a test
          door, and now it must be bricked up. Next.js and Node are excellent at running your logic;
          they are not designed to face the open internet directly:
        </p>
        <ul>
          <li>
            <strong>No HTTPS</strong> of their own — the browser shows &ldquo;Not secure&rdquo;.
          </li>
          <li>
            <strong>Slow-client attacks</strong>: an attacker opens thousands of connections and
            sends one byte a minute (&ldquo;Slowloris&rdquo;). Node keeps each open and runs out of
            capacity. Nginx is built to absorb exactly this.
          </li>
          <li>
            <strong>Nothing standing between the world and your code</strong> — no rate limit, no
            size cap, no header hygiene.
          </li>
          <li>
            <strong>Ugly, ports in URLs</strong>: nobody types <code>:3000</code>.
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
            Partly. An ALB (Lesson 12) also terminates TLS and balances load, so many teams skip
            Nginx entirely once they have one. Nginx still earns its place for compression, static
            caching, rate limiting, hostname routing on a single box, and for every setup that does
            not (yet) have an ALB. And the concepts are the same ones you will meet in ALB rules,
            Kubernetes ingress and API gateways, so it is worth learning once.
          </p>
        </Callout>

        <h2 id="install">Install and first look</h2>
        <CommandList
          title="On the EC2 server"
          commands={[
            { cmd: "sudo apt install -y nginx", note: "Installs and immediately starts Nginx as a systemd service" },
            { cmd: "systemctl status nginx --no-pager", note: "Should say active (running)" },
            { cmd: "curl -I http://localhost", note: "HTTP/1.1 200 OK and Server: nginx — the default welcome page" },
            { cmd: "sudo ss -tlnp | grep nginx", note: "Nginx is listening on 0.0.0.0:80" },
          ]}
        />
        <p>
          For this to work from your laptop, the Security Group must allow ports 80 and 443. In
          Lesson 6 we allowed them only from the (future) load balancer. Until Lesson 12, open them
          to the world on the app&apos;s group:
        </p>
        <Script
          title="on your laptop"
          code={`source ~/myapp-network.env
aws ec2 authorize-security-group-ingress --group-id $WEB_SG --protocol tcp --port 80  --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $WEB_SG --protocol tcp --port 443 --cidr 0.0.0.0/0
# Browse to http://SERVER_IP — you should see "Welcome to nginx!"`}
        />

        <h2 id="anatomy">How an Nginx config is organised</h2>
        <p>Configuration is text files in <code>/etc/nginx/</code>. The layout on Ubuntu:</p>
        <Script
          title="the files that matter"
          code={`/etc/nginx/
├── nginx.conf              # the main file: workers, logging, gzip defaults; includes the folders below
├── sites-available/        # one file per website — all of them, enabled or not
│   ├── default
│   └── myapp               # ← the file you will create
├── sites-enabled/          # symlinks to the files in sites-available that are LIVE
│   └── myapp -> ../sites-available/myapp
└── /var/log/nginx/
    ├── access.log          # one line per request
    └── error.log           # what went wrong`}
        />
        <p>
          The mental model has three nested levels. Directives are the settings; blocks group them:
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
          <strong>Enabled vs available</strong> is a safety habit: you write a site in{" "}
          <code>sites-available</code>, test it, then <em>enable</em> it with a symlink. Removing
          the symlink disables the site without deleting your work.
        </p>

        <h2 id="proxy">The reverse-proxy config, line by line</h2>
        <p>
          Create <code>/etc/nginx/sites-available/myapp</code>. This is the complete, production
          shaped file we will refine through the lesson; first the core:
        </p>
        <Script
          title="/etc/nginx/sites-available/myapp"
          code={`# Lets WebSocket connections (Next.js dev tools, chat, live updates) pass through
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    listen [::]:80;                       # same, for IPv6
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
            { cmd: "sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/myapp", note: "Turn the site on" },
            { cmd: "sudo rm /etc/nginx/sites-enabled/default", note: "Remove the welcome page so it does not answer for your domain" },
            { cmd: "sudo nginx -t", note: "ALWAYS test the syntax before reloading. Prints “syntax is ok … test is successful”" },
            { cmd: "sudo systemctl reload nginx", note: "Apply the change without dropping any connection (restart would cut them)" },
            { cmd: "curl -I -H 'Host: yourapp.com' http://localhost", note: "Test the routing locally, faking the domain name. You should get the app's response, not the Nginx welcome page" },
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
              <tr><td><code>server_name</code></td><td>Which hostnames this site answers for. One server can host many sites; Nginx picks by the <code>Host</code> header the browser sent.</td></tr>
              <tr><td><code>location /</code></td><td>Applies to every path starting with <code>/</code> (that is, all of them, unless a more specific location exists).</td></tr>
              <tr><td><code>proxy_pass http://127.0.0.1:3000</code></td><td>The one line that makes it a reverse proxy. Use <code>127.0.0.1</code>, not <code>localhost</code>, to avoid an IPv6 surprise.</td></tr>
              <tr><td><code>proxy_http_version 1.1</code></td><td>The default (1.0) cannot upgrade to WebSockets.</td></tr>
              <tr><td><code>proxy_read_timeout</code></td><td>How long to wait for the app to respond before returning 504.</td></tr>
            </tbody>
          </table>
        </div>

        <h2 id="headers">Why the forwarded headers matter</h2>
        <p>
          Here is a subtle consequence of a reverse proxy: <strong>your app no longer talks to the
          user; it talks to Nginx.</strong> Without help, every request appears to come from{" "}
          <code>127.0.0.1</code> over plain HTTP, addressed to <code>localhost:3000</code>. That
          breaks real features:
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
                <td>Tenant detection by subdomain, absolute URLs, cookies for the wrong domain</td>
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
                <td>Live features silently fail</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout kind="warn" label="Trust these headers only from your own proxy">
          <p className="mb-0">
            Any client can send a fake <code>X-Forwarded-For</code>. That is safe here only because
            the app is reachable <em>exclusively</em> through Nginx (port 3000 is closed, next
            section). If the app were public, an attacker could forge their IP and bypass every
            check. This is another reason the private port matters.
          </p>
        </Callout>

        <h2 id="performance">Compression, caching and upload limits</h2>
        <p>Add these to the same <code>server</code> block. First compression and the upload cap:</p>
        <Script
          title="inside server { ... }"
          code={`client_max_body_size 10m;             # reject uploads bigger than 10 MB with 413

gzip on;
gzip_comp_level 5;                    # 1 = fast/large … 9 = slow/small. 4–6 is the sweet spot
gzip_min_length 1024;                 # tiny responses are not worth compressing
gzip_proxied any;                     # also compress responses that came from the upstream app
gzip_types text/plain text/css text/xml application/json application/javascript
           application/xml image/svg+xml;   # text formats only. Images/PDFs are already compressed`}
        />
        <p>
          Next.js also compresses by itself, but doing it in Nginx frees Node&apos;s CPU for actual
          work. (If you turn Nginx compression on, set <code>compress: false</code> in{" "}
          <code>next.config.ts</code> to avoid doing it twice.)
        </p>
        <h3>Cache the immutable static files</h3>
        <p>
          Next.js puts hashed, never-changing build files under <code>/_next/static/</code>. The
          filename changes when the content does, so they can be cached for a year. Let Nginx
          answer these from its own cache and never bother Node:
        </p>
        <Script
          title="top of the file, outside server { }"
          code={`proxy_cache_path /var/cache/nginx/next levels=1:2 keys_zone=next_cache:10m
                 max_size=200m inactive=7d use_temp_path=off;`}
        />
        <Script
          title="inside server { ... }, above location /"
          code={`location /_next/static/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_cache next_cache;
    proxy_cache_valid 200 365d;
    add_header Cache-Control "public, max-age=31536000, immutable";
    add_header X-Cache-Status $upstream_cache_status;   # HIT or MISS — handy for debugging
}`}
        />
        <p>
          Test it: <code>curl -sI http://localhost/_next/static/chunks/main.js | grep -i
          x-cache</code> shows <code>MISS</code> the first time and <code>HIT</code> after.
          Lesson 11 pushes this idea to its limit by moving these files to a CDN.
        </p>

        <h2 id="protect">Protecting the app: rate limits and security headers</h2>
        <h3>Rate limiting</h3>
        <p>
          A login form or search endpoint that any script can call ten thousand times a second will
          take your database down or let attackers guess passwords. Nginx can cap it before Node
          ever sees the extra requests:
        </p>
        <Script
          title="top of the file: define the limit"
          code={`# 10 requests/second per client IP, remembered in a 10 MB table
limit_req_zone $binary_remote_addr zone=perip:10m rate=10r/s;`}
        />
        <Script
          title="inside server { ... }: apply it to the sensitive paths"
          code={`location /api/ {
    limit_req zone=perip burst=20 nodelay;   # allow short bursts of 20 extra, reject the rest
    limit_req_status 429;                    # "Too Many Requests", the correct status code
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}`}
        />
        <p>
          <code>rate</code> is the steady speed, <code>burst</code> is how many extra requests may
          queue up for a moment, and <code>nodelay</code> serves the burst instantly instead of
          spacing it out. For a login endpoint use a much stricter rate (for example{" "}
          <code>rate=5r/m</code>).
        </p>
        <h3>Security headers</h3>
        <Script
          title="inside server { ... }"
          code={`add_header X-Content-Type-Options "nosniff" always;            # stop browsers guessing file types
add_header X-Frame-Options "SAMEORIGIN" always;                # block clickjacking in other sites' iframes
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
server_tokens off;                                             # hide the Nginx version number`}
        />
        <Callout kind="warn" label="Two gotchas">
          <ul className="mb-0">
            <li>
              <code>add_header</code> in a <code>location</code> block <strong>replaces</strong>{" "}
              (does not add to) the ones set in the surrounding <code>server</code> block. If a
              location defines any <code>add_header</code>, repeat the security headers there.
            </li>
            <li>
              Add <code>Strict-Transport-Security</code> (HSTS) only after HTTPS works everywhere.
              It tells browsers &ldquo;never use HTTP for this site&rdquo; for a year; if HTTPS
              breaks, visitors are locked out.
            </li>
          </ul>
        </Callout>

        <h2 id="https">HTTPS with Certbot</h2>
        <p>
          Lesson 4 explained certificates and Let&apos;s Encrypt. Now you use them. Prerequisites: a
          DNS <code>A</code> record from Lesson 3 pointing your domain at the server&apos;s Elastic
          IP, and port 80 open (Let&apos;s Encrypt proves you own the domain by making an HTTP
          request to it).
        </p>
        <CommandList
          title="Get a free certificate"
          commands={[
            { cmd: "dig +short yourapp.com", note: "First check DNS actually returns your server's IP. If not, certbot will fail" },
            { cmd: "sudo apt install -y certbot python3-certbot-nginx", note: "Certbot plus its Nginx plugin" },
            { cmd: "sudo certbot --nginx -d yourapp.com -d www.yourapp.com", note: "Proves ownership, downloads the certificate, edits your config to add the 443 server block and an HTTP→HTTPS redirect" },
            { cmd: "sudo certbot renew --dry-run", note: "Simulates a renewal. Certificates last 90 days; a systemd timer renews them automatically at 30 days left" },
            { cmd: "systemctl list-timers | grep certbot", note: "Confirms the auto-renew timer exists — the thing that stops the 3 a.m. “certificate expired” outage" },
          ]}
        />
        <p>Open your config afterwards and read what Certbot did — never treat generated config as magic:</p>
        <Script
          title="what the file looks like after certbot"
          code={`server {
    server_name yourapp.com www.yourapp.com;

    location / { ... }   # unchanged: the proxy_pass block from before

    listen 443 ssl;      # managed by Certbot
    ssl_certificate     /etc/letsencrypt/live/yourapp.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourapp.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;     # modern TLS versions and ciphers only
}

server {                 # the new redirect block
    listen 80;
    server_name yourapp.com www.yourapp.com;
    return 301 https://$host$request_uri;                # permanent redirect to HTTPS
}`}
        />
        <p>
          Test it: <code>curl -I http://yourapp.com</code> returns <code>301</code> to https, and{" "}
          <code>curl -I https://yourapp.com</code> returns <code>200</code>. Then run your domain
          through <em>ssllabs.com/ssltest</em> — the certbot defaults score an A.
        </p>
        <Callout kind="note" label="Redirecting www to the bare domain (or the reverse)">
          <p className="mb-0">
            Search engines treat <code>www.yourapp.com</code> and <code>yourapp.com</code> as two
            sites. Pick one canonical form and add a small <code>server</code> block that{" "}
            <code>return 301 https://yourapp.com$request_uri;</code> for the other.
          </p>
        </Callout>

        <h2 id="alb">Nginx behind a load balancer</h2>
        <p>
          In Lesson 12 an ALB will sit in front of your servers and terminate HTTPS itself using a
          free ACM certificate. Then Nginx receives plain HTTP from the ALB, and two things change:
        </p>
        <ul>
          <li>
            <strong>No Certbot on the servers.</strong> Nginx listens only on port 80, and the
            certificate lives on the ALB.
          </li>
          <li>
            <strong>The real client IP and protocol arrive in headers from the ALB</strong>, not
            from Nginx&apos;s own socket. Tell Nginx to believe those headers from the VPC, and pass
            the ALB&apos;s protocol header on instead of overwriting it:
          </li>
        </ul>
        <Script
          title="behind-ALB adjustments"
          code={`# Trust X-Forwarded-For only when it comes from inside our VPC (the ALB)
set_real_ip_from 10.0.0.0/16;
real_ip_header   X-Forwarded-For;
real_ip_recursive on;

# The ALB already says http or https. Forward ITS value, not Nginx's own $scheme (always "http" here).
map $http_x_forwarded_proto $forwarded_proto {
    default $http_x_forwarded_proto;
    ''      $scheme;
}
# ...and in the location block:  proxy_set_header X-Forwarded-Proto $forwarded_proto;

# A cheap endpoint for the ALB health check that does not wake the app
location = /nginx-health { access_log off; return 200 "ok\\n"; }`}
        />
        <p>
          Get this wrong and you will see the classic symptom: <em>redirect loop</em>. The app
          thinks the request was HTTP (because Nginx said so), redirects to HTTPS, the ALB sends it
          back, and the browser gives up.
        </p>

        <h2 id="tenants">Multi-tenant subdomains</h2>
        <p>
          Lesson 3 set up a wildcard DNS record <code>*.yourapp.com</code> so every customer gets a
          subdomain with no DNS work. Nginx makes the same idea work on the server: one{" "}
          <code>server</code> block answers for <em>all</em> subdomains, and the app decides the
          tenant from the <code>Host</code> header we already forward.
        </p>
        <Script
          title="one block, every customer"
          code={`server {
    listen 80;
    server_name yourapp.com *.yourapp.com;      # wildcard match

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;             # the app reads "acme.yourapp.com" → tenant "acme"
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`}
        />
        <Callout kind="warn" label="Wildcard HTTPS needs a different challenge">
          <p className="mb-0">
            A certificate for <code>*.yourapp.com</code> cannot be proven by an HTTP request; Let&apos;s
            Encrypt requires a DNS challenge (a TXT record). With Route 53 that is automatic:{" "}
            <code>sudo certbot certonly --dns-route53 -d yourapp.com -d &quot;*.yourapp.com&quot;</code>{" "}
            using the <code>python3-certbot-dns-route53</code> plugin and an IAM role that may edit
            the hosted zone. Or skip all of it by putting the wildcard certificate on the ALB with
            ACM, which handles wildcards and renewals for free (Lesson 12).
          </p>
        </Callout>

        <h2 id="firewall">Close the door on 3000</h2>
        <p>
          Now that Nginx is the front door, make sure it is the <em>only</em> door. Check both
          layers:
        </p>
        <CommandList
          title="Prove port 3000 is private"
          commands={[
            { cmd: "aws ec2 revoke-security-group-ingress --group-id $WEB_SG --protocol tcp --port 3000 --cidr <YOUR-IP>/32", note: "From your laptop: remove the temporary rule from Lesson 7 (skip if you never added it)" },
            { cmd: "sudo ss -tlnp | grep 3000", note: "On the server: with Docker's -p 127.0.0.1:3000:3000 you should see 127.0.0.1:3000, never 0.0.0.0:3000 or *:3000" },
            { cmd: "curl -m 5 http://SERVER_IP:3000", note: "From your laptop: must time out or be refused. If you get the app, port 3000 is still exposed" },
            { cmd: "curl -I https://yourapp.com", note: "The public path still works" },
          ]}
        />

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
              <tr><td>Apply config with no dropped connections</td><td><code>sudo systemctl reload nginx</code></td></tr>
              <tr><td>Full restart (rarely needed)</td><td><code>sudo systemctl restart nginx</code></td></tr>
              <tr><td>Watch requests live</td><td><code>sudo tail -f /var/log/nginx/access.log</code></td></tr>
              <tr><td>See errors</td><td><code>sudo tail -f /var/log/nginx/error.log</code></td></tr>
              <tr><td>Print the whole effective config</td><td><code>sudo nginx -T | less</code></td></tr>
              <tr><td>Top 10 IPs hitting you</td><td><code>awk &apos;&#123;print $1&#125;&apos; /var/log/nginx/access.log | sort | uniq -c | sort -rn | head</code></td></tr>
              <tr><td>Count of each status code</td><td><code>awk &apos;&#123;print $9&#125;&apos; /var/log/nginx/access.log | sort | uniq -c | sort -rn</code></td></tr>
            </tbody>
          </table>
        </div>
        <p>A line in the access log reads like this, left to right:</p>
        <Script
          title="/var/log/nginx/access.log"
          code={`203.0.113.7 - - [15/Jan/2026:09:30:12 +0000] "GET /dashboard HTTP/2.0" 200 5123 "https://yourapp.com/" "Mozilla/5.0 ..."
# client IP        timestamp                    method path  protocol  status bytes  referrer            browser`}
        />
        <Callout kind="ok" label="The habit that saves careers">
          <p className="mb-0">
            <code>nginx -t</code> <em>before</em> every reload. A typo in the config, reloaded
            blindly, takes every site on the server down. <code>-t</code> catches it while the old
            config keeps serving.
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
            <strong>502</strong> = the app is not there (or refused). <strong>503</strong> = overloaded
            or deliberately unavailable. <strong>504</strong> = the app is there but too slow. If the
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
                  A server in front of your application servers that receives client requests and
                  forwards them. It centralises TLS termination, compression, caching, rate limiting
                  and routing, hides the internal topology, and shields the app from slow or
                  malicious clients.
                </p>
              ),
            },
            {
              q: "Forward proxy vs reverse proxy?",
              a: (
                <p className="mb-0">
                  A forward proxy acts on behalf of clients (corporate proxy, VPN) and hides the
                  client from servers. A reverse proxy acts on behalf of servers and hides the
                  servers from clients.
                </p>
              ),
            },
            {
              q: "Users get 502 right after a deploy. Where do you look?",
              a: (
                <p className="mb-0">
                  Nginx error log for “connection refused”, then whether the app process/container
                  is up and on the expected port. Usually the app crashed on start (bad env,
                  failed migration) or is still booting; add a health check and zero-downtime
                  reload.
                </p>
              ),
            },
            {
              q: "Why does the app need X-Forwarded-Proto?",
              a: (
                <p className="mb-0">
                  TLS ends at the proxy, so the app sees plain HTTP. The header tells it the
                  original scheme for redirects, secure cookies and generated URLs. Missing it
                  causes redirect loops.
                </p>
              ),
            },
            {
              q: "reload vs restart in Nginx?",
              a: (
                <p className="mb-0">
                  Reload starts new workers with the new config and lets old workers finish their
                  in-flight requests: no dropped connections. Restart kills everything and starts
                  again. Always <code>nginx -t</code> first.
                </p>
              ),
            },
            {
              q: "How would you rate-limit a login endpoint?",
              a: (
                <p className="mb-0">
                  <code>limit_req_zone</code> keyed on client IP with a strict rate (a few per
                  minute), <code>limit_req</code> with a small burst on that location, return 429 —
                  and make sure the real client IP is visible (real_ip module behind an ALB), or
                  every user shares one bucket.
                </p>
              ),
            },
            {
              q: "Nginx vs ALB — which do you pick?",
              a: (
                <p className="mb-0">
                  ALB when you need multiple servers, health-checked targets, managed certificates
                  and autoscaling integration. Nginx for a single host, fine-grained caching or
                  header logic, and as a sidecar. Many production systems use both: ALB outside,
                  Nginx per server.
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
            and the HTTP→HTTPS redirect. Run <code>certbot renew --dry-run</code>.
          </li>
          <li>
            Prove port 3000 is closed from the internet with the two checks in the lesson.
          </li>
          <li>
            Stop the app (<code>docker stop myapp</code> or <code>pm2 stop myapp</code>) and load
            the site. You should see a <code>502</code>. Find the matching line in{" "}
            <code>error.log</code>. Start the app again.
          </li>
          <li>
            Add rate limiting to an endpoint and hit it with{" "}
            <code>for i in $(seq 1 60); do curl -s -o /dev/null -w &quot;%&#123;http_code&#125; &quot;
            https://yourapp.com/api/x; done</code>. Watch the 200s turn into 429s.
          </li>
          <li>
            Make a deliberate typo in the config and run <code>sudo nginx -t</code>. Read the error,
            fix it, and only then reload.
          </li>
        </ol>
        <Callout kind="ok" label="Optional stretch">
          <p className="mb-0">
            Add the wildcard <code>server_name *.yourapp.com</code> block and make your app print
            the subdomain from the <code>Host</code> header. Then test with{" "}
            <code>curl -H &quot;Host: acme.yourapp.com&quot; http://localhost</code> before touching
            DNS.
          </p>
        </Callout>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          Nginx is the receptionist that lets your app stay private, fast and boring. Every public
          request meets it first.
        </p>
        <ul>
          <li>
            <strong>Reverse proxy</strong>: public 80/443 → private 3000. Port 3000 is never
            exposed, at the Security Group <em>or</em> the Docker publish level.
          </li>
          <li>
            <strong>Forward the truth</strong>: <code>Host</code>, <code>X-Forwarded-For</code> and{" "}
            <code>X-Forwarded-Proto</code> so the app still knows who, where and how.
          </li>
          <li>
            <strong>Do the cheap work at the edge</strong>: gzip, static caching, upload limits, rate
            limits, security headers.
          </li>
          <li>
            <strong>HTTPS in one command</strong> with Certbot, plus a renewal timer you have
            verified.
          </li>
          <li>
            <strong>Test before you reload</strong> (<code>nginx -t</code>), and read{" "}
            <code>error.log</code> before guessing.
          </li>
        </ul>
        <p>
          The app is now reachable, secure and quick. Next: move the heavy files — images, uploads
          and built assets — off the server entirely, to S3 and CloudFront.
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
