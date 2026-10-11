import type { Metadata } from "next";
import { notFound } from "next/navigation";
import IvLessonPage from "@/components/iv/IvLessonPage";
import { TESTING_SERIES } from "@/lib/iv";

export const dynamicParams = false;

export function generateStaticParams() {
  return TESTING_SERIES.lessons.filter((l) => l.published).map((l) => ({ lesson: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lesson: string }> }): Promise<Metadata> {
  const { lesson: slug } = await params;
  const l = TESTING_SERIES.lessons.find((x) => x.slug === slug);
  return l ? { title: `Lesson ${l.number} — ${l.title}`, description: l.summary } : {};
}

export default async function TestingLessonRoute({ params }: { params: Promise<{ lesson: string }> }) {
  const { lesson } = await params;
  if (!TESTING_SERIES.lessons.some((l) => l.slug === lesson && l.published)) notFound();
  return <IvLessonPage series={TESTING_SERIES} slug={lesson} />;
}
