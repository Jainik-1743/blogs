import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { GITGITHUB_SERIES } from "@/lib/iv";

export const metadata: Metadata = pageMetadata("/git-github");

export default function GitGithubIndexPage() {
  return <IvSeriesIndex series={GITGITHUB_SERIES} />;
}
