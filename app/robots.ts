import type { MetadataRoute } from "next";
import { INDEXABLE, SITE_URL, absoluteUrl } from "@/lib/site";

/** Folder names that appear in lesson code samples but are not pages on this site. */
const CODE_SAMPLE_PREFIXES = [
  "tmp", "sys", "srv", "users", "user", "ui", "etc", "var", "usr", "home", "proc", "opt", "bin", "dev",
  "api", "app", "admin", "static", "uploads", "files", "public", "private", "v1", "v2", "v3", "orders",
  "products", "items", "notes", "todos", "posts", "accounts", "payments", "customers", "health", "metrics",
  "myapp-user-uploads", "node_modules", "dist", "build", "src", "lib",
];
/** Single-segment paths from code samples (login, dashboard ...). */
const CODE_SAMPLE_PAGES = ["login", "logout", "signup", "dashboard", "settings", "profile", "cart", "checkout"];
/** public/<key>.txt: the file that proves to IndexNow that this site owns the key. */
const INDEXNOW_KEY_PATH = "/32ec88239bbf62481d7a322923dd849c.txt";

export default function robots(): MetadataRoute.Robots {
  // Preview and branch deployments must never compete with the real site.
  if (!INDEXABLE) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: [
      {
        userAgent: "*",
        disallow: [
          // Private areas: nothing there is meant for search results.
          "/admin",
          "/account",
          "/bookmarks",
          // The search index is data for the in-page search box, not a page.
          "/search-index.json",
          // The lessons show code with paths and file names (/users/{id}, /tmp/app, package-lock.json).
          // Google reads some of that text as links and reports 404s for them, so keep it away from
          // those shapes. Only URL shapes that no real page uses are listed here.
          "/_next/image",
          "/*?",
          "/*.json",
          "/*.ts",
          "/*.yaml",
          "/*.yml",
          "/*.sh",
          "/*.py",
          "/*.log",
          "/*.conf",
          "/*.toml",
          "/*.lock",
          "/*.env",
          "/*.txt",
          ...CODE_SAMPLE_PREFIXES.map((p) => `/${p}/`),
          ...CODE_SAMPLE_PAGES.map((p) => `/${p}`),
        ],
        // The IndexNow key file is a .txt file that search engines must be able to read.
        allow: ["/", INDEXNOW_KEY_PATH],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
