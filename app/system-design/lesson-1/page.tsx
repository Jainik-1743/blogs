import type { Metadata } from "next";
import Callout from "@/components/Callout";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Flow, Layers, QA, Stats } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-1")!;

export const metadata: Metadata = {
  title: `Lesson 1 — ${lesson.title}`,
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

const code1 = `traceroute www.google.com     # macOS / Linux
tracert www.google.com        # Windows`;

export default function SdLessonOnePage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            You type <code>www.amazon.com</code> into your browser, press Enter, and less than a second later the page
            appears. It feels like magic. But if you want to design systems that serve millions of users, you can't
            treat that second as magic. Every part of it is a place where things can be slow, break, or be improved.
          </p>
          <p>When a website is slow or down, the cause could be in any of these places:</p>
          <ul>
            <li>the name lookup,</li>
            <li>the network path,</li>
            <li>the server,</li>
            <li>or the database.</li>
          </ul>
          <p>This post walks through the whole journey. Every later post in this series zooms into one part of it.</p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about sending a letter to a friend. You know your friend's <strong>name</strong>, but the post office
            needs an <strong>address</strong>. So first you look up the address in your contact book. Then you write it
            on the envelope and drop it in a post box. The letter travels through several sorting centres until it
            reaches your friend's house. Your friend reads it and sends a reply the same way.
          </p>
          <p>The internet works the same way:</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Letter world</th>
                  <th>Internet world</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Friend's name ("Priya")</td>
                  <td>
                    Domain name (<code>amazon.com</code>)
                  </td>
                </tr>
                <tr>
                  <td>Contact book</td>
                  <td>DNS (Domain Name System)</td>
                </tr>
                <tr>
                  <td>House address</td>
                  <td>
                    IP address (<code>52.94.236.248</code>)
                  </td>
                </tr>
                <tr>
                  <td>Envelope</td>
                  <td>Packet</td>
                </tr>
                <tr>
                  <td>Sorting centres</td>
                  <td>Routers</td>
                </tr>
                <tr>
                  <td>Your friend</td>
                  <td>The web server</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>Two ideas matter most in this post:</p>
          <ol>
            <li>
              <strong>Computers find each other by IP address, not by name.</strong> Names are for humans.
            </li>
            <li>
              <strong>Data travels in small pieces called packets.</strong> Each packet finds its own way across many
              networks.
            </li>
          </ol>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <p>Here is the full journey, from pressing Enter to seeing the page:</p>
          <Flow
            caption="The whole journey, from Enter to pixels. Every later lesson zooms into one of these boxes."
            nodes={[
              { title: <>Browser reads the URL</>, desc: <>protocol, domain, path and query string</> },
              {
                title: <>DNS lookup</>,
                desc: <>browser cache → OS cache → resolver → root → .com → Amazon's DNS</>,
                label: (
                  <>
                    "what is the IP of{" "}
                    <a href="http://www.amazon.com" target="_blank" rel="noopener noreferrer">
                      www.amazon.com
                    </a>
                    ?"
                  </>
                ),
              },
              {
                title: <>TCP handshake</>,
                desc: <>SYN, SYN-ACK, ACK — one round trip before any data moves</>,
                label: <>IP 52.94.236.248</>,
              },
              {
                title: <>TLS handshake</>,
                desc: <>agree on keys and check the certificate (HTTPS only)</>,
                label: <>port 443</>,
              },
              { title: <>HTTP request</>, desc: <>GET /deals?page=2 with headers and cookies</> },
              {
                title: <>Server does the work</>,
                desc: <>CDN edge → load balancer → app server → cache → database</>,
                tone: "warn",
              },
              {
                title: <>HTTP response</>,
                desc: <>200 OK plus HTML, split into ~1,500-byte packets</>,
                label: <>packets back</>,
              },
              {
                title: <>Browser renders</>,
                desc: <>parses HTML, then fetches dozens of CSS, JS and image files</>,
                tone: "good",
              },
            ]}
          />
          <p>Let's go through each step.</p>
          <h3 id="step-1-the-browser-reads-the-url">Step 1: The browser reads the URL</h3>
          <p>
            A URL like <code>https://www.amazon.com/deals?page=2</code> has parts:
          </p>
          <ul>
            <li>
              <code>https</code> is the <strong>protocol</strong>: how to talk (secure HTTP).
            </li>
            <li>
              <code>www.amazon.com</code> is the <strong>domain name</strong>: who to talk to.
            </li>
            <li>
              <code>/deals</code> is the <strong>path</strong>: what you want.
            </li>
            <li>
              <code>?page=2</code> is the <strong>query string</strong>: extra details.
            </li>
          </ul>
          <p>
            If you typed something that is not a URL, like "best laptops", the browser sends it to a search engine
            instead.
          </p>
          <h3 id="step-2-dns-the-internet-s-phone-book">Step 2: DNS, the internet's phone book</h3>
          <p>
            Your computer cannot connect to "
            <a href="http://www.amazon.com" target="_blank" rel="noopener noreferrer">
              www.amazon.com
            </a>
            ". It needs a number, an <strong>IP address</strong>. DNS turns the name into the number.
          </p>
          <p>The lookup tries the fastest options first:</p>
          <ol>
            <li>
              <strong>Browser cache.</strong> Did I look this up in the last few minutes?
            </li>
            <li>
              <strong>Operating system cache.</strong> Did any app on this computer look it up?
            </li>
            <li>
              <strong>Recursive resolver.</strong> Usually your internet provider's DNS server, or a public one like
              Google's <code>8.8.8.8</code> or Cloudflare's <code>1.1.1.1</code>. It does the hard work for you.
            </li>
          </ol>
          <p>If the resolver doesn't know the answer, it asks a chain of servers:</p>
          <SequenceDiagram
            caption="A DNS cache miss. The recursive resolver does the legwork; your laptop asks once and waits."
            actors={["Laptop", "Resolver", "Root", ".com TLD", "Amazon DNS"]}
            messages={[
              {
                from: 0,
                to: 1,
                label: (
                  <>
                    <a href="http://www.amazon.com" target="_blank" rel="noopener noreferrer">
                      www.amazon.com
                    </a>
                    ?
                  </>
                ),
                note: <>not in browser or OS cache</>,
              },
              { from: 1, to: 2, label: <>who handles .com?</> },
              { from: 2, to: 1, label: <>ask the .com servers</>, reply: true },
              { from: 1, to: 3, label: <>who handles amazon.com?</> },
              { from: 3, to: 1, label: <>ask Amazon's name servers</>, reply: true },
              {
                from: 1,
                to: 4,
                label: (
                  <>
                    <a href="http://www.amazon.com" target="_blank" rel="noopener noreferrer">
                      www.amazon.com
                    </a>
                    ?
                  </>
                ),
              },
              { from: 4, to: 1, label: <>52.94.236.248</>, note: <>TTL 300 s</>, reply: true },
              {
                from: 0,
                to: 0,
                label: (
                  <>The resolver caches the answer for the TTL, so the next person on your ISP skips all of this</>
                ),
                divider: true,
              },
              { from: 1, to: 0, label: <>52.94.236.248</>, reply: true },
            ]}
          />
          <p>The resolver saves (caches) the answer for a while and gives it back to your computer.</p>
          <p>
            <strong>TTL (Time To Live).</strong> Every DNS answer comes with a TTL. This is a number of seconds that
            says how long the answer may be cached. It creates a trade-off:
          </p>
          <ul>
            <li>
              <strong>Long TTL (for example, a day):</strong> fewer lookups and faster browsing. But if the company
              changes its server IP, some users keep going to the old address for up to a day.
            </li>
            <li>
              <strong>Short TTL (for example, 60 seconds):</strong> changes spread quickly, but the DNS servers get more
              queries.
            </li>
          </ul>
          <p>
            That is why engineers <strong>lower the TTL a few days before a server migration</strong>.
          </p>
          <p>
            <strong>Common DNS record types:</strong>
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Record</th>
                  <th>What it does</th>
                  <th>Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>A</td>
                  <td>Name → IPv4 address</td>
                  <td>
                    <code>amazon.com → 52.94.236.248</code>
                  </td>
                </tr>
                <tr>
                  <td>AAAA</td>
                  <td>Name → IPv6 address</td>
                  <td>
                    <code>google.com → 2607:f8b0:...</code>
                  </td>
                </tr>
                <tr>
                  <td>CNAME</td>
                  <td>Name → another name (an alias)</td>
                  <td>
                    <code>www.shop.com → shop.netlify.app</code>
                  </td>
                </tr>
                <tr>
                  <td>MX</td>
                  <td>Where to deliver email</td>
                  <td>
                    <code>gmail.com → gmail-smtp-in.l.google.com</code>
                  </td>
                </tr>
                <tr>
                  <td>TXT</td>
                  <td>Free text, often for verification</td>
                  <td>Domain ownership, email security (SPF)</td>
                </tr>
                <tr>
                  <td>NS</td>
                  <td>Which servers are in charge of this domain</td>
                  <td>
                    <code>example.com → ns1.example-dns.com</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            When you connect a custom domain to a hosting platform like Vercel, you usually add an A or CNAME record.
            You are editing DNS.
          </p>
          <h3 id="step-3-ip-addresses-packets-and-routers">Step 3: IP addresses, packets and routers</h3>
          <p>Now the browser knows the IP address, so it can start talking.</p>
          <p>
            <strong>IP addresses</strong> come in two versions:
          </p>
          <ul>
            <li>
              <strong>IPv4</strong> looks like <code>192.168.1.10</code>. There are only about 4.3 billion of these, and
              the world ran out.
            </li>
            <li>
              <strong>IPv6</strong> looks like <code>2001:db8::1</code>. There are so many that we won't run out.
            </li>
          </ul>
          <p>
            <strong>Public vs private IPs.</strong> Your laptop at home probably has a private address like{" "}
            <code>192.168.1.5</code>. Your Wi-Fi router has one public address shared by every device in the house. The
            router uses <strong>NAT (Network Address Translation)</strong>. It rewrites outgoing packets so they carry
            the public address, and it remembers which reply belongs to which device. This is why your laptop can visit
            websites, but a stranger on the internet can't directly connect to your laptop.
          </p>
          <p>
            <strong>Packets.</strong> Your request isn't sent as one big blob. It is cut into packets, usually up to
            about 1,500 bytes each. Each packet carries:
          </p>
          <ul>
            <li>a source IP (you),</li>
            <li>a destination IP (Amazon),</li>
            <li>and a piece of the data.</li>
          </ul>
          <p>
            <strong>Routers</strong> are the sorting centres. Each router looks at the destination IP and sends the
            packet one "hop" closer. A router doesn't read your data; it only looks at the address on the envelope. A
            packet from India to a US server might pass through 10 to 20 routers.
          </p>
          <p>You can see this yourself:</p>
          <CodeBlock code={code1} />
          <p>Each line is one router on the path, with the time it took to reach it.</p>
          <p>
            <strong>How do routers know the way?</strong> Big networks (internet providers, cloud companies, Google,
            Facebook) use a protocol called <strong>BGP (Border Gateway Protocol)</strong> to announce "I can reach
            these IP addresses". Other networks learn routes from these announcements. BGP is the internet's map, built
            by many companies telling each other which roads they own.
          </p>
          <p>
            <strong>Ports.</strong> An IP address finds the machine. A <strong>port</strong> finds the program on that
            machine. Some well-known ports:
          </p>
          <ul>
            <li>80 for HTTP,</li>
            <li>443 for HTTPS,</li>
            <li>22 for SSH,</li>
            <li>5432 for PostgreSQL,</li>
            <li>53 for DNS.</li>
          </ul>
          <h3 id="step-4-the-network-layers">Step 4: The network layers</h3>
          <p>
            Networking is organised in <strong>layers</strong>. Each layer does one job and trusts the layer below it.
            The simple TCP/IP model has four:
          </p>
          <Layers
            caption="The four-layer TCP/IP model. Each layer does one job and trusts the one below it."
            layers={[
              { name: <>Application · L7</>, tech: <>HTTP, DNS, TLS</>, desc: <>“What are we saying?”</> },
              { name: <>Transport · L4</>, tech: <>TCP, UDP</>, desc: <>“Is it reliable? Which program (port)?”</> },
              { name: <>Internet · L3</>, tech: <>IP</>, desc: <>“Which machine, which route?”</> },
              { name: <>Link · L2</>, tech: <>Wi-Fi, Ethernet</>, desc: <>“How do bits cross this cable?”</> },
            ]}
          />
          <p>
            You'll also hear about the <strong>OSI model</strong> with 7 layers. In system design, people often say
            "Layer 4" and "Layer 7":
          </p>
          <ul>
            <li>
              <strong>Layer 4</strong> means the transport layer (TCP/UDP).
            </li>
            <li>
              <strong>Layer 7</strong> means the application layer (HTTP).
            </li>
          </ul>
          <p>
            This matters later: an <strong>L4 load balancer</strong> only sees IPs and ports, while an{" "}
            <strong>L7 load balancer</strong> can read the URL and headers.
          </p>
          <h3 id="step-5-connect-secure-request">Step 5: Connect, secure, request</h3>
          <p>Next, the browser:</p>
          <ol>
            <li>
              opens a <strong>TCP connection</strong> (a quick three-message "hello" called a handshake, covered in the
              next post),
            </li>
            <li>
              sets up <strong>TLS</strong> encryption for HTTPS (post 3),
            </li>
            <li>
              sends an <strong>HTTP request</strong> such as <code>GET /deals?page=2</code>.
            </li>
          </ol>
          <h3 id="step-6-the-server-does-the-work">Step 6: The server does the work</h3>
          <p>The request usually does not land on a single computer. On a big site it goes through several layers:</p>
          <Flow
            caption="On a big site, one request passes several tiers before it reaches any data."
            nodes={[
              { title: <>Your browser</>, desc: <>sends GET /deals?page=2</> },
              {
                title: <>CDN edge</>,
                desc: <>a nearby copy of images, CSS and JS — often answers without going further</>,
              },
              { title: <>Load balancer</>, desc: <>spreads requests across many identical servers</> },
              { title: <>App server</>, desc: <>runs the code for this page</> },
              {
                title: <>Cache (Redis)</>,
                desc: <>“Do we already have the answer?” — sub-millisecond</>,
                tone: "good",
              },
              {
                title: <>Database</>,
                desc: <>“Fetch the deals for page 2” — the slowest, most precious tier</>,
                tone: "warn",
              },
            ]}
          />
          <p>Each of these gets its own post in Part 3.</p>
          <h3 id="step-7-and-8-response-and-rendering">Step 7 and 8: Response and rendering</h3>
          <p>
            The server sends back an HTTP response, like <code>200 OK</code> with HTML. The browser:
          </p>
          <ol>
            <li>reads the HTML,</li>
            <li>finds links to CSS, JavaScript and images,</li>
            <li>requests all of those too (often dozens of extra requests),</li>
            <li>builds the page on your screen.</li>
          </ol>
          <p>
            Open your browser's DevTools, go to the <strong>Network</strong> tab and reload any site. You'll see every
            request, and how much time each one spent on DNS, connecting, TLS, waiting and downloading.
          </p>
          <h3 id="why-distance-matters-latency">Why distance matters: latency</h3>
          <p>
            Signals in fibre-optic cable travel at about 200,000 km per second, roughly two-thirds of the speed of
            light. That sounds instant, but:
          </p>
          <ul>
            <li>
              London → New York is about 5,500 km. One way takes at least about 28 ms, so a round trip takes about 56
              ms.
            </li>
            <li>
              London → Sydney is about 17,000 km. The round trip is at least about 170 ms, and often 250 ms or more in
              practice.
            </li>
          </ul>
          <p>
            A page that needs 5 round trips before showing anything will feel slow to someone far away, no matter how
            fast the server is. <strong>This is why companies put servers and CDNs close to users.</strong> You can't
            make light faster, but you can make the distance shorter.
          </p>
          <Stats
            caption="Light in fibre covers ~200,000 km/s. Distance sets a floor on latency that no server can beat."
            stats={[
              { value: <>~56 ms</>, label: <>London ⇄ New York</>, sub: <>round trip, at best</> },
              { value: <>~170 ms</>, label: <>London ⇄ Sydney</>, sub: <>often 250 ms+ in practice</> },
              { value: <>5 × RTT</>, label: <>before first byte</>, sub: <>DNS + TCP + TLS + request</> },
            ]}
          />
          <Callout kind="note" label="Try it yourself">
            <p>
              Open DevTools → <strong>Network</strong>, reload any site and hover the waterfall bar of the first
              request. You will see the exact time spent in each step of this lesson: DNS lookup, initial connection,
              SSL, waiting (server time) and content download.
            </p>
          </Callout>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>DNS caching:</strong> makes browsing fast, but makes changes slow to spread. The TTL is the knob
              that controls this.
            </li>
            <li>
              <strong>Many small packets vs fewer large ones:</strong> small packets recover from loss more easily.
              Large ones waste less space on headers.
            </li>
            <li>
              <strong>NAT:</strong> saves IPv4 addresses and hides home devices, but makes direct device-to-device
              connections (like video calls or gaming) harder. That is why apps like Zoom need extra tricks to connect
              peers.
            </li>
            <li>
              <strong>Relying on one DNS provider:</strong> simple, but if that provider goes down, your site
              "disappears" even though your servers are fine.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Facebook's 6-hour outage (October 2021).</strong> During routine maintenance, a configuration change
            caused Facebook's BGP routes to be withdrawn. The rest of the internet no longer knew how to reach
            Facebook's networks, including its DNS servers. Every DNS lookup for facebook.com, instagram.com and
            whatsapp.com failed. Billions of users were affected, and even Facebook's employees reportedly had trouble
            getting into buildings because internal tools were down. The servers themselves were running fine. The
            problem was that nobody could find them.
          </p>
          <p>
            <strong>The Dyn DNS attack (October 2016).</strong> A huge attack from hacked internet-connected devices
            (the Mirai botnet) flooded Dyn, a major DNS provider. Sites like Twitter, Netflix, Reddit and GitHub became
            unreachable for many users on the US East Coast. After this, many companies started using{" "}
            <strong>more than one DNS provider</strong>.
          </p>
          <p>
            <strong>Public DNS resolvers.</strong> Google (<code>8.8.8.8</code>) and Cloudflare (<code>1.1.1.1</code>)
            run free resolvers used by millions. Some people switch to them because they can be faster or more private
            than their internet provider's default.
          </p>
          <p>
            <strong>Hosting a blog on Vercel or Netlify.</strong> When you point your domain at a hosting platform, it
            asks you to add a DNS record. Behind the scenes, its DNS and CDN send each visitor to a nearby edge
            location. The idea from this post (put servers close to users) is built into the platform for you.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>Walk me through what happens when you type a URL and press Enter.</>,
                a: (
                  <>
                    <p>
                      The browser parses the URL, then resolves the domain to an IP through DNS (browser cache, OS
                      cache, recursive resolver, then root → TLD → authoritative servers). It opens a TCP connection to
                      port 443, runs a TLS handshake to agree on keys and verify the certificate, and sends an HTTP
                      request. The request usually passes a CDN and a load balancer before an app server builds the
                      response from cache or database. The response comes back as packets, and the browser renders the
                      HTML and fetches the CSS, JS and images it references.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why do engineers lower a DNS TTL a few days before migrating servers?</>,
                a: (
                  <>
                    <p>
                      Resolvers everywhere may cache the old answer for up to the TTL. Lowering it in advance (say from
                      a day to 60 seconds) means that when the IP finally changes, stale copies expire within a minute
                      instead of a day.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is the difference between an L4 and an L7 load balancer?</>,
                a: (
                  <>
                    <p>
                      L4 works at the transport layer and sees only IPs and ports, so it forwards whole connections. L7
                      works at the application layer and can read the HTTP request (path, headers, cookies), so it can
                      route /api to one pool and /images to another.
                    </p>
                  </>
                ),
              },
              {
                q: <>Your servers are healthy but nobody can reach your site. What could be wrong?</>,
                a: (
                  <>
                    <p>
                      The path to the servers, not the servers: DNS (expired domain, broken records, DNS provider
                      outage), BGP routes withdrawn (as in Facebook's 2021 outage), an expired TLS certificate, or a CDN
                      or load balancer misconfiguration. Checking with dig, traceroute and curl -v narrows it down layer
                      by layer.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why can't a faster server fix slow page loads for users in Australia?</>,
                a: (
                  <>
                    <p>
                      Much of the time is round trips, and each round trip is limited by the speed of light in fibre.
                      The fix is to shorten the distance with CDNs and regional servers, and to cut the number of round
                      trips (connection reuse, HTTP/2 or HTTP/3, fewer blocking requests).
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
              Computers talk using <strong>IP addresses</strong>. <strong>DNS</strong> turns human-friendly names into
              those addresses.
            </li>
            <li>
              DNS answers are <strong>cached</strong> everywhere, and the <strong>TTL</strong> controls how long. That
              is why DNS changes take time to spread.
            </li>
            <li>
              Data travels in <strong>packets</strong> through many <strong>routers</strong>. <strong>BGP</strong> is
              how networks learn routes.
            </li>
            <li>
              Networking works in <strong>layers</strong>: link, IP, TCP/UDP, and HTTP on top. "L4" and "L7" come from
              this.
            </li>
            <li>
              <strong>Distance adds latency</strong> you can't remove, so big sites put servers and CDNs near users.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              <em>Computer Networking: A Top-Down Approach</em> by Kurose and Ross (chapters 1 and 4)
            </li>
            <li>
              <em>High Performance Browser Networking</em> by Ilya Grigorik (chapter 1, "Primer on Latency and
              Bandwidth")
            </li>
            <li>The open-source "what-happens-when" project on GitHub (a very detailed version of this post)</li>
            <li>Cloudflare Learning Center articles on DNS and BGP</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
