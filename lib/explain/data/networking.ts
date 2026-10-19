import type { ExplainerData } from "../types.ts";

/** Explainers for the "networking" series. Names must start with "networking-" followed by the lesson number. */
export const DATA: ExplainerData = {
  "networking-0-request-journey": {
    "kind": "seq",
    "title": "What happens when you open a page",
    "actors": [
      {
        "name": "Browser"
      },
      {
        "name": "DNS resolver"
      },
      {
        "name": "Web server"
      }
    ],
    "steps": [
      {
        "from": 0,
        "to": 1,
        "label": "example.com ?",
        "title": "Find the address",
        "note": "Computers talk to numbers, not names. The browser asks DNS: what is the address of example.com?"
      },
      {
        "from": 1,
        "to": 0,
        "label": "203.0.113.7",
        "title": "The name becomes an address",
        "note": "DNS answers with an IP address. Now the browser knows where to send packets."
      },
      {
        "from": 0,
        "to": 2,
        "label": "SYN",
        "title": "Open a TCP connection (1 of 3)",
        "note": "TCP gives you a reliable stream of bytes. It starts with a short hello: three tiny packets."
      },
      {
        "from": 2,
        "to": 0,
        "label": "SYN-ACK",
        "title": "Open a TCP connection (2 of 3)",
        "note": "The server agrees to the connection and sends its own hello back."
      },
      {
        "from": 0,
        "to": 2,
        "label": "ACK",
        "title": "Open a TCP connection (3 of 3)",
        "note": "The connection is open. Nothing is encrypted yet."
      },
      {
        "from": 0,
        "to": 2,
        "label": "TLS: ClientHello",
        "title": "Agree on encryption",
        "note": "For https, the browser now starts TLS: it says which encryption it supports and sends a key share."
      },
      {
        "from": 2,
        "to": 0,
        "label": "TLS: certificate + keys",
        "title": "The server proves who it is",
        "note": "The server sends its certificate. Both sides work out the same secret keys. From here on everything is encrypted. (TLS 1.3 needs one round trip.)"
      },
      {
        "from": 0,
        "to": 2,
        "label": "GET /  (encrypted)",
        "title": "Send the HTTP request",
        "note": "Finally the browser asks for the page. Only now does the web server see which page was requested."
      },
      {
        "from": 2,
        "to": 0,
        "label": "200 OK + HTML",
        "title": "Receive the page",
        "note": "The server answers with a status code and the HTML. The browser then asks for the CSS, scripts and images the page mentions."
      }
    ]
  },
  "networking-2-tcp-handshake": {
    "kind": "seq",
    "title": "The TCP three-way handshake",
    "actors": [
      {
        "name": "Client",
        "sub": "your program"
      },
      {
        "name": "Server",
        "sub": "listening on a port"
      }
    ],
    "steps": [
      {
        "from": 0,
        "to": 1,
        "label": "SYN  (my first number is x)",
        "title": "The client asks to connect",
        "note": "The client sends a SYN packet ('synchronise') with a random starting number, call it x. It means: I want to talk, and my first byte will be numbered x."
      },
      {
        "from": 1,
        "to": 0,
        "label": "SYN-ACK  (mine is y, I got x)",
        "title": "The server says yes",
        "note": "The server picks its own random starting number y and acknowledges x + 1. A SYN uses up one number, so the answer is the client's number plus one."
      },
      {
        "from": 0,
        "to": 1,
        "label": "ACK  (I got y)",
        "title": "The client confirms",
        "note": "The client acknowledges y + 1. Now both sides know the other can send and receive, and the connection is open."
      },
      {
        "from": 0,
        "to": 1,
        "label": "data: ping",
        "title": "Data starts to flow",
        "note": "From now on every byte has a number. The client can send its first bytes (it may even ride on the third packet)."
      },
      {
        "from": 1,
        "to": 0,
        "label": "ACK + data: pong",
        "title": "Every byte is confirmed",
        "note": "The server acknowledges the bytes it got and sends its own. Anything that is not acknowledged in time is sent again."
      }
    ]
  },
  "networking-2-tcp-close": {
    "kind": "seq",
    "title": "Closing a TCP connection",
    "actors": [
      {
        "name": "Side A",
        "sub": "closes first"
      },
      {
        "name": "Side B",
        "sub": "the other end"
      }
    ],
    "steps": [
      {
        "from": 0,
        "to": 1,
        "label": "FIN",
        "title": "Side A says it is finished sending",
        "note": "A FIN packet means: I have no more data to send. A can still receive."
      },
      {
        "from": 1,
        "to": 0,
        "label": "ACK",
        "title": "Side B confirms",
        "note": "B acknowledges the FIN. The A-to-B direction is now closed."
      },
      {
        "from": 1,
        "to": 0,
        "label": "FIN",
        "title": "Side B finishes too",
        "note": "When B has sent everything it wanted to, it sends its own FIN. Each direction closes on its own, which is why closing takes up to four packets."
      },
      {
        "from": 0,
        "to": 1,
        "label": "ACK",
        "title": "Side A confirms the last FIN",
        "note": "Both directions are closed."
      },
      {
        "from": 0,
        "to": 0,
        "self": true,
        "label": "TIME_WAIT  (about 60 s)",
        "title": "The first closer waits a little",
        "note": "Side A keeps the connection's details for about a minute, so a late packet from this connection cannot be mistaken for part of a new one on the same ports."
      }
    ]
  },
  "networking-3-dns-lookup": {
    "kind": "seq",
    "title": "How a DNS lookup finds an address",
    "actors": [
      {
        "name": "Your app"
      },
      {
        "name": "Resolver",
        "sub": "ISP or public"
      },
      {
        "name": "Root server"
      },
      {
        "name": ".com server",
        "sub": "TLD"
      },
      {
        "name": "Authoritative",
        "sub": "owns example.com"
      }
    ],
    "steps": [
      {
        "from": 0,
        "to": 1,
        "label": "www.example.com ?",
        "title": "Your app asks the resolver",
        "note": "Your computer asks a resolver (usually your internet provider's, or a public one) for the address of www.example.com. If the resolver already has a fresh answer saved, it replies at once. Here it does not."
      },
      {
        "from": 1,
        "to": 2,
        "label": "www.example.com ?",
        "title": "The resolver asks a root server",
        "note": "It starts at the top. A root server does not know the address, but it knows who runs each ending, such as .com."
      },
      {
        "from": 2,
        "to": 1,
        "label": "ask the .com servers",
        "title": "The root sends a referral",
        "note": "The answer is not an address. It is a pointer: for .com, ask these servers."
      },
      {
        "from": 1,
        "to": 3,
        "label": "www.example.com ?",
        "title": "The resolver asks the .com servers",
        "note": "These servers know which name servers are in charge of every .com domain."
      },
      {
        "from": 3,
        "to": 1,
        "label": "ask ns1.example.com",
        "title": "Another referral",
        "note": "They reply with the name servers for example.com. We are one step away."
      },
      {
        "from": 1,
        "to": 4,
        "label": "www.example.com ?",
        "title": "The resolver asks the authoritative server",
        "note": "This server holds the real records for example.com, so it can give a real answer."
      },
      {
        "from": 4,
        "to": 1,
        "label": "A 203.0.113.7  TTL 300",
        "title": "The answer arrives",
        "note": "An A record with the IP address, and a TTL (time to live) of 300 seconds: how long anyone may keep this answer before asking again."
      },
      {
        "from": 1,
        "to": 0,
        "label": "203.0.113.7",
        "title": "The resolver answers your app",
        "note": "It also saves the answer until the TTL runs out, so the next lookup for this name is answered from memory, in a millisecond or two."
      }
    ]
  },
  "networking-4-http2-streams": {
    "kind": "seq",
    "title": "HTTP/2: three requests on one connection",
    "actors": [
      {
        "name": "Browser"
      },
      {
        "name": "Server"
      }
    ],
    "steps": [
      {
        "from": 0,
        "to": 1,
        "label": "one connection (TCP + TLS)",
        "title": "Open one connection",
        "note": "HTTP/2 uses a single connection per site. HTTP/1.1 browsers open up to six, because each connection handles one request at a time."
      },
      {
        "from": 0,
        "to": 1,
        "label": "stream 1: GET /app.js",
        "title": "Request 1 goes out",
        "note": "Every request gets a stream number. The number lets the answer find its way back to the right request."
      },
      {
        "from": 0,
        "to": 1,
        "label": "stream 3: GET /style.css",
        "title": "Request 2 does not wait",
        "note": "On one HTTP/1.1 connection this request would have to wait for the first answer. Here it is sent right away."
      },
      {
        "from": 0,
        "to": 1,
        "label": "stream 5: GET /logo.png",
        "title": "Request 3 goes out too",
        "note": "Three requests are now in flight on the same connection."
      },
      {
        "from": 1,
        "to": 0,
        "label": "stream 3: style.css",
        "title": "The quickest answer comes first",
        "note": "The server sends small chunks called frames, each tagged with its stream number. The small CSS file finishes first, although it was asked for second."
      },
      {
        "from": 1,
        "to": 0,
        "label": "stream 1: app.js (part 1)",
        "title": "Frames from different streams are mixed",
        "note": "A big file does not block the small ones behind it. This is called multiplexing."
      },
      {
        "from": 1,
        "to": 0,
        "label": "stream 5: logo.png",
        "title": "The third answer arrives",
        "note": "Responses are not in request order, and that is fine."
      },
      {
        "from": 1,
        "to": 0,
        "label": "stream 1: app.js (last part)",
        "title": "The browser reassembles each stream",
        "note": "It uses the stream numbers to put the frames back together. One caution: a lost TCP packet can still stall every stream, which is the problem HTTP/3 solves by using QUIC."
      }
    ]
  },

  // ---- lesson 1: what the slash means ----
  "networking-1-cidr-bits": {
    kind: "array",
    title: "What /26 means: the first 26 bits are the network",
    intro: "The block 192.168.10.0/26 written as 32 bits. Each row is one octet: 192, 168, 10 and 0. The labels under the cells are the weights of the bits.",
    indexLabels: ["128", "64", "32", "16", "8", "4", "2", "1"],
    cells: [
      ["1", "1", "0", "0", "0", "0", "0", "0"],
      ["1", "0", "1", "0", "1", "0", "0", "0"],
      ["0", "0", "0", "0", "1", "0", "1", "0"],
      ["0", "0", "0", "0", "0", "0", "0", "0"],
    ],
    steps: [
      {
        title: "An IPv4 address is one 32-bit number",
        note: "The dots only help humans. Each row is one octet of 8 bits. Add the weights of the bits that are 1: the first row is 128 + 64 = 192, the second is 128 + 32 + 8 = 168, and the third is 8 + 2 = 10.",
      },
      {
        done: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [2, 0], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [3, 0], [3, 1]],
        pointers: [{ at: [3, 1], label: "/26 cut" }],
        title: "The slash number counts bits from the left",
        note: "In /26 the first 26 bits are the network part. That is three full octets (24 bits) plus the first two bits of the last octet. Every address in this block shares them.",
      },
      {
        done: [[3, 0], [3, 1]],
        mark: [[3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7]],
        title: "The last 6 bits are for hosts",
        note: "32 minus 26 leaves 6 host bits. Six bits can make 2 to the power 6, which is 64 different values. So the block holds 64 addresses.",
      },
      {
        done: [[3, 0], [3, 1]],
        mark: [[3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7]],
        title: "All host bits 0 is the network address",
        note: "The first address, 192.168.10.0, names the network itself. It cannot be given to a machine.",
      },
      {
        cells: [
          ["1", "1", "0", "0", "0", "0", "0", "0"],
          ["1", "0", "1", "0", "1", "0", "0", "0"],
          ["0", "0", "0", "0", "1", "0", "1", "0"],
          ["0", "0", "1", "1", "1", "1", "1", "1"],
        ],
        done: [[3, 0], [3, 1]],
        mark: [[3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7]],
        title: "All host bits 1 is the broadcast address",
        note: "The last address is 192.168.10.63, meaning everyone on this network. That is why a /26 has 64 addresses but only 62 usable hosts: .1 to .62.",
      },
      {
        cells: [
          ["1", "1", "0", "0", "0", "0", "0", "0"],
          ["1", "0", "1", "0", "1", "0", "0", "0"],
          ["0", "0", "0", "0", "1", "0", "1", "0"],
          ["0", "1", "0", "0", "1", "1", "0", "1"],
        ],
        mark: [[3, 0], [3, 1]],
        pointers: [{ at: [3, 1], label: "net bit" }],
        title: "Which block holds 192.168.10.77?",
        note: "77 is 64 + 8 + 4 + 1, so the last octet is 01001101. The first two bits, which are network bits, are 01 and not 00. So the address is in the block that starts at .64, not the one that starts at .0.",
      },
    ],
  },

  "networking-1-nat-rewrite": {
    kind: "seq",
    title: "NAT: two laptops share one public address",
    actors: [
      { name: "Laptop A", sub: "192.168.1.10" },
      { name: "Laptop B", sub: "192.168.1.11" },
      { name: "Router", sub: "public 203.0.113.7" },
      { name: "Server", sub: "93.184.216.34:443" },
    ],
    steps: [
      {
        from: 0,
        to: 2,
        label: "source 192.168.1.10:51000",
        title: "Laptop A sends a request",
        note: "Inside the house every device has a private address. These addresses are not routed on the public internet, so the server could never answer one.",
      },
      {
        from: 2,
        to: 3,
        label: "source 203.0.113.7:40000",
        title: "The router rewrites the source",
        note: "It swaps in its own public address and picks a free public port, 40000. It remembers the mapping: 40000 belongs to 192.168.1.10 port 51000.",
      },
      {
        from: 1,
        to: 2,
        label: "source 192.168.1.11:51000",
        title: "Laptop B uses the same source port",
        note: "Two inside machines picking the same port is normal. If the router did not change the port, it could not tell their replies apart.",
      },
      {
        from: 2,
        to: 3,
        label: "source 203.0.113.7:40001",
        title: "It gets a different public port",
        note: "The router gives Laptop B port 40001. The server sees two connections from the same public address, told apart by the port.",
      },
      {
        from: 3,
        to: 2,
        label: "reply to 203.0.113.7:40001",
        title: "The server answers the public address",
        note: "It knows only the public address and port. It never sees the private ones.",
      },
      {
        from: 2,
        to: 1,
        label: "reply to 192.168.1.11:51000",
        title: "The router looks up the mapping and rewrites back",
        note: "Port 40001 belongs to Laptop B, so the destination is rewritten and the reply goes to the right laptop.",
      },
      {
        from: 3,
        to: 2,
        label: "unsolicited packet to port 40009",
        title: "A packet nobody asked for",
        note: "There is no mapping for port 40009, so the router has no inside machine to give it to and drops it. NAT blocks unsolicited inbound traffic by accident. That also means you cannot run a server behind NAT without port forwarding.",
      },
    ],
  },

  // ---- lesson 5: TLS ----
  "networking-5-tls13-handshake": {
    kind: "seq",
    title: "The TLS 1.3 handshake, in one round trip",
    actors: [
      { name: "Client", sub: "curl" },
      { name: "Server", sub: "app.lab.test" },
    ],
    steps: [
      {
        from: 0,
        to: 1,
        label: "ClientHello: key share, SNI, ALPN",
        title: "The client says hello",
        note: "It lists the versions and ciphers it supports, sends its half of a key exchange, names the site it wants (SNI), and says which protocols it can speak (ALPN). TCP is already open.",
      },
      {
        from: 1,
        to: 0,
        label: "ServerHello: its key share",
        title: "The server picks and answers with its half",
        note: "Now both sides can compute the same secret key without ever sending it. This trick is a Diffie-Hellman exchange (X25519 here). From this moment everything is encrypted.",
      },
      {
        from: 1,
        to: 0,
        label: "Certificate (encrypted)",
        title: "The server sends its certificate",
        note: "The certificate says this public key belongs to app.lab.test, with a signature from a CA. In TLS 1.3 it is already encrypted. In TLS 1.2 it was sent in plain text.",
      },
      {
        from: 1,
        to: 0,
        label: "CERT verify + Finished",
        title: "The server proves it holds the private key",
        note: "CERT verify is a signature over the handshake made with the certificate's private key. A stolen copy of the certificate file is not enough. Finished is a check value over the whole handshake, so tampering shows up.",
      },
      {
        from: 0,
        to: 0,
        self: true,
        label: "check chain, dates and name",
        title: "The client checks the certificate",
        note: "Is it signed by a CA I trust? Is today inside the dates? Is the name I asked for in the SAN list? If any check fails, the connection must stop. This is the step people wrongly turn off.",
      },
      {
        from: 0,
        to: 1,
        label: "Finished",
        title: "The client finishes the handshake",
        note: "That was one round trip on top of TCP. TLS 1.2 needed two. The data will be encrypted with a fast cipher, AES-256-GCM in the lesson, using keys made fresh for this connection, which gives forward secrecy.",
      },
      {
        from: 0,
        to: 1,
        label: "GET /  (encrypted)",
        title: "Only now does HTTP flow",
        note: "The request line, headers and body are hidden from anyone on the path. The server name in the ClientHello, and the IP address, are still visible.",
      },
      {
        from: 1,
        to: 0,
        label: "200 OK  (encrypted)",
        title: "The answer comes back encrypted too",
        note: "If someone records this traffic today and steals the server's private key next year, they still cannot read it. The keys came from temporary numbers that were thrown away.",
      },
    ],
  },

  "networking-5-cert-checks": {
    kind: "flow",
    title: "The three checks a client makes on a certificate",
    intro: "Each check has its own failure. Most TLS errors are one of these three.",
    nodes: [
      { id: "cert", label: "Server cert", sub: "leaf plus intermediate", col: 0, row: 0, tone: "server" },
      { id: "chain", label: "1. Chain", sub: "trusted CA?", col: 1, row: 0, tone: "queue" },
      { id: "dates", label: "2. Dates", sub: "valid today?", col: 2, row: 0, tone: "queue" },
      { id: "name", label: "3. Name", sub: "in the SAN list?", col: 3, row: 0, tone: "queue" },
      { id: "ok", label: "Connected", sub: "HTTP can flow", col: 4, row: 0, tone: "data" },
      { id: "f-chain", label: "Not trusted", sub: "missing intermediate?", col: 1, row: 1, tone: "warn" },
      { id: "f-dates", label: "Expired", sub: "check the clock too", col: 2, row: 1, tone: "warn" },
      { id: "f-name", label: "Wrong name", sub: "name not in the SAN", col: 3, row: 1, tone: "warn" },
    ],
    edges: [
      { id: "e-cert", from: "cert", to: "chain" },
      { id: "e-chain", from: "chain", to: "dates" },
      { id: "e-dates", from: "dates", to: "name" },
      { id: "e-name", from: "name", to: "ok" },
      { id: "e-f1", from: "chain", to: "f-chain", label: "fails", dashed: true },
      { id: "e-f2", from: "dates", to: "f-dates", label: "fails", dashed: true },
      { id: "e-f3", from: "name", to: "f-name", label: "fails", dashed: true },
    ],
    steps: [
      {
        appear: ["cert"],
        focus: ["cert"],
        title: "The server sends its certificate",
        note: "It should send the leaf certificate and the intermediate certificates. Clients usually have only the root CAs in their trust store, so the server must supply the ones in the middle.",
      },
      {
        appear: ["chain", "e-cert"],
        focus: ["chain", "e-cert"],
        title: "Check 1: does the chain end at a CA I trust?",
        note: "Every signature must be valid, and the last certificate must be a root in the trust store. A private CA is in nobody's store, unless you add it.",
      },
      {
        appear: ["f-chain", "e-f1"],
        focus: ["f-chain", "e-f1"],
        title: "Failure 1: UNABLE_TO_VERIFY_LEAF_SIGNATURE",
        note: "The classic cause is a server that sends only the leaf. Browsers often hide the problem, but Node and curl fail (curl exit 60). Fix it on the server by sending the full chain, such as fullchain.pem. For a private CA, trust that CA instead of switching checks off.",
      },
      {
        appear: ["dates", "e-chain", "f-dates", "e-f2"],
        focus: ["dates", "f-dates", "e-f2"],
        title: "Check 2: is today inside the validity dates?",
        note: "A certificate has a start and an end. Outside them you get CERT_HAS_EXPIRED. A forgotten renewal is a common outage. A wrong clock on a laptop or container causes the same error.",
      },
      {
        appear: ["name", "e-dates", "f-name", "e-f3"],
        focus: ["name", "f-name", "e-f3"],
        title: "Check 3: is the name I asked for in the SAN list?",
        note: "Modern clients check only the Subject Alternative Name list. If you connect to an IP or an internal name that is not listed, you get ERR_TLS_CERT_ALTNAME_INVALID. The error even prints the names that are in the certificate.",
      },
      {
        appear: ["ok", "e-name"],
        focus: ["ok", "e-name"],
        title: "All three pass, so HTTP can flow",
        note: "NODE_TLS_REJECT_UNAUTHORIZED=0, rejectUnauthorized false and curl -k skip all of these checks. After that an imposter with any certificate is accepted. Fix the real cause instead.",
      },
    ],
  },

  // ---- lesson 6: proxies ----
  "networking-6-forwarded-for": {
    kind: "seq",
    title: "Where the client IP goes behind a proxy",
    actors: [
      { name: "Client", sub: "claims to be 1.2.3.4" },
      { name: "nginx", sub: "reverse proxy" },
      { name: "Node app", sub: "backend" },
    ],
    steps: [
      {
        from: 0,
        to: 1,
        label: "GET /  X-Forwarded-For: 1.2.3.4",
        title: "A client sends a forged header",
        note: "X-Forwarded-For is just a header. Anyone can write one, so an attacker can pretend to be any address.",
      },
      {
        from: 1,
        to: 1,
        self: true,
        label: "append the address it saw",
        title: "nginx in append mode adds to the list",
        note: "With the append setting, nginx keeps what the client sent and adds the address of the machine that connected, here 127.0.0.1 (the test ran on one machine).",
      },
      {
        from: 1,
        to: 2,
        label: "XFF: 1.2.3.4, 127.0.0.1",
        title: "The app receives a list",
        note: "The proxy opens a new TCP connection to the app. The first entry is whatever the client typed. The last entry was added by our own proxy.",
      },
      {
        from: 2,
        to: 2,
        self: true,
        label: "socket peer is the proxy",
        title: "The TCP peer is the proxy, not the user",
        note: "req.socket.remoteAddress shows the proxy. If you rate-limit by it, every user shares one address and gets blocked together.",
      },
      {
        from: 2,
        to: 2,
        self: true,
        label: "first entry 1.2.3.4 was forged",
        title: "Taking the first entry is a mistake",
        note: "Code that does split on a comma and takes the first item accepts a value the attacker chose. That lets them escape rate limits or fake an audit log.",
      },
      {
        from: 1,
        to: 2,
        label: "overwrite mode: XFF: 127.0.0.1",
        title: "Overwrite mode keeps only the real address",
        note: "Setting the header to the connecting address throws away the client's value. The edge-most proxy should overwrite or strip the header.",
      },
      {
        from: 2,
        to: 2,
        self: true,
        label: "count trusted proxies from the right",
        title: "Trust only the entries your proxies added",
        note: "Know how many proxies sit in front of you and take the entry that many places from the right. Anything further left was supplied by the client. In Express this is the trust proxy setting with an exact number.",
      },
    ],
  },

  "networking-6-request-stack": {
    kind: "flow",
    title: "One request through a real production stack",
    intro: "The stack from the lesson. At every arrow ask: what does this hop end, add, wait for and cache?",
    nodes: [
      { id: "browser", label: "Browser", sub: "shop.example.com", col: 0, row: 0, tone: "client" },
      { id: "cdn", label: "CDN edge", sub: "TLS ends here", col: 1, row: 0, tone: "queue" },
      { id: "lb", label: "Load balancer", sub: "health checks", col: 2, row: 0, tone: "server" },
      { id: "nginx", label: "nginx", sub: "gzip, timeouts", col: 3, row: 0, tone: "server" },
      { id: "app", label: "Node app", sub: "reads trusted headers", col: 3, row: 1, tone: "client" },
      { id: "db", label: "Database", sub: "private subnet", col: 2, row: 1, tone: "store" },
    ],
    edges: [
      { id: "e-bc", from: "browser", to: "cdn" },
      { id: "e-cl", from: "cdn", to: "lb" },
      { id: "e-ln", from: "lb", to: "nginx" },
      { id: "e-na", from: "nginx", to: "app", label: "proxy_pass" },
      { id: "e-ad", from: "app", to: "db" },
    ],
    steps: [
      {
        appear: ["browser"],
        focus: ["browser"],
        title: "The browser asks for the site",
        note: "DNS points shop.example.com at the CDN's address, not at your server. The user never talks to your app directly.",
      },
      {
        appear: ["cdn", "e-bc"],
        focus: ["cdn", "e-bc"],
        title: "The CDN edge ends TLS and checks its cache",
        note: "The TLS handshake is made with a server near the user, so its round trips are short. If the edge has a fresh copy it answers at once. Not this time.",
      },
      {
        appear: ["lb", "e-cl"],
        focus: ["lb", "e-cl"],
        title: "A cache miss goes to the origin",
        note: "The load balancer spreads requests over healthy copies of your app. It only sends traffic to backends whose health check passes. A 502, 503 or 504 at this point has three different meanings.",
      },
      {
        appear: ["nginx", "e-ln"],
        focus: ["nginx", "e-ln"],
        title: "The balancer adds the client address in a header",
        note: "To the next hop, the TCP peer is the balancer. The real client address travels only in X-Forwarded-For. Timeouts at every hop need to fit together.",
      },
      {
        appear: ["app", "e-na"],
        focus: ["app", "e-na"],
        title: "nginx forwards to the Node app",
        note: "It serves static files, compresses and enforces timeouts so the app does not have to. The app sees plain HTTP, so it reads X-Forwarded-Proto from the trusted proxy to know the user used HTTPS.",
      },
      {
        appear: ["db", "e-ad"],
        focus: ["db", "e-ad"],
        title: "The app asks the database",
        note: "The database sits in a private subnet and accepts connections only from the app servers on its own port, never from the internet.",
      },
      {
        focus: ["cdn", "e-bc"],
        set: { cdn: "HIT: answers itself" },
        title: "The next request is a cache hit",
        note: "Now the CDN has a copy and never bothers the origin. That works only if the response headers allow it. A personalised page must be private or no-store, or one user may be served another user's page.",
      },
    ],
  },

  // ---- lesson 7: real-time connections ----
  "networking-7-websocket-upgrade": {
    kind: "seq",
    title: "A WebSocket starts as HTTP, then becomes frames",
    actors: [
      { name: "Client", sub: "built-in WebSocket" },
      { name: "Server", sub: "ws on port 9100" },
    ],
    steps: [
      {
        from: 0,
        to: 1,
        label: "GET /chat  Upgrade: websocket",
        title: "An ordinary-looking HTTP request asks to switch",
        note: "It carries Upgrade: websocket, Connection: Upgrade, version 13 and a random Sec-WebSocket-Key. Behind a proxy, these two headers are dropped unless you pass them on, and then the upgrade fails.",
      },
      {
        from: 1,
        to: 0,
        label: "101 Switching Protocols",
        title: "The server agrees",
        note: "Sec-WebSocket-Accept in the reply is the SHA-1 of the key plus a fixed text, in base64. It proves the server understands WebSocket. From now on this TCP connection no longer speaks HTTP.",
      },
      {
        from: 0,
        to: 1,
        label: "text frame: hello (masked)",
        title: "The client sends a frame",
        note: "In the lesson the bytes were 81 85 and a 4-byte mask key, then the masked payload. 81 means a final text frame. Every client frame is masked. The mask is not encryption, because the key travels with the message.",
      },
      {
        from: 1,
        to: 0,
        label: "text frame: echo: hello",
        title: "The server answers in the same connection",
        note: "Server frames are not masked. For small messages the header is only 2 bytes, compared with hundreds of bytes of headers on every HTTP poll.",
      },
      {
        from: 1,
        to: 0,
        label: "ping",
        title: "Either side can send at any time",
        note: "Ping and pong are tiny control frames used as a heartbeat. A client that vanished may never send a FIN, and even a frozen program keeps its TCP connection open, so only an answer from the application proves it is alive.",
      },
      {
        from: 0,
        to: 1,
        label: "pong",
        title: "The client answers, so the server keeps it",
        note: "The server marks the client alive when the pong arrives and terminates any client that did not answer by the next round. The same heartbeat stops idle timeouts in proxies from cutting a quiet connection.",
      },
      {
        from: 0,
        to: 1,
        label: "close frame: 1000 bye",
        title: "A clean close has a code",
        note: "1000 means normal. 1001 means going away, for example a server restart. 1006 means the connection dropped with no close frame, which is what the client sees when a proxy cuts an idle socket.",
      },
    ],
  },

  "networking-7-sse-resume": {
    kind: "seq",
    title: "Server-Sent Events: reconnect and resume for free",
    actors: [
      { name: "Browser", sub: "EventSource" },
      { name: "Server", sub: "text/event-stream" },
    ],
    steps: [
      {
        from: 0,
        to: 1,
        label: "GET /  (no Last-Event-ID)",
        title: "One ordinary GET opens the stream",
        note: "The server answers with Content-Type text/event-stream and never ends the response. It is a chunked response kept open on purpose.",
      },
      {
        from: 1,
        to: 0,
        label: "id 1, 2, 3 with data lines",
        title: "The server writes events when it has news",
        note: "An event is a few lines such as id and data, ended by one blank line. The blank line tells the client the event is complete. The browser remembers the last id it saw.",
      },
      {
        from: 0,
        to: 0,
        self: true,
        label: "connection lost, wait, retry",
        title: "The connection drops",
        note: "In the test the server dropped it after every 3 messages. The browser waits for the retry time and reconnects by itself, with no code from us.",
      },
      {
        from: 0,
        to: 1,
        label: "GET /  Last-Event-ID: 3",
        title: "The browser sends the last id it saw",
        note: "The server log proved this header arrived on its own. It tells the server where to continue.",
      },
      {
        from: 1,
        to: 0,
        label: "id 4, 5, 6",
        title: "The server resumes right after id 3",
        note: "No message was lost and none was repeated. To replay missed events, the server must keep recent events with their ids.",
      },
      {
        from: 0,
        to: 1,
        label: "GET /  Last-Event-ID: 6",
        title: "It happens again after the next drop",
        note: "With a WebSocket you must write all this reconnect and resume code yourself. That is why SSE is a good first choice when only the server sends.",
      },
      {
        from: 1,
        to: 0,
        label: "id 7",
        title: "And the stream carries on",
        note: "Behind a proxy, buffering can hide the whole stream: in the lesson nginx delivered 0 bytes in 3 seconds until proxy_buffering was turned off. Send a comment heartbeat so idle timeouts do not close it.",
      },
    ],
  },

  // ---- lesson 8: debugging ----
  "networking-8-layer-by-layer": {
    kind: "flow",
    title: "Debug one layer at a time, from the bottom up",
    intro: "A step can only work if the earlier ones did, so the error you get tells you which layer failed.",
    nodes: [
      { id: "dns", label: "1. Name", sub: "dig, getent", col: 0, row: 0, tone: "queue" },
      { id: "route", label: "2. Route", sub: "ip route, traceroute", col: 1, row: 0, tone: "queue" },
      { id: "port", label: "3. Port", sub: "nc -zv, ss -ltnp", col: 2, row: 0, tone: "queue" },
      { id: "tls", label: "4. TLS", sub: "openssl s_client", col: 3, row: 0, tone: "queue" },
      { id: "http", label: "5. HTTP", sub: "curl -v, curl -w", col: 4, row: 0, tone: "queue" },
      { id: "f-dns", label: "curl exit 6", sub: "Could not resolve host", col: 0, row: 1, tone: "warn" },
      { id: "f-route", label: "Unreachable", sub: "no route or interface", col: 1, row: 1, tone: "warn" },
      { id: "f-port", label: "exit 7 or 28", sub: "refused or timed out", col: 2, row: 1, tone: "warn" },
      { id: "f-tls", label: "exit 60 or 35", sub: "certificate or handshake", col: 3, row: 1, tone: "warn" },
      { id: "f-http", label: "502 503 504", sub: "gateway errors", col: 4, row: 1, tone: "warn" },
    ],
    edges: [
      { id: "e1", from: "dns", to: "route" },
      { id: "e2", from: "route", to: "port" },
      { id: "e3", from: "port", to: "tls" },
      { id: "e4", from: "tls", to: "http" },
      { id: "f1", from: "dns", to: "f-dns", dashed: true },
      { id: "f2", from: "route", to: "f-route", dashed: true },
      { id: "f3", from: "port", to: "f-port", dashed: true },
      { id: "f4", from: "tls", to: "f-tls", dashed: true },
      { id: "f5", from: "http", to: "f-http", dashed: true },
    ],
    steps: [
      {
        appear: ["dns", "f-dns", "f1"],
        focus: ["dns", "f-dns"],
        title: "Step 1: does the name turn into an address?",
        note: "If curl says Could not resolve host, stop looking at the app, because no packet was even sent. Compare dig with getent hosts, since your program uses the system resolver and not dig's path.",
      },
      {
        appear: ["route", "e1", "f-route", "f2"],
        focus: ["route", "f-route"],
        title: "Step 2: is there a path to that address?",
        note: "Network is unreachable means no default route or a downed interface. Blocked ICMP is common, so a failed ping alone proves little.",
      },
      {
        appear: ["port", "e2", "f-port", "f3"],
        focus: ["port", "f-port"],
        title: "Step 3: can I open a TCP connection to the port?",
        note: "Refused (exit 7) comes back at once: the machine answered and nothing listens, or it listens on 127.0.0.1 only. A timeout (exit 28) means silence: a firewall dropping packets, a wrong IP or a dead host.",
      },
      {
        appear: ["tls", "e3", "f-tls", "f4"],
        focus: ["tls", "f-tls"],
        title: "Step 4: does the secure handshake work?",
        note: "echo piped to openssl s_client shows the chain, the dates and the Verify return code. Exit 60 is a certificate problem. Check the client clock, the names in the SAN list and whether the intermediate is sent.",
      },
      {
        appear: ["http", "e4", "f-http", "f5"],
        focus: ["http", "f-http"],
        title: "Step 5: what do the status and headers say?",
        note: "A 502 means a proxy got a bad answer or none, 503 means no capacity, 504 means the backend was too slow. A 502 proves that DNS, routing, TCP and TLS all worked. Test the backend directly, bypassing the proxy.",
      },
      {
        focus: ["f-dns", "f-route", "f-port", "f-tls", "f-http"],
        title: "Step 6: still unclear? Measure the time, then capture packets",
        note: "curl -w splits the time into DNS, connect, TLS and first byte. When two tools disagree, tcpdump shows what really crossed the wire, such as repeated SYN packets (a silent drop) or a reset (a refusal).",
      },
    ],
  },

  "networking-8-curl-timings": {
    kind: "array",
    title: "Read curl -w like a doctor reads a chart",
    intro: "The /slow page from the lesson, which waits 1.5 seconds. Each time counts from the very start, so it only goes up. To get one step, subtract the one before it.",
    cells: [
      ["dns", "connect", "tls", "TTFB", "total"],
      ["0.000019", "0.000279", "0.000000", "1.502215", "1.502338"],
      ["", "", "", "", ""],
    ],
    steps: [
      {
        mark: [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4]],
        title: "Five numbers from one command",
        note: "They are the values of time_namelookup, time_connect, time_appconnect, time_starttransfer and time_total. The first byte is also called TTFB. TLS is 0 here because the page is plain HTTP.",
      },
      {
        cells: [
          ["dns", "connect", "tls", "TTFB", "total"],
          ["0.000019", "0.000279", "0.000000", "1.502215", "1.502338"],
          ["0.000019", "", "", "", ""],
        ],
        done: [[2, 0]],
        title: "DNS took almost nothing",
        note: "19 microseconds. Nothing to tune here.",
      },
      {
        cells: [
          ["dns", "connect", "tls", "TTFB", "total"],
          ["0.000019", "0.000279", "0.000000", "1.502215", "1.502338"],
          ["0.000019", "0.000260", "", "", ""],
        ],
        done: [[2, 0], [2, 1]],
        title: "The connection opened in a fraction of a millisecond",
        note: "Connect minus DNS is 0.00026 seconds. On loopback every network number is tiny. Against a far server, connect would be about one round trip.",
      },
      {
        cells: [
          ["dns", "connect", "tls", "TTFB", "total"],
          ["0.000019", "0.000279", "0.000000", "1.502215", "1.502338"],
          ["0.000019", "0.000260", "", "1.501936", ""],
        ],
        done: [[2, 0], [2, 1]],
        mark: [[2, 3]],
        title: "Then nothing happened for 1.5 seconds",
        note: "First byte minus connect is 1.501936. The request was sent, and the server thought about it before answering. This gap is the one that is big.",
      },
      {
        cells: [
          ["dns", "connect", "tls", "TTFB", "total"],
          ["0.000019", "0.000279", "0.000000", "1.502215", "1.502338"],
          ["0.000019", "0.000260", "", "1.501936", "0.000123"],
        ],
        done: [[2, 0], [2, 1], [2, 4]],
        mark: [[2, 3]],
        title: "Sending the body took 0.1 milliseconds",
        note: "Total minus first byte is tiny, so the body was small and the link was fine.",
      },
      {
        cells: [
          ["dns", "connect", "tls", "TTFB", "total"],
          ["0.000019", "0.000279", "0.000000", "1.502215", "1.502338"],
          ["0.000019", "0.000260", "", "1.501936", "0.000123"],
        ],
        pointers: [{ at: [2, 3], label: "server" }],
        dim: [[2, 0], [2, 1], [2, 4]],
        mark: [[2, 3]],
        title: "Conclusion: the time is inside the server",
        note: "The network is not the problem, so tuning DNS or TLS would waste time. Go to the backend: logs, database, traces. Run the command five or ten times before you trust one sample.",
      },
    ],
  },
};
