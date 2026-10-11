import type { MetadataRoute } from "next";
import { INDEXABLE, SITE_URL, absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Preview and branch deployments must never compete with the real site.
  if (!INDEXABLE) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The search index is data for the in-page search box, not a page.
        disallow: ["/search-index.json"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
