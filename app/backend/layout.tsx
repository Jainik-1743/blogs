import { BACKEND_SERIES } from "@/lib/iv";

/** Every /backend page carries the series accent. */
export default function BackendLayout({ children }: { children: React.ReactNode }) {
  return <div data-page-accent={BACKEND_SERIES.accent}>{children}</div>;
}
