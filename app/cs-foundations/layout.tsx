import { CSFOUNDATIONS_SERIES } from "@/lib/iv";

/** Every /cs-foundations page carries the series accent. */
export default function CsFoundationsLayout({ children }: { children: React.ReactNode }) {
  return <div data-page-accent={CSFOUNDATIONS_SERIES.accent}>{children}</div>;
}
