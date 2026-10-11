import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { NEXTJS_SERIES } from "@/lib/iv";

export const metadata: Metadata = pageMetadata("/nextjs");

export default function NextjsIndexPage() {
  return <IvSeriesIndex series={NEXTJS_SERIES} />;
}
