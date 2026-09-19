import Figure from "./Figure";
import HopChain, { type Hop } from "./HopChain";

/** Each hop a browser request makes before it reaches the app — and the private hop after that. */
const hops: Hop[] = [
  { title: "Browser", desc: "requests https://yourapp.com", tone: "plain", edge: "DNS resolves the domain to an IP" },
  { title: "Security Group (firewall)", desc: "only allows ports 80 and 443 in", tone: "warn" },
  { title: "EC2 public IP : port 443", desc: "the actual server address", tone: "sky" },
  { title: "Nginx (reverse proxy)", desc: "listens on 80/443, forwards inside", tone: "ok", edge: "internal — invisible from outside" },
  { title: "Next.js / Node app", desc: "listening on 127.0.0.1:3000 only", tone: "purple" },
  { title: "Response travels back the same path", desc: "", tone: "plain" },
];

export default function RequestFlow() {
  return (
    <Figure caption="How a browser request reaches a Next.js app on EC2. Only Nginx is ever exposed publicly — port 3000 stays private for the app's entire life.">
      <HopChain hops={hops} label="Request flow" />
    </Figure>
  );
}
