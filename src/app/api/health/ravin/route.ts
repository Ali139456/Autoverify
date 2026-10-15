import { NextRequest, NextResponse } from "next/server";
import { getRavinHealthPayload } from "@/lib/ravin-health";
import { traceRavinReport, isAutoVerifiReportId } from "@/lib/ravin-report-trace";
import { getBaseUrl } from "@/lib/stripe";
import { requireOpsAuth, secureJson } from "@/lib/security";

/** Ravin / Inspector Lite integration readiness (no secrets). */
export async function GET(req: NextRequest) {
  const baseUrl = getBaseUrl();
  const reportId = req.nextUrl.searchParams.get("reportId")?.trim();
  if (reportId) {
    const opsBlock = requireOpsAuth(req);
    if (opsBlock) return opsBlock;

    if (!isAutoVerifiReportId(reportId)) {
      return NextResponse.json(
        { error: "reportId must look like AV-… (Auto Verifi report id / Ravin claimId)." },
        { status: 400 },
      );
    }
    const trace = await traceRavinReport(reportId, baseUrl);
    return secureJson({ trace });
  }

  const probe = req.nextUrl.searchParams.get("probe") === "1";
  const payload = await getRavinHealthPayload(baseUrl, probe);
  return secureJson(payload);
}
