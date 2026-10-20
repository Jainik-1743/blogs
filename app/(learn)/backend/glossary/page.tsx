import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { BACKEND_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = pageMetadata("/backend/glossary");

export default function BackendGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(BACKEND_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={BACKEND_SERIES.lessons} href={(l) => ivLessonHref(BACKEND_SERIES, l)} series={BACKEND_SERIES} />
    </>
  );
}
