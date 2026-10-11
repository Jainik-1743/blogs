import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { AIENGINEERING_SERIES } from "@/lib/iv";

export const metadata: Metadata = pageMetadata("/ai-engineering");

export default function AiEngineeringIndexPage() {
  return <IvSeriesIndex series={AIENGINEERING_SERIES} />;
}
