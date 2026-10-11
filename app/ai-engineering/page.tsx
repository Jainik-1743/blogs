import type { Metadata } from "next";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { AIENGINEERING_SERIES } from "@/lib/iv";

export const metadata: Metadata = { title: AIENGINEERING_SERIES.title, description: AIENGINEERING_SERIES.tagline };

export default function AiEngineeringIndexPage() {
  return <IvSeriesIndex series={AIENGINEERING_SERIES} />;
}
