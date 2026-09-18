export type FlowNode = { title: string; desc: string };

/** A vertical chain of boxes joined by connectors — for request-flow and "ladder" diagrams. */
export default function FlowChain({ nodes }: { nodes: FlowNode[] }) {
  return (
    <ol className="my-6 list-none p-0" aria-label="Flow">
      {nodes.map((n, i) => (
        <li key={n.title} className="m-0">
          {i > 0 ? <div className="ml-6 h-5 w-0.5 bg-line" aria-hidden="true" /> : null}
          <div className="rounded-lg border border-line border-l-[3px] border-l-sky bg-bg-elev px-4 py-3">
            <div className="font-semibold text-slate-50">{n.title}</div>
            <div className="text-[0.92rem] text-ink-dim">{n.desc}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}
