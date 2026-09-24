import Logo from "./Logo";
import SeriesBar from "./SeriesBar";
import { ALL_SERIES } from "@/lib/series";

/**
 * Just the logo on the left. On a series page the right side shows that series' name and
 * the accent-colour menu; the list of all series lives on the home page and in the footer.
 */
export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-15 max-w-[860px] items-center justify-between gap-3 px-4">
        <Logo />
        <SeriesBar series={ALL_SERIES} />
      </div>
    </header>
  );
}
