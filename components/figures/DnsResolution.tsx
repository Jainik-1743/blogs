import Figure from "./Figure";
import HopChain, { type Hop } from "./HopChain";

/** The full recursive lookup, top to bottom. It runs once; after that the resolver answers from cache until the TTL expires. */
const hops: Hop[] = [
  { title: "Browser", desc: "wants to reach yourapp.com", tone: "plain", edge: "is it cached? no → ask the resolver" },
  { title: "DNS resolver", desc: "your ISP, or Google 8.8.8.8", tone: "sky", edge: "1. who handles .com?" },
  { title: "Root server", desc: "points to the .com TLD servers", tone: "plain", edge: "2. who runs yourapp.com?" },
  { title: ".com TLD server", desc: "points to the Route 53 nameservers", tone: "warn", edge: "3. what is the IP?" },
  { title: "Route 53 (authoritative)", desc: "holds your actual DNS records", tone: "ok", edge: "4. returns 52.66.12.9 — cached for TTL seconds" },
  { title: "Browser connects directly", desc: "to 52.66.12.9 — DNS is done", tone: "purple" },
];

export default function DnsResolution() {
  return (
    <Figure caption="How a domain name becomes an IP address. This full chain runs only on a cache miss — after that the resolver answers instantly until the TTL expires.">
      <HopChain hops={hops} label="DNS resolution" />
    </Figure>
  );
}
