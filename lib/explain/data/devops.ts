import type { ExplainerData } from "../types.ts";

/** Explainers for the "devops" series. Names must start with "devops-" followed by the lesson number. */
export const DATA: ExplainerData = {
  /* ------------------------------------------------------------ lesson 0 */
  "devops-0-request-path": {
    kind: "flow",
    title: "The path of one request on AWS",
    nodes: [
      { id: "browser", label: "Browser", sub: "yourapp.com", col: 0, row: 0, tone: "client" },
      { id: "dns", label: "Route 53", sub: "name to IP address", col: 1.6, row: 0, tone: "server" },
      { id: "cdn", label: "CloudFront", sub: "files near users", col: 3.2, row: 0, tone: "store" },
      { id: "alb", label: "ALB", sub: "shares traffic", col: 3.2, row: 1, tone: "server" },
      { id: "ec2", label: "EC2 servers", sub: "Auto Scaling, Next.js", col: 1.6, row: 1, tone: "server" },
      { id: "rds", label: "RDS PostgreSQL", sub: "managed database", col: 0, row: 1, tone: "data" },
    ],
    edges: [
      { id: "e-dns", from: "browser", to: "dns", label: "yourapp.com?" },
      { id: "e-cdn", from: "dns", to: "cdn", label: "IP address" },
      { id: "e-alb", from: "cdn", to: "alb", label: "app requests" },
      { id: "e-ec2", from: "alb", to: "ec2", label: "one server" },
      { id: "e-rds", from: "ec2", to: "rds", label: "SQL queries" },
    ],
    steps: [
      {
        title: "Someone opens yourapp.com",
        note: "This is the full target setup of the course. On Vercel you never saw any of it. On AWS you will build every box yourself, one lesson at a time. First, follow one request from the start.",
        appear: ["browser"],
        focus: ["browser"],
      },
      {
        title: "Route 53 turns the name into an IP address",
        note: "DNS is the internet's phone book. Route 53 is the AWS DNS service, and it connects your domain name to your AWS setup.",
        appear: ["dns", "e-dns"],
        focus: ["dns", "e-dns"],
      },
      {
        title: "CloudFront serves files from a nearby copy",
        note: "A CDN keeps copies of your static files on servers around the world, so pages load fast. Anything it cannot answer goes on to your app.",
        appear: ["cdn", "e-cdn"],
        focus: ["cdn", "e-cdn"],
      },
      {
        title: "The load balancer shares the work",
        note: "The Application Load Balancer (ALB) receives the traffic that reaches your app and shares it between your app servers.",
        appear: ["alb", "e-alb"],
        focus: ["alb", "e-alb"],
      },
      {
        title: "EC2 servers run your Next.js app",
        note: "EC2 is a virtual computer that you rent. Auto Scaling starts more servers when many users come, and removes them when traffic drops.",
        appear: ["ec2", "e-ec2"],
        focus: ["ec2", "e-ec2"],
      },
      {
        title: "RDS keeps the data safe",
        note: "RDS is a managed PostgreSQL database. AWS does the backups, the patching and the switch to a spare copy if the main one fails.",
        appear: ["rds", "e-rds"],
        focus: ["rds", "e-rds"],
      },
      {
        title: "Every later lesson fills in one of these boxes",
        note: "The lessons that follow build the boxes one by one. Keep this picture in mind. The extra work, compared with Vercel, is the price of control over cost, jobs and your database.",
        set: {
          dns: "Lesson 13",
          cdn: "Lesson 11",
          alb: "Lesson 12",
          ec2: "Lessons 7 and 12",
          rds: "Lesson 8",
        },
        focus: ["dns", "cdn", "alb", "ec2", "rds"],
      },
    ],
  },

  /* ------------------------------------------------------------ lesson 1 */
  "devops-1-permission-bits": {
    kind: "array",
    title: "Reading file permissions: 644, 600 and 400",
    cells: ["r", "w", "x", "r", "-", "-", "r", "-", "-"],
    indexLabels: ["4", "2", "1", "4", "2", "1", "4", "2", "1"],
    steps: [
      {
        title: "Nine letters in three groups of three",
        note: "A file listing shows permissions as nine letters, here rw-r--r--. The first three belong to the owner, the next three to a group, the last three to everyone else. The numbers under the cells are what each letter is worth: read 4, write 2, execute 1.",
        pointers: [
          { at: 0, label: "owner" },
          { at: 3, label: "group" },
          { at: 6, label: "others" },
        ],
      },
      {
        title: "Owner: read + write = 4 + 2 = 6",
        note: "The owner has r and w, and a dash where x would be. Add the numbers of the letters that are on: 4 + 2 = 6. A dash is worth nothing.",
        pointers: [{ at: 0, label: "owner" }],
        mark: [0, 1],
      },
      {
        title: "Group and others: read only = 4",
        note: "The group has only r, so it is 4. Others also have only r, so it is 4. Write the three digits in the order owner, group, others and you get 644.",
        pointers: [
          { at: 3, label: "group" },
          { at: 6, label: "others" },
        ],
        mark: [3, 6],
        done: [0, 1],
      },
      {
        title: "644 is for normal files and public web files",
        note: "You can read and write, and everyone else can only read. That is right for a web page or a normal file. It is wrong for anything secret.",
        done: [0, 1, 3, 6],
      },
      {
        title: "600 for .env: nobody else can touch it",
        note: "Your .env file holds the database password. With 600 only the owner can read and write. If it were 644, any user or hacked process on the machine could read your password.",
        cells: ["r", "w", "-", "-", "-", "-", "-", "-", "-"],
        pointers: [{ at: 0, label: "owner" }],
        mark: [0, 1],
      },
      {
        title: "400 for an SSH key: you can only read it",
        note: "SSH refuses to use a private key that other users could read. It prints UNPROTECTED PRIVATE KEY FILE and stops. Setting the key to 400 fixes it, and nobody, even you, can change it by accident.",
        cells: ["r", "-", "-", "-", "-", "-", "-", "-", "-"],
        pointers: [{ at: 0, label: "owner" }],
        mark: [0],
      },
    ],
  },

  /* ------------------------------------------------------------ lesson 2 */
  "devops-2-timeout-vs-refused": {
    kind: "flow",
    title: "Timed out or refused? Two different problems",
    nodes: [
      { id: "laptop", label: "Your laptop", sub: "outside the building", col: 0, row: 0.5, tone: "client" },
      { id: "sg", label: "Security Group", sub: "the guard at the gate", col: 1.6, row: 0.5, tone: "warn" },
      { id: "nginx", label: "Nginx", sub: "listens on 443", col: 3.2, row: 0, tone: "server" },
      { id: "app", label: "Next.js app", sub: "127.0.0.1:3000", col: 3.2, row: 1, tone: "server" },
    ],
    edges: [
      { id: "e-knock", from: "laptop", to: "sg", label: "knock on 443" },
      { id: "e-allow", from: "sg", to: "nginx", label: "allowed" },
      { id: "e-proxy", from: "nginx", to: "app", label: "proxy_pass" },
      { id: "e-direct", from: "sg", to: "app", label: "port 3000", dashed: true },
    ],
    steps: [
      {
        title: "The browser knocks on door 443",
        note: "Outside traffic meets the Security Group first. It blocks all inbound traffic by default, so we added rules that let ports 80 and 443 through. Nothing else is on the list.",
        appear: ["laptop", "sg", "e-knock"],
        focus: ["laptop", "sg", "e-knock"],
        set: { sg: "allows 80 and 443" },
      },
      {
        title: "The guard allows it and Nginx answers",
        note: "Port 443 is on the list, so the request passes. Nginx is the receptionist: it is the only program that visitors from outside ever talk to.",
        appear: ["nginx", "e-allow"],
        focus: ["nginx", "e-allow"],
      },
      {
        title: "Nginx walks the visitor to the private room",
        note: "Nginx passes the request to your Next.js app on 127.0.0.1:3000. That address can be reached only from inside the server, so no outsider can reach the app directly.",
        appear: ["app", "e-proxy"],
        focus: ["app", "e-proxy"],
      },
      {
        title: "Knocking on door 3000 times out",
        note: "Now an outsider tries port 3000. The guard has no rule for it, so the packets are dropped silently. Nothing answers at all. nc says Connection timed out. This points at the Security Group.",
        appear: ["e-direct"],
        focus: ["e-direct", "sg"],
        set: { sg: "no rule for 3000", app: "never reached" },
      },
      {
        title: "Connection refused means nobody is home",
        note: "Say Nginx is stopped. Port 443 is allowed, so the packet reaches the server, but no program is listening on it. The server answers at once: Connection refused. The network is fine and the app is not running.",
        focus: ["e-knock", "e-allow", "nginx"],
        set: { sg: "allows 80 and 443", app: "127.0.0.1:3000", nginx: "stopped: nobody listens" },
      },
      {
        title: "Use the three checks in order",
        note: "First, is the process running (ps, ss)? Second, which address does it listen on? Third, can you reach the port from outside (nc -zv)? Timed out points at the firewall. Refused points at a missing listener.",
        focus: ["sg", "nginx", "app"],
        set: { sg: "timed out = blocked", nginx: "refused = no listener" },
      },
    ],
  },

  /* ------------------------------------------------------------ lesson 3 */
  "devops-3-wildcard-tenants": {
    kind: "flow",
    title: "One wildcard record serves every customer",
    nodes: [
      { id: "browser", label: "Browser", sub: "acme.yourapp.com", col: 0, row: 0, tone: "client" },
      { id: "dns", label: "Route 53", sub: "*.yourapp.com", col: 1.6, row: 0, tone: "server" },
      { id: "server", label: "EC2 server", sub: "52.66.12.9", col: 0, row: 1, tone: "server" },
      { id: "app", label: "Next.js app", sub: "reads the Host header", col: 1.6, row: 1, tone: "server" },
      { id: "data", label: "Tenant data", sub: "one customer's rows", col: 3.2, row: 1, tone: "data" },
    ],
    edges: [
      { id: "e-ask", from: "browser", to: "dns", label: "IP of acme?", curve: -0.9 },
      { id: "e-ans", from: "dns", to: "browser", label: "52.66.12.9", dashed: true, curve: -0.9 },
      { id: "e-req", from: "browser", to: "server", label: "GET, Host: acme" },
      { id: "e-app", from: "server", to: "app", label: "pass it on" },
      { id: "e-data", from: "app", to: "data", label: "load acme" },
    ],
    steps: [
      {
        title: "A customer opens their own subdomain",
        note: "In a multi-tenant product each customer gets a name such as acme.yourapp.com. The browser needs an IP address for it before it can send anything.",
        appear: ["browser"],
        focus: ["browser"],
      },
      {
        title: "The browser asks DNS",
        note: "The Route 53 hosted zone holds one wildcard record: A, name *.yourapp.com, value 52.66.12.9. The star matches any subdomain, so no record had to be made for acme.",
        appear: ["dns", "e-ask"],
        focus: ["dns", "e-ask"],
      },
      {
        title: "Every tenant gets the same answer",
        note: "acme, rathod-electricals and every future customer all resolve to the same server IP. The wildcard does not cover the bare yourapp.com, which needs its own record.",
        appear: ["e-ans"],
        focus: ["e-ans"],
      },
      {
        title: "The request carries the name in the Host header",
        note: "The browser connects to the IP and sends the request. The Host header holds the address the user typed, acme.yourapp.com. This is how the server learns which customer is calling.",
        appear: ["server", "e-req"],
        focus: ["server", "e-req"],
      },
      {
        title: "Your app picks the tenant from Host",
        note: "Your Next.js app reads req.headers.host and works out the tenant is acme. The decision is made in your code, not in DNS.",
        appear: ["app", "e-app"],
        focus: ["app", "e-app"],
        set: { app: "Host says tenant: acme" },
      },
      {
        title: "Only acme's data is loaded",
        note: "The app loads that tenant's rows and builds the page. For HTTPS you also need a certificate that covers *.yourapp.com.",
        appear: ["data", "e-data"],
        focus: ["data", "e-data"],
      },
      {
        title: "A new customer needs no DNS change",
        note: "When rathod-electricals signs up, nothing changes in DNS. The same wildcard answers, and the app finds the new tenant in the Host header. Slack and Shopify work in this way.",
        set: { browser: "a new customer", app: "Host says tenant: rathod", data: "rathod's rows" },
        focus: ["browser", "app", "data"],
      },
    ],
  },

  /* ------------------------------------------------------------ lesson 4 */
  "devops-4-chain-of-trust": {
    kind: "flow",
    title: "Why your browser trusts a certificate",
    nodes: [
      { id: "root", label: "Root CA", sub: "a trusted authority", col: 0, row: 0, tone: "store" },
      { id: "inter", label: "Intermediate CA", sub: "signed by the root", col: 1.6, row: 0, tone: "store" },
      { id: "cert", label: "yourapp.com", sub: "your certificate", col: 3.2, row: 0, tone: "data" },
      { id: "browser", label: "Browser", sub: "knows the root CAs", col: 0, row: 1, tone: "client" },
      { id: "server", label: "Your server", sub: "has fullchain.pem", col: 3.2, row: 1, tone: "server" },
    ],
    edges: [
      { id: "e-send", from: "server", to: "browser", label: "certificate + chain" },
      { id: "e-has", from: "server", to: "cert", label: "holds" },
      { id: "e-s1", from: "root", to: "inter", label: "signs" },
      { id: "e-s2", from: "inter", to: "cert", label: "signs" },
      { id: "e-trust", from: "browser", to: "root", label: "on my list", dashed: true },
    ],
    steps: [
      {
        title: "The server sends its certificate",
        note: "During the handshake the browser meets yourapp.com for the first time. The server sends its certificate and the intermediate certificates, which are the chain. They sit together in the file fullchain.pem.",
        appear: ["browser", "server", "e-send"],
        focus: ["server", "e-send"],
      },
      {
        title: "The certificate says who the server is",
        note: "The certificate names the domain, yourapp.com, and holds its valid dates. But anyone could write a certificate that says yourapp.com. The browser needs proof.",
        appear: ["cert", "e-has"],
        focus: ["cert"],
      },
      {
        title: "An intermediate CA signed it",
        note: "A certificate authority (CA) is a company that browsers trust to check who owns a domain. The intermediate CA signed your certificate with its key.",
        appear: ["inter", "e-s2"],
        focus: ["inter", "e-s2"],
      },
      {
        title: "A root CA signed the intermediate",
        note: "The chain continues up. A root CA signs the intermediate certificate. This is the chain: root, then intermediate, then yours. If any link is missing, you see the red warning page.",
        appear: ["root", "e-s1"],
        focus: ["root", "e-s1"],
      },
      {
        title: "The browser already knows the root",
        note: "Every browser and operating system ships with a list of more than 100 root CAs. It is like a passport: the border officer does not know you, but trusts the government that issued it. The root is on the list, so the whole chain is trusted.",
        appear: ["e-trust"],
        focus: ["browser", "e-trust", "root"],
      },
      {
        title: "Three checks decide if the page loads",
        note: "The browser asks: is it signed by a trusted CA? Is today inside the valid dates? Does the name on it match the site I typed? All three must pass.",
        focus: ["cert", "browser"],
        set: { cert: "CA ok, dates ok, name ok", browser: "padlock shown" },
      },
      {
        title: "One failed check shows a warning page",
        note: "If the certificate expired, or it covers yourapp.com but you visited www.yourapp.com, the browser stops. You see errors such as ERR_CERT_DATE_INVALID or ERR_CERT_COMMON_NAME_INVALID instead of your site.",
        focus: ["cert", "browser"],
        set: { cert: "expired or wrong name", browser: "red warning page" },
      },
    ],
  },

  /* ------------------------------------------------------------ lesson 5 */
  "devops-5-role-credentials": {
    kind: "seq",
    title: "A server wearing an IAM role, with no keys",
    actors: [
      { name: "Next.js app", sub: "on the EC2 server" },
      { name: "IAM role", sub: "myapp-ec2-role" },
      { name: "S3 bucket", sub: "myapp-pdfs" },
    ],
    steps: [
      {
        from: 0,
        to: 1,
        label: "who am I? credentials please",
        title: "The code asks for credentials, with no keys in it",
        note: "The upload code has no access key in it and none in a .env file. The AWS SDK finds the role that is attached to the server by itself.",
      },
      {
        from: 1,
        to: 0,
        label: "temporary credentials",
        title: "The role hands out temporary credentials",
        note: "A role is a temporary key card. It has no password of its own, and the credentials it gives out expire by themselves after a few hours.",
      },
      {
        from: 0,
        to: 2,
        label: "PutObject quotation-1024.pdf",
        title: "The app uploads a PDF using those credentials",
        note: "Every AWS action goes through IAM first. Here the request says: put this file in the bucket myapp-pdfs.",
      },
      {
        from: 2,
        to: 0,
        label: "OK, saved",
        title: "The policy allows it, so it works",
        note: "The role's policy allows s3:PutObject and s3:GetObject on arn:aws:s3:::myapp-pdfs/*. This request matches, so it is allowed.",
      },
      {
        from: 0,
        to: 2,
        label: "DeleteObject quotation-1024.pdf",
        title: "The app tries something the policy never allowed",
        note: "Delete is not on the list. Even a fully hacked app can only do what the role allows. This is least privilege: the minimum access needed, and nothing more.",
      },
      {
        from: 2,
        to: 0,
        label: "AccessDenied",
        title: "Everything is denied unless a policy says yes",
        note: "No policy allows s3:DeleteObject, so AWS says no. Everything is denied by default. A policy must clearly allow an action before it works.",
      },
      {
        from: 0,
        to: 0,
        self: true,
        label: "a thief copies the credentials",
        title: "Stolen role credentials stop working soon",
        note: "Suppose someone breaks into the server and copies the credentials. They expire in a few hours, so the thief has a short window. Keys left on disk would work from anywhere until you noticed.",
      },
    ],
  },

  /* ------------------------------------------------------------ lesson 6 */
  "devops-6-public-private-subnet": {
    kind: "flow",
    title: "What makes a subnet public or private",
    nodes: [
      { id: "internet", label: "Internet", sub: "everyone", col: 0, row: 0.5, tone: "client" },
      { id: "igw", label: "Internet Gateway", sub: "the front door", col: 1.6, row: 0, tone: "server" },
      { id: "pub", label: "Public subnet", sub: "ALB and app servers", col: 3.2, row: 0, tone: "server" },
      { id: "priv", label: "Private subnet", sub: "RDS database", col: 3.2, row: 1, tone: "data" },
    ],
    edges: [
      { id: "e-in", from: "internet", to: "igw", label: "visitors" },
      { id: "e-route", from: "igw", to: "pub", label: "default route", both: true },
      { id: "e-local", from: "pub", to: "priv", label: "local route" },
      { id: "e-block", from: "internet", to: "priv", label: "no route", dashed: true },
    ],
    steps: [
      {
        title: "Two floors in your private building",
        note: "A VPC is your own private network inside AWS. Inside it, a public subnet holds the reception, the load balancer and app servers. A private subnet holds the finance room, the database.",
        appear: ["pub", "priv"],
        focus: ["pub", "priv"],
      },
      {
        title: "The Internet Gateway is the front door",
        note: "The Internet Gateway (IGW) connects the VPC to the internet. But a door that no sign points to does nothing.",
        appear: ["internet", "igw", "e-in"],
        focus: ["igw", "e-in"],
      },
      {
        title: "One route-table row makes a subnet public",
        note: "A subnet is public only if its route table has the row 0.0.0.0/0 pointing to the IGW. There is no public checkbox on the subnet. A server also needs a public IP, or the internet cannot reach it.",
        appear: ["e-route"],
        focus: ["e-route", "pub"],
        set: { pub: "0.0.0.0/0 to igw" },
      },
      {
        title: "Every subnet can still talk inside the VPC",
        note: "The local row is added automatically and cannot be deleted. It is why an app server in the public subnet reaches the database in the private subnet with no extra setup.",
        appear: ["e-local"],
        focus: ["e-local"],
        set: { priv: "local route only" },
      },
      {
        title: "The internet has no path to the database",
        note: "The private route table has only the local row, so there is no route from the internet to the database. This is stronger than a firewall rule that you hope nobody edits.",
        appear: ["e-block"],
        focus: ["e-block", "priv"],
      },
      {
        title: "Security Groups are the second layer",
        note: "Inside the VPC, routes decide where traffic can go, and Security Groups decide who is allowed in. The database group db-sg accepts port 5432 only from web-sg. Both layers say no to outsiders.",
        focus: ["priv"],
        set: { priv: "db-sg: only web-sg on 5432" },
      },
      {
        title: "Delete the one row and the subnet is private",
        note: "Remove the route 0.0.0.0/0 to the IGW and the public subnet becomes private. That one row is the whole difference.",
        focus: ["pub", "e-route"],
        set: { pub: "no igw row = private" },
      },
    ],
  },

  /* ------------------------------------------------------------ lesson 7 */
  "devops-7-manual-deploy": {
    kind: "flow",
    title: "Deploying Next.js by hand on EC2",
    nodes: [
      { id: "laptop", label: "Your laptop", sub: "key file: 400", col: 0, row: 0, tone: "client" },
      { id: "ec2", label: "EC2 server", sub: "Ubuntu 24.04, t3.small", col: 1.6, row: 0, tone: "server" },
      { id: "github", label: "GitHub repo", sub: "read-only deploy key", col: 3.2, row: 0, tone: "store" },
      { id: "pm2", label: "PM2", sub: "process manager", col: 1.6, row: 1, tone: "queue" },
      { id: "app", label: "Next.js app", sub: "port 3000", col: 3.2, row: 1, tone: "server" },
    ],
    edges: [
      { id: "e-ssh", from: "laptop", to: "ec2", label: "ssh -i key.pem" },
      { id: "e-git", from: "ec2", to: "github", label: "git clone" },
      { id: "e-pm2", from: "ec2", to: "pm2", label: "pm2 start" },
      { id: "e-app", from: "pm2", to: "app", label: "keeps it alive" },
    ],
    steps: [
      {
        title: "Launch a rented Linux computer",
        note: "You pick an Ubuntu image, the t3.small size, the myapp VPC with a public subnet, the web-sg Security Group and the IAM role myapp-ec2-role. AWS shows the key file only once.",
        appear: ["ec2"],
        focus: ["ec2"],
      },
      {
        title: "Log in with SSH",
        note: "You connect with the .pem key file. SSH refuses a key that other users can read, so you set its permissions to 400 first (Lesson 1). The user name on Ubuntu is ubuntu.",
        appear: ["laptop", "e-ssh"],
        focus: ["laptop", "e-ssh"],
      },
      {
        title: "Prepare the bare server",
        note: "A new server has nothing on it but Linux. You update it, add a swap file as a safety net for next build, and install Node.js. Use the same Node major version as on your laptop.",
        focus: ["ec2"],
        set: { ec2: "updated, swap, Node 22" },
      },
      {
        title: "Clone the code with a read-only key",
        note: "A private repo needs credentials. Make a new key on the server and add it as a GitHub deploy key without write access. If the server is broken into, the attacker can read one repo and cannot push code.",
        appear: ["github", "e-git"],
        focus: ["github", "e-git"],
        set: { ec2: "code cloned" },
      },
      {
        title: "Create .env and build",
        note: "On Vercel your variables lived in a dashboard. Here they are in a .env file with permissions 600. Then install and build the app. NEXT_PUBLIC_ values are copied in at build time, so changing one means building again.",
        focus: ["ec2"],
        set: { ec2: ".env (600), built" },
      },
      {
        title: "PM2 keeps the app running",
        note: "pnpm start in your SSH session stops when you close the terminal. PM2 owns the process: it restarts the app after a crash, and with pm2 startup and pm2 save it brings the app back after a reboot.",
        appear: ["pm2", "e-pm2", "app", "e-app"],
        focus: ["pm2", "app", "e-app"],
      },
      {
        title: "Notice what is wrong with this way",
        note: "The build runs on the production server, so it competes with live traffic. A failed build can leave the site broken. There is no easy rollback, and only people with SSH access can deploy. Lessons 9 and 14 fix these.",
        focus: ["ec2"],
        set: { ec2: "builds on live server" },
      },
    ],
  },

  /* ------------------------------------------------------------ lesson 8 */
  "devops-8-connection-limit": {
    kind: "array",
    title: "Why more servers can break the database",
    cells: ["free", "free", "free", "free", "free", "free", "free", "free", "free", "free"],
    steps: [
      {
        title: "A small database has about 100 connection slots",
        note: "Each PostgreSQL connection is a separate process that uses memory, so the database has a hard limit, max_connections. A db.t4g.micro allows roughly 100. Here each cell stands for 10 connections.",
        pointers: [{ at: 9, label: "limit" }],
      },
      {
        title: "One app server with a pool of 20",
        note: "A connection pool is a small set of connections that the app keeps open and reuses. Server S1 holds 20 of them, so it uses 2 cells.",
        cells: ["S1", "S1", "free", "free", "free", "free", "free", "free", "free", "free"],
        mark: [0, 1],
      },
      {
        title: "Four servers use 80 connections: fine",
        note: "Four servers with a pool of 20 each is 80 connections. The database is at 80 percent and everything works.",
        cells: ["S1", "S1", "S2", "S2", "S3", "S3", "S4", "S4", "free", "free"],
        done: [0, 1, 2, 3, 4, 5, 6, 7],
      },
      {
        title: "Auto Scaling adds four more servers",
        note: "Traffic grows and Auto Scaling starts S5 to S8. Now 8 servers times 20 want 160 connections. S5 takes the last free slots.",
        cells: ["S1", "S1", "S2", "S2", "S3", "S3", "S4", "S4", "S5", "S5"],
        mark: [8, 9],
      },
      {
        title: "The database is full and refuses the rest",
        note: "S6, S7 and S8 cannot connect. The database says: FATAL: remaining connection slots are reserved. The site shows errors exactly when it is busiest, and database CPU may still be low.",
        cells: ["S1", "S1", "S2", "S2", "S3", "S3", "S4", "S4", "S5", "S5"],
        mark: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        pointers: [{ at: 9, label: "full" }],
      },
      {
        title: "Do the arithmetic before you scale",
        note: "Keep servers times pool size under about 80 percent of max_connections. With a limit of 100, eight servers with a pool of 10 each use 80. Set a sensible pool size, or use a bigger instance, or put RDS Proxy or PgBouncer in front.",
        cells: ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "free", "free"],
        done: [0, 1, 2, 3, 4, 5, 6, 7],
      },
    ],
  },

  /* ------------------------------------------------------------ lesson 9 */
  "devops-9-layer-cache": {
    kind: "array",
    title: "Docker layers and the build cache",
    cells: ["FROM", "COPY pkg", "install", "COPY src", "build"],
    steps: [
      {
        title: "Each instruction makes one layer",
        note: "An image is a stack of layers. The instructions that change files, such as RUN and COPY, each make a layer, and Docker saves every layer in a cache. This is the good order: lockfile first, then install, then your code. The first build runs every step, so it is slow.",
        mark: [0, 1, 2, 3, 4],
      },
      {
        title: "Change one line of code: most steps are cached",
        note: "Docker reuses a layer if its instruction and everything before it did not change. Your code edit changes only COPY src, so the install is not run again. A build that uses the cache takes seconds.",
        dim: [0, 1, 2],
        mark: [3, 4],
        pointers: [{ at: 3, label: "changed" }],
      },
      {
        title: "Change a dependency: install runs again",
        note: "Now the lockfile changes, so the COPY pkg layer is new. Everything after it is built again, including the slow install. That is fine, because dependencies change rarely.",
        dim: [0],
        mark: [1, 2, 3, 4],
        pointers: [{ at: 1, label: "changed" }],
      },
      {
        title: "The bad order: copy everything first",
        note: "If you write COPY . . before the install, any code edit changes that layer. Then npm install runs again on every build, even though no dependency changed.",
        cells: ["FROM", "COPY all", "install", "build", "-"],
        dim: [0],
        mark: [1, 2, 3],
        pointers: [{ at: 1, label: "changed" }],
      },
      {
        title: "Put what changes least at the top",
        note: "Dependencies change rarely and code changes often. So copy the lockfile and install first, and copy the source code last. Only the bottom layers rebuild on a normal code change.",
        cells: ["FROM", "COPY pkg", "install", "COPY src", "build"],
        done: [0, 1, 2],
        mark: [3, 4],
      },
    ],
  },

  /* ----------------------------------------------------------- lesson 10 */
  "devops-10-nginx-proxy": {
    kind: "seq",
    title: "One request through the Nginx receptionist",
    actors: [
      { name: "Browser", sub: "a visitor" },
      { name: "Nginx", sub: "public ports 80 and 443" },
      { name: "Next.js app", sub: "127.0.0.1:3000" },
    ],
    steps: [
      {
        from: 0,
        to: 1,
        label: "GET /dashboard (HTTPS, 443)",
        title: "The visitor reaches the only public door",
        note: "Nginx listens on 80 and 443. Your app stays private on port 3000 and never meets the internet. Nginx also ends HTTPS, with a certificate from Certbot.",
      },
      {
        from: 1,
        to: 1,
        self: true,
        label: "size cap, rate limit",
        title: "Nginx does the cheap jobs first",
        note: "Before the app sees anything, Nginx can reject uploads that are too big (413) and visitors that send too many requests (429). Slow or harmful clients never reach Node.",
      },
      {
        from: 1,
        to: 2,
        label: "proxy_pass + Host, X-Forwarded-*",
        title: "Nginx passes it on and adds the facts",
        note: "Now the app talks to Nginx, not the user. Without help it thinks every request comes from 127.0.0.1 over plain HTTP. So Nginx adds Host, X-Forwarded-For and X-Forwarded-Proto.",
      },
      {
        from: 2,
        to: 1,
        label: "200 OK + HTML",
        title: "The app answers Nginx",
        note: "The app builds the page and returns it to Nginx. Next.js puts a content hash in the name of its static files, so those can be cached for a year.",
      },
      {
        from: 1,
        to: 0,
        label: "200 OK (gzip)",
        title: "Nginx compresses and sends it back",
        note: "Nginx compresses text answers with gzip, which saves bandwidth and frees Node's CPU for real work. The visitor never learns that a private port exists.",
      },
      {
        from: 1,
        to: 2,
        label: "proxy_pass (app is stopped)",
        title: "Now say the app has crashed",
        note: "Port 3000 has no program listening. Nginx tries to pass the request on, and the connection is refused.",
      },
      {
        from: 1,
        to: 0,
        label: "502 Bad Gateway",
        title: "The visitor sees 502",
        note: "502 means the app is not there. 504 would mean it is there but too slow. If the browser shows Nginx's own error page, Nginx is healthy and the problem is behind it. Read error.log first.",
      },
    ],
  },

  /* ----------------------------------------------------------- lesson 11 */
  "devops-11-presigned-upload": {
    kind: "seq",
    title: "Upload a file straight to S3 with a presigned URL",
    actors: [
      { name: "Browser", sub: "has the file" },
      { name: "Next.js API", sub: "/api/upload-url" },
      { name: "S3 bucket", sub: "private" },
    ],
    steps: [
      {
        from: 0,
        to: 1,
        label: "I want to upload photo.jpg",
        title: "The browser asks for permission to upload",
        note: "It does not send the 40 MB file to your server. That would keep the server busy and hit body-size limits. It sends only the file type, image/jpeg.",
      },
      {
        from: 1,
        to: 1,
        self: true,
        label: "check login, make the key",
        title: "The API checks the user and picks the key",
        note: "The server checks that the user is logged in and that the type is allowed. It makes the key itself, tenants/acme/uploads/ plus a random UUID, so the user cannot choose a path.",
      },
      {
        from: 1,
        to: 0,
        label: "presigned PUT URL (5 min)",
        title: "The API signs a permission slip",
        note: "A presigned URL has a signature built in. It allows one action, a PUT for this exact key and content type, for a few minutes. Your server only signs. It never touches the file.",
      },
      {
        from: 0,
        to: 2,
        label: "preflight: may I PUT?",
        title: "The browser first asks S3 if this is allowed",
        note: "The browser calls another origin, S3, so it sends a small check request. S3 answers using the CORS configuration on the bucket, which lists the origins you own. Without it you see blocked by CORS policy.",
      },
      {
        from: 0,
        to: 2,
        label: "PUT file to the signed URL",
        title: "The file goes straight to S3",
        note: "The upload skips your server completely. S3 works out the signature again. If the key, method or Content-Type differs from what was signed, it refuses.",
      },
      {
        from: 2,
        to: 0,
        label: "200 OK",
        title: "S3 stores the file and confirms",
        note: "The bucket stays private all the time. Nobody opened it to the public. The signed link was the only way in, and it stops working after 5 minutes.",
      },
      {
        from: 0,
        to: 1,
        label: "done, here is the key",
        title: "The key is saved in the database",
        note: "Files go in S3, records go in the database, and the database keeps only the key, not the file. Your servers stay stateless.",
      },
    ],
  },

  /* ----------------------------------------------------------- lesson 12 */
  "devops-12-alb-asg": {
    kind: "flow",
    title: "A load balancer and Auto Scaling at work",
    nodes: [
      { id: "users", label: "Users", sub: "one stable address", col: 0, row: 1, tone: "client" },
      { id: "alb", label: "ALB", sub: "myapp-alb", col: 1.5, row: 1, tone: "server" },
      { id: "s1", label: "Server 1", sub: "AZ a", col: 3, row: 0, tone: "server" },
      { id: "s2", label: "Server 2", sub: "AZ b", col: 3, row: 1, tone: "server" },
      { id: "s3", label: "Server 3", sub: "new", col: 3, row: 2, tone: "server" },
      { id: "asg", label: "Auto Scaling", sub: "min 2, max 6", col: 4.5, row: 2, tone: "queue" },
    ],
    edges: [
      { id: "e-users", from: "users", to: "alb", label: "requests" },
      { id: "e-s1", from: "alb", to: "s1" },
      { id: "e-s2", from: "alb", to: "s2" },
      { id: "e-s3", from: "alb", to: "s3" },
      { id: "e-launch", from: "asg", to: "s3", label: "launches", dashed: true },
    ],
    steps: [
      {
        title: "The ALB gives users one stable address",
        note: "An Application Load Balancer is the host at the restaurant door. Users only ever see one address, and the ALB shares their requests across many identical servers.",
        appear: ["users", "alb", "e-users"],
        focus: ["alb", "e-users"],
      },
      {
        title: "Two identical servers in two Availability Zones",
        note: "Any request may go to any server, so the servers must be stateless. Data lives in RDS and files live in S3. Two zones mean the loss of one data centre does not stop the site.",
        appear: ["s1", "s2", "e-s1", "e-s2"],
        focus: ["s1", "s2", "e-s1", "e-s2"],
      },
      {
        title: "Health checks decide who gets traffic",
        note: "The ALB asks each server for GET /api/health every few seconds. Only servers that answer 200 receive traffic. The ALB never seats anyone at a table with a broken leg.",
        focus: ["alb", "s1", "s2"],
        set: { s1: "healthy: 200", s2: "healthy: 200" },
      },
      {
        title: "Traffic rises and the CPU goes up",
        note: "A t3.small has 2 vCPUs, and extra requests start to wait in line. The scaling policy is target tracking: keep the average CPU near 50 percent.",
        focus: ["users", "s1", "s2"],
        set: { users: "traffic rising", s1: "CPU 80%", s2: "CPU 80%" },
      },
      {
        title: "Auto Scaling launches a new server",
        note: "The group starts a new server from the launch template. The user-data script makes it ready with no human steps. This takes a few minutes, so scaling reacts a little after the load.",
        appear: ["asg", "s3", "e-launch"],
        focus: ["asg", "e-launch", "s3"],
        set: { s3: "booting" },
      },
      {
        title: "The new server joins and the load is shared",
        note: "After it passes two health checks, the ALB starts sending traffic to it. The average CPU falls back towards the 50 percent target.",
        appear: ["e-s3"],
        focus: ["s3", "e-s3"],
        set: { s3: "healthy: 200", s1: "CPU 55%", s2: "CPU 55%" },
      },
      {
        title: "A failed server is replaced",
        note: "With ELB health checks on, the group replaces a server that the load balancer reports as unhealthy. These servers are cattle, not pets. When one is sick, you replace it instead of repairing it.",
        focus: ["s2", "asg"],
        set: { s2: "unhealthy: replaced" },
      },
    ],
  },

  /* ----------------------------------------------------------- lesson 13 */
  "devops-13-weighted-cutover": {
    kind: "array",
    title: "Moving a live domain with weighted records",
    cells: ["old", "old", "old", "old", "old", "old", "old", "old", "old", "old"],
    steps: [
      {
        title: "Before the move: copy records and lower the TTL",
        note: "Two days before, recreate every record in the Route 53 zone and lower the TTL of the changing records to 60 seconds. Each cell here stands for one tenth of the DNS answers, and all of them point to the old host for now.",
        pointers: [{ at: 0, label: "all old" }],
      },
      {
        title: "Weight 10 on the new stack, 90 on the old",
        note: "Make two records with the same name, each with its own record ID and weight. The new one is an alias to the ALB. Only about one answer in ten goes to AWS, so a mistake hurts few users.",
        cells: ["new", "old", "old", "old", "old", "old", "old", "old", "old", "old"],
        mark: [0],
        pointers: [{ at: 0, label: "10 / 90" }],
      },
      {
        title: "Watch the error rate for an hour",
        note: "Check the 5xx errors and delay on the ALB. If anything looks wrong, set the weight to 0. The rollback takes as long as your TTL. Weights apply to DNS answers, not to each request, so the split is not exact.",
        cells: ["new", "old", "old", "old", "old", "old", "old", "old", "old", "old"],
        done: [0],
      },
      {
        title: "Weight 50 / 50",
        note: "The new stack looks healthy, so raise its weight. Resolvers that saved an old answer keep sending users to the old side until the TTL ends. The percentages even out across many users.",
        cells: ["new", "new", "new", "new", "new", "old", "old", "old", "old", "old"],
        mark: [0, 1, 2, 3, 4],
        pointers: [{ at: 0, label: "50 / 50" }],
      },
      {
        title: "Weight 100 on the new stack",
        note: "Now every answer points to the ALB. Keep the old host running for at least the old TTL plus one day, because some resolvers still hold old answers.",
        cells: ["new", "new", "new", "new", "new", "new", "new", "new", "new", "new"],
        done: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
      {
        title: "Remove the old record and raise the TTL",
        note: "When all is stable, delete the old record and raise the TTL again to 300 to 3600 seconds. Use a high TTL most of the time and a low TTL only around changes. Then turn off the old setup.",
        cells: ["new", "new", "new", "new", "new", "new", "new", "new", "new", "new"],
        done: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        pointers: [{ at: 0, label: "TTL up" }],
      },
    ],
  },

  /* ----------------------------------------------------------- lesson 14 */
  "devops-14-github-oidc": {
    kind: "seq",
    title: "GitHub gets into AWS with no stored keys",
    actors: [
      { name: "GitHub job", sub: "deploy workflow" },
      { name: "GitHub OIDC", sub: "issues tokens" },
      { name: "AWS IAM", sub: "trusts GitHub" },
      { name: "ECR", sub: "image registry" },
    ],
    steps: [
      {
        from: 0,
        to: 1,
        label: "give me an identity token",
        title: "The job asks GitHub for a token",
        note: "The workflow declares permissions: id-token: write. Without that line GitHub issues no token, and taking on the role fails. No access key is stored in GitHub Secrets.",
      },
      {
        from: 1,
        to: 0,
        label: "signed token, short-lived",
        title: "GitHub signs a short-lived identity token",
        note: "OpenID Connect (OIDC) is a standard way for one service to prove an identity to another. The token says: I am the workflow run for repo X, on branch main, or on environment production.",
      },
      {
        from: 0,
        to: 2,
        label: "AssumeRoleWithWebIdentity",
        title: "The job shows the token to AWS",
        note: "AWS was told once to trust GitHub as an identity provider. The job asks to take on the single role github-deploy by presenting the token.",
      },
      {
        from: 2,
        to: 2,
        self: true,
        label: "check the trust policy",
        title: "AWS checks the sub condition in the trust policy",
        note: "The trust policy lists exactly which runs may become this role. It trusts two subjects: repo YOUR-ORG/myapp on ref main, and the environment production. The build job and the deploy job have different subjects, so both must be listed.",
      },
      {
        from: 2,
        to: 0,
        label: "temporary credentials (~1 hour)",
        title: "The job gets credentials that expire",
        note: "The credentials last about an hour. There is no secret to store, change or leak. This is the same idea as an EC2 role from Lesson 5, now for GitHub.",
      },
      {
        from: 0,
        to: 3,
        label: "push myapp:<commit sha>",
        title: "The job pushes the image",
        note: "The role allows only the deploy work: pushing to the myapp repository, uploading static files, updating the image tag and starting an instance refresh. It has no IAM rights and cannot read the database.",
      },
      {
        from: 0,
        to: 2,
        label: "same request, other repo",
        title: "What if a different repo tries?",
        note: "Say a job from some other repository, or from code that nobody reviewed, presents its own token and asks for the same role.",
      },
      {
        from: 2,
        to: 0,
        label: "denied: sub does not match",
        title: "The trust policy refuses it",
        note: "Its sub does not match the allowed subjects, so AWS says Not authorized to perform sts:AssumeRoleWithWebIdentity. Without the sub condition, any repository on GitHub could use your role.",
      },
    ],
  },

  /* ----------------------------------------------------------- lesson 15 */
  "devops-15-terraform-plan-apply": {
    kind: "flow",
    title: "The Terraform loop: plan, read, apply",
    nodes: [
      { id: "code", label: ".tf files", sub: "what you want to exist", col: 0, row: 0, tone: "client" },
      { id: "state", label: "State file", sub: "what Terraform built", col: 0, row: 1, tone: "store" },
      { id: "aws", label: "Real AWS", sub: "what exists right now", col: 0, row: 2, tone: "server" },
      { id: "plan", label: "terraform plan", sub: "preview only", col: 1.6, row: 1, tone: "queue" },
      { id: "you", label: "You read it", sub: "before typing yes", col: 3.2, row: 1, tone: "warn" },
      { id: "apply", label: "terraform apply", sub: "makes the changes", col: 3.2, row: 2, tone: "data" },
    ],
    edges: [
      { id: "e-code", from: "code", to: "plan" },
      { id: "e-state", from: "state", to: "plan" },
      { id: "e-aws", from: "aws", to: "plan" },
      { id: "e-diff", from: "plan", to: "you", label: "the diff" },
      { id: "e-yes", from: "you", to: "apply", label: "yes" },
      { id: "e-do", from: "apply", to: "aws", label: "creates, updates" },
    ],
    steps: [
      {
        title: "You declare the result you want",
        note: "The .tf files describe what the cloud should be, not the steps to build it. This is the architect's blueprint. For example, there is a bucket named assets. Terraform works out the order and what has changed.",
        appear: ["code"],
        focus: ["code"],
      },
      {
        title: "State remembers what Terraform built",
        note: "The state file links each block in your code to a real resource ID in AWS. It is kept in an S3 bucket with versioning, encryption and locking, so a lost laptop or two applies at once cannot ruin it.",
        appear: ["state", "e-state"],
        focus: ["state"],
      },
      {
        title: "Reality is what AWS has right now",
        note: "People also change things in the console. If someone opened port 22 to the world and forgot, the real cloud no longer matches your code. That gap is called drift.",
        appear: ["aws", "e-aws"],
        focus: ["aws"],
      },
      {
        title: "terraform plan compares all three",
        note: "Plan compares your code, the state and the real AWS, and prints what would change. It changes nothing real, so it is safe to run as often as you like.",
        appear: ["plan", "e-code"],
        focus: ["plan", "e-code", "e-state", "e-aws"],
      },
      {
        title: "Read the plan before you type yes",
        note: "A plus means create. A tilde means change in place. A minus means destroy. Minus and plus together, with forces replacement, means destroy and create again. For a database or a load balancer that can mean lost data or downtime.",
        appear: ["you", "e-diff"],
        focus: ["you", "e-diff"],
        set: { plan: "2 add, 1 change, 2 destroy" },
      },
      {
        title: "Apply the plan you reviewed",
        note: "Saving the plan with -out=tfplan and applying that file means that what you read is exactly what runs. Apply asks you to confirm. Without that habit, people lose infrastructure by mistake.",
        appear: ["apply", "e-yes"],
        focus: ["apply", "e-yes"],
      },
      {
        title: "AWS now matches the code",
        note: "Apply makes the changes and records them in the state. Run plan once more. It should say No changes, which means your setup is healthy. Running apply again changes nothing, because Terraform is idempotent.",
        appear: ["e-do"],
        focus: ["aws", "state", "e-do"],
        set: { aws: "matches the code", state: "updated", plan: "No changes" },
      },
    ],
  },

  /* ----------------------------------------------------------- lesson 16 */
  "devops-16-cache-aside": {
    kind: "trace",
    title: "Cache-aside: a miss, a hit and an invalidation",
    lang: "ts",
    varsTitle: "Values",
    code: [
      "async function cached(key, ttl, load) {",
      "  const hit = await redis.get(key);",
      "  if (hit !== null) return JSON.parse(hit);",
      "  const value = await load();       // slow database query",
      '  await redis.set(key, JSON.stringify(value), "EX", ttl);',
      "  return value;",
      "}",
      "// first call",
      'await cached("app:v1:tenant:acme:dashboard", 60, buildDashboard);',
      "// the same call, 5 seconds later",
      'await cached("app:v1:tenant:acme:dashboard", 60, buildDashboard);',
      "// acme changes their settings",
      'await redis.del("app:v1:tenant:acme:dashboard");',
    ],
    steps: [
      {
        line: 9,
        title: "First call: ask for acme's dashboard",
        note: "The key has a clear shape, app:v1:tenant:acme:dashboard. The tenant ID is in the key, so one customer can never get another customer's data. The TTL of 60 seconds is the safety net.",
        vars: [
          ["key", "app:v1:tenant:acme:dashboard"],
          ["ttl", "60"],
        ],
      },
      {
        line: 2,
        title: "Check Redis first",
        note: "Cache-aside means your code looks in the cache before it asks the database. The key does not exist yet, so Redis answers null. That is a cache miss.",
        vars: [
          ["key", "app:v1:tenant:acme:dashboard"],
          ["ttl", "60"],
          ["hit", "null"],
        ],
      },
      {
        line: 4,
        title: "A miss means asking the database",
        note: "Now the slow work runs: the dashboard needs four heavy queries. This is the work that the cache is meant to save the database from.",
        vars: [
          ["key", "app:v1:tenant:acme:dashboard"],
          ["ttl", "60"],
          ["hit", "null"],
          ["value", "{ dashboard data }"],
        ],
        out: "database: 4 heavy queries (slow)",
      },
      {
        line: 5,
        title: "Save the answer in Redis with an expiry",
        note: "The result is stored with EX 60, so Redis deletes it by itself after 60 seconds. Even if you forget to remove it somewhere, old data lives only that long.",
        vars: [
          ["key", "app:v1:tenant:acme:dashboard"],
          ["hit", "null"],
          ["value", "{ dashboard data }"],
          ["in Redis", "saved, expires in 60 s"],
        ],
      },
      {
        line: 11,
        title: "The same request arrives 5 seconds later",
        note: "Another user of acme opens the dashboard. The function runs again from the top.",
        vars: [
          ["key", "app:v1:tenant:acme:dashboard"],
          ["in Redis", "saved, 55 s left"],
        ],
      },
      {
        line: [2, 3],
        title: "A hit: the answer comes straight from Redis",
        note: "Redis finds the key, so the function returns at line 3. The database is not asked at all. Redis answers in well under a millisecond, and the database stays free for work that really needs it.",
        vars: [
          ["key", "app:v1:tenant:acme:dashboard"],
          ["hit", "{ dashboard data }"],
          ["in Redis", "saved, 55 s left"],
        ],
        out: "served from Redis (no database query)",
      },
      {
        line: 13,
        title: "When the data changes, delete the old copy",
        note: "Invalidation means removing a cached copy when the real data changes. Delete the key in the same code that changes the data. The next request misses and builds a fresh copy. The TTL cleans up anything you miss.",
        vars: [
          ["key", "app:v1:tenant:acme:dashboard"],
          ["in Redis", "deleted"],
        ],
      },
    ],
  },

  /* ----------------------------------------------------------- lesson 17 */
  "devops-17-alarm-window": {
    kind: "array",
    title: "An alarm that needs 2 bad minutes out of 3",
    cells: [0, 0, 7, 0, 6, 8, 0, 0],
    indexLabels: ["14:00", "14:01", "14:02", "14:03", "14:04", "14:05", "14:06", "14:07"],
    steps: [
      {
        title: "5xx errors counted every minute",
        note: "The metric HTTPCode_Target_5XX_Count is added up in one-minute buckets (the Sum statistic). The alarm rule is: the sum is 5 or more in 2 of the last 3 minutes. Each cell is one minute.",
      },
      {
        title: "One bad minute is not an alarm",
        note: "At 14:02 there are 7 errors, over the limit. But looking at the last 3 minutes, only 1 of 3 is bad. A short spike is ignored, so nobody is woken for nothing.",
        mark: [2],
        pointers: [
          { at: 0, label: "from" },
          { at: 2, label: "now" },
        ],
      },
      {
        title: "The next minute is quiet again",
        note: "At 14:03 the window moves on. Still only 1 of 3 minutes is over the limit, so the alarm state stays OK.",
        mark: [2],
        pointers: [
          { at: 1, label: "from" },
          { at: 3, label: "now" },
        ],
      },
      {
        title: "A second bad minute: ALARM",
        note: "At 14:04 there are 6 more errors. Two of the last three minutes are over the limit, so the alarm fires and sends a message to the SNS topic. It reacts within about two minutes.",
        mark: [2, 4],
        done: [],
        pointers: [
          { at: 2, label: "from" },
          { at: 4, label: "now" },
        ],
      },
      {
        title: "The problem continues, the alarm stays on",
        note: "At 14:05 the count is 8. The window 14:03 to 14:05 still has two bad minutes, so the state stays ALARM. A real problem keeps the alarm on.",
        mark: [4, 5],
        pointers: [
          { at: 3, label: "from" },
          { at: 5, label: "now" },
        ],
      },
      {
        title: "It recovers and tells you so",
        note: "At 14:07 only one bad minute is left in the window, so the state returns to OK. Switch on notify on OK, so nobody has to wonder whether it is over.",
        done: [5],
        dim: [2, 4],
        pointers: [
          { at: 5, label: "from" },
          { at: 7, label: "now" },
        ],
      },
    ],
  },

  /* ----------------------------------------------------------- lesson 18 */
  "devops-18-defence-in-depth": {
    kind: "flow",
    title: "Defence in depth: assume one layer will fail",
    nodes: [
      { id: "attacker", label: "Attacker", sub: "scans the internet", col: 0, row: 0, tone: "warn" },
      { id: "waf", label: "WAF + ALB", sub: "the only public door", col: 1.6, row: 0, tone: "server" },
      { id: "web", label: "App servers", sub: "from the ALB only", col: 3.2, row: 0, tone: "server" },
      { id: "db", label: "Database", sub: "private subnet", col: 3.2, row: 1, tone: "data" },
      { id: "backup", label: "Backup copy", sub: "another region", col: 1.6, row: 1, tone: "store" },
    ],
    edges: [
      { id: "e-scan", from: "attacker", to: "waf", label: "probes" },
      { id: "e-pass", from: "waf", to: "web", label: "80 and 443" },
      { id: "e-db", from: "web", to: "db", label: "port 5432" },
      { id: "e-copy", from: "db", to: "backup", label: "daily backups" },
    ],
    steps: [
      {
        title: "Many layers between the attacker and the data",
        note: "A castle is safe because of many layers, not one thick wall. Assume that one credential or one server will be compromised one day. The goal is to keep the blast radius small and recovery easy.",
        appear: ["attacker", "waf", "web", "db", "e-scan", "e-pass", "e-db"],
        focus: ["attacker", "waf", "web", "db"],
      },
      {
        title: "Layer 1: almost no open ports",
        note: "Bots look for SSH on 22, databases on 5432 and Redis on 6379. The only Security Group open to 0.0.0.0/0 is alb-sg, and only on ports 80 and 443. Everything else is closed.",
        focus: ["attacker", "waf", "e-scan"],
        set: { waf: "only 80 and 443 open" },
      },
      {
        title: "Layer 2: the WAF blocks common web attacks",
        note: "AWS WAF sits on the ALB. It blocks things such as SQL injection, bad bots and too many requests from one IP. Start with the AWS-managed core rule set.",
        focus: ["waf", "e-scan"],
        set: { waf: "blocks SQL injection" },
      },
      {
        title: "Layer 3: servers trust only the ALB",
        note: "The app servers accept traffic only from the ALB. There is no port 22 and no key pair, because you use Session Manager. IMDSv2 is required, and the instance role has least privilege.",
        focus: ["web", "e-pass"],
        set: { web: "no SSH, IMDSv2, least privilege" },
      },
      {
        title: "Layer 4: the data sits in a private place",
        note: "The database has no public IP and a private subnet. Its Security Group accepts port 5432 only from web-sg. It is encrypted, and its password lives in Secrets Manager with rotation.",
        focus: ["db", "e-db"],
        set: { db: "private, encrypted" },
      },
      {
        title: "If it happens anyway, you can recover",
        note: "Hardening lowers the chance of a disaster. Backups lower its cost. Follow the 3-2-1 rule: 3 copies, 2 kinds of storage, 1 copy elsewhere. A hacked production login must not be able to delete that last copy.",
        appear: ["backup", "e-copy"],
        focus: ["backup", "e-copy"],
      },
      {
        title: "A backup you never restored is only a hope",
        note: "Practice on a calm day. Restore to a new instance such as myapp-db-drill, check that the data is there, and note how long it took. That time is your real recovery time. Then delete the drill instance.",
        focus: ["backup", "db"],
        set: { backup: "restore drill each quarter" },
      },
    ],
  },

  /* ----------------------------------------------------------- lesson 19 */
  "devops-19-cost-per-tenant": {
    kind: "trace",
    title: "What does one customer cost? Unit economics",
    lang: "js",
    varsTitle: "Dollars",
    code: [
      "monthly = 130              // Production column, per month",
      "tenants = 40               // active customers",
      "fixed = monthly / tenants  // shared by every customer",
      "storage = 2 * 0.025        // 2 GB in S3",
      "cdn = 5 * 0.11             // 5 GB out via CloudFront",
      "extras = 0.40              // email, SMS, other APIs",
      "cost = fixed + storage + cdn + extras",
      "price = 29                 // the plan a tenant pays",
      "margin = (price - cost) / price",
      "// now the product grows to 400 tenants",
      "tenants = 400",
      "fixed = monthly / tenants",
      "cost = fixed + storage + cdn + extras",
    ],
    steps: [
      {
        line: [1, 2],
        title: "Start from the bill and the customer count",
        note: "For a multi-tenant SaaS the total bill is not the most useful number. Cost per tenant is, because you can compare it with what each tenant pays. Here the Production design costs about 130 dollars a month and has 40 active tenants.",
        vars: [
          ["monthly", "130"],
          ["tenants", "40"],
        ],
      },
      {
        line: 3,
        title: "The fixed part is shared by everyone",
        note: "The load balancer, servers, database and cache cost the same whether they serve 10 users or 500. Split between 40 tenants, each pays a share of 3.25 dollars.",
        vars: [
          ["monthly", "130"],
          ["tenants", "40"],
          ["fixed", "3.25"],
        ],
      },
      {
        line: 4,
        title: "Storage grows with each tenant",
        note: "Say an average tenant stores 2 GB in S3. At 0.025 dollars per GB a month, that is only 5 cents.",
        vars: [
          ["monthly", "130"],
          ["tenants", "40"],
          ["fixed", "3.25"],
          ["storage", "0.05"],
        ],
      },
      {
        line: 5,
        title: "Data going out is billed too",
        note: "Say an average tenant downloads 5 GB through CloudFront. At about 0.11 dollars per GB (after the free amount) that is 55 cents. Data transfer is the most overlooked cost.",
        vars: [
          ["fixed", "3.25"],
          ["storage", "0.05"],
          ["cdn", "0.55"],
        ],
      },
      {
        line: 6,
        title: "Add the other per-tenant costs",
        note: "Email, SMS and third-party APIs add 40 cents for each tenant. Support and your own time are not in this number yet.",
        vars: [
          ["fixed", "3.25"],
          ["storage", "0.05"],
          ["cdn", "0.55"],
          ["extras", "0.40"],
        ],
      },
      {
        line: 7,
        title: "About 4.25 dollars per tenant per month",
        note: "Add the four parts together. This is what one customer costs you in infrastructure each month.",
        vars: [
          ["fixed", "3.25"],
          ["storage", "0.05"],
          ["cdn", "0.55"],
          ["extras", "0.40"],
          ["cost", "4.25"],
        ],
      },
      {
        line: [8, 9],
        title: "A 29 dollar plan leaves about 85 percent margin",
        note: "Gross margin is the share of the price left after the direct costs. The exact numbers matter less than the habit: you can now see how much each customer costs against what they pay.",
        vars: [
          ["cost", "4.25"],
          ["price", "29"],
          ["margin", "0.853 (about 85%)"],
        ],
      },
      {
        line: [11, 12, 13],
        title: "At 400 tenants the fixed share shrinks",
        note: "The fixed part barely moves, so each tenant carries a smaller share, only 0.325 dollars. Storage and transfer still grow with every tenant. A customer who stores 500 GB on a 29 dollar plan can lose you money, so measure per tenant.",
        vars: [
          ["tenants", "400"],
          ["fixed", "0.325"],
          ["storage + cdn + extras", "1.00"],
          ["cost", "1.325"],
        ],
      },
    ],
  },
};
