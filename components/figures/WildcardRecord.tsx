import Figure from "./Figure";

/** One wildcard A record fanning out to every tenant subdomain, present and future. */
const tenants = ["acme", "rathod-electricals", "sharma-panels", "any-new-customer"];

export default function WildcardRecord() {
  return (
    <Figure caption="One wildcard record answers for every subdomain, including ones that do not exist yet. Your app reads the subdomain from the Host header and picks the tenant.">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 max-sm:grid-cols-1">
        <div className="rounded-lg border border-emerald-400/50 bg-emerald-400/10 px-4 py-3 text-center">
          <div className="font-mono text-[0.68rem] uppercase tracking-[0.08em] text-emerald-300">Route 53 · one record</div>
          <div className="mt-1 font-mono text-[0.95rem] font-bold text-emerald-200">*.yourapp.com</div>
          <div className="font-mono text-[0.8rem] text-emerald-200/80">A → 52.66.12.9</div>
        </div>
        <div className="text-center text-[1.4rem] text-ink-dim max-sm:rotate-90" aria-hidden="true">
          →
        </div>
        <ul className="m-0 list-none space-y-1.5 p-0">
          {tenants.map((t) => (
            <li key={t} className="rounded-md border border-line bg-bg-code px-3 py-1.5 font-mono text-[0.8rem]">
              <span className="text-sky-strong">{t}</span>
              <span className="text-ink-dim">.yourapp.com</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="mb-0 mt-3 text-center font-mono text-[0.72rem] text-ink-dim">
        req.headers.host → &ldquo;acme.yourapp.com&rdquo; → tenant = acme
      </p>
    </Figure>
  );
}
