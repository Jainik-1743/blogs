import type { Metadata } from "next";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { TESTING_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = {
  title: "Testing Glossary",
  description: `Every term used in "${TESTING_SERIES.short}", with a one-line meaning and the lesson that explains it.`,
};

export default function TestingGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(TESTING_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={TESTING_SERIES.lessons} href={(l) => ivLessonHref(TESTING_SERIES, l)} series={TESTING_SERIES} />
    </>
  );
}
