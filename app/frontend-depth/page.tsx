import type { Metadata } from "next";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { FRONTEND_SERIES } from "@/lib/iv";

export const metadata: Metadata = { title: FRONTEND_SERIES.title, description: FRONTEND_SERIES.tagline };

export default function FrontendIndexPage() {
  return <IvSeriesIndex series={FRONTEND_SERIES} />;
}
