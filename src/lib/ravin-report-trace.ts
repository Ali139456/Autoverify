import { getInspectionByReportId, updateInspection } from "./inspections";
import {
  coerceRavinInspectorLiteUrl,
  isRavinInspectorLiteUrl,
  parseInspectorLiteCodeFromUrl,
} from "./ravin-partner";
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
    ravinSessionCode: string | null;
    ravinInviteUrl: string | null;
    completedAt: string | null;
    photoCount: number;
    expectedS3KeyPrefix: string | null;
  } | null;
  integrationNotes: string[];
  webhookEvents: Array<{
    id: string;
    createdAt: string;
    invitationId: string | null;
    matchedReportId: string | null;
    matchedInspectionId: string | null;
  }>;
  nextSteps: string[];
};

/** Strip Gmail/client junk appended into the path (e.g. `AV-…&source=gmail`). */
export function parseReportIdFromRouteParam(raw: string): string {
  let id = raw.trim();
  try {
    id = decodeURIComponent(id);
  } catch {
    // keep raw segment
  }
  const cut = id.search(/[&?#]/);
  if (cut >= 0) id = id.slice(0, cut);
  return id.trim().toUpperCase();
}

function normalizeReportId(input: string): string {
  return parseReportIdFromRouteParam(input);
}

export function isAutoVerifiReportId(value: string): boolean {
  return /^AV-[A-Z0-9-]{4,}$/i.test(parseReportIdFromRouteParam(value));
}

export function buildReportPublicUrls(baseUrl: string, reportId: string) {
  const id = parseReportIdFromRouteParam(reportId);
  const base = baseUrl.replace(/\/$/, "");
  return {
    reportUrl: `${base}/report/${encodeURIComponent(id)}`,
    pdfUrl: `${base}/api/report/${encodeURIComponent(id)}/pdf`,
  };
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
  let inspection = await getInspectionByReportId(reportId);

  if (
    inspection?.ravinInviteUrl?.trim() &&
    !isRavinInspectorLiteUrl(inspection.ravinInviteUrl)
  ) {
    const liteUrl = coerceRavinInspectorLiteUrl(inspection.ravinInviteUrl);
    if (liteUrl !== inspection.ravinInviteUrl) {
      await updateInspection(inspection.id, { ravinInviteUrl: liteUrl });
      inspection = { ...inspection, ravinInviteUrl: liteUrl };
    }
  }

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

  const nextSteps: string[] = [];
  if (!report) {
    nextSteps.push("No Auto Verifi report row for this id.");
  } else if (workflowStatus === "awaiting_inspection") {
    nextSteps.push(
      "Owner must complete photos on Auto Verifi /inspect/… (SMS/QR link). Ravin inspector-lite URL is registered via partnerInvite but is not opened in our flow.",
    );
  }
  if (
    inspection &&
    inspection.status === "pending" &&
    inspection.photos.length === 0
  ) {
    nextSteps.push("Inspection not completed yet (0 photos on Auto Verifi).");
  }
  if (
    workflowStatus === "processing_ravin" &&
    inspection &&
    inspection.photos.length > 0
  ) {
    nextSteps.push(
      "Photos submitted — waiting on Ravin AI damage analysis. Confirm S3 ingest used ravinInspectionId " +
        `${inspection.ravinInspectionId ?? "(missing)"} and that Ravin Eye shows this invitation/claim.`,
    );
  }
  if (webhookEvents.length === 0) {
    nextSteps.push(
      "No Ravin webhook received — ask Ravin to POST JSON to https://autoverifi.com.au/api/webhooks/ravin with claimId AV-… in the payload (or re-send test for this report).",
    );
  } else if (workflowStatus !== "complete") {
    nextSteps.push("Webhooks arrived but report is not complete — check webhook matching logs.");
  }
  if (report && !report.damage && workflowStatus === "processing_ravin") {
    nextSteps.push(
      "Damage section empty — typical if Ravin has not finished or webhook did not match this inspection (check invitation id vs S3 path).",
    );
  }
  if (workflowStatus === "complete") {
    nextSteps.push(`Open customer report: ${base}/report/${reportId}`);
  }

  const inviteUrl = inspection?.ravinInviteUrl ?? null;
  const ravinSessionCode = inviteUrl
    ? parseInspectorLiteCodeFromUrl(inviteUrl)
    : null;
  const claimForS3 = inspection?.ravinInspectionId?.trim() || reportId;
  const expectedS3KeyPrefix = inspection
    ? `{clientId}_{siteId}_${claimForS3}_{timestamp}.zip (metadata.json + numbered JPEGs)`
    : null;

  const integrationNotes = [
    "Owner capture: Auto Verifi /inspect/{token} — not Ravin-hosted inspector-lite (lite link click is optional / unused).",
    `partnerInvite claimId and S3 x-amz-meta-inspection-id use Auto Verifi report id (e.g. ${reportId}).`,
    ravinSessionCode
      ? `Ravin session code from partnerInvite (for Ravin Eye lookup): ${ravinSessionCode}`
      : "No Ravin session code stored on inspection.",
    "Damage analysis completes when Ravin ingests S3 objects and POSTs to /api/webhooks/ravin.",
  ];

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
          ravinSessionCode,
          ravinInviteUrl: inviteUrl,
          completedAt: inspection.completedAt,
          photoCount: inspection.photos.length,
          expectedS3KeyPrefix,
        }
      : null,
    webhookEvents,
    integrationNotes,
    nextSteps,
  };
}
