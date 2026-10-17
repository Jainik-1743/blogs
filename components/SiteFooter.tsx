import Link from "next/link";
import { LogoMark } from "./Logo";
import { ALL_SERIES, SERIES_GROUPS, SERIES_SHORT } from "@/lib/series";

const nameOf = (slug: string) => SERIES_SHORT[slug] ?? ALL_SERIES.find((s) => s.slug === slug)?.title ?? slug;

/**
 * Site footer, kept short on purpose: the brand and four useful links, then the series grouped
 * into four small columns (short names only). Glossaries live on one page (/glossaries).
 */
export default function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-line bg-bg-elev/40 text-[0.88rem] text-ink-dim">
      <div className="mx-auto max-w-[860px] px-4 py-8">
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-ink hover:no-underline">
              <LogoMark size={24} gradientId="logo-tile-footer" />
              <span>
                <span className="font-mono font-semibold text-sky">/</span>blogs
              </span>
            </Link>
            <p className="mt-2 mb-0 max-w-[38ch] leading-relaxed">Free, easy-to-follow lessons for software engineers.</p>
          </div>
          <nav aria-label="Site" className="flex flex-wrap gap-x-5 gap-y-1.5">
            <FooterLink href="/">All series</FooterLink>
            <FooterLink href="/roadmap">Roadmap</FooterLink>
            <FooterLink href="/guides">Guides</FooterLink>
            <FooterLink href="/glossaries">Glossaries</FooterLink>
            <FooterLink href="/about">About</FooterLink>
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/feed.xml">RSS</FooterLink>
            <FooterLink href="/sitemap.xml">Sitemap</FooterLink>
          </nav>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
          {SERIES_GROUPS.map((g) => (
            <nav key={g.id} aria-label={g.title}>
              <p className="mt-0 mb-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink">{g.title}</p>
              <ul className="m-0 list-none space-y-1.5 p-0">
                {g.slugs.map((slug) => (
                  <li key={slug}>
                    <FooterLink href={`/${slug}`}>{nameOf(slug)}</FooterLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[860px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-4 text-[0.8rem]">
          <span>
            © {new Date().getFullYear()} <Link href="/about" className="text-ink hover:text-sky hover:no-underline">Jainik</Link>
            <span aria-hidden="true"> · </span>Senior Software Engineer
            <span aria-hidden="true"> · </span>
            <Link href="/about#contact" className="text-ink-dim hover:text-sky hover:no-underline">Contact</Link>
          </span>
          <a href="#top" className="text-ink-dim hover:text-sky hover:no-underline">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-ink-dim hover:text-sky hover:no-underline">
      {children}
    </Link>
  );
}
