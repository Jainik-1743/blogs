import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { APIDESIGN_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = pageMetadata("/api-design/glossary");

export default function ApiDesignGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(APIDESIGN_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={APIDESIGN_SERIES.lessons} href={(l) => ivLessonHref(APIDESIGN_SERIES, l)} series={APIDESIGN_SERIES} />
    </>
  );
}
