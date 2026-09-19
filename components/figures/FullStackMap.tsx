import Figure from "./Figure";
import HopChain, { type Hop } from "./HopChain";

/** Every piece of the final architecture, in the order one request meets them. */
const hops: Hop[] = [
  { title: "User's browser", desc: "types https://yourapp.com", tone: "plain", edge: "DNS: name → IP  (Lesson 3, 13)" },
  { title: "Route 53", desc: "answers with the CloudFront or ALB address", tone: "sky", edge: "static file? served from the edge  (Lesson 11)" },
  { title: "CloudFront (CDN)", desc: "cache near the user; passes dynamic requests on", tone: "ok", edge: "TLS ends here or at the ALB  (Lesson 4)" },
  { title: "ALB (load balancer)", desc: "picks a healthy server; Auto Scaling adds more under load", tone: "warn", edge: "inside your VPC, public subnet  (Lesson 6, 12)" },
  { title: "EC2 · Nginx", desc: "receptionist on :80/:443 — forwards to the app on :3000", tone: "sky", edge: "127.0.0.1:3000  (Lesson 7, 10)" },
  { title: "EC2 · PM2 → Next.js / Node", desc: "your code, kept alive and restarted on crash", tone: "purple", edge: "private subnet only  (Lesson 8, 16)" },
  { title: "RDS (PostgreSQL) · Redis · S3", desc: "data, cache/sessions, files — never reachable from the internet", tone: "ok" },
];

export default function FullStackMap() {
  return (
    <Figure caption="The whole production setup, in the order one request meets each piece. Lessons 0–4 covered the arrows at the top; this reading explains every box below them." note="the map">
      <HopChain hops={hops} label="Full stack request path" />
    </Figure>
  );
}
