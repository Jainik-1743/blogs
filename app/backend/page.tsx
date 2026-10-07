import type { Metadata } from "next";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { BACKEND_SERIES } from "@/lib/iv";

export const metadata: Metadata = { title: BACKEND_SERIES.title, description: BACKEND_SERIES.tagline };

export default function BackendIndexPage() {
  return <IvSeriesIndex series={BACKEND_SERIES} />;
}
