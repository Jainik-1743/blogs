import Figure from "./Figure";

/** One tree, one root. The two highlighted folders are the ones the lesson says you will touch most. */
const tree: { path: string; note: string; hot?: boolean; depth: number }[] = [
  { path: "/", note: "root — the single starting point of everything", depth: 0 },
  { path: "home/", note: "one folder per user", depth: 1 },
  { path: "ubuntu/", note: "your user on EC2 — your Next.js code sits here", depth: 2, hot: true },
  { path: "var/", note: "data that changes while the system runs", depth: 1 },
  { path: "log/", note: "where you go when things break", depth: 2, hot: true },
  { path: "etc/", note: "system config — nginx, ssh, users", depth: 1 },
  { path: "usr/", note: "installed programs — node, git, npm", depth: 1 },
  { path: "tmp/", note: "scratch files, wiped on reboot", depth: 1 },
  { path: "root/", note: "home folder of the root user", depth: 1 },
  { path: "dev/", note: "your hardware, shown as files — disks, terminals", depth: 1 },
  { path: "proc/", note: "live view of running processes", depth: 1 },
];

export default function FilesystemTree() {
  return (
    <Figure caption="The Linux filesystem: one tree, starting at /. Highlighted rows are the two places you will spend most of your time.">
      <ul className="m-0 list-none p-0 font-mono text-[0.85rem]">
        {tree.map((n) => (
          <li
            key={n.path + n.depth}
            className={`grid grid-cols-[minmax(9rem,auto)_1fr] items-baseline gap-x-4 rounded-md px-2 py-1 max-sm:grid-cols-1 max-sm:gap-y-0 ${
              n.hot ? "bg-sky-soft" : ""
            }`}
          >
            <span className={n.hot ? "font-bold text-sky-strong" : "text-ink"}>
              <span className="text-ink-dim/60">
                {n.depth === 0 ? "" : "│  ".repeat(n.depth - 1) + "├─ "}
              </span>
              {n.path}
            </span>
            <span className="font-sans text-[0.85rem] text-ink-dim">{n.note}</span>
          </li>
        ))}
      </ul>
    </Figure>
  );
}
