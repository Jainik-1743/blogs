import type { Metadata } from "next";
import PageHeader from "@/components/page/PageHeader";
import SheetGrid from "@/components/cheatsheets/SheetGrid";
import { GROUPS, SHEETS } from "@/lib/cheatsheets";
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
      <SheetGrid />
    </>
  );
}
