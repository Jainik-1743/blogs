import type { Metadata } from "next";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { JAVASCRIPT2_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = {
  title: "JavaScript Part 2 Glossary",
  description: `Every term used in "${JAVASCRIPT2_SERIES.short}", with a one-line meaning and the lesson that explains it.`,
};

export default function Javascript2GlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(JAVASCRIPT2_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={JAVASCRIPT2_SERIES.lessons} href={(l) => ivLessonHref(JAVASCRIPT2_SERIES, l)} series={JAVASCRIPT2_SERIES} />
    </>
  );
}
