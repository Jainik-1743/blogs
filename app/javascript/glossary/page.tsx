import type { Metadata } from "next";
import GlossaryIndex from "@/components/GlossaryIndex";
import { JS_GLOSSARY } from "@/lib/js-glossary";

export const metadata: Metadata = {
  title: "JavaScript Glossary",
  description: "Every term used in the JavaScript series — execution context, call stack, hoisting, closures, the event loop — with a one-line meaning.",
};

export default function JsGlossaryPage() {
  return <GlossaryIndex glossary={JS_GLOSSARY} />;
}
