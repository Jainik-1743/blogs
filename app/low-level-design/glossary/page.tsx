import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { LLD_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = pageMetadata("/low-level-design/glossary");

export default function LowLevelDesignGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(LLD_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={LLD_SERIES.lessons} href={(l) => ivLessonHref(LLD_SERIES, l)} series={LLD_SERIES} />
    </>
  );
}
