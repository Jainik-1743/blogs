import { BROWSER_SERIES } from "@/lib/iv";

/** Every /browser page carries the series accent. */
export default function BrowserLayout({ children }: { children: React.ReactNode }) {
  return <div data-page-accent={BROWSER_SERIES.accent}>{children}</div>;
}
