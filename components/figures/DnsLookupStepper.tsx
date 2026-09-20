"use client";

import Stepper, { PHASE, type PhaseStyle, type StepBase } from "./Stepper";

/**
 * Live, step-through trace of one DNS lookup: the question travelling from the
 * browser to the resolver, up through root and TLD to Route 53, the answer
 * coming back and being cached, and what happens when the TTL runs out.
 */

type NodeId = "browser" | "resolver" | "root" | "tld" | "r53";

const NODES: { id: NodeId; title: string; desc: string }[] = [
  { id: "browser", title: "Browser", desc: "your laptop" },
  { id: "resolver", title: "Resolver", desc: "ISP or 8.8.8.8" },
  { id: "root", title: "Root server", desc: "knows every TLD" },
  { id: "tld", title: ".com TLD", desc: "knows every .com" },
  { id: "r53", title: "Route 53", desc: "authoritative" },
];

type CacheRow = { name: string; value: string; ttl: number; stale?: boolean };

type Step = StepBase & {
  phase: "browser" | "resolve" | "answer" | "cache" | "expire";
  /** The message currently on the wire, if any. */
  msg?: { from: NodeId; to: NodeId; text: string; kind: "ask" | "answer" };
  /** Nodes doing work in this step. */
  active: NodeId[];
  /** Resolver's cache, as it looks after this step. */
  cache: CacheRow[];
  /** Seconds on the wall clock, for the TTL story. */
  clock: number;
};

const hit: CacheRow = { name: "yourapp.com  A", value: "52.66.12.9", ttl: 300 };

const STEPS: Step[] = [
  {
    phase: "browser",
    title: "You type yourapp.com",
    note: "The browser needs an IP address before it can open a connection. It checks its own small cache first: nothing there. So it asks the resolver your machine is configured to use.",
    active: ["browser"],
    cache: [],
    clock: 0,
  },
  {
    phase: "resolve",
    title: "Browser → resolver: “what is the IP of yourapp.com?”",
    note: "The resolver is the only server the browser ever talks to for DNS. It checks its own cache — empty for this name — and takes on the job of finding the answer for you. This is the recursive part.",
    msg: { from: "browser", to: "resolver", text: "A yourapp.com ?", kind: "ask" },
    active: ["browser", "resolver"],
    cache: [],
    clock: 0,
  },
  {
    phase: "resolve",
    title: "Resolver → root server: “who handles .com?”",
    note: "There are 13 root server addresses, built into every resolver. The root does not know yourapp.com. It only knows who runs each top-level domain, so it points to the .com servers.",
    msg: { from: "resolver", to: "root", text: "who handles .com ?", kind: "ask" },
    active: ["resolver", "root"],
    cache: [],
    clock: 0,
  },
  {
    phase: "answer",
    title: "Root → resolver: “ask the .com TLD servers”",
    note: "A referral, not an answer: “try a.gtld-servers.net”. The resolver caches this too, so it will not ask the root again for days.",
    msg: { from: "root", to: "resolver", text: "→ a.gtld-servers.net", kind: "answer" },
    active: ["resolver", "root"],
    cache: [{ name: "com  NS", value: "a.gtld-servers.net", ttl: 172800 }],
    clock: 0,
  },
  {
    phase: "resolve",
    title: "Resolver → .com TLD: “who runs yourapp.com?”",
    note: "The TLD server holds one thing about your domain: the names of its nameservers. That is what your registrar wrote there when you pointed the domain at Route 53.",
    msg: { from: "resolver", to: "tld", text: "who runs yourapp.com ?", kind: "ask" },
    active: ["resolver", "tld"],
    cache: [{ name: "com  NS", value: "a.gtld-servers.net", ttl: 172800 }],
    clock: 0,
  },
  {
    phase: "answer",
    title: "TLD → resolver: “the Route 53 nameservers”",
    note: "Another referral: ns-123.awsdns-15.com and three friends. Still no IP address — but now the resolver knows exactly who to ask.",
    msg: { from: "tld", to: "resolver", text: "→ ns-123.awsdns-15.com", kind: "answer" },
    active: ["resolver", "tld"],
    cache: [
      { name: "com  NS", value: "a.gtld-servers.net", ttl: 172800 },
      { name: "yourapp.com  NS", value: "ns-123.awsdns-15.com", ttl: 172800 },
    ],
    clock: 0,
  },
  {
    phase: "resolve",
    title: "Resolver → Route 53: “A record for yourapp.com?”",
    note: "This is the only server that actually holds your records. It is the authoritative nameserver — the source of truth. Everything else in this picture is a cache.",
    msg: { from: "resolver", to: "r53", text: "A yourapp.com ?", kind: "ask" },
    active: ["resolver", "r53"],
    cache: [
      { name: "com  NS", value: "a.gtld-servers.net", ttl: 172800 },
      { name: "yourapp.com  NS", value: "ns-123.awsdns-15.com", ttl: 172800 },
    ],
    clock: 0,
  },
  {
    phase: "cache",
    title: "Route 53 → resolver: “52.66.12.9, TTL 300”",
    note: "The real answer, with a rule attached: you may keep this for 300 seconds. The resolver stores the row in its cache with that countdown.",
    msg: { from: "r53", to: "resolver", text: "52.66.12.9  (TTL 300)", kind: "answer" },
    active: ["resolver", "r53"],
    cache: [
      { name: "com  NS", value: "a.gtld-servers.net", ttl: 172800 },
      { name: "yourapp.com  NS", value: "ns-123.awsdns-15.com", ttl: 172800 },
      hit,
    ],
    clock: 0,
  },
  {
    phase: "answer",
    title: "Resolver → browser: “52.66.12.9”",
    note: "The browser finally has an IP. The whole chain took a few round trips — typically 20–100 ms — and it happened before a single byte of your page was requested.",
    msg: { from: "resolver", to: "browser", text: "52.66.12.9", kind: "answer" },
    active: ["browser", "resolver"],
    cache: [
      { name: "com  NS", value: "a.gtld-servers.net", ttl: 172800 },
      { name: "yourapp.com  NS", value: "ns-123.awsdns-15.com", ttl: 172800 },
      hit,
    ],
    clock: 0,
  },
  {
    phase: "browser",
    title: "Browser connects to 52.66.12.9 — DNS is done",
    note: "From here on it is TCP, TLS and HTTP (Lesson 2 and Lesson 4). DNS is not involved again until the cached answer expires.",
    active: ["browser"],
    cache: [
      { name: "com  NS", value: "a.gtld-servers.net", ttl: 172800 },
      { name: "yourapp.com  NS", value: "ns-123.awsdns-15.com", ttl: 172800 },
      hit,
    ],
    clock: 0,
  },
  {
    phase: "cache",
    title: "60 seconds later — a second visitor asks",
    note: "Same resolver, same question. This time the row is in the cache with 240 seconds left, so the resolver answers instantly. Root, TLD and Route 53 are not contacted at all.",
    msg: { from: "resolver", to: "browser", text: "52.66.12.9  (from cache)", kind: "answer" },
    active: ["browser", "resolver"],
    cache: [
      { name: "com  NS", value: "a.gtld-servers.net", ttl: 172740 },
      { name: "yourapp.com  NS", value: "ns-123.awsdns-15.com", ttl: 172740 },
      { ...hit, ttl: 240 },
    ],
    clock: 60,
  },
  {
    phase: "expire",
    title: "300 seconds later — the TTL runs out",
    note: "The countdown reaches zero and the row is thrown away. The next question for yourapp.com goes back to Route 53. If you changed the record in the meantime, this is the moment this resolver sees the new IP — which is all “propagation” really means.",
    active: ["resolver"],
    cache: [
      { name: "com  NS", value: "a.gtld-servers.net", ttl: 172500 },
      { name: "yourapp.com  NS", value: "ns-123.awsdns-15.com", ttl: 172500 },
      { ...hit, ttl: 0, stale: true },
    ],
    clock: 300,
  },
  {
    phase: "resolve",
    title: "Next lookup — straight to Route 53",
    note: "The NS referrals are still cached (their TTL is two days), so the resolver skips root and TLD and asks Route 53 directly. A shorter chain, a fresh answer, a new 300-second countdown.",
    msg: { from: "resolver", to: "r53", text: "A yourapp.com ?", kind: "ask" },
    active: ["resolver", "r53"],
    cache: [
      { name: "com  NS", value: "a.gtld-servers.net", ttl: 172500 },
      { name: "yourapp.com  NS", value: "ns-123.awsdns-15.com", ttl: 172500 },
    ],
    clock: 301,
  },
];

const phases: Record<Step["phase"], PhaseStyle> = {
  browser: { label: "Browser", className: PHASE.plain },
  resolve: { label: "Recursive lookup · question", className: PHASE.sky },
  answer: { label: "Recursive lookup · answer", className: PHASE.green },
  cache: { label: "Resolver cache", className: PHASE.amber },
  expire: { label: "TTL expired", className: PHASE.red },
};

const idx = (id: NodeId) => NODES.findIndex((n) => n.id === id);

function fmtTtl(s: number) {
  if (s >= 86400) return `${Math.round(s / 86400)}d`;
  if (s >= 3600) return `${Math.round(s / 3600)}h`;
  return `${s}s`;
}

export default function DnsLookupStepper() {
  return (
    <Stepper
      steps={STEPS}
      phases={phases}
      caption="Step through one lookup. The question climbs from the browser to the authoritative server, the answer comes back with a TTL, and the resolver serves it from cache until that countdown hits zero."
      interval={2200}
    >
      {(step) => {
        const msg = step.msg;
        const from = msg ? idx(msg.from) : -1;
        const to = msg ? idx(msg.to) : -1;
        const lo = Math.min(from, to);
        const hi = Math.max(from, to);
        const rightward = to > from;
        return (
          <>
            {/* The servers, left to right */}
            <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
              <div className="flex items-center justify-between border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">
                <span>Who talks to whom</span>
                <span>t = {step.clock}s</span>
              </div>
              <div className="grid grid-cols-5 gap-1 p-3 max-sm:grid-cols-3 max-sm:gap-2">
                {NODES.map((n, i) => {
                  const active = step.active.includes(n.id);
                  return (
                    <div
                      key={n.id}
                      className={`rounded-lg border px-2 py-2 text-center transition-colors ${
                        active ? "border-sky/60 bg-sky-soft" : "border-line bg-bg-elev opacity-70"
                      }`}
                    >
                      <div className={`text-[0.82rem] font-semibold ${active ? "text-sky-strong" : "text-ink"}`}>{n.title}</div>
                      <div className="text-[0.7rem] text-ink-dim">{n.desc}</div>
                      <div className="mt-1 font-mono text-[0.65rem] text-ink-dim/60">{i === 4 ? "source of truth" : i === 0 ? "asks" : "cache"}</div>
                    </div>
                  );
                })}
              </div>
              {/* The wire: a bar spanning from→to under the node row, with the message on it */}
              <div className="hidden grid-cols-5 gap-1 px-3 pb-3 sm:grid">
                {NODES.map((n, i) => {
                  const on = msg && i >= lo && i <= hi;
                  const isFrom = msg && i === from;
                  const isTo = msg && i === to;
                  const colour = msg?.kind === "ask" ? "bg-sky" : "bg-emerald-400";
                  return (
                    <div key={n.id} className="relative h-6">
                      {on ? (
                        <div
                          className={`absolute top-1/2 h-0.5 -translate-y-1/2 ${colour} ${isFrom || isTo ? (rightward === isFrom ? "left-1/2 right-0" : "left-0 right-1/2") : "left-0 right-0"}`}
                        />
                      ) : null}
                      {isTo ? (
                        <div
                          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[0.9rem] leading-none ${msg?.kind === "ask" ? "text-sky" : "text-emerald-400"}`}
                        >
                          {rightward ? "▶" : "◀"}
                        </div>
                      ) : null}
                      {isFrom ? (
                        <div className={`absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ${colour}`} />
                      ) : null}
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-line px-3 py-2 font-mono text-[0.8rem]">
                {msg ? (
                  <span className={msg.kind === "ask" ? "text-sky" : "text-emerald-300"}>
                    {NODES[from].title} {rightward ? "→" : "←"} {NODES[to].title}: <span className="text-ink">{msg.text}</span>
                  </span>
                ) : (
                  <span className="text-ink-dim">(nothing on the wire)</span>
                )}
              </div>
            </div>

            {/* Resolver cache */}
            <div className="mt-4 overflow-hidden rounded-lg border border-line bg-bg-code">
              <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">
                Resolver cache · rows expire when TTL hits 0
              </div>
              <table className="my-0 w-full text-[0.8rem]">
                <tbody>
                  {step.cache.length === 0 ? (
                    <tr>
                      <td className="border-0 px-3 py-2 font-mono text-ink-dim">(empty)</td>
                    </tr>
                  ) : (
                    step.cache.map((row) => {
                      const fresh = step.phase === "cache" && row.ttl === 300;
                      return (
                        <tr
                          key={row.name}
                          className={row.stale ? "bg-red-400/10 line-through opacity-60" : fresh ? "bg-amber-400/15" : ""}
                        >
                          <td className="border-0 px-3 py-1 font-mono text-sky-strong">{row.name}</td>
                          <td className="border-0 px-3 py-1 font-mono text-emerald-200">{row.value}</td>
                          <td className={`border-0 px-3 py-1 text-right font-mono ${row.ttl <= 300 ? "text-amber-200" : "text-ink-dim"}`}>
                            TTL {fmtTtl(row.ttl)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        );
      }}
    </Stepper>
  );
}
