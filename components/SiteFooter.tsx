import Link from "next/link";
import { LogoMark } from "./Logo";
import { ALL_SERIES } from "@/lib/series";

/** Site footer: what the site is, every series with its glossary, and the copyright line. */
export default function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-line bg-bg-elev/40 text-[0.9rem] text-ink-dim">
      <div className="mx-auto grid max-w-[860px] gap-8 px-4 py-10 sm:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-ink hover:no-underline">
            <LogoMark size={26} gradientId="logo-tile-footer" />
            <span>
              <span className="font-mono font-semibold text-sky">/</span>blogs
            </span>
          </Link>
          <p className="mt-3 mb-0 max-w-[32ch] leading-relaxed">
            Lesson-style series on building and running software, written one post at a time.
          </p>
        </div>

        <FooterList
          heading="Series"
          items={ALL_SERIES.map((s) => ({ href: `/${s.slug}`, label: s.title, accent: s.accent }))}
        />
        <FooterList
          heading="Glossaries"
          items={ALL_SERIES.map((s) => ({
            href: `/${s.slug}/glossary`,
            label: `${s.title.split(",")[0]} terms`,
            accent: s.accent,
          }))}
        />
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[860px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-5 text-[0.82rem]">
          <span>
            © {new Date().getFullYear()} Jainik · Written for people who want to ship, not just read.
          </span>
          <a href="#top" className="text-ink-dim hover:text-sky hover:no-underline">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterList({
  heading,
  items,
}: {
  heading: string;
  items: { href: string; label: string; accent: string }[];
}) {
  return (
    <nav aria-label={heading}>
      <p className="mt-0 mb-3 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink">{heading}</p>
      <ul className="m-0 list-none space-y-2 p-0">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              data-accent={item.accent}
              className="group inline-flex items-center gap-2 text-ink-dim hover:text-sky hover:no-underline"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky opacity-70 group-hover:opacity-100" />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
