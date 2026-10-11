/**
 * Site-wide constants for SEO: the public URL, the name, the author, and whether this
 * deployment may be indexed.
 *
 * The URL comes from, in order:
 *   1. NEXT_PUBLIC_SITE_URL      set this when you attach a custom domain (e.g. https://example.com)
 *   2. VERCEL_PROJECT_PRODUCTION_URL   Vercel's system variable with the production domain
 *   3. VERCEL_URL                the URL of this specific deployment (previews)
 *   4. http://localhost:3000     local development
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
  const deployment = process.env.VERCEL_URL?.trim();
  if (deployment) return `https://${deployment.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "blogs";
export const SITE_LOCALE = "en_US";

export const HOME_TITLE = "blogs: Free Lessons on DSA, System Design, DevOps & More";
export const HOME_DESCRIPTION =
  "Free, plain-English lessons for software engineers: DSA, system design, DevOps, JavaScript, TypeScript, SQL, Git, testing and interview prep.";

/**
 * Search-console verification tokens. They are public by design (they appear in the page source).
 * The environment variable overrides the built-in Bing value if you ever need to change it.
 */
export const BING_VERIFICATION = process.env.BING_SITE_VERIFICATION?.trim() || "41E1382079FD2DD0F83B6E56BB6CEC5A";
export const GOOGLE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION?.trim() || undefined;

export const AUTHOR = {
  name: "Jainik",
  jobTitle: "Senior Software Engineer",
  /** Where the author's page lives on this site. No external profile links are published on purpose. */
  path: "/about",
};

/** Public contact address, shown on the About and Privacy pages. */
export const CONTACT_EMAIL = "jainikpatel1743@gmail.com";

/**
 * Preview and branch deployments on Vercel must not be indexed (they would compete with the
 * real site). Anywhere else, including a local production build, the site is indexable.
 */
export const INDEXABLE = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : true;

/** Absolute URL for a path on this site. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
