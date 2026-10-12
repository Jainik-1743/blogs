import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { OBSERVABILITY_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = pageMetadata("/observability/glossary");

export default function ObservabilityGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(OBSERVABILITY_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={OBSERVABILITY_SERIES.lessons} href={(l) => ivLessonHref(OBSERVABILITY_SERIES, l)} series={OBSERVABILITY_SERIES} />
    </>
  );
}
