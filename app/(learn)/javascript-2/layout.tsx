import { JAVASCRIPT2_SERIES } from "@/lib/iv";

/** Every /javascript-2 page carries the series accent. */
export default function Javascript2Layout({ children }: { children: React.ReactNode }) {
  return <div data-page-accent={JAVASCRIPT2_SERIES.accent}>{children}</div>;
}
