import { NextRequest, NextResponse } from "next/server";
import { getRavinHealthPayload } from "@/lib/ravin-health";
import { traceRavinReport, isAutoVerifiReportId } from "@/lib/ravin-report-trace";
import { getBaseUrl } from "@/lib/stripe";

/** Ravin / Inspector Lite integration readiness (no secrets). */
export async function GET(req: NextRequest) {
  const baseUrl = getBaseUrl();
  const reportId = req.nextUrl.searchParams.get("reportId")?.trim();
  if (reportId) {
    if (!isAutoVerifiReportId(reportId)) {
      return NextResponse.json(
        { error: "reportId must look like AV-… (Auto Verifi report id / Ravin claimId)." },
        { status: 400 },
      );
    }
    const trace = await traceRavinReport(reportId, baseUrl);
    return NextResponse.json({ trace });
  }

  const probe = req.nextUrl.searchParams.get("probe") === "1";
  const payload = await getRavinHealthPayload(baseUrl, probe);
  return NextResponse.json(payload);
}
