import type { Metadata } from "next";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { LLD_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = {
  title: "Design Patterns & LLD Glossary",
  description: `Every term used in "${LLD_SERIES.short}", with a one-line meaning and the lesson that explains it.`,
};

export default function LowLevelDesignGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(LLD_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={LLD_SERIES.lessons} href={(l) => ivLessonHref(LLD_SERIES, l)} series={LLD_SERIES} />
    </>
  );
}
