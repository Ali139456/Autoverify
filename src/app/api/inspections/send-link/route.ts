import { NextRequest, NextResponse } from "next/server";
import {
  getInspectionByReportId,
  getInspectionOwnerUrl,
  isAutoVerifiInspectEntryUrl,
  isInspectionExpired,
  isRavinHostedInspectorUrl,
} from "@/lib/inspections";
import { hasDamageAnalysis } from "@/lib/pricing";
import { sendInspectionLinkSms } from "@/lib/sms";
import { getReport } from "@/lib/store";
import { getBaseUrl } from "@/lib/stripe";
import { normalizeAuMobile } from "@/lib/phone";
import { isAutoVerifiReportId } from "@/lib/ravin-report-trace";
import {
  clampText,
  guardBrowserPost,
  readBoundedJson,
} from "@/lib/security";

export async function POST(req: NextRequest) {
  const blocked = guardBrowserPost(req, "inspections-send-link", 20, 60 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const body = (await readBoundedJson(req)) as Record<string, unknown>;
    const reportId = clampText(body.reportId, 64).toUpperCase();
    const phone = normalizeAuMobile(clampText(body.phone, 24));
    const inspectUrl = clampText(body.inspectUrl, 2048);

    if (!reportId || !isAutoVerifiReportId(reportId) || !phone) {
      return NextResponse.json(
        { error: "Report ID and mobile number are required." },
        { status: 400 },
      );
    }

    const report = await getReport(reportId);
    if (!report || report.status !== "paid") {
      return NextResponse.json({ error: "Report not found or not unlocked." }, { status: 404 });
    }

    if (!hasDamageAnalysis(report.tier)) {
      return NextResponse.json(
        { error: "AI condition checks are included with Auto Verifi Insights+ only." },
        { status: 403 },
      );
    }

    const baseUrl = getBaseUrl();
    const inspection = await getInspectionByReportId(reportId);
    let link = "";
    if (inspection && !isInspectionExpired(inspection)) {
      link = getInspectionOwnerUrl(inspection, baseUrl);
    } else if (
      inspectUrl &&
      !isRavinHostedInspectorUrl(inspectUrl) &&
      isAutoVerifiInspectEntryUrl(inspectUrl, baseUrl)
    ) {
      link = inspectUrl;
    }

    if (!link) {
      return NextResponse.json(
        { error: "Create the inspection link first, then send it by SMS." },
        { status: 400 },
      );
    }

    const vehicleLabel = `${report.vehicle.year} ${report.vehicle.make} ${report.vehicle.model}`;
    const result = await sendInspectionLinkSms({
      to: phone,
      inspectUrl: link,
      vehicleLabel,
    });

    return NextResponse.json({ ok: true, sentTo: result.to });
  } catch (err) {
    if (err instanceof Error && err.message === "PAYLOAD_TOO_LARGE") {
      return NextResponse.json({ error: "Request too large." }, { status: 413 });
    }
    const message = err instanceof Error ? err.message : "Could not send SMS.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
