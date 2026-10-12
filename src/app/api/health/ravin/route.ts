import { NextRequest, NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/stripe";
import { getRavinHealthPayload } from "@/lib/ravin-health";

/** Ravin / Inspector Lite integration readiness (no secrets). */
export async function GET(req: NextRequest) {
  const probe = req.nextUrl.searchParams.get("probe") === "1";
  const payload = await getRavinHealthPayload(getBaseUrl(), probe);
  return NextResponse.json(payload);
}
