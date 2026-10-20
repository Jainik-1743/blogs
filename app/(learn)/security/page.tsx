import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { SECURITY_SERIES } from "@/lib/iv";

export const metadata: Metadata = pageMetadata("/security");

export default function SecurityIndexPage() {
  return <IvSeriesIndex series={SECURITY_SERIES} />;
}
