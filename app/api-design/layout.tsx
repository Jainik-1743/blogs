import { APIDESIGN_SERIES } from "@/lib/iv";

/** Every /api-design page carries the series accent. */
export default function ApiDesignLayout({ children }: { children: React.ReactNode }) {
  return <div data-page-accent={APIDESIGN_SERIES.accent}>{children}</div>;
}
