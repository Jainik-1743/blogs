import { DSA_ACCENT } from "@/lib/dsa";

/** Every /dsa page carries the series accent (emerald by default — see DSA_ACCENT). */
export default function DsaLayout({ children }: { children: React.ReactNode }) {
  return <div data-page-accent={DSA_ACCENT}>{children}</div>;
}
