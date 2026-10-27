import type { Metadata } from "next";
import PageHeader from "@/components/page/PageHeader";
import SheetGrid from "@/components/cheatsheets/SheetGrid";
import Link from "next/link";
import { GROUPS, SHEETS } from "@/lib/cheatsheets";
import { SERIES_SHEETS } from "@/lib/series-sheets";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("/cheatsheets");

export default function CheatSheetsPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Cheat sheets" }]}
        eyebrow="Quick reference"
        title="Developer cheat sheets"
        summary="One page for each tool and topic: the commands, code and ideas you look up most, each with a plain explanation. Read them here for free. Signed-in readers can also download any sheet as a PNG or a PDF."
        meta={[
          { label: "Sheets", value: String(SHEETS.length) },
          { label: "Areas", value: String(GROUPS.length) },
          { label: "Download", value: "PNG and PDF" },
          { label: "Cost", value: "Free" },
        ]}
      />
      <Link
        href="/cheatsheets/series"
        className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky/40 bg-sky-soft px-5 py-4 text-ink transition hover:-translate-y-0.5 hover:border-sky hover:no-underline"
      >
        <span>
          <span className="block font-mono text-[0.72rem] uppercase tracking-[0.12em] text-sky">New</span>
          <span className="block text-[1.1rem] font-semibold">Cheat sheets by series: {Object.keys(SERIES_SHEETS).length} printable pages</span>
          <span className="block text-[0.92rem] text-ink-dim">One dense page for every lesson series, with each card linked to the lesson that teaches it.</span>
        </span>
        <span className="font-semibold text-sky">Browse by series →</span>
      </Link>
      <SheetGrid />
    </>
  );
}
