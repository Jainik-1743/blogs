import type { Metadata } from "next";
import RoadmapPage from "@/components/RoadmapPage";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("/roadmap/detailed");

export default function Page() {
  return <RoadmapPage view="all" />;
}
