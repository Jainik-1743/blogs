import { ImageResponse } from "next/og";
import { findPage } from "@/lib/registry";
import { HOME_TITLE, SITE_NAME } from "@/lib/site";

/**
 * Social share image (Open Graph / Twitter card) for any page: /og, /og/dsa, /og/dsa/lesson-5.
 * Only pages that exist in the registry get an image, so nobody can make this endpoint print
 * arbitrary text on your domain.
 */
const ACCENTS: Record<string, string> = {
  sky: "#38bdf8", indigo: "#818cf8", violet: "#a78bfa", pink: "#f472b6", rose: "#fb7185",
  orange: "#fb923c", amber: "#fbbf24", lime: "#a3e635", emerald: "#34d399", teal: "#2dd4bf",
};

const clip = (t: string, n: number) => {
  const c = t.replace(/\s+/g, " ").trim();
  return c.length <= n ? c : `${c.slice(0, n - 1).replace(/\s+\S*$/, "")}…`;
};

export async function GET(_req: Request, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  const path = slug.length ? `/${slug.join("/")}` : "/";
  const page = findPage(path);
  if (!page) return new Response("Not found", { status: 404 });

  const accent = ACCENTS[page.accent ?? "sky"] ?? ACCENTS.sky;
  const isHome = page.kind === "home";
  const isTopic = path.startsWith("/topics");
  const kicker = page.kind === "term" ? "Glossary term" : isTopic ? "Topic" : isHome
    ? "Free lessons for software engineers"
    : page.kind === "lesson"
      ? `${page.seriesShort} · Lesson ${page.number}`
      : page.kind === "series"
        ? "Lesson series"
        : page.kind === "glossary"
          ? "Glossary"
          : page.kind === "guide"
            ? "Study guide"
          : (page.seriesShort ?? "Guide");
  const title = isHome ? "DSA, system design, DevOps, JavaScript and interview prep" : page.title;
  const foot = isHome ? HOME_TITLE.split(":")[0] : page.readTime ? `${page.readTime} read` : (page.seriesTitle ?? "");
  const sub = !isHome && page.description && title.length <= 64 ? clip(page.description, 150) : "";
  const size = title.length > 90 ? 52 : title.length > 60 ? 62 : title.length > 36 ? 74 : 88;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: "64px 72px", background: "linear-gradient(135deg, #0b1120 0%, #121a33 100%)", color: "#e6ebff",
          borderLeft: `18px solid ${accent}`,
        }}
      >
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 4, textTransform: "uppercase", color: accent }}>{kicker}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: size, fontWeight: 800, lineHeight: 1.12, letterSpacing: -1 }}>{title}</div>
          {sub ? <div style={{ display: "flex", marginTop: 24, fontSize: 30, lineHeight: 1.35, color: "#9aa6cf" }}>{sub}</div> : null}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 30, color: "#9aa6cf" }}>
          <div style={{ display: "flex" }}>
            <span style={{ color: accent }}>/</span>
            <span style={{ color: "#e6ebff", fontWeight: 700 }}>{SITE_NAME}</span>
          </div>
          <div style={{ display: "flex" }}>{foot}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
