import type { Metadata } from "next";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { DESIGN_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = {
  title: "Design Glossary",
  description: `Every term used in "${DESIGN_SERIES.short}", with a one-line meaning and the lesson that explains it.`,
};

export default function DesignGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(DESIGN_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={DESIGN_SERIES.lessons} href={(l) => ivLessonHref(DESIGN_SERIES, l)} series={DESIGN_SERIES} />
    </>
  );
}
