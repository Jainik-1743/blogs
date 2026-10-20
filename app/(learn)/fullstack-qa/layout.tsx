import { FULLSTACK_SERIES } from "@/lib/iv";

/** Every /fullstack-qa page carries the series accent. */
export default function FullstackLayout({ children }: { children: React.ReactNode }) {
  return <div data-page-accent={FULLSTACK_SERIES.accent}>{children}</div>;
}
