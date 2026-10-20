import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { FULLSTACK_SERIES } from "@/lib/iv";

export const metadata: Metadata = pageMetadata("/fullstack-qa");

export default function FullstackIndexPage() {
  return <IvSeriesIndex series={FULLSTACK_SERIES} />;
}
