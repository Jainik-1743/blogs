import type { Metadata } from "next";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { SD_GLOSSARY } from "@/lib/sd-glossary";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

export const metadata: Metadata = {
  title: "System Design Glossary",
  description:
    "Every short form used in the System Design series — TLS, CDN, ACID, CAP, SLO, JWT, K8s and the rest — with what it does and an everyday example.",
};

export default function SdGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={SD_GLOSSARY} />
      <LessonPager slug="glossary" lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </>
  );
}
