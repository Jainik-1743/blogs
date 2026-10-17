import { LINUX_SERIES } from "@/lib/iv";

/** Every /linux-shell page carries the series accent. */
export default function LinuxShellLayout({ children }: { children: React.ReactNode }) {
  return <div data-page-accent={LINUX_SERIES.accent}>{children}</div>;
}
