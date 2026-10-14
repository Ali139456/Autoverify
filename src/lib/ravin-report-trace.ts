import { getInspectionByReportId } from "./inspections";
import { getReport } from "./store";
import { createServerClient, isSupabaseServerConfigured } from "./supabase/server";

export type RavinReportTrace = {
  reportId: string;
  reportFound: boolean;
  reportUrl: string | null;
  workflowStatus: string | null;
  tier: string | null;
  inspection: {
    id: string;
    status: string;
    ravinInspectionId: string | null;
    ravinInviteUrl: string | null;
    completedAt: string | null;
    photoCount: number;
  } | null;
  webhookEvents: Array<{
    id: string;
    createdAt: string;
    invitationId: string | null;
    matchedReportId: string | null;
    matchedInspectionId: string | null;
  }>;
};

function normalizeReportId(input: string): string {
  return input.trim().toUpperCase();
}

export function isAutoVerifiReportId(value: string): boolean {
  return /^AV-[A-Z0-9-]{4,}$/i.test(value.trim());
}

/** Lookup Auto Verifi report + inspection + recent Ravin webhook rows (production support). */
export async function traceRavinReport(
  reportIdInput: string,
  baseUrl: string,
): Promise<RavinReportTrace | null> {
  const reportId = normalizeReportId(reportIdInput);
  if (!isAutoVerifiReportId(reportId)) return null;

  const base = baseUrl.replace(/\/$/, "");
  const report = await getReport(reportId);
  const inspection = await getInspectionByReportId(reportId);

  let workflowStatus: string | null = null;
  const webhookEvents: RavinReportTrace["webhookEvents"] = [];
  if (isSupabaseServerConfigured()) {
    const supabase = createServerClient();
    const { data: reportRow } = await supabase
      .from("reports")
      .select("status")
      .eq("id", reportId)
      .maybeSingle();
    workflowStatus =
      typeof reportRow?.status === "string" ? reportRow.status : null;
    const { data: byReport } = await supabase
      .from("ravin_webhook_events")
      .select("id, created_at, invitation_id, report_id, inspection_id")
      .eq("report_id", reportId)
      .order("created_at", { ascending: false })
      .limit(15);

    const { data: byInvite } = await supabase
      .from("ravin_webhook_events")
      .select("id, created_at, invitation_id, report_id, inspection_id")
      .eq("invitation_id", reportId)
      .order("created_at", { ascending: false })
      .limit(15);

    const merged = new Map<string, (typeof webhookEvents)[number]>();
    for (const row of [...(byReport ?? []), ...(byInvite ?? [])]) {
      merged.set(row.id, {
        id: row.id,
        createdAt: row.created_at,
        invitationId: row.invitation_id,
        matchedReportId: row.report_id,
        matchedInspectionId: row.inspection_id,
      });
    }
    webhookEvents.push(
      ...[...merged.values()].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    );
  }

  return {
    reportId,
    reportFound: Boolean(report),
    reportUrl: report ? `${base}/report/${reportId}` : null,
    workflowStatus,
    tier: report?.tier ?? null,
    inspection: inspection
      ? {
          id: inspection.id,
          status: inspection.status,
          ravinInspectionId: inspection.ravinInspectionId,
          ravinInviteUrl: inspection.ravinInviteUrl,
          completedAt: inspection.completedAt,
          photoCount: inspection.photos.length,
        }
      : null,
    webhookEvents,
  };
}
