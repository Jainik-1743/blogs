import { buildPreviews } from "@/lib/previews";

// Built once at deploy time; the hover card fetches it the first time you point at a lesson link.
export const dynamic = "force-static";

export function GET() {
  return Response.json(buildPreviews());
}
