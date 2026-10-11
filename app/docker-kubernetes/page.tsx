import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import IvSeriesIndex from "@/components/iv/IvSeriesIndex";
import { DOCKERK8S_SERIES } from "@/lib/iv";

export const metadata: Metadata = pageMetadata("/docker-kubernetes");

export default function DockerKubernetesIndexPage() {
  return <IvSeriesIndex series={DOCKERK8S_SERIES} />;
}
