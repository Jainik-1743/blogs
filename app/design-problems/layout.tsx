import { DESIGN_SERIES } from "@/lib/iv";

/** Every /design-problems page carries the series accent. */
export default function DesignLayout({ children }: { children: React.ReactNode }) {
  return <div data-page-accent={DESIGN_SERIES.accent}>{children}</div>;
}
