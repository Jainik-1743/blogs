import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import CommandList from "@/components/CommandList";
import FilesystemTree from "@/components/figures/FilesystemTree";
import PermissionBits from "@/components/figures/PermissionBits";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { getLesson, READINGS, readingHref, SERIES } from "@/lib/lessons";

const piecesReading = READINGS.find((r) => r.slug === "the-pieces")!;

const lesson = getLesson("lesson-1")!;

export const metadata: Metadata = {
  title: `Lesson 1 — ${lesson.title}`,
  description: lesson.summary,
};

/** In-page index. Each entry links to a section heading below. */
const outline = [
  { id: "concept", label: "Concept: four things to be comfortable with" },
  { id: "why-this-matters", label: "Why this matters — 2am on EC2" },
  { id: "architecture", label: "Architecture — the Linux filesystem" },
  { id: "real-example", label: "Real example — deploying your Next.js app manually" },
  { id: "navigation", label: "Part A: Navigation" },
  { id: "files", label: "Part B: Files and folders" },
  { id: "permissions", label: "Part C: Permissions — the most important part" },
  { id: "users", label: "Part D: Users and sudo" },
  { id: "processes", label: "Part E: Processes — why your app dies" },
  { id: "disk", label: "Part F: Disk and system health" },
  { id: "editing", label: "Part G: Editing files" },
  { id: "practice", label: "Practice task before Lesson 2" },
  { id: "sharing", label: "Follow-up: let one user read a file, but not another" },
  { id: "conclusion", label: "Conclusion" },
];

export default function LessonOnePage() {
  return (
    <article>
      <header className="mb-8 border-b border-line pb-6">
        <nav className="mb-4 font-mono text-[0.8rem] text-ink-dim" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-sky">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/${SERIES.slug}`} className="hover:text-sky">{SERIES.title}</Link>
          <span className="mx-2">/</span>
          <span>Lesson {String(lesson.number).padStart(2, "0")}</span>
        </nav>
        <p className="mb-2 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">
          Lesson 1 · {lesson.readTime} read
        </p>
        <h1 className="mb-2 text-[2.4rem] font-bold leading-tight tracking-tight text-sky max-sm:text-[2rem]">
          {lesson.title}
        </h1>
        <p className="max-w-[60ch] text-[1.15rem] text-ink-dim">{lesson.summary}</p>
      </header>

      <section className="mb-10 rounded-xl border border-line bg-bg-elev px-6 py-5" aria-labelledby="learn">
        <h2 id="learn" className="mb-2 text-[1.1rem] font-semibold text-sky">
          What you&apos;ll learn in this lesson
        </h2>
        <ol className="m-0 list-decimal pl-5 marker:text-sky">
          {outline.map((item) => (
            <li key={item.id} className="my-1">
              <a href={`#${item.id}`} className="text-ink hover:text-sky">
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </section>

      <div className="lesson">
        <h2 id="concept">Concept</h2>
        <p>
          A typical EC2 server runs Linux and has no screen, no mouse and no GUI (no windows or
          buttons). Your only way in is a text terminal over SSH. SSH (Secure Shell) is a way to
          log in to another computer over the network and type commands on it. A terminal is a
          text window where you type commands. Before EC2 makes sense, you need to be comfortable
          with four things: <strong>navigating the filesystem, permissions, users, and
          processes</strong>.
        </p>
        <p>
          As a Next.js developer, you already use a terminal every day (<code>npm run dev</code>,{" "}
          <code>git push</code>). You are not starting from zero. You are learning the system
          that <em>those commands run on</em>.
        </p>

        <h2 id="why-this-matters">Why this matters</h2>
        <p>
          When your Next.js app breaks on EC2 at 2am, there is no Vercel dashboard to help you.
          You will ask questions like: &ldquo;why is the process dead?&rdquo;, &ldquo;is port
          3000 actually listening?&rdquo;, &ldquo;did the disk fill up?&rdquo;, &ldquo;why can&apos;t
          Node read this file?&rdquo; Each of these is a Linux question, not an AWS question.
          Vercel hides this layer. AWS shows it to you.
        </p>

        <h2 id="architecture">Architecture — the Linux filesystem</h2>
        <p>
          Windows has separate drives (<code>C:\</code>, <code>D:\</code>). Linux has <strong>one
          single tree</strong> that starts at <code>/</code> (called the &ldquo;root&rdquo; folder).
          Everything lives somewhere in this one tree: your app, your settings, even your devices.
        </p>
        <FilesystemTree />
        <p>
          You will use two folders most. <code>/home/ubuntu</code> is where your Next.js code
          sits. <code>/var/log</code> is where you look when things break.
        </p>

        <h2 id="real-example">Real example — deploying your Next.js app manually</h2>
        <p>
          Here are the steps you will run in Lesson 7. They show why each Linux skill matters:
        </p>
        <ol className="steps">
          <li>
            <h3>SSH into the server</h3>
            <p>needs: SSH and key file permissions</p>
          </li>
          <li>
            <h3>Install Node.js</h3>
            <p>needs: a package manager (a tool that installs software, such as apt) and sudo</p>
          </li>
          <li>
            <h3>Clone your repo into <code>/home/ubuntu/myapp</code></h3>
            <p>needs: filesystem navigation</p>
          </li>
          <li>
            <h3>Create a <code>.env</code> file with your DB password</h3>
            <p>needs: file editing and permissions</p>
          </li>
          <li>
            <h3>Run <code>npm run build &amp;&amp; npm start</code></h3>
            <p>needs: process management</p>
          </li>
          <li>
            <h3>It crashes when you close the terminal</h3>
            <p>needs: understanding background processes</p>
          </li>
        </ol>
        <p>Most people get stuck at step 6. This lesson shows the proper fix.</p>

        <hr />

        <h2 id="navigation">Part A: Moving around and reading files</h2>
        <p>
          A terminal is always &ldquo;standing&rdquo; in one folder. You ask where you are, list
          what is there, and step into another folder. It is like clicking through folders in
          Finder, but you type. <code>~</code> is a shortcut for your home folder. <code>..</code>{" "}
          means &ldquo;one folder up&rdquo;.
        </p>
        <p>
          You will read files a lot on a server, because that is how you read logs. A log is a
          file where a program writes what it is doing. You can print a whole file, page through
          a big one, or see only the last few lines. The most useful way is <strong>following</strong>{" "}
          a file. The terminal stays open, and new lines appear as soon as your app writes them.
          This live view lets you watch a bug happen.
        </p>

        <h2 id="files">Part B: Files and folders</h2>
        <p>
          Creating, copying, moving and deleting files works as you expect. But remember: Linux
          has <strong>no recycle bin</strong>. A recursive delete (<code>rm -r</code>) removes a
          folder and everything inside it at once and for ever. It does not ask &ldquo;are you
          sure?&rdquo;.
        </p>
        <Callout kind="warn" label="Careful">
          <p className="mb-0">
            Before you delete anything recursively, check which folder you are in. Running it one
            level too high is a common way to wipe a server.
          </p>
        </Callout>

        <h2 id="permissions">Part C: Permissions — the most important part</h2>
        <p>
          Permissions are rules about who may read, change or run a file. Every file has
          permissions for three kinds of people: the <strong>owner</strong>, a{" "}
          <strong>group</strong> (a named set of users) and <strong>others</strong> (everyone
          else). Each kind can have read (4), write (2) and execute (1, which means run it as a
          program). A file listing shows them as nine letters, for example{" "}
          <code>rw-r--r--</code>. This means the owner can read and write, the group can only
          read, and others can only read.
        </p>
        <PermissionBits />
        <p>
          Add the numbers to get one digit. Write three digits in this order: owner, group,
          others. For example, read + write = 4 + 2 = 6. Three values cover almost everything you
          will do:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Value</th>
                <th>Meaning</th>
                <th>Use it for</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>644</code></td>
                <td>you read and write, everyone else only reads</td>
                <td>normal files, public web files</td>
              </tr>
              <tr>
                <td><code>600</code></td>
                <td>you read and write, nobody else can do anything</td>
                <td><code>.env</code>, passwords, API keys</td>
              </tr>
              <tr>
                <td><code>400</code></td>
                <td>you can only read, nobody else can do anything</td>
                <td>SSH private keys (SSH needs this)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <strong>You will meet this error in Lesson 7</strong>: SSH prints
          &ldquo;UNPROTECTED PRIVATE KEY FILE! Permissions 0644 ... are too open&rdquo; and
          refuses to connect. SSH will not use a key that another user on the machine could read.
          Setting the key to <code>400</code> fixes it.
        </p>

        <h2 id="users">Part D: Users and sudo</h2>
        <p>
          You log in as a normal user. On an Ubuntu EC2 server that user is <code>ubuntu</code>.
          Some commands need admin power, such as installing software or changing system
          settings. For those, type <code>sudo</code> in front of the command. <code>sudo</code>{" "}
          means &ldquo;superuser do&rdquo;: it runs that one command as the admin (the{" "}
          <strong>root</strong> user). After the command ends, you are a normal user again.
        </p>
        <p>
          Rule: do not switch to the root user and stay there. As root, one wrong delete can
          destroy the server, and nothing stops you.
        </p>

        <h2 id="processes">Part E: Processes — why your app dies</h2>
        <p>
          A <strong>process</strong> is a program that is running right now. Each process has a
          number called its PID (process ID). You can list processes, filter the list for{" "}
          <code>node</code>, watch live CPU and memory use, and stop a process by its number. You
          can also ask &ldquo;which process is using port 3000?&rdquo;. A port is a numbered door
          on the server (Lesson 2 explains it). Ask this first when your app &ldquo;starts&rdquo;
          but nothing answers.
        </p>
        <p>
          The <code>|</code> character is a <strong>pipe</strong>. It sends the output of one
          command into the next command. So &ldquo;list everything, then keep only the lines with
          node&rdquo; fits in one line.
        </p>

        <h3>Solving &ldquo;my app dies when I close the terminal&rdquo;</h3>
        <p>
          When you run <code>npm start</code> over SSH, the app is a <em>child</em> of your
          terminal session. When you close the session, Linux stops its children too. There are
          three levels of fix:
        </p>
        <ol>
          <li>
            <strong>Detach it from the terminal</strong> (for example with <code>nohup</code> or{" "}
            <code>&amp;</code>). It survives when you disconnect, but if it crashes it stays dead.
            This is fine for a quick test.
          </li>
          <li>
            <strong>Run it inside a terminal session that keeps living</strong> (a tool like
            tmux). You can come back and look at it later. It still does not restart after a
            crash.
          </li>
          <li>
            <strong>Use a process manager (PM2)</strong>. A process manager is a program that
            keeps other programs running. PM2 restarts the app when it crashes, starts it again
            when the server reboots, and keeps its logs. This is the right answer for production.
            You will set it up in Lesson 7 (later, Docker takes over this job).
          </li>
        </ol>

        <h2 id="disk">Part F: Disk and system health</h2>
        <p>
          A full disk is a common cause of outages. <code>npm run build</code> fails with a
          confusing error, and logs quietly stop being written. So when something seems wrong,
          check free disk space first. Then check memory (RAM). Then check how busy the CPU is.
        </p>

        <h2 id="editing">Part G: Editing files</h2>
        <p>
          A server has no VS Code. Start with <code>nano</code>, a simple text editor in the
          terminal. It shows its shortcuts at the bottom of the screen (<code>Ctrl+O</code>{" "}
          saves, <code>Ctrl+X</code> exits). <code>vim</code> is more powerful but hard to learn.
          You can learn it later.
        </p>

        <h3>The five commands you will actually use</h3>
        <p>
          Try to understand everything above. But memorise these five. They answer the 2am
          questions from the top of this lesson.
        </p>
        <CommandList
          title="Keep these"
          commands={[
            { cmd: "tail -f app.log", note: "watch a log live: new lines appear as they happen" },
            { cmd: "chmod 600 .env", note: "only you can read your secrets" },
            { cmd: "chmod 400 key.pem", note: "the fix SSH demands for your key in Lesson 7" },
            { cmd: "ps aux | grep node", note: "is my app actually running?" },
            { cmd: "df -h", note: "is the disk full? check this first when something seems wrong" },
          ]}
        />

        <hr />

        <h2 id="practice">Practice task before Lesson 2</h2>
        <p>
          Do not launch an EC2 instance yet. On Mac or Linux your terminal already works in a
          similar way. On Windows, install WSL (Windows Subsystem for Linux). Run{" "}
          <code>wsl --install</code> in an administrator PowerShell, then restart. You then have
          real Ubuntu.
        </p>
        <Script
          title="practice.sh"
          code={`mkdir ~/practice && cd ~/practice
touch .env && chmod 600 .env
ls -la                      # .env should show -rw-------
df -h`}
        />
        <p>
          Then, without looking anything up, do these: create a file, read it page by page, delete
          it, and find any running <code>node</code> process. If you can, you are ready for
          servers.
        </p>

        <hr />

        <h2 id="sharing">Follow-up: let one user read a file, but not another</h2>
        <p>
          Say you want Rahul to read <code>report.txt</code>, and Amit to have no access. This is
          where the owner / group / others model becomes useful.
        </p>
        <ol>
          <li>Create a group for the people who may read the file. Add Rahul, not Amit.</li>
          <li>Give the file to that group. You stay the owner.</li>
          <li>
            Set it to <code>640</code>: you read and write, the group reads, and everyone else gets
            nothing.
          </li>
        </ol>
        <p>
          Now Rahul can read it, and Amit gets &ldquo;Permission denied&rdquo;. Rahul must log
          out and log in again before his new group counts.
        </p>
        <Callout kind="warn" label="Important: the folder also needs permission">
          <p className="mb-0">
            A readable file inside a locked folder is still out of reach. On a folder,{" "}
            <code>x</code> means &ldquo;can enter&rdquo; and <code>r</code> means &ldquo;can list
            what is inside&rdquo;. If the group does not have <code>x</code> on the folder, Rahul
            cannot reach the file, even though the file allows it. Many beginners get confused
            by this.
          </p>
        </Callout>
        <p>
          Linux also has <strong>ACLs</strong> (access control lists). An ACL gives or blocks
          access for one named user without using a group. ACLs work, but a normal file listing
          hides them (you only see a small <code>+</code>). The next person cannot tell why
          access behaves as it does. <strong>On real servers, prefer groups.</strong>
        </p>

        <h3>Where this matters on AWS</h3>
        <p>
          On your EC2 server this matters at once. Nginx is a web server program that sits in
          front of your app. It must <em>read</em> your built Next.js files but must never write
          them. So the build folder belongs to your user, and Nginx&apos;s group may read and
          enter it. Your <code>.env</code> file holds the RDS (database) password, so it is{" "}
          <code>600</code>: nobody else, ever. If it were <code>644</code>, any user or hacked
          process on that machine could read your database password.
        </p>

        <hr />

        <h2 id="conclusion">Conclusion</h2>
        <p>
          An EC2 server has no screen and no mouse, only a terminal. That is why Linux is a must
          in this course. What you learned today comes down to five ideas:
        </p>
        <ul>
          <li>
            <strong>Filesystem</strong>: everything lives in one tree starting at <code>/</code>.
            Your app goes in <code>/home/ubuntu</code>, logs go in <code>/var/log</code>.
          </li>
          <li>
            <strong>Permissions</strong>: <code>600</code> on <code>.env</code> means only you can read it.
            Use it for any file that holds a password. SSH refuses to use your key until it is{" "}
            <code>400</code>.
          </li>
          <li>
            <strong>sudo</strong>: run one command as admin, then go back to being a normal user.
            Never stay logged in as root. One typo can take down the whole server.
          </li>
          <li>
            <strong>Processes</strong>: if you close the terminal, your app dies with it. That is
            why you use <strong>PM2</strong>. It keeps the app running and restarts it after a
            crash.
          </li>
          <li>
            <strong>The commands you will use most</strong>: <code>tail -f</code> (watch live
            logs), <code>df -h</code> (is the disk full?), <code>ps aux | grep node</code> (is the
            app running?).
          </li>
        </ul>
        <p>
          You do not need EC2 to practise any of this. The terminal on Mac/Linux, or WSL on
          Windows, runs the same commands.
        </p>

        <hr />
        <p>
          End of Lesson 1. Next: <strong>Lesson 2 — Networking Basics</strong>.
        </p>
        <p>
          Want to know what PM2 and Nginx are before their lessons?{" "}
          <Link href={readingHref(piecesReading)}>{piecesReading.title} →</Link>
        </p>
      </div>

      <LessonPager slug={lesson.slug} />
    </article>
  );
}
