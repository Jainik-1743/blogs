import { BEHAVIORAL_SERIES } from "@/lib/iv";

/** Every /behavioral-interview page carries the series accent. */
export default function BehavioralInterviewLayout({ children }: { children: React.ReactNode }) {
  return <div data-page-accent={BEHAVIORAL_SERIES.accent}>{children}</div>;
}
