import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { GITGITHUB_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = pageMetadata("/git-github/glossary");

export default function GitGithubGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(GITGITHUB_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={GITGITHUB_SERIES.lessons} href={(l) => ivLessonHref(GITGITHUB_SERIES, l)} series={GITGITHUB_SERIES} />
    </>
  );
}
