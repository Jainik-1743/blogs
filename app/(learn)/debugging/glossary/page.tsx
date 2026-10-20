import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { DEBUGGING_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = pageMetadata("/debugging/glossary");

export default function DebuggingGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(DEBUGGING_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={DEBUGGING_SERIES.lessons} href={(l) => ivLessonHref(DEBUGGING_SERIES, l)} series={DEBUGGING_SERIES} />
    </>
  );
}
