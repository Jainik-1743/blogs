import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { DESIGN_SERIES } from "@/lib/iv";

export const metadata: Metadata = pageMetadata("/design-problems");

export default function DesignIndexPage() {
  return <IvSeriesIndex series={DESIGN_SERIES} />;
}
