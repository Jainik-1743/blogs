import type { MetadataRoute } from "next";
import { ALL_PAGES } from "@/lib/registry";
import { pageDates } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

/**
 * Every public page, with the date its source file last changed in git (lib/lastmod.json).
 * Google ignores changefreq and priority, so they are left out; an honest lastmod is what helps.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return ALL_PAGES.map((p) => {
    const { modified } = pageDates(p.path);
    return {
      url: absoluteUrl(p.path),
      ...(modified ? { lastModified: modified } : {}),
    };
  });
}
