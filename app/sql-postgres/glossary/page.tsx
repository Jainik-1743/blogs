import type { Metadata } from "next";
import GlossaryIndex from "@/components/GlossaryIndex";
import LessonPager from "@/components/LessonPager";
import { SQLPOSTGRES_SERIES, ivLessonHref } from "@/lib/iv";
import { ivGlossaryFor } from "@/lib/iv-glossary";

export const metadata: Metadata = {
  title: "SQL & PostgreSQL Glossary",
  description: `Every term used in "${SQLPOSTGRES_SERIES.short}", with a one-line meaning and the lesson that explains it.`,
};

export default function SqlPostgresGlossaryPage() {
  return (
    <>
      <GlossaryIndex glossary={ivGlossaryFor(SQLPOSTGRES_SERIES.slug)} />
      <LessonPager slug="glossary" lessons={SQLPOSTGRES_SERIES.lessons} href={(l) => ivLessonHref(SQLPOSTGRES_SERIES, l)} series={SQLPOSTGRES_SERIES} />
    </>
  );
}
