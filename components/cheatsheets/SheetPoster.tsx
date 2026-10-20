import type { Sheet } from "@/lib/cheatsheets";

/**
 * The cheat sheet itself. It is plain server-rendered HTML so search engines can read it, and the same markup is
 * copied into an off-screen page for the PNG and PDF downloads (see DownloadBar). Cards flow in CSS columns:
 * one on a phone, two on a tablet, three on a wide screen or in the download.
 */
export default function SheetPoster({ sheet }: { sheet: Sheet }) {
  return (
    <div id="sheet-poster" data-accent={sheet.accent} data-no-glossary className="rounded-2xl border border-line bg-bg p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
        <div className="min-w-0">
          <p className="m-0 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-sky">Cheat sheet</p>
          <h2 className="m-0 mt-1 text-[1.6rem] font-bold leading-tight tracking-tight text-ink">{sheet.title.replace(/ cheat sheet$/, "")}</h2>
          <p className="m-0 mt-1 max-w-[60ch] text-[0.92rem] text-ink-dim">{sheet.blurb}</p>
        </div>
        <span className="font-mono text-[0.8rem] font-semibold text-ink-dim">/blogs</span>
      </div>

      <div className="cs-columns">
        {sheet.sections.map((s) => (
          <section key={s.title} className="cs-card mb-4 break-inside-avoid rounded-xl border border-line bg-bg-elev p-4">
            <h3 className="m-0 mb-2 text-[0.8rem] font-bold uppercase tracking-[0.1em] text-sky">{s.title}</h3>
            <dl className="m-0">
              {s.rows.map(([code, meaning]) => (
                <div key={code} className="border-t border-line py-2 first:border-t-0 first:pt-0">
                  <dt className="m-0"><code className="block whitespace-pre-wrap break-words rounded-md bg-bg-code px-2 py-1 font-mono text-[0.78rem] leading-snug text-ink">{code}</code></dt>
                  <dd className="m-0 mt-1 text-[0.84rem] leading-snug text-ink-dim">{meaning}</dd>
                </div>
              ))}
            </dl>
            {s.note && <p className="m-0 mt-2 border-t border-line pt-2 text-[0.8rem] italic text-ink-dim">{s.note}</p>}
          </section>
        ))}
        <section className="cs-card mb-4 break-inside-avoid rounded-xl border border-sky/40 bg-sky-soft p-4">
          <h3 className="m-0 mb-2 text-[0.8rem] font-bold uppercase tracking-[0.1em] text-sky">Remember</h3>
          <ul className="m-0 list-disc space-y-1.5 pl-5 text-[0.84rem] leading-snug text-ink">
            {sheet.tips.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </section>
      </div>
    </div>
  );
}
