import { SD_ACCENT } from "@/lib/system-design";

/** Every /system-design page carries the series accent (orange by default — see SD_ACCENT). */
export default function SystemDesignLayout({ children }: { children: React.ReactNode }) {
  return <div data-page-accent={SD_ACCENT}>{children}</div>;
}
