import { NODEJS_SERIES } from "@/lib/iv";

/** Every /nodejs page carries the series accent. */
export default function NodejsLayout({ children }: { children: React.ReactNode }) {
  return <div data-page-accent={NODEJS_SERIES.accent}>{children}</div>;
}
