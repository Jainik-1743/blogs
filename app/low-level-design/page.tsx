import type { Metadata } from "next";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { LLD_SERIES } from "@/lib/iv";

export const metadata: Metadata = { title: LLD_SERIES.title, description: LLD_SERIES.tagline };

export default function LowLevelDesignIndexPage() {
  return <IvSeriesIndex series={LLD_SERIES} />;
}
