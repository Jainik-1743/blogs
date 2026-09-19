/**
 * Every short form used across the series, with its full name and a one-line meaning.
 * Hovering (or tapping) any of these words inside a lesson shows this entry, so a reader
 * who has forgotten what "ALB" means never has to leave the page. The full list is also
 * rendered at /devops/glossary.
 */
export type GlossaryEntry = {
  /** The exact text as it appears in prose. Matched as a whole word, case-sensitive. */
  term: string;
  /** Other spellings that should show the same entry. */
  aliases?: string[];
  /** What the short form stands for, or the long name. */
  full: string;
  /** One or two plain sentences. */
  desc: string;
  /** The lesson that explains it properly, if any. */
  lesson?: number;
  /** Grouping on the glossary page. */
  group: "AWS" | "Networking" | "Linux" | "Tools" | "Concepts";
};

export const GLOSSARY: GlossaryEntry[] = [
  // ── AWS services ────────────────────────────────────────────────────────
  { term: "AWS", full: "Amazon Web Services", desc: "Amazon's cloud platform. It rents you raw building blocks — computers, networks, storage, databases — that you assemble yourself.", lesson: 0, group: "AWS" },
  { term: "EC2", full: "Elastic Compute Cloud", desc: "A virtual computer you rent from AWS. You install whatever you want on it — for us, Linux + Node.js + your Next.js app.", lesson: 7, group: "AWS" },
  { term: "VPC", full: "Virtual Private Cloud", desc: "Your own private network inside AWS, so your servers are not exposed to the whole internet by default.", lesson: 6, group: "AWS" },
  { term: "IAM", full: "Identity and Access Management", desc: "Who is allowed to do what in your AWS account — users, roles, permissions and policies.", lesson: 5, group: "AWS" },
  { term: "ALB", full: "Application Load Balancer", desc: "Sits in front of many servers and divides incoming web traffic between them. Also checks which servers are healthy.", lesson: 12, group: "AWS" },
  { term: "Auto Scaling", full: "EC2 Auto Scaling", desc: "Automatically adds servers when traffic is high and removes them when traffic is low, so you pay only for what you use.", lesson: 12, group: "AWS" },
  { term: "S3", full: "Simple Storage Service", desc: "File storage. Images, PDFs, uploads, backups — anything that is a file rather than a database row.", lesson: 11, group: "AWS" },
  { term: "RDS", full: "Relational Database Service", desc: "Managed PostgreSQL / MySQL. AWS runs the database server for you and handles backups, patching and failover.", lesson: 8, group: "AWS" },
  { term: "CloudFront", full: "Amazon CloudFront", desc: "AWS's CDN. Keeps copies of your static files in servers around the world so pages load fast near every user.", lesson: 11, group: "AWS" },
  { term: "Route 53", full: "Amazon Route 53", desc: "AWS's DNS service. Connects your domain name to your AWS setup. Named after port 53, which DNS uses.", lesson: 3, group: "AWS" },
  { term: "CloudWatch", full: "Amazon CloudWatch", desc: "AWS's monitoring service: metrics, logs, alarms and dashboards for everything you run.", lesson: 17, group: "AWS" },
  { term: "ACM", full: "AWS Certificate Manager", desc: "Issues and renews free TLS certificates for use with AWS load balancers and CloudFront.", lesson: 4, group: "AWS" },
  { term: "ARN", full: "Amazon Resource Name", desc: "The unique ID of any AWS resource, e.g. arn:aws:iam::123456789012:user/admin. If it says :root, you are on the root user.", lesson: 0, group: "AWS" },
  { term: "MFA", full: "Multi-Factor Authentication", desc: "A second login step (a code from your phone) on top of the password. Turn it on for the root user on day one.", lesson: 0, group: "AWS" },
  { term: "Security Group", aliases: ["Security Groups", "security group", "security groups"], full: "Security Group (virtual firewall)", desc: "A rule list attached to an EC2 server that decides which ports may receive traffic, and from whom. Blocks everything inbound by default.", lesson: 2, group: "AWS" },
  { term: "Network ACL", aliases: ["Network ACLs"], full: "Network Access Control List", desc: "A stricter, stateless firewall at the subnet level. Unlike a Security Group you must write rules for both directions.", lesson: 6, group: "AWS" },
  { term: "Hosted Zone", aliases: ["hosted zone", "Hosted Zones", "hosted zones"], full: "Route 53 Hosted Zone", desc: "The container in Route 53 that holds every DNS record for one domain.", lesson: 3, group: "AWS" },
  { term: "root user", aliases: ["Root user"], full: "AWS account root user", desc: "The identity created when you sign up for AWS. It can do anything, including delete the account — lock it away with MFA and never use it for daily work.", lesson: 0, group: "AWS" },

  // ── Networking ─────────────────────────────────────────────────────────
  { term: "IP", aliases: ["IP address", "IP addresses"], full: "Internet Protocol address", desc: "A number that identifies a device on a network, like a house address. Example: 52.66.12.9.", lesson: 2, group: "Networking" },
  { term: "DNS", full: "Domain Name System", desc: "The internet's phone book. Turns a name like yourapp.com into an IP address like 52.66.12.9.", lesson: 3, group: "Networking" },
  { term: "TCP", full: "Transmission Control Protocol", desc: "Reliable, ordered delivery: every packet is checked and re-sent if lost. Websites, databases and SSH all use it.", lesson: 2, group: "Networking" },
  { term: "UDP", full: "User Datagram Protocol", desc: "Fast delivery with no guarantee. Used for video calls, DNS lookups and gaming, where speed beats perfection.", lesson: 2, group: "Networking" },
  { term: "HTTP", full: "HyperText Transfer Protocol", desc: "The language browsers and web servers speak. Plain text, port 80.", lesson: 2, group: "Networking" },
  { term: "HTTPS", full: "HTTP Secure", desc: "HTTP wrapped in TLS encryption, on port 443. The padlock in the browser.", lesson: 4, group: "Networking" },
  { term: "TLS", full: "Transport Layer Security", desc: "The encryption layer under HTTPS. The modern name for SSL.", lesson: 4, group: "Networking" },
  { term: "SSL", full: "Secure Sockets Layer", desc: "The old name for TLS. People still say “SSL certificate”, but it is TLS underneath.", lesson: 4, group: "Networking" },
  { term: "SSH", full: "Secure Shell", desc: "Encrypted terminal login to a remote server, on port 22. Your only way into an EC2 box.", lesson: 1, group: "Networking" },
  { term: "CDN", full: "Content Delivery Network", desc: "A network of servers around the world that cache your files close to users so they load fast.", lesson: 11, group: "Networking" },
  { term: "CIDR", full: "Classless Inter-Domain Routing", desc: "The /16, /24, /32 notation for a range of IP addresses. Smaller number = bigger range. /32 is exactly one address.", lesson: 2, group: "Networking" },
  { term: "TTL", full: "Time To Live", desc: "How long, in seconds, a DNS answer may be cached before resolvers must ask again. 300 = 5 minutes.", lesson: 3, group: "Networking" },
  { term: "localhost", full: "localhost / 127.0.0.1", desc: "“This same machine only.” A service bound here cannot be reached from outside the server.", lesson: 2, group: "Networking" },
  { term: "0.0.0.0", full: "All network interfaces", desc: "When a server binds here it accepts connections from any network the machine is on — reachable from outside if the firewall allows.", lesson: 2, group: "Networking" },
  { term: "port", aliases: ["ports", "Port"], full: "Network port", desc: "A numbered door (0–65535) on an IP address. Each service listens on its own: SSH 22, HTTP 80, HTTPS 443, PostgreSQL 5432.", lesson: 2, group: "Networking" },
  { term: "CNAME", full: "Canonical Name record", desc: "A DNS record that says “this name is an alias for that name”, e.g. www.yourapp.com → yourapp.com.", lesson: 3, group: "Networking" },
  { term: "MX", full: "Mail Exchange record", desc: "A DNS record that says where email for this domain should be delivered.", lesson: 3, group: "Networking" },
  { term: "TXT", full: "Text record", desc: "A DNS record holding free text, used to prove domain ownership and for email rules like SPF.", lesson: 3, group: "Networking" },
  { term: "NS", full: "Nameserver record", desc: "A DNS record naming the servers that are authoritative for a domain — for us, the four Route 53 nameservers.", lesson: 3, group: "Networking" },
  { term: "nameserver", aliases: ["nameservers"], full: "Nameserver", desc: "A server that answers DNS questions for a domain. Route 53 gives you four.", lesson: 3, group: "Networking" },
  { term: "reverse proxy", aliases: ["Reverse proxy"], full: "Reverse proxy", desc: "A server (Nginx for us) that receives public requests on 80/443 and forwards them to your app on a private port like 3000.", lesson: 10, group: "Networking" },
  { term: "load balancer", aliases: ["Load balancer"], full: "Load balancer", desc: "Divides incoming traffic between many servers so no single one is overwhelmed. On AWS this is the ALB.", lesson: 12, group: "Networking" },
  { term: "firewall", aliases: ["Firewall"], full: "Firewall", desc: "A rule list that decides which network traffic is allowed in or out. On EC2, that is the Security Group.", lesson: 2, group: "Networking" },

  // ── Linux ──────────────────────────────────────────────────────────────
  { term: "sudo", full: "superuser do", desc: "Run one command as the admin (root) user, then go back to being a normal user.", lesson: 1, group: "Linux" },
  { term: "chmod", full: "change mode", desc: "Set who may read, write or execute a file: chmod 600 .env = only the owner.", lesson: 1, group: "Linux" },
  { term: "chown", full: "change owner", desc: "Change which user and group own a file, e.g. chown ubuntu:www-data file.", lesson: 1, group: "Linux" },
  { term: "WSL", full: "Windows Subsystem for Linux", desc: "Real Ubuntu running inside Windows. Install with wsl --install to practise Linux commands without a server.", lesson: 1, group: "Linux" },
  { term: "PM2", full: "PM2 process manager", desc: "Keeps your Node app running after you close the terminal, and restarts it if it crashes.", lesson: 1, group: "Linux" },
  { term: "process", aliases: ["processes"], full: "Process", desc: "A running program. Your Next.js app is one; close the terminal that started it and it dies — unless a process manager owns it.", lesson: 1, group: "Linux" },

  // ── Tools ──────────────────────────────────────────────────────────────
  { term: "CLI", full: "Command Line Interface", desc: "Controlling a tool by typing commands instead of clicking. The AWS CLI lets you drive AWS from your terminal.", lesson: 0, group: "Tools" },
  { term: "Nginx", full: "Nginx web server", desc: "The receptionist in front of your app: handles HTTPS, static files and compression, and forwards requests to port 3000.", lesson: 10, group: "Tools" },
  { term: "PostgreSQL", aliases: ["Postgres"], full: "PostgreSQL", desc: "The open-source relational database this series uses. On AWS it runs as RDS.", lesson: 8, group: "Tools" },
  { term: "Redis", full: "Redis", desc: "Very fast in-memory key-value store, used for sessions, caching and rate limiting.", lesson: 16, group: "Tools" },
  { term: "Docker", full: "Docker", desc: "Packages your app and everything it needs into one image that runs identically on your laptop and on a server.", lesson: 9, group: "Tools" },
  { term: "Terraform", full: "Terraform", desc: "Describe your cloud in files, review changes in pull requests, and rebuild the whole setup in minutes.", lesson: 15, group: "Tools" },
  { term: "GitHub Actions", full: "GitHub Actions", desc: "GitHub's built-in CI/CD: runs your tests, builds and deploys on every push.", lesson: 14, group: "Tools" },
  { term: "Let's Encrypt", aliases: ["Let’s Encrypt"], full: "Let's Encrypt", desc: "A free, automated certificate authority. Gives you a trusted HTTPS certificate in one command.", lesson: 4, group: "Tools" },
  { term: "Vercel", full: "Vercel", desc: "The PaaS this series starts from. git push and it hosts your Next.js app — until cost, long jobs or control become a problem.", lesson: 0, group: "Tools" },
  { term: "dig", full: "domain information groper", desc: "The command-line tool for asking DNS questions: dig yourapp.com +short.", lesson: 3, group: "Tools" },

  // ── Concepts ───────────────────────────────────────────────────────────
  { term: "PaaS", full: "Platform as a Service", desc: "You push code; the platform decides everything else. Vercel, Railway, Render.", lesson: 0, group: "Concepts" },
  { term: "IaaS", full: "Infrastructure as a Service", desc: "You get raw building blocks and wire them together yourself. AWS.", lesson: 0, group: "Concepts" },
  { term: "CI/CD", full: "Continuous Integration / Continuous Deployment", desc: "Every push is automatically tested, built and deployed — no one SSH-ing into a server.", lesson: 14, group: "Concepts" },
  { term: "multi-tenant", aliases: ["Multi-tenant"], full: "Multi-tenant SaaS", desc: "One application serving many customer companies, with each company's data kept separate — often one subdomain per customer.", lesson: 3, group: "Concepts" },
  { term: "SaaS", full: "Software as a Service", desc: "Software you use through a browser and pay for monthly, instead of installing it. Your product.", group: "Concepts" },
  { term: "serverless", aliases: ["Serverless"], full: "Serverless functions", desc: "Small pieces of code that run on demand and are billed per request. Convenient, but with time limits and per-request cost.", lesson: 0, group: "Concepts" },
  { term: "stateful", full: "Stateful (firewall)", desc: "Remembers connections: if a request was allowed in, its reply is automatically allowed out. Security Groups are stateful.", lesson: 2, group: "Concepts" },
  { term: "stateless", full: "Stateless", desc: "Remembers nothing between requests. A stateless firewall needs rules for both directions; a stateless app can run on any server.", lesson: 2, group: "Concepts" },
  { term: "allow-listing", full: "Allow-listing", desc: "Block everything, then permit only what you explicitly list. The default behaviour of a Security Group.", lesson: 2, group: "Concepts" },
  { term: "wildcard", aliases: ["Wildcard"], full: "Wildcard DNS record", desc: "A record like *.yourapp.com that answers for every subdomain, including ones that do not exist yet.", lesson: 3, group: "Concepts" },
  { term: "authoritative", full: "Authoritative nameserver", desc: "The one source of truth for a domain's DNS records. Everything else is a cached copy.", lesson: 3, group: "Concepts" },
];

/** Lookup by term or alias. */
export function findEntry(text: string): GlossaryEntry | undefined {
  return GLOSSARY.find((e) => e.term === text || e.aliases?.includes(text));
}
