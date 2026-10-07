import type { Metadata } from "next";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { BROWSER_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = {
  title: "Browser Glossary",
  description: `Every term used in "${BROWSER_SERIES.short}", with a one-line meaning and the lesson that explains it.`,
};

export default function BrowserGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(BROWSER_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={BROWSER_SERIES.lessons} href={(l) => ivLessonHref(BROWSER_SERIES, l)} series={BROWSER_SERIES} />
    </>
  );
}
