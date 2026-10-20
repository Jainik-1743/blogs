import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import GlossaryIndex from "@/components/GlossaryIndex";
import { DSA_GLOSSARY } from "@/lib/dsa-glossary";

export const metadata: Metadata = pageMetadata("/dsa/glossary");

export default function DsaGlossaryPage() {
  return <GlossaryIndex glossary={DSA_GLOSSARY} />;
}
