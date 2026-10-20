import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { FRONTEND_SERIES } from "@/lib/iv";

export const metadata: Metadata = pageMetadata("/frontend-depth");

export default function FrontendIndexPage() {
  return <IvSeriesIndex series={FRONTEND_SERIES} />;
}
