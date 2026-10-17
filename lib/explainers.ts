/**
 * Step-by-step explainers that lessons embed with a fenced block:
 *
 *   ```explainer
 *   tcp-handshake
 *   ```
 *
 * Sequence explainers are plain data (who talks to whom, in what order, with a plain-English note);
 * components/explainers draws and animates them. The circuit breaker is a state machine, so it has its own data.
 */
export type SeqActor = { name: string; sub?: string };
export type SeqStep = {
  from: number;
  to: number;
  /** Short text on the arrow. */
  label: string;
  /** Heading of the step in the caption. */
  title: string;
  /** One or two plain sentences. */
  note: string;
  /** For a step an actor does by itself (from === to). */
  self?: boolean;
};
export type SeqDef = { title: string; actors: SeqActor[]; steps: SeqStep[] };

export const SEQUENCES: Record<string, SeqDef> = {
  "tcp-handshake": {
    title: "The TCP three-way handshake",
    actors: [{ name: "Client", sub: "your program" }, { name: "Server", sub: "listening on a port" }],
    steps: [
      { from: 0, to: 1, label: "SYN  (my first number is x)", title: "The client asks to connect", note: "The client sends a SYN packet ('synchronise') with a random starting number, call it x. It means: I want to talk, and my first byte will be numbered x." },
      { from: 1, to: 0, label: "SYN-ACK  (mine is y, I got x)", title: "The server says yes", note: "The server picks its own random starting number y and acknowledges x + 1. A SYN uses up one number, so the answer is the client's number plus one." },
      { from: 0, to: 1, label: "ACK  (I got y)", title: "The client confirms", note: "The client acknowledges y + 1. Now both sides know the other can send and receive, and the connection is open." },
      { from: 0, to: 1, label: "data: ping", title: "Data starts to flow", note: "From now on every byte has a number. The client can send its first bytes (it may even ride on the third packet)." },
      { from: 1, to: 0, label: "ACK + data: pong", title: "Every byte is confirmed", note: "The server acknowledges the bytes it got and sends its own. Anything that is not acknowledged in time is sent again." },
    ],
  },
  "tcp-close": {
    title: "Closing a TCP connection",
    actors: [{ name: "Side A", sub: "closes first" }, { name: "Side B", sub: "the other end" }],
    steps: [
      { from: 0, to: 1, label: "FIN", title: "Side A says it is finished sending", note: "A FIN packet means: I have no more data to send. A can still receive." },
      { from: 1, to: 0, label: "ACK", title: "Side B confirms", note: "B acknowledges the FIN. The A-to-B direction is now closed." },
      { from: 1, to: 0, label: "FIN", title: "Side B finishes too", note: "When B has sent everything it wanted to, it sends its own FIN. Each direction closes on its own, which is why closing takes up to four packets." },
      { from: 0, to: 1, label: "ACK", title: "Side A confirms the last FIN", note: "Both directions are closed." },
      { from: 0, to: 0, self: true, label: "TIME_WAIT  (about 60 s)", title: "The first closer waits a little", note: "Side A keeps the connection's details for about a minute, so a late packet from this connection cannot be mistaken for part of a new one on the same ports." },
    ],
  },
  "dns-lookup": {
    title: "How a DNS lookup finds an address",
    actors: [{ name: "Your app" }, { name: "Resolver", sub: "ISP or public" }, { name: "Root server" }, { name: ".com server", sub: "TLD" }, { name: "Authoritative", sub: "owns example.com" }],
    steps: [
      { from: 0, to: 1, label: "www.example.com ?", title: "Your app asks the resolver", note: "Your computer asks a resolver (usually your internet provider's, or a public one) for the address of www.example.com. If the resolver already has a fresh answer saved, it replies at once. Here it does not." },
      { from: 1, to: 2, label: "www.example.com ?", title: "The resolver asks a root server", note: "It starts at the top. A root server does not know the address, but it knows who runs each ending, such as .com." },
      { from: 2, to: 1, label: "ask the .com servers", title: "The root sends a referral", note: "The answer is not an address. It is a pointer: for .com, ask these servers." },
      { from: 1, to: 3, label: "www.example.com ?", title: "The resolver asks the .com servers", note: "These servers know which name servers are in charge of every .com domain." },
      { from: 3, to: 1, label: "ask ns1.example.com", title: "Another referral", note: "They reply with the name servers for example.com. We are one step away." },
      { from: 1, to: 4, label: "www.example.com ?", title: "The resolver asks the authoritative server", note: "This server holds the real records for example.com, so it can give a real answer." },
      { from: 4, to: 1, label: "A 203.0.113.7  TTL 300", title: "The answer arrives", note: "An A record with the IP address, and a TTL (time to live) of 300 seconds: how long anyone may keep this answer before asking again." },
      { from: 1, to: 0, label: "203.0.113.7", title: "The resolver answers your app", note: "It also saves the answer until the TTL runs out, so the next lookup for this name is answered from memory, in a millisecond or two." },
    ],
  },
  "request-journey": {
    title: "What happens when you open a page",
    actors: [{ name: "Browser" }, { name: "DNS resolver" }, { name: "Web server" }],
    steps: [
      { from: 0, to: 1, label: "example.com ?", title: "Find the address", note: "Computers talk to numbers, not names. The browser asks DNS: what is the address of example.com?" },
      { from: 1, to: 0, label: "203.0.113.7", title: "The name becomes an address", note: "DNS answers with an IP address. Now the browser knows where to send packets." },
      { from: 0, to: 2, label: "SYN", title: "Open a TCP connection (1 of 3)", note: "TCP gives you a reliable stream of bytes. It starts with a short hello: three tiny packets." },
      { from: 2, to: 0, label: "SYN-ACK", title: "Open a TCP connection (2 of 3)", note: "The server agrees." },
      { from: 0, to: 2, label: "ACK", title: "Open a TCP connection (3 of 3)", note: "The connection is open. Nothing is encrypted yet." },
      { from: 0, to: 2, label: "TLS: ClientHello", title: "Agree on encryption", note: "For https, the browser now starts TLS: it says which encryption it supports and sends a key share." },
      { from: 2, to: 0, label: "TLS: certificate + keys", title: "The server proves who it is", note: "The server sends its certificate. Both sides work out the same secret keys. From here on everything is encrypted. (TLS 1.3 needs one round trip.)" },
      { from: 0, to: 2, label: "GET /  (encrypted)", title: "Send the HTTP request", note: "Finally the browser asks for the page. Only now does the web server see which page was requested." },
      { from: 2, to: 0, label: "200 OK + HTML", title: "Receive the page", note: "The server answers with a status code and the HTML. The browser then asks for the CSS, scripts and images the page mentions." },
    ],
  },
  "http2-streams": {
    title: "HTTP/2: three requests on one connection",
    actors: [{ name: "Browser" }, { name: "Server" }],
    steps: [
      { from: 0, to: 1, label: "one connection (TCP + TLS)", title: "Open one connection", note: "HTTP/2 uses a single connection per site. HTTP/1.1 browsers open up to six, because each connection handles one request at a time." },
      { from: 0, to: 1, label: "stream 1: GET /app.js", title: "Request 1 goes out", note: "Every request gets a stream number. The number lets the answer find its way back to the right request." },
      { from: 0, to: 1, label: "stream 3: GET /style.css", title: "Request 2 does not wait", note: "On one HTTP/1.1 connection this request would have to wait for the first answer. Here it is sent right away." },
      { from: 0, to: 1, label: "stream 5: GET /logo.png", title: "Request 3 goes out too", note: "Three requests are now in flight on the same connection." },
      { from: 1, to: 0, label: "stream 3: style.css", title: "The quickest answer comes first", note: "The server sends small chunks called frames, each tagged with its stream number. The small CSS file finishes first, although it was asked for second." },
      { from: 1, to: 0, label: "stream 1: app.js (part 1)", title: "Frames from different streams are mixed", note: "A big file does not block the small ones behind it. This is called multiplexing." },
      { from: 1, to: 0, label: "stream 5: logo.png", title: "The third answer arrives", note: "Responses are not in request order, and that is fine." },
      { from: 1, to: 0, label: "stream 1: app.js (last part)", title: "The browser reassembles each stream", note: "It uses the stream numbers to put the frames back together. One caution: a lost TCP packet can still stall every stream, which is the problem HTTP/3 solves by using QUIC." },
    ],
  },
};

export type BreakerState = "closed" | "open" | "half";
export type BreakerCall = "ok" | "fail" | "fast";
export type BreakerStep = {
  state: BreakerState;
  /** The arrow that was just taken, if the breaker changed state in this step. */
  moved?: [BreakerState, BreakerState];
  failures: number;
  calls: BreakerCall[];
  title: string;
  note: string;
};

export const BREAKER_STEPS: BreakerStep[] = [
  { state: "closed", failures: 0, calls: ["ok", "ok", "ok"], title: "Closed: calls go through", note: "This is normal life. Every call goes to the dependency, and the breaker only counts how many fail." },
  { state: "closed", failures: 2, calls: ["ok", "ok", "ok", "fail", "fail"], title: "Failures pile up", note: "The dependency starts to fail or time out. The breaker counts the failures but still lets calls through." },
  { state: "open", moved: ["closed", "open"], failures: 5, calls: ["ok", "fail", "fail", "fail", "fail", "fail"], title: "The threshold is reached: the breaker opens", note: "For example five failures in a row, or half of the last twenty calls. The breaker trips, like a fuse." },
  { state: "open", failures: 5, calls: ["fail", "fail", "fast", "fast", "fast", "fast"], title: "Open: calls fail fast", note: "No call is sent to the sick dependency. Callers get an error at once, or a fallback answer. This stops your threads from piling up waiting, and gives the dependency room to recover." },
  { state: "half", moved: ["open", "half"], failures: 5, calls: ["fast", "fast", "fast", "fast"], title: "Half-open: let one call test", note: "After a wait, say 30 seconds, the breaker lets a single trial call through. Everything else still fails fast." },
  { state: "closed", moved: ["half", "closed"], failures: 0, calls: ["fast", "fast", "ok", "ok", "ok"], title: "The trial worked: closed again", note: "The trial call succeeded, so the breaker closes and the count starts from zero. If the trial had failed, the breaker would go back to open and wait again." },
];
