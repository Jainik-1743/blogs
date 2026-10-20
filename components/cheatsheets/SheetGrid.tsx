"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { inputClass } from "@/components/auth/fields";
import { GROUPS, SHEETS, rowCount, sheetPath } from "@/lib/cheatsheets";

/** Every cheat sheet as a card, grouped by area, with a search box. Cards open the sheet's own page. */
export default function SheetGrid() {
  const [query, setQuery] = useState("");
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? SHEETS.filter((s) => `${s.title} ${s.blurb} ${s.badge}`.toLowerCase().includes(q)) : SHEETS;
    return GROUPS.map((g) => ({ group: g, sheets: list.filter((s) => s.group === g) })).filter((g) => g.sheets.length > 0);
  }, [query]);

  return (
    <>
      <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search cheat sheets (git, sql, docker…)" aria-label="Search cheat sheets" className={`${inputClass} mb-10 max-w-md`} />
      {groups.length === 0 && <p className="text-ink-dim">No cheat sheet matches that. <button type="button" onClick={() => setQuery("")} className="text-sky hover:underline">Clear the search</button></p>}
      <div className="flex flex-col gap-12">
        {groups.map(({ group, sheets }) => (
          <section key={group} aria-labelledby={`g-${group}`}>
            <h2 id={`g-${group}`} className="m-0 mb-4 border-b border-line pb-3 text-[1.3rem] font-bold tracking-tight text-ink">{group} <span className="ml-1 text-[0.9rem] font-normal text-ink-dim">{sheets.length}</span></h2>
            <ul className="m-0 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {sheets.map((s) => (
                <li key={s.slug} data-accent={s.accent} className="m-0">
                  <Link href={sheetPath(s.slug)} className="group flex h-full flex-col rounded-xl border border-line bg-bg-elev p-6 text-ink transition duration-200 hover:border-sky hover:no-underline">
                    <div className="flex items-center justify-between">
                      <span className="grid h-10 min-w-10 place-items-center rounded-lg bg-sky-soft px-2 font-mono text-[0.8rem] font-bold text-sky-strong">{s.badge}</span>
                      <span className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-ink-dim">{rowCount(s)} items</span>
                    </div>
                    <h3 className="mt-5 mb-2 text-[1.1rem] font-semibold leading-snug text-ink">{s.title.replace(/ cheat sheet$/, "")}</h3>
                    <p className="m-0 line-clamp-3 flex-1 text-[0.9rem] text-ink-dim">{s.blurb}</p>
                    <span className="mt-4 text-[0.88rem] font-semibold text-sky">Open the sheet <span aria-hidden="true" className="inline-block transition group-hover:translate-x-1">→</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
