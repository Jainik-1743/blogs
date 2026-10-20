import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { LLD_SERIES } from "@/lib/iv";

export const metadata: Metadata = pageMetadata("/low-level-design");

export default function LowLevelDesignIndexPage() {
  return <IvSeriesIndex series={LLD_SERIES} />;
}
