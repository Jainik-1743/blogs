import { JS_GLOSSARY } from "./js-glossary";
import { SD_GLOSSARY } from "./sd-glossary";

/**
 * Every short form used across the DevOps series, with its full name and a one-line meaning.
 * Hovering (or tapping) any of these words inside a lesson shows this entry, so a reader
 * who has forgotten what "ALB" means never has to leave the page. The full list is also
 * rendered at /devops/glossary. The JavaScript series has its own list in js-glossary.ts;
 * `glossaryFor()` picks the right one from the page path.
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
  /** Grouping on the glossary page — one of the parent glossary's `groups`. */
  group: string;
  /** Mark only the first use per page even though the term is capitalised (Kafka, Redis …). */
  once?: boolean;
};

/** One series' worth of terms plus where its tooltips should link. */
export type Glossary = {
  /** Series slug, also the URL prefix: /devops, /javascript. */
  series: string;
  seriesTitle: string;
  /** Group order on the glossary page. */
  groups: string[];
  entries: GlossaryEntry[];
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

  // ── Added with Lessons 6–19 ─────────────────────────────────────────────
  { term: "subnet", aliases: ["subnets", "Subnet", "Subnets"], full: "Subnet", desc: "A slice of a VPC's address range that lives in one Availability Zone. It is public if its route table sends 0.0.0.0/0 to an Internet Gateway, otherwise private.", lesson: 6, group: "AWS" },
  { term: "Internet Gateway", aliases: ["IGW"], full: "Internet Gateway", desc: "The VPC's front door to the public internet. It does nothing until a route table points at it. Free.", lesson: 6, group: "AWS" },
  { term: "NAT Gateway", aliases: ["NAT"], full: "Network Address Translation gateway", desc: "Lets servers in a private subnet call out to the internet without being reachable from it. Convenient, but roughly $40 a month even when idle.", lesson: 6, group: "AWS" },
  { term: "route table", aliases: ["route tables", "Route table", "Route tables"], full: "Route table", desc: "A list of rules saying where traffic for each destination goes. It is the single thing that makes a subnet public or private.", lesson: 6, group: "AWS" },
  { term: "Availability Zone", aliases: ["Availability Zones", "availability zone", "availability zones", "AZ", "AZs"], full: "Availability Zone", desc: "One of several physically separate data centres inside an AWS region (ap-south-1a, 1b, 1c). Spread servers across at least two to survive a failure.", lesson: 6, group: "AWS" },
  { term: "AMI", aliases: ["AMIs"], full: "Amazon Machine Image", desc: "The template a server is launched from: an operating system plus any preinstalled software.", lesson: 7, group: "AWS" },
  { term: "EBS", full: "Elastic Block Store", desc: "The network hard disk of an EC2 server. It survives stopping the instance, is billed per GB-month, and can grow but never shrink.", lesson: 7, group: "AWS" },
  { term: "Elastic IP", aliases: ["Elastic IPs"], full: "Elastic IP address", desc: "A public IPv4 address that stays yours when a server stops and starts. Billed hourly, attached or not.", lesson: 7, group: "AWS" },
  { term: "instance profile", aliases: ["Instance profile"], full: "IAM instance profile", desc: "The wrapper that lets an EC2 server wear an IAM role. The console creates it silently; the CLI makes you create it.", lesson: 7, group: "AWS" },
  { term: "IMDSv2", full: "Instance Metadata Service, version 2", desc: "The token-protected way for a server to fetch its own role credentials. Requiring it blocks a common credential-theft attack.", lesson: 7, group: "AWS" },
  { term: "Multi-AZ", full: "Multi-Availability-Zone deployment", desc: "A hidden standby copy of a database in a second zone with automatic failover. Protects against hardware failure, not against deleted data.", lesson: 8, group: "AWS" },
  { term: "read replica", aliases: ["read replicas", "Read replica", "Read replicas"], full: "Read replica", desc: "A queryable, asynchronous copy of a database used to spread read traffic. Different from Multi-AZ, which cannot be queried.", lesson: 8, group: "AWS" },
  { term: "snapshot", aliases: ["snapshots", "Snapshot", "Snapshots"], full: "Snapshot", desc: "A saved copy of a disk or database at one moment. Manual snapshots stay until you delete them; restoring one creates a new instance.", lesson: 8, group: "AWS" },
  { term: "ECR", full: "Elastic Container Registry", desc: "AWS's private registry for Docker images. Servers and pipelines push and pull images from it using IAM roles.", lesson: 9, group: "AWS" },
  { term: "presigned URL", aliases: ["presigned URLs", "Presigned URL", "Presigned URLs"], full: "Presigned URL", desc: "A time-limited link, signed with your credentials, that lets a browser upload or download one specific S3 object directly.", lesson: 11, group: "AWS" },
  { term: "OAC", full: "Origin Access Control", desc: "The setting that lets one CloudFront distribution, and nobody else, read a private S3 bucket.", lesson: 11, group: "AWS" },
  { term: "edge location", aliases: ["edge locations", "Edge location", "Edge locations"], full: "CDN edge location", desc: "One of hundreds of small data centres where a CDN keeps cached copies of your files close to users.", lesson: 11, group: "AWS" },
  { term: "target group", aliases: ["target groups", "Target group", "Target groups"], full: "ALB target group", desc: "The pool of servers a load balancer sends traffic to, together with the health check that decides which of them are allowed to receive it.", lesson: 12, group: "AWS" },
  { term: "launch template", aliases: ["launch templates", "Launch template", "Launch templates"], full: "EC2 launch template", desc: "The versioned recipe for one server (image, size, role, Security Group, boot script) that an Auto Scaling group copies.", lesson: 12, group: "AWS" },
  { term: "Auto Scaling group", aliases: ["Auto Scaling groups", "ASG"], full: "Auto Scaling group", desc: "Keeps a chosen number of identical servers running across zones, replaces failed ones and adds or removes servers with load.", lesson: 12, group: "AWS" },
  { term: "instance refresh", aliases: ["Instance refresh"], full: "Auto Scaling instance refresh", desc: "Rolls every server in a group onto a new version a few at a time, waiting for health checks, so deploys cause no downtime.", lesson: 12, group: "AWS" },
  { term: "health check", aliases: ["health checks", "Health check", "Health checks"], full: "Health check", desc: "A request a load balancer or DNS service makes on a schedule. Servers that fail it stop receiving traffic.", lesson: 12, group: "AWS" },
  { term: "Parameter Store", full: "SSM Parameter Store", desc: "A free place to keep configuration and encrypted secrets that servers read at boot with their IAM role.", lesson: 12, group: "AWS" },
  { term: "alias record", aliases: ["alias records", "Alias record", "Alias records"], full: "Route 53 alias record", desc: "A Route 53 record that points a name, including the bare domain, at an AWS resource such as an ALB or CloudFront. Free to query.", lesson: 13, group: "AWS" },
  { term: "private hosted zone", aliases: ["private hosted zones", "Private hosted zone"], full: "Private hosted zone", desc: "A Route 53 zone whose names resolve only inside one VPC, for example db.internal.yourapp.com.", lesson: 13, group: "AWS" },
  { term: "ElastiCache", full: "Amazon ElastiCache", desc: "Managed Redis or Valkey: AWS runs and patches the cache nodes, and you connect from inside the VPC.", lesson: 16, group: "AWS" },
  { term: "SNS", full: "Simple Notification Service", desc: "A broadcast channel. CloudWatch alarms publish to a topic, and email, SMS or Slack subscribers receive the message.", lesson: 17, group: "AWS" },
  { term: "Logs Insights", full: "CloudWatch Logs Insights", desc: "A query language for searching and summarising logs stored in CloudWatch, for example errors per tenant in the last hour.", lesson: 17, group: "AWS" },
  { term: "SSM", aliases: ["Systems Manager"], full: "AWS Systems Manager", desc: "A family of tools for managing servers without SSH: Session Manager, Run Command and Parameter Store.", lesson: 18, group: "AWS" },
  { term: "Session Manager", full: "SSM Session Manager", desc: "A shell on a server through your IAM login, with no open port, no key pair and every session logged.", lesson: 18, group: "AWS" },
  { term: "Secrets Manager", full: "AWS Secrets Manager", desc: "Stores secrets such as database passwords and can rotate them automatically. About $0.40 per secret per month.", lesson: 18, group: "AWS" },
  { term: "CloudTrail", full: "AWS CloudTrail", desc: "The audit log of your account: every API call, who made it, when and from where. You cannot investigate an incident without it.", lesson: 18, group: "AWS" },
  { term: "GuardDuty", full: "Amazon GuardDuty", desc: "Threat detection that watches your account and network logs for suspicious behaviour, such as a key used from a known malicious address.", lesson: 18, group: "AWS" },
  { term: "WAF", full: "Web Application Firewall", desc: "Filters web requests before they reach your app, blocking common attacks such as SQL injection and abusive bots.", lesson: 18, group: "AWS" },
  { term: "Savings Plan", aliases: ["Savings Plans"], full: "Compute Savings Plan", desc: "A one- or three-year commitment to a dollar amount of compute per hour in exchange for up to about 66% off on-demand prices.", lesson: 19, group: "AWS" },
  { term: "Reserved Instance", aliases: ["Reserved Instances"], full: "Reserved Instance", desc: "A one- or three-year commitment to a specific instance type, database or cache in exchange for a discount of roughly 30–60%.", lesson: 19, group: "AWS" },
  { term: "Graviton", full: "AWS Graviton (ARM) processors", desc: "AWS's own ARM CPUs, used by instance types with a g (t4g, m7g). About 20% cheaper for the same performance; images must be built for ARM.", lesson: 19, group: "AWS" },
  { term: "Cost Explorer", full: "AWS Cost Explorer", desc: "The console tool for seeing spend by service, tag or day, and spotting the day a cost jumped.", lesson: 19, group: "AWS" },
  { term: "ECS", full: "Elastic Container Service", desc: "AWS's service for running Docker containers without managing the orchestration yourself. Often paired with Fargate.", lesson: 19, group: "AWS" },
  { term: "EKS", full: "Elastic Kubernetes Service", desc: "Managed Kubernetes on AWS, for teams running many services. Powerful, with real operational cost.", lesson: 19, group: "AWS" },
  { term: "Fargate", full: "AWS Fargate", desc: "Runs containers for you with no servers to patch or size; you pay per vCPU and memory used.", lesson: 19, group: "AWS" },

  { term: "SPF", full: "Sender Policy Framework", desc: "A DNS TXT record listing which servers may send email for your domain.", lesson: 13, group: "Networking" },
  { term: "DKIM", full: "DomainKeys Identified Mail", desc: "A public key published in DNS so recipients can verify that an email really was signed by your domain.", lesson: 13, group: "Networking" },
  { term: "DMARC", full: "Domain-based Message Authentication, Reporting and Conformance", desc: "A DNS record telling receivers what to do with mail that fails SPF or DKIM, and where to send reports. Start at p=none.", lesson: 13, group: "Networking" },
  { term: "CORS", full: "Cross-Origin Resource Sharing", desc: "The browser rule that stops a page on one site calling another site unless that site agrees. Browser uploads straight to S3 need a CORS configuration on the bucket.", lesson: 11, group: "Networking" },

  { term: "Dockerfile", full: "Dockerfile", desc: "The text file of instructions Docker follows to build an image.", lesson: 9, group: "Tools", once: true },
  { term: "Docker Compose", full: "Docker Compose", desc: "Describes several containers (app, database, cache) in one file and starts them together with one command.", lesson: 9, group: "Tools" },
  { term: "container", aliases: ["containers", "Container", "Containers"], full: "Container", desc: "A running instance of a Docker image: your app in an isolated box that shares the host's kernel. Starts in under a second.", lesson: 9, group: "Tools" },
  { term: "OIDC", full: "OpenID Connect", desc: "Lets GitHub prove a workflow's identity to AWS so the job receives temporary credentials with no stored access keys.", lesson: 14, group: "Tools" },
  { term: "HCL", full: "HashiCorp Configuration Language", desc: "The language Terraform files are written in: structured settings, not a programming language.", lesson: 15, group: "Tools" },
  { term: "OpenTofu", full: "OpenTofu", desc: "A community fork of Terraform with the same language and workflow, run with the tofu command.", lesson: 15, group: "Tools" },
  { term: "Valkey", full: "Valkey", desc: "A drop-in open-source replacement for Redis, supported by ElastiCache at a lower price. Same commands, same client libraries.", lesson: 16, group: "Tools" },

  { term: "least privilege", aliases: ["Least privilege"], full: "Principle of least privilege", desc: "Give an identity the minimum access needed to do its job and nothing more, so a mistake or a leak stays small.", lesson: 5, group: "Concepts" },
  { term: "defence in depth", aliases: ["Defence in depth", "defense in depth", "Defense in depth"], full: "Defence in depth", desc: "Layering independent protections so that when one fails, the next still holds.", lesson: 18, group: "Concepts" },
  { term: "IaC", full: "Infrastructure as Code", desc: "Describing servers, networks and databases in files that are reviewed, versioned and applied by a tool such as Terraform.", lesson: 15, group: "Concepts" },
  { term: "state file", aliases: ["State file", "Terraform state"], full: "Terraform state file", desc: "Terraform's record of which real resources it created. Keep it remote, versioned and locked; it can contain secrets.", lesson: 15, group: "Concepts" },
  { term: "drift", aliases: ["Drift"], full: "Configuration drift", desc: "When the real infrastructure no longer matches the code, usually because someone changed it in the console.", lesson: 15, group: "Concepts" },
  { term: "cache-aside", aliases: ["Cache-aside"], full: "Cache-aside pattern", desc: "Check the cache first; on a miss read the database, store the result with a TTL and return it.", lesson: 16, group: "Concepts" },
  { term: "eviction", aliases: ["Eviction"], full: "Cache eviction", desc: "What a full cache does with new data: delete old keys, or refuse writes, depending on the eviction policy.", lesson: 16, group: "Concepts" },
  { term: "golden signals", aliases: ["Golden signals", "four golden signals"], full: "The four golden signals", desc: "Latency, traffic, errors and saturation: the four measurements that reveal almost every user-visible problem.", lesson: 17, group: "Concepts" },
  { term: "p95", aliases: ["p99", "p50"], full: "Percentile latency", desc: "p95 means 95% of requests were faster than this value. Percentiles reveal the slow tail that averages hide.", lesson: 17, group: "Concepts" },
  { term: "SLO", aliases: ["SLI"], full: "Service Level Objective", desc: "A reliability target for a measurement (SLI), such as 99.9% of requests succeed. The gap to 100% is the error budget.", lesson: 17, group: "Concepts" },
  { term: "RPO", full: "Recovery Point Objective", desc: "How much data you can afford to lose, measured in time. It drives how often you back up.", lesson: 8, group: "Concepts" },
  { term: "RTO", full: "Recovery Time Objective", desc: "How long you can afford to be down. Measure it by actually running a restore drill.", lesson: 8, group: "Concepts" },
  { term: "blast radius", aliases: ["Blast radius"], full: "Blast radius", desc: "How much can be damaged when one credential, server or change goes wrong. Good design keeps it small.", lesson: 18, group: "Concepts" },
];

export const DEVOPS_GLOSSARY: Glossary = {
  series: "devops",
  seriesTitle: "DevOps, From Zero",
  groups: ["AWS", "Networking", "Linux", "Tools", "Concepts"],
  entries: GLOSSARY,
};

/** Lookup by term or alias. */
export function findEntry(glossary: Glossary, text: string): GlossaryEntry | undefined {
  return glossary.entries.find((e) => e.term === text || e.aliases?.includes(text));
}

export const glossaryHref = (g: Glossary) => `/${g.series}/glossary`;
export const glossaryLessonHref = (g: Glossary, lesson: number) => `/${g.series}/lesson-${lesson}`;

/** Which series' terms to mark on a page. Anything outside /javascript and /system-design uses the DevOps list. */
export function glossaryFor(pathname: string): Glossary {
  if (pathname.startsWith("/javascript")) return JS_GLOSSARY;
  if (pathname.startsWith("/system-design")) return SD_GLOSSARY;
  return DEVOPS_GLOSSARY;
}
