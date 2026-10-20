/** Heading plus optional one-line note, used for every section of a landing page. */
export default function SectionTitle({ id, title, note, count }: { id?: string; title: string; note?: React.ReactNode; count?: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
        <h2 id={id} className="m-0 text-[1.6rem] font-bold leading-tight tracking-tight text-ink max-sm:text-[1.35rem]">{title}</h2>
        {count && <span className="shrink-0 text-[0.85rem] text-ink-dim">{count}</span>}
      </div>
      {note && <p className="mt-3 mb-0 max-w-[68ch] text-ink-dim">{note}</p>}
    </div>
  );
}
