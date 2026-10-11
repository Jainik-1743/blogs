import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { DEBUGGING_SERIES } from "@/lib/iv";

export const metadata: Metadata = pageMetadata("/debugging");

export default function DebuggingIndexPage() {
  return <IvSeriesIndex series={DEBUGGING_SERIES} />;
}
