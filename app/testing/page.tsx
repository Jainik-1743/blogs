import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { TESTING_SERIES } from "@/lib/iv";

export const metadata: Metadata = pageMetadata("/testing");

export default function TestingIndexPage() {
  return <IvSeriesIndex series={TESTING_SERIES} />;
}
