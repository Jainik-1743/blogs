import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { BROWSER_SERIES } from "@/lib/iv";

export const metadata: Metadata = pageMetadata("/browser");

export default function BrowserIndexPage() {
  return <IvSeriesIndex series={BROWSER_SERIES} />;
}
