import {
  createInspection,
  downloadInspectionPhotos,
  getInspectionByReportId,
  isInspectionExpired,
  updateInspection,
  uploadInspectionPhoto,
} from "@/lib/inspections";
import type { InspectionSession } from "@/lib/types";
import { INSPECTION_CAPTURE_DONE_PENDING_MESSAGE } from "@/lib/damage-processing-copy";
import { isSupabaseServerConfigured } from "@/lib/supabase/server";
import { analyzeDamage, isRavinLiveAccount } from "@/lib/ravin";
import { submitInspectionToRavin } from "@/lib/ravin-ingest";
import { syncRavinReportIfPending } from "@/lib/ravin-background-sync";
import {
  withRavinIngestError,
  withRavinIngestTrace,
} from "@/lib/ravin-payload-store";
import { notifyDamageAssessmentCompleteEmail } from "@/lib/damage-follow-up-email";
import { getReport, updateReport } from "@/lib/store";
import type { DamageAnalysis, VehicleReport } from "@/lib/types";

export type ManualDamageFinalizeResult = {
  ok: true;
  mode: "demo" | "pending" | "s3" | "processing";
  message: string;
  damage?: DamageAnalysis;
};

export async function ensureInspectionForManualUpload(
  report: VehicleReport,
): Promise<InspectionSession> {
  if (!isSupabaseServerConfigured()) {
    throw new Error("Photo upload requires server storage to be configured.");
  }

  let inspection = await getInspectionByReportId(report.id);
  if (!inspection || isInspectionExpired(inspection)) {
    inspection = await createInspection({
      reportId: report.id,
      phone: report.ownerPhone ?? report.customerPhone ?? undefined,
    });
  }
  return inspection;
}

export async function saveManualDamagePhoto(input: {
  inspection: InspectionSession;
  angle: string;
  buffer: Buffer;
  contentType: string;
}) {
  return uploadInspectionPhoto({
    inspection: input.inspection,
    angle: input.angle,
    buffer: input.buffer,
    contentType: input.contentType,
  });
}

export async function finalizeManualDamageUpload(
  reportId: string,
): Promise<ManualDamageFinalizeResult> {
  const report = await getReport(reportId);
  if (!report) {
    throw new Error("Report not found.");
  }

  const inspection = await getInspectionByReportId(reportId);
  if (!inspection || inspection.photos.length === 0) {
    throw new Error("No photos were saved. Select at least one image and try again.");
  }

  const processingStartedAt =
    report.damageProcessingStartedAt ?? new Date().toISOString();
  await updateReport(reportId, {
    workflowStatus: "processing_ravin",
    damageProcessingStartedAt: processingStartedAt,
  });

  const photoFiles = await downloadInspectionPhotos(inspection);

  await updateInspection(inspection.id, {
    status: "uploaded",
    completedAt: new Date().toISOString(),
  });

  if (isRavinLiveAccount() || isSupabaseServerConfigured()) {
    let submission;
    try {
      submission = await submitInspectionToRavin({
        reportId,
        inspectionId: inspection.id,
        ravinInspectionId: inspection.ravinInspectionId,
        vin: report.vehicle.vin,
        photos: photoFiles,
      });
    } catch (ravinErr) {
      const ingestErrorMessage =
        ravinErr instanceof Error ? ravinErr.message : "Ravin ingest failed.";
      await updateInspection(inspection.id, {
        status: "uploaded",
        ravinPayload: withRavinIngestError(
          inspection.ravinPayload,
          ingestErrorMessage,
        ),
      });
      return {
        ok: true,
        mode: "pending",
        message: `${INGESTION_FAILED_PREFIX} ${ingestErrorMessage}`,
      };
    }

    if (submission.mode === "demo" && submission.damage) {
      await updateInspection(inspection.id, {
        status: "complete",
        ravinInspectionId: submission.ravinInspectionId,
        completedAt: new Date().toISOString(),
        ravinPayload: withRavinIngestTrace(
          inspection.ravinPayload,
          submission.ingestTrace,
        ),
      });
      await updateReport(reportId, {
        damage: submission.damage,
        workflowStatus: "complete",
        damageAnalysisCompletedAt: new Date().toISOString(),
      });
      void notifyDamageAssessmentCompleteEmail(reportId).catch((err) => {
        console.error(
          `[manual-damage-upload] damage-complete email failed (${reportId}):`,
          err,
        );
      });
      return {
        ok: true,
        mode: "demo",
        message: "Demo AI analysis complete.",
        damage: submission.damage,
      };
    }

    await updateInspection(inspection.id, {
      status: submission.mode === "pending" ? "uploaded" : "processing",
      ravinInspectionId: submission.ravinInspectionId,
      ravinPayload: withRavinIngestTrace(
        inspection.ravinPayload,
        submission.ingestTrace,
      ),
    });

    void syncRavinReportIfPending(reportId).catch((err) => {
      console.error("[manual-damage-upload] Ravin sync after ingest:", err);
    });

    return {
      ok: true,
      mode: submission.mode === "demo" ? "processing" : submission.mode,
      message: INSPECTION_CAPTURE_DONE_PENDING_MESSAGE,
    };
  }

  const damage = await analyzeDamage(
    photoFiles.map((photo) => ({
      name: photo.name,
      data: photo.data,
      contentType: photo.contentType,
    })),
  );
  await updateReport(reportId, {
    damage,
    workflowStatus: "complete",
    damageAnalysisCompletedAt: new Date().toISOString(),
  });
  await updateInspection(inspection.id, { status: "complete" });

  return {
    ok: true,
    mode: "demo",
    message: "Analysis complete.",
    damage,
  };
}

const INGESTION_FAILED_PREFIX =
  "Photos were saved but Ravin upload needs attention.";