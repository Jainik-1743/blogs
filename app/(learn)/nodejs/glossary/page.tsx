import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { NODEJS_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = pageMetadata("/nodejs/glossary");

export default function NodejsGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(NODEJS_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={NODEJS_SERIES.lessons} href={(l) => ivLessonHref(NODEJS_SERIES, l)} series={NODEJS_SERIES} />
    </>
  );
}
