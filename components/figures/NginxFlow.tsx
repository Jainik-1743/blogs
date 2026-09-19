import Figure from "./Figure";
import HopChain, { type Hop } from "./HopChain";

const hops: Hop[] = [
  { title: "Browser", desc: "https://yourapp.com/dashboard", tone: "plain", edge: "port 443 — the only public door" },
  { title: "Nginx", desc: "ends TLS · serves /static files itself · gzips · rate-limits · adds headers", tone: "ok", edge: "proxy_pass http://127.0.0.1:3000 — private" },
  { title: "Next.js / Node app", desc: "sees a plain HTTP request with X-Forwarded-* headers", tone: "purple", edge: "response goes back the same way, compressed by Nginx" },
  { title: "Browser", desc: "gets the page — never knew port 3000 existed", tone: "plain" },
];

export default function NginxFlow() {
  return (
    <Figure caption="Nginx as reverse proxy. Everything public happens at Nginx; your app only ever talks to Nginx over localhost.">
      <HopChain hops={hops} label="Nginx reverse proxy flow" />
    </Figure>
  );
}
