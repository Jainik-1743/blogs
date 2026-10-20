import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import GlossaryIndex from "@/components/GlossaryIndex";
import { JS_GLOSSARY } from "@/lib/js-glossary";

export const metadata: Metadata = pageMetadata("/javascript/glossary");

export default function JsGlossaryPage() {
  return <GlossaryIndex glossary={JS_GLOSSARY} />;
}
