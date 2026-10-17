import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { OBSERVABILITY_SERIES } from "@/lib/iv";

export const metadata: Metadata = pageMetadata("/observability");

export default function ObservabilityIndexPage() {
  return <IvSeriesIndex series={OBSERVABILITY_SERIES} />;
}
