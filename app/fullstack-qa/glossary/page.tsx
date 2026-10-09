import type { Metadata } from "next";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { FULLSTACK_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = {
  title: "Full-Stack Glossary",
  description: `Every term used in "${FULLSTACK_SERIES.short}", with a one-line meaning and the lesson that explains it.`,
};

export default function FullstackGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(FULLSTACK_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={FULLSTACK_SERIES.lessons} href={(l) => ivLessonHref(FULLSTACK_SERIES, l)} series={FULLSTACK_SERIES} />
    </>
  );
}
