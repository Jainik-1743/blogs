import type { Metadata } from "next";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { BROWSER_SERIES } from "@/lib/iv";

export const metadata: Metadata = { title: BROWSER_SERIES.title, description: BROWSER_SERIES.tagline };

export default function BrowserIndexPage() {
  return <IvSeriesIndex series={BROWSER_SERIES} />;
}
