import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { NETWORKING_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = pageMetadata("/networking/glossary");

export default function NetworkingGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(NETWORKING_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={NETWORKING_SERIES.lessons} href={(l) => ivLessonHref(NETWORKING_SERIES, l)} series={NETWORKING_SERIES} />
    </>
  );
}
