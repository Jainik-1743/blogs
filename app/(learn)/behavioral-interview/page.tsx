import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { BEHAVIORAL_SERIES } from "@/lib/iv";

export const metadata: Metadata = pageMetadata("/behavioral-interview");

export default function BehavioralInterviewIndexPage() {
  return <IvSeriesIndex series={BEHAVIORAL_SERIES} />;
}
