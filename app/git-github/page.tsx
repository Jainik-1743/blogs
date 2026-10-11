import type { Metadata } from "next";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { GITGITHUB_SERIES } from "@/lib/iv";

export const metadata: Metadata = { title: GITGITHUB_SERIES.title, description: GITGITHUB_SERIES.tagline };

export default function GitGithubIndexPage() {
  return <IvSeriesIndex series={GITGITHUB_SERIES} />;
}
