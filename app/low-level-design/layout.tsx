import { LLD_SERIES } from "@/lib/iv";

/** Every /low-level-design page carries the series accent. */
export default function LowLevelDesignLayout({ children }: { children: React.ReactNode }) {
  return <div data-page-accent={LLD_SERIES.accent}>{children}</div>;
}
