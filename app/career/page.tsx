import type { Metadata } from "next";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { CAREER_SERIES } from "@/lib/iv";

export const metadata: Metadata = { title: CAREER_SERIES.title, description: CAREER_SERIES.tagline };

export default function CareerIndexPage() {
  return <IvSeriesIndex series={CAREER_SERIES} />;
}
