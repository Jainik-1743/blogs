import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import IvLessonPage from "@/components/iv/IvLessonPage";
import { AIENGINEERING_SERIES } from "@/lib/iv";

export const dynamicParams = false;

export function generateStaticParams() {
  return AIENGINEERING_SERIES.lessons.filter((l) => l.published).map((l) => ({ lesson: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lesson: string }> }): Promise<Metadata> {
  const { lesson } = await params;
  return pageMetadata(`/ai-engineering/${lesson}`);
}

export default async function AiEngineeringLessonRoute({ params }: { params: Promise<{ lesson: string }> }) {
  const { lesson } = await params;
  if (!AIENGINEERING_SERIES.lessons.some((l) => l.slug === lesson && l.published)) notFound();
  return <IvLessonPage series={AIENGINEERING_SERIES} slug={lesson} />;
}
