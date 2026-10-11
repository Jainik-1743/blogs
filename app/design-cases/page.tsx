import type { Metadata } from "next";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { DESIGNCASES_SERIES } from "@/lib/iv";

export const metadata: Metadata = { title: DESIGNCASES_SERIES.title, description: DESIGNCASES_SERIES.tagline };

export default function DesignCasesIndexPage() {
  return <IvSeriesIndex series={DESIGNCASES_SERIES} />;
}
