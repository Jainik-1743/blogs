import Link from "next/link";

type Crumb = { label: string; href?: string };
type Meta = { label: string; value: string };

/**
 * One header for every landing page: series covers, the guides list and each guide.
 * Breadcrumb, eyebrow, title, summary, then the key facts as a ruled strip.
 */
export default function PageHeader({
  crumbs, eyebrow, title, summary, meta = [], children,
}: { crumbs: Crumb[]; eyebrow: string; title: string; summary?: React.ReactNode; meta?: Meta[]; children?: React.ReactNode }) {
  return (
    <header className="mb-8 border-b border-line pb-6 pt-1">
      <nav aria-label="Breadcrumb" className="mb-4 text-[0.85rem] text-ink-dim">
        <ol className="m-0 flex list-none flex-wrap items-center gap-x-2 p-0">
          {crumbs.map((c, i) => (
            <li key={c.label} className="m-0 flex items-center gap-2">
              {i > 0 && <span aria-hidden="true" className="opacity-50">/</span>}
              {c.href ? <Link href={c.href} className="text-ink-dim hover:text-sky">{c.label}</Link> : <span aria-current="page">{c.label}</span>}
            </li>
          ))}
        </ol>
      </nav>
      <p className="mb-2 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-sky">{eyebrow}</p>
      <h1 className="m-0 max-w-[30ch] text-[2.3rem] font-bold leading-[1.12] tracking-tight text-ink max-sm:text-[1.8rem]">{title}</h1>
      {summary && <div className="mt-3 max-w-[68ch] text-[1.02rem] leading-relaxed text-ink-dim">{summary}</div>}
      {children}
      {meta.length > 0 && (
        <dl className="m-0 mt-5 grid grid-cols-2 gap-y-4 sm:grid-cols-4">
          {meta.map((m, i) => (
            <div key={m.label} className={`px-1 ${i > 0 ? "sm:border-l sm:border-line sm:pl-6" : ""} ${i % 2 === 1 ? "max-sm:border-l max-sm:border-line max-sm:pl-5" : ""}`}>
              <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-dim">{m.label}</dt>
              <dd className="m-0 mt-0.5 text-[1rem] font-semibold text-ink">{m.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </header>
  );
}
