import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { FULLSTACK_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = pageMetadata("/fullstack-qa/glossary");

export default function FullstackGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(FULLSTACK_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={FULLSTACK_SERIES.lessons} href={(l) => ivLessonHref(FULLSTACK_SERIES, l)} series={FULLSTACK_SERIES} />
    </>
  );
}
