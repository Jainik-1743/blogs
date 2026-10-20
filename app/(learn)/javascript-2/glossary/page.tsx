import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { JAVASCRIPT2_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = pageMetadata("/javascript-2/glossary");

export default function Javascript2GlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(JAVASCRIPT2_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={JAVASCRIPT2_SERIES.lessons} href={(l) => ivLessonHref(JAVASCRIPT2_SERIES, l)} series={JAVASCRIPT2_SERIES} />
    </>
  );
}
