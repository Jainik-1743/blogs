import { DEVOPS_ACCENT } from "@/lib/lessons";

/** Every /devops page carries the series accent (violet by default — see DEVOPS_ACCENT). */
export default function DevopsLayout({ children }: { children: React.ReactNode }) {
  return <div data-page-accent={DEVOPS_ACCENT}>{children}</div>;
}
