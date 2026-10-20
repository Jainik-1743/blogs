import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { CSFOUNDATIONS_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = pageMetadata("/cs-foundations/glossary");

export default function CsFoundationsGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(CSFOUNDATIONS_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={CSFOUNDATIONS_SERIES.lessons} href={(l) => ivLessonHref(CSFOUNDATIONS_SERIES, l)} series={CSFOUNDATIONS_SERIES} />
    </>
  );
}
