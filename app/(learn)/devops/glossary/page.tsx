import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import GlossaryIndex from "@/components/GlossaryIndex";
import { DEVOPS_GLOSSARY } from "@/lib/glossary";

export const metadata: Metadata = pageMetadata("/devops/glossary");

export default function GlossaryPage() {
  return <GlossaryIndex glossary={DEVOPS_GLOSSARY} />;
}
