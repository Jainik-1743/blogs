import { TYPESCRIPT_SERIES } from "@/lib/iv";

/** Every /typescript page carries the series accent. */
export default function TypescriptLayout({ children }: { children: React.ReactNode }) {
  return <div data-page-accent={TYPESCRIPT_SERIES.accent}>{children}</div>;
}
