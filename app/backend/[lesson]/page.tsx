import type { Metadata } from "next";
import { notFound } from "next/navigation";
import IvLessonPage from "@/components/iv/IvLessonPage";
import { BACKEND_SERIES } from "@/lib/iv";

export const dynamicParams = false;

export function generateStaticParams() {
  return BACKEND_SERIES.lessons.filter((l) => l.published).map((l) => ({ lesson: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lesson: string }> }): Promise<Metadata> {
  const { lesson: slug } = await params;
  const l = BACKEND_SERIES.lessons.find((x) => x.slug === slug);
  return l ? { title: `Lesson ${l.number} — ${l.title}`, description: l.summary } : {};
}

export default async function BackendLessonRoute({ params }: { params: Promise<{ lesson: string }> }) {
  const { lesson } = await params;
  if (!BACKEND_SERIES.lessons.some((l) => l.slug === lesson && l.published)) notFound();
  return <IvLessonPage series={BACKEND_SERIES} slug={lesson} />;
}
