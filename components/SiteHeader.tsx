import Logo from "./Logo";
import StreakChip from "./StreakChip";
import SeriesBar from "./SeriesBar";
import SiteSearch from "./SiteSearch";
import AccountMenu from "./auth/AccountMenu";
import { ALL_SERIES } from "@/lib/series";

/**
 * Just the logo on the left. On a series page the right side shows that series' name and the accent-colour menu,
 * then search, the reader's streak and the account menu. Theme and text size live on the account page.
 */
export default function SiteHeader() {
  return (
    <header data-site-header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-15 max-w-[var(--container)] items-center justify-between gap-3 px-4">
        <Logo />
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <SeriesBar series={ALL_SERIES} />
          <SiteSearch />
          <StreakChip />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
