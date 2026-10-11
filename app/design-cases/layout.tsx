import { DESIGNCASES_SERIES } from "@/lib/iv";

/** Every /design-cases page carries the series accent. */
export default function DesignCasesLayout({ children }: { children: React.ReactNode }) {
  return <div data-page-accent={DESIGNCASES_SERIES.accent}>{children}</div>;
}
