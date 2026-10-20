import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { DESIGNCASES_SERIES } from "@/lib/iv";

export const metadata: Metadata = pageMetadata("/design-cases");

export default function DesignCasesIndexPage() {
  return <IvSeriesIndex series={DESIGNCASES_SERIES} />;
}
