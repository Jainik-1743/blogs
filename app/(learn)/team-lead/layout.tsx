import { TEAMLEAD_SERIES } from "@/lib/iv";

/** Every /team-lead page carries the series accent. */
export default function TeamLeadLayout({ children }: { children: React.ReactNode }) {
  return <div data-page-accent={TEAMLEAD_SERIES.accent}>{children}</div>;
}
