import type { CheatSheet } from "../types.ts";

/** Cheat sheet for the "networking" series. See scripts/SERIES-SHEETS.md. */
export const SHEET: CheatSheet | null = {
  intro:
    "How a request travels from `fetch()` to `res.end()`: layers, IP, TCP, DNS, HTTP, TLS, proxies, live connections, and the tools to debug each step. Debug **one layer at a time, from the bottom up**.",
  sections: [
    {
      title: "Layers and encapsulation",
      lesson: 0,
      blocks: [
        {
          kind: "table",
          head: ["Layer", "Does", "Address"],
          rows: [
            ["2 Link (Ethernet)", "Frames on one local network", "MAC: next stop"],
            ["3 Internet (IP)", "Packets between any two machines", "IP: final stop"],
            ["4 Transport (TCP, UDP)", "Right program, TCP adds order", "Port"],
            ["7 Application", "HTTP, DNS, TLS", "Name, URL"],
          ],
        },
        {
          kind: "points",
          items: [
            "Each layer wraps the one above. A bare SYN is **74 bytes**: 14 Ethernet, 20 IP, 40 TCP.",
            "A connection is named by 4 values: source IP and port, destination IP and port.",
            "TTL drops by 1 per router; at 0 the packet dies (`traceroute` uses this). MTU is usually 1500; 'small works, big hangs' means MTU.",
            "A request costs DNS, TCP, TLS, then HTTP. Round trips beat bandwidth.",
          ],
        },
      ],
    },
    {
      title: "IPv4, CIDR and subnets",
      lesson: 1,
      blocks: [
        {
          kind: "table",
          head: ["Prefix", "Addresses", "Usable"],
          rows: [
            ["/8", "16,777,216", "16,777,214"],
            ["/16", "65,536", "65,534"],
            ["/24", "256", "254"],
            ["/26", "64", "62"],
            ["/30", "4", "2"],
            ["/32", "1", "One host"],
          ],
        },
        {
          kind: "points",
          items: [
            "Block size = **256 minus the mask** in the cut octet. A /26 gives blocks at 0, 64, 128, 192.",
            "Private: `10/8`, `172.16/12` (only 172.16 to 172.31), `192.168/16`. `100.64/10` is CGNAT, `127/8` loopback.",
            "Blocks nest or are fully apart. Overlapping VPCs cannot be peered, so plan CIDR first.",
            "Python `is_private` is not a safe SSRF check: use an allow list and check the resolved address.",
          ],
        },
      ],
    },
    {
      title: "Routing, NAT and IPv6",
      lesson: 1,
      blocks: [
        {
          kind: "points",
          items: [
            "Routing picks the **longest prefix match**. `0.0.0.0/0` is the default route, used when nothing else matches.",
            "Routers know only the next hop. Same subnet: ARP finds the MAC. Otherwise send to the gateway.",
            "**NAT** rewrites source IP and port and keeps a table. It blocks inbound, breaks peer-to-peer, and times out idle flows. Docker `MASQUERADE` is NAT.",
            "IPv6 is 128 bits, normal subnets are /64, no NAT needed. Handle both in code and storage.",
          ],
        },
        {
          kind: "pairs",
          rows: [
            ["ip route get ADDR", "The route that really wins"],
            ["ip -br addr", "Addresses on this machine"],
            ["traceroute -n HOST", "Where the path ends"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Behind a proxy the logs show the proxy's IP. Read `X-Forwarded-For` only from your own proxies, counting from the right.",
        },
      ],
    },
    {
      title: "TCP and UDP",
      lesson: 2,
      blocks: [
        {
          kind: "points",
          items: [
            "Handshake: SYN, SYN-ACK, ACK, one round trip. Reuse connections (keep-alive, pools).",
            "Every byte is numbered. Lost data is resent on a timer that doubles (0.2, 0.4, 0.8 s).",
            "TCP is a **byte stream**: three `send`s can arrive as one `recv`. Frame messages yourself (length prefix).",
            "**Flow control** = receiver's window (zero window: sender stops). **Congestion control** = sender's window, a sawtooth; full queues cause bufferbloat.",
          ],
        },
        {
          kind: "table",
          head: ["State / error", "Meaning"],
          rows: [
            ["Refused", "RST at once: nothing listens (exit 7)"],
            ["Timed out", "Silence: firewall drops the SYN (exit 28)"],
            ["TIME_WAIT", "Normal on the side that closed first, 60 s"],
            ["CLOSE_WAIT", "Peer closed, **your code** did not: a bug"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Always set connect, read and total timeouts: OS defaults take minutes (`tcp_retries2` 15 is about 15 min). UDP has no resend, order or error; 41 of 100 datagrams vanished silently.",
        },
      ],
    },
    {
      title: "DNS",
      lesson: 3,
      blocks: [
        {
          kind: "points",
          items: [
            "Resolver walks root, TLD, authoritative, then caches. A referral has no `aa` flag; the final answer does.",
            "Every record has a **TTL**; nothing is pushed. Lower the TTL before a move, then wait it out.",
            "Negative answers are cached too (SOA's last number). Create a record before anything queries it.",
            "UDP 53, then TCP when the answer is truncated (`tc`). Firewalls must allow both.",
          ],
        },
        {
          kind: "table",
          head: ["Answer", "Meaning"],
          rows: [
            ["NXDOMAIN", "Name does not exist"],
            ["NOERROR, empty (NODATA)", "Name exists, not for this type"],
            ["SERVFAIL", "Resolver got no good answer from the authority"],
            ["CNAME at apex", "Not allowed: SOA and NS sit there; use ALIAS"],
          ],
        },
        {
          kind: "pairs",
          rows: [
            ["dig NAME +short", "Quick answer"],
            ["dig @NS NAME +norec", "Ask one server, bypass caches"],
            ["getent hosts NAME", "What your program sees (`/etc/hosts` first)"],
          ],
        },
      ],
    },
    {
      title: "HTTP/1.1, HTTP/2 and HTTP/3",
      lesson: 4,
      blocks: [
        {
          kind: "table",
          head: ["Version", "Key idea"],
          rows: [
            ["1.1", "Text over TCP; one answer at a time; browsers open about 6 connections"],
            ["2", "Binary frames, streams, HPACK on one connection; TCP still blocks all"],
            ["3 (QUIC)", "UDP, per-stream order, TLS 1.3 built in, connection migration"],
          ],
        },
        {
          kind: "points",
          items: [
            "12 requests of 300 ms: **3.6 s** on one HTTP/1.1 connection, **0.32 s** on HTTP/2. HPACK cut headers from 548 to 42 bytes.",
            "HTTP/2 is chosen by **ALPN** in the TLS handshake. HTTP/3 is learned from `Alt-Svc`. Keep HTTP/2 working; UDP can be blocked.",
            "HTTP/2 headers are lowercase, `:authority` replaces `Host`, no `Connection` header.",
            "0-RTT can be replayed: allow it only for safe GETs.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Random `ECONNRESET` on idle keep-alive: the server closed first. Keep the client idle timeout shorter than the server and load balancer (Node default 5 s). Retry idempotent calls once.",
        },
      ],
    },
    {
      title: "TLS and certificates",
      lesson: 5,
      blocks: [
        {
          kind: "points",
          items: [
            "TLS gives confidentiality, integrity and authentication. TLS 1.3 costs one round trip after TCP and gives forward secrecy.",
            "Client checks: chain to a trusted root, dates, name in **SAN**, key usage. The server must send the **intermediate**.",
            "**SNI** (host name) is plain text; TLS 1.3 encrypts the certificate. HTTPS still shows the IP and host.",
            "Let's Encrypt: **HTTP-01** needs port 80, no wildcard. **DNS-01** uses a TXT at `_acme-challenge`, allows wildcards. Certs are 90 days or less: automate and alert 14 days ahead.",
          ],
        },
        {
          kind: "table",
          head: ["Error", "Usual cause"],
          rows: [
            ["UNABLE_TO_VERIFY_LEAF_SIGNATURE", "Missing intermediate (works in browsers only)"],
            ["CERT_HAS_EXPIRED", "Expired, or wrong client clock"],
            ["ERR_TLS_CERT_ALTNAME_INVALID", "Host name not in SAN"],
            ["DEPTH_ZERO_SELF_SIGNED_CERT", "Self-signed or private CA"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Never use `-k`, `rejectUnauthorized: false` or `NODE_TLS_REJECT_UNAUTHORIZED=0`: they accept imposters. Trust the right CA. HSTS locks users out if the cert breaks, so start with a short max-age.",
        },
      ],
    },
    {
      title: "Proxies, load balancers, CDN",
      lesson: 6,
      blocks: [
        {
          kind: "table",
          head: ["Item", "L4", "L7"],
          rows: [
            ["Sees", "IP and port", "HTTP: path, headers"],
            ["Does", "Copies bytes, fast", "Routes, retries, caches, adds XFF"],
          ],
        },
        {
          kind: "points",
          items: [
            "Forward proxy serves clients (HTTPS via `CONNECT`). Reverse proxy serves servers.",
            "Algorithms: round robin, weighted, least connections, hash. `ip_hash` is poor behind NAT. Prefer stateless over sticky sessions.",
            "Health checks: passive (learn from failures) or active (probes). Keep `/health` shallow.",
            "Retries can repeat payments: use idempotency keys. CDN: `Cache-Control`, `s-maxage`, `private`, `no-store`; never cache personal pages.",
          ],
        },
        {
          kind: "table",
          head: ["Code", "Meaning"],
          rows: [
            ["502", "Bad or no reply from the backend"],
            ["503", "No healthy backend or load shedding"],
            ["504", "Backend slower than the proxy timeout"],
          ],
        },
      ],
    },
    {
      title: "Live updates: polling to WebSockets",
      lesson: 7,
      blocks: [
        {
          kind: "table",
          head: ["Method", "Notes"],
          rows: [
            ["Short polling", "Simple, wasteful, late"],
            ["Long polling", "Quick, but a request per message"],
            ["SSE", "One-way `text/event-stream`, auto-reconnect, `Last-Event-ID`"],
            ["WebSocket", "Two-way; `GET` with `Upgrade`, then `101`"],
          ],
        },
        {
          kind: "code",
          lang: "nginx",
          code: "proxy_http_version 1.1;\nproxy_set_header Upgrade $http_upgrade;\nproxy_set_header Connection \"upgrade\";\n# SSE: proxy_buffering off;",
          note: "Without these, WebSockets fail in prod; buffered SSE shows 0 bytes.",
        },
        {
          kind: "points",
          items: [
            "Check `Origin` on the handshake, authenticate with a short-lived ticket, use `wss://`.",
            "Ping/pong heartbeats find dead clients; they also beat idle timeouts (nginx 60 s).",
            "Watch `bufferedAmount` for slow clients. Many servers need Redis pub/sub. 10,000 idle sockets took about 95 MB.",
          ],
        },
      ],
    },
    {
      title: "Debug with curl, ss and tcpdump",
      lesson: 8,
      blocks: [
        {
          kind: "code",
          lang: "bash",
          code: "curl -s -o /dev/null URL -w '\ndns   %{time_namelookup}\ntcp   %{time_connect}\ntls   %{time_appconnect}\nttfb  %{time_starttransfer}\ntotal %{time_total}\n'",
          note: "Values are cumulative; subtract to get each step. Run 5 to 10 times.",
        },
        {
          kind: "table",
          head: ["curl exit", "Layer"],
          rows: [
            ["6", "DNS: could not resolve"],
            ["7", "Connect: refused or blocked"],
            ["28", "Timeout"],
            ["35 / 60", "TLS handshake / certificate"],
            ["22", "HTTP error with `-f`"],
          ],
        },
        {
          kind: "pairs",
          rows: [
            ["ss -ltnp", "Who listens, on which address"],
            ["nc -zv HOST PORT", "Cleanest port test"],
            ["curl -v URL", "`>` sent, `<` received"],
            ["tcpdump -nn -i any 'host X'", "Did the SYN leave or arrive?"],
            ["openssl s_client -connect H:443", "Chain, dates, `Verify return code`"],
          ],
        },
      ],
    },
    {
      title: "Symptom to cause",
      lesson: 8,
      blocks: [
        {
          kind: "table",
          head: ["Symptom", "First check"],
          rows: [
            ["Could not resolve host", "`dig NAME`, `/etc/resolv.conf`"],
            ["Network unreachable", "`ip route`: no default route"],
            ["Connection refused", "`ss -ltnp`: service up? bound to 127.0.0.1?"],
            ["Hang, then ETIMEDOUT", "Security group or firewall; `tcpdump`"],
            ["ECONNRESET / socket hang up", "Keep-alive timeouts, who sent the RST"],
            ["Fails for some users", "One bad backend, stale DNS, IPv6, MTU"],
            ["Works on Wi-Fi, fails on VPN", "MTU: `ping -M do -s 1400 HOST`"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Ping failing proves little (ICMP is often blocked). Capture at both ends and keep the output; treat captures as sensitive.",
        },
      ],
    },
    {
      title: "Interview one-liners",
      lesson: 0,
      blocks: [
        {
          kind: "table",
          head: ["Question", "Short answer"],
          rows: [
            ["MAC vs IP?", "MAC is the next hop and changes per hop. IP is the final stop."],
            ["Refused vs timed out?", "Refused: nothing listens. Timed out: packets dropped."],
            ["Flow vs congestion control?", "Receiver's window vs the sender's own window."],
            ["Changed A record, still old IP?", "Resolvers cache until the TTL runs out."],
            ["HTTP/2 vs HTTP/3?", "HTTP/2 still has TCP head-of-line blocking; HTTP/3 does not."],
            ["Works in browser, fails in Node?", "Missing intermediate certificate."],
            ["SSE vs WebSocket?", "SSE: one-way, plain HTTP. WebSocket: two-way, more to build."],
          ],
        },
      ],
    },
  ],
};
