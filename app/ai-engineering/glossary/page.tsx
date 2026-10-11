import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { AIENGINEERING_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = pageMetadata("/ai-engineering/glossary");

export default function AiEngineeringGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(AIENGINEERING_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={AIENGINEERING_SERIES.lessons} href={(l) => ivLessonHref(AIENGINEERING_SERIES, l)} series={AIENGINEERING_SERIES} />
    </>
  );
}
