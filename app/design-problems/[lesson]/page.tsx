import type { Metadata } from "next";
import { notFound } from "next/navigation";
import IvLessonPage from "@/components/iv/IvLessonPage";
import { DESIGN_SERIES } from "@/lib/iv";

export const dynamicParams = false;

export function generateStaticParams() {
  return DESIGN_SERIES.lessons.filter((l) => l.published).map((l) => ({ lesson: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lesson: string }> }): Promise<Metadata> {
  const { lesson: slug } = await params;
  const l = DESIGN_SERIES.lessons.find((x) => x.slug === slug);
  return l ? { title: `Lesson ${l.number} — ${l.title}`, description: l.summary } : {};
}

export default async function DesignLessonRoute({ params }: { params: Promise<{ lesson: string }> }) {
  const { lesson } = await params;
  if (!DESIGN_SERIES.lessons.some((l) => l.slug === lesson && l.published)) notFound();
  return <IvLessonPage series={DESIGN_SERIES} slug={lesson} />;
}
