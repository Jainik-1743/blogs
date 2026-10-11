import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { CSFOUNDATIONS_SERIES } from "@/lib/iv";

export const metadata: Metadata = pageMetadata("/cs-foundations");

export default function CsFoundationsIndexPage() {
  return <IvSeriesIndex series={CSFOUNDATIONS_SERIES} />;
}
