import { OBSERVABILITY_SERIES } from "@/lib/iv";

/** Every /observability page carries the series accent. */
export default function ObservabilityLayout({ children }: { children: React.ReactNode }) {
  return <div data-page-accent={OBSERVABILITY_SERIES.accent}>{children}</div>;
}
