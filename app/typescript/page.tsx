import type { Metadata } from "next";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { TYPESCRIPT_SERIES } from "@/lib/iv";

export const metadata: Metadata = { title: TYPESCRIPT_SERIES.title, description: TYPESCRIPT_SERIES.tagline };

export default function TypescriptIndexPage() {
  return <IvSeriesIndex series={TYPESCRIPT_SERIES} />;
}
