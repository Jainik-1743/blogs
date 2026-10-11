import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { TYPESCRIPT_SERIES } from "@/lib/iv";

export const metadata: Metadata = pageMetadata("/typescript");

export default function TypescriptIndexPage() {
  return <IvSeriesIndex series={TYPESCRIPT_SERIES} />;
}
