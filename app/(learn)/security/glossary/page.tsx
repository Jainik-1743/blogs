import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { SECURITY_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = pageMetadata("/security/glossary");

export default function SecurityGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(SECURITY_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={SECURITY_SERIES.lessons} href={(l) => ivLessonHref(SECURITY_SERIES, l)} series={SECURITY_SERIES} />
    </>
  );
}
