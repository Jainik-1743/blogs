import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { TYPESCRIPT_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = pageMetadata("/typescript/glossary");

export default function TypescriptGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(TYPESCRIPT_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={TYPESCRIPT_SERIES.lessons} href={(l) => ivLessonHref(TYPESCRIPT_SERIES, l)} series={TYPESCRIPT_SERIES} />
    </>
  );
}
