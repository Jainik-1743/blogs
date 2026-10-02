import { buildSearchIndex } from "@/lib/search-index";

// Built once at deploy time; the search box fetches it the first time it is opened.
export const dynamic = "force-static";

export function GET() {
  return Response.json(buildSearchIndex());
}
