import { NextRequest, NextResponse } from "next/server";
import { getInspectionByReportId } from "@/lib/inspections";
import { hasDamageAnalysis } from "@/lib/pricing";
import { sendInspectionLinkSms } from "@/lib/sms";
import { getReport } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const reportId = String(body.reportId ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const inspectUrl = String(body.inspectUrl ?? "").trim();

    if (!reportId || !phone) {
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

    let link = inspectUrl;
    if (!link) {
      const inspection = await getInspectionByReportId(reportId);
      link = inspection?.ravinInviteUrl ?? "";
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
    const message = err instanceof Error ? err.message : "Could not send SMS.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
