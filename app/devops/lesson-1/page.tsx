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
          Every EC2 server you launch is a Linux machine with no screen, no mouse, no GUI. Your
          only way in is a text terminal over SSH. So before EC2 makes any sense, you need to be
          comfortable with four things: <strong>navigating the filesystem, permissions, users, and
          processes</strong>.
        </p>
        <p>
          Good news: as a Next.js developer you already use a terminal daily (<code>npm run dev</code>,{" "}
          <code>git push</code>). You&apos;re not starting from zero — you&apos;re just learning
          what&apos;s <em>underneath</em> those commands.
        </p>

        <h2 id="why-this-matters">Why this matters</h2>
        <p>
          When your Next.js app breaks on EC2 at 2am, nobody gives you a Vercel dashboard.
          You&apos;ll be typing things like: &ldquo;why is the process dead?&rdquo;, &ldquo;is port
          3000 actually listening?&rdquo;, &ldquo;did the disk fill up?&rdquo;, &ldquo;why can&apos;t
          Node read this file?&rdquo; Every one of those is a Linux question, not an AWS question.
          This is the layer that Vercel hides and AWS exposes.
        </p>

        <h2 id="architecture">Architecture — the Linux filesystem</h2>
        <p>
          Unlike Windows (<code>C:\</code>, <code>D:\</code>), Linux has <strong>one single
          tree</strong> starting at <code>/</code> (called &ldquo;root&rdquo;). Everything — your
          app, your config, even your hardware — lives somewhere in this one tree.
        </p>
        <FilesystemTree />
        <p>
          The two you&apos;ll touch most: <code>/home/ubuntu</code> (where your Next.js code sits)
          and <code>/var/log</code> (where you go when things break).
        </p>

        <h2 id="real-example">Real example — deploying your Next.js app manually</h2>
        <p>
          Here&apos;s the actual sequence you&apos;ll run in Lesson 7, so you can see why each
          Linux skill matters:
        </p>
        <ol className="steps">
          <li>
            <h3>SSH into the server</h3>
            <p>needs: SSH + key permissions</p>
          </li>
          <li>
            <h3>Install Node.js</h3>
            <p>needs: package manager + sudo</p>
          </li>
          <li>
            <h3>Clone your repo into <code>/home/ubuntu/myapp</code></h3>
            <p>needs: filesystem navigation</p>
          </li>
          <li>
            <h3>Create a <code>.env</code> file with your DB password</h3>
            <p>needs: file editing + permissions</p>
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
        <p>Step 6 catches every beginner. We&apos;ll fix it properly today.</p>

        <hr />

        <h2 id="navigation">Part A: Moving around and reading files</h2>
        <p>
          A terminal is always &ldquo;standing&rdquo; in one folder. You ask where you are, list
          what is there, and step into another folder — the same as clicking through Finder, only
          typed. <code>~</code> is a shortcut for your home folder, and <code>..</code> means
          &ldquo;one folder up&rdquo;.
        </p>
        <p>
          Reading files is where you will spend most of your time on a server, because that is
          how you read logs. You can print a whole file, page through a big one, or look at only
          the last few lines. The one that matters most is <strong>following</strong> a file: the
          terminal stays open and new lines appear the moment your app writes them. That live view
          is how you watch a bug happen.
        </p>

        <h2 id="files">Part B: Files and folders</h2>
        <p>
          Creating, copying, moving and deleting files works exactly as you expect. The one thing
          to respect: Linux has <strong>no recycle bin</strong>. A recursive delete removes a
          folder and everything inside it, instantly and forever, with no &ldquo;are you
          sure?&rdquo;.
        </p>
        <Callout kind="warn" label="Careful">
          <p className="mb-0">
            Before deleting anything recursively, check which folder you are standing in. Running
            it one level too high is the classic way to wipe a server.
          </p>
        </Callout>

        <h2 id="permissions">Part C: Permissions — the most important part</h2>
        <p>
          Every file has permissions for three groups: <strong>owner</strong>,{" "}
          <strong>group</strong>, <strong>others</strong>. Each can have read (4), write (2),
          execute (1). A file listing shows them as nine letters, for example{" "}
          <code>rw-r--r--</code>: owner can read+write, group can only read, others can only read.
        </p>
        <PermissionBits />
        <p>
          Add the numbers to get each digit, and write the three digits in the order owner, group,
          others. Three values cover almost everything you will do:
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
                <td>you read+write, everyone else reads</td>
                <td>normal files, public web files</td>
              </tr>
              <tr>
                <td><code>600</code></td>
                <td>you read+write, nobody else anything</td>
                <td><code>.env</code>, passwords, API keys</td>
              </tr>
              <tr>
                <td><code>400</code></td>
                <td>you read only, nobody else anything</td>
                <td>SSH private keys (required)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <strong>You will hit this exact error in Lesson 7</strong>, guaranteed: SSH prints
          &ldquo;UNPROTECTED PRIVATE KEY FILE — permissions 0644 are too open&rdquo; and refuses
          to connect. SSH will not use a key that another user on the machine could read. Setting
          the key to <code>400</code> fixes it.
        </p>

        <h2 id="users">Part D: Users and sudo</h2>
        <p>
          You log in as a normal user (on EC2 that is <code>ubuntu</code>). When one command needs
          admin power — installing software, editing system config — you put <code>sudo</code>{" "}
          (&ldquo;superuser do&rdquo;) in front of that one command, and then you are a normal user
          again.
        </p>
        <p>
          Rule: don&apos;t switch to the root user and stay there. As root, one wrong delete
          destroys the server, and nothing stops you.
        </p>

        <h2 id="processes">Part E: Processes — why your app dies</h2>
        <p>
          Every running program is a <strong>process</strong> with a number (its PID). You can
          list them, filter the list for <code>node</code>, watch live CPU and memory, and stop one
          by its number. You can also ask &ldquo;which process is using port 3000?&rdquo; — the
          first question when your app &ldquo;starts&rdquo; but nothing answers.
        </p>
        <p>
          The <code>|</code> character is a <strong>pipe</strong>: it sends the output of one
          command into the next, so &ldquo;list everything, then keep only the lines with
          node&rdquo; is one line.
        </p>

        <h3>Solving &ldquo;my app dies when I close the terminal&rdquo;</h3>
        <p>
          When you run <code>npm start</code> over SSH, the app is a <em>child</em> of your
          terminal session. Close the session and Linux stops its children too. There are three
          levels of fix:
        </p>
        <ol>
          <li>
            <strong>Detach it from the terminal</strong> — it survives the disconnect, but if it
            crashes it stays dead. Fine for a quick test.
          </li>
          <li>
            <strong>Run it inside a terminal session that keeps living</strong> (a tool like
            tmux) — you can come back and look at it later. Still no restart on a crash.
          </li>
          <li>
            <strong>Use a process manager (PM2)</strong> — it restarts the app when it crashes,
            starts it again when the server reboots, and keeps its logs. This is the production
            answer, and what you will set up in Lesson 7 (later, Docker takes over this job).
          </li>
        </ol>

        <h2 id="disk">Part F: Disk and system health</h2>
        <p>
          A full disk is one of the most common production outages: <code>npm run build</code>{" "}
          fails with a confusing error, and logs silently stop being written. So when something
          is weird, check free disk space first, then memory, then how busy the CPU has been.
        </p>

        <h2 id="editing">Part G: Editing files</h2>
        <p>
          On a server there is no VS Code. Use <code>nano</code> to start — it shows its
          shortcuts at the bottom of the screen (<code>Ctrl+O</code> saves, <code>Ctrl+X</code>{" "}
          exits). <code>vim</code> is more powerful but has a steep learning curve; you can pick it
          up later.
        </p>

        <h3>The five commands you will actually use</h3>
        <p>
          Everything above is worth understanding. These five are worth memorising — they answer
          the 2am questions from the top of this lesson.
        </p>
        <CommandList
          title="Keep these"
          commands={[
            { cmd: "tail -f app.log", note: "watch a log live — new lines appear as they happen" },
            { cmd: "chmod 600 .env", note: "only you can read your secrets" },
            { cmd: "chmod 400 key.pem", note: "the fix SSH demands for your key in Lesson 7" },
            { cmd: "ps aux | grep node", note: "is my app actually running?" },
            { cmd: "df -h", note: "is the disk full? check this first when things are weird" },
          ]}
        />

        <hr />

        <h2 id="practice">Practice task before Lesson 2</h2>
        <p>
          Don&apos;t launch an EC2 instance yet. On Mac or Linux your terminal is already
          Linux-like. On Windows, install WSL (<code>wsl --install</code> in an admin PowerShell,
          then restart) and you have real Ubuntu.
        </p>
        <Script
          title="practice.sh"
          code={`mkdir ~/practice && cd ~/practice
touch .env && chmod 600 .env
ls -la                      # .env should show -rw-------
df -h`}
        />
        <p>
          Then, without looking anything up: create a file, read it page by page, delete it, and
          find any running <code>node</code> process. If you can, you&apos;re ready for servers.
        </p>

        <hr />

        <h2 id="sharing">Follow-up: let one user read a file, but not another</h2>
        <p>
          Say you want Rahul to read <code>report.txt</code>, and Amit to have no access. This is
          exactly where the owner / group / others model becomes practical.
        </p>
        <ol>
          <li>Create a group for the people who may read it, and add Rahul (not Amit).</li>
          <li>Hand the file to that group, keeping yourself as the owner.</li>
          <li>
            Set it to <code>640</code>: you read+write, the group reads, everyone else gets
            nothing.
          </li>
        </ol>
        <p>
          Now Rahul can read it and Amit gets &ldquo;Permission denied&rdquo;. Rahul has to log
          out and back in before his new group counts.
        </p>
        <Callout kind="warn" label="Important gotcha — the folder also needs permission">
          <p className="mb-0">
            A readable file inside a locked folder is still unreachable. On a folder,{" "}
            <code>x</code> means &ldquo;can enter&rdquo; and <code>r</code> means &ldquo;can list
            what is inside&rdquo;. If the group lacks <code>x</code> on the folder, Rahul can&apos;t
            reach the file even though the file itself allows it. This trips up almost everyone the
            first time.
          </p>
        </Callout>
        <p>
          Linux also has <strong>ACLs</strong> (access control lists), which grant or deny one
          specific user without a group. They work, but they are invisible in a normal file
          listing (you only see a small <code>+</code>), so the next person can&apos;t tell why
          access behaves the way it does. <strong>On real servers, prefer groups.</strong>
        </p>

        <h3>Where this matters on AWS</h3>
        <p>
          On your EC2 server this shows up immediately. Nginx needs to <em>read</em> your built
          Next.js files but must never write them, so the build folder belongs to your user with
          Nginx&apos;s group allowed to read and enter. And your <code>.env</code> holding the RDS
          password is <code>600</code> — nobody else, ever. If it were <code>644</code>, any user
          or compromised process on that box could read your database password.
        </p>

        <hr />

        <h2 id="conclusion">Conclusion</h2>
        <p>
          An EC2 server has no screen and no mouse — only a terminal. That is why Linux is not
          optional for this course. Everything you learned today comes down to five ideas:
        </p>
        <ul>
          <li>
            <strong>Filesystem</strong>: everything lives in one tree starting at <code>/</code>.
            Your app goes in <code>/home/ubuntu</code>, logs go in <code>/var/log</code>.
          </li>
          <li>
            <strong>Permissions</strong>: <code>600</code> on <code>.env</code> means only you can read it —
            essential for any file holding a password. SSH will refuse to run at all until your key
            is <code>400</code>.
          </li>
          <li>
            <strong>sudo</strong>: run one command as admin, then go back to being a normal user.
            Never stay logged in as root — one typo can take down the whole server.
          </li>
          <li>
            <strong>Processes</strong>: close the terminal and your app dies with it. That is why
            you use <strong>PM2</strong> — it keeps the app running and restarts it on a crash.
          </li>
          <li>
            <strong>The commands you will use most</strong>: <code>tail -f</code> (watch live
            logs), <code>df -h</code> (is the disk full?), <code>ps aux | grep node</code> (is the
            app running?).
          </li>
        </ul>
        <p>
          You do not need EC2 to practise any of this — the terminal on Mac/Linux, or WSL on
          Windows, runs exactly the same commands.
        </p>

        <hr />
        <p>
          End of Lesson 1. Next: <strong>Lesson 2 — Networking Basics</strong>.
        </p>
        <p>
          Curious what PM2 and Nginx actually are before their lessons?{" "}
          <Link href={readingHref(piecesReading)}>{piecesReading.title} →</Link>
        </p>
      </div>

      <LessonPager slug={lesson.slug} />
    </article>
  );
}
