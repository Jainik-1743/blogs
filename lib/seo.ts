import type { Metadata } from "next";
import lastmod from "./lastmod.json";
import { findPage, seriesBySlug, ALL_PAGES, type PageInfo } from "./registry";
import { guideBySlug } from "./guides";
import { AUTHOR, HOME_DESCRIPTION, HOME_TITLE, INDEXABLE, SITE_NAME, SITE_LOCALE, absoluteUrl } from "./site";

const DATES = lastmod as unknown as Record<string, [string, string]>;

/** [created, modified] as ISO strings, if git history knows the page. */
export function pageDates(path: string): { created?: string; modified?: string } {
  const d = DATES[path];
  return d ? { created: d[0], modified: d[1] } : {};
}

const TITLE_MAX = 60;
const DESC_MAX = 158;

function clip(text: string, max = 300): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

/** The part of a title before the first colon or dash: usually the topic itself. */
function headOf(title: string): string {
  const head = title.split(/\s*[:\u2014\u2013]\s+/)[0].trim();
  return head.length >= 12 ? head : title;
}

/**
 * The text of <title>. Search results cut titles at about 60 characters, so this picks the
 * most informative version that fits: topic plus series name, then the full topic, then just
 * the part before the colon. The full title is still used for the page heading, share cards
 * and structured data.
 */
export function titleFor(p: PageInfo): string {
  const short = p.seriesShort;
  switch (p.kind) {
    case "lesson":
    case "reading": {
      const head = headOf(p.title);
      const candidates = [
        short ? `${p.title} | ${short}` : p.title,
        p.title,
        short ? `${head} | ${short}` : head,
        head,
      ];
      return candidates.find((c) => c.length <= TITLE_MAX) ?? clip(p.title, TITLE_MAX);
    }
    case "glossary":
      return `${short} Glossary: Every Term Explained`;
    default: {
      const withBrand = `${p.title} | ${SITE_NAME}`;
      return withBrand.length <= TITLE_MAX ? withBrand : p.title.length <= TITLE_MAX ? p.title : clip(headOf(p.title), TITLE_MAX);
    }
  }
}

/**
 * The meta description: about 155 characters (what search results show), cut at the end of a
 * sentence when possible. Very short summaries get the series name added for context.
 */
export function descriptionFor(p: PageInfo): string {
  let text = p.description.replace(/\s+/g, " ").trim();
  if (text.length < 90 && p.seriesTitle && p.kind !== "series") text = `${text} Part of the "${p.seriesTitle}" series.`;
  if (text.length <= DESC_MAX) return text;
  const cut = text.slice(0, DESC_MAX);
  const sentence = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "));
  if (sentence >= 90) return cut.slice(0, sentence + 1);
  return `${cut.replace(/\s+\S*$/, "").replace(/[,;:\u2014\u2013-]+$/, "")}…`;
}

export function ogImagePath(path: string): string {
  return path === "/" ? "/og" : `/og${path}`;
}

/**
 * Full metadata for a page: title, description, canonical URL, Open Graph, Twitter card.
 * Every page calls this with its own path, so canonical URLs and share cards are never wrong.
 */
export function pageMetadata(path: string): Metadata {
  const p = findPage(path);
  if (!p) return {};
  const title = path === "/" ? HOME_TITLE : titleFor(p);
  const description = path === "/" ? HOME_DESCRIPTION : descriptionFor(p);
  // Share cards can show a little more than a search result: use the full title and a longer summary.
  const shareTitle = path === "/" || p.kind === "glossary" ? title : p.kind === "lesson" || p.kind === "reading" ? p.title : title;
  const shareDescription = path === "/" ? HOME_DESCRIPTION : clip(p.description, 200);
  const image = { url: ogImagePath(path), width: 1200, height: 630, alt: p.title };
  const dates = pageDates(path);
  const isArticle = p.kind === "lesson" || p.kind === "reading";

  return {
    // `absolute` skips the layout's " · blogs" suffix: the titles above are already sized to fit.
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      title: shareTitle,
      description: shareDescription,
      url: path,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      images: [image],
      ...(isArticle
        ? {
            type: "article" as const,
            authors: [AUTHOR.name],
            section: p.seriesTitle,
            ...(dates.created ? { publishedTime: dates.created } : {}),
            ...(dates.modified ? { modifiedTime: dates.modified } : {}),
            ...(p.tags?.length ? { tags: p.tags } : {}),
          }
        : { type: "website" as const }),
    },
    twitter: { card: "summary_large_image", title: shareTitle, description: shareDescription, images: [image.url] },
  };
}

// ───────────────────────── JSON-LD ─────────────────────────

type Json = Record<string, unknown>;

const personRef = { "@type": "Person", name: AUTHOR.name, url: absoluteUrl(AUTHOR.path) };

/** "20 min" -> "PT20M" (ISO 8601 duration). */
function isoDuration(readTime?: string): string | undefined {
  const m = readTime?.match(/(\d+)/);
  return m ? `PT${m[1]}M` : undefined;
}

function breadcrumb(items: { name: string; path: string }[]): Json {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

/** Structured data for the whole site: the website and its author. Rendered once in the root layout. */
export function siteJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        url: absoluteUrl("/"),
        name: SITE_NAME,
        description: HOME_DESCRIPTION,
        inLanguage: "en",
        publisher: { "@id": absoluteUrl("/#author") },
      },
      {
        "@id": absoluteUrl("/#author"),
        ...personRef,
        jobTitle: AUTHOR.jobTitle,
        description: "Senior Software Engineer with five years of experience building web applications, who writes plain-English lessons for other developers.",
        knowsAbout: ["React", "Next.js", "Tailwind CSS", "JavaScript", "TypeScript", "Front-end architecture", "Web accessibility"],
      },
    ],
  };
}

/** Structured data for one lesson or reading: a TechArticle that belongs to its series, with breadcrumbs. */
export function lessonJsonLd(path: string): Json | undefined {
  const p = findPage(path);
  if (!p || (p.kind !== "lesson" && p.kind !== "reading") || !p.seriesSlug) return undefined;
  const dates = pageDates(path);
  const seriesPath = `/${p.seriesSlug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${absoluteUrl(path)}#article`,
        headline: clip(p.title, 110),
        description: clip(p.description),
        url: absoluteUrl(path),
        mainEntityOfPage: absoluteUrl(path),
        image: absoluteUrl(ogImagePath(path)),
        inLanguage: "en",
        isAccessibleForFree: true,
        author: personRef,
        publisher: { "@id": absoluteUrl("/#author") },
        isPartOf: { "@type": "CreativeWorkSeries", name: p.seriesTitle, url: absoluteUrl(seriesPath) },
        ...(p.number !== undefined ? { position: p.number } : {}),
        ...(dates.created ? { datePublished: dates.created } : {}),
        ...(dates.modified ? { dateModified: dates.modified } : {}),
        ...(isoDuration(p.readTime) ? { timeRequired: isoDuration(p.readTime) } : {}),
        ...(p.tags?.length ? { keywords: p.tags.join(", ") } : {}),
        articleSection: p.seriesTitle,
        proficiencyLevel: "Beginner",
      },
      breadcrumb([
        { name: "Home", path: "/" },
        { name: p.seriesShort ?? p.seriesTitle ?? "Series", path: seriesPath },
        { name: p.title, path },
      ]),
    ],
  };
}

/** Structured data for a series page: a collection with the list of its lessons. */
export function seriesJsonLd(slug: string): Json | undefined {
  const s = seriesBySlug(slug);
  if (!s) return undefined;
  const lessons = ALL_PAGES.filter((p) => p.seriesSlug === slug && p.kind === "lesson");
  const dates = pageDates(`/${slug}`);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${absoluteUrl(`/${slug}`)}#series`,
        name: s.title,
        description: clip(s.tagline),
        url: absoluteUrl(`/${slug}`),
        inLanguage: "en",
        isAccessibleForFree: true,
        author: personRef,
        ...(dates.modified ? { dateModified: dates.modified } : {}),
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: lessons.length,
          itemListElement: lessons.map((l, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: l.title,
            url: absoluteUrl(l.path),
          })),
        },
      },
      breadcrumb([
        { name: "Home", path: "/" },
        { name: s.short, path: `/${slug}` },
      ]),
    ],
  };
}

/** Structured data for a study guide: a collection of lessons with breadcrumbs Home > Guides > guide. */
export function guideJsonLd(slug: string): Json | undefined {
  const g = guideBySlug(slug);
  if (!g) return undefined;
  const path = `/guides/${slug}`;
  const pages = g.sections.flatMap((s) => s.pages);
  const dates = pageDates(path);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${absoluteUrl(path)}#guide`,
        name: g.title,
        description: clip(g.description),
        url: absoluteUrl(path),
        inLanguage: "en",
        isAccessibleForFree: true,
        author: personRef,
        ...(dates.created ? { datePublished: dates.created } : {}),
        ...(dates.modified ? { dateModified: dates.modified } : {}),
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: pages.length,
          itemListElement: pages.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.title, url: absoluteUrl(p.path) })),
        },
      },
      breadcrumb([
        { name: "Home", path: "/" },
        { name: "Guides", path: "/guides" },
        { name: g.title, path },
      ]),
    ],
  };
}

/** Structured data for the home page: a collection page listing every series. */
export function homeJsonLd(): Json {
  const seriesPages = ALL_PAGES.filter((p) => p.kind === "series");
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${absoluteUrl("/")}#home`,
    name: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: absoluteUrl("/"),
    inLanguage: "en",
    isPartOf: { "@id": absoluteUrl("/#website") },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: seriesPages.length,
      itemListElement: seriesPages.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.title, url: absoluteUrl(p.path) })),
    },
  };
}

/** Structured data for the About page. */
export function aboutJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${absoluteUrl("/about")}#page`,
        url: absoluteUrl("/about"),
        name: "About this site and its author",
        inLanguage: "en",
        isPartOf: { "@id": absoluteUrl("/#website") },
        about: { "@id": absoluteUrl("/#author") },
        mainEntity: { "@id": absoluteUrl("/#author") },
      },
      breadcrumb([
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
      ]),
    ],
  };
}

/** Robots meta for the whole site: indexable in production, never on previews. */
export const robotsMeta: Metadata["robots"] = INDEXABLE
  ? {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    }
  : { index: false, follow: false };
