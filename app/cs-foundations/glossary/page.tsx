import type { Metadata } from "next";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { CSFOUNDATIONS_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = {
  title: "CS Foundations Glossary",
  description: `Every term used in "${CSFOUNDATIONS_SERIES.short}", with a one-line meaning and the lesson that explains it.`,
};

export default function CsFoundationsGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(CSFOUNDATIONS_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={CSFOUNDATIONS_SERIES.lessons} href={(l) => ivLessonHref(CSFOUNDATIONS_SERIES, l)} series={CSFOUNDATIONS_SERIES} />
    </>
  );
}
