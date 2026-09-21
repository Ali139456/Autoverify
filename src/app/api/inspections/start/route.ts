import { NextRequest, NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/stripe";
import { getReport, updateReport } from "@/lib/store";
import { createInspection, updateInspection } from "@/lib/inspections";
import { isSupabaseServerConfigured } from "@/lib/supabase/server";
import {
  createRavinPartnerInvite,
  isRavinPartnerConfigured,
} from "@/lib/ravin-partner";
import { hasDamageAnalysis } from "@/lib/pricing";
import { normalizeAuMobile } from "@/lib/phone";
import { isSmsConfigured, sendInspectionLinkSms } from "@/lib/sms";

export async function POST(req: NextRequest) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json(
      { error: "Inspections require Supabase to be configured." },
      { status: 503 },
    );
  }

  try {
    const body = await req.json();
    const reportId = String(body.reportId ?? "").trim();

    if (!reportId) {
      return NextResponse.json({ error: "Report ID is required." }, { status: 400 });
    }

    const report = await getReport(reportId);
    if (!report || report.status !== "paid") {
      return NextResponse.json({ error: "Report not found or not unlocked." }, { status: 404 });
    }

    if (!hasDamageAnalysis(report.tier)) {
      return NextResponse.json(
        { error: "AI photo inspection is included with Auto Verifi Insights+ only." },
        { status: 403 },
      );
    }

    const customerPhone =
      normalizeAuMobile(String(body.customerPhone ?? "")) ??
      report.customerPhone ??
      null;
    const ownerPhone =
      normalizeAuMobile(String(body.ownerPhone ?? "")) ??
      report.ownerPhone ??
      null;

    if (!ownerPhone) {
      return NextResponse.json(
        { error: "Vehicle owner mobile number is required for the inspection link." },
        { status: 400 },
      );
    }

    const inspection = await createInspection({ reportId, phone: ownerPhone });
    const internalInspectUrl = `${getBaseUrl()}/inspect/${inspection.accessToken}`;

    let inspectUrl = internalInspectUrl;
    let provider: "ravin" | "internal" = "internal";
    let ravinInviteUrl: string | null = null;

    if (isRavinPartnerConfigured()) {
      const invite = await createRavinPartnerInvite({ invitationId: reportId });
      inspectUrl = invite.inviteUrl;
      ravinInviteUrl = invite.inviteUrl;
      provider = "ravin";

      await updateInspection(inspection.id, {
        ravinInspectionId: invite.invitationId,
        ravinInviteUrl: invite.inviteUrl,
        status: "pending",
      });
    }

    await updateReport(reportId, {
      workflowStatus: "awaiting_inspection",
      customerPhone,
      ownerPhone,
    });

    let smsSent = false;
    let smsError: string | null = null;

    if (isSmsConfigured()) {
      try {
        const vehicleLabel = `${report.vehicle.year} ${report.vehicle.make} ${report.vehicle.model}`;
        await sendInspectionLinkSms({
          to: ownerPhone,
          inspectUrl,
          vehicleLabel,
        });
        smsSent = true;
      } catch (err) {
        smsError =
          err instanceof Error ? err.message : "Could not send inspection SMS.";
      }
    }

    return NextResponse.json({
      inspectionId: inspection.id,
      inspectUrl,
      internalInspectUrl,
      ravinInviteUrl,
      provider,
      expiresAt: inspection.expiresAt,
      ownerPhone,
      customerPhone,
      smsSent,
      smsError,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not start inspection.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
