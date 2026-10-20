import { DEBUGGING_SERIES } from "@/lib/iv";

/** Every /debugging page carries the series accent. */
export default function DebuggingLayout({ children }: { children: React.ReactNode }) {
  return <div data-page-accent={DEBUGGING_SERIES.accent}>{children}</div>;
}
