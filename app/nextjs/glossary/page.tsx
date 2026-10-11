import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { NEXTJS_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = pageMetadata("/nextjs/glossary");

export default function NextjsGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(NEXTJS_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={NEXTJS_SERIES.lessons} href={(l) => ivLessonHref(NEXTJS_SERIES, l)} series={NEXTJS_SERIES} />
    </>
  );
}
