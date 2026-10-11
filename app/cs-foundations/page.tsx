import type { Metadata } from "next";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { CSFOUNDATIONS_SERIES } from "@/lib/iv";

export const metadata: Metadata = { title: CSFOUNDATIONS_SERIES.title, description: CSFOUNDATIONS_SERIES.tagline };

export default function CsFoundationsIndexPage() {
  return <IvSeriesIndex series={CSFOUNDATIONS_SERIES} />;
}
