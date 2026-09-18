import CopyButton from "./CopyButton";

/** A multi-line script or terminal output, shown whole, with a copy button. */
export default function Script({ title, code }: { title: string; code: string }) {
  return (
    <div className="my-5 overflow-hidden rounded-xl border border-line bg-bg-code">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-bg-elev px-4 py-2">
        <span className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-ink-dim">{title}</span>
        <CopyButton text={code} />
      </div>
      <pre className="my-0 rounded-none border-0 bg-transparent px-4 py-3">
        <code>{code}</code>
      </pre>
    </div>
  );
}
