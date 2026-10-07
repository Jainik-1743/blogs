import type { Metadata } from "next";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { DESIGN_SERIES } from "@/lib/iv";

export const metadata: Metadata = { title: DESIGN_SERIES.title, description: DESIGN_SERIES.tagline };

export default function DesignIndexPage() {
  return <IvSeriesIndex series={DESIGN_SERIES} />;
}
