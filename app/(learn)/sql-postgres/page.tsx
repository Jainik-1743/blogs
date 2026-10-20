import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { SQLPOSTGRES_SERIES } from "@/lib/iv";

export const metadata: Metadata = pageMetadata("/sql-postgres");

export default function SqlPostgresIndexPage() {
  return <IvSeriesIndex series={SQLPOSTGRES_SERIES} />;
}
