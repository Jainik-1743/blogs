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

export const HOME_TITLE = "blogs: free lessons on DSA, system design, DevOps, JavaScript and interview prep";
export const HOME_DESCRIPTION =
  "Free, plain-English lesson series for software engineers: data structures and algorithms, system design, DevOps and AWS, JavaScript and TypeScript, SQL, Git, testing, interview questions and team-lead skills. Every idea is traced step by step.";

export const AUTHOR = {
  name: "Jainik",
  url: "https://github.com/Jainik-1743",
};

/**
 * Preview and branch deployments on Vercel must not be indexed (they would compete with the
 * real site). Anywhere else, including a local production build, the site is indexable.
 */
export const INDEXABLE = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : true;

/** Absolute URL for a path on this site. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
