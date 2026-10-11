import { SECURITY_SERIES } from "@/lib/iv";

/** Every /security page carries the series accent. */
export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  return <div data-page-accent={SECURITY_SERIES.accent}>{children}</div>;
}
