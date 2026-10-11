import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import IvLessonPage from "@/components/iv/IvLessonPage";
import { JAVASCRIPT2_SERIES } from "@/lib/iv";

export const dynamicParams = false;

export function generateStaticParams() {
  return JAVASCRIPT2_SERIES.lessons.filter((l) => l.published).map((l) => ({ lesson: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lesson: string }> }): Promise<Metadata> {
  const { lesson } = await params;
  return pageMetadata(`/javascript-2/${lesson}`);
}

export default async function Javascript2LessonRoute({ params }: { params: Promise<{ lesson: string }> }) {
  const { lesson } = await params;
  if (!JAVASCRIPT2_SERIES.lessons.some((l) => l.slug === lesson && l.published)) notFound();
  return <IvLessonPage series={JAVASCRIPT2_SERIES} slug={lesson} />;
}
