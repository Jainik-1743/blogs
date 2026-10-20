import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { TEAMLEAD_SERIES } from "@/lib/iv";

export const metadata: Metadata = pageMetadata("/team-lead");

export default function TeamLeadIndexPage() {
  return <IvSeriesIndex series={TEAMLEAD_SERIES} />;
}
