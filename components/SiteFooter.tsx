import Link from "next/link";
import { LogoMark } from "./Logo";
import { GUIDES } from "@/lib/guides-data";
import { SERIES_LIST } from "@/lib/registry";
import { SERIES_GROUPS, SERIES_SHORT } from "@/lib/series";

const bySlug = new Map(SERIES_LIST.map((s) => [s.slug, s]));
const lessonTotal = SERIES_LIST.reduce((n, s) => n + s.lessons.filter((l) => l.published).length, 0);
const termTotal = SERIES_LIST.reduce((n, s) => n + s.termCount, 0);
const fmt = (n: number) => n.toLocaleString("en-US");

/** A thin strip that runs through every series colour, as a signature under the page. */
const RAINBOW = "linear-gradient(90deg,#38bdf8,#818cf8,#a78bfa,#f472b6,#fb7185,#fb923c,#fbbf24,#a3e635,#34d399,#2dd4bf)";

/**
 * Site footer: a colour strip, a "where to start" card with the roadmap and guides, the size of the
 * library at a glance, every series in four columns (each with its own colour dot and lesson count),
 * and a quiet bottom bar. Glossaries live on one page (/glossaries).
 */
export default function SiteFooter() {
  return (
    <footer data-site-footer className="mt-12 text-[0.88rem] text-ink-dim">
      <div aria-hidden="true" className="h-[3px] w-full opacity-80" style={{ background: RAINBOW }} />
      <div className="border-b border-line bg-bg-elev/40">
        <div className="mx-auto max-w-[var(--container)] px-4 pt-10 pb-8">
          <section aria-labelledby="footer-start" className="relative overflow-hidden rounded-2xl border border-line bg-bg px-6 py-6">
            <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full opacity-25 blur-3xl" style={{ background: RAINBOW }} />
            <div className="relative flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
              <div className="max-w-[44ch]">
                <h2 id="footer-start" className="m-0 text-[1.25rem] font-semibold text-ink">
                  Not sure where to start?
                </h2>
                <p className="mt-1 mb-0 leading-relaxed">
                  Follow the roadmap from the basics to interviews, or pick a study guide for your goal.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/roadmap" className="inline-flex items-center gap-1.5 rounded-full bg-sky px-4 py-2 text-[0.88rem] font-semibold on-sky transition hover:-translate-y-0.5 hover:no-underline">
                  Open the roadmap <span aria-hidden="true">→</span>
                </Link>
                <Link href="/guides" className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-[0.88rem] font-semibold text-ink transition hover:-translate-y-0.5 hover:border-sky hover:text-sky hover:no-underline">
                  Study guides
                </Link>
              </div>
            </div>
          </section>

          <dl className="m-0 mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat n={fmt(SERIES_LIST.length)} label="lesson series" />
            <Stat n={fmt(lessonTotal)} label="lessons" />
            <Stat n={fmt(termTotal)} label="glossary terms" />
            <Stat n={fmt(GUIDES.length)} label="study guides" />
          </dl>

          <div className="mt-9 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
            {SERIES_GROUPS.map((g) => (
              <nav key={g.id} aria-label={g.title}>
                <p className="mt-0 mb-3 border-b border-line pb-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink">{g.title}</p>
                <ul className="m-0 list-none space-y-1.5 p-0">
                  {g.slugs.map((slug) => {
                    const s = bySlug.get(slug);
                    return (
                      <li key={slug} data-accent={s?.accent}>
                        <Link href={`/${slug}`} className="group flex items-center gap-2 text-ink-dim hover:text-ink hover:no-underline">
                          <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky transition-transform group-hover:scale-150" />
                          <span className="min-w-0 flex-1 leading-snug group-hover:text-sky">{SERIES_SHORT[slug] ?? s?.short ?? slug}</span>
                          <span className="font-mono text-[0.68rem] text-ink-dim/70">{s ? s.lessons.filter((l) => l.published).length : ""}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-line pt-6">
            <div>
              <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-ink hover:no-underline">
                <LogoMark size={26} gradientId="logo-tile-footer" />
                <span>
                  <span className="font-mono font-semibold text-sky">/</span>blogs
                </span>
              </Link>
              <p className="mt-2 mb-0 max-w-[40ch] leading-relaxed">Free, easy-to-follow lessons for software engineers.</p>
            </div>
            <nav aria-label="Site" className="flex flex-wrap gap-x-5 gap-y-2">
              <FooterLink href="/">All series</FooterLink>
              <FooterLink href="/roadmap">Roadmap</FooterLink>
              <FooterLink href="/guides">Guides</FooterLink>
              <FooterLink href="/glossaries">Glossaries</FooterLink>
              <FooterLink href="/about">About</FooterLink>
              <FooterLink href="/feed.xml">RSS</FooterLink>
            </nav>
          </div>
        </div>
      </div>

      <div className="bg-bg">
        <div className="mx-auto flex max-w-[var(--container)] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-4 text-[0.8rem]">
          <span>
            © {new Date().getFullYear()} <Link href="/about" className="text-ink hover:text-sky hover:no-underline">Jainik</Link>
            <span aria-hidden="true"> · </span>Senior Software Engineer
            <span aria-hidden="true"> · </span>
            <Link href="/about#contact" className="text-ink-dim hover:text-sky hover:no-underline">Contact</Link>
            <span aria-hidden="true"> · </span>
            <Link href="/privacy" className="text-ink-dim hover:text-sky hover:no-underline">Privacy</Link>
            <span aria-hidden="true"> · </span>
            <Link href="/sitemap.xml" className="text-ink-dim hover:text-sky hover:no-underline">Sitemap</Link>
          </span>
          <a href="#top" className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-ink-dim transition-colors hover:border-sky hover:text-sky hover:no-underline">
            Back to top <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="rounded-xl border border-line bg-bg px-4 py-3">
      <dt className="sr-only">{label}</dt>
      <dd className="m-0">
        <span className="block text-[1.5rem] leading-none font-bold text-sky">{n}</span>
        <span className="mt-1 block font-mono text-[0.68rem] uppercase tracking-[0.1em]">{label}</span>
      </dd>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-ink-dim hover:text-sky hover:no-underline">
      {children}
    </Link>
  );
}
