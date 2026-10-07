import type { Metadata } from "next";
import Callout from "@/components/Callout";
import CommandList from "@/components/CommandList";
import CdnFlow from "@/components/figures/CdnFlow";
import InterviewQA from "@/components/InterviewQA";
import LessonIntro from "@/components/LessonIntro";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { getLesson } from "@/lib/lessons";

const lesson = getLesson("lesson-11")!;

export const metadata: Metadata = {
  title: `Lesson 11 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Concept: file storage and file delivery" },
  { id: "why-this-matters", label: "Why files do not belong on the server" },
  { id: "s3-model", label: "How S3 thinks: buckets, keys, objects" },
  { id: "private", label: "Private by default — and keeping it that way" },
  { id: "create", label: "Create a bucket and use it" },
  { id: "app-access", label: "Letting the app read and write it (no keys)" },
  { id: "presigned", label: "Presigned URLs — uploads that skip your server" },
  { id: "cors", label: "CORS, the error every browser upload hits" },
  { id: "lifecycle", label: "Versioning, lifecycle and storage classes" },
  { id: "cdn", label: "What a CDN is and why it is fast" },
  { id: "cloudfront", label: "CloudFront in front of S3, step by step" },
  { id: "caching", label: "Cache control, cache busting and invalidation" },
  { id: "nextjs", label: "Using it from Next.js" },
  { id: "cost", label: "What this costs" },
  { id: "troubleshooting", label: "Troubleshooting table" },
  { id: "interview", label: "Interview corner" },
  { id: "practice", label: "Practice task before Lesson 12" },
  { id: "conclusion", label: "Conclusion" },
];

const classes: [string, string, string, string][] = [
  ["Standard", "Anything you read often: images, uploads, app assets", "~$0.025/GB-month", "Instant"],
  ["Intelligent-Tiering", "You do not know how often files are read. S3 moves objects to cheaper tiers for you", "From $0.025 down to ~$0.004 per GB-month, plus a small monitoring fee", "Instant"],
  ["Standard-IA", "Read rarely, but needed fast when you do (monthly reports, old invoices)", "~$0.0138/GB + retrieval fee", "Instant"],
  ["Glacier Instant Retrieval", "Archives you almost never touch, but that must open in milliseconds", "~$0.005/GB + retrieval fee", "Instant"],
  ["Glacier Deep Archive", "Archives kept for years, for example for legal rules", "~$0.002/GB + retrieval fee", "Hours (standard retrieval: up to 12 hours; bulk: up to 48)"],
];

const trouble: [string, string, string][] = [
  ["AccessDenied on GetObject from the app", "The instance role has no s3:GetObject permission for that bucket or prefix, or the ARN is missing the /* at the end", "Check the Resource line. Use the bucket ARN for ListBucket and arn:…:bucket/* for object actions."],
  ["403 from CloudFront for a file that exists", "The bucket policy does not allow the CloudFront distribution (OAC), or the file key is wrong", "Apply the OAC bucket policy again. Check the exact key and the upper and lower case letters."],
  ["Browser: “blocked by CORS policy” on upload", "The bucket CORS rules do not list your site's origin, method or headers", "Add your origin, the PUT and GET methods, and the headers to the bucket's CORS rules"],
  ["Presigned URL: SignatureDoesNotMatch", "The upload sends a different Content-Type (or header) than the one that was signed, or the URL has expired", "Send exactly the signed Content-Type. Check the expiry time and the server clock."],
  ["Old file still served after re-uploading", "CloudFront keeps serving its saved copy until the TTL (the time the copy may be kept) ends", "Use versioned file names, or create an invalidation for that path"],
  ["Distribution works, but custom domain shows a certificate error", "The ACM certificate is not in us-east-1, is not validated yet, or does not cover the domain", "Request (or import) it in N. Virginia (us-east-1) and attach it"],
  ["Cannot delete the bucket", "It is not empty. Old versions and delete markers count too", "Empty it with a lifecycle rule, or with aws s3 rm --recursive plus a clean-up of old versions"],
];

export default function LessonElevenPage() {
  return (
    <article>
      <LessonIntro lesson={lesson} outline={outline} />

      <div className="lesson">
        <h2 id="concept">Concept</h2>
        <p>
          This lesson covers two tools that work as a pair. Each one solves a different problem:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>S3 (Simple Storage Service)</th>
                <th>CloudFront</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Problem solved</strong></td>
                <td>Where do files <em>live</em>?</td>
                <td>How do files reach users <em>fast</em>?</td>
              </tr>
              <tr>
                <td><strong>Analogy</strong></td>
                <td>One giant, safe warehouse</td>
                <td>Small local shops that stock copies of popular items</td>
              </tr>
              <tr>
                <td><strong>Location</strong></td>
                <td>One region (Mumbai). A region is a group of AWS data centres in one area.</td>
                <td>Hundreds of edge locations worldwide. An edge location is a small data centre close to users.</td>
              </tr>
              <tr>
                <td><strong>Holds</strong></td>
                <td>The original of every file</td>
                <td>Temporary cached copies</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout kind="note" label="Files, not rows">
          <p className="mb-0">
            Here is the rule for choosing between S3 and RDS (RDS is the AWS managed database
            service: AWS runs the database server for you): <strong>if it is a file (an image, a PDF, a video, a backup), it goes in S3.
            If it is a record you search (a user, an order), it goes in the database.</strong> The
            database stores the <em>address</em> of the file (the S3 key), not the file itself.
          </p>
        </Callout>

        <h2 id="why-this-matters">Why files do not belong on the server</h2>
        <p>
          On Vercel you may have used its blob storage, or you may have put images in{" "}
          <code>/public</code> (the Next.js folder for plain files that are served as they are). On your own server the easy way is a folder such as{" "}
          <code>/uploads</code>. This works until one of these things happens:
        </p>
        <ul>
          <li>
            <strong>You run two servers.</strong> A customer uploads a PDF to server A. The next
            request goes to server B, which has never seen the file. The file
            &ldquo;vanished&rdquo;. This is the stateless rule from Lesson 8, applied to files.
            (A stateless server keeps no data of its own between requests.)
          </li>
          <li>
            <strong>A server is replaced.</strong> Auto Scaling (Lesson 12) is an AWS service that adds and removes servers as traffic changes. It removes servers when
            traffic drops. Every upload on a removed server disappears with its disk.
          </li>
          <li>
            <strong>The disk fills.</strong> EBS is the virtual hard disk of an EC2 server. A 20 GB
            disk is full after a few thousand good photos, and making it bigger is extra work.
          </li>
          <li>
            <strong>Your CPU serves files.</strong> Every image request keeps a Node or Nginx worker
            busy. That worker should be running your app logic.
          </li>
          <li>
            <strong>Distance.</strong> A user in Delhi loading images from a server in Mumbai is
            fine. A user in London is much slower, and you cannot make light travel faster.
          </li>
        </ul>
        <p>
          S3 gives you storage with no practical limit and no disk to manage. It keeps copies of
          your data in at least three Availability Zones (separate groups of data centres). It has
          99.999999999% (eleven nines) <strong>durability</strong>, which means a very small chance
          of ever losing an object. The price is about{" "}
          <strong>$0.025 per GB per month</strong> in Mumbai.
        </p>

        <h2 id="s3-model">How S3 thinks: buckets, keys, objects</h2>
        <p>
          S3 looks like a folder tree in the console, but it is not a file system. It is a giant
          key-value store. That means you give it a name (the key), and it gives you back the file
          (the value), like a huge dictionary:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Word</th>
                <th>Meaning</th>
                <th>Example</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Bucket</strong></td>
                <td>The top-level container. Its name is unique across <em>all of AWS worldwide</em>, and it lives in one region.</td>
                <td><code>myapp-uploads-prod-7f3a</code></td>
              </tr>
              <tr>
                <td><strong>Object</strong></td>
                <td>One stored file plus its metadata. Up to 5 TB each.</td>
                <td>a PDF</td>
              </tr>
              <tr>
                <td><strong>Key</strong></td>
                <td>The object&apos;s full name, slashes included. The &ldquo;folders&rdquo; are only a way to show the names.</td>
                <td><code>tenants/acme/invoices/2026-01.pdf</code></td>
              </tr>
              <tr>
                <td><strong>Prefix</strong></td>
                <td>The start of a key. You use it to list files and to give permissions for a &ldquo;folder&rdquo;.</td>
                <td><code>tenants/acme/</code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Two facts help you avoid real bugs. First, objects are <strong>immutable</strong>. You
          replace a whole object. You cannot edit part of it. Second, S3 has{" "}
          <strong>strong read-after-write consistency</strong>. Right after an upload, any read
          shows the new file.
        </p>
        <Callout kind="note" label="Key design for multi-tenant SaaS">
          <p className="mb-0">
            A multi-tenant app is one app that serves many customers (tenants). Put the tenant in the
            key: <code>tenants/&lt;tenantId&gt;/…</code>. IAM is AWS&apos;s system for who may do what, and an
            IAM policy is a written permission rule in that system. Then one IAM policy or
            one presigned URL can be limited to one customer&apos;s prefix. Listing one
            customer&apos;s files is cheap, and deleting a customer means deleting one prefix.
            Never build a key from raw user input. Generate IDs with{" "}
            <code>crypto.randomUUID()</code> (a function that makes a random unique ID, called a UUID)
            and clean any names. This stops path tricks and
            accidental overwrites.
          </p>
        </Callout>

        <h2 id="private">Private by default — and keeping it that way</h2>
        <p>
          Many famous cloud data leaks came from public S3 buckets. AWS has since made the safe
          choice the default. You should keep it that way.
        </p>
        <Callout kind="warn" label="Turn on Block Public Access — at the account level">
          <p className="mb-0">
            New buckets block all public access, and ACLs (old per-object permission lists) are
            switched off. Also turn on <strong>S3 Block Public Access for the whole account</strong>{" "}
            (S3 → Block Public Access settings for this account). Then nobody on your team, and no
            future script, can make a bucket public by accident. Almost no modern setup needs a
            public bucket. Users see files through CloudFront, and CloudFront reads from a private
            bucket.
          </p>
        </Callout>
        <p>Who <em>can</em> read a private bucket, then?</p>
        <ul>
          <li>
            <strong>Your app</strong>, through its IAM role. A role is a set of permissions that a
            server can use without any stored password (next section).
          </li>
          <li>
            <strong>CloudFront</strong>, through a bucket policy (a permission rule attached to the
            bucket) that names the distribution. This is called Origin Access Control.
          </li>
          <li>
            <strong>One user for a short time</strong>, through a presigned URL (a temporary link,
            explained below).
          </li>
        </ul>
        <p>Nobody else can read it, and the open internet cannot. That is what &ldquo;private&rdquo; means.</p>

        <h2 id="create">Create a bucket and use it</h2>
        <p>
          Go to S3 → <strong>Create bucket</strong>. Bucket names are shared by every AWS account in
          the world, so add something random, such as <code>myapp-uploads-7f3a</code>. Choose the
          region <code>ap-south-1</code>. Leave <strong>Block all public access</strong> switched on.
          Leave default encryption as it is. Both are already the safe choice. That is all.
        </p>
        <p>
          From your laptop, the AWS CLI (the command-line tool for AWS) can copy files in and out,
          list a prefix, sync a whole folder, and delete. Try one command now. It shows the
          &ldquo;private by default&rdquo; idea at work:
        </p>
        <CommandList
          title="Try it"
          commands={[
            { cmd: "aws s3 presign s3://myapp-uploads-7f3a/assets/logo.png --expires-in 300", note: "Upload any file in the console first. This link works for 5 minutes. The plain object URL is denied" },
          ]}
        />

        <h2 id="app-access">Letting the app read and write it (no keys)</h2>
        <p>
          Lesson 5 created <code>myapp-pdfs-rw</code>, a policy that allows exactly get and put on one
          bucket. Now make a policy for your new bucket and attach it to the EC2 role. Notice the
          two different <em>resources</em>: the bucket itself, and the objects inside it. An ARN
          (Amazon Resource Name) is the unique ID of an AWS thing.
        </p>
        <Script
          title="s3-app-policy.json"
          code={`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListOnlyThisBucket",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::myapp-uploads-7f3a"
    },
    {
      "Sid": "ReadWriteObjects",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::myapp-uploads-7f3a/*"
    }
  ]
}`}
        />
        <Callout kind="warn" label="The #1 S3 policy bug: the missing /*">
          <p className="mb-0">
            <code>s3:ListBucket</code> works on the <em>bucket</em> ARN (no slash at the end).{" "}
            <code>s3:GetObject</code> and <code>PutObject</code> work on the <em>objects</em> ARN
            (<code>…/*</code>). If you use the wrong ARN for an action, you get{" "}
            <code>AccessDenied</code>, even though the policy &ldquo;looks right&rdquo;.
          </p>
        </Callout>
        <p>
          Create this as a policy (<code>myapp-uploads-rw</code>) and attach it to{" "}
          <code>myapp-ec2-role</code>. You do not need to restart anything. The server gets its
          temporary credentials from AWS by itself, and a policy change takes effect quickly,
          usually within seconds. On the server, with no keys set up, listing your bucket now works.
          Listing any other bucket is denied.
        </p>

        <h2 id="presigned">Presigned URLs — uploads that skip your server</h2>
        <p>
          Here is a common beginner upload flow. The browser sends a 40 MB video to your Next.js API,
          and the API forwards it to S3. This keeps your server busy for the whole upload and uses
          double the bandwidth. It also hits body-size limits (Nginx <code>413</code>, and 4.5 MB on
          Vercel functions).
        </p>
        <p>
          The better pattern uses a <strong>presigned URL</strong>. This is a web link with a
          built-in signature (a proof of permission). It allows one action on one object for a short
          time. Your server only <strong>signs a permission slip</strong>, and the browser uploads
          straight to S3.
        </p>
        <ol>
          <li>Browser asks your API: &ldquo;I want to upload <code>photo.jpg</code> (image/jpeg).&rdquo;</li>
          <li>
            Your API checks that the user is logged in and allowed. It makes a key and returns a{" "}
            <strong>presigned PUT URL</strong> that works for a few minutes.
          </li>
          <li>The browser sends the file straight to S3 with a <code>PUT</code> request (the HTTP method for &ldquo;store this&rdquo;), using that URL.</li>
          <li>Your API stores the key in the database.</li>
        </ol>
        <Script
          title="app/api/upload-url/route.ts"
          code={`import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

// No credentials: the SDK (the AWS code library) finds the EC2 role by itself (Lesson 5)
const s3 = new S3Client({ region: "ap-south-1" });

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export async function POST(req: Request) {
  const user = await requireUser(req);                       // your own auth check — never skip this
  const { contentType } = await req.json();

  if (!ALLOWED.includes(contentType)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  const key = \`tenants/\${user.tenantId}/uploads/\${randomUUID()}\`;   // server decides the key

  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: process.env.UPLOAD_BUCKET!,
      Key: key,
      ContentType: contentType,              // the upload MUST send exactly this header
    }),
    { expiresIn: 300 },                      // 5 minutes
  );

  return NextResponse.json({ url, key });
}`}
        />
        <Script
          title="in the browser"
          code={`async function upload(file: File) {
  const res = await fetch("/api/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: file.type }),
  });
  const { url, key } = await res.json();

  const put = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": file.type },   // must match what was signed
    body: file,
  });
  if (!put.ok) throw new Error("Upload failed");
  return key;                                  // save this in your database
}`}
        />
        <Callout kind="note" label="What a presigned URL really is">
          <p className="mb-0">
            The URL contains a signature. This is a code worked out from your role&apos;s credentials
            plus the exact bucket, key, method and expiry time. S3 works out the code again when
            the request arrives. If anything is different (the key, the method, a header), the code
            does not match and the request fails. The link also stops working when the role&apos;s
            temporary credentials expire. It is like a key card that works for one job and for a
            short time. It is Lesson 5&apos;s plumber, for one file.
          </p>
        </Callout>

        <h2 id="cors">CORS, the error every browser upload hits</h2>
        <p>
          When the <em>browser</em> calls S3 directly, the browser&apos;s same-origin rule applies.
          An <strong>origin</strong> is the protocol, domain and port together, such as{" "}
          <code>https://yourapp.com</code>. A page from one origin may not use another origin (such
          as <code>*.s3.amazonaws.com</code>) unless that server agrees. <strong>CORS</strong>{" "}
          (Cross-Origin Resource Sharing) is the set of rules a server uses to say yes. Before the{" "}
          <code>PUT</code>, the browser sends a small check request (a preflight) to ask S3 whether
          it is allowed. Your first try will show &ldquo;blocked by CORS policy&rdquo;. The fix is a
          CORS configuration <em>on the bucket</em>:
        </p>
        <Script
          title="cors.json"
          code={`{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://yourapp.com", "https://*.yourapp.com", "http://localhost:3000"],
      "AllowedMethods": ["PUT", "GET", "HEAD"],
      "AllowedHeaders": ["Content-Type"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}`}
        />
        <p>
          Paste it in the bucket&apos;s Permissions → <strong>CORS</strong>. List only origins that
          you own. Never use <code>*</code> for a bucket that accepts uploads. Remove the{" "}
          <code>localhost</code> origin from the production bucket when you no longer need it.
        </p>

        <h2 id="lifecycle">Versioning, lifecycle and storage classes</h2>
        <h3>Versioning — the undo button</h3>
        <p>
          <strong>Versioning</strong> is a bucket setting that keeps every old version of an object.
          When you delete a file, S3 only adds a &ldquo;delete marker&rdquo; (a hidden note that
          makes the file look deleted). You can restore an overwritten or deleted file. This is the
          cheapest insurance for user data. It is also part of Lesson 18&apos;s backup story.
        </p>
        <p>
          Both are in the console. Versioning is under <strong>Properties → Bucket versioning</strong>.
          A <strong>lifecycle rule</strong> is an automatic rule that acts on objects as they get
          older. Make one under <strong>Management → Create lifecycle rule</strong> with the three
          actions below.
        </p>
        <p>This is what the lifecycle rule does:</p>
        <ul>
          <li>Old versions of files are deleted after 30 days. Without this, versioning grows forever.</li>
          <li>Half-finished uploads are cleaned up after 7 days. They are a common hidden cost.</li>
          <li>Files that nobody touches for 90 days move to a cheaper storage class automatically.</li>
        </ul>
        <h3>Storage classes</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Class</th>
                <th>Use it for</th>
                <th>Approx. price</th>
                <th>Access</th>
              </tr>
            </thead>
            <tbody>
              {classes.map(([c, use, price, access]) => (
                <tr key={c}>
                  <td className="whitespace-nowrap"><strong>{c}</strong></td>
                  <td>{use}</td>
                  <td>{price}</td>
                  <td>{access}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Start with Standard. Add Intelligent-Tiering when you have a lot of data and do not know how
          often it is read. Do not make this complicated until storage is a big part of your bill.
          The prices in the table are rough and differ by region. Some classes also have a minimum
          storage time (for example 30 days for Standard-IA), so check the current pricing page.
        </p>

        <h2 id="cdn">What a CDN is and why it is fast</h2>
        <p>
          <strong>Latency</strong> is the delay before data arrives. It depends on distance (data
          cannot travel faster than light) and on the number of hops (steps between machines). A
          file stored in Mumbai takes about 20 ms to reach a user in Mumbai. It can take 100–300 ms
          to reach London or São Paulo. A web page needs dozens of files, so the delays add up. A{" "}
          <strong>Content Delivery Network</strong> (CDN) fixes this. It keeps copies of your files
          in hundreds of small data centres (<em>edge locations</em>) near users.
        </p>
        <CdnFlow />
        <p>
          A <strong>cache</strong> is a saved copy that is kept for quick reuse. The{" "}
          <strong>origin</strong> is the original server (here, S3). The first visitor in a city
          causes a <strong>cache miss</strong>: the edge location has no copy, so it fetches the file
          from your origin. Everyone after that gets a <strong>cache hit</strong>: the edge answers
          from its copy. Your origin sees only a small part of the traffic. This is also why a CDN
          protects your server from traffic spikes.
        </p>

        <h2 id="cloudfront">CloudFront in front of S3, step by step</h2>
        <p>
          The flow is: users → CloudFront → (only on a miss) → private S3 bucket. A{" "}
          <strong>distribution</strong> is one CloudFront setup. The bucket allows <em>only</em> that
          one distribution to read it. This works through{" "}
          <strong>Origin Access Control (OAC)</strong>, a CloudFront setting that signs CloudFront&apos;s
          requests to S3. The console is the easiest way to create a distribution the first time:
        </p>
        <ol className="steps">
          <li>
            <h3>Create the distribution</h3>
            <p>
              Go to CloudFront → Create distribution. For Origin domain, pick your S3 bucket. For{" "}
              <strong>Origin access</strong>, choose <em>Origin access control settings (recommended)</em>{" "}
              and create a new OAC (signing: sign requests). Under Viewer protocol policy, choose{" "}
              <em>Redirect HTTP to HTTPS</em>. Turn on compression. Pick the cache policy{" "}
              <em>CachingOptimized</em>. Then click Create.
            </p>
          </li>
          <li>
            <h3>Apply the bucket policy CloudFront shows you</h3>
            <p>
              After you create the distribution, the console shows a ready-made policy. It looks like
              this. Read it carefully. It says &ldquo;only this distribution may read objects&rdquo;:
            </p>
            <Script
              title="bucket policy for OAC"
              code={`{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "AllowCloudFrontServicePrincipalReadOnly",
    "Effect": "Allow",
    "Principal": { "Service": "cloudfront.amazonaws.com" },
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::myapp-uploads-7f3a/*",
    "Condition": {
      "StringEquals": {
        "AWS:SourceArn": "arn:aws:cloudfront::123456789012:distribution/E1ABCDEF2GHIJK"
      }
    }
  }]
}`}
            />
            <p>
              The <code>Condition</code> is the important part. Without it, <em>any</em> CloudFront
              distribution in the world could read your bucket. Paste the policy in the
              bucket&apos;s Permissions → Bucket policy.
            </p>
          </li>
          <li>
            <h3>Test the two paths</h3>
            <p>
              Upload a test file. Then compare the direct S3 URL with the CloudFront URL:
            </p>
            <CommandList
              title="Direct S3 is denied, CloudFront works"
              commands={[
                { cmd: "curl -I https://myapp-uploads-7f3a.s3.ap-south-1.amazonaws.com/assets/logo.png", note: "Direct to S3 you get 403 Forbidden. This is correct, because the bucket is private" },
                { cmd: "curl -I https://d1234abcd.cloudfront.net/assets/logo.png", note: "Through CloudFront you get 200 OK. Run it twice. The second answer says x-cache: Hit from cloudfront, which means it came from the edge" },
              ]}
            />
          </li>
          <li>
            <h3>Use your own domain: assets.yourapp.com</h3>
            <p>
              The random name <code>d1234abcd.cloudfront.net</code> is ugly, and it ties you to CloudFront.
              To use <code>assets.yourapp.com</code> instead:
            </p>
            <ul>
              <li>
                Request an <strong>ACM certificate for <code>assets.yourapp.com</code> in{" "}
                <code>us-east-1</code> (N. Virginia)</strong>. ACM is AWS Certificate Manager. CloudFront
                is a global service, and it reads certificates only from that one region. This is a
                common mistake, because everything else in this course is in Mumbai.
              </li>
              <li>Add the name as an Alternate domain name on the distribution, and select the certificate.</li>
              <li>
                In Route 53 (the AWS DNS service, Lesson 13), create an <em>alias</em> A record from{" "}
                <code>assets.yourapp.com</code> to the distribution.
              </li>
            </ul>
          </li>
        </ol>

        <h2 id="caching">Cache control, cache busting and invalidation</h2>
        <p>
          A cache has one hard problem: <strong>when the original file changes, how do the copies find
          out?</strong> There are three ways to handle this. The best way is to avoid the problem.
          Two terms first. The <strong>TTL</strong> (time to live) is how long a copy may be kept.
          The <code>max-age</code> setting in the <code>Cache-Control</code> header sets the TTL in
          seconds.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Strategy</th>
                <th>How</th>
                <th>Verdict</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Wait</strong></td>
                <td>Let the TTL (<code>max-age</code>) run out</td>
                <td>Simple, but users see old (stale) files until it does</td>
              </tr>
              <tr>
                <td><strong>Invalidate</strong></td>
                <td>Create an <strong>invalidation</strong> for <code>/assets/logo.png</code> on the distribution. An invalidation is a request that tells CloudFront to throw away its copies of that path</td>
                <td>Works. The first 1,000 paths each month are free, then $0.005 each. It takes a minute or two. Use it as a quick fix, not as a habit</td>
              </tr>
              <tr>
                <td><strong>Versioned file names</strong></td>
                <td><code>app.a1b2c3.js</code>, <code>logo-v7.png</code>: a new name whenever the content changes</td>
                <td><strong>Best.</strong> You never need an invalidation, and files can be cached forever</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Next.js already does the third way for you. The file{" "}
          <code>/_next/static/chunks/main-8f3a2c.js</code> has a content hash in its name (a hash is a
          short code made from the file&apos;s content, so it changes when the content changes), so it can
          use <code>Cache-Control: public, max-age=31536000, immutable</code>. (<code>immutable</code>{" "}
          tells the cache that the file will never change.) For your own uploads, use the same
          trick. Never overwrite a key. Upload to a new UUID key and save the new key in the
          database.
        </p>
        <Callout kind="warn" label="Do not cache what is personal">
          <p className="mb-0">
            A CDN is a shared cache. Some content must never be cached at the edge: HTML pages that are
            different for each user, API answers with private data, and anything behind a login.
            Otherwise one user can receive another user&apos;s page. Cache only static, public,
            versioned files. For everything else, send{" "}
            <code>Cache-Control: private, no-store</code>. Private user files (such as invoices)
            should use presigned URLs, not a public CDN path.
          </p>
        </Callout>

        <h2 id="nextjs">Using it from Next.js</h2>
        <p>
          There are two common ways to use the CDN. First, serve your built <code>/_next/static</code>{" "}
          files from it. You do this with <code>assetPrefix</code>, a setting that puts your CDN
          address in front of those file URLs. Next.js writes the new URLs into the HTML, so the
          files load from the edge instead of your server:
        </p>
        <Script
          title="next.config.ts"
          code={`import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Production only, so local development works without a CDN
  assetPrefix: process.env.NODE_ENV === "production" ? "https://assets.yourapp.com" : undefined,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "assets.yourapp.com" }],
  },
};

export default nextConfig;`}
        />
        <p>
          Then upload the static build output as part of your deploy. This step belongs in the CI
          pipeline of Lesson 14. (CI/CD is a robot that checks, builds and ships your code.) Only
          the <code>.next/static</code> folder goes to the CDN:
        </p>
        <Script
          title="deploy step"
          code={`aws s3 sync .next/static s3://myapp-uploads-7f3a/_next/static \\
  --cache-control "public, max-age=31536000, immutable"`}
        />
                <p>
          Do not upload the rest of the <code>.next</code> folder, because it holds your server
          code. Also note that <code>assetPrefix</code> does not cover files in the{" "}
          <code>public</code> folder. If you want those on the CDN, you must add the prefix
          yourself.
        </p>
        <Callout kind="note" label="Order matters when deploying">
          <p className="mb-0">
            Upload the new static files <strong>before</strong> you switch the servers to the new
            build. If you do it the other way round, a user can get new HTML that points to a file
            that is not in S3 yet, and the page breaks for a minute. Keep the old files for a while
            too. The reason is the same, in the other direction: pages that are still open in
            browsers need the old files.
          </p>
        </Callout>

        <h2 id="cost">What this costs</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Item</th><th>Approx. price</th></tr>
            </thead>
            <tbody>
              <tr><td>S3 Standard storage</td><td>~$0.025 per GB-month (10 GB ≈ $0.25)</td></tr>
              <tr><td>S3 requests</td><td>~$0.005 per 1,000 writes, ~$0.0004 per 1,000 reads</td></tr>
              <tr><td>Data <em>in</em> to S3</td><td className="font-semibold text-emerald-300">Free</td></tr>
              <tr><td>S3 → CloudFront transfer</td><td className="font-semibold text-emerald-300">Free</td></tr>
              <tr><td>CloudFront data out</td><td>First 1 TB/month free, then ~$0.11/GB in India</td></tr>
              <tr><td>CloudFront requests</td><td>First 10 million/month free</td></tr>
              <tr><td>ACM certificates</td><td className="font-semibold text-emerald-300">Free</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          For a small company&apos;s image and file traffic, this is usually a few dollars a month. It
          is often <em>cheaper</em> than serving the same files from EC2, because data that leaves
          EC2 is billed, but data from S3 to CloudFront is free. Prices change, so check the current
          pricing pages.
        </p>

        <h2 id="troubleshooting">Troubleshooting table</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Symptom</th>
                <th>Likely cause</th>
                <th>Fix</th>
              </tr>
            </thead>
            <tbody>
              {trouble.map(([s, c, f]) => (
                <tr key={s}>
                  <td><code>{s}</code></td>
                  <td>{c}</td>
                  <td>{f}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 id="interview">Interview corner</h2>
        <InterviewQA
          items={[
            {
              q: "How do you let users upload large files securely without going through your server?",
              a: (
                <p className="mb-0">
                  The server checks who the user is. It returns a short-lived presigned PUT URL for
                  one key and one content type. The browser uploads straight to S3 (the bucket CORS
                  rules must allow it). The server saves the key. This removes size limits and
                  server load.
                </p>
              ),
            },
            {
              q: "How do you serve private S3 content through CloudFront?",
              a: (
                <p className="mb-0">
                  I keep the bucket private with Block Public Access. I create a CloudFront distribution
                  with Origin Access Control. Then I add a bucket policy that allows only that
                  distribution (using a condition on <code>AWS:SourceArn</code>). For private files
                  of one user, I use CloudFront signed URLs or signed cookies (a signed URL or cookie is
                  a temporary proof of permission that CloudFront checks).
                </p>
              ),
            },
            {
              q: "You replaced an image but users still see the old one. Why, and what is the right fix?",
              a: (
                <p className="mb-0">
                  CloudFront (and browsers) keep serving the saved copy until the TTL runs out. A quick fix
                  is an invalidation. The right design is file names with a content hash or a version,
                  and a long <code>max-age</code>. Then a change gets a new URL.
                </p>
              ),
            },
            {
              q: "Why must a CloudFront ACM certificate be in us-east-1?",
              a: (
                <p className="mb-0">
                  CloudFront is a global service, and it reads its certificates from N. Virginia
                  (us-east-1). Regional services such as an ALB use certificates from their own
                  region.
                </p>
              ),
            },
            {
              q: "S3 durability vs availability?",
              a: (
                <p className="mb-0">
                  Durability (11 nines) is the chance that an object is not lost over a year. S3 stores the
                  data in several places to achieve this. Availability (99.99% for Standard) is the
                  chance that a request works at a given moment. They are different numbers with
                  different meanings.
                </p>
              ),
            },
            {
              q: "A cross-tenant data leak: customer A saw customer B's file. Where could S3 be the cause?",
              a: (
                <p className="mb-0">
                  Possible causes are: keys that are easy to guess (in order, or chosen by the user), a
                  presigned URL given out without checking that the tenant owns the file, a CDN path
                  that cached a private answer, or an IAM policy wider than the tenant prefix. The fix
                  is random keys with a tenant prefix, a permission check before signing, and no CDN
                  caching of private content.
                </p>
              ),
            },
            {
              q: "Why turn on versioning, and what is the catch?",
              a: (
                <p className="mb-0">
                  It lets you recover from an accidental overwrite or delete, and from malicious changes.
                  The catch is cost. Old versions pile up, so pair it with a lifecycle rule that
                  expires old (noncurrent) versions.
                </p>
              ),
            },
          ]}
        />

        <hr />

        <h2 id="practice">Practice task before Lesson 12</h2>
        <ol>
          <li>
            Create a private bucket with encryption and Block Public Access. Upload a file and prove
            the plain object URL returns 403 while a <code>presign</code> URL works.
          </li>
          <li>
            Attach the permission policy to <code>myapp-ec2-role</code>. Then confirm, from the server
            with no keys, that you can list this bucket but not another one.
          </li>
          <li>
            Create a CloudFront distribution with OAC. Confirm direct-to-S3 is 403 and the CloudFront
            URL returns <code>Miss</code> then <code>Hit</code>.
          </li>
          <li>
            Build the <code>/api/upload-url</code> route and a small page that uploads a file to S3.
            You will hit a CORS error first — fix it with the bucket CORS config.
          </li>
          <li>
            Turn on versioning. Overwrite a file, then restore the earlier version in the console.
          </li>
          <li>
            Re-upload a changed <code>logo.png</code> to the same key and observe the CDN serving the
            stale copy. Solve it two ways: an invalidation, and by renaming to{" "}
            <code>logo-v2.png</code>. Which would you do in production?
          </li>
        </ol>
        <Callout kind="ok" label="Optional stretch">
          <p className="mb-0">
            Run <code>curl -s -o /dev/null -w &quot;%&#123;time_total&#125;\n&quot; URL</code> for the
            same file from S3 directly (with a presigned URL) and through CloudFront, several times
            each, and compare. If you have a friend in another country, ask them to try it too.
          </p>
        </Callout>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          S3 stores files safely and cheaply. CloudFront delivers them quickly. Together they take the
          heaviest and most repeated work away from your servers. This makes the servers easy to
          replace.
        </p>
        <ul>
          <li>
            <strong>Files go in S3, records in RDS.</strong> The database keeps the key, not the
            file.
          </li>
          <li>
            <strong>Private by default</strong>: Block Public Access on the account; access through
            the IAM role, CloudFront OAC or a presigned URL — never a public bucket.
          </li>
          <li>
            <strong>Presigned URLs</strong> let the browser upload directly, which removes size
            limits and server load. Remember CORS.
          </li>
          <li>
            <strong>Version your file names</strong>, so a CDN can cache them forever and you never
            need to invalidate. Lifecycle rules keep the bill small.
          </li>
          <li>
            <strong>The ACM certificate for CloudFront must be in us-east-1.</strong> Remember this one,
            because it surprises many people.
          </li>
        </ul>
        <p>
          Your data is now in RDS and your files are in S3, so your app servers are finally
          stateless. This must be true before the next lesson: running many servers behind a load
          balancer.
        </p>

        <hr />
        <p>
          End of Lesson 11. Next: <strong>Lesson 12 — ALB and Auto Scaling: Scaling to 1000+
          Concurrent Users</strong>.
        </p>
      </div>

      <LessonPager slug={lesson.slug} />
    </article>
  );
}
