import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { DESIGNCASES_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = pageMetadata("/design-cases/glossary");

export default function DesignCasesGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(DESIGNCASES_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={DESIGNCASES_SERIES.lessons} href={(l) => ivLessonHref(DESIGNCASES_SERIES, l)} series={DESIGNCASES_SERIES} />
    </>
  );
}
