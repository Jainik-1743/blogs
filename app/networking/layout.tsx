import { NETWORKING_SERIES } from "@/lib/iv";

/** Every /networking page carries the series accent. */
export default function NetworkingLayout({ children }: { children: React.ReactNode }) {
  return <div data-page-accent={NETWORKING_SERIES.accent}>{children}</div>;
}
