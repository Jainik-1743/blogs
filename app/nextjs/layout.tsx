import { NEXTJS_SERIES } from "@/lib/iv";

/** Every /nextjs page carries the series accent. */
export default function NextjsLayout({ children }: { children: React.ReactNode }) {
  return <div data-page-accent={NEXTJS_SERIES.accent}>{children}</div>;
}
