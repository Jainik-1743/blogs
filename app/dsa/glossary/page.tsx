import type { Metadata } from "next";
import GlossaryIndex from "@/components/GlossaryIndex";
import { DSA_GLOSSARY } from "@/lib/dsa-glossary";

export const metadata: Metadata = {
  title: "DSA Glossary",
  description: "Every term used in the DSA series — loops, accumulators, off-by-one, arrays, frequency maps — with a one-line meaning.",
};

export default function DsaGlossaryPage() {
  return <GlossaryIndex glossary={DSA_GLOSSARY} />;
}
