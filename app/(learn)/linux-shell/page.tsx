import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { LINUX_SERIES } from "@/lib/iv";

export const metadata: Metadata = pageMetadata("/linux-shell");

export default function LinuxShellIndexPage() {
  return <IvSeriesIndex series={LINUX_SERIES} />;
}
