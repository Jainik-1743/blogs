import { CAREER_SERIES } from "@/lib/iv";

/** Every /career page carries the series accent. */
export default function CareerLayout({ children }: { children: React.ReactNode }) {
  return <div data-page-accent={CAREER_SERIES.accent}>{children}</div>;
}
