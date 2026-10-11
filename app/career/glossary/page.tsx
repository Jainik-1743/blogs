import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { CAREER_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = pageMetadata("/career/glossary");

export default function CareerGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(CAREER_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={CAREER_SERIES.lessons} href={(l) => ivLessonHref(CAREER_SERIES, l)} series={CAREER_SERIES} />
    </>
  );
}
