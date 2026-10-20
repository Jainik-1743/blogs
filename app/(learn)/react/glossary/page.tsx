import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { REACT_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = pageMetadata("/react/glossary");

export default function ReactGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(REACT_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={REACT_SERIES.lessons} href={(l) => ivLessonHref(REACT_SERIES, l)} series={REACT_SERIES} />
    </>
  );
}
