import {
  getInspectionPhotoNotifyEmails,
  sendInspectionPhotosUpdatedEmail,
} from "./email";
import { updateInspection } from "./inspections";
import type { InspectionSession } from "./types";
import {
  extractRavinPhotos,
  parseRavinWebhookPayload,
} from "./ravin-webhook";
import { getReport, updateReport } from "./store";
import { updateReportWorkflowStatus } from "./store-supabase";

/** Merge Ravin webhook JSON onto an inspection + Insights+ report (same as POST /api/webhooks/ravin). */
export async function applyRavinWebhookPayload(
  inspection: InspectionSession,
  payload: unknown,
  options?: { notifyCustomer?: boolean },
): Promise<{ findings: number }> {
  const report = await getReport(inspection.reportId);
  const hadDamage = Boolean(report?.damage?.findings?.length);

  const ravinPhotos = extractRavinPhotos(payload);
  const mergedPhotos =
    ravinPhotos.length > 0
      ? ravinPhotos.map((photo) => ({
          angle: photo.angle,
          label: photo.label,
          storagePath: photo.url,
          externalUrl: photo.url,
          uploadedAt: new Date().toISOString(),
        }))
      : inspection.photos;

  const damage = parseRavinWebhookPayload(payload, mergedPhotos.length);

  await updateInspection(inspection.id, {
    status: "complete",
    photos: mergedPhotos,
    ravinPayload: payload,
    completedAt: new Date().toISOString(),
  });

  await updateReport(inspection.reportId, {
    damage,
    workflowStatus: "complete",
    ravin_payload: payload,
    damageAnalysisCompletedAt: new Date().toISOString(),
  });

  await updateReportWorkflowStatus(inspection.reportId, "complete");

  const updatedReport = (await getReport(inspection.reportId)) ?? report;

  if (options?.notifyCustomer !== false && updatedReport && !hadDamage) {
    const notifyEmails = getInspectionPhotoNotifyEmails(updatedReport);
    for (const notifyEmail of notifyEmails) {
      void sendInspectionPhotosUpdatedEmail(updatedReport, notifyEmail, {
        damageAnalysisReady: true,
      }).catch((err) => {
        console.error(
          `[ravin-apply] damage-ready email failed (${notifyEmail}):`,
          err,
        );
      });
    }
  }

  return { findings: damage.findings.length };
}
