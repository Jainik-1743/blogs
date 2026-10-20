import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { LINUX_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = pageMetadata("/linux-shell/glossary");

export default function LinuxShellGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(LINUX_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={LINUX_SERIES.lessons} href={(l) => ivLessonHref(LINUX_SERIES, l)} series={LINUX_SERIES} />
    </>
  );
}
