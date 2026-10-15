import { NextRequest, NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/stripe";
import { getReport, updateReport } from "@/lib/store";
import {
  createInspection,
  getInspectionByReportId,
  getInspectionOwnerUrl,
  isInspectionExpired,
  updateInspection,
} from "@/lib/inspections";
import { isSupabaseServerConfigured } from "@/lib/supabase/server";
import {
  coerceRavinInspectorLiteUrl,
  createRavinPartnerInvite,
  isRavinInspectorLiteUrl,
  isRavinPartnerConfigured,
  useHostedRavinInspector,
} from "@/lib/ravin-partner";
import { hasDamageAnalysis } from "@/lib/pricing";
import { normalizeAuMobile } from "@/lib/phone";
import {
  isSmsConfigured,
  SMS_NOT_CONFIGURED_MESSAGE,
  sendInspectionLinkSms,
} from "@/lib/sms";

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

    let inspection = await getInspectionByReportId(reportId);
    const createdNewInspection =
      !inspection || isInspectionExpired(inspection);
    if (createdNewInspection) {
      inspection = await createInspection({ reportId, phone: ownerPhone });
    }
    if (!inspection) {
      return NextResponse.json(
        { error: "Could not create or load inspection session." },
        { status: 500 },
      );
    }

    const baseUrl = getBaseUrl();
    const ownerEntryUrl = getInspectionOwnerUrl(
      { accessToken: inspection.accessToken },
      baseUrl,
    );

    let ravinInviteUrl: string | null = inspection.ravinInviteUrl
      ? coerceRavinInspectorLiteUrl(inspection.ravinInviteUrl)
      : null;
    if (
      ravinInviteUrl &&
      ravinInviteUrl !== inspection.ravinInviteUrl
    ) {
      await updateInspection(inspection.id, { ravinInviteUrl });
    }

    let inspectUrl = ownerEntryUrl;
    const hostedRavin = useHostedRavinInspector();
    let provider: "ravin" | "internal" =
      hostedRavin && ravinInviteUrl ? "ravin" : "internal";
    let ravinWarning: string | null = null;

    const refreshRavinInvite = Boolean(body.refreshRavinInvite);
    const storedRavinNeedsLite =
      ravinInviteUrl !== null && !isRavinInspectorLiteUrl(ravinInviteUrl);
    if (
      isRavinPartnerConfigured() &&
      (!ravinInviteUrl || refreshRavinInvite || storedRavinNeedsLite)
    ) {
      try {
        const invite = await createRavinPartnerInvite({
          claimId: reportId,
          lp: report.vehicle.rego,
          state: report.vehicle.state,
        });
        ravinInviteUrl = coerceRavinInspectorLiteUrl(invite.inviteUrl);
        inspectUrl = ownerEntryUrl;
        provider = hostedRavin ? "ravin" : "internal";

        await updateInspection(inspection.id, {
          ravinInspectionId: invite.invitationId,
          ravinInviteUrl,
          status: "pending",
        });
      } catch (ravinErr) {
        console.error("[inspections/start] Ravin partner invite failed:", ravinErr);
        inspectUrl = ownerEntryUrl;
        provider = "internal";
        ravinWarning =
          ravinErr instanceof Error
            ? ravinErr.message
            : "Ravin link unavailable; using Auto Verifi mobile inspection.";
      }
    }

    await updateReport(reportId, {
      workflowStatus: "awaiting_inspection",
      customerPhone,
      ownerPhone,
    });

    let smsSent = false;
    let smsSentToOwner = false;
    let smsSentToPurchaser = false;
    let smsError: string | null = null;
    let smsNotice: string | null = null;

    if (!isSmsConfigured()) {
      smsError = SMS_NOT_CONFIGURED_MESSAGE;
    } else if (createdNewInspection) {
      const vehicleLabel = `${report.vehicle.year} ${report.vehicle.make} ${report.vehicle.model}`;
      const sendToPurchaser =
        customerPhone !== null && customerPhone !== ownerPhone;

      try {
        await sendInspectionLinkSms({
          to: ownerPhone,
          inspectUrl,
          vehicleLabel,
          recipient: "owner",
        });
        smsSentToOwner = true;
        smsSent = true;
      } catch (err) {
        smsError =
          err instanceof Error ? err.message : "Could not send inspection SMS.";
      }

      if (sendToPurchaser && !smsError) {
        try {
          await sendInspectionLinkSms({
            to: customerPhone,
            inspectUrl,
            vehicleLabel,
            recipient: "purchaser",
          });
          smsSentToPurchaser = true;
        } catch (err) {
          const purchaserMsg =
            err instanceof Error ? err.message : "Could not send purchaser SMS.";
          smsError = smsSentToOwner
            ? `Owner SMS sent. Purchaser SMS failed: ${purchaserMsg}`
            : purchaserMsg;
        }
      }
    } else {
      smsNotice =
        "An inspection link was already created for this report. Open the QR code and tap Send SMS link if the owner needs the text again.";
    }

    return NextResponse.json({
      inspectionId: inspection.id,
      inspectUrl,
      internalInspectUrl: ownerEntryUrl,
      ravinInviteUrl,
      provider,
      ravinWarning,
      ravinConfigured: isRavinPartnerConfigured(),
      expiresAt: inspection.expiresAt,
      ownerPhone,
      customerPhone,
      smsSent,
      smsSentToOwner,
      smsSentToPurchaser,
      smsError,
      smsNotice,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not start inspection.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
