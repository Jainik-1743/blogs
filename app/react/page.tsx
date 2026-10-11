import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { REACT_SERIES } from "@/lib/iv";

export const metadata: Metadata = pageMetadata("/react");

export default function ReactIndexPage() {
  return <IvSeriesIndex series={REACT_SERIES} />;
}
