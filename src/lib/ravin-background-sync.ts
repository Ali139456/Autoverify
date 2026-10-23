import { sendRavinStuckOpsAlert } from "./email";
import { getInspectionByReportId, updateInspection } from "./inspections";
import {
  readRavinStuckNotifiedAt,
  withRavinStuckNotified,
} from "./ravin-payload-store";
import { syncStoredRavinWebhooksForReport } from "./ravin-sync-report";
import { getReport } from "./store";
import {
  countRavinWebhookEventsForReport,
  listReportIdsByWorkflowStatus,
} from "./store-supabase";
import { isSupabaseServerConfigured } from "./supabase/server";

const DEFAULT_STUCK_HOURS = 2;

function ravinStuckThresholdMs(): number {
  const hours = Number(process.env.RAVIN_STUCK_ALERT_HOURS ?? DEFAULT_STUCK_HOURS);
  if (!Number.isFinite(hours) || hours <= 0) {
    return DEFAULT_STUCK_HOURS * 60 * 60 * 1000;
  }
  return hours * 60 * 60 * 1000;
}

export type RavinBackgroundSyncSummary = {
  ok: boolean;
  scanned: number;
  applied: string[];
  stuckAlerts: string[];
  skippedReason?: string;
};

/** Replay stored webhooks for one report (no-op when damage already present). */
export async function syncRavinReportIfPending(reportId: string): Promise<{
  applied: boolean;
  findings: number;
  reason?: string;
}> {
  return syncStoredRavinWebhooksForReport(reportId);
}

async function maybeAlertRavinStuck(reportId: string): Promise<boolean> {
  const report = await getReport(reportId);
  if (!report || report.damage) return false;

  const inspection = await getInspectionByReportId(reportId);
  if (!inspection?.completedAt) return false;

  if (readRavinStuckNotifiedAt(inspection.ravinPayload)) return false;

  const completedMs = new Date(inspection.completedAt).getTime();
  if (Number.isNaN(completedMs)) return false;
  if (Date.now() - completedMs < ravinStuckThresholdMs()) return false;

  const webhookCount = await countRavinWebhookEventsForReport(reportId);
  await sendRavinStuckOpsAlert({
    report,
    inspection,
    webhookCount,
  });

  await updateInspection(inspection.id, {
    ravinPayload: withRavinStuckNotified(inspection.ravinPayload),
  });

  return true;
}

/**
 * Server-side sweep: apply any stored Ravin webhooks and alert ops when
 * analysis stays missing after S3 ingest (Ravin must still deliver the webhook).
 */
export async function runRavinBackgroundSync(): Promise<RavinBackgroundSyncSummary> {
  if (!isSupabaseServerConfigured()) {
    return {
      ok: false,
      scanned: 0,
      applied: [],
      stuckAlerts: [],
      skippedReason: "supabase_not_configured",
    };
  }

  const reportIds = await listReportIdsByWorkflowStatus("processing_ravin", 50);
  const applied: string[] = [];
  const stuckAlerts: string[] = [];

  for (const reportId of reportIds) {
    try {
      const sync = await syncStoredRavinWebhooksForReport(reportId);
      if (sync.applied) {
        applied.push(reportId);
        continue;
      }

      const fresh = await getReport(reportId);
      if (fresh?.damage) continue;

      if (await maybeAlertRavinStuck(reportId)) {
        stuckAlerts.push(reportId);
      }
    } catch (err) {
      console.error(`[ravin-background-sync] ${reportId}:`, err);
    }
  }

  return {
    ok: true,
    scanned: reportIds.length,
    applied,
    stuckAlerts,
  };
}
