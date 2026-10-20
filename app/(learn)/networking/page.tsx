import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { NETWORKING_SERIES } from "@/lib/iv";

export const metadata: Metadata = pageMetadata("/networking");

export default function NetworkingIndexPage() {
  return <IvSeriesIndex series={NETWORKING_SERIES} />;
}
