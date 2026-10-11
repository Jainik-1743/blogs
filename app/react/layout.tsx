import { REACT_SERIES } from "@/lib/iv";

/** Every /react page carries the series accent. */
export default function ReactLayout({ children }: { children: React.ReactNode }) {
  return <div data-page-accent={REACT_SERIES.accent}>{children}</div>;
}
