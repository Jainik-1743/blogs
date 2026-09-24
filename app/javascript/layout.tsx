import { JS_SERIES } from "@/lib/javascript";

/** Every /javascript page carries the series accent (sky by default — see JS_SERIES.accent). */
export default function JavascriptLayout({ children }: { children: React.ReactNode }) {
  return <div data-page-accent={JS_SERIES.accent}>{children}</div>;
}
