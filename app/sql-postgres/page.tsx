import type { Metadata } from "next";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { SQLPOSTGRES_SERIES } from "@/lib/iv";

export const metadata: Metadata = { title: SQLPOSTGRES_SERIES.title, description: SQLPOSTGRES_SERIES.tagline };

export default function SqlPostgresIndexPage() {
  return <IvSeriesIndex series={SQLPOSTGRES_SERIES} />;
}
