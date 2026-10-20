import { FRONTEND_SERIES } from "@/lib/iv";

/** Every /frontend-depth page carries the series accent. */
export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return <div data-page-accent={FRONTEND_SERIES.accent}>{children}</div>;
}
