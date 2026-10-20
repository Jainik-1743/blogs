import { TESTING_SERIES } from "@/lib/iv";

/** Every /testing page carries the series accent. */
export default function TestingLayout({ children }: { children: React.ReactNode }) {
  return <div data-page-accent={TESTING_SERIES.accent}>{children}</div>;
}
