import type { Metadata } from "next";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { DEBUGGING_SERIES } from "@/lib/iv";

export const metadata: Metadata = { title: DEBUGGING_SERIES.title, description: DEBUGGING_SERIES.tagline };

export default function DebuggingIndexPage() {
  return <IvSeriesIndex series={DEBUGGING_SERIES} />;
}
