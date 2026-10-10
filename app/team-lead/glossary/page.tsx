import type { Metadata } from "next";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { TEAMLEAD_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = {
  title: "Team Lead Glossary",
  description: `Every term used in "${TEAMLEAD_SERIES.short}", with a one-line meaning and the lesson that explains it.`,
};

export default function TeamLeadGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(TEAMLEAD_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={TEAMLEAD_SERIES.lessons} href={(l) => ivLessonHref(TEAMLEAD_SERIES, l)} series={TEAMLEAD_SERIES} />
    </>
  );
}
