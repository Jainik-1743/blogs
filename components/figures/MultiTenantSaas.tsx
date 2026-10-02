import Figure from "./Figure";

/** Three companies share one app and one database; a tenant_id on every row keeps their data apart. */
const tenants = [
  { name: "Company A", id: "a", dot: "bg-sky", text: "text-sky" },
  { name: "Company B", id: "b", dot: "bg-amber-400", text: "text-amber-300" },
  { name: "Company C", id: "c", dot: "bg-emerald-400", text: "text-emerald-300" },
];

const rows = [
  { t: 0, what: "Quote #1042" },
  { t: 1, what: "Quote #0007" },
  { t: 0, what: "Invoice #318" },
  { t: 2, what: "Quote #2210" },
  { t: 1, what: "Customer: Rao" },
];

const box = "rounded-lg border px-3 py-2";

export default function MultiTenantSaas() {
  return (
    <Figure caption="One app, one database, many companies. Every row carries a tenant_id, and every query filters by it — that line is what keeps Company A from ever seeing Company B's quotes.">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* Main path: tenants → app → database */}
        <div>
          <div className="grid grid-cols-3 gap-2">
            {tenants.map((t) => (
              <div key={t.id} className={`${box} border-line bg-bg-code text-center`}>
                <span className={`mx-auto mb-1 block h-2.5 w-2.5 rounded-full ${t.dot}`} />
                <div className="text-[0.8rem] font-medium text-ink">{t.name}</div>
              </div>
            ))}
          </div>
          <div className="py-1 text-center text-ink-dim" aria-hidden="true">↓ ↓ ↓</div>
          <div className={`${box} border-violet-400/50 bg-violet-400/10 text-center`}>
            <div className="text-[0.9rem] font-semibold text-ink">One Next.js / Node app on EC2</div>
            <code className="mt-1 inline-block text-[0.72rem]">WHERE tenant_id = :current_company</code>
          </div>
          <div className="py-1 text-center text-ink-dim" aria-hidden="true">↓</div>
          <div className={`${box} border-emerald-400/50 bg-emerald-400/10`}>
            <div className="mb-1.5 text-center text-[0.9rem] font-semibold text-ink">One PostgreSQL database (RDS)</div>
            <div className="overflow-hidden rounded-md border border-line font-mono text-[0.72rem]">
              <div className="grid grid-cols-[5.5rem_1fr] bg-bg-code px-2 py-1 text-ink-dim">
                <span>tenant_id</span>
                <span>row</span>
              </div>
              {rows.map((r, i) => {
                const t = tenants[r.t];
                return (
                  <div key={i} className="grid grid-cols-[5.5rem_1fr] border-t border-line px-2 py-1">
                    <span className={`inline-flex items-center gap-1.5 ${t.text}`}>
                      <span className={`h-2 w-2 rounded-full ${t.dot}`} />
                      {t.id}
                    </span>
                    <span className="text-ink">{r.what}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* The two needs a PaaS struggles with */}
        <div className="flex flex-col gap-3">
          <div className={`${box} border-line bg-bg-code`}>
            <div className="mb-2 text-[0.88rem] font-semibold text-ink">Background worker</div>
            {[
              { job: "PDF quotation", time: "~3 min" },
              { job: "Email 2,000 customers", time: "~8 min" },
              { job: "Nightly report", time: "~20 min" },
            ].map((j) => (
              <div key={j.job} className="mb-1 flex justify-between gap-2 text-[0.78rem]">
                <span className="text-ink">{j.job}</span>
                <span className="font-mono text-ink-dim">{j.time}</span>
              </div>
            ))}
            <div className="mt-1.5 font-mono text-[0.68rem] text-emerald-300">no time limit on your own server</div>
          </div>

          <div className={`${box} border-line bg-bg-code`}>
            <div className="mb-2 text-[0.88rem] font-semibold text-ink">Month-end rush</div>
            <div className="grid grid-cols-[4.5rem_1fr] items-center gap-y-1.5 text-[0.76rem]">
              <span className="text-ink-dim">normal day</span>
              <div className="flex gap-1">
                <span className="h-4 w-6 rounded-[3px] border border-violet-400/60 bg-violet-400/20" />
              </div>
              <span className="text-ink-dim">day 30</span>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-4 w-6 rounded-[3px] border border-violet-400/60 bg-violet-400/20" />
                ))}
              </div>
            </div>
            <div className="mt-1.5 font-mono text-[0.68rem] text-ink-dim">1 server → 3, then back to 1</div>
          </div>
        </div>
      </div>
    </Figure>
  );
}
