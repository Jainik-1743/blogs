import type { Metadata } from "next";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { AIENGINEERING_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = {
  title: "AI Engineering Glossary",
  description: `Every term used in "${AIENGINEERING_SERIES.short}", with a one-line meaning and the lesson that explains it.`,
};

export default function AiEngineeringGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(AIENGINEERING_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={AIENGINEERING_SERIES.lessons} href={(l) => ivLessonHref(AIENGINEERING_SERIES, l)} series={AIENGINEERING_SERIES} />
    </>
  );
}
