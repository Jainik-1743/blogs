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
  ["Intelligent-Tiering", "Unknown or changing access pattern; moves objects for you", "$0.025 down to ~$0.004 + tiny monitoring fee", "Instant"],
  ["Standard-IA", "Read rarely but need it fast (monthly reports, old invoices)", "~$0.0138/GB + retrieval fee", "Instant"],
  ["Glacier Instant Retrieval", "Archives you almost never touch but must open in ms", "~$0.005/GB + retrieval fee", "Instant"],
  ["Glacier Deep Archive", "Compliance archives kept for years", "~$0.002/GB", "Up to 12 hours"],
];

const trouble: [string, string, string][] = [
  ["AccessDenied on GetObject from the app", "The instance role has no s3:GetObject on that bucket/prefix, or the ARN is missing the /* suffix", "Check the Resource: bucket ARN for ListBucket, arn:…:bucket/* for object actions"],
  ["403 from CloudFront for a file that exists", "Bucket policy does not allow the CloudFront distribution (OAC), or the file key is wrong", "Re-apply the OAC bucket policy; check exact key and case"],
  ["Browser: “blocked by CORS policy” on upload", "Bucket CORS does not list your site's origin, method or headers", "Add your origin, PUT/GET and the headers to the bucket's CORS config"],
  ["Presigned URL: SignatureDoesNotMatch", "The upload sends a different Content-Type (or header) than was signed, or the URL has expired", "Send exactly the signed Content-Type; check the expiry and server clock"],
  ["Old file still served after re-uploading", "CloudFront is serving the cached copy until its TTL ends", "Use versioned filenames, or create an invalidation for that path"],
  ["Distribution works, but custom domain shows a certificate error", "The ACM certificate is not in us-east-1, is not validated, or does not cover the domain", "Request/import it in N. Virginia (us-east-1) and attach it"],
  ["Cannot delete the bucket", "It is not empty (including old versions and delete markers)", "Empty it with a lifecycle rule or aws s3 rm --recursive plus version cleanup"],
];

export default function LessonElevenPage() {
  return (
    <article>
      <LessonIntro lesson={lesson} outline={outline} />

      <div className="lesson">
        <h2 id="concept">Concept</h2>
        <p>
          This lesson is two tools that work as a pair, solving two different problems:
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
                <td>One region (Mumbai)</td>
                <td>400+ edge locations worldwide</td>
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
            The rule that decides between S3 and RDS: <strong>if it is a file (an image, a PDF, a
            video, a backup), it goes in S3. If it is a record you query (a user, an order), it goes
            in the database.</strong> The database stores the <em>address</em> of the file (the S3
            key), not the file.
          </p>
        </Callout>

        <h2 id="why-this-matters">Why files do not belong on the server</h2>
        <p>
          On Vercel you may have used its blob storage or committed images into <code>/public</code>.
          On your own server the easy path is a folder such as <code>/uploads</code>. It works until:
        </p>
        <ul>
          <li>
            <strong>You run two servers.</strong> A customer uploads a PDF to server A; the next
            request lands on server B, which has never seen it. The file &ldquo;vanished&rdquo;.
            This is the exact stateless rule from Lesson 8, applied to files.
          </li>
          <li>
            <strong>A server is replaced.</strong> Auto Scaling terminates instances; every upload
            on them disappears with the disk.
          </li>
          <li>
            <strong>The disk fills.</strong> 20 GB of EBS is gone after a few thousand high-quality
            photos, and growing the disk means downtime and resizing.
          </li>
          <li>
            <strong>Your CPU serves bytes.</strong> Every image request occupies a Node/Nginx worker
            that should be running business logic.
          </li>
          <li>
            <strong>Distance.</strong> A user in Delhi loading images from a server in Mumbai is
            fine; the same user in London is not, and physics cannot be tuned.
          </li>
        </ul>
        <p>
          S3 gives you effectively unlimited storage, 99.999999999% (eleven nines) durability,
          copies across at least three data centres, and no disk to manage — for about{" "}
          <strong>$0.025 per GB per month</strong>.
        </p>

        <h2 id="s3-model">How S3 thinks: buckets, keys, objects</h2>
        <p>
          S3 looks like a folder tree in the console, but it is not a file system. It is a giant
          key-value store:
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
                <td>The object&apos;s full name, slashes included. The &ldquo;folders&rdquo; are just a display convention.</td>
                <td><code>tenants/acme/invoices/2026-01.pdf</code></td>
              </tr>
              <tr>
                <td><strong>Prefix</strong></td>
                <td>The start of a key. Used to list and to write permissions for a &ldquo;folder&rdquo;.</td>
                <td><code>tenants/acme/</code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Two facts that avoid real bugs: objects are <strong>immutable</strong> (you replace, you do
          not edit part of one), and S3 has <strong>strong read-after-write consistency</strong> (a
          new upload can be read immediately).
        </p>
        <Callout kind="note" label="Key design for multi-tenant SaaS">
          <p className="mb-0">
            Put the tenant in the key: <code>tenants/&lt;tenantId&gt;/…</code>. Then a single IAM
            policy or presigned URL can be scoped to one customer&apos;s prefix, listing one
            customer&apos;s files is cheap, and deleting a customer is deleting one prefix. Never
            derive a key from raw user input — sanitise and generate IDs (<code>crypto.randomUUID()</code>)
            to prevent path tricks and overwrites.
          </p>
        </Callout>

        <h2 id="private">Private by default — and keeping it that way</h2>
        <p>
          The most famous cloud data leaks in history are public S3 buckets. AWS has since made the
          safe path the default, and you should keep it that way.
        </p>
        <Callout kind="warn" label="Turn on Block Public Access — at the account level">
          <p className="mb-0">
            New buckets block all public access and have ACLs disabled. Set{" "}
            <strong>S3 Block Public Access on the whole account</strong> (S3 → Block Public Access
            settings for this account) so that no one, on your team or in a future script, can ever
            make a bucket public by accident. Almost no modern architecture needs a public bucket:
            the users see files through CloudFront, and CloudFront reads from a private bucket.
          </p>
        </Callout>
        <p>Who <em>can</em> read a private bucket, then?</p>
        <ul>
          <li>
            <strong>Your app</strong>, through its IAM role (next section).
          </li>
          <li>
            <strong>CloudFront</strong>, through a bucket policy that names the distribution
            (Origin Access Control).
          </li>
          <li>
            <strong>A specific user for a short time</strong>, through a presigned URL.
          </li>
        </ul>
        <p>Nobody else. Not the internet. That is what &ldquo;private&rdquo; means.</p>

        <h2 id="create">Create a bucket and use it</h2>
        <p>
          S3 → <strong>Create bucket</strong>. Bucket names are global across every AWS account,
          so add something random: <code>myapp-uploads-7f3a</code>. Region{" "}
          <code>ap-south-1</code>. Leave <strong>Block all public access</strong> switched on and
          default encryption as it is — both are already the safe choice. That&apos;s it.
        </p>
        <p>
          From your laptop the CLI can copy files in and out, list a prefix, sync a whole folder
          and delete. One command is worth trying straight away, because it shows the
          &ldquo;private by default&rdquo; idea in action:
        </p>
        <CommandList
          title="Try it"
          commands={[
            { cmd: "aws s3 presign s3://myapp-uploads-7f3a/assets/logo.png --expires-in 300", note: "Upload any file in the console first. This link works for 5 minutes; the plain object URL is denied" },
          ]}
        />

        <h2 id="app-access">Letting the app read and write it (no keys)</h2>
        <p>
          Lesson 5 created <code>myapp-pdfs-rw</code>, a policy allowing exactly get and put on one
          bucket. Point it at your new bucket and attach it to the EC2 role. Notice the two
          different <em>resources</em> — the bucket itself, and the objects inside it:
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
      "Resource": "arn:aws:s3:::myapp-uploads-abcd1234"
    },
    {
      "Sid": "ReadWriteObjects",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::myapp-uploads-abcd1234/*"
    }
  ]
}`}
        />
        <Callout kind="warn" label="The #1 S3 policy bug: the missing /*">
          <p className="mb-0">
            <code>s3:ListBucket</code> applies to the <em>bucket</em> ARN (no slash);{" "}
            <code>s3:GetObject</code> and <code>PutObject</code> apply to the <em>objects</em> ARN
            (<code>…/*</code>). Put the wrong ARN on an action and you get{" "}
            <code>AccessDenied</code> even though the policy &ldquo;looks right&rdquo;.
          </p>
        </Callout>
        <p>
          Create this as a policy (<code>myapp-uploads-rw</code>) and attach it to{" "}
          <code>myapp-ec2-role</code>. No restart needed — the server&apos;s credentials refresh
          within minutes. On the server, with no keys configured, listing your bucket now works
          and listing any other bucket is denied.
        </p>

        <h2 id="presigned">Presigned URLs — uploads that skip your server</h2>
        <p>
          A typical beginner upload flow: the browser sends a 40 MB video to your Next.js API, which
          receives it and forwards it to S3. That ties up your server for the whole upload, doubles
          the bandwidth, and hits body-size limits (Nginx <code>413</code>, and 4.5 MB on Vercel
          functions).
        </p>
        <p>
          The professional pattern: your server only <strong>signs a permission slip</strong>, and
          the browser uploads directly to S3.
        </p>
        <ol>
          <li>Browser asks your API: &ldquo;I want to upload <code>photo.jpg</code> (image/jpeg).&rdquo;</li>
          <li>
            Your API checks the user is logged in and allowed, generates a key, and returns a{" "}
            <strong>presigned PUT URL</strong> valid for a few minutes.
          </li>
          <li>The browser <code>PUT</code>s the file straight to S3 using that URL.</li>
          <li>Your API stores the key in the database.</li>
        </ol>
        <Script
          title="app/api/upload-url/route.ts"
          code={`import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

// No credentials: the SDK finds the EC2 role by itself (Lesson 5)
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
            The URL contains a cryptographic signature computed from your role&apos;s credentials
            plus the exact bucket, key, method and expiry. S3 recomputes it on arrival. Change
            anything (the key, the method, the header) and the signature no longer matches, so it
            fails. It is a time-limited, single-purpose key card — Lesson 5&apos;s plumber, for one
            file.
          </p>
        </Callout>

        <h2 id="cors">CORS, the error every browser upload hits</h2>
        <p>
          The moment the <em>browser</em> calls S3 directly, you trigger the browser&apos;s
          same-origin rule: a page on <code>yourapp.com</code> is not allowed to call{" "}
          <code>*.s3.amazonaws.com</code> unless S3 explicitly agrees. Your first attempt will show
          &ldquo;blocked by CORS policy&rdquo;. The fix is a CORS configuration <em>on the bucket</em>:
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
          Paste it in the bucket&apos;s Permissions → <strong>CORS</strong>. List only origins you
          own; never use <code>*</code> for a bucket that accepts uploads.
        </p>

        <h2 id="lifecycle">Versioning, lifecycle and storage classes</h2>
        <h3>Versioning — the undo button</h3>
        <p>
          Turn on <strong>versioning</strong> and S3 keeps every previous version of an object; a
          delete just adds a &ldquo;delete marker&rdquo;. An overwritten or deleted file can be
          restored. It is the cheapest insurance you can buy for user data (and Lesson 18&apos;s
          backup story).
        </p>
        <p>
          Both are switches in the console: <strong>Properties → Bucket versioning</strong>, and{" "}
          <strong>Management → Create lifecycle rule</strong> with the three actions below.
        </p>
        <p>What that lifecycle rule does, in plain English:</p>
        <ul>
          <li>Old versions of files are deleted after 30 days (otherwise versioning grows forever).</li>
          <li>Half-finished uploads are cleaned up after 7 days — a common hidden cost.</li>
          <li>Files untouched for 90 days move to a cheaper class automatically.</li>
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
          Start with Standard. Add Intelligent-Tiering once you have real volume and do not know the
          pattern. Do not over-engineer this until the storage line is a meaningful part of the
          bill.
        </p>

        <h2 id="cdn">What a CDN is and why it is fast</h2>
        <p>
          Latency is the speed of light plus the number of hops. A file stored in Mumbai takes about
          20 ms to reach Mumbai but 150–250 ms to reach London or São Paulo, and a web page needs
          dozens of files. A <strong>Content Delivery Network</strong> keeps copies of files in
          hundreds of small data centres (<em>edge locations</em>) near users.
        </p>
        <CdnFlow />
        <p>
          The first visitor in a city causes a <strong>cache miss</strong> (the edge fetches from
          your origin). Everyone after gets a <strong>cache hit</strong>. Your origin sees a tiny
          fraction of the traffic — which is also why a CDN protects your server from spikes.
        </p>

        <h2 id="cloudfront">CloudFront in front of S3, step by step</h2>
        <p>
          The architecture: users → CloudFront → (only on a miss) → private S3 bucket. The bucket
          allows <em>only</em> that one CloudFront distribution to read it, via{" "}
          <strong>Origin Access Control (OAC)</strong>. The console is the friendliest way to create
          a distribution the first time:
        </p>
        <ol className="steps">
          <li>
            <h3>Create the distribution</h3>
            <p>
              CloudFront → Create distribution → Origin domain: pick your S3 bucket. For{" "}
              <strong>Origin access</strong>, choose <em>Origin access control settings (recommended)</em>{" "}
              and create a new OAC (signing: sign requests). Under Viewer protocol policy choose{" "}
              <em>Redirect HTTP to HTTPS</em>. Enable compression. Pick the cache policy{" "}
              <em>CachingOptimized</em>. Create.
            </p>
          </li>
          <li>
            <h3>Apply the bucket policy CloudFront shows you</h3>
            <p>
              After creation the console offers a ready-made policy. It looks like this — study it;
              it says &ldquo;only this distribution may read objects&rdquo;:
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
    "Resource": "arn:aws:s3:::myapp-uploads-abcd1234/*",
    "Condition": {
      "StringEquals": {
        "AWS:SourceArn": "arn:aws:cloudfront::123456789012:distribution/E1ABCDEF2GHIJK"
      }
    }
  }]
}`}
            />
            <p>
              The <code>Condition</code> is the important part: without it, <em>any</em> CloudFront
              distribution in the world could point at your bucket. Paste it in the bucket&apos;s
              Permissions → Bucket policy.
            </p>
          </li>
          <li>
            <h3>Test the two paths</h3>
            <p>
              Upload a test file. Then compare the direct S3 URL with the CloudFront one:
            </p>
            <CommandList
              title="Direct S3 is denied, CloudFront works"
              commands={[
                { cmd: "curl -I https://myapp-uploads-7f3a.s3.ap-south-1.amazonaws.com/assets/logo.png", note: "Direct to S3: 403 Forbidden — correct, the bucket is private" },
                { cmd: "curl -I https://d1234abcd.cloudfront.net/assets/logo.png", note: "Through CloudFront: 200 OK. Run it twice — the second says x-cache: Hit from cloudfront, served from the edge" },
              ]}
            />
          </li>
          <li>
            <h3>Use your own domain: assets.yourapp.com</h3>
            <p>
              The random <code>d1234abcd.cloudfront.net</code> name is ugly and ties you to it. To use{" "}
              <code>assets.yourapp.com</code>:
            </p>
            <ul>
              <li>
                Request an <strong>ACM certificate for <code>assets.yourapp.com</code> in{" "}
                <code>us-east-1</code> (N. Virginia)</strong>. CloudFront is a global service and only
                reads certificates from that one region — a common mistake, since everything else
                lives in Mumbai.
              </li>
              <li>Add it as an Alternate domain name on the distribution and select the certificate.</li>
              <li>
                In Route 53 (Lesson 13) create an <em>alias</em> A record{" "}
                <code>assets.yourapp.com</code> → the distribution.
              </li>
            </ul>
          </li>
        </ol>

        <h2 id="caching">Cache control, cache busting and invalidation</h2>
        <p>
          A cache has a hard problem: <strong>when the original changes, how do the copies find
          out?</strong> There are three strategies, and the best one is to avoid the problem.
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
                <td>Let the TTL (<code>max-age</code>) expire</td>
                <td>Simple, but users see stale files until it does</td>
              </tr>
              <tr>
                <td><strong>Invalidate</strong></td>
                <td>Create an <strong>invalidation</strong> for <code>/assets/logo.png</code> on the distribution</td>
                <td>Works. First 1,000 paths/month free, then $0.005 each. Takes a minute or two. A fix, not a habit</td>
              </tr>
              <tr>
                <td><strong>Versioned file names</strong></td>
                <td><code>app.a1b2c3.js</code>, <code>logo-v7.png</code> — a new name whenever the content changes</td>
                <td><strong>Best.</strong> No invalidation ever; cache forever</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Next.js already does the third one for you: <code>/_next/static/chunks/main-8f3a2c.js</code>{" "}
          has a content hash in its name, so it can carry <code>Cache-Control: public,
          max-age=31536000, immutable</code>. For your own uploads, use the same trick: never
          overwrite a key — upload to a new UUID key and store the new key in the database.
        </p>
        <Callout kind="warn" label="Do not cache what is personal">
          <p className="mb-0">
            A CDN is a shared cache. HTML pages that differ per user, API responses with private
            data, anything behind a login — must not be cached at the edge, or one user can receive
            another&apos;s page. Cache only static, public, versioned files; send{" "}
            <code>Cache-Control: private, no-store</code> for the rest. Private user files (invoices)
            belong behind presigned URLs, not a public CDN path.
          </p>
        </Callout>

        <h2 id="nextjs">Using it from Next.js</h2>
        <p>
          Two common ways to put the CDN to work. First, serve your built <code>/_next/static</code>{" "}
          files from it by setting an asset prefix. Next.js then writes those URLs into the HTML, and
          they load from the edge instead of your server:
        </p>
        <Script
          title="next.config.ts"
          code={`import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Production only, so local development keeps working with no CDN
  assetPrefix: process.env.NODE_ENV === "production" ? "https://assets.yourapp.com" : undefined,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "assets.yourapp.com" }],
  },
};

export default nextConfig;`}
        />
        <p>
          Then upload the static build output as part of your deploy (this belongs in the CI pipeline
          of Lesson 14):
        </p>
        <Script
          title="deploy step"
          code={`aws s3 sync .next/static s3://myapp-uploads-7f3a/_next/static \\
  --cache-control "public, max-age=31536000, immutable"`}
        />
        <Callout kind="note" label="Order matters when deploying">
          <p className="mb-0">
            Upload the new static files <strong>before</strong> switching the servers to the new
            build. Otherwise a user can receive new HTML that references a hashed file that is not in
            S3 yet, and get a broken page for a minute. Old files should stay for a while for the
            same reason, in the other direction (pages still open in browsers).
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
          For a startup&apos;s image and asset traffic this is usually a few dollars a month, and
          often <em>cheaper</em> than serving the same bytes from EC2, because data leaving EC2 is
          billed but S3-to-CloudFront is free. Check the current pricing pages.
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
                  Server authenticates the user and returns a short-lived presigned PUT URL scoped
                  to one key and content type; the browser uploads directly to S3 (bucket CORS
                  configured). Server stores the key. It removes size limits and server load.
                </p>
              ),
            },
            {
              q: "How do you serve private S3 content through CloudFront?",
              a: (
                <p className="mb-0">
                  Keep the bucket private with Block Public Access, create a CloudFront distribution
                  with Origin Access Control, and add a bucket policy that allows only that
                  distribution (condition on <code>AWS:SourceArn</code>). For per-user private
                  files, use signed URLs or cookies.
                </p>
              ),
            },
            {
              q: "You replaced an image but users still see the old one. Why, and what is the right fix?",
              a: (
                <p className="mb-0">
                  CloudFront (and browsers) are serving the cached copy until the TTL expires. A
                  one-off fix is an invalidation. The correct design is content-hashed or versioned
                  file names with long <code>max-age</code>, so a change is a new URL.
                </p>
              ),
            },
            {
              q: "Why must a CloudFront ACM certificate be in us-east-1?",
              a: (
                <p className="mb-0">
                  CloudFront is a global service whose control plane reads certificates from N.
                  Virginia. Regional services such as an ALB use certificates from their own region.
                </p>
              ),
            },
            {
              q: "S3 durability vs availability?",
              a: (
                <p className="mb-0">
                  Durability (11 nines) is the chance an object is not lost over a year — data is
                  stored redundantly across multiple facilities. Availability (99.99% for Standard)
                  is the chance a request succeeds at a given moment. Different numbers, different
                  guarantees.
                </p>
              ),
            },
            {
              q: "A cross-tenant data leak: customer A saw customer B's file. Where could S3 be the cause?",
              a: (
                <p className="mb-0">
                  Guessable keys (sequential or user-supplied), a presigned URL issued without
                  checking tenant ownership, a shared CDN path caching a private response, or an IAM
                  policy broader than the tenant prefix. Fix with tenant-prefixed random keys,
                  authorisation before signing, and no CDN caching of private content.
                </p>
              ),
            },
            {
              q: "Why turn on versioning, and what is the catch?",
              a: (
                <p className="mb-0">
                  Recover from accidental overwrite/delete and ransomware-style changes. The catch
                  is cost: old versions accumulate, so pair it with a lifecycle rule that expires
                  noncurrent versions.
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
            Attach the bucket policy to <code>myapp-ec2-role</code> and confirm, from the server with
            no keys, that you can list this bucket but not another.
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
          S3 stores files safely and cheaply; CloudFront delivers them quickly. Together they take
          the heaviest, most repetitive work away from your servers and make those servers
          disposable.
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
            <strong>Version your file names</strong> so a CDN can cache forever and you never
            invalidate; lifecycle rules keep the bill tidy.
          </li>
          <li>
            <strong>ACM for CloudFront lives in us-east-1</strong> — the surprise to remember.
          </li>
        </ul>
        <p>
          With state pushed out to RDS and S3, your app servers are finally stateless. That is the
          precondition for the next lesson: running many of them behind a load balancer.
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
