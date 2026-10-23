import { NextRequest, NextResponse } from "next/server";
import { getInspectionByInvitationId } from "@/lib/inspections";
import {
  collectInvitationIds,
  extractAutoVerifiReportIds,
} from "@/lib/ravin-webhook";
import { resolveInspectionFromRavinWebhook } from "@/lib/inspections";
import { syncRavinReportIfPending } from "@/lib/ravin-background-sync";
import { applyRavinWebhookPayload } from "@/lib/ravin-apply-webhook";
import { saveRavinWebhookEvent } from "@/lib/store-supabase";
import { isSupabaseServerConfigured } from "@/lib/supabase/server";
import { guardRateLimit } from "@/lib/security";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Ravin webhook endpoint is active. Send inspection JSON reports via POST.",
  });
}

export async function POST(req: NextRequest) {
  const rateLimited = guardRateLimit(req, "webhook-ravin", 120, 60 * 60 * 1000);
  if (rateLimited) return rateLimited;

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

  const candidateIds = [
    ...new Set([
      ...collectInvitationIds(payload),
      ...extractAutoVerifiReportIds(payload),
    ]),
  ];
  const invitationId = candidateIds[0] ?? null;
  const inspection =
    (await resolveInspectionFromRavinWebhook(payload, () => candidateIds)) ??
    (invitationId ? await getInspectionByInvitationId(invitationId) : null);

  await saveRavinWebhookEvent({
    reportId: inspection?.reportId ?? null,
    inspectionId: inspection?.id ?? null,
    invitationId,
    payload,
  });

  if (!inspection) {
    for (const id of extractAutoVerifiReportIds(payload)) {
      void syncRavinReportIfPending(id).catch((err) => {
        console.error(`[webhooks/ravin] sync after unmatched (${id}):`, err);
      });
    }
    return NextResponse.json({ ok: true, matched: false });
  }

  const { findings } = await applyRavinWebhookPayload(inspection, payload);

  return NextResponse.json({
    ok: true,
    matched: true,
    reportId: inspection.reportId,
    findings,
  });
}
