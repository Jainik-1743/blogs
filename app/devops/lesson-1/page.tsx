import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import CommandList from "@/components/CommandList";
import FilesystemTree from "@/components/figures/FilesystemTree";
import PermissionBits from "@/components/figures/PermissionBits";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { getLesson, SERIES } from "@/lib/lessons";

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

        <h2 id="navigation">Commands — Part A: Navigation</h2>
        <CommandList
          title="Moving around"
          commands={[
            { cmd: "pwd", note: <>print working directory — &ldquo;where am I?&rdquo;</> },
            { cmd: "ls", note: "list files here" },
            { cmd: "ls -la", note: "list ALL files (including hidden) with details" },
            { cmd: "cd /var/log", note: "go to a folder" },
            { cmd: "cd ~", note: <>go to your home folder (<code>~</code> means <code>/home/ubuntu</code>)</> },
            { cmd: "cd ..", note: "go one folder up" },
          ]}
        />
        <p>Reading files:</p>
        <CommandList
          title="Reading files"
          commands={[
            { cmd: "cat package.json", note: "print whole file" },
            { cmd: "less error.log", note: <>scroll through a big file (press <code>q</code> to quit)</> },
            { cmd: "head -20 app.log", note: "first 20 lines" },
            { cmd: "tail -50 app.log", note: "last 50 lines" },
            { cmd: "tail -f app.log", note: "LIVE view — new lines appear as they happen" },
          ]}
        />
        <p>
          <code>tail -f</code> is the single most useful debugging command in DevOps. You&apos;ll
          live in it.
        </p>

        <h2 id="files">Part B: Files and folders</h2>
        <CommandList
          title="Files and folders"
          commands={[
            { cmd: "mkdir myapp", note: "create folder" },
            { cmd: "touch .env", note: "create empty file" },
            { cmd: "cp file.txt backup.txt", note: "copy" },
            { cmd: "mv old.txt new.txt", note: "move or rename" },
            { cmd: "rm file.txt", note: "delete file" },
            { cmd: "rm -rf folder/", note: "delete folder and everything inside" },
          ]}
        />
        <Callout kind="warn" label="Careful">
          <p className="mb-0">
            <code>rm -rf</code> has no recycle bin and no confirmation. Deleted is deleted forever.
            Always run <code>pwd</code> before using it.
          </p>
        </Callout>

        <h2 id="permissions">Part C: Permissions — the most important part</h2>
        <p>
          Every file has permissions for three groups: <strong>owner</strong>,{" "}
          <strong>group</strong>, <strong>others</strong>. Each can have read (4), write (2),
          execute (1).
        </p>
        <Script
          title="ls -l output"
          code={`ls -l app.js
# -rw-r--r-- 1 ubuntu ubuntu 1240 Sep 18 10:22 app.js`}
        />
        <p>
          Reading <code>rw-r--r--</code>: owner can read+write, group can only read, others can only
          read.
        </p>
        <PermissionBits />
        <p>Numeric form — you add the values:</p>
        <CommandList
          title="chmod recipes"
          commands={[
            { cmd: "chmod 644 app.js", note: "owner rw, others read — normal files" },
            { cmd: "chmod 600 .env", note: "owner rw, NOBODY else — secrets!" },
            { cmd: "chmod 400 key.pem", note: "owner read only — SSH keys (required)" },
            { cmd: "chmod 755 script.sh", note: "owner rwx, others rx — executables" },
            { cmd: "chown ubuntu:ubuntu app.js", note: "change who owns the file" },
          ]}
        />
        <p>
          <strong>You will hit this exact error in Lesson 7</strong>, guaranteed:
        </p>
        <Script
          title="The error"
          code={`WARNING: UNPROTECTED PRIVATE KEY FILE!
Permissions 0644 for 'key.pem' are too open.`}
        />
        <p>
          The fix is <code>chmod 400 key.pem</code>. SSH refuses to use a key that other users on
          the machine could read.
        </p>

        <h2 id="users">Part D: Users and sudo</h2>
        <CommandList
          title="Users and sudo"
          commands={[
            { cmd: "whoami", note: "which user am I?" },
            { cmd: "sudo apt update", note: "run one command as admin (superuser do)" },
            { cmd: "sudo su -", note: "become root fully (avoid this habit)" },
          ]}
        />
        <p>
          Rule: use <code>sudo</code> for each command that needs it. Don&apos;t live as root — one
          wrong <code>rm -rf</code> as root destroys the server.
        </p>

        <h2 id="processes">Part E: Processes — why your app dies</h2>
        <CommandList
          title="Processes"
          commands={[
            { cmd: "ps aux", note: "list all running processes" },
            { cmd: "ps aux | grep node", note: "find only node processes" },
            { cmd: "top", note: <>live CPU/memory view (<code>q</code> to quit)</> },
            { cmd: "kill 4821", note: "politely stop process ID 4821" },
            { cmd: "kill -9 4821", note: "force kill (last resort)" },
          ]}
        />
        <p>
          The <code>|</code> is a <strong>pipe</strong> — it sends output of one command into the
          next. <code>ps aux | grep node</code> means &ldquo;list all processes, then filter for
          node&rdquo;.
        </p>
        <p>Checking ports (you&apos;ll need this constantly):</p>
        <CommandList
          title="Ports"
          commands={[
            { cmd: "sudo lsof -i :3000", note: "what is using port 3000?" },
            { cmd: "sudo ss -tulpn", note: "all listening ports" },
          ]}
        />

        <h3>Solving &ldquo;my app dies when I close the terminal&rdquo;</h3>
        <p>
          When you run <code>npm start</code> and close SSH, the process is killed because it was a
          child of your terminal session. Three levels of fix:
        </p>
        <CommandList
          title="Level 1 — quick test only"
          commands={[{ cmd: "nohup npm start &", note: "survives disconnect" }]}
        />
        <CommandList
          title="Level 2 — better: a session you can reattach to"
          commands={[
            { cmd: "tmux new -s myapp", note: <>run <code>npm start</code> inside, then press <code>Ctrl+B</code> then <code>D</code> to detach</> },
            { cmd: "tmux attach -t myapp", note: "come back later" },
          ]}
        />
        <CommandList
          title="Level 3 — production answer: auto-restart on crash and on reboot"
          commands={[
            { cmd: "sudo npm install -g pm2", note: "install PM2 globally" },
            { cmd: "pm2 start npm --name myapp -- start", note: <>run <code>npm start</code> under PM2, named <code>myapp</code></> },
            { cmd: "pm2 startup", note: "survive server reboot" },
            { cmd: "pm2 save", note: "remember the current process list" },
            { cmd: "pm2 logs myapp", note: "view logs" },
            { cmd: "pm2 restart myapp", note: "restart the app" },
          ]}
        />
        <p>PM2 is what you&apos;ll actually use in Lesson 7 (and later Docker replaces it).</p>

        <h2 id="disk">Part F: Disk and system health</h2>
        <CommandList
          title="System health"
          commands={[
            { cmd: "df -h", note: <>disk space free (<code>-h</code> = human readable)</> },
            { cmd: "du -sh /home/ubuntu/myapp", note: "how big is this folder?" },
            { cmd: "free -h", note: "RAM usage" },
            { cmd: "uptime", note: "how long has server been running + load" },
          ]}
        />
        <p>
          A full disk is one of the most common production outages — <code>npm run build</code>{" "}
          silently fails, logs stop writing. <code>df -h</code> is your first check when something
          is weird.
        </p>

        <h2 id="editing">Part G: Editing files</h2>
        <p>
          You&apos;ll need <code>nano</code> (simple) over <code>vim</code> (steep learning curve)
          to start:
        </p>
        <CommandList
          title="nano"
          commands={[
            { cmd: "nano .env", note: <>type your changes, then <code>Ctrl+O</code> then <code>Enter</code> to save, <code>Ctrl+X</code> to exit</> },
          ]}
        />

        <hr />

        <h2 id="practice">Practice task before Lesson 2</h2>
        <p>Don&apos;t launch an EC2 instance yet. Practice locally:</p>
        <ul>
          <li>
            <strong>On Mac/Linux</strong>: your terminal is already Linux-like. Just use it.
          </li>
          <li>
            <strong>On Windows</strong>: install WSL — open PowerShell as admin and run{" "}
            <code>wsl --install</code>, then restart. You now have real Ubuntu.
          </li>
        </ul>
        <p>Then do this exercise:</p>
        <Script
          title="practice.sh"
          code={`mkdir ~/practice && cd ~/practice
touch .env app.js
chmod 600 .env
ls -la                      # confirm .env shows -rw-------
echo "console.log('hello')" > app.js
node app.js
df -h
ps aux | grep node`}
        />
        <p>If every one of those makes sense, you&apos;re ready for servers.</p>

        <hr />

        <h2 id="sharing">Follow-up: let one user read a file, but not another</h2>
        <p>This is exactly where the three-group model (owner / group / others) becomes practical.</p>

        <h3>The basic answer: <code>chmod 640</code></h3>
        <CommandList
          title="chmod 640"
          commands={[
            {
              cmd: "chmod 640 report.txt",
              note: (
                <>
                  owner = <code>rw-</code> (you: read + write) · group = <code>r--</code> (group
                  members: read only) · others = <code>---</code> (everyone else: nothing)
                </>
              ),
            },
          ]}
        />
        <p>
          The digits are always in this order: <strong>owner, group, others</strong>. So 6=rw, 4=r,
          0=nothing.
        </p>
        <p>
          But there&apos;s a catch — permissions alone aren&apos;t enough. You must also decide{" "}
          <strong>which group</strong> can read it, and put the right users in that group.
        </p>

        <h3>Full working example</h3>
        <p>
          Say you own <code>report.txt</code>, you want <code>rahul</code> to view it, and{" "}
          <code>amit</code> to have no access at all.
        </p>
        <CommandList
          title="Share with a group"
          commands={[
            { cmd: "sudo groupadd viewers", note: "1. Create a group for the people who should view" },
            { cmd: "sudo usermod -aG viewers rahul", note: "2. Add rahul to that group (do NOT add amit)" },
            { cmd: "sudo chown ubuntu:viewers report.txt", note: "3. Make the file owned by you, but grouped to viewers" },
            { cmd: "chmod 640 report.txt", note: "4. Set the permissions" },
            { cmd: "ls -l report.txt", note: <>5. Verify — expect <code>-rw-r----- 1 ubuntu viewers 2048 Sep 18 11:30 report.txt</code></> },
          ]}
        />
        <p>
          Now: you can read+write, rahul can read only, amit gets &ldquo;Permission denied&rdquo;.
          Rahul must log out and back in for the new group to take effect.
        </p>

        <Callout kind="warn" label="Important gotcha — the folder also needs permission">
          <p>
            A file inside a locked folder is still unreachable. Rahul needs <strong>execute</strong>{" "}
            (<code>x</code>) on the folder to enter it:
          </p>
          <CommandList
            title="Folder permission"
            commands={[
              { cmd: "chmod 750 /home/ubuntu/docs", note: "owner rwx, group r-x (can enter + list), others nothing" },
            ]}
          />
          <p className="mb-0">
            On folders, <code>x</code> means &ldquo;can enter&rdquo;, <code>r</code> means &ldquo;can
            list contents&rdquo;. Without <code>x</code>, even a readable file inside is
            inaccessible. This trips up almost everyone the first time.
          </p>
        </Callout>

        <h3>Common permission recipes</h3>
        <CommandList
          title="Recipes"
          commands={[
            { cmd: "chmod 600 .env", note: "only you — secrets, API keys, DB passwords" },
            { cmd: "chmod 640 config.json", note: "you edit, your group reads" },
            { cmd: "chmod 644 index.html", note: "you edit, everyone reads (public web files)" },
            { cmd: "chmod 750 deploy.sh", note: "you run+edit, group can run, others nothing" },
            { cmd: "chmod 700 ~/.ssh", note: "only you — SSH folder must be this" },
          ]}
        />

        <h3>When you need per-user control (not groups): ACLs</h3>
        <p>
          If you want &ldquo;rahul yes, amit no&rdquo; without creating groups, use ACL — Access
          Control Lists:
        </p>
        <CommandList
          title="ACLs"
          commands={[
            { cmd: "sudo setfacl -m u:rahul:r report.txt", note: "Give one specific user read access" },
            { cmd: "sudo setfacl -m u:amit:--- report.txt", note: "Explicitly deny one specific user" },
            { cmd: "getfacl report.txt", note: "See who has what" },
            { cmd: "sudo setfacl -x u:rahul report.txt", note: "Remove a user's ACL entry" },
          ]}
        />
        <p>
          ACLs are more flexible but less standard — many teams avoid them because they&apos;re
          invisible in <code>ls -l</code> (you only see a <code>+</code> at the end:{" "}
          <code>-rw-r-----+</code>). <strong>For real servers, prefer groups.</strong> They&apos;re
          cleaner and easier for the next person to understand.
        </p>

        <h3>Where this matters on AWS</h3>
        <p>On your EC2 server this shows up immediately:</p>
        <CommandList
          title="On EC2"
          commands={[
            { cmd: "sudo chown -R ubuntu:www-data /home/ubuntu/myapp/.next", note: "Nginx needs to READ your built files, but never write them" },
            { cmd: "chmod -R 750 /home/ubuntu/myapp/.next", note: "you full access, the www-data group can read + enter, nobody else" },
            { cmd: "chmod 600 /home/ubuntu/myapp/.env", note: "Your .env with the RDS password — nobody else, ever" },
          ]}
        />
        <p>
          That second one is a genuine security practice, not a formality. If your{" "}
          <code>.env</code> is <code>644</code>, any user or compromised process on that box can
          read your database password.
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
            <strong>Permissions</strong>: <code>chmod 600 .env</code> means only you can read it —
            essential for any file holding a password. SSH will refuse to run at all until your key
            is <code>chmod 400 key.pem</code>.
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
        <Callout kind="note" label="Permissions, in one paragraph">
          <p className="mb-0">
            <code>chmod 640</code> means: you read+write, the group reads only, everyone else gets
            nothing. But chmod alone is not enough — create a group with <code>groupadd</code>, add
            the users who should have access with <code>usermod -aG</code>, and hand the file to
            that group with <code>chown</code>. Remember that the folder containing the file also
            needs <code>x</code> permission, otherwise nobody can enter it. If you need access for
            one specific user only, <code>setfacl</code> works, but on real servers groups are
            cleaner and easier for the next person to understand.
          </p>
        </Callout>

        <hr />
        <p>
          End of Lesson 1. Next: <strong>Lesson 2 — Networking Basics</strong>.
        </p>
      </div>

      <LessonPager slug={lesson.slug} />
    </article>
  );
}
