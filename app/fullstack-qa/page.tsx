import type { Metadata } from "next";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { FULLSTACK_SERIES } from "@/lib/iv";

export const metadata: Metadata = { title: FULLSTACK_SERIES.title, description: FULLSTACK_SERIES.tagline };

export default function FullstackIndexPage() {
  return <IvSeriesIndex series={FULLSTACK_SERIES} />;
}
