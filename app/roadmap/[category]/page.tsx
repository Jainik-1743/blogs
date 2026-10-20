import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RoadmapPage from "@/components/RoadmapPage";
import { STAGES, stageBySlug, stageSlug } from "@/lib/roadmap-stages";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return STAGES.map((st) => ({ category: stageSlug(st.title) }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  return pageMetadata(`/roadmap/${category}`);
}

export default async function CategoryRoadmapPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  if (!stageBySlug(category)) notFound();
  return <RoadmapPage view="category" category={category} />;
}
