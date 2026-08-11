import { NextRequest, NextResponse } from "next/server";
import {
  getInspectionByInvitationId,
  updateInspection,
} from "@/lib/inspections";
import { parseRavinWebhookPayload, extractInvitationId } from "@/lib/ravin-webhook";
import { saveRavinWebhookEvent, updateReportWorkflowStatus } from "@/lib/store-supabase";
import { updateReport } from "@/lib/store";
import { isSupabaseServerConfigured } from "@/lib/supabase/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Ravin webhook endpoint is active. Send inspection JSON reports via POST.",
  });
}

export async function POST(req: NextRequest) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json(
      { error: "Supabase is required for Ravin webhooks." },
      { status: 503 },
    );
  }

  const webhookSecret = process.env.RAVIN_WEBHOOK_SECRET;
  if (webhookSecret) {
    const provided = req.headers.get("x-ravin-webhook-secret");
    if (provided !== webhookSecret) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const invitationId = extractInvitationId(payload);
  const inspection = invitationId
    ? await getInspectionByInvitationId(invitationId)
    : null;

  await saveRavinWebhookEvent({
    reportId: inspection?.reportId ?? null,
    inspectionId: inspection?.id ?? null,
    invitationId,
    payload,
  });

  if (!inspection) {
    return NextResponse.json({ ok: true, matched: false });
  }

  const damage = parseRavinWebhookPayload(payload, inspection.photos.length);

  await updateInspection(inspection.id, {
    status: "complete",
    ravinPayload: payload,
    completedAt: new Date().toISOString(),
  });

  await updateReport(inspection.reportId, {
    damage,
    workflowStatus: "complete",
    ravin_payload: payload,
  });

  await updateReportWorkflowStatus(inspection.reportId, "complete");

  return NextResponse.json({
    ok: true,
    matched: true,
    reportId: inspection.reportId,
    findings: damage.findings.length,
  });
}
