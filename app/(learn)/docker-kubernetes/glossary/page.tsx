import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { DOCKERK8S_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = pageMetadata("/docker-kubernetes/glossary");

export default function DockerKubernetesGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(DOCKERK8S_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={DOCKERK8S_SERIES.lessons} href={(l) => ivLessonHref(DOCKERK8S_SERIES, l)} series={DOCKERK8S_SERIES} />
    </>
  );
}
