"use client";

import Stepper, { PHASE, type PhaseStyle, type StepBase } from "./Stepper";

/**
 * Live, step-through trace of a TLS 1.3 handshake: what the browser knows,
 * what the server knows, what travels on the wire in each direction — and
 * what someone sniffing the network can actually read.
 */

type Fact = { label: string; value: string; tone?: "ok" | "warn" | "dim" };

type Step = StepBase & {
  phase: "tcp" | "hello" | "cert" | "verify" | "key" | "encrypted" | "fail";
  /** Message on the wire this step. */
  msg?: { dir: "→" | "←"; text: string; secret: boolean };
  /** What an eavesdropper on the coffee-shop Wi-Fi can read this step. */
  sniffer: string;
  browser: Fact[];
  server: Fact[];
};

const SNIFF_IP = "a connection from you to 52.66.12.9, port 443";

const STEPS: Step[] = [
  {
    phase: "tcp",
    title: "TCP connection opens on port 443",
    note: "DNS already turned yourapp.com into 52.66.12.9 (Lesson 3). The browser opens a plain TCP connection to port 443. Nothing is encrypted yet — TLS has not started.",
    sniffer: SNIFF_IP,
    browser: [{ label: "wants", value: "yourapp.com" }, { label: "connected to", value: "52.66.12.9:443" }],
    server: [{ label: "listening on", value: ":443" }, { label: "has", value: "certificate + private key" }],
  },
  {
    phase: "hello",
    title: "ClientHello →",
    note: "The browser says: “I speak TLS 1.3, here are the cipher suites I support, here is a random number, and here is my half of a key exchange.” It also names the site it wants (SNI), so one server can host many domains.",
    msg: { dir: "→", text: "ClientHello: TLS 1.3 · ciphers · random · key share · SNI=yourapp.com", secret: false },
    sniffer: `${SNIFF_IP}, and that you asked for yourapp.com`,
    browser: [
      { label: "wants", value: "yourapp.com" },
      { label: "offers", value: "TLS 1.3, 3 cipher suites" },
      { label: "my key share", value: "sent (public half)", tone: "warn" },
    ],
    server: [{ label: "listening on", value: ":443" }, { label: "has", value: "certificate + private key" }],
  },
  {
    phase: "hello",
    title: "← ServerHello",
    note: "The server picks one cipher suite from the list, adds its own random number and its half of the key exchange. Each side now has the other's public half — enough to compute a shared secret that never crossed the wire.",
    msg: { dir: "←", text: "ServerHello: cipher=AES-256-GCM · random · key share", secret: false },
    sniffer: "both key shares — but they are useless without the private halves",
    browser: [
      { label: "wants", value: "yourapp.com" },
      { label: "cipher", value: "AES-256-GCM", tone: "ok" },
      { label: "server key share", value: "received", tone: "warn" },
    ],
    server: [
      { label: "cipher", value: "AES-256-GCM", tone: "ok" },
      { label: "browser key share", value: "received", tone: "warn" },
      { label: "has", value: "certificate + private key" },
    ],
  },
  {
    phase: "key",
    title: "Both sides derive the same session key",
    note: "Key exchange maths (ECDHE): my private half + your public half = the same number as your private half + my public half. Neither private half was ever sent. From here on, every TLS 1.3 message is already encrypted with this key.",
    sniffer: "still only the two public halves — cannot compute the key",
    browser: [
      { label: "wants", value: "yourapp.com" },
      { label: "cipher", value: "AES-256-GCM", tone: "ok" },
      { label: "session key", value: "k7f2…e91a", tone: "ok" },
    ],
    server: [
      { label: "cipher", value: "AES-256-GCM", tone: "ok" },
      { label: "session key", value: "k7f2…e91a", tone: "ok" },
      { label: "has", value: "certificate + private key" },
    ],
  },
  {
    phase: "cert",
    title: "← Certificate (and the intermediate chain)",
    note: "The server sends its certificate for yourapp.com plus the intermediate certificate that links it to a root CA. It also signs the handshake so far with its private key — proof it really owns that certificate.",
    msg: { dir: "←", text: "Certificate: yourapp.com ← Let's Encrypt R3 ← ISRG Root · signature", secret: true },
    sniffer: "ciphertext — the certificate is already inside the tunnel",
    browser: [
      { label: "cipher", value: "AES-256-GCM", tone: "ok" },
      { label: "session key", value: "k7f2…e91a", tone: "ok" },
      { label: "certificate", value: "received, not yet checked", tone: "warn" },
    ],
    server: [
      { label: "cipher", value: "AES-256-GCM", tone: "ok" },
      { label: "session key", value: "k7f2…e91a", tone: "ok" },
      { label: "proved", value: "ownership of private key", tone: "ok" },
    ],
  },
  {
    phase: "verify",
    title: "Browser runs the three checks",
    note: "1. Is the chain signed by a CA in my trust store? 2. Is today inside the validity window? 3. Does the name on the certificate match yourapp.com? All three pass — this is the step where all the security lives. If any one fails, the browser closes the connection and shows a warning instead of your site.",
    sniffer: "nothing new",
    browser: [
      { label: "① trusted CA?", value: "ISRG Root X1 — in trust store ✓", tone: "ok" },
      { label: "② valid today?", value: "until 2026-12-14 ✓", tone: "ok" },
      { label: "③ name matches?", value: "yourapp.com ✓", tone: "ok" },
      { label: "session key", value: "k7f2…e91a", tone: "ok" },
    ],
    server: [
      { label: "cipher", value: "AES-256-GCM", tone: "ok" },
      { label: "session key", value: "k7f2…e91a", tone: "ok" },
      { label: "waiting for", value: "browser's Finished" },
    ],
  },
  {
    phase: "key",
    title: "Finished ⇄ — handshake complete",
    note: "Each side sends a Finished message: a checksum of the whole handshake, encrypted with the session key. If either side had been tampered with in transit, the checksums would not match and the connection would drop.",
    msg: { dir: "→", text: "Finished (checksum of everything above)", secret: true },
    sniffer: "ciphertext",
    browser: [
      { label: "server identity", value: "verified ✓", tone: "ok" },
      { label: "session key", value: "k7f2…e91a", tone: "ok" },
      { label: "padlock", value: "shown 🔒", tone: "ok" },
    ],
    server: [
      { label: "handshake", value: "complete ✓", tone: "ok" },
      { label: "session key", value: "k7f2…e91a", tone: "ok" },
      { label: "ready for", value: "HTTP requests" },
    ],
  },
  {
    phase: "encrypted",
    title: "GET /dashboard → inside the tunnel",
    note: "Now the actual HTTP request goes through: the path, the cookies, the form data. All of it is encrypted with the session key before it leaves the browser. Total time so far: one or two round trips, a few tens of milliseconds.",
    msg: { dir: "→", text: "GET /dashboard  Cookie: session=abc123", secret: true },
    sniffer: `${SNIFF_IP}, and the name yourapp.com from SNI. Not the path, not the cookie, not the response.`,
    browser: [
      { label: "sending", value: "GET /dashboard + cookie", tone: "ok" },
      { label: "encrypted with", value: "k7f2…e91a", tone: "ok" },
    ],
    server: [
      { label: "decrypts to", value: "GET /dashboard", tone: "ok" },
      { label: "hands to", value: "Nginx → your app on :3000" },
    ],
  },
  {
    phase: "fail",
    title: "What if check ③ had failed?",
    note: "Say the certificate was for other-site.com, or it expired last week, or it was self-signed. The browser stops right after the verify step: no Finished, no request, just a full-page warning (NET::ERR_CERT_COMMON_NAME_INVALID or similar). The most common real cause: you added a subdomain but forgot to include it in the certificate.",
    sniffer: "a connection that opened and closed",
    browser: [
      { label: "① trusted CA?", value: "✓", tone: "ok" },
      { label: "② valid today?", value: "✓", tone: "ok" },
      { label: "③ name matches?", value: "cert says other-site.com ✗", tone: "warn" },
      { label: "result", value: "connection closed, warning shown", tone: "warn" },
    ],
    server: [
      { label: "sent", value: "wrong certificate" },
      { label: "sees", value: "browser hung up", tone: "dim" },
    ],
  },
];

const phases: Record<Step["phase"], PhaseStyle> = {
  tcp: { label: "Before TLS", className: PHASE.plain },
  hello: { label: "Handshake · hello", className: PHASE.sky },
  key: { label: "Handshake · shared key", className: PHASE.violet },
  cert: { label: "Handshake · certificate", className: PHASE.amber },
  verify: { label: "Handshake · verification", className: PHASE.amber },
  encrypted: { label: "Encrypted tunnel", className: PHASE.green },
  fail: { label: "Failure path", className: PHASE.red },
};

const toneClass: Record<NonNullable<Fact["tone"]> | "plain", string> = {
  ok: "text-emerald-200",
  warn: "text-amber-200",
  dim: "text-ink-dim",
  plain: "text-ink",
};

function Side({ title, facts, active }: { title: string; facts: Fact[]; active: boolean }) {
  return (
    <div className={`overflow-hidden rounded-lg border bg-bg-code transition-colors ${active ? "border-sky/60" : "border-line"}`}>
      <div className={`border-b border-line px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] ${active ? "bg-sky-soft text-sky" : "bg-bg-elev text-ink-dim"}`}>
        {title}
      </div>
      <table className="my-0 w-full text-[0.8rem]">
        <tbody>
          {facts.map((f) => (
            <tr key={f.label}>
              <td className="w-[40%] border-0 px-3 py-1 font-mono text-ink-dim">{f.label}</td>
              <td className={`border-0 px-3 py-1 font-mono [overflow-wrap:anywhere] ${toneClass[f.tone ?? "plain"]}`}>{f.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TlsHandshakeStepper() {
  return (
    <Stepper
      steps={STEPS}
      phases={phases}
      caption="Step through the handshake. Watch both sides end up with the same session key without it ever being sent, the certificate get checked, and the eavesdropper's view go from readable to useless."
      interval={2600}
    >
      {(step) => {
        const msg = step.msg;
        const browserActive = !msg || msg.dir === "→" || step.phase === "verify" || step.phase === "fail";
        const serverActive = !!msg && msg.dir === "←";
        return (
          <>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_1fr] md:items-start">
              <Side title="Browser" facts={step.browser} active={browserActive || step.phase === "key"} />
              {/* The wire */}
              <div className="flex flex-col items-center justify-center gap-1 px-1 py-2 font-mono text-[0.75rem] md:min-h-[8rem] md:w-[12rem]">
                {msg ? (
                  <>
                    <div className={`text-[1.4rem] leading-none ${msg.secret ? "text-emerald-400" : "text-sky"}`}>
                      {msg.dir === "→" ? "⟶" : "⟵"}
                    </div>
                    <div className={`text-center [overflow-wrap:anywhere] ${msg.secret ? "text-emerald-200" : "text-sky"}`}>
                      {msg.text}
                    </div>
                    <div className={`mt-1 rounded-full border px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.08em] ${msg.secret ? "border-emerald-400/50 text-emerald-300" : "border-line text-ink-dim"}`}>
                      {msg.secret ? "🔒 encrypted" : "plain text"}
                    </div>
                  </>
                ) : (
                  <div className="text-ink-dim">(nothing on the wire)</div>
                )}
              </div>
              <Side title="Server · 52.66.12.9" facts={step.server} active={serverActive || step.phase === "key"} />
            </div>

            {/* Eavesdropper */}
            <div className="mt-4 rounded-lg border border-line bg-bg-code px-3 py-2 text-[0.82rem]">
              <span className="mr-2 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">👀 Someone on the same Wi-Fi sees</span>
              <span className={step.phase === "encrypted" || step.msg?.secret ? "text-emerald-200" : "text-amber-200"}>{step.sniffer}</span>
            </div>
          </>
        );
      }}
    </Stepper>
  );
}
