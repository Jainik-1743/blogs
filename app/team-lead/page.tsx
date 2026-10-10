import type { Metadata } from "next";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { TEAMLEAD_SERIES } from "@/lib/iv";

export const metadata: Metadata = { title: TEAMLEAD_SERIES.title, description: TEAMLEAD_SERIES.tagline };

export default function TeamLeadIndexPage() {
  return <IvSeriesIndex series={TEAMLEAD_SERIES} />;
}
