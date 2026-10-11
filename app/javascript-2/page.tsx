import type { Metadata } from "next";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { JAVASCRIPT2_SERIES } from "@/lib/iv";

export const metadata: Metadata = { title: JAVASCRIPT2_SERIES.title, description: JAVASCRIPT2_SERIES.tagline };

export default function Javascript2IndexPage() {
  return <IvSeriesIndex series={JAVASCRIPT2_SERIES} />;
}
