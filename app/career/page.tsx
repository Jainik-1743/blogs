import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { CAREER_SERIES } from "@/lib/iv";

export const metadata: Metadata = pageMetadata("/career");

export default function CareerIndexPage() {
  return <IvSeriesIndex series={CAREER_SERIES} />;
}
