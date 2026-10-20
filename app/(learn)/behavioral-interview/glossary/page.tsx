import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { BEHAVIORAL_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = pageMetadata("/behavioral-interview/glossary");

export default function BehavioralInterviewGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(BEHAVIORAL_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={BEHAVIORAL_SERIES.lessons} href={(l) => ivLessonHref(BEHAVIORAL_SERIES, l)} series={BEHAVIORAL_SERIES} />
    </>
  );
}
