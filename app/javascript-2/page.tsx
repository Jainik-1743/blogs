import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { JAVASCRIPT2_SERIES } from "@/lib/iv";

export const metadata: Metadata = pageMetadata("/javascript-2");

export default function Javascript2IndexPage() {
  return <IvSeriesIndex series={JAVASCRIPT2_SERIES} />;
}
