import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { NODEJS_SERIES } from "@/lib/iv";

export const metadata: Metadata = pageMetadata("/nodejs");

export default function NodejsIndexPage() {
  return <IvSeriesIndex series={NODEJS_SERIES} />;
}
