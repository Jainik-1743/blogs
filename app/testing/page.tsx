import type { Metadata } from "next";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { TESTING_SERIES } from "@/lib/iv";

export const metadata: Metadata = { title: TESTING_SERIES.title, description: TESTING_SERIES.tagline };

export default function TestingIndexPage() {
  return <IvSeriesIndex series={TESTING_SERIES} />;
}
