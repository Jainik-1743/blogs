import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { APIDESIGN_SERIES } from "@/lib/iv";

export const metadata: Metadata = pageMetadata("/api-design");

export default function ApiDesignIndexPage() {
  return <IvSeriesIndex series={APIDESIGN_SERIES} />;
}
