import { GUIDES, type GuideDef } from "./guides-data";
import { findPage, type PageInfo } from "./registry";

export type ResolvedGuide = Omit<GuideDef, "sections"> & {
  sections: { heading: string; note?: string; pages: PageInfo[] }[];
  lessonCount: number;
};

/** Look up every path in every guide. A missing page fails the build instead of leaving a dead link. */
function resolve(g: GuideDef): ResolvedGuide {
  const sections = g.sections.map((s) => ({
    heading: s.heading,
    note: s.note,
    pages: s.paths.map((path) => {
      const page = findPage(path);
      if (!page) throw new Error(`Guide "${g.slug}" links to ${path}, which is not a page on this site`);
      return page;
    }),
  }));
  return { ...g, sections, lessonCount: sections.reduce((n, s) => n + s.pages.length, 0) };
}

export const RESOLVED_GUIDES: ResolvedGuide[] = GUIDES.map(resolve);

export function guideBySlug(slug: string): ResolvedGuide | undefined {
  return RESOLVED_GUIDES.find((g) => g.slug === slug);
}

/** Guides that include a given page, so a lesson can point back to them. */
export function guidesForPath(path: string): ResolvedGuide[] {
  return RESOLVED_GUIDES.filter((g) => g.sections.some((s) => s.pages.some((p) => p.path === path)));
}
