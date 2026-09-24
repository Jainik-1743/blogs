import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { AsciiDiagram, Compare, Flow, QA } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-17")!;

export const metadata: Metadata = {
  title: `Lesson 17 — ${lesson.title}`,
  description: lesson.summary,
};

/** In-page index. Each entry links to a section heading below. */
const outline = [
  { id: "the-problem", label: "The Problem" },
  { id: "the-core-idea", label: "The Core Idea" },
  { id: "how-it-works", label: "How It Works" },
  { id: "trade-offs", label: "Trade-offs" },
  { id: "in-the-real-world", label: "In the Real World" },
  { id: "interview-questions", label: "Interview Questions" },
  { id: "key-takeaways", label: "Key Takeaways" },
  { id: "further-reading", label: "Further Reading" },
];

const code1 = `PUT    /myapp-user-uploads/users/42/avatar.jpg     (upload)
GET    /myapp-user-uploads/users/42/avatar.jpg     (download)
DELETE /myapp-user-uploads/users/42/avatar.jpg     (delete)
GET    /myapp-user-uploads?prefix=users/42/        (list keys)`;

const diagram1 = `photos table
┌────┬─────────┬───────────────────────────────┬────────┬─────────────┐
│ id │ user_id │ storage_key                   │ size   │ uploaded_at │
├────┼─────────┼───────────────────────────────┼────────┼─────────────┤
│ 17 │ 42      │ users/42/photos/17-orig.jpg   │ 2.1 MB │ 2026-11-01  │
└────┴─────────┴───────────────────────────────┴────────┴─────────────┘`;

const diagram2 = `          ┌──────────────────┐
Client ──►│  API / front end │  auth, routing
          └───┬─────────┬────┘
              ▼         ▼
   ┌────────────────┐  ┌──────────────────────┐
   │ Metadata store │  │   Data nodes         │
   │ key → location │  │ (disks storing       │
   │ size, version  │  │  object pieces,      │
   └────────────────┘  │  replicated/erasure- │
                       │  coded across zones) │
                       └──────────────────────┘`;

export default function SdLessonOneSevenPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            Your app lets users upload profile pictures, and you save them to the server's disk in <code>/uploads</code>
            . Then:
          </p>
          <ul>
            <li>
              You add a second server (post 7). Half the images now "disappear", because they're on the other machine's
              disk.
            </li>
            <li>The disk fills up.</li>
            <li>A server dies and takes a year of uploads with it.</li>
            <li>
              Someone suggests "just put the images in the database as BLOBs", and your database backups go from 5 GB to
              500 GB.
            </li>
          </ul>
          <p>
            Images, videos, PDFs, backups and logs need a different kind of storage: <strong>object storage</strong>,
            the kind made famous by Amazon S3.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think of a <strong>cloakroom</strong> at a big event or a railway station.
          </p>
          <ul>
            <li>
              You hand over your bag and get a <strong>ticket number</strong>.
            </li>
            <li>You don't care which shelf it's on, or how the room is organised.</li>
            <li>Later, you show the ticket and get your bag back.</li>
            <li>The cloakroom can hold millions of bags, and staff keep copies of the records so nothing gets lost.</li>
          </ul>
          <p>Object storage works the same way:</p>
          <ul>
            <li>
              You store a file (the <strong>object</strong>) with a name (the <strong>key</strong>) inside a{" "}
              <strong>bucket</strong>.
            </li>
            <li>You get it back later by its key, over HTTP.</li>
            <li>The service handles where it lives, copying it for safety, and growing without limit.</li>
          </ul>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="three-kinds-of-storage">Three kinds of storage</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Think of it as</th>
                  <th>Example</th>
                  <th>Good for</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Block storage</strong>
                  </td>
                  <td>A raw hard drive attached to one server</td>
                  <td>AWS EBS, a local SSD</td>
                  <td>Databases, operating system disks</td>
                </tr>
                <tr>
                  <td>
                    <strong>File storage</strong>
                  </td>
                  <td>A shared network folder with directories</td>
                  <td>NFS, AWS EFS</td>
                  <td>Shared files between servers, legacy apps</td>
                </tr>
                <tr>
                  <td>
                    <strong>Object storage</strong>
                  </td>
                  <td>A giant key → file store accessed over HTTP</td>
                  <td>Amazon S3, Google Cloud Storage, Azure Blob, Cloudflare R2, MinIO</td>
                  <td>Images, videos, backups, logs, static sites, data lakes</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3 id="the-object-model">The object model</h3>
          <ul>
            <li>
              <strong>Bucket:</strong> a top-level container, like <code>myapp-user-uploads</code>.
            </li>
            <li>
              <strong>Key:</strong> the object's name, like <code>users/42/avatar.jpg</code>.
            </li>
            <li>
              <strong>Object:</strong> the data (from a few bytes up to many terabytes) plus <strong>metadata</strong>{" "}
              (content type, size, custom tags).
            </li>
          </ul>
          <p>
            There are <strong>no real folders</strong>. <code>users/42/avatar.jpg</code> is just a key that happens to
            contain slashes. Tools <em>show</em> it like folders by grouping keys with the same <strong>prefix</strong>.
          </p>
          <p>You work with objects through a simple HTTP API:</p>
          <CodeBlock lang="http" code={code1} />
          <p>
            Objects are usually <strong>replaced whole</strong>, not edited in place. To change one byte of a video, you
            upload the whole object again (or a new version).
          </p>
          <h3 id="why-it-s-so-durable">Why it's so durable</h3>
          <p>
            Object stores are designed so data is <strong>almost never lost</strong>:
          </p>
          <ul>
            <li>
              Each object is stored on <strong>many disks, in multiple data centres</strong> (availability zones).
            </li>
            <li>
              Many systems use <strong>erasure coding</strong>: data is split into pieces plus extra "parity" pieces, so
              the original can be rebuilt even if several pieces are lost. It's a bit like being able to finish a jigsaw
              even with a few pieces missing. It uses less space than keeping three full copies.
            </li>
            <li>Background processes constantly check for damaged copies and repair them.</li>
          </ul>
          <p>
            Amazon S3 is designed for <strong>99.999999999% durability</strong> ("eleven nines"). In practice, you're
            far more likely to lose data by <strong>deleting it yourself</strong> than through S3 losing it. That's why
            versioning and backups still matter.
          </p>
          <h3 id="consistency">Consistency</h3>
          <p>
            Since December 2020, Amazon S3 provides <strong>strong read-after-write consistency</strong>: after a
            successful upload or overwrite, any read gets the new version. Before that, you could sometimes read an old
            version shortly after updating. Other providers offer similar guarantees today, but check the documentation
            of the one you use.
          </p>
          <h3 id="uploads-and-downloads-without-your-servers">Uploads and downloads without your servers</h3>
          <p>
            A key pattern: <strong>don't send file bytes through your app servers.</strong> Instead, use{" "}
            <strong>pre-signed URLs</strong>, which are temporary, signed links that let a client upload or download one
            specific object directly.
          </p>
          <SequenceDiagram
            caption="Direct upload with a pre-signed URL. The file bytes never pass through your servers."
            actors={["Browser", "Your API", "Object storage", "Database"]}
            messages={[
              { from: 0, to: 1, label: <>I want to upload avatar.jpg</> },
              { from: 1, to: 1, label: <>check user may upload; sign a PUT URL, valid 5 min</> },
              { from: 1, to: 0, label: <>pre-signed URL</>, reply: true },
              { from: 0, to: 2, label: <>PUT users/42/avatar.jpg</>, note: <>2 MB, straight to storage</> },
              { from: 2, to: 0, label: <>200 OK</>, reply: true },
              { from: 0, to: 1, label: <>upload done</>, note: <>or storage emits an event</> },
              { from: 1, to: 3, label: <>user 42 avatar = users/42/avatar.jpg</> },
            ]}
          />
          <p>The benefits:</p>
          <ul>
            <li>Your servers never handle heavy file traffic, so they stay small and fast.</li>
            <li>Uploads scale with the storage service, not with your app.</li>
            <li>
              Files stay <strong>private</strong>. Only people with a valid, short-lived link can access them.
            </li>
          </ul>
          <p>
            For <strong>large files</strong>, use <strong>multipart upload</strong>: split the file into parts (say 10
            MB each), upload them in parallel, and retry only failed parts. For <strong>video playback</strong>, clients
            can use <strong>range requests</strong> to download just the part they need.
          </p>
          <h3 id="serving-files-to-users">Serving files to users</h3>
          <p>
            For public content (product images, avatars), put a <strong>CDN</strong> in front of the bucket (post 14).
            Users get fast, nearby copies, and you pay less for bandwidth. For private content, give out pre-signed
            download URLs, or have the CDN check access.
          </p>
          <h3 id="what-goes-in-the-database-vs-object-storage">What goes in the database vs object storage</h3>
          <ul>
            <li>
              <strong>Object storage:</strong> the file itself. <code>users/42/avatar.jpg</code> is 2 MB.
            </li>
            <li>
              <strong>Database:</strong> the metadata. Who owns it, the key, size, type, upload time, maybe a thumbnail
              key.
            </li>
          </ul>
          <AsciiDiagram text={diagram1} />
          <p>
            <strong>Why not store images as BLOBs in the database?</strong>
          </p>
          <ul>
            <li>They make the database huge, backups slow, and replicas expensive.</li>
            <li>
              They waste the database's precious memory and I/O on data that doesn't need queries or transactions.
            </li>
            <li>
              Object storage is <strong>much cheaper per GB</strong> and built for exactly this.
            </li>
          </ul>
          <h3 id="storage-classes-and-lifecycle-rules">Storage classes and lifecycle rules</h3>
          <p>
            Not all files are used equally. Object stores offer <strong>storage classes</strong> at different prices:
          </p>
          <ul>
            <li>
              <strong>Standard:</strong> frequently accessed. Higher storage price, cheap to read.
            </li>
            <li>
              <strong>Infrequent access:</strong> cheaper storage, but a fee each time you read.
            </li>
            <li>
              <strong>Archive (like S3 Glacier):</strong> very cheap storage, but retrieval can take minutes to hours.
            </li>
          </ul>
          <p>
            <strong>Lifecycle rules</strong> move or delete objects automatically. For example: "move logs to infrequent
            access after 30 days, to archive after 90 days, and delete after 7 years". This can cut storage bills a lot.
          </p>
          <h3 id="other-useful-features">Other useful features</h3>
          <ul>
            <li>
              <strong>Versioning:</strong> keep old versions when objects are overwritten or deleted. It protects
              against accidents.
            </li>
            <li>
              <strong>Event notifications:</strong> "a new object was uploaded", which triggers a function or queue to
              create thumbnails, scan for viruses or transcode videos.
            </li>
            <li>
              <strong>Encryption at rest:</strong> usually on by default.
            </li>
            <li>
              <strong>Access policies:</strong> control who can read and write each bucket.
            </li>
          </ul>
          <h3 id="how-an-s3-like-system-is-built-simplified">How an S3-like system is built (simplified)</h3>
          <AsciiDiagram text={diagram2} />
          <ul>
            <li>
              The <strong>metadata service</strong> is like a giant index: "<code>users/42/avatar.jpg</code> is stored
              as pieces on nodes 17, 203 and 881".
            </li>
            <li>
              The <strong>data nodes</strong> store the actual bytes.
            </li>
            <li>
              Separating them lets each scale independently, which is the same design idea behind many large storage
              systems.
            </li>
          </ul>
          <Compare
            caption="Three kinds of storage, three jobs."
            columns={[
              {
                title: <>Block storage</>,
                items: [
                  { sign: "·", text: <>A raw disk attached to one server</> },
                  { sign: "+", text: <>Lowest latency; random reads and writes</> },
                  { sign: "-", text: <>One machine at a time</> },
                ],
                verdict: <>Database files, OS disks (AWS EBS)</>,
              },
              {
                title: <>File storage</>,
                items: [
                  { sign: "·", text: <>A shared network folder</> },
                  { sign: "+", text: <>Many servers, normal file paths</> },
                  { sign: "-", text: <>Harder to scale; slower metadata</> },
                ],
                verdict: <>Shared files, legacy apps (NFS, EFS)</>,
              },
              {
                title: <>Object storage</>,
                items: [
                  { sign: "·", text: <>Key → object over HTTP</> },
                  { sign: "+", text: <>Unlimited scale, 11 nines durability, cheap per GB</> },
                  { sign: "-", text: <>Tens of ms per request; replace whole objects</> },
                ],
                verdict: <>Images, video, backups, logs, data lakes (S3)</>,
              },
            ]}
          />
          <Flow
            caption="Lifecycle rules move data to cheaper classes as it cools, automatically."
            nodes={[
              { title: <>Standard</>, desc: <>days 0–30 — read often, cheap to read</> },
              { title: <>Infrequent access</>, desc: <>days 30–90 — cheaper to store, fee per read</> },
              { title: <>Archive (Glacier)</>, desc: <>90 days → 7 years — pennies per GB, hours to retrieve</> },
              { title: <>Delete</>, desc: <>after 7 years, by rule</>, tone: "muted" },
            ]}
          />
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              ✅ Virtually <strong>unlimited scale</strong>, very <strong>high durability</strong>, and a{" "}
              <strong>low cost per GB</strong>.
            </li>
            <li>✅ A simple HTTP API, and it works well with CDNs.</li>
            <li>
              ❌ <strong>Higher latency</strong> than a local disk (tens of milliseconds per request), so it's not for
              database files.
            </li>
            <li>
              ❌ <strong>No partial updates.</strong> You replace objects whole.
            </li>
            <li>
              ❌ <strong>Not a file system.</strong> Listing millions of keys or renaming "folders" is slow and awkward.
            </li>
            <li>
              ❌ <strong>Costs can surprise you:</strong> data transfer out (egress), per-request charges, and retrieval
              fees for archive classes.
            </li>
            <li>
              ❌ <strong>Misconfigured public buckets</strong> are a common cause of data leaks. Keep buckets private by
              default.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Amazon S3</strong> launched in 2006 and became one of the foundations of cloud computing. Its API is
            now a de facto standard. Many other products (Google Cloud Storage, Cloudflare R2, MinIO, Backblaze B2 and
            others) offer S3-compatible APIs, so the same code works with them.
          </p>
          <p>
            <strong>Dropbox's Magic Pocket.</strong> Dropbox originally stored users' files on Amazon S3. Around 2016 it
            moved most of that data to its own custom storage system, Magic Pocket, to save costs and gain control at
            its scale. It's a good example of "build vs buy" changing as a company grows.
          </p>
          <p>
            <strong>Facebook's Haystack.</strong> Facebook designed a special photo storage system called Haystack,
            because storing billions of small photos as individual files on regular file systems wasted time on metadata
            lookups. Its paper (OSDI 2010) is a classic on designing storage for many small objects.
          </p>
          <p>
            <strong>Everyday apps.</strong> When you upload a photo to a messaging or social app, it usually goes (often
            via a pre-signed URL) to object storage. An event triggers resizing into several sizes, and the app shows it
            back to you through a CDN. This is the exact flow described above.
          </p>
          <p>
            <strong>Data leaks from public buckets.</strong> There have been many news stories about companies
            accidentally exposing private files by making storage buckets public. That's why modern cloud providers
            block public access by default and show warnings when you change it.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>Why not store user-uploaded images in the database?</>,
                a: (
                  <>
                    <p>
                      They bloat the database, slow backups and replicas, and waste the database's memory and I/O on
                      bytes that never need queries or transactions. Object storage is far cheaper per GB and built for
                      it; the database keeps only metadata and the object key.
                    </p>
                  </>
                ),
              },
              {
                q: <>How would you design file uploads for a mobile app?</>,
                a: (
                  <>
                    <p>
                      The app asks the API for a pre-signed PUT URL (after an authorisation check), uploads directly to
                      object storage — multipart for large files — then confirms. A storage event triggers workers for
                      thumbnails, virus scanning or transcoding, and files are served through a CDN.
                    </p>
                  </>
                ),
              },
              {
                q: <>What makes object storage so durable?</>,
                a: (
                  <>
                    <p>
                      Each object is stored redundantly across many disks in several availability zones, often with
                      erasure coding (data plus parity pieces), and background processes continuously detect and repair
                      damaged pieces. S3 is designed for 11 nines of durability — your own deletes are the bigger risk,
                      hence versioning.
                    </p>
                  </>
                ),
              },
              {
                q: <>What are pre-signed URLs, and why are they safe?</>,
                a: (
                  <>
                    <p>
                      Time-limited URLs signed with your credentials that grant one operation on one object. The bucket
                      stays private; your API decides who gets a link, and it expires within minutes.
                    </p>
                  </>
                ),
              },
              {
                q: <>Where do object-storage costs surprise people?</>,
                a: (
                  <>
                    <p>
                      Egress (data transferred out), per-request charges on many small objects, and retrieval fees and
                      delays for archive classes. A CDN in front and lifecycle rules usually help most.
                    </p>
                  </>
                ),
              },
            ]}
          />
        </Section>

        <Section id="key-takeaways" title="Key Takeaways" kind="takeaways">
          <ul>
            <li>
              <strong>Object storage</strong> keeps files as <strong>objects</strong> in <strong>buckets</strong>,
              addressed by <strong>keys</strong> over HTTP. It's built for huge scale and high durability.
            </li>
            <li>
              Store <strong>files in object storage</strong> and <strong>metadata in the database</strong>. Don't put
              large files in your database.
            </li>
            <li>
              Use <strong>pre-signed URLs</strong> so clients upload and download <strong>directly</strong>, not through
              your servers. Use <strong>multipart upload</strong> for big files.
            </li>
            <li>
              Put a <strong>CDN</strong> in front for fast delivery, and use{" "}
              <strong>storage classes and lifecycle rules</strong> to control cost.
            </li>
            <li>
              Keep buckets <strong>private by default</strong>, enable <strong>versioning</strong> for important data,
              and watch <strong>egress costs</strong>.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>The Amazon S3 User Guide (official documentation)</li>
            <li>
              <em>System Design Interview Volume 2</em> by Alex Xu and Sahn Lam (chapter "S3-like Object Storage")
            </li>
            <li>The paper "Finding a needle in Haystack: Facebook's photo storage" (OSDI 2010)</li>
            <li>Werner Vogels' article on S3 strong consistency ("Diving Deep on S3 Consistency")</li>
            <li>The MinIO documentation (an open-source S3-compatible object store you can run locally)</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
