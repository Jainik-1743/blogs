import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { DESIGN_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = pageMetadata("/design-problems/glossary");

export default function DesignGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(DESIGN_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={DESIGN_SERIES.lessons} href={(l) => ivLessonHref(DESIGN_SERIES, l)} series={DESIGN_SERIES} />
    </>
  );
}
