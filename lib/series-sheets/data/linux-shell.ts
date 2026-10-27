import type { CheatSheet } from "../types.ts";

/** Cheat sheet for the "linux-shell" series. See scripts/SERIES-SHEETS.md. */
export const SHEET: CheatSheet | null = {
  intro:
    "The Linux command line for developers and admins: files, permissions, processes, pipes, scripts, SSH, services and the first two minutes on a slow server. The shell expands things **before** the command runs.",
  sections: [
    {
      title: "Files and paths",
      lesson: 0,
      blocks: [
        {
          kind: "points",
          items: [
            "One tree from `/`. `/etc` config, `/var` run-time data, `/home` users, `/tmp` scratch, `/proc` and `/sys` live kernel views.",
            "Absolute paths start with `/`. `.` is here, `..` is up, `~` is home, `cd -` goes back.",
            "The shell finds commands by searching `PATH` in order. `type NAME` says builtin or program.",
            "A hard link is a second name for one inode. A symlink holds a path and can dangle.",
          ],
        },
        {
          kind: "pairs",
          rows: [
            ["ls -lah", "Long list, hidden files, readable sizes"],
            ["find . -name '*.log'", "Search a whole tree"],
            ["head -n 5 / tail -n 5 / wc -l", "Start, end, line count"],
            ["mkdir -p a/b/c", "Make nested folders"],
            ["ln -s TARGET LINK", "Symbolic link"],
            ["du -sh * / df -h", "Size of names / free space per file system"],
            ["stat FILE / file FILE", "Inode details / detected type"],
          ],
        },
      ],
    },
    {
      title: "Quotes, variables, exit status",
      lesson: 0,
      blocks: [
        {
          kind: "table",
          head: ["Syntax", "Meaning"],
          rows: [
            ["`'text'`", "Literal, nothing expands"],
            ["`\"$var\"`", "Variables expand, spaces stay together"],
            ["`$(cmd)`", "Command substitution"],
            ["`*.txt`", "Glob; no match stays as plain text"],
            ["`$?` / `$$` / `$!`", "Last status / shell PID / last background PID"],
            ["`A && B`, `A || B`", "Run B if A succeeds / fails"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Exit status 0 is success. `command -v NAME` shows where a command comes from. Look (`ls`) before you `rm`.",
        },
      ],
    },
    {
      title: "Reading permissions",
      lesson: 1,
      blocks: [
        {
          kind: "points",
          items: [
            "`-rwxr-x---` is type, owner, group, others. The kernel uses the **first matching class** only.",
            "Octal: r=4, w=2, x=1. `750` is `rwxr-x---`. Use `644` files, `755` programs and folders, `600`/`700` private. Avoid `777`.",
            "On a directory: `r` lists, `w` creates and deletes, `x` lets you pass through. Deleting depends on the **directory**.",
            "Users and groups are numbers (UID, GID). Names live in `/etc/passwd`; hashes in `/etc/shadow`.",
          ],
        },
        {
          kind: "pairs",
          rows: [
            ["chmod 640 FILE / chmod u+x FILE", "Set the mode / add execute for owner"],
            ["chown user:group FILE", "Change owner (needs root)"],
            ["umask 022", "New files 644, folders 755"],
            ["id / groups", "Who am I, which groups"],
          ],
        },
      ],
    },
    {
      title: "Special bits, sudo, traps",
      lesson: 1,
      blocks: [
        {
          kind: "table",
          head: ["Bit", "Effect", "Example"],
          rows: [
            ["setuid", "Runs as the file owner (ignored on scripts)", "`passwd`"],
            ["setgid (dir)", "New files inherit the group", "Team folder"],
            ["sticky", "Delete only your own files", "`/tmp`"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "`sudo cmd > file` fails: your shell does the redirect. Use `cmd | sudo tee file`. Root ignores mode bits, so test as the service user (`sudo -u`).",
        },
        {
          kind: "points",
          items: [
            "`Permission denied` is the mode bits. `Operation not permitted` is ownership or capability.",
            "`umask` removes bits from new files. New files never start with `x`.",
          ],
        },
      ],
    },
    {
      title: "Processes and signals",
      lesson: 2,
      blocks: [
        {
          kind: "table",
          head: ["STAT", "Meaning"],
          rows: [
            ["`R` / `S`", "Running / sleeping (normal)"],
            ["`D`", "Uninterruptible wait (disk, network mount); cannot be killed"],
            ["`T`", "Stopped (Ctrl-Z or SIGSTOP)"],
            ["`Z`", "Zombie: dead, parent has not collected it"],
          ],
        },
        {
          kind: "pairs",
          rows: [
            ["ps -eo pid,ppid,stat,cmd", "Choose your columns"],
            ["pstree -p / pgrep -af NAME", "Tree / find by name, show command"],
            ["kill PID", "SIGTERM (15), the polite default"],
            ["kill -9 PID", "SIGKILL, cannot be caught. Last resort."],
            ["kill -STOP PID / -CONT PID", "Pause / resume"],
            ["kill -0 PID", "Does it exist? Sends nothing"],
          ],
        },
      ],
    },
    {
      title: "Jobs, exit codes, limits",
      lesson: 2,
      blocks: [
        {
          kind: "table",
          head: ["Exit code", "Meaning"],
          rows: [
            ["`0`", "Success"],
            ["`126` / `127`", "Not executable / command not found"],
            ["`128+N`", "Killed by signal N"],
            ["`137` / `143`", "SIGKILL (9) / SIGTERM (15)"],
          ],
        },
        {
          kind: "points",
          items: [
            "`cmd &` backgrounds a job. Closing the terminal sends SIGHUP: use `nohup`, `disown`, `tmux` or systemd.",
            "Ctrl-C is SIGINT, Ctrl-Z suspends, Ctrl-D ends input. Fix a zombie by fixing its **parent**.",
            "PID 1 ignores signals without a handler: handle `SIGTERM` or use an init in containers.",
            "`nice` / `renice` set CPU priority. `timeout 5 cmd` and `ulimit` set limits.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "`pkill -f` matches full command lines, even your own. Check with `pgrep -af` first.",
        },
      ],
    },
    {
      title: "Redirection and pipes",
      lesson: 3,
      blocks: [
        {
          kind: "table",
          head: ["Syntax", "Effect"],
          rows: [
            ["`> f` / `>> f`", "Overwrite / append stdout"],
            ["`2> f`", "stderr to a file"],
            ["`> f 2>&1`", "Both to f (order matters)"],
            ["`< f`", "Read stdin from f"],
            ["`> /dev/null`", "Throw output away"],
            ["`a \\| b`", "stdout of a into b; last status wins"],
            ["`a \\| tee f \\| b`", "Save the middle of a pipeline"],
          ],
        },
        {
          kind: "points",
          items: [
            "`cmd > file` empties the file first. Never read and write the same file.",
            "`set -o pipefail` makes a pipeline fail if any stage fails. A pipe carries only stdout.",
          ],
        },
      ],
    },
    {
      title: "grep, sort, sed, awk",
      lesson: 3,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["grep -inrlcvwoq -E -F", "Ignore case, number, recurse, list, count, invert, word, only, quiet, regex, literal"],
            ["sort | uniq -c | sort -rn | head", "The top-N idiom"],
            ["sort -n", "Numeric (text order puts 100 before 9)"],
            ["cut -d, -f2 / tr a-z A-Z", "Pick a field / translate characters"],
            ["sed 's/old/new/g'", "Replace; `-i` edits in place"],
            ["awk '{s+=$3} END{print s}'", "Sum column 3"],
            ["awk -F: '$3>=1000{print $1}'", "Filter by field"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "`grep` exits 0 match, 1 none, 2 error. Under `set -e`, no match kills the script: use `|| true` or `if`. `uniq` needs sorted input.",
        },
      ],
    },
    {
      title: "find and xargs",
      lesson: 3,
      blocks: [
        {
          kind: "code",
          lang: "bash",
          code: "find . -name '*.log' -mtime +7 \\\n  -size +1M\nfind . -type f -print0 \\\n  | xargs -0 -r wc -l\nfind . -name '*.tmp' -exec rm {} +\nfind . -name '*.tmp' \\\n  | xargs echo rm   # dry run",
          note: "`-exec {} +` batches and is faster than `\\;`.",
        },
        {
          kind: "points",
          items: [
            "`-print0` with `xargs -0` is safe for names with spaces. `xargs -r` skips an empty run.",
            "Build pipelines one stage at a time, and filter early.",
          ],
        },
      ],
    },
    {
      title: "Scripting basics",
      lesson: 4,
      blocks: [
        {
          kind: "code",
          lang: "bash",
          code: "#!/usr/bin/env bash\nset -euo pipefail\ntmp=$(mktemp)\ntrap 'rm -f \"$tmp\"' EXIT\nfor f in ./*.log; do\n  [[ -e $f ]] || continue\n  echo \"$f\" >> \"$tmp\"\ndone\nwhile IFS= read -r line; do echo \"$line\"; done < \"$tmp\"",
          note: "Quote every expansion. Glob in loops, never loop over `ls`.",
        },
        {
          kind: "points",
          items: [
            "`[[ ]]` beats `[ ]`. Use `-gt` / `-lt` for numbers; `>` and `<` compare text.",
            "Functions: `local` variables, `return` a status, print data, errors to `>&2`.",
            "`A && B || C` is not if/else. Options: `getopts`. Debug with `bash -x`, lint with ShellCheck.",
          ],
        },
      ],
    },
    {
      title: "set -e and other script traps",
      lesson: 4,
      blocks: [
        {
          kind: "table",
          head: ["Flag", "Effect"],
          rows: [
            ["`-e`", "Stop when a command fails"],
            ["`-u`", "Unset variable is an error"],
            ["`-o pipefail`", "Pipeline fails if any part fails"],
          ],
        },
        {
          kind: "points",
          items: [
            "`set -e` has holes: functions used in `if`, `local x=$(...)`, `(( ))`, `let`.",
            "A `while read` at the end of a pipe runs in a **subshell**; its variables vanish.",
            "`/bin/sh` is dash on Debian and Ubuntu. `trap cleanup EXIT` runs on every exit except SIGKILL.",
            "macOS ships bash 3.2 with no associative arrays.",
          ],
        },
      ],
    },
    {
      title: "SSH, rsync, tunnels",
      lesson: 5,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["ssh-keygen -t ed25519", "Make a key pair (set a passphrase)"],
            ["ssh -G HOST / ssh -v HOST", "Show settings / show login steps"],
            ["rsync -avn SRC/ DEST/", "Dry run; `-n` first, always"],
            ["rsync -av --delete SRC/ DEST/", "Mirror, removing extras"],
            ["ssh -L 8080:db:5432 HOST", "Local forward; `db` resolved on HOST"],
            ["ssh -J BASTION HOST", "Jump host (`ProxyJump`)"],
          ],
        },
        {
          kind: "points",
          items: [
            "SSH checks the server (`known_hosts`) first, then you (`authorized_keys`). Private key mode `600`.",
            "Vague \"Permission denied\"? Read the **server log**: `bad ownership or modes`, `account is locked`.",
            "`SRC/` copies the contents, `SRC` copies the folder. Put names in `~/.ssh/config` with `IdentitiesOnly yes`.",
          ],
        },
      ],
    },
    {
      title: "Network tools",
      lesson: 5,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["ss -ltnp", "Listening TCP ports and their process"],
            ["nc -zv HOST PORT", "Is this port open?"],
            ["dig NAME", "Ask DNS"],
            ["curl -sS -m 5 -f URL", "Time limit, fail on HTTP errors"],
            ["curl -w '%{time_total}' URL", "Time breakdown of a request"],
          ],
        },
        {
          kind: "table",
          head: ["curl exit", "Meaning"],
          rows: [
            ["`7`", "Refused: host up, nothing listening"],
            ["`28`", "Timed out: firewall, unreachable, or silent server"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "A 404 still exits 0 without `-f`. A service bound to loopback only is a common cause of \"running but unreachable\". Do not trust `ping` alone.",
        },
      ],
    },
    {
      title: "Packages, services, cron",
      lesson: 6,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["apt update", "Refresh lists only"],
            ["apt upgrade -s", "Simulate first, then drop `-s`"],
            ["apt remove / apt purge", "Keep config / delete config too"],
            ["systemctl enable --now NAME", "Start now and at boot"],
            ["systemctl daemon-reload", "After editing a unit"],
            ["systemd-analyze verify NAME", "Check a unit file"],
          ],
        },
        {
          kind: "points",
          items: [
            "A unit has `[Unit]`, `[Service]`, `[Install]`. systemd ignores bad lines silently. Care with `Restart=`.",
            "Cron fields: minute hour day-of-month month day-of-week (0-7). If both day fields are set, **either** matches.",
            "Cron has a tiny environment (`PATH=/usr/bin:/bin`, `sh`): use full paths, redirect output, escape `%`.",
            "Timers add journal logs, catch-up after downtime and load spreading.",
          ],
        },
      ],
    },
    {
      title: "Slow server: first two minutes",
      lesson: 7,
      blocks: [
        {
          kind: "steps",
          items: [
            "`uptime`: compare load average with `nproc`. Linux load counts tasks waiting on disk.",
            "`top` / `vmstat 1`: `r` run queue, `b` blocked, `si`/`so` swap, `wa` I/O wait. Ignore line one.",
            "`free -h`: read **available**, not free. Cache is not a problem.",
            "`df -h`, `df -i`, `iostat`: space, inodes, disk speed.",
            "`ss -ltnp` and `curl -w`: network. Then logs: `journalctl` or `tail -F`.",
          ],
        },
        {
          kind: "table",
          head: ["Disk \"full\" kind", "Check", "Fix"],
          rows: [
            ["No space", "`df -h`, `du`", "Delete or rotate"],
            ["No inodes", "`df -i`", "Remove many small files"],
            ["Deleted, still open", "`df` > `du`; `lsof +L1`", "Restart process; truncate with `: > f`"],
          ],
        },
      ],
    },
    {
      title: "Interview one-liners",
      lesson: 8,
      blocks: [
        {
          kind: "table",
          head: ["Question", "Short answer"],
          rows: [
            ["`cmd > f 2>&1` vs `2>&1 > f`?", "First sends both to f. Second sends stderr to the old stdout."],
            ["umask 027?", "Files 640, folders 750."],
            ["Zombie?", "Finished child nobody collected. Fix the parent."],
            ["137 vs 143?", "SIGKILL vs SIGTERM. TERM first, always."],
            ["`[ ]` vs `[[ ]]`?", "`[[ ]]` does not word-split. Safer in bash."],
            ["Why `tee` with sudo?", "The shell does the redirect, not sudo."],
            ["Hard vs symlink?", "Same inode vs a file holding a path."],
            ["Server is slow?", "Clarify, CPU, memory, disk, network, logs, fix, verify."],
            ["Cron job fails but works by hand?", "Small environment: use full paths."],
          ],
        },
      ],
    },
  ],
};
