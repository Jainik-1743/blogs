import type { Metadata } from "next";
import GlossaryIndex from "@/components/GlossaryIndex";
import { DEVOPS_GLOSSARY } from "@/lib/glossary";

export const metadata: Metadata = {
  title: "DevOps Glossary",
  description: "Every short form used in the DevOps series, with its full name and meaning.",
};

export default function GlossaryPage() {
  return <GlossaryIndex glossary={DEVOPS_GLOSSARY} />;
}
