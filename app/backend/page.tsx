import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { BACKEND_SERIES } from "@/lib/iv";

export const metadata: Metadata = pageMetadata("/backend");

export default function BackendIndexPage() {
  return <IvSeriesIndex series={BACKEND_SERIES} />;
}
