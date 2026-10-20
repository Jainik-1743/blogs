import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { SD_GLOSSARY } from "@/lib/sd-glossary";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

export const metadata: Metadata = pageMetadata("/system-design/glossary");

export default function SdGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={SD_GLOSSARY} />
      <LessonPager slug="glossary" lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </>
  );
}
