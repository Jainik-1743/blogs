import type { Metadata } from "next";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { DESIGNCASES_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = {
  title: "System Design Case Studies Glossary",
  description: `Every term used in "${DESIGNCASES_SERIES.short}", with a one-line meaning and the lesson that explains it.`,
};

export default function DesignCasesGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(DESIGNCASES_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={DESIGNCASES_SERIES.lessons} href={(l) => ivLessonHref(DESIGNCASES_SERIES, l)} series={DESIGNCASES_SERIES} />
    </>
  );
}
