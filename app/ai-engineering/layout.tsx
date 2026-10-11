import { AIENGINEERING_SERIES } from "@/lib/iv";

/** Every /ai-engineering page carries the series accent. */
export default function AiEngineeringLayout({ children }: { children: React.ReactNode }) {
  return <div data-page-accent={AIENGINEERING_SERIES.accent}>{children}</div>;
}
