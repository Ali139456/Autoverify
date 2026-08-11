import { NextRequest, NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/stripe";
import { getReport, updateReport } from "@/lib/store";
import { createInspection, updateInspection } from "@/lib/inspections";
import { isSupabaseServerConfigured } from "@/lib/supabase/server";
import {
  createRavinPartnerInvite,
  isRavinPartnerConfigured,
} from "@/lib/ravin-partner";

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
    const phone = String(body.phone ?? "").trim();

    if (!reportId) {
      return NextResponse.json({ error: "Report ID is required." }, { status: 400 });
    }

    const report = await getReport(reportId);
    if (!report || report.status !== "paid") {
      return NextResponse.json({ error: "Report not found or not unlocked." }, { status: 404 });
    }

    const inspection = await createInspection({ reportId, phone: phone || undefined });
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
      customer_phone: phone || null,
    });

    return NextResponse.json({
      inspectionId: inspection.id,
      inspectUrl,
      internalInspectUrl,
      ravinInviteUrl,
      provider,
      expiresAt: inspection.expiresAt,
      smsReady: Boolean(phone),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not start inspection.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
