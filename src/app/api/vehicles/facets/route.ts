import { NextRequest, NextResponse } from "next/server";
import { fetchAutograbFacets } from "@/lib/autograb";
import {
  DEFAULT_ASSET_CATEGORY,
  parseAssetCategory,
} from "@/lib/autograb-catalogue";
import { guardBrowserPost } from "@/lib/security";

export async function GET(req: NextRequest) {
  const blocked = guardBrowserPost(req, "vehicles-facets", 60, 60 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const incoming = req.nextUrl.searchParams;
    const category = parseAssetCategory(
      incoming.get("category") ?? DEFAULT_ASSET_CATEGORY,
    );
    const query = new URLSearchParams(incoming);
    query.set("category", category);
    const data = await fetchAutograbFacets(query);
    return NextResponse.json(data);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Facet lookup failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
