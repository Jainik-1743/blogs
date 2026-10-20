import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { FRONTEND_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = pageMetadata("/frontend-depth/glossary");

export default function FrontendGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(FRONTEND_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={FRONTEND_SERIES.lessons} href={(l) => ivLessonHref(FRONTEND_SERIES, l)} series={FRONTEND_SERIES} />
    </>
  );
}
