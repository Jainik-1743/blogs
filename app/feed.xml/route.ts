import { ALL_PAGES } from "@/lib/registry";
import { pageDates } from "@/lib/seo";
import { HOME_DESCRIPTION, SITE_NAME, absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** RSS 2.0 feed of the newest lessons. Feed readers and aggregators use it to find new posts. */
export function GET() {
  const items = ALL_PAGES.filter((p) => p.kind === "lesson" || p.kind === "reading")
    .map((p) => ({ p, ...pageDates(p.path) }))
    .filter((x) => x.created)
    .sort((a, b) => (b.created! > a.created! ? 1 : -1))
    .slice(0, 60);

  const body = items
    .map(
      ({ p, created }) => `    <item>
      <title>${esc(`${p.title} (${p.seriesShort})`)}</title>
      <link>${absoluteUrl(p.path)}</link>
      <guid isPermaLink="true">${absoluteUrl(p.path)}</guid>
      <pubDate>${new Date(created!).toUTCString()}</pubDate>
      <category>${esc(p.seriesTitle ?? "")}</category>
      <description>${esc(p.description)}</description>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE_NAME)}</title>
    <link>${absoluteUrl("/")}</link>
    <description>${esc(HOME_DESCRIPTION)}</description>
    <language>en</language>
    <atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml" />
${body}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600" },
  });
}
