import { createServerClient } from "./supabase/server";
import { isSupabaseServerConfigured } from "./supabase/server";
import {
  collectInvitationIds,
  extractAutoVerifiReportIds,
} from "./ravin-webhook";
import {
  getInspectionByReportId,
  resolveInspectionFromRavinWebhook,
} from "./inspections";
import { applyRavinWebhookPayload } from "./ravin-apply-webhook";
import { getReport } from "./store";

type WebhookRow = {
  id: string;
  payload: unknown;
  created_at: string;
};

function payloadReferencesReport(
  payload: unknown,
  reportId: string,
  ravinInspectionId: string | null,
): boolean {
  const ids = [
    ...collectInvitationIds(payload),
    ...extractAutoVerifiReportIds(payload),
  ].map((id) => id.toUpperCase());
  const want = reportId.toUpperCase();
  if (ids.some((id) => id === want || id.includes(want))) return true;
  if (ravinInspectionId) {
    const rav = ravinInspectionId.trim().toUpperCase();
    if (ids.some((id) => id === rav || id.includes(rav))) return true;
  }
  return false;
}

async function loadWebhookCandidates(
  reportId: string,
  ravinInspectionId: string | null,
): Promise<WebhookRow[]> {
  if (!isSupabaseServerConfigured()) return [];

  const supabase = createServerClient();
  const byReport = await supabase
    .from("ravin_webhook_events")
    .select("id, payload, created_at")
    .eq("report_id", reportId)
    .order("created_at", { ascending: false })
    .limit(10);

  const inviteKeys = [reportId, ravinInspectionId].filter(Boolean) as string[];
  const byInviteRows: WebhookRow[] = [];
  for (const key of inviteKeys) {
    const { data } = await supabase
      .from("ravin_webhook_events")
      .select("id, payload, created_at")
      .eq("invitation_id", key)
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) byInviteRows.push(...(data as WebhookRow[]));
  }

  const merged = new Map<string, WebhookRow>();
  for (const row of [...(byReport.data ?? []), ...byInviteRows] as WebhookRow[]) {
    merged.set(row.id, row);
  }

  if (merged.size === 0) {
    const { data: recent } = await supabase
      .from("ravin_webhook_events")
      .select("id, payload, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    for (const row of (recent ?? []) as WebhookRow[]) {
      if (payloadReferencesReport(row.payload, reportId, ravinInspectionId)) {
        merged.set(row.id, row);
      }
    }
  }

  return [...merged.values()].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

/** Apply a stored Ravin webhook when the live POST matched:false or the customer opened the report before we merged. */
export async function syncStoredRavinWebhooksForReport(
  reportId: string,
): Promise<{
  applied: boolean;
  findings: number;
  reason?: string;
}> {
  const report = await getReport(reportId);
  if (!report) {
    return { applied: false, findings: 0, reason: "report_not_found" };
  }
  if (report.damage) {
    return {
      applied: false,
      findings: report.damage.findings.length,
      reason: "already_complete",
    };
  }

  const inspection = await getInspectionByReportId(reportId);
  if (!inspection) {
    return { applied: false, findings: 0, reason: "no_inspection" };
  }

  const events = await loadWebhookCandidates(
    reportId,
    inspection.ravinInspectionId,
  );
  if (events.length === 0) {
    return { applied: false, findings: 0, reason: "no_webhook_events" };
  }

  for (const event of events) {
    if (
      !payloadReferencesReport(
        event.payload,
        reportId,
        inspection.ravinInspectionId,
      )
    ) {
      continue;
    }

    const candidateIds = [
      ...new Set([
        ...collectInvitationIds(event.payload),
        ...extractAutoVerifiReportIds(event.payload),
        reportId,
        inspection.ravinInspectionId ?? "",
      ]),
    ].filter(Boolean);

    const resolved =
      (await resolveInspectionFromRavinWebhook(event.payload, () => candidateIds)) ??
      inspection;

    if (resolved.reportId !== reportId) continue;

    const { findings } = await applyRavinWebhookPayload(
      resolved,
      event.payload,
      { notifyCustomer: true },
    );
    return { applied: true, findings };
  }

  return { applied: false, findings: 0, reason: "no_matching_payload" };
}
