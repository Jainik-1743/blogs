import type { ReactNode } from "react";
import CopyButton from "./CopyButton";

export type Command = {
  cmd: string;
  /** What the command does, in one line. */
  note: ReactNode;
};

/**
 * A list of shell commands, one per row: the command, its explanation, and a copy
 * button. A "copy all" button at the top copies the commands as one script.
 */
export default function CommandList({ title, commands }: { title?: string; commands: Command[] }) {
  const all = commands.map((c) => c.cmd).join("\n");
  return (
    <div className="my-5 overflow-hidden rounded-xl border border-line bg-bg-code">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-bg-elev px-4 py-2">
        <span className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-ink-dim">
          {title ?? "Commands"}
        </span>
        <CopyButton text={all} label="Copy all" />
      </div>
      <ul className="m-0 list-none p-0">
        {commands.map((c) => (
          <li
            key={c.cmd}
            className="grid grid-cols-[1fr_auto] items-start gap-x-3 gap-y-1 border-b border-line px-4 py-3 last:border-b-0"
          >
            <code className="block min-w-0 whitespace-pre-wrap [overflow-wrap:anywhere] rounded-none bg-transparent p-0 font-mono text-[0.88rem] text-sky-strong">
              {c.cmd}
            </code>
            <CopyButton text={c.cmd} />
            <p className="col-span-2 mb-0 text-[0.9rem] leading-relaxed text-ink-dim">{c.note}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
